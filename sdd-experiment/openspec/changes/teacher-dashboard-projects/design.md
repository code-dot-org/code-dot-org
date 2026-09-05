# Design: teacher-dashboard-projects

## Context

`SectionProjectsListWithData` (legacy JSX, shared with other project-list
surfaces in `apps/src/templates/projects/`) fetches
`/dashboardapi/v1/projects/section/:id` and renders a sortable list. The
router gates on no-students ONLY (`showNoCurriculumAssigned={false}`,
Router:185-199).

## Goals / Non-Goals

**Goals:** projects list at behavior/copy/a11y parity with the
single-sided empty-state quirk preserved.

**Non-Goals:** no changes to the projects gallery/other consumers of the
shared components; no project management actions beyond legacy (list +
links); no pixel gate.

## Decisions

- D1. Move-not-rewrite with the blocker-evidence rule. The component is
  shared with non-dashboard project surfaces — the move copies the
  dashboard usage into the package (dual-copy accepted, as with roster)
  rather than extracting a shared package now; the modernization pass
  decides the long-term home.
- D2. The no-curriculum gate stays off — pinned by a scenario so a future
  refactor cannot "fix" it into the standard matrix.

## Risks / Trade-offs

- [Dual copy of shared project-list components] → same time-boxed
  dual-copy policy as roster; ledger entry.

## Migration Plan

Wrapper → discovery → move → flip map entry → verify. Rollback: revert
additive commits.
