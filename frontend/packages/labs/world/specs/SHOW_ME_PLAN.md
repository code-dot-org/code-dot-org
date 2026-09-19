# Plan: "Show me" and the ring (CALLOUTS.md, options A and B)

STATUS: BUILT, pending a look in the browser. The two options of
specs/CALLOUTS.md chosen to build. The working record, as before.

## What is being built

- **Named places.** A small registry: a name for a place on the screen
  (`map.enhance`, `view.world`, `toolbox.block:world_print`), the words
  that say where it is, and what has to be done to get it on screen. A
  name may carry an argument after a colon: `map.enhance:Ground` is
  Enhance with a Ground selected.
- **Show me.** In a lesson's instructions, a link whose address is
  `#clickable=map.enhance:Hero` is a button in the text, which the markdown
  renderer already makes (`@code-dot-org/markdown`, `clickableText`). Pressing
  it reveals the place, rings it, scrolls it into view, moves focus to it, and
  says where it is in a `status` region.
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

- `dd82583faa7` — this plan, and CALLOUTS.md decided in part.
- `24d7e04626f` — named places, `pointAt`, the ring's style, the announcer.
- `44b37983f67` — the handler through `InfoPanel`; the places marked in the
  world editor and the map editor; the view and selection reveals, and the
  refusal while a script is open.
- `5665ef6bd6e` — Blockly's own focus for a block or a drawer.
- `d8cb1a8751e` — the three lessons' links, and the tests that pin them.

## Learned while building

- **The shared change was one prop, and needed a build.** The base
  `ResourcePanel` already took `onInstructionsTextClick` and spread it into
  `Instructions`; only codebridge's `InfoPanel` dropped it. World Lab reads
  codebridge from its built `dist`, so the prop does not typecheck here
  until codebridge is built (`yarn build` in `labs/codebridge`).
- **A name survives the renderer as written.** `map.enhance:Ground` and
  `toolbox.block:world_on_Gravity_StopsFallingEvent` go through the link
  parser and the sanitizer untouched. A test renders real lessons through
  the real `Markdown` and presses the links, by mouse and by Enter, rather
  than taking that on trust. A name with a space would arrive
  percent-encoded, and `pointAt` decodes.
- **Two owners can answer one kind of reveal, in turn.** A selection is the
  stage's to make and the map editor's to refuse while a script is open.
  They never both exist: the stage is unmounted by the script view. React
  runs every cleanup of a commit before any new effect, so the hand-over
  leaves no gap and no stale answer.
- **A reveal keeps what the learner chose.** Asked for a Hero with the
  second Hero selected, the stage keeps the second. It selects only when
  what is selected does not answer to the name.
- **The registry is also a check on the lessons.** Every name a lesson uses
  must be a place, every kind it names must be declared by that lesson's
  own project, and every block it points at must be in that lesson's
  toolbox. That is the pilot's recorded gap, "nothing pins a lesson's words
  to the editor's labels", closed for what a lesson POINTS at. The label
  text itself is still typed twice.
- **Focusing a flyout block from outside Blockly does not scroll to it.**
  Seen in the browser on the first try: `when ⟨this actor⟩ stops falling`
  was focused, at the bottom of the Gravity drawer, out of sight. Blockly
  scrolls a block into view as it takes focus, but only when focus came
  from another Blockly node (`BlockSvg.onNodeFocus` checks for a node
  focused before it). A link in the instructions is not one. The reveal now
  makes the same call Blockly does, `scrollBoundsIntoView` on the flyout's
  workspace, after queued renders have finished, since a block not yet laid
  out is at the origin. The stand-in tests could pin which block is focused
  and never that it could be seen.
- **My own rule for the words was too strict.** "No here, this, above or
  below" refused "above the editor". A spatial word is fine when it names
  what it is relative to; what is refused is a word that needs a finger.

## Not built, and known

- **The Blockly half is half seen.** In the browser, Show me on a block
  opens the drawer and the block takes Blockly's focus; what a screen reader
  then reads has not been heard. See "Learned" for what the browser showed
  that the stand-ins could not.
- **A target in another tab is not revealed.** A place in `hero.actor`'s
  workspace while `main.world` is in front, or on the map while an actor's
  file is, has nobody to answer for it. The words are said and nothing is
  ringed. A reveal of a FILE is the missing kind.
- **The ring is an outline on the target**, so a target inside a container
  that clips its overflow would lose part of it. None of the places marked
  is, that was seen.
- **A label is still typed twice**: `Enhance Hero…` in the lesson and in
  the button. The registry could own the words; it does not yet.
- Options C to F of CALLOUTS.md, by decision.

## What to look at in the browser

In `origin/first-world`, the dotted-underlined words should be pressable.
`Hero` should ring the Hero tile in the strip; `Open Hero` should select a
Hero on the map and ring the button in its properties; `World` and `Map`
should ring the tabs. The ring should pulse gently, stop pulsing with
reduced motion set, and go when the ringed thing is clicked or Escape is
pressed. Focus should land on the ringed thing: Tab from there should go
on from it.

In `motion/gravity`, `Enhance Ground…` should select the Ground, not the
Hero. With `hero.actor` in front, `when ⟨this actor⟩ stops falling` should
open the Gravity drawer and put Blockly's focus on that block.

With a placement's Script open, pressing a Show me for something on the map
should change nothing on screen.

With a screen reader on, pressing any Show me should read where the thing
is ("Enhance is in the properties of Hero, under its name."), and the same
again when pressed again.
