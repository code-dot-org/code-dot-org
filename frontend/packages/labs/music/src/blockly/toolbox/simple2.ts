import {BlockTypes} from '../blockTypes';
import {
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  DEFAULT_EFFECT_VALUE,
} from '../constants';

const map = {
  Sounds: [
    BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
    BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
    BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
    BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
  ],
  Control: [
    BlockTypes.TRIGGERED_AT_SIMPLE2,
    BlockTypes.PLAY_SOUNDS_TOGETHER,
    BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
    BlockTypes.PLAY_SOUNDS_RANDOM,
    BlockTypes.REPEAT_SIMPLE2,
  ],
  Effects: [
    {
      kind: 'block',
      type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
      fields: {
        [FIELD_EFFECTS_NAME]: 'volume',
        [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
      },
    },
    {
      kind: 'block',
      type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
      fields: {
        [FIELD_EFFECTS_NAME]: 'filter',
        [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
      },
    },
    {
      kind: 'block',
      type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
      fields: {
        [FIELD_EFFECTS_NAME]: 'delay',
        [FIELD_EFFECTS_VALUE]: DEFAULT_EFFECT_VALUE,
      },
    },
  ],
  Functions: [],
};

export default map;
