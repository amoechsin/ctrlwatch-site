#!/usr/bin/env node
/**
 * Parse the continuity tracker into src/data/creators.json
 *
 * Source: docs/continuity/CTRLWATCH_Continuity_Tracker.md (editorial source
 * of truth, read-only). The platform never edits the tracker.
 *
 * Output schema per creator:
 *   {
 *     name, slug, currentScore, verdict, genre,
 *     currentRank,            // number or null
 *     status,                 // "in-top-50" | "dropped" | "never-entered"
 *     droppedAt,              // issue tag like "#011" or null
 *     droppedReason,          // string or null
 *     reEvaluated,            // boolean — has >1 review entry
 *     reviews: [{ issue, score, verdict, notes, approx }]
 *   }
 *
 * Run: `npm run build:creators`. Fails loudly (exit 1) if any parse
 * problem can't be reconciled — never silently drops a channel.
 */

import { readFile, writeFile } from 'node:fs/promises';

const TRACKER = 'docs/continuity/CTRLWATCH_Continuity_Tracker.md';
const OUT = 'src/data/creators.json';

const VERDICT_THRESHOLDS = [
  { min: 90, verdict: 'ESSENTIAL' },
  { min: 85, verdict: 'EXCELLENT' },
  { min: 75, verdict: 'GOOD' },
  { min: 65, verdict: 'AVERAGE' },
  { min: 50, verdict: 'MEDIOCRE' },
  { min: 0,  verdict: 'GAME OVER' },
];

const warnings = [];
const errors = [];

function warn(msg) { warnings.push(msg); }
function fail(msg) { errors.push(msg); }

function verdictFor(score) {
  if (score == null) return null;
  return VERDICT_THRESHOLDS.find((t) => score >= t.min).verdict;
}

function normaliseKey(s) {
  return String(s)
    .toLowerCase()
    .replace(/[—–-]/g, ' ')                        // dashes → space
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}]/gu, '')  // strip emoji
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse a markdown table starting at the given line index.
 * Returns { rows: [{ ... columnObj }], nextLine }.
 * Expects line[i] = `| Col1 | Col2 | ... |`, line[i+1] = `|---|---|...`.
 */
function parseTable(lines, startIdx) {
  const header = splitRow(lines[startIdx]);
  // Skip separator row.
  const rows = [];
  let i = startIdx + 2;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) break;
    if (line.trim().startsWith('|---')) continue;
    const cols = splitRow(line);
    if (cols.length === 0) continue;
    const row = {};
    header.forEach((h, k) => {
      row[h] = (cols[k] ?? '').trim();
    });
    rows.push(row);
  }
  return { rows, nextLine: i };
}

function splitRow(line) {
  // Drop leading/trailing pipes, then split. Trim each cell.
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim());
}

/** Strip markdown emphasis, footnote markers, etc. */
function clean(s) {
  return String(s ?? '')
    .replace(/^\*+|\*+$/g, '')
    .replace(/^\s*\*\*(.*)\*\*\s*$/, '$1')
    .trim();
}

/**
 * Parse a score cell. Returns { score, approx } where score is a number
 * or null (with a warning if it can't be reconciled).
 */
function parseScore(raw, ctx) {
  const s = clean(raw);
  if (!s || s === '—' || /^(check file)$/i.test(s)) {
    warn(`${ctx} — score is "${raw || '(empty)'}" — stored as null`);
    return { score: null, approx: false };
  }
  // Range: "~91-95" or "91-95"
  const range = s.match(/^~?\s*(\d{1,3})\s*[-–]\s*(\d{1,3})$/);
  if (range) {
    const lo = +range[1], hi = +range[2];
    return { score: Math.round((lo + hi) / 2), approx: true };
  }
  // Single approx: "~92"
  const approx = s.match(/^~\s*(\d{1,3})$/);
  if (approx) return { score: +approx[1], approx: true };
  // Plain number
  if (/^\d{1,3}$/.test(s)) return { score: +s, approx: false };
  // Words
  if (/^low$/i.test(s)) {
    warn(`${ctx} — score "Low" — stored as null, verdict still GAME OVER per tracker`);
    return { score: null, approx: true };
  }
  if (/^varies$/i.test(s)) {
    return { score: null, approx: true };
  }
  warn(`${ctx} — unrecognised score "${raw}" — stored as null`);
  return { score: null, approx: false };
}

function parseRank(raw) {
  const s = String(raw ?? '').replace(/[^\d]/g, '');
  return s ? +s : null;
}

/* ----------------------------------------------------------------- */

const src = await readFile(TRACKER, 'utf8');
const lines = src.split('\n');

/* Section locator */
function findSectionLine(re, startIdx = 0) {
  for (let i = startIdx; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

/* -------- Pass 1 — per-issue review tables ----------------------- */

const reviewsByKey = new Map(); // normalised name → { displayName, reviews[] }

const reviewsSection = findSectionLine(/^##\s+CHANNEL REVIEWS\s*—\s*PLAYER PROFILES/);
if (reviewsSection === -1) {
  fail('Could not locate "## CHANNEL REVIEWS — PLAYER PROFILES" section');
}

const reviewsEnd = findSectionLine(/^##\s+TOP 50/, reviewsSection + 1);
if (reviewsEnd === -1) fail('Could not locate "## TOP 50" section to bound CHANNEL REVIEWS');

for (let i = reviewsSection + 1; i < reviewsEnd; i++) {
  const issueHeader = lines[i].match(/^###\s+Issue\s+(#\w+)\s*—\s*(.+?)\s*$/);
  if (!issueHeader) continue;
  const issueTag = issueHeader[1];
  // Find the table start in the following lines.
  let tStart = -1;
  for (let j = i + 1; j < reviewsEnd && j < i + 8; j++) {
    if (/^\|\s*Channel\s*\|/i.test(lines[j])) { tStart = j; break; }
  }
  if (tStart === -1) {
    warn(`No reviews table found for ${issueTag}`);
    continue;
  }
  const { rows, nextLine } = parseTable(lines, tStart);
  for (const row of rows) {
    const channelRaw = clean(row.Channel || row.channel);
    if (!channelRaw) continue;
    if (/hidden levels/i.test(channelRaw)) continue;          // skip group rows
    if (/^\(\+/.test(channelRaw)) continue;                   // skip "(+ 9 other...)"
    const { score, approx } = parseScore(row.Score, `${issueTag} / ${channelRaw}`);
    const verdict = clean(row.Verdict).toUpperCase() || verdictFor(score) || '—';
    const notes = clean(row.Notes);
    const key = normaliseKey(channelRaw);
    if (!reviewsByKey.has(key)) {
      reviewsByKey.set(key, { displayName: channelRaw, reviews: [] });
    }
    reviewsByKey.get(key).reviews.push({ issue: issueTag, score, verdict, notes, approx });
  }
  i = nextLine;
}

/* -------- Pass 2 — Top 50 current state -------------------------- */

const top50ByKey = new Map(); // key → { rank, score, genre, displayName }

const top50Section = reviewsEnd;
const top50TableStart = (() => {
  for (let i = top50Section; i < lines.length; i++) {
    if (/^\|\s*#\s*\|\s*Channel\s*\|/i.test(lines[i])) return i;
  }
  return -1;
})();

if (top50TableStart === -1) fail('Could not locate Top 50 table');
else {
  const { rows } = parseTable(lines, top50TableStart);
  for (const row of rows) {
    const rank = parseRank(row['#']);
    const channelRaw = clean(row.Channel);
    if (!rank || !channelRaw) continue;
    const { score } = parseScore(row.Score, `Top 50 #${rank} ${channelRaw}`);
    const genre = clean(row.Genre);
    top50ByKey.set(normaliseKey(channelRaw), {
      rank,
      score,
      genre,
      displayName: channelRaw,
    });
  }
  if (top50ByKey.size !== 50) {
    warn(`Top 50 table parsed ${top50ByKey.size} entries — expected 50`);
  }
}

/* -------- Pass 3 — Dropped (all-time) ---------------------------- */

const droppedByKey = new Map();

const droppedHdr = findSectionLine(/^###\s+Channels Dropped From Top 50 \(All-Time\)/);
if (droppedHdr !== -1) {
  let tStart = -1;
  for (let i = droppedHdr; i < droppedHdr + 6; i++) {
    if (/^\|\s*Channel\s*\|/i.test(lines[i])) { tStart = i; break; }
  }
  if (tStart === -1) warn('Dropped (All-Time) header found but no table');
  else {
    const { rows } = parseTable(lines, tStart);
    for (const row of rows) {
      const channelRaw = clean(row.Channel);
      if (!channelRaw) continue;
      const issueDropped = clean(row['Issue Dropped'] || row.Issue || '');
      const { score: scoreAtDrop } = parseScore(row['Score at Drop'] || row.Score, `Dropped ${channelRaw}`);
      const reason = clean(row.Reason);
      droppedByKey.set(normaliseKey(channelRaw), {
        displayName: channelRaw,
        droppedAt: issueDropped,
        scoreAtDrop,
        reason,
      });
    }
  }
} else {
  warn('"Channels Dropped From Top 50 (All-Time)" section not found');
}

/* -------- Pass 4 — All-Time Re-Evaluation Records --------------- */

const reEvalsByKey = new Map();

const reEvalHdr = findSectionLine(/^###\s+All-Time Re-Evaluation Records/);
if (reEvalHdr !== -1) {
  let tStart = -1;
  for (let i = reEvalHdr; i < reEvalHdr + 6; i++) {
    if (/^\|\s*Channel\s*\|/i.test(lines[i])) { tStart = i; break; }
  }
  if (tStart === -1) warn('"All-Time Re-Evaluation Records" header found but no table');
  else {
    const { rows } = parseTable(lines, tStart);
    for (const row of rows) {
      const channelRaw = clean(row.Channel);
      if (!channelRaw) continue;
      const entry = {
        issue: clean(row.Issue),
        scoreChange: clean(row['Score Change']),
        rankChange: clean(row['Rank Change']),
        notes: clean(row.Notes),
      };
      const key = normaliseKey(channelRaw);
      if (!reEvalsByKey.has(key)) reEvalsByKey.set(key, { displayName: channelRaw, entries: [] });
      reEvalsByKey.get(key).entries.push(entry);
    }
  }
} else {
  warn('"All-Time Re-Evaluation Records" section not found');
}

/* -------- Merge — every key seen anywhere ------------------------ */

const allKeys = new Set([
  ...reviewsByKey.keys(),
  ...top50ByKey.keys(),
  ...droppedByKey.keys(),
  ...reEvalsByKey.keys(),
]);

const creators = [];
const slugCounts = new Map();

for (const key of allKeys) {
  const r = reviewsByKey.get(key);
  const t = top50ByKey.get(key);
  const d = droppedByKey.get(key);
  const e = reEvalsByKey.get(key);

  const displayName = t?.displayName || r?.displayName || d?.displayName || e?.displayName || key;

  // Current score: prefer Top 50 (authoritative), else latest review.
  let currentScore = t?.score ?? null;
  if (currentScore == null && r) {
    const withScore = r.reviews.filter((x) => x.score != null);
    if (withScore.length) currentScore = withScore[withScore.length - 1].score;
  }

  // Verdict: from current score, falling back to latest review's verdict.
  let verdict = verdictFor(currentScore);
  if (!verdict && r) verdict = r.reviews[r.reviews.length - 1]?.verdict || null;

  let status;
  let currentRank = null;
  let droppedAt = null;
  let droppedReason = null;
  if (t) {
    status = 'in-top-50';
    currentRank = t.rank;
  } else if (d) {
    status = 'dropped';
    droppedAt = d.droppedAt || null;
    droppedReason = d.reason || null;
  } else {
    status = 'never-entered';
  }

  const reviews = r?.reviews ?? [];
  const reEvaluations = e?.entries ?? [];
  if (!r && !t && !d && !e) {
    warn(`Channel "${displayName}" appeared in no source — skipping`);
    continue;
  }

  // Unique slug
  let slug = slugify(displayName);
  const used = slugCounts.get(slug) || 0;
  slugCounts.set(slug, used + 1);
  if (used > 0) {
    warn(`Duplicate slug "${slug}" for "${displayName}" — disambiguating`);
    slug = `${slug}-${used + 1}`;
  }

  creators.push({
    name: displayName,
    slug,
    currentScore,
    verdict,
    genre: t?.genre || null,
    currentRank,
    status,
    droppedAt,
    droppedReason,
    reEvaluated: reviews.length > 1 || reEvaluations.length > 0,
    reviews,
    reEvaluations,
  });
}

creators.sort((a, b) => a.name.localeCompare(b.name));

/* -------- Sanity --------------------------------------------------- */

const top50InOutput = creators.filter((c) => c.status === 'in-top-50').length;
if (top50InOutput !== top50ByKey.size) {
  fail(`Top 50 ranking count mismatch — parsed ${top50ByKey.size}, emitted ${top50InOutput}`);
}

if (errors.length) {
  console.error('PARSE ERRORS:');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: TRACKER,
      totals: {
        creators: creators.length,
        inTop50: creators.filter((c) => c.status === 'in-top-50').length,
        dropped: creators.filter((c) => c.status === 'dropped').length,
        neverEntered: creators.filter((c) => c.status === 'never-entered').length,
        reEvaluated: creators.filter((c) => c.reEvaluated).length,
        withApproxScore: creators.filter((c) => c.reviews.some((r) => r.approx) || c.currentScore == null).length,
      },
      creators,
    },
    null,
    2,
  ) + '\n',
);

console.log(`Wrote ${OUT}`);
console.log(`Totals:`);
console.log(`  ${creators.length} creators`);
console.log(`  ${creators.filter((c) => c.status === 'in-top-50').length} in Top 50`);
console.log(`  ${creators.filter((c) => c.status === 'dropped').length} dropped`);
console.log(`  ${creators.filter((c) => c.status === 'never-entered').length} never entered`);
console.log(`  ${creators.filter((c) => c.reEvaluated).length} re-evaluated`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log('  ⚠ ' + w);
}
