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
| 3   | Blockly         | `blockly/**`, `migrateSources`                                                                                                                                                                                                                       | Next   |
| 4   | Engine          | `SpriteLab2Engine.js`, `redux/reseedablePageConstants`, and everything under them in `apps/src/p5lab`                                                                                                                                                |        |
| 5   | Views           | `views/**`, `entrypoint.ts`, `index.js`                                                                                                                                                                                                              |        |
| 6   | AI images       | `ai/images/{imageGeneration,imageSafety,removeBackground,characterSet,modelHelpers}`, `paintBlank`                                                                                                                                                   |        |
| 7   | Scene music     | `sceneMusic`, `musicProjects`, `views/useSceneMusic`, `blockly/musicProjectDropdown`                                                                                                                                                                 |        |

### 3. Blockly

The block definitions depend on apps' `blockly/constants`, `blockly/types`
and `blockly/javascript`, all of which `@code-dot-org/blockly` covers. Two
custom fields have no frontend version yet: `cdoFieldBitmap` (the grid
fields) and `cdoFieldAnimationDropdown` (the image pickers). They belong in
`@code-dot-org/blockly`. `blockly/setup.ts` also loads the legacy Sprite Lab
blocks, `p5lab/spritelab/blocks`, and `blocksCommon`; those come with the
engine.

Two pieces of layer 2 wait here. `renameImageReferencesOnWorkspace` and
`removeImageReferencesOnWorkspace`, from `imageReferences.ts`, find image
pickers by `instanceof CdoFieldAnimationDropdown`; they return with that
field. `migrateSources.ts` needs the when-run block types from
`blockDefinitions/whenRun.ts`.

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
reducer, which only the engine reads. The engine also needs p5 and p5.play, which no frontend package carries, and
JS-Interpreter through `CustomMarshalingInterpreter`, which
`@code-dot-org/lab/interpreter` already ports.

### 5. Views

`SpriteLab2View.tsx` alone is 2,009 lines. The views use the Lab2 hooks and
views (`useSources`, `Lab2Registry`, `Loading`, instructions, `Guide`,
`Adlib`); `@code-dot-org/lab` has all of these. The dialogs already use the
design system.

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

1. **Engine.** Port `P5Lab`, `SpriteLab` and p5.play into this package, move
   them into a shared p5 package that Game Lab could later use, or replace
   them with an engine written for Lab2. This decides the size of layer 4
   and must be made before it starts.
2. **Pixel editor.** Sprite Lab edits costumes with apps' `pixelEditor`.
   World Lab has its own editor under `labs/world/src/imageEditor`. Port
   apps' editor, or extract World's into a shared package and adopt it.
3. **Music player.** Layer 7 needs the frontend music player, which exists
   only on `world-lab`. It must reach lab-base first.
4. **AI gateway.** Layer 6 needs a frontend client for the AI gateway.

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
