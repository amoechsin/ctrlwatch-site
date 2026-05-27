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

/* Mode script — v5.
 * - sessionStorage is authoritative for session-scoped magazine mode.
 * - localStorage is mirrored on every read/write so cached v2 issue HTMLs
 *   (which read localStorage) stay in sync until the browser cache rolls over.
 * - Widget click handlers use both 'click' and 'pointerup' for reliability on
 *   iOS Safari where some scroll/touch interactions can swallow click events.
 * Marker `cw-mode-v5` lets the injector identify and replace prior versions. */
const MODE_SCRIPT = `<script>/* cw-mode-v5 */(function(){try{var ss=sessionStorage.getItem('ctrlwatch_mode');if(ss===null){if(localStorage.getItem('ctrlwatch_mode')!==null)localStorage.removeItem('ctrlwatch_mode');}else if(localStorage.getItem('ctrlwatch_mode')!==ss){localStorage.setItem('ctrlwatch_mode',ss);}if(ss==='print')document.documentElement.classList.add('mode-print');}catch(e){}function i(){var prev=document.querySelector('.cw-mode-widget');if(prev)prev.remove();var w=document.createElement('div');w.className='cw-mode-widget';w.setAttribute('role','group');w.setAttribute('aria-label','Display mode');w.innerHTML='<button type="button" data-mode="terminal" aria-label="Terminal mode" title="Terminal mode">[TERMINAL]</button><button type="button" data-mode="print" aria-label="Magazine mode" title="Magazine mode">[MAGAZINE]</button>';document.body.appendChild(w);var b=w.querySelectorAll('button');function s(){var m=document.documentElement.classList.contains('mode-print')?'print':'terminal';b.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode===m?'true':'false');});}s();function set(m){if(m==='print')document.documentElement.classList.add('mode-print');else document.documentElement.classList.remove('mode-print');try{sessionStorage.setItem('ctrlwatch_mode',m);localStorage.setItem('ctrlwatch_mode',m);}catch(e){}s();}b.forEach(function(x){x.addEventListener('click',function(){set(x.dataset.mode);});});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);else i();})();</script>`;

const MODE_MARKER_V5 = 'cw-mode-v5';
const MODE_MARKER_OLD_RE = /<script>\/\* cw-mode-v[1234] \*\/[\s\S]*?<\/script>\n?|<script>try\{if\(localStorage\.getItem\('ctrlwatch_mode'\)[^<]*<\/script>\n?/g;

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
  const hasV5 = html.includes(MODE_MARKER_V5);

  if (hasLink && hasV5) {
    skipped++;
    continue;
  }

  // Strip any older mode-script versions so we can re-inject the latest.
  if (!hasV5) {
    html = html.replace(MODE_MARKER_OLD_RE, '');
  }

  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! ${file} — no </head> tag found, skipping`);
    continue;
  }

  let insertion = '';
  if (!hasLink) insertion += `${LINK_TAG}\n`;
  if (!hasV5) insertion += `${MODE_SCRIPT}\n`;

  const out = html.slice(0, headClose) + insertion + html.slice(headClose);
  await writeFile(file, out);
  console.log(`+ ${file}`);
  touched++;
}

console.log(`\nDone. Touched: ${touched}. Already complete: ${skipped}.`);
