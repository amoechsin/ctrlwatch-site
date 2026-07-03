#!/usr/bin/env node
/**
 * verify-pipeline — the consistency gate (R15) + template contract (R19).
 *
 * Catches the "edited a source of truth, forgot a generator" class of silent
 * failure before it ships. Run locally via `npm run verify` (last step of
 * `npm run ship:issue`) and as step 1 of the Netlify build.
 *
 * Checks:
 *  1. Generated artifacts are fresh — build:creators and build:search are
 *     re-run to temp files and diffed against the committed JSON
 *     (generatedAt timestamps excluded).
 *  2. Every published issue carries exactly one of each fenced block /
 *     marker. Injectors with known legacy skips (#003/#010 have no High
 *     Scores anchor; #005 has no reviews anchor) are pinned to exactly that
 *     skip list — a NEW skip fails the gate, which is what stops injector
 *     variant-lists growing silently (R19).
 *  3. Cover assets exist for every published issue (square + og; splash +
 *     hero art when issues.js declares `hero`).
 *  4. Template contract for issues >= #014: required section ids present and
 *     the seo fence carries the ItemList JSON-LD.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { issues } from '../src/data/issues.js';

const problems = [];
const ok = (msg) => console.log(`  ✔ ${msg}`);
const bad = (msg) => { problems.push(msg); console.error(`  ✖ ${msg}`); };

const published = issues.filter((i) => i.published);

// ---------- 1. Generator freshness ----------
console.log('\n── Generator freshness');

function normalized(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  delete data.generatedAt;
  return JSON.stringify(data);
}

const tmp = mkdtempSync(join(tmpdir(), 'cw-verify-'));

const regen = [
  ['build:creators', 'src/data/creators.json', { CREATORS_OUT: join(tmp, 'creators.json') }, join(tmp, 'creators.json')],
  ['build:search', 'public/search-index.json', { SEARCH_OUT: join(tmp, 'search.json') }, join(tmp, 'search.json')],
];

for (const [script, committed, env, out] of regen) {
  try {
    execFileSync('npm', ['run', script], { env: { ...process.env, ...env }, stdio: 'pipe' });
    if (normalized(out) === normalized(committed)) {
      ok(`${committed} matches a fresh ${script} run`);
    } else {
      bad(`${committed} is STALE — re-run \`npm run ${script}\` and commit (source of truth changed without regeneration)`);
    }
  } catch (e) {
    bad(`npm run ${script} failed during verification: ${e.message.split('\n')[0]}`);
  }
}

// ---------- 2. Fenced blocks / markers per published issue ----------
console.log('\n── Fenced blocks per published issue');

// marker → issues allowed to be missing it (legacy templates with no anchor).
const FENCES = [
  ['<!-- ctrlwatch:og:start -->', new Set()],
  ['<!-- ctrlwatch:seo:start -->', new Set()],
  ['<!-- ctrlwatch:top50link:start -->', new Set(['003', '010'])],
  ['<!-- ctrlwatch:reviewlinks:start -->', new Set(['005'])],
  ['<!-- ctrlwatch:vslink:start -->', new Set()],
  ['<!-- ctrlwatch:subscribe:start -->', new Set()],
  ['<!-- ctrlwatch:trust:start -->', new Set()],
  ['<!-- ctrlwatch:tabhash:start -->', new Set()],
  ['/issues/_shell.css?v=', new Set()],
  ['cw-mode-v6', new Set()],
];

for (const issue of published) {
  const file = `public/issues/${issue.slug}/index.html`;
  if (!existsSync(file)) {
    bad(`${file} missing for published issue`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  for (const [marker, allowedMissing] of FENCES) {
    const count = html.split(marker).length - 1;
    if (count === 1) continue;
    if (count === 0 && allowedMissing.has(issue.slug)) continue;
    bad(`#${issue.slug}: expected exactly 1 × "${marker}", found ${count}${allowedMissing.size ? ` (known-legacy skips: ${[...allowedMissing].join(', ')})` : ''}`);
  }
}
if (!problems.length) ok(`all ${published.length} published issues carry the full fence set (known legacy skips honored)`);

// ---------- 3. Cover assets ----------
console.log('\n── Cover assets');
let coversOk = true;
for (const issue of published) {
  for (const suffix of ['square', 'og']) {
    const f = `public/covers/${issue.slug}-${suffix}.png`;
    if (!existsSync(f)) { bad(`${f} missing — run \`npm run covers\``); coversOk = false; }
  }
  if (issue.hero) {
    // issue.hero is a path under public/covers/ per the issues.js schema.
    for (const p of [`public/covers/${issue.slug}-splash.png`, `public/covers/${issue.hero}`]) {
      if (!existsSync(p)) { bad(`${p} missing for hero issue — run \`npm run covers\``); coversOk = false; }
    }
  }
}
if (coversOk) ok(`square+og PNGs present for all ${published.length} issues (splash+hero where declared)`);

// ---------- 4. Template contract (issues >= #014) ----------
console.log('\n── Template contract (#014+)');
const REQUIRED_IDS = ['press-start', 'player-profiles', 'boss-fight', 'high-scores'];
let contractOk = true;
for (const issue of published.filter((i) => Number(i.slug) >= 14)) {
  const html = readFileSync(`public/issues/${issue.slug}/index.html`, 'utf8');
  for (const id of REQUIRED_IDS) {
    if (!new RegExp(`id="${id}"`).test(html)) {
      bad(`#${issue.slug}: template contract violation — missing id="${id}" (required for #014+; injectors and the SEO ItemList parser depend on it)`);
      contractOk = false;
    }
  }
  const seoFence = html.split('<!-- ctrlwatch:seo:start -->')[1]?.split('<!-- ctrlwatch:seo:end -->')[0] ?? '';
  if (!seoFence.includes('ItemList')) {
    bad(`#${issue.slug}: seo fence has no ItemList JSON-LD — the ranking table markup no longer parses (td.rank contract)`);
    contractOk = false;
  }
}
if (contractOk) ok('all #014+ issues satisfy the template contract (section ids + parseable ranking table)');

// ---------- verdict ----------
if (problems.length) {
  console.error(`\n✖ verify-pipeline: ${problems.length} problem(s). Fix before shipping.\n`);
  process.exit(1);
}
console.log('\n✔ verify-pipeline: all checks passed.\n');
