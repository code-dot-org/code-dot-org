# Teacher Dashboard frontend architecture report

Planning artifact, 2026-07-04. Decides how migration code is structured in
`frontend/`, derived from the conventions already in force there:
`frontend/AGENTS.md`, `docs/conventions/packages.md`,
`apps/studio/README.md` + TanStack file routing,
`packages/core/docs/architecture.md` (singletons, sub-path exports,
plugin model), `packages/core/src/api/README.md` (domain layout, file
roles), `packages/core/src/api/mocks/README.md` (fixture registry),
`packages/users/README.md` (the app-shaped feature-package precedent),
and `packages/e2e-tests/README.md`. Conclusions here are backported into
the four hardened OpenSpec changes as boundary sections; the
evidence-pinned API/scenario contracts in those changes are unchanged.

## 1. What `@code-dot-org/teacher-dashboard` owns

Everything teacher-dashboard-specific that is not host plumbing:

```
frontend/packages/teacher-dashboard/
  src/
    shell/                  # sidebar, tab frame, per-tab destination map,
                            # guard predicates, selected-section query hooks
    features/<feature>/     # ONE folder per sequenced OpenSpec change
      api/                  # package-local *.api.ts / *.keys.ts / *.query.ts /
                            # *.schemata.ts / *.types.ts (core's file roles,
                            # applied locally)
      components/           # ported/moved UI
      fixtures/             # MSW scenario fixtures (registerMockFixture)
      index.ts              # the entry Studio's route lazy-loads
    legacy/<feature>/       # transitional page-scoped Redux slices, moved
                            # verbatim (roster, assessments, progress store)
    legacy/bridge.ts        # THE one-way Query→store hydration bridge;
                            # single implementation, all transitional stores
    shared/                 # cross-feature only: @cdo adapters (locale,
                            # analytics, experiments, UserPreferences, DCDO),
                            # unit-selector re-expression, empty-state gate,
                            # error/skeleton components (resilience-ux)
    fixtures/index.ts       # aggregates feature fixtures for ./mocks
    main.tsx, index.html    # standalone MSW dev shell + scenario selector
  docs/architecture.md      # this structure, kept current
  docs/legacy-mirror.md     # dual-copy ledger (see §7)
```

Rules:

- `features/<feature>/` maps 1:1 to a sequenced change; a change lands in
  exactly one feature folder plus its Studio route file. Cross-feature
  imports go through `shared/` or `shell/` — never feature→feature.
- `legacy/` is quarantine: nothing outside a feature's own folder imports
  its transitional store; `legacy/bridge.ts` is the only coupling point to
  Query state. This makes the modernization deletion mechanical.
- Package-local API modules call core's `DashboardApiClient` transport
  (never hand-rolled fetch/ky, per `frontend/AGENTS.md`); they copy core's
  api/keys/query/schemata/types file discipline without living in core.

## 2. What `frontend/apps/studio` owns

Host concerns only: file-based routes under
`src/routes/teacher_dashboard/` (underscore segments preserved), lazy
import + `Suspense` + `errorComponent` per route, the root auth bootstrap
and `useAuth` context, header/footer/`CdoTheme`, redirect execution
(routes call the package's guard predicates and destination map in
`beforeLoad` — logic lives in the package, wiring in Studio), the
chrome-free printable parent-letter route, exposure of the GE region
signal (BLOCKED-EVIDENCE in the progress change), and dev-mode MSW boot
(`VITE_API_MODE=msw`). Studio imports only feature entries and shell
exports — never feature internals, never package fixtures (users-package
precedent: Studio routes run against the real backend; fixtures serve the
standalone shell and tests).

## 3. What belongs in `frontend/packages/core/src/api/`

Only cross-feature dashboard domains — the users-package precedent
("Zod schemas and the API functions stay internal" to the feature
package) governs:

| In core | Why |
| --- | --- |
| `dashboard/sections/` — bootstrap (`/api/v1/teacher_dashboard/sections`), reload (`/dashboardapi/section/:id`), home scalars (`/api/v1/teacher_dashboard/home`) | consumed by shell + every tab (home scalars: homepage AND lesson-materials AITA flags) |
| `dashboard/sectionInstructors/` | coteacher endpoints used by homepage (invites) AND settings (manage) |
| mocks registry, transport, default sections handlers | already core's job |

Everything tab-specific stays package-local in `features/<feature>/api/`:
the assessments GET family, `/student_snapshots/*` + `/lesson_feedbacks`,
`/api/lock_status`, `section_level_progress` + `script_structure`,
`quick_assign_course_offerings`. Promotion rule: an endpoint moves to
core only when a second, non-teacher-dashboard consumer appears — not
speculatively.

## 4. State boundary

TanStack Query is the server-state layer for all new code; the shell owns
the sections/selected-section/home-scalars queries and exposes hooks from
`shell/`. Transitional Redux exists only as page-scoped stores in
`legacy/<feature>/` for the three move-not-rewrite tabs whose slices are
load-bearing: roster (`manageStudents`), assessments
(`sectionAssessments`), and the progress store module
(`sectionProgress` + `unitSelection` + lock, built by the
course-unit-overview change, extended by progress). Settings and student
snapshot are Query-only (settings' form state is component-local; the
snapshot is already `fetchJson`-per-widget). Two `unitSelection` forms
coexist deliberately (shared/ URL-state re-expression for
text-responses/assessments vs the moved slice inside the progress store);
the asymmetry is recorded and converges in the modernization pass.

## 5. Move vs rewrite — structural rulings

Rewrite is structurally required (not optional) for exactly three layers:

1. Route wrappers: anything importing react-router APIs (`useBlocker`,
   `Navigate`, `useParams`, `useLocation`) cannot cross into the TanStack
   host — e.g. the 88-line `DashboardSectionSettings` wrapper. These are
   thin by construction; each is a recorded rewrite.
2. The data spine: HAML `data-dashboard` + global `registerReducers` boot
   does not exist in the candidate; it is re-expressed as Query (+ the
   bridge for transitional stores).
3. Network call sites: `$.ajax` / raw `fetch` / `HttpClient` become
   `DashboardApiClient` calls with request shapes preserved
   (adapter-level equivalence tests against recorded traffic).

Everything else moves: component trees, SCSS modules, slices (into
`legacy/`), pure utils (the `progressHelpers` trio extracts with
unit-test parity). Consume-not-fork applies to shared code with
non-dashboard consumers: `templates/rubrics/` components,
`@cdo/apps/codemirror/editorConfig` — extraction happens only with
blocker evidence, otherwise a thin wrapper consumes the current home.

## 6. DSCO/MUI, SCSS, markdown, a11y, visual testing

- Styling: SCSS modules with semantic tokens (`colors.css` variables);
  never sx-heavy styling or load-order tricks. `CdoTheme` comes from the
  host (Studio); the standalone shell loads the styling foundation
  itself, exactly as `packages/users` does.
- Component precedence: browser semantics > DSCO > MUI (migrated set:
  Typography, Button, IconButton, Breadcrumbs) > custom. Move commits DO
  NOT restyle: the DS mapping tables in each change execute in the
  modernization passes, keeping move diffs reviewable and pixel-stable.
- `SafeMarkdown` → `@code-dot-org/markdown` at move time (sanctioned
  behavioral swap; sanitization boundary improves, output asserted in
  tests).
- A11y: vitest-axe per scenario/dialog in package tests
  (`{displayCheck:'none'}` caveat for jsdom focus checks);
  a11y-architect review per feature; keyboard/SR passes live in
  e2e/manual gates.
- Visual: the legacy-vs-candidate harness lives in
  `packages/e2e-tests` (shell change) and pixel-gates only DSCO/MUI-era
  surfaces; masks are declared next to the capture spec, and skeleton/
  error frames are masked via the shared mask id (resilience-ux).

## 7. Dual-copy and shared-dependency recording

One ledger: `packages/teacher-dashboard/docs/legacy-mirror.md`, a table
with columns — legacy path, package path, copied-at SHA, owner, sync
policy during the window, planned resolution (delete-at-cutover /
extract-to-shared / consume-not-fork). Every task that copies shared code
(roster table deps, `sectionsRefresh/` form set, overview trees, projects
list, skills/snapshot active-development copies) writes a row in the same
commit. The program ledger references this file rather than duplicating
it. A dual copy without a row fails review; that is the enforcement
mechanism.

## 8. Ambiguities that remain (deliberate)

- The GE region signal under `FrontendStudioController` is a
  BLOCKED-EVIDENCE item in the progress change; the structure above only
  fixes WHERE the wrapper lives (`shared/`), not its mechanism.
- Whether `section_instructors` schemata land in core before the
  homepage change or with it is sequencing detail left to change 2's
  implementer; the boundary (core) is decided here.
- The final home of moved `SyncOmniAuthSectionControl` (roster) and the
  DSCO-vs-MUI table primitive question (modernization) stay open where
  their changes already record them.
