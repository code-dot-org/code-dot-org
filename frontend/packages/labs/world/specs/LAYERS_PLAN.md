# Plan: layers in the editor (MAP_FIRST.md, step 4)

STATUS: BUILT, and seen working in the browser, less the look-through mode.
The fourth build step of specs/MAP_FIRST.md, after
specs/MAP_SCRIPTS_PLAN.md, specs/MAIN_MAP_PLAN.md and specs/VIEWPORT_PLAN.md:
a map's layers and their backgrounds are part of the map, made in the
map editor. The working record, as before. (Foregrounds were here too and
are retired; see "Foregrounds retired" at the end.)

## What is being built

- **Layers in the map document.** A map — a `.map`, or a world's `map` —
  gains `layers`, back to front, each with a name, a parallax factor, whether
  it is fixed to the screen, and a background slot (an
  image, stretched or tiled, and an offset). A placement gains a `layer`. A
  map that says nothing has the one layer every world has, `main`.
- **The layer strip.** A panel on the stage listing the map's layers, front
  at the top: select, add, remove, move up and down. New placements land on
  the selected layer. With a layer selected and no placement, the inspector
  is the layer's: its name, its factor, fixed or not, and its two slots,
  with the project's backgrounds offered for each. A placement's inspector
  gains a Layer dropdown. (Since Sep 2026 the strip starts closed behind a
  Layers button in the stage's toolbar, as the camera list does behind
  Cameras: both are rarely what a map is opened for, and open they covered
  the top-left of the map. Whatever is open stacks in one column there. A
  lesson pointing at `map.layers` opens it — a `mapPanel` reveal.)
- **The canvas draws them.** Each layer's background, then its placements,
  back to front — a stretched image over the map's
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

- `90f82bb1006` — this plan.
- `a2b0d784253` — engine: `layers` on a map and `layer` on a placement; a
  space's own layer list; depth within a space; the space snapshot carrying
  layers and slots.
- `4533a80aa9c` — generator: the main map's layers declared in the world's
  prologue, ahead of the blocks', with each slot's starting values.
- `71e0291757b` — driver: layer containers and slots inside a space.
- `034d0dcb4d0` — editor: the strip, the layer's inspector, the placement's
  Layer dropdown, new placements on the selected layer, the canvas drawing
  layers in order.

## Learned while building

- **The slot arithmetic carried over unchanged**, as the plan argued it
  would. The driver's fake-scene test pins the numbers: under a space
  camera scrolled by `(270, 120)`, a layer at `(0.5, 0)` sits at
  `(135, 120)` and one at `(1, 1)` at the origin, and a stretched backdrop
  is sized and centred by `stretchedPlacement` with the space's bounds and
  view in place of the world's.
- **The slot sync took a host, not a fork.** `syncSlots` parented every
  image into a world layer; it now takes the function that parents one,
  defaulting to the world's, so a space's slots are the same code with a
  different container.
- **An actor in a space goes into its layer's container, not the space's.**
  The first Viewport cut sorted a space's one container by the actor's
  layer depth; with layers of its own that became a container per layer, at
  that depth, and the actor keeps the depth every actor has within one.
- **The default layer is said by saying nothing.** A placement on `main`
  carries no `layer`, a map whose only layer is `main` carries no `layers`
  until something is said about it, and the placement's Layer dropdown is
  offered only when there is more than one — so a map that never opens the
  strip is byte-for-byte what it was.
- **A canvas test tells a placeholder from a fill by its colour.** The
  recording context logs every `fillRect`, the ground's among them; the
  draw-order test picks out the stand-in sprites by the green they are
  filled with.

## The map's own background — BUILT

A map's background is its back layer's: the one `set background to` sets.
It was only reachable through the Layers panel, by clicking the Main row,
which nothing pointed at — and in App Builder, which hides the panel, not at
all. The inspector with nothing selected now has the same background fields
the layer inspector has (`BackgroundField`), writing the back layer's slot,
for a world's main map and for a `.map` alike. The Layers panel says that a
layer's background is set by clicking it.

A world's main map also shows the world's BACKGROUND COLOR, the color behind
the image and behind everything where there is none. It is not the map's: it
is the world's `set background color` row, which the field reads and writes
in the world's code, adding the row at the top of `define world` when there
is none (`worldProperties.writeWorldBackgroundColor`). A row that works its
color out — a blend, an `r g b a` — is left to the code, and the inspector
says so rather than writing over it. The canvas paints the map region in
that color, as the game paints behind everything.

## Not built, and known

- The look-through mode: panning the editor's camera to see each layer move
  at its factor. Until then a factor is a number whose effect shows only in
  the running game.
- `layer ⟨…⟩ of this map`, the block that would let a map's script change a
  space's layer while the game runs. The world's layers keep their blocks.
- A map loaded into the root at run time adding layers, which the world's
  fixed list rules out; its placements' layers resolve against the world's.
- Per-layer effects inside a space, and reordering layers by drag.
- Hit-testing by draw order: a click still finds placements in document
  order, so where two overlap across layers the one in front is not always
  the one picked.

## What to look at in the browser

On a world's main map, add a layer, give it a background from the project
and a factor below one, and place something on it: the canvas should draw
the image behind what is on the layer, and the running game should scroll it
slower than the default layer once the camera moves. Do the same in a level
held by a Viewport: the background should draw inside the Viewport's box and
move at its factor as the space's camera follows.

## Foregrounds retired

Built with two image slots per layer, a background drawn behind its actors
and a foreground drawn in front, and retired in Oct 2026. Nothing in a
starter, a lesson or a stock map used a foreground.

A foreground was the background of a layer one further forward by another
name: the draw order is a layer's background, its actors, its foreground,
then the next layer's background, so layer N's foreground and a background
on a layer directly above N draw the same. What the slot added was a second
word for "an image on a layer", six blocks, a second slot in every layer's
inspector, and a second path through the engine, the driver and the editor.
What it saved was setting the upper layer's parallax and fit to match, and
applying a layer effect once rather than twice.

So fog over the game is a layer above it with an image, made in the map
editor's layer strip. Removed outright (the lab has never shipped): the six
`world_*_foreground*` block types, the layer's `foreground` field in the map
document, the engine's `setForeground*` and foreground effect methods and
`foregroundSnapshot`, the driver's second slot list, and the inspector's
second slot. What remains of the slot is named for what it is: the map
editor writes `withBackground`, and the inspector calls `onBackground`.
