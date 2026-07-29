## 1. Phase 1 — ID Migration: Versioned Auth Options and Callback Updates

- [ ] 1.1 Verify exact OmniAuth raw_info field names for `SourceId` and `TenantId` against a live ClassLink sandbox login
- [ ] 1.2 Add `AuthenticationOption::Classlink::VERSION = {v2: 'v2'}.freeze` constant (mirrors `AuthenticationOption::Clever::VERSION`)
- [ ] 1.3 Create `Services::Classlink::V2AuthOptionBuilder` (mirrors `Services::Clever::V3AuthOptionBuilder`): finds the v1 auth option, dups it, sets `authentication_id = <TenantId>|<SourceId>` and `version = 'v2'`; returns nil if the v1 option is missing or a v2 option already exists
- [ ] 1.4 Write unit tests for the builder (created, idempotent-nil, missing-v1-nil cases)
- [ ] 1.5 Update `inject_classlink_data` in `omniauth_callbacks_controller.rb` to extract `TenantId` and `SourceId` from the OAuth raw_info payload
- [ ] 1.6 Update the ClassLink sign-up path: new accounts get `authentication_id = <TenantId>|<SourceId>` and `version = 'v2'`
- [ ] 1.7 Add dual-match login logic: try lookup by v2-format `authentication_id` first, fall back to legacy `UserId` lookup
- [ ] 1.8 When a user is found via the legacy fallback, create their v2 auth option via the builder (login-time migration; v1 record untouched)
- [ ] 1.9 Write unit tests for the updated callback and dual-match logic (v2 login, v1 fallback + v2 creation, both-records login creates nothing)
- [ ] 1.10 Deploy Phase 1 to production

## 2. Phase 1 — Bulk Migration Script (optional operational tool)

- [ ] 2.1 Write `bin/oneoff/classlink/classlink_v2_migration.rb` modeled on `bin/oneoff/clever/clever_v3_migration.rb`, with dry-run (default) and commit modes
- [ ] 2.2 Iterate ClassLink users lacking a v2 auth option; for each with a valid stored `oauth_token`, call ClassLink `v2/my/info`, extract `SourceId` and `TenantId`, and create the v2 option via `Services::Classlink::V2AuthOptionBuilder`
- [ ] 2.3 Log skipped records (expired tokens, already-migrated) and report counts
- [ ] 2.4 Operational (recommended before Phase 2 ships): dry-run in production, review output, then run in commit mode; verify v2 record counts
- [ ] 2.5 Monitor count of users lacking v2 records over subsequent weeks (login-time migration converges the remainder)
- [ ] 2.6 Document the rollback procedure: delete ClassLink v2 auth options for users who also retain a v1 record (never for v2-only users)

## 3. Phase 2 — One Roster Client

- [ ] 3.1 Create `dashboard/lib/clients/classlink_one_roster.rb` with methods (all collection methods paginate via the 3.2 helper):
  - `fetch_applications` — calls `/applications` with `CDO.classlink_roster_api_key`, returns list
  - `application_for_tenant(tenant_id)` — cache-aside lookup (see 3.3); on miss, calls `fetch_applications` and finds enabled application matching `tenant_id`
  - `teacher_classes(oneroster_application_id, bearer, teacher_source_id)` — calls `/teachers/<SourceId>/classes`
  - `class_students(oneroster_application_id, bearer, class_source_id)` — calls `/classes/<sourceId>/students`, filters `role == "student"`
  - `class_teachers(oneroster_application_id, bearer, class_source_id)` — calls `/classes/<sourceId>/teachers` (used for co-teacher verification)
- [ ] 3.2 Implement a shared pagination helper used by all collection methods: request with `limit=PAGE_LIMIT` (constant, 1000) and `offset=0`; read `x-total-count` and `x-count` headers (fall back to counting results if `x-count` is absent); loop incrementing `offset` by `limit` and accumulating a running total until it reaches `x-total-count` or a page returns no results; return all records combined
- [ ] 3.3 Implement cache-aside for `application_for_tenant`: namespaced `read_cache`/`write_cache` helpers over `CDO.shared_cache` keyed by `tenant_id`, JSON-serialized values, 5-day TTL (follow `lti_v1_controller.rb` pattern)
- [ ] 3.4 Implement 401 recovery flow: on One Roster 401, re-fetch `/applications`; if fresh bearer differs from cached, update cache and retry the original request once; if it matches (or the retry also 401s), raise an error that surfaces a user-facing message (copy TBD)
- [ ] 3.4a Implement 429 propagation: on One Roster 429, raise a rate-limited error immediately (no sleep, no in-process retry) that the controller maps to a 429 response
- [ ] 3.5 Add `CDO.classlink_roster_api_key` to config and secrets management
- [ ] 3.6 Write unit tests for the One Roster client (stub HTTP calls), covering cache hit, cache miss, 401-with-stale-token retry, 401-with-matching-token error, retry-also-fails error, and 429 raising immediately without sleep or retry
- [ ] 3.7 Write unit tests for pagination: single page (total ≤ limit → one request), multi-page stitch (records combined across pages, offsets increment by limit), empty-page safety break despite `x-total-count` claiming more, and missing `x-count` header fallback

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
  - Extract `TenantId` and `SourceId` from the teacher's v2 ClassLink auth option
  - Call `Clients::ClasslinkOneRoster.application_for_tenant(tenant_id)`
  - Call `teacher_classes` and return `{courses: [...]}`
  - Return appropriate error if the teacher has no v2 ClassLink auth option (not yet migrated)
- [ ] 5.2 Add `import_classlink_classroom` action to `api_controller.rb`, enforcing the authorization matrix (design Decision 5b):
  - Accept `courseId` (class sourceId) and `courseName` params; derive `TenantId` and teacher `SourceId` ONLY from `current_user`'s v2 auth option (never from params)
  - Whenever the requester is not already an instructor of the target section — including first import, where no section exists — verify teacher membership via a `classlink_teacher_for_course?` helper (checks requester's `SourceId` against `class_teachers`); return 403 if not verified (generalizes `clever_teacher_for_course?` to first imports, since the partner credential provides no upstream scoping)
  - Requesters who are already section instructors proceed without re-verification (matches Clever)
  - Call `Clients::ClasslinkOneRoster.application_for_tenant` then `class_students`
  - Call `ClasslinkSection.from_service` with results
  - Return section summary JSON
- [ ] 5.3 Add routes: `GET /dashboardapi/classlink_classrooms`, `POST /dashboardapi/import_classlink_classroom`
- [ ] 5.4 Write controller tests for both endpoints, including co-teacher paths: verified co-teacher added as section instructor, unverified user gets 403
- [ ] 5.5 Write dedicated authorization tests (partner-credential threat model):
  - First import of a class the requester does not teach (SourceId absent from `class_teachers`) → 403, no section created, no students enrolled
  - Sync attempt by an authenticated non-instructor who fails co-teacher verification → 403, section and roster unchanged
  - Request supplying forged tenant/application/SourceId params → server-derived identity used; foreign values ignored
  - `courseId` from another district → not resolvable within requester's tenant application → error, no data returned
  - Instructor (owner and separately co-teacher) sync → succeeds without One Roster teacher verification call

## 6. Phase 2 — Frontend

- [ ] 6.1 Add `classlink` to `OAuthSectionTypes` enum in `apps/src/accounts/constants.js`
- [ ] 6.2 Add `LOGIN_TYPE_CLASSLINK = 'classlink'` to `SectionLoginType` if not already present
- [ ] 6.3 Add ClassLink entries to `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`
- [ ] 6.4 Add a "Import via ClassLink" trigger in the teacher section creation UI (matching Clever's entry point)
- [ ] 6.5 Implement a shared frontend retry helper for ClassLink rostering requests: on a 429 response, retry with exponential backoff (3 attempts total, 1s then 2s waits ± jitter); apply it to both the class-list fetch and the import/sync request; surface the existing `rosterImportFailed` error only after all attempts fail
- [ ] 6.6 Write frontend unit tests for the retry helper: success on second attempt shows no error, 3× 429 surfaces the failure path, non-429 errors fail immediately without retry
- [ ] 6.7 Verify `RosterDialog` and `SectionActionDropdown` work correctly with the new provider (no structural changes expected)
- [ ] 6.8 Run `yarn run typecheck` and `./tools/hooks/pre-commit` to confirm no type or lint errors

## 7. Phase 2 — Integration Testing

- [ ] 7.1 Test full import flow end-to-end against ClassLink sandbox: authenticate as teacher → list classes → import a class → verify section and students created correctly
- [ ] 7.2 Test re-sync: add a student in the sandbox → sync → verify student added to section
- [ ] 7.3 Test re-sync: remove a student in the sandbox → sync → verify student removed from section
- [ ] 7.4 Test error case: teacher without a v2 auth option sees appropriate re-login prompt
- [ ] 7.5 Test error case: teacher's district not in `/applications` response sees appropriate error message
- [ ] 7.6 Test co-teacher flow: second teacher listed on the class in the sandbox imports the already-imported class → added as co-teacher; a teacher not listed on the class gets 403
- [ ] 7.7 Test authorization end-to-end against the sandbox: authenticated teacher attempts first import of a valid `courseId` they do not teach → 403 and no section created

## 8. Phase 3 — Migration Cleanup

- [ ] 8.1 Confirm all active ClassLink users have v2 auth options (query count of v1-only users)
- [ ] 8.2 Remove dual-match login fallback from `omniauth_callbacks_controller.rb`
- [ ] 8.3 Remove login-time v2-creation logic from the callback (builder service remains for the record)
- [ ] 8.4 Retire v1 ClassLink auth options (delete after an observation window)
- [ ] 8.5 Update and run tests to confirm no regressions
- [ ] 8.6 Deploy Phase 3
