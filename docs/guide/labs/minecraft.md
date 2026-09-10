---
title: Minecraft
description: Reference for the Minecraft workspace — the 3D scene, Blockly toolbox, movement and building blocks, and day-night cycle.
type: reference
---

Minecraft is a block-based puzzle environment set in a 3D Minecraft world. Variants include Adventurer, Designer, Hero, and Aquatic. The workspace has a Blockly toolbox on the left, a block workspace in the center, and a 3D scene on the right.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

## 3D scene

The scene renders a Minecraft landscape from an isometric camera angle. The player character occupies one block space and moves on a 2D grid within the 3D world. The camera follows the character.

## Toolbox

Block categories depend on the variant:

- **Actions** — `moveForward`, `turnLeft`, `turnRight`. In Designer: `placeBlock` (with a material dropdown: planks, cobblestone, stone bricks, and others) and `destroyBlock`. In Hero: `attackEntity`. In Aquatic: `moveForward` in water, `placeInWater`.
- **Loops** — `repeat ... times`.
- **Conditionals** — some levels include `if` and `if/else` for sensing the environment.

### Material dropdown

In Designer levels, the `placeBlock` block has a dropdown listing available materials. The list depends on the level. Each material renders as the corresponding Minecraft texture in the 3D scene.

## Day-night cycle

Some levels include a day-night toggle or timer that changes the lighting of the 3D scene. This is a visual element and does not affect block behavior.

## Run and Reset

Select **Run** to animate the character through the block sequence in the 3D scene. Select **Reset** to return the character to its starting position.

## Troubleshooting

### The character does not reach the goal

The 3D view can be disorienting. The character turns relative to its own facing direction, not the camera angle. Count moves carefully and verify the facing direction after each turn.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
