# admin-impersonation

## ADDED Requirements

### Requirement: Impersonation remains a server-rendered flow
Identity assumption SHALL remain the legacy Rails POST performing a
full-page redirect; no JSON endpoint under /api/admin may swap the
session identity, and the SPA launch form SHALL submit a plain HTML form
POST so the browser leaves the SPA entirely.

#### Scenario: Launch from the SPA
- **WHEN** an admin confirms impersonation on the SPA launch form
- **THEN** the browser form-POSTs to the legacy endpoint and lands on
  the target user's experience as a fresh page load

#### Scenario: No API impersonation
- **WHEN** any /api/admin endpoint is called
- **THEN** the responding session's identity is the same as the
  requesting session's (no identity swap via API)

### Requirement: Impersonation is sudo-gated and durably audited
The legacy assume_identity action SHALL require fresh sudo
(require_sudo!) and SHALL write an AdminAuditEvent (actor, target,
request_id) in addition to its existing log line.

#### Scenario: Stale sudo
- **WHEN** an admin with a stale sudo stamp submits the impersonation
  form
- **THEN** the request is rejected and no session change occurs

#### Scenario: Audit row
- **WHEN** an impersonation succeeds
- **THEN** admin_audit_events contains a row attributing the assume to
  the original admin and target user
