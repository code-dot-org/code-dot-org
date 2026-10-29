# Sinatra Port: Foundation

First change in the ~7-change series porting the five legacy Sinatra
middlewares (`dashboard/legacy/middleware/`: FilesApi, ChannelsApi, NetSimApi,
AnimationLibraryApi, SoundLibraryApi) to Rails controllers. This change builds
the shared controller infrastructure every later phase depends on. It ports no
endpoints itself.

Series plan (each phase is its own OpenSpec change, proposed via
`/opsx:propose` when reached): foundation → channels → sources → files/assets
→ libraries → animation/sound-library → netsim/codeprojects.

## Why

Five Sinatra apps run as Rack middleware inserted ahead of the Rails router,
session, and Warden (`dashboard/config/application.rb:101-107`). They
reimplement authentication by hand-parsing the Rails session cookie out of
Redis (`lib/cdo/rack/request.rb:108`) and duplicate User-model logic as raw
Sequel queries (`dashboard/legacy/middleware/helpers/auth_helpers.rb`). Write
endpoints have no CSRF protection. Every port slice needs the same controller
plumbing — porting it once, test-first, keeps the per-API changes small enough
for a single implementing session.

The abuse endpoints were already ported this way (`ReportAbuseController`,
routes.rb:833-843): a Rails controller calling the same storage helpers, with
the Sinatra routes deleted. This change generalizes that precedent into
shared, tested infrastructure.

## Decisions (locked during exploration; no separate design doc)

- **Strict parity.** Ported endpoints return byte-identical statuses, headers,
  and bodies to the Sinatra originals. The legacy Rack::Test suites in
  `dashboard/legacy/test/middleware/` translate 1:1 into
  `ActionDispatch::IntegrationTest` and are the spec of record. The only
  permitted divergence: CSRF enforcement on new canonical routes.
- **Dual routes.** Each endpoint gets a canonical `/api/v1/...` route
  (CSRF enforced — `frontend/` clients already send `X-CSRF-Token` via the
  `@code-dot-org/core` ky transport) plus a legacy alias at the exact old path
  (CSRF skipped, preserving today's posture for `apps/` clients). Legacy
  aliases take over only when the corresponding Sinatra route is deleted —
  the middleware intercepts first until then. codeprojects.org routes are
  host-constrained ports at existing paths.
- **Base class.** `ApplicationController`-derived shared base (repo standard;
  no `ActionController::API` precedent exists). It skips
  `initialize_statsig_stable_id` (no phantom sessions/Set-Cookie on public
  cacheable endpoints; precedent `home_controller.rb:20`) and
  `handle_cap_lockout` (preserves today's bypass — a CAP-locked student's
  in-flight save still succeeds; accepted race). `protect_from_forgery` stays.
- **Transport-first.** Controllers delegate to the existing storage layer
  (`Projects`, `*Bucket`, `RedisTable`, `shared/middleware/helpers/storage_id.rb`)
  exactly as `ReportAbuseController` does. The channel-id AES scheme is an
  opaque wire token: wrap it, never reimplement it. Sequel→ActiveRecord
  migration is out of scope for the whole series.
- **Rollback** is per-endpoint revert commits, not runtime flags.

## What Changes

- New shared base controller `Api::V1::ProjectsApiBaseController <
  ApplicationController` carrying the filter skip list and common rescues.
- New halting-responses concern replacing the Sinatra `halt` helpers from
  `shared/middleware/helpers/core.rb` (`bad_request`, `not_found`, `conflict`,
  `too_large`, `unsupported_media_type`, `not_authorized`, `no_content`,
  `not_modified`) as exceptions + `rescue_from`, preserving exact status codes
  and body conventions. NOT `Api::V1::JSONApiController` — its
  `RecordNotFound → 403` mapping conflicts with required 404 parity.
- New storage-id concern providing Rails-native equivalents of the
  storage-id cookie protocol (`get_storage_id`, `storage_id_from_cookie`,
  `create_storage_id_cookie`, `owns_channel?`). Byte-compatible with the
  Sinatra cookie: same name, `.code.org` domain, AES payload, 365-day expiry.
  The Sinatra versions call Rack/Sinatra APIs (`response.set_cookie`,
  `request.shared_cookie_domain`) that do not all exist on ActionDispatch
  objects — this concern is where that mismatch is resolved, once.
- New cache-headers concern (`dont_cache`, `cache_for` with `no-transform`
  append) asserting exact `Cache-Control` strings — CDN behaviors in
  `lib/cdo/http_cache.rb` key on them.
- New auth-helpers mapping: `admin?`, `has_permission?`, `under_13?`,
  `sharing_disabled?`, `teaches_student?`, `owns_section?` re-expressed over
  `current_user` / the User model, with tests pinning parity against the
  Sequel implementations (including multi-instructor sections via
  `section_instructors`).
- Mime type initializer registering `.webp` and `.md`, replacing the
  `Rack::Mime` monkeypatch at `files_api.rb:13-14`.
- No routes, no endpoint behavior changes, no middleware removal in this
  change.

## Capabilities

### New Capabilities

- `sinatra-port-controller-base`: shared base controller, filter skip list,
  halting-responses concern, cache-headers concern — the transport plumbing
  every ported controller inherits.
- `sinatra-port-storage-identity`: storage-id cookie protocol and channel
  ownership checks in Rails controller context, byte-compatible with the
  Sinatra implementation.
- `sinatra-port-auth-helpers`: permission/relationship predicates over the
  User model matching the legacy Sequel helpers' semantics.

### Modified Capabilities

None — existing specs are untouched; this change adds infrastructure only.

## Impact

- New code under `dashboard/app/controllers/api/v1/`,
  `dashboard/app/controllers/concerns/`, and one initializer; new tests under
  `dashboard/test/`.
- Zero runtime behavior change: nothing routes through the new code until the
  channels phase.
- Later phases depend on this change's contracts; its review sets the
  template for the remaining six.
- Rails-only; no `apps/` or `frontend/` changes.
