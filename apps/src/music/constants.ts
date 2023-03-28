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
    keyboardKey: '1'
  },
  {
    id: 'trigger2',
    dropdownLabel: '2',
    buttonLabel: '2',
    keyboardKey: '2'
  },
  {
    id: 'trigger3',
    dropdownLabel: '3',
    buttonLabel: '3',
    keyboardKey: '3'
  },
  {
    id: 'trigger4',
    dropdownLabel: '4',
    buttonLabel: '4',
    keyboardKey: '4'
  },
  {
    id: 'trigger5',
    dropdownLabel: '5',
    buttonLabel: '5',
    keyboardKey: '5'
  },
  {
    id: 'trigger6',
    dropdownLabel: '6',
    buttonLabel: '6',
    keyboardKey: '6'
  }
];

export const BlockMode = {
  ADVANCED: 'Advanced',
  SIMPLE: 'Simple',
  SIMPLE2: 'Simple2',
  TRACKS: 'Tracks'
};

export const DEFAULT_SOUND = 'dance/groovy_beat';

// For reference, events look like this:
// events: [{src: 'sound_1', tick: 3}]
export const DEFAULT_PATTERN = {
  kit: 'glitch',
  events: []
};

export const DEFAULT_PATTERN_LENGTH = 1;

// Type: ChordEventValue
export const DEFAULT_CHORD = {
  instrument: 'piano',
  notes: [],
  playStyle: 'arpeggio-up'
};

export const DEFAULT_CHORD_LENGTH = 1;
