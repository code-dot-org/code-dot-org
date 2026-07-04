# Tasks: teacher-dashboard-shell

## 1. Bootstrap API (Rails)

- [ ] 1.1 Record the legacy contract: capture `data-dashboard` JSON and
      `GET /dashboardapi/section/:id` JSON from a local Rails run for seeded
      sections covering all six login types, an archived section, a
      co-taught section, and a null-curriculum section; commit as fixtures
- [ ] 1.2 Add `Api::V1::TeacherDashboard::SectionsController#index`
      (`{sections: concise_summarize[], section_order}`) with the same
      eager-loading and CanCan scoping as `TeacherDashboardController#show`;
      add the namespaced route
- [ ] 1.3 Rails field-equivalence tests: endpoint JSON vs
      `Section#concise_summarize` per fixture section; auth tests
      (signed-out 401, student scoped-empty, co-teacher included); no-CSRF-skip
      check
- [ ] 1.4 Run targeted controller/model tests (`bundle exec spring testunit`)
      and `./tools/hooks/pre-commit`

## 2. Core sections client + mocks

- [ ] 2.1 Validate existing sections schemata against the recorded JSON from
      1.1 (including the selected/concise merge-precedence check); fix
      schemata only where reality disagrees, with recorded JSON as evidence
- [ ] 2.2 Add `getTeacherDashboardSections` (api/keys/query/schemata/types)
      to `core/src/api/dashboard/sections/`
- [ ] 2.3 Add MSW default handlers for the bootstrap endpoint and
      `GET /dashboardapi/section/:id` in `core/src/api/mocks/`
- [ ] 2.4 Vitest parser tests for all sections schemata driven by the
      recorded fixtures

## 3. Package scaffold + dev shell

- [ ] 3.1 Delete the leftover dist-only `frontend/packages/teacher-dashboard/`
      directory (human ack recorded in program ledger, D2)
- [ ] 3.2 `yarn turbo gen package` → `@code-dot-org/teacher-dashboard`; adapt
      to the app-shaped pattern (standalone `index.html` + `main.tsx`,
      `./mocks` subpath, README + docs/architecture.md)
- [ ] 3.3 Behavior scenario discovery (gate): walk
      `TeacherNavigationRouter.tsx`, `TeacherNavigationBar` unit tests,
      `teacher_dashboard_local_nav_v2*.feature`,
      `view_other_teacher_dashboard_pages.feature`, and
      `teacherSectionsReduxTest.js`; record the scenario list with evidence
      and chosen coverage (fixture / test / exclusion)
- [ ] 3.4 Build MSW fixtures for the discovered scenarios (at minimum
      `many-sections`, `zero-sections`, `archived-only`,
      `coteacher-invite-pending`, `provider-managed`, `error`) and wire the
      visible scenario selector (`?scenario=`, corner dropdown,
      `?devChrome=off`)

## 4. Shell UI + Studio routes

- [ ] 4.1 Implement the sidebar chrome and tab frame in the package using
      DSCO/MUI per the design-system mapping (DSCO dropdown/fontAwesomeV6Icon,
      MUI Typography; SCSS modules with semantic tokens)
- [ ] 4.2 Add Studio file-based routes `teacher_dashboard/home` and
      `teacher_dashboard/sections/$sectionId/*` with lazy loading, underscore
      segments preserved, and the per-tab redirect map (candidate vs legacy
      URL per tab)
- [ ] 4.3 Implement redirect parity (bare/unknown → progress,
      `manage_students` → `roster`, replace semantics) and auth gating
      (signed-out → sign-in; non-instructor → `/home`)
- [ ] 4.4 Implement section selection (first-section default honoring
      `section_order`) and reload semantics (Query invalidation re-expressing
      `needsReload`); component tests against MSW for each discovered
      scenario
- [ ] 4.5 a11y pass on the chrome (axe + keyboard/focus), AA floor;
      screen-reader-visible active-tab state

## 5. Visual parity harness + shell baselines

- [ ] 5.1 Build the reusable capture/compare helper in
      `frontend/packages/e2e-tests` (same-Rails, same-context, region-scoped,
      masked) with serving-checkout validation (abort if Rails/apps process
      cwd is not this worktree)
- [ ] 5.2 Visual parity planning (gate): enumerate the shell-chrome surfaces
      that are DSCO/MUI-based and declare capture regions + masks; record the
      determination (what is pixel-gated vs behavior-only and why)
- [ ] 5.3 Capture legacy baselines and candidate checkpoints for the sidebar
      and tab-frame chrome at
      `http://localhost-studio.code.org:9000/teacher_dashboard/...` vs
      `.../frontend-studio/teacher_dashboard/...` (Playwright MCP available
      for interactive tuning); wire the diff gate into the suite

## 6. Verification

- [ ] 6.1 `yarn lint:fix && yarn release:dryrun` from `frontend/`;
      `./tools/hooks/pre-commit` from repo root
- [ ] 6.2 Live integration check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
      (serving-checkout validated first): deep links, redirects, section
      switch, signed-out gate
- [ ] 6.3 Standalone MSW check: every discovered scenario selectable and
      rendering without Rails
