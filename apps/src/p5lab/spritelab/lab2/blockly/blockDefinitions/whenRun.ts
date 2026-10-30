import {Block} from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';

// This lab's own "when run" hat: the shared `when_run` type belongs to every
// lab that defines it, Music Lab included.
export const WHEN_RUN_BLOCK_TYPE = 'spritelab2_whenRun';

// The type this lab's projects saved before they had their own.
export const LEGACY_WHEN_RUN_BLOCK_TYPE = 'when_run';

const WHEN_RUN_TYPES: readonly string[] = [
  WHEN_RUN_BLOCK_TYPE,
  LEGACY_WHEN_RUN_BLOCK_TYPE,
];

/** Whether the block's stack hangs from a "when run" hat. */
export const isUnderWhenRun = (block: Block | null): boolean =>
  !!block && WHEN_RUN_TYPES.includes(block.getRootBlock().type);

const definition: BlockJson = {
  type: WHEN_RUN_BLOCK_TYPE,
  message0: commonI18n.whenRun(),
  nextStatement: null,
  style: BlockStyles.SETUP,
};

// The blocks below the hat are the program; the hat itself adds nothing.
const generator: GeneratorFunction = () => '\n';

export default {definition, generator};
