import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {getToolboxDefinition} from '@cdo/apps/blockly/utils/toolbox';

import {GO_TO_EXTERNAL_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToExternalScene';
import {GO_TO_SCENE_BLOCK_TYPE} from '../blockDefinitions/goToScene';

import {makeDynamicCategory, ToolboxInfo} from './types';

// Where the lab-owned blocks live in the complete toolbox.
const LAB_BLOCKS_BY_CATEGORY: {[category: string]: string[]} = {
  Sprites: [
    'spritelab2_makePlatformPlayer',
    'spritelab2_makePlatformBlocks',
    'spritelab2_makeSpriteAtGrid',
  ],
  Behaviors: [
    'spritelab2_movingLeft',
    'spritelab2_movingWithArrowKeys',
    'spritelab2_patrollingLeftRight',
    'spritelab2_patrollingOnBlocks',
  ],
  'Game Design': [GO_TO_SCENE_BLOCK_TYPE, GO_TO_EXTERNAL_SCENE_BLOCK_TYPE],
};

// Blocks registered outside the DB pool (Blockly core, blocksCommon, the
// field-colour plugin, Sprite Lab's install): installCustomBlocks never
// reports these in its category map, so list them for the complete toolbox.
// Mirrors GamelabJr#common_blocks plus what our test toolboxes use.
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
 * The complete toolbox for levelbuilder edit modes (legacy
 * Level#complete_toolbox): every available block sorted by category — the
 * level's DB block pool plus the lab-owned and common blocks. Toolbox
 * editing leads with the category marker blocks; start mode instead gets
 * the dynamic Variables/Functions categories so real code can be authored.
 * Behaviors stays a static category: the dynamic flyout can't read static
 * contents out of JSON toolboxes yet (see getLevelToolboxBlocks/CT-8), and
 * losing the predefined behaviors outweighs the create-behavior button.
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
