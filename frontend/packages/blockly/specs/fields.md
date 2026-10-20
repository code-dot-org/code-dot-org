# Fields

Fields ported from apps' Blockly layer (`apps/src/blockly/addons/`) that
blocks shared by many labs use: the dropdown (part 5), and the colour and
button fields (part 6).

## The dropdown

`CdoFieldDropdown` is apps' dropdown: Blockly's, plus the conventions code.org
levels and saved projects rely on.

### Why it exists

Levels written for apps narrow a block's dropdown in the level's XML, with a
`config` attribute on the field, and mark a choice left for the student with
the placeholder `???`. Saved projects hold this field in the form apps saved
it. A dropdown that did not honour all three would load those levels and
projects wrongly. The common blocks (part 7) and Sprite Lab's image
dropdown use it.

### Requirements

FLD-1. `CdoFieldDropdown` is a Blockly dropdown, registered as the field
plugin `field_cdo_dropdown` (`cdoFieldDropdownPlugin`). Built with no
options, its menu is one empty option, `['', '']`, waiting for a `config`.

FLD-2. `EMPTY_OPTION` is `???`. The field accepts it as a value without
offering it in the menu, and shows `???` until a student chooses.

FLD-3. The field accepts a value that its options hold only in double
quotes: asked for `DOG` where an option's value is `"DOG"`, it takes
`"DOG"`.

FLD-4. Any other value it does not offer is refused: the field keeps its
current value and, if it is on a block, logs a warning naming the block
type, the field and the value.

FLD-5. When the field is read from XML with a `config` attribute, its
options become those `config` names (FLD-7), and the field remembers the
`config` and writes it back when written to XML.

FLD-6. Because the field writes its own XML, Blockly saves it in JSON as
that XML, as a string: for example
`<field xmlns="https://developers.google.com/blockly/xml" name="TIMES" config="2-4">3</field>`.
Loading accepts either such a string, which it reads as XML (FLD-5), or a
plain value; for a plain value it first asks a generated menu for its
options, so that the value can be validated against them.

FLD-7. `getUpdatedOptionsFromConfig(config, labels)` reads `config` either
as a printer-style number range, if it names any numbers, or else as a
comma-separated list of values. Each value becomes an option labelled with
`labels[value]` if that is defined, or else with the value with its quotes
removed and in lower case. `arrayToMap(options)` makes such a `labels` map,
value to label, from an option list; from a generated menu it makes an
empty map.

FLD-8. `printerStyleNumberRangeToList(text)` reads a printer-style range,
such as `1,2,4-6`, as the list of numbers it names, ignoring spaces and any
item that is neither a number nor a range of numbers.
`numberListToString(list)` joins numbers with commas.

FLD-9. On a right-to-left block the field shows its text between the
Unicode right-to-left override (U+202E) and pop-directional formatting
(U+202C) marks, as apps' does. Blockly appends only a right-to-left mark
(U+200F), which misorders text that mixes directions (Blockly issue 8645).
Otherwise the text is Blockly's: cut to its display limit with `…`, and
with its whitespace made non-breaking. Apps' copy of the method drops the
non-breaking spaces; this one keeps them.

### Test vectors

FLD-V1 (FLD-7, FLD-8). `config="1-3,5"` gives the options `1`, `2`, `3`
and `5`, each labelled with itself.

FLD-V2 (FLD-7). For a field offering `[['cat', '"CAT"'], ['dog', '"DOG"']]`,
`config='"DOG","BEAR"'` gives `[['dog', '"DOG"'], ['bear', '"BEAR"']]`.

FLD-V3 (FLD-3, FLD-4). On that field, `DOG` sets `"DOG"`; `"BEAR"` is
refused and the value stays `"CAT"`.

FLD-V4 (FLD-8). `printerStyleNumberRangeToList('1, 2,4-6, x')` is
`[1, 2, 4, 5, 6]`.

### Not specified here

- Blockly's dropdown itself: menus, images in options, generated menus.
- Which blocks use the field: `common-blocks.md`, and the labs.

## The colour field

### Why it exists

Blockly moved its colour field and colour blocks out of its core into
`@blockly/field-colour`. Levels and projects use `colour_picker` and its
relatives, so a lab that offers them must install that plugin.

### Requirements

FLD-10. `fieldColourPlugin` is a field plugin named `field_colour` with no
field class of its own (DEF-22): registering it registers
`@blockly/field-colour`'s field and installs its `colour_picker`,
`colour_rgb` and `colour_blend` blocks with their JavaScript generators.
It installs `colour_random` too, unless a block of that type is already
defined; the common blocks' `colour_random` (part 7), if registered first,
is kept.

FLD-11. The plugin has no `uninitialize`, so unregistering it removes
nothing: the field and the four blocks stay defined for the life of the
page.

## The button field

### Why it exists

Some blocks hold a control rather than a value: a button that opens a
picker, a toggle drawn as an icon. Blockly has no such field. Apps'
`CdoFieldButton` is one; this is that field with the changes World Lab
needed, below.

### Requirements

FLD-12. `new FieldButton({value, validator, onClick, transformText, icon,
colorOverrides, allowReadOnlyClick})` makes a button that saves its value.
`fromJson(options)` passes the options through, so a definition that uses
it must supply `onClick` as a function. It is registered as the field
plugin `field_button` (`fieldButtonPlugin`).

FLD-13. Clicking the button calls `onClick` instead of opening an editor.
With `allowReadOnlyClick`, a press calls `onClick` even on a block that
cannot be edited, such as one in a flyout or a read-only workspace.

FLD-14. The button's text is its value, passed through `transformText` if
given. An empty value shows nothing on a button with an `icon`, and a
non-breaking space otherwise, so that a text button still has something to
click. Non-empty text is shown as it is: unlike Blockly's other fields, it
is not cut short, its spaces are not made non-breaking, and on a
right-to-left block it gets no right-to-left mark.

FLD-15. An `icon` is an SVG `tspan` drawn inside the button's text, filled
with `colorOverrides.icon` or the block style's primary colour. An icon
button is as wide as the icon as drawn (`getComputedTextLength`), with the
renderer's field padding on each side, because Blockly would measure the
icon's character in the block's font, which lacks it. Once web fonts have
loaded, a button still on a block draws itself again, so that the icon is
measured in its own font.

FLD-16. The button always states its colours, as an inline style that
outranks Blockly's field classes: its background is
`colorOverrides.button` or the renderer's field background colour
(`FIELD_BORDER_RECT_COLOUR`), and its text `colorOverrides.text` or the
block style's primary colour. So it looks the same wherever the block is.
Apps' button paints only colours a caller gives.

FLD-17. The button wears Blockly's `blocklyEditableField` class when its
block can be edited and the field is enabled, and `blocklyNonEditableField`
otherwise, whatever its own `EDITABLE` flag says. Callers clear that flag
so the button is not treated as a value to edit, and Blockly's own
`updateEditable` then stamps no class at all, which left a button built
with its block (every button in a flyout) unstyled.

### Test vectors

FLD-V5 (FLD-14). A button with an icon and no value shows `''`; one with
neither shows a non-breaking space; one with the value `rules` and
`transformText: t => t.toUpperCase()` shows `RULES`.

FLD-V6 (FLD-10, FLD-11). After registering `fieldColourPlugin` and then
unregistering everything, `field_colour` is still a registered field and
`colour_picker` still a defined block.
