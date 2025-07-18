/**
 * This contains our custom Blockly events that we can elect to use to respond to
 * different situations.
 */

import * as Blockly from 'blockly/core';

import {BLOCK_TYPES} from '@blockly-workspace/constants';
import {updateBlockEnabled, disableOrphanBlocks} from '@blockly-workspace/utils';

type State = Blockly.serialization.blocks.State;

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
  const block = eventWorkspace?.getBlockById(blockEvent.blockId);
  if (
    blockEvent.type === Blockly.Events.BLOCK_MOVE ||
    blockEvent.type === Blockly.Events.BLOCK_CREATE ||
    isEnabledEvent
  ) {
    if (block) {
      updateBlockEnabled(block);
    }
  } else if (
    blockEvent.type === Blockly.Events.BLOCK_DRAG &&
    block?.type === BLOCK_TYPES.procedureDefinition &&
    eventWorkspace
  ) {
    disableOrphanBlocks(eventWorkspace);
  }
}

/**
 * Grays out undeletable blocks.
 */
export function grayOutUndeletableBlocks(event: Blockly.Events.Abstract) {
  const expectedEventTypes: string[] = [
    Blockly.Events.BLOCK_CHANGE,
    Blockly.Events.BLOCK_CREATE,
  ];

  // Mask out only certain event types
  if (!expectedEventTypes.includes(event.type)) {
    return;
  }

  const blockEvent = event as
    | Blockly.Events.BlockCreate
    | Blockly.Events.BlockChange;

  if (!blockEvent.blockId || !blockEvent.workspaceId) {
    return;
  }

  const eventWorkspace = Blockly.Workspace.getById(blockEvent.workspaceId);

  const grayOut: (state: State) => void = state => {
    if (!state.id) {
      return;
    }

    const block = eventWorkspace?.getBlockById(state.id);
    if (
      block &&
      eventWorkspace &&
      !block.isDeletable() &&
      block.isMovable() &&
      !eventWorkspace.options.readOnly
    ) {
      block.setColour('#888');
    }

    // Go through the connected blocks that were created with this block
    if (state.next?.block) {
      grayOut(state.next.block);
    }

    // Ditto for inputs
    for (const input of Object.values(state.inputs || {})) {
      if (input.block) {
        grayOut(input.block);
      }
    }
  };

  const blockState: State = (blockEvent.type === Blockly.Events.BLOCK_CREATE &&
    (blockEvent as Blockly.Events.BlockCreate).json) || {
    id: blockEvent.blockId,
    type: '',
  };

  grayOut(blockState);
}
