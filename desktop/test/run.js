// node test/run.js — cek jadwal sholat, pembaca tugas & lirik
require('../app/lib/prayer.js');
require('../app/lib/tasks.js');
const { Prayer, TaskParser } = globalThis;
let fail = 0;
const ok = (name, cond, extra = '') => { console.log(cond ? 'ok  ' : 'FAIL', name, extra); if (!cond) fail++; };
const hm = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(d);

// Acuan Aladhan metode 20 (Kemenag, tanpa ihtiyat), sama kayak tes versi Mac
const ref = [['2026-11-08T12:00:00+07:00', ['03:53', '04:03', '05:24', '11:35', '14:55', '17:46', '18:59']],
  ['2027-01-15T12:00:00+07:00', ['04:13', '04:23', '05:47', '12:01', '15:25', '18:14', '19:29']],
  ['2027-06-20T12:00:00+07:00', ['04:26', '04:36', '06:00', '11:53', '15:15', '17:46', '19:01']]];
let worst = 0;
for (const [d, exp] of ref) {
  const got = Prayer.times(Prayer.city('Cikarang'), new Date(d), 0).map((t) => hm(t.date));
  got.forEach((g, i) => { const [a, b] = [g, exp[i]].map((s) => s.split(':').map(Number)); worst = Math.max(worst, Math.abs(a[0] * 60 + a[1] - b[0] * 60 - b[1])); });
}
ok('jadwal sholat cocok Kemenag/Aladhan', worst <= 1, `(maks selisih ${worst} menit)`);
ok('kiblat Jakarta ~295° WNW', Math.round(Prayer.qibla(Prayer.city('Jakarta')).deg) === 295 && Prayer.qibla(Prayer.city('Jakarta')).point === 'WNW');
const mk = Prayer.times(Prayer.city('Makassar'), new Date('2026-11-08T12:00:00+08:00')).find((t) => t.key === 'maghrib');
ok('Makassar pakai WITA', new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' }).format(mk.date) === '17:58');

const maghrib = Prayer.times(Prayer.city('Cikarang'), new Date('2026-11-08T12:00:00+07:00')).find((t) => t.key === 'maghrib').date;
const a = new Prayer.Alarm(Prayer.city('Cikarang'));
ok('alarm: 10 menit sebelum', a.check(new Date(+maghrib - 590000))?.type === 'soon');
ok('alarm: nggak dobel', a.check(new Date(+maghrib - 300000)) === null);
ok('alarm: masuk waktu', a.check(new Date(+maghrib + 5000))?.type === 'now');
ok('alarm: Mac/PC bangun telat diem', new Prayer.Alarm(Prayer.city('Cikarang')).check(new Date(+maghrib + 300000)) === null);

// Lokasi otomatis: tempat bebas hasil deteksi harus ngasih jadwal yang sama kayak kota bawaan di titik yang sama
const auto = Prayer.place({ name: 'Cikarang', lat: -6.2615, lon: 107.1528, tz: 'Asia/Jakarta' });
const day = new Date('2026-11-08T12:00:00+07:00');
ok('lokasi otomatis = kota bawaan', Prayer.times(auto, day).every((t, i) => +t.date === +Prayer.times(Prayer.city('Cikarang'), day)[i].date));
ok('label zona WIB/WITA/WIT', ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'].map(Prayer.zoneLabel).join() === 'WIB,WITA,WIT');
ok('label zona luar negeri', Prayer.zoneLabel('Asia/Singapore') === 'GMT+8');
ok('zona ngaco → aman', Prayer.place({ name: 'X', lat: 1, lon: 2, tz: 'Not/AZone' }).tz === 'Asia/Jakarta');

// Pembaca tugas: "sekarang" = Minggu 8 Nov 2026 17:30 (jam lokal mesin tes)
const now = new Date(2026, 10, 8, 17, 30);
const fmt = (d) => d ? `${['Sun', 'Mon', 'Tue'][d.getDay()]} ${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
for (const [input, title, due] of [
  ['meeting besok jam 2 siang', 'meeting', 'Mon 9 14:00'], ['Rapat QC besok jam 9', 'Rapat QC', 'Mon 9 09:00'],
  ['minum obat 30 menit lagi', 'minum obat', 'Sun 8 18:00'], ['telpon ibu nanti malam', 'telpon ibu', 'Sun 8 20:00'],
  ['upload video jam 7 malam', 'upload video', 'Sun 8 19:00'], ['bayar listrik jam 9', 'bayar listrik', 'Mon 9 09:00'],
  ['beli galon lusa', 'beli galon', 'Tue 10 09:00'], ['cek mesin jam 15.30', 'cek mesin', 'Mon 9 15:30'],
  ['beresin laporan', 'beresin laporan', '-'], ['Call Budi tomorrow at 9am', 'Call Budi', 'Mon 9 09:00'],
  ['Submit report in 2 hours', 'Submit report', 'Sun 8 19:30'], ['Rekap journal untuk 1 jam lagi', 'Rekap journal', 'Sun 8 18:30'],
  ['cek email dalam 30 menit', 'cek email', 'Sun 8 18:00'], ['Gym tonight', 'Gym', 'Sun 8 20:00'],
]) {
  const r = TaskParser.parse(input, now);
  ok(`"${input}"`, r.title === title && fmt(r.due) === due, `-> "${r.title}" @ ${fmt(r.due)}`);
}

// Lirik (tanpa internet: server-nya dipalsuin)
const Lyrics = require('../lyrics.js');
const { splitArtist, ownClock } = require('../media.js');
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
ok('LRC: waktu ganda, waktu per kata, offset', eq(Lyrics.parseLRC('[ar:X]\n[offset:+500]\n[00:10.50][01:00.5]<00:10.50>Halo <00:11.00>dunia\n[00:20.00]\nbukan lirik'),
  [{ t: 10, text: 'Halo dunia' }, { t: 19.5, text: '' }, { t: 60, text: 'Halo dunia' }]));
ok('judul: embel-embel dibuang, versi dibiarin', eq(['Yellow (Official Video)', 'Bohemian Rhapsody - Remastered 2011', 'Komang (Live)', 'Peaches (feat. Daniel Caesar)', 'Stay With Me'].map(Lyrics.cleanTitle),
  ['Yellow', 'Bohemian Rhapsody', 'Komang (Live)', 'Peaches', 'Stay With Me']));
ok('judul YouTube "Artis - Judul"', Lyrics.readings({ title: 'NOAH - Separuh Aku (Official Music Video)', artist: 'Musica Studios' }).some((r) => r.artist === 'NOAH' && r.title === 'Separuh Aku'));
ok('Apple Music: artis & album dipisah', eq(splitArtist({ app: 'Apple Music', artist: 'Tulus — Manusia', album: '' }), { app: 'Apple Music', artist: 'Tulus', album: 'Manusia' })
  && splitArtist({ app: 'Spotify', artist: 'A — B', album: '' }).artist === 'A — B');

const rec = (trackName, artistName, duration, o = {}) => ({ trackName, artistName, duration, syncedLyrics: '[00:01.00]la la', plainLyrics: 'la la', ...o });
const pickOne = (list, m) => Lyrics.pick(list, Lyrics.readings(m), m.duration);
ok('artis lain ditolak', pickOne([rec('Home', 'Edward Sharpe', 200)], { title: 'Home', artist: 'Michael Bublé', duration: 200 }) === null);
ok('aksen & VEVO tetap cocok', !!pickOne([rec('Déjà Vu', 'Beyoncé', 240)], { title: 'Deja Vu', artist: 'BeyonceVEVO', duration: 240 })?.synced);
ok('durasi beda jauh → nggak disinkronin', eq(((r) => [r.synced, r.plain])(pickOne([rec('Yellow', 'Coldplay', 267)], { title: 'Yellow', artist: 'Coldplay', duration: 300 })), [null, 'la la']));
ok('versi live nggak pakai waktu studio', pickOne([rec('Yellow', 'Coldplay', 267)], { title: 'Yellow (Live)', artist: 'Coldplay', duration: 267 })?.synced === null);
ok('tanpa artis: cuma yang persis', pickOne([rec('Intro', 'X', 120)], { title: 'Intro', artist: '', duration: 128 }) === null);

const ck = ownClock();
const first = ck({ source: 'a', title: '1', artist: '', playing: true }), second = ck({ source: 'a', title: '2', artist: '', playing: true });
ok('posisi sendiri: cuma kalau liat lagunya mulai', first.noClock === true && second.noClock === false && second.position === 0);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const calls = [], seen = [];
  const fetchFn = async (url) => { calls.push(url); return { status: 200, ok: true, json: async () => rec(new URL(url).searchParams.get('track_name'), 'A', 100) }; };
  const ly = Lyrics.create((l) => seen.push(l && l.state + ':' + l.key.split('\n')[0]), { fetchFn, delay: 20, retry: 20 });
  ly.track({ title: 'Satu', artist: 'A', duration: 100 });
  await wait(50);
  ok('lirik mati: nggak nyentuh internet', calls.length === 0 && seen.length === 0);
  ly.enable(true);
  for (const t of ['Dua', 'Tiga', 'Empat']) ly.track({ title: t, artist: 'A', duration: 100 }); // Next dipencet cepat
  await wait(80);
  ok('Next berkali-kali: cuma lagu terakhir yang dicari', calls.length === 1 && seen.at(-1) === 'ok:Empat');
  for (let i = 0; i < 5; i++) ly.track({ title: 'Empat', artist: 'A', duration: 100.4 });
  await wait(50);
  ok('lagu sama: nggak dicari lagi', calls.length === 1);
  ly.track(null);
  ok('berhenti: lirik dibersihin', seen.at(-1) === null);

  let broken = true;
  const flaky = Lyrics.create((l) => seen.push(l && l.state), { delay: 5, retry: 20, fetchFn: async (u) => { if (broken) { broken = false; throw new Error('offline'); } return fetchFn(u); } });
  flaky.enable(true);
  flaky.track({ title: 'Lima', artist: 'A', duration: 100 });
  await wait(90);
  ok('internet putus: dicoba lagi', eq(seen.slice(-3), ['loading', 'error', 'ok']));
  process.exit(fail ? 1 : 0);
})();
