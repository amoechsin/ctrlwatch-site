#!/usr/bin/env node
/**
 * Inject SEO/AEO head metadata into every issue HTML.
 *
 * Adds an `<!-- ctrlwatch:seo:start -->` … `<!-- ctrlwatch:seo:end -->`
 * fenced block before `</head>` in each `public/issues/NNN/index.html`,
 * containing:
 *   - <meta name="description">  (reuses issue.subtitle, same text as og:description)
 *   - <link rel="canonical">     (self-referential issue URL)
 *   - <script type="application/ld+json"> ItemList of the Top 50
 *
 * The ItemList is parsed from the issue's OWN <table class="top50-table">,
 * so the structured data can never drift from the rendered ranking. Each
 * ListItem is position + name only (no item.url) to avoid emitting links to
 * /reviews/ pages that do not exist yet — add `item.url` here once canonical
 * Player Profile pages ship.
 *
 * Idempotent: re-running replaces the fenced block. Same fenced-block pattern
 * as inject-issue-og.mjs. Run: `npm run inject:seo` (after inject:og).
 */

import { runIssueInjector } from './lib/fenced-inject.mjs';
import { escapeHtml } from './lib/escape.mjs';
import { parseTop50 } from './lib/top50-parse.mjs';

const SITE = 'https://ctrl-watch.xyz';
const START_MARK = '<!-- ctrlwatch:seo:start -->';
const END_MARK = '<!-- ctrlwatch:seo:end -->';

function buildBlock(issue, html) {
  const file = `public/issues/${issue.slug}/index.html`;
  const items = parseTop50(html);
  if (!items.length) {
    console.warn(`! ${file} — no top50-table rows parsed (ItemList omitted)`);
  } else if (items.length !== 50) {
    console.warn(`! ${file} — parsed ${items.length} rows (expected 50) — verify`);
  }

  const url = `${SITE}/issues/${issue.slug}/`;
  const parts = [
    START_MARK,
    `<meta name="description" content="${escapeHtml(issue.subtitle)}">`,
    `<link rel="canonical" href="${url}">`,
  ];

  if (items.length) {
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Top 50 YouTube Channels — Issue ${issue.number} (${issue.date}) — CTRL+WATCH`,
      description: `CTRL+WATCH's master ranking of YouTube channels as published in Issue ${issue.number} (${issue.date}).`,
      url: `${SITE}/issues/${issue.slug}/#high-scores`,
      numberOfItems: items.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: items.map((it) => ({
        '@type': 'ListItem',
        position: it.position,
        name: it.name,
      })),
    };
    parts.push(
      `<script type="application/ld+json">\n${JSON.stringify(itemList, null, 2)}\n</script>`,
    );
  }

  parts.push(END_MARK);
  return parts.join('\n');
}

function place(html, block, issue) {
  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! public/issues/${issue.slug}/index.html — no </head>, skipping`);
    return null;
  }
  return html.slice(0, headClose) + block + '\n' + html.slice(headClose);
}

await runIssueInjector({ startMark: START_MARK, endMark: END_MARK, buildBlock, place });
