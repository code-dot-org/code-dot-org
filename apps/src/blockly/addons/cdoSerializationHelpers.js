import BlockSvgUnused from './blockSvgUnused';
import {WORKSPACE_PADDING, SETUP_TYPES} from '../constants';
import {partitionBlocksByType} from './cdoXml';
import {frameSizes} from './cdoConstants';

const {HEADER_HEIGHT, MARGIN_BOTTOM, MARGIN_SIDE, MARGIN_TOP} = frameSizes;
const SVG_FRAME_HEIGHT = HEADER_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM;
const SVG_FRAME_SIDE_PADDING = MARGIN_SIDE;
const SVG_FRAME_TOP_PADDING = HEADER_HEIGHT + MARGIN_TOP;
const SORT_BY_POSITION = true;
const VERTICAL_SPACE_BETWEEN_BLOCKS = 10;

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

  if (xmlBlocks.length && stateToLoad.blocks) {
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
      // Do not change values if xmlBlock values are NaN (unspecified in XML)
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
  const {contentWidth = 0, viewWidth = 0} = workspace.getMetrics();
  const padding = viewWidth ? WORKSPACE_PADDING : 0;
  const width = viewWidth || contentWidth;

  // The "cursor" object tracks a position on the workspace that starts in the top
  // corner, then moves below each block that gets manually repositioned.
  let cursor = {
    x: padding,
    y: padding,
  };
  // If the workspace is RTL, horizontally mirror the starting position.
  cursor.x = workspace.RTL ? width - cursor.x : cursor.x;

  const topBlocks = workspace.getTopBlocks(SORT_BY_POSITION);

  const orderedBlocks = reorderBlocks(topBlocks, blockOrderMap);
  // Handles a rare case when immovable setup/when run blocks are not at the top of the workspace
  const orderedBlocksSetupFirst = partitionBlocksByType(
    orderedBlocks,
    SETUP_TYPES
  );

  orderedBlocksSetupFirst.forEach(block => {
    positionBlockWithCursor(block, cursor);
  });
}

/**
 * Use a cursor to position a block on a workspace (if it does not already have a position)
 * @param {Blockly.Block} block - the block to be moved
 * @param {object} cursor - a location for moving a block, if needed
 * @param {number} cursor.x - an x-coordinate for moving a block
 * @param {number} cursor.y - a y-coordinate for moving a block
 * @return {object} the cursor with updated coordinates
 */
function positionBlockWithCursor(block, cursor) {
  addUnusedFrame(block);
  if (isBlockLocationUnset(block)) {
    block.moveTo(getNewLocation(block, cursor));
    cursor.y += getCursorYAdjustment(block);
  }
  return cursor;
}

/**
 * Determines where the current block should be positioned, based on the cursor
 * @param {Blockly.Block} block - the block to be moved
 * @param {object} cursor - a location for moving a block, if needed
 * @param {number} cursor.x - an x-coordinate for moving a block
 * @param {number} cursor.y - a y-coordinate for moving a block
 */
export function getNewLocation(block, cursor) {
  const blockHasFrameSvg = !!block.functionalSvg_ || !!block.unusedSvg_;
  const blockTopPadding = blockHasFrameSvg ? SVG_FRAME_TOP_PADDING : 0;
  const blockSidePadding = blockHasFrameSvg ? SVG_FRAME_SIDE_PADDING : 0;
  const isRTL = block.workspace.RTL;
  const newLocation = {
    x: cursor.x + (isRTL ? -blockSidePadding : blockSidePadding),
    y: cursor.y + blockTopPadding,
  };
  return newLocation;
}

/**
 * Determines the amount to move the cursor down, based on the block that was just positioned.
 * @param {Blockly.Block} block - the block that was just moved
 * @return {number} - the distance to move the cursor down in preparation for the next move
 */
export function getCursorYAdjustment(block) {
  const blockHeight = block.getHeightWidth().height;
  const blockHasFrameSvg = !!block.functionalSvg_ || !!block.unusedSvg_;
  const blockVerticalPadding =
    VERTICAL_SPACE_BETWEEN_BLOCKS + (blockHasFrameSvg ? SVG_FRAME_HEIGHT : 0);
  return blockHeight + blockVerticalPadding;
}

/**
 * Determines whether a block needs to be repositioned, based on its current position.
 * @param {Blockly.Block} block - the block being considered
 * @return {boolean} - true if the block is at the top corner of the workspace
 */
export function isBlockLocationUnset(block) {
  const workspace = block.workspace;
  const isRTL = workspace.RTL;
  const {viewWidth = 0} = workspace.getMetrics();
  const defaultLocation = {
    x: isRTL ? viewWidth : 0,
    y: 0,
  };
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultLocation.x && y === defaultLocation.y;
}

/**
 * Adds an svg frame around a block to signal that it is unused.
 * @param {Blockly.Block} block - a Blockly block
 */
function addUnusedFrame(block) {
  if (block.isUnused() && !block.unusedSvg_) {
    block.unusedSvg_ = new BlockSvgUnused(block);
    block.unusedSvg_.render(block.svgGroup_, block.RTL);
  }
}

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
