import UntypedCachedBackgroundEffects from '@cdo/static/dance/ai/model/cached_background_effects_map.json';
import UntypedCachedForegroundEffects from '@cdo/static/dance/ai/model/cached_foreground_effects_map.json';
import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached_palettes_map.json';

import {FieldKey, GeneratedEffect} from '../types';

export enum ChooseEffectsQuality {
  GOOD = 'good',
  BAD = 'bad',
}

export type CachedWeightsMapping = {
  emojiAssociations: {[key: string]: number[]};
  output: string[];
};

const CachedBackgroundEffects: CachedWeightsMapping =
  UntypedCachedBackgroundEffects;
const CachedForegroundEffects: CachedWeightsMapping =
  UntypedCachedForegroundEffects;
const CachedPalettes: CachedWeightsMapping = UntypedCachedPalettes;

/**
 * Chooses a random background effect, background color, and foreground effect associated
 * with the emojis the user selected.  If quality is GOOD, then choose one of the best
 * associated; if quality is BAD, then choose one of the worst associated.  Also return
 * the score for each returned value.
 * @param {array} emojis: the list of emojis the user selected
 * @param {ChooseEffectsQuality} quality: whether we want good or bad scoring effects
 * @returns: an object containing the effects that were chosen, and their scores, for example:
 * {
 *   "results: {
 *     "backgroundEffect": "sparkles",
 *     "backgroundColor": "cool",
 *     "foregroundEffect": "bubbles"
 *   },
 *   "scores": {
 *     "backgroundEffect": 0.1,
 *     "backgroundColor":  0.2,
 *     "foregroundEffect": 0.3
 *   }
 * }
 */
export function chooseEffects(
  selectedEmojis: string[],
  quality: ChooseEffectsQuality
): GeneratedEffect {
  // Obtain final summed output weight based off input received
  const cachedWeightsMappings: {[key: string]: CachedWeightsMapping} = {
    backgroundEffect: CachedBackgroundEffects,
    foregroundEffect: CachedForegroundEffects,
    backgroundColor: CachedPalettes,
  };
  const outputWeightsForSelectedEmojis: {[key: string]: number[]} = {};
  for (const output in cachedWeightsMappings) {
    outputWeightsForSelectedEmojis[output] = calculateOutputWeightsVector(
      selectedEmojis,
      cachedWeightsMappings[output]
    );
  }

  // Sort and slice top or bottom scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
  const numRandomOptions = 3;
  const allOutputOptions: {[key: string]: [number, string][]} = {};
  for (const output in outputWeightsForSelectedEmojis) {
    const weightVector = outputWeightsForSelectedEmojis[output];
    const options = obtainOptions(weightVector, cachedWeightsMappings[output]);
    const topOrBottomOptions =
      quality === ChooseEffectsQuality.GOOD
        ? options.slice(0, numRandomOptions)
        : options.slice(-numRandomOptions);
    allOutputOptions[output] = topOrBottomOptions;
  }
  const chosenEffects: GeneratedEffect = {
    [FieldKey.BACKGROUND_EFFECT]: '',
    [FieldKey.FOREGROUND_EFFECT]: '',
    [FieldKey.BACKGROUND_PALETTE]: '',
  };
  // Select a random option for each output type from the top or bottom scoring options.
  for (const output in allOutputOptions) {
    const outputOptions = allOutputOptions[output];
    const selectedOutputOption =
      outputOptions[Math.floor(Math.random() * outputOptions.length)];
    chosenEffects[output as keyof GeneratedEffect] = selectedOutputOption[1];
  }
  return chosenEffects;
}

export function getGeneratedEffectScores(
  emojis: string[],
  effect: GeneratedEffect
): number[] {
  // Determine the contribution of each input emoji.
  const scores = emojis.map(
    emoji =>
      CachedBackgroundEffects['emojiAssociations'][emoji][
        CachedBackgroundEffects['output'].indexOf(effect.backgroundEffect)
      ] +
      CachedForegroundEffects['emojiAssociations'][emoji][
        CachedForegroundEffects['output'].indexOf(effect.foregroundEffect)
      ] +
      CachedPalettes['emojiAssociations'][emoji][
        CachedPalettes['output'].indexOf(effect.backgroundColor)
      ]
  );

  return scores;
}

/**
 * Looks up and sums element-wise precalculated vector weights for each input as a condensed final output
 * Emulates summation process for final classifier output layer of a machine learning model
 * @param {*} emojis, set of three emojis selected by user
 * @param {*} weightsMapping, precalculated association weights for a possible type of output (e.g. background effect, foreground effect or palette)
 * @returns 1d array of values between [0, 3] with indexes that map to output "classes" (e.g. "circles" for BackgroundEffects) Higher values = stronger correlation
 */
function calculateOutputWeightsVector(
  emojis: string[],
  outputWeightsMapping: CachedWeightsMapping
) {
  // selectedEmojiAssociations is an array of 3 subarrays. Each subarray contains
  // the weights for the selected emojis for a particular output type)
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
 * @returns 1d array of tuples in the format ([score], [output key]) e.g. ("0.51", "circles")
 */
function obtainOptions(
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
