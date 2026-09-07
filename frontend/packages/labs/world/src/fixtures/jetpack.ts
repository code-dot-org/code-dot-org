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
// way for the picture and the behavior to disagree.
//
// The counting is safe, and that is the one ordering worth knowing: Collection
// raises `collects` BEFORE it removes what was taken, but an event is queued
// and delivered after the steps — so by the time a handler asks how many are
// left, the one just taken is already gone.
//
// NONE OF THEM LEAVES THE ROOM, and it costs one trait each rather than a
// rule. "Stays in the Map" puts a body back where it was when it reaches an
// edge — and a body that got nowhere is exactly what both enemy rules read as
// a moment to decide something. So the ball turns round at the edge, the
// rocket takes the corner, and the robot picks a new direction, with nothing
// in any of the three rules that has ever heard of a map.
//
// THE ROBOT IS THE ONE THAT THINKS, and it is the only actor in the level that
// knows the Pilot exists. It walks the floor, takes the ladder when the Pilot
// is above it, and reconsiders only where reconsidering is possible — so it is
// slow, legible, and gets somewhere, which is the whole argument
// `rules/prowling` makes. It is pointed at the Pilot BY KIND, the same one
// cross-actor line the gauge uses.
//
// TWO MORE ENEMIES, AND THEY ARE THE SAME ACTOR WITH ONE NUMBER CHANGED. A ball
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

import {climbArrowsHandlers} from '../actors/enhance/climbArrows';
import {progressBarDrawing} from '../actors/stock/progressBar';
import {
  drawText,
  fill,
  rectangle,
  setText,
  swatch,
} from '../actors/stock/workspace';
import {
  stack,
  starterAnimations,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {} from '../rules/stock';
import {referenceToStock} from '../rules/ruleReference';
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

/**
 * One pad, painted.
 *
 * The keys are the declaring TRAIT's id and then the property's, both of them
 * the member's own name with everything but letters, digits and underscores
 * replaced (`ruleMeta.slug`) — so "Is a Teleport Pad" and "pad color" are
 * these. Written out rather than derived because a wrong key here is silent:
 * the override lands on nothing and every pad is the default blue.
 */
const padAt = (id: string, column: number, row: number, color: string) => ({
  type: 'actors/pad',
  id,
  properties: {
    positional: {position: {x: at(column), y: at(row)}},
    Is_a_Teleport_Pad: {pad_color: color},
  },
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

/**
 * The three networks, and where each end of each one is.
 *
 * Every pair links two places that are a JOURNEY apart, because a pad between
 * two things a step apart is a pad nobody uses. And none of them is a way to
 * skip the level: the red pair joins the two gem ledges, and reaching either
 * of them at all still costs a tank of fuel.
 */
/** The three networks, as the color each pad of one is painted. */
const BLUE = '#3f7fe0';
const GREEN = '#3fbf6a';
const RED = '#e0484a';

/**
 * ONE KIND, SIX INSTANCES, THREE COLOURS.
 *
 * The pads used to be three `.actor` files that differed in one row — the
 * `set pad color` on each. Nothing else about them was different, because the
 * pad's picture is drawn FROM that property (`padActor`), and the rule matches
 * pads on it (`rules/teleport`). Three files to hold three values.
 *
 * A placement carries per-instance overrides, keyed by the declaring trait and
 * then the property (`blockly/mapPlacements`), and `placementKey` gives each
 * distinct set its own drawing — so six placements of one kind draw as three
 * colors with nothing written twice. The color is a fact about THIS PAD,
 * which is what an override is for, and a seventh network is a seventh entry
 * here rather than a fourth file.
 */
const PADS: ReadonlyArray<readonly [string, number, number]> = [
  // Blue: the far end of the floor, and the belt six rows above it. ONE END
  // ON THE FLOOR AND ONE OFF IT, which is not a detail — a pair with both
  // ends on the floor is a loop, because the ball patrols the whole of it and
  // takes every pad it meets: it would roll from one to the other for ever
  // and never reach a wall to turn at, and turning at walls is the whole of
  // what that enemy is. With one end up here it is flung on to the belt,
  // carried along it, and falls back down, which is a thing to watch.
  [BLUE, 22, 14],
  [BLUE, 14, 7],
  // Green: the low ledge and the sludge, which are the two middle floors.
  [GREEN, 7, 10],
  [GREEN, 19, 11],
  // Red: the two gem ledges, at opposite top corners of the room. Not a way
  // to skip anything — reaching either of them at all still costs a tank.
  [RED, 2, 3],
  [RED, 23, 4],
];

/**
 * The barred way out, and the plate that unbars it.
 *
 * A COLUMN ACROSS THE FLOOR, one tile short of the door, from the sludge ledge
 * down. It bars the WALK rather than the room: a full tank still goes over the
 * top, which is the bargain this level always makes — fuel buys routes. What
 * it takes away is the last walk being a walk, which is the one you have to
 * make when the tank is empty, and that is exactly when it matters.
 *
 * The plate is at the far end of the same floor, so the last walk is now two
 * walks: out to the plate and back to the door, past whatever is patrolling.
 * That is the whole of what a switch buys a room — the shape of the level
 * became a fact about what you have done in it.
 *
 * AND THE ENEMIES PRESS IT TOO, which is not a hazard added on top but the
 * same rule: anything that moves can walk over a switch. A robot crossing the
 * plate shuts the way while you are on your way to it.
 */
const BARS: ReadonlyArray<readonly [number, number]> = [
  [23, 11],
  [23, 12],
  [23, 13],
  [23, 14],
];
const PLATE_AT = [16, 14] as const;

/** Where the way out is: on the floor, at the far end from the ladder. */
const DOOR_AT = [24, 14] as const;

/**
 * The four enemies, as `[kind, column, row]`.
 *
 * The ball rolls the length of the floor, which is the one place the Pilot has
 * to cross on foot when the tank is empty. The rocket flies the open middle of
 * the room, which is where a flight between ledges goes. The bat goes wherever
 * the Pilot is, which is what makes it the one you cannot plan around.
 *
 * Which way each SETS OFF is in its own file rather than here, because there
 * is one of each: a level with a dozen would want to aim them one at a time,
 * and the heading is settable for exactly that.
 */
const ENEMIES: ReadonlyArray<readonly [string, number, number]> = [
  ['actors/ball', 12, 14],
  ['actors/rocket', 10, 3],
  // At the far end of the floor from the Pilot, so the first thing a player
  // sees it do is set off towards them.
  ['actors/robot', 20, 14],
  // High and away, so its first few flaps are seen crossing the open middle
  // rather than happening on top of the Pilot.
  ['actors/bat', 22, 5],
  // The last four, each put where what it does is legible: the spring in the
  // tall empty column beside the ladder, the shuriken in the open middle
  // where a reflection has room to be one, the eyeball across the room from
  // the Pilot so that its first move is seen coming through a wall, and the
  // wanderer on the floor where nothing about it can be planned around.
  ['actors/spring', 8, 13],
  ['actors/shuriken', 14, 3],
  ['actors/eyeball', 17, 6],
  ['actors/blob', 11, 14],
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
  ...PADS.map(([color, column, row], index) =>
    padAt(`Pad${index}`, column, row, color),
  ),
  ...BARS.map(([column, row], index) =>
    place('actors/bar', `Bar${index}`, column, row),
  ),
  place('actors/plate', 'Plate', PLATE_AT[0], PLATE_AT[1]),
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

const truth = (value: boolean) => ({
  block: {type: 'logic_boolean', fields: {BOOL: value ? 'TRUE' : 'FALSE'}},
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

/** `⟨key⟩ is down` as 1 or 0, so a direction can be added up from the arrows. */
const keyAsNumber = (key: string) => ({
  block: {
    type: 'logic_ternary',
    inputs: {
      IF: {block: {type: 'world_is_key_down', fields: {KEY: key}}},
      THEN: number(1),
      ELSE: number(0),
    },
  },
});

/** `if ⟨test⟩ then ⟨body⟩`. */
const onlyIf = (test: object, body: object) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: body}},
});

/**
 * How long an enemy's trip takes, in seconds.
 *
 * Short — long enough for a fade out and back and no longer. An enemy is held
 * still for it, so anything more is an enemy standing on a pad waiting, which
 * is the lag this exists to avoid.
 */
const ENEMY_TRIP = 0.2;

/**
 * …and the Pilot's, which is longer.
 *
 * The difference is the difference between a thing that happens TO you and one
 * you asked for: a player who pressed a key is given a moment to watch what
 * they asked for happen, and an enemy is given just enough for the fade to
 * read. It is also how long the Pilot cannot be hurt for, which is the same
 * number by construction — the Pilot's handler asks for exactly the trip it is
 * on (see `teleportSafely`).
 */
const PILOT_TRIP = 0.4;

/**
 * What the PILOT does while a pad is carrying it: nothing anybody can see.
 *
 * The fade is not here any more. It was — four roots, copied into all five
 * kinds that teleport — and what a trip LOOKS like turned out not to be a fact
 * about the traveler at all. The pad is the thing doing something to whatever
 * steps on it, so the pad performs it, once, on `event actor` (`padActor`).
 *
 * WHAT IS LEFT IS THE ONE THING THAT REALLY IS THE PILOT'S. Only an actor with
 * `Has Health` can be made safe, and asking one without it throws — "Enemy0 has
 * no property 'safe_until'". The rule used to guard the call with `has trait
 * ⟨Has Health⟩` and had no business to; the pad cannot guard it either, because
 * a pad does not know which of the things that step on it can be hurt. Knowing
 * that this one is the Pilot is a thing a project knows and neither of them
 * does, so this stays a handler in the Pilot's own file.
 *
 * IT FITS IN THE HOLD, which is the reason a trip has a duration at all: the
 * traveler is held still for `travel seconds`, and this asks for exactly the
 * trip it is on rather than repeating the number.
 */
const teleportSafely = () => [
  {
    type: 'world_on_Teleport_StartsTravelingEvent',
    x: 320,
    y: 380,
    inputs: {ACTOR: me()},
    next: {
      block: {
        type: 'world_do_Health_BeSafeForSecondsAction',
        inputs: {
          ACTOR: me(),
          // `VALUE`, which is what a designed block calls its one parameter's
          // socket — read off how Teleport itself called this before the call
          // moved, not guessed from the parameter's name.
          VALUE: {
            block: {
              type: 'world_get_Teleport_TravelSecondsProperty',
              inputs: {ACTOR: me()},
            },
          },
        },
      },
    },
  },
];

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
            // Up and down climb, and only on a ladder. `Climbs` is the
            // mechanic; the keys that steer it are the step below, which is
            // what `actors/enhance/climbArrows` writes for a learner — the
            // control scheme belongs to the actor, not to the rule.
            useTrait('Climbing#ClimbsTrait'),
            // …and the pads, which it uses when it asks to rather than
            // whenever it stands on one — see the handler below and
            // `rules/teleport` on why that is not the same choice an enemy
            // gets.
            useTrait('Teleport#UsesTeleportPadsTrait'),
            useTrait('Digging#DigsTrait'),
            // A GAP ONE BLOCK WIDE IS EXACTLY ONE PILOT WIDE, and this room
            // is full of them — the hole a dig leaves, the shaft the ladder
            // is in, the space between two ledges. Without a few pixels of
            // forgiveness, flying up into one means being lined up to the
            // pixel, and what a player sees is a flight that plainly fitted
            // and did not go (`corner reach`, in Physics).
            {
              type: 'world_set_Physics_CornerReachProperty',
              inputs: {ACTOR: me(), VALUE: number(5)},
            },
            {
              type: 'world_set_Teleport_TravelSecondsProperty',
              inputs: {ACTOR: me(), VALUE: number(PILOT_TRIP)},
            },
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
            // Eight hits and a second and a half of mercy, against defaults
            // of three and a half. The defaults are tuned for a level where
            // an enemy is something you walk into; this room has three that
            // come to YOU — a ball rolling the floor, a rocket circling the
            // walls, and a robot that follows you up ladders — and a Pilot
            // who stands still for four seconds while learning the controls
            // should not lose the game for it.
            {
              type: 'world_set_Health_MostHealthProperty',
              inputs: {ACTOR: me(), VALUE: number(8)},
            },
            {
              type: 'world_set_Health_HealthProperty',
              inputs: {ACTOR: me(), VALUE: number(8)},
            },
            {
              type: 'world_set_Health_MercyTimeProperty',
              inputs: {ACTOR: me(), VALUE: number(1.5)},
            },
            // Half a tank to start with. A full one crosses the whole room,
            // which would leave the first two cans as scenery.
            {
              type: 'world_set_Jetpack_FuelProperty',
              inputs: {ACTOR: me(), VALUE: number(50)},
            },
            // THE SHOVEL: `z` held, and whichever arrow is held with it — which is
            // what JETPACK.md asks for ("in the direction they are also holding").
            // With no arrow at all the direction is nothing, the aimed-at point is
            // where the Pilot is standing, and the nearest diggable block to that is
            // the one under its feet. Which is the right answer for a shovel.
            //
            // A STEP RATHER THAN A HAT, because holding a key is a state and not a
            // moment; and polling costs nothing, since digging a block that is
            // already a hole does nothing (`rules/digging`).
            {
              type: 'world_trait_step',
              fields: {PHASE: 'touch', NAME: 'dig where it is pointing'},
              inputs: {
                DO: {
                  block: onlyIf(
                    {block: {type: 'world_is_key_down', fields: {KEY: 'z'}}},
                    {
                      type: 'world_do_Digging_DigTowardsAction',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {
                          block: {
                            type: 'world_vector_of',
                            inputs: {
                              X: {
                                block: {
                                  type: 'math_arithmetic',
                                  fields: {OP: 'MINUS'},
                                  inputs: {
                                    A: keyAsNumber('right arrow'),
                                    B: keyAsNumber('left arrow'),
                                  },
                                },
                              },
                              Y: keyAsNumber('down arrow'),
                            },
                          },
                        },
                      },
                    },
                  ),
                },
              },
            },
          ]),
        },
      },
      // THE LADDER, as four moments rather than a poll: up and down each
      // start a climb, and letting either go ends it. The same blocks
      // `actors/enhance/climbArrows` writes for a learner — shared rather than
      // copied, so the Pilot and a learner's actor cannot drift apart — laid
      // out here where the Pilot's other handlers are.
      ...climbArrowsHandlers().map((hat, index) => ({
        ...hat,
        x: 20,
        y: 900 + index * 120,
      })),
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
      // DOWN, which is free everywhere a pad can be. The Pilot's other use
      // for it is climbing down a ladder, and a pad on a rung would be a
      // press that meant two things — so the level does not put one there.
      {
        type: 'world_on_Input_PressesEvent',
        x: 20,
        y: 540,
        fields: {FILTER0: 'down arrow'},
        next: {
          block: {
            type: 'world_do_Teleport_UseThePadAction',
            inputs: {ACTOR: me()},
          },
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
      ...teleportSafely(),
    ],
  },
});

/** A tile that holds you up and cannot be walked through. */
/**
 * A ledge you can dig through, and which fills in on whoever is in it.
 *
 * THE LEDGES AND NOT THE WALLS. A room where every surface is diggable is a
 * room with no shape at all — the border is what makes it a room, and the
 * ledges are what make it a climb. Digging one is a way DOWN that costs
 * something, which is the trade the mechanic is for.
 *
 * WHAT A CLOSING HOLE COSTS IS DECIDED HERE, which is `rules/digging`'s whole
 * seam: the rule raises `fills in` and has no idea what a project wants that
 * to mean. Lode Runner kills what it catches, and so does this — but only the
 * Pilot, because it is the only thing in the room with anything to lose, and
 * asking an enemy for health it has not got is asking a question that throws.
 */
const diggableLedgeActor = (name: string, sprite: string) =>
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
              useTrait('Digging#CanBeDugTrait'),
              // Long enough to climb down through and look around, short
              // enough that a hole is not a staircase.
              {
                type: 'world_set_Digging_ClosesAfterProperty',
                inputs: {ACTOR: me(), VALUE: number(3)},
              },
              {type: 'world_set_sprite', fields: {SPRITE: sprite}},
            ]),
          },
        },
        // A HOLE HAS TO LOOK LIKE ONE, which is the half this was missing:
        // `passes through things` is invisible, so a dug ledge went on looking
        // like solid floor while the Pilot fell through it, and the mechanic
        // read as a bug. Faded rather than switched, because the moment a
        // block gives way is the moment worth seeing — and the two events the
        // rule already raises are exactly the two ends of it.
        {
          type: 'world_define_tween',
          id: 'ledgeGiveWay',
          x: 320,
          y: 20,
          fields: {NAME: 'give way', CURVE: 'linear'},
          inputs: {
            SECONDS: number(0.25),
            DO: {
              block: {
                type: 'world_set_Appearance_OpacityProperty',
                inputs: {ACTOR: me(), VALUE: number(0.25)},
              },
            },
          },
        },
        {
          type: 'world_define_tween',
          id: 'ledgeComeBack',
          x: 320,
          y: 200,
          fields: {NAME: 'come back', CURVE: 'linear'},
          inputs: {
            SECONDS: number(0.25),
            DO: {
              block: {
                type: 'world_set_Appearance_OpacityProperty',
                inputs: {ACTOR: me(), VALUE: number(1)},
              },
            },
          },
        },
        {
          type: 'world_on_Digging_IsDugEvent',
          x: 320,
          y: 380,
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_play_tween',
              fields: {TWEEN: 'ledgeGiveWay'},
              inputs: {ACTOR: me()},
            },
          },
        },
        {
          type: 'world_on_Digging_FillsInEvent',
          x: 20,
          y: 220,
          inputs: {ACTOR: me()},
          next: {
            block: stack([
              {
                type: 'world_play_tween',
                fields: {TWEEN: 'ledgeComeBack'},
                inputs: {ACTOR: me()},
              },
              onlyIf(
                // COUNTED rather than asked of one actor. `⟨x⟩ is a ⟨Pilot⟩`
                // reads the kind off the actor it is given, and the first
                // actor of an empty list is no actor at all — which is a
                // question with nothing to ask it of, and it throws. Counting
                // how many Pilots are in the hole is the same question with an
                // answer for none of them.
                {
                  block: {
                    type: 'logic_compare',
                    fields: {OP: 'GT'},
                    inputs: {
                      A: {
                        block: {
                          type: 'world_count_of_kind',
                          fields: {TYPE: 'actors/pilot'},
                          inputs: {
                            LIST: {
                              block: {
                                type: 'world_get_Collisions_ContactsProperty',
                                inputs: {ACTOR: me()},
                              },
                            },
                          },
                        },
                      },
                      B: number(0),
                    },
                  },
                },
                {
                  type: 'world_do_Health_TakeDamageAction',
                  inputs: {
                    // WHOEVER IS IN IT, rather than looking the Pilot up
                    // again: the question above has already established that
                    // the thing in this hole is one, and asking the world for
                    // a Pilot would hurt the wrong one in a room with two.
                    ACTOR: {
                      block: {
                        type: 'world_first_actor',
                        inputs: {
                          SOURCE: {
                            block: {
                              type: 'world_get_Collisions_ContactsProperty',
                              inputs: {ACTOR: me()},
                            },
                          },
                        },
                      },
                    },
                    VALUE: number(1),
                  },
                },
              ),
            ]),
          },
        },
      ],
    },
  });

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
  points: boolean,
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
              // Both axes, because a rocket travels on both. See the header:
              // the edge stops it, and being stopped is what makes it turn.
              useTrait('Boundaries#StaysAcrossTrait'),
              useTrait('Boundaries#StaysDownTrait'),
              ...(falls ? [useTrait('Gravity#AffectedByGravityTrait')] : []),
              // What makes it an enemy rather than an obstacle. It does not
              // know who it damages, and the Pilot does not know what damaged
              // it (`rules/health`).
              useTrait('Health#DealsDamageTrait'),
              // An enemy has no choice about a pad, which is the other half
              // of the mechanic: a shortcut you can take is a shortcut
              // something else is already coming through.
              useTrait('Teleport#UsesTeleportPadsTrait'),
              {
                type: 'world_set_Teleport_TakesAnyPadItTouchesProperty',
                inputs: {ACTOR: me(), VALUE: truth(true)},
              },
              // Shorter than the Pilot's, which is the difference between a
              // thing that happens TO you and one you asked for.
              {
                type: 'world_set_Teleport_TravelSecondsProperty',
                inputs: {ACTOR: me(), VALUE: number(ENEMY_TRIP)},
              },
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
              // The rocket's nose follows its heading; the ball is round and
              // a rotating highlight would be the only thing it said.
              {
                type: 'world_set_Turning_PointsWhereItGoesProperty',
                inputs: {ACTOR: me(), VALUE: truth(points)},
              },
            ]),
          },
        },
      ],
    },
  });

/**
 * A teleport pad, which is a floor that is somewhere else.
 *
 * ONE ACTOR PER COLOR rather than one actor and six colors, because a pad's
 * color is set where the actor is defined and a map placement cannot say a
 * property. Three kinds is also the truer reading of what a color IS here: it
 * is not a setting on a pad, it is which network the pad belongs to, and a
 * level with two networks has two kinds of thing in it.
 *
 * IT DRAWS ITSELF FROM ITS OWN COLOR rather than from a sprite, and that is
 * worth the four lines: three sprites that had to be repainted whenever a
 * color changed would be three chances for the picture and the behavior to
 * disagree, and the whole mechanic is invisible unless a player can read the
 * link at a glance.
 *
 * A PLATE AT THE BOTTOM of a tile-sized box, so a pad lies on the floor it is
 * placed on rather than standing in the air — and so the thing standing on it
 * is drawn over it rather than behind it.
 */
/**
 * A wall a switch moves, and a plate that moves it.
 *
 * ONE ACTOR EACH, for the same reason the pads are one per color: the color
 * is set where the actor is defined, and it is which NETWORK a thing belongs
 * to rather than a setting on it.
 *
 * THE WALL SHOWS WHETHER IT IS THERE, at a quarter opacity when it is not,
 * because a wall that goes on looking like a wall while you walk through it is
 * a wall a player will keep not walking through. It reads its own `passes
 * through things` every frame rather than being told twice — the picture
 * cannot disagree with the behavior if there is only one fact.
 */
const switchedWallActor = (name: string, color: string) =>
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
              useTrait('Switches#IsASwitchedWallTrait'),
              useTrait('Gravity#ActsAsGroundTrait'),
              useTrait('Solid Bodies#SolidTrait'),
              {
                type: 'world_set_Switches_WallColorProperty',
                inputs: {ACTOR: me(), VALUE: swatch(color)},
              },
              {
                type: 'world_trait_step',
                fields: {PHASE: 'react', NAME: 'look like what it is'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_Appearance_OpacityProperty',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {
                          block: {
                            type: 'logic_ternary',
                            inputs: {
                              IF: {
                                block: {
                                  type: 'world_get_Collisions_PassesThroughThingsProperty',
                                  inputs: {ACTOR: me()},
                                },
                              },
                              THEN: number(0.25),
                              ELSE: number(1),
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
        {
          type: 'world_define_drawing',
          x: 20,
          y: 380,
          fields: {WIDTH: 32, HEIGHT: 32},
          inputs: {
            DO: {
              block: stack([
                fill({
                  block: {
                    type: 'world_get_Switches_WallColorProperty',
                    inputs: {ACTOR: me()},
                  },
                }),
                rectangle(0, 0, 32, 32),
              ]),
            },
          },
        },
      ],
    },
  });

const switchActor = (name: string, color: string) =>
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
              useTrait('Switches#IsASwitchTrait'),
              {
                type: 'world_set_Switches_SwitchColorProperty',
                inputs: {ACTOR: me(), VALUE: swatch(color)},
              },
            ]),
          },
        },
        {
          type: 'world_define_drawing',
          x: 20,
          y: 200,
          fields: {WIDTH: 32, HEIGHT: 32},
          inputs: {
            DO: {
              block: stack([
                fill({
                  block: {
                    type: 'world_get_Switches_SwitchColorProperty',
                    inputs: {ACTOR: me()},
                  },
                }),
                rectangle(4, 20, 24, 12),
              ]),
            },
          },
        },
      ],
    },
  });

/**
 * The pad — ONE kind, however many networks a room has.
 *
 * Its color is a property rather than a fact about the file, so the three
 * networks are three values on six placements (`PADS`) and not three files.
 * The picture follows: the drawing below fills with `pad color`, so a pad
 * painted at placement time draws itself painted, and `placementKey` caches
 * one picture per distinct color.
 *
 * AND IT PERFORMS THE FADE, on whatever steps on it. What a trip looks like is
 * the pad's business — it is the thing doing something to the traveler — and
 * writing it here is what stops the same two tweens and two handlers being
 * copied into every kind that teleports. They were in five actor files before
 * this: the Pilot, the Robot, the Ball, the Rocket and the Bat, five copies of
 * one idea, and a sixth traveler would have arrived with no fade and nothing
 * saying why.
 *
 * `sends` and `receives` are the pad's own events (`rules/teleport`), raised
 * beside the traveler's `starts traveling` and `arrives`. The traveler
 * reaches this handler as `event actor`.
 *
 * A TWEEN IS A FUNCTION OF ONE ACTOR, defined in the file that holds it and
 * called with whoever it is played on — so the pad's `fade out` runs on the
 * traveler without the traveler defining anything.
 */
const padActor = (seconds: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Pad'},
          next: {
            block: stack([useTrait('Teleport#IsATeleportPadTrait')]),
          },
        },
        {
          type: 'world_define_drawing',
          x: 20,
          y: 200,
          fields: {WIDTH: 32, HEIGHT: 32},
          inputs: {
            DO: {
              block: stack([
                fill({
                  block: {
                    type: 'world_get_Teleport_PadColorProperty',
                    inputs: {ACTOR: me()},
                  },
                }),
                rectangle(0, 22, 32, 10),
              ]),
            },
          },
        },
        {
          type: 'world_define_tween',
          id: 'padFadeOut',
          x: 320,
          y: 20,
          fields: {NAME: 'fade out', CURVE: 'linear'},
          inputs: {
            SECONDS: number(seconds),
            DO: {
              block: {
                type: 'world_set_Appearance_OpacityProperty',
                inputs: {ACTOR: me(), VALUE: number(0)},
              },
            },
          },
        },
        {
          type: 'world_define_tween',
          id: 'padFadeIn',
          x: 320,
          y: 200,
          fields: {NAME: 'fade in', CURVE: 'linear'},
          inputs: {
            SECONDS: number(seconds),
            DO: {
              block: {
                type: 'world_set_Appearance_OpacityProperty',
                inputs: {ACTOR: me(), VALUE: number(1)},
              },
            },
          },
        },
        {
          type: 'world_on_Teleport_SendsEvent',
          x: 320,
          y: 380,
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_play_tween',
              fields: {TWEEN: 'padFadeOut'},
              inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
            },
          },
        },
        {
          type: 'world_on_Teleport_ReceivesEvent',
          x: 320,
          y: 500,
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_play_tween',
              fields: {TWEEN: 'padFadeIn'},
              inputs: {ACTOR: {block: {type: 'world_event_actor'}}},
            },
          },
        },
      ],
    },
  });

/**
 * The bat: the enemy that is never where you last saw it.
 *
 * The first pass at this was built out of the library as it stood — `Time`'s
 * repeating timer for the beat, `Gravity` at a third for the descent, and a
 * handler that wrote a velocity when the timer fired. It flew, and it was
 * wrong in a way worth recording, because it is the reason `rules/flapping`
 * exists at all.
 *
 * A GLIDE UNDER GRAVITY IS A PARABOLA, and a parabola cannot be aimed. The bat
 * would set off towards where the Pilot was and arrive somewhere else, by an
 * amount that depended on how far away the Pilot had been — so the same enemy
 * read as a different one across the room from you, and there was nothing for
 * a player to learn. What a bat wants is a straight line at a stated speed,
 * held for two seconds, and gravity's whole job is to make that impossible.
 *
 * So it is a rule, and what the rule is FOR is the commitment: the glide takes
 * its aim once and does not look again, which is what makes walking under one
 * the way past it. The three numbers set here are the level's balance, not the
 * mechanic — the mechanic is `rules/flapping`, and the header there is the
 * argument for it.
 */
const BAT_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Bat'},
        next: {
          block: stack([
            useTrait('Flapping#FlapsAndGlidesTrait'),
            useTrait('Health#DealsDamageTrait'),
            // Every enemy takes any pad it touches, this one included — and
            // it is the one that reaches the pads on the high ledges, since
            // nothing else in the room can get up there without a tank.
            useTrait('Teleport#UsesTeleportPadsTrait'),
            {
              type: 'world_set_Teleport_TakesAnyPadItTouchesProperty',
              inputs: {ACTOR: me(), VALUE: truth(true)},
            },
            {
              type: 'world_set_Teleport_TravelSecondsProperty',
              inputs: {ACTOR: me(), VALUE: number(ENEMY_TRIP)},
            },
            // Both axes, unlike the Robot's: a bat can reach the ceiling, and
            // nothing else in the room stops it there.
            useTrait('Boundaries#StaysAcrossTrait'),
            useTrait('Boundaries#StaysDownTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'bat.png'}},
            // Slower than the Pilot's walk of 1.5, and that is the balance
            // rather than a detail: a bat you cannot outrun is a bat you have
            // to fight, and there is nothing in this level to fight with.
            // Under it is where the player is meant to go, and the long slow
            // flapping phase is what gives them time to get there.
            {
              type: 'world_set_Flapping_GlideSpeedProperty',
              inputs: {ACTOR: me(), VALUE: number(1)},
            },
            {
              type: 'world_set_Flapping_FlapSpeedProperty',
              inputs: {ACTOR: me(), VALUE: number(0.6)},
            },
            {
              type: 'world_set_Flapping_FlapLiftProperty',
              inputs: {ACTOR: me(), VALUE: number(1.1)},
            },
          ]),
        },
      },
      // WHO IT HUNTS, on the frame it arrives — a row under `define actor` is
      // a declaration and has no world to ask, which is the same trap the
      // Robot's own handler below is written to avoid.
      {
        type: 'world_on_Space_CreatedEvent',
        x: 20,
        y: 220,
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_set_Flapping_ActorToHuntProperty',
            inputs: {
              ACTOR: me(),
              VALUE: {
                block: {
                  type: 'world_first_actor',
                  inputs: {SOURCE: kind('actors/pilot')},
                },
              },
            },
          },
        },
      },
    ],
  },
});

/**
 * THE LAST FOUR, and the whole of what they cost: two dials and no new rule.
 *
 * That is worth saying plainly because it is the argument the library has been
 * making since `Turning` — three enemies out of one trait and one number. Four
 * more come out of the same drawer:
 *
 *     the spring     `Turning`, aimed up, turning a half circle, no gravity.
 *                    It rises until it gets nowhere and comes back down, which
 *                    is what "turns when it hits something" already meant.
 *     the shuriken   `Turning` again, with `bounces off what stops it` — the
 *                    one dial the fixed turn could not be, because a mirror is
 *                    not a number.
 *     the eyeball    `Steering`'s ordinary chase and `ignores walls`, which is
 *                    the mover's fact rather than the wall's. It still touches
 *                    and still hurts; it is simply not stopped.
 *     the wanderer   `Time`'s repeating timer and a random direction, which is
 *                    how the bat was built before the bat needed a rule.
 *
 * They are drawn as four very different things ON PURPOSE. A player should
 * never have to work out that the spring and the shuriken are the same rule.
 */
const springActor = () =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Spring'},
          next: {
            block: stack([
              useTrait('Turning#TurnsWhenItHitsSomethingTrait'),
              useTrait('Health#DealsDamageTrait'),
              useTrait('Boundaries#StaysDownTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: 'spring.png'}},
              // Straight up, and a half circle when it gets nowhere. No
              // gravity at all: a spring that fell would be a ball.
              {
                type: 'world_set_Turning_HeadingProperty',
                inputs: {ACTOR: me(), VALUE: number(-90)},
              },
              {
                type: 'world_set_Turning_TurnByProperty',
                inputs: {ACTOR: me(), VALUE: number(180)},
              },
              {
                type: 'world_set_Turning_TravelSpeedProperty',
                inputs: {ACTOR: me(), VALUE: number(2.4)},
              },
            ]),
          },
        },
      ],
    },
  });

const shurikenActor = () =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Shuriken'},
          next: {
            block: stack([
              useTrait('Turning#TurnsWhenItHitsSomethingTrait'),
              useTrait('Health#DealsDamageTrait'),
              useTrait('Boundaries#StaysAcrossTrait'),
              useTrait('Boundaries#StaysDownTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: 'shuriken.png'}},
              // Off the diagonal, so that its first bounce is a reflection
              // rather than a reversal — aimed along an axis it would come
              // straight back and never show what it is.
              {
                type: 'world_set_Turning_HeadingProperty',
                inputs: {ACTOR: me(), VALUE: number(35)},
              },
              {
                type: 'world_set_Turning_BouncesOffWhatStopsItProperty',
                inputs: {ACTOR: me(), VALUE: truth(true)},
              },
              {
                type: 'world_set_Turning_TravelSpeedProperty',
                inputs: {ACTOR: me(), VALUE: number(2)},
              },
              // THE SPIN, which is the level's and not the rule's: `points where it
              // goes` would aim it, and a shuriken does not point anywhere. Turning
              // the drawing a little every frame is all a spin is.
              {
                type: 'world_trait_step',
                fields: {PHASE: 'react', NAME: 'spin'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_Space_RotationProperty',
                      inputs: {
                        ACTOR: me(),
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
                              B: number(9),
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

const eyeballActor = () =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Eyeball'},
          next: {
            block: stack([
              useTrait('Steering#ChasesTrait'),
              useTrait('Health#DealsDamageTrait'),
              // THE ONE THING A WALL DOES NOT STOP. `ignores walls` is the
              // mover's fact rather than the wall's, and is read by nothing
              // but Solid — so it still touches, and still hurts, which
              // `passes through things` would have taken away.
              {
                type: 'world_set_Physics_IgnoresWallsProperty',
                inputs: {ACTOR: me(), VALUE: truth(true)},
              },
              // Slow, because nothing in the room can be put between you and
              // it: the only answer is to keep moving, and that has to be an
              // answer a player can carry out.
              {
                type: 'world_set_Steering_ChaseSpeedProperty',
                inputs: {ACTOR: me(), VALUE: number(0.55)},
              },
              {type: 'world_set_sprite', fields: {SPRITE: 'eyeball.png'}},
            ]),
          },
        },
        {
          type: 'world_on_Space_CreatedEvent',
          x: 20,
          y: 220,
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_set_Steering_ActorToChaseProperty',
              inputs: {
                ACTOR: me(),
                VALUE: {
                  block: {
                    type: 'world_first_actor',
                    inputs: {SOURCE: kind('actors/pilot')},
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

/** `a random whole number from ⟨low⟩ to ⟨high⟩`. */
const randomFrom = (low: number, high: number) => ({
  block: {
    type: 'math_random_int',
    inputs: {FROM: number(low), TO: number(high)},
  },
});

const blobActor = () =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Blob'},
          next: {
            block: stack([
              useTrait('Time#HasATimerTrait'),
              useTrait('Health#DealsDamageTrait'),
              useTrait('Gravity#AffectedByGravityTrait'),
              useTrait('Boundaries#StaysAcrossTrait'),
              {type: 'world_set_sprite', fields: {SPRITE: 'blob.png'}},
              // Often enough that it never commits to anything, which is the
              // opposite of every other enemy here: the robot, the ball and
              // the bat are all readable, and this one is not.
              {
                type: 'world_set_Time_TimerPeriodProperty',
                inputs: {ACTOR: me(), VALUE: number(0.7)},
              },
            ]),
          },
        },
        // A SMALL RANDOM DIRECTION on each beat, sideways only — the vertical
        // is gravity's, as it is for everything else that walks. No rule for
        // this: a timer and a number are what "wanders" means.
        {
          type: 'world_on_Time_TimerFiresEvent',
          x: 20,
          y: 220,
          inputs: {ACTOR: me()},
          next: {
            block: {
              type: 'world_set_Physics_VelocityProperty',
              inputs: {
                ACTOR: me(),
                VALUE: {
                  block: {
                    type: 'world_vector_of',
                    inputs: {
                      X: {
                        block: {
                          type: 'math_arithmetic',
                          fields: {OP: 'MULTIPLY'},
                          inputs: {A: randomFrom(-1, 1), B: number(0.9)},
                        },
                      },
                      // Its own downward speed, kept: the vertical is
                      // gravity's here as it is for everything else that
                      // walks. A velocity is a vector, so the component comes
                      // off it with `⟨y⟩ of ⟨…⟩` rather than from a field on
                      // the getter.
                      Y: {
                        block: {
                          type: 'world_vector_component',
                          fields: {COMPONENT: 'y'},
                          inputs: {
                            VEC: {
                              block: {
                                type: 'world_get_Physics_VelocityProperty',
                                inputs: {ACTOR: me()},
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
        },
      ],
    },
  });

/**
 * The robot: the only actor in the level that knows the Pilot is there.
 *
 * It is pointed at the Pilot BY KIND — `first actor in ⟨any Pilot⟩` — which is
 * the same one cross-actor line the gauge uses, and it is set once when the
 * robot is defined rather than every frame: what it hunts does not change, and
 * a step that re-read it would be re-deciding something nobody asked about.
 */
const ROBOT_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Robot'},
        next: {
          block: stack([
            useTrait('Gravity#AffectedByGravityTrait'),
            useTrait('Climbing#ClimbsTrait'),
            useTrait('Prowling#ProwlsTrait'),
            // Across only: a robot walks, and staying DOWN as well would have
            // it hovering at the ceiling of the map rather than falling.
            useTrait('Boundaries#StaysAcrossTrait'),
            useTrait('Health#DealsDamageTrait'),
            // The floor is where the blue pair is, so the Robot is the enemy
            // a player meets coming the other way through one.
            useTrait('Teleport#UsesTeleportPadsTrait'),
            {
              type: 'world_set_Teleport_TakesAnyPadItTouchesProperty',
              inputs: {ACTOR: me(), VALUE: truth(true)},
            },
            {
              type: 'world_set_Teleport_TravelSecondsProperty',
              inputs: {ACTOR: me(), VALUE: number(ENEMY_TRIP)},
            },
            {type: 'world_set_sprite', fields: {SPRITE: 'robot.png'}},
            // Setting off LEFTWARDS, towards where the Pilot starts. Its
            // first junction is landing, which can happen before the handler
            // below has named its quarry — and a robot with nothing to hunt
            // yet keeps whatever it was born with, so being born facing the
            // right way is what makes the first ten seconds read properly.
            {
              type: 'world_set_Prowling_GoingProperty',
              inputs: {ACTOR: me(), VALUE: number(-1)},
            },
          ]),
        },
      },
      // WHO IT HUNTS, on the frame it arrives rather than in the rows above.
      // A row under `define actor` is a declaration and has no world to ask —
      // `any ⟨Pilot⟩` there is a `ReferenceError: world is not defined`, which
      // presents as the whole project failing to build. `when created` is a
      // handler, so it has one, and it is the right moment anyway: what a
      // robot hunts does not change, and a step re-reading it every frame
      // would be re-deciding something nobody asked about.
      {
        type: 'world_on_Space_CreatedEvent',
        x: 20,
        y: 200,
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_set_Prowling_ActorToHuntProperty',
            inputs: {
              ACTOR: me(),
              VALUE: {
                block: {
                  type: 'world_first_actor',
                  inputs: {SOURCE: kind('actors/pilot')},
                },
              },
            },
          },
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
 * walks in. There is no way for the picture and the behavior to disagree
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
            {
              type: 'world_trait_step',
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
          ]),
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
            {
              type: 'world_trait_step',
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
          ]),
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
      contents: diggableLedgeActor('Ledge', 'ground.png'),
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
    robotActor: {
      name: 'robot.actor',
      language: 'actor',
      contents: ROBOT_ACTOR,
      folderId: 'actors',
    },
    ballActor: {
      name: 'ball.actor',
      language: 'actor',
      contents: enemyActor(
        'Steel Ball',
        'pinball.png',
        180,
        true,
        BALL_AIM,
        false,
      ),
      folderId: 'actors',
    },
    rocketActor: {
      name: 'rocket.actor',
      language: 'actor',
      contents: enemyActor('Rocket', 'rocket.png', 90, false, ROCKET_AIM, true),
      folderId: 'actors',
    },
    batActor: {
      name: 'bat.actor',
      language: 'actor',
      contents: BAT_ACTOR,
      folderId: 'actors',
    },
    springActor: {
      name: 'spring.actor',
      language: 'actor',
      contents: springActor(),
      folderId: 'actors',
    },
    shurikenActor: {
      name: 'shuriken.actor',
      language: 'actor',
      contents: shurikenActor(),
      folderId: 'actors',
    },
    eyeballActor: {
      name: 'eyeball.actor',
      language: 'actor',
      contents: eyeballActor(),
      folderId: 'actors',
    },
    blobActor: {
      name: 'blob.actor',
      language: 'actor',
      contents: blobActor(),
      folderId: 'actors',
    },
    padActor: {
      name: 'pad.actor',
      language: 'actor',
      // Half the shortest trip in the room, so a traveler is invisible for
      // the middle of it rather than fading the whole way across.
      contents: padActor(ENEMY_TRIP / 2),
      folderId: 'actors',
    },
    barActor: {
      name: 'bar.actor',
      language: 'actor',
      contents: switchedWallActor('Bar', '#c8a02c'),
      folderId: 'actors',
    },
    plateActor: {
      name: 'plate.actor',
      language: 'actor',
      contents: switchActor('Plate', '#c8a02c'),
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
    gravityRuleFile: {
      name: 'gravity.rule',
      language: 'rule',
      contents: referenceToStock('gravity'),
      folderId: 'rules',
    },
    jumpRuleFile: {
      name: 'jump.rule',
      language: 'rule',
      contents: referenceToStock('jump'),
      folderId: 'rules',
    },
    jetpackRuleFile: {
      name: 'jetpack.rule',
      language: 'rule',
      contents: referenceToStock('jetpack'),
      folderId: 'rules',
    },
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
    boundsRuleFile: {
      name: 'bounds.rule',
      language: 'rule',
      contents: referenceToStock('bounds'),
      folderId: 'rules',
    },
    prowlingRuleFile: {
      name: 'prowling.rule',
      language: 'rule',
      contents: referenceToStock('prowling'),
      folderId: 'rules',
    },
    turningRuleFile: {
      name: 'turning.rule',
      language: 'rule',
      contents: referenceToStock('turning'),
      folderId: 'rules',
    },
    // The Blob's beat (`rules/time`) and the Eyeball's chase
    // (`rules/steering`) — the two the last four needed and the room did not
    // already have.
    timeRuleFile: {
      name: 'time.rule',
      language: 'rule',
      contents: referenceToStock('time'),
      folderId: 'rules',
    },
    steeringRuleFile: {
      name: 'steering.rule',
      language: 'rule',
      contents: referenceToStock('steering'),
      folderId: 'rules',
    },
    // The Bat's two phases (`rules/flapping`), which is the third enemy and
    // the third rule: a ball rolls, a robot decides at junctions, and this one
    // commits to a line for two seconds at a time.
    flappingRuleFile: {
      name: 'flapping.rule',
      language: 'rule',
      contents: referenceToStock('flapping'),
      folderId: 'rules',
    },
    // …and the pads, which are the one thing in the room that is not a way
    // THROUGH it (`rules/teleport`, JETPACK.md phase 4).
    teleportRuleFile: {
      name: 'teleport.rule',
      language: 'rule',
      contents: referenceToStock('teleport'),
      folderId: 'rules',
    },
    // The bar across the way out, and the plate that moves it
    // (`rules/switches`, JETPACK.md phase 5).
    switchesRuleFile: {
      name: 'switches.rule',
      language: 'rule',
      contents: referenceToStock('switches'),
      folderId: 'rules',
    },
    // A way down through a ledge, and a floor that comes back on you
    // (`rules/digging`, JETPACK.md phase 6).
    diggingRuleFile: {
      name: 'digging.rule',
      language: 'rule',
      contents: referenceToStock('digging'),
      folderId: 'rules',
    },
    healthRuleFile: {
      name: 'health.rule',
      language: 'rule',
      contents: referenceToStock('health'),
      folderId: 'rules',
    },
    scoreRuleFile: {
      name: 'score.rule',
      language: 'rule',
      contents: referenceToStock('score'),
      folderId: 'rules',
    },
    goalsRuleFile: {
      name: 'goals.rule',
      language: 'rule',
      contents: referenceToStock('goals'),
      folderId: 'rules',
    },
    writingRuleFile: {
      name: 'writing.rule',
      language: 'rule',
      contents: referenceToStock('writing'),
      folderId: 'rules',
    },
    surfacesRuleFile: {
      name: 'surfaces.rule',
      language: 'rule',
      contents: referenceToStock('surfaces'),
      folderId: 'rules',
    },
    climbRuleFile: {
      name: 'climb.rule',
      language: 'rule',
      contents: referenceToStock('climb'),
      folderId: 'rules',
    },
    collectRuleFile: {
      name: 'collect.rule',
      language: 'rule',
      contents: referenceToStock('collect'),
      folderId: 'rules',
    },
    progressRuleFile: {
      name: 'progress.rule',
      language: 'rule',
      contents: referenceToStock('progress'),
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
      'robot',
      'bat',
      'spring',
      'shuriken',
      'eyeball',
      'blob',
      'fuelCan',
      'fuelCanSmall',
    ]),
    ...starterAnimations(['pilotFly', 'pilotClimb', 'coinSpin']),
  },
  open: ['main'],
};
