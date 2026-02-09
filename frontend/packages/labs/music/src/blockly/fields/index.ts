import FieldChord from './FieldChord';
import FieldPattern from './FieldPattern';
import FieldPatternAi from './FieldPatternAi';
import FieldSounds from './FieldSounds';
import FieldTunePlugin from './FieldTune';

import {
  TRIGGER_FIELD,
  FIELD_CHORD_NAME,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_TUNE_NAME,
} from '../constants';

import {
  DEFAULT_CHORD,
  DEFAULT_PATTERN,
  DEFAULT_PATTERN_AI,
  DEFAULT_TUNE,
  Triggers,
} from '../../constants';

export const fieldSoundsDefinition = {
  type: FieldSounds,
  name: FIELD_SOUNDS_NAME,
  currentValue: null,
} as const;

export const fieldPatternDefinition = {
  type: FieldPattern,
  name: FIELD_PATTERN_NAME,
  currentValue: DEFAULT_PATTERN,
} as const;

export const fieldPatternAiDefinition = {
  type: FieldPatternAi,
  name: FIELD_PATTERN_AI_NAME,
  currentValue: DEFAULT_PATTERN_AI,
} as const;

export const fieldChordDefinition = {
  type: FieldChord,
  name: FIELD_CHORD_NAME,
  currentValue: DEFAULT_CHORD,
} as const;

export const fieldTuneDefinition = {
  type: FieldTunePlugin,
  name: FIELD_TUNE_NAME,
  currentValue: DEFAULT_TUNE,
} as const;

export const fieldRestDurationDefinition = {
  type: 'field_dropdown',
  name: FIELD_REST_DURATION_NAME,
  options: [
    ['\u00bd beat', '0.125'],
    ['1 beat', '0.25'],
    ['2 beats', '0.5'],
    ['1 measure', '1'],
    ['2 measures', '2'],
    ['3 measures', '3'],
  ],
} as const;

export const fieldTriggerDefinition = {
  type: 'field_dropdown',
  name: TRIGGER_FIELD,
  options: Triggers.map(
    trigger => [trigger.dropdownLabel, trigger.id] as [string, string],
  ),
} as const;
