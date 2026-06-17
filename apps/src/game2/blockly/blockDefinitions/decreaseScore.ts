import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

const definition = {
  type: 'Game2_decreaseScore',
  message0: 'Decrease score by %1',
  args0: [
    {
      type: 'field_number',
      name: 'AMOUNT',
      value: 1,
      min: 0,
      precision: 1,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
};

const generator: GeneratorFunction = block => {
  const amount = block.getFieldValue('AMOUNT');
  return `decreaseScore(${amount});\n`;
};

export default {definition, generator};
