import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTop50, decodeEntities } from '../scripts/lib/top50-parse.mjs';

function tableOf(n, { startAt = 1, cls = 'top50-table' } = {}) {
  const rows = Array.from({ length: n }, (_, i) => {
    const pos = startAt + i;
    return `<tr><td class="rank">${pos}</td><td>Channel ${pos}</td><td class="score">9${pos % 10}</td><td>Genre</td><td>—</td></tr>`;
  }).join('\n');
  return `<html><body><table class="${cls}"><thead><tr><th>Rank</th><th>Channel</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

test('parses a contiguous 50-row ranking table', () => {
  const items = parseTop50(tableOf(50));
  assert.equal(items.length, 50);
  assert.deepEqual(items[0], { position: 1, name: 'Channel 1' });
  assert.deepEqual(items[49], { position: 50, name: 'Channel 50' });
});

test('rejects non-contiguous rankings (top rows rendered outside the table)', () => {
  // 47 rows starting at position 4 — the exact failure mode the validation
  // exists for; must return [] so the ItemList is omitted, not broken.
  assert.deepEqual(parseTop50(tableOf(47, { startAt: 4 })), []);
});

test('rejects tables under 40 rows', () => {
  assert.deepEqual(parseTop50(tableOf(10)), []);
});

test('falls back to header sniffing when the table class is missing', () => {
  const items = parseTop50(tableOf(50, { cls: 'some-legacy-class' }));
  assert.equal(items.length, 50);
});

test('returns [] when no ranking table exists', () => {
  assert.deepEqual(parseTop50('<html><body><p>No table.</p></body></html>'), []);
});

test('strips movement parentheticals from channel cells', () => {
  const html = tableOf(50).replace('Channel 7<', 'Defunctland (Prev. #32)<');
  const items = parseTop50(html);
  assert.equal(items[6].name, 'Defunctland');
});

test('decodeEntities strips tags and decodes the escape set', () => {
  assert.equal(decodeEntities('<em>Dan &amp; Yob&#39;s &quot;Show&quot;</em>'), 'Dan & Yob\'s "Show"');
});
