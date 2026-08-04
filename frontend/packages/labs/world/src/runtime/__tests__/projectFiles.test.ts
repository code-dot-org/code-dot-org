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
      'animations/coinSpin.anim',
      'animations/game.anim',
      'effects/ripple.effect',
      'maps/level1.map',
      'rules/animation.js',
      'rules/arrows.rule',
      'rules/collisions.rule',
      'rules/gravity.rule',
      'rules/input.rule',
      'rules/motion.rule',
      'rules/solid.rule',
      // The images themselves are bytes on a `url`, so they are not here; the
      // `.sheet` saying how to cut one of them up is text, so it is.
      'sprites/coinSpin.sheet',
      'worlds/main.world',
    ]);
    // The world is a Blockly workspace (generated to a WorldBuilder at compile).
    expect(files['worlds/main.world']).toContain('world_load_map');
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
