# Tasks: teacher-dashboard-assessments

Position 9. Depends on teacher-dashboard-shell and the shared
unit-selector from teacher-dashboard-text-responses.

## 1. Data + discovery (gate)

- [ ] 1.1 Record the `/dashboardapi/assessments*` family (assessments,
      surveys, responses, feedback) for MC/match/free-response/survey
      fixtures; typed wrappers + parser tests + MSW handlers (download
      semantics covered)
- [ ] 1.2 Walk oracles (jest suite, `teacher_dashboard_assessments1/2`,
      `assessment_feedback_download`, stories); enumerate distinct UI
      states per table kind; MSW fixtures + visible choices

## 2. Move state + UI

- [ ] 2.1 Move sectionAssessmentsRedux page-scoped + bridge; re-express its
      jest coverage
- [ ] 2.2 Move selector + MC tables; then match; then free-response +
      detail dialogs; then surveys; then feedback download — component
      tests per kind as each lands
- [ ] 2.3 axe + keyboard (incl. dialogs); copy parity

## 3. Integration + verification

- [ ] 3.1 Flip the shell per-tab map entry for `assessments`
- [ ] 3.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 3.3 Live check incl. a real CSV download on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/assessments`
      (serving-checkout validated); standalone MSW check
