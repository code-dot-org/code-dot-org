# sinatra-port-controller-base

Shared transport plumbing for controllers ported from the legacy Sinatra
middlewares. Reference implementations: `shared/middleware/helpers/core.rb`
(halt helpers), `dashboard/app/controllers/application_controller.rb`
(filter chain being selectively skipped).

## ADDED Requirements

### Requirement: Shared base controller
The system SHALL provide `Api::V1::ProjectsApiBaseController <
ApplicationController` from which all ported controllers inherit. It SHALL
skip the `initialize_statsig_stable_id`, `handle_cap_lockout`, and
`assert_lms_landing_policy` before actions (the latter two are redirect
filters the Sinatra middleware bypassed — preserving that bypass is a
ratified product decision) and SHALL NOT skip `protect_from_forgery`. It
SHALL NOT inherit from `Api::V1::JSONApiController` (whose
`ActiveRecord::RecordNotFound → 403` rescue conflicts with legacy 404
semantics).

#### Scenario: Anonymous request creates no session
- **WHEN** an anonymous (cookieless) GET hits an action on a controller
  inheriting the base that never reads `current_user` or the session
- **THEN** the response contains no `Set-Cookie` header

#### Scenario: CAP-locked user is not redirected
- **WHEN** a signed-in user who is locked out by the Child Account Policy
  invokes an action on a controller inheriting the base
- **THEN** the action executes normally (no `302` redirect to the lockout
  page), preserving the legacy middleware bypass

#### Scenario: Mid-LTI-linking user is not redirected
- **WHEN** a signed-in user whose session is mid LTI account linking
  (`Policies::Lti.account_linking?` true) invokes an action on the base
- **THEN** the action executes normally (no redirect to the LTI landing
  page)

#### Scenario: CSRF enforced by default
- **WHEN** a non-GET request without a valid CSRF token hits an action on a
  controller inheriting the base
- **THEN** the request is rejected by `protect_from_forgery with: :exception`

### Requirement: Halting response helpers
The system SHALL provide a concern giving ported controllers halt-equivalent
methods matching `shared/middleware/helpers/core.rb` byte-for-byte: calling a
helper stops action processing (exception + `rescue_from`) and renders exactly
the legacy status and body — `no_content` → 204 `"No content\n"`,
`not_modified` → 304 `"Not Modified\n"`, `bad_request` → 400
`"Bad Request\n"`, `not_authorized` → 401 `"Not authorized\n"`, `forbidden` →
403 with message argument (default `"Forbidden\n"`), `not_found` → 404
`"Not found\n"`, `conflict` → 409 `"Conflict\n"`, `too_large` → 413 with
message argument (default `"Payload too large\n"`), `unsupported_media_type`
→ 415 `"Unsupported Media Type\n"`, and `json_bad_request(details)` → 400
with JSON body `{"error":"Bad Request"}` plus a `details` key when details
are given.

#### Scenario: Halt stops the action mid-method
- **WHEN** an action calls `not_found` before subsequent statements
- **THEN** the response is 404 with body `"Not found\n"` and no code after
  the `not_found` call executes

#### Scenario: JSON bad request with details
- **WHEN** an action calls `json_bad_request({"profaneWords" => ["x"]})`
- **THEN** the response is 400 with `Content-Type: application/json` and body
  `{"error":"Bad Request","details":{"profaneWords":["x"]}}`

### Requirement: Cache header helpers
The system SHALL provide a concern with `dont_cache` producing
`Cache-Control: private, must-revalidate, max-age=0` and
`cache_for(seconds, proxy_seconds = nil)` producing `Cache-Control: public,
max-age=<seconds>, s-maxage=<proxy_seconds || seconds/2>`, matching the
legacy helpers exactly (CDN behaviors in `lib/cdo/http_cache.rb` key on these
values). It SHALL also support appending `no-transform` as FilesApi does.

#### Scenario: cache_for default proxy age
- **WHEN** an action calls `cache_for 3600`
- **THEN** the response `Cache-Control` header is exactly
  `public, max-age=3600, s-maxage=1800`

#### Scenario: dont_cache
- **WHEN** an action calls `dont_cache`
- **THEN** the response `Cache-Control` header is exactly
  `private, must-revalidate, max-age=0`

### Requirement: Mime type registrations
The system SHALL register the `.webp` (`image/webp`) and `.md`
(`text/markdown`) content types via a Rails initializer so ported file-serving
controllers resolve them without the `Rack::Mime::MIME_TYPES` monkeypatch at
`dashboard/legacy/middleware/files_api.rb:13-14`. The monkeypatch SHALL remain
untouched until FilesApi is ported.

#### Scenario: webp resolves
- **WHEN** a ported controller resolves the content type for extension `.webp`
- **THEN** it yields `image/webp`
