# Copy — the argument, the words, the honesty

## 1. The argument decides the sections

Before design, write the page as claims with their proof, one line per section:

```
Hero       — claim: Harbour Ropes lays rope by hand on a 60-metre walk.                proof: the walk, a coil being laid
Ropes      — claim: three fibres, sold by the metre.                                    proof: fibre, thickness, price, use
Visit      — claim: the yard is open on Fridays.                                         proof: hours, what you see, how to order
Place      — claim: it is on Quay 4.                                                     proof: the map, how to get there
```

A section without a claim is deleted. The order follows the argument, not a template. "Testimonials" exists
only if real quotes exist; "stats" only if the brief gives the numbers.

## 2. Headlines — the two-line arithmetic

`characters per line ≈ line width ÷ (font size × k)` — k ≈ 0.40 condensed, 0.50 most grotesks and serifs at
display size, 0.58 wide faces and capitals.

| Context | Width | Size | Chars/line | Two-line budget |
| --- | --- | --- | --- | --- |
| Phone 390px, 20px margins | 350px | 44px | ~16 | **~32** |
| Phone | 350px | 34px | ~21 | ~42 |
| Tablet 768px | 690px | 64px | ~22 | ~44 |
| Desktop full width | 1100px | 104px | ~21 | ~42 |
| Desktop half width | 620px | 72px | ~17 | ~34 |

- Hero headline: 4–6 words, ≤32 characters survives everywhere. Section headings: 2–5 words.
- Control breaks: `max-width` in `ch`, `text-wrap: balance`, `&nbsp;` before the last short word and between
  a number and its unit. Never fix length only by shrinking: five words at 64px beat nine at 28px.
- A headline is a title or a statement of fact, nominal or imperative; not a gerund, not a question nobody asked,
  not a colon ("Ledgerly: invoicing for…"), not a tricolon, not "X, reimagined".
- First screen answers the visitor's first question in large type: for an event what/when/where (dates at the
  headline or second size, never only small); for a product what it is and what it costs or does; for a person
  who and what they do.

## 3. The supporting line, buttons, navigation

- One supporting sentence, ≤22 words, never restating the headline.
- Buttons: 1–3 words, named for what happens ("Order a coil", "See the fibres", "Save draft"). One name per
  intent site-wide. One primary per screen. At most one arrow glyph, on the primary. ↗ only for external links.
- Navigation: wordmark, up to five single-noun links, one action. Labels are what the sections are called.

## 4. Banned phrases

**English** — unlock, unleash, supercharge, elevate, empower, streamline, seamless(ly), effortless(ly),
robust, cutting-edge, next-gen(eration), world-class, best-in-class, all-in-one, blazing/lightning fast,
revolutionise, game-changer, reimagine, delve, tapestry, leverage, synergy, holistic, turbocharge, "transform the
way", "take your … to the next level", "say goodbye to", "in today's …", "the future of", "built for the modern",
"where X meets Y", "not just X, it's Y", "more than (just) a", "crafted with care/love", "experience the power of",
"innovative solutions", "Welcome to", "Meet …".
**Italiano** — soluzioni innovative, a 360 gradi, all'avanguardia, eccellenza, esperienza unica, il futuro di,
rivoluziona, senza compromessi, qualità e passione, passione e tradizione, il partner ideale, ti accompagna,
su misura per te, a portata di click, "non solo …, ma …", "scopri il nostro mondo", "dal 19xx" usato come ornamento.
**Pretend-editorial labels** — Field notes, The details, Our philosophy, Quietly trusted by, Il nostro manifesto.
**Furniture text** — coordinates, local time strips, "Est. 2024", version stamps, "Scroll", "(Scroll to explore)",
fake photo credits, "Available for work" with a dot, strings joined by middle dots or slashes.
**Buttons** — Learn more, Get started, Click here, Read more, Discover more, Explore now, Submit, OK, Continue
(except as secondary in a multi-step flow), Scopri di più, Clicca qui, Inizia ora, Leggi di più, Invia.
**Habits** — em dashes (one or two per page read as writing; ten read as a model); three parallel items
everywhere (use the number the content has); captions narrating the design ("A clean, minimal layout for…");
"Step 1 / Phase 02" duplicating numbers; "AI-cute" wordplay and fake-craftsman tone.

## 5. Honesty

- **Never invented**: customers, logos, named quotes, reviews, star ratings, press, user counts, uptime,
  percentages, benchmarks, awards, "as seen in". Every number on the page is in the brief; list them in
  `direction.json` `"facts"`.
- **Sample details are expected** where the brief leaves gaps, so the design is seen at full density: dish names,
  room names and rates, speakers and talks, ticket rows. They are listed in the report for the client to replace.
- **Sample data looks real**: uneven numbers (1,238 users, +1.83%, €14.50), mixed times ("just now",
  "yesterday 16:12", "14 Mar"), long and short names, realistic edge cases. No John Doe, Jane Doe, Mario Rossi,
  Acme, Nexus, "Title", "Description", every item "2 hours ago". Collections of demos share one fictional scenario.
- **Disclaimers go in the report, never in the UI**: no "Example", "Illustrative", "Button not wired",
  "Foto da fornire" on the page. The page never shows its own to-do list.
- **No form backend**: the primary action goes to the real destination; otherwise a `mailto:` with subject and
  body filled from the visitor's choices, or `#checkout` flagged in the report. Never a fake payment form.

## 6. Microcopy

- Error: what happened (past tense) → why → what to do (imperative). Never blame the user, no "Oops!", no
  exclamation marks, no humour in frustration paths (payment failed, locked out).
- Empty state: what is empty, why it matters, one action.
- Loading: under 2s a spinner or skeleton only; over 2s say what is happening; over 10s show progress and an
  honest estimate.
- Success: silent when the user can see the result; otherwise state the result itself ("Copied: invoice-0412.pdf").
- Punctuation: curly quotes, real ellipsis (…), en dash for ranges (10–20), non-breaking space before units,
  tabular figures in columns, sentence case (not Title Case) for UI labels.

## 7. Self-audit before markup

Read every visible string once, aloud in your head. Delete anything that would fit a competitor unchanged,
anything a person would not say, anything that explains the design, and every word that exists to balance a
layout. Read it again in the page's language (an Italian page is written in Italian, not translated English).
