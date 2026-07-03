# CTRL+WATCH Platform Brief — Phase 0 & Phase 1

**Version:** 2.0
**Status:** Ready for execution
**Companion to:** `BRIEF.md` (v1.0 scaffold spec — historical reference) and `CLAUDE.md` (operational context)
**Scope:** Platform improvements layered on top of the existing Astro site. Editorial work (Track A) is out of scope and runs in parallel through normal issue production.

---

## 0. Reading order for Claude Code

1. **Read `CLAUDE.md` first** — operational context, agent workflows, analytics setup
2. **Skim `BRIEF.md`** — v1.0 scaffold spec; design tokens, file structure, base components (locked)
3. **Read this file (`PLATFORM_BRIEF.md`) in full** — Phase 0 and Phase 1 work
4. **Inspect the repo before writing code** — confirm current state matches assumptions in section 2

---

## 1. What's already built (assumed state)

This brief assumes the following are operational. **Verify before starting work.** If any of these are missing or incomplete, flag before proceeding.

| Component | Status assumed | Verification |
|---|---|---|
| Astro project scaffolded | ✅ done | `npm run dev` starts cleanly |
| Design tokens in `tokens.css` | ✅ done | Phosphor green `#00ff41`, Press Start 2P, Share Tech Mono |
| `BaseLayout.astro`, `Nav.astro`, `Footer.astro` | ✅ done | Render on every page |
| `BootScreen.astro` | ✅ done | Animates on homepage; verify scope (homepage-only vs every page) |
| CRT scanline effect | ✅ done | Applied via `.crt` class on body |
| Homepage (`index.astro`) | ✅ done | Hero, manifesto pull quote, ticker |
| Archive page (`archive.astro`) | ✅ done | Grid of `IssueCard` components |
| About page (`about.astro`) | ✅ done | Full manifesto |
| Issue HTML files | ✅ done | Live at `public/issues/NNN/index.html`, self-contained |
| `src/data/issues.js` | ✅ done | Single source of truth for platform metadata |
| RSS feed, sitemap | ✅ done | Auto-generated from `issues.js` |
| GoatCounter analytics | ✅ done | Wired into `BaseLayout.astro` + every issue |
| Netlify deployment | ✅ done | `netlify.toml` present, deployed to `ctrl-watch.xyz` |
| Promotion workflow | ✅ done | `ctrlwatch-promoter` agent, `npm run promote:open/status` |
| Search Console | ✅ done | URL-prefix property verified |

---

## 2. Architectural decisions (locked)

These reflect the existing site and are not open for revision during Phase 0/1.

| # | Decision | Source |
|---|---|---|
| A1 | **Static site through Phase 2.** No backend, no DB. | Original `BRIEF.md` v1.0 |
| A2 | **Existing issue HTMLs preserved.** `public/issues/NNN/index.html` are self-contained artefacts — wrap them, link to them, don't refactor their internals. | Magazine identity principle |
| A3 | **`src/data/issues.js` is the platform source of truth** for issue metadata (titles, dates, cover colors, publication status). | Existing implementation |
| A4 | **The continuity tracker is the editorial source of truth** for cross-issue content (channel reviews, Time Capsule subjects, Boss Fights, Top 50). Read-only from the platform; parsed at build time for Creator Index. | Editorial workflow |
| A5 | **Stack is locked:** Astro + pure CSS + vanilla JS + Netlify. No framework additions for Phase 0/1. | Existing implementation |
| A6 | **Design tokens are locked:** color palette (`tokens.css`), Press Start 2P + Share Tech Mono. New tokens only for Print Mode (see section 4 of `BRIEF.md`). | Existing implementation |
| A7 | **Print Mode is real design work, not a CSS swap.** Proper print typography: drop caps, column rules, true pull-quote layout, serif body. Half-implemented Print Mode is worse than none. | New for v2.0 |
| A8 | **GoatCounter is the analytics canon.** Phase 3 demand-gate decisions read from GoatCounter, not from added trackers. | Existing setup |

---

## 3. Print Mode design tokens (additions to `tokens.css`)

Print Mode is a render target alongside Terminal Mode. Add these tokens — don't replace existing.

```css
:root {
  /* Existing terminal palette unchanged */

  /* Print Mode additions */
  --bg-print:              #F4F1E8;  /* off-white paper */
  --bg-print-secondary:    #ECE7D8;  /* slightly darker card stock */
  --border-print:          #1A1A1A;  /* rule lines */
  --text-print-primary:    #1A1A1A;
  --text-print-secondary:  #555555;
  --text-print-muted:      #888888;
  --accent-print:          #B22222;  /* magazine red — pull quotes, dropcaps */
  --accent-print-blue:     #1F4788;  /* secondary accent */
}

/* Activated via class on <html> or <body> */
.mode-print {
  --bg: var(--bg-print);
  --bg-secondary: var(--bg-print-secondary);
  --text-primary: var(--text-print-primary);
  --text-secondary: var(--text-print-secondary);
  --border: var(--border-print);
  /* CRT effects disabled via separate selector */
}

.mode-print .crt::before,
.mode-print .crt::after { display: none; }
```

**Print Mode body serif:** open question — recommend `Crimson Pro` or `Source Serif 4`. Mock both before locking. Add to Google Fonts import in `BaseLayout.astro`.

---

## 4. Phase 0 — Foundation

**Goal:** Verify and polish existing infrastructure for mobile and shareability. Most work is verification, not greenfield.
**Estimated effort:** 15–30 hours (significantly reduced from v1.0 brief — existing site has done most of the structural work)
**Ships as:** one update at end of phase

### P0-1 — Mobile readability verification + polish

**Status check:** existing `tokens.css` uses `clamp()` for type scale and has breakpoints at 1024px / 768px / 375px.

**Acceptance criteria:**
- Test homepage, archive, about, and 3 sample issues (`/issues/001/`, `/issues/008/`, `/issues/014/`) on real devices: 320px, 375px, 414px, 768px
- Body line-height ≥ 1.6 on mobile (verify or adjust)
- No horizontal scroll at any tested viewport
- Tab navigation inside issue HTMLs works on mobile (this is the **highest risk** item — issues have embedded styles that may not respect Astro shell breakpoints)
- Score cards inside issues readable without horizontal scroll on mobile
- Tap targets ≥ 44×44px on nav, buttons, and IssueCard CTAs

**Implementation note:** The Astro shell (Nav, Footer, BaseLayout, page templates) is likely fine. The 15 standalone issue HTMLs are the risk surface — each has embedded styles independent of the shell. Apply a global mobile override stylesheet *injected into issue HTMLs* rather than editing each issue individually. Document the injection pattern for future issues.

**Out of scope:** Restructuring issue HTML internals. CSS-only fixes via injection.

### P0-2 — Deep linking bypasses boot sequence

**Status check:** `BootScreen.astro` exists. Need to verify whether it triggers on every page navigation or only on first homepage visit.

**Acceptance criteria:**
- Boot sequence shows on first visit to homepage only (use `sessionStorage` or `localStorage` flag)
- URLs to subpages (`/archive`, `/about`, `/issues/014/`) load directly without boot animation
- URLs with hash fragments (`/issues/014/#boss-fight`) scroll to the section after load
- A "SKIP ▶" button is always visible during the boot sequence as fallback
- Social share previews (Twitter cards, Slack unfurls, OpenGraph) reach the issue page directly — no boot screen in the linked content

**Test cases:**
- Paste `https://ctrl-watch.xyz/issues/014/` into Slack — click — should open the issue, not the boot
- Visit `https://ctrl-watch.xyz/` for the first time in incognito — should see boot
- Refresh — should NOT see boot a second time

### P0-3 — Issue cover art + OpenGraph images

**Status check:** Each issue has a `coverColor` in `issues.js` and a placeholder cover in IssueCard. No real cover art per issue, no `og:image` per issue.

**Acceptance criteria:**
- Generate distinctive covers for each of the 15 published issues using a build-time script
- Recommendation: programmatic template approach — issue number + title + theme color, designed once, applied per issue. Output 1200×630 (OpenGraph) and 1080×1080 (square for archive) PNG files into `public/covers/`
- Each issue page (`public/issues/NNN/index.html`) gets `<meta property="og:image">` pointing to its 1200×630 cover
- IssueCard displays the 1080×1080 cover instead of the current placeholder
- The cover generation script is re-runnable: `npm run covers` regenerates from `issues.js`
- New issues automatically get covers when added to `issues.js` and built

**Implementation hint:** Use `satori` + `sharp` (Node), or `puppeteer` for rendering HTML→PNG, or `node-canvas`. Whichever is simplest. The cover design itself should use the magazine's existing tokens — no new visual language.

**Out of scope:** Hand-designed unique cover art per issue. That's a future Track A creative project.

### P0-4 — Archive shelf aesthetic enhancement

**Status check:** `/archive` exists with a grid of IssueCard components.

**Acceptance criteria:**
- Visual treatment evolved from flat grid to "shelf" feel — subtle 3D perspective acceptable but not required; angular borders maintained
- Issue covers from P0-3 are the visual focus, not the metadata
- Sort toggle: newest-first (default) vs oldest-first
- Filter: published only / include "coming soon" placeholders
- Each card hover state: glow accent matching `coverColor`
- Mobile: 2-column grid; tablet: 3-col; desktop: 4-col
- "Latest issue" gets a `[LATEST]` tag chip
- Page header explains the shelf in one line: "FIFTEEN ISSUES. ZERO ALGORITHMIC INTERFERENCE."

### Phase 0 ships when:

- All four tickets pass acceptance criteria
- Smoke test on real iPhone and real Android device — not DevTools
- All existing URLs unchanged (no 404s, no redirects)
- GoatCounter still recording (analytics integration unbroken)
- One commit, one Netlify deploy

---

## 5. Phase 1 — Discoverability

**Goal:** Make 15 issues legible to a first-time visitor and useful as a cross-reference. Ships incrementally.
**Estimated effort:** 40–70 hours
**Order:** P1-2 → P1-3 → P1-1 → P1-4 (data first, then search, then onboarding, then design-heavy toggle last)

### P1-2 — Creator Index (do this first)

**Why first:** lowest design risk, generates data both Search and Start Here can consume.

**Acceptance criteria:**
- Lives at `/creators` or `/index`
- Every channel reviewed across all published issues, listed with:
  - Channel name
  - Score (0–100)
  - Verdict (ESSENTIAL / EXCELLENT / GOOD / AVERAGE / MEDIOCRE / GAME OVER)
  - Issue(s) reviewed in (with deep links — requires P0-2)
  - Current Top 50 rank or `—` if dropped/never entered
  - Genre/category if available
- Filterable: verdict, in Top 50 / dropped / never entered
- Sortable: name A–Z, score high→low, score low→high, most recent review
- Free-text filter box at top (alphabet jump is nice-to-have, not required)
- Visual: monospace table on desktop, card stack on mobile
- Build script parses `CTRLWATCH_Continuity_Tracker_VERIFIED_Post0XX.md` and emits `src/data/creators.json` consumed by `/creators` page
- Script is re-runnable: `npm run build:creators`
- Script fails loudly on parse errors — never silently drops channels

**Risks:**
- Tracker is human-edited markdown. Parser must handle: typo'd table separators, missing columns, footnotes, asterisks, score ranges (e.g., `~91-95`), `(check file)` placeholders.
- Some channels have re-evaluations across issues (e.g., Adam Neely #010, JCS #007). The index should show the *current* score with a "re-evaluated" indicator and link to all reviewing issues.

**Out of scope:** Hidden Levels (sub-10K) channels — deliberately less indexed. Optional future page.

### P1-3 — Retro-styled search

**Acceptance criteria:**
- Search input in site header, accessible from every page
- Visual: early-90s search engine aesthetic — `Share Tech Mono` input with blinking cursor, "SEARCHING..." status text on submit
- Searches across: issue titles, section titles, channel names (from `creators.json`), Time Capsule subjects, Yob's Save Point letter writers, Special Feature titles
- Results grouped by type: Issues / Channels / Time Capsule / Letters / Specials
- Each result links to specific section via deep link (P0-2 dependency)
- Index built at build time — **no server search**
- Recommendation: **Pagefind** (built for Astro; static-friendly; ~200kb client overhead)
- Mobile: search collapses to icon, expands to overlay when tapped
- Pagefind index regenerated on every build automatically

**Out of scope:** Full-text search of review prose. Titles, names, metadata only. Extend later if user feedback demands it.

### P1-1 — Start Here page (write copy before building)

**Status check:** `/about` exists with full manifesto. Decision required: augment `/about` into Start Here, or add separate `/start` page.

**Recommendation:** Add separate `/start` page; promote it in nav and on homepage. Keep `/about` as the manifesto.

**Acceptance criteria:**
- Lives at `/start`
- Section 1 — "What is CTRL+WATCH?" — one paragraph, the magazine's editorial position
- Section 2 — "Read these first" — 5 curated entry points across formats:
  - One Boss Fight (recommend: Drew Gooden vs Danny Gonzalez, #014)
  - One Time Capsule (recommend: any flagship-tier figure)
  - One Special Feature (recommend: The Comedy Tax #014, or The Discourse Machine #011)
  - One Player Profile (recommend: an ESSENTIAL-tier review)
  - One full issue (recommend: latest)
- Section 3 — "Who's who" — Yob, DepthCharge, Priya M., Marco T. introduced with one-line bios sourced from continuity tracker
- Section 4 — "The taxonomy" — brief explainer of Type 7 (Collision, #012) and Type 8 (Wrapped Confession, #014)
- Section 5 — "How we score" — link out to `/about`
- Section 6 — CTAs: `[BROWSE THE ARCHIVE ▶]` `[FIND A CREATOR ▶]` `[LATEST ISSUE ▶]`
- Nav link added to header: `START HERE`

**Content sourcing:** Dole writes the copy. Don't ship lorem ipsum. The five "read these first" picks need editorial approval — flag for Dole if not specified before implementation.

### P1-4 — Print / Terminal mode toggle (highest design risk — do last)

**Acceptance criteria:**
- Toggle button in site header, consistent location
- Visual treatment: old TV/VCR input-selector aesthetic. Suggested labels (pick one and commit): `[CRT]/[PRINT]` | `[TERMINAL]/[MAGAZINE]` | `[VHS]/[PRINT]`
- Preference persists across sessions (`localStorage` key: `ctrlwatch_mode`)
- Default mode: Terminal (existing aesthetic)
- Print Mode applies across: homepage, archive, about, start, creators, search results, all 15 issue HTMLs
- Mode swap is instant — CSS class toggle on `<html>`, no page reload
- `Cmd+P` from Print Mode produces a clean PDF without web chrome (Nav, Footer hidden in print stylesheet)
- All interactive elements (toggle, search, nav) styled appropriately for both modes

**Pre-implementation design step:**
Before writing CSS for all pages, produce three mockups in Print Mode:
1. Editor's letter (Press Start in an issue)
2. A Player Profile with scorecard
3. A Time Capsule interview

If the mockups don't look like an actual print magazine — drop caps, column rules, proper pull quotes, page numbers — iterate before committing. Submit mockups to Dole for approval before building.

**Risk:** Issue HTMLs have embedded styles. Print Mode must override via either (a) high-specificity selectors with `!important`, or (b) a global stylesheet injection pattern shared with P0-1 mobile fixes. Choose the lower-touch option and document it.

### Phase 1 ships when:

- All four tickets pass acceptance criteria
- Creator Index parser tested against latest tracker version, zero warnings
- Search returns useful results for test queries: "Jenny Nicholson", "Bourdain", "Algorithm", "Priya", "Boss Fight"
- Print Mode reviewed and approved by Dole
- GoatCounter still recording — analytics integration unbroken after toggle introduction

---

## 6. Explicitly out of scope

| Item | Why excluded | Future home |
|---|---|---|
| Algorithm Jail recurring section | Editorial (Track A) | Issue #016 or later |
| Hardware Hack specials | Editorial | When warranted |
| Audio Press Start | Deferred pending narrator | Track A — later |
| Community Boss Fight voting | Needs backend; gated by GoatCounter evidence | Phase 3 |
| Polls, comments, reactions | Same | Phase 3 |
| Discord, social media accounts | Brand risk | Re-test every 6 months |
| Short-form social (TikTok/Reels) | Editorial position against format collapse | Indefinite |
| Print annual (physical) | Separate project | Phase 4 — ~Issue #020+ |
| Membership / Patreon | Premature | Post-Phase 3 |
| Newsletter | Reassess after Phase 1 ships | TBD |
| Hidden Levels in Creator Index | Deliberate editorial choice | Optional future page |

---

## 7. Phase 3 demand-gate criteria (informational)

Phase 3 (community voting) is gated on real audience evidence. GoatCounter is in place, so this is measurable. Suggested thresholds — Dole to confirm before Phase 1 ships:

- 30-day return visitor rate > X% (Dole to define X — recommend 15–25%)
- Average session pages > 2.0
- At least one issue with > Y total visits in its first 30 days (Dole to define Y)

If thresholds aren't met after 2–3 issues post-Phase 1, **don't build Phase 3.** Reassess at Issue #020.

---

## 8. Guardrails for execution

1. **Don't touch issue HTML internals.** P0-1 (mobile) and P1-4 (Print Mode) inject styles; they don't refactor.
2. **Don't break GoatCounter.** Verify analytics still recording after each phase ships.
3. **Don't break the promotion workflow.** `ctrlwatch-promoter` and `npm run promote:open/status` must continue to work — they depend on URL structures that Phase 0/1 should preserve.
4. **Don't break the sitemap.** It's generated from `issues.js`; new pages (`/creators`, `/start`) need explicit inclusion via `@astrojs/sitemap` `customPages`.
5. **Don't introduce new dependencies casually.** Each new package added (Pagefind, satori, sharp) must be justified.
6. **Test on real devices.** DevTools mobile simulation does not catch font-rendering or touch-target issues.
7. **One commit per ticket.** Easier to revert if something breaks.
8. **Update `CLAUDE.md` as features land.** Document new `npm` scripts (`build:creators`, `covers`, etc.) so future Claude Code sessions know they exist.

---

## 9. Open decisions blocking execution

| # | Question | Blocks | Owner |
|---|---|---|---|
| 1 | Print Mode serif font: Crimson Pro vs Source Serif 4 vs other? | P1-4 implementation | Dole picks from mockups |
| 2 | Print/Terminal toggle labels: pick one of the three options | P1-4 implementation | Dole |
| 3 | Start Here vs augmented About page | P1-1 structure | Recommendation: new `/start` page |
| 4 | Five "read these first" picks for Start Here | P1-1 content | Dole curates |
| 5 | Cover generation: programmatic templates (recommended) vs hand-designed per issue | P0-3 scope | Recommend programmatic for now |
| 6 | Phase 3 demand thresholds (X%, Y visits) | Phase 3 decision later | Define before Phase 1 ships |

Items 5 and 6 can be deferred; items 1–4 should be resolved before reaching their respective tickets.

---

## 10. Definition of done

The Phase 0/1 platform work is complete when:

- A first-time visitor at `ctrl-watch.xyz` understands the magazine within 30 seconds, finds an entry point, and reads content
- A returning visitor can find any reviewed channel via search or Creator Index in under 10 seconds
- Issue links shared on social media open directly to issue content with proper preview images
- The site is fully usable single-handed on a 375px-wide phone
- Print Mode renders all content as a real-looking print magazine, including via `Cmd+P`
- The Creator Index reflects the latest published issue's content (parser tested against latest tracker)
- GoatCounter analytics continues recording; promotion workflow continues working; sitemap remains accurate
- The magazine's editorial identity is preserved — Yob is still Yob, the CRT aesthetic is still the default, no generic UX patterns have softened the brand

---

## 11. Suggested working order

If executing this brief end-to-end:

1. **Read existing state.** Inspect repo, run `npm run dev`, confirm assumptions in section 1.
2. **Resolve open decisions** with Dole (section 9, items 1–4 at minimum).
3. **Phase 0:** P0-1 → P0-2 → P0-3 → P0-4. Ship as one commit. Smoke test.
4. **Pause.** Gather feedback. Fix any regressions.
5. **Phase 1:** P1-2 → P1-3 → P1-1 → P1-4. Each as a separate commit.
6. **Update documentation:** `CLAUDE.md` gets new scripts, `BRIEF.md` stays as historical scaffold reference.
7. **Hand off** to ongoing editorial production — Phase 0/1 work should not require further engineering for new issues; `issues.js` updates + cover regeneration + tracker re-parse should be the entire integration cost per issue.

---

*End of brief. Companion files: `CLAUDE.md` (operational context), `BRIEF.md` (v1.0 scaffold reference). Project owner: Dole.*
