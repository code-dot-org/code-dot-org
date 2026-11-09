# Spec: user-policy-layer

## ADDED Requirements

### Requirement: Policy predicates are answered by Policies::User
Every in-scope user policy predicate SHALL be defined as a
`Policies::User` class method taking the user (the account-management,
managed-account, section-derived, and permission-derived predicates
inventoried in design), and the User model method of the same name
SHALL delegate to it and return an identical answer for every user
state.

#### Scenario: Model and policy agree
- **WHEN** any in-scope predicate is evaluated for a given user both as
  `user.predicate?` and as `Policies::User.predicate?(user)`
- **THEN** the two answers are equal, for representative user states
  (student/teacher, migrated/unmigrated, sponsored, oauth-only,
  password-bearing, sectioned/unsectioned)

#### Scenario: Policy is self-contained
- **WHEN** an in-scope policy predicate calls another in-scope
  predicate (e.g. `should_see_add_password_form?` needs
  `can_create_personal_login?`)
- **THEN** the call resolves inside `Policies::User`, not through the
  model's delegating method

### Requirement: Provider set has one owner
`Policies::User.personal_account?` SHALL derive the user's credential
types from `User#providers` rather than recomputing them, and SHALL
return the same answer as the pre-change implementation for every
persisted user.

#### Scenario: Migrated user with school-owned credentials only
- **WHEN** `personal_account?` is evaluated for a persisted migrated
  student whose only authentication options are Clever/LTI/ClassLink
- **THEN** it returns false, as before the change

#### Scenario: Unmigrated user
- **WHEN** `personal_account?` is evaluated for a persisted unmigrated
  user
- **THEN** the provider set is derived from `user.provider` via
  `User#providers` and the answer matches the pre-change implementation

#### Scenario: Mismatch during the soak period is reported
- **WHEN** the parallel-comparison guard is active and the old and new
  provider derivations disagree for a user
- **THEN** the mismatch is reported to the error channel and the
  pre-change answer is returned

### Requirement: ability.rb consumes shared predicates
CanCanCan rules SHALL call the shared `Policies::User` predicate for
the CSA verified-instructor check instead of restating the logic, so
the check has exactly one definition.

#### Scenario: Javabuilder access rules answer identically
- **WHEN** `:get_access_token` / `:use_unrestricted_javabuilder`
  abilities are evaluated for a student in a CSA-assigned section with
  a verified instructor, and for a student without one
- **THEN** each rule grants and denies exactly as before the change,
  and both rules call the same named predicate
