# Mini toolbox

`addMiniToolbox(block, options)`: a `+` on a block that opens, inside the
block, a flyout of other blocks, which a student drags into the workspace.
`@code-dot-org/blockly/fields/miniToolbox` also exports the two pieces it is
made of, `FieldFlyout` and `BlockFlyout`.

## Why it exists

Sprite Lab's event blocks carry the blocks that refer to what the event is
about: `when ⟨sprite⟩ created` opens to offer the block that names the new
sprite. Apps calls this the mini toolbox
(`apps/src/blockly/utils/fields/miniToolbox.ts`, with
`apps/src/blockly/addons/cdoFieldFlyout.ts` and `cdoBlockFlyout.ts`), and
tangles it with procedures and the function editor. This is the mechanism
alone. Blockly's own `+`, the mutator, opens a bubble whose blocks cannot
be dragged out, so it cannot do this.

## Requirements

MT-1. `addMiniToolbox(block, {blocks, tooltip?})`, called from a block's
`init` or an extension, puts a toggle button (FLD-12) at the front of the
block's first input, as a field named `MINI_TOOLBOX_FLYOUT_TOGGLE` with
`tooltip`. It does nothing for a block with no inputs, for one that already
has the toggle, and for a block on a workspace that is not rendered, which
draws nothing and so needs none.

MT-2. It sets the block's inputs inline and aligns every one to the left,
so that the block's words stay put as the flyout opens and shuts, and adds
an end-of-row input if the last input is neither one nor a statement, so
that the flyout has a row of its own.

MT-3. It registers with the workspace, under the key
`flyout_<type>_<id>` (`FieldFlyout.flyoutIdFor`), the flyout's contents:
one block of each type in `blocks`, in order, each with
`extraState: {miniToolboxSourceId}` naming the block that opened it. Only a
block type that reads extra state keeps that id. The key names the block,
not its type, so two blocks of one type have flyouts of their own.

MT-4. The toggle shows a plus, from Font Awesome. Pressed, it adds an input
`MINI_TOOLBOX_FLYOUT` holding a `FieldFlyout` (MT-5), shows the flyout, and
shows a minus; pressed again, it removes the input and shows the plus. It
works on a read-only block too (FLD-13), since nothing is edited by
opening it.

MT-5. A `FieldFlyout` is a field whose content is a `BlockFlyout` (MT-6)
showing the contents registered under its key, initialized against the
block's own workspace, so that a block dragged out of it is created there.
It is not editable, and its size is the size of what it draws, measured
anew whenever it is drawn.

MT-6. A `BlockFlyout` is a Blockly horizontal flyout drawn in a group
within its block rather than an SVG of its own: as wide as its blocks and
buttons with a gap after each, as tall as the tallest, on a rounded
rectangle that also clips it, never scrolling, staying open after a drag,
and never deleting a block dropped on it.

MT-7. The toggle's value is not saved. Whether the flyout is open is, as
apps saves it: an open flyout adds `useDefaultIcon: false` to the block's
extra state, and a block loaded with it opens its flyout. A shut flyout
adds nothing. A block's own `saveExtraState` and `loadExtraState` are kept
and receive their own state; a block with only XML mutation hooks
(`mutationToDom`) is left without this, since a JSON hook would replace
them.

## Test vectors

MT-V1 (MT-3). Two `test_hat` blocks with mini toolboxes register two keys,
each holding the hat's own id.

MT-V2 (MT-7). A hat with its flyout open saves `extraState:
{useDefaultIcon: false}` and no `fields`, and loads open.

## Not specified here

- Dragging a block out, which World Lab's tests check with a real drag.
- Apps' function-editor and parameter handling.

## Open questions

1. MT-7: carry the open state through XML too, as apps' `mutationToDom`
   does?
2. MT-3: the registered contents callbacks outlive their blocks. Remove
   one when its block is disposed?
