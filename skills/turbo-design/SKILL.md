---
name: turbo-design
description: Use when building, designing, redesigning, restyling, polishing, auditing or reviewing any web interface — landing page, marketing site, portfolio, product page, one-pager, web app screen, dashboard, admin, form, component — in any stack (HTML/CSS, React, Next.js, Vue, Svelte, Astro, Tailwind); also when a page looks generic, templated, "AI-made", sloppy, or the user wants it designed, premium, distinctive, less like every other site, or asks to study a reference design.
---

# turbo-design

A generated interface looks like the average of everything the model has seen: cream and terracotta,
an italic serif word in the headline, a little label above every heading, 01/02/03, hairlines, a row of
icon cards, a soft shadow, Inter. Nothing in it is wrong and nothing in it was decided.

This skill replaces defaults with decisions and then **proves** the result is not slop:

1. **The idea comes from the subject**, never from the category or the model's taste.
2. **Directions are chosen against randomness and memory**, so two projects never share a look.
3. **Substance replaces ornament**: real pictures, full content, type at scale, colour fields. Removing tells
   and leaving a thin page is its own failure; blind juries prefer a rich page with tells over an empty clean one.
4. **Verification is mechanical first, visual second**: a linter, a real-browser inspector (four widths,
   keyboard, no-JavaScript, reduced-motion), then an isolated reviewer who sees only the screenshots.

**Violating the letter of these rules is violating their spirit.** "It's tasteful here", "the reference does
it", "the user won't mind" are the rationalizations that produce slop.

`<skill>` below is this skill's folder. Scripts need Node 22+ and an installed Chrome or Edge; they install
nothing. Run them from the project root; working files go to `.turbo/`.

## Route first

| The request | Surface (`profile`) | Path |
| --- | --- | --- |
| A new page or site: landing, brand, portfolio, event, shop front | `page` | The full run below |
| A product screen: dashboard, admin, tool, app, settings, table, inbox | `app` | The full run, plus [app-ui.md](references/app-ui.md) |
| One element: button, input, card, modal, nav, pricing card | `component` | [states.md](references/states.md) § Component scope |
| "Audit / review this", "why does this look AI-made?" | from the target | [verbs.md](references/verbs.md) § Audit — no edits |
| "Redesign / restyle / modernise this" | from the target | [verbs.md](references/verbs.md) § Redesign — safety rules first |
| A screenshot or URL of a design they admire | — | [verbs.md](references/verbs.md) § Study |
| One spacing, colour or copy fix | from the target | Make it, look at it at the target width, say what changed. No ceremony. |

**What to read, by profile** (do not read the rest):
- `page`: tells, direction, copy, type, colour, layout, imagery, motion, states; review at step 7.
- `app`: tells, app-ui, states, type, colour, layout; motion § product UI only; review at step 7. Skip imagery and the deck.
- `component`: states § Component scope, tells, type, colour.

In an existing project, read before you ask: `DESIGN.md`/`design.md` (a locked system: obey it, consistency
replaces variety), the font stack, colour tokens, spacing scale, framework, motion library. Preserve them.
Never overwrite a global stylesheet: append below its framework directives. State the files you will touch
before editing; deletions need the user's yes.

## The run

### 1. Read what is real

The subject, the audience, the one action the page must get, the stack, the brand, and **what imagery truly
exists** (own photos, a real interface, an image tool, nothing). Then write in `.turbo/notes.md`:

- **Inventory**: 8–12 things that belong to this client and to no competitor — its name and what it means,
  its address and what the place looks like, its numbers, its constraint, its materials, its rituals and hours,
  the printed things of its world. The idea comes from this list.
- **Category and benchmarks**: name the category, its 2–3 most distinctive players, and what they do on the
  first screen and in one key control. Capture them if you can browse; otherwise write "from memory, unverified".
  Mark what is *baseline* (users expect it: keep), *trope* (everyone does it: at least one direction breaks it),
  *face-collision* (never).

### 2. Write the argument and the words

**Product screens** (`app`): instead of claims, list the regions as jobs — what the user must see first, what
they change most often, what they must never miss (a late job, a failed payment) — and write the real labels,
column names, statuses, empty/error messages and 10–20 rows of believable data. Then go to step 3.

List the page as claims with their proof, one line per section ([copy.md](references/copy.md) §1). Sections
without a claim are deleted; this, not a template, decides the order. Then write the **whole copy deck** in
plain text before any markup: every headline two lines or fewer at every width (≈32 characters is safe), full
content for every section, a primary action named for what it does. **Never invent proof**: no customers,
quotes, logos, ratings, user counts, percentages. Sample details (dish names, rates, ticket rows) are fine and
listed in the report.

### 3. Choose a direction — three in words, one built

Read [direction.md](references/direction.md). Produce **three directions** as short cards (north star, idea
engine, first-screen skeleton, type, colour and where it comes from, key visual, signature motion):

- pages: at least one comes from the deck: `node <skill>/scripts/deal.mjs --sector <s> --brief "<one line>" --options 3`;
  apps: the three differ in workspace structure (list + detail, board, timeline, table + inline editor, map,
  single focused form) — the deck is page-shaped, skip it;
- they pass the **difference test**: any two share at most one of {skeleton, type, colour, key visual}; never
  split by lightness alone; at most one left/right split; at least one breaks the category trope;
- each fills the **idea sentence** — *"On this page, [something only this subject has] becomes [the device]"* —
  and survives the **competitor test** (put the nearest competitor in the sentence: if it still works, it is the
  category's idea, not this client's);
- each names **one live thing**: something the visitor does or sees that is different for them, made of the
  subject's real content, working with a thumb, with a plain fallback.

Check `.turbo/log.json`: the new fingerprint must differ from each of the last three builds on at least two of
{skeleton, display class, ground band, accent hue, signature move} — unless a `DESIGN.md` or brand locks them.

**Interactive session**: send the three cards in one message with your recommendation and the reading you
inferred (audience · action · tone); add a question only if a missing fact blocks the work. Stop and wait.
**Unattended, or the user said "just build it"**: pick the recommended one, state it in one line, continue.

Write `.turbo/direction.json` ([tools.md](references/tools.md) § direction.json): profile, north star, idea,
live thing, fingerprint, facts confirmed by the brief, and **licenses** — a banned-by-default device the
subject truly owns, with the reason in the subject's terms ("hairline: the page is a tide timetable; rows are
data"), three at most. Hard bans cannot be licensed.

### 4. Build it still

Read [tells.md](references/tells.md) once now — it is the registry of what reads as generated, and what replaces
each thing. Then, in this order, with motion off in your head:

1. **Tokens**: every colour and font family through a named custom property; no raw values downstream.
   `<skill>/assets/base.css` + `base.js` are an optional neutral start (reset, token names, type steps, grid,
   focus, the reveal helper with its no-JS and reduced-motion safety).
2. **The first screen**, at desktop and phone width: the big thing big, the small things small.
3. **Each section** from the argument, each a different composition from its neighbours. Carry the idea into
   every section — pricing, FAQ and footer included; a distinctive hero followed by stock blocks is the commonest failure.
4. **Imagery** ([imagery.md](references/imagery.md)): own → generated → real pictures of the subject's world from
   open collections (`node <skill>/scripts/assets.mjs "<query>"`, download with `--get`, credit on the page) →
   drawn in code from the subject → type and colour alone (a licensed direction). **Never a grey box, never a
   fake dashboard, never a found picture presented as the client's own.** Pages carry four or more real pictures.
5. **The live thing**, in the section where it proves the claim.
6. **Fullness**: each desktop screen reads as a poster with one dominant thing; one deliberate rest per page.
7. **States and semantics**: real links and buttons, visible `:focus-visible`, alt text, every interactive
   state ([states.md](references/states.md)), a phone layout that is its own composition.

Numbers live in [type.md](references/type.md), [colour.md](references/colour.md), [layout.md](references/layout.md).
Product screens: [app-ui.md](references/app-ui.md).

### 5. Gate — mechanical

```bash
node <skill>/scripts/lint.mjs <source folder>
node <skill>/scripts/inspect.mjs <index.html | url>
```

While iterating use `inspect.mjs … --quick` (one screen per width, seconds); the full run (all screens, keyboard,
no-JS, reduced motion) is the gate before review and before the report. Fix every `FAIL`. Every `WARN` is wrong unless you write a one-sentence reason in `direction.json` `"notes"`.
Re-run until `0 FAIL`. Never hide things from the meter (no `turbo-ignore` without a reason in the report,
no `data-ui` on page wrappers, no licenses invented to pass).

### 6. Move

Pages: the signature move, entrances for the parts of each section varied by content, feedback on every
control, one moving picture. Apps: the three basic motions (press feedback, one state change that shows
where things go, one first-visit entrance). Transform and opacity only, `prefers-reduced-motion` keeps every
element in its final state, nothing is hidden when script fails ([motion.md](references/motion.md)). Run the
gate again and look at every screenshot for content that failed to appear. Motion is built before the review
so the reviewer judges the finished thing.

### 7. Look — isolated review

Passing the meter means nothing banned was measured; it does not mean the page is good. Follow
[review.md](references/review.md): dispatch a **fresh subagent that has not seen your work** with only the
screenshots, the review kit (480px thumbnails, text-masked first screens), the brief and the north star. It
scores with its own manual and lists every element that still reads as generated. Fix its findings in order,
protect its **Keep** line, re-inspect, re-review. Three rounds at most. Do not read the reviewer's manual yourself
before building. No subagent available → review yourself with the same manual and say "not independently reviewed".

### 8. Subtract, then report

One protagonist per screen. Delete filler text, duplicate lines, containers that only contain. If the
protagonist did not get stronger, you emptied instead of edited — put substance back.

Append the fingerprint to `.turbo/log.json`. Report briefly: the direction and why (and any dealt slot
redrawn), the idea sentence and the live thing, final inspector result, review scores per round and what still
falls short, licenses used, every found picture and its credit, sample content to replace before launch, and
**every check you did not run**. Never claim a check you did not run.

## Rationalizations

| Excuse | Reality |
| --- | --- |
| "The brief is clear, skip the three directions" | Skipping is how the category default ships. Unattended: write them, pick, move on — it costs minutes. |
| "This hairline/eyebrow/mono label is tasteful here" | Taste is the attractor. License it with a subject reason or remove it. |
| "The reference site does it" | References give relations, not devices. Award sites carry the same tells; copying them is how tells spread. |
| "No pictures exist, a grey box is honest" | A grey box is a to-do list shipped. Find, draw, or license a type-only direction. |
| "Inspector passes, so it's done" | The meter is the floor. The isolated review decides. |
| "I'll self-review, it's faster" | The maker's eye is optimistic by construction. Dispatch the reviewer when you can. |
| "The stat makes the section work" | Invented proof is the worst slop. Use the brief's numbers or change the section. |
| "Removing the tells left it empty, the tells were better" | Then fill it with scale, content, pictures, colour — never with another ornament. |
| "This WARN is a false positive" | Then say why in one sentence in `notes`. Unexplained WARNs are failures. |

## Red flags — stop and go back

Cream with a rust button · a headline with one italic or coloured word · a small uppercase label above a
heading · 01/02/03 · a row of three icon cards · a pill badge above the hero · gradient text · purple · glass
cards · a fake browser frame · "Trusted by 10,000+" · Inter/Fraunces/Instrument Serif as the display face ·
a grey "image here" box · every section fading up the same way · the page you would have built without this skill.

## Files

| File | Read it when |
| --- | --- |
| [direction.md](references/direction.md) | Step 3: inventory, benchmarks, tone, engines, skeletons, cards, difference test, idea, fingerprint |
| [tells.md](references/tells.md) | Step 4, and whenever unsure whether something reads as generated |
| [copy.md](references/copy.md) | Step 2: argument, copy deck, headline arithmetic, banned phrases (EN/IT), honest proof |
| [type.md](references/type.md) · [colour.md](references/colour.md) · [layout.md](references/layout.md) | Step 4, for the numbers |
| [imagery.md](references/imagery.md) | Step 4: finding, drawing, generating, crediting pictures |
| [motion.md](references/motion.md) | Step 6 |
| [app-ui.md](references/app-ui.md) | Any product screen |
| [states.md](references/states.md) | Interactive elements, forms, the component-scope run |
| [review.md](references/review.md) | Step 7: how to dispatch the isolated reviewer |
| [reviewer.md](references/reviewer.md) | **Only the reviewer reads this.** |
| [verbs.md](references/verbs.md) | Audit, redesign, study |
| [tools.md](references/tools.md) | Script flags, `direction.json`, `log.json`, troubleshooting |
