<!-- Staircase order per design.md. Every moving PR follows the two-commit
     discipline (commit 1 = verbatim git mv citing source SHA; commit 2+ = seam
     edits only) and the visual TDD loop (extend spec → move → capture baselines
     → 12× stress gate → seam edits with zero pixel delta). The prototype (S6)
     is built early on an integration branch per design D9. -->

## 1. S0 — Lift core/redux (PR)

- [x] 1.1 ~~Lift `core/src/redux/` from ngfp~~ — landed upstream on staging via PR #73675 (`injectSlices`, `storeHooks`, `MockStore`/`StateFor`, plus `RootStateProvider`); nothing to do
- [ ] 1.2 Coordinate with NGFP owners on the shared `@code-dot-org/teacher-dashboard` package name (core/redux lift no longer needs coordination — it is theirs, landed)
- [x] 1.3 Core vitest green — covered by the upstream PR's tests

## 2. S1 — Move the teacherSections slice (PR)

- [ ] 2.1 Read the Rails controllers behind the slice's mutation endpoints and record CSRF semantics (ambient token vs exemption) in the PR
- [ ] 2.2 Commit 1: `git mv` staging's `teacherSectionsRedux.ts`, `teacherSectionsReduxSelectors`, `types/teacherSectionTypes` (+ `sectionOrderUtils` if imported) into `frontend/packages/teacher-dashboard/src/redux/`, byte-identical, message citing source paths + SHA
- [ ] 2.3 Commit 2: swap `$.ajax`/`fetch`/`HttpClient` call sites to the core ky transport; strip `@cdo/*` imports; keep wire shapes untouched; no jQuery in the package
- [ ] 2.4 Capture real Rails request/response fixtures; add request-shape tests pinning URL/method/headers/body per thunk, plus error-path parity tests over captured error bodies
- [ ] 2.5 Export the slice from the package `./redux` subpath (`teacherSectionsSlice`, actions, selectors, types); document the transport-not-client convention exception in the package README
- [ ] 2.6 Apps consume-back: add the `portal:` dependency in `apps/package.json`, add the package to `apps/script/build-frontend-dependencies.sh`, re-register the packaged reducer under `teacherSections`, replace the old apps file with the one-line re-export shim, delete the legacy copy
- [ ] 2.7 Apps jest suites touching `teacherSections` still green; `yarn lint:fix` + typecheck + `yarn release:dryrun` green

## 3. S2 — Current-user slice (PR)

- [ ] 3.1 Get users-package owner sign-off (fallback: package-local slice + consolidation note per design D5)
- [ ] 3.2 Lift `users/src/redux/currentUserSlice.ts` from ngfp; extend with the homepage-read fields (`gradesTeaching`, `aiChatAccessLevel`, …) as optionals; add the `./redux` export
- [ ] 3.3 Unit tests for seeding and the extended fields; `yarn release:dryrun` green

## 4. S3 — Move leaf components, tiers 0–1 (PR)

- [ ] 4.1 Author the visual spec harness first: Playwright against the standalone host, strict `toMatchScreenshot` config, determinism contract helpers (frozen clock, font settle, animations off)
- [ ] 4.2 Commit 1: `git mv` the ~11 tier-0/1 files (PermanentPromotions, sectionAvatars/*, EmptyHomepage, SectionDeleteModal, TeacherPromo, constants, …) into `src/home/`
- [ ] 4.3 Capture region baselines for the moved components; pass the 12× stress gate
- [ ] 4.4 Commit 2: locale seam only (English shim or inline per file); `notranslate` on user-generated content; baselines pass with zero pixel delta
- [ ] 4.5 Apps consume-back: replace apps copies with package imports, delete originals; move the components' jest tests to package vitest
- [ ] 4.6 Gates green (lint, typecheck, vitest+axe, build, release:dryrun)

## 5. S4 — Move small-seam components, tier 2 (PR)

- [ ] 5.1 Commit 1: `git mv` the ~10 tier-2 files (SectionCard, SectionCardBody, JoinLink/*, TaskButton, LinkOption, EmptyStateButton, DemoSectionCourseContentDropdown, SkeletonTeacherPromo, …)
- [ ] 5.2 Move/replace their small deps: `teacherSectionTypes` (packaged types), `TeacherNavigationPaths` constants, analytics → `reportEvent` stub seam, `sharedConstants` values, small utils; `react-router-dom` as peer
- [ ] 5.3 Baselines: SectionCard per login type/archived/coteacher/overflow + region checks; 12× gate; zero delta through commit 2
- [ ] 5.4 Apps consume-back + test moves; gates green

## 6. S5 — Move Redux-entangled components (PR, may split in two)

- [ ] 6.1 Commit 1: `git mv` the entangled files (TeacherHomepage, Header, SectionList, SectionOptionsDropdown, ArchiveAllModal, DemoSectionCard, CreateDemoSectionPopup, DemoSectionOptionsDropdown, TeacherHomepageDrawer, TeacherHomepagePopups, OnboardingChecklist + tour hooks, TeacherPromotions, SuggestedLessonLink, …)
- [ ] 6.2 Commit 2: repoint hooks to store-agnostic typed hooks (`MockStore` pattern) and slice imports to `./redux`; flags to the typed host contract; stub cross-tree pulls (AI FAB, NPS, tours/shepherd, GlobalEditionWrapper) behind package seams — apps keeps the real ones
- [ ] 6.3 Remaining `HttpClient`/`UserPreferences` one-liners in components → core transport/preferences calls with request-shape coverage
- [ ] 6.4 Baselines for frame/header/alert-stack/grid/dropdown/dialog/drawer/checklist regions; 12× gate; zero delta through seam commits
- [ ] 6.5 Apps consume-back: `show.js` renders the packaged `TeacherHomepage`; apps copies deleted; one-time side-by-side parity audit vs the live legacy page recorded in the PR
- [ ] 6.6 Gates green

## 7. S6 — Standalone dev host + personas: the prototype (PR; built early on the integration branch)

- [ ] 7.1 MSW handlers + fixtures for every slice/component endpoint not already covered by core mocks (sections CRUD/import, coteacher invites, teaching profile, product tours, drawer data, preferences, demo presets), with write-through where the UI mutates
- [ ] 7.2 Personas per spec (`new-teacher` … `degraded`), each fixing the host-contract flag set; pitfall dimensions seedable by name; expose from `./mocks`
- [ ] 7.3 `main.tsx`: providers + `BrowserRouter` + `injectSlices` + persona/pitfall switcher; `VITE_API_MODE=msw yarn dev` cold-starts under 2s with zero network escapes
- [ ] 7.4 Full region × state visual matrix (~36 checks) green under the 12× stress gate; suite wired into CI for staircase PRs
- [ ] 7.5 Demo walkthrough recorded against the DevEx-pain table (dev-server start, zero backend, edge states by name, package-local vitest)

## 8. Cross-cutting

- [ ] 8.1 Add the reconciliation note to `modularize-teacher-dashboard-roster` design (roster stays Query; Redux is the migration vehicle for moved code)
- [ ] 8.2 Confirm homepage-owning team buy-in on the consume-back dev loop before S3 lands
- [ ] 8.3 Watch staging commits to `teacherSectionsRedux.ts`/`teacherHomepageV2/**` during the integration-branch window; rebase moves onto them
- [ ] 8.4 Package README: boundary, host contract, `./redux` exports, dev-host usage, visual-baseline workflow
- [ ] 8.5 Every PR: lint, typecheck, vitest (+axe), build, `release:dryrun`, visual suite green
