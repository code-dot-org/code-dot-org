# Plan: Enhance behind the shelf

STATUS: BUILT, pending a look in the browser. The last of the gaps
specs/KINDS_FROM_THE_MAP_PLAN.md recorded: the Enhance checklist offers every
ability whatever a gated lab has unlocked, so a tick can bring in a rule no
lesson has granted. The working record, as before.

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

- `dfff959ec96` — this plan.
- `4b0f5440992` — what a row would take; the checklist's gate; the tests.

## Learned while building

- **A tick takes more than it says.** "Falls when nothing holds it up"
  brings Gravity, and Gravity brings three more. A gate written from each
  row's own list of rules would have let three through per tick; taking
  the row and diffing the project catches the whole chain without anybody
  writing it down.
- **The checklist already had two ways to say no**, and the right one was
  neither. A row the actor cannot take is left out; a row it already has
  is ticked and locked. A row a lesson has not reached yet is a third
  thing: it is an answer to "what can this one do", just not yet, so it is
  shown and refused with the lesson named.
- **The words are the same as everywhere else** — "Unlocked by:" and the
  lesson's title — and here they are words rather than a link, because
  this list is inside a modal that it cannot close.

## Not built, and known

- A row is refused for the FIRST rule it would take that is not unlocked,
  and says one lesson. A row that takes two withheld rules names the
  first; finishing that lesson may leave the row still refused.
- Nothing gates the actors, animations or sprites an enhancement brings —
  the health bar row writes an actor. Those have their own unlocks and
  their own dialogs, which do gate; this closes the rules' door only.
- Working out what a row takes means applying it, which is a fold over the
  project per row. It is memoized per draft, and the list is thirty rows.

## What to look at in the browser

In a gated lab early in the progression, open Enhance on any actor: the
rows whose rules are not unlocked yet should be greyed with "Unlocked by:"
and a lesson's name beside them, and should not tick. In an ungated lab —
which is every lab unless a level says otherwise — nothing should look any
different from before.
