# admin-haml-decommission design

## Context

By this point every admin tool has an SPA page (or a documented Rails
retention: CSV exports, assume_identity POST, sudo re-auth flow). The
legacy surface still exists as parallel routes/controllers/views, and
the frontend-studio prod story has been resolved by other means (out of
scope here, but a hard prerequisite: /admin cannot redirect to a 404).

## Goals / Non-Goals

**Goals:**
- Single mutation path: every admin write goes through /api/admin (or
  the two retained hardened POSTs), all audited.
- No dead code: controllers, views, helpers, and the apps/ admin React
  code removed, not stranded.

**Non-Goals:**
- No SPA feature work; no new endpoints.
- No removal of the admin gate primitives (require_admin stays for
  retained endpoints and any future Rails-side admin needs).

## Decisions

1. **Per-tool removal commits, not one big bang** — each tool's route+
   controller+view removal is independently revertable, sequenced by
   how confidently its SPA page has bedded in. Engineer-console editors
   go last (break-glass value).
2. **301 redirects from every removed GET route** to the closest SPA
   route (tool page if it exists, landing page otherwise). Removed POST
   routes return 410 Gone rather than redirecting (a redirected POST
   silently becomes a GET; better to fail loudly on stale forms/scripts).
3. **Retained endpoints inventory is explicit in the change**: CSV
   exports (permissions, level_completions, pd_progress if still used —
   admin-reports open question), assume_identity POST, sudo re-auth
   flow. Everything else under /admin goes.
4. **Hard prerequisite check in tasks**: frontend-studio (or whatever
   serving arrangement replaced it) reachable by admins in prod before
   any redirect flips.

## Risks / Trade-offs

- [Stale bookmark POSTs (scripts, saved forms)] → 410 with a JSON/text
  hint pointing at the SPA; audit shows no legitimate POST traffic
  before removal (query admin_audit_events + access logs per tool).
- [Removed page turns out to be load-bearing for an unported edge case]
  → per-tool commits + 301s make restoration a revert away.

## Migration Plan

Per tool: verify SPA-default usage → remove route/controller/view →
add redirect/410 → deploy → watch logs. Engineer console last. Final
commit removes shared HAML scaffolding, log_admin_action, and the apps/
admin code.

## Open Questions

- pd_progress.csv retention (carried from admin-reports).
- Whether any external runbooks/tools hit /admin URLs programmatically —
  check with the support team before the 410s land.
