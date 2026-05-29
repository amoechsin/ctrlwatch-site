---
name: ctrlwatch-continuity-checker
description: "Pre-generation checklist and protocol for CTRL+WATCH issues. Use this skill before planning or generating any new issue — it enforces the proposal-first workflow, ensures the continuity tracker is read, and blocks generation until all continuity conflicts are resolved. If the user asks to start a new issue, plan an issue lineup, or propose content for any CTRL+WATCH section, read this skill first. This is the gate that runs before ctrlwatch-html-generation."
---

# CTRL+WATCH — Continuity Checker Skill

## The Proposal-First Rule

**No HTML is generated until a full lineup is proposed and approved.**

This is non-negotiable. The workflow is always:
1. Read the continuity tracker
2. Propose full lineup
3. Get explicit approval (or targeted adjustments)
4. Generate HTML

If the user says "generate Issue #0XX" without specifying a lineup, do not start generating. Present a proposal first.

> **Single-word approval exception:** If the user replies with a bare approval ("approved", "go", "proceed") to a lineup that has *already* been proposed in this conversation, treat the lineup as locked and proceed to generation without re-proposing.

---

## Design Principle: Derive State From the Tracker, Never From This File

**This skill must not hardcode issue numbers, counters, deadlines, or pool sizes.**

Every one of those values changes after each issue and lives in the tracker. Earlier versions of this skill froze them inline (e.g. "last negative review was #011", "4 music figures remaining as of #011") and went stale within one issue. The fixed values below have been replaced with *lookups*: the checklist tells you **which tracker section to read**, and the rule is whatever that section currently says.

If you ever find yourself about to write or trust a specific issue number in a continuity rule, stop — go read it from the tracker instead.

---

## Step 1 — Read the Tracker

Before proposing anything, read the latest continuity tracker. The canonical, verified tracker lives in the repo at:
```
docs/continuity/CTRLWATCH_Continuity_Tracker.md
```

This is the single source of truth — it carries the `(VERIFIED)` header and a `Last Updated: ... (Post-Issue #0XX)` line stating the most recently completed issue. A per-issue snapshot is also committed at `public/issues/0XX/CTRLWATCH_Continuity_Tracker_VERIFIED_Post0XX.md`; these are byte-identical archives, not separate sources — always read `docs/continuity/` as the live copy.

**Do NOT read `.claude/tracker.md`** — it is a stale, deprecated tracker and will give you last-issue state.

If `docs/continuity/CTRLWATCH_Continuity_Tracker.md` is missing, check whether the tracker was provided in the conversation. If neither is available, tell the user and ask them to provide it before proceeding. Do not generate from memory, and do not fall back to values written into this skill.

---

## Step 2 — Run the Pre-Issue Checklist

Work through every item below. Each item names the tracker section to read. Flag any conflicts before proposing the lineup.

### Theme
- [ ] Theme is genuinely new — check **ISSUES ARCHIVE**
- [ ] Theme can support the required number of *eligible* Time Capsule subjects — cross-check against the pool warning (see Time Capsule below)
- [ ] Theme connects to any outstanding editorial commitments — check **NOTES & FLAGS FOR FUTURE ISSUES → Outstanding Editorial Commitments**

### Time Capsule
- [ ] All proposed subjects are absent from **TIME CAPSULE SUBJECTS — COMPLETE LIST**
- [ ] No subject appears in **⚠️ CRITICAL: DUPLICATE SUBJECTS FOUND**
- [ ] Mix of registers across the set (analytical, emotional, funny, dark, optimistic, ambivalent)
- [ ] At least one subject connects to the theme in a non-obvious way
- [ ] **Read the pool warning block** (e.g. "🚨 CRITICAL POOL WARNING") and the Time Capsule planning notes. Do not assume any category still has figures — confirm per-category from the tracker. If a category the theme depends on is marked **EXHAUSTED**, surface this *at proposal stage*.
- [ ] **Music figures are a protected reserve** — only propose them if the issue is music-adjacent, and only if the reserve still holds figures per the tracker.
- [ ] If the eligible pool can no longer support six fresh subjects, surface the structural decision to the user *before* proposing: (a) expand categories — visual artists, architects, athletes, non-Western historical figures, inventors/engineers; (b) draw from the music reserve only if music-adjacent; or (c) reduce the Time Capsule count to 4–5 for this issue.

### Boss Fight
- [ ] Proposed matchup is absent from **BOSS FIGHTS — COMPLETE LIST**
- [ ] Neither channel has appeared in any previous Boss Fight (check the same list, both columns)
- [ ] Prefer a matchup from the **Boss Fight Matchups — SAFE TO USE** list where one fits the theme
- [ ] Both channels have genuine merit — no mismatched fights
- [ ] Matchup connects to the theme

### Player Profiles
- [ ] No proposed channel appears in **CHANNEL REVIEWS — PLAYER PROFILES**
- [ ] Exception: an intentional re-evaluation — must be flagged explicitly with a reason and the prior score
- [ ] Scores are calibrated against comparable channels in the current **TOP 50** state and respect the current **entry threshold** stated in the tracker (do not assume a fixed threshold — read it)
- [ ] **Negative review quota — read the NEGATIVE REVIEW TRACKER:** the magazine requires a below-70 profile (AVERAGE 60–69 or worse — not only MEDIOCRE; the tracker counts AVERAGE scores like HasanAbi 68 and Johnny Harris 64 as negative reviews) on a regular cadence, and the deferral allowance is limited. Read the current counter and any explicit **MANDATORY in #0XX** flag. If the tracker marks a negative review mandatory for this issue, the lineup **must** include one — no further deferral. Do not rely on a remembered "last negative was issue #__".
- [ ] **Non-English Player Profile — read Outstanding Editorial Commitments:** a non-English-language profile is a standing per-issue commitment. Confirm the current status in the tracker and include one unless the tracker explicitly states the commitment has ended.
- [ ] **Other binding profile commitments:** check Outstanding Editorial Commitments for any deadline-bound promises (e.g. a sub-threshold-subscriber profile, a specific language/region promised to a named reader by a stated issue). Treat each as binding against its stated deadline and check this issue's number against it.

### Retro Ads
- [ ] No proposed concept matches any entry in the **RETRO ADS USED** table — scan the *entire* table, every issue, not just the most recent
- [ ] Any concept the tracker marks as **permanently retired** (flagged "DO NOT REUSE" / "retired in all forms") must not appear in any form — change the core mechanic, not just the name

### Game Over
- [ ] No proposed trend duplicates entries in **GAME OVER TRENDS USED** (scan the whole table)

### Editorial Commitments
- [ ] Read **NOTES & FLAGS FOR FUTURE ISSUES → Outstanding Editorial Commitments (Made in Print)** and the most recent issue's **Editorial Commitments — Status Update** table.
- [ ] For every commitment with status OUTSTANDING / ONGOING / NEW, check its stated deadline against this issue's number. If a deadline lands on or before this issue, the lineup must address it.
- [ ] Any in-print promise made via Yob's Save Point or editorial copy is a real obligation — treat "by #0XX" as a hard constraint, not a suggestion.
- [ ] Maintain credit continuity for reader-originated frameworks and any recurring fictional readers referenced in commitments.
- [ ] If a commitment cannot be met this issue, do not silently drop it — explicitly note in the proposal's CONTINUITY FLAGS that it is being deferred and to which issue.

---

## Step 3 — Format the Proposal

Present the full lineup before any generation. Use this exact format:

```
CTRL+WATCH ISSUE #0XX — THE [THEME] ISSUE
Proposal for approval

THEME
[2–3 sentences on what this theme explores and why now]

TIME CAPSULE ([N] subjects — note if fewer than 6 due to pool)
1. [Name] — [What they'll react to / angle]
...

BOSS FIGHT
[Channel A] vs [Channel B] — [Category]
[One sentence on why this matchup matters]

PLAYER PROFILES (4 reviews)
1. [Channel] — expected [VERDICT], ~[score] — [one line rationale]
2. [Channel] — expected [VERDICT], ~[score] — [rationale; flag if this is the mandatory negative]
3. [Channel] — expected [VERDICT], ~[score] — [rationale; flag if this is the non-English profile]
4. [Channel] — expected [VERDICT], ~[score] — [rationale; flag if this fulfils a deadline commitment]

SPECIAL FEATURE
[Title] — [One sentence description]

HIDDEN LEVELS (5 channels)
[Brief list — channel names and angles]

GAME OVER (5 trends)
[Brief list — trend names only at proposal stage]

RETRO ADS (3–5 concepts)
[Brief list — concept names only at proposal stage]

CONTINUITY FLAGS
- Negative review: [mandatory this issue? per tracker counter — yes/no, and which profile satisfies it]
- Non-English profile: [which profile satisfies it]
- Deadline commitments due this issue: [list, with which lineup item addresses each, or explicit deferral]
- Time Capsule pool: [any category exhausted / count reduced / reserve drawn]
- Any conflicts found and how resolved

Awaiting approval. State any changes or confirm to proceed.
```

---

## Step 4 — Handle Feedback

The user will either:
- **Approve** — proceed to HTML generation (load `ctrlwatch-html-generation` skill)
- **Make targeted adjustments** — update only the changed items, re-confirm the changed item only, then generate
- **Request alternatives** — propose replacements for flagged items only

Do not regenerate the entire proposal for minor changes. Acknowledge the change and confirm the updated item only.

---

## Conflict Resolution Guide

| Conflict Type | Resolution |
|---|---|
| Time Capsule subject already used | Replace with a figure from the tracker's "Safe to Use" list, respecting per-category exhaustion |
| Time Capsule pool too thin for 6 | Surface the (a/b/c) structural decision to the user at proposal stage; do not silently proceed |
| Boss Fight matchup already used | Select from the tracker's "Safe to Use" matchups list |
| Channel already reviewed | Either swap the channel or flag as an intentional re-evaluation with a reason and the prior score |
| Ad concept too similar to a retired one | Change the core mechanic, not just the name |
| Negative review mandatory per tracker | One profile in the lineup must score below 70; flag which one |
| Non-English profile missing | Add one; check the tracker's non-English candidate list for options |
| Deadline commitment due this issue | Incorporate it, or explicitly note deferral and the new target issue in CONTINUITY FLAGS |
| Music figure proposed for non-music issue | Flag — the music reserve is protected; recommend saving for a music-adjacent issue |

---

## Continuity Tracker Location

Always read from `docs/continuity/CTRLWATCH_Continuity_Tracker.md` (never `.claude/tracker.md`, which is deprecated). Treat it as read-only during the proposal/generation flow — never write changes to it here. All updates go through the `ctrlwatch-tracker-update` skill after issue generation.

---

## Handoff

On approval, load `ctrlwatch-html-generation` (plus the relevant content skills: `ctrlwatch-time-capsule`, `ctrlwatch-player-profile`, `ctrlwatch-boss-fight`, and `ctrlwatch-concept-page` whenever the lineup introduces or formalizes a framework). After generation, the post-issue update runs through `ctrlwatch-tracker-update` and `ctrlwatch-top50-updater` — this is not optional and does not wait to be asked.
