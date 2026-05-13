# Implementation Plan: Teacher Calendar Scheduling

**Branch**: `codex/teacher-calendar-scheduling-spec` | **Date**: 2026-05-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/spec.md`

## Summary

Replace the teacher dashboard calendar's week-only estimate with a section/unit calendar plan. The default remains the existing unit lesson order and current minutes-per-week behavior until a teacher configures detailed class sessions. Once configured, a teacher can set a unit start date, define weekly recurring sessions, add one-off manual sessions for irregular schedules, cancel specific dates, and manually move, remove, or add planned items.

The implementation should preserve the current curriculum source of truth: unit summary data still supplies lessons, lesson titles, durations, flags, and links. New section-scoped planning data records how one teacher plans one section through one assigned unit.

## Technical Context

**Language/Version**: TypeScript and React in `apps/`; Ruby on Rails in `dashboard/`  
**Primary Dependencies**: Redux Toolkit, `HttpClient`, React Router teacher navigation, DSCO component library, MUI Typography/IconButton/Button, existing `react-datepicker` wrapper for date picker fields, native time fields, `moment-timezone`, `@dnd-kit` if drag/drop is used, plus one calendar display library selected before implementation  
**Storage**: Dashboard database tables keyed by section, unit, and course context  
**Testing**: Apps Jest unit tests; dashboard controller/model tests; targeted UI/Eyes update only if the rendered calendar page changes materially  
**Target Platform**: `studio.code.org` teacher dashboard, typically local `localhost:9000` or `localhost:3000`  
**Project Type**: Monorepo, Rails backend plus bundled React frontend  
**Performance Goals**: Calendar load should show saved plans without extra teacher input; recalculation after a cancellation should be user-visible in under 10 seconds  
**Constraints**: Do not alter student lesson access when a lesson is removed from a calendar plan; keep legacy minutes-per-week behavior for unconfigured calendars; use design-system components for new UI  
**Scale/Scope**: One saved plan per section/unit; each plan can mix recurring weekly sessions and one-off manual sessions; no external calendar sync or district holiday imports in this feature

## Constitution Check

No `.specify/memory/constitution.md` exists in this worktree. Planning gates are taken from repo guidance:

- Work in the separate worktree only.
- Read `AGENTS.md`, `apps/README.md`, `TESTING.md`, and relevant code paths before planning.
- Prefer existing codebase patterns and design-system components.
- Keep implementation changes scoped to teacher dashboard calendar, unit summary contract extensions, and new backend persistence.
- Run targeted apps and dashboard tests during implementation, then `./tools/hooks/pre-commit` before reporting success for code changes.

Gate status: **PASS**. No known violations.

## Current Code Findings

- `apps/src/templates/teacherNavigation/UnitCalendar.tsx` renders `/teacher_dashboard/sections/:sectionId/calendar`.
- `UnitCalendar` loads selected section data, fetches `/dashboardapi/unit_summary/:course_name/:unit_position`, and writes `calendarLessons` into `calendarRedux`.
- `apps/src/code-studio/components/progress/UnitCalendarGrid.jsx` splits lessons into week rows by a single `weeklyInstructionalMinutes` value.
- `dashboard/app/controllers/api_controller.rb#unit_summary` returns unit summary JSON.
- `dashboard/app/models/unit.rb#summarize` returns `showCalendar`, `weeklyInstructionalMinutes`, and `calendarLessons`.
- `dashboard/app/models/lesson.rb#summarize_for_calendar` returns lesson id, lesson number, title, duration, assessment, unplugged flag, and URL.
- Existing hidden-lesson support uses `/s/:script_id/toggle_hidden` and `SectionHiddenLesson`; that is access control and should remain separate from calendar-plan removal.
- `apps/package.json` has `@mui/material`; MUI X Date Pickers were not kept because the current package is not compatible with the Dashboard bundle format.
- `apps/package.json` already has `moment`, `moment-timezone`, `@dnd-kit/core`, and `@dnd-kit/sortable`.

## Design Decision

Use a new section calendar planning domain rather than overloading unit summary or hidden lessons:

- `UnitSummary` remains the curriculum source.
- A new saved calendar plan is scoped by section and unit/course position.
- The frontend composes unit lesson data with the saved plan.
- Generated schedules are deterministic from start date, recurring weekly sessions, one-off manual sessions, cancellations, and curriculum lessons.
- Manual edits are stored as plan overrides, not mutations to unit lessons.
- Date picker fields should use the existing `DatePicker` wrapper backed by `react-datepicker`; time fields should use native `type="time"` inputs.
- The calendar display should use an external calendar library. Evaluate FullCalendar first; React Big Calendar is the main lighter alternative.

## Project Structure

### Backend

```text
dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb
dashboard/app/models/sections/section_calendar_plan.rb
dashboard/app/models/sections/section_calendar_session.rb
dashboard/app/models/sections/section_calendar_one_off_session.rb
dashboard/app/models/sections/section_calendar_cancellation.rb
dashboard/app/models/sections/section_calendar_item.rb
dashboard/db/migrate/*create_section_calendar_plans.rb
dashboard/test/controllers/api/v1/section_calendar_plans_controller_test.rb
dashboard/test/models/sections/section_calendar_plan_test.rb
```

### Frontend

```text
apps/src/templates/teacherNavigation/UnitCalendar.tsx
apps/src/templates/teacherNavigation/calendar/
apps/src/templates/teacherNavigation/calendar/calendarPlannerUtils.ts
apps/src/templates/teacherNavigation/calendar/calendarPlanApi.ts
apps/src/templates/teacherNavigation/calendar/calendarPlanTypes.ts
apps/src/templates/teacherNavigation/calendar/CalendarScheduleSettings.tsx
apps/src/templates/teacherNavigation/calendar/CalendarSessionList.tsx
apps/src/templates/teacherNavigation/calendar/CalendarPlanCalendar.tsx
apps/src/templates/teacherNavigation/calendar/CalendarPlanItem.tsx
apps/src/templates/teacherNavigation/calendar/CalendarLessonDrawer.tsx
apps/test/unit/templates/teacherNavigation/calendar/
apps/test/unit/templates/teacherNavigation/UnitCalendarTest.tsx
```

## Phase 0: Research

Output: [research.md](./research.md)

Resolved questions:

- How to preserve old behavior while adding detailed class sessions.
- How to support recurring weekly sessions and one-off manually entered sessions in the same plan.
- How to model saved calendar customizations without changing curriculum.
- How to handle lesson removal without using hidden lesson state.
- Which frontend controls, date/time picker library, and calendar display library to use.
- How to recalculate plans after cancellations or session edits.

## Phase 1: Design and Contracts

Outputs:

- [data-model.md](./data-model.md)
- [contracts/section-calendar-plan-api.md](./contracts/section-calendar-plan-api.md)
- [contracts/teacher-calendar-ui.md](./contracts/teacher-calendar-ui.md)
- [quickstart.md](./quickstart.md)

The backend contract is an authenticated teacher API for one section/unit calendar plan. The UI contract keeps the existing empty states and unit selector, adds scheduling controls, and renders a calendar display by date when a detailed schedule exists.

## Phase 2: Implementation Approach

1. Select a calendar display library. Prefer FullCalendar if the team accepts the dependency and CSS footprint; use React Big Calendar if a smaller React calendar is favored and recurrence generation stays in our own code.
2. Add the selected calendar display dependency. Reuse the existing date picker wrapper for dates.
3. Add backend persistence and serialization for section calendar plans.
4. Add API endpoints for reading, saving, resetting, and optionally previewing a plan.
5. Add frontend plan types, API wrapper, and deterministic schedule generation helper.
6. Update `UnitCalendar` to fetch both unit summary and section calendar plan.
7. Keep the current `UnitCalendarGrid` path for unconfigured calendars.
8. Add detailed calendar UI for unit start date, recurring weekly sessions, one-off sessions, cancellations, planned items, removed lessons, and placeholders.
9. Add tests at the planner utility, React component, API controller, and model layers.
10. Run targeted apps tests, targeted dashboard tests, typecheck, and pre-commit.

## Risk Register

- **Manual edit preservation**: Session changes after teacher edits can be ambiguous. Store manual item assignments explicitly and surface a reset/regenerate action.
- **Large units**: Rendering many sessions and lesson chunks may get noisy. Keep the first implementation focused on the assigned unit and visible generated range.
- **Existing calendar reuse**: `UnitCalendarGrid` also serves unit overview printing/dialog behavior. Prefer new teacher-dashboard-specific components for detailed calendars, leaving shared overview calendar behavior intact.
- **Auth boundary**: A read-only teacher or unauthorized user must not save a plan. Enforce this on the server, not only in the UI.
- **Date/time ambiguity**: Store dates and local times separately. The feature does not schedule real instants or external calendar events.
- **New calendar dependency**: FullCalendar is feature-rich but larger; React Big Calendar is simpler but leaves more recurrence and exception logic to us. Do a short spike before locking the dependency.

## Testing Plan

- Apps unit tests:
  - `yarn test:unit test/unit/templates/teacherNavigation/UnitCalendarTest.tsx`
  - New tests under `test/unit/templates/teacherNavigation/calendar/`
  - Existing calendar grid tests if shared behavior changes
- Type check:
  - `yarn run typecheck` from `apps/`
- Dashboard tests:
  - `bundle exec spring testunit ./test/controllers/api/v1/section_calendar_plans_controller_test.rb`
  - `bundle exec spring testunit ./test/models/sections/section_calendar_plan_test.rb`
- Visual/UI:
  - Verify `/teacher_dashboard/sections/:sectionId/calendar` locally.
  - Update `dashboard/test/ui/features/teacher_tools/teacher_dashboard/calendar_eyes.feature` only if the intended page baseline changes.
- Final:
  - `./tools/hooks/pre-commit` from repo root.

## Post-Design Constitution Check

Gate status: **PASS**.

- No unresolved clarifications remain.
- No implementation choice violates repo guidance.
- Planned tests are targeted before broad checks.
- New UI uses design-system components where available.
- Student lesson visibility remains separate from calendar plan removal.
