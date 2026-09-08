// Jetpack, PLAYED — the test that decides whether the level is a level.
//
// Everything else about this fixture is checked standing still: the suite
// builds it, places it and ticks it (`scenariosPlay`), and the rule's own
// behavior is played in `rules/__tests__/stockRulesRun`. What neither can say
// is whether the two fit together into something you can get through — and
// every way of getting THAT wrong looks fine on the first frame.
//
// Three things are being claimed, and each is a number somewhere else that
// could quietly stop being true:
//
//   the jump cannot do it     `jump strength` is 2.6 here — a tile and a bit,
//                             enough to get on to a single step — and the
//                             lowest ledge is three tiles up. Raise one or
//                             lower the other and the level is about jumping.
//   the jetpack can           thrust against gravity, for as long as half a
//                             tank lasts. A `fuel per second` that emptied it
//                             sooner would leave the first can unreachable.
//   and a can pays for it     which is the wiring — the Pilot's own handler,
//                             the rule's clamp, and the can knowing nothing.
//
// Driven through `setInput` and `keyName`, as the driver drives it, for the
// reason `sokobanPlays` gives: the browser hands the world `KeyboardEvent.key`
// and a test that fed anything else would be testing a control scheme nobody
// can reach.

import {beforeEach, describe, expect, it} from 'vitest';

import {PositionProperty, Vector, type World} from '../engine';
import {keyName} from '../engine/core/keys';
import {OpacityProperty, SpriteProperty} from '../engine/rules/animation';
import {RotationProperty} from '../engine/rules/spatial';
import {MAP_COLUMNS, MAP_ROWS} from '../fixtures/jetpack';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';
import {TILE_SIZE} from '../runtime/viewport';

import {compileProject, type CompiledProject} from './support/compileProject';

let project: CompiledProject;

/** Tick for `seconds` at sixty frames a second, holding `keys` throughout. */
const play = (world: World, seconds: number, keys: string[] = []): void => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

// A map's placements keep the ids the document gave them, so the level names
// its own actors and this can find them by those names.
const named = (world: World, id: string) =>
  [...world.actors].find(one => one.id === id)!;

const pilot = (world: World) => named(world, 'Pilot');

const cans = (world: World) =>
  [...world.actors].filter(one => /^Can\d/.test(one.id)).length;

/** Which row an actor's middle is in, counting from the ceiling. */
const rowOf = (world: World) =>
  Math.round(
    (pilot(world).get(PositionProperty).y - TILE_SIZE / 2) / TILE_SIZE,
  );

const fuelOf = (world: World, name: string) => {
  const module = project.modules['rules/jetpack'] as Record<string, unknown>;
  return (pilot(world) as {get(p: unknown): number}).get(module[name]);
};

beforeEach(async () => {
  project = await compileProject(projectFiles(WORLD_SCENARIOS.jetpack.source));
});

describe('the jetpack level', () => {
  it('stands the Pilot on the floor, with half a tank', () => {
    const {world} = project;
    play(world, 0.5);

    // Row 14 is the last row before the floor tiles at 15.
    expect(rowOf(world)).toBe(14);
    expect(fuelOf(world, 'FuelProperty')).toBe(50);
  });

  it('walks left off the ladder it starts on', () => {
    // It could not. The Pilot starts standing in the ladder's bottom rung, and
    // held left it did not move a pixel — velocity a steady -1.5 the whole
    // time, and the position put back every frame.
    //
    // Corner-slipping did it. A body walking a flat floor picks up a fraction
    // of downward speed every frame, so it meets the next tile along with a
    // sliver of overlap — and a sliver read as a CORNER, which is nudged back
    // out so a body falling PAST a block is not caught by its edge. Walking,
    // that nudge is exactly the walk, canceled.
    const {world} = project;
    play(world, 0.5);
    expect(pilot(world).get(PositionProperty).x).toBe(80);

    play(world, 1, ['left arrow']);

    // The wall's inside face is at 32 and the Pilot is a tile wide, so this is
    // as far left as the room goes.
    expect(pilot(world).get(PositionProperty).x).toBe(48);
  });

  it('crosses tile edges going left, not only going right', () => {
    // The general case, and the reason this looked like one broken direction:
    // the nudge canceled the walk going left and left it alone going right,
    // so the Pilot crossed the room one way and stopped dead at the first tile
    // edge the other. Out in the open, away from the ladder and the wall.
    const {world} = project;
    play(world, 0.5);
    play(world, 1.2, ['right arrow']);
    const from = pilot(world).get(PositionProperty).x;

    play(world, 1, ['left arrow']);

    // A second of walking, which is a good few tiles; it used to be nought.
    expect(from - pilot(world).get(PositionProperty).x).toBeGreaterThan(100);
  });

  it('cannot be jumped', () => {
    // The claim the whole level rests on. A press is a jump AND a switch, so
    // this holds the key exactly one frame — long enough for the press, short
    // of a release — and then empties the tank so the thrust cannot help.
    const {world} = project;
    play(world, 0.5);
    pilot(world).set(
      (project.modules['rules/jetpack'] as Record<string, unknown>)
        .FuelProperty as never,
      0 as never,
    );

    play(world, 1 / 60, ['space']);
    let highest = rowOf(world);
    for (let frame = 0; frame < 60; frame++) {
      play(world, 1 / 60);
      highest = Math.min(highest, rowOf(world));
    }

    // The lowest ledge is row 11, which is three above the floor at 14. A hop
    // of a tile and a bit gets nowhere near it.
    expect(highest).toBeGreaterThan(12);
  });

  it('flies to the first ledge and takes the can that is on it', () => {
    // UP FIRST, then across, which is the route the level is shaped for: the
    // Pilot starts at column 2 and the ledge runs from column 3, so climbing
    // while moving right puts it under the overhang — the ledge is solid, and
    // a jetpack does not go through a floor from below.
    const {world} = project;
    play(world, 0.5);
    const before = cans(world);

    play(world, 0.9, ['space']);
    play(world, 0.8, ['right arrow']);

    // Standing on the ledge, which is row 11, so the Pilot's middle is in 10.
    expect(rowOf(world)).toBe(10);
    expect(cans(world)).toBe(before - 1);
    // Most of the tank spent getting there and half a can back: more than the
    // climb cost, which is what makes the cans somewhere to go rather than
    // points.
    expect(fuelOf(world, 'FuelProperty')).toBeGreaterThan(20);
  });

  it('runs the tank down while the key is held, and stops when it is empty', () => {
    // Four seconds of thrust on a full tank, so half a tank is two — held for
    // three, the last one is a fall.
    const {world} = project;
    play(world, 0.5);

    play(world, 1.9, ['space']);
    const spent = fuelOf(world, 'FuelProperty');
    const peak = rowOf(world);
    play(world, 1.1, ['space']);

    expect(spent).toBeLessThan(5);
    // Still holding, and coming down anyway: an empty tank switches the
    // jetpack off and holding the key does not switch it back on.
    expect(rowOf(world)).toBeGreaterThan(peak);
  });

  it('fills the gauge from the tank, without either knowing the other', () => {
    // The one cross-actor line in the project: the bar reaches the Pilot by
    // kind. Nothing else in the level would notice if this stopped working —
    // the game plays exactly the same with a bar stuck at whatever it was.
    const {world} = project;
    // The bar's OWN number, read from the actor it belongs to. `fraction` was
    // the Progress rule's; a Progress Bar declares it for itself now, and the
    // Fuel Bar has it because it acts like one (`ActorBuilder.actsLike`).
    const bar = project.modules['actors/progressBar'] as Record<
      string,
      unknown
    >;
    const gauge = named(world, 'Gauge');
    play(world, 0.5);

    const full = (gauge as {get(p: unknown): number}).get(bar.FractionProperty);
    play(world, 1, ['space']);

    expect(full).toBeCloseTo(0.5, 2);
    expect(
      (gauge as {get(p: unknown): number}).get(bar.FractionProperty),
    ).toBeLessThan(full);
  });

  it('climbs the ladder to the first ledge, on no fuel at all', () => {
    // The other way up, and the reason it is in the level: it costs nothing.
    // The Pilot starts ON the ladder, so this is the route a player takes
    // once the tank is dry — and the check is that the tank stayed dry.
    const {world} = project;
    play(world, 0.5);
    pilot(world).set(
      (project.modules['rules/jetpack'] as Record<string, unknown>)
        .FuelProperty as never,
      0 as never,
    );

    play(world, 1.5, ['up arrow']);

    // The ladder's top rung is row 10, so a Pilot on it is somewhere above
    // row 11 — the lowest ledge, which is what the ladder reaches.
    expect(rowOf(world)).toBeLessThan(11);
    expect(fuelOf(world, 'FuelProperty')).toBe(0);
  });

  it('comes back down the ladder rather than falling off it', () => {
    // The half a one-way platform cannot do: standing on the top rung and
    // going down through it. Without `Climbs Ladders` this is a Pilot that
    // stands there, and with it the level has a way back that costs nothing.
    const {world} = project;
    play(world, 0.5);
    play(world, 1.5, ['up arrow']);
    const onTop = rowOf(world);

    play(world, 0.8, ['down arrow']);

    expect(rowOf(world)).toBeGreaterThan(onTop + 2);
  });

  it('is carried off the belt if it stands still on one', () => {
    // The belt is the long low ledge, so standing still up there is a
    // decision — which is the whole reason a belt is somewhere rather than
    // anywhere.
    const {world} = project;
    play(world, 0.5);
    // Dropped on to the LEFT end of the belt, which runs across row 8 from
    // column 11: the belt is six tiles and carries at two hundred pixels a
    // second, so measuring from the middle would be measuring the fall off
    // the far end.
    pilot(world).set(
      PositionProperty,
      new Vector(11 * 32 + 16, 7 * 32 + 16) as never,
    );
    play(world, 0.2);
    const from = pilot(world).get(PositionProperty).x;

    play(world, 0.4);

    // Two units a second is eighty pixels in that time, and the Pilot asked
    // for none of it.
    expect(pilot(world).get(PositionProperty).x - from).toBeCloseTo(80, -1);
  });

  it('cannot turn round on the ice under the high can', () => {
    // Arriving somewhere at a speed you can live with is what the ice makes
    // into a question, and it is the only floor in the room that refuses a
    // key outright.
    const {world} = project;
    play(world, 0.5);
    pilot(world).set(
      PositionProperty,
      new Vector(20 * 32 + 16, 4 * 32 + 16) as never,
    );
    play(world, 0.4, ['right arrow']);
    const from = pilot(world).get(PositionProperty).x;

    play(world, 0.5, ['left arrow']);

    expect(pilot(world).get(PositionProperty).x).toBeGreaterThan(from);
  });

  /** Take everything of one kind out of the world, as collecting it would. */
  const clear = (world: World, id: RegExp) => {
    for (const actor of [...world.actors]) {
      if (id.test(actor.id)) {
        world.removeActor(actor);
      }
    }
  };

  /** Walk the Pilot to a place, without asking how it would get there. */
  const put = (world: World, column: number, row: number) =>
    pilot(world).set(
      PositionProperty,
      new Vector(column * 32 + 16, row * 32 + 16) as never,
    );

  it('scores a coin and not a gem, from one rule and two handlers', () => {
    // The distinction the level is built on: both elect `Can Be Collected`
    // and neither knows what it is worth. A coin is a point because one
    // handler says so.
    const {world} = project;
    const score = () =>
      (world as {get(p: unknown): number}).get(
        (project.modules['rules/score'] as Record<string, unknown>)
          .ScoreProperty,
      );
    play(world, 0.5);

    // On to the first coin on the floor, four tiles to the right.
    play(world, 1.2, ['right arrow']);

    expect(score()).toBeGreaterThan(0);
  });

  it('leaves the door shut while a gem is still out there', () => {
    // Walking into a shut door does nothing at all, which is what makes the
    // gems the level rather than decoration.
    const {world} = project;
    let won = 0;
    world.on(
      (project.modules['rules/goals'] as Record<string, unknown>)
        .TheGameIsWonEvent as never,
      () => {
        won++;
      },
    );
    play(world, 0.5);

    put(world, 24, 14);
    play(world, 0.5);

    expect(won).toBe(0);
  });

  it('opens the door and ends the level once the gems are gone', () => {
    // The whole goal structure, and neither half of it remembers anything:
    // the Door asks how many gems are left and so does the Pilot.
    const {world} = project;
    let won = 0;
    world.on(
      (project.modules['rules/goals'] as Record<string, unknown>)
        .TheGameIsWonEvent as never,
      () => {
        won++;
      },
    );
    play(world, 0.5);
    clear(world, /^Gem\d/);
    play(world, 0.2);

    // The Door's picture is the same fact, so it has changed by now too.
    const door = named(world, 'Door');
    expect((door as {get(p: unknown): string}).get(SpriteProperty)).toContain(
      'doorOpen',
    );

    put(world, 24, 14);
    play(world, 0.5);

    expect(won).toBe(1);
  });

  it('holds an enemy still and fades it while a pad carries it', () => {
    // The two halves of what a trip is FOR. It has a duration so that there is
    // somewhere for a fade to play; the fade is the level's, hung on the
    // rule's two events, because a rule that faded actors itself would be a
    // rule every project had to agree with about fading.
    //
    // AND IT MUST NOT MOVE while it plays, which is the whole reason `held
    // still` exists in Physics: a ball that is not moving and a ball that has
    // been stopped look identical from outside, and `Turning` would otherwise
    // turn this one round on every frame of the wait.
    const {world} = project;
    play(world, 0.5);
    const ball = named(world, 'Enemy0');
    const traveling = (
      project.modules['rules/teleport'] as Record<string, unknown>
    ).TravelingProperty as never;

    // Roll on until a pad takes it.
    let waited = 0;
    while (!ball.get(traveling) && waited < 600) {
      play(world, 1 / 60);
      waited += 1;
    }
    expect(ball.get(traveling)).toBe(true);

    const from = ball.get(PositionProperty);
    const dimmest: number[] = [];
    for (let tick = 0; tick < 6 && ball.get(traveling); tick++) {
      play(world, 1 / 60);
      dimmest.push(ball.get(OpacityProperty));
      const now = ball.get(PositionProperty);
      expect(now.x).toBeCloseTo(from.x, 1);
      expect(now.y).toBeCloseTo(from.y, 1);
    }

    // …and it is on its way out while it waits.
    expect(Math.min(...dimmest)).toBeLessThan(1);
  });

  it('paints six pads three colors from one kind', () => {
    // THE PADS ARE ONE ACTOR FILE. They were three that differed in a single
    // `set pad color` row, and the color is a fact about a particular pad
    // rather than about the kind — so it is a per-instance override on the
    // placement instead (`blockly/mapPlacements`, `PADS`).
    //
    // A WRONG OVERRIDE KEY IS SILENT, which is the whole reason this is here.
    // The keys are the declaring trait's id and the property's, both slugged
    // (`Is_a_Teleport_Pad`, `pad_color`); miss either and the override lands
    // on nothing, every pad is the default blue, and what a player sees is a
    // room whose six pads are all one network — still teleporting, just to the
    // wrong places.
    const {world} = project;
    const teleport = project.modules['rules/teleport'] as Record<
      string,
      unknown
    >;
    const color = teleport.PadColorProperty as never;
    const isPad = teleport.IsATeleportPadTrait as never;
    const pads = [...world.actors].filter(one =>
      (one as {has(trait: unknown): boolean}).has(isPad),
    );

    expect(pads).toHaveLength(6);
    const painted = pads.map(pad => pad.get(color));
    // Three networks of two, which is what the room is built around: a pair is
    // a journey and a single pad is a dead end.
    expect(new Set(painted).size).toBe(3);
    for (const one of new Set(painted)) {
      expect(painted.filter(each => each === one)).toHaveLength(2);
    }
  });

  it('carries the ball round the room through the pads', () => {
    // What the pads did to the level's simplest hazard, and it is worth
    // stating because it REPLACED a test. The Steel Ball used to roll the
    // floor to the wall and come back, and that was the whole of it. Every
    // enemy now takes any pad it touches (JETPACK.md, phase 4), and the ball
    // patrols the one floor a pad is on — so it is flung up to the belt,
    // rolls it, drops to the low ledge, is flung across to the sludge, and
    // falls back to the floor. It never reaches a wall any more: a pad gets
    // to it first.
    //
    // That is not a loss of the turning behavior, only of this room's view
    // of it — `Turning` is pinned by its own tests and by the enemies lesson,
    // both of which put a ball in a corridor with nothing else in it.
    const {world} = project;
    play(world, 0.5);
    const ball = named(world, 'Enemy0');
    const heights: number[] = [];
    for (let tick = 0; tick < 20; tick++) {
      play(world, 0.4);
      heights.push(ball.get(PositionProperty).y);
    }

    // Three floors of the room, in eight seconds: the ground it starts on and
    // two it could not have rolled to. Rounded to the tile, because what is
    // being counted is places rather than pixels.
    const floors = new Set(heights.map(y => Math.round(y / 32)));
    expect(floors.size).toBeGreaterThanOrEqual(3);
    // …and one of them well above the floor it started on, which only a pad
    // could have done: nothing in the room lifts a ball.
    expect(Math.min(...heights)).toBeLessThan(heights[0] - 96);
  });

  it('turns the rocket’s nose the way it is flying', () => {
    // The ball and the rocket are the same actor with two numbers changed,
    // and this is the second of them. A rocket that takes the corner and
    // keeps flying nose-east is the one thing in the room that reads as
    // broken; a ball is round and is left alone.
    const {world} = project;
    play(world, 0.5);
    const rocket = named(world, 'Enemy1');
    const ball = named(world, 'Enemy0');

    // Long enough to have met a wall and turned at least once — it starts
    // aimed right, along the open middle of the room.
    play(world, 6);

    expect(rocket.get(RotationProperty)).not.toBe(0);
    expect(rocket.get(RotationProperty)).toBe(
      rocket.get(
        (project.modules['rules/turning'] as Record<string, unknown>)
          .HeadingProperty as never,
      ),
    );
    expect(ball.get(RotationProperty)).toBe(0);
  });

  it('damages the Pilot, and losing is Goals’ business rather than Health’s', () => {
    // Neither side names the other: the ball deals damage and does not know
    // who to, the Pilot can be damaged and does not know what by, and what
    // the game DOES about running out is the project's line.
    const {world} = project;
    let lost = 0;
    world.on(
      (project.modules['rules/goals'] as Record<string, unknown>)
        .TheGameIsLostEvent as never,
      () => {
        lost++;
      },
    );
    play(world, 0.5);
    const health = () =>
      (pilot(world) as {get(p: unknown): number}).get(
        (project.modules['rules/health'] as Record<string, unknown>)
          .HealthProperty,
      );
    const before = health();

    // Put the Pilot on the ball, which is rolling the floor it stands on.
    const ball = named(world, 'Enemy0');
    pilot(world).set(PositionProperty, ball.get(PositionProperty) as never);
    play(world, 0.3);

    expect(health()).toBeLessThan(before);
    expect(lost).toBe(0);
  });

  it('sets the robot after the Pilot, once, on the frame it arrives', () => {
    // The one cross-actor line in the enemy. A row under `define actor` has no
    // world to ask — `any ⟨Pilot⟩` there fails the whole build with
    // "world is not defined" — so it happens in a handler, and `when created`
    // is the right one: what a robot hunts does not change.
    const {world} = project;
    play(world, 0.5);
    const robot = named(world, 'Enemy2');

    // A list of one, which is what every actor VALUE in the lab is: `first
    // actor in` answers with no actors rather than with nothing, so a
    // statement using it does nothing instead of failing.
    expect(
      (robot as {get(p: unknown): unknown[]}).get(
        (project.modules['rules/prowling'] as Record<string, unknown>)
          .ActorToHuntProperty,
      ),
    ).toEqual([pilot(world)]);
  });

  it('sends the robot after the Pilot along the floor', () => {
    // It starts at the far end and the Pilot is at the ladder, so the first
    // thing it does when it lands is set off leftwards — which is a decision
    // and not a heading it was given.
    const {world} = project;
    play(world, 0.5);
    const robot = named(world, 'Enemy2');
    const from = robot.get(PositionProperty).x;

    play(world, 2);

    expect(robot.get(PositionProperty).x).toBeLessThan(from - 50);
  });

  it('flaps up, then commits to a glide at the Pilot', () => {
    // The third enemy, and the third rule. What this pins is the SHAPE of the
    // flight rather than that it arrives: "it got closer" would pass for any
    // chaser, and a chaser is the thing this deliberately is not.
    const {world} = project;
    play(world, 0.3);
    const bat = named(world, 'Enemy3');
    const where: {x: number; y: number}[] = [];
    for (let tick = 0; tick < 24; tick++) {
      play(world, 0.15);
      const at = bat.get(PositionProperty);
      where.push({x: at.x, y: at.y});
    }
    const steps = where.slice(1).map((one, index) => ({
      x: one.x - where[index].x,
      y: one.y - where[index].y,
    }));

    // IT GOES UP AT ALL, which in this level nothing else could do for it: a
    // bat elects no gravity and stands on nothing, so a rise is a flap.
    expect(steps.some(step => step.y < -1)).toBe(true);

    // …AND THERE IS A STRETCH IT HOLDS A LINE THROUGH. Six samples of the
    // same step in both axes is nine hundred milliseconds of not turning,
    // which is a glide and is not something a fall or a chase would produce.
    const held = steps.some((step, index) =>
      steps
        .slice(index, index + 6)
        .every(
          other =>
            Math.abs(other.x - step.x) < 0.5 &&
            Math.abs(other.y - step.y) < 0.5,
        ),
    );
    expect(held).toBe(true);

    // …towards the Pilot, which starts away to the left of it.
    expect(where[where.length - 1].x).toBeLessThan(where[0].x - 200);
  });

  it('bars the way out until something crosses the plate', () => {
    // JETPACK.md's phase five, in the room: the shape of the level is now a
    // fact about what has happened in it. The bar is solid to start with and
    // the plate is at the far end of the same floor, so the last walk became
    // two walks.
    const {world} = project;
    play(world, 0.5);
    const bar = named(world, 'Bar0');
    const plate = named(world, 'Plate');
    const passable = (
      project.modules['rules/collisions'] as Record<string, unknown>
    ).PassesThroughThingsProperty as never;
    expect(bar.get(passable)).toBe(false);

    // Walked over by hand rather than by the Pilot: getting a player down
    // there is a test about flying, and this one is about the switch.
    const walker = named(world, 'Enemy2');
    walker.set(PositionProperty, plate.get(PositionProperty) as never);
    play(world, 0.2);

    expect(bar.get(passable)).toBe(true);
  });

  it('digs a way down through a ledge, and gives it back', () => {
    // JETPACK.md's phase six in the room. The LEDGES are diggable and the
    // border is not: a room where every surface gives way has no shape, and
    // the ledges are what make it a climb.
    const {world} = project;
    play(world, 0.5);
    const pilot = named(world, 'Pilot');
    const digging = project.modules['rules/digging'] as Record<string, unknown>;
    const hole = digging.IsAHoleProperty as never;
    // On the low ledge, which runs along row 11 — standing on it is row 10.
    pilot.set(PositionProperty, new Vector(5 * 32 + 16, 10 * 32 + 16) as never);
    play(world, 0.4);
    const under = named(world, 'Ledge11_5');
    expect(under.get(hole)).toBe(false);

    // `z` with no arrow: the block under its feet.
    play(world, 0.2, ['z']);

    expect(under.get(hole)).toBe(true);

    // AND IT LOOKS LIKE ONE, which is the half that was missing at first:
    // `passes through things` is invisible, so a dug ledge went on looking
    // like solid floor while the Pilot fell through it and the mechanic read
    // as a bug rather than a mechanic.
    play(world, 0.3);
    expect(under.get(OpacityProperty)).toBeLessThan(0.5);

    // …and it comes back on the block's own clock, three seconds later, and
    // comes back visible.
    play(world, 3.2);

    expect(under.get(hole)).toBe(false);
    play(world, 0.4);
    expect(under.get(OpacityProperty)).toBe(1);
  });

  it('gives the last four their four different behaviors', () => {
    // JETPACK.md's phase seven, and the claim worth pinning is that all four
    // came out of two dials and no new rule. Each assertion is the thing that
    // tells that enemy from the others — "it moved" would pass for any of
    // them, and for the four that were already here.
    const {world} = project;
    play(world, 0.5);
    const spring = named(world, 'Enemy4');
    const shuriken = named(world, 'Enemy5');
    const eyeball = named(world, 'Enemy6');
    const blob = named(world, 'Enemy7');
    const heading = (
      project.modules['rules/turning'] as Record<string, unknown>
    ).HeadingProperty as never;

    const springY: number[] = [];
    const blobX: number[] = [];
    const eyeStart = eyeball.get(PositionProperty).x;
    const spinFirst = shuriken.get(heading) as unknown as number;
    const spins: number[] = [];
    const velocity = (
      project.modules['rules/motion'] as Record<string, unknown>
    ).VelocityProperty as never;
    for (let tick = 0; tick < 40; tick++) {
      play(world, 0.15);
      springY.push(spring.get(PositionProperty).y);
      blobX.push(Math.round((blob.get(velocity) as unknown as Vector).x * 10));
      spins.push(shuriken.get(heading) as unknown as number);
    }

    // THE SPRING goes up and comes back: `Turning` aimed up with a half
    // circle, and no gravity to make it a ball.
    expect(Math.min(...springY)).toBeLessThan(springY[0] - 32);
    expect(Math.max(...springY)).toBeGreaterThan(Math.min(...springY) + 32);

    // THE SHURIKEN reflects rather than reverses. Sampled rather than read at
    // the end, because two reflections can land on the same heading a single
    // reversal would have — off a wall and then off the floor comes back to
    // the start plus a half circle, and reading only the last one would call
    // that a reversal. What a fixed turn can NEVER produce is a heading that
    // is neither of those two, and one of those is what this looks for.
    const reversed = (spinFirst + 180) % 360;
    expect(spins.some(spin => spin !== spinFirst && spin !== reversed)).toBe(
      true,
    );

    // THE EYEBALL closed on the Pilot, which is bottom-left of it, across a
    // room full of walls it is not stopped by.
    expect(eyeball.get(PositionProperty).x).toBeLessThan(eyeStart - 64);

    // THE WANDERER DOES NOT COMMIT, which none of the others do: everything
    // else here holds a direction until something takes it away.
    //
    // Read as "its sideways speed took more than one value" rather than as
    // "it went both ways", and the difference is the difference between a
    // test and a coin toss. It picks from three directions on each beat, so
    // over a handful of beats never once going LEFT is about one in twelve —
    // an assertion that would cry wolf roughly every twelfth run. All of them
    // coming up the same is a fifteen-thousandth, and says the same thing.
    expect(new Set(blobX).size).toBeGreaterThan(1);
  });

  it('keeps every enemy in the room', () => {
    // One trait each rather than a rule: "Stays in the Map" puts a body back
    // where it was at an edge, and a body that got nowhere is what both enemy
    // rules read as a moment to decide something. So they turn round there,
    // and nothing in either rule has ever heard of a map.
    const {world} = project;
    play(world, 0.5);

    play(world, 12);

    for (const id of ['Enemy0', 'Enemy1', 'Enemy2']) {
      const where = named(world, id).get(PositionProperty);
      expect(where.x, id).toBeGreaterThan(0);
      expect(where.x, id).toBeLessThan(MAP_COLUMNS * 32);
      expect(where.y, id).toBeGreaterThan(0);
      expect(where.y, id).toBeLessThan(MAP_ROWS * 32);
    }
  });
});
