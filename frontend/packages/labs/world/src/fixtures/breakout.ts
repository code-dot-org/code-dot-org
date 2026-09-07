// Breakout: a paddle, a ball, and a wall of bricks to clear.
//
// Here to be PLAYED and to be read. Every mechanic in it is a stock rule doing
// the thing it was built for, and between them they are most of what this lab
// can currently say about a game:
//
//   the paddle    Arrow Keys, and Solid, which is also what stops it: the room
//                 is built out of solid walls, and a moving solid body cannot
//                 end up inside one.
//   the ball      the velocity it is served with, `bounciness` of 1, and Solid
//                 Bodies, which is the whole of the bouncing: the walls and the
//                 paddle and the bricks are all solid, and a perfectly bouncy
//                 body that hits one comes off it.
//   the bricks    "Can Be Collected", so hitting one takes it out of the world
//                 and puts it in the ball's `collected`, which is the score.
//   losing        `when ⟨Ball⟩ leaves the map`. The map is walled on three
//                 sides and open at the bottom, so the only way out is past the
//                 paddle. The ball goes back to the middle, at rest, and waits
//                 to be served again.
//   the serve     `when ⟨space⟩ is pressed`, said in the world rather than in
//                 an actor, and only for a ball that is standing still.
//
// The paddle is a ground tile scaled to 2 x 0.5 — 64 by 16 — which is also the
// smallest honest test of intrinsic size: before the project measured its own
// images, that paddle collided as a 32 by 32 square and "Stays Across" held it
// half off the screen. It stays a ground tile now that the room is stone: a
// plank of turf is a platform, which is what a paddle is, and the two things
// that were both floor tiles are no longer the same picture.
//
// NOT "Stays in the Map", though a paddle is the example that rule was written
// for. A room made of solid walls already bounds everything in it, and it binds
// FIRST: Solid Bodies stops the paddle at the wall's inner face, which is a
// wall's width inside the map's edge, so the clamp never has anything to do.
// The walls have to stay — they are what the ball bounces off, and nothing
// bounces off a boundary — so the redundant one is the clamp.
//
// The rule is for a room without walls. Both were tried here and the game plays
// the same either way, which is the argument: a fixture carrying a rule that
// never fires teaches that you need it.
//
// What it is NOT is a finished game. There are no lives and no win message:
// the console counts bricks, and a ball that goes past the paddle comes back.
// Each of those is a thing the lab cannot say yet or can only say awkwardly,
// which is the other reason this scenario is worth keeping — it is the list.
// The serve was on that list until the ball was left at rest, which is the
// smaller lesson: some of what is missing is missing because nobody wrote it.

import {stack, starterSprites, useTrait, type ProjectSpec} from '../constants';
import {} from '../rules/stock';
import {referenceToStock} from '../rules/ruleReference';
import {TILE_SIZE} from '../runtime/viewport';

/** The middle of tile `index` — where a placed actor's position points. */
export const at = (index: number) => index * TILE_SIZE + TILE_SIZE / 2;

const place = (type: string, id: string, column: number, row: number) => ({
  type,
  id,
  properties: {positional: {position: {x: at(column), y: at(row)}}},
});

// The board, on the same 10 x 10 grid the starter uses:
//
//   # # # # # # # # # #   0   #  wall
//   # B B B B B B B B #   1   B  brick
//   # B B B B B B B B #   2
//   # . . . . . . . . #   3
//   # . . . . . . . . #   4
//   # . . . . o . . . #   5   o  the ball, waiting to be served
//   # . . . . . . . . #   6
//   # . . . . . . . . #   7
//   # . . = = . . . . #   8   =  the paddle (one actor, 64 wide)
//   . . . . . . . . . .   9   the open bottom: past here, the ball is gone
//
// Two rows of bricks rather than five, so the whole board is on screen at the
// starter's tile size and a game is over in under a minute.
export const BRICK_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];
export const BRICK_ROWS = [1, 2];
export const SIDE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8];
export const ALL_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const BREAKOUT_MAP = JSON.stringify(
  {
    type: 'map',
    size: {width: 10, height: 10},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      // The room: a roof and two sides, and nothing along the bottom.
      ...ALL_COLUMNS.map(column =>
        place('actors/wall', `Roof${column}`, column, 0),
      ),
      ...SIDE_ROWS.map(row => place('actors/wall', `Left${row}`, 0, row)),
      ...SIDE_ROWS.map(row => place('actors/wall', `Right${row}`, 9, row)),
      ...BRICK_ROWS.flatMap(row =>
        BRICK_COLUMNS.map(column =>
          place('actors/brick', `Brick${row}_${column}`, column, row),
        ),
      ),
      place('actors/paddle', 'Paddle', 4, 8),
      place('actors/ball', 'Ball', 5, 5),
    ],
  },
  null,
  2,
);

/** `set ⟨property⟩ of ⟨this actor⟩ to ⟨number⟩`, for the ball's two dials. */
export const setNumber = (type: string, value: number) => ({
  type,
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: {block: {type: 'math_number', fields: {NUM: value}}},
  },
});

/**
 * THE SERVE, and what a lost ball costs.
 *
 * The ball used to be handed a velocity as it was built, and a fixture nobody
 * is playing plays itself: the room is open at the bottom, so within a few
 * seconds of loading the ball is gone and the board is a still life. Both
 * tellings of the game now start it at rest and hand the first move to the
 * player, which is also the serve every game of this shape has.
 *
 * SAID IN THE WORLD, not in the ball: `when ⟨space⟩ is pressed` with no
 * subject is the world hearing the key, which it does whether or not anybody
 * elected `Takes Keyboard Input` (rules/input). The ball needs no opinion
 * about the keyboard to be served.
 *
 * @param ball how this telling names the Ball — a path in one, a local id in
 *   the other.
 * @param where the corner of the canvas it sits at, since the two tellings have
 *   different things on theirs. Under the world block by default, because a
 *   reader opening `main.world` should not have to scroll sideways to find the
 *   only other thing in it.
 */
export const serveHandler = (ball: string, where = {x: 20, y: 240}) => ({
  type: 'world_on_Input_IsPressedEvent',
  fields: {FILTER0: 'space'},
  ...where,
  next: {
    block: {
      type: 'controls_if',
      inputs: {
        // Only a ball that is STANDING STILL is served, so holding the key
        // during a rally does not re-aim the ball. Nothing here slows down —
        // there is no gravity and no friction, and a bounce flips a component
        // rather than emptying it — so a vertical speed of zero means the ball
        // has not been served yet.
        IF0: {
          block: {
            type: 'logic_compare',
            fields: {OP: 'EQ'},
            inputs: {
              A: {
                block: {
                  type: 'world_vector_component',
                  fields: {COMPONENT: 'y'},
                  inputs: {
                    VEC: {
                      block: {
                        type: 'world_get_Physics_VelocityProperty',
                        inputs: {ACTOR: kind(ball)},
                      },
                    },
                  },
                },
              },
              B: {block: {type: 'math_number', fields: {NUM: 0}}},
            },
          },
        },
        DO0: {block: velocity(kind(ball), 2.5, -2.5)},
      },
    },
  },
});

/** `the ⟨Ball⟩` — the one of its kind, however this telling names the kind. */
const kind = (actor: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actor}},
});

/** `set velocity of ⟨who⟩ to ⟨x, y⟩`. */
export const velocity = (who: object, x: number, y: number) => ({
  type: 'world_set_Physics_VelocityProperty',
  inputs: {
    ACTOR: who,
    VALUE: {block: {type: 'world_vector', fields: {VECTOR: {x, y}}}},
  },
});

/**
 * Losing: say so, and put the ball back where it started, at rest.
 *
 * A game with one ball and no way to get it back is over the first time you
 * miss, which for a scenario meant a board that could only be looked at. This
 * is not lives — nothing counts them — it is the ball returning to the serve.
 */
export const lostBall = () =>
  stack([
    {
      type: 'world_print',
      inputs: {VALUE: {shadow: {type: 'text', fields: {TEXT: 'Ball lost!'}}}},
    },
    {
      type: 'world_set_position',
      inputs: {
        ACTOR: {block: {type: 'world_this_actor'}},
        X: {block: {type: 'math_number', fields: {NUM: at(5)}}},
        Y: {block: {type: 'math_number', fields: {NUM: at(5)}}},
      },
    },
    velocity({block: {type: 'world_this_actor'}}, 0, 0),
  ]);

// The room. Solid and nothing else: it does not move, it is not collectible,
// and it has no opinion about what hits it.
//
// Perfectly bouncy, because the SURFACE decides what happens to the speed —
// not the thing that hits it. A ball with a bounciness of 1 hitting a wall with
// the default 0 stops dead against it, which is what this scenario did until
// the wall was given the dial.
const WALL_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Wall'},
        next: {
          block: stack([
            useTrait('Solid Bodies#SolidTrait'),
            setNumber('world_set_SolidBodies_BouncinessProperty', 1),
            {type: 'world_set_sprite', fields: {SPRITE: 'wall.png'}},
          ]),
        },
      },
    ],
  },
});

// Solid, so the ball comes off it, AND collectible, so hitting it takes it out
// of the world. Both, on the same contact: Solid Bodies pushes apart in
// `settle` and Collection removes in `react`, so the bounce is worked out
// before the brick goes.
const BRICK_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Brick'},
        next: {
          block: stack([
            useTrait('Solid Bodies#SolidTrait'),
            useTrait('Collection#CanBeCollectedTrait'),
            setNumber('world_set_SolidBodies_BouncinessProperty', 1),
            {type: 'world_set_sprite', fields: {SPRITE: 'box.png'}},
          ]),
        },
      },
    ],
  },
});

// The paddle: the only one of the four that a learner drives.
const PADDLE_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Paddle'},
        next: {
          block: stack([
            {
              type: 'world_use_trait',
              fields: {TRAIT: 'Arrow Keys#MovesAcrossTrait'},
            },
            {
              type: 'world_use_trait',
              fields: {TRAIT: 'Input#TakesKeyboardInputTrait'},
            },
            // Solid, so the ball comes off it rather than through it.
            {
              type: 'world_use_trait',
              fields: {TRAIT: 'Solid Bodies#SolidTrait'},
            },
            {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
            // The surface's dial again: without it the ball dies on the paddle.
            setNumber('world_set_SolidBodies_BouncinessProperty', 1),
            // A tile, stretched: 64 wide and 16 tall. What it collides as, too
            // — `intrinsic size` times scale is one notion of how big an actor
            // is, shared by Collisions and "Stays in the Map".
            {
              type: 'world_set_Space_ScaleProperty',
              inputs: {
                ACTOR: {block: {type: 'world_this_actor'}},
                X: {block: {type: 'math_number', fields: {NUM: 2}}},
                Y: {block: {type: 'math_number', fields: {NUM: 0.5}}},
              },
            },
          ]),
        },
      },
    ],
  },
});

const BALL_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Ball'},
        next: {
          block: stack([
            {type: 'world_use_trait', fields: {TRAIT: 'Physics#CanMoveTrait'}},
            // NOT Solid. Solid is what a body bounces OFF; this is the body.
            // It can still touch things — "Collects" needs contacts and brings
            // "Can Collide" with it.
            // What takes the bricks out of the world when it hits them.
            {
              type: 'world_use_trait',
              fields: {TRAIT: 'Collection#CollectsTrait'},
            },
            {type: 'world_set_sprite', fields: {SPRITE: 'ball.png'}},
            // At rest until it is served. `serveHandler`, in the world, says
            // why the first move is the player's.
          ]),
        },
      },
      // The score, such as it is: how many bricks this ball has taken.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 20,
        y: 320,
        next: {
          block: {
            type: 'world_print',
            inputs: {
              VALUE: {
                block: {
                  type: 'world_count_of_kind',
                  fields: {TYPE: 'actors/brick'},
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
      // Losing. The room is open at the bottom and nowhere else.
      {
        type: 'world_on_Space_LeftMapEvent',
        x: 20,
        y: 460,
        next: {block: lostBall()},
      },
    ],
  },
});

const BREAKOUT_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Breakout'},
        next: {
          block: stack([
            // By NAME, which is what a parsed `.rule` is referred to as from
            // then on, wherever its file sits (useRuleOptions). A module path
            // is what an unparseable one falls back to, and a name that names
            // nothing quietly picks the first rule in the list instead.
            {type: 'world_load_map', fields: {MAP: 'maps/breakout'}},
          ]),
        },
      },
      serveHandler('actors/ball'),
    ],
  },
});

/**
 * The rules breakout names, the ones those pull in, and the pictures it draws
 * with. Shared with the single-world telling of the same game, which differs in
 * how it SAYS the game and not in what the game is made of.
 */
export const BREAKOUT_SUPPORT_FILES: ProjectSpec['files'] = {
  // The rules it names, and the ones those pull in. A project holds its own
  // copies (the starter's header explains why), so a learner can open one and
  // read what a bounce or a boundary actually is.
  inputRuleFile: {
    name: 'input.rule',
    language: 'rule',
    contents: referenceToStock('input'),
    folderId: 'rules',
  },
  arrowsRuleFile: {
    name: 'arrows.rule',
    language: 'rule',
    contents: referenceToStock('arrows'),
    folderId: 'rules',
  },
  motionRuleFile: {
    name: 'motion.rule',
    language: 'rule',
    contents: referenceToStock('motion'),
    folderId: 'rules',
  },
  collisionsRuleFile: {
    name: 'collisions.rule',
    language: 'rule',
    contents: referenceToStock('collisions'),
    folderId: 'rules',
  },
  solidRuleFile: {
    name: 'solid.rule',
    language: 'rule',
    contents: referenceToStock('solid'),
    folderId: 'rules',
  },
  collectRuleFile: {
    name: 'collect.rule',
    language: 'rule',
    contents: referenceToStock('collect'),
    folderId: 'rules',
  },
  ...starterSprites(['ground', 'wall', 'ball', 'box']),
};

export const BREAKOUT_SPEC: ProjectSpec = {
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
      contents: BREAKOUT_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    paddle: {
      name: 'paddle.actor',
      language: 'actor',
      contents: PADDLE_ACTOR,
      folderId: 'actors',
    },
    ball: {
      name: 'ball.actor',
      language: 'actor',
      contents: BALL_ACTOR,
      folderId: 'actors',
    },
    brick: {
      name: 'brick.actor',
      language: 'actor',
      contents: BRICK_ACTOR,
      folderId: 'actors',
    },
    wall: {
      name: 'wall.actor',
      language: 'actor',
      contents: WALL_ACTOR,
      folderId: 'actors',
    },
    breakoutMap: {
      name: 'breakout.map',
      language: 'map',
      contents: BREAKOUT_MAP,
      folderId: 'maps',
    },
    ...BREAKOUT_SUPPORT_FILES,
  },
  open: ['main'],
};
