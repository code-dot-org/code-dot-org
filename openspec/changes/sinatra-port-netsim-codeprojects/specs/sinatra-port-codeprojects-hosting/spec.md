# sinatra-port-codeprojects-hosting

Published WebLab1 site serving on codeprojects.org, from the
host-conditioned routes in `dashboard/legacy/middleware/files_api.rb`
(`code_projects_domain` Sinatra condition → Rails routes `constraints`).
Semantics of record: `files_api.rb` and the codeprojects cases in the legacy
FilesApi tests.

## ADDED Requirements

### Requirement: Host-constrained routes
The codeprojects routes SHALL match only when the request host is the
canonical codeprojects.org hostname (routes `constraints` lambda on
`CDO.canonical_hostname('codeprojects.org')`), SHALL support only the
`weblab` project type (404 otherwise), and SHALL fall through to normal
routing for path segments that are not valid encrypted channel ids
(preserving Sinatra `pass` semantics).

#### Scenario: Same path on studio host
- **WHEN** `GET /projects/weblab/<ch>/index.html` arrives with a
  studio.code.org host
- **THEN** the codeprojects routes do not match

#### Scenario: Non-channel segment falls through
- **WHEN** `GET /<not-a-channel-id>/` arrives on the codeprojects host
- **THEN** the request falls through to other routes rather than 404ing in
  the codeprojects controller

### Requirement: Published site serving
File serving SHALL port `get_file`'s codeprojects mode: redirects from
`/projects/weblab/<ch>` to the trailing-slash form and from the legacy
root-channel form `/<ch>/` to `/projects/weblab/<ch>/`; `index.html` served
for the directory form; visibility gated by `codeprojects_can_view?` (project
exists and is active, owner's sharing not disabled — else 404); HTML
responses served inline (no attachment disposition) with the footer
script/CSS injection prepended and
`Content-Security-Policy: connect-src 'self'`.

#### Scenario: Published site loads
- **WHEN** an anonymous request GETs `/projects/weblab/<ch>/` for a shareable
  project
- **THEN** index.html is served inline with the footer injection and the CSP
  header

#### Scenario: Owner sharing disabled
- **WHEN** the project owner's `sharing_disabled` property is set
- **THEN** the response is 404
