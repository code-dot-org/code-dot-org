import {ScrollMetricsManager} from '@blockly/plugin-scroll-options';
import * as GoogleBlockly from 'blockly/core';

export default class MetricsManager extends ScrollMetricsManager {
  /** Force content to start in top-left corner, not scroll in all directions.
   * @override
   */
  getPaddedContent_(
    viewMetrics: GoogleBlockly.MetricsManager.ContainerRegion,
    contentMetrics: GoogleBlockly.MetricsManager.ContainerRegion
  ) {
    const contentBottom = contentMetrics.top + contentMetrics.height;
    const contentRight = contentMetrics.left + contentMetrics.width;

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

    const right = Math.max(contentRight, viewMetrics.width);

    return {top, left, bottom, right};
  }

  /**
   * Returns whether the scroll area has fixed edges.
   * Core Blockly doesn't have fixed edges when both the horizontal or vertical scrollbar are present.
   * This keeps blocks from moving past the fixed left/top edges of our workspaces.
   *
   * @returns Whether the scroll area has fixed edges.
   * @override
   */
  hasFixedEdges() {
    return true;
  }
}
