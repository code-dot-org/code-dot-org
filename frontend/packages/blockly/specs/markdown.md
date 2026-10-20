# Markdown

`BlocklyMarkdown`: the shared `Markdown` component
(`@code-dot-org/markdown`) with Blockly XML embedded in it drawn as blocks,
for instructions and documentation.

## Why it exists

Levelbuilders write instructions in markdown and put blocks in them as
Blockly XML: "use the `<xml><block type="when_run"/></xml>` block". Apps'
`SafeMarkdown` lets that XML through its sanitizer and then draws each
`<xml>` as a read-only workspace (`apps/src/templates/SafeMarkdown.jsx`,
`convertXmlToBlockly` in `apps/src/templates/instructions/utils.js`).
Labs on this package need the same instructions to look the same.

## Requirements

MD-1. `<BlocklyMarkdown>` takes the `Markdown` component's props and
`blocks`, `renderer`, `plugins`, `theme` and `draggable`. It renders
`Markdown` with the extensions `blockly` (MD-2), then the one that draws
the XML (MD-4, MD-5), then any `extensions` given.

MD-2. The `blockly` extension lets the elements `xml`, `block`, `field`,
`title`, `value`, `statement`, `next`, `mutation` and `functional_input`
through the sanitizer, each with the attributes `id`, `name`, `type`,
`inline` and `block_text`, and renders each as an element of its own name.
This is apps' list. Anything else in the XML, such as a `<shadow>` or a
block's `x`, `deletable` or `movable`, is removed before it is drawn, as in
apps.

MD-3. The `blockly` extension also clears the sanitizer's `clobberPrefix`,
as apps' sanitizer clears its clobbering, so that the blocks' `id` and
`name` values are not rewritten. That leaves every `id` and `name` in the
document as written, so `BlocklyMarkdown` is only for trusted content,
such as curriculum, never for a student's text.

MD-4. Each `<xml>`, with what MD-2 leaves of it, becomes an inline
`BlocklyWorkspace` (WS-10) whose start blocks are the XML converted by
`convertBlocklyXmlToJson` (XML-1), with the component's `blocks`,
`renderer`, `plugins` and `theme`. Its blocks are a drawing, not a
workspace a student edits.

MD-5. With `draggable`, each `<xml>` becomes instead an inline
`BlocklyFlyout` (FLY-1) in the `group` role, offering the XML's blocks as
converted by `convertBlocklyXmlToToolbox` (XML-8), from which a student
drags or places them into the provider's main workspace. It needs a
`BlocklyProvider` with a main workspace; without one the flyouts are
empty.

MD-6. The component that draws each `<xml>` is made anew whenever
`blocks`, `renderer`, `plugins`, `theme`, `draggable` or `extensions`
changes identity, so every embedded workspace and flyout is unmounted and
mounted again. A lab that passes an array or object made during render
causes this on every render.

## Test vectors

MD-V1 (MD-4). `Drag this: <xml><block type="text_print"><value
name="TEXT"><block type="text"><title name="TEXT">hi</title></block></value></block></xml>
into your program.` draws an SVG holding `print` and `hi`, between the
two pieces of prose.

## Not specified here

- The markdown itself: `@code-dot-org/markdown`.
- Clickable text and the other instruction extensions apps adds.

## Open questions

1. MD-6: make the drawing component once, and give it its options another
   way, so that a lab's render does not remount every embedded workspace?
2. MD-2: let `<shadow>` through, now that the converter reads shadows
   (XML-6)? Apps strips them too, so levels rarely rely on them.
