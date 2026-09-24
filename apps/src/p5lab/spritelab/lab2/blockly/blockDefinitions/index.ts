import category from '@cdo/apps/blockly/blockDefinitions/category';
import custom_category from '@cdo/apps/blockly/blockDefinitions/custom_category';
import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

import aiAnswer from './aiAnswer';
import askAi from './askAi';
import chosenSprite from './chosenSprite';
import goToExternalScene from './goToExternalScene';
import goToScene from './goToScene';
import makeButton from './makeButton';
import makeChosenSprite from './makeChosenSprite';
import makeImageGrid from './makeImageGrid';
import makePlatformBlocks from './makePlatformBlocks';
import makePlatformPlayer from './makePlatformPlayer';
import makeSpriteAtGrid from './makeSpriteAtGrid';
import makeSpriteAtPosition from './makeSpriteAtPosition';
import movingLeft from './movingLeft';
import movingWithArrowKeys from './movingWithArrowKeys';
import patrollingLeftRight from './patrollingLeftRight';
import patrollingOnBlocks from './patrollingOnBlocks';
import playMusic from './playMusic';
import predictForSprite from './predictForSprite';
import predictionOfSprite from './predictionOfSprite';
import restartScene from './restartScene';
import setAsPlatformPlayer from './setAsPlatformPlayer';
import setCameraZoom from './setCameraZoom';
import setPlatformGravity from './setPlatformGravity';
import setTraitOfSprite from './setTraitOfSprite';
import showText from './showText';
import spriteCalled from './spriteCalled';
import thePlayer from './thePlayer';
import traitOfSprite from './traitOfSprite';
import whenButtonClicked from './whenButtonClicked';
import whenImageClicked from './whenImageClicked';
import whenRun from './whenRun';

// Lab-owned blocks, defined client-side rather than in the DB block pool. A
// block whose runtime half is interpreted code exports it as helperCode.
const labBlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode?: string;
  /** Instance properties set on each block at init. */
  extendedOptions?: Partial<ExtendedBlock>;
}[] = [
  goToScene,
  playMusic,
  whenRun,
  goToExternalScene,
  restartScene,
  movingLeft,
  movingWithArrowKeys,
  patrollingLeftRight,
  patrollingOnBlocks,
  makePlatformPlayer,
  makeSpriteAtGrid,
  makeSpriteAtPosition,
  makePlatformBlocks,
  setPlatformGravity,
  setAsPlatformPlayer,
  setCameraZoom,
  thePlayer,
  setTraitOfSprite,
  traitOfSprite,
  predictForSprite,
  predictionOfSprite,
  showText,
  makeButton,
  whenButtonClicked,
  whenImageClicked,
  chosenSprite,
  makeChosenSprite,
  makeImageGrid,
  spriteCalled,
  askAi,
  aiAnswer,
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
