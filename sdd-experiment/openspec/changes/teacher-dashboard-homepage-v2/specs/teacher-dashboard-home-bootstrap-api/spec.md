# Spec: teacher-dashboard-home-bootstrap-api

## ADDED Requirements

### Requirement: Home scalars endpoint
Rails SHALL expose `GET /api/v1/teacher_dashboard/home`
(`Api::V1::TeacherDashboard::HomeController`) returning the non-section
scalars the legacy HAML page injects: `providers`
(`current_user.providers`), `showAITALessonSummary` and `showAITAPodcasts`
(the two DCDO keys), `hasCompletedPersonalizationQuiz`
(`TeachingProfileData` presence), `logoTransitionEnabled` (brand is CODEAI
and the hide-animation DCDO key is unset), and `flash` (the pending Rails
flash for the session, drained on read). Authorization: signed-in teacher;
401 when signed out.

#### Scenario: Field equivalence with the HAML block
- **WHEN** the endpoint is requested for a seeded user in a given DCDO/brand
  state
- **THEN** each field equals the value the corresponding
  `show.html.haml:23-37` expression produces for the same user and state,
  asserted by Rails tests covering: user with/without providers, with/without
  TeachingProfileData, DCDO flags on/off, brand CODEAI vs not

#### Scenario: Flash drains once
- **WHEN** a request carries a pending flash and the endpoint is called twice
- **THEN** the first response contains the flash payload and the second does
  not, matching the read-once semantics of a legacy page render

### Requirement: Typed wrappers for reused homepage endpoints
The change SHALL consume the page-adjacent legacy endpoints through typed
core wrappers (schema validated against recorded server JSON, MSW handler
each): `GET /teacher_dashboard/get_drawer_data` (its
`update_last_seen_timestamp` GET side effect preserved and documented at the
call site), `GET /teaching_profile_data`,
`GET /dashboardapi/v1/user_product_tours`,
`POST /dashboardapi/v1/users/me/dismiss_donor_teacher_banner`,
`GET /api/v1/sections/:id/suggested_lesson`,
`GET /api/v1/sections/assigned_essential_ai_dependency`, coteacher invite
accept/decline (`/api/v1/section_instructors/:id/{accept,decline}`), and the
section archive/update/delete calls the lifecycle modals issue. No new Rails
endpoints for these; no hand-rolled fetch in the package.

#### Scenario: Drawer contract preserved
- **WHEN** the candidate homepage requests drawer data
- **THEN** the request hits the legacy `get_drawer_data` route unchanged and
  the parsed response drives the same popup decisions
  (`showSchoolInfoInterstitial`, `showSchoolInfoConfirmation`,
  `existingSchoolInfo`, `afeEligible`, `showNps`)

#### Scenario: Recorded-JSON schemata
- **WHEN** a wrapper schema is authored for any reused endpoint
- **THEN** a parser test validates it against JSON recorded from a local
  Rails run, and drops of consumed fields fail loudly
