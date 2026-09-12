# Tasks: teacher-dashboard-text-responses

Position 8. Depends on teacher-dashboard-shell. Builds the shared
unit-selector consumed by assessments (position 9).

## 1. Data + discovery (gate)

- [ ] 1.1 Record `/dashboardapi/section_text_responses/:id` JSON
      (populated, empty); typed wrapper + parser tests + MSW handler
- [ ] 1.2 Walk oracles (jest, stories, sources, unitSelection slice
      tests); record matrix; MSW fixtures + visible choices (populated,
      filtered-by-lesson, zero-students, no-progress, error)

## 2. Move UI

- [ ] 2.1 Re-express unit selection as URL/Query state (shared package
      unit-selector; legacy slice tests as oracle)
- [ ] 2.2 Move table + lesson selector + data module (transport adapter,
      request shapes preserved); mount behind the shared empty-state gate
- [ ] 2.3 Component tests per scenario; axe + keyboard; copy parity

## 3. Integration + verification

- [ ] 3.1 Flip the shell per-tab map entry for `text_responses`
- [ ] 3.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 3.3 Live check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/text_responses`
      (serving-checkout validated); standalone MSW check
