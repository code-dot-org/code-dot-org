# Plan: a field you can build a form out of (APPS.md, missing thing 6)

STATUS: BUILT, not yet seen in the browser. The last of the six things specs/APPS.md says an app
wants. The working record, as the other plans are.

## What the Text Input is, and what a form asks of it

The field is further along than the list was. It listens to what was
TYPED rather than to keys, so shift, a dead key, an IME and a paste all
work; it has a caret that inserts rather than appends, arrows that walk
it, a window that slides to keep it in view, and a focus that belongs to
the screen rather than to the field.

What it has none of is everything a FORM needs:

- **No hint.** An empty field says nothing about what belongs in it.
- **No kind.** Every field takes anything, so "how many?" takes `banana`.
- **No validity.** A project can decide an answer is wrong and has no way
  to say so on the field.
- **No done.** Enter does nothing, so a one-field form has no way to be
  submitted from the keyboard.

## What is being built

Four small things on the Text Input, which is where all four belong.

- **`hint`** — words drawn in the field while it is empty, dimmed, and
  gone the moment anything is typed. Not the text: a hint the first
  keystroke has to delete is the bug the field was careful to avoid when
  it shipped empty rather than saying "Label".
- **`only numbers`** — a boolean, and the ONE kind worth having. A
  number is what an app asks for that a word is not: a quantity, an
  amount, how many. Anything else a field might restrict — letters only,
  no spaces — is a vocabulary this does not invent, and a project can
  refuse in its own handler.
- **`looks wrong`** — a boolean a PROJECT sets, drawn as a red edge. The
  lab does not know what valid means and does not guess; what it owns is
  saying so once somebody has decided.
- **`is done`** — an event Enter raises while the field has the focus. A
  form's submit, and the keyboard half of the button beside it.

## Decisions taken before building

- **The hint is drawn, not stored in the text.** Anything else means a
  field whose value is a lie until somebody types.
- **`only numbers` refuses at the door.** The `types` handler drops a
  character that is not a digit, so the field never holds a thing it said
  it would not. Checking afterwards and complaining is what `looks wrong`
  is for, and the two are different jobs.
- **A minus and a dot are digits here.** A number field that cannot say
  `-2` or `1.5` is a counting field wearing the wrong name. What it
  refuses is letters.
- **Validity is a project's word, not the field's.** The field has no
  idea what an email is.
- **Enter does not clear anything.** What happens after a form is
  submitted is the project's, and a field that emptied itself would take
  the answer away before the handler could read it.

## Order of work

1. This plan.
2. The four, and the drawing that shows two of them. Tests.
3. Specs: APPS.md's sixth thing, UI_ACTORS.md's table, and this record.

## What this deliberately leaves

**The on-screen keyboard** — BUILT since, and specs/KEYBOARD_PLAN.md has
it. Half of the pricing below held and half did not, which is worth
leaving standing rather than editing away.

The guess was: an on-screen keyboard is a MAP of Buttons and one action on
the field — put this character in — so a stock map and an action, not an
engine change. The map was right. The action was wrong twice over. An
action on the FIELD names the field, and a keyboard that names a field
works for that field and nothing else; and `type ⟨…⟩`, which names
nothing, could not be written over `addTyped` because a click handler runs
after the step that reads what was typed. It took two engine additions —
what the world types belongs to the next frame, and a control may say it
never takes the focus.

## Commits

- `3e9cae9bd1b` — this plan, and the on-screen keyboard priced.
- `c62554f8b21` — the four, the drawing, and seven cases that play them.

## Learned while building

- **An outline is paint, not a command.** It arrives in the picture as
  `stroke` on the shape it was drawn with (`core/drawing`), so a test
  looking for an `outline` command finds nothing however red the edge is.
- **`draw paragraph` draws the actor's OWN words.** Every other caller
  wants exactly that, so the hint is the one line in the file that says
  the same thing with the text swapped.
- **The digits test wanted no new block.** The text drawer says plainly
  that `indexOf` and its family are "string surgery with no reading in a
  world yet"; a list of twelve characters and `has` reads better than
  either a new block or a regular expression.

## Not built, and known

- **One kind, and it is numbers.** Letters-only, no-spaces and a length
  limit are each a line in a project's own handler, and each would be a
  word in a vocabulary this does not have.
- **Nothing validates.** `looks wrong` is a boolean somebody else sets.
  The field will not tell you an email is not one, and should not.
- **Enter does not move on.** Tab does, through Tab Navigation; a form
  where Enter goes to the next field rather than submitting is a decision
  a project can make in the `is done` handler.
- **The Text Area gets none of this.** A hint would suit it; a number
  kind would not, and `is done` means something else where Enter makes a
  line.
- **The on-screen keyboard**, the last thing on the apps list — built
  since, and it cost two engine additions the pricing above did not
  foresee (specs/KEYBOARD_PLAN.md).

## What to look at in the browser

A form. Two fields, one with a hint and one that takes numbers only. The
hint should be dim, should be there before anything is typed, and should
go on the first keystroke rather than needing deleting. The number field
should refuse letters while taking `-1.5`.

Set `looks wrong` on one from a handler and its edge should go red while
the other stays. Press Enter in a field and the handler should fire with
what was typed still in it.
