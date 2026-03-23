import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'Game2_bigJump',
  message0: 'Big Jump',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
};

const generator: GeneratorFunction = () => {
  return `bigJump();\n`;
};

export default {definition, generator};
