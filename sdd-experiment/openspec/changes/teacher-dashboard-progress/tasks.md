# Tasks: teacher-dashboard-progress

Position 13 — last core tab. Depends on teacher-dashboard-shell and
teacher-dashboard-course-unit-overview (scoped store module). The API
table, scenario matrix (14 rows), gate table, and DS mapping live in
design.md and are the contract; tasks below reference them.

## 0. BLOCKED-EVIDENCE resolution (blocking; nothing else starts first)

- [ ] 0.1 Capture response JSON from local Rails for API #1
      (script_structure) and #2 (section_level_progress; one ≤20-student
      and one >20-student section to cover pagination) and #3 (lock_status
      GET); commit as fixtures
- [ ] 0.2 Capture one legacy lock POST's request headers to pin the
      `$.ajax` CSRF mechanism before writing the transport adapter
- [ ] 0.3 Confirm the GE region signal available to the candidate under
      `FrontendStudioController` (legacy: `<html data-ge-region>`); record
      the mechanism decision
- [ ] 0.4 Re-run `grep -r teacher_scores apps/src` (must be zero hits; any
      hit reopens scope before code)

## 1. Data layer

- [ ] 1.1 Typed wrappers + Zod schemata from the 0.1 fixtures (parser
      tests; consumed-field lists from design.md API table are the
      minimum); MSW handlers incl. paginated fan-out behavior
- [ ] 1.2 Extract `processedLevel` / `processServerSectionProgress` /
      `lessonProgressForSection` from `templates/progress/progressHelpers`
      with unit-test parity (shared-dep rule; no fork of the module)

## 2. Scenario fixtures

- [ ] 2.1 One MSW fixture + visible dev-shell choice per scenario-matrix
      row (14); flag/fixture axes exactly as tabled

## 3. Sub-split (a): read-only grid

- [ ] 3.1 Extend the overview store module with sectionProgress +
      unitSelection (moved as-is; asymmetry with text-responses recorded);
      move the loader onto the wrappers with `logToCloud` event-name parity
- [ ] 3.2 Move grid components (table, columns, cells, legend, skeletons,
      CSV) per the design.md file table; mount behind the empty-state gate
- [ ] 3.3 Component tests per matrix row incl. lesson-extras on/off,
      refresh-path, pagination merge; CSV content-equality test; axe +
      keyboard; copy parity

## 4. Sub-split (b): floating chrome

- [ ] 4.1 Move FloatingHeader + FloatingScrollbar + scrollbarUtils;
      scroll-offset behavior tests

## 5. Sub-split (c): lock, view-as, dialog

- [ ] 5.1 Move lessonLockRedux page-scoped; lock GET/POST wrappers
      (changed-rows-only POST semantics pinned by test)
- [ ] 5.2 Move MoreDetailsDialog + MoreOptionsDropdown + view-as wiring
      (no-network assertion for view-as on this tab)
- [ ] 5.3 GE gating parity per 0.3 decision; run
      `fa-teacher-dashboard.spec.ts` against the candidate route

## 6. Integration + verification

- [ ] 6.1 Performance gate: render + unit-switch timings on the
      populated-large fixture, candidate vs legacy, same machine; no
      perceptible regression
- [ ] 6.2 Flip the shell per-tab map entry for `progress` (bare-section
      redirect target flips with it)
- [ ] 6.3 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 6.4 Live checks (grid, pagination, lock, view-as, CSV) on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/progress`
      (serving-checkout validated); standalone MSW check of all 14
      scenarios
