---
name: ctrlwatch-theme-feasibility
description: "Checks whether a proposed CTRL+WATCH issue theme is viable given the current state of the continuity tracker - Time Capsule pool, Boss Fight availability, editorial commitments, and thematic overlap with past issues. Use this skill whenever the user is considering a new issue theme, asking what themes are viable, or wants to know what the current pool can support. Outputs a Green/Amber/Red feasibility verdict with specific reasons. Does not generate themes unprompted - it evaluates themes the user proposes and surfaces constraints they may not have considered."
---

# CTRL+WATCH — Theme Feasibility Checker Skill

## Purpose

This skill does one thing: tells you whether a theme idea will work given the current state of the magazine's content pools.

It does **not** generate themes unprompted. Creative direction stays with the editor. This skill surfaces constraints, costs, and opportunities — the editorial decision is yours.

This is the **first** step in issue planning — run it before `ctrlwatch-continuity-checker`, so you're not building a full proposal around a theme that hits an immediate wall (most often an exhausted Time Capsule category).

---

## Design Principle: Read Pool State From the Tracker, Never Hardcode It

Every pool count, remaining-subject list, safe-matchup list, and commitment deadline changes after each issue and lives in the tracker. Do **not** trust any list frozen into this skill — earlier versions hardcoded Post-#011 pools and went stale within one issue. The snapshots below are dated anchors for orientation only; the binding values are whatever the tracker currently says. If you are about to rely on a specific count or name, go read it from the tracker first.

---

## Step 1 — Read the Tracker

Read the canonical tracker before running any feasibility check:
```
docs/continuity/CTRLWATCH_Continuity_Tracker.md
```
(Never `.claude/tracker.md` — it is deprecated and stale.) The tracker is the source of truth for all pool states.

Key sections to check:
- **ISSUES ARCHIVE** — themes already used
- **TIME CAPSULE — SAFE TO USE** + the pool-warning block — remaining eligible subjects by category
- **BOSS FIGHTS — SAFE TO USE** — remaining eligible matchups
- **NOTES & FLAGS → Outstanding Editorial Commitments** — binding promises and deadlines
- **SPECIAL FEATURES USED** — avoid repeating special-feature angles

---

## Step 2 — Run the Feasibility Assessment

For each proposed theme, assess all five dimensions below.

---

### Dimension 1 — Thematic Freshness

Cross-check the proposed theme against the tracker's **ISSUES ARCHIVE**. Themes used through #014 (read the tracker for anything newer): Premiere, Algorithm, Vision, Spectacle, Craft, Underground, Longevity, Voice, Nostalgia, Niche, Music, Politics, Collisions, Global, Comedy.

**Ask:**
- Is this theme substantively different from all prior themes?
- Does it cover territory past themes already mapped? (e.g., a "Format" issue overlaps heavily with Craft and Vision)
- Does it feel like a natural next step in the magazine's editorial arc, or a step backward?

**Flag if:** the proposed theme is a close synonym of a prior theme, or if 3+ past issues have already explored its core territory.

---

### Dimension 2 — Time Capsule Pool Viability

This is the most important constraint, and as of Post-#014 it is the usual blocker.

**Read the tracker's TIME CAPSULE — SAFE TO USE list and pool-warning block for the live counts.** Snapshot as of Post-#014 (verify, do not trust this verbatim):
- **Comedy: EXHAUSTED. Film/TV: EXHAUSTED. Sport/Activism/Polymaths: EXHAUSTED. Journalism/Politics: EXHAUSTED.**
- **Arts/Literature: ~1** (Virginia Woolf). **Science/Philosophy: ~1** (Alan Turing).
- **Music: ~4** (Lennon, Joplin, Hendrix, Mitchell) — PROTECTED reserve, music-adjacent issues only.
- **Total ≈ 6 figures.**

**Viability test:** can the proposed theme credibly support its Time Capsule slate from the remaining pool?
- A theme wants at least **8 eligible subjects** to be Green (you want options, not exactly enough).
- Fewer than 8 → Amber. Fewer than the slate size → Red.
- **Reality check Post-#014:** with ≈6 figures left across two near-empty categories plus a protected music reserve, almost no general-theme issue clears Green on the existing pool. Expect to recommend one of: expand into new figure categories (visual artists, architects, athletes, non-Western historical figures, inventors/engineers); draw the music reserve only if music-adjacent; or run a reduced slate of 4–5 subjects. Surface this explicitly.

**Music pool warning:** hold the remaining music figures as a block for a music-adjacent issue. Never spend them on a non-music theme.

---

### Dimension 3 — Boss Fight Availability

Can the theme support a natural, non-forced Boss Fight from the available matchup pool?

**Read the tracker's BOSS FIGHTS — SAFE TO USE list.** Snapshot of currently-safe matchups as of Post-#014 (verify against the tracker — and note every channel that has already fought is retired from future Boss Fights):
- Dunkey vs Girlfriend Reviews
- Adam Savage vs Colin Furze
- Johnny Harris vs Vox
- Adam Ragusea vs Ethan Chlebowski (cooking science)
- Townsends vs Tasting History (historical cooking — both ranked)
- NileRed vs Nile Blue (chemistry siblings)
- Mrwhosetheboss vs Dave2D (global tech review)
- Stuff Made Here vs Mark Rober (engineer-creator)
- exurb1a vs Like Stories of Old (philosophical video essay)

(Kurzgesagt vs TED-Ed and Sam O'Nella vs Oversimplified are now USED — do not propose them.)

**Viability test:** does at least one safe matchup connect naturally to the theme? A forced connection (a cooking matchup for a Politics issue) is worse than none — it reads as filler. If no safe matchup fits, flag that the issue needs a new matchup from not-yet-reviewed channels, or a looser thematic bridge with editorial justification.

---

### Dimension 4 — Editorial Commitments

Some themes fulfil outstanding commitments; some defer them further. Both outcomes need naming.

**Read the tracker's NOTES & FLAGS → Outstanding Editorial Commitments and the most recent Editorial Commitments — Status Update table.** Snapshot of binding commitments as of Post-#014 (verify):
- **Mandatory negative review by #015** — counter at 2, no further deferral.
- **Non-English Player Profile every issue** — standing, no skips.
- **Sub-200K-subscriber Player Profile by #015** — Yob's in-print promise to reader K.
- **Indian comedy / Hindi-language profile by #016 or #017** — promised to Priya M.
- **Further Brazilian coverage** (Choque de Cultura / Hermes e Renato) — Marco T. priority, candidate for #016.

**Assessment questions:**
- Does the proposed theme fulfil one or more outstanding commitments?
- If not, how many more issues can each be deferred before it's an editorial-credibility problem?
- Does the theme create any *new* commitments (e.g., a reader letter in the proposal sets up a future promise)?

A "by #0XX" promise is a hard constraint. Check this issue's number against every deadline.

---

### Dimension 5 — Special Feature Angle

Each issue has a signature Special Feature. Check the tracker's **SPECIAL FEATURES USED** for a fresh angle. Used angles through #014 include: Top 50 inaugural, Algorithm investigation, Economics of Spectacle, Longevity Equation, Narrator's Advantage taxonomy, Old YouTube Eulogy, Niche-type taxonomy, Radio-replacement thesis, Discourse Machine autopsy, Type 7: The Collision, The Invisible Half (non-English field report), The Comedy Tax.

**Flag if:** the theme's natural Special Feature angle is too similar to a previous one (e.g., yet another taxonomy, another "what YouTube lost" essay).

---

## Step 3 — Output the Feasibility Report

For each proposed theme, output a structured report:

```
THEME FEASIBILITY REPORT
Theme: THE [X] ISSUE
Assessment date: Post-Issue #[XX]

OVERALL VERDICT: 🟢 GREEN / 🟡 AMBER / 🔴 RED

─────────────────────────────────────────
DIMENSION SCORES
─────────────────────────────────────────
Thematic Freshness:      🟢 / 🟡 / 🔴
Time Capsule Pool:       🟢 / 🟡 / 🔴
Boss Fight Availability: 🟢 / 🟡 / 🔴
Editorial Commitments:   🟢 / 🟡 / 🔴 (+ fulfils / defers)
Special Feature Angle:   🟢 / 🟡 / 🔴

─────────────────────────────────────────
TIME CAPSULE — VIABLE SUBJECTS ([N] available)
─────────────────────────────────────────
Strong fit:
• [Name] — [one-line angle]
• [Name] — [one-line angle]

Possible fit (weaker connection):
• [Name] — [one-line angle]

Pool risk: [note if this theme depletes a category, or requires new categories / reduced slate]

─────────────────────────────────────────
BOSS FIGHT — VIABLE MATCHUPS
─────────────────────────────────────────
Natural fit:
• [Channel A] vs [Channel B] — [why it fits]

Possible with justification:
• [Channel A] vs [Channel B] — [what the editorial bridge would be]

─────────────────────────────────────────
EDITORIAL COMMITMENTS
─────────────────────────────────────────
Fulfils: [commitment name] / None
Defers: [commitment name + how many issues deferred so far]
Due this issue: [any "by #0XX" promise landing on/before this issue]

─────────────────────────────────────────
SPECIAL FEATURE ANGLE
─────────────────────────────────────────
Natural angle: [proposed feature concept]
Overlap risk: [yes/no — with which prior feature]

─────────────────────────────────────────
VERDICT SUMMARY
─────────────────────────────────────────
[2–4 sentences. What works, what doesn't, and the key decision the editor needs to make.]

Recommended action: PROCEED / PROCEED WITH MODIFICATIONS / RECONSIDER
```

---

## Verdict Definitions

**🟢 GREEN — Proceed**
Clears all five dimensions with no significant issues: ≥8 eligible Time Capsule subjects, a natural Boss Fight exists, no urgent commitment being deferred, no major thematic overlap.

**🟡 AMBER — Proceed with modifications**
Viable but with 1–2 meaningful constraints: pool is tight but workable, the Boss Fight needs an editorial bridge, or an outstanding commitment is deferred again. Proceed with eyes open to the named constraints.

**🔴 RED — Reconsider**
A blocking constraint: too few eligible Time Capsule subjects for the slate, no viable Boss Fight, or a critical commitment broken. Don't proceed without resolving the blocker first.

---

## Multi-Theme Comparison

If the user proposes multiple themes, run the full assessment for each and add a comparison summary:

```
THEME COMPARISON SUMMARY

Theme A: THE [X] ISSUE — 🟢 GREEN
Theme B: THE [Y] ISSUE — 🟡 AMBER
Theme C: THE [Z] ISSUE — 🔴 RED

Recommended sequence: [X] → [Z after pool replenishment] → [Y]
Reason: [2–3 sentences on why this ordering makes editorial sense]
```

---

## Pool Health Dashboard

When the user asks "what themes are viable?" or "what's left in the pool?", read the tracker and output this before proposing anything:

```
POOL HEALTH DASHBOARD — Post-Issue #[XX]

Time Capsule Pool
─────────────────
Arts / Literature:      [N] remaining — [names]
Music:                  [N] remaining — ⚠ PROTECTED reserve if music figures only
Film / TV:              [N] remaining — [names or EXHAUSTED]
Science / Philosophy:   [N] remaining — [names or EXHAUSTED]
Comedy:                 [N] remaining — [names or EXHAUSTED]
Sport / Activism:       [N] remaining — [names or EXHAUSTED]
Journalism / Politics:  [N] remaining — [names or EXHAUSTED]

Overall pool health: HEALTHY / THINNING / CRITICAL

Boss Fight Pool
───────────────
Available matchups: [N]
[list names]

Outstanding Commitments
───────────────────────
[list with deadlines / urgency]

Implication for theme planning:
[2–3 sentences on what themes the pool can and cannot currently support]
```

---

## Quality Check

Before outputting any feasibility report:

- [ ] Tracker read from `docs/continuity/CTRLWATCH_Continuity_Tracker.md` — not from memory, not from `.claude/tracker.md`
- [ ] All five dimensions assessed
- [ ] Time Capsule subject count verified against the tracker's current SAFE TO USE list and pool warning
- [ ] Boss Fight matchups verified against the tracker's used + safe lists
- [ ] Outstanding commitments checked against the tracker's Notes & Flags, with deadlines compared to this issue's number
- [ ] Verdict is Green / Amber / Red — no hedging with "it depends"
- [ ] Recommended action stated explicitly

---

## Handoff

On a Green or Amber verdict the user accepts, planning continues with `ctrlwatch-continuity-checker` (the full pre-issue checklist + proposal). This skill assesses theme viability; the continuity checker builds and gates the actual lineup.
