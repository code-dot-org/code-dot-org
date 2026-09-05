# Pegasus Removal: SharedResources Port

Change 4 of the pegasus removal series (`specs/pegasus-removal/plan.md`,
tier 1). Ports the sixth and last project Sinatra app —
`SharedResources` — to a Rails controller, removing the final writer
of `pegasus/cache/` and the last production use of the dead Ruby
`sass` gem's `Sass::Plugin::Rack`.

## Why

`shared/middleware/shared_resources.rb` is a Sinatra app mounted in
the production Rack stack (`dashboard/config/application.rb:104`)
serving three URL surfaces referenced across dashboard views and
apps/: `/shared/css/*` (SCSS compiled at request time by
`Sass::Plugin::Rack` — Ruby Sass, unmaintained upstream since 2019 —
into `pegasus/cache/css`), `/shared/images/*` (RMagick
resize/retina/format processing via `lib/cdo/pegasus/graphics.rb`,
with `fit-`/`fill-NxM` path segments and `_2x` handling), and
`/shared/wasm/*.wasm`. The sinatra-port series (PR #73697) explicitly
excludes it. It blocks: deleting `pegasus/cache/`, deleting
`lib/cdo/pegasus/`, and removing the `sinatra` gem.

## What Changes

- New `SharedAssetsController` in dashboard serving the three
  surfaces at their exact existing paths, with byte-identical
  response headers:
  - `Cache-Control: public, must-revalidate, max-age=<x>, s-maxage=<y>`
    values driven by the same DCDO keys (`pegasus_image_max_age`,
    `pegasus_image_proxy_max_age`, `pegasus_static_max_age`,
    `pegasus_static_proxy_max_age` — key names intentionally
    unchanged: live DCDO overrides must keep working; renaming is a
    non-goal).
  - `/shared/css/<name>.css`: serve the file from `shared/css/` if it
    exists; otherwise compile `shared/css/<name>.scss` with SassC
    (already in the bundle via sassc-rails) using mtime-based
    staleness, caching output under `dashboard/tmp/cache/shared-css/`.
  - `/shared/images/*`: `process_image` logic moved verbatim from
    `lib/cdo/pegasus/graphics.rb` to `dashboard/lib/shared_image_processing.rb`
    (RMagick already a dashboard dependency); `Last-Modified` +
    conditional GET preserved.
  - `/shared/wasm/*.wasm`: static serve with
    `Content-Type: application/wasm`.
- Delete `shared/middleware/shared_resources.rb`, its require and
  middleware insert in `dashboard/config/application.rb`,
  `lib/cdo/pegasus/graphics.rb` (leaving `lib/cdo/pegasus/` empty —
  delete the directory), the dead `optimize_image` global (its only
  namesake caller is `lib/cdo/optimizer.rb`'s own separate method).
- Port tests: `shared/test/test_shared_resources.rb` (1 test) and
  `lib/test/cdo/pegasus/test_graphics.rb` become dashboard controller
  / lib tests.

Depends on: `pegasus-core-ext-extraction` (moves `nil_or_empty?` out
of the require chain this change deletes).

## Capabilities

### New Capabilities

- `pegasus-shared-assets-serving`: the `/shared/css|images|wasm`
  surfaces served by Rails with header and body parity.

### Modified Capabilities

_None._

## Impact

- New: controller + routes + `dashboard/lib/shared_image_processing.rb`
  + SCSS compile helper + tests.
- Deleted: the Sinatra app, `lib/cdo/pegasus/` (entire directory),
  2 requires + 1 middleware insert in `application.rb`.
- `pegasus/cache/` loses its last writer (deletion happens in
  `pegasus-directory-removal`).
- `sass` gem: `Sass::Plugin` usage gone; the gem remains a transitive
  dependency of `bootstrap-sass`/`scss_lint` (removal out of scope).
- CDN behavior: unchanged — same paths, same Cache-Control strings.
- Clients (dashboard views, apps/ components) unchanged.
