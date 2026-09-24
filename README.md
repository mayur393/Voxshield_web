# Voxshield Web

The public, informational website for **Voxshield** — Team Innovexa, Smart India Hackathon 2026,
Problem Statement 26104: *AI-Powered Real-Time Detection and Prevention of Voice Cloning
Impersonation Attacks.*

This repo is the website only. It contains **no detection engine, no backend, no database, and no
user accounts** — see [docs/BACKEND_SCHEMA.md](docs/BACKEND_SCHEMA.md) for why that is deliberate.
The actual product (Android app + detection engine) lives in the separate `VoxshieldMobile` repo,
which is the source of truth for anything the site claims about Voxshield's capabilities.

## What's on the site

Eleven static pages sharing one design system (black canvas, one looping background video, Inter for
UI, a dot-matrix display face for headlines, white pill navigation):

- **`index.html`** — the full story in one scroll: hero, the problem, why detection alone is not
  enough, **what VoxShield claims**, architecture, the pipeline, the gate, verdicts, risk profiles,
  products, **current stage**, how it is built, and what can be measured.
- **`products.html`** — Mobile (`Built`), Console (`Built`), SDK (`Planned`), Assistant (`Built`).
- **`technology.html`** — the twelve-stage pipeline, models, precondition gate, validation gate,
  risk fusion, verdicts, risk profiles and the audit chain.
- **`benchmarks.html`** — speed, capacity and build numbers, why no accuracy figure is published,
  and the list of things the project does not claim.
- **`security.html`** — offline architecture, privacy posture, authentication and roles.
- **`console.html`** — the Console tour, the enterprise layer, sign-in flow and build state.
- **`docs.html`** — documentation hub with sidebar navigation.
- **`sih.html`** — the six-slide SIH submission as a scrolling flip-stack deck: problem statement,
  solution vs existing approaches, technical approach, feasibility, impact and references. This is
  the page the "know more" link at the end of the deck points to.
- **`components.html`** — the internal design-system reference.
- **`contact.html`** — Team Innovexa, problem statement, roster placeholders.
- **`workflow.html`** — how VoxShield Mobile checks a call, stage by stage.

Two claim rules the site is held to: **no accuracy percentage is published anywhere**, and **no
language coverage is claimed**. The landing page keeps "what we claim" and "where the project
actually is" in two separate, clearly labelled sections.

Shared assets: `styles.css` (tokens, header, hero), `pages.css` (the design system), `main.js`
(menu, scroll reveal, annotated text, circuit diagrams, icon belt), `ascii.js` (Canvas2D
ASCII/dither renderer).

## Stack

Plain HTML5 + CSS3 + a small amount of vanilla JavaScript. No framework, no build step, no
dependencies. Hosted on GitHub Pages.

```
.
├── index.html
├── products.html
├── technology.html
├── benchmarks.html
├── security.html
├── console.html
├── docs.html
├── sih.html
├── components.html
├── contact.html
├── workflow.html
├── styles.css
├── pages.css
├── main.js
├── ascii.js
├── assets/logo.webp
├── fonts/GeistPixel-Circle.woff2
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── FRONTEND.md
│   └── BACKEND_SCHEMA.md
├── AGENTS.md
├── VOXSHIELD_WEB_CONTEXT_CAPSULE.md
└── README.md
```

## Run locally

Because the site is static, any static file server works. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly in a browser also works.

## Deploy

GitHub Pages, deployed from `main`, root folder. No environment variables, no secrets, no server
configuration.

## Rules for this repo

- Never label a product `Built` unless that is confirmed against the `VoxshieldMobile` repo.
- Never invent team member names, accuracy numbers, or dataset details — use `[PLACEHOLDER]`.
- Never publish an accuracy percentage or claim language coverage; both are deliberate omissions.
- Do not add a backend, database, or API route without an explicit team decision.
- Keep the stack plain HTML/CSS/JS; do not introduce a framework.
- Test at mobile (~375px) and desktop (1280px+) widths before calling a section done.
- No AI tool names in commits, PRs, or code comments.

Commit format: `type: summary (VOX-XXX)`, e.g. `feat: add hero section (VOX-201)`.
Branch flow: `name` → PR into `dev` → tested → PR from `dev` into `main`.
