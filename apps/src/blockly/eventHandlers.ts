// Event Handlers for Google Blockly.

import {handleWorkspaceResizeOrScroll} from '@cdo/apps/code-studio/callouts';
import {BLOCK_TYPES} from './constants';
import {Abstract} from 'blockly/core/events/events_abstract';
import {Block, WorkspaceSvg} from 'blockly';
import {ExtendedBlockSvg, ExtendedWorkspaceSvg} from './types';
import BlockSvgLimitIndicator from './addons/blockSvgLimitIndicator';
import type {
  BlockChange,
  BlockMove,
  BlockCreate,
  ThemeChange,
} from 'blockly/core/events/events';

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
export function disableOrphans(event: Abstract) {
  // This check is for when a block goes from disabled to enabled (value false is enabled).
  // We need to run the check on this event due to the Blockly bug described above.
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE
  ) {
    return;
  }
  const blockEvent = event as BlockChange | BlockMove | BlockCreate;
  const isEnabledEvent =
    blockEvent.type === Blockly.Events.BLOCK_CHANGE &&
    (blockEvent as BlockChange).element === 'disabled' &&
    !(blockEvent as BlockChange).newValue &&
    (blockEvent as BlockChange).oldValue;

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
    block &&
    block.type === BLOCK_TYPES.procedureDefinition &&
    eventWorkspace
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

function updateBlockEnabled(block: Block) {
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
      let currentBlock: Block | null = block;
      do {
        currentBlock.setEnabled(false);
        currentBlock = currentBlock.getNextBlock();
      } while (currentBlock);
    }
  } finally {
    Blockly.Events.setRecordUndo(initialUndoFlag);
  }
}

// When the viewport of the workspace is changed (due to scrolling for example),
// we need to reposition any callouts.
export function adjustCalloutsOnViewportChange(event: Abstract) {
  if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
    handleWorkspaceResizeOrScroll();
  }
}

// When the browser is resized, we need to re-adjust the width of any open flyout.
export function reflowToolbox() {
  const mainWorkspace = Blockly.getMainWorkspace() as WorkspaceSvg;
  mainWorkspace?.getFlyout()?.reflow();

  if (Blockly.functionEditor) {
    const modalWorkspace = Blockly.getFunctionEditorWorkspace() as WorkspaceSvg;
    modalWorkspace?.getFlyout()?.reflow();
  }
}
export function updateBlockLimits(event: Abstract) {
  // This check is to update bubbles that show block limits whenever
  // blocks on the main workspace are updated.
  if (
    event.type !== Blockly.Events.BLOCK_CHANGE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.THEME_CHANGE
  ) {
    return;
  }
  const blockEvent = event as
    | BlockChange
    | BlockMove
    | BlockCreate
    | ThemeChange;
  const blockLimitMap = Blockly.blockLimitMap;

  if (!blockEvent.workspaceId || !blockLimitMap || !(blockLimitMap?.size > 0)) {
    return;
  }
  const eventWorkspace = Blockly.Workspace.getById(
    blockEvent.workspaceId
  ) as ExtendedWorkspaceSvg;
  const allWorkspaceBlocks = eventWorkspace?.getAllBlocks();
  if (!allWorkspaceBlocks) {
    return;
  }
  // Define a Map to store block counts for each type
  const blockCountMap = new Map<string, number>();
  Blockly.blockCountMap = blockCountMap;
  // Initialize block counts based on blockLimitMap
  blockLimitMap.forEach((_, type) => {
    blockCountMap.set(type, 0);
  });

  // Count the enabled blocks of each type
  allWorkspaceBlocks
    .filter(block => blockLimitMap.has(block.type) && block.isEnabled())
    .forEach(block => {
      const type = block.type;
      if (blockCountMap.has(type)) {
        const currentCount = blockCountMap.get(type) || 0;
        blockCountMap.set(type, currentCount + 1);
      }
    });

  const flyout = eventWorkspace.getFlyout();
  if (!flyout) {
    return;
  }
  // Get all blocks from the flyout
  const flyoutBlocks = flyout
    .getWorkspace()
    .getTopBlocks() as ExtendedBlockSvg[];

  // Get the flyout blocks that have limits
  const limitedFlyoutBlocks = flyoutBlocks.filter(block => {
    return blockLimitMap.has(block.type);
  });

  limitedFlyoutBlocks.forEach(flyoutBlock => {
    const blockLimitCount = blockLimitMap.get(flyoutBlock.type) as number;
    const blockUsedCount = blockCountMap.get(flyoutBlock.type) || 0;
    const remainingCount = blockLimitCount - blockUsedCount;
    if (flyoutBlock.blockSvgLimitIndicator) {
      flyoutBlock.blockSvgLimitIndicator.updateCount(remainingCount);
    } else {
      flyoutBlock.blockSvgLimitIndicator = new BlockSvgLimitIndicator(
        flyoutBlock,
        remainingCount
      );
    }
  });
}
