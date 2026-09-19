# Plan: Look onto the map (CANVAS_FIRST.md, step 4)

STATUS: BUILT, pending a look in the browser. The third region of
specs/CANVAS_FIRST.md's step 4, after Input and Motion
(specs/INPUT_MOTION_PLAN.md). The working record, as before.

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

- `863d9eeae0d` — this plan.
- (next) — the import row on a layer's slots; `look/background` on the map
  and `look/sprite`'s last step; the tiles' grants; the specs.

## Learned while building

- **A backdrop could be chosen and never brought in.** The map editor has
  offered a layer's background since layers were built, from the project's
  backgrounds folder, with no way to add to it. It went unnoticed because
  nothing had needed a backdrop the project lacked — a lesson ships its
  sprites, and a backdrop is the one appearance it cannot ship.
- **Two of the region's three rows in CANVAS_FIRST.md were wrong**, and in
  the same way as Input's: they named an affordance by what it ought to do
  rather than by what it does. The Creator's picture step chooses among the
  PROJECT's pictures, so it cannot be where a learner imports one; and
  nothing on the map picks an animation. `look/sprite` half moves and
  `look/animation` does not move.
- **`look/sprite` had no tile to grant the Creator.** The step that proves
  a picture belongs to the project — making a second kind and being offered
  the same file — is also the only lesson that wants `New actor…`, so the
  affordance and the lesson found each other.
- **A lesson lends an affordance as it lends a block.** `look/background`
  is not entered through Place, so the Layers list is not its to grant; it
  offers `map-layers` the way it already offers the vector block.

## Not built, and known

- A world's background COLOUR has no control on the map, so the lesson's
  starting state is still a block. It belongs with the world's own
  properties, which is the world inspector's question.
- The import row is on both slots, so a foreground can be brought in the
  same way; no lesson uses a foreground yet.
- `look/animation` and `look/drawing` and `look/effect` stay in the
  workspace.

## What to look at in the browser

`look/background`: the Layers list should be there with one layer, `main`;
its Background dropdown should end in `(import…)`, which should open the
backdrop library and, on choosing one, set it — stretched at first. Ticking
Tiled and putting 40 in Slide X should be visible in the preview without a
run. `look/sprite`: after importing the Hero's picture, `New actor…` should
offer that picture in its picture step.
