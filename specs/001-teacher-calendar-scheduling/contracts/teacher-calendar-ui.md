# Contract: Teacher Calendar UI

## Entry Point

Route:

```text
/teacher_dashboard/sections/:sectionId/calendar
```

Required context:

- Selected section.
- Assigned course/unit context when available.
- Unit summary calendar lessons when the unit supports calendar display.
- Optional saved section calendar plan.
- Calendar display dependency selected during implementation.

## Loading States

- Show the existing spinner while selected section, course progress, unit summary, or saved calendar plan is loading.
- Keep existing empty states for:
  - no assigned curriculum,
  - no selected unit,
  - legacy course,
  - unit without calendar.

## Default Weekly Calendar Mode

Displayed when no detailed class sessions are saved.

Controls:

- Unit selector.
- Instructional minutes per week dropdown.
- Button or link to configure recurring or manual class sessions.

Behavior:

- Use the existing week-based generated calendar.
- Preserve existing analytics for viewing the calendar and changing minutes.

## Detailed Session Mode

Displayed when the plan has recurring weekly sessions, one-off manual sessions, or both.

Controls:

- Unit selector.
- Unit start date using the existing external date picker field.
- Recurring weekly class sessions editor:
  - day of week,
  - start time,
  - duration,
  - add/remove session.
- One-off manual class sessions editor:
  - date,
  - start time,
  - duration,
  - add/remove session.
- Reset to default.

Session display:

- A calendar display library renders dated class sessions.
- Each session shows date, weekday, start time, duration, cancellation state, and planned items.
- Canceled sessions are visibly marked and contain no generated lessons.
- Recurring and one-off sessions are visually consistent, with a small distinction in editing surfaces so teachers can tell why a session exists.

Plan item behavior:

- Lessons show lesson number, title, assessment/unplugged state, and link.
- Placeholders show teacher-provided title and are visually distinct from Code.org lessons.
- A session can contain multiple lessons and placeholders.
- A teacher can move a lesson or placeholder to another session.
- A teacher can order items within a session.
- A teacher can remove a lesson from the plan.
- Removed lessons remain visible in a restore list.
- Removing from the calendar plan does not hide from students.

Accessibility:

- Drag/drop, if present, must have keyboard-accessible alternatives.
- Buttons and icon controls need accessible names.
- Canceled sessions and placeholders must not be conveyed by color alone.

Library guidance:

- Use the existing dashboard date picker wrapper for date fields and native time inputs for time fields.
- Prefer FullCalendar for the calendar display if the dependency footprint is acceptable.
- React Big Calendar is the lighter alternative if recurrence and exception generation stays in our planner code.

## Save Behavior

- Unsaved edits should be clear to the teacher.
- Saving persists schedule settings, cancellations, lesson removals, explicit placements, and placeholders.
- If saving fails, keep the teacher's unsaved edits visible and show an error.

## Analytics

Recommended events:

- calendar detailed schedule configured.
- calendar plan saved.
- calendar session canceled/restored.
- calendar lesson moved.
- calendar lesson removed/restored.
- calendar placeholder created.
- calendar plan reset.

Event payloads should include unit name, section id, and non-sensitive counts, not free-text placeholder titles.
