## ADDED Requirements

### Requirement: Teacher can view available ClassLink classes
A teacher with a v2 ClassLink auth option (`authentication_id = <TenantId>|<SourcedId>`, `version = 'v2'`) SHALL be able to retrieve a list of their One Roster classes to import as sections.

#### Scenario: Teacher lists available classes
- **WHEN** a teacher with a v2 ClassLink auth option requests their ClassLink class list
- **THEN** the system resolves the district application (bearer token and `oneroster_application_id`) for the teacher's `TenantId` via the cache-aside lookup, then calls the One Roster `/teachers/<SourcedId>/classes` endpoint, and returns the list of active classes

#### Scenario: Teacher has no matching district application
- **WHEN** a teacher's `TenantId` does not match any application in the `/applications` response (or the matching application has `enabled != "true"`)
- **THEN** the system returns an appropriate error and the teacher sees a message indicating ClassLink rostering is unavailable for their district

#### Scenario: Teacher has not yet been migrated
- **WHEN** a teacher without a v2 ClassLink auth option (legacy v1 record only) attempts to access ClassLink rostering
- **THEN** the system returns an error prompting the teacher to sign out and sign back in to enable rostering (login-time migration creates their v2 record)

### Requirement: Rostering identity is derived server-side
Because ClassLink rostering uses a central partner credential (not a user-scoped token), the system SHALL derive `TenantId` and teacher `SourcedId` exclusively from the authenticated user's v2 ClassLink auth option. Client-supplied tenant, application, or teacher identifiers SHALL never be used to select the district application or identify the requester.

#### Scenario: District application is selected by the requester's own TenantId
- **WHEN** any rostering endpoint resolves district credentials
- **THEN** the application is selected by the `TenantId` parsed from `current_user`'s v2 auth option, so a supplied `courseId` is only ever resolved within the requester's own district

#### Scenario: Forged identity parameters are ignored
- **WHEN** a request to a rostering endpoint includes tenant, application, or teacher-SourcedId parameters that differ from the authenticated user's own values
- **THEN** the system ignores the supplied values and uses only the server-derived identity

### Requirement: Teacher can import a ClassLink class as a section
A teacher SHALL be able to import a One Roster class they teach, creating a new code.org section populated with the class's current student roster. Because the partner credential itself grants no per-user scoping, the system SHALL verify via the One Roster `/classes/<classSourcedId>/teachers` endpoint that the requester teaches the class before creating a section.

#### Scenario: Successful class import
- **WHEN** a teacher selects a class to import and their `SourcedId` appears in the One Roster `/classes/<classSourcedId>/teachers` response
- **THEN** the system resolves the district bearer token via the cache-aside lookup, calls `/classes/<classSourcedId>/students`, filters for users with `role == "student"`, creates or finds each student's account using `<TenantId>|<studentSourcedId>` as the authentication_id, creates a `ClasslinkSection` with `code = CL-<TenantId>|<classSourcedId>`, and enrolls all rostered students

#### Scenario: Teacher cannot import a class they do not teach
- **WHEN** an authenticated ClassLink user requests import of a `courseId` in their district and their `SourcedId` does not appear in the One Roster `/classes/<classSourcedId>/teachers` response
- **THEN** the system returns 403 Forbidden, creates no section, and enrolls no students

#### Scenario: Imported students have no date of birth
- **WHEN** students are created from a One Roster class roster, which carries no `birthDate` field
- **THEN** each account is created with `age` nil and the age-presence validation deferred, matching the existing treatment of Google Classroom and Clever rostered students, and no student's missing date of birth aborts the import of the rest of the class

#### Scenario: Student already has a code.org account via ClassLink SSO
- **WHEN** a student being imported already has a `AuthenticationOption` with `authentication_id = <TenantId>|<studentSourcedId>`
- **THEN** the system links the existing account to the section rather than creating a duplicate

#### Scenario: One Roster response includes teacher records
- **WHEN** the `/classes/<classSourcedId>/students` response contains users with `role == "teacher"`
- **THEN** the system excludes those records from the student roster and only enrolls users with `role == "student"` (matching Clever and Google Classroom, where teachers are never imported as section members)

#### Scenario: Class has already been imported by the same teacher
- **WHEN** a teacher imports a class whose `section.code` already exists and the teacher is already an instructor of that section
- **THEN** the system updates the existing section's roster (add/remove students to match current One Roster data) rather than creating a duplicate section

### Requirement: Co-teachers can join an already-imported class
When a teacher imports a class whose section already exists and they are not yet an instructor, the system SHALL verify via the One Roster API that they are listed as a teacher for that class before granting access, matching the Clever and Google Classroom co-teacher flow.

#### Scenario: Verified co-teacher is added as section instructor
- **WHEN** a teacher imports an already-imported class, is not yet an instructor of the section, and their `SourcedId` appears in the One Roster `/classes/<classSourcedId>/teachers` response
- **THEN** the system adds them as a section instructor (co-teacher) on the existing section and updates the section's roster

#### Scenario: Unverified user is denied
- **WHEN** a user attempts to import an already-imported class, is not an instructor of the section, and their `SourcedId` does not appear in the One Roster `/classes/<classSourcedId>/teachers` response
- **THEN** the system returns 403 Forbidden and does not modify the section

### Requirement: Teacher can sync an existing ClassLink section
A teacher who is an instructor (owner or co-teacher) of a ClassLink section in our system SHALL be able to re-sync it to reflect the current student roster in One Roster. Requesters who are not instructors of the section SHALL be denied unless they pass the co-teacher verification.

#### Scenario: Successful section sync
- **WHEN** a section instructor triggers a sync on an existing ClassLink section
- **THEN** the system parses `classSourcedId` from the section's `code`, resolves the district bearer token **and** `oneroster_application_id` from the cache-aside lookup keyed by the requester's own `TenantId`, calls `/classes/<classSourcedId>/students`, and updates the section's student roster to exactly match (adding new students, removing departed ones)

#### Scenario: Non-instructor cannot sync a section
- **WHEN** an authenticated ClassLink user who is not an instructor of an existing ClassLink section requests a sync of that section and fails the One Roster co-teacher verification
- **THEN** the system returns 403 Forbidden and does not modify the section or its roster

#### Scenario: Section sync adds a new student
- **WHEN** a student has been added to the class in One Roster since the last sync
- **THEN** the system creates or finds the student's account and adds them to the section

#### Scenario: Section sync removes a departed student
- **WHEN** a student is no longer in the class in One Roster
- **THEN** the system removes the student from the section (destroys the Follower record)

### Requirement: District credentials are resolved via cache-aside lookup
The system SHALL cache the `/applications` lookup result (bearer token and `oneroster_application_id`) per `tenant_id` in the shared cache with a TTL, reading from the cache before calling `/applications`.

#### Scenario: Cache hit
- **WHEN** a rostering operation needs district credentials and a non-expired cache entry exists for the teacher's `tenant_id`
- **THEN** the system uses the cached bearer token and `oneroster_application_id` without calling `/applications`

#### Scenario: Cache miss
- **WHEN** a rostering operation needs district credentials and no cache entry exists for the teacher's `tenant_id` (or the entry has expired)
- **THEN** the system calls `/applications` with the partner API key, locates the record matching the `tenant_id` whose `enabled` is the string `"true"` and whose `tenant_status` is `"Active"`, writes its `bearer` and `oneroster_application_id` to the cache with the configured TTL, and proceeds with the request

#### Scenario: Malformed discovery response
- **WHEN** `/applications` returns a body whose `applications` key is absent or is not an array
- **THEN** the system raises rather than treating it as a valid discovery list, since a degraded response read as an empty list would make every district appear not to have enabled ClassLink rostering

#### Scenario: Empty discovery list
- **WHEN** `/applications` returns a well-formed but empty `applications` array
- **THEN** the system logs a warning and reports rostering unavailable, without raising — a true zero is possible in a fresh environment even though it is implausible in production

#### Scenario: Application record is present but not active
- **WHEN** a record matches the teacher's `tenant_id` but has `enabled` other than `"true"`, or a `tenant_status` other than `"Active"`
- **THEN** the system treats the district as having no available application and surfaces the rostering-unavailable message, rather than using the record's bearer

### Requirement: Collection fetches retrieve all pages
The system SHALL paginate all ClassLink collection endpoints (`/applications`, `/teachers/<SourcedId>/classes`, `/classes/<classSourcedId>/students`, `/classes/<classSourcedId>/teachers`) using `limit`/`offset` query parameters, so that results are never silently truncated at one page. A paginated response SHALL be fetched to completion, not treated as an error. Termination SHALL NOT depend on the `x-count`/`x-total-count` headers being present, because `/applications` sends neither. Every request in a One Roster collection loop SHALL send the same explicit `sort` and `orderBy` parameters, so page boundaries are computed over an ordering the system pins rather than a server default.

#### Scenario: Ordering is pinned explicitly
- **WHEN** the system requests any page of a One Roster collection
- **THEN** the request includes `sort=sourcedId` and `orderBy=asc`, identical across every page of that collection fetch

#### Scenario: Response lacking its collection key is rejected
- **WHEN** any collection fetch returns a body whose expected envelope key (`users`, `classes`, or `applications`) is absent or is not an array — including an HTTP 200 carrying an error envelope instead of a collection
- **THEN** the system raises rather than treating the response as an empty collection, so a success-shaped failure is never applied as an authoritative roster

#### Scenario: Short page ends the fetch
- **WHEN** a page returns fewer records than the requested `limit`
- **THEN** the system stops paginating and returns all accumulated records, regardless of whether any count header was present

#### Scenario: Collection fits in a single page
- **WHEN** a collection fetch returns a first page whose record count is below the requested `limit`, or matches the `x-total-count` header
- **THEN** the system makes no further requests and returns the full result set

#### Scenario: Collection spans multiple pages
- **WHEN** a page returns exactly `limit` records
- **THEN** the system requests the next page, incrementing `offset` by `limit`, accumulating records until a stop condition is met, and returns all records combined

#### Scenario: Empty page breaks the loop
- **WHEN** a page returns zero records
- **THEN** the system stops paginating and returns the records accumulated so far (guarding against miscounted headers causing an infinite loop)

#### Scenario: Collection without count headers is fully retrieved
- **WHEN** the system fetches `/applications`, which returns neither `x-count` nor `x-total-count`, and the district list exceeds one page
- **THEN** the system still retrieves every page, terminating on the short final page rather than stopping after page one

#### Scenario: Large class roster is fully imported
- **WHEN** a teacher imports or syncs a class whose student count exceeds the page limit
- **THEN** the section roster reflects every student across all pages, not just the first page

#### Scenario: District list is fetched with an explicit limit
- **WHEN** the system fetches `/applications` to resolve district credentials
- **THEN** the request carries the explicit limit rather than relying on a server default, since the number of sharing districts already exceeds the OneRoster default limit of 100 and a truncated list would make real districts appear to have ClassLink rostering disabled

### Requirement: A roster fetch that would strip most of a section is refused
Before applying a fetched roster to an existing section, the system SHALL compare the incoming student count to the section's current student count. When the section currently has 5 or more students and the incoming roster would remove more than half of them, the system SHALL abort without modifying the section, log the section id with both counts, and return a user-facing error. This guards against a partial fetch — caused by a miscounted or missing `x-total-count`, an error delivered as HTTP 200 with an `imsx_codeMajor` envelope, or a mid-fetch roster change shifting records across page boundaries — being applied as an authoritative roster and silently unenrolling students.

#### Scenario: Fetch returns a partial roster
- **WHEN** a sync fetches 3 students for a section that currently has 30
- **THEN** the section's roster is unchanged, no `Follower` record is soft-deleted, the discrepancy is logged, and the teacher sees an error

#### Scenario: Ordinary roster shrinkage is applied
- **WHEN** a sync fetches 26 students for a section that currently has 30
- **THEN** the removal is applied normally, since it does not exceed half the roster

#### Scenario: Small sections are exempt from the guard
- **WHEN** a sync fetches 1 student for a section that currently has 4
- **THEN** the removal is applied normally, since the section is below the 5-student floor

#### Scenario: Guard does not apply to a new import
- **WHEN** a teacher imports a class that becomes a new section with no prior roster
- **THEN** the guard does not engage, since there are no existing students to remove

### Requirement: One Roster 429 responses are propagated and retried from the browser
When a One Roster API call fails with HTTP 429, the backend SHALL immediately return 429 to the browser without sleeping or retrying in-process. The frontend SHALL retry the request with automatic exponential backoff — 3 attempts total, with increasing waits between them — using a shared retry helper for both the class-list and import/sync requests, and SHALL surface an error to the user only after all attempts fail.

#### Scenario: Backend propagates 429 without holding the request
- **WHEN** a One Roster API call made during a rostering request returns 429
- **THEN** the backend responds 429 to the browser immediately, without sleeping or retrying in-process

#### Scenario: Frontend retry succeeds
- **WHEN** a rostering request returns 429 and a subsequent backoff attempt (within 3 total) succeeds
- **THEN** the operation completes normally and no error is shown to the user

#### Scenario: Retries exhausted
- **WHEN** all 3 attempts of a rostering request return 429
- **THEN** the frontend surfaces an error to the user through the existing roster-import failure path

#### Scenario: Class-list and import requests share the retry behavior
- **WHEN** either the class-list fetch or the import/sync request receives a 429
- **THEN** the same retry helper applies the same backoff policy to both

### Requirement: One Roster 401 responses trigger token refresh with single retry
When a One Roster API call fails with HTTP 401, the system SHALL re-fetch the district credentials from `/applications` and compare the fresh bearer token to the cached one to distinguish token expiry from authorization failure.

#### Scenario: Stale cached token is refreshed and request retried
- **WHEN** a One Roster API call returns 401 and the freshly fetched bearer token differs from the cached token
- **THEN** the system updates the cache with the fresh token and retries the original request exactly once

#### Scenario: Matching token indicates authorization failure
- **WHEN** a One Roster API call returns 401 and the freshly fetched bearer token matches the cached token
- **THEN** the system does not retry and surfaces a user-facing error message to the UI indicating the district authorization failed

#### Scenario: Retry also fails
- **WHEN** the single retry after a token refresh also returns 401
- **THEN** the system does not retry again and surfaces a user-facing error message to the UI

### Requirement: ClassLink sections are identified by tenant and class ID
`Section.code` for ClassLink sections SHALL follow the format `CL-<TenantId>|<classSourcedId>`. The `oneroster_application_id` SHALL NOT be persisted in the section code; it is resolved at request time from the same cached record that supplies the district bearer.

#### Scenario: Section code is set on import
- **WHEN** a ClassLink class is imported as a section
- **THEN** `section.code` is set to `CL-<TenantId>|<classSourcedId>`

#### Scenario: Section code is unique across districts
- **WHEN** two different districts have classes with the same `classSourcedId`
- **THEN** their section codes differ because the `TenantId` component is district-specific, satisfying the UNIQUE index on `sections.code`

#### Scenario: Tenant is derived from the requester, not the section code
- **WHEN** any rostering operation on an existing ClassLink section resolves district credentials
- **THEN** the `TenantId` used comes from `current_user`'s v2 auth option and never from the section code, whose tenant component exists for uniqueness and readability only

### Requirement: Each rostering failure state has specific user-facing copy
The system SHALL surface a distinct message for each ClassLink rostering failure rather than a generic error, and SHALL provide a fallback message for unexpected failures. `RosterDialog`'s title and login-type switches have no default branch, so a provider without strings renders an empty heading; `classlink` cases SHALL be added alongside the existing `google_classroom` and `clever` cases.

#### Scenario: District has not enabled roster sync
- **WHEN** the teacher's `tenant_id` is absent from the `/applications` list, or its record is not `enabled`/`Active`, or the partner key is blank (non-production)
- **THEN** the teacher sees "Your district hasn't enabled roster sync for CodeAI."

#### Scenario: Authorization failed for a district that is enabled
- **WHEN** a One Roster call returns 401 and the re-fetched bearer matches the cached one, indicating a district-side authorization failure rather than token expiry
- **THEN** the teacher sees "Your district hasn't enabled roster sync for CodeAI." — deliberately the same string as the scenario above, since the two are indistinguishable from the teacher's position and the distinction is preserved in logs for support

#### Scenario: Teacher has not yet been migrated to a v2 auth option
- **WHEN** a teacher holding only a legacy v1 ClassLink auth option attempts to use rostering
- **THEN** the teacher sees "Please sign in again from ClassLink to proceed with roster sync."

#### Scenario: Rate limiting exhausts the browser retries
- **WHEN** the frontend has exhausted its three attempts against repeated 429 responses
- **THEN** the teacher sees "We're having trouble getting roster information from ClassLink. Please try again later."

#### Scenario: Unexpected failure has no specific message
- **WHEN** a rostering request fails for any reason without its own copy — a response missing its collection key, a malformed body, or an unhandled client error
- **THEN** the teacher sees the same "We're having trouble getting roster information from ClassLink. Please try again later." message, so no failure path renders an empty dialog

#### Scenario: Imported class contains no students
- **WHEN** a class is imported or synced and its roster contains no users with `role == "student"`
- **THEN** the teacher sees "This section (<section_name>) has no students.", with the section name interpolated

#### Scenario: Sync refused by the roster-shrink guard
- **WHEN** a sync is refused because the incoming roster would remove more than half the students from a section holding at least five
- **THEN** the teacher sees "Syncing would remove <num_students> students from the section, abandoning sync.", with the count of students that would have been removed interpolated
- **AND** the message states what was prevented rather than offering to proceed, since the guard exists precisely because the fetched roster may be wrong; no confirmation path is offered in this release
- **AND** no pluralization variant is required: the guard's five-student floor and one-half ratio make the smallest possible count three

### Requirement: ClassLink rostering UI matches Clever rostering UX
The teacher-facing interface for importing and syncing ClassLink sections SHALL match the existing Clever rostering experience, using the same `RosterDialog` and section management components.

#### Scenario: Teacher initiates ClassLink import flow
- **WHEN** a teacher with a ClassLink account clicks to import a ClassLink section
- **THEN** the `RosterDialog` opens, displaying the teacher's available ClassLink classes fetched from `GET /dashboardapi/classlink_classrooms`

#### Scenario: Teacher syncs a ClassLink section from section management
- **WHEN** a teacher clicks the sync action on an existing ClassLink section
- **THEN** the system calls `POST /dashboardapi/import_classlink_classroom` with the section's course ID and updates the roster
