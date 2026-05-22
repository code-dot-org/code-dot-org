# Implementation Plan: K-12 Notebook Lab

**Branch**: `1192025-k12-notebook-lab` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/1192025-k12-notebook-lab/spec.md`

## Summary

Ship a new lazy-loaded Studio lab — **Notebook Lab** — that ports the jupyter-k12 learner experience (https://jupyter-k12.org, MIT) into our React + MUI + DSCO stack and runs inside the existing Capacitor mobile shell as a PWA. The lab brings Python execution to the device via Pyodide-in-a-Web-Worker, persists notebooks per-session in IndexedDB, and presents bundled curriculum as a Continue / Assigned / Library index whose underlying organization is jupyter-k12's `metadata.folder` field. The panel-revised spec promotes empathetic error UX and shared-device session boundaries to P1, defers AI chat cells to v2, and adds lesson goal + completion, teacher completion artifacts, pedagogical-accessibility settings, and join-code sharing.

Technical approach: live as `frontend/packages/labs/notebook-lab/` (Turborepo package, peer of `music-lab` and `oceans-lab`); register through `frontend/apps/studio/src/config/labs.ts` and resolve through `getLabEntrypoint.ts`; expose one route at `frontend/apps/studio/src/routes/projects/notebook/$channelId/edit.tsx`; mount the lab's own index and settings views inside the route via the lab's internal navigator (no new studio top-level routes); cache the lab chunk and a small Pyodide bootstrap via the existing studio `vite-plugin-pwa` config; gate the service worker on `!Capacitor.isNativePlatform()` per the mobile shell's documented contract.

## Technical Context

**Language/Version**: TypeScript 5.x strict (per Constitution VII); Python 3.x via Pyodide 0.27+ (matches jupyter-k12).
**Primary Dependencies**: React 18, TanStack Router (file-based, autogen), `@mui/material`, `@emotion/*`, `@code-dot-org/component-library` (DSCO), `@code-dot-org/core` for plugins/observability/API client, `vite-plugin-pwa` (`generateSW`, `autoUpdate`), CodeMirror 6 (`@codemirror/{view,state,commands,language}`, `@codemirror/lang-python`), `marked` 16+ with `DOMPurify`, `video.js` 8+, `idb` (IndexedDB wrapper), `qrcode` (completion-artifact QR), Capacitor 5+ (`@capacitor/app`, `@capacitor/keyboard`, `@capacitor/preferences`, `@capacitor/browser`).
**Storage**: IndexedDB database `NotebookLabDB`, store `notebooks`, scoped per-session via key prefix; Capacitor Preferences on native + `localStorage` on web for session catalog and UI preferences (theme/locale/accessibility), wrapped in a single abstraction.
**Testing**: Vitest + `@testing-library/react` (mirrors studio); component tests for cell renderers and the session-picker; integration tests for IndexedDB seeding, autosave, and the Pyodide worker via a mock-runtime harness; Playwright is *not* introduced here (studio currently has no e2e harness — out of scope).
**Target Platform**: Modern Chrome, Safari, Edge, Firefox (matches studio's existing matrix); iOS 14+ and Android 9+ via Capacitor; PWA installable on Chrome desktop + Android.
**Project Type**: Mobile + PWA (Capacitor wraps the studio web app); lab is a Turborepo package consumed by studio.
**Performance Goals**: SC-001 (first-success ≤ 60 s, ≤ 3 taps); SC-007 (index FMP ≤ 2 s on mid-range Android, warm install); lab chunk gzipped ≤ 350 KB excluding Pyodide + CodeMirror language packs; CodeMirror travels inside the lab chunk; Pyodide bootstrap fetched on first notebook open and cached by the SW.
**Constraints**: Offline floor (SC-002); per-classroom runtime acquisition (SC-010); shared-device isolation (SC-013); telemetry hygiene (SC-008); reduced-motion respect (FR-038); RTL chrome flip (FR-036); WCAG 2.1 AA (Constitution III).
**Scale/Scope**: Tens of thousands of K-12 learners on shared school devices; 18 bundled samples + arbitrary teacher imports; one Python kernel per session; concurrent multi-tab is best-effort, not promised (spec edge case).

No `NEEDS CLARIFICATION` markers remain after the panel review and the open-question resolution.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Approachable for every learner | **Pass** | Cold-open in 60 s, no hard locks (US10), pedagogical accessibility settings (FR-038a), RTL chrome. |
| II. Privacy and Student Data Protection | **Pass with Privacy Review (below)** | Session labels are device-local pseudonyms, treated as PII for telemetry (FR-043, FR-045). No external transmission of learner input in v1 (chat deferred). |
| III. Equity, Access, Accessibility | **Pass** | WCAG 2.1 AA (FR-037/038), RTL (FR-036), offline (FR-025/026), pedagogical settings (FR-038a), low-bandwidth via IT pre-cache (FR-014, SC-010). |
| IV. Security-First | **Pass with note** | No new public endpoints; join-code resolver is read-only and reuses the existing redirector service; no secrets in source; Pyodide assets fetched over HTTPS and SRI-verifiable. |
| V. Modular Architecture | **Pass** | New Turborepo package `frontend/packages/labs/notebook-lab/`. |
| VI. Rails Way | **N/A** | No Rails work in v1. The studio route handler is React-only. |
| VII. TypeScript-First | **Pass** | All new code TS strict; lab package has its own `tsconfig.json` extending the workspace base. |
| VIII. Test Every Behavior Change | **Pass** | Vitest + RTL; coverage requirement carried forward from studio. |
| IX. Open Source and Transparency | **Pass** | Public repo; MIT-licensed upstream (jupyter-k12) vendored with NOTICE; all chosen libs are open source. |
| X. Incremental Modernization | **Pass with precedent** | Constitution X says "new labs MUST use Lab2." Studio's existing modern labs (music-lab, oceans-lab) are independent Turborepo packages, not Lab2-based; the notebook-lab follows that precedent. Lab2's framework is built around level renderers in `apps/src/lab2/`; notebooks are not levels in the Lab2 sense. Documented in Complexity Tracking. |
| XI. Typed Backend/Frontend Contract | **Pass** | Only backend touchpoint is the join-code resolver (FR-029a) routed through `@code-dot-org/core` API client when the resolver lands; otherwise the lab is local. |
| XII. Simplicity and Maintainability | **Pass** | Reuses existing libraries already present in the monorepo or in jupyter-k12; no novel runtime, no new framework. |

### Privacy Review

This feature introduces new data collection and storage in the form of device-local notebook content and a learner-chosen **session label**. Per Constitution II it warrants explicit review.

- **What is collected**: cell source the learner types, cell outputs, theme / locale / accessibility preferences, a learner-chosen session label (free text or four-char code), and an optional teacher-provided notebook `author` field for the Assigned section.
- **Where it lives**: only on the learner's device, in IndexedDB (notebook records) and the platform preference store (session catalog, prefs). No syncing, no server-side persistence.
- **What leaves the device**: only what the learner intentionally exports via the completion artifact (FR-046/047); the QR-encoded artifact is a same-origin URL fragment — no network round-trip is required to render it.
- **Telemetry**: FR-043 explicitly excludes notebook content, cell source the learner typed, session labels, learner-supplied URLs, and (reserved) API keys from telemetry. Telemetry is routed through `@code-dot-org/core/plugins/observability` (FR-044).
- **Under-13 handling**: The lab does not request any age-bearing field. Session labels are pseudonyms scoped to a device. Auto-moderation of free text per Constitution II.IV is not required by the lab itself because no learner free text is transmitted in v1 (chat is deferred); the session label is local-only and is never transmitted, so the under-13 moderation gate does not apply.
- **No targeted advertising, no data sales, no third-party tracking** on this surface.
- **AI features**: chat is deferred to v2; when reintroduced, it inherits the same privacy posture (no PII off-device, district-admin allow-listing) and a separate Privacy Review will gate it.
- **Retention / deletion**: notebooks persist until the learner deletes the session or clears site data; on Capacitor the platform's "Clear data" affordance applies; FR-022a's session-timeout reset does not delete data.
- **Risk surface**: the highest residual risk is video cells that load third-party media (YouTube/Vimeo). Standard browser-tracking risk; no additional collection by us. The fallback to system browser surfaces the same risk.

This Privacy Review is the gate; it passes for v1.

## Project Structure

### Documentation (this feature)

```text
specs/1192025-k12-notebook-lab/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── notebook-schema.md       # Notebook JSON contract (Jupyter v4 + our extensions)
│   ├── worker-protocol.md       # Pyodide worker message contract
│   ├── indexeddb-schema.md      # NotebookLabDB schema + session keying
│   ├── url-contracts.md         # ?github= + join-code + route shape
│   ├── completion-artifact.md   # FR-046/047 payload + QR encoding
│   └── lab-registry.md          # AVAILABLE_LABS + getLabEntrypoint integration
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command — not created here)
```

### Source Code (repository root)

```text
frontend/packages/labs/notebook-lab/
├── package.json                     # workspace deps: react, mui, dsco, codemirror, pyodide, marked, video.js, idb, qrcode
├── tsconfig.json                    # extends frontend/packages/tsconfig.base.json
├── turbo.json                       # task wiring
├── vitest.config.ts
├── NOTICE                           # vendored jupyter-k12 MIT notice
├── README.md
├── AGENTS.md                        # lab-package conventions
├── src/
│   ├── index.tsx                    # public entry; default-exports the lab root component
│   ├── lab-root.tsx                 # lab root: session gate → router for index/notebook/settings
│   ├── session/
│   │   ├── SessionPicker.tsx        # FR-022a session picker (US9)
│   │   ├── sessionStore.ts          # active-session state + idle timeout
│   │   └── sessionKey.ts            # key-scoping helpers
│   ├── index/                       # the in-lab "Notebooks" surface (US5, US1)
│   │   ├── IndexView.tsx            # Continue / Assigned / Library composition
│   │   ├── ContinueRow.tsx
│   │   ├── AssignedRow.tsx
│   │   ├── LibraryUnits.tsx         # vertical lesson path per unit
│   │   ├── LessonNode.tsx
│   │   └── EmptyState.tsx
│   ├── welcome/
│   │   └── welcomeNotebook.ts       # builds the cold-open welcome notebook (US1)
│   ├── renderer/                    # the open-notebook surface
│   │   ├── NotebookView.tsx         # header (title + goal + save chip), cell stream, lesson-complete
│   │   ├── HeaderChip.tsx
│   │   ├── LessonGoal.tsx           # echoes metadata.goal
│   │   ├── LessonComplete.tsx       # US10 completion moment
│   │   └── ResourcesDrawer.tsx
│   ├── cells/
│   │   ├── CellList.tsx             # dispatches by cell_type + tag
│   │   ├── code/
│   │   │   ├── CodeCell.tsx
│   │   │   ├── CodeEditor.tsx       # CodeMirror 6 host
│   │   │   ├── CodeControls.tsx     # single primary "Try it"
│   │   │   ├── ParameterControls.tsx
│   │   │   ├── parameterParser.ts   # #@param extractor
│   │   │   ├── parameterTypes.ts
│   │   │   ├── EmpathyCard.tsx      # error UX
│   │   │   ├── OutputRegion.tsx
│   │   │   └── themes.ts            # cm6 light/dark
│   │   ├── markdown/
│   │   │   └── MarkdownCell.tsx     # marked + DOMPurify
│   │   ├── video/
│   │   │   └── VideoCell.tsx        # YouTube/Vimeo iframe + video.js fallback
│   │   ├── chat-placeholder/
│   │   │   └── ChatPlaceholder.tsx  # FR-012 v1 placeholder
│   │   └── unsupported/
│   │       └── UnsupportedCell.tsx
│   ├── runtime/
│   │   ├── PyodideProvider.tsx      # owns worker lifecycle
│   │   ├── PyodideWorker.ts         # worker entry (type: module)
│   │   ├── runtimeStore.ts          # status + interrupt + input handshake
│   │   ├── async_input.py           # input() transform
│   │   ├── python_init.py           # stdout/stderr/input bridge
│   │   ├── python_reset_globals.py
│   │   ├── overrides/               # per-package post-load patches (matplotlib, pygame, …)
│   │   ├── additionalPackagesFromCode.ts
│   │   └── globalsTemplating.ts     # {{VAR}} substitution
│   ├── storage/
│   │   ├── NotebookLabDB.ts         # idb wrapper, session-scoped
│   │   ├── notebookRepo.ts          # CRUD on notebooks
│   │   ├── sessionRepo.ts           # session catalog
│   │   ├── seeder.ts                # FR-024 first-launch seeding + seed-version
│   │   ├── prefsStore.ts            # theme/locale/accessibility, native vs web split
│   │   ├── importer.ts              # File / URL / github= / join-code
│   │   └── githubUrl.ts             # github.com/{blob,raw} rewrite
│   ├── i18n/
│   │   ├── StringsProvider.tsx      # mirrors ai-decisions-mobile pattern
│   │   ├── labels/                  # JSON per locale
│   │   │   ├── notebooks.en-US.json
│   │   │   ├── notebooks.ja-JP.json
│   │   │   ├── notebooks.hi-IN.json
│   │   │   ├── notebooks.fa-IR.json
│   │   │   ├── settings.*.json
│   │   │   ├── renderer.*.json
│   │   │   ├── navigation.*.json
│   │   │   └── themes.*.json
│   │   └── localeMeta.ts            # name + direction
│   ├── settings/
│   │   ├── SettingsView.tsx
│   │   ├── AccessibilityPanel.tsx   # FR-038a (read-aloud, font, line-spacing, focus mode)
│   │   ├── ThemePicker.tsx
│   │   └── LocalePicker.tsx
│   ├── artifact/
│   │   ├── CompletionArtifact.tsx   # printable summary (FR-046)
│   │   ├── ArtifactQR.tsx           # FR-047
│   │   └── artifactPayload.ts       # JSON shape encoded in QR URL fragment
│   ├── progress/
│   │   ├── lessonCompletion.ts      # derived state from outputs
│   │   └── completionStore.ts
│   ├── dialogs/
│   │   ├── GlobalsDialog.tsx
│   │   ├── UrlImportDialog.tsx
│   │   ├── JoinCodeDialog.tsx
│   │   └── InputDialog.tsx          # responds to PyodideWorker input_request
│   ├── theme/                       # CM6 themes + lab-local theme overrides on top of CdoTheme
│   └── samples/                     # bundled .ipynb (gitignored binaries TBD; manifest in repo)
│       ├── index.json               # FR-024 sample manifest (file + folder + author + goal)
│       ├── hello_world.ipynb
│       ├── kitchen_sink.ipynb
│       └── …
└── public/
    └── pyodide/                     # asset drop, gitignored; download script committed

frontend/apps/studio/src/
├── config/
│   └── labs.ts                                # add 'notebook' to AVAILABLE_LABS
├── router/
│   └── getLabEntrypoint.ts                    # add 'notebook' → lazy(() => import('@code-dot-org/notebook-lab'))
└── routes/
    └── projects/
        └── notebook/
            └── $channelId/
                └── edit.tsx                   # one route file; defers to lab root

frontend/apps/mobile/
└── capacitor.config.ts                         # add @capacitor/browser to plugins for video fallback
```

**Structure Decision**: Turborepo package `frontend/packages/labs/notebook-lab/` peer to `music-lab` and `oceans-lab`. Studio integrates through the existing two-file lab-registry pattern (`config/labs.ts` + `getLabEntrypoint.ts`) and a single TanStack Router file. The lab owns its index and settings internally to avoid creating new top-level studio routes (per FR-040).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Constitution X "new labs MUST use Lab2" | The notebook-lab is not a level renderer. Lab2's framework (`apps/src/lab2/`) is built around `LevelGroup`/`Level` content and a `useLevelLoader` hook with a `levelProperties` schema. Notebooks are documents the learner edits, not levels the curriculum-authoring tool configures. Forcing notebook content into the Level model would either require a per-cell Level (which would multiply curriculum-authoring overhead by ~50×) or a single Level wrapping a whole notebook (which would surrender the per-cell completion model in US10). | Studio's existing `music-lab` and `oceans-lab` already deviate from "use Lab2" — both are independent Turborepo packages registered via the same `AVAILABLE_LABS` mechanism we propose to use. The constitution's intent was to retire ad-hoc lab implementations in `apps/`-webpack; the studio-side lab registry IS the modern path, and the notebook-lab follows the established precedent. |
| Per-session keyed IndexedDB (rather than a single store with a session column) | FR-022 mandates that no learner can see another learner's notebook content through the lab UI. The simplest defensible implementation is key-prefix scoping: a learner who manipulates IndexedDB through devtools could read other sessions, but the lab UI never surfaces them — and the constitution does not require defense against learner-side dev-tools tampering on a school device the lab does not control. | A single store with a session-id column would invite cross-session leakage at the query layer (one missing predicate and Maya sees Brian's homework). The key-prefix approach is mechanical and unambiguous; we accept it because it is simpler, not more complex, than the alternative. |
