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
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
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

/**
 * An actor by the name the project gave it.
 *
 * By SUFFIX as well as exactly, because the two tellings of this project name
 * their instances differently and both are right. A `.map` file's entry is
 * `Player`; an arrangement's is `placePlayer:Player`, scoped by the block that
 * placed it, since two arrangements may each place a "Player" and they are not
 * the same one.
 */
const actor = (world: World, name: string) =>
  [...world.actors].find(one => one.id === name || one.id.endsWith(`:${name}`));

const where = (world: World, id: string) =>
  actor(world, id)!.get(PositionProperty);

/**
 * A freshly compiled project, since each test plays it differently.
 *
 * The MODULES come back with it, and must: a property is identified by object
 * identity, and every compile makes its own. Reading a second compile's
 * `TextProperty` off this one's Scoreboard reports "has no property 'text'",
 * which reads exactly like a missing trait and is not one.
 */
const opened = (): Promise<CompiledProject> =>
  compileProject(projectFiles(DEFAULT_PROJECT.source));

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
    const {world} = await opened();
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
    const {world} = await opened();
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

  it('shows the score on the scoreboard as coins are taken', async () => {
    // The longest chain in the starter, and every link is in a different file.
    // Collection raises "collects"; the player's handler turns that into
    // points; Scoring raises "sees the score change" at whoever asked; the
    // scoreboard's handler writes it into the text Writing draws. Five files
    // have to agree, and a break anywhere shows as a board that never changes.
    const {world, modules} = await opened();
    const text = modules['rules/writing'].TextProperty;
    const board = () =>
      actor(world, 'Scoreboard')!.get(text as never) as unknown as string;

    expect(board()).toBe('SCORE 0');

    play(world, 0.5);
    play(world, 2, ['right arrow']);

    // Two coins sit on the floor along the way; the third is above the
    // platform and wants a jump, which is the next test.
    expect(board()).toBe('SCORE 20');
  });

  it('draws the scoreboard, rather than the box that stands for nothing', () => {
    // WHAT THE OTHER TESTS MISSED. They read the text property and found it
    // right, and the scoreboard on screen was a plain green rectangle — which
    // is what the driver paints for an actor with no picture.
    //
    // "Shows Text" has no steps and paints nothing: it declares what an
    // actor's words ARE and leaves the drawing to the actor that elects it
    // (specs/DRAWING.md). So holding the trait is not the same as being drawn,
    // and only the render snapshot can tell them apart.
    const drawn = project.world
      .renderSnapshot()
      .find(state =>
        (state.actor as unknown as {id: string}).id.endsWith('Scoreboard'),
      );

    expect(drawn?.drawing).toBeDefined();
    // …and the coin beside it is drawn the other way, by an animation frame,
    // so this is a real distinction rather than a field everything carries.
    const coin = project.world
      .renderSnapshot()
      .find(state =>
        (state.actor as unknown as {id: string}).id.endsWith('Coin1'),
      );
    expect(coin?.drawing).toBeUndefined();
  });

  it('is winnable — three coins, and a target of exactly three coins', () => {
    // Not a play-through: the third coin needs a jump landed on a moving
    // platform, which is a level design to check rather than a mechanic. What
    // is worth pinning is that the numbers agree — a target of 40 against
    // three ten-point coins is a game that cannot be won, and nothing in the
    // running of it would ever say so.
    const target = project.modules['rules/score'].TargetScoreProperty;
    const coins = [...project.world.actors].filter(one =>
      one.id.startsWith('Coin'),
    ).length;

    expect(project.world.get(target as never)).toBe(coins * 10);
  });

  it('takes a coin by walking into it, and the coin leaves the world', async () => {
    // Four files have to agree for this — the rule being held, the coin
    // electing Can Be Collected, the player electing Collects, and the map
    // putting one where the player will walk. Three of the four failures are
    // silent (constants.test), and this is what silence looks like when run.
    const {world} = await opened();
    const coins = () =>
      [...world.actors].filter(one => one.id.startsWith('Coin')).length;
    const before = coins();

    play(world, 0.5);
    play(world, 2, ['right arrow']);

    expect(before).toBeGreaterThan(1);
    expect(coins()).toBeLessThan(before);
  });
});

describe('the same project, said in one file', () => {
  // `platformer-single` is the starter with its actors and its map moved into
  // `main.world` — a teaching artefact whose whole claim is that it is the
  // SAME game told differently. Nothing checked that claim by running it, and
  // it had already stopped being true: the starter's jump became one block and
  // the fixture kept the four-block version for a whole commit.
  //
  // So this plays it and asks for the same answers. Not the same blocks —
  // the point of the pair is that the blocks differ — but the same game.
  it('plays the same as the starter it was made from', async () => {
    const {world, modules} = await compileProject(
      projectFiles(WORLD_SCENARIOS['platformer-single'].source),
    );
    const text = modules['rules/writing'].TextProperty;
    const board = () =>
      actor(world, 'Scoreboard')!.get(text as never) as unknown as string;

    expect(board()).toBe('SCORE 0');

    play(world, 0.5);
    play(world, 2, ['right arrow']);

    // The two coins on the floor, exactly as in the starter's own telling.
    expect(board()).toBe('SCORE 20');
  });

  it('jumps as high, which is the mechanic most easily left behind', async () => {
    // The drift that happened. A jump written the old way still compiles, is
    // still a jump, and clears a different height — so "it has five handlers"
    // passed while the two tellings had stopped agreeing.
    const {world} = await compileProject(
      projectFiles(WORLD_SCENARIOS['platformer-single'].source),
    );
    play(world, 0.8);
    const floorLevel = where(world, 'Player').y;

    let peak = floorLevel;
    for (let frame = 0; frame < 60; frame++) {
      world.setInput(['space']);
      world.tick(1 / 60);
      peak = Math.min(peak, where(world, 'Player').y);
    }

    expect(floorLevel - peak).toBeGreaterThan(3 * TILE_SIZE);
  });

  it('draws its scoreboard, now that a world may describe a picture', async () => {
    // The point of giving `define drawing` a second shape. A world-defined
    // actor with words and no picture is painted as a plain box, and this
    // scenario shipped exactly that — a green rectangle where a score goes.
    //
    // The drawing is a ROW inside `define actor` here rather than a root
    // beside the world, which is also how it says whose picture it is: a local
    // actor's body generates inside a block where `actor` is that builder.
    const {world} = await compileProject(
      projectFiles(WORLD_SCENARIOS['platformer-single'].source),
    );
    const drawn = world
      .renderSnapshot()
      .find(state =>
        (state.actor as unknown as {id: string}).id.endsWith('Scoreboard'),
      );

    expect(drawn?.drawing).toBeDefined();
  });
});
