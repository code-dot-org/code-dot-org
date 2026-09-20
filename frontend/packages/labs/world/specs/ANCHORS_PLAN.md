# Plan: anchoring a placement (APPS.md, missing thing 2)

STATUS: PROPOSED. The thing specs/UI_ACTORS.md deferred on purpose and
named a trigger for. The working record, as the other plans are.

## The trigger, and that it has been pulled

UI_ACTORS.md deferred anchoring and said exactly when it would stop being
optional:

> A position is a position. This is safe TODAY and only today… What would
> pull it is one interface shared between two worlds of different shapes,
> which is exactly what a stock interface MAP is.

Stock interface maps exist. The pause menu is on the shelf and is loaded
over whatever world asked for it, and specs/SCREENS_PLAN.md has just made
screens something a project moves between. A panel placed at (304, 16) is
in the corner of one world and the middle of the next.

## What a position is today

- **A placement's position is a property override**, keyed by the trait
  that owns it, and it is a place in the MAP.
- **A map knows how big it is** — `size` and `tile`, which is what the map
  editor's width and height set.
- **A world knows how big its view is** — `viewSize`, which is the world's
  own or a Viewport's drawn size. Fixed for a given world, and different
  between worlds.
- **A layer may be fixed to the screen**, which is what makes an interface
  layer ignore the camera. That is about scrolling, not about shape, and
  it does nothing for a window of another size.

## What is being built

**An anchor on the PLACEMENT**, not on the actor — the answer
UI_ACTORS.md guessed at, and for its reason: a kind stays a kind, and an
arrangement says where things sit.

- **One optional field per placement**, `anchor`, naming one of nine
  places: the four corners, the four edge middles, and the centre. Absent
  means what absent has always meant, which is a position in the map.
- **Resolved WHEN THE MAP LOADS**, and never again. A world's view does
  not change while it runs, so there is nothing to keep up to date; what
  differs is which world the map was loaded into.
- **The offset is measured, not authored.** A placement keeps the position
  it was dragged to. At load, the distance from that position to the
  anchor's point IN THE MAP is measured, and the placement is put that far
  from the anchor's point IN THE VIEW. So a learner drags a thing into the
  corner and says "bottom right", and it is in the corner of any window.
- **A dropdown in the inspector**, beside the Layer one it is shaped
  after.

## Decisions taken before building

- **Nine places and no numbers.** An anchor with a fractional origin is a
  layout engine's idea and wants a vocabulary this lab does not have. Nine
  named places is what a person means when they say "keep it in the top
  right".
- **The map's own size is the reference.** It is what the editor draws
  against, so what a learner sees while authoring is the arrangement at
  the map's shape, and the anchor says what survives a different one.
- **A map with no size anchors nothing.** There is nothing to measure the
  offset against, and guessing one would move things for no reason. A map
  block synthesising placements has no size, and that case stays exactly
  as it is.
- **Not a property on the spatial trait**, though that would have come
  with an inspector row for free. Every actor in every world would have
  grown an `anchor`, which is a fact about an ARRANGEMENT and not about a
  thing — and the inspector has a per-placement dropdown already, so the
  free row was not worth the wrong home.
- **No reflow, no layout.** Anchoring moves one placement relative to one
  edge. Two things that must stay beside each other is parenting's
  question (specs/PARENTING.md), and it is answered.

## Order of work

1. This plan.
2. The format and the loader, with the arithmetic in a pure module. Tests.
3. The inspector's dropdown. Tests.
4. The stock interface maps anchored, so the pause menu is right in a
   world of any shape.
5. Specs: UI_ACTORS.md's deferral answered, APPS.md's second thing, and
   this record.

## Commits

## Learned while building

## Not built, and known

## What to look at in the browser
