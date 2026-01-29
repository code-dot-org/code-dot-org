import * as BlocklyCore from 'blockly/core';
import _ from 'lodash';

import {BLOCK_TYPES, stringIsXml} from '@cdo/apps/blockly/constants';
import {updateBlockCountMap} from '@cdo/apps/blockly/eventHandlers';
import {
  ExtendedWorkspaceSvg,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';
import {parseElement} from '@cdo/apps/xml';

import {hasBlocks} from '../serialization/json';
import {convertXmlToJson} from '../serialization/xmlToJson';

import {positionBlocksOnWorkspace} from './layout';

/**
 * Loads blocks to a workspace.
 * To maintain backwards compatibility we must be able to use the XML source if no JSON state is provided.
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {string} source - workspace serialization, either XML or JSON
 */
export function loadBlocksToWorkspace(
  workspace: BlocklyCore.WorkspaceSvg,
  source: string,
  includeHiddenDefinitions = true
) {
  // Reset hasLoadedBlocks to false so we can accurately track if blocks have been loaded.
  // This function may be called multiple times to reload blocks (ex. when starting over).
  Blockly.hasLoadedBlocks = false;
  const embedded = Blockly.isEmbeddedWorkspace(workspace);
  const {mainSource, hiddenDefinitionSource} = prepareSourcesForWorkspaces(
    source,
    embedded
  );
  // We intentionally load hidden definitions before other blocks on the main workspace.
  if (includeHiddenDefinitions) {
    loadHiddenDefinitionBlocksToWorkspace(hiddenDefinitionSource);
  }
  Blockly.serialization.workspaces.load(mainSource, workspace);
  positionBlocksOnWorkspace(workspace);
  Blockly.hasLoadedBlocks = true;

  // Dynamically add procedure call blocks to an uncategorized toolbox
  // if specified in the level config (e.g. Minecraft Agent levels).
  // Levels will include: "top_level_procedure_autopopulate": "true"
  if (Blockly.topLevelProcedureAutopopulate) {
    addProcedureCallBlocksToFlyout(workspace, mainSource);
  }

  if (Blockly.blockLimitMap && Blockly.blockLimitMap.size > 0) {
    updateBlockCountMap(workspace as ExtendedWorkspaceSvg);
  }
}

function addProcedureCallBlocksToFlyout(
  workspace: BlocklyCore.WorkspaceSvg,
  mainSource: WorkspaceSerialization
) {
  const translatedToolboxInfo = workspace.options?.languageTree;
  if (workspace.getFlyout() && translatedToolboxInfo) {
    const callBlocks = [] as BlocklyCore.utils.toolbox.ToolboxItemInfo[];
    const definitionBlocks = mainSource.blocks.blocks.filter(
      block => block.type === BLOCK_TYPES.procedureDefinition
    );
    definitionBlocks.forEach(definitionBlock => {
      // Procedure definitions should have a valid name
      if (typeof definitionBlock.fields?.NAME === 'string') {
        // Create the block XML for a procedure call block.
        const callBlockElement = document.createElement('block');
        callBlockElement.setAttribute('type', BLOCK_TYPES.procedureCall);
        const mutationElement = document.createElement('mutation');
        mutationElement.setAttribute('name', definitionBlock.fields.NAME);
        callBlockElement.appendChild(mutationElement);

        callBlocks.push({
          kind: 'BLOCK',
          blockxml: callBlockElement,
          type: BLOCK_TYPES.procedureCall,
        });
      }
    });
    if (callBlocks.length) {
      // Remove existing call blocks from the toolbox
      translatedToolboxInfo.contents = translatedToolboxInfo.contents.filter(
        (item: BlocklyCore.utils.toolbox.BlockInfo) =>
          item.type !== BLOCK_TYPES.procedureCall
      );
      // Add the new callblocks to the toolbox and refresh it.
      translatedToolboxInfo.contents.unshift(...callBlocks);
      workspace.getFlyout()?.show(translatedToolboxInfo);
    }
  }
}

/**
 * Load hidden definition blocks to the hidden definition workspace, if it exists.
 * @param {Object} hiddenDefinitionSource Blockly serialization of hidden definition blocks.
 */
function loadHiddenDefinitionBlocksToWorkspace(
  hiddenDefinitionSource: WorkspaceSerialization
) {
  if (!Blockly.getHiddenDefinitionWorkspace() || !hiddenDefinitionSource) {
    return;
  }

  Blockly.serialization.workspaces.load(
    hiddenDefinitionSource,
    Blockly.getHiddenDefinitionWorkspace()
  );
  if (Blockly.functionEditor) {
    Blockly.functionEditor.setUpEditorWorkspaceProcedures();
  }
}

/**
 * Split source into appropriate serialization objects for the main and the hidden workspaces for loading.
 * Which blocks are moved depends on whether the modal function editor is enabled.
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {boolean} [embedded] - indicates whether the source will be parsed
 * for an embedded workspace for not.
 * @returns {mainSource: Object, hiddenDefinitionSource: Object}
 *  mainSource and hiddenDefinitionSource are Blockly serialization objects.
 */
function prepareSourcesForWorkspaces(source: string, embedded: boolean) {
  const parsedSource = parseSource(source, embedded);
  const procedureTypesToHide = [];
  if (!embedded) {
    procedureTypesToHide.push(BLOCK_TYPES.behaviorDefinition);
  }
  if (Blockly.useModalFunctionEditor) {
    procedureTypesToHide.push(BLOCK_TYPES.procedureDefinition);
  }
  const {mainSource, hiddenDefinitionSource} = moveHiddenBlocks(
    parsedSource,
    procedureTypesToHide
  );
  return {mainSource, hiddenDefinitionSource};
}

/**
 * Convert source to parsed json objects. If source was xml, convert to json before parsing.
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {boolean} [embedded] - indicates whether the source will be parsed
 * for an embedded workspace for not.
 * @returns Object: source as json
 */
function parseSource(source: string, embedded: boolean) {
  const isXml = stringIsXml(source);
  let parsedSource;

  if (isXml) {
    const xml = parseElement(source);
    parsedSource = convertXmlToJson(xml, embedded);
  } else {
    parsedSource = JSON.parse(source);
  }
  return parsedSource;
}
/**
 * Move hidden blocks (e.g. procedures) from the source to a hidden definition object.
 * These will be used to initialize the main and hidden definitions workspaces, respectively.
 * Blocks are hidden if they have a type in the procedureTypesToHide array, or if they
 * are explicitly marked as invisible in the project source.
 * In addition, copy the procedure model from the source
 * object to the hidden definition object when moving a procedure block.
 * @param {Object} source Project source object, parsed from JSON.
 * @param {Array<string>} procedureTypesToHide procedure types to move to procedures object.
 * @returns void
 * exported for unit testing
 */
export function moveHiddenBlocks(
  source: WorkspaceSerialization = {},
  procedureTypesToHide: string[] = []
) {
  if (procedureTypesToHide.length === 0 || !hasBlocks(source)) {
    return {mainSource: source, hiddenDefinitionSource: {}};
  }

  const mainSource = _.cloneDeep(source);
  const hiddenDefinitionSource = _.cloneDeep(source);

  // Reset the values on the copies so they can be populated from scratch
  // All of the original source procedures can be retained on the main workspace
  mainSource.blocks.blocks = [];
  hiddenDefinitionSource.blocks.blocks = [];
  hiddenDefinitionSource.procedures = [];

  source.blocks.blocks.forEach(block => {
    const {invisible, procedureId} = block.extraState || {};
    const hideBlock =
      procedureTypesToHide.includes(block.type) ||
      (invisible && !Blockly.isStartMode);
    const destination = hideBlock ? hiddenDefinitionSource : mainSource;
    destination.blocks.blocks.push(block);

    // Also copy the procedure model for blocks to that need to be hidden
    // Equality check works because hiddenDefinitionSource and mainSource are different object references
    if (destination === hiddenDefinitionSource && procedureId) {
      const procedureModel = source.procedures?.find(
        procedure => procedure.id === procedureId
      );
      if (procedureModel) {
        if (!hiddenDefinitionSource.procedures) {
          hiddenDefinitionSource.procedures = [];
        }
        hiddenDefinitionSource.procedures.push(procedureModel);
      }
    }
  });

  return {
    mainSource,
    hiddenDefinitionSource,
  };
}
