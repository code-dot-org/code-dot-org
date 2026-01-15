import * as BlocklyCore from 'blockly/core';

import {ToolboxType} from '@cdo/apps/blockly/constants';

export function getToolboxType(workspaceOverride?: BlocklyCore.WorkspaceSvg) {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
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

export function getToolboxWidth(workspaceOverride?: BlocklyCore.WorkspaceSvg) {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType(workspace)) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
  }
  return 0;
}
