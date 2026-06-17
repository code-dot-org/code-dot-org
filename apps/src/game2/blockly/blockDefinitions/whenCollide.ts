import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {ExtendedBlock, GeneratorFunction} from '@cdo/apps/blockly/types';

import {getSpriteOptions} from '../imageRegistry';

export const BLOCK_TYPE = 'Game2_whenCollide';

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('When I collide with')
        .appendField(new CdoFieldDropdown(getSpriteOptions), 'IMAGE');
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.EVENT);
    },
  };
}

export const generator: GeneratorFunction = (block, generator) => {
  const image = block.getFieldValue('IMAGE');
  const body = generator.blockToCode(block.getNextBlock());
  return `whenCollide('${image}', function() {\n${body}});\n`;
};

export const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};
