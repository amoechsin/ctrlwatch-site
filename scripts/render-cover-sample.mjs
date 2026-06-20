#!/usr/bin/env node
/**
 * Render a demo splash/square/og cover over the placeholder hero so the
 * furniture can be eyeballed before any real art exists (spec §12). Writes:
 *   public/covers/_sample-splash.png  1080×1440
 *   public/covers/_sample-square.png  1080×1080
 *   public/covers/_sample-og.png      1200× 630
 *
 *   npm run covers:sample
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { composeCover, TARGETS, PLACEHOLDER_HERO } from './lib/cover-compositor.mjs';

const sample = {
  slug: '016',
  number: '#016',
  date: 'July 2026',
  title: 'THE GAMING ISSUE',
  subtitle: 'When play became a profession.',
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
    { kind: 'sizzler', text: '96%|★ ESSENTIAL', color: '#00F0FF' },
    { kind: 'banner', text: 'PLAYER CARDS INSIDE!', color: '#FF00AA' },
    { kind: 'flash', text: '+ TIME CAPSULE', color: '#39FF14' },
  ],
};

const OUT = 'public/covers';
for (const [name, { w, h }] of Object.entries(TARGETS)) {
  const png = await composeCover(sample, { width: w, height: h, heroPath: PLACEHOLDER_HERO });
  const path = join(OUT, `_sample-${name}.png`);
  await writeFile(path, png);
  console.log(`+ ${path} (${w}x${h}, ${png.length} bytes)`);
}
