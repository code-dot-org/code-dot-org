# Proposal: user-lockable-real-columns

Hardening fix from the User Model Improvement Report (July 2026),
Addendum 1 finding A5 (verified against source). Also the first concrete
instance of the report's narrowed blob recommendation: promote
behavioral keys out of `properties`, leave inert UI flags alone.
Independent of all other user-model changes; no ordering constraints.
Zero user-visible impact.

## Why

Devise Lockable state lives in the serialized `properties` blob:
`failed_attempts` and `locked_at` are declared in `serialized_attrs`
(dashboard/app/models/user.rb:264-265), not columns. Stock Devise
would break immediately — `increment_failed_attempts` issues
`increment_counter(:failed_attempts, id)`, raw SQL against a column
that does not exist (devise-4.9.4 lib/devise/models/lockable.rb:123).
Lockout works only because config/initializers/devise.rb:376-380 does
`Devise::Models::Lockable.prepend(Devise::Models::CustomLockable)` — a
global monkeypatch of the gem, applied in an initializer. Nothing at
the `devise :lockable` include site (user.rb:498) signals that the
stock module is patched; a Devise upgrade that changes Lockable
internals breaks brute-force lockout silently.

Three compounding costs of the blob placement:

- `SerializedProperties` runs `before_save {properties.select! {|_, v|
  v.present?}}` (dashboard/app/models/concerns/
  serialized_properties.rb:13), so an explicit `failed_attempts = 0`
  or `locked_at = nil` is silently dropped from the blob and reads
  back `nil`. Devise's own unlock path writes exactly those values
  (lockable.rb:53-58); it works today only via a nil-tolerant
  `attempts_exceeded?` override (custom_lockable.rb:83-85).
  Brute-force lockout state has `present?` semantics by accident.
- Lockout state cannot be indexed or queried. "How many accounts are
  locked right now" is not answerable in SQL; the blob is opaque TEXT
  (dashboard/db/schema.rb:2926).
- It is inconsistent: `unlock_token`, the third Lockable field, IS a
  real column with a unique index (schema.rb:2939, :2957; annotated in
  teacher.rb:52 — the users-table annotation lists no
  failed_attempts/locked_at columns, confirming they never existed).

The blob placement was deliberate: migration
20240321204728_add_devise_lockable_to_users.rb says "neither field is
used for querying, neither needs to be an actual column". That
rationale priced in queryability only, not the global monkeypatch it
forced nor the `present?` compaction it collided with.

## What Changes

- Migration adds real columns to `users`: `failed_attempts` (integer,
  default 0, NOT NULL — the Devise-generator shape) and `locked_at`
  (datetime, NULL). No new index; MySQL 8.0 instant ADD COLUMN, same
  pattern as the two prior users-column migrations.
- Staged cutover, one deploy per phase: dual-write (mirror blob values
  into the columns on save) → backfill columns from `properties` →
  switch reads (delete the two `serialized_attrs` entries so the AR
  column accessors take over) → cleanup.
- The global prepend in config/initializers/devise.rb:376-380 is
  deleted. `CustomLockable` survives — its teacher-only scoping and
  lock/unlock metrics are product behavior — but is included directly
  in User next to the other post-devise overrides (user.rb:503-505),
  so the customization is visible at the include site. The blob-compat
  shims inside it (`update!`-based increment, nil-tolerant
  `attempts_exceeded?`) are deleted; stock Devise takes over.
- Oracle: dashboard/test/models/devise_lockable_test.rb already pins
  lockout behavior (teacher locked after N failed attempts, students
  never, time-based auto-unlock). It must pass before and after every
  phase; the only permitted diff is the `nil` → `0` initial-value
  assertions once the column default is live.

## Capabilities

### New Capabilities

- `user-lockout-persistence`: brute-force lockout state lives in real,
  queryable columns with stock Devise semantics; Devise customization
  is declared on the model, not patched into the gem globally.

### Modified Capabilities

<!-- none: no existing spec covers this behavior -->

## Impact

- `dashboard/db/migrate/` — one new migration (two columns, no index).
- `dashboard/app/models/user.rb` — remove two `serialized_attrs`
  entries (:264-265), the blob comment (:203-204); add the
  `CustomLockable` include (:503-505 block); transient dual-write hook.
- `dashboard/lib/devise/models/custom_lockable.rb` — drop blob shims,
  keep teacher scoping and metrics.
- `config/initializers/devise.rb` — delete the prepend block
  (:374-380).
- One-off backfill script; assertion updates in
  `dashboard/test/models/devise_lockable_test.rb`.
- No user-facing change, no API change; lockout thresholds
  (devise.rb:218 `maximum_attempts`, :221 `unlock_in`) untouched.
