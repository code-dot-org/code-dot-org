---
name: accessibility-audit
description: Analyze React components for WCAG AA compliance, screen reader compatibility, and keyboard navigation. Use when reviewing or writing UI components in apps/ or frontend/.
---

# Accessibility Audit

Audit scope: WCAG 2.1 Level AA, screen reader compatibility (NVDA/JAWS/VoiceOver), keyboard navigation.

## WCAG AA Checklist

### Perceivable
- **1.1.1 Non-text Content**: every `<img>`, `<svg>`, and icon has `alt` text or `aria-label`. Decorative images use `alt=""` and `aria-hidden="true"`.
- **1.3.1 Info and Relationships**: semantic HTML (`<nav>`, `<main>`, `<header>`, `<section>`, `<ul>`/`<li>`, etc.) conveys structure. Don't use `<div>`/`<span>` when a semantic element exists.
- **1.3.2 Meaningful Sequence**: reading order in DOM matches visual order. Don't reorder visually with CSS in a way that diverges from DOM order.
- **1.3.3 Sensory Characteristics**: instructions don't rely solely on color, shape, or position ("click the red button" → bad; "click Submit" → good).
- **1.4.1 Use of Color**: color is never the sole means of conveying information (e.g., error states need both color and an icon/text).
- **1.4.3 Contrast (Minimum)**: normal text ≥ 4.5:1, large text (18pt / 14pt bold) ≥ 3:1 against background. Use semantic colors from `@code-dot-org/component-library-styles/colors.css` — they are pre-validated.
- **1.4.4 Resize Text**: UI stays functional and readable at 200% zoom, no horizontal scroll at 320px viewport.
- **1.4.10 Reflow**: content reflows at 320px without loss of information or functionality.
- **1.4.11 Non-text Contrast**: UI components and focus indicators ≥ 3:1 against adjacent colors.

### Operable
- **2.1.1 Keyboard**: every interactive element (button, link, input, custom widget) is reachable and operable by keyboard alone.
- **2.1.2 No Keyboard Trap**: focus never gets stuck inside a region (unless it's a modal — modals MUST trap focus, but provide a close mechanism).
- **2.4.3 Focus Order**: logical, predictable tab order (generally follows DOM order). Never use `tabIndex > 0`.
- **2.4.4 Link Purpose**: link text or `aria-label` describes destination/purpose without needing surrounding context.
- **2.4.7 Focus Visible**: keyboard focus is visually distinct. Never remove `:focus` outlines without replacing them with an equivalent visible indicator.

### Understandable
- **3.2.1 On Focus**: focusing an element doesn't trigger unexpected context changes.
- **3.2.2 On Input**: changing a form control doesn't auto-submit or navigate unexpectedly.
- **3.3.1 Error Identification**: form errors are described in text, associated with the input via `aria-describedby`.
- **3.3.2 Labels or Instructions**: every form input has a visible `<label>` or `aria-label`. Placeholder text alone is not a label.

### Robust
- **4.1.2 Name, Role, Value**: all custom interactive components expose name, role, and value to assistive technology via correct ARIA roles/attributes. Prefer native HTML elements — they come with semantics for free.

## Screen Reader Compatibility

### General rules
- Prefer native HTML semantics over ARIA. `<button>` beats `<div role="button">` every time.
- When ARIA is necessary, follow the [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) patterns for the widget type (combobox, dialog, listbox, tabs, etc.).
- Live regions: use `aria-live="polite"` for status updates, `aria-live="assertive"` only for critical interruptions (errors). Attach live regions to the DOM on mount, not dynamically.
- `aria-hidden="true"` removes an element and all its children from the accessibility tree. Never apply to focusable elements or their ancestors.
- `aria-label` / `aria-labelledby` / `aria-describedby` must reference elements that actually exist in the DOM.

### React-specific pitfalls
- `onClick` on non-interactive elements (div, span) is invisible to screen readers. Add `role="button"`, `tabIndex={0}`, and handle `onKeyDown` for Enter/Space — or just use `<button>`.
- Modals: use `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the dialog title. Trap focus on open; restore focus to trigger on close. MUI `<Dialog>` does this correctly — prefer it.
- Dynamic content: when content updates without a page load, announce it via a live region or move focus explicitly.
- SVG icons: `aria-hidden="true"` on decorative icons. Functional icon-only buttons need `aria-label` on the `<button>`, not the `<svg>`.

## Keyboard Navigation

### Expected behaviors by element type
| Element | Keys |
|---------|------|
| Button | Enter, Space activate |
| Link | Enter activates |
| Checkbox | Space toggles |
| Radio group | Arrow keys move within group; Tab moves out |
| Select / Listbox | Arrow keys move; Enter/Space select |
| Dialog | Escape closes; focus trapped inside |
| Tabs | Arrow keys move between tabs; Tab moves into panel |
| Tree / Menu | Arrow keys navigate; Enter/Space activate; Escape closes |

### Focus management
- On modal open: move focus to first focusable element inside, or the dialog container itself.
- On modal close: return focus to the element that opened the modal.
- On route change (SPA): move focus to main content region (`<main>`) or the page heading.
- After async content loads: if the user triggered the load, move focus to new content or announce via live region.
- Implement focus traps with a proper utility — don't roll your own. MUI Dialog handles this; for custom cases use `focus-trap-react` if already a dependency.

### Forbidden patterns
- `tabIndex > 0`: breaks natural tab order. Only `0` and `-1` are acceptable.
- `outline: none` / `outline: 0` without a replacement focus style.
- Keyboard-inaccessible custom widgets (drag-and-drop without keyboard alternative, custom dropdowns without arrow-key support).
- Mouseenter/mouseleave-only interactions with no keyboard or touch equivalent.

## Tooling

### Automated checks (catches ~30% of issues)
- **axe-core**: installed as `axe-core` in the repo. In jest tests: `import { axe, toHaveNoViolations } from 'jest-axe'` — add `expect(await axe(container)).toHaveNoViolations()` to component tests.
- **eslint-plugin-jsx-a11y**: configured in `apps/.eslintrc`. Pay attention to warnings, don't disable rules without justification.
- **Storybook a11y addon**: visible in the DSCO Storybook; run `yarn storybook` in `frontend/packages/component-library/`.

### Manual checks (required; tools miss these)
1. Tab through the entire component using only keyboard. Verify all actions are reachable.
2. Activate with Enter and Space where appropriate.
3. Test with a screen reader: VoiceOver (macOS/iOS) or NVDA (Windows). Verify announced name, role, and state match intent.
4. Zoom browser to 200%; verify no content is clipped or overlaps.
5. Check color contrast with browser DevTools or the axe extension.

## Code Review Checklist

When reviewing or writing a component, verify:
- [ ] All images/icons have `alt` or `aria-label`, or are `aria-hidden`
- [ ] Every interactive element is keyboard-reachable and operable
- [ ] No `tabIndex > 0`
- [ ] Focus styles are visible (not removed with `outline: none`)
- [ ] Form inputs have associated labels
- [ ] Error messages use `aria-describedby`
- [ ] Custom widgets follow APG patterns
- [ ] Color is not the sole differentiator for any state
- [ ] Contrast ratios meet AA minimums (use semantic colors from the design system)
- [ ] Modals trap focus and restore it on close
- [ ] `jest-axe` test added (or updated) for the component
