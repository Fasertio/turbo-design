#!/usr/bin/env node
// turbo-design / lint — static scan of source for the tells this skill bans, before anything renders.
// Catches what a render cannot see (copy habits, motion values, lazy placeholders in code) and the cheap ones early.
//
//   node lint.mjs [files or directories ...] [--profile page|app|component] [--direction FILE] [--json]
//
// Exit 1 when any FAIL is found. Zero dependencies (Node 18+).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); if (i === -1) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const asJson = args.includes('--json'); if (asJson) args.splice(args.indexOf('--json'), 1);
const dirFile = flag('direction', null);
let profile = flag('profile', null);
const roots = args.filter((a) => !a.startsWith('--'));
if (!roots.length) roots.push('.');
let direction = {};
for (const p of [dirFile, '.turbo/direction.json'].filter(Boolean)) if (existsSync(p)) { try { direction = JSON.parse(readFileSync(p, 'utf8')); } catch {} break; }
profile = profile || direction.profile || 'page';
const licensed = new Set((direction.licenses || []).filter((l) => l && l.reason && String(l.reason).trim().length >= 20).map((l) => l.rule));
const brand = new Set(direction.brand?.owns || []);

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mdx']);
const SKIP = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', 'dist', 'build', 'out', '.vercel', '.turbo', 'coverage', 'vendor']);
const files = []; const tooBig = [];
const walk = (p) => {
  let st; try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) { for (const f of readdirSync(p)) if (!SKIP.has(f) && !f.startsWith('.')) walk(join(p, f)); }
  else if (EXT.has(extname(p)) && !/\.min\.|lock|\.d\.ts$/.test(p)) { if (st.size < 4000000) files.push(p); else tooBig.push(p); }
};
for (const r of roots) { try { statSync(resolve(r)); } catch { console.error(`Not found: ${r}`); process.exit(2); } walk(resolve(r)); }
if (!files.length) { console.error(`No source files under: ${roots.join(', ')}`); process.exit(2); }
if (tooBig.length) console.error(`Skipped (over 4 MB, check by hand): ${tooBig.join(', ')}`);

const app = profile !== 'page';
// [level, id, regex, message]. Tested per line.
const R = [
  // --- hard bans
  ['FAIL', 'gradient-text', /bg-clip-text|background-clip\s*:\s*text|text-transparent/, 'Gradient / clipped text. Solid ink.'],
  ['FAIL', 'palette-purple', /\b(bg|text|from|to|via|border|ring|fill|stroke|shadow|decoration|outline)-(purple|violet|indigo|fuchsia)-\d{2,3}\b|#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5|a78bfa|818cf8|9333ea|6d28d9|c084fc)\b/i, 'Indigo / violet: the generated-page accent.'],
  ['FAIL', 'palette-claude', /#(d97757|da7756|c15f3c|cc785c|bd5d3a|f0eee6|faf9f5|f5f4ed|eeece2|e8e6dc)\b/i, 'Assistant-brand cream / terracotta.'],
  ['FAIL', 'emoji', /[\u{1F300}-\u{1FAFF}\u{2728}\u{2705}\u{274C}\u{26A1}\u{2B50}]/u, 'Emoji used as UI or copy.'],
  ['FAIL', 'placeholder', /lorem ipsum|dolor sit amet|\b(John|Jane) Doe\b|\bAcme (Inc|Corp)\b|foto da fornire|your (logo|image) here|image placeholder/i, 'Placeholder content shipped.'],
  ['FAIL', 'lazy-code', /\/\/\s*\.\.\.\s*$|\/\/\s*(rest of (the )?code|implement (this|here)|similar to above|continue (the )?pattern|add more as needed)|\/\*\s*\.\.\.\s*\*\/|<!--\s*\.\.\.\s*-->/i, 'Elided code. Write it out in full.'],
  ['FAIL', 'accent-word', /<h[1-3][^>]*>[^<]*<(em|i)\b|h[1-3][^{]*\b(em|i)\b[^{]*\{[^}]*font-style\s*:\s*italic|\.(accent|highlight|serif-accent|italic)-?word/i, 'A styled accent word inside a headline (italic/serif/colour). One face, one colour, roman.'],
  ['FAIL', 'fake-chrome', /class(Name)?\s*=\s*["'`][^"'`]*\b(traffic-?lights?|window-?dots|mac-?dots|browser-?(bar|chrome|frame)|fake-?browser|mock-?chrome)\b/i, 'Hand-drawn browser/window chrome.'],
  ['FAIL', 'eyebrow', /class(Name)?\s*=\s*["'`{][^"'`}]*\b(eyebrow|kicker|overline|pretitle|pre-title|suptitle|sup-title|tagline-label|section-label|section-tag|badge-new)\b|\.(eyebrow|kicker|overline|pretitle|section-label|section-tag)\b\s*[{,]/i, 'Eyebrow / kicker label above a heading.'],
  ['FAIL', 'bounce-ease', /cubic-bezier\(\s*[\d.]+\s*,\s*-?[\d.]+\s*,\s*[\d.]+\s*,\s*(1\.[1-9]|[2-9])|\banimate-(bounce|ping|pulse)\b|easeOutBack|easeInOutBack|\belastic\b|\bback\.out\b/, 'Bounce / overshoot / looping attention animation on UI.'],
  // --- licensable defaults
  ['FAIL', 'mono', /\bfont-mono\b|font-family\s*:[^;{}]*(mono\b|monospace|Courier|Consolas|Menlo|Monaco)|(JetBrains|Geist|IBM\+?Plex|Space|DM|Roboto|Fragment|Azeret|Red\+?Hat|Martian|Commit|Departure|Fira)[+_ ]?Mono|Geist_Mono|GeistMono|Fira[+ ]Code|ui-monospace/i, 'Monospace outside literal code. Tabular figures in the text face instead.'],
  ['FAIL', 'gradient', /(linear|radial|conic)-gradient\(|\bbg-(gradient|linear|radial|conic)-|\b(from|via)-(?!\[?0)[a-z]+-\d{2,3}\b/, 'Gradient fill. Flat colour or a real image; a neutral scrim over a photo is fine (mark the line with turbo-scrim).'],
  ['FAIL', 'shadow', /box-shadow\s*:\s*(?!none|0 0 #0000|var\(--tw|inset)|\bshadow(-(sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?(?=["'\s`])(?<!-shadow)|drop-shadow\(|\bdrop-shadow(-|\b)|text-shadow\s*:\s*(?!none)/, 'Shadow at rest. Only what floats (menu, dialog, popover, sticky bar) may cast one.'],
  ['FAIL', 'numbering', />\s*[(\[]?0[1-9][)\]]?\.?\s*<|decimal-leading-zero|>\s*(Step|Phase|No\.?|Chapter|Fase|Passo|Capitolo)\s*0?\d\s*</i, 'Decorative index numbering (01 / 02 / 03, Step 2).'],
  ['FAIL', 'micro-label', /(?=[^"'`]*\buppercase\b)(?=[^"'`]*\btracking-(wide|wider|widest|\[[^\]]+\])\b)(?=[^"'`]*\btext-(xs|\[1[0-3]px\]|\[0?\.[67]\d*rem\])\b)[^"'`]+|text-transform\s*:\s*uppercase[^}]*letter-spacing\s*:\s*0?\.[1-9]/, 'Tiny uppercase letter-spaced label.'],
  ['FAIL', 'hairline', /<hr\b|\bdivide-[xy](-\d|\b)|\b(h|w)-px\b|border-(top|bottom|left|right)\s*:\s*(0?\.5|1)px|\bborder-[tblrxy](?![-\w])|\bborder-[tblrxy]-(?!0\b|none)\[?1?(px)?\]?(?=["'\s`])|height\s*:\s*1px/, 'Thin rule / divider. Separate with space, tone or scale; rules belong to tables, form fields and licensed data rows.'],
  ['WARN', 'outlined-box', /border\s*:\s*1px\s+solid|\bborder\b(?=[^"'`]*\brounded)/, 'A 1px outlined box. Prefer a filled surface or no box.'],
  ['WARN', 'glass', /backdrop-blur|backdrop-filter\s*:/, 'Backdrop blur. One sticky bar at most.'],
  ['WARN', 'side-stripe', /border-(left|inline-start)\s*:\s*[2-8]px\s+solid|\bborder-l-[2-8]\b/, 'Coloured single-side stripe on a card.'],
  ['WARN', 'display-font', /family=(Inter|Poppins|Montserrat|Roboto|Open\+Sans|Space\+Grotesk|Instrument\+Serif|Instrument\+Sans|Playfair\+Display|Plus\+Jakarta\+Sans|Outfit|Sora|Manrope|Fraunces|DM\+Sans|DM\+Serif\+Display|Lato|Nunito|Raleway|Cormorant\+Garamond|Syne)\b|font-family\s*:\s*["']?(Inter|Poppins|Montserrat|Roboto|Space Grotesk|Instrument Serif|Playfair Display|Plus Jakarta Sans|Outfit|Sora|Manrope|Fraunces|DM Sans|Syne)\b|\b(Inter|Poppins|Space_Grotesk|Instrument_Serif|Playfair_Display|Fraunces|Manrope|DM_Sans)\s*\(\s*\{/, 'A generator-attractor typeface. The display face comes from the direction.'],
  // --- copy (English + Italian)
  ['WARN', 'copy', /\b(unlock|unleash|supercharge|seamless(ly)?|elevate|empower(s|ing)?|revolutioni[sz]e|game[- ]chang(er|ing)|cutting[- ]edge|next[- ]gen(eration)?|world[- ]class|best[- ]in[- ]class|all[- ]in[- ]one|effortless(ly)?|blazing(ly)?[- ]fast|lightning[- ]fast|reimagin(e|ed|ing)|delve|tapestry|synergy|streamline|holistic|turbocharge|transform the way|take your .{1,30} to the next level|say goodbye to|in today'?s|the future of|built for the modern|where .{1,20} meets .{1,20}|not just .{1,40}[,—-] (it'?s|but)|more than (just )?a|crafted with (care|love)|quietly trusted|field notes)\b/i, 'Stock marketing phrase. Say the specific thing.'],
  ['WARN', 'copy-it', /\b(soluzioni innovative|a 360 gradi|all'avanguardia|eccellenza|esperienza unica|scopri (il|la|i|le) (nostr|mondo)|il futuro (di|del|della)|rivoluziona|senza compromessi|qualità e passione|passione e tradizione|il partner ideale|ti accompagna|su misura per te|a portata di click|non solo .{1,30}, ma)\b/i, 'Frase da marketing di serie. Dì la cosa specifica.'],
  ['WARN', 'cta-copy', />\s*(Learn more|Get started|Click here|Read more|Discover more|Explore now|Submit|Scopri di più|Clicca qui|Inizia ora|Leggi di più|Invia)\s*</i, 'Generic button label. Name the action or the thing.'],
  ['WARN', 'claim', /\b\d{1,3}(?:[.,]\d{3})+\s?\+|\b\d+\s?[kK]\+|\btrusted by\b|\bloved by\b|\b\d+(\.\d+)?x (faster|more|better)\b|\b99[.,]9+\s?%/i, 'A numeric or social-proof claim. It must come from the brief (list it in direction.json "facts").'],
  // --- motion / CSS hygiene
  ['WARN', 'transition-all', /transition\s*:\s*all\b|\btransition-all\b/, 'transition: all. Name the properties (transform, opacity).'],
  ['WARN', 'ease-in', /(?<![-\w])ease-in(?!-out)\b/, 'ease-in on UI feels sluggish. Ease-out for enters and exits.'],
  ['WARN', 'scale-zero', /scale\(\s*0\s*\)|\bscale-0\b/, 'Entering from scale(0). Start at 0.95–0.98.'],
  ['WARN', 'h-screen', /\bh-screen\b|height\s*:\s*100vh|width\s*:\s*100vw/, '100vh/100vw jump or overflow on mobile. 100svh / 100dvh; width: 100%.'],
  ['WARN', 'layout-anim', /transition\s*:[^;]*\b(width|height|top|left|margin|padding)\b/, 'Animating layout properties. transform and opacity only.'],
  ['WARN', 'z-9999', /z-index\s*:\s*9{3,}/, 'z-index 9999. Use a named scale.'],
  ['WARN', 'scroll-listener', /addEventListener\(\s*["']scroll["']/, 'Scroll listener. IntersectionObserver or scroll-driven animations.'],
  ['WARN', 'todo', /\b(TODO|FIXME|XXX)\b/, 'A to-do left in the code. Finish it, or move it to the report.'],
];
const HARD = new Set(['gradient-text', 'palette-purple', 'palette-claude', 'emoji', 'placeholder', 'lazy-code', 'accent-word', 'fake-chrome', 'eyebrow', 'bounce-ease']);
const APP_SOFT = new Set(['mono', 'numbering', 'micro-label', 'hairline']);

const findings = []; let emDashes = 0;
for (const file of files) {
  const rel = relative(process.cwd(), file).split('\\').join('/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let inCode = false; let selector = ''; let pending = '';
  lines.forEach((line, i) => {
    if (line.includes('{')) { selector = pending + line.slice(0, line.indexOf('{')); pending = ''; } else if (!line.includes('}')) pending = (pending + ' ' + line).slice(-300);
    const inUi = /data-ui/.test(selector) || /data-ui/.test(line);
    const overlay = /dialog|modal|popover|menu|dropdown|tooltip|toast|sheet|drawer|sticky|\[open\]/i.test(selector);
    if (line.includes('}') && !line.includes('{')) { selector = ''; pending = ''; }
    if (/<(pre|code)\b/i.test(line)) inCode = true;
    const codeLine = inCode || /<(pre|code|kbd|samp)\b/i.test(line);
    if (/<\/(pre|code)>/i.test(line)) inCode = false;
    if (line.length > 2000) return;
    if (/turbo-ignore/.test(line)) return;
    const comment = /^\s*(\/\/|\/\*|\*|<!--)/.test(line);
    if (!comment) emDashes += (line.replace(/\/\/.*$|\/\*.*?\*\/|<!--.*?-->/g, '').match(/—/g) || []).length;
    for (const [level0, id, re, message] of R) {
      let level = level0;
      if (id === 'lazy-code' ? false : comment && !['todo'].includes(id)) continue;
      if (id === 'mono' && (codeLine || /fonts\.googleapis|fontshare|@import|@font-face|<link/i.test(line) || /(^|[\s,>+~(])(pre|code|kbd|samp)\b|code/i.test(selector))) continue;
      if ((id === 'hairline' || id === 'outlined-box') && /(^|[\s,>+~(])(table|thead|tbody|tfoot|tr|td|th|input|textarea|select|fieldset)\b/i.test(selector)) continue;
      if (inUi && (id === 'hairline' || id === 'outlined-box' || id === 'shadow')) continue;
      if (id === 'shadow' && overlay) continue;
      if (id === 'gradient' && /turbo-scrim|rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.\d+\s*\)\s*,\s*(transparent|rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\))/i.test(line)) continue;
      if (id === 'hairline' && /sr-only|visually-hidden|clip(-path)?\s*:|outline/i.test(line + selector)) continue;
      if (licensed.has(id) && !HARD.has(id)) continue;
      if (brand.has(id)) continue;
      if (app && APP_SOFT.has(id) && level === 'FAIL') level = 'WARN';
      const m = line.match(re);
      if (m) findings.push({ level, id, file: rel, line: i + 1, match: m[0].trim().slice(0, 70), message });
    }
  });
}
if (emDashes > 4) findings.push({ level: 'WARN', id: 'em-dash', file: '(all files)', line: 0, match: `${emDashes} em dashes`, message: 'Em-dash habit. Full stops and commas; one or two per page at most.' });
if (asJson) { console.log(JSON.stringify({ files: files.length, profile, findings }, null, 1)); process.exit(findings.some((f) => f.level === 'FAIL') ? 1 : 0); }

const byId = new Map();
for (const f of findings) { const k = f.level + ' ' + f.id; if (!byId.has(k)) byId.set(k, []); byId.get(k).push(f); }
console.log(`TURBO-DESIGN · LINT   ${files.length} file(s)   profile: ${profile}${licensed.size ? '   licensed: ' + [...licensed].join(', ') : ''}`);
if (!findings.length) console.log('\nNo banned patterns in source. Now run inspect.mjs on the rendered page.');
for (const lvl of ['FAIL', 'WARN']) {
  const keys = [...byId.keys()].filter((k) => k.startsWith(lvl));
  if (!keys.length) continue;
  console.log(`\n${lvl}`);
  for (const k of keys) {
    const list = byId.get(k);
    console.log(`  [${list[0].id}] ${list[0].message}  (${list.length}×)`);
    for (const f of list.slice(0, 5)) console.log(`      ${f.file}:${f.line}  ${f.match}`);
    if (list.length > 5) console.log(`      … ${list.length - 5} more`);
  }
}
const fails = findings.filter((f) => f.level === 'FAIL').length;
const noted = findings.filter((f) => f.level === 'WARN' && (direction.notes || {})[f.id]);
if (noted.length) console.log(`\nNOTED (reason in direction.json): ${[...new Set(noted.map((f) => f.id + ' — ' + direction.notes[f.id]))].join('; ')}`);
console.log(`\nRESULT: ${fails} FAIL, ${findings.length - fails - noted.length} unexplained WARN${noted.length ? `, ${noted.length} noted` : ''}${fails ? ' — fix the FAILs before rendering.' : ''}`);
console.log('A line that must keep a flagged pattern for a real reason carries the comment turbo-ignore (say why in the report). Licensed devices come from .turbo/direction.json.');
process.exit(fails ? 1 : 0);
