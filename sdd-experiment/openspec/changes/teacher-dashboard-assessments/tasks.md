# Tasks: teacher-dashboard-assessments

Position 9. Depends on teacher-dashboard-shell and the shared
unit-selector from teacher-dashboard-text-responses. Contract tables live
in design.md.

## 0. BLOCKED-EVIDENCE resolution (blocking)

All captures follow `sdd-experiment/openspec/teacher-dashboard-evidence-playbook.md`
(environment startup, seeding, authenticated capture, fixture storage,
flag pinning).

- [ ] 0.1 Capture responses for the four GETs (design.md API table) across
      MC, match, free-response, and survey fixtures on local Rails; commit
      as fixtures; record any conflicts with `assessmentDataShapes.js`
- [ ] 0.2 Read the `section_surveys` controller/serializer; record the
      server-side anonymity rule before the surveys fixture

## 1. Data layer

- [ ] 1.1 Typed wrappers + schemata from 0.1 captures (exact query params
      per design.md); parser tests; MSW handlers

## 2. Scenario fixtures

- [ ] 2.1 One MSW fixture + visible dev-shell choice per scenario-matrix
      row (10): mc-populated, match-populated, free-response-populated,
      submission-status, surveys, feedback-csv, status-csv,
      multi-assessment, zero-students/no-progress, error

## 3. Move state + UI (kind-by-kind)

- [ ] 3.1 Move sectionAssessmentsRedux page-scoped + bridge; re-express
      jest coverage; pin submission-status accounting fields by test
- [ ] 3.2 Move selector + MC tables; then match; then free-response +
      detail dialog (keyboard-complete, axe); then surveys; then
      submission status + both client-generated CSVs (content-equality
      tests)
- [ ] 3.3 Consume the shared unit-selector (no second unitSelection port);
      `SafeMarkdown` → `@code-dot-org/markdown`; copy parity

## 4. Integration + verification

- [ ] 4.1 Flip the shell per-tab map entry for `assessments`
- [ ] 4.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 4.3 Live check incl. both CSV downloads on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/assessments`
      (serving-checkout validated); standalone MSW check of all 10
      scenarios
