## Context

The V2 teacher home page boots from `TeacherDashboardController#show` →
`show.html.haml` (a `data-dashboard` JSON contract) →
`apps/src/sites/studio/pages/teacher_dashboard/show.js` (jQuery ready,
`registerReducers`, global store), which renders
`apps/src/templates/studioHomepages/teacherHomepageV2/TeacherHomepage.tsx` when
the teacher has no sections, and the same component via
`TeacherNavigationRouter`'s `/home` route otherwise. V1 is deleted; there is no
toggle. Data flows through `apps/src/templates/teacherDashboard/teacherSectionsRedux.ts`
(~1.4k lines; thunks over `$.ajax`/`fetch`/`HttpClient`) and a `currentUser`
slice fed out-of-band by the code-studio header bootstrap (gon →
`SET_INITIAL_DATA`).

Import census of the ~41-file tree: ~6 files move with zero edits, ~5 need only
a locale line, ~10 need small seams (types/path-constants/analytics/flags),
~18 are Redux/HTTP-entangled, ~4 pull other apps feature trees (AI FAB, NPS,
tours/shepherd, GlobalEditionWrapper).

Enablers already in the repo:
- This branch: `@code-dot-org/teacher-dashboard` scaffold (users recipe,
  `./mocks`, standalone `main.tsx`, MSW/vitest wiring) and the core `sections`
  Query domain (roster change, phases 0/1/2a).
- **Staging (landed 2026-07, PR #73675)**: `core/src/redux/` — `injectSlices`,
  `storeHooks`, `MockStore`/`StateFor`, `RootStateProvider`; S0 is done
  upstream. Staging's Studio root also already mounts a `QueryClientProvider`,
  and the `users` package is no longer a scaffold (Account Settings shipped),
  strengthening D5's path.
- `ngfp/music-lab-updated`: a de-jQueried `teacherSectionsSlice` (stale fork —
  missing demo-preset thunks; apps kept its own copy; its 685-line diff vs its
  own apps copy is mostly voluntary modernization — the forced edits are ~100
  lines, which is the minimality bar for our S1) and
  `users/redux/currentUserSlice` (missing `gradesTeaching`,
  `aiChatAccessLevel`).
- Proven apps↔frontend bridge: `portal:` deps + `build-frontend-dependencies.sh`
  prebuild (component-library, core, ailab consume this way today).

## Goals / Non-Goals

**Goals:**
- Reorganize the home page into `frontend/packages/teacher-dashboard` by
  **moving code** (`git mv`), preserving behavior; no product-UI rewrite.
- One source of truth: apps consumes the moved code back; production renders
  the same files as the prototype.
- Independent modularized development: standalone MSW host, personas for every
  edge/pitfall state, package-local vitest, sub-second Vite dev server.
- Visual-baseline TDD: strict region screenshots pin pixel parity across every
  mechanical edit; stress-gated non-flaky by construction.
- Small, independently landable, revertable PRs.

**Non-Goals:**
- Migrating the production URL or Rails entry (legacy HAML/show.js stay).
- Redux→Query convergence (roster stays Query; per-endpoint convergence is
  future work the transport swap makes small).
- A Studio route for home (react-router `<Link>`s inside TanStack Router —
  deferred, with the S7 option noted).
- Porting the nav shell/tabs; changing any Rails endpoint.
- Moving cross-tree dependencies (AI FAB, NPS, tours, GlobalEditionWrapper) —
  stubbed in the package, real in apps, each its own later slice.

## Decisions

### D1 — True moves with a two-commit discipline (vs copy-and-adapt)
Copy-and-adapt (the roster change's approach) was rejected for this surface:
it duplicates ~5k lines of already-modern UI, opens a bugfix-mirroring window,
and produces unreviewable "new file" diffs. Instead every moving PR is:
commit 1 = pure `git mv`, byte-identical, message cites source path + SHA;
commit 2+ = seam edits only. Reviewers skim the rename and review the seams.
Move-first is viable here *because* V2 is modern and injectSlices (D2) removes
the data-layer rewrite; the roster kept copy-and-rebuild because its table was
being rebuilt regardless (reactabular is dead).

### D2 — Redux retained via package-owned slices + injectSlices (vs Query rewrite)
Lift ngfp's `core/redux` and move staging's slice into the package's `./redux`
subpath. Entangled components then move **verbatim** — `useAppSelector` and
thunk dispatches unchanged, only import lines repointed (store-agnostic typed
hooks via the `MockStore` pattern so components work under apps' Provider and
the injected store alike). Alternatives: (a) rewrite data access to TanStack
Query during the port — rejected: that is the rewrite this change exists to
avoid; (b) adopt ngfp's packaged slice — rejected: stale fork; use it as the
recipe, `git mv` staging's current slice.

### D3 — Slice HTTP through the core ky transport (vs bare fetch vs typed client)
The slice's `$.ajax` mutations carry no CSRF token at the call site — auth is
ambient (host jQuery config or server-side exemption). Keeping `$.ajax` would
carry jQuery into `frontend/packages` and preserve that un-inspectability;
ngfp's bare `fetch` hand-rolls CSRF. The core transport gives CSRF
auto-injection on non-GET, `ApiError` normalization, and one HTTP seam shared
with MSW — while leaving wire shapes untouched so reducers see identical data.
The typed `DashboardApiClient` (Zod + camelCase) would change reducer inputs =
the deferred per-endpoint convergence, not the move. Documented as a stated
exception to the "always DashboardApiClient" convention for migrated slices.
S1 includes reading the Rails controller to confirm CSRF semantics, and
request-shape tests + captured Rails fixtures pin `$.ajax` quirk parity
(param serialization, empty-body handling, fail semantics).

### D4 — Re-export shim in apps (vs repo-wide codemod)
After the slice moves, the old path becomes
`export * from '@code-dot-org/teacher-dashboard/redux'`. Apps' ~dozen other
importers (teacherNavigation, manageStudents, sectionsRefresh…) migrate lazily
or never. Apps re-registers the packaged reducer under the same
`teacherSections` name via its existing `registerReducers`, then deletes its
copy — one slice, everywhere.

### D5 — currentUser: lift + extend `users/redux` (vs package-local slice)
Bring ngfp's `currentUserSlice` to staging's `users` package (empty scaffold
today) and add homepage-read fields (`gradesTeaching`, `aiChatAccessLevel`, …).
Hosts seed it explicitly, naming the today-implicit gon dependency. Fallback if
users-package sign-off stalls: package-local slice with a consolidation note.

### D6 — i18n: English strings, simplest mechanical form
`@cdo/locale` (Crowdin catalog) is deprecated; core's dynamic-translation
plugin translates rendered English at runtime, and the strings are unchanged
from production so existing translations carry over. Per file, keep `i18n.foo()`
call sites behind a trivial English shim or inline — whichever is easier.
Hard rule: user-generated content (section names, student names, join codes)
carries `notranslate`/`data-notranslate`.

### D7 — Flags via typed host contract; analytics stubbed
DCDO/experiment flags become booleans on a small `TeacherDashboardHost`
interface (personas fix them in the standalone host; apps resolves them from
the real DCDO/experiments at the consume-back seam). Analytics has its own
roadmap; the package calls a `reportEvent(name, payload)` seam that is a
no-op/console stub until the analytics plugin lands.

### D8 — Visual-baseline TDD with a stress gate
Playwright against the standalone MSW host; strict screenshot assertions
(zero diff budget, `animations: 'disabled'`, masks forbidden without a comment
naming the nondeterminism source); **region screenshots by locator** so checks
are surgical; 12-consecutive-run acceptance gate per baseline; determinism
contract (frozen clock in personas, fonts preloaded + `document.fonts.ready` +
visual-stability settle, MUI transitions off, persona-pinned randomness, fixed
viewports 1280×800 + 360 floor). Baselines are captured after each verbatim
move and must show **zero pixel delta** through the seam-edit commits — the
verification that "mechanical" edits are mechanical. Prefer
`@code-dot-org/playwright-support` `/visual` once landed; raw Playwright with
equivalent config otherwise. One-time side-by-side audit against the legacy
page for legacy-reachable states.

### D9 — Prototype early on an integration branch
The standalone-host prototype needs the moves; it is built immediately on an
integration branch where S0–S5 exist while the mainline staircase lands behind
it. It stays honest because it renders the same files the PRs are landing;
each merge shrinks the branch diff toward zero.

## Risks / Trade-offs

- [CSRF semantics change under the transport] → S1 controller check makes the
  auto-injected token a known-correct change; request-shape tests pin headers.
- [`$.ajax` quirk parity] → captured Rails request/response fixtures + pinned
  request shapes in S1 commit 2.
- [Consume-back dev-loop tax: homepage devs edit under `frontend/`, apps builds
  gain the prebuild] → same tax component-library charges today; needs explicit
  buy-in from the owning team before S3+ lands (coordination item, not design).
- [NGFP collision: we lift their `core/redux` and merge into the package name
  their branch uses] → coordinate before S0/S1; their stale slice fork is
  superseded by the true move.
- [Integration-branch window: apps' slice keeps evolving on staging until S1
  merges] → keep the window short; S1 is the first implementation PR; watch
  `teacherSectionsRedux.ts` commits during the window.
- [react-router `<Link>`s in moved components] → `react-router-dom` peer +
  `BrowserRouter` wrapper in the standalone host; apps unaffected; a future
  Studio mount inherits the question.
- [Two paradigms in one package (roster Query, home Redux)] → deliberate
  (vision doc: no single internal architecture); reconciliation note added to
  the roster change so the documents don't contradict.
- [Visual suite flake] → determinism contract + stress gate; a flaky check is
  fixed at the contract (root cause), never masked or retried into green.

## Migration Plan

1. **S0** lift `core/redux` (additive; no consumers until S1).
2. **S1** `git mv` slice + selectors + types → package `./redux`; commit 2:
   transport swap + request-shape tests; apps re-registers packaged reducer +
   re-export shim; `portal:` dep + prebuild filter added.
3. **S2** lift + extend `users/redux` `currentUserSlice`.
4. **S3–S5** `git mv` components by tier (leaf → small-seam → entangled),
   apps consuming each back; visual baselines captured per step and pinned
   through seam edits.
5. **S6** standalone host: inject slices, personas + pitfall switcher, MSW
   handlers for slice endpoints — the prototype (built early per D9).
6. **S7 (optional, deferred by default)** Studio route.

Rollback: every step is additive or a reversible move; reverting a PR restores
the prior state because apps consumes whatever the package exports and the
shim preserves all import paths. The legacy Rails entry is never touched.

## Open Questions

- Studio mount (S7): adopt a TanStack-compatible link seam in moved components,
  or keep home apps-hosted until the nav shell migrates?
- Per-endpoint Query convergence order after the move (read-only thunks like
  `asyncLoadTeacherHomepageSectionData` are the safest first candidates).
- Whether `users/redux` sign-off lands before S2 or the package-local fallback
  ships first.
