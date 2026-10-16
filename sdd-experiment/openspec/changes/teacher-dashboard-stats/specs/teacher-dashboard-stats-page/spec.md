# Spec: teacher-dashboard-stats-page

## ADDED Requirements

### Requirement: Stats tab at parity in the candidate shell
The candidate route SHALL render the moved stats table at
`/frontend-studio/teacher_dashboard/sections/:sectionId/stats`: per-student
completed levels and total lines of code, the PL participant-type variant
for professional-learning sections, and the legacy empty-state matrix
(no-students page when the section has zero students; no-curriculum page
when no student has progress).

#### Scenario: Populated section
- **WHEN** a teacher opens the candidate stats tab for a section with
  students and progress
- **THEN** the table renders the same rows/columns/values as legacy for the
  same data

#### Scenario: Empty-state matrix
- **WHEN** the section has zero students, or students but no progress
- **THEN** the no-students (respectively no-curriculum) page renders, as on
  the legacy tab

#### Scenario: PL section variant
- **WHEN** the selected section is a PL section
- **THEN** the participant-type branch renders as legacy (`pl_sections`
  Cucumber feature is the oracle)

### Requirement: Typed data path with recorded contract
The stats data SHALL be consumed through a typed DashboardApi wrapper in
`core/src/api/dashboard/...` for the pinned endpoint
`GET /dashboardapi/sections/:sectionId/students/completed_levels_count`
(`statsRedux.js:59-60`; shared with the roster's completed-levels
column — one wrapper serves both), with the response schema
capture-gated (BLOCKED-EVIDENCE: runtime JSON capture, plus pinning
whether lines-of-code derives from this response) and a default MSW
handler in core; the moved `statsRedux` runs page-scoped with the shell
bridge (no global store, no hand-rolled fetch), and the feature package
owns scenario fixtures only.

#### Scenario: Contract recorded before schema
- **WHEN** the wrapper schema is authored
- **THEN** it is derived from and tested against recorded server JSON, not
  written from memory

### Requirement: Discovery gate and non-pixel parity gates
Implementation SHALL begin with behavior-scenario discovery from the legacy
oracles (stats jest coverage, `pl_sections.feature`,
`view_other_teacher_dashboard_pages.feature`, component source) and expose
discovered scenarios as visible dev-shell choices (floor: populated,
zero-students, no-progress, PL-section, error). This change carries no
pixel gate (non-DSCO legacy JSX); gates are behavior parity, en-US copy
parity, and axe + keyboard checks. Design-system mapping (recorded here,
executed by the modernization pass; grep-verified usage): reactabular-table
+ sortabular → MUI Table with sticky header and pinned sort;
`legacySharedComponents/Button` → MUI Button; `skeletonize-content` → MUI
Skeleton; react-tooltip → DSCO tooltip; existing DSCO link/modal usage
retained. Temporary wrappers keep the legacy widgets untouched during the
move.

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector exposes the floor scenarios
