# Research: Teacher Calendar Scheduling

## Decision: Keep Existing Unit Summary as Curriculum Source

Rationale: The current calendar already receives lesson id, lesson number, title, duration, assessment status, unplugged flag, and URL from unit summary. That data belongs to curriculum and should remain read-only for section planning.

Alternatives considered:

- Store copied lesson metadata in the plan. Rejected because stale titles, durations, and links would drift from curriculum.
- Recompute all lesson data from the plan endpoint. Rejected because it duplicates unit summary behavior.

## Decision: Add a Section/Unit Calendar Plan Layer

Rationale: The requested behavior is section-specific. A teacher may teach the same unit differently in two sections. A plan keyed by section and unit keeps local planning separate from curriculum and from student access.

Alternatives considered:

- Store settings on the unit. Rejected because units are shared curriculum.
- Store settings on the teacher only. Rejected because a teacher can have multiple sections on different schedules.
- Use hidden lessons for deleted lessons. Rejected because hiding affects student access and the spec says calendar removal should not.

## Decision: Detailed Schedule Opt-In Preserves Minutes-Per-Week Default

Rationale: The spec requires the same order and current behavior by default. A plan with no detailed class sessions should render the existing minutes-per-week grid. Once class sessions exist, render dated sessions.

Alternatives considered:

- Force every teacher to configure sessions. Rejected because it regresses a working default.
- Convert the minutes-per-week dropdown into a synthetic weekly session. Rejected because it hides the distinction between rough planning and real meeting times.

## Decision: Store Dates and Local Times, Not Absolute Instants

Rationale: The teacher is planning class periods, not publishing calendar invitations. Dates such as snow days and times such as Tuesday 11:00 AM are local school facts. Date plus local time plus duration is enough.

Alternatives considered:

- Store full timezone-aware timestamps. Rejected for this phase because the feature does not integrate with external calendars.
- Store only durations. Rejected because teachers need start times and dated sessions.

## Decision: Support Recurring Weekly Sessions and One-Off Manual Sessions

Rationale: Teachers may have no stable weekly pattern. The plan must support recurring sessions for normal school rhythms and one-off manual sessions for irregular calendars, block schedules, testing weeks, assemblies, or teachers who want to build the plan date by date.

Alternatives considered:

- Model every session as one-off dates only. Rejected because it makes regular schedules tedious.
- Model only weekly recurrence plus cancellations. Rejected because it cannot represent irregular schedules without awkward fake recurrence.
- Model one-off sessions as cancellations plus makeup days. Rejected because makeup days are real instructional sessions and should be explicit.

## Decision: Use Deterministic Generation Plus Explicit Overrides

Rationale: The default plan should be reproducible from unit lessons, start date, class sessions, and cancellations. Manual edits should be stored as explicit planned items with session date and order. This lets default sessions shift while deliberate teacher edits stay visible.

Alternatives considered:

- Persist every generated item. Rejected because trivial schedule changes would create large rewrites.
- Store only a custom lesson order. Rejected because the teacher can put multiple items in one session and add placeholders.

## Decision: Model Placeholders as First-Class Plan Items

Rationale: Placeholders need titles, optional planned minutes, session placement, and ordering. Treating them like plan items makes move/edit/delete behavior uniform.

Alternatives considered:

- Store placeholders as notes on a session. Rejected because teachers need to order placeholders among lessons.
- Store placeholders as fake lessons. Rejected because they are not curriculum and have no lesson URL.

## Decision: Use Existing DatePicker Wrapper and Native Time Fields

Rationale: The feature needs external picker and field components for dates and
times. The app already has a dashboard `DatePicker` wrapper backed by
`react-datepicker`. MUI X Date Pickers were tried, but the current package
pulled in runtime helpers that are not compatible with the Dashboard bundle
format. Use the existing wrapper for date fields, native `type="time"` inputs
for time fields, and keep DSCO fields for ordinary text such as placeholder
titles.

Alternatives considered:

- Use legacy `sharedComponents/DatePicker`. Rejected for new UI because it is a legacy wrapper and does not cover the full date/time field need.
- Add MUI X Date Pickers. Rejected for now because the current package fails in
  the Dashboard runtime.
- Build custom date/time inputs. Rejected because the user asked for external libraries and custom date/time controls are easy to get wrong.

References:

- Existing dashboard DatePicker wrapper: `/private/tmp/teacher-calendar-scheduling-spec/apps/src/sharedComponents/DatePicker.jsx`

## Decision: Use an External Calendar Display Library

Rationale: The calendar display needs dated sessions, time slots, event rendering, cancellations, and likely drag/drop or click-to-move affordances. A library should own calendar layout and navigation.

Recommended options:

1. FullCalendar
   - Pros: Official React connector, time grid and day/week views, interaction plugin, strong event rendering hooks, recurrence support through its RRule plugin, active documentation.
   - Cons: Larger dependency and CSS surface; styling must be reconciled with Code.org design tokens.
   - Best fit if the first implementation needs robust week/day calendar behavior, recurring events, exceptions, and direct manipulation.

2. React Big Calendar
   - Pros: React-first event calendar, flexbox layout, existing Moment localizer path, simpler conceptual model.
   - Cons: Recurrence and exception handling should remain in our own planner code; drag/drop behavior needs extra setup and testing.
   - Best fit if we want a lighter calendar shell and are comfortable generating all session instances ourselves.

Recommendation: Spike FullCalendar first. It is more likely to cover recurring weekly sessions plus one-off sessions cleanly, especially if the UI evolves toward drag/drop lesson movement.

References:

- FullCalendar React docs: https://fullcalendar.io/docs/react
- FullCalendar TimeGrid docs: https://fullcalendar.io/docs/timegrid-view
- FullCalendar RRule docs: https://fullcalendar.io/docs/rrule-plugin
- React Big Calendar docs: https://jquense.github.io/react-big-calendar/

## Decision: Use Design-System Controls Around External Pickers

Rationale: The repo prefers DSCO and MUI over legacy components. Date fields use the existing external `react-datepicker` wrapper for compatibility; surrounding controls such as dropdowns, dialogs, tabs, toggles, and non-date text fields should still use DSCO or MUI according to the local design-system guidance. `moment-timezone` is already in `apps/`.

Alternatives considered:

- Replace all form controls with raw MUI components. Rejected because the repo guidance prefers DSCO for controls that have DSCO equivalents.
- Use legacy `sharedComponents/DatePicker`. Rejected for new UI because design-system controls are preferred.

## Decision: Use `@dnd-kit` Only if Direct Manipulation Is Needed

Rationale: `@dnd-kit` is already available and used in the codebase. It supports sortable keyboard interactions better than older drag/drop options. The implementation should still provide buttons or menus for move/delete so keyboard and screen-reader users can complete the task.

Alternatives considered:

- Use `react-beautiful-dnd`. Rejected because the package is older and already coexists with a newer local pattern.
- Avoid drag/drop entirely. Viable for a first implementation if menus are clearer and faster to ship.

## Decision: Keep Shared Unit Overview Calendar Stable

Rationale: `UnitCalendarGrid` is shared by unit overview printing and dialog behavior. The teacher dashboard detailed calendar has different semantics: dated sessions, cancellations, placeholders, removed lessons, and editable items. New components can avoid regressions in existing overview surfaces.

Alternatives considered:

- Extend `UnitCalendarGrid` to handle both weekly and dated plans. Rejected for now because it increases risk to existing print/dialog behavior.
