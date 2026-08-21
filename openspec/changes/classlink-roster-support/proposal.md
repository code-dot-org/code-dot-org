## Why

ClassLink SSO launched in early 2026, but teachers in ClassLink districts cannot yet import or sync their classes into code.org sections. Adding One Roster-based rostering brings ClassLink to parity with Clever and Google Classroom, enabling teachers to manage sections without manual student enrollment.

## What Changes

- New `ClasslinkSection` model (STI subclass of `OmniAuthSection`) for storing and syncing ClassLink-rostered sections
- New `Clients::ClasslinkOneRoster` REST client for the One Roster proxy API
- New backend endpoints for listing available ClassLink classes and importing/syncing a class as a section, with server-side authorization: because ClassLink uses a central partner credential (not user-scoped tokens like Clever/Google), the endpoints must themselves verify the requester teaches a class (via One Roster) or is an instructor of the section before any import or sync
- Updated OmniAuth callback to create ClassLink `AuthenticationOption` records with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` (currently stores only `UserId`, unversioned)
- Migration of the 14,392 existing ClassLink users by creating v2 auth options alongside their untouched legacy records (login-time creation plus an optional bulk script), mirroring the Clever v2→v3 API migration; rollback is deleting the v2 records
- Frontend additions to expose ClassLink as a roster provider in the teacher section import UI
- ClassLink login gains a legacy-`UserId` fallback lookup during the migration window, removed at cleanup

## Capabilities

### New Capabilities

- `classlink-id-migration`: Create versioned v2 ClassLink auth options (`<TenantId>|<SourcedId>`, `version = 'v2'`) alongside legacy `UserId` records, with dual-match login during the transition window and rollback by deleting v2 records
- `classlink-rostering`: Teacher-triggered import and sync of ClassLink classes as code.org sections via the One Roster API

### Modified Capabilities

<!-- No existing specs require modification. -->

## Impact

- `dashboard/app/controllers/omniauth_callbacks_controller.rb` — updated ClassLink callback and dual-match login logic
- `dashboard/app/models/authentication_option.rb` — `Classlink::VERSION` constant; dual-match lookup for ClassLink during migration window
- `dashboard/lib/services/classlink/v2_auth_option_builder.rb` — new builder service (mirrors `Services::Clever::V3AuthOptionBuilder`)
- `bin/oneoff/classlink/` — bulk migration script (mirrors `bin/oneoff/clever/clever_v3_migration.rb`)
- `dashboard/app/models/sections/classlink_section.rb` — new model
- `dashboard/lib/clients/classlink_one_roster.rb` — new One Roster REST client
- `dashboard/app/controllers/api_controller.rb` — new `classlink_classrooms` and `import_classlink_classroom` endpoints
- `dashboard/config/routes.rb` — new routes
- `apps/src/accounts/constants.js` — new `OAuthSectionTypes.classlink` entry
- `apps/src/templates/teacherDashboard/teacherSectionsRedux.ts` — new provider URL mappings
- All 14,392 existing ClassLink `AuthenticationOption` records (data migration)
- ClassLink Partner Portal API key required in CDO config (`CDO.classlink_roster_api_key`)
