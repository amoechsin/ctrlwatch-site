---
name: ctrlwatch-top50-updater
description: "Manages all Top 50 ranking logic for CTRL+WATCH magazine - entry, movement, displacement, drops, re-evaluations, and tie-breaking. Use this skill whenever updating the Top 50 table, deciding if a new channel enters or displaces another, calculating rank movements, or writing the editorial notes for the HIGH SCORES section. If the user asks about Top 50 changes, rank movements, what gets dropped, or how to handle a tie, read this skill first."
---

# CTRL+WATCH — Top 50 Updater Skill

## The Top 50 — What It Is

The master ranking of YouTube channels. Updated every issue. The most contested section of the magazine — scores generate more reader mail than anything else.

**Hard rules:**
- Exactly 50 entries at all times. No more, no fewer.
- Every new entry displaces an existing one.
- Drops must be justified, not arbitrary.
- Movement indicators are mandatory on every row.

---

## Movement Indicators

Every row in the Top 50 table carries a movement indicator. No exceptions.

| Indicator | Meaning | Color |
|-----------|---------|-------|
| `NEW` | First appearance in Top 50 | Cyan, bold |
| `↑N` | Moved up N positions | Green |
| `↓N` | Moved down N positions | Orange |
| `—` | No change in position | Dim grey |
| `RE-EVAL` | Score changed via re-evaluation | Magenta, with old score noted |

**Calculating N:** Count positions from previous issue to current position. If a channel was #23 and is now #19, indicator is `↑4`.

**Displacement movement:** When new channels enter, every channel ranked below them shifts down by one for each new entry. These all get movement indicators even if their score didn't change.

---

## Entry Criteria

A reviewed channel is a **candidate** for the Top 50 if it scores 80+. Entry is not automatic.

### Entry Decision Checklist
- [ ] Score is 80 or above
- [ ] Channel is more deserving of a Top 50 place than the current #50
- [ ] If the channel scores below the current #50, it does not enter (regardless of verdict)
- [ ] If the channel scores equal to the current #50, editorial judgement applies (see tie-breaking)

**The entry threshold is state, not a rule — read it from the tracker.** The 80+ candidate floor above is fixed, but the actual cut line (the score the current #50 holds) moves every issue. Read the current #50 score and stated entry threshold from the tracker's TOP 50 section before deciding entry. (As of Post-#014: entry threshold is **84**, #50 is Wendover Productions at 84, and 83 no longer enters.)

Boss Fight channels follow the same rules — both winner and loser receive scores that are evaluated for entry.

---

## Drop Criteria

When a new channel enters, one must leave. Use this priority order to identify the drop candidate:

### Priority 1 — Stalled Output
Channel has significantly reduced upload frequency with no sign of return. Previously active channels that have gone quiet. This is the most common and least controversial drop reason.

### Priority 2 — Ceiling Apparent
Channel has been in the Top 50 for multiple issues with no score improvement and no trajectory suggesting upward movement. The channel has reached its ceiling and stronger entries deserve the spot.

### Priority 3 — Quality Decline
Documented in the tracker or observable from content — the channel is producing noticeably worse content than when it entered. Should align with a score that would no longer merit Top 50 placement.

### Priority 4 — Controversy / Ethical Concern
Requires specific documented reason. Not to be used for mild criticism or personal dislike. Previous example: MKBHD dropped Issue #011 for product conflict-of-interest disclosures.

### Priority 5 — Displaced by Merit
When multiple strong new entries arrive, weaker channels at the bottom of the Top 50 may be displaced purely because stronger channels exist. This is the weakest justification — use sparingly and always acknowledge it.

---

## Tie-Breaking

When two channels have the same overall score:

1. **X-Factor** — higher X-Factor score ranks higher
2. **Content Quality** — higher Content Quality score ranks higher
3. **Trajectory** — channel on upward trajectory ranks above plateau
4. **Longevity** — if all else equal, longer-established channel holds position

Document tie-breaking decisions in the editorial notes.

---

## Re-Evaluation Impact on Rankings

When a channel is re-evaluated:
- New score replaces old score immediately
- Rank recalculated from scratch based on new score
- Movement indicator reflects the full rank change from pre-re-evaluation position
- Label with `RE-EVAL` in addition to `↑N` or `↓N`

**All-time re-evaluation records (do not contradict without editorial note):**
| Channel | Score Change | Rank Change | Issue |
|---------|-------------|-------------|-------|
| Adam Neely | 84→91 | ↑33 to #5 | #010 — ALL-TIME RECORD |
| JCS Criminal Psychology | 73→86 | ↑29 to #14 | #007 |
| Johnny Harris | ~79→64 | DROPPED | #011 — downward |

---

## Score Consistency Rules

The Top 50 is a living record — scores must be internally consistent.

- A channel ranked #3 (score 92) must score higher than a channel ranked #10 (score 90). If two channels share a score, tie-breaking determines rank order but both scores remain valid.
- Never assign a score that contradicts the existing table without a re-evaluation. If Kurzgesagt is at 94 and you're reviewing a similar channel, calibrate against that anchor.
- Scores at the top are compressed (90–96 range covers 10 channels). This is intentional — ESSENTIAL is rare.

---

## Top 50 Table — HTML Format

Full table, all 50 rows, in the HIGH SCORES section. No truncation.

```html
<table class="top50-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Channel</th>
      <th>Score</th>
      <th>Genre</th>
      <th>Movement</th>
    </tr>
  </thead>
  <tbody>
    <tr class="top3">
      <td class="rank">1</td>
      <td class="channel-name">3Blue1Brown</td>
      <td class="score">96</td>
      <td class="genre">Mathematics / Education</td>
      <td class="movement no-change">—</td>
    </tr>
    <!-- ... all 50 rows ... -->
  </tbody>
</table>
```

**Special row classes:**
- `.top3` — ranks 1–3, slightly brighter background
- `.new-entry` — cyan left border
- `.moved-up` — subtle green tint
- `.moved-down` — subtle orange tint

---

## Editorial Notes Section

After the Top 50 table, a mandatory editorial notes block covers:

1. **New entries** — brief case for why each new channel earned its place
2. **Notable drops** — brief explanation, not defensive
3. **Big movers** — any channel moving 5+ positions gets a note
4. **Re-evaluations** — context on score changes
5. **Points of controversy** — if a score is likely to generate reader mail, acknowledge it here proactively

Length: 100–200 words per notable event. This section is where the magazine demonstrates it takes its own rankings seriously.

---

## Current Top 50 State — Read From the Tracker

**Do NOT hardcode the table in this skill.** The live ranking lives in the continuity tracker under **TOP 50 — CURRENT STATE (Post-Issue #0XX)**, with full scores, genres, and last-movement indicators. Read it there before calculating any movement. (This section previously froze a Post-#011 table that was still here long after #014 shipped — exactly the staleness the continuity-checker design principle warns against.)

When you read it, capture: the full ordered list, each channel's score, the current entry threshold (the #50 score), and any tier-compression notes. As of Post-#014 the threshold is **84** and the 84-tier holds the bottom seven spots — but confirm against the tracker every time, never this paragraph.

---

## Quality Check

Before finalising the Top 50 for any issue:

- [ ] Exactly 50 entries — count them
- [ ] Every row has a movement indicator
- [ ] New entries displace the correct number of existing entries
- [ ] Drop justifications documented in editorial notes
- [ ] Scores are internally consistent (no rank inversions without tie-breaking note)
- [ ] Re-evaluations labelled correctly
- [ ] Top 3 rows have special styling in HTML
- [ ] Editorial notes cover all new entries, drops, and big movers
- [ ] Entry threshold re-established (what score does the new #50 hold?)


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
