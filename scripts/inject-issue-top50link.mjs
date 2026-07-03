#!/usr/bin/env node
/**
 * Inject a "see the live Top 50" backlink into each issue's High Scores
 * section. Internal-linking signal: every back-issue ranking points at the
 * canonical /top50/ page.
 *
 * Adds a `<!-- ctrlwatch:top50link:start -->` … `:end -->` fenced block
 * immediately after the opening tag of the issue's High Scores section, so it
 * renders as a banner atop that section ("this is a frozen snapshot → the live
 * ranking is here"). The link is fully inline-styled so it never depends on a
 * given issue template's CSS classes.
 *
 * Section anchor varies by template generation — id is one of
 * {high-scores, top-50, highscores}. Issues with none of these (#003, #010)
 * are skipped with a warning (safe degradation; they still link via the nav),
 * mirroring inject-issue-seo's omit-rather-than-break philosophy.
 *
 * Idempotent: re-running replaces the fenced block. Run AFTER the issue HTML
 * exists; re-run is harmless. `npm run inject:top50link`.
 */

import { runIssueInjector } from './lib/fenced-inject.mjs';

const START_MARK = '<!-- ctrlwatch:top50link:start -->';
const END_MARK = '<!-- ctrlwatch:top50link:end -->';

// Matches the opening tag of the High Scores section across template
// generations. Captures the whole opening tag so we can insert right after it.
const SECTION_RE = /<(?:section|div)[^>]*\bid="(?:high-scores|top-50|highscores)"[^>]*>/i;

function buildBlock() {
  // Self-contained inline styles — issue templates have wildly different CSS,
  // so we lean on none of it. Neon-cyan angular CTA in the house aesthetic.
  return [
    START_MARK,
    '<div style="margin:0 0 24px;padding:14px 16px;border:1px solid #00F0FF;' +
      'background:rgba(0,240,255,0.06);font-family:\'Share Tech Mono\',monospace;">' +
      '<div style="font-size:12px;letter-spacing:0.05em;color:#9090A0;margin-bottom:8px;">' +
      'This is a snapshot from when this issue shipped. The ranking is re-scored every issue.</div>' +
      '<a href="/top50/" style="display:inline-block;font-family:\'Press Start 2P\',monospace;' +
      'font-size:10px;letter-spacing:0.1em;color:#00F0FF;text-decoration:none;border:1px solid #00F0FF;' +
      'padding:10px 14px;">▶ SEE THE LIVE TOP 50 →</a>' +
      '</div>',
    END_MARK,
  ].join('\n');
}

function place(html, block, issue) {
  const m = html.match(SECTION_RE);
  if (!m) {
    console.warn(
      `! public/issues/${issue.slug}/index.html — no High Scores section anchor, skipping (nav link only)`,
    );
    return null;
  }
  const at = m.index + m[0].length;
  return html.slice(0, at) + '\n' + block + html.slice(at);
}

await runIssueInjector({ startMark: START_MARK, endMark: END_MARK, buildBlock, place });
