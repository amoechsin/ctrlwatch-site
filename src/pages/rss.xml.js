import rss from '@astrojs/rss';
import { issues } from '../data/issues.js';

export async function GET(context) {
  return rss({
    title: 'CTRL+WATCH Magazine',
    description: 'Your algorithm is broken. We\'re the fix.',
    site: context.site,
    items: issues
      .filter(i => i.published)
      .map(issue => ({
        title: `${issue.number} — ${issue.title}`,
        pubDate: new Date(issue.date),
        description: issue.subtitle,
        link: `/issues/${issue.slug}/`,
      })),
  });
}
