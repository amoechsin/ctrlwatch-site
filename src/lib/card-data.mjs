// Single source of truth for Player Card rendering. Imported by the Node PNG
// generator (scripts/generate-cards.mjs) AND the Astro components. Pure data +
// pure functions only — no Node- or browser-specific APIs.

/** Single-char palette keys → hex. '.' (used in EMBLEMS) means transparent. */
export const PALETTE = {
  C: '#00F0FF', M: '#FF00AA', Y: '#FFE600', G: '#39FF14', O: '#FF6B00',
  R: '#FF2244', W: '#FFFFFF', E: '#E0E0E8', S: '#9090A0', K: '#0A0A12',
  D: '#1F9E0C', // dark-green shade — used in emblems for depth/shading
};

/** Each emblem is exactly 12 rows × 12 chars. '.' = transparent. Every char
 *  must be '.' or a PALETTE key. Centered with ~1-cell margin. */
export const EMBLEMS = {
  // --- six worked examples ---
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
  // --- authored emblems ---
  chip: [
    '............',
    '..SSSSSSSS..',
    '.S........S.',
    'SS.YY..YY.SS',
    'S..YY..YY..S',
    'SS.........S',
    'S..........S',
    'SS.YY..YY.SS',
    '.S.YY..YY.S.',
    '.S........S.',
    '..SSSSSSSS..',
    '............',
  ],
  book: [
    '............',
    '..YYYYYYYY..',
    '..YW....WY..',
    '..YW....WY..',
    '..YW....WY..',
    '..YYYYYY.Y..',
    '..YW....WY..',
    '..YW....WY..',
    '..YW....WY..',
    '..YYYYYYYY..',
    '............',
    '............',
  ],
  mask: [
    '............',
    '..YYYYYYYY..',
    '.YY......YY.',
    '.Y.WW..WW.Y.',
    '.Y........Y.',
    '.Y.W....W.Y.',
    '.Y..WWWW..Y.',
    '.YY......YY.',
    '..YYYYYYYY..',
    '............',
    '............',
    '............',
  ],
  note: [
    '............',
    '.......MMM..',
    '.......M.M..',
    '.......MMM..',
    '.......M....',
    '.......M....',
    '.......M....',
    '......MM....',
    '....MMM.....',
    '....MM......',
    '............',
    '............',
  ],
  column: [
    '............',
    '..OOOOOOOO..',
    '...OOOOOO...',
    '....O..O....',
    '....O..O....',
    '....O..O....',
    '....O..O....',
    '....O..O....',
    '....O..O....',
    '...OOOOOO...',
    '..OOOOOOOO..',
    '............',
  ],
  spiral: [
    '............',
    '....GGGG....',
    '..GG....GG..',
    '.G..GGGG..G.',
    '.G.G....G.G.',
    '.G.G.GG.G.G.',
    '.G.G.G..G.G.',
    '.G..GGGG.GG.',
    '.G..........',
    '..GG........',
    '....GGGG....',
    '............',
  ],
  podium: [
    '............',
    '.....RR.....',
    '....RRRR....',
    '....R..R....',
    '....RRRR....',
    '....RRRR....',
    '...RRRRRR...',
    '..RRRRRRRR..',
    '..R......R..',
    '..RRRRRRRR..',
    '............',
    '............',
  ],
  speech: [
    '............',
    '..RRRRRRRR..',
    '.R........R.',
    '.R..W..W..R.',
    '.R........R.',
    '.R.WWWWWW.R.',
    '.R........R.',
    '..RRRRRRRR..',
    '....RR......',
    '....R.......',
    '............',
    '............',
  ],
  clapper: [
    '............',
    '..MMMMMMMM..',
    '..MWMWMWMM..',
    '..MMMMMMMM..',
    '..M......M..',
    '..M.W....M..',
    '..M.W....M..',
    '..M.WWWW.M..',
    '..M......M..',
    '..MMMMMMMM..',
    '............',
    '............',
  ],
  filmstrip: [
    '..C......C..',
    '..CW....WC..',
    '..C......C..',
    '..CCCCCCCC..',
    '..C......C..',
    '..C......C..',
    '..C......C..',
    '..CCCCCCCC..',
    '..C......C..',
    '..CW....WC..',
    '..C......C..',
    '............',
  ],
  magnifier: [
    '............',
    '....SSSS....',
    '...S....S...',
    '..S......S..',
    '..S......S..',
    '..S......S..',
    '...S....S...',
    '....SSSS....',
    '.....SS.....',
    '......SS....',
    '.......SS...',
    '............',
  ],
  cassette: [
    '............',
    '..YYYYYYYY..',
    '.Y.Y....Y.Y.',
    '.Y.YYYYYY.Y.',
    '.Y........Y.',
    '.Y..Y..Y..Y.',
    '.Y..YYYY..Y.',
    '.Y........Y.',
    '.Y.YYYYYYYY.',
    '..YYYYYYYY..',
    '............',
    '............',
  ],
  gear: [
    '............',
    '.....OO.....',
    '....OOOO....',
    '..OOOOOOOO..',
    '..OO....OO..',
    '.OO..OO..OO.',
    '.OO..OO..OO.',
    '..OO....OO..',
    '..OOOOOOOO..',
    '....OOOO....',
    '.....OO.....',
    '............',
  ],
  reaction: [
    '............',
    '....SSSS....',
    '...S....S...',
    '..S.W..W.S..',
    '..S......S..',
    '..S......S..',
    '..S.S..S.S..',
    '..S..SS..S..',
    '...S....S...',
    '....SSSS....',
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
