# Tasks: Teacher Calendar Scheduling

**Input**: Design artifacts in `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts), [quickstart.md](./quickstart.md)

**Testing policy for this task list**: Do not add or run automated tests for now. Verification is manual-only.

## Phase 1: Setup

**Purpose**: Select dependencies and create the skeleton needed by all later work.

- [X] T001 Spike FullCalendar versus React Big Calendar and record the chosen calendar display dependency in `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/calendar-library-spike.md`
- [X] T002 Add the chosen calendar display dependency to `/private/tmp/teacher-calendar-scheduling-spec/apps/package.json`
- [X] T003 Update dependency lock entries for the chosen calendar display dependency in `/private/tmp/teacher-calendar-scheduling-spec/apps/yarn.lock`
- [X] T004 [P] Create the frontend calendar module directory with an index placeholder in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/index.ts`
- [X] T005 [P] Add shared calendar plan type definitions in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlanTypes.ts`
- [X] T006 [P] Add backend model file placeholders under `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_plan.rb`
- [X] T007 [P] Add backend controller file placeholder in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`

---

## Phase 2: Foundational

**Purpose**: Add shared persistence, routing, API client, and schedule generation primitives. These tasks block all user stories.

- [X] T008 Create calendar plan tables for plans, recurring sessions, one-off sessions, cancellations, and items in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/db/migrate/20260513000000_create_section_calendar_plans.rb`
- [X] T009 Implement `Sections::SectionCalendarPlan` associations and validations in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_plan.rb`
- [X] T010 Implement `Sections::SectionCalendarSession` recurring-session validations in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_session.rb`
- [X] T011 Implement `Sections::SectionCalendarOneOffSession` one-off-session validations in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_one_off_session.rb`
- [X] T012 Implement `Sections::SectionCalendarCancellation` cancellation validations in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_cancellation.rb`
- [X] T013 Implement `Sections::SectionCalendarItem` lesson and placeholder validations in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_item.rb`
- [X] T014 Add `Section` associations for section calendar plans in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section.rb`
- [X] T015 Add factories for calendar plans, recurring sessions, one-off sessions, cancellations, and items in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/test/factories/factories.rb`
- [X] T016 Add calendar plan routes for read, save, and reset in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/config/routes.rb`
- [X] T017 Implement shared unit-context lookup and section authorization helpers in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T018 Implement frontend calendar plan API wrappers for GET, PUT, and DELETE in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlanApi.ts`
- [X] T019 Implement pure schedule generation helpers for recurring and one-off sessions in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlannerUtils.ts`
- [X] T020 Extend calendar Redux state for saved plan loading status and plan data in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/code-studio/calendarRedux.ts`

---

## Phase 3: User Story 1 - Build a Calendar from Real Class Sessions (P1)

**Goal**: A teacher can set recurring weekly sessions, one-off manual sessions, and a unit start date, then see lessons placed into dated class sessions in the existing unit order.

**Manual Verification**: For a section assigned to a unit with a calendar, set Tuesday 11:00 AM for 45 minutes and Friday 2:00 PM for 75 minutes as recurring sessions, add a one-off Wednesday 9:30 AM session for 30 minutes, choose a unit start date, and verify lessons appear in chronological class sessions.

- [X] T021 [US1] Implement calendar plan JSON serialization for mixed recurring and one-off sessions in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_plan.rb`
- [X] T022 [US1] Implement GET and PUT behavior for basic calendar plans in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T023 [US1] Validate submitted lesson ids belong to the selected unit in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T024 [US1] Implement deterministic dated session generation from unit lessons and plan facts in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlannerUtils.ts`
- [X] T025 [US1] Create the date/time provider wrapper in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarDateTimeProvider.tsx`
- [X] T026 [US1] Build recurring and one-off session controls using the existing external date picker wrapper, native time fields, and design-system controls in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarScheduleSettings.tsx`
- [X] T027 [US1] Build the external-library calendar display shell in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarPlanCalendar.tsx`
- [X] T028 [US1] Build lesson event rendering for generated lesson chunks in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarPlanItem.tsx`
- [X] T029 [US1] Wire saved plan loading, detailed-session rendering, and default weekly fallback in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/UnitCalendar.tsx`
- [X] T030 [US1] Add styles for detailed calendar settings and calendar display in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendar.module.scss`
- [X] T031 [US1] Add localized strings for detailed calendar setup, recurring sessions, one-off sessions, and save controls in `/private/tmp/teacher-calendar-scheduling-spec/apps/i18n/common/en_us.json`
- [ ] T032 [US1] Manually verify default weekly mode remains available before detailed sessions are configured using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T033 [US1] Manually verify recurring sessions, one-off sessions, past start dates, and future start dates using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`

---

## Phase 4: User Story 2 - Account for Cancellations (P1)

**Goal**: A teacher can cancel or restore individual class-session dates and see lesson placement shift to later available sessions.

**Manual Verification**: Create a recurring weekly schedule and a one-off manual session, cancel one generated session date, and verify that no lesson is assigned to the canceled date and affected lessons move to later available sessions.

- [X] T034 [US2] Serialize cancellations for recurring and one-off sessions in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_plan.rb`
- [X] T035 [US2] Persist cancellation updates from PUT requests in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T036 [US2] Apply cancellations during schedule generation in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlannerUtils.ts`
- [X] T037 [US2] Add cancel and restore session actions to the calendar display in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarPlanCalendar.tsx`
- [X] T038 [US2] Add non-color-only canceled-session styling in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendar.module.scss`
- [X] T039 [US2] Add localized strings for cancel, restore, and canceled-session labels in `/private/tmp/teacher-calendar-scheduling-spec/apps/i18n/common/en_us.json`
- [ ] T040 [US2] Manually verify a canceled recurring session receives no lessons and later sessions receive shifted lessons using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T041 [US2] Manually verify a canceled one-off session receives no lessons and can be restored using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`

---

## Phase 5: User Story 3 - Customize the Section Plan (P2)

**Goal**: A teacher can move lessons, remove lessons from the section plan, restore removed lessons, and add custom placeholders.

**Manual Verification**: Starting from a generated plan, move Lesson 4 into a Tuesday session with Lesson 1, remove another lesson from the plan, add placeholder "paper plane experiment", save, leave the page, and verify the customized plan remains for that section and unit.

- [X] T042 [US3] Persist explicit lesson placements, removed lessons, and placeholders in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T043 [US3] Add plan item serialization for lesson items and placeholder items in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/models/sections/section_calendar_item.rb`
- [X] T044 [US3] Apply explicit placements, removed lessons, and placeholders during schedule generation in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendarPlannerUtils.ts`
- [X] T045 [US3] Build the removed lesson and restore list UI in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarLessonDrawer.tsx`
- [X] T046 [US3] Add item move, remove, restore, and placeholder actions to `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarPlanCalendar.tsx`
- [X] T047 [US3] Add accessible keyboard alternatives for move and reorder actions in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarPlanItem.tsx`
- [X] T048 [US3] Add placeholder and removed-lesson styles in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/calendar.module.scss`
- [X] T049 [US3] Add localized strings for lesson movement, removal, restore, and placeholders in `/private/tmp/teacher-calendar-scheduling-spec/apps/i18n/common/en_us.json`
- [ ] T050 [US3] Manually verify lesson movement, lesson removal, lesson restore, and placeholder creation using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T051 [US3] Manually verify removing a lesson from the calendar plan does not hide it from students using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`

---

## Phase 6: User Story 4 - Review and Adjust the Saved Plan (P3)

**Goal**: A teacher can return to a section/unit calendar and see saved schedule settings, cancellations, skipped lessons, moved lessons, and placeholders; switching context does not leak saved plans; reset restores defaults.

**Manual Verification**: Save a customized plan, switch away from the calendar, return to the same section and unit, and verify all schedule details and manual edits are still present.

- [X] T052 [US4] Implement DELETE reset behavior in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T053 [US4] Enforce section and unit scoping for all calendar plan reads and writes in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/app/controllers/api/v1/section_calendar_plans_controller.rb`
- [X] T054 [US4] Add save, reset, unsaved-change, and failure states to `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/UnitCalendar.tsx`
- [X] T055 [US4] Clear or reload saved plan state when section or unit context changes in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/code-studio/calendarRedux.ts`
- [X] T056 [US4] Add reset confirmation UI in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/calendar/CalendarScheduleSettings.tsx`
- [X] T057 [US4] Add localized strings for save errors, unsaved changes, and reset confirmation in `/private/tmp/teacher-calendar-scheduling-spec/apps/i18n/common/en_us.json`
- [ ] T058 [US4] Manually verify saved plans persist after navigation and reload using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T059 [US4] Manually verify switching section or unit does not apply the previous section/unit plan using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T060 [US4] Manually verify reset returns the selected section/unit to generated defaults using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final manual verification, accessibility, analytics, and release readiness.

- [ ] T061 [P] Add analytics constants for detailed schedule configured, plan saved, session canceled/restored, lesson moved/removed/restored, placeholder created, and plan reset in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/metrics/AnalyticsConstants.js`
- [ ] T062 Add analytics calls without free-text placeholder titles in `/private/tmp/teacher-calendar-scheduling-spec/apps/src/templates/teacherNavigation/UnitCalendar.tsx`
- [ ] T063 [P] Manually verify labels, icon names, keyboard movement, and cancellation status using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/contracts/teacher-calendar-ui.md`
- [ ] T064 [P] Update the calendar Eyes scenario only if the intended rendered baseline changes in `/private/tmp/teacher-calendar-scheduling-spec/dashboard/test/ui/features/teacher_tools/teacher_dashboard/calendar_eyes.feature`
- [ ] T065 Manually verify `/teacher_dashboard/sections/6545266/calendar` through local dashboard using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`
- [ ] T066 Manually inspect changed files for obvious type, lint, and syntax errors without running automated tests using `/private/tmp/teacher-calendar-scheduling-spec/specs/001-teacher-calendar-scheduling/quickstart.md`

---

## Dependencies

### Phase Dependencies

- Phase 1 Setup must complete before Phase 2.
- Phase 2 Foundational must complete before any user story.
- US1 and US2 are both P1, but US2 depends on US1 schedule generation and base plan persistence.
- US3 depends on US1 schedule generation and base plan persistence.
- US4 depends on US1 base plan persistence and should be completed after US2/US3 if it verifies cancellations and custom edits.
- Polish depends on all selected user stories.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 -> US2 -> US4 -> Polish
                         \-> US3 -/
```

### MVP Scope

MVP is US1 only:

- Teachers can keep old weekly mode.
- Teachers can create recurring weekly sessions.
- Teachers can create one-off manual sessions.
- Teachers can set unit start date.
- Teachers can see lessons generated into dated sessions in unit order.
- Verification is manual-only.

US2, US3, and US4 can be delivered incrementally after US1.

---

## Parallel Execution Examples

### Setup

```text
Parallelizable after T001-T003:
- T004 frontend calendar directory
- T005 frontend plan types
- T006 backend model placeholders
- T007 backend controller placeholder
```

### User Story 1

```text
Parallelizable after Phase 2:
- T025 date/time provider wrapper
- T026 schedule settings UI
- T027 calendar display shell
- T028 calendar item rendering
```

### User Story 2

```text
Parallelizable after US1:
- T034 cancellation serialization
- T036 planner cancellation application
- T038 canceled-session styling
- T039 cancellation strings
```

### User Story 3

```text
Parallelizable after US1:
- T043 plan item serialization
- T045 removed lesson drawer
- T048 placeholder styles
- T049 custom edit strings
```

### User Story 4

```text
Parallelizable after US1:
- T052 reset endpoint
- T055 Redux context clearing
- T056 reset confirmation UI
- T057 reset and save strings
```

---

## Implementation Strategy

1. Complete setup and foundational persistence/API/client types first.
2. Ship US1 as the MVP. Keep the current weekly calendar path working for unconfigured plans.
3. Add US2 cancellations. This proves generated plans can react to real school interruptions.
4. Add US3 custom edits. This turns the generated plan into a teacher-owned plan.
5. Add US4 persistence, reset, and context-switch hardening.
6. Finish analytics, accessibility review, and manual verification.

## Format Validation

All task lines above use the required checklist format: checkbox, sequential task id, optional parallel marker, required story marker for user-story tasks, and a concrete file path.
