import {CachedWeightsMapping} from '../types';

/**
 * Looks up and sums element-wise precalculated vector weights for each input as a condensed final output.
 * Emulates summation process for final classifier output layer of a machine learning model.
 * @param {*} emojis, set of three emojis selected by user
 * @param {*} outputWeightsMapping, precalculated association weights for a possible type of output
 *    (e.g. background effect, foreground effect or palette)
 * @returns 2d array of values between [0, 3] with an associated output "option"
 *    (e.g. [1.2, "circles"] for BackgroundEffects). The values represent
 *    the correlation between the 3 emojis (summed weights) and each output "option".
 *    Higher values = stronger correlation.
 */
export function calculateOutputSummedWeights(
  emojis: string[],
  outputWeightsMapping: CachedWeightsMapping
): [number, string][] {
  // selectedEmojiAssociations is an array of 3 subarrays. Each subarray contains
  // the weights ranging from [0, 1] for the selected emojis for a particular output type)
  const selectedEmojiAssociations: number[][] = emojis.map(emojiName => {
    return outputWeightsMapping['emojiAssociations'][emojiName];
  });

  // sumWeights is the sum of the weights for set of three emojis for each output type
  const sumWeights: number[] = selectedEmojiAssociations.reduce(
    (accumulator, weights) =>
      accumulator.map((value, index) => value + weights[index])
  );

  const outputNames = outputWeightsMapping['output'];
  return sumWeights.map((summedWeight, index) => [
    summedWeight,
    outputNames[index],
  ]);
}
