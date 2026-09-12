# admin-mass-delete design

## Context

The legacy flow: HAML page mounts MassDeleteContainer (the repo's only
React admin component), which POSTs usernames to
convert_usernames_to_ids for a preview, then POSTs the confirmed id list
to delete_user_progress. delete_progress-per-user is already
log_admin_action-covered; the bulk path's audit story predates the
audit table.

## Goals / Non-Goals

**Goals:**
- Preserve the two-phase preview→confirm contract exactly (it is the
  safety feature).
- One audit row per affected user on execution, plus a batch row tying
  them together via a shared batch id in params.

**Non-Goals:**
- No throughput/async redesign; batch sizes stay within what the legacy
  synchronous action handles.
- No UI redesign beyond DSCO component swaps.

## Decisions

1. **Two endpoints, mirroring the legacy pair**: POST
   /api/admin/progress_deletions/preview (usernames → resolved users +
   warnings) and POST /api/admin/progress_deletions (id list + reason)
   — the latter require_sudo!. Preview mutates nothing and is not
   audited; execution writes per-user rows + a batch row.
2. **Port, don't rewrite**: MassDeleteContainer's logic moves with
   mechanical changes only (transport → DashboardApiClient, styles →
   CSS modules, tests → Vitest), per the surgical-change rule.
3. **Reason required** on execution (parity with single delete_progress
   in admin-user-lifecycle).

## Risks / Trade-offs

- [Preview/execute id drift (user deleted between phases)] → execution
  re-validates ids and reports skipped ones; same property as legacy.
- [Synchronous bulk delete latency] → unchanged from legacy; if lists
  grow, async is a later change with its own spec.

## Migration Plan

Additive endpoints + SPA page; legacy page keeps working against old
actions until decommission removes page, entry point, and
apps/src/templates/admin. Rollback = flip landing link back.

## Open Questions

- None.
