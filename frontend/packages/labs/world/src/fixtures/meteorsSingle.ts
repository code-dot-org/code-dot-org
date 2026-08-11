// Meteors again, said entirely in `main.world`.
//
// The pair to ./meteors, for the reason ./breakoutSingle is the pair to
// ./breakout: the same game at both ends of a project's life, so the diff
// between them is what moving a thing into a file buys and costs.
//
// It is the more interesting of the two pairs, because this game has something
// breakout does not — a handler that SPAWNS. The ship's `fires` handler is a
// hat here, on `any ⟨Ship⟩`, and what it adds is a world-local `define actor`
// rather than a module. Nothing about the spawn changes: `any ⟨Ship⟩` in a
// hat's subject compiles to the template, so the handler belongs to every ship
// there will be, and `add actor ⟨Shot⟩ as ⟨shot⟩` still has to name the new
// actor because inside that block `this actor` means it and not the ship.
//
// ONE thing does change, and it is the honest cost of the shape. The rocks are
// placed with `create ⟨Meteor⟩ in map`, which is an arrangement of positions
// and per-instance property overrides — so each rock's heading is written down
// rather than rolled. The file version rolls one (`random integer 0 to 359`)
// because it places each rock with `add actor` and a body, which is a place for
// code to run; an arrangement is data, and data cannot roll a die.
//
// That is not a worse answer, only a different one: written-down headings make
// the game the same every run, which is what a fixture usually wants and what a
// game usually does not.

import {stack, type ProjectSpec} from '../constants';

import {useTrait} from './breakout';
import {at, me, METEORS_SUPPORT_FILES, number, RING, SHOT_VAR} from './meteors';

// A local actor is named by its DEFINING BLOCK'S id, so the ids are written
// down rather than generated (blockly/localActors).
const SHIP = 'meteorsShipDef';
const SHOT = 'meteorsShotDef';
const METEOR = 'meteorsMeteorDef';

const local = (blockId: string) => `local:${blockId}`;

const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/**
 * A rock's arrangement entry: where it starts, and where it is going.
 *
 * The heading is a property OVERRIDE — `Can_Move.velocity`, the trait and
 * property ids Physics declares — which is the whole of what an arrangement can
 * say that a position cannot. Spread around the circle by index so the six of
 * them do not set off together.
 */
const rock = (id: string, column: number, row: number, index: number) => {
  const angle = ((index * 360) / RING.length + 25) * (Math.PI / 180);
  const speed = 1.2;
  return {
    id,
    properties: {
      positional: {position: {x: at(column), y: at(row)}},
      Can_Move: {
        velocity: {
          x: Number((Math.sin(angle) * speed).toFixed(3)),
          y: Number((-Math.cos(angle) * speed).toFixed(3)),
        },
      },
    },
  };
};

const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 460,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

const SINGLE_WORLD = JSON.stringify({
  variables: [SHOT_VAR],
  blocks: {
    blocks: [
      // The world at the top left, where a reader starts. Its actors are
      // hoisted above it in the generated module whatever the layout says
      // (blockly/assembleActorModule).
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Meteors'},
        next: {
          block: stack([
            {type: 'world_use_rule', fields: {RULE: 'Arrow Drive'}},
            {type: 'world_use_rule', fields: {RULE: 'Screen Wrap'}},
            {type: 'world_use_rule', fields: {RULE: 'Shooting'}},
            {type: 'world_use_rule', fields: {RULE: 'Expiry'}},
            {type: 'world_use_rule', fields: {RULE: 'Collisions'}},
            {
              type: 'world_create_in_map',
              id: 'placeShip',
              fields: {
                ACTOR: local(SHIP),
                PLACEMENTS: [
                  {
                    id: 'ship',
                    properties: {positional: {position: {x: at(4), y: at(4)}}},
                  },
                ],
              },
            },
            {
              type: 'world_create_in_map',
              id: 'placeMeteors',
              fields: {
                ACTOR: local(METEOR),
                PLACEMENTS: RING.map(([column, row], index) =>
                  rock(`m${index}`, column, row, index),
                ),
              },
            },
          ]),
        },
      },
      defineActor(SHIP, 'Ship', 20, [
        useTrait('Arrow Drive#DrivenByArrowKeysTrait'),
        useTrait('Input#TakesKeyboardInputTrait'),
        useTrait('Screen Wrap#WrapsAcrossTrait'),
        useTrait('Screen Wrap#WrapsDownTrait'),
        useTrait('Shooting#ShootsTrait'),
        useTrait('Collisions#CanCollideTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'ship.png'}},
      ]),
      defineActor(SHOT, 'Shot', 340, [
        useTrait('Physics#CanMoveTrait'),
        useTrait('Collisions#CanCollideTrait'),
        useTrait('Expiry#ExpiresTrait'),
        {
          type: 'world_set_Expiry_LifetimeProperty',
          inputs: {ACTOR: me(), VALUE: number(1.2)},
        },
        {type: 'world_set_sprite', fields: {SPRITE: 'shot.png'}},
      ]),
      defineActor(METEOR, 'Meteor', 660, [
        useTrait('Physics#CanMoveTrait'),
        useTrait('Screen Wrap#WrapsAcrossTrait'),
        useTrait('Screen Wrap#WrapsDownTrait'),
        useTrait('Collisions#CanCollideTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'asteroid.png'}},
      ]),
      // Asking to fire is not firing: the cooldown decides (rules/shoots).
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'space'},
        x: 20,
        y: 820,
        inputs: {ACTOR: kind(SHIP)},
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
        y: 960,
        inputs: {ACTOR: kind(SHIP)},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: local(SHOT), NAMED: 'named', VAR: SHOT_VAR},
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
      // A rock, shot. `event actor` is the other side of the contact.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        fields: {FILTER0: local(SHOT)},
        x: 620,
        y: 820,
        inputs: {ACTOR: kind(METEOR)},
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
      // A rock, run into. Said and not acted on — there are no lives yet.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        fields: {FILTER0: local(METEOR)},
        x: 620,
        y: 1060,
        inputs: {ACTOR: kind(SHIP)},
        next: {block: {type: 'world_log', fields: {TEXT: 'Ship destroyed!'}}},
      },
    ],
  },
});

export const METEORS_SINGLE_SPEC: ProjectSpec = {
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
      contents: SINGLE_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    ...METEORS_SUPPORT_FILES,
  },
  open: ['main'],
};
