/**
 * Shared scaffold for the fenced-block issue injectors (og, seo, top50link,
 * reviewlinks, vslinks, subscribe, trust, tabhash). Each injector supplies
 * its marks, a block builder, and an anchor-placement function; this module
 * owns the published-issue loop, fence refresh, counting, and logging that
 * used to be copy-pasted ~40 lines per script.
 *
 * Contract (matches the historical behavior of every injector):
 * - A file whose fence already exists gets its fence content replaced in
 *   place — the fence never moves once placed.
 * - Otherwise `place(html, block, issue)` inserts at the injector's anchor,
 *   returning the new html, or null when no anchor exists (counted skipped;
 *   the place fn is responsible for its own warning message).
 * - `buildBlock(issue, html)` may return null to skip a file silently (used
 *   by injectors that only apply to issues with matching content).
 * - `onRefresh(html, issue)` runs after an in-place refresh for cleanup an
 *   earlier anchor miss may have left behind (e.g. trust's legacy legal line).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { issues } from '../../src/data/issues.js';

export function replaceFenced(html, startMark, endMark, block) {
  const s = html.indexOf(startMark);
  const e = html.indexOf(endMark);
  if (s === -1 || e === -1) return null;
  return html.slice(0, s) + block + html.slice(e + endMark.length);
}

export async function runIssueInjector({ startMark, endMark, buildBlock, place, onRefresh }) {
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

    const block = await buildBlock(issue, html);
    if (block === null) {
      skipped++;
      continue;
    }

    const refreshed = replaceFenced(html, startMark, endMark, block);
    if (refreshed !== null) {
      html = onRefresh ? onRefresh(refreshed, issue) : refreshed;
      updated++;
    } else {
      const placed = place(html, block, issue);
      if (placed === null) {
        skipped++;
        continue;
      }
      html = placed;
      inserted++;
    }

    await writeFile(file, html);
    console.log(`+ ${file}`);
  }

  console.log(`\nDone. Inserted: ${inserted}. Updated: ${updated}. Skipped: ${skipped}.`);
  return { inserted, updated, skipped };
}
