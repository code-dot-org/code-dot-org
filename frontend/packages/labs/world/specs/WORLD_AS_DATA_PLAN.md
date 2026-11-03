# Plan: the Main Screen compiles from its data, and `define world` goes

STATUS: BUILT, October 2026, but for steps 4 to 6, which are later.

SUPERSEDED IN ONE PART (specs/SCREEN_STACK_PLAN.md): the Main Screen is no
longer the only screen whose data declares values and events. Every screen
does, and each copy of a screen on the stack holds its own; the Main
Screen's are the game's, read from other files by name. What else is here
stands.

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
5. **BUILT. The fixtures.** Tapper and Novel are written as a screen and a
   map directly (COMPILE_FROM_DATA_PLAN.md, 5f).
6. **BUILT. The test shape.** A test writes a Main Screen into the empty
   app, and the converter is gone (COMPILE_FROM_DATA_PLAN.md, 5f).

   Steps 4 to 6 were not needed for the block to go: a lesson's, a
   fixture's and a test's `define world` was JSON a converter read, and
   nothing loaded one into a workspace.

7. **`define world` goes. BUILT, but for the layers.** The block and its
   generator, `use theme` and `define event` are deleted, with the rules
   button and the event designer that rode on them, `parseWorldOwnMeta`,
   and the entries that named them (`ROOT_HOMES`, `DEFINING_ROOTS`, the
   pinned and named roots, `worldContext`, `addActorName`, the Declarations
   drawer). A workspace is the game's code by its mark
   alone (`workspaceRoots.holdsGameCode`); a file with no path compiles as
   an actor's. The tests of the blocks went; the tests of what they did
   read a screen's data (`screenOwnMeta`) or the prologue
   (`worldModulePrologue`). `making/property` grants `rule-properties`.
8. **The layers. BUILT.** `define layer` and `within layer` are deleted,
   with `builderWorldExtension` and `layerPlan`. Code places into the
   default layer; a layer's contents are placements, which name their
   layer. `this layer moves …` and `this layer is fixed` act on the layer
   the code runs in, as the slot blocks do. The two blocks that ask about
   a layer by name store the map's own id of it; which layers they offer
   is under Open. The converter makes a lesson's `define layer` a layer of
   the level map, with its literal `add actor`s placed on it and the rest
   kept as code. Tapper's Game layer is the default now, and its Interface
   the map's fixed layer,
   holding the three literal labels; the score label, which code names,
   is in the default layer, which looks the same since Tapper's camera
   does not move. `place/layers` grants `all actors in layer`.
9. **The `.world` kind goes. BUILT.** `FileKind` has no `world`: the Main
   Screen's code is kind `screen`, and its workspace is marked as the
   game's (`markCode(…, 'game')`, `holdsGameCode`). An enhancement's
   subject is an actor or the game, and the game's is asked for from the
   Main Screen's inspector. Nothing recognizes a `worlds/` module path;
   `ownWorldModule`, the map editor's `hasMapScript` and
   `onOpenMapScript`, and the sparkles button's file module went with it.
   Two readers still looked for `.world` and missed screens: deleting a
   rule now names a screen or map that uses it (`removeRule.filesUsing`),
   and renaming an event's value carries the handler's getters in each
   workspace a screen or map holds (`memberRename`). The tests write
   screens where they wrote worlds.

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
  name stays as the row an actor's or a rule's event is walked as when
  references are renamed (`keyRows`), and `making/property` stops granting
  it (step 7).

## Open

- **A layer for code to place into.** Code places into the default layer.
  When a program needs another, a `move ⟨actor⟩ to layer ⟨…⟩` block is the
  likely shape: it acts on an actor already placed, so it needs no map to
  be enclosed in, and it serves a spawn and a later move alike. Not
  `within layer`: screen code can enter a Viewport's map, so a block
  enclosing it has no one map to name a layer of.
- **A LAYER dropdown in a map's own code** offered every map's layers, not
  that map's alone. ANSWERED, November 2026: a layer's name is its map's,
  and known only in that map's code. The two blocks that name one are
  offered to a map's code and its placements' alone (`ROOT_HOMES`), and
  offer that map's layers under that map's names (`mapLayerOptions`, read
  by the block's file through `editingFileModule`). Nothing registers
  every map's layers any more.
- **Layers named for the whole project.** A project could name its layers
  once, and each map use those it has; a block anywhere could then name
  one, and find nothing in a map without it, as `World.addActor` already
  places into the default for a layer a map lacks. Not built: a layer is
  made in its map today. The saved value is the layer's id either way.
