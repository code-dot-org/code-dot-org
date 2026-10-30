---
name: accessibility
description: Build, audit, and verify accessible UI in the code-dot-org monorepo to WCAG 2.2 Level AA (the floor, not the target). Carries the ECC POUR workflow and adds CodeAI's design-system-first components and Blockly constraints. Use when designing, reviewing, or fixing any interactive UI in apps/ or frontend/.
origin: CodeAI (based on ECC accessibility skill)
---

# Accessibility (CodeAI · WCAG 2.2)

This skill ensures that interfaces are Perceivable, Operable, Understandable, and Robust (POUR)
for all users, including those using screen readers, switch controls, or keyboard navigation. It
focuses on the technical implementation of WCAG 2.2 success criteria. **Level AA is the floor,
not the target**, and accessibility is a feature we ship and call out, not a compliance
afterthought.

The authoritative org build checklist is [checklist.md](checklist.md) (next to this file); when it
disagrees with this skill, the checklist wins.

## When to Use

- Defining UI component specifications for the web (forms, modals, menus, tabs, toggles, labs).
- Auditing existing code for accessibility barriers or compliance gaps (an "a11y pass" / VPAT).
- Implementing WCAG 2.2 standards like Target Size (Minimum) and Focus Appearance.
- Mapping high-level design requirements to technical attributes (ARIA roles, names, states).
- Working on a Blockly-based lab — read [blockly.md](blockly.md) first; its rules differ.

## Core Concepts

- **POUR Principles**: The foundation of WCAG (Perceivable, Operable, Understandable, Robust).
- **Semantic Mapping**: Using native elements over generic containers to provide built-in
  accessibility.
- **Accessibility Tree**: The representation of the UI that assistive technologies actually "read."
- **Focus Management**: Controlling the order and visibility of the keyboard/screen reader cursor.
- **Labeling & Hints**: Providing context through `aria-label` and `aria-describedby`.

## How It Works

### Step 1: Identify the Component Role

Determine the functional purpose (e.g., Is this a button, a link, or a tab?), then resolve it in
priority order. First, the design-system component for that role (load the `design-system` skill,
which owns the choice; e.g. MUI `Button` for a button); it renders the right semantic element and
ships its keyboard, focus, and state behavior. Second, a raw native element (`<button>`, `<a href>`)
only where no design-system component fits, and state why. Never a hand-built `div`/`span` widget.
Find the current primitive in the component library rather than relying on a remembered import
path.

When auditing existing code, first sweep for interactive behavior on non-interactive elements —
`onClick`/`onKeyDown`, or a `role`, on a `div`/`span`/`p` — these div-buttons are the most commonly
missed barrier, and each one resolves through the priority order above.

### Step 2: Define Perceivable Attributes

- Ensure text contrast meets **4.5:1** (normal) or **3:1** (large/UI) — fix contrast by choosing a
  darker semantic color token, never a hardcoded hex (the design system targets APCA).
- Add text alternatives for non-text content (images, icons).
- Implement responsive reflow (up to 400% zoom without loss of function).

### Step 3: Implement Operable Controls

- Ensure a minimum **24x24 CSS pixel** target size (WCAG 2.2 SC 2.5.8).
- Verify all interactive elements are reachable via keyboard and have a visible focus indicator
  (SC 2.4.11) — style `:focus-visible` only; themed components inherit the theme's focus ring.
  Verify it in a real browser (Chrome DevTools or Playwright MCP, when available), since the
  storybook test runner doesn't load the theme and a theme-level focus override can out-specify a
  flat `sx` on anchor-rendered triggers.
- Never use `tabindex > 0`; manage focus on transitions (modal open → dialog, close → trigger;
  route change → new heading); leave no keyboard traps.
- Provide single-pointer alternatives for dragging movements.

### Step 4: Ensure Understandable Logic

- Use consistent navigation patterns.
- Provide descriptive error messages and suggestions for correction (SC 3.3.3).
- Implement "Redundant Entry" (SC 3.3.7) to prevent asking for the same data twice.
- Convey state with more than color — `aria-pressed`, `aria-invalid` + `aria-describedby`, an icon,
  or text.

### Step 5: Verify Robust Compatibility

- Use correct `Name, Role, Value` patterns.
- Implement `aria-live` or live regions for dynamic status updates — prefer the design system's
  alert/notification components, which map role → live politeness. For a constantly-changing value
  (a score, a counter), prefer an inspectable label over spamming a live region.

## Blockly

Blockly-based labs have a separate accessibility model and hard constraints — no screen-reader
support, two stacks, theming as the shipped win. **Read [blockly.md](blockly.md) before any a11y
work in a Blockly lab.**

## Anti-Patterns to Avoid

- **Div-Buttons**: Using a `<div>` or `<span>` for a click event without adding a role and
  keyboard support — use the component (e.g., MUI `Button`).
- **Color-Only Meaning**: Indicating an error or status _only_ with a color change (e.g., turning
  a border red).
- **Uncontained Modal Focus**: Modals that don't trap focus, allowing keyboard users to navigate
  background content while the modal is open. Focus must be contained _and_ escapable via the
  `Escape` key or an explicit close button (WCAG SC 2.1.2).
- **Redundant Alt Text**: Using "Image of..." or "Picture of..." in alt text (screen readers
  already announce the role "Image").
- **Positive `tabindex`**: Any `tabindex > 0` jumps the tab order unpredictably.
- **Test-Coupled A11y**: ARIA tied to `uitest-*` ids, or tests queried by `data-testid`. Use real
  element ids and role/name selectors instead.

## Best Practices Checklist

- [ ] Use the semantic component for the role — links navigate, buttons act.
- [ ] One `<h1>` per page; heading levels descend in order without skipping for font size.
- [ ] Every form control has a programmatic label; related controls grouped in `<fieldset>`/`<legend>`.
- [ ] Every image has alt text — descriptive when informative, `alt=""` when decorative; decorative
      icons are `aria-hidden`.
- [ ] All icon-only buttons have a descriptive text label that states the action.
- [ ] Errors are tied to their field (`aria-describedby` + `aria-invalid`); state is never conveyed
      by color alone.
- [ ] Every interactive element is keyboard-operable (Enter/Space); `Escape` closes overlays;
      `tabindex` is never > 0; no keyboard traps.
- [ ] Focus indicators are clearly visible and high-contrast (style `:focus-visible`).
- [ ] Modals contain focus while open and release it cleanly on close; dropdowns and menus restore
      focus to the trigger element.
- [ ] Interactive elements meet the **24×24px** target size; content reflows when text is scaled.
- [ ] Color is never the only signal; video has captions and audio has a transcript.

## References

- [checklist.md](checklist.md) — authoritative org build checklist + self-test steps.
- [blockly.md](blockly.md) — accessibility in Blockly labs.
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Related Skills

- `design-system` — component choice and design tokens.
