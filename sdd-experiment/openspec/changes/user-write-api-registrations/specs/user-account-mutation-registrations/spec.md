# Spec: user-account-mutation-registrations

## ADDED Requirements

### Requirement: Registrations mutations flow through catalog commands
Every User-mutating endpoint in registrations_controller SHALL delegate
to its catalog command (UpdateName, UpdatePassword, UpdateDemographics,
UpdateAgeAndState, UpdateParentEmail, SetUserType, UpdateEmail,
SoftDelete) with no direct `update`/`save`/mass-assignment of User
attributes remaining in the controller.

#### Scenario: Profile update
- **WHEN** a signed-in user submits the account edit form changing name
  and password
- **THEN** the controller invokes the corresponding commands in one
  transaction and the response (status, flash, errors) is identical to
  the pre-migration pin

#### Scenario: user_type leaves mass assignment
- **WHEN** set_user_type is invoked
- **THEN** `user_type` is not mass-assigned; the transition runs through
  SetUserType and the returned object's class matches its user_type

### Requirement: Current-password gate is preserved exactly
Endpoints that verify current_password today SHALL continue to reject
the same requests with the same status when current_password is missing
or wrong, per account shape (password-bearing vs oauth-only vs
sponsored), exactly as `update_with_password` does now.

#### Scenario: Oauth-only user edits email
- **WHEN** an oauth-only user (no encrypted_password) changes email
- **THEN** no current_password is demanded, matching today's
  `needs_password?` result

### Requirement: Equivalence is proven tests-first
Each endpoint SHALL have its characterization suite (status, body, row
deltas on users and authentication_options, mail) green before
delegation and passing unchanged after.

#### Scenario: Pin suite gate
- **WHEN** an endpoint's delegation PR is opened
- **THEN** it contains no characterization-test edits, only additions
  landed in a prior commit
