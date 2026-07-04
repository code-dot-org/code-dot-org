# Design: teacher-dashboard-homepage-v2

## Context

Legacy homepage: `TeacherHomepage.tsx` renders inside either the bare
zero-section mount or `TeacherNavigationRouter`'s `home` route
(`show.js:99-109`). Server data arrives three ways: (1) HAML
`data-dashboard` JSON — sections, sectionOrder, providers, DCDO flags,
personalization-quiz flag, flash, logoTransitionEnabled; (2) redux thunks at
mount — `asyncLoadTeacherHomepageSectionData`, `asyncLoadCoteacherInvite`;
(3) direct fetches — `/teaching_profile_data`, essential-AI dependency,
UserPreferences, `get_drawer_data` (popups), product tours, suggested
lesson per card. The component tree is already DSCO/MUI (Alert, dropdown,
modal, MUI Typography) with SCSS modules.

The shell change provides: the package, the candidate `home` route (as
placeholder), `GET /api/v1/teacher_dashboard/sections`, core sections
mocks, and the visual-parity harness.

## Goals / Non-Goals

**Goals:**

- Candidate `/frontend-studio/teacher_dashboard/home` at behavioral, visual
  (pixel, DSCO surfaces), a11y, and copy parity with legacy
  `/teacher_dashboard/home` under the default flag state.
- All homepage server data over HTTP APIs; zero SSR script injection.
- Homepage scenarios runnable offline in the standalone dev shell.

**Non-Goals:**

- Demo-section treatment arm, onboarding checklist + tours (gated on a demo
  section existing), skills dashboard, student snapshot. Re-inclusion is a
  human product-scope decision.
- No rewrite of section-setup pages (`sectionsRefresh/`), OAuth roster
  dialogs, or the personalization quiz page — the homepage links to them at
  their legacy URLs.
- No fixing of legacy quirks without a ruling: TOS auto-accept, drawer GET
  side effect (see Decisions/Open Questions).

## Decisions

### D1. Port the component tree; replace the data spine

The `teacherHomepageV2/` components move into the package essentially
as-is (they are TS + DSCO/MUI already); `git mv`-style extraction with
import adaptation, not a rewrite. What changes is the spine: redux
(`teacherSections`, `currentUser`) is replaced by TanStack Query hooks fed
from the shell's sections query plus the new home endpoint. Components that
deep-import `@cdo/apps` singletons (`UserPreferences`, `HttpClient`,
`analyticsReporter`, `experiments`, `DCDO`, `@cdo/locale`) get package-local
adapters with the same call signatures, backed by core equivalents. Blocker
evidence for any component that cannot move verbatim is recorded in the
task log (the rewrite-vs-move rule).

### D2. One home endpoint for HAML scalars; adjacent endpoints reused

`GET /api/v1/teacher_dashboard/home` returns exactly the non-section scalars
the HAML `:ruby` block computes: `providers`, `showAITALessonSummary`,
`showAITAPodcasts`, `hasCompletedPersonalizationQuiz`,
`logoTransitionEnabled`, and the flash payload. Field-equivalence tests
diff the endpoint against the HAML expressions for seeded users.
Alternatives — stuffing these into the sections bootstrap (couples homepage
concerns into every shell consumer) or per-scalar endpoints (chatty) —
rejected. The page-adjacent endpoints (`get_drawer_data`,
`/teaching_profile_data`, product tours, dismiss-banner, suggested lesson,
coteacher invites, section archive/delete) are consumed through typed core
wrappers with recorded-JSON schemata and MSW handlers; no new Rails code
for them.

### D3. Flash relay drains through the home endpoint

Legacy relays Rails flash into a 6-second toast via `data-dashboard`. The
candidate cannot read server flash without SSR, so the home endpoint
returns and clears (drains) the pending flash for the current session —
same read-once semantics the HAML render has today, now explicit. The
drain-on-GET is documented as intentional and scoped to this endpoint.

### D4. Logo transition adapts to the Studio header

Legacy gates the morph on brand + DCDO (server) and a
`hide_codeai_logo_transition` cookie (client), and pre-hides the Rails
header logo with an inline `<style>` in `<head>`. Candidate: the DCDO+brand
gate arrives as `logoTransitionEnabled` from the home endpoint; the cookie
gate ports unchanged; the pre-hide is re-implemented against Studio's own
header (Studio controls its first paint, so a HAML `<style>` hack is
unnecessary — the header logo starts hidden when the gate is on). Both
gates MUST be honored; the animation targets Studio's header logo element.

### D5. HAML-level partials get explicit dispositions

- Section-creation celebration dialog (`?showSectionCreationDialog`):
  ported; query-param driven, no server dependency.
- TOS interstitial for teachers who have not accepted latest terms:
  ported as a candidate component driven by the current-user payload. The
  legacy silent `update_user_tos_version_accept` during render is NOT
  reproduced by default; the candidate records acceptance only on explicit
  dismissal. This is a deliberate, human-visible deviation logged as an
  open question — if product rules the legacy behavior must persist, the
  candidate calls an explicit accept endpoint on mount instead.
- Admin partial (`home/_admin`): not ported in this change; admins see the
  candidate homepage without the admin block, and the disposition is
  recorded. Legacy remains available.

### D6. Visual parity is pixel-gated; loading states are masked

The homepage is a DSCO/MUI surface, so pixel parity is part of this
change's contract. Named comparison surfaces (see spec): section list with
cards, empty homepage (teaching and archived views), alerts region,
promotions region, and each section-lifecycle modal. Loading skeletons and
error pages are pre-approved intentional deviations — allowed only when
recorded per scenario and masked out of diffs. Analytics events named in
the legacy component (teacher login, homepage visited, toggle clicks) are
carried across with the same event names so funnels do not go dark.

## Risks / Trade-offs

- [Drawer popups depend on `get_drawer_data`, whose GET mutates
  interstitial timestamps] → reuse as-is through a typed wrapper; document
  the side effect at the call site; converting to POST is a separate
  improvement change.
- [Coteacher invite + section mutations touch `teacherSectionsRedux`
  behaviors (e.g. invite refresh, archive updating the list)] → those
  behaviors are re-expressed as Query invalidations; the legacy jest suite
  (`teacherHomepageV2` 26 files, `teacherSectionsReduxTest.js`) is the
  behavior oracle during porting.
- [Copy parity: several alert strings are hardcoded English in legacy
  (verification alert)] → port verbatim; do not localize opportunistically
  (that is a product change).
- [Logo-transition timing differs between Rails header and Studio header] →
  the animation is time-based, not layout-critical; masked in pixel diffs;
  behavior scenario asserts gate logic, not animation frames.

## Migration Plan

Phased inside one change, matching the program's split guidance:

1. Read-only slice: section list, cards, empty states, toggle (bootstrap +
   home endpoints only).
2. Section lifecycle: options dropdown, edit/archive/delete/archive-all,
   celebration dialog.
3. Engagement surfaces: alerts, coteacher invite, promotions, logo
   transition.
4. Popups: drawer set (school info, NPS, AFE), flash relay, TOS disposition.

Each phase lands behind the candidate-only route; rollback is reverting
additive commits. Legacy stays authoritative until a human cutover
decision.

## Open Questions

- TOS auto-accept: candidate defaults to explicit-dismissal acceptance
  (deviation); needs product ruling before cutover.
- Admin partial: confirm admins can rely on legacy until a dedicated
  disposition; otherwise scope a minimal candidate admin block.
- Flash drain endpoint semantics vs multiple concurrent tabs: acceptable
  read-once behavior matches legacy single-render, but verify no popular
  flow round-trips flash through two loads.
