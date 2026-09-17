# Sinatra Port: Files and Assets

Phase 4 of the Sinatra middleware port series (after `sinatra-port-sources`).
Ports the `assets`, user `animations`, `files`, `files-version`,
`files-public`, `copy-assets`, and `images/moderate` endpoint families out of
`FilesApi` to Rails controllers. The largest phase; builds on the transfer
service proven in the sources phase.

## Why

These families carry WebLab/codebridge file management (manifest-backed
`files`), lab asset uploads (`assets`, `copy-assets`), p5lab user animations,
project version restore, thumbnails/metadata, and image moderation — the bulk
of `FilesApi`'s 1097 lines. After this phase the Sinatra FilesApi retains
only libraries and the codeprojects.org routes.

## Decisions

- Strict parity; legacy suites translate 1:1 and are the spec of record:
  `test_assets.rb` (~13), `test_animations.rb` (~21), `test_files.rb` (~45),
  `files_api/test_public_thumbnails.rb` (~2).
- Split into three controllers mirroring the storage models:
  `Api::V1::AssetsController` (AssetBucket; also user animations via
  AnimationBucket and `copy-assets`), `Api::V1::ProjectFilesController`
  (FileBucket: manifest choreography, metadata, files-version,
  files-public), `Api::V1::ImageModerationController`
  (`POST images/moderate`). Exact grouping may shift at implementation;
  route paths may not.
- The IE9-era multipart iframe POSTs (`POST /v3/assets/:ch/`,
  `/v3/files/:ch/`, `/v3/animations/:ch/:file`) and their `text/plain`
  response content type port as-is. Removal is a separate product decision,
  not this series.
- Quota behaviors (2 GB app cap, half-used telemetry events, `FileTooLarge`
  span attributes) port onto the transfer service, keeping the
  OpenTelemetry span-attribute recording.
- Multipart parameter shape differs between Rack (`request.POST['files'][0]`
  hash with `:tempfile`/`:filename`) and Rails
  (`ActionDispatch::Http::UploadedFile`); the controllers normalize at the
  boundary. Parity is on the HTTP surface, not the internals.

## What Changes

- Assets: list, get, `PUT` upload, multipart `POST` upload, delete,
  `POST copy-assets` (cross-channel copy with JSON filename list).
- User animations: list, get (+`?version=`), `PUT` (PNG body or `?src=` copy),
  multipart `POST`, delete, versions.
- Files: manifest list (`GET /v3/files/:ch` with `filesVersionId`/`files`
  shape), get (case-insensitive, `.jfif`→`.jpg` rename on write), `PUT`/`POST`
  with full manifest choreography (create/replace/rename incl. case-only
  rename, `?src=`, `?delete=`, `files-version` param, WebLab HTML validation
  against DCDO `disallowed_html_tags` and `on*` attributes), delete-one,
  delete-all (`DELETE /v3/files/:ch/*`), metadata files
  (`.metadata/thumbnail.png` PUT/GET/DELETE), `files-public` metadata read
  (1-hour cache), `files-version` list + restore-all.
- `POST /v3/images/moderate` (Azure content-safety moderation; 400 on empty
  body or unsupported type with the legacy error JSON).
- Canonical `/api/v1/...` routes (CSRF on) + `/v3` aliases (CSRF off, thin
  legacy subclasses); all ported route blocks deleted from `files_api.rb`.
  FilesApi middleware remains mounted for libraries + codeprojects only.

## Capabilities

### New Capabilities

- `sinatra-port-assets-api`: assets + user animations + copy-assets surface.
- `sinatra-port-project-files-api`: manifest-backed files, metadata,
  files-version, files-public surface.
- `sinatra-port-image-moderation-api`: the moderation endpoint.

### Modified Capabilities

- `sinatra-port-file-transfer`: gains the quota requirement (app-size cap and
  telemetry) exercised by non-sources buckets.

## Impact

- Three new controllers (+ legacy subclasses), routes, tests; `files_api.rb`
  shrinks to libraries + codeprojects routes; four legacy test files retired.
- Clients unchanged: `apps/src/code-studio/assets` paths, p5lab
  `animationList.js`, codebridge `useFileUploader.tsx`, Javabuilder's
  hardcoded `/v3/files` GET (external repo — alias keeps it working).
- UI feature `dashboard/test/ui/features/star_labs/manage_assets.feature`
  exercises this surface end to end on drone.
