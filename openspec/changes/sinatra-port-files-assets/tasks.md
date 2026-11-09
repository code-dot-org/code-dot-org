# Tasks

TDD throughout. Semantics of record: `files_api.rb` plus legacy suites
`test_assets.rb`, `test_animations.rb`, `test_files.rb`,
`files_api/test_public_thumbnails.rb`. Depends on `sinatra-port-sources`
(transfer service, alias pattern). Work the three sub-surfaces in order —
each is independently committable with its own cutover; libraries and
codeprojects routes must remain served by the Sinatra FilesApi throughout.

CSRF-rejection tests MUST run inside the foundation forgery-protection
helper (`test_helper.rb` disables forgery protection globally). All
filename-bearing routes MUST set `format: false` with dot-permissive
constraints. Delete-all routes on a literal `*` filename segment: route
`:filename` normally and branch on `filename == '*'` in the controller (a
bare `*` in a Rails route path is a glob, not a literal).

## 1. Quota support in the transfer service

- [ ] 1.1 Extend `project_files_transfer_test.rb` with the quota scenarios
      (403 + QuotaExceeded event at the 2 GB cap, QuotaCrossedHalfUsed
      crossing 1 GB, copy-path quota check, 413 records metric only), using
      `AssetBucket` stubs for `app_size`/`object_and_app_size`.
- [ ] 1.2 Port `quota_*`/`record_metric`/`record_event` from `files_api.rb`
      into the service. Green.

## 2. Assets and user animations

- [ ] 2.1 Translate `test_assets.rb` and `test_animations.rb` 1:1 into
      `dashboard/test/integration/api/v1/assets_api_legacy_parity_test.rb`
      against the `/v3` alias paths (multipart uploads included — note Rails
      delivers `ActionDispatch::Http::UploadedFile`, normalize in the
      controller, not the tests). Add canonical-surface CSRF pair tests.
      Preserve migration-status comments. Red.
- [ ] 2.2 Implement `Api::V1::AssetsController` (+ legacy subclass) covering
      assets CRUD, copy-assets, user animations (PNG `PUT`, `?src=` copy,
      multipart `POST`, versions), `text/plain` responses on the iframe
      endpoints. Add canonical + alias routes. Green.
- [ ] 2.3 Delete the assets, animations, and copy-assets route blocks from
      `files_api.rb`; legacy `test_assets.rb`/`test_animations.rb` deleted;
      remaining legacy suites green. Commit.

## 3. Project files, metadata, files-version

- [ ] 3.1 Translate `test_files.rb` (~45 tests) and
      `test_public_thumbnails.rb` into
      `dashboard/test/integration/api/v1/project_files_api_legacy_parity_test.rb`
      (manifest choreography, case handling, `.jfif` rename, WebLab HTML
      validation incl. DCDO `disallowed_html_tags` stubbing, metadata
      allowlist, delete-all, files-version restore, files-public no-cookie
      cacheability). Add canonical CSRF pairs. Red.
- [ ] 3.2 Implement `Api::V1::ProjectFilesController` (+ legacy subclass)
      porting `files_put_file` and the manifest read/delete/restore routes
      onto the transfer service + `FileBucket`. Add routes (both surfaces,
      incl. `/v3/files-public` and `/v3/files-version`). Green.
- [ ] 3.3 Delete the files, files-version, files-public, and metadata route
      blocks from `files_api.rb`; delete `test_files.rb` and
      `test_public_thumbnails.rb`; remaining legacy suites green. Commit.

## 4. Image moderation

- [ ] 4.1 Write parity tests for `POST /v3/images/moderate` (empty body 400,
      unsupported type 400 with allowed-types message, moderation result
      passthrough with `ImageModeration` stubbed) + canonical CSRF pair. Red.
- [ ] 4.2 Implement `Api::V1::ImageModerationController` (+ legacy subclass),
      routes, delete the Sinatra route. Green. Commit.

## 5. Verification

- [ ] 5.1 `files_api.rb` now contains only libraries routes, codeprojects
      routes, and shared machinery still needed by them — verify by reading
      the file; FilesApi middleware remains mounted and `test_libraries.rb`
      green.
- [ ] 5.2 Manual pass against the dev server: WebLab file
      upload/rename/delete, applab asset upload + picker, p5lab animation
      upload, project version restore. Run
      `dashboard/test/ui/features/star_labs/manage_assets.feature` locally
      per TESTING.md.
- [ ] 5.3 Full new suites + remaining legacy suite +
      `./tools/hooks/pre-commit`.
