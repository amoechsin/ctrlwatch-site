---
name: ctrlwatch-player-profile
description: Generates Player Profile channel reviews for CTRL+WATCH magazine. Use this skill whenever writing, scoring, or refining any channel review — including standard reviews, negative reviews, re-evaluations, and Boss Fight scorecards. Covers the full scoring rubric with category definitions, verdict thresholds, weighting rules, pull quote standards, negative review tone protocol, and re-evaluation criteria. Must be read before writing any Player Profile or channel score. If the user asks to review a channel, assign a score, update a rating, or write a negative review, read this skill first.
---

# CTRL+WATCH — Player Profile Skill

## What a Player Profile Is

A full channel review: 700–1,000 words of serious criticism plus a scored card. The review must feel like it was written by someone who watched **every significant video on the channel** — not a sample, not a Wikipedia summary.

The goal is a score controversial enough to generate discussion but impossible to dismiss.

---

## Scoring System

### Five Categories

| Category | What It Measures | Weight |
|----------|-----------------|--------|
| **Content Quality** | Originality, depth, craft, production value, research quality | **High** |
| **Consistency** | Upload frequency, schedule reliability, quality variance | Normal |
| **Replay Value** | Do you rewatch? Do videos hold up over time? Are they evergreen? | Normal |
| **Community** | Comment quality, audience culture, creator-community relationship | Normal |
| **X-Factor** | The intangible. Voice, personality, the thing that makes this channel irreplaceable | **High** |

**Weighting in practice:** Content Quality and X-Factor together should account for more than half the overall score's "feel." A channel with mediocre Consistency but transcendent Content Quality and X-Factor should score high (see: Clickspring, 88, Consistency 62).

### Scoring Each Category

Score each category 0–100. The overall score is a weighted aggregate, not a straight average.

**Scoring anchors:**
- **95–100:** Best-in-class. Definitively the standard for this category.
- **85–94:** Excellent. Notably above average. Real strengths.
- **70–84:** Good. Solid. Some limitations.
- **55–69:** Average to below-average. Meaningful weaknesses.
- **40–54:** Mediocre. Problems outweigh strengths in this category.
- **Below 40:** Serious failure in this category.

### Verdict Thresholds

| Overall Score | Verdict |
|---------------|---------|
| 90–100 | **ESSENTIAL** |
| 80–89 | **EXCELLENT** |
| 70–79 | **GOOD** |
| 60–69 | **AVERAGE** |
| 50–59 | **MEDIOCRE** |
| Below 50 | **GAME OVER** |

**ESSENTIAL is the magazine's highest honour.** Do not award it without specific justification for why this channel is irreplaceable. The live ESSENTIAL roster (90+) is whatever the tracker's TOP 50 currently shows — read it there, don't trust a hardcoded list. As of Post-#014 there are twelve: 3Blue1Brown (96), Kurzgesagt (94), Every Frame a Painting (92), Primitive Technology (91), Jacob Geller (91), Adam Neely (91), CGP Grey (91), Lemmino (91), Jenny Nicholson (91), Fireship (90), Dan Carlin (90), Townsends (90).

---

## Review Structure

### 1. Opening Hook (1–2 paragraphs)
Capture the channel's essence immediately. This is not a description — it's a thesis. What is this channel, in the deepest sense?

Good opening pattern: start with a scene, an analogy, or a bold claim. Never start with "Channel X is a YouTube channel that..."

### 2. What It Does (2–3 paragraphs)
Explain the channel's content, format, and approach with specificity. Reference actual videos or series by name. Name the creator if they're the channel's face. Establish context.

### 3. What It Does Extraordinarily Well (2–3 paragraphs)
The strongest case for the channel. This section earns the score. Be specific — general praise is meaningless.

### 4. Where It Falls Short (1–2 paragraphs)
Even high-scoring channels have weaknesses. Name them. A review without criticism is a press release.
- For ESSENTIAL channels: minor limitation or a constraint of the format
- For EXCELLENT channels: real but non-fatal weakness
- For GOOD and below: significant, specific critique

### 5. Scorecard
See scorecard format below.

### 6. Closing Statement (1 paragraph)
The verdict's emotional case. Why does this channel matter? Or: why is this damage to the medium? End with a pull quote.

---

## The Pull Quote

Every review must contain at least one pull quote — a sentence so good it could be extracted and still mean something.

**Pull quote criteria:**
- Specific to this channel, not generic
- Contains an opinion, not a description
- Could be argued with (generates discussion)
- Reads differently depending on whether you love or hate the channel

**Good pull quote patterns:**
- "[Channel] is what happens when [condition that's rare] meets [other condition that's rare]."
- "The question [Channel] has never answered is [question] — and that's starting to show."
- "In ten years, [Channel] will be cited as [claim]. Whether that's a compliment is the question."
- "Nobody else is doing this. That's the whole case."

**Bad pull quote patterns (avoid):**
- "[Channel] is one of YouTube's best channels." (too generic)
- "You should watch this." (not a pull quote, it's a recommendation)
- Anything that could apply to another channel with a name swap

---

## Scorecard HTML Format

```html
<div class="score-card">
  <div class="score-header">
    <span class="channel-name">[CHANNEL NAME]</span>
    <span class="overall-score">[XX]</span>
  </div>
  <div class="score-bars">
    <div class="category">
      <span class="cat-label">Content Quality</span>
      <div class="bar-track"><div class="bar-fill" style="width:[XX]%"></div></div>
      <span class="cat-score">[XX]</span>
    </div>
    <!-- repeat for all 5 categories -->
  </div>
  <div class="verdict-banner [verdict-class]">[VERDICT]</div>
</div>
```

Verdict CSS classes: `verdict-essential`, `verdict-excellent`, `verdict-good`, `verdict-average`, `verdict-mediocre`, `verdict-gameover`

---

## Negative Review Protocol

**The negative review is a structural requirement.** Every 2–3 issues must include at least one review below 70 — that means AVERAGE (60–69) or worse, not only MEDIOCRE. Check the continuity tracker's NEGATIVE REVIEW TRACKER before planning an issue.

The counter resets with each below-70 review. Do not hardcode its value here — read the current counter and any **MANDATORY in #0XX** flag from the tracker. (As of Post-#014: last negative was #012, Nas Daily at 52; counter at 2; a negative review is **MANDATORY in #015**, no further deferral.)

### What a Negative Review Is Not
- Cruelty
- Personal attacks on the creator
- Dismissal without evidence
- Contempt for the medium

### What a Negative Review Is
- Evidence-based criticism from a position of genuine care for YouTube
- A specific argument about why this channel fails its audience or the medium
- Fair acknowledgment of what the channel does well, where applicable
- A score that can be defended in detail

### Negative Review Categories

**GAME OVER (below 50):** Reserved for channels that are actively harmful to the medium — content mills, misinformation, exploitative formats. Requires specific evidence for why this is beyond redemption. Previous: Ryan's World (42), WatchMojo (42), Bright Side (28), PragerU (22).

**MEDIOCRE (50–59):** Channels that started with potential but have algorithmically calcified, pivoted soullessly, or simply stopped trying. Still watchable in small doses but not recommended. Previous: React Media/FBE (52), Nas Daily (52), Davie504 (55).

**AVERAGE (60–69):** Channels with genuine strengths but serious structural problems. Not bad, not good. Previous: HasanAbi (68), Johnny Harris (64 re-eval), penguinz0 (65 re-eval).

### Tone Calibration for Negative Reviews

The criticism should feel like it comes from **disappointment**, not contempt. The critic loved what this channel could have been, or used to be. The standard is high because the medium deserves more.

One specific technique: name one thing the channel does well, genuinely. Then explain why even that strength is undermined by the larger failure.

---

## Re-Evaluation Protocol

Re-evaluating a previously scored channel is rare and must be justified. It signals that something significant has changed — for better or worse.

### When to Re-Evaluate
- Substantial change in output quality (up or down)
- Channel trajectory has dramatically shifted
- Previous score is no longer defensible given accumulated evidence
- Editorial call — methodology critique, ethical concern

### Re-Evaluation Rules
1. State the original score and issue explicitly in the review
2. Explain specifically what has changed
3. New score must move at least 5 points to justify a re-evaluation (otherwise it's not a re-evaluation, it's a clarification)
4. Re-evaluation reviews are typically shorter (500–700 words) — the context is already established

### Record-Keeping
All-time re-evaluation records (check tracker for current state):
- Adam Neely: 84→91, ↑33 to #5 — all-time record (Issue #010)
- JCS Criminal Psychology: 73→86, ↑29 (Issue #007)
- Johnny Harris: ~79→64 — downward re-evaluation (Issue #011)

---

## Top 50 Integration

Every reviewed channel that scores 80+ is a Top 50 candidate. Entry is not automatic — if the Top 50 is full, something must drop.

**Drop criteria (in rough priority order):**
1. Upload pace has stalled significantly
2. Score ceiling has become apparent — the channel has fully plateaued
3. A stronger new entry makes displacement defensible
4. Controversy or quality decline (documented)

Every Top 50 change must include a movement indicator: `↑N`, `↓N`, `—`, `NEW`, or `DROPPED`.

---

## Continuity Checks

Before writing any Player Profile:

- [ ] Channel has not been reviewed before (check tracker Channel Reviews section)
- [ ] If it has been reviewed: this is an intentional re-evaluation, with documented reason
- [ ] Score is consistent with comparable channels already in the tracker
- [ ] Top 50 implications considered (entry, movement, displacement)
- [ ] Negative review quota checked — is one needed this issue?
- [ ] Pull quote drafted and tested (would this be worth screenshotting?)

---

## Common Failure Modes

| Failure | Fix |
|---------|-----|
| Review could describe any channel in the genre | Add specific video/series references throughout |
| Score not justified — praise/criticism doesn't add up | Rebuild the category-by-category case first, derive overall score from that |
| Criticism absent from high-scoring review | Every channel has a weakness — find the real one |
| Negative review reads as contemptuous | Rewrite opening to establish genuine understanding of what the channel was trying to do |
| Pull quote is generic | Run the "name swap" test — if another channel could replace the name, rewrite it |
| X-Factor undefined | X-Factor must be named specifically — what is the one thing this channel has that no other channel has? |


## Required SEO/AEO outputs

Every output from this skill MUST include the following metadata block alongside the content. Outputs missing this block are incomplete. This is how CTRL+WATCH content becomes canonical, citable, and discoverable in both classical search and AI engines.

### Canonical URL

Recommend the canonical URL path using the convention in the per-skill mapping below. Slug rules: kebab-case, no year, no issue number unless the asset is intrinsically per-issue (Top 50 archive snapshots, issue pages themselves).

### Title tag (≤60 chars including ` | CTRL+WATCH` suffix)

Magazine voice intact. No clickbait. The brand suffix counts toward the limit. Use the per-skill format below.

### Meta description (≤155 chars)

One sentence, magazine voice, reads naturally as a SERP snippet. Includes the central claim or verdict where one exists. Avoid emoji, all-caps, exclamation marks.

### Schema (JSON-LD)

Use the schema type specified in the per-skill mapping below. Include the JSON-LD block in the output, ready to drop into the page `<head>`. Always include `@context: "https://schema.org"`.

### Internal link targets (3–7 URLs)

List the canonical URLs this page should link to outbound:
- Pillar/hub page for the asset type
- 2–4 related canonical pages (similar channels, prior matchups, related rankings)
- Originating issue (if applicable)
- 1–2 concept pages from `/concepts/` if the content invokes a framework

### Canonical separation from issues

Issues at `/issues/[NNN]/` contain reviews, boss fights, and concept references but ARE NOT the canonical home of those assets. Each Player Profile, Boss Fight, and Concept Page has its own canonical URL. Within an issue, each section must link OUT to its standalone canonical URL, not to an in-issue anchor. The issue page's `rel="canonical"` points to itself only for the issue as a whole.

### Per-skill mapping

| Skill | URL pattern | Schema type | Title tag format |
|---|---|---|---|
| player-profile | `/reviews/[channel-slug]/` | `Review` + `aggregateRating` (5-axis score) + `Person` (creator) + `creativeWorkReviewed` (channel as CreativeWork) | `[Channel] Review — Score N/100 \| CTRL+WATCH` |
| boss-fight | `/vs/[channel-a]-vs-[channel-b]/` (alphabetical) | `Article` with `about` referencing both channels; optionally `ComparativeArticle` if rendered | `[Channel A] vs [Channel B] — Boss Fight \| CTRL+WATCH` |
| time-capsule | `/criticism/time-capsule/[figure-slug]/` | `Article` + `CreativeWork`. Do NOT use `Person` schema — content is fictional and attributing fictional quotes to real figures via Person schema misrepresents authorship | `[Figure] on YouTube — Time Capsule \| CTRL+WATCH` |
| top50-updater | Live: `/top50/` (canonical, always-current). Archived: `/top50/history/[issue]/` with `rel="canonical"` pointing to `/top50/` | `ItemList` with `ListItem` entries, each `item` linking to the canonical Player Profile URL | `Top 50 YouTube Channels — [Month Year] \| CTRL+WATCH` |
| html-generation (issue pages) | `/issues/[NNN]/` | `Article` (the issue as a whole) + `hasPart` referencing the canonical URL of each section | `Issue #[NNN] — [Issue Title] \| CTRL+WATCH` |

### Validation before publish

- Schema validates at https://validator.schema.org/
- Title and meta description within character limits
- All internal link targets resolve (no dead canonical URLs)
- For Player Profiles: aggregateRating values match the 5-axis scores in the body
- For Top 50: every ListItem.item URL points to a real canonical Player Profile (or is noted as forthcoming)
- For issue pages: every section that has a canonical home elsewhere links OUT to that canonical, not to an in-issue anchor
