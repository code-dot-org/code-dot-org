# Sinatra Port: Libraries

Phase 5 of the Sinatra middleware port series (after
`sinatra-port-files-assets`). Ports the `libraries` endpoint family — App Lab
shared code libraries and the cross-lab "backpack" — out of `FilesApi` to
`Api::V1::LibrariesController`. After this phase the Sinatra FilesApi retains
only the codeprojects.org routes (removed in the final phase).

## Why

Libraries is the last conventional `/v3` family in FilesApi. It is small
(~5 legacy tests plus bucket tests) but carries the one behavior unique to
it: share-filtering (profanity/PII) of published library content, with the
backpack exemption.

## Decisions

- Strict parity; `test_libraries.rb` and the library paths in the transfer
  service translate 1:1.
- Delegates to the transfer service with `LibraryBucket`; the
  share-filtering branch of `put_file` (already ported verbatim in phase 3,
  unexercised until now) is proven here.
- Alias CSRF pattern as in prior phases.

## What Changes

- New `Api::V1::LibrariesController` (+ legacy subclass): list (dont_cache),
  get (libraries force `dont_cache` on reads, unlike other buckets), `PUT`
  publish with share filtering, `DELETE`, versions list (`with_comments`
  param).
- Share filtering on publish: non-backpack library writes run
  `ShareFiltering.find_failure` over the name/description/source text
  extracted from JSON bodies (raw body for non-JSON), answering
  400 JSON with `{"profaneWords":[...]}` or `{"pIIWords":[...]}` details;
  `WebPurify::TextTooLongError` maps to 413; other filter errors map to 400
  with the error message as details. Backpack-type projects skip filtering.
- Canonical `/api/v1/libraries...` routes (CSRF on) + `/v3/libraries...`
  aliases (CSRF off); libraries route blocks deleted from `files_api.rb`;
  `test_libraries.rb` retired.

## Capabilities

### New Capabilities

- `sinatra-port-libraries-api`: the libraries HTTP surface with
  share-filtered publishing.

### Modified Capabilities

None (the share-filtering code already sits in the transfer service; this
phase adds its endpoint surface and test coverage, not new transfer
requirements).

## Impact

- New controller + routes + tests; `files_api.rb` shrinks to codeprojects
  routes + residual machinery; one legacy test file retired.
- Clients unchanged: `apps/src/code-studio/components/libraries/LibraryClientApi.js`,
  `apps/src/sharedComponents/backpack/BackpackClientApi.ts`.
