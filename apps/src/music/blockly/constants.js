import musicI18n from '../locale';

// Extensions & Mutator Names

export const DEFAULT_TRACK_NAME_EXTENSION = 'default_track_name_extension';
export const FIELD_EFFECTS_EXTENSION = 'field_effects_extension';
export const PLAY_MULTI_MUTATOR = 'play_multi_mutator';

// Field / Input Names

export const TRACK_NAME_FIELD = 'track_name';
export const FIELD_SOUNDS_NAME = 'sound';
export const FIELD_PATTERN_NAME = 'pattern';
export const FIELD_PATTERN_AI_NAME = 'pattern_ai';
export const FIELD_CHORD_NAME = 'chord';
export const FIELD_TUNE_NAME = 'tune';
export const EXTRA_SOUND_INPUT_PREFIX = 'extra_sound_input_';
export const EXTRA_SAMPLE_FIELD_PREFIX = 'extra_sample';
export const TRIGGER_FIELD = 'trigger';
export const PRIMARY_SOUND_INPUT_NAME = 'primary_sound';
export const FIELD_REST_DURATION_NAME = 'rest_duration';
export const FIELD_EFFECTS_NAME = 'effects_name';
export const FIELD_EFFECTS_VALUE = 'effects_value';
export const FIELD_TRIGGER_START_NAME = 'trigger_start';

// Types

export const FIELD_SOUNDS_TYPE = 'field_sounds';
export const SOUND_VALUE_TYPE = 'sound_value_type';
export const FIELD_PATTERN_TYPE = 'field_pattern';
export const PATTERN_VALUE_TYPE = 'pattern_value_type';
export const FIELD_PATTERN_AI_TYPE = 'field_pattern_ai';
//export const PATTERN_AI_VALUE_TYPE = 'pattern_ai_value_type';
export const FIELD_CHORD_TYPE = 'field_chord';
export const CHORD_VALUE_TYPE = 'chord_value_type';
export const FIELD_TUNE_TYPE = 'field_tune';
export const TUNE_VALUE_TYPE = 'tune_value_type';

// SVG

export const PLUS_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
  '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
  'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
  'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
  'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
  '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';

export const MINUS_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
  'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
  'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
  'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

// Other

export const DOCS_BASE_URL = '/docs/ide/projectbeats/expressions/';

export const TriggerStart = {
  IMMEDIATELY: 'immediately',
  NEXT_BEAT: 'next_beat',
  NEXT_MEASURE: 'next_measure',
};

export const FIELD_EFFECT_NAME_OPTIONS = [
  [musicI18n.effectsLabelsVolume(), 'volume'],
  [musicI18n.effectsLabelsFilter(), 'filter'],
  [musicI18n.effectsLabelsDelay(), 'delay'],
];

// Even though these strings don't necessarily match the labels, they must
// stay the same to avoid breaking existing projects saved with these values.
export const DEFAULT_EFFECT_VALUE = 'normal';
export const MEDIUM_EFFECT_VALUE = 'medium';
export const LOW_EFFECT_VALUE = 'low';

export const FIELD_EFFECTS_VALUE_OPTIONS = {
  volume: [
    [musicI18n.effectsLabelsFull(), DEFAULT_EFFECT_VALUE],
    [musicI18n.effectsLabelsMedium(), MEDIUM_EFFECT_VALUE],
    [musicI18n.effectsLabelsLow(), LOW_EFFECT_VALUE],
  ],
  filter: [
    [musicI18n.effectsLabelsOff(), DEFAULT_EFFECT_VALUE],
    [musicI18n.effectsLabelsMedium(), MEDIUM_EFFECT_VALUE],
    [musicI18n.effectsLabelsLow(), LOW_EFFECT_VALUE],
  ],
  delay: [
    [musicI18n.effectsLabelsOff(), DEFAULT_EFFECT_VALUE],
    [musicI18n.effectsLabelsHigh(), MEDIUM_EFFECT_VALUE],
    [musicI18n.effectsLabelsLow(), LOW_EFFECT_VALUE],
  ],
};
