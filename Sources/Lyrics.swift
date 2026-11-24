// Lirik lagu yang lagi diputar, versi Mac dari desktop/lyrics.js (aturan cocoknya harus sama).
// Nggak peduli app-nya apa: yang dipakai cuma judul + artis + durasi, dicocokin ke LRCLIB (https://lrclib.net).
import AppKit
import Combine
import SwiftUI

struct LyricRow: Equatable {
    var t: Double
    var text: String
}

/// Baris yang tampil di notch. `index` -1 = belum masuk baris pertama (judul lagu).
struct LyricLine: Equatable {
    var index: Int
    var text: String
    var length: Double
}

struct LyricsMatch: Equatable {
    /// nil = nggak ada, atau rekamannya beda jadi waktunya pasti meleset.
    var synced: [LyricRow]?
    var plain: String?
    var instrumental = false
    var score = 0.0
}

struct LyricsResult: Equatable {
    enum State { case loading, ok, none, failed }
    var key: String
    var state: State
    var match: LyricsMatch?
}

// MARK: - Cari & cocokin

private extension String {
    var trimmed: String { trimmingCharacters(in: .whitespacesAndNewlines) }

    func sub(_ pattern: String, _ with: String = "") -> String {
        replacingOccurrences(of: pattern, with: with, options: [.regularExpression, .caseInsensitive])
    }

    func has(_ pattern: String) -> Bool {
        range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil
    }

    /// Semua kecocokan; tiap kecocokan = [semuanya, grup 1, grup 2, ...].
    func matches(_ pattern: String) -> [(range: NSRange, groups: [String])] {
        guard let re = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { return [] }
        let ns = self as NSString
        return re.matches(in: self, range: NSRange(location: 0, length: ns.length)).map { m in
            (m.range, (0..<m.numberOfRanges).map { m.range(at: $0).location == NSNotFound ? "" : ns.substring(with: m.range(at: $0)) })
        }
    }
}

enum LyricsFinder {
    /// Beda durasi (detik) yang masih dianggap rekaman yang sama.
    static let syncTolerance = 6.0
    /// Lebih dari ini = podcast / film / mix, bukan lagu.
    static let maxSeconds = 15.0 * 60

    struct Record: Decodable {
        var trackName: String?
        var artistName: String?
        var duration: Double?
        var instrumental: Bool?
        var plainLyrics: String?
        var syncedLyrics: String?
    }

    struct Reading: Equatable {
        var title: String
        var artist: String
    }

    /// "[01:02.50]teks" → waktu 62,5 detik. Satu baris bisa punya beberapa waktu.
    static func parseLRC(_ src: String) -> [LyricRow] {
        var out: [LyricRow] = []
        var offset = 0.0
        for raw in src.components(separatedBy: .newlines) {
            if let m = raw.matches(#"^\s*\[offset:\s*([+-]?\d+)\s*\]"#).first {
                offset = (Double(m.groups[1].replacingOccurrences(of: "+", with: "")) ?? 0) / 1000
                continue
            }
            var rest = raw.trimmed
            var times: [Double] = []
            while let m = rest.matches(#"^\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]\s*"#).first {
                times.append((Double(m.groups[1]) ?? 0) * 60 + (Double(m.groups[2].replacingOccurrences(of: ":", with: ".")) ?? 0))
                rest = (rest as NSString).substring(from: m.range.length)
            }
            guard !times.isEmpty else { continue }
            let text = rest.sub(#"<\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?>"#).sub(#"\s+"#, " ").trimmed
            for t in times { out.append(LyricRow(t: max(0, t - offset), text: text)) }
        }
        // Urutan baris dengan waktu yang sama dipertahanin
        return out.enumerated().sorted { ($0.element.t, $0.offset) < ($1.element.t, $1.offset) }.map(\.element)
    }

    private static let noise = #"official|video|audio|lyric|lirik|visuali[sz]er|\bm/?v\b|\bhd\b|\bhq\b|\b4k\b|remaster|\bfeat\b|\bft\b|\bwith\b|\bprod\b|\bclip\b|explicit|\bclean\b"#
    private static let version = #"\b(live|remix|acoustic|akustik|sped up|speed up|slowed|reverb|instrumental|karaoke|cover|demo|unplugged|nightcore)\b"#

    /// Buang embel-embel: "Yellow (Official Video)" → "Yellow"; "(Live)" / "(Remix)" dibiarin.
    static func cleanTitle(_ s: String) -> String {
        let out = NSMutableString(string: s)
        for m in s.matches(#"\s*[(\[\{【]([^)\]\}】]*)[)\]\}】]"#).reversed() where m.groups[1].has(noise) {
            out.deleteCharacters(in: m.range)
        }
        return (out as String)
            .sub(#"\s+-\s+(?:\d{4}\s+)?(?:remaster(?:ed)?|official|lyric)\b.*$"#)
            .sub(#"\s+(?:feat|ft)\.?\s.*$"#)
            .sub(#"\s+(?:official\s+)?(?:music|lyrics?)\s+video$"#)
            .sub(#"\s+"#, " ").trimmed
    }

    static func cleanArtist(_ s: String) -> String { s.sub(#"\s*-\s*topic$"#).sub(#"\s*vevo$"#).trimmed }

    static func primaryArtist(_ s: String) -> String {
        let a = cleanArtist(s)
        guard let m = a.matches(#"\s*(?:,|;|/|&|\s+x\s+|\s+(?:feat|ft)\.?\s+)\s*"#).first else { return a }
        return (a as NSString).substring(to: m.range.location).trimmed
    }

    static func norm(_ s: String) -> String {
        s.lowercased().decomposedStringWithCompatibilityMapping
            .sub(#"\p{M}+"#).sub("['’`]").sub(#"[^\p{L}\p{N}]+"#, " ").trimmed
    }

    private static func versions(_ s: String) -> String {
        Set(s.matches(version).map { $0.groups[0].lowercased() }).sorted().joined(separator: ",")
    }

    /// 2 = sama persis, 1 = yang satu isi sebagian dari yang lain (per kata), 0 = beda.
    private static func same(_ a: String, _ b: String) -> Int {
        if a.isEmpty || b.isEmpty { return 0 }
        if a == b || a.replacingOccurrences(of: " ", with: "") == b.replacingOccurrences(of: " ", with: "") { return 2 }
        return " \(a) ".contains(" \(b) ") || " \(b) ".contains(" \(a) ") ? 1 : 0
    }

    /// App musik ngasih rapi; YouTube sering "Artis - Judul (Official Video)" dengan nama channel sebagai artis.
    static func readings(title rawTitle: String, artist rawArtist: String) -> [Reading] {
        let artist = cleanArtist(rawArtist.components(separatedBy: " — ")[0])
        let title = cleanTitle(rawTitle)
        var out = [Reading(title: title, artist: artist)]
        var short = title
        if let m = title.matches(#"\s+[|｜]\s+|\s+//\s+"#).first { short = (title as NSString).substring(to: m.range.location).trimmed }
        if let m = short.matches(#"^(.+?)\s+[\-–—]\s+(.+)$"#).first {
            out.append(Reading(title: cleanTitle(m.groups[2]), artist: m.groups[1].trimmed))
            out.append(Reading(title: cleanTitle(m.groups[1]), artist: m.groups[2].trimmed))
        } else if short != title {
            out.append(Reading(title: short, artist: artist))
        }
        return out.filter { !norm($0.title).isEmpty }
    }

    /// Pilih hasil terbaik; judul & artisnya wajib cocok biar nggak nampilin lirik lagu lain.
    static func pick(_ results: [Record], _ reads: [Reading], duration: Double) -> LyricsMatch? {
        var best: (score: Double, synced: Bool, r: Record)?
        for r in results {
            let hasSynced = !(r.syncedLyrics ?? "").isEmpty
            guard hasSynced || !(r.plainLyrics ?? "").isEmpty || r.instrumental == true else { continue }
            let rt = norm(cleanTitle(r.trackName ?? "")), ra = norm(cleanArtist(r.artistName ?? ""))
            let rd = r.duration ?? 0
            let diff = duration > 0 && rd > 0 ? abs(rd - duration) : 0
            for q in reads {
                let qa = norm(q.artist), qt = norm(q.title)
                // Di LRCLIB ada juga yang judulnya "Artis - Judul"
                let t = max(same(rt, qt), same(rt, "\(qa) \(qt)".trimmed) == 2 ? 2 : 0)
                let a = qa.isEmpty ? 0 : max(same(ra, qa), same(ra, norm(primaryArtist(q.artist))))
                if t == 0 || (!qa.isEmpty && a == 0) { continue }
                if qa.isEmpty, t < 2 || duration <= 0 || diff > 2 { continue } // artis nggak diketahui: cuma percaya yang persis
                if t < 2, diff > syncTolerance { continue }                    // judul mirip doang + durasi beda = lagu lain
                let other = versions(r.trackName ?? "") != versions(q.title)
                let synced = hasSynced && diff <= syncTolerance && !other
                var score = Double(t * 10 + a * 5) + (synced ? 12 : 0)
                score -= min(diff, 30) + (other ? 8 : 0)
                if best == nil || score > best!.score { best = (score, synced, r) }
            }
        }
        guard let best else { return nil }
        let rows = parseLRC(best.r.syncedLyrics ?? "")
        var plain = (best.r.plainLyrics ?? "").trimmed
        if plain.isEmpty { plain = rows.map(\.text).joined(separator: "\n").trimmed }
        return LyricsMatch(synced: best.synced && rows.contains { !$0.text.isEmpty } ? rows : nil,
                           plain: plain.isEmpty ? nil : plain,
                           instrumental: best.r.instrumental == true && plain.isEmpty, score: best.score)
    }

    /// nil = nggak ketemu. Lempar error kalau jaringan / server-nya bermasalah.
    private static func fetch(_ route: String, _ query: [(String, String)]) async throws -> Data? {
        var c = URLComponents(string: "https://lrclib.net/api/\(route)")!
        c.queryItems = query.filter { !$0.1.isEmpty }.map { URLQueryItem(name: $0.0, value: $0.1) }
        // URLComponents ngebiarin "+", padahal di server artinya spasi
        c.percentEncodedQuery = c.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B")
        var req = URLRequest(url: c.url!, timeoutInterval: 10)
        req.setValue("lyrics-client", forHTTPHeaderField: "User-Agent")
        let (data, resp) = try await URLSession.shared.data(for: req)
        let status = (resp as? HTTPURLResponse)?.statusCode ?? 0
        if status == 404 || status == 400 { return nil }
        guard (200..<300).contains(status) else { throw URLError(.badServerResponse) }
        return data
    }

    static func find(title: String, artist: String, duration rawDuration: Double) async throws -> LyricsMatch? {
        let reads = readings(title: title, artist: artist)
        guard let main = reads.first else { return nil }
        let duration = rawDuration.rounded()
        var pool: [Record] = []
        func add(_ records: [Record]) -> LyricsMatch? {
            pool += records
            return pick(pool, reads, duration: duration)
        }
        func list(_ q: [(String, String)]) async throws -> [Record] {
            guard let d = try await fetch("search", q) else { return [] }
            return try JSONDecoder().decode([Record].self, from: d)
        }
        if !main.artist.isEmpty, duration > 0,
           let d = try await fetch("get", [("track_name", main.title), ("artist_name", main.artist), ("duration", String(Int(duration)))]),
           let m = add([try JSONDecoder().decode(Record.self, from: d)]), m.synced != nil { return m }
        for r in reads where !r.artist.isEmpty {
            if let m = add(try await list([("track_name", r.title), ("artist_name", primaryArtist(r.artist))])), m.synced != nil { return m }
        }
        return add(try await list([("q", "\(reads.count > 1 ? "" : primaryArtist(main.artist)) \(main.title)".trimmed)]))
    }
}

// MARK: - Ngikutin lagu

extension Media {
    var lyricKey: String { "\(title)\n\(artist)" }
}

extension IslandModel {
    static let lyricMax: CGFloat = 460
    static let lyricFont = NSFont.systemFont(ofSize: 12, weight: .semibold)
    /// Baris kosong di bawah ini (detik) = jeda napas, bukan bagian instrumental.
    static let lyricGap = 6.0

    /// Hasil buat lagu yang lagi diputar (bukan sisa lagu sebelumnya).
    var lyricsNow: LyricsResult? { lyricMode != .off && media.exists && lyrics?.key == media.lyricKey ? lyrics : nil }

    /// Baris yang jalan bareng lagu. Tanpa durasi = app-nya nggak lapor posisi, jadi nggak bisa disinkronin.
    var lyricRows: [LyricRow]? { media.duration > 0 ? lyricsNow?.match?.synced : nil }

    var lyricsVisible: Bool { media.playing && focus == nil && lyricRows != nil }

    var lyricShift: Double { lyricShifts[media.source ?? ""] ?? 0 }

    /// Jeda pendek: baris tadi ditahan; jeda panjang: ♪. Sebelum baris pertama: judul lagu.
    var lyricLine: LyricLine? {
        guard let rows = lyricRows else { return nil }
        var i = min(lyricIndex, rows.count - 1)
        if i < 0 {
            return LyricLine(index: -1, text: [media.title, media.artist].filter { !$0.isEmpty }.joined(separator: " · "), length: 0)
        }
        let length = (i + 1 < rows.count ? rows[i + 1].t : rows[i].t + 8) - rows[i].t
        if rows[i].text.isEmpty, length < Self.lyricGap { while i > 0, rows[i].text.isEmpty { i -= 1 } }
        return LyricLine(index: i, text: rows[i].text.isEmpty ? "♪" : rows[i].text, length: length)
    }

    var lyricTextWidth: CGFloat {
        ceil(NSAttributedString(string: lyricLine?.text ?? "", attributes: [.font: Self.lyricFont]).size().width) + 4
    }

    /// Lebar di luar teks: sampul, jarak, equalizer, cincin timer. Ber-notch: teksnya sendirian di bawah kamera.
    var lyricChrome: CGFloat {
        notch != nil ? 28 : 6 + 16 + 8 + 8 + 16 + 10 + (timerRunning ? 20 : 0)
    }

    var lyricWidth: CGFloat {
        let want = min(lyricTextWidth + lyricChrome, Self.lyricMax)
        if let n = notch { return max(n.width, min(max(want, n.width + (timerRunning ? 116 : 80)), compactLimit)) }
        // Mode hover: minimal selebar notch lagu, kalau nggak kursor di pinggirnya bikin kedip
        return min(max(want, lyricMode == .hover ? (timerRunning ? 268 : 248) : 220), compactLimit)
    }

    func seekLyric(_ row: LyricRow) {
        let t = max(0, row.t - lyricShift)
        send("seek \(t)")
        media.elapsed = t
        media.timestamp = Date().timeIntervalSince1970
    }

    func shiftLyrics(_ d: Double) {
        lyricShifts[media.source ?? ""] = min(max(lyricShift + d, -10), 10)
    }
}

/// Cari lirik tiap ganti lagu, lalu majuin baris sesuai posisi lagu.
/// Semua jalan di main thread.
final class LyricsEngine: @unchecked Sendable {
    /// Muncul sedikit lebih awal, biar pas sama animasinya.
    private static let lead = 0.15
    private let model: IslandModel
    private var subs = Set<AnyCancellable>()
    private var cache: [String: LyricsMatch?] = [:]
    private var order: [String] = []
    private var wanted: (key: String, duration: Double)?
    private var pending: DispatchWorkItem?
    private var next: DispatchWorkItem?

    init(model: IslandModel) { self.model = model }

    func start() {
        // @Published ngabarin sebelum nilainya kepasang, jadi ditunda satu putaran
        model.$media.receive(on: DispatchQueue.main).sink { [weak self] _ in self?.track(); self?.tick() }.store(in: &subs)
        model.$lyricShifts.receive(on: DispatchQueue.main).sink { [weak self] _ in self?.tick() }.store(in: &subs)
        model.$lyricMode.receive(on: DispatchQueue.main).map { $0 != .off }.removeDuplicates().sink { [weak self] _ in
            self?.reset()
            self?.track()
        }.store(in: &subs)
    }

    private func reset() {
        wanted = nil
        pending?.cancel()
        publish(nil)
    }

    private func publish(_ r: LyricsResult?) {
        guard model.lyrics != r else { return }
        if model.lyricIndex != -1 { model.lyricIndex = -1 }
        model.lyrics = r
        tick()
    }

    /// Fiturnya dimatiin = judul lagu nggak dikirim ke mana-mana.
    private func track() {
        let m = model.media
        guard model.lyricMode != .off, m.exists, m.duration <= LyricsFinder.maxSeconds, m.title.lowercased() != "advertisement" else {
            if wanted != nil { reset() }
            return
        }
        // Durasi sering baru bener sesaat setelah ganti lagu; kalau berubah jauh, cari ulang
        if let w = wanted, w.key == m.lyricKey, abs(w.duration - m.duration) <= 2 { return }
        wanted = (m.lyricKey, m.duration)
        publish(LyricsResult(key: m.lyricKey, state: .loading))
        // Nunggu sebentar: Next yang dipencet berkali-kali nggak nembak server terus
        schedule(m, after: cache[id(m)] == nil ? 0.9 : 0, tries: 0)
    }

    private func id(_ m: Media) -> String { "\(m.lyricKey)\n\(Int(m.duration.rounded()))" }

    private func schedule(_ m: Media, after delay: Double, tries: Int) {
        pending?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.load(m, tries: tries) }
        pending = work
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: work)
    }

    private func load(_ m: Media, tries: Int) {
        if let hit = cache[id(m)] { return finish(m, hit) }
        Task { [weak self] in
            let result: Result<LyricsMatch?, Error>
            do { result = .success(try await LyricsFinder.find(title: m.title, artist: m.artist, duration: m.duration)) } catch { result = .failure(error) }
            DispatchQueue.main.async {
                guard let self else { return }
                switch result {
                case .success(let match):
                    self.remember(self.id(m), match)
                    self.finish(m, match)
                case .failure:
                    guard self.current(m) else { return }
                    self.publish(LyricsResult(key: m.lyricKey, state: .failed))
                    if tries < 3 { self.schedule(m, after: 20, tries: tries + 1) }
                }
            }
        }
    }

    private func current(_ m: Media) -> Bool { wanted.map { $0.key == m.lyricKey && $0.duration == m.duration } ?? false }

    private func finish(_ m: Media, _ match: LyricsMatch?) {
        guard current(m) else { return } // udah ganti lagu
        publish(LyricsResult(key: m.lyricKey, state: match == nil ? .none : .ok, match: match))
    }

    private func remember(_ id: String, _ match: LyricsMatch?) {
        cache.updateValue(match, forKey: id)
        order.append(id)
        if order.count > 100 { cache.removeValue(forKey: order.removeFirst()) }
    }

    /// Cari baris sekarang, terus tidur sampai baris berikutnya.
    private func tick() {
        next?.cancel()
        guard let rows = model.lyricRows else { return }
        let pos = model.media.position(at: Date()) + model.lyricShift + Self.lead
        let cur = model.lyricIndex
        var i = rows.lastIndex { $0.t <= pos } ?? -1
        // Laporan posisi dari app suka mundur dikit; jangan sampai barisnya bolak-balik
        if i == cur - 1, rows.indices.contains(cur), rows[cur].t - pos < 0.8 { i = cur }
        if i != cur { model.lyricIndex = i }
        guard model.media.playing else { return }
        let wait = i + 1 < rows.count ? min(max(rows[i + 1].t - pos + 0.015, 0.03), 1) : 1
        let work = DispatchWorkItem { [weak self] in self?.tick() }
        next = work
        DispatchQueue.main.asyncAfter(deadline: .now() + wait, execute: work)
    }
}

// MARK: - Tampilan

private let mint = Color(red: 0.36, green: 0.86, blue: 0.66)

/// Notch kecil: baris yang lagi dinyanyiin. Di MacBook ber-notch turun ke bawah kamera.
struct CompactLyric: View {
    @ObservedObject var model: IslandModel

    var body: some View {
        Group {
            if let n = model.notch {
                VStack(spacing: 0) {
                    HStack(spacing: 8) {
                        Artwork(image: model.art, side: 16, radius: 4)
                        Spacer(minLength: 6)
                        Equalizer(playing: true, tint: model.tint)
                        if model.timerRunning { TimerRing(model: model) }
                    }
                    .padding(.horizontal, 10)
                    .frame(height: n.height)
                    text.frame(height: IslandModel.lyricStrip - 4).padding(.bottom, 4)
                }
            } else {
                HStack(spacing: 8) {
                    Artwork(image: model.art, side: 16, radius: 4)
                    text.frame(maxWidth: .infinity)
                    Equalizer(playing: true, tint: model.tint)
                    if model.timerRunning { TimerRing(model: model) }
                }
                .padding(.leading, 6)
                .padding(.trailing, 10)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(model.lyricLine?.text ?? model.media.title)
    }

    private var text: some View {
        let line = model.lyricLine ?? LyricLine(index: -1, text: model.media.title, length: 0)
        let room = model.size.width - model.lyricChrome
        return ZStack {
            LyricText(line: line, width: model.lyricTextWidth, room: room)
                .id("\(line.index)|\(line.text)")
                .transition(.asymmetric(insertion: .offset(y: 8).combined(with: .opacity), removal: .opacity))
        }
        .frame(width: max(room, 0))
        .clipped()
        .animation(.easeOut(duration: 0.28), value: line)
    }
}

/// Baris kepanjangan jalan pelan ke ujung selama dinyanyiin.
private struct LyricText: View {
    let line: LyricLine
    let width: CGFloat
    let room: CGFloat
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var ended = false

    var body: some View {
        let over = max(0, width - room)
        let rtl = line.text.unicodeScalars.contains { (0x0590...0x08FF).contains($0.value) }
        let label = Text(line.text).font(Font(IslandModel.lyricFont)).foregroundStyle(.white).lineLimit(1)
        Group {
            if over > 0, !reduceMotion {
                label.fixedSize()
                    .offset(x: ended == rtl ? 0 : -over)
                    .frame(width: max(room, 0), alignment: .leading)
                    .onAppear {
                        withAnimation(.linear(duration: max(1, min(6, (line.length > 0 ? line.length : 6) - 1.2))).delay(0.5)) { ended = true }
                    }
            } else {
                label.frame(width: max(room, 0))
            }
        }
    }
}

/// Home: baris yang lagi dinyanyiin di bawah pemutar.
struct HomeLyric: View {
    @ObservedObject var model: IslandModel

    var body: some View {
        if let line = model.lyricLine, line.index >= 0 {
            ZStack {
                Text(line.text).font(Font(IslandModel.lyricFont)).foregroundStyle(.white).lineLimit(1)
                    .id("\(line.index)|\(line.text)")
                    .transition(.asymmetric(insertion: .offset(y: 8).combined(with: .opacity), removal: .opacity))
            }
            .frame(maxWidth: .infinity)
            .animation(.easeOut(duration: 0.28), value: line)
        }
    }
}

/// Keterangan kecil di pemutar kalau nggak ada kolom lirik.
struct LyricsNote: View {
    @ObservedObject var model: IslandModel

    private var text: String? {
        guard let l = model.lyricsNow else { return nil }
        switch l.state {
        case .loading: return "Finding lyrics…"
        case .none: return "No lyrics found"
        case .failed: return "Couldn’t load lyrics"
        case .ok: return l.match?.instrumental == true ? "Instrumental" : nil
        }
    }

    var body: some View {
        if let text { Text(text).font(.system(size: 11)).foregroundStyle(.white.opacity(0.4)).padding(.top, 6) }
    }
}

/// Kolom lirik di tab Music: gulir sendiri, klik baris = lompat ke situ.
struct LyricsColumn: View {
    @ObservedObject var model: IslandModel
    @State private var hovering = false
    @State private var touched = Date.distantPast
    @State private var monitor: Any?

    static func available(_ model: IslandModel) -> Bool {
        guard let m = model.lyricsNow?.match else { return false }
        return m.synced != nil || m.plain != nil
    }

    var body: some View {
        let rows = model.lyricRows
        HStack(spacing: 0) {
            Rectangle().fill(hairline).frame(width: 1).padding(.trailing, 14)
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text("LYRICS").font(.system(size: 10, weight: .bold)).tracking(1.1).foregroundStyle(mint)
                    Spacer()
                    if rows != nil {
                        step("minus", "Lyrics too early", -0.25)
                        Text(shiftText).font(.system(size: 10.5)).monospacedDigit().foregroundStyle(.white.opacity(0.4)).frame(minWidth: 44)
                        step("plus", "Lyrics too late", 0.25)
                    } else {
                        Text("Not synced").font(.system(size: 10.5)).foregroundStyle(.white.opacity(0.4))
                    }
                }
                .frame(height: 24)
                if let rows { synced(rows) } else { plain }
            }
        }
        .frame(width: 320)
        .onHover { hovering = $0 }
        .onAppear {
            monitor = NSEvent.addLocalMonitorForEvents(matching: .scrollWheel) { e in
                if hovering { touched = Date() }
                return e
            }
        }
        .onDisappear { if let monitor { NSEvent.removeMonitor(monitor) }; monitor = nil }
    }

    private var shiftText: String {
        let s = model.lyricShift
        return s == 0 ? "In sync" : "\(s > 0 ? "+" : "")\(s.formatted())s"
    }

    private func step(_ symbol: String, _ label: String, _ d: Double) -> some View {
        Button { model.shiftLyrics(d) } label: {
            Image(systemName: symbol).font(.system(size: 9, weight: .bold)).foregroundStyle(.white.opacity(0.75))
                .frame(width: 22, height: 22).background(Circle().fill(.white.opacity(0.08))).contentShape(Circle())
        }
        .buttonStyle(Press())
        .help(label)
        .accessibilityLabel(label)
    }

    private func synced(_ rows: [LyricRow]) -> some View {
        let now = model.lyricLine?.index ?? -1
        return ScrollViewReader { proxy in
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(rows.indices, id: \.self) { i in
                        row(rows, i, on: i == now).id(i)
                    }
                }
                .padding(.top, 6)
                .padding(.bottom, 60)
            }
            .mask(fade)
            .onAppear { DispatchQueue.main.async { proxy.scrollTo(max(now, 0), anchor: now < 0 ? .top : .center) } }
            .onChange(of: now) { _, i in
                guard Date().timeIntervalSince(touched) > 4 else { return }
                withAnimation(.easeInOut(duration: 0.35)) { proxy.scrollTo(max(i, 0), anchor: i < 0 ? .top : .center) }
            }
        }
        .id(model.media.lyricKey)
    }

    @ViewBuilder private func row(_ rows: [LyricRow], _ i: Int, on: Bool) -> some View {
        let end = i + 1 < rows.count ? rows[i + 1].t : .infinity
        if rows[i].text.isEmpty, end - rows[i].t < IslandModel.lyricGap {
            Color.clear.frame(height: 8)
        } else {
            Text(rows[i].text.isEmpty ? "♪" : rows[i].text)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white.opacity(on ? 1 : 0.4))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 4)
                .contentShape(Rectangle())
                .onTapGesture { touched = .distantPast; model.seekLyric(rows[i]) }
                .accessibilityAddTraits(.isButton)
        }
    }

    private var plain: some View {
        ScrollView(showsIndicators: false) {
            Text(model.lyricsNow?.match?.plain ?? model.lyricsNow?.match?.synced?.map(\.text).joined(separator: "\n") ?? "")
                .font(.system(size: 13))
                .lineSpacing(4)
                .foregroundStyle(dim)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top, 6)
                .padding(.bottom, 40)
        }
        .mask(fade)
    }

    private var fade: some View {
        LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.06),
                               .init(color: .black, location: 0.86), .init(color: .clear, location: 1)], startPoint: .top, endPoint: .bottom)
    }
}

// MARK: - Tes (`Nusa --test-lyrics`, tanpa internet; dijalanin di GitHub Actions)

func testLyrics() -> Bool {
    var good = true
    func ok(_ name: String, _ pass: Bool) {
        print(pass ? "ok  " : "FAIL", name)
        if !pass { good = false }
    }
    typealias F = LyricsFinder
    ok("LRC: waktu ganda, waktu per kata, offset",
       F.parseLRC("[ar:X]\n[offset:+500]\n[00:10.50][01:00.5]<00:10.50>Halo <00:11.00>dunia\n[00:20.00]\nbukan lirik")
        == [LyricRow(t: 10, text: "Halo dunia"), LyricRow(t: 19.5, text: ""), LyricRow(t: 60, text: "Halo dunia")])
    ok("judul: embel-embel dibuang, versi dibiarin",
       ["Yellow (Official Video)", "Bohemian Rhapsody - Remastered 2011", "Komang (Live)", "Peaches (feat. Daniel Caesar)", "Stay With Me", "Lagu [MV] {HD}"].map(F.cleanTitle)
        == ["Yellow", "Bohemian Rhapsody", "Komang (Live)", "Peaches", "Stay With Me", "Lagu"])
    ok("artis pertama", ["Lady Gaga, Bruno Mars", "Simon & Garfunkel", "Tulus", "Lil Nas X", "A x B"].map(F.primaryArtist) == ["Lady Gaga", "Simon", "Tulus", "Lil Nas X", "A"])
    ok("judul YouTube \"Artis - Judul\"", F.readings(title: "NOAH - Separuh Aku (Official Music Video)", artist: "Musica Studios").contains(F.Reading(title: "Separuh Aku", artist: "NOAH")))
    func rec(_ t: String, _ a: String, _ d: Double) -> F.Record {
        F.Record(trackName: t, artistName: a, duration: d, instrumental: false, plainLyrics: "la la", syncedLyrics: "[00:01.00]la la")
    }
    func pick(_ r: F.Record, _ t: String, _ a: String, _ d: Double) -> LyricsMatch? { F.pick([r], F.readings(title: t, artist: a), duration: d) }
    ok("artis lain ditolak", pick(rec("Home", "Edward Sharpe", 200), "Home", "Michael Bublé", 200) == nil)
    ok("aksen & VEVO tetap cocok", pick(rec("Déjà Vu", "Beyoncé", 240), "Deja Vu", "BeyonceVEVO", 240)?.synced != nil)
    ok("huruf Jepang cocok", pick(rec("アイドル", "YOASOBI", 213), "アイドル", "YOASOBI", 213)?.synced != nil)
    let far = pick(rec("Yellow", "Coldplay", 267), "Yellow", "Coldplay", 300)
    ok("durasi beda jauh → nggak disinkronin", far != nil && far?.synced == nil && far?.plain == "la la")
    let live = pick(rec("Yellow", "Coldplay", 267), "Yellow (Live)", "Coldplay", 267)
    ok("versi live nggak pakai waktu studio", live != nil && live?.synced == nil)
    ok("tanpa artis: cuma yang persis", pick(rec("Intro", "X", 120), "Intro", "", 128) == nil)

    // Setelan asli user dibalikin habis tes
    let saved = UserDefaults.standard.object(forKey: "lyricMode")
    defer { UserDefaults.standard.set(saved, forKey: "lyricMode") }
    let m = IslandModel()
    m.lyricMode = .always
    m.media = Media(title: "Lagu", artist: "A", duration: 100, playing: true)
    m.lyrics = LyricsResult(key: "lain\nA", state: .ok, match: LyricsMatch(synced: [LyricRow(t: 1, text: "x")]))
    ok("lirik lagu sebelumnya nggak kepakai", m.lyricRows == nil && m.presentation != .lyric)
    m.lyrics = LyricsResult(key: m.media.lyricKey, state: .ok, match: LyricsMatch(synced: [
        LyricRow(t: 1, text: "satu"), LyricRow(t: 4, text: ""), LyricRow(t: 6, text: "dua"), LyricRow(t: 9, text: ""), LyricRow(t: 30, text: "tiga")]))
    ok("sebelum baris pertama: judul", m.lyricLine?.text == "Lagu · A")
    m.lyricIndex = 1
    ok("jeda pendek: baris tadi ditahan", m.lyricLine?.text == "satu")
    m.lyricIndex = 3
    ok("jeda panjang: ♪", m.lyricLine?.text == "♪")
    ok("notch nampilin lirik", m.presentation == .lyric)
    let w = m.size.width
    m.hovering = true
    ok("hover: balik ke judul, notch nggak mengecil", m.presentation == .music && m.size.width >= w)
    m.hovering = false
    m.slim = true
    ok("layar penuh: tetap tipis", m.presentation == .idle)
    m.slim = false
    m.media.playing = false
    ok("dijeda: lirik ilang", m.presentation == .music)
    m.media.playing = true
    m.lyricMode = .hover
    ok("On hover: diem = judul", m.presentation == .music)
    m.hovering = true
    ok("On hover: kursor masuk = lirik, notch nggak mengecil", m.presentation == .lyric && m.size.width >= 248)
    m.lyricMode = .click
    ok("On click: nggak pernah di notch, tetap ada di panel", m.presentation == .music && m.lyricRows != nil)
    m.hovering = false
    ok("On click: diem = judul", m.presentation == .music)
    m.lyricMode = .off
    ok("dimatiin: lirik ilang", m.presentation == .music && m.lyricRows == nil)
    return good
}
