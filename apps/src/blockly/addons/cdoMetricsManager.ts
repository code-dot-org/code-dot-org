import {ScrollMetricsManager} from '@blockly/plugin-scroll-options';
import * as GoogleBlockly from 'blockly/core';

type ContainerRegion = GoogleBlockly.MetricsManager.ContainerRegion;
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
   * Returns the metrics for the scroll area of the workspace.
   *
   * Overridden to add extra height to scroll metrics to allow for scrolling
   * past a bottom-anchored overlay (e.g. Dance Lab2 aiCodeGenerate guide).
   *
   * @param opt_getWorkspaceCoordinates True to get the scroll metrics in
   *     workspace coordinates, false to get them in pixel coordinates.
   * @param opt_viewMetrics The view metrics if they have been previously
   *     computed. Passing in null may cause the view metrics to be computed
   *     again, if it is needed.
   * @param opt_contentMetrics The content metrics if they have been previously
   *     computed. Passing in null may cause the content metrics to be computed
   *     again, if it is needed.
   * @returns The metrics for the scroll container.
   */
  getScrollMetrics(
    opt_getWorkspaceCoordinates?: boolean,
    opt_viewMetrics?: ContainerRegion,
    opt_contentMetrics?: ContainerRegion
  ): ContainerRegion {
    // Start with core’s result (already handles scaling on return).
    const baseScrollMetrics = super.getScrollMetrics(
      opt_getWorkspaceCoordinates,
      opt_viewMetrics,
      opt_contentMetrics
    );

    const extraScrollHeightPixels = Blockly.extraScrollHeight || 0;
    if (!extraScrollHeightPixels) {
      return baseScrollMetrics;
    }

    // Work in pixels for the decision, since super() uses pixels internally.
    const scale = (this.workspace_ as GoogleBlockly.WorkspaceSvg).scale || 1;
    const viewPx = opt_viewMetrics ?? this.getViewMetrics(false);
    const contentPx = opt_contentMetrics ?? this.getContentMetrics();
    const fixed = this.getComputedFixedEdges_(viewPx);
    const padded = this.getPaddedContent_(viewPx, contentPx);

    // Allow bottom-most content to sit extraScrollHeightPixels above the viewport bottom.
    // That means the scroll area's bottom must be at least (content.bottom + extraScrollHeightPixels).
    const desiredBottomPx =
      contentPx.top + contentPx.height + extraScrollHeightPixels;

    // Preserve fixed bottom.
    const currentBottomPx =
      fixed.bottom !== undefined ? fixed.bottom : padded.bottom;
    const extraBottomPx = Math.max(0, desiredBottomPx - currentBottomPx);
    if (!extraBottomPx) {
      return baseScrollMetrics;
    }

    // Convert only the delta to the return units (pixels or workspace units).
    const extraInReturnUnits = opt_getWorkspaceCoordinates
      ? extraBottomPx / scale
      : extraBottomPx;

    return {
      ...baseScrollMetrics,
      height: baseScrollMetrics.height + extraInReturnUnits,
    };
  }
}
