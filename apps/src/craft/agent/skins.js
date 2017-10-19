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

  skin.instructions2ImageSubstitutions = {
    "agent": '/blockly/media/craft/instructions/agent.png',
    "pressureplate": '/blockly/media/craft/instructions/pressureplate.png',
  };

  return skin;
};
