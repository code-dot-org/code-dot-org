# Plan: "Show me" and the ring (CALLOUTS.md, options A and B)

STATUS: IN PROGRESS. The two options of specs/CALLOUTS.md chosen to build.
The working record, as before.

## What is being built

- **Named places.** A small registry: a name for a place on the screen
  (`map.enhance`, `view.world`, `toolbox.block:world_print`), the words
  that say where it is, and what has to be done to get it on screen. A
  name may carry an argument after a colon: `map.enhance:Ground` is
  Enhance with a Ground selected.
- **Show me.** In a lesson's instructions, a link whose address is
  `#clickable=map.enhance:Hero` is a button in the text, which the markdown
  renderer already makes (`@code-dot-org/markdown`, `clickableText`). Pressing it reveals the place, rings it, scrolls it
  into view, moves focus to it, and says where it is in a `status` region.
- **The ring.** One at a time. An outline set by an attribute on the
  target, so there is nothing to position. It goes when the target is
  used, when something else is pointed at, and on Escape.
- **The pilot's three lessons use it**, and a test asserts that every
  clickable name in every lesson is one the registry knows.

## Decisions taken before building

- **Revealing is asked of whoever owns the state**, through a seam, as the
  lab's other cross-component asks are (`blockly/libraryImport`). The world
  editor answers for its two views, the map's stage for a selection, the
  Blockly editor for its toolbox. Nobody answering is ordinary: the target
  may already be there, and if it is not, the words are still said.
- **A reveal never leaves a script a learner has open.** The map's script
  view answers no reveal. Show me then says where the thing is and rings
  nothing.
- **A block is pointed at with Blockly's own cursor.** The toolbox selects
  the drawer that holds the block, and the focus manager focuses the block
  in the flyout, which draws Blockly's focus ring and is what a screen
  reader follows (`accessibility/blockly.md`). No second ring is drawn on
  SVG.
- **The words are the registry's.** What is announced is a sentence that
  stands without the picture: "Enhance is in the selected thing's
  properties, under its name."
- **In the progression dialog the links are plain text.** A lesson's
  instructions are also shown there, in a modal, over a lab that is not
  the lesson's. No handler is passed, and the renderer then draws bold.
- **One shared change.** Codebridge's `InfoPanel` gains one optional prop,
  passed to the base `ResourcePanel`, which already takes it.

## Order of work

1. The registry, `pointAt`, the ring's style, the announcer. Tests.
2. The handler through `InfoPanel`; the places marked in the world editor
   and the map editor; the reveal seams answered. Tests.
3. The Blockly toolbox reveal.
4. The three lessons' links, and the test that pins them to the registry.
5. Specs.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
