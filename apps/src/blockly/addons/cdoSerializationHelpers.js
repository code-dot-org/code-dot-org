import BlockSvgUnused from './blockSvgUnused';

const SORT_BY_POSITION = true;

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
 * @param {function} positionBlock - moves a single block using the current cursor coordinates
 * @param {Array<block>} blocks - an array of block objects
 */
export function positionBlocksOnWorkspace(
  workspace,
  positionBlock,
  blocks = workspace.getTopBlocks(SORT_BY_POSITION)
) {
  if (!workspace.rendered) {
    return blocks;
  }
  const metrics = workspace.getMetrics();
  const contentWidth = metrics.contentWidth;
  const viewWidth = metrics ? metrics.viewWidth : 0;
  const padding = viewWidth ? 16 : 0;

  // The "cursor" object tracks a position on the workspace that starts in the top
  // corner, then moves below each block that is manually repositioned.
  let cursor = {
    x: padding,
    y: padding,
  };
  if (workspace.RTL && viewWidth) {
    // Position the cursor from the right of the workspace.
    cursor.x = viewWidth - padding;
  } else if (workspace.RTL && !viewWidth) {
    // Position the cursor from the right of the block.
    cursor.x = contentWidth - padding;
  }

  blocks.forEach(block => positionBlock(block, workspace, cursor));
}

/**
 * Use a cursor to position a block on a workspace (if it does not already have a position)
 * @param {Blockly.Block} block - the block to be moved
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {object} cursor - a location for moving a block, if needed
 * @param {number} cursor.x - an x-coordinate for moving a block
 * @param {number} cursor.y - a y-coordinate for moving a block
 */
export function positionBlock(block, workspace, cursor) {
  const verticalSpaceBetweenBlocks = 10;
  const metrics = workspace.getMetrics();
  const viewWidth = metrics ? metrics.viewWidth : 0;
  addUnusedFrame(block);
  let blockLocationUnset = true;
  const position = block.getRelativeToSurfaceXY();
  if (position) {
    blockLocationUnset =
      position.y === 0 && position.x === (workspace.RTL ? viewWidth : 0);
  }
  if (blockLocationUnset) {
    const hasSvgFrame = !!block.functionalSvg_ || !!block.unusedSvg_;
    const frameSvgTop = hasSvgFrame ? 35 : 0;
    const frameSvgHeight = hasSvgFrame ? 40 : 0;
    const frameSvgMargin = hasSvgFrame ? 16 : 0;
    const height = block.getHeightWidth().height + frameSvgHeight;
    block.moveTo({
      x: cursor.x + (workspace.RTL ? -frameSvgMargin : frameSvgMargin),
      y: cursor.y + frameSvgTop,
    });
    cursor.y += height + verticalSpaceBetweenBlocks;
  }
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
 * Use a cursor to position a block on a workspace (if it does not already have a position)
 * @param {object} block - the block to be moved and a pair of coordinates
 * @param {Blockly.block} block.blockly_block - the actual Blockly block to be moved
 * @param {number} [block.x] - an x-coordinate from the XML serialization
 * @param {number} [block.y] - a y-coordinate frmo the XML serialization
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {object} cursor - a location for moving a block, if needed
 * @param {number} cursor.x - an x-coordinate for moving a block
 * @param {number} cursor.y - a y-coordinate for moving a block
 */
export function positionBlockLegacy(block, workspace, cursor) {
  const verticalSpaceBetweenBlocks = 10;
  const heightWidth = block.blockly_block.getHeightWidth();
  const hasFrameSvg = !!block.blockly_block.functionalSvg_;
  const frameSvgSize = hasFrameSvg ? 40 : 0;
  const frameSvgTop = hasFrameSvg ? 35 : 0;
  const frameSvgMargin = hasFrameSvg ? 16 : 0;
  const metrics = workspace.getMetrics();
  const viewWidth = metrics ? metrics.viewWidth : 0;

  // If the block doesn't already have coordinates, use the cursor.
  if (isNaN(block.x)) {
    block.x = cursor.x;
  } else if (workspace.RTL) {
    // Position RTLs with coordinates from the left.
    block.x = viewWidth - block.x;
  }
  // Adjust for Svg Frames for function definition blocks
  if (!workspace.RTL) {
    block.x += frameSvgMargin;
  } else {
    block.x -= frameSvgMargin;
  }

  if (isNaN(block.y)) {
    block.y = cursor.y + frameSvgTop;
    cursor.y += heightWidth.height + verticalSpaceBetweenBlocks + frameSvgSize;
  }

  block.blockly_block.moveTo(new Blockly.utils.Coordinate(block.x, block.y));
}
