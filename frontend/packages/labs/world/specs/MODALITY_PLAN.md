# A screen over a screen

A dialog takes the clicks. Everybody knows this and nothing in the lab said
it, so the first app built here had a key on its on-screen keyboard also
pressing the button on the screen behind it, opening a second copy of the form
it was typing into, mid-word (specs/APPS.md).

## What was wrong

A click goes to every actor under the pointer. That is right for a game — a
shot through two overlapping targets hits two targets — and wrong for an
interface, where the thing in front is the only thing there is.

The same was true of the keyboard. A player behind a dialog kept hearing keys
and kept walking about while the dialog was being read, and Tab walked the
route straight through the dialog into the form behind it.

## The shape of the answer

NOT "the topmost map wins", which was the first thing to try and is wrong by
one case. An on-screen keyboard is loaded OVER the form it fills
(specs/KEYBOARD_PLAN.md). Measured from the top of the stack, the keyboard
would lock out the form it exists to type into — the SAVE button under it
would be dead, and so would the field.

So the stack is not a ranking, it is a stack with one line drawn across it:

- **A map says whether it covers what is under it.** `WorldMap.modal`, written
  in the `.map` file and ticked in the map editor's inspector with nothing
  selected ("Covers what is under it") — beside the theme, since both are facts
  about the map that are not about where things are. A world's main map is not
  offered it: that map shows the world's inspector instead, and nothing can ever
  be under it.
  A screen says yes. A HUD, a keyboard, a toast say no.
- **Input stops at the TOPMOST modal load.** Everything placed by that load or
  by anything above it can be reached; everything below cannot
  (`World.canReach`).

Home, then a modal form, then a keyboard: the form and the keyboard are both
live, home is not. That is the arrangement an app actually has.

## Why it is on the map

A dialog is a dialog wherever it is put on, so the fact belongs to the thing
rather than to the block that loads it. `load map` and `go to screen` both
honour it, which is how the pause menu got it for one line: it is a screen and
always was, and `pause the game` was never the same promise — a paused game
still turns clicks into events, so the level's buttons were live underneath a
menu asking whether to quit.

It is a property rather than a default because the two kinds of overlay are
genuinely different and the lab cannot guess which is meant. A default of
"modal" breaks every HUD; a default of "not" is what every map already says,
so nothing written before this changed behaviour.

## What asks

Three rules deliver input and all three now ask the same question:

- **The pointer**, in `rules/pointing`'s `under` — shared by Mouse and
  Gestures, so a press and a drag were fixed in one place. The reachability is
  folded INTO the hit test rather than added at each call site: both askers
  want "what did the pointer hit", an actor behind a dialog is not hit, and one
  place to be right beats two to remember.
- **The keyboard**, in `rules/input` — the trait walk that decides who hears
  `presses`, `releases` and `types`. The WORLD-level key events are NOT
  filtered: they are about nobody, and a project handling "space is pressed"
  with no actor is saying it wants the key however the screens are arranged.
- **The route**, in `rules/tabNavigation` — Tab skips what is covered, and
  `take the focus` refuses it, the same place and for the same reason
  `takes the keyboard` is refused there.

## The focus has to move, not just stop

Focus is a property of an actor, so it survives the thing in front arriving:
open a dialog over a focused field and the field is still holding it, still
drawing its ring, still where Tab counts from. The typing stops reaching it —
that is `rules/input` asking the same question — but the ring behind the
dialog is a lie.

So a step in `sense` moves the focus to the front of the route when whoever
holds it can no longer be reached. It MOVES rather than drops: dropping hands
Tab back to the page, so the first Tab inside a freshly opened dialog would
walk the reader out of the game, which is the trap `capture the ⟨tab⟩ key`
exists to avoid.

`focus the first control` now asks the ROUTE rather than every focusable
actor. They used to be the same list. A world whose only fields are behind a
dialog would otherwise have reached past the dialog for the thing it covers.

## What it does not do

- **It does not restore the focus when the screen closes.** The field that had
  it before the dialog opened does not get it back; the route simply has more
  in it again. Remembering wants a stack of its own, and nothing has asked.
- **It does not dim or block DRAWING.** A covered screen is still painted,
  which is what makes a dialog look like a dialog. Only input stops.
- **It does not stop a covered actor ACTING.** Steps still run, timers still
  fire, a patrolling guard still patrols. Stopping the world is what `pause
the game` is for, and the two are deliberately separate: a menu that pauses
  says so, and a dialog over a live game is a thing people build on purpose.
- **A modal inside a Viewport is not answered.** Screens are the root space's
  stack, and a modal in the root covers every other space whole — a level
  playing in a Viewport is behind whatever is over the window. A modal loaded
  INSIDE a Viewport is not a case anybody has needed.
- **An actor no map placed is behind everything.** `add actor` in a world's
  body, a bullet a handler made: they belong to no load, so a dialog covers
  them. That is what a dialog over a game has to mean, and it is why the
  question is asked of the LOAD rather than of a layer.

## Obligations

- `world_can_reach` in the Engine drawer — a rule's question, not a
  project's. What a project says instead is which of its maps are screens.
- The map editor's tick box, or the flag is one only a fixture can set.
- `modality.test` for the arithmetic, `appPlays` for the case that found it.
