import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import goToExternalScene from './goToExternalScene';
import goToScene from './goToScene';
import makePlatformBlocks from './makePlatformBlocks';
import makePlatformPlayer from './makePlatformPlayer';
import makeSpriteAtGrid from './makeSpriteAtGrid';
import movingLeft from './movingLeft';
import movingWithArrowKeys from './movingWithArrowKeys';
import patrollingLeftRight from './patrollingLeftRight';
import patrollingOnBlocks from './patrollingOnBlocks';

// Lab-owned blocks, defined client-side (not in the DB block pool): the scene
// blocks because their dropdown options are the project's scenes, which only
// this lab knows, plus the behaviors and grid composites. A block whose
// runtime half is interpreted code exports it as helperCode; picker option
// values are pre-quoted and grid field values are 2d arrays, so generators
// drop both into calls as source text.
const labBlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode?: string;
}[] = [
  goToScene,
  goToExternalScene,
  movingLeft,
  movingWithArrowKeys,
  patrollingLeftRight,
  patrollingOnBlocks,
  makePlatformPlayer,
  makeSpriteAtGrid,
  makePlatformBlocks,
];

export default labBlockDefinitions;

// The interpreted runtime half, prepended to user code by the engine (shaped
// like level sharedBlocks entries — P5Lab reads .helperCode off each).
export const SPRITELAB2_HELPER_CODE = labBlockDefinitions
  .filter(({helperCode}) => helperCode)
  .map(({helperCode}) => ({helperCode}));
