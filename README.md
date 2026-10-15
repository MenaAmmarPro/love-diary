# Our Diary — Love for Mena

One small entry for each day, with a prompt that changes daily. Write how the day
felt, read back through it, and find the two of you in the margins. Part of the
**Love for Mena** collection.

**Live:** https://menaammarpro.github.io/love-diary/

## What it does

- A **daily prompt** chosen for the date
- Write **one entry a day** (with an optional mood); saving again updates today
- A **timeline** of every page written, newest first
- A **day streak** for consecutive days kept
- Delete any page, or empty the whole diary
- Everything is stored on the device only — no tracking, no network calls
- Installable PWA with offline support

## How it works

Entries live in `localStorage` on that device. To change the prompts, edit the
`PROMPTS` array at the top of `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (the timeline)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — diary logic
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
