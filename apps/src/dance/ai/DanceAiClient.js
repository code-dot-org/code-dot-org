import CachedPalettes from '@cdo/static/dance/ai/model/cached-spacy-palette-map.json';
import CachedBackgrounds from '@cdo/static/dance/ai/model/cached-spacy-background-map.json';
import CachedForegrounds from '@cdo/static/dance/ai/model/cached-spacy-foreground-map.json';

/**
 * Chooses the foreground, background, and palette effects that are most closely associated with
 * the emojis the user selected.
 * @param {array} emojis: the list of emojis the user selected
 * @returns: a JSON string representing an object containing the effects that were chosen, for
 * example: {"backgroundEffect":"sparkles","backgroundColor":"cool","foregroundEffect":"bubbles"}
 */
export function chooseEffects(emojis) {
  var foregroundValues = {};
  var backgroundValues = {};
  var paletteValues = {};
  reformatInputs(foregroundValues, CachedForegrounds);
  reformatInputs(backgroundValues, CachedBackgrounds);
  reformatInputs(paletteValues, CachedPalettes);

  const bestBackground = chooseHighestSum(backgroundValues, emojis);
  const bestForeground = chooseHighestSum(foregroundValues, emojis);
  const bestPalette = chooseHighestSum(paletteValues, emojis);

  const chosenEffects = {
    backgroundEffect: bestBackground.title,
    backgroundColor: bestPalette.title,
    foregroundEffect: bestForeground.title,
  };
  return JSON.stringify(chosenEffects);
}

/**
 * Sums the values in valueMap at each given emoji. Picks the highest value and returns an object
 * formatted like the following example: {title: "circles", value: 0.59}
 * @param {object} valueMap: the set of AI-calculated values for each emoji, for example, all
 * calculated values for backgrounds.
 * @param {array} chosenEmojis: the emojis chosen by the user
 * @returns: an object describing the value with the highest weight.
 */
function chooseHighestSum(valueMap, chosenEmojis) {
  const minimumPossibleValue = -3;
  return Object.keys(valueMap[chosenEmojis[0]]).reduce(
    (highest, effect) => {
      let sum =
        valueMap[chosenEmojis[0]][effect] +
        valueMap[chosenEmojis[1]][effect] +
        valueMap[chosenEmojis[2]][effect];

      return sum > highest.value ? {title: effect, value: sum} : highest;
    },
    {title: '', value: minimumPossibleValue - 1}
  );
}

/**
 * Transforms data between the following formats
  {
    "emojiAssociations": {
      "poopy": {
        "association": [
          -0.06, 0.03
        ]
      },
      "romantic": {
        "association": [
          0.25, 0.17
        ]
      }
    },
    "output": [
      "circles",
      "color_cycle"
    ]
  }
 *
 *  ^^ Old format ^^ New format below
 *
  {
    "poopy": {
      "circles": -0.06,
      "color_cycle": 0.03
    }
    "romantic": {
      "circles": 0.25,
      "color_cycle": 0.17
    }
  }
 *
 * @param newObject: an object where the newly formatted data will be stored
 * @param jsonInput: the old data that should be reformatted
 * @returns: null. Instead, it transforms newObject
 */
function reformatInputs(newObject, jsonInput) {
  Object.keys(jsonInput.emojiAssociations).forEach(emoji => {
    newObject[emoji] = {};
    jsonInput.emojiAssociations[emoji].association.forEach(
      (calculatedValue, index) => {
        newObject[emoji][jsonInput.output[index]] = calculatedValue;
      }
    );
  });
}
