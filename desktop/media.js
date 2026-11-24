// Lagu yang lagi diputar, per sistem:
// - Windows: media controls sistem (SMTC) lewat PowerShell + WinRT
// - Linux: MPRIS lewat `playerctl`
// - Cadangan di semua sistem: antrean Senandung (http://127.0.0.1:5560/api/remote/state)
const { spawn, execFile } = require('child_process');
const http = require('http');

let emit = () => {};
let osState = null;
let senandung = null;
let senQueue = null;

const PS_HEAD = `
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result }
[Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime] | Out-Null
$mgr = Await ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
# Sesi yang ditampilin & dikontrol: yang lagi Playing dulu (Spotify, browser, apa aja), baru sesi "current" dari Windows.
# $prefer = app yang lagi tampil di Nusa. Pas ganti lagu, statusnya sebentar "Changing"/"Opened"/"Paused";
# tanpa ini Nusa sempat loncat ke app lain dan klik Next berikutnya nyasar ke sana.
function Pick([string]$prefer = '') {
  $all = @($mgr.GetSessions())
  $pref = $null
  if ($prefer) { $pref = $all | Where-Object { $_.SourceAppUserModelId -eq $prefer } | Select-Object -First 1 }
  if ($pref -and @('Playing', 'Changing', 'Opened') -contains [string]$pref.GetPlaybackInfo().PlaybackStatus) { return $pref }
  $on = $all | Where-Object { $_.GetPlaybackInfo().PlaybackStatus -eq 'Playing' } | Select-Object -First 1
  if ($on) { return $on }
  if ($pref) { return $pref }
  $cur = $mgr.GetCurrentSession()
  if ($cur) { return $cur }
  return $all | Select-Object -First 1
}
`;

// Satu PowerShell yang standby nerima perintah lewat stdin: "<perintah><TAB><app>". Dulu tiap klik bikin
// PowerShell baru (~1 detik startup + muat WinRT), jadi klik Next berkali-kali kerasa lemot / ada yang telat.
const PS_CMD = PS_HEAD + `
while ($true) {
  $line = [Console]::In.ReadLine()
  if ($line -eq $null) { break }
  $parts = $line.Split([char]9)
  $cmd = $parts[0]; $src = if ($parts.Length -gt 1) { $parts[1] } else { '' }
  try {
    $s = Pick $src
    if ($s) {
      if ($cmd -like 'seek *') { Await ($s.TryChangePlaybackPositionAsync([long]$cmd.Substring(5))) ([bool]) | Out-Null }
      elseif ($cmd -eq 'toggle') { Await ($s.TryTogglePlayPauseAsync()) ([bool]) | Out-Null }
      elseif ($cmd -eq 'next') { Await ($s.TrySkipNextAsync()) ([bool]) | Out-Null }
      elseif ($cmd -eq 'prev') { Await ($s.TrySkipPreviousAsync()) ([bool]) | Out-Null }
      elseif ($cmd -eq 'pause') { Await ($s.TryPauseAsync()) ([bool]) | Out-Null }
    }
  } catch { }
  [Console]::Out.WriteLine('done'); [Console]::Out.Flush()
}`;

const PS_LOOP = PS_HEAD + `
[Windows.Storage.Streams.IRandomAccessStreamWithContentType, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
$asRead = [System.IO.WindowsRuntimeStreamExtensions].GetMethod('AsStreamForRead', [Type[]]@([Windows.Storage.Streams.IInputStream]))
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$lastKey = ''
$lastSrc = $null; $srcPath = ''; $srcPid = 0
while ($true) {
  $s = Pick $lastSrc
  $o = $null
  if ($s) {
    $p = Await ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
    $tl = $s.GetTimelineProperties()
    $info = $s.GetPlaybackInfo()
    $src = $s.SourceAppUserModelId
    # Proses app sumber (buat ikon app di sampul & klik buat buka app-nya); dicari sekali per ganti app
    if ($src -ne $lastSrc) {
      $lastSrc = $src; $srcPath = ''; $srcPid = 0
      foreach ($n in @(($src -replace '\\.exe$', ''), ($src -split '!')[-1])) {
        $pr = @(Get-Process -Name $n -ErrorAction SilentlyContinue | Where-Object { $_.Path })
        $w = $pr | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
        if (-not $w) { $w = $pr | Select-Object -First 1 }
        if ($w) { $srcPath = $w.Path; $srcPid = $w.Id; break }
      }
    }
    $o = @{ title = $p.Title; artist = $p.Artist; album = $p.AlbumTitle; source = $src; path = $srcPath; pid = $srcPid;
            canSeek = $info.Controls.IsPlaybackPositionEnabled;
            playing = ($info.PlaybackStatus -eq 'Playing'); position = $tl.Position.TotalSeconds; duration = ($tl.EndTime - $tl.StartTime).TotalSeconds;
            updated = $tl.LastUpdatedTime.ToUnixTimeMilliseconds() }
    $key = "$($s.SourceAppUserModelId)|$($p.Title)|$($p.Artist)"
    if ($key -ne $lastKey) {
      $lastKey = $key
      $o.art = ''
      if ($p.Thumbnail) {
        try {
          $st = Await ($p.Thumbnail.OpenReadAsync()) ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
          # Lewat reflection: PowerShell 5.1 nggak bisa nge-cast stream WinRT (__ComObject) kalau dipanggil biasa
          $ns = $asRead.Invoke($null, @($st))
          $ms = New-Object System.IO.MemoryStream
          $ns.CopyTo($ms); $ns.Dispose()
          $bytes = $ms.ToArray()
          if ($bytes.Length -gt 0) {
            $type = if ($bytes[0] -eq 0xFF) { 'image/jpeg' } elseif ($bytes[0] -eq 0x89) { 'image/png' } elseif ($bytes[0] -eq 0x47) { 'image/gif' } elseif ($bytes[0] -eq 0x52) { 'image/webp' } else { 'image/bmp' }
            $o.art = "data:$type;base64," + [Convert]::ToBase64String($bytes)
          }
        } catch { }
      }
    }
  }
  if ($o) { [Console]::Out.WriteLine(($o | ConvertTo-Json -Compress)) } else { [Console]::Out.WriteLine('{}') }
  [Console]::Out.Flush()
  Start-Sleep -Milliseconds 1000
}`;

/** "Spotify.exe" / "SpotifyAB.SpotifyMusic_xxx!Spotify" / "MSEdge" → nama yang enak dibaca. */
function appName(id = '') {
  const known = { spotify: 'Spotify', chrome: 'Chrome', msedge: 'Edge', firefox: 'Firefox', brave: 'Brave', opera: 'Opera',
    vivaldi: 'Vivaldi', zunemusic: 'Media Player', zunevideo: 'Movies & TV', vlc: 'VLC', applemusic: 'Apple Music',
    itunes: 'iTunes', deezer: 'Deezer', tidal: 'TIDAL', youtube: 'YouTube Music', foobar: 'foobar2000', aimp: 'AIMP', musicbee: 'MusicBee' };
  const low = String(id).toLowerCase();
  for (const k in known) if (low.includes(k)) return known[k];
  const tail = String(id).split('!').pop().split('\\').pop().replace(/\.exe$/i, '');
  return tail.replace(/^.*\./, '') || 'Media';
}

/** Apple Music di Windows nulis artisnya "Artis — Album" dan albumnya kosong: dipisah lagi. */
function splitArtist(o) {
  const cut = !o.album && o.app === 'Apple Music' ? String(o.artist || '').indexOf(' — ') : -1;
  return cut > 0 ? { ...o, artist: o.artist.slice(0, cut), album: o.artist.slice(cut + 3) } : o;
}

/**
 * Buat app yang nggak lapor posisi: dihitung sendiri sejak lagunya ganti (dipakai lirik).
 * noClock = lagunya udah jalan sebelum Nusa tau, jadi posisinya nggak bisa ditebak.
 */
function ownClock() {
  let c = { key: null };
  return (s) => {
    const now = Date.now(), key = s ? `${s.source}|${s.title}|${s.artist}` : '';
    if (key !== c.key) c = { key, known: c.key !== null, pos: 0, at: now, playing: !!s?.playing };
    else {
      if (c.playing) c.pos += (now - c.at) / 1000;
      c.at = now; c.playing = !!s?.playing;
    }
    return { position: c.pos, noClock: !c.known };
  };
}

const encode = (script) => Buffer.from(script, 'utf16le').toString('base64');

function startWindows() {
  let lastArt = null;
  const tick = ownClock();
  const run = () => {
    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encode(PS_LOOP)], { windowsHide: true });
    let buf = '';
    ps.stdout.setEncoding('utf8');
    ps.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        try {
          let o = JSON.parse(line);
          if (!o.title) { osState = null; tick(null); continue; }
          if ('art' in o) lastArt = o.art || null; // '' = lagu baru tanpa cover
          o.art = lastArt;
          o.app = appName(o.source);
          o = splitArtist(o);
          const own = tick(o);
          // App yang nggak lapor waktu: LastUpdatedTime-nya tahun 1601, jangan dipakai ngitung posisi
          const at = o.updated > 1e12 ? o.updated : Date.now();
          osState = { ...o, position: (o.position || 0) + (o.playing ? (Date.now() - at) / 1000 : 0), at: Date.now() };
          if (!(o.duration > 0) && !(o.position > 0)) Object.assign(osState, own);
        } catch { /* baris rusak, lewati */ }
      }
      publish();
    });
    ps.on('exit', () => setTimeout(run, 3000));
  };
  run();
}

function startLinux() {
  const fmt = '{{status}}\t{{artist}}\t{{title}}\t{{album}}\t{{mpris:artUrl}}\t{{mpris:length}}\t{{position}}\t{{playerName}}';
  setInterval(() => {
    execFile('playerctl', ['metadata', '--format', fmt], { timeout: 1500 }, (err, out) => {
      if (err) { osState = null; return publish(); }
      const [status, artist, title, album, art, length, position, player] = out.trim().split('\t');
      osState = title ? { title, artist, album, art: art || null, playing: status === 'Playing', duration: +length / 1e6 || 0,
        position: +position / 1e6 || 0, at: Date.now(), source: player, app: player, canSeek: true } : null;
      publish();
    });
  }, 1000);
}

/** Senandung: dipakai kalau sistem nggak ngelaporin apa-apa (dan buat tab Music). */
function pollSenandung() {
  const tick = ownClock();
  setInterval(() => {
    http.get('http://127.0.0.1:5560/api/remote/state', { timeout: 1200 }, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => {
        try {
          const s = JSON.parse(b);
          const cur = (s.queue || []).find((q) => q.i === s.idx);
          senQueue = cur ? { queue: s.queue, idx: s.idx } : null;
          senandung = cur ? { title: cur.title, artist: cur.artist, art: cur.art ? 'http://127.0.0.1:5560' + cur.art : null,
            playing: !!s.playing, duration: cur.duration || 0, at: Date.now(), source: 'Senandung', noTimeline: true } : null;
          const own = tick(senandung);
          if (senandung) Object.assign(senandung, own);
        } catch { senandung = null; senQueue = null; }
        publish();
      });
    }).on('error', () => { senandung = null; senQueue = null; publish(); });
  }, 2000);
}

let lastSent = '', lastState = null;
function publish() {
  const state = osState || senandung || null;
  // Posisi yang maju normal nggak perlu dikirim (halaman ngitung sendiri); kirim kalau ada yang berubah atau posisinya loncat (seek)
  const key = JSON.stringify(state && { ...state, at: 0, position: 0, updated: 0 });
  if (key === lastSent && state && lastState) {
    const predicted = (lastState.position || 0) + (lastState.playing ? (Date.now() - lastState.at) / 1000 : 0);
    if (Math.abs(predicted - (state.position || 0)) < 0.5) return; // ketat: lirik jalan ngikutin posisi ini
  } else if (key === lastSent) return;
  lastSent = key;
  lastState = state && { ...state };
  emit(state);
}

function start(cb) {
  emit = cb;
  if (process.platform === 'win32') { startWindows(); startCmdWorker(); }
  else if (process.platform === 'linux') startLinux();
  pollSenandung();
}

/** Kirim perintah ke PowerShell standby; kalau prosesnya mati, dibikin ulang otomatis. */
let cmdPs = null;
function startCmdWorker() {
  if (!cmdPs || cmdPs.killed || cmdPs.exitCode !== null || !cmdPs.stdin.writable) {
    cmdPs = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encode(PS_CMD)], { windowsHide: true });
    cmdPs.stdout.resume();
    cmdPs.stdin.on('error', () => {});
    cmdPs.on('exit', () => { cmdPs = null; });
  }
}
function winCommand(cmd) {
  startCmdWorker(); // dinyalain dari awal biar klik pertama nggak nunggu PowerShell start
  // App yang lagi tampil di Nusa, biar perintahnya nggak nyasar ke app lain
  const src = String(osState?.source || '').replace(/[\t\r\n]/g, '');
  cmdPs.stdin.write(`${cmd}\t${src}\n`);
}

/** Senandung nggak lewat media sistem: next/prev = lompat ke lagu sebelah di antreannya. */
function senandungCommand(cmd) {
  if (!senQueue) return;
  const { queue, idx } = senQueue;
  const at = queue.findIndex((q) => q.i === idx);
  let body = null;
  if (cmd === 'next' && at >= 0 && at + 1 < queue.length) body = { cmd: 'jump', index: queue[at + 1].i };
  else if (cmd === 'prev' && at > 0) body = { cmd: 'jump', index: queue[at - 1].i };
  if (!body) return;
  const data = JSON.stringify(body);
  const req = http.request({ host: '127.0.0.1', port: 5560, path: '/api/remote/cmd', method: 'POST', timeout: 3000,
    headers: { 'Content-Type': 'application/json', 'X-Senandung-Remote': '1', 'Content-Length': Buffer.byteLength(data) } }, (res) => res.resume());
  req.on('error', () => {});
  req.on('timeout', () => req.destroy());
  req.end(data);
}

function command(cmd) {
  // "seek 74.5" = lompat ke detik 74.5
  const seek = /^seek (\d+(?:\.\d+)?)$/.exec(String(cmd));
  if (seek) {
    const sec = +seek[1];
    if (osState) osState = { ...osState, position: sec, at: Date.now() }; // langsung kelihatan, nggak nunggu laporan berikutnya
    if (process.platform === 'win32') winCommand(`seek ${Math.round(sec * 1e7)}`);
    else if (process.platform === 'linux') execFile('playerctl', ['position', String(sec)], () => {});
    return publish();
  }
  if (!['toggle', 'next', 'prev', 'pause'].includes(cmd)) return;
  if (!osState && senandung) return senandungCommand(cmd);
  if (process.platform === 'win32') winCommand(cmd);
  else if (process.platform === 'linux') {
    execFile('playerctl', [{ toggle: 'play-pause', next: 'next', prev: 'previous', pause: 'pause' }[cmd]], () => {});
  }
}

module.exports = { start, command, splitArtist, ownClock };
