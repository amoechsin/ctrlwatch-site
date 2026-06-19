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
