# Plan: compile rules, actors and cameras from their data

STATUS: IN PROGRESS, October 2026. Steps 0 to 4 are built.

A rule and an actor are data, edited in their editors (RULE_EDITOR_PLAN.md,
ACTORS_AS_DATA_PLAN.md), and a camera is data on a Viewport. The compiler still
reads each the old way: it turns the data back into a workspace of
`define` blocks, loads the whole workspace, and generates from it. That is
the only reason `define rule`, `define trait`, `use rule`, a rule's steps,
`define block`, `use trait` and `define camera` are still registered
blocks. This plan compiles each from its data, loading only the
bodies, and then deletes those blocks.

## What exists

- **Rules** (`BlocklyGenerator`, the rule path). The whole view is loaded.
  `parseRuleMeta` reads the declarations from the view's JSON, and
  `extractRuleBodies` walks the loaded roots for each body — keyed
  `kind:scope:ownerTrait:id` (`ruleMeta.ruleBodyKey`) — generating each
  with `statementToCode(member, 'DO')` and each block's values from its
  parts. `ruleMetaToModule` wraps the bodies: the subject parameter, `const
world`, the loop over a trait's holders. Scope, owner and id never reach a
  body's code; they decide its key and its wrapping, and come from the data.
- **What a body needs from above it.** Its variables; a binder for its
  values, or a `let` naming one is a redeclaration (`variableScope`); and
  the generator's `__ruleModule`. A member page's head (`memberHead`)
  already binds a member's values, and a step's head (`stepHead`) is
  neutral, so a body loaded alone under either generates what it did.
- **Actors** (`BlocklyGenerator`, the actor path). The view is loaded and
  every root is generated. Properties come from metadata (`OwnMeta`);
  everything else from the generators of the view's rows: `define actor`,
  `use trait` (which tells camera traits from actor traits), `acts like`,
  `is a record`, `add effect`, animations, value setters, `define block`
  and `define event` (whole declarations, in an actor file), `each frame`,
  `define drawing`, and the handlers. Each row's generator asks
  `definesActorFile`, so it writes nothing outside a `define actor`.
- **Cameras.** A camera belongs to a Viewport: a placement's `cameras`,
  made in its inspector on the screen it is placed on (the Screen Editor is
  the map editor over a screen). The compiler writes each as a
  `defineCamera` call, and its starting values as `set` rows on `this
camera` generated inside it (`BlocklyGenerator.cameraCode`,
  `placementCameras`). No scenario, lesson or stock
  actor declares a camera in blocks, and tests say so (`fixtures.test`,
  `lessonChecks.test`). The Viewport takes its camera traits as an actor's
  traits (`useCameraTraits`).
- **What is left of the world's main map.** The stock games are a
  `main.screen` whose docked Viewport shows `main.map`. The lessons are not:
  `lessonSource` writes each as a `main.world` holding a main map, as do the
  empty world project (`EMPTY_WORLD_SPEC`), tapper and novel. Three camera
  lessons set the map's `mainCamera`. What serves that map's cameras is the
  World Editor's Map tab (`worldFileDocument`, `hasWorldCameras`), the
  world camera list (`worldCameras`, `worldCameraCode`), `withWorldCameras`,
  and the camera-follow enhancement, which writes `mainCamera`.
- **Who loads a view into Blockly.** The generator; and, in tests, the
  stock compile helpers (`compileProject`, `compileStockRules`). Every other
  reader of a view reads its JSON (`parseRuleMeta`, `ownProperties`, the
  renames, the lesson checks, the tutor) and does not need the blocks to
  exist.

## Decisions

- **A body is compiled alone**, under a head that is the page's: a
  member's under `memberHead` (its values bound), a step's or a drawing's
  under `stepHead`, with the file's variables. The generator writes the
  chain below the head.
- **A rule's module is written from its data**: the metadata as now, the
  bodies keyed from the data.
- **An actor's module is written from its data in TypeScript**, the rows'
  generators' output said directly, and its handlers and code roots loaded
  from its own workspace as they are written.
- **A camera is a Viewport's**, written from its placement's data as the
  `defineCamera` call the block made. A world has none of its own.
- **A lesson is a screen**, as a game is: a Viewport docked over the whole
  surface, showing the lesson's map.
- **The views stay, as JSON.** Readers walk them; only nothing loads them.

## What is being built

### 0. A body alone — BUILT

`ruleBodySheet` (`rules/ruleBodies`) lays out every body of a rule under
its page's head, with the rule's variables and the key each is filed
under, in one workspace: one load, one `init`. A workspace that holds a
rule's bodies and no `define rule` is marked as a rule's (`markRule`), so a
list socket there defaults to `all actors`, as on the Rule Editor's pages.

### 1. Rules from data — BUILT

`generateRule` folds what it is handed to data (`asRuleData`), generates
each body below its head, and assembles the module from the data's
metadata as before. A rule the data cannot say compiles to nothing.
Checked against the old path on all 397 rules in the stock shelf, the
scenarios and the lessons: the same code, but for the order of the names on
the first `var` line in 105, which follows the order the blocks load in.
`extractRuleBodies` is gone.

### 2. Actors from data — BUILT

Not a module writer of its own: most of an actor's rows (acts like, is a
record, its look, animations, values, effects, `each frame`, `define
drawing`) are ordinary rows whose generators stay. Three kinds are the
blocks this plan deletes, and those are said directly, where their rows
stand (`BlocklyGenerator.actorCode`): a trait it uses, an event it
declares, and a block it adds, whose body is laid out under `memberHead`
as on its page. `actorSheet` takes those three out of the chain before the
load. `define actor` stays as the root the rows are generated under.

The head binds its values on a page, renaming one that shares a name with
another variable; in the compiler's workspace, which holds every block's
body, two blocks may each have a value called `row`, so it does not.

Checked against the old path on all 786 Blockly files in the scenarios,
the lessons and the stock shelf, 286 of them actors, each block given a
fixed id first: the same code, but for the order of the names on the first
`var` line in the list actor.

### 3. Lessons as screens — BUILT

Its own plan: specs/LESSONS_AS_SCREENS_PLAN.md. A lesson's `main.world` holds
a whole program, not only a main map, so moving it is a rewrite of what 79
lessons open on.

### 4. Cameras only on Viewports — BUILT

`mainCamera`, `cameras` and `startingCamera` have left the map, with the
World Editor's Map tab, the world camera list, `worldCameras`,
`worldCameraCode`'s reader and `withWorldCameras`
(LESSONS_AS_SCREENS_PLAN.md, step 4). A placement's stored camera is
written as a `defineCamera` call, not a `define camera` block; only its
`set` rows are still blocks, which stay. Checked against the old path on
the ten screen and map modules that store a camera: the same bytes.

### 5. The blocks go

Once nothing loads a view: `define rule`, `define trait`, `use rule`, a
rule's `define step` and `when tick`, `define block`, `use
trait` and `define camera` leave the palette, with what only they used.
`define property` and `define event` stay: a world's own properties and
events are rows under `define world` (`screenData`). `each frame` and
`define drawing` stay: an actor's code holds them. `define actor` stays as
the compiler's root for an actor's rows.

## Open

- **A world's `define camera`.** `define world` is not offered but still
  loads (`ESTABLISHED_ELSEWHERE`), and a world written by hand could hold a
  `define camera`. Nothing in the repo does. Deleting the block makes such a
  file unreadable, which is the cost no migration means (never shipped).
- **A world's properties** are the last declarations written as blocks
  (`define world`, `define property`). A world as data is its own phase.
