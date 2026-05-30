# Search Console — Indexing Priority List

Generated 2026-05-30. Property: `https://ctrl-watch.xyz/` (URL-prefix, HTML-tag verified).

## Why this list

We just went from a handful of canonical pages to ~120. A young domain gets
crawl-rationed ("Discovered – currently not indexed"), so we accelerate the
**highest-leverage** URLs by hand via **URL Inspection → Request Indexing**.

Realities to work with:
- **Request Indexing is rate-limited** to roughly **~10 URLs per property per day.**
  Hence the daily batches below — work top-down, one batch/day.
- **Inspect before requesting.** If a URL already shows "URL is on Google", skip
  it — re-requesting does nothing. Spend the daily quota on not-yet-indexed URLs.
- **The sitemap does the bulk discovery.** Manual requests only *accelerate* the
  priority pages. Do the one-time sitemap step first (below).
- Requesting a **hub** page helps Google discover its children (hubs link to all
  reviews/vs/concepts), so hubs are front-loaded.

Sitemap status (verified): **124 URLs** — 82 reviews + hub, 14 boss fights + hub,
5 concepts + hub, 14 issues, /top50/, /creators/, /archive/, /about/, home. Clean.

## Step 0 — one-time (do today, before the batches)

1. Search Console → **Sitemaps** → confirm `sitemap-index.xml` is submitted and
   "Success". If not, submit `https://ctrl-watch.xyz/sitemap-index.xml`.
2. Then start Batch 1.

---

## Batch 1 (Day 1) — Pillars + the AEO moat  ★ highest leverage

Hubs (distribute crawl to every child) + the concept pages (the definitions we
want AI engines to cite — the single most defensible asset class we have).

```
https://ctrl-watch.xyz/
https://ctrl-watch.xyz/top50/
https://ctrl-watch.xyz/reviews/
https://ctrl-watch.xyz/vs/
https://ctrl-watch.xyz/concepts/
https://ctrl-watch.xyz/concepts/collision-channels/
https://ctrl-watch.xyz/concepts/type-8-wrapped-confession/
https://ctrl-watch.xyz/concepts/the-comedy-tax/
https://ctrl-watch.xyz/concepts/scoring-rubric/
https://ctrl-watch.xyz/concepts/hidden-levels/
```

## Batch 2 (Day 2) — Flagship ESSENTIAL reviews (90+)

Strongest "[channel] review" long-tail targets; `Review`+`aggregateRating`
schema makes these rich-result candidates.

```
https://ctrl-watch.xyz/reviews/3blue1brown/
https://ctrl-watch.xyz/reviews/kurzgesagt/
https://ctrl-watch.xyz/reviews/every-frame-a-painting/
https://ctrl-watch.xyz/reviews/adam-neely/
https://ctrl-watch.xyz/reviews/cgp-grey/
https://ctrl-watch.xyz/reviews/jacob-geller/
https://ctrl-watch.xyz/reviews/jenny-nicholson/
https://ctrl-watch.xyz/reviews/lemmino/
https://ctrl-watch.xyz/reviews/primitive-technology/
https://ctrl-watch.xyz/reviews/dan-carlin-s-hardcore-history/
```

## Batch 3 (Day 3) — Boss Fights (top "X vs Y" matchups)

Comparison queries: high intent, weak SERP competition. These 10 pair two
well-known channels (best search demand).

```
https://ctrl-watch.xyz/vs/kurzgesagt-vs-ted-ed/
https://ctrl-watch.xyz/vs/internet-historian-vs-lemmino/
https://ctrl-watch.xyz/vs/contrapoints-vs-philosophy-tube/
https://ctrl-watch.xyz/vs/danny-gonzalez-vs-drew-gooden/
https://ctrl-watch.xyz/vs/veritasium-vs-vsauce/
https://ctrl-watch.xyz/vs/linus-tech-tips-vs-mkbhd/
https://ctrl-watch.xyz/vs/binging-with-babish-vs-joshua-weissman/
https://ctrl-watch.xyz/vs/12tone-vs-rick-beato/
https://ctrl-watch.xyz/vs/dan-carlin-vs-joe-rogan/
https://ctrl-watch.xyz/vs/techmoan-vs-technology-connections/
```

## Batch 4 (Day 4) — Remaining ESSENTIAL + top EXCELLENT (90–88)

```
https://ctrl-watch.xyz/reviews/fireship/
https://ctrl-watch.xyz/reviews/townsends/
https://ctrl-watch.xyz/reviews/mark-rober/
https://ctrl-watch.xyz/reviews/veritasium/
https://ctrl-watch.xyz/reviews/vsauce/
https://ctrl-watch.xyz/reviews/clickspring/
https://ctrl-watch.xyz/reviews/conan-o-brien-team-coco/
https://ctrl-watch.xyz/reviews/contrapoints/
https://ctrl-watch.xyz/reviews/corridor-crew/
https://ctrl-watch.xyz/reviews/technology-connections/
```

## Batch 5 (Day 5) — EXCELLENT (88–86)

```
https://ctrl-watch.xyz/reviews/exurb1a/
https://ctrl-watch.xyz/reviews/baumgartner-restoration/
https://ctrl-watch.xyz/reviews/caspian-report/
https://ctrl-watch.xyz/reviews/good-mythical-morning/
https://ctrl-watch.xyz/reviews/historia-civilis/
https://ctrl-watch.xyz/reviews/internet-historian/
https://ctrl-watch.xyz/reviews/theo-von/
https://ctrl-watch.xyz/reviews/12tone/
https://ctrl-watch.xyz/reviews/breaking-points/
https://ctrl-watch.xyz/reviews/drew-gooden/
```

## Batch 6 (Day 6) — EXCELLENT (86–85)

```
https://ctrl-watch.xyz/reviews/jcs-criminal-psychology/
https://ctrl-watch.xyz/reviews/like-stories-of-old/
https://ctrl-watch.xyz/reviews/nerdwriter1/
https://ctrl-watch.xyz/reviews/nilered/
https://ctrl-watch.xyz/reviews/scott-the-woz/
https://ctrl-watch.xyz/reviews/stuff-made-here/
https://ctrl-watch.xyz/reviews/tasting-history-with-max-miller/
https://ctrl-watch.xyz/reviews/binging-with-babish/
https://ctrl-watch.xyz/reviews/map-men-jay-and-mark/
https://ctrl-watch.xyz/reviews/philosophy-tube/
```

## Batch 7 (Day 7) — EXCELLENT (85–84)

```
https://ctrl-watch.xyz/reviews/real-engineering/
https://ctrl-watch.xyz/reviews/smarter-every-day/
https://ctrl-watch.xyz/reviews/tantacrul/
https://ctrl-watch.xyz/reviews/ted-ed/
https://ctrl-watch.xyz/reviews/the-slow-mo-guys/
https://ctrl-watch.xyz/reviews/abroad-in-japan/
https://ctrl-watch.xyz/reviews/danny-gonzalez/
https://ctrl-watch.xyz/reviews/legal-eagle/
https://ctrl-watch.xyz/reviews/philip-defranco/
https://ctrl-watch.xyz/reviews/ryan-george-pitch-meeting/
```

## Batch 8 (Day 8) — EXCELLENT (84–82)

```
https://ctrl-watch.xyz/reviews/sideways/
https://ctrl-watch.xyz/reviews/the-morphological-cinema/
https://ctrl-watch.xyz/reviews/videogamedunkey/
https://ctrl-watch.xyz/reviews/wendover-productions/
https://ctrl-watch.xyz/reviews/whang/
https://ctrl-watch.xyz/reviews/eddy-burback/
https://ctrl-watch.xyz/reviews/tldr-news/
https://ctrl-watch.xyz/reviews/mrbeast/
https://ctrl-watch.xyz/reviews/porta-dos-fundos/
https://ctrl-watch.xyz/reviews/rick-beato/
```

## Batch 9 (Day 9) — EXCELLENT/GOOD (82–76) + remaining Boss Fights

```
https://ctrl-watch.xyz/reviews/sam-o-nella-academy/
https://ctrl-watch.xyz/reviews/answer-in-progress/
https://ctrl-watch.xyz/reviews/forgotten-formats/
https://ctrl-watch.xyz/reviews/joshua-weissman/
https://ctrl-watch.xyz/reviews/luisito-comunica/
https://ctrl-watch.xyz/reviews/nexpo/
https://ctrl-watch.xyz/reviews/oversimplified/
https://ctrl-watch.xyz/vs/cinemastix-vs-every-frame-a-painting/
https://ctrl-watch.xyz/vs/company-man-vs-defunctland/
https://ctrl-watch.xyz/vs/oversimplified-vs-sam-onella-academy/
```

## Batch 10 (Day 10) — Issue pages (the magazine artifacts)

```
https://ctrl-watch.xyz/issues/014/
https://ctrl-watch.xyz/issues/012/
https://ctrl-watch.xyz/issues/013/
https://ctrl-watch.xyz/issues/001/
https://ctrl-watch.xyz/issues/011/
https://ctrl-watch.xyz/issues/010/
https://ctrl-watch.xyz/issues/007/
https://ctrl-watch.xyz/issues/009/
https://ctrl-watch.xyz/issues/004/
https://ctrl-watch.xyz/issues/006/
```

## Batch 11 (Day 11) — Remaining issues + lower/negative reviews

Negative reviews (GAME OVER / MEDIOCRE / AVERAGE) still rank for "[channel]
review" and are link-bait (contrarian takes), just lower strategic priority.

```
https://ctrl-watch.xyz/issues/002/
https://ctrl-watch.xyz/issues/003/
https://ctrl-watch.xyz/issues/005/
https://ctrl-watch.xyz/issues/008/
https://ctrl-watch.xyz/vs/forgotten-formats-vs-morphological-cinema/
https://ctrl-watch.xyz/reviews/some-more-news/
https://ctrl-watch.xyz/reviews/the-school-of-life/
https://ctrl-watch.xyz/reviews/johnny-harris/
https://ctrl-watch.xyz/reviews/prageru/
https://ctrl-watch.xyz/reviews/watchmojo/
```

## Batch 12 (Day 12) — Tail reviews + utility hubs

```
https://ctrl-watch.xyz/reviews/andrew-huberman/
https://ctrl-watch.xyz/reviews/caddicarus/
https://ctrl-watch.xyz/reviews/joe-rogan-experience/
https://ctrl-watch.xyz/reviews/hasanabi/
https://ctrl-watch.xyz/reviews/penguinz0-cr1tikal/
https://ctrl-watch.xyz/reviews/davie504/
https://ctrl-watch.xyz/reviews/nas-daily/
https://ctrl-watch.xyz/reviews/react-media-fbe/
https://ctrl-watch.xyz/reviews/ryan-s-world/
https://ctrl-watch.xyz/reviews/bright-side/
```

Utility hubs (any leftover quota — already linked from nav, so low urgency):

```
https://ctrl-watch.xyz/creators/
https://ctrl-watch.xyz/archive/
https://ctrl-watch.xyz/about/
```

---

## After ~2 weeks — measure (this is the scoreboard)

1. **Coverage / Pages** report → watch the **Indexed** count climb toward ~120.
   Anything stuck in "Discovered – currently not indexed" after a request usually
   means crawl budget — earning a couple of external links is the unlock.
2. **Performance** report → filter queries containing `review`, `vs`, and the
   concept terms ("collision", "comedy tax"). Rising **impressions** = the cluster
   is being surfaced even before clicks arrive.
3. **AEO check (manual):** ask Perplexity / ChatGPT Search / Google AI Overviews
   "what is the Collision (Type 7) channel framework" and "what is the Comedy Tax"
   — see whether CTRL+WATCH is cited as the source. That's the moat paying off.
4. Cross-reference **GoatCounter** (https://ctrlwatch.goatcounter.com) for which
   `/reviews/` and `/vs/` URLs are actually getting hits.

## Notes

- Don't re-request an already-indexed URL — no benefit, wastes the daily quota.
- The 13 deferred channels (no magazine score → no /reviews/ page) are correctly
  absent from this list; they're not yet pages.
- This list is regenerable from `src/data/creators.json` + the content
  collections any time coverage grows.
