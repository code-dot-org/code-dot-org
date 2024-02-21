import {ExtendedWorkspaceSvg} from '@cdo/apps/blockly/types';

/**
 * Initializes the horizontal and vertical scrollbars in a workspace.
 *
 * @param {Object} workspace - The workspace object containing scrollbars and metrics.
 * @returns {void} This function does not return any value.
 */
export function initializeScrollbarPair(workspace: ExtendedWorkspaceSvg) {
  if (!workspace.scrollbar?.hScroll || !workspace.scrollbar?.vScroll) {
    return;
  }
  // In Core Blockly, pairs of scrollbars are always visible because the workspace
  // is always larger than the viewport. See the Blockly Playground for an example.
  // https://blockly-demo.appspot.com/static/tests/playground.html
  // Only non-paired scrollbars can have their visibility toggled.
  // This is a hack, Blockly has pair set to be readonly. We force it to change here
  // so we can unpair the two scrollbars.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (workspace.scrollbar.hScroll as any).pair = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (workspace.scrollbar.hScroll as any).pair = false;

  // When both scrollbars are present, Core Blockly would always show them.
  // We can hide either scrollbar if it is not yet needed.
  const metrics = workspace.getMetrics();
  if (metrics.contentWidth < metrics.viewWidth) {
    workspace.scrollbar.hScroll.setVisible(false);
  }
  if (metrics.contentHeight < metrics.viewHeight) {
    workspace.scrollbar.vScroll.setVisible(false);
  }
}
