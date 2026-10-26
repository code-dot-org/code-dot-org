// Sokoban, PLAYED — the test that decides whether "Moves on a Grid" is real.
//
// A grid rule is easy to write and easy to get subtly wrong, and every way of
// getting it wrong looks fine standing still. A step that does not land exactly
// on its square leaves a board that stops adding up after a dozen moves; a push
// that does not check the square BEYOND the crate lets crates eat each other;
// a step that can begin while one is running turns the whole thing back into
// continuous motion the first time somebody holds a key.
//
// So this plays it. Real files, real generator, real ticks.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {PositionProperty, type World} from '../engine';
import {keyName} from '../engine/core/keys';
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

/**
 * Press a key for one frame, then let the step finish.
 *
 * THROUGH `keyName`, as the driver does. The browser hands the world
 * `KeyboardEvent.key` and `PhaserBinding` translates it before `setInput` ever
 * sees it, so a test that fed the DOM name directly was feeding something the
 * running lab never sends. That is how this fixture shipped with four handlers
 * registered for keys that could not arrive: nine tests passing, and a board
 * nobody could move.
 */
const press = (world: World, key: string): void => {
  world.setInput([keyName(key)]);
  world.tick(1 / 60);
  play(world, 0.3);
};

const actor = (world: World, id: string) =>
  [...world.actors].find(one => one.id === id || one.id.endsWith(`:${id}`));

const at = (world: World, id: string) => {
  const p = actor(world, id)!.get(PositionProperty);
  return {
    column: Math.round((p.x - TILE_SIZE / 2) / TILE_SIZE),
    row: Math.round((p.y - TILE_SIZE / 2) / TILE_SIZE),
  };
};

beforeEach(async () => {
  project = await compileProject(projectFiles(WORLD_SCENARIOS.sokoban.source));
}, 30000);

describe('the board', () => {
  it('is built from the map', () => {
    const ids = [...project.world.actors].map(one => one.id);

    // A ring: two full rows of ten, and eight down each side.
    expect(ids.filter(id => id.startsWith('Wall')).length).toBe(36);
    expect(ids.filter(id => id.startsWith('Crate')).length).toBe(2);
    expect(ids.filter(id => id.startsWith('Target')).length).toBe(2);
    expect(at(project.world, 'Player4_4')).toEqual({column: 4, row: 4});
  });
});

describe('stepping', () => {
  it('moves exactly one square, and lands on it', () => {
    // Not "about a square": a board is countable or it is not a board.
    press(project.world, 'ArrowLeft');

    expect(at(project.world, 'Player4_4')).toEqual({column: 3, row: 4});
  });

  it('lands on the square exactly, not near it', () => {
    press(project.world, 'ArrowLeft');
    const p = actor(project.world, 'Player4_4')!.get(PositionProperty);

    expect(p.x).toBeCloseTo(3 * TILE_SIZE + TILE_SIZE / 2, 6);
  });

  it('will not begin a second step while one is running', () => {
    // The guard that stops a held key turning this back into Physics. One
    // frame of input, then a tenth of a second — less than a step — and the
    // actor must still be on its way to the FIRST square.
    project.world.setInput(['ArrowLeft']);
    project.world.tick(1 / 60);
    play(project.world, 0.05, ['ArrowLeft']);
    play(project.world, 0.3);

    expect(at(project.world, 'Player4_4')).toEqual({column: 3, row: 4});
  });

  it('refuses to walk into a wall', () => {
    // Four steps left from column 4 reaches column 1; the wall is column 0.
    for (let i = 0; i < 4; i++) {
      press(project.world, 'ArrowLeft');
    }

    expect(at(project.world, 'Player4_4')).toEqual({column: 1, row: 4});
  });
});

describe('pushing', () => {
  /**
   * Walk the player to (2,2), the square left of the top crate.
   *
   * Left first and THEN up, which is not interchangeable: going up first puts
   * the player on (4,2) and walking left from there pushes the crate left,
   * which is the rule working and not the approach this test wants.
   */
  const standLeftOfCrate = (world: World) => {
    press(world, 'ArrowLeft');
    press(world, 'ArrowLeft');
    press(world, 'ArrowUp');
    press(world, 'ArrowUp');
  };

  it('moves the crate and the player together', () => {
    standLeftOfCrate(project.world);
    expect(at(project.world, 'Player4_4')).toEqual({column: 2, row: 2});

    press(project.world, 'ArrowRight');

    expect(at(project.world, 'Player4_4')).toEqual({column: 3, row: 2});
    expect(at(project.world, 'Crate3_2')).toEqual({column: 4, row: 2});
  });

  it('refuses a push that would put the crate in a wall', () => {
    // Push the top crate right until it reaches the wall at column 9, then
    // once more. Neither may move.
    standLeftOfCrate(project.world);
    for (let i = 0; i < 6; i++) {
      press(project.world, 'ArrowRight');
    }
    expect(at(project.world, 'Crate3_2')).toEqual({column: 8, row: 2});

    press(project.world, 'ArrowRight');

    expect(at(project.world, 'Crate3_2')).toEqual({column: 8, row: 2});
    expect(at(project.world, 'Player4_4')).toEqual({column: 7, row: 2});
  });

  it('does not push a crate through another crate', () => {
    // The bug a project writing this by hand would ship with. Bring the lower
    // crate up under the top one and push again: the near crate must not move,
    // and neither must the far one.
    const world = project.world;
    // Player from (4,4) to (3,7): down three, left one.
    press(world, 'ArrowDown');
    press(world, 'ArrowDown');
    press(world, 'ArrowDown');
    press(world, 'ArrowLeft');
    expect(at(world, 'Player4_4')).toEqual({column: 3, row: 7});

    // Push the lower crate (3,6) up to (3,3) — three pushes.
    press(world, 'ArrowUp');
    press(world, 'ArrowUp');
    press(world, 'ArrowUp');
    expect(at(world, 'Crate3_6')).toEqual({column: 3, row: 3});

    // One more would put it on the top crate at (3,2).
    press(world, 'ArrowUp');

    expect(at(world, 'Crate3_6')).toEqual({column: 3, row: 3});
    expect(at(world, 'Crate3_2')).toEqual({column: 3, row: 2});
  });
});

describe('winning', () => {
  it('says so when the last crate lands on the last mark', () => {
    // The one thing this project writes itself, because "every crate on a
    // target" is the game's idea and no mechanic's. Both crates start three
    // squares left of their marks, so the puzzle is six pushes.
    const world = project.world;
    // `log` emits a plain `console.log`, so that is what is listened to.
    const said: string[] = [];
    const spoke = vi
      .spyOn(console, 'log')
      .mockImplementation(line => said.push(String(line)));

    // Top crate: approach (2,2) from below, then push right three times.
    press(world, 'ArrowLeft');
    press(world, 'ArrowLeft');
    press(world, 'ArrowUp');
    press(world, 'ArrowUp');
    press(world, 'ArrowRight');
    press(world, 'ArrowRight');
    press(world, 'ArrowRight');
    expect(at(world, 'Crate3_2')).toEqual({column: 6, row: 2});
    // One crate home is not a win.
    expect(said).not.toContain('Solved!');

    // Lower crate: down the far column to row 6, then round to (2,6).
    for (const key of [
      'ArrowUp',
      'ArrowLeft',
      'ArrowLeft',
      'ArrowLeft',
      'ArrowLeft',
      'ArrowDown',
      'ArrowDown',
      'ArrowDown',
      'ArrowDown',
      'ArrowDown',
      'ArrowRight',
      'ArrowRight',
      'ArrowRight',
      'ArrowRight',
    ]) {
      press(world, key);
    }

    expect(at(world, 'Crate3_6')).toEqual({column: 6, row: 6});
    expect(said).toContain('Solved!');
    spoke.mockRestore();
  });
});
