import * as BlocklyCore from 'blockly/core';

type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;

// Blockly types `kind` as string rather than literals, so these guards
// narrow the ToolboxItemInfo union where a kind check alone can't.

// Dynamic categories (custom, no contents) intentionally fail this guard.
export function isStaticCategoryInfo(
  entry: ToolboxItemInfo
): entry is BlocklyCore.utils.toolbox.StaticCategoryInfo {
  return entry.kind === 'category' && 'contents' in entry;
}

export function isBlockInfo(
  entry: ToolboxItemInfo
): entry is BlocklyCore.utils.toolbox.BlockInfo {
  return entry.kind === 'block' || entry.kind === 'shadow';
}
