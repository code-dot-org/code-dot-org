# Proposal: the first lessons on the canvas

STATUS: PROPOSED. specs/CURRICULUM_PLAN.md left one question for a
decision: whether the first lessons move onto the canvas. The answer was
yes, with a condition. This is what that would take, lesson by lesson, and
the order to build it in. Nothing here is built except where it says so.

## The decision

- The first lessons start on the map, in the visual editor.
- Blocks are shown when a lesson needs programmable behavior, and not
  before.
- The World workspace is never locked. A learner can open it from the first
  lesson, look round, and see what is and is not theirs yet.

The third is BUILT: for a day a gated lab withheld a world's Map view until
`place/map`, and that gate is gone (`mapEditor/WorldEditor`). Neither view
is ever withheld. What a gate withholds is inside a view.

## What there is to build on

The lab already has a whole way of making a game without a block, and the
curriculum uses almost none of it:

- the MAP EDITOR: a palette of the project's kinds, placing by click,
  moving by drag, and an inspector with a field per property the placement's
  traits declare (specs/MAIN_MAP_PLAN.md);
- the WORLD'S PROPERTIES as fields, with nothing selected — `target score`
  is a number typed into a box;
- the ACTOR CREATOR: a name, a picture, and abilities, ending in a file
  (specs/ACTOR_CREATION_WIZARD.md);
- the ENHANCE checklist: some thirty abilities in six groups — "Being the
  player", "Gravity and ground", and so on — each of which writes the
  `use trait` rows and imports the rules a learner would otherwise add by
  hand;
- LAYERS and a layer's backgrounds, and a SCRIPT on a placement.

Two of these cannot be reached from a lesson. The Creator and Enhance open
from the file menus, which a lesson turns off (`showFileBrowser: false`),
and from a wand on `define actor`, which is in the workspace. Nothing in the
map editor opens either, nor the file of the kind a placement is.

## The rule for which lessons move

A lesson's task is one of four things, and that decides where it is told:

| The task is            | Told on | With                                   |
| ---------------------- | ------- | -------------------------------------- |
| an ARRANGEMENT         | the map | the palette, a drag, the layer list    |
| a VALUE a thing holds  | the map | the inspector; the world's fields      |
| an ELECTION of a trait | the map | Enhance, from the thing selected       |
| BEHAVIOR               | blocks  | the kind's file, or a placement script |

Behavior is a handler, a condition, a loop, a name for a value. That is
what blocks are for, and the lesson that needs one opens the workspace from
the thing it is about. Most lessons are a mix: `motion/gravity` elects
Falling and paints a floor, which is the map, and then hears "starts
falling", which is a hat.

## Origin and the six foundations, by that rule

`map` is told on the map, `blocks` stays as it is, `both` starts on the map
and opens blocks for its second half.

| Tile                 | Where  | What changes                                                        |
| -------------------- | ------ | ------------------------------------------------------------------- |
| `origin/first-world` | map    | place a second Hero by clicking; drag it; Run. Then READ the blocks |
| `input/arrows`       | map    | Enhance ⟨Hero⟩: moves with the arrow keys; its speed is a field     |
| `input/press`        | blocks | once per press is a handler: the first lesson to write one          |
| `input/mouse`        | blocks | a reaction to a click is a handler                                  |
| `input/two-hands`    | map    | swap one ability for another in Enhance                             |
| `motion/speed`       | both   | velocity is a field; deleting the per-frame handler is blocks       |
| `motion/gravity`     | both   | Enhance: falls; paint ground. "Starts falling" is a hat             |
| `motion/force`       | blocks | a push is an action in a handler                                    |
| `motion/units`       | map    | one number, in the inspector                                        |
| `motion/drag`        | map    | an ability and a field                                              |
| `motion/tween`       | blocks | a tween is declared and played                                      |
| `logic/*` (4)        | blocks | a condition is the definition of behavior                           |
| `memory/variable`    | blocks |                                                                     |
| `memory/many`        | blocks | a loop                                                              |
| `memory/world-state` | both   | declaring is a block; the starting value is a world field           |
| `memory/actor-state` | both   | declaring is a block; each Lamp's number is a field on that Lamp    |
| `memory/lists`       | blocks |                                                                     |
| `memory/score`       | map    | import Scoring; the target is a world field                         |
| `look/sprite`        | map    | the Creator's picture step and the image editor                     |
| `look/drawing`       | blocks | a drawing that reads a number is commands                           |
| `look/background`    | map    | a layer's background, tiled and slid, in the layer's inspector      |
| `look/animation`     | both   | pick the animation; playing it on a walk is a handler               |
| `look/effect`        | blocks |                                                                     |
| `place/position`     | both   | three places by drag and by field; a random place is a block        |
| `place/edges`        | map    | two abilities                                                       |
| `place/map`          | map    | BUILT                                                               |
| `place/layers`       | map    | BUILT                                                               |
| `place/script`       | map    | BUILT; the first blocks a Place learner writes                      |
| `place/camera` (2)   | blocks | until a world's camera is in its inspector (MAP_FIRST.md)           |

Eighteen of thirty-three: twelve move and six half move. Logic does not
move at all, which
is the decision's second line said as a region: Logic is where blocks are
needed, and it is one step from Origin.

The genres are not in this table. They are built from the foundations'
vocabulary and are mostly behavior; they follow once the foundations are
seen to work.

## What has to be built first

1. **The main map before the world's rows.** Found in step 6: a row under
   `define world` cannot name a placement, because the main map is loaded
   after the rows. `place/layers` kept its Hero in blocks to get round it.
   With every lesson's actors on the map, every camera and every `the
⟨Hero⟩` under `define world` hits it. The map has to load first, after
   the rules and the layers and before the rows.
2. **The way from a placement to its kind.** In a placement's inspector:
   `Enhance ⟨Hero⟩…`, which is the dialog that exists, and `Open ⟨Hero⟩`,
   which opens `hero.actor`. On the palette: `New actor…`, which is the
   Creator. Behind the shelf, as everything in the editor is.
3. **What a withheld control looks like.** Today a gate HIDES: the toolbox
   drops a drawer, the map editor drops the Script button. The import
   dialogs do the other thing: a locked rule is shown, greyed, and names the
   lesson that grants it. For exploring "what is and is not unlocked", the
   second is right for the map editor's handful of controls, and wrong for
   the toolbox, where it would put a hundred and fifty grey blocks in front
   of somebody who has met three. Recommended: the map editor shows a
   withheld control disabled with the lesson's name; the toolbox keeps
   hiding.

## What does not need building

- **Most checks.** An outcome check plays the game and reads the world, and
  Enhance writes the same `use trait` rows a learner would. A lesson retold
  on the map passes the check it has. The shape checks that look for a block
  under `define world` need to read the map as well, as `place/layers` now
  does.
- **The grants.** Origin grants seven blocks today. They stay granted: a
  learner who opens the World view in the first lesson sees a toolbox of
  seven, which is an honest answer to what is theirs. Tiles that move to the
  map grant what they granted; what changes is the telling.

## Order of work

1. The main map loads before the rows; `place/layers`' Hero moves onto the
   map as the proof. BUILT (specs/MAP_BEFORE_ROWS_PLAN.md).
2. Enhance, Open and New actor from the map editor; withheld controls shown
   inert with their lesson. BUILT (specs/KINDS_FROM_THE_MAP_PLAN.md).
3. A pilot of three lessons, one of each kind: `origin/first-world` (map),
   `input/arrows` (map, with Enhance), `motion/gravity` (both). Seen in the
   browser before going on. BUILT (specs/PILOT_PLAN.md), not yet seen.
4. The rest of Input, Motion, Look, Place and Memory by the table.
5. The genres, by the same rule.

## Open

- **Where a kind's behavior is written when the lesson starts on the map.**
  `input/press` is about every Lamp, so it is the Lamp's file, reached by
  `Open ⟨Lamp⟩`. A learner who has just met placement scripts will reach for
  one instead, and for one Lamp it works. Whether the early lessons teach
  the script first and the kind later, or the other way, is a teaching
  decision this table does not make.
- **Whether Enhance is a lesson's answer or its shortcut.** `input/arrows`
  teaches that an actor ELECTS what a rule offers. A tick in a checklist
  does the electing and hides the row that says so. The pilot should have
  the learner open the Hero afterwards and find the row.
