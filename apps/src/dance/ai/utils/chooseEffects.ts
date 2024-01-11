import {cachedWeightsMappings} from '../constants';
import {
  FieldKey,
  GeneratedEffect,
  EffectsQuality,
  CachedWeightsMapping,
} from '../types';

import {calculateOutputSummedWeights} from './calculateOutputSummedWeights';
import {getSortedOptions} from './getSortedOptions';

const NUM_RANDOM_TOP_OPTIONS = 1;
const NUM_RANDOM_BOTTOM_OPTIONS = 1;

/**
 * Chooses a random background effect, background color, and foreground effect associated
 * with the emojis the user selected.  If quality is GOOD, then choose one of the best
 * associated; if quality is BAD, then choose one of the worst associated.  Also return
 * the score for each returned value.
 * @param {array} selectedEmojis: the list of three emojis the user selected
 * @param {EffectsQuality} quality: whether we want good or bad scoring effects
 * @returns {GeneratedEffect} an object containing the effects that were chosen, for example:
 * {
 *   "backgroundEffect": "sparkles",
 *   "backgroundColor": "cool",
 *   "foregroundEffect": "bubbles"
 * }
 */

type CalculateOutputSummedWeights = (
  emojis: string[],
  weightMapping: CachedWeightsMapping
) => number[];

export function chooseEffects(
  selectedEmojis: string[],
  quality: EffectsQuality,
  weightMappings = cachedWeightsMappings,
  calculateOutputSummedWeights2: CalculateOutputSummedWeights = calculateOutputSummedWeights
): GeneratedEffect {
  const chosenEffects: GeneratedEffect = {
    [FieldKey.BACKGROUND_EFFECT]: '',
    [FieldKey.FOREGROUND_EFFECT]: '',
    [FieldKey.BACKGROUND_PALETTE]: '',
  };
  for (const field of Object.values(FieldKey)) {
    const mapping = weightMappings[field];
    // Get final output summed weights based on set of three selected emoji inputs
    const weightVector = calculateOutputSummedWeights2(selectedEmojis, mapping);
    // Sort and slice top or bottom scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
    const allSortedOptions = getSortedOptions(weightVector, mapping);
    const topOrBottomOptions =
      quality === EffectsQuality.GOOD
        ? allSortedOptions.slice(0, NUM_RANDOM_TOP_OPTIONS)
        : allSortedOptions.slice(-NUM_RANDOM_BOTTOM_OPTIONS);

    const selectedOutputOption =
      topOrBottomOptions[Math.floor(Math.random() * topOrBottomOptions.length)];
    chosenEffects[field] = selectedOutputOption[1];
  }
  return chosenEffects;
}
