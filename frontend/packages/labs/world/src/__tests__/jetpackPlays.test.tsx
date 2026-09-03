// Jetpack, PLAYED — the test that decides whether the level is a level.
//
// Everything else about this fixture is checked standing still: the suite
// builds it, places it and ticks it (`scenariosPlay`), and the rule's own
// behaviour is played in `rules/__tests__/stockRulesRun`. What neither can say
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
import {SpriteProperty} from '../engine/rules/animation';
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
    const progress = project.modules['rules/progress'] as Record<
      string,
      unknown
    >;
    const gauge = named(world, 'Gauge');
    play(world, 0.5);

    const full = (gauge as {get(p: unknown): number}).get(
      progress.FractionProperty,
    );
    play(world, 1, ['space']);

    expect(full).toBeCloseTo(0.5, 2);
    expect(
      (gauge as {get(p: unknown): number}).get(progress.FractionProperty),
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

  it('rolls a ball along the floor and brings it back', () => {
    // The enemy the level is crossed on foot past. The ball and the rocket
    // are the same actor with one number changed, so this also stands for
    // the rocket having any behaviour at all.
    const {world} = project;
    play(world, 0.5);
    const ball = named(world, 'Enemy0');
    const at = () => ball.get(PositionProperty).x;
    const from = at();

    play(world, 3);
    const there = at();
    play(world, 8);

    // Right first — it is aimed away from where the Pilot starts — until the
    // wall, then back the way it came, which no clock in the level ever
    // mentions.
    expect(there).toBeGreaterThan(from);
    expect(at()).toBeLessThan(there);
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
});
