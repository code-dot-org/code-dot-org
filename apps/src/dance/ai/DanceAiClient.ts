import UntypedCachedBackgroundEffects from '@cdo/static/dance/ai/model/cached_background_effects_map.json';
import UntypedCachedForegroundEffects from '@cdo/static/dance/ai/model/cached_foreground_effects_map.json';
import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached_palettes_map.json';

import {FieldKey, GeneratedEffect} from './types';

export enum ChooseEffectsQuality {
  GOOD = 'good',
  BAD = 'bad',
}

export type CachedWeightsMapping = {
  emojiAssociations: {[key: string]: number[]};
  output: string[];
};

const cachedWeightsMappings: {[key in FieldKey]: CachedWeightsMapping} = {
  backgroundEffect: UntypedCachedBackgroundEffects,
  foregroundEffect: UntypedCachedForegroundEffects,
  backgroundColor: UntypedCachedPalettes,
};

const NUM_RANDOM_TOP_OPTIONS = 3;
const NUM_RANDOM_BOTTOM_OPTIONS = 20;

/**
 * Chooses a random background effect, background color, and foreground effect associated
 * with the emojis the user selected.  If quality is GOOD, then choose one of the best
 * associated; if quality is BAD, then choose one of the worst associated.  Also return
 * the score for each returned value.
 * @param {array} selectedEmojis: the list of three emojis the user selected
 * @param {ChooseEffectsQuality} quality: whether we want good or bad scoring effects
 * @returns {GeneratedEffect} an object containing the effects that were chosen, for example:
 * {
 *   "backgroundEffect": "sparkles",
 *   "backgroundColor": "cool",
 *   "foregroundEffect": "bubbles"
 * }
 */
export function chooseEffects(
  selectedEmojis: string[],
  quality: ChooseEffectsQuality
): GeneratedEffect {
  const chosenEffects: GeneratedEffect = {
    [FieldKey.BACKGROUND_EFFECT]: '',
    [FieldKey.FOREGROUND_EFFECT]: '',
    [FieldKey.BACKGROUND_PALETTE]: '',
  };
  for (const field of Object.values(FieldKey)) {
    const mapping = cachedWeightsMappings[field];
    // Get final output summed weights based on set of three selected emoji inputs
    const weightVector = calculateOutputSummedWeights(selectedEmojis, mapping);
    // Sort and slice top or bottom scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
    const allSortedOptions = getSortedOptions(weightVector, mapping);
    const topOrBottomOptions =
      quality === ChooseEffectsQuality.GOOD
        ? allSortedOptions.slice(0, NUM_RANDOM_TOP_OPTIONS)
        : allSortedOptions.slice(-NUM_RANDOM_BOTTOM_OPTIONS);

    const selectedOutputOption =
      topOrBottomOptions[Math.floor(Math.random() * topOrBottomOptions.length)];
    chosenEffects[field] = selectedOutputOption[1];
  }
  return chosenEffects;
}

// Returns the weights for each of the three emoji inputs for a given effect.
export function getGeneratedEffectScores(
  emojis: string[],
  effect: GeneratedEffect
): number[] {
  // Determine the contribution of each input emoji.
  const scores = emojis.map(emoji => {
    let sum = 0;
    for (const field of Object.values(FieldKey)) {
      const mapping = cachedWeightsMappings[field];
      sum +=
        mapping['emojiAssociations'][emoji][
          mapping['output'].indexOf(effect[field])
        ];
    }
    return sum;
  });
  return scores;
}

/**
 * Looks up and sums element-wise precalculated vector weights for each input as a condensed final output
 * Emulates summation process for final classifier output layer of a machine learning model
 * @param {*} emojis, set of three emojis selected by user
 * @param {*} outputWeightsMapping, precalculated association weights for a possible type of output (e.g. background effect, foreground effect or palette)
 * @returns 1d array of values between [0, 3] with indexes that map to output "option" (e.g. "circles" for BackgroundEffects) Higher values = stronger correlation
 */
function calculateOutputSummedWeights(
  emojis: string[],
  outputWeightsMapping: CachedWeightsMapping
): number[] {
  // selectedEmojiAssociations is an array of 3 subarrays. Each subarray contains
  // the weights ranging from [0, 1] for the selected emojis for a particular output type)
  const selectedEmojiAssociations: number[][] = emojis.map(emojiName => {
    return outputWeightsMapping['emojiAssociations'][emojiName];
  });
  // sumWeights is the sum of the weights for set of three emojis for each output type
  const sumWeights: number[] = selectedEmojiAssociations.reduce(
    (firstList, secondList) =>
      firstList.map((value, index) => value + secondList[index])
  );
  return sumWeights;
}

/**
 * Simple selection function that returns all "classifications"
 * @param {*} outputWeights desired output weight vector to precalculate based on
 * @param {*} associatedOutputJson, precalculated vector weights for each possible type of output (e.g. BackgroundsEffects, ForegroundEffects, etc.)
 * @returns 1d array of subarrays in the format [score, output_option) e.g. [0.51, "circles"]
 */
function getSortedOptions(
  outputWeights: number[],
  associatedOutputJson: CachedWeightsMapping
) {
  const topOptions: [number, string][] = outputWeights
    .map(function (sum, index) {
      const options: [number, string] = [
        sum,
        associatedOutputJson['output'][index],
      ];
      return options;
    })
    .sort((item1, item2) => item2[0] - item1[0]);
  return topOptions;
}
