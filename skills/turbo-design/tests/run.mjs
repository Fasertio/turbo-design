#!/usr/bin/env node
// turbo-design self-test: the meters must catch slop and must not punish a clean page.
//   node tests/run.mjs            (Node 22+, Chrome or Edge installed)
import { writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(HERE, '..', 'scripts');
const FIX = join(HERE, 'fixtures');

// --- raster pictures for the clean fixture (a real PNG encoder, no dependencies)
const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
function png(w, h, seed) {
  const raw = Buffer.alloc((w * 3 + 1) * h); let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const base = [[96, 84, 60], [58, 70, 66], [120, 110, 88], [40, 52, 48]][seed % 4];
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const n = (Math.sin(x / (9 + seed)) + Math.cos(y / (13 + seed))) * 18 + rnd() * 30; const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = Math.max(0, Math.min(255, base[0] + n)); raw[o + 1] = Math.max(0, Math.min(255, base[1] + n)); raw[o + 2] = Math.max(0, Math.min(255, base[2] + n)); } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (let i = 1; i <= 4; i++) { const p = join(FIX, 'clean', `p${i}.png`); if (!existsSync(p)) writeFileSync(p, png(600, 400, i)); }

const run = (script, args, cwd) => { const r = spawnSync(process.execPath, [join(SCRIPTS, script), ...args], { cwd, encoding: 'utf8', timeout: 600000 }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const json = (r) => { try { return JSON.parse(r.out.slice(r.out.indexOf('{'))); } catch { return null; } };
let failed = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + detail}`); if (!ok) failed++; };

// 1. lint
const lintSlop = json(run('lint.mjs', ['.', '--json'], join(FIX, 'slop')));
const lintIds = new Set((lintSlop?.findings || []).filter((f) => f.level === 'FAIL').map((f) => f.id));
for (const id of ['gradient-text', 'palette-purple', 'palette-claude', 'emoji', 'placeholder', 'accent-word', 'eyebrow', 'mono', 'gradient', 'shadow', 'hairline', 'numbering']) check(`lint catches ${id} on the slop fixture`, lintIds.has(id), [...lintIds].join(','));
const lintClean = json(run('lint.mjs', ['.', '--json'], join(FIX, 'clean')));
check('lint passes the clean fixture', lintClean && !lintClean.findings.some((f) => f.level === 'FAIL'), JSON.stringify(lintClean?.findings?.filter((f) => f.level === 'FAIL')));

// 2. inspect
const outSlop = join(HERE, '.out', 'slop'); const outClean = join(HERE, '.out', 'clean');
rmSync(join(HERE, '.out'), { recursive: true, force: true }); mkdirSync(outSlop, { recursive: true }); mkdirSync(outClean, { recursive: true });
const insSlop = json(run('inspect.mjs', ['index.html', '--widths', '1440,390', '--out', outSlop, '--json'], join(FIX, 'slop')));
const slopIds = new Set((insSlop?.findings || []).filter((f) => f.level === 'FAIL').map((f) => f.id));
for (const id of ['accent-word', 'eyebrow', 'gradient-text', 'palette-purple', 'icon-cards', 'nested-cards', 'side-stripe', 'placeholder', 'placeholder-box', 'emoji', 'broken-image', 'display-font', 'body-size', 'few-pictures', 'button-fx', 'small-text', 'fake-chrome', 'numbering', 'headline-lines', 'clipped-content', 'never-revealed']) check(`inspect catches ${id} on the slop fixture`, slopIds.has(id), [...slopIds].join(','));
check('inspect flags the invented claims', (insSlop?.findings || []).some((f) => f.id === 'claim'));
const insClean = json(run('inspect.mjs', ['index.html', '--widths', '1440,768,390,320', '--out', outClean, '--json'], join(FIX, 'clean')));
const cleanFails = (insClean?.findings || []).filter((f) => f.level === 'FAIL');
check('inspect passes the clean fixture (0 FAIL, incl. keyboard, no-JS and reduced-motion passes)', insClean && cleanFails.length === 0, cleanFails.map((f) => f.id + ': ' + f.message.slice(0, 120)).join(' | '));
check('inspect writes the review kit', (insClean?.review || []).length >= 4);

// 3. licenses: a hard ban cannot be licensed, a soft one can
const dir = join(HERE, '.out', 'direction.json');
writeFileSync(dir, JSON.stringify({ profile: 'page', licenses: [{ rule: 'eyebrow', reason: 'trying to license a hard ban here' }, { rule: 'hairline', reason: 'the page is a price list; rows are data' }] }));
const insLic = json(run('inspect.mjs', ['index.html', '--widths', '1440', '--quick', '--direction', dir, '--out', join(HERE, '.out', 'lic'), '--json'], join(FIX, 'slop')));
check('a hard ban cannot be licensed', (insLic?.findings || []).some((f) => f.id === 'license-limit') && (insLic?.findings || []).some((f) => f.id === 'eyebrow' && f.level === 'FAIL'));
check('a soft rule can be licensed', (insLic?.findings || []).some((f) => f.id === 'hairline' && f.level === 'LICENSED') || !(insLic?.findings || []).some((f) => f.id === 'hairline' && f.level === 'FAIL'));

// 4. deal
const deal = run('deal.mjs', ['--sector', 'restaurant', '--brief', 'a 30-seat fish restaurant on a canal', '--options', '--out', join(HERE, '.out')], HERE);
check('deal --options deals three directions', (deal.out.match(/^## `/gm) || []).length === 3, deal.out.slice(0, 200));

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
