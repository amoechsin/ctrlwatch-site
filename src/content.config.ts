import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { VERDICTS as CANONICAL_VERDICTS, verdictFor } from './lib/verdict-bands.mjs';

// Canonical Player Profile reviews. One markdown file per channel; the
// filename (kebab-case) is the slug and MUST match the channel's slug in
// src/data/creators.json (the slug source of truth) so /top50/ and ItemList
// links resolve. The zod schema encodes the ctrlwatch-player-profile rubric so
// a malformed review fails the build rather than shipping bad structured data.

// Typed tuple for z.enum; the band logic itself lives in
// src/lib/verdict-bands.mjs (shared with build-creators.mjs). The assertion
// makes any drift between the two lists fail the build immediately.
const VERDICTS = [
  'ESSENTIAL',
  'EXCELLENT',
  'GOOD',
  'AVERAGE',
  'MEDIOCRE',
  'GAME OVER',
] as const;
if (VERDICTS.join('|') !== CANONICAL_VERDICTS.join('|')) {
  throw new Error(
    'content.config.ts VERDICTS is out of sync with src/lib/verdict-bands.mjs',
  );
}

// Verdict band per the rubric (CLAUDE.md / ctrlwatch-player-profile).
function verdictForScore(score: number): (typeof VERDICTS)[number] {
  return verdictFor(score) as (typeof VERDICTS)[number];
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

// Canonical concept / framework pages — the AEO moat at /concepts/[slug]/.
// One markdown file per framework; the zod schema enforces the fields the
// DefinedTerm + Article JSON-LD needs. Filename = slug (kebab-case noun form).
const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: z.object({
    // Display name of the concept (H1 + DefinedTerm.name).
    term: z.string(),
    // One-sentence plain-language definition — feeds meta description and
    // DefinedTerm.description. ≤155 so it works as a SERP snippet.
    definition: z.string().max(155),
    // Optional title-tag override; defaults to `${term} | CTRL+WATCH`.
    title: z.string().optional(),
    originatingIssue: z.string().regex(/^#\d{3}$/),
    // "DepthCharge, Lagos" for his frameworks; "CTRL+WATCH editorial" otherwise.
    attribution: z.string(),
    related: z.array(z.string()).max(6).default([]),
    updated: z.coerce.date(),
    // Hub-page sort order (lower = higher).
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

// Canonical Boss Fight pages — head-to-head matchups at /vs/[a]-vs-[b]/
// (alphabetical). channelA/channelB and their scores are stored in
// alphabetical order; `winner` says which took the fight. The dual scorecard
// renders from the scores; the comparative prose is the markdown body.
const fiveAxis = z.object({
  contentQuality: score,
  consistency: score,
  replayValue: score,
  community: score,
  xFactor: score,
  overall: score,
});

const bossFights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vs' }),
  schema: z.object({
    channelA: z.string(),
    channelB: z.string(),
    // Review slugs, when a canonical Player Profile exists (else omit — no 404s).
    slugA: z.string().optional(),
    slugB: z.string().optional(),
    category: z.string(),
    winner: z.enum(['A', 'B']),
    scoresA: fiveAxis,
    scoresB: fiveAxis,
    description: z.string().max(155),
    title: z.string().optional(),
    originatingIssue: z.string().regex(/^#\d{3}$/),
    related: z.array(z.string()).max(6).default([]),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { reviews, concepts, bossFights };
