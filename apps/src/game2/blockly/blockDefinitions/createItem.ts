import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

import {getSpriteOptions} from '../imageRegistry';

export const BLOCK_TYPE = 'Game2_createItem';

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Create item')
        .appendField(new CdoFieldDropdown(getSpriteOptions), 'IMAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.SETUP);
    },
  };
}

export const generator: GeneratorFunction = block => {
  const image = block.getFieldValue('IMAGE');
  return `createItem('${image}');\n`;
};
