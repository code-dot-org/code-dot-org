# Proposal: the map as the front door

STATUS: PROPOSED. Nothing here is built. It is a design to argue with, written
after the pause menu showed where the current shape strains (UI_ACTORS.md,
"The second axis"; MAPS.md, "A block naming a placement").

The question: what does World Lab look like if a project opens on its MAP
rather than on its world's block workspace? You place actors on a canvas, set
their properties in an inspector, and attach behavior to the things you can
see. The world's workspace becomes the script of that map. Other maps are the
dialogs that appear over it and the levels that are loaded into it.

## Where the lab stands

A project opens on `worlds/main.world`, pinned when there is nothing to browse
(`layout/WorldLayout`). That file is a block stack: `define world`, then
`load map ⟨level1⟩`, then a few `set` rows, then hats about KINDS — `when
⟨any Coin⟩ is collected`. The arrangement itself is a `.map`, a document with
no behavior, opened from the Maps menu or from the `load map` block's field.

Behavior has three homes and none of them is a place:

- an ACTOR file says what a kind always does, everywhere;
- a RULE file says what an elected trait does;
- the WORLD file says what the game does, about kinds and world events.

What no file can say is what THIS coin does, or this switch, or this button.
Every unique thing must become a kind: the first pause menu shipped a Resume
Button and a Quit Button, two files whose whole content was a caption and one
handler. The named-actor block replaced them with a global namespace over
every map in the project, which fixed the two files and introduced a worse
thing: a Player in level one and a Player in level two are the same name, and a
hat about one is about both.

Levels are `clear world` then `load map`, in a handler, which empties the
score readout and the pause menu along with the bricks. Menus are maps loaded
on top, with an actor that presumes the buttons its map places.

INTERFACE.md's "Simple World" paragraph asked for this years early: "just have
the World view with PlatformActors where one can change their appearance only
and add events to the World view per Actor". That is the map editor with a
script drawer.

## The shape

**Every world has a main map, and they are one file.** The `.world` holds the
world's laws (its rules, its own properties), its main ARRANGEMENT (the
placements the map editor edits), and its SCRIPT (the hats). Opening a world
opens the map editor on its main map, with the script in a drawer below the
canvas. There is no separate world workspace to find; the drawer is it.

MAPS.md §1 already decided the half of this that matters: an arrangement only
one world reads belongs in that world's file, not beside it. `create actor in
map` put one kind's placements into the `.world` as a field value for exactly
that reason. The main map is the same decision applied to the whole
arrangement rather than to one block's worth, and it retires that block.

**A `.map` is an arrangement plus a script.** Every other map in the project
keeps its own file and gains the same drawer. A dialog is a map whose first
placement is the parent of the rest; a level is a map with no root. Both are
loaded into a running world, both bring their behavior with them, and both are
edited in the same editor as the main map. There is one editor for "things
arranged in space and what they do", and the world is the one that also has
laws and is the entry point.

**A script is about its own placements.** A hat's subject dropdown lists the
placements of the map it is in, and nothing else. `when ⟨the Switch⟩ is
pressed, open ⟨the Door⟩` names two things in one file. Names are unique
within a map, which the editor already enforces, and mean nothing outside it.
The main map's script may also name kinds — `when ⟨any Coin⟩ is collected` —
and world events, because it is the world's script too. A dialog's script may
say `unload this map` and `emit ⟨quit⟩`, an event the map declares and the
world listens for as it listens for an actor's.

A script compiles to a function that runs once per load, closed over the
actors that load placed. Load the pause menu twice and each Resume closes its
own menu. There is no registry, no global name, and nothing left behind on
unload.

## Levels: loading a map into a container

This is the part that has no precedent in the lab, and the three answers are
not equally good.

**Clear and load, as today.** `clear world; load map ⟨level2⟩`. It works
because Breakout has nothing on screen it wants to keep. A game with a score
readout, a lives display and a pause key loses all three and rebuilds them
from the main map, if it can. It also has no place to stand between levels:
the main map is what was cleared.

**A world per level.** A title screen "is a map you load into a world of its
own" (INTERFACE.md, "User Interfaces"), and a world per level extends that.
It duplicates the laws per level, restarts everything on a switch, and there
is no `go to world` block; there is one entry world. It is the wrong grain for
levels, and possibly the right grain for title-versus-game, which this
proposal leaves alone.

**A slot in the main map.** A placement of a stock kind, `Map Slot`, with one
property: the map it holds. It is an empty parent; the map's actors are placed
as its children (PARENTING.md), positioned in its frame. `load map ⟨level2⟩
into ⟨the Level⟩` replaces what the slot holds; `unload ⟨the Level⟩` empties
it. The main map keeps its readouts and its pause key across every level,
because they were never in the slot.

The slot is the answer because it is an ACTOR. The map editor can place it,
the inspector can set its starting map, a script can name it, and the engine
already knows how to remove a parent and everything under it. It costs
nothing new in the engine beyond a way for `loadMap` to parent what it places
and to remember what a load placed so it can be undone.

Two things the slot must get right:

- **Its frame is the identity.** A slot at the world's origin with no rotation
  or scale changes nothing about the positions in the map it holds, so a level
  authored at world coordinates loads as authored. Rules read positions through
  the parent (PARENTING.md, "Where the derivation lives"), so gravity and
  collision see world space. A slot placed elsewhere offsets its level, which
  is a feature, and a rotated slot rotates its level, which nobody should do
  and nothing prevents.
- **The editor draws what it holds.** A slot with a starting map draws that
  map's placements inside it, dimmed and unselectable, so the main map reads as
  the game rather than as a readout floating over an empty box. Editing the
  level means opening its file, one click from the slot's inspector.

Whether a slot owns a layer is open. A game with a camera wants its level to
scroll and its readouts to stay, which is what layers are for; the simplest
rule is that a map loaded into a slot lands on the slot's layer, and the slot
is placed on the layer its owner wants scrolled.

## What the script drawer needs

The interface question was worked through separately and the answer is
recorded here so the spec is whole. One workspace per map, never one per
placement or per event; the per-actor experience is a VIEW over it.

- **A badge on the canvas** for every placement some hat is about, repeated in
  the inspector. A lighter glyph for a placement a body merely names, so a
  door opened by something else is marked too.
- **An Events section in the inspector**, listing the kind's events with the
  handled ones marked. Choosing one makes a hat with this placement in its
  subject and opens the drawer on it.
- **Filtering** rather than popups: the badge opens the drawer showing the hats
  about that placement, one click from the whole script. Selection on the
  canvas and hats in the drawer highlight each other. A modal would break that
  link.
- **Wires on the canvas**, later: a hat with a one-block body drawn as a line
  from source to target. Sugar over the drawer, not a second store.

The main map's drawer additionally holds what the world workspace holds today:
`use rule` where a project still says it, `define property`, the world's `set`
rows, and hats about kinds and world events. When nothing on the canvas is
selected, the inspector shows the WORLD: its name, its own properties, its
background. That is where `set target score to 30` goes, and it is a field
rather than a block.

## Against the current shape

What the current shape does better:

- **One kind of editor at the front.** A learner meets Blockly and only
  Blockly until they choose to open a map. Map-first puts a canvas, a palette,
  an inspector and a drawer on the first screen. The mitigation is that three
  of those four are already the map editor, which has been built and tested
  (NEXT.md §5), and a lesson about one thing can hide the rest.
- **Everything the world does is readable top to bottom** as one block stack.
  Map-first splits it: the arrangement is a picture, the values are in an
  inspector, the behavior is in the drawer. Reading a world means looking at
  three places. The drawer's filter and badges are what make that bearable.
- **The curriculum is built on it.** Every level pins `main.world`, every tile
  in the catalogue unlocks blocks, and the progression assumes the workspace is
  where a learner's hands are (PROGRESSION.md). Unlocking editor affordances
  (the inspector, the palette, the drawer) is a new kind of tile.
- **Testing.** A block stack is a JSON document a test can compile and run.
  The map editor is a canvas jsdom cannot paint, and its arithmetic lives in
  pure modules for that reason. Moving the front door onto the canvas moves
  more of the first-run experience out of reach of vitest.

What map-first does better:

- **The first act is placing something and seeing it.** Not reading a block
  that loads a file that holds the thing. Every beginner tool that has lasted
  starts from the picture.
- **Values are set where the thing is.** `set target score to 30` is a field
  on the world. A coin's value is a field on the coin. The `set` block still
  exists for the case where a value changes at run time, which is what a
  block is for.
- **Behavior attaches to things you can see.** This switch, this door, this
  button. No kind per unique thing, no global names, no actor that presumes
  its surroundings. It also gives the "Simple World" of INTERFACE.md a home
  without a second mode: a project that never opens an actor file is the
  simple view.
- **Dialogs, levels and the main map are one concept.** A map is an
  arrangement plus a script; the world is the map that also has laws. The
  pause menu becomes one `.map` with a Panel, two Buttons and four hats, and
  nothing on the actor shelf.
- **Hot reload gets better, not worse.** The preview already repaints as a map
  is edited (tier 3, UI_ACTORS.md). A main map edited in place is the same
  path; a world edited as blocks restarts the game.

## What this changes in the files

- `.world`: gains a placements document, stored as a field value on the
  `define world` root the way `create actor in map` stores its own, but for
  mixed kinds. The Blockly serialization remains the file; undo remains
  Blockly's. `create actor in map` is retired; its placements migrate into the
  main map on first open.
- `.map`: gains a `blocks` workspace beside `actors`, serialized as an actor
  file's is, and compiles to a module exporting the arrangement and a script
  function. Map-owned events appear in world hat dropdowns as actor events do.
- The named-actor block becomes the map script's `the ⟨Resume⟩`, scoped to its
  file. `World.named`, `World.actorsNamed`, `ActorBuilder.named` and the
  placement-name registry go.
- `Map Slot` joins the stock actors. `load map … into ⟨slot⟩` and
  `unload ⟨slot⟩` join the world's blocks; `load map` alone keeps meaning the
  world's root, which is what a dialog wants.
- The Pause Menu actor goes. The stock pause menu is a map with a script.

## Order of work

1. **Map scripts.** The drawer, placement-scoped hats, badges and the Events
   section on `.map` files. This stands on its own, replaces the named-actor
   commit, and is what the pause menu needs whatever else happens.
2. **The main map.** Placements on the world root, the editor opening a
   `.world` as a map with the drawer as its workspace, the world inspector on
   empty selection. Migration of `create actor in map`.
3. **The slot.** The stock kind, the two blocks, parented loading and undoable
   loads in the engine, and the dimmed preview of a slot's map in the editor.
4. **Retirements.** The Pause Menu actor, `create actor in map`, the global
   name registry.
5. **Curriculum.** Tiles that unlock editor affordances; levels re-pinned.

Step 1 is worth doing even if the rest is refused. Steps 2 and 3 are the
proposal.

## Open

- **Nested maps.** A map loaded into a slot may itself hold a slot. Nothing
  here forbids it and nothing here needs it. Deferred until a game asks.
- **A map loaded twice.** Two scripts, each about its own placements. A world
  hat about the map's events hears both. That is what two menus should do; it
  is also what two levels in two slots would do, which nobody has asked for.
- **Kinds that exist only in a map.** A switch that appears in one level with
  one behavior is a Button placement with a script today. When the same switch
  appears in six levels, it wants to be a kind, and the move from placement
  with a script to kind with the same script is the "transform" INTERFACE.md's
  Simple World describes. Not designed here.
- **Where `use rule` goes.** Today a project holds a rule by having the file
  (constants.ts, `MAIN_WORLD`). The drawer can show the rule rows if a lesson
  wants them said; the world inspector can list them; either is fine and
  neither is decided.
- **The title screen.** A world of its own, or a map in a slot that the main
  map starts with? The slot answer is cheaper and keeps one entry world; the
  cost is that a title's laws are the game's laws. Left to the first game that
  has a title.
