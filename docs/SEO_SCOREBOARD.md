# SEO Scoreboard — ctrl-watch.xyz

A weekly log of the few numbers that actually tell us whether the canonical
asset layer (82 reviews + 14 boss fights + 5 concepts + hubs = ~124 URLs) is
getting found, indexed, and surfaced. Companion to `SEARCH_CONSOLE_INDEXING.md`.

**Property:** Google Search Console — `https://ctrl-watch.xyz/` (URL-prefix).
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
| _next: ~2026-06-08_ | | | | | | | Check Sitemaps screen Discovered (target ~124); did Indexed climb toward 40–80? Inspect the 3 redirect URLs. |

---

## Notes

- **Don't** re-request an already-indexed/requested URL — no benefit, wastes the ~10/day quota.
- Work `SEARCH_CONSOLE_INDEXING.md` batches ~10/day until all priority URLs are requested.
- Biggest single lever for a young domain = **1–2 quality external links** (relevant subreddit, newsletter, HN). Raises crawl budget more than anything on-site.
- The 13 deferred null-score channels are intentionally not pages yet — not in the sitemap, not expected here.
- AI-citation check (monthly): ask Perplexity / ChatGPT Search / Google AI Overviews "what is the Collision (Type 7) channel framework" and "what is the Comedy Tax" — note whether CTRL+WATCH is cited.
