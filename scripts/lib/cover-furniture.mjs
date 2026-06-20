/**
 * Painted splash-cover FURNITURE — pure SVG-string builders (no I/O).
 *
 * Two products:
 *   buildBackgroundSvg() — the bottom layer (neon gradient + faint ray fan),
 *                          composited UNDER the hero.
 *   buildFurnitureSvg()  — the top layer (scrims, masthead+logo, strapline,
 *                          flashes, title, cover-lines, price, barcode,
 *                          scanlines, border), composited OVER the hero.
 *
 * Everything reframes per target aspect via frame(width,height). Rasterised by
 * @resvg/resvg-js with explicit font buffers, so 'Archivo Black' / 'Share Tech
 * Mono' resolve deterministically offline.
 */
import { NEON, escapeXml as esc } from './cover-palette.mjs';

export const MAX_FLASHES = 6;
const LOGO_FONT = 'Archivo Black';
const MONO_FONT = 'Share Tech Mono';

/* ---------------------------------------------------------------- geometry */

/** Jagged star path centered at origin, first vertex pointing up. */
export function starPath(spikes, outerR, innerR) {
  const pts = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** Aspect + scale + key band positions for a target size. */
export function frame(width, height) {
  const ratio = width / height;
  const aspect = ratio < 0.85 ? 'portrait' : ratio > 1.4 ? 'wide' : 'square';
  const u = width / 1080; // scale unit relative to the splash master width
  return {
    aspect,
    u,
    width,
    height,
    logoSize: (aspect === 'wide' ? 0.072 : 0.122) * width,
    titleBandY: (aspect === 'wide' ? 0.60 : aspect === 'square' ? 0.76 : 0.72) * height,
    border: Math.round(6 * u),
  };
}

/* Flash slots as [fracX, fracY, rotationDeg], edge-anchored, hero-avoiding. */
const SLOTS = {
  portrait: [[0.80, 0.31, -8], [0.20, 0.40, 6], [0.83, 0.58, 8], [0.17, 0.63, -7], [0.79, 0.74, -10], [0.23, 0.79, 9]],
  square: [[0.82, 0.25, -8], [0.18, 0.30, 6], [0.85, 0.50, 8], [0.15, 0.57, -7], [0.80, 0.74, -10], [0.22, 0.80, 9]],
  wide: [[0.87, 0.22, -8], [0.13, 0.26, 7], [0.88, 0.58, 9], [0.12, 0.64, -7], [0.71, 0.86, -10], [0.30, 0.86, 9]],
};

/* ------------------------------------------------------------- text helper */

function attrStr(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

function text(body, o) {
  return `<text ${attrStr(o)}>${body}</text>`;
}

/** Greedy word-wrap into lines no longer than maxChars. */
function wrapWords(s, maxChars) {
  const words = String(s).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ----------------------------------------------------------------- flashes */

function flashRect(t, color, u, { fontK = 22, padX = 16, h = 56, italic = false } = {}) {
  const label = esc(String(t).replace('|', ' '));
  const w = label.length * fontK * 0.66 + padX * 2 * u;
  const fs = fontK * u;
  const skew = italic ? ' transform="skewX(-10)"' : '';
  return (
    `<rect x="${(-w / 2).toFixed(1)}" y="${(-h * u / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${(h * u).toFixed(1)}" ` +
    `fill="${color}" stroke="${NEON.dark}" stroke-width="${(3 * u).toFixed(1)}"/>` +
    `<g${skew}>` +
    text(label, {
      x: 0, y: fs * 0.34, 'text-anchor': 'middle', 'font-family': LOGO_FONT,
      'font-size': fs.toFixed(1), fill: NEON.dark,
    }) +
    `</g>`
  );
}

function flashStar(t, color, u, big) {
  const r = (big ? 96 : 86) * u;
  const lines = String(t).split('|').map((s) => esc(s.trim()));
  const fs = (lines.length > 1 ? 30 : 38) * u;
  const startY = -((lines.length - 1) * fs * 0.55) + fs * 0.34;
  const tspans = lines
    .map((l, i) => text(l, {
      x: 0, y: (startY + i * fs * 1.05).toFixed(1), 'text-anchor': 'middle',
      'font-family': LOGO_FONT, 'font-size': fs.toFixed(1), fill: NEON.dark,
    }))
    .join('');
  return (
    `<path d="${starPath(12, r, r * 0.52)}" fill="${color}" stroke="${NEON.dark}" stroke-width="${(3 * u).toFixed(1)}"/>` +
    tspans
  );
}

function renderFlash(f, slot, fr) {
  const [fx, fy, rot] = slot;
  const x = (fx * fr.width).toFixed(1);
  const y = (fy * fr.height).toFixed(1);
  const u = fr.u;
  let inner;
  switch (f.kind) {
    case 'starburst':
    case 'sizzler':
      inner = flashStar(f.text, f.color, u, f.kind === 'sizzler');
      break;
    case 'banner':
      inner = flashRect(f.text, f.color, u, { fontK: 26, h: 50, italic: true });
      break;
    case 'flash':
      inner = flashRect(f.text, f.color, u, { fontK: 18, h: 42, padX: 12 });
      break;
    case 'tab':
    default:
      inner = flashRect(f.text, f.color, u, { fontK: 22, h: 54 });
      break;
  }
  return `<g data-flash="1" transform="translate(${x} ${y}) rotate(${rot})">${inner}</g>`;
}

/* -------------------------------------------------------------- background */

export function buildBackgroundSvg({ width, height, coverColor = NEON.cyan }) {
  const rays = [];
  const cx = width * 0.5;
  const cy = height * 0.18;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x2 = cx + Math.cos(a) * height;
    const y2 = cy + Math.sin(a) * height;
    const a2 = a + 0.18;
    const x3 = cx + Math.cos(a2) * height;
    const y3 = cy + Math.sin(a2) * height;
    rays.push(`<path d="M${cx},${cy} L${x2.toFixed(0)},${y2.toFixed(0)} L${x3.toFixed(0)},${y3.toFixed(0)} Z" fill="${coverColor}" opacity="0.04"/>`);
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${NEON.bg1}"/><stop offset="0.55" stop-color="${NEON.bg0}"/><stop offset="1" stop-color="${NEON.bg0}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    rays.join('') +
    `</svg>`
  );
}

/* --------------------------------------------------------------- furniture */

export function buildFurnitureSvg(issue, { width, height }) {
  const fr = frame(width, height);
  const { u, aspect } = fr;
  const coverColor = issue.coverColor || NEON.cyan;
  const warnings = [];

  /* defs: glow filter, scanline pattern, top/bottom scrims */
  const blur = Math.max(2, width / 200);
  const defs =
    `<defs>` +
    `<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">` +
    `<feGaussianBlur stdDeviation="${blur.toFixed(1)}" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse">` +
    `<rect width="3" height="1.3" fill="#000000" opacity="0.16"/></pattern>` +
    `<linearGradient id="scrimTop" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${NEON.bg0}" stop-opacity="0.92"/><stop offset="1" stop-color="${NEON.bg0}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="scrimBot" x1="0" y1="1" x2="0" y2="0">` +
    `<stop offset="0" stop-color="${NEON.bg0}" stop-opacity="0.95"/><stop offset="1" stop-color="${NEON.bg0}" stop-opacity="0"/></linearGradient>` +
    `</defs>`;

  /* scrims for legibility over any hero */
  const topScrimH = (aspect === 'wide' ? 0.34 : 0.26) * height;
  const botScrimH = (aspect === 'wide' ? 0.42 : 0.34) * height;
  const scrims =
    `<rect x="0" y="0" width="${width}" height="${topScrimH.toFixed(0)}" fill="url(#scrimTop)"/>` +
    `<rect x="0" y="${(height - botScrimH).toFixed(0)}" width="${width}" height="${botScrimH.toFixed(0)}" fill="url(#scrimBot)"/>`;

  /* masthead banner + logo */
  const logoY = (aspect === 'wide' ? 0.16 : 0.13) * height;
  const bannerH = fr.logoSize * 1.35;
  const banner =
    `<g transform="skewX(-7)">` +
    `<rect x="${(-width * 0.1).toFixed(0)}" y="${(logoY - bannerH * 0.62).toFixed(0)}" width="${(width * 1.2).toFixed(0)}" height="${bannerH.toFixed(0)}" fill="${NEON.bg0}" opacity="0.55"/>` +
    `<rect x="${(-width * 0.1).toFixed(0)}" y="${(logoY + bannerH * 0.38).toFixed(0)}" width="${(width * 1.2).toFixed(0)}" height="${(4 * u).toFixed(1)}" fill="${NEON.magenta}"/>` +
    `</g>`;
  const logo =
    `<g transform="skewX(-7)" filter="url(#glow)">` +
    text('', {
      x: width / 2, y: logoY + fr.logoSize * 0.34, 'text-anchor': 'middle',
      'font-family': LOGO_FONT, 'font-size': fr.logoSize.toFixed(1),
      fill: '#ffffff', stroke: NEON.magenta, 'stroke-width': (fr.logoSize * 0.055).toFixed(1),
      'paint-order': 'stroke',
    }).replace('></text>',
      `><tspan>CTRL</tspan><tspan fill="${NEON.yellow}">+</tspan><tspan>WATCH</tspan></text>`) +
    `</g>`;

  /* strapline */
  const strapY = logoY + fr.logoSize * 0.82;
  const strap = text(esc(`ISSUE ${issue.number} · ${String(issue.date).toUpperCase()} · THE YOUTUBE REVIEW MAGAZINE`), {
    x: width / 2, y: strapY.toFixed(1), 'text-anchor': 'middle', 'font-family': MONO_FONT,
    'font-size': (width * 0.0185).toFixed(1), fill: NEON.cyan, 'letter-spacing': (1.2 * u).toFixed(1),
  });

  /* flashes (cap at MAX_FLASHES) */
  let flashes = Array.isArray(issue.flashes) ? issue.flashes : [];
  if (flashes.length > MAX_FLASHES) {
    warnings.push(`flashes capped ${flashes.length}→${MAX_FLASHES}`);
    flashes = flashes.slice(0, MAX_FLASHES);
  }
  const slots = SLOTS[aspect];
  const flashSvg = flashes.map((f, i) => renderFlash(f, slots[i % slots.length], fr)).join('');

  /* cover title: yellow fill + dark stroke + magenta offset shadow, italic */
  const maxChars = aspect === 'wide' ? 16 : 11;
  const lines = wrapWords(issue.title, maxChars);
  const tSize = (lines.length >= 3 ? 0.066 : lines.length === 2 ? 0.086 : 0.094) * width;
  const off = 6 * u;
  const titleTop = fr.titleBandY;
  const titleSvg = lines
    .map((ln, i) => {
      const y = titleTop + i * tSize * 1.02;
      const common = {
        x: width / 2, 'text-anchor': 'middle', 'font-family': LOGO_FONT,
        'font-size': tSize.toFixed(1),
      };
      const shadow = text(esc(ln), { ...common, x: width / 2 + off, y: (y + off).toFixed(1), fill: NEON.magenta });
      const main = text(esc(ln), { ...common, y: y.toFixed(1), fill: NEON.yellow, stroke: NEON.dark, 'stroke-width': (tSize * 0.06).toFixed(1), 'paint-order': 'stroke' });
      return `<g transform="skewX(-6)">${shadow}${main}</g>`;
    })
    .join('');

  /* cover-lines: ▶-bulleted, mono cyan, below the title */
  const coverLines = Array.isArray(issue.coverLines) ? issue.coverLines : [];
  const clStart = titleTop + lines.length * tSize * 1.02 + 38 * u;
  const clSize = width * 0.023;
  const clMax = aspect === 'wide' ? 1 : 3;
  const clSvg = coverLines.slice(0, clMax)
    .map((ln, i) => text(esc(ln), {
      x: width / 2, y: (clStart + i * clSize * 1.5).toFixed(1), 'text-anchor': 'middle',
      'font-family': MONO_FONT, 'font-size': clSize.toFixed(1), fill: NEON.cyan,
    }))
    .join('');

  /* price (bottom-left) + barcode (bottom-right) */
  const baseY = height - 30 * u;
  const price = issue.price
    ? text(esc(issue.price), { x: 44 * u, y: baseY.toFixed(1), 'font-family': LOGO_FONT, 'font-size': (width * 0.03).toFixed(1), fill: NEON.text })
    : '';
  const bars = [];
  const slug = String(issue.slug || issue.number || '0');
  let bx = width - 44 * u;
  for (let i = slug.length * 6; i >= 0; i--) {
    const wbar = ((slug.charCodeAt(i % slug.length) % 4) + 1) * u;
    bx -= wbar + 1.5 * u;
    if (i % 2 === 0) bars.push(`<rect x="${bx.toFixed(1)}" y="${(baseY - 26 * u).toFixed(1)}" width="${wbar.toFixed(1)}" height="${(26 * u).toFixed(1)}" fill="${NEON.text}"/>`);
  }
  const barcode = bars.join('');

  /* scanlines over everything, then neon border */
  const scan = `<rect width="${width}" height="${height}" fill="url(#scan)"/>`;
  const b = fr.border;
  const border = `<rect x="${b / 2}" y="${b / 2}" width="${width - b}" height="${height - b}" fill="none" stroke="${coverColor}" stroke-width="${b}"/>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    defs + scrims + banner + logo + strap + flashSvg + titleSvg + clSvg + price + barcode + scan + border +
    `</svg>`;

  return { svg, warnings };
}
