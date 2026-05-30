#!/usr/bin/env node
/**
 * Build src/data/search-index.json from structured sources.
 *
 * Sources:
 *   src/data/issues.js                          (issue titles + subtitles)
 *   src/data/creators.json                      (channel names)
 *   src/content/reviews/*.md                     (canonical Player Profiles)
 *   docs/continuity/CTRLWATCH_Continuity_Tracker.md
 *     - "## TIME CAPSULE SUBJECTS — COMPLETE LIST"
 *     - "## BOSS FIGHTS — COMPLETE LIST"
 *     - "## SPECIAL FEATURES USED"
 *
 * Output schema:
 *   {
 *     generatedAt, totals,
 *     entries: [
 *       { type, title, subtitle, url, issueTag }
 *     ]
 *   }
 *
 * type ∈ "issue" | "review" | "channel" | "time-capsule" | "boss-fight" | "special"
 *
 * A channel with a canonical /reviews/ page is emitted as a "review" (linking
 * to that page); channels without one stay as "channel" (linking to the
 * /creators/ index) — one entry per channel, no duplicates.
 *
 * Run: `npm run build:search`. Re-run after editing the tracker or
 * issues.js. Fails loudly on tracker parse errors.
 *
 * Out of scope (per brief): Yob's Save Point letter writers — these
 * live inside individual issue HTMLs without a structured source.
 * Revisit when the tracker has a Letters section.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const TRACKER = 'docs/continuity/CTRLWATCH_Continuity_Tracker.md';
const CREATORS = 'src/data/creators.json';
const REVIEWS_DIR = 'src/content/reviews';
const OUT = 'src/data/search-index.json';

const TRACKER_ALIASES = {
  '#004S': '004',
  '#004C': null,
};

const publishedSlugs = new Set(issues.filter((i) => i.published).map((i) => i.slug));

function issueUrl(tag) {
  if (tag in TRACKER_ALIASES) {
    const aliased = TRACKER_ALIASES[tag];
    return aliased && publishedSlugs.has(aliased) ? `/issues/${aliased}/` : null;
  }
  const stripped = tag.replace(/^#/, '').replace(/[A-Za-z]+$/, '');
  return publishedSlugs.has(stripped) ? `/issues/${stripped}/` : null;
}

const warnings = [];
function warn(m) { warnings.push(m); }

/* --------------------------------------------------------------- */
/* Sources                                                          */
/* --------------------------------------------------------------- */

const src = await readFile(TRACKER, 'utf8');
const lines = src.split('\n');

const creatorsRaw = JSON.parse(await readFile(CREATORS, 'utf8'));

/* ---- Canonical reviews (frontmatter map, slug → fields) ---- */
function fmField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}
const reviewBySlug = new Map();
for (const f of (await readdir(REVIEWS_DIR)).filter((x) => x.endsWith('.md'))) {
  const raw = await readFile(`${REVIEWS_DIR}/${f}`, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { warn(`review ${f} — no frontmatter, skipped`); continue; }
  const fm = m[1];
  if (fmField(fm, 'draft') === 'true') continue;
  reviewBySlug.set(f.replace(/\.md$/, ''), {
    channel: fmField(fm, 'channel'),
    genre: fmField(fm, 'genre') || '',
    overall: fmField(fm, 'overall') || '',
    verdict: fmField(fm, 'verdict') || '',
    issue: fmField(fm, 'originatingIssue'),
  });
}

function findSection(re, startIdx = 0) {
  for (let i = startIdx; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

const entries = [];

/* ---- Issues ---- */
for (const i of issues.filter((x) => x.published)) {
  entries.push({
    type: 'issue',
    title: i.title,
    subtitle: i.subtitle,
    url: `/issues/${i.slug}/`,
    issueTag: i.number,
  });
}

/* ---- Channels (from creators.json) ----
 * If the channel has a canonical /reviews/ page, emit it as a "review"
 * (richer destination + score/verdict); otherwise a "channel" → /creators/.
 */
for (const c of creatorsRaw.creators) {
  // Surface the most recent / current issue tag if available, for display.
  const lastIssue =
    c.reviews.length ? c.reviews[c.reviews.length - 1].issue
    : c.reEvaluations.length ? c.reEvaluations[c.reEvaluations.length - 1].issue
    : null;
  const rev = reviewBySlug.get(c.slug);
  if (rev) {
    const subtitle = [rev.genre, rev.overall ? `${rev.overall}/100` : '', rev.verdict]
      .filter(Boolean)
      .join(' · ');
    entries.push({
      type: 'review',
      title: rev.channel || c.name,
      subtitle,
      url: `/reviews/${c.slug}/`,
      issueTag: rev.issue || lastIssue,
    });
  } else {
    entries.push({
      type: 'channel',
      title: c.name,
      subtitle: c.genre || (c.verdict || ''),
      url: `/creators/#creator-${c.slug}`,
      issueTag: lastIssue,
    });
  }
}

/* ---- Time Capsule subjects ---- */
const tcStart = findSection(/^##\s+TIME CAPSULE SUBJECTS\s*—\s*COMPLETE LIST/);
const tcEnd = findSection(/^##\s+TIME CAPSULE\s*—\s*SAFE TO USE/, tcStart + 1);
if (tcStart === -1) warn('TIME CAPSULE SUBJECTS section not found');
else {
  let currentTag = null;
  for (let i = tcStart + 1; i < (tcEnd === -1 ? lines.length : tcEnd); i++) {
    const line = lines[i];
    const header = line.match(/^###\s+Issue\s+(#\w+)/);
    if (header) { currentTag = header[1]; continue; }
    if (!currentTag) continue;
    // Numbered list line: "1. Subject Name — Description"
    const item = line.match(/^\s*\d+\.\s+\**(.+?)\**\s*(?:—|--)\s*(.+?)\s*$/);
    if (!item) continue;
    const subject = item[1].replace(/\*\*/g, '').trim();
    const desc = item[2].replace(/⚠️ REPEATED[^—]*$/, '').replace(/⚠️ DUPLICATE[^—]*$/, '').trim();
    if (!subject) continue;
    entries.push({
      type: 'time-capsule',
      title: subject,
      subtitle: desc,
      url: issueUrl(currentTag) || '/archive',
      issueTag: currentTag,
    });
  }
}

/* ---- Boss Fights ---- */
const bfStart = findSection(/^##\s+BOSS FIGHTS\s*—\s*COMPLETE LIST/);
if (bfStart === -1) warn('BOSS FIGHTS — COMPLETE LIST section not found');
else {
  // Locate table — first row beginning with `| Issue`.
  let tStart = -1;
  for (let i = bfStart; i < bfStart + 6; i++) {
    if (/^\|\s*Issue\s*\|/i.test(lines[i])) { tStart = i; break; }
  }
  if (tStart === -1) warn('Boss Fights table not found');
  else {
    for (let i = tStart + 2; i < lines.length; i++) {
      const row = lines[i];
      if (!row.startsWith('|')) break;
      const cols = row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
      const [issueTag, matchup, winner] = cols;
      if (!issueTag || !matchup) continue;
      entries.push({
        type: 'boss-fight',
        title: matchup,
        subtitle: winner ? `Winner: ${winner}` : '',
        url: issueUrl(issueTag) || '/archive',
        issueTag,
      });
    }
  }
}

/* ---- Special Features ---- */
const sfStart = findSection(/^##\s+SPECIAL FEATURES USED/);
if (sfStart === -1) warn('SPECIAL FEATURES USED section not found');
else {
  let tStart = -1;
  for (let i = sfStart; i < sfStart + 6; i++) {
    if (/^\|\s*Issue\s*\|/i.test(lines[i])) { tStart = i; break; }
  }
  if (tStart === -1) warn('Special Features table not found');
  else {
    for (let i = tStart + 2; i < lines.length; i++) {
      const row = lines[i];
      if (!row.startsWith('|')) break;
      const cols = row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
      const [issueTag, feature] = cols;
      if (!issueTag || !feature) continue;
      // Split features that contain semicolons into individual entries.
      const parts = feature.split(/;\s+/).filter(Boolean);
      for (const part of parts) {
        const title = part.replace(/\s*\(.*?\)\s*$/, '').replace(/\s*—.*$/, '').trim();
        if (!title) continue;
        entries.push({
          type: 'special',
          title,
          subtitle: part.length > title.length ? part : '',
          url: issueUrl(issueTag) || '/archive',
          issueTag,
        });
      }
    }
  }
}

/* --------------------------------------------------------------- */

const totals = {
  total: entries.length,
  issue: entries.filter((e) => e.type === 'issue').length,
  review: entries.filter((e) => e.type === 'review').length,
  channel: entries.filter((e) => e.type === 'channel').length,
  'time-capsule': entries.filter((e) => e.type === 'time-capsule').length,
  'boss-fight': entries.filter((e) => e.type === 'boss-fight').length,
  special: entries.filter((e) => e.type === 'special').length,
};

await writeFile(
  OUT,
  JSON.stringify({ generatedAt: new Date().toISOString(), totals, entries }, null, 2) + '\n',
);

console.log(`Wrote ${OUT}`);
console.log('Totals:');
for (const [k, v] of Object.entries(totals)) console.log(`  ${k}: ${v}`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log('  ⚠ ' + w);
}
