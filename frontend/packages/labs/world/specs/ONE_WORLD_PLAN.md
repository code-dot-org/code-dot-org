# Plan: one World, seen through Viewports

STATUS: PLANNED, October 2026. Nothing below is built. Comes before
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
- **The Scroll View stops being a Viewport.** Its content is its children,
  placed on the screen in the screen editor, and it clips and scrolls them.
  A Scroll View holding a map would be a second World. To be checked: what
  clipping costs without a camera of its own (see below).
- **A screen may hold any kind of actor.** A title screen with a Player
  bouncing on it is reasonable. It is drawn flat, and never meets the
  World's actors.

## What goes

There are no migrations (specs/RETIREMENTS_PLAN.md).

- A space for each Viewport, and `viewportSpaceOf`, `showHeldMap`,
  `loadMapInto`, `unloadViewport`, `enterShown` and `here`.
- The Viewport's `map`, `content`, `shows through`, `mirrors` and `mirrors
the world` properties, and `when ⟨Viewport⟩ shows a map`.
- Mirroring: `mirrorTargetOf`, `mirrorInto`, `stopMirroring`, the layer's
  `inMirrors`, and the map editor's mirror preview.
- A Viewport's list of cameras, `defineCamera`, camera ids, and the Cameras
  drawer blocks that name a camera.
- `fit` on a layer, `this layer is fixed`, `setLayerFit` and
  `LAYER_FIXED_OPTIONS`.
- A screen's layers, and the screens' share of `projectLayerOptions`.
- `load map … into ⟨…⟩`, `unload ⟨Viewport⟩` and `in the map ⟨…⟩ shows`.

## Order of work

1. This plan.
2. Engine: one World beside the screen. A Viewport's camera looks at it.
   `loadMap` replaces what the World holds, and the first map comes from the
   screen's data. Tests.
3. Cameras: one per Viewport, with the camera traits as now; `actor to
follow` by kind. Removing camera lists and `shows through`. Tests.
4. Layers: `fit` removed, screens lose their layers. Tapper's Interface
   labels become Main Screen placements.
5. World blocks act on the World. Removing `here`, `load map … into`,
   `unload ⟨Viewport⟩`, `in the map ⟨…⟩ shows` and mirroring.
6. The Scroll View over its children.
7. The lesson converter, the 90 lessons, the fixtures and the map editor.
   The Main Screen dump compared before and after, as for
   WORLD_AS_DATA_PLAN.md: every difference accounted for.
8. Specs: MIRRORING_PLAN.md, SPACE_CAMERAS_PLAN.md, VIEWPORT_PLAN.md,
   VIEWPORT.md, LAYERS_PLAN.md, SCROLLING_PLAN.md and SIMPLE_INTERFACE.md
   marked superseded where this replaces them, and this record.

## To find out before step 2

- How the preview's renderer gives each space and camera its view
  (`PhaserBinding`), and what one World seen by several cameras needs from
  it.
- How the Scroll View clips without a space of its own, and whether a
  screen region with a camera of its own is the simplest way to do it.
- Which lessons and fixtures aim a camera at a placement, name a camera
  other than `main`, or put code under `in the map ⟨…⟩ shows`, and what each
  becomes.
- What the World's size is between Run and the first map, and what a
  Viewport draws then.

## Not in this plan

- More than one map in the World at once.
- More than one World.
- Per-level camera hints, such as a map asking for a zoom. Data on the map
  if a lesson needs one.
- The screen stack, which is specs/SCREEN_STACK_PLAN.md.
