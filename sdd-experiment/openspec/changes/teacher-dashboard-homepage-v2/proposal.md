# Proposal: teacher-dashboard-homepage-v2

## Why

Teacher Homepage V2 (`apps/src/templates/studioHomepages/teacherHomepageV2/`,
served at `/teacher_dashboard/home`) is the highest-traffic teacher surface
and the natural first tab to land in the candidate shell: it is already
written in TypeScript on DSCO/MUI components, so it ports rather than
rewrites, and it exercises the full bootstrap path (section list, user
scalars, engagement surfaces) that later tabs reuse. It cannot migrate
standalone: its server data arrives only via HAML `data-dashboard` injection
(`show.html.haml:23-41`) plus a set of page-adjacent endpoints
(`get_drawer_data`, `/teaching_profile_data`, product tours, coteacher
invites), and the candidate must not depend on Rails SSR script injection.

Depends on `teacher-dashboard-shell` (package, bootstrap sections API, core
sections mocks, route tree, visual-parity harness).

## What Changes

- The candidate route
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
  renders the migrated Teacher Homepage V2 inside the shell: welcome header,
  teaching/archived toggle, section list with cards (course-content dropdown,
  join link, suggested lesson, options dropdown), empty-state homepage,
  create/edit/archive/delete/archive-all flows, alerts (personalization,
  teacher-verification, rebrand banner, LATAM GE notice), coteacher invite
  accept/decline, promotions, logo transition, and the popup set (school-info
  interstitial/confirmation, NPS, AFE banner, section-creation celebration).
- New Rails endpoint `Api::V1::TeacherDashboard::HomeController` returning
  the non-section HAML scalars the legacy page receives (`providers`, the two
  AITA DCDO flags, `hasCompletedPersonalizationQuiz`, `logoTransitionEnabled`,
  flash payload), with field-equivalence tests against the HAML `:ruby`
  block. Sections themselves come from the shell's bootstrap endpoint.
- Existing page-adjacent endpoints are reused as-is through typed core
  wrappers + MSW handlers: `get_drawer_data` (GET side effect preserved),
  `/teaching_profile_data`, `/dashboardapi/v1/user_product_tours`,
  `dismiss_donor_teacher_banner`, suggested lesson, coteacher invite
  accept/decline, section mutations (archive/delete).
- Homepage-scoped MSW scenarios in the package dev shell, exposed as visible
  scenario choices.
- Visual parity baselines/checkpoints for the homepage (a DSCO/MUI surface —
  pixel parity is part of this migration contract), via the shell's harness.
- Legacy `/teacher_dashboard/home` remains untouched.
- Full-fidelity flag coverage: BOTH arms of every homepage gate are parity
  targets, each pinned per scenario. That includes the demo-section
  experiment treatment arm (`DemoSectionCard`, demo course-content and
  options dropdowns, `CreateDemoSectionPopup`/`pickDemoType`,
  presets/create/staleness/reset via `/api/v1/sections/demo/*`) and the
  onboarding checklist + three tours (create-section, review-syllabus,
  learn-how-to-evaluate; gated on ONBOARDING experiment or DCDO
  `onboarding-enabled` and requiring a demo section —
  `TeacherHomepage.tsx` gates `OnboardingChecklist` on
  `demoSectionDemoType !== null`; hide/resume persists via
  UserPreferences). Skills dashboard and student snapshot are separate
  tabs, ported in their own sequenced changes.

## Capabilities

### New Capabilities

- `teacher-dashboard-home-bootstrap-api`: the `Api::V1::TeacherDashboard::*`
  home endpoint for HAML-only scalars, with field-equivalence tests, plus
  typed reuse wrappers for the page-adjacent legacy endpoints.
- `teacher-dashboard-homepage-page`: the migrated homepage UI — header,
  toggle, section list/cards/empty states, section lifecycle modals, alerts,
  coteacher invite, promotions, logo transition, demo-section experience
  (both experiment arms), onboarding checklist + tours (both gate arms).
- `teacher-dashboard-homepage-popups`: drawer-driven popups (school info,
  NPS, AFE), section-creation celebration, flash toast relay, and the
  explicit dispositions for the HAML-level TOS interstitial and admin
  partial.

### Modified Capabilities

- `teacher-dashboard-shell-navigation`: the shell's `home` route stops being
  a placeholder and mounts the homepage page component; the redirect map
  entry for `home` flips from legacy to candidate.

## Impact

- `frontend/packages/teacher-dashboard/` (homepage feature area),
  `frontend/packages/core` (typed wrappers + MSW for reused endpoints),
  `frontend/apps/studio` (home route content), `frontend/packages/e2e-tests`
  (homepage parity specs).
- `dashboard/app/controllers/api/v1/teacher_dashboard/` (home controller),
  `dashboard/config/routes.rb`, Rails tests.
- Uses `@code-dot-org/markdown` wherever legacy used `SafeMarkdown`.
- No legacy `apps/src` or HAML changes; production exposure none
  (`FrontendStudioController` 404s in production).
