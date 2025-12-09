import {BlockStyles} from '@cdo/apps/blockly/constants';
import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';

const definition: BlockJson = {
  type: 'Dancelab_whenRun',
  message0: commonI18n.whenRun(),
  nextStatement: null,
  style: BlockStyles.SETUP,
};

const generator: GeneratorFunction = (block, generator) => {
  return `whenSetup(function() {
    ${generator.blockToCode(block.getNextBlock())}
  });`;
};

const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};

export default {definition, generator, extendedOptions};
