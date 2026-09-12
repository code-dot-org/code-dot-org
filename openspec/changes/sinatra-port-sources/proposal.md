# Sinatra Port: Sources

Phase 3 of the Sinatra middleware port series (after `sinatra-port-channels`).
Ports the `sources` and `sources-public` endpoint family out of `FilesApi`
(`dashboard/legacy/middleware/files_api.rb`) to
`Api::V1::SourcesController`, and extracts FilesApi's shared `get_file` /
`put_file` machinery into a reusable service that phases 4 (files/assets) and
5 (libraries) build on. Completes the lab2 critical path (channels + sources
= project load/save).

## Why

Sources is the hottest write path in the whole port (every project save) and
the second API `frontend/` lab2 needs. FilesApi's endpoint families share one
tangle of transfer logic (`get_file`, `put_file`, quotas, abuse/profanity
gating); porting sources first forces that logic into a tested, shared shape
while exercising only one bucket (`SourceBucket`), keeping this change
reviewable.

## Decisions

- Strict parity; legacy `test_sources.rb` (~24 tests) translates 1:1 and is
  the spec of record.
- The shared transfer logic ports as `ProjectFilesTransfer` (name final at
  implementation; lives under `dashboard/app/services/`), parameterized by
  bucket implementation, porting `FilesApi#get_file`/`#put_file`/`#copy_file`
  near-verbatim — behavior changes are out of scope. Only the branches
  exercised by sources are considered proven in this phase; later phases own
  their branches (quota events, library share-filtering, manifest handling).
- FilesApi middleware stays mounted (it still serves assets, files,
  animations, libraries, codeprojects routes); only the sources route blocks
  are deleted from the Sinatra file, exactly as the abuse endpoints were.
- Alias CSRF pattern reused from channels: `LegacySourcesController`
  subclass with `skip_forgery_protection`, routed from `/v3`.
- `/v3/sources-public` alias keeps its CDN behavior (`cookies: 'none'` in
  `lib/cdo/http_cache.rb`); no canonical `/api/v1/sources-public` CDN entry is
  added until a `frontend/` consumer exists — the route exists but inherits
  the `/api/*` behavior.

## What Changes

- New `Api::V1::SourcesController < Api::V1::ProjectsApiBaseController`:
  list, get (with `?version=`), put, delete, versions list, restore, plus the
  `sources-public` cached read.
- New shared transfer service porting `get_file`/`put_file`/`copy_file` with
  their gating: abuse-score threshold, profanity/privacy violation,
  under-13 source sanitization (comment-block stripping), UTF-8 encoding
  validation (422), 5 MB size limit (413), version-conflict detection (409),
  `S3-Version-Id` response header, `Content-Disposition: attachment` for
  non-safely-viewable types.
- Canonical `/api/v1/sources...` routes (CSRF on) + `/v3` aliases (CSRF off).
- Sources route blocks deleted from `files_api.rb`; `test_sources.rb` deleted
  after translation.

## Capabilities

### New Capabilities

- `sinatra-port-sources-api`: the sources HTTP surface on both route
  surfaces.
- `sinatra-port-file-transfer`: the shared get/put/copy transfer behavior
  (gating, limits, headers) that later FilesApi phases reuse.

### Modified Capabilities

None.

## Impact

- New controller + service + tests; `dashboard/config/routes.rb`;
  `files_api.rb` shrinks by the sources blocks; `test_sources.rb` retired.
- Clients (`apps/src/lab2/projects/sourcesApi.ts`, code-studio `project.js`,
  Javabuilder's hardcoded `GET /v3/files`-family reads are files-phase, not
  sources): no changes required.
- Hot-path performance: project saves now traverse the Rails stack; compare
  save latency before/after via existing route metrics before deleting the
  Sinatra routes.
