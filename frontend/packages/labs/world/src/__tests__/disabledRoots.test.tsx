// A disabled root is not there, as far as the generator is concerned.
//
// The orphan plugins disable a block with a reason and it generates nothing;
// what this pins is the other half, that a disabled DEFINITION does not stop
// the file compiling either. A `define actor` greyed out in a world by the
// misplaced-block plugin has to cost nothing, or the plugin's kindness is a
// project that will not run (`misplacedBlocks`, specs/PASTE.md).

import {describe, expect, it} from 'vitest';

import {MISPLACED} from '../blockly/misplacedBlocks';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

/** The empty scenario's world, with a `define actor` root beside the world. */
const worldHolding = (actor: object) => {
  const source = WORLD_SCENARIOS.empty.source;
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
              {type: 'world_world', fields: {NAME: 'My World'}},
              {type: 'world_actor', fields: {NAME: 'Stray'}, ...actor},
            ],
          },
        }),
      },
    },
  };
};

describe('a define actor in a world file', () => {
  it('is refused while it is enabled', async () => {
    await expect(
      compileProject(projectFiles(worldHolding({}))),
    ).rejects.toThrow(/define actor.*can only be in a \.actor file/);
  });

  it('costs nothing once the plugin has greyed it out', async () => {
    const {world} = await compileProject(
      projectFiles(worldHolding({disabledReasons: [MISPLACED]})),
    );
    expect([...world.actors]).toHaveLength(0);
  });
});
