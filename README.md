# Nusa

Dynamic Island buat MacBook: notch di tengah menu bar yang nampilin lagu, pengingat tugas, waktu sholat, cuaca, dan fokus, lalu kebuka jadi panel kalau diklik.

## Pasang

### macOS (14 Sonoma atau lebih baru, Apple Silicon & Intel)

Paling gampang, buka **Terminal** lalu tempel:

```sh
curl -fsSL https://raw.githubusercontent.com/MrColdZs/nusa/main/install.sh | sh
```

Script itu ngunduh `Nusa-macOS.zip` dari Release, masang ke Applications, terus buka Nusa.

**Kenapa nggak cukup unduh zip dari browser?** Nusa belum ditandatangani pakai akun developer Apple, jadi file dari browser
diblok macOS dengan pesan *"Apple could not verify Nusa…"*. Kalau udah terlanjur unduh zip-nya:

1. Pindahin `Nusa.app` ke folder Applications, buka sekali (bakal muncul pesan itu), klik **Done**.
2. Buka **System Settings → Privacy & Security**, scroll ke bawah, klik **Open Anyway** di baris Nusa, masukin password.
3. Atau lewat Terminal: `xattr -dr com.apple.quarantine /Applications/Nusa.app`

Pas pertama jalan, macOS bisa minta izin (Kalender, Kamera, Bluetooth) cuma kalau fitur itu dipakai.

### Windows 10/11

Unduh `Nusa-Setup-x.y.z.exe` dari [Releases](https://github.com/MrColdZs/nusa/releases/latest), jalanin wizard-nya.
Kalau muncul *"Windows protected your PC"*, klik **More info → Run anyway** (installer belum ditandatangani).

### Linux

- Ubuntu/Debian: `sudo apt install ./Nusa-x.y.z-amd64.deb`
- Distro lain: `chmod +x Nusa-x.y.z-x86_64.AppImage && ./Nusa-x.y.z-x86_64.AppImage`
- Info lagu butuh `playerctl` (`sudo apt install playerctl`).

## Build (macOS)

```sh
./build.sh            # build, pasang ke ~/Applications, buka ulang
./build.sh --no-install
```

Butuh Xcode Command Line Tools (swiftc, clang) dan Python 3 + Pillow buat ikon.

## Isi

- `Sources/` — app SwiftUI (notch, panel, tab Home/Music/Tasks/Tray/Clips/Prayer/Quran)
- `helper/` — pembaca Now Playing (dylib yang dimuat `/usr/bin/perl`, karena macOS 15.4+ ngeblok MediaRemote buat app biasa)
- `assets/` — adzan, data Quran, font Arab; sumber & lisensinya di `assets/CREDITS.md`
- `desktop/` — versi Windows, macOS & Linux (Electron)

## Windows, macOS & Linux (`desktop/`)

Versi Electron, logikanya sama dengan versi Mac (jadwal sholat, Quran, tugas, fokus, cuaca), plus tema sendiri.

```sh
cd desktop
npm install          # di Mac ini: kalau Electron belum keunduh, jalanin node node_modules/electron/install.js
npm test             # tes jadwal sholat & pembaca tugas
npm start            # jalanin buat development
npm run dist:win     # installer Windows (wizard)  -> desktop/dist/Nusa-Setup-*.exe
npm run dist:linux   # AppImage + .deb             -> desktop/dist/
npm run dist:mac     # dmg + zip (Intel & Apple Silicon) -> desktop/dist/
```

> **Build lintas sistem.** Tiap target harus dibuild di sistem yang sesuai: `.exe` di Windows,
> `.dmg` di macOS, `.AppImage`/`.deb` di Linux. Nggak bisa silang dari Windows.
> Workflow [`.github/workflows/desktop.yml`](.github/workflows/desktop.yml) bikin ketiganya otomatis
> di GitHub Actions (tiap push ke `main`, tag `v*`, atau manual).
>
> Buat sementara target **macOS & Linux dimatikan** dulu (cuma Windows yang dirilis).
> Mau dinyalain lagi: hapus komentar di baris matrix `ubuntu-latest` & `macos-latest` di workflow itu.


Di Windows & Linux notch-nya mode tipis di tepi atas (biar nggak nutup tab browser), membesar pas di-hover.
Info lagu: Windows dari media controls sistem, Linux dari `playerctl` (MPRIS), cadangannya antrean Senandung.

### Tema sendiri

Nusa punya beberapa tema bawaan (Classic, Midnight, Sunset, Forest, Rosé, Mono, Grape, Ocean).
Bisa juga bikin tema sendiri: file `.json` kecil berisi warna, lalu impor lewat gerigi ⚙ → **Import theme…**,
klik-kanan notch, menu tray, atau drop file-nya langsung ke notch. Contoh & format lengkapnya di
[`desktop/themes/`](desktop/themes/README.md).
