# sinatra-port-auth-helpers

Permission and relationship predicates for ported controllers, re-expressed
over `current_user` / the User model. Reference implementation (semantics of
record): `dashboard/legacy/middleware/helpers/auth_helpers.rb` — raw Sequel
queries against `users`, `user_permissions`, `sections`, `followers`,
`section_instructors`. Parity tests SHALL assert each predicate against the
same fixtures the Sequel implementation sees.

## ADDED Requirements

### Requirement: Permission predicates
The system SHALL provide `admin?` (true iff `current_user&.admin`) and
`has_permission?(permission)` (true iff the current user holds the named
dashboard permission; false when signed out) with results consistent with the
legacy Sequel implementations for the permissions the ported endpoints use:
`project_validator`, `authorized_teacher`, `levelbuilder`.

#### Scenario: Signed out
- **WHEN** there is no current user
- **THEN** `admin?` and `has_permission?('levelbuilder')` return false

#### Scenario: Levelbuilder permission
- **WHEN** the current user has the `levelbuilder` permission
- **THEN** `has_permission?('levelbuilder')` returns true

### Requirement: Age and sharing predicates
The system SHALL provide `under_13?(user_id)` (true when the user or their
birthday is unknown, matching the legacy default-to-under-13 behavior),
`sharing_disabled?` (current user's `sharing_disabled` property, false when
signed out), and `get_user_sharing_disabled(user_id)` (that user's property,
defaulting to false when the user or property is missing).

#### Scenario: Unknown birthday defaults to under 13
- **WHEN** `under_13?` is called with the id of a user having no birthday
- **THEN** it returns true

#### Scenario: Missing user defaults sharing to enabled
- **WHEN** `get_user_sharing_disabled` is called with a nonexistent user id
- **THEN** it returns false

### Requirement: Teacher and section relationship predicates
The system SHALL provide `teaches_student?(student_id, user_id =
current_user_id)` and `owns_section?(section_id)` matching legacy semantics:
`teaches_student?` is true iff the given user is an instructor (via
`section_instructors`) of a non-deleted section containing the non-deleted
student as a non-deleted follower; `owns_section?` is true iff the current
user is the section's `user_id` owner (not merely an admin).

#### Scenario: Co-instructor counts as teacher
- **WHEN** a user is a co-instructor (a `section_instructors` row, not the
  section owner) of a section containing the student
- **THEN** `teaches_student?(student.id, user.id)` returns true

#### Scenario: Deleted section does not count
- **WHEN** the only section linking teacher and student is soft-deleted
- **THEN** `teaches_student?` returns false

#### Scenario: Admin does not own others' sections
- **WHEN** the current user is an admin who does not own the given section
- **THEN** `owns_section?(section.id)` returns false
