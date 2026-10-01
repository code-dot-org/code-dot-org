# Legacy Sprite Lab plan

How this package comes to run legacy Sprite Lab levels: GamelabJr levels
without `uses_lab2`, which apps runs in its `P5Lab` app. They run on this
package's interface (tabs, playspace, Images tab, guide), not on a copy of
`P5Lab`'s. Everything legacy Sprite Lab does is in scope except the Piskel
animation editor.

The clean-room rule of `port-plan.md` stands: never read
`apps/src/p5lab/P5Wrapper.js`, `P5SpriteWrapper.js`, `P5GroupWrapper.js`,
the `@code-dot-org/p5` and `@code-dot-org/p5.play` forks, or
`apps/test/util/gamelab`.

## Scale

`dashboard/config/levels/custom/spritelab` holds 3,760 levels; 3,682 are
legacy and 78 are Lab2. Legacy levels sit in 142 units of
`dashboard/config/scripts_json`, against 3 for Lab2: Express and Courses E
and F from 2018 to 2025, the CS Connections modules (ecosystems,
adaptations, fables, landmarks, book covers, function machines, particles),
the maker units, elementary game design and others. Standalone
`/projects/spritelab` projects (and story, science, game_design) are legacy
too.

How much of that data uses what legacy does, by level:

| Feature                                             | Levels |
| --------------------------------------------------- | ------ |
| XML start blocks                                    | 3,362  |
| XML toolboxes                                       | 3,159  |
| Modal function editor (`use_modal_function_editor`) | 2,969  |
| Images given at start (`start_animations`)          | 2,881  |
| Validation code                                     | 1,923  |
| Mini-toolbox                                        | 1,674  |
| Shared behaviors (`include_shared_functions`)       | 1,463  |
| Default sprites (`use_default_sprites`)             | 487    |

Behavior definitions appear about 48,000 times in level XML, mostly hidden
(`uservisible="false"`).

## What carries over

The runtime does. Lab2 took its commands and `CoreLibrary` from legacy
Sprite Lab, and every command file here matches apps' key for key. The
block pool converter is generic, so every pool legacy levels name
(GamelabJr, GameDev, adaptations, ecosystems, storylab, ...) converts;
their custom inputs are already covered, Dance Lab's aside. The clean-room
sprite library reproduces the fork's behavior, and `blocksCommon`'s blocks
are in `@code-dot-org/blockly`. What legacy adds is the authoring model
around the runtime: XML levels, behaviors and functions, validation, and
the console.

## Decisions

All made on 2026-09-30:

1. **Interface.** Legacy levels run on this package's interface. One
   package, switching on `usesLab2`; no second Sprite Lab.
2. **Piskel.** Not ported. Students draw with the Images tab's pixel
   editor or generate images.

3. **Where behavior and function definitions live.** Apps keeps them on an
   unrendered definition workspace and edits them in a modal editor. The
   modal editor is shared with Maze, Artist, Play Lab and Poetry (about
   470 more levels), so porting it into `@code-dot-org/blockly` serves them
   all. Decided: port the hidden workspace and the modal editor as apps
   has them; an on-canvas interim (definitions in frames) would change
   what students see.
4. **When a level is judged.** Legacy evaluates validation only while
   running; this package previews continuously. Decided: validation and
   completion run in Play only; the preview is never judged.
5. **How completion reaches progress.** Either a Sprite Lab `Validator`
   for `@code-dot-org/progress` with a condition the engine satisfies, or
   the lab dispatching validation state and progress reports itself.
   Decided: the `Validator`, so `NavigationArea` gates Continue as it does
   for Lab2 labs.
6. **Where XML becomes JSON.** Block XML needs every block registered, so
   it converts in the browser, in `@code-dot-org/blockly`. Template-level
   substitution and XML localization, which apps' `blockly_level_options`
   does and the Lab2 level-properties endpoint does not, belong in
   dashboard's `summarize_for_lab2_properties`.
7. **`World` in the interpreter.** The engine hides p5.play's `World`;
   validation code reads `World.frameCount` and friends (4,728 uses in
   1,556 levels). Decided: a read-only `World` in legacy mode.

## Fix first

These are wrong today, for Lab2 data as well as legacy:

- **Untyped sprite variables.** `sprite_variables_get` and the pool's
  sprite picker take only Sprite-typed variables. Legacy creates variables
  untyped (all 987 XML `<variable>` entries), and so did apps' Lab2 field.
  Loading a block that names an untyped variable silently points it at a
  new default variable instead; verified in a headless workspace. Retype a
  referenced variable to Sprite on load, or let the field accept `''`.
- **`math_random_int`.** Legacy overrides its generator so the helper keeps
  the name `math_random_int`, which pool helper code and libraries call
  (14,500 uses). The port lacks the override.

## Layers

In order; sizes are rough. Layers 1 to 5 run most legacy levels without
behaviors or functions; 6 and 7 bring those; 8 to 12 complete the set.

### 1. Legacy level loading

In `@code-dot-org/blockly/xml`, ported from apps:

- `cdoXml` preprocessing: `can_disconnect_from_parent` to `movable`,
  `usercreated` and `uservisible` to mutations, behavior ids, unnamed
  procedures, `inputcount`, `miniflyout`, the locked `when_run`.
- XML to JSON through `Blockly.Xml.domToBlock` on a headless workspace
  with every block registered, then `serialization.workspaces.save`; only
  Blockly's loader handles shadows, variables and the mutations that read
  sibling fields. The existing offline converter drops shadows and
  variables and misreads block attributes.
- Toolbox XML to JSON with categories, including `custom="VARIABLE"`,
  `"PROCEDURE"` and `"Behavior"`.
- An `unknown` block, so a type defined nowhere (`sprite_variables_set`,
  172 uses) loads as a placeholder instead of failing the workspace.

In this package, a level adapter: legacy properties to the ones the lab
reads (start sources, `toolboxDefinition`, `hideCustomBlocks` category
filling), with `migrateSources` run after conversion. About 1,000 lines.

### 2. Variables

`CdoFieldVariable` and a VARIABLE flyout that offers the Sprite getter,
in `@code-dot-org/blockly` and here. About 300 lines.

### 3. Engine legacy mode

- `World` and `console` in the interpreter (decision 7).
- Evaluation in the program's scope, for validation code.
- Per-frame validation while playing, with `ValidationSetup` loaded, and
  an `onValidationResult` callback.
- `preloadedBackgrounds` for the deprecated `setBackgroundImage`.
- Single-frame animations (`all_animations_single_frame`, forced in
  apps for block levels).
- Pause (the engine has `setDrawPaused`).

### 4. Completion

- A Sprite Lab `Validator` (decision 5) fed by layer 3.
- Results as legacy reports them, quirks included: a passing `check()`
  reports free play (30) with success; a failure reports 3 with its
  message; an execution error and unchanged free-play code fail.
- Feedback messages from apps' Sprite Lab strings (375 keys).
- Finish only on levels without validation code that are not project
  levels; free play continues after a run.

### 5. Runtime host

The engine already routes prompts, printed text and speech through a
`RuntimeHost`; the view passes none, so they vanish. Port the prompt queue
(text and multiple choice), the text console and execution-error alerts
from `SpritelabInput`, `TextConsole` and `SpriteLab.reactToExecutionError`.

### 6. Procedures

In `@code-dot-org/blockly`, shared by every lab with functions: code.org's
`procedures_*` and `parameters_get` with their real mutators and mixins
(today type-only stubs over the stock plugin), the procedure serializer
(the `procedures` key of saved JSON), and the PROCEDURE flyout. The
connection checker's function-parameter clause comes back here. About
1,300 lines.

### 7. Behaviors

`behavior_definition`, `gamelab_behavior_get` and `sprite_parameter_get`
with their mutators and mixins (in `@code-dot-org/blockly`), their
generators (here), the Behavior flyout, the behavior picker listing real
definitions, the 20 shared GamelabJr behaviors merged in, and definition
code compiled after the main workspace's. The runtime's `Behavior` and
behavior commands already exist. About 800 lines.

### 8. Definition workspace and modal function editor

The hidden workspace with its split and merge of sources, and
`FunctionEditor` as a React component in `@code-dot-org/blockly`, with its
frames, edit buttons, Escape shortcut and delete flow. The largest piece,
about 1,500 lines, and shared across labs (decision 3).

### 9. Mini-toolbox and pointers

`@code-dot-org/blockly` has a generalized mini-toolbox no lab uses yet.
Wire it into the pool converter behind the level's `miniToolbox`, save its
open state as apps did, and add the pointer blocks' misplacement warning
and, optionally, their pictures. About 250 lines.

### 10. Animation library

- Core `DashboardApiClient` calls for the animation library manifest and
  default-sprite metadata.
- A library picker in the Images tab: categories, search, backgrounds.
- `start_animations` and default sprites (with a backgrounds top-up) as
  the level's starting images; Start Over restores them.
- `hide_animation_mode` and `start_in_animation_tab` deciding the Images
  tab.

### 11. Shell

The instructions panel (short and long instructions, avatar), Run and
Reset, Pause, soft arrow buttons (onto `PlayBar`), Show Code, and the
share view running on open.

### 12. Later

Authored hints and callouts (neither exists in lab-base), contained levels
as predict questions, `embed`, `skip_autosave`, the plus and minus
mutators on `controls_if` and `text_join`, and `logic_compare` without
type checks (legacy compares mismatched types).

## Not ported

Piskel. The debugger and watch panel, which legacy never shows for block
levels. The speed slider, an experiment. `enable_big_playspace`,
`auto_run_setup` and the singular `block_pool`, which nothing reads.
`CdoFieldLabel`, since no level disables variable editing. Dance Lab's
pool inputs.

## Depends on

Legacy levels are course levels. Studio's course route must host Sprite
Lab through `LabHost` before any of this can be seen on a real level,
which is the same unit-level hosting Start Over's return waits on
(`port-plan.md`).

## Verification

The level corpus is in the repository, so each layer can be checked
against all of it rather than a sample: every start-block and toolbox XML
converts with no unknown blocks beyond the known undefined types,
round-trips, and compiles; validation code evaluates headlessly against
the engine for a sample of levels with known outcomes. Then levels from
Course F and Express in Studio, once the course route hosts the lab.
