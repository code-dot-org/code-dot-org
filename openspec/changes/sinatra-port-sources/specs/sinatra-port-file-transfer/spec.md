# sinatra-port-file-transfer

Shared file transfer behavior extracted from
`dashboard/legacy/middleware/files_api.rb` (`get_file`, `put_file`,
`copy_file` and their helpers). Semantics of record: that file. Ported
near-verbatim into a service parameterized by bucket implementation
(`SourceBucket` here; `AssetBucket`/`FileBucket`/`AnimationBucket`/
`LibraryBucket` in later phases). In this change the service is proven
through the sources endpoints; branches only reachable from other endpoint
families (quota events, library share filtering, manifest choreography) are
ported but owned by their phases.

## ADDED Requirements

### Requirement: File read gating
Reads SHALL replicate `FilesApi#get_file`: reject disallowed filenames and
extensions (404 / 415), resolve content type from extension, serve
non-safely-viewable types (everything but .jpg/.jpeg/.gif/.png) with
`Content-Disposition: attachment`, honor `?version=` and
`If-Modified-Since` (304 `"Not Modified\n"`), set `S3-Version-Id` and
`Last-Modified`, append `no-transform` to `Cache-Control`, and return 404
when the abuse score meets the threshold or a profanity/privacy violation is
flagged — unless the requester owns the channel, is admin/project_validator,
or teaches the owner.

#### Scenario: Abusive content hidden from strangers
- **WHEN** a non-owner without permissions reads a file whose abuse score is
  at or above the threshold
- **THEN** the response is 404

#### Scenario: Teacher can view flagged student work
- **WHEN** the owner's teacher reads the same flagged file
- **THEN** the response is 200 with the file body

#### Scenario: Version and conditional headers
- **WHEN** a file is read with a matching `If-Modified-Since`
- **THEN** the response is 304 with body `"Not Modified\n"`

### Requirement: Under-13 source sanitization
Source reads by anyone other than the channel owner SHALL strip Blockly
comment blocks from the returned source when the owner is under 13 or of
unknown age, per `FilesApi#sanitize_for_under_13` (comment blocks replaced by
their next-block chains; empty next-blocks removed; non-JSON and non-XML
bodies returned unchanged).

#### Scenario: Stranger reads under-13 source
- **WHEN** a non-owner reads main.json of a channel owned by an under-13 user
  whose source contains comment blocks
- **THEN** the returned source has the comment blocks removed

#### Scenario: Owner reads own source
- **WHEN** the under-13 owner reads their own main.json
- **THEN** the source is returned unmodified

### Requirement: File write gating
Writes SHALL replicate `FilesApi#put_file`: 401 when the requester does not
own the channel; 400 for disallowed filenames; 415 for disallowed types;
attempt bucket-specific resize then 413 when the body is at or over 5 MB;
409 when the version-conflict check
(`check_current_version` with `version`/`currentVersion`/`replace`/
`firstSaveTimestamp`/`tabId` params) fails; preserve the channel's current
abuse score on the new object version; and respond with the legacy JSON entry
(`filename`, `category`, `size`, `versionId`, `timestamp`).

#### Scenario: Non-owner write rejected
- **WHEN** a signed-in user PUTs to a channel they do not own
- **THEN** the response is 401 `"Not authorized\n"`

#### Scenario: Stale version conflict
- **WHEN** a PUT carries a `currentVersion` that is no longer the latest and
  `replace` is not `true`
- **THEN** the response is 409 `"Conflict\n"`

### Requirement: Source encoding validation
Source writes SHALL parse the body JSON and reject with 422 any source whose
string content (single-file string, Java Lab multi-file `text` values, or
lab2 `files.*.contents` values) is not valid UTF-8, per
`FilesApi#has_valid_encoding?`; Sketch Lab-style `files` entries without
`contents` are exempt.

#### Scenario: Invalid encoding rejected
- **WHEN** a PUT to sources carries a main.json whose `source` string is not
  valid UTF-8
- **THEN** the response is 422 and no object version is created
