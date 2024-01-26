/**
 * Initializes the horizontal and vertical scrollbars in a workspace.
 *
 * @param {Object} workspace - The workspace object containing scrollbars and metrics.
 * @param {Blockly.ScrollbarPair} workspace.scrollbar - A set of scrollbars.
 * @param {Blockly.Scrollbar} workspace.scrollbar.hScroll - The horizontal scrollbar.
 * @param {Blockly.Scrollbar} workspace.scrollbar.vScroll - The vertical scrollbar.
 * @returns {void} This function does not return any value.
 */
export function initializeScrollbarPair(workspace) {
  // In Core Blockly, pairs of scrollbars are always visible because the workspace
  // is always larger than the viewport. See the Blockly Playground for an example.
  // https://blockly-demo.appspot.com/static/tests/playground.html
  // Only non-paired scrollbars can have their visibility toggled.
  workspace.scrollbar.hScroll.pair = false;
  workspace.scrollbar.vScroll.pair = false;

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
