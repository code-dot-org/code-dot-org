# admin-student-search

## ADDED Requirements

### Requirement: Student and user search via admin API
The system SHALL expose admin-gated GET endpoints that find users by the
same identifier forms the legacy tools accept (user id, email, hashed
email, username), returning JSON result sets with the same fields the
legacy HAML tables display and the same result caps/pagination.

#### Scenario: Search by email
- **WHEN** an admin queries the search endpoint with a known email
- **THEN** the matching user is returned with id, name, user_type, and
  the legacy-parity fields

#### Scenario: No match
- **WHEN** an admin queries with an identifier matching no user
- **THEN** the response is 200 with an empty result set (not 404)

#### Scenario: Parity with legacy
- **WHEN** the same query is run through the API and the legacy
  find_students page
- **THEN** both return the same result set (shared query object)

### Requirement: Search pages in the admin SPA
The admin SPA SHALL provide search pages replacing find_students and
lookup_by_email, linked from the landing page, rendering API results and
error envelopes.

#### Scenario: Admin searches from the SPA
- **WHEN** an admin submits a search on the SPA page
- **THEN** results render client-side from the JSON endpoint with links
  to the user inspectors
