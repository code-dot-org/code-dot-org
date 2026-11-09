# Design: user-lockable-real-columns

## Context

How lockout persists today. `serialized_attrs` defines
`failed_attempts`/`locked_at` accessors via `define_method` on the
class (serialized_properties.rb:78-80), backed by the `properties`
JSON blob; `before_save {properties.select! {|_, v| v.present?}}`
(serialized_properties.rb:13) compacts non-`present?` values out of
the blob. `CustomLockable` (dashboard/lib/devise/models/
custom_lockable.rb), prepended globally onto `Devise::Models::Lockable`
(config/initializers/devise.rb:376-380), supplies the shims that make
this survivable: `increment_failed_attempts` replaces stock raw-SQL
`increment_counter` with `update!` (:10-26, plus a teacher-only
guard), `lock_access!`/`unlock_access!` add CloudWatch/Statsig metrics
(:38-80), and `attempts_exceeded?` nil-guards the counter (:83-85).
All writes go through model saves — there is no raw-SQL write path
while the prepend is active. Devise config: `lock_strategy
:failed_attempts` (devise.rb:202), `unlock_strategy :both` (:212),
`maximum_attempts` 10 prod / 2 test (:218), `unlock_in` 30 minutes
(:221). Only teachers accumulate attempts, so blob keys exist on a
small teacher subset, and the state is short-lived (`locked_at`
expires in 30 minutes; `failed_attempts` resets on successful sign-in
via devise/hooks/lockable.rb → `reset_failed_attempts!`).

## Decisions

**D1 — column shapes match the Devise generator.**
`failed_attempts` integer, `default: 0, null: false`; `locked_at`
datetime, NULL. With default 0, stock `attempts_exceeded?`
(lockable.rb:143-145) and `reset_failed_attempts!`'s
`failed_attempts.to_i.zero?` guard (:61-66) are correct without the
nil-tolerant override. No index: the app never queries by these
fields (the one thing migration 20240321204728 got right), and ad-hoc
ops queries don't need one on day one. Adding the columns themselves
is safe on the production users table — MySQL 8.0 instant ADD COLUMN;
migrations 20240321204728 and 20240723202827 added users columns
inline and deferred only index builds to manual DDL. If an index is
ever wanted, follow that manual-DDL note.

**D2 — dual-write via a `before_save` mirror, because the blob
accessors shadow the columns.** The `serialized_attrs` accessors are
`define_method`s on the class; AR attribute methods live in a
generated included module, so as long as the two entries remain at
user.rb:264-265, every read and write — including
`update!(failed_attempts: n)` — resolves to the blob and the new
columns stay untouched. Dual-write is therefore a User `before_save`
that mirrors accessor state into the raw columns:
`self[:failed_attempts] = failed_attempts.to_i; self[:locked_at] =
locked_at`. This captures every lockable write: all three mutation
paths (`update!` in the custom increment, `save(validate: false)` in
lock/unlock — `validate: false` skips validations, not callbacks) run
callbacks. The mirror is transient scaffolding, deleted in phase 4.

**D3 — backfill in Ruby, teachers only, idempotent.** Candidate rows:
`User.where("properties LIKE '%\"failed_attempts\"%' OR properties
LIKE '%\"locked_at\"%'")`, batched, writing via `update_columns` (no
callbacks, no compaction interference). Dual-write is already live, so
any row saved after the backfill scan has identical blob and column
values; re-running is harmless. Volume is small (teacher subset with a
recent failed login), so a console script suffices — no job
infrastructure.

**D4 — the switch and the de-monkeypatch land together (phase 4).**
One deploy: delete the two `serialized_attrs` entries (column
accessors become live), delete the mirror hook, delete the initializer
prepend block (devise.rb:374-380), and `include
Devise::Models::CustomLockable` in User immediately after the other
post-devise overrides (user.rb:503-505). Method resolution is
equivalent: a module included after `devise :lockable` precedes
Lockable in the MRO, so `CustomLockable#lock_access!` still wraps and
`super`s into stock Lockable — the exact pattern
`ManualSessionExpiration`/`CustomTimeoutable` already use, chosen
"since it's trying to extend some methods added by those modules"
(user.rb:500-502). Inside CustomLockable: `attempts_exceeded?` is
deleted (D1 makes stock correct); `increment_failed_attempts` keeps
the teacher-only guard but delegates to `super` (stock
`increment_counter` now targets a real column); the metrics wrappers
stay verbatim. Update the stale annotation comment (user.rb:203-204)
and the devise_lockable_test.rb `assert_nil` initial-value assertions
to `assert_equal 0`.

**D5 — accept the rolling-deploy skew, per phase.** During each
deploy, old and new code disagree about where truth lives for at most
the deploy window. Worst case in phase 4: a failed attempt counted by
new code (column) is invisible to old code (blob) and vice versa, so
an attacker gains a handful of extra guesses for a few minutes, or a
lock appears released to one code version. The dual-write phase
already bounds this to the phase-4 window only; eliminating it
entirely would need read-repair machinery disproportionate to a
10-attempt/30-minute lockout.

## Alternatives rejected

- Keep the blob, just document the prepend: leaves stock-Devise
  incompatibility, `present?` semantics, and unqueryable state; the
  upgrade fragility that motivates the change remains.
- Single big-bang deploy (no dual-write/backfill): widens the D5 skew
  from one bounded window to "whenever the deploy lands", and loses
  in-flight counters for every teacher mid-lockout. The staged path
  costs two small deploys and avoids it.
- Delete CustomLockable outright: its teacher-only scoping ("we can't
  send unlock emails to students", custom_lockable.rb:12-14) and the
  lock/unlock metrics are product behavior, not blob shims. Only the
  shims go.
- Scrub the stale blob keys aggressively: after phase 4 the leftover
  `failed_attempts`/`locked_at` keys in `properties` are inert dead
  data (no accessor reads them). A cleanup pass is optional hygiene,
  not a correctness requirement — done last, or not at all.
