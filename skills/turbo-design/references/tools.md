# Tools

All scripts: zero dependencies, run with `node` from the project root. `inspect.mjs` needs Node 22+ and Chrome,
Edge or Chromium (set `CHROME_PATH` if it lives elsewhere). `assets.mjs` needs network access, no API keys.

| Script | Does | Key flags |
| --- | --- | --- |
| `lint.mjs <dir or files>` | Static scan of source for banned patterns, copy (EN/IT), lazy code, motion hygiene | `--profile`, `--direction`, `--json` |
| `inspect.mjs <file.html or url>` | Real-browser measurement at several widths, scroll photographs, motion count, keyboard pass, no-JS pass, reduced-motion pass, review kit | `--profile page\|app\|component`, `--widths`, `--out`, `--direction`, `--quick` (one screen per width, no extra passes — for quick looks only, never the final gate), `--json` |
| `deal.mjs` | Deals researched directions (idea, composition, type, palette, hero and section blueprints, photos, motion) at random within the brief; remembers recent deals in `~/.turbo-design/history.json` | `--sector`, `--brief`, `--tone`, `--have`, `--keep palette,type`, `--options 3`, `--direction <id>`, `--redraw <slot>`, `--alternatives <role>`, `--show`, `--list sectors\|directions\|roles\|tones` |
| `assets.mjs "<query>"` | Searches Openverse, Wikimedia Commons, Art Institute of Chicago, the Met (images) and Commons, Internet Archive Prelinger, NASA (video) with licence filtering; downloads and records credits | `--video`, `--get <refs>`, `--credits`, `--license`, `--orientation`, `--source` |

Outputs land in `.turbo/`: `inspect/` (folds, page sheets, `review/` kit, `report.json`), `deal.json` (the dealt
sheet), `direction.json`, `log.json`, `notes.md`. Exit codes: 0 pass, 1 FAIL found, 2 bad input.

## `.turbo/direction.json`

```json
{
  "profile": "page",
  "brief": "<client> — <what it is>; <the one action>",
  "northStar": "<one sentence: the first feeling, what the page revolves around>",
  "idea": "On this page, <something only this subject has> becomes <the device>.",
  "liveThing": "<what the visitor does or sees that is different for them>",
  "colourFrom": "<where in the subject each colour comes from>",
  "fingerprint": { "skeleton": "<direction.md §5>", "displayClass": "<grotesk|condensed|…>", "groundBand": "light|mid|dark", "accentHue": "warm|cool|neutral|other", "signature": "<the signature move>", "source": "deal:<id> | own | studied:<url>" },
  "licenses": [ { "rule": "<rule id from tells.md §2>", "reason": "<the reason in the subject's terms, 20+ characters>" } ],
  "brand": { "owns": [], "reason": "" },
  "facts": ["<every number or endorsement on the page that the brief gives>"],
  "notes": { "<warn id>": "<one sentence: why it is right here>" }
}
```

- `profile` sets which rules apply (pictures, motion and focal-point rules apply to `page` only).
- `licenses`: rules from tells.md §2 only, three at most, each with a 20+ character reason in the subject's terms.
  Hard bans are refused (the inspector reports `license-limit`).
- `brand.owns`: colour or display-font rules the brand itself owns (`palette-purple`, `display-font`, …).
- `facts`: every number or endorsement on the page that comes from the brief; claims not listed stay WARNs.
- `notes`: one sentence per kept WARN. Unexplained WARNs are counted in the result line.

## `.turbo/log.json`

Newest first, at most 20 entries: `{ date, brief, skeleton, displayClass, groundBand, accentHue, signature, source }`.
A new build differs from each of the last three on at least two fields (not in `DESIGN.md` projects).

## Escape hatches (use honestly, report each)

- `data-ui` on the root of a real interface fragment: inside it, borders, shadows and small sizes are allowed.
  Never on a page wrapper (`ui-wrapper` fails).
- `turbo-ignore` in a comment on a source line the linter must skip; `turbo-scrim` marks a neutral photo scrim gradient.
- Real `<pre>/<code>`, tables and form fields keep monospace and lines.

## Troubleshooting

- No Chrome found: install Chrome/Edge or set `CHROME_PATH`. No Node 22: run `lint.mjs` (Node 18+), take
  screenshots with whatever browser tool exists, review those, and say in the report that the inspector did not run.
- Fonts from a CDN offline give `font-fallback` and misleading screenshots — fix the network or self-host.
- Long intros or preloaders captured mid-animation: they are a finding, not an inspector bug (content must be
  readable within ~1.5s).
- A finding you believe is a false positive: verify it on the screenshot; if the page is right, write the reason in
  `notes` (WARN) — FAILs on hard bans are not negotiable.
