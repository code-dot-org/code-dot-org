import skinsBase from '../../skins';
import Craft from './craft.js';

exports.load = function (assetUrl, id) {
  const skin = skinsBase.load(assetUrl, id);

  skin.replaceInstructions = function (instructions) {
    if (instructions) {
      return instructions.replace(/{currentPlayerName}/g, Craft.getCurrentCharacter());
    }

    return instructions;
  };

  return skin;
};
