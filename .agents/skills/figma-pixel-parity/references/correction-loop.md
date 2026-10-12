# Correction loop

A fixture renders one coverage case at a time so a capture can be compared with one Figma variant. Use the fixture URL in `repo.md`. If the library has no fixture, add the smallest route or Storybook story that meets the contract below before claiming visual parity.

## Fixture contract

- The URL selects component, case id, and mode.
- The page renders only that case inside a fixed-size capture region.
- Library tokens and the real font files are loaded before capture. A fallback font is a false typography mismatch.
- Transitions and animations inside the fixture are disabled.
- Stable selectors exist for the fixture root, the capture region, and the component subject.
- Light and dark use the same switch the library uses in production.
- Selected, checked, and disabled states use the component’s real props.
- Hover, focus-visible, and press are produced in the browser for the capture. A capture-only forced pseudo-class is allowed only when the browser cannot hold the state long enough to screenshot, and it must not be a public component prop. Document that mechanism in the recipe note for the case.

Open the fixture, wait until fonts are ready, then screenshot the capture region at the case’s `deviceScaleFactor`. Save Figma references and browser captures next to the recipe, using the case id in the filename.

## Comparison

Do both checks. Either one can fail the case.

**Visual.** Overlay the Figma screenshot on the browser capture, or diff them. Ignore single-pixel anti-aliasing only. Differences in alignment, weight, icon shape, padding, radius, or color are mismatches.

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
