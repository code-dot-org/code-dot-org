import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'Game2_startScoring',
  message0: 'Start scoring',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SETUP,
};

const generator: GeneratorFunction = () => {
  return `startScoring();\n`;
};

export default {definition, generator};
