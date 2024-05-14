import {Block, WorkspaceSvg} from 'blockly';
import _ from 'lodash';

import {WORKSPACE_PADDING, SETUP_TYPES, BLOCK_TYPES} from '../constants';
import {
  Collider,
  ExtendedBlockSvg,
  JsonBlockConfig,
  WorkspaceSerialization,
  XmlBlockConfig,
} from '../types';
import {shouldSkipHiddenWorkspace} from '../utils';

import {frameSizes} from './cdoConstants';

const {
  BLOCK_HEADER_HEIGHT,
  MARGIN_BOTTOM,
  MARGIN_SIDE: SVG_FRAME_SIDE_PADDING,
  MARGIN_TOP,
} = frameSizes;
const SVG_FRAME_HEIGHT = BLOCK_HEADER_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM;
const SVG_FRAME_TOP_PADDING = BLOCK_HEADER_HEIGHT + MARGIN_TOP;
const SORT_BY_POSITION = true;
const VERTICAL_SPACE_BETWEEN_BLOCKS = 10;

export function hasBlocks(
  workspaceSerialization: WorkspaceSerialization | null
) {
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
function getXCoordinate(block: ExtendedBlockSvg, workspace: WorkspaceSvg) {
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
  let verticalSpace = VERTICAL_SPACE_BETWEEN_BLOCKS;
  if (block.functionalSvg_) {
    verticalSpace += SVG_FRAME_TOP_PADDING;
  }
  return verticalSpace;
}

/**
 * Converts XML serialization to JSON using a temporary unrendered workspace.
 * @param {xml} xml - workspace serialization, current/legacy format
 * @param {boolean} [embedded] - indicates whether the source will be converted
 * for an embedded workspace for not.
 * @returns {json} stateToLoad - modern workspace serialization
 */
export function convertXmlToJson(xml: Element, embedded?: boolean) {
  const tempWorkspace = new Blockly.Workspace();

  // The temporary workspace should mirror the embedded state of the workspace
  // that will use the converted source.
  if (embedded) {
    Blockly.addEmbeddedWorkspace(tempWorkspace);
  }

  // domToBlockSpace returns an array of "block" objects with the following properties:
  //   blockly_block: the actual block object created by Blockly
  //   x: the x attribute found in <block/> element
  //   y: the y attribute found in <block/> element
  const xmlBlocks = Blockly.Xml.domToBlockSpace(tempWorkspace, xml);
  const stateToLoad = Blockly.serialization.workspaces.save(
    tempWorkspace
  ) as WorkspaceSerialization;

  if (xmlBlocks.length && hasBlocks(stateToLoad)) {
    // Create a map of ids (key) and block serializations (value).
    const blockIdMap = stateToLoad.blocks.blocks.reduce(
      (map: Map<string, JsonBlockConfig>, blockJson: JsonBlockConfig) =>
        map.set(blockJson.id || '', blockJson),
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
export function addPositionsToState(
  xmlBlocks: XmlBlockConfig[],
  blockIdMap: Map<string, JsonBlockConfig>
) {
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
 */
export function positionBlocksOnWorkspace(workspace: WorkspaceSvg) {
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
}

/**
 * Positions blocks with any mix of user-defined positions and default positions (including all of one or the other)
 * Such that none of the blocks overlap with each other
 * @param {Array<Blockly.Block>} blocks - The blocks to position
 * @param {Blockly.Workspace} workspace - The current Blockly workspace
 */
function adjustBlockPositions(
  blocks: ExtendedBlockSvg[],
  workspace: WorkspaceSvg
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
export function isBlockAtEdge(block: Block) {
  const {defaultX, defaultY} = getDefaultLocation(
    block.workspace as WorkspaceSvg
  );
  const {x = 0, y = 0} = block.getRelativeToSurfaceXY();
  return x === defaultX || y === defaultY;
}

export const getDefaultLocation = (workspaceOverride?: WorkspaceSvg) => {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
  const isRTL = workspace.RTL;

  const {viewWidth = 0} = workspace.getMetrics();
  const defaultX = isRTL ? viewWidth : 0;
  const defaultY = 0;

  return {defaultX, defaultY};
};

// See addEditorWorkspaceBlockConfig on the FunctionEditor for
// the list of properties to undo here
export const resetEditorWorkspaceBlockConfig = (
  blocks: JsonBlockConfig[] = []
) =>
  blocks.forEach(block => {
    const {defaultX, defaultY} = getDefaultLocation();
    block.x = defaultX;
    block.y = defaultY;
    block.movable = true;

    // Since all blocks opened with the function editor are forced to be
    // undeletable, we need to reset deletable to its initial value
    // before we save the block data to the project source
    block.deletable = block.extraState?.initialDeleteConfig;
  });

/**
 * Partitions JSON objects of the specified types to the front of the list.
 *
 * @param {Object[]} [blocks=[]] - An array of JSON blocks to be partitioned.
 * @param {string[]} [prioritizedBlockTypes=[]] - An array of strings representing block types to move to the front.
 * @returns {Object[]} A new array of JSON blocks partitioned based on their types.
 */
export function partitionJsonBlocksByType(
  blocks: ExtendedBlockSvg[] = [],
  prioritizedBlockTypes: string[] = []
) {
  const prioritizedBlocks: ExtendedBlockSvg[] = [];
  const remainingBlocks: ExtendedBlockSvg[] = [];

  blocks.forEach(block => {
    const blockType = block.type;
    prioritizedBlockTypes.includes(blockType)
      ? prioritizedBlocks.push(block)
      : remainingBlocks.push(block);
  });

  return [...prioritizedBlocks, ...remainingBlocks];
}

/**
 * Gets the JSON serialization for a project, including its workspace and, if applicable, the hidden definition workspace.
 *
 * @param {Blockly.Workspace} workspace - The workspace to serialize
 * @returns {Object} The combined JSON serialization of the workspace and the hidden definition workspace.
 */
export function getProjectSerialization(workspace: WorkspaceSvg) {
  const workspaceSerialization = Blockly.serialization.workspaces.save(
    workspace
  ) as WorkspaceSerialization;

  if (shouldSkipHiddenWorkspace(workspace)) {
    return workspaceSerialization;
  }
  const hiddenDefinitionWorkspace = Blockly.getHiddenDefinitionWorkspace();
  const hiddenWorkspaceSerialization = hiddenDefinitionWorkspace
    ? (Blockly.serialization.workspaces.save(
        hiddenDefinitionWorkspace
      ) as WorkspaceSerialization)
    : null;

  // Blocks rendered in the hidden workspace get extra properties that need to be
  // removed so they don't apply if the block moves to the main workspace on subsequent loads
  if (hiddenWorkspaceSerialization && hasBlocks(hiddenWorkspaceSerialization)) {
    resetEditorWorkspaceBlockConfig(hiddenWorkspaceSerialization.blocks.blocks);
  }

  const combinedSerialization = getCombinedSerialization(
    workspaceSerialization,
    hiddenWorkspaceSerialization
  );
  return combinedSerialization;
}

/**
 * Combines the serialization of two workspaces so that both can be saved to a project source when calling getCode.
 * @param {json} primaryWorkspaceSerialization - Contains block and procedure information for the first workspace.
 * @param {json} secondaryWorkspaceSerialization - Contains block and procedure information for the second
 * (e.g. hidden procedure definitions) workspace.
 * @returns {json} A combined serialization, using the primaryWorkspaceSerialization as the base, that includes all
 * blocks and procedures from each workspace with unique ids. (Note: The elements on each workspace are not
 * necessarily mutually exclusive.)
 */
export function getCombinedSerialization(
  primaryWorkspaceSerialization: WorkspaceSerialization,
  secondaryWorkspaceSerialization: WorkspaceSerialization | null
) {
  if (
    !secondaryWorkspaceSerialization ||
    !hasBlocks(secondaryWorkspaceSerialization) ||
    !hasBlocks(primaryWorkspaceSerialization)
  ) {
    // Default case is to return mainWorkspaceSerialization because it's not possible
    // to have a hiddenWorkspaceSerialization but no mainWorkspaceSerialization
    return primaryWorkspaceSerialization;
  }

  const combinedSerialization = _.cloneDeep(primaryWorkspaceSerialization);
  combinedSerialization.blocks.blocks = _.unionBy(
    primaryWorkspaceSerialization.blocks.blocks,
    secondaryWorkspaceSerialization.blocks.blocks,
    'id'
  );
  combinedSerialization.procedures = _.unionBy(
    primaryWorkspaceSerialization.procedures,
    secondaryWorkspaceSerialization.procedures,
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
export function convertFunctionsXmlToJson(functionsXml: string) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(`<xml>${functionsXml}</xml>`, 'text/xml');
  const tempWorkspace = new Blockly.Workspace();
  Blockly.Xml.domToBlockSpace(tempWorkspace, xml.children[0]);
  const proceduresState = Blockly.serialization.workspaces.save(
    tempWorkspace
  ) as WorkspaceSerialization;
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
 * TODO: define a type for projectState and proceduresState. Blockly defines these as any.
 */
export function appendProceduresToState(
  projectState: WorkspaceSerialization,
  proceduresState: WorkspaceSerialization
) {
  const projectBlocks = projectState.blocks?.blocks || [];
  const projectProcedures = projectState.procedures || [];

  const sharedBlocks = proceduresState.blocks?.blocks || [];
  const sharedProcedures = proceduresState.procedures || [];

  sharedBlocks.forEach(block => {
    const {behaviorId, procedureId} = block.extraState;

    if (!blockExists(behaviorId, projectBlocks)) {
      // If the block doesn't exist, add it to the student project
      projectBlocks.push(block);
      const procedure = sharedProcedures.find(
        procedure => procedure.id === procedureId
      );
      if (procedure) {
        projectProcedures.push(procedure);
      }
    }
  });
  projectState.blocks = {blocks: projectBlocks};
  projectState.procedures = projectProcedures;
  return projectState;
}

// Function to check if a block with the given behaviorId exists in the project
// TODO: define type for projectBlocks.
function blockExists(behaviorId: string, projectBlocks: JsonBlockConfig[]) {
  return projectBlocks.some(
    block =>
      block.type === BLOCK_TYPES.behaviorDefinition &&
      block.extraState?.behaviorId === behaviorId
  );
}
