# Design: teacher-dashboard-progress

Hardened 2026-07-04 against source in this checkout. Claims below carry
file:line evidence; unknowns are marked `BLOCKED-EVIDENCE` with the exact
capture needed. Two prior-inventory claims are CORRECTED here (teacher
scores, teacher panel — see Corrections).

## Source files and ownership

All under `apps/src/` unless noted. Ownership: `move` = extracted into the
package (dual-copy where shared); `shared-dep` = consumed via
adapter/bridge, not forked.

| File | Role | Plan |
| --- | --- | --- |
| `templates/sectionProgressV2/SectionProgressV2.jsx` | root; effects call `loadUnitProgress` | move |
| `templates/sectionProgressV2/sectionProgressLoader.js` | data loader (see API table) | move (transport adapter) |
| `templates/sectionProgressV2/sectionProgressRedux.js` | grid slice | move (page-scoped) |
| `templates/sectionProgressV2/ProgressTableV2.jsx`, `StudentColumn.jsx`, `LessonProgressColumnHeader/DataColumn.jsx`, `ExpandedProgressColumnHeader/DataColumn.jsx`, `LevelDataCell.jsx`, `LessonDataCell.jsx`, `LevelProgressHeader.jsx`, `ProgressIcon.jsx`, `SkeletonProgressDataColumn.jsx`, `LessonTitleTooltip.jsx` | grid | move |
| `templates/sectionProgressV2/IconKey.jsx`, `LegendItem.jsx`, `LevelTypesBox.jsx`, `AssignmentCompletionStatesBox.jsx`, `TeacherActionsBox.jsx` | legend/actions | move |
| `templates/sectionProgressV2/MoreDetailsDialog.jsx`, `MoreOptionsDropdown.jsx` (DSCO ActionDropdown), `MetadataHelpers.jsx`, `LockedLessonUtils.jsx`, `sectionProgressConstants.js` | dialogs/utils | move |
| `templates/sectionProgressV2/DownloadProgressCsv.tsx` | client-side CSV (Blob; deliberate non-react-csv, comment at :209) | move |
| `templates/sectionProgressV2/floatingHeader/FloatingHeader.jsx`, `floatingScrollbar/FloatingScrollbar.jsx` + `scrollbarUtils.jsx` | floating chrome | move |
| `templates/progress/progressHelpers.js` (`processedLevel`, `processServerSectionProgress`, `lessonProgressForSection`) | payload post-processing | shared-dep: used by loader AND overview/public pages — extract these three pure functions with unit-test parity (program C1 rule), do not fork the module |
| `code-studio/lessonLockRedux.js` | lock state + `/api/lock_status` | move (page-scoped, shared with overview change's store module) |
| `redux/unitSelectionRedux.js` | unit selection | move as-is into the store module (recorded asymmetry with text-responses) |
| `code-studio/viewAsRedux.js` | view-as | shared-dep via store module; no API on this tab |

## API and mutation table

Auth on all: session cookie (`credentials: 'include'`); CanCan section
scoping server-side.

| # | Method + path | Params | Consumed response fields | Side effects / notes |
| - | --- | --- | --- | --- |
| 1 | GET `/dashboardapi/script_structure/courses/:courseId/units/:unitPosition` | path only | `id, csf, isCsd, isCsp, title, path, lessons[].levels[] (incl. bonus), family_name, version_year, name` (filter list at loader:117-130; bonus levels dropped unless `sectionData.lessonExtras`, loader:142-145) | none |
| 2 | GET `/dashboardapi/section_level_progress/:sectionId` | query `script_id`, `page`, `per=20`; client fans out `ceil(students/20)` parallel page requests (loader:71-92) | `student_progress` (via `processServerSectionProgress`), `student_last_updates` | none |
| 3 | GET `/api/lock_status` | query `script_id` (lessonLockRedux:327-331; NOTE sectionId is dispatch-side only, not sent) | lock status per lesson/student | none |
| 4 | POST `/api/lock_status` | JSON `{updates: [{user_level_data, locked, readonly_answers}]}` (lessonLockRedux:203-226); only changed rows sent | — | mutates user-level lock state. Sent via `$.ajax`; BLOCKED-EVIDENCE: confirm the CSRF header mechanism for legacy `$.ajax` writes (jQuery prefilter vs rails-ujs) by capturing one legacy POST's request headers at runtime before the adapter is written |
| 5 | CSV download | none — client-side Blob built from loaded grid state (`level_progress_<unit>.csv`, `lesson_progress_<unit>.csv`, DownloadProgressCsv.tsx:124,186,209-227) | — | no server endpoint; parity = generated file content equality |

Response body shapes for #1-#3: BLOCKED-EVIDENCE — capture JSON from a
local Rails run (seeded section with progress; small and >20-student
sections for #2's pagination) before authoring Zod schemata. The consumed
field lists above are the minimum the schema must carry.

## Corrections to prior planning

- `teacher_scores`: routes exist (`dashboard/config/routes.rb:1295-1296`)
  but `grep -r teacher_scores apps/src` has ZERO client references. It is
  NOT part of progress V2 parity. Dropped from scope. One blocking task
  re-confirms the grep at implementation time.
- Teacher panel: no references in `templates/sectionProgressV2/` — it is
  level-page UI, not a dashboard-progress surface. Dropped from scope.
- No DCDO/experiment reads inside `sectionProgressV2/` files (grep clean).
  The only gates touching this tab are route-level: GE wrapper
  (`GlobalEditionWrapper` componentId `SectionProgressV2`,
  TeacherNavigationRouter:217-221) and the empty-state matrix
  (Router:213-215).

## Scenario matrix

Oracle key: J = sectionProgressV2 jest suite (24 files), C =
`teacher_dashboard_progress_v2.feature`, P = `fa-teacher-dashboard.spec.ts`,
S = source cited above.

| Scenario | Flags | Section/fixture shape | Expected UI | Oracle |
| --- | --- | --- | --- | --- |
| populated-small | none | ≤20 students, unit w/ progress | grid, 1 progress request page | J, C |
| populated-large | none | >20 students (e.g. 45 → 3 pages) | identical grid; parallel page fan-out merges | S(loader:71-92), J |
| zero-students | none | studentCount 0 | no-students empty page | C, Router:213 |
| no-progress | none | students, `anyStudentHasProgress` false | no-curriculum empty page | Router:214 |
| lesson-extras-on | none | section.lessonExtras true | bonus levels included in columns | S(loader:142-145), J |
| lesson-extras-off | none | lessonExtras false | bonus levels filtered out | S |
| refresh-path | none | data already in slice for unit | UI stays; `startRefreshingProgress` silent update | S(loader:29-45), J |
| unit-switch | none | multi-unit assignment | reload per selected unit (unitSelection) | J |
| locked-lesson | none | lockable unit, locked lesson | lock icons/dialog; GET/POST #3/#4 round-trip | J, C |
| view-as | none | any populated | student-perspective links; no API call | S, J |
| csv-download | none | populated | Blob CSV content equals legacy for same state | S(DownloadProgressCsv) |
| ge-region | GE region set (fa) | populated | component hidden per GE wrapper | P |
| skeleton-loading | none | slow fixture | `#ui-test-skeleton-progress-column` then grid | C (`local_nav_v2` waits on it) |
| error | none | endpoint 500 | retriable error state (resilience-ux carve-out, recorded + masked) | resilience spec |

## Gate table

| Surface | Gate | Detail |
| --- | --- | --- |
| grid, legend, floating chrome | behavior + copy + a11y; NO pixel | custom legacy grid (`progress-table-v2.module.scss`), non-DSCO. The @eyes scenarios in C re-express as structural assertions (element presence/order), not pixel diffs |
| floating header/scrollbar | behavior | pinned positions asserted at defined scroll offsets (tests, not screenshots) |
| CSV | content equality | generated file diff vs legacy for identical state |
| performance | non-regression | populated-large fixture; render + unit-switch timings, candidate vs legacy, same machine (program M6) |
| a11y | axe + keyboard per scenario | dialogs (lock, more-details) keyboard-complete |
| responsive (desktop/laptop) | behavior | common desktop widths, 200% zoom, split-screen, narrow laptop: no overlap/unusable controls; the grid scrolls in its own container (floating scrollbar) rather than breaking the page. Tablet/mobile parity NOT required; no fixed page widths baked into the feature root |

## Design-system mapping (executed by the modernization pass, not here)

Verified imports: fontAwesomeV6Icon ×8, @mui ×7, DSCO dropdown ×2
(`MoreOptionsDropdown` already DSCO ActionDropdown), DSCO modal ×1,
react-tooltip ×1, `skeletonize-content` ×3.

| Legacy | Target |
| --- | --- |
| custom grid table (`progress-table-v2.module.scss`) | stays custom (no DSCO primitive fits a virtualized progress grid); tokens migrate to semantic CSS vars |
| react-tooltip (`LessonTitleTooltip`) | DSCO tooltip |
| `skeletonize-content.module.scss` | MUI Skeleton |
| MUI buttons/typography already present | keep |
| `MoreDetailsDialog` legacy dialog chrome | DSCO dialog |
| DSCO ActionDropdown, fontAwesomeV6Icon | keep |

## Frontend structure intent

Per the program architecture report
(`sdd-experiment/openspec/teacher-dashboard-frontend-architecture-report.md`):

- Package boundary: UI lands in
  `packages/teacher-dashboard/src/features/progress/` (components +
  `fixtures/` scenario compositions), with a lazy entry Studio's route
  imports — the progress chunk (including its heavy grid code) must not
  enter the shell entry chunk. The progress endpoints (#1-#3) live in
  CORE as DashboardApi domains
  (`core/src/api/dashboard/...` — api/keys/query/schemata/types; exact
  domain naming finalized against the owning Rails controllers), per the
  human ruling that DashboardApi is the general dashboard backend wrapper
  client even for single-consumer endpoints. The feature consumes the
  typed hooks; it owns no backend contract code. Default MSW handlers
  ride with the core domains; the feature's `fixtures/` only compose
  scenarios over them.
- State boundary: the transitional store module lives in
  `legacy/progress-store/` (built by the course-unit-overview change,
  extended here with `sectionProgress` + `unitSelection`); hydrated only
  through `legacy/bridge.ts` (one-way, Query → store). Nothing outside
  `features/progress/` imports it. The loader moves into the feature's
  api layer with its `$.ajax`/fetch call sites rewritten onto the
  transport (request shapes preserved — the one structurally required
  rewrite besides the route wrapper).
- Shared-dependency boundary: the `progressHelpers` trio extracts to
  `shared/` with unit-test parity (non-dashboard consumers keep the
  legacy module); GE wrapper equivalent lives in `shared/` once its
  BLOCKED-EVIDENCE mechanism resolves. Dual copies get rows in
  `docs/legacy-mirror.md` in the same commit.
- Modernization boundary: move commits do not restyle; the DS mapping
  table below executes in a later modernization pass. The
  two-`unitSelection` asymmetry (shared/ URL-state form vs this store's
  moved slice) converges there too.

## Decisions (unchanged from the prior revision where still valid)

- Sub-splits (a) read-only grid, (b) floating chrome, (c) lock/view-as/
  dialog, each independently landable. Store module extends the overview
  change's module; `unitSelection` moves as-is (asymmetry with
  text-responses recorded).
- Loader's `logToCloud.addPageAction` latency events
  (LoadScriptProgressStarted/Finished, loader:40-44,97-102) are carried
  across with the same event names (analytics/observability parity).

## Open questions (each has a blocking task)

- BLOCKED-EVIDENCE (API #1-#3 response shapes): runtime JSON capture from
  local Rails, small + large sections, before schemata.
- BLOCKED-EVIDENCE (API #4 CSRF mechanism for `$.ajax`): capture legacy
  POST request headers.
- BLOCKED-EVIDENCE (GE candidate mechanism): confirm how the candidate
  reads the region (legacy: `<html data-ge-region>` set by Rails layout;
  the Studio HAML shell must expose the same signal or an API equivalent)
  — inspect `FrontendStudioController` layout output under a GE region
  before implementing the wrapper.
