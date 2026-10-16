# Tasks

TDD throughout. Semantics of record:
`dashboard/legacy/middleware/channels_api.rb` and
`dashboard/legacy/test/middleware/test_channels.rb` +
`test_channels_base64_error.rb`. Run tests with `bundle exec spring testunit`
from `dashboard/`; `./tools/hooks/pre-commit` before every commit. The legacy
middleware suite must stay green until 4.x removes the ported pieces.

## 1. Translate the legacy tests (red)

- [ ] 1.1 Create
      `dashboard/test/integration/api/v1/channels_api_legacy_parity_test.rb`
      (`ActionDispatch::IntegrationTest`): translate every case from
      `test_channels.rb` and `test_channels_base64_error.rb` 1:1 against the
      `/v3/channels` alias paths, preserving asserted statuses, headers, and
      bodies. Reuse storage-id/user setup patterns from
      `dashboard/test/controllers/report_abuse_controller_test.rb`. Preserve
      any workflow-emitted migration-status comments. Tests fail (routes do
      not exist yet).
- [ ] 1.2 Add canonical-surface tests: CSRF rejection without token on
      `POST /api/v1/channels`; a token-carrying create/update/delete happy
      path; create `Location` is `/api/v1/channels/<id>` on canonical and
      `/v3/channels/<id>` on alias.

## 2. Controller and routes (green)

- [ ] 2.1 Implement
      `dashboard/app/controllers/api/v1/channels_controller.rb` inheriting
      `Api::V1::ProjectsApiBaseController`, delegating to `Projects` (require
      `dashboard/legacy/middleware/helpers/projects.rb` and
      `profanity_privacy_helper.rb` explicitly — do not rely on the Sinatra
      app having loaded them). Actions: index, create, show, update, destroy,
      privacy_profanity, share_failure, sharing_disabled,
      is_teacher_of_project_owner, debug (staging/development only).
- [ ] 2.2 Implement `Api::V1::LegacyChannelsController < ChannelsController`
      containing only `skip_forgery_protection`.
- [ ] 2.3 Add routes: canonical under the existing
      `namespace :api / namespace :v1` block; aliases under a
      `scope path: '/v3'` block adjacent to the ReportAbuse scope, including
      the verb aliases (`patch`/`put` → update, `post :id/delete` → destroy).
      Route both surfaces to their respective controllers. Legacy parity
      tests still fail here only because the Sinatra middleware intercepts
      `/v3/channels` — verified next.

## 3. Cut over

- [ ] 3.1 Delete all route blocks from
      `dashboard/legacy/middleware/channels_api.rb`, leaving the class shell
      and its helper loads (required by `net_sim_api.rb` and legacy FilesApi
      tests); remove `ChannelsApi` from the middleware stack in
      `dashboard/config/application.rb` (delete the `insert_after` line;
      keep the `require_relative`).
- [ ] 3.2 All 1.x tests green. Manually verify in the local dev server: load
      and save a project in one lab (e.g. `/projects/applab`) end to end.

## 4. Retire legacy coverage

- [ ] 4.1 Update `dashboard/legacy/test/middleware/files_api_test_base.rb`
      (and `files_api_test_helper.rb` if applicable) to create channels via
      `Projects.new(storage_id).create(...)` directly instead of
      `POST /v3/channels` through the composed Rack app; run the remaining
      legacy FilesApi suites (`test_files.rb`, `test_sources.rb`,
      `test_assets.rb`, `test_animations.rb`, `test_libraries.rb`) green.
- [ ] 4.2 Delete `dashboard/legacy/test/middleware/test_channels.rb` and
      `test_channels_base64_error.rb`.
- [ ] 4.3 Run the full new suite + remaining legacy middleware suite +
      `./tools/hooks/pre-commit`; confirm `lib/cdo/http_cache.rb` and client
      code under `apps/` are untouched by the diff.
