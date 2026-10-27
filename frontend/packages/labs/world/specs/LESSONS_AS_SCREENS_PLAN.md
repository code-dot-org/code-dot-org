# Plan: lessons as screens

STATUS: IN PROGRESS, October 2026. Steps 0 to 2 are built.

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

### 3. The text

Each lesson's instructions are read against what it now opens on, and the
steps that name `main.world`, its Map tab or its rows are rewritten: about
a dozen places, plus the three memory lessons of step 0 and the camera
lessons, which say where a camera is made.

### 4. The rest of `.world`

The empty world project, tapper and novel move the same way. Then nothing
writes a `.world`, and the World Editor, `worldFileDocument`, the world's
main map (`generateMainMap`, `withWorldCameras`) and the `.world` file kind
are deleted. `define world` stays: the Main Screen compiles to it
(`screenSetupRows`).

## Open

- **`all actors` now holds the Viewport.** A learner's `for each actor in ⟨all
actors⟩` reaches the screen's Viewport as well as the level's actors, and
  a loop that sets every picture sets the Viewport's. The probes read the
  level; whether the block should, from code that runs in it, is a language
  question.
- **The tutor** sends `.world` and `.actor` files whole, and no `.screen` or
  `.map` (`aiTutor/context`), which was already so for every stock game. It
  writes back with `buildWorld`.
- **The memory lessons' story.** memory/actor-state says a Lamp's text
  cannot live on its placement because an actor cannot read the world. On a
  screen, the row moves under `when this screen loads` and reads the world
  from there; the lesson's explanation changes with it.
