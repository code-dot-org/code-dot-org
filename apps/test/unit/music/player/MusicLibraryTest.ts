import MusicLibrary, {
  LibraryJson,
  SoundFolder,
} from '@cdo/apps/music/player/MusicLibrary';

function folder(
  id: string,
  restricted: boolean,
  removed?: boolean
): SoundFolder {
  return {
    id,
    name: id,
    path: id,
    imageSrc: '',
    restricted,
    removed,
    sounds: [{name: 'beat', src: 'beat', length: 2, type: 'beat'}],
  };
}

function createLibrary(): MusicLibrary {
  const libraryJson: LibraryJson = {
    id: 'test',
    name: 'test',
    imageSrc: '',
    path: 'test',
    folders: [],
    instruments: [],
    kits: [],
    // Artist packs come before built-in ones in the real library.
    packs: [
      folder('removed_artist', true, true),
      folder('built_in', false),
      folder('artist', true),
    ],
  };
  return new MusicLibrary('test', libraryJson);
}

const ids = (folders: SoundFolder[]) => folders.map(f => f.id);

describe('MusicLibrary removed packs', () => {
  it('leaves a removed pack out of the pack picker', () => {
    const library = createLibrary();
    expect(ids(library.getRestrictedPacks())).toEqual(['artist']);
  });

  it('keeps a removed pack for a project that already chose it', () => {
    const library = createLibrary();
    library.setCurrentPackId('removed_artist');

    expect(ids(library.getRestrictedPacks())).toEqual([
      'removed_artist',
      'artist',
    ]);
    expect(library.isSoundIdAvailable('removed_artist/beat')).toBe(true);
  });

  it('makes sounds of a removed pack silent and not choosable', () => {
    const library = createLibrary();
    library.setCurrentPackId('removed_artist');

    expect(library.isSoundRemoved('removed_artist/beat')).toBe(true);
    expect(library.isSoundRemoved('built_in/beat')).toBe(false);
    expect(ids(library.getPlayableSounds())).toEqual(['built_in']);
    expect(library.getDefaultSound()).toBe('built_in/beat');
  });
});
