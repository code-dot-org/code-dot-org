import {Block} from 'blockly';

import {BlockColors} from '../constants';

export const UNKNOWN_BLOCK = {
  unknownBlock: true,
  init: function (this: Block) {
    // Unknown blocks use a hard-coded HSV color and are not compatible with themes.
    Blockly.cdoUtils.handleColorAndStyle(this, BlockColors.UNKNOWN);
    this.appendDummyInput().appendField('unknown block', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
};
