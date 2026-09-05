# admin-legacy-retirement

## ADDED Requirements

### Requirement: Legacy admin GET routes redirect to the SPA
Every removed /admin GET route SHALL 301 to its corresponding SPA route
(tool page where one exists, otherwise the admin landing page), and the
redirect target SHALL be reachable by admins in production before any
redirect ships.

#### Scenario: Bookmarked tool page
- **WHEN** an admin opens a legacy /admin tool URL after removal
- **THEN** the browser lands on the SPA page for that tool via 301

#### Scenario: Prerequisite
- **WHEN** the first redirect is deployed
- **THEN** the SPA admin surface is already reachable by admins in
  production

### Requirement: Removed POST routes fail loudly
Removed /admin POST routes SHALL return 410 Gone with a hint pointing at
the SPA, not redirect (a redirected POST degrades to GET and hides
breakage).

#### Scenario: Stale scripted POST
- **WHEN** a script POSTs to a removed legacy mutation route
- **THEN** it receives 410 and no state changes

### Requirement: Retained Rails endpoints are explicit
The retained non-SPA endpoints SHALL be exactly: CSV exports, the
hardened assume_identity POST, and the sudo re-auth flow; every other
/admin controller action, view, and the apps/ admin React code SHALL be
removed, including log_admin_action once no caller remains.

#### Scenario: Single mutation path
- **WHEN** the decommission completes
- **THEN** every admin mutation flows through /api/admin or the two
  retained POSTs, all writing AdminAuditEvent rows

#### Scenario: No stranded code
- **WHEN** the final commit lands
- **THEN** admin HAML views, ported controller actions, and
  apps/src/templates/admin no longer exist in the tree
