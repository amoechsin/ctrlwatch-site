/**
 * Painted splash-cover COMPOSITOR.
 *
 * Rasterises the SVG furniture with @resvg/resvg-js (explicit font buffers →
 * deterministic, offline) and composites three layers with sharp:
 *   background gradient  →  hero image (full-bleed cover)  →  furniture overlay.
 *
 * One painted hero drives all three TARGET sizes.
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildBackgroundSvg, buildFurnitureSvg } from './cover-furniture.mjs';

const FONT_DIR = 'scripts/fonts';
export const PLACEHOLDER_HERO = 'public/covers/heroes/_placeholder.png';

export const TARGETS = {
  splash: { w: 1080, h: 1440 },
  square: { w: 1080, h: 1080 },
  og: { w: 1200, h: 630 },
};

let _fonts = null;
/** Load + cache the display fonts as buffers (Archivo Black, Share Tech Mono). */
export async function loadCoverFonts() {
  if (_fonts) return _fonts;
  _fonts = await Promise.all([
    readFile(join(FONT_DIR, 'ArchivoBlack-Regular.ttf')),
    readFile(join(FONT_DIR, 'ShareTechMono-Regular.ttf')),
  ]);
  return _fonts;
}

/** SVG string → PNG Buffer at the given width (height follows the viewBox). */
export function renderSvg(svg, width, fonts) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
    font: { fontBuffers: fonts, defaultFontFamily: 'Archivo Black', loadSystemFonts: false },
  });
  return Buffer.from(r.render().asPng());
}

/** Compose a finished cover PNG Buffer for one issue at one target size. */
export async function composeCover(issue, { width, height, heroPath }) {
  const fonts = await loadCoverFonts();
  const coverColor = issue.coverColor;

  const bg = renderSvg(buildBackgroundSvg({ width, height, coverColor }), width, fonts);

  const layers = [];
  const hero = heroPath && existsSync(heroPath) ? heroPath
    : existsSync(PLACEHOLDER_HERO) ? PLACEHOLDER_HERO : null;
  if (hero) {
    const heroBuf = await sharp(hero)
      .resize(width, height, { fit: 'cover', position: 'centre' })
      .toBuffer();
    layers.push({ input: heroBuf });
  }

  const { svg, warnings } = buildFurnitureSvg(issue, { width, height });
  if (warnings.length) console.warn(`  ! ${issue.number}: ${warnings.join('; ')}`);
  layers.push({ input: renderSvg(svg, width, fonts) });

  return sharp(bg).composite(layers).png().toBuffer();
}
