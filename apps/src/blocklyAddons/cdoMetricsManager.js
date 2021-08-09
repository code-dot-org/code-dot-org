import GoogleBlockly from 'blockly/core';

export default class MetricsManager extends GoogleBlockly.MetricsManager {
  /** Force content to start in top-left corner, not scroll in all directions.
   * @override
   */
  getPaddedContent_(viewMetrics, contentMetrics) {
    const contentBottom = contentMetrics.top + contentMetrics.height;

    // Add extra vertical space beneath the last block
    const extraVerticalSpace = 100;

    // Anchor the workspace in the top left corner
    const top = 0;
    const left = 0;

    // Workspace height is either the length of the blocks or the height of the
    // container, whichever is greater.
    const bottom = Math.max(
      contentBottom + extraVerticalSpace,
      viewMetrics.height
    );

    // No horizontal scroll
    const right = viewMetrics.width;

    return {top, left, bottom, right};
  }
}
