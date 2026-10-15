// turbo-design / rules — turns probe() + extras() metrics into findings.
// Each finding: { level: 'FAIL'|'WARN'|'LICENSED', id, width, message, fix }.
//   FAIL     a slop signature or a broken page; the work is not done while one remains.
//   WARN     usually wrong; keep it only with a one-sentence reason written into .turbo/direction.json "notes".
//   LICENSED a device that is banned by default but was licensed in .turbo/direction.json with a subject reason.

const inRange = (h, a, b) => (a <= b ? h >= a && h <= b : h >= a || h <= b);
export function colourFamily(hsl) {
  if (!hsl) return null;
  const { h, s, l } = hsl;
  if (inRange(h, 22, 62) && s >= 0.16 && l >= 0.88 && l < 0.995) return 'cream';
  if (inRange(h, 6, 30) && s >= 0.38 && s <= 0.85 && l >= 0.42 && l <= 0.72) return 'terracotta';
  if (inRange(h, 244, 295) && s >= 0.42 && l >= 0.3 && l <= 0.8) return 'ai-purple';
  return null;
}
const hexToHsl = (hex) => {
  const n = parseInt(hex.slice(1), 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return { h: Math.round(h), s, l };
};

// Rules that can never be licensed. Only a brand that already owns the device (direction.json "brand") lifts
// the colour ones; nothing lifts the rest.
export const HARD = new Set(['gradient-text', 'palette-claude', 'palette-purple', 'emoji', 'icon-cards', 'accent-word', 'fake-chrome',
  'placeholder', 'placeholder-box', 'stuck', 'no-js-hidden', 'reduced-motion-hidden', 'overflow', 'broken-image', 'covered-text', 'clipped-text',
  'contrast', 'wrapped-control', 'clipped-content', 'never-revealed', 'no-focus', 'body-size', 'button-fx', 'text-shadow', 'nested-cards', 'side-stripe', 'eyebrow', 'headline-lines',
  'small-target', 'img-alt', 'tight-leading', 'console-error', 'license-limit']);
export const BRAND_LIFTABLE = new Set(['palette-claude', 'palette-purple', 'palette-terracotta', 'palette-cream', 'gradient', 'display-font']);

// Surface profiles. `skip` drops rules that are meaningless for that surface; `tune` adjusts thresholds.
export const PROFILES = {
  page: { skip: [], tune: {} },
  app: {
    skip: ['few-pictures', 'no-real-pictures', 'no-footage', 'still-page', 'focal-point', 'no-hero', 'first-action', 'empty-screens', 'hero-words', 'long-pin', 'statement-length', 'all-centred', 'centred-hero', 'section-repeat'],
    tune: { bodyFail: 12.5, bodyWarn: 14, smallTextPx: 11.5, microFail: 99, microWarn: 8, sizeWarn: 11, hairlineFail: 99, outlinedFail: 99, monoLevel: 'WARN', numberingLevel: 'WARN', fontCountFail: 3 },
  },
  component: {
    skip: ['few-pictures', 'no-real-pictures', 'no-footage', 'still-page', 'focal-point', 'no-hero', 'first-action', 'empty-screens', 'hero-words', 'long-pin', 'statement-length', 'all-centred', 'centred-hero', 'section-repeat', 'headline-lines', 'size-count', 'card-rows', 'kpi-row', 'measure'],
    tune: { bodyFail: 12.5, bodyWarn: 14, smallTextPx: 11.5, microWarn: 4, hairlineFail: 99, outlinedFail: 99 },
  },
};

export function judge(m, x, { width = m.viewport.w, profile = 'page', licensed = {}, brand = [] } = {}) {
  const P = PROFILES[profile] || PROFILES.page; const T = P.tune;
  const out = [];
  const add = (level, id, message, fix) => {
    if (P.skip.includes(id)) return;
    if (brand.includes(id) && BRAND_LIFTABLE.has(id)) { out.push({ level: 'LICENSED', id, width, message: message + ' [brand-owned]', fix }); return; }
    if (level !== 'FAIL' && level !== 'WARN') return;
    if (licensed[id] && !HARD.has(id)) { out.push({ level: 'LICENSED', id, width, message: message + ` [licensed: ${licensed[id]}]`, fix }); return; }
    out.push({ level, id, width, message, fix });
  };
  const mobile = width < 600;

  // --- headlines
  const stmtMaxPx = width < 600 ? 24 : width < 1100 ? 32 : 36;
  const stmtMaxLines = width < 600 ? 4 : 3;
  const isStatement = (h) => h.kind === 'statement' && h.size <= stmtMaxPx;
  const long = m.headings.filter((h) => h.lines > 2 && !isStatement(h));
  if (long.length) add('FAIL', 'headline-lines', `${long.length} headline(s) wrap past two lines at ${width}px: ` + long.slice(0, 4).map((h) => `"${h.text.slice(0, 48)}" → ${h.lines} lines (${h.words} words, ${h.size}px)`).join('; '),
    'Cut words first (a headline is a title, not a sentence). Then widen the measure. Lower the size last. A real statement goes in a <p>/<blockquote> at ' + stmtMaxPx + 'px or less.');
  const longStatements = m.headings.filter((h) => isStatement(h) && h.lines > stmtMaxLines);
  if (longStatements.length) add('WARN', 'statement-length', `${longStatements.length} large statement(s) run past ${stmtMaxLines} lines at ${width}px: ` + longStatements.slice(0, 3).map((h) => `"${h.text.slice(0, 40)}…" → ${h.lines} lines`).join('; '), 'About 25 words at statement size. Cut, or set the rest as body text.');
  if (m.hero && m.hero.words > 10) add('WARN', 'hero-words', `Hero headline is ${m.hero.words} words ("${m.hero.text.slice(0, 60)}"). Gallery median is 5.`, 'Say the one thing. Move the rest to the supporting line.');
  if (x.accentWords?.length) add('FAIL', 'accent-word', `${x.accentWords.length} headline(s) style one word apart from the rest (the italic-serif / coloured / underlined accent word): ` + x.accentWords.slice(0, 4).map((a) => `"${a.text}"${a.word ? ` → "${a.word}"` : ''} (${a.how})`).join('; '), 'One face, one colour, roman, for the whole headline. Emphasis comes from the words, the size and the position.');
  else if (m.headingSummary.mixedFontHeadings) add('WARN', 'mixed-font-headline', `${m.headingSummary.mixedFontHeadings} headline(s) switch typeface or to italic mid-line.`, 'Set the whole headline in one face.');

  // --- banned furniture
  if (m.eyebrows.length) add('FAIL', 'eyebrow', `${m.eyebrows.length} eyebrow/kicker label(s) above headings: ` + m.eyebrows.slice(0, 5).map((e) => `"${e.text}"${e.pill ? ' (pill)' : ''} above "${e.above}"`).join('; '), 'Delete them. If the label carried real information (a date, a price, a place), put it in the headline or the first sentence, or set it after the heading at body size.');
  if (m.type.monoProseShare > 0) add(T.monoLevel || 'FAIL', 'mono', `Monospace outside code: ${m.type.monoFamilies.join(', ')} — e.g. ${m.type.monoSamples.slice(0, 4).map((s) => `"${s}"`).join(', ')}`, 'Text face with font-variant-numeric: tabular-nums for figures. Monospace only for literal code, or license it when the subject is code.');
  if (m.numbered.length) add(T.numberingLevel || 'FAIL', 'numbering', `Decorative index numbers: ${m.numbered.slice(0, 6).map((n) => `"${n.text}"`).join(', ')}`, 'Remove. Order by position, size or words; a real <ol> if order matters.');
  const microFail = T.microFail ?? 3, microWarn = T.microWarn ?? 1;
  if (m.type.microLabels >= microFail) add('FAIL', 'micro-label', `${m.type.microLabels} tiny uppercase letter-spaced labels (e.g. ${m.type.microSamples.slice(0, 4).map((s) => `"${s}"`).join(', ')}).`, 'Sentence case at a readable size, or delete the label.');
  else if (m.type.microLabels >= microWarn) add('WARN', 'micro-label', `${m.type.microLabels} tiny uppercase letter-spaced label(s): ${m.type.microSamples.slice(0, 3).map((s) => `"${s}"`).join(', ')}`, 'Prefer sentence case at body size.');
  if (m.page.emoji.length) add('FAIL', 'emoji', `Emoji in the page: ${m.page.emoji.join(' ')}`, 'Remove. Use words, a real picture, or one consistent icon set.');

  // --- surfaces
  const s = m.surfaces;
  if (s.gradients) add('FAIL', 'gradient', `${s.gradients} gradient fill(s): ${s.gradientSamples.slice(0, 3).join(' | ')}`, 'Flat colour or a real image. A neutral scrim over a photo is allowed without a license.');
  if (s.gradientText) add('FAIL', 'gradient-text', `${s.gradientText} gradient-filled text element(s).`, 'Solid ink.');
  if (s.shadowStatic) add('FAIL', 'shadow', `${s.shadowStatic} box-shadow(s) on elements at rest: ${s.shadowSamples.slice(0, 3).join(' | ')}`, 'Separate surfaces with a tone step or space. Shadows only on what floats (menus, dialogs, sticky bars).');
  if (s.textShadow) add('FAIL', 'text-shadow', `${s.textShadow} text-shadow(s).`, 'Remove; fix legibility with a scrim or a different crop.');
  if (m.buttons.withGradient || m.buttons.withShadow) add('FAIL', 'button-fx', `Buttons with ${m.buttons.withGradient ? 'gradient fill' : ''}${m.buttons.withGradient && m.buttons.withShadow ? ' and ' : ''}${m.buttons.withShadow ? 'shadow/glow' : ''}.`, 'Flat fill, one colour.');
  const hairFail = T.hairlineFail ?? 2;
  if (s.hairlines) add(s.hairlines >= hairFail ? 'FAIL' : 'WARN', 'hairline', `${s.hairlines} thin rule(s)/divider line(s): ${s.hairlineSamples.slice(0, 4).join(' | ')}`, 'Separate with space, a tone step or scale. Rules belong to real tables, form fields and data rows; license them when the subject is tabular (a menu, a timetable, a spec).');
  const outFail = T.outlinedFail ?? 3;
  if (s.outlinedBoxes >= outFail) add('FAIL', 'outlined-box', `${s.outlinedBoxes} boxes drawn with a 1px outline.`, 'A filled surface one tone step from the ground, or no box.');
  else if (s.outlinedBoxes) add('WARN', 'outlined-box', `${s.outlinedBoxes} box(es) drawn with a 1px outline.`, 'Prefer a filled surface or no box.');
  if (s.dashed) add('WARN', 'dashed', `${s.dashed} dashed/dotted border(s).`, 'Remove unless it is a real drop zone.');
  if (s.blurred > 1) add('WARN', 'glass', `${s.blurred} backdrop-blur surfaces.`, 'One blurred sticky bar at most; glass cards are a tell.');
  const iconRows = s.cardRows.filter((c) => c.iconTopped);
  if (iconRows.length) add('FAIL', 'icon-cards', `${iconRows.length} row(s) of identical cards each topped with a small icon (${iconRows.map((c) => c.count).join(', ')} cards).`, 'One composed section instead: a list set large, a split with a picture, a table, real imagery per item.');
  else if (s.cardRows.length >= 2) add('WARN', 'card-rows', `${s.cardRows.length} rows of identical boxed cards.`, 'Vary the composition; not every section is a card grid.');
  if (m.nav?.floatingPill) add('WARN', 'pill-nav', 'Floating rounded pill navigation.', 'A plain bar: wordmark, a few links, one action.');
  if (x.sideStripes?.length) add('FAIL', 'side-stripe', `Coloured single-side stripe on ${x.sideStripes.length} box(es): ${x.sideStripes.slice(0, 4).join(', ')}`, 'Remove the stripe. Show state with the content itself (a word, a tone step on the whole row, a filled marker); quotes and the current nav item are exempt.');
  if (x.nestedCards?.length) add('FAIL', 'nested-cards', `Card inside card: ${x.nestedCards.slice(0, 3).join('; ')}`, 'One containment layer. Usually the outer box is the wrong one: put the content on the canvas.');
  if (x.fakeChrome?.length) add('FAIL', 'fake-chrome', `Hand-drawn window chrome (three dots) in ${x.fakeChrome.join(', ')}.`, 'Show the real interface or the real output without a fake browser/IDE frame.');
  if (x.radius && x.radius.boxes >= 4 && x.radius.share >= 0.7) add('WARN', 'soft-radius', `${x.radius.soft} of ${x.radius.boxes} boxes share the 9–18px "kit" radius.`, 'Decide the corner once from the direction: square (0–2px), a deliberate small radius, or fully round. Not the component-library default.');

  // --- colour
  const fams = new Map();
  const note = (label, hsl) => { const f = colourFamily(hsl); if (f) fams.set(f, [...(fams.get(f) || []), label]); };
  note('page background ' + m.color.bodyBg, m.color.bodyBgHsl);
  for (const sb of m.color.sectionBgs) note('section ' + sb.color, sb.hsl || hexToHsl(sb.color));
  if (m.color.button) note('button ' + m.color.button.bg, m.color.button.hsl || hexToHsl(m.color.button.bg));
  for (const t of m.color.textColors) if (t.share >= 0.01) note('text ' + t.color, hexToHsl(t.color));
  // colours hidden inside gradient fills count too (a purple-to-pink hero is a purple hero)
  for (const g of s.gradientSamples || []) for (const mm of g.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)) note('gradient stop', hexToHsl('#' + [mm[1], mm[2], mm[3]].map((n) => (+n).toString(16).padStart(2, '0')).join('')));
  if (fams.has('terracotta') && fams.has('cream')) add('FAIL', 'palette-claude', `Cream + terracotta palette (${[...fams.get('cream'), ...fams.get('terracotta')].slice(0, 4).join(', ')}).`, 'This pairing reads as an assistant brand. Take the colours from the subject itself (its material, its street, its product) or from a dealt palette.');
  else if (fams.has('terracotta')) add('FAIL', 'palette-terracotta', `Terracotta / rust accent (${fams.get('terracotta').slice(0, 3).join(', ')}).`, 'Use a colour the subject owns. If the subject truly is brick or rust, license it with that reason.');
  else if (fams.has('cream')) add('WARN', 'palette-cream', `Yellow-cream background (${fams.get('cream').slice(0, 3).join(', ')}).`, 'Warmth from a low-chroma stone, a deep ink, a photograph or a full warm field, not a yellow cream.');
  if (fams.has('ai-purple')) add('FAIL', 'palette-purple', `Indigo / violet (${fams.get('ai-purple').slice(0, 3).join(', ')}).`, 'Use a colour the subject owns.');
  if (m.color.textColors.some((t) => t.color === '#0000ee' || t.color === '#551a8b')) add('WARN', 'default-link', 'Browser-default link colour is showing.', 'Style every link.');
  const veryLow = m.color.lowContrast.filter((c) => c.ratio < 3 || (c.need === 4.5 && c.ratio < 4));
  if (veryLow.length) add('FAIL', 'contrast', `Unreadable text: ` + veryLow.slice(0, 4).map((c) => `"${c.text}" ${c.ratio}:1 (${c.fg} on ${c.bg})`).join('; '), 'At least 4.5:1 for text, 3:1 for display at 24px+.');
  else if (m.color.lowContrast.length) add('WARN', 'contrast-low', `Low-contrast text: ` + m.color.lowContrast.slice(0, 4).map((c) => `"${c.text}" ${c.ratio}:1 needs ${c.need}:1`).join('; '), 'Darken or lighten the text colour.');
  if (x.greyOnColour?.length) add('WARN', 'grey-on-colour', `Grey text on a coloured ground: ${x.greyOnColour.slice(0, 3).map((t) => `"${t}"`).join(', ')}`, 'Use an ink mixed from the ground colour, or the full ink.');

  // --- type system
  const realFams = m.type.families.filter((f) => f.share >= 0.02);
  const fcFail = T.fontCountFail ?? 2;
  if (realFams.length > fcFail + 1) add('FAIL', 'font-count', `${realFams.length} typefaces in use (${realFams.map((f) => f.family).join(', ')}).`, 'Two at most: one display, one text. Often one is enough.');
  else if (realFams.length > fcFail) add('WARN', 'font-count', `${realFams.length} typefaces in use (${realFams.map((f) => f.family).join(', ')}).`, 'Two at most.');
  if (m.type.notLoaded.length) add('WARN', 'font-fallback', `Declared but not loaded (a fallback is rendering): ${m.type.notLoaded.join(', ')}`, 'Fix the font URL/family name, or the screenshots are not the design.');
  if (x.fonts?.displayAttractor?.length) add(profile === 'app' ? 'WARN' : 'FAIL', 'display-font', `Display face is a generator attractor: ${x.fonts.displayAttractor.join(', ')}.`, 'Choose the display face from the direction (a face with a reason in the subject). If the brand already uses it, mark it brand-owned.');
  else if (x.fonts?.bodyAttractor && profile !== 'app') add('WARN', 'body-font', `Body face is a default: ${x.fonts.bodyAttractor}.`, 'Fine only if it is the brand face or a deliberate neutral; say which in the notes.');
  const sizeWarn = T.sizeWarn ?? 8;
  if (m.type.sizeCount > sizeWarn) add('WARN', 'size-count', `${m.type.sizeCount} different font sizes (${m.type.sizes.join(', ')}).`, 'About five: display, heading, lead, body, small.');
  const bodyFail = T.bodyFail ?? 15, bodyWarn = T.bodyWarn ?? 16;
  if (m.type.body && m.type.body.size < bodyFail) add('FAIL', 'body-size', `Body text is ${m.type.body.size}px.`, profile === 'page' ? 'Body copy 16–20px on pages.' : 'Dense product UI: 13–14px minimum, 14–16px default.');
  else if (m.type.body && m.type.body.size < bodyWarn && !mobile) add('WARN', 'body-size-small', `Body text is ${m.type.body.size}px.`, profile === 'page' ? 'Body copy 16–20px.' : '14–16px for product UI unless the tool is used all day at high density.');
  if (m.type.body?.contrast && m.type.body.contrast < 7 && profile === 'page') add('WARN', 'grey-body', `Running text is a soft grey (${m.type.body.contrast}:1).`, 'Body copy in the full ink; the muted ink is for secondary notes.');
  if (x.tightLeading?.length) add('FAIL', 'tight-leading', `Multi-line text set too tight: ${x.tightLeading.slice(0, 3).map((t) => `"${t.text}" ${t.leading}`).join('; ')}`, 'Body leading 1.45–1.6 (CJK 1.6–1.75).');
  if (m.buttons.inHero === 0) add('WARN', 'first-action', `No visible button in the first ${mobile ? 'phone ' : ''}screen.`, 'Give the one primary action a real button in the first screen.');
  if (width >= 1100 && m.page.realPictures != null) {
    const pics = m.page.realPictures + m.page.uiPictures;
    if (pics < 4) add('FAIL', 'few-pictures', `Only ${pics} picture(s) (${m.page.realPictures} photographs/footage/raster, ${m.page.uiPictures} interface fragments). SVG drawings do not count.`, 'Real pictures of the subject\'s world (own, generated, or open collections via scripts/assets.mjs), at least four. A type-only direction must license this with its reason, and then type carries the page at 10vw+.');
    else if (m.page.realPictures < 2) add('WARN', 'no-real-pictures', `Only ${m.page.realPictures} real photograph(s); the rest are interface fragments.`, 'Two or more real pictures, unless the product never touches the physical world.');
    if (!m.page.videoCount) add('WARN', 'no-footage', 'No video on the page.', 'One honest clip as a muted loop with a poster, if one fits the subject.');
  }
  if (m.page.sideScrollers) add('WARN', 'side-scroll', `${m.page.sideScrollers} row(s) scroll sideways with content past the edge.`, 'Wrap it, or end it inside the grid.');
  if (m.page.blendText) add('WARN', 'blend-text', `${m.page.blendText} text element(s) use difference/exclusion blending.`, 'Solid ink chosen for the ground.');
  if (m.type.measureChars && m.type.measureChars > 88 && !mobile) add('WARN', 'measure', `Longest paragraph runs ~${m.type.measureChars} characters per line.`, 'Cap paragraphs at 45–75 characters (max-width: 62ch).');
  const smallPx = T.smallTextPx ?? 13;
  if (m.type.smallText > 3 && smallPx >= 13) add('FAIL', 'small-text', `${m.type.smallText} text blocks under 13px.`, 'Nothing meant to be read goes below 13px.');
  else if (m.type.smallText > 0 && smallPx >= 13) add('WARN', 'small-text', `${m.type.smallText} text block(s) under 13px.`, 'Nothing meant to be read goes below 13px.');
  if (m.type.centerShare > 0.72 && m.headings.length >= 4) add('WARN', 'all-centred', `${Math.round(m.type.centerShare * 100)}% of the text is centre-aligned.`, 'Centre one moment at most.');
  if (x.centredHero) add('WARN', 'centred-hero', 'Centred hero stack: headline, lede and action on one axis (the weak-site default, 24% of weak vs 7% of top sites).', 'Anchor the hero to an edge, or make the centred object the subject itself.');

  // --- honesty
  if (x.placeholders?.length) add('FAIL', 'placeholder', `Placeholder text shipped: ${x.placeholders.map((t) => `"${t}"`).join(', ')}`, 'Write the real content, or move the gap to the report. The page never shows its own to-do list.');
  if (x.placeholderBoxes?.length) add('FAIL', 'placeholder-box', `Grey/dashed placeholder box(es) where a picture belongs: ${x.placeholderBoxes.join(', ')}`, 'A real picture (own, generated, open collection), a drawing of the subject, or a composition that needs no picture. Never a grey box.');
  if (x.claims?.length) add('WARN', 'claim', `Numeric or social-proof claims on the page: ${x.claims.map((c) => `"${c}"`).join(', ')}`, 'Every number and endorsement must come from the brief. List the confirmed ones in direction.json "facts"; delete the rest.');
  if (x.emDashes > 4) add('WARN', 'em-dash', `${x.emDashes} em dashes in the visible copy.`, 'One or two read as writing; more read as a model. Use full stops and commas.');

  // --- accessibility and breakage
  if (x.wrappedControls?.length) add('FAIL', 'wrapped-control', `Clickable label(s) wrap to two lines at ${width}px: ${x.wrappedControls.slice(0, 5).map((t) => `"${t}"`).join(', ')}`, 'Shorten the label (1–3 words), then white-space: nowrap, then move it into a menu.');
  if (x.smallTargetCount > 2) add('FAIL', 'small-target', `${x.smallTargetCount} touch targets under 24px on a phone: ${x.smallTargets.slice(0, 4).map((t) => `${t.el} ${t.w}×${t.h}`).join(', ')}`, 'At least 44×44px for primary targets, never under 24px (WCAG 2.5.8). Grow the hit area with padding or ::before.');
  else if (x.smallTargetCount) add('WARN', 'small-target-few', `${x.smallTargetCount} small touch target(s) on a phone.`, '44×44px for primary targets.');
  if (x.imgNoAlt?.length) add('FAIL', 'img-alt', `Image(s) without alt: ${x.imgNoAlt.join(', ')}`, 'alt in plain words; alt="" for decorative repeats.');
  if (x.iconButtonsNoName?.length) add('WARN', 'icon-name', `Icon-only control(s) without an accessible name: ${x.iconButtonsNoName.slice(0, 4).join(', ')}`, 'aria-label naming the action.');
  if (x.lang === '') add('WARN', 'lang', 'The <html> element has no lang attribute.', 'Set lang to the page language.');
  if (x.clippedContent?.length) add('FAIL', 'clipped-content', `Content cut off at the viewport edge at ${width}px: ${x.clippedContent.slice(0, 4).join(', ')}`, 'overflow-x: clip hides overflow from the scroll test but not from the visitor. Constrain the element: minmax(0,1fr), max-width: 100%, overflow-wrap: anywhere, or a scroll container of its own.');
  if (x.stuckFirstScreen?.length) add('FAIL', 'stuck', `First-screen content stuck transparent: ${x.stuckFirstScreen.slice(0, 4).map((t) => `"${t}"`).join(', ')}`, 'An entrance did not fire. Hidden states must live under html.js and resolve on a timer if the observer never fires.');

  // --- product UI tells
  if (x.avatarRainbow && x.avatarRainbow.count >= 3 && x.avatarRainbow.hues >= 3) add('WARN', 'avatar-rainbow', `${x.avatarRainbow.count} initials avatars in ${x.avatarRainbow.hues} saturated hues.`, 'Initials in the ink on one neutral tone, or real photos. A rainbow of avatar circles is the admin-kit default.');
  if (x.pillRainbow && x.pillRainbow.count >= 4 && x.pillRainbow.hues >= 4) add('WARN', 'pill-rainbow', `${x.pillRainbow.count} tinted pills in ${x.pillRainbow.hues} hues.`, 'Status needs one channel that is not hue alone: a word, a position, a shape, a fill level. Reserve colour for the one or two states that need attention.');
  if (x.kpiRows?.length) add('WARN', 'kpi-row', `Row of KPI cards with ± percentage deltas: ${x.kpiRows.join(', ')}`, 'Show the numbers the user acts on, in the place they act; a row of stat cards with green/red deltas is the dashboard template.');

  // --- rhythm
  if (x.bands && x.bands.length >= 3) {
    let repeats = 0; for (let i = 1; i < x.bands.length; i++) if (x.bands[i].shape === x.bands[i - 1].shape && x.bands[i].bg === x.bands[i - 1].bg) repeats++;
    if (repeats >= 2) add('WARN', 'section-repeat', `${repeats} neighbouring section(s) share the same shape and ground: ${x.bands.map((b) => b.shape).join(' → ')}`, 'Each section a different composition from its neighbours (split / list set large / full-bleed picture / table / statement / field of colour).');
  }

  // --- breakage
  if (m.page.uiAbuse) add('FAIL', 'ui-wrapper', 'A data-ui element wraps a heading or more than a screen and a half.', 'data-ui marks a cropped interface fragment only.');
  if (m.page.horizontalOverflow) add('FAIL', 'overflow', `Page scrolls sideways by ${m.page.horizontalOverflow}px at ${width}px.${m.page.overflowCulprits?.length ? ' Offenders: ' + m.page.overflowCulprits.join(', ') + '.' : ''}`, 'Constrain the element (max-width: 100%, minmax(0,1fr) tracks, overflow-wrap: anywhere on display heads); html, body { overflow-x: clip }.');
  if (m.page.brokenImages.length) add('FAIL', 'broken-image', `Broken image(s): ${m.page.brokenImages.slice(0, 4).join(', ')}`, 'Fix the URL or replace the asset.');
  if (!m.hero) add('WARN', 'no-hero', 'No headline found in the first viewport.', 'The first screen needs a clear focal statement or image.');
  else if (!mobile && m.hero.vw < 4.5 && (m.heroMedia[0]?.ratio || 0) < 0.3 && !m.page.uiFragments) add('FAIL', 'focal-point', `First screen has no dominant element: largest type ${m.hero.size}px (${m.hero.vw}vw), no picture over a third of the viewport.`, 'One thing leads: the headline at display size (top sites: 8.4vw largest type), or one large picture.');
  return out;
}
