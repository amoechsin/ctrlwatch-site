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

import { readFile, readdir } from 'node:fs/promises';
import matter from 'gray-matter';
import { runIssueInjector } from './lib/fenced-inject.mjs';
import { escapeHtml } from './lib/escape.mjs';

const VS_DIR = 'src/content/vs';
const START_MARK = '<!-- ctrlwatch:vslink:start -->';
const END_MARK = '<!-- ctrlwatch:vslink:end -->';
// Boss Fight section anchor varies by template: id="boss-fight" (most),
// id="bossfight" (#002), id="tab-bossfight" (#010, tab-panel layout).
const SECTION_RE = /<(?:section|div)[^>]*\bid="(?:boss-fight|bossfight|tab-bossfight)"[^>]*>/i;

// issue-slug → { slug, label }
const byIssue = new Map();
for (const file of (await readdir(VS_DIR)).filter((f) => f.endsWith('.md'))) {
  const { data } = matter(await readFile(`${VS_DIR}/${file}`, 'utf8'));
  if (data.draft === true) continue;
  if (!data.channelA || !data.channelB || !data.originatingIssue) continue;
  byIssue.set(String(data.originatingIssue).replace(/[^0-9]/g, ''), {
    slug: file.replace(/\.md$/, ''),
    label: `${data.channelA} vs ${data.channelB}`,
  });
}

function buildBlock(issue) {
  const entry = byIssue.get(issue.slug);
  if (!entry) return null;

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

function place(html, block, issue) {
  const m = html.match(SECTION_RE);
  if (!m) {
    console.warn(`! public/issues/${issue.slug}/index.html — no Boss Fight section anchor, skipping`);
    return null;
  }
  const at = m.index + m[0].length;
  return html.slice(0, at) + '\n' + block + html.slice(at);
}

await runIssueInjector({ startMark: START_MARK, endMark: END_MARK, buildBlock, place });
