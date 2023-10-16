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
  var backgroundValues = [
    CachedBackgrounds['emojiAssociations'][emojis[0]],
    CachedBackgrounds['emojiAssociations'][emojis[1]],
    CachedBackgrounds['emojiAssociations'][emojis[2]],
  ];

  var foregroundValues = [
    CachedForegrounds['emojiAssociations'][emojis[0]],
    CachedForegrounds['emojiAssociations'][emojis[1]],
    CachedForegrounds['emojiAssociations'][emojis[2]],
  ];

  var paletteValues = [
    CachedPalettes['emojiAssociations'][emojis[0]],
    CachedPalettes['emojiAssociations'][emojis[1]],
    CachedPalettes['emojiAssociations'][emojis[2]],
  ];

  // Sum element-wise vectors of selected emojis
  const bg_sum = backgroundValues.reduce((a, b) =>
    a.map((val, index) => val + b[index])
  );
  const fg_sum = foregroundValues.reduce((a, b) =>
    a.map((val, index) => val + b[index])
  );
  const palette_sum = paletteValues.reduce((a, b) =>
    a.map((val, index) => val + b[index])
  );

  // Sort and slice top scoring options, mapped to their output identifiers (e.g. [[0.25, 'squiggles'], ...])
  const numRandomOptions = 3;
  const bg_options = bg_sum
    .map(function (sum, index) {
      return [sum, CachedBackgrounds['output'][index]];
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);
  const fg_options = fg_sum
    .map(function (sum, index) {
      return [sum, CachedForegrounds['output'][index]];
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);
  const palette_options = palette_sum
    .map(function (sum, index) {
      return [sum, CachedPalettes['output'][index]];
    })
    .sort()
    .reverse()
    .slice(0, numRandomOptions);

  // Choose random value from top scoring options
  const chosenEffects = {
    backgroundEffect:
      bg_options[Math.floor(Math.random() * bg_options.length)][1],
    backgroundColor:
      palette_options[Math.floor(Math.random() * palette_options.length)][1],
    foregroundEffect:
      fg_options[Math.floor(Math.random() * fg_options.length)][1],
  };

  return JSON.stringify(chosenEffects);
}
