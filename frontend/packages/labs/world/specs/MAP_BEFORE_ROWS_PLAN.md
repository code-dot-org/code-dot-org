# Plan: the main map loads before the rows (CANVAS_FIRST.md, step 1)

STATUS: IN PROGRESS. The first build step of specs/CANVAS_FIRST.md. The
working record, as the MAP_FIRST.md plans were.

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

(recorded as they land)

## Learned while building

(recorded as it happens)
