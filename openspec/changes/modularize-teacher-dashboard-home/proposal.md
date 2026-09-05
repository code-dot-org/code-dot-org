## Why

The Teacher Dashboard **home page** (`teacherHomepageV2`, ~41 files + a ~1.4k-line
`teacherSections` Redux slice) lives in the legacy webpack bundle: a ~102s dev
server, a full Rails+DB stack to render anything, edge states (coteacher invites,
archived-only lists, promo/campaign variants, degraded endpoints) that are nearly
impossible to conjure, and hidden host dependencies (gon-fed user state, ambient
CSRF, global store). The V2 UI itself is modern (TS function components,
design-system + MUI), so the surface can be **reorganized into a
`frontend/` package by moving code, not rewriting it** — the
`ngfp/music-lab-updated` branch proved the enabling mechanism (package-owned
Redux slices via `injectSlices`) but executed it as a stale copy; this change
does it as a true move with one source of truth.

## What Changes

- **Lift `core/redux`** (`injectSlices`, `storeHooks`, `MockStore` typing) from
  `ngfp/music-lab-updated` into `@code-dot-org/core` on staging.
- **Move (git mv) staging's `teacherSectionsRedux`** + selectors + types into
  `@code-dot-org/teacher-dashboard/redux`; swap its `$.ajax`/`fetch`/`HttpClient`
  call sites to the core ky transport (CSRF auto-injection, `ApiError`
  normalization, wire shapes untouched). Apps re-registers the packaged reducer
  and keeps a one-line re-export shim at the old path — no repo-wide codemod,
  no duplicate slice.
- **Lift + extend `users/redux` `currentUserSlice`** (add `gradesTeaching`,
  `aiChatAccessLevel`, and other homepage-read fields); hosts seed it
  explicitly, replacing the implicit gon→`SET_INITIAL_DATA` dependency.
- **Move (git mv) the `teacherHomepageV2` component tree** into the package in
  tiers (leaf → small-seam → Redux-entangled); Redux component code moves
  verbatim with only import lines repointed. Seams: English strings
  (`@cdo/locale` deprecated; core dynamic translation renders them,
  `notranslate` on user-generated content), typed host contract for DCDO/
  experiment flags, stubbed `reportEvent` analytics seam, cross-tree pulls
  (AI FAB, NPS, tours, GlobalEditionWrapper) stubbed.
- **Standalone dev host** (`main.tsx` + MSW + injected slices) with a
  persona/pitfall switcher — the visual prototype demonstrating the DevEx wins
  (sub-second dev server, zero backend, every edge state one click away).
- **Visual baselines as TDD**: strict region-scoped screenshot tests
  (zero-diff budget, 12×-consecutive-run stress gate) captured after each
  verbatim move and pinning zero pixel delta through every seam edit.
- Two-commit discipline per moving PR: commit 1 = pure `git mv` (byte-identical,
  cites source SHA); commit 2+ = seam edits only.

**Not** in this change: migrating the production `/teacher_dashboard/home` URL
(legacy page stays authoritative; apps consumes the moved code back, so
production behavior is preserved by the same files); a Studio route for the home
page (react-router-in-TanStack question deferred); Redux→Query convergence
(the roster's Query layer stays as-is — two paradigms in the package is
deliberate); porting the nav shell or its tabs.

## Capabilities

### New Capabilities
- `core-redux-injection`: dynamic slice injection in `@code-dot-org/core` —
  one `combineSlices` store, package-owned slices on `./redux` subpaths, typed
  hooks via `storeHooks`, cross-package state typing via `MockStore`/`StateFor`.
- `teacher-sections-state`: the packaged `teacherSections` slice — state shape
  and thunk behavior parity with the legacy slice, transport-backed HTTP with
  pinned request shapes, apps consume-back via re-export shim + reducer
  re-registration.
- `current-user-state`: the `@code-dot-org/users/redux` `currentUserSlice` —
  host-seeded current-user state covering the fields teacher surfaces read.
- `teacher-homepage-module`: the moved home page — behavior parity with
  `teacherHomepageV2` for every state, rendered from the package in both hosts
  (apps consume-back and standalone), with the flag host contract, analytics
  stub, English strings + `notranslate` rules.
- `teacher-homepage-dev-host`: the standalone MSW dev host — personas and
  pitfall states (promotions, drawer campaigns, section-list edges, alert
  stacking) seedable by name, boot with zero backend.
- `teacher-homepage-visual-baselines`: the visual regression harness — strict
  region-scoped screenshot checks over the region × state matrix, determinism
  contract, stress gate, zero-pixel-delta rule for mechanical edits.

### Modified Capabilities
<!-- None — openspec/specs/ is empty; the roster change's capabilities are
     unarchived and unaffected (roster stays Query; a reconciliation note in
     that change's design is a docs-only follow-up). -->

## Impact

- **New/moved code**: `frontend/packages/core/src/redux/**` (lifted);
  `frontend/packages/teacher-dashboard/src/{redux,home,mocks,host}/**` (moved +
  new host/mocks); `frontend/packages/users/src/redux/**` (lifted + extended).
- **Modified code**: `apps/src/templates/teacherDashboard/teacherSectionsRedux.ts`
  becomes a re-export shim; apps' store registration for the packaged reducer;
  `apps/src/templates/studioHomepages/teacherHomepageV2/**` files replaced by
  package imports as tiers move; `apps/package.json` gains the
  `portal:` dependency and `build-frontend-dependencies.sh` gains the filter.
- **APIs consumed**: unchanged Rails endpoints (sections CRUD/import,
  coteacher invites, teaching profile, product tours, drawer data, preferences,
  demo sections); no backend changes.
- **Dependencies**: package gains `@reduxjs/toolkit`/`react-redux` (peer),
  `react-router-dom` (peer, `<Link>`s in moved components); jQuery is **not**
  carried into the package.
- **Coordination**: NGFP owners (`core/redux` lift + shared package name);
  users-package owners (D5 slice extension); homepage-owning team
  (consume-back dev loop: edits move under `frontend/`, apps builds gain the
  package prebuild).
