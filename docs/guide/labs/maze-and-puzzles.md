---
title: Maze
description: Reference for the Maze workspace — the grid, Blockly toolbox, character, goal, and feedback dialog.
type: reference
---

Maze is a block-based puzzle environment where a character navigates a grid to reach a goal. Variants include Bee (collecting nectar and honey), Farmer (harvesting and filling), Collector (gathering gems), and Star Wars (controlling BB-8). All share the same workspace layout.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Maze workspace showing the main regions of the editor](images/maze-and-puzzles-workspace.png)

## Grid

![The maze grid showing the character, walls, and goal](images/maze-and-puzzles-grid.png)

The grid shows the character, the goal, walls, and any collectible items. The character faces one of the four cardinal directions and moves one square at a time. The character cannot move through walls.

## Toolbox

Block categories depend on the variant and level:

- **Actions** — `move forward`, `turn left`, `turn right`. In Bee levels: `get nectar`, `make honey`. In Farmer levels: `fill`, `dig`. In Collector levels: `collect`.
- **Loops** — `repeat ... times`, `repeat until` (repeat until reaching the goal or until a condition is met).
- **Conditionals** — `if path ahead`, `if path to the left`, `if path to the right` for sensing which directions are open. Bee levels add `if at flower` and `if at honeycomb`. Some levels include `if/else`.
- **Functions** — defining and calling named procedures (in later levels).

### Conditional blocks

The sensing blocks (`if path ahead`, `if at flower`, etc.) check the state of the square the character is currently on or is about to move to. They are available only in levels that require path-finding rather than a fixed sequence.

## Feedback dialog

After you select **Run**, a dialog appears with the result:

- **Success** — the character reached the goal (and completed any collection requirements). The dialog shows a congratulatory message and a **Continue** button.
- **Failure** — the character hit a wall, missed the goal, or did not collect everything required. The dialog explains what went wrong and offers **Try again** or **Reset**.

## Run and Reset

![The Run button](images/maze-and-puzzles-run-button.png)

Select **Run** to execute the block sequence. The character animates through each step. Select **Reset** to return the character to its starting position without clearing your blocks.

## Start Over

**Start Over** in the toolbar removes all blocks and resets the grid. This is a more destructive action than **Reset**, which keeps your blocks.

## Troubleshooting

### The character hits a wall

The character turns relative to its own facing direction, not the screen. If the character faces up and you use `turn right`, it faces right. Trace the character's facing direction through your block sequence step by step.

### "You used too many blocks"

Some levels have a block limit. Simplify your solution by using loops instead of repeated move and turn blocks.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
