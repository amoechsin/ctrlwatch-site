# Player Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a collectible retro "Player Card" for every channel review — a pixel card with a procedural category emblem, five-axis stat bars, and a verdict-tier rarity treatment — shown live on each `/reviews/` page, used as that page's OG image, and collected in a new `/cards/` gallery.

**Architecture:** A single pure-JS source of truth (`src/lib/card-data.mjs`) drives both a Node PNG generator (`scripts/generate-cards.mjs`, satori→sharp, mirroring the existing cover generator) and the Astro on-page component. Cards are derived entirely from existing review frontmatter; the PNGs are committed (never built on Netlify).

**Tech Stack:** Astro 5, satori + sharp (already deps), `gray-matter` (new dev dep, for frontmatter parsing in the standalone script), `node --test` (built-in, new test runner).

**Spec:** `docs/superpowers/specs/2026-06-19-player-cards-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `src/lib/card-data.mjs` (create) | Pure data + functions: PALETTE, EMBLEMS (12×12 matrices), CATEGORIES, CATEGORY_MAP, RARITY; `resolveCategory`, `resolveCard`, `rankCards`, `emblemGrid`, `emblemCells`. Imported by both Node and Astro. |
| `test/card-data.test.mjs` (create) | `node --test` unit tests for the pure logic + emblem validity. |
| `scripts/generate-cards.mjs` (create) | Reads `src/content/reviews/*.md`, builds models, renders `public/cards/[slug].png` (744×1040) + `[slug]-og.png` (1200×630). |
| `src/components/PlayerCard.astro` (create) | Live on-page card (inline SVG emblem + CSS rarity). |
| `src/pages/cards/index.astro` (create) | The Card Binder gallery (PNG grid, tier/category filters, CollectionPage+ItemList JSON-LD). |
| `src/pages/reviews/[slug].astro` (modify) | Add the `PlayerCard` hero + set `ogImage`. |
| `src/components/Nav.astro` (modify) | Add `CARDS` nav link (desktop + mobile). |
| `astro.config.mjs` (modify) | Add `/cards/` to sitemap `customPages`. |
| `package.json` (modify) | Add `cards` + `test` scripts, `gray-matter` dev dep. |
| `CLAUDE.md` (modify) | Document the generator + pipeline order. |

---

## Task 1: Tooling — test runner + gray-matter

**Files:**
- Modify: `package.json`
- Create: `test/smoke.test.mjs`

- [ ] **Step 1: Add the `gray-matter` dev dependency**

Run: `npm install --save-dev gray-matter`
Expected: `package.json` gains `"gray-matter"` under `devDependencies`; install succeeds.

- [ ] **Step 2: Add `cards` and `test` npm scripts**

In `package.json`, the `"scripts"` block currently ends:
```json
    "build:creators": "node scripts/build-creators.mjs",
    "build:search": "node scripts/build-search-index.mjs"
  },
```
Replace with:
```json
    "build:creators": "node scripts/build-creators.mjs",
    "build:search": "node scripts/build-search-index.mjs",
    "cards": "node scripts/generate-cards.mjs",
    "test": "node --test"
  },
```

- [ ] **Step 3: Write a smoke test to prove the runner works**

Create `test/smoke.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('node:test runner is wired up', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: PASS — `tests 1`, `pass 1`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add package.json test/smoke.test.mjs
git commit -m "chore: add node:test runner and gray-matter dep for Player Cards"
```
Do NOT `git add` `node_modules/` or `package-lock.json` noise beyond what npm wrote; stage only the listed paths. (This repo has no .gitignore — never `git add .`.)

---

## Task 2: card-data — palette, categories, rarity (TDD)

**Files:**
- Create: `src/lib/card-data.mjs`
- Test: `test/card-data.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `test/card-data.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PALETTE, CATEGORIES, RARITY,
  resolveCategory, resolveCard, rankCards,
} from '../src/lib/card-data.mjs';

test('resolveCategory takes the primary genre token', () => {
  assert.equal(resolveCategory('Science / Animation'), 'science');
  assert.equal(resolveCategory('Video Games × Philosophy × Art'), 'gaming');
  assert.equal(resolveCategory('VFX / Filmmaking'), 'film');
  assert.equal(resolveCategory('Music Theory / Analysis'), 'music');
  assert.equal(resolveCategory('Totally Unknown Genre'), 'fallback');
});

test('resolveCard maps verdict→rarity and genre→motif/accent', () => {
  const c = resolveCard({
    slug: 'kurzgesagt', channel: 'Kurzgesagt', genre: 'Science / Animation',
    axes: { contentQuality: 96, consistency: 88, replayValue: 94, community: 78, xFactor: 95 },
    overall: 94, verdict: 'ESSENTIAL', originatingIssue: '#001',
  });
  assert.equal(c.material, 'holo');
  assert.equal(c.motif, 'atom');
  assert.equal(c.accent, PALETTE.C);
  assert.equal(c.categoryLabel, 'SCIENCE');
});

test('rankCards ranks by overall desc, ties by slug asc', () => {
  const m = rankCards([{ slug: 'b', overall: 80 }, { slug: 'a', overall: 80 }, { slug: 'c', overall: 90 }]);
  assert.equal(m.get('c'), 1);
  assert.equal(m.get('a'), 2);
  assert.equal(m.get('b'), 3);
});

test('every RARITY band has a material', () => {
  for (const v of ['ESSENTIAL', 'EXCELLENT', 'GOOD', 'AVERAGE', 'MEDIOCRE', 'GAME OVER']) {
    assert.ok(RARITY[v]?.material, `missing rarity for ${v}`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — cannot find module `../src/lib/card-data.mjs`.

- [ ] **Step 3: Create `src/lib/card-data.mjs` (data + resolvers; emblems come in Task 3)**

```js
// Single source of truth for Player Card rendering. Imported by the Node PNG
// generator (scripts/generate-cards.mjs) AND the Astro components. Pure data +
// pure functions only — no Node- or browser-specific APIs.

/** Single-char palette keys → hex. '.' (used in EMBLEMS) means transparent. */
export const PALETTE = {
  C: '#00F0FF', M: '#FF00AA', Y: '#FFE600', G: '#39FF14', O: '#FF6B00',
  R: '#FF2244', W: '#FFFFFF', E: '#E2E2E2', S: '#9090A0', K: '#0A0A12', D: '#1F9E0C',
};

/** category key → { label, accent (PALETTE key), motif (EMBLEMS key) }. */
export const CATEGORIES = {
  science:     { label: 'SCIENCE',     accent: 'C', motif: 'atom' },
  technology:  { label: 'TECH',        accent: 'C', motif: 'chip' },
  education:   { label: 'EDUCATION',   accent: 'G', motif: 'book' },
  cooking:     { label: 'COOKING',     accent: 'O', motif: 'chef-hat' },
  comedy:      { label: 'COMEDY',      accent: 'Y', motif: 'mask' },
  music:       { label: 'MUSIC',       accent: 'M', motif: 'note' },
  gaming:      { label: 'GAMING',      accent: 'G', motif: 'controller' },
  history:     { label: 'HISTORY',     accent: 'O', motif: 'column' },
  philosophy:  { label: 'PHILOSOPHY',  accent: 'G', motif: 'spiral' },
  politics:    { label: 'POLITICS',    accent: 'R', motif: 'podium' },
  news:        { label: 'NEWS',        accent: 'R', motif: 'speech' },
  film:        { label: 'FILM/VFX',    accent: 'M', motif: 'clapper' },
  videoessay:  { label: 'VIDEO ESSAY', accent: 'C', motif: 'filmstrip' },
  truecrime:   { label: 'TRUE CRIME',  accent: 'S', motif: 'magnifier' },
  travel:      { label: 'TRAVEL',      accent: 'C', motif: 'globe' },
  podcast:     { label: 'PODCAST',     accent: 'M', motif: 'mic' },
  underground: { label: 'UNDERGROUND', accent: 'Y', motif: 'cassette' },
  engineering: { label: 'ENGINEERING', accent: 'O', motif: 'gear' },
  reaction:    { label: 'REACTION',    accent: 'S', motif: 'reaction' },
  fallback:    { label: 'YOUTUBE',     accent: 'S', motif: 'play' },
};

/** Lowercased primary genre token → category key. Extend (Task 4) until the
 *  generator reports zero unmatched genres. */
export const CATEGORY_MAP = {
  'science': 'science',
  'technology': 'technology', 'tech': 'technology',
  'education': 'education', 'explainer': 'education',
  'news': 'news',
  'cooking': 'cooking', 'recipe': 'cooking', 'regional chinese cooking': 'cooking',
  'comedy': 'comedy', 'sketch comedy': 'comedy',
  'music theory': 'music', 'music analysis': 'music', 'music software': 'music', 'music': 'music',
  'video games': 'gaming', 'retro gaming': 'gaming', 'gaming': 'gaming',
  'history': 'history',
  'philosophy': 'philosophy',
  'political philosophy': 'politics', 'political essay': 'politics',
  'political commentary': 'politics', 'political comedy': 'politics',
  'political analysis': 'politics', 'political advocacy': 'politics', 'politics': 'politics',
  'vfx': 'film', 'filmmaking': 'film', 'film': 'film',
  'video essay': 'videoessay',
  'true crime': 'truecrime',
  'travel': 'travel',
  'podcast': 'podcast',
  'underground': 'underground',
  'engineering': 'engineering', 'restoration': 'engineering',
  'reaction': 'reaction',
};

/** verdict → { key, material }. Materials drive frame/overall styling. */
export const RARITY = {
  'ESSENTIAL': { key: 'essential', material: 'holo' },
  'EXCELLENT': { key: 'excellent', material: 'gold' },
  'GOOD':      { key: 'good',      material: 'silver' },
  'AVERAGE':   { key: 'average',   material: 'bronze' },
  'MEDIOCRE':  { key: 'mediocre',  material: 'matte' },
  'GAME OVER': { key: 'gameover',  material: 'cracked' },
};

/** Free-text genre → category key. Splits compound genres on "/" or "×". */
export function resolveCategory(genre) {
  const primary = String(genre).split(/[\/×]/)[0].trim().toLowerCase();
  return CATEGORY_MAP[primary] ?? 'fallback';
}

/** Review frontmatter (+ slug) → full card model used by both renderers. */
export function resolveCard(fm) {
  const categoryKey = resolveCategory(fm.genre);
  const cat = CATEGORIES[categoryKey];
  const rarity = RARITY[fm.verdict];
  if (!rarity) throw new Error(`Unknown verdict "${fm.verdict}" for ${fm.slug}`);
  return {
    slug: fm.slug,
    channel: fm.channel,
    genre: fm.genre,
    category: categoryKey,
    categoryLabel: cat.label,
    accent: PALETTE[cat.accent],
    motif: cat.motif,
    rarity: rarity.key,
    material: rarity.material,
    axes: fm.axes,
    overall: fm.overall,
    verdict: fm.verdict,
    originatingIssue: fm.originatingIssue,
  };
}

/** [{slug, overall}] → Map(slug → 1-based rank). Overall desc, ties by slug asc. */
export function rankCards(cards) {
  const sorted = [...cards].sort(
    (a, b) => b.overall - a.overall || (a.slug < b.slug ? -1 : 1),
  );
  const m = new Map();
  sorted.forEach((c, i) => m.set(c.slug, i + 1));
  return m;
}
```

- [ ] **Step 4: Run the tests — verify the three logic tests pass**

Run: `npm test`
Expected: PASS for `resolveCategory`, `resolveCard`, `rankCards`, and the RARITY test.
(`resolveCard` references emblems only by name string, so it passes before emblems exist.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/card-data.mjs test/card-data.test.mjs
git commit -m "feat(cards): add card-data resolvers (category/rarity/rank)"
```

---

## Task 3: card-data — emblems + grid helpers (TDD)

**Files:**
- Modify: `src/lib/card-data.mjs`
- Test: `test/card-data.test.mjs`

- [ ] **Step 1: Add the failing emblem-validity + helper tests**

Append to `test/card-data.test.mjs`:
```js
import { EMBLEMS, emblemGrid, emblemCells } from '../src/lib/card-data.mjs';

test('every category motif has a valid 12×12 emblem', () => {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const grid = EMBLEMS[cat.motif];
    assert.ok(grid, `missing emblem for category "${key}" → motif "${cat.motif}"`);
    assert.equal(grid.length, 12, `${cat.motif}: must be 12 rows`);
    for (const row of grid) {
      assert.equal(row.length, 12, `${cat.motif}: each row must be 12 chars`);
      for (const ch of row) {
        assert.ok(ch === '.' || PALETTE[ch], `${cat.motif}: bad char "${ch}"`);
      }
    }
  }
});

test('emblemGrid returns 12×12 of hex-or-null; emblemCells skips empties', () => {
  const grid = emblemGrid('atom');
  assert.equal(grid.length, 12);
  assert.equal(grid[0].length, 12);
  const cells = emblemCells('atom');
  assert.ok(cells.length > 0);
  assert.ok(cells.every((c) => typeof c.x === 'number' && typeof c.y === 'number' && c.fill.startsWith('#')));
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — `EMBLEMS`/`emblemGrid`/`emblemCells` are not exported.

- [ ] **Step 3: Add EMBLEMS (six worked examples) + helpers to `src/lib/card-data.mjs`**

Add after `PALETTE`:
```js
/** Each emblem is exactly 12 rows × 12 chars. '.' = transparent. Authored to
 *  read as the category motif at a glance. Six worked examples below; the rest
 *  are authored in Step 5 to the same contract (the validity test is the gate). */
export const EMBLEMS = {
  atom: [
    '............',
    '.....CC.....',
    '...G....G...',
    '............',
    '..C......C..',
    '.....YY.....',
    '.....YY.....',
    '..C......C..',
    '............',
    '...G....G...',
    '.....CC.....',
    '............',
  ],
  'chef-hat': [
    '............',
    '............',
    '...WWWWWW...',
    '..WWWWWWWW..',
    '..WWWWWWWW..',
    '...WWWWWW...',
    '..WWWWWWWW..',
    '..WWWWWWWW..',
    '...OOOOOO...',
    '...OOOOOO...',
    '............',
    '............',
  ],
  controller: [
    '............',
    '............',
    '...WW..WW...',
    '..WWWWWWWW..',
    '.WW.W..C.WW.',
    '.WWWWW.CCC..',
    '.WW.W..C.WW.',
    '..WWWWWWWW..',
    '...WW..WW...',
    '............',
    '............',
    '............',
  ],
  mic: [
    '.....WW.....',
    '....WWWW....',
    '....WWWW....',
    '....WWWW....',
    '...S.WW.S...',
    '...S.WW.S...',
    '....SWWS....',
    '.....SS.....',
    '.....WW.....',
    '....WWWW....',
    '............',
    '............',
  ],
  globe: [
    '....CCCC....',
    '..CC.G..CC..',
    '.C...G...C..',
    '.CGGGGGGGGC.',
    'C....G....C.',
    'CGGGGGGGGGGC',
    'C....G....C.',
    '.CGGGGGGGGC.',
    '.C...G...C..',
    '..CC.G..CC..',
    '....CCCC....',
    '............',
  ],
  play: [
    '............',
    '............',
    '....S.......',
    '....SS......',
    '....SSS.....',
    '....SSSS....',
    '....SSSS....',
    '....SSS.....',
    '....SS......',
    '....S.......',
    '............',
    '............',
  ],
};

/** motif → 12×12 array of hex-or-null (for div-grid renderers, e.g. satori). */
export function emblemGrid(motif) {
  const grid = EMBLEMS[motif] ?? EMBLEMS.play;
  return grid.map((row) => [...row].map((ch) => (ch !== '.' && PALETTE[ch] ? PALETTE[ch] : null)));
}

/** motif → [{x,y,fill}] for non-empty cells (for SVG <rect> renderers). */
export function emblemCells(motif) {
  const grid = EMBLEMS[motif] ?? EMBLEMS.play;
  const cells = [];
  grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.' && PALETTE[ch]) cells.push({ x, y, fill: PALETTE[ch] });
    });
  });
  return cells;
}
```

- [ ] **Step 4: Run tests — the validity test FAILS, listing missing motifs**

Run: `npm test`
Expected: FAIL — "missing emblem for category … → motif …" for every motif not yet authored (`chip`, `book`, `mask`, `note`, `column`, `spiral`, `podium`, `speech`, `clapper`, `filmstrip`, `magnifier`, `cassette`, `gear`, `reaction`). This is the worklist.

- [ ] **Step 5: Author the remaining emblems to the contract**

Add one entry to `EMBLEMS` for each missing motif listed by the failing test. Contract (enforced by the test): exactly 12 strings, each exactly 12 chars, every char `.` or a `PALETTE` key. Each should be recognizable as its subject:

| motif | depicts |
|---|---|
| `chip` | a microchip square with leg pins |
| `book` | an open book |
| `mask` | a comedy/theatre grin mask |
| `note` | a musical eighth-note |
| `column` | a classical pillar (history) |
| `spiral` | a spiral / swirl (philosophy) |
| `podium` | a speaker's podium/lectern |
| `speech` | a speech bubble |
| `clapper` | a film clapperboard |
| `filmstrip` | a vertical film strip with sprocket holes |
| `magnifier` | a magnifying glass |
| `cassette` | a cassette tape |
| `gear` | a cog/gear |
| `reaction` | a simple face (reaction) |

Use the six worked examples as the pattern. Keep shapes centered with a 1-cell margin.

- [ ] **Step 6: Run tests until green**

Run: `npm test`
Expected: PASS — all emblem rows are 12×12 and every category resolves to an authored emblem.

- [ ] **Step 7: Commit**

```bash
git add src/lib/card-data.mjs test/card-data.test.mjs
git commit -m "feat(cards): add full pixel emblem set + grid/cell helpers"
```

---

## Task 4: PNG generator — the card face

**Files:**
- Create: `scripts/generate-cards.mjs`

- [ ] **Step 1: Write the generator (card PNG only for now)**

Create `scripts/generate-cards.mjs`:
```js
#!/usr/bin/env node
/**
 * Generate a collectible Player Card PNG per channel review.
 *   public/cards/[slug].png       744×1040  portrait card
 *   public/cards/[slug]-og.png    1200×630  social/OG (added in Task 5)
 *
 * Re-runnable: `npm run cards`. Idempotent — overwrites existing PNGs.
 * Stack: satori (vdom → SVG) + sharp (SVG → PNG). Fonts cached in scripts/fonts/.
 * Data: src/content/reviews/*.md frontmatter, via src/lib/card-data.mjs.
 */
import satori from 'satori';
import sharp from 'sharp';
import matter from 'gray-matter';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveCard, resolveCategory, rankCards, emblemGrid } from '../src/lib/card-data.mjs';

const REVIEW_DIR = 'src/content/reviews';
const OUT_DIR = 'public/cards';
const FONT_DIR = 'scripts/fonts';

const AXES = [
  ['CONTENT', 'contentQuality'], ['CONSIST', 'consistency'], ['REPLAY', 'replayValue'],
  ['COMMUN', 'community'], ['X-FACTOR', 'xFactor'],
];

// material → frame gradient + overall-number color (satori-friendly: gradient
// background on the outer container forms the "border").
const FRAME = {
  holo:    { grad: 'linear-gradient(135deg,#00F0FF,#FF00AA,#FFE600,#39FF14)', overall: '#39FF14', ribbon: 'linear-gradient(90deg,#00F0FF,#39FF14)', ink: '#0A0A12' },
  gold:    { grad: 'linear-gradient(135deg,#FFE600,#FF9E00,#FFD24A)',         overall: '#FF9E00', ribbon: 'linear-gradient(90deg,#FFD24A,#FF9E00)', ink: '#0A0A12' },
  silver:  { grad: 'linear-gradient(135deg,#EEF0F6,#9AA0B0,#CFD4E0)',         overall: '#CDD2DE', ribbon: 'linear-gradient(90deg,#EEF0F6,#9AA0B0)', ink: '#0A0A12' },
  bronze:  { grad: 'linear-gradient(135deg,#E8B878,#A86A32,#D89A5A)',         overall: '#D89A5A', ribbon: 'linear-gradient(90deg,#E8B878,#A86A32)', ink: '#0A0A12' },
  matte:   { grad: 'linear-gradient(135deg,#34343F,#34343F)',                 overall: '#8A8A98', ribbon: '#2A2A34', ink: '#9090A0' },
  cracked: { grad: 'linear-gradient(135deg,#5A1A1A,#5A1A1A)',                 overall: '#FF2244', ribbon: '#3A0F16', ink: '#FF5A72' },
};

function pad3(n) { return String(n).padStart(3, '0'); }
function row(children, style = {}) { return { type: 'div', props: { style: { display: 'flex', ...style }, children } }; }
function txt(s, style) { return { type: 'div', props: { style: { display: 'flex', ...style }, children: String(s) } }; }

// 192px emblem: 12×12 grid of 16px cells.
function emblemNode(motif) {
  const grid = emblemGrid(motif);
  return row(
    grid.map((r) =>
      row(r.map((hex) => ({ type: 'div', props: { style: { display: 'flex', width: '16px', height: '16px', background: hex || 'transparent' } } }))),
    ),
    { flexDirection: 'column', width: '192px', height: '192px' },
  );
}

function cardNode(c, rank, total) {
  const f = FRAME[c.material];
  return {
    type: 'div',
    props: {
      style: { width: '744px', height: '1040px', display: 'flex', background: f.grad, padding: '16px', boxSizing: 'border-box', fontFamily: 'Share Tech Mono' },
      children: [{
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0C0C16', padding: '36px', boxSizing: 'border-box' },
          children: [
            // meta row
            row([
              txt(`No ${pad3(rank)} / ${pad3(total)}`, { fontSize: '22px', color: '#9090A0', letterSpacing: '0.08em' }),
              txt(c.categoryLabel, { fontSize: '22px', color: c.accent, letterSpacing: '0.08em' }),
            ], { justifyContent: 'space-between' }),
            // name
            txt(c.channel.toUpperCase(), { fontSize: '40px', color: '#FFFFFF', marginTop: '14px', marginBottom: '20px' }),
            // emblem panel
            row([emblemNode(c.motif)], { justifyContent: 'center', alignItems: 'center', background: '#05050B', border: '4px solid #2A2A3A', padding: '24px', marginBottom: '20px' }),
            // ribbon
            txt(c.verdict, { justifyContent: 'center', fontFamily: 'Press Start 2P', fontSize: '20px', color: f.ink, background: f.ribbon, padding: '16px', letterSpacing: '0.14em', marginBottom: '22px' }),
            // stat bars
            ...AXES.map(([label, key]) => row([
              txt(label, { width: '150px', fontSize: '20px', color: '#9090A0' }),
              row([{ type: 'div', props: { style: { display: 'flex', width: `${c.axes[key]}%`, height: '100%', background: c.accent } } }],
                { flex: 1, height: '20px', background: '#1A1A26', marginLeft: '12px', marginRight: '12px' }),
              txt(c.axes[key], { width: '54px', fontSize: '24px', color: '#E0E0E8', justifyContent: 'flex-end' }),
            ], { alignItems: 'center', marginBottom: '10px' })),
            // overall
            row([
              txt(c.overall, { fontSize: '96px', color: f.overall, lineHeight: 1 }),
              txt('OVERALL', { fontSize: '22px', color: '#9090A0', marginLeft: '16px' }),
            ], { alignItems: 'flex-end', justifyContent: 'center', marginTop: 'auto', paddingTop: '20px' }),
            // footer
            txt(`CTRL+WATCH · FIRST REVIEWED ${c.originatingIssue}`, { justifyContent: 'center', fontSize: '16px', color: '#606070', marginTop: '14px', letterSpacing: '0.08em' }),
          ],
        },
      }],
    },
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [pressStart2P, shareTechMono] = await Promise.all([
    readFile(join(FONT_DIR, 'PressStart2P-Regular.ttf')),
    readFile(join(FONT_DIR, 'ShareTechMono-Regular.ttf')),
  ]);
  const fonts = [
    { name: 'Press Start 2P', data: pressStart2P, weight: 400, style: 'normal' },
    { name: 'Share Tech Mono', data: shareTechMono, weight: 400, style: 'normal' },
  ];

  const files = (await readdir(REVIEW_DIR)).filter((f) => f.endsWith('.md'));
  const reviews = [];
  const unmatched = new Set();
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const { data } = matter(await readFile(join(REVIEW_DIR, file), 'utf8'));
    if (data.draft) continue;
    if (resolveCategory(data.genre) === 'fallback') unmatched.add(`${slug}: ${data.genre}`);
    reviews.push({ slug, ...data });
  }
  const ranks = rankCards(reviews.map((r) => ({ slug: r.slug, overall: r.overall })));
  const total = reviews.length;

  for (const r of reviews) {
    const c = resolveCard(r);
    const svg = await satori(cardNode(c, ranks.get(r.slug), total), { width: 744, height: 1040, fonts });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(join(OUT_DIR, `${r.slug}.png`), png);
    console.log(`+ ${r.slug}.png`);
  }

  if (unmatched.size) {
    console.warn(`\n⚠ ${unmatched.size} review(s) fell back to the default emblem — extend CATEGORY_MAP:`);
    for (const u of unmatched) console.warn(`  - ${u}`);
  }
  console.log(`\nDone. ${total} cards.`);
}

main();
```

- [ ] **Step 2: Run the generator**

Run: `npm run cards`
Expected: prints `+ <slug>.png` for each non-draft review and `Done. N cards.`; `public/cards/` now holds one PNG per review. Note any `⚠ … fell back` lines.

- [ ] **Step 3: Eyeball a few cards**

Open `public/cards/kurzgesagt.png` (holo) and two others spanning tiers in an image viewer. Confirm: emblem renders, five stat bars present, ribbon shows the verdict, frame gradient matches the tier, name/number/overall legible.

- [ ] **Step 4: Commit (code only; PNGs committed in Task 6 after OG exists)**

```bash
git add scripts/generate-cards.mjs
git commit -m "feat(cards): satori card-face PNG generator"
```

---

## Task 5: PNG generator — the OG/social variant

**Files:**
- Modify: `scripts/generate-cards.mjs`

- [ ] **Step 1: Add an OG (1200×630) template**

In `scripts/generate-cards.mjs`, add this function above `async function main()`:
```js
// 1200×630 social card: emblem + overall on the left, name + bars on the right.
function ogNode(c, rank, total) {
  const f = FRAME[c.material];
  return {
    type: 'div',
    props: {
      style: { width: '1200px', height: '630px', display: 'flex', background: f.grad, padding: '12px', boxSizing: 'border-box', fontFamily: 'Share Tech Mono' },
      children: [{
        type: 'div',
        props: {
          style: { display: 'flex', width: '100%', height: '100%', background: '#0C0C16', padding: '48px', boxSizing: 'border-box' },
          children: [
            // left column: emblem + overall
            row([
              emblemNode(c.motif),
              txt(c.overall, { fontSize: '120px', color: f.overall, lineHeight: 1, marginTop: '24px' }),
              txt(c.verdict, { fontFamily: 'Press Start 2P', fontSize: '16px', color: c.accent, marginTop: '12px' }),
            ], { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '340px' }),
            // right column: brand + name + bars
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: '48px', justifyContent: 'center' },
                children: [
                  txt('CTRL+WATCH · PLAYER PROFILE', { fontSize: '18px', color: '#39FF14', letterSpacing: '0.12em', marginBottom: '16px' }),
                  txt(c.channel, { fontSize: '52px', color: '#FFFFFF', marginBottom: '8px' }),
                  txt(`No ${pad3(rank)} / ${pad3(total)} · ${c.categoryLabel}`, { fontSize: '20px', color: '#9090A0', marginBottom: '28px' }),
                  ...AXES.map(([label, key]) => row([
                    txt(label, { width: '150px', fontSize: '18px', color: '#9090A0' }),
                    row([{ type: 'div', props: { style: { display: 'flex', width: `${c.axes[key]}%`, height: '100%', background: c.accent } } }],
                      { flex: 1, height: '16px', background: '#1A1A26', marginLeft: '12px' }),
                  ], { alignItems: 'center', marginBottom: '10px' })),
                ],
              },
            },
          ],
        },
      }],
    },
  };
}
```

- [ ] **Step 2: Render the OG variant in the loop**

In `main()`, inside the `for (const r of reviews)` loop, after the card `writeFile`, add:
```js
    const ogSvg = await satori(ogNode(c, ranks.get(r.slug), total), { width: 1200, height: 630, fonts });
    const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
    await writeFile(join(OUT_DIR, `${r.slug}-og.png`), ogPng);
```

- [ ] **Step 3: Run the generator**

Run: `npm run cards`
Expected: `public/cards/` now also holds `[slug]-og.png` for each review.

- [ ] **Step 4: Verify dimensions**

Run: `node -e "const s=require('sharp'); Promise.all(['public/cards/kurzgesagt.png','public/cards/kurzgesagt-og.png'].map(p=>s(p).metadata())).then(m=>console.log(m.map(x=>x.width+'x'+x.height)))"`
Expected: `[ '744x1040', '1200x630' ]`

- [ ] **Step 5: Commit (code)**

```bash
git add scripts/generate-cards.mjs
git commit -m "feat(cards): add 1200x630 OG variant to the card generator"
```

---

## Task 6: Generate all cards + commit the PNGs

**Files:**
- Create: `public/cards/*.png` (generated)

- [ ] **Step 1: Resolve any fallback genres**

If Task 4/5 printed `⚠ … fell back`, add the missing primary tokens to `CATEGORY_MAP` in `src/lib/card-data.mjs` (map each to the best existing category key), then re-run `npm run cards` until no `⚠` lines remain.

- [ ] **Step 2: Confirm count = non-draft reviews**

Run: `ls public/cards/*-og.png | wc -l` and compare to `ls src/content/reviews/*.md | wc -l` (minus any `draft: true`).
Expected: equal.

- [ ] **Step 3: Run the unit tests once more**

Run: `npm test`
Expected: PASS (no regressions).

- [ ] **Step 4: Commit the generated PNGs + any CATEGORY_MAP fix**

```bash
git add src/lib/card-data.mjs public/cards/
git commit -m "feat(cards): generate committed Player Card PNGs for all reviews"
```

---

## Task 7: Live PlayerCard component on the review page

**Files:**
- Create: `src/components/PlayerCard.astro`
- Modify: `src/pages/reviews/[slug].astro`

- [ ] **Step 1: Create `src/components/PlayerCard.astro`**

```astro
---
// Live, crisp on-page Player Card. Inline-SVG emblem + CSS rarity treatment.
// Data via card-data.mjs so it always matches the generated PNG.
import { resolveCard, emblemCells } from '../lib/card-data.mjs';

interface Review {
  slug: string; channel: string; genre: string;
  axes: { contentQuality: number; consistency: number; replayValue: number; community: number; xFactor: number };
  overall: number; verdict: string; originatingIssue: string;
}
interface Props { review: Review; rank: number; total: number; }
const { review, rank, total } = Astro.props;
const c = resolveCard(review);
const cells = emblemCells(c.motif);
const pad3 = (n: number) => String(n).padStart(3, '0');
const AXES: [string, keyof Review['axes']][] = [
  ['CONTENT', 'contentQuality'], ['CONSIST', 'consistency'], ['REPLAY', 'replayValue'],
  ['COMMUN', 'community'], ['X-FACTOR', 'xFactor'],
];
---
<figure class={`pcard pcard--${c.material}`} aria-label={`${c.channel} Player Card — ${c.verdict}, ${c.overall} out of 100`}>
  <div class="pcard-inner">
    <div class="pcard-meta"><span>Nº {pad3(rank)} / {pad3(total)}</span><span style={`color:${c.accent}`}>{c.categoryLabel}</span></div>
    <div class="pcard-name">{c.channel}</div>
    <div class="pcard-emblem">
      <svg viewBox="0 0 12 12" shape-rendering="crispEdges" role="img" aria-label={`${c.category} emblem`}>
        {cells.map((cell) => <rect x={cell.x} y={cell.y} width="1" height="1" fill={cell.fill} />)}
      </svg>
    </div>
    <div class="pcard-ribbon">{c.verdict}</div>
    <div class="pcard-stats">
      {AXES.map(([label, key]) => (
        <div class="pcard-srow">
          <span class="pcard-slabel">{label}</span>
          <span class="pcard-track"><span class="pcard-fill" style={`width:${c.axes[key]}%;background:${c.accent}`}></span></span>
          <span class="pcard-sval">{c.axes[key]}</span>
        </div>
      ))}
    </div>
    <div class="pcard-overall"><span class="pcard-num">{c.overall}</span><span class="pcard-olabel">OVERALL</span></div>
    <div class="pcard-foot">CTRL+WATCH · FIRST REVIEWED {c.originatingIssue}</div>
  </div>
</figure>

<style>
  .pcard { width: 300px; max-width: 100%; margin: 0 auto var(--space-lg); padding: 4px; }
  .pcard-inner { background: #0c0c16; padding: 20px; }
  .pcard-meta { display: flex; justify-content: space-between; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--text-muted); letter-spacing: 0.08em; }
  .pcard-name { font-family: 'Share Tech Mono', monospace; font-size: 20px; color: #fff; margin: 6px 0 12px; }
  .pcard-emblem { background: #05050b; border: 2px solid #2a2a3a; padding: 16px; margin-bottom: 14px; }
  .pcard-emblem svg { display: block; width: 100%; height: auto; image-rendering: pixelated; }
  .pcard-ribbon { font-family: 'Press Start 2P', monospace; font-size: 12px; text-align: center; padding: 10px; letter-spacing: 0.14em; margin-bottom: 14px; }
  .pcard-srow { display: grid; grid-template-columns: 70px 1fr 28px; align-items: center; gap: 8px; margin: 5px 0; }
  .pcard-slabel { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-muted); }
  .pcard-track { height: 10px; background: #1a1a26; position: relative; }
  .pcard-fill { position: absolute; left: 0; top: 0; bottom: 0; }
  .pcard-sval { font-family: 'VT323', monospace; font-size: 18px; color: var(--text-primary); text-align: right; }
  .pcard-overall { display: flex; align-items: baseline; justify-content: center; gap: 8px; margin-top: 14px; }
  .pcard-num { font-family: 'VT323', monospace; font-size: 56px; line-height: 1; }
  .pcard-olabel { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--text-muted); }
  .pcard-foot { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #606070; text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #1a1a26; letter-spacing: 0.08em; }

  /* rarity materials */
  .pcard--holo { background: linear-gradient(135deg,#00F0FF,#FF00AA,#FFE600,#39FF14); box-shadow: 0 0 18px rgba(0,240,255,.4); }
  .pcard--holo .pcard-ribbon { background: linear-gradient(90deg,#00F0FF,#39FF14); color: #0A0A12; }
  .pcard--holo .pcard-num { color: var(--green); text-shadow: var(--glow-green); }
  .pcard--gold { background: linear-gradient(135deg,#FFE600,#FF9E00,#FFD24A); box-shadow: 0 0 12px rgba(255,158,0,.3); }
  .pcard--gold .pcard-ribbon { background: linear-gradient(90deg,#FFD24A,#FF9E00); color: #0A0A12; }
  .pcard--gold .pcard-num { color: #FF9E00; }
  .pcard--silver { background: linear-gradient(135deg,#EEF0F6,#9AA0B0,#CFD4E0); }
  .pcard--silver .pcard-ribbon { background: linear-gradient(90deg,#EEF0F6,#9AA0B0); color: #0A0A12; }
  .pcard--silver .pcard-num { color: #CDD2DE; }
  .pcard--bronze { background: linear-gradient(135deg,#E8B878,#A86A32,#D89A5A); }
  .pcard--bronze .pcard-ribbon { background: linear-gradient(90deg,#E8B878,#A86A32); color: #0A0A12; }
  .pcard--bronze .pcard-num { color: #D89A5A; }
  .pcard--matte { background: #34343f; }
  .pcard--matte .pcard-ribbon { background: #2a2a34; color: #9090A0; }
  .pcard--matte .pcard-num { color: #8a8a98; }
  .pcard--cracked { background: #5a1a1a; box-shadow: 0 0 10px rgba(255,34,68,.25); }
  .pcard--cracked .pcard-ribbon { background: #3a0f16; color: #ff5a72; border: 1px solid #ff2244; }
  .pcard--cracked .pcard-num { color: #ff2244; }
  .pcard--cracked .pcard-emblem svg { filter: grayscale(.5) brightness(.85); }
</style>
```

- [ ] **Step 2: Wire it into the review page (hero + OG image)**

In `src/pages/reviews/[slug].astro`, add to the imports at the top of the frontmatter (after the existing `import ReviewCard …` line):
```js
import PlayerCard from '../../components/PlayerCard.astro';
import { rankCards } from '../../lib/card-data.mjs';
```
After the `const { Content } = await render(entry);` line, add:
```js
const cardRanks = rankCards(all.map((e) => ({ slug: e.id, overall: e.data.overall })));
const cardRank = cardRanks.get(entry.id)!;
const cardTotal = all.length;
const ogImage = `${SITE}/cards/${entry.id}-og.png`;
```
Change the layout open tag from:
```astro
<BaseLayout title={title} description={description}>
```
to:
```astro
<BaseLayout title={title} description={description} ogImage={ogImage}>
```
Add the card as the hero — immediately after the closing `</header>` and before `<div class="review-body prose">`:
```astro
      <PlayerCard
        review={{ slug: entry.id, channel: d.channel, genre: d.genre, axes: d.axes, overall: d.overall, verdict: d.verdict, originatingIssue: d.originatingIssue }}
        rank={cardRank}
        total={cardTotal}
      />
```
(The page's existing `head` slot already loads VT323/Russo One/Exo 2, which the card's `--num`/labels use.)

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: build succeeds. Then run `npm run preview` and open `http://localhost:4321/reviews/kurzgesagt/` — the holo card hero renders with emblem, bars, and overall; view-source shows `og:image` = `https://ctrl-watch.xyz/cards/kurzgesagt-og.png`.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlayerCard.astro src/pages/reviews/[slug].astro
git commit -m "feat(cards): live PlayerCard hero + per-review OG image"
```

---

## Task 8: The `/cards/` gallery (Card Binder)

**Files:**
- Create: `src/pages/cards/index.astro`

- [ ] **Step 1: Create the gallery page**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { resolveCard, rankCards } from '../../lib/card-data.mjs';

const SITE = 'https://ctrl-watch.xyz';
const entries = (await getCollection('reviews')).filter((e) => !e.data.draft);
const ranks = rankCards(entries.map((e) => ({ slug: e.id, overall: e.data.overall })));
const total = entries.length;

const cards = entries
  .map((e) => {
    const c = resolveCard({ slug: e.id, channel: e.data.channel, genre: e.data.genre, axes: e.data.axes, overall: e.data.overall, verdict: e.data.verdict, originatingIssue: e.data.originatingIssue });
    return { ...c, rank: ranks.get(e.id)! };
  })
  .sort((a, b) => a.rank - b.rank);

const tiers = ['ESSENTIAL', 'EXCELLENT', 'GOOD', 'AVERAGE', 'MEDIOCRE', 'GAME OVER'];
const categories = [...new Set(cards.map((c) => c.categoryLabel))].sort();

const title = 'The Card Binder — Every Channel as a Player Card | CTRL+WATCH';
const description = `Collect all ${total} CTRL+WATCH Player Cards: every reviewed channel as a retro stat card, ranked and rarity-graded. Filter by tier or category.`;

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'The Card Binder',
  url: `${SITE}/cards/`,
  description,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: total,
    itemListElement: cards.map((c) => ({ '@type': 'ListItem', position: c.rank, name: c.channel, url: `${SITE}/reviews/${c.slug}/` })),
  },
};
---
<BaseLayout title={title} description={description}>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(itemList)} />
  </Fragment>

  <section class="binder">
    <div class="container">
      <header class="binder-head">
        <h1 class="binder-title">▶ THE CARD BINDER</h1>
        <p class="binder-tagline">{total} CARDS · RANKED · RARITY-GRADED · GOTTA REVIEW 'EM ALL</p>
      </header>

      <div class="binder-filters" role="group" aria-label="Filter cards">
        <button class="bf-btn is-on" data-filter="all">ALL</button>
        {tiers.map((t) => <button class="bf-btn" data-filter={`tier:${t}`}>{t}</button>)}
        {categories.map((cat) => <button class="bf-btn" data-filter={`cat:${cat}`}>{cat}</button>)}
      </div>

      <ul class="binder-grid" role="list">
        {cards.map((c) => (
          <li class="binder-cell" data-tier={c.verdict} data-cat={c.categoryLabel}>
            <a href={`/reviews/${c.slug}/`}>
              <img src={`/cards/${c.slug}.png`} width="372" height="520" loading="lazy" alt={`${c.channel} Player Card — ${c.verdict}, ${c.overall}/100`} />
            </a>
            <a class="binder-dl" href={`/cards/${c.slug}.png`} download>↓ SAVE CARD</a>
          </li>
        ))}
      </ul>
    </div>
  </section>
</BaseLayout>

<style>
  .binder { padding: var(--space-xl) 0; min-height: 60vh; }
  .binder-head { border-bottom: 1px solid var(--border); padding-bottom: var(--space-md); margin-bottom: var(--space-lg); }
  .binder-title { font-size: var(--text-2xl); color: var(--text-primary); letter-spacing: 0.05em; margin-bottom: var(--space-sm); }
  .binder-tagline { font-family: 'Press Start 2P', monospace; font-size: 9px; color: var(--green); letter-spacing: 0.12em; text-shadow: var(--glow-green); }
  .binder-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg); }
  .bf-btn { font-family: 'Share Tech Mono', monospace; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); background: transparent; border: 1px solid var(--border); padding: 6px 10px; cursor: pointer; }
  .bf-btn.is-on, .bf-btn:hover { color: var(--yellow); border-color: var(--yellow); }
  .binder-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-lg); }
  .binder-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .binder-cell img { width: 100%; height: auto; display: block; }
  .binder-cell.is-hidden { display: none; }
  .binder-dl { font-family: 'Share Tech Mono', monospace; font-size: var(--text-xs); color: var(--cyan); text-decoration: none; }
  .binder-dl:hover { text-shadow: var(--glow-cyan); }
</style>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('.bf-btn');
  const cells = document.querySelectorAll<HTMLLIElement>('.binder-cell');
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.toggle('is-on', b === btn));
    const f = btn.dataset.filter!;
    cells.forEach((cell) => {
      const show = f === 'all'
        || (f.startsWith('tier:') && cell.dataset.tier === f.slice(5))
        || (f.startsWith('cat:') && cell.dataset.cat === f.slice(4));
      cell.classList.toggle('is-hidden', !show);
    });
  }));
</script>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds, `/cards/index.html` emitted. Run `npm run preview`, open `http://localhost:4321/cards/`: a grid of card PNGs, filter buttons hide/show by tier and category, each card links to its review, `↓ SAVE CARD` downloads the PNG.

- [ ] **Step 3: Validate the JSON-LD**

Copy the `<script type="application/ld+json">` block from the built `dist/cards/index.html` into https://validator.schema.org/ — expect a valid `CollectionPage` with an `ItemList`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/cards/index.astro
git commit -m "feat(cards): add /cards/ Card Binder gallery with filters + JSON-LD"
```

---

## Task 9: Nav link + sitemap entry

**Files:**
- Modify: `src/components/Nav.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add CARDS to the desktop nav**

In `src/components/Nav.astro`, find the desktop `BOSS FIGHTS` item:
```astro
      <li>
        <a href="/vs" class:list={['nav-link', { active: isActive('/vs') }]}>BOSS FIGHTS</a>
      </li>
```
Add immediately after it:
```astro
      <li>
        <a href="/cards" class:list={['nav-link', { active: isActive('/cards') }]}>CARDS</a>
      </li>
```

- [ ] **Step 2: Add CARDS to the mobile nav**

In the same file, find the mobile `BOSS FIGHTS` item:
```astro
      <li>
        <a href="/vs" class:list={['mobile-nav-link', { active: isActive('/vs') }]}>BOSS FIGHTS</a>
      </li>
```
Add immediately after it:
```astro
      <li>
        <a href="/cards" class:list={['mobile-nav-link', { active: isActive('/cards') }]}>CARDS</a>
      </li>
```

- [ ] **Step 3: Add `/cards/` to the sitemap**

In `astro.config.mjs`, find:
```js
const extraPages = [
  `${SITE}/creators/`,
  `${SITE}/start/`,
  `${SITE}/top50/`,
```
Change to:
```js
const extraPages = [
  `${SITE}/creators/`,
  `${SITE}/start/`,
  `${SITE}/top50/`,
  `${SITE}/cards/`,
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: build succeeds; `dist/sitemap-0.xml` (or `sitemap-index.xml`'s child) contains `https://ctrl-watch.xyz/cards/`. The nav shows `CARDS` in desktop and mobile menus (check in preview).

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro astro.config.mjs
git commit -m "feat(cards): add CARDS nav link + sitemap entry"
```

---

## Task 10: Docs + final verification

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add `cards` to the build pipeline order**

In `CLAUDE.md`, find (under "BUILD & CONTENT PIPELINE"):
```
`issues.js` update → `npm run covers` → `npm run inject:og` → `npm run inject:seo` → `npm run inject:top50link` → `npm run inject:reviewlinks` → `npm run inject:vslinks` → `npm run inject:shell` → update tracker → `npm run build:creators` → `npm run build:search` → commit.
```
Replace with (insert `npm run cards` after `npm run covers`):
```
`issues.js` update → `npm run covers` → `npm run cards` → `npm run inject:og` → `npm run inject:seo` → `npm run inject:top50link` → `npm run inject:reviewlinks` → `npm run inject:vslinks` → `npm run inject:shell` → update tracker → `npm run build:creators` → `npm run build:search` → commit.
```

- [ ] **Step 2: Document the generator**

In `CLAUDE.md`, under the "Canonical Player Profiles (`/reviews/[slug]/`)" section, add a new bullet at the end of that section:
```
- `npm run cards` (`scripts/generate-cards.mjs`) generates a collectible **Player Card** PNG per review — `public/cards/[slug].png` (744×1040) + `[slug]-og.png` (1200×630) — from review frontmatter via `src/lib/card-data.mjs` (the single source of truth shared with the on-page `PlayerCard.astro` and the `/cards/` gallery). Pixel category emblem + five-axis bars + verdict-tier rarity. Committed PNGs; never built on Netlify (same rule as covers). Re-run after adding/re-scoring a review (rank numbers shift). The review page's OG image points at `[slug]-og.png`.
```

- [ ] **Step 3: Full clean build + tests**

Run: `npm test && npm run cards && npm run build`
Expected: tests pass; cards regenerate with no `⚠` lines; build succeeds.

- [ ] **Step 4: Verification checklist (spec §11)**

Confirm each:
- `ls public/cards/*-og.png | wc -l` equals the non-draft review count.
- Open one card per tier (holo/gold/silver/bronze/matte/cracked) — rarity treatment matches verdict.
- `/reviews/<slug>/` shows the live card hero; its `og:image` resolves to the PNG.
- `/cards/` filters work; JSON-LD validates.
- No genre fell back unexpectedly (generator log clean).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md public/cards/
git commit -m "docs(cards): document Player Card generator + pipeline order"
```

---

## Self-review notes (author)

- **Spec coverage:** data model (T2), emblems (T3), generator + OG (T4–T5), committed PNGs (T6), on-page component + OG wiring (T7), `/cards/` gallery + JSON-LD (T8), nav + sitemap (T9), CLAUDE.md + verification (T10). All §12 rollout items covered.
- **Deviation from spec:** `card-data` is `.mjs` (not `.ts`) so the standalone Node generator and Astro can share one module without a TS build step (the cover generator already imports `src/data/issues.js`). The spec's intent — one source of truth — is preserved.
- **Emblems:** six are fully authored; the rest are authored to a test-enforced contract (T3 Step 5) — the validity test fails until all referenced motifs exist, so there is no silent gap.
- **Type consistency:** `resolveCard`, `rankCards`, `emblemGrid`, `emblemCells`, `PALETTE`, `CATEGORIES`, `RARITY` names are used identically across generator, component, and gallery.
