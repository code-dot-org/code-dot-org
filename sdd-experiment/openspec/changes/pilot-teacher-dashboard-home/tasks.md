# Tasks — pilot-teacher-dashboard-home

Ordered, TDD-first. The implementer is a Sonnet agent restricted to
`/opsx:apply` run with cwd `sdd-experiment/` (see design.md D7). Rules for every
task: keep scope narrow, touch only the listed files, write the failing
test/baseline FIRST, run the listed verification, and return the listed
evidence. No task may change scope, API contracts, or acceptance criteria — if a
task appears to require that, PAUSE and return a refinement request to Opus/CEO.

Verification baseline (run from `frontend/`): `yarn lint:fix` then
`yarn release:dryrun` (build + typecheck + test). Package tests: `yarn test`
within the package. Do not run the full repo suites.

GATE SCOPING (Phase 2 finding): workspace-wide `yarn release:dryrun` currently
FAILS on a pre-existing e2e-tests lint error (`tests/platform/header.spec.ts`
imports `../pages/teacher-dashboard`, a directory without index.ts; staging
commit `efa54994177` — NOT pilot-caused, do NOT fix it). Until it is resolved
upstream, every "release:dryrun" verification in these tasks means the
filter-scoped equivalent:
`yarn turbo run build typecheck lint test --filter=@code-dot-org/teacher-dashboard --filter=@code-dot-org/core --filter=@code-dot-org/studio`.

## 0. Scaffold the package — OPUS-OWNED (do NOT run as Sonnet)

- [x] 0.1 **[OPUS, Phase 2]** Scaffold `frontend/packages/teacher-dashboard` via
  `yarn turbo gen package` (name `teacher-dashboard`), then adjust
  `vitest.config.ts` to extend `@code-dot-org/lint-config/vitest/react.mjs`, add
  `@code-dot-org/core: workspace:*` to `dependencies`, and confirm the generator
  added the workspace dep to `frontend/apps/studio/package.json`. Visual infra:
  RESOLVED by ceo-decision-01 — use the NATIVE `toHaveScreenshot` fallback; do
  NOT merge or cherry-pick `@code-dot-org/playwright-support` (design.md R1).
  Sonnet starts at task 1 against the scaffolded package.
  - Evidence: `git status` showing the scaffolded files; `yarn release:dryrun`
    green on the empty package.

## 1. sections list schema + parser (core) — write tests first

- [x] 1.1 Add failing parser tests in
  `frontend/packages/core/src/api/dashboard/sections/__tests__/sections.api.test.ts`
  (extend existing file, `fakeTransport` pattern): `listSections()` parses an
  empty array; parses a two-element array into camelCased `SectionSummary`
  objects with the consumed fields; rejects when an element is missing `id` or
  `name`.
  - Files: that test file only.
  - Verify: `yarn test` in core shows the new tests FAIL (method/schema absent).
  - Evidence: failing test output.
- [x] 1.2 Add `SectionSummarySchema` to `sections.schemata.ts` and the inferred
  `SectionSummary` to `sections.types.ts`, modeling only the consumed fields
  from `summarize_without_students` (see design.md D3 / api-contract-matrix.md).
  Do NOT reuse `ConciseSectionSchema`.
  - Files: `sections.schemata.ts`, `sections.types.ts`.
- [x] 1.3 Add `listSections()` to `sections.api.ts` → `GET /api/v1/sections` →
  `z.array(SectionSummarySchema).parse(raw)`. Export via the domain barrel.
  - Files: `sections.api.ts` (and `index.ts` if needed).
  - Verify: `yarn test` in core — 1.1 tests now PASS. Then `yarn release:dryrun`.
  - Evidence: passing test output; dryrun green.
- [x] 1.4 Add `useSections` query hook + key
  (`sections.query.ts`, `sections.keys.ts`) matching `useValidCourseOfferings`.
  - Files: `sections.query.ts`, `sections.keys.ts`.
  - Verify: typecheck via `yarn release:dryrun`.

## 2. MSW fixtures + handler (core mocks + package fixtures)

- [x] 2.1 Add empty and two-section fixtures under
  `frontend/packages/teacher-dashboard/src/fixtures/` matching the two scenarios
  (empty `[]`; one unassigned/0 students, one assigned to
  `ui-test-single-unit-course-2026` unit 1 / 1 student). Values must satisfy
  `SectionSummarySchema`.
  - Files: package `src/fixtures/*` only.
- [x] 2.2 Add an `http.get('*/api/v1/sections', …)` handler in
  `frontend/packages/core/src/api/mocks/` that serves the active fixture, and
  register it in the handler aggregation. Follow the existing per-domain handler
  pattern.
  - Files: `frontend/packages/core/src/api/mocks/*` (new sections handler +
    aggregation edit) only.
  - Verify: `yarn release:dryrun`.
  - Evidence: dryrun green; a note of the handler URL pattern.

## 3. Empty-state component — write component test first (TD-HOME-EMPTY)

- [ ] 3.1 Add a failing Vitest component test
  (`src/__tests__/TeacherDashboardHome.test.tsx`): rendering with the empty
  fixture shows the empty headline, description, and image; asserts NO section
  card/list node; asserts a single region heading.
  - Files: package `src/__tests__/*` only.
  - Verify: `yarn test` FAILS (component absent).
- [ ] 3.2 Implement `EmptyHome.tsx` and the empty branch of
  `TeacherDashboardHome.tsx` (fetch via `useSections`; empty when `[]`), on
  design-system components + `.module.scss` semantic tokens. Export
  `TeacherDashboardHome` from `src/index.ts`.
  - Files: `src/components/EmptyHome.tsx`, `src/TeacherDashboardHome.tsx`,
    `src/TeacherDashboardHome.module.scss`, `src/index.ts`.
  - Verify: `yarn test` — 3.1 PASSES; `yarn release:dryrun` green.
  - Evidence: passing test output.

## 4. Section-list component — extend component test first (TD-HOME-SECTION-LIST)

- [ ] 4.1 Extend the component test: rendering with the list fixture shows two
  cards; the assigned card shows the `ui-test-single-unit-course-2026` course
  display name and student count 1; the unassigned card shows its unassigned
  affordance and student count 0; assert NO mutating control
  (create/edit/archive/delete/reorder/add-students/assign-course) is present.
  - Files: package `src/__tests__/*` only.
  - Verify: `yarn test` FAILS for the new assertions.
- [ ] 4.2 Implement `SectionList.tsx` + `SectionCard.tsx` (read-only labels: name,
  join code, student count, course display name or unassigned affordance) using
  semantic `<ol>`/`<li>` and design-system components. No mutating handlers.
  - Files: `src/components/SectionList.tsx`, `src/components/SectionCard.tsx`,
    the module scss, and `TeacherDashboardHome.tsx` (list branch).
  - Verify: `yarn test` PASSES; `yarn release:dryrun` green.
  - Evidence: passing test output.

## 5. Studio route + lazy boundary

- [ ] 5.1 Add `frontend/apps/studio/src/routes/teacher_dashboard/home.tsx` per
  design.md D2 (route def + `React.lazy` + `<Suspense>` only). Let the Vite
  plugin regenerate `routeTree.gen.ts` (do not hand-edit it). Confirm the
  workspace dep exists in `frontend/apps/studio/package.json` (added in task 0).
  - Files: the one route file; `routeTree.gen.ts` only as machine-regenerated.
  - Verify: `yarn release:dryrun`; start `yarn dev` and confirm
    `/frontend-studio/teacher_dashboard/home` mounts the component (MSW mode).
  - Evidence: dryrun green; a screenshot or DOM confirmation of the mounted
    region under the route.

## 6. Standalone dev shell (deterministic visual/dev target)

- [ ] 6.1 Ensure `src/main.tsx` renders `TeacherDashboardHome` under `CdoTheme`
  with MSW enabled, selecting fixture by URL/tag (empty vs list), for the visual
  gate and local dev.
  - Files: package `src/main.tsx`, minimal `index.html` if the dev shell needs
    one (per package conventions).
  - Verify: `yarn dev` in the package renders both fixtures deterministically.
  - Evidence: note of the two dev URLs.

## 7. Playwright parity + axe + keyboard (both scenarios)

- [ ] 7.1 Add `e2e/` specs for TD-HOME-EMPTY and TD-HOME-SECTION-LIST against the
  deterministic target (design.md D4 / visual-artifacts.md): region-scoped
  visual check via native `toHaveScreenshot` (per ceo-decision-01; no shared
  helper), a scoped axe pass, and keyboard/focus assertions. Follow the
  isolate-then-capture + mask pattern.
  - Files: package `e2e/*` and its `playwright.config.ts` only.
  - Verify: run the visual determinism gate (`--update-snapshots` then
    `--repeat-each=5`); axe clean; keyboard reachable.
  - Evidence: passing spec output; the before/after/diff artifact locations from
    visual-artifacts.md; append artifacts to visual-artifacts.md.
  - NOTE: the ADVISORY legacy capture (test-studio, sanctioned fixtures, masks
    per visual-artifacts.md) is OPUS-OWNED in Phase 4 — NOT a Sonnet task.

## 8. Final gates

- [ ] 8.1 `yarn lint:fix` + `yarn release:dryrun` all green; append a usage
  checkpoint; return the completion evidence bundle (test outputs, route mount
  proof, axe results, visual gate pass). Do NOT archive — Phase 4/5 own review
  and acceptance.
