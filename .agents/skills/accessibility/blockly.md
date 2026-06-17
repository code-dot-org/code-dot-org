# Accessibility in Blockly labs (CodeAI)

CodeAI uses Blockly heavily for block-based programming labs, and it has its own
accessibility model. Read this before doing a11y work in any Blockly lab. The durable facts
are here; for current wiring, follow the "where to look" pointers rather than trusting any
file path verbatim.

## Identify the stack first

There are two Blockly stacks with very different accessibility stories. Confirm which one a
lab uses before recommending anything (grep the lab's imports; the modern stack imports the
npm `blockly` package, the legacy one uses a global `window.Blockly`).

- **Modern** — the npm `blockly` package under `apps/src/blockly/`. Used by the newer labs
  (Dance, Poetry, Music, Sprite Lab, function editor, …). Has keyboard navigation and
  accessible themes.
- **Legacy** — the vendored Google-Blockly fork under `apps/lib/blockly/` (`window.Blockly`).
  Used by the CSP/CSF 20-hour curriculum (Maze, classic Artist/Turtle, Studio/play lab). It
  has **no** cursor/marker primitives — **zero block-workspace keyboard accessibility.** Treat
  block-level a11y on legacy labs as architectural (needs migration), not a quick fix.

## What is and isn't accessible

- **No screen-reader support in either stack.** The block workspace is SVG with no ARIA / role /
  title / desc on the blocks, and upstream Blockly screen-reader support is not production-ready.
  Don't promise a screen-readable workspace — provide an **out-of-band accessible path**
  (accessible instructions, a text representation, or a non-block route to the learning goal).
- **Keyboard navigation** exists only on the modern stack, via the Blockly keyboard-navigation
  plugin, wrapped in CodeAI's own keyboard-nav addon (look under `apps/src/blockly/addons/`).
  Every workspace you create — including secondary ones like a modal function editor — must be
  registered with that addon or it is keyboard-dead. Find the init/registration helper and route
  through it; don't call the plugin raw.
- **Theming is the shipped accessibility win.** A settings panel (search
  `apps/src/templates/Settings.jsx`) offers high-contrast and colorblind themes (protanopia /
  deuteranopia / tritanopia, light and dark). This is where most of CodeAI's real Blockly a11y
  investment lives — color, not assistive tech.

## Working on Blockly a11y

- **Colorblind palettes are generated, not hand-picked.** When block colors change, regenerate
  via the palette generator in `apps/src/blockly/themes/` rather than choosing hex by eye, and
  add entries for any new block category so it doesn't fall back to defaults.
- **Custom fields bypass standard rendering** (color pickers, bitmap/pattern/sound fields, …).
  Auditing the generic workspace is not enough — check each custom field for keyboard focus and
  contrast individually.
- **Watch upstream-workaround monkey-patches** in the keyboard-nav addon on any Blockly or
  plugin version bump; some exist only to paper over upstream bugs and are meant to be removed
  when those land.
- **Regression baseline:** `apps/src/blockly/TESTING.md` is the manual checklist — all themes ×
  dark mode × RTL, plus the custom fields.

## Testing Blockly with Playwright

The workspace has no accessibility tree to query, so role/label locators don't reach the blocks.
`page.evaluate(...)` against the Blockly JS API is the sanctioned escape hatch for driving and
asserting on block state in e2e.
