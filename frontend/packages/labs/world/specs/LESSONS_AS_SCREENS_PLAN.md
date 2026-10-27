# Plan: lessons as screens

STATUS: BUILT, October 2026.

A game is a Main Screen whose Viewport is docked over the whole surface and
shows `main.map` (specs/SCREEN_MAP_PLAN.md). Every stock game is written
that way. The lessons are not: each is a `main.world`, a `define world`
workspace that holds a main map. So the World Editor, the world's main map
and the world's own cameras survive for the lessons alone. This plan moves
the lessons to screens, so that COMPILE_FROM_DATA_PLAN.md, step 4, can
delete the world's cameras, and then retires the `.world` file.

## What exists

- **One funnel.** Every lesson's project is made by `lessonSource`
  (`progression/lessons/support.ts`) from a `worldFile` spec
  (`progression/lessons/worlds.ts`). Its rows are `world_world` rows, map
  rows (`placeInMap`) and handlers; the spec's actors are files of their own.
- **What the 79 lesson worlds hold.**

  | Held                              | Count      |
  | --------------------------------- | ---------- |
  | a main map (`placeInMap`)         | 39 lessons |
  | `add actor` rows                  | 155        |
  | handlers                          | 30         |
  | `define property` (world state)   | 6          |
  | `set map size`                    | 7          |
  | `set background color`            | 4          |
  | a rule's value set (target score) | 1          |
  | `mainCamera`                      | 3          |

  Every `add actor` body sets the position; 76 of its other rows set one
  property (velocity, a label's text, a bar's fraction, a timer's
  period, a conversation's length), and 5 add a trait.

- **What a screen holds.** A `.screen` is a map document with the game's
  data beside it (`screenData`): its name, its properties and events, the
  rule settings that differ from the rules' own, and its background color.
  Its own workspace holds event handlers and nothing else (`fileKind`). A
  placement holds per-trait overrides, and a workspace of its own for what
  that one instance does (`mapModel.Placement`). A Viewport's cameras are
  data on its placement (`PlacementCamera`), made in its inspector.
- **Who reads `worlds/main.world`.** The lessons' text (about a dozen
  places), six checks in `progression/catalogue.ts`, the tutor's context
  (`aiTutor/context`), `entryFileOf` (`mainWorld`), and three non-lesson
  projects: the empty world project (`EMPTY_WORLD_SPEC`), tapper and novel.

## Decisions

- **`worldFile` writes a screen.** The same spec makes `main.screen`, a
  `gameScreen` whose Viewport shows `main.map`, and `main.map`. No lesson's
  spec changes shape; each lesson's source is rewritten by the one function.
- **An `add actor` is a placement.** Its position is the placement's; a
  `set` of a trait's or an actor's own property is that placement's
  override, as the inspector writes one; an `add trait` goes in the
  placement's own workspace, under `when created`. A row that is none of
  these is a fault the converter reports, not one it guesses at.
- **A world's state is the screen's.** `define property` rows become the
  screen's properties; `set map size` is the map's size; the background
  color and a rule's set value are the screen's data.
- **Handlers go in the screen's workspace**, which is where a game's hats
  are written.
- **A camera is the Viewport's.** A lesson's `mainCamera` becomes a camera
  on the `Game` Viewport's placement, and the Viewport looks through it.
- **The text says what the learner sees.** "`main.world`" becomes the Main
  Screen, the map, or the Viewport's inspector, whichever the step is
  about; a check reads the file the lesson now writes to.

## What is being built

### 0. Code that runs when a screen loads — BUILT

Three memory lessons teach statements a game runs once: `set ⟨gap⟩ to 100`
at the top of the world (memory/variable), a `for each` at its end
(memory/many), and rows in an `add actor` body that read the world's own
number (memory/actor-state). A screen's workspace holds only handlers, so
these go under a hat, and what they add has to reach the level.

- **`when this screen loads`** (`world_on_screen_loads`): a screen's
  `when this map loads`, run once its placements exist. The Main Screen's
  is the game starting, sorted after the world block that places its
  actors; another screen's runs as that map's script, each time the game
  goes to it.
- **`in the map ⟨Game⟩ shows do ⟨…⟩`** (`world_in_shown_map`): runs its
  body holding the space a Viewport shows (`World.enterShown`), so `add
actor` there adds to the level. Without it, screen code acts on the
  screen.
- **`when ⟨Game⟩ shows a map`** (`ViewportShowsMapEvent`) already exists,
  for code that waits for the level's actors. Its handler acts on the
  screen, as every Viewport handler does; it names the level with the block
  above. An event that moved its own handler into the level was built and
  taken out: one rule for every handler is less surprising than one event
  that differs.

A lesson's once-only statements go under `when this screen loads`, inside
`in the map ⟨Game⟩ shows` where they place or move the level's actors.

### 1. The converter — BUILT

`asScreenProject` (`progression/lessons/asScreen`) runs last in
`lessonSource`: it brings the stock Viewport, turns `main.world` into
`main.screen` and `main.map` (`screenOfWorld`), and renames what the world
declared for itself from `worlds/main` to `screens/main`. Where a setter's
property is kept on a placement is read from the project's own rules and
actors. Two cases the decisions did not foresee:

- **An `add actor` that adds a trait stays code.** A placement's `when
created` runs after its overrides are applied, so a value set on the
  trait it adds was lost. The story lessons do this, and their rows were
  code in the world.
- **A main map that places a Viewport is the screen.** adventure/rooms is a
  window onto a room already; wrapped in another screen, its Viewport sat
  inside the level.

Checked against the old path on all 79 lessons, compiled and run for a
second: the same actors, in the same spaces, with the same values, and the
same background. memory/lists and simulation/many place at random, and
match with their positions and velocities left out.

### 2. The checks, the probes and the tests — BUILT

- **The checks** that read `worlds/main.world` read the Main Screen and the
  level (`gameText`, `levelOf` in `catalogue.ts`).
- **The probes** of the view read the level the game shows, the first
  Viewport's space: its backdrops, its cameras (the one it looks through is
  `active`), and the actors and pictures counted (`playCheck`).
- **The Main Screen's code is a world's.** A hat with no subject loads as a
  kind there, as in a world (`eventSubject`); the screen's own workspace is
  marked so (`markCode`), in the compiler and in the editor, and its
  placements' code is not.
- **A lesson whose work is in blocks** (`worldView: 'world'`) opens its
  Main Screen on the screen's code.
- **The check tests** still write a solved lesson as an edit to the world it
  was written as: `asScreen` remembers each lesson's world by its screen's
  file (`worldMadeInto`), the edit is converted the way the lesson was, and
  `support/worldView` reconstructs one where nothing is remembered.
- **The first lesson's toolbox** has six more blocks, Camera Follow's and
  Camera Confined's, which the Viewport requires (`toolboxShelf.test`).

### 3. What a lesson opens on, and its text — BUILT

- **Where once-only code goes.** Every lesson's Main Screen starts with
  `when this screen loads` holding `in the map ⟨Game⟩ shows`, empty or not,
  as a world started with `define world`; the instructions say "inside **in
  the map ⟨Game⟩ shows**". No early toolbox offers either block, and none
  needs to.
- **Rows a lesson reads stay rows.** A lesson about its `add actor` rows —
  memory/variable's positions, memory/many's seventh Coin, story/form's tab
  order — says `rowsAsCode` in its world spec, and every `add actor` stays
  code. A placement's position cannot be `⟨gap⟩ + 60`.
- **Which file is in front.** A lesson on the map opens on `main.map`, where
  its actors can be selected (the Main Screen draws the level inside its
  Viewport only as a picture); one in the workspace opens on the Main
  Screen's code. Both are tabs.
- **The Main Screen's code is never locked.** Its button was the map code
  button, which `map-scripts` withholds until the placement-script lesson;
  a world's World view never was.
- **Show me.** A place on the map reveals the level's file (`main.map`, or
  the screen where it is the level); `world.properties` the Main Screen;
  `view.map` and `view.world` are `level` and `screen.code`; `world.blocks`
  and `@world` are `screen.blocks` and `@screen`. The map editor answers a
  `code` reveal by opening the screen's code.
- **The text.** Fifteen passages that named `main.world`, its Map or World
  view, `define world` or "the top of the world" are rewritten against what
  each lesson opens on.

The comparison of step 1 holds: all 79 lessons build the same game.

### 4. The rest of `.world` — BUILT

- **The last worlds.** Tapper and novel are still written as worlds and go
  through the converter. A test that writes its game as a world, as about
  fifty do, is compiled as the screen it stands for
  (`__tests__/support/worldAsScreen`): its level on the Main Screen itself,
  one space as the world was, unless a camera or a level theme needs a
  Viewport. The converter carries a world's events and theme into the
  screen's data, which no lesson had. The actor-demo recorder compiles
  through the same helper.
- **The game's enhancements.** A camera that follows is a camera on the
  Game Viewport, which it looks through; the scoreboard is a placement on
  the Main Screen, docked in a bar above the game. Both had looked for a
  `.world`, and neither could be asked for on a screen; the Main Screen's
  properties offer them.
- **What read the world.** The map editor's window is the Main Screen's
  size; the stills' theme, the style preview's and a stock map's events are
  the Main Screen's; the tutor is sent screens and maps and writes back
  with `buildScreen` and `buildMap`.
- **Deleted.** The World Editor, `worldFileDocument` and the world
  inspector's readers; the compiler's world route and main map; a map's
  `mainCamera`, `cameras` and `startingCamera`, the world camera list and
  the stored cameras; `.world` as a file kind, icon, folder, seed and
  extension; and the world fallbacks in the entry file, the reveals, the
  scanners and the stock map import.

`define world` stays as a block, and `world` as the file kind of the
game's own code (`fileKind`). Whether `define world` goes is
COMPILE_FROM_DATA_PLAN.md's step 5.

## Open

- **`all actors` held the Viewport. ANSWERED.** It reached the screen's
  Viewport as well as the level's actors, so a loop that set every picture
  set the Viewport's. It is the actors HERE now, in the space of whatever is
  in hand (`actorValue.actorsHere`): inside `in the map ⟨Game⟩ shows` the
  level, as `add actor` adds there, and in the screen's own code the
  screen. Telling a game's actors from an interface's by their `for`
  waits on a case where the two lines part: an interface actor placed in a
  level, walked by a loop.
- **The memory lessons' story. ANSWERED.** memory/actor-state's rows are
  code under `when this screen loads`, and its text sends the learner there:
  the Lamps read the game's number from the Main Screen's code, which an
  actor's own file cannot.
