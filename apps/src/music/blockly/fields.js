// Common field definitions used across multiple music blocks

import {
  DEFAULT_PATTERN,
  DEFAULT_PATTERN_AI,
  DEFAULT_CHORD,
  DEFAULT_TUNE,
  Triggers,
} from '../constants';
import musicI18n from '../locale';

import {
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_TYPE,
  FIELD_PATTERN_AI_NAME,
  FIELD_PATTERN_AI_TYPE,
  FIELD_CHORD_TYPE,
  FIELD_CHORD_NAME,
  FIELD_TUNE_NAME,
  FIELD_TUNE_TYPE,
  TRIGGER_FIELD,
} from './constants';

export const fieldSoundsDefinition = {
  type: FIELD_SOUNDS_TYPE,
  name: FIELD_SOUNDS_NAME,
  currentValue: null,
};

export const fieldPatternDefinition = {
  type: FIELD_PATTERN_TYPE,
  name: FIELD_PATTERN_NAME,
  currentValue: DEFAULT_PATTERN,
};

export const fieldPatternAiDefinition = {
  type: FIELD_PATTERN_AI_TYPE,
  name: FIELD_PATTERN_AI_NAME,
  currentValue: DEFAULT_PATTERN_AI,
};

export const fieldChordDefinition = {
  type: FIELD_CHORD_TYPE,
  name: FIELD_CHORD_NAME,
  currentValue: DEFAULT_CHORD,
};

export const fieldTuneDefinition = {
  type: FIELD_TUNE_TYPE,
  name: FIELD_TUNE_NAME,
  currentValue: DEFAULT_TUNE,
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
