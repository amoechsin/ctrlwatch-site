import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { issues } from './src/data/issues.js';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'https://ctrl-watch.xyz';
const issuePages = issues
  .filter((i) => i.published)
  .map((i) => `${SITE}/issues/${i.slug}/`);

// Canonical Player Profile pages — one per markdown file in the reviews
// collection. Read from disk so the sitemap tracks the content folder.
async function pagesFrom(dir, base) {
  try {
    return (await readdir(dir))
      .filter((f) => f.endsWith('.md'))
      .map((f) => `${SITE}${base}${f.replace(/\.md$/, '')}/`);
  } catch {
    return [];
  }
}
const reviewPages = await pagesFrom('./src/content/reviews', '/reviews/');
const conceptPages = await pagesFrom('./src/content/concepts', '/concepts/');
const vsPages = await pagesFrom('./src/content/vs', '/vs/');

const extraPages = [
  `${SITE}/creators/`,
  `${SITE}/start/`,
  `${SITE}/top50/`,
  `${SITE}/reviews/`,
  `${SITE}/concepts/`,
  `${SITE}/vs/`,
  ...reviewPages,
  ...conceptPages,
  ...vsPages,
];

/* Dev-server middleware. Astro's dev server returns 404 for
   trailing-slash directory paths that live in `public/` (e.g.
   `/issues/001/`). Netlify serves directory indexes automatically;
   this middleware makes `astro dev` match that behavior so the same
   URL works in dev, preview, and production. */
function serveIssueDirectoryIndexes() {
  return {
    name: 'ctrlwatch:issue-dir-indexes',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '/';
          const match = url.match(/^\/issues\/([^/?#]+)\/(?:\?.*)?$/);
          if (!match) return next();
          try {
            const html = await readFile(
              join('public', 'issues', match[1], 'index.html'),
              'utf8',
            );
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
          } catch {
            next();
          }
        });
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  integrations: [sitemap({ customPages: [...issuePages, ...extraPages] }), serveIssueDirectoryIndexes()],
});
