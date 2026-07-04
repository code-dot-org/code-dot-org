# Design: teacher-dashboard-settings

Hardened 2026-07-04 against source in this checkout. Two prior claims are
CORRECTED (delete flow; course-offerings endpoint). Unknowns are marked
`BLOCKED-EVIDENCE` with the capture needed.

## Source files and ownership

The tab is an 88-line wrapper; the form is the section-setup container
shared with the creation flow. That sharing is the central design fact.

| File | Role | Plan |
| --- | --- | --- |
| `apps/src/templates/teacherNavigation/DashboardSectionSettings.tsx` (88 lines) | wrapper: loading gate (`isLoadingSectionData \|\| needsReload \|\| urlSectionId !== selectedSection.id`, :31-37), react-router `useBlocker` + `beforeunload` dirty-navigation guard (:17-20,39-53), DSCO `Modal` save-blocker (:67-83) | rewrite thin (it is host-router-coupled by nature; TanStack Router has its own `useBlocker`) — blocker evidence recorded: `react-router-dom` `useBlocker` cannot move to a TanStack host |
| `apps/src/templates/sectionsRefresh/SectionsSetUpContainer.jsx` | owns form state, native `form.checkValidity()` validation (:230-236), save fetch (:264-300), redirect (`navigateToHref`, full-page) | move (dual-copy: creation flow keeps the legacy copy) |
| `sectionsRefresh/LoadingSectionsSetUpContainer.tsx` | loading shim | move |
| `sectionsRefresh/SingleSectionSetUp.jsx` (`#uitest-section-name-setup` :68), `AdvancedSettingToggles.jsx`, `GradeLevelChips.jsx`, `CurriculumQuickAssign.jsx` + `CurriculumQuickAssignTopRow.jsx`, `QuickAssignTable.jsx` + `QuickAssignTableHelpers.jsx` + `QuickAssignTableHocPl.jsx`, `VersionUnitDropdowns.jsx` | form sections | move (dual-copy set) |
| `sectionsRefresh/coteacherSettings/*` | coteacher manage UI | move |

## API and mutation table

| # | Method + path | Params / body | Auth/CSRF | Side effects / notes |
| - | --- | --- | --- | --- |
| 1 | PATCH `/api/v1/sections/:id` | JSON `section_data`: `login_type` (edit: fixed to `section.loginType`, :223-225), `participant_type`, `course_offering_id`, `course_version_id`, `unit_id`, `restrict_section`, `lesson_extras`, `pairing_allowed`, `tts_autoplay_enabled`, `sharing_disabled`, `grades` (forced `['pl']` when participantType ≠ student, :244-245), `instructor_emails`, plus `...section` spread (:247-261) | `X-CSRF-Token` from meta tag (:238-242). NOTE: the server currently SKIPS CSRF verification on this exact action (`sections_controller.rb:9`); the candidate keeps sending the token; retirement of the skip is `teacher-dashboard-api-hygiene` | on success: full-page `navigateToHref(origin + redirectUrl)` (:283-295); `COTEACHER_INVITE_SENT` analytics per added coteacher (:275-280) |
| 2 | GET `/course_offerings/quick_assign_course_offerings` | query `participantType` (`CurriculumQuickAssign.jsx:90`) | cookie | CORRECTED: prior planning assumed `valid_course_offerings`; the settings/creation form actually uses this endpoint. Response shape BLOCKED-EVIDENCE (runtime capture per participantType) |
| 3 | GET `/api/v1/section_instructors/check` | query `email` (`coteacherSettings:74`) | cookie | validates candidate coteacher |
| 4 | POST `/api/v1/section_instructors` | body BLOCKED-EVIDENCE (capture legacy request; `coteacherSettings:105`) | token expected | creates invite |
| 5 | DELETE `/api/v1/section_instructors/:id` | path (`coteacherSettings:33`) | token expected | removes coteacher/invite |

## Corrections to prior planning

- DELETE-section is NOT on this tab: zero `delete` hits in
  `DashboardSectionSettings.tsx` / `SectionsSetUpContainer.jsx` /
  `SingleSectionSetUp.jsx`. Section delete lives on the homepage options
  dropdown (`SectionDeleteModal`). The prior "delete with confirmation"
  requirement is removed; a blocking task confirms at runtime that the
  legacy settings tab exposes no delete affordance.
- Course offerings come from `quick_assign_course_offerings` (API #2), not
  `valid_course_offerings`.

## Scenario matrix

Oracle key: C = `teacher_dashboard_local_nav_v2.feature` "Modifying
settings" scenario (grades[] input, `UI Test CSF` checkbox, save → progress
with renamed section in sidebar dropdown), S = source cited above.

| Scenario | Flags | Fixture shape | Expected UI | Oracle |
| --- | --- | --- | --- | --- |
| edit-and-save | none | student section, assigned course | form prefilled from `sectionToBeEdited`; save PATCHes #1; full-page redirect to progress destination | C, S |
| pl-section | none | participant_type facilitator/teacher | grades forced `['pl']` in payload; PL quick-assign table (HocPl) | S(:244-245) |
| login-type-fixed | none | any | login_type not editable on edit path (from section, not query) | S(:223-225) |
| validation-failure | none | empty required field | native validity report; save aborted; no request | S(:230-236) |
| save-blocker | none | dirty form, in-app navigation | DSCO Modal (continue/cancel); `beforeunload` armed for hard nav | S(:39-53,67-83) |
| loading-gate | none | `needsReload` or URL/section mismatch | LoadingSectionsSetUpContainer until settled | S(:31-37) |
| coteacher-add/remove | none | section w/ coteacher slots | check→add→remove round-trip via #3-#5 | S |
| locale-versions | locale ≠ en-US | course w/ multiple versions | version dropdown filtered as legacy | BLOCKED-EVIDENCE: pin the filtering rule from `VersionUnitDropdowns.jsx` before writing the fixture |
| error | none | PATCH 4xx/5xx | save error path (`setIsEditInProgress(true)` restored, :297-299) + resilience carve-out | S |

## Gate table

| Surface | Gate | Detail |
| --- | --- | --- |
| form (all sections), save-blocker modal | pixel | DSCO/MUI-era TSX/JSX with DSCO Modal; capture regions: full form (per participant type), open save-blocker modal; masks: section name text |
| save/redirect flow | behavior | PATCH body field-equality vs recorded legacy request; redirect URL via shell map |
| validation, blocker semantics | behavior | native validity + blocker tests |
| a11y | axe + keyboard | form completable by keyboard; modal focus-trapped |
| copy | en-US verbatim | incl. `saveBlockerModalTitle/Description` i18n keys |

## Design-system mapping

| Legacy | Target |
| --- | --- |
| DSCO `Modal` (save blocker), DSCO inputs already present | keep |
| legacy buttons in form sections | MUI Button |
| `GradeLevelChips` custom chips | DSCO segmentedButtons or MUI Chip — decide at modernization with design review; wrapper keeps legacy chips during the move |
| quick-assign tables (custom) | stay custom through the move; modernization maps to MUI Table |

## Frontend structure intent

Per the program architecture report
(`sdd-experiment/openspec/teacher-dashboard-frontend-architecture-report.md`):

- Package boundary: the moved form set lands in
  `packages/teacher-dashboard/src/features/settings/`; the rewritten
  wrapper is this feature's `index.ts` entry (route wrappers are one of
  the three structurally-required rewrites — react-router `useBlocker`
  cannot cross into the TanStack host). API placement splits: the PATCH
  save and `quick_assign_course_offerings` wrappers are package-local
  (`features/settings/api/`); the coteacher `section_instructors`
  endpoints go to CORE (`dashboard/sectionInstructors/`) because the
  homepage change consumes them too — the one cross-feature domain this
  change touches.
- State boundary: Query-only. No transitional store — form state is
  component-local, exactly as legacy holds it inside
  `SectionsSetUpContainer`. Loading gate reads the shell's
  selected-section query hooks.
- Shared-dependency boundary: the `sectionsRefresh/` form set is the
  program's largest dual copy after roster; every copied file gets a
  `docs/legacy-mirror.md` row (copied-at SHA, owner, resolution =
  creation-flow migration inherits the moved copy).
- Modernization boundary: move commits do not restyle; the
  `GradeLevelChips`/quick-assign-table mappings below execute in a later
  pass, pixel baselines captured against the moved (unrestyled) form.

## Decisions

- D1. The wrapper is re-implemented against TanStack Router's blocker API
  (the one sanctioned rewrite here — evidence: `useBlocker` is
  react-router-specific); everything below it moves.
- D2. Redirect-on-save resolves the `progress` destination through the
  shell per-tab map; the legacy full-page `navigateToHref` becomes an
  in-shell navigation when the target is a candidate route.
- D3. The dual-copy of `sectionsRefresh/` form components is the largest
  shared-copy in the program after roster; ledger entry with owner; the
  creation flow migration (not in this program) inherits the moved copy.

## Open questions (each has a blocking task)

- BLOCKED-EVIDENCE (API #2 response shape per participantType): runtime
  capture.
- BLOCKED-EVIDENCE (API #4 request body): capture legacy coteacher-add.
- BLOCKED-EVIDENCE (PATCH #1 response body + full request from a real
  save): capture one legacy save round-trip; the `...section` spread makes
  the effective payload wider than the explicit field list — the recorded
  request is the contract, not the source list alone.
- BLOCKED-EVIDENCE (version filtering rule): read
  `VersionUnitDropdowns.jsx` + capture per-locale offerings before the
  locale-versions fixture.
- Runtime confirm: legacy settings tab exposes no delete affordance.
