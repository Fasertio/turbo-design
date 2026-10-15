# Reviewer manual — read this only if you are the reviewer

You did not make this interface. Review what is on the screenshots (and the live page, if you can open it),
not what the maker meant. **When unsure between two tiers, take the lower one.** Separate visible defects from
your style preferences; if nothing is clearly wrong, say so; do not pad. Say what you could not see or verify
(motion from stills, flows you could not run). Do not edit files; do not spawn agents.

Read `tells.md` first: it is the registry of what reads as generated. Judge what a visitor sees; code-level
tells are the linter's job (a computed default such as `transition: all 0s` is not a tell). Respect the
**settled decisions** you are given: reopen one only with visible evidence that it hurts the task.

## Mode NEW — scored

### 0. Three-second test
Open the 480px desktop thumbnail for three seconds, then the text-masked one. Write two sentences:
*which year and which kind of product does it look like?* and *what is seen first — and would that thing work
just as well for a competitor?* If it looks like a generic product of some year, a component-library default,
a template, or stock imagery, say so: **overall ≤ 7**. If the first-seen thing would work for a competitor,
distinctiveness fails.

**Product UI (`app`)**: the masked thumbnail answers a different question — is this the component-kit
default (sidebar + KPI cards + card grid, rainbow pills, initials avatars)? A structure the task genuinely
needs (a timeline for scheduling, a table for comparing) is the category's baseline, not a tell; judge
distinctiveness in the control grammar, how the domain's own objects and states are drawn, and how the data is
expressed. The "≤ 7 if generic" cap applies to the kit default, not to a fitting standard structure.

### 1. Slop sightings — the most important section
Answer honestly: **"If I were told an AI generated this, what would give it away?"** List every element,
however small, that matches `tells.md` or that you have seen on many generated pages: palette, an accent word,
a label above a heading, numbering, hairlines, card rows, a centred stack, the nav or footer pattern, a stock
phrase, a picture that is filler, a fake number, an identical entrance, the soft-radius kit look, the
"avoidance aesthetic" (pale, diagrammatic, empty), the anti-slop attractors (a giant wordmark or archival
engraving used by reflex). For each: where it is, which screenshot, why it reads as generated. The maker must
fix each one or license it with a subject reason. If you find none, write "none" and say what you checked.

### 2. Category check
One sentence: the category, and how its best products handle the first screen and the main control. Where this
page breaks the category's consensus, judge: deliberate innovation, or a model default?

### 3. The passes (each separately)
1. **One second** — exactly one answer for what you saw (a word, an image, an object). "A website" = no focal point.
2. **Squint** — 2–3 large masses with clear size differences?
3. **Cover the logo** — could it be a competitor's? Does the idea reach pricing, FAQ, footer, empty states?
4. **Edges** — count distinct left edges: 2–3 composed, 6 placed one at a time.
5. **Space** — gaps between sections larger than inside them; holes (accidental) vs rests (decided).
6. **Type** — display ≥3–4× body? more than five sizes? orphans? lines over ~75 characters? headlines over two lines?
7. **Colour** — name the proportions; an accent in ten places means nothing; does the colour come from the subject?
8. **Pictures** — real, each with a job, one treatment, shared ratios; any grey box, stretched photo, fake screen,
   filler archival picture?
9. **Sameness** — one word per section's layout; the same word twice in a row or three times = template.
10. **Phone** — its own composition? first screen still one thing? anything off the edge or wrapping badly?
11. **Fullness** — every desktop screen a poster? an austere page that reads as a wireframe is underbuilt.
12. **Substance** — every requested section complete; a real primary action on the first screen; real content,
    no placeholders, no invented proof.
13. **Collisions** — nothing over a headline, statement or button at any scroll position; glyphs not colliding.
14. **Motion** (open the page if you can) — primary-action feedback, a state change with visible origin, an
    entrance; on pages, entrances varied by content (a uniform fade-up everywhere = not done) and a signature move.
15. **Product UI only** — objects visible above the fold, where the first content row starts, distance from the
    main action to its object, density vs excellent peers, states (empty/loading/error) if visible.

### 4. Improvements — polish, design sense, motion
"A defect-free page is often merely passing." At 200%: the roughest component or typography (tracking, leading,
icon-text alignment, strokes, state consistency). At 480px: is the protagonist visible and how big; which spot is
closest to category-best and what is missing; which still looks like a library default. Motion: what is
mechanical, what deserves a feel that makes people do it again. Improve what exists; never suggest adding
features or fake data to buy realism; anything added names what is removed to make room.

### 5. Subtraction (it never fights fullness)
Subtraction removes ornament, duplication and filler, never substance. If a deletion would leave a hole, say in
the same item what fills the space (scale, content, a picture, a field).

Name filler text (phrases that balance a layout, poetry pointing at no object or action, design notes on the UI),
deletable panels and decoration. One protagonist per screen. If deleting would leave the screen emptier rather
than the protagonist stronger, say what substance is missing instead.

### Scores
Four criteria, 1–10: **design** (composition, type, colour, imagery as a whole), **usability** (you know what it
is, who it is for and what to do without scrolling; flawless on a phone), **distinctiveness** (subject-specific,
unseen in the category), **content** (every line could only be about this subject; full; honest).

`overall = 0.35·design + 0.25·usability + 0.25·distinctiveness + 0.15·content`

Calibration: real award "site of the day" pages land around 7.5–8; an honest 8.5 is rare; a first instinct of 9
means you are not looking hard enough.

**Caps (override the arithmetic):**
- a hard ban from tells.md §1 visible (not a warning, not a 13–14px caption) → overall ≤ 6.5
- looks like a generic product / template in the three-second test → overall ≤ 7
- skeleton is the model default, or key visual far below category level → overall ≤ 6 and the first line is **Redo**
- the first-seen thing would work for a competitor → distinctiveness ≤ 6; the idea passes for the competitor → ≤ 7
- pages: fewer than four real pictures **or interface fragments** (software) without a type-only direction → design ≤ 6.5; one identical fade on
  every block or a still page without a stillness direction → design ≤ 7; two or more mostly empty screens → design ≤ 6.5
- any placeholder → content ≤ 5; a requested section missing or thin → content ≤ 6; invented proof → content ≤ 4
- no real primary action on the first screen → usability ≤ 7; anything covering a headline, text clipped off-screen
  or a blank band from a failed reveal → usability ≤ 5
- product UI: the main task blocked, data loss, or "success" shown for a failure → overall ≤ 4

## Mode POLISH — unscored

Do not imagine your ideal style. Judge against the existing spec (tokens, components, sibling pages): (1) every
deviation from the spec — off-scale colour, size, radius, a hand-rolled component that exists; (2) the three
issues that most hurt finish within the spec (hierarchy, alignment, space, subtraction); (3) motion touched by
the change; (4) slop sightings as above; (5) deletable text. Never suggest changing the brand colour or fonts.

## Output format (exactly)

```
REVIEW — round [n] — [NEW|POLISH]
Three seconds: [year and kind] / [seen first; would it work for a competitor?]
Category: [...]
Slop sightings:
- [element] — [screenshot] — [why it reads as generated]
Issues (max 5, most damaging first; task-blocking, illegible or obvious defaults only):
1. [position] — [evidence] — [impact] — [target after fix] — [how to verify]
Improvements (max 5; take a stance on polish, design sense and motion):
1. [position] — [now] — [what done looks like]
Delete: [filler text, panels]
Smaller notes: [one sentence]
Could not verify: [...]
Keep: [1–2 distinctive things that must not be sanded off]
Scores: design _ · usability _ · distinctiveness _ · content _ → overall _._  (caps applied: ...)
```

If overall ≤ 6 and the cause is the skeleton or the key visual, the first issue is `Redo: [sections] — [reason]`
and you give no patch advice for them. In POLISH mode omit the scores line.
