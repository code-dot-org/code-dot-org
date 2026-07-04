# Teacher Dashboard frontend architecture report

Planning artifact, 2026-07-04. Revised same day after human architecture
rulings. Decides how migration code is structured in `frontend/`, derived
from the conventions in force there (`frontend/AGENTS.md`,
`docs/conventions/packages.md`, `apps/studio/README.md`,
`packages/core/docs/architecture.md`, `packages/core/src/api/README.md`,
`packages/core/src/api/mocks/README.md`, `packages/users/README.md`,
`packages/e2e-tests/README.md`) and from the platform strategy PRFAQ
("Introducing the Next Generation Frontend Platform for Code.org's
Learning Platform"). Conclusions are backported into the four hardened
OpenSpec changes; evidence-pinned contracts there are unchanged.

## 0. Platform intent (PRFAQ) and how it applies here

The PRFAQ defines the next-generation platform as a monolith of
self-contained feature **modules** — Teacher Dashboard is one of its named
examples — with: isolated module development (spin up one module, dev
server in seconds), backend-light contributor workflows, module-level
unit/UI testing, module-level monitoring/disable-ability, accessibility
enforced by default (strict linting + automated axe), incremental
migration of `apps/` features, and responsive/mobile-capable UI.

Human corrections applied to that document for this repo and this
migration:

- The PRFAQ's Next.js/SSR wording is historical. **Vite + TanStack
  Router** (the existing `frontend/apps/studio` architecture) is the
  intended next-generation direction here. Nothing in this program
  assumes SSR.
- The PRFAQ's offline-first product promise is NOT a Teacher Dashboard
  requirement. The dashboard is live and backend-collaborative by nature.
  What IS required: standalone MSW/dev-shell mode, deterministic
  fixtures, and full testability without Rails — a development and
  testing capability, not a product offline contract. Specs must not
  imply teacher-facing offline support.
- Mobile-first is a platform capability, not a migration gate: Teacher
  Dashboard must be responsive within desktop/laptop web constraints now
  (§6a); tablet/mobile parity is explicitly out of this migration, but
  structure must not box it out.

## 1. What `@code-dot-org/teacher-dashboard` owns

One package = one module (ruling 5), feature-foldered, with lazy entries:

```
frontend/packages/teacher-dashboard/
  src/
    shell/                  # sidebar, tab frame, per-tab destination map,
                            # guard predicates, selected-section hooks
    features/<feature>/     # ONE folder per sequenced OpenSpec change
      components/           # ported/moved UI
      fixtures/             # MSW scenario COMPOSITIONS for this feature
      index.ts              # lazy entry the Studio route imports
    legacy/<feature>/       # transitional page-scoped Redux slices
    legacy/bridge.ts        # THE one-way Query→store hydration bridge
    shared/                 # cross-feature only: @cdo adapters,
                            # unit-selector, empty-state gate,
                            # error/skeleton components
    fixtures/index.ts       # aggregates feature fixtures for ./mocks
    main.tsx, index.html    # standalone MSW dev shell + scenario selector
  docs/architecture.md
  docs/legacy-mirror.md     # dual-copy ledger (§7)
```

Rules:

- `features/<feature>/` maps 1:1 to a sequenced change. Cross-feature
  imports go through `shared/` or `shell/`, never feature→feature.
- No backend wrappers live here (§3). Feature `fixtures/` compose MSW
  scenarios (which DashboardApi handlers respond with what, per scenario);
  the contract wrappers they exercise live in core.
- `legacy/` is quarantine: nothing outside a feature's own folder imports
  its transitional store; `legacy/bridge.ts` is the only coupling point.
  Move/refactor first; rewrite only where structurally required (§5).

Performance shape (ruling 4): the shell entry chunk carries only
`shell/` + the route map. Every tab/feature entry is lazy-loaded at its
route (package subpath or dynamic import of `features/<x>/index`), so
visiting one tab loads that tab, not the module. Code moves into
`shared/` only when it demonstrably reduces duplicate shipped code or
repeated migration work — not for conceptual tidiness. Heavy per-feature
deps (CodeMirror in student snapshot; reactabular in transitional tabs)
must stay inside their feature's chunk; a bundle check per feature change
verifies the shell entry did not grow.

## 2. What `frontend/apps/studio` owns

Host concerns only: file-based routes under
`src/routes/teacher_dashboard/` (underscore segments preserved), lazy
import + `Suspense` + `errorComponent` per route, the root auth
bootstrap, header/footer/`CdoTheme`, redirect execution (routes call the
package's guard predicates and destination map in `beforeLoad`), the
chrome-free printable parent-letter route, the GE region signal exposure
(BLOCKED-EVIDENCE in the progress change), and dev-mode MSW boot
(`VITE_API_MODE=msw`). Studio imports only feature entries and shell
exports — never feature internals, never package fixtures (Studio routes
run against the real backend; fixtures serve the standalone shell and
tests).

## 3. DashboardApi: all Rails wrappers live in core (human ruling)

RULING (supersedes this report's earlier package-local stance): every
Dashboard/Rails API wrapper — api, keys, query hooks, schemata, types,
transport-backed calls — belongs in
`frontend/packages/core/src/api/dashboard/...`, even with a single
current consumer. DashboardApi is intended as the general dashboard
backend wrapper client; feature packages consume typed DashboardApi
functions/hooks and own zero backend contract code.

Consequences for this program:

| Core domain (per core's controller-mirroring convention; exact names finalized against the owning controllers at implementation) | Endpoints from the pinned API tables |
| --- | --- |
| `dashboard/sections/` | teacher-dashboard bootstrap, section reload, home scalars, `PATCH /api/v1/sections/:id` (settings save) |
| `dashboard/sectionInstructors/` | coteacher check/add/remove (homepage + settings) |
| `dashboard/courseOfferings/` | `quick_assign_course_offerings` |
| `dashboard/sectionProgress/` (or per owning controller) | `section_level_progress`, `script_structure`, `GET/POST /api/lock_status` |
| `dashboard/assessments/` | the four-GET assessments family |
| `dashboard/studentSnapshots/` + `dashboard/lessonFeedbacks/` | the 12-row snapshot family |
| (per feature as later changes harden) | roster students/transfers/sync, drawer, tours, teaching profile, demo sections, materials, text responses, projects, stats |

MSW default handlers for these domains live beside them in core's mocks
(the existing registry model); feature packages register scenario
fixtures that shadow those handlers per scenario. The BLOCKED-EVIDENCE
capture-gated schema rule is unchanged — only the home of the schema
moved.

## 4. State boundary

TanStack Query is the server-state layer for all new code; the shell owns
the sections/selected-section/home-scalars queries (DashboardApi hooks)
and exposes them from `shell/`. Transitional Redux exists only as
page-scoped stores in `legacy/<feature>/` for the three move-not-rewrite
tabs whose slices are load-bearing: roster, assessments, and the progress
store module (built by course-unit-overview, extended by progress).
Settings and student snapshot are Query-only. Two `unitSelection` forms
coexist deliberately (shared/ URL-state re-expression vs the moved slice
inside the progress store); recorded, converging at modernization.

## 5. Move vs rewrite — structural rulings

Rewrite is structurally required for exactly three layers:

1. Route wrappers: react-router APIs (`useBlocker`, `Navigate`,
   `useParams`) cannot cross into the TanStack host (e.g. the 88-line
   settings wrapper). Thin by construction; each a recorded rewrite.
2. The data spine: HAML `data-dashboard` + global `registerReducers` boot
   is re-expressed as Query (+ the bridge for transitional stores).
3. Network call sites: `$.ajax` / raw `fetch` / `HttpClient` become
   DashboardApi calls with request shapes preserved (adapter-level
   equivalence tests against recorded traffic).

Everything else moves: component trees, SCSS modules, slices (into
`legacy/`), pure utils (the `progressHelpers` trio extracts with
unit-test parity). Consume-not-fork applies to shared code with
non-dashboard consumers (`templates/rubrics/`, codemirror
`editorConfig`); extraction only with blocker evidence.

## 6. DSCO/MUI, SCSS, markdown, a11y, visual testing

- Styling: SCSS modules with semantic tokens; `CdoTheme` from the host;
  the standalone shell loads the styling foundation itself (users
  precedent).
- Component precedence: browser semantics > DSCO > MUI (migrated set) >
  custom. Move commits DO NOT restyle; DS mapping tables execute in the
  modernization passes.
- `SafeMarkdown` → `@code-dot-org/markdown` at move time.
- A11y (PRFAQ: enforced by default, not ad hoc): vitest-axe per
  scenario/dialog in package tests; a11y-architect review per feature;
  keyboard/SR passes in e2e/manual gates. AA is the floor.
- Visual: the legacy-vs-candidate harness lives in `packages/e2e-tests`
  and pixel-gates only DSCO/MUI-era surfaces; masks declared next to the
  capture spec; skeleton/error frames masked via the shared mask id.
- Monitoring (PRFAQ: per-module signals): the package uses core's
  observability plugin so dashboard signals are attributable to this
  module; legacy `logToCloud` page-action names carry across (pinned in
  the progress change).

## 6a. Responsive stance (human ruling)

Required NOW, in this migration, for every candidate surface:
desktop/laptop responsive behavior across common desktop widths, browser
zoom (at least 200%), OS split-screen, and narrow laptop layouts — no
overlapping content, no unusable/unreachable controls; wide content
(grids, tables) scrolls within its own container rather than breaking the
page. NOT required: tablet/mobile parity. Do-not-box-out rule: preserve
semantic layout (no fixed pixel page widths baked into feature roots, no
layout that only works at one width), keep DS-compatible structure, so
future tablet/mobile work is additive. Each feature change's gate table
carries a `responsive (desktop/laptop)` row; it is a behavior gate, not a
pixel gate.

## 7. Dual-copy and shared-dependency recording

One ledger: `packages/teacher-dashboard/docs/legacy-mirror.md` — columns:
legacy path, package path, copied-at SHA, owner, sync policy, planned
resolution (delete-at-cutover / extract-to-shared / consume-not-fork).
Every copying task writes a row in the same commit; a dual copy without a
row fails review.

## 8. Ambiguities that remain (deliberate)

- Exact core domain names for the new DashboardApi areas: finalized at
  implementation against the owning Rails controllers (core convention is
  controller-mirroring); the ownership (core) is decided, naming is not.
- The GE region signal under `FrontendStudioController`
  (BLOCKED-EVIDENCE, progress change).
- Final home of moved `SyncOmniAuthSectionControl` (roster) and the
  DSCO-vs-MUI table primitive question (modernization) stay open where
  their changes record them.
