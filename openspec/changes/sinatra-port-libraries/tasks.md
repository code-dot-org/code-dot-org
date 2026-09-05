# Tasks

TDD throughout. Semantics of record: `files_api.rb` libraries routes +
`test_libraries.rb`. Depends on `sinatra-port-files-assets` (transfer service
fully quota-capable, alias pattern established).

## 1. Translate legacy tests (red)

- [ ] 1.1 Create
      `dashboard/test/integration/api/v1/libraries_api_legacy_parity_test.rb`
      translating `test_libraries.rb` 1:1 against `/v3/libraries` alias
      paths, plus the share-filtering scenarios (profanity → 400
      `profaneWords`, PII → 400 `pIIWords`, TextTooLong → 413, backpack
      exemption — stub `ShareFiltering`/`WebPurify` as the legacy tests do)
      and the libraries-specific `dont_cache` read header. Preserve
      migration-status comments.
- [ ] 1.2 Add canonical-surface CSRF pair tests for `PUT` and `DELETE`.

## 2. Controller, routes, cutover (green)

- [ ] 2.1 Implement `Api::V1::LibrariesController` (+ `LegacyLibrariesController`
      with `skip_forgery_protection`) on the transfer service +
      `LibraryBucket`: index, show, update, destroy, versions.
- [ ] 2.2 Add canonical + `/v3` alias routes; delete the libraries route
      blocks from `files_api.rb`. All 1.x green.
- [ ] 2.3 Manual pass: publish an App Lab library and import it in another
      project; save/load a backpack file in Java Lab against the dev server.

## 3. Retire and verify

- [ ] 3.1 Delete `dashboard/legacy/test/middleware/test_libraries.rb`.
- [ ] 3.2 Verify `files_api.rb` now serves only the codeprojects.org routes
      (and machinery they need); FilesApi middleware still mounted. Full new
      suite + remaining legacy suite + `./tools/hooks/pre-commit`.
