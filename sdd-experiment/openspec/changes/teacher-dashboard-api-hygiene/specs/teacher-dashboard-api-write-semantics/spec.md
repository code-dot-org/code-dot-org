# Spec: teacher-dashboard-api-write-semantics

## ADDED Requirements

### Requirement: Reads do not mutate
Teacher-dashboard GET endpoints SHALL be side-effect free. Specifically:
`get_drawer_data` (or its successor) MUST NOT update interstitial last-seen
timestamps, and the home bootstrap endpoint MUST NOT clear flash state on
read. Each displaced side effect moves to an explicit POST endpoint invoked
by the client after the corresponding UI event.

#### Scenario: Drawer read is repeatable
- **WHEN** the drawer payload is fetched twice with no intervening
  acknowledge
- **THEN** both responses are identical and no server timestamp changed

#### Scenario: Interstitial acknowledge
- **WHEN** the candidate homepage displays the school-info interstitial and
  posts the acknowledge endpoint
- **THEN** the last-seen timestamp updates exactly once, with CSRF
  protection active

#### Scenario: Flash acknowledge
- **WHEN** the candidate homepage displays a flash toast and posts the
  acknowledge endpoint
- **THEN** subsequent home bootstrap reads return no flash

### Requirement: State-changing endpoints are CSRF-protected
`Api::V1::SectionsController#update` SHALL verify authenticity tokens (the
`skip_before_action` is removed), and all its callers SHALL send the token
via the standard clients. New teacher-dashboard write endpoints MUST NOT
introduce CSRF skips.

#### Scenario: Update without token rejected
- **WHEN** a section update is posted without a valid CSRF token
- **THEN** the request is rejected, and the legacy + candidate UIs continue
  to work because their clients supply tokens

### Requirement: TOS acceptance is explicit
Recording acceptance of the latest terms of service SHALL require an
explicit user action routed to a dedicated endpoint. The legacy render-time
auto-accept remains only on the legacy page and is removed at cutover after
a product ruling is recorded.

#### Scenario: Accept on click
- **WHEN** a teacher accepts the TOS interstitial in the candidate
- **THEN** acceptance is recorded via the endpoint; merely loading the page
  records nothing

### Requirement: unit_in_aif contract is pinned
The dead `else` branch in `TeacherDashboardController#unit_in_aif` SHALL be
removed and the real contract pinned by tests: valid unit id → `{aif:
boolean}`; unknown id → 404.

#### Scenario: Unknown unit id
- **WHEN** `unit_in_aif` is requested with a nonexistent unit id
- **THEN** the response is 404 (not `{aif: false}`)
