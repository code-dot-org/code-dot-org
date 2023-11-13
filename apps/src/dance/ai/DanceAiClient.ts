import UntypedCachedBackgrounds from '@cdo/static/dance/ai/model/cached_background_effects_map.json';
import UntypedCachedForegrounds from '@cdo/static/dance/ai/model/cached_foreground_effects_map.json';
import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached_palettes_map.json';

import {GeneratedEffect} from '../types';

export enum ChooseEffectsQuality {
  GOOD = 'good',
  BAD = 'bad',
}

export type CachedWeightsMapping = {
  emojiAssociations: {[key: string]: number[]};
  output: string[];
};

const CachedBackgrounds: CachedWeightsMapping = UntypedCachedBackgrounds;
const CachedForegrounds: CachedWeightsMapping = UntypedCachedForegrounds;
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
  emojis: string[],
  quality: ChooseEffectsQuality
): GeneratedEffect {
  // Obtain final summed output weight based off input received
  const outputTypes: CachedWeightsMapping[] = [
    CachedBackgrounds,
    CachedForegrounds,
    CachedPalettes,
  ];
  const outputWeights: number[][] = outputTypes.map(function (map) {
    return calculateOutputWeightsVector(emojis, map);
  });

  // Sort and slice top scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
  const numRandomOptions = 3;
  const outputOptions: [number, string][][] = outputWeights.map(
    (weightVector, i) => {
      const optionsAll = obtainOptions(weightVector, outputTypes[i]);
      const options =
        quality === ChooseEffectsQuality.GOOD
          ? optionsAll.slice(0, numRandomOptions)
          : optionsAll.slice(-numRandomOptions);
      return options;
    }
  );

  // Clarification of which array correlates to which option.
  const backgroundOptions: [number, string][] = outputOptions[0];
  const foregroundOptions: [number, string][] = outputOptions[1];
  const paletteOptions: [number, string][] = outputOptions[2];

  // Choose random values.
  const backgroundEffectOption =
    backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
  const backgroundColorOption =
    paletteOptions[Math.floor(Math.random() * paletteOptions.length)];
  const foregroundEffectOption =
    foregroundOptions[Math.floor(Math.random() * foregroundOptions.length)];

  const chosenEffects = {
    backgroundEffect: backgroundEffectOption[1],
    backgroundColor: backgroundColorOption[1],
    foregroundEffect: foregroundEffectOption[1],
  };

  return chosenEffects;
}

export function getGeneratedEffectScores(
  emojis: string[],
  effect: GeneratedEffect
) {
  // Determine the contribution of each input emoji.
  const scores = emojis.map(
    emoji =>
      CachedBackgrounds['emojiAssociations'][emoji][
        CachedBackgrounds['output'].indexOf(effect.backgroundEffect)
      ] +
      CachedForegrounds['emojiAssociations'][emoji][
        CachedForegrounds['output'].indexOf(effect.foregroundEffect)
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
 * @param {*} emojis, associated input keywords that the model has precalculated
 * @param {*} associatedOutputJson, precalculated vector weights for each possible type of output (e.g. BackgroundsEffects, ForegroundEffects, etc.)
 * @returns 1d array of values between [-3, 3] with indexes that map to output "classes" (e.g. "circles" for BackgroundEffects) Higher values = stronger correlation
 */
function calculateOutputWeightsVector(
  emojis: string[],
  associatedOutputJson: CachedWeightsMapping
) {
  const individualInputVectors: number[][] = emojis.map(emojiName => {
    return associatedOutputJson['emojiAssociations'][emojiName];
  });

  const sumWeights: number[] = individualInputVectors.reduce(
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
