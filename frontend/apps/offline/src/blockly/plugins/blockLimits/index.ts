import * as Blockly from 'blockly/core';

import {PluginType, WrapPlugin} from '../../plugins';
import type {Plugin} from '../../plugins';
import DefaultTheme from '../../themes/default';
import type {Theme} from '../../types';

import BlockLimitIndicator from './BlockLimitIndicator';
import BlockLimitMap from './BlockLimitMap';

export {BlockLimitMap, BlockLimitIndicator};

export class BlockLimits {
  private blockLimitMap: BlockLimitMap;

  constructor(workspace: Blockly.WorkspaceSvg, theme: Theme) {
    // TODO have an event for detecting site-wide theme changes
    this.blockLimitMap = new BlockLimitMap(
      workspace.options.languageTree?.contents || [],
      theme || DefaultTheme,
    );

    // Bind the event
    workspace.addChangeListener(this.updateBlockLimits.bind(this));
  }

  /**
   * An event for when blocks on the main workspace are changed will update the
   * block limits indicators.
   */
  updateBlockLimits(event: Blockly.Events.Abstract) {
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
    if (!event.workspaceId || this.blockLimitMap.size === 0) {
      return;
    }

    const eventWorkspace = Blockly.Workspace.getById(event.workspaceId);
    if (!eventWorkspace) {
      return;
    }

    // Clear the block counts back to 0
    this.blockLimitMap.clear();

    // Count the enabled blocks of each type
    eventWorkspace.getAllBlocks().forEach(block => {
      if (this.blockLimitMap.has(block.type) && block.isEnabled()) {
        this.blockLimitMap.increment(block.type);
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
          if (this.blockLimitMap.has(flyoutBlock.type)) {
            const remainingCount = this.blockLimitMap.remainingFor(
              flyoutBlock.type,
            );
            const indicator: BlockLimitIndicator =
              this.blockLimitMap.indicatorFor(flyoutBlock.type, flyoutBlock);
            indicator.updateCount(remainingCount);
          }
        });
      }
    }
  }
}

export const plugin: Plugin = {
  type: PluginType.Inject,
  instantiate: WrapPlugin(BlockLimits),
};

export default plugin;
