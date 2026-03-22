import {BlockStyles} from '@cdo/apps/blockly/constants';
import {GeneratorFunction} from '@cdo/apps/blockly/types';

const definition = {
  type: 'Game2_showText',
  message0: 'Show text %1',
  args0: [
    {
      type: 'field_input',
      name: 'TEXT',
      text: 'Hello!',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
};

const generator: GeneratorFunction = block => {
  const text = block.getFieldValue('TEXT');
  return `showText('${text.replace(/'/g, "\\'")}');\n`;
};

export default {definition, generator};
