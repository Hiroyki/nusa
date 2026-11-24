<div align="center">

<img src="docs/banner.png" width="100%" alt="Nusa — Dynamic Island for your desktop">

### The Dynamic Island for your desktop

Music, tasks, prayer times, Quran, weather and focus — living in a notch at the top of your screen.
Click it, and it unfolds into a full panel. Free, no account, no ads.

[![Download for Windows](https://img.shields.io/badge/Download-Windows%2010%2F11-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Hiroyki/nusa/releases/latest)
[![Install on macOS](https://img.shields.io/badge/Install-macOS%2014%2B-000000?style=for-the-badge&logo=apple&logoColor=white)](#-install)

[![GitHub stars](https://img.shields.io/github/stars/Hiroyki/nusa?style=flat-square&color=5cdba8&logo=github)](https://github.com/Hiroyki/nusa/stargazers)
[![Downloads](https://img.shields.io/github/downloads/Hiroyki/nusa/total?style=flat-square&color=5cdba8)](https://github.com/Hiroyki/nusa/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-5cdba8?style=flat-square)](#-install)
[![Latest release](https://img.shields.io/badge/release-v1.0.0-5cdba8?style=flat-square)](https://github.com/Hiroyki/nusa/releases/latest)
[![macOS · SwiftUI](https://img.shields.io/badge/macOS-SwiftUI-000000?style=flat-square&logo=apple&logoColor=white)](#-tech-stack)
[![Desktop · Electron](https://img.shields.io/badge/desktop-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](#-tech-stack)

[![Themes](https://img.shields.io/badge/themes-11%20built--in-5cdba8?style=flat-square)](#-themes)
[![Prayer times](https://img.shields.io/badge/prayer%20times-Kemenag%20criteria-5cdba8?style=flat-square)](#-features)
[![License: MIT](https://img.shields.io/badge/license-MIT-5cdba8?style=flat-square)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)](https://github.com/Hiroyki/nusa/issues)
[![Built by Hiroyki](https://img.shields.io/badge/built%20by-Hiroyki-5cdba8?style=flat-square&logo=github&logoColor=white)](https://github.com/Hiroyki)

> **🆕 Just landed:** 📍 **prayer times & weather follow your location automatically**, and ⏭️ **snappier music controls**: mash *Next* as fast as you like. [What's new ↓](#-changelog)

<br>

<img src="docs/demo.gif" width="720" alt="Nusa demo — expanding notch, switching tabs and changing themes">

<sub><b>Expand · switch tabs · swap themes</b> — all in motion.</sub>

<br><br>

**[Download](#-install)** · **[Features](#-features)** · **[Themes](#-themes)** · **[Tips](#-tips--tricks)** · **[Privacy](#-privacy)** · **[Build](#-build-from-source)** · **[FAQ](#-faq)** · **[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia)**

</div>

---

## 📖 Table of contents

- [Why Nusa?](#-why-nusa)
- [Features](#-features)
- [Gallery](#-gallery)
- [Themes](#-themes)
- [Install](#-install)
- [Tips & tricks](#-tips--tricks)
- [Privacy](#-privacy)
- [Tech stack](#-tech-stack)
- [Nusa in numbers](#-nusa-in-numbers)
- [Build from source](#-build-from-source)
- [Project structure](#-project-structure)
- [FAQ](#-faq)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [Support](#-support)
- [Credits](#-credits)
- [License](#-license)
- [Bahasa Indonesia](#-bahasa-indonesia)

## 🤔 Why Nusa?

Most Dynamic-Island / menu-bar companions live only on macOS. **Nusa runs everywhere** — a native
**SwiftUI** app on the Mac and an **Electron** build on Windows & Linux — so you get the same glanceable
notch no matter which machine you're on.

- 🪶 **Quiet by default** — a thin bar at the top edge, out of the way until you need it.
- 🖱️ **Click-through** — everything around the notch passes clicks straight to the app behind it.
- 👀 **Glanceable** — now-playing, next prayer, weather and tasks without stealing focus.
- 📍 **Knows where you are** — prayer times, qibla and weather follow your location, no setup.
- 🎨 **Yours** — 11 hand-tuned themes, one click to switch.
- 🔒 **Local-first** — prayer times are calculated on your device; tasks and settings never leave it. No account, no telemetry. [Details ↓](#-privacy)

## ✨ Features

| | Feature | What it does | Windows | macOS | Linux |
|:--:|---|---|:--:|:--:|:--:|
| 🎵 | **Now Playing** | HD artwork, source-app icon, seek bar, click the cover to jump to the app | ✅ | ✅ | ✅ |
| ▶️ | **Music** | Control whatever app is playing (Spotify, YouTube, Media Player…), or the Senandung queue + search | ✅ | ✅ | ✅ |
| 🎤 | **Lyrics** | Live synced lyrics in the notch for whatever is playing — Spotify, Apple Music, YouTube, VLC… | ✅ | ✅ | ✅ |
| ✅ | **Tasks** | Natural language: *"Rapat QC besok jam 9"*, *"Call Budi in 30 min"* | ✅ | ✅ | ✅ |
| 🎯 | **Focus** | 25-minute focus sessions, breaks, sessions-today counter | ✅ | ✅ | ✅ |
| 🕌 | **Prayer** | Prayer times (Kemenag criteria), qibla, adhan, 10-min reminder | ✅ | ✅ | ✅ |
| 📍 | **Location** | Detects your city automatically (or pick one) for prayer times, qibla & weather | ✅ | — | ✅ |
| 📖 | **Quran** | 114 surahs, ID/EN translation, reciters, last-read bookmark | ✅ | ✅ | ✅ |
| ☁️ | **Weather** | Temp, feels-like, hourly outlook, rain warnings | ✅ | ✅ | ✅ |
| 🗂️ | **Tray** | Drop files on the notch to keep them, drag back out to use | ✅ | ✅ | ✅ |
| 📋 | **Clips** | Clipboard history, one click to copy again | ✅ | ✅ | ✅ |
| 🎨 | **Themes** | 11 built-in looks, switch from the gear menu | ✅ | — | ✅ |
| 🔊 | **System** | Volume, battery, audio-device switch pop-up | ✅ | ✅ | ✅ |
| 📅 | **Calendar** | Today's events + tasks due | ✅ | — | — |
| 🪞 | **Mirror** | Selfie camera, only turns on when you click it | ✅ | ✅ | — |

> Everything around the notch is **click-through**, so it never gets in the way of your browser tabs or the app behind it.

## 📸 Gallery

<div align="center">

| Home | Music |
|:---:|:---:|
| <img src="docs/screens/home.png" width="380"> | <img src="docs/screens/music.png" width="380"> |
| **Tasks** | **Quran** |
| <img src="docs/screens/tasks.png" width="380"> | <img src="docs/screens/quran.png" width="380"> |
| **Prayer** | **Themes** |
| <img src="docs/screens/prayer.png" width="380"> | <img src="docs/screens/themes.png" width="380"> |

</div>

## 🎨 Themes

Nusa ships with **11 hand-picked dark themes** — switch between them instantly from the gear menu ⚙ → **Theme**.
No files, no setup.

| | | |
|---|---|---|
| 🖤 **Classic** | 🌌 **Midnight** | 🌃 **Tokyo Night** |
| ❄️ **Nord** | 🧛 **Dracula** | 🪵 **Gruvbox** |
| 🌹 **Rosé Pine** | 🌇 **Sunset** | 🌲 **Forest** |
| 🌊 **Ocean** | 🩶 **Mono** | |

Each theme recolors the **whole island** — background, accents, chips, dividers and text. The palettes are adapted from
the most-loved editor colour schemes (Nord, Dracula, Tokyo Night, Gruvbox, Rosé Pine) so they look great and stay readable.

<div align="center"><img src="docs/themes.gif" width="640" alt="Cycling through the built-in themes"></div>

## 🚀 Install

<details open>
<summary><b>🪟 Windows 10/11 (64-bit)</b></summary>

Two builds, both per-user (no admin needed):

- **Installer** — `Nusa-Setup-x.y.z.exe`. Run the wizard and **choose where it installs**. Updating? Just run the new
  installer — it closes the running Nusa and keeps your tasks, settings and theme.
- **Portable** — `Nusa-x.y.z-portable.exe`. Drop it anywhere (another drive, a USB stick, a folder of your
  choice) and run it — nothing gets installed.

Grab either from [Releases](https://github.com/Hiroyki/nusa/releases/latest).

> See *"Windows protected your PC"*? Click **More info → Run anyway** — the builds aren't code-signed yet.

</details>

<details>
<summary><b>🍎 macOS 14 Sonoma+ (Apple Silicon & Intel)</b></summary>

Easiest: open **Terminal** and paste:

```sh
curl -fsSL https://raw.githubusercontent.com/Hiroyki/nusa/main/install.sh | sh
```

It downloads `Nusa-macOS.zip` from the latest release, installs it to Applications and launches it.

**Why not just download the zip in a browser?** Nusa isn't signed with an Apple developer account yet, so
macOS blocks browser-downloaded files with *"Apple could not verify Nusa…"*. If you already downloaded it:

1. Move `Nusa.app` to Applications, open it once (you'll get that dialog), click **Done**.
2. Open **System Settings → Privacy & Security** and click **Open Anyway** next to Nusa.
3. Or from Terminal: `xattr -dr com.apple.quarantine /Applications/Nusa.app`

Permissions (Calendar, Camera, Bluetooth) are only requested when a feature needs them.

</details>

<details>
<summary><b>🐧 Linux</b></summary>

- **Ubuntu / Debian:** `sudo apt install ./Nusa-x.y.z-amd64.deb`
- **Any distro:** `chmod +x Nusa-x.y.z-x86_64.AppImage && ./Nusa-x.y.z-x86_64.AppImage`
- Now-playing needs `playerctl` — `sudo apt install playerctl`.

</details>

## 🕹️ Tips & tricks

| Do this | And… |
|---|---|
| **Click** the notch | Opens the panel |
| **Esc** / click away | Closes the panel |
| **Right-click** the notch | Open at login · Quit |
| **⚙ gear** (panel) | Theme · Lyrics · Start at login · Quit |
| **📍 city chip** (Prayer tab) | *Current location* or pick a city |
| **Two-finger swipe** left/right on the notch | Previous / next track |
| **Drag files** onto the notch | Saves them in **Tray** — drag them out to use |
| **Drag the progress bar** | Seek through the track |
| **Click a lyric line** (Music tab) | Jumps to that part of the song |
| **− / +** above the lyrics | Shifts lyrics earlier / later, remembered per app |
| **⚙ gear → Lyrics** | When the notch shows lyrics: *Always*, *On hover*, *On click* (panel only) or *Off* |
| **Drag the volume bar** | Change system volume |
| **Click the album art** | Jumps to the app that's playing |
| **Click the weather chip** | Hourly forecast |
| **📹 button** (Home) | Toggles the camera mirror |
| **Hover** the notch | Expands to show what's playing |

## 🔐 Privacy

No account, no analytics, no ads. Prayer times are calculated **on your device**; tasks, clips, the Tray and
settings never leave it. Nusa only talks to the network for these:

| What | Who | What's sent |
|---|---|---|
| Your location | **Windows Location** (on-device) — or, if that's off, [ipwho.is](https://ipwho.is) | Nothing for Windows Location; your IP for the fallback |
| City name | [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Coordinates rounded to ~1 km |
| Weather | [Open-Meteo](https://open-meteo.com) | Coordinates of your city |
| HD album art | iTunes Search | Song title + artist |
| Lyrics | [LRCLIB](https://lrclib.net) | Song title, artist + length (nothing when Lyrics is *Off*) |
| Quran audio | islamic.network CDN | Which ayah you play |

Don't want auto-location? Pick a city from the 📍 chip in the Prayer tab and Nusa stops asking.
On Windows you can also turn it off in **Settings → Privacy & security → Location**.

## 🧰 Tech stack

| Layer | Built with |
|---|---|
| Native macOS app | **Swift · SwiftUI · AppKit · EventKit · AVFoundation** |
| Desktop app (Win/macOS/Linux) | **Electron · JavaScript · HTML · CSS** |
| Packaging | **electron-builder** (NSIS · DMG · AppImage · DEB) |
| Prayer times | **PrayTimes.org** algorithm with Kemenag RI criteria |
| Weather | **[Open-Meteo](https://open-meteo.com)** |
| Location | **Windows.Devices.Geolocation** (WinRT) · IP fallback · BigDataCloud reverse-geocode |
| Lyrics | **[LRCLIB](https://lrclib.net)** — no account or API key |
| Media control | **Windows SMTC** (WinRT) · MPRIS / `playerctl` on Linux |
| Icons | Hand-drawn SVG — no icon-font dependency |

## 🔢 Nusa in numbers

| 🖥️ Platforms | 🎨 Themes | ✨ Features | 📖 Surahs | 🔑 Accounts |
|:---:|:---:|:---:|:---:|:---:|
| **3** | **11** built-in | **15** | **114** | **0** |

## 🛠️ Build from source

<details>
<summary><b>macOS — native SwiftUI app</b></summary>

```sh
./build.sh            # build, install to ~/Applications and relaunch
./build.sh --no-install
```

Needs Xcode Command Line Tools (`swiftc`, `clang`) and Python 3 + Pillow for the icon.

</details>

<details>
<summary><b>Windows / macOS / Linux — Electron app (with themes)</b></summary>

```sh
cd desktop
npm install          # if Electron didn't download: node node_modules/electron/install.js
npm test             # prayer-time, location, task-parser & lyrics tests
npm start            # development
npm run dist:win     # Windows installer  -> desktop/dist/Nusa-Setup-*.exe
npm run dist:linux   # AppImage + .deb     -> desktop/dist/
npm run dist:mac     # dmg + zip (Intel & Apple Silicon) -> desktop/dist/
```

> **Cross-platform builds.** Each target must be built on its own OS — `.exe` on Windows, `.dmg` on macOS,
> `.AppImage`/`.deb` on Linux. There's no cross-build from Windows.
> [`.github/workflows/desktop.yml`](.github/workflows/desktop.yml) builds them on GitHub Actions
> (push to `main`, a `v*` tag, or manually) and attach the installer **and** the portable `.exe` to the release.
> macOS & Linux are **turned off for now** — only Windows is released.

</details>

## 🗂️ Project structure

| Path | What's inside |
|---|---|
| `Sources/` | Native macOS SwiftUI app (notch, panel, Home/Music/Tasks/Tray/Clips/Prayer/Quran tabs) |
| `helper/` | Now-playing reader — a dylib loaded by `/usr/bin/perl`, since macOS 15.4+ blocks MediaRemote for regular apps |
| `desktop/` | Electron app for **Windows, macOS & Linux**, plus the theme system |
| `assets/` | Adhan audio, Quran data, Arabic fonts — sources & licenses in [`assets/CREDITS.md`](assets/CREDITS.md) |
| `docs/` | Banner, demo GIFs and screenshots used in this README |

## ❓ FAQ

<details>
<summary><b>Is it really free? What's the catch?</b></summary>

It's a personal, open-source project (MIT). No accounts, no telemetry — prayer times, tasks and settings stay local.

</details>

<details>
<summary><b>Why does SmartScreen / Gatekeeper warn me?</b></summary>

Because the builds aren't code-signed yet. On Windows click **More info → Run anyway**; on macOS use the
**Open Anyway** flow or the `xattr` command above.

</details>

<details>
<summary><b>Does the macOS app have themes?</b></summary>

Not yet. Themes currently live in the desktop (Electron) build. Porting them to the native SwiftUI app is on the roadmap.

</details>

<details>
<summary><b>Prayer times show the wrong city. How do I fix it?</b></summary>

Open the **Prayer** tab and click the 📍 chip. Choose **Current location** to let Nusa detect it (it re-checks every
30 minutes, so it follows you when you travel), or pick a city to pin it. If detection is off, make sure
**Settings → Privacy & security → Location** is on — otherwise Nusa falls back to a rougher IP-based guess.

</details>

<details>
<summary><b>Next / Previous does nothing in my music app.</b></summary>

Nusa uses the same media controls as your keyboard's media keys. If the app doesn't show up in the Windows volume
flyout's media panel, it doesn't expose those controls — most do (Spotify, YouTube in any browser, Media Player, VLC, foobar2000…).

</details>

<details>
<summary><b>Why are there no lyrics, or why are they off?</b></summary>

Nusa matches the title, artist and length of what's playing against [LRCLIB](https://lrclib.net). Very new or obscure songs
may not be there yet. If your version's length differs a lot (a YouTube video with a long intro, say), the Music tab shows
plain lyrics and the notch stays quiet. If they're slightly early or late, use **− / +** above the lyrics.

</details>

<details>
<summary><b>Can I import my own theme?</b></summary>

Not anymore — custom imports were dropped in favour of 11 carefully tuned built-in themes that always stay readable.
Have a palette you love? [Open an issue](https://github.com/Hiroyki/nusa/issues) and it might become #12.

</details>

<details>
<summary><b>Why is the notch sometimes invisible?</b></summary>

It fades out of the way when a screen-recording toolbar or a share bar appears in the top-center, so it never blocks them.

</details>

## 🗺️ Roadmap

- [x] Windows / macOS / Linux desktop apps
- [x] Themes — 11 built-in
- [x] Automatic location for prayer times & weather (Windows & Linux)
- [x] Synced lyrics in the notch
- [ ] Automatic location on the native macOS app
- [ ] Themes on the native macOS app
- [ ] Search any city worldwide
- [ ] Code-signed installers
- [ ] Homebrew & winget packages

## 🤝 Contributing

Ideas, bug reports and PRs are all welcome!

1. **Found a bug or have an idea?** [Open an issue](https://github.com/Hiroyki/nusa/issues).
2. **Want to build something?** Fork the repo, make your change, run `cd desktop && npm test`, and open a PR.
3. **Have a palette you love?** Share the colours in an issue — the best ones become built-in themes.

## 📝 Changelog

<details open>
<summary><b>Latest — lyrics, location & music</b></summary>

- 🎤 **Lyrics** — the line being sung shows in the notch, and the whole song in the Music tab (click a line to jump there).
  Works with any app Nusa can see playing; choose when they appear from ⚙ → *Lyrics*.
- 📍 **Automatic location** — prayer times, qibla and weather follow where you are (Windows Location, with an IP
  fallback). Pick a city any time from the 📍 chip; *Current location* is the new default.
- ⏭️ **Snappier music controls** — Next / Previous / Play / Seek respond instantly, even when you click several times
  in a row, and always go to the app shown in the notch (no more skipping the wrong player when two are open).
- 🎶 **Senandung** — Next / Previous now work on the Senandung queue too.
- 🪟 **Installer** — updating over a running Nusa just works; releases ship the portable `.exe` as well.
- 🧹 README cleaned up — accurate theme list, new Privacy section, Indonesian summary.

</details>

<details>
<summary><b>v1.0.0 — themes, everywhere</b></summary>

- 🎨 **Themes** — 11 built-in looks, from Classic to Tokyo Night, Nord, Dracula and Rosé Pine.
- 🎛️ Themes recolor the whole island — background, accents, chips and text.
- 🪟 New **Windows installer** built automatically via GitHub Actions.
- 📖 This README — banner, animated demos, gallery, FAQ and more.

</details>

## 💚 Support

If Nusa makes your desktop a little nicer:

- ⭐ **Star this repo** — it genuinely helps.
- 🐛 [Report a bug](https://github.com/Hiroyki/nusa/issues) or request a feature.
- 📣 Share it with a friend who'd like a Dynamic Island on their PC.

## 🙏 Credits

- **Prayer times** — [PrayTimes.org](http://praytimes.org) algorithm, Kemenag RI criteria (Fajr 20°, Isha 18°, Asr Shafi'i).
- **Quran text, translation & reciters** — see [`assets/CREDITS.md`](assets/CREDITS.md).
- **Weather** — [Open-Meteo](https://open-meteo.com).
- **Lyrics** — [LRCLIB](https://lrclib.net).
- **Location names** — [BigDataCloud](https://www.bigdatacloud.com) reverse geocoding · IP fallback by [ipwho.is](https://ipwho.is).
- **Icons** — hand-drawn SVG, no icon-font dependency.
- Built & maintained by **[Hiroyki](https://github.com/Hiroyki)** (Quraish Rahmatulloh).

## 📄 License

The code is released under the [MIT License](LICENSE) — use it, fork it, learn from it.
Bundled assets (adhan audio, Quran text & translations, Arabic fonts) keep their own licenses; see
[`assets/CREDITS.md`](assets/CREDITS.md).

## 🇮🇩 Bahasa Indonesia

**Nusa** = Dynamic Island buat desktop kamu. Notch kecil di tengah atas layar yang isinya lagu yang lagi diputer,
jadwal sholat (kriteria **Kemenag RI**), kiblat, Al-Qur'an 114 surah + terjemahan Indonesia, cuaca, tugas, dan fokus.

- 📍 **Lokasi otomatis** — jadwal sholat & cuaca langsung ikut kota kamu, nggak perlu setting.
- 🎵 **Kontrol musik** — Spotify, YouTube, Media Player, apa aja; klik *Next* berkali-kali tetap lancar.
- 🎤 **Lirik di notch** — jalan bareng lagunya, dari Spotify, Apple Music, YouTube, atau app lain.
- ✅ **Tugas pakai bahasa sehari-hari** — *"Rapat QC besok jam 9"*, *"minum obat 30 menit lagi"*.
- 🕌 **Adzan & pengingat** 10 menit sebelum waktu sholat.
- 🔒 Gratis, tanpa akun, tanpa iklan.

**[⬇️ Download untuk Windows](https://github.com/Hiroyki/nusa/releases/latest)** — muncul *"Windows protected your PC"*?
Klik **More info → Run anyway** (installer-nya belum ditandatangani).

Kalau suka, kasih ⭐ ya — bantu banget biar makin banyak yang tahu!

## ⭐ Star history

<a href="https://star-history.com/#Hiroyki/nusa&Date">
  <img src="https://api.star-history.com/svg?repos=Hiroyki/nusa&type=Date" width="600" alt="Star history of Hiroyki/nusa">
</a>

<div align="center">

---

<img src="docs/logo.png" width="48" alt="Nusa">

<sub>Made with ☕ — hope it's useful. If you like it, a ⭐ helps a lot.</sub>

</div>
