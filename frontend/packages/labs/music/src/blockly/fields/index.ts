import FieldSounds from './FieldSounds';
import FieldPattern from './FieldPattern';
import FieldPatternAi from './FieldPatternAi';

import {
  TRIGGER_FIELD,
  FIELD_SOUNDS_NAME,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
} from '../constants';

import {DEFAULT_PATTERN, DEFAULT_PATTERN_AI, Triggers} from '../../constants';

export const fieldTriggerDefinition = {
  type: 'field_dropdown',
  name: TRIGGER_FIELD,
  options: Triggers.map(
    trigger => [trigger.dropdownLabel, trigger.id] as [string, string],
  ),
} as const;

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
