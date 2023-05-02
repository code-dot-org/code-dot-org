// Common field definitions used across multiple music blocks

import {DEFAULT_SOUND, DEFAULT_PATTERN, DEFAULT_CHORD} from '../constants';
import Globals from '../globals';
import musicI18n from '../locale';
import {
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_TYPE,
  FIELD_CHORD_TYPE,
  FIELD_CHORD_NAME,
} from './constants';

export const fieldSoundsDefinition = {
  type: FIELD_SOUNDS_TYPE,
  name: FIELD_SOUNDS_NAME,
  getLibrary: Globals.getLibrary,
  playPreview: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  currentValue: DEFAULT_SOUND,
};

export const fieldPatternDefinition = {
  type: FIELD_PATTERN_TYPE,
  name: FIELD_PATTERN_NAME,
  getBPM: () => Globals.getPlayer().getBPM(),
  getLibrary: Globals.getLibrary,
  previewSound: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  previewPattern: (patternValue, onStop) => {
    Globals.getPlayer().previewPattern(patternValue, onStop);
  },
  cancelPreviews: () => {
    Globals.getPlayer().cancelPreviews();
  },
  currentValue: DEFAULT_PATTERN,
};

export const fieldChordDefinition = {
  type: FIELD_CHORD_TYPE,
  name: FIELD_CHORD_NAME,
  getLibrary: Globals.getLibrary,
  previewChord: (chordValue, onStop) => {
    Globals.getPlayer().previewChord(chordValue, onStop);
  },
  previewNote: (note, instrument, onStop) => {
    Globals.getPlayer().previewNote(note, instrument, onStop);
  },
  cancelPreviews: () => {
    Globals.getPlayer().cancelPreviews();
  },
  currentValue: DEFAULT_CHORD,
};

export const fieldRestDurationDefinition = {
  type: 'field_dropdown',
  name: FIELD_REST_DURATION_NAME,
  options: [
    [`\u00bd ${musicI18n.blockly_fieldRestBeat()}`, '0.125'],
    [`1 ${musicI18n.blockly_fieldRestBeat()}`, '0.25'],
    [`2 ${musicI18n.blockly_fieldRestBeats()}`, '0.5'],
    [`1 ${musicI18n.blockly_fieldRestMeasure()}`, '1'],
    [`2 ${musicI18n.blockly_fieldRestMeasures()}`, '2'],
  ],
};
