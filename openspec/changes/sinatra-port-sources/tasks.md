# Tasks

TDD throughout. Semantics of record: `files_api.rb` sources routes +
`get_file`/`put_file`, and `dashboard/legacy/test/middleware/test_sources.rb`.
Depends on `sinatra-port-foundation` (concerns) and `sinatra-port-channels`
(alias controller pattern, `/v3` route scope). Legacy FilesApi suites for
unported families must stay green throughout.

CSRF-rejection tests MUST run inside the foundation forgery-protection
helper (`test_helper.rb` disables forgery protection globally). All
filename-bearing routes MUST set `format: false` with a dot-permissive
`:filename` constraint — otherwise Rails strips `.json` from `main.json` as
a format and every file route 404s or misroutes.

## 1. Transfer service (red then green)

- [ ] 1.1 Write `dashboard/test/services/project_files_transfer_test.rb`
      against `SourceBucket` (reuse the S3/bucket stubbing patterns from
      `dashboard/legacy/test/middleware/helpers/test_source_bucket.rb` and
      `test_bucket_helper.rb`) covering every scenario in
      `specs/sinatra-port-file-transfer/spec.md`: read gating (abuse
      threshold vs owner/admin/project_validator/teacher, profanity gating,
      404/415/304, attachment disposition, `S3-Version-Id`, `no-transform`),
      under-13 sanitization (stranger vs owner, non-JSON passthrough), write
      gating (401 non-owner, 413 at 5 MB, 409 stale version incl.
      `replace`/`firstSaveTimestamp`/`tabId` handling, abuse-score
      preservation, response entry shape), encoding validation (single-file,
      Java Lab multi-file, lab2 `files.*.contents`, Sketch Lab exemption).
- [ ] 1.2 Implement `dashboard/app/services/project_files_transfer.rb` by
      porting `FilesApi#get_file`, `#put_file`, `#copy_file`,
      `#sanitize_for_under_13`, `#has_valid_encoding?`,
      `#safely_viewable_file_type?`, `#valid_html_file?`/`#valid_html_content?`
      near-verbatim (parameterized by bucket; halting concern for exits).
      Green.

## 2. Translate the legacy endpoint tests (red)

- [ ] 2.1 Create
      `dashboard/test/integration/api/v1/sources_api_legacy_parity_test.rb`
      translating `test_sources.rb` 1:1 against `/v3/sources` +
      `/v3/sources-public` alias paths (statuses, headers, bodies).
      Preserve migration-status comments.
- [ ] 2.2 Add canonical-surface tests: tokenless `PUT /api/v1/sources/...`
      rejected; tokened round trip; `sources-public` response has exact
      `Cache-Control: public, max-age=20, s-maxage=10` and no `Set-Cookie`.

## 3. Controller, routes, cutover (green)

- [ ] 3.1 Implement `dashboard/app/controllers/api/v1/sources_controller.rb`
      (+ `LegacySourcesController` with `skip_forgery_protection`): list,
      show, update (PUT), destroy, versions, restore, public_show. Explicitly
      require the bucket helper files the controller needs.
- [ ] 3.2 Add canonical + `/v3` alias routes (including
      `/v3/sources-public/:channel_id/:filename`).
- [ ] 3.3 Delete the sources and sources-public route blocks from
      `dashboard/legacy/middleware/files_api.rb` (keep `get_file`/`put_file`
      — assets/files/animations/libraries still use them). All 2.x tests
      green.
- [ ] 3.4 Compare project-save latency before/after via local timing or
      existing per-route metrics; note the result in the PR description.
      Manually verify save/load in one Blockly lab and one lab2 lab against
      the dev server.

## 4. Retire legacy coverage

- [ ] 4.1 Delete `dashboard/legacy/test/middleware/test_sources.rb`; confirm
      `test_files.rb`, `test_assets.rb`, `test_animations.rb`,
      `test_libraries.rb` remain green (they exercise the still-mounted
      FilesApi families).
- [ ] 4.2 Full new suite + remaining legacy suite +
      `./tools/hooks/pre-commit`.
