// The lessons, for the tiles that have one.
//
// A lesson is a `WorldScenario` — a starting project, its instructions, and
// what the level says about the editor — which is the same thing a demo
// scenario is (`src/fixtures/scenarios.ts`), and deliberately so: a tile is a
// scenario with a tree around it, and one authoring shape serves both.
//
// SEPARATE FROM THE CATALOGUE, and the reason is weight rather than taste. A
// lesson holds whole rule workspaces — the biggest stock rule is 390KB — and
// the catalogue is imported by the map, by the layout test and by anything that
// wants to know what a tile is called. Those should not drag a megabyte of
// Blockly JSON behind them. So `catalogue.ts` stays data about tiles, and the
// projects live here, looked up by tile id.
//
// Forty-five of sixty-seven, which is milestone 4 of specs/PROGRESSION_UI.md
// and then some. ALL SIX FOUNDATIONS are written — Origin, Input, Motion, Logic,
// Memory, Look and Place — so every genre gate on the map is open, and the
// first hours of the progression can be walked end to end. ARCADE is written
// whole after them, Platformer but for one tile (`platformer/ground` waits on
// the engine: specs/PROGRESSION.md, "Carrying"), and STORY is written whole.

import {
  actorFile,
  chain as chainRows,
  drawText,
  fill,
  me,
  num,
  rectangle,
  setSprite,
  setText,
  showAs,
  swatch,
  useTrait,
  words,
} from '../../actors/stock/workspace';
import type {WorldScenario} from '../../fixtures/scenarios';
import type {LessonProperties, TileId} from '../types';

import {lessonSource} from './support';
import {
  addActor,
  anyKind,
  declareProperty,
  local,
  placeAt,
  worldFile,
} from './worlds';

// No `tiles` on any of these worlds: a world that says nothing is one screen,
// ten tiles each way, 320 by 320 (`VIEWPORT_TILES`). Saying so out loud is an
// idea about maps bigger than the view, and none of these lessons has one.

// ── origin/first-world ───────────────────────────────────────────────────────

const firstWorld: WorldScenario = {
  name: 'First light',
  description: 'A world with one actor in it, and a Run button.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(160, 160)])],
      actors: [{id: 'hero', name: 'Hero', rows: [setSprite('player.png')]}],
    }),
    sprites: ['player'],
  }),
  instructions: `
## A world with something in it

Press **Run**. There is a world, and there is one thing in it.

Two blocks say all of it. **define world** is the world, and what is listed
under it is what gets put in it. **define actor ⟨Hero⟩** says what a Hero *is* —
here, one picture and nothing else.

Read them in that order and you have read the whole project.

### What you do

1. Add a **second** \`define actor\`, and give it a name of its own.
2. Give it a picture with **set sprite**.
3. **add actor** it to the world, somewhere the Hero is not.
`.trim(),
};

// ── input/arrows ─────────────────────────────────────────────────────────────

const arrows: WorldScenario = {
  name: 'Make it go',
  description: 'A player that ignores you, and the trait that changes that.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(160, 160)])],
      actors: [{id: 'hero', name: 'Hero', rows: [setSprite('player.png')]}],
    }),
    sprites: ['player'],
    rules: ['arrows'],
  }),
  instructions: `
## Make it go

Press the arrow keys. Nothing happens — the Hero does not know about them.

This project holds the **Arrow Keys** rule. A rule a project holds does nothing
by itself: an actor has to *elect* what it offers. (The count on \`define world\`
says how many rules are in play; click it to see them.)

### What you do

1. Add **use trait ⟨Moves Across⟩** under \`define actor ⟨Hero⟩\`.
2. Run it. Left and right work; up and down do not.
3. Add **Moves Down** as well, and now it walks in every direction — which is
   what a top-down game wants and a platformer does not.
4. Find the speed the trait gave the Hero, and change it.
`.trim(),
};

// ── motion/speed ─────────────────────────────────────────────────────────────

const speed: WorldScenario = {
  name: 'Speed is not a place',
  description: 'Moving by hand every frame, and the rule that replaces it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(40, 160)])],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            setSprite('player.png'),
            {
              // In `move`, the moment of the frame when things go somewhere —
              // which is exactly the moment the Physics rule would have done this
              // for it, and is the point of the lesson.
              type: 'world_trait_step',
              fields: {PHASE: 'move', NAME: 'shuffle right'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_position',
                    inputs: {
                      ACTOR: {block: {type: 'world_this_actor'}},
                      X: {
                        block: {
                          type: 'math_arithmetic',
                          fields: {OP: 'ADD'},
                          inputs: {
                            A: {
                              block: {
                                type: 'world_get_Space_PositionProperty',
                                fields: {COMPONENT: 'x'},
                                inputs: {
                                  ACTOR: {block: {type: 'world_this_actor'}},
                                },
                              },
                            },
                            B: num(2),
                          },
                        },
                      },
                      Y: {
                        block: {
                          type: 'world_get_Space_PositionProperty',
                          fields: {COMPONENT: 'y'},
                          inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    }),
    sprites: ['player'],
    rules: ['motion'],
  }),
  instructions: `
## Speed is not a place

The Hero crosses the screen, and it does it the way everybody writes first:
**every frame, put it two pixels further right**. Read the \`each frame\` under
\`define actor ⟨Hero⟩\`, which is the whole of how it does it.

That works, and it is not how things move. It ties the speed to the frame rate,
it cannot be pushed, and nothing else can affect it.

### What you do

1. Add **use trait ⟨Can Move⟩** to the Hero — that is the Physics rule.
2. Set its **speed** once, when the world starts.
3. **Delete the whole \`each frame\` handler.** It should still cross the screen.

Nothing is moving it now. It has a speed, and having a speed is what moving is.
`.trim(),
};

// ── motion/gravity ───────────────────────────────────────────────────────────

const gravity: WorldScenario = {
  name: 'Down',
  description: 'A thing in the air, some ground, and nothing pulling.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        // Directly above the ground, and that is not decoration: at x 160 and
        // 192 the two 32-pixel sprites overlap by nothing at all, and the Hero
        // falls past the corner of the floor. The lesson's check found it.
        addActor(local('hero'), [placeAt(160, 40)]),
        addActor(local('ground'), [placeAt(160, 272)]),
      ],
      actors: [
        {id: 'hero', name: 'Hero', rows: [setSprite('player.png')]},
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['player', 'ground'],
    rules: ['gravity'],
  }),
  instructions: `
## Down

The Hero is in the air and stays there. The **Gravity** rule is in this project
— the count on \`define world\` says so — and nothing has elected it.

### What you do

1. Give the Hero **use trait ⟨Affected by Gravity⟩**. Run it: it falls, and it
   keeps falling, straight through the floor.
2. Give the Ground **use trait ⟨Acts as Ground⟩**. Now it lands.
3. Add a **when ⟨Hero⟩ stops falling** handler and print something, so you can
   see the moment happen.
4. Click the **eye** on \`use trait ⟨Affected by Gravity⟩\` to open the rule
   itself, and find the number that says how hard it pulls. Change it and run
   again — it is your copy.
`.trim(),
};

// ── look/sprite ──────────────────────────────────────────────────────────────

const sprite: WorldScenario = {
  // THE FILE BROWSER IS ON, for the same reason `memory/actor-state` has it:
  // the lesson's subject is the file. Step three opens the picture and paints
  // on it, and a `.png` opens by being opened — there is no eye on `set sprite`
  // the way there is on `use trait`, and no other way in.
  levelData: {showFileBrowser: true},
  name: 'A picture is a file',
  description: 'An actor drawing a grey box, and the picture it could have.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(160, 160)])],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [],
          drawing: {
            width: 24,
            height: 24,
            commands: [fill(swatch('#8d8d99')), rectangle(0, 0, 24, 24)],
          },
        },
      ],
    }),
  }),
  instructions: `
## A picture is a file

The Hero is a grey box because that is what \`define actor ⟨Hero⟩\` says to
draw. Nothing in this lab is built in: a picture is a **file** the project
holds, and until it holds one there is nothing to draw but shapes.

This is the first lesson with a file browser down the left, and that is the
lesson: the pictures are files like everything else, so they are in the list
like everything else.

### What you do

1. Add **set sprite** to the Hero, and use the \`(import…)\` row on its dropdown
   to bring a picture in. Look at \`sprites/\` on the left afterwards — it is
   really there, and it is yours, not a link to the library's.
2. Run it. The sprite wins; the drawing underneath is what an actor does when it
   has no picture.
3. Open the picture you imported and **paint on it**. It is yours now — the copy
   in the library is untouched.
`.trim(),
};

// ── look/drawing ─────────────────────────────────────────────────────────────

/** `set fraction of ⟨this actor⟩ to ⟨n⟩` — the Progress rule's one number. */
const setFraction = (value: number) => ({
  type: 'world_set_Progress_FractionProperty',
  inputs: {ACTOR: me(), VALUE: num(value)},
});

/** `draw rectangle at x ⟨⟩ y ⟨⟩ size ⟨width⟩ by ⟨⟩`, with any width block. */
const bar = (width: object) => ({
  type: 'world_draw_rectangle',
  inputs: {X: num(0), Y: num(0), WIDTH: width, HEIGHT: num(12)},
});

const drawing: WorldScenario = {
  name: 'Draw it yourself',
  description:
    'Two progress bars that are both full, and one of them should not be.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('bar'), [placeAt(160, 110), setFraction(1)]),
        addActor(local('bar'), [placeAt(160, 210), setFraction(0.35)]),
      ],
      actors: [
        {
          id: 'bar',
          name: 'Bar',
          rows: [useTrait('Progress#ShowsProgressTrait')],
          drawing: {
            width: 96,
            height: 12,
            commands: [
              fill(swatch('#3d3d47')),
              bar(num(96)),
              fill(swatch('#4caf50')),
              // The number this lesson is about: the green bar is as wide as
              // the track, whatever the Bar it is drawn for happens to hold.
              bar(num(96)),
            ],
          },
        },
      ],
    }),
    rules: ['progress'],
  }),
  instructions: `
## Draw it yourself

Two Bars. One is set to **1** and one to **0.35**, and both are drawn full,
because the green rectangle is 96 wide — a number somebody typed.

An actor with no picture paints itself. \`define drawing\` is a pen and a few
shapes, and it is what every meter, bar and box in this lab is made of. It runs
**for each actor of that kind**, so anything it reads off the actor is that
actor's own.

### What you do

1. Find the second **draw rectangle** — the green one — under
   \`define actor ⟨Bar⟩\`.
2. Put **96 × ⟨fraction of ⟨this actor⟩⟩** in its **size** where the 96 is.
3. Run it. One Bar is full and one is a third full, from one drawing.
4. Change the track colour, or add an outline. It is your picture.
`.trim(),
};

// ── look/background ──────────────────────────────────────────────────────────

const background: WorldScenario = {
  name: 'Behind everything',
  description:
    'A world on a flat colour, and the picture that belongs behind it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        {
          type: 'world_set_background_color',
          inputs: {COLOR: swatch('#7ec8e3')},
        },
        addActor(local('hero'), [placeAt(160, 200)]),
      ],
      actors: [{id: 'hero', name: 'Hero', rows: [setSprite('player.png')]}],
    }),
    sprites: ['player'],
  }),
  instructions: `
## Behind everything

A flat blue sky, and a Hero standing on nothing. The blue is the world's
**background colour** — one colour behind everything, which is what a world
draws when nobody has given it a picture.

A **backdrop** is that picture. It is not an actor: it has no position, nothing
can touch it, and no rule can reach it. It is what is behind the game.

### What you do

1. Add **set background to ⟨…⟩**, and use the \`(import…)\` row on its dropdown
   to bring a backdrop in from the library.
2. Run it. It is stretched to fill the view — one copy, whatever shape it is.
3. Add **draw background ⟨tiled⟩**. Now it repeats instead of stretching, which
   is what a picture of grass or bricks wants.
4. Add **slide background to ⟨x 40 y 0⟩** and run it again. The backdrop moved
   and the Hero did not: they are not in the same world at all.
`.trim(),
};

// ── look/animation ───────────────────────────────────────────────────────────

const animation: WorldScenario = {
  name: 'Pictures in a row',
  description: 'A Hero that slides along without ever moving its legs.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(160, 160)])],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('player.png'),
          ],
        },
      ],
    }),
    sprites: ['player'],
    rules: ['arrows'],
  }),
  instructions: `
## Pictures in a row

Walk the Hero left and right. It slides: the picture never changes, because a
sprite is one picture and that is all it can be.

An **animation** is a file too, and what is in it is not pictures — it is a
list of RECTANGLES cut out of one image, and how long to hold each one. The
image is a strip of frames; the animation says which part is which frame.

### What you do

1. Add **play animation ⟨…⟩ on ⟨this actor⟩** under \`define actor ⟨Hero⟩\`, and
   use the \`(import…)\` row on its dropdown to bring a walk cycle in.
2. Run it. The legs move.
3. Open the animation and look at the frames — the image is one picture with
   the walk laid out across it, and the file is where each frame's rectangle
   is written down.
4. Change how long a frame is held, and run it again.
`.trim(),
};

// ── look/effect ──────────────────────────────────────────────────────────────

const effect: WorldScenario = {
  name: 'An effect is a recipe',
  description:
    'A world drawn plainly, and the filters that change how it is painted.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        {
          type: 'world_set_background_color',
          inputs: {COLOR: swatch('#1b2530')},
        },
        addActor(local('hero'), [placeAt(120, 160)]),
        addActor(local('coin'), [placeAt(220, 160)]),
      ],
      actors: [
        {id: 'hero', name: 'Hero', rows: [setSprite('player.png')]},
        {id: 'coin', name: 'Coin', rows: [setSprite('coin.png')]},
      ],
    }),
    sprites: ['player', 'coin'],
  }),
  instructions: `
## An effect is a recipe

A Hero and a Coin, drawn exactly as their pictures are.

An **effect** is not a picture and not an actor: it is a description of how to
paint one — the same picture, put through a recipe. It is a file like everything
else, and the same file can be played on one actor, on a whole layer, or over
the entire view.

### What you do

1. Add **add effect ⟨…⟩ to ⟨this actor⟩** in \`define actor ⟨Coin⟩\`, and use the
   \`(import…)\` row to bring one in from the library.
2. Run it. The Coin is painted through the recipe and the Hero is not — one
   effect, on one actor.
3. Now add **add effect ⟨…⟩ to the world**. Everything goes through it, the
   backdrop included, because that one is over the whole view rather than on
   anything in it.
4. The effect's numbers are knobs on the block. Turn one and run it again.
`.trim(),
};

// ── place/position ───────────────────────────────────────────────────────────

const position: WorldScenario = {
  name: 'x and y',
  description: 'Three markers in a heap, and three places to put them.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('marker'), [placeAt(160, 160)]),
        addActor(local('marker'), [placeAt(160, 160)]),
        addActor(local('marker'), [placeAt(160, 160)]),
      ],
      actors: [{id: 'marker', name: 'Marker', rows: [setSprite('coin.png')]}],
    }),
    sprites: ['coin'],
  }),
  instructions: `
## x and y

Three Markers, all in the same place, so it looks like one. A position is two
numbers: **x** across, and **y** DOWN — which is the one that catches everybody,
because a bigger \`y\` is further down the screen, not further up.

The world is 10 tiles each way, and a tile is 32 pixels: 320 across and 320
down.

### What you do

1. Put one Marker in the **top left** corner, one in the **bottom right**, and
   leave one in the middle.
2. Put a fourth somewhere **random** — there is a block for a whole place at
   once, and it is the one a game actually wants.
`.trim(),
};

// ── input/press ──────────────────────────────────────────────────────────────

const press: WorldScenario = {
  name: 'A key is an event',
  description:
    'Walking is a key HELD. A jump is a key PRESSED. They are not the same reading.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('hero'), [placeAt(160, 160)])],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('player.png'),
          ],
        },
      ],
    }),
    sprites: ['player'],
    rules: ['arrows', 'input'],
  }),
  instructions: `
## A key is an event

Hold the left and right arrows. The Hero walks for as long as you hold them —
the trait reads the keys sixty times a second and moves a little each time.

Some things should not work that way. A jump should happen ONCE however long
you lean on the button.

### What you do

1. Give the Hero **use trait ⟨Takes Keyboard Input⟩**. On its own it does
   nothing: it is the Hero electing to be told about keys at all.
2. Add a **when ⟨Hero⟩ hears ⟨space⟩ pressed** handler, and put a **print**
   inside it.
3. Run it and hold space down for a few seconds. One line, not two hundred.
4. Let go and press again. Now there are two.
`.trim(),
};

// ── input/mouse ──────────────────────────────────────────────────────────────

const mouse: WorldScenario = {
  name: 'Point and click',
  description:
    'A button that does not know it has been pressed, and the trait that tells it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('target'), [placeAt(160, 160)])],
      actors: [{id: 'target', name: 'Target', rows: [setSprite('coin.png')]}],
    }),
    sprites: ['coin'],
    rules: ['mouse'],
  }),
  instructions: `
## Point and click

Click the Target. Nothing happens — it does not know the click landed on it,
and it has no way to find out until it says so.

A click is an **event**, like a key going down. What is different is that a
click happens somewhere: the world can say WHICH actor was under the pointer,
so an actor can be told about its own clicks and nobody else's.

### What you do

1. Give the Target **use trait ⟨Can Be Clicked⟩**.
2. Add a **when ⟨Target⟩ is clicked** handler and **print** something in it.
3. Click the Target, then click the empty space beside it. Only one of those
   says anything.
`.trim(),
};

// ── input/two-hands ──────────────────────────────────────────────────────────

const twoHands: WorldScenario = {
  name: 'Two readings of four keys',
  description:
    'The same four keys as a walk, and as a ship. Elect one or the other, never both.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ship'), [placeAt(160, 160)])],
      actors: [
        {
          id: 'ship',
          name: 'Ship',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('ship.png'),
          ],
        },
      ],
    }),
    sprites: ['ship'],
    rules: ['arrows', 'drive', 'drag'],
  }),
  instructions: `
## Two readings of four keys

Left and right walk the Ship sideways. That is one reading of the arrow keys,
and it is the one a platformer wants.

A ship is not a platformer. Left and right should TURN it, and up should push it
the way it is pointing.

### What you do

1. Take **⟨Moves Across⟩** off the Ship and give it **⟨Driven by Arrow Keys⟩**
   instead. Both at once is two rules fighting over the same four keys.
2. Run it. Left and right turn; up thrusts; letting go leaves it coasting,
   because nothing in space slows down.
3. Add **⟨Slows Down⟩** and watch it become a car instead.
`.trim(),
};

// ── motion/force ─────────────────────────────────────────────────────────────

/** `set velocity of ⟨this actor⟩ to ⟨x, y⟩`, for a world's `add actor` body. */
/** The Ball three lessons start from: it can move, and it has a picture. */
const BALL = [useTrait('Physics#CanMoveTrait'), setSprite('ball.png')];

const setVelocity = (x: number, y: number) => ({
  type: 'world_set_Physics_VelocityProperty',
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: {block: {type: 'world_vector', fields: {VECTOR: {x, y}}}},
  },
});

/**
 * `when ⟨any Ball⟩ hears ⟨key⟩ pressed`, as a root beside the `define world`.
 *
 * The subject is the KIND rather than `this actor`: a handler written beside a
 * definition is about that definition, and one written in the world has to say
 * which actor it is about (`anyKind`). Inside it, `this actor` is still the
 * actor the key was pressed for.
 */
const onPressed = (actor: string, key: string, body: object) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: key},
  inputs: {ACTOR: anyKind(actor)},
  next: {block: body},
});

const force: WorldScenario = {
  name: 'A shove',
  description:
    'A ball that says "bang" and does not move, and the block that changes that.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ball'), [placeAt(64, 160)])],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            setSprite('ball.png'),
          ],
        },
      ],
      handlers: [
        onPressed('ball', 'space', {
          type: 'world_log',
          fields: {TEXT: 'bang'},
        }),
      ],
    }),
    sprites: ['ball'],
    rules: ['motion', 'input'],
  }),
  instructions: `
## A shove

Press space. The Ball says **bang** in the console and does not move an inch.

A force does not put a thing somewhere. It changes the thing's SPEED, and the
speed is what puts it somewhere — two steps, and the second one keeps happening
after you have let go.

### What you do

1. In the **when ⟨any Ball⟩ hears space** handler, swap the **print** for
   **apply force**, and give it
   a shove to the right.
2. Press space once. It moves, and it goes on moving: nothing is stopping it.
3. Press space again while it is still going, and watch the shove ADD to the
   speed it already had rather than replacing it.
`.trim(),
};

// ── motion/units ─────────────────────────────────────────────────────────────

const units: WorldScenario = {
  name: 'Units per second',
  description:
    'A ball travelling far too fast, and the arithmetic that fixes it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ball'), [placeAt(16, 160), setVelocity(60, 0)])],
      actors: [{id: 'ball', name: 'Ball', rows: BALL}],
    }),
    sprites: ['ball'],
    rules: ['motion'],
  }),
  instructions: `
## Units per second

The Ball is gone before you can see it. Its speed says **60**, and 60 is an
enormous number here.

A speed is in **units per second**, and one unit is **100 pixels**. So 60 means
six thousand pixels every second, and this world is only 384 across.

The world is 10 tiles each way, and a tile is 32 pixels: **320 across**.

### What you do

1. Work out the speed that crosses 384 pixels in **two seconds**, in units.
2. Put it in the \`set speed\` block, in the world's \`add actor\`.
3. Run it and count. If it arrives early, the number is too big.
`.trim(),
};

// ── motion/drag ──────────────────────────────────────────────────────────────

const drag: WorldScenario = {
  name: 'Coasting to a stop',
  description:
    'A ball that drifts forever, and the one trait that makes it a car.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ball'), [placeAt(24, 160), setVelocity(2.5, 0)])],
      actors: [{id: 'ball', name: 'Ball', rows: BALL}],
    }),
    sprites: ['ball'],
    rules: ['motion', 'drag', 'wrap'],
  }),
  instructions: `
## Coasting to a stop

The Ball is pushed once at the start and never slows down. It wraps round the
edges and keeps going, at exactly the speed it began with, forever.

That is what having a speed MEANS — nothing takes it away unless something is
written to. In space that is correct. On a road it is not.

### What you do

1. Give the Ball **use trait ⟨Slows Down⟩**.
2. Run it. It coasts to a halt instead of going round for ever.
3. Find the trait's own numbers and make it slippery, then make it sticky.
`.trim(),
};

// ── motion/tween ─────────────────────────────────────────────────────────────

const tween: WorldScenario = {
  name: 'A described movement',
  description:
    'A door that does not open, and the difference between a place and a journey.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('door'), [placeAt(64, 160)]),
        addActor(local('post'), [placeAt(256, 160)]),
      ],
      actors: [
        {id: 'door', name: 'Door', rows: [setSprite('box.png')]},
        {id: 'post', name: 'Post', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['box', 'ground'],
  }),
  instructions: `
## A described movement

The Door sits where it was put. Setting its position again would put it
somewhere else — instantly, in one frame, which is not what opening looks like.

A **tween** is a movement described: where it should end up, how long it should
take, and how it should ease in or out along the way. Nothing about it happens
until something plays it.

### What you do

1. Under \`define world\`, add **play a tween on ⟨any Door⟩ over 1 second**.
2. Inside its **move** slot, put **set position of ⟨this actor⟩** and give it
   the Post's place. Run it: the Door travels there.
3. Change the curve from **steadily** to **slow at both ends** and watch the
   difference.
4. Now do it the other way. **define tween** at the top of the file describes
   the same journey once, under a name; **play tween** plays it on anything.
   A movement several things share belongs in a definition; a movement one
   thing does belongs where it happens.
`.trim(),
};

// ── logic/if ─────────────────────────────────────────────────────────────────

/** `get position ⟨x|y⟩ of ⟨this actor⟩`. */
const myPosition = (component: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: component},
    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  },
});

const conditional: WorldScenario = {
  name: 'Asking a question',
  description:
    'A ball that leaves the world, and the block that lets it decide not to.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ball'), [placeAt(24, 160), setVelocity(1.6, 0)])],
      actors: [{id: 'ball', name: 'Ball', rows: BALL}],
    }),
    sprites: ['ball'],
    rules: ['motion'],
  }),
  instructions: `
## Asking a question

The Ball rolls right and keeps going, out of the world and away. It has no way
to notice where it is, because nothing has asked.

An **if** is a question with two answers, and a program that does one thing or
the other. The question here is "am I past the middle?" — the middle of a world
10 tiles across is 160.

### What you do

1. Give the Ball an **each frame** handler.
2. Inside it, put an **if**, and ask whether **⟨get position x of this actor⟩**
   is greater than **160**.
3. When it is, **set its speed to 0**. The Ball rolls to the middle and waits
   there.
`.trim(),
};

// ── logic/collision ──────────────────────────────────────────────────────────

const collision: WorldScenario = {
  name: 'Touching is a question',
  description:
    'A ball that rolls straight through a wall, and the trait that stops it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('ball'), [placeAt(24, 160), setVelocity(1.6, 0)]),
        addActor(local('wall'), [placeAt(272, 160)]),
      ],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            setSprite('ball.png'),
          ],
        },
        {id: 'wall', name: 'Wall', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['ball', 'ground'],
    rules: ['motion', 'collisions', 'solid'],
  }),
  instructions: `
## Touching is a question

The Ball rolls through the Wall as though it were not there. It is not there, as
far as the Ball is concerned: the Ball knows it can collide, and the Wall has
not said it is anything to collide WITH.

Touching is a question the world works out for you, once a tick, for everything
that said it wanted to be asked. What to DO about it is a separate matter, and
"stop" is one of the answers a rule already has.

### What you do

1. Give the Wall **use trait ⟨Solid⟩**. Run it: the Ball stops dead against it.
2. Add a **when ⟨Ball⟩ starts touching** handler and print something, so you can
   see the moment rather than only its consequence.
3. Take the Ball's **⟨Can Collide⟩** off and watch it sail through again. Both
   sides have to agree before there is a collision at all.
`.trim(),
};

// ── logic/and-or ─────────────────────────────────────────────────────────────

const andOr: WorldScenario = {
  name: 'Two questions at once',
  description:
    'Two balls, one condition, and the difference between AND and OR.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('ball'), [placeAt(24, 64), setVelocity(1.6, 0)]),
        addActor(local('ball'), [placeAt(24, 240), setVelocity(1.6, 0)]),
      ],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            ...BALL,
            {
              type: 'world_trait_step',
              fields: {PHASE: 'decide', NAME: 'stop in the middle'},
              inputs: {
                DO: {
                  block: {
                    type: 'controls_if',
                    inputs: {
                      IF0: {
                        block: {
                          type: 'logic_compare',
                          fields: {OP: 'GT'},
                          inputs: {
                            A: myPosition('x'),
                            B: {
                              shadow: {type: 'math_number', fields: {NUM: 192}},
                            },
                          },
                        },
                      },
                      DO0: {
                        block: {
                          type: 'world_set_Physics_VelocityProperty',
                          inputs: {
                            ACTOR: {block: {type: 'world_this_actor'}},
                            VALUE: {
                              block: {
                                type: 'world_vector',
                                fields: {VECTOR: {x: 0, y: 0}},
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    }),
    sprites: ['ball'],
    rules: ['motion'],
  }),
  instructions: `
## Two questions at once

Two Balls, one high and one low, and one rule between them: stop past the
middle. Both stop, because the only thing being asked is how far across they
are.

Say you want only the LOW one to stop — past the middle **and** below the
halfway line. That is two questions, and the answer is yes only when both are.

The world is 320 pixels down, so halfway down is 160.

### What you do

1. Find the **if**, in the \`each frame\` under \`define actor ⟨Ball⟩\`.
2. Wrap its question in an **and**, and add a second question: is
   **⟨get position y of this actor⟩** greater than **160**?
3. Run it. The low Ball stops in the middle; the high one carries on and leaves.
4. Change the **and** to an **or** and watch both stop again — which is the
   thing to be able to tell apart.
`.trim(),
};

// ── logic/kinds ──────────────────────────────────────────────────────────────

/** `when ⟨this actor⟩ starts touching ⟨any⟩`, as a root beside a `define actor`. */
const onTouching = (actor: string, body: object) => ({
  type: 'world_on_Collisions_StartsTouchingEvent',
  fields: {FILTER0: ''},
  inputs: {ACTOR: anyKind(actor)},
  next: {block: body},
});

const kinds: WorldScenario = {
  name: 'What a thing is',
  description:
    'One handler, two kinds of thing, and no way yet to tell them apart.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('ball'), [placeAt(24, 160), setVelocity(1.6, 0)]),
        addActor(local('coin'), [placeAt(120, 160)]),
        addActor(local('spike'), [placeAt(230, 160)]),
      ],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            setSprite('ball.png'),
          ],
        },
        {
          id: 'coin',
          name: 'Coin',
          rows: [useTrait('Collisions#CanCollideTrait'), setSprite('coin.png')],
        },
        {
          id: 'spike',
          name: 'Spike',
          rows: [useTrait('Collisions#CanCollideTrait'), setSprite('box.png')],
        },
      ],
      handlers: [
        onTouching('ball', {
          type: 'world_log',
          fields: {TEXT: 'I touched something'},
        }),
      ],
    }),
    sprites: ['ball', 'coin', 'box'],
    rules: ['motion', 'collisions'],
  }),
  instructions: `
## What a thing is

The Ball rolls past a Coin and a Spike and says the same thing about both:
**I touched something**. Which is true, and useless — a coin is worth having and
a spike is not.

The handler is told WHICH actor it touched. What it has no way to say yet is
what sort of thing that actor is, and that is a question you can ask at any
moment: **⟨event actor⟩ is a ⟨Coin⟩**.

### What you do

1. Find the **when ⟨any Ball⟩ starts touching**
   handler. The **event actor** block inside it is the thing that was touched.
2. Wrap the print in an **if**, and ask whether the event actor **is a Coin**.
   Say something about coins there.
3. Add a second **if** for the Spike, and say something else.
4. Note what you did NOT do: two handlers. One handler that asks is a handler
   that works for a third kind you add later; two handlers is a third handler
   waiting to be written.
`.trim(),
};

// ── place/map ────────────────────────────────────────────────────────────────

/** A placement, as the grid field stores one: an id and where it sits. */
const placed = (id: string, x: number, y: number) => ({
  id,
  properties: {positional: {position: {x, y}}},
});

/** `create ⟨kind⟩ in map ⟨grid⟩` — one block, however many tiles. */
const createInMap = (actor: string, placements: object[]) => ({
  type: 'world_create_in_map',
  fields: {ACTOR: actor, PLACEMENTS: placements},
});

const map: WorldScenario = {
  name: 'A room drawn, not typed',
  description:
    'A floor made of twenty blocks, and the grid that replaces them.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('hero'), [placeAt(48, 240)]),
        // Three tiles, painted by hand and stopping short: the floor the Hero
        // is standing on runs out, and the lesson is the rest of it.
        createInMap(local('ground'), [
          placed('floor0', 16, 304),
          placed('floor1', 48, 304),
          placed('floor2', 80, 304),
        ]),
      ],
      actors: [
        {id: 'hero', name: 'Hero', rows: [setSprite('player.png')]},
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['player', 'ground'],
  }),
  instructions: `
## A room drawn, not typed

Three floor tiles, and then nothing. You could add the rest with \`add actor\`,
one block each, all the same — and the day you want the floor a tile lower you
would edit twenty of them.

**create ⟨Ground⟩ in map** is one block that places as many as you like. What
it holds is not code: it is an ARRANGEMENT — a list of places, painted on a
grid, kept with the block. The kind says what a Ground *is*, once; the
arrangement says where they are.

### What you do

1. Click the grid on the **create ⟨Ground⟩ in map** block. The map editor opens.
2. Paint a floor along the bottom of the room, and walls up both sides.
3. Run it. Every tile you painted is a Ground, and there is still one block.
4. Paint some more, and run it again. You never touched \`define actor ⟨Ground⟩\`
   — what a Ground is and where the Grounds are are two different questions.
`.trim(),
};

// ── place/camera ─────────────────────────────────────────────────────────────

/** A floor of Ground tiles across a room that is wider than the view. */
const floorAcross = (columns: number) =>
  Array.from({length: columns}, (_unused, column) =>
    placed(`floor${column}`, column * 32 + 16, 304),
  );

const camera: WorldScenario = {
  name: 'A window on a bigger world',
  description:
    'A room three screens wide, and a view that only ever shows the first.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      // Three screens across and one down. A world that arranges its own
      // actors is one screen until it says otherwise, and a camera in a
      // one-screen world is a camera that cannot move.
      tiles: [30, 10],
      rows: [
        createInMap(local('ground'), floorAcross(30)),
        addActor(local('hero'), [placeAt(48, 272), setVelocity(6, 0)]),
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [useTrait('Physics#CanMoveTrait'), setSprite('player.png')],
        },
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['player', 'ground'],
    rules: ['motion', 'camera', 'cameraFollow', 'cameraConfined'],
  }),
  instructions: `
## A window on a bigger world

The Hero walks off the right of the screen and is gone. It has not stopped
existing: the room is **three screens wide**, and the view is showing the first
of them and nothing else.

Where things ARE and what is DRAWN are two different questions. A **camera** is
the answer to the second one, and until now every world has had the default
one, sitting still.

### What you do

1. Add **define camera ⟨Chase⟩** at the end of the world, with
   **use trait ⟨Follows⟩** in it, and
   **set actor to follow of ⟨this camera⟩ to ⟨any Hero⟩**.
2. Add **look through camera ⟨Chase⟩** under it, and run. The view goes with
   the Hero — off the end of the room, showing nothing.
3. Add **use trait ⟨Confined to the Map⟩** to the camera. The view stops where
   the room stops, and the Hero walks on out of shot.
4. The camera is defined AFTER the actors, and it has to be: it is told to
   follow \`any ⟨Hero⟩\`, and reading that before there is a Hero is a view
   that never moves and never says why.
`.trim(),
};

// ── place/camera-feel ────────────────────────────────────────────────────────

/** `define camera ⟨Chase⟩` following a kind, with whatever else it elects. */
const chaseCamera = (follow: string, extra: object[] = []) => ({
  type: 'world_define_camera',
  id: 'chase',
  fields: {NAME: 'Chase'},
  inputs: {
    DO: {
      block: chainRows([
        useTrait('Camera Follow#FollowsTrait'),
        useTrait('Camera Confined#ConfinedToTheMapTrait'),
        ...extra,
        {
          type: 'world_set_CameraFollow_ActorToFollowProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_camera'}},
            VALUE: anyKind(follow),
          },
        },
      ]),
    },
  },
});

const cameraFeel: WorldScenario = {
  name: 'Correct, and pleasant',
  description:
    'A camera that is right, welded to the player, and slightly horrible.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: [30, 10],
      rows: [
        createInMap(local('ground'), floorAcross(30)),
        addActor(local('hero'), [placeAt(160, 272)]),
        chaseCamera('hero'),
        {type: 'world_use_camera', fields: {CAMERA: 'camera:chase'}},
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('player.png'),
          ],
        },
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['player', 'ground'],
    rules: [
      'arrows',
      'camera',
      'cameraFollow',
      'cameraConfined',
      'cameraEase',
      'cameraDeadzone',
    ],
  }),
  instructions: `
## Correct, and pleasant

Walk left and right. The camera follows, it stops at the walls, and it is
**correct** — every frame the view is exactly where the Hero is.

Which is why it feels the way it does. The world lurches with every step, and
a small nudge shakes the whole screen. Nothing here is a bug; the camera is
doing precisely what it was told.

Two traits change how it FEELS, and neither changes where it ends up.

### What you do

1. Add **use trait ⟨Eases⟩** to the camera and
   **set smoothness of ⟨this camera⟩ to ⟨0.25⟩**. The view now catches up over
   a few frames instead of arriving with you.
2. Add **use trait ⟨Has a Deadzone⟩** and
   **set slack of ⟨this camera⟩ to x ⟨64⟩ y ⟨32⟩**. Small movements no longer
   move the view at all — you walk about inside the box, and only leaving it
   pulls the camera along.
3. Turn the smoothness up until it feels like treacle, then back. There is no
   right number, which is the point: this is the part you tune by playing.
`.trim(),
};

// ── place/layers ─────────────────────────────────────────────────────────────

const layers: WorldScenario = {
  name: 'What is in front',
  description:
    'A score that scrolls away with the scenery, and the hills that do not lag.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: [30, 10],
      rows: [
        createInMap(local('ground'), floorAcross(30)),
        // Three hills, far apart, so the eye can see whether they keep up.
        addActor(local('hill'), [placeAt(80, 240)]),
        addActor(local('hill'), [placeAt(400, 240)]),
        addActor(local('hill'), [placeAt(720, 240)]),
        addActor(local('score'), [
          placeAt(60, 30),
          setText('TextProperty', words('SCORE 0')),
        ]),
        addActor(local('hero'), [placeAt(160, 272)]),
        chaseCamera('hero'),
        {type: 'world_use_camera', fields: {CAMERA: 'camera:chase'}},
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('player.png'),
          ],
        },
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
        {id: 'hill', name: 'Hill', rows: [setSprite('box.png')]},
        {
          id: 'score',
          name: 'Score',
          rows: [useTrait('Writing#ShowsTextTrait'), showAs('text')],
          drawing: {
            width: 96,
            height: 24,
            commands: [fill(swatch('#f2f2f7')), drawText(0, 12)],
          },
        },
      ],
    }),
    sprites: ['player', 'ground', 'box'],
    rules: ['arrows', 'writing', 'camera', 'cameraFollow', 'cameraConfined'],
  }),
  instructions: `
## What is in front

Walk right. The score goes with the scenery and off the side of the screen,
because it is a thing in the world like the hills and the floor — and nothing
has ever said otherwise.

A **layer** is a declared group with a drawing order and its own relationship
to the camera. Everything so far has been in one layer, which is why everything
so far has moved together.

### What you do

1. Add **define layer ⟨Interface⟩** at the end of the world, put
   **this layer ⟨is fixed to the screen⟩** in it, and move the Score's
   \`add actor\` inside it. Now it stays where it is drawn, whatever the camera
   does.
2. Add **define layer ⟨Hills⟩** BEFORE the others — declaration order is
   drawing order, so it is behind them — and move the three Hills into it.
3. Put **this layer moves ⟨0.4, 1⟩ with the camera** in it. The hills now drift
   slower than the floor, which is what makes them look far away.
`.trim(),
};

// ── platformer/jump ──────────────────────────────────────────────────────────

const jump: WorldScenario = {
  name: 'Up, properly',
  description:
    'A jump written by hand, which works in mid-air and works forever.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        createInMap(local('ground'), floorAcross(10)),
        addActor(local('hero'), [placeAt(160, 272)]),
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Gravity#AffectedByGravityTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            useTrait('Arrow Keys#MovesAcrossTrait'),
            setSprite('player.png'),
          ],
        },
        {
          id: 'ground',
          name: 'Ground',
          rows: [
            useTrait('Gravity#ActsAsGroundTrait'),
            setSprite('ground.png'),
          ],
        },
      ],
      handlers: [
        onPressed('hero', 'space', {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {
              block: {type: 'world_vector', fields: {VECTOR: {x: 0, y: -5}}},
            },
          },
        }),
      ],
    }),
    sprites: ['player', 'ground'],
    rules: ['gravity', 'input', 'arrows', 'motion', 'jump'],
  }),
  instructions: `
## Up

Press space. The Hero jumps, and it is a jump in the sense that it goes up:
**when ⟨any Hero⟩ presses ⟨space⟩ → set velocity to ⟨0, -5⟩**. Hold space and
you fly. Press it falling down a hole and you climb back out.

Nothing there knows what a jump IS — that it starts from the ground, that you
get one, that walking off a ledge and pressing a frame later should still
count. That is what the **Jumping** rule holds.

### What you do

1. Give the Hero **use trait ⟨Jumps⟩**, and swap the \`set velocity\` in the
   handler for **make ⟨this actor⟩ jump**.
2. Run it. It jumps once, from the ground, and pressing again in the air does
   nothing — asking is separate from jumping, and the answer is sometimes no.
3. Walk off the edge of the floor and press space a moment later. It still
   jumps: that grace is **coyote time**, and it is the difference between a
   platformer that feels fair and one that does not.
4. Set **jumps allowed** to 2. Now there is a second jump, in the air, and
   still not a third.
`.trim(),
};

// ── platformer/pickups ───────────────────────────────────────────────────────

const pickups: WorldScenario = {
  name: 'Things worth having',
  description: 'Three coins a Hero walks straight through.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        createInMap(local('ground'), floorAcross(10)),
        addActor(local('coin'), [placeAt(100, 272)]),
        addActor(local('coin'), [placeAt(180, 272)]),
        addActor(local('coin'), [placeAt(260, 272)]),
        addActor(local('hero'), [placeAt(30, 272), setVelocity(3, 0)]),
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            setSprite('player.png'),
          ],
        },
        {
          id: 'coin',
          name: 'Coin',
          rows: [useTrait('Collisions#CanCollideTrait'), setSprite('coin.png')],
        },
        {
          id: 'ground',
          name: 'Ground',
          rows: [setSprite('ground.png')],
        },
      ],
    }),
    sprites: ['player', 'coin', 'ground'],
    rules: ['motion', 'collisions', 'collect'],
  }),
  instructions: `
## Things worth having

The Hero walks along the floor and straight through three Coins. They touch —
the Collisions rule says so — and touching is all that happens.

Taking a thing is TWO abilities, not one, and that is what makes it work for
any pair of actors: something that **Collects**, and something that **Can Be
Collected**. Neither knows about the other.

### What you do

1. Give the Hero **use trait ⟨Collects⟩** and each Coin
   **use trait ⟨Can Be Collected⟩**.
2. Run it. Each Coin vanishes as the Hero reaches it — taken out of the world,
   and into the Hero's \`collected\`.
3. Add **when ⟨any Hero⟩ collects** and **print ⟨count of ⟨Coin⟩ in ⟨collected
   of ⟨this actor⟩⟩⟩**, so you can watch it go up.
4. Nothing you wrote says what a Coin is worth, or what a Hero does with one.
   Both of those are the project's, and this is the moment they hang from.
`.trim(),
};

// ── platformer/hazards ───────────────────────────────────────────────────────

const hazards: WorldScenario = {
  name: 'Something that can hurt you',
  description: 'A Hero walking into a spike, and a spike that does not mind.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        createInMap(local('ground'), floorAcross(10)),
        addActor(local('spike'), [placeAt(200, 272)]),
        addActor(local('hero'), [placeAt(60, 272)]),
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            useTrait('Collisions#CanCollideTrait'),
            // Solid, so walking into the Spike is LEANING on it rather than
            // passing through it.
            useTrait('Solid Bodies#SolidTrait'),
            setSprite('player.png'),
          ],
        },
        {
          id: 'spike',
          name: 'Spike',
          rows: [
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Solid Bodies#SolidTrait'),
            setSprite('box.png'),
          ],
        },
        {id: 'ground', name: 'Ground', rows: [setSprite('ground.png')]},
      ],
    }),
    sprites: ['player', 'box', 'ground'],
    rules: ['arrows', 'motion', 'collisions', 'solid', 'health'],
  }),
  instructions: `
## Something that can hurt you

Walk the Hero into the Spike. It stops, and that is all: nothing here has said
that a Spike is dangerous, or that a Hero is the sort of thing that can be
hurt.

Those are the two halves, and they are separate on purpose. **Has Health** says
what can be damaged. **Deals Damage** says what damages. Neither names the
other, which is why the same Spike hurts anything and the same Hero is hurt by
anything.

### What you do

1. Give the Hero **use trait ⟨Has Health⟩** and the Spike
   **use trait ⟨Deals Damage⟩**.
2. Add **when ⟨any Hero⟩ is hurt → print ⟨health of ⟨this actor⟩⟩**, and walk
   into the Spike. One line. Lean on it as long as you like: still one line,
   because being hurt happens when the touch STARTS.
3. Back off and walk in again. A second hit — unless you were quick, and then
   nothing, because of **mercy time**: half a second in which the Hero cannot
   be hurt again. Set it to 2 and try to be hit twice.
4. Give the Spike **use trait ⟨Patrols Across⟩**. Now it walks about hurting
   whatever it meets, and nothing about it mentions the Hero.
`.trim(),
};

// ── platformer/level ─────────────────────────────────────────────────────────

const level: WorldScenario = {
  name: 'A level',
  description:
    'Everything from the last four lessons in one world, and nothing to reach.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: [20, 10],
      rows: [
        declareProperty('boolean', 'won', 'false'),
        createInMap(local('ground'), floorAcross(20)),
        addActor(local('coin'), [placeAt(150, 272)]),
        addActor(local('coin'), [placeAt(250, 272)]),
        addActor(local('spike'), [placeAt(360, 272)]),
        addActor(local('flag'), [placeAt(560, 272)]),
        addActor(local('hero'), [
          placeAt(40, 272),
          {
            type: 'world_set_ArrowKeys_AcrossSpeedProperty',
            inputs: {ACTOR: me(), VALUE: num(6)},
          },
        ]),
        chaseCamera('hero'),
        {type: 'world_use_camera', fields: {CAMERA: 'camera:chase'}},
      ],
      actors: [
        {
          id: 'hero',
          name: 'Hero',
          rows: [
            useTrait('Gravity#AffectedByGravityTrait'),
            useTrait('Arrow Keys#MovesAcrossTrait'),
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Collection#CollectsTrait'),
            useTrait('Health#HasHealthTrait'),
            // …and it stays in the room, which `place/edges` is for.
            useTrait('Boundaries#StaysAcrossTrait'),
            setSprite('player.png'),
          ],
        },
        {
          id: 'coin',
          name: 'Coin',
          rows: [
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Collection#CanBeCollectedTrait'),
            setSprite('coin.png'),
          ],
        },
        {
          id: 'spike',
          name: 'Spike',
          rows: [
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Health#DealsDamageTrait'),
            setSprite('box.png'),
          ],
        },
        {
          id: 'flag',
          name: 'Flag',
          rows: [useTrait('Collisions#CanCollideTrait'), setSprite('ball.png')],
        },
        {
          id: 'ground',
          name: 'Ground',
          rows: [
            useTrait('Gravity#ActsAsGroundTrait'),
            setSprite('ground.png'),
          ],
        },
      ],
    }),
    sprites: ['player', 'coin', 'box', 'ball', 'ground'],
    rules: [
      'gravity',
      'arrows',
      'collisions',
      'solid',
      'collect',
      'health',
      'bounds',
      'camera',
      'cameraFollow',
      'cameraConfined',
    ],
  }),
  instructions: `
## A level

A room two screens wide with a floor, a camera that follows, two coins to take,
a Spike that hurts, and a Flag at the far end. Every piece of it is a lesson you
have already done.

Walk to the Flag. Nothing happens — and nothing should, because a Flag is an
actor like the Coins and the Spike, and nothing has said what reaching it
MEANS.

That is the last thing a level needs: a **state** that says which part of the
game you are in. It belongs to the world rather than to the Hero or the Flag,
because it is not a fact about either of them.

### What you do

1. At the top of \`main.world\` there is **define boolean won with default
   false**, and nothing sets it.
2. Add **when ⟨any Hero⟩ starts touching**, and inside it ask
   **if ⟨event actor⟩ is a ⟨Flag⟩** — the same question the Ball asked about
   Coins and Spikes.
3. Set **won** to true in there, and print something.
4. Run it and walk the whole level. Take the coins: nothing. Walk into the
   Spike: nothing but hurt. Reach the Flag: won.
5. Add **when ⟨any Hero⟩ dies → print ⟨"game over"⟩**. A level has two ends
   now, and the world knows which one it reached.
`.trim(),
};

// ── arcade/bounce ────────────────────────────────────────────────────────────

/** The border of a ten-by-ten room, as placements on the grid. */
const wallsRound = () => {
  const at = (column: number, row: number) =>
    placed(`wall${column}_${row}`, column * 32 + 16, row * 32 + 16);
  const tiles = [];
  for (let column = 0; column < 10; column++) {
    tiles.push(at(column, 0), at(column, 9));
  }
  for (let row = 1; row < 9; row++) {
    tiles.push(at(0, row), at(9, row));
  }
  return tiles;
};

const bounce: WorldScenario = {
  name: 'Off the wall',
  description: 'A ball in a box that stops the moment it arrives at one.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        createInMap(local('wall'), wallsRound()),
        addActor(local('ball'), [placeAt(160, 160), setVelocity(4, 3)]),
      ],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Solid Bodies#SolidTrait'),
            setSprite('ball.png'),
          ],
        },
        {
          id: 'wall',
          name: 'Wall',
          rows: [
            useTrait('Collisions#CanCollideTrait'),
            useTrait('Solid Bodies#SolidTrait'),
            setSprite('ground.png'),
          ],
        },
      ],
    }),
    sprites: ['ball', 'ground'],
    rules: ['motion', 'collisions', 'solid'],
  }),
  instructions: `
## Off the wall

The Ball crosses the room, reaches a Wall, and stops. Solid Bodies did its job
— a moving body cannot end up inside a solid one — and stopping is what
"pushed apart" comes to when nothing has said otherwise.

What a collision does to a SPEED is a property of the surface, not a thing the
Ball decides. **Bounciness** is how much of the speed into a wall comes back
out of it: 0 keeps none, 1 keeps all of it.

### What you do

1. Add **set bounciness of ⟨any Wall⟩ to ⟨0.5⟩** at the top of the world. Run
   it: the Ball comes off the wall at half the speed, and each bounce is
   smaller than the last.
2. Turn it up until the Ball never slows down. There is exactly one value that
   does that, and it is the one that gives all the speed back.
3. Try 1.2 and watch it get faster every time it touches anything. Nothing
   stops you; a wall that returns more than it was given is a perfectly good
   thing to build a game out of.
`.trim(),
};

// ── arcade/paddle ────────────────────────────────────────────────────────────

/** `get position ⟨x⟩ of ⟨this actor⟩`. */
const myX = () => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: 'x'},
    inputs: {ACTOR: me()},
  },
});

const paddle: WorldScenario = {
  name: 'A thing you steer',
  description: 'A paddle kept on screen by hand, with half of it hanging off.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('paddle'), [placeAt(160, 280)])],
      actors: [
        {
          id: 'paddle',
          name: 'Paddle',
          rows: [
            useTrait('Arrow Keys#MovesAcrossTrait'),
            // The hand-written fence: keep the paddle's POSITION on screen,
            // which is not the same as keeping the paddle on screen.
            {
              type: 'world_trait_step',
              fields: {PHASE: 'decide', NAME: 'keep it on screen'},
              inputs: {
                DO: {
                  block: {
                    type: 'controls_if',
                    inputs: {
                      IF0: {
                        block: {
                          type: 'logic_compare',
                          fields: {OP: 'LT'},
                          inputs: {A: myX(), B: num(0)},
                        },
                      },
                      DO0: {
                        block: {
                          type: 'world_set_position',
                          inputs: {ACTOR: me(), X: num(0), Y: num(280)},
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
          drawing: {
            width: 96,
            height: 16,
            commands: [fill(swatch('#5b8def')), rectangle(0, 0, 96, 16)],
          },
        },
      ],
    }),
    rules: ['arrows', 'bounds'],
  }),
  instructions: `
## A thing you steer

Hold the left arrow. The Paddle stops — and it stops with half of itself off
the side of the screen, because what was kept on screen is its POSITION, and a
position is a point in the middle of a thing that is ninety-six wide.

You could fix that by hand: subtract half the width, and remember to change the
number if the Paddle ever changes size. Or you could say what you actually mean.

### What you do

1. Delete the whole \`each frame\` handler. The Paddle now walks off the screen
   entirely, which is honest.
2. Give it **use trait ⟨Stays Across⟩**. Hold left again: it stops with its
   EDGE against the side, and nothing anywhere says 48.
3. Make the drawing wider and run it again. It still stops at the edge — the
   rule reads the size the Paddle actually is.
`.trim(),
};

// ── arcade/shoot ─────────────────────────────────────────────────────────────

/** `add actor ⟨Bullet⟩ do ⟨put it above the Ship and send it up⟩`. */
const fireOne = () =>
  addActor(local('bullet'), [
    placeAt(160, 240),
    {
      type: 'world_set_Physics_VelocityProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {block: {type: 'world_vector', fields: {VECTOR: {x: 0, y: -8}}}},
      },
    },
  ]);

const shoot: WorldScenario = {
  name: 'A bullet is spawned',
  description: 'A ship that fires sixty times a second and never tidies up.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ship'), [placeAt(160, 280)])],
      actors: [
        {
          id: 'ship',
          name: 'Ship',
          rows: [
            useTrait('Input#TakesKeyboardInputTrait'),
            setSprite('ship.png'),
          ],
        },
        {
          id: 'bullet',
          name: 'Bullet',
          rows: [useTrait('Physics#CanMoveTrait'), setSprite('shot.png')],
        },
      ],
      handlers: [onPressed('ship', 'space', fireOne())],
    }),
    sprites: ['ship', 'shot'],
    rules: ['input', 'motion', 'shoots', 'expires'],
  }),
  instructions: `
## A bullet is spawned

Hit space a few times. Each press adds a Bullet to the world, and each Bullet
flies up out of the view and keeps going — forever, because nothing ever takes
one away. Mash the key and you get a bullet per press, as fast as you can hit
it.

Two halves are missing, and the second is the one everybody forgets.
**Shooting** holds a reload time, so asking to fire is sometimes answered no.
**Expires** gives an actor a lifetime, so a thing that is made can also stop.

### What you do

1. Give the Ship **use trait ⟨Shoots⟩**, and change the press handler to
   **make ⟨this actor⟩ fire**.
2. Add **when ⟨any Ship⟩ fires**, and move the \`add actor ⟨Bullet⟩\` into it.
   Mash the key now: a bullet every quarter second however fast you hit it,
   because that is the reload time and the answer to the rest was no.
3. Give the Bullet **use trait ⟨Expires⟩** and **set lifetime of ⟨this actor⟩
   to ⟨1⟩**. Fire for a while and then stop: the world empties itself.
4. Set the reload time to a tenth and fire again. More bullets, and still a
   count rather than a stream.
`.trim(),
};

// ── arcade/bricks ────────────────────────────────────────────────────────────

const bricks: WorldScenario = {
  name: 'Many, and then none',
  description:
    'Three bricks that go one at a time, and a game that never ends.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        declareProperty('boolean', 'cleared', 'false'),
        addActor(local('brick'), [placeAt(120, 160)]),
        addActor(local('brick'), [placeAt(200, 160)]),
        addActor(local('brick'), [placeAt(280, 160)]),
        addActor(local('ball'), [placeAt(30, 160), setVelocity(4, 0)]),
      ],
      actors: [
        {
          id: 'ball',
          name: 'Ball',
          rows: [
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            setSprite('ball.png'),
          ],
        },
        {
          id: 'brick',
          name: 'Brick',
          rows: [useTrait('Collisions#CanCollideTrait'), setSprite('box.png')],
        },
      ],
      handlers: [
        {
          type: 'world_on_Collisions_StartsTouchingEvent',
          fields: {FILTER0: ''},
          inputs: {ACTOR: anyKind('ball')},
          next: {
            block: {
              type: 'world_remove_actor',
              inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
            },
          },
        },
      ],
    }),
    sprites: ['ball', 'box'],
    rules: ['motion', 'collisions'],
  }),
  instructions: `
## Many, and then none

The Ball rolls through the Bricks and each one goes as it is touched. Three
bricks, three hits, and then a world with nothing in it and a game still
running.

A game ends when there is nothing left to do, and "nothing left" is a question
about the world rather than about the player: **how many Bricks are in all
actors**. Ask it after each one goes, and the answer is eventually zero.

### What you do

1. Give the Ball an **each frame during ⟨decide⟩**, and ask in it
   **if ⟨how many ⟨Brick⟩ in ⟨all actors⟩⟩ = ⟨0⟩**.
2. Inside that, set **cleared** to true and print something.
3. Run it. Nothing is said for the first two Bricks, and one thing is said
   after the third.
4. Now try asking the same question in the touch handler instead, right under
   \`remove actor\`. It never fires — **removing an actor takes effect at the
   end of the frame**, so the Brick you have just removed is still in
   \`all actors\` when you count. Ask where the answer has settled.
5. Add a fourth Brick and run it again. You changed nothing else and the game
   still ends in the right place, which is what asking the world buys over
   counting the hits.
`.trim(),
};

// ── arcade/waves ─────────────────────────────────────────────────────────────

/** `set timer period of ⟨this actor⟩ to ⟨…⟩`. */
const setPeriod = (value: object) => ({
  type: 'world_set_Time_TimerPeriodProperty',
  inputs: {ACTOR: me(), VALUE: value},
});

const waves: WorldScenario = {
  name: 'It gets harder',
  description:
    'A spawner on a timer that sends the same thing at the same rate forever.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('spawner'), [placeAt(160, 20), setPeriod(num(1))])],
      actors: [
        {
          id: 'spawner',
          name: 'Spawner',
          rows: [useTrait('Time#HasATimerTrait'), showAs('text')],
          drawing: {
            width: 32,
            height: 16,
            commands: [fill(swatch('#8d8d99')), rectangle(0, 0, 32, 16)],
          },
        },
        {
          id: 'rock',
          name: 'Rock',
          rows: [useTrait('Physics#CanMoveTrait'), setSprite('asteroid.png')],
        },
      ],
      handlers: [
        {
          type: 'world_on_Time_TimerFiresEvent',
          inputs: {ACTOR: anyKind('spawner')},
          next: {
            block: addActor(local('rock'), [
              placeAt(160, 40),
              {
                type: 'world_set_Physics_VelocityProperty',
                inputs: {
                  ACTOR: me(),
                  VALUE: {
                    block: {
                      type: 'world_vector',
                      fields: {VECTOR: {x: 0, y: 4}},
                    },
                  },
                },
              },
            ]),
          },
        },
      ],
    }),
    sprites: ['asteroid'],
    rules: ['time', 'motion'],
  }),
  instructions: `
## It gets harder

A Rock every second, forever. The Spawner has a **timer**, the timer has a
**period**, and \`when ⟨any Spawner⟩ timer fires\` is where the Rock comes from.

A game that sends the same thing at the same rate is one you get bored of
rather than lose. What makes an arcade game get harder is usually one number,
changed a little each time it is used — and a period is a value like any other.

### What you do

1. In the timer handler, under the \`add actor\`, add
   **set timer period of ⟨this actor⟩ to ⟨⟨timer period of ⟨this actor⟩⟩ ×
   ⟨0.8⟩⟩**.
2. Run it and watch. The first few Rocks are a second apart and the later ones
   are not, and nothing anywhere holds a list of waves.
3. Try 0.95, and 0.5. One of them is a game and one is a wall.
4. Note what you did NOT do: send more Rocks each time. That gets harder too,
   and it gets harder in a way the player can see coming.
`.trim(),
};

// ── story/text ───────────────────────────────────────────────────────────────

/** The line the lesson moves from one actor to another. */
const LINE =
  'The rain had not stopped for three days, and the road out of town was gone.';

const storyText: WorldScenario = {
  name: 'Words on a screen',
  description:
    'A sentence drawn as one line, running off both edges of the world.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor('actors/label', [
          placeAt(160, 160),
          setText('TextProperty', words(LINE)),
        ]),
      ],
    }),
    stockActors: ['label'],
  }),
  instructions: `
## Words on a screen

A Label says the line, and the line is longer than the world. Drawn text is
**one line of canvas**: it does not wrap, it does not know how wide the screen
is, and it ignores every newline you put in it.

A sentence needs a **paragraph** — words laid out in a column of a given width
— and the stock **Speech Box** is an actor that draws one, with a panel behind
it so the words can be read against anything.

### What you do

1. Add an actor, and use the \`(import…)\` row on its dropdown to bring in the
   **Speech Box**.
2. Put it near the bottom of the screen and **set its text** to the line.
3. Run it. The same sentence, wrapped into the panel — and the box grows
   DOWNWARD as it fills, because it is anchored at its top left.
4. Delete the Label. Open the Speech Box and read its drawing: a rectangle, an
   outline, and \`draw paragraph\` in a column the width of the panel.
`.trim(),
};

// ── story/reveal ─────────────────────────────────────────────────────────────

const reveal: WorldScenario = {
  name: 'At reading pace',
  description:
    'A line that is simply there, all at once, before anybody has read a word.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor('actors/speechBox', [
          placeAt(20, 200),
          setText('TextProperty', words(LINE)),
        ]),
      ],
    }),
    stockActors: ['speechBox'],
    rules: ['reveals', 'mouse'],
  }),
  instructions: `
## At reading pace

The whole line is on screen before the player has looked at it. That is what
setting **text** does: it is the words the box is showing, and it shows them
the moment they are set.

**Reveals Text** writes that property for you, a few letters a second. The box
draws whatever \`text\` says right now — it knows nothing about revealing — and
the rule knows nothing about boxes. Between them you get a typewriter.

### What you do

1. Give the Speech Box **use trait ⟨Reveals Text⟩**.
2. Set **the whole line** to the sentence instead of setting \`text\`, and run
   it. The words arrive at reading pace.
3. Change **letters a second** and run it again.
4. A reader who has read it faster than you are typing it wants to skip. Give
   the Box **use trait ⟨Can Be Clicked⟩**, and in a
   **when ⟨any Speech Box⟩ is clicked** handler put
   **show all of it on ⟨this actor⟩**.
`.trim(),
};

// ── story/script ─────────────────────────────────────────────────────────────

/** `set text of ⟨this actor⟩ to ⟨words⟩`, for a line of the script. */
const says = (line: string) => setText('TextProperty', words(line));

const script: WorldScenario = {
  name: 'A place in a list',
  description: 'One line of dialogue and a click that does nothing.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor('actors/speechBox', [
          placeAt(20, 200),
          {
            type: 'world_add_trait',
            fields: {TRAIT: 'Mouse#CanBeClickedTrait'},
            inputs: {ACTOR: me()},
          },
          says('The rain had not stopped for three days.'),
        ]),
      ],
      handlers: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {block: {type: 'world_log', fields: {TEXT: 'click'}}},
        },
      ],
    }),
    stockActors: ['speechBox'],
    rules: ['conversation', 'mouse'],
  }),
  instructions: `
## A place in a list

One line, and a click that prints "click". To say a second line you would set
the text again — and to say five you would need somewhere to keep the place you
are up to, because **nothing in this engine waits**. A handler runs to the end
of its frame; "say this, pause, say that" is not something you can write in a
row of blocks.

A **conversation** is that place: a cursor, a number saying which line you are
on, and an event when it moves. What a line MEANS is yours — text, a picture, a
sound, a question — because it is blocks rather than a string in a table.

### What you do

1. Give the Speech Box **use trait ⟨Has a Conversation⟩** and
   **set how many lines of ⟨this actor⟩ to ⟨3⟩**.
2. Swap the \`print\` in the click handler for
   **make ⟨this actor⟩ say the next thing**.
3. Add **when ⟨any Speech Box⟩ moves to a line**, and in it ask
   **if ⟨line of ⟨this actor⟩⟩ = ⟨1⟩** and set the text to the first line;
   then the same for 2 and 3.
4. Click through it. The cursor starts at zero — nobody talking — and the
   first click moves it to line one.
`.trim(),
};

// ── story/choice ─────────────────────────────────────────────────────────────

/** One line of the script: `if line = n then set the text`. */
const lineIs = (n: number, words_: string) => ({
  type: 'controls_if',
  inputs: {
    IF0: {
      block: {
        type: 'logic_compare',
        fields: {OP: 'EQ'},
        inputs: {
          A: {
            block: {
              type: 'world_get_Conversation_LineProperty',
              inputs: {ACTOR: me()},
            },
          },
          B: num(n),
        },
      },
    },
    DO0: {block: says(words_)},
  },
});

const choice: WorldScenario = {
  name: 'A question that matters',
  description: 'A story that asks you something and carries on regardless.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        declareProperty('boolean', 'opened the door', 'false'),
        addActor('actors/speechBox', [
          placeAt(20, 200),
          {
            type: 'world_add_trait',
            fields: {TRAIT: 'Mouse#CanBeClickedTrait'},
            inputs: {ACTOR: me()},
          },
          {
            type: 'world_add_trait',
            fields: {TRAIT: 'Conversation#HasAConversationTrait'},
            inputs: {ACTOR: me()},
          },
          {
            type: 'world_set_Conversation_HowManyLinesProperty',
            inputs: {ACTOR: me(), VALUE: num(4)},
          },
        ]),
        addActor('actors/button', [
          placeAt(80, 120),
          setText('TextProperty', words('Open it')),
        ]),
        addActor('actors/button', [
          placeAt(240, 120),
          setText('TextProperty', words('Walk away')),
        ]),
      ],
      handlers: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {
            block: {
              type: 'world_do_Conversation_MakeSayTheNextThingAction',
              inputs: {VALUE: me()},
            },
          },
        },
        {
          type: 'world_on_Conversation_MovesToALineEvent',
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {
            block: chainRows([
              lineIs(1, 'Somebody was knocking.'),
              lineIs(2, 'Do you open the door?'),
              lineIs(3, 'You opened it. The rain came in with them.'),
              lineIs(4, 'You went back to bed, and slept badly.'),
            ]),
          },
        },
      ],
    }),
    stockActors: ['speechBox', 'button'],
    rules: ['conversation', 'mouse'],
  }),
  instructions: `
## A question that matters

The story asks whether you open the door, and then tells you what you did
anyway: clicking the box moves to the next line, and the next line is line
three whatever you think about it. The two Buttons do nothing at all.

A choice is the cursor moving somewhere it would not have gone. **send ⟨the
box⟩ to line ⟨n⟩** puts it wherever you like, and that is the whole of
branching — no new machinery, just a jump.

### What you do

1. Add **when ⟨any Button⟩ is clicked**. In it ask which Button was clicked —
   \`text of ⟨event actor⟩\` says which — and **send ⟨the Speech Box⟩ to line**
   3 for "Open it" and 4 for "Walk away".
2. Run it, click through to the question, and answer. The two answers go to
   two different lines.
3. A choice the story forgets is not a choice. In the same handler, set the
   world's **opened the door** to true or false.
4. Use it later: in a fifth line, say something different depending on what is
   remembered. That is what makes the question matter.
`.trim(),
};

// ── story/scene ──────────────────────────────────────────────────────────────

const scene: WorldScenario = {
  name: 'Staged',
  description:
    'Two people talking in an empty grey room, with nobody to look at.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        {
          type: 'world_set_background_color',
          inputs: {COLOR: swatch('#2b2b33')},
        },
        addActor('actors/portrait', [placeAt(80, 120)]),
        addActor('actors/speechBox', [
          placeAt(20, 200),
          {
            type: 'world_add_trait',
            fields: {TRAIT: 'Mouse#CanBeClickedTrait'},
            inputs: {ACTOR: me()},
          },
          {
            type: 'world_add_trait',
            fields: {TRAIT: 'Conversation#HasAConversationTrait'},
            inputs: {ACTOR: me()},
          },
          {
            type: 'world_set_Conversation_HowManyLinesProperty',
            inputs: {ACTOR: me(), VALUE: num(3)},
          },
        ]),
      ],
      handlers: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {
            block: {
              type: 'world_do_Conversation_MakeSayTheNextThingAction',
              inputs: {VALUE: me()},
            },
          },
        },
        {
          type: 'world_on_Conversation_MovesToALineEvent',
          inputs: {
            ACTOR: {
              block: {
                type: 'world_actor_kind',
                fields: {ACTOR: 'actors/speechBox'},
              },
            },
          },
          next: {
            block: chainRows([
              lineIs(1, 'You are late.'),
              lineIs(2, 'The road was gone. I walked.'),
              lineIs(3, 'Then you had better come in.'),
            ]),
          },
        },
      ],
    }),
    stockActors: ['speechBox', 'portrait'],
    rules: ['conversation', 'mouse'],
  }),
  instructions: `
## Staged

Three lines, two speakers, and no way to tell which of them is talking. There
is a Portrait on the stage and it is invisible — that is what a Portrait starts
as, so that its entrance is something you can see happen — and behind
everything there is a flat grey.

A scene is those three things moving with the script: **who is speaking**,
**where it is happening**, and **what it sounds like**. All of them hang off
the same event as the words.

### What you do

1. In the \`moves to a line\` handler, **set sprite** and **set opacity** on the
   Portrait so that a face appears with line one, and a different one with
   line two.
2. Add **set background to ⟨…⟩** with the \`(import…)\` row, and change it at
   line three so the story moves indoors.
3. Add **set music** at the top of the world, and **play sound** on the line
   where somebody knocks.
4. Read what you have written. Every one of those is the same shape — a line
   moved, so something changed — and none of them is about dialogue.
`.trim(),
};

// ── place/edges ──────────────────────────────────────────────────────────────

const edges: WorldScenario = {
  name: 'The end of the world',
  description:
    'A ball that leaves and never comes back, and the two ways to keep it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [addActor(local('ball'), [placeAt(160, 160), setVelocity(3, 3)])],
      actors: [{id: 'ball', name: 'Ball', rows: BALL}],
    }),
    sprites: ['ball'],
    rules: ['motion', 'bounds', 'wrap'],
  }),
  instructions: `
## The end of the world

The Ball goes down and to the right, off the edge, and keeps going forever.
Nothing is wrong: the world has an edge, and nothing said what should happen
there.

There are two answers, and a game usually wants both — one per axis. **Stays
in the Map** stops an actor at the edge. **Wraps at the Edges** brings it back
on the opposite side. Each comes as two traits, across and down, because which
axis you want them on is the whole question.

### What you do

1. Give the Ball **use trait ⟨Stays Across⟩**. It stops at the right-hand wall
   and slides down it.
2. Give it **use trait ⟨Wraps Down⟩**. When it leaves the bottom it comes back
   at the top.
3. Try **Stays Down** as well, and watch what happens: the two answers on one
   axis are not both — the first one to act is the only one you see.
`.trim(),
};

// ── memory/variable ──────────────────────────────────────────────────────────

const variable: WorldScenario = {
  name: 'A box for a number',
  description:
    'Three posts in a row, and the same two numbers written six times.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('post'), [placeAt(60, 160)]),
        addActor(local('post'), [placeAt(160, 160)]),
        addActor(local('post'), [placeAt(260, 160)]),
      ],
      actors: [{id: 'post', name: 'Post', rows: [setSprite('box.png')]}],
    }),
    sprites: ['box'],
  }),
  instructions: `
## A box for a number

Three Posts in a row. Look at what the world says: **60**, **160**, **260** —
and **160** again, three times, for the height.

Change your mind about where the row sits and you have six numbers to find and
edit, and any one of them can be missed. The row is really two facts — where it
starts and how far apart they are — written out six times over.

### What you do

1. At the top of \`main.world\`, **set ⟨gap⟩ to 100**.
2. Put the second Post at **⟨gap⟩ + 60** and the third at **⟨gap⟩ + ⟨gap⟩ + 60**.
   Run it: nothing has changed, and that is the point.
3. Now change **gap** to 40 and run it again. One number, one edit.
4. Do the same for the height, which is the same number three times.
`.trim(),
};

// ── memory/many ──────────────────────────────────────────────────────────────

const many: WorldScenario = {
  name: 'All of them at once',
  description: 'Six coins and six blocks that do the same thing to them.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor(local('coin'), [placeAt(60, 80)]),
        addActor(local('coin'), [placeAt(160, 80)]),
        addActor(local('coin'), [placeAt(260, 80)]),
        addActor(local('coin'), [placeAt(60, 240)]),
        addActor(local('coin'), [placeAt(160, 240)]),
        addActor(local('coin'), [placeAt(260, 240)]),
      ],
      actors: [{id: 'coin', name: 'Coin', rows: [setSprite('box.png')]}],
    }),
    sprites: ['box', 'coin'],
  }),
  instructions: `
## All of them at once

Six Coins, and every one of them is drawn as a plain box. To give them their
real picture you could add six \`set sprite\` blocks — one each, all identical,
and a seventh the day you add a seventh Coin.

A **loop** is one instruction that reaches all of them. It walks a LIST, and
"every actor in the world" is a list you already have.

### What you do

1. Add **for each actor ⟨coin⟩ in ⟨all actors⟩** to the end of \`main.world\`.
2. Inside it, **set sprite of ⟨coin⟩** to the coin picture.
3. Run it. All six change, from one block.
4. Add a seventh Coin to the world, above the loop, and run it again. You did
   not have to touch the loop — which is the difference between six blocks and
   one.
`.trim(),
};

// ── memory/world-state ───────────────────────────────────────────────────────

const worldState: WorldScenario = {
  name: 'State the world shares',
  description: 'Two Labels that disagree about how many lives are left.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        addActor('actors/label', [
          placeAt(90, 110),
          setText('TextProperty', words('Lives: 3')),
        ]),
        addActor('actors/label', [
          placeAt(230, 210),
          setText('TextProperty', words('Lives: 2')),
        ]),
      ],
    }),
    stockActors: ['label'],
  }),
  instructions: `
## State the world shares

Two Labels, and they disagree. One says **Lives: 3** and the other says
**Lives: 2**, and neither is wrong, because the number of lives is not written
down anywhere — it is typed out twice, and the two copies have drifted apart.

The last lesson gave a name to a value inside one stack of blocks. This is the
other kind of name: one the **world** holds, that anything in the world can
read. There is then one number, and a Label showing the wrong one is not a
thing that can happen.

### What you do

1. At the top of \`main.world\`, under \`define world\`, add
   **define number lives with default 3**.
2. Set each Label's text to **join ⟨"Lives: "⟩ ⟨lives⟩** — the *lives* block
   is in the Actor drawer, and it appeared the moment you declared it.
3. Run it. Both say the same thing.
4. Change the default to **5**. Both change, because there is one number now.
`.trim(),
};

// ── memory/actor-state ───────────────────────────────────────────────────────

/** `join ⟨"lamp "⟩ ⟨…⟩` — the Lamp's name, built from a number. */
const lampName = (number: object) => ({
  block: {
    type: 'text_join',
    inputs: {ADD0: words('lamp '), ADD1: number},
  },
});

/** `id` — the number the world keeps, which both Lamps read. */
const worldsId = () => ({block: {type: 'world_get_WorldsMain_IdProperty'}});

const actorState: WorldScenario = {
  // THE FIRST LESSON WITH TWO FILES, and it is not a preference. A property a
  // world's own `define actor` declares is a `const` inside that definition's
  // block scope (`domainBlocks`, `world_actor`), so the actor's drawing can
  // read it and the world's body cannot — which is the one thing this lesson
  // has to do. The Lamp is a file here for the same reason the lesson exists.
  levelData: {showFileBrowser: true},
  name: 'State an actor carries',
  description: 'Two Lamps that cannot tell each other apart.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        declareProperty('number', 'id', '1'),
        addActor('actors/lamp', [
          placeAt(110, 160),
          setText('TextProperty', lampName(worldsId())),
        ]),
        addActor('actors/lamp', [
          placeAt(230, 160),
          setText('TextProperty', lampName(worldsId())),
        ]),
      ],
    }),
    actors: {
      lamp: actorFile(
        'Lamp',
        [useTrait('Writing#ShowsTextTrait'), showAs('text')],
        {
          drawing: {
            width: 96,
            height: 24,
            commands: [fill(swatch('#ffcc66')), drawText(48, 12)],
          },
        },
      ),
    },
    rules: ['writing'],
  }),
  instructions: `
## State an actor carries

Two Lamps, and both say **lamp 1**. The number they read is the world's, and
the world has exactly one of it — so however you set it, you set it for both.
There is nowhere for one Lamp to remember something the other does not.

A world's state is shared on purpose, and that is what the last lesson was for.
An actor's is the opposite on purpose: declared in the **actor's own file**,
every Lamp gets its own copy, and that is what makes two of a kind two things
rather than one thing drawn twice.

So this is also the first lesson with a second file. Every one before it said
everything it had to say in \`main.world\`; a Lamp that remembers something has
to be a file, because that is where a kind of actor keeps what is its own.

### What you do

1. Open \`actors/lamp.actor\` — the file browser is on the left, and this is the
   first lesson that has needed it. Under \`define actor\`, add
   **define number id with default 1**.
2. In \`main.world\`, in each \`add actor\` body, **set id of ⟨this actor⟩** —
   1 for the first, 2 for the second — before the text is set.
3. Change both Labels to read **join ⟨"lamp "⟩ ⟨id of this actor⟩**, the Lamp's
   own \`id\` rather than the world's.
4. Delete the world's \`define number id\`. Nothing breaks: nothing needed it.
`.trim(),
};

// ── memory/score ─────────────────────────────────────────────────────────────

/** `counted`, the world's own tally — the thing this lesson throws away. */
const counted = () => ({
  block: {type: 'world_get_WorldsMain_CountedProperty'},
});

const scoreLesson: WorldScenario = {
  name: 'Somebody already counted',
  description:
    'A hand-rolled tally, and a rule that has one with an ending in it.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      rows: [
        declareProperty('number', 'counted', '0'),
        addActor(local('target'), [placeAt(160, 160)]),
      ],
      actors: [{id: 'target', name: 'Target', rows: [setSprite('coin.png')]}],
      handlers: [
        {
          // The WORLD's telling: a press happened, and it is about nobody. The
          // world hears every click, which is all a tally needs.
          type: 'world_on_Mouse_IsPressedEvent',
          fields: {FILTER0: 'left'},
          next: {
            block: {
              type: 'world_set_WorldsMain_CountedProperty',
              inputs: {
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {A: counted(), B: num(1)},
                  },
                },
              },
              next: {block: {type: 'world_print', inputs: {VALUE: counted()}}},
            },
          },
        },
      ],
    }),
    sprites: ['coin'],
    rules: ['mouse'],
  }),
  instructions: `
## Somebody already counted

Click the Target. A number called \`counted\` goes up by one and prints itself,
and it is correct: it counts.

What it cannot do is say when the count is **enough**. A tally is a number; a
game wants the moment — the click that wins — and that moment is not in the
number. You would have to test for it everywhere you counted.

The **Scoring** rule is this counter, written by somebody else, with the moment
already in it.

### What you do

1. Add a rule, and pick **Scoring**. Read the row before you take it.
2. In the handler, use **add ⟨1⟩ to the score** instead of setting
   \`counted\`, and delete the \`print\` under it.
3. Delete \`define number counted\` — nothing needs it now.
4. In the world, **set target score to 5**, and add the handler
   **when the target is reached**, with **print ⟨get score⟩** in it.
5. Click six times. One line, saying 5: the click that was enough, and nothing
   about the sixth.
`.trim(),
};

/**
 * A lesson is ONE FILE unless it says otherwise.
 *
 * Every lesson written so far says everything it has to say in `main.world`:
 * the actors it asks the learner to change are defined there
 * (`worlds/defineActor`), and the rules and pictures it holds are files nobody
 * has to open. A sidebar listing eleven of them argues with that, and the first
 * thing it invites is the click that leaves the one file the lesson is about.
 *
 * The files are still THERE and still compiled — what is gone is the list. The
 * ways in that belong to a lesson are still on the blocks: the eye beside `use
 * trait` opens the rule behind it, and the rule count on `define world` opens
 * what the project holds.
 *
 * FILES ARE A LESSON OF THEIR OWN, and it is `making/read` — "the rules are
 * blocks, and you can read all of them". A lesson that is about files turns the
 * browser back on by saying so in its own `levelData`, which is what the spread
 * below leaves room for.
 */
const ONE_FILE: WorldScenario['levelData'] = {showFileBrowser: false};

const written: Readonly<Record<TileId, WorldScenario>> = {
  'origin/first-world': firstWorld,
  'input/arrows': arrows,
  'input/press': press,
  'input/mouse': mouse,
  'input/two-hands': twoHands,
  'motion/speed': speed,
  'motion/gravity': gravity,
  'motion/force': force,
  'motion/units': units,
  'motion/drag': drag,
  'motion/tween': tween,
  'logic/if': conditional,
  'logic/collision': collision,
  'logic/and-or': andOr,
  'logic/kinds': kinds,
  'memory/variable': variable,
  'memory/many': many,
  'memory/world-state': worldState,
  'memory/actor-state': actorState,
  'memory/score': scoreLesson,
  'look/sprite': sprite,
  'look/drawing': drawing,
  'look/background': background,
  'look/animation': animation,
  'look/effect': effect,
  'place/position': position,
  'place/edges': edges,
  'place/map': map,
  'place/camera': camera,
  'place/camera-feel': cameraFeel,
  'place/layers': layers,
  'platformer/jump': jump,
  'platformer/pickups': pickups,
  'platformer/hazards': hazards,
  'platformer/level': level,
  'arcade/bounce': bounce,
  'arcade/paddle': paddle,
  'arcade/shoot': shoot,
  'arcade/bricks': bricks,
  'arcade/waves': waves,
  'story/text': storyText,
  'story/reveal': reveal,
  'story/script': script,
  'story/choice': choice,
  'story/scene': scene,
};

/** Every lesson written so far, by the tile it belongs to. */
export const LESSONS: Readonly<Record<TileId, WorldScenario>> =
  Object.fromEntries(
    Object.entries(written).map(([id, lesson]) => [
      id,
      {...lesson, levelData: {...ONE_FILE, ...lesson.levelData}},
    ]),
  ) as Readonly<Record<TileId, WorldScenario>>;

/** The lesson for a tile, if anybody has written it. */
export const lessonFor = (id: TileId): WorldScenario | undefined => LESSONS[id];

/**
 * The level properties a lesson differs in, or nothing if nobody has written it.
 *
 * The rest of what a World level carries is the same for every lesson and is
 * filled in where the properties are assembled (`fixtures/index.ts`), which is
 * why this is the varying part and not a whole `LevelProperties`.
 */
export const levelPropertiesFor = (
  id: TileId,
): LessonProperties | undefined => {
  const lesson = LESSONS[id];
  return (
    lesson && {
      longInstructions: lesson.instructions,
      source: lesson.source,
      ...(lesson.levelData ? {levelData: lesson.levelData} : {}),
    }
  );
};
