# A Viewport onto the world's own scene

STATUS: BUILDING. Step 1 is in — a Viewport whose `map` says `world` is bound
to the root: no copy, its cameras look at the root, its bounds follow the
root's, and the driver is told `mirrors`. Nothing is visible yet: the driver
still draws a mirror as an empty box until step 4. specs/VIEWPORT_PLAN.md lists
"mirroring" as not built; this is what it would take, written after a Viewport
was given cameras of its own (specs/SPACE_CAMERAS_PLAN.md) and after the first
person to build one asked for it: a minimap, a second shot of the same level,
a box on a menu screen showing the game already in play.

## What a Viewport is today, and why that is not this

A Viewport OWNS a space. Its `map` names a level, `showHeldMap` loads that
level into the space, and every actor the load places is in that space and no
other — "the only thing between two spaces is nothing at all"
(`engine/core/Space`). Load the same level into the world and into a Viewport
and there are two copies: two Pilots, two sets of coins, two games. That is
right for a level in a box and wrong for a minimap, whose whole point is to
show the one game there is.

The driver is built the same way. Each space gets a host: a container of its
own, a Phaser camera of its own, and `ignore` lists so that the world's camera
never draws a space's container and a space's camera never draws the world's
or another space's (`runtime/driver/PhaserBinding`). Once a frame, the space's
camera is given its Viewport's rectangle and pointed at the space's own camera
— `setViewport`, `setZoom`, `centerOn(space.camera)`.

## The shape of the answer

**A Viewport may show another scene instead of a map of its own.** Two
properties say which — BUILT THIS WAY, replacing the word in `map` the first
build used, since `map` means "which map I hold" and the world is not one:

- **`mirrors the world`**, a boolean. The Viewport is bound to the ROOT space.
- **`mirrors`**, another Viewport. The Viewport is bound to THAT one's space.
  Not only the world, because the app progression puts the game itself in a
  box on a menu screen, so a minimap of that game mirrors the box. A mirror of
  a mirror shows what the end of the chain shows; a chain that comes back to
  itself shows nothing, which is the honest answer to a question with none.
  Takes precedence over the boolean when both are set.

While either is set the Viewport loads nothing and `map` is what it would show
if it stopped. Its cameras look at the target space and are seen through its
own window, and it shows the target's scene through the one it elects. Two
properties rather than one string because the world is not an actor; a string
that meant either would be the third sibling-reference dropdown in the
inspector, which is the point at which that abstraction should be built.

Nothing changes about what a Viewport is otherwise. It is still a placement
with a rectangle, still anchored, still covered by a modal screen above it,
still a thing a tab route walks past. What changes is which scene is behind
its rectangle.

## The engine

- **A Viewport's space may be the root.** `Space.owner` is the Viewport for a
  space it owns; a mirror owns no space, and `viewportSpaceOf(actor)` answers
  the root for it. The two cases want a name — `mirrors: true` on the
  Viewport's binding — so that `unloadViewport` unloads nothing (there is
  nothing of its own to unload) and `growSpaceToFit` grows nothing.
- **Its cameras stay its own, and look at the root.** BUILT THIS WAY rather
  than as first written. The draft moved a mirror's cameras into the world's
  `cameraList`; what was built keeps the Viewport's own `Space` object, flagged
  `mirrors`, with its cameras in that space's list as before — and sets each
  camera's `space` to the ROOT. `CameraCollection` already walks every space's
  cameras, so the camera rules reach them unchanged; `cameraNamed` and `shows
through` are untouched; and every query with a mirror's camera in hand
  (`in this space`, `map size`) answers about the root because `spaceOf` reads
  `Camera.space`. Less machinery moved, and the `mirrors` flag is one place to
  ask rather than a property of where the cameras happen to be listed.

  ONE THING THIS SPLIT: `Camera.window`. A mirror's camera looks at the root but
  is seen through the Viewport's rectangle, so `view size` with it in hand
  must measure the box and not the world's view — which `Confined to the Map`
  depends on. A camera now knows its window as well as its space; for a box
  with a level of its own the two agree.

- **`mousePosition` keys on the Viewport, not on the space.** Today a click
  inside a Viewport is mapped through "the space's camera". Two cameras will
  now share the root space, so the mapping has to ask WHICH Viewport the
  pointer is over and go through that Viewport's camera. This is the one
  place the "one camera per space" assumption is load-bearing, and it is where
  specs/SPACE_CAMERAS_PLAN.md said mirroring would reopen it.
- **Modality is unchanged.** Input stops at the topmost modal LOAD, and a
  mirror is not a load. A click in a minimap over a live game reaches the
  game's actors through the minimap's camera, which is what a minimap is for;
  a project that wants the minimap inert puts a covering map over it, or a
  Panel.

## The driver

Phaser's own minimap pattern, and the host machinery already does most of it.
A mirror's host has no container of its own — it draws the world's — so its
camera is added over the world's display list rather than over an `inner`
that the world's camera ignores. The `ignore` bookkeeping inverts for it: the
mirror's camera ignores every OTHER space's container and the interface
layers the world's camera draws on top, and nothing ignores the mirror's,
because it has none. The per-frame placement is identical: rectangle, zoom,
`centerOn` the camera the Viewport shows through.

What is drawn in front of a Viewport in the root — a Panel over a minimap —
is drawn in front of it by the world's camera, as today. What the mirror's
camera draws is the root scene and nothing else.

## What this is NOT

- **Not zoom.** A minimap wants to show more of the level than the game does,
  and today a camera has no zoom, so a mirror shows the same scale in a
  smaller box. Zoom is the piece that makes a minimap a minimap; it waits on
  "the engine's cameras having any" (specs/VIEWPORT_PLAN.md) and is a
  property on a camera, not on this.
- **Not a Viewport showing another Viewport.** A mirror of a mirror is a
  Phaser camera over a container that another camera also draws, and nothing
  has asked.
- **Not a change to a map.** A map still says nothing about cameras.

## Order of work

1. **Engine: a Viewport bound to another scene. BUILT, twice.** First with a
   word in `map`; now with the property pair above, and generalised: the
   target is the root or another Viewport's space, resolved through a chain
   with a cycle guard, and `mirrorUnderPointer` catches pointers for whichever
   scene a mirror shows. Tests: a mirror holds no copy and sees the target's
   actors through its camera; measures the map by the target and the view by
   its own window; a level in a box still gets a copy; a minimap of a boxed
   game sees the box's scene and routes clicks into it; a chain resolves and a
   cycle shows nothing.
2. **Engine: a mirror's cameras.** FOLDED INTO 1 — nothing moved, see "Its
   cameras stay its own" above.
3. **Engine: the pointer through the right camera. BUILT.** `mousePosition`
   asks which mirror OF THE SUBJECT'S SCENE is under the pointer, topmost
   first, and maps through it; a camera a Viewport owns is asked through its
   own window whichever scene it looks at; a box's own corner is measured
   through the world's camera and never through a mirror, or a mirror under
   the pointer would be asked for its corner through itself, without end —
   which the first version did.
4. **Driver.** A host without a container; the inverted `ignore` lists;
   fake-scene test.
5. **Editor.** Nothing for the properties — `mirrors the world` is a checkbox
   and `mirrors` a placement reference, both of which the inspector already
   draws — but the held-map preview should draw the mirrored scene dimmed
   inside the box, as it draws a held level.
6. **Specs**, and the browser: a minimap on the Jetpack level, following the
   Pilot at the same scale, until zoom lands.
