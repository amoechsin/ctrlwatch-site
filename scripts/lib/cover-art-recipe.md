# Cover Hero Art — Recipe & Prompt Template

The painted **hero** is the only non-deterministic asset on a CTRL+WATCH splash
cover (Concept D). Everything else — masthead, logo, flashes, title, scanlines,
border — is composited deterministically from `issues.js` by the cover pipeline
(`scripts/generate-covers.mjs` → `scripts/lib/cover-furniture.mjs` +
`cover-compositor.mjs`). This file is the **consistency lock**: a fixed recipe so
12+ covers stay coherent, plus a reusable prompt template.

**Process:** AI-generate several candidates per issue → operator picks ONE →
save the master to `public/covers/heroes/NNN-hero.png` (committed) → set
`hero: 'heroes/NNN-hero.png'` (+ furniture fields) on that issue in
`src/data/issues.js` → `npm run covers`. **Never fully automatic** — a human
always picks the hero.

---

## The locked recipe (do not drift)

- **Medium:** airbrushed, glossy, high-gloss specular highlights, dramatic
  rim-lighting; Oliver-Frey-inspired 1980s game-magazine illustration.
- **Palette:** neon-on-dark — luminous greens/cyans/magentas against a deep
  space-blue/purple gradient; CRT bloom atmosphere. (bg `#0A0A12`/`#1a0a2e`;
  accents cyan `#00F0FF`, magenta `#FF00AA`, yellow `#FFE600`, green `#39FF14`,
  orange `#FF6B00`, red `#FF2244`.)
- **Composition:** a single dominant hero, **lower-center**, with **generous
  empty space in the top third** for the masthead. Portrait; generate high-res
  then the compositor crops to each aspect (3:4 splash, 1:1 square, 1.91:1 og)
  with `fit: cover`. Keep the subject within safe margins so no aspect clips it.
- **Subject:** **Yob** — the green-blob mascot, two large glossy eyes,
  expressive brows — posed/themed to the issue. For specials, a **symbolic
  scene** (no character) via `coverStar: 'symbolic'`.
- **Yob on-model:** maintain a canonical reference and use **reference-guided /
  image-to-image** generation (not text-only) so Yob stays consistent issue to
  issue. (Placeholder reference today: `public/covers/heroes/_placeholder.png`,
  produced by `npm run placeholder:hero`. Replace with a canonical
  `assets/yob-reference.png` once a real Yob exists.)

### Hard constraints (negative prompt — always include)
- **No text, lettering, numbers, or logos in the art** — all text is composited.
- No real-person likeness.
- No watermark, no signature, no UI/frames.

### Tooling
- **`npm run hero:gen -- NNN "<subject clause>"`** (`scripts/generate-hero.mjs`)
  calls the fal.ai API directly: wraps the clause in the locked prompt template,
  uses the newest committed `NNN-hero.png` as the image-to-image reference
  (keeps Yob on-model), and writes candidates to
  `public/covers/heroes/candidates/` (gitignored). Requires `FAL_KEY` in the
  gitignored `.env` (create at https://fal.ai/dashboard/keys); model defaults
  to `fal-ai/nano-banana/edit`, override via `HERO_MODEL`.
- **`npm run hero:pick -- NNN <i>`** promotes the chosen candidate to
  `heroes/NNN-hero.png` and prints the remaining pipeline steps. The operator
  ALWAYS picks — generation is automated, selection never is.
- Manual fal.ai web UI remains a valid fallback with the same prompt template.

---

## Reusable prompt template

Fill the `<<…>>` slots from the issue. Keep everything else fixed.

> Airbrushed glossy 1980s video-game-magazine cover illustration in the style of
> Oliver Frey. Subject: **<<Yob, a friendly glossy green blob mascot with two
> large reflective eyes and expressive brows>>**, **<<themed to: THE GAMING
> ISSUE — Yob clutching a glowing arcade joystick, surrounded by floating neon
> game icons>>**. Dramatic rim-lighting, high-gloss specular highlights, CRT
> bloom. Luminous neon greens, cyans and magentas against a deep space-blue to
> purple gradient background. Single dominant subject positioned lower-center
> with generous empty dark space in the upper third. Portrait orientation,
> high resolution, cinematic.
>
> **Negative prompt:** text, lettering, words, numbers, logo, watermark,
> signature, UI, frame, border, real person, photorealistic face.

### Symbolic-special variant (`coverStar: 'symbolic'`)
Drop the Yob clause; describe the conceptual scene instead, e.g. *"a colossal
neon CRT monolith cracking open over a chrome city"*. Same medium, palette,
composition rules, and negative prompt.
