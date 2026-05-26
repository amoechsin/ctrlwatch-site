#!/usr/bin/env node
/**
 * Inject the shared mobile-shim stylesheet into every issue HTML.
 *
 * Adds `<link rel="stylesheet" href="/issues/_shell.css">` immediately
 * before `</head>` in each `public/issues/NNN/index.html`. Idempotent:
 * files that already have the link are skipped.
 *
 * Run: `npm run inject:shell`
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ISSUES_DIR = 'public/issues';
const LINK_TAG = '<link rel="stylesheet" href="/issues/_shell.css">';
const MARKER = '/issues/_shell.css';
const MODE_MARKER = 'ctrlwatch_mode';
const MODE_SCRIPT = `<script>try{if(localStorage.getItem('ctrlwatch_mode')==='print')document.documentElement.classList.add('mode-print');}catch(e){}</script>`;

const entries = await readdir(ISSUES_DIR, { withFileTypes: true });
const slugs = entries
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

let touched = 0;
let skipped = 0;

for (const slug of slugs) {
  const file = join(ISSUES_DIR, slug, 'index.html');
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    continue;
  }

  const hasLink = html.includes(MARKER);
  const hasMode = html.includes(MODE_MARKER);
  if (hasLink && hasMode) {
    skipped++;
    continue;
  }

  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! ${file} — no </head> tag found, skipping`);
    continue;
  }

  let insertion = '';
  if (!hasLink) insertion += `${LINK_TAG}\n`;
  if (!hasMode) insertion += `${MODE_SCRIPT}\n`;

  const out = html.slice(0, headClose) + insertion + html.slice(headClose);
  await writeFile(file, out);
  console.log(`+ ${file}${hasLink ? ' (added mode script only)' : ''}`);
  touched++;
}

console.log(`\nDone. Touched: ${touched}. Already complete: ${skipped}.`);
