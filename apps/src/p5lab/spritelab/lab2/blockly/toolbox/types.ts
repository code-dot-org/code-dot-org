import * as BlocklyCore from 'blockly/core';

import {isStaticCategoryInfo} from '@cdo/apps/blockly/utils/toolbox';

export type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;
export type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
export type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;
export type StaticCategoryInfo = BlocklyCore.utils.toolbox.StaticCategoryInfo;

export function findCategory(
  contents: ToolboxItemInfo[],
  name: string
): StaticCategoryInfo | undefined {
  return contents.filter(isStaticCategoryInfo).find(c => c.name === name);
}
