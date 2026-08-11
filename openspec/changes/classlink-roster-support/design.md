## Context

ClassLink SSO is live as of early 2026. The OmniAuth callback currently stores a ClassLink user's `UserId` as `AuthenticationOption.authentication_id`. The One Roster API identifies users by `SourcedId` (per-tenant, not globally unique), which is a different value. Rostering requires `SourcedId` and `TenantId` to be available on each user record.

ClassLink One Roster uses a **central partner credential model**: our server-side API key fetches per-district credentials from a `/applications` proxy endpoint, then uses those district credentials to call the One Roster API on behalf of a teacher. This differs from Clever and Google Classroom, which use the teacher's own OAuth token.

**Casing conventions across ClassLink APIs (inconsistent by design):**
| Context | TenantId field | SourcedId field |
|---------|---------------|----------------|
| OmniAuth / OAuth callback (`v2/my/info`) | `TenantId` (integer) | `SourcedId` (string) |
| `/applications` response | `tenant_id` | — |
| One Roster class/students endpoints | — | `sourcedId` (per IMS v1.1, confirmed in the teachers and students captures) |

**`v2/my/info` contract, from ClassLink's documented response.**

- `UserId: 12345` — ClassLink's internal user id, integer. This is what `authentication_id` stores today (the gem sets `uid` from `raw_info['UserId']`), and is precisely why the v2 migration exists.
- `SourcedId: "56789"` — the SIS-supplied id, a **string**, distinct from `UserId`. In the documented example it equals `LoginId`.
- `TenantId: 123` — an **integer**. `/applications` also returns `tenant_id` as an integer, so the two sides agree in type. Normalize with `to_s` anyway at the comparison and wherever the value is joined into `authentication_id` or a cache key: the id crosses a JSON boundary, a cache key, and a string-joined identifier, and one leg being stringified while another is not is the kind of mismatch that fails silently.
- `Role: "Student"` and `Role_Level: 4` are present, so teacher-vs-student is known at login without an extra call. This does **not** substitute for the `/classes/<classSourcedId>/teachers` check, which answers a different question (does this teacher teach _this_ class).

The `omniauth-classlink` gem (0.3.1) already surfaces the two values we need in its `info` block: `info[:external_id]` from `raw_info['SourcedId']` and `info[:district_id]` from `raw_info['TenantId']`. Prefer those over adding new `raw_info` digs — see the pre-existing defect below.

**Pre-existing defect in `inject_classlink_data` — out of scope for this change.** `omniauth_callbacks_controller.rb:466` digs **snake_case** keys out of `raw_info` (`:email`, `:display_name`, `:first_name`, `:last_name`, `:role`, `:state_name`), but the payload is PascalCase. Verified two facts with `rails runner`: `OmniAuth::AuthHash#dig` is case-sensitive (`dig(:extra, :raw_info, :email)` returns nil against an `"Email"` key, `dig(..., :Email)` returns the value), and `info.merge!` of a nil value **overwrites** a populated one. So every dig returns nil and the subsequent `auth.info&.merge!` clobbers the `email` the gem's own `info` block had already set correctly.

The payload is confirmed PascalCase by two live `v2/my/info` captures — the same endpoint the gem fetches for `raw_info`. Independently, the gem derives `uid` from `raw_info['UserId']` and ClassLink SSO issues working uids in production, which it could not if that read returned nil. The test fixture at `dashboard/test/integration/omniauth/classlink_test.rb:96` builds `raw_info` with snake_case keys, so the suite is self-consistent with the defect and cannot catch it.

**Why it is descoped rather than fixed here.** Three reasons, in order of weight:

1. **Nothing in this change depends on it.** The callback reads `TenantId` and `SourcedId` from the gem's `info[:district_id]` / `info[:external_id]`, which parse PascalCase correctly. We route around the defect instead of through it (task 1.5).
2. **Fixing it is not behavior-neutral.** The nil-clobbering currently blanks `email`. Repair it and ClassLink users begin arriving at signup _with_ an email, which changes `allows_section_takeover` — that logic keys off blank email to decide whether silent account takeover is permitted. That is a change to account-linking behavior for ~14,392 existing users, and it deserves its own review rather than riding inside a rostering change.
3. **The user-visible cost is bounded.** Missing `email`, `user_type`, and `state_name` mean the finish-signup step prompts for them, so the effect is extra typing at signup, not lost or wrong data. `state_name` is the one with a second consumer — `omniauth_callbacks_controller.rb:267` uses it to set `us_state`, but only for students — and the same finish-signup prompt covers it.

**Follow-up owed: file this as its own bug.** Not a task in this change, and deliberately not sequenced ahead of anything here. What the bug needs to say, so it can be written without reconstructing the analysis: the defect is at `omniauth_callbacks_controller.rb:466`, live since ClassLink SSO shipped in early 2026; the fixture at `dashboard/test/integration/omniauth/classlink_test.rb:96` uses snake_case keys and certifies the bug, so rewriting it is part of the fix rather than an afterthought; and fixing it makes ClassLink users start arriving **with** an email, which changes `allows_section_takeover` — that logic keys off blank email to decide whether silent account takeover is permitted — for roughly 14,392 existing users. That last point is why it wants its own review rather than a quick patch.

The analysis above is retained deliberately: the next person to read this code will find a broken method sitting beside new code that carefully avoids it, and should find the reason here rather than rediscovering it.

**Confirmed against a live sandbox call:**

- `oneroster_application_id` is used **verbatim** in the request path with percent-escapes intact (`/%1FKVa1gd75Gs%5D/ims/oneroster/v1p1/...`). It MUST NOT be re-encoded — an HTTP client that escapes path segments will double-encode it to and fail opaquely.
- The district `bearer` is a raw UUID sent as `Authorization: Bearer <uuid>`; it carries no embedded scheme prefix.
- `cltraceid` may be sent empty and the request succeeds, so it is optional.
- `orderBy=asc` is accepted without a paired `sort` parameter.
- Teacher `sourcedId` observed as a plain integer (`12345`) — consistent with, though not proof of, the assumption that source ids contain no pipes or dashes.
- Pagination headers confirmed, lowercase and hyphenated: `x-count` (records in this page) and `x-total-count` (records in the collection).
- `x-next-page-token` is also returned (empty on a single-page response), but ClassLink's data best-practices guide documents pagination **solely** in terms of `limit`/`offset` with `x-count`/`x-total-count`, and does not mention the token anywhere. An undocumented header carries no contract: there is no specified parameter to echo it back, and it may change or vanish without notice. Treat it as an observation, not a mechanism — Decision 3a stays on documented offset paging. Recorded here so a later reader does not mistake it for an unexplored option. **Consequence:** the skip-and-duplicate hazard of offset paging over an unstable ordering cannot be designed away with a cursor, so it must be contained instead — see Decision 3a's explicit sort and the truncation guard.
- Also returned, semantics not yet established: `x-obfuscated` and `x-modified` (both empty in the observed response), `x-endpoint` (a route/version identifier, likely useful for support escalation), and `x-page-generation-time-ms`.
- `x-page-generation-time-ms` was **365ms for a 2-record page**. Server-side generation is not trivially fast, so a multi-page fetch on the synchronous import path (which holds one of only five Puma threads per worker) may take seconds. This strengthens the case for escalating very large sections to the deferred background-job path (Decision 3b).

**`/applications` behaves differently from the One Roster collections:**

- It **honors `limit` and `offset`**, both verified directly — `?limit=1` returns one record, and stepping `offset` walks the collection. So multi-page fetches here are real behavior, not a theoretical allowance, and the endpoint must be treated as a paginated collection.
- `limit=10000` is **accepted** on this endpoint. Recorded as headroom, not as a setting we use — see Decision 3a on why `PAGE_LIMIT` stays at 1000.
- It returns **no `x-count` and no `x-total-count`**. The full observed header set contains neither; the `access-control-expose-headers: x-total-count` line is a shared CORS configuration across the proxy declaring a header this endpoint never populates, not a conditional promise. **Consequence:** a loop that terminates on `x-total-count` would stop after page one here and silently keep a partial district list — the highest-consequence truncation in the integration, since a missing district is indistinguishable from one that has not enabled sharing. This is why Decision 3a terminates on a short page instead.
- `x-page-generation-time-ms: 9` — two orders of magnitude faster than the One Roster page. Extra requests here are cheap, so a conservative termination rule costs almost nothing.
- The observed response was `content-length: 724`, i.e. a handful of applications. This is sandbox data and does not exercise the ~630-district production list.
- `x-host-name: undefined` appears in the response — a ClassLink infrastructure quirk, noted only so it is not mistaken for a signal.
- Whether `/applications` supports `sort`/`orderBy` is untested. Applications carry `tenant_id`, not `sourcedId`, so the ordering key we pin on One Roster collections does not apply here.

**Second `v2/my/info` capture — a live demo teacher:**

The documented example above is one tenant's shape. A real response from another tenant differs in ways worth recording, because several of them contradict what a reader would infer from a single sample.

- **`SourcedId: "5678_T5678-0005"`** — an underscore-and-hyphen composite, apparently `<OrgId>_<LoginId>`, where the documented example was a bare `"1234567890"` equal to `LoginId`. The format is per-district and must never be parsed. It also retroactively justifies Decision 1's rejection of a `-` separator: this id contains dashes, so `<TenantId>-<SourcedId>` would have been ambiguous. No pipe, so the `|` separator holds.
- **`OrgId` is an array here (`["5678"]`) but a string (`""`) in the documented example.** ClassLink field _types_ vary between payloads, not only their values. We do not consume `OrgId`, but the lesson generalizes: coerce and check rather than assuming a shape.
- **`Role: "Teacher"` is capitalized, while One Roster returns `role: "teacher"` lowercase.** The two APIs disagree on case for the same concept. `inject_classlink_data` already applies `&.downcase`, so nothing breaks today, but any comparison across the two sources must normalize case first.
- **A field absent from ClassLink's documentation appears here: `or_email`** (value equal to `Email`), presumably the One Roster email. Treat the documented field list as a lower bound, not a contract.
- `TenantId: 2222` is an integer, consistent with `/applications`. `Role_Level: 3` for a teacher, versus `4` for the documented student.

**On the differing `SourcedId` shapes.** The One Roster records we captured carry integer sourcedIds (`98765`, and the working path `/teachers/12345/classes`) against a tenant whose orgs are `2` and `7`, while this user sits in `TenantId 2222`, org `5678`. These are **different tenants**, which fully accounts for the difference — SIS id schemes are per-district, and nothing here bears on the `my/info`↔One Roster equality, which ClassLink has confirmed separately.

**An optional way to observe that equality rather than rely on it.** `TenantId 2222` is one of the two rows in the `/applications` capture, so we hold that district's `bearer` and `oneroster_application_id` _and_ a real user's `SourcedId` from the same tenant. A single call — `GET /<oneroster_application_id>/ims/oneroster/v1p1/teachers/5678_T5678-0005/classes` — would confirm it with data for a real user. Not required, since the equality is already confirmed; recorded because the cost is one request and it is the only assumption in this design whose failure mode on the student side is silent.

**`/applications` body capture:**

- **What this endpoint is.** Global discovery, not a per-district lookup: it returns the set of tenants (districts/schools) that have enabled _our_ application. There is one call, made with the partner key, and we search its result for the requester's `tenant_id`. Everything below follows from that. A tenant's absence from the list is the legitimate "this district has not enabled ClassLink rostering" signal — which is precisely why any degraded response must be distinguishable from a short list, since both look like absence.
- Envelope is `{"status": 1, "applications": [...]}`. Records live under `applications`.
- **The top-level `status: 1` is an in-body result code**, distinct from the per-record `tenant_status`. Its presence is evidence that this proxy can signal outcomes in the response body, which matters for the 429/401 shape question on the One Roster endpoints. We do **not** gate on it — see Decision 3.
- `enabled: "true"` — a **string**, as the `enabledUser` capture predicted. Compare against `'true'`.
- **`tenant_status: "Active"` exists** as a separate capitalized string. Both observed records are `Active`, so the value space is unknown — we cannot tell whether ClassLink already excludes non-active tenants from this response or whether an `Inactive` tenant would appear here with `enabled: "true"`. Decision 3 gates on it (case-insensitively) on the conservative reading; see the open question on what other values occur.
- **Three distinct id fields per record**, and only one is the path segment we need:
  | Field | Observed | Meaning |
  |---|---|---|
  | `id` | `200000`, `100000` | the tenant↔application pairing row id |
  | `application_id` | `15000` (constant) | our own registered application |
  | `oneroster_application_id` | redacted, percent-escaped | **the value used verbatim in the One Roster path** |
  Using `id` or `application_id` in a request path would fail opaquely. This is the same trap as `sourcedId` vs `identifier` on user records.
- `application_id` and `name: "CodeAI"` are constant across rows — every row is our application — so selection is by `tenant_id` alone, as designed. No filtering on application name or id is needed.
- Each row carries its own `bearer`, confirming the per-district credential model.
- Both observed rows have distinct `tenant_id`s, so nothing here shows a tenant appearing twice. The "can one `tenant_id` return multiple rows" question is unresolved but now looks unlikely; handle it defensively rather than designing for it.
- The body carries no total or pagination metadata, consistent with the absent count headers.

**`/teachers/<SourcedId>/classes` capture:**

- Envelope key is **`classes`**. Note the pattern: the key names the _resource type_ returned, not the endpoint — which is why `/classes/<id>/teachers` returns `users`, not `teachers`.
- **`classCode` is empty (`""`)**, and `periods` is an empty array. Neither carries a human-meaningful period or section identifier, so the section-vs-enrollment-code question is settled: **the section name comes from `title`**, and there is nothing to map to an enrollment code.
- `title` reads `"Sci5 (Sci5)"` — the SIS emits a redundant parenthetical. Display it verbatim; do not strip or normalize. Whatever the district put in their SIS is what their teachers will recognize, and a cleanup rule that guesses wrong makes classes harder to identify, not easier.
- **Same-titled classes are indistinguishable in the picker.** With `classCode` and `periods` both empty, a teacher who teaches two sections of `Math5` sees two identical rows. `location` (`"201"`) and the `terms[]` reference are the only differentiators available. Not solved here — the class list matches Clever/Google parity, which has the same property — but worth knowing before the first support ticket.
- `classType: "scheduled"` (One Roster's values are `homeroom` and `scheduled`). We do **not** filter on it: a homeroom is a legitimate class to import, and Clever/Google have no equivalent concept to match against.
- **`sourcedId` values are not numeric.** `course.sourcedId` is `"7_1553"` (underscore) and `terms[].sourcedId` is `"FY"` (alphabetic). This confirms Decision 1's refusal to assume a format, and adds an implementation constraint — see below.
- `grades` arrives multi-valued and unsorted (`["05","11","10","12"]` on a class titled `Sci5`). Unused, and not trustworthy as a signal.
- `hrefs` in this capture point at `https://test.com/...`, another reminder that response hrefs are not our request path.
- **Confirmed: the endpoint returns only current-term classes, not a teacher's history.** Everything returned is a class the teacher may import, so we do no client-side filtering on `terms[]` or `status` here. This also settles two smaller worries: the import picker stays short, and a teacher's current-term class count sits far below the 1000-class bound behind `PAGE_LIMIT`.
- **This endpoint feeds the import modal only.** It is called to populate the list of classes a teacher may import; sync never uses it, reading `/classes/<classSourcedId>/students` directly from the stored `section.code`. So the term filter does not affect sync, and nothing here needs to change for sections imported in an earlier term. Unverified, and only relevant if it ever comes up: whether a class that has left the current term remains readable at `/classes/<classSourcedId>/students`. If it does, a stale-section sync simply returns the same roster. If it instead returns empty, Decision 3c refuses the sync rather than unenrolling the class.

**Path segments: escape `sourcedId`, never escape `oneroster_application_id`.** These two rules point in opposite directions and both are load-bearing. `oneroster_application_id` arrives pre-percent-escaped and must be interpolated **verbatim** — re-encoding turns `%2F` into `%252F` and the request fails opaquely. Class and teacher `sourcedId` values, by contrast, are arbitrary district-supplied strings — `7_1553` and `FY` prove they are not restricted to digits — so any that contain URL-significant characters must be escaped when interpolated. A path builder that applies one policy uniformly is wrong in one direction or the other. Handle the application id as an opaque pre-escaped literal and escape every other interpolated segment.

**`/classes/<classSourcedId>/students` capture:**

- Same `{"users": [...]}` envelope, same record shape as the teachers endpoint, with `role: "student"` (lowercase) and `identifier` again distinct from `sourcedId` (`11111` vs `22222`).
- **No `birthDate`, and no `metadata` block of any kind.** The no-date-of-birth premise is now confirmed rather than assumed, which makes the `defer_age` change mandatory rather than precautionary — without it, `initialize_new_oauth_user` leaves `age` nil and validation raises an unrescued `ActiveRecord::RecordInvalid` that aborts the whole section sync, not just the offending student.
- **Students _do_ carry an `email`** (`REDACTED@classlink.k12.nj.us` — a district-issued address). We deliberately do not use it; see below.
- `grades: ["11"]` is present. We have no use for it today; noted only so a future reader knows grade level is available without an extra call.
- **`agents` is populated on student records** — two `type: "user"` hrefs each. In One Roster, a student's agents are their guardians. So the payload links to parent/guardian records. Combined with the `password`, `sms`, `phone`, and `middleName` fields, this settles the data-handling posture: extract only `sourcedId`, `givenName`, `familyName`, and `role`; never log raw payloads; never follow `agents[]` or `orgs[]` hrefs.
- `status: "active"` on every observed record. `tobedeleted` remains unobserved, so the operational question about how districts use it stands.
- The `orgs[].href` values point at `orgs/2` here versus `orgs/7` for the teacher record — students and their teacher can sit in different orgs. Irrelevant to this design, which never resolves orgs, but worth knowing before anyone assumes a single org per class.

**Decision: do not pass student email into the section import.** ClassLink supplies it, but both existing OAuth roster providers deliberately drop it. `CleverSection.from_service` builds each student's `AuthHash` with only `name`, `family_name`, and `dob` (`dashboard/app/models/sections/clever_section.rb`), and `GoogleClassroomSection.from_service` passes only `name` and `family_name` (`dashboard/app/models/sections/google_classroom_section.rb:50-57`) — despite both providers exposing student emails. ClassLink follows the same pattern: `sourcedId` becomes the `uid`, and `givenName`/`familyName` become the name fields. This is parity, not a new judgment call, and it keeps roster-imported students free of stored email addresses.

**On `defer_age`: this matches both existing providers, not just Google.** `dashboard/app/models/concerns/user/age.rb:9` defers the age-presence validation for `%w(google_oauth2 clever)` (plus sponsored and LTI users). Every OAuth roster provider we support is already on that list, so adding `classlink` is the established pattern rather than a novel exception. Note the asymmetry it resolves: Clever passes a `dob` when the provider supplies one _and_ defers the validation; ClassLink supplies no `dob` at all, so its students land exactly where Google Classroom students already are today — `age` nil, validation deferred. The product/legal acknowledgement is still worth getting, but the question is "confirm the existing treatment of OAuth-rostered students applies here too," not "approve a new data practice."

**`/classes/<classSourcedId>/teachers` capture:**

- **The endpoint exists and returns teacher records.** Invariants I1/I2 and the entire co-teacher flow (Decision 5a) are implementable as specified, rather than assumed from Clever symmetry.
- The envelope key is **`users`**, not `teachers`: `{"users": [...]}`. The students endpoint is presumably `{"users": [...]}` as well — do not key parsing off the endpoint name.
- **`sourcedId` is confirmed as the body field name**, settling what was previously an IMS-spec assumption never observed in a response.
- `role` is **lowercase** (`"teacher"`), so the client-side `role == "student"` filter in Decision 5a is the right comparison.
- **No primary-vs-co-teacher designation is returned.** This costs nothing: I2 and Decision 5a need only _membership_ — is the requester's `SourcedId` in this list — and section ownership is already determined by who imports first, matching Clever and Google Classroom. One consequence to accept knowingly: if the SIS teacher-of-record imports after a colleague, they join as co-teacher rather than owner. That is existing behavior for every OAuth roster provider, not a ClassLink-specific regression.
- **`enabledUser` is the string `"true"`, not a boolean.** ClassLink serializes booleans as strings, which strongly indicates `/applications`' `enabled` is the same. This is a live bug hazard in Ruby: `"false"` is truthy, so `if user['enabledUser']` passes for a disabled user. Every such field must be compared explicitly against `'true'`.
- `identifier: "32"` is a **separate field from `sourcedId`** (`"98765"`), as is the `userIds` array (`type: "Fed"` matching the `sourcedId`, plus a `type: "StateID"`). Teacher matching must use `sourcedId` and nothing else.
- `status: "active"` and a per-record `dateLastModified` are both present — relevant to the `tobedeleted` decision and to any future delta-sync work.
- `orgs[].href` points at `https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/orgs/7` — **a different host than the proxy we authenticate against.** Never follow hrefs from response bodies; always construct URLs through the proxy with the district bearer. Following them would bypass our credential path entirely.
- That host also reveals the sandbox is a **New Jersey certification tenant**. If SSO credentials exist for a user in it, the blocked identity-equality test may be runnable there against real One Roster records with no real student data involved.
- The payload carries `password`, `sms`, `phone`, and `middleName` fields (all empty or redacted here). `password` being present at all means **raw One Roster user payloads must never be logged**, and only the fields we consume should be extracted or persisted.
- No `birthDate` on this teacher record — consistent with the no-date-of-birth premise behind the age/`defer_age` decision, though student records still need their own confirmation.

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

### 1. `authentication_id` format: `<TenantId>|<SourcedId>`

**Decision:** Store as pipe-delimited `<TenantId>|<SourcedId>` in `AuthenticationOption.authentication_id`.

**Rationale:** `SourcedId` is unique per tenant, not globally. Prefixing with `TenantId` ensures the uniqueness constraint on `authentication_id` is satisfied. Pipe (`|`) matches the existing LTI auth option pattern and avoids fragility if either ID ever contains a dash.

**Both components are validated before the id is constructed.** `TenantId` and `SourcedId` must each be present and non-blank after `to_s`, and neither may contain a pipe. If either check fails, do not build an `authentication_id` — raise, log the `UserId`, and let the login fall back to the legacy v1 path.

This is not defensive boilerplate, and it is not a hedge against ClassLink. ClassLink has confirmed `SourcedId` is never blank upstream. The guard exists because **our own extraction can produce a blank**, and demonstrably does: `inject_classlink_data` digs snake_case keys out of a PascalCase payload and yields nil for every field (see Context). A validation that assumes the payload is fine only holds if the code reading the payload is also fine, and that is exactly the assumption that already failed once here.

The consequence of skipping it is severe enough to justify the two lines. Because `authentication_id` is what login looks users up _by_, a blank second component yields `"<TenantId>|"` for **every user in that tenant** — so the second such user to sign in matches the first user's auth option. That is cross-user account takeover within a district, produced silently by an empty string. A pipe inside either component is the same class of bug: `"2|a|b"` and `"2|a"` + `"b"` are indistinguishable after joining, so the parse can resolve to the wrong user. Neither failure announces itself.

Format is otherwise not validated. The documented student `SourcedId` is a 10-digit string (`"1234567890"`) while the sandbox teacher path used `12345` — different shapes from different tenants, so any format assumption beyond "non-blank, pipe-free" would be inventing a constraint ClassLink does not state.

**Alternatives considered:**

- `<TenantId>-<SourcedId>`: Fragile if sourcedIds are UUIDs or contain dashes. Rejected.
- Store in `data` JSON column: Would require extra parsing logic everywhere; the uniqueness constraint lives on `authentication_id`. Rejected.
- New `ClasslinkUserIdentity` model (like `LtiUserIdentity`): Extra schema complexity not warranted here; the uniqeness constraint is still relevant. Rejected.

### 2. `Section.code` format: `CL-<TenantId>|<classSourcedId>`

**Decision:** Prefix `CL-` (consistent with `C-` for Clever and `G-` for Google Classroom), then `<TenantId>|<classSourcedId>`. The `oneroster_application_id` is **not** persisted in the code.

**Rationale for each part:**

- **`TenantId`** is present for uniqueness only. Class `sourcedId` values are unique per district, not globally, so two districts can both have class `33520`; the tenant scopes it. `sections.code` carries a UNIQUE index across every section in the system, so this is a correctness requirement, not decoration.
- **`classSourcedId`** is the value actually used at request time, as the path segment for `/classes/<classSourcedId>/students`.
- **The `CL-` prefix is retained deliberately, though it is not load-bearing.** Provider identity comes from `login_type` — `section.rb:83` sets `self.inheritance_column = :login_type` — so the prefix does no dispatch work, and `TenantId|classSourcedId` could not collide with a six-letter join code or a `C-`/`G-` code on shape alone. It is kept for operational legibility: `sections.code` is UNIQUE-indexed and searched by operator input in three places in `admin_search_controller`, and `CL-2222|33520` identifies itself where `2222|33520` does not. Consistency across the column matters too — a reader seeing `G-`, `C-`, and `CL-` understands the scheme, whereas one prefix-less provider is a special case requiring explanation forever. Dropping it would also simplify no code, since the code is parsed either way.

**Why the application id is not persisted.** An earlier draft embedded `oneroster_application_id` to avoid a second `/applications` lookup "for routing." That rationale does not survive inspection: every One Roster request needs the district `bearer`, and the bearer and the `oneroster_application_id` arrive together in the same cached record from the same cache-aside lookup (Decision 3). The lookup happens regardless, so embedding the application id saved nothing and cost three things — a percent-escaped `%2F…%3D` blob inside a UNIQUE, admin-searchable column; a compound the frontend had to disassemble; and a client-supplied application id round-tripping through the browser, which invariant I1 exists to prevent.

**The `TenantId` in the code is never the source of the tenant used for credential lookup.** That value always comes from `current_user`'s v2 auth option, per invariant I1. The code's copy exists for uniqueness and for reading a row in the database; treating it as an input would reintroduce exactly the client-supplied-identity problem this format removes. Note also that a tenant-mismatch check between code and requester is deliberately _not_ specified: I2 and I3 already gate authorization, and a teacher who changes districts would trip such a check on their old sections for no benefit.

**Consequence for the frontend, which breaks an assumption two call sites make.** Clever and Google Classroom section codes are a prefix plus a bare course id, and `SyncOmniAuthSectionControl.jsx:89` and `SectionActionDropdown.jsx:119` both encode that assumption as `sectionCode.replace(/^[GC]-/, '')`. A ClassLink code violates it twice: `/^[GC]-/` does not match `CL-` (the pattern wants `-` where the code has `L`), and the remainder is a pipe-joined pair rather than an id. The frontend sends **only the `classSourcedId`** — the portion after the pipe — and never the tenant, which the server derives from `current_user`.

**Alternatives considered:**

- `CL-<oneroster_application_id>|<classSourcedId>`: The earlier draft. Rejected once the routing rationale proved false — see above.
- `CL-<classSourcedId>` with no tenant: Smallest and most legible, but class sourcedIds are only district-unique, so two districts holding the same class id would collide on a UNIQUE column. Rejected.
- No prefix, `<TenantId>|<classSourcedId>`: Collision-safe and functionally equivalent, but forfeits legibility in an operator-facing column and makes ClassLink the only provider without a prefix. Rejected on consistency grounds rather than correctness.
- `CL-<TenantId>-<classSourcedId>`: Dash fragile — observed sourcedIds contain dashes (`5678_T5678-0005`), so the split would be ambiguous. Rejected.

**No data migration is required.** No ClassLink sections exist yet, so this format change touches no persisted rows.

### 3. Cache-aside bearer token lookup with 401 recovery

**Decision:** Cache the `/applications` lookup result (bearer token + `oneroster_application_id`) per `tenant_id` in `CDO.shared_cache` with a **5-day TTL**, following the cache-aside pattern used in `lti_v1_controller.rb` (namespaced keys, JSON-serialized values, private `read_cache`/`write_cache` helpers).

**TTL rationale:** 5 days covers a teacher setting up their classes over the course of their first week back at the start of a semester — the highest-traffic rostering window — on a single cached credential per district. Observed behavior shows ClassLink bearer tokens not rotating over at least a month, so 5 days is conservative relative to actual rotation; and if a token does rotate mid-TTL, the 401 recovery flow below self-heals on first use, so a long TTL costs correctness nothing.

**Lookup flow:**

1. Read cache by `tenant_id`. On hit, use the cached bearer.
2. On miss, call `/applications` and validate the response **structurally**: `applications` must be present and an array. Absent or not an array is a malformed response and raises. An empty array does not raise but is logged as a warning, since production has hundreds of sharing districts and an empty discovery list is far more likely to be a degraded response than a true zero.
3. A tenant is eligible only if **all three** hold: it is present in the returned list, its `tenant_status == 'Active'`, and its `enabled == 'true'`. Cache the record's `bearer` and `oneroster_application_id` with the TTL, and use them. A well-formed list that simply does not contain the teacher's `tenant_id` is the legitimate "this district has not enabled ClassLink rostering" path, not an error.

**Why structure rather than the `status` field.** The response carries a top-level `status: 1`, and gating on it is tempting. Rejected: `status` is undocumented, its value space is unknown, and this is a _global_ endpoint. A hard requirement of `status == 1` means a benign format change on ClassLink's side — `200` instead of `1`, a stringified `"1"`, the field dropped in a version bump — rejects a perfectly good discovery list and makes every district everywhere report rostering unavailable. That is a self-inflicted global outage traded against a failure we have never observed. Validating the structure we actually consume gives the same protection against a degraded response without betting on an undocumented field. Log `status` when it is not 1; do not branch on it.

**401 recovery flow** (handles bearer rotation by ClassLink before our TTL expires):

1. A One Roster API call returns 401.
2. Call `/applications` again to fetch a fresh bearer for the tenant.
3. Compare the fresh bearer to the cached one:
   - **Different** → the cached token was stale. Update the cache with the fresh token and retry the original request once.
   - **Same** → the 401 is not token expiry (e.g., district disabled sharing, permissions revoked). Do not retry; surface a user-facing error message to the UI (copy TBD).

**Rationale:** ClassLink does not publish bearer TTLs, which previously pushed us to fetch fresh on every operation. The cache-aside + 401-recovery design gets the latency and rate-limit benefits of caching while remaining correct under unknown token rotation: a stale token self-heals on first use, and a genuine authorization failure is distinguished from expiry by the compare step.

**Alternatives considered:**

- No caching, fetch `/applications` on every operation: Simple and always fresh, but doubles API calls per operation against an unpublished rate limit. Rejected in favor of cache-aside.
- **Warm the cache for every tenant in the response, not just the requested one:** Tempting, since `/applications` is global discovery — one fetch already contains every district's credentials, so populating all entries would turn N cold lookups into one call. Rejected deliberately: each record contains a district `bearer` that can read any roster in that district, and caching ~630 of them to serve one request multiplies the credential exposure surface for no correctness gain. Fetch globally, cache only the entry actually needed, discard the rest. Recorded here so this is not later mistaken for an oversight.
- Store bearer on the `Section`: Requires schema change and invalidation logic. Rejected.

### 3a. One Roster collection endpoints are paginated in the client

**Decision:** All ClassLink collection fetches (`/applications`, `/teachers/<SourcedId>/classes`, `/classes/<classSourcedId>/students`, `/classes/<classSourcedId>/teachers`) go through a shared pagination helper in `Clients::ClasslinkOneRoster` that follows ClassLink's documented `limit`/`offset` protocol. Pagination is fully supported; a paginated response is a normal outcome, not an error:

1. Request the first page with `limit=PAGE_LIMIT, offset=0`, plus `sort=sourcedId, orderBy=asc` on the One Roster collections.
2. Validate the response structurally before reading it: the expected envelope key for that resource (`users`, `classes`, or `applications`) must be present and an array. Absent or non-array raises.
3. Read the `x-total-count` header (total records in the collection) and `x-count` (records in this page; count the results directly if the header is absent). Both may be missing — `/applications` sends neither.
4. Accumulate the page's records, then stop if **any** of these hold; otherwise increment `offset` by `limit` and fetch again:
   - the page returned **fewer records than `limit`** — a short page is the last page;
   - the page returned **no records** (safety break against miscounted headers — prevents an infinite loop);
   - `x-total-count` is present and the running total has reached it.

**Structural validation is what lets us trust the documented error codes.** We accept ClassLink's documentation that rate limiting arrives as HTTP 429 and expired authorization as HTTP 401, rather than as HTTP 200 wrapping an in-body failure — a reasonable call, since their docs are the best evidence available and no capture contradicted it. What makes it safe rather than hopeful is that the structural check does not depend on it: a 200 carrying an error envelope (`imsx_codeMajor` or anything else) simply lacks the expected collection key and raises. We get protection against the failure mode without needing to know its format. Decision 3c is the second, independent backstop. If the documented behavior turns out to be wrong, the degradation is a loud error, not a silently truncated roster.

**Why three stop conditions rather than one.** The short-page rule is the load-bearing one: it needs no headers, so it is the only condition that terminates correctly on `/applications`, which sends none. Where `x-total-count` _is_ sent, it is a redundant confirmation rather than a competing rule — both conditions fire on the same final page. Keeping all three means one code path serves both endpoint families, and a future ClassLink endpoint that omits the count headers does not silently inherit a truncation bug.

The cost is one extra request whenever a collection's size is an exact multiple of `PAGE_LIMIT`, which returns zero records and stops. That is a rounding error — 9ms on `/applications`, and it cannot happen at all for the One Roster collections while their totals stay under 1000.

The residual risk is a server that returns a short page that is _not_ the last page; we would stop early. Wherever `x-total-count` is sent, the third condition catches exactly that. On `/applications` there is nothing to catch it with, which is one more reason Decision 3c guards the outcome rather than the fetch.

`PAGE_LIMIT = 1000` as a single client constant for **all four endpoints**, confirmed accepted by the proxy. The bound is a domain argument: no real class has more than 1000 students, and no real teacher has more than 1000 importable classes. So the loop body typically runs once, and in the rare case it does run again it almost certainly terminates on the second page. That is the point of the large limit — it makes multi-page fetches rare and shallow — but the loop is still required, because "rare" is not "never" and a truncated roster is the one failure this integration cannot absorb.

**Why 1000 and not the documented maximum of 10000.** `limit=10000` is accepted, and raising it would make the loop effectively never run. Rejected, because it trades a working loop for a silent-truncation risk:

- **A clamped response is indistinguishable from a final short page.** Ask for 10000, receive 5000 because the server capped the request, and `5000 < 10000` satisfies the short-page stop condition — the fetch reports success holding a partial collection. "Accepted" is not "honored": a 200 for `?limit=10000` against a small collection proves the parameter parses, not that a 12000-record collection would return whole. 1000 sits well inside ClassLink's documented range, where a clamp is implausible; 10000 is exactly the ceiling their guidance names, which is where a clamp is most likely.
- **`/applications` is the endpoint least able to detect that, not most.** The One Roster collections send `x-total-count`, so a clamp trips the third stop condition. `/applications` sends no count headers at all, leaving the short-page rule as its only terminator with nothing to cross-check it. The endpoint with no independent check is the one that should be most conservative about the limit — the opposite of the intuition that a bigger limit is safer there because it has fewer headers.
- **A bounded page protects the synchronous import path.** A pathological district-wide "class" of 5000 students becomes five bounded requests rather than one large payload parsed on one of only five Puma threads per worker.

Growth past 1000 needs no change: the loop simply runs twice, which is correct and costs little — `/applications` generates a page in 9ms.

**The sort is explicit because the loop exists.** Offset paging is correct only if the collection is ordered identically across every request in the loop. Per the IMS v1.1 REST binding, `sort` names the field (`?sort=<data_field>`) while `orderBy` carries only the direction (`asc`/`desc`), and "the form of ordering is implementation dependent" when unspecified.

`sourcedId` is chosen for uniqueness. A non-unique field such as `familyName` leaves ties broken arbitrarily, so page boundaries can shift between requests over identical data.

**Confirmed against the sandbox.** On `/classes/33333/students?sort=sourcedId`, `orderBy=asc` and `orderBy=desc` return exact reverses of each other, and `asc` orders ascending by `sourcedId`. The proxy therefore applies a deliberate total order rather than an unspecified natural order that happens to look sorted — which is the property the pagination loop's page boundaries depend on. (An earlier attempt used `orderBy=dsc`, which returned the `asc` sequence; `dsc` is not the IMS value and was silently discarded.)

Strictly, the reversal proves `orderBy` is honored, not that the `sort` field name is parsed — an ignored `sort` over a default field of `sourcedId` would be indistinguishable. That distinction has no operational consequence: we always send identical parameters, so we always receive the same order, and the effective ordering key is unique either way. Ties, which are what would make an ordering unstable, cannot arise.

**Residual risk the loop does not close.** Three conditions make offset paging correct: a total order, determinism across requests, and a collection that does not change mid-fetch. The sort buys the first two; nothing buys the third under offset paging, since a student added or dropped between pages shifts every subsequent record and can skip one. Only keyset/cursor paging closes it, and ClassLink documents none. The large `PAGE_LIMIT` is what keeps this small — most fetches never make a second request, so there is no window at all — and Decision 3c catches the outcome if it does happen.

**`/applications` is in scope for the same helper, and needs it most.** About 630 districts currently share data with us — already 6× the IMS default `limit` of 100. If that endpoint paginates and we send no explicit limit, we receive the first 100 districts and silently fail tenant lookup for every real district past them. The failure is indistinguishable from "ClassLink rostering is not enabled for your district," so it would be diagnosed as a ClassLink configuration problem rather than as our bug. Whether `/applications` honors `limit`/`offset` at all is an open question.

**Rationale:** Centralizing in one helper means no call site can forget pagination (the Google Classroom integration pages `list_course_students` inline at each call site in `api_controller.rb` — easy to miss on a new endpoint). The empty-page break mirrors ClassLink's own recommended algorithm.

**Alternatives considered:**

- Single request at a large limit with no loop, raising if the response looks truncated: Rejected. It refuses to serve a legitimately paginated collection, turning a case the protocol handles cleanly into a user-visible error, and it leans entirely on the domain bound being exact.
- Single request with a very large limit (e.g. 10000) and no completeness check: Silently truncates any collection exceeding the limit, and nothing enforces the assumption. Rejected.
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

### 3c. A sync that would strip most of a section's roster is refused, not applied

**Decision:** Before `set_exact_student_list` is called with a fetched roster, compare the incoming student count against the section's current student count. If the section currently has at least `SHRINK_GUARD_FLOOR = 5` students and the incoming roster would remove more than `SHRINK_GUARD_RATIO = 0.5` of them, abort the operation, leave the section untouched, log the section id and both counts, and surface a user-facing error. Do not apply a partial roster.

**Rationale:** three independent unknowns converge on one indistinguishable outcome. If One Roster errors arrive as HTTP 200 wrapping an `imsx_codeMajor` envelope, _or_ `x-total-count` is absent so the loop stops after page one, _or_ offset paging is not stably ordered and pages skip records — in every case the client hands `set_exact_student_list` a partial roster, which reads the absences as departures and soft-deletes those `Follower` records. Different causes, identical silent damage.

Note that the guard covers the outcome, not any specific cause, which is why it does not depend on knowing which of these actually occurs in practice. Any fetch that comes back materially smaller than the section — whatever the reason, including a class that has become unreadable — is refused rather than applied.

The guard is deliberately not contingent on answers from ClassLink. Each of those three failure modes could also be introduced later by a proxy change on their side, and none of them is detectable from the response we get. A rail that assumes the fetch may be wrong is cheaper than three separate verifications that must each stay true forever. It also converts the worst failure mode — silent mass-unenrollment discovered weeks later by a teacher — into a visible, reversible error at import time.

The floor exempts small classes, where a legitimate roster change easily exceeds half. Above it, a real end-of-term emptying is refused too — accepted, because a teacher hitting this can delete the section, and the alternative failure is unrecoverable without a database restore.

**Follow-up (out of scope here):** an explicit "yes, really remove these students" confirmation would let the legitimate case through. That needs `RosterDialog` UX beyond Clever/Google parity, so it is deferred. This decision adds a sixth state to the error-copy list.

**Alternatives considered:**

- Validate the fetch instead of the outcome (require `x-total-count` present, reject `imsx` envelopes, verify no duplicate `sourcedId` across pages): Worth doing as well, and cheap — but each check only closes the failure mode it anticipates. The outcome check closes the class. Complementary, not a substitute.
- Warn-and-apply: Preserves the silent-damage outcome, since nobody reads the log until a teacher complains. Rejected.
- Never remove students automatically (additive sync only): Breaks parity — teachers rely on sync to reflect real departures. Rejected.

### 4. Central partner credential model (not per-user OAuth)

ClassLink One Roster uses `CDO.classlink_roster_api_key` (our partner key) to call `/applications`, which returns per-district `bearer` tokens. The teacher's `SourcedId` (from their auth option) is the user identifier passed to One Roster API calls. This is architecturally distinct from Clever/Google Classroom, which use the teacher's own stored OAuth token.

**Environment configuration.** Production holds the real partner key. Staging, test, and adhoc get the **empty string** — not the production key, and not a certification key. Three consequences, each worth stating because they shape how the code and the test plan have to be built:

- **Blank, not nil.** `CDO.classlink_roster_api_key` will be present-but-empty in non-production, so every guard must test `.present?` rather than `.nil?`. A `nil?` check passes on `""` and the client would call `/applications` with an empty key.
- **A blank key means "rostering unavailable," reusing the existing path.** Rather than a new error state, an absent key resolves to the same outcome as a district with no enabled application — the teacher sees the rostering-unavailable message. Nothing raises at boot and nothing raises on an unrelated page. This also simplifies the secret sequencing: only production declares `classlink_roster_api_key: !Secret`, so the eager-load-before-provisioning boot failure can only occur there, and only if the secret is declared before it exists.
- **ClassLink rostering cannot be exercised outside production.** Non-production has no partner key, and ClassLink SSO is not enabled in those environments either, so there is no path to an end-to-end run before release: no UI test coverage of the rostering flow, and no manual QA. The practical effect is that the stubbed-HTTP unit tests (tasks 3.6, 3.6a, 3.7, 3.9) are not a supplement to integration testing — they are the whole safety net, and should be treated as load-bearing. Enabling ClassLink SSO in non-production is a known, easy follow-up if we later decide the coverage gap is worth closing; it is not a prerequisite for this change.

### 5. STI model: `ClasslinkSection < OmniAuthSection`

Mirrors `CleverSection`. `OmniAuthSection.from_omniauth` and `set_exact_student_list` handle the generic student creation and enrollment. `ClasslinkSection.from_service` adapts the One Roster response shape into OmniAuth hashes.

### 5a. Co-teacher flow mirrors Clever/Google Classroom

**Decision:** Co-teachers join an already-imported section by importing the same class themselves — never by being auto-added from roster data. When the section exists and the requester is not yet an instructor, the import endpoint verifies their `SourcedId` against the One Roster `/classes/<classSourcedId>/teachers` endpoint before proceeding; verified requesters are added as `section_instructors` by `OmniAuthSection.from_omniauth` (its existing owner-vs-co-teacher branch), unverified requesters get 403.

**Rationale:** This is exactly the Clever pattern (`clever_teacher_for_course?` queries `sections/{id}/users?role=teacher`) and the Google pattern (`google_teacher_for_course?` calls `list_course_teachers`). One Roster's `/classes/{id}/teachers` is the direct analog. Consistently, teacher records that appear in the `/classes/{id}/students` response are excluded from the student roster — Clever and Google achieve this with server-side filtering (`role=student` query param / students-only endpoint); ClassLink's students endpoint can include teacher records, so we filter by `role == "student"` client-side.

**Alternatives considered:**

- Auto-add all teachers from the class roster as co-teachers: No precedent in Clever/Google; would create instructor records for teachers who never opted in. Rejected.

### 5b. Server-side authorization under the central credential model

**Threat model:** Clever and Google Classroom rostering call provider APIs with the _teacher's own_ user-scoped OAuth token — the provider refuses to serve classes the teacher doesn't teach, so authorization is enforced upstream for free. ClassLink's credentials carry no per-user scoping: each district bearer token can fetch **any class within that district** (blast radius is district-scoped, since bearers are issued and cached per district). Without explicit server-side guards, any authenticated ClassLink user could import or sync any class in their own district — including classes they have no relationship to — by supplying an arbitrary `courseId`.

**Decision:** All authorization is enforced in our application layer, at the single import/sync choke point (`import_classlink_classroom` — the section-row "Sync" action posts to the same endpoint via `importOrUpdateRoster`). Three invariants:

- **I1 — Identity is server-derived.** `TenantId` and teacher `SourcedId` are always read from `current_user`'s v2 ClassLink auth option. Client-supplied tenant, application, or teacher identifiers are never trusted; the district application used for One Roster calls is selected solely by the requester's own `TenantId`. (Because class sourcedIds are only unique per district, this also prevents cross-district access: a `courseId` is only ever resolved within the requester's own tenant.)
- **I2 — Non-instructors must prove class membership via One Roster.** Any import/sync request where the requester is not already a `section_instructor` of the target section — including first import, where no section exists yet — requires their `SourcedId` to appear in the One Roster `/classes/<classSourcedId>/teachers` response. Failure → 403, no section created or modified. This generalizes the co-teacher check from Decision 5a: first import and co-teacher join are the same rule.
- **I3 — Instructors sync on local standing.** A requester who is already a section instructor (owner or co-teacher) in our database may re-sync without re-verification against One Roster, matching Clever (`import_clever_classroom` proceeds on `section_instructor?`).

**Authorization matrix for `import_classlink_classroom(courseId)`:**

| Section exists? | Requester is instructor? | One Roster teacher check | Outcome                                                |
| --------------- | ------------------------ | ------------------------ | ------------------------------------------------------ |
| No              | — (cannot be)            | Required                 | Pass → import as owner; Fail → 403                     |
| Yes             | Yes                      | Skipped                  | Roster update                                          |
| Yes             | No                       | Required                 | Pass → added as co-teacher + roster update; Fail → 403 |

The class-list endpoint (`classlink_classrooms`) is inherently scoped: it queries `/teachers/<SourcedId>/classes` with the requester's own server-derived `SourcedId`.

**Rationale:** The partner credential shifts the authorization burden from the provider to us; the choke-point design keeps every mutation path behind one auditable matrix, and I1 removes the entire class of confused-deputy requests where a client nominates someone else's tenant or identity.

**Alternatives considered:**

- Trusting the class list shown to the teacher (client-side restriction only): Trivially bypassed by direct API calls. Rejected.
- Verifying via `/teachers/<SourcedId>/classes` containment instead of `/classes/<id>/teachers`: Equivalent cost and strength; `/classes/<id>/teachers` chosen for symmetry with `clever_teacher_for_course?` / `google_teacher_for_course?`.
- Re-verifying One Roster membership on every instructor sync: Stronger (catches district-side removal between syncs) but doubles API calls per sync and exceeds Clever/Google parity, where local instructor standing suffices. Deferred; can be added later without design change.

### 6. Frontend: new `OAuthSectionTypes.classlink` provider

Adds ClassLink to the existing `urlByProvider` and `importUrlByProvider` maps in `teacherSectionsRedux.ts`. The `RosterDialog` and `SectionActionDropdown` components require no structural changes.

### 7. Migration creates versioned v2 auth options; legacy records untouched

**Decision:** Migration does NOT rewrite the existing `AuthenticationOption` in place. Instead it creates a **new** ClassLink `AuthenticationOption` on the same user with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` (using the existing `version` column), leaving the legacy `UserId`-format record (v1) intact. This mirrors the Clever v2→v3 API migration (`bin/oneoff/clever/clever_v3_migration.rb` and `Services::Clever::V3AuthOptionBuilder`): dup the legacy option, set the new `authentication_id` and `version`, save. A `Services::Classlink::V2AuthOptionBuilder` follows the same shape, including idempotency (returns nil if a v2 option already exists for the IDs).

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

**Student duplicate accounts** → Students with legacy `UserId`-format auth options who have not yet logged in (and were not bulk-migrated) will not be found when rostering imports them by `<TenantId>|<SourcedId>` — a second account is created, and the original (with any progress) is orphaned once dual-match prefers the new-format record. Since the bulk run is optional, this window can persist into Phase 2. Mitigation: run the bulk script before Phase 2 ships (recommended), and monitor legacy-format record counts.

**Stale cached bearer token** → ClassLink may rotate a district bearer before our cache TTL expires. The 401 recovery flow (refetch, compare, retry once on mismatch) self-heals this on first use; a matching token signals a non-expiry authorization failure and surfaces a user-facing error instead of retry-looping.

**~~`oneroster_application_id` URL encoding in section code~~** → No longer a risk. The application id is not persisted in `section.code` (Decision 2), so its percent-escaped form never enters a UNIQUE, operator-searchable column. The value is still used verbatim as a request path segment, which is covered separately by the escaping rules in Decision 3a.

**Inconsistent casing across ClassLink APIs** → Each API boundary requires explicit field name mapping. Centralize in the client and model, document in code.

**Partner credential over-reach** → Each district bearer can read any class within its district (bearers are issued and cached per district, so the blast radius is district-scoped), meaning a missing or bypassed authorization check exposes other teachers' rosters (student PII) within the requester's district. Mitigation: invariants I1–I3 (Decision 5b) enforced at the single import/sync choke point, with dedicated authorization tests covering forged `courseId`, forged tenant/identity params, and non-instructor sync attempts. A district removing a teacher mid-term is not caught until the co-teacher path re-verifies (accepted, matches Clever/Google parity).

## Migration Plan

The phases below are **deployment** units. Review is organized into four stacked PRs, mapped
in `tasks.md`: PR 1 is Phase 1's auth-id work, PR 2 is Phase 1's bulk script, PR 3 is Phase 2,
PR 4 is Phase 3. Phase 1 spans two PRs because the script is separable review work that ships
within the same deployment phase.

**Phase 1 — ID migration (ships first, prerequisite for Phase 2):**

1. Add `AuthenticationOption::Classlink::VERSION` constant and `Services::Classlink::V2AuthOptionBuilder` (dup v1 option, set `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`; idempotent)
2. Update `omniauth_callbacks_controller.rb`: extract `TenantId` and `SourcedId` from OmniAuth raw_info; new signups create a `version = 'v2'` auth option with the new format
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

None outstanding.

## Settled — and why these are absent from the design

Each entry below records something deliberately _not_ built, so the reasoning survives the
decision. Read this before proposing any of them.

**User-facing copy for all six failure states.** Captured in the spec requirement "Each rostering failure state has specific user-facing copy" and wired by tasks 6.6a/6.6b. Three decisions travelled with it:

- The district-not-enabled and non-expiry-401 states **share one string** — indistinguishable to the teacher, with the distinction preserved in logs for support.
- The 429 string **doubles as the fallback** for any failure lacking its own copy (missing collection key, malformed body, unhandled error). Required, not tidy: `RosterDialog`'s title and login-type switches have no default branch, so an uncovered path renders an empty `<h2>` that reads as a styling bug rather than an error.
- The shrink-guard message **states what was prevented rather than offering to proceed**, so Decision 3c stands unchanged and no confirmation UI enters this release. The reasoning is worth keeping: the guard exists because the fetched roster may be wrong, and a prompt would ask the teacher to ratify a number we have already decided not to trust. The confirmation path remains the deferred follow-up for letting a legitimately emptied class through.

- **Two "ClassLink Account" rows during the migration window are correct — follow the Clever convention.** No UI work is required, and none should be added. `ManageLinkedAccounts.formatAuthOptions` groups auth options by `credentialType` and concatenates every option for each provider (`apps/src/accounts/ManageLinkedAccounts.jsx:182-200`), and `classlink` is already registered in `SingleSignOnProviders` (`apps/src/accounts/constants.js:14`). So a Clever teacher holding both a v2 and a v3 auth option already sees two "Clever Account" rows in production, and ClassLink inherits the identical behavior for free. The v2 row's Disconnect stays unblocked for the same reason: Clever does not block it, and diverging would mean writing ClassLink-specific UI logic to solve a problem the existing convention already accepts.
- **Student `status: "tobedeleted"` is not acted on.** All users in the `/classes/<classSourcedId>/students` response with `role == "student"` are enrolled, regardless of `status`. This is coherent rather than merely simpler: a departure is signaled by the student dropping out of the class roster, which `set_exact_student_list` already handles, so `status` would be a second and redundant channel for the same event — one whose district-by-district semantics we could not verify. Ignoring it removes the risk that a district using `tobedeleted` for routine end-of-term SIS churn would have its students mass-unenrolled every term.
- **Non-production environments will not hold a production partner key.** This closes the data-handling concern that staging and test could read real district rosters. See the follow-up note in Decision 3's secret provisioning about what those environments use instead.
- **`SourcedId` from `v2/my/info` and from One Roster are identical**. This is the equality the whole design rests on: the teacher identifier used at `/teachers/<SourcedId>/classes`, the co-teacher membership check against `/classes/<classSourcedId>/teachers`, and the student `uid` of `<TenantId>|<studentSourcedId>` that links an imported student to the account their SSO login already created. With it confirmed, the silent failure mode it guarded against — students receiving duplicate accounts disconnected from prior progress instead of linking to existing ones — is off the table.
- **`SourcedId` is never blank**. Decision 1 keeps its presence validation regardless, now justified as a guard against our own extraction returning nil rather than against ClassLink's payload — see the rationale there.
- Whether `x-next-page-token` offers cursor paging — ClassLink's best-practices guide documents only `limit`/`offset` with `x-count`/`x-total-count` and never mentions the token, so it is not a usable contract. See Context.
- **No delta sync, and `x-modified` / `x-obfuscated` are ignored.** Both headers are undocumented and were empty in every observation, so neither carries a contract — the same reasoning that rules out `x-next-page-token`. Two consequences accepted deliberately. If `x-modified` supports "changed since timestamp X", we are declining a mechanism that would make re-syncs dramatically cheaper, so the rate-limit exposure stands exactly as the Risks section describes it. And `x-obfuscated` is a correctness question left open: if a district can have its roster data redacted, we would create student accounts with redacted names and not know why. Neither is worth building against an undocumented header, but the second leaves a breadcrumb worth recording — **if roster names ever arrive looking redacted, `x-obfuscated` is the first thing to check.**
- **No `SourcedId` format validation.** Decision 1 requires only non-blank and pipe-free, so the question of whether the value can be UUID-format is moot rather than answered — observed ids include `1234567890`, `7_1553`, `FY`, and `5678_T5678-0005`, and any tighter rule would invent a constraint ClassLink does not state.
- Whether rate limiting and expiry arrive as HTTP 429/401 rather than HTTP 200 with an in-body failure — trusted per ClassLink's documentation, with structural validation and Decision 3c as independent backstops. See Decision 3a.
- **Retired proposal: the zero-match import guard.** It was proposed to catch a wrong student identifier on the first import in a district — refuse rather than mass-create accounts when none of N fetched students match an existing ClassLink auth option. Its entire justification was that the `my/info`↔One Roster equality was unverified. With that confirmed, the remaining exposure is an implementation bug in our own extraction, which unit tests and the Decision 1 validation already cover, and which would surface in the first manual test rather than silently in production. Not worth the threshold-or-acknowledgement complexity it required. Can be added later without design change if duplicate-account reports appear.
