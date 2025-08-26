import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';

const definition: BlockJson = {
  type: 'when_run',
  message0: commonI18n.whenRun(),
  nextStatement: null,
  style: 'setup_blocks',
};

const generator: GeneratorFunction = block => {
  return `whenSetup(function() {
    ${Blockly.getGenerator().blockToCode(block.getNextBlock())}
  });`;
};

const extendedOptions: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};

export default {definition, generator, extendedOptions};
