# admin-config-visibility

## ADDED Requirements

### Requirement: Config read views via admin API
The system SHALL expose admin-gated GET endpoints returning current DCDO
keys/values, Gatekeeper gates, feature_mode, and the dynamic-config view
(replacing dynamic_config#show), creating no audit rows.

#### Scenario: View current config
- **WHEN** an admin loads the config visibility page
- **THEN** current values render from the GET endpoints matching what
  the legacy pages display

#### Scenario: Reads are audit-silent
- **WHEN** an admin browses config views
- **THEN** no AdminAuditEvent rows are created
