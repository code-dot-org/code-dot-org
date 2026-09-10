---
title: Play Lab
description: Reference for the Play Lab workspace — the stage, Blockly toolbox, character and background pickers, and event blocks.
type: reference
---

Play Lab is a block-based environment for making interactive stories and simple games. The workspace has a Blockly toolbox on the left, a block workspace in the center, and a stage on the right.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

## Stage

The stage is the rectangular area where characters appear and interact. It supports up to four characters at fixed positions or at coordinates you set in blocks.

## Character and background pickers

Each character slot has a dropdown for choosing the character's image from the built-in library. A background picker at the top of the stage sets the scene's background image.

## Toolbox

Block categories depend on the level:

- **Events** — `when Run`, `when actor 1 touches actor 2`, `when arrow key pressed`, `when actor 1 is clicked`.
- **Actions** — `say` (displays a speech bubble), `move`, `set speed`, `set size`, `hide`, `show`, `set position`, `play sound`, `set background`, `vanish`, `throw`, `score a point`.
- **Loops** — `repeat ... times`, `forever` (runs continuously during execution).

### Speech bubbles

The `say` block displays a speech bubble above the character with custom text. Multiple `say` blocks play in sequence. Each bubble stays visible for a short duration before the next appears.

## Scoring

Some levels include a scoring system. The `score a point` block increments a visible score counter on the stage. The `set score` block sets it to a specific value.

## Run and Reset

Select **Run** to start the story or game. Events are active during execution (clicks and key presses trigger their blocks). Select **Reset** to stop execution and return the stage to its initial state.

## Troubleshooting

### Characters do not move or speak

Action blocks must be attached to an event. Blocks not connected to any event are never executed.

### Events fire at the wrong time

The `when actor 1 touches actor 2` event fires continuously while the two actors overlap. If the event triggers repeatedly, the actors are still overlapping. Move one of them to stop the trigger.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
