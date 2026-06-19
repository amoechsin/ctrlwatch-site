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
