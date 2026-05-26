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

import { readFile, writeFile } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const SITE = 'https://ctrl-watch.xyz';
const START_MARK = '<!-- ctrlwatch:og:start -->';
const END_MARK = '<!-- ctrlwatch:og:end -->';

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function block(issue) {
  const url = `${SITE}/issues/${issue.slug}/`;
  const img = `${SITE}/covers/${issue.slug}-og.png`;
  const title = escape(`CTRL+WATCH — Issue ${issue.number} — ${issue.title}`);
  const desc = escape(issue.subtitle);
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

let touched = 0;
let updated = 0;

for (const issue of issues.filter((i) => i.published)) {
  const file = `public/issues/${issue.slug}/index.html`;
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    console.warn(`! ${file} — missing, skipping`);
    continue;
  }

  const startIdx = html.indexOf(START_MARK);
  const endIdx = html.indexOf(END_MARK);
  const newBlock = block(issue);

  if (startIdx !== -1 && endIdx !== -1) {
    const before = html.slice(0, startIdx);
    const after = html.slice(endIdx + END_MARK.length);
    html = before + newBlock + after;
    updated++;
  } else {
    const headClose = html.lastIndexOf('</head>');
    if (headClose === -1) {
      console.warn(`! ${file} — no </head>, skipping`);
      continue;
    }
    html = html.slice(0, headClose) + newBlock + '\n' + html.slice(headClose);
    touched++;
  }

  await writeFile(file, html);
  console.log(`+ ${file}`);
}

console.log(`\nDone. Inserted: ${touched}. Updated existing: ${updated}.`);
