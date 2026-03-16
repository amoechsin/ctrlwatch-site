import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ctrl-watch.xyz',
  integrations: [sitemap()],
});
