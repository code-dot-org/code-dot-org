# Tasks: teacher-dashboard-stats

Position 4. Depends on teacher-dashboard-shell.

## 1. Data layer

- [ ] 1.1 Confirm + record the stats endpoint (URL, JSON) from a local
      Rails run for populated, zero-student, no-progress, and PL sections
- [ ] 1.2 Typed core wrapper + schema + parser tests against recordings;
      MSW handler

## 2. Discovery (gate)

- [ ] 2.1 Walk oracles (stats jest, `pl_sections.feature`,
      `view_other_teacher_dashboard_pages.feature`, sources); record
      scenario matrix with evidence and coverage
- [ ] 2.2 MSW fixtures + visible dev-shell choices (populated,
      zero-students, no-progress, PL-section, error)

## 3. Move UI

- [ ] 3.1 Extract statsRedux page-scoped + shell bridge; re-express its
      jest coverage
- [ ] 3.2 Extract StatsTable/StatsTableWithData with import adapters;
      mount at the candidate route behind the shared empty-state gate
- [ ] 3.3 Component tests per scenario; axe + keyboard; en-US copy parity

## 4. Integration + verification

- [ ] 4.1 Flip the shell per-tab map entry for `stats`
- [ ] 4.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 4.3 Live check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/stats`
      (serving-checkout validated); standalone MSW check of all scenarios
