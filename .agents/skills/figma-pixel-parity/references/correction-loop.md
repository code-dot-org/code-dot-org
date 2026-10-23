# Correction loop

Each coverage case is captured on its own, so the capture can be compared with one Figma variant.

## Capturing a case

Capture from the component’s own story in design-system Storybook, using the capture URL in `repo.md`. Set the case’s props through the URL `args`. If no story can render the case, add one to the component’s stories rather than a one-off page.

Before the capture:

- `<html>` carries `data-brand="codeai-next"` and the case’s `data-theme` (`Light` or `Dark`).
- Library tokens and the real font files have loaded. A fallback font is a false typography mismatch.
- Transitions and animations are off. Inject `* { transition: none !important; animation: none !important; }` into the page.
- Selected, checked, and disabled come from the component’s real props.
- Hover, focus-visible, and press are produced with real browser input. A capture-only forced pseudo-class is allowed only when the browser cannot hold the state long enough to screenshot, and it must not be a public component prop. Record that mechanism in the recipe note for the case.

Screenshot the component inside `#storybook-root` at the case’s `deviceScaleFactor`. Save the Figma reference and the browser capture in the work directory from `repo.md`, using the case id in the filename. Do not commit them.

## Comparison

Do both checks. Either one can fail the case.

**Visual.** Overlay the Figma screenshot on the browser capture, or diff them. Ignore single-pixel anti-aliasing only. Differences in alignment, weight, icon shape, padding, radius, or color are mismatches. A focus ring that Figma draws as stacked zero-blur shadows matches a CSS `outline` with `outline-offset`. That is not a mismatch, and the outline stays an outline.

**Measured.** On the rendered subject, read layout and computed style and compare with `expectedGeometry` and `expectedVariables`:

- element width and height
- padding, gap, border width, radius
- font-family, size, weight, line-height
- computed background, text, border, and icon color

Resolve token names to computed colors (a probe element using that variable, or the theme value). Comparing two token strings in source is not this check.

## Mismatch record

Each mismatch has a category and a description that names the expected value and the rendered value:

| Category | Examples |
|---|---|
| `geometry` | height 40 vs 36, padding 16 vs 12, radius off |
| `typography` | wrong size, weight, family, or line-height |
| `variable-color` | wrong token, or right token name with the wrong computed color |
| `state` | hover, press, focus, disabled, or selected chrome wrong |
| `icon` | wrong glyph, size, or gap |
| `content` | label, truncation, or slot layout wrong |
| `rendering-noise` | anti-aliasing only |

Fix every category except `rendering-noise`, then recapture those case ids. Append a `correctionPasses` entry with the case ids, what was wrong, what changed, and `recaptured: true`. Set the case `result` to `pass` only after the new capture compares clean.

If the same mismatch survives two fix attempts, stop and escalate with both captures. Do not mark it `pass`.
