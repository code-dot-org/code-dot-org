# sinatra-port-assets-api

Assets, user animations, and cross-channel asset copy, from
`dashboard/legacy/middleware/files_api.rb`. Semantics of record: that file
plus `test_assets.rb` and `test_animations.rb` (translated 1:1 by tasks).
Delegates to the `sinatra-port-file-transfer` service with `AssetBucket` /
`AnimationBucket`.

## ADDED Requirements

### Requirement: Dual route surfaces for assets and animations
Every endpoint SHALL be served canonically under `/api/v1/...` (CSRF
enforced) and at its legacy `/v3/assets...`, `/v3/animations...`,
`/v3/copy-assets...` alias (CSRF skipped), with the corresponding Sinatra
route blocks deleted in the same change.

#### Scenario: Legacy multipart upload without token
- **WHEN** a lab POSTs a multipart file to `/v3/assets/<ch>/` with no CSRF
  token
- **THEN** the upload succeeds exactly as under Sinatra

### Requirement: Asset endpoints
The system SHALL port asset list (JSON, decrypt errors → 400), get (read
gating incl. abuse threshold), `PUT` upload (write gating incl. image resize
attempt at the 5 MB limit and 2 GB app quota), multipart `POST` upload to
`/v3/assets/<ch>/` (400 without a well-formed `files` part; unsafe filename
characters replaced per `BucketHelper.replace_unsafe_chars`; response
`Content-Type: text/plain` carrying the JSON entry — IE9 iframe legacy), and
`DELETE` (owner-only, 204).

#### Scenario: Multipart response content type
- **WHEN** a multipart upload to `/v3/assets/<ch>/` succeeds
- **THEN** the response body is the JSON file entry served as `text/plain`

#### Scenario: Quota exceeded
- **WHEN** an upload would push the channel's app size to 2 GB or beyond
- **THEN** the response is 403 and a QuotaExceeded event is recorded

### Requirement: User animation endpoints
The system SHALL port animation list, get (`?version=` supported), `PUT` with
`Content-Type: image/png` body (write gating) or `?src=` copy-within-channel
(quota-checked, 404 when the source object is missing), multipart `POST`,
`DELETE`, and versions list — matching `files_api.rb` including the
`text/plain` response type on `PUT`/`POST`.

#### Scenario: PUT with neither PNG body nor src
- **WHEN** a `PUT /v3/animations/<ch>/<file>` has a non-PNG content type and
  no `?src=` parameter
- **THEN** the response is 400

### Requirement: Cross-channel asset copy
`POST copy-assets/<ch>?src_channel=<src>&src_files=<json-array>` SHALL copy
the named files from the source channel via `AssetBucket#copy_files` and
return the copy result as JSON, matching the legacy route byte-for-byte.

#### Scenario: Remix copies assets
- **WHEN** a valid copy-assets POST names two existing source files
- **THEN** both appear in the destination channel and the response lists them
