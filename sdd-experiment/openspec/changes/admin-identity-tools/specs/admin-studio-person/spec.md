# admin-studio-person

## ADDED Requirements

### Requirement: StudioPerson operations via audited admin API
The system SHALL expose admin-gated endpoints to merge two
StudioPersons, split a StudioPerson, and add an email; merge and split
require fresh sudo; all three create AdminAuditEvent rows and continue
emitting the existing studio_person_audit Firehose events.

#### Scenario: Merge with fresh sudo
- **WHEN** an admin with fresh sudo merges two StudioPersons
- **THEN** the merge applies with legacy semantics, an audit row records
  both person ids, and the Firehose event still fires

#### Scenario: Merge without sudo
- **WHEN** the sudo stamp is stale
- **THEN** the response is 403 sudo_required and no merge occurs

#### Scenario: Add email
- **WHEN** an admin adds an email to a StudioPerson
- **THEN** it applies without sudo and is audited

### Requirement: StudioPerson page in the admin SPA
The admin SPA SHALL provide a StudioPerson page replacing the legacy
form: person lookup, merge/split flows with typed confirmation, and
add-email.

#### Scenario: Merge flow
- **WHEN** an admin completes the merge confirmation in the SPA
- **THEN** the merge executes via the API and the page reflects the
  merged person
