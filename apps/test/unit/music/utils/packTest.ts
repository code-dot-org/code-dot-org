import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';
import {
  findRestrictedPacksInSource,
  getPackIdForSources,
} from '@cdo/apps/music/utils/pack';

const pack = (id: string, restricted: boolean, src: string) => ({
  id,
  name: id,
  path: id,
  imageSrc: '',
  restricted,
  sounds: [{name: src, src, length: 1, type: 'beat'}],
});

const library = new MusicLibrary('test', {
  id: 'test',
  name: 'test',
  imageSrc: '',
  path: 'test',
  packs: [
    pack('song', true, 'verse'),
    pack('song2', true, 'chorus'),
    pack('default', true, 'preview'),
    pack('drums', false, 'beat'),
  ],
  instruments: [],
  kits: [],
} as unknown as LibraryJson);

const playSound = (sound: unknown, rest: object = {}) => ({
  type: 'play_sound_at_current_location_simple2',
  fields: {sound},
  ...rest,
});

const sourceWithBlocks = (...blocks: object[]) =>
  JSON.stringify({blocks: {languageVersion: 0, blocks}});

const packsIn = (...blocks: object[]) =>
  findRestrictedPacksInSource(sourceWithBlocks(...blocks), library);

describe('findRestrictedPacksInSource', () => {
  it('finds the pack of a sound further down a stack of blocks', () => {
    expect(
      packsIn({
        type: 'when_run_simple2',
        next: {
          block: playSound('drums/beat', {
            next: {block: playSound('song/verse')},
          }),
        },
      })
    ).toEqual(['song']);
  });

  it('finds the pack of a sound inside a function or a shadow block', () => {
    expect(
      packsIn({
        type: 'procedures_defnoreturn',
        inputs: {STACK: {block: playSound('song/verse')}},
      })
    ).toEqual(['song']);
    expect(
      packsIn({
        type: 'play_sound',
        inputs: {
          sound: {
            shadow: {type: 'value_sample', fields: {sound: 'song/verse'}},
          },
        },
      })
    ).toEqual(['song']);
  });

  it('finds the pack of a sound in a second top-level block', () => {
    expect(
      packsIn({type: 'when_run_simple2'}, playSound('song/verse'))
    ).toEqual(['song']);
  });

  it('lists each restricted pack once, in the order found', () => {
    expect(
      packsIn(
        playSound('song2/chorus'),
        playSound('song/verse'),
        playSound('song2/chorus')
      )
    ).toEqual(['song2', 'song']);
  });

  it('leaves out packs that are not restricted, and the default pack', () => {
    expect(
      packsIn(playSound('drums/beat'), playSound('default/preview'))
    ).toEqual([]);
  });

  it('leaves out sounds the library does not have', () => {
    expect(
      packsIn(playSound('gone/verse'), playSound('verse'), playSound(7))
    ).toEqual([]);
  });

  it('finds nothing without code, or with code that is not a workspace', () => {
    for (const source of [
      undefined,
      '',
      '{not json',
      'null',
      '5',
      '"x"',
      '[]',
    ]) {
      expect(findRestrictedPacksInSource(source, library)).toEqual([]);
    }
  });
});

describe('getPackIdForSources', () => {
  const savedPack = (packId: string) => ({music: {packId}});

  it('uses the pack of the sounds in the code when no pack is saved', () => {
    expect(
      getPackIdForSources(
        {source: sourceWithBlocks(playSound('song/verse'))},
        library
      )
    ).toBe('song');
  });

  it('uses the pack of the sounds in the code when the saved pack is another', () => {
    expect(
      getPackIdForSources(
        {
          source: sourceWithBlocks(playSound('song/verse')),
          labConfig: savedPack('song2'),
        },
        library
      )
    ).toBe('song');
  });

  it('keeps the saved pack when some of the sounds in the code are from it', () => {
    expect(
      getPackIdForSources(
        {
          source: sourceWithBlocks(
            playSound('song/verse'),
            playSound('song2/chorus')
          ),
          labConfig: savedPack('song2'),
        },
        library
      )
    ).toBe('song2');
  });

  it('uses the saved pack when the code has no sound from a restricted pack', () => {
    expect(
      getPackIdForSources(
        {
          source: sourceWithBlocks(playSound('drums/beat')),
          labConfig: savedPack('default'),
        },
        library
      )
    ).toBe('default');
  });

  it('has no pack for a project with nothing saved', () => {
    expect(getPackIdForSources(undefined, library)).toBeUndefined();
  });
});
