## Why

ClassLink SSO launched in early 2026, but teachers in ClassLink districts cannot yet import or sync their classes into code.org sections. Adding One Roster-based rostering brings ClassLink to parity with Clever and Google Classroom, enabling teachers to manage sections without manual student enrollment.

## What Changes

- New `ClasslinkSection` model (STI subclass of `OmniAuthSection`) for storing and syncing ClassLink-rostered sections
- New `Clients::ClasslinkOneRoster` REST client for the One Roster proxy API
- New backend endpoints for listing available ClassLink classes and importing/syncing a class as a section, with server-side authorization: because ClassLink uses a central partner credential (not user-scoped tokens like Clever/Google), the endpoints must themselves verify the requester teaches a class (via One Roster) or is an instructor of the section before any import or sync
- Updated OmniAuth callback to create ClassLink `AuthenticationOption` records with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` when the SSO payload carries a `SourcedId` (currently stores only `UserId`, unversioned). ClassLink documents `SourcedId` as **empty when a district does not have OneRoster enabled**, so users in those districts keep signing up and signing in on the legacy `UserId` format indefinitely — v1 is a permanently supported login path, not a transitional one
- Migration of existing ClassLink users in OneRoster-enabled districts by creating v2 auth options alongside their untouched legacy records at sign-in time, mirroring the Clever v2→v3 API migration; rollback is deleting the v2 records. There is no bulk migration: non-OneRoster users have no `SourcedId` to migrate to, and with v1 permanent there is no convergence deadline for anyone else
- Sign-in also fills in the pair in the other direction: an account holding only a v2 record gains its `UserId`-keyed v1 record. The `UserId` is stable, globally unique, and present on every SSO response, so it is the login anchor; `SourcedId` can change or disappear, so a v2-only account would be unrecoverable if it did — the same orphaning Clever hit when a district disabled and re-enabled its integration
- Frontend additions to expose ClassLink as a roster provider in the teacher section import UI, surfaced only to teachers holding a v2 ClassLink auth option
- ClassLink login gains a legacy-`UserId` fallback lookup — permanent, because it is the only login path for districts without OneRoster enabled

## Capabilities

### New Capabilities

- `classlink-id-migration`: Create versioned v2 ClassLink auth options (`<TenantId>|<SourcedId>`, `version = 'v2'`) alongside legacy `UserId` records for users whose SSO payload carries a `SourcedId`, with permanent dual-match login — v1 remains the only format for districts without OneRoster enabled — and rollback by deleting v2 records
- `classlink-rostering`: Teacher-triggered import and sync of ClassLink classes as code.org sections via the One Roster API

### Modified Capabilities

<!-- No existing specs require modification. -->

## Impact

- `dashboard/app/controllers/omniauth_callbacks_controller.rb` — updated ClassLink callback and dual-match login logic
- `dashboard/app/models/authentication_option.rb` — `Classlink::VERSION` constant; dual-match lookup for ClassLink
- `dashboard/lib/services/classlink/v2_auth_option_builder.rb` — new builder service (mirrors `Services::Clever::V3AuthOptionBuilder`)
- `dashboard/app/models/sections/classlink_section.rb` — new model
- `dashboard/lib/clients/classlink_one_roster.rb` — new One Roster REST client
- `dashboard/app/controllers/api_controller.rb` — new `classlink_classrooms` and `import_classlink_classroom` endpoints
- `dashboard/config/routes.rb` — new routes
- `apps/src/accounts/constants.js` — new `OAuthSectionTypes.classlink` entry
- `apps/src/templates/teacherDashboard/teacherSectionsRedux.ts` — new provider URL mappings
- `dashboard/app/views/teacher_dashboard/show.html.haml` — roster-provider payload includes `classlink` only for users holding a v2 auth option
- Existing ClassLink `AuthenticationOption` records in OneRoster-enabled districts gain a v2 sibling at the user's next sign-in; records in non-OneRoster districts are untouched indefinitely
- ClassLink Partner Portal API key required in CDO config (`CDO.classlink_roster_api_key`)
