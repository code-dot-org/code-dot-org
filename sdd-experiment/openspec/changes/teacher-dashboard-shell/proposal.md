# Proposal: teacher-dashboard-shell

## Why

The Teacher Dashboard is the largest teacher-facing surface still living
entirely in the legacy `apps/` webpack bundle, booted from HAML-injected JSON
(`dashboard/app/views/teacher_dashboard/show.html.haml:23-41`) into a
14-reducer Redux store (`apps/src/sites/studio/pages/teacher_dashboard/show.js`).
Every feature we want to migrate into `frontend/` — homepage, roster, and
twelve more tabs — mounts inside the same navigation shell and reads the same
section bootstrap. Nothing can migrate until a candidate shell exists under
`/frontend-studio/teacher_dashboard/*` with a real API to stand on: the section
list currently exists *only* as server-rendered script-tag data with no
endpoint equivalent.

This change builds that shell: the feature package, the bootstrap API, the
route tree, the section-scoped navigation chrome, and the parity harness that
every subsequent feature change (homepage v2, manage students, then the rest)
reuses. It is deliberately small in UI and maximal in architectural learning.

This change supersedes the earlier `teacher-dashboard-foundation` draft in
this repository: that change's four infrastructure capabilities (bootstrap
API, core sections mocks, visual-parity harness, package scaffold) are folded
in here, because the shell is their first and proving consumer. The
foundation draft is retained untouched as prior art; implement from this
change, not that one.

## What Changes

- New workspace package `@code-dot-org/teacher-dashboard` under
  `frontend/packages/`, scaffolded with `yarn turbo gen package` and then
  adapted to the app-shaped feature-package pattern established by
  `@code-dot-org/users` (standalone MSW dev server, `./mocks` subpath, no lab
  registration). The untracked dist-only leftover at
  `frontend/packages/teacher-dashboard/` (no `package.json`, no `src/`) is
  deleted first — prior human ack recorded in the program ledger
  (`sdd-experiment/teacher-dashboard-migration/human-review-log.md`, D2).
- New Rails endpoint `Api::V1::TeacherDashboard::SectionsController#index`
  returning `current_user.sections_instructed.map(&:concise_summarize)` plus
  `section_order`, with field-equivalence tests against the legacy HAML
  contract. No existing endpoint returns this composite;
  `/api/v1/sections#index` returns the heavier, differently-named
  `summarize_without_students` shape (`section.rb:531-533`).
- MSW handlers and Zod parser tests for the existing
  `frontend/packages/core/src/api/dashboard/sections/` client (zero coverage
  today), extended with the new bootstrap endpoint.
- Candidate route tree in `frontend/apps/studio` (TanStack Router, file-based)
  under `/frontend-studio/teacher_dashboard/*`: `home`, and
  `sections/:sectionId/<tab>` chrome with the sidebar, redirect parity (bare
  section and unknown paths → `progress`, `manage_students` → `roster`), and
  links out to legacy tab routes for every tab not yet migrated.
- Client-side auth gating that reproduces the legacy CanCan AccessDenied
  redirect branches (`teacher_dashboard_controller.rb:8-19`) for the routes
  the shell owns, backed by server-side enforcement on the new endpoint.
- Visual-parity harness in `frontend/packages/e2e-tests`: legacy-vs-candidate
  capture of the shell chrome against the same local Rails, region-scoped
  pixel compare with masks. Built once here, reused by every feature change.
- Legacy routes (`/teacher_dashboard/home`,
  `/teacher_dashboard/sections/:sectionId/*`) remain untouched and stable.

## Capabilities

### New Capabilities

- `teacher-dashboard-package-scaffold`: the `@code-dot-org/teacher-dashboard`
  feature package — scaffold, standalone MSW dev shell with a visible
  scenario selector, `./mocks` subpath, Studio integration surface.
- `teacher-dashboard-bootstrap-api`: the `Api::V1::TeacherDashboard::*`
  sections/bootstrap endpoint and its Rails field-equivalence contract tests.
- `core-sections-mocks`: MSW handlers + parser tests for the core sections
  API client that all teacher-dashboard fixtures stand on.
- `teacher-dashboard-shell-navigation`: candidate routes, sidebar chrome,
  redirect and deep-link parity, section selection and reload semantics,
  auth-gate behavior, links to legacy tabs.
- `teacher-dashboard-visual-parity-harness`: the reusable
  baseline-vs-candidate pixel gate plus the shell-chrome baselines.

### Modified Capabilities

None. All additions; no existing spec's requirements change.

## Impact

- `frontend/packages/teacher-dashboard/` (new), `frontend/packages/core`
  (sections mocks/tests), `frontend/apps/studio` (routes),
  `frontend/packages/e2e-tests` (harness).
- `dashboard/app/controllers/api/v1/teacher_dashboard/` (new controller),
  `dashboard/config/routes.rb` (one namespaced route), Rails controller tests.
- No changes to legacy `apps/src` teacher-dashboard code, HAML views,
  `TeacherDashboardController`, or the three `section.rb` summarizers.
- Production exposure: none. `FrontendStudioController` 404s in production;
  the new API endpoint is additive and gated by the same CanCan authorization
  as the page it mirrors.
- Downstream: `teacher-dashboard-homepage-v2` and
  `teacher-dashboard-manage-students` build directly on every capability here.
