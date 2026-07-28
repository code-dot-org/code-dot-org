import {describe, expect, it} from 'vitest';

import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectWorldOptions,
} from '../projectModules';

const FILES = {
  'scenes/main.scene': '{}',
  'worlds/platform.world': JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_world', fields: {ID: 'platform', NAME: 'Platform World'}},
      ],
    },
  }),
  'actors/player.actor': JSON.stringify({
    blocks: {
      blocks: [{type: 'world_actor', fields: {ID: 'player', NAME: 'Player'}}],
    },
  }),
  'actors/ground.js': `export default new ActorBuilder({id: 'ground', name: 'Ground'});`,
  'actors/blob.js': `export default 42;`, // no builder → basename fallback
  'animations/game.json': '{"type":"animation"}',
};

describe('projectModules', () => {
  it('labels actors by authored name, value = extension-less path', () => {
    expect(projectActorOptions(FILES).sort()).toEqual([
      ['Blob', 'actors/blob'], // fallback: Title-cased basename
      ['Ground', 'actors/ground'], // from the JS builder `name`
      ['Player', 'actors/player'], // from the Blockly NAME field
    ]);
  });

  it('labels a world by its authored name, not the file stem', () => {
    // File is `platform` but the world calls itself "Platform World".
    expect(projectWorldOptions(FILES)).toEqual([
      ['Platform World', 'worlds/platform'],
    ]);
  });

  it('lists animation files under animations/ as extension-less paths', () => {
    expect(projectAnimationFileOptions(FILES)).toEqual([
      ['Game', 'animations/game'],
    ]);
  });

  it('ignores non-code files and other directories', () => {
    const paths = projectActorOptions(FILES).map(([, path]) => path);
    expect(paths).not.toContain('animations/game');
    expect(paths).not.toContain('scenes/main');
  });
});
