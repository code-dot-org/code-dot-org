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

/** Every lesson written so far, by the tile it belongs to. */
export const LESSONS: Readonly<Record<TileId, WorldScenario>> = {
  'origin/first-world': firstWorld,
  'input/arrows': arrows,
  'input/press': press,
  'input/mouse': mouse,
  'input/two-hands': twoHands,
  'motion/speed': speed,
  'motion/gravity': gravity,
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
