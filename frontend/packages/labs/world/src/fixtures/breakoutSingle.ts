// Breakout again, said entirely in `main.world`.
//
// The same game as ./breakout — same board, same rules, same behaviour — with
// nothing outside the one file: the four actors are `define actor` blocks at
// the world's top level, the board is `create ⟨kind⟩ in map` rather than a
// `.map` file, and the ball's two handlers are hats in the world.
//
// Kept BESIDE the other one, not instead of it, because the pair is the point.
// A learner's first game is one file and their fifth is not, and the two
// scenarios are the same game at both ends of that. What the diff between them
// shows is exactly what a file buys:
//
//   an actor file    is reusable and importable, and its event handlers belong
//                    to the TEMPLATE, so every instance ever placed has them
//   a local actor    belongs to this world and nothing else can reach it: no
//                    module, no export, no import (blockly/localActors)
//   a `.map` file    is a document a map editor opens
//   `create in map`  is an arrangement stored in the block, edited by clicking
//                    the field — the map lives in the world that uses it
//
// ONE difference is not cosmetic and is worth knowing before copying this
// shape. A handler here is a hat whose subject is `any ⟨Ball⟩`, and plugged
// into a hat that compiles to the TEMPLATE rather than to the balls that exist
// — so it still reaches an actor placed later, exactly as an actor file's
// handler does. It reads as though it might not, which is why it is said here.
//
// The LAYOUT says nothing. A local actor generates a `const` and `create in
// map` names it, so the definitions do have to precede the world in the emitted
// module — but that is the assembler's job, not the canvas's: it hoists a
// world's own actors, and the handlers that belong to them, above the world
// block whatever order the blocks arrive in (blockly/assembleActorModule). So
// `define world` sits at the top left, where a reader starts, and the actors
// sit under it in the order the game reads: the room, the bricks, the paddle,
// the ball.

import {stack, useTrait, type ProjectSpec} from '../constants';

import {
  ALL_COLUMNS,
  at,
  BRICK_COLUMNS,
  BRICK_ROWS,
  BREAKOUT_SUPPORT_FILES,
  setNumber,
  SIDE_ROWS,
} from './breakout';

// The blocks a dropdown has to be able to name, so their ids are written down
// rather than generated: a local actor is referred to by its DEFINING BLOCK'S
// id (`local:<id>`), which is what lets it be renamed without breaking the
// blocks that place it.
const BRICK = 'breakoutBrickDef';
const WALL = 'breakoutWallDef';
const PADDLE = 'breakoutPaddleDef';
const BALL = 'breakoutBallDef';

/** How a `create in map` block names a world-local actor. */
const local = (blockId: string) => `local:${blockId}`;

/** One arrangement entry: an id of its own, and where it goes. */
const spot = (id: string, column: number, row: number) => ({
  id,
  properties: {positional: {position: {x: at(column), y: at(row)}}},
});

/**
 * `create ⟨kind⟩ in map ⟨arrangement⟩`.
 *
 * The arrangement is the FIELD's value, so it is saved with the block and the
 * world file carries the whole board. Clicking the field opens the grid.
 */
const createInMap = (
  id: string,
  defBlockId: string,
  placements: Array<ReturnType<typeof spot>>,
) => ({
  type: 'world_create_in_map',
  id,
  fields: {ACTOR: local(defBlockId), PLACEMENTS: placements},
});

/** A `define actor` root: the same rows the `.actor` files carry. */
const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 420,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

const SINGLE_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      // The world at the top left, where a reader starts.
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Breakout'},
        next: {
          block: stack([
            {type: 'world_use_rule', fields: {RULE: 'Arrow Keys'}},
            {type: 'world_use_rule', fields: {RULE: 'Solid Bodies'}},
            {type: 'world_use_rule', fields: {RULE: 'Collection'}},
            createInMap('placeWalls', WALL, [
              ...ALL_COLUMNS.map(column => spot(`roof${column}`, column, 0)),
              ...SIDE_ROWS.map(row => spot(`left${row}`, 0, row)),
              ...SIDE_ROWS.map(row => spot(`right${row}`, 9, row)),
            ]),
            createInMap(
              'placeBricks',
              BRICK,
              BRICK_ROWS.flatMap(row =>
                BRICK_COLUMNS.map(column =>
                  spot(`b${row}_${column}`, column, row),
                ),
              ),
            ),
            createInMap('placePaddle', PADDLE, [spot('paddle', 4, 8)]),
            createInMap('placeBall', BALL, [spot('ball', 5, 5)]),
          ]),
        },
      },
      // Then the four actors, in the order the game reads.
      defineActor(WALL, 'Wall', 20, [
        useTrait('Solid Bodies#SolidTrait'),
        setNumber('world_set_SolidBodies_BouncinessProperty', 1),
        {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
      ]),
      defineActor(BRICK, 'Brick', 370, [
        useTrait('Solid Bodies#SolidTrait'),
        useTrait('Collection#CanBeCollectedTrait'),
        setNumber('world_set_SolidBodies_BouncinessProperty', 1),
        {type: 'world_set_sprite', fields: {SPRITE: 'box.png'}},
      ]),
      defineActor(PADDLE, 'Paddle', 720, [
        useTrait('Arrow Keys#ControlledByArrowKeysTrait'),
        useTrait('Input#TakesKeyboardInputTrait'),
        useTrait('Solid Bodies#SolidTrait'),
        setNumber('world_set_SolidBodies_BouncinessProperty', 1),
        {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
        {
          type: 'world_set_Space_ScaleProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            X: {block: {type: 'math_number', fields: {NUM: 2}}},
            Y: {block: {type: 'math_number', fields: {NUM: 0.5}}},
          },
        },
      ]),
      defineActor(BALL, 'Ball', 1110, [
        useTrait('Physics#CanMoveTrait'),
        useTrait('Collection#CollectsTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'ball.png'}},
        {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            VALUE: {
              block: {
                type: 'world_vector',
                fields: {VECTOR: {x: 2.5, y: -2.5}},
              },
            },
          },
        },
      ]),
      // The ball's two handlers. `any ⟨Ball⟩` in a hat's subject is the
      // template, so these reach every ball there will be.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 20,
        y: 780,
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: local(BALL)}},
          },
        },
        next: {
          block: {
            type: 'world_print',
            inputs: {
              VALUE: {
                block: {
                  type: 'world_count_of_kind',
                  fields: {TYPE: local(BRICK)},
                  inputs: {
                    LIST: {
                      block: {
                        type: 'world_get_Collection_CollectedProperty',
                        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        type: 'world_on_Space_LeftMapEvent',
        x: 520,
        y: 780,
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: local(BALL)}},
          },
        },
        next: {block: {type: 'world_log', fields: {TEXT: 'Ball lost!'}}},
      },
    ],
  },
});

export const BREAKOUT_SINGLE_SPEC: ProjectSpec = {
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
    // No actors, and no map. `actors/` and `maps/` stay in the tree because a
    // folder is what gives a file its meaning here, and the first thing a
    // learner does with this project is outgrow it.
    ...BREAKOUT_SUPPORT_FILES,
  },
  open: ['main'],
};
