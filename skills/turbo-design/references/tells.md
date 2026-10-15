# Tells — the registry of what reads as generated

A **tell** is a device produced by default, without a reason that comes from the subject. The same device,
chosen because the subject owns it, is a decision. It draws on a study of 247 award-gallery sites and on what
unguided builds actually produce. `[id]` is the inspector/lint rule that measures it.

Three tiers:

- **Hard bans** — never shipped. No license lifts them. A brand that already owns a colour (`brand.owns` in
  `direction.json`) is the only exception, and only for colour rules.
- **Licensed defaults** — banned unless `direction.json` licenses them with a reason in the subject's terms.
  Three licenses per build at most. A license is a promise: the device appears where the reason holds and nowhere else.
- **Warnings** — usually wrong; fix, or write one sentence in `notes` saying why it is right here.

Replacements never name a font, colour or component. Every "use this instead" list in the history of this
problem became the next wave of tells. Replacements are procedures: derive from the subject.

## 1. Hard bans

| Tell | Measured by | Do instead |
| --- | --- | --- |
| Cream/beige ground with terracotta, rust or clay accent (the assistant-brand palette) | `palette-claude` | Colours the subject owns: its material, its street, its product, its landscape. Warmth from a stone or bone under 15% saturation, a deep ink, a photograph, a full warm field. |
| Indigo / violet / purple-blue accent, glow orbs, neon on near-black | `palette-purple`, `gradient`, `shadow` | Same. Abstract tech gets a tangible object of the subject, never orbs or particles. |
| Gradient-filled text | `gradient-text` | Solid ink. |
| One word of a headline styled apart: italic serif, another colour, underline, highlight, pill | `accent-word` | One face, one colour, roman. Emphasis from the words, the size, the position. Italic belongs to running text and titles of works. |
| Eyebrow / kicker: a small label, pill badge ("New ·", "Introducing", "Beta") or numbered tag above a heading | `eyebrow` | Fold the information into the heading or the first sentence. A date, price or place goes after the heading at body size, or becomes the heading. |
| Headline wrapping past two lines at any width | `headline-lines` | Cut words, then widen the measure, then size down. A statement (≤25 words) is a `<p>`/`<blockquote>` at ≤36px desktop / 24px phone. |
| A row of identical cards each topped with a small icon | `icon-cards` | A composed section: a list set large, a split with a picture, a table, one picture per item, a statement. |
| Card inside card; boxes at every level | `nested-cards` | One containment layer. Content directly on the canvas; boxes only to group, select, or delimit an operable area. |
| Coloured stripe on one side of a card or callout | `side-stripe` | State shown by the content itself (a word, a filled marker, a tone step on the whole row). Quotes and the current nav item are exempt. |
| Emoji as icons, bullets or decoration | `emoji` | Words, one consistent icon set, or a real picture. |
| Hand-drawn browser bar (three dots), phone frame, IDE window around code | `fake-chrome` | The real interface at true size (`data-ui`), a real screenshot, or the content alone. |
| Fake dashboard of grey bars and donuts as a hero picture | review | A real interface fragment with believable data, or no picture. |
| Grey or dashed "image here" box; "Foto da fornire"; lorem; Jane Doe; Acme | `placeholder`, `placeholder-box` | Write the content. Find, generate or draw the picture. Gaps go in the report, never on the page. |
| Invented proof: "Trusted by 10,000+ teams", "+47% conversion", "10× faster", 4.9★, logo walls, named quotes | `claim` (warn), review | Only numbers and endorsements from the brief (listed in `facts`). Otherwise a different section. |
| Shadow or gradient on a button; glow; text-shadow | `button-fx`, `text-shadow` | Flat fill, one colour. Legibility over photos from a neutral scrim. |
| Clickable label wrapping to two lines | `wrapped-control` | 1–3 words, `white-space: nowrap`, or move it into a menu. |
| Unreadable contrast; running text under 15px on a page (13px in an app) — captions and credits may be 13–14px; multi-line text leading under 1.3 | `contrast`, `body-size`, `tight-leading` | 4.5:1 text, 3:1 display ≥24px; page body 16–20px; leading 1.45–1.6. |
| Content that is invisible without JavaScript, stuck transparent, or never appears under reduced motion | `no-js-hidden`, `stuck`, `reduced-motion-hidden` | Hidden start states only under `html.js`; a safety timer resolves them; under `reduce` everything is in its final state. |
| No visible keyboard focus | `no-focus` | `:focus-visible` outline 2px, offset 2px, ≥3:1, shown instantly. |
| Horizontal scroll at any width; touch targets under 24px on a phone | `overflow`, `small-target` | `html, body { overflow-x: clip }`; `minmax(0,1fr)`; `overflow-wrap: anywhere` on display heads; targets ≥44px. |
| Bounce / elastic / back easing on UI state; looping pulse/ping dots | `bounce-ease` (lint) | Strong ease-out. Overshoot only on small objects (a checkmark, a badge), ≤10%. |
| Elided code (`// ...`, "rest of code", "similar to above") | `lazy-code` (lint) | Write all of it. |

## 2. Licensed defaults

Each is banned until `direction.json` licenses it. Good reasons name the subject; bad reasons name a style.

| Device | Rule | A real reason looks like | Not a reason |
| --- | --- | --- | --- |
| Thin rules, dividers, ruled rows | `hairline` | "a timetable / menu / spec sheet: the rows are data" | "editorial feel", "structure" |
| 1px outlined boxes | `outlined-box` | "form fields and a ticket stub the subject prints" | "clean cards" |
| Monospace outside code | `mono` | "a developer tool: mono shows real commands and output" | "technical vibe", labels, captions |
| Index numbers 01/02/03, "Step 2" | `numbering` | "a real sequence the user follows, marked up as `<ol>`" | rhythm, decoration |
| Small uppercase tracked labels | `micro-label` | "the subject's own signage/labels are set this way (a pharmacy, a rail line)" | metadata, section names |
| Shadows at rest | `shadow` | "objects photographed on a table, shadow is physical" | depth, elevation on cards |
| Gradient fills (non-scrim) | `gradient` | "the brand mark is a gradient" (better: `brand.owns`) | atmosphere, modern |
| Terracotta / rust alone | `palette-terracotta` | "the subject is brick / rust / a red-clay roof" | warmth |
| Backdrop blur beyond one sticky bar | `glass` | "the product UI genuinely uses translucency" | premium |
| Fewer than four real pictures | `few-pictures` | "a type-only direction: type carries the page at 10vw+ and colour fields" | "no images available" |
| A still page | `still-page` | "a stillness direction: one quiet instrument, nothing moves on purpose" | ran out of time |
| An attractor display face (Inter, Geist, Fraunces, Instrument Serif, Playfair, Space Grotesk, DM Sans, Manrope, Plus Jakarta, Outfit, Sora, Syne, Clash, Cabinet, Satoshi, General Sans, Poppins, Montserrat, Roboto, system-ui) | `display-font` | brand-owned (`brand.owns`) | "neutral", "modern" |

## 3. Warnings (fix, or one sentence in `notes`)

Yellow-cream ground `palette-cream` · centred hero stack `centred-hero` (24% of weak sites vs 7% of top) ·
everything centred `all-centred` · one 9–18px radius on everything `soft-radius` · more than ~8 type sizes
`size-count` · soft grey running text `grey-body` · grey text on a coloured ground `grey-on-colour` · neighbouring
sections with the same shape and ground `section-repeat` · two or more rows of boxed cards `card-rows` · floating
pill nav `pill-nav` · dashed borders `dashed` · lines over 75 characters `measure` · more than four em dashes
`em-dash` · default body face `body-font` · no button on the first screen `first-action` · no footage `no-footage` ·
sideways-scrolling rows `side-scroll` · stock phrases `copy`, `copy-it` · generic button labels `cta-copy` ·
`transition: all`, `ease-in`, `scale(0)`, `100vh`, layout animation, scroll listeners.

## 4. Product-UI tells (profile `app`)

| Tell | Rule | Do instead |
| --- | --- | --- |
| Initials avatars in a rainbow of saturated circles | `avatar-rainbow` | Initials in the ink on one neutral tone, or real photos. |
| Every status a tinted pill in its own hue | `pill-rainbow` | Status carried by a word plus one non-hue channel (position, a fill level, a shape); colour reserved for the one or two states that need attention. |
| A row of KPI cards with green/red ± % deltas | `kpi-row` | The numbers the user acts on, where they act on them, with the comparison that makes them mean something. |
| Every list row a rounded card with a coloured left edge | `nested-cards`, `side-stripe` | A real table or list; rows separated by space or a tone step; a hairline license if rows are data. |
| Uppercase tracked column headers and panel labels | `micro-label` | Sentence case at the table's text size, weight for hierarchy. |
| Left sidebar + top bar + card grid, by reflex | review | The workspace the task needs: the object and its actions adjacent, the first row of content complete above the fold. |
| Pill filter chips with dots and counts for every facet | review | A segmented control or a compact select for the one or two facets used daily; counts only where they change decisions. |
| Brand logo + product name on every app screen, page title stacked under it | review | The brand once, small; the task owns the top-left. |
| Mono for every number and ID | `mono` (warn) | Tabular figures in the text face; mono only for literal codes users type. |

## 5. Structural tells (the reviewer checks these)

- The stock sequence: hero → logos → three features → testimonial → pricing → CTA → four-column footer.
- A distinctive first screen followed by stock blocks; the idea running out mid-page.
- Every section the same layout family; one shape used three times.
- Big title left + small paragraph or image right, by reflex (a split is fine once, with a reason).
- The AI nav: wordmark left, four or five links centred, button right, hairline under it, frosting on scroll.
- The AI footer: Product / Company / Resources / Legal columns, social icons, tiny copyright, grey band.
- Mid-section bands of "stats" (3 big numbers) with no source.
- An FAQ accordion of questions nobody asked.
- A page that names its own design ("A clean, minimal layout for…").

## 6. Copy tells

Genre verbs and adjectives (unlock, unleash, elevate, empower, seamless, effortless, robust, cutting-edge,
next-gen, world-class, all-in-one, supercharge, reimagine, delve, tapestry, leverage, streamline, holistic);
the mad-lib headline ("The AI-powered platform for modern teams"); the tricolon ("Fast. Simple. Secure.");
the correction ("Not just a tool, it's a workflow"); "Where X meets Y"; "Welcome to"; questions nobody asked;
pretend-editorial labels ("Field notes", "Our philosophy", "Quietly trusted by"); furniture text (coordinates,
local time, "Est. 2024", "Scroll", "©2026 —", middle-dot strings); Italian equivalents (soluzioni innovative,
a 360 gradi, all'avanguardia, eccellenza, esperienza unica, passione e tradizione, su misura per te, "non solo …,
ma …"); generic buttons (Learn more, Get started, Scopri di più, Inizia ora, Invia); em dashes as a habit;
"Oops!", exclamation marks in errors; round fake numbers (1,000 users, +10%). Full lists: [copy.md](copy.md).

## 7. Motion tells

The same fade-up on every block; a dozen staggered hero entrances; hover lift + scale + shadow on every card;
bounce easing; infinite decorative loops; cursor followers; parallax without depth; reveals that fail and leave a
blank band; scroll-jacking; a pinned headline held for three screens; motion that only exists because a meter
counts it.

## 8. Why removal is not enough — and the next attractor

A page with every tell removed and nothing in its place reads as a wireframe (pale, monochrome, diagrams,
placeholders) — the "avoidance aesthetic", itself a tell. Fill the space with the idea, scale, the full content,
real pictures and fields of colour.

Equally, the anti-slop look has its own attractors. Do not reach for them by reflex either: the viewport-wide
wordmark, archival engravings on a flat field, the street map as the contact section, colour-chapter sections,
masked-line headline rises, square corners with no lines anywhere, a credit line in the footer. Each is good
once, for a subject that calls for it. If the reviewer could name "the turbo-design look", the run failed.
