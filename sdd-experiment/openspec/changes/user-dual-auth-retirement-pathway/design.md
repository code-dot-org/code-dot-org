# Design: user-dual-auth-retirement-pathway

## The audit predicate (used by every gate)

Legacy row := `provider IS NULL OR provider != 'migrated'`, evaluated
with_deleted (acts_as_paranoid, user.rb:507) — soft-deleted rows can be
undestroyed (user.rb `undestroy`) and must not resurrect a retired
shape. Exposed as a scheduled metric (count by shape), not a one-off
query, so every gate reads the same number the dashboards show.

## Gates

**G0 → stage 1 (one migrator).** Entry: none (start now). Exit: the
DCDO-selected dual implementation is deleted; MultiAuthMigrator is the
sole path with the seven divergences resolved per that change's design;
its pinning suite is green; the V4 crash class (parent-managed/manual
students) has an explicit regression test. Rollback: revert the PR
(pure code). Standing rule until exit: `migration_service_enabled`
stays OFF in production DCDO.

**G1 → stage 2 (born multi-auth).** Entry: G0 passed. Exit: every
creation flow produces migrated-shape users at 100% ramp for 14
consecutive days with the post-create audit metric at zero (new rows
only: created_at >= ramp start AND legacy predicate), and the
after_create hook is deleted. Rollback: per-flow DCDO ramp-down (the
hook no-ops on already-migrated users, so mixed states are safe by
construction). Ordering note: user-email-source-of-truth should land
inside this window — before G2's backfill, after which its own drift
audit becomes meaningless.

**G2 → stage 3a (backfill).** Entry: G1 passed AND
user-email-source-of-truth landed (see proposal ruling 1). Exit: the
audit metric reads zero across live and soft-deleted rows; login
success-rate (per-provider) flat across the backfill window;
`demigrate_from_multi_auth` exercised against a sampled batch in a
non-prod environment as the verified rollback tool. Backfill mechanics
are stage 3's design (in_batches per-row migrator+save!, precedent
bin/oneoff/wipe_data/teacher_secret_picture_and_words:16); this gate
only defines done. Rollback: demigrate the affected batch, halt,
diagnose.

**G3 → stage 3b (deletion).** Entry: G2 held for 30 days (one
school-month of undestroy/support-tooling exposure). Exit: 37
`migrated?` call sites deleted; `manual?` branches deleted; provider/uid
dropped via ignored_columns staging; serialized oauth_* keys removed;
demigrate + the `:demigrated` factory trait (44 usages) deleted;
grep for migrated/demigrate tokens in dashboard/app + dashboard/lib
returns only unrelated hits (allowlist recorded). Rollback: none needed
— by entry, no code path can produce a legacy row; column drops are
staged reversibly via ignored_columns first.

## Why gates and not a schedule

Each gate is a state of the data, not a date. The program has burned
before on time-based confidence (the 2018 migration left a six-year
tail). A gate that cannot be evaluated by a query or a green suite is
not in this design.

## Monitoring introduced by this change

- `user_account_shape_count{shape=...}` scheduled metric (the audit
  predicate, grouped).
- Post-create legacy counter (G1's oracle) — alarm at nonzero.
- Per-provider login success-rate panel (exists partially; G2 requires
  per-provider split).
