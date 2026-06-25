# Tasks: lab2-studio-oceans

PR boundaries: §1-2 (PR 1), §3 (PR 2), §4 (PR 3), §5-6 (PR 4).
No Rails changes anywhere.

Method (design.md "Testing Strategy"): TDD against the spec
scenarios — each task writes its failing tests first, then the
implementation. Gates before each PR: `yarn typecheck`, package
vitest, `yarn lint:fix`, `yarn release:dryrun` (from `frontend/`);
`./tools/hooks/pre-commit` after each batch of edits. Net-new UI
passes a11y-architect review before its PR is declared done, and is
built from design-system components (MUI for Typography/Button/
IconButton, DSCO otherwise, per the design-system skill) with SCSS
modules and semantic color variables.

## 1. labs/base package scaffold

- [x] 1.1 Scaffold via `yarn turbo gen package` as the base, then modify to fit: move under `packages/labs/base`, name `@code-dot-org/lab`, library-mode vite config per `docs/conventions/packages.md` (generator output is the starting point, not hand-rolled files)
- [x] 1.2 Write failing unit tests from spec `lab-base` scenarios: Lab provides level context, level change without shell remount, error containment + metrics report, LifecycleNotifier subscribe/unsubscribe
- [x] 1.3 Port the host slice from `origin/ngfp/music-lab:frontend/packages/labs/base` to green: `LabMetricsReporter` (adapt to observability plugin), `ErrorBoundary` with a simple error-state fallback (the prototype's errorFallbackPage is not ported), `Loading`; LifecycleNotifier/LabRegistry/useLifecycleNotifier dropped (TanStack Router covers lifecycle events natively)
- [x] 1.4 Adapt `Lab.tsx` + `LevelPropertiesContext.tsx` to prop-driven `levelId` + map (no redux, no theme provider — studio root provides theme) per design "URL drives level state"; tests green
- [x] 1.5 a11y-architect review: Loading and the simple error state; apply findings
- [x] 1.6 Failing lint test (ESLint flags a fixture importing `@code-dot-org/lab` from oceans src), then the import restriction in `packages/labs/oceans/eslint.config.mjs`

## 2. labs/base integration proof

- [x] 2.1 Integration test (studio): `/projects/oceans/$channelId/edit` wrapped in `Lab` renders unchanged (loading + error boundary behavior asserted)
- [x] 2.2 Wire the wrap in the project route; browser check deferred to user

## 3. Course route + lesson loading

- [x] 3.1 Failing unit tests, then core/api queries: course-scoped `level_properties` and `script_structure` (permissive Zod schemas, query keys)
- [x] 3.2 Failing unit tests, then structure↔lesson-map join (position → activeId → levelId; loader error naming the level id on join failure)
- [x] 3.3 Failing integration test, then route file `src/routes/courses/$courseName/units/$unitPosition/lessons/$lessonPosition/levels/$levelPosition.tsx` with `ensureQueryData` loader + not-found handling
- [x] 3.4 Failing unit tests, then appName-keyed resolver (`fish`, `standalone_video`) with unsupported-appName fallback UI (design-system components)
- [x] 3.5 Failing integration test, then minimal level navigation (prev/next + "Level x of y" from script_structure positions; MUI Button/IconButton + Typography)
- [x] 3.6 MSW: course-name-keyed fixture registration; oceans fixtures for script_structure + level_properties shaped from the verified serializer output
- [x] 3.7 Integration tests: in-lesson navigation reuses cache, shell/nav not remounted (spec scenario "Next level within lesson")
- [x] 3.8 a11y-architect review: level navigation + unsupported-appName state; apply findings
- [x] 3.9 Browser check (MSW): all eight positions navigable, lab chunks lazy-load; commit PR 2

## 4. Adapters + milestone

- [ ] 4.1 Failing unit tests, then `activities` domain: milestone POST `/milestone/{userId|0}/{scriptLevelId}/{levelId}` with `{result, testResult}`; MSW handler writes scenario-store progress (assert via `/api/user_progress/oceans` read)
- [ ] 4.2 Failing unit tests, then oceans adapter: levelProperties → `OceansLab` props (mode→appMode, guides, locale), `key={levelId}` remount, sizing shell reuse, `onContinue` → milestone → navigate next
- [ ] 4.3 Failing unit tests, then video stub (`standalone_video`): level title (MUI Typography) + continue (MUI Button) wired to milestone + navigate
- [ ] 4.4 Failing integration test, then lesson-complete: finishing position 8 navigates to the level's `finishUrl` (full page)
- [ ] 4.5 a11y-architect review: video stub; apply findings
- [ ] 4.6 E2E (single spec, if the harness can serve Studio standalone): MSW-mode eight-level run-through; otherwise document the integration-test coverage as sufficient
- [ ] 4.7 Browser check (MSW): anonymous run-through completes all eight levels, finish exits; commit PR 3

## 5. Vite Rails mode verification

- [ ] 5.1 Signed-out run at `http://localhost-studio.code.org:3000/frontend-studio/courses/oceans/units/1/lessons/1/levels/1` (Rails + `yarn dev`)
- [ ] 5.2 Signed-in run: complete level 2, verify `UserLevel` row (mysql-client-dashboard-reader) and legacy progress UI shows completion
- [ ] 5.3 TTS locale and guides verified on a fish level; video stubs continue correctly
- [ ] 5.4 Commit PR 4; update `apps/studio/docs/architecture.md` + README (route structure, lab registration changes)

## 6. Documentation + follow-ups

- [ ] 6.1 labs/base README + docs/architecture.md (three-category taxonomy and the consumption rule — labs import shared non-UI/UI subpaths, only the host imports framework; per-lab dependency rule; no-store note; toolkit/deferred-scope pointers)
- [ ] 6.2 File follow-up issues: redux/slice store + platform/projects + progress port (design "Deferred scope"); bubble progress bar + user_progress/anonymous completion display (after stephen/rebrand header lands); `/api/v1/courses` endpoints vs merged client mismatch; anonymous→signed-in progress migration; framework-subpath lint restriction for course-native labs (when one exists); rich error page to replace the simple error state
