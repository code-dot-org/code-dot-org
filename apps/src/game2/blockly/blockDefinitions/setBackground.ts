import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

import {getBackgroundOptions} from '../imageRegistry';

export const BLOCK_TYPE = 'Game2_setBackground';

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set background')
        .appendField(new CdoFieldDropdown(getBackgroundOptions), 'IMAGE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.SETUP);
    },
  };
}

export const generator: GeneratorFunction = block => {
  const image = block.getFieldValue('IMAGE');
  return `setBackground('${image}');\n`;
};
