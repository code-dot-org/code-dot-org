import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

import {getWorldOptions} from '../worldRegistry';

export const BLOCK_TYPE = 'Game2_setWorld';

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set world')
        .appendField(new CdoFieldDropdown(getWorldOptions), 'WORLD_ID');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.SETUP);
    },
  };
}

export const generator: GeneratorFunction = block => {
  const id = block.getFieldValue('WORLD_ID');
  return `setWorld('${id}');\n`;
};
