# Migration coverage: `apps/src/blockly` → `blockly`

Tracks how much of the main app's central Blockly customization layer
(`apps/src/blockly/`) this package covers. The goal is parity for the
_general-purpose_ surface. Single-consumer, lab-specific customizations are
intentionally out of scope here — they belong in their own lab packages — and
are listed under [Excluded](#excluded-lab-specific) for reference.

Status legend:

- ✅ done — implemented here (parity with the app's behavior).
- 🟡 partial — present but incomplete, a thin slice, or parity unverified.
- ⬜ todo — not started.

Source of the app-side inventory: a file-by-file sweep of `apps/src/blockly/`.
Update this file as items land; it is the checklist, not a generated report.

## Foundation (no direct app equivalent)

The wrapper machinery that the rest of the migration builds on. These have no
one-to-one counterpart in the app — they replace the implicit
register-by-name conventions scattered through `blocklyWrapper.ts`.

- ✅ Block definition spec + JIT registration — `blocks/defineBlock.ts`, `Registry.ts`
- ✅ Plugin registry (Field/Input/Global/Inject) + lifecycle — `Registry.ts`, `plugins/index.ts`
- ✅ Driver / Agent / workspace component — `Driver.ts`, `Agent.ts`, `components/BlocklyWorkspace/`
- ✅ Environment plumbing to blocks/fields/mutators — `Registry.ts`, `contexts/`
- ✅ `defineMutator` / `defineExtension` / `defineMixin` — `mutators/`, `extensions/`, `mixins/`
- ✅ React-field bridge — `fields/createReactField.tsx`

## 1. Fields (2 / 6 core)

| App item                      | File                                          | Status | Package                                    |
| ----------------------------- | --------------------------------------------- | ------ | ------------------------------------------ |
| CdoFieldButton                | `addons/cdoFieldButton.ts`                    | ✅     | `fields/fieldButton/`                      |
| CdoFieldColour                | `addons/cdoFieldColour.ts`                    | 🟡     | `fields/fieldColour/` (parity unverified)  |
| CdoFieldDropdown              | `addons/cdoFieldDropdown.ts`                  | ⬜     |                                            |
| CdoFieldVariable              | `addons/cdoFieldVariable.ts`                  | ⬜     |                                            |
| CdoFieldParameter             | `addons/cdoFieldParameter.ts`                 | ⬜     |                                            |
| CdoFieldNumber                | `addons/cdoFieldNumber.ts`                    | ⬜     |                                            |
| CdoFieldLabel / CdoFieldImage | `addons/cdoFieldLabel.ts`, `cdoFieldImage.ts` | ⬜     | thin wrappers over built-ins; low priority |
| CdoFieldFlyout                | `addons/cdoFieldFlyout.ts`                    | ⬜     | pairs with CdoBlockFlyout plugin           |

## 2. Plugins (3 / 14 core)

| App item                | File                                                  | Status | Package                                                                            |
| ----------------------- | ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| Block limits            | `eventHandlers.ts` (`updateBlockLimits`)              | ✅     | `plugins/blockLimits/`                                                             |
| Disable orphans         | `eventHandlers.ts` (`disableOrphans`)                 | ✅     | `plugins/disableOrphans/`                                                          |
| Gray undeletable blocks | `eventHandlers.ts` (`handleGrayUndeletableBlocks`)    | ✅     | `plugins/grayOutUndeletableBlocks/`                                                |
| Shareable procedures    | `blocklyWrapper.ts` (Observable\*Model)               | 🟡     | `plugins/sharableProcedures/` (delegates to `@blockly/block-shareable-procedures`) |
| Trashcan                | `addons/cdoTrashcan.ts`                               | 🟡     | `plugins/toolboxTrashcan/` (related, not the full CdoTrashcan)                     |
| Connection checker      | `addons/cdoConnectionChecker.ts`                      | ⬜     | **big gap** — custom Behaviors/Locations/Sprites types                             |
| Metrics manager         | `addons/cdoMetricsManager.ts`                         | ⬜     |                                                                                    |
| Vertical flyout         | `addons/cdoVerticalFlyout.ts`                         | ⬜     |                                                                                    |
| Block flyout (in-field) | `addons/cdoBlockFlyout.ts`                            | ⬜     |                                                                                    |
| Scrollbar               | `addons/cdoScrollbar.ts`                              | ⬜     |                                                                                    |
| Keyboard navigation     | `addons/cdoKeyboardNavigation.ts`, `shortcutItems.ts` | ⬜     |                                                                                    |
| Context menu items      | `addons/contextMenu.ts`                               | ⬜     |                                                                                    |
| Gesture overrides       | `addons/cdoGesture.js`                                | ⬜     |                                                                                    |
| Plus/minus mutators     | `addons/plusMinusBlocks/`                             | ⬜     | controls_if, text_join                                                             |
| Cross-tab copy/paste    | `@blockly/plugin-cross-tab-copy-paste`                | ⬜     | stock plugin; wire as Global plugin                                                |
| Scroll options          | `@blockly/plugin-scroll-options`                      | ⬜     | stock plugin; wire as Global plugin                                                |

## 3. Mutators / extensions / mixins (procedures only)

| App item                     | File                                                    | Status | Package                                                     |
| ---------------------------- | ------------------------------------------------------- | ------ | ----------------------------------------------------------- |
| procedureDefMutator          | `customBlocks/mutators/procedureDefMutator.ts`          | 🟡     | `mutators/procedureDefMutator.ts` (delegated, `noRegister`) |
| procedureCallerMutator       | `customBlocks/mutators/procedureCallerMutator.ts`       | 🟡     | `mutators/procedureCallerMutator.ts` (delegated)            |
| commonProcedureCallerMutator | `customBlocks/mutators/commonProcedureCallerMutator.ts` | ⬜     |                                                             |
| procedureCallerOnChangeMixin | `customBlocks/mixins/procedureCallerOnChangeMixin.ts`   | ⬜     |                                                             |
| logic_compare extension      | `addons/extensions/logic_compare.ts`                    | ⬜     |                                                             |

> Behavior mutators/mixins (`behaviorDefMutator`, `behaviorGetMutator`,
> `behaviorCallerGetDefMixin`, `behaviorCreateDefMixin`) are GameLab/SpriteLab
> only — see [Excluded](#excluded-lab-specific).

## 4. Renderers & path objects (1 / 3 families)

| App item                        | File                                                      | Status | Package                                                              |
| ------------------------------- | --------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| CdoRendererThrasos + PathObject | `addons/cdoRendererThrasos.ts`, `cdoPathObjectThrasos.ts` | ✅     | `renderers/thrasos/`                                                 |
| CdoConstantsProvider            | `addons/cdoConstantsProvider.ts`                          | 🟡     | `renderers/constants.ts` + `inputs/` (rectangle/round/triangle nubs) |
| CdoRendererGeras + PathObject   | `addons/cdoRendererGeras.ts`, `cdoPathObjectGeras.ts`     | ⬜     |                                                                      |
| CdoRendererZelos + PathObject   | `addons/cdoRendererZelos.ts`, `cdoPathObjectZelos.ts`     | ⬜     |                                                                      |

## 5. Themes (11 / 11 core ✅)

All core themes ported under `themes/`: default, dark, highContrast(+Dark),
protanopia(+Dark), deuteranopia(+Dark), tritanopia(+Dark). Jigsaw is
lab-specific and excluded.

## 6. Serialization (save / load)

Note: the package's `serialization.ts` is block _positioning_ (layout/collision),
not project save/load. True state serialization is largely unported, and the
heaviest pieces are entangled with the hidden / function-editor workspace.

Done:

- [x] Block positioning on load — `serialization.ts` (`positionBlocksOnWorkspace`, collision logic)
- [x] Basic XML → JSON — `xml/index.ts` (`convertBlocklyXmlToJson`, `convertBlocklyXmlToToolbox`)
- [x] `partitionJsonBlocksByType` (setup-first ordering) — in `serialization.ts` (app: `utils/serialization/json.ts`)

Left (🔴 load-bearing):

- [ ] **Project save path** — `utils/serialization/state.ts` (`getProjectSerialization`,
      `getCombinedSerialization`, `appendProceduresToState`, `appendSharedFunctionsToState`):
      merges main + hidden + function-editor workspaces and folds in procedures/shared functions
- [ ] **Unknown-block fallback** — `addons/cdoBlockSerializer.ts` + `addons/unknownBlock.ts`:
      substitute a placeholder on deserialize error instead of throwing; keep "when run"
      non-deletable; fix procedure-def editability/movability
- [ ] **`cdoXml` pipeline** — `addons/cdoXml.ts` (507 LOC): invisible/static-call block removal,
      procedure-name injection, mini-toolbox mutation, XML init (package covers only the clean slice)

Left (🟠):

- [ ] XML→JSON extras — `utils/serialization/xmlToJson.ts` (`addPositionsToState`,
      `convertFunctionsXmlToJson` — modal-editor XML)
- [ ] Per-block serialization hooks — `utils/serialization/hooks.ts` (`addSerializationHooksToBlock`)
- [ ] Variable lifecycle — `addons/cdoVariables.ts` (`deleteUnusedVariables`, `getNonFunctionVariableIds`)

Left (🟢 small):

- [ ] JSON helpers — `utils/serialization/json.ts` (`hasBlocks`, `applyBlockIdOverrides`)
- [ ] Hidden-workspace guard — `utils/serialization/functionEditor.ts` (`shouldSkipHiddenWorkspace`)

## 6b. Toolbox

Done:

- [x] Dynamic config → Blockly toolbox — `toolbox/index.ts` (`buildToolbox`) + `Registry.registerToolbox`
- [x] Toolbox → workspace blocks — `utils/toolboxToWorkspaceBlocks.ts`

Left (🔴 load-bearing):

- [ ] **Generate toolbox from level config** — `utils/toolbox/generateToolboxDefinition.ts` +
      `utils/toolbox/retrieval.ts` (`getLevelToolboxBlocks`, `getCategoryBlocksJson`)

Left (🟠):

- [ ] Workspace → toolbox (levelbuilder) — `utils/toolbox/workspaceToToolboxDefinition.ts`
      (`isValidCategory`, `getNewStaticCategory`, `getNewDynamicCategory`)
- [ ] Legacy XML-toolbox parsing — `utils/xml/processToolbox.ts` (`processToolboxXml`) +
      `utils/xml/booleanAttributes.ts` (`readBooleanAttribute`)

Left (🟢 small):

- [ ] Category validation — `utils/toolbox/validateBlockCategories.ts`
- [ ] Toolbox metrics — `utils/toolbox/metrics.ts` (`getToolboxType`, `getToolboxWidth`;
      overlaps the missing CdoMetricsManager)

## 7. Block families & generators (mechanism only)

| App item                           | File                               | Status | Package                                                |
| ---------------------------------- | ---------------------------------- | ------ | ------------------------------------------------------ |
| Generator wiring                   | `addons/cdoGenerator.ts`           | 🟡     | `generators/simple.ts` + per-block `generator` in defs |
| Variable blocks                    | `customBlocks/variableBlocks.ts`   | ⬜     |                                                        |
| Procedure blocks                   | `customBlocks/proceduresBlocks.ts` | 🟡     | via shareable-procedures plugin                        |
| argument_reporter / parameters_get | `customBlocks/`                    | ⬜     |                                                        |

> The package ships the _mechanism_ (`defineBlock` + typed generators) but no
> central concrete block library yet.

## 8. Central machinery (todo)

| App item                 | File                                                             | Status                                     |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------ |
| Function editor modal    | `addons/functionEditor.ts`, `components/ModalFunctionEditor.tsx` | ⬜ (large)                                 |
| Unknown block            | `addons/unknownBlock.ts`                                         | ⬜                                         |
| SVG frames               | `addons/svgFrame.ts`, `blockSvgFrame.ts`, `workspaceSvgFrame.ts` | ⬜                                         |
| Global CSS               | `addons/cdoCss.ts`                                               | ⬜                                         |
| Markdown-embedded blocks | (no app equivalent)                                              | ✅ `components/BlocklyMarkdown/` (net-new) |

## Coverage snapshot

| Category                  | Core items | Done/partial                                  |
| ------------------------- | ---------- | --------------------------------------------- |
| Fields                    | 6          | 2 (1✅ 1🟡)                                   |
| Plugins                   | 14         | 5 (3✅ 2🟡)                                   |
| Mutators/extensions       | 5          | 2🟡                                           |
| Renderers                 | 3 families | 1✅ +constants🟡                              |
| Themes                    | 11         | 11 ✅                                         |
| Serialization (save/load) | ~11        | 3✅ (positioning + XML→JSON; no project save) |
| Toolbox                   | ~7         | 2✅                                           |
| Block families            | 4          | 1🟡 (+mechanism)                              |
| Central machinery         | ~5         | 1✅ (markdown, net-new)                       |

Themes are complete; the foundation and a first slice of fields/plugins are in.
The **highest-value gaps** are the connection checker, the project save path
(`state.ts` + the hidden/function-editor workspace), the unknown-block
serialization fallback, level-config toolbox generation, and the function-editor
modal — the load-bearing pieces the app's labs depend on.

## Excluded (lab-specific)

Single-consumer customizations to live in their own lab packages, not here:

- **turtle / artist:** CdoFieldAngleDropdown, CdoFieldAngleTextInput, cdoAngleHelper
- **spritelab / gamelab:** CdoFieldAnimationDropdown, CdoFieldBehaviorPicker,
  CdoFieldBitmap, cdoSpritePointer, and the behavior block family
  (behaviorBlocks + behavior\*Mutator/Mixin)
- **jigsaw:** CdoJigsawTheme, jigsawFillPatternMixin
- **music / dance:** their entire block sets and AI fields (`music/blockly/`, `dance/blockly/`)
