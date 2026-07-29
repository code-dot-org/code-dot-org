## ADDED Requirements

### Requirement: Teacher can view available ClassLink classes
A teacher with a v2 ClassLink auth option (`authentication_id = <TenantId>|<SourceId>`, `version = 'v2'`) SHALL be able to retrieve a list of their One Roster classes to import as sections.

#### Scenario: Teacher lists available classes
- **WHEN** a teacher with a v2 ClassLink auth option requests their ClassLink class list
- **THEN** the system resolves the district application (bearer token and `oneroster_application_id`) for the teacher's `TenantId` via the cache-aside lookup, then calls the One Roster `/teachers/<SourceId>/classes` endpoint, and returns the list of active classes

#### Scenario: Teacher has no matching district application
- **WHEN** a teacher's `TenantId` does not match any application in the `/applications` response (or the matching application has `enabled != "true"`)
- **THEN** the system returns an appropriate error and the teacher sees a message indicating ClassLink rostering is unavailable for their district

#### Scenario: Teacher has not yet been migrated
- **WHEN** a teacher without a v2 ClassLink auth option (legacy v1 record only) attempts to access ClassLink rostering
- **THEN** the system returns an error prompting the teacher to sign out and sign back in to enable rostering (login-time migration creates their v2 record)

### Requirement: Rostering identity is derived server-side
Because ClassLink rostering uses a central partner credential (not a user-scoped token), the system SHALL derive `TenantId` and teacher `SourceId` exclusively from the authenticated user's v2 ClassLink auth option. Client-supplied tenant, application, or teacher identifiers SHALL never be used to select the district application or identify the requester.

#### Scenario: District application is selected by the requester's own TenantId
- **WHEN** any rostering endpoint resolves district credentials
- **THEN** the application is selected by the `TenantId` parsed from `current_user`'s v2 auth option, so a supplied `courseId` is only ever resolved within the requester's own district

#### Scenario: Forged identity parameters are ignored
- **WHEN** a request to a rostering endpoint includes tenant, application, or teacher-SourceId parameters that differ from the authenticated user's own values
- **THEN** the system ignores the supplied values and uses only the server-derived identity

### Requirement: Teacher can import a ClassLink class as a section
A teacher SHALL be able to import a One Roster class they teach, creating a new code.org section populated with the class's current student roster. Because the partner credential itself grants no per-user scoping, the system SHALL verify via the One Roster `/classes/<classSourceId>/teachers` endpoint that the requester teaches the class before creating a section.

#### Scenario: Successful class import
- **WHEN** a teacher selects a class to import and their `SourceId` appears in the One Roster `/classes/<classSourceId>/teachers` response
- **THEN** the system resolves the district bearer token via the cache-aside lookup, calls `/classes/<classSourceId>/students`, filters for users with `role == "student"`, creates or finds each student's account using `<TenantId>|<studentSourceId>` as the authentication_id, creates a `ClasslinkSection` with `code = CL-<oneroster_application_id>|<classSourceId>`, and enrolls all rostered students

#### Scenario: Teacher cannot import a class they do not teach
- **WHEN** an authenticated ClassLink user requests import of a `courseId` in their district and their `SourceId` does not appear in the One Roster `/classes/<classSourceId>/teachers` response
- **THEN** the system returns 403 Forbidden, creates no section, and enrolls no students

#### Scenario: Student already has a code.org account via ClassLink SSO
- **WHEN** a student being imported already has a `AuthenticationOption` with `authentication_id = <TenantId>|<studentSourceId>`
- **THEN** the system links the existing account to the section rather than creating a duplicate

#### Scenario: One Roster response includes teacher records
- **WHEN** the `/classes/<classSourceId>/students` response contains users with `role == "teacher"`
- **THEN** the system excludes those records from the student roster and only enrolls users with `role == "student"` (matching Clever and Google Classroom, where teachers are never imported as section members)

#### Scenario: Class has already been imported by the same teacher
- **WHEN** a teacher imports a class whose `section.code` already exists and the teacher is already an instructor of that section
- **THEN** the system updates the existing section's roster (add/remove students to match current One Roster data) rather than creating a duplicate section

### Requirement: Co-teachers can join an already-imported class
When a teacher imports a class whose section already exists and they are not yet an instructor, the system SHALL verify via the One Roster API that they are listed as a teacher for that class before granting access, matching the Clever and Google Classroom co-teacher flow.

#### Scenario: Verified co-teacher is added as section instructor
- **WHEN** a teacher imports an already-imported class, is not yet an instructor of the section, and their `SourceId` appears in the One Roster `/classes/<classSourceId>/teachers` response
- **THEN** the system adds them as a section instructor (co-teacher) on the existing section and updates the section's roster

#### Scenario: Unverified user is denied
- **WHEN** a user attempts to import an already-imported class, is not an instructor of the section, and their `SourceId` does not appear in the One Roster `/classes/<classSourceId>/teachers` response
- **THEN** the system returns 403 Forbidden and does not modify the section

### Requirement: Teacher can sync an existing ClassLink section
A teacher who is an instructor (owner or co-teacher) of a ClassLink section in our system SHALL be able to re-sync it to reflect the current student roster in One Roster. Requesters who are not instructors of the section SHALL be denied unless they pass the co-teacher verification.

#### Scenario: Successful section sync
- **WHEN** a section instructor triggers a sync on an existing ClassLink section
- **THEN** the system parses the section's `code` to extract `oneroster_application_id` and `classSourceId`, resolves the district bearer token via the cache-aside lookup, calls `/classes/<classSourceId>/students`, and updates the section's student roster to exactly match (adding new students, removing departed ones)

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
- **THEN** the system calls `/applications` with the partner API key, locates the enabled application matching the `tenant_id`, writes it to the cache with the configured TTL, and proceeds with the request

### Requirement: One Roster collection fetches retrieve all pages
The system SHALL paginate all One Roster collection endpoints (`/teachers/<SourceId>/classes`, `/classes/<classSourceId>/students`, `/classes/<classSourceId>/teachers`) using `limit`/`offset` query parameters and the `x-count`/`x-total-count` response headers, so that results are never silently truncated at one page.

#### Scenario: Collection fits in a single page
- **WHEN** a collection fetch returns a first page whose record count is greater than or equal to the `x-total-count` header
- **THEN** the system makes no further requests and returns the full result set

#### Scenario: Collection spans multiple pages
- **WHEN** a collection fetch's `x-total-count` header exceeds the records received so far
- **THEN** the system requests subsequent pages, incrementing `offset` by `limit` each time and accumulating a running total, until the running total reaches `x-total-count`, and returns all records combined

#### Scenario: Empty page breaks the loop
- **WHEN** a subsequent page returns zero records even though the running total has not reached `x-total-count`
- **THEN** the system stops paginating and returns the records accumulated so far (guarding against miscounted headers causing an infinite loop)

#### Scenario: Large class roster is fully imported
- **WHEN** a teacher imports or syncs a class whose student count exceeds the page limit
- **THEN** the section roster reflects every student across all pages, not just the first page

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

### Requirement: ClassLink sections are identified by One Roster application and class IDs
`Section.code` for ClassLink sections SHALL follow the format `CL-<oneroster_application_id>|<classSourceId>`.

#### Scenario: Section code is set on import
- **WHEN** a ClassLink class is imported as a section
- **THEN** `section.code` is set to `CL-<oneroster_application_id>|<classSourceId>`

#### Scenario: Section code is unique across districts
- **WHEN** two different districts have classes with the same `classSourceId`
- **THEN** their section codes differ because `oneroster_application_id` is district-specific

### Requirement: ClassLink rostering UI matches Clever rostering UX
The teacher-facing interface for importing and syncing ClassLink sections SHALL match the existing Clever rostering experience, using the same `RosterDialog` and section management components.

#### Scenario: Teacher initiates ClassLink import flow
- **WHEN** a teacher with a ClassLink account clicks to import a ClassLink section
- **THEN** the `RosterDialog` opens, displaying the teacher's available ClassLink classes fetched from `GET /dashboardapi/classlink_classrooms`

#### Scenario: Teacher syncs a ClassLink section from section management
- **WHEN** a teacher clicks the sync action on an existing ClassLink section
- **THEN** the system calls `POST /dashboardapi/import_classlink_classroom` with the section's course ID and updates the roster
