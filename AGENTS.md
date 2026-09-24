# AGENTS.md — Voxshield Web

Instructions for AI assistants (Claude, CLI coding agents, etc.) working on this repo.

## Project context

- Repo: `VoxshieldWeb` — the public static website for the Voxshield project (Team Innovexa, SIH 2026, PS 26104)
- This is NOT the detection engine, NOT the Android app, and NOT the browser extension — it's an informational site only. See `BACKEND_SCHEMA.md` for why there's deliberately no backend here.
- Owner: Rucha
- Sibling repo: `VoxshieldMobile` holds the actual product (Android app + detection engine + full project docs) — treat that repo as the source of truth for any claim about what Voxshield technically does or how accurate it is. This repo should describe that work, never invent details about it.

## Ground rules for AI agents assisting this project

1. **Never state or imply a feature is "built" or "available" unless it's confirmed built in `VoxshieldMobile`.** When in doubt, use "Planned" or "Coming Soon" — see `PRD.md` Section 5 and `FRONTEND.md`'s status-badge rule. This is a judged public site; overclaiming here is worse than a placeholder.
2. **Do not add a backend, database, API route, or server-side logic** without the team explicitly deciding to — see `BACKEND_SCHEMA.md`. If a task seems to require one, flag it rather than building it.
3. **Prefer plain HTML/CSS/JS** over introducing a framework mid-sprint — see `TRD.md` for the reasoning. Don't "improve" the stack unprompted.
4. **Test at both mobile and desktop widths before calling a section done.** A layout that only works on a desktop-sized browser window is not done.
5. **Never invent team member names, accuracy numbers, or dataset details** for the About/Team or Products sections — pull only from what's actually documented in `PRD.md` or the linked `VoxshieldMobile` docs, and use a placeholder (`[PLACEHOLDER]`) rather than guessing.
6. **No AI tool names in commits, PRs, or code comments** — same rule as `VoxshieldMobile`.

## What "done" means for this repo

A section is done when: it renders correctly on both mobile and desktop widths, has no broken links or console errors, and every claim on the page matches the real, current status of the corresponding Voxshield product — not an aspirational one.
