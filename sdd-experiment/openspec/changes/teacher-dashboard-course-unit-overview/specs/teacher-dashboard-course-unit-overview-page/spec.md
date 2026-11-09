# Spec: teacher-dashboard-course-unit-overview-page

## ADDED Requirements

### Requirement: Overview routes at parity
The candidate SHALL serve the three overview route shapes inside the shell
— `sections/:sectionId/courses/:courseVersionName?`,
`sections/:sectionId/courses/:courseVersionName/units/:unitPosition`, and
`sections/:sectionId/unit/:unitName?` — rendering the moved
TeacherCourseOverview / TeacherUnitOverview with announcements,
hidden-lesson toggles, view-as, and lesson lock at legacy behavior. Course
overview carries the no-curriculum empty state; unit overviews render the
unit landing including the single-unit-course behavior (auto-landing on
unit 1, no unit breadcrumb — the local_nav_v2 Cucumber scenario is the
oracle).

#### Scenario: Course overview with curriculum
- **WHEN** the candidate course-overview route renders an assigned course
- **THEN** units, action rows, announcements, and version selector match
  the legacy page

#### Scenario: Single-unit course
- **WHEN** the sidebar Course link is followed for a single-unit course
- **THEN** the URL contains `/courses/<course>/units/1`, the unit landing
  renders, and no unit breadcrumb appears (Cucumber oracle)

#### Scenario: Hidden lesson and lock round-trip
- **WHEN** a teacher hides a lesson or locks a lesson from the overview
- **THEN** the state persists via the legacy endpoints and re-renders as
  legacy

### Requirement: MODULARITY arms both work
Both arms of the MODULARITY experiment SHALL be parity targets: the
sidebar's course-content group links to `nestedUnitOverview` or
`unitOverview` per the arm (shell owns the link swap), and both route
shapes render correctly regardless of the arm.

#### Scenario: Arm swap
- **WHEN** scenarios run with MODULARITY on and off
- **THEN** the sidebar links to the arm's overview key and the linked route
  renders, in both arms

### Requirement: AccessDenied path rewrites land here
The candidate SHALL reproduce the legacy CanCan rescue behavior for these
routes: when a teacher loses access, `courses` paths redirect to the public
`/:path` and `unit` paths redirect with the `unit`→`s` rewrite
(`teacher_dashboard_controller.rb:11-16`) — the two branches the shell
change recorded as deferred to this change.

#### Scenario: Lost access on a course route
- **WHEN** a teacher opens a candidate course-overview route for a section
  they no longer instruct
- **THEN** they land on the public course page per the legacy rewrite

### Requirement: Shared progress store module, discovery gate, DS mapping
The `progressRedux` + announcements/hiddenLesson/viewAs slices SHALL move
as one page-scoped store module with recorded contracts (script structure,
unit summary, announcements, lock endpoints) — the module progress
(position 13) reuses. Implementation begins with behavior-scenario
discovery (course_overview/script_overview feature files, overview jest
coverage, sources) exposed as visible dev-shell choices (floor: course
populated, single-unit, no-curriculum, hidden-lesson, lock, view-as,
modularity-on/off, error). No pixel gate (legacy shared JSX). The
design-system mapping is recorded for modernization: legacy action rows
and buttons → MUI Button; version selector → DSCO simpleDropdown;
skeletonize-content → MUI Skeleton; DSCO link/icon usage retained.

#### Scenario: Store module reused by progress
- **WHEN** the progress change (position 13) implements
- **THEN** it mounts this module unchanged, or records a design deviation
  against this requirement

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector
