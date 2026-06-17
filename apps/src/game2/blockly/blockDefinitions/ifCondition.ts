import CdoFieldDropdown from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {ExtendedBlock, GeneratorFunction} from '@cdo/apps/blockly/types';

export const BLOCK_TYPE = 'Game2_ifCondition';

const CONDITION_OPTIONS: [string, string][] = [
  ['jumping', 'jumping'],
  ['not jumping', 'not_jumping'],
];

export function register() {
  Blockly.Blocks[BLOCK_TYPE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('If')
        .appendField(new CdoFieldDropdown(CONDITION_OPTIONS), 'CONDITION');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(BlockStyles.DEFAULT);
    },
  };
}

export const generator: GeneratorFunction = (block, generator) => {
  const condition = block.getFieldValue('CONDITION');
  const body = generator.statementToCode(block, 'DO');
  if (condition === 'jumping') {
    return `if (isJumping()) {\n${body}}\n`;
  }
  return `if (!isJumping()) {\n${body}}\n`;
};

export const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: false,
};
