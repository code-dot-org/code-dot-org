# Plan: docking and the grid layout (SIMPLE_INTERFACE.md, phase four)

STATUS: BUILT. The working record, as the other plans are.

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
for the keyboard. (Docking itself from the keyboard, a Dock menu of the
same zones, came in PURPOSE_PLAN.md, step 5.)

BUILT. `mapEditor/docking.ts`: `fitLayout` keeps a docked placement's
stored position and box equal to its region at the screen's own size, on
every read and every commit (`MapEditor`), so the stage draws it, and a
click finds it, where the game will put it; `dockZones` (the screen's four
edges, 16 pixels deep, then the four sides of every other docked region, a
quarter of it deep), `zoneAt`, `dockSize` (its box across the side, else
48). The stage (`canDock`, on a `.screen`) shows the zone under the
pointer while a placement is dragged and, let go, docks it there or, docked
before, undocks it; the inspector says Docked, with Undock.

Found while building: the map document dropped every key it did not
know, so the first edit to a screen wrote it back without its layout and
the Viewport came undocked. Fixed before this step, on its own
(`MapDoc.layout`). In the browser: a Panel from the wizard's templates,
placed on the starter's Main Screen and dragged to its top edge, docked
there as a bar across the screen, and the game showed the bar over a
Viewport that took the rest.

### 5. Resizing a docked side

The line between two sides can be dragged; the inspector shows the fixed
side's size as a number.

BUILT. `dividers` and `fixedSideOf` (`engine/core/layout`); `dividerAt` and
`dragDivider` (`mapEditor/docking`), which measures a second fixed side
from the far edge and keeps the size within the region; the stage draws
each line, a press within six screen pixels of one grabs it before
anything under it, and the document is fitted as it moves and written
once when it is let go; `DockSizeField` in the inspector for a placement
that is a fixed side. In the browser: the starter's docked bar dragged from
48 to 95 tall, the field saying so and the game following. The starter's
Viewport camera does not follow anyone, so a shorter Viewport cuts off the
bottom of its level; step 6 has to answer that.

### 6. The starter's HUD on its Main Screen

The scoreboard and health bar move out of the level into a bar docked
above the Viewport. The score is a game-wide value and is read as it is.
The health bar follows a placement by its name, which is only in reach
inside one map; it follows the first actor of a kind instead, the way a
camera follows (`actor to follow` takes a kind).

BUILT. The engine resolves an actor-typed placement value that names no
placement in its map but names a kind (a module path) as the first actor
of that kind, anywhere in the world; looked for when the map has loaded,
and again at the top of each tick until there is one, since the level a
Viewport shows may load after the screen (`World.kindRefs`). The starter's
Main Screen is a tile taller than its level, and its HUD is a bar one tile
tall docked over the Viewport: the Health Bar fixed at its right, 96 wide,
watching `actors/player`, and the Scoreboard taking the rest. A test
compiles the starter and finds the bar in place, a whole room under it,
and the Health Bar watching the Player in the Viewport's space. In the
browser: walking right took two coins and ran into the Crawler, and the
bar at the top drained to empty while the Scoreboard said GAME OVER.

### 7. Documents and the browser

BUILT. SIMPLE_INTERFACE.md names this plan; ANCHORS_PLAN.md's "no
scaling" now points here, since a docked placement is sized as well as
placed. In the browser every scenario opened with no page errors. The
pass found the starter's Scoreboard and Health Bar listed under the Game
tab of the screen they are now on: the starter writes their files itself
rather than importing them, so they said nothing about their purpose. Both
now say `both`.

## Not in this phase

- A ratio side, or more than two sides to a split.
- Docking in a Map (a level), which has a camera and is not a screen.
- Previewing a screen at another window size in the editor.
