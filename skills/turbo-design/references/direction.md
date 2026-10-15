# Direction — from the subject to one decided look

Goal: what the best team in this category would do, **and** recognisably this product. "Different from the
model's default" is not enough; "premium" decides nothing.

## 1. Inventory (8–12 lines in `.turbo/notes.md`)

What belongs to this client and to no competitor:
- its **name** and what it means (can the letters hold a picture, stack, split?);
- its **place**: address, street, neighbourhood, the light, the tiles, the signs, the paint, the weather;
- its **numbers**: seats, minutes to the sea, the price, the year, the batch size;
- its **constraint**: closed in winter, one batch a month, by appointment, three mechanics;
- its **materials and colours**; its **rituals and hours** (the oven lit at five, the ferry at seven);
- its **output**: what it produces, which can sit on the page as material (the report, the receipt, the loaf);
- the **printed things of its world**: ticket, label, timetable, invoice, sign, manual.

Each line is also a picture search for step 4.

## 2. Category and benchmarks

1. Name the category and its 2–3 **most distinctive** players (not the most famous).
2. Capture their first screen and one key control if you can browse (any browser tool you have, or
   `node <skill>/scripts/inspect.mjs <url> --quick --out .turbo/refs/<name>` — ignore its findings, keep the pictures). Dissect 6–10
   visible elements, each as *what it looks like* + *why*. If the dissection only yields "clean, whitespace,
   one accent", go deeper or pick another brand. Can't browse: write "from memory, unverified" and treat the
   type, colour and key-visual fields as the most likely to be model defaults.
3. Sort what you saw: **baseline** (users expect it — cart top-right, filters above results: keep), **trope**
   (the default layout everyone uses: at least one direction breaks it), **face-collision** (same type,
   palette and key visual as a benchmark: never).

Category tropes to break at least once per round:
- landing page: hero → features → testimonials → final CTA;
- admin/dashboard: left sidebar + top bar + card grid;
- e-commerce: big banner, product grid, footer;
- AI and developer tools: black ground, purple-blue glow orbs, particles, identical pill buttons;
- chat: contacts left, messages right; social: bottom tabs, feed, floating action button;
- local craft/food: cream paper, rust accent, serif italic, hand-drawn illustration, "since 19xx".

## 3. Tone — five scales, with evidence

| Scale | Poles | Seen in |
| --- | --- | --- |
| Energy | quiet ↔ loud | saturation, contrast, collision |
| Finish | raw ↔ refined | edges, grain, alignment strictness |
| Density | sparse ↔ dense | whitespace, layering, grid discipline |
| Weight | light ↔ heavy | type weight, colour-block area |
| Seriousness | playful ↔ solemn | radius, illustration language, motion amplitude |

Write "this product is X → each scale takes which end", from the audience and the content. The commonest
failure: evidence says loud and raw, the build delivers beige cards, soft shadows and big whitespace — "quiet
premium", the model's resting state. When evidence locks the tone, all three directions stay in it and differ in
composition, colour and key visual. **No quiet-minimal "safety" option.**

Vague words must become decisions:

| Word | Becomes |
| --- | --- |
| premium | which kind; then type contrast, separation method, spacing scale, hue count |
| refined | tolerances: tracking, grid alignment, max shadow levels, max hues |
| restrained | accent ≤ 5–10% of any screen, motion amplitude ceiling, hue ceiling |
| bold / epic | display size (vw), key-image share of the first screen, light/dark contrast |
| warm | a low-chroma stone, a deep ink, a photograph or a full warm field — never beige |
| clean / simple | density tier, plus what is deleted and why |
| modern | delete the word |

## 4. Idea engines — where a direction starts

Not an adjective. One of:
- **The subject's output** on the page as material (a camera that prints poems delivers its copy as slips).
- **Its object or shape**: cross-section, silhouette, enlarged, cropped, as the frame or the one motif.
- **Its name** as architecture.
- **Its place**: one view that makes someone want to be there.
- **Its ritual**: a sequence the page performs as it scrolls.
- **Its artefact**: the printed thing of its world (ticket, label, timetable) as the page's grammar.
- **Material × environment**, **a specific scene** (time, place, light), **a character archetype**.
- **A borrowed category** that owns the feeling this one lacks (a bakery dressed as a weather report).
- **Deliberate rule-breaking**: radical asymmetry, dissonance, unsettling space — still fully usable.

**Colour firewall**: the engine decides structure, feel and motion; colour is decided separately, from the
subject's real colours (brand, product, material, place, content). Never take the metaphor's material colour
(brass, wood, darkroom red) as the palette — different products then collide into the same one.

## 5. First-screen skeleton — before any copy

Ask: what does the visitor come to the first screen to see or do?

**Persuasion pages** (landing, brand, launch, event, portfolio) choose one skeleton:
full-bleed picture with type in its safe zone · one centred object or sentence · the picture is the interface
(the product UI or object fills the screen; title and nav grow on it) · full-bleed type, cropped by the edges ·
full-width stacked headline with content directly beneath · grid collage (no single protagonist) · vertical or
diagonal type · **left/right split — the model default: at most one direction per round, with a reason, and the
other half holds a scene, not a small screenshot.** Draw it as a 3–5 box wireframe: what each box is, its share
of the screen, where reading starts.

**Product screens** use workspace skeletons instead: list + detail · board (columns = states) · timeline /
schedule · table + inline editor · map · calendar · single focused form · command surface. Record the chosen one
as the fingerprint `skeleton`.

**Content and tool pages** (shop, gallery, feed, docs, admin, app): the first screen **is** the first row of
content or the workspace. Nav + title + filters ≤ 1–2 rows; the first content row complete above the fold; no
slogan, no paragraph explaining the page.

## 6. The deck — randomness against the attractor

*Pages only — the library is page-shaped; product screens skip it.* A model asked to invent a look returns
the category default. The deck deals researched directions at random
within what fits, and remembers recent deals:

```bash
node <skill>/scripts/deal.mjs --sector <s> --brief "<one line>" [--tone quiet|bold|warm|technical|playful|luxury|editorial] [--have photography,product-ui,…] --options 3
node <skill>/scripts/deal.mjs <same args, no --options> --direction <id>   # the full sheet: type, palette, hero and section blueprints
```

At least one of your three directions is a dealt one, considered seriously. If you build a dealt direction,
adopt its sheet; redraw a slot (`--redraw hero|type|palette|section:<role>`) only for a reason you can state
(brand conflict, missing asset, content that does not fit) and record it. The sheet's house rules are a subset of
this skill's; where they disagree, this skill wins. If the subject has unmistakable colours of its own, keep the
dealt **proportions** and take the colours from the subject.

## 7. The direction card (one per direction)

| Field | Content |
| --- | --- |
| North star | one sentence: the first feeling, what the page revolves around |
| Idea | "On this page, [subject's own thing] becomes [device]" — passes the competitor test |
| Engine | which kind, what exactly, from which inventory line |
| Skeleton | the first-screen skeleton + 3–5 box wireframe; for apps: objects above the fold, header rows |
| Type | display and text faces, weights, the size jump (display ≥ 4× body on pages) |
| Colour | ground, ink, accent (+ fields), hex/OKLCH, and the sentence saying where in the subject it comes from |
| Key visual | which picture or drawing carries identity: own, found, generated, drawn, or type itself |
| Controls | one sentence: radius, stroke, fill, what happens on press, how selection shows |
| Motion | the signature move, named as an action + a physical object from the subject's world |
| Live thing | what the visitor does or sees that is different for them |
| Structural break | the one deviation that changes structure (not a flourish) |
| Gives up | the common practices this direction refuses |

## 8. Difference test (before building)

- Compare the **wireframes**, not the descriptions. Same masses = same skeleton → re-pick.
- Any two directions share **at most one** of {skeleton, type, colour, key visual}.
- Never split directions by lightness ("one light, one dark, one warm" is the named failure).
- At least one goes to the extreme; at most one is a compromise.
- At least one breaks the category trope; none collides with a benchmark.
- Blind look: cover the names — can you still say how each one feels different?

## 9. Fingerprint and memory

Every build records a fingerprint in `.turbo/log.json` (newest first, 20 kept):

```json
{ "date": "2026-10-14", "brief": "Harbour Ropes · rope yard", "skeleton": "full-bleed type", "displayClass": "condensed-heavy",
  "groundBand": "dark", "accentHue": "cool", "signature": "shutter image", "source": "deal:loud-flat-poster" }
```

`groundBand`: light (L > 85%) / mid / dark (L < 30%). `accentHue`: warm (10–60°) / cool (200–300°) / neutral /
other. `displayClass`: grotesk, condensed, extended, heavy, geometric, rounded, serif-display, serif-text, slab,
script, mono. A new build differs from **each of the last three** on at least two fields. Projects with a
`DESIGN.md` or a locked brand invert this: pages share the system.

## 10. Choosing and asking

Interactive: one message — your reading (audience · action · tone, inferred), the three cards in 3–4 lines
each, your recommendation and why (task fit, distinctiveness, content capacity, readability, cost), and only a
blocking question if one exists. Then stop. If the user wants to see them, build the three first screens (one
file each, shared copy, one viewport, no motion) and put them side by side.

Unattended or "just build it": pick, write one line why, go. Either way, the chosen card goes into
`direction.json` and its north star is what the reviewer receives.
