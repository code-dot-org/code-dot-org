# Spec delta: teacher-dashboard-shell-navigation (from teacher-dashboard-shell)

## MODIFIED Requirements

### Requirement: Sidebar navigation chrome
The shell SHALL render the section-scoped sidebar equivalent to
`TeacherNavigationBar`: section dropdown (switching sections rewrites
`:sectionId` and preserves the active tab), grouped tab links with icons and
localized labels, and the same conditional entries as legacy under default
flag state (skills dashboard and student snapshot excluded; MODULARITY,
`student-snapshot`, and `ai-differentiation` experiment arms excluded — the
default arm is the parity target). The `roster` tab entry SHALL resolve to
the candidate roster route (no longer the legacy URL). All other unmigrated
tabs continue to render as links to their legacy URLs (full page navigation
is acceptable and expected).

#### Scenario: Section switch preserves tab
- **WHEN** a teacher on candidate `roster` for section A picks section B in
  the sidebar dropdown
- **THEN** the URL becomes `.../sections/<B>/roster` and section B's data
  loads

#### Scenario: Roster tab stays in the candidate
- **WHEN** a teacher clicks Roster in the candidate sidebar
- **THEN** the candidate roster route renders in-shell without a full page
  load to legacy

#### Scenario: Unmigrated tab exits to legacy
- **WHEN** a teacher clicks an unmigrated tab (e.g. Progress) in the
  candidate sidebar
- **THEN** the browser navigates to
  `/teacher_dashboard/sections/<id>/progress` (legacy), which renders
  normally
