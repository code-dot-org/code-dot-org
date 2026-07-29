## Context

ClassLink SSO is live as of early 2026. The OmniAuth callback currently stores a ClassLink user's `UserId` as `AuthenticationOption.authentication_id`. The One Roster API identifies users by `SourceId` (per-tenant, not globally unique), which is a different value. Rostering requires `SourceId` and `TenantId` to be available on each user record.

ClassLink One Roster uses a **central partner credential model**: our server-side API key fetches per-district credentials from a `/applications` proxy endpoint, then uses those district credentials to call the One Roster API on behalf of a teacher. This differs from Clever and Google Classroom, which use the teacher's own OAuth token.

**Casing conventions across ClassLink APIs (inconsistent by design):**
| Context | TenantId field | SourceId field |
|---------|---------------|----------------|
| OmniAuth / OAuth callback | `TenantId` | `SourceId` |
| `/applications` response | `tenant_id` | — |
| One Roster class/students endpoints | — | `sourceId` |

## Goals / Non-Goals

**Goals:**

- Teachers in ClassLink districts can import their One Roster classes as code.org sections
- Teachers can re-sync existing ClassLink sections to update the student roster
- All existing ClassLink SSO accounts continue to work throughout and after the migration
- UX matches the Clever rostering experience

**Non-Goals:**

- Bulk district-level background sync (not implementing; accept rate limit risk for per-teacher sync)
- Persisting the district bearer token in the database (cached in the shared cache only; see Decision 3)
- Automatic rostering without teacher action
- ClassLink rostering for student accounts (students are imported via One Roster, not self-rostering)

## Decisions

### 1. `authentication_id` format: `<TenantId>|<SourceId>`

**Decision:** Store as pipe-delimited `<TenantId>|<SourceId>` in `AuthenticationOption.authentication_id`.

**Rationale:** `SourceId` is unique per tenant, not globally. Prefixing with `TenantId` ensures the uniqueness constraint on `authentication_id` is satisfied. Pipe (`|`) matches the existing LTI auth option pattern and avoids fragility if either ID ever contains a dash.

**Alternatives considered:**

- `<TenantId>-<SourceId>`: Fragile if sourceIds are UUIDs or contain dashes. Rejected.
- Store in `data` JSON column: Would require extra parsing logic everywhere; the uniqueness constraint lives on `authentication_id`. Rejected.
- New `ClasslinkUserIdentity` model (like `LtiUserIdentity`): Extra schema complexity not warranted here; the uniqeness constraint is still relevant. Rejected.

### 2. `Section.code` format: `CL-<oneroster_application_id>|<sourceId>`

**Decision:** Prefix `CL-` (consistent with `C-` for Clever), then `<oneroster_application_id>|<classSourceId>`.

**Rationale:** Embedding `oneroster_application_id` in the code lets us reconstruct the full One Roster API URL for subsequent syncs without querying `/applications` a second time for routing. Pipe separates the two variable components safely.

**Alternatives considered:**

- `CL-<tenantId>-<classSourceId>`: Does not encode enough information to reconstruct the API URL without an extra `/applications` lookup. Rejected.
- `CL-<oneroster_application_id>-<classSourceId>`: Dash fragile if class sourceIds are non-integer. Rejected.

### 3. Cache-aside bearer token lookup with 401 recovery

**Decision:** Cache the `/applications` lookup result (bearer token + `oneroster_application_id`) per `tenant_id` in `CDO.shared_cache` with a **5-day TTL**, following the cache-aside pattern used in `lti_v1_controller.rb` (namespaced keys, JSON-serialized values, private `read_cache`/`write_cache` helpers).

**TTL rationale:** 5 days covers a teacher setting up their classes over the course of their first week back at the start of a semester — the highest-traffic rostering window — on a single cached credential per district. Observed behavior shows ClassLink bearer tokens not rotating over at least a month, so 5 days is conservative relative to actual rotation; and if a token does rotate mid-TTL, the 401 recovery flow below self-heals on first use, so a long TTL costs correctness nothing.

**Lookup flow:**

1. Read cache by `tenant_id`. On hit, use the cached bearer.
2. On miss, call `/applications`, find the enabled application matching `tenant_id`, write it to the cache with the TTL, and use it.

**401 recovery flow** (handles bearer rotation by ClassLink before our TTL expires):

1. A One Roster API call returns 401.
2. Call `/applications` again to fetch a fresh bearer for the tenant.
3. Compare the fresh bearer to the cached one:
   - **Different** → the cached token was stale. Update the cache with the fresh token and retry the original request once.
   - **Same** → the 401 is not token expiry (e.g., district disabled sharing, permissions revoked). Do not retry; surface a user-facing error message to the UI (copy TBD).

**Rationale:** ClassLink does not publish bearer TTLs, which previously pushed us to fetch fresh on every operation. The cache-aside + 401-recovery design gets the latency and rate-limit benefits of caching while remaining correct under unknown token rotation: a stale token self-heals on first use, and a genuine authorization failure is distinguished from expiry by the compare step.

**Alternatives considered:**

- No caching, fetch `/applications` on every operation: Simple and always fresh, but doubles API calls per operation against an unpublished rate limit. Rejected in favor of cache-aside.
- Store bearer on the `Section`: Requires schema change and invalidation logic. Rejected.

### 3a. One Roster collection endpoints are paginated in the client

**Decision:** All One Roster collection fetches (`/teachers/<SourceId>/classes`, `/classes/<classSourceId>/students`, `/classes/<classSourceId>/teachers`) go through a shared pagination helper in `Clients::ClasslinkOneRoster` that follows ClassLink's documented `limit`/`offset` protocol:

1. Request the first page with `limit=PAGE_LIMIT, offset=0`.
2. Read the `x-total-count` header (total records in the collection) and `x-count` (records in this page; count the results directly if the header is absent).
3. While the running total of received records is less than `x-total-count`, increment `offset` by `limit` and fetch the next page, adding each page's count to the running total.
4. Stop when the running total reaches `x-total-count` **or** a page returns no results (safety break against miscounted headers — prevents an infinite loop).

`PAGE_LIMIT = 1000` as a single client constant (matches the spike's example calls; ClassLink's own pagination guide demonstrates up to 10000). Most classes fit in one page, so the loop body typically runs once — but every collection call is pagination-correct by construction, and a large district's teacher-class list or an outsized class cannot be silently truncated.

**Rationale:** Centralizing in one helper means no call site can forget pagination (the Google Classroom integration pages `list_course_students` inline at each call site in `api_controller.rb` — easy to miss on a new endpoint). The empty-page break mirrors ClassLink's own recommended algorithm.

**Alternatives considered:**

- Single request with a very large limit (e.g. 10000) and no loop: Simpler, but silently truncates any collection exceeding the limit, and nothing enforces the assumption. Rejected.
- Paginate inline at each call site (Google Classroom style): Duplicated loop logic, and a future endpoint can forget it. Rejected in favor of the shared helper.

### 3b. Rate-limit (429) handling: propagate to the browser, retry there with exponential backoff

**Decision:** When a One Roster call returns 429, Rails does NOT sleep-and-retry in-process. The endpoint immediately returns 429 to the browser, and a shared frontend retry helper — used by both `classlink_classrooms` and `import_classlink_classroom` calls — retries with automatic exponential backoff: **3 attempts total, waits of 1s and 2s (± jitter) between them**. We do not depend on a `Retry-After` header being present. Only after the third attempt fails does the frontend surface the error through the existing `rosterImportFailed` path.

**Why not retry in Rails:** Puma runs `threads 1, 5` per worker and there is no `rack-timeout`. ClassLink rate-limits per vendor, so 429s arrive correlated — a semester-start burst would put many requests to sleep simultaneously, exhausting the small thread pool and degrading unrelated dashboard traffic exactly when load is highest. Backoff waits belong in the browser, where waiting is free and `RosterDialog` already shows a loading state.

**Why browser retry is safe here:**

- The import endpoint is idempotent (find-or-create section + `set_exact_student_list`), so a re-POST after a 429 — even one that struck mid-pagination — converges to the same state.
- These are user-triggered dialog interactions with visible spinners, not background syncs; an abandoned tab mid-retry loses nothing.

**Interplay with the 401 flow (Decision 3):** distinct signals, distinct handlers. 401 → one immediate in-process cache-refresh retry (no sleep). 429 → immediate propagation to the browser. Neither holds a Puma thread beyond a normal request.

**Known inefficiency (accepted):** a 429 mid-pagination aborts the whole Rails request, and the browser retry re-fetches from page one, re-spending quota on already-fetched pages. At realistic class sizes (one page) this is negligible; do not build resumable pagination for it.

**Alternatives considered:**

- Server-side sleep + retry: Correlated 429s exhaust the 5-thread-per-worker pool during bursts. Rejected.
- Background job + polling (ActiveJob `retry_on`): Architecturally clean but changes the synchronous import contract, needs a status-polling endpoint, and exceeds Clever/Google parity. Deferred — the escalation path if 429s prove chronic.
- Honoring `Retry-After` when present: ClassLink's behavior is unverified; fixed exponential backoff is predictable and sufficient. Not planned for.

### 4. Central partner credential model (not per-user OAuth)

ClassLink One Roster uses `CDO.classlink_roster_api_key` (our partner key) to call `/applications`, which returns per-district `bearer` tokens. The teacher's `SourceId` (from their auth option) is the user identifier passed to One Roster API calls. This is architecturally distinct from Clever/Google Classroom, which use the teacher's own stored OAuth token.

### 5. STI model: `ClasslinkSection < OmniAuthSection`

Mirrors `CleverSection`. `OmniAuthSection.from_omniauth` and `set_exact_student_list` handle the generic student creation and enrollment. `ClasslinkSection.from_service` adapts the One Roster response shape into OmniAuth hashes.

### 5a. Co-teacher flow mirrors Clever/Google Classroom

**Decision:** Co-teachers join an already-imported section by importing the same class themselves — never by being auto-added from roster data. When the section exists and the requester is not yet an instructor, the import endpoint verifies their `SourceId` against the One Roster `/classes/<classSourceId>/teachers` endpoint before proceeding; verified requesters are added as `section_instructors` by `OmniAuthSection.from_omniauth` (its existing owner-vs-co-teacher branch), unverified requesters get 403.

**Rationale:** This is exactly the Clever pattern (`clever_teacher_for_course?` queries `sections/{id}/users?role=teacher`) and the Google pattern (`google_teacher_for_course?` calls `list_course_teachers`). One Roster's `/classes/{id}/teachers` is the direct analog. Consistently, teacher records that appear in the `/classes/{id}/students` response are excluded from the student roster — Clever and Google achieve this with server-side filtering (`role=student` query param / students-only endpoint); ClassLink's students endpoint can include teacher records, so we filter by `role == "student"` client-side.

**Alternatives considered:**

- Auto-add all teachers from the class roster as co-teachers: No precedent in Clever/Google; would create instructor records for teachers who never opted in. Rejected.

### 5b. Server-side authorization under the central credential model

**Threat model:** Clever and Google Classroom rostering call provider APIs with the _teacher's own_ user-scoped OAuth token — the provider refuses to serve classes the teacher doesn't teach, so authorization is enforced upstream for free. ClassLink's credentials carry no per-user scoping: each district bearer token can fetch **any class within that district** (blast radius is district-scoped, since bearers are issued and cached per district). Without explicit server-side guards, any authenticated ClassLink user could import or sync any class in their own district — including classes they have no relationship to — by supplying an arbitrary `courseId`.

**Decision:** All authorization is enforced in our application layer, at the single import/sync choke point (`import_classlink_classroom` — the section-row "Sync" action posts to the same endpoint via `importOrUpdateRoster`). Three invariants:

- **I1 — Identity is server-derived.** `TenantId` and teacher `SourceId` are always read from `current_user`'s v2 ClassLink auth option. Client-supplied tenant, application, or teacher identifiers are never trusted; the district application used for One Roster calls is selected solely by the requester's own `TenantId`. (Because class sourceIds are only unique per district, this also prevents cross-district access: a `courseId` is only ever resolved within the requester's own tenant.)
- **I2 — Non-instructors must prove class membership via One Roster.** Any import/sync request where the requester is not already a `section_instructor` of the target section — including first import, where no section exists yet — requires their `SourceId` to appear in the One Roster `/classes/<classSourceId>/teachers` response. Failure → 403, no section created or modified. This generalizes the co-teacher check from Decision 5a: first import and co-teacher join are the same rule.
- **I3 — Instructors sync on local standing.** A requester who is already a section instructor (owner or co-teacher) in our database may re-sync without re-verification against One Roster, matching Clever (`import_clever_classroom` proceeds on `section_instructor?`).

**Authorization matrix for `import_classlink_classroom(courseId)`:**

| Section exists? | Requester is instructor? | One Roster teacher check | Outcome                                                |
| --------------- | ------------------------ | ------------------------ | ------------------------------------------------------ |
| No              | — (cannot be)            | Required                 | Pass → import as owner; Fail → 403                     |
| Yes             | Yes                      | Skipped                  | Roster update                                          |
| Yes             | No                       | Required                 | Pass → added as co-teacher + roster update; Fail → 403 |

The class-list endpoint (`classlink_classrooms`) is inherently scoped: it queries `/teachers/<SourceId>/classes` with the requester's own server-derived `SourceId`.

**Rationale:** The partner credential shifts the authorization burden from the provider to us; the choke-point design keeps every mutation path behind one auditable matrix, and I1 removes the entire class of confused-deputy requests where a client nominates someone else's tenant or identity.

**Alternatives considered:**

- Trusting the class list shown to the teacher (client-side restriction only): Trivially bypassed by direct API calls. Rejected.
- Verifying via `/teachers/<SourceId>/classes` containment instead of `/classes/<id>/teachers`: Equivalent cost and strength; `/classes/<id>/teachers` chosen for symmetry with `clever_teacher_for_course?` / `google_teacher_for_course?`.
- Re-verifying One Roster membership on every instructor sync: Stronger (catches district-side removal between syncs) but doubles API calls per sync and exceeds Clever/Google parity, where local instructor standing suffices. Deferred; can be added later without design change.

### 6. Frontend: new `OAuthSectionTypes.classlink` provider

Adds ClassLink to the existing `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`. The `RosterDialog` and `SectionActionDropdown` components require no structural changes.

### 7. Migration creates versioned v2 auth options; legacy records untouched

**Decision:** Migration does NOT rewrite the existing `AuthenticationOption` in place. Instead it creates a **new** ClassLink `AuthenticationOption` on the same user with `authentication_id = <TenantId>|<SourceId>` and `version = 'v2'` (using the existing `version` column), leaving the legacy `UserId`-format record (v1) intact. This mirrors the Clever v2→v3 API migration (`bin/oneoff/clever/clever_v3_migration.rb` and `Services::Clever::V3AuthOptionBuilder`): dup the legacy option, set the new `authentication_id` and `version`, save. A `Services::Classlink::V2AuthOptionBuilder` follows the same shape, including idempotency (returns nil if a v2 option already exists for the IDs).

**Why versioned records instead of in-place rewrite:**

- **Trivial rollback** — deleting v2 ClassLink auth options (for users who retain a v1 record) restores the pre-migration state exactly. In-place rewrite required a reverse migration script.
- **Dual-match is structural, not logical** — both records exist as ordinary rows, so login by either ID resolves to the same user through the normal `(credential_type, authentication_id)` lookup. The only special logic is the fallback lookup order in the callback (try v2-format uid first, then legacy `UserId`) and creating the v2 record on a legacy match.
- **Proven pattern** — the Clever v3 migration shipped this way; the model and constraints already support multiple same-provider auth options per user.

**Both migration mechanisms remain first-class; bulk run stays an operational choice:**

- **Login-time migration** — legacy user signs in; v2-format lookup misses; fallback lookup by `UserId` finds the v1 record; the system creates the v2 auth option from the live OmniAuth response via the builder. No dependency on stored token validity.
- **Bulk migration script** — modeled on `clever_v3_migration.rb` with dry-run/commit modes: for each v1-only record with a valid stored OAuth token, call `v2/my/info`, build and save the v2 option. Built and available; _running it is an operational decision_ (recommended before Phase 2 to shrink the duplicate-student window).

**Versioning semantics:** `version = 'v2'` marks the new ID format. New signups after Phase 1 also get `version = 'v2'` on their (only) auth option. Add `AuthenticationOption::Classlink::VERSION = {v2: 'v2'}.freeze` mirroring the Clever module constant.

**Alternatives considered:**

- In-place rewrite of `authentication_id`: Loses the original value, making rollback require a reverse migration and making partial-failure states hard to audit. Rejected.
- Bulk-required before Phase 2: Couples the rostering launch to a migration run that can't reach expired-token users anyway. Rejected as a hard requirement; kept as the recommended operational sequence.
- Login-time only: Leaves students who never log in unmigrated indefinitely, maximizing the duplicate-account window. Rejected as the sole mechanism.

## Risks / Trade-offs

**API rate limits** → ClassLink does not publish limits. Per-teacher sync is simple and matches our existing model. Transient 429s are absorbed by browser-driven exponential backoff (Decision 3b) without holding Puma threads. Monitor for 429 responses post-launch; if they prove chronic at scale, escalate to background jobs (ActiveJob `retry_on`) or district-level bulk sync.

**ID migration with expired tokens** → The `v2/my/info` batch migration script requires a valid OAuth token per user. Users who haven't logged in recently will have expired tokens and cannot be bulk-migrated. Login-time migration covers them on next sign-in; teachers cannot roster until migrated (graceful error shown).

**Student duplicate accounts** → Students with legacy `UserId`-format auth options who have not yet logged in (and were not bulk-migrated) will not be found when rostering imports them by `<TenantId>|<SourceId>` — a second account is created, and the original (with any progress) is orphaned once dual-match prefers the new-format record. Since the bulk run is optional, this window can persist into Phase 2. Mitigation: run the bulk script before Phase 2 ships (recommended), and monitor legacy-format record counts.

**Stale cached bearer token** → ClassLink may rotate a district bearer before our cache TTL expires. The 401 recovery flow (refetch, compare, retry once on mismatch) self-heals this on first use; a matching token signals a non-expiry authorization failure and surfaces a user-facing error instead of retry-looping.

**`oneroster_application_id` URL encoding in section code** → The value is URL-encoded base64 (e.g., `%2FKVed75Gs%3D`). It is safe to embed in `section.code` as-is; parsing splits on the first `|` after `CL-`.

**Inconsistent casing across ClassLink APIs** → Each API boundary requires explicit field name mapping. Centralize in the client and model, document in code.

**Partner credential over-reach** → Each district bearer can read any class within its district (bearers are issued and cached per district, so the blast radius is district-scoped), meaning a missing or bypassed authorization check exposes other teachers' rosters (student PII) within the requester's district. Mitigation: invariants I1–I3 (Decision 5b) enforced at the single import/sync choke point, with dedicated authorization tests covering forged `courseId`, forged tenant/identity params, and non-instructor sync attempts. A district removing a teacher mid-term is not caught until the co-teacher path re-verifies (accepted, matches Clever/Google parity).

## Migration Plan

**Phase 1 — ID migration (ships first, prerequisite for Phase 2):**

1. Add `AuthenticationOption::Classlink::VERSION` constant and `Services::Classlink::V2AuthOptionBuilder` (dup v1 option, set `authentication_id = <TenantId>|<SourceId>` and `version = 'v2'`; idempotent)
2. Update `omniauth_callbacks_controller.rb`: extract `TenantId` and `SourceId` from OmniAuth raw_info; new signups create a `version = 'v2'` auth option with the new format
3. Add dual-match login with login-time migration: try v2-format lookup first, fall back to legacy `UserId` lookup; on a legacy match, create the v2 auth option via the builder (v1 record untouched)
4. Build the bulk migration script modeled on `bin/oneoff/clever/clever_v3_migration.rb` (dry-run/commit modes; `v2/my/info` per token-valid v1-only record; creates v2 options)
5. Deploy Phase 1 — login-time migration begins immediately
6. _Operational choice:_ run the bulk script to converge token-valid records at once (recommended before Phase 2 to shrink the duplicate-student window)
7. Monitor v1-only record counts; remaining users self-migrate at next login

**Phase 2 — Rostering:**

1. Ship `ClasslinkSection`, `Clients::ClasslinkOneRoster`, backend endpoints, frontend additions
2. Gate UI on teacher having new-format `authentication_id` (show re-login prompt otherwise)

**Phase 3 — Cleanup:**

1. Remove dual-match login fallback once all active users have v2 records
2. Retire v1 ClassLink auth options (delete or archive) after a comfortable observation window

**Rollback:** Phase 1 rollback is non-lossy: delete ClassLink auth options with `version = 'v2'` **for users who also retain a v1 record** and revert the code — the untouched v1 records restore the pre-migration state exactly. Users who signed up after Phase 1 have a v2 record as their _only_ auth option; those must be excluded from the delete (they have no v1 to fall back to). Phase 2 rollback is a feature flag or route removal. Bearer cache entries expire naturally via TTL; a cache namespace bump invalidates them immediately if needed.

## Open Questions

- Confirm that ClassLink `SourceId` values are never UUID-format (current assumption: integers or short alphanumeric strings without pipes or dashes). If UUIDs are possible, the `|` separator choice needs re-evaluation.
- Confirm exact OmniAuth raw_info field names for `SourceId` and `TenantId` against a live sandbox login before Phase 1 implementation.
- User-facing error message copy for the non-expiry 401 case (district authorization failure).
