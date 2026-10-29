# sinatra-port-libraries-api

Libraries HTTP surface from `dashboard/legacy/middleware/files_api.rb`,
delegating to the transfer service with `LibraryBucket`. Semantics of record:
`files_api.rb` and `dashboard/legacy/test/middleware/test_libraries.rb`
(translated 1:1 by tasks).

## ADDED Requirements

### Requirement: Dual route surfaces for libraries
Every libraries endpoint SHALL be served canonically under
`/api/v1/libraries...` (CSRF enforced) and at its legacy `/v3/libraries...`
alias (CSRF skipped), with the Sinatra libraries route blocks deleted in the
same change. Library reads SHALL use `dont_cache` semantics (unlike other
bucket reads), matching the legacy special case.

#### Scenario: Library read not cached
- **WHEN** `GET /v3/libraries/<ch>/<file>` succeeds
- **THEN** the response `Cache-Control` is
  `private, must-revalidate, max-age=0, no-transform`

### Requirement: Library CRUD and versions
The system SHALL port list (JSON, decrypt errors → 400), get (read gating,
`?version=`), `PUT` (owner-only write gating), `DELETE` (owner-only, 204),
and versions list honoring the `with_comments` parameter, matching the legacy
routes byte-for-byte.

#### Scenario: Versions with comments
- **WHEN** versions are requested with `with_comments`
- **THEN** the response matches `LibraryBucket#list_versions` with comments
  included

### Requirement: Share filtering on publish
Non-backpack library `PUT`s SHALL run share filtering over the
name/description/source text extracted from JSON bodies (raw body for
non-JSON files): profanity failures answer 400 JSON with details
`{"profaneWords":["<content>"]}`, PII failures with
`{"pIIWords":["<content>"]}`; `WebPurify::TextTooLongError` answers 413;
other filtering errors answer 400 with the exception message as details.
Writes with `projectType=backpack` SHALL skip filtering entirely.

#### Scenario: Profane library rejected
- **WHEN** a non-backpack library body contains profanity in its description
- **THEN** the response is 400 with JSON details naming `profaneWords` and no
  object is written

#### Scenario: Backpack exempt
- **WHEN** the same body is PUT with `projectType=backpack`
- **THEN** the write succeeds without invoking the share filter
