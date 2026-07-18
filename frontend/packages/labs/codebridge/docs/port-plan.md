# Codebridge port plan

Port the legacy Codebridge IDE shell (`apps/src/codebridge`) and the Python Lab
that rides on it (`apps/src/pythonlab`) into two standalone Vite packages under
`frontend/packages/labs`, matching the existing music/oceans ports:

- `@code-dot-org/codebridge` (`frontend/packages/labs/codebridge`) — the
  runtime-agnostic multi-file IDE shell: file browser, file tabs, editor,
  console, backpack, and a `CodebridgeLab` that specializes the base
  `LabWithSources` to a `MultiFileSource`.
- `@code-dot-org/python-lab` (`frontend/packages/labs/python`) — supplies the
  pyodide runtime, python layouts, and an `App.tsx` that composes
  `<CodebridgeLab>`. Web Lab 2 later becomes a second consumer, not a fork.

## The one fact that shapes everything

Legacy Codebridge does not own its filesystem. The multi-file source state and
every mutation live in the lab2 framework, not in `apps/src/codebridge`:

- state: `state.lab2Project.projectSources.source: MultiFileSource`
  (`apps/src/lab2/redux/lab2ProjectRedux.ts`)
- writes: `lab2ProjectReduxThunks` (`createNewFileThunk`, `saveFileThunk`,
  `renameFileThunk`, `moveFileThunk`, `deleteFileThunk`, `createNewFolderThunk`,
  ...) — Codebridge components dispatch straight into these.

In the frontend, the lab2 framework's role is played by `@code-dot-org/lab`
(base). Base has already ported the container and the save path, so the port is
mostly re-pointing Codebridge's read/write path — not lifting a filesystem.

## What base already provides

- `labProjectSlice` (`base/src/redux/labProjectSlice.ts`) — `projectSources`
  typed with `MultiFileSource`, and the save entry points:
  - `setSource(source: MultiFileSource)` — set only the source.
  - `setAndSaveSource(source, forceSave?, forceNewVersion?)` — set source and
    persist through `LabRegistry.projectManager.save(...)`.
  - `setAndSaveProjectSources(projectSources, ...)` — same for a full
    `ProjectSources`.
- `labSystemSlice` (`base/src/redux/labSystemSlice.ts`) — exact mirror of
  lab2System: `isRunning`, `hasRun`, `isValidating`, `hasError`,
  `loadedCodeEnvironment`. The pyodide runner writes run status here.
- `labSlice` — `isShareView` and friends; `labViewSlice`; `predictLevelSlice`.
- `LabRegistry` (singleton) — `projectManager`, `metricsReporter`, `appName`.
  Frontend equivalent of `Lab2Registry`.
- Store: `injectSlices` + `storeHooks` from `@code-dot-org/core/redux`. A lab
  layers its own slice onto the base store exactly like music does:

  ```ts
  // base value-import triggers injection of the base lab slices
  import {default as labStore} from '@code-dot-org/lab/redux';
  import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
  const store = injectSlices<[typeof codebridgeWorkspaceSlice], typeof labStore>(
    [codebridgeWorkspaceSlice],
  );
  export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();
  ```

- `MultiFileSource`, `ProjectFile`, `ProjectFolder`, `ProjectSources<T>`,
  `ProjectFileType`/`ProjectFileTypes` already live in `@code-dot-org/core/api`
  (`core/src/api/dashboard/sources/`). Do not carry the `apps/src/lab2/types.ts`
  copies along. NOTE the frontend `ProjectFile` schema has diverged from the
  legacy one: it adds a required `language: string` and has dropped `url` (the
  legacy S3 asset-file pointer). Port against the core schema, not the lab2 type.
- The `LabWithSources` ladder. `CodebridgeLab` slots in beside `BlocklyLab`:

  ```
  Lab                          host shell: theme + level-properties context
   └ LabWithSources<T,U>       adds SourcesProvider + ProjectProvider
      ├ BlocklyLab<T>          = LabWithSources<T, BlocklySerialization>
      └ CodebridgeLab<T>       = LabWithSources<T, MultiFileSource>   (new)
  ```

## The write path — `SourcesContext`, not redux (correction)

The initial read of the base was that the multi-file source lives in the redux
`labProjectSlice` and codebridge would dispatch `setAndSaveSource`. Building the
vertical slice proved otherwise, and it matters:

For a `LabWithSources`, the source of truth is the base **`SourcesContext`**
(`base/src/contexts/SourcesContext.tsx`). `LabWithSources` wraps children in a
`SourcesProvider` that holds `currentSources` (a `useState`, generic over the
source type `U`, so a `MultiFileSource` for codebridge), seeds it from
`getInitialSources`, and on `updateSources(next)` persists via
`(projectManager || LabRegistry.projectManager).save(next, ...)` — gated by
`isReadOnlyWorkspace` (which is true until the user owns the channel). Consumers
read/write it with `useSources<U>()` → `{currentSources, updateSources}`, exactly
as music uses `useSources<BlocklySerialization>()`.

The redux `labProjectSlice` (`projectSources` + `setAndSaveSource`) is a
**parallel** mechanism — populated by version-history and project-metadata paths,
not by `SourcesContext`. Codebridge's file CRUD therefore goes through
`updateSources`, NOT `setAndSaveSource`.

| Legacy weld | Frontend replacement | Status |
|---|---|---|
| `state.lab2Project` (file state) | base `SourcesContext.currentSources` (via `useSources<MultiFileSource>()`) | exists |
| `lab2ProjectReduxThunks` (CRUD writes) | pure edit helpers + `updateSources(applyEdit(current))` | in progress (save proven) |
| `useAppSelector/Dispatch` on global `RootState` | base `storeHooks` + `injectSlices` singleton | exists |
| `Lab2Registry` / `CodebridgeRegistry` | base `LabRegistry` / ported `CodebridgeRegistry` | LabRegistry exists; port Cb registry |
| `lab2System` run flags | base `labSystemSlice` | exists |

## Ownership boundary

The base `SourcesContext` owns the `MultiFileSource` container and its save path,
generic over the source type. The multi-file *semantics* — files, folders, tabs —
live in the codebridge package, because Blockly labs never touch them:

- Port the pure edit helpers from `apps/src/lab2/utils/multiFileSourceEditUtils.ts`
  (`createNewFileHelper`, `activateFileHelper`, `closeFileHelper`,
  `deleteFileHelper`, `createNewFolderHelper`, `deleteFolderHelper`, ...) into
  the codebridge package. Their only dependency is the `MultiFileSource` types,
  already in `core/api`. (Started: `getActiveFileForSource`, `saveFileContents`,
  `getEmptyProject` in `src/utils/multiFileSource.ts`.)
- Apply them over the context: read `currentSources.source`, produce the next
  `MultiFileSource`, call `updateSources({...currentSources, source: next})`.
  No redux thunks needed for the core path; the `codebridgeWorkspace` slice stays
  UI-chrome only.

If Web Lab 2 ends up sharing these helpers, they can graduate into base later
with no churn.

`CodebridgeLab` fills the four `LabWithSources` source-shaping props the way
`BlocklyLab` does:

- `defaultSources: {source: {folders: {}, files: {}}}`
- `getInitialSources` — port `apps/src/codebridge/hooks/useInitialSources.ts`
  (student/template/start/default selection, exemplar/predict handling).
- `startOverSources` / `startOverMessage`.
- `transform` — parse a string `source` into a typed `MultiFileSource`.

## Net-new work (does not exist anywhere in `frontend/`)

Everything above is mechanical re-pointing. These two are genuine builds:

1. CodeMirror editor — `apps/src/lab2/views/components/editor/CodeEditor`. No
   `@codemirror` in `frontend/` today. Language support, theming, and the
   `saveFile` write-back all come along.
2. Pyodide under Vite — worker manager, web worker, stdin service worker, and
   wasm/asset bundling (`apps/src/pythonlab/pyodide*.ts`, `inputServiceWorker.js`).
   Music's `vite.config.ts` `worker:` / `optimizeDeps` blocks are the precedent;
   pyodide's wasm/CDN loading is its own problem.

## Deferred behind config (already optional in `ConfigType` / context)

Punt these on the first pass to shed the ugliest `@cdo/apps` couplings:

- AI-tutor / aichat (`@cdo/apps/aichat/*`) — gated by `aiTutorDisabled`.
- miniApps: neighborhood / theater / maze (`@cdo/apps/miniApps/*`, `maze/*`).
  Python's console mode needs none; `PreviewComponents` is optional config.
- predict levels (`state.predictLevel`).

## Backpack

Self-contained and independent of the above; slot it whenever convenient. Port
`apps/src/sharedComponents/backpack/BackpackClientApi.ts` +
`BackpackAPIContext.tsx` into the codebridge package, re-pointing
`@cdo/apps/util/HttpClient` at the `core/api` http client. Endpoints
(`/v3/libraries/{channelId}/...`, `/backpacks/channel/{appType}`) are stable
REST. Instantiate `primaryApi` only for signed-in users; `secondaryApis` covers
Web Lab 2's cross-backpack imports.

## Sequence

1. Scaffold `@code-dot-org/codebridge` (package.json / tsconfig / vite / i18n
   mirroring music and oceans). Add the `codebridgeWorkspace` UI-chrome slice
   (`showFileBrowser`, `widgetViewShowCode`, `showLockedFilesBanner`) via
   `injectSlices`. Port the pure `multiFileSource{,Edit}Utils`.
2. `CodebridgeLab` — the `LabWithSources<T, MultiFileSource>` specialization, plus
   pure file-edit helpers applied over `SourcesContext.updateSources`. Prove
   sources load/save round-trip against a fixture. **(Done — see the vertical
   slice below.)**
3. FileBrowser + FileTabs + `codebridgeContext` + `CodebridgeRegistry`,
   selectors/dispatch re-pointed at base. `@dnd-kit` comes along. **(Partly done:
   edit helpers, `useFileOperations`, `usePrompts`, FileTabs, FileBrowser landed;
   see below. Still to do: `codebridgeContext`/config, `CodebridgeRegistry`, dnd.)**
4. CodeMirror editor (net-new) + Console / ConsoleManager.
5. Scaffold `@code-dot-org/python-lab`: pyodide runner/worker + Vite wiring,
   python layouts (`apps/src/pythonlab/layout/`), `App.tsx` composing
   `<CodebridgeLab>`. First green: `print()` end-to-end.
6. Backpack (independent; can move earlier).

Studio integration mirrors oceans: add `python` to `AVAILABLE_LABS`
(`frontend/apps/studio/src/modules/labs/config/labs.ts`) and a lazy entry in
`getLabEntrypoint`.

## Vertical slice — DONE

The slice proved the one novel thing: a multi-file source edit round-trips
through the base `SourcesContext` and persists via `LabRegistry.projectManager`.
The framework seam holds; the rest is component-porting, not architecture.

What landed:

- `src/utils/multiFileSource.ts` — pure helpers: `getEmptyProject`,
  `getActiveFileForSource` (simplified; no app-option/start-mode hiding yet),
  `saveFileContents`.
- `src/CodebridgeLab.tsx` — `LabWithSources<T, MultiFileSource>`, defaulting
  `defaultSources` to an empty project and supplying a string→`MultiFileSource`
  `transform`.
- `src/components/CodebridgeTextEditor.tsx` — a bare `<textarea>` bound to the
  active file via `useSources<MultiFileSource>()`; edits call
  `updateSources({...currentSources, source: saveFileContents(...)})`.
- `src/fixtures/index.ts` — `samplePythonSource`, a one-file Python project.
- `src/__tests__/writePath.test.tsx` — mounts `SourcesProvider` (keyed to
  `MultiFileSource`) + the editor with a mock project manager and an owned
  channel; asserts the edited value re-renders and `projectManager.save` is
  called with the edited source. Passes.

Harness notes for the next tests:
- The save path is gated by `isReadOnlyWorkspace`, which is true until the user
  owns the channel — seed one with `labActions.setChannel({isOwner: true})`.
- `ProjectManager` is not exported from `@code-dot-org/lab`; install a mock via
  `LabRegistry.projectManager = {save} as unknown as typeof LabRegistry.projectManager`.

## File edit helpers + FileTabs + FileBrowser — DONE

The multi-file edit set and the two tree components landed, over the
`SourcesContext` write path (no redux):

- `src/utils/multiFileSource.ts` — full pure edit set ported from lab2's
  `multiFileSource{,Edit}Utils`: `createNewFile`, `activateFile`, `closeFile`,
  `deleteFile`, `renameFile`, `moveFile`, `createNewFolder`, `deleteFolder`,
  `renameFolder`, `moveFolder`, `toggleFolderOpen`, plus `getOpenFiles(Ids)`,
  `shouldShowFile`, `findFiles`/`findSubFolders`, id allocators. Adapted to the
  frontend schema (no `url`/`flagged`/asset-deletion; start-mode hiding deferred).
- `src/hooks/useFileOperations.ts` — binds the helpers to
  `useSources<MultiFileSource>()`: each op applies a helper and commits via
  `updateSources`, skipping no-op edits. The frontend replacement for
  `lab2ProjectReduxThunks`.
- `src/hooks/usePrompts.ts` — name/confirm flows over the base dialog system
  (`showDialog({type: DialogType.GenericPrompt | GenericConfirmation})`).
- `src/components/FileTabs.tsx` — open-file tabs; click/Enter activates,
  close/Backspace/Delete closes. Drag-reorder deferred (`@dnd-kit` not in the
  workspace).
- `src/components/FileBrowser.tsx` — recursive folder/file tree with
  create/rename/delete for files and folders and folder expand/collapse, using
  design-system `Button`/`FontAwesomeV6Icon`. Deferred: drag-move, asset upload,
  backpack row actions, levelbuilder file-type toggles.
- Tests: `src/utils/__tests__/multiFileSource.test.ts` (pure helpers) and
  `src/components/__tests__/FileTabs.test.tsx` (render/activate/close). 15 tests
  green with the write-path test.

Deferred here:
- `@dnd-kit` for tab reorder + file/folder drag-move (helpers `moveFile`/
  `moveFolder` already exist to back it).
- FileBrowser dialog flows are only smoke-testable until a test wraps
  `DialogControlProvider`.

## Codebridge config context — DONE

A trimmed port of the legacy `ConfigType`, resolving the new-file `language`
placeholder and adding name validation:

- `src/config.ts` — `CodebridgeConfig` (`editableFileTypes`, `supportedFileTypes`,
  `languageMapping` ext->language identifier, `hideNewFolderButton`), a permissive
  `DEFAULT_CODEBRIDGE_CONFIG`, plus pure helpers `languageForFileName`,
  `validateFileName`, `validateFolderName`.
- `src/contexts/CodebridgeConfigContext.tsx` — the React context carrying the
  config: `CodebridgeConfigProvider` and `useCodebridgeConfig` (defaulted, so
  components work with no provider). Contexts live under `src/contexts/`.
- `CodebridgeLab` takes an optional `config?: Partial<CodebridgeConfig>` and
  provides it merged over the defaults — the seam Python Lab / Web Lab 2 fill.
- FileBrowser now sets a new file's `language` from `config.languageMapping`,
  validates names (empty / disallowed extension / duplicate sibling) via the
  prompt's `validateInput`, and honors `hideNewFolderButton`.
- Test: `src/__tests__/config.test.ts` (helpers). 25 tests green total.

Deferred from the legacy `ConfigType`/`codebridgeContext`: layouts + preview
components (the consuming lab supplies layouts), and the `onRun`/`onStop`/console
I/O and AI-tutor/asset bundle — those ride the runtime context built with the
console step.

## Next

- CodeMirror editor to replace the `<textarea>` (step 4); the `config` language
  identifier keys its `LanguageSupport`.
- Runtime context (`onRun`/`onStop`/console I/O) + `CodebridgeRegistry`
  (console/miniapp singleton), built with the console.
- Then `@code-dot-org/python-lab` (step 5).
