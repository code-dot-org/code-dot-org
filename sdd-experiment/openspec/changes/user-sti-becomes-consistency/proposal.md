# Proposal: user-sti-becomes-consistency

Defect fix from the User Model Improvement Report (July 2026), Addendum 1
finding A7 (verified against source), plus the report's "On STI" posture
recorded as policy. Independent of all other user-model changes; no
ordering constraints. Zero user-visible impact.

## Why

User is STI: `self.inheritance_column = :user_type`
(dashboard/app/models/user.rb:170), `TYPE_TO_STI_CLASS_MAP` maps the two
type strings to `::Teacher`/`::Student` (user.rb:178-181), and
`find_sti_class` dispatches on it (user.rb:183-185).

Type-change paths disagree on whether the in-memory Ruby class must track
`user_type`. Three paths in user.rb reclass with `becomes!`:
`find_or_create_teacher` (user.rb:1571), `from_omniauth` (user.rb:1617),
`new_with_session` (user.rb:1699). But the two type-change services do
not: `Services::User::UpgradeToTeacher` mutates `user_type`
(dashboard/lib/services/user/upgrade_to_teacher.rb:17) and `update!`s;
`Services::User::DowngradeToStudent` passes `user_type` straight to
`update` (dashboard/lib/services/user/downgrade_to_student.rb:12-13).
After either service, the row and the `user_type` attribute say one type
while the Ruby object is still the other class — `is_a?(Teacher)`,
`instance_of?`, and STI method dispatch are wrong until the caller
reloads.

Blast radius today is small: `teacher?`/`student?` read the attribute
(user.rb:886-892), and Teacher/Student carry only class methods
(dashboard/app/models/teacher.rb, student.rb) — the sole class-sensitive
consumer in app code is the `instance_of?(Teacher)` guard at user.rb:1571.
But this is STI's canonical type-change failure mode (report, "On STI"),
and the adversarial review's one addition to the STI freeze was: fix the
`becomes!`-less upgrade path so existing STI consumers stay consistent.

## What Changes

- `UpgradeToTeacher` and `DowngradeToStudent` return a correctly-classed
  user on success: reclass via `becomes!` after the successful save (order
  decided in design), preserving the existing truthy/false return
  contract and the errors-on-the-passed-object failure contract.
- `UserTypeSetter` (dashboard/lib/services/user/user_type_setter.rb)
  passes the return through unchanged.
- Call sites audited and updated to use the returned object where the
  user is used after the call (lti_v1_controller.rb:427,
  pd/session_attendance_controller.rb:62,:87,
  pd/workshop_enrollment_controller.rb:92,
  registrations_controller.rb:397 via UserTypeSetter).
- Tests pin `returned.class == User.find_sti_class(returned.user_type)`
  after upgrade and downgrade.
- Program policy recorded as a requirement: STI investment is FROZEN. No
  new behavior in Teacher/Student subclasses; new type-dependent logic
  goes through Policies/Services keyed on `user_type`.

## Capabilities

### New Capabilities

- `user-type-change-integrity`: after any type-change service call, the
  returned user's Ruby class matches its `user_type`; the STI surface
  itself is frozen.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/lib/services/user/upgrade_to_teacher.rb`,
  `downgrade_to_student.rb` (return value only).
- Four controller call sites + `user_type_setter.rb` audited; edits only
  where the object is used post-call.
- Tests extended in `dashboard/test/lib/services/user/`
  (upgrade_to_teacher_test.rb, downgrade_to_student_test.rb,
  user_type_setter_test.rb).
- No schema change, no user-facing change, no API change.
