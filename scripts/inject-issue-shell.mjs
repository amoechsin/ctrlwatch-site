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

/* Mode script — v2.
 * - Pre-paint: read localStorage, set mode-print on <html> before paint.
 * - On DOMContentLoaded: inject a fixed-position toggle widget so the
 *   reader can switch modes from inside an issue (no Astro nav here).
 * Marker `cw-mode-v2` lets the injector identify and replace prior
 * versions on subsequent runs. */
const MODE_SCRIPT = `<script>/* cw-mode-v2 */(function(){try{if(localStorage.getItem('ctrlwatch_mode')==='print')document.documentElement.classList.add('mode-print');}catch(e){}function i(){if(document.querySelector('.cw-mode-widget'))return;var w=document.createElement('div');w.className='cw-mode-widget';w.setAttribute('role','group');w.setAttribute('aria-label','Display mode');w.innerHTML='<button type="button" data-mode="terminal" aria-label="Terminal mode" title="Terminal mode">[T]</button><button type="button" data-mode="print" aria-label="Magazine mode" title="Magazine mode">[M]</button>';document.body.appendChild(w);var b=w.querySelectorAll('button');function s(){var m=document.documentElement.classList.contains('mode-print')?'print':'terminal';b.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode===m?'true':'false');});}s();b.forEach(function(x){x.addEventListener('click',function(){var m=x.dataset.mode;if(m==='print')document.documentElement.classList.add('mode-print');else document.documentElement.classList.remove('mode-print');try{localStorage.setItem('ctrlwatch_mode',m);}catch(e){}s();});});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);else i();})();</script>`;

const MODE_MARKER_V2 = 'cw-mode-v2';
const MODE_MARKER_V1_RE = /<script>try\{if\(localStorage\.getItem\('ctrlwatch_mode'\)[^<]*<\/script>\n?/;

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
  const hasV2 = html.includes(MODE_MARKER_V2);

  if (hasLink && hasV2) {
    skipped++;
    continue;
  }

  // Strip any v1 mode script so we can re-inject v2 in its place.
  if (!hasV2) {
    html = html.replace(MODE_MARKER_V1_RE, '');
  }

  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! ${file} — no </head> tag found, skipping`);
    continue;
  }

  let insertion = '';
  if (!hasLink) insertion += `${LINK_TAG}\n`;
  if (!hasV2) insertion += `${MODE_SCRIPT}\n`;

  const out = html.slice(0, headClose) + insertion + html.slice(headClose);
  await writeFile(file, out);
  console.log(`+ ${file}`);
  touched++;
}

console.log(`\nDone. Touched: ${touched}. Already complete: ${skipped}.`);
