# Product UI — dashboards, tools, admin, apps (`profile: app`)

Most design guidance is page-shaped. The slop here is different: not cream and serif, but the component-kit
default — a sidebar of twelve icons, a row of KPI cards with green deltas, rainbow status pills, initials
avatars in candy colours, every row a rounded card, uppercase column headers, a purple primary button.

## 1. Start from the task, not the shell

- Name the **one job** the screen does and the **most frequent action**. Write the user's day: when they open
  it, what they look for first, what they change, how often.
- The first screen **is the workspace**: the object and its actions adjacent; the first row of content complete
  above the fold; header + filters ≤ 1–2 rows. No hero, no welcome banner, no explanatory paragraph.
- Choose the structure the task needs, then check it against the trope (sidebar + top bar + card grid):
  list + detail (two panes), board (columns = states), table with an inline editor, timeline, map, calendar,
  a single focused form, a command surface. Keep the baseline users expect (search top, primary action
  top-right, selection shows details) — break the trope only where it costs the task.
- Brand once, small. The top-left belongs to the task's place ("Today · 12 jobs"), not to logo + product name
  repeated on every screen.

## 2. Density and type

- Body 14–15px (13–14 for dense all-day tools), leading 1.45; meta 12–13px; one page title 20–28px.
- One text face is normal; the identity lives in the numbers, the one display moment, and the control grammar.
- **Tabular figures** for every number that aligns or changes; right-align numeric columns; units in the header.
- Sentence case everywhere. Hierarchy from weight and size, not from uppercase tracked labels.
- Truncate with an affordance to see the full text; similar names stay distinguishable after truncation.
- Density is a decision: compact for scanning, comfortable for editing. Say which in `direction.json`.

## 3. Tables and lists

- Data that compares belongs in a real `<table>` (or `role="grid"` when cells are interactive), not a stack of
  rounded cards. Rows separated by space or a tone step; ruled rows are fine — license `hairline` ("rows are data").
- Sticky header, the key column first, the action column last; the row is the click target; the selected row
  shows selection with a fill, not a coloured left edge.
- Sorting shows direction; filtering shows what is filtered and a one-click clear; counts only where they
  change a decision.
- Empty, loading (skeleton matching the row shape) and error states for the table itself.

## 4. Status, colour, avatars

- The accent marks the primary action and the selection. Status colours are a separate small set.
- **Status is never hue alone**: a word, plus one more channel (position in a board column, a filled/hollow
  marker, a progress fraction, an icon shape). Colour only for states that need attention (late, failed,
  waiting on someone). Five pastel pills in five hues is the tell (`pill-rainbow`).
- Avatars: real photos, or initials in the ink on one neutral tone. Never a rainbow of saturated circles
  (`avatar-rainbow`).
- KPI numbers: show the few the user acts on, next to where they act, with the comparison that gives them
  meaning ("3 jobs promised before 12:00, 1 late"). A row of four stat cards with ±% deltas is the template
  (`kpi-row`).

## 5. Controls and the grammar

One sentence decides radius, stroke, fill, press behaviour and selection for buttons, inputs, tabs, chips,
switches, menus and empty states. If the buttons are still the component library's default with the brand
colour swapped in, the controls have not entered the direction. One primary action per region. Icon-only
buttons have an accessible name and a tooltip (hover delay 800ms, focus 0ms). One icon set, stroke matched to
the type weight, size ≈ 1–1.25× the text it sits beside.

## 6. Keyboard and states

- Every action reachable by keyboard; visible `:focus-visible`; logical tab order; Esc closes; arrow keys move
  in lists and grids; a shortcut for the most frequent action, shown in its tooltip.
- Every interactive element ships all of its states ([states.md](states.md)). Every view ships: empty (what is
  empty, why, one action), loading (skeleton when the layout is known; spinner after 150ms, kept ≥300ms),
  error (what happened, why, what to do, retry), partial data, very long content, and permission-denied when relevant.
- Optimistic updates with Undo (5–10s) instead of "Are you sure?" for reversible actions; type-the-name only for
  irreversible ones. Saving shows the result in place; silent success when the change is visible.
- Persisted state is verified: refresh reads it back; a failed save keeps the input and the position.

## 7. Charts (when a chart truly answers a question)

- Choose the form from the question: change over time → line; part of whole at one moment → a single stacked
  bar or a sorted list, not a pie with 7 slices; ranking → sorted bars; distribution → histogram/strip.
- Label directly at the line or bar end instead of a legend; one highlight colour, the rest neutral; axes
  start at zero for bars; gridlines faint or none; tabular figures; units in the title.
- No 3D, no gradients in bars, no donut "dashboard" decoration, no sparkline without numbers.

## 8. Motion in apps

The three basic motions only ([motion.md](motion.md)): press feedback, one state change that shows origin
and destination, one first-visit entrance. Durations from the table; business state updates immediately;
interruptible; no smooth scrolling, no parallax, no scroll narrative.

## 9. Review focus for product screens

The reviewer reports: how many objects are visible above the fold, where the first content row starts, the
distance between the main action and its object, and whether density matches excellent peers. Pictures and
"focal point" rules do not apply; task clarity does.
