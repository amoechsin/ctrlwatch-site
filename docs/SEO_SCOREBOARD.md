# SEO Scoreboard — ctrl-watch.xyz

A weekly log of the few numbers that actually tell us whether the canonical
asset layer (91 reviews + 16 boss fights + 5 concepts + hubs, as of 2026-07-03)
is getting found, indexed, and surfaced. Companion to `SEARCH_CONSOLE_INDEXING.md`.
Note: the newest ~9 reviews and 2 boss fights postdate the indexing batch list
in that doc — add them to the request queue.

**Property:** Google Search Console — Domain property `ctrl-watch.xyz` (added 2026-06-06; primary, covers all subdomains + http/https) + legacy URL-prefix `https://ctrl-watch.xyz/` (kept for history; sitemap was submitted here).
**Analytics:** GoatCounter — https://ctrlwatch.goatcounter.com

---

## How to read this (the stages, in order)

Signal arrives in stages. Watch them in this sequence — each is a prerequisite
for the next. Don't expect clicks before impressions, or impressions before indexing.

1. **Discovered** (Sitemaps screen) → Google has *read the sitemap*. Fastest to move.
2. **Indexed** (Pages report) → Google *accepted* the page. It can now rank.
3. **Impressions** (Performance report) → Google is *showing* it in results. First demand signal.
4. **Clicks / Position** (Performance report) → people are arriving. The lagging metric.
5. **AI citations** (manual check) → the `/concepts/` moat paying off. No dashboard.

**Rule of thumb:** if Impressions are rising, it's working — even at zero clicks.
If nothing's Indexed weeks after it's Discovered, the bottleneck is crawl budget,
and the fix is **external links**, not more content.

## Where each number lives in GSC

| Metric | Path | Notes |
|---|---|---|
| Discovered pages | Indexing → Sitemaps → (the sitemap row) | Should reach ~124 |
| Indexed / Not indexed | Indexing → Pages | Top two cards |
| "Discovered – currently not indexed" | Indexing → Pages → reasons table | Crawl-budget queue; shrinks as Google crawls |
| Impressions / Clicks / Avg position | Performance → Search results (28-day) | Use the Queries tab; filter for `review`, `vs`, concept terms |

---

## Milestones / targets

| Stage | Target | Healthy timeline (young domain) |
|---|---|---|
| Discovered pages | ~124 | within days of sitemap re-read |
| Indexed | 40–80 | 2–4 weeks |
| Indexed | ~100+ | 1–3 months (gated on backlinks) |
| First impressions on `[channel] review` / `X vs Y` | >0 | 2–4 weeks |
| First organic clicks (GoatCounter referrals to /reviews/ or /vs/) | >0 | 1–3 months |
| AI engine cites a /concepts/ page | 1+ | 1–6 months |

**Red flags:**
- Discovered stuck at ~19 a week after re-submitting → sitemap not being re-read; re-submit / check for errors.
- Indexed flatlines well below ~124 after a month → crawl budget. Earn 1–2 external links.
- Indexed but 0 impressions after 6–8 weeks → targeting/demand problem, not technical.

---

## Log

> Add a row each week. Impressions/Clicks are the 28-day totals from the
> Performance report. "Disc." = sitemap Discovered pages. "Not-idx (DNI)" =
> the "Discovered – currently not indexed" count from the Pages reasons table.

| Date | Disc. | Indexed | Not-idx (DNI) | Impressions (28d) | Clicks (28d) | Avg pos | Notes / actions |
|---|---|---|---|---|---|---|---|
| 2026-05-27 | 19 | 1 | 16 | — | — | — | Google's pre-buildout snapshot (last sitemap read). 3 "page with redirect" also flagged. |
| 2026-05-30 | 19 | 1 | 16 | — | — | — | Shipped ~124-URL site (82 reviews, 14 vs, 5 concepts). Live sitemap confirmed 124 `<loc>`. Re-submitted sitemap; Requested Indexing on Batch 1 (4 hubs + 5 concepts + home). Awaiting re-read. |
| 2026-06-01 | (sitemap n/c) | 4 | 14 | — | — | — | Re-crawl happened. Indexed 1→4. Pages report now tracks 28 URLs (was ~20): 4 indexed + 24 not (14 "Discovered–not indexed" ↓ from 16, **7 new "Crawled–currently not indexed"**, 3 "Page with redirect"). 7 moved Discovered→Crawled = forward progress but stuck at index decision. Did NOT capture Sitemaps-screen Discovered count. |
| 2026-06-06 | **124** | 4 | 14 | — | — | — | **Discovery confirmed complete — bottleneck is crawl-budget, NOT discovery.** Sitemaps screen: `sitemap-index.xml` = Success, **124 discovered** (finally captured). Full buildout known to Google since May 30 = only 7 days; 4/124 indexed is on-pace (target 40–80 @ 2–4wk). Flat since 06-01. **Bad sitemap submission flagged:** bare root `https://ctrl-watch.xyz/` submitted as a sitemap (Type Unknown, 0 pages, "1 error", re-read Jun 6) → remove via Sitemaps ⋮. Promo: Reddit r/MediaCriticism posted (114 views / 1 up / 0 comments — low traction, nofollow, no SEO lift). HN blocked (account `deimos459` 4d old, karma 1 → self-promo auto-killed). Added GSC Domain property. |
| 2026-06-13 | — | — | — | — | — | — | **MISSED — ritual lapsed.** No reading taken. |
| 2026-06-20 | — | — | — | — | — | — | **MISSED — ritual lapsed** (spanned the #016 launch, 2026-06-21). |
| 2026-06-27 | — | — | — | — | — | — | **MISSED — ritual lapsed.** |
| _2026-07-03 (due)_ | | | | | | | **Ritual restarted.** Fill from GSC: Sitemaps Discovered, Pages indexed/DNI, Performance 28d. Confirm the bad `/` sitemap row was removed (flagged 06-06). Check whether Indexed ever moved past 4 — if still single digits, the external-links lever is confirmed as the only move. Run `promote:status` (needs `GOATCOUNTER_TOKEN`). |

---

## The weekly 30-minute ritual (every Friday)

The instruments only work if they're read. Thirty minutes, same order, every week:

1. **GSC row (10 min):** open Search Console → copy Discovered / Indexed / DNI /
   Impressions / Clicks / Avg position into a new Log row above. One line of notes.
2. **Campaign stats (5 min):** `GOATCOUNTER_TOKEN=… npm run promote:status -- <latest-issue>`
   — rewrites the tracking table in `marketing/issue-NNN-distribution.md`.
3. **One outreach action (15 min):** exactly one — a design-gallery submission,
   a newsletter pitch (Garbage Day / Web Curios / Embedded), or one Player Card
   posted to the reviewed channel's subreddit. Log it in the Notes column.

A missed week gets a **MISSED** row, not silence — the gap is data too.

## Notes

- **Don't** re-request an already-indexed/requested URL — no benefit, wastes the ~10/day quota.
- Work `SEARCH_CONSOLE_INDEXING.md` batches ~10/day until all priority URLs are requested.
- Biggest single lever for a young domain = **1–2 quality external links** (relevant subreddit, newsletter, HN). Raises crawl budget more than anything on-site.
- The 13 deferred null-score channels are intentionally not pages yet — not in the sitemap, not expected here.
- AI-citation check (monthly): ask Perplexity / ChatGPT Search / Google AI Overviews "what is the Collision (Type 7) channel framework" and "what is the Comedy Tax" — note whether CTRL+WATCH is cited.
