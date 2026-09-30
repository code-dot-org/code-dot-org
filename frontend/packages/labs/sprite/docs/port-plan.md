# Sprite Lab port plan

This package is a port of Lab2 Sprite Lab, `apps/src/p5lab/spritelab/lab2`,
taken from `origin/staging` at f08426a0fcc. That directory holds 106 files,
about 650 KB. The apps unit tests for it are in
`apps/test/unit/p5lab/spritelab/lab2`.

The port proceeds in layers, each closed over what earlier layers ported, so
every layer builds and tests on its own. A file keeps its apps path relative
to `lab2/`, so `lab2/audioFeedback/heightTone.ts` becomes
`src/audioFeedback/heightTone.ts`. Its test moves beside it, in a
`__tests__/` directory, named `<file>.test.ts`.

## Layers

| #   | Layer           | Apps files                                                                                                                                                                                                                                           | Status |
| --- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Simulation core | `platformPhysics`, `characterAnimations`, `camera`, `audioFeedback/*`, `ai/images/{keyColor,encoding,types}`                                                                                                                                         | Done   |
| 2   | Scene model     | `types`, `world`, `imageReferences`, `imageTrim`, `imageGallery`, `imageRoleDefaults`, `levelMode`, `worldStartPattern`, `guideSteps`, `sceneToolbox`, `addBlocks`, `scenesApi`, `sceneThumbnails`, `redux/spriteLab2Redux`, `ai/images/imageAdlibs` | Done   |
| 3   | Blockly         | `blockly/**`, `migrateSources`                                                                                                                                                                                                                       | Done   |
| 4   | Engine          | `SpriteLab2Engine.js`, `redux/reseedablePageConstants`, and everything under them in `apps/src/p5lab`                                                                                                                                                | Begun  |
| 5   | Views           | `views/**`, `entrypoint.ts`, `index.js`                                                                                                                                                                                                              | Begun  |
| 6   | AI images       | `ai/images/{imageGeneration,imageSafety,removeBackground,characterSet,modelHelpers}`, `paintBlank`                                                                                                                                                   |        |
| 7   | Scene music     | `sceneMusic`, `musicProjects`, `views/useSceneMusic`, `blockly/musicProjectDropdown`                                                                                                                                                                 |        |

### 3. Blockly

Apps' `blockly/setup.ts` installed three sets of blocks:

- The lab's own blocks. `SPRITELAB2_BLOCKS` in `src/blockly/setup.ts`
  holds them as `@code-dot-org/blockly` definitions, for a workspace's
  `blocks`.
- The legacy Sprite Lab blocks, through `blocksCommon.install` and
  `p5lab/spritelab/blocks.install`. blocksCommon's blocks are now in
  `@code-dot-org/blockly`'s `BaseBlocks`, and `COMMON_BLOCKS` in
  `src/blockly/setup.ts` registers them; so is `sprite_variables_get`
  from `blocks.install`. The rest of `blocks.install` waits on the engine.
- The level's DB block pool, through `installSharedBlocks`, which runs apps'
  `block_utils.installCustomBlocks` with Sprite Lab's custom input types.
  `src/blockly/pool` converts it when a level loads; see decision 5.

### 4. Engine

`SpriteLab2Engine` extends apps' `SpriteLab`, which extends `P5Lab`. The
engine is therefore most of `apps/src/p5lab`:

| Directory                  | Lines |
| -------------------------- | ----- |
| `p5lab/` (top level)       | 4,901 |
| `p5lab/spritelab/`         | 2,506 |
| `p5lab/spritelab/commands` | 2,631 |
| `p5lab/redux/`             | 1,819 |
| `p5lab/gamelab/`           | 3,097 |

`redux/reseedablePageConstants.ts` wraps apps' legacy `pageConstants`
reducer, which only the engine reads. The engine also needs
JS-Interpreter through `CustomMarshalingInterpreter`, which
`@code-dot-org/lab/interpreter` already ports.

Done, following `docs/engine.md`'s order of work: the clean-room sprite
library that replaces p5.play (`src/sprites/`); the runtime, `CoreLibrary`
and `p5lab/spritelab/commands` (`src/engine/runtime/`), with apps'
`CoreLibraryTest` and command tests ported; animation loading
(`src/engine/animations/`); and the engine class, `SpriteLabEngine`, run in
a browser by `engine-demo.html` and `e2e/engine.spec.ts`, and wired into
the views (layer 5).

### 5. Views

`SpriteLab2View.tsx` alone is 2,009 lines. The views use the Lab2 hooks and
views (`useSources`, `Lab2Registry`, `Loading`, instructions, `Guide`,
`Adlib`); `@code-dot-org/lab` has all of these. The dialogs already use the
design system.

Ported before the engine: the scene picker, gallery and new-scene dialog;
the tab shell; the play bar, controls and music bar; the image-pane
buttons, sheet preview and temperature bot; and `useSceneEditing`.

Wired to the engine (`App.tsx`, `views/SpriteLabView.tsx`):

- `App` is `BlocklyLab` around `SpriteLabView`, which a host renders in its
  `<Lab>`. Studio does, at `/projects/sprite/<tag>/edit`; with
  `VITE_API_MODE=msw` the `simple` fixture runs without Rails.
- The project's images are a Redux slice, `redux/animationListSlice.ts`,
  with apps' thunks in `redux/animationListThunks.ts`. They are seeded once
  per level and again after Start Over, and saved in the serialized shape.
  Runs wait until they have loaded, for at most ten seconds, and a run
  made without some reruns once they arrive.
- The Code tab's workspace is `@code-dot-org/blockly`'s `BlocklyWorkspace`,
  driven by `views/useSpriteLabWorkspace.ts`, which offers what apps'
  `useBlocklyWorkspace` did. A scene not open in the editor compiles
  headless (`blockly/compile.ts`).
- `views/Playspace.tsx` holds the engine's canvas: the corner preview on
  the Code tab, the centred game on Play.
- The World tab (`views/WorldTab.tsx`, with apps' tests), shown when the
  level's mode names it or with `?world-tab=true`, paints a scene's world;
  the preview spawns it.
- The level's block pool (`blockly/pool`): `App` converts the level's
  `sharedBlocks` and hands them to the workspace after the lab's own
  blocks. The `simple` fixture carries the whole GamelabJr pool, read from
  `dashboard/config/blocks/GamelabJr`, and puts the common blocks in its
  toolbox.
- The pool's location field asks `Playspace` for a point: while picking,
  the preview takes the pointer, a translucent costume follows it, and a
  click sets the field.
- External scenes (`views/useExternalScenes.ts`): the go-to-external-scene
  block lists the scenes of section-mates' projects on this level, and in
  Play a jump runs one on its owner's images, its own jumps included.
  The server answers only within a script, and Studio hosts Sprite Lab
  only as a standalone project, so Studio never shows one; it was checked
  there with a script id and the two endpoints mocked by hand.
- Scene pictures (`views/useSceneThumbnails.ts`): a run's first frame,
  kept once the scene has held still, uploaded through
  `projectAssets.ts` onto core's assets API.
- Scenes, the live preview, local scene jumps, Play, Stop, the restarts,
  freezing the game while hidden, and the keyboard routing between the
  editor and the game are `SpriteLabView`'s, as they were
  `SpriteLab2View`'s.

Still to port, in order:

- The Images tab, the guide and image levels wait on layer 6; the music
  bar and `useSceneMusic` on layer 7; the navigation sounds' settings in
  the resource panel with them.
- Levelbuilder edit modes (start, toolbox, exemplar), the AI context, and
  Start Over's return to the lesson's first level.

Changes outside the package that the wiring needed:

- `@code-dot-org/core`: `ProjectSourcesSchema` passes a lab's own keys
  through, and takes a `source` kept as an object. It stripped everything
  but `source` and `labConfig`, so a project's `scenes` and `animations`
  were lost on load; and it took only a string or Code Bridge's
  multi-file shape, so saving a Blockly lab's object source threw, and
  base reports that failure only to metrics.
- `@code-dot-org/blockly`: `Driver` registers a definition that builds
  itself in `init` through `Blockly.common.defineBlocks`. It passed every
  definition to `defineBlocksWithJsonArray`, which ignores `init`, so such
  blocks were built empty.
- `@code-dot-org/blockly`: `Agent` loads English messages unless a locale
  has been, testing for a message inject reads. It tested for an empty
  `Blockly.Msg`, which a single field plugin's message defeats; Blockly
  then threw while labelling the workspace.
- `@code-dot-org/core`: the lab makes no request of its own. Every one is
  a module on `DashboardApiClient`: `libraries.getSource` for a level's
  helper library, `animations.remove` for a deleted image, and
  `media.getImage` for reading an image by URL, which routes another
  site's image through the media proxy (`needsMediaProxy`, which the lab's
  own `mediaUrl` now shares). A `data:` image source is taken as the image,
  with no request.
- `@code-dot-org/lab`: `Guide` caught up with apps' (`collapsed`,
  `panelRef`, a width in px, and the offsets siblings lay out around), and
  `NavigationArea` is exported from `./instructions`. Its Continue button
  already says only Continue or Finish, so apps' `textVariant` did not
  come.
- Studio: the project edit route wraps the lab in `LabProviders` and
  `LabHost`, as the music branch does, and `FullHeightLabFrame` lets the
  lab's theme wrapper fill it.

### 6. AI images

Apps generates through the `ai` SDK and its own `aiGateway` client, and
checks safety with `aichat`'s helpers and DCDO. Here the gateway is
core's `DashboardApiClient.aiGateway`, the safety checks are lab-base's
`@code-dot-org/lab/ai`, and moderation is core's `images.moderate`.
Without dashboard or a gateway, core's mocks answer: generation returns
a prepared pixel character on magenta, the judges say OK and moderation
says safe. `GOOGLE_GENERATIVE_AI_API_KEY` with
`VITE_AI_GATEWAY_URL=/__ai-gateway` calls Gemini with a developer's own
key instead; see core's `api/mocks/README.md`.

Done: the pixel editor (`src/pixelEditor`), `paintBlank.ts`, the
generation modules (`src/ai/images`), `useImageSession`, and the Images
tab: `GenerateImagePane`, `GenerateImageView` and `ImageDetailsDialog`
in `SpriteLabView`, with rename and delete reaching every reference. The
guide (`GenerateSpriteLab`) floats over any level with a mode, following
its `guideSteps`, and an image level is the pane alone, with the guide
over it and no engine. Fixtures: `freeplay` offers the paint tools, which
only freeplay levels have; `image` is an image level whose guide moves on
once a character is made.

### 7. Scene music

`sceneMusic.ts` drives apps' music `ProjectPlayer` and `MusicPlayer`. The
frontend music package on `world-lab` has a player; lab-base's music package
does not.

## Decisions to make

1. **Engine.** Decided: a slim p5 runtime extracted from apps, over
   upstream p5, built in this package and exported as
   `@code-dot-org/sprite-lab/engine`, avoiding the `@code-dot-org/p5.play`
   and `@code-dot-org/p5` forks. `docs/engine.md` has the design and its own
   open questions.
2. **Pixel editor.** Sprite Lab edits costumes with apps' `pixelEditor`.
   World Lab has its own editor under `labs/world/src/imageEditor`. Port
   apps' editor, or extract World's into a shared package and adopt it.
3. **Music player.** Layer 7 needs the frontend music player, which exists
   only on `world-lab`. It must reach lab-base first.
4. **AI gateway.** Decided: core's `aiGateway` client, a mock gateway
   with canned answers, and a dev-server proxy for a developer's own key.
5. **Legacy block pool.** Decided: a runtime converter. Most of a Sprite
   Lab level's blocks come from the DB block pool, in apps' `block_utils`
   format: `blockText`, argument lists with `customInput` types, and code
   that calls the engine's commands. When a level loads, each pool entry
   becomes an `@code-dot-org/blockly` `BlockDefinition`, so the frontend
   keeps one block system; the converter carries `block_utils.js`'s
   semantics and is checked visually against apps. The views are wired
   first, against the lab's own blocks, and the pool joins the workspace
   after. Done: `src/blockly/pool`.

## Changes from apps

Layer 1:

- `APP_WIDTH` and `APP_HEIGHT` come from `src/constants.ts` instead of
  `p5lab/constants`.
- `tryGetLocalStorage` and `trySetLocalStorage` come from
  `@code-dot-org/lab/utils`, which now exports them.
- Tests run under Vitest. `@testing-library/react-hooks` became
  `@testing-library/react`, and type imports are marked `type`, as
  `verbatimModuleSyntax` requires.

Layer 2:

- Apps' `WorkspaceSerialization` became `BlocklySerialization` from
  `@code-dot-org/blockly`, and `JsonBlockConfig` became Blockly's own
  `serialization.blocks.State`.
- `Sources` extends core's `ProjectSources<BlocklySerialization>`;
  `SpriteLab2LevelProperties` extends `BlocklyLevelProperties` from
  `@code-dot-org/lab/types`. `RGBA` is declared in `types.ts`.
- `scenesApi.ts` calls the new `spriteLab` module of `DashboardApiClient`
  instead of apps' `HttpClient`, and `deleteProjectAsset` calls
  `assets.remove`. The scene reference type comes from core.
- `sceneFingerprint` hashes with the `md5` package, as apps' `hashString`
  does, so fingerprints saved by apps still match.
- The adlib manifest is copied from `apps/static/spritelab_lab2` into
  `src/ai/images`.
- `imageTrim`'s test was JavaScript; its fixtures are now cast to the
  animation-list type.

Layer 3:

- Each block file keeps apps' `{definition, generator, helperCode}` shape.
  `setup.ts` assembles them into `@code-dot-org/blockly` definitions instead
  of registering them with apps' global `Blockly`; statement connections
  are `true` rather than `null`, as that package writes them.
- Custom fields are field plugins, exported beside each field class (for
  example `COSTUME_FIELD`) and referenced from the definitions in place of
  the registered type name. The placeholder's outline and `like` state are
  `defineExtension` and `defineMutator` objects on its definition.
- Apps' `CdoFieldImageDropdown`, `CdoFieldAnimationDropdown` and
  `CdoFieldBitmap` are copied into `src/blockly/fields`. The `config`
  helpers and number ranges they use come from `@code-dot-org/blockly`. They extend
  `@blockly/field-grid-dropdown` and `@blockly/field-bitmap` 13.3, the
  releases for Blockly 13, where apps uses the Blockly 12 releases.
- The rules apps kept in `cdoCss.ts` for the placeholder outline and the
  image grid register through `Blockly.Css` beside the code that draws them.
- The placeholder's constants moved to `placeholderConstants.ts`, since the
  placeholder block now imports its rendering, which imports them.
- The dropdowns read the lab store (`src/redux/store.ts`, lab-base's store
  with `spriteLab2` injected) where apps read its global store.
- The image pickers read the project's images through `setImageSource`
  (`src/blockly/imageSource.ts`). Apps read the engine's `animationList`
  store and `animationSourceUrl`; the engine or view layer supplies both.
- The sound dropdown plays through `src/audio/sounds.ts`, a
  `@code-dot-org/audio` sound board with apps' `sound://` path. Apps' test
  that every option names a sound in `soundLibrary.json` did not come: that
  manifest is a 2 MB file in apps' static assets.
- `imageReferences.ts` has its two workspace functions back.
- The when-run block's label is the literal "when run"; apps took it from
  `commonI18n`. The bitmap editor's "Clear" is likewise literal.
- `@code-dot-org/blockly`'s number argument type gained `precision`, which
  Blockly supports and the zoom block uses.
- A new test, `blockly/__tests__/setup.test.ts`, registers every lab block
  as a workspace would and builds, serializes and generates each one.

blocksCommon:

- The blocks and `CdoFieldDropdown` are ported into `@code-dot-org/blockly`
  (`BaseBlocks`, `fields/cdoFieldDropdown`), with apps' tests for the
  dropdown's `config` parsing and number ranges. The lab registers them
  ahead of its own blocks, and the toolbox filter keeps them.
- `when_run` is not registered: the lab has its own hat, and
  `migrateSources` renames the old type.
- `category` and `custom_category` are the lab's own definitions, as in
  apps, where the lab's install ran after blocksCommon's.
- The repeat blocks have no picture beside DO; Lab2's skin is empty, so
  apps drew none either.
- Labels are literal English ("repeat", "times", "comment:", "random
  color"); apps took them from `commonI18n`. Blockly's messages still win
  where they are set.
- The repeat count's validator does not accept `???`; apps accepted it
  only in levelbuilder's start and toolbox modes, which are not ported.
- The comment block takes its color from the theme's `comment_blocks`;
  apps fixed it to gray.
- `CdoFieldDropdown` drops apps' right-to-left display-text override.
- `colour_random` generates with `@blockly/field-colour`'s generator, as
  apps did; the package's colour plugin no longer replaces a registered
  `colour_random` with its British one.
- A `CdoFieldDropdown` still saves as its XML string, as apps' did, since
  Blockly saves a field that overrides `toXml` that way.
- `sprite_variables_get` lists only Sprite variables, as the pool's sprite
  picker does; apps listed every variable and created Sprite ones. It
  generates apps' `{name: '...'}`. Apps' plain-label form for levels that
  disable variable editing, and its registration as the Sprite getter in
  the Variables category, are not ported.

Layer 5, so far:

- `useSceneEditing` takes `updateSources` as an updater,
  `(update: (prev) => Sources) => void`; apps' `useSources` accepted one
  directly, where `@code-dot-org/lab`'s takes whole sources, so the view
  adapts it. New scene ids come from `crypto.randomUUID()` in place of apps'
  `createUuid`; both are version 4 UUIDs.
- `useSetupBlockColor` takes the workspace. Apps found the main workspace
  through its Blockly wrapper's creation event, which `@code-dot-org/blockly`
  does not fire. `PlayBar` takes the color as a prop instead of calling the
  hook.
- `runButtonSx.ts` and `dialogChrome.scss` are copied from apps' templates
  and pixel editor. The four key codes `playBar.ts` needs are declared there.
- `src/types/mui.d.ts` mirrors the design system's MUI augmentation, as
  codebridge's does, for the `tertiary` color and `extraSmall` size.
- The views import React's named exports instead of its default, as this
  package's lint requires. The scene group in `TabShell` keeps its
  pointer-only click, with the two accessibility rules waived on that line:
  its keyboard route is the tab buttons inside it.
- Apps has no tests for these views. New tests cover `useSceneEditing`,
  `playBar`, `useSetupBlockColor`, `ScenesGallery` and the playspace's
  location picking.

Layer 6:

- Generation and the safety judges go through core's gateway client
  rather than the `ai` SDK; requests carry the same wire body apps' SDK
  call sent.
- The two DCDO kill switches over the image judges read as on, their
  default; frontend has no DCDO.
- The image-prompt event is a metric count without the prompt text; apps
  sent the student's prompt to its analytics reporter, which frontend
  does not have.
- `uploadAssetToLevel` (levelbuilder's starter assets) is not ported:
  core has no API for `/level_starter_assets`, and levelbuilder edit modes
  wait on lab-base.
- Moderation drops apps' Amplitude events and `MetricsReporter` counters.
- The bot and style pictures are imported, so the library build inlines
  them (about 230 KB); apps served them as static files.
- `createNamedAnimation` requires a `frameSize`, which both callers pass;
  apps' untyped thunk accepted an animation without one.

The pixel editor:

- Apps' `HttpClient.get` of the image being edited is
  `DashboardApiClient.media.getImage`; a `data:` or `blob:` URL is read by
  an image element instead, as apps' fallback did.
- React's event types are imported under `React`-prefixed names, so the DOM
  event types the window listeners use keep their own.
- The tooltip's `data-theme` slot prop needs the design system's MUI
  augmentation, now mirrored in `src/types/mui.d.ts`.

External scenes:

- Apps' view did this inline; here it is two hooks, `useExternalSceneList`
  (the list, and whether a workspace may load yet) and
  `useExternalSceneRuns` (fetching and running another project's scene).
- Apps loaded the list once per level behind a ref, which React's strict
  mode defeats: its second mount found the level loaded and the first
  mount's fetch cancelled, so a project naming an external scene never
  loaded its workspace. The list's effect follows the level and script
  instead.
- A saved song no longer holds the workspace back with the list; the
  music list returns with layer 7.
- The script id comes from lab-base's `state.lab.scriptId`.
- New tests cover both hooks; apps has none.

The block pool:

- Each pool entry becomes an `@code-dot-org/blockly` definition that
  builds itself in `init`, as `block_utils`' blocks did, with a JavaScript
  generator carrying `createJsWrapperBlockCreator`'s. Pool types and
  helper code are as apps named them (`gamelab_<func>` for GamelabJr).
- An entry that does not convert is left out and logged once per level;
  apps threw while installing the pool.
- The mini-toolbox (the "+" on event blocks) is dropped, as apps' Lab2
  drops it: the lab does not teach the pointer blocks it offers.
- Not carried: the pictures apps drew on the sprite pointer blocks, which
  keep their labels.
- The behavior picker offers no behaviors, as in apps' Lab2: the modal
  behavior editor is legacy Sprite Lab's (`P5LabView` mounts it; Lab2 never
  does), and Lab2's Behaviors category holds only the predefined ones.
- The sound picker is the lab's sound dropdown, keeping a saved value it
  does not list; apps opened the asset manager's sound library.
- The location field is a `Blockly.Field` subclass. Apps drew a button and
  asked a Redux slice for the point; the field calls the picker `Playspace`
  registers with `setLocationPicker`. The ghost's costume comes from the
  field's block or its parent, where apps read Blockly's selected block. A
  second pick abandons the first, and so does leaving the lab.
- `SpriteLabConnectionChecker` is apps' `CdoConnectionChecker` without its
  function-parameter clause, since functions are not ported.
- An empty location picker generates `()`, which does not parse, as in
  apps. The fixture's toolbox seeds the canvas centre.
- Apps' `blockUtils` tests for `determineInputs`, `groupInputsByRow`,
  `interpolateInputs` and the generators are ported, built on real blocks
  in a headless workspace instead of stubs. The XML toolbox helpers they
  also tested did not come. New tests cover the location field and the
  connection checker.
