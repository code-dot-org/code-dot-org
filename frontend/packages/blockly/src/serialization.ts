import * as Blockly from 'blockly/core';

import {frameSizes} from './constants';
import {isFunctionBlock} from './mixins/functionBlockMixin';
import type {Collider} from './types';

// Margins for SVG frames for unused blocks and functions
const {
  MARGIN_TOP,
  MARGIN_BOTTOM,
  MARGIN_SIDE: SVG_FRAME_SIDE_PADDING,
  BLOCK_HEADER_HEIGHT,
} = frameSizes;

const WORKSPACE_PADDING = 16;
const SVG_FRAME_HEIGHT = BLOCK_HEADER_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM;
const SVG_FRAME_TOP_PADDING = BLOCK_HEADER_HEIGHT + MARGIN_TOP;
const SORT_BY_POSITION = true;
const VERTICAL_SPACE_BETWEEN_BLOCKS = 10;
const SETUP_TYPES = ['when_run', 'Dancelab_whenSetup'];

/**
 * Returns the vertical space we need to add relative to the previous block's bottom edge
 * when auto-positioning a block.
 * @param {Blockly.Block} block - The block for which to determine vertical spacing
 * @returns {number} Vertical space in pixels; either the default or the default plus extra to accomodate an SVG frame.
 */
function getSpaceBetweenBlocks(block: Blockly.BlockSvg) {
  return (
    VERTICAL_SPACE_BETWEEN_BLOCKS +
    (isFunctionBlock(block) ? SVG_FRAME_TOP_PADDING : 0)
  );
}

/**
 * Partitions JSON objects of the specified types to the front of the list.
 *
 * @param {Object[]} [blocks=[]] - An array of JSON blocks to be partitioned.
 * @param {string[]} [prioritizedBlockTypes=[]] - An array of strings representing block types to move to the front.
 * @returns {Object[]} A new array of JSON blocks partitioned based on their types.
 */
export function partitionJsonBlocksByType(
  blocks: Blockly.BlockSvg[] = [],
  prioritizedBlockTypes: string[] = [],
) {
  const prioritizedBlocks: Blockly.BlockSvg[] = [];
  const remainingBlocks: Blockly.BlockSvg[] = [];

  blocks.forEach(block => {
    const blockType = block.type;
    if (prioritizedBlockTypes.includes(blockType)) {
      prioritizedBlocks.push(block);
    } else {
      remainingBlocks.push(block);
    }
  });

  return [...prioritizedBlocks, ...remainingBlocks];
}

/**
 * Adds a collider to a list of collider objects while maintaining a top-to-bottom ordering
 * @param colliders - An array of colliders sorted from top to bottom
 * @param item - A new collider to add to the array in its sorted position
 * NOTE: This method mutates the input array.
 */
export function insertCollider(colliders: Collider[], newCollider: Collider) {
  const newColliderBottom = newCollider.y + newCollider.height;
  // Returns the index of the first element whose bottom edge is below this one
  const index = colliders.findIndex(currentCollider => {
    const currentColliderBottom = currentCollider.y + currentCollider.height;
    return currentColliderBottom > newColliderBottom;
  });
  const insertionIndex = index !== -1 ? index : colliders.length;
  colliders.splice(insertionIndex, 0, newCollider);
}

/**
 * Determines whether two blocks are overlapping based on their coordinates and dimensions
 * @param collider1
 * @param collider2
 * @returns True if the two colliders (representing blocks) overlap
 */
export function isOverlapping(collider1: Collider, collider2: Collider) {
  // Checks if the left edge of collider1 is to the left of the right edge of the other block
  // and the right edge of collider1 is to the right of the left edge of collider2
  const overlapX =
    collider1.x < collider2.x + collider2.width &&
    collider1.x + collider1.width > collider2.x;
  // Checks if the top edge of the collider1 is above the bottom edge of the collider2
  // and the bottom edge of collider1 is below the top edge of collider2
  const overlapY =
    collider1.y < collider2.y + collider2.height &&
    collider1.y + collider1.height > collider2.y;

  return overlapX && overlapY;
}

/**
 * Determines whether a block is positioned at the edge of the workspace.
 * @param block - the block being considered
 * @returns - true if the block is at the edge of the workspace
 */
export function isBlockAtEdge(block: Blockly.Block) {
  const {defaultX, defaultY} = getDefaultLocation(
    block.workspace as Blockly.WorkspaceSvg,
  );
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultX || y === defaultY;
}

/**
 * Returns the desired x-coordinate for a block given the workspace properties
 * and whether the block needs extra offset to accomodate an SVG frame.
 * @param block - The block for which to determine an x-coordinate
 * @param workspace - The current Blockly workspace
 * @returns Desired coordinate (as far left/right as possible depending on whether we are in LTR or RTL)
 */
function getXCoordinate(
  block: Blockly.BlockSvg,
  workspace: Blockly.WorkspaceSvg,
) {
  const {contentWidth = 0, viewWidth = 0} = workspace
    .getMetricsManager()
    .getMetrics();
  const padding = viewWidth ? WORKSPACE_PADDING : 0;
  const width = viewWidth || contentWidth;

  // SVG frames need additional padding so their edges don't touch the edge of the workspace
  const horizontalOffset = isFunctionBlock(block)
    ? SVG_FRAME_SIDE_PADDING + padding
    : padding;
  // If the workspace is RTL, horizontally mirror the starting position
  return workspace.RTL ? width - horizontalOffset : horizontalOffset;
}

function getYCoordinate(block: Blockly.BlockSvg) {
  return isFunctionBlock(block)
    ? WORKSPACE_PADDING + SVG_FRAME_TOP_PADDING
    : WORKSPACE_PADDING;
}

/**
 * Positions blocks with any mix of user-defined positions and default positions (including all of one or the other)
 * Such that none of the blocks overlap with each other
 * @param blocks - The blocks to position
 * @param workspace - The current Blockly workspace
 */
function adjustBlockPositions(
  blocks: Blockly.BlockSvg[],
  workspace: Blockly.WorkspaceSvg,
) {
  // Ordered colliders tracks the areas occupied by existing blocks; new blocks
  // are added to maintain top-to-bottom ordering
  const orderedColliders: Collider[] = [];
  const blocksToPlace: Blockly.BlockSvg[] = [];
  blocks.forEach(block => {
    if (isBlockAtEdge(block)) {
      blocksToPlace.push(block);
    } else {
      insertCollider(orderedColliders, getCollider(block));
    }
  });

  const {defaultX, defaultY} = getDefaultLocation(workspace);
  blocksToPlace.forEach(block => {
    let {x, y} = block.getRelativeToSurfaceXY();

    // Don't overwrite x- (or y-) coordinate if it is set to something other than the default
    // This retains partially positioned blocks (with either an x- or y-coordinate set)
    if (x === defaultX) {
      x = getXCoordinate(block, workspace);
    }
    if (y === defaultY) {
      y = getYCoordinate(block);
    }

    // Set initial position; collision area must be updated to account for new position
    // every time block is moved
    block.moveTo(new Blockly.utils.Coordinate(x, y));
    let collider = getCollider(block);

    orderedColliders.forEach(orderedCollider => {
      if (isOverlapping(collider, orderedCollider)) {
        y =
          orderedCollider.y +
          orderedCollider.height +
          getSpaceBetweenBlocks(block);
        block.moveTo(new Blockly.utils.Coordinate(x, y));
        collider = getCollider(block);
      }
    });
    insertCollider(orderedColliders, collider);
  });
}

/**
 * Position blocks on a workspace (if they do not already have positions)
 * @param workspace - the current Blockly workspace
 */
export const positionBlocksOnWorkspace: (
  workspace: Blockly.WorkspaceSvg,
) => void = (workspace: Blockly.WorkspaceSvg) => {
  if (!workspace.rendered) {
    return;
  }

  const topBlocks = workspace.getTopBlocks(
    SORT_BY_POSITION,
  ) as Blockly.BlockSvg[];

  // Handles a rare case when immovable setup/when run blocks are not at the top of the workspace
  const orderedBlocksSetupFirst = partitionJsonBlocksByType(
    topBlocks,
    SETUP_TYPES,
  );

  adjustBlockPositions(orderedBlocksSetupFirst, workspace);
};

export function getDefaultLocation(workspaceOverride?: Blockly.WorkspaceSvg) {
  const workspace =
    workspaceOverride || (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  const isRTL = workspace.RTL;

  const {viewWidth = 0} = workspace.getMetricsManager().getMetrics();
  const defaultX = isRTL ? viewWidth : 0;
  const defaultY = 0;

  return {defaultX, defaultY};
}

/**
 * A "collider" is a an object that contains coordinates and dimensions of a block, adjusted
 * for anything that affects the area of the workspace it occupies (for now, just the SVG frame)
 * @typedef Collider
 * @property x - The x-coordinate of the block, adjusted for SVG frame padding
 * @property y - The y-coordinate of the block, adjusted for SVG frame padding
 * @property height - The height of the block, including the SVG frame height
 * @property width - The width of the block, accounting for SVG frame width on either side
 */
function getCollider(block: Blockly.BlockSvg): Collider {
  const position = block.getRelativeToSurfaceXY();
  const size = block.getHeightWidth();

  const collider = {
    ...position,
    ...size,
  };

  // SVG frames require us to account for additional height and width
  if (isFunctionBlock(block)) {
    collider.x -= SVG_FRAME_SIDE_PADDING;
    collider.y -= SVG_FRAME_TOP_PADDING;
    collider.height += SVG_FRAME_HEIGHT;
    collider.width += SVG_FRAME_SIDE_PADDING * 2;
  }

  return collider;
}

/**
 * Takes an XML DOM for the start blocks, and returns them with a particular
 * top level block inserted in front of the first non-function block.  If we already
 * have this block, does nothing.
 */
export function forciblyInsertTopBlock(root: Element, blockType: string) {
  // Look for the given block in the starting blocks
  if (root.querySelector(`block[type="${blockType}"]`)) {
    return;
  }

  const topBlock = document.createElement('block');
  topBlock.setAttribute('type', blockType);
  topBlock.setAttribute('movable', 'false');
  topBlock.setAttribute('deletable', 'false');
  topBlock.setAttribute('id', 'topBlock');

  let numChildren = root.childNodes ? root.childNodes.length : 0;

  // find the first non-function definition block and extract it
  let firstBlock = null,
    i = 0;
  while (i < numChildren && firstBlock === null) {
    const child = root.childNodes[i];
    // only look at element nodes
    if (child.nodeType === 1) {
      const childElement = child as Element;
      const type = childElement.getAttribute('type');
      if (
        type !== 'procedures_defnoreturn' &&
        type !== 'procedures_defreturn'
      ) {
        firstBlock = root.removeChild(childElement);
        numChildren--;
      }
    }
    i++;
  }

  if (firstBlock !== null) {
    // when run -> next -> firstBlock
    const next = document.createElement('next');
    next.appendChild(firstBlock);
    topBlock.appendChild(next);
  }

  if (numChildren > 0) {
    root.insertBefore(topBlock, root.childNodes[0]);
  } else {
    root.appendChild(topBlock);
  }
}
