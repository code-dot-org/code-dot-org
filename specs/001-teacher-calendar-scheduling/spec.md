# Feature Specification: Teacher Calendar Scheduling

**Feature Branch**: `codex/teacher-calendar-scheduling-spec`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "Update the teacher dashboard calendar so teachers can specify when class sessions happen, choose a unit start date, see lessons placed into each class session, then move or delete lessons and add custom placeholders. Teachers may have weekly recurring sessions or one-off manually entered sessions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a Calendar from Real Class Sessions *(Priority: P1)*

A teacher with an assigned unit can enter the section's class meeting pattern, choose the date that the unit starts, and see the unit lessons placed into actual class sessions instead of rough weekly blocks. The teacher can use a regular weekly pattern, manually entered one-off sessions, or both.

**Why this priority**: This is the core planning job. Without real class sessions and a start date, the calendar cannot reflect how teachers teach.

**Independent Test**: For a section assigned to a unit with a calendar, set Tuesday 11:00 AM for 45 minutes and Friday 2:00 PM for 75 minutes as recurring weekly sessions, add a one-off Wednesday 9:30 AM session for 30 minutes, choose a unit start date, and verify that lessons appear in chronological class sessions using the unit's current lesson order.

**Acceptance Scenarios**:

1. **Given** a teacher is viewing the calendar for a section with an assigned unit, **When** the teacher adds recurring weekly class sessions for Tuesday at 11:00 AM for 45 minutes and Friday at 2:00 PM for 75 minutes and chooses a unit start date, **Then** the calendar shows dated sessions beginning on that start date and allocates lessons into those sessions in the unit's lesson order.
2. **Given** a unit start date is in the past, **When** the teacher saves the schedule, **Then** the calendar shows past sessions before today and future sessions after today without forcing the start date to move.
3. **Given** a unit start date is in the future, **When** the teacher saves the schedule, **Then** the first planned session appears on or after that start date according to the section's class meeting pattern.
4. **Given** no custom class session pattern has been saved, **When** the teacher opens the calendar, **Then** the calendar defaults to the existing lesson order and the current minutes-per-week behavior.
5. **Given** a teacher has no regular weekly class pattern, **When** the teacher manually adds one-off sessions on specific dates, **Then** the calendar uses those exact sessions for lesson placement.
6. **Given** a teacher has a regular weekly class pattern and a special extra session, **When** the teacher adds a one-off manual session, **Then** the one-off session appears in chronological order with the recurring sessions.

---

### User Story 2 - Account for Cancellations *(Priority: P1)*

A teacher can mark specific dates as no-class days, such as snow days, assemblies, field trips, or testing days, and the remaining lesson plan shifts to later available sessions.

**Why this priority**: Real school calendars change. Teachers need the plan to remain useful after missed days.

**Independent Test**: Create a recurring weekly schedule and a one-off manual session, cancel one generated session date, and verify that no lesson is assigned to the canceled date and the affected lessons move to later available sessions.

**Acceptance Scenarios**:

1. **Given** a teacher has a saved schedule with lessons assigned to dated sessions, **When** the teacher cancels a specific session date, **Then** that date is marked as canceled and the skipped instructional time is not used for lesson placement.
2. **Given** lessons follow a canceled date, **When** the cancellation is saved, **Then** the following lessons keep their relative order and move to the next available class sessions.
3. **Given** a canceled date is restored, **When** the teacher removes the cancellation, **Then** the calendar can use that session again and recalculates the default placement unless the teacher has made manual edits that should be preserved.

---

### User Story 3 - Customize the Section Plan *(Priority: P2)*

A teacher can revise the generated plan by moving lessons between sessions, removing lessons from the plan, and adding custom placeholders for class activities that are not Code.org lessons.

**Why this priority**: Teachers often adapt units. The calendar should represent the section's actual plan, not only the published unit sequence.

**Independent Test**: Starting from a generated plan, move Lesson 4 into a Tuesday session with Lesson 1, remove another lesson from the plan, add a placeholder named "paper plane experiment", save, leave the page, and verify that the customized plan remains for that section and unit.

**Acceptance Scenarios**:

1. **Given** the generated plan includes multiple dated sessions, **When** the teacher moves a lesson to another session, **Then** the calendar shows that lesson in the chosen session while preserving the rest of the plan where possible.
2. **Given** a teacher does not plan to teach a lesson, **When** the teacher removes that lesson from the calendar plan, **Then** the lesson no longer appears in planned sessions and can be restored from the unit lesson list.
3. **Given** a teacher needs to include non-Code.org work, **When** the teacher adds a placeholder titled "paper plane experiment" to a session, **Then** the placeholder appears in that session with a clear distinction from unit lessons.
4. **Given** a session already contains Lesson 1, **When** the teacher adds Lesson 4 and a placeholder to that same session, **Then** the session can show all three items in the order chosen by the teacher.

---

### User Story 4 - Review and Adjust the Saved Plan *(Priority: P3)*

A teacher can return to the calendar later and see the saved schedule, cancellations, skipped lessons, moved lessons, and placeholders for the selected section and unit.

**Why this priority**: The plan is only useful if it survives normal navigation and course planning over time.

**Independent Test**: Save a customized plan, switch away from the calendar, return to the same section and unit, and verify that all schedule details and manual edits are still present.

**Acceptance Scenarios**:

1. **Given** a teacher saved a customized calendar for one section and unit, **When** the teacher returns to that calendar, **Then** the saved plan is displayed instead of a fresh default plan.
2. **Given** the teacher switches to a different section or unit, **When** the calendar loads, **Then** the saved plan from the previous section and unit is not applied to the new context.
3. **Given** the teacher resets the customized plan, **When** the reset is confirmed, **Then** the calendar returns to the default lesson order based on class sessions and cancellations.

### Edge Cases

- A class session pattern has uneven durations across days, including short sessions and long sessions in the same week.
- A teacher has no weekly pattern and enters every class session manually.
- A teacher mixes recurring weekly sessions with one-off sessions.
- A one-off session falls on the same date as a recurring session.
- The unit start date does not fall on a class meeting day.
- A lesson is longer than a single class session and must span more than one session.
- A class session has room for more than one lesson or placeholder.
- A cancellation removes the only class session in a week.
- All remaining lessons are removed from the plan.
- A teacher edits the class session pattern after manually moving lessons or adding placeholders.
- The assigned unit changes after a saved calendar plan exists.
- The section has no assigned curriculum or the assigned unit does not provide a calendar.
- A teacher opens the calendar for a section they do not own or cannot manage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calendar must let an authorized teacher define one or more recurring weekly class sessions for a selected section, including day of week, start time, and duration in minutes.
- **FR-002**: The calendar must let an authorized teacher choose the unit start date for the selected section and unit, including dates in the past and dates in the future.
- **FR-003**: The calendar must let an authorized teacher define one-off class sessions on specific dates, including date, start time, and duration in minutes.
- **FR-004**: The calendar must support plans that use only recurring weekly sessions, only one-off manual sessions, or a mix of both.
- **FR-005**: The calendar must generate a default dated plan from the selected unit's lesson list, preserving the same lesson order used by the current calendar.
- **FR-006**: The default plan must place lessons into class sessions according to available instructional minutes for each session.
- **FR-007**: When a lesson does not fit into the remaining time for a session, the calendar must either continue it in a later session or place it in a later session so the teacher can see how the lesson spans time.
- **FR-008**: The calendar must let an authorized teacher cancel individual class session dates without deleting the recurring class session pattern.
- **FR-009**: Canceled sessions must be visibly marked and must not receive default lesson assignments.
- **FR-010**: The calendar must recalculate future default lesson placement after recurring session, one-off session, start date, or cancellation changes while preserving manual edits whenever that preservation is clear.
- **FR-011**: The calendar must let an authorized teacher move a lesson to a different session in the same section and unit plan.
- **FR-012**: The calendar must let an authorized teacher order multiple planned items within the same session.
- **FR-013**: The calendar must let an authorized teacher remove a lesson from the calendar plan for the selected section and unit.
- **FR-014**: Removed lessons must remain available to restore to the calendar plan.
- **FR-015**: Removing a lesson from the calendar plan must not by itself hide the lesson from students or change lesson access.
- **FR-016**: The calendar must let an authorized teacher create, edit, move, and remove custom placeholders.
- **FR-017**: A custom placeholder must include a teacher-provided title and may optionally include planned minutes.
- **FR-018**: Custom placeholders must be visually distinguishable from Code.org lessons.
- **FR-019**: Saved schedules, cancellations, lesson moves, removed lessons, and placeholders must be scoped to the selected section and unit.
- **FR-020**: A teacher must be able to reset a customized calendar plan back to the generated default for the selected section and unit.
- **FR-021**: The calendar must clearly show when there is no assigned curriculum, no selected unit, or no calendar available for the selected unit.
- **FR-022**: Teachers without permission to manage a section must not be able to change that section's calendar plan.
- **FR-023**: The calendar must preserve the current minutes-per-week workflow as the default behavior when no detailed class session schedule has been configured.
- **FR-024**: The calendar must provide enough information for a teacher to understand which lessons or placeholders are planned for each class session date.

### Key Entities

- **Section Calendar Plan**: The saved plan for one section and one unit. It includes the unit start date, recurring sessions, one-off sessions, canceled dates, generated lesson placement, and manual edits.
- **Recurring Class Session**: A weekly meeting definition with day of week, start time, and duration.
- **One-Off Class Session**: A teacher-entered meeting on a specific date with start time and duration.
- **Scheduled Class Session**: A concrete date produced from a recurring class session or entered as a one-off class session. It can be active or canceled.
- **Lesson Plan Item**: A Code.org lesson placed into one or more scheduled class sessions. It retains lesson identity, title, order, duration, and lesson link.
- **Custom Placeholder**: A teacher-created planning item that is not a Code.org lesson. It has a title and optional planned minutes.
- **Removed Lesson**: A lesson from the unit that the teacher has taken out of the section calendar plan and can later restore.
- **Cancellation**: A teacher-created exception that marks a scheduled class date as unavailable for instruction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A teacher can create a two-day uneven weekly schedule, add a one-off manual session, set a unit start date, and view the generated session-by-session plan in under 4 minutes.
- **SC-002**: Given saved class sessions and a unit start date, 95% of calendar loads show the teacher's saved plan without requiring additional input.
- **SC-003**: Teachers can cancel a single class date and see affected future lessons move to available sessions in under 10 seconds.
- **SC-004**: Teachers can move a lesson, remove a lesson, and add a custom placeholder, then return to the page and see those edits preserved.
- **SC-005**: In usability review, at least 8 out of 10 teachers can identify which lessons are planned for a specific date without assistance.
- **SC-006**: The existing minutes-per-week calendar experience remains available for teachers who do not configure detailed class sessions.

## Assumptions

- Calendar customization is saved per teacher-managed section and assigned unit.
- A plan may contain recurring weekly sessions, one-off manual sessions, or both.
- "Delete lesson" means remove the lesson from the calendar plan for that section and unit. It does not hide the lesson from students or affect lesson access unless a separate visibility control is used.
- Custom placeholders are teacher planning items and are not shown to students.
- Times are interpreted in the teacher's local school context.
- The first version does not need district holiday imports or integration with external calendars.
- The default generated order follows the unit lesson order currently used by the calendar.
