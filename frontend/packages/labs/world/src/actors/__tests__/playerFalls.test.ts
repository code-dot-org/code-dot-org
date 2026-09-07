// The imported Player and Ground, PLAYED.
//
// The pair is the first stock actors whose worth is a behavior rather than a
// picture, and every way of getting the shelf entry wrong looks fine standing
// still. A Player missing Jumping still compiles and still walks; a Ground
// missing Gravity still draws and still sits there. What separates a working
// import from a broken one is what happens on the second frame.
//
// So this drops one on the other. Real files, real generator, real ticks — and
// it is a `stock actor` test rather than a fixture test because what is under
// test is the SHELF ENTRY: whether asking for a Player brings the five rules a
// Player turns out to need.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../engine';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const player = stockActorById('player')!;
const ground = stockActorById('ground')!;

/** `add actor ⟨path⟩`, put at one place. */
const place = (path: string, x: number, y: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: path},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {block: {type: 'math_number', fields: {NUM: x}}},
          Y: {block: {type: 'math_number', fields: {NUM: y}}},
        },
      },
    },
  },
});

/** The empty scenario with both actors imported, and a world that places them. */
const platformer = () => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, player).source;
  source = importStockActor(source, ground).source;
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  return {
    ...source,
    files: {
      ...source.files,
      [world.id]: {
        ...world,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'My World'},
                next: {
                  block: {
                    ...place('actors/ground', 160, 300),
                    next: {block: place('actors/player', 160, 100)},
                  },
                },
              },
            ],
          },
        }),
      },
    },
  };
};

/**
 * The actor that started at `y`.
 *
 * An actor's id is generated, not its file's name, so the two are told apart by
 * where the world put them — 100 for the player, 300 for the tile. The object
 * is stable across ticks, so this is called once and the reference kept.
 */
const startingAt = (world: World, y: number) =>
  [...world.actors].find(actor => actor.get(PositionProperty).y === y)!;

/** Tick for `seconds` at sixty frames a second. */
const play = (world: World, seconds: number) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

// Imported ON ITS OWN, which is the only way its own `requires` are tested: a
// Player brings Gravity too (through Jumping), so a Ground in the same project
// as a Player would hold things up whether or not its shelf entry asked for it.
describe('an imported Ground, with no Player to bring Gravity', () => {
  it('carries both the traits its file elects', async () => {
    let source = WORLD_SCENARIOS.empty.source;
    source = importStockActor(source, ground).source;
    const file = Object.values(source.files).find(
      one => one.name === 'main.world',
    )!;
    const placed = {
      ...source,
      files: {
        ...source.files,
        [file.id]: {
          ...file,
          contents: JSON.stringify({
            blocks: {
              blocks: [
                {
                  type: 'world_world',
                  x: 20,
                  y: 20,
                  fields: {NAME: 'My World'},
                  next: {block: place('actors/ground', 160, 300)},
                },
              ],
            },
          }),
        },
      },
    };

    const {world, modules} = await compileProject(projectFiles(placed));
    const gravity = modules['rules/gravity'] as unknown as {
      ActsAsGroundTrait: unknown;
    };
    const solid = modules['rules/solid'] as unknown as {SolidTrait: unknown};
    const tile = [...world.actors][0];

    expect(tile.has(gravity.ActsAsGroundTrait as never)).toBe(true);
    expect(tile.has(solid.SolidTrait as never)).toBe(true);
  });
});

describe('an imported Player, on an imported Ground', () => {
  it('falls', async () => {
    const {world} = await compileProject(projectFiles(platformer()));
    const player = startingAt(world, 100);

    play(world, 0.2);

    // The whole of what "Jumps requires Affected by Gravity" buys: the shelf
    // entry never names Gravity, and the Player is pulled down anyway.
    expect(player.get(PositionProperty).y).toBeGreaterThan(100);
  });

  it('stops when it reaches the ground, rather than falling through it', async () => {
    const {world} = await compileProject(projectFiles(platformer()));
    const player = startingAt(world, 100);

    play(world, 3);
    const landed = player.get(PositionProperty).y;
    play(world, 3);

    // Two checks in one: it came to rest, and it came to rest ABOVE the tile
    // rather than inside it. A Ground that arrived without Gravity's trait
    // catches nothing, and the player is somewhere far below by now.
    expect(player.get(PositionProperty).y).toBeCloseTo(landed, 3);
    expect(landed).toBeLessThan(300);
  });
});
