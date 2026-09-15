// The Shot, built: it is a file that wears four traits from four rules, and
// an import that dropped one of them would compile perfectly and be a square
// that does nothing (AGENTS.md, "Adding a stock actor").

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

/** The empty scenario with a Shot imported and one line placing it. */
const withAShotInIt = () => {
  const {source} = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('shot')!,
  );
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
                fields: {NAME: 'My World'},
                next: {
                  block: {
                    type: 'world_add_actor',
                    fields: {ACTOR: 'actors/shot'},
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

describe('a Shot imported into a project that had none', () => {
  it('builds an actor that moves, collides, hurts and expires', async () => {
    const {world, modules} = await compileProject(
      projectFiles(withAShotInIt()),
    );
    const trait = (rule: string, name: string) =>
      (modules[rule] as Record<string, unknown>)[name] as never;
    const [shot] = [...world.actors];

    expect(shot).toBeDefined();
    expect(shot.has(trait('rules/motion', 'CanMoveTrait'))).toBe(true);
    expect(shot.has(trait('rules/collisions', 'CanCollideTrait'))).toBe(true);
    expect(shot.has(trait('rules/health', 'DealsDamageTrait'))).toBe(true);
    expect(shot.has(trait('rules/expires', 'ExpiresTrait'))).toBe(true);
  });

  it('goes away on its own', async () => {
    const {world} = await compileProject(projectFiles(withAShotInIt()));
    expect([...world.actors]).toHaveLength(1);

    for (let frame = 0; frame < 60 * 4; frame++) {
      world.tick(1 / 60);
    }
    expect([...world.actors]).toHaveLength(0);
  });
});
