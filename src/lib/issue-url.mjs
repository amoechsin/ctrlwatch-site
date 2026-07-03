/**
 * Tracker issue-tag → canonical issue URL. Single source for the six former
 * per-file copies — three of which omitted TRACKER_ALIASES and silently
 * mismapped #004C (the unpublished Craft variant) to /issues/004/.
 */

import { issues } from '../data/issues.js';

// #004 exists in two tracker versions: #004S (Spectacle) shipped as the
// canonical /issues/004/; #004C (Craft) was never published and must not link.
export const TRACKER_ALIASES = {
  '#004S': '004',
  '#004C': null,
};

export const publishedSlugs = new Set(
  issues.filter((i) => i.published).map((i) => i.slug),
);

/** Pure core — pass your own Set of published slugs (used by tests). */
export function issueUrlFor(tag, slugs) {
  if (tag in TRACKER_ALIASES) {
    const aliased = TRACKER_ALIASES[tag];
    return aliased && slugs.has(aliased) ? `/issues/${aliased}/` : null;
  }
  const stripped = tag.replace(/^#/, '').replace(/[A-Za-z]+$/, '');
  return slugs.has(stripped) ? `/issues/${stripped}/` : null;
}

/** Bound to the real issues.js published set. */
export function issueUrl(tag) {
  return issueUrlFor(tag, publishedSlugs);
}
