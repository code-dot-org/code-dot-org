import UntypedCachedBackgrounds from '@cdo/static/dance/ai/model/cached-spacy-background-map.json';
import UntypedCachedForegrounds from '@cdo/static/dance/ai/model/cached-spacy-foreground-map.json';
import UntypedCachedPalettes from '@cdo/static/dance/ai/model/cached-spacy-palette-map.json';

export type CachedWeightsMapping = {
  emojiAssociations: {[key: string]: number[]};
  output: string[];
};

const CachedBackgrounds: CachedWeightsMapping = UntypedCachedBackgrounds;
const CachedForegrounds: CachedWeightsMapping = UntypedCachedForegrounds;
const CachedPalettes: CachedWeightsMapping = UntypedCachedPalettes;
/**
 * Chooses the foreground, background, and palette effects that are most closely associated with
 * the emojis the user selected.
 * @param {array} emojis: the list of emojis the user selected
 * @returns: a JSON string representing an object containing the effects that were chosen, for
 * example: {"backgroundEffect":"sparkles","backgroundColor":"cool","foregroundEffect":"bubbles"}
 */
export function chooseEffects(emojis: string[], topOptions: boolean): any {
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
      const options = topOptions
        ? optionsAll.slice(0, numRandomOptions)
        : optionsAll.slice(-numRandomOptions);
      return options;
    }
  );

  // Clarification of which array correlates to which option.
  const backgroundOptions: [number, string][] = outputOptions[0];
  const foregroundOptions: [number, string][] = outputOptions[1];
  const paletteOptions: [number, string][] = outputOptions[2];

  // Choose random value from top scoring options.
  const chosenEffects = {
    backgroundEffect:
      backgroundOptions[
        Math.floor(Math.random() * backgroundOptions.length)
      ][1],
    backgroundColor:
      paletteOptions[Math.floor(Math.random() * paletteOptions.length)][1],
    foregroundEffect:
      foregroundOptions[
        Math.floor(Math.random() * foregroundOptions.length)
      ][1],
  };

  return chosenEffects;
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
 * Simple selection function that returns the top N number of "classifications"
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
  //.slice(0, numOptions);
  return topOptions;
}
