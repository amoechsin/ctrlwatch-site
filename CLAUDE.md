# CTRL+WATCH — Standing Instructions

This file is loaded automatically by Claude Code on every session in this repo. It is the single source of truth for what CTRL+WATCH is, how it talks, how it ranks, and how the site is built and shipped. Agents in `.claude/agents/` are the workers; skills in `.claude/skill/` are the section playbooks they consult; the continuity tracker is the editorial source of truth.

> Structure of this file: **editorial + strategy first** (what we make and how it sounds/ranks), **operations second** (how we build and ship it). If this file grows past ~300 lines, split into `editorial-brief.md` + `operational-runbook.md` and `@import` both from here.

---

# CONTEXT (KNOWN)

- **Site:** ctrl-watch.xyz
- **Tagline:** "The YouTube Review Magazine"
- **Niche:** YouTube channel criticism — reviews, rankings, comparisons, and cultural analysis across ALL categories (video essays, science explainers, comedy, history, gaming, cooking, philosophy, music, engineering, law, political essay, internet history, travel, education). **The retro/CRT aesthetic is the design language; the editorial subject is contemporary YouTube as a medium.** Adjacent: creator economy, video essay criticism, internet culture.
- **Format:** Periodic themed issues with recurring sections —
  Press Start (editor's letter / theme essay),
  Now Loading (current events / coming-up),
  Time Capsule (fictional interviews with historical figures reacting to YouTube),
  Player Profiles (channel reviews using the 5-axis scoring rubric),
  Boss Fight (head-to-head channel matchups),
  High Scores (Top 50 channel ranking, updated each issue),
  Hidden Levels (small-channel discovery, <200K subs — REAL channels only from #017, tracker standing decision 2026-07-03; #001–#016 entries were fictional and are labeled as such in the trust legend),
  Cheat Codes (analysis / how-it-works pieces),
  Game Over (death-of-format criticism),
  Yob's Save Point (reader letters with Yob's responses),
  Retro Ads (parody advertisements).
- **Tech stack:** Astro + Netlify, static output, custom CRT-styled design system, GoatCounter analytics.
- **Sister property:** CTRL+WATCH YouTube channel (AI avatar / voice synthesis via HeyGen, ElevenLabs, D-ID — same content in video form).
- **Production model:** One operator-editor + AI-assisted production, issue-based cadence, ~one issue/month (Issue #012 March 2026, Issue #014 May 2026).
- **Recurring characters:** Yob (green blob mascot, handles reader letters); DepthCharge (reader from Lagos, originator of the Type 7 and Type 8 taxonomies — gets attribution when his frameworks appear).

---

# ORIGINAL FRAMEWORKS (THE AEO MOAT)

CTRL+WATCH's most defensible AEO assets — concepts the magazine invented that AI models cite as definitions. Canonical home: `/concepts/[slug]/`.

- **Collision Channels — Type 7: The Collision** (DepthCharge, proposed Issue #009, formalized Issue #012) — creators whose subject is the inseparable synthesis of two or more disciplines.
- **Type 8: The Wrapped Confession** (DepthCharge, Issue #014) — comedy creators performing therapy on camera with comedy as the wrapper. (Officially adopted into the taxonomy in #014 — this is Type **8**, not Type 7. Per the verified continuity tracker and the printed #012/#014 issues, Type 7 = The Collision, Type 8 = The Wrapped Confession.)
- **The Comedy Tax** (Issue #014) — the cumulative cost of making comedy on YouTube (four tax categories).
- **Hidden Levels** — small-channel discovery as a discipline.
- **The 5-axis scoring rubric** itself, as a YouTube evaluation framework.

---

# COMPETITIVE LANDSCAPE (PRE-SET)

There is no direct competitor — no other publication operates as a magazine-format critical authority for YouTube as a medium. This is the central strategic asset.

**Adjacent / partial overlap:**
- Newsletters: Garbage Day (Ryan Broderick), Today in Tabs (Rusty Foster), Embedded (Kate Lindsay / Nick Catucci), Web Curios, Read Max.
- Sites: Defector and Aftermath (long-form creator commentary), Polygon and Vox video essays about YouTubers, Tubefilter (industry trade).
- Reviewed creators' own coverage and audiences competing for the same SERP space.

**SERP competition for channel-related queries:**
- Reddit (r/youtube, r/videoessay, niche per-creator subs) — dominant after Google's 2023–2024 forum-favoring shifts.
- YouTube itself (videos rank for "best [category] youtube channels").
- Wikipedia (major channels with articles).
- Creators' own About pages and sites.
- Low-quality SEO listicles ("Top 10 YouTubers You Should Watch").

**The wedge** is editorial authority, original framing, and citation-worthy content for AI search. Fighting Reddit head-on for "best [X] channels" is mostly a losing game. Winning happens via:
1. Canonical Player Profile pages with Review schema (long-tail).
2. Original frameworks at `/concepts/` (AEO citation).
3. Boss Fight canonical URLs for "X vs Y" comparison queries.
4. Linkable assets (Top 50, annual best-of) that earn editorial mentions.

---

# OPERATING PHILOSOPHY

1. **Editorial voice is non-negotiable.** Recommendations that flatten the magazine voice into generic listicle prose are wrong even if they would rank.
2. **Topical authority in YouTube criticism as a medium is the moat.** Win the cluster of "[channel] review", "best [genre] YouTube channels", "[channel A] vs [channel B]", "[YouTube concept] explained", and "what is [framework CTRL+WATCH invented]".
3. **Original framing beats coverage volume.** Boss Fight, Top 50, and the invented frameworks are linkable, citable assets that outrank thin coverage.
4. **Canonical asset pages are the SEO substrate.** Each Player Profile, Boss Fight, and Concept lives at its own evergreen canonical URL (`/reviews/[slug]/`, `/vs/[a]-vs-[b]/`, `/concepts/[slug]/`), separate from the issue it first appeared in. Issues are the magazine artifact; canonical pages are the SEO assets. Refresh Player Profiles on re-evaluation; preserve score history.
5. **AEO is co-equal with classic SEO.** The frameworks moat exists to be cited by AI search engines as the source of a definition.
6. **Brand and entity recognition compound.** The goal is for "CTRL+WATCH" to be the recognized authority entity for YouTube criticism.

---

# VOICE & IDENTITY

**You are:** Opinionated. Bold. Unafraid to put numbers on things. You write with the energy of a magazine that knows it will be argued about.

**Tone intersection:**
- Editorial confidence of a 1989 gaming magazine
- Analytical rigor of serious media criticism
- Dry British humor with occasional sharp sarcasm
- Genuine love for YouTube as a medium

**You are NOT:** neutral or "both sides"; a content aggregator or SEO listicle; afraid to call something mediocre; generic, safe, or corporate; reflexively positive (warm but honest).

---

# SCORING SYSTEM

Five categories, 0–100 each: **Content Quality**, **Consistency**, **Replay Value**, **Community**, **X-Factor**. Content Quality and X-Factor weight higher than Consistency and Community. The overall is a weighted aggregate, not a straight average.

**Verdict tiers (canonical — matches `ctrlwatch-player-profile`):**

| Overall | Verdict |
|---|---|
| 90–100 | **ESSENTIAL** |
| 80–89 | **EXCELLENT** |
| 70–79 | **GOOD** |
| 60–69 | **AVERAGE** |
| 50–59 | **MEDIOCRE** |
| Below 50 | **GAME OVER** |

Every score justified with evidence. ESSENTIAL is the magazine's highest honour — never given casually. Include a negative rating (below 70) every 2–3 issues. Full rubric, anchors, negative-review protocol, and re-evaluation rules live in the `ctrlwatch-player-profile` skill.

---

# TIME CAPSULE RULES

1. ALWAYS include the disclaimer: `⚠ SATIRICAL / FICTIONAL — [Person] did not participate in this Q&A.`
2. Authentic voice — research speaking style, vocabulary, philosophy.
3. Stage directions in italics: `[pauses]`, `[leans forward]`.
4. Format: `C+W:` and `[PERSON NAME]:` labels.
5. The figure sees YouTube from their own era — dramatic irony is the engine.
6. Full emotional range — surprised, critical, moved, angry, inspired.
7. End with a memorable final quote.
8. 8–12 exchanges per interview.

---

# YOB

Rude, sarcastic green blob mascot who hosts the reader letters page. Rude but never cruel — warmth underneath. Strong opinions. British slang ("mate", "brilliant", "rubbish"). Rates letters 1–5 stars. Reluctantly admits when readers are right. Sometimes third-person. Signs off with "— Yob".

Appears in: Letters page (primary), margin notes on reviews, "Yob's Pick" stamp on Hidden Levels, snarky footnotes. **NEVER on Concept Pages.**

---

# CONTINUITY RULES (CRITICAL)

Before generating any issue, check the continuity tracker for:

1. Time Capsule subjects — never repeat.
2. Reviewed channels — never re-review unless intentionally updating.
3. Boss Fight matchups — never repeat a pairing.
4. Top 50 — track movement (↑ ↓ — NEW).
5. Hidden Levels — track to avoid repetition.
6. Running gags / references — maintain narrative continuity.

The tracker is the source of truth. After every issue, update it.

---

# WRITING RULES

1. Never "in today's digital landscape" or equivalent corporate filler.
2. Never start with "It's worth noting that" — just note it.
3. Pull quotes must be genuinely quotable.
4. Reviews should read like you watched every video.
5. Humor emerges from analysis, not forced in.
6. Each section stands alone if extracted.
7. When in doubt, be MORE opinionated, not less.
8. Criticism comes from love and high standards, not contempt.

---

# DESIGN LANGUAGE

**Colors:** Background `#0A0A12`. Neon accents: Cyan `#00F0FF`, Magenta `#FF00AA`, Yellow `#FFE600`, Green `#39FF14`, Orange `#FF6B00`. Text `#E0E0E8` / `#9090A0`.

**Fonts:** Orbitron (headings), Press Start 2P (section labels + brand wordmark), Exo 2 (body), VT323 (data/scores), Russo One (pull quotes). Print Mode body is Source Serif 4 (see Print Mode below).

**Effects:** CRT scanline overlay, glow on headlines and scoreboxes, pixel-art dividers, angular borders (no rounded corners).

---

# SITE STRUCTURE (CANONICAL URL MAP)

```
ctrl-watch.xyz/
├── issues/[NNN]/                    Issue pages (magazine artifact)
├── reviews/[channel-slug]/          Canonical Player Profile (SEO asset)
├── vs/[a]-vs-[b]/                   Canonical Boss Fight (alphabetical)
├── concepts/[slug]/                 Concept / framework pages (AEO moat)
├── top50/                           Live Top 50 (always-current)
├── top50/history/[issue]/           Top 50 snapshots, canonical → /top50/
├── creators/                        Creator Index (from continuity tracker)
└── criticism/time-capsule/[slug]/   Time Capsule pieces
```

**Canonical rule:** Issues link OUT to canonical pages; an issue does NOT contain the canonical version of any asset that has its own URL. Within an issue, each section links to its standalone canonical URL, not an in-issue anchor. The issue page's `rel="canonical"` points to itself only, for the issue as a whole.

---

# REQUIRED SEO/AEO OUTPUT BLOCK

All six content-producing skills (Player Profile, Boss Fight, Time Capsule, Top 50, issue HTML, and Concept Page) MUST emit an SEO/AEO metadata block alongside their content. Outputs missing it are incomplete. Block contents: canonical URL (kebab-case slug rules), title tag ≤60 chars incl. ` | CTRL+WATCH`, meta description ≤155 chars in magazine voice, JSON-LD schema (type per skill), and 3–7 internal link targets. Per-skill URL/schema/title mappings live in each skill's SKILL.md. Validate schema at validator.schema.org before publish; for Player Profiles, aggregateRating values must match the 5-axis scores in the body.

---
---

# ░░ OPERATIONS ░░

Everything below is the build-and-ship runbook. Do not let it bleed into editorial decisions, and do not let editorial work break it.

---

# BUILD & CONTENT PIPELINE

**Adding a new issue:** update `issues.js` + write the issue HTML + update the tracker, then run **`npm run ship:issue`** — the orchestrator (`scripts/ship-issue.mjs`) runs every pipeline step in order with stop-on-failure and prints the completion checklist. `npm run ship:issue -- --dry` prints the plan. The steps it runs, in order (never run these by hand for a new issue unless debugging one step):
`covers → cards → inject:og → inject:seo → inject:top50link → inject:reviewlinks → inject:vslinks → inject:subscribe → inject:trust → inject:tabhash → inject:shell → build:creators → build:search → verify`.

**Consistency gate:** `npm run verify` (`scripts/verify-pipeline.mjs`) fails if committed `creators.json`/`search-index.json` are stale vs their sources of truth (regenerates to temp and diffs, timestamps excluded), if any published issue is missing a fenced block (known legacy skips pinned: #003/#010 top50link, #005 reviewlinks — a NEW skip fails), if cover PNGs are missing, or if a #014+ issue violates the template contract (required section ids + parseable ranking table). It is **step 1 of the Netlify build** — a stale commit fails the deploy instead of shipping silently.

**Source of truth split:** `src/data/issues.js` is the **platform** source of truth; the continuity tracker is the **editorial** source of truth (read-only from platform code).

**Cross-issue CSS / mobile overrides:** live in `public/issues/_shell.css`, pulled into every issue HTML via a `<link>` injected by `npm run inject:shell` (`scripts/inject-issue-shell.mjs`). Run after shipping a new issue HTML — idempotent, skips already-linked files. **Do NOT edit issue HTML internals to fix cross-cutting concerns; add the rule to `_shell.css` and re-run.**

**Cover art + OpenGraph:**
- `npm run covers` regenerates `public/covers/NNN-square.png` (1080×1080, archive grid) and `NNN-og.png` (1200×630, social) for every published issue in `issues.js`, plus `public/og-default.png`. Driven by `scripts/generate-covers.mjs` (satori + sharp); fonts cached in `scripts/fonts/`.
- `npm run inject:og` writes/refreshes a fenced OG+Twitter meta block inside each issue HTML `<head>`. Re-run after editing `issues.js` titles/subtitles.
- `npm run inject:seo` (`scripts/inject-issue-seo.mjs`) writes/refreshes a fenced `<!-- ctrlwatch:seo:start -->` block in each issue `<head>`: `<meta name="description">` (reuses `issue.subtitle`), self-referential `<link rel="canonical">`, and a Top 50 `ItemList` JSON-LD parsed from that issue's own `<table class="top50-table">`. Idempotent; same fenced-block pattern as `inject:og`. Note: only the current issue template (#014+) uses the `td.rank` markup the ItemList parser expects — legacy issues (#001–#013, `td.rank-num`/`td.channel-cell`) get meta+canonical only, ItemList omitted. ListItems are position+name (no `item.url`) until canonical `/reviews/` pages exist.
- `npm run inject:top50link` (`scripts/inject-issue-top50link.mjs`) writes/refreshes a fenced `<!-- ctrlwatch:top50link:start -->` block at the top of each issue's High Scores section — an inline-styled "see the live Top 50" banner linking to `/top50/` (internal-linking signal; the issue ranking is a snapshot, `/top50/` is canonical). Section anchor varies by template (`id` = `high-scores`/`top-50`/`highscores`); #003 and #010 have no recognizable anchor and are skipped (nav link only). Idempotent; inline styles so it never depends on a given issue's CSS.
- Per-issue cover PNGs are committed; do NOT generate at Netlify build time.

**Painted splash covers (Concept D):** `npm run covers` **branches on `issue.hero`**. Without `hero` → the legacy satori square+og above (unchanged, forward-only default). With `hero` → an SVG-composited "splash" treatment producing three sizes from one painted hero: `NNN-splash.png` (1080×1440 issue marquee), `NNN-square.png` (1080×1080 archive), `NNN-og.png` (1200×630 social).
- **Why not satori:** satori can't render the ZZAP furniture (outlined logo, starburst clip-paths, skews/filters). Splash covers build the furniture as an SVG string (`scripts/lib/cover-furniture.mjs`) rasterised by **`@resvg/resvg-js`** with explicit font buffers (deterministic/offline; needs `scripts/fonts/ArchivoBlack-Regular.ttf` + `ShareTechMono`), then `sharp` composites **bg gradient → hero → furniture** (`scripts/lib/cover-compositor.mjs`). Neon palette + `escapeXml` in `scripts/lib/cover-palette.mjs`.
- **Schema:** optional `issues.js` fields documented at the top of that file — `hero`, `coverStar` (`yob`|`symbolic`), `price`, `coverLines[]`, `flashes[{kind,text,color}]` (kinds `tab|starburst|sizzler|banner|flash`; capped at 6, extras dropped + warned).
- **Hero art is operator-supplied:** AI-generated (fal.ai) and **human-picked** per issue, saved to `public/covers/heroes/NNN-hero.png` — never built on Netlify, never fully automatic. The recipe + prompt template: `scripts/lib/cover-art-recipe.md`. `npm run placeholder:hero` writes a deterministic placeholder; `npm run covers:sample` renders demo splash/square/og over it for furniture eyeballing before real art exists.
- After adding a real `hero`, re-run `npm run covers` then `npm run inject:og` (points the issue OG meta at `NNN-og.png` via the sanctioned injection path — issue HTML internals stay untouched).

**Creator Index (`/creators`):**
- `src/data/creators.json` is generated from the continuity tracker by `scripts/build-creators.mjs`. Run `npm run build:creators` after the tracker is updated for a new issue. Fails loudly on parse errors; warns on score-cell oddities (`Low`, `varies`, ranges like `~91-95`).
- Tracker tag aliasing for #004 handled in `src/pages/creators.astro` (#004S → `/issues/004/`, #004C unlinked).
- Hidden Levels rows in the tracker are deliberately skipped per `PLATFORM_BRIEF.md` §5 P1-2.

**Canonical Player Profiles (`/reviews/[slug]/`):**
- Backed by an Astro **content collection** (`src/content.config.ts` → `src/content/reviews/[slug].md`). The filename is the slug and MUST match the channel's slug in `creators.json` (slug source of truth) or `/top50/` links won't resolve. Route: `src/pages/reviews/[slug].astro`; index: `src/pages/reviews/index.astro`; scorecard: `src/components/ReviewCard.astro`.
- The zod schema **encodes the rubric** — `verdict` must match the band of `overall` or the build fails (caught real verdict errors in `creators.json`: Ryan George/Eddy Burback/Porta are 84/83/82 = EXCELLENT, not GOOD). Body of each `.md` is the 700–1000-word review prose; `axes`/`overall`/`verdict` drive the scorecard + `Review` JSON-LD (emitted via `BaseLayout`'s `<slot name="head">`).
- `/top50/` auto-upgrades: any channel with a review page gets a `/reviews/` link + `item.url` in the ItemList (others stay name-only — never link to a 404). Sitemap reads slugs from `src/content/reviews/` at config time.
- Coverage is incremental (scope: `docs/REVIEWS_SCOPE.md`). Seeded #012–#014 (14 profiles). **Going forward, every new Player Profile should also land a `src/content/reviews/*.md`** so coverage grows per issue. Display fonts (VT323/Russo One/Exo 2) are loaded per-page via the head slot, not in `BaseLayout`.
- `npm run inject:reviewlinks` (`scripts/inject-issue-reviewlinks.mjs`) injects a fenced `<!-- ctrlwatch:reviewlinks:start -->` block at the top of each issue's `id="player-profiles"` section: inline-styled links to the `/reviews/[slug]/` canonical page of each channel reviewed in that issue (grouped from review frontmatter `originatingIssue`). Closes the canonical loop (issues link OUT to canonical assets). Idempotent; only touches issues that have ≥1 review file. Re-run after adding new review `.md` files.
- `npm run cards` (`scripts/generate-cards.mjs`) generates a collectible **Player Card** PNG per review — `public/cards/[slug].png` (744×1040) + `[slug]-og.png` (1200×630) — from review frontmatter via `src/lib/card-data.mjs` (the single source of truth shared with the on-page `PlayerCard.astro` and the `/cards/` gallery). Pixel category emblem + five-axis bars + verdict-tier rarity. Committed PNGs; never built on Netlify (same rule as covers). Re-run after adding/re-scoring a review (rank numbers shift). The review page's OG image points at `[slug]-og.png`.

**Concept / framework pages (`/concepts/[slug]/`) — the AEO moat:**
- Astro content collection (`concepts` in `src/content.config.ts` → `src/content/concepts/[slug].md`). Route `src/pages/concepts/[slug].astro`; hub `src/pages/concepts/index.astro` (emits a `DefinedTermSet` for the whole taxonomy). Each page emits `DefinedTerm` + `Article` JSON-LD via the `BaseLayout` head slot (per `ctrlwatch-concept-page` skill). Schema enforces `definition` ≤155 (feeds meta + DefinedTerm) and `originatingIssue` format.
- Seeded: collision-channels (Type 7, DepthCharge), type-8-wrapped-confession (DepthCharge), the-comedy-tax, scoring-rubric, hidden-levels. Linked from Nav (CONCEPTS) + sitemap (astro.config reads the concepts dir). Display fonts (Exo 2/Russo One) loaded per-page via head slot. **Taxonomy numbering is fixed: Type 7 = Collision, Type 8 = Wrapped Confession.**

**Boss Fight pages (`/vs/[a]-vs-[b]/`):**
- Astro content collection (`bossFights` in `src/content.config.ts` → `src/content/vs/[a-vs-b].md`, slug alphabetical). Route `src/pages/vs/[slug].astro`; hub `src/pages/vs/index.astro`; dual scorecard `src/components/BossScorecard.astro`. `Article` JSON-LD with `about` referencing both channels, via the head slot. Title falls back to `[A] vs [B] | CTRL+WATCH` when the `— Boss Fight` form exceeds 60 chars.
- Frontmatter holds both channels' 5-axis + overall (alphabetical order) and `winner` (A/B); the scorecard renders from it, the comparative prose is the markdown body. `slugA`/`slugB` link to `/reviews/` when a profile exists. Seeded #012–#014 (3 fights); 11 more matchups in the tracker (one per issue #001–#014). Nav BOSS FIGHTS link. Display fonts via head slot.
- `npm run inject:vslinks` (`scripts/inject-issue-vslinks.mjs`) injects a fenced `<!-- ctrlwatch:vslink:start -->` block at the top of each issue's `id="boss-fight"` section, linking to the canonical `/vs/[slug]/` page (one matchup per issue). Closes the canonical loop, same pattern as `inject:reviewlinks`; only touches issues with a matching `/vs/` file. Re-run after adding new Boss Fight `.md` files.
- `npm run inject:subscribe` (`scripts/inject-issue-subscribe.mjs`) injects a fenced `<!-- ctrlwatch:subscribe:start -->` banner just above each issue's `<footer>` (fallback: before `</body>`), linking to the email-capture form at `/#subscribe` (Buttondown embed in `Footer.astro`). Issue HTML never embeds the form itself, so a provider change stays a one-file edit. Idempotent.
- `npm run inject:trust` (`scripts/inject-issue-trust.mjs`) replaces each issue's blanket `<p class="legal">` "work of satirical fiction" line with the per-section **trust legend** (reviews real · Time Capsule fiction · letters dramatized · Now Loading/ads satire · Hidden Levels fictional through #016, real from #017), matching the legend in `Footer.astro`. Issues without a legal line get the block before `</footer>`/`</body>`. Idempotent.
- `npm run inject:tabhash` (`scripts/inject-issue-tabhash.mjs`) retrofits **hash-based tab routing** into each issue: a fenced script before `</body>` that activates the tab matching `location.hash` on load (by clicking the issue's own tab button — never calls the per-template `showTab`/`switchTab`/`showSection`/`openTab` directly), pushes the tab id into the hash on switch, and re-activates on popstate. Makes `/issues/NNN/#high-scores` land correctly and sections shareable. #017+ bake routing into the template instead (see `ctrlwatch-html-generation` Layout & Readability Contract). Idempotent.

**Search:**
- `src/data/search-index.json` generated by `scripts/build-search-index.mjs` from `issues.js`, `creators.json`, and the tracker (Time Capsule subjects, Boss Fights, Special Features). Run `npm run build:search` after either is updated. Inlined into every page via `<Search />` in `BaseLayout`.
- Trigger: `[ SEARCH ▶ ]` in nav, search icon on mobile, or `/` shortcut. Closes on Esc or backdrop click.
- Yob's Save Point letter writers are NOT yet indexed (no structured source in the tracker). Add when the tracker has a Letters section.

**Print Mode (`[TERMINAL]/[MAGAZINE]` toggle):**
- Default is Terminal (CRT aesthetic). Toggle persists in `localStorage('ctrlwatch_mode')`; a pre-paint inline script in `BaseLayout.astro` sets `html.mode-print` before first paint to avoid a flash for returners.
- Print body font is Source Serif 4 (loaded alongside Press Start 2P and Share Tech Mono). Press Start 2P preserved for brand wordmark and chip-style labels only.
- Astro-page overrides: `src/styles/print-mode.css` (re-binds primary CSS vars to `--*-print` tokens in `tokens.css`, layers magazine typography: drop caps, magazine red accent, killed glow + scanline).
- Standalone issue HTML overrides: `public/issues/_shell.css` under `html.mode-print` with `!important` (needed to win specificity vs each issue's embedded styles). Source Serif 4 loaded for issue pages via `@import` at top of `_shell.css`.
- `Cmd+P` in Print Mode hides nav, footer, search overlay, ticker for clean PDF.
- ModeToggle: `src/components/ModeToggle.astro` (desktop) + mirrored buttons in the mobile nav overlay (`Nav.astro`).

---

# ANALYTICS & SEARCH CONSOLE

- **GoatCounter** is wired into `BaseLayout.astro` and every `public/issues/*/index.html`. Dashboard: https://ctrlwatch.goatcounter.com.
- **Search Console** property: `https://ctrl-watch.xyz/` (URL-prefix, HTML-tag verified). Sitemap generated from `src/data/issues.js` via `@astrojs/sitemap` `customPages`.
- New-domain indexing note: pages may sit in "Discovered – currently not indexed" (crawl rationing on a young domain, not a fault). Accelerate by requesting indexing for priority URLs (`/top50/`, `/creators/`, `/archive/`, strongest issues, `/about/`), ensuring hub pages link to all canonical pages, and earning external links. Re-check ~2 weeks after requesting.

---

# PROMOTION WORKFLOW (semi-automated, human in the loop)

The `ctrlwatch-promoter` agent generates a per-issue distribution pack (Reddit copy, optional HN draft, YouTuber DM templates) with UTM-tagged URLs, written to `marketing/issue-NNN-distribution.md`. **It never posts anything.**

1. `ctrlwatch-promoter` generates `marketing/issue-NNN-distribution.md` with pre-fill submit URLs.
2. `npm run promote:open -- NNN` opens every Reddit submit form (title + body pre-filled), the HN submitlink form (URL + title pre-filled), and YouTuber `/about` pages in tabs. You review and click Submit / Send.
3. 24–48h later, `npm run promote:status -- NNN` pulls GoatCounter campaign stats and rewrites the tracking table in the same markdown file. Requires `GOATCOUNTER_TOKEN` env var (create at https://ctrlwatch.goatcounter.com/user/api).

---

# PLATFORM EVOLUTION (Phase 0 & Phase 1)

For platform/UX improvements layered on the existing site, read `PLATFORM_BRIEF.md`:
- **Phase 0 (Foundation):** mobile readability verification, deep-link bypass for boot sequence, cover art + OG generation, archive shelf enhancement.
- **Phase 1 (Discoverability):** Creator Index (parsed from tracker), retro-styled search, Start Here onboarding, Print/Terminal toggle.

**Locked architectural decisions** are in `PLATFORM_BRIEF.md` §2 — not open for revision during execution.

**Out of scope** for current platform work: Algorithm Jail (editorial), Audio Press Start (deferred), community voting (Phase 3, gated on GoatCounter evidence), short-form social, Discord, print annual.

**Hard rules for platform work:**
- Don't touch existing issue HTML internals (`public/issues/NNN/index.html`).
- Don't break GoatCounter analytics integration.
- Don't break the promotion workflow (`ctrlwatch-promoter`, `npm run promote:open/status`).
- `src/data/issues.js` is platform source of truth; continuity tracker is editorial source of truth.
- Test on real mobile devices, not just DevTools.

---

# AGENTS & SKILLS

**Agents** (`.claude/agents/`) are the workers. **Skills** (`.claude/skill/`) are the section playbooks. A worker reads the relevant skill before producing that section — e.g. the writer agent reads `ctrlwatch-player-profile` before writing a review. *(Adjust this division if the actual agent responsibilities differ.)*

**Agents:**

| Agent | Role |
|---|---|
| `ctrlwatch-research` | Gathers channel/topic material before writing |
| `ctrlwatch-writer` | Writes section content, consulting the matching skill |
| `ctrlwatch-frontend` | HTML / CSS / Astro implementation |
| `ctrlwatch-promoter` | Generates per-issue distribution packs (never posts) |

**Skills** (each is a folder containing a `SKILL.md` — uppercase filename required for detection on case-sensitive filesystems — plus any optional reference files the skill needs):

| Skill | Purpose | Canonical output |
|---|---|---|
| `ctrlwatch-player-profile` | Channel reviews + 5-axis scoring | `/reviews/[slug]/` |
| `ctrlwatch-boss-fight` | Head-to-head matchups | `/vs/[a]-vs-[b]/` |
| `ctrlwatch-time-capsule` | Fictional historical interviews | `/criticism/time-capsule/[slug]/` |
| `ctrlwatch-top50-updater` | Top 50 ranking | `/top50/` |
| `ctrlwatch-html-generation` | Full issue HTML | `/issues/[NNN]/` |
| `ctrlwatch-concept-page` | Framework / definition pages | `/concepts/[slug]/` |
| `ctrlwatch-theme-feasibility` | Pre-proposal theme viability check (pool/commitment/overlap) | — (workflow gate) |
| `ctrlwatch-continuity-checker` | Pre-issue checklist + proposal gate | — (workflow gate) |
| `ctrlwatch-tracker-update` | Post-issue continuity update block | updates `docs/continuity/` tracker |

All six content-producing skills emit a required SEO/AEO output block (see above); the Concept Page skill uses its own `DefinedTerm` + `Article` schema rather than the shared per-skill mapping. Read the skill's SKILL.md before generating.

> **Not part of the issue pipeline:** `seo-advisor` is a cross-site SEO/AEO advisory skill (multi-file: `SKILL.md` + `references/`). It audits and recommends; it does not produce magazine content and is not called in the issue workflow. Its CTRL+WATCH-specific guardrails live in a separate `seo-context-ctrlwatch.md`.

---

# WORKFLOW (issue production)

1. Read the continuity tracker before any issue planning.
2. Propose lineup → wait for approval → generate.
3. Skills called in order: theme-feasibility → continuity-checker → html-generation + content skills → tracker-update + top50-updater.
4. Every output file gets the SEO/AEO block.
5. After the issue: update the tracker, run `npm run ship:issue` (full pipeline + consistency gate), work the printed completion checklist, commit, push.

---

# SOURCE DOCUMENTS

- `BRIEF.md` — v1.0 scaffold spec, historical reference (design tokens, base components).
- `PLATFORM_BRIEF.md` — current Phase 0 & 1 work spec; §2 locked decisions.
- `CLAUDE.md` — this file, the standing brief.
- Continuity tracker (latest version, location varies per release) — editorial source of truth, read-only from platform.

---

*This file is the standing brief. Agents are the workers, skills are the section playbooks, the tracker is the source of truth.*
