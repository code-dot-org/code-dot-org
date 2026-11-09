# admin-user-inspectors

## ADDED Requirements

### Requirement: Read-only user inspectors via admin API
The system SHALL expose admin-gated GET endpoints returning a target
user's progress (scripts/levels state), projects, and sections, accepting
the same identifier forms and deleted-user handling as the legacy
user_progress/user_projects/user_sections forms.

#### Scenario: Inspect progress
- **WHEN** an admin requests progress for a valid user identifier
- **THEN** the response lists the user's scripts with completion state
  matching the legacy page's content

#### Scenario: Deleted user
- **WHEN** an admin inspects a soft-deleted user
- **THEN** the endpoints return the user's data flagged as deleted, as
  the legacy forms do

#### Scenario: Unknown user
- **WHEN** the identifier resolves to no user
- **THEN** the response is 404 `{error: "not_found"}`

### Requirement: Inspector pages in the admin SPA
The admin SPA SHALL provide user inspector pages (progress, projects,
sections) replacing the legacy forms, cross-linked from search and
section-lookup results.

#### Scenario: Navigate from search to inspector
- **WHEN** an admin clicks a user in search results
- **THEN** the inspector page loads that user's data without re-entering
  the identifier

### Requirement: Read-only endpoints create no audit rows
Inspector and lookup GETs SHALL NOT create AdminAuditEvent rows,
consistent with the admin-audit-log capability's mutating-verbs-only
rule.

#### Scenario: Browsing produces no audit noise
- **WHEN** an admin performs a series of lookups and inspections
- **THEN** the admin_audit_events table gains no rows
