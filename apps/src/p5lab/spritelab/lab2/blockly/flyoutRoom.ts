// Room the catalog asks of the flyout: a wider margin for the dots beside
// its blocks, space at its foot for the bar pinned over its bottom edge,
// and the flyout's width for sizing that bar.

import * as BlocklyCore from 'blockly/core';

function flyoutOf(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined
): BlocklyCore.IFlyout | null {
  // getFlyout covers a flyout the toolbox owns as well as a standalone one.
  return workspace?.getFlyout() ?? null;
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
 * Report the toolbox column's width now and whenever it changes: the
 * category list when there is one (its flyout comes and goes beside it),
 * otherwise the always-open flyout. Returns an undo.
 */
export function observeToolboxWidth(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  onWidth: (px: number) => void
): () => void {
  const flyout = flyoutOf(workspace);
  if (!flyout) {
    return () => {};
  }
  const toolbox = workspace?.getToolbox();
  const report = () =>
    onWidth(toolbox ? toolbox.getWidth() : flyout.getWidth());
  report();
  // The flyout svg's width attribute is what position() writes; the
  // category list is a div, sized by its contents.
  const observed = toolbox
    ? (toolbox as BlocklyCore.Toolbox).HtmlDiv
    : flyout.getWorkspace().getParentSvg();
  if (!observed) {
    return () => {};
  }
  const observer = new ResizeObserver(report);
  observer.observe(observed);
  return () => observer.disconnect();
}

/**
 * Multiply the flyout's margin, which sets how far its blocks sit from its
 * left edge. The next show() lays the blocks out at the new margin.
 * Returns an undo.
 */
export function widenFlyoutMargin(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
  factor: number
): () => void {
  // Typed read-only; Blockly reads it per layout, so an instance value
  // takes effect.
  const flyout = flyoutOf(workspace) as unknown as {MARGIN: number} | null;
  if (!flyout) {
    return () => {};
  }
  const base = flyout.MARGIN;
  flyout.MARGIN = base * factor;
  return () => {
    flyout.MARGIN = base;
  };
}
