# The progression: a skill tree over World Lab

This document is the design of the CATALOGUE: the tiles, what each one
unlocks, and what counts as having learned it. What a learner touches — the
map, where it opens from, and how a tile becomes a level — is
[PROGRESSION_UI.md](./PROGRESSION_UI.md).

## The problem

A new World Lab project is a blank world with the whole lab behind it: thirty
stock rules, ten stock actors, a block vocabulary of several hundred, a map
editor, an animation editor, an effect editor. Everything is available and
nothing is suggested. That is the right shape for somebody who already knows
what a trait is and the wrong one for everybody else — the first question a
learner has is not "which of these thirty" but "what is any of this for".

The usual answer is a linear course: a sequence of levels, each with its
instructions and its starting project, walked front to back. It teaches, and it
costs the thing that makes this lab worth having — the learner's own game. A
level is somebody else's project with a hole in it; the game the learner
actually wants to make sits outside the sequence, waiting, and gets built from
the toolbox the course never explains.

This document designs the other shape. **The lessons are a map, and finishing
one adds something permanent to what a learner's own projects can do.** A
lesson is still a set of instructions over a starting project. What changes is
that the reward is not a checkmark: it is the Gravity rule, or the map editor,
or the `for each actor` block, added to the shelf that a New Project is built
from and kept forever.

Two things follow, and they are the load-bearing claims of the whole design.

**The unlock has to be real.** If New Project already offers everything, the
tree is decoration and every learner correctly ignores it. So a fresh project
starts small and grows. This is a cost, not only a benefit — see
[Free play](#free-play), which is the answer for everybody the gating would
merely annoy.

**The lesson has to be reachable from the thing it taught.** A learner who
unlocked Collection four weeks ago and now cannot remember what
`Can Be Collected` does should find the lesson from the trait, not from the
map. Every unlockable carries the id of the tile that grants it, and every
place one is offered — the import dialog's rows, a rule's toolbox category, the
trait dropdown — can therefore link back to its lesson.

## Vocabulary

| Term       | Meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| **tile**   | one lesson: instructions, a starting project, an unlock, and a check  |
| **region** | a named, coloured group of tiles that share a theme                   |
| **edge**   | a prerequisite, drawn on the side two neighbouring tiles share        |
| **shelf**  | everything a learner has unlocked; what New Project is assembled from |
| **check**  | the evidence that a tile was learned, not merely visited              |

## The map

### Geometry

Pointy-top hexagons on axial coordinates `(q, r)`, six neighbours each:
`(+1,0) (+1,-1) (0,-1) (-1,0) (-1,+1) (0,+1)`. Screen position is the standard
conversion, `x = s·√3·(q + r/2)`, `y = s·(3/2)·r`, for tile size `s`.

The map is a SET OF PLACED TILES, not a filled hexagon. Holes are allowed and
are what makes a region read as a shape rather than as a slice of a pie.

### Edges are the design; coordinates are a rendering of it

A tile's `requires` list names other tiles, and **every tile it names must be
one of its six neighbours**. That constraint is what makes the picture
trustworthy: a learner reading the map can see what stands between them and a
tile they want, without a legend.

Two neighbours with no prerequisite between them are drawn adjacent with no
edge. Adjacency is therefore cheap and an edge is deliberate, which is what
lets a region be a contiguous blob without every tile in it being a gate.

A test validates the authored layout: every `requires` entry is a neighbour,
every tile is reachable from Origin, every region is contiguous, and no two
tiles share a coordinate. Coordinates are authored data like everything else,
but they cannot contradict the edges. See
`src/progression/__tests__/layout.test.ts`, which is that test, and
`src/progression/catalogue.ts`, whose header states the slot scheme the
coordinates are authored in.

One region is exempt from contiguity, and the exemption is geometric rather
than editorial — see [Making](#the-rim-making-six-outposts).

### Opening a tile

**All of a tile's inbound edges must be complete.** Not any — all. That is what
makes the map's shape mean something, and it is what lets a genre region sit
between the two foundations it draws on and require both.

The authoring consequence has to be stated because it is easy to get wrong: a
tile with two inbound edges is a GATE, and a genre's entrance is exactly that —
one tile, requiring one lesson from each of the two foundations it lies
between. A gate is only fair if both of its prerequisites are SHALLOW, so:
**neither half of a gate may be more than two tiles into its own region.**

That is what keeps the map from becoming the linear course it exists to avoid.
A genre gated behind two foundations swept to the end would have to be reached
the long way whatever a learner wanted to build; gated behind the second tile of
each, it is three lessons from Origin. The layout test enforces the depth.

### Three states, none of them hidden

| State    | Meaning                       | Shown as                                   |
| -------- | ----------------------------- | ------------------------------------------ |
| **done** | the check passed              | filled in the region colour, with a stamp  |
| **open** | every inbound edge is done    | outlined in the region colour, title shown |
| **shut** | some inbound edge is not done | greyed, title shown, padlock, edges dashed |

There is no fog of war. The map is a menu of ambitions — a learner who wants to
make a platformer should be able to see the Platformer region on their first
day and read the path to it. Hiding what has not been earned would remove the
only reason to walk any particular way.

### Regions and colour

Fourteen regions is more than a palette can carry as fourteen unrelated hues,
and it does not have to. The six foundations take six hues fifty degrees apart,
in the order they sit on the map, and **a genre takes the blend of the two it
lies between** — the short way round the wheel, which is the way the map goes.
So a wedge's colour says which two concepts it was made from, and twelve of the
fourteen regions are decided by six numbers (`regionHue`, `src/progression/regions.ts`).

Making is the exception and is left neutral: it is about authoring, and it
belongs to no theme.

Colour is never the only carrier of state. Done is a stamp, shut is a padlock,
and region membership is also stated in the tile's own label in the list view.

### Layout

A pointy-top hexagon has vertices at 12 and 6 o'clock and EDGES facing 1, 3, 5,
7, 9 and 11 — so there is no "north", and the six directions a region can grow
along are the odd hours. The foundations take those; the genres take the wedges
between them.

```
Clockwise, by angle:

   1  Input        foundation   (north-east)
   2  Platformer   genre — Input + Motion
   3  Motion       foundation   (east)
   4  Arcade       genre — Motion + Logic
   5  Logic        foundation   (south-east)
   6  Puzzle       genre — Logic + Memory
   7  Memory       foundation   (south-west)
   8  Story        genre — Memory + Look
   9  Look         foundation   (west)
  10  Adventure    genre — Look + Place
  11  Place        foundation   (north-west)
  12  Simulation   genre — Place + Input

By radius: Origin at the centre; each foundation a spike running out to ring 3
or 4 with two shoulders leaning into the wedge beside it; each genre five cells
in the middle of a wedge, from ring 3 to ring 5; and one Making tile past each
genre's capstone, at ring 6. Sixty-seven tiles.
```

That is an angle, not a screenshot — the tiles inside a region are placed by
hand and a region is whatever shape they make. What it says:

- **Origin**, one tile, at `(0,0)`.
- **Six foundations** around it, in circle order
  **Input → Motion → Logic → Memory → Look → Place**, four to six tiles each.
  These are the programming concepts.
- **Six genres** in the wedges between adjacent foundations, five tiles each:
  a gate, two branches out of it, one tile beyond the first branch, and a
  capstone that needs both branches. Each takes its two flanking foundations as
  its entrance:

  | Genre          | Between       | What it is                               |
  | -------------- | ------------- | ---------------------------------------- |
  | **Platformer** | Input, Motion | gravity, jump, hazards, a level to cross |
  | **Arcade**     | Motion, Logic | a ball, a paddle, bullets, waves         |
  | **Puzzle**     | Logic, Memory | a grid, crates, a win condition          |
  | **Story**      | Memory, Look  | text, a script, a branching choice       |
  | **Adventure**  | Look, Place   | a big map, rooms, keys, an errand        |
  | **Simulation** | Place, Input  | many agents, steering, tuning            |

- **Making**, six tiles, one past each genre's capstone — see below.

### The rim, Making: six outposts

Making was designed as a rim: one region wrapping the outside, entered from any
genre's capstone. It cannot be one. Two capstones are five steps apart, so a
region small enough to be six lessons cannot touch even three of them, and a
region large enough to touch all six is thirty tiles of authoring lessons that
do not exist.

So Making is **six separate tiles, one directly beyond each genre's capstone**,
and it is the one region whose tiles do not touch each other. What that costs is
a shape; what it buys is better than the shape was:

**Each outpost is the authoring lesson its own genre motivates.** A platformer
makes somebody want to read the Gravity rule. An arcade game makes them want to
change a number in one. A simulation makes them want a trait of their own. So
which authoring lesson a learner meets first is decided by which game they
finished, and that is a feature rather than an accident — the lesson arrives
when the game has already asked the question.

### A lesson may hand you what you have not unlocked

Every genre needs the arrow keys, and the arrow keys live in Input, which is
three wedges from Adventure. Rather than smear a prerequisite across the map,
the rule is:

**The shelf governs what a NEW, BLANK project offers. It does not govern what a
lesson's starting project contains.**

So Adventure's first tile can hand the learner a working walker, a camera and a
map and be about none of them. An edge means READINESS — you will understand
this tile — and never possession.

## What a tile is

```ts
interface Tile {
  id: string; // 'motion/gravity' — stable forever, see below
  region: RegionId;
  at: [q: number, r: number];
  title: string;
  teaches: string; // one line: the concept, not the feature
  requires: TileId[]; // all must be done; all must be neighbours
  project: ProjectSpec; // the starting project, as `fixtures/` writes one
  instructions: string; // markdown
  unlocks: Unlock[];
  check: Check;
}

type Unlock =
  | {kind: 'rule'; id: StockRuleId} // 'gravity' — the import shelf row
  | {kind: 'actor'; id: StockActorId} // 'coin'
  | {kind: 'block'; type: string} // 'world_for_each'
  | {kind: 'category'; name: string} // a whole toolbox drawer
  | {kind: 'asset'; id: string} // a sprite, animation, background
  | {kind: 'editor'; id: EditorId} // map, animation, effect, image
  | {kind: 'template'; id: string}; // a New Project starting point
```

**Tile ids are permanent.** A learner's progress is a set of tile ids; renaming
one silently un-completes it. Splitting a tile in two keeps the old id on
whichever half is closest to the original lesson, and the other half arrives
already open for anybody who had the old one. This is a migration concern from
the first learner onward, so it is written down before there is a first
learner.

`ProjectSpec` is the shape `src/fixtures/` already uses; a tile's starting
project is authored exactly the way a scenario is, and the scenario catalogue
is where several of them already live.

## Where the map lives

A page in the host, not a panel inside the editing surface: a route beside the
project routes, reachable from a button in the lab header and from the studio
course page. It is rendered as SVG.

Three notes on the rendering, because each has a wrong answer that looks right:

**A region outline is the union boundary of its tiles.** Emit only the hex
sides that are not shared with another tile of the same region. Drawing an
outline per tile gives a honeycomb; drawing a convex hull gives a shape the
tiles do not fill.

**An edge is a bar across the shared side**, not a line between centres. Lines
between centres are invisible under the tiles at any tile size that fits a
title.

**The map is also a list.** An SVG of hexagons is unusable by keyboard and
opaque to a screen reader, and a progression a blind student cannot navigate is
not a progression. So:

- a parallel list view (region → tiles → state → what it unlocks) that is not a
  fallback but a first-class way to use the page;
- in the map view, each tile is a tab stop in reading order, with the six
  neighbours on the arrow keys and an announcement of what moving landed on;
- state announced in text: "Gravity, Motion, done", "Jumping, Platformer,
  locked, needs Gravity".

See the `accessibility` skill for the standard this is held to (WCAG 2.2 AA).

## Revisiting a lesson

Every `Unlock` implies a back-reference: the tile that grants it. Build the
reverse index once from the catalogue, and then:

- the rule import dialog's row gains a "how this works" link beside its
  description (and a LOCKED row names the tile that would grant it);
- a rule's toolbox category header gains the same;
- the `use trait` eye already opens the file behind a trait
  (`showRuleSource`); the lesson link sits beside it, because "show me the
  code" and "show me the lesson" are the two different things a stuck learner
  wants.

Opening a lesson this way opens a **reader**: the instructions and a finished
example, side by side, in a project of its own. It does not touch the project
the learner came from, and it does not silently restart the tile. "Do it again"
is a separate button that opens the lesson's starting project fresh.

## The check: what "learned it" means

Nothing here is graded and nothing is submitted. A check exists to answer one
question — did this tile happen? — and its only effect is to complete the tile
and add its unlock to the shelf.

There are three kinds of evidence, in descending order of what they are worth.

### 1. Outcome — the game reached a state

"The player's `y` decreased by more than 100 pixels within half a second of the
up key going down." "No coin remains." "The score reached 5."

This is the only kind that survives a learner solving the lesson their own way,
which is the whole reason to have a lab and not a worksheet. Prefer it.

### 2. Trace — something happened

"`Collection#collected` fired at least three times." "The handler for
`key goes down` ran." Cheaper to author than an outcome, still behavioural, and
the right answer when the lesson's point is that an event exists.

### 3. Shape — the workspace contains something

"There is an `each frame` under a `define drawing`." "Some actor carries the
`Jumps` trait."

The weakest, because it passes for a program that has never run. It is the only
thing available when the lesson's product is a FILE rather than a behaviour —
most of the Making rim is like this — and it should not be used anywhere else.

### Rules for authoring a check

**Write down the false pass.** Every check has a program that satisfies it
without learning anything; the tile's data records that program in one line. A
check whose false pass is "type the answer into a `set position`" is a check
that has to become an outcome check.

**A check must be able to fail.** The fixture play-tests hold to this already —
`sokobanPlays.test.tsx` asserts `not.toContain('Solved!')` before the last
crate lands, and that negative is what makes the positive mean anything. Same
discipline here.

**Runs are deterministic.** A check runs the project against a **scripted input
trace** — "hold right for one second, press space, wait two seconds" — on a
fixed clock, so the same project gives the same answer every time and a slow
machine does not fail a correct program.

This is not a new machine. It is `src/__tests__/scenariosPlay.test.tsx` and
`sokobanPlays.test.tsx` — press keys, step the clock, assert positions, assert
what the console said — moved out of vitest and into the product. Building the
checks is mostly the work of giving that harness a home in the lab and a
message on the sandbox channel; see [What is missing](#what-is-missing).

## The catalogue

Each region below lists its tiles in the order they are meant to be met. Every
tile's starting project is small and complete: it runs before the learner
touches it, and the lesson is a change to something that already works.

Read the columns as: **The lesson** is what the learner is handed and what they
are asked to do; **Unlocks** is what is added to the shelf; **Check** is the
evidence, with its kind marked `[o]` outcome, `[t]` trace, `[s]` shape.

### Origin

| Tile                 | The lesson                                                                                               | Unlocks                                                              | Check                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `origin/first-world` | A world with one actor in it, and a Run button. Add a second actor, give it a picture, put it somewhere. | Actor and World basics; the sprite shelf; the "empty world" template | `[o]` the built world holds two actors, both with a sprite |

### Foundation: Input

The first thing anybody wants is for something to move when they press a key.

| Tile              | The lesson                                                                                                              | Unlocks                                        | Check                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `input/arrows`    | A player that ignores you. Give it "Moves Across", then "Moves Down", and change its speed.                             | Arrow Keys rule                                | `[o]` with right held for 1s the actor's x rises; with down held its y rises                       |
| `input/press`     | A key HELD is not a key PRESSED. Make a lamp toggle once per press, not sixty times a second.                           | Input rule; `when key goes down`               | `[o]` a 1s hold toggles exactly once                                                               |
| `input/mouse`     | The pointer is a place, and a click is an event. Move a crosshair to the pointer; make an actor react to being clicked. | Mouse rule; `Can Be Clicked`; `mouse position` | `[o]` after a scripted click on the actor its state changed; the crosshair tracks                  |
| `input/two-hands` | Two readings of the same four keys: walking, and steering a ship. Swap one for the other and feel the difference.       | Arrow Drive rule                               | `[t]` both rules present across two saved states, or `[s]` the ship carries `Driven by Arrow Keys` |

### Foundation: Motion

| Tile             | The lesson                                                                                                   | Unlocks                              | Check                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| `motion/speed`   | Setting a position every frame is not how things move. Give the actor a velocity once and let it go.         | Physics rule; `Can Move`             | `[o]` position changes with no per-frame block in the workspace         |
| `motion/units`   | A speed is units per second and a unit is 100 pixels. Make an actor cross the screen in exactly two seconds. | `pixels per unit`; the vector blocks | `[o]` the crossing takes 2s ± 0.2s on the scripted clock                |
| `motion/force`   | A shove changes a speed; a speed changes a place. Push the actor with a force and watch the two steps.       | `apply force`                        | `[o]` velocity after the shove is within tolerance of the expected      |
| `motion/drag`    | Nothing in space stops. Add Drag and turn a spaceship into a car.                                            | Drag rule                            | `[o]` speed decays below a tenth within the scripted window             |
| `motion/gravity` | Down. Land on the ground, hear about starting and stopping falling.                                          | Gravity rule; `Acts as Ground`       | `[o]` y rises then holds at the ground; `[t]` "stops falling" fired     |
| `motion/tween`   | Movement described once and played wherever: a door that opens, a platform that slides.                      | `define tween`, `play tween`         | `[o]` the actor is at the tween's end position when it reports finished |

### Foundation: Logic

| Tile              | The lesson                                                                                                            | Unlocks                            | Check                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `logic/if`        | A question with two answers. Make an actor change colour only when it is past the middle of the screen.               | `if`, `compare`                    | `[o]` two scripted runs, two different outcomes                     |
| `logic/and-or`    | Two questions at once, and the difference between "and" and "or". A door that opens only when both switches are down. | `and`, `or`, `not`                 | `[o]` the door opens on both and stays shut on either               |
| `logic/collision` | Touching is a question the world answers for you. React when the player touches a spike.                              | Collisions rule; Solid Bodies rule | `[t]` the collision handler ran; `[o]` the player stops at the wall |
| `logic/kinds`     | What a thing IS, asked at runtime: `is a`, `has trait`. One handler that treats a coin and a spike differently.       | `is a`, `has trait`                | `[o]` a coin and a spike produce different results from one handler |

### Foundation: Memory

| Tile                 | The lesson                                                                                                           | Unlocks                                             | Check                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| `memory/variable`    | A box that holds a number while a handler runs. Work out a distance once and use it twice.                           | Variables                                           | `[s]` a variable is read at least twice; `[o]` the behaviour is right       |
| `memory/world-state` | State the whole world shares: two Labels that disagree about how many lives are left, and one number they both read. | a world property; Writing rule; Label actor; `join` | `[o]` both Labels say the same thing; `[s]` a declaration, and a read of it |
| `memory/actor-state` | State that belongs to an actor and not to the world: two Lamps reading the world's one number, each given its own.   | `define property` in an `.actor`                    | `[o]` the two Lamps say different things; `[s]` the Lamp declares it        |
| `memory/score`       | Somebody already wrote the counter. Swap the hand-rolled one for Scoring and get "the target is reached" free.       | Scoring rule                                        | `[t]` one console line, saying 5, after six clicks                          |
| `memory/many`        | All of them at once: `for each actor`, and the lists you make by filtering. Turn every coin gold.                    | `for each`, actor-list blocks, `count of kind`      | `[o]` all six coins changed, with one loop in the workspace                 |

### Foundation: Look

| Tile              | The lesson                                                                                      | Unlocks                                   | Check                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| `look/sprite`     | A picture is a file. Import one from the library, then paint your own and use that.             | image editor; the sprite library          | `[o]` the actor draws a sprite the project holds                 |
| `look/drawing`    | An actor with no picture paints itself: two bars, both full, and one that should not be.        | Drawing drawer; Progress Bar; a colour    | `[o]` the two Bars draw different pictures                       |
| `look/background` | The backdrop is not an actor. Add one, tile it, slide it, and watch the actors stay put.        | `set background`, repeat, offset, colour  | `[o]` the world's backdrop is set, tiles, and has been slid      |
| `look/animation`  | An animation is a file of rectangles cut out of one image. Give a sliding Hero a walk cycle.    | animation editor; `play animation`        | `[o]` the frame changes across half a second                     |
| `look/effect`     | A shader is a description of how to paint. One file, on one actor and then over the whole view. | effect editor; `add effect` (actor/world) | `[o]` the Coin carries one, the Hero does not, and the view does |

### Foundation: Place

| Tile                | The lesson                                                                                 | Unlocks                                 | Check                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------- |
| `place/position`    | Where things are: three markers in a heap, and the numbers that separate them.             | `set position`, random place, a number  | `[o]` the three are apart, one of them in the middle                       |
| `place/edges`       | What happens at a boundary is a choice. Stop across, come round downwards.                 | Boundaries; Screen Wrap                 | `[o]` never leaves across, and wraps down                                  |
| `place/map`         | A level is data: an arrangement painted on a grid, held by the block that places it.       | map editor; `create in map`; `load map` | `[o]`+`[s]` a dozen tiles, in two rows, and the ARRANGEMENT holds them     |
| `place/camera`      | A room three screens wide and a view showing the first. Follow, and stop at the walls.     | Camera, Camera Follow, Camera Confined  | `[o]` the view travels and never passes the end of the room                |
| `place/camera-feel` | Correct and unpleasant: slack for small movements, and a moment to catch up on large ones. | Camera Ease; Camera Deadzone            | `[o]` a short step moves nothing; a long walk is still settling afterwards |
| `place/layers`      | Drawing order is declared, and some things should not move with the view at all.           | `define layer`, within, fixed, parallax | `[s]` the Score's layer is fixed, the Hills' moves less than the camera    |

### Genre: Platformer — entered from Input and Motion

| Tile                 | The lesson                                                                                     | Unlocks                     | Check                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `platformer/jump`    | A jump written by hand works in mid-air and works forever. Make it one that knows what it is.  | Jumping rule                | `[o]` three presses spend exactly two jumps                              |
| `platformer/ground`  | Something can be solid and still be going somewhere. **No lesson yet — see "Carrying" below.** | Patrol rule                 | `[o]` the player standing still travels with the platform                |
| `platformer/pickups` | A Hero that walks through three coins. Two abilities, one on each side, and it takes them.     | Collection; Coin; coinSpin  | `[o]` three taken, three counted, none left in the world                 |
| `platformer/hazards` | A spike that does not mind. What can be damaged and what damages are two different things.     | Health rule; Health Bar     | `[t]` leaning costs health more than once, never more than once a sample |
| `platformer/level`   | A start, a route, an end — and the state that says which you are in.                           | platformer template; Player | `[o]` a run reaches the goal and wins; a run into a spike does not       |

### Genre: Arcade — entered from Motion and Logic

| Tile            | The lesson                                                                                      | Unlocks                    | Check                                                             |
| --------------- | ----------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `arcade/bounce` | A ball that stops dead at the wall. What a collision does to a speed is the surface's business. | `bounciness`               | `[o]` as fast at the end of a long run as at the start            |
| `arcade/paddle` | A paddle kept on screen by hand, with half of it hanging off.                                   | `view size`                | `[o]` stops half its own width from the wall, whatever that is    |
| `arcade/shoot`  | A bullet per press, and none of them ever leaves.                                               | Shooting; Expires          | `[o]` ten presses make fewer than ten, and the world empties      |
| `arcade/bricks` | Counting what is left is how a game knows it is over.                                           | `clear world`              | `[o]` ends on the last brick and not the second to last           |
| `arcade/waves`  | A timer belongs to an actor, and the interval can be a value like any other.                    | Time rule; arcade template | `[o]` the gap between spawns is shorter at the end than the start |

### Genre: Puzzle — entered from Logic and Memory

| Tile           | The lesson                                                          | Unlocks                                     | Check                                                             |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `puzzle/grid`  | A player that slides between the tiles and walks through the walls. | Grid rule; `Fills a Tile`                   | `[o]` four scripted presses land the player exactly four tiles on |
| `puzzle/push`  | A crate that stops you dead. Change one word and push it.           | `Can Be Pushed`                             | `[o]` a crate moves one tile and stops at a wall                  |
| `puzzle/goal`  | Counting what is not yet done, and saying so.                       | **Goals rule (new)**                        | `[o]` the win fires on the last crate and not before              |
| `puzzle/turns` | Everybody moves, then the world moves.                              | **Turns rule (new)**                        | `[o]` an enemy steps exactly once per player step                 |
| `puzzle/undo`  | Taking it back — which means the world has a history.               | **History rule (new)**; the puzzle template | `[o]` undo restores the previous positions exactly                |

### Genre: Story — entered from Memory and Look

| Tile           | The lesson                                                                               | Unlocks                                         | Check                                                       |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `story/text`   | Words on the screen, in a box, wrapped.                                                  | Writing rule; Speech Box, Label actors          | `[o]` the text drawn is the text set                        |
| `story/reveal` | A few letters at a time, and a click that says "all of it now".                          | Reveals Text rule                               | `[o]` the line is partial at 0.2s and whole after the click |
| `story/script` | A conversation is a place in a list. Each line is an event; what a line MEANS is yours.  | Conversation rule                               | `[t]` the line event fired once per advance                 |
| `story/choice` | A question that sends the talk somewhere else, and a variable that remembers the answer. | `go to line`                                    | `[o]` two scripted runs reach two different endings         |
| `story/scene`  | Portrait, backdrop, music: the same script, staged.                                      | Portrait actor; `set music`; the story template | `[o]` the portrait and backdrop change on the right lines   |

### Genre: Adventure — entered from Look and Place

| Tile               | The lesson                                                       | Unlocks                               | Check                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `adventure/world`  | A map bigger than the screen, and a camera that keeps up.        | (Camera family, if not held)          | `[o]` the player leaves the first screen and the view follows          |
| `adventure/rooms`  | More than one map, and the door between them.                    | **Scenes rule (new)**                 | `[o]` walking into the door loads the second map and places the player |
| `adventure/keys`   | A door that needs something you are carrying.                    | Collection; **Inventory rule (new)**  | `[o]` the door refuses without the key and opens with it               |
| `adventure/people` | A villager who walks her beat and leaves her own name behind.    | Patrol, Attachment rules              | `[o]` the NPC patrols and its conversation starts on contact           |
| `adventure/errand` | Four things to find, and a bar that has no idea how it is going. | Progress rule; the adventure template | `[o]` progress reaches 1 exactly when the last item is found           |

### Genre: Simulation — entered from Place and Input

| Tile             | The lesson                                                                         | Unlocks                                | Check                                                             |
| ---------------- | ---------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `sim/many`       | A hundred of something. Spawn them, walk them, and find out what a hundred costs.  | `add actor` at runtime; `random place` | `[o]` the world holds 100 and the frame time stays under budget   |
| `sim/steering`   | Chase, and flee, and the distance question both are asked with.                    | Steering rule                          | `[o]` the chaser closes the distance; the fleer opens it          |
| `sim/neighbours` | Everything near me — the filter that every flock, swarm and crowd is written with. | **`actors within ⟨d⟩ of ⟨a⟩` (new)**   | `[o]` the count matches a hand-computed one for a fixed layout    |
| `sim/emergent`   | Three small rules and behaviour nobody wrote.                                      | `define behavior`                      | `[o]` the flock's average heading converges over the scripted run |
| `sim/dials`      | The properties are the experiment. Change one while it runs and watch.             | the simulation template                | `[o]` the live-apply path fires without a restart                 |

### The rim: Making

One tile past each genre's capstone, and each is the authoring lesson that genre
motivates ([above](#the-rim-making-six-outposts)). This is where a learner stops
using rules and starts writing them, and it is the reason the lab has a rule
language at all.

| Tile              | Past                                                                                      | The lesson                                                                                           | Unlocks                     | Check                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| `making/read`     | Platformer                                                                                | Open the file behind a trait you have used twenty times. Find the line that makes you fall.          | the Rule category           | `[s]` the rule file was opened                                      |
| `making/change`   | A guard on a long slow beat, and the number that says how long — not in your world.       | Change a number in it, and meet the fact that catches everybody: your project has its OWN copy.      | `each frame` in a `.rule`   | `[o]` the behaviour differs from stock in the way the edit predicts |
| `making/property` | A wind that blows everything at the same speed, because the speed is typed into the rule. | Add a property to a rule and watch two blocks appear in its category.                                | `define event`              | `[o]` the property is on the built actor and its blocks are used    |
| `making/block`    | Story                                                                                     | Your own vocabulary: the thing your script said three times, with the parts that vary as parameters. | `define block`, `return`    | `[o]` called from two places with different arguments               |
| `making/behavior` | Adventure                                                                                 | Shared work without the ceremony of a rule.                                                          | `define behavior`           | `[o]` two kinds of actor run one behavior                           |
| `making/trait`    | One weather and two kinds of thing, drifting the same way from one ability.               | One rule, two traits, and the actors that elect one each.                                            | `define trait`, `use trait` | `[o]` two kinds carry different traits from one rule                |

`making/shelf` — putting a rule you wrote on your own shelf, so your next New
Project offers it — was the seventh of these and is not a tile. It is not a
lesson about authoring; it is the shelf feature itself, and it belongs in
[what is missing](#lab-and-host-work) rather than in a wedge.

## What is missing

The catalogue above was written without regard for what exists, which was the
point of the exercise. Here is what it asks for and the lab has not got.

### Lab and host work

1. **The shelf.** A per-learner set of unlocked ids, and a New Project
   assembled from it. Stored against the account, not the project, so it
   follows the learner between courses. A course can pre-grant.
2. **Allowlist gating of the toolbox.** Today `hiddenToolboxCategories` is a
   per-level DENYLIST at category granularity (`blockly/toolboxFilter.ts`). The
   shelf needs the other direction and finer grain: an allowlist of block types
   as well as categories.
3. **Locked rows, not absent rows.** The rule import dialog, the actor shelf,
   the sprite/animation/effect libraries should show what is not yet unlocked,
   greyed, naming the tile that grants it. An absent row teaches nothing.
4. **Lesson back-links** on those rows, on toolbox category headers, and beside
   the `use trait` eye.
5. **The tree page** and its progress store.
6. **An assertion channel on the sandbox.** The lab↔sandbox protocol is already
   a typed two-way message set (`src/runtime/messages.ts` — `ToPreview`,
   `FromPreview`, with placement requests and thumbnails already going both
   ways), so this is an extension rather than a new mechanism. It needs: a
   scripted input trace sent down, a fixed-step clock, and probe results sent
   back (positions, property values, event counts, console lines).
7. **A personal shelf.** Somewhere a learner's OWN rules go, so a rule they
   wrote is offered by their next New Project the way a stock one is. This was
   a tile (`making/shelf`) until it was noticed that it is not a lesson.
8. <a id="world-actions-in-setup"></a>**World actions in a world's setup.** A
   `define world` body is handed a **builder**; a handler is handed the world.
   They share enough vocabulary to look interchangeable — a world property's
   `set` compiles to `world.set(…)` and the builder has one — but a rule's
   world action compiles to `world.act(…)` and the builder has not, so
   `add ⟨1⟩ to the score` written in a world's setup dies at run time with
   `world.act is not a function`. Nothing warns: `worldContextExtension` asks
   whether `world` is bound, and it is bound, to the wrong thing. Found by
   writing `memory/score`, which now counts clicks in a handler for this
   reason and not for a teaching one.
9. <a id="own-property-scope"></a>**A world-defined actor's own property, from
   the world.** An actor a world defines for itself may declare a property, and
   its declaration is a `const` inside the definition's own block scope
   (`domainBlocks`, `world_actor`: "a declaration written anywhere else is a
   name its own drawing cannot reach"). The get and set blocks are offered
   project-wide all the same, so `set ⟨id⟩ of ⟨this actor⟩` written in the
   world's body is a block the palette hands over and the module throws on:
   `ReferenceError: IdProperty is not defined`, as the project loads. Either the
   declaration is hoisted where the whole file can see it, or the blocks stop
   being offered outside the definition. Found by trying to make
   `memory/actor-state` a one-file lesson, which is why it is the one lesson
   with two files.
10. <a id="free-play"></a>**Free play.** A project type that starts with
    everything, for teachers, for experienced makers, and for the learner who
    has had enough of the tree. The gating is a teaching device and it must be
    possible to say no to it — per account and per course. Without this, the
    design makes the lab worse for everybody who did not need it.

### Rules the catalogue wants and the library lacks

The stock library is thirty rules (`src/rules/stock/index.ts`) and it covers
most of this. These are the holes, each named by the tile that found it.

| Rule                  | Wanted by             | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goals**             | every genre capstone  | Won, lost, over, restart. Every fixture writes its own end state, and the phrase "what winning looks like is the project's to say" appears in Scoring's own description. There is still a shape common to all of them.                                                                                                                                                                                                                                                                                                  |
| **Scenes**            | `adventure/rooms`     | Advance to another map, carrying what should carry. `clear world` + `load map` are the pieces; nothing holds the idea.                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Turns**             | `puzzle/turns`        | A turn order: the player acts, then everybody else acts once.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **History**           | `puzzle/undo`         | A stack of world states and a step back. The hardest of these, and the most valuable — undo is what makes a puzzle game forgiving.                                                                                                                                                                                                                                                                                                                                                                                      |
| **Inventory**         | `adventure/keys`      | Carrying a named thing, spending it. Collection counts what was picked up; this is about consuming one.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Path**              | adventure/sim enemies | Step toward a target around walls. Steering is continuous and walks into corners.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Spawner**           | `arcade/waves`        | Time + `add actor` expresses it; a named rule makes it one unlock and one lesson instead of five blocks.                                                                                                                                                                                                                                                                                                                                                                                                                |
| **One-way platforms** | `platformer/ground`   | Solid from above, passable from below. A trait on Solid Bodies, probably, not a rule.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Carrying**          | `platformer/ground`   | An actor standing on a moving solid does not move with it: Solid Bodies pushes overlapping bodies apart, and a platform sliding sideways under a standing actor overlaps nothing. Traced — a Platform elected `Patrols Across` walks its beat and the Hero stays exactly where it was. Attachment is the nearest thing and is not it: it pins an actor at a fixed offset, so a rider could not walk. Until this exists, `platformer/ground` has no lesson, because its whole payoff is the player going with the floor. |

### Blocks the concept half wants and the vocabulary lacks

These are more serious than the rules, because a missing rule is a lesson the
learner writes themselves and a missing block is a concept that cannot be
taught here at all.

**Lists of values.** There is no general list. `world_for_each` walks a list of
ACTORS, and the filter/order/take blocks all hand back actors
(`specs/ACTOR_LISTS.md`); Blockly's `lists_*` category is deliberately not
registered. So the Memory region can teach a variable and cannot teach an
array: no list of high scores, no list of dialogue lines the learner wrote, no
inventory as a list, no `random from a list`. **This is the biggest single gap
in the progression and the one to decide about first.**

**A grid, or a list of lists.** `sim/emergent` and any tile-state puzzle wants
a 2D store. Follows the list decision.

**Own blocks outside a rule.** `define block` lives in the Rule category and a
`.behavior` file (`domainBlocks.ts`, `TOOLBOX_HEAD`). A learner's first
function should not require authoring a rule. Proposal: allow `define block` in
an `.actor` as that kind's private function; the Making rim then teaches
sharing one, not having one.

**`repeat until` / `while`.** Deliberately absent, and it should stay absent: a
loop that spans frames is not a loop in a world that ticks, and the honest
answer is a state machine. Recorded here so the decision is not re-litigated —
`memory/many` teaches iteration over a collection, and `logic/if` plus a
property teaches the rest.

**Number formatting.** A score drawn as `00042`, a timer as `1:07`. `join` and
`length` are there; nothing pads or formats.

**`mouse position`, somewhere an actor can find it.** The block exists and works
anywhere — it is REGISTERED globally and only LISTED in the Engine drawer, which
a `.rule` file gets and an `.actor` does not. So "the pointer is a place you can
ask for" is a true sentence a learner cannot act on: they can be told a click
landed on them (the Mouse rule's `Can Be Clicked`) and they cannot ask where the
pointer is. `input/mouse` was written to teach both and now teaches the half
that is reachable. The fix is small — the Mouse rule's category should list the
block, the way Steering's category lists `distance from ⟨a⟩ to ⟨b⟩` — and it is
a decision about that rule rather than something a lesson may do for itself.

## Milestones

Ordered so that each one is worth having on its own, and so that the expensive
piece (the assertion channel) is not on the path to finding out whether the
idea works.

1. **The catalogue as data.** Tile schema, region list, the tiles above as a
   TypeScript module, and the layout validator test (neighbours, reachability,
   contiguity, no collisions). No UI. This is where the design either survives
   contact with real coordinates or does not.
2. **The map, read-only.** The page, the SVG, the region outlines, the list
   view, the keyboard model — with every tile shown as open. Proves the picture
   reads before anything depends on it.
3. ~~**The shelf and New Project.**~~ **Half done** — `progression/shelf.ts`,
   and the two import libraries. A learner cannot take Gravity into their own
   game until they have done the Gravity lesson.

   **The libraries gate what a project may TAKE. The toolbox gates what its
   editor OFFERS**, and the second was missing for a while: the first lesson
   opened with twelve drawers and a hundred and fifty-seven blocks while its own
   detail pane said it unlocked the Actor drawer. Gated, it opens with six
   drawers and twelve blocks.

   **Per block, not per drawer.** A drawer becomes EARNED the moment the
   catalogue grants anything in it, and then shows only what has been granted —
   so Origin's Actor drawer holds `define actor`, `use trait` and `this actor`
   rather than all forty-two. Nothing is listed anywhere as gated: the set is
   derived from what the tiles say they unlock, so a drawer no lesson has been
   written for stays open, and gating grows as the curriculum does rather than
   having to be complete on the first day.

   **A lesson offers what it teaches.** `logic/if` tells the learner to add an
   `if`, and finishing it is what grants Logic — so a lesson's toolbox is the
   shelf PLUS that tile's own unlocks. Without that a gated lesson is a trap
   rather than a gate, and `__tests__/toolboxShelf.test.ts` holds a table of the
   blocks each lesson's instructions send somebody to find and insists every one
   is there.

   **A rule's blocks are never gated.** A project that holds Gravity has
   Gravity's blocks whether or not the learner earned them — an edge means
   readiness, not possession, and a lesson may hand you anything. A tile may
   still SAY it unlocks one (`arcade/bounce` unlocks "the bounciness property",
   which reads well and is true); it simply does not make that drawer earned.
   Space and Appearance are the exception: they are the engine's own two rules,
   in every project there has ever been, and `set position` is core vocabulary
   rather than a mechanic somebody opted into.

   **A lesson's world says as little as it can.** The early lessons all carried
   `set size of map to x 12 y 9 tiles`, put there out of a half-remembered
   warning that a world arranging its own actors has no bounds. It has bounds —
   the viewport's, ten tiles each way. What it lacks is bounds OF ITS OWN, which
   only a camera or a boundary rule would notice, and no early lesson has one.
   So the block is gone from every lesson and granted by `place/map`, where a
   world bigger than the view is the actual subject. The first lesson's world is
   now three blocks: a world, an actor, a place to put it.

   **Only Origin is on every path.** The map is a DAG, and a drawer earned
   mid-branch strands the branches that do not pass through it — Variables
   behind Memory would leave a Simulation learner without it.

   The answer is not to move everything general to Origin, which puts fourteen
   Math blocks in front of somebody who has met three blocks in total. It is to
   separate the two things a lesson does with a block: a tile **grants** what it
   TEACHES and **offers** what it merely needs on the bench. `memory/variable`
   is about naming a value, and naming one needs a number to type — so it offers
   `math number` and grants Variables. An offer is on hand while the lesson is
   open and is not kept, does not appear under "Unlocks", and is not in the
   reverse index, so two lessons may offer the same block where only one may
   ever grant it.

   That is what lets the general vocabulary stay branch-local without stranding
   anybody: Console is Origin's (both early branches print within two lessons),
   and Math, Text, Colour and Sound belong to the region that teaches each.

   **A locked row is shown, not removed**, with the lesson that grants it named
   beside it: "Unlocked by: Down". A row that has been taken away teaches
   nothing; a row that says what would unlock it is a reason to go and do that
   lesson.

   **It is off unless a level asks for it** (`levelData.gateShelf`). That is not
   timidity — a lab that quietly started refusing rules to every teacher and
   every experienced maker who had never opened the progression would be a worse
   lab, and [Free play](#free-play) says the escape has to exist before the
   gate does. **What the DEFAULT should be, and whether it belongs to the
   account or the course, is a decision this milestone deliberately does not
   make.**

   Still to do: New Project itself. A new project is the starter platformer
   today, not an empty world, so building one from the shelf means deciding what
   an ungranted starter looks like — which is the same decision as above wearing
   different clothes.

4. **Shape checks.** The weakest evidence, and it needs no sandbox work at all
   — the workspace is already in the lab. Ten tiles, chosen from the Making rim
   and the authoring lessons where shape is the right answer anyway.
5. **The assertion channel.** Scripted input, fixed clock, probes back. Convert
   the ten tiles' neighbours to outcome checks, starting with the ones whose
   false pass is worst.
6. **The rest of the catalogue**, region by region, each shipped with its
   starting project as a scenario so it is playable and testable before it is a
   lesson.

## Open questions

- **Where does the shelf live** — account, course, or project? Recommendation:
  account, with course pre-grants. A shelf that resets between courses removes
  the reason to earn anything.
- **What does a teacher control?** Requiring tiles, granting them outright, and
  turning the whole thing off are three different powers and probably three
  different settings.
- **One tree or many?** Recommendation: one authored, versioned catalogue, with
  a course able to select a sub-map. Six trees is six things to keep in step.
- **How long is a tile?** The catalogue assumes ten to twenty minutes. If a
  tile is a class period the map is too big by a factor of three; that is a
  question for whoever teaches the first one, not for this document.
- **What happens to a learner mid-catalogue when the catalogue changes?** Tile
  ids are permanent (above), but a split, a merge or a retired unlock each need
  a stated answer before the second version ships.
