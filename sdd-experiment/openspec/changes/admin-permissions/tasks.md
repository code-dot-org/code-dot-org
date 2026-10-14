# admin-permissions tasks

## 1. API

- [ ] 1.1 Api::Admin permissions controller: index (GET), create (POST),
      destroy (DELETE), bulk_create (POST email list, capped, per-email
      outcome array); shared model paths extracted from
      admin_users_controller where needed
- [ ] 1.2 Audit enrichment: affected_user_id + permission name; one row
      per user on bulk
- [ ] 1.3 Controller tests: grant/revoke/bulk outcomes, GET mutates
      nothing, non-admin 403, audit rows per spec

## 2. SPA page

- [ ] 2.1 Permissions page in packages/admin: search-integrated user
      picker, permission list, grant/revoke with confirmation dialogs,
      bulk-grant with per-email result rendering, CSV link to legacy GET
- [ ] 2.2 Client module + Zod schemata in core's dashboard/admin
      namespace (DashboardApiClient.admin.*) + MSW fixtures; Vitest
      coverage incl. partial bulk failure rendering
- [ ] 2.3 Flip landing-page link to the SPA page

## 3. Verification

- [ ] 3.1 spring testunit; yarn typecheck + vitest;
      ./tools/hooks/pre-commit
- [ ] 3.2 Manual: grant+revoke on a seeded teacher locally; confirm
      admin_audit_events rows and legacy log line; bulk grant with one
      bad email
