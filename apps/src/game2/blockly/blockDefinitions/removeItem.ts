import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

import {getSpriteAndBlockOptions} from '../imageRegistry';

export const BLOCK_TYPE = 'Game2_removeItem';

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Remove')
        .appendField(new CdoFieldDropdown(getSpriteAndBlockOptions), 'IMAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.DEFAULT);
    },
  };
}

export const generator: GeneratorFunction = block => {
  const image = block.getFieldValue('IMAGE');
  return `removeItem('${image}');\n`;
};
