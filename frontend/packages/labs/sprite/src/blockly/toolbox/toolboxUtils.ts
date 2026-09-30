// Toolbox definition helpers. Ported from apps' blockly/utils/toolbox
// (factories.ts, typeGuards.ts, generateToolboxDefinition.ts).

import type * as BlocklyCore from 'blockly/core';

type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
type StaticCategoryInfo = BlocklyCore.utils.toolbox.StaticCategoryInfo;

// Blockly's DynamicCategoryInfo omits the display name, but the runtime
// renders one.
export type NamedDynamicCategoryInfo =
  BlocklyCore.utils.toolbox.DynamicCategoryInfo & {name: string};

export function makeCategory(
  name: string,
  contents: ToolboxItemInfo[],
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
  custom: string,
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

// Blockly types `kind` as string rather than literals, so these guards
// narrow the ToolboxItemInfo union where a kind check alone can't.

// Dynamic categories (custom, no contents) intentionally fail this guard.
export function isStaticCategoryInfo(
  entry: ToolboxItemInfo,
): entry is StaticCategoryInfo {
  return entry.kind === 'category' && 'contents' in entry;
}

export function isBlockInfo(
  entry: ToolboxItemInfo,
): entry is BlocklyCore.utils.toolbox.BlockInfo {
  return entry.kind === 'block' || entry.kind === 'shadow';
}

/** A toolbox of the given blocks, grouped by category or flat. */
export function getToolboxDefinition(
  blocksByCategory: {[category: string]: string[]},
  kind: 'categoryToolbox' | 'flyoutToolbox',
): BlocklyCore.utils.toolbox.ToolboxInfo {
  const categories = Object.keys(blocksByCategory);
  if (kind === 'categoryToolbox') {
    return {
      kind,
      contents: categories.map(categoryName => ({
        kind: 'category',
        name: categoryName,
        contents: blocksByCategory[categoryName].map(type => ({
          kind: 'block',
          type,
        })),
      })),
    };
  }
  return {
    kind,
    contents: categories.flatMap(categoryName =>
      blocksByCategory[categoryName].map(type => ({kind: 'block', type})),
    ),
  };
}
