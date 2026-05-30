#!/usr/bin/env node
/**
 * Inject canonical Player Profile backlinks into each issue's Player Profiles
 * section. CLAUDE.md canonical rule: an issue section links OUT to the
 * standalone canonical URL of each asset it contains. This passes ranking
 * authority from the established issue pages into the /reviews/ pages and
 * closes the canonical loop.
 *
 * For every review markdown file (src/content/reviews/*.md) we read its
 * `channel` + `originatingIssue` (slug = filename), group by issue, and inject
 * a fenced `<!-- ctrlwatch:reviewlinks:start -->` … `:end -->` block right
 * after the opening tag of that issue's `id="player-profiles"` section: an
 * inline-styled box linking each channel to /reviews/[slug]/.
 *
 * Only issues that have ≥1 review file are touched. Idempotent (re-running
 * replaces the block). Inline styles so it never depends on issue CSS.
 * Run: `npm run inject:reviewlinks`.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const REVIEWS_DIR = 'src/content/reviews';
const START_MARK = '<!-- ctrlwatch:reviewlinks:start -->';
const END_MARK = '<!-- ctrlwatch:reviewlinks:end -->';
const SECTION_RE = /<(?:section|div)[^>]*\bid="player-profiles"[^>]*>/i;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Minimal frontmatter read — just the two scalar fields we need (quoted or
// not). Avoids a YAML dependency; the schema validation lives in the build.
function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, '');
}

// Build issue-slug → [{slug, channel}] from the reviews collection.
const byIssue = new Map();
for (const file of (await readdir(REVIEWS_DIR)).filter((f) => f.endsWith('.md'))) {
  const raw = await readFile(`${REVIEWS_DIR}/${file}`, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  if (field(fm[1], 'draft') === 'true') continue;
  const channel = field(fm[1], 'channel');
  const issueTag = field(fm[1], 'originatingIssue'); // e.g. "#012"
  if (!channel || !issueTag) continue;
  const issueSlug = issueTag.replace(/[^0-9]/g, ''); // "#012" -> "012"
  if (!byIssue.has(issueSlug)) byIssue.set(issueSlug, []);
  byIssue.get(issueSlug).push({ slug: file.replace(/\.md$/, ''), channel });
}

function buildBlock(entries) {
  // Alpha by channel for stable output.
  const links = entries
    .slice()
    .sort((a, b) => a.channel.localeCompare(b.channel))
    .map(
      (e) =>
        `<a href="/reviews/${e.slug}/" style="font-family:'Press Start 2P',monospace;font-size:9px;` +
        `letter-spacing:0.05em;color:#00F0FF;text-decoration:none;border:1px solid #00F0FF;padding:8px 10px;` +
        `display:inline-block;">${escapeHtml(e.channel)} ▸</a>`,
    )
    .join(' ');
  return [
    START_MARK,
    '<div style="margin:0 0 28px;padding:14px 16px;border:1px solid #00F0FF;' +
      "background:rgba(0,240,255,0.06);font-family:'Share Tech Mono',monospace;\">" +
      '<div style="font-size:12px;letter-spacing:0.05em;color:#9090A0;margin-bottom:10px;">' +
      'Canonical Player Profiles — the always-current home of each review below:</div>' +
      `<div style="display:flex;flex-wrap:wrap;gap:8px;">${links}</div>` +
      '</div>',
    END_MARK,
  ].join('\n');
}

let inserted = 0;
let updated = 0;
let skipped = 0;

for (const issue of issues.filter((i) => i.published)) {
  const entries = byIssue.get(issue.slug);
  if (!entries || !entries.length) continue;

  const file = `public/issues/${issue.slug}/index.html`;
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    console.warn(`! ${file} — missing, skipping`);
    continue;
  }

  const block = buildBlock(entries);
  const startIdx = html.indexOf(START_MARK);
  const endIdx = html.indexOf(END_MARK);

  if (startIdx !== -1 && endIdx !== -1) {
    html = html.slice(0, startIdx) + block + html.slice(endIdx + END_MARK.length);
    updated++;
  } else {
    const m = html.match(SECTION_RE);
    if (!m) {
      console.warn(`! ${file} — no id="player-profiles" section, skipping`);
      skipped++;
      continue;
    }
    const at = m.index + m[0].length;
    html = html.slice(0, at) + '\n' + block + html.slice(at);
    inserted++;
  }

  await writeFile(file, html);
  console.log(`+ ${file} (${entries.length} profiles)`);
}

console.log(`\nDone. Inserted: ${inserted}. Updated: ${updated}. Skipped: ${skipped}.`);
