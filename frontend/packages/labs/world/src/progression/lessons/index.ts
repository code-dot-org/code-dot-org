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
// Six of sixty-seven, which is milestone 4 of specs/PROGRESSION_UI.md: enough
// to walk the first hour of the progression end to end and find out whether any
// of this works.

import {
  actorFile,
  fill,
  num,
  rectangle,
  setSprite,
  swatch,
  useTrait,
} from '../../actors/stock/workspace';
import type {WorldScenario} from '../../fixtures/scenarios';
import type {LessonProperties, TileId} from '../types';

import {lessonSource} from './support';
import {addActor, placeAt, worldFile} from './worlds';

/** A screen's worth of world, in tiles (32px each). */
const SCREEN: [number, number] = [12, 9];

// ── origin/first-world ───────────────────────────────────────────────────────

const firstWorld: WorldScenario = {
  name: 'First light',
  description: 'A world with one actor in it, and a Run button.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: SCREEN,
      rows: [addActor('hero', [placeAt(192, 144)])],
    }),
    actors: {hero: actorFile('Hero', [setSprite('player.png')])},
    sprites: ['player'],
  }),
  instructions: `
## A world with something in it

Press **Run**. There is a world, and there is one thing in it.

A project is a folder of files. \`worlds/main.world\` says what the world is and
what is in it; \`actors/hero.actor\` says what a Hero *is*. Nothing is built in —
the picture the Hero draws is a file too, in \`sprites/\`.

### What you do

1. Open \`actors/hero.actor\` and read it. It is two blocks.
2. Back in \`main.world\`, add a **second** actor to the world.
3. Give it a picture, and put it somewhere the Hero is not.
`.trim(),
};

// ── input/arrows ─────────────────────────────────────────────────────────────

const arrows: WorldScenario = {
  name: 'Make it go',
  description: 'A player that ignores you, and the trait that changes that.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: SCREEN,
      rows: [addActor('hero', [placeAt(192, 144)])],
    }),
    actors: {hero: actorFile('Hero', [setSprite('player.png')])},
    sprites: ['player'],
    rules: ['arrows'],
  }),
  instructions: `
## Make it go

Press the arrow keys. Nothing happens — the Hero does not know about them.

This project holds the **Arrow Keys** rule (\`rules/arrows.rule\`). A rule sitting
in a project does nothing by itself: an actor has to *elect* what it offers.

### What you do

1. In \`actors/hero.actor\`, add **use trait ⟨Moves Across⟩** under the Hero.
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
      tiles: SCREEN,
      rows: [addActor('hero', [placeAt(40, 144)])],
    }),
    actors: {
      hero: actorFile('Hero', [setSprite('player.png')], {
        handlers: [
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
      }),
    },
    sprites: ['player'],
    rules: ['motion'],
  }),
  instructions: `
## Speed is not a place

The Hero crosses the screen, and it does it the way everybody writes first:
**every frame, put it two pixels further right**. Open \`actors/hero.actor\` and
read the handler that does it.

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
      tiles: SCREEN,
      rows: [
        // Directly above the ground, and that is not decoration: at x 160 and
        // 192 the two 32-pixel sprites overlap by nothing at all, and the Hero
        // falls past the corner of the floor. The lesson's check found it.
        addActor('hero', [placeAt(192, 40)]),
        addActor('ground', [placeAt(192, 260)]),
      ],
    }),
    actors: {
      hero: actorFile('Hero', [setSprite('player.png')]),
      ground: actorFile('Ground', [setSprite('ground.png')]),
    },
    sprites: ['player', 'ground'],
    rules: ['gravity'],
  }),
  instructions: `
## Down

The Hero is in the air and stays there. The **Gravity** rule is in this project
(\`rules/gravity.rule\`) and nothing has elected it.

### What you do

1. Give the Hero **use trait ⟨Affected by Gravity⟩**. Run it: it falls, and it
   keeps falling, straight through the floor.
2. Give the Ground **use trait ⟨Acts as Ground⟩**. Now it lands.
3. Add a **when ⟨Hero⟩ stops falling** handler and print something, so you can
   see the moment happen.
4. Open \`rules/gravity.rule\` and find the number that says how hard it pulls.
   Change it and run again.
`.trim(),
};

// ── look/sprite ──────────────────────────────────────────────────────────────

const sprite: WorldScenario = {
  name: 'A picture is a file',
  description: 'An actor drawing a grey box, and the picture it could have.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: SCREEN,
      rows: [addActor('hero', [placeAt(192, 144)])],
    }),
    actors: {
      hero: actorFile('Hero', [], {
        drawing: {
          width: 24,
          height: 24,
          commands: [fill(swatch('#8d8d99')), rectangle(0, 0, 24, 24)],
        },
      }),
    },
  }),
  instructions: `
## A picture is a file

The Hero is a grey box, and it is a grey box because \`actors/hero.actor\` draws
one. Nothing in this lab is built in: a picture is a **file** the project holds.

### What you do

1. Add **set sprite** to the Hero, and use the \`(import…)\` row on its dropdown
   to bring a picture in. Look at \`sprites/\` afterwards — it is really there.
2. Run it. The sprite wins; the drawing underneath is what an actor does when it
   has no picture.
3. Open the picture you imported and **paint on it**. It is yours now — the copy
   in the library is untouched.
`.trim(),
};

// ── place/position ───────────────────────────────────────────────────────────

const position: WorldScenario = {
  name: 'x and y',
  description: 'Three markers in a heap, and three places to put them.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: SCREEN,
      rows: [
        addActor('marker', [placeAt(192, 144)]),
        addActor('marker', [placeAt(192, 144)]),
        addActor('marker', [placeAt(192, 144)]),
      ],
    }),
    actors: {marker: actorFile('Marker', [setSprite('coin.png')])},
    sprites: ['coin'],
  }),
  instructions: `
## x and y

Three Markers, all in the same place, so it looks like one. A position is two
numbers: **x** across, and **y** DOWN — which is the one that catches everybody,
because a bigger \`y\` is further down the screen, not further up.

The world is 12 tiles by 9, and a tile is 32 pixels: 384 across, 288 down.

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
      tiles: SCREEN,
      rows: [addActor('hero', [placeAt(192, 144)])],
    }),
    actors: {
      hero: actorFile('Hero', [
        useTrait('Arrow Keys#MovesAcrossTrait'),
        setSprite('player.png'),
      ]),
    },
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
      tiles: SCREEN,
      rows: [addActor('target', [placeAt(192, 144)])],
    }),
    actors: {target: actorFile('Target', [setSprite('coin.png')])},
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
      tiles: SCREEN,
      rows: [addActor('ship', [placeAt(192, 144)])],
    }),
    actors: {
      ship: actorFile('Ship', [
        useTrait('Arrow Keys#MovesAcrossTrait'),
        setSprite('ship.png'),
      ]),
    },
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
const setVelocity = (x: number, y: number) => ({
  type: 'world_set_Physics_VelocityProperty',
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: {block: {type: 'world_vector', fields: {VECTOR: {x, y}}}},
  },
});

/** `when ⟨this actor⟩ hears ⟨key⟩ pressed`, as a root beside a `define actor`. */
const onPressed = (key: string, body: object, y = 260) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: key},
  x: 20,
  y,
  inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
  next: {block: body},
});

const force: WorldScenario = {
  name: 'A shove',
  description:
    'A ball that says "bang" and does not move, and the block that changes that.',
  source: lessonSource({
    world: worldFile({
      name: 'My World',
      tiles: SCREEN,
      rows: [addActor('ball', [placeAt(64, 144)])],
    }),
    actors: {
      ball: actorFile(
        'Ball',
        [
          useTrait('Physics#CanMoveTrait'),
          useTrait('Input#TakesKeyboardInputTrait'),
          setSprite('ball.png'),
        ],
        {
          handlers: [
            onPressed('space', {
              type: 'world_log',
              fields: {TEXT: 'bang'},
            }),
          ],
        },
      ),
    },
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

1. In \`actors/ball.actor\`, swap the **print** for **apply force**, and give it
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
      tiles: SCREEN,
      rows: [addActor('ball', [placeAt(16, 144), setVelocity(60, 0)])],
    }),
    actors: {
      ball: actorFile('Ball', [
        useTrait('Physics#CanMoveTrait'),
        setSprite('ball.png'),
      ]),
    },
    sprites: ['ball'],
    rules: ['motion'],
  }),
  instructions: `
## Units per second

The Ball is gone before you can see it. Its speed says **60**, and 60 is an
enormous number here.

A speed is in **units per second**, and one unit is **100 pixels**. So 60 means
six thousand pixels every second, and this world is only 384 across.

The world is 12 tiles by 9, and a tile is 32 pixels: **384 across**.

### What you do

1. Work out the speed that crosses 384 pixels in **two seconds**, in units.
2. Put it in the \`set speed\` block in \`worlds/main.world\`.
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
      tiles: SCREEN,
      rows: [addActor('ball', [placeAt(24, 144), setVelocity(2.5, 0)])],
    }),
    actors: {
      ball: actorFile('Ball', [
        useTrait('Physics#CanMoveTrait'),
        setSprite('ball.png'),
      ]),
    },
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
      tiles: SCREEN,
      rows: [
        addActor('door', [placeAt(96, 144)]),
        addActor('post', [placeAt(320, 144)]),
      ],
    }),
    actors: {
      door: actorFile('Door', [setSprite('box.png')]),
      post: actorFile('Post', [setSprite('ground.png')]),
    },
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

1. In \`worlds/main.world\`, add **play a tween on ⟨any Door⟩ over 1 second**.
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
      tiles: SCREEN,
      rows: [addActor('ball', [placeAt(24, 144), setVelocity(1.6, 0)])],
    }),
    actors: {
      ball: actorFile('Ball', [
        useTrait('Physics#CanMoveTrait'),
        setSprite('ball.png'),
      ]),
    },
    sprites: ['ball'],
    rules: ['motion'],
  }),
  instructions: `
## Asking a question

The Ball rolls right and keeps going, out of the world and away. It has no way
to notice where it is, because nothing has asked.

An **if** is a question with two answers, and a program that does one thing or
the other. The question here is "am I past the middle?" — the middle of a world
12 tiles across is 192.

### What you do

1. Give the Ball an **each frame** handler.
2. Inside it, put an **if**, and ask whether **⟨get position x of this actor⟩**
   is greater than **192**.
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
      tiles: SCREEN,
      rows: [
        addActor('ball', [placeAt(24, 144), setVelocity(1.6, 0)]),
        addActor('wall', [placeAt(288, 144)]),
      ],
    }),
    actors: {
      ball: actorFile('Ball', [
        useTrait('Physics#CanMoveTrait'),
        useTrait('Collisions#CanCollideTrait'),
        setSprite('ball.png'),
      ]),
      wall: actorFile('Wall', [setSprite('ground.png')]),
    },
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
      tiles: SCREEN,
      rows: [
        addActor('ball', [placeAt(24, 60), setVelocity(1.6, 0)]),
        addActor('ball', [placeAt(24, 220), setVelocity(1.6, 0)]),
      ],
    }),
    actors: {
      ball: actorFile(
        'Ball',
        [useTrait('Physics#CanMoveTrait'), setSprite('ball.png')],
        {
          handlers: [
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
      ),
    },
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

The world is 288 pixels down, so halfway down is 144.

### What you do

1. Open \`actors/ball.actor\` and find the **if**.
2. Wrap its question in an **and**, and add a second question: is
   **⟨get position y of this actor⟩** greater than **144**?
3. Run it. The low Ball stops in the middle; the high one carries on and leaves.
4. Change the **and** to an **or** and watch both stop again — which is the
   thing to be able to tell apart.
`.trim(),
};

/** Every lesson written so far, by the tile it belongs to. */
export const LESSONS: Readonly<Record<TileId, WorldScenario>> = {
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
  'look/sprite': sprite,
  'place/position': position,
};

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
