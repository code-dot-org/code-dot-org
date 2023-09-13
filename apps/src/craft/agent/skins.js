import skinsBase from '../../skins';
import Craft from './craft.js';

const toExport = {};

toExport.load = function (assetUrl, id) {
  const skin = skinsBase.load(assetUrl, id);

  skin.replaceInstructions = function (instructions) {
    if (instructions) {
      return instructions.replace(
        /{currentPlayerName}/g,
        Craft.getCurrentCharacter()
      );
    }

    return instructions;
  };

  skin.instructions2ImageSubstitutions = {
    agent: '/blockly/media/craft/instructions/agent.png',
    NetherPortal: '/blockly/media/craft/instructions/NetherPortal.png',

    // blocks
    PressurePlate_Up: '/blockly/media/craft/instructions/PressurePlate_Up.png',
    Rails_Vertical: '/blockly/media/craft/instructions/Rails_Vertical.png',
    cactus: '/blockly/media/craft/instructions/cactus.png',
    door_iron: '/blockly/media/craft/instructions/door_iron.png',

    // miniblocks
    book_enchanted: '/blockly/media/craft/instructions/book_enchanted.png',
    compass: '/blockly/media/craft/instructions/compass.png',
    diamond_axe: '/blockly/media/craft/instructions/diamond_axe.png',
    diamond_pickaxe: '/blockly/media/craft/instructions/diamond_pickaxe.png',
    diamond_shovel: '/blockly/media/craft/instructions/diamond_shovel.png',
    flint_and_steel: '/blockly/media/craft/instructions/flint_and_steel.png',
    flint: '/blockly/media/craft/instructions/flint.png',
    map_empty: '/blockly/media/craft/instructions/map_empty.png',
    chest: '/blockly/media/craft/instructions/chest.png',
    bucket_empty: '/blockly/media/craft/instructions/bucket_empty.png',
    redstone_torch: '/blockly/media/craft/instructions/redstone_torch.png',
    minecart_normal: '/blockly/media/craft/instructions/minecart_normal.png',
  };

  return skin;
};

export {toExport as default};
