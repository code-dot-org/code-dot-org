# Design: teacher-dashboard-shell

## Context

Legacy boot path: Rails `TeacherDashboardController#show` renders
`show.html.haml`, which serializes `concise_summarize[]` + `sectionOrder` +
selected-section summary + user scalars into a `data-dashboard` attribute;
`apps/src/sites/studio/pages/teacher_dashboard/show.js` parses it, registers
14 reducers, dispatches `setSections`/`selectSection`, and mounts either
`TeacherHomepage` (zero sections, demo-section experiment off) or
`TeacherNavigationRouter` (react-router v6, basename derived from
`/teacher_dashboard`). Sidebar, redirects, and per-tab empty-state gating live
in `TeacherNavigationRouter.tsx` / `TeacherNavigationBar.tsx` /
`TeacherNavigationPaths.tsx`.

Candidate host: `frontend/apps/studio`, a Vite + TanStack Router app served
at `/frontend-studio/` by Rails route `get "frontend-studio(/*path)"`
(404s in production). Root route already provides header, footer, CdoTheme,
and an auth bootstrap (`fetchAuthOutcome` in `beforeLoad`, primed into the
TanStack Query cache).

Constraints, from the program rules:

- Legacy `/teacher_dashboard/*` stays stable; the HAML `data-dashboard`
  contract remains the source of truth for field equivalence, but the
  candidate must not depend on Rails SSR script injection.
- Normal frontend package path: `yarn turbo gen package`, then adapt to the
  app-shaped pattern (`frontend/docs/conventions/packages.md`,
  `packages/users/README.md`).
- Both standalone MSW mode and live local/test integration mode must work.
- New data endpoints are Rails-way `Api::V1::TeacherDashboard::*` with
  field-equivalence tests.
- Design system: DSCO first, MUI for the migrated components (Typography,
  Button, IconButton, Breadcrumbs), SCSS modules, semantic color tokens.

## Goals / Non-Goals

**Goals:**

- A running candidate shell at
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
  and `/frontend-studio/teacher_dashboard/sections/:sectionId/*` that loads
  real section data from a new API, renders the sidebar chrome, and links
  every unmigrated tab back to its legacy route.
- The four pieces of reusable infrastructure every later feature stands on:
  package + dev shell, bootstrap API, core sections mocks, visual-parity
  harness.
- Deep-link, redirect, selection, and reload behavior equivalent to legacy.

**Non-Goals:**

- No tab content. Homepage v2 and roster are separate changes; the other
  tabs stay legacy and are reached by full-page links.
- No production cutover (human decision; `FrontendStudioController` 404s in
  production regardless).
- No edits to the three `section.rb` summarizers, legacy entry points, HAML,
  or `TeacherDashboardController`.
- No port of `teacherSectionsRedux`; state-layer semantics are re-expressed,
  not copied (see Decisions).
- Excluded surfaces per program scope: skills dashboard (`skills_in_dev`),
  student snapshot, demo-section experiment treatment arm.

## Decisions

### D1. State layer: TanStack Query + local component state; no Redux port

The legacy store registers 14 reducers at boot; the shell itself consumes
only `teacherSections` (sections list, selected id, `needsReload`). The
candidate uses TanStack Query for server state (`sections list` and
`selected section` queries) and React state/URL params for UI state.
Alternative — porting `teacherSectionsRedux` — rejected: it drags the other
13 reducers' import graph along, and its semantics (e.g. `needsReload`) are
reproducible as cache invalidation. Reducer behaviors that matter are
captured as behavior scenarios (see specs) sourced from
`apps/test/unit/.../teacherSectionsReduxTest.js`.

### D2. Bootstrap API shape mirrors the HAML contract, not `/api/v1/sections`

`GET /api/v1/teacher_dashboard/sections` returns
`{sections: concise_summarize[], section_order}`. Field-for-field equivalence
with `@sections` / `@section_order` in `TeacherDashboardController#show` is
asserted by Rails tests that diff the endpoint JSON against
`Section#concise_summarize` output for the same fixtures (including
`sectionInstructors`, `sync_enabled`, `post_milestone_disabled`, age-gating
fields, `demo_type`, `studentCount`). Alternative — reusing
`/api/v1/sections#index` — rejected: it returns
`summarize_without_students`, a heavier shape with different field names;
silent field drops here are wrong roster counts and missing sync buttons in
live classrooms. Authorization: same gate as the page it mirrors —
signed-in user; sections scoped to `current_user.sections_instructed`
(instructor membership including accepted co-teachers). The user scalars the
shell needs (`currentUserId`, `userName`, locale) come from the existing
core `users.getCurrent` bootstrap; `studioUrlPrefix` from `SiteConfig`.
Homepage-only scalars (providers, DCDO flags, personalization, flash,
`logoTransitionEnabled`) are deliberately NOT in this endpoint; they belong
to the homepage change's companion endpoint.

### D3. Selected-section reload reuses `GET /dashboardapi/section/:id`

Already wrapped by `core/src/api/dashboard/sections/` (`getSection`,
`SectionSchema = intersection(Selected, Concise)`). Caveat carried from the
program's API catalog: server merge is `selected.merge(concise)` while the
legacy client bootstrap spreads `{...concise, ...selected}` — the field
union is identical but precedence differs on overlap; implementation must
record real server JSON and validate the Zod schema against it before
trusting the existing schemata (they predate this program).

### D4. Route tree lives in Studio; the package exports the pages

Following the users-package pattern: `@code-dot-org/teacher-dashboard`
exports shell components (navigation chrome, tab-frame layout); Studio
declares file-based routes `src/routes/teacher_dashboard/home.tsx` and
`src/routes/teacher_dashboard/sections/$sectionId/...` that lazy-load them.
Underscore path segments are kept verbatim (`teacher_dashboard`,
`login_info`, `text_responses`, `manage_students`) — deep-link parity wins
over TanStack naming aesthetics. Redirect parity implemented in route
`beforeLoad`/`loader`: bare `/sections/:id` and unknown `*` → `progress`
(replace), `manage_students` → `roster` (replace). In this change `progress`
is not yet migrated, so the shell's redirect targets resolve to legacy
URLs — the redirect map is data, not hardcoded per-tab logic: each tab key
maps to `{candidate route}` or `{legacy URL}`, so later changes flip one
entry.

### D5. AccessDenied behavior is split client/server

Server: the new endpoint returns 401 (signed out) / 403 or scoped-empty
per CanCan, never leaking other teachers' sections. Client: route guards
reproduce the legacy redirect quirks for shell-owned routes — signed-out on
`home` → `/users/sign_in`; section not instructed → legacy `/home`
equivalent. The two legacy `params[:path]` rewrite branches (`courses`,
`unit`→`s`) belong to tabs the shell does not own yet; their parity moves
with those tabs' changes. Recorded so nothing silently drops.

### D6. Visual-parity harness compares same-Rails, same-browser captures

New helper in `frontend/packages/e2e-tests`: one Playwright test navigates
legacy (`/teacher_dashboard/...`) and candidate
(`/frontend-studio/teacher_dashboard/...`) on the same local Rails
(`http://localhost-studio.code.org:9000`), captures region-scoped
screenshots (the migrated chrome region only), masks dynamic areas
(avatars, dates, join codes), and pixel-compares. Shell chrome qualifies
for pixel parity: `TeacherNavigationBar`/homepage chrome are already
DSCO/MUI-based (`fontAwesomeV6Icon`, `dropdown`, `alert`, MUI Typography).
Before any capture, verify the serving checkout: the Rails and apps dev
server process cwd must point at this worktree. Playwright MCP is available
to implementers for capture work; it is not used during planning.

### D7. Standalone MSW dev shell exposes scenarios as visible choices

Package dev server (`yarn dev` from the package) mounts the shell against
MSW with a corner scenario selector (users-package `?scenario=` +
`?devChrome=off` conventions). Scenario fixtures are the behavior-scenario
axes discovered from legacy code, at minimum: `many-sections` (default),
`zero-sections`, `archived-only`, `coteacher-invite-pending`,
`provider-managed` (Clever/Google), `error` (bootstrap 500). Fixtures
register via core's `registerMockFixture`; write-through for mutations.

## Risks / Trade-offs

- [Bootstrap/API drift between `concise_summarize` and the endpoint] →
  Rails field-equivalence tests diffing against the model method itself;
  Zod parse failures are loud in the client.
- [Global stylesheet loss: legacy pulls `css/scripts.css` + `css/courses.css`
  page-wide; candidate runs Vite + CdoTheme] → pixel gate scoped to the
  migrated region; fonts pinned via `@code-dot-org/fonts`; expect real
  stabilization time here — time-boxed, with documented deferral rather than
  open-ended tuning.
- [Auth mismatch: client-side gate can drift from CanCan] → auth scenarios
  (signed-out / student / non-instructor / co-teacher / admin) are mandatory
  behavior scenarios; server remains authoritative; security review on the
  new controller.
- [`needsReload` semantics lost in Query translation] → re-express the
  legacy reducer tests as Query-invalidation behavior tests; scenario
  `section-mutated-elsewhere` covers stale-cache refresh on route change.
- [Underscore route segments fight TanStack file-route conventions] →
  accepted; parity wins. Verified TanStack supports literal segments.
- [Leftover dist-only `frontend/packages/teacher-dashboard/` dir shadows the
  scaffold] → deleted as the first task (human ack already recorded).

## Migration Plan

Additive throughout: new package, new routes, new controller + route, new
tests. Rollback = revert the commits; no data migration, no legacy edits.
Cutover of real traffic is out of scope and human-gated.

## Open Questions

- Merged-JSON precedence check (D3 caveat): record server output before
  finalizing schema. Owner: implementation, first task in the API area.
- Whether `section_order` belongs in the response body or a separate
  preferences endpoint long-term; short-term it ships in the bootstrap
  response to match the HAML contract.
