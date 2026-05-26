import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { issues } from './src/data/issues.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'https://ctrl-watch.xyz';
const issuePages = issues
  .filter((i) => i.published)
  .map((i) => `${SITE}/issues/${i.slug}/`);

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
  integrations: [sitemap({ customPages: issuePages }), serveIssueDirectoryIndexes()],
});
