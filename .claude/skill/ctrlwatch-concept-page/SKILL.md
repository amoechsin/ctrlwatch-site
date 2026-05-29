---
name: ctrlwatch-concept-page
description: Builds canonical concept/framework pages for CTRL+WATCH — the evergreen URLs at /concepts/[slug]/ where original frameworks (Collision Channels / Type 7, Type 8 The Wrapped Confession, the Comedy Tax, scoring rubric, Hidden Levels, future DepthCharge taxonomies) live as standalone authority assets. Use this skill ANY time the user asks to write, draft, build, formalize, migrate, or extract a concept page, framework page, definition page, taxonomy entry, glossary entry, or "what is [framework]" page; whenever a new framework is invented in an issue and needs a permanent home; or when promoting an in-issue explanation to a canonical URL. Concept pages power CTRL+WATCH's AEO strategy — they are how ChatGPT, Perplexity, and Google AI Overviews cite the magazine as the origin of its YouTube taxonomy. Do NOT use for Player Profiles, Boss Fights, Top 50s, full issue HTML, criticism essays, or Time Capsule pieces — those have their own skills. Read this skill BEFORE writing any standalone concept, framework, taxonomy, or definition page.
---

# CTRL+WATCH Concept Page

Generates the evergreen definitional pages at `/concepts/[slug]/`. These are CTRL+WATCH's highest-leverage AEO assets — the pages AI engines cite when asked to define terms the magazine invented.

## When this fires

Trigger on requests for:
- A new concept page for a framework just introduced in an issue
- Migration of an in-issue framework section to a canonical URL
- A definitional page for an existing concept (Collision Channels = Type 7: The Collision; Type 8: The Wrapped Confession; Comedy Tax; scoring rubric; Hidden Levels; future DepthCharge contributions)
- A glossary entry or taxonomy entry for the site

Do NOT fire for trend-piece essays, individual channel coverage, comparisons, rankings, or fictional-interview content — those route to their respective skills.

## The two competing jobs

A concept page does two things that pull in opposite directions:

1. **Magazine essay** — keep the voice that gives CTRL+WATCH its editorial moat
2. **AEO-extractable definition** — give AI models a clean citation they can pull

The reconciliation: load the definitional payload into the first paragraph (40–80 words), then let the rest breathe as a magazine essay. The opening must define the concept cleanly enough that an AI model can quote it without losing meaning. Everything after can be voice.

## Required structure

Every concept page has these blocks in this order:

**1. Definitional lede (40–80 words)**
- First sentence: term + one-clause definition
- Following 2–3 sentences: the conceptual shape, no examples yet
- Precise, slightly authoritative, essay register
- This is the block AI models extract

**2. Origin / attribution (1 paragraph)**
- When CTRL+WATCH first used the term
- Originating issue (with internal link)
- Who proposed it: **DepthCharge** for Type 7: The Collision (proposed #009, formalized #012) and Type 8: The Wrapped Confession (#014) — the Collision framework is DepthCharge's, credited in-issue, NOT an editorial-board concept; the editorial board for the Comedy Tax, scoring rubric, and Hidden Levels; named attribution for future contributions

**3. The mechanics (2–4 paragraphs)**
- What makes something fit the framework
- The shape of the thing in detail
- Argument, not bullet points

**4. Exemplars (3–6 channels)**
- Each: 1–2 sentences explaining how it fits
- Internal link to the canonical Player Profile of each exemplar
- Mix obvious cases and surprising ones

**5. The boundary (1 paragraph)**
- What looks like the concept but isn't
- Common misapplications — this is where the term is protected from dilution

**6. Closing (1 short paragraph)**
- Why the framework matters for understanding YouTube as a medium
- No CTA; the editorial voice doesn't beg for engagement

## Voice rules

- Magazine-essay register, not blog post
- First-person plural ("we") allowed when it represents editorial position
- Yob does NOT appear on concept pages — Yob is for Yob's Save Point
- DepthCharge credited where his frameworks; otherwise attribution is editorial
- Do NOT define by metaphor in the lede — define first, metaphor later if at all
- Do NOT open with "imagine if..." or "you've probably noticed..."
- Do NOT use rhetorical questions in the lede

## URL convention

Path: `/concepts/[slug]/`

Slug rules:
- kebab-case
- noun form ("collision-channels" not "what-are-collision-channels")
- 2–4 words
- never includes year or issue number

Examples:
- `/concepts/collision-channels/` (Type 7: The Collision)
- `/concepts/the-comedy-tax/`
- `/concepts/type-8-wrapped-confession/` (Type 8: The Wrapped Confession)
- `/concepts/scoring-rubric/`
- `/concepts/hidden-levels/`

**Canonical taxonomy numbering (do not get this wrong — it is an AEO citation asset):** per the verified continuity tracker and the printed #012/#014 issues, **Type 7 = The Collision** (DepthCharge, proposed #009, formalized #012) and **Type 8 = The Wrapped Confession** (DepthCharge, #014). Never label the Wrapped Confession "Type 7."

## Required SEO/AEO outputs

Every concept page output MUST include the following alongside the body content. Outputs missing this block are incomplete.

**Title tag (≤60 chars)**
- Format: `[Concept] | CTRL+WATCH`
- Example: `Collision Channels | CTRL+WATCH`
- Longer variant for compound names: `The Comedy Tax — A YouTube Taxonomy | CTRL+WATCH`

**Meta description (≤155 chars)**
- One-sentence plain-language definition
- Must read naturally as a SERP snippet
- Example: `A collision channel is a YouTube creator whose subject is the inseparable synthesis of two or more disciplines. Coined by CTRL+WATCH, Issue #012.`

**Schema (JSON-LD)** — include both DefinedTerm and Article:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DefinedTerm",
      "@id": "https://ctrl-watch.xyz/concepts/[slug]/#term",
      "name": "[Concept Name]",
      "description": "[One-sentence definition from the lede]",
      "inDefinedTermSet": "https://ctrl-watch.xyz/concepts/",
      "termCode": "[slug]"
    },
    {
      "@type": "Article",
      "headline": "[Concept Name]",
      "datePublished": "[ISO date]",
      "dateModified": "[ISO date]",
      "author": { "@type": "Organization", "name": "CTRL+WATCH" },
      "publisher": { "@type": "Organization", "name": "CTRL+WATCH" },
      "about": { "@id": "https://ctrl-watch.xyz/concepts/[slug]/#term" },
      "mainEntityOfPage": "https://ctrl-watch.xyz/concepts/[slug]/"
    }
  ]
}
```

**Internal links (3–7 targets):**
- Originating issue: 1 link
- Exemplar Player Profiles: 3–6 links (one per channel mentioned)
- Related concepts: 1–2 links (Collision Channels/Type 7 ↔ Type 8 Wrapped Confession, etc.)
- The `/concepts/` hub: 1 link

## Length

700–1400 words for the body. Shorter than a Player Profile, longer than a glossary entry. If a concept needs more than 1400 words, it's probably two concepts.

## Pre-publish checklist

- Definitional lede defines the term cleanly — read aloud, does an AI get a clean answer from the first 40–80 words?
- All exemplars exist as canonical Player Profiles, or are explicitly noted as forthcoming
- Originating issue link correct
- Schema JSON-LD validates at https://validator.schema.org/
- Title and meta description within character limits
- Page added to `/concepts/` hub index

## Anti-patterns

- "What is [concept]?" as the H1 — too generic, breaks voice
- Bullet-point definitions in the lede — fragments the AI citation
- Forced FAQ section at the bottom
- Defining by example list without describing the mechanic
- Apologetic hedging ("of course, this is just one way...")
- Repeating the lede definition verbatim in the closing
