# Design: user-admin-revocation-audit

## Context

`revoke_all_permissions` (user_permission_grantee.rb:41-47) does four
things: clears the `@permissions` memo, `update_column(:admin, nil)`,
destroys all `UserPermission` rows, and reloads. Only the admin-column
write bypasses callbacks. `log_admin_save` fires on `before_save` when
`admin_changed?` (a nil/false-normalizing comparison, :60-66) and
`UserPermissionGrantee.should_log?` are true.

## Decision

**D1 — use `update!(admin: nil)` rather than logging inline.** Routing
through the normal save path makes the audit hook the single source of
truth for admin transitions; an inline log call would be a second copy of
the message format that drifts. Risk considered: `update!` runs the full
User callback chain (18 callbacks) where `update_column` ran none. The
caller contexts (admin tooling, account cleanup) already run full saves on
User elsewhere; the model must be saveable for `update!` to succeed. If a
record is in an invalid state (legacy data), `update!` raises where
`update_column` silently succeeded — that is acceptable for an explicit
admin-tool path and surfaces bad rows instead of hiding them. Fallback if
production data proves too dirty: `save!(validate: false)` after
`self.admin = nil`, which still fires callbacks.

**D2 — keep the `reload`.** It re-syncs `primary_contact_info` and any
attribute state the callback chain touched.

**D3 — test asserts the log side effect, not the mechanism.** Stub
`ChatClient.message` and assert it is called with a Revoking/ADMIN payload
when `revoke_all_permissions` runs against an admin; assert it is NOT
called for a non-admin user (no spurious logs).

## Alternatives rejected

- Explicit `ChatClient.message` call inside `revoke_all_permissions`:
  duplicates the audit message format; future admin-transition paths would
  need to remember it.
- Moving audit to an `after_commit` observer: broader redesign than the
  defect warrants; the existing `before_save` hook is the established
  mechanism.
