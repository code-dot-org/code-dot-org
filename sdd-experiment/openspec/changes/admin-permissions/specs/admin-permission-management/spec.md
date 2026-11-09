# admin-permission-management

## ADDED Requirements

### Requirement: Permission mutations via audited admin API
The system SHALL expose admin-gated endpoints to list a user's
permissions (GET), grant a permission (POST), revoke a permission
(DELETE), and bulk-grant a permission to an email list (POST); every
mutation creates an AdminAuditEvent with affected_user_id and the
permission name, and no permission state changes via GET.

#### Scenario: Grant
- **WHEN** an admin grants a permission to a user
- **THEN** the user has the permission and an audit row records actor,
  user, and permission

#### Scenario: Revoke uses a mutating verb
- **WHEN** an admin revokes a permission
- **THEN** the revocation happens via DELETE, is audited, and the legacy
  GET-revoke behavior is absent from /api/admin

#### Scenario: Bulk grant partial success
- **WHEN** an admin bulk-grants to a list containing unknown emails
- **THEN** the response reports per-email outcomes (granted / not found /
  already had) and one audit row exists per user actually granted

### Requirement: Permissions page in the admin SPA
The admin SPA SHALL provide a permissions page replacing the legacy
form: user search integration, current permissions list,
grant/revoke controls with confirmation, bulk-grant flow with per-email
results, and a link to the Rails CSV export.

#### Scenario: Revoke from the SPA
- **WHEN** an admin confirms a revoke on the page
- **THEN** the list refreshes with the permission gone and errors from
  the envelope render inline

#### Scenario: CSV export
- **WHEN** an admin clicks the CSV export link
- **THEN** the browser downloads the legacy Rails CSV (no SPA
  reimplementation)
