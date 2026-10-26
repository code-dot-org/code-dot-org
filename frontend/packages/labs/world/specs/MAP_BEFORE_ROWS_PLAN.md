# Plan: the main map loads before the rows (CANVAS_FIRST.md, step 1)

STATUS: BUILT, pending a look in the browser. The first build step of
specs/CANVAS_FIRST.md. The working record, as the MAP_FIRST.md plans were.

## The problem

A world's module is, in order: the world, its rules, animations, maps and
layers; then the ROWS under `define world`; then the MAIN MAP; then the
world's hats (specs/MAIN_MAP_PLAN.md). So a row cannot name a placement. A
camera told to follow `any ⟨Hero⟩` under `define world` finds no Hero, since
the Hero is on a map that has not been loaded. `place/layers` kept its Hero
an `add actor` row to get round it (specs/CURRICULUM_PLAN.md).

With the first lessons on the canvas, every lesson's actors are placements
and every row that names one hits this.

## What is being built

- **The main map is loaded after the world's prologue and before its
  rows.** The prologue is everything that has to precede the first
  placement: rules, animations, registered maps, image sizes, layers. The
  rows then run in a world that holds what the map placed.
- **What the rows place draws over what the map placed**, where it was the
  other way round. A Hero added by a block stands in front of a floor
  painted on the map, which is what thirty-five lessons want and did not
  have.
- **`place/layers`' Hero moves onto the map**, as the proof: the camera
  under `define world` follows a placement.

## Decisions taken before building

- **A row that must precede the first placement is hoisted, not refused.**
  `use rule` under `define world` throws once an actor exists
  (`WorldBuilder.requireNoActors`). A world does not need the row, since it
  runs every rule the project holds, but a world may still have one. The
  world block lifts such rows into its prologue, as it already lifts
  `define layer`. `use animations` has no row of its own, and layers are
  hoisted already.
- **The map's own size still yields to `set map size`.** Loading grows the
  root to fit the map; a `set map size` row afterwards sets it outright, as
  it did when the order was the other way.
- **Not changed**: a `.map` loaded by a `load map` row is a row, and loads
  where the row is.

## Order of work

1. The generator: the main map emitted by the world block between its
   prologue and its body; `use rule` rows hoisted. Tests.
2. `place/layers`: the Hero on the map.
3. Specs: MAIN_MAP_PLAN.md's order, CURRICULUM_PLAN.md's known gap,
   CANVAS_FIRST.md's step.

## Commits

- `b7288e49725` — this plan.
- `cc13038151d` — the world block loads the main map between its prologue
  and its body; `use rule` rows lifted into the prologue; `place/layers`'
  Hero on the map, and the test that the camera follows it; the older specs
  corrected.

## Learned while building

- **The main map's code was already made before the world block ran.** The
  generator compiles the map first, since its placements' workspaces are
  loaded into the same headless workspace the world's blocks then replace.
  So handing the code to the world block was one more field on the
  generator, beside the map's layers, and `assembleWorldModule` lost a
  parameter.
- **Nothing that loads a main map depended on the old order.** Thirty-five
  lessons paint a floor on the map and add a Hero by block; the starter and
  Breakout hold their levels there. Every one passed unchanged. The one
  visible difference is the one wanted: the Hero is drawn over the floor.
- **MAIN_MAP_PLAN.md had argued the other order**, for a readout over a
  level: the level from a `load map` row, the readout on the main map,
  drawn last. That case is a Viewport now (the level inside it, the readout
  beside it), and a `load map` in a HANDLER still lands on top, since it
  runs after everything: Breakout's pause menu is that, and is unchanged.
- **A test that matches text in a module has to know what else says it.**
  The ordering test looked for `world.pause();` after the load, and found
  the one inside a placement's script, which is part of the map's code and
  so before it. The world's row in that test is `resume` now.
- **`setInput` wants the driver's key names**, which are not the
  browser's. A test that held `ArrowRight` by hand moved nobody and blamed
  the camera. `playCheck` translates; a test about a lesson should drive
  it the way its check does.

## Not built, and known

- A `load map` ROW under `define world`, in a world that also has a main
  map, now draws over the main map where it drew under it. No fixture or
  lesson has both. A readout wants a layer in front, or the level in a
  Viewport.
- A row still cannot name what a VIEWPORT's map placed by a block about a
  kind and expect it to be alone: the Viewport's level is in the world by
  then too (`loadMap` shows held maps as it loads), so `any ⟨Coin⟩` is
  every Coin in every space.

## What to look at in the browser

`place/layers`: walk right, and the view should follow the Hero as it did
when the Hero was a block. Any lesson with a painted floor and a Hero added
by a block: the Hero should stand in front of the tiles. The starter
project and Breakout should run as they did, and Breakout's pause menu
should still come up over the game.
