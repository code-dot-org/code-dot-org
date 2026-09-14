import * as BlocklyCore from 'blockly/core';

type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
type StaticCategoryInfo = BlocklyCore.utils.toolbox.StaticCategoryInfo;

// Blockly's DynamicCategoryInfo omits the display name, but the runtime
// renders one.
export type NamedDynamicCategoryInfo =
  BlocklyCore.utils.toolbox.DynamicCategoryInfo & {name: string};

export function makeCategory(
  name: string,
  contents: ToolboxItemInfo[]
): StaticCategoryInfo {
  return {
    kind: 'category',
    name,
    contents,
    id: name,
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
    id: name,
    categorystyle: undefined,
    colour: undefined,
    cssconfig: undefined,
    hidden: undefined,
  };
}
