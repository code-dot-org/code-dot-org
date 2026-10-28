# Plan: one World, seen through Viewports

STATUS: BUILDING, October 2026. Step 1 is done. Comes before
specs/SCREEN_STACK_PLAN.md, which sits on it.

A game has one World. Maps fill it, and maps bring its layers. A Viewport is
a window onto the World through a camera of its own. A Screen is a flat
surface of interface actors, drawn at the size of the window, with no
layers and no camera of its own; the HUD is on it. Two Viewports on one
screen look at the same World: a minimap, or split screen. A project
cannot have two Worlds.

## What there is now

- **Every Viewport owns a space.** Its `map` property names the map loaded
  into that space (`World.showHeldMap`, `loadMapInto`). The Main Screen is
  the root space and has layers of its own.
- **Mirrors** exist because two Viewports have two spaces: a mirror holds
  no map and draws the space of the Viewport it names, or the root
  (`mirrors`, `mirrors the world`, specs/MIRRORING_PLAN.md).
- **Cameras are on the Viewport's placement.** Every space has a `main`
  camera; a placement may declare more, and `shows through` picks one
  (specs/SPACE_CAMERAS_PLAN.md). The stock Viewport elects `Follows` and
  `Confined to the Map`, and `actor to follow` is picked from the map's
  placements in the inspector.
- **World blocks act where the code runs** (`World.here`): the root from
  the Screen's code, a Viewport's space from a level's. The lessons wrap
  code meant for the level in `in the map ⟨Game⟩ shows`.
- **A layer may be fixed**: `fit` ignores the camera and fits the layer to
  the surface, which is how a HUD was made before the Screen held one.
- **The Scroll View is a Viewport.** Its content is a map loaded into its
  space, and scrolling moves its camera (specs/SCROLLING_PLAN.md).

## The model

- **One World.** It runs from Run to Stop, whether or not a Viewport shows
  it.
- **`load map ⟨…⟩` replaces what the World holds.** Everything in it goes,
  placed or added by code, and the map is loaded. The old map hears `when
this map unloads` and the new one `when this map loads`. A level change,
  going to the overworld and restarting a level are all this one block.
  Adding a second map to the World is not in this plan.
- **The Main Screen's data names the World's first map.** It replaces what
  the Game Viewport's `map` property says now.
- **Cameras are the game's, and each Viewport has exactly one.** A camera is
  part of the Viewport: what it follows, how it eases, whether it is
  confined, its deadzone and zoom, as the camera traits say now. A game
  with a hundred levels states this once, on the Viewport.
- **A camera follows a kind, never a placement.** A placement is one map's,
  so a camera aimed at one is lost on the next level. `follows any
⟨Player⟩` works on every level that places a Player.
- **A camera is confined to the map the World holds**, so a level that
  fits the view does not scroll and a wide one does, with nothing set per
  level.
- **Layers are a map's only**, and a layer is a name, a parallax and a
  background. A layer that should not move with the camera has parallax
  (0, 0); it still zooms with the camera, which is right for weather in the
  scene. Anything that must ignore the camera entirely belongs on a screen.
- **World blocks act on the World**, from whatever code runs them: `add
actor`, `set background`, `load map`. A screen's own actors are its
  placements, made in the screen editor and named in its code.
- **Actor queries search the World.** `all actors` and `any ⟨kind⟩` find
  the World's actors from any code. A screen names its own placements.

## Decisions

- **One camera per Viewport, not several to switch between.** A minimap is a
  second Viewport, split screen is two, and a cut to the boss is the camera
  following something else. None needs a second camera on one Viewport.
- **Camera effects raised from World code reach every Viewport.** World code
  knows no Viewport; a screen's code names one. No such effect exists yet;
  this is the rule the first one follows.
- **`actor to follow` takes a kind in the inspector.** The picker offers the
  project's kinds, not one map's placements.
- **The Scroll View stops being a Viewport.** A Scroll View holding a map
  would be a second World. Its content is its children, placed under it in
  the screen editor (specs/PARENTING.md). It clips them with a mask, and
  scrolling moves them under it. `scroll` and `content` move from the
  Viewport to it; `content` is its children's extent. See "Clipping".
- **A screen may hold any kind of actor.** A title screen with a Player
  bouncing on it is reasonable. It is drawn flat, and never meets the
  World's actors.

## Clipping

A camera's rectangle used to be the only clip in the lab besides an actor's
own canvas. The binding says a mask does nothing in WebGL (`PhaserBinding`,
`actors/stock/list`), which is true of the `setMask` component and not of
Phaser 4's mask FILTER. That was tried in October 2026, under the binding's
renderer (WebGL, Phaser 4.2.1, headless Chromium on SwiftShader):

- A Container given `enableFilters()` and `filters.external.addMask(g)`,
  with `g` a Graphics rectangle in world coordinates, is clipped to the
  rectangle exactly, text included.
- Moving the children inside it scrolls them under the clip.
- A mask inside a masked Container clips to both.
- Zooming and scrolling the camera moves the clip with what it clips.
- An internal filter on the same Container, a glow, still draws, inside the
  clip.
- Objects outside the Container are not clipped.
- Forty masked Containers took a software-rendered frame rate from 60 to
  about 51. Each mask renders a texture, so a screen with a few Scroll Views
  is cheap and one with hundreds is not.

What follows for the Scroll View:

- **It needs no camera.** Its children's Container carries the mask, which is
  its own rectangle, redrawn when it moves or is resized.
- **The engine clips input itself.** A mask changes only what is drawn. A
  point counts on a Scroll View's child only inside the Scroll View, and so
  does a tap; the engine's hit test does this, not the binding.
- **Nesting works**, one Scroll View in another, with no special case.
- **The filter order matters.** `skew.ts` already depends on where
  `enableFilters` puts its step, so the mask joins that order rather than
  being added beside it.
- **The comments that say a mask does nothing** are corrected when this is
  built. The List keeps drawing its own rows: drawing only the rows that
  show is why a thousand words cost what six do.

## How it is built

**The root stays the screen, and the World is a second space beside it.**
The other way round, the World as the root and the screen moved out of it,
would change which space the renderer's main camera draws, and the renderer
cuts the root into bands around each Viewport (`PhaserBinding.band`). Leaving
the root alone leaves all of that alone.

**Every Viewport mirrors the World.** A mirror is already a Viewport whose
cameras look at a space it does not own, and the renderer already draws a
mirror through its target's container (specs/MIRRORING_PLAN.md). So "a
window onto the World through a camera of its own" is the mirror path with
one target, and what goes is the choosing of targets, not the mechanism.
The renderer needs one new thing: a host for a space that no Viewport owns,
which holds the World's containers and layers and is drawn only by mirrors.

**What was found** (October 2026):

- **The renderer** gives each Viewport's space a container and a Phaser
  camera, draws the root with the main camera cut into bands, and draws a
  mirror by pointing its camera at the target's container.
- **The 90 lessons**: 81 put code under `in the map ⟨Game⟩ shows`; 88 have a
  Viewport and every one names `maps/main`; four (Flappy and its lessons)
  declare a second camera on the Viewport, `Follow`, aimed at
  `ofType("actors/bird")`, which is already a kind; Breakout loads a map
  into the Viewport to restart; none mirrors or uses a fixed layer.
- **The Scroll View** is the only Viewport with a map other than the
  level's, and the Interface Kit is the only content that places one. It
  has to stop being a Viewport before every Viewport shows the World, so it
  is built first.
- **Before the first map** the World is the size of the window, as a
  Viewport's space is now, and a Viewport shows its clear color.

## What goes

There are no migrations (specs/RETIREMENTS_PLAN.md).

- A scene for each Viewport: `showHeldMap`, `loadMapInto`, `unloadViewport`,
  `enterShown` and `here`. A Viewport keeps a space only as the holder of
  its camera and window.
- The Viewport's `map`, `shows through`, `mirrors` and `mirrors the world`
  properties, and `when ⟨Viewport⟩ shows a map`. `scroll` and `content` go
  to the Scroll View.
- Choosing what to mirror: `mirrorTargetOf`, chains of mirrors, the layer's
  `inMirrors`, and the map editor's mirror preview.
- A Viewport's list of cameras, `defineCamera`, camera ids, and the Cameras
  drawer blocks that name a camera.
- `fit` on a layer, `this layer is fixed`, `setLayerFit` and
  `LAYER_FIXED_OPTIONS`.
- A screen's layers, and the screens' share of `projectLayerOptions`.
- `load map … into ⟨…⟩`, `unload ⟨Viewport⟩` and `in the map ⟨…⟩ shows`.

## Order of work

1. This plan.
2. The Scroll View over its children: a `Scrolls` trait with `scroll` and
   `content`, children shifted by the scroll in the parent's frame, the
   mask in the renderer, and the clipped hit test in the engine. The
   Interface Kit's settings page moves from its own map to children of the
   Scroll View.
3. Engine: the World space. Every Viewport mirrors it, `loadMap` from World
   code replaces what it holds, and a Viewport's `map` loads into it.
   Renderer: the World's host. Tests.
4. The first map from the screen's data, and the converter, lessons and
   fixtures moved to it. The Main Screen dump compared before and after:
   every difference accounted for.
5. World blocks act on the World: `here` and `in the map ⟨…⟩ shows` go, and
   with them `load map … into` and `unload ⟨Viewport⟩`.
6. Cameras: one per Viewport, with the camera traits as now; `actor to
follow` by kind. Removing camera lists, `shows through` and choosing a
   mirror target. Tests.
7. Layers: `fit` removed, screens lose their layers. Tapper's Interface
   labels become Main Screen placements.
8. The screen editor: a way into a Scroll View to arrange content taller
   than its window, and the map editor's mirror preview removed.
9. Specs: MIRRORING_PLAN.md, SPACE_CAMERAS_PLAN.md, VIEWPORT_PLAN.md,
   VIEWPORT.md, LAYERS_PLAN.md, SCROLLING_PLAN.md and SIMPLE_INTERFACE.md
   marked superseded where this replaces them, and this record.

## Not in this plan

- More than one map in the World at once.
- More than one World.
- Rows added to a Scroll View by code, such as a feed of real actors. That
  wants `add ⟨kind⟩ into ⟨actor⟩`, placing the new actor where its parent
  is, since `add actor` adds to the World. Nothing needs it yet; the Notes
  app uses the List.
- Per-level camera hints, such as a map asking for a zoom. Data on the map
  if a lesson needs one.
- The screen stack, which is specs/SCREEN_STACK_PLAN.md.
