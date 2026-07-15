## Why

ClassLink SSO launched in early 2026, but teachers in ClassLink districts cannot yet import or sync their classes into code.org sections. Adding One Roster-based rostering brings ClassLink to parity with Clever and Google Classroom, enabling teachers to manage sections without manual student enrollment.

## What Changes

- New `ClasslinkSection` model (STI subclass of `OmniAuthSection`) for storing and syncing ClassLink-rostered sections
- New `Clients::ClasslinkOneRoster` REST client for the One Roster proxy API
- New backend endpoints for listing available ClassLink classes and importing/syncing a class as a section
- Updated OmniAuth callback to format `AuthenticationOption.authentication_id` as `<TenantId>|<SourceId>` (currently stores only `UserId`)
- Batch migration of all 14,392 existing ClassLink `AuthenticationOption` records to the new ID format
- Frontend additions to expose ClassLink as a roster provider in the teacher section import UI
- **BREAKING**: `AuthenticationOption.authentication_id` for ClassLink users changes format from `<UserId>` to `<TenantId>|<SourceId>`; dual-match logic bridges the transition window

## Capabilities

### New Capabilities

- `classlink-id-migration`: Migrate existing ClassLink `AuthenticationOption` records from `UserId` to `<TenantId>|<SourceId>`, with dual-match login support during the transition window
- `classlink-rostering`: Teacher-triggered import and sync of ClassLink classes as code.org sections via the One Roster API

### Modified Capabilities

<!-- No existing specs require modification. -->

## Impact

- `dashboard/app/controllers/omniauth_callbacks_controller.rb` — updated ClassLink callback and dual-match login logic
- `dashboard/app/models/authentication_option.rb` — dual-match lookup for ClassLink during migration window
- `dashboard/app/models/sections/classlink_section.rb` — new model
- `dashboard/lib/clients/classlink_one_roster.rb` — new One Roster REST client
- `dashboard/app/controllers/api_controller.rb` — new `classlink_classrooms` and `import_classlink_classroom` endpoints
- `dashboard/config/routes.rb` — new routes
- `apps/src/accounts/constants.js` — new `OAuthSectionTypes.classlink` entry
- `apps/src/templates/teacherDashboard/teacherSectionsRedux.ts` — new provider URL mappings
- All 14,392 existing ClassLink `AuthenticationOption` records (data migration)
- ClassLink Partner Portal API key required in CDO config (`CDO.classlink_roster_api_key`)
