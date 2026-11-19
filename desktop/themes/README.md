# Tema Nusa

Tema itu cuma file `.json` kecil. Bikin satu, terus impor lewat salah satu cara ini:

- Panel Nusa → ikon gerigi (⚙) → **Import theme…**, atau
- Klik-kanan notch / menu tray → **Import theme…**, atau
- Drop file `.json`-nya langsung ke notch.

Tema yang diimpor disimpan di `%APPDATA%\Nusa\themes\` (Windows) dan langsung dipakai. Balik ke tema bawaan lewat gerigi → **Theme** → **Reset to Classic**.

## Format

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
  "font": "'Segoe UI', system-ui, sans-serif"
}
```

Semua field opsional — yang nggak diisi pakai nilai bawaan (tema hitam).

| Field | Buat apa |
| --- | --- |
| `mint` | Warna aksen utama (tab aktif, tombol, sorotan) |
| `green` | Baterai penuh / status oke |
| `rest` | Warna istirahat / tugas |
| `late` | Peringatan, baterai lemah, tugas telat |
| `bg` | Latar notch & panel |
| `dim` / `faint` | Teks sekunder |
| `line` | Garis pemisah |
| `chip` / `chip2` | Latar tombol kecil & chip |
| `font` | Font UI (nama font lokal) |

Nilai harus berupa warna CSS yang sah (`#rrggbb`, `rgb()`, `hsl()`, nama warna). `url()`, `;`, `{`, `}` ditolak.

Lihat `example.json` buat mulai. Tema terang belum didukung penuh — pakai latar gelap biar teks tetap kebaca.
