import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';

/**
 * Redraws a workspace.
 */
export function refreshWorkspace(workspace: ExtendedWorkspaceSvg) {
  const state = Blockly.serialization.workspaces.save(workspace);
  // Do not allow the variables to be redefined as they will conflict when the
  // block data is reloaded.
  const variables = workspace.globalVariables;
  if (variables) {
    workspace.globalVariables = [];
  }
  Blockly.serialization.workspaces.load(state, workspace);
  if (variables) {
    workspace.globalVariables = variables;
  }

  // Handle the toolbox
  const toolbox = workspace.getToolbox();
  if (toolbox) {
    // Close the toolbox when it exists
    toolbox.clearSelection();
  }

  // Handle the flyout as well
  const flyout = workspace.getFlyout(true);
  if (flyout) {
    // Redraw the flyout
    if (workspace.options.languageTree) {
      flyout.show(workspace.options.languageTree);
    }

    // Scroll the flyout to the start
    if (typeof flyout.scrollToStart === 'function') {
      flyout.scrollToStart();
    }
  }
}
