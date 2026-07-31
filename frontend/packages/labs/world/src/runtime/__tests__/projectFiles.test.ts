import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../projectFiles';

describe('projectFiles', () => {
  it('flattens the default project to folder-prefixed paths', () => {
    const files = projectFiles(DEFAULT_PROJECT.source);
    expect(Object.keys(files).sort()).toEqual([
      'actors/ball.js',
      'actors/coin.js',
      'actors/ground.js',
      'actors/player.actor',
      'animations/game.anim',
      'effects/ripple.effect',
      'maps/level1.map',
      'rules/animation.js',
      'rules/gravity.js',
      'rules/input.js',
      'scenes/main.scene',
      'worlds/platform.world',
    ]);
    // The scene is a Blockly workspace (generated to a SceneBuilder at compile).
    expect(files['scenes/main.scene']).toContain('world_load_map');
  });

  it('nests through multiple folder levels', () => {
    const source: MultiFileSource = {
      files: {
        f: {
          id: 'f',
          name: 'deep.js',
          language: 'javascript',
          contents: 'x',
          folderId: 'inner',
        },
      },
      folders: {
        outer: {id: 'outer', name: 'a', parentId: '0'},
        inner: {id: 'inner', name: 'b', parentId: 'outer'},
      },
      openFiles: [],
    };
    expect(projectFiles(source)).toEqual({'a/b/deep.js': 'x'});
  });

  it('returns an empty map for undefined source', () => {
    expect(projectFiles(undefined)).toEqual({});
  });
});
