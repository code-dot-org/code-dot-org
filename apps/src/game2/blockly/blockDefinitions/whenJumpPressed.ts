import {BlockStyles} from '@cdo/apps/blockly/constants';
import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'Game2_whenJumpPressed',
  message0: 'When jump pressed',
  nextStatement: null,
  style: BlockStyles.EVENT,
};

const generator: GeneratorFunction = (block, generator) => {
  return `whenJumpPressed(function() {\n${generator.blockToCode(
    block.getNextBlock()
  )}});\n`;
};

const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};

export default {definition, generator, extendedOptions};
