import _ from 'lodash';
import {WORKSPACE_PADDING, SETUP_TYPES} from '../constants';
import {partitionBlocksByType} from './cdoUtils';
import {frameSizes} from './cdoConstants';

const {BLOCK_HEADER_HEIGHT, MARGIN_BOTTOM, MARGIN_SIDE, MARGIN_TOP} =
  frameSizes;
const SVG_FRAME_HEIGHT = BLOCK_HEADER_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM;
const SVG_FRAME_SIDE_PADDING = MARGIN_SIDE;
const SVG_FRAME_TOP_PADDING = BLOCK_HEADER_HEIGHT + MARGIN_TOP;
const SORT_BY_POSITION = true;
const VERTICAL_SPACE_BETWEEN_BLOCKS = 10;

export function hasBlocks(workspaceSerialization) {
  return (
    !_.isEmpty(workspaceSerialization) &&
    _.has(workspaceSerialization, 'blocks.blocks')
  );
}

/**
 * Converts XML serialization to JSON using a temporary unrendered workspace.
 * @param {xml} xml - workspace serialization, current/legacy format
 * @return {json} stateToLoad - modern workspace serialization
 */
export function convertXmlToJson(xml) {
  const tempWorkspace = new Blockly.Workspace();

  // domToBlockSpace returns an array of "block" objects with the following properties:
  //   blockly_block: the actual block object created by Blockly
  //   x: the x attribute found in <block/> element
  //   y: the y attribute found in <block/> element
  const xmlBlocks = Blockly.Xml.domToBlockSpace(tempWorkspace, xml);
  const stateToLoad = Blockly.serialization.workspaces.save(tempWorkspace);

  if (xmlBlocks.length && hasBlocks(stateToLoad)) {
    // Create a map of ids (key) and block serializations (value).
    const blockIdMap = stateToLoad.blocks.blocks.reduce(
      (map, blockJson) => map.set(blockJson.id, blockJson),
      new Map()
    );

    addPositionsToState(xmlBlocks, blockIdMap);
  }
  tempWorkspace.dispose();
  return stateToLoad;
}

/**
 * Adds x/y values from XML to JSON serialization.
 * @param {Array<Object>} xmlBlocks - an array of "block" objects containing a block and x/y coordinates
 * @param {Map<String, Object>} blockIdMap - a map of ids (keys) and serialized blocks (values)
 */
export function addPositionsToState(xmlBlocks, blockIdMap) {
  xmlBlocks.forEach(xmlBlock => {
    const blockJson = blockIdMap.get(xmlBlock.blockly_block.id);
    if (blockJson) {
      // Note: If xmlBlock values are NaN, they will be ignored and blockJson values will be used
      blockJson.x = xmlBlock.x || blockJson.x;
      blockJson.y = xmlBlock.y || blockJson.y;
    }
  });
}

/**
 * Position blocks on a workspace (if they do not already have positions)
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {Map} [blockOrderMap] - specifies an original order of blocks from XML
 */
export function positionBlocksOnWorkspace(workspace, blockOrderMap) {
  if (!workspace.rendered) {
    return;
  }

  const topBlocks = workspace.getTopBlocks(SORT_BY_POSITION);
  const orderedBlocks = reorderBlocks(topBlocks, blockOrderMap);
  // Handles a rare case when immovable setup/when run blocks are not at the top of the workspace
  const orderedBlocksSetupFirst = partitionBlocksByType(
    orderedBlocks,
    SETUP_TYPES,
    false
  );

  adjustBlockPositions(orderedBlocksSetupFirst, workspace);
}

function adjustBlockPositions(blocks, workspace) {
  const {contentWidth = 0, viewWidth = 0} = workspace.getMetrics();
  const {RTL} = workspace;

  const padding = viewWidth ? WORKSPACE_PADDING : 0;
  const width = viewWidth || contentWidth;

  // If the workspace is RTL, horizontally mirror the starting position
  let x = RTL ? width - padding : padding;
  let y = padding;

  blocks.forEach((block, idx) => {
    // Blocks that have saved locations (not the default) do not need to be adjusted
    if (!inDefaultLocation(block)) {
      return;
    }

    var size = block.getHeightWidth();
    let overlappingBlock = null;
    while (
      (overlappingBlock = isOverlapping(
        x,
        y,
        size.width,
        size.height,
        idx,
        blocks
      )) !== null
    ) {
      const overlappingBlockPosition =
        overlappingBlock.getRelativeToSurfaceXY();
      const overlappingBlockSize = overlappingBlock.getHeightWidth();
      // Get the bottom y-coordinate of the overlapping block
      y = overlappingBlockPosition.y + overlappingBlockSize.height;
    }

    const hasSvgFrame = !!block.functionalSvg_;
    block.moveTo(getPaddedLocation(x, y, hasSvgFrame, RTL));
    y =
      y + VERTICAL_SPACE_BETWEEN_BLOCKS + (hasSvgFrame ? SVG_FRAME_HEIGHT : 0);
  });
}

function isOverlapping(x, y, width, height, idx, blocks) {
  for (var i = 0; i < blocks.length; i++) {
    var other = blocks[i];
    const otherPosition = other.getRelativeToSurfaceXY();
    const otherSize = other.getHeightWidth();

    // TODO: Can I simplify this check?
    if (i < idx || !inDefaultLocation(other)) {
      // Checks if the left edge of the current block is to the left of the right edge of the other block
      // and the right edge of the current block is to the right of the left edge of the other block
      var overlapX =
        x < otherPosition.x + otherSize.width && x + width > otherPosition.x;
      // Checks if the top edge of the current block is above the bottom edge of the other block
      // and the bottom edge of the current block is below the top edge of the other block
      var overlapY =
        y < otherPosition.y + otherSize.height && y + height > otherPosition.y;
      if (overlapX && overlapY) {
        return other;
      }
    }
  }

  return null;
}

/**
 * Determines where the current block should be positioned, based on the cursor
 * @param {Blockly.Block} block - the block to be moved
 * @param {number} x - an x-coordinate for moving a block
 * @param {number} y - a y-coordinate for moving a block
 */
export function getPaddedLocation(x, y, hasSvgFrame, RTL) {
  const topPadding = hasSvgFrame ? SVG_FRAME_TOP_PADDING : 0;
  const sidePadding = hasSvgFrame ? SVG_FRAME_SIDE_PADDING : 0;

  x = x + (RTL ? -sidePadding : sidePadding);
  y = y + topPadding;

  return {x, y};
}

/**
 * Determines whether a block needs to be repositioned, based on its current position.
 * @param {Blockly.Block} block - the block being considered
 * @return {boolean} - true if the block is at the top corner of the workspace
 */
export function isBlockLocationUnset(block) {
  const {defaultX, defaultY} = getDefaultLocation(block.workspace);
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultX && y === defaultY;
}

/**
 * Determines whether a block needs to be repositioned, based on its current position.
 * @param {Blockly.Block} block - the block being considered
 * @return {boolean} - true if the block is at the top corner of the workspace
 */
export function inDefaultLocation(block) {
  const {defaultX, defaultY} = getDefaultLocation(block.workspace);
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x !== defaultX || y !== defaultY;
}

export const getDefaultLocation = workspaceOverride => {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
  const isRTL = workspace.RTL;

  const {viewWidth = 0} = workspace.getMetrics();
  const defaultX = isRTL ? viewWidth : 0;
  const defaultY = 0;

  return {defaultX, defaultY};
};

// See addEditorWorkspaceBlockConfig on the FunctionEditor for
// the list of properties to undo here
export const resetEditorWorkspaceBlockConfig = (blocks = []) =>
  blocks.forEach(block => {
    const {defaultX, defaultY} = getDefaultLocation();
    block.x = defaultX;
    block.y = defaultY;
    block.movable = true;
  });

/**
 * Reorders an array of blocks based on the given blockOrderMap.
 * If the blockOrderMap is invalid (null or size mismatch), returns the original array.
 *
 * @param {Array} blocks - The array of blocks to be reordered.
 * @param {Map} blockOrderMap - A map with block index as key and the desired order index as value.
 * @returns {Array} The reordered array of blocks or the original array if blockOrderMap is invalid.
 */
function reorderBlocks(blocks, blockOrderMap) {
  if (!blockOrderMap || blockOrderMap.size !== blocks.length) {
    return blocks;
  }
  const orderedBlocks = new Array(blocks.length);
  blocks.forEach((block, index) => {
    orderedBlocks[blockOrderMap.get(index)] = block;
  });

  return orderedBlocks;
}

export function getCombinedSerialization(
  mainWorkspaceSerialization,
  hiddenWorkspaceSerialization
) {
  if (
    !hasBlocks(hiddenWorkspaceSerialization) ||
    !hasBlocks(mainWorkspaceSerialization)
  ) {
    return mainWorkspaceSerialization;
  }

  const combinedSerialization = _.cloneDeep(mainWorkspaceSerialization);
  combinedSerialization.blocks.blocks = _.unionBy(
    mainWorkspaceSerialization.blocks.blocks,
    hiddenWorkspaceSerialization.blocks.blocks,
    'id'
  );
  combinedSerialization.procedures = _.unionBy(
    mainWorkspaceSerialization.procedures,
    hiddenWorkspaceSerialization.procedures,
    'id'
  );
  return combinedSerialization;
}
