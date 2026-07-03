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

import { readFile, readdir } from 'node:fs/promises';
import matter from 'gray-matter';
import { runIssueInjector } from './lib/fenced-inject.mjs';
import { escapeHtml } from './lib/escape.mjs';

const REVIEWS_DIR = 'src/content/reviews';
const START_MARK = '<!-- ctrlwatch:reviewlinks:start -->';
const END_MARK = '<!-- ctrlwatch:reviewlinks:end -->';
// Player-profile section anchor varies by template: id="player-profiles" (most),
// id="player-profile" (#008), id="reviews" (#001–#004), id="tab-profiles" (#010).
// #005 has no review-section anchor (only high-scores) → skipped, nav link only.
const SECTION_RE = /<(?:section|div)[^>]*\bid="(?:player-profiles|player-profile|reviews|tab-profiles)"[^>]*>/i;

// Build issue-slug → [{slug, channel}] from the reviews collection.
const byIssue = new Map();
for (const file of (await readdir(REVIEWS_DIR)).filter((f) => f.endsWith('.md'))) {
  const { data } = matter(await readFile(`${REVIEWS_DIR}/${file}`, 'utf8'));
  if (data.draft === true) continue;
  if (!data.channel || !data.originatingIssue) continue;
  const channel = String(data.channel);
  const issueSlug = String(data.originatingIssue).replace(/[^0-9]/g, ''); // "#012" -> "012"
  if (!byIssue.has(issueSlug)) byIssue.set(issueSlug, []);
  byIssue.get(issueSlug).push({ slug: file.replace(/\.md$/, ''), channel });
}

function buildBlock(issue) {
  const entries = byIssue.get(issue.slug);
  if (!entries || !entries.length) return null;

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

function place(html, block, issue) {
  const m = html.match(SECTION_RE);
  if (!m) {
    console.warn(`! public/issues/${issue.slug}/index.html — no player-profile section anchor, skipping`);
    return null;
  }
  const at = m.index + m[0].length;
  return html.slice(0, at) + '\n' + block + html.slice(at);
}

await runIssueInjector({ startMark: START_MARK, endMark: END_MARK, buildBlock, place });
