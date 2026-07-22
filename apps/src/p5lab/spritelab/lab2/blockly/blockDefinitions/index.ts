import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {SPRITELAB2_EXTRA_BLOCKS} from './extraBlocks';
import goToExternalScene from './goToExternalScene';
import goToScene from './goToScene';

// Lab-owned blocks, defined client-side (not in the DB block pool): the
// scene blocks because their dropdown options are the project's scenes,
// which only this lab knows, and the behaviors/grid composites (see
// extraBlocks.ts).
const labBlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
}[] = [goToScene, goToExternalScene, ...SPRITELAB2_EXTRA_BLOCKS];

export default labBlockDefinitions;
