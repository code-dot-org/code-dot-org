// Event Handlers for Google Blockly.

import * as GoogleBlockly from 'blockly/core';

import {handleWorkspaceResizeOrScroll} from '@cdo/apps/code-studio/callouts';

import BlockSvgLimitIndicator from './addons/blockSvgLimitIndicator';
import {BLOCK_TYPES} from './constants';
import {
  ExtendedBlock,
  ExtendedBlockSvg,
  ExtendedWorkspace,
  ExtendedWorkspaceSvg,
} from './types';
import {updateBlockEnabled, disableOrphanBlocks} from './utils';

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
export function disableOrphans(event: GoogleBlockly.Events.Abstract) {
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
    | GoogleBlockly.Events.BlockChange
    | GoogleBlockly.Events.BlockMove
    | GoogleBlockly.Events.BlockCreate;
  const isEnabledEvent =
    blockEvent.type === Blockly.Events.BLOCK_CHANGE &&
    (blockEvent as GoogleBlockly.Events.BlockChange).element === 'disabled' &&
    !(blockEvent as GoogleBlockly.Events.BlockChange).newValue &&
    (blockEvent as GoogleBlockly.Events.BlockChange).oldValue;

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
    disableOrphanBlocks(eventWorkspace);
  }
}

// When the viewport of the workspace is changed (due to scrolling for example),
// we need to reposition any callouts.
export function adjustCalloutsOnViewportChange(
  event: GoogleBlockly.Events.Abstract
) {
  if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
    handleWorkspaceResizeOrScroll();
  }
}

// When the browser is resized, we need to re-adjust the width of any open flyout.
export function reflowToolbox() {
  const mainWorkspace =
    Blockly.getMainWorkspace() as GoogleBlockly.WorkspaceSvg;
  mainWorkspace?.getFlyout()?.reflow();

  if (Blockly.functionEditor) {
    const modalWorkspace =
      Blockly.getFunctionEditorWorkspace() as GoogleBlockly.WorkspaceSvg;
    modalWorkspace?.getFlyout()?.reflow();
  }
}

// We store the workspace width for RTL workspaces so that we can move
// blocks back to the correct positions after a browser window resize.
// See: https://github.com/google/blockly/issues/8637
export function storeWorkspaceWidth(e: GoogleBlockly.Events.Abstract) {
  if (e.type === Blockly.Events.FINISHED_LOADING && e.workspaceId) {
    const workspace = Blockly.Workspace.getById(
      `${e.workspaceId}`
    ) as ExtendedWorkspaceSvg;
    if (workspace?.RTL && workspace?.rendered) {
      workspace.previousViewWidth = workspace?.getMetrics().viewWidth;
    }
  }
}

export function setPathFill(e: GoogleBlockly.Events.Abstract) {
  if (e.type === Blockly.Events.FINISHED_LOADING && e.workspaceId) {
    const workspace = Blockly.Workspace.getById(
      `${e.workspaceId}`
    ) as ExtendedWorkspace;
    let patternBlocks: ExtendedBlock[] = [];
    patternBlocks = workspace
      .getAllBlocks()
      .map(block => block as ExtendedBlock)
      .filter(block => block.getFillPattern());
    patternBlocks.forEach(block => {
      const pattern = block.getFillPattern();
      if (pattern && block instanceof GoogleBlockly.BlockSvg) {
        block.svgPathFill = Blockly.createSvgElement(
          'path',
          {class: 'blocklyPath'},
          block.getSvgRoot()
        );
        block.svgPathFill.setAttribute('fill', 'url(#' + pattern + ')');
        const pathDescription = block.pathObject.svgPath.getAttribute('d');
        if (pathDescription) {
          block.svgPathFill.setAttribute('d', pathDescription);
        }
      }
    });
  }
}

// Blockly always anchors the workspace to the left, which causes it to
// scroll unexpectedly when the browser is resized. We need to move RTL
// over by the change in workspace width to compensate.
// See: https://github.com/google/blockly/issues/8637
export function bumpRTLBlocks() {
  const studentWorkspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getFunctionEditorWorkspace(),
  ];

  studentWorkspaces.forEach(workspace => {
    if (workspace?.RTL && workspace?.rendered) {
      if (typeof workspace.previousViewWidth === 'number') {
        const newViewWidth = workspace.getMetrics().viewWidth;
        const widthChange = newViewWidth - workspace.previousViewWidth;
        workspace.getTopBlocks().forEach(block => {
          block.moveBy(widthChange, 0);
        });
        workspace.previousViewWidth = newViewWidth;
      }
    }
  });
}

// When blocks on the main workspace are changed, update the block limits indicators.
export function updateBlockLimits(event: GoogleBlockly.Events.Abstract) {
  if (
    ![
      Blockly.Events.BLOCK_CHANGE,
      Blockly.Events.BLOCK_MOVE,
      Blockly.Events.BLOCK_CREATE,
      // High Contrast theme has a different font size, so we update the indicators.
      Blockly.Events.THEME_CHANGE,
    ].includes(event.type)
  ) {
    return;
  }

  const blockLimitMap = Blockly.blockLimitMap;

  if (!event.workspaceId || !blockLimitMap || !(blockLimitMap?.size > 0)) {
    return;
  }
  const eventWorkspace = Blockly.Workspace.getById(
    event.workspaceId
  ) as ExtendedWorkspaceSvg | null;
  if (!eventWorkspace) {
    return;
  }
  const allWorkspaceBlocks = eventWorkspace.getAllBlocks();

  // Define a Map to store block counts for each type
  const blockCountMap = new Map<string, number>();
  Blockly.blockCountMap = blockCountMap;
  // Initialize block counts based on blockLimitMap. Each type needs a value
  // in both maps so that we can calculate the number remaining.
  blockLimitMap.forEach((_, type) => {
    blockCountMap.set(type, 0);
  });
  // Count the enabled blocks of each type
  allWorkspaceBlocks.forEach(block => {
    if (blockLimitMap.has(block.type) && block.isEnabled()) {
      blockCountMap.set(block.type, (blockCountMap.get(block.type) || 0) + 1);
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

  // Create limit indicators on flyout blocks
  flyoutBlocks.forEach(flyoutBlock => {
    const limit = blockLimitMap.get(flyoutBlock.type);
    if (typeof limit !== 'number') {
      return;
    }
    const blockLimitCount = blockLimitMap.get(flyoutBlock.type) as number;
    const blockUsedCount = blockCountMap.get(flyoutBlock.type) as number;
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
