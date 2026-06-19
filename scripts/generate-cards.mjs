#!/usr/bin/env node
/**
 * Generate a collectible Player Card PNG per channel review.
 *   public/cards/[slug].png       744×1040  portrait card
 *   public/cards/[slug]-og.png    1200×630  social/OG (added in Task 5)
 *
 * Re-runnable: `npm run cards`. Idempotent — overwrites existing PNGs.
 * Stack: satori (vdom → SVG) + sharp (SVG → PNG). Fonts cached in scripts/fonts/.
 * Data: src/content/reviews/*.md frontmatter, via src/lib/card-data.mjs.
 */
import satori from 'satori';
import sharp from 'sharp';
import matter from 'gray-matter';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveCard, resolveCategory, rankCards, emblemGrid } from '../src/lib/card-data.mjs';

const REVIEW_DIR = 'src/content/reviews';
const OUT_DIR = 'public/cards';
const FONT_DIR = 'scripts/fonts';

const AXES = [
  ['CONTENT', 'contentQuality'], ['CONSIST', 'consistency'], ['REPLAY', 'replayValue'],
  ['COMMUN', 'community'], ['X-FACTOR', 'xFactor'],
];

// material → frame gradient + overall-number color (satori-friendly: gradient
// background on the outer container forms the "border").
const FRAME = {
  holo:    { grad: 'linear-gradient(135deg,#00F0FF,#FF00AA,#FFE600,#39FF14)', overall: '#39FF14', ribbon: 'linear-gradient(90deg,#00F0FF,#39FF14)', ink: '#0A0A12' },
  gold:    { grad: 'linear-gradient(135deg,#FFE600,#FF9E00,#FFD24A)',         overall: '#FF9E00', ribbon: 'linear-gradient(90deg,#FFD24A,#FF9E00)', ink: '#0A0A12' },
  silver:  { grad: 'linear-gradient(135deg,#EEF0F6,#9AA0B0,#CFD4E0)',         overall: '#CDD2DE', ribbon: 'linear-gradient(90deg,#EEF0F6,#9AA0B0)', ink: '#0A0A12' },
  bronze:  { grad: 'linear-gradient(135deg,#E8B878,#A86A32,#D89A5A)',         overall: '#D89A5A', ribbon: 'linear-gradient(90deg,#E8B878,#A86A32)', ink: '#0A0A12' },
  matte:   { grad: 'linear-gradient(135deg,#34343F,#34343F)',                 overall: '#8A8A98', ribbon: '#2A2A34', ink: '#9090A0' },
  cracked: { grad: 'linear-gradient(135deg,#5A1A1A,#5A1A1A)',                 overall: '#FF2244', ribbon: '#3A0F16', ink: '#FF5A72' },
};

function pad3(n) { return String(n).padStart(3, '0'); }
function row(children, style = {}) { return { type: 'div', props: { style: { display: 'flex', ...style }, children } }; }
function txt(s, style) { return { type: 'div', props: { style: { display: 'flex', ...style }, children: String(s) } }; }

// 192px emblem: 12×12 grid of 16px cells.
function emblemNode(motif) {
  const grid = emblemGrid(motif);
  return row(
    grid.map((r) =>
      row(r.map((hex) => ({ type: 'div', props: { style: { display: 'flex', width: '16px', height: '16px', background: hex || 'transparent' } } }))),
    ),
    { flexDirection: 'column', width: '192px', height: '192px' },
  );
}

function cardNode(c, rank, total) {
  const f = FRAME[c.material];
  return {
    type: 'div',
    props: {
      style: { width: '744px', height: '1040px', display: 'flex', background: f.grad, padding: '16px', boxSizing: 'border-box', fontFamily: 'Share Tech Mono' },
      children: [{
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0C0C16', padding: '36px', boxSizing: 'border-box' },
          children: [
            // meta row
            row([
              txt(`No ${pad3(rank)} / ${pad3(total)}`, { fontSize: '22px', color: '#9090A0', letterSpacing: '0.08em' }),
              txt(c.categoryLabel, { fontSize: '22px', color: c.accent, letterSpacing: '0.08em' }),
            ], { justifyContent: 'space-between' }),
            // name
            txt(c.channel.toUpperCase(), { fontSize: '40px', color: '#FFFFFF', marginTop: '14px', marginBottom: '20px' }),
            // emblem panel
            row([emblemNode(c.motif)], { justifyContent: 'center', alignItems: 'center', background: '#05050B', border: '4px solid #2A2A3A', padding: '24px', marginBottom: '20px' }),
            // ribbon
            txt(c.verdict, { justifyContent: 'center', fontFamily: 'Press Start 2P', fontSize: '20px', color: f.ink, background: f.ribbon, padding: '16px', letterSpacing: '0.14em', marginBottom: '22px' }),
            // stat bars
            ...AXES.map(([label, key]) => row([
              txt(label, { width: '150px', fontSize: '20px', color: '#9090A0' }),
              row([{ type: 'div', props: { style: { display: 'flex', width: `${c.axes[key]}%`, height: '100%', background: c.accent } } }],
                { flex: 1, height: '20px', background: '#1A1A26', marginLeft: '12px', marginRight: '12px' }),
              txt(c.axes[key], { width: '54px', fontSize: '24px', color: '#E0E0E8', justifyContent: 'flex-end' }),
            ], { alignItems: 'center', marginBottom: '10px' })),
            // overall
            row([
              txt(c.overall, { fontSize: '96px', color: f.overall, lineHeight: 1 }),
              txt('OVERALL', { fontSize: '22px', color: '#9090A0', marginLeft: '16px' }),
            ], { alignItems: 'flex-end', justifyContent: 'center', marginTop: 'auto', paddingTop: '20px' }),
            // footer
            txt(`CTRL+WATCH · FIRST REVIEWED ${c.originatingIssue}`, { justifyContent: 'center', fontSize: '16px', color: '#606070', marginTop: '14px', letterSpacing: '0.08em' }),
          ],
        },
      }],
    },
  };
}

// 1200×630 social card: emblem + overall on the left, name + bars on the right.
function ogNode(c, rank, total) {
  const f = FRAME[c.material];
  return {
    type: 'div',
    props: {
      style: { width: '1200px', height: '630px', display: 'flex', background: f.grad, padding: '12px', boxSizing: 'border-box', fontFamily: 'Share Tech Mono' },
      children: [{
        type: 'div',
        props: {
          style: { display: 'flex', width: '100%', height: '100%', background: '#0C0C16', padding: '48px', boxSizing: 'border-box' },
          children: [
            // left column: emblem + overall
            row([
              emblemNode(c.motif),
              txt(c.overall, { fontSize: '120px', color: f.overall, lineHeight: 1, marginTop: '24px' }),
              txt(c.verdict, { fontFamily: 'Press Start 2P', fontSize: '16px', color: c.accent, marginTop: '12px' }),
            ], { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '340px' }),
            // right column: brand + name + bars
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: '48px', justifyContent: 'center' },
                children: [
                  txt('CTRL+WATCH · PLAYER PROFILE', { fontSize: '18px', color: '#39FF14', letterSpacing: '0.12em', marginBottom: '16px' }),
                  txt(c.channel, { fontSize: '52px', color: '#FFFFFF', marginBottom: '8px' }),
                  txt(`No ${pad3(rank)} / ${pad3(total)} · ${c.categoryLabel}`, { fontSize: '20px', color: '#9090A0', marginBottom: '28px' }),
                  ...AXES.map(([label, key]) => row([
                    txt(label, { width: '150px', fontSize: '18px', color: '#9090A0' }),
                    row([{ type: 'div', props: { style: { display: 'flex', width: `${c.axes[key]}%`, height: '100%', background: c.accent } } }],
                      { flex: 1, height: '16px', background: '#1A1A26', marginLeft: '12px' }),
                  ], { alignItems: 'center', marginBottom: '10px' })),
                ],
              },
            },
          ],
        },
      }],
    },
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [pressStart2P, shareTechMono] = await Promise.all([
    readFile(join(FONT_DIR, 'PressStart2P-Regular.ttf')),
    readFile(join(FONT_DIR, 'ShareTechMono-Regular.ttf')),
  ]);
  const fonts = [
    { name: 'Press Start 2P', data: pressStart2P, weight: 400, style: 'normal' },
    { name: 'Share Tech Mono', data: shareTechMono, weight: 400, style: 'normal' },
  ];

  const files = (await readdir(REVIEW_DIR)).filter((f) => f.endsWith('.md'));
  const reviews = [];
  const unmatched = new Set();
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const { data } = matter(await readFile(join(REVIEW_DIR, file), 'utf8'));
    if (data.draft) continue;
    if (resolveCategory(data.genre) === 'fallback') unmatched.add(`${slug}: ${data.genre}`);
    reviews.push({ slug, ...data });
  }
  const ranks = rankCards(reviews.map((r) => ({ slug: r.slug, overall: r.overall })));
  const total = reviews.length;

  for (const r of reviews) {
    const c = resolveCard(r);
    const svg = await satori(cardNode(c, ranks.get(r.slug), total), { width: 744, height: 1040, fonts });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(join(OUT_DIR, `${r.slug}.png`), png);
    console.log(`+ ${r.slug}.png`);
    const ogSvg = await satori(ogNode(c, ranks.get(r.slug), total), { width: 1200, height: 630, fonts });
    const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
    await writeFile(join(OUT_DIR, `${r.slug}-og.png`), ogPng);
  }

  if (unmatched.size) {
    console.warn(`\n⚠ ${unmatched.size} review(s) fell back to the default emblem — extend CATEGORY_MAP:`);
    for (const u of unmatched) console.warn(`  - ${u}`);
  }
  console.log(`\nDone. ${total} card${total === 1 ? '' : 's'}${unmatched.size ? ` (${unmatched.size} with fallback emblem)` : ''}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
