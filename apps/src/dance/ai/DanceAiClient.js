import CachedPalettes from '@cdo/static/dance/ai/model/cached-spacy-palette-map.json';
import CachedBackgrounds from '@cdo/static/dance/ai/model/cached-spacy-background-map.json';
import CachedForegrounds from '@cdo/static/dance/ai/model/cached-spacy-foreground-map.json';
import {forEach} from 'lodash';

/**
 * Chooses the foreground, background, and palette effects that are most closely associated with
 * the emojis the user selected.
 * @param {array} emojis: the list of emojis the user selected
 * @returns: a JSON string representing an object containing the effects that were chosen, for
 * example: {"backgroundEffect":"sparkles","backgroundColor":"cool","foregroundEffect":"bubbles"}
 */
export function chooseEffects(emojis) {
  backgroundValues = [];
  foregroundValues = [];
  paletteValues = [];
  emojis.forEach(emojiName => {
    backgroundValues.concat(CachedBackgrounds['emojiAssociations'][emojiName]);
    foregroundValues.concat(CachedForegrounds['emojiAssociations'][emojiName]);
    paletteValues.concat(CachedPalettes['emojiAssociations'][emojiName]);
  });

  // Sum element-wise vectors of selected emojis
  const backgroundSum = backgroundValues.reduce((firstList, secondList) =>
    firstList.map((value, index) => value + secondList[index])
  );
  const foregroundSum = foregroundValues.reduce((firstList, secondList) =>
    firstList.map((value, index) => value + secondList[index])
  );
  const paletteSum = paletteValues.reduce((firstList, secondList) =>
    firstList.map((value, index) => value + secondList[index])
  );

  // Sort and slice top scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
  const numRandomOptions = 3;
  const backgroundOptions = backgroundSum
    .map(function (sum, index) {
      return [sum, CachedBackgrounds['output'][index]];
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);
  const foregroundOptions = foregroundSum
    .map(function (sum, index) {
      return [sum, CachedForegrounds['output'][index]];
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);
  const paletteOptions = paletteSum
    .map(function (sum, index) {
      return [sum, CachedPalettes['output'][index]];
      F;
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);

  // Choose random value from top scoring options
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

  debugger;

  return JSON.stringify(chosenEffects);
}
