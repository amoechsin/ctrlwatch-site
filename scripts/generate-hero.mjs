#!/usr/bin/env node
/**
 * Hero-art candidate generation + pick (cover-art-recipe.md, automated).
 *
 * Generate candidates (reference-guided, keeps Yob on-model):
 *   npm run hero:gen -- 017 "standing nose-to-nose with a chrome robot replica of himself on a factory conveyor line, robotic arms overhead mid-assembly of more copies"
 *     [--ref public/covers/heroes/016-hero.png]  reference image (default: latest existing NNN-hero.png)
 *     [--n 4]                                    number of candidates (default 4)
 *   → writes public/covers/heroes/candidates/NNN-1.png … NNN-n.png (gitignored)
 *
 * Promote the winner (the human-picks rule — never skipped):
 *   npm run hero:pick -- 017 3
 *   → copies candidates/017-3.png to heroes/017-hero.png and prints next steps
 *
 * Requires FAL_KEY in the environment or the gitignored .env
 * (create at https://fal.ai/dashboard/keys). Model defaults to
 * fal-ai/nano-banana/edit (reference-driven edit — best at "same character,
 * new scene"); override with HERO_MODEL env var.
 */

import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const HEROES_DIR = 'public/covers/heroes';
const CANDIDATES_DIR = `${HEROES_DIR}/candidates`;
const MODEL = process.env.HERO_MODEL || 'fal-ai/nano-banana/edit';

// The locked recipe (cover-art-recipe.md) — only the subject clause varies.
const promptFor = (subject) =>
  'Airbrushed glossy 1980s video-game-magazine cover illustration in the style of Oliver Frey. ' +
  `Subject: Yob, a friendly glossy green blob mascot with two large reflective eyes and expressive brows, ${subject}. ` +
  'Dramatic rim-lighting, high-gloss specular highlights, CRT bloom. ' +
  'Luminous neon greens, cyans and magentas against a deep space-blue to purple gradient background. ' +
  'Single dominant subject positioned lower-center with generous empty dark space in the upper third. ' +
  'Portrait orientation, high resolution, cinematic. ' +
  'Strictly no text, lettering, words, numbers, logos, watermarks, signatures, UI, frames, or borders in the image; no real-person likeness.';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

// FAL_KEY: env first, then the gitignored .env (same pattern as promote-status).
if (!process.env.FAL_KEY) {
  try {
    const env = await readFile(new URL('../.env', import.meta.url), 'utf8');
    const m = env.match(/^FAL_KEY=(.+)$/m);
    if (m) process.env.FAL_KEY = m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
}

const args = process.argv.slice(2);
const slug = args[0];
if (!slug || !/^\d{3}$/.test(slug)) die('Usage: hero:gen -- NNN "subject clause" | hero:pick -- NNN <candidate#>');

// ---------- pick mode ----------
const pickIdx = args.indexOf('--pick') !== -1 ? args[args.indexOf('--pick') + 1] : (/^\d+$/.test(args[1] ?? '') ? args[1] : null);
if (pickIdx) {
  const src = `${CANDIDATES_DIR}/${slug}-${pickIdx}.png`;
  const dst = `${HEROES_DIR}/${slug}-hero.png`;
  if (!existsSync(src)) die(`✖ ${src} not found — run hero:gen first (candidates: ${CANDIDATES_DIR}/)`);
  await copyFile(src, dst);
  console.log(`✔ ${dst} ← candidate ${pickIdx}

Next steps:
  1. issues.js #${slug}: add  hero: 'heroes/${slug}-hero.png', coverStar: 'yob', price, coverLines[], flashes[]
  2. npm run covers        (renders ${slug}-splash/square/og from the hero)
  3. npm run inject:og     (points the issue OG meta at the new og image)
  4. Eyeball public/covers/${slug}-splash.png — subject must clear the title band
  5. Commit the hero + covers + issues.js together`);
  process.exit(0);
}

// ---------- generate mode ----------
const subject = args[1];
if (!subject || subject.startsWith('--')) die('hero:gen needs a subject clause: npm run hero:gen -- 017 "…Yob doing the issue\'s thing…"');
if (!process.env.FAL_KEY) die('✖ FAL_KEY not set (env or .env). Create one at https://fal.ai/dashboard/keys');

const nIdx = args.indexOf('--n');
const count = nIdx !== -1 ? Number(args[nIdx + 1]) : 4;
const refIdx = args.indexOf('--ref');
let refPath = refIdx !== -1 ? args[refIdx + 1] : null;

if (!refPath) {
  // Default reference: the newest existing real hero (keeps Yob on-model).
  const heroes = (await readdir(HEROES_DIR)).filter((f) => /^\d{3}-hero\.png$/.test(f)).sort();
  if (!heroes.length) die(`✖ no reference hero in ${HEROES_DIR} — pass --ref <path>`);
  refPath = `${HEROES_DIR}/${heroes.at(-1)}`;
}

console.log(`Model:     ${MODEL}
Reference: ${refPath}
Candidates:${count}
Subject:   ${subject}\n`);

const refB64 = (await readFile(refPath)).toString('base64');
const prompt = promptFor(subject);

const res = await fetch(`https://fal.run/${MODEL}`, {
  method: 'POST',
  headers: {
    Authorization: `Key ${process.env.FAL_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt,
    image_urls: [`data:image/png;base64,${refB64}`],
    num_images: count,
  }),
});

if (!res.ok) {
  die(`✖ fal.ai ${res.status}: ${(await res.text()).slice(0, 500)}`);
}

const data = await res.json();
const images = data.images ?? [];
if (!images.length) die(`✖ fal.ai returned no images: ${JSON.stringify(data).slice(0, 300)}`);

await mkdir(CANDIDATES_DIR, { recursive: true });
let i = 0;
for (const img of images) {
  i++;
  const bin = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  // Normalize to PNG regardless of what the model returned.
  const { default: sharp } = await import('sharp');
  const out = `${CANDIDATES_DIR}/${slug}-${i}.png`;
  await writeFile(out, await sharp(bin).png().toBuffer());
  console.log(`+ ${out}`);
}

console.log(`\n${i} candidate(s) written. Look at them, then promote the winner:
  npm run hero:pick -- ${slug} <1-${i}>
(Not happy? Re-run hero:gen with a tweaked subject clause — same recipe, new roll.)`);
