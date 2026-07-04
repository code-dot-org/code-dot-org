# Spec: teacher-dashboard-settings-page

Contract tables (sources, API/mutation table, scenario matrix, gates, DS
mapping, BLOCKED-EVIDENCE items) are pinned in this change's design.md;
requirements below bind to them.

## ADDED Requirements

### Requirement: Settings tab at parity
The candidate route SHALL render the ported settings form at
`/frontend-studio/teacher_dashboard/sections/:sectionId/settings` with
every legacy field and behavior: section name, grade chips, curriculum
quick-assign (with participant-type and locale-filtered versions), lesson
extras, pairing, text-to-speech, project sharing, restrict-section, and
coteacher management. The form is the moved
`sectionsRefresh/SectionsSetUpContainer` edit path (`sectionToBeEdited`);
`login_type` is not editable on the edit path; PL sections force
`grades: ['pl']` in the payload. Native form validation
(`form.checkValidity()`) aborts invalid saves with no request. CORRECTED
from prior planning: there is NO section-delete affordance on this tab
(zero hits in the settings sources; delete lives on the homepage options
dropdown) — a blocking task confirms this at runtime against the legacy
tab.

#### Scenario: Edit and save
- **WHEN** a teacher changes grade, curriculum, and name, then saves
- **THEN** the client issues `PATCH /api/v1/sections/:id` with the
  `section_data` body per the design.md API table (field-equality asserted
  against a recorded legacy save), sends `X-CSRF-Token`, and on success
  navigates to the progress destination (the local_nav_v2 Cucumber
  "Modifying settings" scenario is the oracle: renamed section appears in
  the sidebar dropdown on the progress page)

#### Scenario: Validation failure
- **WHEN** a required field is empty at save
- **THEN** native validity reporting fires and no network request is made

#### Scenario: PL section payload
- **WHEN** the section's participant type is not student
- **THEN** the PATCH body carries `grades: ['pl']` and the PL quick-assign
  variant renders

#### Scenario: Coteacher round-trip
- **WHEN** a teacher validates, adds, then removes a coteacher
- **THEN** the client calls `GET /api/v1/section_instructors/check?email=`,
  `POST /api/v1/section_instructors`, and
  `DELETE /api/v1/section_instructors/:id` with legacy semantics, and an
  analytics `COTEACHER_INVITE_SENT` event fires per added coteacher

### Requirement: Dirty-navigation guard at parity
The candidate SHALL reproduce the two-layer guard: an in-app navigation
blocker showing the DSCO save-blocker modal (continue proceeds, cancel
stays) while an edit is in progress, and a `beforeunload` listener for
hard navigation. The blocker is re-implemented on the host router's
blocker API (recorded blocker evidence: legacy `useBlocker` is
react-router-specific and cannot move to a TanStack host).

#### Scenario: Save blocker
- **WHEN** the form is dirty and the teacher navigates in-app
- **THEN** the modal renders with `saveBlockerModalTitle`/`Description`
  copy; continue proceeds with the navigation, cancel resets the blocker

### Requirement: Redirect-on-save resolves through the shell map
The post-save redirect SHALL resolve the `progress` destination through
the shell's per-tab map (legacy URL until progress migrates, candidate
route after), replacing the legacy hardcoded full-page `navigateToHref`
only in where the URL comes from — navigation semantics stay
full-page-equivalent until the target is in-shell.

#### Scenario: Before and after progress migrates
- **WHEN** a save completes while progress is unmigrated (and again after
  the progress change lands)
- **THEN** the teacher lands on the legacy progress URL (respectively the
  candidate progress route) with no settings-side change beyond the map
  entry

### Requirement: Contracts from captures; scenario matrix is the coverage
Wrapper schemata SHALL be authored only from the BLOCKED-EVIDENCE runtime
captures listed in design.md (PATCH save round-trip — the `...section`
spread makes the recorded request the contract;
`quick_assign_course_offerings` per participant type; coteacher-add body;
per-locale offerings for version filtering). The design.md scenario matrix
(9 rows) is the coverage contract: each row becomes an MSW fixture exposed
as a visible dev-shell choice plus a component test citing its oracle.
Pixel parity applies per the gate table (form per participant type,
save-blocker modal; section-name masked), captured via the shell harness
at `http://localhost-studio.code.org:9000` with serving-checkout
validated; Playwright MCP MAY be used during implementation.

#### Scenario: Recorded save is the contract
- **WHEN** the PATCH wrapper is authored
- **THEN** its schema and the request-equality test derive from the
  captured legacy save, not from the source field list alone

#### Scenario: No-delete confirmed
- **WHEN** the runtime confirmation task runs against the legacy settings
  tab
- **THEN** the absence of a delete affordance is recorded (or its presence
  reopens scope before implementation proceeds)
