# Nusa themes

A theme is just a small `.json` — or `.css` — file. Import it from any of these:

- ⚙️ gear icon in the panel → **Import theme…**
- 🖱️ right-click the notch → **Import theme…**
- 🗂️ system tray menu → **Import theme…**
- 📥 **drop the file straight onto the notch**

Imported themes are saved to `%APPDATA%\Nusa\themes\` (Windows) and used right away.
Go back to the default look with **Theme → Reset to Classic**.

## JSON format

```json
{
  "name": "Neon",
  "colors": {
    "mint": "#39ff14",
    "green": "#2bd65f",
    "rest": "#ffd23f",
    "late": "#ff4d6d",
    "bg": "#070b07",
    "dim": "rgba(255,255,255,0.55)",
    "faint": "rgba(255,255,255,0.38)",
    "line": "rgba(255,255,255,0.12)",
    "chip": "rgba(255,255,255,0.08)",
    "chip2": "rgba(255,255,255,0.16)"
  },
  "font": "'Segoe UI', system-ui, sans-serif",
  "css": "/* optional — raw CSS */"
}
```

| Field | What it does |
|---|---|
| `name` | Theme name (shown in the menu). Optional — falls back to the filename. |
| `colors` / `vars` | **Any keys you want.** Each key becomes a CSS variable `--<key>`. Use `mint`, `bg`, … or your own custom variable. |
| `background` | Image file (relative to the themes folder) used as the island wallpaper (optional). |
| `font` | UI font (optional). |
| `css` | Raw CSS injected into the page (optional) — this is where you can change borders, shadows, sizes, anything. |

## Image themes (wallpaper)

Drop a **`.png`** or **`.jpg`** on the notch (or gear ⚙ → **Import theme…**) and it becomes the island
background. Nusa copies the image into the themes folder (resized to max 1920 px) and creates a theme entry:

```json
{ "name": "My Wallpaper", "colors": {}, "background": "my-wallpaper.png" }
```

You can edit that JSON to add colours, a font, or raw CSS on top of the image. To dim the wallpaper behind
the text, set the `bg-dim` variable (0–1):

```json
{ "name": "My Wallpaper", "colors": { "bg-dim": "0.5" }, "background": "my-wallpaper.png" }
```

## CSS format

Want full control? Import a `.css` file directly:

```css
:root {
  --mint: #39ff14;
  --bg: #070b07;
}
.island {
  box-shadow: 0 0 26px rgba(57, 255, 20, 0.28);
}
```

Built-in variables: `--mint`, `--late`, `--rest`, `--green`, `--bg`, `--text`, `--dim`, `--faint`,
`--line`, `--chip`, `--chip2`, `--appfont`.

## Safety limits

- Variable values can't contain `;`, `{`, `}`, `<`, `>` or `url()`, and must be short.
- Raw CSS is capped at ~40 KB and can't contain `</style`.
- Values are applied with `CSSStyleSheet`/`style` APIs, so they stay scoped to the app window.

See `example.json` and `example.css` to get started. Light themes aren't fully supported yet —
keep the background dark so text stays readable (unless you override the text colours yourself).
