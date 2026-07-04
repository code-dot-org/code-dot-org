# Design: teacher-dashboard-manage-students

## Context

Legacy roster: `ManageStudents.jsx` (41-line connected wrapper: loading
spinner + `SyncOmniAuthSectionControl` + `ManageStudentsTable`) over
`Table/index.jsx` (~1,400 lines, reactabular-table + sortabular) and
`manageStudentsRedux.js` (~1,085 lines; `$.ajax` to
`/dashboardapi/sections/:id/students` CRUD, `bulk_add`, `remove`,
`/dashboardapi/sections/transfers`). Sibling dialogs: AddMultipleStudents,
ConfirmRemoveStudent, ControlProjectSharing, MoveStudents, PasswordReset,
ShowSecret, CodeReviewGroupsDialog, LoginExport, PrintLoginCards,
DownloadParentLetter. Cross-slice reads: `teacherSections`
(selectedSectionId, section login_type/code/capacity flags) and
`currentUser`. Provider sync UI lives in
`@cdo/apps/accounts/SyncOmniAuthSectionControl`.

Behavior oracles: the existing candidate-side Playwright spec
(`manage-students-tab.spec.ts` + `pages/teacher-dashboard/*` POMs, which run
against the LEGACY route today), Cucumber features (views_eyes,
code_review_groups, both age-gating modals), and the legacy jest suite for
manageStudents.

## Goals / Non-Goals

**Goals:**

- The roster works in the candidate shell with behavior, copy, and a11y
  parity across all six login types and section states (restricted,
  at-capacity, age-gated, provider-managed, empty).
- The legacy code MOVES (extraction + adapters); logic is preserved, diffs
  reviewable as moves.
- All roster data flows through typed core wrappers; MSW scenarios cover
  the discovered behavior matrix offline.

**Non-Goals:**

- No visual redesign, no reactabular→DSCO table rewrite (recorded follow-up
  improvement), no pixel-parity gate (non-DSCO legacy UI).
- No new Rails endpoints; no changes to the roster controllers.
- No deletion of the legacy copy in `apps/src` (cutover is human-gated).
- LTI deep roster management beyond what the legacy tab does today.

## Decisions

### D1. Move with adapters, not rewrite

The component tree and Redux slice are copied into the package with import
adaptation only. Justification for not rewriting: 1,400-line table encoding
years of edge cases (age gating, secret handling, provider variants) with
strong existing tests; a rewrite forfeits the oracle. Adapters:

- `@cdo/locale` → package-local i18n adapter with identical keys.
- `$.ajax` call sites → core `DashboardApiClient` transport calls with the
  same URL/payload shapes (CSRF handled by the transport). This is the one
  in-place modernization allowed; jQuery does not enter the package.
- `@cdo/apps/templates/teacherDashboard/*` cross-slice selectors → a bridge
  module fed by the shell's section state (see D2).
- `SafeMarkdown` → `@code-dot-org/markdown`.
- `SyncOmniAuthSectionControl` (lives in `apps/src/accounts/`) → moved
  alongside, same adapter treatment; blocker evidence recorded if its own
  import graph resists extraction.
- reactabular-table, sortabular, react-tooltip, react-csv → package
  dependencies as-is.

Anything that cannot move under these rules gets recorded blocker evidence
(file, import, reason) in the task log before any rewrite is considered.

### D2. Package-encapsulated Redux store, bridged to shell state

`manageStudentsRedux` continues to run — inside a `Provider` scoped to the
roster page component, not a global store. The slice's reads of
`teacherSections`/`currentUser` are satisfied by a bridge slice hydrated
from the shell's TanStack Query data (selected section, current user) and
kept in sync via subscription. Mutations that legacy signaled via
`teacherSections` (e.g. student count changes → section reload) surface as
Query invalidations through the bridge. Alternative — porting the slice to
Query in this change — rejected: it converts a move into a rewrite and
doubles the diff surface. The Query port is the recorded follow-up.

### D3. Roster endpoints are reused and typed at the boundary

Wrappers + recorded-JSON schemata + MSW handlers in core for: students
CRUD, bulk_add, remove, transfers, completed_levels_count, provider sync
(`/api/v1/roster/{clever,google}/sections/sync`). The moved slice calls
these wrappers through the adapter; response handling logic is unchanged.
Sync/reauthorize flows that round-trip through OAuth redirect at legacy
URLs; the candidate links into those flows rather than reimplementing them.

### D4. Parity gates: behavior + copy + a11y; no pixel gate

Evidence for the visual determination: the table is reactabular with legacy
SCSS modules; DSCO appears only as leaf widgets (fontAwesomeV6Icon ×9,
modal ×4, textField ×3, dropdown ×3 across the directory). Under the
program rule, non-DSCO legacy UI is not pixel-gated; gates are: ported
Playwright spec green against the candidate route, discovered behavior
matrix covered by component tests over MSW, axe + keyboard pass per dialog,
en-US copy parity. The existing Playwright POMs
(`tests/pages/teacher-dashboard/`) are parameterized to run against both
legacy and candidate routes during the transition.

### D5. Design-system mapping is recorded now, executed later

The table and dialogs get a concise legacy→target mapping (in the roster
page spec) so the follow-up DS migration change starts from a plan, not a
survey: reactabular table → DSCO table primitives/MUI Table with sticky
header; legacy buttons → MUI Button; legacy inline inputs → DSCO
textField/dropdown (already partially adopted); react-tooltip → DSCO
tooltip; hand-rolled dialogs → DSCO dialog. Temporary wrappers during the
move keep the legacy widgets untouched.

## Risks / Trade-offs

- [Two copies of roster code (legacy + package) drift while both live] →
  accepted, time-boxed to the migration program; the field-equivalence and
  ported-spec gates run against the candidate; legacy bugfixes during the
  window must be mirrored (tracked in the program ledger).
- [The Redux slice's `$.ajax` → transport adapter changes error/CSRF paths
  subtly] → adapter unit tests assert identical request shapes (URL,
  method, payload, headers) against recorded legacy requests; error-path
  scenarios (409 at-capacity, age-gate rejection, 401) in the MSW matrix.
- [Bridge slice desync between shell Query state and package store] →
  bridge is one-directional (Query → store) with invalidation callbacks the
  only reverse channel; a component test covers section-switch mid-edit.
- [`SyncOmniAuthSectionControl` import graph pulls broad `accounts/` code] →
  blocker-evidence rule; if extraction exceeds budget, the sync control
  area is the one place a thin re-implementation over the same endpoints is
  pre-authorized, recorded as such.
- [Age-gating and secret flows are compliance-sensitive] → their Cucumber
  features are ported first among the dialogs; no behavior change tolerated.

## Migration Plan

1. Data layer: wrappers + schemata + MSW + recorded fixtures.
2. Move the slice + bridge; adapter tests green.
3. Move the table read-only path; mount at the candidate route.
4. Move mutations + dialogs in oracle order (add/edit/remove → bulk →
   secrets → transfers → code review groups → sharing → age-gating →
   provider sync).
5. Port the Playwright spec to the candidate route; keep the legacy run.

Rollback: revert additive commits; legacy copy was never modified.

## Open Questions

- Whether `completed_levels_count` and login-export flows have adequate
  seeded data on local Rails for recorded fixtures; if not, record from
  test-studio equivalents and note provenance.
- Final home of the moved `SyncOmniAuthSectionControl` (shared package area
  vs roster-local) — decided at move time by its import graph.
