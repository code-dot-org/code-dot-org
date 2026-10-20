import * as Blockly from 'blockly/core';

import {ToolboxType} from '../constants';

export function getToolboxType(workspaceOverride?: Blockly.WorkspaceSvg) {
  const workspace: Blockly.WorkspaceSvg =
    workspaceOverride || (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  if (!workspace) {
    return;
  }
  // True is passed so we only get the flyout directly owned by the workspace.
  // Otherwise getFlyout will return the flyout for the toolbox if it has categories.
  if (workspace.getFlyout(true)) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.getToolbox()) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth(
  workspaceOverride?: Blockly.WorkspaceSvg,
): number {
  const workspace: Blockly.WorkspaceSvg =
    workspaceOverride || (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  const metrics = workspace.getMetrics();
  switch (getToolboxType(workspace)) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      break;
  }

  return 0;
}

export function updateBlockEnabled(
  block: Blockly.Block,
  reason: string = Blockly.constants.MANUALLY_DISABLED,
) {
  // Changing blocks as part of this event shouldn't be undoable.
  const initialUndoFlag = Blockly.Events.getRecordUndo();
  try {
    Blockly.Events.setRecordUndo(false);
    const parent = block.getParent();
    if (parent && parent.isEnabled()) {
      const children = block.getDescendants(false);
      for (const child of children) {
        child.setDisabledReason(false, reason);
      }
    } else if (block.outputConnection || block.previousConnection) {
      let currentBlock: Blockly.Block | null = block;
      do {
        currentBlock.setDisabledReason(true, reason);
        currentBlock = currentBlock.getNextBlock();
      } while (currentBlock);
    }
  } finally {
    Blockly.Events.setRecordUndo(initialUndoFlag);
  }
}
