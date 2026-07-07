# pegasus-shared-assets-serving

## ADDED Requirements

### Requirement: Shared CSS is served at legacy paths with parity headers
Rails SHALL serve `GET /shared/css/<name>` returning the file from
`shared/css/` when it exists, otherwise the SassC-compiled output of
the matching `shared/css/*.scss`, with `Content-Type: text/css` and
`Cache-Control: public, must-revalidate, max-age=<static_max_age>,
s-maxage=<static_proxy_max_age>` where the values come from DCDO keys
`pegasus_static_max_age`/`pegasus_static_proxy_max_age` with the
legacy defaults (36000/18000; staging default 60, development 0).

#### Scenario: compiled scss served
- **WHEN** `GET /shared/css/hamburger.css` is requested and only `shared/css/hamburger.scss` exists
- **THEN** the response is 200 with the compiled CSS body, `Content-Type: text/css`, and the parity Cache-Control string

#### Scenario: plain file passthrough
- **WHEN** `GET /shared/css/<file>` is requested for a file that exists verbatim under `shared/css/`
- **THEN** the response body is the file's exact bytes

#### Scenario: unknown css 404s
- **WHEN** `GET /shared/css/nonexistent.css` is requested
- **THEN** the response is 404

### Requirement: Shared images are served with legacy manipulation semantics
Rails SHALL serve `GET /shared/images/*` for png/jpeg/jpg/gif with
the legacy `process_image` semantics: `fit-`/`fill-`/`<w>x<h>`
directory-segment resizing clamped to 2880, `_2x` retina up/down
scaling, extension-based format conversion, profile stripping,
unmanipulated-file passthrough, `Last-Modified` with working
conditional GET, and image Cache-Control from
`pegasus_image_max_age`/`pegasus_image_proxy_max_age`.

#### Scenario: fit resize
- **WHEN** `GET /shared/images/gallery/fit-750/artist_gallery_thumbnails.png` is requested (the legacy test case)
- **THEN** the response is 200 with an image no wider/taller than 750 and the parity image Cache-Control string

#### Scenario: conditional GET
- **WHEN** the same image URL is requested with `If-Modified-Since` equal to the returned `Last-Modified`
- **THEN** the response is 304

#### Scenario: unknown image 404s
- **WHEN** `GET /shared/images/does-not-exist.png` is requested
- **THEN** the response is 404

### Requirement: Shared wasm is served at legacy paths
Rails SHALL serve `GET /shared/wasm/*.wasm` from the repo's
`shared/wasm/` directory with `Content-Type: application/wasm` and
static Cache-Control.

#### Scenario: vmsg.wasm
- **WHEN** `GET /shared/wasm/vmsg.wasm` is requested
- **THEN** the response is 200, `Content-Type: application/wasm`, body identical to the file

### Requirement: The SharedResources middleware is gone
The Rack stack SHALL NOT contain `SharedResources`;
`shared/middleware/shared_resources.rb` and `lib/cdo/pegasus/` SHALL
NOT exist; no code SHALL reference `Sass::Plugin`.

#### Scenario: grep gates
- **WHEN** `grep -rn "SharedResources\|Sass::Plugin\|cdo/pegasus" --include=*.rb --exclude-dir=.git lib/ dashboard/ shared/ bin/` runs
- **THEN** it returns no matches (this change's own test files excepted if named otherwise)

#### Scenario: rack stack clean
- **WHEN** `bin/rails runner 'puts Rails.application.config.middleware.map(&:name)'` runs from `dashboard/`
- **THEN** the output does not include `SharedResources`
