# Spec: teacher-dashboard-bootstrap-api

## ADDED Requirements

### Requirement: Sections bootstrap endpoint
Rails SHALL expose `GET /api/v1/teacher_dashboard/sections`
(`Api::V1::TeacherDashboard::SectionsController#index`) returning JSON
`{sections: [...], section_order: [...] | null}` where `sections` is
`current_user.sections_instructed` (including accepted co-teachers, with the
same eager-loading as the legacy controller) mapped through
`Section#concise_summarize`, and `section_order` is
`UserPreference.find_by(user_id: current_user.id)&.section_order`.

#### Scenario: Instructor with sections
- **WHEN** a signed-in teacher with instructed sections requests the endpoint
- **THEN** the response contains one entry per instructed section in
  `concise_summarize` shape plus the user's saved `section_order`

#### Scenario: Co-teacher sees co-taught sections
- **WHEN** a user who is an accepted co-teacher (section_instructors) requests
  the endpoint
- **THEN** co-taught sections appear exactly as they do in the legacy HAML
  `sections` payload

#### Scenario: Signed-out request
- **WHEN** an unauthenticated client requests the endpoint
- **THEN** the response is 401 (no redirect, no section data)

#### Scenario: No sections
- **WHEN** a teacher with zero instructed sections requests the endpoint
- **THEN** the response is `{sections: [], section_order: null}` (200), the
  same emptiness the legacy page receives

### Requirement: Field equivalence with the legacy HAML contract is proven
The change SHALL include Rails tests that assert, for representative fixture
sections, that each serialized section in the endpoint response is
field-for-field equal to `Section#concise_summarize` output — same keys, same
values — covering at minimum: `sectionInstructors`, `sync_enabled`,
`post_milestone_disabled`, age-gating fields, avatar fields, `demo_type`,
`code`, `studentCount`, `hidden`, and `login_type`. Fixtures MUST cover all
six login types (word, picture, email, google_classroom, clever, lti_v1), a
hidden (archived) section, and a section with a co-instructor.

#### Scenario: Serializer drift is caught
- **WHEN** a field is added to, renamed in, or removed from
  `Section#concise_summarize`
- **THEN** the equivalence test fails until the endpoint (and its recorded
  contract fixtures) are updated deliberately

#### Scenario: No secrets in the payload
- **WHEN** any section is serialized by the endpoint
- **THEN** the response contains no `secret_words`/`secret_picture` student
  secrets beyond what `concise_summarize` already exposes to the legacy page

### Requirement: Authorization mirrors the legacy page gate
The endpoint SHALL be no more permissive than the legacy
`TeacherDashboardController` CanCan gate: sections are scoped to instructor
membership; requesting other users' data is impossible by construction. The
controller MUST NOT skip CSRF or other default protections (the legacy
`Api::V1::SectionsController#update` CSRF skip is a known quirk and MUST NOT
be replicated).

#### Scenario: Student account
- **WHEN** a signed-in student (not an instructor of any section) requests
  the endpoint
- **THEN** the response is `{sections: [], section_order: null}` or 403 —
  never another user's sections

### Requirement: Typed client wrapper in core
`frontend/packages/core/src/api/dashboard/sections/` SHALL gain a typed
`getTeacherDashboardSections` call (api + keys + query + schemata + types
files per the core API conventions) whose Zod schema is validated against
recorded server JSON from a local Rails run, not written from memory.

#### Scenario: Contract validated against recorded output
- **WHEN** the schema is authored
- **THEN** a parser test feeds it the recorded server JSON fixture and fails
  on any missing/renamed/retyped field
