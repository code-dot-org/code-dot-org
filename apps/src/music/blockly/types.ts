import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {BlockTypes} from './blockTypes';

// Configuration data for a Music Lab block.
export interface MusicBlockConfig {
  definition: BlockJson<BlockTypes>;
  generator: GeneratorFunction;
}
