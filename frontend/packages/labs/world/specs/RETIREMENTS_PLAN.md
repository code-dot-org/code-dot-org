# Plan: the retirements (MAP_FIRST.md, step 5)

STATUS: BUILT, pending a look in the browser. The fifth build step of
specs/MAP_FIRST.md: what the first four steps made unnecessary comes out,
and the content that still leans on it moves onto what replaced it. The
working record, as before.

MAP_FIRST.md lists five things: the Pause Menu actor, `create actor in map`,
the global name registry, `clear world`, and the `fit` layer flag. The first
and third went in step 1. This step takes the second and fourth, moves the
starter project onto its main map, gives a level's camera-follow the home
step 3 left it without, and says why the fifth stays.

## What is being done

- **`create actor in map` is deleted.** The block stored one kind's
  placements in the world's file because an arrangement only one world reads
  belongs there (MAPS.md §1). The main map is that decision for the whole
  arrangement, so the block, its grid field, its popup and the pictures
  asked for on its behalf all go. NO MIGRATION: nothing has shipped, so no
  file exists that holds one, and code that reads a shape nobody wrote is
  code to delete later.
- **The lesson built on it moves with it.** `place/map`, "A room drawn, not
  typed", teaches that a level is data by handing over a block that holds
  three tiles. It hands over a main map that holds three tiles instead, and
  its check counts the map's placements rather than the block's.
- **A level says what its camera follows, in the editor.** Step 3 reads a
  map's `camera.follows` when it is loaded into a Viewport and gave the
  editor no way to set it. A `.map` gains an inspector with nothing
  selected, as a world has: what the camera follows, from the map's own
  placements.
- **Breakout's level moves into a Viewport, and `clear world` is deleted.**
  Breakout is the one fixture that clears the world, to start a level over
  under a pause menu. With the level in a Viewport, starting over is
  `load map ⟨level⟩ into ⟨…⟩` and the menu is untouched. It is also the first
  real game run inside a space, which is worth having under test. The
  block's one other user is the lesson `adventure/rooms`, whose door was
  `clear world` then `load map`: its rooms move into a Viewport too, and
  the door is one block. The engine's `clearActors`, which only the block
  called, goes with it.
- **The starter project's level is its main map.** A new project opens on
  the map editor; it should open on its level, not on an empty canvas with a
  `load map` row behind it.

## What is deliberately not done

- **The `fit` layer flag stays.** MAP_FIRST.md says it retires "and not
  first": it exists so a score on a scrolling world stays put, and it stays
  while the main map keeps its implicit camera for the simple case. Tapper's
  scoreboard and the scoreboard enhancement use it. It goes when the Viewport
  is what lessons teach for an interface, which is step 6's to decide.
- **The world's camera-follow blocks stay.** They are a stock rule's
  property setters (`Camera Follow`), not a block of the lab's own, and they
  are how the WORLD's camera is steered — Flappy and a lesson use them.
  What MAP_FIRST.md wanted was a home for a LEVEL's follow, which is the
  inspector above.

## Order of work

1. `create actor in map`: the block deleted with what only it used; the
   lessons that placed tiles with it placing into their main maps; the
   lesson built on it, and its check, moved.
2. A map's inspector with nothing selected: what the camera follows.
3. Breakout and the two-rooms lesson in Viewports; `clear world` deleted,
   and `clearActors` with it.
4. The starter project's level in its main map.
5. Specs.

## Commits

- `c4a8a71edd9` — this plan.
- `0fb89899c3a` — `create actor in map` deleted with its field, grid,
  popup and picture requests; 35 lesson worlds placing into their main maps;
  `place/map` and its check moved.
- `7710ba42a67` — a level's inspector with nothing selected: what the camera
  follows. The editor's parse keeps a map's `camera`.
- `2f4f8906672` — driver: what the root holds in front of a Viewport is
  drawn in front of it, by a camera per band.
- `eaba70e2864` — Breakout and `adventure/rooms` in Viewports; `clear world` and
  `clearActors` deleted; a load by path writes the Viewport's `map`
  property; a main map's Viewports hold their maps from the load; the stock
  menu's Quit unloads the menu; the starter's level in its main map; specs.

## Learned while building

- **No migration, because nothing has shipped.** The first cut wrote one —
  a pure function over a world's file and an on-open effect in the world
  editor — and kept the block defined so old files would load. Both were
  taken out the same day: no file anywhere holds the old shape, and code
  that reads a shape nobody wrote is code to delete later. The rule for
  this lab until it ships: convert what is in the repository, then delete.
- **The editor was dropping a map's `camera`.** `mapFromRaw` rebuilt a
  document from the keys it knew, and `camera` was not one, so a level that
  said what to follow lost it on the first save from the map editor. Step 3
  read the key in the engine and never opened such a map in the editor. A
  parse that names its keys has to be told of every key; the test now opens
  and saves one.
- **Moving a real game into a space found three defects the unit tests had
  not**, which is what the plan wanted Breakout in a Viewport for.
  1. _Draw order._ A space's camera draws after the main camera, so a pause
     menu in the root was drawn UNDER the level it was loaded over. The root
     is now cut into bands at each Viewport: the main camera draws up to and
     including it, and an `over` camera — the main camera again — draws
     what follows, after the space. A layer's container is seen by every
     band camera and each child by one (`cameraFilter`, which a Phaser 4
     container does consult per child).
  2. _The property fought the block._ `load map ⟨room2⟩ into ⟨…⟩` recorded
     what the space shows and left the Viewport's `map` property naming
     room one; the next tick saw a Viewport not showing what its property
     names and loaded room one back. A load by path now writes the
     property, and an unload clears it. Step 3's tests loaded into
     Viewports whose property was empty.
  3. _A world was handed over without its level._ A Viewport showed its map
     at the end of the first tick, so a built world held one actor, and a
     key pressed in the first frame ran a handler about a Ball that did not
     exist. `loadMap` now shows what the Viewports it placed hold, one
     level deep so a map holding a Viewport onto itself grows a level a
     tick and not a stack.
- **Two draw-order slips surfaced with the bands.** A Viewport's group was
  made before any actor was placed, and a parent's group was appended when
  its first child asked, so both jumped the queue in a layer where list
  order is draw order. Nothing had depended on the order until a band cut
  was made at a Viewport's place in it.
- **Who takes a menu away.** Breakout used to answer Quit with
  `clear world`, which took the menu with the level, so the stock menu's
  Quit only said `quit`. A level restarted inside a Viewport leaves the main
  map alone, and the menu stayed up. Quit now says `quit` and unloads its
  map, as Resume resumes and unloads: a menu that has been answered goes by
  its own hand, and what the answer means is still the world's.
- **A tile that lost its grant, and one that gained one.** `arcade/bricks`
  granted `clear world` and never used it; it grants nothing now and says
  why, as the catalogue's test asks. `adventure/rooms` granted nothing,
  being two borrowed blocks; it grants the Viewport and its blocks, which
  moved there from `story/choice`, where step 3 had parked them.

## Not built, and known

- A Viewport's children are drawn under what it holds, with its face: the
  band cut is made at the top-level object. A frame drawn around a level
  wants to be a sibling placed after the Viewport, not its child.
- World-wide effects are the main camera's, so they do not reach a space,
  nor what is drawn over one.
- A click over a Viewport reaches both the root's actor there and the
  level's beneath it; the draw order says which is in front and the mouse
  rule does not ask. Under a pause nothing in the level answers, which is
  why the menu works.
- The `fit` layer flag and the Camera Follow rule's blocks, as said above.
- The starter keeps an empty `maps` folder: the first `.map` a learner
  makes is a menu or a level for a Viewport, and has somewhere to go.

## What to look at in the browser

Breakout: the level should draw as before, inside a dark window the size of
the screen. P should bring the menu up OVER the bricks and ball, not under
them; Resume should take it away; Quit should take it away and put every
brick back with the ball at rest. In the two-rooms lesson, walking into the
Door should show room two with the Player at its doorway. Open any `.map`
with nothing selected: the inspector should offer `Camera follows`, and a
Viewport holding that map should keep the chosen placement in view. A new
project should open on the map canvas with the platformer's level on it,
and run as it did.
