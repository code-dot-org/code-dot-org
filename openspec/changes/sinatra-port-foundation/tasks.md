# Tasks

TDD throughout: write the failing test named in each pair before its
implementation task. Run tests with `bundle exec spring testunit <file>` from
`dashboard/`, and `./tools/hooks/pre-commit` from the repo root before every
commit. Nothing in this change may alter runtime behavior of existing routes
or of the Sinatra middlewares; the legacy suite
(`dashboard/legacy/test/middleware/`) must stay green untouched.

## 1. Halting responses concern

- [ ] 1.1 Write `dashboard/test/controllers/concerns/halting_responses_test.rb`
      driving a throwaway test controller: one test per helper asserting the
      exact status and body from `shared/middleware/helpers/core.rb`
      (204 "No content\n", 304 "Not Modified\n", 400 "Bad Request\n",
      401 "Not authorized\n", 403 default "Forbidden\n" + custom message,
      404 "Not found\n", 409 "Conflict\n", 413 default + custom message,
      415 "Unsupported Media Type\n"); `json_bad_request` with and without
      details; and one test proving code after a halt call never executes.
- [ ] 1.2 Implement `dashboard/app/controllers/concerns/halting_responses.rb`
      (exception class + `rescue_from` + one method per helper). Green.

## 2. Cache headers concern

- [ ] 2.1 Write `dashboard/test/controllers/concerns/legacy_cache_headers_test.rb`
      asserting exact strings: `dont_cache` →
      `private, must-revalidate, max-age=0`; `cache_for 3600` →
      `public, max-age=3600, s-maxage=1800`; explicit proxy_seconds override;
      `no-transform` append after either.
- [ ] 2.2 Implement `dashboard/app/controllers/concerns/legacy_cache_headers.rb`.
      Green.

## 3. Base controller

- [ ] 3.1 Write `dashboard/test/controllers/api/v1/projects_api_base_controller_test.rb`
      with a test route/controller inheriting the base: anonymous GET yields
      no `Set-Cookie` and no session write; CAP-locked signed-in user (reuse
      CAP lockout test setup from existing `handle_cap_lockout` coverage) is
      not redirected; non-GET without CSRF token raises/422s; the
      `Api::V1::JSONApiController` 403-on-RecordNotFound rescue is absent
      (a raised `ActiveRecord::RecordNotFound` is not rescued to 403).
- [ ] 3.2 Implement
      `dashboard/app/controllers/api/v1/projects_api_base_controller.rb`:
      `< ApplicationController`, `include HaltingResponses,
      LegacyCacheHeaders`, `skip_before_action :initialize_statsig_stable_id,
      :handle_cap_lockout`. Green.

## 4. Storage identity concern

- [ ] 4.1 Write `dashboard/test/controllers/concerns/storage_identity_test.rb`
      covering the resolution order (signed-in user row, anonymous cookie,
      anonymous no-cookie creates row + cookie) and both cross-compatibility
      scenarios: a cookie built by the legacy `create_storage_id_cookie`
      helper decrypts via the concern, and a concern-written cookie decrypts
      via legacy `storage_id_from_cookie` (drive the legacy side with a
      minimal Sinatra/Rack stub as in
      `dashboard/legacy/test/middleware/files_api_test_base.rb`). Assert
      cookie attributes: name from `storage_id_cookie_name`, dot-prefixed
      shared domain, `path=/`, ~365-day expiry, CGI-escaped
      `storage_encrypt_id` payload.
- [ ] 4.2 Implement `dashboard/app/controllers/concerns/storage_identity.rb`
      wrapping `shared/middleware/helpers/storage_id.rb` functions —
      Rails-native `cookies` API for read/write; do NOT reimplement
      encryption; `owns_channel?` lets decryption errors propagate. Green.
- [ ] 4.3 Add a parity test asserting `get_storage_id` for a signed-in user
      returns the same id the legacy Sinatra path resolves for that user
      (same `user_project_storage_ids` row, created at most once).

## 5. Auth helpers concern

- [ ] 5.1 Write `dashboard/test/controllers/concerns/legacy_auth_helpers_test.rb`
      with factory fixtures exercising every scenario in
      `specs/sinatra-port-auth-helpers/spec.md`: signed-out falsy defaults;
      `levelbuilder`/`project_validator`/`authorized_teacher` permissions;
      `under_13?` nil-user and nil-birthday → true; sharing predicates and
      missing-user default; `teaches_student?` co-instructor true,
      soft-deleted section/follower/user false; `owns_section?` admin-non-owner
      false.
- [ ] 5.2 Implement `dashboard/app/controllers/concerns/legacy_auth_helpers.rb`
      over `current_user`/User/Section/Follower/SectionInstructor models,
      semantics pinned to `dashboard/legacy/middleware/helpers/auth_helpers.rb`
      (memoize the permission list per request as the legacy code does). Green.

## 6. Mime types and wrap-up

- [ ] 6.1 Add `dashboard/config/initializers/mime_types` entries for `.webp`
      (`image/webp`) and `.md` (`text/markdown`) (extend the existing
      initializer if present) with a test asserting resolution; leave the
      `Rack::Mime` monkeypatch in `files_api.rb` untouched.
- [ ] 6.2 Run the full new-test set plus the untouched legacy middleware suite
      (`bundle exec spring testunit dashboard/legacy/test/middleware/...` per
      TESTING.md) and `./tools/hooks/pre-commit`; confirm zero changes under
      `dashboard/legacy/` and `dashboard/config/routes.rb` in the diff.
