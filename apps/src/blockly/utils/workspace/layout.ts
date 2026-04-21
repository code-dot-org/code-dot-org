import * as BlocklyCore from 'blockly/core';

import {frameSizes} from '@cdo/apps/blockly/addons/cdoConstants';
import {WORKSPACE_PADDING, SETUP_TYPES} from '@cdo/apps/blockly/constants';
import {Collider, ExtendedBlockSvg} from '@cdo/apps/blockly/types';

import {partitionJsonBlocksByType} from '../serialization/json';

const {
  BLOCK_HEADER_HEIGHT,
  MARGIN_BOTTOM,
  MARGIN_SIDE: SVG_FRAME_SIDE_PADDING,
  MARGIN_TOP,
} = frameSizes;
const SVG_FRAME_HEIGHT = BLOCK_HEADER_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM;
const SVG_FRAME_TOP_PADDING = BLOCK_HEADER_HEIGHT + MARGIN_TOP;
const SORT_BY_POSITION = true;
const SPACE_BETWEEN_BLOCKS = 10;

/**
 * Returns the desired x-coordinate for a block given the workspace properties
 * and whether the block needs extra offset to accomodate an SVG frame.
 * @param {Blockly.Block} block - The block for which to determine an x-coordinate
 * @param {Blockly.Workspace} workspace - The current Blockly workspace
 * @returns {number} Desired coordinate (as far left/right as possible depending on whether we are in LTR or RTL)
 */
function getXCoordinate(
  block: ExtendedBlockSvg,
  workspace: BlocklyCore.WorkspaceSvg
) {
  const {contentWidth = 0, viewWidth = 0} = workspace.getMetrics();
  const padding = viewWidth ? WORKSPACE_PADDING : 0;
  const width = viewWidth || contentWidth;

  // SVG frames need additional padding so their edges don't touch the edge of the workspace
  const horizontalOffset = block.functionalSvg_
    ? SVG_FRAME_SIDE_PADDING + padding
    : padding;
  // If the workspace is RTL, horizontally mirror the starting position
  return workspace.RTL ? width - horizontalOffset : horizontalOffset;
}

function getYCoordinate(block: ExtendedBlockSvg) {
  return block.functionalSvg_
    ? WORKSPACE_PADDING + SVG_FRAME_TOP_PADDING
    : WORKSPACE_PADDING;
}

/**
 * Returns the vertical space we need to add relative to the previous block's bottom edge
 * when auto-positioning a block.
 * @param {Blockly.Block} block - The block for which to determine vertical spacing
 * @returns {number} Vertical space in pixels; either the default or the default plus extra to accomodate an SVG frame.
 */
function getSpaceBetweenBlocks(block: ExtendedBlockSvg) {
  let verticalSpace = SPACE_BETWEEN_BLOCKS;
  if (block.functionalSvg_) {
    verticalSpace += SVG_FRAME_TOP_PADDING;
  }
  return verticalSpace;
}

/**
 * Position blocks on a workspace (if they do not already have positions)
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 */
export function positionBlocksOnWorkspace(workspace: BlocklyCore.WorkspaceSvg) {
  if (!workspace.rendered) {
    return;
  }

  const topBlocks = workspace.getTopBlocks(
    SORT_BY_POSITION
  ) as ExtendedBlockSvg[];
  // Handles a rare case when immovable setup/when run blocks are not at the top of the workspace
  const orderedBlocksSetupFirst = partitionJsonBlocksByType(
    topBlocks,
    SETUP_TYPES
  );

  adjustBlockPositions(orderedBlocksSetupFirst, workspace);
  cleanUp(workspace);
}

/**
 * Positions blocks with any mix of user-defined positions and default positions (including all of one or the other)
 * Such that none of the blocks overlap with each other
 * @param {Array<Blockly.Block>} blocks - The blocks to position
 * @param {Blockly.Workspace} workspace - The current Blockly workspace
 */
function adjustBlockPositions(
  blocks: ExtendedBlockSvg[],
  workspace: BlocklyCore.WorkspaceSvg
) {
  // Ordered colliders tracks the areas occupied by existing blocks; new blocks
  // are added to maintain top-to-bottom ordering
  const orderedColliders: Collider[] = [];
  const blocksToPlace: ExtendedBlockSvg[] = [];
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
 * A "collider" is a an object that contains coordinates and dimensions of a block, adjusted
 * for anything that affects the area of the workspace it occupies (for now, just the SVG frame)
 * @typedef {Object} Collider
 * @property {number} x - The x-coordinate of the block, adjusted for SVG frame padding
 * @property {number} y - The y-coordinate of the block, adjusted for SVG frame padding
 * @property {number} height - The height of the block, including the SVG frame height
 * @property {number} width - The width of the block, accounting for SVG frame width on either side
 */
function getCollider(block: ExtendedBlockSvg): Collider {
  const workspace = block.workspace as BlocklyCore.WorkspaceSvg;
  const position = block.getRelativeToSurfaceXY();
  const size = block.getHeightWidth();

  const collider = {
    ...position,
    ...size,
  };

  if (workspace.RTL) {
    collider.x -= collider.width; // shift x to be left edge in RTL
  }
  // SVG frames require us to account for additional height and width
  if (block.functionalSvg_) {
    collider.x -= SVG_FRAME_SIDE_PADDING;
    collider.y -= SVG_FRAME_TOP_PADDING;
    collider.height += SVG_FRAME_HEIGHT;
    collider.width += SVG_FRAME_SIDE_PADDING * 2;
  }

  return collider;
}

/**
 * Adds a collider to a list of collider objects while maintaining a top-to-bottom ordering
 * @param {Array<Collider>} colliders - An array of colliders sorted from top to bottom
 * @param {Collider} item - A new collider to add to the array in its sorted position
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
 * @param {Collider} collider1
 * @param {Collider} collider2
 * @returns {boolean} True if the two colliders (representing blocks) overlap
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
 * @param {Blockly.Block} block - the block being considered
 * @returns {boolean} - true if the block is at the edge of the workspace
 */
export function isBlockAtEdge(block: BlocklyCore.Block) {
  const {defaultX, defaultY} = getDefaultLocation(
    block.workspace as BlocklyCore.WorkspaceSvg
  );
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultX || y === defaultY;
}

export const getDefaultLocation = (
  workspaceOverride?: BlocklyCore.WorkspaceSvg
) => {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
  const isRTL = workspace.RTL;

  const {viewWidth = 0} = workspace.getMetrics();
  const defaultX = isRTL ? viewWidth : 0;
  const defaultY = 0;

  return {defaultX, defaultY};
};

/**
 * Repositions blocks on the workspace to eliminate overlaps.
 * Tries moving right first, then down if needed.
 *
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to clean up.
 * @param {boolean} [includeImmovableBlocks=false] - Whether immovable blocks should be repositioned.
 */
export function cleanUp(
  workspace: BlocklyCore.WorkspaceSvg,
  includeImmovableBlocks: boolean = false
) {
  if (!workspace.rendered) return;

  const blocks = workspace.getTopBlocks(SORT_BY_POSITION) as ExtendedBlockSvg[];
  const orderedColliders: Collider[] = [];

  const blocksToPlace: ExtendedBlockSvg[] = [];
  blocks.forEach(block => {
    if (includeImmovableBlocks || block.isMovable()) {
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

    // We constrain horizontal positioning to the width of the view area or block content,
    // whichever is greater. This prevents blocks from being pushed too far to the right.
    const {viewWidth, contentWidth} = workspace.getMetrics();
    const maximumX = Math.max(viewWidth, contentWidth) - WORKSPACE_PADDING;

    orderedColliders.forEach(orderedCollider => {
      if (isOverlapping(collider, orderedCollider)) {
        // Prioritize moving the block down unless it is already to the right of
        // the one it overlaps.
        const idealDirection = workspace.RTL
          ? orderedCollider.x <= collider.x
            ? 'down'
            : 'horizontal'
          : orderedCollider.x >= collider.x
          ? 'down'
          : 'horizontal';

        let canMoveHorizontally = false;
        let candidateX = x;
        const candidateY =
          orderedCollider.y + orderedCollider.height + SPACE_BETWEEN_BLOCKS;

        if (idealDirection === 'horizontal') {
          if (workspace.RTL) {
            // If the workspace is RTL, we need to check if we can move left
            const potentialNewRight = orderedCollider.x - SPACE_BETWEEN_BLOCKS;
            const potentialNewLeft = potentialNewRight - collider.width;
            // The block must be able to fit to the left without pushing further out of the view area.
            if (potentialNewLeft >= 0) {
              canMoveHorizontally = true;
              candidateX = potentialNewRight;
            }
          } else {
            const potentialNewLeft =
              orderedCollider.x + orderedCollider.width + SPACE_BETWEEN_BLOCKS;
            const potentialNewRight = potentialNewLeft + collider.width;
            // The block must be able to fit to the right without pushing further out of the view area.
            if (potentialNewRight < maximumX) {
              canMoveHorizontally = true;
              candidateX = potentialNewLeft;
            }
          }
        }
        if (idealDirection === 'horizontal' && canMoveHorizontally) {
          x = candidateX;
        } else {
          // If we can't move horizontally, we have to move down.
          y = candidateY;
        }
        block.moveTo(new Blockly.utils.Coordinate(x, y));
        collider = getCollider(block);
      }
    });
    insertCollider(orderedColliders, collider);
  });
}
