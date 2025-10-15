import {MusicMetadata} from './ai/generate/GenerateCode';

export const defaultMetadata: MusicMetadata = {
  playbackEvents: [
    {
      id: 'pop/drum_kit_pop',
      type: 'sound',
      length: 2,
      //soundType: 'beat',
      blockId: 'block-1',
      triggered: false,
      when: 1,
      skipContext: {insideRandom: false, skipSound: false},
      validationInfo: {parentControlTypes: []},
      functionContext: {name: 'when_run', uniqueInvocationId: 18},
    },
    {
      id: 'pop/drum_kit_pop',
      type: 'sound',
      length: 2,
      //soundType: 'beat',
      blockId: 'block-2',
      triggered: false,
      when: 3,
      skipContext: {insideRandom: false, skipSound: false},
      validationInfo: {parentControlTypes: []},
      functionContext: {name: 'when_run', uniqueInvocationId: 18},
    },
  ],
  lastMeasure: 5,
  packId: 'default',
  libraryName: 'launch2024',
};
