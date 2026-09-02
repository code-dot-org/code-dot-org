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

  it('names what is missing rather than making the import row the fallback', () => {
    // A saved block whose file was deleted falls back to the FIRST option, so
    // an import row in that position would turn a missing sound into a dialog
    // opening itself. The words are "(no sounds yet)" and not "(none)",
    // because silence was not chosen — there is simply nothing in `sounds/`.
    expect(soundImportOptions()[0]).toEqual(['(no sounds yet)', '']);
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

  it('emits nothing when it names nothing', () => {
    // It used to silence the world here, on the reading that an empty dropdown
    // meant "(none)" and "(none)" meant stop. Two things were wrong with that:
    // the row only ever appeared in a project with no sounds at all, so nobody
    // could pick it; and a saved block whose track had been deleted stopped the
    // music instead of doing nothing. Silence is `stop music` now, and this is
    // an unfinished block like every other.
    expect(emit('world_set_music', '')).toBe('');
  });

  it('does not offer a row for stopping', () => {
    // The menu is the project's tracks and a way to get more. What is not in it
    // is a way to stop, which is a block.
    setProjectSounds([['theme', 'theme.mp3']]);
    expect(soundImportOptions()).toEqual([
      ['theme', 'theme.mp3'],
      ['(import…)', IMPORT_SOUND_VALUE],
    ]);
  });
});

describe('stop music', () => {
  it('sets the track to nothing', () => {
    // The same call `set music to ⟨…⟩` makes with no track: one method on the
    // world, two sentences in the palette (`World.setMusic`).
    expect(emit('world_stop_music', '')).toBe('world.setMusic(undefined);\n');
  });
});

describe('stop all sounds', () => {
  it('raises the cue that silences everything', () => {
    // Through the QUEUE, so a tick keeps its order — the engine's half of this
    // is `World.stopSounds` and the driver's is `SoundChannel.sync`.
    expect(emit('world_stop_all_sounds', '')).toBe('world.stopSounds();\n');
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

    // Four: the two that make a noise, and the two that stop one — `stop
    // music` leaves the effects playing and `stop all sounds` does not.
    expect(category?.blocks).toEqual([
      'world_play_sound',
      'world_set_music',
      'world_stop_music',
      'world_stop_all_sounds',
    ]);
  });
});
