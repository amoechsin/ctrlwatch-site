# Scope — Canonical `/reviews/[slug]/` Player Profile pages

Status: **proposed** · Author: session 2026-05-30 · Depends on: `/top50/` (shipped)

## Goal

Stand up canonical Player Profile pages at `/reviews/[channel-slug]/` — the SEO
substrate named in CLAUDE.md. Each is an evergreen, citable review page with
`Review` + `aggregateRating` schema (5-axis), separate from the issue it first
appeared in. Once they exist, `/top50/` and every issue ItemList upgrade from
name-only to real `item.url` links, and the long-tail "[channel] review" cluster
becomes ownable.

## The core constraint (read this first)

A proper Player Profile per the `ctrlwatch-player-profile` skill is **700–1000
words of prose + a 5-axis scorecard whose values must match `aggregateRating`**.
That content does **not** exist in reusable structured form:

| Source | Has overall score | Has 5-axis | Has review prose | Coverage |
|---|---|---|---|---|
| `creators.json` | ✅ all 50 | ❌ | ❌ (only short `notes`) | 50 |
| Issue HTML — `score-card` markup | ✅ | ✅ | ✅ (mixed markup) | only #006, #012, #013, #014 |
| Issue HTML — clean `channel-name` + scorecard | ✅ | ✅ | ✅ | **~4** (#014's new reviews) |

**Conclusion:** there is no machine path to 50 complete pages. Auto-generating
thin pages from `creators.json` alone (score + verdict + genre + issue link) would
create ~50 near-duplicate doorway pages — exactly the thin-content pattern Google
demotes, and a direct violation of the skill's quality bar. **Rejected.**

This is a content-authoring effort. The build job is to create the *architecture*
so each authored review drops in cleanly and is schema-correct, then seed it and
fill in over time.

## Proposed architecture

1. **Data source — Astro Content Collection** `src/content/reviews/[slug].md`
   (Astro 5 content layer; we're on `astro@^5.3.0`).
   - `defineCollection` with a **zod schema that encodes the rubric**: `channel`,
     `slug`, `creator` (optional), `genre`, `axes: {contentQuality, consistency,
     replayValue, community, xFactor}` (each 0–100), `overall` (0–100), `verdict`
     (enum of the 6 tiers), `pullQuote`, `originatingIssue`, `related[]` (slugs),
     `reEval` history (optional), `updated` (date).
   - Schema validation = the rubric is enforced at build time. A verdict that
     doesn't match its score band, or an `overall` that contradicts the axes,
     fails the build. (Mirrors the inject:seo "reject rather than ship broken"
     philosophy, but at authoring time.)
   - Body of the `.md` file = the 700–1000-word review prose.
2. **Route** `src/pages/reviews/[slug].astro` — `getStaticPaths()` over the
   collection; renders scorecard (reuse the skill's `score-card` HTML/CSS),
   prose, pull quote, "first reviewed in #NNN" issue link, related-reviews links.
3. **Schema** via the `<slot name="head">` already added to `BaseLayout` for
   `/top50/`: `Review` + `aggregateRating` (ratingValue = overall, plus the 5
   axes) + `Person` (creator) + `creativeWorkReviewed` (channel as CreativeWork).
   Title `[Channel] Review — Score N/100 | CTRL+WATCH` (≤60); meta description in
   magazine voice; canonical auto-emitted by BaseLayout.
4. **Hub page** `/reviews/` (optional, Phase 2) — index of all profiles, or fold
   into the existing `/creators/` page by linking channel names to `/reviews/`
   when a profile exists.

## Integration points (after pages exist)

- **`/top50/`**: channel name → `/reviews/[slug]/` when a profile exists (slug is
  already in creators.json); ItemList gains `item.url`. ~2-line change, guarded by
  "profile exists?" so partial coverage degrades gracefully.
- **`inject-issue-seo.mjs`**: add `item.url` to per-issue ItemLists for channels
  with profiles.
- **New injector `inject-issue-reviewlinks`** (or extend top50link): issue Player
  Profile sections link OUT to the canonical `/reviews/` URL (CLAUDE.md canonical
  rule: issues link out, don't host the canonical).
- **`astro.config.mjs`**: `/reviews/` + each `/reviews/[slug]/` into sitemap
  `customPages` (or switch to letting the sitemap integration discover routes).
- **`build-search-index.mjs`**: add review pages to search.

## Approach options (pick scope/ambition)

- **A — Architecture + proof of concept (smallest).** Build the collection schema,
  route, schema-in-head, and author **2–3 flagship reviews** (e.g. 3Blue1Brown,
  Kurzgesagt). Wire `/top50/` item.url for those. Proves the pipeline; ~half a day.
- **B — Architecture + seed the clean batch (recommended).** A + migrate the
  channels that already have full scorecards + prose in #014 (~4) and hand-port
  the partial ones from #006/#012/#013. ~8–12 pages live. Establishes the pattern
  and a real internal-link footprint while keeping authoring honest.
- **C — Full 50.** B + author ~30–40 reviews from scratch to cover the whole Top
  50. Large, ongoing content effort — better run as editorial cadence (the writer
  agent emits a `/reviews/` `.md` for every new/re-eval review going forward) than
  as one build task.

**Recommendation: B**, then let C accrue naturally — every future Player Profile
the writer produces also lands a `src/content/reviews/*.md`, so coverage grows per
issue without a separate migration push.

## Open questions / risks

- **Re-eval & score history.** creators.json tracks `reEvaluations`; the collection
  schema should carry a score-history array so a profile shows trajectory (Adam
  Neely 84→91 etc.). Decide shape now to avoid a later migration.
- **Slug authority.** creators.json slugs are the source of truth; the collection
  filename must match exactly or `/top50/` links break. Add a build check.
- **`/reviews/` vs `/creators/` overlap.** `/creators/` is the filterable index;
  `/reviews/` are the deep pages. Keep `/creators/` as the hub, link into `/reviews/`.
- **CSS for the scorecard** on Astro pages — the skill's `score-card` markup is
  styled inside issue HTML, not in the Astro design system. Need to port those
  styles into `components.css` (or a `ReviewCard.astro` component).
- **No item.url until live.** Until a given channel has a page, ItemList stays
  name-only for it — never emit a link to a 404 (consistent with current injector).

## Effort estimate

- Architecture (schema + route + ReviewCard + head schema + sitemap/search wiring):
  ~half a session.
- Per authored review: editorial time (the writing is the cost, not the code).
- Option B total: ~1 session of build + N reviews of authoring.
