# Tasks: teacher-dashboard-homepage-v2

Depends on teacher-dashboard-shell being implemented (package, sections
bootstrap API, core sections mocks, home route shell, parity harness).

## 1. Home endpoint + reused-endpoint wrappers (Rails + core)

- [ ] 1.1 Record legacy contracts: HAML scalar values for seeded users
      (providers/DCDO/brand/personalization matrix) and JSON from
      `get_drawer_data`, `/teaching_profile_data`, product tours,
      suggested lesson, essential-AI dependency, coteacher invites; commit
      as fixtures
- [ ] 1.2 Add `Api::V1::TeacherDashboard::HomeController` (scalars + flash
      drain) + route; Rails field-equivalence tests against the HAML
      expressions; flash read-once test; 401 signed-out test
- [ ] 1.3 Typed core wrappers + MSW handlers for every reused endpoint in
      the spec (drawer side effect documented at call site); parser tests
      against recorded JSON
- [ ] 1.4 Targeted Rails tests + `./tools/hooks/pre-commit`

## 2. Behavior scenario discovery (gate)

- [ ] 2.1 Walk the oracles: 26 `teacherHomepageV2` jest files,
      `teacher_homepage_v2.feature`, `demo_section_card.feature`,
      `teacherSectionsReduxTest.js`, component sources; record scenario
      list with evidence and coverage choice (fixture/test); both arms of
      every flag gate contribute scenarios
- [ ] 2.2 Build MSW fixtures for discovered scenarios and expose them as
      visible dev-shell choices (floor: sections-with-courses,
      zero-sections, archived-only, coteacher-invite-pending,
      personalization-alert, verification-alert, drawer-popups,
      demo-section-treatment, demo-section-stale, onboarding-checklist,
      error)

## 2b. BLOCKED-EVIDENCE resolution (blocking; from hardening addendum)

- [ ] 2b.1 Capture `GET /dashboardapi/sections` once; confirm no consumed
      field exists only in its shape vs the bootstrap endpoint
- [ ] 2b.2 Pin the section-reorder affordance + `PUT /user_preference`
      payload (`SectionList.tsx`, `sectionOrderUtils.ts`) + one runtime
      capture
- [ ] 2b.3 Runtime-confirm whether any demo staleness/reset UI exists
      (endpoints absent from `apps/src`); record the correction either way
- [ ] 2b.4 Pin the promotions-column breakpoint behavior from
      `teacherHomepage.module.scss` for the responsive gate

## 3. Read-only slice: list, cards, empty states

- [ ] 3.1 Move `teacherHomepageV2/` components into the package (extraction
      with import adaptation, not rewrite); add package-local adapters for
      `@cdo` singletons (locale, UserPreferences, analytics, DCDO,
      experiments, HttpClient→core client); record blocker evidence for
      anything that cannot move verbatim; use `@code-dot-org/markdown`
      where legacy used `SafeMarkdown`
- [ ] 3.2 Replace the redux spine with TanStack Query hooks (sections from
      shell bootstrap; home scalars from new endpoint); wire welcome
      header, toggle, section list/cards, empty states
- [ ] 3.3 Component tests against MSW per discovered read-only scenario;
      vitest-axe per scenario

## 4. Section lifecycle

- [ ] 4.1 Options dropdown + edit/archive/delete/archive-all modals against
      legacy mutation endpoints; Query invalidation re-expressing legacy
      list-update behavior; celebration dialog on
      `?showSectionCreationDialog`
- [ ] 4.2 Card navigation entries resolve through the shell per-tab map
      (candidate vs legacy URL); analytics event-name parity for lifecycle
      events
- [ ] 4.3 Component tests incl. cancel paths and provider-managed
      (sync-instead-of-edit) variants

## 4b. Demo sections + onboarding (both gate arms)

- [ ] 4b.1 Typed wrappers + MSW for `/api/v1/sections/demo/{presets,
      create/:type,check_staleness,reset}` with recorded JSON
- [ ] 4b.2 Port DemoSectionCard, demo course-content/options dropdowns,
      CreateDemoSectionPopup + pickDemoType, staleness/reset flows;
      component tests per treatment-arm scenario
- [ ] 4b.3 Port OnboardingChecklist + the three tours
      (createSectionOnboarding, reviewSyllabusOnboarding,
      learnHowToEvaluateOnboarding hooks) with hide/resume via user
      preferences; tests for gate-met and gate-unmet states

## 5. Engagement surfaces + popups

- [ ] 5.1 Alerts (personalization, verification, rebrand, LATAM GE) with
      dismissal persistence; coteacher invite accept/decline; promotions
- [ ] 5.2 Logo transition against Studio header (DCDO gate from endpoint +
      cookie gate; no first-paint flash)
- [ ] 5.3 Drawer popups (school info interstitial/confirmation, NPS, AFE)
      + flash toast (6s) + TOS interstitial (explicit-accept disposition)
      + admin-partial exclusion recorded
- [ ] 5.4 Component tests for popup precedence, drawer side-effect
      documentation, flash auto-hide

## 6. Visual parity (pixel-gated; DSCO surface)

- [ ] 6.1 Visual parity planning (gate): declare capture regions + masks
      for the named surfaces (section list, empty home teaching/archived,
      alerts region, promotions region, each lifecycle modal)
- [ ] 6.2 Capture legacy baselines and candidate checkpoints via the shell
      harness at `http://localhost-studio.code.org:9000` (serving-checkout
      validated first; Playwright MCP available); wire diff gates
- [ ] 6.3 Record any approved deviations (skeletons/error states) per
      scenario with masked frames

## 7. Verification

- [ ] 7.1 `yarn lint:fix && yarn release:dryrun` (frontend);
      `./tools/hooks/pre-commit` (repo root); targeted jest suite still
      green in legacy `apps/`
- [ ] 7.2 Live check on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`:
      read-only slice, lifecycle flows, alerts, popups, flash, celebration
      param
- [ ] 7.3 Standalone MSW check: all discovered scenarios selectable and
      rendering without Rails
- [ ] 7.4 Port assertions from `teacher_homepage_v2.feature` into candidate
      Playwright specs in `frontend/packages/e2e-tests` (behavior oracle,
      not new expectations)
