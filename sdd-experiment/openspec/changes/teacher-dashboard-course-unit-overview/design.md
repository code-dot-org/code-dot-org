# Design: teacher-dashboard-course-unit-overview

## Context

`TeacherCourseOverview` / `TeacherUnitOverview` live in
`apps/src/templates/courseOverview/` and
`apps/src/code-studio/components/progress/`, shared with public course
pages. They read `progressRedux`, `announcementsRedux`,
`hiddenLessonRedux`, `viewAsRedux`, and lesson-lock state — the deepest
redux coupling before progress itself. Route shapes carry optional params
(`:courseVersionName?`, `:unitName?`) and the nested unit path.

## Goals / Non-Goals

**Goals:** the three overview routes at behavior/copy/a11y parity,
including MODULARITY both-arms, announcements, hidden lessons, view-as,
lesson lock; the progressRedux port that progress (13) reuses.

**Non-Goals:** no changes to public course pages (dual-copy); no pixel
gate (legacy shared JSX); no curriculum-authoring affordances.

## Decisions

- D1. Move-not-rewrite with page-scoped stores: `progressRedux` +
  `announcements`/`hiddenLesson`/`viewAs` slices move together as one
  scoped store module (they interlock); bridge to shell Query state for
  section/user. Progress (13) mounts the same store module — build it here
  once.
- D2. Route params: TanStack routes mirror the optional-param shapes with
  underscore-free legacy segments preserved (`courses/...`, `unit/...`);
  the AccessDenied `params[:path]` rewrite branches (`courses`, `unit`→`s`)
  that the shell recorded as out-of-scope land HERE: the candidate
  reproduces the legacy redirect behavior for these routes when a teacher
  loses access.
- D3. MODULARITY is a sidebar-link concern (shell owns the swap) plus a
  route-availability concern (both overview shapes exist regardless of the
  arm) — scenarios pin both arms.
- D4. Lesson lock and view-as mutate teacher panel/lock state through the
  same legacy endpoints, wrapped and recorded like every mutation.

## Hardening addendum (2026-07-04)

Endpoints pinned this session:

| Method + path | Evidence | Notes |
| --- | --- | --- |
| GET `/s/:scriptName/hidden_lessons` | `hiddenLessonRedux.js:196-198` | hidden-lesson state load |
| POST `/s/:scriptName/toggle_hidden` | `hiddenLessonRedux.js:175-177` | hide/show mutation (`$.ajax`; CSRF mechanism shares the progress change's BLOCKED-EVIDENCE capture) |
| GET `/dashboardapi/script_structure/courses/:courseId/units/:unitPosition` | progress change API #1 | same core wrapper |
| GET `/dashboardapi/unit_summary/:courseName/:unitPosition` | `UnitCalendar.tsx:104` (calendar change) | if the overviews consume unit_summary too, reuse that core wrapper — BLOCKED-EVIDENCE: confirm the overviews' exact data calls (announcements source included) from `TeacherCourseOverview`/`TeacherUnitOverview` before wrappers |

All wrappers in CORE DashboardApi (human ruling); the feature owns
fixtures only; overview entries lazy-load outside the shell chunk.

Additional gate row — responsive (desktop/laptop): overview content
reflows at common desktop widths, 200% zoom, split-screen, narrow laptop.
Tablet/mobile parity NOT required.

## Risks / Trade-offs

- [Shared-component dual copy is the largest yet (overview trees)] → same
  time-boxed dual-copy policy; ledger entry; the modernization pass decides
  the long-term shared home.
- [progressRedux port here under-serves progress's needs] → progress (13)
  is the second consumer in the same program increment; its requirements
  are visible now (three slices, grid) and reviewed against this design
  before this change implements.

## Migration Plan

Record contracts (script structure, unit summary, announcements, lock) →
discovery → move scoped store module → move course overview → move unit +
nested unit overviews → flip map entries → verify. Rollback: revert
additive commits.
