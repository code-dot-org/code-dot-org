# sinatra-port-channels-api

Channels HTTP surface, ported from
`dashboard/legacy/middleware/channels_api.rb`. Semantics of record: that file
plus `dashboard/legacy/test/middleware/test_channels.rb` and
`test_channels_base64_error.rb` (translated 1:1 by tasks; this spec pins the
load-bearing behaviors, not every case). All actions delegate to the existing
`Projects` class — no storage rewrite.

## ADDED Requirements

### Requirement: Dual route surfaces
Every channels endpoint SHALL be served at a canonical `/api/v1/channels...`
route (CSRF enforced) and a legacy alias at its exact current `/v3/channels...`
path (CSRF skipped via a thin `Api::V1::LegacyChannelsController <
Api::V1::ChannelsController` containing only `skip_forgery_protection`). Both
surfaces SHALL return identical responses except redirect `Location` values,
which stay within the receiving surface. The Sinatra routes SHALL be deleted
in the same change so the alias routes actually serve.

#### Scenario: Alias accepts tokenless writes
- **WHEN** a legacy client POSTs to `/v3/channels` with no CSRF token
- **THEN** the request succeeds exactly as under the Sinatra middleware

#### Scenario: Canonical rejects tokenless writes
- **WHEN** a client POSTs to `/api/v1/channels` with no CSRF token
- **THEN** the request is rejected by forgery protection

### Requirement: Channel create
`POST` create SHALL require `Content-Type: application/json` with UTF-8
charset (else 415), reject unparseable or non-Hash bodies with 400, merge
server-side `createdAt`/`updatedAt` timestamps, honor `?parent=` as remix
parent (invalid parent → 400), map `Projects::ValidationError` to 400, and
answer `301` with `Location` of the new channel on the receiving surface.

#### Scenario: Successful create
- **WHEN** a valid JSON body is POSTed to `/v3/channels`
- **THEN** the response is 301 with `Location: /v3/channels/<new-id>`

#### Scenario: Form content type rejected
- **WHEN** the body is POSTed as `application/x-www-form-urlencoded`
- **THEN** the response is 415

### Requirement: Channel read endpoints
`GET` list and `GET` by id SHALL respond `application/json` with
`Cache-Control: private, must-revalidate, max-age=0`, mapping channel-id
decryption failures (`ArgumentError`, `OpenSSL::Cipher::CipherError`) to 400
and `Projects::NotFound` to 404. The `debug` route SHALL exist only in
staging and development environments.

#### Scenario: Malformed channel id
- **WHEN** `GET /v3/channels/not-valid-base64!`
- **THEN** the response is 400

#### Scenario: Anonymous age-restricted channel hidden
- **WHEN** a different user fetches a channel owned by an account-less
  storage id whose project type is applab, gamelab, or weblab
- **THEN** the response is 404 (legacy `Projects#get` "not shareable")

### Requirement: Channel update
`POST` update SHALL enforce the same content-type gate as create, set
`updatedAt`, convert `publishLibrary` into a server-side `libraryPublishedAt`
timestamp, keep `subprojects` only for the music_dance_ai project type
(trimmed to the legacy maximum; removed entirely for all other types), map
`ProfanityPrivacyError` to 422 with JSON body `{"nameFailure":<flagged
text>}`, and map other validation/decryption errors to 400. `PATCH` and `PUT`
SHALL behave identically to `POST` (legacy verb aliases).

#### Scenario: Profane rename
- **WHEN** an update renames a channel to text flagged by share filtering
- **THEN** the response is 422 with JSON `{"nameFailure":"<flagged text>"}`

#### Scenario: PUT alias
- **WHEN** the same valid update body is sent via PUT instead of POST
- **THEN** the response is identical to the POST response

### Requirement: Channel delete
`DELETE` by id SHALL soft-delete via `Projects#delete` and respond 204
`"No content\n"`; decryption failures map to 400. `POST
/v3/channels/:id/delete` SHALL behave identically to `DELETE` (legacy
old-browser alias) on both surfaces.

#### Scenario: POST delete alias
- **WHEN** a legacy client POSTs to `/v3/channels/<id>/delete`
- **THEN** the channel is soft-deleted and the response is 204

### Requirement: Policy violation reads
The system SHALL port `privacy-profanity` (`{"has_violation":<bool>}`),
`share-failure` (`{"share_failure":...,"intl_share_failure":...,"language":...}`
with intl lookup only for non-English request language), `sharing_disabled`
(`{"sharing_disabled":<bool>}` from the owner's property via
`Projects#get_sharing_disabled`), and `is_teacher_of_project_owner`
(`{"is_teacher_of_project_owner":<bool>}` for the current user), each JSON
with `dont_cache` headers and decryption failures mapped to 400.

#### Scenario: Sharing disabled lookup
- **WHEN** `GET /v3/channels/<id>/sharing_disabled` for a channel whose owner
  has sharing disabled
- **THEN** the response is `{"sharing_disabled":true}`
