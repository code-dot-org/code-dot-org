// Event Handlers for Google Blockly.

import {handleWorkspaceResizeOrScroll} from '@cdo/apps/code-studio/callouts';
import {BLOCK_TYPES} from './constants';

// A custom version of Blockly's Events.disableOrphans. This makes a couple
// changes to the original function.

// First, it will disable orphans even if the workspace is dragging.
// This enables the preview to update as soon as
// a block is dragged away from "when run", and for a new block to be
// immediately disabled until it is attached to the main block.
// Copied and modified from Blockly/core/events/utils:disableOrphans. The change from
// the original function was to remove a check on eventWorkspace.isDragging():
// https://github.com/google/blockly/blob/1e3b5b4c76f24d2274ef4947c1fcf657f0058f11/core/events/utils.ts#L549

// Second, we also run this event if a block change event fired for a block going from
// enabled to disabled. This is because of a bug in procedure renames.
// When we rename a procedure it triggers all call blocks to be enabled, whether or not
// they are orphans. The only event we have for this is the block change event from enabled
// to disabled, so we run our check on that event to re-enable any orphaned call blocks.
// Related to this, moving a procedure definition on the main workspace also enables all call blocks.
// We re-disable any orphan call blocks when the definition block is dragged.
// This bug is tracked by the Blockly team:
// https://github.com/google/blockly-samples/issues/2035
export function disableOrphans(blockEvent) {
  // This check is for when a block goes from disabled to enabled (value false is enabled).
  // We need to run the check on this event due to the Blockly bug described above.
  const isEnabledEvent =
    blockEvent.type === Blockly.Events.BLOCK_CHANGE &&
    blockEvent.element === 'disabled' &&
    !blockEvent.newValue &&
    blockEvent.oldValue;
  if (!blockEvent.workspaceId) {
    return;
  }
  const eventWorkspace = Blockly.Workspace.getById(blockEvent.workspaceId);
  if (
    blockEvent.type === Blockly.Events.BLOCK_MOVE ||
    blockEvent.type === Blockly.Events.BLOCK_CREATE ||
    isEnabledEvent
  ) {
    if (!blockEvent.blockId) {
      throw new Error('Encountered a blockEvent without a proper blockId');
    }
    let block = eventWorkspace.getBlockById(blockEvent.blockId);
    if (block) {
      updateBlockEnabled(block);
    }
  } else if (
    blockEvent.type === Blockly.Events.BLOCK_DRAG &&
    eventWorkspace.getBlockById(blockEvent.blockId).type ===
      BLOCK_TYPES.procedureDefinition
  ) {
    // When a function definition is moved, we should not suddenly enable
    // its call blocks.
    eventWorkspace.getTopBlocks().forEach(block => {
      if (block.type === BLOCK_TYPES.procedureCall) {
        block.setEnabled(false);
      }
      updateBlockEnabled(block);
    });
  }
}

function updateBlockEnabled(block) {
  // Changing blocks as part of this event shouldn't be undoable.
  const initialUndoFlag = Blockly.Events.getRecordUndo();
  try {
    Blockly.Events.setRecordUndo(false);
    const parent = block.getParent();
    if (parent && parent.isEnabled()) {
      const children = block.getDescendants(false);
      for (let i = 0, child; (child = children[i]); i++) {
        child.setEnabled(true);
      }
    } else if (block.outputConnection || block.previousConnection) {
      do {
        block.setEnabled(false);
        block = block.getNextBlock();
      } while (block);
    }
  } finally {
    Blockly.Events.setRecordUndo(initialUndoFlag);
  }
}

// When the viewport of the workspace is changed (due to scrolling for example),
// we need to reposition any callouts.
export function adjustCalloutsOnViewportChange(event) {
  if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
    handleWorkspaceResizeOrScroll();
  }
}
