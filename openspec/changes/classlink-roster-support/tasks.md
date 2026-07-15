## 1. Phase 1 — ID Migration: OmniAuth Callback Updates

- [ ] 1.1 Verify exact OmniAuth raw_info field names for `SourceId` and `TenantId` against a live ClassLink sandbox login
- [ ] 1.2 Update `inject_classlink_data` in `omniauth_callbacks_controller.rb` to extract `TenantId` and `SourceId` from the OAuth raw_info payload
- [ ] 1.3 Update the ClassLink sign-up path to set `authentication_id` as `<TenantId>|<SourceId>` for new accounts
- [ ] 1.4 Add dual-match login logic: for ClassLink provider, try lookup by new-format `authentication_id` first, fall back to legacy `UserId` lookup
- [ ] 1.5 When a legacy-format user is found via dual-match, update their `authentication_id` to `<TenantId>|<SourceId>` in-place (login-time migration)
- [ ] 1.6 Write unit tests for the updated callback and dual-match logic
- [ ] 1.7 Deploy Phase 1 to production

## 2. Phase 1 — Bulk Migration Script (optional operational tool)

- [ ] 2.1 Write a Rails runner script that iterates all ClassLink `AuthenticationOption` records with legacy `UserId` format
- [ ] 2.2 For each record with a valid stored `oauth_token`, call ClassLink `v2/my/info`, extract `SourceId` and `TenantId`, update `authentication_id` to `<TenantId>|<SourceId>`
- [ ] 2.3 Log skipped records (expired tokens) for monitoring
- [ ] 2.4 Operational (recommended before Phase 2 ships): run migration script in production; verify record counts before and after
- [ ] 2.5 Monitor legacy-format record counts over subsequent weeks (login-time migration converges the remainder)

## 3. Phase 2 — One Roster Client

- [ ] 3.1 Create `dashboard/lib/clients/classlink_one_roster.rb` with methods:
  - `fetch_applications` — calls `/applications` with `CDO.classlink_roster_api_key`, returns list
  - `application_for_tenant(tenant_id)` — cache-aside lookup (see 3.2); on miss, calls `fetch_applications` and finds enabled application matching `tenant_id`
  - `teacher_classes(oneroster_application_id, bearer, teacher_source_id)` — calls `/teachers/<SourceId>/classes`
  - `class_students(oneroster_application_id, bearer, class_source_id)` — calls `/classes/<sourceId>/students`, filters `role == "student"`
  - `class_teachers(oneroster_application_id, bearer, class_source_id)` — calls `/classes/<sourceId>/teachers` (used for co-teacher verification)
- [ ] 3.2 Implement cache-aside for `application_for_tenant`: namespaced `read_cache`/`write_cache` helpers over `CDO.shared_cache` keyed by `tenant_id`, JSON-serialized values, configurable TTL (follow `lti_v1_controller.rb` pattern)
- [ ] 3.3 Implement 401 recovery flow: on One Roster 401, re-fetch `/applications`; if fresh bearer differs from cached, update cache and retry the original request once; if it matches (or the retry also 401s), raise an error that surfaces a user-facing message (copy TBD)
- [ ] 3.4 Add `CDO.classlink_roster_api_key` to config and secrets management
- [ ] 3.5 Write unit tests for the One Roster client (stub HTTP calls), covering cache hit, cache miss, 401-with-stale-token retry, 401-with-matching-token error, and retry-also-fails error

## 4. Phase 2 — ClasslinkSection Model

- [ ] 4.1 Create `dashboard/app/models/sections/classlink_section.rb` as `ClasslinkSection < OmniAuthSection` with `CODE_PREFIX = 'CL-'`
- [ ] 4.2 Add `classlink_id` helper method to parse `oneroster_application_id` and `class_source_id` from `section.code`
- [ ] 4.3 Implement `ClasslinkSection.from_service(class_source_id, oneroster_application_id, owner_id, student_list, section_name)`:
  - Sets `code = "CL-#{oneroster_application_id}|#{class_source_id}"`
  - Transforms One Roster student records into `OmniAuth::AuthHash` objects with `uid: "<TenantId>|<studentSourceId>"` and `provider: 'classlink'`
  - Calls `from_omniauth` with `type: Section::LOGIN_TYPE_CLASSLINK`
- [ ] 4.4 Add `LOGIN_TYPE_CLASSLINK = 'classlink'` to the `Section` model constants
- [ ] 4.5 Write unit tests for `ClasslinkSection.from_service`

## 5. Phase 2 — Backend Endpoints

- [ ] 5.1 Add `classlink_classrooms` action to `api_controller.rb`:
  - Extract `TenantId` and `SourceId` from teacher's `authentication_id`
  - Call `Clients::ClasslinkOneRoster.application_for_tenant(tenant_id)`
  - Call `teacher_classes` and return `{courses: [...]}`
  - Return appropriate error if teacher is not yet migrated (legacy format `authentication_id`)
- [ ] 5.2 Add `import_classlink_classroom` action to `api_controller.rb`:
  - Accept `courseId` (class sourceId) and `courseName` params
  - If the section already exists and the requester is not an instructor, verify co-teacher status via a `classlink_teacher_for_course?` helper (checks requester's `SourceId` against `class_teachers`); return 403 if not verified (mirrors `clever_teacher_for_course?`)
  - Call `Clients::ClasslinkOneRoster.application_for_tenant` then `class_students`
  - Call `ClasslinkSection.from_service` with results
  - Return section summary JSON
- [ ] 5.3 Add routes: `GET /dashboardapi/classlink_classrooms`, `POST /dashboardapi/import_classlink_classroom`
- [ ] 5.4 Write controller tests for both endpoints, including co-teacher paths: verified co-teacher added as section instructor, unverified user gets 403

## 6. Phase 2 — Frontend

- [ ] 6.1 Add `classlink` to `OAuthSectionTypes` enum in `apps/src/accounts/constants.js`
- [ ] 6.2 Add `LOGIN_TYPE_CLASSLINK = 'classlink'` to `SectionLoginType` if not already present
- [ ] 6.3 Add ClassLink entries to `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`
- [ ] 6.4 Add a "Import via ClassLink" trigger in the teacher section creation UI (matching Clever's entry point)
- [ ] 6.5 Verify `RosterDialog` and `SectionActionDropdown` work correctly with the new provider (no structural changes expected)
- [ ] 6.6 Run `yarn run typecheck` and `./tools/hooks/pre-commit` to confirm no type or lint errors

## 7. Phase 2 — Integration Testing

- [ ] 7.1 Test full import flow end-to-end against ClassLink sandbox: authenticate as teacher → list classes → import a class → verify section and students created correctly
- [ ] 7.2 Test re-sync: add a student in the sandbox → sync → verify student added to section
- [ ] 7.3 Test re-sync: remove a student in the sandbox → sync → verify student removed from section
- [ ] 7.4 Test error case: teacher with legacy `authentication_id` sees appropriate re-login prompt
- [ ] 7.5 Test error case: teacher's district not in `/applications` response sees appropriate error message
- [ ] 7.6 Test co-teacher flow: second teacher listed on the class in the sandbox imports the already-imported class → added as co-teacher; a teacher not listed on the class gets 403

## 8. Phase 3 — Migration Cleanup

- [ ] 8.1 Confirm all ClassLink `AuthenticationOption` records are in new format (query count of legacy-format records)
- [ ] 8.2 Remove dual-match login fallback from `omniauth_callbacks_controller.rb`
- [ ] 8.3 Remove login-time migration update logic
- [ ] 8.4 Update and run tests to confirm no regressions
- [ ] 8.5 Deploy Phase 3
