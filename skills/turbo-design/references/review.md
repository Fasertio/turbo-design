# Review — dispatching the isolated reviewer (for the builder)

The builder's eye is optimistic by construction: it sees the intention, not the page. The reviewer is a
**fresh subagent** that never saw the code, the reasoning or earlier scores. It reads its own manual
([reviewer.md](reviewer.md)) — the builder does not, so the build is not tuned to the rubric.

## When

| Change | Review |
| --- | --- |
| New page, new app screen, full redesign | Scored review after `inspect.mjs` shows 0 FAIL; up to three rounds |
| Polishing an existing UI (whole page or more) | One unscored polish review against the existing spec |
| A component | Scored review of the preview page (states) |
| A small local change | None; look yourself at the target width |

## What to send — and what never to send

Send (absolute paths):
- the review kit from `.turbo/inspect/review/` (480px desktop thumbnail, text-masked thumbnail, 180px phone
  thumbnail and its masked copy) and the fold + page sheets from `.turbo/inspect/` at every width;
- the page URL or file path, so the reviewer can open and operate it if it has a browser;
- the brief in the user's words, the profile, the **north star sentence only**, the colour sentence ("where the
  colour comes from"), hard constraints in one sentence (brand, locked fonts);
- the inspector's WARN list and LICENSED list with your one-line reasons.

Never send: source code, your explanation of choices, the direction card, earlier scores, the rubric.

From round 2 on, also send **settled decisions**: one line per issue an earlier reviewer raised that you
resolved deliberately, with the reason ("tags stay at their promised time; overlapping tags stack vertically —
the time axis is the idea"). The new reviewer may reopen one only with visible evidence that it hurts the task.
This stops fresh reviewers from undoing each other without passing them scores or your reasoning.

## The dispatch prompt (fill the brackets)

```
You are an independent design reviewer. You did not make this. Read <skill>/references/reviewer.md and
<skill>/references/tells.md, then review the interface below exactly as reviewer.md says, in its output format.
Mode: [NEW — scored | POLISH — unscored, spec: <path or summary>]. Round: [n].
Profile: [page | app | component].
Brief (user's words): [...]
North star: [...]
Colour comes from: [...]
Hard constraints: [...]
Screenshots: [absolute paths to every fold, page sheet, thumbnail and masked thumbnail]
Live page: [path or URL — open it if you can, operate the main action, tab through it]
Inspector warnings kept, with reasons: [...]
Licensed devices, with reasons: [...]
Settled decisions (round 2+): [...]
Do not edit files. Do not spawn other agents. Judge only what you can see; say what you could not verify.
```

With the Agent tool: a general-purpose subagent, fresh context, this prompt. No subagent capability: review
yourself with reviewer.md *after* you finish building, write "not independently reviewed" in the report, and
lower your score by one tier wherever you hesitate.

## Acting on the review

- First line **"Redo: …"** (score ≤ 6, skeleton still the default or key visual far below category level):
  go back to the direction card for the named sections and re-set skeleton or key visual. Do not patch.
- Otherwise fix the issues in the order given, then the improvements; they are mandatory unless impossible
  (say why in the report). Every **slop sighting** is fixed, or licensed with a subject reason in
  `direction.json`, or answered in the report with why it is not a tell here.
- Protect the **Keep** line: never sand off what made it distinctive.
- Delete the text the reviewer marks as filler unless deleting it creates ambiguity.
- Translate remarks into measurements ("too crowded" → which gap, from what to what).
- Re-run `inspect.mjs`, re-shoot, send the new screenshots to a **new** reviewer (fresh context again).
- Stop when the score is ≥ 8 with no slop sightings, or after three rounds. If round three is still under 8,
  say so plainly with the remaining gaps. If two rounds oscillate on taste without visible gain, keep the better
  version and stop.
