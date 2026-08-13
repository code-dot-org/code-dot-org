// Tapper — the mouse, and the two things only the mouse can say.
//
// Every other scenario is played with the keyboard, which can say WHEN but
// never WHERE: `space` is a moment, and the game decides what it happens to. A
// click is a moment AND a place, and that is the whole of what this exists to
// show. Click a coin and it goes; click the floor and nothing does.
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
// questions. A scoreboard counting presses and a gun firing wherever it is
// aimed want the first; a button, a card, and a coin want the second.
//
// AND `mouse position`, which is not an event at all. It is where the pointer
// is IN THE WORLD, worked out from where it is on the screen and where the
// camera is looking (World.mousePosition), and it answers at any moment rather
// than when something happens. The crosshair reads it every frame, which is
// what makes a game feel aimed rather than merely clicked at.

import {
  buildProject,
  ruleShim,
  stack,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {mouseRule} from '../rules/stock/mouse';

import {at, me} from './meteors';

// A world-local actor is named by its DEFINING BLOCK'S id (blockly/localActors).
const COIN = 'tapperCoinDef';
const SCOREBOARD = 'tapperScoreDef';

const local = (blockId: string) => `local:${blockId}`;

/** `any ⟨kind⟩` — a hat's subject, and so the TEMPLATE rather than an instance. */
const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/** One axis of `mouse position`, which is what `set position` takes. */
const mouseAxis = (component: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: component},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});

const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 420,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

/** Where the coins sit: a loose scatter, none of them on a straight line. */
const COINS: Array<[number, number]> = [
  [1, 1],
  [4, 2],
  [7, 1],
  [2, 4],
  [5, 5],
  [8, 4],
  [1, 7],
  [4, 8],
  [7, 7],
];

/**
 * The crosshair, in a file of its own — and it has to be a file.
 *
 * `each frame` compiles to `actor.defineStep(…)`, which needs the `const actor`
 * an ACTOR module opens with. A world-local `define actor` is a differently
 * named const in the world's module, so the block is not offered there
 * (blockly/fileKind) — which is why this one thing lives outside `main.world`
 * while the rest of the game is in it.
 *
 * It is also the whole reason the feature exists. Before `each frame`, "keep
 * doing this" meant writing a `.rule` — a rule with one trait, elected by one
 * actor, shared with nobody — for a crosshair that follows the pointer.
 */
const CROSSHAIR_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Crosshair'},
        next: {
          block: stack([
            {type: 'world_set_sprite', fields: {SPRITE: 'switch.png#1'}},
            // The same behavior the coins carry, which is the whole of what a
            // behavior is FOR: the crosshair's own `each frame` below belongs
            // to the crosshair, and this belongs to anything that asks.
            useTrait('Spin#SpinTrait'),
          ]),
        },
      },
      {
        // In `sense`, the first moment of the frame: the crosshair is reading
        // the world rather than deciding anything, and everything that runs
        // afterwards sees it where the pointer is.
        type: 'world_trait_step',
        x: 20,
        y: 200,
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
  },
});

/**
 * A BEHAVIOR — the one thing an actor's own `each frame` cannot be: shared.
 *
 * The crosshair's step belongs to the crosshair and to nothing else, which is
 * right for a crosshair. Spinning is not like that: the coins do it and so does
 * the crosshair, and writing it twice would be two copies to keep in step.
 *
 * So it is a `.behavior` — a rule with exactly one trait of the same name,
 * without the two files' worth of ceremony (specs/BEHAVIORS.md) — and an actor
 * takes it the way it takes anything else, with `use trait ⟨Spin⟩`.
 *
 * ITS STATE IS ITS OWN, AND EACH ACTOR'S IS ITS OWN. `spin speed` is declared
 * inside the behavior, so it arrives and leaves with it and no actor carries a
 * dial for a mechanic it does not have — and every actor carrying it gets a
 * copy, which the coins prove by spinning at speeds written into their
 * arrangement.
 */
const SPIN_BEHAVIOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_behavior',
        x: 20,
        y: 20,
        fields: {NAME: 'Spin'},
        next: {
          block: stack([
            // A declaration and a default, not code — so it sits wherever it
            // reads best, which is the top, and is lifted onto the behavior
            // rather than run (specs/BEHAVIORS.md).
            {
              type: 'world_rule_property',
              fields: {
                TYPE: 'number',
                ACCESS: 'writable',
                NAME: 'spin speed',
                DEFAULT: '120',
              },
            },
            {
              type: 'world_set_Space_RotationProperty',
              inputs: {
                ACTOR: me(),
                // Degrees per SECOND, so the spin is the same however long a
                // frame took — `delta` is what makes it so.
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
          ]),
        },
      },
    ],
  },
});

const MAIN_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Tapper'},
        next: {
          block: stack([
            {
              type: 'world_create_in_map',
              id: 'tapperPlaceCoins',
              fields: {
                ACTOR: local(COIN),
                PLACEMENTS: COINS.map(([column, row], index) => ({
                  id: `coin${index + 1}`,
                  properties: {
                    positional: {position: {x: at(column), y: at(row)}},
                    // The behavior's own state, overridden per coin: nine
                    // actors carrying one behavior, each with its own copy.
                    Spin: {spin_speed: 40 + index * 35},
                  },
                })),
              },
            },
            {
              type: 'world_add_actor',
              fields: {ACTOR: local(SCOREBOARD)},
            },
            {type: 'world_add_actor', fields: {ACTOR: 'actors/crosshair'}},
          ]),
        },
      },
      // A coin: something to click, and the whole of what that takes. `Can Be
      // Clicked` is the ONLY row here that is about the mouse — no collision
      // shape, nothing to collect it, nothing to clean up afterwards, because
      // the rule works out what the pointer was over from where the coin is
      // and how big it is drawn.
      defineActor(COIN, 'Coin', 20, [
        useTrait('Mouse#CanBeClickedTrait'),
        useTrait('Spin#SpinTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'coin.png'}},
      ]),
      // Somebody to hear the clicks. It elects `Takes Mouse Input`, which is
      // what makes the rule tell it — the world hears every click either way,
      // and an actor hears the ones it asked for (rules/mouse).
      defineActor(SCOREBOARD, 'Scoreboard', 660, [
        useTrait('Mouse#TakesMouseInputTrait'),
        // ONE CELL of the switch sheet: `switch.png` is a strip of three, and
        // an actor drawing the whole strip is three switches side by side
        // rather than a thing (blockly/spriteCells).
        {type: 'world_set_sprite', fields: {SPRITE: 'switch.png#0'}},
      ]),
      // THE WORLD'S TELLING. Raised once, about nobody — so a handler that
      // wants to know where it landed has to ask, and `mouse position` is the
      // asking. Every press prints a point, including the ones that hit
      // nothing, which is exactly what "about nobody" means.
      {
        type: 'world_on_Mouse_IsPressedEvent',
        fields: {FILTER0: 'left'},
        x: 20,
        y: 700,
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
        fields: {FILTER0: ''},
        x: 520,
        y: 700,
        inputs: {ACTOR: kind(COIN)},
        next: {
          block: stack([
            {type: 'world_log', fields: {TEXT: 'Got one!'}},
            {type: 'world_remove_actor', inputs: {ACTOR: me()}},
          ]),
        },
      },
      // AND THE SCOREBOARD'S. It elected `Takes Mouse Input`, so it hears
      // every press wherever it landed — the coins it missed included.
      // `(any)` hears both buttons, and the value says which.
      {
        type: 'world_on_Mouse_PressesMouseButtonEvent',
        fields: {FILTER0: ''},
        x: 520,
        y: 880,
        inputs: {ACTOR: kind(SCOREBOARD)},
        next: {
          block: {
            type: 'world_print',
            inputs: {VALUE: {block: {type: 'world_event_value'}}},
          },
        },
      },
    ],
  },
});

export const TAPPER_SPEC: ProjectSpec = {
  folders: ['actors', 'rules', 'worlds', 'sprites'],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: MAIN_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    spinBehavior: {
      name: 'spin.behavior',
      language: 'behavior',
      contents: SPIN_BEHAVIOR,
      folderId: 'rules',
    },
    crosshair: {
      name: 'crosshair.actor',
      language: 'actor',
      contents: CROSSHAIR_ACTOR,
      folderId: 'actors',
    },
    // The mouse rule is the point of the scenario, so it is a file to open and
    // read rather than something that merely happens.
    mouseRuleFile: {
      name: 'mouse.rule',
      language: 'rule',
      contents: mouseRule,
      folderId: 'rules',
    },
    animationRuleFile: {
      name: 'animation.js',
      language: 'javascript',
      contents: ruleShim('AnimationRule'),
      folderId: 'rules',
    },
    ...starterSprites(['coin', 'switch']),
  },
  open: ['main'],
};

export const TAPPER_PROJECT = buildProject(TAPPER_SPEC);
