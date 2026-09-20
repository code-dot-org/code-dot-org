# Plan: a field you can build a form out of (APPS.md, missing thing 6)

STATUS: PROPOSED. The last of the six things specs/APPS.md says an app
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

**The on-screen keyboard**, which specs/APPS.md calls the piece most
likely to be a real engine change. Looked at, it is not one: `capture the
⟨…⟩ key` only stops the browser's default and cannot press anything, but
nothing needs to press anything. An on-screen keyboard is a MAP of Buttons
and one action on the field — put this character in — which is the same
insert the `types` handler already does. It is a stock map and an action,
not an engine change, and it is the next piece rather than this one.

## Commits

## Learned while building

## Not built, and known

## What to look at in the browser
