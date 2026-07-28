# Accessibility in Blockly labs (CodeAI)

CodeAI uses Blockly heavily for block-based programming labs; its accessibility is largely built
into Blockly core, with CodeAI adding theming on top. Read this before doing a11y work in any
Blockly lab. The durable facts
are here; for current wiring, follow the "where to look" pointers rather than trusting any
file path verbatim.

## How labs load Blockly

Mainline Google Blockly (npm `blockly`), wrapped in `apps/src/blockly/blocklyWrapper.ts`. Newer
labs import the wrapper; older CSP/CSF labs use the `window.Blockly` global. Keyboard nav, themes,
and screen-reader behavior follow the Blockly version, not how a lab loads it. (`apps/lib/blockly/`
is just `Blockly.Msg` locale strings.)

## What is and isn't accessible

- **The block workspace is screen-reader accessible** via Blockly's built-in keyboard navigation
  (Blockly 13). Pair it with an accessible out-of-band path (clear instructions, a text view, or a
  non-block route) where that serves the learning goal better.
- **Keyboard navigation is built into Blockly core** (Blockly 13) and active globally — no plugin,
  no per-workspace registration. Use the standard Blockly key bindings for consistency with other
  Blockly platforms; don't add CodeAI-specific shortcuts or a bespoke nav addon.
- **Theming is CodeAI's main a11y contribution** on top of Blockly's built-in support. A settings
  panel (search `apps/src/templates/Settings.jsx`) offers high-contrast and colorblind themes
  (protanopia / deuteranopia / tritanopia, light and dark).

## Working on Blockly a11y

- **Colorblind palettes are generated, not hand-picked.** When block colors change, regenerate
  via the palette generator in `apps/src/blockly/themes/` rather than choosing hex by eye, and
  add entries for any new block category so it doesn't fall back to defaults.
- **Custom fields bypass standard rendering** (color pickers, bitmap/pattern/sound fields, …).
  Auditing the generic workspace is not enough — check each custom field for keyboard focus and
  contrast individually.
- **Watch upstream-workaround monkey-patches** in `apps/src/blockly/blocklyWrapper.ts` on any
  Blockly version bump; some exist only to paper over upstream bugs and are meant to be removed
  when those land.
- **Regression baseline:** `apps/src/blockly/TESTING.md` is the manual checklist — all themes ×
  dark mode × RTL, plus the custom fields.

## Testing Blockly with Playwright

In Blockly 13 the workspace exposes an accessibility tree (blocks as named
`figure`/`button`/`listitem` nodes under an `application` region) — prefer driving and asserting on
it through role/name locators.
