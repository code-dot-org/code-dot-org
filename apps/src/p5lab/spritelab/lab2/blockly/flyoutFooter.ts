// Room at the foot of the flyout for a bar pinned over its bottom edge, and
// the flyout's width for sizing that bar.

import * as BlocklyCore from 'blockly/core';

function flyoutOf(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined
): BlocklyCore.IFlyout | null {
  return workspace?.getFlyout() ?? workspace?.getToolbox()?.getFlyout() ?? null;
}

/**
 * Let the flyout scroll `px` further than its blocks, so the last block can
 * clear a bar pinned over the flyout's bottom. Returns an undo.
 */
export function installFlyoutFooterRoom(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  px: number
): () => void {
  const flyout = flyoutOf(workspace);
  if (!flyout) {
    return () => {};
  }
  const flyoutWorkspace = flyout.getWorkspace();
  const manager = flyoutWorkspace.getMetricsManager();
  const base = manager.getScrollMetrics;
  manager.getScrollMetrics = function (inWorkspaceUnits, view, content) {
    const metrics = base.call(this, inWorkspaceUnits, view, content);
    const scale = inWorkspaceUnits ? flyoutWorkspace.scale : 1;
    return {...metrics, height: metrics.height + px / scale};
  };
  return () => {
    manager.getScrollMetrics = base;
  };
}

/**
 * Report the flyout's width now and whenever it changes. Returns an undo.
 */
export function observeFlyoutWidth(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  onWidth: (px: number) => void
): () => void {
  const flyout = flyoutOf(workspace);
  if (!flyout) {
    return () => {};
  }
  const report = () => onWidth(flyout.getWidth());
  report();
  // The flyout svg's width attribute is what position() writes.
  const svg = flyout.getWorkspace().getParentSvg();
  const observer = new MutationObserver(report);
  observer.observe(svg, {attributes: true, attributeFilter: ['width']});
  return () => observer.disconnect();
}
