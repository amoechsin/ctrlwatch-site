# CTRL+WATCH — Claude Code Project Brief
# Version: 1.0 | Status: Ready for scaffold

---

## 0. INSTRUCTIONS FOR CLAUDE CODE

Read this entire file before writing a single line of code.
Build everything described. Do not ask for confirmation per file.
When done, run `npm run dev` and confirm the dev server starts successfully.
Report any errors and fix them automatically.

---

## 1. PROJECT IDENTITY

| Field        | Value                                          |
|--------------|------------------------------------------------|
| Name         | CTRL+WATCH                                     |
| Tagline      | "Your algorithm is broken. We're the fix."     |
| Concept      | Retro 1980s/90s gaming magazine reviewing YouTube channels |
| Mascot       | "Yob" — a phosphor-green pixel blob            |
| Issue format | #001, #002, #003                               |
| Domain       | ctrlwatch.com (use as placeholder in all meta) |

---

## 2. TECH STACK

- **Framework**: Astro (latest stable)
- **Styling**: Pure CSS with CSS custom properties — NO Tailwind, NO CSS frameworks
- **JS**: Vanilla only where needed (no React, no Vue)
- **Fonts**: Google Fonts — `Press Start 2P` (headers/display) + `Share Tech Mono` (body/UI)
- **Hosting target**: Netlify — include `netlify.toml`
- **Plugins**: `@astrojs/sitemap`, `@astrojs/rss`
- **No backend. No database. Fully static.**

---

## 3. DESIGN SYSTEM

### 3.1 Color Palette (define as CSS custom properties in a global `tokens.css`)

```css
:root {
  /* Base */
  --bg:           #080808;
  --bg-secondary: #111111;
  --bg-card:      #0f0f0f;
  --border:       #1e1e1e;

  /* Brand Colors */
  --green:        #00ff41;   /* phosphor green — primary accent */
  --yellow:       #ffe600;   /* highlight / cover star ratings */
  --cyan:         #00f0ff;   /* secondary accent / links */
  --orange:       #ff6600;   /* warnings / boss fight / special sections */
  --red:          #ff2244;   /* scores below 50, danger */
  --magenta:      #ff00aa;   /* featured / cover story */

  /* Typography */
  --text-primary:   #e8e8e8;
  --text-secondary: #888888;
  --text-muted:     #444444;

  /* Glow effects */
  --glow-green:   0 0 8px rgba(0,255,65,0.6),  0 0 20px rgba(0,255,65,0.2);
  --glow-cyan:    0 0 8px rgba(0,240,255,0.6),  0 0 20px rgba(0,240,255,0.2);
  --glow-yellow:  0 0 8px rgba(255,230,0,0.6),  0 0 20px rgba(255,230,0,0.2);

  /* Spacing scale */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  32px;
  --space-xl:  64px;

  /* Typography scale */
  --text-xs:   clamp(8px,  1.5vw, 10px);
  --text-sm:   clamp(10px, 2vw,   12px);
  --text-md:   clamp(12px, 2.5vw, 14px);
  --text-lg:   clamp(14px, 3vw,   18px);
  --text-xl:   clamp(18px, 4vw,   24px);
  --text-2xl:  clamp(22px, 5vw,   32px);
  --text-3xl:  clamp(28px, 6vw,   48px);

  /* Layout */
  --max-width: 1200px;
  --border-radius: 2px; /* Keep sharp — retro feel */
}
```

### 3.2 Typography Rules

```css
/* Display / Section headers */
.font-display {
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 0.05em;
  line-height: 1.6;
}

/* Body / UI / labels */
.font-mono {
  font-family: 'Share Tech Mono', monospace;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

/* ALL headings use Press Start 2P */
/* ALL body text uses Share Tech Mono */
```

### 3.3 CRT Scanline Effect (apply to `.crt` class)

```css
.crt::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.07) 0px,
    rgba(0,0,0,0.07) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 9999;
}

.crt::after {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: radial-gradient(ellipse at center,
    transparent 60%,
    rgba(0,0,0,0.4) 100%
  );
  pointer-events: none;
  z-index: 9998;
}
```

### 3.4 Reusable Component Classes

```css
/* Tag/badge chips */
.tag {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 4px 8px;
  border: 1px solid currentColor;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Score badge */
.score-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: var(--text-xl);
  color: var(--yellow);
  text-shadow: var(--glow-yellow);
  border: 2px solid var(--yellow);
  padding: 8px 16px;
  display: inline-block;
}

/* Section divider */
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: var(--space-lg) 0;
  position: relative;
}
.divider::after {
  content: '///';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg);
  color: var(--text-muted);
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  padding: 0 8px;
}

/* Glowing button */
.btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid var(--green);
  color: var(--green);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
}
.btn:hover {
  background: var(--green);
  color: var(--bg);
  box-shadow: var(--glow-green);
}

/* Card container */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: var(--space-md);
  transition: border-color 0.2s ease;
}
.card:hover {
  border-color: var(--green);
}

/* Pixel cursor blink animation */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.cursor::after {
  content: '█';
  color: var(--green);
  animation: blink 1s step-end infinite;
}

/* Flicker animation for boot text */
@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.4; }
}
.flicker { animation: flicker 5s infinite; }

/* Typewriter animation */
@keyframes typewriter {
  from { width: 0; }
  to   { width: 100%; }
}
```

---

## 4. FILE & FOLDER STRUCTURE

Create exactly this structure:

```
ctrlwatch-site/
├── public/
│   ├── favicon.ico              ← Use a simple green pixel "C" on black
│   ├── robots.txt
│   └── issues/
│       ├── 001/
│       │   └── index.html       ← Placeholder with "ISSUE #001 — COMING SOON"
│       └── 002/
│           └── index.html       ← Placeholder with "ISSUE #002 — COMING SOON"
├── src/
│   ├── styles/
│   │   ├── tokens.css           ← All CSS custom properties (Section 3.1)
│   │   ├── global.css           ← Base reset + body + global styles
│   │   ├── components.css       ← Reusable component classes (Section 3.4)
│   │   └── crt.css             ← CRT/scanline effect (Section 3.3)
│   ├── layouts/
│   │   └── BaseLayout.astro     ← HTML shell, imports fonts, global CSS, nav, footer
│   ├── components/
│   │   ├── Nav.astro            ← Top navigation bar
│   │   ├── Footer.astro         ← Footer with Yob mascot
│   │   ├── IssueCard.astro      ← Reusable issue card for archive grid
│   │   └── BootScreen.astro     ← Animated boot sequence (JS, dismissable)
│   ├── pages/
│   │   ├── index.astro          ← Homepage
│   │   ├── archive.astro        ← All issues grid
│   │   ├── about.astro          ← Manifesto page
│   │   └── rss.xml.js           ← RSS feed endpoint
│   └── data/
│       └── issues.js            ← Issue metadata array (source of truth)
├── netlify.toml
├── astro.config.mjs
├── package.json
└── BRIEF.md
```

---

## 5. DATA SOURCE — `src/data/issues.js`

This is the single source of truth for all issues. All pages pull from this.

```javascript
export const issues = [
  {
    slug: '001',
    number: '#001',
    date: 'July 2025',
    title: 'THE 50 GREATEST YOUTUBE CHANNELS',
    subtitle: 'The definitive ranking. Your algorithm hates us for this.',
    coverColor: '#00ff41',
    tag: 'PREMIERE ISSUE',
    rating: null,
    published: true,
  },
  {
    slug: '002',
    number: '#002',
    date: 'August 2025',
    title: 'THE YOUTUBE ALGORITHM — A COMPLETE INVESTIGATION',
    subtitle: 'We broke it down so you don\'t have to.',
    coverColor: '#00f0ff',
    tag: 'INVESTIGATION',
    rating: null,
    published: false,
  },
];
```

---

## 6. PAGE SPECIFICATIONS

### 6.1 BaseLayout.astro

- `<html lang="en">` with `class="crt"` on body for scanline effect
- Import Google Fonts: `Press Start 2P` + `Share Tech Mono` in `<head>`
- Import all CSS files
- Render `<Nav />` at top
- `<slot />` for page content
- Render `<Footer />` at bottom
- Meta tags: title, description, og:image (use green pixel placeholder)

### 6.2 Nav.astro

```
[CTRL+WATCH]     HOME    ARCHIVE    ABOUT    [INSERT COIN ▶]
```

- `CTRL+WATCH` logo in `Press Start 2P`, color `var(--green)`, glow effect
- Nav links in `Share Tech Mono`, uppercase
- Active page link highlighted in `var(--yellow)`
- `[INSERT COIN ▶]` is a button linking to `#subscribe` (placeholder)
- On mobile: collapse to hamburger (`☰`) — clicking reveals full-screen overlay nav
- Sticky top, `background: rgba(8,8,8,0.95)`, `backdrop-filter: blur(4px)`
- Bottom border: `1px solid var(--border)`

### 6.3 Footer.astro

```
[YOB PIXEL ART]   CTRL+WATCH
                  Your algorithm is broken. We're the fix.
                  © 2025 CTRL+WATCH — All issues are independent publications.
                  
[HOME] [ARCHIVE] [ABOUT] [RSS]          ctrlwatch.com
```

- Yob: draw as a simple CSS/ASCII pixel blob in green — use a `<pre>` block with green color:
```
  ▄▄▄
 █o o█
 █ ▄ █
  ▀▀▀
```
- Two-column layout on desktop, stacked on mobile
- RSS link opens `/rss.xml`

### 6.4 Homepage — `index.astro`

Build in these exact sections, top to bottom:

**SECTION A — BOOT SEQUENCE (above the fold)**
```
CTRL+WATCH MAGAZINE OS v1.0
LOADING ISSUE DATABASE...   [████████████] 100%
CALIBRATING OPINION ENGINE... OK
DISABLING ALGORITHM...      OK

> WELCOME TO CTRL+WATCH_
```
- Pure CSS animation: text appears line by line with `animation-delay`
- Cursor blink on last line
- Auto-fades after 3 seconds, OR user can click to skip
- Background: pure black with green text — full viewport height on first load
- After fade: page scrolls into the hero section

**SECTION B — HERO / LATEST ISSUE COVER**

Layout (two-column on desktop, stacked on mobile):
```
LEFT COLUMN                          RIGHT COLUMN
─────────────────                    ─────────────────
[CTRL+WATCH]                         ┌─────────────────┐
ISSUE #001                           │                 │
JULY 2025                            │  COVER IMAGE    │
                                     │  PLACEHOLDER    │
THE 50 GREATEST                      │  (green border, │
YOUTUBE CHANNELS                     │   aspect 3:4)   │
                                     │                 │
"The definitive ranking.             └─────────────────┘
Your algorithm hates                 
us for this."

[READ ISSUE #001 ▶]  [VIEW ARCHIVE]
```

- Left column: all text. `Press Start 2P` for numbers/labels, `Share Tech Mono` for subtitles
- Cover placeholder: `border: 3px solid var(--green)` with `box-shadow: var(--glow-green)`, containing large `#001` in center
- `READ ISSUE` button: primary `.btn` style
- `VIEW ARCHIVE`: ghost link styled in cyan

**SECTION C — TICKER TAPE**
```
▶ CTRL+WATCH #001 NOW AVAILABLE ◀ THE 50 GREATEST CHANNELS ◀ YOUR ALGORITHM IS BROKEN ◀ WE'RE THE FIX ◀ [REPEATING]
```
- Infinite horizontal scroll animation (CSS `@keyframes marquee`)
- Dark background, yellow text, `Press Start 2P` 9px
- `overflow: hidden`, single line

**SECTION D — "WHAT IS CTRL+WATCH" PITCH BLOCK**

Three-column grid (stacks to single column on mobile):
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  [★] RATINGS    │  │  [⚔] BOSS FIGHT │  │  [👾] TIME      │
│                 │  │                 │  │  CAPSULE        │
│  Every channel  │  │  Head-to-head   │  │  Fictional      │
│  scored out     │  │  battles        │  │  interviews     │
│  of 100.        │  │  between        │  │  with legends   │
│  No mercy.      │  │  creators.      │  │  who never      │
│                 │  │                 │  │  saw YouTube.   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```
- Each card: `.card` class, icon in `var(--yellow)`, title in `Press Start 2P` 10px, body in `Share Tech Mono`
- On hover: border glows green

**SECTION E — LATEST FROM THE ARCHIVE (show 2 most recent issues)**
- Section header: `▶ LATEST ISSUES` in `Press Start 2P`, underlined with green
- Two `.IssueCard` components side by side (single column mobile)
- Below: `[VIEW ALL ISSUES ▶]` button

**SECTION F — MANIFESTO PULL QUOTE**
```
"There was a time when someone else decided what you watched.
CTRL+WATCH exists because YouTube deserves what gaming had
in the 80s and 90s: a magazine that is loud, opinionated,
and unafraid to put a number on things."
```
- Full-width dark block, centered text
- Large quote marks `"` in `var(--green)` behind text
- `Share Tech Mono` body, `Press Start 2P` for attribution line `— CTRL+WATCH, ISSUE #001`

**SECTION G — FOOTER** (rendered by `<Footer />`)

---

### 6.5 Archive Page — `archive.astro`

```
▶ THE ARCHIVE
ALL ISSUES — #001 TO PRESENT

[ISSUE CARD GRID — 3 COLUMNS DESKTOP / 2 TABLET / 1 MOBILE]
```

**IssueCard.astro props:**
```typescript
{
  slug: string,
  number: string,
  date: string,
  title: string,
  subtitle: string,
  coverColor: string,
  tag: string,
  published: boolean
}
```

**IssueCard layout:**
```
┌──────────────────────┐
│                      │
│     ISSUE COVER      │  ← aspect-ratio: 3/4, border color = coverColor
│   (color block with  │    published=false shows "COMING SOON" overlay
│    issue number)     │
│                      │
├──────────────────────┤
│ [TAG]         [DATE] │
│ ISSUE TITLE          │
│ Subtitle here...     │
│ [READ NOW ▶]         │
└──────────────────────┘
```

- If `published: false` → overlay with `COMING SOON` + dashed border
- Clicking card goes to `/issues/[slug]/`
- Animate cards in with `animation-delay` stagger on page load

---

### 6.6 About Page — `about.astro`

Single column, editorial layout:

**Content sections:**
1. Large header: `ABOUT CTRL+WATCH`
2. Pull the full manifesto text (use this verbatim):
```
There was a time when someone else decided what you watched.
Three networks. A handful of music channels. If you were lucky,
a magazine told you what was worth your time — and you trusted it,
because the people writing it cared more about the thing than
the business of the thing.

YouTube killed the gatekeeper and replaced it with an algorithm.
And the algorithm doesn't care if something is good.
It cares if something is sticky.

CTRL+WATCH exists because we think YouTube deserves what gaming
had in the 80s and 90s: a magazine that is loud, opinionated,
and unafraid to put a number on things. A magazine that will tell
you Dan Carlin's Hardcore History is a 96/100 and explain exactly why.
A magazine that will find the channel with 3,000 subscribers that's
making better content than creators with 30 million.

Your algorithm is broken. We're the fix.

Welcome to CTRL+WATCH. Press start.

— The Editor
```
3. Section: `HOW WE SCORE` — explain the 0–100 scoring system in a styled table
4. Section: `MEET YOB` — mascot section with ASCII art and backstory ("Yob was born inside a dead pixel...")
5. `[READ ISSUE #001 ▶]` CTA at bottom

---

### 6.7 RSS Feed — `src/pages/rss.xml.js`

```javascript
import rss from '@astrojs/rss';
import { issues } from '../data/issues.js';

export async function GET(context) {
  return rss({
    title: 'CTRL+WATCH Magazine',
    description: 'Your algorithm is broken. We\'re the fix.',
    site: context.site,
    items: issues
      .filter(i => i.published)
      .map(issue => ({
        title: `${issue.number} — ${issue.title}`,
        pubDate: new Date(issue.date),
        description: issue.subtitle,
        link: `/issues/${issue.slug}/`,
      })),
  });
}
```

---

## 7. CONFIG FILES

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ctrlwatch.com',
  integrations: [sitemap()],
});
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/issues/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

### robots.txt (in /public/)
```
User-agent: *
Allow: /
Sitemap: https://ctrlwatch.com/sitemap-index.xml
```

---

## 8. MOBILE RESPONSIVENESS RULES

Apply these breakpoints globally:

```css
/* Tablet */
@media (max-width: 1024px) {
  /* 3-col grids → 2-col */
}

/* Mobile */
@media (max-width: 768px) {
  /* 2-col grids → 1-col */
  /* Hero: stack to single column */
  /* Nav: hamburger mode */
  /* Press Start 2P sizes: reduce by ~25% */
  /* Disable boot sequence on very small screens (< 375px) */
}

/* Small mobile */
@media (max-width: 375px) {
  /* Minimum font size: 8px for Press Start 2P */
  /* All padding: reduce to var(--space-sm) */
}
```

Key rules:
- Never use `px` for font sizes on headings — always `clamp()` or `var(--text-*)` tokens
- Tap targets minimum 44x44px on mobile
- No horizontal scroll at any breakpoint
- Issue covers maintain `aspect-ratio: 3/4` at all sizes

---

## 9. PERFORMANCE TARGETS

- Lighthouse Performance score: >90 on mobile
- No layout shift (CLS = 0) — reserve space for fonts with `font-display: swap`
- Fonts preloaded in `<head>`: `<link rel="preload">` for both Google Fonts
- All CSS inlined in `<head>` for critical path (Astro handles this automatically)

---

## 10. VERIFICATION CHECKLIST

After building, confirm:
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without errors
- [ ] Homepage loads at `localhost:4321`
- [ ] Archive page loads with both issue cards
- [ ] `/issues/001/` loads the placeholder
- [ ] `/about` loads with manifesto
- [ ] `/rss.xml` returns valid XML
- [ ] Nav works on all pages
- [ ] No horizontal scroll on mobile (test at 375px viewport)
- [ ] CRT scanline effect visible on homepage
- [ ] Boot sequence animates then fades

---

## 11. AFTER SCAFFOLD — NEXT COMMANDS TO RUN

Once Claude Code finishes, run these follow-up commands in sequence:

```bash
# 1. Verify build
npm run build

# 2. Preview production build
npm run preview

# 3. Initialize git
git init
git add .
git commit -m "feat: initial CTRL+WATCH site scaffold"

# 4. Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ctrlwatch-site.git
git push -u origin main
```

Then connect the GitHub repo to Netlify via netlify.com dashboard (takes 2 minutes).

---

*BRIEF.md — CTRL+WATCH Site | Version 1.0*
*Feed this entire file to Claude Code and say: "Build everything in this brief. Don't ask for confirmation on individual files."*
