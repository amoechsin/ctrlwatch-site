# Painted Splash Covers (Concept D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Calibration note:** This plan is written for **inline execution by the author** (full repo context), so it locks interfaces/decisions and gives complete code for the non-obvious modules, rather than re-deriving trivial glue. A zero-context worker should read the spec (`docs/superpowers/specs/2026-06-19-painted-covers-design.md`) alongside it.

**Goal:** Build the deterministic painted-cover ("splash") generation system — per-issue ZZAP!64-idiom covers composited from `issues.js` over an AI-generated hero — wired into `npm run covers`, with a placeholder hero proving the pipeline before any real art exists.

**Architecture:** Furniture (all text/graphics) is built as a templated SVG string from issue data, rasterized with `@resvg/resvg-js` (font buffers loaded explicitly → deterministic, offline, full `paint-order`/`clip-path`/`filter` support). `sharp` composites three layers — background gradient → hero image → furniture overlay — into the final PNG, for three sizes (splash 1080×1440, square 1080×1080, og 1200×630). One painted hero drives all three. The generator branches on the presence of an `issue.hero` field; issues without it keep the existing satori covers unchanged (forward-only).

**Tech Stack:** Node ESM, `@resvg/resvg-js` (new dep, SVG→PNG with explicit fonts), `sharp` (compositing), Archivo Black (new heavy display TTF), Share Tech Mono (existing), `node:test`.

---

## Key decisions (locked)

- **Rasterizer:** `@resvg/resvg-js`, NOT satori (can't do furniture) and NOT librsvg (spec risk #1 — font/stroke quirks). Spike confirmed outlined skewed logo + glow + starburst + stroked title all render correctly with `fontBuffers`. The spec's outline-paths fallback is therefore **not needed**.
- **Display font:** `scripts/fonts/ArchivoBlack-Regular.ttf` (one heavy grotesque, OFL). Used for logo + cover title. Italic via `skewX(-10)` transform. Swappable later.
- **Hero art:** out of automated scope (AI-generated, human-picked per §6/§7.1). We ship a **deterministic placeholder hero** so the machine produces real output now. Operator swaps in real art per issue.
- **No fake published issue:** `issues.js` stays editorially clean. The splash path is proven via a committed sample render (`npm run covers:sample`) over the placeholder, not by publishing #016.
- **Compositing order (z, back→front):** bg gradient + rays → hero (full-bleed cover) → furniture (masthead/logo, strapline, flashes, title, cover-lines, price, barcode, scanlines, border).
- **Hard-rule compliance:** legacy issue HTML untouched; legacy covers unchanged (no `hero` → satori path); `npm run covers` stays the single idempotent entry point; OG wiring stays via `inject:og`.

## File structure

| File | Responsibility |
|---|---|
| `scripts/fonts/ArchivoBlack-Regular.ttf` | new heavy display face (committed) |
| `scripts/lib/cover-palette.mjs` | shared neon palette + `escapeXml` (tiny, importable by tests) |
| `scripts/lib/cover-furniture.mjs` | pure SVG-string builders: `buildBackgroundSvg`, `buildFurnitureSvg`, `starPath`, flash layout, per-aspect reframing. No I/O. |
| `scripts/lib/cover-compositor.mjs` | `loadCoverFonts`, `renderSvg`, `composeCover`, `TARGETS`. resvg + sharp. |
| `scripts/lib/cover-art-recipe.md` | AI prompt template + consistency lock (the §6 recipe) |
| `scripts/generate-placeholder-hero.mjs` | writes `public/covers/heroes/_placeholder.png` (deterministic Yob-ish blob) |
| `scripts/render-cover-sample.mjs` | renders a demo splash/square/og over the placeholder → `npm run covers:sample` |
| `scripts/generate-covers.mjs` | MODIFY: branch on `issue.hero` |
| `src/data/issues.js` | MODIFY: documented optional splash-furniture schema (commented example) |
| `test/cover-furniture.test.mjs` | unit tests for pure builders + geometry + flash cap |
| `package.json` | MODIFY: add `@resvg/resvg-js`; scripts `placeholder:hero`, `covers:sample` |
| `CLAUDE.md` | MODIFY: document splash pipeline + schema fields + recipe location |

---

## Task 1: Dependency + display font

**Files:** `package.json`, `scripts/fonts/ArchivoBlack-Regular.ttf`

- [ ] Install dep: `npm install --save-dev @resvg/resvg-js@latest`
- [ ] Fetch font: `curl -sL -o scripts/fonts/ArchivoBlack-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/archivoblack/ArchivoBlack-Regular.ttf"` (expect ~91KB; spike-verified URL).
- [ ] Verify: `node -e "import('@resvg/resvg-js').then(m=>console.log('resvg ok', !!m.Resvg))"` → `resvg ok true`; `node -e "console.log(require('fs').statSync('scripts/fonts/ArchivoBlack-Regular.ttf').size)"` → ~90988.
- [ ] Commit: `feat(covers): add resvg-js + Archivo Black display font`

## Task 2: Palette module + tests

**Files:** Create `scripts/lib/cover-palette.mjs`, Test `test/cover-furniture.test.mjs` (start the file)

`cover-palette.mjs`:
```js
export const NEON = {
  bg0: '#0A0A12', bg1: '#1a0a2e',
  cyan: '#00F0FF', magenta: '#FF00AA', yellow: '#FFE600',
  green: '#39FF14', orange: '#FF6B00', red: '#FF2244',
  text: '#E0E0E8', dark: '#0A0A12',
};
const XML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
export function escapeXml(s) { return String(s).replace(/[&<>"']/g, (c) => XML[c]); }
```

- [ ] Test `escapeXml` escapes the five entities (e.g. `escapeXml('A & B <c>')` → `'A &amp; B &lt;c&gt;'`).
- [ ] Run `node --test test/cover-furniture.test.mjs` → PASS.
- [ ] Commit: `feat(covers): neon palette + xml escaping`

## Task 3: Furniture geometry + builders (the core)

**Files:** Create `scripts/lib/cover-furniture.mjs`; extend `test/cover-furniture.test.mjs`

Interface (locked):
- `starPath(spikes, outerR, innerR)` → path `d` string, centered at origin, first point up.
- `MAX_FLASHES = 6`.
- `buildBackgroundSvg({ width, height, coverColor })` → `<svg>…</svg>` string: vertical `bg0→bg1` gradient + faint conic-ish ray fan (use overlapping low-opacity triangles from upper-center; resvg has no `conicGradient`).
- `buildFurnitureSvg(issue, { width, height })` → `{ svg, warnings }`. Renders, in order: masthead skewed banner + `CTRL+WATCH` logo (white fill, magenta stroke `paint-order="stroke"`, yellow `+`, glow filter, `skewX(-7)`), strapline (`ISSUE #NNN · MONTH YEAR · THE YOUTUBE REVIEW MAGAZINE`, Share Tech Mono, cyan), flashes (≤6, the five `kind`s: `tab|starburst|sizzler|banner|flash`, edge-anchored), cover title (theme, yellow fill + dark stroke + magenta offset shadow, big italic), cover-lines (`▶`-bulleted, mono cyan), price + barcode (bottom corners), scanline overlay (`<pattern>` of 1px lines @ ~0.06 alpha), neon border (`coverColor`, ~5–8px). Flash text uses `|` to split two lines (e.g. `96%|★ ESSENTIAL`).
- Per-aspect reframing via an internal `frame(width,height)` returning anchor coords + scale so square/og recompute positions (og is wide/short → smaller masthead, fewer stacked cover-lines).

Geometry/code notes:
- Glow `<filter>` = `feGaussianBlur stdDeviation≈width/180` + `feMerge`.
- `sizzler` = `starburst` + score text (it's a flash `kind`, not separate furniture).
- `>MAX_FLASHES` → push warning + slice to 6 (spec §11).
- All dynamic text through `escapeXml`. Strapline month/year parsed from `issue.date`.

Tests (pure, deterministic):
- `starPath(10, 90, 30)` returns a string starting with `M` and containing 20 vertices (`M` + 19 `L` + `Z`).
- `buildFurnitureSvg` output starts `<svg` / ends `</svg>`, contains the logo text and `escapeXml`’d title.
- 7 flashes → `warnings.length === 1` and rendered SVG contains exactly 6 flash groups (assert by a stable marker, e.g. `data-flash=` count).
- Different `{width,height}` → different masthead `font-size` (assert reframing actually changes output).

- [ ] Write tests → run → FAIL (module missing).
- [ ] Implement `cover-furniture.mjs` → tests PASS.
- [ ] Commit: `feat(covers): SVG furniture builder (masthead, flashes, title, scanlines)`

## Task 4: Compositor (resvg + sharp)

**Files:** Create `scripts/lib/cover-compositor.mjs`

Interface (locked):
```js
export const TARGETS = {
  splash: { w: 1080, h: 1440 },
  square: { w: 1080, h: 1080 },
  og:     { w: 1200, h: 630  },
};
export async function loadCoverFonts()         // → [archivoBlack, shareTechMono] Buffers (cached)
export function renderSvg(svg, w, h, fonts)    // → PNG Buffer via Resvg({ font:{ fontBuffers, loadSystemFonts:false }})
export async function composeCover(issue, { width, height, heroPath }) // → PNG Buffer
```
`composeCover`:
1. `bg = renderSvg(buildBackgroundSvg({width,height,coverColor}), …)`
2. `hero = await sharp(heroPath || PLACEHOLDER).resize(width, height, { fit:'cover', position:'centre' }).png().toBuffer()`
3. `{svg} = buildFurnitureSvg(issue,{width,height})`; `furn = renderSvg(svg,…)`
4. `return sharp(bg).composite([{ input: hero }, { input: furn }]).png().toBuffer()`

- [ ] Implement; smoke-check in node REPL against placeholder once Task 5 exists (no unit test — covered by sample verify).
- [ ] Commit: `feat(covers): hero+furniture compositor (resvg→sharp)`

## Task 5: Placeholder hero generator

**Files:** Create `scripts/generate-placeholder-hero.mjs`; `package.json` script `placeholder:hero`; output `public/covers/heroes/_placeholder.png`

- Deterministic 1200×1600 PNG: dark→space gradient, a glossy green (`#39FF14`/`#00F0FF` rim) blob lower-center with two eyes (Yob-ish), generous dark/empty top third for the masthead. Build the blob as an SVG, rasterize via `renderSvg`. No randomness.
- `npm run placeholder:hero` writes the file; idempotent.

- [ ] Implement + run → file exists, `sharp(...).metadata()` → 1200×1600.
- [ ] **Eyeball** the placeholder (Read the PNG): blob lower-center, top clear.
- [ ] Commit: `feat(covers): deterministic placeholder hero`

## Task 6: Sample render harness + visual verify

**Files:** Create `scripts/render-cover-sample.mjs`; `package.json` script `covers:sample`

- Hardcode a representative sample issue object (number `#016`, `THE GAMING ISSUE`, `coverColor:#00F0FF`, price `£4.99`, 2 cover-lines, the 5 demo flashes incl. a `sizzler`), `heroPath` = placeholder.
- Write `public/covers/_sample-splash.png`, `_sample-square.png`, `_sample-og.png`.

- [ ] Run `npm run covers:sample`; assert three files at exact TARGET dims.
- [ ] **Eyeball all three** (Read each PNG): masthead/logo legible, flashes not burying hero, title readable, scanlines + border present, hero reframed per aspect. Iterate furniture positions in Task 3 if crowded.
- [ ] Idempotency: run twice → identical bytes (`sha256sum`).
- [ ] Commit sample PNGs + harness: `feat(covers): sample render harness + verified placeholder splash/square/og`

## Task 7: Wire into generate-covers.mjs (branch on hero)

**Files:** MODIFY `scripts/generate-covers.mjs`

- Import `composeCover`, `TARGETS`. For each published issue: `if (issue.hero)` → write `${slug}-splash.png` (splash), `${slug}-square.png` (square), `${slug}-og.png` (og) via `composeCover` with `heroPath = public/covers/${issue.hero}`; `else` → existing satori `squareTemplate`/`ogTemplate` path (unchanged). Keep default OG.
- Since no published issue has `hero` yet, `npm run covers` output is **byte-identical** to before (legacy safety).

- [ ] Run `npm run covers` → completes; `git status` shows only the usual regenerated legacy PNGs (no splash files for live issues). Spot-check one legacy `-square.png` unchanged.
- [ ] Commit: `feat(covers): branch generate-covers on hero (splash path; legacy unchanged)`

## Task 8: Schema docs + art recipe

**Files:** MODIFY `src/data/issues.js` (commented schema block at top); create `scripts/lib/cover-art-recipe.md`

- In `issues.js`, add a top-of-file comment documenting the optional splash fields (`hero`, `coverStar`, `price`, `coverLines[]`, `flashes[{kind,text,color}]`) with the §7.4 example. Do **not** add a live published issue.
- `cover-art-recipe.md`: the §6 recipe — medium, palette, composition, subject, hard negative-prompt constraints, Yob reference + image-to-image note, fal.ai tooling, human-in-the-loop, the reusable prompt template.

- [ ] Commit: `docs(covers): issues.js splash schema + AI art recipe`

## Task 9: CLAUDE.md + plan/spec status

**Files:** MODIFY `CLAUDE.md`; MODIFY the spec status line

- Add a "Painted splash covers" subsection under BUILD & CONTENT PIPELINE: the SVG-vs-satori branch, `hero` schema fields, `npm run placeholder:hero` / `covers:sample`, forward-only scope, recipe location, and the rule "real hero art is operator-supplied (AI-generated, human-picked); never built on Netlify."
- Flip spec front-matter `Status:` → `Implemented (machine); awaiting first real hero (#016)`.

- [ ] Commit: `docs(covers): document splash pipeline in CLAUDE.md`

---

## Out of scope (explicit)
- Generating real AI hero art (operator step, fal.ai, human pick).
- Publishing a real Issue #016 (editorial workflow + continuity tracker).
- Editing legacy issue HTML or retrofitting legacy covers (forward-only; hard rule).
- Updating archive/homepage to *feature* the splash (square.png still feeds `IssueCard` unchanged) — optional polish, deferred.

## Final verification (§12)
- [ ] `npm run covers:sample` → three correct-dim PNGs, eyeballed legible.
- [ ] `npm run covers` twice → identical; legacy covers unchanged.
- [ ] `node --test` → all green.
- [ ] `npm run build` → site builds (no import breakage).
```
