# Tasks

TDD throughout. Semantics of record: `animation_library_api.rb`,
`sound_library_api.rb`, and their legacy tests. Depends on
`sinatra-port-foundation` (base controller, auth helpers, cache concern).
Same-URL takeover: no alias routes, no client changes, no
`lib/cdo/http_cache.rb` changes.

Routing: sound/animation object names contain slashes (the Sinatra regexes
use `(.+)`) — use glob segments (`*name`) with `format: false`; otherwise
`category_animals/bird.png` never matches and `.png` is eaten as a format.

## 1. Sound library (smaller — do first)

- [ ] 1.1 Create
      `dashboard/test/integration/api/v1/sound_library_legacy_parity_test.rb`
      translating `test_sound_library_api.rb` 1:1 (S3 stubbing per the legacy
      test), plus: delete-marker skip, 404 on S3 failure, exact
      `Cache-Control: public, max-age=3600, s-maxage=1800`, no `Set-Cookie`,
      restricted-route env guard and signed-cookie accept/expired/missing
      cases. Red.
- [ ] 1.2 Implement `Api::V1::SoundLibraryController` (CSRF skipped — reads
      only, plus parity) porting both routes verbatim (`send_data` streaming,
      `has_signed_cookie?` as a private method); add routes for
      `/api/v1/sound-library/*name` and `/restricted/*name` (env-conditional
      like the Sinatra route). Green — but requests still hit the middleware.
- [ ] 1.3 Remove `SoundLibraryApi` from `config/application.rb` (require +
      insert); delete `sound_library_api.rb` and
      `test_sound_library_api.rb`. 1.1 green against the Rails routes.
      Commit.

## 2. Animation library

- [ ] 2.1 Create
      `dashboard/test/integration/api/v1/animation_library_legacy_parity_test.rb`
      translating `test_animation_library_api.rb` 1:1, plus: route-precedence
      scenarios (manifest vs versioned catch-all; level_animations versioned
      vs unversioned), locale-fallback manifest keys, levelbuilder 403 with
      the legacy message, content-type 400s, level-animations-files listing
      with PNG dimensions (stub S3 + fixture PNG). Red.
- [ ] 2.2 Implement `Api::V1::AnimationLibraryController` (CSRF skipped with
      a comment linking the token-adoption follow-up) porting all routes
      verbatim; declare routes in Sinatra's order so the versioned catch-all
      matches last (use constraints where Rails needs help, e.g.
      `(spritelab|gamelab)` and `(levelbuilder|production)` segments). Green
      behind the middleware.
- [ ] 2.3 Remove `AnimationLibraryApi` from `config/application.rb`; delete
      `animation_library_api.rb` and `test_animation_library_api.rb`. 2.1
      green against the Rails routes. Commit.

## 3. Verification

- [ ] 3.1 Manual pass against the dev server: open the spritelab costume
      picker and a dance party level (manifest + animation reads); as a
      levelbuilder user, upload a level animation.
- [ ] 3.2 File the follow-up issue for CSRF token adoption on
      animation-library writes (levelbuilder client in `apps/src`), linked
      from the controller comment.
- [ ] 3.3 Full new suites + remaining legacy middleware suite +
      `./tools/hooks/pre-commit`; confirm `lib/cdo/http_cache.rb` untouched.
