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
// THREE OF THE LEDGES ARE NOT ORDINARY FLOOR, which is what makes the room a
// route rather than a set of perches. A belt on the long low ledge carries you
// off it if you stand still; the high one is ice, so the can up there has to
// be approached at a speed you can live with; and the sludge in the middle is
// the slow way across. All three are the SAME actor as a ledge with one trait
// and one picture added — a floor that looks like a belt is a floor.
//
// THE GEMS ARE THE LEVEL AND THE COINS ARE THE SCORE, which is a distinction
// worth drawing because the two are the same rule. Both elect `Can Be
// Collected` and neither knows what it is worth: a coin is a point because a
// handler says so, and a gem is a way out because the Door watches for them.
// Swap the two lines and the game is about coins.
//
// AND THE DOOR NEEDS NO STATE, which surprised me. "Unlocked" looks like a
// flag somebody has to set and clear, and it is not — it is "there are no gems
// left", which the world can be asked at any moment. So the Door watches the
// count and changes its own picture, and the Pilot asks the same question
// again when it walks in. Nothing has to remember anything, and there is no
// way for the picture and the behaviour to disagree.
//
// The counting is safe, and that is the one ordering worth knowing: Collection
// raises `collects` BEFORE it removes what was taken, but an event is queued
// and delivered after the steps — so by the time a handler asks how many are
// left, the one just taken is already gone.
//
// TWO ENEMIES, AND THEY ARE THE SAME ACTOR WITH ONE NUMBER CHANGED. A ball
// that rolls the floor and comes back is `turn by 180`; a rocket that takes
// the next turning is `turn by 90`. Both elect "Turns When It Hits Something"
// and neither has any idea the other exists — which is the whole claim
// `rules/turning` makes, standing in a room rather than in a test.
//
// They DAMAGE rather than kill, and the Pilot has health and a bar, so running
// into one is a setback and not an ending. A level whose only ending is losing
// is a level nobody finishes.
//
// WHAT IT IS NOT: there is no second level for the door to lead to (JETPACK.md,
// phases 4 to 7). It is the smallest thing that plays.

import {progressBarDrawing} from '../actors/stock/progressBar';
import {drawText, fill, setText} from '../actors/stock/workspace';
import {
  stack,
  starterAnimations,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {
  arrowsRule,
  climbRule,
  collectRule,
  collisionsRule,
  goalsRule,
  gravityRule,
  healthRule,
  inputRule,
  jetpackRule,
  jumpRule,
  motionRule,
  progressRule,
  scoreRule,
  solidRule,
  surfacesRule,
  turningRule,
  writingRule,
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
  [4, 2, 6],
];

/**
 * …and the three that act, as `[kind, row, from, to]`.
 *
 * One of each, and where each one is placed is the whole of what it is for.
 * The belt is the long low ledge, so standing still on it is a decision. The
 * sludge is the middle of the room, on the way to everywhere. The ice is the
 * high one with a can on it, which is the hardest place to arrive at a speed
 * you can live with.
 */
const ACTING: ReadonlyArray<readonly [string, number, number, number]> = [
  ['actors/belt', 8, 11, 16],
  ['actors/sludge', 12, 18, 22],
  ['actors/ice', 5, 19, 23],
];

/** A row of one kind of tile, from one column to another. */
const run = (
  kind: string,
  name: string,
  row: number,
  from: number,
  to: number,
) => {
  const tiles: ReturnType<typeof place>[] = [];
  for (let column = from; column <= to; column++) {
    tiles.push(place(kind, `${name}_${column}`, column, row));
  }
  return tiles;
};

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
 * The coins, as `[column, row]` — the score, and nothing else.
 *
 * On the floor and on the two ordinary ledges, which is where walking takes
 * you: a coin is what you get for going the way you were going anyway. The
 * gems are the ones worth a detour.
 */
const COINS: ReadonlyArray<readonly [number, number]> = [
  [6, 14],
  [9, 14],
  [17, 14],
  [4, 10],
  [6, 10],
  [12, 7],
  [22, 11],
  [5, 3],
];

/**
 * The gems, as `[column, row]` — and there are three because the level is
 * three journeys.
 *
 * One on the top-left ledge, one on the ice, one on the sludge: the two floors
 * that make arriving difficult and the one place that costs a full tank to
 * reach.
 */
const GEMS: ReadonlyArray<readonly [number, number]> = [
  [3, 3],
  [22, 4],
  [20, 11],
];

/** Where the way out is: on the floor, at the far end from the ladder. */
const DOOR_AT = [24, 14] as const;

/**
 * The two enemies, as `[kind, column, row]`.
 *
 * The ball rolls the length of the floor, which is the one place the Pilot has
 * to cross on foot when the tank is empty. The rocket flies the open middle of
 * the room, which is where a flight between ledges goes.
 *
 * Which way each SETS OFF is in its own file rather than here, because there
 * is one of each: a level with a dozen would want to aim them one at a time,
 * and the heading is settable for exactly that.
 */
const ENEMIES: ReadonlyArray<readonly [string, number, number]> = [
  ['actors/ball', 12, 14],
  ['actors/rocket', 10, 3],
];

/**
 * Which way each sets off.
 *
 * The ball goes RIGHT, away from where the Pilot starts. Aimed the other way
 * it meets the Pilot in the first second, which is a level lost before it has
 * been understood — and the ball is the one enemy on the floor the Pilot has
 * to cross when the tank is empty.
 */
const BALL_AIM = 0;
const ROCKET_AIM = 0;

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
  ...LEDGES.flatMap(([row, from, to]) =>
    run('actors/ledge', `Ledge${row}`, row, from, to),
  ),
  ...ACTING.flatMap(([kind, row, from, to]) =>
    run(kind, `${kind.split('/')[1]}${row}`, row, from, to),
  ),
  ...CANS.map(([kind, column, row], index) =>
    place(kind, `Can${index}`, column, row),
  ),
  ...COINS.map(([column, row], index) =>
    place('actors/coin', `Coin${index}`, column, row),
  ),
  ...GEMS.map(([column, row], index) =>
    place('actors/gem', `Gem${index}`, column, row),
  ),
  ...ENEMIES.map(([kind, column, row], index) =>
    place(kind, `Enemy${index}`, column, row),
  ),
  place('actors/door', 'Door', DOOR_AT[0], DOOR_AT[1]),
  place('actors/scoreboard', 'Scoreboard', 20, 1),
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

/** `play animation ⟨id⟩` — what a moment looks like. */
const playAnimation = (animation: string) => ({
  type: 'world_play_animation',
  fields: {ANIMATION: animation},
});

/** …and back to the still picture, which is what stopping one looks like. */
const still = () => ({
  type: 'world_set_sprite',
  fields: {SPRITE: 'pilot.png'},
});

/** `when ⟨this actor⟩ ⟨event⟩ → ⟨what it looks like⟩`. */
const looks = (event: string, body: object, y: number) => ({
  type: `world_on_${event}`,
  x: 20,
  y,
  inputs: {ACTOR: me()},
  next: {block: body},
});

/** `how many ⟨kind⟩ are left in the world`. */
const countOfKind = (path: string) => ({
  block: {
    type: 'world_count_of_kind',
    fields: {TYPE: path},
    inputs: {LIST: {block: {type: 'world_all_actors'}}},
  },
});

/** `⟨how many ⟨kind⟩⟩ = 0` — the whole of "the door is unlocked". */
const noneLeft = (path: string) => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'EQ'},
    inputs: {A: countOfKind(path), B: number(0)},
  },
});

/** `if ⟨test⟩ then ⟨body⟩`. */
const onlyIf = (test: object, body: object) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: body}},
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
            // What makes the belt, the ice and the sludge mean anything: one
            // trait, and it meets all three (`rules/surfaces`).
            useTrait('Surfaces#StandsOnSurfacesTrait'),
            // Something to lose. The enemies deal damage and know nothing
            // about who to; this is the other half of that, and neither
            // names the other (`rules/health`).
            useTrait('Health#HasHealthTrait'),
            useTrait('Collection#CollectsTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'pilot.png'}},
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
            // Six hits rather than the default three, and a second of mercy
            // rather than half. The default pair is tuned for a level where
            // an enemy is something you walk into; here the ball rolls the
            // floor the Pilot has to cross, so three hits is a room you lose
            // before you have understood it.
            {
              type: 'world_set_Health_MostHealthProperty',
              inputs: {ACTOR: me(), VALUE: number(6)},
            },
            {
              type: 'world_set_Health_HealthProperty',
              inputs: {ACTOR: me(), VALUE: number(6)},
            },
            {
              type: 'world_set_Health_MercyTimeProperty',
              inputs: {ACTOR: me(), VALUE: number(1)},
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
      // The four moments the two rules raise, and what they are FOR. Neither
      // rule names a picture — a jetpack does not know it has a flame — so
      // this is where the project says what flying and climbing look like,
      // and it is four handlers and nothing else.
      looks('Jetpack_StartsFlyingEvent', playAnimation('pilotFly'), 880),
      looks('Jetpack_StopsFlyingEvent', still(), 1000),
      looks('Climbing_StartsClimbingEvent', playAnimation('pilotClimb'), 1120),
      looks('Climbing_StopsClimbingEvent', still(), 1240),
      // A coin is a point BECAUSE THIS LINE SAYS SO. The coin elects the same
      // trait a gem does and knows nothing about either.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 20,
        y: 1360,
        fields: {FILTER0: 'actors/coin'},
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_do_Scoring_AddToTheScoreAction',
            inputs: {VALUE: number(1)},
          },
        },
      },
      // The other ending, and it is Goals' business rather than Health's:
      // running out of health is a moment, and what a game DOES about one is
      // the project's to say.
      {
        type: 'world_on_Health_RunsOutOfHealthEvent',
        x: 20,
        y: 1600,
        inputs: {ACTOR: me()},
        next: {block: {type: 'world_do_Goals_LoseTheGameAction'}},
      },
      // …and walking into the way out ends the level, if there is nothing
      // left to collect. The same question the Door asks itself: see the
      // header on why neither of them remembers the answer.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        x: 20,
        y: 1480,
        fields: {FILTER0: 'actors/door'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(noneLeft('actors/gem'), {
            type: 'world_do_Goals_WinTheGameAction',
          }),
        },
      },
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
 * A ledge with one thing to say, and a picture that says it.
 *
 * The same three rows as an ordinary ledge plus one trait, which is the claim
 * `rules/surfaces` makes standing still: a floor that looks like a belt is a
 * floor.
 */
const actingTile = (name: string, sprite: string, trait: string) =>
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
              useTrait('Gravity#ActsAsGroundTrait'),
              useTrait('Solid Bodies#SolidTrait'),
              useTrait(trait),
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

/**
 * An enemy: goes its way, turns when it stops getting anywhere, hurts.
 *
 * The ball and the rocket are THIS FUNCTION TWICE with a different picture and
 * a different `turn by`, which is the argument `rules/turning` makes: a
 * hundred and eighty is a thing that comes back, ninety is a thing that takes
 * the corner. Whether it falls is the other difference, and it is one trait.
 */
const enemyActor = (
  name: string,
  sprite: string,
  turnBy: number,
  falls: boolean,
  aim: number,
) =>
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
              useTrait('Turning#TurnsWhenItHitsSomethingTrait'),
              ...(falls ? [useTrait('Gravity#AffectedByGravityTrait')] : []),
              // What makes it an enemy rather than an obstacle. It does not
              // know who it damages, and the Pilot does not know what damaged
              // it (`rules/health`).
              useTrait('Health#DealsDamageTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: sprite}},
              {
                type: 'world_set_Turning_TurnByProperty',
                inputs: {ACTOR: me(), VALUE: number(turnBy)},
              },
              {
                type: 'world_set_Turning_HeadingProperty',
                inputs: {ACTOR: me(), VALUE: number(aim)},
              },
              // Faster than the rule's default of one unit, which is tuned
              // for a ten-tile room. This one is twenty-six across: at a
              // hundred pixels a second a hazard takes eight seconds to
              // cross it, which is a hazard you stroll past.
              {
                type: 'world_set_Turning_TravelSpeedProperty',
                inputs: {ACTOR: me(), VALUE: number(1.8)},
              },
            ]),
          },
        },
      ],
    },
  });

/**
 * The way out: shut until the gems are gone, and then not.
 *
 * IT KEEPS NO STATE, which is the thing worth reading. "Unlocked" looks like a
 * flag somebody has to set and clear; it is really "there are no gems left",
 * which the world can be asked at any moment. So this asks, every frame, and
 * changes its own picture — and the Pilot asks the same question again when it
 * walks in. There is no way for the picture and the behaviour to disagree
 * because there is only one fact.
 *
 * NOT SOLID. A door you cannot walk into is a wall, and touching it is how the
 * level ends.
 */
const DOOR_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Door'},
        next: {
          block: stack([
            useTrait('Collisions#CanCollideTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'door.png'}},
          ]),
        },
      },
      {
        type: 'world_trait_step',
        x: 20,
        y: 180,
        fields: {PHASE: 'react', NAME: 'open when the gems are gone'},
        inputs: {
          DO: {
            block: onlyIf(noneLeft('actors/gem'), {
              type: 'world_set_sprite',
              fields: {SPRITE: 'doorOpen.png'},
              inputs: {ACTOR: me()},
            }),
          },
        },
      },
    ],
  },
});

/**
 * The board: a Label that hears about the score rather than being told.
 *
 * `Watches the Score` is what makes that possible — an `.actor` file has no
 * binding for a WORLD event, so without the trait the only place this could be
 * written is `main.world`, reaching back out for whichever actor is the board.
 */
const SCOREBOARD_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Scoreboard'},
        next: {
          block: stack([
            useTrait('Writing#ShowsTextTrait'),
            useTrait('Scoring#WatchesTheScoreTrait'),
            // …and the ending, for the same reason: an `.actor` file has no
            // binding for a WORLD event, so hearing about one at all means
            // electing the trait that turns it into the actor's own.
            useTrait('Goals#WatchesTheEndingTrait'),
            {type: 'world_show_as', fields: {ICON: 'text'}},
            // Something to read before the first coin: a board that is blank
            // until the score moves reads as a broken board.
            setText('TextProperty', {
              block: {type: 'text', fields: {TEXT: 'COINS 0'}},
            }),
          ]),
        },
      },
      {
        type: 'world_define_drawing',
        x: 20,
        y: 180,
        fields: {WIDTH: 96, HEIGHT: 24},
        inputs: {
          DO: {
            block: stack([
              fill({
                block: {
                  type: 'world_get_Writing_TextColorProperty',
                  inputs: {ACTOR: me()},
                },
              }),
              drawText(48, 12),
            ]),
          },
        },
      },
      {
        type: 'world_on_Scoring_SeesTheScoreChangeEvent',
        x: 20,
        y: 340,
        inputs: {ACTOR: me()},
        next: {
          block: setText('TextProperty', {
            block: {
              type: 'text_join',
              extraState: {itemCount: 2},
              inputs: {
                ADD0: {block: {type: 'text', fields: {TEXT: 'COINS '}}},
                ADD1: {block: {type: 'world_get_Scoring_ScoreProperty'}},
              },
            },
          }),
        },
      },
      {
        type: 'world_on_Goals_SeesTheGameWonEvent',
        x: 20,
        y: 460,
        inputs: {ACTOR: me()},
        next: {
          block: setText('TextProperty', {
            block: {type: 'text', fields: {TEXT: 'YOU MADE IT OUT'}},
          }),
        },
      },
      {
        type: 'world_on_Goals_SeesTheGameLostEvent',
        x: 20,
        y: 580,
        inputs: {ACTOR: me()},
        next: {
          block: setText('TextProperty', {
            block: {type: 'text', fields: {TEXT: 'CAUGHT'}},
          }),
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
  folders: ['worlds', 'actors', 'rules', 'maps', 'sprites', 'animations'],
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
    beltActor: {
      name: 'belt.actor',
      language: 'actor',
      contents: actingTile('Belt', 'conveyor.png', 'Surfaces#ConveysTrait'),
      folderId: 'actors',
    },
    iceActor: {
      name: 'ice.actor',
      language: 'actor',
      contents: actingTile('Ice', 'ice.png', 'Surfaces#SlipperyTrait'),
      folderId: 'actors',
    },
    sludgeActor: {
      name: 'sludge.actor',
      language: 'actor',
      contents: actingTile('Sludge', 'sludge.png', 'Surfaces#SlowsTrait'),
      folderId: 'actors',
    },
    ballActor: {
      name: 'ball.actor',
      language: 'actor',
      contents: enemyActor('Steel Ball', 'pinball.png', 180, true, BALL_AIM),
      folderId: 'actors',
    },
    rocketActor: {
      name: 'rocket.actor',
      language: 'actor',
      contents: enemyActor('Rocket', 'rocket.png', 90, false, ROCKET_AIM),
      folderId: 'actors',
    },
    coinActor: {
      name: 'coin.actor',
      language: 'actor',
      contents: JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_actor',
              x: 20,
              y: 20,
              fields: {NAME: 'Coin'},
              next: {
                block: stack([
                  useTrait('Collection#CanBeCollectedTrait'),
                  playAnimation('coinSpin'),
                ]),
              },
            },
          ],
        },
      }),
      folderId: 'actors',
    },
    gemActor: {
      name: 'gem.actor',
      language: 'actor',
      contents: canActor('Gem', 'gem.png'),
      folderId: 'actors',
    },
    doorActor: {
      name: 'door.actor',
      language: 'actor',
      contents: DOOR_ACTOR,
      folderId: 'actors',
    },
    scoreboardActor: {
      name: 'scoreboard.actor',
      language: 'actor',
      contents: SCOREBOARD_ACTOR,
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
    turningRuleFile: {
      name: 'turning.rule',
      language: 'rule',
      contents: turningRule,
      folderId: 'rules',
    },
    healthRuleFile: {
      name: 'health.rule',
      language: 'rule',
      contents: healthRule,
      folderId: 'rules',
    },
    scoreRuleFile: {
      name: 'score.rule',
      language: 'rule',
      contents: scoreRule,
      folderId: 'rules',
    },
    goalsRuleFile: {
      name: 'goals.rule',
      language: 'rule',
      contents: goalsRule,
      folderId: 'rules',
    },
    writingRuleFile: {
      name: 'writing.rule',
      language: 'rule',
      contents: writingRule,
      folderId: 'rules',
    },
    surfacesRuleFile: {
      name: 'surfaces.rule',
      language: 'rule',
      contents: surfacesRule,
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
      'pilot',
      'ground',
      'wall',
      'ladder',
      'conveyor',
      'ice',
      'sludge',
      'coin',
      'gem',
      'door',
      'doorOpen',
      'pinball',
      'rocket',
      'fuelCan',
      'fuelCanSmall',
    ]),
    ...starterAnimations(['pilotFly', 'pilotClimb', 'coinSpin']),
  },
  open: ['main'],
};
