# Implementation tasks

Delivered as **four stacked PRs**. Task numbers are stable and referenced from `design.md`, so they are unchanged by this grouping.

Two axes are in play and they are not the same thing. **PRs** are units of review. **Phases**
are units of deployment, defined in the design's Migration Plan. Phase 1 spans two PRs
because the bulk script is separable review work that ships within the same deployment phase.

| PR  | Scope                                                            | Sections | Deployment phase | Depends on                       |
| --- | ---------------------------------------------------------------- | -------- | ---------------- | -------------------------------- |
| 1   | Sign-in and sign-up handle the v2 `authentication_id` format     | 1        | Phase 1          | —                                |
| 2   | One-time bulk migration script                                   | 2        | Phase 1          | PR 1                             |
| 3   | Rostering: client, model, endpoints, frontend, integration tests | 3–7      | Phase 2          | PR 1                             |
| 4   | Migration cleanup                                                | 8        | Phase 3          | PR 3, plus an observation window |

PR 3 depends on PR 1, not on PR 2 — the script is an accelerator, not a prerequisite, since
login-time migration converges every user on next sign-in (task 1.8). PR 2 is sequenced second
anyway for an operational reason rather than a technical one: it should be **run** before
rostering reaches teachers, because any teacher without a v2 auth option meets the "sign out
and sign back in" message instead of their class list. Merging it second leaves time to
dry-run, run, and let the tail converge while PR 3 is still in review.

## PR 1 — Sign-in handles the v2 `authentication_id` format

No user-visible change. Establishes the identifier every later PR depends on, and begins
login-time migration of the ~14,392 existing ClassLink users the moment it deploys.

Rollback is non-lossy for users who still hold a v1 record, and **not** for users who sign up
or connect ClassLink from Manage Linked Accounts after this deploys — their v2 record is their
only auth option. See the design's Rollback note.

### 1. Phase 1 — ID Migration: Versioned Auth Options and Callback Updates

- [x] 1.1 ~~Confirm the live `v2/my/info` payload shape~~ — done. Two live responses captured, plus a logged production auth hash confirming the gem exposes `info[:external_id]` and `info[:district_id]`
- [x] 1.2 Add `AuthenticationOption::Classlink::VERSION = {v2: 'v2'}.freeze` constant (mirrors `AuthenticationOption::Clever::VERSION`)
- [x] 1.3 Create `Services::Classlink::V2AuthOptionBuilder` (mirrors `Services::Clever::V3AuthOptionBuilder`): finds the v1 auth option, dups it, sets `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`; returns nil if the v1 option is missing or a v2 option already exists
- [x] 1.3a Validate the components asymmetrically before constructing `authentication_id` (design Decision 1): both must be non-blank after `to_s`, and `TenantId` must additionally contain no pipe. Do **not** reject a pipe in `SourcedId` — it is a legal SIS value and first-pipe splitting handles it. On failure build nothing, log the `UserId`, and let login fall back to the v1 path. A blank `SourcedId` would otherwise produce `"<TenantId>|"` for every user in that tenant and collide them onto one auth option
- [x] 1.3c Parse `authentication_id` with `split('|', 2)` everywhere it is decomposed — never a bare `split('|')`, which truncates a `SourcedId` containing a pipe. The limit is what makes the format unambiguous, given `TenantId` cannot contain one (design Decision 1)
- [x] 1.3b Normalize `TenantId` with `to_s` wherever it is compared or joined — `v2/my/info` returns it as an integer while `/applications` returns `tenant_id`; an unnormalized cache key or comparison misses across the two
- [x] 1.4 Write unit tests for the builder (created, idempotent-nil, missing-v1-nil cases) plus the 1.3a/1.3c behavior: blank `SourcedId` builds nothing, blank `TenantId` builds nothing, pipe-containing `TenantId` builds nothing, and — the case that pins the design — a pipe-containing `SourcedId` **does** build and round-trips through `split('|', 2)` to the original value. Also: integer `TenantId` normalizes to the same id as its string form
- [x] 1.5 Extract `TenantId` and `SourcedId` in the callback from the gem's `info[:district_id]` and `info[:external_id]` rather than digging `raw_info` (see design Context)
- [x] 1.6 Update the ClassLink sign-up path: new accounts get `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`
- [x] 1.7 Add dual-match login logic: try lookup by v2-format `authentication_id` first, fall back to legacy `UserId` lookup
- [x] 1.8 When a user is found via the legacy fallback, create their v2 auth option via the builder (login-time migration; v1 record untouched)
- [x] 1.9 Write unit tests for the updated callback and dual-match logic (v2 login, v1 fallback + v2 creation, both-records login creates nothing)
- [x] 1.9a Extend the v2 handling to `connect_provider` (Manage Linked Accounts → Connect): run the uid rewrite before the connect branch so the holder lookup, takeover checks, and new-auth-option creation all operate on v2 ids, and stamp `version` via `version_for` so a legacy-format fallback isn't mislabeled v2. Without this the v1-format holder lookup misses v2-only accounts (any post-deploy signup) and a second account could link the same credential. Tests: fresh connect creates a v2 option, invalid components fall back to v1 with nil version, connecting a credential the current user holds as v1 migrates it and no-ops, a v2-only holder with activity is refused
- [x] 1.9b Use byte-exact id matching (merged separately: `classlink` is in `AuthenticationOption::CASE_SENSITIVE_CREDENTIAL_TYPES`, so `User.find_by_credential` confirms ClassLink matches byte-for-byte by default — the column collation ignores case, SIS-authored `SourcedId`s don't). Every lookup in this PR inherits that automatically; the one manual piece is the builder, whose direct `AuthenticationOption` queries use `find_by_exact_credential`, most critically the v2 idempotency check — under the collation, a case-twin's record would block a user's v2 option from ever being built. Test: a v2 option differing only by case does not block building
- [ ] 1.10 Deploy Phase 1 to production

## PR 2 — One-time bulk migration script

Depends on PR 1's `V2AuthOptionBuilder` and nothing else. An operational accelerator, not a
prerequisite for rostering — but running it before PR 3 reaches teachers is what keeps the
"sign out and sign back in" message rare rather than routine.

### 2. Phase 1 — Bulk Migration Script (optional operational tool)

- [x] 2.1 Write `bin/oneoff/classlink/classlink_v2_migration.rb` modeled on `bin/oneoff/clever/clever_v3_migration.rb`, with dry-run (default) and commit modes
- [x] 2.2 Iterate ClassLink users lacking a v2 auth option; for each, call ClassLink `v2/my/info` with the stored `oauth_token`, extract `SourcedId` and `TenantId`, and create the v2 option via `Services::Classlink::V2AuthOptionBuilder`. **Do not attempt to pre-filter on token validity** — every stored ClassLink credential has `expires: false`, a null expiration, and no refresh token, so there is no detectable expiry condition to filter on. Attempt the call and treat failure as a skip
- [x] 2.3 Log skipped records (call failed, already-migrated) and report counts. A high failure rate is informational, not a blocker: login-time migration (task 1.8) converges every remaining user on their next sign-in, which is why this script is an accelerator rather than a requirement
- [ ] 2.4 Operational (recommended before Phase 2 ships): dry-run in production, review output, then run in commit mode; verify v2 record counts
- [ ] 2.5 Monitor count of users lacking v2 records over subsequent weeks (login-time migration converges the remainder)
- [x] 2.6 Document the rollback procedure: delete ClassLink v2 auth options for users who also retain a v1 record (never for v2-only users)

## PR 3 — Rostering: One Roster client, section model, endpoints, and frontend

The bulk of the change: sections 3 through 7. Backend and frontend ship together, which means
the endpoints and the UI that calls them arrive in the same commit — there is no window in
which the endpoints are live with no caller.

Two areas carry nearly all the correctness risk in this change and are worth reviewing on
their own terms rather than as part of a sweep:

- **The authorization matrix** (design Decision 5b, invariants I1–I3, tasks 5.2 and 5.5). The
  partner credential grants district-wide read access, so every authorization guarantee is
  ours to enforce. There is no upstream scoping to fall back on.
- **The One Roster client** (section 3). Pagination termination, structural validation, the two
  opposing path-escaping rules, and the completeness of each fetch all fail silently when wrong —
  and with no partner key in non-production, the stubbed-HTTP unit tests are the only place
  they get exercised before production (task 3.5b).

### 3. Phase 2 — One Roster Client

- [ ] 3.1 Create `dashboard/lib/clients/classlink_one_roster.rb` with methods (all collection methods paginate via the 3.2 helper):
  - `fetch_applications` — calls `/applications` with `CDO.classlink_roster_api_key`, returns list
  - `application_for_tenant(tenant_id)` — cache-aside lookup (see 3.3); on miss, calls `fetch_applications` and selects the record matching `tenant_id` (string-compared) with `enabled == 'true'` and `tenant_status == 'Active'`. Reads records from the `applications` envelope key; raises if that key is absent or not an array; logs a warning (does not raise) on a well-formed empty array; logs the top-level `status` when it is not 1 but never branches on it. Caches `bearer` and `oneroster_application_id` — **not** `id` or `application_id`, which are different fields and would produce an invalid request path
  - `teacher_classes(oneroster_application_id, bearer, teacher_sourced_id)` — calls `/teachers/<SourcedId>/classes`, reads records from the `classes` envelope key, and uses each class's `title` as the display/section name (`classCode` and `periods` are empty and carry no period information)
  - `class_students(oneroster_application_id, bearer, class_sourced_id)` — calls `/classes/<classSourcedId>/students`, filters `role == "student"` (lowercase, confirmed)
  - `class_teachers(oneroster_application_id, bearer, class_sourced_id)` — calls `/classes/<classSourcedId>/teachers` (used for co-teacher verification); endpoint confirmed to exist 2026-08-03
  - All three read records from the **`users`** envelope key, not a key named after the endpoint
- [ ] 3.1a Compare ClassLink string-booleans explicitly against `'true'` — `enabledUser` (user records) and `enabled` (`/applications`) are the strings `"true"`/`"false"`, and `"false"` is truthy in Ruby, so `if record['enabledUser']` passes for a disabled user
- [ ] 3.1b Never follow `href` values from One Roster response bodies (`orgs[].href` points at a different host, e.g. `certs-nj-v2.rosterserver.com`) — always construct URLs through the proxy with the district bearer, or the credential path is bypassed
- [ ] 3.1c Extract only `sourcedId`, `givenName`, `familyName`, and `role` from One Roster user records, and never log raw payloads — they carry `password`, `sms`, `phone`, `middleName`, `email`, and an `agents[]` array that on student records references their **guardians**. Match users on `sourcedId` only, never the separate `identifier` or `userIds[]` entries, and never follow `agents[]` or `orgs[]` hrefs
- [ ] 3.1d Build request paths with two different escaping policies (design Decision 3a): interpolate `oneroster_application_id` **verbatim** as an opaque pre-escaped literal (re-encoding makes `%2F` into `%252F` and fails opaquely), but URL-escape every `sourcedId` segment — district-supplied ids are arbitrary strings, not digits (`7_1553`, `FY` observed). Unit-test both: an application id containing `%2F` survives unchanged, and a `sourcedId` containing a URL-significant character is escaped — cover `|` specifically (`%7C`; it is neither reserved nor unreserved under RFC 3986), since Decision 1 admits it as a legal `sourcedId` character
- [ ] 3.2 Implement a shared pagination helper used by all collection methods (design Decision 3a): request with `limit=PAGE_LIMIT` (constant, 1000) and `offset=0`, plus `sort=sourcedId&orderBy=asc` on the One Roster collections, sent identically on every page. Validate each response structurally before reading it — the expected envelope key (`users`, `classes`, `applications`) must be present and an array, else raise; this is what catches an HTTP 200 carrying an error envelope, without depending on knowing its format. Accumulate each page, then stop when **any** of: the page returned fewer than `limit` records (short page = last page); the page returned zero records; or `x-total-count` is present and the running total has reached it. Termination must not require the count headers — `/applications` sends none. A paginated response is a normal outcome, never an error
- [ ] 3.2a Route `/applications` through the same helper at the same `PAGE_LIMIT = 1000`. It honors `limit`/`offset` (both verified) but returns **no `x-count` or `x-total-count`** (despite advertising `access-control-expose-headers: x-total-count`), so the short-page condition is its only terminator. Do **not** raise its limit toward the accepted 10000: with no count header to cross-check, a silently clamped response is indistinguishable from a final short page (design Decision 3a). ~630 districts already exceed the OneRoster default limit of 100, and a truncated district list makes real districts look like ClassLink rostering is disabled for them
- [x] 3.2b ~~Verify the ordering is stable~~ — done 2026-08-03. `sort=sourcedId` with `orderBy=asc` vs `desc` returns exact reverses, ascending by `sourcedId` under `asc`, so the proxy applies a deliberate total order over a unique key. Use the IMS spelling `desc`, not `dsc` (silently discarded)
- [ ] 3.3 Implement cache-aside for `application_for_tenant`: namespaced `read_cache`/`write_cache` helpers over `CDO.shared_cache` keyed by `tenant_id`, JSON-serialized values, 5-day TTL (follow `lti_v1_controller.rb` pattern)
- [ ] 3.4 Implement 401 recovery flow: on One Roster 401, re-fetch `/applications`; if fresh bearer differs from cached, update cache and retry the original request once; if it matches (or the retry also 401s), raise an error that surfaces a user-facing message (copy TBD)
- [ ] 3.5 Add `CDO.classlink_roster_api_key` to config. **Production only** declares it as `!Secret`, and the secret must be provisioned **before** it is declared — `CDO` is frozen at boot and raises on undefined keys, and `config.ru` eager-loads declared secrets outside development, so declaring ahead of provisioning fails boot. Staging, test, and adhoc get a literal empty string (decided 2026-08-10), which has no secret to provision and so no boot-order risk
- [ ] 3.5a Guard on `CDO.classlink_roster_api_key.present?`, never `.nil?` — non-production holds `""`, and a `nil?` check would pass it through and call `/applications` with an empty key. A blank key resolves to the same rostering-unavailable outcome as a district with no enabled application; it must not raise at boot or on any unrelated page
- [ ] 3.5b Note for the test plan, not a code task: with no partner key and no ClassLink SSO in non-production, the rostering flow cannot be exercised end-to-end before release — no UI test coverage, no manual QA. The stubbed-HTTP unit tests (3.6, 3.6a, 3.7, 3.9) are the entire safety net rather than a supplement, and should be reviewed with that in mind
- [ ] 3.6 Write unit tests for the One Roster client (stub HTTP calls), covering cache hit, cache miss, 401-with-stale-token retry, 401-with-matching-token error, retry-also-fails error
- [ ] 3.6a Write unit tests for application selection: missing or non-array `applications` key raises; well-formed empty array warns without raising; a `status` other than 1 is logged but does **not** change the outcome; `enabled: "false"` is rejected despite being a truthy string; `tenant_status` other than `Active` is rejected; a well-formed list not containing the tenant yields the rostering-unavailable path rather than an error; integer `tenant_id` matches a string-form lookup; the cached path segment is `oneroster_application_id` and never `id` or `application_id`
- [ ] 3.7 Write unit tests for pagination: a 200 response whose collection key is missing or non-array raises (the success-shaped-failure case), single page (count below limit → one request), multi-page stitch (records combined across pages, offsets increment by limit), short final page ends the loop, **multi-page fetch with no count headers at all terminates correctly on the short page** (the `/applications` case), empty-page safety break despite `x-total-count` claiming more, exact-multiple-of-limit total makes one extra request returning zero and stops, `sort`/`orderBy` present and identical on every One Roster page request, and explicit `limit` present on `/applications`

### 4. Phase 2 — ClasslinkSection Model

- [ ] 4.1 Create `dashboard/app/models/sections/classlink_section.rb` as `ClasslinkSection < OmniAuthSection` with `CODE_PREFIX = 'CL-'`
- [ ] 4.2 Add a helper to parse `class_sourced_id` from `section.code` (format `CL-<TenantId>|<classSourcedId>`): strip the `CL-` prefix, then `split('|', 2)` — the limit is required, since a bare `split('|')` truncates a `classSourcedId` containing a pipe (design Decisions 1 and 2). The tenant component is parsed only for display or diagnostics — never used to resolve credentials, which come from `current_user`'s auth option per invariant I1. Unit-test that a `classSourcedId` containing a pipe round-trips
- [ ] 4.3 Implement `ClasslinkSection.from_service(class_sourced_id, tenant_id, owner_id, student_list, section_name)`:
  - Sets `code = "CL-#{tenant_id}|#{class_sourced_id}"` — the tenant, not the application id (design Decision 2). Normalize `tenant_id` with `to_s` so an integer and its string form produce the same code
  - Transforms One Roster student records into `OmniAuth::AuthHash` objects with `uid: "<TenantId>|<studentSourcedId>"` and `provider: 'classlink'`, carrying only `name: givenName` and `family_name: familyName`. **Do not pass `email`** even though ClassLink supplies it — `CleverSection.from_service` and `GoogleClassroomSection.from_service` both deliberately omit it for roster-imported students. No `dob` is available to pass
  - Calls `from_omniauth` with `type: Section::LOGIN_TYPE_CLASSLINK`
- [ ] 4.4 Register the login type in all three places it is duplicated. `dashboard/app/models/sections/section.rb:269` defines its constants **inline inside the `LOGIN_TYPES` array**, so adding `LOGIN_TYPE_CLASSLINK = 'classlink'.freeze` there registers both the constant and array membership in one edit. Then add `LOGIN_TYPE_CLASSLINK` to `LOGIN_TYPES_OAUTH` (`section.rb:278`), and add `classlink: 'classlink'` to `SECTION_LOGIN_TYPE` in `lib/cdo/shared_constants.rb:67` — the comment at `section.rb:268` requires these be kept in sync
- [ ] 4.4c Confirm the `LOGIN_TYPES_OAUTH` entry specifically, because omitting it fails in a non-obvious place: `section.rb:477` gates `ADD_STUDENT_RESTRICTED` on `LOGIN_TYPES_OAUTH.include?(login_type)`, so on a **restricted** ClassLink section every roster-imported student would be rejected while an unrestricted section worked fine. Add a test covering student addition to a restricted ClassLink section
- [ ] 4.4a Add `classlink` to the `defer_age` proc in `dashboard/app/models/concerns/user/age.rb:9` (currently `%w(google_oauth2 clever)`). Approved 2026-08-05. Without it, One Roster students — who carry no `birthDate` — fail the age-presence validation on create and raise an unrescued `ActiveRecord::RecordInvalid` that aborts the entire section import, not just the offending student
- [ ] 4.4b Verify the deferral actually fires for roster-imported students: the proc matches on `user.provider`, so confirm that value reads `'classlink'` at create time for a user built by `from_omniauth` with `provider: 'classlink'`. If it resolves through the authentication option rather than the legacy column, the list membership check may need to match on that instead
- [ ] 4.5 Write unit tests for `ClasslinkSection.from_service`, including that a student with no `dob` is created successfully with `age` nil and that one such student does not abort the import of the rest

### 5. Phase 2 — Backend Endpoints

- [ ] 5.1 Add `classlink_classrooms` action to `api_controller.rb`:
  - Extract `TenantId` and `SourcedId` from the teacher's v2 ClassLink auth option
  - Call `Clients::ClasslinkOneRoster.application_for_tenant(tenant_id)`
  - Call `teacher_classes` and return `{courses: [...]}`
  - Return appropriate error if the teacher has no v2 ClassLink auth option (not yet migrated)
- [ ] 5.2 Add `import_classlink_classroom` action to `api_controller.rb`, enforcing the authorization matrix (design Decision 5b):
  - Accept `courseId` (class `sourcedId`) and `courseName` params; derive `TenantId` and teacher `SourcedId` ONLY from `current_user`'s v2 auth option (never from params)
  - Whenever the requester is not already an instructor of the target section — including first import, where no section exists — verify teacher membership via a `classlink_teacher_for_course?` helper (checks requester's `SourcedId` against `class_teachers`); return 403 if not verified (generalizes `clever_teacher_for_course?` to first imports, since the partner credential provides no upstream scoping)
  - Requesters who are already section instructors proceed without re-verification (matches Clever)
  - Call `Clients::ClasslinkOneRoster.application_for_tenant` then `class_students`
  - Call `ClasslinkSection.from_service` with results
  - Return section summary JSON
- [ ] 5.3 Add routes: `GET /dashboardapi/classlink_classrooms`, `POST /dashboardapi/import_classlink_classroom`
- [ ] 5.4 Write controller tests for both endpoints, including co-teacher paths: verified co-teacher added as section instructor, unverified user gets 403
- [ ] 5.5 Write dedicated authorization tests (partner-credential threat model):
  - First import of a class the requester does not teach (SourcedId absent from `class_teachers`) → 403, no section created, no students enrolled
  - Sync attempt by an authenticated non-instructor who fails co-teacher verification → 403, section and roster unchanged
  - Request supplying forged tenant/application/SourcedId params → server-derived identity used; foreign values ignored
  - `courseId` from another district → not resolvable within requester's tenant application → error, no data returned
  - Instructor (owner and separately co-teacher) sync → succeeds without One Roster teacher verification call

### 6. Phase 2 — Frontend

- [ ] 6.1 Add `SectionLoginType.classlink` to the `OAuthSectionTypes` enum at `apps/src/accounts/constants.js:4`. This is what makes `setRosterProvider` work: `teacherSectionsRedux.ts:259-268` silently no-ops unless `OAuthSectionTypes[payload]` is truthy, so without this entry the roster provider is never set and the failure is invisible
- [ ] 6.2 **Do not hand-edit `SectionLoginType`** — it is generated from `SECTION_LOGIN_TYPE` in `lib/cdo/shared_constants.rb` by `apps/script/generateSharedConstants.rb:92`. Add the Ruby entry (task 4.4), regenerate, and `SectionLoginType.classlink` becomes available for 6.1 to reference. Ordering matters: 4.4 → regenerate → 6.1
- [ ] 6.3 Add ClassLink entries to `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`
- [ ] 6.3a Teach both `courseId` derivations about the ClassLink section-code format. `apps/src/accounts/SyncOmniAuthSectionControl.jsx:89` and `apps/src/templates/teacherDashboard/SectionActionDropdown.jsx:119` both do `sectionCode.replace(/^[GC]-/, '')` on the assumption that a section code is a prefix plus a bare course id. Two things break for ClassLink:
  - `/^[GC]-/` **does not match `CL-`** — after `C` the pattern requires `-` but finds `L` — so nothing is stripped and the full code is sent as `courseId`.
  - Even with the prefix removed, `CL-<TenantId>|<classSourcedId>` is a compound, not a course id.
    Send **only the portion after the `|`** (the class `sourcedId`). Do not send the tenant: the server derives it from `current_user` per invariant I1. Add a unit test per call site asserting a ClassLink code yields just the `sourcedId`
- [ ] 6.3b Update the now-inaccurate comment above both derivations ("Section code is the course ID, without the G- or C- prefix") — it states an invariant ClassLink breaks, and leaving it is how the next provider inherits the same bug
- [ ] 6.4 Add a "Import via ClassLink" trigger in the teacher section creation UI (matching Clever's entry point)
- [ ] 6.5 Add a `case OAuthSectionTypes.classlink` branch to the title and login-type switch in `apps/src/templates/teacherDashboard/RosterDialog.jsx:263-272`. The switch has **no default branch**, so without this the dialog renders an empty `<h2>` — a silent failure that looks like a styling bug
- [ ] 6.6 Add the i18n strings for the failure states (see the spec requirement "Each rostering failure state has specific user-facing copy"):
  - district not enabled / non-expiry 401 — "Your district hasn't enabled roster sync for CodeAI." **One key serves both states**; they are indistinguishable to the teacher and the distinction stays in the logs
  - teacher not yet migrated — "Please sign in again from ClassLink to proceed with roster sync."
  - any unexpected failure without its own copy, including a transient 500 or a 429 — "We're having trouble getting roster information from ClassLink. Please try again later." Wire this as the fallback too, so no failure path renders an empty dialog
  - class with no students — "This section (%{section_name}) has no students." (needs an interpolation placeholder)
- [ ] 6.7 Verify `RosterDialog` and `SectionActionDropdown` work correctly with the new provider (no structural changes expected)
- [ ] 6.8 Run `yarn run typecheck` and `./tools/hooks/pre-commit` to confirm no type or lint errors

### 7. Phase 2 — Integration Testing

- [ ] 7.1 Test full import flow end-to-end against ClassLink sandbox: authenticate as teacher → list classes → import a class → verify section and students created correctly
- [ ] 7.2 Test re-sync: add a student in the sandbox → sync → verify student added to section
- [ ] 7.3 Test re-sync: remove a student in the sandbox → sync → verify student removed from section
- [ ] 7.4 Test error case: teacher without a v2 auth option sees appropriate re-login prompt
- [ ] 7.5 Test error case: teacher's district not in `/applications` response sees appropriate error message
- [ ] 7.6 Test co-teacher flow: second teacher listed on the class in the sandbox imports the already-imported class → added as co-teacher; a teacher not listed on the class gets 403
- [ ] 7.7 Test authorization end-to-end against the sandbox: authenticated teacher attempts first import of a valid `courseId` they do not teach → 403 and no section created

## PR 4 — Migration cleanup

Separated from PR 3 by an **observation window**, not by review scope. Task 8.1 is the gate:
until the count of v1-only users is effectively zero, removing the dual-match fallback locks
those users out of their accounts. Do not merge this on a schedule; merge it on that number.

Note the ordering constraint inside this PR — 8.2 and 8.3 remove the login path that produces
v2 records, so anyone still holding only a v1 record after that point has no route back. That
is why 8.4 (deleting v1 records) is last and follows its own observation window.

### 8. Phase 3 — Migration Cleanup

- [ ] 8.1 Confirm all active ClassLink users have v2 auth options (query count of v1-only users). **This is PR 4's merge gate** — not a checklist item to tick off in passing. Removing the dual-match fallback while v1-only users remain locks them out
- [ ] 8.2 Remove dual-match login fallback from `omniauth_callbacks_controller.rb`
- [ ] 8.3 Remove login-time v2-creation logic from the callback (builder service remains for the record)
- [ ] 8.4 Retire v1 ClassLink auth options (delete after an observation window)
- [ ] 8.5 Update and run tests to confirm no regressions
- [ ] 8.6 Deploy Phase 3
