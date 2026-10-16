# Spec: teacher-dashboard-shell-navigation

## ADDED Requirements

### Requirement: Candidate route tree with legacy-equivalent paths
Studio SHALL serve, under `/frontend-studio/teacher_dashboard/`, the routes
`home` and `sections/:sectionId/<tab>` using the exact legacy path segments
(underscores preserved: `login_info`, `text_responses`, `ai_chat_settings`,
`manage_students`, etc. per `TeacherNavigationPaths.tsx`). In this change the
shell owns `home` (placeholder content area until homepage v2 lands) and the
section-scoped chrome; every tab's content area is either a migrated feature
(later changes) or a full-page link to the legacy URL.

#### Scenario: Deep link resolves
- **WHEN** a signed-in teacher opens
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/<id>/roster`
- **THEN** the candidate shell renders the sidebar with `roster` active and
  the tab-content region for that route (roster content itself arrives with
  the manage-students change)

#### Scenario: Legacy routes untouched
- **WHEN** a teacher opens `/teacher_dashboard/home` or
  `/teacher_dashboard/sections/:id/*`
- **THEN** the legacy page renders exactly as before this change

### Requirement: Redirect parity
The candidate router SHALL reproduce legacy redirect behavior: bare
`/sections/:sectionId` and any unknown `/sections/:sectionId/*` path redirect
(replace, not push) to `progress`; `manage_students` redirects (replace) to
`roster`. While a redirect target is not yet a migrated tab, the redirect map
SHALL resolve it to the corresponding legacy URL; the map is per-tab data so
later changes flip individual entries to candidate routes.

#### Scenario: Bare section path
- **WHEN** a teacher opens
  `/frontend-studio/teacher_dashboard/sections/<id>`
- **THEN** they land on the progress destination for that section without a
  history entry for the bare path

#### Scenario: Legacy bookmark alias
- **WHEN** a teacher opens
  `/frontend-studio/teacher_dashboard/sections/<id>/manage_students`
- **THEN** they land on `.../sections/<id>/roster` via a replace navigation

### Requirement: Sidebar navigation chrome
The shell SHALL render the section-scoped sidebar equivalent to
`TeacherNavigationBar`: section dropdown (switching sections rewrites
`:sectionId` and preserves the active tab), grouped tab links with icons and
localized labels, and every conditional entry reproduced per flag state
with BOTH arms as parity targets: the skills-dashboard entry when DCDO
`skills-dashboard` is on, the student-snapshot entry when experiment
`student-snapshot` is on, MODULARITY swapping which unit-overview key the
course-content group links to, and the AI-differentiation FAB entry point
when its experiment and `aiDifferentiationEnabled` are both set. Every
scenario pins its flag state. Unmigrated tabs render as links to their
legacy URLs (full page navigation is acceptable and expected).

#### Scenario: Section switch preserves tab
- **WHEN** a teacher on candidate `roster` for section A picks section B in
  the sidebar dropdown
- **THEN** the URL becomes `.../sections/<B>/roster` and section B's data
  loads

#### Scenario: Unmigrated tab exits to legacy
- **WHEN** a teacher clicks an unmigrated tab (e.g. Progress) in the
  candidate sidebar
- **THEN** the browser navigates to
  `/teacher_dashboard/sections/<id>/progress` (legacy), which renders
  normally

#### Scenario: Flag-gated entries appear with their flags
- **WHEN** the `skills-dashboard` DCDO key (or the `student-snapshot`
  experiment) is enabled in a scenario
- **THEN** the corresponding sidebar entry and route exist exactly as in
  legacy, and are absent when the flag is off

### Requirement: Section selection and reload semantics
The shell SHALL default-select the first section (by `section_order` when
present, else server order) when the path carries no `:sectionId` (the `home`
case), and SHALL re-fetch the selected section when returning to a
section-scoped route after a mutation elsewhere invalidated it — the
TanStack Query re-expression of legacy `needsReload` +
`asyncLoadSelectedSection`. Section-scoped tab content renders only when a
selected section exists (legacy `PageLayout` gate).

#### Scenario: Stale section refreshed on navigation
- **WHEN** a mutation (e.g. section rename, once such features migrate) marks
  section queries stale and the teacher navigates between tabs
- **THEN** the selected-section query re-fetches once and the chrome shows
  fresh data, matching legacy `needsReload` semantics

#### Scenario: First-section default
- **WHEN** a teacher with sections opens the candidate `home` route
- **THEN** the shell's selected-section state is the first section per
  `section_order`-respecting ordering, matching `show.js` behavior

### Requirement: Auth gating with legacy redirect quirks
Candidate routes SHALL gate on the Studio auth bootstrap: signed-out users
requesting `home` are redirected to `/users/sign_in`; signed-in users who are
not instructors of the section in the URL are redirected to the legacy
fallback destination (`/home`), mirroring the legacy CanCan rescue. The
`params[:path]` `courses`/`unit`→`s` rewrite branches are explicitly out of
scope here and move with the course/unit overview tab; this disposition is
recorded so it is not lost.

#### Scenario: Signed-out deep link
- **WHEN** a signed-out visitor opens any candidate teacher-dashboard route
- **THEN** they are redirected to sign-in, matching the legacy `home` branch

#### Scenario: Non-instructor section access
- **WHEN** a signed-in teacher opens a candidate section route for a section
  they do not instruct
- **THEN** they are redirected away (legacy fallback `/home`) and no section
  data for that section is fetched or rendered

### Requirement: Behavior scenario discovery is an implementation gate
Implementation SHALL begin by discovering and recording the shell's behavior
scenarios from the legacy sources of truth — `TeacherNavigationRouter.tsx`,
`TeacherNavigationBar` tests (`apps/test/unit/teacherNavigation/`), the
Cucumber features `teacher_dashboard_local_nav_v2*.feature` and
`view_other_teacher_dashboard_pages.feature`, and the reducer semantics in
`teacherSectionsReduxTest.js` — and expressing each as an MSW scenario,
a component/e2e test, or a documented exclusion. The discovered list is the
checklist; the scenarios named in this spec are the floor, not the ceiling.

#### Scenario: Discovery output recorded
- **WHEN** the discovery task completes
- **THEN** the change's tasks/PR record the scenario list with, for each:
  source evidence (file or feature), the chosen coverage (fixture/test), or
  the exclusion rationale
