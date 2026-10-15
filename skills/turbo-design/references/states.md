# States, forms, microinteractions — and the component-scope run

## 1. The eight states (every interactive element)

| State | Spec |
| --- | --- |
| Default | the resting look from the control grammar |
| Hover | inside `@media (hover: hover) and (pointer: fine)`; one signal (colour, underline, 1–2px lift), never several at once |
| Focus | `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px }` (1px on inputs, 3px on buttons); ≥3:1; **instant, never animated** |
| Active | `transform: scale(0.97)` or `translateY(1px)`, darker fill, 100ms in / 150ms out |
| Disabled | `disabled` or `aria-disabled`, opacity ~0.55 + `cursor: not-allowed`; say why it is disabled when not obvious |
| Loading | label replaced by a spinner or progress in place; width does not change; `aria-busy` |
| Error | border + icon + message + `aria-invalid`; never colour alone |
| Success | the result shown in place; silent when visible, a short result toast when not ("Copied: …") |

Hit areas never change between states; state changes never shove neighbours.

## 2. Inputs and forms

- Label above the input (4–8px gap), always visible; the placeholder shows a format ("01 Jan 2027"), never the label.
- Input height = button height (≥44px); the same border width in every state; focus is an outline, not a border change.
- Helper text below with a reserved line (`min-height: 1lh`); the error replaces the helper; error text says what
  to do.
- Validate on blur once touched, then on input; never on the first keystroke. Disable submit only while invalid
  or in flight. On failure keep everything the user typed and the scroll position; focus the first error; for
  long forms, an error summary at the top with links.
- Native `<select>`, `<input type="date">`, checkboxes with `accent-color` unless you can match their accessibility.
- Textareas `resize: vertical; min-height: 6rem`. Phone inputs ≥16px text (no zoom), the right `inputmode` and
  `autocomplete`.
- Multi-step: show where the user is and how many steps remain in words; Back keeps entered data.

## 3. Microinteractions (recipes)

- **Modal**: native `<dialog>`, backdrop 300ms, content 0.96 → 1 + opacity 250–300ms, close 200ms; focus goes to
  the first field (not the close button); `inert` behind; Esc and backdrop close; focus returns to the trigger.
- **Dropdown / popover**: Popover API or a disclosure; open 180ms from the trigger; light dismiss + Esc; flips
  within 16px of the viewport edge.
- **Tooltip**: hover delay 800–1000ms, focus 0ms, hoverable and dismissible (WCAG 1.4.13).
- **Toast**: a fixed corner stack; 4–6s, paused on hover/focus; errors persist with retry; existing toasts never move.
- **Tabs / segmented**: one indicator that slides 200–250ms; content swaps without height animation.
- **Copy**: the label becomes "Copied" for ~2.5s; no toast.
- **Number change**: roll 400ms, `aria-live="polite"` announces only the final value.
- **Search**: 250ms debounce, matches highlighted with `<mark>`, the count announced after it settles.
- **Delete**: optimistic removal + Undo for 5–10s; the row collapses toward where it was.
- No celebratory confetti for ordinary success; no confirmation dialogs for reversible actions; no auto-rotating
  carousels (or pause on hover and focus, WCAG 2.2.2).

## 4. Accessibility floor

Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1`, heading levels that never skip, `lang` on
`<html>`, a skip link on long pages, alt text, accessible names on icon-only controls, targets ≥44px (≥24px
absolute minimum), no colour-only meaning, nothing flashing over 3Hz, reflow at 400% zoom without horizontal
scroll, `aria-live` for asynchronous results.

## 5. Component scope

When the request is one element (button, input, card, modal, select, tab strip, pricing card, nav):

1. Read the project's tokens, fonts and framework; the component consumes them. No new system for one element.
   No tokens exist: ask "is there a system to follow?" once; silence → derive a minimal token set from the
   surroundings.
2. Skip directions, the deck, pictures and page motion. Keep the tells, the type/colour numbers and the states.
3. Emit two files: the component in the project's idiom (`Button.tsx`, `button.css` + markup…) and a
   **preview page** (`<Name>.preview.html`) rendering every state at once, labelled — the CSS targets both the
   real pseudo-class and a forcing class (`.btn:hover, .btn.is-hover`).
4. Gate it: `node <skill>/scripts/inspect.mjs <Name>.preview.html --profile component` and the linter on the
   component file. Then look at the preview at 100% and 200%.
5. Report the states shipped and anything not verifiable (real data, real latency).
