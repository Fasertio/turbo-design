# Type — one canonical set of numbers

Where common guidance disagrees, these are the values.

## Choosing faces

- **One or two families.** One is normal (a third of the studied sites); two is the limit; a third only for
  literal code. Weights: only those you use, usually two or three. Never synthesise bold or italic.
- **The display face comes from the direction**, with a reason in the subject (its signage, its era, its
  material, its voice). Attractor faces are banned as display unless the brand owns them: Inter, Inter Tight,
  Geist, Roboto, Open Sans, Poppins, Montserrat, Lato, Nunito, Raleway, system-ui, Space Grotesk, Instrument
  Serif, Instrument Sans, Playfair Display, Fraunces, DM Sans, DM Serif Display, Plus Jakarta Sans, Outfit, Sora,
  Manrope, Syne, Cormorant Garamond, Clash Display, Cabinet Grotesk, Satoshi, General Sans.
- The deck's type systems (`deal.mjs`) map free faces to the paid ones they stand in for; use them or choose
  from Google Fonts / Fontshare with the same care. Load exactly the weights used, `font-display: swap`, a
  same-kind fallback stack; in frameworks `next/font` or self-hosted `@font-face`.
- Product UI may keep a neutral text face (including the brand's own); the identity then lives in the display
  moments, the numbers and the control grammar.

## Scale (pages)

At most five steps, far apart, nothing between lead and heading:

```css
--step-small:   clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);   /* 13–14px: captions, credits */
--step-body:    clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);     /* 17–19px */
--step-lead:    clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);       /* 20–26px */
--step-head:    clamp(2rem, 1.3rem + 3.2vw, 4rem);              /* 32–64px */
--step-display: clamp(3rem, 1rem + 9vw, 9rem);                  /* the hero blueprint may override */
```

- Display ≥ 4× body on desktop. Strong pages put their largest type at ~8vw or more (study median for top
  sites: 8.4vw; weak: 5.0vw). A type-only direction goes to 10–14vw.
- Phone hero 32–56px; headlines still two lines or fewer.

## Scale (product UI)

`12/13` meta · `14–15` body (13–14 only for dense all-day tools) · `16–18` section titles · `20–28` page title ·
one display moment if any (a balance, a count) at 32–56px. Tables 13–14px with tabular figures.

## Setting

| | Line-height | Tracking | Measure |
| --- | --- | --- | --- |
| Display, mixed case (>40px) | 0.9–1.05 | −0.02 to −0.05em, tighter as size grows | `max-width: 14ch`, `text-wrap: balance` |
| Display, all caps | 0.95–1.05 (check glyph collisions) | 0 to +0.03em | ≤ 6 words |
| Headings 24–40px | 1.05–1.2 | −0.01 to −0.02em | `text-wrap: balance` |
| Body (Latin) | 1.45–1.6 | 0 | 45–75 characters (`max-width: 62ch`) |
| Body (CJK) | 1.6–1.75 | 0 | ≤ 40–46 characters |
| CJK headings | 1.2–1.35 | 0 | manual semantic breaks |
| Small text | 1.4–1.5 | 0 to +0.01em | — |

- Optical overhang on huge display: `margin-left: -0.05em`. Viewport-wide lines: `font-size ≈ container ÷
  (characters × k)`, `white-space: nowrap`, the container clips.
- Space above a heading ≥ 2× the space below. Headings `hyphens: none`; paragraphs `text-wrap: pretty`.
- Running text in the full ink; muted ink only for secondary notes, never lighter than 4.5:1, never smaller than 13px.
- Tabular figures (`font-variant-numeric: tabular-nums`) wherever numbers align or change.
- Links in running text: `text-underline-offset: 0.18em; text-decoration-thickness: 0.07em`. Never change
  weight on hover (it reflows).
- On dark grounds drop one weight step or add +0.01em.

## Never

Text under 13px that is meant to be read (12px meta in apps at most) · a headline over two lines · a styled
accent word · italic display · all caps over three words in running text · justified text · centred paragraphs
over three lines · text-shadow, outline stroke or gradient fill on type · condensed faces for body · fixed
heading heights that clip a wrap · an orphan of one or two characters at a line end in CJK.
