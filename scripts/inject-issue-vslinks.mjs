#!/usr/bin/env node
/**
 * Inject a canonical Boss Fight backlink into each issue's Boss Fight section.
 * CLAUDE.md canonical rule: an issue section links OUT to the standalone
 * canonical URL of the asset it contains. Mirrors inject-issue-reviewlinks.
 *
 * For every Boss Fight markdown file (src/content/vs/*.md) we read its
 * `originatingIssue` + `channelA`/`channelB` (slug = filename) and inject a
 * fenced `<!-- ctrlwatch:vslink:start -->` … `:end -->` block right after the
 * opening tag of that issue's `id="boss-fight"` section: an inline-styled link
 * to /vs/[slug]/.
 *
 * Only issues with a matching Boss Fight file are touched. Idempotent. Inline
 * styles so it never depends on issue CSS. Run: `npm run inject:vslinks`.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const VS_DIR = 'src/content/vs';
const START_MARK = '<!-- ctrlwatch:vslink:start -->';
const END_MARK = '<!-- ctrlwatch:vslink:end -->';
const SECTION_RE = /<(?:section|div)[^>]*\bid="boss-fight"[^>]*>/i;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

// issue-slug → { slug, label }
const byIssue = new Map();
for (const file of (await readdir(VS_DIR)).filter((f) => f.endsWith('.md'))) {
  const raw = await readFile(`${VS_DIR}/${file}`, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  if (field(fm[1], 'draft') === 'true') continue;
  const a = field(fm[1], 'channelA');
  const b = field(fm[1], 'channelB');
  const issueTag = field(fm[1], 'originatingIssue');
  if (!a || !b || !issueTag) continue;
  byIssue.set(issueTag.replace(/[^0-9]/g, ''), {
    slug: file.replace(/\.md$/, ''),
    label: `${a} vs ${b}`,
  });
}

function buildBlock(entry) {
  return [
    START_MARK,
    '<div style="margin:0 0 28px;padding:14px 16px;border:1px solid #FFE600;' +
      "background:rgba(255,230,0,0.06);font-family:'Share Tech Mono',monospace;\">" +
      '<div style="font-size:12px;letter-spacing:0.05em;color:#9090A0;margin-bottom:10px;">' +
      'Canonical Boss Fight — the standalone home of this matchup:</div>' +
      `<a href="/vs/${entry.slug}/" style="font-family:'Press Start 2P',monospace;font-size:9px;` +
      `letter-spacing:0.05em;color:#FFE600;text-decoration:none;border:1px solid #FFE600;padding:8px 10px;` +
      `display:inline-block;">⚔ ${escapeHtml(entry.label)} ▸</a>` +
      '</div>',
    END_MARK,
  ].join('\n');
}

let inserted = 0;
let updated = 0;
let skipped = 0;

for (const issue of issues.filter((i) => i.published)) {
  const entry = byIssue.get(issue.slug);
  if (!entry) continue;

  const file = `public/issues/${issue.slug}/index.html`;
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    console.warn(`! ${file} — missing, skipping`);
    continue;
  }

  const block = buildBlock(entry);
  const startIdx = html.indexOf(START_MARK);
  const endIdx = html.indexOf(END_MARK);

  if (startIdx !== -1 && endIdx !== -1) {
    html = html.slice(0, startIdx) + block + html.slice(endIdx + END_MARK.length);
    updated++;
  } else {
    const m = html.match(SECTION_RE);
    if (!m) {
      console.warn(`! ${file} — no id="boss-fight" section, skipping`);
      skipped++;
      continue;
    }
    const at = m.index + m[0].length;
    html = html.slice(0, at) + '\n' + block + html.slice(at);
    inserted++;
  }

  await writeFile(file, html);
  console.log(`+ ${file} (${entry.label})`);
}

console.log(`\nDone. Inserted: ${inserted}. Updated: ${updated}. Skipped: ${skipped}.`);
