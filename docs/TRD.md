# TRD — Voxshield Web

## 1. Architecture overview

```
┌─────────────────────────────────────┐
│         STATIC WEBSITE (no backend)   │
│                                        │
│  index.html                           │
│    ├── css/styles.css                 │
│    ├── js/main.js  (minor interactivity│
│    │      — nav toggle, smooth scroll)│
│    └── assets/ (images, icons, logo)  │
└─────────────────────────────────────┘
              │
              ▼
      GitHub Pages (static hosting)
```

## 2. Tech stack (locked)

| Layer | Tech | Reasoning |
|---|---|---|
| Markup/Styling | Plain HTML5 + CSS3 | No framework overhead needed for a landing page; fastest to finish, zero build tooling risk |
| Interactivity | Vanilla JS (minimal) | Nav toggle, smooth scroll, maybe a simple status-badge render — nothing that needs a framework |
| Hosting | GitHub Pages | Free, deploys directly from this repo, no server to manage or keep alive during judging |
| Fonts/Icons | System fonts or a single CDN font (e.g., Google Fonts), simple SVG/icon set | Keep page weight low, avoid dependency bloat |

No React/Next.js/build pipeline for this round — see PRD.md for reasoning. Revisit only if the team has spare time and wants a richer site after core scope is done.

## 3. Folder structure

```
VoxshieldWeb/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── logo.svg
│   └── (other images/icons)
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── FRONTEND.md
│   ├── BACKEND_SCHEMA.md
│   └── AGENTS.md
└── README.md
```

## 4. Page sections (maps to PRD scope)

1. **Hero / Landing** (VOX-201) — Voxshield name, tagline, problem statement one-liner, CTA button to Products/Download
2. **Products** (VOX-202) — 3 cards: Mobile (built), SDK (planned), Web (this site) — each with a status badge
3. **Download** (VOX-203) — APK download button/link; SDK section says "Coming Soon"
4. **About/Team** (VOX-204) — team name (Innovexa), members, PS 26104 info, link to GitHub

## 5. Non-functional requirements

- Page must load fast — no heavy JS frameworks, optimize any images used
- Must render correctly at common mobile widths (375px–428px) and desktop (1280px+) — test both before calling any section done
- No broken links — verify every `<a href>` before merging into `dev`
- No console errors on load — check browser dev tools before marking a ticket done

## 6. Deployment

See `README.md` — GitHub Pages, deployed from `main`, root folder. No environment variables, no secrets, no server config needed.
