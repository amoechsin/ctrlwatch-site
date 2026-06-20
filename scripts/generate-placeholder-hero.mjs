#!/usr/bin/env node
/**
 * Generate a deterministic PLACEHOLDER hero for the painted splash-cover
 * pipeline: a glossy Yob-ish green blob, lower-center, with a clear dark/empty
 * top third for the masthead. No randomness — same bytes every run.
 *
 * Real heroes are AI-generated (fal.ai) and human-picked per issue; this exists
 * so the compositor produces real output before any art exists (spec §7.1/§12).
 *
 *   npm run placeholder:hero  →  public/covers/heroes/_placeholder.png
 */
import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';

const W = 1200;
const H = 1600;
const cx = 600;
const cy = 1080;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#39FF14" stop-opacity="0.45"/>
      <stop offset="0.6" stop-color="#00F0FF" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#00F0FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="body" cx="0.4" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#9bff7a"/>
      <stop offset="0.45" stop-color="#39FF14"/>
      <stop offset="1" stop-color="#0c8a2a"/>
    </radialGradient>
    <radialGradient id="gloss" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>

  <!-- atmospheric halo behind the blob -->
  <ellipse cx="${cx}" cy="${cy}" rx="540" ry="560" fill="url(#halo)"/>

  <!-- body: a rounded blob -->
  <path d="M ${cx} ${cy - 380}
           C ${cx + 300} ${cy - 380}, ${cx + 360} ${cy - 120}, ${cx + 360} ${cy + 40}
           C ${cx + 360} ${cy + 280}, ${cx + 200} ${cy + 400}, ${cx} ${cy + 400}
           C ${cx - 200} ${cy + 400}, ${cx - 360} ${cy + 280}, ${cx - 360} ${cy + 40}
           C ${cx - 360} ${cy - 120}, ${cx - 300} ${cy - 380}, ${cx} ${cy - 380} Z"
        fill="url(#body)" stroke="#00F0FF" stroke-width="6" stroke-opacity="0.6"/>

  <!-- rim glow -->
  <ellipse cx="${cx}" cy="${cy}" rx="360" ry="390" fill="none" stroke="#39FF14" stroke-width="10" stroke-opacity="0.35" filter="url(#soft)"/>

  <!-- specular gloss top-left -->
  <ellipse cx="${cx - 120}" cy="${cy - 230}" rx="150" ry="90" fill="url(#gloss)"/>

  <!-- eyes -->
  <g>
    <ellipse cx="${cx - 120}" cy="${cy - 90}" rx="92" ry="110" fill="#ffffff"/>
    <ellipse cx="${cx + 120}" cy="${cy - 90}" rx="92" ry="110" fill="#ffffff"/>
    <circle cx="${cx - 108}" cy="${cy - 64}" r="46" fill="#0A0A12"/>
    <circle cx="${cx + 132}" cy="${cy - 64}" r="46" fill="#0A0A12"/>
    <circle cx="${cx - 122}" cy="${cy - 84}" r="14" fill="#ffffff"/>
    <circle cx="${cx + 118}" cy="${cy - 84}" r="14" fill="#ffffff"/>
  </g>

  <!-- expressive brows -->
  <rect x="${cx - 210}" y="${cy - 232}" width="170" height="30" rx="14" fill="#0c8a2a" transform="rotate(-12 ${cx - 125} ${cy - 217})"/>
  <rect x="${cx + 40}" y="${cy - 232}" width="170" height="30" rx="14" fill="#0c8a2a" transform="rotate(12 ${cx + 125} ${cy - 217})"/>
</svg>`;

await mkdir('public/covers/heroes', { recursive: true });
const png = Buffer.from(new Resvg(svg, { background: 'rgba(0,0,0,0)' }).render().asPng());
await writeFile('public/covers/heroes/_placeholder.png', png);
console.log(`+ public/covers/heroes/_placeholder.png (${W}x${H}, ${png.length} bytes)`);
