# admin-user-lifecycle design

## Context

Legacy actions live in admin_users_controller (delete_user,
undelete_user, delete_progress, manual_pass, account_repair) and
admin_search_controller (undelete_section). delete_user, undelete_user,
and delete_progress already emit log_admin_action lines; the others log
nothing. All are POSTs from HAML forms with flash-message feedback.

## Goals / Non-Goals

**Goals:**
- Sudo gating on the irreversible-in-practice tier (delete user, delete
  progress, undelete user) as the first real consumers of
  admin-sudo-mode.
- Reason capture where the legacy tool has it (delete_progress) and
  where it's cheap to add (delete_user), stored in the audit row.

**Non-Goals:**
- Mass deletion (admin-mass-delete chunk).
- StudioPerson merge/split and assume_identity (admin-identity-tools).
- No change to soft-delete semantics in the models.

## Decisions

1. **Sudo tier**: delete_user, delete_progress, undelete_user require
   require_sudo!; undelete_section, manual_pass, account_repair do not
   (recoverable or additive). The SPA handles 403 sudo_required by
   launching the re-auth flow and retrying.

2. **Typed confirmation in the SPA** for sudo-tier actions (retype the
   username/email), replacing the legacy pattern of bare form submits.
   The confirmation phrase is client-side UX; the server contract is
   sudo + explicit target id.

3. **Reason is a first-class param** on delete_progress (parity) and
   delete_user (new, optional), persisted in the audit event params, not
   a new column.

4. **Account repair stays a single opaque operation** (POST
   /api/admin/users/:id/repair) returning a summary of what was fixed,
   mirroring the legacy behavior rather than decomposing it.

## Risks / Trade-offs

- [Sudo friction for support staff mid-ticket] → 15-min window amortizes
  across a support session; window is DCDO-tunable without deploy.
- [Two delete paths during coexistence] → both call the same model
  methods; API path is strictly better-instrumented. Interim asymmetry
  accepted as in admin-permissions.
- [Typed confirmation encourages copy-paste] → still an improvement over
  no confirmation; the real guard is sudo + audit.

## Migration Plan

Additive endpoints and pages; landing links flip per-tool once verified
against seeded users locally. Legacy forms retire in
admin-haml-decommission. Rollback = flip links back.

## Open Questions

- Whether undelete_user should also be sudo-gated is settled as yes
  above (it can resurrect an account a user asked to delete); revisit if
  support workflow data says otherwise.
