#!/usr/bin/env node
/**
 * Render the #016 painted splash cover (gaming) from its hero, ahead of #016
 * flipping to published:true. Sources furniture from the locked issues.js #016
 * entry (single source of truth — no drift). Writes 016-{splash,square,og}.png.
 *
 *   npm run covers:016
 *
 * When #016 flips to published:true, drop this script — `npm run covers` owns it.
 */
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { composeCover, TARGETS, PLACEHOLDER_HERO } from './lib/cover-compositor.mjs';
import { issues } from '../src/data/issues.js';

const issue = issues.find((i) => i.slug === '016');
if (!issue) throw new Error('No #016 entry in src/data/issues.js');

const real = 'public/covers/heroes/016-hero.png';
const heroPath = existsSync(real) ? real : PLACEHOLDER_HERO;
console.log(`hero: ${heroPath}`);

for (const [name, { w, h }] of Object.entries(TARGETS)) {
  const png = await composeCover(issue, { width: w, height: h, heroPath });
  const out = join('public/covers', `016-${name}.png`);
  await writeFile(out, png);
  console.log(`+ ${out} (${w}x${h})`);
}
