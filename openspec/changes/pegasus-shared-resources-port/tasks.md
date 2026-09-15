# Tasks: pegasus-shared-resources-port

Prerequisite: `pegasus-core-ext-extraction` merged (`nil_or_empty?`
no longer depends on this middleware's require chain — verify
`dashboard/config/initializers/extensions.rb` requires `cdo/object`
before starting).

## 1. Pre-port verification

- [ ] 1.1 Verify no existing Rails route matches `/shared/`:
      `grep -n "shared" dashboard/config/routes.rb` and review hits
- [ ] 1.2 SassC parity regression check: re-run the measured
      comparison from design.md decision 1 (throwaway script:
      compile each `shared/css/*.scss` with `Sass::Engine` and
      `SassC::Engine`, both `style: :nested`, load_paths
      `shared/css`; diff). EXPECTED result (recorded 2026-07-07):
      12 identical, 6 whitespace-only, hamburger.scss selector-order
      only. Anything beyond that expectation is a STOP — report in
      the PR before proceeding. Delete the script after.
- [ ] 1.3 Record baseline responses for the parity suite: with the
      dev server running, `curl -sD -` each of:
      `/shared/css/2022-rebrand-update.css`, `/shared/css/print.css`,
      `/shared/css/hamburger.css`, `/shared/wasm/vmsg.wasm`,
      `/shared/images/gallery/fit-750/artist_gallery_thumbnails.png`
      — save headers+bodies to compare after the port

## 2. Image processing module

- [ ] 2.1 Create `dashboard/lib/shared_image_processing.rb`: module
      `SharedImageProcessing` (`module_function`) with
      `load_manipulated_image` and `process_image` moved verbatim
      from `lib/cdo/pegasus/graphics.rb`, dropping the dead
      `language`/`site` params and the `optimize_image` global;
      `resolve_image` moves in as a helper taking
      `(uri, ext_names)`; keep `require 'rmagick'` and
      `require 'cdo/object'`; keep `MAX_DIMENSION = 2880`
- [ ] 2.2 Move `lib/test/cdo/pegasus/test_graphics.rb` to
      `dashboard/test/lib/shared_image_processing_test.rb`; adapt
      requires/module calls; keep fixtures and assertions

## 3. Controller and routes

- [ ] 3.1 Create `SharedAssetsController` with actions `css`,
      `image`, `wasm`; skip forgery protection and
      `initialize_statsig_stable_id` (reuse the sinatra-port base
      controller if it exists in the tree — check
      `dashboard/app/controllers/api/v1/projects_api_base_controller.rb`
      — else copy the two skips and note it in the PR)
- [ ] 3.2 Implement the DCDO cache-header helper: exact string
      `public, must-revalidate, max-age=<x>, s-maxage=<y>`; values
      via `DCDO.get("pegasus_image_max_age", 36000)` etc. with
      staging default 60 / development 0 (copy `set_max_age` logic
      from `shared/middleware/shared_resources.rb:11-15,26-29`
      before deleting it)
- [ ] 3.3 `css` action: sanitize path (reject `..` and absolute);
      serve `shared/css/<path>` if file exists; else if
      `shared/css/<basename>.scss` exists, compile with
      `SassC::Engine` (load_paths `shared/css`) using an
      mtime-staleness cache under `dashboard/tmp/cache/shared-css/`;
      else 404. `Content-Type: text/css` on every 200 (parity quirk:
      even for font files under `/shared/css/fonts/`)
- [ ] 3.4 `image` action: extname allowlist png/jpeg/jpg/gif; call
      `SharedImageProcessing.process_image`; nil → 404; file result →
      `send_file` with image content type; blob result →
      `send_data`; `fresh_when last_modified:` before doing
      manipulation work (return 304 without processing when
      not modified — match Sinatra's `last_modified` early-return)
- [ ] 3.5 `wasm` action: serve `shared/wasm/<path>` (sanitized),
      `Content-Type: application/wasm`, static cache headers, 404
      when absent
- [ ] 3.6 Routes in `dashboard/config/routes.rb`:
      `get '/shared/css/*path' => 'shared_assets#css', format: false`
      and equivalents for wasm and images (images route must accept
      any nesting depth)

## 4. Remove the middleware

- [ ] 4.1 In `dashboard/config/application.rb`: delete the
      `require 'shared_resources'` (~line 8) and the
      `config.middleware.insert_after ..., SharedResources` line
      (~line 104); if the sinatra-port series has already removed the
      neighboring middleware lines, adjust the insert chain
      accordingly (NetSimApi's insert may reference SharedResources —
      re-anchor it to whatever precedes)
- [ ] 4.2 Delete `shared/middleware/shared_resources.rb` and
      `shared/test/test_shared_resources.rb` (its one test is
      superseded by 5.2)
- [ ] 4.3 Delete `lib/cdo/pegasus/graphics.rb` and
      `lib/test/cdo/pegasus/test_graphics.rb` (moved in 2.2); remove
      the now-empty `lib/cdo/pegasus/` and `lib/test/cdo/pegasus/`
      directories
- [ ] 4.4 Grep gates: `grep -rn "SharedResources\|Sass::Plugin" --include=*.rb lib/ dashboard/ shared/ bin/`
      and `grep -rn "cdo/pegasus" --include=*.rb --exclude-dir=.git .`
      return nothing

## 5. Verify

- [ ] 5.1 New controller test
      `dashboard/test/controllers/shared_assets_controller_test.rb`
      covering every spec scenario: compiled scss 200+headers, plain
      file passthrough bytes, css 404, image fit-750 200+headers,
      image 304 conditional GET, image 404, wasm 200 content-type,
      path traversal rejected (`/shared/css/../config/secrets` → 404)
- [ ] 5.2 `bundle exec spring testunit ./test/controllers/shared_assets_controller_test.rb`
      and `./test/lib/shared_image_processing_test.rb` pass from
      `dashboard/`
- [ ] 5.3 Parity: re-run the 1.3 curls against the ported server;
      headers identical (modulo Date/ETag), bodies byte-identical
      (css bodies may differ per the 1.2 whitespace allowance —
      document any diff in the PR)
- [ ] 5.4 `bin/rails runner 'puts Rails.application.config.middleware.map(&:name)'`
      does not print SharedResources
- [ ] 5.5 Manual smoke with dev server: load the dashboard homepage
      signed out; header/footer images and shared css render (these
      views reference /shared/ URLs)
- [ ] 5.6 `./tools/hooks/pre-commit` passes
