# Proposal: teacher-dashboard-lesson-materials

Position 6 in the migration sequence. Depends on `teacher-dashboard-shell`
and on `teacher-dashboard-homepage-v2` (the home endpoint carries the two
AITA DCDO flags the tab reads from `currentUser` state today).

## Why

Lesson materials (`.../sections/:sectionId/materials`) is the
resource-distribution tab: `LessonMaterialsContainer.tsx` and its TSX
subcomponents (`apps/src/templates/teacherNavigation/lessonMaterials/`)
render per-lesson resources with unit/lesson selection, plus three
AI-gated sub-features that MUST all port: AITA lesson summaries (DCDO
`show-aita-lesson-summaries`; fetch at `LessonMaterialsContainer.tsx:202`),
AI lesson-summary podcasts (DCDO `ai-lesson-summary-podcasts` OR experiment
`ai-lesson-podcasts`; gate at `LessonMaterialsContainer.tsx:227`), and AI
artifact resources (experiment AI_ARTIFACT;
`CustomLessonResources.tsx:103`). The AIF eligibility check calls
`GET /teacher_dashboard/unit_in_aif` (bad unit id → 404; the `{aif:false}`
else branch is dead code). Generation triggers for AITA
summaries/podcasts also live in `teacherSectionsRedux` (fired on
assignment change, `teacherSectionsRedux.js:1132-1143`) and need a
candidate home.

## What Changes

- Candidate route `.../sections/:sectionId/materials` renders the ported
  materials tab: unit resources dropdown, per-lesson resource rows with
  icons and view-options dropdown, custom lesson resources, empty state
  when the section has no curriculum (missing courseVersionName and
  courseOfferingId).
- All three AI gates port with BOTH arms as parity targets: AITA lesson
  summaries, podcasts (both gating paths — DCDO and experiment), AI
  artifact resources. Generation-trigger behavior is re-expressed in the
  candidate state layer.
- Typed wrappers + MSW for `GET /dashboardapi/lesson_materials/:unit_id`
  and `GET /teacher_dashboard/unit_in_aif` (contract: bad id = 404).
- Shell per-tab map flips `materials` to the candidate route.
- Pixel gate applies: this is a TSX/DSCO-era surface (module.scss + DSCO
  dropdowns/icons); visual parity is part of the contract.

## Capabilities

### New Capabilities

- `teacher-dashboard-lesson-materials-page`: the ported materials tab with
  all AI sub-features, typed data path, scenarios, and pixel parity.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (materials area), core
  wrappers/mocks, Studio route content, shell map entry, e2e parity specs
  (`lesson_materials_eyes.feature` is the visual oracle). No Rails changes.
