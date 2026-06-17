import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

import {getSpriteOptions} from '../imageRegistry';

export const BLOCK_TYPE = 'Game2_setItemBehavior';

const BEHAVIOR_OPTIONS: [string, string][] = [
  ['none', 'none'],
  ['move', 'move'],
  ['platform', 'platform'],
];

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set item')
        .appendField(new CdoFieldDropdown(getSpriteOptions), 'IMAGE')
        .appendField('behavior')
        .appendField(new CdoFieldDropdown(BEHAVIOR_OPTIONS), 'BEHAVIOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.BEHAVIOR);
    },
  };
}

export const generator: GeneratorFunction = block => {
  const image = block.getFieldValue('IMAGE');
  const behavior = block.getFieldValue('BEHAVIOR');
  return `setItemBehavior('${image}', '${behavior}');\n`;
};
