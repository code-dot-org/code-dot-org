# Proposal: teacher-dashboard-projects

Position 10 in the migration sequence. Depends on `teacher-dashboard-shell`.

## Why

Projects (`.../sections/:sectionId/projects`) lists students' personal
projects: `SectionProjectsListWithData.jsx`
(`apps/src/templates/projects/`) over
`GET /dashboardapi/v1/projects/section/:sectionId`. It is the one tab whose
empty-state gate differs from the matrix: no-students only, never
no-curriculum (Router:185-199 sets `showNoCurriculumAssigned={false}` — a
quirk to preserve, since student projects exist independent of assigned
curriculum).

## What Changes

- Candidate route `.../sections/:sectionId/projects` renders the moved
  projects list (project name/type/student/updated-at, links into the
  project), with the no-students empty state only.
- `GET /dashboardapi/v1/projects/section/:sectionId` gains a typed wrapper
  + recorded-JSON schema + MSW handler.
- Shell per-tab map flips `projects` to the candidate route.
- No pixel gate (legacy non-DSCO JSX); behavior, copy, a11y parity; DS
  mapping recorded.

## Capabilities

### New Capabilities

- `teacher-dashboard-projects-page`: the moved projects tab — list, links,
  single-sided empty-state gate, typed data path, scenarios.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (projects area), core
  wrappers/mocks, Studio route content, shell map entry. No Rails changes.
