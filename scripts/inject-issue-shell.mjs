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

/* Mode script — v3.
 * - Pre-paint: read localStorage, set mode-print on <html> before paint.
 * - On DOMContentLoaded: inject a fixed-position bottom-right toggle widget
 *   with full-word [TERMINAL]/[MAGAZINE] labels so it's discoverable.
 * Marker `cw-mode-v3` lets the injector identify and replace prior
 * versions on subsequent runs. */
const MODE_SCRIPT = `<script>/* cw-mode-v3 */(function(){try{if(localStorage.getItem('ctrlwatch_mode')==='print')document.documentElement.classList.add('mode-print');}catch(e){}function i(){var prev=document.querySelector('.cw-mode-widget');if(prev)prev.remove();var w=document.createElement('div');w.className='cw-mode-widget';w.setAttribute('role','group');w.setAttribute('aria-label','Display mode');w.innerHTML='<button type="button" data-mode="terminal" aria-label="Terminal mode" title="Terminal mode">[TERMINAL]</button><button type="button" data-mode="print" aria-label="Magazine mode" title="Magazine mode">[MAGAZINE]</button>';document.body.appendChild(w);var b=w.querySelectorAll('button');function s(){var m=document.documentElement.classList.contains('mode-print')?'print':'terminal';b.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode===m?'true':'false');});}s();b.forEach(function(x){x.addEventListener('click',function(){var m=x.dataset.mode;if(m==='print')document.documentElement.classList.add('mode-print');else document.documentElement.classList.remove('mode-print');try{localStorage.setItem('ctrlwatch_mode',m);}catch(e){}s();});});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);else i();})();</script>`;

const MODE_MARKER_V3 = 'cw-mode-v3';
const MODE_MARKER_OLD_RE = /<script>\/\* cw-mode-v[12] \*\/[\s\S]*?<\/script>\n?|<script>try\{if\(localStorage\.getItem\('ctrlwatch_mode'\)[^<]*<\/script>\n?/g;

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
  const hasV3 = html.includes(MODE_MARKER_V3);

  if (hasLink && hasV3) {
    skipped++;
    continue;
  }

  // Strip any older mode-script versions so we can re-inject the latest.
  if (!hasV3) {
    html = html.replace(MODE_MARKER_OLD_RE, '');
  }

  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! ${file} — no </head> tag found, skipping`);
    continue;
  }

  let insertion = '';
  if (!hasLink) insertion += `${LINK_TAG}\n`;
  if (!hasV3) insertion += `${MODE_SCRIPT}\n`;

  const out = html.slice(0, headClose) + insertion + html.slice(headClose);
  await writeFile(file, out);
  console.log(`+ ${file}`);
  touched++;
}

console.log(`\nDone. Touched: ${touched}. Already complete: ${skipped}.`);
