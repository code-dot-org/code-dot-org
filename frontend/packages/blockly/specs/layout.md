# Layout

`serialization.positionBlocksOnWorkspace`: where loaded blocks go when
their saved positions leave them at the workspace's edge. It is apps'
arrangement (`apps/src/blockly/utils/workspace/layout.ts`), which
`Agent.load` runs by default (WS-9), and `cleanUp`, which moves blocks off
one another.

## Why it exists

Levels' start blocks are often written without positions, and Blockly puts
a block without one at the origin, so every such block lands on top of the
others, against the corner. Apps moves them apart on load; a level loaded
here must look as it does there.

## Requirements

LAY-1. `positionBlocksOnWorkspace(workspace)` does nothing to a workspace
that is not rendered.

LAY-2. `getDefaultLocation(workspace?)` is `{defaultX, defaultY}`: `0, 0`
in a left-to-right workspace, and the view's width and 0 in a
right-to-left one. With no workspace it reads Blockly's main workspace.

LAY-3. The top blocks are taken in Blockly's position order (top to
bottom, then by direction of reading), and
`partitionJsonBlocksByType(blocks, types)` moves those whose type is in
`types` to the front, each group keeping its order. The types first are
the setup blocks, `when_run` and `Dancelab_whenSetup`, so a setup block
is placed before the blocks that would otherwise push it down.

LAY-4. A block is at the edge (`isBlockAtEdge`) when its x is the default
x or its y is the default y. Until LAY-11, every block that is not at
the edge stays where it is and is an obstacle for the blocks that are.

LAY-5. Each block at the edge, in the order of LAY-3, first moves in: an x
at the default x becomes 16 pixels in from the side the workspace reads
from (the view's width less 16, right to left), and a y at the default y
becomes 16. A coordinate that is not at the default is kept. If the view
has no width, the x is 0 or, right to left, the content's width.

LAY-6. Then the block is compared with the obstacles from top to bottom.
Whenever it overlaps one, it moves down to 10 pixels below that obstacle's
bottom, keeping its x, and the comparison continues with the next obstacle
from there. Once past them all, the block is itself an obstacle.

LAY-7. `isOverlapping(a, b)` is true when the two rectangles share any
area; rectangles that only touch do not overlap.

LAY-8. `insertCollider(colliders, collider)` inserts a rectangle into a
list kept in order of bottom edge, before the first rectangle whose bottom
is lower, and changes the list it is given.

LAY-9. A block that has the function block mixin (`isFunctionBlock`) is
drawn by apps inside a frame, and is laid out as if it were that frame: its
rectangle grows by 15 pixels on each side, 35 above and 5 below; it moves in
15 pixels further from the side and 35 further from the top; and it stops
35 pixels further below an obstacle. Nothing in the package marks a block
with that mixin.

LAY-10. A block's rectangle is its position and size. In a right-to-left
workspace Blockly reports a block's position at its right edge, so the
rectangle starts the block's width to the left of it.

LAY-11. Then every movable top block, in position order, is moved off the
blocks before it, which `cleanUp(workspace)` does alone. Immovable blocks
stay and are obstacles. Each block first moves in from the edge as in
LAY-5, and is then compared with the obstacles from top to bottom. When it
overlaps one that starts behind it in reading order (to its left, or right
to left to its right), it moves beside that obstacle, 10 pixels clear, if
it then still fits within the wider of the view and the content, less 16
pixels; right to left, if its left edge stays at 0 or more. Otherwise it
moves down to 10 pixels below the obstacle, keeping its x. Once past them
all, it is an obstacle.

LAY-12. `BlocklyWorkspace`'s `positionBlocks` prop, and an `Agent`'s
`positionBlocks`, start as `positionBlocksOnWorkspace` (WS-9, WS-20).

LAY-13. `cleanUp(workspace, true)` moves immovable blocks as well.

## Test vectors

LAY-V1 (LAY-5). One `text_print` loaded with no position into an 800 by
600 left-to-right workspace ends at (16, 16).

LAY-V2 (LAY-6). Two `text_print` blocks loaded with no position: the lower
one's y is the upper one's y, plus its height, plus 10.

LAY-V3 (LAY-10). In an 800 by 600 right-to-left workspace of view width
`w`, a `math_number` of width `n` at (`w - 16 - n`, 20) and a wider
`text_print` at (`w`, 0): after layout the two blocks do not overlap.

LAY-V4 (LAY-11). Two `text_print` blocks at (100, 100) and (110, 105), of
width `t`: after layout the first is where it was, and the second is at
(110 + `t`, 105).

## Not specified here

- When the layout runs: `workspace.md`, WS-9 and WS-20.
- Blockly's own "Clean up blocks" menu item, which apps replaces with
  `cleanUp` and this package leaves as Blockly's.
- The frames LAY-9 makes room for, which are not ported.

## Open questions

1. LAY-9: drop the frame allowance until the frames are ported, or keep it
   so that porting them changes nothing here?
2. Replace Blockly's "Clean up blocks" with `cleanUp`, as apps does outside
   its toolbox mode?
