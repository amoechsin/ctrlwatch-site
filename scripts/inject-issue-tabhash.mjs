#!/usr/bin/env node
/**
 * Inject hash-based tab routing into each published issue. The issue tab
 * systems hide every panel except the active one and never touch
 * location.hash — so the site's own SEO URLs (/issues/NNN/#high-scores)
 * landed on the wrong tab, sections couldn't be shared, and back-button
 * didn't restore state.
 *
 * Tab implementations vary wildly by template generation (global showTab /
 * switchTab / showSection / openTab(evt,…), or listener-based data-tab
 * buttons), so the retrofit never calls them: it finds the tab BUTTON for a
 * hash (data-tab attribute or a quoted id inside its onclick) and clicks it,
 * letting each issue's own logic run. Clicks on tab buttons push the id into
 * the hash; popstate re-activates, so back/forward walk the visited tabs.
 * Tab ids equal panel ids across all 16 issues (verified), which keeps the
 * hashes aligned with the SEO ItemList anchors.
 *
 * Adds a fenced `<!-- ctrlwatch:tabhash:start -->` script before </body>.
 * Idempotent: re-running replaces the fenced block. `npm run inject:tabhash`.
 * New issues (#017+) bake routing into the template instead — see the
 * ctrlwatch-html-generation skill's Layout & Readability Contract.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { issues } from '../src/data/issues.js';

const START_MARK = '<!-- ctrlwatch:tabhash:start -->';
const END_MARK = '<!-- ctrlwatch:tabhash:end -->';

const SCRIPT =
  '<script>/* cw-tabhash-v1 */(function(){' +
  "function idFor(el){if(el.dataset&&el.dataset.tab)return el.dataset.tab;" +
  "var oc=el.getAttribute&&el.getAttribute('onclick');" +
  "if(oc){var m=oc.match(/(?:showTab|switchTab|showSection|openTab)\\(\\s*(?:event\\s*,\\s*)?'([^']+)'/);if(m)return m[1];}" +
  'return null;}' +
  'function activate(id){if(!id)return;try{' +
  'var btn=document.querySelector(\'[data-tab="\'+id+\'"], [onclick*="\\\'\'+id+\'\\\'"]\');' +
  "if(btn&&!btn.classList.contains('active'))btn.click();" +
  '}catch(e){}}' +
  "document.addEventListener('click',function(e){" +
  "var el=e.target&&e.target.closest?e.target.closest('[data-tab],[onclick]'):null;" +
  'if(!el)return;var id=idFor(el);if(!id)return;' +
  "if(location.hash!=='#'+id){try{history.pushState(null,'','#'+id);}catch(err){}}" +
  '});' +
  "window.addEventListener('popstate',function(){activate(decodeURIComponent(location.hash.slice(1)));});" +
  'function init(){if(location.hash.length>1)activate(decodeURIComponent(location.hash.slice(1)));}' +
  "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();" +
  '})();</script>';

function buildBlock() {
  return [START_MARK, SCRIPT, END_MARK].join('\n');
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
    const at = html.lastIndexOf('</body>');
    if (at === -1) {
      console.warn(`! ${file} — no </body> anchor, skipping`);
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
