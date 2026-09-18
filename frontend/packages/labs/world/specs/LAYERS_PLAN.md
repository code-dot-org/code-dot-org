# Plan: layers in the editor (MAP_FIRST.md, step 4)

STATUS: IN PROGRESS. The fourth build step of specs/MAP_FIRST.md, after
specs/MAP_SCRIPTS_PLAN.md, specs/MAIN_MAP_PLAN.md and specs/VIEWPORT_PLAN.md:
a map's layers, backgrounds and foregrounds are part of the map, made in the
map editor. The working record, as before.

## What is being built

- **Layers in the map document.** A map — a `.map`, or a world's `map` —
  gains `layers`, back to front, each with a name, a parallax factor, whether
  it is fixed to the screen, and a background and a foreground slot (an
  image, stretched or tiled, and an offset). A placement gains a `layer`. A
  map that says nothing has the one layer every world has, `main`.
- **The layer strip.** A panel on the stage listing the map's layers, front
  at the top: select, add, remove, move up and down. New placements land on
  the selected layer. With a layer selected and no placement, the inspector
  is the layer's: its name, its factor, fixed or not, and its two slots,
  with the project's backgrounds offered for each. A placement's inspector
  gains a Layer dropdown.
- **The canvas draws them.** Each layer's background, then its placements,
  then its foreground, back to front — a stretched image over the map's
  rectangle, a tiled one repeated across it.
- **The main map's layers are the world's.** The world module declares them
  with the ones `define layer` blocks declare, and sets their slots, so what
  the editor shows is what the game draws with no block written.
- **A Viewport's map brings its layers.** A space has a layer list of its
  own, built from the map loaded into it; the driver draws each as a
  container inside the space, shifted for its factor, with its slots placed
  by the same arithmetic the world's are.

## Decisions taken before building

- **Where a map's layers take effect, and where they cannot.** The world's
  layer list is fixed when the world is built — nothing can be spliced into
  a live scene graph, and the reconciler treats the list as structure — so:
  the MAIN map's layers are hoisted into the world's declaration by the
  generator, which knows them because the main map is in the world's file;
  a map loaded into a VIEWPORT gets them as the space's own, which the
  driver is free to build since a space's containers are its own; and a map
  loaded into the root by `load map` while the game runs does not define
  layers at all — its placements' `layer` ids resolve against the world's
  layers, and one that names none lands where the block says, as today.
- **A layer's id is the document's, its name is the learner's.** Ids are
  minted `layer1`, `layer2`, … and never change, so a placement's `layer`
  and a block's reference survive a rename; `main` is the default's id and
  cannot be removed, since an actor with no layer is on it.
- **Map layers first, then the blocks'.** The world's list is the main
  map's layers in their order, then any `define layer` block's layer the map
  did not already name. A world that uses both gets the blocks' layers in
  front, which is where an interface declared in blocks wants to be.
- **The same placement arithmetic in a space.** A space is drawn through a
  Phaser camera that scrolls; the world's layers are drawn by shifting
  containers under a camera that does not. A space's layer at factor `f` is
  given `offset × (1 − f)`, which under a camera scrolled by `offset` nets
  the `−offset × f` the world's gets — so a slot inside it is placed by
  `stretchedPlacement` and `tiledPlacement` unchanged.
- **Blocks keep the run-time half.** `define layer`, `this layer moves …`
  and the slot blocks stay, for the world's layers and for what changes
  while the game runs. A block naming a layer OF A MAP
  (`layer ⟨…⟩ of this map`, MAP_FIRST.md) is not in this step.
- **Not in this step**: the look-through mode that pans the editor's
  camera to show parallax; per-layer effects in a space; layer reordering
  by drag.

## Order of work

1. Model and engine: `layers` and a placement's `layer` in the document and
   in `WorldMap`; per-entry layers in a load; a space's own layer list; the
   frame's depth within a space; `spaceSnapshot` carrying layers and slots.
2. Generator: the main map's layers hoisted into the world's declaration
   with their slots set.
3. Driver: layer containers and slots inside a space.
4. Editor: the strip, the layer's inspector, the placement's Layer
   dropdown, new placements on the selected layer, the canvas drawing
   layers and their slots in order.
5. Specs.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
