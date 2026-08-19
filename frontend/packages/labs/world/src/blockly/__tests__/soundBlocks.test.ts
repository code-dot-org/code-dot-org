// `play sound` and `set music to` (specs/SOUND.md).
//
// Two blocks that look alike and mean opposite things: one is a MOMENT and the
// other is STATE. What these pin is the place that difference shows in the
// generated code — what each does when its dropdown says nothing.

import {beforeEach, describe, expect, it} from 'vitest';

import {IMPORT_SOUND_VALUE} from '../../sound/soundImport';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {setProjectSounds, soundImportOptions} from '../moduleOptions';

const emit = (type: string, sound: string): string => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type);
  if (!definition) {
    throw new Error(`no domain block '${type}'`);
  }
  const code = definition.generator.javascript(
    {getFieldValue: (name: string) => (name === 'SOUND' ? sound : '')} as never,
    {} as never,
    {} as never,
  );
  return (Array.isArray(code) ? code[0] : code) as string;
};

describe('the SOUND dropdown', () => {
  beforeEach(() => setProjectSounds([]));

  it('offers what the project holds, and a way to get more', () => {
    setProjectSounds([['coin', 'coin.mp3']]);

    expect(soundImportOptions()).toEqual([
      ['coin', 'coin.mp3'],
      ['(import…)', IMPORT_SOUND_VALUE],
    ]);
  });

  it('says "(none)" rather than making the import row the fallback', () => {
    // A saved block whose file was deleted falls back to the FIRST option, so
    // an import row in that position would turn a missing sound into a dialog
    // opening itself.
    expect(soundImportOptions()[0]).toEqual(['(none)', '']);
  });
});

describe('play sound', () => {
  it('queues the sound on the world', () => {
    expect(emit('world_play_sound', 'coin.mp3')).toBe(
      'world.playSound("coin.mp3");\n',
    );
  });

  it('emits nothing when it names nothing', () => {
    // "(none)" is an unfinished block here — there is no such thing as playing
    // silence once — so it is inert rather than `world.playSound()`.
    expect(emit('world_play_sound', '')).toBe('');
  });

  it('emits nothing for the import row', () => {
    // The row is a request, not a value; the field rejects it and the generator
    // must not write it out in the moment before that lands.
    expect(emit('world_play_sound', IMPORT_SOUND_VALUE)).toBe('');
  });
});

describe('set music to', () => {
  it('sets the track on the world', () => {
    expect(emit('world_set_music', 'chaseLoop.mp3')).toBe(
      'world.setMusic("chaseLoop.mp3");\n',
    );
  });

  it('stops the music on "(none)"', () => {
    // The difference from `play sound`, and the reason there is no `stop music`
    // block: silence is a value a learner means, so the empty dropdown is a
    // finished sentence rather than an unfinished one.
    expect(emit('world_set_music', '')).toBe('world.setMusic(undefined);\n');
  });

  it('emits nothing for the import row', () => {
    expect(emit('world_set_music', IMPORT_SOUND_VALUE)).toBe('');
  });
});

describe('the toolbox', () => {
  it('gives sound a category of its own', async () => {
    // Not tucked under Appearance: what a game sounds like is not what it looks
    // like, and a learner looking for "play sound" looks for a word.
    const {DOMAIN_TOOLBOX} = await import('../domainBlocks');
    // `Toolbox` is Blockly's own shape; the lab builds it from an array of
    // categories, which is what `domainBlocks.test` reads it back as too.
    const categories = DOMAIN_TOOLBOX as Array<{
      name?: string;
      blocks?: string[];
    }>;
    const category = categories.find(entry => entry.name === 'Sound');

    expect(category?.blocks).toEqual(['world_play_sound', 'world_set_music']);
  });
});
