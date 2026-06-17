import {BlockStyles} from '@cdo/apps/blockly/constants';
import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'Game2_whenStart',
  message0: 'When game starts',
  nextStatement: null,
  style: BlockStyles.SETUP,
};

const generator: GeneratorFunction = (block, generator) => {
  return generator.blockToCode(block.getNextBlock());
};

const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};

export default {definition, generator, extendedOptions};
