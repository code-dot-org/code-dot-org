// Sokoban — the game that proves "Moves on a Grid".
//
// Every other scenario here is continuous: something has a speed and the world
// moves it by that speed. This one has no speeds at all. A thing is on a
// square or crossing to the next one, the board is countable at every instant,
// and the puzzle only exists because those two facts are true.
//
// It is three actors and no logic:
//
//   Wall   Fills a Tile                                      — you cannot enter
//   Crate  Fills a Tile + Steps on the Grid + Can Be Pushed   — you push it
//   Player Steps on the Grid + Takes Keyboard Input           — you are it
//
// THE PUSHING IS NOT WRITTEN HERE. Look for it and there is nothing: the four
// key handlers say `step ⟨Player⟩ up` and stop. Deciding whether a step is
// legal means looking at the square being entered, and if a crate is there, at
// the square beyond it — so the rule that owns stepping is the only thing that
// can answer, and it does. A project that had to write that itself would be
// writing the rule's refusal logic in blocks, and the classic bug it would
// ship with is a crate pushed into another crate.
//
// WHAT IS WRITTEN HERE is the win, because winning is the one thing a rule
// cannot know: "every crate on a target" is this game's idea and no mechanic's.
// It reads as a sentence — the crates that are NOT on a target, counted — and
// it is the best short demonstration in the catalogue of what the actor-list
// blocks are for (specs/ACTOR_LISTS.md).
//
// THE BOARD IS THE MAP FILE, which is the other half of the argument for a
// grid rule: the map editor already draws a grid and snaps to it, so a level
// designed by dragging is already aligned with the only movement this game
// has. Nothing had to be taught to agree.

import {
  buildProject,
  place,
  stack,
  starterSprites,
  tileCenter,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {TILE_SIZE} from '../engine/core/viewport';
import {referenceToStock} from '../rules/ruleReference';

import {me, number} from './meteors';

/** The board, as a picture. `#` wall, `$` crate, `*` target, `@` player. */
const BOARD = [
  '##########',
  '#........#',
  '#..$..*..#',
  '#........#',
  '#...@....#',
  '#........#',
  '#..$..*..#',
  '#........#',
  '#........#',
  '##########',
];

/**
 * The board, as placements.
 *
 * Read off the picture rather than listed, so the level in the file and the
 * level in the comment cannot drift — the commonest way a hand-written fixture
 * goes wrong is a wall moved in one and not the other.
 */
const BOARD_ACTORS = BOARD.flatMap((row, y) =>
  [...row].flatMap((cell, x) => {
    const at = (kind: string, name: string) => [
      place(kind, `${name}${x}_${y}`, tileCenter(x), tileCenter(y)),
    ];
    if (cell === '#') return at('actors/wall', 'Wall');
    if (cell === '$') return at('actors/crate', 'Crate');
    if (cell === '*') return at('actors/target', 'Target');
    if (cell === '@') return at('actors/player', 'Player');
    return [];
  }),
);

/** `⟨thing⟩ is a ⟨kind⟩` — the block that asks what an actor is. */
const isA = (actor: object, type: string) => ({
  block: {type: 'world_is_a', fields: {TYPE: type}, inputs: {ACTOR: actor}},
});

const variable = (id: string, name: string) => ({id, name, type: 'Actor'});
const CRATE_VAR = variable('sokobanCrateVar', 'crate');
const TARGET_VAR = variable('sokobanTargetVar', 'target');

/** A variable FIELD is the id and the name together, not the name. */
const field = (v: {id: string; name: string}) => ({id: v.id, name: v.name});

/** `the ⟨var⟩ in ⟨list⟩ where ⟨test⟩`. */
const filterActors = (
  v: {id: string; name: string},
  source: object,
  where: object,
) => ({
  block: {
    type: 'world_filter_actors',
    fields: {VAR: field(v)},
    inputs: {SOURCE: source, WHERE: where},
  },
});

const allActors = () => ({block: {type: 'world_all_actors'}});
const actorVar = (v: {id: string; name: string}) => ({
  block: {type: 'variables_get_Actor', fields: {VAR: field(v)}},
});

/** How far apart two actors are, in pixels. */
const distanceBetween = (a: object, b: object) => ({
  block: {
    type: 'world_vector_length',
    inputs: {
      VECTOR: {
        block: {
          type: 'world_vector_math',
          fields: {OP: 'SUBTRACT'},
          inputs: {A: a, B: b},
        },
      },
    },
  },
});

const positionOf = (actor: object) => ({
  block: {
    type: 'world_vector_of',
    inputs: {
      X: {
        block: {
          type: 'world_get_Space_PositionProperty',
          fields: {COMPONENT: 'x'},
          inputs: {ACTOR: actor},
        },
      },
      Y: {
        block: {
          type: 'world_get_Space_PositionProperty',
          fields: {COMPONENT: 'y'},
          inputs: {ACTOR: actor},
        },
      },
    },
  },
});

/** Boolean: is there at least one actor in `list`? */
const anyOf = (list: object) => ({
  block: {type: 'world_any_actors', inputs: {LIST: list}},
});

const not = (test: object) => ({
  block: {type: 'logic_negate', inputs: {BOOL: test}},
});

const both = (a: object, b: object) => ({
  block: {
    type: 'logic_operation',
    fields: {OP: 'AND'},
    inputs: {A: a, B: b},
  },
});

const isLessThan = (a: object, b: object) => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'LT'},
    inputs: {A: a, B: b},
  },
});

/**
 * Whether `crate` is standing on a mark. Half a tile of slack: a crate that
 * finished its step is exactly on center, so this only has to survive
 * floating-point, but the slack also covers a crate still easing in.
 */
const isOnAMark = (crate: object) =>
  anyOf(
    filterActors(
      TARGET_VAR,
      allActors(),
      both(
        isA(actorVar(TARGET_VAR), 'actors/target'),
        isLessThan(
          distanceBetween(positionOf(crate), positionOf(actorVar(TARGET_VAR))),
          number(TILE_SIZE / 2),
        ),
      ),
    ),
  );

/** The crates that still have somewhere to be. */
const cratesStillOut = () =>
  filterActors(
    CRATE_VAR,
    allActors(),
    both(
      isA(actorVar(CRATE_VAR), 'actors/crate'),
      not(isOnAMark(actorVar(CRATE_VAR))),
    ),
  );

/** The puzzle is over when that list is empty. */
const everyCrateIsHome = () => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'EQ'},
    inputs: {
      A: {
        block: {type: 'world_count_actors', inputs: {ACTOR: cratesStillOut()}},
      },
      B: number(0),
    },
  },
});

const PLAYER_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Player'},
        next: {
          block: stack([
            useTrait('Grid#StepsOnTheGridTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'player.png'}},
          ]),
        },
      },
      // The whole of the controls. Four handlers, one block each, and no
      // mention anywhere of walls or crates — that is the rule's business.
      //
      // THE LAB'S NAME FOR THE KEY, not the browser's. The driver translates
      // `KeyboardEvent.key` before the world ever sees it (`engine/core/keys`),
      // so a handler registered for "ArrowUp" waits for a key that never
      // arrives — which is exactly what this fixture did, and why it rendered
      // a board nobody could move.
      ...(
        [
          ['up arrow', 'StepUpAction', 320],
          ['down arrow', 'StepDownAction', 420],
          ['left arrow', 'StepLeftAction', 520],
          ['right arrow', 'StepRightAction', 620],
        ] as const
      ).map(([key, action, y]) => ({
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: key},
        x: 20,
        y,
        inputs: {ACTOR: me()},
        next: {
          block: {type: `world_do_Grid_${action}`, inputs: {ACTOR: me()}},
        },
      })),
    ],
  },
});

/** A wall: the smallest actor in the catalogue that still does something. */
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
            useTrait('Grid#FillsATileTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'wall.png'}},
          ]),
        },
      },
    ],
  },
});

/**
 * A crate: all three traits, and the reason there are three.
 *
 * It blocks you (Fills a Tile), it moves (Steps on the Grid), and it gives way
 * (Can Be Pushed). Take any one away and it stops being a crate — a thing that
 * blocks but cannot move is a wall, and one that moves but does not block is
 * scenery.
 */
const CRATE_ACTOR = JSON.stringify({
  variables: [CRATE_VAR, TARGET_VAR],
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Crate'},
        next: {
          block: stack([
            useTrait('Grid#StepsOnTheGridTrait'),
            useTrait('Grid#FillsATileTrait'),
            useTrait('Grid#CanBePushedTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'box.png'}},
          ]),
        },
      },
      // The win, checked when a crate lands — the only moment the answer can
      // change. Counting what is WRONG rather than what is right: zero crates
      // off target is the finish line, and it needs no total to compare with.
      {
        type: 'world_on_Grid_FinishesAStepEvent',
        x: 20,
        y: 320,
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'controls_if',
            // A statement input is an `inputs` entry like any other — Blockly's
            // JSON has no separate `statements` key, and a body put under one
            // is dropped without complaint.
            inputs: {
              IF0: everyCrateIsHome(),
              DO0: {block: {type: 'world_log', fields: {TEXT: 'Solved!'}}},
            },
          },
        },
      },
    ],
  },
});

/** A target: a picture and nothing else. It is a place, not a mechanic. */
/**
 * A mark on the floor, DRAWN rather than pictured.
 *
 * It used to `set sprite switch.png`, which is a six-frame STRIP — the stock
 * "switch" is an animation's worth of pictures side by side — so the target
 * rendered as the whole filmstrip laid out across the board. A strip is not a
 * picture; it is an image an animation reads rectangles out of, and drawing
 * one whole is drawing all six frames at once.
 *
 * Nothing in the stock sprites is a goal mark, and a mark is four numbers and
 * a color, so the actor draws its own — which is what `define drawing` is
 * for. A second root, beside the definition rather than chained under it: a
 * drawing takes no previous connection (specs/DRAWING.md).
 */
const TARGET_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Target'},
      },
      {
        type: 'world_define_drawing',
        x: 20,
        y: 140,
        fields: {WIDTH: TILE_SIZE, HEIGHT: TILE_SIZE},
        inputs: {
          DO: {
            block: stack([
              {
                type: 'world_pen_fill',
                inputs: {
                  COLOR: {
                    block: {
                      type: 'colour_picker',
                      fields: {COLOUR: '#d8a032'},
                    },
                  },
                },
              },
              // Centred in the tile and small enough that a crate standing on
              // one plainly covers it, which is how the board says "done".
              {
                type: 'world_draw_rectangle',
                inputs: {
                  X: number(TILE_SIZE / 2 - 6),
                  Y: number(TILE_SIZE / 2 - 6),
                  WIDTH: number(12),
                  HEIGHT: number(12),
                },
              },
            ]),
          },
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
        fields: {NAME: 'Sokoban'},
        next: {
          block: {
            type: 'world_load_map',
            fields: {MAP: 'maps/level1'},
          },
        },
      },
    ],
  },
});

const LEVEL1_MAP = JSON.stringify(
  {
    type: 'map',
    size: {width: BOARD[0].length, height: BOARD.length},
    tile: {width: 32, height: 32},
    actors: BOARD_ACTORS,
  },
  null,
  2,
);

const SPEC: ProjectSpec = {
  folders: ['worlds', 'actors', 'maps', 'rules', 'sprites'],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: MAIN_WORLD,
      folderId: 'worlds',
    },
    player: {
      name: 'player.actor',
      language: 'actor',
      contents: PLAYER_ACTOR,
      folderId: 'actors',
    },
    wall: {
      name: 'wall.actor',
      language: 'actor',
      contents: WALL_ACTOR,
      folderId: 'actors',
    },
    crate: {
      name: 'crate.actor',
      language: 'actor',
      contents: CRATE_ACTOR,
      folderId: 'actors',
    },
    target: {
      name: 'target.actor',
      language: 'actor',
      contents: TARGET_ACTOR,
      folderId: 'actors',
    },
    level1: {
      name: 'level1.map',
      language: 'map',
      contents: LEVEL1_MAP,
      folderId: 'maps',
    },
    'rule-grid': {
      name: 'grid.rule',
      language: 'rule',
      contents: referenceToStock('grid'),
      folderId: 'rules',
    },
    'rule-input': {
      name: 'input.rule',
      language: 'rule',
      contents: referenceToStock('input'),
      folderId: 'rules',
    },
    ...starterSprites(['player', 'wall', 'box']),
  },
  open: ['main'],
};

export const SOKOBAN = buildProject(SPEC);
