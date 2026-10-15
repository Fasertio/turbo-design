# Layout, space, responsive

## Grid and edges

- One grid, one pair of margins used everywhere: `--margin: clamp(1rem, 2.2vw, 2rem)` (16–32px); gutter
  `clamp(0.75rem, 1.4vw, 1.5rem)`; 12 columns on desktop. Large things run to the edges.
- No reflexive centred container (`max-width: 1200px; margin: auto` is the stock look). Constrain the
  **measure** in `ch`; cap very wide screens at ~1760–1920px.
- Text blocks share **2–3 left edges** on the whole page. Six different left edges means things were placed one
  at a time.
- Never draw the grid (no crop marks, crosshairs, ruler lines, exposed columns) unless licensed.
- Spacing on a 4px base with named steps; `gap` for siblings, margins only for optical corrections. The parent
  owns the space between regions; components own only their inside.

## Rhythm

- Gaps between sections clearly larger than any gap inside one: **120–220px desktop, 72–112px phone**.
- Each section a different composition from its neighbours: statement, split, list set large, table,
  full-bleed picture, mosaic, index, pinned, band of colour. A shape used three times is the template showing.
  Repeated modules only for real archives (a work index, a menu, a schedule).
- Break the system once, on purpose.
- **Fullness**: each desktop screen is a poster with one dominant thing and the content it carries. A screen
  that is mostly empty ground is an underbuilt section; one deliberate rest per page.
- Asymmetry and bleeding are fine; reading order and local alignment stay clear. Intentional asymmetry is not "fixed".
- One containment layer at most. Content on the canvas; boxes only to group, select or delimit something operable.

## First screen

- One dominant element: display type at scale, or one picture covering at least a third of it (top sites: hero
  media covers half the first screen 68% of the time).
- It answers the first question in large type and holds one real primary button (≥44px), unless the direction
  is deliberately a pure poster with the action in the nav.
- Height comes from content; `min-height: 100svh` only for a full-bleed picture; never `100vh`.
- Hero stack: at most headline + one supporting sentence + action (+ the key visual). No pill above, no trust
  strip, no bullet list, no second CTA row.

## Navigation and footer

- Navigation: wordmark, 3–5 plain links, one action. On desktop at most ~1/10 of the first screen; on phones
  one row, the rest in a full-screen "Menu" sheet. No bar chrome by reflex, no floating blurred pill, no
  hairline + frosting. A fixed nav never sits on content.
- The footer is a designed close: the name back at full width, the hero inverted, a closing scene, or one quiet
  line with the essentials (address, hours, contact, credits). Link columns only for real hubs and docs roots.

## Responsive — the hard floor

Checked by the inspector at 1440, 768, 390 and 320px (apps: 1440, 1024, 768, 390).

- No horizontal scroll at any width: `html, body { overflow-x: clip }` (never `hidden`, it breaks sticky);
  image-bearing grid tracks `minmax(0, 1fr)`; display heads `overflow-wrap: anywhere; min-width: 0`; never
  `width: 100vw`.
- No clickable label on two lines; touch targets ≥44×44px (never under 24px); inputs ≥16px text on phones.
- The phone layout is **its own composition**: re-authored line breaks, portrait re-crops, section heads in one
  column, nothing shrunk into illegibility, margins 16–20px, body 16–18px.
- `svh`/`dvh` for full-height; `env(safe-area-inset-*)` with `viewport-fit=cover` when edge-to-edge.
- Reserve 30–40% extra width for German/Russian/Finnish labels; use logical properties.
- Tables on phones: redesign (stacked rows with labels) or let the table scroll inside its own container with
  a visible cue — never the page.
- Mobile-first `min-width` breakpoints in rem: 40rem (type steps), 60rem (layout), 90rem (wide).
