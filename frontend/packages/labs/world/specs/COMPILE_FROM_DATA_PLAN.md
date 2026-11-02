# Plan: compile rules, actors and cameras from their data

STATUS: BUILT, October and November 2026.

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

The blocks this plan is about are two things at once: what a learner drags,
and the rows every rule and actor is read through. A rule's data is turned
back into `define rule` rows before anything reads it (`ruleView`, read by
`parseRuleMeta` for every rule); the stock rules (`rules/stock`), a new
`.rule` (`newThing`) and the three Making lessons' rules are written as
blocks; an actor is read as `use trait` and `define block` rows
(`actorView`), and the stock actors, the fixtures and the lessons are
written as rows and folded. Taking the blocks from the learner and taking
them from the compiler are two different jobs, done in that order.

The rule's step blocks are `world_rule_step_in` and `world_rule_step_tick`.
`world_trait_step` is `each frame`, which stays: an actor's code holds it.
`define property` was kept for a world's own properties, written as rows
under `define world`; it went once the world was data (step 5, below).
`define drawing` stays. `define actor` stays as the compiler's root for an
actor's rows.

#### 5a. `define camera` goes — BUILT

Nothing makes one: a Viewport's cameras are data (step 4). The block goes,
with what only it used: the walk that listed a placement's cameras written
in code (`worldCameras.placementCameras`) and the camera list's "in code"
rows, and the camera body that `this camera`, a trait's subject and `use
trait`'s context looked for. The `camera ⟨⟩`, `move camera` and `look
through camera` dropdowns listed the workspace's `define camera`s; they
offer the main camera alone.

#### 5b. Out of the palette — BUILT

No drawer offered them by the time this was done: the Rule category holds
only `return` and the frame time, and `define event` and `each frame`,
which stay, are the only ones any palette lists. What named them was the
catalogue. A new `.rule` is seeded as data, from the Rule Editor's own
edits (`addTrait`, `addStep`). The three Making lessons that wrote rules
in blocks store them as data, and the five Making lessons' text names the
Rule Editor's controls; their checks read the rule as data, whatever shape
it is stored in (`ruleIn`).

What a Making lesson grants is now an affordance of the Rule Editor —
`rule-new`, `rule-properties`, `rule-traits`, `rule-blocks`, `rule-steps`
— and nothing withholds them yet. Which of them a gated lab holds back is
the progression's to decide. `define choices` is granted by nothing: it
is not data yet, and the Rule Editor cannot make one.

The "allowed in" tables (`fileKind`) stay. They say where a row may sit in
the workspaces the compiler reads, which 5c removes.

#### 5c. Out of the compiler

Rules compile from data, but by way of the view: `projectFiles` hands every
`.rule` out as `define rule` rows (`resolveRuleContents`), `generateRule`
folds them back, and `parseRuleMeta` walks the rows for everything the
palette and the lab know about a rule. Actors are stored as data and read
as `define actor` rows (`viewOf`) by the compiler, `parseActorOwnMeta` and
the enhancers; the stock actors, the starter project, the lessons and the
fixtures are written as rows and folded. In order, each its own commit:

1. BUILT. `parseRuleMeta` reads the data, folding a file written in blocks
   first. A rule's `define choices` is dropped: the data has no place for
   it and no rule uses it. The fold reads a missing ability as the name and
   a missing access as writable, as the walk did.
2. BUILT. The lessons' and fixtures' rules are written as data.
3. BUILT. The stock rules are generated as data: the DSL writes the
   workspace and stores its fold, under tsx so it can import the lab's
   (`yarn build:rules`). All 46 are the data they folded to before, and
   the shelf went from 4.6MB to 2.9MB. A reference's version, a hash of the
   contents, changed for every rule; nothing acts on it.
4. BUILT. `resolveRuleContents` and `projectFiles` hand out data, byte for
   byte the shelf's for a reference. What walks a rule's rows reads it
   through `workspaceViewOf` (`rewriteWorkspaces`), the view of an actor or
   a rule, and `mapWorkspaces` writes a rule it rewrote back as data. The
   readers that walked the view unasked — `rulesInScope`, `standInBlocks`
   — view it themselves.
5. BUILT, November 2026. Actors compile from data. The compiler folds an
   actor written in rows first, as `parseRuleMeta` does a rule, and lays
   the data out with `actorSheet`. What the actor is — acts like, is data,
   its animations, its traits, its blocks and events — is written from the
   data. Only what generates as code is loaded as blocks: the still
   picture, the values, the effects that are on, the drawing and the step,
   under a `define actor` root, with the handlers beside it and each
   block's body under its page's head. `parseActorOwnMeta` reads
   `properties`, `members` and `actsLike` (`actorOwnMeta`), and the walk
   over a `define actor` chain is gone.

   All 460 actors the repository builds — every scenario's, every
   lesson's, each stock actor imported alone — have the same own meta as
   before. They compile to the same code but for two differences. Ids
   Blockly mints for a block saved without one are random on every load,
   so they differ between any two runs. And an actor still written in rows
   compiles in the data's order, as it would once folded: the still
   picture and the animations come before the traits. Those are the stock
   shelf's rows, which `importStockActor` writes, and a few fixtures'.
   Seen in the browser: Meteors, Jetpack and the interface kit run, with
   no errors.

   One reading went: a property saved before properties had an access
   field was read as writable by the walk. The fold drops one without the
   field, and nothing in the repository lacks it.

   The rows the compiler no longer generates went after it, in November
   2026: `acts like`, `is data`, the animations row, `show as` and `define
property`, with the animations row's mutator, the property designer and
   its preview field, the `acts like` dropdown and the two warnings that
   only these carried. Nothing loaded them: the Actor Editor loads only an
   actor's code, which the fold never leaves one in; a rule and the Main
   Screen are data; the compiler loads only the rows it generates. `show
as` was still offered in an actor's Actor drawer, where it did nothing,
   since the icon is the data's (`ActorIconPicker`). Their names join the
   view's rows (`viewRows`), which the view writes and the folds read.

6. BUILT, November 2026. Actors are stored as data. The stock actors are
   written as rows with the helpers in `stock/workspace` and store their
   fold, as the rule DSL does (step 3), so an import writes data, a parent
   it brings included; `importStockActorAsData` is gone. Before, the
   health and scoreboard enhancements and a map's import wrote their stock
   actors as rows, which the Actor Editor cannot open. Scenarios, the
   starter project and the lessons were already folded where they are
   listed, and stay so: their fixtures run to thousands of lines of rows,
   and rewriting them as data literals buys nothing a reader sees. The
   enhancements read and write an actor through its view in the patch
   layer (`enhance/patch`), not through a wrapper around each one, so one
   called directly works on data. All 489 actors the repository builds
   hold the same data as before, and a test holds every one to being
   stored as data (`actorData.test`).

7. BUILT. The two places that loaded these blocks into a live workspace. A
   tile pictures a rule with no verb by a hat or a getter of its own, not
   `use trait`; Camera Confined, which mints no block, is pictured by none.
   An actor's data holds a block that reports, which it compiles to nothing,
   as a member, and drops a `define block` or `define event` it cannot read,
   so an actor's code never holds one. The stand-ins go with step 8: until
   the types are deleted they are defined, and no stand-in is made for them.
8. BUILT. The definitions go: `define rule`, `define trait`, `use rule`,
   `use trait`, `during … do`, `when tick`, `define block` and `define
choices`, with the `use rule` dropdown, the `use trait` dropdown and the
   rule workspace's own traits it offered, the trait a block sat under, and
   the roots, homes and surfaces that listed them. Their names stay as the
   rows a view is written in (`viewRows`), which the folds read — for a
   file written in blocks and for the tutor, which proposes rules in blocks
   — and the walks over a project's blocks read. Nothing defines them, and
   the stand-ins leave them alone. `each frame` and `define actor` stay;
   `define property` went with the actor's rows (step 5).

## Open

- **A world's properties** were the last declarations written as blocks.
  The Main Screen compiles from its data, and `define world` is gone
  (WORLD_AS_DATA_PLAN.md).
- **Naming a Viewport's camera in code.** `camera ⟨⟩`, `move camera` and
  `look through camera` name a camera by the `define camera` block that
  made it, so after 5a they name the main camera only. A Viewport's stored
  cameras have names (`showsThrough` reads them); a dropdown of those is
  not built.
