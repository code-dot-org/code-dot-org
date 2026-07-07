# sinatra-port-sound-library-api

Curated sound library surface from
`dashboard/legacy/middleware/sound_library_api.rb`. Same-URL takeover of
`/api/v1/sound-library/...` and `/restricted/...`. Semantics of record: that
file plus `test_sound_library_api.rb` (translated 1:1 by tasks).

## ADDED Requirements

### Requirement: Sound library reads
`GET /api/v1/sound-library/<name>` SHALL serve the latest non-delete-marker
version of the named object from the sound library bucket with the object's
content type and `Cache-Control: public, max-age=3600, s-maxage=1800`,
answering 404 for empty names and S3 failures, preserving the
development-mode lazy local-bucket population, and writing no session cookies
(the path's CDN behavior is `cookies: 'none'`).

#### Scenario: Cacheable anonymous read
- **WHEN** an anonymous request GETs a sound that exists
- **THEN** the body is served with the 3600-second cache header and no
  `Set-Cookie`

#### Scenario: Deleted sound
- **WHEN** the newest version of the object is a delete marker
- **THEN** the most recent non-deleted version is served

### Requirement: Restricted sound reads
`GET /restricted/<name>` SHALL exist only in development, or in the test
environment under CI (raising outside those environments as the legacy route
does), and SHALL answer 403 unless the request carries a CloudFront
signed-policy cookie (`CloudFront-Policy`, or the emulated variant when S3
emulation is enabled) whose policy has not expired.

#### Scenario: Expired policy cookie
- **WHEN** the signed-policy cookie's `AWS:EpochTime` is in the past
- **THEN** the response is 403
