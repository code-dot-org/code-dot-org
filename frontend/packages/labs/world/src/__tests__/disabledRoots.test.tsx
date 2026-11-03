// A disabled root is not there, as far as the generator is concerned.
//
// The orphan plugins disable a block with a reason and it generates nothing;
// what this pins is the other half, that a disabled DEFINITION does not stop
// the file compiling either. A `define actor` greyed out in a screen by the
// misplaced-block plugin has to cost nothing, or the plugin's kindness is a
// project that will not run (`misplacedBlocks`, specs/PASTE.md).

import {describe, expect, it} from 'vitest';

import {MISPLACED} from '../blockly/misplacedBlocks';
import {EMPTY_APP_PROJECT} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';
import {levelScreen} from './support/levelScreen';

/** The empty app's Main Screen, with a `define actor` root in its code. */
const screenHolding = (actor: object) => {
  const source = EMPTY_APP_PROJECT;
  const screen = Object.values(source.files).find(
    file => file.name === 'main.screen',
  )!;
  return {
    ...source,
    files: {
      ...source.files,
      [screen.id]: {
        ...screen,
        contents: levelScreen({
          blocks: {
            blocks: [
              {type: 'world_on_screen_loads'},
              {type: 'world_actor', fields: {NAME: 'Stray'}, ...actor},
            ],
          },
        }),
      },
    },
  };
};

describe('a define actor in a screen file', () => {
  it('is refused while it is enabled', async () => {
    await expect(
      compileProject(projectFiles(screenHolding({}))),
    ).rejects.toThrow(/define actor.*can only be in a \.actor file/);
  });

  it('costs nothing once the plugin has greyed it out', async () => {
    const {world} = await compileProject(
      projectFiles(screenHolding({disabledReasons: [MISPLACED]})),
    );
    expect([...world.actors]).toHaveLength(0);
  });
});
