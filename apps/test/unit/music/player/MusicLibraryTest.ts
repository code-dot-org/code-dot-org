import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {isEqual} from 'lodash';

import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';

import testLibraryJson from './testLibrary.json';

const testLibrary = testLibraryJson as LibraryJson;

describe('MusicLibrary', () => {
  it('loads a library', () => {
    const library = new MusicLibrary('launch2024', testLibrary);

    assert(library.instruments.length === 2);
    assert(library.instruments[0].sounds.length === 3);
    assert(library.kits.length === 2);
    assert(library.kits[0].sounds.length === 3);
    assert(library.packs.length === 5);
    assert(library.getHasRestrictedPacks() === true);
    assert(
      isEqual(library.getAvailableSoundTypes(), {preview: true, beat: true})
    );
    assert(
      isEqual(
        library.getAvailableSounds().map(availableFolder => availableFolder.id),
        ['unrestricted1', 'unrestricted2']
      )
    );
    assert(
      library.getSoundForId('unrestricted2/drum_beat_cowbell')?.src ===
        'drum_beat_cowbell'
    );

    const folder = library.getFolderForSoundId(
      'unrestricted2/drum_beat_cowbell'
    );
    assert(folder?.path === 'packs/unrestricted2');
    assert(
      isEqual(
        folder?.sounds.map(sound => sound.src),
        ['electro', 'drum_beat_cowbell', 'drum_beat_club', 'drum_beat_edm']
      )
    );
    assert(isEqual(library.getFolderForFolderId('unrestricted2'), folder));
  });

  it('allows some sounds in a library', () => {
    const library = new MusicLibrary('launch2024', testLibrary);
    library.setAllowedSounds({unrestricted2: ['drum_beat_club']});
    assert(
      isEqual(library.getAvailableSoundTypes(), {preview: true, beat: true})
    );
    assert(library.getDefaultSound() === 'unrestricted2/drum_beat_club');
  });

  it('uses a restricted pack in a library', () => {
    const library = new MusicLibrary('launch2024', testLibrary);
    library.setCurrentPackId('restricted2');
    assert(
      isEqual(library.getAvailableSoundTypes(), {preview: true, beat: true})
    );
    assert(library.getDefaultSound() === 'restricted2/kick_verse_1');

    assert(
      isEqual(
        library.getAvailableSounds().map(availableFolder => availableFolder.id),
        ['restricted2', 'unrestricted1', 'unrestricted2']
      )
    );
  });
});
