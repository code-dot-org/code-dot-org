import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';

// This lab's own "when run" hat. The shared `when_run` type is defined by
// other labs too — Music Lab redefines it when its player is set up — so
// sharing the type name meant sharing whichever generator installed last.
export const WHEN_RUN_BLOCK_TYPE = 'spritelab2_whenRun';

// The type this lab's projects saved before they had their own.
export const LEGACY_WHEN_RUN_BLOCK_TYPE = 'when_run';

const definition: BlockJson = {
  type: WHEN_RUN_BLOCK_TYPE,
  message0: commonI18n.whenRun(),
  nextStatement: null,
  style: BlockStyles.SETUP,
};

// The blocks below the hat are the program; the hat itself adds nothing.
const generator: GeneratorFunction = () => '\n';

export default {definition, generator};
