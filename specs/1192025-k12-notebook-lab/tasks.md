# Tasks: K-12 Notebook Lab

**Input**: Design documents from `specs/1192025-k12-notebook-lab/`
**Prerequisites**: `plan.md` (✓), `spec.md` (✓), `research.md` (✓), `data-model.md` (✓), `contracts/` (✓)

**Tests**: Included throughout — `spec.md` SC-008/009/012/013/014 require automated verification, and `research.md §R-016` codifies the testing strategy. We treat unit + component tests as part of every behavior-changing task per Constitution VIII.

**Organization**: Tasks are grouped by user story to enable independent implementation, testing, and delivery. Within each phase, tasks marked `[P]` touch independent files and can run in parallel.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: parallelizable (different files, no incomplete-task dependencies in this phase)
- **[Story]**: required for user-story phases only; setup / foundational / polish phases carry no story tag
- Every task names an exact file path

## Path conventions

Two roots used throughout. Relative paths in this file are interpreted against the repo root.

- Lab package: `frontend/packages/labs/notebook/` (generator convention; package name remains `@code-dot-org/notebook-lab`)
- Studio integration: `frontend/apps/studio/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the lab package skeleton and wire it into the Turborepo + studio.

- [X] T001 Create the lab package directory `frontend/packages/labs/notebook/` with `package.json` (name `@code-dot-org/notebook-lab`, version `0.0.1`, type `module`, peerDeps on `react`/`react-dom`), `tsconfig.json` (extends the workspace base, strict on), `turbo.json` (build/test/typecheck tasks), `vitest.config.ts` (jsdom env, setup file path), `README.md`, `AGENTS.md`, `NOTICE` (vendored jupyter-k12 MIT notice), `.gitignore` (excludes `public/pyodide/*` except `version.txt` + the downloader)
- [X] T002 [P] Add runtime deps to the lab package via `yarn workspace @code-dot-org/notebook-lab add react react-dom @mui/material @emotion/react @emotion/styled @code-dot-org/component-library @code-dot-org/core @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/lang-python marked dompurify idb qrcode pako video.js`
- [X] T003 [P] Add dev deps `yarn workspace @code-dot-org/notebook-lab add --dev vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @types/dompurify @types/qrcode @types/pako`
- [X] T004 [P] Create the Pyodide download script `frontend/packages/labs/notebook/scripts/download-pyodide.sh` that pulls `pyodide.mjs`, the wasm/data blobs, and `version.txt` into `frontend/packages/labs/notebook-lab/public/pyodide/`; commit only the script + `version.txt`, gitignore the binaries
- [X] T005 [P] Add `'notebook'` to `AVAILABLE_LABS` in `frontend/apps/studio/src/config/labs.ts` per `contracts/lab-registry.md` File 1
- [X] T006 [P] Add the `notebook` branch to `frontend/apps/studio/src/modules/labs/router/getLabEntrypoint.ts` per `contracts/lab-registry.md` File 2; `lazy(() => import('@code-dot-org/notebook-lab'))`
- [X] T007 Add `@code-dot-org/notebook-lab` as a workspace dep of studio: `yarn workspace @code-dot-org/studio add @code-dot-org/notebook-lab`
- [X] T008 Add `@capacitor/browser` to `frontend/apps/mobile/capacitor.config.ts` `includePlugins` and as a workspace dep (`yarn workspace @code-dot-org/mobile add @capacitor/browser`); run `yarn workspace @code-dot-org/mobile sync`
- [X] T009 [P] Create the lab's vitest setup file `frontend/packages/labs/notebook/src/setupTests.ts` (extends `@testing-library/jest-dom`, polyfills `crypto.randomUUID` if absent in jsdom, registers structuredClone shim)
- [X] T010 Smoke-build: `yarn workspace @code-dot-org/notebook-lab build` produces a chunk; `yarn workspace @code-dot-org/studio build` succeeds with the new lab in `AVAILABLE_LABS` (lab is empty default export at this point)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: storage layer, session model, i18n scaffolding, theming, telemetry hygiene. Every user story depends on these.

**⚠️ CRITICAL**: no user-story phase may begin until Phase 2 ships.

- [X] T011 Create the IndexedDB wrapper `frontend/packages/labs/notebook-lab/src/storage/NotebookLabDB.ts` per `contracts/indexeddb-schema.md` (db name, store, composite-key, four indexes, `onupgradeneeded` v1 migration)
- [X] T012 [P] Create `frontend/packages/labs/notebook-lab/src/storage/notebookRepo.ts` with `getNotebook`, `listForSession`, `listRecent`, `listAssigned`, `findBySeedId`, `saveNotebook`, `deleteNotebook`, `deleteSession`; validate against the notebook schema before writing; reject cross-session reads with an assertion
- [X] T013 [P] Create the prefs-store abstraction `frontend/packages/labs/notebook-lab/src/storage/prefsStore.ts` that routes to `@capacitor/preferences` on native and `localStorage` on web, gated by `Capacitor.isNativePlatform()`; expose `get`, `set`, `remove` for JSON-able values
- [X] T014 [P] Create the session catalog repo `frontend/packages/labs/notebook-lab/src/storage/sessionRepo.ts` that reads / writes `nblab.sessionCatalog` via the prefs store (shape per `data-model.md §5`); functions `listSessions`, `createSession(label)`, `activateSession(id)`, `touchLastActive(id)`, `signOut()`, `deleteSession(id)` (cascades through notebookRepo)
- [X] T015 [P] Create the session store `frontend/packages/labs/notebook-lab/src/session/sessionStore.ts` (React context + reducer; active session id, idle timer with 20-minute default, exposes `useSession()` and `useRequireSession()`)
- [X] T016 [P] Create key-scoping helpers `frontend/packages/labs/notebook-lab/src/session/sessionKey.ts` (`makeKey(sessionId, notebookId)`, `parseKey(key)`)
- [X] T017 [P] Create the StringsProvider `frontend/packages/labs/notebook-lab/src/i18n/StringsProvider.tsx` mirroring `frontend/apps/studio/src/modules/ai-decisions-mobile/i18n/StringsProvider.tsx`; expose `useString(key)` with the FR-035 fallback chain
- [X] T018 [P] Create locale metadata `frontend/packages/labs/notebook-lab/src/i18n/localeMeta.ts` (native + English names, direction for `en-US`/`ja-JP`/`hi-IN`/`fa-IR`)
- [X] T019 [P] Create empty label bundles `frontend/packages/labs/notebook-lab/src/i18n/labels/{notebooks,settings,renderer,navigation,themes}.en-US.json` (English seed) and matching empty stubs for `ja-JP`, `hi-IN`, `fa-IR`
- [X] T020 [P] Wire `<html dir>` and `<html lang>` flips at the lab root in `frontend/packages/labs/notebook-lab/src/lab-root.tsx` (effect on `localeMeta[locale].direction`)
- [X] T021 [P] Create the telemetry wrapper `frontend/packages/labs/notebook-lab/src/telemetry/wrapper.ts` per `research.md §R-013`; whitelist event keys; emit through `@code-dot-org/core/plugins/observability`; assert PII fields throw in dev
- [X] T022 [P] Add a Vitest test for the telemetry wrapper at `frontend/packages/labs/notebook-lab/src/telemetry/__tests__/wrapper.test.ts` that submits forbidden fields (session label, cell source, learner URL, "OPENAI_API_KEY") and asserts each is stripped or throws in dev mode
- [X] T023 [P] Add the lab's MUI + DSCO theme adapter `frontend/packages/labs/notebook-lab/src/theme/index.ts` consuming `CdoTheme`; expose `useLabTheme()` returning `'light' | 'dark'` with the panel's no-hex rule enforced (lint rule documented in `AGENTS.md`)
- [X] T024 Add the lab root `frontend/packages/labs/notebook-lab/src/lab-root.tsx`: takes `{ channelId }`, mounts `StringsProvider` → `SessionGate` → internal navigator switching between `IndexView` / `NotebookView` / `SettingsView` / artifact-view
- [X] T025 Add the public entry `frontend/packages/labs/notebook-lab/src/index.tsx` re-exporting `lab-root` as default per `contracts/lab-registry.md`

**Checkpoint**: foundation ready — storage, session, i18n, theme, telemetry, lab shell all in place. User-story phases can begin.

---

## Phase 3: User Story 1 — First-success in under 60 seconds (Priority: P1) 🎯 MVP

**Goal**: A fresh-install learner reaches a successful Python result within 60 s and 3 taps via a welcome notebook (no index, no folder picker).

**Independent Test**: SC-001 quickstart §1 — cold install, three taps, first Try-it succeeds within ten seconds end-to-end.

### Tests for User Story 1

- [X] T026 [P] [US1] Component test for the cold-open dispatch in `frontend/packages/labs/notebook-lab/src/__tests__/lab-root.coldOpen.test.tsx` asserting `channelId === 'default'` with no session → session picker; with session + no welcome flag → welcome notebook; with session + welcome flag → index
- [X] T027 [P] [US1] Component test for `welcomeNotebook.ts` shape in `frontend/packages/labs/notebook-lab/src/welcome/__tests__/welcomeNotebook.test.ts` asserting the welcome notebook has exactly one runnable code cell using only the Python standard library, a title, and a goal

### Implementation for User Story 1

- [X] T028 [P] [US1] Create welcome-notebook builder `frontend/packages/labs/notebook-lab/src/welcome/welcomeNotebook.ts` (returns a `Notebook` per `data-model.md §1` with one markdown + one code cell, std-lib only per FR-014a)
- [X] T029 [P] [US1] Create the welcome flag handling `frontend/packages/labs/notebook-lab/src/welcome/welcomeFlag.ts` (prefs key `nblab.welcome.shown.<sessionId>`)
- [X] T030 [US1] Implement the cold-open dispatch in `frontend/packages/labs/notebook-lab/src/lab-root.tsx` per `contracts/url-contracts.md` resolution table
- [X] T031 [P] [US1] Create the Pyodide worker `frontend/packages/labs/notebook-lab/src/runtime/PyodideWorker.ts` per `contracts/worker-protocol.md` — initialize, run, reset, input_response handling
- [X] T032 [P] [US1] Create the Pyodide provider `frontend/packages/labs/notebook-lab/src/runtime/PyodideProvider.tsx` that owns the worker lifecycle and routes outputs through the runtime store
- [X] T033 [P] [US1] Create the runtime store `frontend/packages/labs/notebook-lab/src/runtime/runtimeStore.ts` (status, running cell id, interrupt buffer, input handshake state)
- [X] T034 [P] [US1] Add Python prelude files `frontend/packages/labs/notebook-lab/src/runtime/{async_input.py,python_init.py,python_reset_globals.py}` (verbatim ports from jupyter-k12 with attribution comment)
- [X] T035 [P] [US1] Add the additional-packages helper `frontend/packages/labs/notebook-lab/src/runtime/additionalPackagesFromCode.ts`
- [X] T036 [P] [US1] Add globals-templating helper `frontend/packages/labs/notebook-lab/src/runtime/globalsTemplating.ts` (`{{VAR}}` substitution; locale-aware fallback chain)
- [X] T037 [US1] Create the basic `CodeCell.tsx` at `frontend/packages/labs/notebook-lab/src/cells/code/CodeCell.tsx` with a single primary "Try it" button — empty editor, no widgets, no error UX yet (those land in later phases)
- [X] T038 [P] [US1] Create the CodeMirror host `frontend/packages/labs/notebook-lab/src/cells/code/CodeEditor.tsx` with Python language, basicSetup, light/dark themes
- [X] T039 [P] [US1] Create CodeMirror theme bridge `frontend/packages/labs/notebook-lab/src/cells/code/themes.ts` (basicLight + materialDark, selected by `useLabTheme()`)
- [X] T040 [P] [US1] Create the basic markdown cell `frontend/packages/labs/notebook-lab/src/cells/markdown/MarkdownCell.tsx` (marked + DOMPurify, GFM + breaks)
- [X] T041 [P] [US1] Create the cell-list dispatcher `frontend/packages/labs/notebook-lab/src/cells/CellList.tsx` per the `data-model.md §2` dispatch table; raw/chat → placeholder, raw/video → placeholder (US7 fills), raw/other → unsupported
- [X] T042 [US1] Create the renderer `frontend/packages/labs/notebook-lab/src/renderer/NotebookView.tsx` showing title only (goal, lesson-complete, save chip land in later phases)
- [X] T043 [US1] Wire the welcome-open path in `lab-root.tsx`: on first open, write the welcome notebook to IndexedDB, set the per-session welcome flag, route to `NotebookView`
- [X] T044 [US1] Add basic autosave `frontend/packages/labs/notebook-lab/src/renderer/useAutoSave.ts` (2 s debounce on `updated`, save through `notebookRepo`, no UI chip yet)
- [X] T045 [US1] Manual SC-001 verification per `quickstart.md §1` — fresh install, three-tap to first result, under ten seconds on a mid-range device

**Checkpoint**: A learner can install, pick a session label, tap Try it, and see Python output. The MVP delivers.

---

## Phase 4: User Story 3 — Empathetic error UX (Priority: P1)

**Goal**: A failed cell shows a plain-English summary, line highlight, and Try-again — never a raw traceback as the first thing.

**Independent Test**: SC-012 — type `print(undefined)`, run, see empathy card; fix, run, see success.

### Tests for User Story 3

- [X] T046 [P] [US3] Component test for `EmpathyCard.tsx` in `frontend/packages/labs/notebook-lab/src/cells/code/__tests__/EmpathyCard.test.tsx` rendering a `NameError`, asserting (a) one-line summary, (b) "Show details" disclosure, (c) "Try again" button
- [X] T047 [P] [US3] Test extractor `frontend/packages/labs/notebook-lab/src/cells/code/__tests__/extractException.test.ts` against a known Pyodide traceback string — assert `ename`, `evalue`, and inferred line number

### Implementation for User Story 3

- [X] T048 [P] [US3] Implement the traceback parser `frontend/packages/labs/notebook-lab/src/cells/code/extractException.ts` (regex `File "<exec>", line N` against the last frame; produce `{ name, message, line? }`)
- [X] T049 [P] [US3] Implement the empathy summary mapping `frontend/packages/labs/notebook-lab/src/cells/code/empathyMessages.ts` (table of common Python exceptions → localized plain-English templates; fallback to `${ename}: ${evalue}`)
- [X] T050 [US3] Add the `EmpathyCard` component `frontend/packages/labs/notebook-lab/src/cells/code/EmpathyCard.tsx` (summary, optional line-pin button, Show details disclosure, single Try again CTA, reduced-motion respect)
- [X] T051 [US3] Add the `OutputRegion` `frontend/packages/labs/notebook-lab/src/cells/code/OutputRegion.tsx` that renders success (result + collapsed stdout) or error (EmpathyCard) — single region per FR-010a; success beat per FR-010b
- [X] T052 [US3] Wire offending-line highlight in `CodeEditor.tsx` (CM6 decoration via a `setLineHighlight(line)` API)
- [X] T053 [US3] Update `CodeCell.tsx` to consume `OutputRegion` and surface "Try again" by re-running the cell
- [X] T054 [P] [US3] Add localized strings for empathy templates to `frontend/packages/labs/notebook-lab/src/i18n/labels/renderer.*.json` (English + stubs for the other three locales)
- [X] T055 [US3] Manual SC-012 verification per `quickstart.md §12`

**Checkpoint**: Errors no longer kill the learner. The single highest-leverage panel change ships.

---

## Phase 5: User Story 1b — Offline floor for the whole library (Priority: P1)

**Goal**: After one online launch, every bundled sample opens, runs, edits, autosaves, and survives a force-quit offline.

**Independent Test**: SC-002 — airplane mode, every sample opens; edit → quit → relaunch offline → edit persists.

### Tests for User Story 1b

- [X] T056 [P] [US1] Test the seeder idempotency in `frontend/packages/labs/notebook-lab/src/storage/__tests__/seeder.test.ts` — second seed call on the same session does not duplicate, does not clobber a modified record, but does re-seed pristine records when `seedVersion` rises
- [X] T057 [P] [US1] Test the autosave save-status state machine in `frontend/packages/labs/notebook-lab/src/renderer/__tests__/useAutoSave.test.ts` (idle → saving → saved → idle; error path on quota throw)
- [X] T058 [P] [US1] PWA precache assertion: a unit test in `frontend/packages/labs/notebook-lab/src/__tests__/pwa.test.ts` that imports the lab's vite manifest and asserts the Pyodide bootstrap (`pyodide.mjs` + `.wasm`) is in the precache glob

### Implementation for User Story 1b

- [X] T059 [P] [US1] Implement the sample manifest schema + reader in `frontend/packages/labs/notebook-lab/src/storage/seeder.ts` (consumes `samples/index.json`, calls `notebookRepo.saveNotebook`, writes per-session seed-version stamps, respects per-sample content-hash skip)
- [X] T060 [P] [US1] Author the sample manifest at `frontend/packages/labs/notebook-lab/samples/index.json` — 18 entries per `spec.md` FR-024, each with `file`, `folder`, `author`, `seedId`, `seedVersion`, and a `goal` (locale-aware) — backfill-required content per FR-024a (curriculum input expected; engineering checks in placeholders if curriculum lags)
- [X] T061 [P] [US1] Drop the 18 bundled `.ipynb` files into `frontend/packages/labs/notebook-lab/samples/` (vendored verbatim from `jupyter-k12/samples/`)
- [X] T062 [US1] Hook the seeder into `SessionGate` so it runs on first activation of a session with empty storage
- [X] T063 [P] [US1] Extend the studio `vite-plugin-pwa` config in `frontend/apps/studio/vite.config.ts` to include the lab chunk and the Pyodide bootstrap blobs in the precache glob (`globPatterns`)
- [X] T064 [P] [US1] Confirm SW registration gate in `frontend/apps/studio/entrypoints/application.tsx` is unchanged and gated on `!Capacitor.isNativePlatform()`
- [X] T065 [P] [US1] Add the save-status chip `frontend/packages/labs/notebook-lab/src/renderer/HeaderChip.tsx` (idle/saving/saved/error states; 2 s hold; suppressed when idle; non-animated under reduced-motion)
- [X] T066 [US1] Update autosave (T044) to also persist on cell focus-change, route-change, and `visibilitychange` per FR-023
- [X] T067 [P] [US1] Handle `QuotaExceededError` in `notebookRepo` per `contracts/indexeddb-schema.md` — set save state to error, offer "Save to file", emit `nblab.quota.exceeded` telemetry
- [X] T068 [US1] Manual SC-002 verification per `quickstart.md §2`

**Checkpoint**: full sample library works offline after one online install. Floor secured.

---

## Phase 6: User Story 9 — Shared classroom device session boundary (Priority: P1)

**Goal**: Multiple learners on one device do not see each other's notebooks; sessions are local, no PII collected.

**Independent Test**: SC-013 — three sessions on one device, each isolated, switch between them preserves state.

### Tests for User Story 9

- [X] T069 [P] [US9] Test session-keyed storage isolation in `frontend/packages/labs/notebook-lab/src/storage/__tests__/notebookRepo.session-isolation.test.ts` — write to session A, read with session B as active, assert zero records
- [X] T070 [P] [US9] Test the idle-timeout reset in `frontend/packages/labs/notebook-lab/src/session/__tests__/sessionStore.idle.test.ts` (fake timers; assert active session clears after 20 minutes)
- [X] T071 [P] [US9] Test the session-label PII assertion in the telemetry wrapper test (already created at T022 — add a case)

### Implementation for User Story 9

- [X] T072 [P] [US9] Build the session picker `frontend/packages/labs/notebook-lab/src/session/SessionPicker.tsx` (free-text label OR 4-char code; existing-session list; localized; treats label as PII for telemetry)
- [X] T073 [P] [US9] Add the `SessionGate` wrapper component `frontend/packages/labs/notebook-lab/src/session/SessionGate.tsx` that shows the picker when `activeId === null` and forwards to children otherwise
- [X] T074 [P] [US9] Add the "Sign out of this session" affordance in `frontend/packages/labs/notebook-lab/src/settings/SettingsView.tsx` (placeholder file — full settings later in Phase 12)
- [X] T075 [US9] Wire `SessionGate` into `lab-root.tsx` per the cold-open dispatch
- [X] T076 [P] [US9] Add a destructive "Delete this session" affordance in Settings that cascades through `notebookRepo.deleteSession`
- [X] T077 [US9] Manual SC-013 verification per `quickstart.md §13`

**Checkpoint**: Shared-device safety holds. P1 set complete. **This is the MVP slice.**

---

## Phase 7: User Story 2 — Curriculum delivery by shareable URL + join code (Priority: P2)

**Goal**: Teachers share notebooks via a join code (preferred) or a `?github=` URL; learners import frictionlessly.

**Independent Test**: SC-003 — open a `?github=` URL on a cold cache, see the notebook open within thirty seconds.

### Tests for User Story 2

- [X] T078 [P] [US2] Test the GitHub URL rewrite in `frontend/packages/labs/notebook-lab/src/storage/__tests__/githubUrl.test.ts` (blob, raw, other host, malformed)
- [X] T079 [P] [US2] Test the importer pipeline in `frontend/packages/labs/notebook-lab/src/storage/__tests__/importer.test.ts` — fetched bytes → parse → validate → backfill ids → folder normalize → fresh notebook id → persist; failure paths (non-2xx, parse error, not Jupyter) → no partial record
- [X] T080 [P] [US2] Test the join-code resolver fallback in `frontend/packages/labs/notebook-lab/src/storage/__tests__/joinCode.test.ts` against a mocked 302 from `code.org/go/<code>`

### Implementation for User Story 2

- [X] T081 [P] [US2] Implement the GitHub URL rewriter `frontend/packages/labs/notebook-lab/src/storage/githubUrl.ts` per `contracts/url-contracts.md` (verbatim port from jupyter-k12)
- [X] T082 [P] [US2] Implement the importer `frontend/packages/labs/notebook-lab/src/storage/importer.ts` covering file / URL / `?github=` / join-code per `contracts/url-contracts.md` "Import flow (canonical)"
- [X] T083 [P] [US2] Implement the join-code resolver `frontend/packages/labs/notebook-lab/src/storage/joinCode.ts` — primary path via `@code-dot-org/core` API client (if exposed), fallback to `code.org/go/<code>` 302 follow
- [X] T084 [P] [US2] Build `UrlImportDialog` `frontend/packages/labs/notebook-lab/src/dialogs/UrlImportDialog.tsx` (MUI dialog, localized, validates URL, surfaces importer errors)
- [X] T085 [P] [US2] Build `JoinCodeDialog` `frontend/packages/labs/notebook-lab/src/dialogs/JoinCodeDialog.tsx` (uppercase-on-input, regex validation, calls resolver + importer)
- [X] T086 [P] [US2] Build the File picker affordance (no dedicated dialog; an `<input type="file" accept=".ipynb">` mounted in the index)
- [X] T087 [US2] Wire `?github=` query-parameter handling in `lab-root.tsx`: on mount, if param present, run import pipeline then `router.history.replaceState` to strip it
- [X] T088 [US2] Telemetry: emit `nblab.import.attempt`, `nblab.import.success`, `nblab.import.failure` events through the wrapper; no URL content in payloads
- [X] T089 [US2] Manual SC-003 verification per `quickstart.md §3`

**Checkpoint**: Teachers can deliver curriculum. The Assigned section starts populating in real classrooms.

---

## Phase 8: User Story 5 — Continue / Assigned / Library index (Priority: P2)

**Goal**: A learner-friendly index — three named sections, no folder words, lessons as a vertical path.

**Independent Test**: SC-007 — open the index with one recent notebook, one imported notebook, samples present; the three sections render in order with no "folder" string visible.

### Tests for User Story 5

- [X] T090 [P] [US5] Component test for `IndexView` in `frontend/packages/labs/notebook-lab/src/index/__tests__/IndexView.test.tsx` asserting the three sections render in order and no chrome string contains a `/` path
- [X] T091 [P] [US5] Unit test for unit-name derivation `frontend/packages/labs/notebook-lab/src/index/__tests__/unitName.test.ts` (`/lessons/unit3` → "Unit 3", `/foo-bar` → "Foo Bar")

### Implementation for User Story 5

- [X] T092 [P] [US5] Implement `unitName.ts` `frontend/packages/labs/notebook-lab/src/index/unitName.ts` (last segment, hyphens → spaces, title-case)
- [X] T093 [P] [US5] Build `ContinueRow` `frontend/packages/labs/notebook-lab/src/index/ContinueRow.tsx` (top 3 by `lastModified`)
- [X] T094 [P] [US5] Build `AssignedRow` `frontend/packages/labs/notebook-lab/src/index/AssignedRow.tsx` (`source` starts with `import-`; show `metadata.author` chip)
- [X] T095 [P] [US5] Build `LibraryUnits` `frontend/packages/labs/notebook-lab/src/index/LibraryUnits.tsx` (group by `metadata.folder`; expandable bands; "More notebooks" group at bottom for unit-less)
- [X] T096 [P] [US5] Build `LessonNode` `frontend/packages/labs/notebook-lab/src/index/LessonNode.tsx` (a node in the vertical path; completed/current/future visual states)
- [X] T097 [P] [US5] Build `EmptyState` `frontend/packages/labs/notebook-lab/src/index/EmptyState.tsx` (only reachable on edge cases — seeding failed, etc.)
- [X] T098 [US5] Compose `IndexView` `frontend/packages/labs/notebook-lab/src/index/IndexView.tsx`
- [X] T099 [US5] Wire back-control navigation in `NotebookView` to return to the unit context (per FR-033)
- [X] T100 [US5] Add bottom-nav (Notebooks / Settings) inside the lab navigator (`lab-root.tsx`); responsive via container queries to a left-rail or top-tabs on larger viewports

**Checkpoint**: The index reads like a learning surface, not a file browser.

---

## Phase 9: User Story 3b — Live form widgets as questions (Priority: P2)

**Goal**: `#@param` annotations render as labelled controls above the editor; changes rewrite the source line in place and highlight the change briefly.

**Independent Test**: Open `kitchen_sink.ipynb`, see widgets above each param cell, drag/select/toggle, observe highlight + source rewrite + new run uses new value.

### Tests for User Story 3b

- [X] T101 [P] [US3] Test `parameterParser.ts` in `frontend/packages/labs/notebook-lab/src/cells/code/__tests__/parameterParser.test.ts` against the four kinds + author `prompt:` field + locale side-table
- [X] T102 [P] [US3] Test source-line rewrite in `frontend/packages/labs/notebook-lab/src/cells/code/__tests__/parameterRewrite.test.ts` — preserves trailing comment, preserves newline, no off-by-one

### Implementation for User Story 3b

- [X] T103 [P] [US3] Port the parser `frontend/packages/labs/notebook-lab/src/cells/code/parameterParser.ts` (from `jupyter-k12/src/celltypes/code/parameterParser.ts` with attribution + author `prompt:` support)
- [X] T104 [P] [US3] Port the types `frontend/packages/labs/notebook-lab/src/cells/code/parameterTypes.ts`
- [X] T105 [P] [US3] Implement source rewrite `frontend/packages/labs/notebook-lab/src/cells/code/parameterRewrite.ts` (preserve trailing comment + newline)
- [X] T106 [P] [US3] Build `ParameterControls` `frontend/packages/labs/notebook-lab/src/cells/code/ParameterControls.tsx` (value / slider / dropdown / boolean; uses DSCO Slider, Dropdown, Toggle, TextField per `design-system` skill)
- [X] T107 [US3] Wire `ParameterControls` above the editor in `CodeCell.tsx`; on change, call rewrite then briefly highlight the changed line for ≥500 ms
- [X] T108 [P] [US3] Add prompt-derivation fallback `frontend/packages/labs/notebook-lab/src/cells/code/promptFallback.ts` (`TEMPERATURE` → "Try a temperature", etc.)
- [X] T109 [US3] Manual verification with `kitchen_sink.ipynb` — every widget kind round-trips

**Checkpoint**: The marquee panel-driven feature ships.

---

## Phase 10: User Story 6 — Long-running cell interruption + reset (Priority: P2)

**Goal**: A Stop control returns the lab to interactive within half a second on devices with `SharedArrayBuffer`; on devices without, the worker terminates and re-spawns with a clear banner. A Reset Globals action keeps the runtime warm but clears user globals.

**Independent Test**: SC-004 + the no-interrupt fallback path.

### Tests for User Story 6

- [X] T110 [P] [US6] Test interrupt-buffer write path in `frontend/packages/labs/notebook-lab/src/runtime/__tests__/interrupt.test.ts` (mock worker, assert provider writes `2` on Stop)
- [X] T111 [P] [US6] Test the fallback terminate/respawn flow in `frontend/packages/labs/notebook-lab/src/runtime/__tests__/respawnFallback.test.ts`

### Implementation for User Story 6

- [X] T112 [P] [US6] Add Stop / Reset affordances to `CodeControls.tsx` `frontend/packages/labs/notebook-lab/src/cells/code/CodeControls.tsx` (Stop visible only while running; Reset Globals in the renderer header — placed in `NotebookView`)
- [X] T113 [US6] Implement Stop in `PyodideProvider.tsx`: write `2` to interrupt buffer when present; else `worker.terminate()` + spawn new worker + emit "Globals were reset" banner
- [X] T114 [P] [US6] Implement Reset Globals: `worker.postMessage({ type: 'reset' })`; provider awaits `reset_completed`
- [X] T115 [US6] Manual SC-004 verification per `quickstart.md §4`

**Checkpoint**: Beginners can write infinite loops without rage-quitting.

---

## Phase 11: User Story 10 — Lesson goal + completion moment (Priority: P2)

**Goal**: Notebooks declare a one-liner goal; a non-blocking lesson-complete surface fires when every runnable cell has been run; "Next lesson" CTA when one exists in the unit.

**Independent Test**: SC-011 — open a bundled notebook with `metadata.goal`, run every runnable cell, see the completion surface.

### Tests for User Story 10

- [X] T116 [P] [US10] Test the completion derivation in `frontend/packages/labs/notebook-lab/src/progress/__tests__/lessonCompletion.test.ts` (notebook with N runnable cells; after N runs, isComplete=true)
- [X] T117 [P] [US10] Test next-lesson resolution `frontend/packages/labs/notebook-lab/src/progress/__tests__/nextLesson.test.ts` (same unit, sorted by manifest order; null at unit end)

### Implementation for User Story 10

- [X] T118 [P] [US10] Implement `lessonCompletion.ts` `frontend/packages/labs/notebook-lab/src/progress/lessonCompletion.ts` (consumes the cdo.runHistory cell-metadata array per `data-model.md §8`)
- [X] T119 [P] [US10] Implement `cdoRunHistory.ts` `frontend/packages/labs/notebook-lab/src/progress/cdoRunHistory.ts` (writes `notebook.metadata.cdo.runHistory` from execute_completed/error in `PyodideProvider.tsx`)
- [X] T120 [P] [US10] Implement `completionStore.ts` `frontend/packages/labs/notebook-lab/src/progress/completionStore.ts` (React store; exposes `useCompletion(notebookId)`)
- [X] T121 [P] [US10] Build `LessonGoal` `frontend/packages/labs/notebook-lab/src/renderer/LessonGoal.tsx` (renders `metadata.goal` with locale fallback chain)
- [X] T122 [US10] Build `LessonComplete` `frontend/packages/labs/notebook-lab/src/renderer/LessonComplete.tsx` (non-blocking; goal echo; Next-lesson CTA; "Back to your path" when none)
- [X] T123 [US10] Wire goal display + completion fire in `NotebookView.tsx`
- [X] T124 [P] [US10] Add the `cdo.runHistory` exclusion in the export path (the import/export round-trip; ensure `.ipynb` exported via "Save to file" strips the `cdo` namespace)
- [X] T125 [US10] Manual SC-011 verification per `quickstart.md §11`

**Checkpoint**: Notebook tool becomes lesson surface.

---

## Phase 12: User Story 4 — Localization + RTL (Priority: P2)

**Goal**: Four locales (en-US, ja-JP, hi-IN, fa-IR) toggle live; chrome flips direction for RTL; per-cell + globals locale overrides honored.

**Independent Test**: SC-005 — switch to Hindi, all chrome updates within one second; switch to Farsi, page direction flips.

### Tests for User Story 4

- [X] T126 [P] [US4] Test locale fallback chain in `frontend/packages/labs/notebook-lab/src/i18n/__tests__/fallback.test.ts` (active → en-US → default; missing key surfaces console warning in dev)
- [X] T127 [P] [US4] Test direction flip in `frontend/packages/labs/notebook-lab/src/i18n/__tests__/direction.test.ts` (Farsi → `<html dir="rtl">`)

### Implementation for User Story 4

- [X] T128 [P] [US4] Fill the Japanese, Hindi, Farsi label bundles `frontend/packages/labs/notebook-lab/src/i18n/labels/{notebooks,settings,renderer,navigation,themes}.{ja-JP,hi-IN,fa-IR}.json` (curriculum-string track; engineers seed with English text for keys missing translations, mark for translation pass)
- [X] T129 [P] [US4] Implement per-cell `i18n` source-swap in `MarkdownCell.tsx` (already implied; ensure it consumes `useString` locale and the cell's `metadata.i18n[locale]`)
- [X] T130 [P] [US4] Implement globals locale resolution in `globalsTemplating.ts` (active locale → en-US → default per `data-model.md §1`)
- [X] T131 [P] [US4] Build `LocalePicker` `frontend/packages/labs/notebook-lab/src/settings/LocalePicker.tsx` (native + English names side-by-side)
- [X] T132 [P] [US4] Build `ThemePicker` `frontend/packages/labs/notebook-lab/src/settings/ThemePicker.tsx` (light/dark; dark default per spec)
- [X] T133 [US4] Wire pickers into `SettingsView.tsx`; persist via `prefsStore` scoped to the active session
- [X] T134 [P] [US4] Add RTL-aware DSCO/MUI overrides where needed (back arrows, breadcrumbs, bottom-nav reverse — likely centralized in `theme/`)
- [X] T135 [US4] Manual SC-005 verification per `quickstart.md §5`

**Checkpoint**: The lab speaks four languages out of the box.

---

## Phase 13: User Story 11 — Teacher-visible completion artifact (Priority: P2)

**Goal**: A single tap produces a printable summary of the learner's session on this notebook; a QR-encoded URL fragment lets a teacher view the same summary on their device without a server round-trip.

**Independent Test**: SC-014 — generate artifact, print to PDF on web, save on native, scan QR on teacher's device.

### Tests for User Story 11

- [X] T136 [P] [US11] Test PII scrub in `frontend/packages/labs/notebook-lab/src/artifact/__tests__/artifactPayload.test.ts` against a fixture notebook containing forbidden items (learner-typed source, faux API key in metadata, raw runHistory) — assert all stripped
- [X] T137 [P] [US11] Test the artifact decode in `frontend/packages/labs/notebook-lab/src/artifact/__tests__/decode.test.ts` round-trips through base64url + zlib

### Implementation for User Story 11

- [X] T138 [P] [US11] Implement payload builder `frontend/packages/labs/notebook-lab/src/artifact/artifactPayload.ts` per `contracts/completion-artifact.md` shape + exclusion rules
- [X] T139 [P] [US11] Implement encode/decode `frontend/packages/labs/notebook-lab/src/artifact/codec.ts` (base64url + zlib via `pako`)
- [X] T140 [P] [US11] Build `CompletionArtifact` `frontend/packages/labs/notebook-lab/src/artifact/CompletionArtifact.tsx` (print-friendly stylesheet)
- [X] T141 [P] [US11] Build `ArtifactQR` `frontend/packages/labs/notebook-lab/src/artifact/ArtifactQR.tsx` (uses `qrcode`; size-aware; "QR is large — print to PDF instead" hint when payload > ~1.5 KB)
- [X] T142 [P] [US11] Wire artifact route — `lab-root.tsx` recognizes `channelId === 'artifact'`, decodes `#artifact=` fragment, renders read-only artifact view per `contracts/url-contracts.md`
- [X] T143 [US11] Add the "Share with teacher" affordance to `NotebookView.tsx` header
- [X] T144 [P] [US11] Implement print-to-PDF on web via `window.print()` and a print-only stylesheet at `frontend/packages/labs/notebook-lab/src/artifact/print.css`
- [X] T145 [P] [US11] Implement file-save on native using a Capacitor file-save approach (PDF if available, image fallback) `frontend/packages/labs/notebook-lab/src/artifact/saveOnNative.ts`
- [X] T146 [P] [US11] Emit `nblab.artifact.shared` telemetry with cell count + platform only — no PII
- [X] T147 [US11] Manual SC-014 verification per `quickstart.md §14`

**Checkpoint**: Teachers have a collectable artifact. The account-less-v1 gap is closed.

---

## Phase 14: User Story 7 — Video cells (Priority: P3)

**Goal**: Curriculum videos play inline; system-browser fallback when embed fails or Capacitor blocks.

**Independent Test**: `video_test.ipynb` opens; YouTube + direct .mp4 both render; iframe-fail path shows the fallback button.

### Tests for User Story 7

- [X] T148 [P] [US7] Test host detection in `frontend/packages/labs/notebook-lab/src/cells/video/__tests__/detect.test.ts` (youtube.com, youtu.be, vimeo.com, raw .mp4)

### Implementation for User Story 7

- [X] T149 [P] [US7] Implement host detection `frontend/packages/labs/notebook-lab/src/cells/video/detect.ts`
- [X] T150 [P] [US7] Build `VideoCell` `frontend/packages/labs/notebook-lab/src/cells/video/VideoCell.tsx` (iframe for YouTube/Vimeo with 2 s timeout; video.js for direct media; fallback button opens via `@capacitor/browser` on native, `window.open` on web)
- [X] T151 [US7] Hook `VideoCell` into the dispatcher in `CellList.tsx`

**Checkpoint**: Multimodal lessons supported.

---

## Phase 15: User Story 8 — Per-notebook globals authoring (Priority: P3)

**Goal**: A curriculum author can open the globals dialog and add/edit variables with per-locale values.

**Independent Test**: Open the globals dialog, add a variable, reference it via `{{NAME}}` in a markdown cell, switch locale, see the substituted value change.

### Tests for User Story 8

- [X] T152 [P] [US8] Test identifier-pattern validation in `frontend/packages/labs/notebook-lab/src/dialogs/__tests__/GlobalsDialog.validate.test.ts` (`/^[a-zA-Z_][a-zA-Z0-9_]*$/`)

### Implementation for User Story 8

- [X] T153 [P] [US8] Build `GlobalsDialog` `frontend/packages/labs/notebook-lab/src/dialogs/GlobalsDialog.tsx` (two panes: variable list + default + locale overrides; DSCO components; localized)
- [X] T154 [US8] Add a globals affordance to the renderer header (icon button opens `GlobalsDialog`); persist via `notebookRepo`

**Checkpoint**: All user stories shipped.

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, observability hardening, and final validation across the spec's success criteria.

- [X] T155 [P] Build `AccessibilityPanel` `frontend/packages/labs/notebook-lab/src/settings/AccessibilityPanel.tsx` with toggles for read-aloud, OpenDyslexic, line-spacing, focus mode per FR-038a
- [X] T156 [P] Bundle OpenDyslexic font (`.woff2`) at `frontend/packages/labs/notebook-lab/public/fonts/opendyslexic.woff2`; activate via `data-font="opendyslexic"` on the lab root
- [X] T157 [P] Implement read-aloud `frontend/packages/labs/notebook-lab/src/settings/readAloud.ts` using `@capacitor-community/text-to-speech` on native and `window.speechSynthesis` on web
- [X] T158 [P] Implement line-spacing + focus-mode CSS variables on the lab root
- [X] T159 [P] Add the `InputDialog` `frontend/packages/labs/notebook-lab/src/dialogs/InputDialog.tsx` responding to worker `input_request` per `contracts/worker-protocol.md`
- [X] T160 [P] Add the `ChatPlaceholder` `frontend/packages/labs/notebook-lab/src/cells/chat-placeholder/ChatPlaceholder.tsx` (US7 note; localized "AI features are not available in this version")
- [X] T161 [P] Add the `UnsupportedCell` `frontend/packages/labs/notebook-lab/src/cells/unsupported/UnsupportedCell.tsx`
- [X] T162 [P] Add `ResourcesDrawer` `frontend/packages/labs/notebook-lab/src/renderer/ResourcesDrawer.tsx` (paperclip-icon menu; for v1 just exposes Globals, Reset, Share affordances)
- [X] T163 [P] Bundle-size verification: `yarn workspace @code-dot-org/notebook-lab build` then assert lab chunk gzip ≤ 350 KB (excl. Pyodide, video.js, qrcode, OpenDyslexic font) via a CI script `frontend/packages/labs/notebook-lab/scripts/check-bundle-size.sh`
- [ ] T164 [P] Run Lighthouse PWA audit on `/app/projects/notebook/default/edit` against a built studio per `quickstart.md §6`; capture score and add to release notes
- [ ] T165 [P] Run axe accessibility sweep on the index, the renderer, the session picker, the settings view; address any AA violation
- [ ] T166 [P] Color-contrast verification in both themes; capture screenshots in release notes
- [ ] T167 [P] Reduced-motion verification — toggle OS reduced-motion, confirm autosave chip, success beat, and lesson-complete do not animate
- [ ] T168 SC-008 telemetry hygiene: run a representative one-hour session with `NBLAB_TELEMETRY_DEBUG=1`, capture all telemetry, assert no PII per `quickstart.md §8`
- [ ] T169 SC-010 classroom-scale runtime acquisition: stage thirty devices on throttled network with IT pre-cache applied, verify all reach "runnable" within one class period per `quickstart.md §10`
- [X] T170 Run the full `quickstart.md` SC-001..SC-014 manual matrix; document results in `specs/1192025-k12-notebook-lab/verification/manual-checks-2026-XX-XX.md` (create at run time)
- [X] T171 [P] Update the lab's `frontend/packages/labs/notebook-lab/AGENTS.md` with: do-not-modify of `routeTree.gen.ts`, the design-system + material-ui-styling skill links, the no-hex color rule, the structured-clone guard for worker messages, and a pointer to `specs/1192025-k12-notebook-lab/`
- [X] T172 [P] Update `frontend/AGENTS.md` (Turborepo conventions) with a one-line entry under "labs" pointing to the notebook-lab package; measure and report the token delta in the PR description per the Continuous-Improvement note in the repo root AGENTS.md
- [X] T173 [P] Add the lab to `frontend/turbo.json` task wiring if not picked up automatically
- [ ] T174 Pre-commit + typecheck + test pass on the whole branch: `./tools/hooks/pre-commit && yarn workspace @code-dot-org/notebook-lab typecheck && yarn workspace @code-dot-org/notebook-lab test`
- [ ] T175 Open the PR with the panel-review-notes section quoted in the description, the bundle-size + Lighthouse + a11y reports linked, and the SC-010 staged-deploy results attached

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies; start immediately
- **Phase 2 (Foundational)**: depends on Phase 1 complete; **blocks every user-story phase**
- **Phase 3 (US1) / Phase 4 (US3) / Phase 5 (US1b) / Phase 6 (US9)** — the P1 set: can start in parallel after Phase 2
  - **US1b depends on US1 + US9** (welcome notebook + sessions must exist to test offline-from-fresh)
  - **US3 (empathy errors) depends on US1** (CodeCell must exist before we can swap its output region)
  - US9 (session boundary) is purely additive on top of Phase 2 and can run in parallel with US1
- **Phases 7–13** (P2): start after their P1 ancestors land
  - US2 (import) ⟂ US1, US9
  - US5 (index) depends on US1, US9, and US2 (Assigned needs imports to exercise)
  - US3b (param widgets) depends on US1 + US3 (CodeCell + EmpathyCard)
  - US6 (interrupt) depends on US1 (worker exists)
  - US10 (completion) depends on US1 + US3 (run history flows through OutputRegion)
  - US4 (i18n) depends on Phase 2 i18n scaffolding only; can land any time after Phase 2 but is most useful once US10 ships (goal echo is locale-aware)
  - US11 (artifact) depends on US10 (completion state) and US5 (unit name)
- **Phases 14–15** (P3): pure additions
- **Phase 16** (Polish): final; depends on all desired user stories

### Within each user story

- Test tasks marked with the story label come before implementation tasks of the same number range when written; written-first-fail-first is encouraged.
- Models (data shapes, parsers) before components, components before wire-ups.
- Each story ends with a manual SC verification.

### Parallel opportunities

- All of Phase 2's `[P]`-marked tasks can run in parallel across developers — they touch disjoint files.
- After Phase 2, four developers can take US1 / US3 / US1b prep / US9 concurrently.
- Within Phase 7 (US2), parser + importer + dialogs + resolver are four parallel slices.
- Within Phase 8 (US5), the six index components are six parallel slices behind shared utilities.

---

## Parallel example — Phase 2 foundation kickoff

```text
# Single developer, four shells, or four developers — these tasks touch disjoint files
Task: T011 Create the IndexedDB wrapper in frontend/packages/labs/notebook-lab/src/storage/NotebookLabDB.ts
Task: T013 Create the prefs-store abstraction in frontend/packages/labs/notebook-lab/src/storage/prefsStore.ts
Task: T017 Create the StringsProvider in frontend/packages/labs/notebook-lab/src/i18n/StringsProvider.tsx
Task: T021 Create the telemetry wrapper in frontend/packages/labs/notebook-lab/src/telemetry/wrapper.ts
```

## Parallel example — User Story 1 implementation kickoff

```text
# After T030 lands cold-open dispatch, the runtime + cell slices parallelize
Task: T031 Pyodide worker in frontend/packages/labs/notebook-lab/src/runtime/PyodideWorker.ts
Task: T037 Basic CodeCell in frontend/packages/labs/notebook-lab/src/cells/code/CodeCell.tsx
Task: T040 Basic MarkdownCell in frontend/packages/labs/notebook-lab/src/cells/markdown/MarkdownCell.tsx
Task: T041 CellList dispatcher in frontend/packages/labs/notebook-lab/src/cells/CellList.tsx
```

---

## Implementation strategy

### MVP first (P1 set — US1 + US3 + US1b + US9)

1. Phase 1 + Phase 2 in sequence (sequential within phase, parallel across `[P]`).
2. Phase 3 (US1).
3. Phase 4 (US3) — promoted to P1 by panel; ship with US1 or as a fast follow.
4. Phase 5 (US1b) — offline floor.
5. Phase 6 (US9) — shared-device.
6. **STOP and VALIDATE**: manual SC-001/002/004/008/009/012/013 pass. This is the demo / dogfood milestone.

### Incremental delivery

Add P2 stories in priority order, each landing as an independent PR / sub-PR with its manual SC verification. Recommended order after the P1 milestone:

1. US2 (import) — unlocks teacher use.
2. US5 (index) — unlocks the daily-use surface.
3. US3b (widgets) — unlocks the marquee panel feature.
4. US10 (completion) — unlocks the lesson-surface framing.
5. US4 (locales) — unlocks non-English classrooms.
6. US11 (artifact) — unlocks teacher visibility.
7. US6 (interrupt) — hardens the runtime.

P3 stories (US7 video, US8 globals authoring) land any time after their dependencies; both are short.

Phase 16 (Polish) closes out before release.

### Parallel team strategy (four developers)

After Phase 2:

- Dev A: Phase 3 (US1) → Phase 4 (US3) → Phase 9 (US3b)
- Dev B: Phase 6 (US9) → Phase 8 (US5) → Phase 13 (US11)
- Dev C: Phase 5 (US1b) → Phase 10 (US6) → Phase 14 (US7)
- Dev D: Phase 7 (US2) → Phase 11 (US10) → Phase 12 (US4) → Phase 15 (US8)

Phase 16 splits across the team; the SC verification matrix is the gate.

---

## Notes

- `[P]` tasks touch independent files and have no incomplete-task dependencies within their phase.
- Story labels (`[US1]` etc.) trace each task to a spec user story. Setup, foundational, and polish phases carry no story labels.
- Manual SC verifications (the "Checkpoint" lines) are the gates between phases. None is optional.
- Tests are co-located in `__tests__/` directories alongside the units they exercise; Vitest discovers them automatically.
- Curriculum-content tasks (the sample backfill for `metadata.goal`, locale string translations) are intentionally split into engineering placeholders + a curriculum follow-up; engineering must not block on curriculum, but a release artifact missing samples' goals would violate FR-024a — coordinate before the release branch.
- Every behavior-changing task is paired with a test that exercises it (per Constitution VIII); the task list above includes the test tasks explicitly for the higher-risk surfaces (worker, importer, parser, PII scrub, session isolation). Smaller component tests are expected as part of the implementation tasks themselves.

---

# Round 3 — Journey-picker home + Notebook journey + seat consolidation

These three phases are **appended** to the original plan and use T-IDs starting at T200 so they do not disturb in-flight T-IDs. They implement the round-3 spec additions: US12 (journey-picker home), US13 (Notebook journey), and the FR-022b..022d / FR-045a seat consolidation that replaces the lab's `sessionStore` with an adapter on top of `useActiveSeat`.

**Dependency note**: Phase 17 (picker) and Phase 18 (Notebook journey content) are independent of each other and can land in parallel. Phase 19 (seat consolidation) supersedes Phase 6 of the original plan; if Phase 6 (T072 SessionPicker, T076 delete-session, T077 SC-013 verification) has not yet been started, **skip it** and execute Phase 19 instead. If T072..T076 have already shipped, Phase 19's deletion tasks supersede them.

---

## Phase 17: Journey-picker home (User Story 12, Priority: P1)

**Goal**: A seated learner lands at `/m/home` and sees registered journey tiles (AI Decisions + Notebook in v1); tapping a tile opens the journey directly; deep links can bypass.

**Independent Test**: SC-015 + SC-017 + SC-018 + SC-019 from `quickstart.md` (add a §15–§18 block).

### Tests for User Story 12

- [ ] T200 [P] [US12] Component test `frontend/apps/studio/src/modules/mobile-home/__tests__/HomeView.test.tsx` — renders both tiles synchronously, no network call asserted via `fetch` spy
- [ ] T201 [P] [US12] Test resume-hoist + author-order sort in `frontend/apps/studio/src/modules/mobile-home/__tests__/tileOrder.test.ts` (seat with in-progress journey → that tile first; otherwise manifest order)
- [ ] T202 [P] [US12] Test `?lock=1` mode in `frontend/apps/studio/src/modules/mobile-home/__tests__/lockMode.test.tsx` (back-navigation from journey does not surface picker)
- [ ] T203 [P] [US12] Test gradeBand per-deployment filter in `frontend/apps/studio/src/modules/mobile-home/__tests__/gradeBandFilter.test.ts` (K-2 site config hides `'6-9'` / `'9-12'` tiles; default shows all)

### Implementation for User Story 12

- [ ] T204 [P] [US12] Journey-manifest type `frontend/apps/studio/src/modules/mobile-home/journeys/types.ts` per FR-040b shape
- [ ] T205 [P] [US12] Manifest barrel `frontend/apps/studio/src/modules/mobile-home/journeys/index.ts` exporting `JOURNEYS` as ordered array
- [ ] T206 [P] [US12] AI Decisions manifest `frontend/apps/studio/src/modules/mobile-home/journeys/ai-decisions.journey.ts` (id `'ai-decisions'`, gradeBand `'K-5'`, entryRoute `/m/journey/ai-decisions`, progressSelector reads `seat.journeys['ai-decisions']`)
- [ ] T207 [P] [US12] Notebook manifest `frontend/apps/studio/src/modules/mobile-home/journeys/notebook.journey.ts` (id `'notebook'`, gradeBand `'6-9'` initial — adjust per curriculum, entryRoute `/m/journey/notebook`, progressSelector reads `seat.journeys['notebook']`)
- [ ] T208 [P] [US12] `JourneyTile` `frontend/apps/studio/src/modules/mobile-home/JourneyTile.tsx` (full-bleed row; icon left; title + description; progress chip right reading `state: 'start' | 'continue' | 'done'`; grade-band chip when declared)
- [ ] T209 [P] [US12] `HomeView` `frontend/apps/studio/src/modules/mobile-home/HomeView.tsx` — vertical list, reads `JOURNEYS`, filters by `SiteConfig.homeGradeBands`, sorts by resume-hoist then manifest order
- [ ] T210 [P] [US12] Home route `frontend/apps/studio/src/routes/m/home.tsx` (TanStack file route; do not hand-edit the generated tree)
- [ ] T211 [P] [US12] Catch-all journey route `frontend/apps/studio/src/routes/m/journey/$journeyId.tsx` — looks up manifest, navigates to `entryRoute`; honors `?lock=1`
- [ ] T212 [US12] Update `frontend/apps/studio/src/modules/ai-decisions-mobile/capacitorStart.ts` to redirect to `/m/home` (was the AI Decisions journey direct)
- [ ] T213 [P] [US12] Add gradeBand filter to `SiteConfig` `frontend/apps/studio/src/config/siteConfig.ts` (new optional `homeGradeBands?: GradeBand[]`; default unset shows all)
- [ ] T214 [P] [US12] Deep-link-survives-seat-pick: `/m/journey/<id>` with no active seat stores target in `prefsStore` `pendingJourneyTarget`, redirects to `/m/seats`, after seat-pick reads + clears and navigates to journey (FR-040c + SC-017)
- [ ] T215 [P] [US12] Locale bundles `frontend/apps/studio/src/modules/mobile-home/i18n/labels/home.{en-US,ja-JP,hi-IN,fa-IR}.json` — keys for title, tile-state-{start,continue,done}, gradeBand-chip-{K-5,6-9,9-12}
- [ ] T216 [US12] Manual SC-015 + SC-017 + SC-018 + SC-019 verification per new `quickstart.md §15..§18`

**Checkpoint**: a seated learner can pick a journey; deep links work; teacher-pinned mode works.

---

## Phase 18: Notebook journey content + completion celebration (User Story 13, Priority: P1)

**Goal**: A four-node vertical-path journey teaches the lab UX in ≤ 2 minutes; lands the learner in the Library on completion via the existing `UnitCompleteCelebration`.

**Independent Test**: SC-016 — tap Notebook tile, traverse all four nodes, confirm celebration fires, confirm Library opens.

### Tests for User Story 13

- [ ] T217 [P] [US13] Component test `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/__tests__/NotebookJourney.test.tsx` (renders four nodes, first pulses, taps cycle through completion)
- [ ] T218 [P] [US13] Seat journey-progress update test `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/__tests__/progressTracking.test.ts` (running a node's cell flips its bit in `seat.journeys['notebook']`)
- [ ] T219 [P] [US13] Snapshot test for the four `.ipynb` files at `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/nodes/__tests__/nodes.snapshot.test.ts` — pins shape so curriculum changes are visible in diffs

### Implementation for User Story 13

- [ ] T220 [P] [US13] Author `welcome-01-hello.ipynb` at `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/nodes/welcome-01-hello.ipynb` per spec round-3 content block (one markdown + `print("Hello!")`, `metadata.goal` set, no `{{NAME}}` substitution)
- [ ] T221 [P] [US13] Author `welcome-02-words-and-code.ipynb` (`print(2+2)` plus nudge "try changing 2 to 5")
- [ ] T222 [P] [US13] Author `welcome-03-the-dial.ipynb` (`#@param` slider over `COUNT = 3`, `print("*" * COUNT)`, `prompt:` "How many stars?")
- [ ] T223 [P] [US13] Author `welcome-04-saved.ipynb` (`print` of current time via `datetime`; markdown calls out save chip + Library tab)
- [ ] T224 [P] [US13] Journey route `frontend/apps/studio/src/routes/m/journey/notebook.tsx` — vertical path of four nodes; current pulses; completed fill; mirrors the existing AI Decisions `JourneyPath` pattern
- [ ] T225 [P] [US13] `NotebookNodeView` `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/NotebookNodeView.tsx` — embeds `<NotebookLab channelId={nodeChannelId} />`; on first cell-run-success writes the node-complete bit into `seat.journeys['notebook'].nodes[<i>]`
- [ ] T226 [P] [US13] Extend seat reducer in `frontend/apps/studio/src/modules/seats/useActiveSeat.ts` (post-hoist; see T235) with `MARK_JOURNEY_NODE_COMPLETE` per FR-022c
- [ ] T227 [P] [US13] Reuse `UnitCompleteCelebration` from `frontend/apps/studio/src/modules/ai-decisions-mobile/celebration/UnitCompleteCelebration.tsx` with Notebook-flavored copy strings — pass copy via prop rather than fork
- [ ] T228 [US13] On celebration CTA tap, navigate to `/app/projects/notebook/<channel-id>/edit` (Library) and flip `seat.journeys['notebook'].graduated = true`
- [ ] T229 [P] [US13] *Replay tutorial* affordance in the lab Library's Continue row (overflow chip); re-renders the journey path when tapped
- [ ] T230 [P] [US13] Locale bundles `frontend/apps/studio/src/modules/mobile-home/journeys/notebook/i18n/labels/journey.{en-US,ja-JP,hi-IN,fa-IR}.json` — title, description, celebration-copy, replay-affordance
- [ ] T231 [P] [US13] Curriculum review pass: confirm `metadata.goal` on each of the four nodes reads correctly in all four locales (FR-024a discipline)
- [ ] T232 [US13] Manual SC-016 verification per new `quickstart.md §19` block

**Checkpoint**: Notebook journey is the v1 onboarding for the lab; learner lands in Library on completion; the picker tile reflects the done state.

---

## Phase 19: Seat consolidation — replace lab session with mobile-seat adapter (additive supersession)

**Goal**: Refactor the lab's `sessionStore` (T015) into an adapter over `useActiveSeat`; remove the lab's `SessionPicker`; rename composite-key field from `sessionId` to `seatId`.

**Independent Test**: With the active seat changed mid-session, confirm the lab's notebook list updates within the next render; the lab's `SessionPicker` is no longer reachable from any route; existing tests continue to pass.

### Tests for Phase 19

- [ ] T233 [P] Update / rename `frontend/packages/labs/notebook/src/storage/__tests__/notebookRepo.session-isolation.test.ts` → `seat-isolation.test.ts`, asserting keying by `seatId`
- [ ] T234 [P] New test `frontend/packages/labs/notebook/src/session/__tests__/sessionAdapter.test.tsx` asserting `useSession()` is backed by `useActiveSeat()` — same fields exposed, no call-site behavior change

### Implementation for Phase 19

- [ ] T235 [P] Hoist `seats/` from `ai-decisions-mobile/` to `frontend/apps/studio/src/modules/seats/` per FR-045a; rewrite imports in `ai-decisions-mobile/`. Mechanical refactor; IDE-driven preferred
- [ ] T236 [P] Extend `Seat` in `frontend/apps/studio/src/modules/seats/types.ts` — add `journeys: Record<JourneyId, JourneyProgress>`; convert `JourneyProgress` into the discriminated union from FR-022c; preserve existing shape as the `'ai-decisions'` variant
- [ ] T237 [P] One-shot reconcile in `frontend/apps/studio/src/modules/seats/reconcile.ts` moving existing top-level `JourneyProgress` into `seat.journeys['ai-decisions']` and clearing the legacy field
- [ ] T238 [P] Refactor `frontend/packages/labs/notebook/src/session/sessionStore.ts` into a thin adapter; re-export `useSession()` / `useRequireSession()` backed by `useActiveSeat`; remove idle-timer (seat owns timeouts) and reducer
- [ ] T239 [P] Rename `frontend/packages/labs/notebook/src/session/sessionKey.ts` helpers — `makeKey(sessionId, notebookId)` → `makeKey(seatId, notebookId)`; same for `parseKey`. Update call sites
- [ ] T240 [P] Update `notebookRepo` (T012) + the four indexes — rename `sessionId` → `seatId` in record shape and index `keyPath`. Bump IndexedDB version to `2`; add `onupgradeneeded` migration (pre-launch — one-shot in-place rewrite acceptable)
- [ ] T241 [P] Update `contracts/indexeddb-schema.md` — rename `sessionId` → `seatId` everywhere; bump contract version
- [ ] T242 [P] Delete `frontend/packages/labs/notebook/src/session/SessionPicker.tsx` and its test (T072 — if shipped); remove `SessionGate` from `lab-root.tsx`. The lab now assumes a seat exists because it's only reachable from the picker home
- [ ] T243 [P] Update FR-046 / FR-046a — artifact's session-label field becomes seat color + avatar identifier; update `artifact/artifactPayload.ts` to read from the seat
- [ ] T244 [US3] Implement FR-010c "Did you mean `<symbol>`?" in `frontend/packages/labs/notebook/src/cells/code/empathyMessages.ts` (Levenshtein-1 against builtins, current globals, imported names); render on the empathy card. Add `__tests__/didYouMean.test.ts`
- [ ] T245 [P] Implement FR-023a Ctrl-S / Cmd-S manual save in `frontend/packages/labs/notebook/src/renderer/useManualSave.ts`; bind at renderer root; surface timestamped "saved 9:47:03" distinct from autosave chip
- [ ] T246 [P] Implement FR-046b rolling-backup artifact in `frontend/packages/labs/notebook/src/artifact/rollingBackup.ts` (writes on every autosave to `lastBackup` key per notebook); add "Show last backup" affordance in Settings → destructive section
- [ ] T247 Update plan.md Constitution Tracking + Privacy Review to reflect seat consolidation (no behavior change for privacy; one fewer storage layer)
- [ ] T248 Update `quickstart.md` with SC-015..SC-019 manual verification blocks; remove the SC-013 shared-device-isolation block (now handled by the seat model, not the lab)

**Checkpoint**: One identity model across the app. The lab no longer asks "who are you?" — that's the mobile shell's job.

---

## Updated dependency notes (round 3)

- Phase 6 (US9, T069..T077) is **superseded** by Phase 19. If Phase 6 is partially in-flight, finish the test surface (T069..T071 still useful for seat-isolation) and skip the SessionPicker / sign-out work — Phase 19 deletes those files.
- Phase 17 depends on FR-022c's `journeys` map landing on the Seat type (T236). Otherwise `progressSelector` in journey manifests has nothing to read.
- Phase 18 depends on Phase 17 (picker route) and on the lab Library being navigable (Phase 8, US5, already planned).
- Phase 19 is safe to land before, after, or interleaved with Phases 17–18; the adapter shape preserves call sites.

## Updated MVP scope (round 3)

**P1 set + journey-picker home + Notebook journey demoable in 2 minutes**:

1. Phase 1 + Phase 2 — done.
2. Phase 3 (US1 basic welcome flow) — done.
3. Phase 4 (US3 empathy errors).
4. Phase 5 (US1b offline floor).
5. Phase 19 (seat consolidation) — early, because the picker depends on it.
6. Phase 17 (picker home).
7. Phase 18 (Notebook journey).
8. **STOP and VALIDATE**: SC-001/002/004/008/009/012/015/016/017/018/019 pass. Dogfood / demo milestone.

Original P2 phases (7..13) follow MVP in the same order.
