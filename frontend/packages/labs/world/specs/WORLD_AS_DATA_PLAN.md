# Plan: the Main Screen compiles from its data, and `define world` goes

STATUS: BUILDING, October 2026. Steps 1 to 3 are built.

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
4. **Lessons stop writing `define world`.** `worldFile` returns the spec it
   was built from — name, rows, handlers, map — and the converter sorts the
   spec rather than a workspace. The lesson checks that edit the
   remembered world move with it.
5. **The fixtures.** Tapper and Novel the same way, or written as a screen
   and a map directly.
6. **The test shape.** `EMPTY_WORLD_PROJECT` becomes an empty Main Screen,
   and the shim reads specs.
7. **`define world` goes:** the block, its generator, and the tables and
   parent checks that name it (`ROOT_HOMES`, `DEFINING_ROOTS`, the pinned
   and named roots, `worldContext`, `addActorName`, `actorContext`), with
   `parseWorldOwnMeta`, `use theme`, `define layer` and `define event`. The
   unit tests of the blocks go with them.

Steps 2 and 3 change no output. Steps 4 to 6 change what lessons and tests
are written in, not what they compile to.

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
  declared in code. `define layer` goes with `define world` (step 7), and
  Tapper's layer becomes its screen's own (step 5).
- **`define event` goes.** A screen's events are data, and the editor will
  make them; a learner's `define event` in a drawer has no place left. Its
  name stays as a row in an actor's and a rule's view (`viewRows`), and
  `making/property` stops granting it (step 7).

## Open

- **`within layer`**, which puts what its body places into a layer, is
  checked only under `define world` today. Whether it names a map's layer
  from the screen's code, or goes, is settled when step 7 reaches it.
