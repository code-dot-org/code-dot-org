import {ValueOf} from '@cdo/apps/types/utils';

import appConfig from '../../appConfig';
import {BlockMode} from '../../constants';
import {BlockTypes} from '../blockTypes';

import {CategoryBlocksMap} from './types';

/**
 * Default toolbox category-blocks maps for each block mode.
 * These may be further modified by the level's toolbox allowlist.
 */
export const defaultMaps: {
  [mode in ValueOf<typeof BlockMode>]: CategoryBlocksMap;
} = {
  [BlockMode.ADVANCED]: {
    Play: [
      BlockTypes.PLAY_SOUND,
      BlockTypes.PLAY_PATTERN_AT_MEASURE,
      BlockTypes.PLAY_CHORD_AT_MEASURE,
    ],
    Events: [BlockTypes.TRIGGERED_AT],
    Control: [BlockTypes.FOR_LOOP],
    Effects: [
      BlockTypes.SET_VOLUME_EFFECT,
      BlockTypes.SET_FILTER_EFFECT,
      BlockTypes.SET_DELAY_EFFECT,
    ],
    Math: [
      'math_number',
      'math_round',
      'math_arithmetic',
      'math_random_int',
      'math_modulo',
      'math_number_property',
    ],
    Logic: ['controls_if', 'logic_compare'],
    Functions: [],
    Variables: [],
  },
  [BlockMode.SIMPLE2]: {
    Play: [
      BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
      ...(appConfig.getValue('play-tune-block') === 'true'
        ? [BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2]
        : []),
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
      BlockTypes.SET_VOLUME_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.SET_FILTER_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
      BlockTypes.SET_DELAY_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    ],
    Functions: [],
  },
};
