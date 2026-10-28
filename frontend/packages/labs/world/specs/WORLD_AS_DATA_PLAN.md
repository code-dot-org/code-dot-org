# Plan: the Main Screen compiles from its data, and `define world` goes

STATUS: BUILT, October 2026, but for steps 4 to 6, which are later.

A game is a Main Screen, and what the Main Screen declares is data
(`blockly/screenData`): its name, its own values and events, the rule
settings that differ from the rules', its background color and its theme.
The compiler reads most of it as data already — the name, the layers, the
view and map size and the map load go straight into the module's prologue
(`domainBlocks.worldModulePrologue`). Three things still make blocks of it
first, and the lessons and fixtures are still written as `define world` and
converted. This plan ends both, and then deletes `define world`
(COMPILE_FROM_DATA_PLAN.md, "Open").

## What still makes blocks

- **The declarations.** `parseScreenOwnMeta` builds a `define world` with a
  `define property` or `define event` row for each value and event
  (`screenDeclarationDocument`) and walks it as a world's
  (`parseWorldOwnMeta`). What that yields is what compiles:
  `world.defineProperty(…)` and `world.defineEvent(…)`.
- **The setup.** `screenSetupRows` builds `use theme`, `set background
color` and a `set` row per rule setting, loads them into the headless
  workspace and generates them (`generateMainScreen`).
- **The root.** A stand-in `define world` entry is handed to
  `assembleWorldModule`, which finds the world's code by that type.

## What is written as blocks

- **The lessons.** Every lesson's world is `worldFile`, a `define world`
  document (`lessons/worlds`), which `asScreenProject` converts
  (`lessons/asScreen`). The converter already turns what it can into
  screen data — properties, events, the theme, a literal rule setting or
  background color, a literal `add actor` as a placement — and keeps the
  rest as code under `when this screen loads`.
- **Two fixtures,** Tapper and Novel, through the same converter.
- **The tests.** About fifty compile a world through the test shim
  (`__tests__/support/worldAsScreen`), forty-six start from
  `EMPTY_WORLD_PROJECT`, and some thirty load a `define world` into a
  workspace to test the block itself.

## Order

1. **The bytes as they are.** Record the generated Main Screen module of
   every lesson, Tapper and Novel, so steps 2 and 3 are checked against them.
2. **Declarations from data. BUILT.** `screenOwnMeta(modulePath, data)`
   reads the screen's values and events directly; `screenDeclarationDocument`
   and its rows are gone. The 90 generated Main Screen modules of the
   lessons and scenarios are the same, but for the ids a conversion mints.
3. **Setup from data. BUILT, but for its rows.** The theme is written as
   its call, and `assembleWorldModule` is handed the world's code rather
   than finding a `define world` among the blocks. The background color and
   the rule settings stay `set` rows, generated as any are: both blocks
   stay, and writing their code out again here would be a second copy of
   their generators — the bargain a Viewport camera's starting values made
   (COMPILE_FROM_DATA_PLAN.md, step 4). The 90 modules are the same.
4. **LATER. Lessons stop writing `define world`.** `worldFile` returns
   the spec it was built from — name, rows, handlers, map — and the
   converter sorts the spec rather than a workspace. The lesson checks
   that edit the remembered world move with it.
5. **LATER. The fixtures.** Tapper and Novel the same way, or written as
   a screen and a map directly.
6. **LATER. The test shape.** `EMPTY_WORLD_PROJECT` becomes an empty Main
   Screen, and the shim reads specs.

   Steps 4 to 6 are not needed for the block to go. A lesson's, a
   fixture's and a test's `define world` is JSON the converter reads
   (`lessons/asScreen`), and nothing loads one into a workspace: its name
   stays as a row a view is written in (`viewRows`), as the rule blocks'
   did (COMPILE_FROM_DATA_PLAN.md, step 8). Each is worth doing on its own
   account. What cannot wait is Tapper's `define layer`, kept as code by
   the converter (step 8).
7. **`define world` goes. BUILT, but for the layers.** The block and its
   generator, `use theme` and `define event` are deleted, with the rules
   button and the event designer that rode on them, `parseWorldOwnMeta`,
   and the entries that named them (`ROOT_HOMES`, `DEFINING_ROOTS`, the
   pinned and named roots, `worldContext`, `addActorName`, the Declarations
   drawer). `world_world` and `world_rule_event` stay as names a view is
   written in (`viewRows`). A workspace is the game's code by its mark
   alone (`workspaceRoots.definesWorld`); a file with no path compiles as
   an actor's. The tests of the blocks went; the tests of what they did
   read a screen's data (`screenOwnMeta`) or the prologue
   (`worldModulePrologue`). `making/property` grants `rule-properties`.
8. **The layers. BUILT.** `define layer` and `within layer` are deleted,
   with `builderWorldExtension` and `layerPlan`. Code places into the
   default layer; a layer's contents are placements, which name their
   layer. `this layer moves …` and `this layer is fixed` act on the layer
   the code runs in, as the slot blocks do. `all actors in layer` and `is
   in layer` offer every layer of the project's maps and screens, by name
   (`projectLayerOptions`), storing the map's own id. The converter makes
   a lesson's `define layer` a layer of the level map, with its literal
   `add actor`s placed on it and the rest kept as code. Tapper's Game
   layer is the default now, and its Interface the map's fixed layer,
   holding the three literal labels; the score label, which code names,
   is in the default layer, which looks the same since Tapper's camera
   does not move. `place/layers` grants `all actors in layer`.

Steps 2 and 3 change no output.

## Decided

- **The lesson format: a spec.** `worldFile` returns its spec and the
  converter sorts it (step 4). Rewriting 79 lessons as screens and
  placements by hand buys nothing a reader sees: the rows are Blockly rows
  by nature, and sorting them into data and code is what the converter is
  for.
- **Rule settings stay keyed by their setter.** `world_set_Scoring_…` is
  what the inspector and `screenProperties` write, and step 3 resolves it.
  `{rule, property}` would be a change to the data for no reader.
- **The tests move to specs through the shim** (step 6), not by rewriting a
  hundred files. A test that is about the block itself goes with it.
- **The Main Screen's code keeps the `'world'` kind** (`markCode`): the
  name is internal, and every reader of it means "the game's own code".

- **Layers are the map's.** A layer is data, like a camera: made in the map
  editor and kept in the map (`mainMapLayers.screenLayersOf`), not
  declared in code. `define layer` goes after `define world` (step 8),
  and Tapper's Interface layer becomes its map's own.
- **`define event` goes.** A screen's events are data, and the editor will
  make them; a learner's `define event` in a drawer has no place left. Its
  name stays as a row in an actor's and a rule's view (`viewRows`), and
  `making/property` stops granting it (step 7).

## Open

- **A layer for code to place into.** Code places into the default layer.
  If a program needs to spawn into another, `add actor` taking a layer is
  the shape, rather than `within layer`: screen code can enter a
  Viewport's map, so a block enclosing it has no one map to name a layer
  of.
- **A LAYER dropdown in a map's own code** offers every map's layers, not
  that map's alone.
