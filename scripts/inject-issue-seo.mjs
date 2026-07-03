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

const SITE = 'https://ctrl-watch.xyz';
const START_MARK = '<!-- ctrlwatch:seo:start -->';
const END_MARK = '<!-- ctrlwatch:seo:end -->';

function decodeEntities(s) {
  return String(s)
    .replace(/<[^>]+>/g, '') // strip any inline tags inside the cell
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Parse the Top 50 ranking from issue HTML -> [{position, name}].
 *
 * Issue HTML spans several template generations with inconsistent markup
 * (#014: td.rank + classless channel td; #002/#007–#013: td.rank-num, with
 * #006/#013 using td.channel-cell; #001/#003–#005: older templates). Rather
 * than match one fixed cell pattern, this walks each <tr> and pulls a rank
 * cell (class rank|rank-num) and a channel cell (class channel-cell, else the
 * first classless <td>, else the td right after the rank). It then VALIDATES
 * that the result is a contiguous 1..N with N>=40 — if the top rows are
 * rendered outside the table (giving e.g. 47 rows starting at position 4) the
 * parse is rejected and the ItemList is omitted, rather than emit broken
 * structured data.
 */
function parseTop50(html) {
  // Find the ranking table: prefer the known class, else any table whose
  // header row mentions both Channel and Score.
  let table = html.match(/<table[^>]*class="[^"]*top50-table[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!table) {
    for (const t of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
      if (/>\s*Channel\s*</i.test(t[0]) && />\s*Score\s*</i.test(t[0])) {
        table = [t[0], t[0]];
        break;
      }
    }
  }
  if (!table) return [];

  // Column-position parse: every ranking table is Rank | Channel | Score |
  // Genre | Movement, so the channel is the cell immediately after the cell
  // whose text is the (pure-integer) rank. This is robust to the differing
  // cell CLASSES across templates (rank vs rank-num, classed vs classless
  // channel) — class-based heuristics mis-grabbed genre/movement cells.
  const items = [];
  for (const row of table[1].matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const cells = [...row[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      decodeEntities(c[1]),
    );
    const ri = cells.findIndex((c) => /^\d+$/.test(c.trim()));
    if (ri === -1 || ri + 1 >= cells.length) continue;
    // Some templates embed a movement annotation in the channel cell
    // (e.g. "Defunctland (Prev. #32)") — strip a trailing parenthetical.
    const name = cells[ri + 1]
      .trim()
      .replace(/\s*\((?:prev\.?|previously|was|new|re-?eval)\b[^)]*\)\s*$/i, '')
      .trim();
    if (name && !/^\d+$/.test(name)) {
      items.push({ position: Number(cells[ri].trim()), name });
    }
  }

  // Validate: contiguous 1..N, N>=40. Otherwise reject (omit ItemList).
  items.sort((a, b) => a.position - b.position);
  if (items.length < 40) return [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].position !== i + 1) return [];
  }
  return items;
}

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
