# admin-api-foundation design

## Context

All admin controllers gate through one check: `require_admin` in
application_controller.rb:314 (`authorize! :read, :reports`, satisfied only
by `user.admin?` per ability.rb:589-611). Views are HAML forms POSTing to
HTML actions; no JSON API exists. Audit is partial: `log_admin_action`
(admin_users_controller.rb:576) emits a structured CDO.log line for 7
actions; DCDO/Gatekeeper mutations log nothing. The frontend stack
(@code-dot-org/core) expects same-origin cookie auth, an X-CSRF-Token
header, and errors normalized to ApiError {status, body}.

Session mechanism is Devise + RedisSessionStore (`_learn_session`,
domain: :all). It is retained unchanged; JWT was considered and rejected
(bearer revocation and browser-storage properties are strictly worse for
same-origin admin use).

## Goals / Non-Goals

**Goals:**
- One base controller that makes authz, audit, and sudo enforcement
  impossible to forget on any future /api/admin endpoint.
- Audit records durable and queryable (who did what to whom, when).
- JSON error envelope stable enough for @code-dot-org/core Zod schemata.

**Non-Goals:**
- No feature endpoints (later changes).
- No React UI (admin-frontend-shell).
- No change to workshop_admin or other permission tiers.
- No auth-mechanism change (cookies stay; no tokens).

## Decisions

1. **Plain namespace, not a Rails Engine.** Admin owns no domain models;
   every action manipulates core models (User, Section, DCDO...). An
   isolated engine would re-import the host app wholesale (Devise,
   Ability, models) for zero real isolation. Repo precedent agrees: the
   three existing engines are code-only libraries, none routable. A route
   namespace + base controller yields the same greppable boundary at a
   fraction of the ceremony. Packwerk (not currently in the repo) remains
   the escape hatch if enforced code boundaries are wanted later.

2. **Inherit ApplicationController.** Reuses Devise helpers, CSRF
   protection, locale handling, and `require_admin` verbatim. An
   ActionController::API base was rejected: it drops CSRF protection,
   which cookie-session APIs must keep.

3. **Audit sink = MySQL table `admin_audit_events`.** Columns: actor_id,
   action (controller#action), affected_user_id (nullable),
   affected_record_type/id (nullable polymorphic), params_digest (JSON,
   sanitized: password/token keys stripped), request_id, ip, outcome
   (success/failure + status), created_at. Indexed on actor_id,
   affected_user_id, created_at. Log-line-only was rejected (ephemeral,
   not queryable); Firehose alone rejected (analytics pipeline, not an
   operator lookup tool). The CDO.log line is kept as a side effect so
   existing log-based tooling keeps working.

4. **Audit via `around_action` on mutating verbs** (POST/PUT/PATCH/
   DELETE) in the base controller. Runs after the action, records outcome
   even on raised exceptions (ensure block), never blocks the response on
   audit-write failure (rescue + CDO.log error). Controllers may enrich
   the pending event (e.g. set affected_user_id) via a small helper;
   enrichment is optional, the baseline row is automatic.

5. **Sudo mode = session timestamp, not a token.**
   `session[:admin_sudo_at]` set only by the re-auth flow below;
   `require_sudo!` compares against a freshness window (default 15 min,
   DCDO key `admin_sudo_window_minutes`). Admins are Google-SSO-only
   with no password (user.rb enforce_google_sso_for_admin), so re-auth =
   a fresh OAuth round-trip, not a password prompt. Declarative opt-in
   per endpoint (`before_action :require_sudo!`), not automatic, because
   only the destructive tier needs it. 403 with
   `{error: "sudo_required"}` lets the SPA trigger the re-auth flow.

   Re-auth flow, following the established session-flag dispatch
   pattern in omniauth_callbacks_controller (the same mechanism as
   should_link_accounts?/should_connect_provider?):
   - GET /admin/sudo?return_to=<path> (Rails, admin-gated): stores
     `session[:admin_sudo_return_to]` (validated same-origin relative
     path), sets `session[:admin_sudo_pending] = true`, redirects to
     /users/auth/google_oauth2.
   - In OmniauthCallbacksController#google_oauth2, before the normal
     sign-in branch: if `session[:admin_sudo_pending]` is set AND the
     authenticated credential resolves to the CURRENT signed-in admin
     (find_user_by_credential.id == current_user.id — a different
     Google account must NOT stamp sudo), clear the pending flag, set
     `session[:admin_sudo_at] = Time.now.to_i`, and redirect to the
     stored return_to. On identity mismatch: clear the flag, do not
     stamp, redirect to return_to with a failure indicator; the
     existing session is left untouched (no sign-out, no sign-in as
     the other account).
   - The SPA opens /admin/sudo?return_to=<current admin route> as a
     top-level navigation (not fetch), so the OAuth dance runs as a
     normal page flow and lands back on the SPA page, which retries
     the failed action.

6. **Error envelope**: `{error: <machine-readable-key>, message?:
   <human>, details?: {...}}` with conventional status codes. 401
   unauthenticated, 403 unauthorized/sudo_required, 404, 422 validation
   (details = per-field errors), 500 opaque. Matches what kyTransport
   already surfaces as ApiError.

## Risks / Trade-offs

- [Audit table growth] → admin traffic is tiny (handful of internal
  users); no partitioning needed. Revisit if row counts surprise.
- [around_action misses non-API admin mutations] → acceptable: legacy
  HAML actions keep log_admin_action until each is ported; parity is
  reached by finishing the porting changes, not by patching legacy.
- [Sudo re-auth flow depends on OAuth round-trip UX] → the confirmation
  endpoint design is minimal (re-hit Google, bounce back, stamp session);
  if the round-trip proves clunky, window tuning via DCDO is the relief
  valve, not weakening the gate.
- [Params digest could capture PII] → sanitize with the Rails filter list
  plus an explicit admin blocklist; store digest of values where the raw
  value is not needed for the audit narrative.

## Migration Plan

Pure addition: new routes, controller, table. No behavior change to any
existing page. Rollback = revert; the table is inert if unused. Ship the
migration ahead of or with the code (no data backfill).

## Open Questions

- None. (Re-auth mechanics pinned in Decision 5.)
