# CTRL+WATCH

When working on CTRL+WATCH content, use the ctrlwatch-research, ctrlwatch-writer, and ctrlwatch-frontend agents as appropriate.

When a new issue has shipped and is ready to promote, use the ctrlwatch-promoter agent to generate a per-issue distribution pack (Reddit copy, optional HN draft, YouTuber DM templates) with UTM-tagged URLs. The agent writes to marketing/issue-NNN-distribution.md; it never posts anything.

Analytics: GoatCounter is wired into BaseLayout.astro and every public/issues/*/index.html. Dashboard lives at https://ctrlwatch.goatcounter.com. Search Console property: https://ctrl-watch.xyz/ (URL-prefix, HTML-tag verified). Sitemap is generated from src/data/issues.js via @astrojs/sitemap customPages.
