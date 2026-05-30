import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Canonical Player Profile reviews. One markdown file per channel; the
// filename (kebab-case) is the slug and MUST match the channel's slug in
// src/data/creators.json (the slug source of truth) so /top50/ and ItemList
// links resolve. The zod schema encodes the ctrlwatch-player-profile rubric so
// a malformed review fails the build rather than shipping bad structured data.

const VERDICTS = [
  'ESSENTIAL',
  'EXCELLENT',
  'GOOD',
  'AVERAGE',
  'MEDIOCRE',
  'GAME OVER',
] as const;

// Verdict band per the rubric (CLAUDE.md / ctrlwatch-player-profile).
function verdictForScore(score: number): (typeof VERDICTS)[number] {
  if (score >= 90) return 'ESSENTIAL';
  if (score >= 80) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 60) return 'AVERAGE';
  if (score >= 50) return 'MEDIOCRE';
  return 'GAME OVER';
}

const score = z.number().int().min(0).max(100);

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z
    .object({
      channel: z.string(),
      creator: z.string().optional(),
      // The "~1.5M subs · format · cadence" dateline under the title.
      dateline: z.string().optional(),
      genre: z.string(),
      axes: z.object({
        contentQuality: score,
        consistency: score,
        replayValue: score,
        community: score,
        xFactor: score,
      }),
      overall: score,
      verdict: z.enum(VERDICTS),
      pullQuote: z.string(),
      // Issue tag where this review first appeared, e.g. "#014".
      originatingIssue: z.string().regex(/^#\d{3}$/),
      // Related canonical review slugs (2–4) for internal linking.
      related: z.array(z.string()).max(6).default([]),
      // Optional score history for re-evaluated channels.
      history: z
        .array(z.object({ issue: z.string(), score, verdict: z.enum(VERDICTS) }))
        .default([]),
      updated: z.coerce.date(),
      draft: z.boolean().default(false),
    })
    // Enforce the rubric: the stated verdict must match the overall score's
    // band. Catches authoring drift (and the verdict errors found in
    // creators.json) at build time.
    .refine((d) => d.verdict === verdictForScore(d.overall), {
      message: 'verdict does not match the score band for `overall`',
      path: ['verdict'],
    }),
});

export const collections = { reviews };
