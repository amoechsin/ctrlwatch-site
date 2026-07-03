import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issueUrlFor } from '../src/lib/issue-url.mjs';
import { verdictFor, VERDICT_BANDS, VERDICTS } from '../src/lib/verdict-bands.mjs';

const slugs = new Set(['001', '004', '012']);

test('plain tags resolve against published slugs', () => {
  assert.equal(issueUrlFor('#012', slugs), '/issues/012/');
  assert.equal(issueUrlFor('#013', slugs), null);
});

test('#004S aliases to /issues/004/; #004C never links', () => {
  assert.equal(issueUrlFor('#004S', slugs), '/issues/004/');
  assert.equal(issueUrlFor('#004C', slugs), null);
});

test('unknown letter suffixes strip to the numeric slug', () => {
  assert.equal(issueUrlFor('#012B', slugs), '/issues/012/');
});

test('verdict bands: edges land on the canonical rubric', () => {
  assert.equal(verdictFor(90), 'ESSENTIAL');
  assert.equal(verdictFor(89), 'EXCELLENT');
  assert.equal(verdictFor(80), 'EXCELLENT');
  assert.equal(verdictFor(79), 'GOOD');
  assert.equal(verdictFor(70), 'GOOD');
  assert.equal(verdictFor(69), 'AVERAGE');
  assert.equal(verdictFor(60), 'AVERAGE');
  assert.equal(verdictFor(59), 'MEDIOCRE');
  assert.equal(verdictFor(50), 'MEDIOCRE');
  assert.equal(verdictFor(49), 'GAME OVER');
  assert.equal(verdictFor(0), 'GAME OVER');
  assert.equal(verdictFor(null), null);
});

test('VERDICTS list matches the bands in order', () => {
  assert.deepEqual(VERDICT_BANDS.map((b) => b.verdict), VERDICTS);
});
