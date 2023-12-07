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
 * Returns the desired x-coordinate for a block given the workspace properties
 * and whether the block needs extra offset to accomodate an SVG frame.
 * @param {Blockly.Block} block - The block for which to determine an x-coordinate
 * @param {Blockly.Workspace} workspace - The current Blockly workspace
 * @returns {number} Desired coordinate (as far left/right as possible depending on whether we are in LTR or RTL)
 */
function getXCoordinate(block, workspace) {
  const {contentWidth = 0, viewWidth = 0} = workspace.getMetrics();
  const padding = viewWidth ? WORKSPACE_PADDING : 0;
  const width = viewWidth || contentWidth;

  // Multiplier accounts for the fact that blocks with SVG frames need twice as much padding
  // so their edges don't touch the edge of the workspace
  let horizontalOffset = block.functionalSvg_ ? 2 * padding : padding;
  // If the workspace is RTL, horizontally mirror the starting position
  return workspace.RTL ? width - horizontalOffset : horizontalOffset;
}

/**
 * Returns the vertical space we need to add relative to the previous block's bottom edge
 * when auto-positioning a block.
 * @param {Blockly.Block} block - The block for which to determine vertical spacing
 * @returns {number} Vertical space in pixels; either the default or the default plus extra to accomodate an SVG frame.
 */
function getSpaceBetweenBlocks(block) {
  let verticalSpace = VERTICAL_SPACE_BETWEEN_BLOCKS;
  if (block.functionalSvg_) {
    verticalSpace += SVG_FRAME_TOP_PADDING;
  }
  return verticalSpace;
}

/**
 * Converts XML serialization to JSON using a temporary unrendered workspace.
 * @param {xml} xml - workspace serialization, current/legacy format
 * @returns {json} stateToLoad - modern workspace serialization
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

/**
 * Positions blocks with any mix of user-defined positions and default positions (including all of one or the other)
 * Such that none of the blocks overlap with each other
 * @param {Array<Blockly.Block>} blocks - The blocks to position
 * @param {Blockly.Workspace} workspace - The current Blockly workspace
 */
function adjustBlockPositions(blocks, workspace) {
  // Ordered colliders tracks the areas occupied by existing blocks; new blocks
  // are added to maintain top-to-bottom ordering
  let orderedColliders = [];
  let blocksToPlace = [];
  blocks.forEach(block => {
    if (isBlockLocationUnset(block)) {
      blocksToPlace.push(block);
    } else {
      insertCollider(orderedColliders, getCollider(block));
    }
  });

  blocksToPlace.forEach(block => {
    let x = getXCoordinate(block, workspace);
    let y = WORKSPACE_PADDING;

    // Set initial position; collision area must be updated to account for new position
    // every time block is moved
    block.moveTo({x, y});
    let collider = getCollider(block);

    orderedColliders.forEach(orderedCollider => {
      if (isOverlapping(collider, orderedCollider)) {
        y =
          orderedCollider.y +
          orderedCollider.height +
          getSpaceBetweenBlocks(block);
        block.moveTo({x, y});
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
function getCollider(block) {
  const position = block.getRelativeToSurfaceXY();
  const size = block.getHeightWidth();

  const collider = {
    ...position,
    ...size,
  };

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
export function insertCollider(colliders, newCollider) {
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
export function isOverlapping(collider1, collider2) {
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
 * Determines whether a block needs to be repositioned, based on its current position.
 * @param {Blockly.Block} block - the block being considered
 * @returns {boolean} - true if the block is at the top corner of the workspace
 */
export function isBlockLocationUnset(block) {
  const {defaultX, defaultY} = getDefaultLocation(block.workspace);
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultX && y === defaultY;
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

    // Reset deletable to its initial value
    block.deletable = block.extraState?.initialDeleteConfig;
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

/**
 * Combines the serialization of the main and hidden workspaces (when hidden workspace is present)
 * so that both are saved to the project source when calling getCode.
 * @param {json} mainWorkspaceSerialization - Contains block and procedure information for the main workspace.
 * @param {json} hiddenWorkspaceSerialization - Contains block and procedure information for the hidden
 * (i.e. modal function editor) workspace.
 * @returns {json} A combined serialization, using the mainWorkspaceSerialization as the base, that includes all
 * blocks and procedures from each workspace with unique ids. (Note: The elements on each workspace are not
 * necessarily mutually exclusive.)
 */
export function getCombinedSerialization(
  mainWorkspaceSerialization,
  hiddenWorkspaceSerialization
) {
  if (
    !hasBlocks(hiddenWorkspaceSerialization) ||
    !hasBlocks(mainWorkspaceSerialization)
  ) {
    // Default case is to return mainWorkspaceSerialization because it's not possible
    // to have a hiddenWorkspaceSerialization but no mainWorkspaceSerialization
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

/**
 * Converts blocks in XML format to JSON representation. Shared behaviors are saved
 * as XML, so we need to convert it if the student's project is in JSON.
 * Conversion occurs by loading blocks onto a temporary headless workspace and re-serializing.
 *
 * @param {string} functionsXml - The XML representation of functions to convert.
 * @returns {Object} - JSON representation of the functions.
 */
export function convertFunctionsXmlToJson(functionsXml) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(`<xml>${functionsXml}</xml>`, 'text/xml');
  const tempWorkspace = new Blockly.Workspace();
  Blockly.Xml.domToBlockSpace(tempWorkspace, xml);
  const proceduresState = Blockly.serialization.workspaces.save(tempWorkspace);
  tempWorkspace.dispose();
  return proceduresState;
}

/**
 * Appends procedures from shared state to the project state, merging blocks and procedures.
 * This works by comparing each block list. For any shared behavior that is not already
 * in the saved project (based on behaviorId value), add the block and its procedure
 * to the state.
 *
 * @param {Object} projectState - The saved project in JSON (blocks and procedures).
 * @param {Object} proceduresState - The shared procedures in JSON (blocks and procedures).
 * @returns {Object} - The updated project state with shared procedures appended.
 */
export function appendProceduresToState(projectState, proceduresState) {
  const projectBlocks = projectState.blocks?.blocks || [];
  const projectProcedures = projectState.procedures || [];

  const sharedBlocks = proceduresState.blocks?.blocks || [];
  const sharedProcedures = proceduresState.procedures || [];

  sharedBlocks.forEach(block => {
    const {behaviorId, procedureId} = block.extraState;

    if (!blockExists(behaviorId, projectBlocks)) {
      // If the block doesn't exist, add it to the student project
      projectBlocks.push(block);
      projectProcedures.push(
        sharedProcedures.find(procedure => procedure.id === procedureId)
      );
    }
  });
  projectState.blocks = {blocks: projectBlocks};
  projectState.procedures = projectProcedures;
  return projectState;
}

// Function to check if a block with the given behaviorId exists in the project
function blockExists(behaviorId, projectBlocks) {
  return projectBlocks.some(
    block =>
      block.type === 'behavior_definition' &&
      block.extraState?.behaviorId === behaviorId
  );
}
