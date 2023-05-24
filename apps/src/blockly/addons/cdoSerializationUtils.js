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
  const blockIdMap = new Map();
  stateToLoad.blocks.blocks.forEach(block => {
    blockIdMap.set(block.id, block);
  });

  addPositionsToState(xmlBlocks, blockIdMap);
  tempWorkspace.dispose();
  return stateToLoad;
}

/**
 * Converts XML serialization to JSON using a temporary unrendered workspace.
 * @param {object} xmlBlocks - an object containing a block and x/y coordinates
 * @param {Map<String, Object>} blockIdMap - a map of ids (keys) and blocks (values)
 */
function addPositionsToState(xmlBlocks, blockIdMap) {
  xmlBlocks.forEach(xmlBlock => {
    const block = blockIdMap.get(xmlBlock.blockly_block.id);
    if (block && xmlBlock.x && xmlBlock.y) {
      block.x = xmlBlock.x;
      block.y = xmlBlock.y;
    }
  });
}

/**
 * Use a cursor to position blocks on a workspace (if they do not already have positions)
 * @param {workspace} workspace - the current Blockly workspace
 * @param {Map<String, Object>} blockIdMap - a map of ids (keys) and blocks (values)
 */
export function positionBlocks(workspace) {
  const blocks = workspace.getTopBlocks(SORT_BY_POSITION);
  if (!workspace.rendered) {
    return blocks;
  }
  const metrics = workspace.getMetrics();
  const contentWidth = metrics.contentWidth;
  const viewWidth = metrics ? metrics.viewWidth : 0;
  const padding = viewWidth ? 16 : 0;
  const verticalSpaceBetweenBlocks = 10;

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

  blocks.forEach(block => {
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
  });
}

/**
 * Adds an svg frame around a block to signal that it is unused.
 * @param {object} block - a Blockly block
 */
function addUnusedFrame(block) {
  if (block.isUnused() && !block.unusedSvg_) {
    block.unusedSvg_ = new BlockSvgUnused(block);
    block.unusedSvg_.render(block.svgGroup_, block.RTL);
  }
}
