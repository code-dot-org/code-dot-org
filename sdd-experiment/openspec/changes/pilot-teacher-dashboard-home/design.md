## Context

The legacy teacher dashboard home lives entirely in the `apps/` webpack bundle.
`/teacher_dashboard/home` → `TeacherDashboardController#show` →
`apps/src/sites/studio/pages/teacher_dashboard/show.js`, which injects
server-serialized sections (`Section#concise_summarize`) into a
`data-dashboard` attribute and mounts `TeacherHomepage`
(`apps/src/templates/studioHomepages/teacherHomepageV2/`). Zero sections render
`EmptyHomepage`; one or more render `SectionList` → `SectionCard` /
`SectionCardBody` / `CourseContentDropdown`. The tight region bound is the
`<ol id="ui-test-section-list">`.

The new architecture is `frontend/apps/studio` — a Vite + React 19 + TanStack
Router app served under `/frontend-studio` by `FrontendStudioController#index`
(404 in production). Shared UI ships as `frontend/packages/*` libraries consumed
by Studio via `React.lazy(() => import('@code-dot-org/<pkg>'))`. Dashboard data
goes through `DashboardApiClient` from `@code-dot-org/core/api`, whose `sections`
domain already exists but exposes only `getSection`, `getValidCourseOfferings`,
and `getAvailableParticipantTypes` — there is no `GET /api/v1/sections` list
method yet.

Crucially, the candidate consumes the API (`summarize_without_students`), while
the legacy page is fed server-injected `concise_summarize`. The two payloads
overlap but differ (field names and presence). The pilot builds a fresh view
model from the API shape rather than reusing the legacy redux `Section` type or
the existing `ConciseSectionSchema`.

## Goals / Non-Goals

**Goals:**

- Prove the autonomous migration workflow on a real, read-only slice.
- Region-level UI/behavior parity with the legacy section-list region for the
  two named scenarios, built on the design system.
- Typed, tested data access through `DashboardApiClient`; deterministic tests
  (parser, component, MSW, Playwright) that a Sonnet implementer can drive.
- A clean architectural boundary: Studio owns the route + lazy boundary; the
  package owns UI, tests, fixtures, and exports.

**Non-Goals:**

- Any mutation or navigation-away action (see proposal Out of Scope, verbatim).
- Pixel-identical cross-stack diffing of legacy (webpack/DSCO-heavy) vs candidate
  (Vite/MUI) — treated as advisory, not a tool-enforced gate (see Visual).
- Production exposure; the route is preprod-only by construction.

## Decisions

### D1 — Package layout

`frontend/packages/teacher-dashboard` (`@code-dot-org/teacher-dashboard`), a
library package (not a lab — a teacher tool is not a `/projects/:lab/:channel`
curriculum experience). Scaffold shape per `frontend/docs/conventions/packages.md`:
`private: true`, version `0.0.0` (Changesets-managed), no `"type": "module"`,
`react`/`react-dom` in `peerDependencies` + `devDependencies`,
`@code-dot-org/core: workspace:*` in `dependencies`, exports `.` →
`dist/index.{d.ts,mjs,cjs}`. The default generator `vitest.config.ts` is bare;
this package renders React and needs jsdom, so its `vitest.config.ts` extends
`@code-dot-org/lint-config/vitest/react.mjs`.

Proposed internal structure:

```
frontend/packages/teacher-dashboard/
  src/
    index.ts                       # barrel: export TeacherDashboardHome
    TeacherDashboardHome.tsx       # top-level: fetch state → empty | list
    components/
      EmptyHome.tsx
      SectionList.tsx
      SectionCard.tsx
    TeacherDashboardHome.module.scss
    __tests__/                     # vitest component/unit tests
    main.tsx                       # standalone dev shell (MSW) for visual/dev
    fixtures/                      # LabFixtures-style empty/list fixtures
  e2e/                             # Playwright parity + axe (see Visual)
```

`src/main.tsx` is a standalone dev shell that renders `TeacherDashboardHome`
against MSW fixtures — the isolated-shell pattern used by the markdown package —
and is the deterministic target for the strict visual gate.

### D2 — Studio route + lazy boundary

Add `frontend/apps/studio/src/routes/teacher_dashboard/home.tsx`:

```tsx
import {createFileRoute} from '@tanstack/react-router';
import {lazy, Suspense} from 'react';
const TeacherDashboardHome = lazy(() => import('@code-dot-org/teacher-dashboard'));
export const Route = createFileRoute('/teacher_dashboard/home')({
  component: () => (
    <Suspense fallback={<div>Loading…</div>}>
      <TeacherDashboardHome />
    </Suspense>
  ),
});
```

The TanStack Router Vite plugin regenerates `routeTree.gen.ts` (committed but
machine-owned; carries `@ts-nocheck` and a do-not-edit banner). The URL keeps
underscores because the file path is the URL path; the package name uses hyphens
per package naming rules. The `/frontend-studio` prefix comes from the router
`basepath` — no Rails route change. Auth is resolved once in the root
`beforeLoad` (`fetchAuthOutcome`); the route/component reads it from context if
needed. Add `"@code-dot-org/teacher-dashboard": "workspace:*"` to
`frontend/apps/studio/package.json`.

### D3 — DashboardApiClient integration + schema/parser

Extend the existing core `sections` domain
(`frontend/packages/core/src/api/dashboard/sections/`), additively:

- `sections.schemata.ts`: add a new `SectionSummarySchema` modeling the fields
  the pilot UI consumes from `summarize_without_students`, camelCasing at the
  boundary (`.transform(d => camelcaseKeys(d, {deep: true}))`), consistent with
  the domain's existing schemas. Consumed fields: `id`, `name`, `code`
  (nullable), `login_type`, `hidden`, `grades`, `participant_type`,
  `studentCount`/`numberOfStudents`, `course_display_name` (nullable),
  `courseVersionName` (nullable), `unit_id` (nullable), `unitPosition`
  (nullable), `avatar_color`, `avatar_emoji`, `demo_type` (nullable). zod strips
  unmodeled keys by default, so the many extra `summarize` fields are ignored
  safely. Do NOT reuse `ConciseSectionSchema` (models `concise_summarize`;
  `code` non-nullable and `code_review_expires_at` typed as number there — both
  wrong for the API payload).
- `sections.api.ts`: add `async listSections()` → `GET /api/v1/sections` →
  `z.array(SectionSummarySchema).parse(raw)`.
- `sections.keys.ts` / `sections.query.ts`: add a `useSections` react-query hook
  and key, matching the existing `useValidCourseOfferings` pattern.
- `sections.types.ts`: add the inferred `SectionSummary` type.

### D4 — MSW fixture design

Add handlers under `frontend/packages/core/src/api/mocks/` (MSW v2):
`http.get('*/api/v1/sections', ...)` returning a selectable fixture. Two
fixtures: `empty` → `[]`; `list` → two section summaries matching
TD-HOME-SECTION-LIST (one unassigned with 0 students; one assigned to
`ui-test-single-unit-course-2026` unit 1 with 1 student). Fixtures live with the
package (`src/fixtures/`) and are registered when the standalone shell / route
runs in `VITE_API_MODE=msw`, following the lab fixtures wiring. This lets the
component and visual tests run without Rails, DB, or auth — the deterministic
path.

### D5 — Design-system component choices

Rebuild UI, do not port `apps/src` components. Per the design-system skill: MUI
`Typography` for text/headings; MUI `Button`/`LinkButton` for any actionable
affordance (the pilot has few/none, being read-only); DSCO components for
everything structural without an MUI equivalent (cards built from layout +
tokens). Styling via `.module.scss` with semantic color tokens
(`var(--text-neutral-primary)` etc.); never inline styles, never stylesheet
load-order specificity. Theme is provided by the Studio shell
(`ThemeProvider theme={CdoTheme}`); the standalone dev shell wraps the same
theme. Accessibility to WCAG 2.2 AA: one region heading, semantic list markup
(`<ol>`/`<li>`) mirroring legacy, keyboard reachability, visible
`:focus-visible`, 24×24px targets, no color-only meaning.

### D6 — Testing strategy

- Parser/schema unit tests (Vitest, `fakeTransport` pattern): valid empty,
  valid two-section, and rejection on a missing required field.
- Component tests (Vitest + jsdom): empty state renders headline/description/no
  cards; list state renders two cards with correct name/code/student-count/
  course-name and the unassigned affordance; assert absence of mutating
  controls.
- Playwright parity (see Visual): TD-HOME-EMPTY and TD-HOME-SECTION-LIST, each
  with a scoped axe pass and keyboard/focus assertions.
- Verification per `frontend/AGENTS.md`: `yarn lint:fix`, `yarn release:dryrun`
  (build + typecheck + test) before reporting success.

### D7 — opsx:apply cwd convention

This change is NOT at the repo root; it lives at
`sdd-experiment/openspec/changes/pilot-teacher-dashboard-home/`. The `openspec`
CLI resolves changes from an `openspec/` directory relative to cwd. A later
`/opsx:apply` (and any `openspec status|instructions|validate`) MUST be run with
cwd `sdd-experiment/` so the CLI finds `openspec/changes/`. Invoke as
`/opsx:apply pilot-teacher-dashboard-home` from that cwd. The opsx command
definitions themselves live at `sdd-experiment/openspec/.claude/commands/opsx/`.

## Risks / Trade-offs

- **R1 — Visual infra is off-branch. RESOLVED (ceo-decision-01):**
  `@code-dot-org/playwright-support` (`createVisualTest`, `visualProjects`,
  `prove-visual`) does not exist on this branch; it lives on
  `stephen/codegen-visual-infra` / `stephen/markdown-visual-e2e`. Ruling: do
  NOT merge or cherry-pick it (expands pilot scope and risk). Use the native
  `toHaveScreenshot` fallback on the standalone shell inside the package's own
  `playwright.config.ts` (`animations: 'disabled'`, `maxDiffPixelRatio ≤ 0.01`;
  flake gate = `--update-snapshots` then `--repeat-each=5`).
- **R2 — Cross-stack parity is not pixel-exact.** Legacy is
  webpack/DSCO-heavy; candidate is Vite/MUI. A tool-enforced legacy-vs-candidate
  pixel diff would be misleading. The strict gate is candidate self-consistency
  (deterministic MSW render, `prove-visual` at `maxDiffPixelRatio ≤ 0.01`);
  legacy comparison is an advisory human side-by-side. See visual-artifacts.md.
- **R3 — API vs injection field drift.** The candidate reads `summarize`
  (API) not `concise_summarize` (legacy injection). Field-name/presence
  differences are captured in api-contract-matrix.md; the schema models the
  API shape, and parity is asserted on rendered labels, not raw field parity.
- **R4 — Scope creep.** The section card in legacy is entangled with mutation
  and navigation. The pilot must render read-only labels only. Tasks assert the
  absence of mutating controls to hold the line.
