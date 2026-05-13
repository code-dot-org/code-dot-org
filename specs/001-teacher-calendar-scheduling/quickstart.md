# Quickstart: Teacher Calendar Scheduling

## Read First

- `/private/tmp/teacher-calendar-scheduling-spec/AGENTS.md`
- `/private/tmp/teacher-calendar-scheduling-spec/apps/README.md`
- `/private/tmp/teacher-calendar-scheduling-spec/TESTING.md`
- `/private/tmp/teacher-calendar-scheduling-spec/.agents/skills/design-system/SKILL.md`

## Main Code Paths

- Frontend route: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/TeacherNavigationRouter.tsx`
- Calendar page: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/UnitCalendar.tsx`
- Current weekly grid: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/code-studio/components/progress/UnitCalendarGrid.jsx`
- Calendar Redux: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/code-studio/calendarRedux.ts`
- Unit summary client types: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/code-studio/components/progress/UnitSummaryUtils.tsx`
- Unit summary endpoint: `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api_controller.rb`
- Lesson calendar summary: `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/lesson.rb`
- Unit calendar summary: `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/unit.rb`
- Section model: `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section.rb`

## Dependency Notes

- `apps/package.json` already includes `@mui/material`, `moment`, `moment-timezone`, `@dnd-kit/core`, and `@dnd-kit/sortable`.
- Date fields use the existing dashboard `DatePicker` wrapper backed by `react-datepicker`.
- Calendar display library options to spike:
  - FullCalendar: `@fullcalendar/core`, `@fullcalendar/react`, `@fullcalendar/timegrid`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`, optionally `@fullcalendar/rrule`.
  - React Big Calendar: `react-big-calendar`, using the existing Moment localizer path.

## Local Implementation Loop

1. Work in `/private/tmp/teacher-calendar-scheduling-spec`, not `/Volumes/git/code-dot-org`.
2. Spike FullCalendar versus React Big Calendar with one recurring session, one one-off session, one cancellation, and one custom item.
3. Reuse the existing date picker wrapper for date fields.
4. Add backend persistence and controller tests first.
5. Add frontend types and pure schedule generation helpers.
6. Add React UI in `apps/src/templates/teacherNavigation/calendar/`.
7. Wire `UnitCalendar.tsx` to fetch unit summary and the section calendar plan.
8. Preserve current week-based rendering when no detailed schedule exists.

## Suggested Test Commands

Apps:

```bash
cd /private/tmp/teacher-calendar-scheduling-spec/apps
yarn test:unit test/unit/templates/teacherNavigation/UnitCalendarTest.tsx
yarn test:unit test/unit/templates/teacherNavigation/calendar/
yarn run typecheck
```

Dashboard:

```bash
cd /private/tmp/teacher-calendar-scheduling-spec/dashboard
bundle exec spring testunit ./test/controllers/api/v1/section_calendar_plans_controller_test.rb
bundle exec spring testunit ./test/models/sections/section_calendar_plan_test.rb
```

Final lint:

```bash
cd /private/tmp/teacher-calendar-scheduling-spec
./tools/hooks/pre-commit
```

## Manual Verification

If dashboard and apps are already running, open:

```text
http://localhost:9000/teacher_dashboard/sections/6545266/calendar
```

Fallback:

```text
http://localhost:3000/teacher_dashboard/sections/6545266/calendar
```

Verify:

- Default weekly calendar still appears before detailed sessions are configured.
- Tuesday 11:00 AM for 45 minutes and Friday 2:00 PM for 75 minutes generate recurring dated sessions.
- A manually added one-off Wednesday 9:30 AM session appears in chronological order with recurring sessions.
- Past and future unit start dates are accepted.
- A canceled session receives no generated lessons.
- Lesson 1, Lesson 4, and placeholder `paper plane experiment` can appear in one Tuesday session.
- Removing a lesson from the plan does not hide it from students.
