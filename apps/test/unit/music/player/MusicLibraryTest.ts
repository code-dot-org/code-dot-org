import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {isEqual} from 'lodash';

import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';

const testLibrary: LibraryJson = {
  id: 'launch2024-prep',
  path: 'library-launch2024',
  bpm: 120,
  key: 0,
  instruments: [
    {
      name: 'Piano',
      id: 'piano',
      path: 'instruments/piano',
      type: 'instrument',
      sounds: [
        {name: 'Piano C3', src: 'piano-48', note: 48},
        {name: 'Piano C#3', src: 'piano-49', note: 49},
        {name: 'Piano D3', src: 'piano-50', note: 50},
      ],
    },
    {
      name: 'Bass',
      id: 'bass-instrument',
      path: 'instruments/bass-instrument',
      type: 'instrument',
      sounds: [
        {name: 'Bass C3', src: 'bass-48', note: 48},
        {name: 'Bass C#3', src: 'bass-49', note: 49},
        {name: 'Bass D3', src: 'bass-50', note: 50},
      ],
    },
  ],
  kits: [
    {
      name: 'Drum Kit',
      id: 'drums',
      path: 'kits/drums',
      type: 'kit',
      sounds: [
        {name: 'Bass Drum', src: 'sound_1'},
        {name: 'Snare', src: 'sound_2'},
        {name: 'Closed Hi-Hat', src: 'sound_3'},
      ],
    },
    {
      name: 'Machine',
      id: 'machine',
      path: 'kits/machine',
      type: 'kit',
      sounds: [
        {name: 'Bass Drum', src: 'sound_1'},
        {name: 'Snare', src: 'sound_2'},
        {name: 'Closed Hi-Hat', src: 'sound_3'},
      ],
    },
  ],
  packs: [
    {
      name: 'Restricted 1',
      artist: 'Restricted artist 1',
      id: 'restricted1',
      path: 'packs/restricted1',
      imageSrc: 'restricted1.jpg',
      restricted: true,
      bpm: 100,
      key: 4,
      skipLocalization: true,
      sounds: [
        {
          name: 'Preview',
          src: 'chantaje_preview',
          length: 4,
          type: 'preview',
          restricted: true,
          bpm: 100,
          key: 4,
        },
        {
          name: 'Kick Verse 1',
          src: 'kick_verse_1',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
        {
          name: 'Kick Verse 2',
          src: 'kick_verse_2',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
        {
          name: 'Kick Build 1',
          src: 'kick_build_1',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
      ],
    },
    {
      name: 'Restricted 2',
      artist: 'Restricted artist 2',
      id: 'restricted2',
      path: 'packs/restricted2',
      imageSrc: 'restricted2.jpg',
      restricted: true,
      bpm: 100,
      key: 4,
      skipLocalization: true,
      sounds: [
        {
          name: 'Preview',
          src: 'chantaje_preview',
          length: 4,
          type: 'preview',
          restricted: true,
          bpm: 100,
          key: 4,
        },
        {
          name: 'Kick Verse 1',
          src: 'kick_verse_1',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
        {
          name: 'Kick Verse 2',
          src: 'kick_verse_2',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
        {
          name: 'Kick Build 1',
          src: 'kick_build_1',
          length: 2,
          type: 'beat',
          restricted: true,
          bpm: 100,
        },
      ],
    },
    {
      name: 'Unrestricted 1',
      artist: 'Unrestricted artist 1',
      id: 'unrestricted1',
      path: 'packs/unrestricted1',
      imageSrc: 'unrestricted1.png',
      restricted: false,
      sounds: [
        {
          name: 'Preview',
          path: 'preview',
          src: 'electro',
          length: 2,
          type: 'preview',
        },
        {
          name: 'Drum Beat Cowbell',
          path: 'beats',
          src: 'drum_beat_cowbell',
          length: 2,
          type: 'beat',
        },
        {
          name: 'Drum Beat Club',
          path: 'beats',
          src: 'drum_beat_club',
          length: 2,
          type: 'beat',
        },
        {
          name: 'Drum Beat EDM',
          path: 'beats',
          src: 'drum_beat_edm',
          length: 2,
          type: 'beat',
        },
      ],
    },
    {
      name: 'Unrestricted 2',
      artist: 'Unrestricted artist 2',
      id: 'unrestricted2',
      path: 'packs/unrestricted2',
      imageSrc: 'unrestricted2.png',
      restricted: false,
      sounds: [
        {
          name: 'Preview',
          path: 'preview',
          src: 'electro',
          length: 2,
          type: 'preview',
        },
        {
          name: 'Drum Beat Cowbell',
          path: 'beats',
          src: 'drum_beat_cowbell',
          length: 2,
          type: 'beat',
        },
        {
          name: 'Drum Beat Club',
          path: 'beats',
          src: 'drum_beat_club',
          length: 2,
          type: 'beat',
        },
        {
          name: 'Drum Beat EDM',
          path: 'beats',
          src: 'drum_beat_edm',
          length: 2,
          type: 'beat',
        },
      ],
    },
    {
      name: 'Code.org sounds',
      artist: 'Code.org',
      id: 'default',
      path: 'packs/default',
      imageSrc: 'default.png',
      restricted: true,
      bpm: 120,
      key: 0,
      sounds: [{name: 'Preview', src: 'preview', length: 2, type: 'preview'}],
    },
  ],
};

describe('MusicLibrary', () => {
  beforeEach(() => {});

  afterEach(() => {});

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
