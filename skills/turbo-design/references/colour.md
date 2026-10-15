# Colour

## Where colour comes from

In this order: the brand's own assets → the physical product or its material → the place (its paint, its
landscape, its light) → the content imagery → a dealt palette, keeping its proportions and swapping in the
subject's hues. Write the one sentence that says where each colour comes from; the reviewer receives it.

Never from: the idea engine's metaphor material (brass, wood, darkroom red), the category default
(SaaS blue, AI violet, craft cream-and-rust), or "warm" / "premium" as a mood.

## Roles

```css
:root {
  --bg: …;        /* the ground, 70–90% of most screens */
  --surface: …;   /* one tone step from --bg: 2–6 lightness points, nothing else */
  --ink: …;       /* running text, ≥7:1 on --bg (4.5:1 floor) */
  --muted: …;     /* secondary notes, ≥4.5:1 */
  --accent: …;    /* the action and at most one other recurring thing */
  --accent-ink: …;/* text on --accent, ≥4.5:1 */
  --field-1: …; --field-1-ink: …;   /* optional full-bleed section grounds, each with its own ink */
  --focus: …;     /* ≥3:1 against every ground it appears on */
}
```

- Every colour in the build references a role. No raw hex/oklch/rgb downstream; a needed value becomes a token first.
- OKLCH is the recommended notation (perceptual steps are predictable); the browser normalises either.
- No greys between roles. Neutrals may carry a trace of the accent hue (chroma 0.005–0.015) or none; decide once.

## Proportions

- One ground, one ink, one accent. The **accent is the action colour**: it stays **under ~5% of any screen** on pages; in apps it marks the
  primary action and the selection. An accent in ten places means nothing.
- Never put the accent on headings, icons, bullets, borders or underlines by reflex.
- A **motif or field colour** is not the accent: a dealt one-motif shape or a full section ground may be large.
  Then the action takes another colour (or the ink) so the button still stands out.
- **Fields**: a section may change the whole ground, edge to edge, hard cut, no fades. Neighbouring fields differ
  in lightness; each has its own ink (never `--muted`). Order of strength: strong → rest → surprise → close.
- Surfaces are separated by a tone step or space, never by a line plus a shadow.
- Status colours (apps) are separate from the accent and never the only signal (a word, an icon shape, a
  position carries it too). Red/green alone fails ~8% of men.

## Contrast

Body text 4.5:1 minimum, 7:1 target. Display ≥24px (or ≥18.66px bold) 3:1 minimum. Icons, control
boundaries and the focus ring 3:1. Placeholders and helper text 4.5:1. Text over photographs: a neutral scrim
(black or ink at 30–55% over the text area only) or a different crop — check the screenshot, the meter cannot
read pixels behind text. Never lower opacity on text without re-checking.

## Dark grounds

`color-scheme: dark`. A tinted deep ground (L 12–18%), a soft light ink (L 90–95%), not #fff on #000 unless
that is the direction. Muted still 4.5:1. Depth from a lighter surface step (+~3% L per level), never glows or
coloured shadows. Lighter weights. If the product supports both modes, design both from the start with the same
roles and re-check every contrast pair in each; the hue never changes between modes.

## Banned families (measured)

| Family | Range (HSL) | Status |
| --- | --- | --- |
| Cream ground | h 22–62°, s ≥ 16%, l 88–99.5% | warn alone; **fail with terracotta** |
| Terracotta / rust / clay | h 6–30°, s 38–85%, l 42–72% | fail (license only if the subject is brick/rust; `brand.owns` if it is the brand) |
| AI violet / indigo | h 244–295°, s ≥ 42%, l 30–80% | fail (brand-owned only) |
| Purple→blue, cyan→magenta, orange→pink gradients; mesh blobs; neon-on-black glow | — | fail |

"Warm" means a low-chroma stone, bone or putty (saturation under ~15%), a deep green, brown or oxblood ink, a
photograph, or a full flat warm field (mustard, tomato, pink) — never beige paper with a rust button.
