# Plan: Enhance behind the shelf

STATUS: IN PROGRESS. The last of the gaps specs/KINDS_FROM_THE_MAP_PLAN.md
recorded: the Enhance checklist offers every ability whatever a gated lab
has unlocked, so a tick can bring in a rule no lesson has granted. The
working record, as before.

## The problem

The shelf governs what a project can TAKE (`progression/shelf`): the
import dialogs refuse a rule that no finished tile grants, and the toolbox
leaves out a block nobody has earned. Enhance takes rules too — a tick on
"Walks and jumps like a platformer" writes Jumping, Physics and Input into
the project — and asks nothing. It is the one door into the library that a
gate does not reach.

## What is being built

- **A row whose rules are not unlocked is shown and cannot be ticked**,
  with the lesson that grants the first missing one said beside it. Shown
  rather than left out: the list answers "what can this one do", and a
  thing it could do once a lesson is done is part of that answer. A row an
  actor CANNOT take is still left out, which is a different question.
- **What a row would take is worked out by taking it.** An enhancement's
  `apply` is a pure fold over the project, and every stock rule lands as
  `rules/<id>.rule`, so applying a row to the draft and diffing the rule
  files names exactly the rules it brings — dependencies and all. Nothing
  has to be written down twice, and a row that changes what it imports
  cannot drift from what the gate asks about.

## Decisions taken before building

- **The lesson is named, not linked.** Every other withheld thing in the
  lab offers a way to the lesson that grants it. This one is inside a
  modal, and the checklist is shown by two different frames, neither of
  which it can close; two modals on screen at once is what the
  accessibility checklist says to avoid rather than manage. The words are
  the same, and the map is one button away behind the dialog.
- **Asked of the draft, not the project.** What a row would take is asked
  of the project with the ticks so far folded in, which is what `offered`
  and the questions already ask of. A row whose rule an earlier tick has
  brought is not taking it again.
- **A rule already in the project is not being taken.** `importStockRule`
  leaves one it finds alone, so the diff is empty and the row is offered —
  which is the shelf's own rule: it governs what a project can take, not
  what it has.

## Order of work

1. What a row would take, as a pure function. Tests.
2. The checklist's row. Tests.
3. Specs: the gap closed in KINDS_FROM_THE_MAP_PLAN.md, this record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
