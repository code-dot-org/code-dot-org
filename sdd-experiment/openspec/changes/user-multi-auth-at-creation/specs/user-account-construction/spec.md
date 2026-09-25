# Spec: user-account-construction

## ADDED Requirements

### Requirement: Users are born multi-auth
Every persisted user SHALL have `provider == 'migrated'` from its first
save, with its `AuthenticationOption` (when the flow carries a
credential) built on the unsaved record and inserted in the same save —
never by a post-create conversion write. Sponsored users SHALL be
created with `provider == 'migrated'` and no authentication option.

#### Scenario: Email/password sign-up
- **WHEN** a user finishes email/password registration
  (`Services::PartialRegistration::UserBuilder`)
- **THEN** the created user is `migrated?` with exactly one EMAIL
  authentication option carrying the email/hashed email, and
  `primary_contact_info` points at it

#### Scenario: OAuth sign-up
- **WHEN** a user completes an oauth sign-up (Google, Clever,
  ClassLink, Microsoft, ...) including the partial-registration
  session round trip
- **THEN** the created user is `migrated?` with exactly one
  authentication option of that credential type, oauth tokens stored in
  the option's `data` and absent from the legacy user columns

#### Scenario: Roster import
- **WHEN** students are created by Clever/Google Classroom section
  import (`User.from_omniauth` via `OmniAuthSection`)
- **THEN** each created student is `migrated?` with one authentication
  option of the roster credential type, created in a single save

#### Scenario: Sponsored bulk add
- **WHEN** a teacher bulk-adds students to a section
  (`Api::V1::SectionsStudentsController#bulk_add`)
- **THEN** each created student is `migrated?`, has zero authentication
  options and a blank `encrypted_password`, and `sponsored?` returns
  true both before and after the save

#### Scenario: Word/picture section join
- **WHEN** a student registers through `/join`
  (`FollowersController#student_register`) with a password
- **THEN** the created user is `migrated?`; an EMAIL authentication
  option exists exactly when a hashed email was provided, matching
  today's post-migration shape

### Requirement: Rollout is per-flow and reversible
Conversion of each creation flow SHALL be gated by a DCDO flag listing
enabled flows; a flow absent from the list SHALL run the legacy
create-then-migrate path with behavior identical to today, and the two
paths SHALL yield the same persisted account shape.

#### Scenario: Flag off
- **WHEN** a user is created through a flow not named in the DCDO list
- **THEN** the legacy path runs and the resulting account (provider,
  authentication options, primary contact info) is byte-identical to
  current production behavior

#### Scenario: One flow enabled
- **WHEN** only `email` is in the DCDO list and users are created via
  email sign-up and via sponsored bulk add
- **THEN** the email user is constructed multi-auth at initialization
  while the sponsored path still runs the legacy hook, and both end in
  the same shapes as their pinning tests

### Requirement: The post-create migration hook is retired
User SHALL drop `after_create :migrate_to_multi_auth` once every
creation flow is ramped; user creation SHALL perform no second save to
convert the account, and a consistency oracle SHALL hold.

#### Scenario: Single-write creation
- **WHEN** any user is created after hook removal
- **THEN** no callback rewrites `provider` or builds authentication
  options post-create; the account shape is final at the first save

#### Scenario: Consistency oracle
- **WHEN** users created after the ramp start are scanned
- **THEN** zero rows have `provider != 'migrated'`, and every sponsored
  row has no authentication options and a blank password
