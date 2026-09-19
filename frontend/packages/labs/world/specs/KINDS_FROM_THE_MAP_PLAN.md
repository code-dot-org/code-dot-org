# Plan: from a placement to its kind (CANVAS_FIRST.md, step 2)

STATUS: IN PROGRESS. The second build step of specs/CANVAS_FIRST.md. The
working record, as before.

## The problem

A lesson told on the map needs three things the map editor cannot reach.
Electing a trait is the Enhance checklist; reading what a Hero is means
opening `hero.actor`; making a new kind is the Actor Creator. All three open
from the file menus, which a lesson turns off, or from a wand on `define
actor`, which is in the workspace. From the canvas there is no way to any.

And a gated lab HIDES what it withholds in the map editor: no Script
button, no Layers list. A learner looking round cannot tell a thing that is
not theirs yet from a thing that does not exist.

## What is being built

- **In a placement's inspector: `Enhance ⟨Hero⟩…` and `Open ⟨Hero⟩`.** The
  first asks the lab for the Enhance dialog on that kind's file, through
  the seam the file menus and the wand already use
  (`actors/enhance/actorEnhance`). The second makes the kind's file the
  active tab. Both are about the KIND, and say its name, since a placement
  is one of many and a tick in Enhance changes them all.
- **On the palette: `New actor…`**, which opens the Actor Creator. The
  Creator is the file menus' and is built from a dozen things they hold, so
  it stays there and is asked for through a seam of its own; the file menus
  are mounted with their buttons off when a level has no browser, so the
  seam is answered in a lesson. The world stays the active tab when the
  actor is made: the new kind is on the palette, which is where a learner
  who asked from the map wants it.
- **A withheld control is shown, disabled, with the lesson that grants
  it**, as a locked rule is in the import dialog: a link that reads
  "Unlocked by:" and the lesson's title, and opens the map on that tile.
  The Script buttons, the Layers list, and the three above.
- **Three more affordances**: `map-enhance`, `map-open-kind`,
  `map-new-actor`.

## Decisions taken before building

- **No tile grants the three new affordances yet.** A tile grants what its
  lesson teaches, and no lesson is told on the map with them until the
  pilot (CANVAS_FIRST.md, step 3). What no tile grants, everybody holds
  (`progression/shelf`), so until then they are offered in every lab. The
  pilot assigns them: Open to Origin, Enhance to `input/arrows`, New actor
  to `look/sprite`.
- **The toolbox keeps hiding.** A disabled control with a lesson's name is
  right for five controls and wrong for a hundred and fifty blocks
  (CANVAS_FIRST.md).
- **The marks stay, and their toggle goes with the Script button.** A mark
  says a placement has a script, which is true of the file whether or not
  the learner can open it.

## Order of work

1. The affordances; the stage's `withheld` in place of hiding; the lesson
   link beside a withheld control. Tests.
2. Enhance and Open in the inspector. Tests.
3. The Creator's seam, the file menus mounted without buttons, and
   `New actor…` on the palette. Tests.
4. Specs.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
