# Backend Schema — Voxshield Web

## There is no backend in this repo — and that's deliberate

Voxshield Web is a **static site**: HTML/CSS/JS served directly by GitHub Pages, with no server, no database, and no API of its own. This file exists so that's a documented decision, not an assumed gap — anyone opening this repo (including an AI assistant) should not go looking for a `server/` folder or a database schema that was never meant to exist here.

## Where the real backend lives

All actual detection logic, data models, and API contracts belong to the **`VoxshieldMobile`** repo:
- Detection engine: `detection_engine/` (or the on-device `AntiSpoofEngine.kt`/`VoiceprintEngine.kt`, depending on current architecture — check `VoxshieldMobile/docs/TRD.md` and `TECH_STACK.md` for the current source of truth)
- API contract: `VoxshieldMobile/docs/API_CONTRACT.md`
- Local storage schema (Room DB, voiceprints): `VoxshieldMobile/docs/BACKEND_SCHEMA.md`

This website never calls that engine directly. It only *links to* the Mobile app (download) and *describes* the SDK (as a planned integration layer) — it does not embed or proxy any detection functionality.

## If this ever changes (future scope only)

If a future version of this site adds a live demo widget, a contact form, or an SDK sign-up flow, that would require:
- A real backend decision (serverless function, e.g., a Cloudflare Worker or Vercel function, vs. a small dedicated server)
- Its own schema and API contract, documented in a new version of this file
- A privacy/data-handling review before collecting any user input

**None of this exists today.** Do not build it speculatively — if a ticket ever asks for it, treat it as a new architecture decision requiring team sign-off, not an incremental addition to the static site.

## Local storage (client-side only)

If any client-side state is ever needed (e.g., remembering a dismissed banner), it would use `localStorage`/`sessionStorage` in the browser only — never a server-side database. As of this document, no such state is implemented.
