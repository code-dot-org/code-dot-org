# Design: pegasus-shared-resources-port

## Context

`SharedResources < Sinatra::Base` (93 lines) serves:

1. `GET /shared/css/*` — `shared_dir('css', uri)` if the file exists,
   else `pegasus_dir('cache', 'css', uri)` (Sass::Plugin::Rack
   compiles `shared/css/*.scss` there on demand, mtime-stale checked
   per request), `content_type :css`, `cache :static`. 19 `.scss`
   sources, 2 plain `.css`; live requested names include
   `2022-rebrand-update.css`, `print.css`, `hamburger.css`, and font
   files under `shared/css/fonts/` (served with the css content type
   today — a quirk to preserve).
2. `GET /shared/wasm/*.wasm` — `deploy_dir(request.path_info)`,
   `application/wasm`, `cache :static`. One file exists
   (`shared/wasm/vmsg.wasm`).
3. `GET /shared/images/*` — `process_image(path, extnames)` from
   `lib/cdo/pegasus/graphics.rb`: resolves against
   `deploy_dir(uri + ext)` for png/jpeg/jpg/gif; supports
   `fit-`/`fill-`/`<w>x<h>` directory segments, `_2x` retina in/out
   with 0.5/2 scaling, MAX_DIMENSION 2880 clamp, `image.strip!`,
   quality 90 (or lossless JPEG when `CDO.image_optim`), Sinatra
   `last_modified` (304 support), file-passthrough when no
   manipulation is needed. The `language`/`site == 'hourofcode.com'`
   parameters are dead (call site passes 2 args).

Headers: `cache_for(max_age, proxy_max_age)` →
`Cache-Control: public, must-revalidate, max-age=<x>, s-maxage=<y>`.
Values from Sinatra settings backed by DCDO:
`DCDO.get("pegasus_#{type}_max_age", default)` with defaults
image=36000, image_proxy=18000, static=36000, static_proxy=18000,
and env overrides (staging=60, development=0). `/shared/*` paths are
not in `lib/cdo/http_cache.rb` behaviors — CDN treatment rides the
default behavior; header parity is what matters.

`unless File.file?(path) ... pass` semantics: unmatched paths fall
through the middleware to Rails → must 404 equivalently post-port
(nothing else serves `/shared/*`).

## Goals / Non-Goals

**Goals:**
- Same URLs, same bodies, same Cache-Control/Content-Type/
  Last-Modified behavior, from a Rails controller.
- Zero writes under `pegasus/`; no `Sass::Plugin` anywhere;
  `lib/cdo/pegasus/` deleted.

**Non-Goals:**
- Renaming the `pegasus_*_max_age` DCDO keys (live overrides exist;
  key names are an accepted fossil, documented in
  `pegasus-marketing-rename` as out of scope there too).
- Precompiling shared CSS into the asset pipeline / webpack (would
  change URLs).
- Image-format modernization (webp etc.).
- Removing the `sass` gem from the lockfile (transitive via
  bootstrap-sass, scss_lint).

## Decisions

**1. Compile-on-demand with mtime staleness, not build-time
precompile.** Matches Sass::Plugin's observable behavior exactly
(edit an .scss in dev → next request recompiles; prod compiles once
per process lifetime since sources never change post-deploy).
Compiled output goes to `dashboard/tmp/cache/shared-css/` (survives
nothing, needs no cleanup task). SassC (`SassC::Engine`, already in
the bundle) with `load_paths: [shared/css]` — verify each of the 19
.scss files compiles identically enough (they were written for Ruby
Sass; SassC is the more modern compiler — any divergence is a
diff-review task with byte comparison).

**2. Controller, not ActionDispatch::Static.** Static serving loses
the DCDO-driven Cache-Control and the image manipulation. One
controller with three actions keeps the whole surface reviewable:
`css`, `image`, `wasm`. Skip `initialize_statsig_stable_id` and
forgery protection per the sinatra-port foundation's precedent for
public cacheable GET endpoints (`Api::V1::ProjectsApiBaseController`
— reuse its base class if merged by implementation time, else copy
the two skips; note which was done in the PR).

**3. Routes at the exact legacy paths**, constrained to GET:
`get '/shared/css/*path'`, `get '/shared/wasm/*path'` (format wasm),
`get '/shared/images/*path'`. Rails glob params + explicit
`format: false` to stop Rails eating extensions. Path traversal
guard: resolve and verify the expanded path is under the expected
root (Sinatra's send_file had its own protection; the controller
must reject `..`).

**4. `process_image` moves verbatim** to
`dashboard/lib/shared_image_processing.rb` as `module
SharedImageProcessing` with `module_function`, dropping the dead
`language`/`site` parameters and the dead `optimize_image` global.
`resolve_image` (currently on the Sinatra settings object) moves in
as a private helper taking the extname list. Its test
(`lib/test/cdo/pegasus/test_graphics.rb`) moves to
`dashboard/test/lib/shared_image_processing_test.rb` and keeps its
fixtures.

**5. 404 parity.** Sinatra `pass` fell through to Rails' 404. The
controller renders the same Rails 404 (head :not_found via the
standard `render_404` path) for unknown files, wrong extensions, and
nil `process_image` results.

**6. Conditional GET.** Sinatra `last_modified` returned 304 with
the cache headers. Use `fresh_when(last_modified:)` /
`stale?` so If-Modified-Since behaves identically; assert in tests.

## Risks / Trade-offs

- **Risk: SassC output differs from Ruby Sass** (selector ordering,
  number formatting). Mitigation: a one-time task compiles all 19
  files with both compilers and diffs; cosmetic whitespace diffs are
  acceptable, rule diffs are not — if any rule diff appears, pin the
  affected file by committing the Ruby-Sass output as a static .css
  and dropping its .scss compile.
- **Risk: middleware-order interactions** — SharedResources sat
  before the Rails router; anything shadowing `/shared/*` in Rails
  routes would previously never receive traffic. Verify no existing
  Rails route matches `/shared/*` before adding routes.
- **Risk: image endpoints as a DoS vector** (arbitrary resize
  parameters). Not new — same logic, same MAX_DIMENSION clamp; noted
  only so the reviewer doesn't flag it as a regression.
- **Rollback:** revert commit; the middleware returns.
