# Tasks: teacher-dashboard-settings

Position 11. Depends on teacher-dashboard-shell. Contract tables live in
design.md.

## 0. BLOCKED-EVIDENCE resolution (blocking)

All captures follow `sdd-experiment/openspec/teacher-dashboard-evidence-playbook.md`
(environment startup, seeding, authenticated capture, fixture storage,
flag pinning).

- [ ] 0.1 Capture one legacy save round-trip (PATCH `/api/v1/sections/:id`
      request incl. the `...section` spread effect + response) for a
      student section and a PL section; commit as fixtures
- [ ] 0.2 Capture `GET /course_offerings/quick_assign_course_offerings`
      responses per participant type (+ one non-en-US locale for version
      filtering); pin the filtering rule from `VersionUnitDropdowns.jsx`
- [ ] 0.3 Capture the coteacher add request body (POST
      `/api/v1/section_instructors`)
- [ ] 0.4 Runtime-confirm the legacy settings tab has no delete affordance
      (record; presence reopens scope)

## 1. Data layer

- [ ] 1.1 Typed wrappers + schemata from 0.x captures (PATCH save,
      quick-assign offerings, coteacher check/add/remove); parser +
      request-equality tests; MSW handlers with write-through state

## 2. Scenario fixtures

- [ ] 2.1 One MSW fixture + visible dev-shell choice per scenario-matrix
      row (9): edit-and-save, pl-section, login-type-fixed,
      validation-failure, save-blocker, loading-gate,
      coteacher-add/remove, locale-versions, error

## 3. Port UI

- [ ] 3.1 Move the `sectionsRefresh/` form component set per the design.md
      file table (dual-copy ledger entry; creation flow keeps legacy copy)
- [ ] 3.2 Re-implement the 88-line wrapper on the TanStack Router blocker
      API + `beforeunload` (recorded rewrite; DSCO Modal reused); loading
      gate from shell query state
- [ ] 3.3 Redirect-on-save through the shell per-tab map
- [ ] 3.4 Component tests per matrix row (incl. dirty/cancel, no-request
      on invalid); axe + keyboard (modal focus trap); copy parity

## 4. Visual parity (pixel-gated)

- [ ] 4.1 Capture regions per gate table (form per participant type,
      save-blocker modal; section-name masked); baselines/checkpoints at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available); wire diff gates

## 5. Integration + verification

- [ ] 5.1 Flip the shell per-tab map entry for `settings`
- [ ] 5.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 5.3 Live save round-trip (rename → progress shows new name, the
      Cucumber oracle path) + standalone MSW checks of all 9 scenarios
