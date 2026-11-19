// Nusa untuk Windows & Linux: jendela transparan di tengah atas layar, isinya notch HTML.
const { app, BrowserWindow, screen, ipcMain, clipboard, Tray, Menu, nativeImage, shell, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const media = require('./media');
const audio = require('./audio');
const calendar = require('./calendar');

const W = 840, H = 440;
let win = null, tray = null;
let rect = { x: 0, y: 0, w: 0, h: 0 };
let inside = false;
/** Lagi minggir buat toolbar rekam layar / bar share (Windows). */
let yielded = false;
let coverTimer = null;

/** Kirim ke halaman; kalau gagal (halaman lagi dimuat ulang dll.) diabaikan aja. */
function send(channel, value) {
  try { if (win && !win.isDestroyed()) win.webContents.send(channel, value); } catch {}
}

// Mode tes: data di folder terpisah biar data asli nggak kesentuh
if (process.env.NUSA_USERDATA) app.setPath('userData', process.env.NUSA_USERDATA);
if (!app.requestSingleInstanceLock()) app.quit();
// Linux butuh ini biar latar jendela bisa transparan
if (process.platform === 'linux') app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function place() {
  const d = screen.getPrimaryDisplay().bounds;
  win.setBounds({ x: Math.round(d.x + d.width / 2 - W / 2), y: d.y, width: W, height: H });
}

function create() {
  win = new BrowserWindow({
    width: W, height: H, frame: false, transparent: true, resizable: false, movable: false, minimizable: false,
    maximizable: false, fullscreenable: false, alwaysOnTop: true, skipTaskbar: true, hasShadow: false, show: false,
    backgroundColor: '#00000000', title: 'Nusa',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true);
  place();
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => win.showInactive());
  screen.on('display-metrics-changed', place);
  screen.on('display-added', place);
  screen.on('display-removed', place);

  // Klik di luar notch harus tembus ke app di belakang: cek posisi kursor 25x per detik
  setInterval(() => {
    if (!win || win.isDestroyed()) return;
    const p = screen.getCursorScreenPoint();
    const b = win.getBounds();
    const x = p.x - b.x, y = p.y - b.y;
    const over = !yielded && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    if (over === inside) return;
    inside = over;
    win.setIgnoreMouseEvents(!over);
    send('hover', over);
  }, 40);

  // Info lagu + ikon app sumbernya (Spotify, Chrome, ...) buat ditempel di pojok sampul kayak versi Mac
  let current = null;
  media.start(async (state) => {
    const s = state && JSON.parse(JSON.stringify(state));
    if (s?.path) s.icon = await fileIcon(s.path, 'normal');
    // Sampul dari Windows cuma 120×120 (pecah kalau digedein): cari versi 600×600 lagu yang sama
    if (s?.title && s.source !== 'Senandung') {
      const key = artKey(s);
      if (hiRes.has(key)) s.hiArt = hiRes.get(key);
      else hiResArt(s).then(() => { if (current && artKey(current) === key && hiRes.get(key)) send('media', { ...current, hiArt: hiRes.get(key) }); });
    }
    current = s;
    send('media', s);
  });

  // Volume sistem; pindah ke headphone/Bluetooth → pop-up nama perangkat + baterainya
  let lastDevice = null;
  audio.start((st) => {
    send('audio', st);
    if (!st) return;
    const changed = lastDevice !== null && st.id !== lastDevice;
    lastDevice = st.id;
    if (!changed || !(st.bt || st.ff === 3 || st.ff === 5)) return;
    audio.battery(st.name, (detail) => send('device', { name: st.name, bt: st.bt, detail: detail || 'Connected' }));
  }, (covered) => {
    // Toolbar rekam layar (Snipping Tool, Game Bar) / bar share Zoom-Teams muncul di tengah atas:
    // Nusa minggir dulu biar toolbarnya bisa diklik. Jendelanya NGGAK disembunyiin (hide/show = kedip);
    // notch cuma memudar & tembus klik. Nunggu kondisinya stabil dulu biar tooltip yang lewat sebentar
    // (mis. pas kursor di atas tab browser) nggak bikin Nusa kedip-kedip.
    clearTimeout(coverTimer);
    if (covered === yielded) return;
    coverTimer = setTimeout(() => {
      yielded = covered;
      if (covered) {
        inside = false;
        win.setIgnoreMouseEvents(true);
        send('hover', false);
      }
      send('yield', covered);
    }, covered ? 1200 : 1500);
  });

  // Riwayat clipboard (teks aja), dicek tiap detik
  // Electron 45: clipboard.readText() ngembaliin Promise, jadi wajib ditunggu. Dulu nggak ditunggu ->
  // tiap detik kebaca "[object Promise]" baru -> tab Clips nambah kartu & panel kedip tiap detik.
  const readClip = async () => { try { const t = await clipboard.readText(); return typeof t === 'string' ? t : ''; } catch { return ''; } };
  let lastClip = null;
  readClip().then((t) => { lastClip = t; });
  setInterval(async () => {
    if (lastClip === null) return;
    const t = await readClip();
    if (t && t !== lastClip) { lastClip = t; send('clip', String(t)); }
  }, 1000);
}

ipcMain.on('rect', (_e, r) => { rect = r; });

// Server Senandung (tab Music): lewat proses utama biar nggak keblok CORS di halaman file://
ipcMain.handle('senandung', (_e, method, route, body) => new Promise((resolve) => {
  if (!/^\/api\/(remote\/(state|cmd)|yt\/search)/.test(route)) return resolve(null);
  const data = body ? JSON.stringify(body) : null;
  const req = require('http').request({ host: '127.0.0.1', port: 5560, path: route, method, timeout: 8000,
    headers: data ? { 'Content-Type': 'application/json', 'X-Senandung-Remote': '1', 'Content-Length': Buffer.byteLength(data) } : {} }, (res) => {
    let b = '';
    res.on('data', (d) => (b += d));
    res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } });
  });
  req.on('error', () => resolve(null));
  req.on('timeout', () => { req.destroy(); resolve(null); });
  if (data) req.write(data);
  req.end();
}));

// Aset bawaan (data Quran) dibaca lewat sini; fetch file:// nggak jalan di halaman
ipcMain.handle('asset', (_e, name) => {
  if (!/^[a-z0-9.-]+\.json$/i.test(name)) return null;
  return fs.readFileSync(path.join(__dirname, 'app', 'assets', name), 'utf8');
});
ipcMain.on('media-cmd', (_e, cmd) => media.command(cmd));
ipcMain.on('volume', (_e, level) => audio.setVolume(level));
ipcMain.on('mute', (_e, on) => audio.setMute(!!on));
ipcMain.handle('calendar', (_e, start, days) => calendar.fetch(+start, Math.min(31, Math.max(1, +days || 7))));
// Izin kalender diblokir: buka halaman Privasi › Kalender di Settings
ipcMain.on('calendar-settings', () => shell.openExternal(process.platform === 'win32' ? 'ms-settings:privacy-calendar' : 'about:blank'));

/* Sampul resolusi tinggi lewat iTunes Search (gratis, tanpa login). Yang dikirim cuma judul + artis. */
const hiRes = new Map();
const pending = new Map();
const norm = (s) => String(s || '').toLowerCase()
  .replace(/\s*-\s*topic$|vevo$|official/g, '')
  .replace(/\(.*?\)|\[.*?\]|feat\.?.*$|ft\.?.*$/g, '')
  .normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const artKey = (s) => norm(s.artist) + '|' + norm(s.title);

function hiResArt(s) {
  const key = artKey(s);
  if (pending.has(key)) return pending.get(key);
  const title = norm(s.title), artist = norm(s.artist);
  const job = (async () => {
    try {
      const term = encodeURIComponent(`${artist} ${title}`.trim());
      const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=25`, { signal: AbortSignal.timeout(6000) });
      const { results = [] } = await res.json();
      const same = (a, b) => a && b && (a === b || a.includes(b) || b.includes(a));
      const hit = results.find((r) => same(norm(r.trackName), title) && (!artist || same(norm(r.artistName), artist)))
        || (artist ? null : results.find((r) => same(norm(r.trackName), title)));
      hiRes.set(key, hit?.artworkUrl100 ? hit.artworkUrl100.replace(/\/\d+x\d+bb\./, '/600x600bb.') : null);
    } catch { hiRes.set(key, null); }
    pending.delete(key);
  })();
  pending.set(key, job);
  return job;
}

const icons = new Map();
async function fileIcon(p, size = 'large') {
  const key = size + '|' + p;
  if (!icons.has(key)) {
    try { icons.set(key, (await app.getFileIcon(p, { size })).toDataURL()); } catch { icons.set(key, null); }
  }
  return icons.get(key);
}

// Klik sampul: buka/munculin app yang lagi muter lagu
ipcMain.on('open-source', (_e, src) => {
  if (!src) return;
  if (process.platform === 'win32' && src.pid) {
    const ps = `$w = New-Object -ComObject WScript.Shell; if (-not $w.AppActivate(${+src.pid})) { exit 1 }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true }, (err) => { if (err && src.path) shell.openPath(src.path); });
  } else if (process.platform === 'win32' && String(src.source).includes('!')) {
    execFile('explorer.exe', ['shell:AppsFolder\\' + src.source]);
  } else if (src.path) shell.openPath(src.path);
});

// Rak (Tray): file yang ditaruh buat nanti
const isFile = (p) => typeof p === 'string' && path.isAbsolute(p) && fs.existsSync(p);
ipcMain.handle('file-info', async (_e, p) => isFile(p) ? { path: p, name: path.basename(p), icon: await fileIcon(p) } : null);
ipcMain.on('file-open', (_e, p) => { if (isFile(p)) shell.openPath(p); });
ipcMain.on('file-show', (_e, p) => { if (isFile(p)) shell.showItemInFolder(p); });
ipcMain.on('file-drag', async (e, p) => {
  if (!isFile(p)) return;
  const icon = nativeImage.createFromDataURL((await fileIcon(p)) || '');
  e.sender.startDrag({ file: p, icon: icon.isEmpty() ? nativeImage.createFromPath(path.join(__dirname, 'build', 'tray.png')) : icon });
});

/* ---------- Tema: file JSON/CSS di folder userData/themes ---------- */
// Bebas dikustom: tiap key di `colors`/`vars` (atau key di root) jadi CSS variable `--<key>`.
// Contoh: { "name": "X", "colors": { "mint": "#0ff", "bg": "#111", "my-var": "2px" } }
// Bisa juga nempelin CSS mentah lewat field "css", atau impor file `.css` langsung.
const RESERVED = new Set(['name', 'font', 'css', 'vars', 'colors', 'id', 'background']);
const VAR_RE = /^-{0,2}[a-z][a-z0-9-]*$/i;
// Format gambar yang bisa jadi "tema wallpaper"
const IMG_RE = /\.(png|jpe?g)$/i;
const slug = (s) => String(s || 'theme').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'theme';
// Nilai CSS yang boleh masuk: teks pendek, tanpa hal berbahaya (; {} <> url()).
const safeValue = (v) => (typeof v === 'string' && v.trim().length > 0 && v.length <= 200 && !/[;{}<>]|url\s*\(/i.test(v) ? v.trim() : null);
const safeCss = (s) => (typeof s === 'string' && s.length > 0 && s.length <= 40000 && !/<\/style/i.test(s) ? s : null);

function normalizeTheme(raw, fallbackName) {
  if (!raw || typeof raw !== 'object') return { error: 'invalid' };
  const name = String(raw.name || fallbackName || '').trim().slice(0, 40);
  if (!name) return { error: 'invalid' };
  const src = {};
  if (raw.colors && typeof raw.colors === 'object') Object.assign(src, raw.colors);
  if (raw.vars && typeof raw.vars === 'object') Object.assign(src, raw.vars);
  for (const [k, v] of Object.entries(raw)) if (!RESERVED.has(k)) src[k] = v;
  const colors = {};
  for (const [k, v] of Object.entries(src)) {
    if (!VAR_RE.test(k)) continue;
    const val = safeValue(v);
    if (val) colors[k.replace(/^--/, '')] = val;
  }
  const font = safeValue(raw.font);
  const css = safeCss(raw.css);
  const bg = typeof raw.background === 'string' && /^[a-z0-9._-]+$/i.test(raw.background) ? raw.background : null;
  return { name, colors, ...(bg ? { background: bg } : {}), ...(font ? { font } : {}), ...(css ? { css } : {}) };
}

const themeDir = () => path.join(app.getPath('userData'), 'themes');
/** Baca file tema: `.json` (schema di atas) atau `.css` (CSS mentah). */
function readTheme(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  try {
    const text = fs.readFileSync(file, 'utf8');
    const t = ext === '.css' ? { name: base, colors: {}, css: safeCss(text) } : normalizeTheme(JSON.parse(text), base);
    if (t.error || (ext === '.css' && !t.css)) return null;
    return { id: slug(t.name), ...t };
  } catch { return null; }
}
function listThemes() {
  try { return fs.readdirSync(themeDir()).filter((f) => f.endsWith('.json')).map((f) => readTheme(path.join(themeDir(), f))).filter(Boolean); }
  catch { return []; }
}
function saveTheme(t) {
  const id = slug(t.name);
  const clean = { name: t.name, colors: t.colors || {} };
  if (t.font) clean.font = t.font;
  if (t.css) clean.css = t.css;
  if (t.background) clean.background = t.background;
  fs.mkdirSync(themeDir(), { recursive: true });
  fs.writeFileSync(path.join(themeDir(), id + '.json'), JSON.stringify(clean, null, 2));
  return { ...clean, id };
}
/** Impor gambar (PNG/JPG) sebagai tema wallpaper: disalin ke folder tema + dicat latar island. */
function importImageTheme(file) {
  const img = nativeImage.createFromPath(file);
  if (img.isEmpty()) return { error: 'invalid' };
  const { width, height } = img.getSize();
  const max = 1920;
  const scale = Math.min(1, max / Math.max(width, height));
  const out = scale < 1 ? img.resize({ width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), quality: 'good' }) : img;
  const jpeg = /\.jpe?g$/i.test(file);
  const name = (path.basename(file, path.extname(file)).trim() || 'Image theme').slice(0, 40);
  const id = slug(name);
  const bgFile = id + (jpeg ? '.jpg' : '.png');
  fs.mkdirSync(themeDir(), { recursive: true });
  fs.writeFileSync(path.join(themeDir(), bgFile), jpeg ? out.toJPEG(90) : out.toPNG());
  const theme = { name, colors: {}, background: bgFile };
  fs.writeFileSync(path.join(themeDir(), id + '.json'), JSON.stringify(theme, null, 2));
  return { id, ...theme };
}
/** Impor tema dari file apa aja: .json / .css / gambar (.png/.jpg). */
function importThemeFile(file) {
  if (IMG_RE.test(file)) return importImageTheme(file);
  const t = readTheme(file);
  return t ? saveTheme(t) : { error: 'invalid' };
}
ipcMain.handle('themes', () => listThemes());
ipcMain.handle('theme-background', (_e, id) => {
  try {
    if (!/^[a-z0-9-]+$/.test(String(id))) return null;
    const t = readTheme(path.join(themeDir(), id + '.json'));
    if (!t?.background) return null;
    const img = nativeImage.createFromPath(path.join(themeDir(), t.background));
    return img.isEmpty() ? null : img.toDataURL();
  } catch { return null; }
});
ipcMain.handle('theme-import', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Import theme',
    filters: [{ name: 'Theme files', extensions: ['json', 'css', 'png', 'jpg', 'jpeg'] }, { name: 'All files', extensions: ['*'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return importThemeFile(r.filePaths[0]);
});
ipcMain.handle('theme-import-path', (_e, p) => {
  if (!isFile(p) || !/\.(json|css|png|jpe?g)$/i.test(p)) return null;
  return importThemeFile(p);
});
ipcMain.handle('theme-delete', (_e, id) => {
  if (/^[a-z0-9-]+$/.test(String(id))) {
    const file = path.join(themeDir(), id + '.json');
    const t = readTheme(file);
    if (t?.background) fs.rmSync(path.join(themeDir(), t.background), { force: true });
    fs.rmSync(file, { force: true });
  }
  return listThemes();
});

// Klik kanan di notch: menu kecil kayak versi Mac
ipcMain.on('context-menu', () => {
  const atLogin = process.platform === 'linux' ? linuxAutostart() : app.getLoginItemSettings().openAtLogin;
  Menu.buildFromTemplate([
    { label: 'Import theme…', click: () => send('theme-import') },
    { label: atLogin ? 'Don’t open at login' : 'Open at login', click: () => (process.platform === 'linux' ? linuxAutostart(!atLogin) : app.setLoginItemSettings({ openAtLogin: !atLogin })) },
    { type: 'separator' },
    { label: 'Quit Nusa', click: () => app.quit() },
  ]).popup({ window: win });
});
ipcMain.on('copy', (_e, text) => clipboard.writeText(String(text)));
ipcMain.on('open', (_e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); });
ipcMain.on('focus', () => win && win.focus());
ipcMain.handle('login-item', (_e, on) => {
  if (process.platform === 'linux') return linuxAutostart(on);
  if (on !== undefined) app.setLoginItemSettings({ openAtLogin: !!on });
  return app.getLoginItemSettings().openAtLogin;
});

/** Linux nggak punya API login item: tulis file .desktop di ~/.config/autostart. */
function linuxAutostart(on) {
  const file = path.join(app.getPath('home'), '.config', 'autostart', 'nusa.desktop');
  if (on === true) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `[Desktop Entry]\nType=Application\nName=Nusa\nExec="${process.env.APPIMAGE || process.execPath}"\nX-GNOME-Autostart-enabled=true\n`);
  } else if (on === false) fs.rmSync(file, { force: true });
  return fs.existsSync(file);
}

function makeTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'build', 'tray.png')).resize({ width: 18, height: 18 });
  tray = new Tray(icon);
  tray.setToolTip('Nusa');
  const rebuild = async () => {
    const atLogin = process.platform === 'linux' ? linuxAutostart() : app.getLoginItemSettings().openAtLogin;
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open Nusa', click: () => send('open-panel') },
      { label: 'Import theme…', click: () => send('theme-import') },
      { label: 'Start at login', type: 'checkbox', checked: atLogin, click: (m) => {
        process.platform === 'linux' ? linuxAutostart(m.checked) : app.setLoginItemSettings({ openAtLogin: m.checked });
        rebuild();
      } },
      { type: 'separator' },
      { label: 'Quit Nusa', click: () => app.quit() },
    ]));
  };
  rebuild();
  tray.on('click', () => send('open-panel'));
}

// Mode tes (dipakai pas development di Mac): jalanin langkah-langkah lalu potret jendela
async function shotMode(dir, steps) {
  for (const [js, name, wait] of steps) {
    if (js) await win.webContents.executeJavaScript(js);
    await new Promise((r) => setTimeout(r, wait ?? 900));
    if (name) fs.writeFileSync(path.join(dir, name + '.png'), (await win.webContents.capturePage()).toPNG());
  }
  app.quit();
}

app.whenReady().then(() => {
  // Linux: kasih jeda dikit biar compositor siap (kalau nggak, latar transparan jadi hitam)
  setTimeout(() => {
    create();
    makeTray();
    if (process.env.NUSA_SHOT_DIR) {
      win.webContents.once('did-finish-load', () => setTimeout(() => {
        shotMode(process.env.NUSA_SHOT_DIR, JSON.parse(fs.readFileSync(process.env.NUSA_SHOT_STEPS, 'utf8')));
      }, 2500));
    }
  }, process.platform === 'linux' ? 400 : 0);
});
app.on('second-instance', () => win && send('open-panel'));
app.on('window-all-closed', () => app.quit());
