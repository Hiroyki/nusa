<div align="center">

<img src="docs/banner.png" width="100%" alt="Nusa — Dynamic Island for your desktop">

### The Dynamic Island for your desktop

Music, tasks, prayer times, Quran, weather and focus — living in a notch at the top of your screen.
Click it, and it unfolds into a full panel.

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-5cdba8?style=flat-square)](#-install)
[![Latest release](https://img.shields.io/badge/release-v1.0.0-5cdba8?style=flat-square)](https://github.com/Hiroyki/nusa/releases/latest)
[![macOS · SwiftUI](https://img.shields.io/badge/macOS-SwiftUI-000000?style=flat-square&logo=apple&logoColor=white)](#-tech-stack)
[![Desktop · Electron](https://img.shields.io/badge/desktop-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](#-tech-stack)

[![Themes](https://img.shields.io/badge/themes-8%20%2B%20your%20own-5cdba8?style=flat-square)](desktop/themes/README.md)
[![Prayer times](https://img.shields.io/badge/prayer%20times-Kemenag%20criteria-5cdba8?style=flat-square)](#-features)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)](https://github.com/Hiroyki/nusa/issues)
[![Built by Hiroyki](https://img.shields.io/badge/built%20by-Hiroyki-5cdba8?style=flat-square&logo=github&logoColor=white)](https://github.com/Hiroyki)

> **🆕 v1.0.0 — bring your own theme.** 8 built-in looks, plus import your own `.json`. [See how ↓](#-themes)

<br>

<img src="docs/demo.gif" width="720" alt="Nusa demo — expanding notch, switching tabs and changing themes">

<sub><b>Expand · switch tabs · swap themes</b> — all in motion.</sub>

<br><br>

**[Download](#-install)** · **[Features](#-features)** · **[Themes](#-themes)** · **[Tips](#-tips--tricks)** · **[Build](#-build-from-source)** · **[FAQ](#-faq)**

</div>

---

## 📖 Table of contents

- [Why Nusa?](#-why-nusa)
- [Features](#-features)
- [Gallery](#-gallery)
- [Themes](#-themes)
- [Install](#-install)
- [Tips & tricks](#-tips--tricks)
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

## 🤔 Why Nusa?

Most Dynamic-Island / menu-bar companions live only on macOS. **Nusa runs everywhere** — a native
**SwiftUI** app on the Mac and an **Electron** build on Windows & Linux — so you get the same glanceable
notch no matter which machine you're on.

- 🪶 **Quiet by default** — a thin bar at the top edge, out of the way until you need it.
- 🖱️ **Click-through** — everything around the notch passes clicks straight to the app behind it.
- 👀 **Glanceable** — now-playing, next prayer, weather and tasks without stealing focus.
- 🎨 **Yours** — pick one of 8 themes or bring your own in a few seconds.
- 🔒 **Local-first** — prayer times, tasks and settings stay on your device. No account, no telemetry.

## ✨ Features

| | Feature | What it does | Windows | macOS | Linux |
|:--:|---|---|:--:|:--:|:--:|
| 🎵 | **Now Playing** | HD artwork, source-app icon, seek bar, click the cover to jump to the app | ✅ | ✅ | ✅ |
| ▶️ | **Music** | Senandung queue + search, or control whatever app is playing | ✅ | ✅ | ✅ |
| ✅ | **Tasks** | Natural language: *"Rapat QC besok jam 9"*, *"Call Budi in 30 min"* | ✅ | ✅ | ✅ |
| 🎯 | **Focus** | 25-minute focus sessions, breaks, daily streak | ✅ | ✅ | ✅ |
| 🕌 | **Prayer** | Prayer times (Kemenag criteria), qibla, adhan, 10-min reminder | ✅ | ✅ | ✅ |
| 📖 | **Quran** | 114 surahs, ID/EN translation, reciters, last-read bookmark | ✅ | ✅ | ✅ |
| ☁️ | **Weather** | Temp, feels-like, hourly outlook, rain warnings | ✅ | ✅ | ✅ |
| 🗂️ | **Tray** | Drop files on the notch to keep them, drag back out to use | ✅ | ✅ | ✅ |
| 📋 | **Clips** | Clipboard history, one click to copy again | ✅ | ✅ | ✅ |
| 🎨 | **Themes** | 8 built-in looks + import your own `.json` | ✅ | — | ✅ |
| 🔊 | **System** | Volume, battery, audio-device switch pop-up | ✅ | ✅ | ✅ |
| 📅 | **Calendar** | Today's events + tasks due | ✅ | — | — |
| 🪞 | **Mirror** | Selfie camera, only turns on when you click it | ✅ | ✅ | — |

> On Windows & Linux the notch is a **slim bar** at the very top so it never covers your browser tabs — it grows as your cursor gets close.

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

Nusa ships with **8 built-in themes** — **Classic · Midnight · Sunset · Forest · Rosé · Mono · Grape · Ocean** —
and you can bring your own.

<div align="center"><img src="docs/themes.gif" width="640" alt="Cycling through the 8 built-in themes"></div>

A theme is just a small `.json` file. Import it from any of these:

- ⚙️ gear icon in the panel → **Import theme…**
- 🖱️ right-click the notch → **Import theme…**
- 🗂️ system tray menu → **Import theme…**
- 📥 **drop a `.json`, `.css`, `.png` or `.jpg` straight onto the notch**

🖼️ **Wallpaper themes:** import a **`.png` or `.jpg`** and it becomes the island background — blurred and scrimmed
so text stays readable. Tune it with the `bg-dim` (darkness) and `wall-blur` (softness) variables.

> 🧪 **Want a head start?** Download
> **[`nusa-example-theme.json`](https://github.com/Hiroyki/nusa/releases/download/v1.0.0/nusa-example-theme.json)**,
> change the colors, then import it.

```json
{
  "name": "Neon",
  "colors": { "mint": "#39ff14", "bg": "#070b07", "late": "#ff4d6d" },
  "font": "'Segoe UI', system-ui, sans-serif"
}
```

**Fully yours.** Every key under `colors` (or `vars`) becomes a CSS variable — use the built-ins or invent your own.
You can also drop in raw CSS with the `css` field, import a **`.css` file directly**, or use a **`.png`/`.jpg`** as a
wallpaper background (the import dialog accepts `.json`, `.css`, `.png` and `.jpg`). Switch back any time with **Theme → Reset to Classic**. Full format, examples and
safety limits in [`desktop/themes/`](desktop/themes/README.md).

## 🚀 Install

<details open>
<summary><b>🪟 Windows 10/11 (64-bit)</b></summary>

Two builds, both per-user (no admin needed):

- **Installer** — `Nusa-Setup-x.y.z.exe`. Run the wizard and **choose where it installs**.
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
| **Right-click** the notch | Open at login · Import theme · Quit |
| **Two-finger swipe** left/right on the notch | Previous / next track |
| **Drag files** onto the notch | Saves them in **Tray** — drag them out to use |
| **Drag the progress bar** | Seek through the track |
| **Drag the volume bar** | Change system volume |
| **Click the album art** | Jumps to the app that's playing |
| **Click the weather chip** | Hourly forecast |
| **📹 button** (Home) | Toggles the camera mirror |
| **Hover** the notch | Expands to show what's playing |

## 🧰 Tech stack

| Layer | Built with |
|---|---|
| Native macOS app | **Swift · SwiftUI · AppKit · EventKit · AVFoundation** |
| Desktop app (Win/macOS/Linux) | **Electron · JavaScript · HTML · CSS** |
| Packaging | **electron-builder** (NSIS · DMG · AppImage · DEB) |
| Prayer times | **PrayTimes.org** algorithm with Kemenag RI criteria |
| Weather | **[Open-Meteo](https://open-meteo.com)** |
| Icons | Hand-drawn SVG — no icon-font dependency |

## 🔢 Nusa in numbers

| 🖥️ Platforms | 🎨 Themes | ✨ Features | 📖 Surahs | 🔑 Accounts |
|:---:|:---:|:---:|:---:|:---:|
| **3** | **8** built-in | **13** | **114** | **0** |

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
npm test             # prayer-time & task-parser tests
npm start            # development
npm run dist:win     # Windows installer  -> desktop/dist/Nusa-Setup-*.exe
npm run dist:linux   # AppImage + .deb     -> desktop/dist/
npm run dist:mac     # dmg + zip (Intel & Apple Silicon) -> desktop/dist/
```

> **Cross-platform builds.** Each target must be built on its own OS — `.exe` on Windows, `.dmg` on macOS,
> `.AppImage`/`.deb` on Linux. There's no cross-build from Windows.
> [`.github/workflows/desktop.yml`](.github/workflows/desktop.yml) builds them on GitHub Actions
> (push to `main`, a `v*` tag, or manually). macOS & Linux are **turned off for now** — only Windows is released.

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

It's a personal project. No accounts, no telemetry — prayer times, tasks and settings stay local.

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
<summary><b>Where are my custom themes stored?</b></summary>

In the app's user-data folder — on Windows `%APPDATA%\Nusa\themes\`.

</details>

<details>
<summary><b>Why is the notch sometimes invisible?</b></summary>

It fades out of the way when a screen-recording toolbar or a share bar appears in the top-center, so it never blocks them.

</details>

## 🗺️ Roadmap

- [x] Windows / macOS / Linux desktop apps
- [x] Themes — 8 built-in + import your own
- [ ] Themes on the native macOS app
- [ ] Curated theme gallery
- [ ] Custom prayer-time locations
- [ ] Code-signed installers
- [ ] Homebrew & winget packages

## 🤝 Contributing

Ideas, bug reports and PRs are all welcome!

1. **Found a bug or have an idea?** [Open an issue](https://github.com/Hiroyki/nusa/issues).
2. **Want to build something?** Fork the repo, make your change, run `cd desktop && npm test`, and open a PR.
3. **Made a nice theme?** Share the `.json` in an issue — I'd love to feature it.

## 📝 Changelog

<details>
<summary><b>v1.0.0 — themes, everywhere</b></summary>

- 🎨 **Themes** — 8 built-in looks plus importing your own `.json` (gear menu, notch right-click, tray, or drag-and-drop onto the notch).
- 🎛️ Themes recolor the whole island — background, accents, chips, even the font.
- 🪟 New **Windows installer** built automatically via GitHub Actions.
- 📖 This README — banner, animated demos, gallery, FAQ and more.

</details>

## 💚 Support

If Nusa makes your desktop a little nicer:

- ⭐ **Star this repo** — it genuinely helps.
- 🐛 [Report a bug](https://github.com/Hiroyki/nusa/issues) or request a feature.
- 🎨 Share a theme you made.

## 🙏 Credits

- **Prayer times** — [PrayTimes.org](http://praytimes.org) algorithm, Kemenag RI criteria (Fajr 20°, Isha 18°, Asr Shafi'i).
- **Quran text, translation & reciters** — see [`assets/CREDITS.md`](assets/CREDITS.md).
- **Weather** — [Open-Meteo](https://open-meteo.com).
- **Icons** — hand-drawn SVG, no icon-font dependency.
- Built & maintained by **[Hiroyki](https://github.com/Hiroyki)** (Quraish Rahmatulloh).

<div align="center">

---

<img src="docs/logo.png" width="48" alt="Nusa">

<sub>Made with ☕ — hope it's useful. If you like it, a ⭐ helps a lot.</sub>

</div>
