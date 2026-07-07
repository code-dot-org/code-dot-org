# admin-reporting

## ADDED Requirements

### Requirement: Read-only report endpoints
The system SHALL expose admin-gated GET endpoints for level completion
statistics, level answers, and debug info, executing their queries
against the same read-replica connections the legacy pages use, with
explicit query timeouts returning JSON envelope errors instead of
hanging.

#### Scenario: Level completions
- **WHEN** an admin requests level completion stats with legacy-parity
  filters
- **THEN** the same aggregates the HAML page shows are returned as JSON

#### Scenario: Replica-only access
- **WHEN** any report endpoint executes
- **THEN** no write connection is used (no ReadOnlyError risk and no
  writes)

#### Scenario: Query timeout
- **WHEN** a report query exceeds the timeout budget
- **THEN** the response is an envelope error, not an open connection
  held by the SPA

### Requirement: Report pages in the admin SPA
The admin SPA SHALL provide report pages replacing level_completions,
level_answers, and debug, with CSV links pointing at the legacy Rails
CSV endpoints.

#### Scenario: CSV stays server-rendered
- **WHEN** an admin clicks the CSV link on the completions report page
- **THEN** the browser downloads the Rails-generated CSV
