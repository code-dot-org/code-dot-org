import {CachedWeightsMapping} from '../types';

/**
 * Looks up and sums element-wise precalculated vector weights for each input as a condensed final output.
 * Emulates summation process for final classifier output layer of a machine learning model.
 * @param {*} emojis, set of three emojis selected by user
 * @param {*} outputWeightsMapping, precalculated association weights for a possible type of output
 *    (e.g. background effect, foreground effect or palette)
 * @returns 1d array of values between [0, 3] with indexes that map to output "option" (e.g. "circles"
 *    for BackgroundEffects) Higher values = stronger correlation
 */
export function calculateOutputSummedWeights(
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
