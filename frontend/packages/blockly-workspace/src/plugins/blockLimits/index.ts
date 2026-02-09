import * as Blockly from 'blockly/core';

import {createInjectPlugin} from '../../plugins';
import DefaultTheme from '../../themes/default';

import BlockLimitIndicator from './BlockLimitIndicator';
import BlockLimitMap from './BlockLimitMap';

export {BlockLimitMap, BlockLimitIndicator};

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

  // Clear the block counts back to 0
  blockLimitMap.clear();

  // Count the enabled blocks of each type
  eventWorkspace.getAllBlocks().forEach(block => {
    if (blockLimitMap.has(block.type) && block.isEnabled()) {
      blockLimitMap.increment(block.type);
    }
  });

  if ((eventWorkspace as Blockly.WorkspaceSvg).getFlyout) {
    const eventWorkspaceSvg: Blockly.WorkspaceSvg =
      eventWorkspace as Blockly.WorkspaceSvg;
    const flyout = eventWorkspaceSvg.getFlyout();
    if (flyout) {
      // Get all blocks from the flyout
      const flyoutBlocks = flyout.getWorkspace().getTopBlocks();

      // Create limit indicators on flyout blocks
      flyoutBlocks.forEach(flyoutBlock => {
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
  }
}

/**
 * Plugin that adds block limit indicators to the flyout.
 * Shows remaining count for blocks that have usage limits defined in the toolbox.
 */
export const plugin = createInjectPlugin({
  onInit: (workspace, theme) => {
    // TODO have an event for detecting site-wide theme changes
    return new BlockLimitMap(
      workspace.options.languageTree?.contents || [],
      theme || DefaultTheme,
    );
  },
  onChange: changeHandler,
});

export default plugin;
