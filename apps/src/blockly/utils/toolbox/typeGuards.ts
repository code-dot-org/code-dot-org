import * as BlocklyCore from 'blockly/core';

type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;

// Blockly ignores a dynamic category's contents. Ours hold the level's own
// blocks, which getCategoryBlocksJson adds to the generated flyout.
export type DynamicCategoryInfo =
  BlocklyCore.utils.toolbox.DynamicCategoryInfo & {
    contents?: BlocklyCore.utils.toolbox.FlyoutItemInfoArray;
  };

// Blockly types `kind` as string rather than literals, so these guards
// narrow the ToolboxItemInfo union where a kind check alone can't.

export function isStaticCategoryInfo(
  entry: ToolboxItemInfo
): entry is BlocklyCore.utils.toolbox.StaticCategoryInfo {
  return (
    entry.kind === 'category' && 'contents' in entry && !('custom' in entry)
  );
}

export function isDynamicCategoryInfo(
  entry: ToolboxItemInfo
): entry is DynamicCategoryInfo {
  return entry.kind === 'category' && 'custom' in entry;
}

export function isBlockInfo(
  entry: ToolboxItemInfo
): entry is BlocklyCore.utils.toolbox.BlockInfo {
  return entry.kind === 'block' || entry.kind === 'shadow';
}
