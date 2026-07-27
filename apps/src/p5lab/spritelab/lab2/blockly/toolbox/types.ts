import * as BlocklyCore from 'blockly/core';

import {isStaticCategoryInfo} from '@cdo/apps/blockly/utils/toolbox';

export type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;
export type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
export type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;
export type StaticCategoryInfo = BlocklyCore.utils.toolbox.StaticCategoryInfo;

// Blockly's DynamicCategoryInfo omits the display name, but the runtime
// renders one.
export type NamedDynamicCategoryInfo =
  BlocklyCore.utils.toolbox.DynamicCategoryInfo & {name: string};

export function findCategory(
  contents: ToolboxItemInfo[],
  name: string
): StaticCategoryInfo | undefined {
  return contents.filter(isStaticCategoryInfo).find(c => c.name === name);
}

// Category factories: Blockly declares the styling fields required-but-
// undefined (no `?`), so object literals need every key spelled out.

export function makeCategory(
  name: string,
  contents: ToolboxItemInfo[]
): StaticCategoryInfo {
  return {
    kind: 'category',
    name,
    contents,
    id: undefined,
    categorystyle: undefined,
    colour: undefined,
    cssconfig: undefined,
    hidden: undefined,
  };
}

export function makeDynamicCategory(
  name: string,
  custom: string
): NamedDynamicCategoryInfo {
  return {
    kind: 'category',
    name,
    custom,
    id: undefined,
    categorystyle: undefined,
    colour: undefined,
    cssconfig: undefined,
    hidden: undefined,
  };
}
