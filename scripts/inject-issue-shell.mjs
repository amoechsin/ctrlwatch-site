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
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ISSUES_DIR = 'public/issues';

/* Content-hash the shared shell.css so any time its content changes the
 * stylesheet URL changes, forcing the browser to bypass its cache. The
 * browser may still have an old HTML referencing /issues/_shell.css
 * (unversioned) cached, but our cache-control rules now revalidate issue
 * HTML on every visit, so the next visit yields HTML with the new URL. */
const SHELL_CSS_PATH = join(ISSUES_DIR, '_shell.css');
const SHELL_CSS_HASH = createHash('md5')
  .update(await readFile(SHELL_CSS_PATH))
  .digest('hex')
  .slice(0, 8);

const LINK_HREF = `/issues/_shell.css?v=${SHELL_CSS_HASH}`;
const LINK_TAG = `<link rel="stylesheet" href="${LINK_HREF}">`;
const OLD_LINK_RE = /<link rel="stylesheet" href="\/issues\/_shell\.css(?:\?v=[a-z0-9]+)?">\n?/g;

/* Mode script — v6.
 * - localStorage is authoritative: MAGAZINE persists across sessions
 *   (decision 2026-07-03, reversing the v4/v5 session-scoped experiment).
 * - sessionStorage is read once as a migration path from v5, and writes
 *   still go to both stores so any cached v5 page stays in sync until its
 *   cache revalidates.
 * Marker `cw-mode-v6` lets the injector identify and replace prior versions. */
const MODE_SCRIPT = `<script>/* cw-mode-v6 */(function(){try{var m=localStorage.getItem('ctrlwatch_mode');if(m===null){m=sessionStorage.getItem('ctrlwatch_mode');if(m!==null)localStorage.setItem('ctrlwatch_mode',m);}if(m==='print')document.documentElement.classList.add('mode-print');}catch(e){}function i(){var prev=document.querySelector('.cw-mode-widget');if(prev)prev.remove();var w=document.createElement('div');w.className='cw-mode-widget';w.setAttribute('role','group');w.setAttribute('aria-label','Display mode');w.innerHTML='<button type="button" data-mode="terminal" aria-label="Terminal mode" title="Terminal mode">[TERMINAL]</button><button type="button" data-mode="print" aria-label="Magazine mode" title="Magazine mode">[MAGAZINE]</button>';document.body.appendChild(w);var b=w.querySelectorAll('button');function s(){var m=document.documentElement.classList.contains('mode-print')?'print':'terminal';b.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.mode===m?'true':'false');});}s();function set(m){if(m==='print')document.documentElement.classList.add('mode-print');else document.documentElement.classList.remove('mode-print');try{sessionStorage.setItem('ctrlwatch_mode',m);localStorage.setItem('ctrlwatch_mode',m);}catch(e){}s();}b.forEach(function(x){x.addEventListener('click',function(){set(x.dataset.mode);});});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);else i();})();</script>`;

const MODE_MARKER_V6 = 'cw-mode-v6';
const MODE_MARKER_OLD_RE = /<script>\/\* cw-mode-v[12345] \*\/[\s\S]*?<\/script>\n?|<script>try\{if\(localStorage\.getItem\('ctrlwatch_mode'\)[^<]*<\/script>\n?/g;

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

  const hasCurrentLink = html.includes(LINK_HREF);
  const hasV6 = html.includes(MODE_MARKER_V6);

  if (hasCurrentLink && hasV6) {
    skipped++;
    continue;
  }

  // Strip any existing _shell.css link (versioned or not) so we can
  // re-inject with the current content-hash.
  if (!hasCurrentLink) {
    html = html.replace(OLD_LINK_RE, '');
  }

  // Strip any older mode-script versions so we can re-inject the latest.
  if (!hasV6) {
    html = html.replace(MODE_MARKER_OLD_RE, '');
  }

  const headClose = html.lastIndexOf('</head>');
  if (headClose === -1) {
    console.warn(`! ${file} — no </head> tag found, skipping`);
    continue;
  }

  let insertion = '';
  if (!hasCurrentLink) insertion += `${LINK_TAG}\n`;
  if (!hasV6) insertion += `${MODE_SCRIPT}\n`;

  const out = html.slice(0, headClose) + insertion + html.slice(headClose);
  await writeFile(file, out);
  console.log(`+ ${file}`);
  touched++;
}

console.log(`\nDone. Touched: ${touched}. Already complete: ${skipped}.`);
