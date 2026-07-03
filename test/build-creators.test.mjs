import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Runs the real script against test/fixtures/mini-tracker.md via the
// CREATORS_TRACKER / CREATORS_OUT env overrides — an end-to-end fixture test
// of the 400-line markdown-table parser (previously zero coverage).
function run(trackerPath) {
  const out = join(mkdtempSync(join(tmpdir(), 'cw-creators-')), 'creators.json');
  execFileSync('node', ['scripts/build-creators.mjs'], {
    env: { ...process.env, CREATORS_TRACKER: trackerPath, CREATORS_OUT: out },
  });
  return JSON.parse(readFileSync(out, 'utf8'));
}

test('parses the fixture tracker into creators.json', () => {
  const data = run('test/fixtures/mini-tracker.md');
  const by = Object.fromEntries(data.creators.map((c) => [c.name, c]));

  assert.equal(data.creators.length, 5);

  // In-Top-50 state comes from the TOP 50 table.
  assert.equal(by['Alpha Channel'].status, 'in-top-50');
  assert.equal(by['Alpha Channel'].currentRank, 1);
  assert.equal(by['Alpha Channel'].currentScore, 88);
  assert.equal(by['Alpha Channel'].genre, 'Science / Fixture');

  // Re-evaluated: two review entries + a re-eval record.
  assert.equal(by['Alpha Channel'].reEvaluated, true);
  assert.equal(by['Alpha Channel'].reviews.length, 2);
  assert.equal(by['Alpha Channel'].reEvaluations.length, 1);

  // Verdict derives from the band thresholds.
  assert.equal(by['Beta Bros'].verdict, 'EXCELLENT');
  assert.equal(by['Epsilon Eats'].verdict, 'GAME OVER');
  assert.equal(by['Epsilon Eats'].status, 'never-entered');

  // Dropped table.
  assert.equal(by['Gamma Lab'].status, 'dropped');
  assert.equal(by['Gamma Lab'].droppedAt, '#005');
  assert.equal(by['Gamma Lab'].droppedReason, 'Fixture drop reason');

  // Aliased issue tag survives as-is on the review entry.
  assert.equal(by['Delta Docs'].reviews[0].issue, '#004S');

  // Totals block.
  assert.equal(data.totals.creators, 5);
  assert.equal(data.totals.inTop50, 3);
  assert.equal(data.totals.dropped, 1);
});

test('fails loudly (exit 1) when the reviews section is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cw-broken-'));
  const broken = join(dir, 'broken.md');
  writeFileSync(broken, '# Tracker\n\nNo recognizable sections here.\n');
  assert.throws(() => run(broken), /status 1|Command failed/i);
});
