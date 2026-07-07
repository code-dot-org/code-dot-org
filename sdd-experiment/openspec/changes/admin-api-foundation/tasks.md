# admin-api-foundation tasks

## 1. Routes and base controller

- [ ] 1.1 Add `namespace :api { namespace :admin }` to
      dashboard/config/routes.rb with a smoke endpoint (GET
      /api/admin/status) for exercising the gate
- [ ] 1.2 Create Api::Admin::BaseController inheriting
      ApplicationController: authenticate_user!, require_admin,
      check_authorization, JSON-only rescue_from handlers rendering the
      error envelope (401/403/404/422/500)
- [ ] 1.3 Controller tests: anonymous → 401 JSON, teacher/student → 403
      JSON, admin → 200; CSRF-missing POST rejected; CanCan::AccessDenied
      and RecordNotFound render JSON not HTML

## 2. Audit log

- [ ] 2.1 Migration + AdminAuditEvent model (actor_id, action,
      affected_user_id, affected_record type/id, params JSON, request_id,
      ip, outcome, status, created_at; indexes on actor_id,
      affected_user_id, created_at)
- [ ] 2.2 around_action in BaseController auditing mutating verbs:
      automatic baseline row, ensure-block outcome capture on exceptions,
      rescue on audit failure (log, never break response)
- [ ] 2.3 Param sanitization (Rails filter list + admin blocklist) and
      the CDO.log side-effect line with matching request_id
- [ ] 2.4 Enrichment helper for controllers to set affected_user_id /
      affected_record on the pending event
- [ ] 2.5 Model + controller tests covering the four audit spec
      scenarios (success row, failure row, GET no-row, sanitization)

## 3. Sudo mode

- [ ] 3.1 require_sudo! helper checking session[:admin_sudo_at] against a
      DCDO-tunable window (default 15 min); 403 sudo_required envelope
- [ ] 3.2 Re-auth flow: endpoint/callback that stamps
      session[:admin_sudo_at] only after a fresh Google OAuth round-trip
      (resolve the design.md open question here)
- [ ] 3.3 Tests: stale stamp → 403 + no state change, fresh stamp →
      action runs, client-supplied timestamp ignored

## 4. Verification

- [ ] 4.1 bundle exec spring testunit on the new test files; run
      ./tools/hooks/pre-commit
- [ ] 4.2 Manual: hit /api/admin/status as admin and non-admin via rails
      runner/curl on local dashboard; confirm audit row + log line for a
      smoke mutation
