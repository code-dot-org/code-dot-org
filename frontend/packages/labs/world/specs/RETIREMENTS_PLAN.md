# Plan: the retirements (MAP_FIRST.md, step 5)

STATUS: IN PROGRESS. The fifth build step of specs/MAP_FIRST.md: what the
first four steps made unnecessary comes out, and the content that still
leans on it moves onto what replaced it. The working record, as before.

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
  real game run inside a space, which is worth having under test.
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
3. Breakout in a Viewport; `clear world` off the palette.
4. The starter project's level in its main map.
5. Specs.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
