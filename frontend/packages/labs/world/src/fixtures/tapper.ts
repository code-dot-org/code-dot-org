// Tapper — the mouse, and the two things only the mouse can say.
//
// Every other scenario is played with the keyboard, which can say WHEN but
// never WHERE: `space` is a moment, and the game decides what it happens to. A
// click is a moment AND a place, and that is the whole of what this exists to
// show. Click a coin and it goes; click the floor and nothing does.
//
// AND THE SCORE, which is what all of that was for. `score` is the Main
// Screen's own property (specs/WORLD_STATE.md), so the count outlives the coin
// that raised the event — and a Label on the Main Screen draws it, so the game
// says it to the player rather than to the console. The coin raises `scored`,
// and the Label's own code answers it: events are how the game talks to its
// screen (specs/SCREEN_STACK_PLAN.md).
//
// THREE TELLINGS OF ONE PRESS, which is the shape of the mouse rule and the
// reason it has two traits:
//
//   - `when ⟨left⟩ is pressed` — the WORLD's. A click happened to nobody, so it
//     is raised once with no actor, and a handler that wants to know where has
//     to ask. This one prints `mouse position`, which is what asking looks like.
//   - `presses mouse button` under `Takes Mouse Input` — an actor that asked to
//     hear EVERY press, wherever it landed. The scoreboard elects it and prints
//     which button, which is how a game tells left from right.
//   - `is clicked with` under `Can Be Clicked` — an actor that asked to hear
//     only the presses that landed ON IT. The coin elects it and takes itself
//     out of the world, and nothing in the handler works out who was clicked
//     because the event already knows.
//
// The last one is the one to read twice. `Takes Mouse Input` and `Can Be
// Clicked` are not two spellings of the same subscription — they are two
// questions. A scoreboard counting presses and a zapper answering wherever it
// aimed want the first; a button, a card, and a coin want the second.
//
// AND `mouse position`, which is not an event at all. It is where the pointer
// is IN THE WORLD, worked out from where it is on the screen and where the
// camera is looking (World.mousePosition), and it answers at any moment rather
// than when something happens. The crosshair reads it every frame, which is
// what makes a game feel aimed rather than merely clicked at.

import {actorDocument} from '../actors/actorDocument';
import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {labelActor} from '../actors/stock/label';
import {emitWorldEvent, hearWorldEvent} from '../actors/stock/workspace';
import {
  buildProject,
  stack,
  starterSprites,
  type ProjectSpec,
} from '../constants';
import {placeInMap, screenFile} from '../progression/lessons/worlds';
import type {RuleData} from '../rules/ruleData';
import {referenceToStock} from '../rules/ruleReference';

import {me, number} from './meteors';

// Every actor is a file, and an ACTOR dropdown names one by its module path.
const COIN = 'actors/coin';
const SCOREBOARD = 'actors/scoreboard';

/**
 * `get score` — the game's own, with no subject to name.
 *
 * Named for the FILE and not for the game (`Tapper`): a name is a label
 * here, and renaming the game must not turn every block that reads its state
 * into a stand-in (`memberKey`, specs/WORLD_STATE.md).
 */
const score = () => ({
  block: {type: 'world_get_ScreensMain_ScoreProperty'},
});

/** `set text of ⟨who⟩ to ⟨join "Score: " ⟨score⟩⟩`, on the Main Screen. */
const scoreText = (who: object) => ({
  type: 'world_set_ActorsLabel_TextProperty',
  inputs: {
    ACTOR: who,
    VALUE: {
      block: {
        type: 'text',
        fields: {TEXT: 'Score: '},
        inputs: {
          ADD: {
            block: {
              type: 'world_as_text',
              inputs: {VALUE: score()},
            },
          },
        },
      },
    },
  },
});

/** One axis of `mouse position`, which is what `set position` takes. */
const mouseAxis = (component: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: component},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});

/**
 * The Main Screen's Labels: the score, which its own code keeps up to date,
 * and the furniture, which says the same thing for the whole game.
 *
 * WHERE THEY GO IS ARITHMETIC, not taste. A Label is a 96 by 24 canvas with its
 * words in the middle of it (`actors/stock/label`), so two of them less than 24
 * apart overlap however small the type is. The coins fill y 32 to 256, so the
 * title goes in the band above them and the hints in the band below, a canvas
 * apart. The score is at y=16 and not 32: the top row of coins is centered at
 * 48 and is 32 tall, so a Label centered at 32 has its lower half behind the
 * first coin.
 */
const label = (
  id: string,
  [x, y]: [number, number],
  text: string,
  color: string,
  size?: number,
) => ({
  type: 'actors/label',
  id,
  properties: {
    positional: {position: {x, y}},
    Label: {
      text,
      text_color: color,
      ...(size === undefined ? {} : {text_size: size}),
    },
  },
});

const SCORE_LABEL = {
  ...label('Score', [48, 16], 'Score: 0', '#ffcc00'),
  blocks: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: hearWorldEvent('scored'),
          x: 20,
          y: 20,
          next: {block: scoreText(me())},
        },
      ],
    },
  },
};

const INTERFACE = [
  SCORE_LABEL,
  label('Title', [160, 16], 'TAPPER', '#ffffff', 14),
  label('Hint', [160, 282], 'click a coin', '#8890b0', 9),
  label('Hint2', [160, 306], 'the right button too', '#8890b0', 9),
];

/** The counters the coin grid runs on — numbers, so the body can read them. */
const ROW_VAR = {id: 'tapperRowVar', name: 'row', type: 'Number'};
const COLUMN_VAR = {id: 'tapperColumnVar', name: 'column', type: 'Number'};

const count = (variable: object) => ({
  block: {type: 'variables_get_Number', fields: {VAR: variable}},
});

/** `a ⟨op⟩ b`, for the arithmetic the grid is worked out with. */
const math = (op: string, a: object, b: object) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: op},
    inputs: {A: a, B: b},
  },
});

/** `count with ⟨v⟩ from 0 to 2 by 1 do …` — one side of the grid. */
const countTo = (variable: object, body: object) => ({
  type: 'world_count_with',
  fields: {VAR: variable},
  inputs: {
    FROM: number(0),
    TO: number(2),
    BY: number(1),
    DO: {block: body},
  },
});

/**
 * Nine coins, in three rows of three, each spinning a little faster than the
 * last.
 *
 * TWO NESTED COUNTING LOOPS rather than nine placements on a map. The map popup
 * places prefabs — it has no inspector, so a placement's properties are not
 * something a learner can set there — and this scenario used to carry a
 * per-coin `spin speed` written straight into the file, which is a program
 * nobody could have written in the editor it ships with.
 *
 * What the loop buys is the thing the placements were faking: a number the body
 * can read. `row` and `column` say where the coin goes, and the two together
 * say how fast it spins — so the nine copies of the trait's own state are
 * visibly nine, which is the whole claim.
 */
const COIN_GRID = countTo(
  ROW_VAR,
  countTo(COLUMN_VAR, {
    type: 'world_add_actor',
    fields: {ACTOR: COIN},
    inputs: {
      DO: {
        block: stack([
          {
            type: 'world_set_position',
            inputs: {
              ACTOR: me(),
              X: math(
                'ADD',
                number(48),
                math('MULTIPLY', count(COLUMN_VAR), number(96)),
              ),
              Y: math(
                'ADD',
                number(48),
                math('MULTIPLY', count(ROW_VAR), number(96)),
              ),
            },
          },
          {
            type: 'world_set_Spin_SpinSpeedProperty',
            inputs: {
              ACTOR: me(),
              VALUE: math(
                'ADD',
                number(40),
                math(
                  'MULTIPLY',
                  math(
                    'ADD',
                    math('MULTIPLY', count(ROW_VAR), number(3)),
                    count(COLUMN_VAR),
                  ),
                  number(35),
                ),
              ),
            },
          },
        ]),
      },
    },
  }),
);

// A coin: something to click, and the whole of what that takes. `Can Be
// Clicked` is the ONLY row here that is about the mouse — no collision shape,
// nothing to collect it, nothing to clean up afterwards, because the rule
// works out what the pointer was over from where the coin is and how big it
// is drawn.
const COIN_ACTOR = actorDocument({
  name: 'Coin',
  sprite: 'coin.png',
  traits: ['Mouse#CanBeClickedTrait', 'Spin#SpinTrait'],
});

// Somebody to hear the clicks. It elects `Takes Mouse Input`, which is what
// makes the rule tell it — the world hears every click either way, and an
// actor hears the ones it asked for (rules/mouse).
const SCOREBOARD_ACTOR = actorDocument({
  name: 'Scoreboard',
  // ONE CELL of the switch sheet: `switch.png` is a strip of three, and an
  // actor drawing the whole strip is three switches side by side rather than
  // a thing (blockly/spriteCells).
  sprite: 'switch.png#0',
  traits: ['Mouse#TakesMouseInputTrait'],
});

/**
 * The crosshair, and the `each frame` that is the whole reason it exists.
 *
 * Before `each frame`, "keep doing this" meant writing a `.rule` — a rule with
 * one trait, elected by one actor, shared with nobody — for a crosshair that
 * follows the pointer.
 */
const CROSSHAIR_ACTOR = actorDocument({
  name: 'Crosshair',
  sprite: 'switch.png#1',
  traits: [
    // The same trait the coins carry, which is the whole of what a
    // shared one is FOR: the crosshair's own `each frame` below
    // belongs to the crosshair alone, and this belongs to anything
    // that asks for it.
    'Spin#SpinTrait',
  ],
  code: [
    {
      // In `sense`, the first moment of the frame: the crosshair is reading
      // the world rather than deciding anything, and everything that runs
      // afterwards sees it where the pointer is.
      type: 'world_trait_step',
      fields: {PHASE: 'sense', NAME: 'follow the pointer'},
      inputs: {
        DO: {
          block: {
            type: 'world_set_position',
            inputs: {
              ACTOR: me(),
              X: mouseAxis('x'),
              Y: mouseAxis('y'),
            },
          },
        },
      },
    },
  ],
});

/**
 * A RULE WITH ONE TRAIT — the one thing an actor's own `each frame` cannot
 * be: shared.
 *
 * The crosshair's step belongs to the crosshair and to nothing else, which is
 * right for a crosshair. Spinning is not like that: the coins do it and so does
 * the crosshair, and writing it twice would be two copies to keep in step.
 *
 * So it is a `.rule` offering one trait of the same name, and an actor takes
 * it the way it takes anything else, with `use trait ⟨Spin⟩`. This was once
 * the lab's one `.behavior` — a file type whose whole purpose was to say this
 * in one block rather than three, and which nothing else ever reached for
 * (specs/BEHAVIORS.md, "Where this ended"). A trait of the rule's name with a
 * step under it is what `New rule` now writes.
 *
 * ITS STATE IS ITS OWN, AND EACH ACTOR'S IS ITS OWN. `spin speed` is declared
 * under the trait, so it arrives and leaves with it and no actor carries a
 * dial for a mechanic it does not have — and every actor carrying it gets a
 * copy, which the coins prove by spinning at speeds written into their
 * arrangement.
 */
const SPIN_RULE = JSON.stringify(
  {
    type: 'rule',
    name: 'Spin',
    ability: 'Spins',
    traits: [
      {
        name: 'Spin',
        properties: [
          {
            name: 'spin speed',
            type: 'number',
            access: 'writable',
            value: '120',
          },
        ],
        steps: [
          {
            name: 'spin',
            phase: 'decide',
            body: {
              type: 'world_set_Space_RotationProperty',
              inputs: {
                ACTOR: me(),
                // Degrees per SECOND, so the spin is the same however
                // long a frame took — `delta` is what makes it so.
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {
                      A: {
                        block: {
                          type: 'world_get_Space_RotationProperty',
                          inputs: {ACTOR: me()},
                        },
                      },
                      B: {
                        block: {
                          type: 'math_arithmetic',
                          fields: {OP: 'MULTIPLY'},
                          inputs: {
                            A: {
                              block: {
                                type: 'world_get_Spin_SpinSpeedProperty',
                                inputs: {ACTOR: me()},
                              },
                            },
                            B: {block: {type: 'world_step_delta'}},
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
  } satisfies RuleData,
  null,
  2,
);

const MAIN = screenFile({
  name: 'Tapper',
  // THE SCORE. The game's own state, belonging to no rule
  // (specs/WORLD_STATE.md) — which is what was missing when this scenario
  // could only log `Got one!`.
  properties: [{name: 'score', type: 'number', value: '0'}],
  // …and the event that tells the screen, which is how its Label hears.
  events: [{name: 'scored'}],
  // THE GAME. Its interface is the Main Screen's (`INTERFACE`).
  placed: [
    placeInMap(SCOREBOARD, [{id: 'scoreboard'}]),
    placeInMap('actors/crosshair', [{id: 'crosshair'}]),
  ],
  loads: [COIN_GRID],
  handlers: [
    // THE WORLD'S TELLING. Raised once, about nobody — so a handler that
    // wants to know where it landed has to ask, and `mouse position` is the
    // asking. Every press prints a point, including the ones that hit
    // nothing, which is exactly what "about nobody" means.
    {
      type: 'world_on_Mouse_IsPressedEvent',
      fields: {FILTER0: 'left'},
      next: {
        block: {
          type: 'world_print',
          inputs: {VALUE: {block: {type: 'world_mouse_position'}}},
        },
      },
    },
    // THE COIN'S. The same press, told to the one actor it landed on, and
    // the handler does no hit-testing of its own: `this actor` IS the coin
    // that was clicked, so taking it out of the world is one block.
    {
      type: 'world_on_Mouse_IsClickedWithEvent',
      fields: {FILTER0: '', SUBJECT: COIN},
      next: {
        block: stack([
          // The game remembers. Before this there was nowhere to put a
          // count that outlives the coin raising the event, so the game
          // could only say `Got one!` and forget.
          {
            type: 'world_set_ScreensMain_ScoreProperty',
            inputs: {
              VALUE: {
                block: {
                  type: 'math_arithmetic',
                  fields: {OP: 'ADD'},
                  inputs: {A: score(), B: number(1)},
                },
              },
            },
          },
          emitWorldEvent('scored'),
          {type: 'world_remove_actor', inputs: {ACTOR: me()}},
        ]),
      },
    },
    // AND THE SCOREBOARD'S. It elected `Takes Mouse Input`, so it hears
    // every press wherever it landed — the coins it missed included.
    // `(any)` hears both buttons, and the value says which.
    {
      type: 'world_on_Mouse_PressesMouseButtonEvent',
      fields: {FILTER0: '', SUBJECT: SCOREBOARD},
      next: {
        block: {
          type: 'world_print',
          inputs: {VALUE: {block: {type: 'world_event_value'}}},
        },
      },
    },
  ],
});

export const TAPPER_SPEC: ProjectSpec = {
  folders: ['actors', 'rules', 'screens', 'maps', 'sprites'],
  files: {
    main: {
      name: 'main.screen',
      language: 'screen',
      contents: MAIN.screen,
      folderId: 'screens',
      active: true,
      open: true,
    },
    level: {
      name: 'main.map',
      language: 'map',
      contents: MAIN.map,
      folderId: 'maps',
      open: true,
    },
    spinRule: {
      name: 'spin.rule',
      language: 'rule',
      contents: SPIN_RULE,
      folderId: 'rules',
    },
    coin: {
      name: 'coin.actor',
      language: 'actor',
      contents: COIN_ACTOR,
      folderId: 'actors',
    },
    scoreboard: {
      name: 'scoreboard.actor',
      language: 'actor',
      contents: SCOREBOARD_ACTOR,
      folderId: 'actors',
    },
    crosshair: {
      name: 'crosshair.actor',
      language: 'actor',
      contents: CROSSHAIR_ACTOR,
      folderId: 'actors',
    },
    // The mouse rule is the point of the scenario, so it is a file to open and
    // read rather than something that merely happens.
    labelActorFile: {
      name: 'label.actor',
      language: 'actor',
      contents: labelActor,
      folderId: 'actors',
    },
    mouseRuleFile: {
      name: 'mouse.rule',
      language: 'rule',
      contents: referenceToStock('mouse'),
      folderId: 'rules',
    },
    ...starterSprites(['coin', 'switch']),
  },
  open: ['main', 'level'],
};

// The Viewport the Main Screen places.
const built = buildProject(TAPPER_SPEC);
const withViewport = importStockActor(
  built.source,
  stockActorById('viewport')!,
).source;

/** The game, with its interface beside the Viewport on the Main Screen. */
export const TAPPER_PROJECT = {
  ...built,
  source: {
    ...withViewport,
    files: Object.fromEntries(
      Object.entries(withViewport.files).map(([id, file]) => {
        if (file.name !== 'main.screen') {
          return [id, file];
        }
        const screen = JSON.parse(file.contents ?? '{}') as {
          actors: object[];
        };
        return [
          id,
          {
            ...file,
            contents: JSON.stringify(
              {...screen, actors: [...screen.actors, ...INTERFACE]},
              null,
              2,
            ),
          },
        ];
      }),
    ),
  },
};
