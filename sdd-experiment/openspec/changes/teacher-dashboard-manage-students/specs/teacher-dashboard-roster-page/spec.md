# Spec: teacher-dashboard-roster-page

## ADDED Requirements

### Requirement: Roster renders in the candidate shell
The candidate roster route SHALL render the moved roster at
`/frontend-studio/teacher_dashboard/sections/:sectionId/roster`:
loading spinner while students load, provider sync control
where applicable, and the student table with the legacy column set — name,
family name, age, gender, password/secret (word/picture/email variants),
project sharing, US state, completed levels, actions — for the selected
section. The candidate alias route `manage_students` SHALL redirect
(replace) to `roster`. The roster renders for empty sections without an
empty-state gate, as legacy does.

#### Scenario: Table for an email section
- **WHEN** a teacher opens the candidate roster for an email-login section
  with students
- **THEN** the table lists each student with the email-section column
  variants and the add-student affordances enabled

#### Scenario: Empty section
- **WHEN** the section has zero students
- **THEN** the roster renders its add-students affordances (no redirect, no
  empty-state page), matching legacy

#### Scenario: Alias redirect
- **WHEN** a teacher opens
  `/frontend-studio/teacher_dashboard/sections/:sectionId/manage_students`
- **THEN** they land on `.../roster` via replace navigation

### Requirement: Student mutations at parity
The roster SHALL support, against the legacy endpoints with unchanged
semantics: add row(s), edit-all mode, per-student edit and save, remove
with confirmation, bulk add, password reset, secret word/picture reset,
move students between sections (transfers, including the other-teacher
flow), login export, printable login cards, and parent letter download.
Mutation availability SHALL follow `login_type`: full CRUD for
word/picture/email sections; no add/remove for provider-managed sections
(google_classroom, clever, lti_v1), which offer sync and reauthorize
instead. Capacity and `restrict_section` limits apply as legacy (at-capacity
blocks adds except for externally-rostered sections).

#### Scenario: Edit-all and save
- **WHEN** the teacher enters edit mode from the actions header, edits a
  family name, and saves
- **THEN** the row persists via the legacy update endpoint and the table
  exits edit state showing the new value

#### Scenario: Provider-managed section
- **WHEN** the roster renders a clever/google/lti section
- **THEN** add/remove affordances are absent, the sync control is present,
  and student rows are read-limited exactly as legacy

#### Scenario: At-capacity add blocked
- **WHEN** a non-externally-rostered section is at capacity and the teacher
  attempts to add a student
- **THEN** the add is blocked with the legacy messaging

### Requirement: Compliance-sensitive dialogs at parity
The following SHALL behave exactly as legacy: age-gating modals (age-gated
sections and age-gated students), parental permission status display,
secret display/reset flows, project-sharing controls, and the
code-review-groups dialog (honoring `code_review_expires_at`). Their
Cucumber features are the porting oracle and no behavior deviation is
permitted.

#### Scenario: Age-gated student modal
- **WHEN** the section/student state matches the legacy age-gating trigger
- **THEN** the same modal flow renders with the same copy and the same
  persisted outcome

#### Scenario: Code review groups
- **WHEN** the teacher opens the code-review-groups dialog and assigns
  groups
- **THEN** groups persist via the legacy endpoint and expiry state follows
  `code_review_expires_at`

### Requirement: Behavior scenario discovery is an implementation gate
Implementation SHALL begin by discovering the roster behavior matrix from
the oracles — the existing Playwright spec + POMs, the four roster Cucumber
features, the legacy manageStudents jest suite, and the moved source — and
recording each scenario with evidence and coverage choice. The discovered
scenarios SHALL be exposed as visible dev-shell choices, at minimum: one per
login type (word, picture, email, google_classroom, clever, lti_v1), plus
age-gated, at-capacity, restricted, empty, transfer-target, and
mutation-error (409/401) scenarios.

#### Scenario: Discovery output recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage decisions is in the
  change's task log and the dev-shell selector exposes the scenarios

### Requirement: Parity gates are behavioral, copy, and a11y — not pixel
This change SHALL NOT carry a pixel-parity gate: the roster is non-DSCO
legacy UI (reactabular table, legacy SCSS; DSCO only in leaf widgets).
Instead: the ported Playwright roster spec MUST pass against the candidate
route; discovered scenarios MUST be covered by component tests over MSW;
every dialog MUST pass axe and keyboard-operability checks (AA floor);
en-US copy MUST match legacy verbatim. A concise design-system mapping for
the eventual DS migration SHALL be recorded: reactabular table → DSCO/MUI
table with sticky header; legacy buttons → MUI Button; inline inputs → DSCO
textField/dropdown; react-tooltip → DSCO tooltip; hand-rolled dialog
chrome → DSCO dialog; icons remain DSCO fontAwesomeV6Icon.

#### Scenario: Ported Playwright spec green
- **WHEN** `manage-students-tab.spec.ts` (parameterized to the candidate
  route) runs against
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/roster`
- **THEN** it passes without weakening assertions, while the legacy-route
  run stays green

#### Scenario: Dialog a11y floor
- **WHEN** each roster dialog opens under test
- **THEN** axe reports no violations at AA and the dialog is fully
  keyboard-operable (open, complete, cancel)
