import * as BlocklyCore from 'blockly/core';

import {flyoutCategory} from '@cdo/apps/blockly/customBlocks/variableBlocks';

type FlyoutItemInfoArray = BlocklyCore.utils.toolbox.FlyoutItemInfoArray;
type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;

export const SHOW_VARIABLE_BLOCK_TYPE = 'gamelab_showVariable';
export const HIDE_VARIABLE_BLOCK_TYPE = 'gamelab_hideVariable';
// Top center, so a score reads without covering the play.
export const SHOW_VARIABLE_LOCATION = JSON.stringify({x: 200, y: 30});

/**
 * The Variables category's flyout. Classic levels author show and hide
 * variable into that category, but lab2 generates the category, so its
 * flyout adds them itself, for the variable the set block offers. A block
 * the level's pool lacks is left out.
 */
export function variablesFlyout(
  workspace: BlocklyCore.WorkspaceSvg
): FlyoutItemInfoArray {
  const flyout = flyoutCategory(workspace);
  const setter = flyout.find(
    item => (item as BlockInfo).type === 'variables_set'
  ) as BlockInfo | undefined;
  if (!setter) {
    return flyout;
  }
  const VAR = setter.fields?.VAR;
  const variableBlocks = [
    {
      kind: 'block',
      type: SHOW_VARIABLE_BLOCK_TYPE,
      fields: {VAR},
      inputs: {
        LOCATION: {
          shadow: {
            type: 'gamelab_location_picker',
            fields: {LOCATION: SHOW_VARIABLE_LOCATION},
          },
        },
      },
    },
    {kind: 'block', type: HIDE_VARIABLE_BLOCK_TYPE, fields: {VAR}},
  ] satisfies BlockInfo[];
  return [
    ...flyout,
    ...variableBlocks.filter(block => Blockly.Blocks[block.type]),
  ];
}
