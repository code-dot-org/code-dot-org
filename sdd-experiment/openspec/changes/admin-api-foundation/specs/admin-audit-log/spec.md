# admin-audit-log

## ADDED Requirements

### Requirement: Every mutating admin API request is audited
The system SHALL persist an AdminAuditEvent row for every POST/PUT/PATCH/
DELETE handled under /api/admin, recording actor_id, action
(controller#action), affected_user_id and affected_record (when set),
sanitized params, request_id, ip, outcome, and timestamp — automatically
via the base controller, with no per-endpoint opt-in.

#### Scenario: Successful mutation
- **WHEN** an admin POST succeeds
- **THEN** an AdminAuditEvent row exists with outcome success and the
  request's actor, action, and request_id

#### Scenario: Failed mutation
- **WHEN** an admin POST raises or returns a 4xx/5xx
- **THEN** an AdminAuditEvent row still exists with the failure outcome
  and status

#### Scenario: Read request
- **WHEN** an admin GET is handled
- **THEN** no AdminAuditEvent row is created

### Requirement: Audit writes never break the request
Audit persistence failures SHALL NOT fail or delay the admin action's
response; the failure is reported to the error log instead.

#### Scenario: Audit table unavailable
- **WHEN** the AdminAuditEvent insert raises
- **THEN** the endpoint's response is returned unchanged and the audit
  failure is logged to CDO.log

### Requirement: Sensitive parameters are sanitized
Audited parameters SHALL pass through the Rails filter list plus an
admin-specific blocklist so passwords, tokens, and secrets never reach
the audit table.

#### Scenario: Filtered key
- **WHEN** a mutation includes a `password` or `token` parameter
- **THEN** the stored params show the filtered placeholder, not the value

### Requirement: Legacy structured log line preserved
Each audited mutation SHALL also emit the existing CDO.log JSON line
(namespace admin, event, actor, affected user, request_id) so log-based
tooling keeps working during and after the migration.

#### Scenario: Log side effect
- **WHEN** an audited mutation completes
- **THEN** a CDO.log line with `namespace: "admin"` and the same
  request_id as the AdminAuditEvent row is emitted
