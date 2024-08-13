// Common field definitions used across multiple music blocks

import {
  DEFAULT_PATTERN,
  DEFAULT_CHORD,
  DEFAULT_TUNE,
  Triggers,
} from '../constants';
import Globals from '../globals';
import musicI18n from '../locale';
import MusicLibrary from '../player/MusicLibrary';

import {
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_TYPE,
  FIELD_CHORD_TYPE,
  FIELD_CHORD_NAME,
  FIELD_TUNE_TYPE,
  FIELD_TUNE_NAME,
  TRIGGER_FIELD,
} from './constants';

const instrumentCommonOptions = {
  getLibrary: () => MusicLibrary.getInstance(),
  cancelPreviews: () => {
    Globals.getPlayer().cancelPreviews();
  },
  setupSampler: (instrument, onLoadFinished) =>
    Globals.getPlayer().setupSampler(instrument, onLoadFinished),
  isInstrumentLoading: instrument =>
    Globals.getPlayer().isInstrumentLoading(instrument),
  isInstrumentLoaded: instrument =>
    Globals.getPlayer().isInstrumentLoaded(instrument),
  registerInstrumentLoadCallback: callback => {
    Globals.getPlayer().registerCallback('InstrumentLoaded', callback);
  },
};

export const fieldSoundsDefinition = {
  type: FIELD_SOUNDS_TYPE,
  name: FIELD_SOUNDS_NAME,
  getLibrary: () => MusicLibrary.getInstance(),
  playPreview: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  cancelPreviews: () => Globals.getPlayer().cancelPreviews(),
  currentValue: null,
  getShowSoundFilters: () => Globals.getShowSoundFilters(),
};

export const fieldPatternDefinition = {
  type: FIELD_PATTERN_TYPE,
  name: FIELD_PATTERN_NAME,
  previewSound: (id, onStop) => {
    Globals.getPlayer().previewSound(id, onStop);
  },
  previewPattern: (patternValue, onTick, onStop) => {
    Globals.getPlayer().previewPattern(patternValue, onTick, onStop);
  },
  currentValue: DEFAULT_PATTERN,
  ...instrumentCommonOptions,
};

export const fieldChordDefinition = {
  type: FIELD_CHORD_TYPE,
  name: FIELD_CHORD_NAME,
  previewChord: (chordValue, onTick, onStop) => {
    Globals.getPlayer().previewChord(chordValue, onTick, onStop);
  },
  previewNote: (note, instrument, onStop) => {
    Globals.getPlayer().previewNote(note, instrument, onStop);
  },
  currentValue: DEFAULT_CHORD,
  ...instrumentCommonOptions,
};

export const fieldTuneDefinition = {
  type: FIELD_TUNE_TYPE,
  name: FIELD_TUNE_NAME,
  previewTune: (tuneValue, onTick, onStop) => {
    Globals.getPlayer().previewTune(tuneValue, onTick, onStop);
  },
  previewNote: (tune, instrument, onStop) => {
    Globals.getPlayer().previewNote(tune, instrument, onStop);
  },
  currentValue: DEFAULT_TUNE,
  ...instrumentCommonOptions,
};

export const fieldRestDurationDefinition = {
  type: 'field_dropdown',
  name: FIELD_REST_DURATION_NAME,
  options: [
    [musicI18n.blockly_fieldRestHalfBeat(), '0.125'],
    [musicI18n.blockly_fieldRestOneBeat(), '0.25'],
    [musicI18n.blockly_fieldRestBeats({num: 2}), '0.5'],
    [musicI18n.blockly_fieldRestOneMeasure(), '1'],
    [musicI18n.blockly_fieldRestMeasures({num: 2}), '2'],
  ],
};

export const fieldTriggerDefinition = {
  type: 'field_dropdown',
  name: TRIGGER_FIELD,
  options: Triggers.map(trigger => [trigger.dropdownLabel, trigger.id]),
};
