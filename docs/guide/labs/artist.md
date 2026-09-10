---
title: Artist
description: Reference for the Artist workspace — the canvas, Blockly toolbox, pen controls, and angle helper.
type: reference
---

Artist is a block-based drawing environment. A turtle moves across a canvas, leaving a colored trail. The workspace has a Blockly toolbox on the left, a block workspace in the center, and the canvas on the right.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Artist workspace with direction blocks in the toolbox and two movement blocks attached to the when-run block](images/artist-workspace.png)

## Canvas

The canvas shows the turtle and its trail. The turtle starts at the center, facing right. Lines are drawn as the turtle moves forward. The trail's color and width are controlled by pen blocks.

## Toolbox

![The Blockly flyout showing direction blocks, repeat, and jump](images/artist-toolbox.png)

Block categories depend on the level but typically include:

- **Actions** — `move forward`, `move backward`, `turn right`, `turn left` (each with a pixel or degree parameter), and `jump` (move without drawing).
- **Brushes** — setting pen color, pen width, and pen style (options include regular, raindrops, wavy, squiggly, and others). Some levels include sticker blocks.
- **Loops** — `repeat` blocks for iterating a sequence a fixed number of times.
- **Functions** — defining and calling named procedures.
- **Math** and **Variables** — numeric operations and named values.
- **Comments** — blocks that attach documentation to your code without executing.

### Angle helper

When you drag a `turn right` or `turn left` block, an angle helper appears on the canvas showing a protractor overlay. It displays the current turn angle and updates interactively as you type a value. This helps you visualize how far the turtle will rotate.

## Pen controls

The pen draws whenever the turtle moves forward or backward, using the current color and width. `jump forward` and `jump backward` move without drawing (the pen is temporarily lifted). There is no explicit `pen up` / `pen down` block; use jump blocks to move without drawing.

Some levels provide `set color` and `set width` blocks. The set of available colors depends on the level's block pool.

## Run and Reset

![The Run button](images/artist-run-button.png)

Select **Run** to execute the program. The turtle moves across the canvas, drawing as it goes. Select **Reset** to clear the canvas and return the turtle to its starting position.

## Start Over and Show Code

![The Show Code button in the workspace header](images/artist-show-code.png)

**Start Over** in the toolbar removes all blocks from the workspace. **Show Code** displays the generated JavaScript; it is read-only in Artist (you cannot edit text and convert it back to blocks).

## Troubleshooting

### The shape does not close

The turn angles must add up to 360 degrees for a closed polygon. For a square, use 4 turns of 90 degrees. For a triangle, use 3 turns of 120 degrees.

### Lines overlap or the turtle spins in place

A `turn` with 0 degrees has no effect. A `move forward` with 0 pixels draws nothing. Check that each block has a non-zero parameter.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
