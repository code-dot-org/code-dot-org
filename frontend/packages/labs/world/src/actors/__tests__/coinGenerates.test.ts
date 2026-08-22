// The imported Coin, COMPILED AND BUILT — the test the aggregate exists for.
//
// Every claim `importStockActor` makes is about references: a `use trait` row
// naming a trait, a `play animation` row naming an animation, an animation
// naming a strip. All three fail quietly, which is why counting the seven files
// the importer wrote is not enough — that says it ran, not that the pieces fit.
//
// COMPILING IS NOT THE CHECK EITHER, though it reads well as one. The generator
// mints a stand-in for any block type nothing defines any more, deliberately,
// so that a project with one deleted rule still opens instead of dying whole
// (see `compileProject`'s `blocklyFiles`). A Coin whose rule never arrived
// therefore compiles perfectly well and does nothing. Verified by deleting
// `requires` from the shelf entry and watching the build still succeed.
//
// So the check is what the BUILT actor turns out to be: it must carry the trait
// the rule declares. That is false when the rule did not come, and no amount of
// stand-in minting makes it true.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const coin = stockActorById('coin')!;

/**
 * The empty scenario — one world, no rules, no pictures, which is what a
 * learner starting from scratch sees — with a Coin imported into it and one
 * line added to the world to place it.
 *
 * THE WORLD HAS TO PLACE IT. A generator only reaches the modules a world
 * names, so a project that merely contains `coin.actor` never compiles the
 * file at all.
 */
const withACoinInIt = () => {
  const {source} = importStockActor(WORLD_SCENARIOS.empty.source, coin);
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
                    type: 'world_add_actor',
                    fields: {ACTOR: 'actors/coin'},
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

describe('a Coin imported into a project that had none', () => {
  it('builds an actor that can actually be collected', async () => {
    const {world, modules} = await compileProject(
      projectFiles(withACoinInIt()),
    );
    const collect = modules['rules/collect'] as unknown as {
      CanBeCollectedTrait: unknown;
    };
    const built = [...world.actors];

    expect(built).toHaveLength(1);
    expect(built[0].has(collect.CanBeCollectedTrait as never)).toBe(true);
  });

  it('holds the animation module its `play animation` row names', async () => {
    const {modules} = await compileProject(projectFiles(withACoinInIt()));

    // The row stores an id; this is the file behind it. The two are checked
    // against each other in `importStockActor.test.ts` — an animation's key
    // inside its file is not always the file's stem.
    expect(modules['animations/coinSpin']).toBeDefined();
    expect(modules['sprites/coinSpin']).toBeDefined();
  });

  it('brings rules the empty project had none of', async () => {
    const {modules} = await compileProject(projectFiles(withACoinInIt()));

    // Collection, the Collisions it requires, and the Motion that requires.
    expect(Object.keys(modules)).toEqual(
      expect.arrayContaining([
        'rules/collect',
        'rules/collisions',
        'rules/motion',
      ]),
    );
  });
});
