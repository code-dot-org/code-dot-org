# Spec: user-credential-mutation

## ADDED Requirements

### Requirement: Credential mutations are named and transactional
Adding, removing, and re-primarying authentication options SHALL occur
only through AddAuthenticationOption, RemoveAuthenticationOption, and
SetPrimaryContactInfo, each executing its writes inside a single
database transaction.

#### Scenario: Disconnect a primary option
- **WHEN** a user disconnects the auth option that is their primary
  contact
- **THEN** the option is destroyed and a replacement primary is set in
  one transaction, with response and row deltas matching the
  pre-migration pin

#### Scenario: Primary swap leaves no orphans
- **WHEN** SetPrimaryContactInfo fails after reassigning primary
- **THEN** the transaction rolls back and no superseded email option
  survives half-deleted

### Requirement: Dual-path branching is command-internal
Callers of credential commands MUST NOT branch on `migrated?`; the
migrated/unmigrated arms live inside the commands until
user-single-auth-retirement deletes them.

#### Scenario: Token refresh for a legacy user
- **WHEN** an oauth sign-in refreshes tokens for an unmigrated user
- **THEN** the command writes the legacy columns exactly as
  update_oauth_credential_tokens does today, with no caller-side branch

### Requirement: Credential changes are observable
Every credential command invocation SHALL emit the write-API
instrumentation event, giving credential add/remove/primary-change an
audit trail.

#### Scenario: Audit presence
- **WHEN** any credential command completes
- **THEN** exactly one instrumentation event with the command name and
  user id is emitted
