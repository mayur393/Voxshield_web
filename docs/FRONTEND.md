# Frontend — Voxshield Web (Spec, Rules & Tasks)

## Owner

Rucha — full frontend scope for this repo (there is no separate "backend" person; see `BACKEND_SCHEMA.md` for why).

## Section-by-section spec

### 1. Hero / Landing (VOX-201)
- Voxshield name/logo, tagline: "AI-Powered Real-Time Voice Cloning Detection"
- One-paragraph problem summary (voice cloning + impersonation fraud — see PRD.md for the exact framing already used in project docs, keep it consistent)
- A primary call-to-action button ("See the Products" or "Download") scrolling to the Products/Download section

### 2. Products (VOX-202)
Three cards, consistent layout, each with a status badge:
- **Voxshield Mobile** — status: `Built` (green) — short description, "Android app that detects AI-cloned voices during calls"
- **Voxshield SDK** — status: `Planned` (amber/grey) — short description, "API/SDK for banks, telecom, and enterprise integration"
- **Voxshield Web** — status: `You're here` — this website itself, described honestly as the informational hub, not a detection tool

**Rule:** the status badge is not decorative — it must accurately reflect real build status. Check with the Mobile team chat before changing any badge from Planned to Built.

### 3. Download (VOX-203)
- Primary button: "Download APK" → links to the latest release build (coordinate with Mayur's chat for the actual release link/file once available)
- If no stable release exists yet at time of building this section, use a clearly-labeled placeholder: "APK available at demo — check back soon" rather than a dead/broken link
- SDK download area: "Coming Soon" label, no functional link needed

### 4. About/Team (VOX-204)
- Team name: Innovexa
- Team members: [fill in from project docs]
- Problem Statement: 26104 — AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks
- Organization: AICTE — Cyber Security Cell
- Link to GitHub repo(s)

## States every section must handle

- **Mobile width** (test at ~375px) — no horizontal scroll, no overlapping text/buttons
- **Broken/missing image** — use alt text, don't let a missing asset break layout
- **Long content** (e.g., a longer team member list) — layout shouldn't break if content is slightly longer than the placeholder text used during build

## Rules

1. **Never mark a status badge "Built" without confirming it** — a wrong badge on a public site is worse than an honest "Planned" label.
2. **Test on an actual phone browser, not just a resized desktop window**, before marking a ticket done — real mobile rendering can differ from browser dev-tools simulation.
3. **Keep JS minimal** — nav toggle and smooth scroll are enough; don't add a framework mid-sprint for a "nice to have" animation.
4. **No placeholder Lorem Ipsum in a merged PR** — use real (even if short/draft) project copy, since this may go live before final polish.

## Day-by-day task list

### Day 1
- [ ] Set up folder structure (see TRD.md)
- [ ] Build Hero/Landing section (VOX-201) — static HTML/CSS first, no JS needed yet
- [ ] Build Products section (VOX-202) with correct current status badges

### Day 2
- [ ] Build Download section (VOX-203) — coordinate with Mayur's chat for the real APK link
- [ ] Build About/Team section (VOX-204)
- [ ] Add nav toggle / smooth scroll JS

### Day 3
- [ ] Mobile-responsive pass — test at multiple widths, fix any overlap/scroll issues
- [ ] Check every link, fix any broken ones
- [ ] Deploy to GitHub Pages, confirm live URL works

### Day 4
- [ ] Bug fixes only
- [ ] Final review: no overclaimed features, no dead links, no console errors

## Definition of done for a section

Renders correctly at both mobile and desktop widths, no broken links or console errors, content matches actual project status (no overclaiming), and has been viewed in an actual browser (not just the code) before being marked complete.
