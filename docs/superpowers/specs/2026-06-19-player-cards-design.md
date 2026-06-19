# CTRL+WATCH Player Cards — Design Spec

**Date:** 2026-06-19
**Status:** Approved design, pre-implementation
**Scope:** Concept **A** only (collectible Player Cards). Concept **D** (painted issue covers) is a separate spec. Concept B (Boss Fight VS-screens) is explicitly out of scope.

---

## 1. Summary

A **Player Card** is a collectible, retro trading-card rendering of a channel's Player Profile review. It is generated entirely from data already present in each `src/content/reviews/*.md` frontmatter — no new editorial data. Each card carries the channel name, a procedural pixel **category emblem**, the five-axis scores as stat bars, the overall score, and a **verdict-tier "rarity" treatment** (holo → gold → silver → bronze → matte → cracked).

Cards appear three ways:
1. Live (HTML/CSS/SVG) as the hero of each `/reviews/[slug]/` page.
2. As that page's OpenGraph/Twitter share image (a committed PNG).
3. In a new `/cards/` gallery ("The Card Binder") — a filterable grid and internal-link hub.

This is the visual identity upgrade the magazine has been missing, built the way the covers already are: deterministic, generator-driven, committed PNGs, zero per-asset cost, zero likeness risk.

---

## 2. Goals & non-goals

**Goals**
- Turn all 87 existing review pages (and every future one) into shareable, visually distinctive artifacts in one pass.
- Compound the AEO/SEO moat: richer OG imagery, a new canonical `/cards/` collection asset, dense internal linking to `/reviews/`.
- Reader delight & stickiness via a legible "collect them all" rarity system.
- 100% deterministic and automatable — no external AI, no manual art per creator.

**Non-goals (YAGNI)**
- No AI-generated or photographic portraits (the procedural emblem decision removes likeness risk).
- No animated/true-holographic cards. Static PNG for sharing; on-page may carry a subtle CSS sheen, but motion is out of scope.
- No physical/print cards, no per-card standalone route (the `/reviews/[slug]/` page *is* the card's page).
- No Boss Fight VS-screens (concept B) and no painted covers (concept D) here.

---

## 3. Strategic rationale (which lenses it serves)

| Lens | How |
|---|---|
| Deepen AEO/SEO moat | New `/cards/` `CollectionPage`/`ItemList` asset; per-review OG images; internal links to all reviews. |
| Reader delight & stickiness | Rarity ladder + "collect them all" gallery; ESSENTIAL feels earned. |
| Distribution & shareability | Every `/reviews/` page gets a purpose-built share card; per-card download button. |
| Polish what exists | Upgrades the review page hero and the social presence of 87 existing pages at once. |

---

## 4. Visual design (locked)

### 4.1 House style
Pixel / 8–16-bit. Sprite-grid emblems, chunky stat bars, neon-on-dark per the existing design tokens (bg `#0A0A12`; accents cyan `#00F0FF`, magenta `#FF00AA`, yellow `#FFE600`, green `#39FF14`, orange `#FF6B00`, plus the red `#FF2244` already used by issues). Fonts: **Press Start 2P** (tier ribbon, section labels) and **Share Tech Mono** (channel name, numbers) — both already cached in `scripts/fonts/`. No new fonts.

### 4.2 Card anatomy (top → bottom)
1. **Meta row** — `Nº 003/087` (collectible number) · category label.
2. **Channel name.**
3. **Emblem panel** — the procedural pixel category motif on a category palette.
4. **Verdict ribbon** — the rarity treatment's signature element.
5. **Stat bars** — five rows: Content, Consistency, Replay, Community, X-Factor, each a bar + numeric value.
6. **Overall** — large number + the word `OVERALL`.
7. **Footer** — `CTRL+WATCH · FIRST REVIEWED #NNN`.

Portrait trading-card proportions, 5:7. Standalone PNG: **744×1040**.

### 4.3 Rarity ladder (verdict band → card material)
| Verdict | Band | Material | Frame | Overall color |
|---|---|---|---|---|
| ESSENTIAL | 90–100 | **Holo foil** | rainbow gradient border + diagonal sheen + glow | green `#39FF14` |
| EXCELLENT | 80–89 | **Gold** | gold gradient border + soft glow | gold `#FF9E00` |
| GOOD | 70–79 | **Silver/chrome** | silver gradient border + faint glow | `#CDD2DE` |
| AVERAGE | 60–69 | **Bronze** | bronze gradient border + faint glow | `#D89A5A` |
| MEDIOCRE | 50–59 | **Matte** | flat `#34343F` border, no glow | `#8A8A98` |
| GAME OVER | <50 | **Cracked** | red border, red fracture overlay, desaturated emblem | red `#FF2244` |

The rarity material governs the **frame, ribbon, and overall-number color**. The **emblem keeps its category palette**, so a card encodes two signals at once: category (emblem) and quality (material). A low score therefore looks *intentionally* unglamorous, never broken.

### 4.4 Emblem system
Emblems are **data, not asset files**: each motif is a small (12×12) matrix of palette indices defined in code, rendered as a div-grid in the PNG generator (satori-safe) and as inline SVG `<rect>`s on-page. One definition, two renderers.

---

## 5. Data model & resolution rules

### 5.1 Inputs (existing review frontmatter — no additions)
`channel`, `genre`, `axes{contentQuality, consistency, replayValue, community, xFactor}`, `overall`, `verdict`, `originatingIssue`. Slug = filename. `draft: true` reviews are skipped.

### 5.2 `genre` → category
`genre` is free text and often compound (`"Science / Animation"`, `"Video Games × Philosophy × Art"`). Rule: split on `/` and `×`, take the **first token**, trim/lowercase, look up in a controlled vocabulary. Unmatched → **fallback** category. Unmatched genres are **logged loudly** (mirroring `build-creators.mjs`) so the vocabulary can be extended deliberately.

### 5.3 Category → {motif, accent}
Grouping is by category; accent is a family signal (reused across related categories — the motif provides fine distinction). Representative map (full table lives in `card-data.ts`):

| Category | Example genre tokens | Accent | Motif |
|---|---|---|---|
| Science | Science, Science/Health | cyan | atom |
| Technology | Technology, Programming | cyan | chip |
| Education/Explainer | Education, News/Explainer | green | open book |
| Cooking | Cooking, Recipe | orange | chef hat |
| Comedy | Comedy, Sketch Comedy | yellow | mask |
| Music | Music Theory, Music Analysis | magenta | note |
| Gaming | Video Games, Retro Gaming | green | controller |
| History | History | orange | column |
| Philosophy | Philosophy, Existential | green | spiral |
| Politics | Political *, Propaganda | red | podium |
| News/Commentary | News, Commentary | red | speech bubble |
| Film/VFX | VFX/Filmmaking | magenta | clapperboard |
| Video Essay | Video Essay, Personal Essay | cyan | play/film |
| True Crime | True Crime/Analysis | grey-blue | magnifier |
| Travel | Travel, Culture | cyan | globe |
| Podcast | Podcast, Long-Form | magenta | mic |
| Underground/Experimental | Underground, Experimental Film, Media Archaeology | yellow | cassette |
| Engineering/Restoration | Engineering, Restoration | orange | gear |
| **Fallback** | (anything unmatched) | grey | ▶ play |

### 5.4 `verdict` → rarity
Direct map per §4.3. `verdict` is already validated against the score band by the content-collection schema, so rarity is always consistent with `overall`.

### 5.5 Card number
`Nº NNN/TOTAL`, where rank = position when reviews are sorted by `overall` **descending** (ties broken by slug ascending), zero-padded to 3; `TOTAL` = count of non-draft reviews. Recomputed every generation, so it reads as a live leaderboard position. *(Decision: rank-by-overall, per approval. Alternative considered: stable alphabetical index — rejected for being less evocative.)*

---

## 6. Architecture & components

Single source of truth shared by the PNG generator (Node) and the Astro site:

| File | Responsibility |
|---|---|
| `src/lib/card-data.ts` | The maps: genre→category, category→{motif, accent}, verdict→rarity; the emblem matrices; helper `resolveCard(frontmatter) → {category, motif, accent, rarity, ...}`. Pure, dependency-free, importable from both Astro and the generator. |
| `scripts/generate-cards.mjs` | Reads `src/content/reviews/*.md` frontmatter, computes ranks, renders each card with satori → sharp. Writes `public/cards/[slug].png` (744×1040) and `public/cards/[slug]-og.png` (1200×630). Idempotent; logs unmatched genres. |
| `src/components/PlayerCard.astro` | Live on-page card from review frontmatter + `card-data`. Inline SVG emblem; CSS rarity treatments (real `border-image`, `mix-blend` sheen). Accessible (real text, `alt`/`aria`). |
| `src/pages/cards/index.astro` | The Card Binder gallery: grid of all cards, filter by tier and category, per-card download; emits `CollectionPage` + `ItemList` JSON-LD via the BaseLayout head slot. |
| `src/pages/reviews/[slug].astro` | Integrate `PlayerCard` as the hero; set the page OG/Twitter image to `/cards/[slug]-og.png` via BaseLayout's existing OG-image mechanism. |

`PlayerCard` (compact collectible) and the existing `ReviewCard` (full scorecard) coexist: the card is the hero, the scorecard stays in the body.

### 6.1 Outputs
- `public/cards/[slug].png` — 744×1040 portrait card.
- `public/cards/[slug]-og.png` — 1200×630 social card: the card art on a themed background with name/overall/verdict and the wordmark.
- PNGs are **committed**; never generated at Netlify build time (same rule as `public/covers/`).

---

## 7. Generation pipeline & build integration

- Add npm script: `"cards": "node scripts/generate-cards.mjs"`.
- Parse frontmatter with `gray-matter` (add to devDependencies; mirrors Astro's own parser so the generator and the site read identical data).
- **Pipeline order** (CLAUDE.md "Adding a new issue") — insert `npm run cards` immediately after `npm run covers`:
  `issues.js → covers → cards → inject:og → inject:seo → inject:top50link → inject:reviewlinks → inject:vslinks → inject:shell → tracker → build:creators → build:search → commit`.
- Re-run `npm run cards` whenever a review `.md` is added or re-scored (rank numbers shift).
- Sitemap: add `/cards/` to `customPages` (the sitemap already reads content dirs at config time).

---

## 8. SEO/AEO

- `/cards/` emits `CollectionPage` with an `ItemList` of all cards (position + name + `/reviews/` URL), validated at validator.schema.org before publish.
- Per-review OG images raise click-through and make the cards the unit that travels on social.
- The gallery is a dense internal-link hub to every `/reviews/` page, strengthening the review cluster.
- No change to existing review `Review`/`aggregateRating` JSON-LD; cards are presentational over the same data.

---

## 9. Rendering notes (satori constraints)

satori supports a subset of CSS. The generator must therefore:
- Build emblems and stat bars from **fixed-size `<div>`s and flexbox**, not arbitrary SVG.
- Emulate gradient borders with an **outer gradient container + inset inner panel** (satori has weak `border-image` support), while the on-page component uses real `border-image`.
- Approximate the holo **sheen** with a low-opacity diagonal gradient overlay (no `mix-blend-mode` in satori); the on-page card uses `mix-blend-mode: screen` for a richer effect.
- Cracked-tier fractures: thin rotated `<div>`s in the PNG; same technique on-page.

These intentional PNG-vs-onpage differences are acceptable: the PNG is the share/gallery artifact, the on-page card is the crisp interactive hero.

---

## 10. Edge cases

- **Unmatched genre** → fallback motif + grey accent, and a loud console warning listing the slug+genre.
- **Draft reviews** (`draft: true`) → skipped; excluded from `TOTAL` and ranking.
- **Score ties** → broken by slug ascending for stable numbering.
- **Very long channel names** → name auto-shrinks one step / truncates with ellipsis at a defined max.
- **New review added** → re-running `cards` reflows all `Nº` numbers (expected; PNGs re-committed).
- **History/re-evaluation** → the card always renders the current `overall`/`verdict`; score history is not shown on the card (it stays on the review page).

---

## 11. Testing & verification

- Generate all cards; produce a **contact sheet** (montage) and eyeball every tier/category for legibility.
- Assert each card's rarity matches its verdict band (schema already guarantees verdict↔overall).
- Confirm output dimensions (744×1040 and 1200×630) and that every non-draft review produced both PNGs.
- Validate `/cards/` JSON-LD at validator.schema.org.
- Confirm zero genres fell through to fallback unintentionally (review the warning log).
- Spot-check the `/reviews/[slug]/` OG tag resolves to the new image.

---

## 12. Rollout checklist

1. `src/lib/card-data.ts` — maps + emblem matrices + `resolveCard`.
2. `scripts/generate-cards.mjs` + `cards` npm script + `gray-matter` dep.
3. `src/components/PlayerCard.astro`.
4. Integrate hero + OG into `src/pages/reviews/[slug].astro`.
5. `src/pages/cards/index.astro` (Card Binder) + sitemap `customPages` entry + Nav link ("CARDS").
6. Generate + commit `public/cards/*.png`.
7. Update CLAUDE.md: add `cards` to the build pipeline order and document the generator (mirroring the covers entry).
8. Verify per §11.

---

## 13. Resolved decisions

- Portrait fill: **procedural category emblem** (no face, no AI, no likeness risk).
- Palette: **category-driven** (cards group by category in the gallery).
- Card number: **rank by overall**, recomputed each generation.
- `/cards/` gallery: **in scope** for this spec.
- House style: **pixel**; rarity = precious-metal ladder + cracked floor.

---

## 14. Out of scope (tracked elsewhere)

- **Concept D — painted issue covers**: separate spec, separate (AI-image) pipeline.
- **Concept B — Boss Fight VS-screens**: could later reuse this generator + emblem assets; not designed here.
- Card animation, physical printing, community card voting.
