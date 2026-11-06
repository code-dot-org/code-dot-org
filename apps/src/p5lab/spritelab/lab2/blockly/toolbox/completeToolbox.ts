import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {
  getToolboxDefinition,
  makeDynamicCategory,
} from '@cdo/apps/blockly/utils/toolbox';

import {ASK_AI_BLOCK_TYPE} from '../blockDefinitions/askAi';
import {ASK_AI_WITH_CHOICES_BLOCK_TYPE} from '../blockDefinitions/askAiWithChoices';
import {BURST_BLOCK_TYPE} from '../blockDefinitions/burst';
import {GO_TO_EXTERNAL_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToExternalScene';
import {GO_TO_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToScene';
import {PLAY_MUSIC_BLOCK_TYPE} from '../blockDefinitions/playMusic';
import {PLAY_SOUND_BLOCK_TYPE} from '../blockDefinitions/playSound';
import {PLAY_SOUND_EFFECT_BLOCK_TYPE} from '../blockDefinitions/playSoundEffect';
import {RESTART_SCENE_BLOCK_TYPE} from '../blockDefinitions/restartScene';
import {SET_SYSTEM_PROMPT_BLOCK_TYPE} from '../blockDefinitions/setSystemPrompt';
import {SET_WEATHER_BLOCK_TYPE} from '../blockDefinitions/setWeather';
import {SHOW_TITLE_BLOCK_TYPE} from '../blockDefinitions/showTitle';
import {THE_PLAYER_BLOCK_TYPE} from '../blockDefinitions/thePlayer';
import {WHEN_PLAYER_BLOCK_TYPE} from '../blockDefinitions/whenPlayer';

import {filterToSupportedSharedBlocks} from './supportedSharedBlocks';
import {ToolboxInfo} from './types';

// Where the lab-owned blocks live in the complete toolbox.
const LAB_BLOCKS_BY_CATEGORY: {[category: string]: string[]} = {
  World: [
    SET_WEATHER_BLOCK_TYPE,
    BURST_BLOCK_TYPE,
    PLAY_SOUND_BLOCK_TYPE,
    PLAY_SOUND_EFFECT_BLOCK_TYPE,
    PLAY_MUSIC_BLOCK_TYPE,
  ],
  Sprites: [
    'spritelab2_makePlatformPlayer',
    'spritelab2_makePlatformBlocks',
    'spritelab2_makeSpriteAtGrid',
    'spritelab2_makeSpriteAtPosition',
    'spritelab2_setAsPlatformPlayer',
    THE_PLAYER_BLOCK_TYPE,
  ],
  Events: [WHEN_PLAYER_BLOCK_TYPE],
  Behaviors: [
    'spritelab2_beginsBehavior',
    'spritelab2_movingLeft',
    'spritelab2_movingWithArrowKeys',
    'spritelab2_patrollingLeftRight',
  ],
  'Game Design': [
    GO_TO_SCENE_BLOCK_TYPE,
    GO_TO_EXTERNAL_SCENE_BLOCK_TYPE,
    RESTART_SCENE_BLOCK_TYPE,
    SHOW_TITLE_BLOCK_TYPE,
    'spritelab2_setPlatformGravity',
    'spritelab2_setCameraZoom',
  ],
  AI: [
    ASK_AI_BLOCK_TYPE,
    ASK_AI_WITH_CHOICES_BLOCK_TYPE,
    SET_SYSTEM_PROMPT_BLOCK_TYPE,
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
 * Returns the complete toolbox definition for the given shared blocks and mode.
 * Filters out any shared blocks that are not supported by Sprite Lab in lab2.
 */
export function getCompleteToolboxDefinition(
  sharedBlocksByCategory: {[category: string]: string[]},
  forToolboxEditing: boolean
): ToolboxInfo {
  const merged: {[category: string]: string[]} = {
    ...(forToolboxEditing
      ? {Categories: [BLOCK_TYPES.category, BLOCK_TYPES.categoryDynamic]}
      : {}),
    ...filterToSupportedSharedBlocks(sharedBlocksByCategory),
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
