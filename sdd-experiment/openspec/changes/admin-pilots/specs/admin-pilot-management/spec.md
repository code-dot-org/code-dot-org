# admin-pilot-management

## ADDED Requirements

### Requirement: Pilot CRUD and enrollment via audited admin API
The system SHALL expose admin-gated endpoints to list pilots, create a
pilot, view a pilot's enrolled users, add users by email list (per-email
outcomes), and remove a user; every mutation creates an AdminAuditEvent
with pilot name and affected_user_id where applicable.

#### Scenario: Create and enroll
- **WHEN** an admin creates a pilot and adds two emails, one unknown
- **THEN** the pilot exists, the known teacher is enrolled, the response
  reports per-email outcomes, and audit rows exist for the creation and
  the successful enrollment

#### Scenario: Remove user
- **WHEN** an admin removes an enrolled user
- **THEN** the enrollment is gone and the removal is audited

### Requirement: Pilots pages in the admin SPA
The admin SPA SHALL provide pilots list and detail pages replacing the
legacy index/show/enrollment forms, reusing the shared per-email outcome
rendering.

#### Scenario: Enrollment from the SPA
- **WHEN** an admin pastes an email list into the pilot detail page
- **THEN** per-email outcomes render from the API response
