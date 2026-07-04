# Tasks: teacher-dashboard-student-snapshot

Position 16 (last). Depends on teacher-dashboard-shell; reuses progress
wrappers where payloads overlap. Contract tables live in design.md.

## 0. BLOCKED-EVIDENCE resolution (blocking)

- [ ] 0.1 Capture responses for API #1-#5 (path-param GETs) from local
      Rails with the experiment on; commit as fixtures; cross-check the
      client `fetchJson<T>` types
- [ ] 0.2 Capture the dynamically-built query params + responses for
      #6 lesson_insight, #7 ai_generated_lesson_feedback,
      #8 student_has_work_in_lesson, #9 saved_feedback
- [ ] 0.3 Capture one feedback create + one update (bodies + headers,
      #10-#11)
- [ ] 0.4 Enumerate the rubric widget's runtime calls from the shared
      `templates/rubrics/` components (#12)
- [ ] 0.5 Confirm `@cdo/apps/codemirror/editorConfig` extracts cleanly for
      the code widget (blocker evidence if not)

## 1. Data layer

- [ ] 1.1 Typed wrappers + schemata from 0.x captures; parser tests; MSW
      handlers with write-through feedback state; reuse progress wrappers
      where payloads overlap (diffs recorded)

## 2. Scenario fixtures

- [ ] 2.1 One MSW fixture + visible dev-shell choice per scenario-matrix
      row (10)

## 3. Port (order per design D1)

- [ ] 3.1 Header + widgetTemplate at a recorded legacy SHA (divergence
      ledger entry)
- [ ] 3.2 Code widget (CodeMirror peer deps + editorConfig per 0.5);
      then CFU; then feedback CRUD; then insight; then progress-details;
      then rubric (shared-dep consumption, not fork)
- [ ] 3.3 Mount at the gated candidate route with the empty-state matrix;
      component tests + axe + copy parity per widget as it lands

## 4. Visual parity + verification

- [ ] 4.1 Pixel baselines/checkpoints per gate table (masks: names,
      CodeMirror text, timestamps, AI text) at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available)
- [ ] 4.2 Flip the shell per-tab map entry for `studentSnapshot`
- [ ] 4.3 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`;
      live (experiment on, feedback round-trip) + standalone MSW checks of
      all 10 scenarios
