# Plan: Input and Motion onto the map (CANVAS_FIRST.md, step 4)

STATUS: IN PROGRESS. The first two regions of specs/CANVAS_FIRST.md's step
4, after the pilot (specs/PILOT_PLAN.md) was seen working. The working
record, as before.

## What moves, and how far

Four lessons. The rest of Input and Motion are behavior — a handler, a
condition, a tween — and stay where they are.

- **`input/two-hands`, map then blocks.** Its task is swapping one election
  for another. `Enhance Ship…` ticks "Drives like a car"; the Ship then has
  both readings of the four keys at once, which is the lesson's own
  sentence made visible; opening the Ship and deleting the `use trait ⟨Moves
Across⟩` row is what settles it. Step three adds Slows Down, a row in the
  file the learner already has open.
- **`motion/speed`, map then blocks.** The Hero is a placement. Deleting
  the per-frame handler and electing Physics are rows in the Hero's file;
  the SPEED is then a field in the placement's properties, which is the
  lesson's point said in the place the lesson is about.
- **`motion/units`, map.** One number, in the inspector. The Ball is a
  placement carrying a speed, and the whole lesson is changing it.
- **`motion/drag`, map then blocks.** The Ball's speed is a field, and
  electing Slows Down is a row in its file.

## Decisions taken before building

- **A lesson moves as far as the lab can take it, and no further.**
  CANVAS_FIRST.md's table said `input/two-hands` was "swap one ability for
  another in Enhance" and `motion/drag` "an ability and a field". Neither is
  quite true: Enhance only ADDS, so it cannot take `Moves Across` off, and
  there is no row for Drag or for plain Physics — the checklist is written
  in game-shaped abilities ("Drives like a car"), and "elects the Physics
  rule" is not one. Inventing rows to make the table true would put the
  engine's vocabulary in a list written to avoid it. The table is corrected
  instead.
- **Electing by hand is not a consolation prize.** `motion/speed` is ABOUT
  electing, and `input/two-hands` about two elections fighting. The elected
  row is the subject of both, and Enhance is the thing that hides it
  — which is why `input/arrows` opens the Hero afterwards
  (specs/PILOT_PLAN.md). These two keep the row in front.
- **A value set on ONE placement, not on the kind.** `motion/units` and
  `motion/drag` set a speed in the inspector, which writes the placement's
  own override. That is the difference the map teaches and a block in the
  world could not: this Ball, not every Ball.
- **Show me links as each lesson moves**, and the registry test holds them
  (specs/SHOW_ME_PLAN.md).

## Order of work

1. The four lessons, their tiles' words, their Show me links.
2. The tests: each solved on the map and in blocks, the toolbox table, the
   lists of which lessons open on the map.
3. Specs: CANVAS_FIRST.md's table corrected and its step marked, this
   record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
