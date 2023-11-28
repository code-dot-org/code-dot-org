import UntypedCachedBackgroundEffects from '@cdo/static/dance/ai/model/cached_background_effects_map.json';
import UntypedCachedForegroundEffects from '@cdo/static/dance/ai/model/cached_foreground_effects_map.json';
import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached_palettes_map.json';

import {FieldKey, CachedWeightsMapping} from './types';

export const cachedWeightsMappings: {[key in FieldKey]: CachedWeightsMapping} =
  {
    backgroundEffect: UntypedCachedBackgroundEffects,
    foregroundEffect: UntypedCachedForegroundEffects,
    backgroundColor: UntypedCachedPalettes,
  };

export const DANCE_AI_SOUNDS = [
  'ai-select-emoji',
  'ai-deselect-emoji',
  'ai-generate-no',
  'ai-generate-yes',
] as const;
