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
import setAsPlatformPlayer from './setAsPlatformPlayer';
import setPlatformGravity from './setPlatformGravity';

// Lab-owned blocks, defined client-side rather than in the DB block pool. A
// block whose runtime half is interpreted code exports it as helperCode.
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
  setPlatformGravity,
  setAsPlatformPlayer,
];

export default labBlockDefinitions;

// The interpreted runtime half, prepended to user code by the engine (shaped
// like level sharedBlocks entries — P5Lab reads .helperCode off each).
export const SPRITELAB2_HELPER_CODE = labBlockDefinitions
  .filter(({helperCode}) => helperCode)
  .map(({helperCode}) => ({helperCode}));
