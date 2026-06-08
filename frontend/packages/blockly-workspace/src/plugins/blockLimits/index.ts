import * as Blockly from 'blockly/core';

import {createInjectPlugin} from '../../plugins';
import DefaultTheme from '../../themes/default';

import BlockLimitIndicator from './BlockLimitIndicator';
import BlockLimitMap from './BlockLimitMap';

export {BlockLimitMap, BlockLimitIndicator};

/**
 * Recounts the limited blocks on the workspace and refreshes the
 * remaining-count indicator on each limited flyout block. Safe to call at any
 * time: a no-op when no limits are defined or no flyout exists.
 */
function refreshIndicators(
  workspace: Blockly.Workspace,
  blockLimitMap: BlockLimitMap,
) {
  if (blockLimitMap.size === 0) {
    return;
  }

  // Clear the block counts back to 0, then count the enabled blocks of each
  // limited type currently on the workspace.
  blockLimitMap.clear();
  workspace.getAllBlocks().forEach(block => {
    if (blockLimitMap.has(block.type) && block.isEnabled()) {
      blockLimitMap.increment(block.type);
    }
  });

  const flyout = (workspace as Blockly.WorkspaceSvg).getFlyout?.();
  if (!flyout) {
    return;
  }

  // Update (creating on first sight) the indicator on each limited flyout block.
  flyout
    .getWorkspace()
    .getTopBlocks()
    .forEach(flyoutBlock => {
      if (blockLimitMap.has(flyoutBlock.type)) {
        const remainingCount = blockLimitMap.remainingFor(flyoutBlock.type);
        const indicator: BlockLimitIndicator = blockLimitMap.indicatorFor(
          flyoutBlock.type,
          flyoutBlock,
        );
        indicator.updateCount(remainingCount);
      }
    });
}

/**
 * Creates a change listener that updates block limit indicators.
 */
function changeHandler(
  event: Blockly.Events.Abstract,
  blockLimitMap: BlockLimitMap,
) {
  const expectedEventTypes: string[] = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_MOVE,
    // High Contrast theme has a different font size, so we update the indicators.
    Blockly.Events.THEME_CHANGE,
    // A serialized load (e.g. starting blocks) settles without a per-block move;
    // redraw so those blocks are counted against their limits.
    Blockly.Events.FINISHED_LOADING,
  ];

  // Mask out only certain event types
  if (!expectedEventTypes.includes(event.type)) {
    return;
  }

  // And only if there is a referenced workspace and block limits specified
  if (!event.workspaceId || blockLimitMap.size === 0) {
    return;
  }

  const eventWorkspace = Blockly.Workspace.getById(event.workspaceId);
  if (!eventWorkspace) {
    return;
  }

  refreshIndicators(eventWorkspace, blockLimitMap);
}

/**
 * Plugin that adds block limit indicators to the flyout.
 * Shows remaining count for blocks that have usage limits defined in the toolbox.
 */
export const plugin = createInjectPlugin({
  onInit: (workspace, theme) =>
    // TODO have an event for detecting site-wide theme changes
    new BlockLimitMap(
      workspace.options.languageTree?.contents || [],
      theme || DefaultTheme,
    ),
  // No change event fires on inject, so draw the initial indicators once the
  // flyout has been laid out; otherwise they stay blank until the first block
  // move or theme change. The framework defers this and skips it if the
  // workspace is torn down first.
  onReady: (workspace, _theme, blockLimitMap) =>
    refreshIndicators(workspace, blockLimitMap),
  onChange: changeHandler,
});

export default plugin;
