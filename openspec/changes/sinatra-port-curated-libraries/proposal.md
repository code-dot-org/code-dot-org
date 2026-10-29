# Sinatra Port: Curated Libraries (Animation + Sound)

Phase 6 of the Sinatra middleware port series (after
`sinatra-port-libraries`). Ports `AnimationLibraryApi` and `SoundLibraryApi`
(`dashboard/legacy/middleware/animation_library_api.rb`,
`sound_library_api.rb`) to Rails controllers and removes both middlewares
from the Rack stack entirely. These serve Code.org-curated S3 content, not
user content.

## Why

Both apps already serve `/api/v1/...` URLs — the Rails router just never sees
them because the middleware intercepts first. The port is a same-URL
takeover: add Rails routes at the identical paths, delete the middleware.
No aliases, no client changes, no CDN changes (`/api/v1/sound-library/*`
keeps its cookie-free CDN behavior; animation-library stays under `/api/*`).

## Decisions

- Strict parity from `test_animation_library_api.rb` (~12 tests) and
  `test_sound_library_api.rb` (~3 tests).
- **CSRF stays skipped on these controllers** despite the `/api/v1` paths:
  the URLs predate the port and their existing write clients
  (levelbuilder animation upload UI in `apps/src`) do not send tokens. The
  series rule "CSRF on canonical routes" applies to routes new clients adopt;
  these are existing surfaces. Token adoption is a tracked follow-up, not
  this change.
- Route order is load-bearing: Sinatra matches top-down and the legacy
  catch-all `GET /api/v1/animation-library/:version_id/:filename` (old
  Gamelab/Spritelab projects depend on it) must stay the lowest-precedence
  route. Rails routes must be declared in the same relative order.
- Reads never require auth; animation-library writes require the
  `levelbuilder` permission (403 with the legacy message otherwise) via the
  foundation auth helpers.
- S3 access stays verbatim (`Aws::S3::Bucket`, version-aware gets,
  `object_versions` delete-marker skip for sounds); bodies stream via
  `send_data` with the object's content type and `cache_for 3600`.

## What Changes

- New `Api::V1::AnimationLibraryController`: level_animations get
  (versioned + unversioned), level_animations POST, spritelab category POST,
  spritelab/gamelab versioned get, manifest get (locale fallback:
  spritelab non-en_us locales read `<name>.<locale>.json`),
  level-animations-files listing (S3 scan + PNG dimension extraction),
  default-spritelab-metadata GET/POST (levelbuilder|production; 400
  otherwise), legacy versioned catch-all get. Failed S3 reads answer 404.
- New `Api::V1::SoundLibraryController`: sound get (latest non-delete-marker
  version; dev-mode local bucket population preserved), `/restricted/:name`
  get (development, or CI test env only; raises outside those; 403 without a
  valid unexpired CloudFront signed-policy cookie).
- Both middlewares removed from `config/application.rb` (requires + inserts);
  both Sinatra files and their legacy tests deleted in this change (nothing
  else references them).

## Capabilities

### New Capabilities

- `sinatra-port-animation-library-api`: curated animation library surface.
- `sinatra-port-sound-library-api`: curated sound library + restricted
  surface.

### Modified Capabilities

None.

## Impact

- Two controllers + routes + tests; `application.rb` loses two middleware
  entries; `animation_library_api.rb`, `sound_library_api.rb`, and their two
  legacy test files deleted.
- Clients unchanged: `apps/src/assetManagement/animationLibraryApi.js`,
  dance song modules, spritelab costume pickers.
- CDN: no `lib/cdo/http_cache.rb` changes — paths are identical.
