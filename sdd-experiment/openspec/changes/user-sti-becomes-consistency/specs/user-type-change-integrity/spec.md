# Spec: user-type-change-integrity

## ADDED Requirements

### Requirement: Type-change services return a correctly-classed user
A type-change service SHALL return, on every successful call, a user
object whose Ruby class equals `User.find_sti_class(user_type)`. This
covers both `Services::User::UpgradeToTeacher` and
`Services::User::DowngradeToStudent`, including their already-that-type
no-op paths. On failure they SHALL return `false` with validation errors
present on the passed-in user object.

#### Scenario: Upgrading a student to teacher
- **WHEN** `UpgradeToTeacher.call` succeeds for a student with a valid
  email
- **THEN** the returned object is `instance_of?(Teacher)` with
  `user_type == User::TYPE_TEACHER`, and the persisted row matches

#### Scenario: Downgrading a teacher to student
- **WHEN** `DowngradeToStudent.call` succeeds for a teacher
- **THEN** the returned object is `instance_of?(Student)` with
  `user_type == User::TYPE_STUDENT`, and the persisted row matches

#### Scenario: No-op call on a user already of the target type
- **WHEN** either service is called for a user already of the target type
- **THEN** the return value is truthy and, if a user object, its class
  equals `User.find_sti_class(user_type)`

#### Scenario: Failed type change
- **WHEN** the underlying save fails (e.g. invalid attributes)
- **THEN** the service returns `false` and the passed-in user object
  carries the validation errors, as callers render today

### Requirement: Callers use the returned object for post-call access
Code that uses the user object after a type-change service call SHALL use
the service's return value, not the pre-call reference, for any
class-sensitive operation (`is_a?`, `instance_of?`, STI dispatch).
Attribute reads on the pre-call reference remain permitted (attributes
are shared by `becomes!`).

#### Scenario: Controller continues the request after an upgrade
- **WHEN** a controller calls `UpgradeToTeacher` on `current_user` and
  then branches on the user's class
- **THEN** it branches on the returned object; reads of `user_type` or
  `teacher?` on `current_user` remain correct either way

### Requirement: STI investment is frozen
The Teacher and Student subclasses SHALL NOT gain new instance behavior,
validations, or callbacks; they remain query conveniences plus the
existing class methods. New type-dependent logic SHALL be implemented in
`Policies::` or `Services::` namespaces keyed on `user_type`, not by STI
dispatch.

#### Scenario: Adding new type-dependent behavior
- **WHEN** a change introduces logic that differs by user type
- **THEN** it lands in a Policy or Service keyed on `user_type`, and the
  Teacher/Student class bodies are unchanged

#### Scenario: Existing STI consumers keep working
- **WHEN** existing code relies on `Teacher.all` / `Student.all` scoping
  or `find_sti_class` instantiation
- **THEN** that behavior is preserved unchanged
