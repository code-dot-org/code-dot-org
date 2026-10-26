# Common blocks

`BaseBlocks`: the block definitions labs share. They are apps' common blocks
(`apps/src/blocksCommon.js`), the package's own `when_run` and `comment`,
and every block Blockly itself defines, each as a definition a Driver can
register (DEF-1).

## Why it exists

Saved levels and projects name these block types, their fields, and in
some cases the code they generate. A lab that loads apps' levels must define
the same types with the same field names and generate the same code, or the
levels load wrongly or run differently. Defining them once here keeps every
lab's copy the same.

## The blocks

CMN-1. `BaseBlocks` maps block type to definition. A lab registers the ones
it wants: `driver.setBlocks([BaseBlocks.when_run, BaseBlocks.comment])`.

CMN-2. `when_run` is a hat block, styled `setup_blocks`, reading "when run",
with a following-statement connection only. It generates a blank line.

CMN-3. `comment` is a statement block, styled `comment_blocks`, reading
"comment:" and a text field named `TEXT`. It generates `// ` followed by the
text and a newline. The text is not escaped. Apps' comment block has a fixed
colour; this one takes its theme's.

CMN-4. `controls_repeat_simplified` is a loop reading "repeat", a text field
named `TIMES` (initially `10`), and a statement input named `DO`. `TIMES`
keeps only a nonnegative integer (CMN-5). It generates what Blockly's
`controls_repeat` generates for the same count.

CMN-5. `nonnegativeIntegerValidator(text)` reads `text` as a number after
turning every letter O into zero and removing commas, an empty text being
zero. It returns that number rounded down and at least 0, as text, or
`null`, which refuses the edit, if it is not a number.

CMN-6. `controls_repeat_simplified_dropdown` is `controls_repeat_simplified`
with a dropdown (FLD-1) in place of the text field;
`controls_repeat_dropdown` adds "times" after the dropdown and "do" before
the statement input. Both take their counts from the level's `config`
(FLD-5) and generate as CMN-4 does.

CMN-7. `math_number_dropdown` is a value block of type `Number`, styled
`math_blocks`, holding only a dropdown named `NUM`, whose options come from
`config` and which accepts `???` (FLD-2). It generates what Blockly's
`math_number` generates for its value.

CMN-8. `pick_one`, `category` and `custom_category` are blocks for level
authors, which never reach a student: `pick_one` wraps a statement input
`PICK`; `category` names a toolbox category in a text field `CATEGORY`;
`custom_category` chooses, in a dropdown `CUSTOM`, one of the categories
Blockly or a lab fills in itself: `VARIABLE`, `PROCEDURE`, `Behavior` and
`Location`. Each generates a blank line. Their text is English and not
translated.

CMN-9. `text_join_simple` is built and generates exactly as Blockly's
`text_join`, under another name.

CMN-10. `colour_random` is a value block of type `Colour`, styled
`colour_blocks`, reading "random color", spelled as in the United States.
It generates `@blockly/field-colour`'s random-colour code. The colour field
plugin leaves it in place when it is registered first (FLD-10).

CMN-11. Every other entry is one of Blockly's own blocks (those
`blockly/blocks` defines), under its own type, with Blockly's initializer
and every other method Blockly's definition has, such as
`lists_create_with`'s `saveExtraState`. Its generator is the one Blockly had for that type when the
package was first imported. A Driver replaces each registered type's
generator with its own (DEF-13); capturing Blockly's beforehand is what
keeps a re-registered stock block from calling the Driver's function, which
called the stock block's slot, which by then was the Driver's function
again.

CMN-12. The blocks of CMN-4 to CMN-9 take their words from Blockly's
messages, such as `CONTROLS_REPEAT_TITLE_REPEAT`, when a block is created,
so they appear in the locale loaded then, and in English if that message is
missing.

## Test vectors

CMN-V1 (CMN-4). `controls_repeat_simplified` with `TIMES` 4 generates
`for (var count = 0; count < 4; count++) {\n}\n`.

CMN-V2 (CMN-5). `3.7` gives `3`; `-2` gives `0`; `1,000` gives `1000`; `1O`
gives `10`; `''` gives `0`; `abc` gives `null`.

CMN-V3 (CMN-3). A `comment` block holding `hello` generates `// hello\n`.

CMN-V4 (CMN-11). `math_number` registered from `BaseBlocks` through a Driver
generates `['42', order]` for 42.

CMN-V5 (CMN-11). `lists_create_with` registered from `BaseBlocks` through
a Driver and loaded with `extraState: {itemCount: 5}` has an input `ADD4`,
and saves `extraState: {itemCount: 5}`.

## Not specified here

- The dropdown's `config` and `???`: `fields.md`.
- How a Driver registers the definitions: `definitions.md`.
- Variable and procedure blocks, which are not ported: `procedures.md`.

## Open questions

1. CMN-3: a comment's text is put into the generated code as it is, so a
   saved project whose comment holds a newline puts the rest of the comment
   into the program as code. Apps does the same. Escape it, or strip line
   breaks?
2. CMN-8: translate the level-author blocks' text?
