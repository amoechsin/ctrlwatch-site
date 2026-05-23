import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { issues } from './src/data/issues.js';

const SITE = 'https://ctrl-watch.xyz';
const issuePages = issues
  .filter((i) => i.published)
  .map((i) => `${SITE}/issues/${i.slug}/`);

export default defineConfig({
  site: SITE,
  integrations: [sitemap({ customPages: issuePages })],
});
