# Implementation tasks

Delivered as **two stacked PRs**. Task and section numbers are stable and referenced from
`design.md`, so they survive regrouping: sections 2 (bulk migration script) and 8 (migration
cleanup) are **retired rather than renumbered** — their headings remain below with a note on
why, so stale references resolve to an explanation instead of dangling.

Two axes are in play and they are not the same thing. **PRs** are units of review. **Phases**
are units of deployment, defined in the design's Migration Plan.

| PR  | Scope                                                                  | Sections | Deployment phase | Depends on |
| --- | ---------------------------------------------------------------------- | -------- | ---------------- | ---------- |
| 1   | Sign-in and sign-up handle both v1 and v2 `authentication_id` formats  | 1        | Phase 1          | —          |
| 2   | Rostering: client, model, endpoints, frontend, integration tests       | 3–7      | Phase 2          | PR 1       |

The gap between the two deployments is load-bearing: it is the window in which routine SSO
logins converge active users in OneRoster-enabled districts to v2, and that convergence is
the only duplicate-student mitigation left now that the bulk script is dropped (design Risks).

## PR 1 — Sign-in and sign-up handle both v1 and v2 formats

No user-visible change. Establishes the identifier rostering depends on, and begins
login-time migration of existing users the moment it deploys — but only for users whose SSO
payload carries a `SourcedId`. ClassLink documents that field as **empty for districts
without OneRoster enabled** (design Context), so those users sign up and sign in on the
legacy v1 format permanently; a blank `SourcedId` is the routing branch to that path, not an
anomaly.

Rollback is non-lossy for users who still hold a v1 record, and **not** for users who sign up
or connect ClassLink from Manage Linked Accounts after this deploys with a `SourcedId`
present — their v2 record is their only auth option. See the design's Rollback note.

### 1. Phase 1 — ID Migration: Versioned Auth Options and Callback Updates

- [x] 1.1 ~~Confirm the live `v2/my/info` payload shape~~ — done. Two live responses captured, plus a logged production auth hash confirming the gem exposes `info[:external_id]` and `info[:district_id]`
- [x] 1.2 Add `AuthenticationOption::Classlink::VERSION = {v2: 'v2'}.freeze` constant (mirrors `AuthenticationOption::Clever::VERSION`)
- [x] 1.3 Create `Services::Classlink::V2AuthOptionBuilder` (mirrors `Services::Clever::V3AuthOptionBuilder`): finds the v1 auth option, dups it, sets `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`; returns nil if the v1 option is missing or a v2 option already exists
- [x] 1.3a Validate the components asymmetrically before constructing `authentication_id` (design Decision 1): both must be non-blank after `to_s`, and `TenantId` must additionally contain no pipe. Do **not** reject a pipe in `SourcedId` — it is a legal SIS value and first-pipe splitting handles it. On failure build nothing, log the `UserId`, and let login fall back to the v1 path. A blank `SourcedId` would otherwise produce `"<TenantId>|"` for every user in that tenant and collide them onto one auth option. _Logging semantics narrowed by 1.11: a blank `SourcedId` is the documented non-OneRoster state and must no longer report_
- [x] 1.3c Parse `authentication_id` with `split('|', 2)` everywhere it is decomposed — never a bare `split('|')`, which truncates a `SourcedId` containing a pipe. The limit is what makes the format unambiguous, given `TenantId` cannot contain one (design Decision 1)
- [x] 1.3b Normalize `TenantId` with `to_s` wherever it is compared or joined — `v2/my/info` returns it as an integer while `/applications` returns `tenant_id`; an unnormalized cache key or comparison misses across the two
- [x] 1.4 Write unit tests for the builder (created, idempotent-nil, missing-v1-nil cases) plus the 1.3a/1.3c behavior: blank `SourcedId` builds nothing, blank `TenantId` builds nothing, pipe-containing `TenantId` builds nothing, and — the case that pins the design — a pipe-containing `SourcedId` **does** build and round-trips through `split('|', 2)` to the original value. Also: integer `TenantId` normalizes to the same id as its string form
- [x] 1.5 Extract `TenantId` and `SourcedId` in the callback from the gem's `info[:district_id]` and `info[:external_id]` rather than digging `raw_info` (see design Context)
- [x] 1.6 Update the ClassLink sign-up path: new accounts get `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`. _Now conditional: only when the payload carries a `SourcedId`. With it blank, the uid rewrite never happens and `version_for` stamps nil, so the signup lands on the v1 format mechanically — 1.13 pins that branch with tests_
- [x] 1.7 Add dual-match login logic: try lookup by v2-format `authentication_id` first, fall back to legacy `UserId` lookup
- [x] 1.8 When a user is found via the legacy fallback, create their v2 auth option via the builder (login-time migration; v1 record untouched)
- [x] 1.9 Write unit tests for the updated callback and dual-match logic (v2 login, v1 fallback + v2 creation, both-records login creates nothing)
- [x] 1.9a Extend the v2 handling to `connect_provider` (Manage Linked Accounts → Connect): run the uid rewrite before the connect branch so the holder lookup, takeover checks, and new-auth-option creation all operate on v2 ids, and stamp `version` via `version_for` so a legacy-format fallback isn't mislabeled v2. Without this the v1-format holder lookup misses v2-only accounts (any post-deploy signup) and a second account could link the same credential. Tests: fresh connect creates a v2 option, invalid components fall back to v1 with nil version, connecting a credential the current user holds as v1 migrates it and no-ops, a v2-only holder with activity is refused
- [x] 1.9b Use byte-exact id matching (merged separately: `classlink` is in `AuthenticationOption::CASE_SENSITIVE_CREDENTIAL_TYPES`, so `User.find_by_credential` confirms ClassLink matches byte-for-byte by default — the column collation ignores case, SIS-authored `SourcedId`s don't). Every lookup in this PR inherits that automatically; the one manual piece is the builder, whose direct `AuthenticationOption` queries use `find_by_exact_credential`, most critically the v2 idempotency check — under the collation, a case-twin's record would block a user's v2 option from ever being built. Test: a v2 option differing only by case does not block building
- [x] 1.11 Reclassify a blank `SourcedId` in `Services::Classlink::AuthIdGenerator` as the documented non-OneRoster state: return nil **without** reporting to Sentry when `sourced_id` is blank after `to_s`. Keep the `Observability::Errors.report` for the shapes that have no documented meaning — `SourcedId` present but `TenantId` blank, or `TenantId` containing a pipe. As written, the generator reports every nil, which would page on routine traffic from every non-OneRoster district at every sign-in. Update the generator's comment, which currently promises a report on every failure. _Done: the blank-`sourced_id` check now precedes and short-circuits the tenant checks, so a blank `SourcedId` suppresses reporting even when `TenantId` is also malformed (spec scopes the anomaly requirement to "When `SourcedId` is present"). The now-always-false `sourced_id_blank` context key was dropped_
- [x] 1.12 Sweep the transition-era comments now that v1 is permanent: `apply_classlink_v2_authentication_id` in `omniauth_callbacks_controller.rb` justifies its error report by "the Phase 3 cleanup gate needs to know why" — there is no Phase 3; the report survives on its own merits (a population silently failing v2 creation should be visible). Reword any "migration window" phrasing in callback, builder, and model comments to say the fallback is a permanent path for non-OneRoster districts. _Done, and wider than the callback/builder/model: also the `legacy_user` local (renamed `v1_user`), the `VERSION` constant's missing-`:v1` rationale, the ClassLink factory comment, and stale test names/comments in `classlink_test.rb`, `omniauth_callbacks_controller_test.rb`, `authentication_option_test.rb`, and the builder test_
- [x] 1.13 Write unit tests for the permanent-v1 paths: sign-up with blank `external_id` creates a v1-format record (`authentication_id = <UserId>`, `version` nil) exactly as before this change; sign-in of an existing v1 user with blank `external_id` succeeds via the `UserId` lookup, creates no v2 option, and reports nothing to Sentry; blank `TenantId` with `SourcedId` present, and pipe-bearing `TenantId`, still report. _Done. Verified non-vacuous: the five new reporting assertions in `auth_id_generator_test.rb` fail against the pre-1.11 generator. Also pinned the precedence case (blank `SourcedId` + malformed `TenantId` reports nothing) and added the `connect_provider` no-`SourcedId` path_
### 1b. Phase 1 — Give every account a UserId record (ships before 1.10)

Follows PR 1, which is already merged. Closes the reverse-direction gap: a signup from an
OneRoster-enabled district gets a v2 auth option as its *only* credential, and a v2-only account is
unrecoverable if its `SourcedId` ever stops arriving or changes — we would know exactly who the user is at
sign-in and have nothing keyed to look them up by (design Decision 7a). Must merge before 1.10, which is
what creates the first exposed accounts.

- [x] 1b.1 Add the v1-record write to `apply_classlink_v2_authentication_id`, mirroring the existing login-time v2 creation at the same seam: when the v2-format lookup finds a user and that user holds no v1 ClassLink auth option, create one with `authentication_id = <UserId>` (the pre-rewrite `auth.uid`) and `version` nil. Leave the v2 record untouched
- [x] 1b.1a Skip the v1-record write on the connect path (`unless should_connect_provider?`). The account found at this seam during a connect is the credential holder, not `current_user`, and that request may go on to refuse the connect or to destroy the holder in a takeover; a refused connect must not mutate a third party's records. Caught by the existing `connect_provider: refuses classlink credential held by a v2-only account with activity` test
- [x] 1b.2 Put the record-building in a service object beside `V2AuthOptionBuilder` rather than inline in the controller (`Services::Classlink::V1AuthOptionBuilder`, or extend the existing one), so both directions of the pair are built the same way and are unit-testable without the callback. Use `find_by_exact_credential` for its idempotency check, per 1.9b — the column collation is case-insensitive and `UserId` is not
- [x] 1b.3 Writing the v1 record must never break a sign-in that would otherwise succeed. `UserId` is globally unique so a collision should be impossible, but if the insert fails (another account already holds that `UserId`, or a concurrent sign-in raced it) report it and continue signing the user in against the record that matched. A failure here costs a safety net; raising would cost the session
- [x] 1b.4 Unit-test the builder: creates the v1 option for a v2-only user; returns nil (no duplicate) when a v1 option already exists; a v1 option differing only by case does not count as existing
- [x] 1b.5 Integration-test the durability property end to end, which is the point of the whole task: sign in a v2-only user (payload carries `SourcedId`) and assert a v1 option is created; then sign in **again with an empty `SourcedId`** and assert the same user is found, no new `User` or `AuthenticationOption` is created, and nothing is reported. Add the negative control too — that second sign-in against a v2-only account (the write removed) must create a duplicate `User`, or the test is not proving anything. _Both live in `classlink_test.rb`: "a v2-only account given its v1 record at sign-in survives losing its SourcedId" runs the two-login sequence on one account, so the second login is served by the record the first login's builder actually wrote rather than a factory-inserted stand-in; "without the v1 record a v2-only account is lost when SourcedId stops arriving" stubs the builder to nil and asserts the second login is routed to sign-up instead. Verified: suppressing the write fails the first and leaves the second passing, which is the correct signature for a negative control_
- [x] 1b.6 Test the changed-`SourcedId` path: a user holding v1 + v2 signs in with a *different* `SourcedId`; the `UserId` lookup finds them, and login-time migration adds a v2 option for the new id
- [x] 1b.7 Confirm the rostering gate is unaffected: Decision 6a keys on *presence* of a v2 option, so it must keep working now that every such user also holds a v1 option. Verify the gate is not written as "the user's only option is v2". _Confirmed against the spec and task 6.4a: both say "holds a ClassLink auth option with `version = 'v2'`", which is presence. Nothing to change, but re-check when 6.4a is implemented_
- [ ] 1b.8 Add monitoring for the count of ClassLink users holding a v2 option and no v1 option. It should trend to zero; a rising number means sign-ins are not converging as Decision 7a assumes, and the signup-window fix below becomes worth doing
- [ ] 1b.9 _Deferred, not required:_ close the remaining window by giving the ClassLink signup both auth options up front via `authentication_options_attributes` (which `Policies::User.user_attributes` already round-trips). Deferred because it means threading the `UserId` through `migrate_to_multi_auth`, a shared signup path with a DCDO-gated alternate implementation, to remove an exposure of one login cycle

- [ ] 1.10 Deploy Phase 1 to production

## Retired: PR for the one-time bulk migration script

### 2. Bulk Migration Script — RETIRED, do not implement

Dropped when ClassLink's docs established that `SourcedId` is empty for districts without
OneRoster enabled (design Decision 7 and the Settled section). The script's purpose was to
converge v1-only records so the dual-match fallback could be removed; with v1 permanent that
end state does not exist, and the script cannot distinguish "unmigratable by design" from
"stored token no longer honored" without calling `v2/my/info` per user. Login-time migration
is the only migration mechanism. The script written on the feature branch is dropped, not
merged. Section number retired so design references stay resolvable; former tasks 2.1–2.6
deleted.

## PR 2 — Rostering: One Roster client, section model, endpoints, and frontend

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

- [x] 3.1 Create `dashboard/lib/clients/classlink_one_roster.rb` with methods (all collection methods paginate via the 3.2 helper):
  - `fetch_applications` — calls `/applications` with `CDO.classlink_roster_api_key`, returns list
  - `application_for_tenant(tenant_id)` — cache-aside lookup (see 3.3); on miss, calls `fetch_applications` and selects the record matching `tenant_id` (string-compared) with `enabled == 'true'` and `tenant_status == 'Active'`. Reads records from the `applications` envelope key; raises if that key is absent or not an array; logs a warning (does not raise) on a well-formed empty array; logs the top-level `status` when it is not 1 but never branches on it. Caches `bearer` and `oneroster_application_id` — **not** `id` or `application_id`, which are different fields and would produce an invalid request path
  - `teacher_classes(oneroster_application_id, bearer, teacher_sourced_id)` — calls `/teachers/<SourcedId>/classes`, reads records from the `classes` envelope key, and uses each class's `title` as the display/section name (`classCode` and `periods` are empty and carry no period information)
  - `class_students(oneroster_application_id, bearer, class_sourced_id)` — calls `/classes/<classSourcedId>/students`, filters `role == "student"` (lowercase, confirmed)
  - `class_teachers(oneroster_application_id, bearer, class_sourced_id)` — calls `/classes/<classSourcedId>/teachers` (used for co-teacher verification); endpoint confirmed to exist 2026-08-03
  - All three read records from the **`users`** envelope key, not a key named after the endpoint

  _Implemented. The proxy host is `https://oneroster-proxy.apis.classlink.com`, confirmed against a live capture request (2026-09)_
- [x] 3.1a Compare ClassLink string-booleans explicitly against `'true'` — `enabledUser` (user records) and `enabled` (`/applications`) are the strings `"true"`/`"false"`, and `"false"` is truthy in Ruby, so `if record['enabledUser']` passes for a disabled user
- [x] 3.1b Never follow `href` values from One Roster response bodies (`orgs[].href` points at a different host, e.g. `certs-nj-v2.rosterserver.com`) — always construct URLs through the proxy with the district bearer, or the credential path is bypassed
- [x] 3.1c Extract only `sourcedId`, `givenName`, `familyName`, and `role` from One Roster user records, and never log raw payloads — they carry `password`, `sms`, `phone`, `middleName`, `email`, and an `agents[]` array that on student records references their **guardians**. Match users on `sourcedId` only, never the separate `identifier` or `userIds[]` entries, and never follow `agents[]` or `orgs[]` hrefs
- [x] 3.1d Build request paths with two different escaping policies (design Decision 3a): interpolate `oneroster_application_id` **verbatim** as an opaque pre-escaped literal (re-encoding makes `%2F` into `%252F` and fails opaquely), but URL-escape every `sourcedId` segment — district-supplied ids are arbitrary strings, not digits (`7_1553`, `FY` observed). Unit-test both: an application id containing `%2F` survives unchanged, and a `sourcedId` containing a URL-significant character is escaped — cover `|` specifically (`%7C`; it is neither reserved nor unreserved under RFC 3986), since Decision 1 admits it as a legal `sourcedId` character
- [x] 3.2 Implement a shared pagination helper used by all collection methods (design Decision 3a): request with `limit=PAGE_LIMIT` (constant, 1000) and `offset=0`, plus `sort=sourcedId&orderBy=asc` on the One Roster collections, sent identically on every page. Validate each response structurally before reading it — the expected envelope key (`users`, `classes`, `applications`) must be present and an array, else raise; this is what catches an HTTP 200 carrying an error envelope, without depending on knowing its format. Accumulate each page, then stop when **any** of: the page returned fewer than `limit` records (short page = last page); the page returned zero records; or `x-total-count` is present and the running total has reached it. Termination must not require the count headers — `/applications` sends none. A paginated response is a normal outcome, never an error
- [x] 3.2a Route `/applications` through the same helper at the same `PAGE_LIMIT = 1000`. It honors `limit`/`offset` (both verified) but returns **no `x-count` or `x-total-count`** (despite advertising `access-control-expose-headers: x-total-count`), so the short-page condition is its only terminator. Do **not** raise its limit toward the accepted 10000: with no count header to cross-check, a silently clamped response is indistinguishable from a final short page (design Decision 3a). ~630 districts already exceed the OneRoster default limit of 100, and a truncated district list makes real districts look like ClassLink rostering is disabled for them
- [x] 3.2b ~~Verify the ordering is stable~~ — done 2026-08-03. `sort=sourcedId` with `orderBy=asc` vs `desc` returns exact reverses, ascending by `sourcedId` under `asc`, so the proxy applies a deliberate total order over a unique key. Use the IMS spelling `desc`, not `dsc` (silently discarded)
- [x] 3.3 Implement cache-aside for `application_for_tenant`: namespaced `read_cache`/`write_cache` helpers over `CDO.shared_cache` keyed by `tenant_id`, JSON-serialized values, 5-day TTL (follow `lti_v1_controller.rb` pattern)
- [x] 3.4 Implement 401 recovery flow: on One Roster 401, re-fetch `/applications`; if fresh bearer differs from cached, update cache and retry the original request once; if it matches (or the retry also 401s), raise an error that surfaces a user-facing message (copy TBD)
- [x] 3.5 Add `CDO.classlink_roster_api_key` to config. **Production only** declares it as `!Secret`, and the secret must be provisioned **before** it is declared — `CDO` is frozen at boot and raises on undefined keys, and `config.ru` eager-loads declared secrets outside development, so declaring ahead of provisioning fails boot. Staging, test, and adhoc get a literal empty string (decided 2026-08-10), which has no secret to provision and so no boot-order risk. _Implemented as a `''` default in the root `config.yml.erb` (every property needs a default there, and the default covers development/staging/test/adhoc in one line). The production `!Secret` override in `config/production.yml.erb` is deliberately NOT in this PR: it must land in a follow-up after the secret is provisioned, or production boot fails. Until then production behaves like non-production — rostering unavailable_
- [x] 3.5a Guard on `CDO.classlink_roster_api_key.present?`, never `.nil?` — non-production holds `""`, and a `nil?` check would pass it through and call `/applications` with an empty key. A blank key resolves to the same rostering-unavailable outcome as a district with no enabled application; it must not raise at boot or on any unrelated page
- [x] 3.5b Note for the test plan, not a code task: with no partner key and no ClassLink SSO in non-production, the rostering flow cannot be exercised end-to-end before release — no UI test coverage, no manual QA. The stubbed-HTTP unit tests (3.6, 3.6a, 3.7, 3.9) are the entire safety net rather than a supplement, and should be reviewed with that in mind
- [x] 3.6 Write unit tests for the One Roster client (stub HTTP calls), covering cache hit, cache miss, 401-with-stale-token retry, 401-with-matching-token error, retry-also-fails error
- [x] 3.6a Write unit tests for application selection: missing or non-array `applications` key raises; well-formed empty array warns without raising; a `status` other than 1 is logged but does **not** change the outcome; `enabled: "false"` is rejected despite being a truthy string; `tenant_status` other than `Active` is rejected; a well-formed list not containing the tenant yields the rostering-unavailable path rather than an error; integer `tenant_id` matches a string-form lookup; the cached path segment is `oneroster_application_id` and never `id` or `application_id`
- [x] 3.7 Write unit tests for pagination: a 200 response whose collection key is missing or non-array raises (the success-shaped-failure case), single page (count below limit → one request), multi-page stitch (records combined across pages, offsets increment by limit), short final page ends the loop, **multi-page fetch with no count headers at all terminates correctly on the short page** (the `/applications` case), empty-page safety break despite `x-total-count` claiming more, exact-multiple-of-limit total makes one extra request returning zero and stops, `sort`/`orderBy` present and identical on every One Roster page request, and explicit `limit` present on `/applications`

### 4. Phase 2 — ClasslinkSection Model

- [x] 4.1 Create `dashboard/app/models/sections/classlink_section.rb` as `ClasslinkSection < OmniAuthSection` with `CODE_PREFIX = 'CL-'`
- [x] 4.2 Add a helper to parse `class_sourced_id` from `section.code` (format `CL-<TenantId>|<classSourcedId>`): strip the `CL-` prefix, then `split('|', 2)` — the limit is required, since a bare `split('|')` truncates a `classSourcedId` containing a pipe (design Decisions 1 and 2). The tenant component is parsed only for display or diagnostics — never used to resolve credentials, which come from `current_user`'s auth option per invariant I1. Unit-test that a `classSourcedId` containing a pipe round-trips
- [x] 4.3 Implement `ClasslinkSection.from_service(class_sourced_id, tenant_id, owner_id, student_list, section_name)`:
  - Sets `code = "CL-#{tenant_id}|#{class_sourced_id}"` — the tenant, not the application id (design Decision 2). Normalize `tenant_id` with `to_s` so an integer and its string form produce the same code
  - Transforms One Roster student records into `OmniAuth::AuthHash` objects with `uid: "<TenantId>|<studentSourcedId>"` and `provider: 'classlink'`, carrying only `name: givenName` and `family_name: familyName`. **Do not pass `email`** even though ClassLink supplies it — `CleverSection.from_service` and `GoogleClassroomSection.from_service` both deliberately omit it for roster-imported students. No `dob` is available to pass
  - Calls `from_omniauth` with `type: Section::LOGIN_TYPE_CLASSLINK`
- [x] 4.4 Register the login type in all three places it is duplicated. `dashboard/app/models/sections/section.rb:269` defines its constants **inline inside the `LOGIN_TYPES` array**, so adding `LOGIN_TYPE_CLASSLINK = 'classlink'.freeze` there registers both the constant and array membership in one edit. Then add `LOGIN_TYPE_CLASSLINK` to `LOGIN_TYPES_OAUTH` (`section.rb:278`), and add `classlink: 'classlink'` to `SECTION_LOGIN_TYPE` in `lib/cdo/shared_constants.rb:67` — the comment at `section.rb:268` requires these be kept in sync
- [x] 4.4c Confirm the `LOGIN_TYPES_OAUTH` entry specifically, because omitting it fails in a non-obvious place: `section.rb:477` gates `ADD_STUDENT_RESTRICTED` on `LOGIN_TYPES_OAUTH.include?(login_type)`, so on a **restricted** ClassLink section every roster-imported student would be rejected while an unrestricted section worked fine. Add a test covering student addition to a restricted ClassLink section
- [x] 4.4a Add `classlink` to the `defer_age` proc in `dashboard/app/models/concerns/user/age.rb:9` (currently `%w(google_oauth2 clever)`). Approved 2026-08-05. Without it, One Roster students — who carry no `birthDate` — fail the age-presence validation on create and raise an unrescued `ActiveRecord::RecordInvalid` that aborts the entire section import, not just the offending student
- [x] 4.4b Verify the deferral actually fires for roster-imported students: the proc matches on `user.provider`, so confirm that value reads `'classlink'` at create time for a user built by `from_omniauth` with `provider: 'classlink'`. If it resolves through the authentication option rather than the legacy column, the list membership check may need to match on that instead
- [x] 4.5 Write unit tests for `ClasslinkSection.from_service`, including that a student with no `dob` is created successfully with `age` nil and that one such student does not abort the import of the rest

### 5. Phase 2 — Backend Endpoints

- [x] 5.1 Add `classlink_classrooms` action to `api_controller.rb`:
  - Extract `TenantId` and `SourcedId` from the teacher's v2 ClassLink auth option
  - Call `Clients::ClasslinkOneRoster.application_for_tenant(tenant_id)`
  - Call `teacher_classes` and return `{courses: [...]}`
  - Return appropriate error if the teacher has no v2 ClassLink auth option — whether unmigrated, in a non-OneRoster district, or holding no ClassLink credential at all (an email-invited co-teacher); the UI gate (6.4a) hides the entry point but this endpoint must not rely on it
- [x] 5.2 Add `import_classlink_classroom` action to `api_controller.rb`, enforcing the authorization matrix (design Decision 5b):
  - Accept `courseId` (class `sourcedId`) and `courseName` params; derive `TenantId` and teacher `SourcedId` ONLY from `current_user`'s v2 auth option (never from params)
  - Whenever the requester is not already an instructor of the target section — including first import, where no section exists — verify teacher membership via a `classlink_teacher_for_course?` helper (checks requester's `SourcedId` against `class_teachers`); return 403 if not verified (generalizes `clever_teacher_for_course?` to first imports, since the partner credential provides no upstream scoping)
  - Requesters who are already section instructors proceed without re-verification (matches Clever)
  - Call `Clients::ClasslinkOneRoster.application_for_tenant` then `class_students`
  - Call `ClasslinkSection.from_service` with results
  - Return section summary JSON
- [x] 5.3 Add routes: `GET /dashboardapi/classlink_classrooms`, `POST /dashboardapi/import_classlink_classroom`. _The GET comes from the existing ApiController wildcard; the import is POST-only — it is subtracted from the GET wildcard in routes.rb, since a GET route would skip Rails CSRF verification. The frontend posts via the page-global jQuery, which `jquery_ujs` patches with the CSRF header (Clever/Google imports stay GET, unchanged)_
- [x] 5.4 Write controller tests for both endpoints, including co-teacher paths: verified co-teacher added as section instructor, unverified user gets 403
- [x] 5.5 Write dedicated authorization tests (partner-credential threat model):
  - First import of a class the requester does not teach (SourcedId absent from `class_teachers`) → 403, no section created, no students enrolled
  - Sync attempt by an authenticated non-instructor who fails co-teacher verification → 403, section and roster unchanged
  - Request supplying forged tenant/application/SourcedId params → server-derived identity used; foreign values ignored
  - `courseId` from another district → not resolvable within requester's tenant application → error, no data returned
  - Instructor (owner and separately co-teacher) sync → succeeds without One Roster teacher verification call

### 6. Phase 2 — Frontend

- [x] 6.1 Add `SectionLoginType.classlink` to the `OAuthSectionTypes` enum at `apps/src/accounts/constants.js:4`. This is what makes `setRosterProvider` work: `teacherSectionsRedux.ts:259-268` silently no-ops unless `OAuthSectionTypes[payload]` is truthy, so without this entry the roster provider is never set and the failure is invisible
- [x] 6.2 **Do not hand-edit `SectionLoginType`** — it is generated from `SECTION_LOGIN_TYPE` in `lib/cdo/shared_constants.rb` by `apps/script/generateSharedConstants.rb:92`. Add the Ruby entry (task 4.4), regenerate, and `SectionLoginType.classlink` becomes available for 6.1 to reference. Ordering matters: 4.4 → regenerate → 6.1
- [x] 6.3 Add ClassLink entries to `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`
- [x] 6.3a Teach both `courseId` derivations about the ClassLink section-code format. `apps/src/accounts/SyncOmniAuthSectionControl.jsx:89` and `apps/src/templates/teacherDashboard/SectionActionDropdown.jsx:119` both do `sectionCode.replace(/^[GC]-/, '')` on the assumption that a section code is a prefix plus a bare course id. Two things break for ClassLink:
  - `/^[GC]-/` **does not match `CL-`** — after `C` the pattern requires `-` but finds `L` — so nothing is stripped and the full code is sent as `courseId`.
  - Even with the prefix removed, `CL-<TenantId>|<classSourcedId>` is a compound, not a course id.
    Send **only the portion after the `|`** (the class `sourcedId`). Do not send the tenant: the server derives it from `current_user` per invariant I1. Add a unit test per call site asserting a ClassLink code yields just the `sourcedId`
- [x] 6.3b Update the now-inaccurate comment above both derivations ("Section code is the course ID, without the G- or C- prefix") — it states an invariant ClassLink breaks, and leaving it is how the next provider inherits the same bug
- [x] 6.4 Add a "Import via ClassLink" trigger in the teacher section creation UI (matching Clever's entry point)
- [x] 6.4a Gate that entry point on a v2 auth option (design Decision 6a): in `dashboard/app/views/teacher_dashboard/show.html.haml:35`, include `classlink` in `teacher_dashboard_data[:providers]` only when `@current_user` holds a ClassLink auth option with `version = 'v2'`. Leave `User#providers` itself unchanged — the redux `providers` list this payload feeds has exactly one consumer (`LoginTypePicker.jsx`), so this one filter is the whole gate, and the ClassLink entry then appears/disappears through the same `providers.includes` check that gates Clever. Tests: v2 holder gets `classlink` in the payload; v1-only holder does not; the backend endpoints still error independently for a no-v2 requester (task 5.1) — the gate is visibility, not authorization
- [x] 6.5 Add a `case OAuthSectionTypes.classlink` branch to the title and login-type switch in `apps/src/templates/teacherDashboard/RosterDialog.jsx:263-272`. The switch has **no default branch**, so without this the dialog renders an empty `<h2>` — a silent failure that looks like a styling bug
- [x] 6.6 Add the i18n strings for the failure states (see the spec requirement "Each rostering failure state has specific user-facing copy"):
  - district not enabled / non-expiry 401 — "Your district hasn't enabled roster sync for CodeAI." **One key serves both states**; they are indistinguishable to the teacher and the distinction stays in the logs
  - requester has no v2 auth option — "Please sign in again from ClassLink to proceed with roster sync." The UI gate (6.4a) makes this unreachable from the section-setup entry point, but the state still arrives at the endpoints: direct API calls, a page loaded before the user's v2 option existed, and a co-teacher added to a ClassLink section by email invitation who triggers the section-row sync action (rendered per-section by login type, not per-user by credential)
  - any unexpected failure without its own copy, including a transient 500 or a 429 — "We're having trouble getting roster information from ClassLink. Please try again later." Wire this as the fallback too, so no failure path renders an empty dialog
  - ~~class with no students — "This section (%{section_name}) has no students."~~ — dropped 2026-09-03; an empty roster is applied, not refused (see the note below)

  _Implemented: the strings live in `dashboard/config/locales/base/en.yml` under `classlink_rostering` and are sent as the error JSON's message; the RosterDialog classlink case renders the server message and falls back to an apps-i18n copy of the generic string when none arrives. The no-students copy was implemented and then removed (decided 2026-09-03): an empty roster is applied like any other — first import creates the section with no students, sync to zero unenrolls everyone — matching the retired roster-shrink guard's reasoning that ClassLink is the source of truth and a later correct sync restores membership. The spec scenario was updated to match_
- [x] 6.7 Verify `RosterDialog` and `SectionActionDropdown` work correctly with the new provider (no structural changes expected)
- [x] 6.8 Run `yarn run typecheck` and `./tools/hooks/pre-commit` to confirm no type or lint errors

### 7. Phase 2 — Integration Testing

- [ ] 7.1 Test full import flow end-to-end against ClassLink sandbox: authenticate as teacher → list classes → import a class → verify section and students created correctly
- [ ] 7.2 Test re-sync: add a student in the sandbox → sync → verify student added to section
- [ ] 7.3 Test re-sync: remove a student in the sandbox → sync → verify student removed from section
- [ ] 7.4 Test the no-v2 gate from both sides: a teacher without a v2 auth option sees no ClassLink entry in section setup (providers payload omits it), and a direct request to the rostering endpoints as that teacher returns the no-v2 error rather than data
- [ ] 7.5 Test error case: teacher's district not in `/applications` response sees appropriate error message
- [ ] 7.6 Test co-teacher flow: second teacher listed on the class in the sandbox imports the already-imported class → added as co-teacher; a teacher not listed on the class gets 403
- [ ] 7.7 Test authorization end-to-end against the sandbox: authenticated teacher attempts first import of a valid `courseId` they do not teach → 403 and no section created

## Retired: PR for migration cleanup

### 8. Migration Cleanup — RETIRED, do not implement

There is no cleanup phase. The dual-match fallback and the v1 records it serves are permanent:
the legacy `UserId` path is the only login path for districts without OneRoster enabled, and
new v1-format signups continue there indefinitely (design Decision 7). The old merge gate —
"count of v1-only users is effectively zero" — is not merely unmet but unmeasurable: a v1
record stores only `UserId`, so it cannot say whether its holder is unmigrated or unmigratable.
Removing the fallback would lock every non-OneRoster district out of their accounts. Section
number retired so design references stay resolvable; former tasks 8.1–8.6 deleted.
