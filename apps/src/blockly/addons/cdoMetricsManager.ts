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

    // Workspace height is either the length of the blocks or the height of the
    // container, whichever is greater.
    const bottom = Math.max(
      contentBottom + extraVerticalSpace,
      viewMetrics.height
    );

    // A margin to prevent blocks from being flush with the edge of the workspace view.
    const blockMargin = 20;

    let left, right;
    if (this.workspace_.RTL) {
      left = Math.min(contentMetrics.left - blockMargin, viewMetrics.left);
      right = viewMetrics.width;
    } else {
      left = 0;
      right = Math.max(contentRight + blockMargin, viewMetrics.width);
    }

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
    // Fixed edges are disabled in order to prevent blocks being bumped "into bounds"
    // when a browser resize would move them into a space overlapping the toolbox.
    // See: https://github.com/google/blockly/issues/8637
    return !this.workspace_.RTL;
  }

  /**
   * Gets content metrics in either pixel or workspace coordinates.
   * The content area is a rectangle around all the top bounded elements on the
   * workspace (workspace comments and blocks).
   *
   * Overridden to add extra height to content metrics to allow for scrolling
   * past a bottom-anchored overlay (e.g. Dance Lab2 aiCodeGenerate guide).
   *
   * @param opt_getWorkspaceCoordinates True to get the content metrics in
   *     workspace coordinates, false to get them in pixel coordinates.
   * @returns The metrics for the content container.
   */
  getContentMetrics(
    opt_getWorkspaceCoordinates?: boolean
  ): GoogleBlockly.MetricsManager.ContainerRegion {
    const metrics = super.getContentMetrics(opt_getWorkspaceCoordinates);
    return {
      ...metrics,
      height: metrics.height + Blockly.extraScrollHeight,
    };
  }
}
