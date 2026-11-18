import MusicLibrary, {
  LibraryJson,
  SoundFolder,
} from '@cdo/apps/music/player/MusicLibrary';

jest.mock('@cdo/apps/music/constants', () => ({
  ...jest.requireActual('@cdo/apps/music/constants'),
  REMOVED_PACK_IDS: ['removed_artist', 'built_in'],
}));

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
      folder('built_in', false),
      folder('artist', true),
      folder('removed_artist', true),
      folder('flagged_in_json', true, true),
    ],
  };
  return new MusicLibrary('test', libraryJson);
}

const ids = (folders: SoundFolder[]) => folders.map(f => f.id);

describe('MusicLibrary removed packs', () => {
  it('leaves a removed pack out of the pack picker', () => {
    const library = createLibrary();
    expect(ids(library.getRestrictedPacks())).toEqual([
      'artist',
      'flagged_in_json',
    ]);
  });

  it('keeps a removed pack for a project that already chose it', () => {
    const library = createLibrary();
    library.setCurrentPackId('removed_artist');

    expect(ids(library.getRestrictedPacks())).toEqual([
      'artist',
      'removed_artist',
      'flagged_in_json',
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
