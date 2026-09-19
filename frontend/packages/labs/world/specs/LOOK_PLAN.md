# Plan: Look onto the map (CANVAS_FIRST.md, step 4)

STATUS: IN PROGRESS. The third region of specs/CANVAS_FIRST.md's step 4,
after Input and Motion (specs/INPUT_MOTION_PLAN.md). The working record, as
before.

## What moves, and how far

- **`look/background`, map.** Its four steps are the layer inspector's four
  controls: a picture behind everything, stretched, then tiled, then slid.
  That is what a layer's background IS (specs/LAYERS_PLAN.md), and the
  lesson has been saying it in blocks written for a world that had no
  layers. The blocks stay granted, for what changes while the game runs.
- **`look/sprite`, map for one step.** The lesson is about a picture being
  a FILE, and the file browser is its subject; the import and the painting
  stay where they are. What the map adds is the proof: after the picture is
  the Hero's, `New actor…` offers it in the new kind's picture step, which
  is the same picture in a place the Hero has nothing to do with. The tile
  grants `map-new-actor`, which no tile granted
  (specs/KINDS_FROM_THE_MAP_PLAN.md).
- **`look/animation` stays in the workspace.** CANVAS_FIRST.md's table said
  "pick the animation; playing it on a walk is a handler". Neither half is
  true: playing one is a ROW in the actor's file, not a handler, and there
  is nowhere on the map to pick an animation — a placement has no field for
  one, and the Creator's picture step chooses for a kind being made, not
  for one that exists. The table is corrected.

## What has to be built first

- **An `(import…)` row on a layer's two slot dropdowns.** The map editor
  can set a layer's background to any backdrop the project holds and has no
  way to bring one in; the block's dropdown has had one all along
  (`blockly/libraryImport`). Without it `look/background` cannot be told on
  the map at all: a backdrop's bytes are SERVED rather than bundled
  (BACKGROUNDS.md §7), so a lesson cannot ship one in its project the way
  it ships a sprite. It asks the same seam every other import asks
  (`appearance/appearanceImport`).

## Decisions taken before building

- **The lesson keeps its background COLOR in blocks.** It is the starting
  state the lesson argues with — "one color behind everything, which is
  what a world draws when nobody has given it a picture" — and the map has
  no control for it. A world's color belongs with the world's properties,
  which is a question for the world inspector and not for this.
- **A layer's slot is the main map's, so it is the world's.** The generator
  hoists a main map's layers into the world's declaration, slots and all
  (`blockly/mainMapLayers`), so what the lesson sets in the inspector is
  what `set background` would have set, and the tile's check does not
  change.

## Order of work

1. The import row on a layer's slots. Tests.
2. `look/background` on the map; `look/sprite`'s fourth step and its grant.
   Tests.
3. Specs: CANVAS_FIRST.md's table, PROGRESSION.md, this record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
