# Appendix 01 — Planning: pilot-teacher-dashboard-home

Full recon detail and traceability behind memo-01. Absolute paths under the
worktree `/var/home/sliang/git-workspaces/code-dot-org-full/.claude/worktrees/teacher-fable/`.

## Recon findings

### 1. Legacy teacher dashboard home

- Route: `dashboard/config/routes.rb:45-46` — `/teacher_dashboard/home` →
  `TeacherDashboardController#show`
  (`dashboard/app/controllers/teacher_dashboard_controller.rb`, action `show`,
  lines 21-37; redirects to `/users/sign_in` on `CanCan::AccessDenied` for a
  `home` path).
- View mounts React into `#teacher-dashboard`
  (`dashboard/app/views/teacher_dashboard/show.html.haml`), injecting
  `teacher_dashboard_data` (sections from `@sections =
  current_user.sections_instructed…map(&:concise_summarize)`) via a
  `data-dashboard` attribute.
- React entry: `apps/src/sites/studio/pages/teacher_dashboard/show.js` — dispatches
  `setSections(...)` then branches: zero sections + no `demo-section` experiment →
  `TeacherHomepage`; else `TeacherNavigationRouter` whose `home` route also
  renders `TeacherHomepage`.
- Top-level home: `apps/src/templates/studioHomepages/teacherHomepageV2/TeacherHomepage.tsx`
  (lines 342-362 decide empty vs list).
  - Empty state: `.../teacherHomepageV2/EmptyHomepage.tsx` → shared
    `apps/src/templates/teacherNavigation/EmptyState.tsx` (headline, description,
    `images/no_sections.png`).
  - List: `.../teacherHomepageV2/SectionList.tsx` → `SectionCard.tsx` /
    `SectionCardBody.tsx` / `CourseContentDropdown.tsx`.
- Region selectors: `<ol id="ui-test-section-list">` (SectionList.tsx:164) is the
  tightest bound; `#teacher-home-header` (title/toggle/create button);
  `#ui-test-teacher-promotions` (promotions column — exclude); `#teacher-dashboard`
  (outer mount). Card title node `id="section-card-title-{id}"`.
- Consumed section fields: SectionCard — `id, name, hidden, demoType,
  avatar_color, avatar_emoji, loginType, code`; SectionCardBody — `courseId,
  unitId, studentCount`; CourseContentDropdown — `courseDisplayName, unitId,
  courseVersionName`. Filtering by `participantType`/`hidden`.
- Volatile UI to disable/mask: LogoTransition (cookie
  `hide_codeai_logo_transition` / `prefers-reduced-motion`); TeacherHomepagePopups
  (school-info, AFE donor, NPS drawers); AiDiffFloatingActionButton; AI
  verification alert; personalization-quiz banner; TeacherPromotions +
  PermanentPromotions; TempRebrandBanner; OnboardingChecklist + tours;
  CoteacherInviteNotification; LatamGeRegionNotice; DemoSectionCard/DemoChip;
  card loading spinner (`asyncLoadComplete`); drag transforms; Noto Color Emoji
  webfont.

### 2. GET /api/v1/sections

- Controller `dashboard/app/controllers/api/v1/sections_controller.rb:21-26`:
  `current_user.sections_instructed.map(&:summarize_without_students)`.
- Auth: `dashboard/app/models/ability.rb:177` `can :index, Section` gated by
  `if user.persisted?`; JSON path has no `authenticate_user!`; base
  `json_api_controller.rb` rescues `CanCan::AccessDenied` → `head :forbidden`.
- Serialization: `dashboard/app/models/sections/section.rb` —
  `summarize_without_students` (531-533), `summarize` (633-717),
  `summarize_for_participant` (720-765). Full field table in
  api-contract-matrix.md.
- Edges: signed-out → 403 empty; student/empty teacher → `200 []`; teacher with
  sections → `200 [ … ]`. Bare array, no envelope.
- Legacy uses `concise_summarize` (server injection) not this API — divergence
  documented in api-contract-matrix.md. Existing core `ConciseSectionSchema`
  models `concise_summarize`, NOT `summarize`; must not be reused.

### 3. Frontend architecture

- Studio: `frontend/apps/studio` (Vite + React 19 + TanStack Router). Routes under
  `src/routes/`; file path = URL path; `createFileRoute('<canonical>')`. Generated
  `src/routeTree.gen.ts` (committed, `@ts-nocheck`, do-not-edit). Router
  instantiated with `basepath: '/frontend-studio'`
  (`src/modules/router/index.ts`). Lazy consumption:
  `React.lazy(() => import('@code-dot-org/<pkg>'))` (see
  `src/modules/labs/router/getLabEntrypoint.ts`).
- Rails mount: `dashboard/config/routes.rb:10` `get "frontend-studio(/*path)"` →
  `FrontendStudioController#index` (404 in production);
  view `dashboard/app/views/frontend_studio/index.html.haml` emits the Vite tags
  + `#vite-root`; `app-config` meta via `observability_helper.rb`. SiteConfig
  reads it (`frontend/packages/core/src/config/SiteConfig.ts`); use SiteConfig,
  never `import.meta.env`.
- Package consumption: workspace dep in `frontend/apps/studio/package.json`;
  `@code-dot-org/users` is the canonical library shape (private, exports `.` →
  dist, react in peer+dev). Labs (music/oceans) are the working lazy-consumption
  examples.
- DashboardApiClient: `frontend/packages/core/src/api/` (subpath
  `@code-dot-org/core/api`); singleton `SingletonDashboardApiClient.ts`; domains
  incl. `sections`. Domain trio: `<d>.schemata.ts` (zod) / `<d>.api.ts`
  (parse-at-boundary) / `<d>.types.ts` (+ `.keys.ts`/`.query.ts`, `__tests__`).
  Wire snake_case → camelCased via schema transform. Example real call:
  `DashboardApiClient.users.getCurrent()`.
- Existing sections domain (`.../dashboard/sections/`): methods `getSection`,
  `getValidCourseOfferings`, `getAvailableParticipantTypes` — NO list method.
  `SectionSchema = ConciseSectionSchema ∩ SelectedSectionSchema` (models
  concise/selected shapes; both camelCase-transform).
- MSW: `frontend/packages/core/src/api/mocks/` (MSW v2, `http`/`HttpResponse`);
  `getMockHandlers()` aggregates per-domain arrays; worker (browser) + server
  (vitest). Gated on `VITE_API_MODE === 'msw'`. Studio boots it in
  `src/modules/mocks/enableMocks.ts`. Labs ship `src/fixtures/`.

### 4. Package generator

- `frontend/turbo/generators/config.ts`, `package` generator: prompts `name`
  (kebab, no `@`, `/^[a-z][a-z0-9-]*$/`) + `description`. Emits 10 files
  (`package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
  `.lintstagedrc.mjs`, `vitest.config.ts`, `src/index.ts`,
  `src/__tests__/index.test.ts`, `.gitignore`, `README.md`), modifies
  `frontend/apps/studio/package.json` to add the workspace dep, then runs
  `yarn install`, `yarn lint:fix`, `yarn release:dryrun`. package.json template:
  `private:true`, version `0.0.0`, exports `.` → dist, react in peer+dev, no
  `dependencies`, no `"type":"module"`. Default `vitest.config.ts` is bare
  (`globals:true`) — React packages must extend
  `@code-dot-org/lint-config/vitest/react.mjs` (per
  `frontend/docs/conventions/packages.md`).

### 5. Deterministic test setup

- `frontend/packages/e2e-tests/tests/fixtures.ts`: `signInAsNewUser(options)` =
  `resetSession` (clearCookies) + `goto('/')` + `createUser`. `createUser`
  (`tests/shared/auth.ts`): `POST /api/test/create_user` `{user:{…}}` (teacher
  age `21+`), optional `POST /users/sign_in`; transport via
  `requestWithCsrf` (`tests/shared/api.ts`, reload after sign-in for CSRF).
- Section creation: `POST /dashboardapi/sections`
  `{login_type:'email', participant_type:'student'}` (bare, returns `code`); or
  `/api/test/*` (test-only, `test_controller.rb`) incl.
  `create_student_section_assigned_to_course_and_unit`
  `{course_name, unit_position}` (returns `section_code`) and
  `assign_section_to_course_and_unit`. Join: `POST /join/:code`.
- No existing helper builds a teacher with N assigned sections; only
  `createTeacherAssociatedStudent` (one unassigned section + one student). A thin
  wrapper would compose existing endpoints — no new behavior.
- `ui-test-single-unit-course-2026`: course config at
  `dashboard/test/ui/config/courses/ui-test-single-unit-course-2026.course`
  (script `ui-test-single-unit-2026`, `stable`, student audience); script_json at
  `dashboard/test/ui/config/scripts_json/ui-test-single-unit-2026.script_json`;
  title "Single-Unit Course 2026"
  (`dashboard/config/locales/courses/en.yml:1456`). unit_position 1 → the single
  script. Referenced by several Cucumber features
  (`teacher_homepage_v2.feature`, `teacher_dashboard_local_nav_v2_eyes.feature`,
  etc.); no Playwright spec yet.

### 6. Visual tooling

- `@code-dot-org/playwright-support` (visual helpers `createVisualTest`,
  `visualProjects`, `prove-visual`) is NOT on this branch — on
  `stephen/codegen-visual-infra` / `stephen/markdown-visual-e2e`. Current
  `frontend/packages/e2e-tests` does no screenshot assertions (only `settle()` in
  `tests/shared/stability.ts`: `document.fonts.ready` + double-rAF).
- Design: provider-agnostic `visualCheck(name, {mask?})`; `VISUAL_PROVIDER`
  selects native Playwright (`toHaveScreenshot`, `animations:'disabled'`,
  `fullPage:true`, throws in CI) vs Applitools Eyes (CI source of truth, no
  committed baselines). Only per-call knob is `mask` — no clip/threshold; region
  scoping = isolate-then-full-page-capture + mask (markdown/oceans pattern).
  Consumer config default `expect.toHaveScreenshot = {animations:'disabled',
  maxDiffPixelRatio:0.01}`; `snapshotPathTemplate` under `e2e/tmp/baselines`
  (gitignored, ephemeral). Visual configs default `TARGET_URL ??
  'http://localhost:5173'` with a `yarn dev` webServer; e2e-tests default
  `TARGET_URL ?? 'https://test-studio.code.org'`.

## Decisions and rationale

See design.md D1-D7 and visual-artifacts.md. Key calls: library package (not
lab); Studio owns route+lazy only; new `SectionSummarySchema` for the API
`summarize` shape (not `ConciseSectionSchema`); MSW-fed standalone shell as the
deterministic visual target; strict visual gate = candidate self-consistency,
legacy parity advisory (cross-stack pixel diff rejected as non-meaningful);
opsx:apply cwd = `sdd-experiment/`.

## Traceability

| Scenario | Spec requirement (specs/teacher-dashboard-home/spec.md) | Tasks | API | Visual/a11y |
|---|---|---|---|---|
| TD-HOME-EMPTY | "Empty home region…" + "Sections read through DashboardApiClient" + "Candidate route mounts…" | 1,2,3,5,6,7 | GET /api/v1/sections → `[]` | REQUIRED both |
| TD-HOME-SECTION-LIST | "Populated home region…" + "Sections read through DashboardApiClient" + "Candidate route mounts…" | 1,2,4,5,6,7 | GET /api/v1/sections → 2 summaries | REQUIRED both |

## Commands run / verification

- `/usage` parsed (row appended to usage-checkpoints.md).
- Recon reads only; no writes outside the change dir; generator NOT run;
  package NOT created; nothing implemented.
- OpenSpec validation result recorded below.
- Could NOT verify without UI/secrets/full run: live `GET /api/v1/sections`
  response against a running Rails server (documented from source); the visual
  gate (infra off-branch); the live fixture recipe on test-studio.

## OpenSpec validation

`openspec validate pilot-teacher-dashboard-home --strict` (cwd `sdd-experiment/`,
openspec v1.3.1) → "Change 'pilot-teacher-dashboard-home' is valid". Schema
`spec-driven`; four ADDED requirements, each with a `#### Scenario` block; four
delta requirements parsed. Note: the validator reads only the FIRST line of a
requirement body as its text and requires SHALL/MUST there — the route
requirement was reworded so its first line carries SHALL.

## Open questions / assumptions

Listed in memo-01 Ask plus: assumed the pilot renders the "teaching" (non-hidden)
sections only (archived out of scope); assumed avatar rendering (color/emoji) is
in-scope as a read-only label; assumed no course-content dropdown interactivity
(read-only course name only).
