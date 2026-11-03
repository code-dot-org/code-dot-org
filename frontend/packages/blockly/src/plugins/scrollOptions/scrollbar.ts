import * as Blockly from 'blockly/core';

/**
 * Unpairs a workspace's horizontal/vertical scrollbars and hides either one
 * whose content already fits within the view. Call once, right after injection.
 *
 * Core Blockly keeps *paired* scrollbars permanently visible — it treats the
 * workspace as always larger than the viewport, and only non-paired scrollbars
 * can toggle their own visibility. So this forces `pair` off (the field is
 * declared readonly, hence the cast) and hides each axis that does not currently
 * overflow. Once unpaired, Blockly's own resize logic shows/hides each scrollbar
 * as content crosses the viewport edge — the auto-hide behavior of the legacy
 * lab.
 *
 * Ported from legacy `apps/src/blockly/addons/cdoScrollbar.ts`.
 */
export function initializeScrollbarPair(workspace: Blockly.WorkspaceSvg): void {
  const scrollbar = workspace.scrollbar;
  if (!scrollbar?.hScroll || !scrollbar.vScroll) {
    return;
  }

  // `pair` is readonly; overriding it to break the pair is the whole point.
  (scrollbar.hScroll as unknown as {pair: boolean}).pair = false;
  (scrollbar.vScroll as unknown as {pair: boolean}).pair = false;

  const metrics = workspace.getMetrics();
  if (metrics.contentWidth < metrics.viewWidth) {
    scrollbar.hScroll.setVisible(false);
  }
  if (metrics.contentHeight < metrics.viewHeight) {
    scrollbar.vScroll.setVisible(false);
  }
}
