# Proposal: teacher-dashboard-manage-students

## Why

The roster (`/teacher_dashboard/sections/:sectionId/roster`, legacy alias
`manage_students`) is the first mutation-heavy tab to migrate, deliberately
early because it has the strongest existing behavior coverage to port
against: the only Playwright-covered dashboard tab
(`frontend/packages/e2e-tests/tests/manage-students/manage-students-tab.spec.ts`)
plus Cucumber oracles (`manage_students_tab_views_eyes`,
`teacher_dashboard_code_review_groups`, `age_gated_students_modal`,
`age_gated_sections_modal`). Unlike the homepage it is legacy UI — a
~1,400-line reactabular table (`apps/src/templates/manageStudents/Table/`)
over a ~1,100-line jQuery-ajax Redux slice (`manageStudentsRedux.js`) —
so the program rule applies: move and refactor it into the candidate before
replacing it. A rewrite is not justified; blocker evidence for anything
that cannot move verbatim is recorded per task.

Depends on `teacher-dashboard-shell` (package, routes, sections bootstrap,
mocks, harness).

## What Changes

- The candidate route
  `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/sections/:sectionId/roster`
  renders the roster: student table (name, family name, age, gender,
  password/secret, sharing, US state, completed levels), add/edit/remove,
  bulk add, password and secret reset, login export and printable login
  cards, parent letter download, move students (transfers), code review
  groups dialog, project-sharing controls, age-gating modals, and the
  provider-managed variants (google_classroom / clever / lti_v1: no
  add/remove, sync control + reauthorize instead).
- The candidate alias
  `/frontend-studio/teacher_dashboard/sections/:sectionId/manage_students`
  redirects to the roster route (shell already specifies this).
- The legacy component tree and its Redux slice move into
  `@code-dot-org/teacher-dashboard` by extraction (`git mv` spirit: same
  logic, adapted imports), running against a package-encapsulated store
  bridged to the shell's section state. No visual rewrite in this change.
- Existing roster endpoints are reused as-is through typed core wrappers +
  MSW handlers: students CRUD/bulk_add/remove under
  `/dashboardapi/sections/:id/students`, `/dashboardapi/sections/transfers`,
  roster sync (`/api/v1/roster/{clever,google}/sections/sync`),
  completed-levels count. No new Rails endpoints: the section bootstrap and
  selected-section payloads (shell change) carry the section-level fields
  the roster needs (`login_type`, `restrict_section`, capacity, age-gating
  flags, `post_milestone_disabled`, `code_review_expires_at`).
- Roster MSW scenarios in the dev shell as visible choices (per login type,
  age-gated, at-capacity, restricted, provider-managed, empty).
- No pixel-parity gate: the roster is non-DSCO legacy UI (reactabular
  table, legacy SCSS) with only incidental DSCO usage (icons, modal shells,
  text fields). Parity is behavioral, copy, and a11y; the
  design-system migration of the table itself is a recorded follow-up
  improvement, not part of this change's contract.
- Legacy `/teacher_dashboard/sections/:sectionId/roster` and its
  `manage_students` alias remain untouched.

## Capabilities

### New Capabilities

- `teacher-dashboard-roster-page`: the moved roster UI — table, cells,
  dialogs, mutations, age-gating, provider-managed variants, sync control —
  mounted in the candidate shell.
- `teacher-dashboard-roster-data`: typed wrappers, recorded-JSON schemata,
  and MSW handlers for the reused roster endpoints, plus the
  package-encapsulated state bridge that replaces global store registration.

### Modified Capabilities

- `teacher-dashboard-shell-navigation`: the `roster` tab entry flips from
  legacy URL to the candidate route (the `manage_students` → `roster`
  redirect is already specified in the shell change and gains its real
  target).

## Impact

- `frontend/packages/teacher-dashboard/` (roster feature area, moved legacy
  code), `frontend/packages/core` (roster endpoint wrappers + mocks),
  `frontend/apps/studio` (roster route content), `frontend/packages/e2e-tests`
  (ported/extended roster specs).
- New package dependencies inherited from the moved code (reactabular-table,
  sortabular, react-tooltip, react-csv); jQuery-ajax call sites in the moved
  Redux slice are replaced with the core transport during the move (an
  adapter, not a rewrite — call shapes preserved).
- Uses `@code-dot-org/markdown` where the moved code used `SafeMarkdown`.
- No legacy `apps/src` deletions in this change: legacy keeps serving
  `/teacher_dashboard/*` from its own copy until cutover; divergence risk is
  accepted and time-boxed (see design).
- No Rails changes. Production exposure: none.
