// Meteors: a ship that turns and thrusts, rocks that drift, and a gun.
//
// The third game in the catalogue, and the one that uses the rules the other
// two do not: Arrow Drive instead of Arrow Keys, Screen Wrap instead of walls,
// Shooting and Expiry instead of a paddle. Between it and breakout, every stock
// rule but the camera ones is in a scenario somebody can play.
//
//   the ship      Arrow Drive — left and right TURN, up thrusts along the way
//                 it is facing, and there is no friction, so it drifts. Screen
//                 Wrap on both axes, which is what makes a small map a whole
//                 world.
//   the gun       two blocks, and the pairing is the rule's whole design:
//                 pressing space ASKS (`make ⟨this actor⟩ fire`) and the
//                 cooldown answers, so a held key is not a wall of bullets.
//                 What a shot IS lives in the `fires` handler, because no
//                 property can hold an actor template and a stock rule
//                 therefore cannot know what a bullet is.
//   the shot      spawned at the ship, moving the way the ship faces —
//                 `rotate ⟨0, -6⟩ by ⟨rotation of this actor⟩` — and Expiry
//                 takes it away a second later, which is the other half of
//                 spawning. Without it a game slowly fills with bullets.
//   the rocks     placed on a ring at fixed points and given a RANDOM heading,
//                 so the layout is the same every time and the game is not.
//
// The `as ⟨shot⟩` on the spawn is not decoration. Inside `add actor`'s body
// `this actor` is the NEW actor, so a bullet that has to be put where the SHIP
// is cannot be written without naming one of the two — the arithmetic would
// silently read the bullet's own position twice.
//
// What it is NOT, again: no lives, no score, no splitting a rock into two
// smaller ones. Splitting is the interesting one — it is `add actor` inside a
// collision handler with a smaller `scale`, and it wants the rock's own
// velocity turned two ways, which is sayable now. It is left out so the file
// stays readable, not because it cannot be said.

import {stack, starterSprites, useTrait, type ProjectSpec} from '../constants';
import {
  collisionsRule,
  driveRule,
  expiresRule,
  inputRule,
  motionRule,
  shootsRule,
  wrapRule,
} from '../rules/stock';
import {TILE_SIZE} from '../runtime/viewport';

import {setNumber} from './breakout';

/** The middle of tile `index`, the same grid the other scenarios use. */
export const at = (index: number) => index * TILE_SIZE + TILE_SIZE / 2;

/** `this actor`, which most sockets in an actor file want. */
export const me = () => ({block: {type: 'world_this_actor'}});

export const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

export const SHOT_VAR = {id: 'meteorsShotVar', name: 'shot', type: 'Actor'};

const SHIP_ACTOR = JSON.stringify({
  variables: [SHOT_VAR],
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Ship'},
        next: {
          block: stack([
            useTrait('Arrow Drive#DrivenByArrowKeysTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            useTrait('Screen Wrap#WrapsAcrossTrait'),
            useTrait('Screen Wrap#WrapsDownTrait'),
            useTrait('Shooting#ShootsTrait'),
            // So a meteor can be noticed running into it.
            useTrait('Collisions#CanCollideTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'ship.png'}},
          ]),
        },
      },
      // Asking to fire is not firing: the cooldown decides (rules/shoots).
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'space'},
        x: 20,
        y: 300,
        next: {
          block: {
            type: 'world_do_Shooting_MakeFireAction',
            inputs: {VALUE: me()},
          },
        },
      },
      // …and this is what a shot IS, which is the project's business.
      {
        type: 'world_on_Shooting_FiresEvent',
        x: 20,
        y: 440,
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/shot', NAMED: 'named', VAR: SHOT_VAR},
            extraState: {named: true},
            inputs: {
              DO: {
                block: stack([
                  {
                    type: 'world_set_position',
                    inputs: {
                      ACTOR: {
                        block: {
                          type: 'variables_get_Actor',
                          fields: {VAR: SHOT_VAR},
                        },
                      },
                      X: {
                        block: {
                          type: 'world_get_Space_PositionProperty',
                          fields: {COMPONENT: 'x'},
                          inputs: {ACTOR: me()},
                        },
                      },
                      Y: {
                        block: {
                          type: 'world_get_Space_PositionProperty',
                          fields: {COMPONENT: 'y'},
                          inputs: {ACTOR: me()},
                        },
                      },
                    },
                  },
                  {
                    type: 'world_set_Physics_VelocityProperty',
                    inputs: {
                      ACTOR: {
                        block: {
                          type: 'variables_get_Actor',
                          fields: {VAR: SHOT_VAR},
                        },
                      },
                      VALUE: {
                        block: {
                          type: 'world_vector_rotate',
                          inputs: {
                            VECTOR: {
                              block: {
                                type: 'world_vector',
                                fields: {VECTOR: {x: 0, y: -6}},
                              },
                            },
                            DEGREES: {
                              block: {
                                type: 'world_get_Space_RotationProperty',
                                inputs: {ACTOR: me()},
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
          },
        },
      },
      // Running into a rock. Said and not acted on — see the header.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        fields: {FILTER0: 'actors/meteor'},
        x: 520,
        y: 300,
        inputs: {ACTOR: me()},
        next: {
          block: {type: 'world_log', fields: {TEXT: 'Ship destroyed!'}},
        },
      },
    ],
  },
});

const SHOT_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Shot'},
        next: {
          block: stack([
            useTrait('Physics#CanMoveTrait'),
            useTrait('Collisions#CanCollideTrait'),
            // The other half of spawning: without it the world fills up.
            useTrait('Expiry#ExpiresTrait'),
            setNumber('world_set_Expiry_LifetimeProperty', 1.2),
            {type: 'world_set_sprite', fields: {SPRITE: 'shot.png'}},
          ]),
        },
      },
    ],
  },
});

const METEOR_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Meteor'},
        next: {
          block: stack([
            useTrait('Physics#CanMoveTrait'),
            useTrait('Screen Wrap#WrapsAcrossTrait'),
            useTrait('Screen Wrap#WrapsDownTrait'),
            useTrait('Collisions#CanCollideTrait'),
            // The stock asteroid drawing, under its own name: a picture is a
            // file the project holds, and it is the same file in any project
            // that imports it, whatever the actor drawing it is called.
            {type: 'world_set_sprite', fields: {SPRITE: 'asteroid.png'}},
          ]),
        },
      },
      // Shot. `event actor` is the other side of the contact — the shot — so
      // both go, and the gun does not punch through the whole field.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        fields: {FILTER0: 'actors/shot'},
        x: 20,
        y: 300,
        inputs: {ACTOR: me()},
        next: {
          block: stack([
            {type: 'world_log', fields: {TEXT: 'Meteor destroyed!'}},
            {
              type: 'world_remove_actor',
              inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
            },
            {type: 'world_remove_actor', inputs: {ACTOR: me()}},
          ]),
        },
      },
    ],
  },
});

/**
 * A rock: placed where it is told, drifting the way the dice say.
 *
 * Fixed positions and random headings, rather than `random location` for both.
 * A random position can put a rock on top of the ship on the first frame, which
 * reads as a broken game rather than as a hard one; a random heading cannot.
 */
const meteorAt = (column: number, row: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/meteor'},
  inputs: {
    DO: {
      block: stack([
        {
          type: 'world_set_position',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            X: number(at(column)),
            Y: number(at(row)),
          },
        },
        {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {
              block: {
                type: 'world_vector_rotate',
                inputs: {
                  VECTOR: {
                    block: {
                      type: 'world_vector',
                      fields: {VECTOR: {x: 0, y: -1.2}},
                    },
                  },
                  DEGREES: {
                    block: {
                      type: 'math_random_int',
                      inputs: {FROM: number(0), TO: number(359)},
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
});

// A ring around the middle, where the ship starts. Six rocks on a 10 x 10 map
// is busy without being a wall.
export const RING: Array<[number, number]> = [
  [1, 1],
  [5, 0],
  [8, 2],
  [8, 7],
  [4, 9],
  [1, 6],
];

const METEORS_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Asteroids'},
        next: {
          block: stack([
            {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/ship'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_position',
                    inputs: {
                      ACTOR: {block: {type: 'world_this_actor'}},
                      X: number(at(4)),
                      Y: number(at(4)),
                    },
                  },
                },
              },
            },
            ...RING.map(([column, row]) => meteorAt(column, row)),
          ]),
        },
      },
    ],
  },
});

/**
 * The rules meteors runs on, the ones those pull in, and the pictures it draws
 * with — shared with the single-world telling, which differs in how the game is
 * SAID and not in what it is made of.
 *
 * THIS LIST IS NOW THE STATEMENT. Holding a rule is what puts it in play
 * (blockly/projectModules), so what used to be five `use rule` rows in the
 * world is these five entries, and there is one place to read the answer rather
 * than two places to keep in step.
 *
 * What is worth noticing while reading it: there is no `solid.rule`. Nothing in
 * this game is solid — a rock is destroyed by a shot, not pushed by one — so
 * `collisions.rule` is here for the contacts alone.
 */
export const METEORS_SUPPORT_FILES: ProjectSpec['files'] = {
  inputRuleFile: {
    name: 'input.rule',
    language: 'rule',
    contents: inputRule,
    folderId: 'rules',
  },
  driveRuleFile: {
    name: 'drive.rule',
    language: 'rule',
    contents: driveRule,
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
  wrapRuleFile: {
    name: 'wrap.rule',
    language: 'rule',
    contents: wrapRule,
    folderId: 'rules',
  },
  shootsRuleFile: {
    name: 'shoots.rule',
    language: 'rule',
    contents: shootsRule,
    folderId: 'rules',
  },
  expiresRuleFile: {
    name: 'expires.rule',
    language: 'rule',
    contents: expiresRule,
    folderId: 'rules',
  },
  ...starterSprites(['ship', 'asteroid', 'shot']),
};

export const METEORS_SPEC: ProjectSpec = {
  folders: [
    'rules',
    'worlds',
    'actors',
    'animations',
    'sprites',
    'backgrounds',
    'maps',
    'effects',
  ],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: METEORS_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    ship: {
      name: 'ship.actor',
      language: 'actor',
      contents: SHIP_ACTOR,
      folderId: 'actors',
    },
    shot: {
      name: 'shot.actor',
      language: 'actor',
      contents: SHOT_ACTOR,
      folderId: 'actors',
    },
    meteor: {
      name: 'meteor.actor',
      language: 'actor',
      contents: METEOR_ACTOR,
      folderId: 'actors',
    },
    ...METEORS_SUPPORT_FILES,
  },
  open: ['main'],
};
