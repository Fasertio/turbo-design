# Motion

A static page looks like a screenshot; a page that needs motion to look finished is not finished. Build still
first; motion is the last layer, and every move answers: what is it for (origin, confirmation, continuity,
explanation, or the one signature)? How often will it be seen (hundreds of times → none)?

## The layer

**Pages** (`profile: page`) — measured: the inspector fails under 8 moving elements, warns under 14.
1. **One signature move**, named on the direction card as an action + a physical object from the subject's
   world, done well (masked headline rise, shutter image, scaling wordmark, pinned story, index with preview,
   curtain footer, slow crossfade, colour by chapter, a scroll-driven one-take…). Each technique once per page.
2. **Entrances for the parts of every section**, by content, once, never replayed:
   | Content | Entrance |
   | --- | --- |
   | headline | rises from a mask by line, 700–900ms |
   | text | follows 60–90ms later, rising 16–24px with opacity |
   | picture | mask reveals from the subject's side while scaling 1.08 → 1 |
   | cards, objects, price tags | settle with a little weight; the next pulled by the previous |
   | lists, timelines, steps | unfold in reading order |
   | numbers | roll to the value, high digits settling first |
   | paper, labels | fast-then-slow with a small rotation that rights itself |
   **Never one identical fade-up for every block.** Single section entrance ≤ 900ms total.
3. **Feedback on every control**: press, hover (behind `(hover: hover) and (pointer: fine)`), focus.
4. **One moving picture**: a clip, a slow drift or scale on a photograph, or a scroll-linked move on the hero.

A **stillness** direction (one quiet instrument) licenses `still-page`; it still has control feedback.

**Product UI** (`profile: app`) — the three basic motions, nothing decorative:
1. primary-action feedback (press responds at ~80ms; completion hands over a result in place);
2. one state change that shows where things come from and go (select, expand, add, remove, view switch);
3. one entrance on first visit, protagonist first. No scroll narrative, no smooth scrolling, no snap.

## Timing and easing (canonical)

| Object | Duration | Notes |
| --- | --- | --- |
| Press | 100–160ms | `scale(0.97)` immediately, springs back on release |
| Hover colour/underline | 150–200ms | |
| Menu, popover, tooltip | 150–250ms | from the trigger's `transform-origin`, scale 0.96 → 1, never from 0 |
| Panel, drawer, dialog | 250–400ms | farther travel → longer |
| View / page switch | 350–500ms | over 500ms makes people wait |
| Reveal | 500–900ms | |
| Stagger | 40–90ms per item | total ≤ 600ms |
| Exit | 60–75% of the entrance | accelerating |

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* enters and exits */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* things moving on screen */
--t-press: 140ms; --t-hover: 180ms; --t-ui: 240ms; --t-reveal: 800ms;
```

Never `ease-in` on UI, never the browser default `ease` for movement, never bounce or elastic on UI state.
Overshoot only on small objects (a checkmark, a badge), ≤10%; panels ≤1–2% or none. Hover lift 2–4px at most,
one effect per element. Loud/raw directions may use hard cuts and short linear jumps on purpose.

## Recipes (safe by construction)

```html
<script>document.documentElement.classList.add('js')</script>  <!-- inline, in <head> -->
```
```css
@media (prefers-reduced-motion: no-preference) {
  html.js [data-reveal] { opacity: 0; transform: translateY(24px); }
  html.js [data-reveal].is-in { opacity: 1; transform: none;
    transition: opacity 700ms var(--ease-out), transform 900ms var(--ease-out); transition-delay: calc(var(--i, 0) * 80ms); }
}
```
```js
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
const inView = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); });
requestAnimationFrame(inView); setTimeout(inView, 1200); addEventListener('scrollend', inView); // everything already on screen arrives at once; a safety net if the observer never fires 
```

- The `scrollend` call matters: with a negative bottom `rootMargin`, the last lines of the page can never enter
  the observer's root (the page cannot scroll further), so the footer would stay hidden for ever.
- Hidden start states exist **only** under `html.js` and inside `no-preference`: without script, or under
  reduce, the page is in its final state. The inspector checks both.
- Accordion: `grid-template-rows: 0fr → 1fr` (the one accepted layout animation). Tabs/segments: one moving
  indicator. Lists: exits fade, entries fade in, the rest slide to their new places.
- Scroll-linked: `@supports (animation-timeline: view())`, travel under 8%. Pinned stages: `position: sticky`,
  100–200vh, every frame determined by scroll position (reversible), static under 800px if it cannot hold.
  Body text, buttons and forms never parallax or scale.
- Libraries: use the project's (Motion, GSAP + ScrollTrigger); otherwise CSS + IntersectionObserver are enough.
  Never a hand-written scroll listener, never scroll-jacking, never a custom cursor.

## Reduced motion and performance

"Fewer and gentler, not none": keep opacity and colour changes, drop travel, scale, parallax and autoplay.
Animate only `transform`, `opacity`, `clip-path`, `filter`; name the properties (never `transition: all`);
`will-change` only around an animation; pause loops off-screen and in hidden tabs; business state updates
immediately, never waiting for an animation; animations are interruptible.

## Signature recipes (named by the deck)

- **Masked line reveal** — each headline line in `<span class="line"><span>…</span></span>`; `.line { overflow: hidden;
  padding-bottom: .08em; margin-bottom: -.08em }`; inner span from `translateY(105%)` to `none`, 900ms ease-out,
  `--i × 110ms` stagger. Once per page at most; used by reflex it is an anti-slop attractor.
- **Image shutter** — the frame goes `clip-path: inset(0 0 100% 0)` → `inset(0)` over ~1100ms ease-in-out while the
  picture inside scales 1.12 → 1 over 1500ms. **Observe the frame's visible wrapper, not the clipped element**: a
  target clipped to nothing never intersects and never reveals (the inspector reports `never-revealed`).
- **Pinned story** — a `position: sticky; top: 18vh` column in a 5fr / 7fr grid; the other column scrolls its items;
  static stack under 800px; the pin lasts at most two screens and something changes at each.
- **List with image preview** — rows of text; the hovered/focused row brings its picture into one fixed frame and the
  other rows drop to 0.35 opacity; on touch the picture sits inline under the row.
- **Scroll-linked progress** — `@supports (animation-timeline: view())`: animate `scale` or `translate` under 8%
  travel; nothing that carries text.
