# Spec: teacher-dashboard-homepage-popups

## ADDED Requirements

### Requirement: Drawer-driven popups at parity
The candidate homepage SHALL request drawer data once on load and render the
same popup set legacy does from the response: school-info interstitial,
school-info confirmation dialog, NPS survey, and the AFE/donor banner
(suppressed when previously dismissed; dismissal persists via the legacy
dismiss endpoint). Popup precedence and mutually-exclusive display match
legacy `TeacherHomepagePopups`.

#### Scenario: School-info interstitial
- **WHEN** the drawer response sets `showSchoolInfoInterstitial`
- **THEN** the interstitial renders with existing school info prefilled and
  completing it stores the update through the legacy flow

#### Scenario: NPS shown once
- **WHEN** the drawer response sets `showNps`
- **THEN** the NPS survey container renders; the server-side last-seen
  timestamp side effect has already been applied by the drawer GET, exactly
  as legacy

### Requirement: Section-creation celebration dialog
The candidate homepage SHALL show the celebration dialog when the URL
carries `?showSectionCreationDialog`, matching the legacy
query-param-driven behavior.

#### Scenario: Celebration on arrival from section setup
- **WHEN** a teacher lands on the candidate home route with
  `?showSectionCreationDialog` present
- **THEN** the celebration dialog opens once and does not reopen after
  dismissal on back/forward navigation

### Requirement: Flash toast relay
The candidate homepage SHALL display the flash payload returned by the home
endpoint as a toast with legacy timing (auto-hide after 6 seconds),
preserving the legacy flash-type-to-style mapping.

#### Scenario: Flash after redirect
- **WHEN** a flow lands on the candidate home route with a pending flash
- **THEN** the toast renders the flash message and auto-hides after 6
  seconds

### Requirement: TOS interstitial disposition
The candidate SHALL show the terms-of-service interstitial to teachers who
have not accepted the latest terms, with acceptance recorded via an explicit
user action (dismissal/accept click). The legacy behavior of silently
recording acceptance during page render MUST NOT be reproduced without a
product ruling; the deviation and its rationale are recorded in this change.

#### Scenario: Non-accepted teacher sees interstitial
- **WHEN** a teacher whose `accepted_latest_terms?` is false opens the
  candidate homepage
- **THEN** the interstitial renders above the page content, and acceptance
  is stored only when the teacher acts on it

### Requirement: Admin partial disposition
The candidate homepage SHALL NOT render the legacy admin partial in this
change; the exclusion is recorded, admins otherwise see the standard
candidate homepage, and the legacy page remains the admin-capable surface
until a dedicated disposition.

#### Scenario: Admin user on candidate home
- **WHEN** an admin opens the candidate home route
- **THEN** the homepage renders without the admin block and without errors
