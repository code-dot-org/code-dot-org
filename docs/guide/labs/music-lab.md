---
title: Music Lab
description: Reference for the Music Lab workspace — the Blockly toolbox, timeline, sound library, playback controls, and advanced controls.
type: reference
---

Music Lab is a block-based environment for composing music. The workspace has a Blockly toolbox on the left, a block workspace in the center, and a timeline and playback controls at the bottom. There is no text mode.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

![The Music Lab workspace with the Sounds category selected and sound blocks visible in the workspace](images/music-lab-workspace.png)

## Toolbox

![The Sounds category flyout showing play, play drums, play tune, play notes, and rest for blocks](images/music-lab-toolbox.png)

The Blockly toolbox provides blocks for adding sounds, setting tempo, and sequencing events. Block categories depend on the level but typically include:

- **Sounds** — blocks that play a sample, beat pattern, or chord.
- **Flow** — blocks for repeating sections and sequencing events in time.
- **Effects** — blocks that modify volume, panning, or filters.

Available blocks and samples vary by level.

## Timeline

The timeline at the bottom of the workspace shows a horizontal representation of the composition. Each sound block occupies a time range on the timeline. The playhead moves across the timeline during playback, showing the current position.

## Sound library

Sound blocks reference samples from a built-in library. Select the dropdown on a sound block to browse and preview available samples. The library includes drums, bass, synths, vocals, and genre-specific packs. Which samples are available depends on the level.

## Playback controls

![The playback controls area showing the Run button](images/music-lab-playback-controls.png)

Music Lab uses **Play** and **Stop** instead of **Run** and **Reset**. Select **Play** to hear the composition from the beginning. Select **Stop** to pause playback. The playhead returns to the start when you select **Play** again.

## Advanced controls

Some levels expose an **Advanced Controls** panel with options for tempo (beats per minute) and key signature. These controls affect the entire composition.

## Troubleshooting

### No sound plays

Check that your browser allows audio. Many browsers mute pages until the user interacts with them. Click anywhere on the page, then select **Play** again.

### A sound block has no effect

The block may not be connected to the `when run` event. Loose blocks in the workspace are not executed.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
