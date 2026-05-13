# Calendar Library Spike

## Context

The teacher dashboard calendar needs a dated view of class sessions. It must
show recurring weekly sessions, one-off sessions, cancellations, lesson items,
and placeholder items. Teachers should be able to inspect and change a plan
without losing the existing weekly-minutes fallback.

The app already uses React and MUI. The plan calls for external libraries for
date/time fields and for the calendar display.

## Options

### FullCalendar

FullCalendar has first-class React support, day and time grid views, event
content hooks, drag/drop hooks, keyboard-accessible event rendering surfaces,
and plugins for user interaction. It does not require the app to adopt a new
date model.

Pros:

- Good fit for week and day time-grid displays.
- Event rendering hooks can show lessons and custom placeholders.
- Mature interaction plugins support later drag/drop work.
- Session events and lesson events can share one calendar instance.
- Does not require moment-localizer glue.

Cons:

- Larger dependency family.
- Styling must be scoped carefully so it does not look foreign in dashboard.

### React Big Calendar

React Big Calendar is a smaller React-oriented calendar with day/week views and
drag/drop add-ons.

Pros:

- React component API is straightforward.
- Moment support matches an existing dependency.

Cons:

- Drag/drop support is more add-on driven.
- Event rendering and recurring-session UX require more local convention.
- Styling is less aligned with the detailed interaction model in this feature.

## Decision

Use FullCalendar for the calendar display.

Install:

- `@fullcalendar/core`
- `@fullcalendar/react`
- `@fullcalendar/timegrid`
- `@fullcalendar/daygrid`
- `@fullcalendar/interaction`
- `@fullcalendar/rrule`
- `rrule`

Use the existing dashboard `DatePicker` wrapper for date fields. It is backed by
the external `react-datepicker` package already present in `apps/`. Use native
HTML time inputs for time fields. MUI X Date Pickers were tested first, but the
current MUI X package pulled in runtime helpers that are incompatible with the
Dashboard bundle format.

The first implementation should keep FullCalendar as a display and selection
surface. Plan generation remains local, deterministic TypeScript. The saved
plan payload remains the source of truth.
