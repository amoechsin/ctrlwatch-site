---
name: ctrlwatch-tracker-update
description: "Generates the post-issue continuity update block for CTRL+WATCH after every issue is completed. This update must be produced automatically at the end of every issue generation - never wait to be asked. Covers the exact format and all required fields for the continuity update block that is appended to the master tracker. If an issue has just been generated, or the user asks for the continuity update, tracker update, or post-issue summary, read this skill first."
---

# CTRL+WATCH — Tracker Update Skill

## When This Runs

**Automatically, at the end of every completed issue.** Do not wait for the user to ask. The continuity update block is the final deliverable of every issue generation — as mandatory as the HTML file itself.

If for any reason the update was not produced at the end of an issue, produce it immediately when the user next engages with this project, before any other work begins.

---

## Update Block Format

Output the full block below, populated with the actual issue content. Every field is required. Do not omit sections even if they seem obvious.

````markdown
---

## CONTINUITY UPDATE — ISSUE #[NUMBER]: THE [THEME] ISSUE

### Time Capsule Subjects Added
| Person | Topics Covered |
|--------|----------------|
| [Name] | [What they reacted to — 1 sentence] |
| [Name] | [What they reacted to — 1 sentence] |
| [Name] | [What they reacted to — 1 sentence] |
| [Name] | [What they reacted to — 1 sentence] |
| [Name] | [What they reacted to — 1 sentence] |
| [Name] | [What they reacted to — 1 sentence] |

### Boss Fight Added
| Matchup | Winner | Score | Category |
|---------|--------|-------|----------|
| [Channel A] vs [Channel B] | [Winner] | [XX vs XX] | [Category] |

### Channel Reviews Added
| Channel | Score | Verdict | Top 50 | Notes |
|---------|-------|---------|--------|-------|
| [Name] | [XX] | [VERDICT] | [NEW #X / DROPPED / N/A] | [One-line note] |
| [Name] | [XX] | [VERDICT] | [NEW #X / DROPPED / N/A] | [One-line note] |
| [Name] | [XX] | [VERDICT] | [NEW #X / DROPPED / N/A] | [One-line note] |
| [Name] | [XX] | [VERDICT] | [NEW #X / DROPPED / N/A] | [One-line note] |

### Re-Evaluations (if any)
| Channel | Old Score | New Score | Rank Change | Reason |
|---------|-----------|-----------|-------------|--------|
| [Name] | [XX] | [XX] | [↑N / ↓N / DROPPED] | [Brief reason] |

### Boss Fight Channels (scores for Top 50)
| Channel | Score | Verdict | Top 50 |
|---------|-------|---------|--------|
| [Winner] | [XX] | [VERDICT] | [NEW #X / moved to #X] |
| [Loser] | [XX] | [VERDICT] | [NEW #X / moved to #X / N/A] |

### Top 50 — Full Change Log
**Entries:**
- [Channel]: NEW at #[X] ([score]) — [reason/context]

**Movements:**
- [Channel]: #[old] → #[new] (↑N / ↓N)

**Drops:**
- [Channel]: DROPPED — [reason]

**No change (notable):**
- [Channel]: — at #[X] — [note if relevant]

### Hidden Levels Added
| Channel | Approx Subs | Yob's Pick? |
|---------|-------------|-------------|
| [Name] | [X,XXX] | Y / N |
| [Name] | [X,XXX] | Y / N |
| [Name] | [X,XXX] | Y / N |
| [Name] | [X,XXX] | Y / N |
| [Name] | [X,XXX] | Y / N |

### Special Feature
- **Title:** [Feature name]
- **Summary:** [One sentence on what it covered]

### Retro Ads Used
| Ad Name | Core Concept |
|---------|-------------|
| [Ad Name™] | [One-line description] |
| [Ad Name™] | [One-line description] |
| [Ad Name™] | [One-line description] |

### Game Over Trends Roasted
1. [Trend name] — [one-line description]
2. [Trend name] — [one-line description]
3. [Trend name] — [one-line description]
4. [Trend name] — [one-line description]
5. [Trend name] — [one-line description]

### Negative Review Tracker Update
- **Last negative review:** Issue #[XX] ([Channel], [score])
- **Counter:** Reset / [X issues since last negative]

### Editorial Commitments — Status Update
| Commitment | Status |
|------------|--------|
| [Commitment description] | FULFILLED / DEFERRED TO #[XX] / OUTSTANDING |

### Notes & Flags for Future Issues
- [Any new flags raised in this issue — reader letters, editorial decisions, open threads]
- [Any commitments made in print in this issue — especially in Yob's Save Point]
- [Any channels to watch for re-evaluation]
- [Any pool depletion warnings — Time Capsule subjects, Boss Fight matchups]

---

**Issue #[XX] complete. [X] issues published.**

---
````

---

## Field Completion Guide

### Re-Evaluations
Only include this table if the issue contained a re-evaluation. If none: omit the section entirely (don't leave it empty).

### Boss Fight Channels
Always include both channels separately — the Boss Fight is their official score entry even if they weren't in a standalone Player Profile.

### Top 50 — Full Change Log
Be exhaustive. Every channel that moved, entered, or dropped gets a line. If 5+ channels entered this issue, all 5 get lines. Do not summarise ("several channels entered") — name them all.

### Editorial Commitments
Check the tracker's Notes & Flags section for any outstanding commitments from previous issues. Mark each as FULFILLED, DEFERRED, or OUTSTANDING. If deferred, specify which issue it's being pushed to.

### Notes & Flags
This section seeds the next issue's continuity checker. Think ahead:
- Did Yob make any promises in the letters page?
- Were any channels flagged as re-evaluation candidates?
- Did any reader letters establish a commitment (like Priya M. triggering The Global Issue)?
- Is any content pool now critically low?

---

## Output Location

The canonical, verified tracker lives in the repo at:
```
docs/continuity/CTRLWATCH_Continuity_Tracker.md
```

The update is delivered two ways:
1. **In the conversation** — output the full block as the final section, after the HTML file is confirmed.
2. **Into the tracker** — append the same block to `docs/continuity/CTRLWATCH_Continuity_Tracker.md`, and refresh the tracker's top-matter (`Last Updated: ... (Post-Issue #0XX)`) plus the live state sections it touches: TOP 50 — CURRENT STATE, the per-category Time Capsule pool warning, the NEGATIVE REVIEW TRACKER counter, and Outstanding Editorial Commitments. The tracker is the editorial source of truth — keep these in sync, never just bolt the new block on and leave the summary sections stale.

A byte-identical per-issue archive is also committed at `public/issues/0XX/CTRLWATCH_Continuity_Tracker_VERIFIED_Post0XX.md`; write/refresh that snapshot when the issue ships so the archived copy matches `docs/continuity/`.

**Never write to `.claude/tracker.md`** — it is a stale, deprecated tracker and must not be treated as a target.

---

## Quality Check

Before outputting the update block:

- [ ] All six Time Capsule subjects listed
- [ ] Boss Fight winner, loser, and scores recorded
- [ ] All reviewed channels listed with scores, verdicts, and Top 50 status
- [ ] Re-evaluations section included only if applicable
- [ ] Top 50 change log is exhaustive — every entry, movement, and drop named
- [ ] All five Hidden Levels channels listed with Yob's Pick status
- [ ] All retro ads named with core concept
- [ ] All five Game Over trends listed
- [ ] Negative review tracker counter updated
- [ ] All outstanding editorial commitments reviewed and marked
- [ ] New flags and commitments captured in Notes section
- [ ] `docs/continuity/CTRLWATCH_Continuity_Tracker.md` updated AND its live state sections (Top 50, pool warning, negative counter, commitments) refreshed to match
- [ ] Per-issue archive at `public/issues/0XX/` refreshed to match the canonical tracker
