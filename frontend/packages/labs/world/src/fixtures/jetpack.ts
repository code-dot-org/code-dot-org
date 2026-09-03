// Jetpack: a room you fly around, and a tank that empties while you do it.
//
// Here for two things none of the other scenarios have, and both of them are
// new this week.
//
// A ROOM RATHER THAN A CORRIDOR. Every level in the library is ten tiles
// square (one screen) or wide and short with a camera chasing along it. This
// one is 26 by 16 and says so — `set size of view` — so the whole level is on
// screen at once and there is no camera in the project at all. That is the
// other kind of level: a room you can see the shape of, where the puzzle is
// getting to a place rather than surviving what is coming.
//
// A RESOURCE. Jumping asks "have I a jump left" and the answer resets the
// moment you land. Fuel does not come back on its own — it comes back off the
// floor, which is what makes the cans somewhere to go rather than points.
//
// THE CONTROL IS TWO MOMENTS, which is worth reading because the obvious
// telling is wrong. Thrust happens every frame, so the block looks like it
// should be called every frame; but the keyboard only offers `presses` and
// `releases`, and the rule already has a step running every frame. So the
// press switches the jetpack ON and the release switches it OFF, and nothing
// in this project counts a frame.
//
// The press ALSO jumps, on the same handler and with no question round it.
// `start … flying` does nothing at all with an empty tank, so a press that
// cannot fly is a press that jumps — the weak hop you are left with when the
// last can is gone, without a single block spent asking.
//
// THE GAUGE IS AN ACTOR, because everything is. It is the stock Progress Bar's
// drawing with a step of its own, and the step reaches the pilot BY KIND —
// `first actor in ⟨any Pilot⟩` — which is the one cross-actor line in the
// project. It sits over the ceiling rather than in a fixed layer: the whole
// room is on screen and the view never moves, so a world position at the top
// of the room is a heads-up display and needs nothing to make it one.
//
// THE LADDER IS THE OTHER WAY UP, and it is here to be the un-fun one. It
// reaches the lowest ledge and nothing above it, so the jetpack is still the
// only way to most of the room — what a ladder buys is a way back that costs
// no fuel, which is the choice the level is about. The rungs are `Can Be
// Climbed` AND `Acts as Ground`, so the top of the ladder holds you up and the
// rest of it does not.
//
// WHAT IT IS NOT: there is no way to win and nothing to avoid (JETPACK.md,
// phases 2 and 3). It is the smallest thing that plays.

import {progressBarDrawing} from '../actors/stock/progressBar';
import {stack, starterSprites, useTrait, type ProjectSpec} from '../constants';
import {
  arrowsRule,
  climbRule,
  collectRule,
  collisionsRule,
  gravityRule,
  inputRule,
  jetpackRule,
  jumpRule,
  motionRule,
  progressRule,
  solidRule,
} from '../rules/stock';
import {TILE_SIZE} from '../runtime/viewport';

/** The middle of tile `index`, the same grid every other scenario uses. */
const at = (index: number) => index * TILE_SIZE + TILE_SIZE / 2;

/**
 * The room, in tiles — and the view, which is the same rectangle.
 *
 * 26 by 16 is a jetpack room: wide enough that crossing it is a journey and
 * short enough that the ledges above you are all in sight. Both numbers reach
 * the world, one as the map and one as the window onto it, and they are equal
 * on purpose — the moment they differ this level needs a camera.
 */
export const MAP_COLUMNS = 26;
export const MAP_ROWS = 16;

const place = (type: string, id: string, column: number, row: number) => ({
  type,
  id,
  properties: {positional: {position: {x: at(column), y: at(row)}}},
});

/** A run of tiles along one row, as `[startColumn, endColumn]` inclusive. */
type Run = readonly [number, number, number];

/**
 * The ledges, as `[row, from, to]`.
 *
 * Laid out so that no two are within a jump of each other: the default jump
 * clears about four tiles and every gap here is more, so the only way up is
 * the jetpack. A level a jump could solve would not be a level about flying.
 */
const LEDGES: readonly Run[] = [
  [11, 3, 7],
  [8, 11, 16],
  [12, 18, 22],
  [5, 19, 23],
  [4, 2, 6],
];

/** The border: floor, ceiling and both walls, which is the room. */
const border = () => {
  const tiles: ReturnType<typeof place>[] = [];
  for (let column = 0; column < MAP_COLUMNS; column++) {
    tiles.push(place('actors/wall', `Ceiling${column}`, column, 0));
    tiles.push(place('actors/wall', `Floor${column}`, column, MAP_ROWS - 1));
  }
  for (let row = 1; row < MAP_ROWS - 1; row++) {
    tiles.push(place('actors/wall', `Left${row}`, 0, row));
    tiles.push(place('actors/wall', `Right${row}`, MAP_COLUMNS - 1, row));
  }
  return tiles;
};

/**
 * The cans, as `[kind, column, row]` — each one standing on a ledge.
 *
 * A big one on the two hardest ledges to reach and a small one on the two
 * easier, which is the whole of the level's difficulty curve: the reward for
 * the longer flight is the one that pays for the next longer flight.
 */
const CANS: ReadonlyArray<readonly [string, number, number]> = [
  ['actors/fuelSmall', 5, 10],
  ['actors/fuelCan', 13, 7],
  ['actors/fuelSmall', 20, 11],
  ['actors/fuelCan', 21, 4],
  ['actors/fuelCan', 4, 3],
];

/**
 * Everything the level places, in the order the map lists it.
 *
 * Exported for the same reason `FLAPPY_ACTORS` is: a board written twice is
 * two boards unless both readings come from one list.
 */
/**
 * The ladder, as the rows it occupies in column 2.
 *
 * From the floor to the lowest ledge, and no further: a ladder to everywhere
 * would be a level with no reason to fly. What it buys is a way up and back
 * that costs no fuel, which is the choice the level is about.
 *
 * It reaches the row the Pilot STANDS in, so stepping on to it is not a thing
 * a player has to line up — and the bottom of the climb is the solid floor,
 * which stops it (`rules/climb`).
 */
const LADDER_COLUMN = 2;
const LADDER_ROWS = [10, 11, 12, 13, 14];

export const JETPACK_ACTORS = [
  ...border(),
  ...LADDER_ROWS.map(row =>
    place('actors/ladder', `Rung${row}`, LADDER_COLUMN, row),
  ),
  ...LEDGES.flatMap(([row, from, to]) => {
    const tiles: ReturnType<typeof place>[] = [];
    for (let column = from; column <= to; column++) {
      tiles.push(place('actors/ledge', `Ledge${row}_${column}`, column, row));
    }
    return tiles;
  }),
  ...CANS.map(([kind, column, row], index) =>
    place(kind, `Can${index}`, column, row),
  ),
  // The gauge, in the top-left corner of the room. See the header: the view
  // never moves, so a world position up here is a heads-up display. Inside
  // the ceiling rather than on it — a bar drawn over the brickwork reads as
  // rubble, and the corner is the one part of the room nothing else uses.
  place('actors/fuelBar', 'Gauge', 4, 1),
  place('actors/pilot', 'Pilot', 2, 14),
];

const JETPACK_MAP = JSON.stringify(
  {
    type: 'map',
    size: {width: MAP_COLUMNS, height: MAP_ROWS},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: JETPACK_ACTORS,
  },
  null,
  2,
);

/** `⟨this actor⟩`. */
const me = () => ({block: {type: 'world_this_actor'}});

const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});

/**
 * What a full can is worth, and what a small one is.
 *
 * The tank holds a hundred, so these are "all of it" and "half of it" — the
 * two amounts JETPACK.md asks for, said as numbers because the rule's clamp
 * makes the first one safe to hand a full tank.
 */
const FULL_CAN = 100;
const SMALL_CAN = 50;

/**
 * `when ⟨this actor⟩ collects ⟨kind⟩ → give ⟨this actor⟩ ⟨amount⟩ fuel`.
 *
 * On the PILOT rather than in the world, because it is about the pilot: an
 * `.actor` file's handlers are what that kind does to itself, and taking a can
 * is not something the level arranges. A can does not know it is fuel — being
 * collectable is the whole of its side of this, exactly as a Coin knows
 * nothing about points (`actors/stock/coin`).
 */
const refuel = (canKind: string, amount: number, y: number) => ({
  type: 'world_on_Collection_CollectsEvent',
  x: 20,
  y,
  fields: {FILTER0: canKind},
  inputs: {ACTOR: me()},
  next: {
    block: {
      type: 'world_do_Jetpack_GiveFuelAction',
      inputs: {WHO: me(), AMOUNT: number(amount)},
    },
  },
});

const PILOT_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Pilot'},
        next: {
          block: stack([
            // Gravity brings "Can Move" and "Can Collide", so this list is
            // shorter than it looks: everything that falls, walks, lands,
            // takes a can and flies is in these five rows.
            useTrait('Gravity#AffectedByGravityTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            useTrait('Arrow Keys#MovesAcrossTrait'),
            useTrait('Jumping#JumpsTrait'),
            useTrait('Jetpack#FliesWithAJetpackTrait'),
            // Up and down climb, and only on a ladder — the control scheme is
            // a trait, so this is the whole of it (`rules/climb`).
            useTrait('Climbing#ClimbsWithArrowKeysTrait'),
            useTrait('Collection#CollectsTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'player.png'}},
            // Enough to get ON to a single tile and no more, which is what
            // "a weak hop" has to mean if it is to be any use: the default of
            // 5 clears four tiles and would make half the ledges reachable
            // without ever touching a can, and 2.4 clears 32 pixels of AIR —
            // which leaves the Pilot's feet exactly level with the top of a
            // one-tile step and catching on it. Rise is v²/2g, so the margin
            // costs almost nothing: 2.6 buys 37 pixels for a 32-pixel step.
            {
              type: 'world_set_Jumping_JumpStrengthProperty',
              inputs: {ACTOR: me(), VALUE: number(2.6)},
            },
            // Half a tank to start with. A full one crosses the whole room,
            // which would leave the first two cans as scenery.
            {
              type: 'world_set_Jetpack_FuelProperty',
              inputs: {ACTOR: me(), VALUE: number(50)},
            },
          ]),
        },
      },
      // The press does BOTH, in this order and with no question round it —
      // see the header. With fuel, the hop is lost inside the thrust; with an
      // empty tank, `start flying` does nothing and the hop is all there is.
      {
        type: 'world_on_Input_PressesEvent',
        x: 20,
        y: 260,
        fields: {FILTER0: 'space'},
        next: {
          block: stack([
            {type: 'world_do_Jumping_MakeJumpAction', inputs: {VALUE: me()}},
            {
              type: 'world_do_Jetpack_StartFlyingAction',
              inputs: {VALUE: me()},
            },
          ]),
        },
      },
      {
        type: 'world_on_Input_ReleasesEvent',
        x: 20,
        y: 400,
        fields: {FILTER0: 'space'},
        next: {
          block: {
            type: 'world_do_Jetpack_StopFlyingAction',
            inputs: {VALUE: me()},
          },
        },
      },
      // The tank emptying is a moment the player has to be told about, and
      // this is the only thing in the project that says so. Without it the
      // jetpack simply stops and the game reads as having broken.
      {
        type: 'world_on_Jetpack_RunsOutOfFuelEvent',
        x: 20,
        y: 520,
        inputs: {ACTOR: me()},
        next: {
          block: {type: 'world_log', fields: {TEXT: 'Out of fuel!'}},
        },
      },
      refuel('actors/fuelCan', FULL_CAN, 640),
      refuel('actors/fuelSmall', SMALL_CAN, 760),
    ],
  },
});

/** A tile that holds you up and cannot be walked through. */
const tileActor = (name: string, sprite: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: name},
          next: {
            block: stack([
              // The pair that makes an ordinary floor ordinary: "Acts as
              // Ground" alone is a one-way platform you rise through, which
              // is not what a wall is (`rules/gravity`).
              useTrait('Gravity#ActsAsGroundTrait'),
              useTrait('Solid Bodies#SolidTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: sprite}},
            ]),
          },
        },
      ],
    },
  });

/**
 * A rung. It has no speed and no opinion about who climbs it.
 *
 * `Acts as Ground` as well, which is what makes the top of the ladder somewhere
 * to stand: landing asks which way you were going, so the rungs below the one
 * you cross are passed straight through (`rules/gravity`).
 */
const RUNG_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Rung'},
        next: {
          block: stack([
            useTrait('Climbing#CanBeClimbedTrait'),
            useTrait('Gravity#ActsAsGroundTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'ladder.png'}},
          ]),
        },
      },
    ],
  },
});

/** A can: something to pick up, and nothing else. It does not know it is fuel. */
const canActor = (name: string, sprite: string) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: name},
          next: {
            block: stack([
              useTrait('Collection#CanBeCollectedTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: sprite}},
            ]),
          },
        },
      ],
    },
  });

/**
 * The gauge: the stock Progress Bar's picture, and a step that fills it.
 *
 * The DRAWING is imported rather than copied, because a second copy of the
 * track and the fill is somewhere for the two to disagree — and the claim
 * being made is that this IS a progress bar, showing a different number.
 *
 * The step reaches the pilot BY KIND, which is the one cross-actor line in the
 * project. `first actor in ⟨any Pilot⟩` is empty for the frame before the map
 * has placed one; `fuel fraction` of nothing is nothing, and the bar draws
 * empty for that frame rather than failing.
 */
const FUEL_BAR_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Fuel Bar'},
        next: {
          block: stack([
            useTrait('Progress#ShowsProgressTrait'),
            {type: 'world_show_as', fields: {ICON: 'bar'}},
            // The bar is 64 by 8, which is a readable widget in a ten-tile
            // room and a smear in an 832-pixel one. Scaled rather than
            // redrawn, so it stays the stock bar at a size this room can
            // read — three tiles across, half a tile tall.
            {
              type: 'world_set_Space_ScaleProperty',
              inputs: {ACTOR: me(), X: number(1.5), Y: number(2)},
            },
          ]),
        },
      },
      {
        type: 'world_trait_step',
        x: 20,
        y: 200,
        fields: {PHASE: 'react', NAME: 'follow the tank'},
        inputs: {
          DO: {
            block: {
              type: 'world_set_Progress_FractionProperty',
              inputs: {
                ACTOR: me(),
                VALUE: {
                  block: {
                    type: 'world_query_Jetpack_FuelFractionQuery',
                    inputs: {
                      ACTOR: {
                        block: {
                          type: 'world_first_actor',
                          inputs: {SOURCE: kind('actors/pilot')},
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
      {
        type: 'world_define_drawing',
        x: 20,
        y: 360,
        fields: {
          WIDTH: progressBarDrawing().width,
          HEIGHT: progressBarDrawing().height,
        },
        inputs: {DO: {block: stack(progressBarDrawing().commands)}},
      },
    ],
  },
});

const JETPACK_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Jetpack'},
        next: {
          block: stack([
            // The whole room on screen at once, which is what this scenario is
            // for. Said before the map loads, so the view is the shape it will
            // keep from the first frame — a resize afterwards would be a
            // visible jump on a world that has already drawn.
            {
              type: 'world_set_view_size',
              inputs: {X: number(MAP_COLUMNS), Y: number(MAP_ROWS)},
            },
            {type: 'world_load_map', fields: {MAP: 'maps/jetpack'}},
          ]),
        },
      },
    ],
  },
});

export const JETPACK_SPEC: ProjectSpec = {
  folders: ['worlds', 'actors', 'rules', 'maps', 'sprites'],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: JETPACK_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    pilotActor: {
      name: 'pilot.actor',
      language: 'actor',
      contents: PILOT_ACTOR,
      folderId: 'actors',
    },
    wallActor: {
      name: 'wall.actor',
      language: 'actor',
      contents: tileActor('Wall', 'wall.png'),
      folderId: 'actors',
    },
    ledgeActor: {
      name: 'ledge.actor',
      language: 'actor',
      contents: tileActor('Ledge', 'ground.png'),
      folderId: 'actors',
    },
    ladderActor: {
      name: 'ladder.actor',
      language: 'actor',
      contents: RUNG_ACTOR,
      folderId: 'actors',
    },
    fuelCanActor: {
      name: 'fuelCan.actor',
      language: 'actor',
      contents: canActor('Fuel Can', 'fuelCan.png'),
      folderId: 'actors',
    },
    fuelSmallActor: {
      name: 'fuelSmall.actor',
      language: 'actor',
      contents: canActor('Small Can', 'fuelCanSmall.png'),
      folderId: 'actors',
    },
    fuelBarActor: {
      name: 'fuelBar.actor',
      language: 'actor',
      contents: FUEL_BAR_ACTOR,
      folderId: 'actors',
    },
    jetpackMap: {
      name: 'jetpack.map',
      language: 'map',
      contents: JETPACK_MAP,
      folderId: 'maps',
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
    solidRuleFile: {
      name: 'solid.rule',
      language: 'rule',
      contents: solidRule,
      folderId: 'rules',
    },
    gravityRuleFile: {
      name: 'gravity.rule',
      language: 'rule',
      contents: gravityRule,
      folderId: 'rules',
    },
    jumpRuleFile: {
      name: 'jump.rule',
      language: 'rule',
      contents: jumpRule,
      folderId: 'rules',
    },
    jetpackRuleFile: {
      name: 'jetpack.rule',
      language: 'rule',
      contents: jetpackRule,
      folderId: 'rules',
    },
    inputRuleFile: {
      name: 'input.rule',
      language: 'rule',
      contents: inputRule,
      folderId: 'rules',
    },
    arrowsRuleFile: {
      name: 'arrows.rule',
      language: 'rule',
      contents: arrowsRule,
      folderId: 'rules',
    },
    climbRuleFile: {
      name: 'climb.rule',
      language: 'rule',
      contents: climbRule,
      folderId: 'rules',
    },
    collectRuleFile: {
      name: 'collect.rule',
      language: 'rule',
      contents: collectRule,
      folderId: 'rules',
    },
    progressRuleFile: {
      name: 'progress.rule',
      language: 'rule',
      contents: progressRule,
      folderId: 'rules',
    },
    ...starterSprites([
      'player',
      'ground',
      'wall',
      'ladder',
      'fuelCan',
      'fuelCanSmall',
    ]),
  },
  open: ['main'],
};
