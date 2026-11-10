import * as Blockly from 'blockly/core';

/**
 * Unregister a workspace, and the flyout it owns, from Blockly's focus manager
 * so that nothing in them stays focused. Call it just before dispose().
 *
 * Blockly forgets a focused node at unregistration only if it finds the node
 * in the workspace's DOM. A block placed from an external flyout by keyboard,
 * and still moving at disposal, is not found; the stale node then makes the
 * next press on any block throw. Focusing the workspace first leaves nothing
 * to lose.
 */
export function releaseFocus(workspace: Blockly.WorkspaceSvg | undefined) {
  const manager = Blockly.getFocusManager();
  for (const tree of [workspace?.getFlyout()?.getWorkspace(), workspace]) {
    if (!tree || !manager.isRegistered(tree)) {
      continue;
    }
    if (manager.getFocusedNode()?.getFocusableTree() === tree) {
      manager.focusNode(tree.getRootFocusableNode());
    }
    manager.unregisterTree(tree);
  }
}
