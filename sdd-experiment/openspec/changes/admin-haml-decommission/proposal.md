# admin-haml-decommission

## Why

Once every tool has a verified SPA replacement, the legacy HAML surface
is dead weight and a second, less-audited mutation path. This change
removes it and makes /admin/* land on the SPA, completing the
migration.

## What Changes

- Remove legacy admin routes, controllers (admin_reports minus retained
  CSV endpoints, admin_search, admin_pilots, admin_nps, and the ported
  actions of admin_users), HAML views, and the apps/ mass-delete entry
  point + apps/src/templates/admin.
- **BREAKING** (internal-only): /admin/* URLs redirect (301) to the SPA
  landing page or the corresponding SPA route; retained Rails endpoints
  (CSV exports, assume_identity POST) keep their paths.
- Remove log_admin_action once its last caller (assume_identity keeps a
  hardened version via AdminAuditEvent + log line) is accounted for.
- Per-tool prerequisite gate: a tool's legacy page is removed only after
  its SPA page has been the landing-page default with no regressions
  reported; the engineer-console break-glass consideration
  (admin-engineer-console design) is honored explicitly.

## Capabilities

### New Capabilities

- `admin-legacy-retirement`: redirect contract for /admin/* and the
  inventory of retained Rails endpoints.

### Modified Capabilities

<!-- deltas against earlier admin-* capabilities are not needed: their
requirements already describe the end state (SPA pages + retained Rails
endpoints); this change removes the legacy duplicates those specs never
required. -->

## Impact

- dashboard: routes.rb /admin scope shrinks to redirects + retained
  endpoints; controller/view deletions across
  admin_{reports,search,pilots,nps,users}; ability/spec cleanup where
  actions disappear.
- apps/: mass_delete entry point and templates/admin removed from the
  webpack bundle.
- Depends on: all prior admin-* changes verified in use.
- Bookmarks/muscle memory: 301s preserve them.
