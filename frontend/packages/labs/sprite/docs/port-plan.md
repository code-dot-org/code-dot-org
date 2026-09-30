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

The lab-owned blocks are done. Apps' `blockly/setup.ts` installed three
sets of blocks, and only this one has ported:

- The lab's own blocks. `SPRITELAB2_BLOCKS` in `src/blockly/setup.ts`
  holds them as `@code-dot-org/blockly` definitions, for a workspace's
  `blocks`.
- The legacy Sprite Lab blocks, through `blocksCommon.install` and
  `p5lab/spritelab/blocks.install`. These wait on the engine.
- The level's DB block pool, through `installSharedBlocks`, which runs apps'
  `block_utils.installCustomBlocks` with Sprite Lab's custom input types.
  Nothing in `@code-dot-org/blockly` reads the pool's format; see decision 5.

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
a browser by `engine-demo.html` and `e2e/engine.spec.ts`. Wiring it into
the views remains.

### 5. Views

`SpriteLab2View.tsx` alone is 2,009 lines. The views use the Lab2 hooks and
views (`useSources`, `Lab2Registry`, `Loading`, instructions, `Guide`,
`Adlib`); `@code-dot-org/lab` has all of these. The dialogs already use the
design system.

The views that need neither the engine nor image generation are ported: the
scene picker, gallery and new-scene dialog; the tab shell; the play bar,
controls and music bar; the image-pane buttons, sheet preview and
temperature bot; and `useSceneEditing`. What remains waits on the engine
(`SpriteLab2View`, `SpriteLab2Container`, `Playspace`, `WorldTab`,
`useBlocklyWorkspace`, `useSceneThumbnails`), on image generation
(`GenerateImagePane`, `GenerateImageView`, `ImageDetailsDialog`,
`GenerateSpriteLab`, `useImageSession`), or on scene music
(`useSceneMusic`).

### 6. AI images

Generation runs through the `ai` SDK, `@ai-sdk/google` and apps'
`aiGateway`; safety checks use `aichat`'s safety helpers and DCDO. Frontend
has no AI gateway client yet. `paintBlank.ts` belongs here too: it needs the
model's output sizes from `modelHelpers.ts` and `crispScaleFor` from apps'
`pixelEditor/pixelArt`.

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
4. **AI gateway.** Layer 6 needs a frontend client for the AI gateway.
5. **Legacy block pool.** Most of a Sprite Lab level's blocks come from the
   DB block pool, in apps' `block_utils` format: `blockText`, argument lists
   with `customInput` types, and code that calls the engine's commands.
   Porting it means apps' `block_utils.js` (1,216 lines), `blocksCommon.js`
   (270) and `p5lab/spritelab/blocks.js` (762), or a converter from the pool
   format to `@code-dot-org/blockly` definitions. With the engine decided,
   the pool's generated code runs on the ported runtime as it is; only the
   installer, or a converter, remains to choose.

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
  `CdoFieldBitmap`, with the `config` helpers and number ranges they use,
  are copied into `src/blockly/fields`. They extend
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
  `playBar`, `useSetupBlockColor` and `ScenesGallery`.
