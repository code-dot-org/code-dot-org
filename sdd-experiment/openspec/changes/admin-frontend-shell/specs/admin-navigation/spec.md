# admin-navigation

## ADDED Requirements

### Requirement: Admin landing page is the navigation hub
The admin app SHALL render a landing page at /frontend-studio/admin
listing every admin tool grouped as on the legacy directory page
(admin_reports#directory), where ported tools link to SPA routes and
not-yet-ported tools link to their legacy /admin/... HAML URL as a
full-page navigation.

#### Scenario: Ported tool link
- **WHEN** an admin clicks a tool that has a ported SPA page
- **THEN** the SPA navigates client-side to that admin route

#### Scenario: Unported tool link
- **WHEN** an admin clicks a tool that is not yet ported
- **THEN** the browser performs a full-page navigation to the legacy
  /admin/... URL

#### Scenario: Hub stays complete during migration
- **WHEN** any admin tool exists in either surface
- **THEN** it is reachable from the landing page (no tool becomes
  unlisted mid-migration)
