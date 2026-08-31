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
- `SourcedId: "56789"` — the SIS-supplied id, a **string**, distinct from `UserId`. In the documented example it equals `LoginId`. **ClassLink documents this field as empty when the district does not have OneRoster enabled.** That is a routine production state, not an anomaly: those users can never hold a v2 identifier, so the legacy `UserId` format is a permanently supported login path rather than a transitional one, and everything downstream — validation semantics (Decision 1), migration mechanics (Decision 7), the rostering UI gate (Decision 6a) — is shaped by it. The docs speak only to `SourcedId`; whether `TenantId` is also absent in that state is unspecified, and the Decision 1 validation handles either without treating it as an error.
- `TenantId: 123` — an **integer**. `/applications` also returns `tenant_id` as an integer, so the two sides agree in type. Normalize with `to_s` anyway at the comparison and wherever the value is joined into `authentication_id` or a cache key: the id crosses a JSON boundary, a cache key, and a string-joined identifier, and one leg being stringified while another is not is the kind of mismatch that fails silently.
- `Role: "Student"` and `Role_Level: 4` are present, so teacher-vs-student is known at login without an extra call. This does **not** substitute for the `/classes/<classSourcedId>/teachers` check, which answers a different question (does this teacher teach _this_ class).

**Where the callback reads the two values it needs.** `omniauth-classlink` 0.3.1 exposes both in its `info` block — `info[:external_id]` from `SourcedId` and `info[:district_id]` from `TenantId` — confirmed populated in a logged production auth hash. Read those rather than digging `raw_info`: the gem has already done the extraction, and `raw_info` keys arrive snake_cased (`sourced_id`, `tenant_id`) because the gem parses the PascalCase payload into a `SnakyHash::StringKeyed`.

The existing `inject_classlink_data` remains untouched by this change.

**Confirmed against a live sandbox call:**

- `oneroster_application_id` is used **verbatim** in the request path with percent-escapes intact (`/%2FgVa0ed75Gs%43/ims/oneroster/v1p1/...`). It MUST NOT be re-encoded — an HTTP client that escapes path segments will re-encode the leading `%2F` to `%252F` and fail opaquely.
- The district `bearer` is a raw UUID sent as `Authorization: Bearer <uuid>`; it carries no embedded scheme prefix.
- `cltraceid` may be sent empty and the request succeeds, so it is optional.
- `orderBy=asc` is accepted without a paired `sort` parameter.
- Teacher `sourcedId` observed as a plain integer here. Not a general shape — a later capture shows an underscore-and-hyphen composite from another tenant, which is why Decision 1 assumes no format at all.
- Pagination headers confirmed, lowercase and hyphenated: `x-count` (records in this page) and `x-total-count` (records in the collection).
- `x-next-page-token` is also returned (empty on a single-page response), but ClassLink's data best-practices guide documents pagination **solely** in terms of `limit`/`offset` with `x-count`/`x-total-count`, and does not mention the token anywhere. An undocumented header carries no contract: there is no specified parameter to echo it back, and it may change or vanish without notice. Treat it as an observation, not a mechanism — Decision 3a stays on documented offset paging. Recorded here so a later reader does not mistake it for an unexplored option. **Consequence:** the skip-and-duplicate hazard of offset paging over an unstable ordering cannot be designed away with a cursor, so it must be contained instead — see Decision 3a's explicit sort.
- Also returned, semantics not yet established: `x-obfuscated` and `x-modified` (both empty in the observed response), `x-endpoint` (a route/version identifier, likely useful for support escalation), and `x-page-generation-time-ms`.
- `x-page-generation-time-ms` was **365ms for a 2-record page**. Server-side generation is not trivially fast, so a multi-page fetch on the synchronous import path (which holds one of only five Puma threads per worker) may take seconds. Load testing confirms the pattern — see the throughput entry under Risks — so a very large section is a latency concern on the synchronous import path.

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

- **`SourcedId: "5678_T5678-0005"`** — an underscore-and-hyphen composite, apparently `<OrgId>_<LoginId>`, where the documented example was a bare `"1234567890"` equal to `LoginId`. The format is per-district and must never be parsed. It also motivates Decision 1's rejection of a `-` separator: an id this full of dashes puts the structural boundary where no reader can find it. No pipe here, and none in any documented SIS scheme — see the survey in Decision 1, which also explains why the format tolerates one anyway.
- **`OrgId` is an array here (`["5678"]`) but a string (`""`) in the documented example.** ClassLink field _types_ vary between payloads, not only their values. We do not consume `OrgId`, but the lesson generalizes: coerce and check rather than assuming a shape.
- **`Role: "Teacher"` is capitalized, while One Roster returns `role: "teacher"` lowercase.** The two APIs disagree on case for the same concept. `inject_classlink_data` already applies `&.downcase`, so nothing breaks today, but any comparison across the two sources must normalize case first.
- **A field absent from ClassLink's documentation appears here: `or_email`** (value equal to `Email`), presumably the One Roster email. Treat the documented field list as a lower bound, not a contract.
- `TenantId: 2222` is an integer, consistent with `/applications`. `Role_Level: 3` for a teacher, versus `4` for the documented student.

**On the differing `SourcedId` shapes.** The One Roster captures below carry plain integer sourcedIds, while this user's is an underscore-and-hyphen composite. They come from **different tenants**, which fully accounts for the difference — SIS id schemes are per-district. Nothing here bears on the `my/info`↔One Roster equality, which ClassLink has confirmed separately.

**`/applications` body capture:**

**Example Response**

```json
{
  "status": 1,
  "applications": [
    {
      "id": 12345,
      "application_id": 67890,
      "tenant_id": 2222,
      "bearer": "<token>",
      "tenant_name": "Example Tennant",
      "enabled": "true",
      "tenant_status": "Active",
      "oneroster_application_id": "%2FgVa0ed75Gs%43",
      "name": "CodeAI",
      "version": ""
    },
    ...
  ]
}
```

- **What this endpoint is.** Global discovery, not a per-district lookup: it returns the set of tenants (districts/schools) that have enabled _our_ application. There is one call, made with the partner key, and we search its result for the requester's `tenant_id`. Everything below follows from that. A tenant's absence from the list is the legitimate "this district has not enabled ClassLink rostering" signal — which is precisely why any degraded response must be distinguishable from a short list, since both look like absence.
- Objects in the `applications` array are called **records** throughout this document; they have no relationship to database rows.
- **The top-level `status` is an in-body result code**, distinct from the per-record `tenant_status`. Its presence is evidence that this proxy can signal outcomes in the response body, which matters for the 429/401 shape question on the One Roster endpoints. We do **not** gate on it — see Decision 3.
- **`enabled` is the string `"true"`, not a boolean** — and `"false"` is truthy in Ruby, so a bare `if record['enabled']` passes for a disabled district. Compare against `'true'` explicitly.
- **`tenant_status` is a separate check from `enabled`.** Both observed records are `Active`, so the value space is unknown — we cannot tell whether ClassLink already excludes non-active tenants from this response or whether an `Inactive` tenant would appear with `enabled: "true"`. Decision 3 gates on both, on the conservative reading.
- **Of the three id fields, only `oneroster_application_id` is the path segment.** `id` identifies the tenant↔application pairing and `application_id` identifies our registered application; either one in a request path fails opaquely. Same trap as `sourcedId` vs `identifier` on user records.
- `application_id` and `name` are constant across records — every record is our application — so selection is by `tenant_id` alone. No filtering on application name or id is needed.
- Both observed records have distinct `tenant_id`s, so nothing here shows a tenant appearing twice. The "can one `tenant_id` return multiple records" question is unresolved but now looks unlikely; handle it defensively rather than designing for it.

**`/teachers/<SourcedId>/classes` capture:**

**Example Response**

```json
{
  "classes": [
    {
      "sourcedId": "33333",
      "status": "active",
      "dateLastModified": "2025-11-24T19:35:01.000Z",
      "title": "Sci5 (Sci5)",
      "classCode": "",
      "classType": "scheduled",
      "location": "201",
      "grades": [
        "05",
        "11",
        "10",
        "12"
      ],
      "subjects": [
        "Science (grade 5)"
      ],
      "course": {
        "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/courses/7_1111",
        "sourcedId": "7_1111",
        "type": "course"
      },
      "school": {
        "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/orgs/7",
        "sourcedId": "7",
        "type": "org"
      },
      "terms": [
        {
          "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/academicSessions/FY",
          "sourcedId": "FY",
          "type": "academicSession"
        }
      ],
      "subjectCodes": [
        "3235"
      ],
      "periods": [],
      "resources": []
    },
    ...
  ]
}
```

- The envelope key names the _resource type_ returned, not the endpoint — which is why `/classes/<id>/teachers` returns `users`, not `teachers`. Do not key parsing off the endpoint name.
- **`classCode` and `periods` are both empty**, so neither carries a human-meaningful period or section identifier. That settles the section-vs-enrollment-code question: **the section name comes from `title`**, and there is nothing to map to an enrollment code.
- Titles arrive with SIS redundancy (`"Sci5 (Sci5)"`). Display verbatim; do not strip or normalize. Whatever the district put in their SIS is what their teachers will recognize, and a cleanup rule that guesses wrong makes classes harder to identify, not easier.
- **Same-titled classes are indistinguishable in the picker.** With `classCode` and `periods` both empty, a teacher who teaches two sections of `Math5` sees two identical rows; `location` and the `terms[]` reference are the only differentiators available. Not solved here — the class list matches Clever/Google parity, which has the same property — but worth knowing before the first support ticket.
- We do **not** filter on `classType` (One Roster's values are `homeroom` and `scheduled`): a homeroom is a legitimate class to import, and Clever/Google have no equivalent concept to match against.
- **`sourcedId` values are not numeric** — note the underscore in `course.sourcedId` and the alphabetic `terms[].sourcedId`. This confirms Decision 1's refusal to assume a format, and adds an implementation constraint — see below.
- `grades` arrives multi-valued and unsorted, on a class whose title names a single grade. Unused, and not trustworthy as a signal.
- The `href` values point at a **different host than the proxy we authenticate against** — another reminder that response hrefs are not our request path.
- **Confirmed: the endpoint returns only current-term classes, not a teacher's history.** Everything returned is a class the teacher may import, so we do no client-side filtering on `terms[]` or `status` here. This also settles two smaller worries: the import picker stays short, and a teacher's current-term class count sits far below the 1000-class bound behind `PAGE_LIMIT`.
- **This endpoint feeds the import modal only.** It is called to populate the list of classes a teacher may import; sync never uses it, reading `/classes/<classSourcedId>/students` directly from the stored `section.code`. So the term filter does not affect sync, and nothing here needs to change for sections imported in an earlier term. Unverified, and only relevant if it ever comes up: whether a class that has left the current term remains readable at `/classes/<classSourcedId>/students`. If it does, a stale-section sync simply returns the same roster. If it instead returns empty, the sync applies that empty roster and unenrolls the class — recoverable by a later correct sync, since removal soft-deletes the `Follower` and leaves the `User` untouched.

**Path segments: escape `sourcedId`, never escape `oneroster_application_id`.** These two rules point in opposite directions and both are load-bearing. `oneroster_application_id` arrives pre-percent-escaped and must be interpolated **verbatim** — re-encoding turns `%2F` into `%252F` and the request fails opaquely. Class and teacher `sourcedId` values, by contrast, are arbitrary district-supplied strings — `7_1111` and `FY` prove they are not restricted to digits — so any that contain URL-significant characters must be escaped when interpolated. A path builder that applies one policy uniformly is wrong in one direction or the other. Handle the application id as an opaque pre-escaped literal and escape every other interpolated segment.

**`/classes/<classSourcedId>/students` capture:**

**Example Response**

```json
{
  "users": [
    {
      "sourcedId": "12345",
      "status": "active",
      "dateLastModified": "2025-11-24T19:35:01.000Z",
      "username": "foo.bar",
      "userIds": [
        {
          "type": "Fed",
          "identifier": "12345"
        },
        {
          "type": "StateID",
          "identifier": "12494640776"
        }
      ],
      "enabledUser": "true",
      "givenName": "foo",
      "familyName": "bar",
      "middleName": "middle",
      "role": "student",
      "identifier": "22222",
      "email": "foo.bar@example.com",
      "sms": "",
      "phone": "",
      "agents": [
        {
          "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/users/G333333",
          "sourcedId": "G333333",
          "type": "user"
        },
        {
          "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/users/G44444",
          "sourcedId": "G44444",
          "type": "user"
        }
      ],
      "orgs": [
        {
          "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/orgs/2",
          "sourcedId": "2",
          "type": "org"
        }
      ],
      "grades": [
        "11"
      ],
      "password": ""
    },
    ...
  ]
}
```

- Same envelope and record shape as the teachers endpoint, with `role: "student"` lowercase and `identifier` again distinct from `sourcedId`.
- **No `birthDate`, and no `metadata` block of any kind.** The no-date-of-birth premise is confirmed rather than assumed, which makes the `defer_age` change mandatory rather than precautionary — without it, `initialize_new_oauth_user` leaves `age` nil and validation raises an unrescued `ActiveRecord::RecordInvalid` that aborts the whole section sync, not just the offending student.
- **Students _do_ carry an `email`**, a district-issued address. We deliberately do not use it; see below.
- `grades` is present. We have no use for it today; noted only so a future reader knows grade level is available without an extra call.
- **`agents` on a student record are their guardians** — that is what those `type: "user"` hrefs point to. Combined with `password`, `sms`, `phone`, and `middleName`, this settles the data-handling posture: extract only `sourcedId`, `givenName`, `familyName`, and `role`; never log raw payloads; never follow `agents[]` or `orgs[]` hrefs.
- `status` is `active` on every observed record. `tobedeleted` remains unobserved, so the operational question about how districts use it stands.
- Students and their teacher can sit in **different orgs** — compare the `orgs[].href` here against the teacher record below. Irrelevant to this design, which never resolves orgs, but worth knowing before anyone assumes a single org per class.

**Decision: do not pass student email into the section import.** ClassLink supplies it, but both existing OAuth roster providers deliberately drop it. `CleverSection.from_service` builds each student's `AuthHash` with only `name`, `family_name`, and `dob` (`dashboard/app/models/sections/clever_section.rb`), and `GoogleClassroomSection.from_service` passes only `name` and `family_name` (`dashboard/app/models/sections/google_classroom_section.rb:50-57`) — despite both providers exposing student emails. ClassLink follows the same pattern: `sourcedId` becomes the `uid`, and `givenName`/`familyName` become the name fields. This is parity, not a new judgment call, and it keeps roster-imported students free of stored email addresses.

**On `defer_age`: this matches both existing providers, not just Google.** `dashboard/app/models/concerns/user/age.rb:9` defers the age-presence validation for `%w(google_oauth2 clever)` (plus sponsored and LTI users). Every OAuth roster provider we support is already on that list, so adding `classlink` is the established pattern rather than a novel exception. Note the asymmetry it resolves: Clever passes a `dob` when the provider supplies one _and_ defers the validation; ClassLink supplies no `dob` at all, so its students land exactly where Google Classroom students already are today — `age` nil, validation deferred. The product/legal acknowledgement is still worth getting, but the question is "confirm the existing treatment of OAuth-rostered students applies here too," not "approve a new data practice."

**`/classes/<classSourcedId>/teachers` capture:**

**Example Response**

```json
{
  "users": [
    {
      "sourcedId": "11111",
      "status": "active",
      "dateLastModified": "2025-11-24T19:35:01.000Z",
      "username": "bazbat",
      "userIds": [
        {
          "type": "Fed",
          "identifier": "11111"
        },
        {
          "type": "StateID",
          "identifier": "12345678987"
        }
      ],
      "enabledUser": "true",
      "givenName": "baz",
      "familyName": "bat",
      "middleName": "middle",
      "role": "teacher",
      "identifier": "32",
      "email": "baz.bat@example.com",
      "sms": "",
      "phone": "",
      "agents": [],
      "orgs": [
        {
          "href": "https://certs-nj-v2.rosterserver.com/ims/oneroster/v1p1/orgs/7",
          "sourcedId": "7",
          "type": "org"
        }
      ],
      "grades": [],
      "password": ""
    }
  ]
}
```

- **The endpoint exists and returns teacher records.** Invariants I1/I2 and the entire co-teacher flow (Decision 5a) are implementable as specified, rather than assumed from Clever symmetry.
- **`sourcedId` is confirmed as the body field name**, settling what was previously an IMS-spec assumption never observed in a response.
- `role` is lowercase here too, so the client-side `role == "student"` filter in Decision 5a is the right comparison.
- **No primary-vs-co-teacher designation is returned.** This costs nothing: I2 and Decision 5a need only _membership_ — is the requester's `SourcedId` in this list — and section ownership is already determined by who imports first, matching Clever and Google Classroom. One consequence to accept knowingly: if the SIS teacher-of-record imports after a colleague, they join as co-teacher rather than owner. That is existing behavior for every OAuth roster provider, not a ClassLink-specific regression.
- **`identifier` is a separate field from `sourcedId`**, as is each entry in the `userIds` array (a `Fed` id matching the `sourcedId`, plus a `StateID`). Teacher matching must use `sourcedId` and nothing else — four id-shaped fields on one record, and only one is correct.
- `enabledUser` is a string boolean, same hazard as `enabled` on `/applications`.
- `dateLastModified` is present per record — relevant to the `tobedeleted` decision and to any future delta-sync work.
- `orgs[].href` points at **a different host than the proxy we authenticate against.** Never follow hrefs from response bodies; always construct URLs through the proxy with the district bearer. Following them would bypass our credential path entirely.
- The payload carries `password`, `sms`, `phone`, and `middleName`. `password` being present at all means **raw One Roster user payloads must never be logged**, and only the fields we consume should be extracted or persisted.

## Goals / Non-Goals

**Goals:**

- Teachers in ClassLink districts can import their One Roster classes as code.org sections
- Teachers can re-sync existing ClassLink sections to update the student roster
- All existing ClassLink SSO accounts continue to work throughout and after the migration
- Users in districts without OneRoster enabled — whose SSO payload carries no `SourcedId` — sign up and sign in exactly as they do today, indefinitely; a blank `SourcedId` is a supported state, not an error
- Rostering UI is surfaced only to users who hold a v2 ClassLink auth option
- UX matches the Clever rostering experience

**Non-Goals:**

- Bulk district-level background sync (not implementing; per-teacher sync is well inside measured throughput — see Risks)
- Bulk migration of legacy auth records (dropped: non-OneRoster users have no `SourcedId` to migrate to, and with v1 permanent there is no cleanup deadline for the rest — see Decision 7)
- Retiring v1 auth options or removing the legacy `UserId` login path (impossible by construction: it is the only login path for non-OneRoster districts)
- Persisting the district bearer token in the database (cached in the shared cache only; see Decision 3)
- Automatic rostering without teacher action
- ClassLink rostering for student accounts (students are imported via One Roster, not self-rostering)

## Decisions

### 1. `authentication_id` format: `<TenantId>|<SourcedId>`

**Decision:** Store as pipe-delimited `<TenantId>|<SourcedId>` in `AuthenticationOption.authentication_id`.

**Rationale:** `SourcedId` is unique per tenant, not globally. Prefixing with `TenantId` ensures the uniqueness constraint on `authentication_id` is satisfied. Pipe (`|`) matches the existing LTI auth option pattern and is the one separator absent from every observed and documented SIS id scheme, which keeps the boundary visible to a human reading the column.

**The join is unambiguous because only one component is district-supplied.** `TenantId` is assigned by ClassLink and observed as an integer in every capture (`123`, `2222`, and `tenant_id` from `/applications`), so it cannot contain a pipe. `SourcedId` comes from the district's SIS and, per the survey below, may contain any character. That asymmetry is what makes the format safe: **split on the first pipe** and the decomposition is unique for every possible `SourcedId`, including one that contains pipes. `"2|a|b"` can only be tenant `2` with sourcedId `a|b`, because the alternative reading requires a pipe in the tenant.

So the parse is `authentication_id.split('|', 2)` — with the limit, never a bare `split('|')`. The LTI code omits it (`dashboard/lib/services/lti.rb:34` destructures `issuer, client_id, subject = auth_option.authentication_id.split('|')`), and that is correct there for a reason ClassLink cannot borrow: LTI integrates with a **closed set of providers — Schoology and Canvas — whose subject formats have been verified**. ClassLink's `SourcedId` originates in an open set of district-configured SIS sources with no format contract and no way to enumerate them. The `split` limit does the work that provider verification does for LTI; take the pipe convention from LTI, but not the assumption that the components are known quantities.

**Validation is therefore asymmetric.** Both components must be present and non-blank after `to_s`, and `TenantId` must additionally contain no pipe. `SourcedId` is **not** checked for pipes. If a check fails, do not build an `authentication_id` — build nothing and let the login proceed on the legacy v1 path.

**What failure means depends on which component failed, and the two cases log differently.** A blank `SourcedId` is a documented production state — ClassLink specifies the field as empty when the district has no OneRoster enabled — so it is the routing branch to the permanent v1 path, taken silently on every sign-in from such a district. Reporting it as an error would page on routine traffic. A `SourcedId` that is *present* while the id still cannot be built (blank `TenantId`, or a pipe in `TenantId`) has no documented meaning and is reported with the `UserId` for follow-up; the login still falls back to v1 rather than failing.

The blank check on `SourcedId` is doing two jobs, and the second is the load-bearing one. Because `authentication_id` is what login looks users up _by_, a blank second component yields `"<TenantId>|"` for **every user in that tenant** — so the second such user to sign in matches the first user's auth option. That is cross-user account takeover within a district, produced silently by an empty string. The value crosses a gem boundary, a JSON parse, and a string join before it becomes an identifier, and a nil anywhere in that chain produces a well-formed identifier rather than an error. Now that ClassLink documents blank as a real state rather than a hypothetical, the guard is defending against confirmed production traffic, not just our own extraction bugs.

The pipe check on `TenantId` guards a different thing — not district data, but ClassLink changing the field's type out from under us. It costs one comparison and converts an assumption into an assertion.

**Rejecting a pipe-bearing `SourcedId` was considered and dropped.** An earlier draft refused both components. It is stricter than the format requires, and the trade is bad: a pipe in a sourcedId is legal, so a district that emitted one would be permanently unable to log in or roster, with no self-service fix — in exchange for defending against an ambiguity that first-pipe splitting already eliminates.

Format is otherwise not validated. The documented student `SourcedId` is a 10-digit string (`"1234567890"`) while the sandbox teacher path used `12345` — different shapes from different tenants, so any format assumption beyond "non-blank" would be inventing a constraint ClassLink does not state.

**Survey: can a `SourcedId` contain a pipe?** Legally, yes — which is why the format tolerates one rather than rejecting it.

- **The spec permits it.** One Roster types `sourcedId` as `GUID`, a derived `String`, and the v1.2 information model states there is no predefined structure for the GUID. No character set and no pattern; the only practical bound is length (<256 characters).
- **ClassLink does not filter it.** Roster Server's `users.csv` field spec documents `sourcedId` as only "User's uniqueId; used in other files and must be unique across all users." SIS values pass through unsanitized. Two corroborations: vendors publish their own character rules to districts precisely because ClassLink publishes none (Great Minds requires `[a-z] [A-Z] 0-9 hyphen, underscore, dot`), and Roster Server's preprocessor lets a district **synthesize** a sourcedId by concatenating source fields with a configurable join character. The shape is district-configurable, not vendor-fixed, and that preprocessor is the only realistic path by which a pipe would ever reach us.
- **No documented SIS scheme emits one.** Aeries composes most aggressively and still uses only `_` and `-` (`STU_99400001`, `994_1001`, `990_TN_421`, `994_STU_99400001_1001`). Infinite Campus emits a GUID (`5356590D-A812-4E74-AF6F-4C96C00264CC`). PowerSchool emits the district permanent student id — digits, possibly with leading zeros. Skyward Qmlativ is One Roster 1.1 certified with no publicly documented shape. Our own captures agree: `12345`, `7_1111`, `FY`, `G333333`, `5678_T5678-0005`.

Probability is low and the blast radius is one district, but the value is not ours to constrain. Tolerating a pipe costs a `split` limit; rejecting one costs a district.

**A pipe in a path segment needs no new rule.** `|` is neither reserved nor unreserved under RFC 3986, so it must be percent-encoded (`%7C`) when interpolated into a request path. Decision 3a already requires escaping every `sourcedId` path segment — this only means that requirement must not be relaxed.

**Alternatives considered:**

- `<TenantId>-<SourcedId>`: First-pipe splitting works the same way with any separator the tenant cannot contain, so a dash is no longer a _correctness_ argument. It is rejected on legibility: observed sourcedIds are dense with dashes (UUIDs, `5678_T5678-0005`), which puts the boundary somewhere a human reading the column cannot see. A pipe appears in none of them.
- Store in `data` JSON column: Would require extra parsing logic everywhere; the uniqueness constraint lives on `authentication_id`. Rejected.
- New `ClasslinkUserIdentity` model (like `LtiUserIdentity`): Extra schema complexity not warranted here; the uniqeness constraint is still relevant. Rejected.

### 2. `Section.code` format: `CL-<TenantId>|<classSourcedId>`

**Decision:** Prefix `CL-` (consistent with `C-` for Clever and `G-` for Google Classroom), then `<TenantId>|<classSourcedId>`. The `oneroster_application_id` is **not** persisted in the code.

**Rationale for each part:**

- **`TenantId`** is present for uniqueness only. Class `sourcedId` values are unique per district, not globally, so two districts can both have class `33520`; the tenant scopes it. `sections.code` carries a UNIQUE index across every section in the system, so this is a correctness requirement, not decoration.
- **`classSourcedId`** is the value actually used at request time, as the path segment for `/classes/<classSourcedId>/students`.
- **Parsing is strip-then-split-on-first-pipe**: remove the `CL-` prefix, then `split('|', 2)`. This inherits Decision 1's reasoning unchanged — `TenantId` is a ClassLink-assigned integer, so it cannot contain a pipe, so the decomposition stays unique even for a `classSourcedId` that contains one. A bare `split('|')` is wrong here for the same reason it is wrong there.
- **The `CL-` prefix is retained deliberately, though it is not load-bearing.** Provider identity comes from `login_type` — `section.rb:83` sets `self.inheritance_column = :login_type` — so the prefix does no dispatch work, and `TenantId|classSourcedId` could not collide with a six-letter join code or a `C-`/`G-` code on shape alone. It is kept for operational legibility: `sections.code` is UNIQUE-indexed and searched by operator input in three places in `admin_search_controller`, and `CL-2222|33520` identifies itself where `2222|33520` does not. Consistency across the column matters too — a reader seeing `G-`, `C-`, and `CL-` understands the scheme, whereas one prefix-less provider is a special case requiring explanation forever. Dropping it would also simplify no code, since the code is parsed either way.

**Why the application id is not persisted.** An earlier draft embedded `oneroster_application_id` to avoid a second `/applications` lookup "for routing." That rationale does not survive inspection: every One Roster request needs the district `bearer`, and the bearer and the `oneroster_application_id` arrive together in the same cached record from the same cache-aside lookup (Decision 3). The lookup happens regardless, so embedding the application id saved nothing and cost three things — a percent-escaped `%2F…%3D` blob inside a UNIQUE, admin-searchable column; a compound the frontend had to disassemble; and a client-supplied application id round-tripping through the browser, which invariant I1 exists to prevent.

**The `TenantId` in the code is never the source of the tenant used for credential lookup.** That value always comes from `current_user`'s v2 auth option, per invariant I1. The code's copy exists for uniqueness and for reading a row in the database; treating it as an input would reintroduce exactly the client-supplied-identity problem this format removes. Note also that a tenant-mismatch check between code and requester is deliberately _not_ specified: I2 and I3 already gate authorization, and a teacher who changes districts would trip such a check on their old sections for no benefit.

**Consequence for the frontend, which breaks an assumption two call sites make.** Clever and Google Classroom section codes are a prefix plus a bare course id, and `SyncOmniAuthSectionControl.jsx:89` and `SectionActionDropdown.jsx:119` both encode that assumption as `sectionCode.replace(/^[GC]-/, '')`. A ClassLink code violates it twice: `/^[GC]-/` does not match `CL-` (the pattern wants `-` where the code has `L`), and the remainder is a pipe-joined pair rather than an id. The frontend sends **only the `classSourcedId`** — everything after the first pipe — and never the tenant, which the server derives from `current_user`.

**Alternatives considered:**

- `CL-<oneroster_application_id>|<classSourcedId>`: The earlier draft. Rejected once the routing rationale proved false — see above.
- `CL-<classSourcedId>` with no tenant: Smallest and most legible, but class sourcedIds are only district-unique, so two districts holding the same class id would collide on a UNIQUE column. Rejected.
- No prefix, `<TenantId>|<classSourcedId>`: Collision-safe and functionally equivalent, but forfeits legibility in an operator-facing column and makes ClassLink the only provider without a prefix. Rejected on consistency grounds rather than correctness.
- `CL-<TenantId>-<classSourcedId>`: Not ambiguous under first-dash splitting, but unreadable — the prefix itself ends in a dash and observed sourcedIds are full of them, so `CL-2222-5678_T5678-0005` has four dashes and only the second is structural. Rejected on legibility, same as in Decision 1.

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

**Structural validation is what lets us trust the documented error codes.** We accept ClassLink's documentation that rate limiting arrives as HTTP 429 and expired authorization as HTTP 401, rather than as HTTP 200 wrapping an in-body failure — a reasonable call, since their docs are the best evidence available and no capture contradicted it. What makes it safe rather than hopeful is that the structural check does not depend on it: a 200 carrying an error envelope (`imsx_codeMajor` or anything else) simply lacks the expected collection key and raises. We get protection against the failure mode without needing to know its format. If the documented behavior turns out to be wrong, the structural check is what converts it into a loud error rather than a silently truncated roster.

**Why three stop conditions rather than one.** The short-page rule is the load-bearing one: it needs no headers, so it is the only condition that terminates correctly on `/applications`, which sends none. Where `x-total-count` _is_ sent, it is a redundant confirmation rather than a competing rule — both conditions fire on the same final page. Keeping all three means one code path serves both endpoint families, and a future ClassLink endpoint that omits the count headers does not silently inherit a truncation bug.

The cost is one extra request whenever a collection's size is an exact multiple of `PAGE_LIMIT`, which returns zero records and stops. That is a rounding error — 9ms on `/applications`, and it cannot happen at all for the One Roster collections while their totals stay under 1000.

The residual risk is a server that returns a short page that is _not_ the last page; we would stop early. Wherever `x-total-count` is sent, the third condition catches exactly that. On `/applications` there is nothing to catch it with, so that endpoint relies on the short-page rule alone.

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

**Residual risk the loop does not close.** Three conditions make offset paging correct: a total order, determinism across requests, and a collection that does not change mid-fetch. The sort buys the first two; nothing buys the third under offset paging, since a student added or dropped between pages shifts every subsequent record and can skip one. Only keyset/cursor paging closes it, and ClassLink documents none. The large `PAGE_LIMIT` is what keeps this small — most fetches never make a second request, so there is no window at all — so in practice the window rarely opens at all.

**`/applications` is in scope for the same helper, and needs it most.** About 630 districts currently share data with us — already 6× the IMS default `limit` of 100. If that endpoint paginates and we send no explicit limit, we receive the first 100 districts and silently fail tenant lookup for every real district past them. The failure is indistinguishable from "ClassLink rostering is not enabled for your district," so it would be diagnosed as a ClassLink configuration problem rather than as our bug. Whether `/applications` honors `limit`/`offset` at all is an open question.

**Rationale:** Centralizing in one helper means no call site can forget pagination (the Google Classroom integration pages `list_course_students` inline at each call site in `api_controller.rb` — easy to miss on a new endpoint). The empty-page break mirrors ClassLink's own recommended algorithm.

**Alternatives considered:**

- Single request at a large limit with no loop, raising if the response looks truncated: Rejected. It refuses to serve a legitimately paginated collection, turning a case the protocol handles cleanly into a user-visible error, and it leans entirely on the domain bound being exact.
- Single request with a very large limit (e.g. 10000) and no completeness check: Silently truncates any collection exceeding the limit, and nothing enforces the assumption. Rejected.
- Paginate inline at each call site (Google Classroom style): Duplicated loop logic, and a future endpoint can forget it. Rejected in favor of the shared helper.

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

### 6a. Rostering UI is surfaced only to holders of a v2 auth option

**Decision:** The teacher-dashboard roster-provider payload includes `classlink` only when the current user holds a ClassLink auth option with `version = 'v2'`. A user with only a legacy v1 record — whether unmigrated or in a district without OneRoster — sees no ClassLink rostering entry point at all.

**Mechanism.** The gate has a single natural seam, already traced end to end: `teacher_dashboard/show.html.haml:35` serializes `@current_user.providers` into the page payload, `sites/studio/pages/teacher_dashboard/show.js:82` dispatches it via `setAuthProviders`, and `LoginTypePicker.jsx` is the **only consumer** of the resulting redux `providers` list — it is what makes the Clever entry appear (`providers.includes(OAuthSectionTypes.clever)`). Filtering `classlink` out of that one payload unless the user holds a v2 option gates the UI exactly the way Clever's presence check already works, with no new plumbing and no new frontend state. `User#providers` itself keeps its meaning everywhere else (it answers "which credentials does this user have," which is a different question).

**Why hide rather than prompt.** An earlier draft showed v1-only teachers a "sign out and sign back in" message. That message is only correct for teachers in OneRoster-enabled districts; for a non-OneRoster district it is a false promise — re-login produces no `SourcedId` and no v2 option, ever — and from the payload alone the two populations are indistinguishable (a v1 record stores only `UserId`). Hiding the entry is right for both: the non-OneRoster teacher is never taunted with a feature their district cannot use, and the OneRoster-district teacher picks up a v2 option at their next natural SSO sign-in (login-time migration, Decision 7), after which the entry appears on its own. The accepted cost: that second group gets no explicit nudge to re-login. SSO sessions are short enough that convergence is a matter of days, not a state anyone must act on.

**The backend check stays regardless.** The rostering endpoints still error when the requester has no v2 auth option (task 5.1) — the UI gate is a visibility decision, not an authorization boundary. The no-v2 request remains reachable: direct API calls, a stale page, and the real product path of a co-teacher added to a ClassLink section by email invitation who then triggers the section-row sync action (that action is rendered per-section by login type, not per-user by credential).

### 7. Versioned v2 records alongside permanent v1 records; login-time migration only

**Decision:** Migration does NOT rewrite the existing `AuthenticationOption` in place. Instead it creates a **new** ClassLink `AuthenticationOption` on the same user with `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'` (using the existing `version` column), leaving the legacy `UserId`-format record (v1) intact. This mirrors the Clever v2→v3 API migration (`Services::Clever::V3AuthOptionBuilder`): dup the legacy option, set the new `authentication_id` and `version`, save. A `Services::Classlink::V2AuthOptionBuilder` follows the same shape, including idempotency (returns nil if a v2 option already exists for the IDs).

**v1 and v2 are both permanent populations, not a transition.** ClassLink documents `SourcedId` as empty when a district has no OneRoster enabled, so those districts' users cannot hold a v2 identifier at all: they sign up with v1-format records (`authentication_id = <UserId>`, `version` nil, exactly as before this change) and sign in through the `UserId` lookup, indefinitely. The dual-match lookup is therefore durable routing logic, not a migration window with an end date — there is no cleanup phase, no fallback removal, and no v1 retirement. A district that later enables OneRoster needs no code change and no operation: its users' payloads start carrying `SourcedId`, and each user picks up a v2 option at their next sign-in.

**Why versioned records instead of in-place rewrite:**

- **Trivial rollback** — deleting v2 ClassLink auth options (for users who retain a v1 record) restores the pre-migration state exactly. In-place rewrite required a reverse migration script.
- **Dual-match is structural, not logical** — both records exist as ordinary rows, so login by either ID resolves to the same user through the normal `(credential_type, authentication_id)` lookup. The only special logic is the fallback lookup order in the callback (try v2-format uid first, then legacy `UserId`) and creating the v2 record on a legacy match.
- **Proven pattern** — the Clever v3 migration shipped this way; the model and constraints already support multiple same-provider auth options per user.

**Login-time migration is the only migration mechanism.** A legacy user signs in; when the payload carries a `SourcedId`, the v2-format lookup misses, the fallback lookup by `UserId` finds the v1 record, and the system creates the v2 auth option from the live OmniAuth response via the builder. When the payload carries no `SourcedId` (non-OneRoster district), no v2 option is created and none ever should be — the sign-in simply proceeds on v1. No stored token is involved in either case.

**The bulk migration script is dropped, not deferred.** An earlier revision built a one-off script (modeled on `clever_v3_migration.rb`) that called `v2/my/info` with each v1-only user's stored token. Two things killed it:

- **Its purpose is gone.** The script existed to converge the population toward zero v1-only records so the dual-match fallback could be removed at cleanup. With non-OneRoster districts holding v1 forever, that convergence is unreachable by definition and the fallback is permanent — a bulk run no longer unlocks anything.
- **It cannot tell its two failure modes apart.** A v1 record stores only `UserId`; which district — and therefore whether OneRoster is enabled there — is unknowable without calling `v2/my/info` per user. A blank `SourcedId` in the response means "unmigratable by design," a failed call means "token no longer honored," and every run re-churns through both populations to migrate only the remainder — users whom login-time migration reaches anyway, with a fresh token and zero operational risk.

The residual cost of having no bulk lever is the duplicate-student window, which shrinks only as students sign in — see the reshaped Risks entry.

**Versioning semantics:** `version = 'v2'` marks the new ID format; a v1-format record carries `version` nil, including new v1 signups from non-OneRoster districts. Creation sites that copy an id they did not build stamp the column with `AuthenticationOption::Classlink.version_for`, so the version always describes the id's actual format. `AuthenticationOption::Classlink::VERSION = {v2: 'v2'}.freeze` mirrors the Clever module constant.

**Alternatives considered:**

- In-place rewrite of `authentication_id`: Loses the original value, making rollback require a reverse migration and making partial-failure states hard to audit. Rejected.
- Bulk migration script (build and optionally run): Rejected outright once `SourcedId` was documented as empty for non-OneRoster districts — see above. The reasoning is preserved in the Settled section so it is not re-proposed.
- Marking v1 records with an explicit `version = 'v1'`: The existing ~14k records carry nil, so stamping new v1 signups differently would split one population into two spellings for no query we need. Nil already means "legacy format" unambiguously. Rejected.

## Risks / Trade-offs

**API throughput** → ClassLink does not publish rate limits, and load testing found none: 8,400 requests across two sustained runs returned zero 429s. What it did find is **latency degradation in place of rejection**. At 40 rps for 120s, p50 was 351ms and p95 469ms; at 60 rps for 60s, p95 rose to 7,396ms and max to 11,574ms — every response still a 200. The ceiling is therefore throughput-related slowness, not a limit we can detect from a status code, and it matters because each in-flight One Roster call holds one of five Puma threads per worker. Per-teacher, user-triggered sync sits far below the knee between 40 and 60 rps. Monitor latency rather than 429 counts; if sustained load ever approaches that range, escalate to background jobs (ActiveJob) or district-level bulk sync. The 40 rps run also produced 2 transient 500s (~0.04%); with no retry these surface to the teacher as the generic rostering failure.

**Student duplicate accounts** → A student in an OneRoster-enabled district who holds a legacy `UserId`-format auth option and has not signed in since Phase 1 deployed will not be found when rostering imports them by `<TenantId>|<SourcedId>` — a second account is created, and the original (with any progress) is orphaned once dual-match prefers the new-format record at their next login. With the bulk script dropped, this window closes only as students sign in, and import-time linking to the legacy account is impossible by construction: the v1 record stores only `UserId`, which One Roster data never carries. Mitigation is sequencing, not tooling — let Phase 1 run in production for a while before Phase 2 reaches teachers, so routine SSO logins (sessions are short) converge the active students first. The residual — a rostered class containing a student who truly has not signed in across the whole gap — is accepted.

**Stale cached bearer token** → ClassLink may rotate a district bearer before our cache TTL expires. The 401 recovery flow (refetch, compare, retry once on mismatch) self-heals this on first use; a matching token signals a non-expiry authorization failure and surfaces a user-facing error instead of retry-looping.

**~~`oneroster_application_id` URL encoding in section code~~** → No longer a risk. The application id is not persisted in `section.code` (Decision 2), so its percent-escaped form never enters a UNIQUE, operator-searchable column. The value is still used verbatim as a request path segment, which is covered separately by the escaping rules in Decision 3a.

**Inconsistent casing across ClassLink APIs** → Each API boundary requires explicit field name mapping. Centralize in the client and model, document in code.

**Partner credential over-reach** → Each district bearer can read any class within its district (bearers are issued and cached per district, so the blast radius is district-scoped), meaning a missing or bypassed authorization check exposes other teachers' rosters (student PII) within the requester's district. Mitigation: invariants I1–I3 (Decision 5b) enforced at the single import/sync choke point, with dedicated authorization tests covering forged `courseId`, forged tenant/identity params, and non-instructor sync attempts. A district removing a teacher mid-term is not caught until the co-teacher path re-verifies (accepted, matches Clever/Google parity).

## Migration Plan

The phases below are **deployment** units. Review is organized into two stacked PRs, mapped
in `tasks.md`: PR 1 is Phase 1's auth-id work, PR 2 is Phase 2's rostering. There is no
cleanup phase: the v1 login path is permanent (Decision 7), so nothing is ever removed or
retired.

**Phase 1 — ID migration (ships first, prerequisite for Phase 2):**

1. Add `AuthenticationOption::Classlink::VERSION` constant and `Services::Classlink::V2AuthOptionBuilder` (dup v1 option, set `authentication_id = <TenantId>|<SourcedId>` and `version = 'v2'`; idempotent)
2. Update `omniauth_callbacks_controller.rb`: extract `TenantId` and `SourcedId` from the gem's info block; new signups create a `version = 'v2'` auth option with the new format when `SourcedId` is present, and an unversioned v1-format option (exactly as today) when it is blank
3. Add dual-match login with login-time migration: try v2-format lookup first, fall back to legacy `UserId` lookup; on a legacy match with a `SourcedId` in hand, create the v2 auth option via the builder (v1 record untouched); with no `SourcedId`, sign in on v1 and create nothing
4. Deploy Phase 1 — login-time migration of OneRoster-district users begins immediately
5. Let it run: routine SSO logins converge active users in OneRoster districts before Phase 2 reaches teachers (this gap is the duplicate-student mitigation — see Risks). Note that the global v1-only record count is **not** a convergence metric: non-OneRoster users hold v1 forever by design, and a v1 record alone cannot tell you which population it belongs to

**Phase 2 — Rostering:**

1. Ship `ClasslinkSection`, `Clients::ClasslinkOneRoster`, backend endpoints, frontend additions
2. Surface the rostering UI only to users holding a v2 auth option, via the teacher-dashboard providers payload (Decision 6a); the endpoints independently error for no-v2 requesters

**Rollback:** Phase 1 rollback is non-lossy: delete ClassLink auth options with `version = 'v2'` **for users who also retain a v1 record** and revert the code — the untouched v1 records restore the pre-migration state exactly. Users who signed up after Phase 1 with a `SourcedId` have a v2 record as their _only_ auth option; those must be excluded from the delete (they have no v1 to fall back to). Phase 2 rollback is a feature flag or route removal. Bearer cache entries expire naturally via TTL; a cache namespace bump invalidates them immediately if needed.

## Open Questions

None outstanding.

## Settled — and why these are absent from the design

Each entry below records something deliberately _not_ built, so the reasoning survives the
decision. Read this before proposing any of them.

**User-facing copy for the failure states.** Captured in the spec requirement "Each rostering failure state has specific user-facing copy" and wired by tasks 6.5/6.6. Three decisions travelled with it:

- The district-not-enabled and non-expiry-401 states **share one string** — indistinguishable to the teacher, with the distinction preserved in logs for support.
- One string **doubles as the fallback** for any failure lacking its own copy (missing collection key, malformed body, unhandled error). Required, not tidy: `RosterDialog`'s title and login-type switches have no default branch, so an uncovered path renders an empty `<h2>` that reads as a styling bug rather than an error.

- **Two "ClassLink Account" rows for a migrated user are correct — follow the Clever convention.** A user holding both a v1 and a v2 record sees two rows, permanently. No UI work is required, and none should be added. `ManageLinkedAccounts.formatAuthOptions` groups auth options by `credentialType` and concatenates every option for each provider (`apps/src/accounts/ManageLinkedAccounts.jsx:182-200`), and `classlink` is already registered in `SingleSignOnProviders` (`apps/src/accounts/constants.js:14`). So a Clever teacher holding both a v2 and a v3 auth option already sees two "Clever Account" rows in production, and ClassLink inherits the identical behavior for free. The v2 row's Disconnect stays unblocked for the same reason: Clever does not block it, and diverging would mean writing ClassLink-specific UI logic to solve a problem the existing convention already accepts.
- **Student `status: "tobedeleted"` is not acted on.** All users in the `/classes/<classSourcedId>/students` response with `role == "student"` are enrolled, regardless of `status`. This is coherent rather than merely simpler: a departure is signaled by the student dropping out of the class roster, which `set_exact_student_list` already handles, so `status` would be a second and redundant channel for the same event — one whose district-by-district semantics we could not verify. Ignoring it removes the risk that a district using `tobedeleted` for routine end-of-term SIS churn would have its students mass-unenrolled every term.
- **Non-production environments will not hold a production partner key.** This closes the data-handling concern that staging and test could read real district rosters. See the follow-up note in Decision 3's secret provisioning about what those environments use instead.
- **`SourcedId` from `v2/my/info` and from One Roster are identical**. This is the equality the whole design rests on: the teacher identifier used at `/teachers/<SourcedId>/classes`, the co-teacher membership check against `/classes/<classSourcedId>/teachers`, and the student `uid` of `<TenantId>|<studentSourcedId>` that links an imported student to the account their SSO login already created. With it confirmed, the silent failure mode it guarded against — students receiving duplicate accounts disconnected from prior progress instead of linking to existing ones — is off the table.
- **Corrected: `SourcedId` CAN be blank, and blank is a documented state.** An earlier revision recorded ClassLink confirming `SourcedId` is never blank upstream; their documentation says otherwise — the field is empty when the district does not have OneRoster enabled. This flipped three decisions at once: v1 support went from transitional to permanent (Decision 7), the cleanup phase and the bulk migration script were dropped (below), and the rostering UI became gated on holding a v2 option (Decision 6a). The Decision 1 blank check is unchanged in behavior — build nothing, proceed on v1 — but a blank `SourcedId` no longer reports as an anomaly, because it now describes routine traffic.
- **Removed: the bulk migration script.** Built on a feature branch, then dropped rather than deferred, for two reasons recorded in Decision 7. Its purpose was to converge v1-only records toward zero so the dual-match fallback could be removed at cleanup; with non-OneRoster districts holding v1 forever, that end state is unreachable and the fallback is permanent, so a bulk run no longer unlocks anything. And it cannot tell "unmigratable by design" (blank `SourcedId` in the `v2/my/info` response) from "stored token no longer honored" without calling per user — a v1 record stores only `UserId`, which identifies no district — so every run re-churns both populations to reach only users that login-time migration reaches anyway, with a fresh token and zero operational risk. Do not re-propose it without naming a concrete population it can reach that sign-ins cannot.
- **Removed: Phase 3 cleanup (dual-match fallback removal and v1 retirement).** The fallback lookup by `UserId` is not scaffolding to be dismantled; it is the only login path for non-OneRoster districts, and new v1-format signups continue there indefinitely. There is no gate metric to watch either — a global v1-only count never converges, and a v1 record alone cannot say which population it belongs to. Anyone proposing to remove the fallback is proposing to lock every non-OneRoster district out of their accounts.
- Whether `x-next-page-token` offers cursor paging — ClassLink's best-practices guide documents only `limit`/`offset` with `x-count`/`x-total-count` and never mentions the token, so it is not a usable contract. See Context.
- **No delta sync, and `x-modified` / `x-obfuscated` are ignored.** Both headers are undocumented and were empty in every observation, so neither carries a contract — the same reasoning that rules out `x-next-page-token`. Two consequences accepted deliberately. If `x-modified` supports "changed since timestamp X", we are declining a mechanism that would make re-syncs dramatically cheaper, so re-syncs stay full fetches — acceptable given measured throughput, but it forecloses the cheapest lever if load ever becomes a concern. And `x-obfuscated` is a correctness question left open: if a district can have its roster data redacted, we would create student accounts with redacted names and not know why. Neither is worth building against an undocumented header, but the second leaves a breadcrumb worth recording — **if roster names ever arrive looking redacted, `x-obfuscated` is the first thing to check.**
- **No `SourcedId` format validation, including no pipe rejection.** Decision 1 requires only non-blank, so the question of whether the value can be UUID-format is moot rather than answered — observed ids include `1234567890`, `7_1111`, `FY`, and `5678_T5678-0005`, and any tighter rule would invent a constraint ClassLink does not state. A survey of the spec, ClassLink's field docs, and the major SIS vendors confirmed a pipe is legal though unattested; first-pipe splitting makes it harmless, so it is tolerated rather than rejected. See the survey in Decision 1 for why rejecting it would strand a district permanently.
- Whether expiry arrives as HTTP 401 rather than HTTP 200 with an in-body failure — trusted per ClassLink's documentation, with structural validation of the response envelope as the backstop. See Decision 3a.
- **Removed: 429 rate-limit handling and browser-side retry.** An earlier draft propagated 429s to the browser and retried there with exponential backoff, on the assumption that an unpublished rate limit would bite under load. Load testing found no limit to handle: **8,400 requests across two sustained runs returned zero 429s** (60 rps for 60s, and 40 rps for 120s). What the runs did show is that ClassLink degrades by getting slower rather than by rejecting — p95 went from 469ms at 40 rps to 7,396ms at 60 rps with every response still a 200 — so a status-code-triggered retry would never have fired anyway. A 429, if one ever appears, now falls through to the generic rostering-failure message along with any other unhandled status, and the teacher can repeat the action. Re-adding a retry is a self-contained feature if monitoring ever justifies it; the throughput entry under Risks records what to watch instead.
- **Removed: the roster-shrink guard.** An earlier draft refused any sync that would remove more than half of a section's students, on the argument that three unknowns — an error delivered as HTTP 200, a missing `x-total-count`, and unstable page ordering — all converge on the same silent partial roster. Each of those has since been addressed on its own terms: structural validation rejects a response whose collection key is absent or non-array, short-page termination needs no count headers, and `sort=sourcedId` is confirmed to produce a stable total order. What remained was a guard against ClassLink returning a genuinely smaller roster, which is ClassLink being the source of truth rather than a failure. The outcome is also recoverable: `set_exact_student_list` soft-deletes the `Follower` and leaves the `User` and its progress intact, so a later correct sync restores membership, and a class that drops to zero is immediately visible to its teacher. Treat mass removal as a bug to fix, not a state to defend against.
- **Retired proposal: the zero-match import guard.** It was proposed to catch a wrong student identifier on the first import in a district — refuse rather than mass-create accounts when none of N fetched students match an existing ClassLink auth option. Its entire justification was that the `my/info`↔One Roster equality was unverified. With that confirmed, the remaining exposure is an implementation bug in our own extraction, which unit tests and the Decision 1 validation already cover, and which would surface in the first manual test rather than silently in production. Not worth the threshold-or-acknowledgement complexity it required. Can be added later without design change if duplicate-account reports appear.
