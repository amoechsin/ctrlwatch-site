#!/usr/bin/env node
/**
 * Generate per-issue cover art and the default site OG image.
 *
 * For each published issue in src/data/issues.js this writes:
 *   public/covers/NNN-square.png   1080×1080   archive grid
 *   public/covers/NNN-og.png       1200× 630   OpenGraph / Twitter card
 *
 * Plus once:
 *   public/og-default.png          1200× 630   homepage/archive/about share preview
 *
 * Re-runnable: `npm run covers`. Idempotent — overwrites existing PNGs.
 *
 * Stack: satori (vdom → SVG) + sharp (SVG → PNG). Fonts are
 * cached in scripts/fonts/, committed for offline regeneration.
 */

import satori from 'satori';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { issues } from '../src/data/issues.js';

const OUT_DIR = 'public/covers';
const FONT_DIR = 'scripts/fonts';
const BG = '#080808';
const TEXT_PRIMARY = '#e8e8e8';
const TEXT_MUTED = '#666666';
const GREEN = '#00ff41';

await mkdir(OUT_DIR, { recursive: true });

const [pressStart2P, shareTechMono] = await Promise.all([
  readFile(join(FONT_DIR, 'PressStart2P-Regular.ttf')),
  readFile(join(FONT_DIR, 'ShareTechMono-Regular.ttf')),
]);

const fonts = [
  { name: 'Press Start 2P', data: pressStart2P, weight: 400, style: 'normal' },
  { name: 'Share Tech Mono', data: shareTechMono, weight: 400, style: 'normal' },
];

/* --------------------------------------------------------------------- */
/* Templates                                                             */
/* --------------------------------------------------------------------- */

function squareTemplate(issue) {
  const { number, title, date, tag, coverColor } = issue;
  return {
    type: 'div',
    props: {
      style: {
        width: '1080px',
        height: '1080px',
        display: 'flex',
        flexDirection: 'column',
        background: BG,
        border: `8px solid ${coverColor}`,
        position: 'relative',
        padding: '64px',
        fontFamily: 'Press Start 2P',
        boxSizing: 'border-box',
      },
      children: [
        // Top row: tag chip
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '20px',
              color: coverColor,
              border: `2px solid ${coverColor}`,
              padding: '12px 16px',
              letterSpacing: '0.15em',
              alignSelf: 'flex-start',
            },
            children: tag,
          },
        },
        // Big issue number centered
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '220px',
              color: coverColor,
              letterSpacing: '0.05em',
            },
            children: number,
          },
        },
        // Title block
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: titleFontSize(title, 1080),
              color: TEXT_PRIMARY,
              lineHeight: 1.4,
              letterSpacing: '0.05em',
              marginBottom: '40px',
              textAlign: 'center',
              justifyContent: 'center',
            },
            children: title,
          },
        },
        // Footer row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '18px',
              color: TEXT_MUTED,
              letterSpacing: '0.1em',
            },
            children: [
              { type: 'span', props: { style: { color: GREEN }, children: 'CTRL+WATCH' } },
              { type: 'span', props: { children: date.toUpperCase() } },
            ],
          },
        },
      ],
    },
  };
}

function ogTemplate(issue) {
  const { number, title, subtitle, date, tag, coverColor } = issue;
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: BG,
        border: `6px solid ${coverColor}`,
        padding: '56px 72px',
        fontFamily: 'Press Start 2P',
        boxSizing: 'border-box',
      },
      children: [
        // Top row: brand + issue number + date
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
              letterSpacing: '0.1em',
              marginBottom: '40px',
            },
            children: [
              { type: 'span', props: { style: { color: GREEN }, children: 'CTRL+WATCH' } },
              { type: 'span', props: { style: { color: coverColor }, children: number } },
              { type: 'span', props: { style: { color: TEXT_MUTED }, children: date.toUpperCase() } },
            ],
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: titleFontSize(title, 1200),
              color: TEXT_PRIMARY,
              lineHeight: 1.3,
              letterSpacing: '0.05em',
              marginBottom: '32px',
            },
            children: title,
          },
        },
        // Subtitle in Share Tech Mono
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'Share Tech Mono',
              fontSize: '26px',
              color: TEXT_PRIMARY,
              lineHeight: 1.5,
              letterSpacing: '0.02em',
              flex: 1,
            },
            children: `"${subtitle}"`,
          },
        },
        // Tag chip bottom right
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'flex-end',
            },
            children: {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: '16px',
                  color: coverColor,
                  border: `2px solid ${coverColor}`,
                  padding: '10px 14px',
                  letterSpacing: '0.15em',
                },
                children: tag,
              },
            },
          },
        },
      ],
    },
  };
}

function defaultOgTemplate() {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: BG,
        border: `6px solid ${GREEN}`,
        padding: '72px',
        fontFamily: 'Press Start 2P',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '88px',
              color: GREEN,
              letterSpacing: '0.05em',
              marginBottom: '32px',
            },
            children: 'CTRL+WATCH',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'Share Tech Mono',
              fontSize: '32px',
              color: TEXT_PRIMARY,
              lineHeight: 1.5,
              letterSpacing: '0.02em',
              marginBottom: '24px',
              maxWidth: '900px',
            },
            children: 'Your algorithm is broken. We\'re the fix.',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '18px',
              color: TEXT_MUTED,
              letterSpacing: '0.15em',
            },
            children: 'A RETRO-STYLED MAGAZINE REVIEWING YOUTUBE',
          },
        },
      ],
    },
  };
}

/* Press Start 2P is wide. Long titles need a smaller pt size so they
   wrap to two lines max within the canvas width. */
function titleFontSize(title, canvasWidth) {
  const charLimit = canvasWidth === 1080 ? 18 : 22;
  if (title.length <= charLimit) return canvasWidth === 1080 ? 52 : 56;
  if (title.length <= charLimit + 6) return canvasWidth === 1080 ? 42 : 46;
  return canvasWidth === 1080 ? 34 : 38;
}

/* --------------------------------------------------------------------- */
/* Render                                                                */
/* --------------------------------------------------------------------- */

async function render(node, width, height, outPath) {
  const svg = await satori(node, { width, height, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outPath, png);
  console.log(`+ ${outPath}`);
}

const published = issues.filter((i) => i.published);

for (const issue of published) {
  await render(squareTemplate(issue), 1080, 1080, join(OUT_DIR, `${issue.slug}-square.png`));
  await render(ogTemplate(issue), 1200, 630, join(OUT_DIR, `${issue.slug}-og.png`));
}

await render(defaultOgTemplate(), 1200, 630, 'public/og-default.png');

console.log(`\nDone. ${published.length} issues × 2 covers + 1 default OG.`);
