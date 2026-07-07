# admin-config-editing

## ADDED Requirements

### Requirement: Config mutations are sudo-gated and value-audited
The system SHALL expose admin-gated endpoints to update DCDO keys, set
and delete Gatekeeper gates, update feature_mode, and set the NPS
audience; every mutation requires fresh sudo and creates an
AdminAuditEvent recording key/gate name and before/after values
(size-capped, sanitizer applied).

#### Scenario: DCDO update
- **WHEN** an admin with fresh sudo updates a DCDO key
- **THEN** the new value propagates as the legacy editor's write does
  and the audit row carries key, old value, and new value

#### Scenario: Gate delete without sudo
- **WHEN** an admin with a stale sudo stamp deletes a Gatekeeper gate
- **THEN** the response is 403 sudo_required and the gate is unchanged

#### Scenario: Attribution
- **WHEN** any config value changes via the API
- **THEN** admin_audit_events answers who changed it, when, and from
  what value to what value

### Requirement: Config editor pages in the admin SPA
The admin SPA SHALL provide editor pages replacing the DCDO, Gatekeeper,
feature_mode, and NPS forms, with client-side JSON validation, a
mandatory old→new diff confirmation before every write, and typed key
confirmation on deletes.

#### Scenario: Diff confirmation
- **WHEN** an admin edits a value and submits
- **THEN** the page shows old vs new and requires confirmation before
  the API call is made

#### Scenario: Invalid JSON
- **WHEN** the edited value fails client-side validation
- **THEN** the submit is blocked with an inline error and no request is
  sent
