import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {DEFAULT_PROJECT} from '../../constants';
import {fileIdAt, projectFiles} from '../projectFiles';

describe('projectFiles', () => {
  it('flattens the default project to folder-prefixed paths', () => {
    const files = projectFiles(DEFAULT_PROJECT.source);
    expect(Object.keys(files).sort()).toEqual([
      'actors/ball.actor',
      'actors/coin.actor',
      'actors/crawler.actor',
      'actors/ground.actor',
      'actors/player.actor',
      'actors/scoreboard.actor',
      'animations/coinSpin.anim',
      'animations/game.anim',
      'effects/ripple.effect',
      'maps/level1.map',
      'rules/arrows.rule',
      'rules/collect.rule',
      'rules/collisions.rule',
      'rules/gravity.rule',
      'rules/health.rule',
      'rules/input.rule',
      'rules/jump.rule',
      'rules/motion.rule',
      'rules/patrol.rule',
      'rules/score.rule',
      'rules/solid.rule',
      'rules/writing.rule',
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

describe('fileIdAt', () => {
  it('finds the entry world, which is the file that must stay open', () => {
    // What pins the tab when a level hides the file browser (layout/
    // WorldLayout): every other file is reachable from a block that names it,
    // but the world is what those blocks are IN.
    const id = fileIdAt(DEFAULT_PROJECT.source, 'worlds/main.world');
    expect(id).toBeDefined();
    expect(DEFAULT_PROJECT.source.files[id!].name).toBe('main.world');
  });

  it('is undefined for a path the project does not have', () => {
    // The caller pins nothing rather than pinning the wrong thing — a project
    // whose entry world has been renamed is not a project to guess about.
    expect(
      fileIdAt(DEFAULT_PROJECT.source, 'worlds/nope.world'),
    ).toBeUndefined();
    expect(fileIdAt(undefined, 'worlds/main.world')).toBeUndefined();
  });
});
