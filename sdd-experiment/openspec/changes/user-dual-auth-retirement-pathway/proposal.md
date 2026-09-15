# Proposal: user-dual-auth-retirement-pathway

Program change. Three implementation changes already carry the work:
user-single-multi-auth-migrator (stage 1), user-multi-auth-at-creation
(stage 2), user-single-auth-retirement (stage 3). This change does not
duplicate them — it defines the pathway above them: the account-shape
taxonomy, the gates between stages with machine-checkable oracles, the
rollback point at each gate, and the definition of "retired." Zero
user-visible impact is the invariant at every gate.

## Why

The dual single/multi-auth model is the report's top structural finding:
every new user is created single-auth and converted by an after_create
hook (user.rb:484); 37 `migrated?` call sites across 13 files keep both
shapes alive; the divergence has produced six years of duplicate auth
options and the verified A1/A3 defects. The three stage changes each
know their own scope, but nothing specifies when it is safe to move from
one to the next, what metric proves a stage done, or which cross-cutting
dependencies (the email shadow columns; the DCDO crash hazard) gate the
sequence. A backfill touching every legacy user row is the single
riskiest operation in the program; it must not start on vibes.

## What Changes

- Account-shape taxonomy (normative, from
  concerns/user/provider_flags.rb): `migrated` (provider='migrated',
  credentials in authentication_options), `manual`
  (username+password legacy), `sponsored` (secret picture/word, no
  personal login), oauth-legacy (provider=credential type, uid set),
  NULL-legacy (provider IS NULL, self-managed). Which stage
  eliminates which shape, and what `sponsored` looks like after
  (provider='migrated', zero auth options, blank encrypted_password —
  the derived arm of provider_flags.rb:18-24 becomes the only arm).
- Four gates (G0-G3) with oracles, owners, and rollback tools — see
  design; specified as requirements.
- Cross-cutting ordering rulings the stage changes cannot make alone:
  (1) user-email-source-of-truth lands before the stage-3 backfill —
  the backfill mass-saves users, and every save re-derives the
  email/hashed_email shadow columns via normalize_email/hash_email
  (user.rb:608-616); running it while column semantics are undefined
  bakes drift in at scale. (2) The `migration_service_enabled` DCDO
  flag stays OFF until stage 1 lands — the gated service crashes on
  parent-managed/manual students (AssociationTypeMismatch,
  multi_auth_migrator.rb:18/:62; verified by execution). (3)
  `demigrate_from_multi_auth` (test-only references today) is the
  designated rollback tool for the backfill and is deleted only at G3.
- Definition of retired: one account shape; AuthenticationOption is the
  only credential store; `provider`/`uid` columns dropped; the
  serialized oauth_* keys gone; the tokens "migrated"/"demigrate" appear
  nowhere in dashboard/app or dashboard/lib; the `:demigrated` factory
  trait (44 usages across 14 test files) deleted.

## Capabilities

### New Capabilities

- `user-dual-auth-retirement`: the gated pathway from two account shapes
  to one, with per-gate oracles and rollback.

### Modified Capabilities

<!-- none: stage-level requirements live in the three stage changes -->

## Impact

- Sequencing authority over: user-single-multi-auth-migrator,
  user-multi-auth-at-creation, user-single-auth-retirement,
  user-email-source-of-truth (ordering only).
- Monitoring additions (audit query as a metric, login success-rate
  panel) — the only code this change itself introduces.
