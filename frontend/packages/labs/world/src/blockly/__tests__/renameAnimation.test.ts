// Renaming an animation carries to everything that plays it.
//
// An id is the only handle a block has on an animation — no reference records
// which `.anim` it came from — so renaming one is an edit to every workspace in
// the project. Checked here: every play follows, and nothing that merely says
// the same word does.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {DEFAULT_PROJECT} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {
  animationIdOwners,
  renameAnimationInSource,
  renameAnimationReferences,
} from '../renameAnimation';

const workspace = (...blocks: unknown[]) =>
  JSON.stringify({blocks: {blocks}}, null, 2);

const renamed = (contents: string, from = 'coinSpin', to = 'spin') =>
  JSON.parse(renameAnimationReferences(contents, from, to) ?? contents) as {
    blocks: {blocks: Array<Record<string, never>>};
  };

describe('renameAnimationReferences', () => {
  it('renames what a block plays', () => {
    const [play] = renamed(
      workspace({
        type: 'world_play_animation',
        fields: {ANIMATION: 'coinSpin'},
      }),
    ).blocks.blocks;
    expect(play.fields).toEqual({ANIMATION: 'spin'});
  });

  it('renames an animation named anywhere a block names one', () => {
    // The appearance trait's animation parameter is a different block with the
    // same field; what makes a reference is the field, not the block.
    const [use] = renamed(
      workspace({
        type: 'world_use_trait',
        fields: {TRAIT: 'Appearance#HasAppearanceTrait', ANIMATION: 'coinSpin'},
      }),
    ).blocks.blocks;
    expect(use.fields).toEqual({
      TRAIT: 'Appearance#HasAppearanceTrait',
      ANIMATION: 'spin',
    });
  });

  it('reaches a play nested in an input, a next, and a mutator', () => {
    const play = {
      type: 'world_play_animation',
      fields: {ANIMATION: 'coinSpin'},
    };
    const {blocks} = renamed(
      workspace({
        type: 'world_on_start',
        inputs: {DO: {block: {...play, next: {block: {...play}}}}},
        extraState: {saved: {...play}},
      }),
    );
    expect(JSON.stringify(blocks).match(/"spin"/g)).toHaveLength(3);
    expect(JSON.stringify(blocks)).not.toContain('coinSpin');
  });

  it('leaves a word that is not a reference alone', () => {
    const before = workspace(
      // A message, a sprite's file name, and an actor that shares the name.
      {type: 'world_log', fields: {MESSAGE: 'coinSpin'}},
      {type: 'world_set_sprite', fields: {SPRITE: 'coinSpin.png'}},
      {type: 'world_actor', fields: {NAME: 'coinSpin'}},
    );
    expect(
      renameAnimationReferences(before, 'coinSpin', 'spin'),
    ).toBeUndefined();
  });

  it('leaves a file it cannot parse exactly as it is', () => {
    expect(
      renameAnimationReferences('{"blocks":', 'coinSpin', 'spin'),
    ).toBeUndefined();
  });
});

describe('renameAnimationInSource', () => {
  it('carries through the starter project, and only through workspaces', () => {
    const source = DEFAULT_PROJECT.source;
    const before = projectFiles(source);
    // The player's actor plays "playerBob" (constants.ts).
    expect(JSON.stringify(before)).toContain('playerBob');

    const after = projectFiles(
      renameAnimationInSource(source, 'playerBob', 'bob'),
    );

    expect(after['actors/player.actor']).toContain('"ANIMATION": "bob"');
    expect(after['actors/player.actor']).not.toContain('playerBob');
    // The `.anim` that DEFINES it is not a workspace: the editor rekeys that
    // itself, in the same write.
    expect(after['animations/game.anim']).toBe(before['animations/game.anim']);
  });

  it('returns the same project when nothing plays it', () => {
    const source = DEFAULT_PROJECT.source;
    expect(renameAnimationInSource(source, 'nobodyPlaysThis', 'x')).toBe(
      source,
    );
  });
});

describe('animationIdOwners', () => {
  const source: MultiFileSource = DEFAULT_PROJECT.source;

  it('says which file defines each id', () => {
    const owners = animationIdOwners(projectFiles(source));
    expect(owners.playerBob).toEqual(['animations/game.anim']);
    expect(owners.coinSpin).toEqual(['animations/coinSpin.anim']);
  });

  it('names both files when two define one id', () => {
    const both = {
      'animations/a.anim': JSON.stringify({
        type: 'animation',
        animations: {spin: {frames: []}},
      }),
      'animations/b.anim': JSON.stringify({
        type: 'animation',
        animations: {spin: {frames: []}},
      }),
    };
    expect(animationIdOwners(both).spin).toEqual([
      'animations/a.anim',
      'animations/b.anim',
    ]);
  });

  it('ignores a file that is mid-edit or not an animation', () => {
    expect(
      animationIdOwners({
        'animations/broken.anim': '{"type": "animation", "animatio',
        'animations/other.anim': JSON.stringify({type: 'effect'}),
        'worlds/main.world': JSON.stringify({blocks: {}}),
      }),
    ).toEqual({});
  });
});
