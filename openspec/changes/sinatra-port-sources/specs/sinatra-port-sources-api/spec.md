# sinatra-port-sources-api

Sources HTTP surface from `dashboard/legacy/middleware/files_api.rb`,
delegating to the `sinatra-port-file-transfer` service with `SourceBucket`.
Semantics of record: `files_api.rb` and
`dashboard/legacy/test/middleware/test_sources.rb` (translated 1:1 by tasks).

## ADDED Requirements

### Requirement: Dual route surfaces for sources
Every sources endpoint SHALL be served canonically under
`/api/v1/sources...` (CSRF enforced) and at its legacy `/v3/sources...` /
`/v3/sources-public...` alias (CSRF skipped via thin legacy subclass), with
the Sinatra sources route blocks deleted in the same change. The FilesApi
middleware itself SHALL remain mounted for its unported endpoint families.

#### Scenario: Legacy save without token
- **WHEN** a lab PUTs main.json to `/v3/sources/<ch>/main.json` with no CSRF
  token
- **THEN** the save succeeds exactly as under Sinatra

#### Scenario: Unported families untouched
- **WHEN** a request hits `/v3/assets/<ch>` after this change
- **THEN** the Sinatra FilesApi middleware still serves it

### Requirement: Sources CRUD endpoints
The system SHALL port: `GET list` (JSON filename/size list, decrypt errors →
400), `GET file` (via transfer-service read gating, `?version=` supported),
`PUT file` (via transfer-service write gating and source encoding
validation; sources skip the app-size quota), and `DELETE file` (owner only →
401 otherwise; 204 on success), all with `dont_cache` semantics matching the
legacy routes.

#### Scenario: Round trip
- **WHEN** an owner PUTs main.json and then GETs it back
- **THEN** the GET returns the stored body with the `S3-Version-Id` header of
  the created version

### Requirement: Version history and restore
`GET .../versions` SHALL return full history to the channel owner and to
teachers of the owner, and only the latest version entry to anyone else
(decrypt errors → 400). `PUT .../restore?version=` SHALL be owner-only and
copy the named version to become current via
`SourceBucket#restore_previous_version`.

#### Scenario: Stranger sees only latest
- **WHEN** a non-owner, non-teacher requests versions of another user's
  main.json
- **THEN** only entries with `isLatest` are returned

### Requirement: Public cached source read
`GET sources-public/<ch>/<file>` SHALL serve the latest version through the
same read gating with `Cache-Control: public, max-age=20, s-maxage=10`, and
SHALL NOT write any cookies or session (response has no `Set-Cookie`),
preserving CDN cacheability.

#### Scenario: Cacheable response
- **WHEN** an anonymous request GETs `/v3/sources-public/<ch>/main.json`
- **THEN** the response has `Cache-Control: public, max-age=20, s-maxage=10`
  and no `Set-Cookie` header
