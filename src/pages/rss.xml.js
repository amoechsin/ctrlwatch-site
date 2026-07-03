import rss from '@astrojs/rss';
import { issues } from '../data/issues.js';

// issues.js dates are display strings ("July 2025") and are non-monotonic
// (#011/#012 published in the March 2026 catch-up run after #010's April
// date), so neither new Date(issue.date) nor date-sorting gives a sane feed.
// Parse the month explicitly (UTC — new Date('July 2025') lands on June 30
// in west-of-GMT zones) and break same-month ties with the issue number as
// a minutes offset, so readers that sort by pubDate keep numeric order.
const MONTHS = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function pubDateFor(issue) {
  const m = issue.date.match(/^(\w+)\s+(\d{4})$/);
  if (!m || !(m[1] in MONTHS)) {
    throw new Error(`rss.xml: unparseable date "${issue.date}" on issue #${issue.slug}`);
  }
  return new Date(Date.UTC(Number(m[2]), MONTHS[m[1]], 1, 0, Number(issue.slug)));
}

export async function GET(context) {
  return rss({
    title: 'CTRL+WATCH Magazine',
    description: 'Your algorithm is broken. We\'re the fix.',
    site: context.site,
    items: issues
      .filter((i) => i.published)
      .sort((a, b) => Number(b.slug) - Number(a.slug))
      .map((issue) => ({
        title: `${issue.number} — ${issue.title}`,
        pubDate: pubDateFor(issue),
        description: issue.subtitle,
        link: `/issues/${issue.slug}/`,
      })),
  });
}
