import * as Blockly from 'blockly/core';

import {BlockTypes} from '../../constants';
import {updateBlockEnabled} from '../../utils';
import {createInjectPlugin} from '../../plugins';

/**
 * Disables all blocks that are not attached to a top block.
 */
export function disableOrphanBlocks(eventWorkspace: Blockly.Workspace) {
  // When a function definition is moved, we should not suddenly enable
  // its call blocks.
  eventWorkspace.getTopBlocks().forEach(block => {
    if (block.type === BlockTypes.procedureCall) {
      block.setDisabledReason(true, 'ORPHANED');
    }
    updateBlockEnabled(block, 'ORPHANED');
    (block as Blockly.BlockSvg).getSvgRoot().style.opacity = '';
  });
}

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
export function disableOrphans(event: Blockly.Events.Abstract) {
  // This check is for when a block goes from disabled to enabled (value false is enabled).
  // We need to run the check on this event due to the Blockly bug described above.
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_DRAG &&
    event.type !== Blockly.Events.BLOCK_CREATE
  ) {
    return;
  }
  const blockEvent = event as
    | Blockly.Events.BlockChange
    | Blockly.Events.BlockMove
    | Blockly.Events.BlockCreate;

  const isEnabledEvent =
    blockEvent.type === Blockly.Events.BLOCK_CHANGE &&
    (blockEvent as Blockly.Events.BlockChange).element === 'disabled' &&
    !(blockEvent as Blockly.Events.BlockChange).newValue &&
    (blockEvent as Blockly.Events.BlockChange).oldValue;

  if (!blockEvent.blockId || !blockEvent.workspaceId) {
    return;
  }

  const eventWorkspace = Blockly.Workspace.getById(blockEvent.workspaceId);
  const block = eventWorkspace?.getBlockById(
    blockEvent.blockId,
  ) as Blockly.BlockSvg;
  if (
    blockEvent.type === Blockly.Events.BLOCK_MOVE ||
    blockEvent.type === Blockly.Events.BLOCK_CREATE ||
    isEnabledEvent
  ) {
    if (block) {
      updateBlockEnabled(block);

      // Fade the orphaned blocks regardless of what the renderer actually wants
      if (block.isEnabled() || !!block.getParent()) {
        block.getSvgRoot().style.opacity = '';
      } else {
        block.getSvgRoot().style.opacity = '0.5';
      }
    }
  } else if (
    blockEvent.type === Blockly.Events.BLOCK_DRAG &&
    block?.type === BlockTypes.procedureDefinition &&
    eventWorkspace
  ) {
    disableOrphanBlocks(eventWorkspace);
  }
}

/**
 * Plugin that disables blocks that are not connected to the start block.
 */
export const plugin = createInjectPlugin({
  onChange: disableOrphans,
});

export default plugin;
