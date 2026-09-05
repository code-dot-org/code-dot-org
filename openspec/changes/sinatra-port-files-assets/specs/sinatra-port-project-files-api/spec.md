# sinatra-port-project-files-api

Manifest-backed project files (WebLab/codebridge), metadata files, and
project-version restore, from `dashboard/legacy/middleware/files_api.rb`.
Semantics of record: that file plus `test_files.rb` and
`files_api/test_public_thumbnails.rb` (translated 1:1 by tasks). Delegates to
the transfer service with `FileBucket`.

## ADDED Requirements

### Requirement: Case-insensitive files with case-preserving manifest
The files API SHALL remain case-insensitive over case-sensitive S3 storage:
stored object keys are downcased; the manifest preserves the user's original
casing; reads downcase the requested filename; `.jfif` extensions are renamed
to `.jpg` on write; filenames at or over the legacy maximum length and writes
targeting the manifest filename itself are rejected with 400.

#### Scenario: Mixed-case round trip
- **WHEN** `Photo.JPG` is uploaded and then requested as `photo.jpg`
- **THEN** the read succeeds and the manifest lists `Photo.JPG`

### Requirement: Manifest write choreography
File `PUT`/multipart `POST` SHALL replicate `files_put_file`: new entries
appended to the manifest, changed entries merged, `?src=` copies (including
case-only rename resolving to the existing entry), `?delete=` removing a
separate file from both manifest and bucket, the manifest written only when
changed (against the `files-version` param, preserving the channel abuse
score), and the response carrying the new entry JSON with `filesVersionId`
when the manifest changed.

#### Scenario: Rename via src and delete
- **WHEN** a PUT names `new.html` with `?src=old.html&delete=old.html`
- **THEN** the content is copied to `new.html`, `old.html` is removed from
  manifest and bucket, and the response includes a new `filesVersionId`

#### Scenario: Case-only rename
- **WHEN** a PUT names `INDEX.html` with `?src=index.html`
- **THEN** no S3 copy occurs and the manifest entry's filename becomes
  `INDEX.html`

### Requirement: WebLab HTML validation
HTML file writes to WebLab projects SHALL be rejected with 400 when the body
contains tags matching the DCDO `disallowed_html_tags` list or any attribute
starting with `on`, per `valid_html_content?`. HTML reads of WebLab files
SHALL be re-validated (bypassing `If-Modified-Since` for the fetch) and
answer 404 when invalid; non-WebLab projects are exempt.

#### Scenario: Script handler rejected
- **WHEN** a WebLab HTML upload contains `<div onclick="x()">`
- **THEN** the response is 400

### Requirement: File list and deletion endpoints
The system SHALL port manifest list (`GET files/<ch>` returning
`{"filesVersionId":...,"files":[...]}` with `?version=` and 304 support),
single-file delete (owner-only; manifest updated; 404 when absent; 400 for
the manifest filename), and delete-all (`DELETE files/<ch>/*` removing the
manifest and every referenced file, 204).

#### Scenario: Delete-all clears the channel
- **WHEN** the owner deletes `/v3/files/<ch>/*`
- **THEN** subsequent manifest reads return 404

### Requirement: Metadata files and public thumbnails
The system SHALL port `.metadata/` handling: `PUT`/`GET`/`DELETE` restricted
to the allowlisted metadata filenames (`thumbnail.png`; 400 otherwise),
stored outside the manifest, plus the `files-public` metadata read serving
with a 1-hour public cache and no Rails session cookie (the legacy
storage-id cookie MAY be written for cookieless anonymous requesters —
parity with `get_file`'s `get_storage_id` resolution).

#### Scenario: Public thumbnail cacheable
- **WHEN** an anonymous request GETs
  `/v3/files-public/<ch>/.metadata/thumbnail.png`
- **THEN** the response is publicly cacheable for 1 hour with no `Set-Cookie`
  for the session cookie

### Requirement: Project version restore
The system SHALL port `files-version`: `GET` listing manifest versions and
owner-only `PUT ?version=` restoring every file to the versions recorded in
that manifest version, writing a new manifest (abuse score preserved) and
returning `{"filesVersionId":...,"files":[...]}`; a missing manifest version
answers 400.

#### Scenario: Restore previous project version
- **WHEN** the owner PUTs `files-version` with a prior manifest version id
- **THEN** each file's current version matches that manifest and a new
  `filesVersionId` is returned
