---
name: ctrlwatch-time-capsule
description: Generates Time Capsule interview sections for CTRL+WATCH magazine — fictional Q&A exchanges where deceased historical figures react to YouTube for the first time. Use this skill whenever writing, drafting, or refining any Time Capsule interview. Covers voice research protocol, stage direction conventions, dramatic irony technique, disclaimer requirements, and how to write a memorable final quote. Must be read before writing any Time Capsule content. If the user asks to write, generate, or improve a Time Capsule interview, or asks how to handle a specific historical figure's voice, read this skill first.
---

# CTRL+WATCH — Time Capsule Skill

## What a Time Capsule Interview Is

A fictional Q&A where a deceased historical figure is shown YouTube for the first time — from the vantage point of their own era. The CTRL+WATCH interviewer (`C+W:`) guides them through specific content, phenomena, and creators. The figure reacts with the full force of their real worldview, philosophy, and personality.

The result is: **serious media criticism delivered through the most unexpected possible voice.**

---

## Non-Negotiable Rules

1. **Disclaimer is mandatory.** First line of every interview, before any content:
   ```
   ⚠ SATIRICAL / FICTIONAL — [Full Name] did not participate in this Q&A.
   ```
2. **Never repeat a subject.** Check the continuity tracker before selecting figures. The pool is thinning.
3. **8–12 exchanges per interview.** Quality over quantity. Never pad; never cut short.
4. **Stage directions are required.** Minimum 4–6 per interview, in italics. See stage direction guide below.
5. **End with a memorable final quote.** The interview's last line from the subject must be worth screenshotting.

---

## Continuity Tracker Check

Before selecting any figure, **read `.claude/tracker.md` → "Time Capsule — Used Subjects"** for the complete list of retired figures. If a figure is on that list: **do not use them.**

---

## Voice Research Protocol

For each figure selected, establish these before writing:

### 1. Speaking Register
- Formal / conversational / poetic / blunt / academic / stream-of-consciousness?
- Sentence length tendency (Hemingway: short. Wilde: long and ornate)
- Vocabulary level and era-specific diction

### 2. Core Philosophy (3–5 keywords)
These should surface naturally in the interview — never stated directly, always demonstrated.
Example for Richard Feynman: *joy of discovery, precision, anti-pretension, joy, the pleasure of finding things out*

### 3. Known Rhetorical Habits
- Did they use questions as arguments? (Socratic)
- Did they speak in lists? (Whitman)
- Did they use irony heavily? (Wilde, Hitchens)
- Did they use humour to disarm? (Carlin, Pryor)
- Were they prone to long silences before answering? (Kubrick, Gould)

### 4. What Would Delight Them
YouTube content most aligned with their worldview. Name specific channels or genres.

### 5. What Would Horrify / Infuriate Them
Their specific objection, rooted in their real beliefs — not generic complaints.

### 6. Their Likely Blind Spot
One thing they'd probably get wrong or fail to appreciate. Adds honesty and complexity.

---

## Dramatic Irony Rules

The figure exists in **their own era** while watching content from **ours**. This gap is where the meaning lives.

**Do:**
- Let them describe things in their era's language ("this is some kind of television, but the set is missing...")
- Let them make predictions that we know came true or false
- Let them reveal something about their era that comments on ours
- Let their praise or criticism land differently because of who they are

**Do not:**
- Make them anachronistically aware of post-death events
- Have them immediately grasp modern internet concepts — let them work to it
- Reduce them to a walking quote machine for their famous opinions
- Play it for cheap jokes about "old person confused by technology"

---

## Stage Directions

Required style: italics, in square brackets, one per 1–2 exchanges minimum.

**Purpose:** Control pacing, reveal subtext, show physical/emotional reaction that the words can't carry.

**Good stage direction patterns:**
```
[pauses for a long moment, watching]
[leans forward, studying the screen more closely]
[a dry laugh]
[voice drops — the question has caught something real]
[stands, as if to pace, then thinks better of it]
[waves a hand — dismissive, but the eyes aren't dismissive]
[something shifts in the expression — not quite sadness]
[looks at the interviewer for the first time]
```

**Bad stage direction patterns (avoid):**
- `[laughs loudly]` — too general
- `[is shocked]` — tell don't show
- `[thinks about it]` — this adds nothing
- `[smiles]` — unless the smile means something specific

---

## Interview Structure

### Opening (Exchanges 1–2)
Establish the figure's immediate, instinctive reaction to what they're seeing. Set the voice. Include the disclaimer before these exchanges.

### Development (Exchanges 3–8)
Move through 3–4 specific YouTube topics, content types, or phenomena. Each should:
- Connect to the figure's real-world expertise or philosophy
- Produce a reaction rooted in that expertise, not generic celebrity opinion
- Include at least one moment where the figure is genuinely moved or impressed (not just critical)

### Complication (Exchanges 9–10)
Show the figure grappling with something they can't fully resolve. The good thing that is also the bad thing. The question that doesn't have an answer.

### Final Quote (Exchange 11–12)
The closing exchange should produce the interview's defining line. This is the pull quote. It should:
- Be specific to this person, not generic wisdom
- Contain a paradox, twist, or unexpected angle
- Be re-readable — different on second read than first
- End the interview, not summarise it

---

## Formatting Template

```
⚠ SATIRICAL / FICTIONAL — [Full Name] did not participate in this Q&A.

[Optional 2–3 line scene-setting intro in italics]

**C+W:** [Opening question — usually: what is your immediate reaction to what you're seeing?]

**[PERSON NAME]:** [Response] *[Stage direction]*

**C+W:** [Follow-up]

**[PERSON NAME]:** *[Stage direction]* [Response]

[...continue for 8–12 exchanges total...]

**C+W:** [Final question — often open-ended: "What would you do with this?"]

**[PERSON NAME]:** *[Final stage direction — something physical that underscores the words]* [MEMORABLE FINAL QUOTE]
```

---

## Common Failure Modes

| Failure | What It Looks Like | Fix |
|---------|-------------------|-----|
| **Quote machine** | Figure just repeats their famous quotes rephrased | Root answers in the specific content they're watching |
| **Uniformly negative** | Figure is appalled by everything | Every interview needs at least one moment of genuine admiration |
| **Uniformly positive** | Figure praises everything — wowed by technology | Maintain their critical faculties. Admiration must be earned. |
| **Generic old-person confusion** | "What is this strange box?" played for laughs | The figure is a genius. They adapt. Their confusion is philosophical, not technological. |
| **Voice collapse** | Figure starts sounding like the house voice by interview's end | Re-read your opening exchanges. Does the closing exchange sound like the same person? |
| **Predictable targets** | Figure criticises exactly what you'd expect them to | One criticism should surprise. What would Hemingway like about MrBeast? |

---

## Theme Alignment

The Time Capsule subjects should connect to the issue theme — but not too neatly.

- **Connect:** Choose figures whose work has genuine relevance to the theme
- **Tension:** Choose at least one figure whose worldview conflicts with the theme's assumptions
- **Variety:** Six interviews should cover different emotional registers — analytical, emotional, funny, dark, optimistic, ambivalent

For global/international issues: consider figures from non-English-speaking traditions where possible. The tracker's "safe to use" list is heavily Anglo-American — a deliberate editorial gap worth addressing.

---

## Quality Check

Before finalising any Time Capsule section:

- [ ] Disclaimer present above every interview
- [ ] Figure not on the used-subjects list in continuity tracker
- [ ] Voice consistent from first to last exchange
- [ ] Minimum 4 stage directions, all specific
- [ ] At least one moment of genuine admiration (not just criticism)
- [ ] Final quote is pull-quote worthy — re-readable, specific, paradoxical
- [ ] Figure's blind spot represented (the thing they'd get wrong)
- [ ] Total exchanges: 8–12 per interview
- [ ] Dramatic irony present (they see our world through their era's eyes)
