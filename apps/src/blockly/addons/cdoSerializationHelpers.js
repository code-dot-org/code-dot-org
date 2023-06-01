import BlockSvgUnused from './blockSvgUnused';
import {WORKSPACE_PADDING} from '../constants';
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

  // domToBlockSpace returns an array of "block" objects with the following property:
  //   blockly_block: the actual block object created by Blockly
  //   x: the x attribute found in <block/> element
  //   y: the y attribute found in <block/> element
  const xmlBlocks = Blockly.Xml.domToBlockSpace(tempWorkspace, xml);

  const stateToLoad = Blockly.serialization.workspaces.save(tempWorkspace);

  // Create a map of ids (key) and blocks (value).
  const blockIdMap = stateToLoad.blocks.blocks.reduce(
    (map, block) => map.set(block.id, block),
    new Map()
  );

  addPositionsToState(xmlBlocks, blockIdMap);
  tempWorkspace.dispose();
  return stateToLoad;
}

/**
 * Adds x/y values from XML to JSON serialization.
 * @param {Array<Object>} xmlBlocks - an array of "block" objects containing a block and x/y coordinates
 * @param {Map<String, Object>} blockIdMap - a map of ids (keys) and blocks (values)
 */
function addPositionsToState(xmlBlocks, blockIdMap) {
  xmlBlocks.forEach(xmlBlock => {
    const block = blockIdMap.get(xmlBlock.blockly_block.id);
    if (block) {
      // Do not change block values if xmlBlock values are NaN (unspecified in XML)
      block.x = xmlBlock.x || block.x;
      block.y = xmlBlock.y || block.y;
    }
  });
}

/**
 * Position blocks on a workspace (if they do not already have positions)
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {function} [positionBlock] - moves a single block using the current cursor coordinates
 * @param {Array<block>} [blocks] - an array of block objects
 */
export function positionBlocksOnWorkspace(
  workspace,
  positionBlock = positionBlockWithCursor,
  blocks = workspace.getTopBlocks(SORT_BY_POSITION)
) {
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

  blocks.forEach(block => {
    positionBlock(block, cursor);
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
export function positionBlockWithCursor(block, cursor) {
  addUnusedFrame(block);
  if (blockLocationUnset(block)) {
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
function getNewLocation(block, cursor) {
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
function getCursorYAdjustment(block) {
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
function blockLocationUnset(block) {
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
 * Initializes a block's position so that it can be repositioned with the cursor.
 * @param {object} block - and objecting containing the block to be moved and x/y coordinates
 * @param {Blockly.block} block.blockly_block - the actual Blockly block to be moved
 * @param {number} [block.x] - an x-coordinate from the XML serialization
 * @param {number} [block.y] - a y-coordinate frmo the XML serialization
 * @param {object} cursor - a location for moving a block
 */
export function positionBlockXmlHelper(block, cursor) {
  const isRTL = block.blockly_block.RTL;
  const {viewWidth = 0} = block.blockly_block.workspace.getMetrics();
  let {x, y} = block;
  x = isNaN(x) ? 0 : x;
  y = isNaN(y) ? 0 : y;

  block.blockly_block.moveTo({
    x: isRTL ? viewWidth - x : x,
    y: y,
  });

  positionBlockWithCursor(block.blockly_block, cursor);
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
