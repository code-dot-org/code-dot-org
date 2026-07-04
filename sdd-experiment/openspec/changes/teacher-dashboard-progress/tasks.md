# Tasks: teacher-dashboard-progress

Position 13 — last core tab. Depends on teacher-dashboard-shell and
teacher-dashboard-course-unit-overview (scoped store module).

## 1. Data + discovery (gate)

- [ ] 1.1 Record contracts: `section_level_progress` (small + large
      sections), script structure, unit summary, `teacher_scores`; typed
      wrappers + parser tests + MSW handlers; shared large-section fixture
- [ ] 1.2 Walk oracles (24 jest files, `teacher_dashboard_progress_v2`
      incl. @eyes scenarios → structural checks,
      `fa-teacher-dashboard.spec.ts`); record matrix per sub-split; MSW
      fixtures + visible choices (populated-large, populated-small,
      zero-students, no-progress, locked-lesson, view-as, ge-region, error)

## 2. Sub-split (a): read-only grid

- [ ] 2.1 Extend the overview store module with sectionProgress +
      unitSelection (moved as-is; asymmetry with text-responses recorded)
- [ ] 2.2 Move unit selector + grid columns + legend + CSV download +
      skeletons; mount behind the empty-state gate
- [ ] 2.3 Component tests per grid scenario; axe + keyboard; copy parity

## 3. Sub-split (b): floating chrome

- [ ] 3.1 Move floating header + scrollbar; scroll-offset behavior tests

## 4. Sub-split (c): interactive surfaces

- [ ] 4.1 Move teacher panel, lesson lock, teacher scores, view-as,
      more-details dialog; mutation wrappers; round-trip tests
- [ ] 4.2 GE gating parity; run `fa-teacher-dashboard.spec.ts` against the
      candidate route

## 5. Integration + verification

- [ ] 5.1 Performance gate: render/interaction timings candidate vs legacy
      on the large fixture, same machine; no perceptible regression
- [ ] 5.2 Flip the shell per-tab map entry for `progress` (bare-section
      redirect target flips with it)
- [ ] 5.3 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 5.4 Live checks (grid, lock, view-as, CSV) on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/progress`
      (serving-checkout validated); standalone MSW check
