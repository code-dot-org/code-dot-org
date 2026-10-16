# Spec: core-sections-mocks

## ADDED Requirements

### Requirement: MSW handlers for the core sections client
`frontend/packages/core/src/api/mocks/` SHALL provide default MSW handlers
for the sections domain covering every call the shell issues: the new
`GET /api/v1/teacher_dashboard/sections` bootstrap and the existing
`GET /dashboardapi/section/:id` selected-section reload (already wrapped by
`getSection`). Handlers follow the existing dispatch/registry model so
feature fixtures can shadow individual endpoints per scenario.

#### Scenario: Shell renders offline
- **WHEN** any consumer runs with `VITE_API_MODE=msw` and no fixture
  overrides
- **THEN** sections endpoints return sensible defaults and the production
  code path (real transport, real Zod validation) executes unmodified

#### Scenario: Scenario fixture shadows one endpoint
- **WHEN** a scenario registers a fixture for the bootstrap endpoint only
- **THEN** the bootstrap request serves the fixture while
  `GET /dashboardapi/section/:id` falls through to the default handler

### Requirement: Parser tests for the sections schemata
The sections schemata SHALL be covered by vitest parser tests driven by
recorded server JSON captured from a local Rails run against seeded
sections, covering all six login types and a section with null curriculum
assignment. This applies to the existing `SectionSchema`,
`ConciseSectionSchema`, and `SelectedSectionSchema` and to the new bootstrap
schema. These schemata currently have zero tests; they predate this program
and MUST be validated against reality, not assumed.

#### Scenario: Recorded JSON parses
- **WHEN** the recorded `GET /dashboardapi/section/:id` payload for each
  fixture section is parsed
- **THEN** parsing succeeds and the parsed object preserves the fields the
  shell consumes (id, name, hidden, login_type, studentCount, courseVersionName,
  courseOfferingId, anyStudentHasProgress)

#### Scenario: Contract break is loud
- **WHEN** a recorded payload is mutated to drop a consumed field
- **THEN** the parser test fails (no silent `passthrough` masking)
