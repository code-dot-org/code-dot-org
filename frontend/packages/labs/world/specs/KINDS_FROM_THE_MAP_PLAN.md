# Plan: from a placement to its kind (CANVAS_FIRST.md, step 2)

STATUS: BUILT, pending a look in the browser. The second build step of
specs/CANVAS_FIRST.md. The working record, as before.

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
- **A withheld control is shown, inert, with the lesson that grants it**,
  as a locked rule is in the import dialog: a link that reads "Unlocked
  by:" and the lesson's title, and opens the map on that tile. The Script
  buttons, the Layers list, and the three above.
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
- **The marks stay, and so does their toggle.** A mark says a placement has
  a script, which is true of the file whether or not the learner can open
  it; the toggle shows and hides marks that are drawn either way. (First
  written as "the toggle goes with the Script button", and built that way
  for an hour: see "Learned".)

## Order of work

1. The affordances; the stage's `withheld` in place of hiding; the lesson
   link beside a withheld control. Tests.
2. Enhance and Open in the inspector. Tests.
3. The Creator's seam, the file menus mounted without buttons, and
   `New actor…` on the palette. Tests.
4. Specs.

## Commits

- `1d09a6230ba` — this plan.
- `9954a697055` — Enhance and Open in a placement's inspector; withheld
  controls drawn rather than left out; three affordances; `fileIdForModule`
  moved to the open-module seam.
- `c5f79904e5d` — the Creator's seam; the file menus mounted without buttons;
  `New actor…` on the palette; withheld controls made focusable and
  described, after an accessibility review.

## Learned while building

- **`disabled` was the wrong way to withhold.** The first cut drew a
  withheld button `disabled` with a `title` saying which lesson grants it.
  A disabled button leaves the tab order, and a `title` needs a mouse: a
  keyboard could not reach the control, and so could not find out why. The
  review (the repository's accessibility agent, run on the diff) put that
  first. A withheld control is now `aria-disabled`: it keeps its place in
  the tab order, does nothing, and names the note beside it with
  `aria-describedby`, so what is read on focus is "Unlocked by:" and the
  lesson. The note is always there, as plain words when no lesson grants
  the thing, so the id the control points at names something.
- **Each note beside its own control, with an id of its own.** The first
  cut put both kind buttons first and both lesson links after, and the
  Script button's link four controls later. With two lessons on one row,
  order was the only thing tying a link to its button. Each control now
  names its note, and scripts, which have a way in from the toolbar and
  one from the inspector, have two notes with two ids.
- **The file menus are where the Creator lives, so they are mounted in
  every level.** Lifting the Creator out would have meant lifting a dozen
  things it is built from. A `menus` prop turns the folder buttons off and
  leaves the dialogs and the seam, which is one line in the layout and one
  in the component.
- **The Creator opens the file it writes, and the map does not want
  that.** `createNewFile` makes the new file the active tab. Asked for
  from the map, the file menus put the tab that was in front back in
  front, and tell the asker which kind was made; the palette takes that
  kind in hand, so the next click places it.
- **A killed test run takes its shell with it.** `pkill -f` with a pattern
  that appears in the command's own text matches the shell running it. The
  edits chained after it never ran, and said nothing.

## Not built, and known

- No tile grants the three new affordances, so a gated lab offers Enhance,
  Open and New actor from the first lesson. The pilot assigns them.
- Enhance offers its whole checklist whatever the shelf holds. An ability
  whose rule is not unlocked can be ticked from a lesson that has Enhance.
- The withheld state has not been heard through a screen reader or walked
  with a keyboard in a browser; the tests pin the attributes, not what is
  announced.
- A withheld control is dimmed to 0.55. Whether that reads in the dark
  theme is a thing to look at.

## What to look at in the browser

Select a placement on any map: its properties should offer `Enhance
⟨Kind⟩…`, which opens the checklist on that kind, and `Open ⟨Kind⟩`, which
brings its blocks to the front. The palette should end in `New actor…`;
making one should leave the map in front with the new kind selected, ready
to place. In a lesson, where there are no folder buttons, `New actor…`
should still open the Creator. In a gated lab with `place/script` not done,
the Script buttons should be dimmed and still reachable with Tab, with
"Unlocked by: This one, not the other" beside each, and the Layers list
should be a heading with the same kind of link until `place/layers` is
done.
