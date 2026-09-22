import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const SHOW_TEXT_BLOCK_TYPE = 'spritelab2_showText';

// Text is a value input so a prediction or an AI answer can be shown; the
// name is a plain field so the same block always updates the same text.
const definition: BlockJson = {
  type: SHOW_TEXT_BLOCK_TYPE,
  message0: 'show text %1',
  args0: [{type: 'input_value', name: 'TEXT'}],
  message1: 'at %1 size %2 called %3',
  args1: [
    {type: 'input_value', name: 'LOCATION', check: 'Location'},
    {
      type: 'field_dropdown',
      name: 'SIZE',
      options: [
        ['title', 'title'],
        ['heading', 'heading'],
        ['body', 'body'],
        ['small', 'small'],
      ],
    },
    {type: 'field_input', name: 'NAME', text: 'text1'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.TEXT,
  tooltip:
    'Shows words anywhere on the screen. Showing the same name again ' +
    'changes those words instead of adding more.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `showText(${
    generatorInstance.valueToCode(block, 'TEXT', Order.COMMA) || "''"
  }, ${
    generatorInstance.valueToCode(block, 'LOCATION', Order.COMMA) || 'null'
  }, ${JSON.stringify(block.getFieldValue('SIZE'))}, ${JSON.stringify(
    block.getFieldValue('NAME')
  )});\n`;

export default {definition, generator};
