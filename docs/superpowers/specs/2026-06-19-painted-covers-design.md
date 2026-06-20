# CTRL+WATCH Issue Splash Covers (Concept D) — Design Spec

**Date:** 2026-06-19
**Status:** Implemented (machine + placeholder hero, 2026-06-20); awaiting first real AI hero for #016. Rasteriser is `@resvg/resvg-js` (not librsvg — eliminates the §10 font risk; outline-paths fallback unneeded). See `docs/superpowers/plans/2026-06-20-painted-covers.md`.
**Scope:** Concept **D** only (painted/airbrushed issue covers in a ZZAP!64 / C+VG idiom). Concept **A** (Player Cards) is a separate spec. The pixel house style stays the language everywhere *except* covers — this is the deliberate hybrid.
**Visual reference (working):** `.superpowers/brainstorm/99041-1781896684/content/cover-b-v2.html` (the locked v2 mockup).

---

## 1. Summary

Each issue gets a **splash cover**: one dominant **airbrushed, glossy, dramatically-lit hero illustration** (AI-generated per issue, human-picked) under a loud **1980s game-magazine furniture layer** — a chunky skewed outlined logo masthead, angled flash banners, starburst callouts (including a ZZAP-style "Sizzler" score burst), bold italic cover lines, CRT scanlines, price + barcode. The hero is the only non-deterministic asset; everything else is composited **programmatically and deterministically** from `src/data/issues.js`.

The hero art is the **master**; the existing square (archive grid) and OG (social) covers are produced as **derivatives** of the same hero + furniture, so one painting drives all three sizes.

---

## 2. Goals & non-goals

**Goals**
- Give each issue a genuine newsstand-magazine cover with real painted artwork, in the ZZAP!64 / C+VG tradition, on the CTRL+WATCH neon-on-dark palette.
- Keep all text/furniture deterministic and on-brand; isolate the only manual step (pick the hero) to ~once a month.
- Drive distribution: the splash cover and its OG derivative are the unit that travels on social and anchors the issue page.

**Non-goals (YAGNI)**
- No animated/video covers.
- No mandatory backfill of all 15 legacy issues (forward-only by default; optional backfill list).
- No painted real-person likenesses on the marquee (mirrors the no-likeness call for Player Cards).
- No change to the pixel house style anywhere else — D is covers-only.
- No physical print.

---

## 3. Strategic rationale (lenses)

| Lens | How |
|---|---|
| Distribution & shareability | A purpose-built, striking cover + OG image per issue — the most shareable single artifact the magazine produces. |
| Reader delight & stickiness | The covers become collectible in their own right; the archive shelf turns into a gallery. |
| Brand / entity recognition | A recurring, instantly-identifiable cover identity (logo lockup + Yob + neon) compounds "CTRL+WATCH" as *the* YouTube-criticism entity. |
| Polish what exists | Upgrades the issue-page hero, archive grid, and social presence. |

---

## 4. Locked look

**Idiom:** ZZAP!64 / C+VG — busy, loud, full-bleed, airbrushed. **Palette:** CTRL+WATCH neon-on-dark (bg deep `#0A0A12`/space gradient; accents cyan `#00F0FF`, magenta `#FF00AA`, yellow `#FFE600`, green `#39FF14`, orange `#FF6B00`, red `#FF2244`).

**Element inventory (z-order back → front):**
1. **Hero illustration** — airbrushed glossy subject, dramatic rim-light, full-bleed; lower-center with negative space up top for the masthead.
2. **Ray/atmosphere layer** — faint conic "sunburst" rays behind the hero.
3. **Masthead banner** — skewed (~−5°) translucent bar, magenta bottom rule, holding the **logo**: `CTRL+WATCH`, heavy italic, ~bold display face, white fill + magenta stroke + cyan glow + dark drop shadow, **yellow `+`**. Logo dominates the top.
4. **Strapline** — `ISSUE #NNN · MONTH YEAR · THE YOUTUBE REVIEW MAGAZINE`, mono, cyan.
5. **Flashes (edge-crowding callouts)** — composed from issues.js, in five kinds:
   - `tab` — small angled rectangle (e.g. red `EXCLUSIVE!`)
   - `starburst` — jagged star (e.g. yellow `6 NEW / TOP 50!`)
   - `sizzler` — jagged star with a score (e.g. cyan `96% / ★ ESSENTIAL`) — the ZZAP rating-flash homage
   - `banner` — angled italic strip (e.g. magenta `PLAYER CARDS INSIDE!`)
   - `flash` — small angled tag (e.g. green `+ TIME CAPSULE`)
6. **Cover title** — the theme, big bold italic, yellow fill + dark stroke + magenta offset shadow.
7. **Cover-line teasers** — mono, cyan, `▶`-bulleted.
8. **Price + barcode**, bottom corners.
9. **CRT scanline overlay** over the entire cover.
10. **Neon border** (5px, cyan or the issue's `coverColor`).

**Format:** portrait. Master splash **1080×1440** (3:4).

---

## 5. Subject strategy

**Default: Yob-anchored.** Yob (the green-blob mascot) is the painted hero of every cover, posed/themed to the issue. Rationale: guaranteed cover-to-cover continuity, zero real-person likeness, deepens an asset we already own, and an airbrushed glossy mascot is peak ZZAP. *(Decision: Yob-anchored default — flip during spec review if you prefer symbolic-by-default.)*

**Exception: symbolic scene** for special issues (anniversary, themed specials) — a painted conceptual scene, no character. Controlled by `coverStar: 'symbolic'`.

**Not used: cover-star creator** (painted real-person likeness) — rejected for rights/consistency risk and for contradicting the no-likeness call.

---

## 6. Art-direction recipe (the consistency lock)

The hero is AI-generated, so a **fixed recipe** keeps 12+ covers coherent:

- **Medium:** airbrushed, glossy, high-gloss highlights, dramatic rim-lighting, Oliver-Frey-inspired 1980s game-mag illustration.
- **Palette:** neon-on-dark — luminous greens/cyans/magentas against a deep space-blue/purple gradient; CRT bloom atmosphere.
- **Composition:** single dominant hero, lower-center, generous negative space at top for the masthead; portrait, generated high-res then cropped to 3:4.
- **Subject:** Yob (green blob, two large glossy eyes, expressive brows) in a scene themed to the issue; or a symbolic theme scene for specials.
- **Hard constraints (negative prompt):** **no text/lettering in the art** (all text is composited), no real-person likeness, no logos, no watermark.
- **Yob on-model:** maintain a canonical `assets/yob-reference.png` and use **reference-guided / image-to-image** generation (not text-only) so Yob stays on-model across issues.
- **Tooling:** fal.ai (available; the sister channel already runs an AI-media stack). **Human-in-the-loop:** generate several candidates per issue, operator selects one. Never fully automatic.

The recipe + a reusable prompt template live alongside the generator (`scripts/lib/cover-art-recipe.md`).

---

## 7. Production pipeline

### 7.1 Hero (the only manual/AI step)
Operator generates candidates from the §6 recipe, picks one, saves the master to `public/covers/heroes/NNN-hero.png` (committed).

### 7.2 Compositor — **SVG, not satori**
satori (used by the current text-only covers) cannot render the ZZAP furniture: no `clip-path` (starbursts), no `-webkit-text-stroke` (outlined logo/title), weak skew/filters. Therefore D composites with **SVG → raster → sharp**:

1. Build a templated **SVG overlay** sized to each target (splash/square/og) containing masthead, logo (paint-order stroke), flashes (star `<path>` clip + skew transforms), cover lines, scanlines, border, gradients, glow `<filter>`s.
2. Rasterize the SVG (sharp/librsvg) and **`sharp.composite([hero, svgOverlay])`** to produce the PNG.

Furniture builder lives in `scripts/lib/cover-furniture.mjs`; reused across the three sizes (it reframes the hero crop + rescales furniture per aspect).

**Fonts:** the heavy display logo/title need a guaranteed face. Add one **heavy display TTF** to `scripts/fonts/` (committed, offline-safe) and **embed it base64 in the SVG** via `@font-face`; italic via skew transform. If librsvg font handling proves flaky, **convert the logo/title to outline paths** at build time as the fallback. Mono/strapline can use the already-cached Share Tech Mono.

### 7.3 Outputs (all committed; never built on Netlify)
| File | Size | Use |
|---|---|---|
| `public/covers/heroes/NNN-hero.png` | high-res master | AI source art |
| `public/covers/NNN-splash.png` | 1080×1440 | issue-page marquee |
| `public/covers/NNN-square.png` | 1080×1080 | archive grid (reframed) |
| `public/covers/NNN-og.png` | 1200×630 | social / OG |

### 7.4 `issues.js` schema extension (all fields optional)
Presence of `hero` switches an issue to the splash treatment; absence falls back to the current satori cover (legacy issues unchanged).

```js
{
  slug: '016', number: '#016', date: 'July 2026', title: 'THE GAMING ISSUE',
  subtitle: '…', coverColor: '#00F0FF', tag: 'GAMING', rating: null, published: true,
  // --- splash-cover furniture (optional) ---
  hero: 'heroes/016-hero.png',     // omit → legacy satori cover
  coverStar: 'yob',                // 'yob' | 'symbolic'
  price: '£4.99',
  coverLines: [
    '▶ BOSS FIGHT: CADDICARUS vs CADDSHACK',
    '▶ HIDDEN LEVELS: 5 TINY CHANNELS',
  ],
  flashes: [
    { kind: 'tab',       text: 'EXCLUSIVE!',           color: '#FF2244' },
    { kind: 'starburst', text: '6 NEW|TOP 50!',        color: '#FFE600' },
    { kind: 'sizzler',   text: '96%|★ ESSENTIAL',      color: '#00F0FF' },
    { kind: 'banner',    text: 'PLAYER CARDS INSIDE!', color: '#FF00AA' },
    { kind: 'flash',     text: '+ TIME CAPSULE',       color: '#39FF14' },
  ],
}
```

`coverLines`/`flashes` (the `sizzler` is just a flash `kind`) are **editorial** — set during issue planning. Their content is derivable from the continuity tracker for that issue (Boss Fight matchup, Top 50 movement count, Time Capsule subject, the standout review's score). Furniture degrades gracefully: fewer flashes → a calmer cover; legacy issues with none → current cover.

### 7.5 Orchestration
- Extend `generate-covers.mjs` to **branch on `hero`**: hero present → SVG compositor (splash + square + og); absent → existing satori templates. One entry point (`npm run covers`), two code paths — **no change to the pipeline order**.
- Add `gray-matter` is **not** needed here (issues.js is JS); reuse the existing `issues` import.

---

## 8. Where covers appear & hard-rule compliance

- **New issue pages** (`/issues/NNN/`): the splash cover is authored into the issue HTML at generation time by `ctrlwatch-html-generation`. We **do not edit existing issue internals** (CLAUDE.md hard rule) — legacy issues keep their covers.
- **OG/Twitter meta:** point each issue's OG image to `NNN-og.png` via the **existing fenced `inject:og` mechanism** (allowed — it's the sanctioned injection path, not hand-editing internals). Re-run `inject:og` after `covers`.
- **Archive (`/archive/`) & homepage:** Astro pages reading `issues.js`/`public/covers/` — use `NNN-square.png` (or `NNN-splash.png` for a featured slot). Safe to update.
- **GoatCounter / promotion workflow:** untouched; the promotion pack's OG images simply improve. The `covers` script stays idempotent and re-runnable.

---

## 9. SEO/AEO

Honest scope: this is primarily **distribution/brand**, not crawlable text. Mechanics: improved OG/Twitter cards raise social CTR; descriptive `alt` text on the issue-page cover; cover art is referenced from the issue's existing `Article`/issue JSON-LD `image`. No new schema type required.

---

## 10. Rendering constraints & risks

| Risk | Mitigation |
|---|---|
| satori can't render furniture | Use SVG compositor (§7.2) — full stroke/clip-path/filter support. |
| librsvg font rendering quirks | Embed font base64 in SVG; **outline-paths fallback** for logo/title. |
| AI hero off-model / inconsistent | Locked recipe + Yob reference image + image-to-image + human pick. |
| Crowded furniture buries the hero | Furniture positions are edge-anchored templates; flash count is data-driven and capped (recommend ≤6). |
| Hero crop differs per aspect | Compositor reframes from the high-res master per target; art-direct hero with safe margins. |

---

## 11. Edge cases

- **No `hero`** → legacy satori cover (graceful, automatic).
- **Missing furniture fields** → omit those elements; cover still renders.
- **>6 flashes** → builder caps and warns (avoid an unreadable cover).
- **Long title** → auto-shrink one step / wrap to a third line (the look already uses a 3-line title).
- **Symbolic cover** (`coverStar:'symbolic'`) → skip the Yob reference; use the symbolic-scene recipe.

---

## 12. Testing & verification

- Composite the furniture over a **placeholder hero** and verify splash/square/og dimensions and legibility before any real art exists.
- Confirm the logo/title render with correct font (or outline fallback) under librsvg.
- Confirm `inject:og` points the issue's OG image at `NNN-og.png`.
- Confirm legacy issues (no `hero`) still produce their existing covers unchanged.
- Eyeball a full-bleed render at 100% for crowding; confirm scanlines/borders.
- Re-run `npm run covers` twice → identical output (idempotent).

---

## 13. Rollout checklist

1. `scripts/lib/cover-furniture.mjs` (SVG furniture builder) + `scripts/lib/cover-art-recipe.md`.
2. Add a heavy display TTF to `scripts/fonts/`; wire base64 embed (+ outline fallback).
3. Extend `generate-covers.mjs` to branch on `hero` (splash/square/og via compositor).
4. Extend `src/data/issues.js` schema with the optional furniture fields (document them).
5. `assets/yob-reference.png` canonical Yob.
6. Produce Issue #016 hero (first real splash), set its issues.js furniture, generate + commit PNGs.
7. Re-run `inject:og`; update `/archive` + homepage to consume the new assets.
8. Update CLAUDE.md: document the splash pipeline, issues.js furniture fields, SVG-vs-satori branch, forward-only scope, and the art-direction recipe location.
9. Verify per §12.

---

## 14. Resolved decisions

- Look: **dark neon-ZZAP fusion**, v2 (big logo banner + six flashes + scanlines).
- Subject: **Yob-anchored** default; symbolic for specials; no creator likeness.
- Hero: **AI-generated, human-picked**, reference-guided for Yob consistency.
- Compositor: **SVG + sharp** (not satori), because of stroke/clip-path/filter needs.
- Master → derivatives: hero drives splash + square + og.
- Scope: **forward-only** (Issue #016+), graceful legacy fallback, optional backfill later.

---

## 15. Out of scope (tracked elsewhere)

- **Concept A — Player Cards**: separate spec (pixel/procedural, satori pipeline).
- **Concept B — Boss Fight VS-screens**.
- Backfilling all legacy covers; animated covers; print; community cover voting.
