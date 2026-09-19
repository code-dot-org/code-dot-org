# Plan: Place and Memory onto the map (CANVAS_FIRST.md, step 4)

STATUS: IN PROGRESS. The last two foundation regions of
specs/CANVAS_FIRST.md's step 4, after Look (specs/LOOK_PLAN.md). The
working record, as before.

## What moves, and how far

- **`place/position`, map then blocks.** Three Markers in a heap, and a
  position is two numbers: this is the inspector's own pair, and moving
  them is dragging them. The fourth Marker, somewhere random, stays a
  block — a random place is worked out when the world is built, which no
  field can say.
- **`memory/world-state`, blocks then map.** Declaring the number and
  reading it are blocks, and stay. What moves is the last step, which is
  the lesson's point made twice: changing the default to five. That is a
  field in the world's own properties, with nothing selected on the map.
- **`memory/actor-state`, blocks then map.** Declaring the property is a
  row in the Lamp's file. Setting each Lamp's own copy is then a field on
  each placement, which is the lesson's whole sentence — every copy the
  world places carries one of its own — said in a place where two copies
  are two things you can click.

## What does not move, and why

- **`place/edges` stays in blocks.** Enhance has a row for wrapping and
  none for staying in the map, and its rows are named for what a game
  wants ("Comes back on the other side") rather than for the traits. This
  lesson is ABOUT the four trait names and which axis each is on, so a
  checklist that hides them works against it.
- **`memory/score` stays in blocks.** CANVAS_FIRST.md's table said "the
  target is a world field". It is not: the world inspector shows the
  world's OWN `define property` rows (`mapEditor/worldProperties`), and a
  target score is a Scoring RULE property, set by a `set` row under
  `define world`. Showing a rule's world-scoped properties there is what
  specs/MAP_FIRST.md asked for and is a step of its own, not a side errand
  inside a lesson.

## What has to be built first

- **A name for the world's own properties.** `world.properties`, so a
  lesson can point at them; the world inspector is marked with it. With a
  placement selected it is not on screen, and Show me then says where it
  is and rings nothing, which is what a place that is not there does.

## Decisions taken before building

- **`memory/actor-state`'s text row moves into the Lamp's file.** Its
  starter sets each Lamp's text in the world's `add actor` body, which a
  placement has no room for. In the kind it is one row using the Lamp's
  own number, which is the better telling: same row, two values.
- **That widens the tile's check by one word.** Its shape half asks that
  `main.world` read the Lamp's property back. Read in the Lamp's own file
  it is the same claim — the property is declared AND used — so the check
  accepts either file. The near-miss it names is still refused by the
  other half.

## Order of work

1. `world.properties` in the registry, and the world inspector marked.
2. The three lessons, their tiles' words, their Show me links.
3. The tests, and the one check's inspect.
4. Specs: CANVAS_FIRST.md's table, PROGRESSION.md, this record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
