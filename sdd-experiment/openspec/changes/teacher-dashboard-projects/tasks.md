# Tasks: teacher-dashboard-projects

Position 10. Depends on teacher-dashboard-shell.

## 1. Data + discovery (gate)

- [ ] 1.1 Record `/dashboardapi/v1/projects/section/:id` JSON (populated,
      empty, no-projects); typed wrapper + parser tests + MSW handler
- [ ] 1.2 Walk oracles (jest, sources); record matrix; MSW fixtures +
      visible choices (populated, zero-students, students-no-projects,
      error)

## 2. Move UI

- [ ] 2.1 Copy the dashboard usage of SectionProjectsListWithData into the
      package with adapters (dual-copy policy, ledger entry); mount with
      the no-students-only gate (no-curriculum gate pinned OFF by test)
- [ ] 2.2 Component tests per scenario; axe + keyboard; copy parity

## 3. Integration + verification

- [ ] 3.1 Flip the shell per-tab map entry for `projects`
- [ ] 3.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 3.3 Live + standalone MSW checks on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/projects`
      (serving-checkout validated)
