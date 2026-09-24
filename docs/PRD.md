# PRD — Voxshield Web

**Team:** Innovexa | **Product:** Voxshield Web (public website) | **SIH PS:** 26104
**Repo:** `VoxshieldWeb` | **Owner:** Rucha

---

## 1. Problem

Voxshield needs a single, public place where anyone — a judge, a curious visitor, a future user — can quickly understand what the project is, see the problem it solves, and get to the actual product (the Mobile APK) or learn what's coming next (SDK, extension). Right now that information only exists scattered across chat, docs, and the `VoxshieldMobile` repo — nothing public-facing exists.

## 2. Who this is for

- SIH judges browsing before/after the live demo
- Anyone the team shares a link with (mentors, other teams, social media)
- Future users looking to download the Mobile app

## 3. What Voxshield Web does

A static, informational website that:
1. Explains what Voxshield is and the voice-cloning problem it addresses
2. Shows the product line (Mobile / SDK / Web) with an honest built-vs-planned status
3. Links to download the Mobile APK
4. Shows team and problem statement information
5. Links back to the GitHub repo for anyone wanting technical depth

## 4. In scope for this build

- [ ] Landing page — hero section, problem/solution summary (VOX-201)
- [ ] Products section — Mobile / SDK / Web, honest status labels (VOX-202)
- [ ] Download section — APK link; SDK marked "Coming Soon" (VOX-203)
- [ ] About/Team section — team name, members, PS number, GitHub link (VOX-204)
- [ ] Mobile-responsive layout (must look correct on a phone browser, since judges may check on mobile)

## 5. Explicitly out of scope

- No backend server, no database, no user accounts
- No live detection demo embedded in the website (that's the Mobile app's job)
- No contact form or newsletter signup unless separately requested
- No browser extension — despite similar naming in early planning, "Voxshield Web" is this website only, not the extension

## 6. Success criteria

- Site loads correctly and looks intentional on both desktop and mobile browser widths
- No broken links (especially the APK download link)
- No feature is presented as available if it isn't actually built — SDK/extension/desktop clearly marked "Planned"/"Roadmap"
- Deployed and reachable via a live GitHub Pages URL before demo day

## 7. Key risks

| Risk | Mitigation |
|---|---|
| APK download link breaks or isn't ready in time | Keep a placeholder/fallback message ("APK available at demo") until Mobile team confirms a stable release build |
| Site looks unfinished next to a polished mobile demo | Keep scope tight — 4 sections done well beats 8 sections half-done |
| Overclaiming SDK/extension as available | Content review against Section 5 before every deploy |
