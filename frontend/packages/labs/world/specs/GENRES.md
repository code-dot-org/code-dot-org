# Assessment: the genres onto the map

STATUS: PROPOSED. Nothing here is built. specs/CANVAS_FIRST.md left the
genres out of its table — "they are built from the foundations' vocabulary
and are mostly behavior; they follow once the foundations are seen to
work". The foundations are done (specs/PLACE_MEMORY_PLAN.md), so this is
the same rule applied to the other forty lessons, and a recommendation for
the order to build them in.

## What changed the answer

When CANVAS_FIRST.md guessed, a placement's inspector was a position, a
few own properties and a Viewport's map. Since then a placement shows a
field for every property of every trait its kind elects — seen in the
browser when `motion/speed` gained a **Can Move** group the moment the
trait was elected — and the world's window shows a rule's world-scoped
properties as well (specs/WORLD_RULE_FIELDS_PLAN.md).

That is most of what a genre lesson does. "Set **jumps allowed** to 2",
"set the Belt's **belt speed** to a negative number", "set **glide
seconds** to 0.2", "set the Far Pad's **pad color** to red": each is a
number or a colour on ONE thing, which is what the inspector is. A dozen
lessons that read as blocks are fields.

## The rule, unchanged

An arrangement, a value a thing holds, or an election is told on the map.
Behavior — a handler, a condition, a loop, an expression — is told in
blocks, opened from the thing it is about. A lesson moves as far as the
lab can take it and no further, and a lesson ABOUT an election keeps the
row in front rather than hiding it behind a tick
(specs/INPUT_MOTION_PLAN.md).

## Platformer

| Tile                  | Where  | What moves                                            |
| --------------------- | ------ | ----------------------------------------------------- |
| `platformer/ground`   | map    | two elections, Carries and Rides, both Enhance rows   |
| `platformer/pads`     | map    | pad colour is a field; the third pad is a click       |
| `platformer/walls`    | map    | wall colour and "passes through" are fields           |
| `platformer/jump`     | both   | jumps allowed is a field; the swap is blocks          |
| `platformer/jetpack`  | both   | the jetpack is an Enhance row; the handlers are not   |
| `platformer/ladders`  | both   | already sends a learner to Enhance; the keys are rows |
| `platformer/surfaces` | both   | four elections and a belt speed                       |
| `platformer/enemies`  | both   | travel speed, turn by, heading — three fields         |
| `platformer/hunter`   | both   | close enough is a field; the swap is blocks           |
| `platformer/flier`    | both   | glide seconds and least dive are fields               |
| `platformer/digging`  | both   | closes after is a field                               |
| `platformer/hazards`  | both   | mercy time is a field; the handler is not             |
| `platformer/pickups`  | both   | two elections; the count is a handler                 |
| `platformer/level`    | blocks | a condition and two handlers                          |

## Arcade

| Tile            | Where  | What moves                                        |
| --------------- | ------ | ------------------------------------------------- |
| `arcade/zap`    | both   | Zaps and Expires are Enhance rows                 |
| `arcade/paddle` | blocks | deleting a handler; Boundaries has no Enhance row |
| `arcade/bounce` | blocks | the value is set on a KIND, not on one wall       |
| `arcade/bricks` | blocks | counting is a loop and a condition                |
| `arcade/waves`  | blocks | arithmetic on a timer                             |

## Puzzle

| Tile           | Where  | What moves                                 |
| -------------- | ------ | ------------------------------------------ |
| `puzzle/goal`  | both   | the target score is a world field already  |
| `puzzle/grid`  | blocks | the lesson is about taking two traits OFF  |
| `puzzle/push`  | blocks | one trait, then reading the rule behind it |
| `puzzle/turns` | blocks | swapping a hat                             |
| `puzzle/undo`  | blocks | two abilities and three handlers           |

## Story

| Tile           | Where  | What moves                                       |
| -------------- | ------ | ------------------------------------------------ |
| `story/text`   | both   | the Speech Box is placed and its text is a field |
| `story/form`   | both   | tab order is a field on each of three placements |
| `story/script` | both   | how many lines is a field                        |
| `story/scene`  | both   | the backdrop is the layer inspector's            |
| `story/reveal` | blocks | a handler and an action                          |
| `story/choice` | blocks | a condition and a world value set at run time    |

## Adventure

| Tile               | Where  | What moves                                     |
| ------------------ | ------ | ---------------------------------------------- |
| `adventure/rooms`  | map    | BUILT (specs/RETIREMENTS_PLAN.md)              |
| `adventure/people` | both   | the parent is a field on the Label's placement |
| `adventure/world`  | both   | the backdrop is the layer inspector's          |
| `adventure/keys`   | blocks | conditions about what an actor is carrying     |
| `adventure/errand` | blocks | an expression                                  |

## Simulation

| Tile                   | Where  | What moves                                      |
| ---------------------- | ------ | ----------------------------------------------- |
| `simulation/dials`     | both   | the default is a world field, turned as it runs |
| `simulation/steering`  | both   | two elections and a keep distance               |
| `simulation/many`      | blocks | a loop                                          |
| `simulation/neighbors` | blocks | a query into a socket                           |
| `simulation/emergent`  | blocks | two lines of vector arithmetic                  |

## The count

Of forty lessons: four told on the map, nineteen half told there, and
seventeen in blocks. The foundations came out fourteen of twenty-nine, and
the genres are no more map-first than the foundations were — what changes
is WHICH half moves. A foundation moves its subject; a genre keeps its
subject in blocks and moves the numbers it is tuned with.

## What this would want that the lab has not got

- **An Enhance row for several traits the genres elect**: Steps on the
  Grid, Can Be Pushed, Can Be Dug, Turns When It Hits Something, Can Be
  Climbed, Stays in the Map. Each is a `use trait` row today. Where the
  lesson is ABOUT the election, that is right; where it is scaffolding for
  a lesson about something else, a row would help. Not needed for any
  lesson to move.
- **Nothing else.** Every "both" above is a field or an Enhance row that
  already exists.

## Recommended order

1. **Platformer**, thirteen lessons and the two cleanest full moves
   (`ground`, `pads`). It is the biggest region and the one whose lessons
   are most tuned by numbers, so it settles the pattern for the rest.
2. **Story and Adventure**, which lean on the layer inspector and on
   parenting.
3. **Simulation and Puzzle and Arcade**, which are mostly blocks and will
   go quickly.

Each region as its own plan and its own commit, as the foundations were.
