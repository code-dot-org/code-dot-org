# sinatra-port-animation-library-api

Curated animation library surface from
`dashboard/legacy/middleware/animation_library_api.rb`. Same-URL takeover of
the existing `/api/v1/animation-library/...` paths. Semantics of record: that
file plus `test_animation_library_api.rb` (translated 1:1 by tasks).

## ADDED Requirements

### Requirement: Same-URL takeover with preserved route precedence
The Rails routes SHALL serve the exact existing
`/api/v1/animation-library/...` paths with the middleware deleted in the same
change, and SHALL preserve Sinatra's top-down matching order — in particular
the legacy versioned catch-all
(`GET /api/v1/animation-library/:version_id/:filename`, still used by old
Gamelab/Spritelab projects) SHALL match only when no more specific
animation-library route does. CSRF SHALL remain skipped on this controller
(pre-existing URLs with tokenless legacy write clients; token adoption is a
tracked follow-up).

#### Scenario: Legacy catch-all still reachable
- **WHEN** `GET /api/v1/animation-library/<version-id>/category_animals/bird.png`
- **THEN** the versioned S3 object `category_animals/bird.png` is served, as
  under the middleware

#### Scenario: Specific route wins over catch-all
- **WHEN** `GET /api/v1/animation-library/manifest/spritelab/en_us`
- **THEN** the manifest route handles it, not the versioned catch-all

### Requirement: Curated animation reads
Reads SHALL port byte-for-byte: level_animations by version and unversioned,
spritelab/gamelab versioned reads, the manifest read (spritelab non-`en_us`
locales resolve `spritelabCostumeLibrary.<locale>.json`, gamelab and `en_us`
resolve the base `.json`), default-spritelab-metadata for
`levelbuilder`/`production` (400 for other values), and the
level-animations-files listing (S3 scan keyed by animation name/extension
with PNG dimensions). Successful reads answer with the S3 object's content
type and `Cache-Control: public, max-age=3600, s-maxage=1800`; S3 failures
answer 404.

#### Scenario: Localized manifest fallback shape
- **WHEN** the spritelab manifest is requested for locale `es_mx`
- **THEN** the S3 key read is
  `animation-manifests/manifests/spritelabCostumeLibrary.es_mx.json`

#### Scenario: Missing object
- **WHEN** any read names an object S3 cannot return
- **THEN** the response is 404 `"Not found\n"`

### Requirement: Levelbuilder-gated writes
Animation-library POSTs SHALL require the `levelbuilder` permission
(level_animations, spritelab category, default-spritelab-metadata),
answering 403 with the legacy message body otherwise, SHALL accept only
`image/png` or `application/json` request bodies (`application/json` only for
metadata; 400 otherwise), and SHALL put the raw body to the legacy S3 key
with the request content type.

#### Scenario: Non-levelbuilder rejected
- **WHEN** a signed-in user without `levelbuilder` POSTs an animation
- **THEN** the response is 403 with the legacy "must be a level builder"
  message

#### Scenario: Wrong content type
- **WHEN** a levelbuilder POSTs `text/plain` to a spritelab category
- **THEN** the response is 400 and nothing is written
