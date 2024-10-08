import {Effects} from './player/interfaces/Effects';
import {PatternEventValue} from './player/interfaces/PatternEvent';
import {TuneEventValue} from './player/interfaces/TuneEvent';
import {Key} from './utils/Notes';

export const baseAssetUrl = 'https://curriculum.code.org/media/musiclab/';
export const baseAssetUrlRestricted = '/restricted/musiclab/';

export interface Trigger {
  id: string;
  dropdownLabel: string;
  buttonLabel: string;
  keyboardKey: string;
}

export const Triggers: Trigger[] = [
  {
    id: 'trigger1',
    dropdownLabel: '1',
    buttonLabel: '1',
    keyboardKey: '1',
  },
  {
    id: 'trigger2',
    dropdownLabel: '2',
    buttonLabel: '2',
    keyboardKey: '2',
  },
  {
    id: 'trigger3',
    dropdownLabel: '3',
    buttonLabel: '3',
    keyboardKey: '3',
  },
  {
    id: 'trigger4',
    dropdownLabel: '4',
    buttonLabel: '4',
    keyboardKey: '4',
  },
];

export const BlockMode = {
  SIMPLE2: 'Simple2',
  ADVANCED: 'Advanced',
} as const;

export const DEFAULT_PATTERN: PatternEventValue = {
  instrument: 'drums',
  events: [],
  ai: false,
};

export const DEFAULT_PATTERN_LENGTH = 1;

export const DEFAULT_PATTERN_AI: PatternEventValue = {
  instrument: 'drums',
  length: 2,
  events: [],
  ai: true,
};

export const DEFAULT_PATTERN_AI_LENGTH = 2;

// Type: ChordEventValue
export const DEFAULT_CHORD = {
  instrument: 'piano',
  notes: [],
  playStyle: 'arpeggio-up',
};

export const DEFAULT_CHORD_LENGTH = 1;

export const DEFAULT_TUNE: TuneEventValue = {
  instrument: 'piano',
  events: [],
};

export const DEFAULT_TUNE_LENGTH = 1;

export const LOCAL_STORAGE = 'local';
export const REMOTE_STORAGE = 'remote';

// Minimum number of measures in a song
export const MIN_NUM_MEASURES = 40;

export const LEGACY_DEFAULT_LIBRARY = 'default';
export const DEFAULT_LIBRARY = 'intro2024';

export const DEFAULT_PACK = 'default';

export const DEFAULT_BPM = 120;
export const DEFAULT_BEATS_PER_MEASURE = 4;
export const DEFAULT_KEY = Key.C;
export const MIN_BPM = 60;
export const MAX_BPM = 200;

export const BUS_EFFECT_COMBINATIONS: Effects[] = [
  {filter: 'medium', delay: 'medium'},
  {filter: 'low', delay: 'low'},
  {filter: 'low', delay: 'medium'},
  {filter: 'medium', delay: 'low'},
  {filter: 'medium'},
  {filter: 'low'},
  {delay: 'medium'},
  {delay: 'low'},
];
