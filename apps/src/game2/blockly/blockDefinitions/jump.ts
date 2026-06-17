import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'Game2_jump',
  message0: 'Jump',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
};

const generator: GeneratorFunction = () => {
  return `jump();\n`;
};

export default {definition, generator};
