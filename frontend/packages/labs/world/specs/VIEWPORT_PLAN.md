# Plan: the Viewport (MAP_FIRST.md, step 3)

STATUS: BUILT, and seen working in the browser, less mirroring. The third
build step of specs/MAP_FIRST.md, after specs/MAP_SCRIPTS_PLAN.md and
specs/MAIN_MAP_PLAN.md: a stock actor placed on the main map that holds a
map in a coordinate space of its own, with a camera between that space and
the screen. The working record, as before.

## What is being built

- **A space.** The engine gains spaces: a coordinate system holding actors,
  with bounds of its own and a camera of its own. The world's root space is
  the main map's and is what every world has had. A Viewport owns a second
  one. Every actor is in exactly one space, and a child is in its parent's.
- **The Viewport**, a stock actor (`actors/viewport`) that acts like a Panel
  in shape — a width and a height, a drawing — and carries one property that
  matters: the map it holds, by path. The engine gives each one a space
  when it is placed, loads its map into that space the first time it runs, and
  scrolls the space's camera by the Viewport's own `scroll`. It USED TO point
  that camera at what the map's `camera.follows` named and clamp it into the
  map's bounds; both are gone with the field, and a Viewport's camera now
  follows and confines by electing the traits that do
  (specs/SPACE_CAMERAS_PLAN.md).
- **Loading into a space.** `load map ⟨map⟩ into ⟨viewport⟩` replaces what a
  viewport holds; `unload ⟨viewport⟩` empties it. The load handle a map's
  script gets is the same `MapLoad` step 1 built; a viewport remembers its
  loads so it can take them back. `load map` alone keeps meaning the root
  space.
- **Rules stay inside a space.** The collision broadphase pairs an actor
  only with actors in its space; the mouse hit-tests an actor against the
  pointer mapped into that actor's space; what reads the map's size — out of
  the map, wrap, bounds, path, the camera's confinement — reads the size of
  the actor's or camera's space.
- **The driver** draws each non-root space as a Phaser Container at the top
  of the scene, holding the space's actors, drawn by a Phaser camera of its
  own into the Viewport's rectangle on the canvas and pointed at the space's
  camera; the main camera looks past it, and it looks past the layers.
- **The editor** offers the project's maps for the Viewport's map property,
  and draws the held map's placements inside the Viewport's box, dimmed.

## Decisions taken before building

- **One Phaser camera per Viewport, as MAP_FIRST.md said** — reached the
  long way. The first cut was a masked container: the driver never moves its
  camera, a camera's pose is applied by shifting each layer's container, and
  a space looked like the same mechanism one level down with a geometry
  mask as the clip. In the browser the level drew out to the edge of the
  screen: this Phaser is version 4, where a mask is a filter and `setMask`
  does nothing in WebGL. A second camera is what clips, and Phaser 4 keeps
  `cameras.add`, `setViewport` and `ignore`, whose lists skip a container's
  whole subtree. What it buys besides the clip: a space can be zoomed apart
  from the world once the engine's cameras have zoom.
- **Rules learn the space through the actor, not through the world.** The
  macros the stock rules use — `mapSize()`, `mousePosition()`, the near
  query behind collisions — are world-wide today. Each gains the actor it is
  asked for: `mapSize(actor)`, `mousePosition(actor)`, and the near query
  narrows to the point's actor's space. The world's functions take an
  optional actor and answer for its space, so a rule that passes nothing
  still gets the root, and nothing in a rule has to name a space.
- **A spawn lands in the space of the actor whose handler spawned it.** The
  engine remembers which actor's handler or per-kind step is running, and
  `addActor` with no space named uses that actor's space, else the root.
  Nothing in generated code changes. A rule step that spawns from a
  world-wide loop lands in the root unless it says otherwise, which no stock
  rule does today.
- **Every project map is registered on the world.** The world module emits
  `world.defineMap(path, module)` for each `maps/*.map`, as it uses every
  rule and animation the project holds, so a map can be loaded by a path
  held in a property — a Viewport's — and `load map ⟨…⟩ into ⟨…⟩` takes a map
  VALUE, with `map ⟨dropdown⟩` as its shadow, rather than a dropdown of its
  own. `load map` alone is unchanged.
- **The Viewport's camera is the engine's, not the camera rules'.** The
  rules that follow and confine a camera are traits a `define camera`
  elects; a space's camera has no block to elect anything on. The engine
  itself follows `camera.follows` and clamps to the space's bounds, which
  is what the rules do for the world's camera, without the traits.

  _This was a shortcut, and specs/SPACE_CAMERAS_PLAN.md removed it: the branch
  described above is gone as of that plan's step 6._ The clamp here is `Camera Confined`'s step written a second time, and
  the cost of the shortcut is that a Viewport's camera cannot ease, cannot
  have a deadzone, cannot have a look offset and cannot be aimed by a block.
  `camera.follows` on the map is a workaround for a reference that had
  nowhere else to live, not a design.

- **A space's actors keep their layer** (the world's layers, by id), and the
  space container orders them by layer depth then draw order; backgrounds
  and layers of a space's own are step 4's.
- **Not in this step**: mirroring, zoom, a Viewport inside a loaded map
  (nothing forbids it; nothing tests it), double-click into the held map.

## Order of work

1. Engine: `Space`, the Viewport rule and trait, `defineMap`, `loadMapInto`
   and `unloadViewport`, the per-space `mapBounds`/`viewSize`/
   `mousePosition`, the ambient actor for `addActor`, follow and clamp, the
   frame's `space` and a `spaceSnapshot`. Tests.
2. Rule sources: `mapSize(actor)`, `mousePosition(actor)`, the near query by
   space; the stock rules rebuilt. Tests.
3. Blocks and generator: `map ⟨…⟩`, `load map ⟨…⟩ into ⟨…⟩`, `unload ⟨…⟩`;
   `defineMap` per project map in the world module; `camera.follows` read
   from a map. Tests.
4. Driver: the space container, mask and shift; fake-scene test.
5. Stock Viewport actor; the inspector's map dropdown; the dimmed preview.
6. Specs.

## Commits

- `9592b3bc20e` — this plan.
- `dfe27c00b86` — engine: spaces, the Viewport rule as a third foundation
  rule, `loadMapInto` and `unloadViewport`, per-space bounds, view and
  mouse, the near query by space, the actor in hand, the frame's `space`
  and `spaceSnapshot`.
- `0dc0f38af7a` — the two generated loops take their actor in hand.
- `08c543dd183` — blocks: `map ⟨…⟩`, `load map ⟨…⟩ into ⟨…⟩`, `unload ⟨…⟩`;
  every project map registered on the world; a Viewport shows the map its
  property names.
- `48176fc3fed` — driver: a masked container pair per space inside the
  Viewport's group, the inner shifted by the space's camera; a fake-scene
  test. Superseded by the next but two.
- `ed8e7e272b7` — the stock Viewport, its icon and catalogue unlock; the
  inspector's dropdown of the project's maps for its `map`; the held map
  drawn dimmed inside its box.
- `536eedccbc7` — driver, again: a camera per space, after the browser
  showed the mask never clipped.

## Learned while building

- **The rule sources did not need touching.** The plan's step 2 was to pass
  the actor into the `mapSize`, `mousePosition` and near-query macros. With
  the actor in hand set by the two generated loops, by handler dispatch, by
  per-kind steps and by the actor-value helpers (`each`, `filtered`,
  `firstWhere` take the loop's actor and the predicate's candidate in
  hand), every stock rule answers for the right space unchanged. The mouse
  rule's hit test runs inside a `filter` predicate, which is why the
  candidate had to be in hand there and not only in loops.
- **A loop body stays a loop body.** `withActor` is written out as `enter`
  and `leave` around a `try`/`finally` so that a `return` still leaves the
  rule and a `continue` still continues; a callback would have broken both.
- **A path nothing registered empties the Viewport.** The first cut
  returned early and left the old map showing; "show the map at this path"
  with no such map means show nothing.
- **The builder hands maps over when the world is built,** not only when
  a load asks, since a Viewport placed under `define world` looks its map
  up on the first tick, after the world exists and before any load.
- **A placement's own size is a property the map can set.** The
  end-to-end test sets the Viewport's `intrinsicSize` through the
  placement's `positional` overrides rather than through a `set` row in
  the actor file, which is also how the stock Viewport will get its size
  from the inspector.
- **`setMask` is a no-op in this Phaser's WebGL renderer.** Phaser 4 makes
  masks filters; the fake-scene test could not know, since it records what
  the driver asked for and not what Phaser does with it. The tests pin the
  driver's requests; only the browser pins Phaser's answers, and the plan's
  "what to look at in the browser" is where that was caught.
- **The camera's rectangle is read last, off the Viewport's group.** The
  Viewport's corner on the canvas is only known once every group has been
  positioned for the frame; the group's world transform gives its middle,
  and the main camera maps the world onto the canvas at the render scale
  from the origin (`fitCamera`), so a Viewport carried by a parent, or on a
  scrolled layer, is still drawn where it is. Cameras render in the order
  they were added, so a space draws over the Viewport's own face, which is
  the window's backdrop.
- **A foundation trait is not a dependency.** The stock-actor test counts
  every `use trait` row as a rule the import must bring; the Viewport's
  trait is the engine's, in play everywhere, and joined Space and
  Appearance in the set the test leaves out.

## Not built, and known

- Mirroring: a Viewport showing another Viewport's contents through its
  own camera.
- Zoom, which waits on the engine's cameras having any.
- (Built in step 5 and DELETED since: the editor's way to set a map's
  `camera.follows`. A map does not decide where the view looks
  — specs/SPACE_CAMERAS_PLAN.md.)
- A Viewport's own layers and backgrounds (step 4); until then the main
  map's backdrop shows through a Viewport, over the Viewport's own face.
- (Settled since, in step 5: `clear world` is deleted; the world's follow
  blocks stay. Also fixed there: a load by path now writes the Viewport's
  `map` property, where before the next tick loaded the old map back; and
  what the root holds in front of a Viewport is drawn in front of it.
  specs/RETIREMENTS_PLAN.md.)

## What to look at in the browser

Place a Viewport on a world's main map, set its map to a level, and run:
the level should draw inside the box with the rest of the screen still,
clicks inside it should reach the level's actors and not the main map's, the
space's camera should sit at the middle of the box and move with its `scroll`,
and `unload ⟨the Game⟩` should empty the box. (Following and stopping at the
level's edges are a camera's traits now, not the engine's doing.) In the editor, the held level should show dimmed inside the box and
move with it.
