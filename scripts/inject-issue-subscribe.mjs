#!/usr/bin/env node
/**
 * Inject a subscribe banner into each published issue, just above the page
 * footer. Points at the canonical email-capture form on the Astro shell
 * (/#subscribe → Buttondown embed in Footer.astro) — issue HTML never embeds
 * the form itself, so a provider change stays a one-file edit.
 *
 * Adds a `<!-- ctrlwatch:subscribe:start -->` … `:end -->` fenced block.
 * Anchor: immediately before the issue's opening <footer> tag; issues without
 * a footer (#003, #004, #013) get it immediately before </body> instead.
 * Fully inline-styled so it never depends on a given issue template's CSS.
 *
 * Idempotent: re-running replaces the fenced block. `npm run inject:subscribe`.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const START_MARK = '<!-- ctrlwatch:subscribe:start -->';
const END_MARK = '<!-- ctrlwatch:subscribe:end -->';

const FOOTER_RE = /<footer[^>]*>/i;

function buildBlock() {
  return [
    START_MARK,
    '<div style="margin:48px auto 32px;max-width:720px;padding:20px 18px;' +
      'border:1px solid #39FF14;background:rgba(57,255,20,0.05);text-align:center;">' +
      '<div style="font-family:\'Press Start 2P\',monospace;font-size:11px;letter-spacing:0.08em;' +
      'color:#39FF14;margin-bottom:10px;">NEXT ISSUE, NO ALGORITHM</div>' +
      '<div style="font-family:\'Share Tech Mono\',monospace;font-size:13px;color:#9090A0;' +
      'margin-bottom:14px;">One email per issue — new reviews, the Top 50 shakeup, ' +
      'and whatever Yob is angry about.</div>' +
      '<a href="/#subscribe" style="display:inline-block;font-family:\'Press Start 2P\',monospace;' +
      'font-size:10px;letter-spacing:0.1em;color:#39FF14;text-decoration:none;' +
      'border:1px solid #39FF14;padding:12px 16px;">[INSERT COIN ▶] SUBSCRIBE</a>' +
      '</div>',
    END_MARK,
  ].join('\n');
}

let inserted = 0;
let updated = 0;
let skipped = 0;

for (const issue of issues.filter((i) => i.published)) {
  const file = `public/issues/${issue.slug}/index.html`;
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    console.warn(`! ${file} — missing, skipping`);
    continue;
  }

  const block = buildBlock();
  const startIdx = html.indexOf(START_MARK);
  const endIdx = html.indexOf(END_MARK);

  if (startIdx !== -1 && endIdx !== -1) {
    html = html.slice(0, startIdx) + block + html.slice(endIdx + END_MARK.length);
    updated++;
  } else {
    const m = html.match(FOOTER_RE);
    const at = m ? m.index : html.lastIndexOf('</body>');
    if (at === -1) {
      console.warn(`! ${file} — no <footer> or </body> anchor, skipping`);
      skipped++;
      continue;
    }
    html = html.slice(0, at) + block + '\n' + html.slice(at);
    inserted++;
  }

  await writeFile(file, html);
  console.log(`+ ${file}`);
}

console.log(`\nDone. Inserted: ${inserted}. Updated: ${updated}. Skipped: ${skipped}.`);
