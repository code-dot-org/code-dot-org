# Spec: teacher-dashboard-homepage-page

## ADDED Requirements

### Requirement: Section list and archive toggle at parity
The candidate homepage SHALL render the welcome header (teacher short name,
localized welcome), the teaching/archived segmented toggle, and the section
list filtered by the toggle (`hidden` is the server's word for archived),
with per-card content at parity: section name, avatar (color/emoji), course
content dropdown with jump-to-lesson entries, join link, suggested lesson
link, student count, and the options dropdown whose entries vary by
`login_type` (edit/archive/delete for word/picture/email; sync instead of
add/remove for provider-managed sections).

#### Scenario: Teaching and archived views
- **WHEN** a teacher with both active and archived sections toggles between
  Teaching and Archived
- **THEN** the list shows only matching sections and the toggle emits the
  same analytics event names as legacy

#### Scenario: Zero sections (demo-section experiment off)
- **WHEN** a teacher has no un-archived sections and the demo-section
  experiment is off
- **THEN** the empty homepage renders with its create-section and
  assign-course calls to action, matching the legacy `EmptyHomepage` branch

#### Scenario: PL sections excluded from ordering
- **WHEN** the section list orders sections
- **THEN** ordering honors `section_order` with PL sections excluded from
  the order preference, as legacy does

### Requirement: Section reordering persists (coverage addition)
The candidate homepage SHALL support the legacy section-reordering
affordance in the section list, persisting the new order via
`PUT /user_preference` (`sectionOrderUtils.ts:47-48`) so the order
round-trips into the bootstrap's `section_order` on subsequent loads.
BLOCKED-EVIDENCE (blocking task): pin the exact affordance and payload
from `SectionList.tsx`/`sectionOrderUtils.ts` plus one runtime capture
before building the fixture.

#### Scenario: Reorder round-trip
- **WHEN** a teacher reorders sections on the candidate homepage
- **THEN** the new order persists via `PUT /user_preference` and is
  reflected after reload through the bootstrap's `section_order`

### Requirement: Section lifecycle flows
The candidate homepage SHALL support create (routed to the legacy section
setup flow at its current URL), edit, archive/unarchive, delete (with
confirmation), and archive-all, driving the same legacy mutation endpoints
and updating the list without a full reload. Section cards' navigation
entries (settings, roster, login cards, progress, lesson materials, print
certificates) SHALL resolve through the shell's per-tab map — candidate
routes where migrated, legacy URLs otherwise.

#### Scenario: Archive from options dropdown
- **WHEN** a teacher archives a section from the card options dropdown
- **THEN** the section leaves the Teaching view, appears under Archived, and
  the server `hidden` state is updated via the legacy endpoint

#### Scenario: Delete with confirmation
- **WHEN** a teacher deletes a section and confirms
- **THEN** the section is deleted server-side and the card disappears;
  cancel leaves state unchanged

#### Scenario: Card link to roster
- **WHEN** a teacher clicks Add students / Roster on a card after the
  manage-students change has landed
- **THEN** they land on the candidate roster route for that section;
  before that change lands, the same click goes to the legacy roster URL

### Requirement: Alerts and engagement surfaces
The candidate homepage SHALL render, under the same conditions as legacy:
the personalization alert (shown when teaching-profile persona is unmatched
and not previously dismissed; dismissal persists via user preferences), the
teacher-verification warning (AI chat access disabled AND an assigned
essential-AI dependency), the rebrand banner (DCDO-gated), the LATAM Global
Edition notice, the coteacher invite notification with accept/decline, and
the promotions column. Alert copy matches legacy verbatim, including the
strings that are hardcoded English today.

#### Scenario: Personalization alert lifecycle
- **WHEN** a teacher without a matched persona dismisses the alert
- **THEN** the dismissal persists (no alert on reload) and matches legacy
  preference storage

#### Scenario: Verification alert gating
- **WHEN** `aiChatAccessLevel` is DISABLED and the teacher has an assigned
  essential-AI dependency
- **THEN** the verification warning renders with the legacy support link;
  otherwise it does not render

#### Scenario: Coteacher invite accept
- **WHEN** a pending coteacher invite is accepted
- **THEN** the invited section joins the section list without a page reload

### Requirement: Logo transition honors both gates
The logo morph animation SHALL run only when the home endpoint reports
`logoTransitionEnabled` AND the `hide_codeai_logo_transition` cookie is
absent, targeting Studio's header logo, with no visible logo flash before
the animation mounts.

#### Scenario: Cookie suppresses animation
- **WHEN** the DCDO/brand gate is on but the dismissal cookie is present
- **THEN** no animation runs and the header logo renders normally

### Requirement: Demo-section experience (experiment treatment arm)
The candidate homepage SHALL reproduce the demo-section experiment's
treatment arm: with the experiment on, demo presets are fetched
(`/api/v1/sections/demo/presets`); a zero-section teacher sees the
`DemoSectionCard` in the Teaching view (empty homepage remains in the
Archived view); the create-demo flow (`pickDemoType`,
`CreateDemoSectionPopup`, `/api/v1/sections/demo/create/:type`) works; a
demo section renders its own course-content and options dropdowns; and
staleness check/reset (`check_staleness`, `reset`) behave as legacy. With
the experiment off, none of this surfaces (control-arm scenarios).

#### Scenario: Treatment arm, zero sections
- **WHEN** the demo-section experiment is on and a teacher has no
  un-archived sections
- **THEN** the Teaching view shows the demo section card with its create
  flow, and the Archived view shows the empty homepage

#### Scenario: Demo staleness — corrected, evidence-gated
- **WHEN** implementation reaches the demo flows
- **THEN** the staleness/reset behavior is ported ONLY if the
  BLOCKED-EVIDENCE runtime check finds such UI in the legacy demo card
  (`check_staleness`/`demo/reset` endpoints appear nowhere in `apps/src`;
  the prior inventory claim is unsupported client-side) — otherwise the
  correction is recorded and nothing is invented

### Requirement: Onboarding checklist and tours
The candidate homepage SHALL reproduce the onboarding checklist and its
three tours (create-section, review-syllabus, learn-how-to-evaluate) under
the legacy gates: (ONBOARDING experiment OR DCDO `onboarding-enabled`) AND
a demo section present (`demoSectionDemoType !== null`). Hide/resume
persists via user preferences; tour content and step behavior match
legacy. When either gate is unmet the checklist does not render.

#### Scenario: Checklist under both gates
- **WHEN** the onboarding gate is on and the teacher has a demo section
- **THEN** the checklist renders with the three tours, and hide/resume
  round-trips through user preferences

#### Scenario: Gate unmet
- **WHEN** the onboarding gate is on but no demo section exists (or the
  gate is off)
- **THEN** no checklist renders, matching legacy

### Requirement: Homepage analytics parity
The candidate homepage SHALL emit the same analytics event names as legacy
for: teacher login (session-storage once-per-session), homepage visited,
toggle clicks, and section-lifecycle events, so existing funnels continue
uninterrupted.

#### Scenario: Once-per-session login event
- **WHEN** a teacher lands on the candidate homepage twice in one browser
  session
- **THEN** the login event fires once and the visited event fires each time

### Requirement: Behavior scenario discovery is an implementation gate
Implementation SHALL begin by discovering homepage behavior scenarios from
the legacy oracles — the 26 `teacherHomepageV2` jest files,
`teacher_homepage_v2.feature` (8 Cucumber scenarios incl. the @eyes one),
`demo_section_card.feature`, `teacherSectionsReduxTest.js`, and the
component sources — and expressing each as an MSW scenario or a test.
Every flag gate contributes scenarios for BOTH arms. Discovered scenarios
SHALL be exposed as visible choices in the standalone dev shell.

#### Scenario: Discovery output recorded
- **WHEN** the discovery task completes
- **THEN** the scenario list with evidence and coverage choice is recorded
  in the change's task log, and the dev shell selector offers at minimum:
  sections-with-courses, zero-sections, archived-only,
  coteacher-invite-pending, personalization-alert, verification-alert,
  drawer-popups, demo-section-treatment, demo-section-stale,
  onboarding-checklist, error (bootstrap failure)

### Requirement: Homepage visual parity is pixel-gated
Implementation SHALL capture legacy baselines and candidate checkpoints
through the shell's harness — the homepage is a DSCO/MUI surface, so pixel
parity is part of this migration contract — for: the section list with
populated cards, the empty homepage (teaching and archived), the alerts
region, the promotions region, each section-lifecycle modal, the demo
section card and create-demo popup (treatment arm), and the onboarding
checklist (gates met). Legacy is
captured at `http://localhost-studio.code.org:9000/teacher_dashboard/home`,
candidate at
`http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`,
with serving-checkout validated before capture. Playwright MCP MAY be used
during implementation for capture. Loading skeletons/error states are
permitted deviations only when recorded per scenario and masked.

#### Scenario: Section list pixel diff
- **WHEN** the harness compares the populated section list under the default
  flag state with declared masks (avatars, join codes, names)
- **THEN** the region-scoped diff is within threshold or the run fails with
  the diff image attached
