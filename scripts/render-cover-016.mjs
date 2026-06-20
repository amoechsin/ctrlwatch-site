#!/usr/bin/env node
/**
 * Render the #016 painted splash cover (gaming) from its hero, ahead of #016
 * being a published issues.js entry. Uses the real hero if present, else the
 * placeholder. Writes public/covers/016-{splash,square,og}.png.
 *
 *   npm run covers:016
 *
 * When #016 is editorially published, move this furniture into issues.js and
 * drop this script — `npm run covers` will own it.
 */
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { composeCover, TARGETS, PLACEHOLDER_HERO } from './lib/cover-compositor.mjs';

const issue = {
  slug: '016',
  number: '#016',
  date: 'July 2026',
  title: 'THE GAMING ISSUE',
  coverColor: '#00F0FF',
  tag: 'GAMING',
  price: '£4.99',
  coverLines: [
    '▶ BOSS FIGHT: CADDICARUS vs CADDSHACK',
    '▶ HIDDEN LEVELS: 5 TINY CHANNELS',
  ],
  flashes: [
    { kind: 'tab', text: 'EXCLUSIVE!', color: '#FF2244' },
    { kind: 'starburst', text: '6 NEW|TOP 50!', color: '#FFE600' },
    { kind: 'sizzler', text: '96%|ESSENTIAL', color: '#00F0FF' },
    { kind: 'banner', text: 'PLAYER CARDS INSIDE!', color: '#FF00AA' },
    { kind: 'flash', text: '+ TIME CAPSULE', color: '#39FF14' },
  ],
};

const real = 'public/covers/heroes/016-hero.png';
const heroPath = existsSync(real) ? real : PLACEHOLDER_HERO;
console.log(`hero: ${heroPath}`);

for (const [name, { w, h }] of Object.entries(TARGETS)) {
  const png = await composeCover(issue, { width: w, height: h, heroPath });
  const out = join('public/covers', `016-${name}.png`);
  await writeFile(out, png);
  console.log(`+ ${out} (${w}x${h})`);
}
