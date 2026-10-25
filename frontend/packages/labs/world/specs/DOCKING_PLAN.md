# Plan: docking and the grid layout (SIMPLE_INTERFACE.md, phase four)

STATUS: IN PROGRESS.

The fourth phase of the simple interface. A Screen's interface actors can
be DOCKED: dragged to an edge of the screen or of something already
docked, which splits that region and gives the actor one side of it. A
game's Viewport is docked to the whole screen, so a Panel dragged to the
top edge becomes a HUD bar and the Viewport takes what is left.
SIMPLE_INTERFACE.md, "The grid layout is a tree of splits", decided the
shape.

## What exists

- **A Screen is a map** whose placements are interface actors; a game's
  Main Screen holds one Viewport, which shows the level.
- **Anchors** (ANCHORS_PLAN.md). A placement may name one of nine places;
  the loader measures its offset from that place in the map and puts it the
  same distance from that place in the window, at load (`applyAnchors`)
  and again whenever the window's size changes (`reanchor`). One a program
  has moved since is left alone. Not built there, and wanted here: anything
  that stretches.
- **A boxed actor's size is its `width` and `height`** (the Boxed rule). A
  drawn actor's size follows them every frame (`renderSnapshot`), and a
  Viewport's window is its drawn size, so setting a Viewport's box resizes
  what it shows.
- **Parenting** carries children with their parent.

## The shape

A map document gains an optional `layout`, a tree of splits:

```json
{
  "split": "down",
  "fixed": "first",
  "size": 48,
  "first": {"dock": "hud"},
  "second": {"dock": "game"}
}
```

- A leaf docks one placement, by its id: `{"dock": "game"}`.
- A split divides its region `across` (side by side) or `down` (one above
  the other). One side is `fixed` at `size` pixels, and the other fills
  what is left; a HUD bar stays a HUD bar in a taller window, which a ratio
  would not.
- A docked placement fills its region: its middle is the region's, and
  its `width` and `height` are the region's. Its own position and size in
  the map are what it shows in the editor before the layout is applied,
  and are otherwise ignored.
- A placement in no leaf floats where it was put, as now, anchored or not.
- A leaf naming no placement there is a hole the split around it closes
  over: its sibling takes the whole region. So deleting a docked
  placement needs nothing else to change.

## What is being built

One commit each.

### 1. The layout as data, and its arithmetic

`engine/core/layout.ts`: the type; `layoutBoxes(tree, size)`, every docked
id with its box; and the edits the editor makes — dock beside a region,
undock, set a fixed side's size. Pure, with tests.

BUILT. `engine/core/layout.ts`: `isLayout`, `layoutBoxes`, `dividers`
(each split's line, by its path from the root, for the editor to draw and
drag), `dock`, `undock`, `resize`, `splitAt`. A placement dropped on a
target the layout does not hold docks beside the whole screen instead.

### 2. The engine places docked actors

When a map with a `layout` is loaded, after the anchors and before its
script, each docked placement is given its box; again whenever the window
changes size, as `reanchor` does. Boxed actors only: a docked actor
without a box is placed and not sized. Engine tests; the Viewport's window
following its region is seen in the browser.

BUILT. `World.applyLayout` after `applyAnchors`, and `relayout` beside
`reanchor` in `setViewSize`. A docked placement's middle and box are its
region's, and its declared drawn size is asked again at once
(`resizeDrawn`), since a Viewport's window and every click box read that.
A docked Viewport's space is fitted as a load fits one: at least as big as
its new window, a camera at rest in the old middle moved to the new, and
settled. A layout is kept while any placement it docks is in the world. A
child, or a placement that has left, is a hole. The map's `layout` reaches
the engine unchanged: a `.map` is loaded whole, and the Main Screen's
compiled load keeps every key it does not compile.

### 3. Games dock their Viewport

`gameScreen` docks its Viewport to the whole screen, and so does a new
project. The scenarios follow.

BUILT. `gameScreen` writes `layout: {dock: 'Game'}`, and Flappy's and
Breakout's screens, written by hand, say the same; every game but tapper
and novel (still worlds) is then docked. Their boxes already matched their
screens, so nothing moved; a test compiles the starter, Flappy and
Breakout, gives each a window of another shape, and finds the Viewport
filling it. In the browser every scenario opens and plays as before.

### 4. Docking in the Screen editor

While a placed interface actor is dragged on a Screen, the places it can
dock show as zones: the four edges of the screen, and the four sides of
each docked actor. Let go in one, and it is docked there, at a fixed size
taken from its own box. Dragged away from its region, it is undocked and
floats. The inspector says whether a placement is docked, and has Undock,
for the keyboard.

### 5. Resizing a docked side

The line between two sides can be dragged; the inspector shows the fixed
side's size as a number.

### 6. The starter's HUD on its Main Screen

The scoreboard and health bar move out of the level into a bar docked
above the Viewport. The score is a game-wide value and is read as it is.
The health bar follows a placement by its name, which is only in reach
inside one map; it follows the first actor of a kind instead, the way a
camera follows (`actor to follow` takes a kind).

### 7. Documents and the browser

## Not in this phase

- A ratio side, or more than two sides to a split.
- Docking in a Map (a level), which has a camera and is not a screen.
- Previewing a screen at another window size in the editor.
