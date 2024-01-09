import {CachedWeightsMapping} from '../types';
/**
 * Simple selection function that returns all "classifications"
 * @param {*} outputWeights desired output weight vector to precalculate based on
 * @param {*} associatedOutputJson, precalculated vector weights for each possible type of output (e.g. BackgroundsEffects, ForegroundEffects, etc.)
 * @returns 1d array of subarrays in the format [score, output_option) e.g. [0.51, "circles"]
 */
export function getSortedOptions(
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
