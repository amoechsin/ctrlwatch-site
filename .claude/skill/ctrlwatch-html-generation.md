---
name: ctrlwatch-html-generation
description: "Generates complete, publication-ready HTML files for CTRL+WATCH magazine issues. Use this skill whenever generating, styling, or structuring a CTRL+WATCH HTML output - including full issues, individual section renders, or any time CRT retro styling is needed. Must be read before writing any CTRL+WATCH HTML. Covers the complete design system: color palette, typography, tab navigation, CRT effects, scoring cards, Top 50 table, section order, and file verification. If the user says anything about generating a CTRL+WATCH issue, creating the HTML, or outputting a new issue file, read this skill first."
---

# CTRL+WATCH HTML Generation Skill

## Workflow

1. Read the continuity tracker from `.claude/tracker.md` before writing any HTML
2. Read this skill fully before writing any HTML
3. Generate the complete HTML as a single self-contained file
4. Write output to `public/issues/[NNN]/index.html`
5. Verify file size with `wc -c` — target 160–175KB, minimum 140KB
6. Report file size to user

---

## File Naming Convention

```
CTRLWATCH_Issue0XX_ThemeName.html
```
Examples: `CTRLWATCH_Issue013_TheGlobalIssue.html`

---

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CTRL+WATCH — Issue #0XX — THE [THEME] ISSUE</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Press+Start+2P&family=VT323&family=Exo+2:wght@300;400;600;700&family=Russo+One&display=swap" rel="stylesheet">
  <style>/* All CSS inline — no external stylesheets */</style>
</head>
<body>
  <!-- CRT overlay -->
  <!-- Header -->
  <!-- Tab navigation -->
  <!-- Section panels -->
  <!-- Footer -->
  <script>/* Tab switching JS inline */</script>
</body>
</html>
```

**Critical:** Single self-contained file. No external CSS. No external JS. Google Fonts CDN is the only external dependency permitted.

---

## Color System

```css
:root {
  --bg-primary:    #0A0A12;   /* Near-black — page background */
  --bg-secondary:  #0F0F1A;   /* Slightly lighter — section backgrounds */
  --bg-card:       #12121E;   /* Card/panel background */
  --bg-header:     #08080F;   /* Header strip */

  --cyan:          #00F0FF;   /* Primary neon — headlines, active tabs */
  --magenta:       #FF00AA;   /* Secondary — score accents, alerts */
  --yellow:        #FFE600;   /* Tertiary — ESSENTIAL verdict, stars */
  --green:         #39FF14;   /* Positive — score bars, EXCELLENT */
  --orange:        #FF6B00;   /* Warning — MEDIOCRE, notable moves */
  --red:           #FF2244;   /* Danger — GAME OVER verdict */

  --text-primary:  #E0E0E8;   /* Body text */
  --text-secondary:#9090A0;   /* Secondary/metadata text */
  --text-dim:      #505060;   /* Decorative, disabled */

  --border-color:  #1E1E30;   /* Panel borders */
  --glow-cyan:     0 0 10px #00F0FF, 0 0 20px rgba(0,240,255,0.3);
  --glow-magenta:  0 0 10px #FF00AA, 0 0 20px rgba(255,0,170,0.3);
  --glow-yellow:   0 0 10px #FFE600, 0 0 20px rgba(255,230,0,0.3);
}
```

---

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Magazine masthead | `Orbitron` | 900 |
| Section headings | `Orbitron` | 700 |
| Subheadings | `Orbitron` | 400 |
| Tab labels | `Press Start 2P` | 400 |
| Body copy | `Exo 2` | 400 |
| Pull quotes | `Russo One` | 400 |
| Scores / verdicts / data | `VT323` | 400 |
| Metadata / tags | `Exo 2` | 300, uppercase, tracked |

**VT323 sizing:** Always use at least 24px. This font renders poorly small.

---

## CRT Overlay

Apply as a fixed pseudo-element over the entire page. Never omit.

```css
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

---

## Header

```
┌─────────────────────────────────────────────────────────────┐
│  [LEFT: issue number + price spoof]  CTRL+WATCH  [RIGHT: date + "EST. 2023"] │
│  ░░░░ THE [THEME] ISSUE ░░░░                                │
└─────────────────────────────────────────────────────────────┘
```

- Masthead `CTRL+WATCH` in Orbitron 900, cyan glow
- Theme subtitle in Press Start 2P, smaller
- Issue number: `ISSUE #0XX` in VT323
- Fake price: `£2.50 / $3.25` in text-secondary
- Horizontal pixel dividers above and below using border-image or repeating gradient

---

## Tab Navigation

Eleven tabs. Order is fixed:

| # | Tab Label | Section ID |
|---|-----------|------------|
| 1 | PRESS START | `press-start` |
| 2 | NOW LOADING | `now-loading` |
| 3 | TIME CAPSULE | `time-capsule` |
| 4 | PLAYER PROFILES | `player-profiles` |
| 5 | BOSS FIGHT | `boss-fight` |
| 6 | HIGH SCORES | `high-scores` |
| 7 | HIDDEN LEVELS | `hidden-levels` |
| 8 | CHEAT CODES | `cheat-codes` |
| 9 | GAME OVER | `game-over` |
| 10 | YOB'S SAVE POINT | `yobs-save-point` |
| 11 | RETRO ADS | `retro-ads` |

**Tab styling rules:**
- Font: `Press Start 2P`, 9–10px
- Active tab: `var(--cyan)` border-bottom, background slightly lighter, text cyan
- Inactive tab: `var(--text-dim)` text, no bottom border
- Hover: `var(--text-secondary)` text
- Tab bar: horizontal scroll on mobile, `overflow-x: auto`
- No rounded corners anywhere — angular only

**Tab switching JS pattern:**

```javascript
function showTab(tabId) {
  document.querySelectorAll('.section-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}
// Default: show press-start on load
document.addEventListener('DOMContentLoaded', () => showTab('press-start'));
```

---

## Scoring Card Component

Used in Player Profiles and Boss Fight.

```
┌─────────────────────────────────────────────────────┐
│  [CHANNEL NAME]                    [SCORE] / 100    │
│  ─────────────────────────────────────────────────  │
│  Content Quality    [██████████░░░░░]   88          │
│  Consistency        [████████░░░░░░░]   72          │
│  Replay Value       [█████████░░░░░░]   85          │
│  Community          [████████░░░░░░░]   76          │
│  X-Factor           [████████████░░]   94           │
│  ─────────────────────────────────────────────────  │
│  ░░░░░░░░░░ EXCELLENT ░░░░░░░░░░                    │
└─────────────────────────────────────────────────────┘
```

- Score bars: CSS width percentage, color-coded by score range
- Overall score in `VT323`, large (48–64px)
- Verdict in `Press Start 2P`, color by verdict tier (see below)
- Angular border, no border-radius

**Score bar colors:**
- 90–100: `var(--yellow)` with glow
- 80–89: `var(--green)`
- 70–79: `var(--cyan)`
- 60–69: `var(--text-secondary)` (grey)
- 50–59: `var(--orange)`
- Below 50: `var(--red)`

**Verdict colors:**
| Verdict | Color |
|---------|-------|
| ESSENTIAL | `var(--yellow)` + glow |
| EXCELLENT | `var(--green)` |
| GOOD | `var(--cyan)` |
| AVERAGE | `var(--text-secondary)` |
| MEDIOCRE | `var(--orange)` |
| GAME OVER | `var(--red)` + glow |

---

## Top 50 Table (HIGH SCORES section)

Full table. Every row. No truncating.

```css
.top50-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Exo 2', sans-serif;
}
.top50-table th {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--cyan);
  border-bottom: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
}
.top50-table td {
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}
```

**Column order:** Rank | Channel | Score | Genre | Movement

**Movement indicators:**
- `↑N` — green
- `↓N` — orange/red
- `—` — text-dim
- `NEW` — cyan, bold

Top 3 rows get special treatment: slightly brighter background, rank in larger VT323.

---

## Pull Quotes

```css
.pull-quote {
  font-family: 'Russo One', sans-serif;
  font-size: 1.4rem;
  color: var(--cyan);
  border-left: 4px solid var(--magenta);
  padding: 16px 24px;
  margin: 32px 0;
  background: rgba(0, 240, 255, 0.05);
  font-style: italic;
}
```

Used in Player Profiles, Boss Fight, Time Capsule, Press Start. Minimum one per reviewed channel.

---

## Retro Ad Layout

Three columns on desktop, single column on mobile. Each ad:

```
┌─────────────────────────────────────┐
│  ██ [PRODUCT NAME] ██               │
│  ─────────────────────────────────  │
│  Tagline in Press Start 2P          │
│  Body copy in Exo 2                 │
│  • Feature bullet                   │
│  • Feature bullet                   │
│  ─────────────────────────────────  │
│  ONLY £49.99  ☎ CALL NOW            │
│  *fine print disclaimer*            │
└─────────────────────────────────────┘
```

Border: 3px solid `var(--magenta)` with box-shadow glow. Background: dark with slight colour tint per ad.

---

## Pixel Dividers

Between major sections and sub-sections. Two styles:

**Heavy (between sections):**
```css
.pixel-divider {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--cyan) 0px, var(--cyan) 8px,
    transparent 8px, transparent 16px
  );
  margin: 40px 0;
}
```

**Light (within sections):**
```css
.pixel-divider-light {
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    var(--border-color) 0px, var(--border-color) 4px,
    transparent 4px, transparent 8px
  );
  margin: 24px 0;
}
```

---

## Yob Mascot

Rendered as inline SVG blob character in the Save Point section. Green (`var(--green)`), roughly 60x60px, positioned left of Yob's intro text. Simple blob shape — no complex paths needed.

```svg
<svg width="60" height="60" viewBox="0 0 60 60">
  <ellipse cx="30" cy="32" rx="22" ry="20" fill="#39FF14" opacity="0.9"/>
  <ellipse cx="30" cy="20" rx="18" ry="16" fill="#39FF14"/>
  <!-- eyes: two white circles with black pupils -->
  <circle cx="24" cy="19" r="4" fill="white"/>
  <circle cx="36" cy="19" r="4" fill="white"/>
  <circle cx="25" cy="20" r="2" fill="#0A0A12"/>
  <circle cx="37" cy="20" r="2" fill="#0A0A12"/>
  <!-- mouth: simple arc or line -->
  <path d="M 25 27 Q 30 31 35 27" stroke="#0A0A12" stroke-width="2" fill="none"/>
</svg>
```

---

## Letter Rating Stars (Yob's Save Point)

```css
.star-rating { color: var(--yellow); font-size: 1.2rem; }
.star-empty  { color: var(--text-dim); }
```

Stars displayed as ★★★☆☆ etc. followed by a verdict tag in magenta:
```html
<span class="verdict-tag">RUBBISH</span> / <span class="verdict-tag">DECENT</span> / etc.
```

---

## Section Minimum Lengths

| Section | Minimum |
|---------|---------|
| Press Start (editor's letter) | 500 words |
| Now Loading (per news item) | 120 words × 6 items |
| Time Capsule (per interview) | 8 exchanges, with stage directions |
| Player Profile (per review) | 700 words + scorecard |
| Boss Fight | 1,200 words + dual scorecard |
| High Scores | Full Top 50 table + editorial notes |
| Hidden Levels (per entry) | 250 words |
| Cheat Codes | 800 words |
| Game Over (per trend) | 180 words × 5 trends |
| Yob's Save Point | 6–8 letters with responses |
| Retro Ads | 3–5 ads, full copy |

**Total target:** 17,000–22,000 words. Never truncate a section to hit a length cap — expand other sections instead.

---

## Footer

```
CTRL+WATCH is a work of satirical fiction. All channel reviews represent editorial opinion only.
Time Capsule interviews are fictional. Historical figures did not participate.
© CTRL+WATCH [YEAR] — Issue #0XX
```

Font: `Exo 2`, 10px, `var(--text-dim)`. Centered. Full width.

---

## Quality Checks Before Output

- [ ] All eleven tabs present and switching correctly
- [ ] CRT overlay renders (body::before pseudo-element)
- [ ] No external stylesheets or JS (Google Fonts CDN excepted)
- [ ] Scoring cards use correct verdict color per score
- [ ] All Top 50 entries present with movement indicators
- [ ] Pull quotes in every Player Profile
- [ ] Time Capsule disclaimer present for every interview
- [ ] Yob SVG renders in Save Point
- [ ] File copied to `/mnt/user-data/outputs/`
- [ ] File size verified with `wc -c` and reported to user
