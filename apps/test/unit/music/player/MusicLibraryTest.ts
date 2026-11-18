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
    packs: [
      folder('built_in', false, true),
      folder('artist', true),
      folder('removed_artist', true, true),
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
      'artist',
      'removed_artist',
    ]);
    expect(ids(library.getAvailableSounds())).toEqual([
      'built_in',
      'removed_artist',
    ]);
    expect(library.isSoundIdAvailable('removed_artist/beat')).toBe(true);
  });

  it('does not remove a built-in pack', () => {
    const library = createLibrary();
    expect(ids(library.getAvailableSounds())).toEqual(['built_in']);
  });
});
