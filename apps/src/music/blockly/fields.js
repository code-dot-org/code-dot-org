// Common field definitions used across multiple music blocks

import {DEFAULT_SOUND, DEFAULT_PATTERN, DEFAULT_CHORD} from '../constants';
import Globals from '../globals';
import {
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_TYPE,
  FIELD_CHORD_TYPE,
  FIELD_CHORD_NAME
} from './constants';

export const fieldSoundsDefinition = {
  type: FIELD_SOUNDS_TYPE,
  name: FIELD_SOUNDS_NAME,
  getLibrary: Globals.getLibrary,
  getAllowedSounds: Globals.getAllowedSounds,
  playPreview: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  currentValue: DEFAULT_SOUND
};

export const fieldPatternDefinition = {
  type: FIELD_PATTERN_TYPE,
  name: FIELD_PATTERN_NAME,
  getLibrary: Globals.getLibrary,
  currentValue: DEFAULT_PATTERN
};

export const fieldChordDefinition = {
  type: FIELD_CHORD_TYPE,
  name: FIELD_CHORD_NAME,
  getLibrary: Globals.getLibrary,
  previewChord: (chordValue, onStop) => {
    Globals.getPlayer().previewChord(chordValue, onStop);
  },
  currentValue: DEFAULT_CHORD
};

export const fieldRestDurationDefinition = {
  type: 'field_dropdown',
  name: FIELD_REST_DURATION_NAME,
  options: [
    ['\u00bd beat', '0.125'],
    ['1 beat', '0.25'],
    ['2 beats', '0.5'],
    ['1 measure', '1'],
    ['2 measures', '2']
  ]
};
