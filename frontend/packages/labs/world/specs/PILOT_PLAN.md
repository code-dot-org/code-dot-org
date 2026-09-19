# Plan: a pilot of three lessons on the map (CANVAS_FIRST.md, step 3)

STATUS: BUILT, pending a look in the browser. The third build step of
specs/CANVAS_FIRST.md: three lessons retold on the map, one of each kind the
proposal's rule makes, to be seen in the browser before the other fifteen
follow. The working record, as before.

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

- `2107faf0d93` — this plan.
- `2fdcdfa12b6` — the three lessons on the map; their tiles' words and
  grants; their tests, each solved both ways; PROGRESSION.md.

## Learned while building

- **Not one check changed**, which was CANVAS_FIRST.md's claim and is now
  a measurement. The three are outcome checks. A placement is an actor,
  so "two actors drawn" counts a click on the map. Enhance writes `use
trait` rows, so "the Hero falls and lands" is passed by two ticks. The
  tests apply the real fold (`enhanceWith`) to the lesson's own project and
  play the lesson's own check, and read the rows the ticks wrote.
- **The old solutions still pass too.** A second Hero by `add actor`, the
  two `use trait` rows by hand: each lesson keeps a test for the block
  telling, since the World view is never locked and a learner who does it
  there has done it.
- **Two lessons stopped sending anybody to the toolbox.** The table of
  blocks a lesson asks for (`toolboxShelf.test`) is empty for
  `origin/first-world` and `input/arrows`. `motion/gravity` asks for a hat
  and `print`, which is its blocks half.
- **Enhance says more than the lesson does.** Its tick for four directions
  elects three traits, the third being Reads the Keyboard, and its words
  say "how fast it goes is a block in its file". The lesson names two of
  the three rows and lets the third be found.
- **The first lesson could not show a change of picture.** It asked for
  one with one picture in the project. It has two now.

## Not built, and known

- Nothing pins a lesson's words to the editor's labels. These three say
  "Enhance Hero…", "Open Hero", "the strip along the top", "Moves in all
  four directions", "Falls when nothing holds it up", "Holds things up".
  A renamed control or ability leaves a lesson pointing at nothing, and no
  test would say so.
- `input/arrows`' step four, pulling a row out and snapping it back, leaves
  the lesson failing its check while the row is out. That is intended and
  is what the row was for; it may still read as breakage to a learner who
  presses Check then.
- The genres and the other fifteen foundation lessons are as they were.

## What to look at in the browser

`origin/first-world`: it should open on the map with one Hero. Clicking
Hero in the strip and then the map should place a second; `Open Hero`
should bring `hero.actor` to the front, and changing `set sprite` there to
the coin should change both when run. The check should pass with two on
the map.

`input/arrows`: `Enhance Hero…` should list "Moves in all four
directions"; after ticking it the Hero should walk with the arrow keys, and
`Open Hero` should show the rows it wrote. Dragging `use trait ⟨Moves
Down⟩` aside should leave left and right working.

`motion/gravity`: two ticks, one on the Hero and one on the Ground, should
make it fall and land; painting more Ground should extend the floor; and
`when ⟨this actor⟩ stops falling` should be in the Hero's toolbox under
Gravity. In a gated lab opened on this lesson, Enhance should be usable
although `input/arrows` has not been done.

What to judge, beyond whether it works: whether the map is a better first
screen than the workspace was, and whether opening blocks from a thing
reads as natural or as a jump.
