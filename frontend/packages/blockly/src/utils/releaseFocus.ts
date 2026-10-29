import * as Blockly from 'blockly/core';

/**
 * Unregister a workspace, and the flyout it owns, from Blockly's focus manager
 * so that nothing in them stays focused. Call it just before dispose().
 *
 * Unregistering clears focus only when it can find the focused node in the
 * workspace's DOM. WorkspaceSvg.dispose removes its blocks' DOM first, and a
 * block in a keyboard move lives in the drag layer outside it, so the manager
 * keeps pointing at a dead node; the next press on any block re-focuses it and
 * throws, which cancels the drag. Moving focus to the workspace itself first
 * leaves the manager nothing to lose.
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
