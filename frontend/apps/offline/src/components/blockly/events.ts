// This contains our custom Blockly events that we can elect to use to respond to
// different situations.

import * as BlocklyLibrary from 'blockly/core';

import BlockLimitIndicator from './BlockLimitIndicator';
import BlockLimitMap from './BlockLimitMap';
import {BLOCK_TYPES} from './constants';
import {updateBlockEnabled, disableOrphanBlocks} from './utils';

/**
 * A custom version of Blockly's Events.disableOrphans. This makes a couple
 * changes to the original function.
 *
 * First, it will disable orphans even if the workspace is dragging.
 * This enables the preview to update as soon as
 * a block is dragged away from "when run", and for a new block to be
 * immediately disabled until it is attached to the main block.
 * Copied and modified from Blockly/core/events/utils:disableOrphans. The change from
 * the original function was to remove a check on eventWorkspace.isDragging():
 * https: *github.com/google/blockly/blob/1e3b5b4c76f24d2274ef4947c1fcf657f0058f11/core/events/utils.ts#L549

 * Second, we also run this event if a block change event fired for a block going from
 * enabled to disabled. This is because of a bug in procedure renames.
 * When we rename a procedure it triggers all call blocks to be enabled, whether or not
 * they are orphans. The only event we have for this is the block change event from enabled
 * to disabled, so we run our check on that event to re-enable any orphaned call blocks.
 * Related to this, moving a procedure definition on the main workspace also enables all call blocks.
 * We re-disable any orphan call blocks when the definition block is dragged.
 * This bug is tracked by the Blockly team and is currently merged.
 * https://github.com/google/blockly-samples/issues/2035
 */
export function disableOrphans(event: BlocklyLibrary.Events.Abstract) {
  // This check is for when a block goes from disabled to enabled (value false is enabled).
  // We need to run the check on this event due to the Blockly bug described above.
  if (
    event.type !== BlocklyLibrary.Events.BLOCK_CHANGE &&
    event.type !== BlocklyLibrary.Events.BLOCK_MOVE &&
    event.type !== BlocklyLibrary.Events.BLOCK_DRAG &&
    event.type !== BlocklyLibrary.Events.BLOCK_CREATE
  ) {
    return;
  }
  const blockEvent = event as
    | BlocklyLibrary.Events.BlockChange
    | BlocklyLibrary.Events.BlockMove
    | BlocklyLibrary.Events.BlockCreate;
  const isEnabledEvent =
    blockEvent.type === BlocklyLibrary.Events.BLOCK_CHANGE &&
    (blockEvent as BlocklyLibrary.Events.BlockChange).element === 'disabled' &&
    !(blockEvent as BlocklyLibrary.Events.BlockChange).newValue &&
    (blockEvent as BlocklyLibrary.Events.BlockChange).oldValue;

  if (!blockEvent.blockId || !blockEvent.workspaceId) {
    return;
  }

  const eventWorkspace = BlocklyLibrary.Workspace.getById(
    blockEvent.workspaceId,
  );
  const block = eventWorkspace?.getBlockById(blockEvent.blockId);
  if (
    blockEvent.type === BlocklyLibrary.Events.BLOCK_MOVE ||
    blockEvent.type === BlocklyLibrary.Events.BLOCK_CREATE ||
    isEnabledEvent
  ) {
    if (block) {
      updateBlockEnabled(block);
    }
  } else if (
    blockEvent.type === BlocklyLibrary.Events.BLOCK_DRAG &&
    block?.type === BLOCK_TYPES.procedureDefinition &&
    eventWorkspace
  ) {
    disableOrphanBlocks(eventWorkspace);
  }
}

/**
 * An event for when blocks on the main workspace are changed will update the
 * block limits indicators.
 */
export function updateBlockLimits(
  blockLimitMap: BlockLimitMap,
  event: BlocklyLibrary.Events.Abstract,
) {
  const expectedEventTypes: string[] = [
    BlocklyLibrary.Events.BLOCK_CHANGE,
    BlocklyLibrary.Events.BLOCK_MOVE,
    BlocklyLibrary.Events.BLOCK_CREATE,
    // High Contrast theme has a different font size, so we update the indicators.
    BlocklyLibrary.Events.THEME_CHANGE,
  ];

  // Mask out only certain event types
  if (!expectedEventTypes.includes(event.type)) {
    return;
  }

  // And only if there is a referenced workspace and block limits specified
  if (!event.workspaceId || blockLimitMap.size === 0) {
    return;
  }

  const eventWorkspace = BlocklyLibrary.Workspace.getById(event.workspaceId);
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

  const flyout = eventWorkspace.getFlyout();
  if (!flyout) {
    return;
  }

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

/**
 * Grays out undeletable blocks.
 */
export function grayOutUndeletableBlocks(
  event: BlocklyLibrary.Events.Abstract,
) {
  const expectedEventTypes: string[] = [
    BlocklyLibrary.Events.BLOCK_CHANGE,
    BlocklyLibrary.Events.BLOCK_CREATE,
  ];

  // Mask out only certain event types
  if (!expectedEventTypes.includes(event.type)) {
    return;
  }

  const blockEvent = event as
    | BlocklyLibrary.Events.BlockCreate
    | BlocklyLibrary.Events.BlockChange;

  console.log('EVENT', blockEvent);
  if (!blockEvent.blockId || !blockEvent.workspaceId) {
    return;
  }

  const eventWorkspace = BlocklyLibrary.Workspace.getById(
    blockEvent.workspaceId,
  );

  const grayOut = blockDefinition => {
    const block = eventWorkspace?.getBlockById(blockDefinition.id);
    if (
      !block.isDeletable() &&
      block.isMovable() &&
      !eventWorkspace.options.readOnly
    ) {
      block.setColour('#888');
    }

    // Go through the connected blocks that were created with this block
    if (blockDefinition.next?.block) {
      grayOut(blockDefinition.next.block);
    }

    // Ditto for inputs
    for (const input of Object.values(blockDefinition.inputs || {})) {
      grayOut(input.block);
    }
  };

  grayOut(
    blockEvent.json || {
      id: blockEvent.blockId,
    },
  );
}
