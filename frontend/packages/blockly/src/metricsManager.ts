import {ScrollMetricsManager} from '@blockly/plugin-scroll-options';
import * as Blockly from 'blockly/core';

/**
 * A workspace MetricsManager that anchors content to the top-left corner and
 * bounds the scroll area to the content (plus small margins), rather than
 * Blockly's default half-view margin on every side.
 *
 * Effect: the workspace can only be scrolled to content that is actually
 * outside the visible bounds; when everything fits there is nothing to scroll.
 * Combined with `scrollbars: false` and the `@blockly/plugin-scroll-options`
 * dragger/wheel scrolling, this reproduces the legacy lab: no scrollbars, but
 * blocks can still be pushed off-screen and panned back to.
 *
 * Extends the plugin's {@link ScrollMetricsManager} (which caches content
 * metrics mid-drag) so it composes with that plugin, mirroring legacy
 * `apps/src/blockly/addons/cdoMetricsManager.ts` (minus its Dance-specific
 * bottom-overlay scroll padding).
 *
 * Register via the inject options: `plugins: {metricsManager: TopLeftMetricsManager}`.
 */
export class TopLeftMetricsManager extends ScrollMetricsManager {
  protected override getPaddedContent_(
    viewMetrics: Blockly.MetricsManager.ContainerRegion,
    contentMetrics: Blockly.MetricsManager.ContainerRegion,
  ): {top: number; bottom: number; left: number; right: number} {
    const contentBottom = contentMetrics.top + contentMetrics.height;
    const contentRight = contentMetrics.left + contentMetrics.width;

    // Keep blocks off the edge, and allow a little scroll past the last block.
    // When everything fits these stay within the view, so nothing scrolls.
    const blockMargin = 20;
    const extraVerticalSpace = 100;

    const top = 0;
    const bottom = Math.max(
      contentBottom + extraVerticalSpace,
      viewMetrics.height,
    );

    let left: number;
    let right: number;
    if (this.workspace_.RTL) {
      left = Math.min(contentMetrics.left - blockMargin, viewMetrics.left);
      right = viewMetrics.width;
    } else {
      left = 0;
      right = Math.max(contentRight + blockMargin, viewMetrics.width);
    }

    return {top, left, bottom, right};
  }

  override hasFixedEdges(): boolean {
    // Fix the top/left edges (LTR) so blocks can't be scrolled above/left of the
    // origin; disabled for RTL to avoid a resize bumping blocks under the
    // toolbox (see google/blockly#8637). Matches legacy.
    return !this.workspace_.RTL;
  }
}
