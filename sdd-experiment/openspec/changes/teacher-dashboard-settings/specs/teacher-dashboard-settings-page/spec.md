# Spec: teacher-dashboard-settings-page

## ADDED Requirements

### Requirement: Settings tab at parity
The candidate route SHALL render the ported settings form at
`/frontend-studio/teacher_dashboard/sections/:sectionId/settings` with
every legacy field and behavior: section name, grade selection, curriculum
assignment with locale-filtered versions and participant-type filtering,
lesson extras, pairing, text-to-speech, project sharing, restrict-section,
and section delete with confirmation. Validation and the save-blocker
modal behave as legacy.

#### Scenario: Edit and save
- **WHEN** a teacher changes grade, curriculum, and name, then saves
- **THEN** the section updates via the existing endpoints and the teacher
  lands on the progress destination (the local_nav_v2 Cucumber settings
  scenario is the oracle)

#### Scenario: Save blocker
- **WHEN** a save would trigger the legacy blocker condition
- **THEN** the save-blocker modal renders with legacy copy and
  continue/cancel semantics

#### Scenario: Delete with confirmation
- **WHEN** a teacher deletes the section and confirms
- **THEN** the section is deleted and the teacher exits to the legacy
  destination for a removed section; cancel leaves state unchanged

### Requirement: Redirect-on-save resolves through the shell map
The post-save redirect SHALL resolve the `progress` destination through the
shell's per-tab map (legacy URL until progress migrates, candidate route
after), not a hardcoded URL.

#### Scenario: Before and after progress migrates
- **WHEN** a save completes while progress is unmigrated (and again after
  the progress change lands)
- **THEN** the teacher lands on the legacy progress URL (respectively the
  candidate progress route) with no settings-side code change beyond the
  map entry

### Requirement: Typed mutations, discovery gate, pixel parity
Section update/delete and course-offering lookups SHALL flow through typed
core wrappers verified against recorded traffic (existing
`valid_course_offerings` / `available_participant_types` wrappers verified
then reused; candidate client always sends CSRF tokens). Implementation
begins with behavior-scenario discovery (settings TSX sources, the
local_nav_v2 Cucumber scenario, validation branches) exposed as visible
dev-shell choices (floor: default, locale-filtered-versions, PL
participant-type, restricted, save-blocker, delete, error). Pixel parity
applies (DSCO-era TSX): baselines/checkpoints for the form, the
save-blocker modal, and the delete confirmation at
`http://localhost-studio.code.org:9000` with serving-checkout validated;
Playwright MCP MAY be used during implementation.

#### Scenario: Form pixel diff
- **WHEN** the harness compares the populated settings form with declared
  masks
- **THEN** the region-scoped diff is within threshold or fails with the
  diff image attached

#### Scenario: Discovery recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage is in the task log
  and the dev-shell selector
