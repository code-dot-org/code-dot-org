# React fields

`createReactField` makes a Blockly field whose editor is a React component
and whose look on the block is drawn by a function the lab supplies. The
same part carries small helpers for drawing such fields.

A _field_ is the part of a block a student edits in place: a number, a
dropdown, a colour. Its _editor_ is what opens when it is clicked.

## Why it exists

Blockly's own fields cover text, numbers and menus. A lab whose values are
richer (Music's patterns, chords and tunes) needs an editor of its own and
a picture of the value on the block. Writing a Blockly field by hand means
a class with a dozen overrides, a React root to create and destroy, and the
care to keep React from changing Blockly's value behind its back.
`createReactField` does that once. Music's five custom fields are built on
it.

## Making a field

RF-1. `createReactField(config)` returns a field plugin (DEF-21) named
`config.name`, whose field class is generated for this config. A block
uses it by naming the plugin as an argument's `type` (DEF-9).

RF-2. The value, of type `T`, must survive `JSON.stringify` and
`JSON.parse` unchanged: the editor is given a copy made that way (RF-12).

RF-3. A new field takes `config.defaultValue`, or, if that is a function,
its result, evaluated afresh for each field. `fromJson(options)`, which
Blockly calls when it builds the field from a block definition, takes
`options.currentValue` if given, and the default otherwise.

RF-4. The field is saved with the block. Saving yields
`config.saveState(value)`, or the value itself. Loading sets the value to
`config.loadState(state)`, or to the state itself.

RF-5. `getText()` is `config.getText(value)` if given, otherwise Blockly's.
The field draws no text: it creates Blockly's text element but never fills
it. What the block shows is the preview (RF-10); a field without
`renderPreview` shows only its border.

RF-6. For screen readers, the field's type name is `config.ariaLabel` and
its value `config.getAriaValue(value)`. Blockly's keyboard navigation reads
both when it reaches the field. Both are required.

## The field on the block

RF-7. The field draws a border rectangle with the class
`blocklyDropdownRect`, and, if `renderPreview` is given, an SVG group
translated by (1, 1) for the preview.

RF-8. The field's size is `config.getSize(context)` if given, evaluated at
every render; otherwise `width` by `height`, by default 51 by 18. `padding`,
by default 2, is added on each side, so a default field is 55 by 22. The
border rectangle takes that size. The size is written only when it
changes, since every change makes Blockly re-render the block, which would
otherwise loop.

RF-9. The border is stroked in the block style's tertiary colour and not
filled.

RF-10. At every render, a field with `renderPreview` empties its preview
group, draws a background unless `renderBackground` is false, and calls
`renderPreview({value, element, width, height, sourceBlock, constants})`.
The background is a rectangle at (1, 1) of the unpadded size, with corner
radius 3, filled with the design-system variable `--neutral-base-black` as
it stands at that moment, or `#000` if unset. `constants` is the renderer's
constants provider, for measuring text.

## The editor

RF-11. Clicking the field opens Blockly's dropdown with a `div` inside,
styled by `defaultDropdownStyles` overlaid with `config.dropdownStyle`. The
dropdown takes the block style's primary and tertiary colours and is placed
by the field.

RF-12. In that `div` the field renders `config.Editor` with:

- `value`: a copy of the value (RF-2), which the editor may change freely;
- `onChange(value)`: sets the field's value;
- `onClose()`: closes the editor (RF-14);
- `onRefresh()`: remounts the editor (RF-15);
- `field` and `sourceBlock`.

It is wrapped in `config.EditorWrapper` if given, inside a `div` whose
`data-theme` is the workspace's site theme (RF-17). While the editor is
open it is rendered again, with a fresh copy, at every render of the field,
including the one that follows each `onChange`.

RF-13. If rendering the editor throws, the error is logged, the editor's
React root is unmounted, and the workspace goes on rendering. The next
opening starts afresh.

RF-14. Closing the editor unmounts it and calls
`config.onDisposeDropdown`, if given. Through `onClose` the field does this
and then hides Blockly's dropdown, and hiding the dropdown does it again: so
`onDisposeDropdown` runs twice when the editor closes itself, and once when
Blockly closes it (a click elsewhere).

RF-15. `onRefresh()` unmounts and remounts the editor, discarding its React
state.

## Helpers

RF-16. `getCSSVariable(name)` is the value of the CSS variable `--name` on
`document.body`, or `''` if unset or there is no `window`.

RF-17. `getWorkspaceTheme(workspace)` is the `data-theme` of the nearest
ancestor of the workspace's injection `div` that has one, or `'Dark'` if
none does, or if there is no workspace.

RF-18. `defaultDropdownStyles` is text colour `--neutral-gray-5` (or
`#f5f5f5`), background `--neutral-gray-99` (or `#1a1a1a`), padding 5
pixels, width `auto`. The variables are read once, when the module is first
imported.

RF-19. `measureTextWidth(text, fontSize, constants)` is the width Blockly's
`getFastTextWidth` gives `text` at `fontSize` points in the constants'
field font, and 0 for empty text.

RF-20. `createFieldText(text, x, y, options)` makes an SVG `text` element of
class `blocklyText` at (x, y), filled with `options.fill` or
`--neutral-gray-5`, with the optional font size, style, family and class.
`createFieldIcon(code, x, y, options)` makes one in the font
`"Font Awesome 6 Pro"`, at `options.fontSize` or 13 pixels.

## Test vectors

RF-V1 (RF-8). A field with no size options is 55 by 22.

RF-V2 (RF-5). A field whose `getText` returns `'text:hello'` reports that
from `getText()` and draws an empty text element.

RF-V3 (RF-14). Opening the editor and calling `onClose` calls
`onDisposeDropdown` twice.

RF-V4 (RF-17). A workspace inside an element with `data-theme="Light"` gives
`'Light'`; one inside no such element gives `'Dark'`.

## Not specified here

- How a field plugin is registered: `definitions.md`, DEF-22.
- Music's fields, which are Music's.

## Open questions

1. RF-5: draw `getText`'s result when there is no preview, as the type's
   documentation ("shown when the editor is closed") promises?
2. RF-14: run `onDisposeDropdown` once per closing?
3. RF-18: read the dropdown colours when an editor opens, so that a page
   whose design-system variables load after this module still gets them?
4. RF-17: `'Dark'` is the default for a workspace with no site theme around
   it. Should it be the site's default theme instead?
5. RF-3: Blockly's own fields take their initial value from `value` or
   `text` in the argument; this one takes `currentValue`. Keep the name?
