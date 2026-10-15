// extras() runs INSIDE the page, like probe(). It must stay self-contained: no imports, no closures.
// It measures what probe() does not: the tells that are easy to name and rarely measured (styled accent
// words, wrapped buttons, side stripes, nested cards, fake window chrome, stuck entrances), the product-UI
// tells (initials-avatar rainbows, status-pill rainbows, KPI rows), honesty (placeholders shipped, invented
// claims), accessibility basics (alt, lang, target size, leading) and the font attractors.
export function extras(opts) {
  const o = opts || {};
  const W = innerWidth, H = innerHeight, SY = scrollY;
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1;
  const ctx = cvs.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const chroma = (v) => (Math.max(v.r, v.g, v.b) - Math.min(v.r, v.g, v.b)) / 255;
  const hue = (v) => { const r = v.r / 255, g = v.g / 255, b = v.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx === mn) return null; const d = mx - mn; let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round(h * 60); };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.02; };
  const label = (el) => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')).slice(0, 60);
  const txt = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const firstFam = (ff) => ff.split(',')[0].replace(/["']/g, '').trim();
  const inUI = (el) => !!el.closest('[data-ui]');
  const out = {};

  // 1. Headlines with a styled accent word: a child run in another face, italic, colour, underline or highlight.
  const accent = [];
  for (const h of document.querySelectorAll('h1, h2, h3, [role="heading"]')) {
    if (!vis(h) || inUI(h)) continue;
    const hs = getComputedStyle(h); const hc = rgba(hs.color);
    if (hs.fontStyle === 'italic' && parseFloat(hs.fontSize) >= 24) { accent.push({ text: txt(h).slice(0, 60), how: 'whole headline italic' }); continue; }
    for (const c of h.querySelectorAll('*')) {
      if (!txt(c) || c.closest('a, button, sup, sub, abbr, svg')) continue;
      const cs = getComputedStyle(c); const why = [];
      if (cs.fontStyle === 'italic') why.push('italic');
      if (firstFam(cs.fontFamily) !== firstFam(hs.fontFamily)) why.push('another face');
      const cc = rgba(cs.color); if (Math.abs(cc.r - hc.r) + Math.abs(cc.g - hc.g) + Math.abs(cc.b - hc.b) > 60) why.push('another colour');
      if (/underline|line-through/.test(cs.textDecorationLine) || cs.backgroundImage !== 'none' || rgba(cs.backgroundColor).a > 0.1) why.push('underline/highlight');
      if (why.length) { accent.push({ text: txt(h).slice(0, 60), word: txt(c).slice(0, 30), how: why.join(' + ') }); break; }
    }
  }
  out.accentWords = accent.slice(0, 8);

  // 2. Clickable labels that wrap onto two lines (buttons, nav links, CTAs, tabs, breadcrumbs).
  const wraps = [];
  for (const el of document.querySelectorAll('button, [role="button"], [role="tab"], nav a, header a, footer a, a[class*="btn" i], a[class*="button" i], a[class*="cta" i], input[type="submit"]')) {
    if (!vis(el) || inUI(el)) continue; const t = txt(el); if (!t || t.length > 60) continue;
    if (el.tagName === 'A' && el.closest('p, li, dd, small, figcaption, address') && !/btn|button|cta/i.test(el.className)) continue; // inline links in running text may wrap
    if ([...el.querySelectorAll('*')].some((d) => /^(block|flex|grid|list-item|table)$/.test(getComputedStyle(d).display))) continue; // a card-button holding several lines of content is not a label
    const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize); const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    // count lines from the text runs only (dots, icons and count badges are not lines)
    const range = document.createRange(); const tops = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!n.nodeValue.trim()) continue; range.selectNodeContents(n);
      for (const r of range.getClientRects()) { if (r.width < 2 || r.height < fs * 0.5) continue; const m = r.bottom; if (!tops.some((t0) => Math.abs(t0 - m) < Math.max(lh, fs * 1.1) * 0.6)) tops.push(m); }
    }
    if (tops.length >= 2) wraps.push(t.slice(0, 40));
  }
  out.wrappedControls = [...new Set(wraps)].slice(0, 8);

  // 3. Coloured single-side stripe on a card or callout, excluding quotes and current nav items.
  const stripes = []; const nested = []; const chrome = [];
  const all = [...document.body.querySelectorAll('*')].slice(0, 8000);
  const isCard = (el, cs) => { const r = el.getBoundingClientRect(); const rad = parseFloat(cs.borderTopLeftRadius) || 0; const fill = rgba(cs.backgroundColor).a > 0.04; const border = ['Top', 'Right', 'Bottom', 'Left'].every((s) => parseFloat(cs['border' + s + 'Width']) >= 1 && rgba(cs['border' + s + 'Color']).a > 0.05); const sh = cs.boxShadow !== 'none'; return rad >= 6 && (border || (sh && fill) || fill) && r.width >= 120 && r.height >= 56 && r.width * r.height < W * H * 0.6; };
  for (const el of all) {
    if (inUI(el) || el.closest('svg')) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    // fake window chrome: three small round dots side by side near the top of a box
    if (r.width >= 6 && r.width <= 16 && Math.abs(r.width - r.height) <= 1 && parseFloat(cs.borderTopLeftRadius) >= r.width / 2 - 1 && rgba(cs.backgroundColor).a > 0.3 && el.parentElement) {
      const sib = [...el.parentElement.children].filter((s) => { const sr = s.getBoundingClientRect(); return Math.abs(sr.top - r.top) < 3 && Math.abs(sr.width - r.width) < 2; });
      if (sib.length === 3 && sib[0] === el) chrome.push(label(el.parentElement));
    }
    if (r.width < 40 || r.height < 16 || r.height > H * 0.8) continue;
    const bl = parseFloat(cs.borderLeftWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0;
    const side = bl >= 2 && bl >= 2 * Math.max(br, bt, bb, 0.5) ? 'Left' : br >= 2 && br >= 2 * Math.max(bl, bt, bb, 0.5) ? 'Right' : null;
    const cardLike = rgba(cs.backgroundColor).a > 0.04 || (parseFloat(cs.borderTopLeftRadius) || 0) >= 4 || cs.boxShadow !== 'none';
    if (side && cardLike && !el.matches('ul, ol, dl, hr, blockquote, blockquote *') && !el.closest('[aria-current], [aria-selected="true"]') && !(el.closest('nav, [role="navigation"], [role="tablist"]') && /active|current|selected/i.test(el.className))) {
      const c = rgba(cs['border' + side + 'Color']); if (c.a >= 0.4 && chroma(c) >= 0.15 && r.width > 60) stripes.push(label(el));
    } else if (!el.matches('blockquote')) {
      const shadow = cs.boxShadow.match(/inset\s+(-?\d+)px\s+0/); if (shadow && Math.abs(+shadow[1]) >= 2 && Math.abs(+shadow[1]) <= 8 && r.height >= 24) stripes.push(label(el) + ' (inset shadow)');
    }
    // nested cards: a rounded boxed surface inside another rounded boxed surface (skip dialogs, menus, fixed layers)
    if (!el.matches('button, a, input, select, textarea, label, img, pre, code, summary') && isCard(el, cs)) {
      let p = el.parentElement;
      for (let i = 0; i < 8 && p && p !== document.body; i++, p = p.parentElement) {
        if (p.matches('dialog, [role="dialog"], [role="menu"], [role="listbox"], [popover]')) break;
        const pcs = getComputedStyle(p); if (pcs.position === 'fixed') break;
        if (isCard(p, pcs)) { nested.push(label(el) + ' in ' + label(p)); break; }
      }
    }
  }
  out.sideStripes = [...new Set(stripes)].slice(0, 8);
  out.nestedCards = [...new Set(nested)].slice(0, 8);
  out.fakeChrome = [...new Set(chrome)].slice(0, 4);

  // 4. Content stuck transparent in the first screen (an entrance that never fired).
  const stuck = [];
  for (const el of all) {
    const r = el.getBoundingClientRect(); if (r.top - 0 > H || r.bottom < 0 || r.width < 40 || r.height < 16) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').trim();
    if (own.length < 4 && !(el.tagName === 'IMG' && el.naturalWidth)) continue;
    let op = 1; for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const pcs = getComputedStyle(p); op *= +pcs.opacity; if (pcs.visibility === 'hidden' || pcs.display === 'none') { op = 1; break; } if (p.matches('dialog:not([open]), [hidden], [role="tooltip"], [role="menu"], details:not([open]) *')) { op = 1; break; } }
    if (op < 0.05) stuck.push((own || el.alt || 'image').slice(0, 40));
  }
  out.stuckFirstScreen = [...new Set(stuck)].slice(0, 6);

  // 4b. Content cut off at the viewport edge. overflow-x: clip on html/body hides it from the scroll-width test.
  const cut = [];
  for (const el of document.querySelectorAll('h1, h2, h3, h4, p, li, a, button, label, input, pre, td, th, dd, figcaption')) {
    if (!vis(el) || inUI(el)) continue; const r = el.getBoundingClientRect(); if (r.width < 8) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize); if (fs >= 60) continue; // display type cropped by the edge on purpose
    let scroller = false; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const pc = getComputedStyle(p); if (/auto|scroll/.test(pc.overflowX)) { scroller = true; break; } }
    if (scroller) continue;
    if (r.right > W + 2 || r.left < -2) cut.push(`${txt(el).slice(0, 30) || el.tagName.toLowerCase()} (${Math.round(r.left)}→${Math.round(r.right)}px)`);
  }
  out.clippedContent = [...new Set(cut)].slice(0, 6);

  // 5. Typography attractors: the faces generators reach for. Measured on what the browser actually set.
  const ATTRACT_DISPLAY = /^(inter|inter tight|roboto|open sans|poppins|montserrat|lato|nunito|raleway|arial|helvetica|helvetica neue|system-ui|-apple-system|segoe ui|space grotesk|instrument serif|instrument sans|playfair display|fraunces|dm sans|dm serif display|plus jakarta sans|outfit|sora|manrope|geist|cormorant garamond|syne|clash display|cabinet grotesk|satoshi|general sans)$/i;
  const ATTRACT_BODY = /^(inter|roboto|open sans|poppins|montserrat|lato|nunito|raleway|arial|helvetica|system-ui|-apple-system|segoe ui|dm sans|plus jakarta sans|outfit|sora|manrope|instrument sans|geist)$/i;
  const heads = [...document.querySelectorAll('h1, h2')].filter(vis);
  const dispFams = [...new Set(heads.map((h) => firstFam(getComputedStyle(h).fontFamily)))];
  const bodyEl = [...document.querySelectorAll('p, li, td, dd')].filter((p) => vis(p) && txt(p).length > 40)[0];
  const bodyFam = bodyEl ? firstFam(getComputedStyle(bodyEl).fontFamily) : null;
  out.fonts = { display: dispFams, body: bodyFam, displayAttractor: dispFams.filter((f) => ATTRACT_DISPLAY.test(f)), bodyAttractor: bodyFam && ATTRACT_BODY.test(bodyFam) ? bodyFam : null };

  // 6. Body leading too tight, measured on multi-line paragraphs.
  const tight = [];
  for (const p of document.querySelectorAll('p, li, dd, blockquote')) {
    if (!vis(p) || inUI(p) || p.closest('nav, button, table')) continue; const t = txt(p); if (t.length < 60) continue;
    const cs = getComputedStyle(p); const fs = parseFloat(cs.fontSize); if (fs > 28) continue;
    const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs; const r = p.getBoundingClientRect();
    const cjk = (t.match(/[぀-ヿ㐀-鿿가-힯]/g) || []).length > t.length / 3;
    if (r.height >= fs * lh * 1.8 && lh < (cjk ? (fs >= 20 ? 1.25 : 1.4) : (fs >= 20 ? 1.15 : 1.3))) tight.push({ text: t.slice(0, 40), leading: round(lh) });
  }
  out.tightLeading = tight.slice(0, 5);

  // 7. Grey text on a strongly coloured ground.
  const greyOnColour = [];
  for (const el of all) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').trim(); if (own.length < 8 || inUI(el)) continue;
    const cs = getComputedStyle(el); const fg = rgba(cs.color); if (chroma(fg) >= 0.06) continue;
    const lum = (fg.r * 0.2126 + fg.g * 0.7152 + fg.b * 0.0722) / 255; if (lum < 0.22 || lum > 0.75) continue;
    let bg = null; for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const v = rgba(getComputedStyle(p).backgroundColor); if (v.a >= 0.9) { bg = v; break; } }
    if (bg && chroma(bg) >= 0.25) greyOnColour.push(own.slice(0, 30));
  }
  out.greyOnColour = [...new Set(greyOnColour)].slice(0, 5);

  // 8. Honesty: placeholders shipped, invented-looking claims, lorem.
  const body = document.body.innerText || '';
  const PLACEHOLDER = /\b(lorem ipsum|placeholder|image here|your (logo|image|photo) here|foto da fornire|immagine (da|qui)|todo:?|tbd|coming soon|insert .{1,20} here|example\.com|john doe|jane doe|acme (inc|corp)?|mario rossi)\b/i;
  out.placeholders = [...new Set((body.match(new RegExp(PLACEHOLDER.source, 'gi')) || []).map((s) => s.trim()))].slice(0, 6);
  const greyBoxes = [];
  for (const el of all) {
    const r = el.getBoundingClientRect(); if (r.width < 160 || r.height < 120 || el.children.length > 2) continue;
    const cs = getComputedStyle(el); if (cs.backgroundImage !== 'none' || el.querySelector('img, video, canvas, svg, picture')) continue;
    const dashed = /dashed|dotted/.test(cs.borderTopStyle) && parseFloat(cs.borderTopWidth) >= 1; const fill = rgba(cs.backgroundColor);
    const textLen = txt(el).length;
    if ((dashed || (fill.a > 0.5 && chroma(fill) < 0.04)) && textLen < 40 && r.width * r.height > 160 * 160 && /foto|photo|image|img|immagine|placeholder|figure|media|picture/i.test(label(el) + ' ' + txt(el))) greyBoxes.push(label(el));
  }
  out.placeholderBoxes = greyBoxes.slice(0, 5);
  const CLAIM = /(\b\d{1,3}(?:[.,]\d{3})+\s?\+|\b\d+\s?[kKmM]\+|\b\d+(?:[.,]\d+)?\s?[x×]\s?(faster|more|better|più)|\btrusted by\b|\bloved by\b|\bscelto da\b|\b(99[.,]9+|100)\s?%\s?(uptime|satisf|soddisf)|\b\d+\s?%\s?(faster|more|increase|growth|in più|di crescita)|★★★★★|\b[45][.,]\d\s?\/\s?5\b)/gi;
  out.claims = [...new Set((body.match(CLAIM) || []).map((s) => s.trim()))].slice(0, 8);
  out.emDashes = (body.match(/—/g) || []).length;

  // 9. Accessibility basics.
  out.lang = document.documentElement.getAttribute('lang') || '';
  out.imgNoAlt = [...document.images].filter((i) => vis(i) && !i.hasAttribute('alt')).map((i) => (i.currentSrc || i.src).split('/').pop().slice(0, 40)).slice(0, 6);
  out.iconButtonsNoName = [...document.querySelectorAll('button, a[href], [role="button"]')].filter((b) => vis(b) && !txt(b) && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby') && !b.getAttribute('title') && !b.querySelector('img[alt]:not([alt=""])')).map(label).slice(0, 6);
  const small = [];
  if (o.mobile) for (const el of document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, [role="tab"], summary')) {
    if (!vis(el) || inUI(el)) continue; const r = el.getBoundingClientRect();
    if (el.tagName === 'A' && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) continue; // inline links in running text are exempt (WCAG 2.5.8)
    if (r.height < 24 || r.width < 24) small.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height), text: txt(el).slice(0, 20) });
  }
  out.smallTargets = small.slice(0, 8); out.smallTargetCount = small.length;

  // 10. Product-UI tells: initials-avatar rainbows, status-pill rainbows, KPI cards with deltas.
  const avatars = []; const pills = [];
  for (const el of all) {
    const r = el.getBoundingClientRect(); const t = txt(el); const cs = getComputedStyle(el); const bg = rgba(cs.backgroundColor);
    if (r.width >= 18 && r.width <= 48 && Math.abs(r.width - r.height) <= 2 && parseFloat(cs.borderTopLeftRadius) >= r.width / 2 - 1 && /^[A-Z]{1,3}$/.test(t) && bg.a > 0.5 && chroma(bg) > 0.2) avatars.push(hue(bg));
    if (r.height >= 16 && r.height <= 30 && r.width <= 160 && t && t.length <= 22 && parseFloat(cs.borderTopLeftRadius) >= r.height / 2 - 1 && bg.a > 0.08 && el.children.length <= 2) { const h0 = hue(bg); if (h0 != null && chroma(bg) > 0.04) pills.push(h0); }
  }
  const hueBins = (arr) => new Set(arr.filter((h) => h != null).map((h) => Math.round(h / 40))).size;
  out.avatarRainbow = { count: avatars.length, hues: hueBins(avatars) };
  out.pillRainbow = { count: pills.length, hues: hueBins(pills) };
  const kpi = [];
  for (const p of document.querySelectorAll('section, div, ul')) {
    const kids = [...p.children].filter((k) => { const r = k.getBoundingClientRect(); return r.width >= 120 && r.width < W * 0.5 && r.height >= 60 && r.height < 260; });
    if (kids.length < 3) continue;
    const withDelta = kids.filter((k) => /[+\-−▲▼↑↓]\s?\d+(?:[.,]\d+)?\s?%/.test(txt(k)) && /\d/.test(txt(k)));
    if (withDelta.length >= 3) { kpi.push(label(p)); }
  }
  out.kpiRows = [...new Set(kpi)].slice(0, 3);

  // 11. Section rhythm: the layout shape of each band, to catch neighbours that repeat and the stock sequence.
  const bands = [...document.querySelectorAll('body > main > section, body > main > *, body > section, main > div > section, body > div > section')].filter((s) => { const r = s.getBoundingClientRect(); return r.height >= 160 && r.width >= W * 0.6; }).slice(0, 30);
  const shapeOf = (s) => {
    let host = s; for (let i = 0; i < 4; i++) { const kids = [...host.children].filter(vis); if (kids.length === 1) host = kids[0]; else break; }
    const kids = [...host.children].filter((k) => vis(k) && k.getBoundingClientRect().height > 20);
    const rows = new Map(); for (const k of kids) { const t = Math.round(k.getBoundingClientRect().top / 24); rows.set(t, (rows.get(t) || 0) + 1); }
    const maxCols = Math.max(1, ...rows.values());
    const media = s.querySelectorAll('img, video, picture, canvas').length;
    const grid = [...s.querySelectorAll('*')].some((k) => { const c = getComputedStyle(k); return (c.display === 'grid' || c.display === 'flex') && [...k.children].filter(vis).length >= 3 && [...k.children].filter(vis).every((x) => Math.abs(x.getBoundingClientRect().width - k.children[0].getBoundingClientRect().width) < 4) && k.children[0].getBoundingClientRect().width < W * 0.4; });
    const centred = [...s.querySelectorAll('h1, h2, h3')].some((h) => getComputedStyle(h).textAlign === 'center');
    return (grid ? 'grid' : maxCols >= 2 ? 'split' : 'stack') + (media ? '+media' : '') + (centred ? '+centred' : '');
  };
  out.bands = bands.map((s) => ({ shape: shapeOf(s), bg: (() => { const v = rgba(getComputedStyle(s).backgroundColor); return v.a > 0.5 ? '#' + [v.r, v.g, v.b].map((n) => n.toString(16).padStart(2, '0')).join('') : null; })(), top: Math.round(s.getBoundingClientRect().top + SY) }));

  // 12. Radius system: the one medium radius on everything (9–16px) is the kit look.
  const radii = [];
  for (const el of all) { const r = el.getBoundingClientRect(); if (r.width < 80 || r.height < 32) continue; const cs = getComputedStyle(el); const rad = parseFloat(cs.borderTopLeftRadius) || 0; if (rad > 0 && (rgba(cs.backgroundColor).a > 0.04 || parseFloat(cs.borderTopWidth) > 0) && rad < r.height / 2 - 1) radii.push(Math.round(rad)); }
  const softCount = radii.filter((x) => x >= 9 && x <= 18).length;
  out.radius = { boxes: radii.length, soft: softCount, share: radii.length ? round(softCount / radii.length) : 0 };

  // 13. Centred hero stack (label, headline, lede, button all on one axis).
  const h1 = document.querySelector('h1');
  if (h1 && vis(h1)) {
    const hr = h1.getBoundingClientRect(); const cx = (hr.left + hr.right) / 2;
    const near = [...document.querySelectorAll('p, a, button, span')].filter((e) => { const r = e.getBoundingClientRect(); return vis(e) && r.top < H && Math.abs(r.top - hr.top) < 420 && txt(e).length > 2 && r.width < W * 0.8; });
    const onAxis = near.filter((e) => { const r = e.getBoundingClientRect(); return Math.abs((r.left + r.right) / 2 - cx) < 8; });
    out.centredHero = Math.abs(cx - W / 2) < 16 && getComputedStyle(h1).textAlign === 'center' && onAxis.length >= 3;
  }
  return out;
}

// focusProbe() is run after a real Tab key press: it reports whether the focused element visibly changed.
export function focusProbe() {
  const el = document.activeElement; if (!el || el === document.body) return null;
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1;
  const ring = cs.boxShadow !== 'none';
  const anc = [el.parentElement, el.parentElement?.parentElement].filter(Boolean).map((p) => { const c = getComputedStyle(p); return [c.outlineStyle, c.outlineWidth, c.boxShadow, c.backgroundColor, c.borderColor].join('|'); }).join('||');
  return { anc, el: (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '')).slice(0, 40), text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 24), outline, ring, style: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.color, cs.textDecorationLine, cs.borderColor].join('|'), visible: r.width > 0 && r.height > 0 };
}

// hiddenScan() lists content that is present but invisible: opacity ~0, visibility hidden, or clipped away by
// clip-path (the reveal that never fired). firstScreenOnly limits it to the current viewport.
export function hiddenScan(firstScreenOnly) {
  const H = innerHeight; const out = [];
  // inset() with 1–4 values in px or %, measured against the element's own box
  const clippedAway = (cp, rect) => {
    if (/circle\(\s*0/.test(cp)) return true;
    const m = cp.match(/^inset\(([^)]*)\)/); if (!m) return false;
    const v = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/);
    const [t, r = t, b = t, l = r] = v;
    const pct = (s, size) => (s.endsWith('%') ? parseFloat(s) : (parseFloat(s) / Math.max(1, size)) * 100);
    return pct(t, rect.height) + pct(b, rect.height) >= 99 || pct(l, rect.width) + pct(r, rect.width) >= 99;
  };
  for (const el of document.querySelectorAll('h1, h2, h3, p, img, li, pre, input, button, figure, blockquote')) {
    const r = el.getBoundingClientRect(); if (r.width <= 2 || r.height <= 2) continue; // sr-only text is meant to be invisible
    if (firstScreenOnly && (r.top > H || r.bottom < 0)) continue;
    if (el.closest('dialog:not([open]), [hidden], [role="tooltip"], [role="menu"], details:not([open]), [aria-hidden="true"], [inert]')) continue;
    let op = 1, why = '', fixed = false;
    for (let p = el; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).position === 'fixed') { fixed = true; break; }
    if (fixed) continue; // floating controls (back to top, toasts) appear on their own conditions
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p); op *= +cs.opacity;
      if (cs.visibility === 'hidden') { why = 'visibility'; break; }
      if (cs.clipPath && cs.clipPath !== 'none' && clippedAway(cs.clipPath, p.getBoundingClientRect())) { why = 'clip-path'; break; }
    }
    if (!why && op < 0.05) why = 'opacity';
    if (why) out.push({ text: ((el.innerText || el.alt || el.placeholder || el.tagName) + '').trim().slice(0, 40), why });
  }
  return out;
}
