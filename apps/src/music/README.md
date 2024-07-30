# Music Lab

<img width="1512" alt="Screenshot 2024-02-12 at 10 11 06 AM" src="https://github.com/code-dot-org/code-dot-org/assets/2205926/ab4c80eb-8824-457f-b0e2-cf330b5dbce0">

## Overview

This is the client-side code for **Music Lab**, as instantiated by a `music` level using [Lab2](../lab2/).

**Music Lab** is a powerful lab for creating music using code.  It includes the following features:
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
  - Text in instructions and feedback can be set up to display a callout arrow when clicked, allowing the text to refer to on-screen elements.  Details in https://github.com/code-dot-org/code-dot-org/pull/55755.
- When switching between **Lab2** levels, such as `music` levels, no page reload is required, reducing server load and improving the user experience.

## User programming model

There was a multi-month effort to find the right programing model for this tool.  The following were the major models that we explored:

- The initial prototype used the "advanced" model in which sounds were played at explicit locations, and we exposed variables to let the user manage where these sounds were placed.  https://github.com/code-dot-org/code-dot-org/pull/47808
- The "simple" model was introduced, and featured an implicit "current measure".  The code could `play` one or more sounds at the current measure before moving to the next measure and doing the same.  https://github.com/code-dot-org/code-dot-org/pull/49220
- The "tracks" model was a major breakthrough.  It introduced multiple parallel tracks in the form of individual parent blocks, and then each track had `play` blocks that would sequence sounds sequentially.  In particular, it was clear that having `play` blocks add sounds sequentially was a very natural default.  https://github.com/code-dot-org/code-dot-org/pull/49656
- The "simple2" model took all of our good ideas and synthesized them into a combination.  It featured a default of playing sounds sequentially; implicit support of the "tracks" model if there was no "when run" block; it added "play together" and "play sequential" blocks which were fully composable (no pun intended); and it allowed songs to be factored using functions.  We have since settled on this as the model for **Music Lab**.  https://github.com/code-dot-org/code-dot-org/pull/49978
  - We later added `play random` support to this model, allowing for a random child of the block to be chosen at runtime.  The children can be any other block type in the model, and this block can be a child of any other in the model, maintaining the philosophy of full composability of block types.  https://github.com/code-dot-org/code-dot-org/pull/50459

For a long time, the code supported running in any of these models, so that we could switch between them until we settled on one.

## UI variant shortcuts

There were some open questions around UI such as:
- Should instructions be across the top, or a narrow column on the left, or a narrow column on the right?
- Should the timeline be at the top, or at the bottom?
- Should each panel have a header with a title?

We built keyboard shortcuts to cycle through the various possibilities, and it proved invaluable.  After using the app for a while and playing with these variants, we settled on the options that felt the best.  It was a great way to solve the open questions through regular usage, and saved on abstract debates.

## URL parameter menu

We added a variety of internal URL parameters to also assist in development, and built a small page at https://studio.code.org/musiclab/menu to generate the correct URL.
