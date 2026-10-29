# Plan: one World, seen through Viewports

STATUS: BUILT, October 2026. All nine steps are in. Comes before
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
follow` by kind. Removing camera lists, `shows through`, and the
   Viewport's own `scroll` and `content`. Tests.
7. Layers: `fit` removed, and the screen's layers (`defineScreenLayer` and
   its backgrounds) reduced to what a flat screen needs. Tapper's Interface
   labels become Main Screen placements.
8. The screen editor: a way into a Scroll View to arrange content taller
   than its window, and the map editor's mirror preview removed.
9. Specs: MIRRORING_PLAN.md, SPACE_CAMERAS_PLAN.md, VIEWPORT_PLAN.md,
   VIEWPORT.md, LAYERS_PLAN.md, SCROLLING_PLAN.md and SIMPLE_INTERFACE.md
   marked superseded where this replaces them, and this record.

## Learned while building

- **Step 2 kept the Viewport's own `scroll` and `content`.** The Scroll View
  no longer uses them, but `spaces.test` positions a Viewport's camera with
  them, and those tests are rewritten in step 3. They go in step 6 with the
  rest of a Viewport's camera.
- **The scroll is applied between a parent and its children's frame**
  (`parenting.childFrameOf`), so a child's position is where it is drawn,
  and a position written to it while scrolled reads back as written. The
  render snapshot reports each child's `local` with the scroll in it, and
  the Scroll View's own `clip`, so the renderer nests and masks without
  knowing about scrolling.
- **The pointer's clip is a rule's question.** `⟨actor⟩ shows at the
pointer` joins `can be reached` in the shared hit test of Mouse and
  Gestures (`scripts/rules/pointing.mjs`). It is not part of `canReach`,
  which the keyboard asks too: a field scrolled out of sight still takes
  what is typed into it.
- **Seen in the browser** on the Interface Kit: the rows are clipped at both
  edges of the window, and the wheel moves them and the scrollbar.
- **Step 3 took choosing a mirror target with it**, which the plan had put
  in step 6. Once every Viewport shows the World, `mirrors`, `mirrors the
world` and a layer's `inMirrors` mean nothing, and leaving them for three
  steps would have left fields in the inspector that do nothing. The map
  editor's mirror preview went with them.
- **The World's host has two cameras that draw nothing.** The renderer's
  hosts each have a camera and an `over`; the World's are made and hidden,
  and left out of the root's bands, rather than making both optional.
- **The World's parallax is measured against the first Viewport's camera.**
  Its layers are containers shared by every Viewport, so a second Viewport
  sees them placed for the first's view. A minimap over a parallax layer
  shows it where the main view has it.
- **A Viewport's `map` loads when that Viewport's property changes**, not
  when it differs from what the World holds. Two Viewports naming two maps
  would otherwise take turns every tick; the one that changed last wins.
- **`load map` from code in the World replaces the World's map.** The
  two-rooms lesson's near miss, `load map` from the door instead of `load
map … into ⟨Game⟩`, is now a correct answer, and its test says so.
- **Seen in the browser**: Breakout, Flappy, Tapper, Meteors and the
  Interface Kit draw as before, and Meteors moves.
- **Step 4 put the first map on the Main Screen as `worldMap`**, and took
  the Viewport's `map` property away with it rather than in step 5: once the
  screen names the World's map, a Viewport's would be a second answer. The
  World inspector has a "World starts with" field, and every Viewport on the
  stage previews that map.
- **The screen's module loads the World's map before it places the
  screen**, so a camera the screen aims at `any ⟨Player⟩` finds the Player,
  as it did when the Viewport loaded its level during placement. The
  World's actors therefore come before the screen's in the actor list. A
  Viewport placed after the World has its map still hears `shows a map`.
- **The World is at least as big as the first window onto it**, measured
  once the screen's layout has docked that window. Measured at placement,
  before docking, the Simple scenario's World took the HUD bar's height too.
- **Compared before and after** by running all 90 scenarios and lessons for
  a second and dumping each actor's kind, space, layer and position and each
  Viewport's bounds and camera. Nothing differs but generated ids and what
  differs between two runs of the same code: the random lessons.
- **Step 5 kept `here`, and narrowed it to two answers.** A world block acts
  on the World from any code, a screen actor's handler included; it acts on
  the screen only while the screen's own module holds it, or one of the
  world's own cameras runs. The screen's module says what is its own through
  calls named for it: `loadScreen` for its placements, `setScreenSize`,
  `setScreenColor`, `defineScreenLayer` and `setScreenBackground`. They are
  named, not held around the calls, because the builder records most calls
  to replay into a rebuilt world, and a held context would not replay.
- **The engine's own names now mean the World.** `layers`, `layerSnapshot`,
  `backdropSnapshot`, `backdropColor` and the builder's `defineLayer` are the
  World's; the renderer reads the screen through `screenLayerSnapshot`,
  `screenBackdropSnapshot` and `screenColor`, and hot reload carries both.
  This was step 7's in part, brought forward: with blocks acting on the World
  and the old names describing the screen, every engine test about layers and
  backgrounds read one thing and checked another.
- **`load map` takes its map as a value** (`map ⟨…⟩`, or a path worked out in
  code) and replaces the World's, which `load map … into` used to be the only
  way to do. `load the map named` and `unload the newest map` put maps up over
  the screen and take them down, from any code, until screens do it
  (specs/SCREEN_STACK_PLAN.md). Breakout's pause menu uses the first.
- **A Viewport added by code goes on the screen**, the only place one means
  anything; everything else code adds goes into the World.
- **A size said before any Viewport is kept.** Placing the first Viewport
  floors an empty World at its window, unless `set map size` already said
  how big it is; the camera demos found that by being sized first.
- **The camera rule demos look through a Viewport** the size of their frame,
  since a camera that follows something in the World is a Viewport's. The
  recorder films only the World where a demo has one. The actor demo
  recorder fails on an `image` command; it did before this step.
- **Compared before and after** as in step 4: no difference in any of the
  90, but the random lessons' positions.
- **Seen in the browser**: Breakout's pause menu comes up over the game, and
  Quit takes it away and starts the level again.
- **Step 6 configures a Viewport's camera in one place**: its placement's
  `camera`, set in the camera's inspector and made into a
  `world.setViewportCamera(…)` call by the compiler. A kind no longer elects
  camera traits for the camera of a Viewport it is, and the per-tick copy of
  such a kind's camera values went with them: it would have fought the
  placement's values, and no content used it.
- **Code reaches a Viewport's camera through `camera of ⟨Viewport⟩`**, which is
  also the shadow a camera member's subject socket takes. `camera`,
  `move camera` and `use camera` went with the camera lists.
- **The stock Viewport still brings Camera Follow and Camera Confined.** It
  elects neither now, but the camera's inspector offers only the camera
  rules a project holds, so a new project would otherwise offer nothing.
  The stock actors test allows the Viewport these two.
- **The inspector's schema now carries every elected trait**, even one with
  nothing to set. The editor finds a Viewport by its trait, and that trait
  lost its last properties (`scroll`, `content`, `shows through`) in this
  step; the inspector draws no group for an empty one.
- **Compared before and after** as in step 5, with each Viewport's camera
  position and zoom added: no difference in any of the 90, but the random
  lessons' positions.
- **Seen in the browser**: Flappy's camera holds at the map's left edge until
  the bird reaches the middle of the window, then follows it. Selecting the
  Game Viewport shows a Camera row, which opens Zoom and the camera traits,
  with Follows aimed at any Bird.
- **Step 7 left a screen one layer and one background.** `defineScreenLayer`
  and the screen's list of layers are gone; the screen's data says
  `background` (a picture, whether it tiles, where it sits) beside
  `backgroundColor`, and the generator says it as `setScreenBackground` and
  its two companions, with no layer. No screen in the content had layers,
  and the converter now refuses a world whose map is a screen with layers.
- **`fit` went with the `this layer is fixed` block, `setLayerFit` and the
  inspector's Fixed to the screen.** A layer at parallax (0, 0) is what is
  left, and it zooms with the camera, as weather in the scene should.
- **Tapper was the only content with a fixed layer**, and its score label was
  not even on it: the label was added by code inside `define layer`, and code
  there places into the default layer. Its four labels are now Main Screen
  placements. The coin raises `scored` and the Score label's own code answers
  it, since screen code cannot name a placement (`the ⟨…⟩` is a map's and a
  placement's block).
- **The layers lesson (`place/layers`) taught the fixed layer.** It now asks
  for the Score on the Main Screen, out of the level, and the Hills on a
  layer that lags; its check reads where the Score is placed.
- **Compared before and after** as in step 6: no difference in any of the 90
  but the random lessons' positions and Tapper's labels, which moved from the
  World to the screen at the same places.
- **Seen in the browser**: Tapper's labels draw over the game, and clicking
  two coins takes them away and the screen says `Score: 2`.
- **Step 8 draws a Scroll View on the stage as the game starts.** Its
  children are clipped to its window at no scroll, and one below the
  window cannot be clicked there. The Interface Kit's last two settings
  rows had been drawn over the Reply box below.
- **The way in is "Arrange what it holds"**, a row of a Scroll View's
  inspector, not a double-click, which opens a placement's code. Open, the
  stage shows the whole of what it holds and the window's height again
  below it, on a backing with the window's foot marked; everything else is
  faint and out of reach, a placement made there is its child, and the
  arrow keys go round only what it holds. "Done" in the toolbar, or
  Escape, closes it. The geometry is `mapEditor/scrollViews`, measured as
  the engine measures `content`.
- **The mirror preview was already gone**, with step 3.
- **Seen in the browser** on the Interface Kit: closed, three rows in the
  window; open, all five, and Escape closes it.
- **Step 9 marked what this replaces**: MIRRORING_PLAN.md and
  SCROLLING_PLAN.md as superseded, and SPACE_CAMERAS_PLAN.md,
  VIEWPORT_PLAN.md, VIEWPORT.md, LAYERS_PLAN.md and SIMPLE_INTERFACE.md in
  the parts this changed. Four more said a removed thing as current, and
  are marked the same way: UI_ACTORS.md (a HUD as a fixed layer),
  CURRICULUM_PLAN.md (the layers lesson), LESSONS_AS_SCREENS_PLAN.md (`in
  the map ⟨Game⟩ shows`) and SCREEN_MAP_PLAN.md (a Viewport's own space).
  Passing mentions in the records of other plans are left as history.

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
