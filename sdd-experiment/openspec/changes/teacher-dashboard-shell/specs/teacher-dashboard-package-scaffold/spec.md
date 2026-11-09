# Spec: teacher-dashboard-package-scaffold

## ADDED Requirements

### Requirement: Feature package exists on the standard scaffold
The repository SHALL contain a workspace package
`@code-dot-org/teacher-dashboard` at `frontend/packages/teacher-dashboard/`,
created with `yarn turbo gen package` and adapted to the app-shaped
feature-package pattern of `@code-dot-org/users` (README, `docs/architecture.md`,
lint/vitest/stylelint configs extending `@code-dot-org/lint-config`,
peer-dependency externalization, no `"type": "module"`). The pre-existing
untracked dist-only directory at that path MUST be deleted before scaffolding.

#### Scenario: Scaffold passes workspace gates
- **WHEN** `yarn release:dryrun` runs from `frontend/`
- **THEN** the package builds, lints, typechecks, and tests with the rest of
  the workspace, and Turborepo resolves it as `@code-dot-org/teacher-dashboard`

#### Scenario: Leftover directory removed
- **WHEN** the scaffold task starts
- **THEN** the prior `frontend/packages/teacher-dashboard/` contents (dist,
  node_modules; no `package.json`) are deleted so generated files cannot mix
  with stale artifacts

### Requirement: Standalone MSW dev shell with visible scenario choices
The package SHALL run standalone (`yarn dev` from the package directory)
against MSW with no Rails backend, rendering the shell inside the
design-system styling foundation. All offline scenarios discovered for this
change SHALL be exposed as visible, selectable choices (corner selector plus
`?scenario=` query parameter), and `?devChrome=off` SHALL suppress the
selector for clean captures.

#### Scenario: Scenario selector switches fixtures live
- **WHEN** a developer opens the standalone shell and picks the
  `zero-sections` scenario
- **THEN** the shell re-renders from the `zero-sections` fixture without a
  Rails server running

#### Scenario: Minimum scenario set present
- **WHEN** the selector is opened
- **THEN** it offers at least: `many-sections` (default), `zero-sections`,
  `archived-only`, `coteacher-invite-pending`, `provider-managed`, and
  `error` (bootstrap request fails)

### Requirement: Mocks ship as a package subpath
Fixtures SHALL register through core's `registerMockFixture` registry and be
exported from a `./mocks` subpath so package tests, the standalone shell, and
later feature changes consume one fixture source. Studio SHALL NOT consume
these fixtures; its routes run against the real backend.

#### Scenario: Tests and dev shell share fixtures
- **WHEN** package tests run under vitest against MSW
- **THEN** they register the same fixtures the standalone shell uses, and a
  reset helper clears them between tests

### Requirement: Studio integration follows the lazy-loaded feature pattern
Studio SHALL depend on the package via `workspace:*` and lazy-load its
exports from its route files (`React.lazy` + `Suspense` + `errorComponent`),
with header, footer, theme, and auth bootstrap remaining Studio's job.

#### Scenario: Shell loads as a lazy chunk
- **WHEN** a user navigates to a candidate teacher-dashboard route in Studio
- **THEN** the package chunk loads on demand and renders inside Studio's
  chrome without being bundled into Studio's entry chunk
