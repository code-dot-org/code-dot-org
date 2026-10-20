# Layout

`serialization.positionBlocksOnWorkspace`: where loaded blocks go when
their saved positions leave them at the workspace's edge. It is apps'
arrangement (`apps/src/blockly/utils/workspace/layout.ts`), which
`Agent.load` runs by default (WS-9).

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
x or its y is the default y. Every block that is not at the edge stays
where it is and is an obstacle for the blocks that are.

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

LAY-10. A block's rectangle is its position, as
`getRelativeToSurfaceXY` reports it, and its size. In a right-to-left
workspace that position is the block's right edge, so the rectangle
lies to the right of the block by its width, and a placed block can be
left overlapping an obstacle of a different width.

LAY-11. Blocks that are not at the edge are never moved, even when they
overlap one another.

LAY-12. `BlocklyWorkspace`'s `positionBlocks` prop, and an `Agent`'s
`positionBlocks`, start as `positionBlocksOnWorkspace` (WS-9, WS-20).

## Test vectors

LAY-V1 (LAY-5). One `text_print` loaded with no position into an 800 by
600 left-to-right workspace ends at (16, 16).

LAY-V2 (LAY-6). Two `text_print` blocks loaded with no position: the lower
one's y is the upper one's y, plus its height, plus 10.

LAY-V3 (LAY-10). In an 800 by 600 right-to-left workspace of view width
`w`, a `math_number` of width `n` at (`w - 16 - n`, 20) and a wider
`text_print` at (`w`, 0): after layout the two blocks overlap.

LAY-V4 (LAY-11). Two `text_print` blocks at (100, 100) and (110, 105) still
overlap after layout.

## Not specified here

- When the layout runs: `workspace.md`, WS-9 and WS-20.
- Blockly's own "Clean up blocks" menu item, which apps replaces with its
  `cleanUp` and this package does not.
- The frames LAY-9 makes room for, which are not ported.

## Open questions

1. LAY-10: apps measures a block from its left edge in a right-to-left
   workspace (`collider.x -= collider.width`). Do the same?
2. LAY-11: apps follows this arrangement with `cleanUp`, which moves every
   movable block off any block it overlaps, to the side if there is room
   and otherwise down. Port it?
3. LAY-9: drop the frame allowance until the frames are ported, or keep it
   so that porting them changes nothing here?
