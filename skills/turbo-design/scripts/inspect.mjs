#!/usr/bin/env node
// turbo-design / inspect — render the page in a real browser, measure it, photograph it, and judge it.
//
//   node inspect.mjs <url | path/to/file.html> [--profile page|app|component] [--widths 1440,768,390,320]
//                    [--out DIR] [--direction FILE] [--json] [--quick]
//
// Passes: one per width (measure + scroll photographs + motion count), a keyboard pass (Tab focus visibility),
// a no-JavaScript pass (is the content there without script?) and a reduced-motion pass (is it still there?).
// It also writes the review kit for the isolated reviewer: 480px thumbnails and text-masked first screens.
// Exit 0 = no FAIL. Exit 1 = at least one FAIL. Exit 2 = bad input. Zero dependencies; Node 22+ and Chrome/Edge.
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, createReadStream, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join, relative, dirname, extname, sep } from 'node:path';
import { createServer } from 'node:http';
import { Browser, sleep } from './lib/cdp.mjs';
import { probe, frame } from './lib/probe.mjs';
import { extras, focusProbe, hiddenScan } from './lib/extras.mjs';
import { judge, HARD } from './lib/rules.mjs';

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); if (i === -1) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const has = (name) => { const i = args.indexOf('--' + name); if (i === -1) return false; args.splice(i, 1); return true; };
const outDir = resolve(flag('out', '.turbo/inspect'));
const dirFile = flag('direction', null);
let profile = flag('profile', null);
let widthsArg = flag('widths', null);
const asJson = has('json');
const quick = has('quick');
const target = args[0];
if (!target || target === '-h' || target === '--help' || target.startsWith('--')) {
  console.error('usage: node inspect.mjs <url | file.html> [--profile page|app|component] [--widths 1440,768,390,320] [--out DIR] [--direction .turbo/direction.json] [--quick] [--json]');
  process.exit(2);
}

// --- the direction file: profile, licenses, brand-owned devices, confirmed facts, notes for WARNs
let direction = {};
for (const p of [dirFile, '.turbo/direction.json', join(outDir, '..', 'direction.json')].filter(Boolean)) {
  if (existsSync(p)) { try { direction = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { console.error(`Cannot parse ${p}: ${e.message}`); process.exit(2); } break; }
}
profile = profile || direction.profile || 'page';
if (!['page', 'app', 'component'].includes(profile)) { console.error('profile must be page, app or component'); process.exit(2); }
const licenseProblems = [];
const licensed = {};
for (const l of (direction.licenses || [])) {
  if (!l || !l.rule) continue;
  if (HARD.has(l.rule)) { licenseProblems.push(`"${l.rule}" cannot be licensed (it is a hard ban).`); continue; }
  if (!l.reason || String(l.reason).trim().length < 20) { licenseProblems.push(`License for "${l.rule}" has no real reason (20+ characters tied to the subject).`); continue; }
  licensed[l.rule] = String(l.reason).trim();
}
if (Object.keys(licensed).length > 3) licenseProblems.push(`${Object.keys(licensed).length} licenses granted; the limit is 3. A page that needs more is following another style's rules, not this subject.`);
const brand = (direction.brand?.owns || []).filter(Boolean);
const facts = (direction.facts || []).map((f) => String(f).toLowerCase());

const DEFAULT_WIDTHS = { page: '1440,768,390,320', app: '1440,1024,768,390', component: '1280,390' };
const widths = (widthsArg || DEFAULT_WIDTHS[profile]).split(',').map(Number).filter(Boolean);

// --- serve local files over a throwaway local server (relative assets, fetch and modules behave as hosted)
let url = target; let server = null;
if (!/^https?:\/\//.test(target)) {
  const file = resolve(target);
  if (!existsSync(file)) { console.error('No such file: ' + file); process.exit(2); }
  const cwd = resolve('.');
  const low = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
  const root = low(file).startsWith(low(cwd + sep)) ? cwd : dirname(file);
  const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
  server = createServer((req, res) => {
    try {
      let f = resolve(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (low(f) !== low(root) && !low(f).startsWith(low(root + sep))) { res.writeHead(403); return res.end(); }
      if (statSync(f).isDirectory()) f = join(f, 'index.html');
      res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': statSync(f).size, 'cache-control': 'no-store' });
      createReadStream(f).pipe(res);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${relative(root, file).split(sep).map(encodeURIComponent).join('/')}`;
}
const HEIGHT = { 1440: 900, 1280: 800, 1024: 768, 768: 1024, 414: 896, 390: 844, 375: 812, 320: 640 };
const name = (w) => (w >= 1100 ? 'desktop' : w >= 600 ? 'tablet' : w >= 360 ? 'mobile' : 'narrow');

mkdirSync(outDir, { recursive: true });
const reviewDir = join(outDir, 'review');
mkdirSync(reviewDir, { recursive: true });
for (const d of [outDir, reviewDir]) for (const f of readdirSync(d)) if (/\.(jpg|png)$/.test(f)) unlinkSync(join(d, f));
const browser = await Browser.launch();
const helper = await browser.newPage({ width: 1600, height: 1000 });
const report = { url: server ? target : url, at: new Date().toISOString(), profile, licensed, brand, viewports: [], findings: [], images: [], review: [], passes: [] };

const MOTION_MIN = 8, MOTION_GOOD = 14;
const MOTION_RECORDER = `(() => {
  const seen = new WeakSet(); const c = { elements: 0, css: 0, transitions: 0, scripted: 0 };
  const note = (t, k) => { if (!(t instanceof Element) || seen.has(t)) return; seen.add(t); c.elements++; c[k]++; };
  addEventListener('animationstart', (e) => note(e.target, 'css'), true);
  addEventListener('transitionrun', (e) => note(e.target, 'transitions'), true);
  const watch = () => new MutationObserver((list) => { for (const m of list) { const s = m.target.getAttribute && m.target.getAttribute('style') || ''; if (/transform|translate|opacity|scale|rotate|clip-path/.test(s)) note(m.target, 'scripted'); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['style'], subtree: true });
  if (document.documentElement) watch(); else addEventListener('DOMContentLoaded', watch);
  window.__motionSample = () => { for (const a of document.getAnimations ? document.getAnimations() : []) { const t = a.effect && a.effect.target; if (t) note(t, a.constructor && a.constructor.name === 'CSSTransition' ? 'transitions' : 'css'); } };
  window.__motion = () => { window.__motionSample(); const v = [...document.querySelectorAll('video')]; return { ...c, videos: v.length, playingVideos: v.filter((x) => x.autoplay || !x.paused).length }; };
})();`;
const MASK_CSS = '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}::placeholder{color:transparent!important}';

async function sheet(frames, cols, cellW, cellH, path) {
  const rows = Math.ceil(frames.length / cols);
  await helper.setViewport({ width: cols * cellW, height: rows * cellH, dsf: 1 });
  await helper.eval((a) => {
    document.body.style.cssText = `margin:0;background:#888;display:grid;grid-template-columns:repeat(${a.cols},${a.cellW}px)`;
    document.body.innerHTML = a.frames.map((s) => `<img src="data:image/jpeg;base64,${s}" style="width:${a.cellW}px;height:${a.cellH}px;display:block;outline:1px solid #888">`).join('');
    return Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  }, { frames, cols, cellW, cellH });
  await helper.screenshot({ path, quality: 76 });
}
async function thumb(b64, w, path) {
  await helper.setViewport({ width: w, height: 1200, dsf: 1 });
  const h = await helper.eval((a) => { document.body.style.cssText = 'margin:0;background:#fff'; document.body.innerHTML = `<img src="data:image/jpeg;base64,${a.b}" style="width:${a.w}px;display:block">`; return document.images[0].decode().then(() => document.images[0].getBoundingClientRect().height); }, { b: b64, w });
  await helper.setViewport({ width: w, height: Math.max(1, Math.round(h)), dsf: 1 });
  await helper.screenshot({ path, quality: 80 });
}
const runAll = async (page) => {
  const metrics = await page.eval(probe);
  const x = await page.eval(extras, { mobile: page.viewport.width < 600 });
  return { metrics, x };
};

try {
  for (const w of widths) {
    const h = HEIGHT[w] || Math.round(w * 0.625);
    const label = name(w);
    const page = await browser.newPage({ width: w, height: h, dsf: 1, mobile: w < 600 });
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: MOTION_RECORDER }).catch(() => {});
    const how = await page.goto(url, { timeoutMs: 30000, settleMs: 600 });
    // lazy pictures below the fold would be photographed blank: load them all before measuring
    await page.eval(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); }))).catch(() => {});
    await page.eval('document.fonts.ready.then(() => true)').catch(() => {});
    await sleep(1400);
    const fold = join(outDir, `${label}-${w}-fold.jpg`);
    const foldB64 = await page.screenshot({ path: fold, quality: 82 });
    const first = await runAll(page);
    const firstHidden = await page.eval(hiddenScan, true).catch(() => []);

    // review kit: a 480px thumbnail of the first screen and a text-masked copy (the reviewer's three-second test)
    if (w >= 1100 || (w < 600 && w >= 360)) {
      const tw = w >= 1100 ? 480 : 180;
      const tp = join(reviewDir, `${label}-thumb-${tw}.jpg`); await thumb(foldB64, tw, tp);
      await page.eval((css) => { const s = document.createElement('style'); s.id = '__mask'; s.textContent = css; document.head.appendChild(s); }, MASK_CSS);
      const maskB64 = await page.screenshot({ quality: 80 });
      await page.eval(() => document.getElementById('__mask')?.remove());
      const mp = join(reviewDir, `${label}-masked-${tw}.jpg`); await thumb(maskB64, tw, mp);
      report.review.push(tp, mp);
    }

    const frames = [foldB64];
    const frameChecks = [await page.eval(frame).catch(() => null)];
    const screens = quick ? 0 : Math.min(13, Math.max(0, Math.ceil(first.metrics.page.height / h) - 1));
    for (let i = 1; i <= screens; i++) {
      await page.eval(`window.scrollTo({ top: ${i * h}, behavior: 'instant' })`).catch(() => {});
      await page.wheel(2);
      await sleep(650);
      frames.push(await page.screenshot({ quality: 78 }));
      frameChecks.push(await page.eval(frame).catch(() => null));
      await page.eval('window.__motionSample && window.__motionSample()').catch(() => {});
    }
    const motion = await page.eval('window.__motion ? window.__motion() : null').catch(() => null);
    // after scrolling the whole page every reveal must have fired
    // a visitor scrolls continuously; the photo walk jumps a screen at a time, so sweep in thirds before judging
    if (screens) for (let y = 0; y <= first.metrics.page.height; y += Math.round(h / 3)) { await page.eval(`window.scrollTo(0, ${y})`).catch(() => {}); await sleep(90); }
    if (screens) await sleep(1300);
    const never = screens ? await page.eval(hiddenScan, false).catch(() => []) : [];
    await page.eval(`window.scrollTo({ top: 0, behavior: 'instant' })`).catch(() => {});
    await sleep(350);
    const after = await runAll(page).catch(() => first);
    const { metrics: m, x } = after.metrics.headings.length >= first.metrics.headings.length ? after : first;
    // stuck content is a first-screen question: judge it on the first measurement only
    x.stuckFirstScreen = [...new Set([...first.x.stuckFirstScreen, ...firstHidden.map((h) => `${h.text} (${h.why})`)])];
    // confirmed facts lift the matching claims
    x.claims = (x.claims || []).filter((c) => !facts.some((f) => f.includes(c.toLowerCase()) || c.toLowerCase().includes(f)));

    const cols = w >= 1100 ? 2 : w >= 600 ? 3 : 4;
    const cellW = w >= 1100 ? 800 : w >= 600 ? 512 : Math.min(390, w);
    const cellH = Math.round((cellW * h) / w);
    const perSheet = w >= 1100 ? 4 : w >= 600 ? 6 : 8;
    const sheets = [];
    for (let i = 0; i < frames.length; i += perSheet) {
      const p = join(outDir, `${label}-${w}-page-${String(i / perSheet + 1).padStart(2, '0')}.jpg`);
      await sheet(frames.slice(i, i + perSheet), cols, cellW, cellH, p);
      sheets.push(p);
    }
    const findings = judge(m, x, { width: w, profile, licensed, brand });
    const push = (level, id, message, fix) => {
      if (licensed[id] && !HARD.has(id)) { findings.push({ level: 'LICENSED', id, width: w, message: message + ` [licensed: ${licensed[id]}]`, fix }); return; }
      findings.push({ level, id, width: w, message, fix });
    };
    const fc = frameChecks.filter(Boolean);
    const covered = [...new Map(fc.flatMap((f, i) => f.covered.map((c) => [c.text, { ...c, screen: i + 1 }]))).values()];
    if (covered.length) push('FAIL', 'covered-text', 'Large text lies under another element at some scroll position: ' + covered.slice(0, 4).map((c) => `"${c.text}" (screen ${c.screen}, ${Math.round(c.share * 100)}% hidden)`).join('; '), 'Nothing sits on top of a headline or statement.');
    const clipped = [...new Map(fc.flatMap((f, i) => (f.clipped || []).map((c) => [c.text, { ...c, screen: i + 1 }]))).values()];
    if (clipped.length) push('FAIL', 'clipped-text', 'Large text cut off along its top: ' + clipped.slice(0, 3).map((c) => `"${c.text}" (screen ${c.screen})`).join('; '), 'Give the box room for ascenders, or crop at the bottom or a side on purpose.');
    const over = [...new Map(fc.flatMap((f, i) => (f.pinnedOver || []).map((c) => [c.text, { ...c, screen: i + 1 }]))).values()];
    if (over.length) push('WARN', 'pinned-over-picture', 'Pinned large text slides across pictures: ' + over.slice(0, 3).map((c) => `"${c.text}" (screen ${c.screen})`).join('; '), 'Keep pictures out of the pinned column, or unpin it.');
    if (profile === 'page') {
      const runs = new Map();
      frameChecks.forEach((f, i) => { for (const t of f?.big || []) { const r = runs.get(t) || { start: i, last: i - 1, best: 0 }; if (r.last === i - 1) r.last = i; else { r.start = i; r.last = i; } r.best = Math.max(r.best, r.last - r.start + 1); runs.set(t, r); } });
      const longPins = [...runs.entries()].filter(([, r]) => r.best >= 3);
      if (w >= 1100 && longPins.length) push('WARN', 'long-pin', `The same large text stays on screen for ${Math.max(...longPins.map(([, r]) => r.best))} screens in a row.`, 'A pinned element earns two screens, and something must change at each.');
      const empty = frameChecks.map((f, i) => ({ f, i })).filter(({ f }) => f && f.filled < 0.2);
      if (w >= 1100 && empty.length >= 2) push('FAIL', 'empty-screens', `${empty.length} of ${frameChecks.length} desktop screens are almost empty ground (screens ${empty.map(({ i }) => i + 1).join(', ')}).`, 'One deliberate rest per page. Elsewhere: set the content larger, give the full information, use a colour field or a picture, or cut the section.');
      if (w >= 1100 && motion && !quick) {
        const moving = motion.elements + motion.playingVideos * 4;
        if (moving < MOTION_MIN) push('FAIL', 'still-page', `Only ${motion.elements} element(s) moved while the page loaded and scrolled.`, 'Build the motion layer: the signature move, entrances for the parts of each section (varied by content), feedback on every control, one moving picture. A stillness direction licenses this.');
        else if (moving < MOTION_GOOD) push('WARN', 'little-motion', `Little motion: ${motion.elements} element(s) moved.`, 'Entrances for the parts of every section, one moving picture.');
      }
    }
    if (never.length) push('FAIL', 'never-revealed', `${never.length} element(s) still invisible after scrolling the whole page: ${never.slice(0, 4).map((h) => `"${h.text}" (${h.why})`).join(', ')}`, 'A reveal never fired. An IntersectionObserver target hidden by its own clip-path or zero size never intersects: observe a visible wrapper, and keep the safety timer.');
    if (page.consoleErrors.length) push('FAIL', 'console-error', `Script error(s): ${page.consoleErrors.slice(0, 2).join(' | ')}`, 'A page that throws is not finished.');

    // keyboard pass (widest width only): Tab through the first controls; each must visibly change when focused
    if (w === Math.max(...widths)) {
      await page.eval(() => { window.__rest = new Map(); for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), summary')) { const cs = getComputedStyle(el); const anc = [el.parentElement, el.parentElement?.parentElement].filter(Boolean).map((p) => { const c = getComputedStyle(p); return [c.outlineStyle, c.outlineWidth, c.boxShadow, c.backgroundColor, c.borderColor].join('|'); }).join('||'); window.__rest.set(el, { own: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.color, cs.textDecorationLine, cs.borderColor].join('|'), anc }); } document.activeElement?.blur?.(); window.scrollTo(0, 0); });
      const seen = []; let silent = 0, total = 0;
      for (let i = 0; i < 14; i++) {
        await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await sleep(60);
        const f = await page.eval(focusProbe).catch(() => null);
        if (!f || !f.visible) continue;
        const rest = await page.eval(() => window.__rest.get(document.activeElement) || { own: '', anc: '' });
        total++; if (rest.own === f.style && rest.anc === f.anc) { silent++; if (seen.length < 4) seen.push(f.text || f.el); }
      }
      report.passes.push(`keyboard: ${total} controls tabbed, ${silent} without visible focus`);
      if (total && silent / total > 0.25) push('FAIL', 'no-focus', `${silent} of ${total} controls show no visible change when focused with the keyboard: ${seen.map((t) => `"${t}"`).join(', ')}`, ':focus-visible { outline: 2px solid var(--focus); outline-offset: 2px } on every control, shown instantly, 3:1 against its ground.');
      else if (!total && profile !== 'component') push('WARN', 'no-focusables', 'Tab reached no visible control.', 'Real links and buttons, in DOM order.');
    }
    report.viewports.push({ width: w, height: h, load: how, screens: frames.length, filled: frameChecks.map((f) => f?.filled ?? null), motion, metrics: m, extras: x, consoleErrors: page.consoleErrors.slice(0, 5) });
    report.findings.push(...findings);
    report.images.push({ viewport: label, width: w, fold, pages: sheets });
    await page.close();
  }

  // no-JavaScript pass: content must not depend on a script to become visible
  if (!quick && profile !== 'component') {
    const w = Math.max(...widths); const page = await browser.newPage({ width: w, height: HEIGHT[w] || 900 });
    await page.send('Emulation.setScriptExecutionDisabled', { value: true });
    await page.goto(url, { timeoutMs: 30000, settleMs: 800 });
    const hs = await page.eval(hiddenScan, false).catch(() => null); const total = await page.eval(() => document.querySelectorAll('h1, h2, h3, p, img, li, pre, input, button, figure, blockquote').length).catch(() => 1);
    const hidden = hs ? { hidden: hs.map((h) => h.text + ' (' + h.why + ')'), total } : null;
    report.passes.push(`no-JavaScript: ${hidden ? hidden.hidden.length + ' of ' + hidden.total + ' elements invisible' : 'could not evaluate'}`);
    if (hidden && hidden.hidden.length && hidden.hidden.length / Math.max(1, hidden.total) > 0.05) report.findings.push({ level: 'FAIL', id: 'no-js-hidden', width: w, message: `${hidden.hidden.length} of ${hidden.total} headings/paragraphs/images are invisible without JavaScript: ${hidden.hidden.slice(0, 4).map((t) => `"${t}"`).join(', ')}`, fix: 'Put every hidden start state under html.js (set by an inline script) so content is visible when script fails.' });
    await page.close();
  }
  // reduced-motion pass: nothing may stay hidden, and travel should be gone
  if (!quick) {
    const w = Math.min(...widths.filter((x) => x >= 360)) || widths[0]; const h = HEIGHT[w] || 844;
    const page = await browser.newPage({ width: w, height: h, mobile: w < 600, reducedMotion: true });
    await page.goto(url, { timeoutMs: 30000, settleMs: 900 });
    const total = await page.eval('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)');
    for (let y = 0; y < Math.min(total, h * 14); y += h) { await page.eval(`window.scrollTo(0, ${y})`); await page.wheel(2); await sleep(350); }
    await sleep(500);
    const hidden = (await page.eval(hiddenScan, false).catch(() => [])).map((h) => h.text + ' (' + h.why + ')');
    report.passes.push(`reduced motion @${w}px: ${hidden.length} element(s) never appeared`);
    if (hidden.length) report.findings.push({ level: 'FAIL', id: 'reduced-motion-hidden', width: w, message: `With prefers-reduced-motion, ${hidden.length} element(s) never appear: ${hidden.slice(0, 4).map((t) => `"${t}"`).join(', ')}`, fix: 'Under reduce, every element shows in its final state; keep opacity/colour changes, drop travel.' });
    const running = await page.eval(() => (document.getAnimations ? document.getAnimations() : []).filter((a) => a.playState === 'running' && (a.effect?.getKeyframes?.() || []).some((k) => k.transform && k.transform !== 'none')).length).catch(() => 0);
    if (running > 2) report.findings.push({ level: 'WARN', id: 'reduced-motion-travel', width: w, message: `${running} transform animations still run with prefers-reduced-motion.`, fix: 'Wrap travel in @media (prefers-reduced-motion: no-preference).' });
    await page.close();
  }
} finally {
  await browser.close();
  if (server) server.close();
}

for (const p of licenseProblems) report.findings.unshift({ level: 'FAIL', id: 'license-limit', width: 0, message: p, fix: 'Licenses are for devices the subject truly owns, with a reason in its terms, three at most.' });
// de-duplicate findings repeated across widths
const merged = [];
for (const f of report.findings) {
  const same = merged.find((x) => x.id === f.id && x.level === f.level);
  if (same && !['headline-lines', 'overflow', 'wrapped-control'].includes(f.id)) { if (f.width) same.alsoAt = [...(same.alsoAt || []), f.width]; continue; }
  merged.push(f);
}
report.findings = merged;
const fails = merged.filter((f) => f.level === 'FAIL'), warns = merged.filter((f) => f.level === 'WARN'), lic = merged.filter((f) => f.level === 'LICENSED');
const unexplained = warns.filter((f) => !(direction.notes || {})[f.id]);
report.summary = { fails: fails.length, warns: warns.length, unexplainedWarns: unexplained.length, licensed: lic.length, slopSignatures: fails.filter((f) => HARD.has(f.id)).map((f) => f.id) };
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 1));
if (asJson) { console.log(JSON.stringify(report, null, 1)); process.exit(fails.length ? 1 : 0); }

const d = report.viewports[0].metrics; const dx = report.viewports[0].extras;
const line = (s = '') => console.log(s);
line(`TURBO-DESIGN · INSPECT   ${report.url}   profile: ${profile}`);
line('');
line('MEASURED (widest viewport)');
if (d.hero) line(`  ${profile === 'page' ? 'hero headline' : 'largest text '}   "${d.hero.text.slice(0, 70)}"  ${d.hero.words} words · ${d.hero.lines} line(s) · ${d.hero.size}px (${d.hero.vw}vw) · ${d.hero.font} ${d.hero.weight}`);
for (const v of report.viewports.slice(1)) if (v.metrics.hero) line(`  @${v.width}px          ${v.metrics.hero.lines} line(s) · ${v.metrics.hero.size}px`);
line(`  typefaces       ${d.type.families.filter((f) => f.share >= 0.02).map((f) => `${f.family} ${Math.round(f.share * 100)}%`).join(', ')}   (display: ${dx.fonts.display.join(', ') || '-'} · body: ${dx.fonts.body || '-'})`);
line(`  sizes in use    ${d.type.sizes.join(' / ')} px${d.type.body ? `   body ${d.type.body.size}px / ${d.type.body.leading}` : ''}`);
line(`  colour          page ${d.color.bodyBg}${d.color.sectionBgs.length ? ' · sections ' + d.color.sectionBgs.map((s) => s.color).slice(0, 6).join(' ') : ''}${d.color.button ? ' · button ' + d.color.button.bg : ''}`);
line(`  page            ${d.page.screens} screens · ${d.page.words} words · ${d.page.realPictures} pictures · hero media ${d.heroMedia[0] ? Math.round(d.heroMedia[0].ratio * 100) + '% ' + d.heroMedia[0].type : 'none'}`);
if (dx.bands?.length) line(`  section shapes  ${dx.bands.map((b) => b.shape).join(' → ')}`);
line(`  passes          widths ${widths.join(', ')}${report.passes.length ? ' · ' + report.passes.join(' · ') : ' (quick: no keyboard / no-JS / reduced-motion passes)'}`);
const mv = report.viewports[0].motion; if (mv) line(`  motion          ${mv.elements} moving elements · ${mv.playingVideos} playing video`);
line('');
if (!fails.length && !warns.length) line('FINDINGS  none. Measurements are clean — now the isolated review judges the pictures.');
for (const [title, list] of [['FAIL — fix every one', fails], ['WARN — fix, or write a one-sentence reason in direction.json "notes"', warns], ['LICENSED — allowed by the direction', lic]]) {
  if (!list.length) continue;
  line(title);
  for (const f of list) {
    line(`  [${f.id}]${f.width ? ' @' + f.width + 'px' : ''}${f.alsoAt ? ' (+' + f.alsoAt.join(', ') + ')' : ''}  ${f.message}${f.level === 'WARN' && (direction.notes || {})[f.id] ? '  ← noted: ' + direction.notes[f.id] : ''}`);
    if (f.level !== 'LICENSED') line(`      → ${f.fix}`);
  }
  line('');
}
const rel = (p) => relative(process.cwd(), p).split('\\').join('/');
line('SCREENSHOTS — open them before saying anything about quality:');
for (const im of report.images) { line(`  ${(im.viewport + ' ' + im.width + 'px').padEnd(15)} ${rel(im.fold)}`); for (const p of im.pages) line(`  ${''.padEnd(15)} ${rel(p)}`); }
line(`  review kit      ${report.review.map(rel).join('  ')}`);
line('');
line(`report: ${rel(join(outDir, 'report.json'))}`);
line(fails.length ? `RESULT: ${fails.length} FAIL, ${warns.length} WARN (${unexplained.length} unexplained) — not done.${report.summary.slopSignatures.length ? ' Slop signatures: ' + [...new Set(report.summary.slopSignatures)].join(', ') + '.' : ''}`
  : `RESULT: 0 FAIL, ${warns.length} WARN (${unexplained.length} unexplained). The meter is the floor, not the grade: run the isolated review (references/review.md).`);
process.exit(fails.length ? 1 : 0);
