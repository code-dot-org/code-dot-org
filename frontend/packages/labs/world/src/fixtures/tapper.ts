// Tapper — the mouse, and the one thing only the mouse can say.
//
// Every other scenario is played with the keyboard, which can say WHEN but
// never WHERE: `space` is a moment, and the game decides what it happens to.
// A click is a moment AND a place, and that is the whole of what this exists to
// show. Click a coin and it goes; click the floor and nothing does.
//
// THREE PIECES OF THE MOUSE RULE, one per idea, and nothing else in the game:
//
//   - `when ⟨left⟩ is pressed` — the WORLD's event. A click happened to nobody,
//     so it is raised once with no actor, and the handler decides who it was
//     about (rules/mouse).
//   - `mouse position` — where the pointer is IN THE WORLD, which the engine
//     works out from where it is on the screen and where the camera is looking
//     (World.mousePosition). The mark is added there, and that is the whole
//     mechanism: no hit-testing, no "was this actor clicked", just a thing put
//     where the pointer was.
//   - `presses mouse button` under `Takes Mouse Input` — the ACTOR's event, for
//     an actor that asked to hear it. The scoreboard elects it and says which
//     button, which is how a game tells left from right.
//
// WHY A MARK RATHER THAN A CLICK-TEST. There is no "is the pointer over this
// actor" block, and this game does not need one: a mark dropped at the pointer
// that can COLLECT is a click-test made of the rules already here — Collisions
// works out what it landed on, Collection takes it, Expiry cleans the mark up a
// fifth of a second later. The pieces were all in the box.

import {
  buildProject,
  ruleShim,
  stack,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {collectRule} from '../rules/stock/collect';
import {collisionsRule} from '../rules/stock/collisions';
import {expiresRule} from '../rules/stock/expires';
import {motionRule} from '../rules/stock/motion';
import {mouseRule} from '../rules/stock/mouse';

import {at, me, number} from './meteors';

// A world-local actor is named by its DEFINING BLOCK'S id (blockly/localActors).
const COIN = 'tapperCoinDef';
const MARK = 'tapperMarkDef';
const SCOREBOARD = 'tapperScoreDef';

const local = (blockId: string) => `local:${blockId}`;

/** `any ⟨kind⟩` — a hat's subject, and so the TEMPLATE rather than an instance. */
const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/** The variable the spawn binds, so the body can position the new mark. */
const MARK_VAR = {id: 'tapperMarkVar', name: 'mark', type: 'Actor'};

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
              type: 'world_trait_step',
              fields: {PHASE: 'decide', NAME: 'turn'},
              inputs: {
                DO: {
                  block: {
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
      // A coin: something to hit, and something that knows it has been.
      defineActor(COIN, 'Coin', 20, [
        useTrait('Spin#SpinTrait'),
        useTrait('Collisions#CanCollideTrait'),
        useTrait('Collection#CanBeCollectedTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'coin.png'}},
      ]),
      // The mark a click leaves. It collects what it lands on and then goes:
      // a fifth of a second is long enough to be seen and to touch something,
      // and short enough that a fast clicker does not fill the world with them.
      defineActor(MARK, 'Mark', 340, [
        useTrait('Collisions#CanCollideTrait'),
        useTrait('Collection#CollectsTrait'),
        useTrait('Expiry#ExpiresTrait'),
        {
          type: 'world_set_Expiry_LifetimeProperty',
          inputs: {ACTOR: me(), VALUE: number(0.2)},
        },
        {type: 'world_set_sprite', fields: {SPRITE: 'shot.png'}},
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
      // THE CLICK. Raised once, about nobody, so the handler is what decides
      // that it was about the pointer's position.
      {
        type: 'world_on_Mouse_IsPressedEvent',
        fields: {FILTER0: 'left'},
        x: 20,
        y: 700,
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: local(MARK), NAMED: 'named', VAR: MARK_VAR},
            extraState: {named: true},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: {
                      block: {
                        type: 'variables_get_Actor',
                        fields: {VAR: MARK_VAR},
                      },
                    },
                    X: mouseAxis('x'),
                    Y: mouseAxis('y'),
                  },
                },
              },
            },
          },
        },
      },
      // What the mark caught. `collects` is raised on the collector, and each
      // click makes a new one — so this says "got one", not a running total.
      // The count belongs to something that outlives a mark, which is the next
      // thing to build here.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 20,
        y: 880,
        inputs: {ACTOR: kind(MARK)},
        next: {
          block: {type: 'world_log', fields: {TEXT: 'Got one!'}},
        },
      },
      // The ACTOR's side of the same click, and the reason the trait exists:
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
    motionRuleFile: {
      name: 'motion.rule',
      language: 'rule',
      contents: motionRule,
      folderId: 'rules',
    },
    collisionsRuleFile: {
      name: 'collisions.rule',
      language: 'rule',
      contents: collisionsRule,
      folderId: 'rules',
    },
    collectRuleFile: {
      name: 'collect.rule',
      language: 'rule',
      contents: collectRule,
      folderId: 'rules',
    },
    expiresRuleFile: {
      name: 'expires.rule',
      language: 'rule',
      contents: expiresRule,
      folderId: 'rules',
    },
    animationRuleFile: {
      name: 'animation.js',
      language: 'javascript',
      contents: ruleShim('AnimationRule'),
      folderId: 'rules',
    },
    ...starterSprites(['coin', 'shot', 'switch']),
  },
  open: ['main'],
};

export const TAPPER_PROJECT = buildProject(TAPPER_SPEC);
