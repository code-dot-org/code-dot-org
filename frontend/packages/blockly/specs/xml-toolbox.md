# XML, toolbox and code utilities

`@code-dot-org/blockly/xml` converts Blockly XML to Blockly's JSON without
a workspace; `@code-dot-org/blockly/utils` holds helpers for toolboxes,
code generation and blocks; and `serialization.forciblyInsertTopBlock`
edits start blocks before they load.

## Why it exists

Every level and project apps saved before Blockly's JSON format, and every
toolbox a levelbuilder writes, is XML. Apps converts XML by loading it into
a Blockly workspace and saving it again
(`apps/src/blockly/utils/serialization/xmlToJson.ts`), which needs every
block type the XML names to be defined. The converter here needs none of
them, so a level can be converted where no lab is loaded, such as when its
files are compiled. The helpers are apps' (`apps/src/blockly/utils/`).

## The converter

XML-1. `convertBlocklyXmlToJson(parser, xml)` parses `xml` with the given
`DOMParser` and returns `{blocks: {blocks}}`, with one block state for each
`<block>` directly under the root element, in order. Other children of the
root are ignored. No Blockly workspace or block definition is used.

XML-2. A block's state has its `type` and `id`; `deletable` and `movable`
as booleans, when the element has those attributes; and `x` and `y` as
integers, when it has both.

XML-3. Blockly's own block attributes take the JSON form Blockly gives
them: `inline` and `collapsed` as booleans, `editable="false"` as
`editable: false`, and `disabled="true"` as
`disabledReasons: ['MANUALLY_DISABLED']`. Every other attribute goes into
`extraState` under its own name, its value converted by XML-4. This is how
a toolbox block's `limit` reaches the block limits plugin (PLG-14).

XML-4. This is how a toolbox block's
`limit` reaches the block limits plugin (PLG-14). It is also where
Blockly's own attributes `disabled`, `inline`, `collapsed` and `editable`
go, so a block loaded from the result is not disabled, inlined, collapsed
or made uneditable.

XML-4. Values are converted: `true` and `false` to booleans, any text that
is a number to that number, and the rest left as text.

XML-5. `<field>` children, and `<title>` children as apps' oldest levels
name them, give `fields`, keyed by `name`, each value its text as it is.
The field converts the text when it loads, so a number field reads `42`
as 42 and a text field keeps `007`.

XML-6. A `<value>` or `<statement>` gives `inputs[name]`, and a `<next>`
gives `next`: `block` from the first `<block>` directly inside it, and
`shadow` from the first `<shadow>` directly inside it, each read as a block
is. A block within a shadow is the shadow's, never the input's.

XML-7. A `<mutation>` puts each of its attributes into `extraState`, its
value converted by XML-4. `controls_if`'s `elseif` and `else` become the
`elseIfCount` and `hasElse` its JSON form reads; every other attribute
keeps its XML name, which is not, for most of Blockly's own blocks, the
name their JSON form reads (`lists_create_with`'s `items` is `itemCount`
there). Each `<arg name>` inside it adds to `extraState.params`: for a procedure
definition (`procedures_defnoreturn`, `procedures_defreturn`), an object
`{name}`, with `id` from its `varid` if it has one, as Blockly's JSON form
for a definition holds; for any other block, the name alone, as a call's
does.
The attributes of the element after the `<mutation>`, usually a `<field>`,
are added too, without replacing those already there, except that an
`elseif` among them does replace.

XML-8. `convertBlocklyXmlToToolbox(parser, xml, categoryName?)` returns
`{name, blocks}`: `name` is `categoryName`, or `flyout`; `blocks` holds
XML-1's block states, each with `kind: 'block'`.

## Toolboxes

XML-9. `toolboxToWorkspaceBlocks(toolbox)` turns a toolbox into a
workspace's start blocks, for editing a toolbox as blocks: `{}` for no
toolbox, otherwise `{blocks: {blocks}}`. In order, each block item is
kept as it is; a dynamic category (one with `custom`) becomes a
`custom_category` block whose `CUSTOM` is the category's id (CMN-8); and a
static category becomes a `category` block whose `CATEGORY` is its id,
followed by its contents. A category named `DEFAULT` gives no `category`
block, only its contents. A block without a type, and any other item, is
skipped with a warning.

XML-10. `getToolboxType(workspace?)` and `getToolboxWidth(workspace?)` are
in `plugins.md`, PLG-8.

## Code

XML-11. `getAllGeneratedCode(options?)` generates code for each of
`options.workspaces`, or the main workspace, in order: it initializes the
generator, generates each top block in position order (only those of type
`options.startBlock`, if given), joins them with newlines and finishes.
The result is `options.extraCode`, then each workspace's code. The
generator is the JavaScript one, or the simple one (DEF-14) for
`language: 'simple'`. A top block that is a value, such as a loose number,
gives its code alone as a statement (`42;`), as Blockly's `workspaceToCode`
does. Apps' `getCode.ts` joins such a block's code and precedence with a
comma (`42,0`).

XML-12. `getCodeFromBlockXmlSource(xml)` and
`getCodeFromBlockJsonSource(json)` load the blocks into a new headless
workspace with Blockly's own loaders, and return the JavaScript generated
from their top blocks as XML-11 does, then dispose the workspace.
`domToBlockSpace(xml, workspace)` creates, with Blockly's XML loader, each
`<block>` directly under an `<xml>` root, in order, and returns them;
`getBlockElements(xml)` returns those elements.

## Blocks

XML-13. `getBlockFields(block)` lists the fields of every input of the
block, in order. `getAllUsedBlocks(workspace)` lists the workspace's blocks
that are enabled and whose root is enabled. `updateBlockEnabled` is in
`plugins.md`, PLG-18.

XML-14. `serialization.forciblyInsertTopBlock(root, type)` changes an XML
start-blocks element, unless it holds a block of `type` anywhere: it
inserts at the front an immovable, undeletable block of `type` with the id
`topBlock`, and moves into its `<next>` the first top-level block that is
not a procedure definition. Both elements are made by the root's own
document, so in a parsed XML document they are XML elements, as the
others are. It is apps' `blockUtils.forceInsertTopBlock`
(`apps/src/block_utils.js`), which apps applies to a level that sets
`forceInsertTopBlock`.

## Test vectors

XML-V1 (XML-7). `<block type="controls_if"><mutation elseif="1"
else="1"/></block>` converts to `extraState: {elseIfCount: 1, hasElse:
true}`, which loads into Blockly's `controls_if`.

XML-V2 (XML-6). `<value name="X"><shadow type="wrapper">...</shadow></value>`
gives `inputs: {X: {shadow: {type: 'wrapper', ...}}}`.

XML-V3 (XML-9). A category with id `Play` holding a `play_sound` block
gives a `category` block with `CATEGORY: 'Play'`, then the `play_sound`
block.

XML-V5 (XML-5). `<field name="CODE">007</field>` gives `fields: {CODE:
'007'}`.

XML-V6 (XML-3). `disabled="true" inline="false" collapsed="true"
editable="false"` gives `disabledReasons: ['MANUALLY_DISABLED']`,
`inline: false`, `collapsed: true` and `editable: false`, and no
`extraState`.

XML-V4 (XML-11). A workspace holding a loose `math_number` of 42 and a
`text_print` of `'a'` generates `\n\n\n42;\n\nwindow.alert('a');\n`.

## Not specified here

- Apps' workspace-based conversion, which a lab with its blocks defined
  may use instead: `Blockly.Xml.domToWorkspace` and
  `Blockly.serialization.workspaces.save`.
- Converting JSON back to XML.

## Open questions

1. XML-7: what are the attributes of the element after a `<mutation>` for?
   For most blocks they add the next field's `name` to `extraState`.
2. XML-7: map the attribute names of Blockly's other mutators
   (`lists_create_with`, `text_join`, `lists_getIndex` and so on), or
   leave legacy mutations to the workspace-based conversion?
