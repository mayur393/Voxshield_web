# VOXSHIELD WEB — FULL BUILD CONTEXT CAPSULE

This is the complete context needed to build the `VoxshieldWeb` repo from scratch, in its own session, independent of `VoxshieldMobile`. Read this fully before writing any code.

---

## 1. What this project is

**Voxshield** — SIH 2026, Problem Statement 26104, "AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks." Team Innovexa. The full product detects AI-cloned/synthetic voices during phone calls and other channels; the actual detection engine and Android app live in a **separate repo, `VoxshieldMobile`**, which this repo does not contain and must not duplicate.

**Voxshield Web is the public-facing website only** — a static, informational site. It explains what Voxshield is, shows the product line, links to download the Mobile app, and shows team/problem-statement information. It contains **no detection logic, no backend, no database**.

Owner: Rucha.

## 2. Housekeeping — repo separation

Some Voxshield Web planning docs (PRD.md, TRD.md, FRONTEND.md, BACKEND_SCHEMA.md, AGENTS.md) were originally drafted while working inside the `VoxshieldMobile` repo's context, by mistake — they belong in `VoxshieldWeb`, not `VoxshieldMobile`. **If any of these files exist inside `VoxshieldMobile`, they should be removed from there** (that repo's own `docs/` already has its own correct set: PRD, TRD, BACKEND_SCHEMA, etc., scoped to the Android app — the web versions are a separate, parallel set for a separate repo, and having both in one place is confusing, not additive). This build should happen in a **fresh `VoxshieldWeb` repo**, not as a subfolder of `VoxshieldMobile`.

## 3. Product scope — what to actually build

Four sections, in this order of priority:

### Section 1 — Hero / Landing (ticket VOX-201)
- Voxshield name/logo, tagline: "AI-Powered Real-Time Voice Cloning Detection"
- One-paragraph problem summary: AI voice cloning lets attackers convincingly impersonate trusted people (executives, officials, family members) over calls, for financial fraud and social engineering; traditional caller-ID/voice-recognition safeguards no longer work.
- Primary call-to-action button scrolling to Products/Download

### Section 2 — Products (ticket VOX-202)
Three cards, each with an **accurate** status badge:
- **Voxshield Mobile** — status: `Built` — "Android app that detects AI-cloned voices during calls, running fully on-device"
- **Voxshield SDK** — status: `Planned` — "API/SDK for banks, telecom, and enterprise integration" — NOT built yet, must not be shown as available
- **Voxshield Web** — status: `You're here` — describe honestly as the informational hub, not a detection tool

### Section 3 — Download (ticket VOX-203)
- Primary "Download APK" button → links to the latest Mobile release build (this link needs to come from whoever owns the Mobile repo/release — if no stable build exists yet, use a clearly labeled placeholder: "APK available at demo — check back soon", never a dead link presented as live)
- SDK download area: "Coming Soon" label only, no functional link

### Section 4 — About/Team (ticket VOX-204)
- Team name: Innovexa
- Team members: [PLACEHOLDER — fill from actual team info, don't invent names]
- Problem Statement: 26104 — AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks
- Organization: AICTE — Cyber Security Cell
- Link to GitHub repo(s)

## 4. Explicitly out of scope for this build

- No backend server, no database, no user accounts, no contact form (unless separately requested later — see Section 7)
- No live detection demo embedded in the site — that's the Mobile app's job
- No browser extension — despite naming similarity in early project planning, "Voxshield Web" is this website only, never the browser extension (a separate, unbuilt, future product)

## 5. Tech stack — locked

| Layer | Technology | Reasoning |
|---|---|---|
| Markup/Styling | Plain HTML5 + CSS3 | No framework overhead needed for a landing page; fastest to finish, zero build-tooling risk |
| Interactivity | Vanilla JS, minimal | Nav toggle, smooth scroll — nothing needing a framework |
| Hosting | GitHub Pages | Free, deploys directly from this repo, no server to keep alive during judging |
| Fonts/Icons | System fonts or one CDN font; simple SVG/icon set | Keep page weight low |

Do not introduce React/Next.js/a build pipeline for this round.

## 6. Folder structure to create

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

## 7. Backend — deliberately none

This is a static site with **no backend, no database, no API of its own**. Document this explicitly in `docs/BACKEND_SCHEMA.md` rather than silently omitting it, so nobody (human or AI) goes looking for a `server/` folder that was never meant to exist. If a future version needs a live demo widget, contact form, or SDK sign-up flow, that requires a deliberate new architecture decision (e.g., a serverless function) and a new version of that doc — do not build this speculatively now.

Any client-side-only state (e.g., a dismissed banner) would use browser `localStorage`, never a server-side store. None of this is implemented as of this capsule.

## 8. Non-functional requirements

- Fast load — no heavy JS frameworks, optimize any images
- Correct rendering at both mobile widths (~375–428px) and desktop (1280px+) — test both, not just a resized desktop window
- No broken links — verify every `<a href>` before merging
- No console errors on load
- Every claim on the page must match the real, current build status of the corresponding Voxshield product — never aspirational

## 9. Git / workflow rules — same discipline as VoxshieldMobile

- Branch: `rucha` (or contributor name) → PR into `dev` → tested → PR from `dev` into `main`. Never push directly to `main`.
- Commit format: `type: summary (VOX-XXX)` — e.g. `feat: add hero section (VOX-201)`
- **Never include any AI tool name** ("Claude," "AI," "cmd," etc.) in commits, PR titles/descriptions, or code comments — permanent rule, not just this sprint
- Branch protection on `main`: require PR before merge, no additional required-approvals overhead needed for this small a team

## 10. Hard rules for whoever/whatever builds this

- Never mark a status badge "Built" without confirming it against the actual `VoxshieldMobile` repo status
- Never invent team member names, accuracy numbers, or dataset details — use `[PLACEHOLDER]` rather than guessing
- Never add a backend/database/API route without an explicit team decision first
- Test on an actual phone browser (not just resized desktop devtools) before marking any section done
- No Lorem Ipsum in a merged PR — use real, even if short, draft copy

## 11. Instruction for the AI session building this

Build the repo structure and four sections above, in priority order, following the tech stack and rules in this capsule. Create the five `docs/` files (`PRD.md`, `TRD.md`, `FRONTEND.md`, `BACKEND_SCHEMA.md`, `AGENTS.md`) using the content and structure summarized in Sections 3–10 of this capsule as their basis — expand them into full standalone docs rather than leaving this capsule as the only record. **Do not build inside or commit to the `VoxshieldMobile` repo** — this is a separate, standalone repository. If equivalent web-planning `.md` files are found inside `VoxshieldMobile`, flag them for removal from that repo rather than treating them as already handled.
