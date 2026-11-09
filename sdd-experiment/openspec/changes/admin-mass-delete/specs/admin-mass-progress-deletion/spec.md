# admin-mass-progress-deletion

## ADDED Requirements

### Requirement: Two-phase bulk deletion via admin API
The system SHALL expose a non-mutating preview endpoint resolving
submitted usernames to users (with warnings for unknowns), and a
separate sudo-gated execution endpoint accepting confirmed user ids and
a required reason; execution SHALL create one AdminAuditEvent per
affected user plus a batch row sharing a batch id.

#### Scenario: Preview resolves and warns
- **WHEN** an admin previews a list containing unknown usernames
- **THEN** resolved users and per-name warnings are returned and nothing
  is deleted or audited

#### Scenario: Execute with fresh sudo
- **WHEN** an admin with fresh sudo executes a confirmed id list with a
  reason
- **THEN** progress is deleted for each user, per-user audit rows and a
  batch row exist, and re-validated-missing ids are reported as skipped

#### Scenario: Execute without sudo
- **WHEN** the sudo stamp is stale
- **THEN** the response is 403 sudo_required and nothing is deleted

### Requirement: Mass-delete page lives in the admin package
The mass-delete UI SHALL be served from @code-dot-org/admin in the admin
SPA, ported from apps/src/templates/admin/MassDeleteContainer.tsx with
its preview→confirm flow intact; the apps/ copy is removed at
decommission.

#### Scenario: SPA flow parity
- **WHEN** an admin completes preview and confirm in the SPA page
- **THEN** the same two-phase contract executes via the new endpoints
  with the confirmation step mandatory
