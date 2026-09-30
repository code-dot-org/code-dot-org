import {BlockStyles} from '../constants';
import {type BlockJson, type GeneratorFunction} from '../types';

// This lab's own "when run" hat: the shared `when_run` type belongs to every
// lab that defines it, Music Lab included.
export const WHEN_RUN_BLOCK_TYPE = 'spritelab2_whenRun';

// The type this lab's projects saved before they had their own.
export const LEGACY_WHEN_RUN_BLOCK_TYPE = 'when_run';

const definition: BlockJson = {
  type: WHEN_RUN_BLOCK_TYPE,
  message0: 'when run',
  nextStatement: true,
  style: BlockStyles.SETUP,
};

// The blocks below the hat are the program; the hat itself adds nothing.
const generator: GeneratorFunction = () => '\n';

export default {definition, generator};
