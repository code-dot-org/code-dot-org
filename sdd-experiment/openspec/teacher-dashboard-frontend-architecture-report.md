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

Domain names are PINNED (2026-07-07; previously deferred). Naming rule:
resource-oriented. The `/api/*` and `/dashboardapi/*` prefixes are dual
mounts onto the same controller actions (verified: routes.rb:1045
`/dashboardapi/section/:id → api#section`; :251-252 transfers mounted at
both prefixes) — the `/dashboardapi/...` forms pinned in the specs are
canonical; aliases are equivalent and must not be modeled as separate
endpoints.

| Core domain | Endpoints from the pinned API tables |
| --- | --- |
| `dashboard/sections/` | teacher-dashboard bootstrap, section reload, home scalars, sections CRUD (`PATCH /api/v1/sections/:id`, delete, hidden toggle), demo presets/create |
| `dashboard/sectionInstructors/` | coteacher check/add/remove/accept/decline |
| `dashboard/courseOfferings/` | `quick_assign_course_offerings`, `valid_course_offerings`, `available_participant_types` |
| `dashboard/students/` | roster students CRUD/bulk_add/remove/resets, `completed_levels_count` (shared w/ stats), transfers |
| `dashboard/rosterSync/` | `/api/v1/roster/{clever,google}/sections/sync`, classroom list/import |
| `dashboard/sectionProgress/` | `section_level_progress`, `script_structure`, `unit_summary` (shared w/ calendar) |
| `dashboard/lockStatus/` | `GET/POST /api/lock_status` |
| `dashboard/hiddenLessons/` | `/s/:script/hidden_lessons`, `toggle_hidden` |
| `dashboard/assessments/` | the four-GET assessments family |
| `dashboard/textResponses/` | `section_text_responses` |
| `dashboard/projects/` | `/dashboardapi/v1/projects/section/:id` |
| `dashboard/lessonMaterials/` | `lesson_materials`, `unit_in_aif`, `ai_lesson_summaries/show` |
| `dashboard/studentSnapshots/` + `dashboard/lessonFeedbacks/` | the 12-row snapshot family |
| `dashboard/aiChatAccess/` | `ai_chat_access_level` family |
| `dashboard/skills/` | `POST /openai/evaluate_section` + results read |
| `dashboard/userPreferences/` | `PUT /user_preference` (section order), preference dismissals |
| `dashboard/teacherDashboard/` | drawer data, `teaching_profile_data`, product tours |

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

### 4a. Compatibility contract with the RTK-slice prototype

A prototype `@code-dot-org/teacher-dashboard` exists on
`ngfp/music-lab-updated`: a data-only package with a TypeScript RTK
rewrite of `teacherSectionsRedux` (hybrid thunks receiving
`(apiClient, queryClient)`, reads via `queryClient.fetchQuery` under
shared `sectionsKeys`, mutations still raw `fetch`), a core Redux layer
(`injectSlices` + `RootStateProvider`), and a small core sections domain.
Ruling (2026-07-07): resolvable, no structural action — the two models
are compatible under three constraints that this program enforces:

1. The Query cache is the source of truth for server data. RTK slices may
   CONSUME it — hydrated one-way — which is exactly what
   `legacy/bridge.ts` does; the prototype slice can serve as a
   transitional-store implementation behind the bridge if useful.
2. Slices never fetch independently: all network goes through DashboardApi
   with shared query keys (the prototype's raw-`fetch` mutation sites do
   not survive as-is).
3. `injectSlices` remains a per-page/per-feature utility; it is not the
   shell's data spine, and Redux does not become a core-mandated
   platform dependency.

Reusable prototype assets under this contract: the TS types
(`Section`, `SectionMap`, `UserEditableSection`, …), the
`sectionOrderUtils` TS port, the core `sections.keys/query/schemata`
files, and the slice itself as reference (or transitional-store) code.
Note two reconciliations when consuming it: the prototype's
`/api/section?section_id=` is a dual-mount alias of the canonical
`/dashboardapi/section/:id` (§3), and its `"type": "module"` package flag
violates `docs/conventions/packages.md` — do not copy that flag.

### 4b. Bridge interface (pinned so implementers do not design it)

`legacy/bridge.ts` exposes one factory:

```ts
type LegacyBridge = {
  attach(store: Store): () => void; // subscribe queries → dispatch hydrate; returns detach
  invalidations: {
    onStudentCountChanged(sectionId: number): void; // → invalidate selected-section + sections queries
    onSectionMutated(sectionId: number): void;
  };
};
createLegacyBridge(queryClient: QueryClient, hooks: {
  hydrateSections(sections: SectionMap, selectedId: number | null): AnyAction;
  hydrateCurrentUser(user: CurrentUser): AnyAction;
}): LegacyBridge;
```

Semantics: on attach, current Query data is dispatched immediately, then
on every relevant query-cache update (subscription), the hydrate actions
re-dispatch. Reverse flow is ONLY the named invalidation callbacks —
slices never write into the Query cache. One implementation in
`legacy/bridge.ts`; per-feature stores pass their own hydrate action
creators. The per-tab destination map (shell) is likewise pinned:
`Record<TabKey, {kind: 'candidate'} | {kind: 'legacy'; url: (sectionId:
number) => string}>` — flipping a tab is a one-entry edit.

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

- The GE region signal under `FrontendStudioController`
  (BLOCKED-EVIDENCE, progress change).
- Final home of moved `SyncOmniAuthSectionControl` (roster) and the
  DSCO-vs-MUI table primitive question (modernization) stay open where
  their changes record them.

Closed since first publication: core domain names (§3, pinned); the
prototype state fork (§4a, compatibility contract); evidence-capture
mechanics (every `0.x` capture task follows
`sdd-experiment/openspec/teacher-dashboard-evidence-playbook.md` —
environment startup, non-destructive seeding recipes, authenticated
capture methods, fixture storage convention, flag pinning); the visual
harness mechanism (pinned in the shell change's
teacher-dashboard-visual-parity-harness spec).
