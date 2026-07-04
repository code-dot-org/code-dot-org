# Spec delta: teacher-dashboard-home-bootstrap-api (from teacher-dashboard-homepage-v2)

## MODIFIED Requirements

### Requirement: Home scalars endpoint
Rails SHALL expose `GET /api/v1/teacher_dashboard/home`
(`Api::V1::TeacherDashboard::HomeController`) returning the non-section
scalars the legacy HAML page injects: `providers`
(`current_user.providers`), `showAITALessonSummary` and `showAITAPodcasts`
(the two DCDO keys), `hasCompletedPersonalizationQuiz`
(`TeachingProfileData` presence), `logoTransitionEnabled` (brand is CODEAI
and the hide-animation DCDO key is unset), and `flash` (the pending Rails
flash for the session, returned WITHOUT clearing; clearing happens via the
explicit flash-acknowledge endpoint defined by
`teacher-dashboard-api-write-semantics`). Authorization: signed-in teacher;
401 when signed out.

#### Scenario: Field equivalence with the HAML block
- **WHEN** the endpoint is requested for a seeded user in a given DCDO/brand
  state
- **THEN** each field equals the value the corresponding
  `show.html.haml:23-37` expression produces for the same user and state,
  asserted by Rails tests covering: user with/without providers, with/without
  TeachingProfileData, DCDO flags on/off, brand CODEAI vs not

#### Scenario: Flash persists until acknowledged
- **WHEN** a request carries a pending flash and the endpoint is called
  twice with no acknowledge in between
- **THEN** both responses contain the flash payload, and it clears only
  after the acknowledge endpoint is posted
