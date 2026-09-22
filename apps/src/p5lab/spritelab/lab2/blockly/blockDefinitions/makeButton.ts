import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const MAKE_BUTTON_BLOCK_TYPE = 'spritelab2_makeButton';

const definition: BlockJson = {
  type: MAKE_BUTTON_BLOCK_TYPE,
  message0: 'make %1 button %2 at %3',
  args0: [
    {
      type: 'field_dropdown',
      name: 'COLOR',
      options: [
        ['green', 'green'],
        ['blue', 'blue'],
        ['orange', 'orange'],
        ['purple', 'purple'],
        ['gray', 'gray'],
      ],
    },
    {type: 'field_input', name: 'LABEL', text: 'Help Me!'},
    {type: 'input_value', name: 'LOCATION', check: 'Location'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip:
    'A button with words on it. Use "when button clicked" with the same ' +
    'words to make it do something.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `makeButton(${JSON.stringify(block.getFieldValue('LABEL'))}, ${
    generatorInstance.valueToCode(block, 'LOCATION', Order.COMMA) || 'null'
  }, ${JSON.stringify(block.getFieldValue('COLOR'))});\n`;

export default {definition, generator};
