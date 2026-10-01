import type {BlocklySerialization} from '@code-dot-org/blockly';

import type {LibraryJson} from '../../api';

export const libraryJson: LibraryJson = {
  id: 'test-library',
  path: 'test-library',
  bpm: 110,
  key: 2,
  instruments: [],
  kits: [],
  packs: [
    {
      id: 'pack1',
      name: 'Pack One',
      path: 'pack1',
      bpm: 95,
      sounds: [
        {name: 'Beat', src: 'beat', length: 1, type: 'beat'},
        {name: 'Lead', src: 'lead', length: 2, type: 'lead'},
      ],
    },
  ],
};

const sound = (id: string, src: string, next?: object) => ({
  block: {
    type: 'play_sound_at_current_location_simple2',
    id,
    fields: {sound: `pack1/${src}`},
    ...(next ? {next} : {}),
  },
});

// when run: beat, chorus(), lead; chorus: beat.
export const projectSource: BlocklySerialization = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run_simple2',
        id: 'run',
        x: 30,
        y: 30,
        next: sound('s1', 'beat', {
          block: {
            type: 'procedures_callnoreturn',
            id: 'call',
            extraState: {name: 'chorus'},
            next: sound('s2', 'lead'),
          },
        }),
      },
      {
        type: 'procedures_defnoreturn',
        id: 'def',
        x: 300,
        y: 30,
        fields: {NAME: 'chorus'},
        inputs: {STACK: sound('s3', 'beat')},
      },
    ],
  },
} as unknown as BlocklySerialization;
