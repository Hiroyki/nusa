// Lirik lagu yang lagi diputar. Nggak peduli app-nya apa (Spotify, Apple Music, YouTube, ...): yang dipakai
// cuma judul + artis + durasi dari media sistem, dicocokin ke LRCLIB (https://lrclib.net; gratis, tanpa login).
const API = 'https://lrclib.net/api';
// Beda durasi (detik) yang masih dianggap rekaman yang sama. Lebih dari ini waktunya pasti meleset,
// jadi liriknya ditampilin sebagai teks biasa aja (nggak jalan bareng lagu).
const SYNC_TOLERANCE = 6;
const MAX_SECONDS = 15 * 60; // lebih dari ini = podcast / film / mix, bukan lagu

/* ================= pembaca LRC ================= */

/** "[01:02.50]teks" → [{ t: 62.5, text }], urut waktu. Satu baris bisa punya beberapa waktu. */
function parseLRC(src) {
  const out = [];
  let offset = 0;
  for (const raw of String(src || '').split(/\r?\n/)) {
    const off = /^\s*\[offset:\s*([+-]?\d+)\s*\]/i.exec(raw);
    if (off) { offset = +off[1] / 1000; continue; }
    const times = [];
    let rest = raw.trim(), m;
    while ((m = /^\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]\s*/.exec(rest))) {
      times.push(+m[1] * 60 + parseFloat(m[2].replace(':', '.')));
      rest = rest.slice(m[0].length);
    }
    if (!times.length) continue;
    const text = rest.replace(/<\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?>/g, '').replace(/\s+/g, ' ').trim(); // buang waktu per kata
    for (const t of times) out.push({ t: Math.max(0, t - offset), text });
  }
  return out.sort((a, b) => a.t - b.t);
}

/* ================= nyamain judul & artis ================= */

const NOISE = /official|video|audio|lyric|lirik|visuali[sz]er|\bm\/?v\b|\bhd\b|\bhq\b|\b4k\b|remaster|\bfeat\b|\bft\b|\bwith\b|\bprod\b|\bclip\b|explicit|\bclean\b/i;
// Rekaman beda versi = waktu & liriknya bisa beda
const VERSION = /\b(live|remix|acoustic|akustik|sped up|speed up|slowed|reverb|instrumental|karaoke|cover|demo|unplugged|nightcore)\b/gi;

/** Buang embel-embel judul: "Yellow (Official Video)" → "Yellow"; "(Live)" / "(Remix)" dibiarin. */
function cleanTitle(s) {
  return String(s || '')
    .replace(/\s*[([{【]([^)\]}】]*)[)\]}】]/g, (all, inner) => (NOISE.test(inner) ? '' : all))
    .replace(/\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|official|lyric)\b.*$/i, '')
    .replace(/\s+(?:feat|ft)\.?\s.*$/i, '')
    .replace(/\s+(?:official\s+)?(?:music|lyrics?)\s+video$/i, '')
    .replace(/\s+/g, ' ').trim();
}
const cleanArtist = (s) => String(s || '').replace(/\s*-\s*topic$/i, '').replace(/\s*vevo$/i, '').trim();
const primaryArtist = (s) => cleanArtist(s).split(/\s*(?:,|;|\/|&|\s+x\s+|\s+(?:feat|ft)\.?\s+)\s*/i)[0].trim();

const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/\p{M}+/gu, '').replace(/['’`]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const versions = (s) => [...new Set((String(s || '').match(VERSION) || []).map((v) => v.toLowerCase()))].sort().join();

/** 2 = sama persis, 1 = yang satu isi sebagian dari yang lain (per kata), 0 = beda. */
function same(a, b) {
  if (!a || !b) return 0;
  if (a === b || a.replace(/ /g, '') === b.replace(/ /g, '')) return 2;
  return ` ${a} `.includes(` ${b} `) || ` ${b} `.includes(` ${a} `) ? 1 : 0;
}

/**
 * Cara-cara baca judul + artis. App musik ngasih rapi; YouTube sering "Artis - Judul (Official Video)"
 * dengan nama channel/label sebagai artis.
 */
function readings(m) {
  // Apple Music di Windows nulis artisnya "Artis — Album"
  const artist = cleanArtist(String(m.artist || '').split(' — ')[0]);
  const title = cleanTitle(m.title);
  const out = [{ title, artist }];
  const short = title.split(/\s+[|｜]\s+|\s+\/\/\s+/)[0].trim();
  const cut = /^(.+?)\s+[-–—]\s+(.+)$/.exec(short);
  if (cut) out.push({ artist: cut[1].trim(), title: cleanTitle(cut[2]) }, { artist: cut[2].trim(), title: cleanTitle(cut[1]) });
  else if (short !== title) out.push({ title: short, artist });
  return out.filter((r) => norm(r.title));
}

/** Pilih hasil terbaik; judul & artisnya wajib cocok biar nggak nampilin lirik lagu lain. */
function pick(results, reads, duration) {
  let best = null;
  for (const r of results || []) {
    if (!r || !(r.syncedLyrics || r.plainLyrics || r.instrumental)) continue;
    const rt = cleanTitle(r.trackName), ra = norm(cleanArtist(r.artistName));
    const diff = duration > 0 && r.duration > 0 ? Math.abs(r.duration - duration) : 0;
    for (const q of reads) {
      const qa = norm(q.artist);
      // Di LRCLIB ada juga yang judulnya "Artis - Judul"
      const t = Math.max(same(norm(rt), norm(q.title)), same(norm(rt), `${qa} ${norm(q.title)}`.trim()) === 2 ? 2 : 0);
      const a = qa ? Math.max(same(ra, qa), same(ra, norm(primaryArtist(q.artist)))) : 0;
      if (!t || (qa && !a)) continue;
      if (!qa && (t < 2 || !(duration > 0) || diff > 2)) continue; // artis nggak diketahui: cuma percaya yang persis
      if (t < 2 && diff > SYNC_TOLERANCE) continue;                // judul mirip doang + durasi beda = lagu lain
      const ver = versions(r.trackName) === versions(q.title) ? 0 : 1;
      const synced = !!r.syncedLyrics && diff <= SYNC_TOLERANCE && !ver;
      const score = t * 10 + a * 5 + (synced ? 12 : 0) - Math.min(diff, 30) - ver * 8;
      if (!best || score > best.score) best = { score, synced, r };
    }
  }
  if (!best) return null;
  const lines = best.synced ? parseLRC(best.r.syncedLyrics) : [];
  const plain = String(best.r.plainLyrics || '').trim() || parseLRC(best.r.syncedLyrics).map((l) => l.text).join('\n').trim();
  return { synced: lines.some((l) => l.text) ? lines : null, plain: plain || null, instrumental: !!best.r.instrumental && !plain, score: best.score };
}

/* ================= ambil dari LRCLIB ================= */

async function getJSON(url, fetchFn) {
  const res = await fetchFn(url, { signal: AbortSignal.timeout(10000) });
  if (res.status === 404 || res.status === 400) return null; // nggak ketemu
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

/** → { synced: [{t, text}] | null, plain, instrumental } atau null kalau nggak ada. Lempar error kalau jaringannya bermasalah. */
async function find(m, fetchFn = fetch) {
  const reads = readings(m);
  if (!reads.length) return null;
  const duration = Math.round(+m.duration || 0);
  const url = (route, o) => `${API}/${route}?${new URLSearchParams(Object.entries(o).filter(([, v]) => v))}`;
  const pool = [];
  let best = null;
  // true = udah dapet yang jalan bareng lagu, nggak usah nyari lagi
  const add = (list) => { pool.push(...(Array.isArray(list) ? list : list ? [list] : [])); best = pick(pool, reads, duration); return !!best?.synced; };

  const [main] = reads;
  if (main.artist && duration && add(await getJSON(url('get', { track_name: main.title, artist_name: main.artist, duration }), fetchFn))) return best;
  for (const r of reads) {
    if (!r.artist) continue;
    if (add(await getJSON(url('search', { track_name: r.title, artist_name: primaryArtist(r.artist) }), fetchFn))) return best;
  }
  add(await getJSON(url('search', { q: `${reads.length > 1 ? '' : primaryArtist(main.artist)} ${main.title}`.trim() }), fetchFn));
  return best;
}

/* ================= ngikutin lagu ================= */

const keyOf = (m) => `${m.title}\n${m.artist || ''}`;

/**
 * emit({ key, state: 'loading' | 'ok' | 'none' | 'error', synced, plain, instrumental }) atau emit(null).
 * Mati sampai enable(true): kalau fiturnya dimatiin, judul lagu nggak dikirim ke mana-mana.
 */
function create(emit, { fetchFn = (...a) => fetch(...a), delay = 900, retry = 20000 } = {}) {
  const cache = new Map();
  let on = false, media = null, wanted = null, timer = null;

  const worth = (m) => m?.title && !(m.duration > MAX_SECONDS) && !/^advertisement$/i.test(m.title);

  async function load(m, key, id, tries) {
    let out;
    try {
      if (!cache.has(id)) {
        cache.set(id, await find(m, fetchFn));
        if (cache.size > 100) cache.delete(cache.keys().next().value);
      }
      const r = cache.get(id);
      out = r ? { key, state: 'ok', synced: r.synced, plain: r.plain, instrumental: r.instrumental } : { key, state: 'none' };
    } catch { out = { key, state: 'error' }; }
    if (!on || wanted !== id) return; // udah ganti lagu
    emit(out);
    if (out.state === 'error' && tries < 3) timer = setTimeout(() => load(m, key, id, tries + 1), retry);
  }

  function track(m) {
    media = m;
    if (!on) return;
    if (!worth(m)) {
      if (wanted !== null) { wanted = null; clearTimeout(timer); emit(null); }
      return;
    }
    const key = keyOf(m), dur = Math.round(m.duration || 0);
    if (wanted !== null) {
      const [wk, wd] = [wanted.slice(0, wanted.lastIndexOf('\n')), +wanted.slice(wanted.lastIndexOf('\n') + 1)];
      // Durasi sering baru bener sedetik setelah ganti lagu; kalau berubah jauh, cari ulang
      if (wk === key && Math.abs(wd - dur) <= 2) return;
    }
    const id = wanted = `${key}\n${dur}`;
    clearTimeout(timer);
    emit({ key, state: 'loading' });
    // Nunggu sebentar: durasinya udah bener, dan Next yang dipencet berkali-kali nggak nembak server terus
    timer = setTimeout(() => load({ ...m }, key, id, 0), cache.has(id) ? 0 : delay);
  }

  function enable(v) {
    on = !!v;
    clearTimeout(timer);
    wanted = null;
    if (on) track(media); else emit(null);
  }

  return { track, enable };
}

module.exports = { create, find, pick, readings, parseLRC, cleanTitle, primaryArtist, keyOf };
