## Context

ClassLink SSO is live as of early 2026. The OmniAuth callback currently stores a ClassLink user's `UserId` as `AuthenticationOption.authentication_id`. The One Roster API identifies users by `SourceId` (per-tenant, not globally unique), which is a different value. Rostering requires `SourceId` and `TenantId` to be available on each user record.

ClassLink One Roster uses a **central partner credential model**: our server-side API key fetches per-district credentials from a `/applications` proxy endpoint, then uses those district credentials to call the One Roster API on behalf of a teacher. This differs from Clever and Google Classroom, which use the teacher's own OAuth token.

As of 2026-06-24 there are 14,392 ClassLink `AuthenticationOption` records, all storing `UserId`.

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

**Decision:** Cache the `/applications` lookup result (bearer token + `oneroster_application_id`) per `tenant_id` in `CDO.shared_cache` with a TTL (length TBD), following the cache-aside pattern used in `lti_v1_controller.rb` (namespaced keys, JSON-serialized values, private `read_cache`/`write_cache` helpers).

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

### 4. Central partner credential model (not per-user OAuth)

ClassLink One Roster uses `CDO.classlink_roster_api_key` (our partner key) to call `/applications`, which returns per-district `bearer` tokens. The teacher's `SourceId` (from their auth option) is the user identifier passed to One Roster API calls. This is architecturally distinct from Clever/Google Classroom, which use the teacher's own stored OAuth token.

### 5. STI model: `ClasslinkSection < OmniAuthSection`

Mirrors `CleverSection`. `OmniAuthSection.from_omniauth` and `set_exact_student_list` handle the generic student creation and enrollment. `ClasslinkSection.from_service` adapts the One Roster response shape into OmniAuth hashes.

### 5a. Co-teacher flow mirrors Clever/Google Classroom

**Decision:** Co-teachers join an already-imported section by importing the same class themselves — never by being auto-added from roster data. When the section exists and the requester is not yet an instructor, the import endpoint verifies their `SourceId` against the One Roster `/classes/<classSourceId>/teachers` endpoint before proceeding; verified requesters are added as `section_instructors` by `OmniAuthSection.from_omniauth` (its existing owner-vs-co-teacher branch), unverified requesters get 403.

**Rationale:** This is exactly the Clever pattern (`clever_teacher_for_course?` queries `sections/{id}/users?role=teacher`) and the Google pattern (`google_teacher_for_course?` calls `list_course_teachers`). One Roster's `/classes/{id}/teachers` is the direct analog. Consistently, teacher records that appear in the `/classes/{id}/students` response are excluded from the student roster — Clever and Google achieve this with server-side filtering (`role=student` query param / students-only endpoint); ClassLink's students endpoint can include teacher records, so we filter by `role == "student"` client-side.

**Alternatives considered:**

- Auto-add all teachers from the class roster as co-teachers: No precedent in Clever/Google; would create instructor records for teachers who never opted in. Rejected.

### 6. Frontend: new `OAuthSectionTypes.classlink` provider

Adds ClassLink to the existing `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`. The `RosterDialog` and `SectionActionDropdown` components require no structural changes.

### 7. Two migration mechanisms, both first-class; bulk run is an operational choice

**Decision:** Ship both migration mechanisms:

- **Login-time migration** — dual-match login finds a legacy-format record by `UserId` and rewrites its `authentication_id` to `<TenantId>|<SourceId>` in-place, using the IDs present in the live OmniAuth response. Sufficient on its own: every user migrates on their next sign-in, with no dependency on stored token validity.
- **Bulk migration script** — a Rails runner script that migrates all records with valid stored OAuth tokens via `v2/my/info` in one pass. Built and available, but *running it is an operational decision*, not a requirement.

**Rationale:** Login-time migration is simpler and needs no valid stored tokens (it uses the fresh OAuth response), but converges only as fast as users log in. The bulk script converges immediately for token-valid records but cannot migrate expired-token users at all. Together they cover each other's gaps. Running the bulk script before Phase 2 ships is recommended because it shrinks the duplicate-student-account window (see Risks), but Phase 2 does not hard-depend on it.

**Alternatives considered:**

- Bulk-required before Phase 2: Cleanest data story, but couples the rostering launch to a migration run that can't reach expired-token users anyway. Rejected as a hard requirement; kept as the recommended operational sequence.
- Login-time only: Simplest build, but leaves students who never log in unmigrated indefinitely, maximizing the duplicate-account window. Rejected as the sole mechanism.

## Risks / Trade-offs

**API rate limits** → ClassLink does not publish limits. Per-teacher sync is simple and matches our existing model. Monitor for 429 responses post-launch; if hit at scale, move to district-level background jobs.

**ID migration with expired tokens** → The `v2/my/info` batch migration script requires a valid OAuth token per user. Users who haven't logged in recently will have expired tokens and cannot be bulk-migrated. Login-time migration covers them on next sign-in; teachers cannot roster until migrated (graceful error shown).

**Student duplicate accounts** → Students with legacy `UserId`-format auth options who have not yet logged in (and were not bulk-migrated) will not be found when rostering imports them by `<TenantId>|<SourceId>` — a second account is created, and the original (with any progress) is orphaned once dual-match prefers the new-format record. Since the bulk run is optional, this window can persist into Phase 2. Mitigation: run the bulk script before Phase 2 ships (recommended), and monitor legacy-format record counts.

**Stale cached bearer token** → ClassLink may rotate a district bearer before our cache TTL expires. The 401 recovery flow (refetch, compare, retry once on mismatch) self-heals this on first use; a matching token signals a non-expiry authorization failure and surfaces a user-facing error instead of retry-looping.

**`oneroster_application_id` URL encoding in section code** → The value is URL-encoded base64 (e.g., `%2FKVed75Gs%3D`). It is safe to embed in `section.code` as-is; parsing splits on the first `|` after `CL-`.

**Inconsistent casing across ClassLink APIs** → Each API boundary requires explicit field name mapping. Centralize in the client and model, document in code.

## Migration Plan

**Phase 1 — ID migration (ships first, prerequisite for Phase 2):**

1. Update `omniauth_callbacks_controller.rb`: extract `TenantId` and `SourceId` from OmniAuth raw_info; format new `authentication_id` as `<TenantId>|<SourceId>`
2. Add dual-match login with in-place login-time migration: try new format first, fall back to legacy `UserId` lookup; on a legacy match, rewrite `authentication_id` to the new format from the live OAuth response
3. Build the bulk migration script (Rails runner; `v2/my/info` per token-valid record)
4. Deploy Phase 1 — login-time migration begins immediately
5. *Operational choice:* run the bulk script to converge token-valid records at once (recommended before Phase 2 to shrink the duplicate-student window)
6. Monitor legacy-format record counts; remaining users self-migrate at next login

**Phase 2 — Rostering:**

1. Ship `ClasslinkSection`, `Clients::ClasslinkOneRoster`, backend endpoints, frontend additions
2. Gate UI on teacher having new-format `authentication_id` (show re-login prompt otherwise)

**Phase 3 — Cleanup:**

1. Remove dual-match login logic once all records are confirmed migrated

**Rollback:** Phase 1 rollback becomes lossy as soon as any record migrates (login-time migration starts at deploy); reverting requires a reverse migration script for migrated records. Phase 2 rollback is a feature flag or route removal. Bearer cache entries expire naturally via TTL; a cache namespace bump invalidates them immediately if needed.

## Open Questions

- Confirm that ClassLink `SourceId` values are never UUID-format (current assumption: integers or short alphanumeric strings without pipes or dashes). If UUIDs are possible, the `|` separator choice needs re-evaluation.
- Confirm exact OmniAuth raw_info field names for `SourceId` and `TenantId` against a live sandbox login before Phase 1 implementation.
- Bearer token cache TTL length (start conservative, e.g. minutes-to-hours; tune after observing rotation behavior).
- User-facing error message copy for the non-expiry 401 case (district authorization failure).
