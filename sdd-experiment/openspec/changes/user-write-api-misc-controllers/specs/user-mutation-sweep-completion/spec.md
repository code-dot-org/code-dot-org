# Spec: user-mutation-sweep-completion

## ADDED Requirements

### Requirement: Permission changes are named and audited
Granting and revoking any UserPermission SHALL flow through
GrantPermission/RevokePermission and SHALL emit an audit record naming
actor, target, and permission — the same trail for bulk and single
operations.

#### Scenario: Admin grants a permission
- **WHEN** an admin grants a permission via the admin UI
- **THEN** the grant persists, the response matches the pre-migration
  pin, and one audit record is emitted

### Requirement: Compliance acceptance is a named idempotent command
Data-transfer-agreement acceptance SHALL run through
AcceptDataTransferAgreement, recording the five agreement fields exactly
once per user.

#### Scenario: Repeat acceptance
- **WHEN** accept_data_transfer_agreement is called for a user who
  already accepted
- **THEN** the stored acceptance timestamp is unchanged and the response
  is 204, as today

### Requirement: The sweep closes and the cop enforces
After this change, controllers SHALL contain no direct User mutations
outside the exemption list, and the UserMutationOutsideService cop's
todo list SHALL be empty, making new direct writes lint failures.

#### Scenario: Post-sweep inventory
- **WHEN** the mutation-site inventory is re-run
- **THEN** every hit is a catalog command call or an enumerated
  exemption
