# Plan: a pilot of three lessons on the map (CANVAS_FIRST.md, step 3)

STATUS: IN PROGRESS. The third build step of specs/CANVAS_FIRST.md: three
lessons retold on the map, one of each kind the proposal's rule makes, to be
seen in the browser before the other fifteen follow. The working record, as
before.

## The three

- **`origin/first-world`, on the map.** Its task is an arrangement: a
  second Hero, somewhere the first is not. The Hero is a placement; the
  second is a click on the palette and a click on the map. Then the lesson
  READS blocks, which is the first time a learner sees any: `Open Hero`
  shows the file that says what a Hero is, and changing its picture there
  changes both.
- **`input/arrows`, on the map, with Enhance.** Its task is an election.
  `Enhance Hero…` and one tick elect what the lesson used to have added row
  by row. The lesson's point is that an actor ELECTS what a rule offers, and
  a tick hides the row that says so (CANVAS_FIRST.md, "Open"). So the lesson
  then opens the Hero, finds the rows the tick wrote, pulls one out to see
  what it was doing, and changes the speed beside them.
- **`motion/gravity`, both.** Falling and ground are two elections and an
  arrangement: Enhance the Hero, Enhance the Ground, paint a floor. Hearing
  "stops falling" is a hat, which is behavior, which is blocks: the second
  half opens the Hero and adds one.

## Decisions taken before building

- **The checks stand as they are.** All three are outcome checks: two
  actors drawn, the Hero moves with the keys, the Hero falls and lands.
  Enhance writes the `use trait` rows a learner would, and a placement is an
  actor, so a lesson done on the map passes the check it had. The tests
  solve each lesson both ways, on the map and in blocks, since a learner who
  opens the World view and does it there has done it.
- **Who grants what.** `origin/first-world` grants `map-open-kind`, which is
  what it teaches: the way from a thing to what it is. `input/arrows` grants
  `map-enhance`. `motion/gravity` is not downstream of Input, so it OFFERS
  Enhance, as any lesson offers what it needs and does not teach
  (specs/PROGRESSION.md, "A lesson may hand you what you have not
  unlocked"). `map-new-actor` waits for `look/sprite`.
- **The blocks Origin grants stay granted.** A learner who opens the World
  view in the first lesson finds a toolbox of seven blocks, which is an
  honest answer to what is theirs.
- **A second picture in the first lesson.** Changing the Hero's picture
  was step three with one picture in the project. The lesson gains a second,
  so the change can be seen.

## Order of work

1. The three lessons, their tiles' words and grants, and their tests.
2. Specs: PROGRESSION.md's rows, CANVAS_FIRST.md's step, this record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
