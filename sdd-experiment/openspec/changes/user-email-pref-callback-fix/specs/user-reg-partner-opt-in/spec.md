# Spec: user-reg-partner-opt-in

## ADDED Requirements

### Requirement: Opt-in is recorded on the record being saved
The system SHALL record `share_teacher_email_regional_partner_opt_in` on
the record being saved (`self`) when a teacher is saved with
`share_teacher_email_reg_partner_opt_in_radio_choice` of "yes"
(case-insensitive); it MUST NOT resolve the target by email lookup, MUST
NOT write any other account, and MUST NOT fail the save when an email
lookup would have missed.

#### Scenario: Teacher opts in
- **WHEN** a teacher is saved with the radio choice "yes"
- **THEN** the teacher's own `share_teacher_email_regional_partner_opt_in`
  is set and persisted, in a single save cycle, and no other User row is
  modified

#### Scenario: Email lookup would miss
- **WHEN** a teacher whose email does not resolve via
  `User.find_by_email_or_hashed_email` is saved with the radio choice
  "yes"
- **THEN** the save completes without error and the timestamp is recorded
  on the teacher (previously: NoMethodError in `after_save`, rolling back
  the save)

#### Scenario: Colliding email resolves to another account
- **WHEN** a teacher is saved with the radio choice "yes" and another
  account shares the same email hash
- **THEN** the timestamp is recorded on the teacher being saved and the
  other account is unmodified (previously: the other account was stamped
  and re-saved)

#### Scenario: No opt-in, no write (existing behavior preserved)
- **WHEN** a user is saved with the radio choice "no", or a non-teacher
  is saved with any radio choice
- **THEN** `share_teacher_email_regional_partner_opt_in` is neither set
  nor cleared, on any record
