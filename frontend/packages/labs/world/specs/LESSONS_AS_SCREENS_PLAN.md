# Plan: lessons as screens

STATUS: IN PROGRESS, October 2026. Step 0 is built.

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

### 1. The converter

`worldFile` writes `main.screen` and `main.map` as the decisions say, and
`lessonSource` makes `main.screen` the active file. A test runs every
lesson's spec through it and checks that nothing was dropped: each
placement, property, handler and setting lands somewhere, and a row the
converter cannot place fails the test with the lesson's id.

### 2. The checks and the tutor

The six checks in `catalogue.ts` and the tutor's context read the screen
and the map. `lessonChecks.test` and the stock pipeline tests run every
lesson's checks against its own solution, as now.

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

- **The memory lessons' story.** memory/actor-state says a Lamp's text
  cannot live on its placement because an actor cannot read the world. On a
  screen, the row moves under `when this screen loads` and reads the world
  from there; the lesson's explanation changes with it.
