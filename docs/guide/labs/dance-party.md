---
title: Dance Party
description: Reference for the Dance Party workspace — the stage, Blockly toolbox, song picker, event blocks, and dancer characters.
type: reference
---

Dance Party is a block-based environment where dancers perform choreography synced to a song. The workspace has a Blockly toolbox on the left, a block workspace in the center, and a stage on the right that renders the dancers.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Dance Party workspace showing the main regions of the editor](images/dance-party-workspace.png)

## Stage

![The stage showing a moose sprite surrounded by alien sprites dancing over a spiral background effect](images/dance-party-stage.png)

The stage is the rendering area where dancer sprites appear. It updates during playback, syncing dancer movements to the beat of the selected song.

## Song picker

![The song picker dropdown and preview button above the stage](images/dance-party-song-picker.png)

The song dropdown at the top of the workspace lists available tracks. Selecting a song determines the tempo and beat pattern. Some songs are age-filtered based on the student's age setting; younger students see a subset of the full library.

## Toolbox

![The Blockly flyout showing dancer creation, layout, and behavior blocks from the Dancers category](images/dance-party-toolbox.png)

Blockly categories vary by level but typically include:

- **Events** — `when run`, timing triggers (`atTimestamp`, `everyOther measure`), and input events (`when key pressed`, `when clicked`).
- **World** — setting the background effect (`setBackgroundEffect`), which produces animated visual patterns behind the dancers.
- **Dancers** — creating dancers (`makeNewDanceSprite`), assigning moves (`doMove`, `changeMove`), setting properties (size, tint, visibility), and grouping dancers.
- **Properties** — numeric properties (speed, size) and random values.

## Dancer characters

Each dancer has a character model and a set of moves. The character is set when the dancer is created via `makeNewDanceSprite`. Moves are assigned by name using `doMove` or `changeMove`. Available move names depend on the character.

## Run and Reset

![The Run button](images/dance-party-run-button.png)

Select **Run** to start the song and the choreography. The stage updates in real time, syncing to the beat. Select **Reset** to stop playback and return the stage to its initial state.

## Troubleshooting

### Dancers do not move

Move blocks must be inside an event (such as `atTimestamp` or `everyOther measure`). Blocks placed outside an event are never triggered during playback.

### No song plays

The song picker must have a selection. If the dropdown is empty, the level may not have songs configured. Check that your browser allows audio.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
