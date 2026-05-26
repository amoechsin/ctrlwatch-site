# CTRL+WATCH

When working on CTRL+WATCH content, use the ctrlwatch-research, ctrlwatch-writer, and ctrlwatch-frontend agents as appropriate.

When a new issue has shipped and is ready to promote, use the ctrlwatch-promoter agent to generate a per-issue distribution pack (Reddit copy, optional HN draft, YouTuber DM templates) with UTM-tagged URLs. The agent writes to marketing/issue-NNN-distribution.md; it never posts anything.

Promotion workflow (semi-automated, human in the loop):
1. `ctrlwatch-promoter` agent generates `marketing/issue-NNN-distribution.md` with pre-fill submit URLs.
2. `npm run promote:open -- NNN` opens every Reddit submit form (title + body pre-filled), HN submitlink form (URL + title pre-filled), and YouTuber `/about` page in tabs. You review and click Submit / Send.
3. 24–48h later, `npm run promote:status -- NNN` pulls GoatCounter campaign stats and rewrites the tracking table in the same markdown file. Requires `GOATCOUNTER_TOKEN` env var (create at https://ctrlwatch.goatcounter.com/user/api).

Analytics: GoatCounter is wired into BaseLayout.astro and every public/issues/*/index.html. Dashboard lives at https://ctrlwatch.goatcounter.com. Search Console property: https://ctrl-watch.xyz/ (URL-prefix, HTML-tag verified). Sitemap is generated from src/data/issues.js via @astrojs/sitemap customPages.

Cross-issue mobile/CSS overrides live in `public/issues/_shell.css` and are pulled into every issue HTML via a `<link>` tag injected by `npm run inject:shell` (script: `scripts/inject-issue-shell.mjs`). Run after shipping a new issue HTML — idempotent, skips files already linked. Do NOT edit issue HTML internals to fix cross-cutting concerns; add the rule to `_shell.css` and re-run.

## Platform evolution work (Phase 0 & Phase 1)

For platform/UX improvements layered on top of the existing site, read `PLATFORM_BRIEF.md`. It covers:

- **Phase 0 (Foundation):** mobile readability verification, deep-link bypass for boot sequence, cover art + OpenGraph image generation, archive shelf enhancement
- **Phase 1 (Discoverability):** Creator Index (parsed from continuity tracker), retro-styled search (Pagefind), Start Here onboarding page, Print/Terminal mode toggle

**Locked architectural decisions** for platform work are in section 2 of `PLATFORM_BRIEF.md`. These are not open for revision during execution.

**Out of scope** for current platform work: Algorithm Jail (editorial), Audio Press Start (deferred), community voting (Phase 3, gated on GoatCounter evidence), short-form social, Discord, print annual.

**Hard rules for platform work:**
- Don't touch existing issue HTML internals (`public/issues/NNN/index.html`)
- Don't break GoatCounter analytics integration
- Don't break the promotion workflow (`ctrlwatch-promoter`, `npm run promote:open/status`)
- `src/data/issues.js` is platform source of truth; continuity tracker is editorial source of truth
- Test on real mobile devices, not just DevTools

**Source documents:**
- `BRIEF.md` — v1.0 scaffold spec, historical reference (design tokens, base components)
- `PLATFORM_BRIEF.md` — current Phase 0 & 1 work spec
- `CLAUDE.md` — this file, operational context
- Continuity tracker (latest version, location varies per release) — editorial source of truth, read-only from platform