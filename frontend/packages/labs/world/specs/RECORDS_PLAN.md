# Saving things, not just numbers

An app keeps RECORDS. A todo is words, a tick and a date; a contact is a name
and a number; a recipe is a title and a list of lines. Today a project can
save a list of words and nothing else, which is why the Notes fixture files
each entry as `2000-01-01  milk` — one string with a date glued to the front,
because a string is all there is (specs/SAVING_PLAN.md, specs/APPS.md).

That works for one field and collapses at two. Deleting row three means
deleting it from three parallel lists kept in step by position, and the first
thing anybody does with a todo list is tick something.

## The record already exists

It is an actor. An actor has named typed fields (`define property`), an editor
that edits them (the map inspector), blocks that read and write them, and a
picture. Inventing a second thing with named fields — a `record` value type,
its own blocks, its own inspector — would be a second way to say what the lab
already says, and everything downstream would have to learn both.

So: **no new value type.** What is missing is not a way to describe a record,
it is a way to keep one.

## The question SAVING_PLAN left open, answered by splitting it

"No actors. What a saved GAME is stays unanswered, deliberately: it wants a
vocabulary for identity across runs that this language does not have."

That is one sentence covering two different problems, and separating them is
the whole of this design.

**Restoring a COLLECTION.** Fifty notes, a contact list, the rows of an
inventory. These had no identity to lose: there were no notes before, and
afterwards there are fifty. Nothing has to be matched to anything. This is
what an app needs, and it needs no vocabulary the lab lacks.

**Restoring a PARTICULAR actor.** The player, who exists already, whose
position should be put back rather than a second player made. This needs to
say WHICH actor a stored record is about, across two runs of a program, and
that is the hard problem — a name that survives a reload, and what happens
when the map no longer has that actor.

This plan does the first and does not do the second. That is not a dodge: the
first is the one an app is made of, and the second is a saved GAME, which is a
different feature with different questions (what about actors the map placed?
what about a level half finished?).

## The shape

Two blocks, beside the two a world already has:

    remember every ⟨Note⟩ as ⟨"notes"⟩
    bring back every ⟨Note⟩ from ⟨"notes"⟩

`remember every` writes one record per actor of that kind, in order. `bring
back every` makes one actor per stored record and answers HOW MANY — a number
rather than the boolean its neighbours answer, because "was there anything
saved" is `> 0` and the count is strictly more useful. A first run answers 0,
which is the same thing a start screen already asks `recall` for.

**IT ADDS, IT DOES NOT REPLACE.** Calling it twice makes two sets. A project
that might is expected to say `remove actor ⟨any ⟨Note⟩⟩` first, which is one
block it already has. The alternative — quietly clearing first — would make
`bring back` destroy actors it was never shown, which is a worse surprise than
duplicates a project can see.

**Order is kept**, because a list's order is part of what was saved.

## What a record holds

**The actor's OWN properties, and nothing else.** A kind's `define property`
rows are what that kind says its state is. Trait properties are a rule's
business: where it is, whether it has the keyboard, how much health it has.

This is a real line and it has a real consequence: a project that wants
something saved declares it as the kind's own property. That is a forcing
function in the direction the lab already pushes — `subject` is the Health
Bar's because whose health it shows is nobody else's idea
(specs/UI_ACTORS.md).

**Not position.** A note comes back into whatever the screen lays out, not to
the pixel it was at on a different-sized window. A project that genuinely
wants a remembered place declares one.

**Not references.** A property of type `actor` or `actors` holds a live actor,
and across two runs there is nothing for it to point at. `loadMap` resolves a
reference in a second pass because both ends are in the same map; two runs are
not. These are refused rather than stored as something that will not resolve.

## What it costs

Small, which is the point of putting the record on the actor:

- `World.rememberActors(kind, name)` and `World.recallActors(kind, name)`,
  beside `save`/`recall`, writing the same `world-lab.memory.<name>` key
  shape and reporting the same way when a browser refuses.
- Two blocks in the World category, granted by whatever tile grants saving.
- The stored form is the actor's own properties by id, exactly as `save`
  already writes the world's — plus the kind's module path, so `bring back`
  knows what to make.
- **Forgiving on both sides**, as `recall` already is: a property the data
  does not mention keeps its default, and a stored property the kind no longer
  declares is ignored. Saved data outlives edits, and a value nothing can hold
  is not worth taking a project down for.

## What this unlocks, and what it finishes

A todo list, a contact book, a recipe box, a habit tracker, a high-score table
with names — the app ideas that were out of reach with one string per row
(specs/APPS.md).

It also completes the rows-as-actors story from the other end. A Scroll View
shows a map of real rows (specs/SCROLLING_PLAN.md); this is where those rows
come from and go back to. A todo row is an actor with `text` and `done`, shown
in a Scroll View, remembered by kind.

## Not done, deliberately

- **Saved games.** See above. The identity question is real and unanswered.
- **Actors the MAP placed.** `bring back` makes new actors; it does not
  reconcile with what a map already put there. A project saving a kind it also
  places in a map will get both, and should place none.
- **No schema, no versioning, no migration.** Consistent with what saving
  already promises: a saved shape that changes is one a learner clears.
- **No query.** There is no "the notes where `done` is false" — that is
  `filter actors where ⟨…⟩`, which already exists and works on what came back.
- **One browser, one name.** Unchanged, and still the thing to fix before any
  of this is a real product (specs/SAVING_PLAN.md).
- **Nothing is saved automatically.** A block says when.

## Obligations

- Engine tests for the round trip, for the refusals (references, absent
  kind), and for the forgiving read.
- A play test that makes records, saves, builds a NEW world over the same
  storage, and finds them — as `appPlays` does for the world's own memory.
- Blocks granted by a tile, or they are on nobody's shelf
  (`shelfCoverage.test`).
- Notes stops gluing a date to a string, which is the demonstration that
  this was the missing piece.
