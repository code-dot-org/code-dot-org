# Fields

Fields ported from apps' Blockly layer (`apps/src/blockly/addons/`) that
blocks shared by many labs use. This part has the dropdown; the colour and
button fields follow in part 6.

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

### Open questions

1. Apps' dropdown draws a right-to-left block's text between the Unicode
   right-to-left override and pop-directional marks, to work around Blockly
   issue 8645, where Blockly appends a right-to-left mark only. This one
   does not.
