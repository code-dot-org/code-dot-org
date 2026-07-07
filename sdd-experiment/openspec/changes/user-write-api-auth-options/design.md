# Design: user-write-api-auth-options

## Decisions

**D1 — commands wrap both dual-path arms; callers see one name.** The
migrated?/unmigrated split inside `update_oauth_credential_tokens`
(user_multi_auth_helper.rb:55-82) and `update_email_for` moves into the
commands verbatim. This inverts the current shape (callers branch) into
the target shape (command branches), so user-single-auth-retirement
later deletes branches inside three commands instead of across
controllers. No semantic change in this change.

**D2 — A12 atomicity fix is opt-in explicit.** `SetPrimaryContactInfo`
wraps save + `destroy_all` in one transaction. The characterization pin
for the happy path is unchanged; the crash-window behavior (orphaned
duplicate email options) is not pinnable by request tests and is
documented as the intended improvement. All other commands: bit-for-bit
pin compliance.

**D3 — Clever V3 legacy-id lookup stays put.** The fallback lookup
(helper :56-72, `TODO: Delete this block once Clever users have been
migrated`) moves into `AddAuthenticationOption`'s token-refresh path
untouched; its deletion is gated on the Clever V3 migration finishing,
tracked in user-single-auth-retirement's audit, not here.

**D4 — disconnect keeps its guard order.** The controller today 404s on
a foreign auth option (`current_user.authentication_options.find`) and
refuses to remove the last sign-in method; both guards stay
controller-side (they are authorization/validation, pinned), the
mutation moves.

**D5 — model helpers become shims.** `add_credential`,
`update_primary_contact_info`, `update_email_for` on User delegate to
the commands (public API stable per the program's delegation rule);
direct callers migrate over time; shims die with the callback-retirement
work (report recommendation 5).

## Characterization matrix

disconnect: provider (email/google/clever) × is-primary/not ×
last-option/not × migrated/unmigrated. Token refresh: provider ×
credentials-present/absent × (clever) uid-match/legacy-id-match/no-match.
Linking: existing-AO-collision vs fresh. Pins capture status/body,
authentication_options row set (count, credential_type,
authentication_id, data json), users.primary_contact_info_id, and
instrumentation events (added by this change — asserted present, not
pinned against the past).

## Rollback

Commands are additive; each controller flip is one revertable commit.
No data migrations.
