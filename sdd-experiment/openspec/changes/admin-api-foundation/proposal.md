# admin-api-foundation

## Why

The admin surface (~35 routes under /admin) is server-rendered HAML with no
JSON API; the planned React admin UI in frontend/ needs one. Audit logging
today is fragmentary: `log_admin_action` covers 7 actions in
admin_users_controller only, writes ephemeral log lines, and the DCDO/
Gatekeeper editors log nothing. A single API choke point is the cheapest
place to make authorization, auditing, and step-up re-auth uniform before
any endpoints are ported.

## What Changes

- New routes namespace `api/admin` in dashboard/config/routes.rb (no
  endpoints yet beyond a smoke/health action; feature endpoints land in
  later changes).
- New `Api::Admin::BaseController < ApplicationController` enforcing
  `authenticate_user!`, `require_admin` (CanCanCan `authorize! :read,
  :reports`), and `check_authorization`; JSON-only error rendering
  (401/403/404/422/500 envelopes) compatible with `ApiError` in
  `@code-dot-org/core`.
- New `admin_audit_events` table + `AdminAuditEvent` model recording actor,
  action, affected user/record, sanitized params digest, request id, and
  outcome for every mutating request, via an `around_action` in the base
  controller. Existing `log_admin_action` CDO.log line is preserved as a
  side effect and its call sites are superseded as endpoints migrate.
- Sudo-mode step-up re-auth: `session[:admin_sudo_at]` stamped after fresh
  re-authentication; a `require_sudo!` helper for destructive endpoints
  (delete/impersonate/bulk) with a configurable freshness window.
- No UI, no porting of existing admin actions, no change to existing HAML
  admin pages.

## Capabilities

### New Capabilities

- `admin-api-gate`: authentication, admin authorization, and JSON error
  contract for all endpoints under /api/admin.
- `admin-audit-log`: durable, queryable audit records for every mutating
  admin API request, plus the legacy structured log line.
- `admin-sudo-mode`: step-up re-authentication requirement for destructive
  admin API endpoints.

### Modified Capabilities

<!-- none: greenfield namespace; existing HAML admin behavior unchanged -->

## Impact

- dashboard/config/routes.rb: new `namespace :api { namespace :admin }`.
- dashboard/app/controllers/api/admin/base_controller.rb (new).
- dashboard/app/models/admin_audit_event.rb + migration (new table).
- dashboard/app/controllers/admin_users_controller.rb: untouched now;
  `log_admin_action` call sites retire in later porting changes.
- Sessions: unchanged mechanism (Devise + Redis session store + CSRF);
  sudo stamp is one additional session key.
- Downstream changes admin-frontend-shell and all endpoint-porting changes
  depend on this one.
