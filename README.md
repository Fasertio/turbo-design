# turbo-design

A design skill for coding agents that builds web interfaces without the generated look, and checks the result in a real browser before calling it done.

Ask an agent for a landing page and you usually get the same page: a cream background with a rust-coloured button, one italic word in the headline, a small uppercase label above every heading, numbered steps 01 to 04, a row of three icon cards, thin dividers everywhere. Nothing in it is broken. Nothing in it was decided.

turbo-design replaces those defaults with decisions taken from the subject itself, and then measures the page to make sure the defaults did not come back.

## How it works

The skill guides the agent through a fixed sequence:

1. **Read what is real.** List 8 to 12 things that belong to this client and to no competitor: its name, its place, its numbers, its constraints, the printed things of its world. Look at how the best products in the category handle the first screen.
2. **Write the argument and the copy first.** Each section exists because it proves a claim. The full text is written before any markup. Numbers, quotes and logos come from the brief or not at all.
3. **Choose a direction.** Three directions are written in words, at least one dealt at random from a research library of 20 art directions, 48 hero layouts and 172 section blueprints, so the agent cannot fall back on its favourite look. Each must pass a difference test and a competitor test ("would this idea still work for the shop down the road?"). A project log stops two builds from sharing the same fingerprint.
4. **Build it still.** Tokens first, then the first screen, then each section. Real pictures (the client's own, generated, or openly licensed archive images with credits), never grey placeholder boxes.
5. **Gate it mechanically.** A linter scans the source; an inspector renders the page in Chrome or Edge and measures it.
6. **Add motion**, then check again.
7. **Review it in isolation.** A fresh subagent that never saw the code looks only at screenshots, lists everything that still reads as generated, and scores the page against a fixed rubric. Up to three rounds.
8. **Subtract and report**, including every check that was not run.

## What the checks catch

The inspector runs the page at four widths (1440, 768, 390 and 320 px for pages), scrolls it screen by screen, presses Tab through the controls, reloads it with JavaScript disabled and again with reduced motion. It reports around 70 rules in three tiers:

| Tier | Meaning | Examples |
| --- | --- | --- |
| Hard ban | Never shipped, cannot be overridden | cream with terracotta, violet accents, gradient text, a styled accent word in a headline, labels above headings, rows of icon cards, nested cards, placeholder text or boxes, content that never appears, invisible keyboard focus, horizontal overflow |
| Licensed | Banned by default, allowed when the subject truly owns it and the reason is written down (three at most) | thin rules for a timetable, monospace for a developer tool, numbering for a real sequence |
| Warning | Usually wrong, needs a one-line justification | centred hero stack, one 12 px radius on everything, more than eight type sizes, stock phrases |

Product screens get their own rules: rainbow status pills, initials avatars in candy colours, rows of KPI cards with green and red deltas.

## Requirements

- A coding agent that supports skills (Claude Code, or any agent that reads a `SKILL.md` folder)
- Node.js 22 or later
- Chrome, Edge or Chromium installed (set `CHROME_PATH` if it lives somewhere unusual)
- Network access for web fonts and the image search (optional)

No npm packages are installed. Every script uses only the Node standard library.

## Installation

Clone the repository and copy the skill folder into your agent's skills directory.

```bash
git clone https://github.com/Fasertio/turbo-design.git
```

**Claude Code, for every project (personal skill):**

```bash
# macOS / Linux
cp -r turbo-design/skills/turbo-design ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse turbo-design\skills\turbo-design $HOME\.claude\skills\
```

**Claude Code, for one project only:** copy the folder to `.claude/skills/turbo-design` inside that project.

Restart the agent so it picks up the skill. If you have other design skills installed, disable them while you use this one; overlapping instructions produce mixed results.

Check that the tools work on your machine:

```bash
node ~/.claude/skills/turbo-design/tests/run.mjs
```

All checks should pass. The test renders a deliberately bad page that must be rejected and a clean page that must pass.

## Usage

You do not need to call the skill by name. Ask for interface work and the agent loads it:

```text
Build a one-page site for a rope workshop in Genoa. The main action is ordering a coil.
Redesign the pricing page in src/pages/pricing.tsx, keep the copy and the routes.
Audit this landing page and tell me why it looks AI-made. Do not change anything.
Build the order queue screen for our warehouse dashboard.
```

In an interactive session the agent proposes three directions and waits for your choice. If you say "just build it", it picks one, tells you which and why, and continues.

When it finishes, the agent reports the direction it chose, the idea behind it, the inspector result, the review scores and anything it could not verify.

### Surfaces

| Profile | For | Differences |
| --- | --- | --- |
| `page` | Landing pages, brand sites, portfolios, event pages | Requires real pictures, a dominant first screen and a motion layer |
| `app` | Dashboards, admin screens, tools, tables, forms | Workspace-first layout, density rules, status and data rules; no picture or motion quotas |
| `component` | A single button, input, card, modal | All interaction states rendered on one preview page |

### Running the tools directly

The scripts are useful on their own, for example to audit an existing page:

```bash
SKILL=~/.claude/skills/turbo-design

node $SKILL/scripts/lint.mjs src/                         # scan source files
node $SKILL/scripts/inspect.mjs index.html                # full browser inspection
node $SKILL/scripts/inspect.mjs http://localhost:3000 --profile app
node $SKILL/scripts/inspect.mjs index.html --quick        # one screen per width, for fast iteration
node $SKILL/scripts/deal.mjs --sector restaurant --brief "a 30-seat fish restaurant" --options 3
node $SKILL/scripts/assets.mjs "genoa harbour 1920"       # openly licensed pictures, with credits
```

Results go to `.turbo/` in the current directory: screenshots at every width, a review kit (480 px thumbnails and text-masked versions) and a `report.json`. Exit code 0 means no failures, 1 means at least one.

A project can record its decisions in `.turbo/direction.json`: the surface profile, licensed devices with their reasons, brand-owned colours and the facts confirmed by the brief. The format is documented in `skills/turbo-design/references/tools.md`.

## Repository layout

```
skills/turbo-design/
  SKILL.md         the workflow the agent follows
  references/      rules and reference material, loaded only when a step needs them
  scripts/         lint, inspect, deal and assets, plus their shared libraries
  library/         the research library used by deal.mjs
  assets/          an optional neutral CSS and JS starting point
  tests/           self-test with a failing and a passing fixture
```

## Limitations

- The checks find what generated pages have in common. They do not make a page good; the isolated review is there for that, and it is still a model judging screenshots.
- A full run takes time: several inspector passes and up to three review rounds. Use `--quick` while iterating.
- Font and image downloads need network access. Offline, fonts fall back and the screenshots will not match the design.
- The review step needs an agent that can start subagents. Without one, the agent reviews its own work and says so in the report.

## License

MIT. See [LICENSE](LICENSE).
