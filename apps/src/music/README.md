# Music Lab

<img width="1512" alt="Screenshot 2024-02-12 at 10 11 06 AM" src="https://github.com/code-dot-org/code-dot-org/assets/2205926/ab4c80eb-8824-457f-b0e2-cf330b5dbce0">

## Overview

This is the client-side code for **Music Lab**, as instantiated by a `music` level using [Lab2](../lab2/).

**Music Lab** is a powerful lab for creating music using code. It includes the following features:

- Uses Google Blockly for editing user code.
- The user code generates a timeline of audio events, which is rendered.
- Uses WebAudio to play back the audio events.
- The rendered timeline of audio events reflects code changes instantly.
- Code can be changed while audio is playing.
- Support for user-triggered code.
- Support for user-created functions on the main Blockly workspace.
- A comprehensive programming model that supports playing sounds together or sequentially, in a fully composable fashion.
- UI features that allow students to understand connections between code and output:
  - audio events that highlight when the associated code block is clicked.
  - code blocks that highlight when an associated audio event is clicked.
- Custom blockly field implementations for specialized blocks:
  - The `play` block opens a sound library explorer.
  - The `play drums` block opens a drum pattern editor, and has a custom rendering of the drum pattern in the block itself.
  - The `play notes` block opens a note editor, and has a custom rendering of the note pattern in the block itself.
  - The `play tune` block opens a "piano roll" editor, and has a custom rendering of the note events.

## Use of **Lab2**

**Music Lab** is also the first lab to use the new [Lab2](../lab2/) framework, and showcases some features and components unique to that framework, when used in a level progression:

- A very simple layout manager that determines all panel sizes automatically, so that the student doesn't have to do any panel management.
- A new instructions and feedback component.
  - Vastly simpler than the legacy instructions, and avoids some of their [architectural challenges](https://github.com/code-dot-org/code-dot-org/pull/46325).
  - Uses the new **Lab2** validation system to check current execution against a set of conditions to determine which feedback to display, and whether the level has been completed successfully.
  - Text in instructions and feedback can be set up to display a callout arrow when clicked, allowing the text to refer to on-screen elements. Details in https://github.com/code-dot-org/code-dot-org/pull/55755.
- When switching between **Lab2** levels, such as `music` levels, no page reload is required, reducing server load and improving the user experience.

## User programming model

There was a multi-month effort to find the right programing model for this tool. The following were the major models that we explored:

- The initial prototype used the "advanced" model in which sounds were played at explicit locations, and we exposed variables to let the user manage where these sounds were placed. https://github.com/code-dot-org/code-dot-org/pull/47808
- The "simple" model was introduced, and featured an implicit "current measure". The code could `play` one or more sounds at the current measure before moving to the next measure and doing the same. https://github.com/code-dot-org/code-dot-org/pull/49220
- The "tracks" model was a major breakthrough. It introduced multiple parallel tracks in the form of individual parent blocks, and then each track had `play` blocks that would sequence sounds sequentially. In particular, it was clear that having `play` blocks add sounds sequentially was a very natural default. https://github.com/code-dot-org/code-dot-org/pull/49656
- The "simple2" model took all of our good ideas and synthesized them into a combination. It featured a default of playing sounds sequentially; implicit support of the "tracks" model if there was no "when run" block; it added "play together" and "play sequential" blocks which were fully composable (no pun intended); and it allowed songs to be factored using functions. We have since settled on this as the model for **Music Lab**. https://github.com/code-dot-org/code-dot-org/pull/49978
  - We later added `play random` support to this model, allowing for a random child of the block to be chosen at runtime. The children can be any other block type in the model, and this block can be a child of any other in the model, maintaining the philosophy of full composability of block types. https://github.com/code-dot-org/code-dot-org/pull/50459

For a long time, the code supported running in any of these models, so that we could switch between them until we settled on one.

## UI variant shortcuts

There were some open questions around UI such as:

- Should instructions be across the top, or a narrow column on the left, or a narrow column on the right?
- Should the timeline be at the top, or at the bottom?
- Should each panel have a header with a title?

We built keyboard shortcuts to cycle through the various possibilities, and it proved invaluable. After using the app for a while and playing with these variants, we settled on the options that felt the best. It was a great way to solve the open questions through regular usage, and saved on abstract debates.

## URL parameter menu

We added a variety of internal URL parameters to also assist in development, and built a small page at https://studio.code.org/musiclab/menu to generate the correct URL.

## Compilation, Execution, and Playback

When a user edits their code or runs the project, Blockly blocks are compiled to JavaScript and, if any changes are detected, immediately executed. This is handled by the [MusicBlocklyWorkspace](./blockly/MusicBlocklyWorkspace.ts) component.

During execution, the execution runtime is provided a [Sequencer](./player/sequencer/Sequencer.ts) whose functions are called by the generator functions of each block ([example](./blockly/blocks/simple2.js#L90)). The Sequencer encapsulates all sequencing logic and there are a few different implementations for the different programming models supported (the [Simple2Sequencer](./player/sequencer/Simple2Sequencer.ts) being the primary one, corresponding to the "simple2" model). As a result of these function calls, the Sequencer assembles a list of [PlaybackEvents](./player/interfaces/PlaybackEvent.ts) based on the contents of each block, representing the full set of events in the song.

When playback starts, the list of PlaybackEvents is handed to the [MusicPlayer](./player/MusicPlayer.ts) which handles all playback related functions. Internally, the MusicPlayer delegates to either a [ToneJSPlayer](./player/ToneJSPlayer.ts) which uses the ToneJS library, or a [SamplePlayer](./player/SamplePlayer.ts) which uses Web Audio APIs directly. The SamplePlayer code was used initially, while the ToneJSPlayer code was added more recently when more advanced functionality was required (such as pitch shifting and time stretching). Both player implementations are abstracted behind an [AudioPlayer](./player/types.ts) interface.

### Handling Updates Mid-Playback

Music Lab supports live updates during playback. When code changes are detected, code is recompiled and executed in the same manner as above. The new list of PlaybackEvents is handed to the player, along with a flag that indicates to the player that it should replace its current set of events with this new set. The player cancels all pending events, and requeues the new set of events. Depending on the specific player implementation, the user hears the updates almost immediately or when the next sound starts.

### Triggered Events

During compilation, code attached to trigger blocks is also compiled. When the trigger is pressed, the trigger's pre-compiled code is executed with a reset Sequencer, which assembles the list of PlaybackEvents for the trigger code specifically. These events are then passed to the player which schedules them alongside the already ongoing events. If code in a trigger block is changed mid-playback, the events will be recompiled and executed as above, and rescheduled from the time the trigger had been pressed.

### Event Types

The contents of a user's project are represented as various types corresponding to the application layer where they are being handled.

- [PlaybackEvents](./player/interfaces/PlaybackEvent.ts) represent single items in the timeline. These are used by both UI components and high-level player components like the [Sequencer](./player/sequencer/Sequencer.ts) and [MusicPlayer](./player/MusicPlayer.ts). The playback time for a PlaybackEvent is 1-based, corresponding the number of measures where it starts (ex. 1.5 refers to half a measure after measure 1, or measure 1 beat 3). There are a few different types:

  - [SoundEvents](./player/interfaces/SoundEvent.ts) represent a sound generated by the "play sound" block.
  - [ChordEvents](./player/interfaces/ChordEvent.ts) represent a chord/set of notes generated by the "play notes" block.
  - [PatternEvents](./player/interfaces/PatternEvent.ts) represent a drum pattern generated by the "play drums" block.

- [SampleEvents](./player/types.ts#L100) represent a single event to be played by either of the internal player implementations, and therefore used in the [AudioPlayer](./player/types.ts#L8) interface. The MusicPlayer converts PlaybackEvents to SampleEvents. The playback time for a SampleEvent is also 1-based, corresponding to the number of measures.
  - The [ToneJSPlayer](./player/ToneJSPlayer.ts) internally converts the the playback time to a "transport time" used by ToneJS APIs. This is similar, but instead expressed as a string in the format "bars:beats:sixteenths" and 0-based. For example, a playback time of 1.5 would be transport time of "0:2:0".
  - The [SamplePlayer](./player/SamplePlayer.ts) internally converts the playback time to a millisecond offset time from the play start time. This offset time is based on the project's BPM.
- [SamplerSequences](./player/types.ts#L122) similarly represent a set of notes to be played by a sampler instrument. Currently, only the ToneJSPlayer supports playing SamplerSequences (this is indicated by the [supportsSamplers()](./player/types.ts#L10) function on the AudioPlayer interface).

## View Components

- [MusicView](./views/MusicView.jsx) is the entrypoint into Music Lab, and is the top-level container view that is rendered by the Lab2 framework. MusicView handles orchestrating a lot of the overarching app logic, such as connecting UI events to player APIs and loading the music library.
- MusicView renders [MusicLabView](./views/MusicLabView.tsx) which actually renders most of the UI. MusicLabView was created primarly to reduce the size of the MusicView file and convert more of the UI code into functional React/TypeScript (as MusicView is currently class-based and JavaScript). Most other view components are rendered by MusicLabView.
- There are a few view components rendered by custom Blockly fields. These include:
  - [SoundsPanel](./views/SoundsPanel.tsx) and [SoundsPanel2](./views/SoundsPanel2.tsx) which represent sound picker UI (the latter is an updated variant).
  - [ChordPanel](./views/ChordPanel.tsx) which represents the "play notes" keyboard/chord selection UI.
  - [PatternPanel](./views/PatternPanel.tsx) which represents the "play drums" grid drum editor.
