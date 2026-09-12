# admin-api-gate

## ADDED Requirements

### Requirement: Admin API requests are authenticated and admin-authorized
Every endpoint under /api/admin SHALL require a signed-in user whose
`admin?` flag is true, enforced by inheriting Api::Admin::BaseController
(`authenticate_user!` + `require_admin` + `check_authorization`); no
endpoint can opt out.

#### Scenario: Anonymous request
- **WHEN** a request with no session hits any /api/admin endpoint
- **THEN** the response is 401 with body `{error: "unauthenticated"}`

#### Scenario: Signed-in non-admin
- **WHEN** a teacher or student session hits any /api/admin endpoint
- **THEN** the response is 403 with body `{error: "unauthorized"}` and no
  action logic runs

#### Scenario: Admin
- **WHEN** an admin session hits an /api/admin endpoint
- **THEN** the action executes normally

### Requirement: JSON error envelope
Admin API errors SHALL be rendered as JSON
`{error: <machine-key>, message?: <string>, details?: <object>}` with
conventional status codes (401, 403, 404, 422, 500), never as HTML
redirects or error pages, so @code-dot-org/core kyTransport surfaces them
as ApiError.

#### Scenario: Record not found
- **WHEN** an endpoint looks up a nonexistent record
- **THEN** the response is 404 JSON `{error: "not_found"}` (no HTML 404
  page)

#### Scenario: Validation failure
- **WHEN** an endpoint receives invalid parameters
- **THEN** the response is 422 JSON with `details` carrying per-field
  errors

### Requirement: CSRF protection retained
Mutating admin API requests SHALL be protected by Rails CSRF verification
using the same token mechanism the frontend transport already sends
(X-CSRF-Token header from csrf_meta_tags / GET /get_token).

#### Scenario: Missing CSRF token
- **WHEN** a POST to an /api/admin endpoint omits X-CSRF-Token
- **THEN** the request is rejected and no state changes
