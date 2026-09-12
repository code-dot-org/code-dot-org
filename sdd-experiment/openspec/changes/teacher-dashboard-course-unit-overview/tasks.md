# Tasks: teacher-dashboard-course-unit-overview

Position 12. Depends on teacher-dashboard-shell. Builds the scoped
progress store module reused by teacher-dashboard-progress (13).

## 1. Data + discovery (gate)

- [ ] 1.1 Record contracts: script structure, unit summary, announcements,
      hidden-lesson, lesson-lock endpoints; typed wrappers + parser tests +
      MSW handlers
- [ ] 1.2 Walk oracles (course_overview/script_overview features,
      local_nav_v2 single-unit scenario, overview jest, sources); record
      matrix; MSW fixtures + visible choices (course populated,
      single-unit, no-curriculum, hidden-lesson, lock, view-as,
      modularity-on/off, error)

## 2. Move state + UI

- [ ] 2.1 Move progressRedux + announcements/hiddenLesson/viewAs as one
      page-scoped store module with shell bridge; re-express slice tests;
      review against progress (13) requirements before finalizing
- [ ] 2.2 Move TeacherCourseOverview (dual-copy ledger entry); mount at the
      candidate course route with the no-curriculum gate
- [ ] 2.3 Move TeacherUnitOverview for unit + nested-unit routes
      (optional-param shapes preserved); single-unit behavior pinned
- [ ] 2.4 Implement the AccessDenied `courses`/`unit`→`s` rewrite parity
      for these routes
- [ ] 2.5 Component tests per scenario (both MODULARITY arms); axe +
      keyboard; copy parity

## 3. Integration + verification

- [ ] 3.1 Flip the shell per-tab map entries (courseOverview,
      unitOverview, nestedUnitOverview)
- [ ] 3.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 3.3 Live checks (course, single-unit, unit, nested-unit, lost-access
      rewrite) on `http://localhost-studio.code.org:9000` (serving-checkout
      validated); standalone MSW check
