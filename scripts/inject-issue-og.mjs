#!/usr/bin/env node
/**
 * Inject OpenGraph + Twitter card meta into every issue HTML.
 *
 * Adds an `<!-- ctrlwatch:og:start -->` … `<!-- ctrlwatch:og:end -->`
 * fenced block before `</head>` in each `public/issues/NNN/index.html`.
 * Idempotent: if the fenced block exists, its contents are replaced —
 * so re-running picks up subtitle / title edits in src/data/issues.js.
 *
 * Run: `npm run inject:og`. Run again after editing issues.js or after
 * regenerating covers if the filenames change.
 */

import { runIssueInjector } from './lib/fenced-inject.mjs';
import { escapeHtml } from './lib/escape.mjs';

const SITE = 'https://ctrl-watch.xyz';
const START_MARK = '<!-- ctrlwatch:og:start -->';
const END_MARK = '<!-- ctrlwatch:og:end -->';

function buildBlock(issue) {
  const url = `${SITE}/issues/${issue.slug}/`;
  const img = `${SITE}/covers/${issue.slug}-og.png`;
  const title = escapeHtml(`CTRL+WATCH — Issue ${issue.number} — ${issue.title}`);
  const desc = escapeHtml(issue.subtitle);
  return [
    START_MARK,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${desc}">`,
    `<meta name="twitter:image" content="${img}">`,
    END_MARK,
  ].join('\n');
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
