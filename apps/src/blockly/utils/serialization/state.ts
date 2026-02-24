import * as BlocklyCore from 'blockly/core';
import _ from 'lodash';

import {appendNewFunctions} from '@cdo/apps/block_utils';
import {BLOCK_TYPES, stringIsXml} from '@cdo/apps/blockly/constants';
import {WorkspaceSerialization, JsonBlockConfig} from '@cdo/apps/blockly/types';

import {getDefaultLocation} from '../workspace/layout';
import {shouldSkipHiddenWorkspace} from '../workspace/serialization';

import {hasBlocks} from './json';
import {convertFunctionsXmlToJson} from './xmlToJson';

/**
 * Gets the JSON serialization for a project, including its workspace and, if applicable, the hidden definition workspace.
 *
 * @param {Blockly.Workspace} workspace - The workspace to serialize
 * @returns {Object} The combined JSON serialization of the workspace and the hidden definition workspace.
 */
export function getProjectSerialization(workspace: BlocklyCore.WorkspaceSvg) {
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

/**
 * Combines shared functions (XML) with a starting block source (XML or JSON).
 * Used in levels where shared functions and behaviors are enabled.
 *
 * @param {string} startBlocksSource - The source of starting blocks (XML or JSON).
 * @param {string} functionsXml - The XML representation of functions to append.
 * @returns {string} - Updated starting blocks in JSON format.
 */
export function appendSharedFunctions(
  startBlocksSource: string,
  functionsXml: string
) {
  let startBlocks;
  if (stringIsXml(startBlocksSource)) {
    startBlocks = appendNewFunctions(startBlocksSource, functionsXml);
  } else {
    const proceduresState = convertFunctionsXmlToJson(functionsXml);
    const stateToLoad = appendProceduresToState(
      JSON.parse(startBlocksSource),
      proceduresState
    );
    startBlocks = JSON.stringify(stateToLoad);
  }
  return startBlocks;
}
