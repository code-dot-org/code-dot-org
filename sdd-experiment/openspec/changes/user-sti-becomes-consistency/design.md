# Design: user-sti-becomes-consistency

## Context

`becomes!` returns a *new* instance of the target class sharing the
original's `@attributes`; the original object keeps its old class. So a
service handed `user:` can never fix the caller's reference by mutation —
it must return the reclassed object.

Current return contracts, which callers test only for truthiness:

- `UpgradeToTeacher#call` (upgrade_to_teacher.rb:13-36) returns `true`
  (already-teacher no-op, :14), `false` (blank email, :15; rescue, :35),
  or `user` (the transaction block's value, :24-33).
- `DowngradeToStudent#call` (downgrade_to_student.rb:10-18) returns
  `true` (no-op) or the boolean from `update`.
- `UserTypeSetter#call` (user_type_setter.rb:13-22) passes through.

Failure contract: errors land on the passed-in user.
`registrations_controller#set_user_type` renders
`current_user.errors.as_json` on failure (registrations_controller.rb:430)
and `UpgradeToTeacher`'s rescue comment relies on it
(upgrade_to_teacher.rb:35).

## Decision

**D1 — reclass after the successful save, not before.** The save
(`update!` at upgrade_to_teacher.rb:30, `update` at
downgrade_to_student.rb:12) keeps running on the caller's object, so
validation errors stay visible on `current_user` exactly as today
(registrations_controller.rb:430). Saving under the old class is
behavior-identical: Teacher and Student define no instance-level
validations, callbacks, or methods (teacher.rb: two class methods;
student.rb: one), and the freeze requirement in this change keeps it that
way. On success, return the reclassed object, guarded like user.rb:1571:
`user.instance_of?(klass) ? user : user.becomes!(klass)` — this also
makes the no-op early returns (`return true if user.teacher?` /
`user.student?`) return a correctly-classed user instead of a bare
`true`. Rejected: `becomes!` before save — errors would land on an
internal copy invisible to callers, breaking the error contract.

**D2 — `becomes!`, not `StiFactory#with_type`.** `with_type`
(dashboard/app/models/concerns/sti_factory.rb:13-20) exists, but
`StiFactory` is included only by Level
(dashboard/app/models/levels/level.rb:97); User does not include it, and
`becomes!` is user.rb's established idiom (:1571, :1617, :1699).
`becomes!` re-assigns the inheritance column, which by this point already
holds the target value — a no-op write, nothing left dirty.

**D3 — return contract: correctly-classed user on success, `false` on
failure.** `UpgradeToTeacher` already returns user-or-false;
`DowngradeToStudent` changes from boolean to user-or-false. Safe: every
caller tests truthiness only (lti_v1_controller.rb:427 ignores it,
pd/session_attendance_controller.rb:62,:87 and
pd/workshop_enrollment_controller.rb:92 ignore it,
registrations_controller.rb:392-403 assigns it to
`successfully_updated`). `UserTypeSetter` needs no edit.

**D4 — caller updates are minimal and audited, not wholesale.**
Controllers pass `current_user`, which Devise memoizes per request; the
service cannot rebind it. That is acceptable: `@attributes` are shared,
so post-call attribute reads on the stale reference — `current_user.
user_type` for the metrics event (registrations_controller.rb:415-424),
`current_user.teacher?` (session_attendance_controller.rb:75) — are
correct. The audit confirms no class-sensitive (`is_a?`/`instance_of?`/
dispatch) use of the user follows any of the four call sites within the
request; where a future caller needs the object post-call, it uses the
return value. The requirement is on the service's return so that callers
*can* be correct, matching the user.rb `becomes!` paths.

**D5 — the STI freeze is a spec requirement, enforced at review time.**
Teacher/Student stay query conveniences (`Teacher.all`); new
type-dependent logic goes in `Policies::`/`Services::` keyed on
`user_type` (report, "On STI"). The report's optional RuboCop cop is out
of scope here.

## Alternatives rejected

- Reload inside the service (`user.reload`): fetches a correctly-classed
  row via `find_sti_class` but discards in-memory state, costs a query,
  and still cannot fix the caller's reference — strictly worse than
  returning `becomes!`.
- Dropping STI instead (delegated_type / plain column): the right
  long-term debate, but the report's accepted posture is freeze, not
  remove; this change is the one-line consistency fix that posture asked
  for.
