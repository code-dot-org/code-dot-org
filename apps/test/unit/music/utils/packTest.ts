import MusicLibrary from '@cdo/apps/music/player/MusicLibrary';
import {findRestrictedPackInSource} from '@cdo/apps/music/utils/pack';

const library = {
  getFolderForSoundId: (id: string) => {
    const folderId = id.substring(0, id.lastIndexOf('/'));
    const folders: {[id: string]: {id: string; restricted?: boolean}} = {
      song: {id: 'song', restricted: true},
      drums: {id: 'drums'},
    };
    return folders[folderId] || null;
  },
} as MusicLibrary;

const sourceWithSounds = (...sounds: string[]) => {
  const [first, ...rest] = sounds.map(sound => ({
    type: 'play_sound',
    fields: {sound},
  }));
  // Later blocks are nested under the first, as Blockly saves a stack.
  const stack = rest.reduceRight(
    (next, block) => ({...block, next: {block: next}}),
    undefined as object | undefined
  );
  return JSON.stringify({
    blocks: {blocks: [{...first, ...(stack && {next: {block: stack}})}]},
  });
};

describe('findRestrictedPackInSource', () => {
  it('finds the restricted pack of a sound anywhere in the code', () => {
    expect(
      findRestrictedPackInSource(
        sourceWithSounds('drums/beat', 'drums/clap', 'song/verse_1'),
        library
      )
    ).toBe('song');
  });

  it('finds nothing when no sound is from a restricted pack', () => {
    expect(
      findRestrictedPackInSource(sourceWithSounds('drums/beat'), library)
    ).toBeUndefined();
  });

  it('finds nothing for a sound whose pack the library does not have', () => {
    expect(
      findRestrictedPackInSource(sourceWithSounds('gone/verse_1'), library)
    ).toBeUndefined();
  });

  it('finds nothing without code, or with code that does not parse', () => {
    expect(findRestrictedPackInSource(undefined, library)).toBeUndefined();
    expect(findRestrictedPackInSource('{not json', library)).toBeUndefined();
  });
});
