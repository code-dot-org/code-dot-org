// The starter project, PLAYED — not read.
//
// Everything else that checks the shipped project is structural.
// `shippedBlocks` proves every block it names exists; `constants.test` proves
// the files that have to agree do. Neither would notice a starter that
// compiles perfectly and is not a game: a player who cannot reach the platform
// its own coin sits on, a coin that never disappears, a floor that is not
// solid.
//
// The Jumping rule is why this exists. It shipped with a default strength
// aimed at a platform 96 pixels above the floor, and the player would have
// landed under the ledge every time with nothing in the console to say why.
// That was caught by hand, on paper — and the paper was wrong too: v²/2g says
// the jump rises 89 pixels, and running it says 85.6, because sixty discrete
// steps do not integrate a parabola exactly. Both are short of 96, so the
// conclusion held; the margin did not.
//
// Which is the argument for this file in one line. Arithmetic about a
// simulation is not the simulation.
//
// It runs the REAL files, through the real headless generator, in dependency
// order (`support/compileProject`), so what is asserted here is the project a
// learner opens rather than a reconstruction of it.

import {beforeAll, describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../constants';
import {PositionProperty, type World} from '../engine';
import {projectFiles} from '../runtime/projectFiles';
import {TILE_SIZE} from '../runtime/viewport';

import {compileProject, type CompiledProject} from './support/compileProject';

let project: CompiledProject;

/** Tick for `seconds` at sixty frames a second, holding `keys` throughout. */
const play = (world: World, seconds: number, keys: string[] = []): void => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys);
    world.tick(1 / 60);
  }
};

const actor = (world: World, id: string) =>
  [...world.actors].find(one => one.id === id);

const where = (world: World, id: string) =>
  actor(world, id)!.get(PositionProperty);

/** A fresh world, since each test plays it differently. */
const opened = async (): Promise<World> =>
  (await compileProject(projectFiles(DEFAULT_PROJECT.source))).world;

beforeAll(async () => {
  project = await compileProject(projectFiles(DEFAULT_PROJECT.source));
}, 30000);

describe('the project a learner opens', () => {
  it('builds a world with its map in it', () => {
    // The guard on every other test here: `load map` emits its
    // `world.define` lines from a registry, and a registry nobody populated
    // yields a world that builds cleanly with nothing in it.
    const ids = [...project.world.actors].map(one => one.id);

    expect(ids).toContain('Player');
    expect(ids).toContain('Coin1');
    expect(ids.filter(id => id.startsWith('Floor')).length).toBeGreaterThan(5);
  });

  it('stands the player on the floor rather than dropping it through', () => {
    // Gravity, Solid Bodies and Collisions all have to be in play, and the
    // floor has to elect two traits. Any one missing and the player falls
    // forever — which looks like physics being broken and is a wiring bug.
    const world = project.world;
    const started = where(world, 'Player').y;

    play(world, 1.5);

    const rested = where(world, 'Player').y;
    expect(rested).toBeGreaterThan(started);
    play(world, 0.5);
    expect(where(world, 'Player').y).toBeCloseTo(rested, 0);
  });

  it('walks right while the right arrow is held', async () => {
    const world = await opened();
    play(world, 0.6);
    const from = where(world, 'Player').x;

    play(world, 0.8, ['right arrow']);

    expect(where(world, 'Player').x).toBeGreaterThan(from + 30);
  });

  it('jumps high enough to land on its own platform', async () => {
    // THE ONE THIS FILE WAS WRITTEN FOR. The platform is three tiles above the
    // floor and the third coin sits above that, so a jump that falls short
    // makes a third of the starter's content unreachable — silently.
    //
    // Verified to have teeth: put the old default of 4 back and this reports
    // "expected 85.58 to be greater than 96".
    const world = await opened();
    play(world, 0.8);
    const floorLevel = where(world, 'Player').y;

    let peak = floorLevel;
    for (let frame = 0; frame < 60; frame++) {
      // Held, so the press is seen; the rule is what refuses the repeats.
      world.setInput(['space']);
      world.tick(1 / 60);
      peak = Math.min(peak, where(world, 'Player').y);
    }

    expect(floorLevel - peak).toBeGreaterThan(3 * TILE_SIZE);
  });

  it('takes a coin by walking into it, and the coin leaves the world', async () => {
    // Four files have to agree for this — the rule being held, the coin
    // electing Can Be Collected, the player electing Collects, and the map
    // putting one where the player will walk. Three of the four failures are
    // silent (constants.test), and this is what silence looks like when run.
    const world = await opened();
    const coins = () =>
      [...world.actors].filter(one => one.id.startsWith('Coin')).length;
    const before = coins();

    play(world, 0.5);
    play(world, 2, ['right arrow']);

    expect(before).toBeGreaterThan(1);
    expect(coins()).toBeLessThan(before);
  });
});
