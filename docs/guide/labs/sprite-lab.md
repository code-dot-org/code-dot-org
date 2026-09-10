---
title: Sprite Lab
description: Reference for the Sprite Lab workspace — the play area, Blockly toolbox categories, costumes, and behavior blocks.
type: reference
---

Sprite Lab is a block-based environment for creating animations and interactive stories with characters. The workspace has a Blockly toolbox on the left, a block workspace in the center, and a play area on the right. There is no text mode.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Sprite Lab workspace showing the main regions of the editor](images/sprite-lab-workspace.png)

## Play area

The play area renders the scene — sprites, backgrounds, and text — at 400 by 400 pixels. It updates when you select **Run**.

## Toolbox

![The Blockly flyout showing sprite creation and property blocks from the Sprites category](images/sprite-lab-toolbox.png)

The Blockly toolbox groups blocks into categories. Available categories depend on the level, but typical ones include:

- **World** — setting backgrounds, adding text overlays, and `showTitleScreen`.
- **Sprites** — creating sprites, setting costumes, position, size, speed, and saying text.
- **Events** — `when run`, `when clicked`, `when touched`, `when key pressed`, and repeating behaviors (forever loops).
- **Behaviors** — pre-built movement and animation behaviors that can be assigned to a sprite (wandering, bouncing, growing, shrinking, spinning, fluttering, and others depending on the level).
- **Math** and **Variables** — numeric operations and variable management.

Sprite Lab shares its rendering engine with Game Lab (both use `p5lab`) but exposes only blocks, never text or a Droplet editor.

## Costumes

Each sprite has a costume — the image it displays. Select the costume dropdown on a sprite block to pick from the built-in library. Some levels allow uploading custom images.

## Run and Reset

![The Run button](images/sprite-lab-run-button.png)

Select **Run** to start the animation. Select **Reset** to stop it and return the play area to its initial state. During **Run**, event blocks (clicks, key presses) are active.

## Troubleshooting

### A sprite does not appear

Confirm the sprite's creation block is attached to the `when run` event. A block not connected to any event is never executed.

### Behaviors do not work

Behavior blocks must be attached to a sprite inside an event. A behavior block placed in the workspace but not connected to a sprite has no effect.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
