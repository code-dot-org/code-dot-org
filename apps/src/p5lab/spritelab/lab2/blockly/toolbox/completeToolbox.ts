import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {
  getToolboxDefinition,
  makeDynamicCategory,
} from '@cdo/apps/blockly/utils/toolbox';

import {AI_ANSWER_BLOCK_TYPE} from '../blockDefinitions/aiAnswer';
import {ASK_AI_BLOCK_TYPE} from '../blockDefinitions/askAi';
import {GO_TO_EXTERNAL_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToExternalScene';
import {GO_TO_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToScene';
import {MAKE_BUTTON_BLOCK_TYPE} from '../blockDefinitions/makeButton';
import {MAKE_IMAGE_GRID_BLOCK_TYPE} from '../blockDefinitions/makeImageGrid';
import {PREDICT_BLOCK_TYPE} from '../blockDefinitions/predictForSprite';
import {PREDICTION_OF_BLOCK_TYPE} from '../blockDefinitions/predictionOfSprite';
import {RESTART_SCENE_BLOCK_TYPE} from '../blockDefinitions/restartScene';
import {SET_TRAIT_BLOCK_TYPE} from '../blockDefinitions/setTraitOfSprite';
import {SHOW_TEXT_BLOCK_TYPE} from '../blockDefinitions/showText';
import {SPRITE_CALLED_BLOCK_TYPE} from '../blockDefinitions/spriteCalled';
import {THE_PLAYER_BLOCK_TYPE} from '../blockDefinitions/thePlayer';
import {TRAIT_OF_BLOCK_TYPE} from '../blockDefinitions/traitOfSprite';
import {WHEN_BUTTON_CLICKED_BLOCK_TYPE} from '../blockDefinitions/whenButtonClicked';
import {WHEN_IMAGE_CLICKED_BLOCK_TYPE} from '../blockDefinitions/whenImageClicked';

import {ToolboxInfo} from './types';

// Where the lab-owned blocks live in the complete toolbox.
const LAB_BLOCKS_BY_CATEGORY: {[category: string]: string[]} = {
  Sprites: [
    'spritelab2_makePlatformPlayer',
    'spritelab2_makePlatformBlocks',
    'spritelab2_makeSpriteAtGrid',
    'spritelab2_setAsPlatformPlayer',
    THE_PLAYER_BLOCK_TYPE,
  ],
  Behaviors: [
    'spritelab2_movingLeft',
    'spritelab2_movingWithArrowKeys',
    'spritelab2_patrollingLeftRight',
    'spritelab2_patrollingOnBlocks',
  ],
  'Game Design': [
    GO_TO_SCENE_BLOCK_TYPE,
    GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
    RESTART_SCENE_BLOCK_TYPE,
    'spritelab2_setPlatformGravity',
    'spritelab2_setCameraZoom',
  ],
  AI: [
    SET_TRAIT_BLOCK_TYPE,
    TRAIT_OF_BLOCK_TYPE,
    PREDICT_BLOCK_TYPE,
    PREDICTION_OF_BLOCK_TYPE,
    ASK_AI_BLOCK_TYPE,
    AI_ANSWER_BLOCK_TYPE,
  ],
  App: [
    SHOW_TEXT_BLOCK_TYPE,
    MAKE_BUTTON_BLOCK_TYPE,
    WHEN_BUTTON_CLICKED_BLOCK_TYPE,
    MAKE_IMAGE_GRID_BLOCK_TYPE,
    WHEN_IMAGE_CLICKED_BLOCK_TYPE,
    SPRITE_CALLED_BLOCK_TYPE,
  ],
};

// Blocks registered outside the DB block pool (Blockly core, blocksCommon,
// plugins), which installCustomBlocks doesn't report in its category map.
const COMMON_BLOCKS_BY_CATEGORY: {[category: string]: string[]} = {
  Math: [
    'math_number',
    'math_change',
    'math_random_int',
    'math_arithmetic',
    'math_round',
    'math_single',
    'math_modulo',
    'math_number_property',
  ],
  Logic: [
    'controls_if',
    'logic_compare',
    'logic_operation',
    'logic_negate',
    'logic_boolean',
  ],
  Loops: [
    'controls_repeat_ext',
    'controls_whileUntil',
    'controls_for',
    'controls_flow_statements',
  ],
  Text: ['text_join_simple', 'text'],
  Colour: ['colour_picker', 'colour_random'],
  Variables: ['variables_get', 'sprite_variables_get'],
};

/**
 * Every available block sorted by category: the level's DB block pool plus
 * the lab-owned and common blocks. Toolbox editing leads with the category
 * marker blocks; start mode appends the dynamic Variables/Functions
 * categories instead. Behaviors stays static: the dynamic flyout can't read
 * static contents from JSON toolboxes yet (getLevelToolboxBlocks/CT-8).
 */
export function getCompleteToolboxDefinition(
  sharedBlocksByCategory: {[category: string]: string[]},
  forToolboxEditing: boolean
): ToolboxInfo {
  const merged: {[category: string]: string[]} = {
    ...(forToolboxEditing
      ? {Categories: [BLOCK_TYPES.category, BLOCK_TYPES.categoryDynamic]}
      : {}),
    ...sharedBlocksByCategory,
  };
  [LAB_BLOCKS_BY_CATEGORY, COMMON_BLOCKS_BY_CATEGORY].forEach(byCategory =>
    Object.entries(byCategory).forEach(([name, types]) => {
      const existing = merged[name] || [];
      merged[name] = [...existing, ...types.filter(t => !existing.includes(t))];
    })
  );
  if (forToolboxEditing) {
    return getToolboxDefinition(merged, 'categoryToolbox');
  }
  // Variable blocks come from the dynamic category's flyout instead.
  delete merged.Variables;
  const def = getToolboxDefinition(merged, 'categoryToolbox');
  def.contents.push(
    makeDynamicCategory('Variables', 'VARIABLE'),
    makeDynamicCategory('Functions', 'PROCEDURE')
  );
  return def;
}
