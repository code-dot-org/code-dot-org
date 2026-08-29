import category from '@cdo/apps/blockly/blockDefinitions/category';
import custom_category from '@cdo/apps/blockly/blockDefinitions/custom_category';
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
import playMusic from './playMusic';
import restartScene from './restartScene';
import setAsPlatformPlayer from './setAsPlatformPlayer';
import setCameraZoom from './setCameraZoom';
import setPlatformGravity from './setPlatformGravity';
import thePlayer from './thePlayer';

// Lab-owned blocks, defined client-side rather than in the DB block pool. A
// block whose runtime half is interpreted code exports it as helperCode.
const labBlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode?: string;
}[] = [
  goToScene,
  playMusic,
  goToExternalScene,
  restartScene,
  movingLeft,
  movingWithArrowKeys,
  patrollingLeftRight,
  patrollingOnBlocks,
  makePlatformPlayer,
  makeSpriteAtGrid,
  makePlatformBlocks,
  setPlatformGravity,
  setAsPlatformPlayer,
  setCameraZoom,
  thePlayer,
  // Toolbox edit mode's category marker blocks.
  category,
  custom_category,
];

export default labBlockDefinitions;

// The interpreted runtime half, prepended to user code by the engine (shaped
// like level sharedBlocks entries — P5Lab reads .helperCode off each).
export const SPRITELAB2_HELPER_CODE = labBlockDefinitions
  .filter(({helperCode}) => helperCode)
  .map(({helperCode}) => ({helperCode}));
