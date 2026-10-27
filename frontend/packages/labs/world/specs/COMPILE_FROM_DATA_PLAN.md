# Plan: compile rules, actors and cameras from their data

STATUS: PLANNED, October 2026. Nothing here is built.

A rule and an actor are data, edited in their editors (RULE_EDITOR_PLAN.md,
ACTORS_AS_DATA_PLAN.md), and a camera is data on a map. The compiler still
reads each the old way: it turns the data back into a workspace of
`define` blocks, loads the whole workspace, and generates from it. That is
the only reason `define rule`, `define trait`, `use rule`, a rule's steps,
`define block`, `define event`, `use trait` and `define camera` are still
registered blocks. This plan compiles each from its data, loading only the
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
- **Cameras.** A map's `mainCamera`, `cameras` and `startingCamera`, and a
  placement's `cameras`, are data (`mapModel`). The compiler writes them as
  `define camera` blocks with `use trait` rows (`withWorldCameras` and
  `withCameraDeclarations` in `placementCameras`) and generates those. No
  scenario, lesson or stock actor declares a camera in blocks, and tests
  say so (`fixtures.test`, `lessonChecks.test`). The Viewport takes its
  camera traits as an actor's traits (`useCameraTraits`).
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
- **A camera is written from the map's data** as the `defineCamera` call
  the block made.
- **The views stay, as JSON.** Readers walk them; only nothing loads them.

## What is being built

### 0. A body alone

`generateBody(head, body, variables)` in the generator: one load, the
chain below the head generated. `ruleDataCompiles` already pins every
stock rule's code byte for byte; it is what each step below keeps passing.

### 1. Rules from data

The rule path folds the view back to data (`foldRule`), generates each
member's and step's body alone, and keys them from the data. The whole
view is no longer loaded.

### 2. Actors from data

`actorModule(data, bodies)` writes what the rows' generators wrote: the
builder, traits (camera traits apart), acts like, record, animations,
values, effects, members and their bodies. The actor's own workspace
(handlers, `each frame`, `define drawing`) is loaded as written, and the
code rows generate by a flag the generator sets for an actor file rather
than by asking for a `define actor` above them. A new test pins every
stock and scenario actor's code byte for byte, as `ruleDataCompiles` does
rules'.

### 3. Cameras from data

`withWorldCameras` and `withCameraDeclarations` write `defineCamera`
calls, not blocks. The map editor's camera list reads the map's data, not
block-declared cameras (`worldCameras`).

### 4. The blocks go

Once nothing loads a view: `define rule`, `define trait`, `use rule`, a
rule's `define step` and `when tick`, `define block`, `define event`, `use
trait` and `define camera` leave the palette, with what only they used.
`define property` stays: a world's own properties are rows under `define
world`. `each frame` and `define drawing` stay: an actor's code holds them.

## Open

- **A world's `define camera`.** `define world` is not offered but still
  loads (`ESTABLISHED_ELSEWHERE`), and a world written by hand could hold a
  `define camera`. Nothing in the repo does. Deleting the block makes such a
  file unreadable, which is the cost no migration means (never shipped).
- **The world's cameras.** A Viewport's cameras are already made in its
  inspector, on the screen it is placed on (the Screen Editor is the map
  editor over a screen). The world's own cameras are the exception: they
  are kept on its main map (`mainCamera`, `cameras`, `startingCamera`).
  Whether they move to the main screen's Viewport is a question for step 3;
  the compile change does not depend on it.
- **A world's properties** are the last declarations written as blocks
  (`define world`, `define property`). A world as data is its own phase.
