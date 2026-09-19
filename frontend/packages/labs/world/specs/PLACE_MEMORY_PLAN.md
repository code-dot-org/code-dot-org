# Plan: Place and Memory onto the map (CANVAS_FIRST.md, step 4)

STATUS: BUILT, pending a look in the browser. The last two foundation regions
of specs/CANVAS_FIRST.md's step 4, after Look (specs/LOOK_PLAN.md). The
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
- **`memory/actor-state` was to move and does not.** It was written here
  and taken out again; see "Learned".

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

- `2e61e8d1f92` — this plan.
- (next) — `world.properties` in the registry and the world inspector
  marked; `place/position` and `memory/world-state`; the tests; the specs.

## Learned while building

- **An actor's file cannot read the world's own state.** `memory/actor-state`
  was moved onto the map and put back within the hour. Its two Lamps read
  the WORLD's number to start with, which is the lesson's opening
  complaint; a placement has no room for the row that does the reading, so
  the row would have to live in the Lamp's file — and a `.actor` has no
  `world` to read. The module compiled and threw `world is not defined` as
  it loaded. The lesson's shape was never arbitrary: the reading has to be
  in the world's `add actor` body, so the Lamps have to be blocks.
- **Three of this step's five candidates did not move**, and the third
  region running. The table was written from what each lesson is ABOUT; what
  decides is what the editor can do and what the lesson would lose. Two
  lost too much (`place/edges` is about the four trait names, which Enhance
  hides), one was impossible (above), and one wants a feature nobody has
  built (`memory/score`).
- **What `memory/score` wants is already asked for.** specs/MAP_FIRST.md
  says the world's window shows "the starting value of each property its
  rows declare — that is where `set target score to 30` goes". What was
  built reads the world's OWN `define property` rows only. A rule's
  world-scoped property is set by a `set` row under `define world`, which
  is a block to read and rewrite rather than a field's default: different
  machinery, and a step of its own.
- **A lesson that ends on the map need not open there.**
  `memory/world-state` is four steps of blocks and one field, so it opens
  on the workspace and points at the world's properties for the last one.
  `worldView` and "is this lesson on the map" are not the same question.

## Not built, and known

- The world inspector shows the world's own properties and no rule's, so
  `memory/score` stays in blocks and MAP_FIRST.md's sentence about
  `set target score` is still unbuilt.
- `world.properties` is not found when a placement is selected, since the
  world's properties are what the inspector shows with nothing selected.
  Show me then says where they are and rings nothing.
- Every foundation region has now been through the rule. The genres have
  not.

## What to look at in the browser

`place/position`: three Markers in a heap should be three things to drag
apart, and each one's **Pos X** and **Pos Y** should follow the drag and
take a typed number. `memory/world-state`: after declaring **lives**, the
Map tab with nothing selected should list it under the world's properties,
and typing 5 there should be the same edit as changing the block's default.
