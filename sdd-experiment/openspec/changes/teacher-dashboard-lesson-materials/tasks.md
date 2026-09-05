# Tasks: teacher-dashboard-lesson-materials

Position 6. Depends on teacher-dashboard-shell and
teacher-dashboard-homepage-v2 (home endpoint AITA flags).

## 1. Data layer

- [ ] 1.1 Record `/dashboardapi/lesson_materials/...` JSON for units
      with/without resources and custom resources; record `unit_in_aif`
      valid + 404 cases; record `GET /ai_lesson_summaries/show?lesson_id=`
      (JSON-in-string `lesson_summary` field per container:209)
- [ ] 1.2 DashboardApi wrappers in `core/src/api/dashboard/...` + parser
      tests (404 + double-encoding pinned) + default MSW handlers in core;
      audio podcast src stubbed/masked in MSW scenarios (no JSON wrapper
      invented — streamed via `<audio src>`, container:437)

## 2. Discovery (gate)

- [ ] 2.1 Walk oracles (`lesson_materials_eyes.feature`, sources, AITA and
      podcast state machines, generation triggers
      teacherSectionsRedux:1132-1143); enumerate distinct flag
      combinations; record matrix
- [ ] 2.2 MSW fixtures + visible dev-shell choices (populated,
      no-curriculum, aita-summary, podcast-dcdo, podcast-experiment,
      ai-artifact, error)

## 3. Port UI

- [ ] 3.1 Port the resources components (container, rows, dropdowns,
      custom resources, empty state) onto the Query spine; adapters for
      locale/analytics/experiments
- [ ] 3.2 Port AITA summaries (flag + AIF eligibility + lesson fetch state
      machine)
- [ ] 3.3 Port podcasts under both gating paths; re-express generation
      triggers on the assignment mutation path
- [ ] 3.4 Port AI artifact resources under AI_ARTIFACT with event-name
      parity
- [ ] 3.5 Component tests per scenario; axe + keyboard; copy parity

## 4. Visual parity (pixel-gated)

- [ ] 4.1 Declare capture regions + masks (resources list, dropdown open,
      empty state, AITA/podcast regions); capture baselines/checkpoints at
      `http://localhost-studio.code.org:9000` (serving-checkout validated;
      Playwright MCP available); wire diff gates

## 5. Integration + verification

- [ ] 5.1 Flip the shell per-tab map entry for `materials`
- [ ] 5.2 `yarn lint:fix && yarn release:dryrun`; `./tools/hooks/pre-commit`
- [ ] 5.3 Live + standalone MSW checks of every discovered scenario
