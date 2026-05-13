# Data Model: Teacher Calendar Scheduling

## SectionCalendarPlan

Represents one teacher-managed plan for one section and one unit.

Fields:

- `id`: unique plan id.
- `section_id`: owning section.
- `unit_id`: assigned unit.
- `course_name`: course context used by teacher navigation.
- `unit_position`: unit position in the course context.
- `start_date`: first date from which scheduled class sessions are considered.
- `mode`: `weekly_minutes` or `detailed_sessions`.
- `weekly_instructional_minutes`: retained fallback value for old behavior.
- `created_by_user_id`: teacher who created the plan.
- `updated_by_user_id`: last teacher who changed the plan.
- `created_at`, `updated_at`.

Relationships:

- Belongs to `Section`.
- Belongs to `Unit`.
- Has many `SectionCalendarSession` records.
- Has many `SectionCalendarOneOffSession` records.
- Has many `SectionCalendarCancellation` records.
- Has many `SectionCalendarItem` records.

Validation:

- `section_id`, `unit_id`, and `start_date` are required for detailed plans.
- Only one active plan exists for a section/unit/course context.
- Teacher must be allowed to manage the section before mutating the plan.

## SectionCalendarSession

Defines a recurring class meeting in a week.

Fields:

- `id`.
- `section_calendar_plan_id`.
- `weekday`: integer or enum for Monday through Sunday.
- `start_time`: local time string, for example `11:00`.
- `duration_minutes`: positive integer.
- `position`: order among sessions on the same weekday.
- `active`: false if the recurring session has been disabled without deleting historical plan data.
- `created_at`, `updated_at`.

Validation:

- `weekday`, `start_time`, and `duration_minutes` are required.
- `duration_minutes` must be greater than zero.
- Sessions in one plan should not overlap on the same weekday.

## SectionCalendarOneOffSession

Defines a manually entered class meeting on a specific date.

Fields:

- `id`.
- `section_calendar_plan_id`.
- `session_date`: local date.
- `start_time`: local time string, for example `09:30`.
- `duration_minutes`: positive integer.
- `position`: order among sessions on the same date.
- `created_at`, `updated_at`.

Validation:

- `session_date`, `start_time`, and `duration_minutes` are required.
- `duration_minutes` must be greater than zero.
- One-off sessions in one plan should not overlap on the same date.
- One-off sessions may exist without any recurring weekly sessions.

## SectionCalendarCancellation

Marks a concrete class date as unavailable.

Fields:

- `id`.
- `section_calendar_plan_id`.
- `session_date`: local date.
- `section_calendar_session_id`: optional reference to the recurring session that was canceled.
- `section_calendar_one_off_session_id`: optional reference to the one-off session that was canceled.
- `reason`: optional teacher-entered text.
- `created_at`, `updated_at`.

Validation:

- `session_date` is required.
- One cancellation per plan/session/date.
- Canceling a date does not delete the recurring session.
- Canceling a one-off session marks it unavailable without removing its audit history.

## SectionCalendarItem

Stores explicit teacher edits and custom items in the plan.

Fields:

- `id`.
- `section_calendar_plan_id`.
- `item_type`: `lesson` or `placeholder`.
- `lesson_id`: present for lesson items.
- `placeholder_title`: present for placeholder items.
- `planned_minutes`: optional minutes for placeholder or manual duration override.
- `session_date`: date where the item is manually placed.
- `session_client_id`: stable recurring or one-off session client id when
  multiple class sessions occur on the same date.
- `session_sort`: integer order within the session.
- `removed`: true when a lesson has been removed from the calendar plan.
- `created_at`, `updated_at`.

Validation:

- Lesson items require a `lesson_id`.
- Placeholder items require a nonblank `placeholder_title`.
- `session_sort` is required when `session_date` is present.
- `session_client_id` is required with `session_date` when the date has more
  than one session in the generated plan.
- Removed lesson items have `removed = true` and no `session_date`.
- A lesson can have at most one active explicit placement or removal per plan.

## GeneratedScheduledSession

Derived view model, not necessarily persisted.

Fields:

- `date`.
- `weekday`.
- `start_time`.
- `duration_minutes`.
- `canceled`.
- `items`: ordered list of generated lesson chunks and explicit plan items.

Rules:

- Generated sessions start on or after `start_date`.
- Generated sessions include recurring sessions and one-off manual sessions in chronological order.
- Canceled sessions receive no generated lesson items.
- Default lesson order follows unit summary `calendarLessons`.
- Explicitly removed lessons are omitted from generated placement.
- Explicit placements and placeholders appear in their saved session and order.

## State Transitions

Plan state:

```text
no_plan -> weekly_minutes_default -> detailed_sessions
detailed_sessions -> detailed_sessions_with_edits
detailed_sessions_with_edits -> detailed_sessions after reset
```

Session source state:

```text
none -> recurring_only
none -> manual_only
recurring_only -> mixed
manual_only -> mixed
mixed -> recurring_only or manual_only
```

Cancellation state:

```text
active_session -> canceled_session -> active_session
```

Lesson item state:

```text
generated -> manually_placed -> removed_from_plan -> restored_to_generated
```

Placeholder state:

```text
created -> moved -> edited -> deleted
```
