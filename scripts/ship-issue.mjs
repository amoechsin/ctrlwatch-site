#!/usr/bin/env node
/**
 * ship:issue — the one-command issue pipeline (R13).
 *
 * Shipping an issue used to be ~13 ordered manual npm commands documented
 * only in CLAUDE.md; a forgotten step failed silently (no cover, no social
 * card, unsearchable issue). This orchestrator runs every step in order,
 * stops on the first failure, and prints the completion checklist of the
 * things a script can't do for you.
 *
 * Usage:
 *   npm run ship:issue            # full pipeline for the current issues.js
 *   npm run ship:issue -- --dry   # print the plan without running anything
 *
 * Precondition (not automated): public/issues/NNN/index.html exists and
 * issues.js has the new entry with published: true.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { issues } from '../src/data/issues.js';

const STEPS = [
  ['covers', 'Cover PNGs (square/og, splash when hero) for all published issues'],
  ['cards', 'Player Card PNGs for all reviews (ranks shift every issue)'],
  ['inject:og', 'OG/Twitter meta block per issue'],
  ['inject:seo', 'Meta description + canonical + Top 50 ItemList per issue'],
  ['inject:top50link', 'Live-Top-50 banner atop each High Scores section'],
  ['inject:reviewlinks', 'Canonical /reviews/ links atop Player Profiles'],
  ['inject:vslinks', 'Canonical /vs/ link atop each Boss Fight'],
  ['inject:subscribe', 'Subscribe banner above each issue footer'],
  ['inject:trust', 'Per-section trust legend in each issue footer'],
  ['inject:tabhash', 'Hash-based tab routing retrofit'],
  ['inject:shell', '_shell.css link + mode script (content-hashed)'],
  ['build:creators', 'creators.json from the continuity tracker'],
  ['build:search', 'Search index from issues + creators + tracker'],
  ['verify', 'Consistency gate (scripts/verify-pipeline.mjs)'],
];

const dry = process.argv.includes('--dry');
const latest = issues.filter((i) => i.published).at(-1);

console.log(`\n▶ SHIP ISSUE — latest published: #${latest.slug} "${latest.title}"\n`);

const issueHtml = `public/issues/${latest.slug}/index.html`;
if (!existsSync(issueHtml)) {
  console.error(`✖ ${issueHtml} does not exist. Write the issue HTML first (ctrlwatch-html-generation skill), then re-run.`);
  process.exit(1);
}

for (const [script, why] of STEPS) {
  console.log(`\n── ${script} — ${why}`);
  if (dry) continue;
  const r = spawnSync('npm', ['run', script], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n✖ Pipeline stopped: "npm run ${script}" exited ${r.status}. Nothing after it has run.`);
    process.exit(r.status ?? 1);
  }
}

console.log(`
${dry ? 'DRY RUN — nothing executed. The real run does all of the above, then:' : '✔ Pipeline complete.'}

── COMPLETION CHECKLIST (the parts a script can't do) ──────────────
  [ ] Continuity tracker updated for #${latest.slug} (ctrlwatch-tracker-update)
      — if you update it AFTER this run, re-run: npm run build:creators && npm run build:search && npm run verify
  [ ] New Player Profile .md files landed in src/content/reviews/ (one per reviewed channel)
  [ ] New Boss Fight .md in src/content/vs/ (slug alphabetical)
  [ ] Hero art (if painted cover): public/covers/heroes/${latest.slug}-hero.png committed
  [ ] npm run build && npm test — green
  [ ] git add <explicit paths> && commit && push
  [ ] Distribution pack: ctrlwatch-promoter agent → npm run promote:open -- ${latest.slug}
  [ ] 48h later: GOATCOUNTER_TOKEN=… npm run promote:status -- ${latest.slug}
────────────────────────────────────────────────────────────────────
`);
