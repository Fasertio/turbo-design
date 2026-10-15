# Imagery — real pictures, honestly

"Assets are the starting point of design, not decoration filled in after layout." Ask first: if only one
picture, one title and one action remained, which picture deserves the spot? Build around it.

## 1. Order of preference

1. **The project's own**: its photographs, product shots, real interface, real output.
2. **Generated**, if an image tool is available (§4). Never posing as the real product, room, dish, person or team.
3. **Real pictures of the subject's world from open collections** — its street in old postcards, an old map of
   the neighbourhood, its material up close, its trade in engravings, a museum object of its kind:
   ```bash
   node <skill>/scripts/assets.mjs "<place or material> postcard" [--orientation landscape]
   node <skill>/scripts/assets.mjs "<process>" --video
   node <skill>/scripts/assets.mjs --get <ref>,<ref>        # downloads into assets/, records the licence
   node <skill>/scripts/assets.mjs --credits                # the footer credit line + the report list
   ```
   Search the inventory, not the category ("<town> harbour 1920", "<craft> engraving", "<region> old map").
   Look at each before choosing. Safe licences by default (CC0, PD, BY, BY-SA); say in the credit if you altered
   a share-alike picture (greyscale counts).
4. **Drawn in code from the subject** — its objects, tiles, windows, its product's interface — in one flat
   graphic language, the palette's real colours, three levels of detail (big shape, middle structure, small
   detail), drawn large, returning as a motif. Mark it in the report as a stand-in.
5. **Type and colour alone** — a legitimate direction (type-only pages scored well in the study), licensed as
   `few-pictures` with the reason; type then carries the page at 10vw+ with fields of colour.

**The floor (pages, measured)**: at least four real pictures, usually six to twelve; SVG drawings do not count;
interface fragments count for software. Add one moving picture where an honest clip exists (muted loop, poster).
Filler to reach the count is worse than a type-only license: every picture has a one-sentence job (show an
object, explain a relation, build the feeling); no job, no picture.

## 2. Never

A grey or dashed "image here" box · stock people at laptops · 3D blobs, glow orbs, particles, isometric clip art,
corporate doodle people · a found picture presented as the client's own · a fake dashboard of grey bars ·
device mockups and hand-drawn browser chrome · tilted polaroids, duotone washes, heavy grain, vignettes,
colour washes · hotlinked images (download them) · watermarks, burned-in text, scanner edges, recognisable
living people in found pictures · a picture lying over a headline.

## 3. Crops and treatment

- One dominant picture beats six small ones. Hero media covering half the first screen is the strong default.
- A small set of ratios (e.g. 4:5, 16:10, 1:1), `object-fit: cover` with an `object-position` per picture,
  bleeding to edges where the composition allows. Corners square, or one radius for all.
- One treatment for all pictures on the page: untouched, or greyscale `grayscale(1) contrast(1.05)`, or
  multiply on a light field, or `brightness(.85) contrast(1.05)`. One family per page (all engravings, or one era).
- Separate phone crops for pictures whose subject is off-centre.
- Captions: one short line, small, left-aligned, true (from the source). Credits at body size in the footer.
- Markup: `width`/`height` or `aspect-ratio`; `loading="lazy"` except the hero (`fetchpriority="high"`);
  `alt` in plain words, `alt=""` for decorative repeats; a background colour on the container while loading.

## 4. Generated images

Prompt in this order, one or two sentences each: subject and action → the job it does on the page → the exact
ground colour (hex) it will sit on → composition with a 10% safe margin and where text will go → one light
direction → material and finish → what must not appear (text, logos, extra hands, watermark). Pick the most
*layout-able* result, not the most detailed. Regenerate at most once; then adjust the layout. Continue the
picture into the page where it helps (a line in the image becomes a rule in the layout, a cut-out overlaps
the type), and keep generated pictures in one family.

## 5. Software and product UI

The product demonstrates itself: build a real HTML fragment of the interface at true size, with believable
data and one item hovered or selected; mark its root `data-ui` and scope its CSS under `[data-ui]` (the
inspector then lets it keep its own borders and sizes). No device frames (a plain rounded rectangle for a phone
app at most). Show real screenshots large and uncropped at least once. Interface fragments never wrap a heading
or more than ~1.5 screens.

## 6. Video

5–20s clips that loop invisibly, under ~5MB per section (10MB hero), 720p, one per page (two at most):
`<video autoplay muted loop playsinline preload="metadata" poster="…" width height aria-hidden="true">`.
Under reduced motion: remove autoplay, pause, show the poster. Never under body text; a headline over a clip gets the scrim.
