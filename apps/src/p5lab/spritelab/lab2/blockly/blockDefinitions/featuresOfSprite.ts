import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const FEATURES_OF_BLOCK_TYPE = 'spritelab2_featuresOfSprite';

// A sentence is for joining into an "ask AI" question, so the generative
// model sees what the prediction model saw; a list is for the screen.
const definition: BlockJson = {
  type: FEATURES_OF_BLOCK_TYPE,
  message0: 'features of %1 as %2',
  args0: [
    {type: 'input_value', name: 'SPRITE', check: 'Sprite'},
    {
      type: 'field_dropdown',
      name: 'FORMAT',
      options: [
        ['a sentence', 'sentence'],
        ['a list', 'list'],
      ],
    },
  ],
  inputsInline: true,
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
  tooltip:
    "The sprite's feature values as words: a sentence to put in a " +
    'question, or a list with one feature on each line to show.',
};

const generator: GeneratorFunction = (block, generatorInstance) => [
  `featuresOfSprite(${
    generatorInstance.valueToCode(block, 'SPRITE', Order.COMMA) || 'null'
  }, ${JSON.stringify(block.getFieldValue('FORMAT'))})`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
