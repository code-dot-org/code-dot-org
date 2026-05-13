import * as BlocklyCore from 'blockly/core';

import {BlockColors} from '../constants';

export const UNKNOWN_BLOCK = {
  unknownBlock: true,
  init: function (this: BlocklyCore.Block) {
    // Unknown blocks use a hard-coded HSV color and are not compatible with themes.
    const [h, s, v] = BlockColors.UNKNOWN;
    this.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
    this.appendDummyInput().appendField('unknown block', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
