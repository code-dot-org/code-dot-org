import _ from 'lodash';
import {unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
import {APP_HEIGHT} from '@cdo/apps/p5lab/constants';
import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

import cdoTheme from '../themes/cdoTheme';
import {blocks as procedureBlocks} from '../customBlocks/googleBlockly/proceduresBlocks';
import {
  BLOCK_TYPES,
  CLAMPED_NUMBER_REGEX,
  DEFAULT_SOUND,
  stringIsXml,
  ToolboxType,
} from '../constants';
import {
  appendProceduresToState,
  convertFunctionsXmlToJson,
  convertXmlToJson,
  positionBlocksOnWorkspace,
} from './cdoSerializationHelpers';
import {parseElement as parseXmlElement} from '../../xml';
import * as blockUtils from '../../block_utils';

/**
 * Loads blocks to a workspace.
 * To maintain backwards compatibility we must be able to use the XML source if no JSON state is provided.
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {[string]} hiddenDefinitions - hidden definitions serialization, in JSON. Only used in Google Blockly labs.
 */
export function loadBlocksToWorkspace(workspace, source, hiddenDefinitions) {
  const {parsedSource, parsedHiddenDefinitions, blockOrderMap} =
    prepareSourcesForWorkspaces(source, hiddenDefinitions);
  Blockly.serialization.workspaces.load(parsedSource, workspace);
  positionBlocksOnWorkspace(workspace, blockOrderMap);
  loadHiddenDefinitionBlocksToWorkspace(parsedHiddenDefinitions);
}

/**
 * Load hidden definition blocks to the hidden definition workspace, if it exists.
 * @param {Object} hiddenDefinitionSource Blockly serialization of hidden definition blocks.
 */
function loadHiddenDefinitionBlocksToWorkspace(hiddenDefinitionSource) {
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
 * Prepare source and hidden definitions for loading to workspaces. This includes
 * parsing from string to a Blockly serialization object, and moving any procedures from source
 * to hidden definitions if they should be hidden. Moving procedures to hidden definitions will only
 * occur on first load of a level, when the source is XML. After that all hidden definitions will be
 * correctly stored in hiddenDefinitions.
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {[string]} hiddenDefinitions - hidden definitions serialization, in JSON.
 *  Only used in Google Blockly labs.
 * @returns {parsedSource: Object, parsedHiddenDefinitions: Object, blockOrderMap: Object}
 *  parsedSource and parsedHiddenDefinitions are Blockly serialization objects.
 *  blockOrderMap is only used when source is XML,
 *  and is a map of blocks to their positions on the workspace.
 */
function prepareSourcesForWorkspaces(source, hiddenDefinitions) {
  let {parsedSource, parsedHiddenDefinitions, blockOrderMap} =
    parseSourceAndHiddenDefinitions(source, hiddenDefinitions);

  const procedureTypesToHide = [BLOCK_TYPES.behaviorDefinition];
  if (Blockly.useModalFunctionEditor) {
    procedureTypesToHide.push(BLOCK_TYPES.procedureDefinition);
  }
  moveHiddenProcedures(
    parsedSource,
    parsedHiddenDefinitions,
    procedureTypesToHide
  );
  return {parsedSource, parsedHiddenDefinitions, blockOrderMap};
}

/**
 * Convert source and hidden definitions to parsed json objects. If source was xml,
 * convert to json before parsing. Also create a block order map if source was xml, which will
 * allow us to correctly place blocks on the workspace.
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {[string]} hiddenDefinitions - hidden definitions serialization, in JSON. Only used in Google Blockly labs.
 * @returns {parsedSource: Object, parsedHiddenDefinitions: Object, blockOrderMap: Object}
 */
function parseSourceAndHiddenDefinitions(source, hiddenDefinitions) {
  let isXml = stringIsXml(source);
  let parsedSource;
  let parsedHiddenDefinitions;
  let blockOrderMap;
  hiddenDefinitions = hiddenDefinitions || '{}';
  if (isXml) {
    const xml = parseXmlElement(source);
    parsedSource = convertXmlToJson(xml);
    blockOrderMap = Blockly.Xml.createBlockOrderMap(xml);
  } else {
    parsedSource = JSON.parse(source);
  }
  parsedHiddenDefinitions = JSON.parse(hiddenDefinitions);
  return {parsedSource, parsedHiddenDefinitions, blockOrderMap};
}

/**
 * Move hidden procedures from the source to the hidden definition object.
 * These will be used to initialize the main and hidden definitions workspaces, respectively.
 * Procedures are hidden if they have a type in the procedureTypesToHide array.
 * In addition, copy the procedure model from the source
 * object to the hidden definition object when moving a procedure.
 * @param {Object} source Project source object, parsed from JSON.
 * @param {Object} hiddenDefinitions Hidden Definition object, parsed from JSON (or an empty object)
 * @param {Array<string>} procedureTypesToHide procedure types to move to procedures object.
 * @returns void
 * exported for unit testing
 */
export function moveHiddenProcedures(
  source,
  hiddenDefinitions,
  procedureTypesToHide
) {
  if (
    procedureTypesToHide.length === 0 ||
    !source.blocks ||
    !source.blocks.blocks
  ) {
    return;
  }
  const blocksToHide = [];
  const otherBlocks = [];
  const sourceProcedures = source.procedures;
  hiddenDefinitions.procedures ||= [];
  source.blocks.blocks.forEach(block => {
    if (procedureTypesToHide.includes(block.type)) {
      blocksToHide.push(block);
      // If we found a block to hide, also copy the procedure model
      // for that block to the hidden definitions workspace.
      const sourceProcedureModel = sourceProcedures.find(
        p => p.id === block.extraState.procedureId
      );
      if (sourceProcedureModel) {
        hiddenDefinitions.procedures.push(sourceProcedureModel);
      }
    } else {
      otherBlocks.push(block);
    }
  });
  source.blocks.blocks = otherBlocks;
  const existingHiddenBlocks = _.get(hiddenDefinitions, 'blocks.blocks', []);
  _.set(hiddenDefinitions, 'blocks.blocks', [
    ...existingHiddenBlocks,
    ...blocksToHide,
  ]);
}

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function injectCss() {
  return Blockly.Css.inject(true, 'media');
}

export function resizeSvg(blockSpace) {
  return Blockly.svgResize(blockSpace);
}

export function getBlockFields(block) {
  let fields = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}

export function getToolboxType() {
  const workspace = Blockly.getMainWorkspace();
  if (!workspace) {
    return;
  }
  // True is passed so we only get the flyout directly owned by the workspace.
  // Otherwise getFlyout will return the flyout for the toolbox if it has categories.
  if (workspace.getFlyout(true)) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.getToolbox()) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth() {
  const workspace = Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType()) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      return 0;
  }
}

export function workspaceSvgResize(workspace) {
  return Blockly.svgResize(workspace);
}

export function bindBrowserEvent(element, name, thisObject, func, useCapture) {
  return Blockly.browserEvents.bind(
    element,
    name,
    thisObject,
    func,
    useCapture
  );
}

export function isWorkspaceReadOnly(workspace) {
  return false; // TODO - used for feedback
}

export function blockLimitExceeded() {
  return false;
}

export function getBlockLimit(blockType) {
  return 0;
}

/**
 * Returns a new Field object,
 * conditional on the type of block we're trying to create.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
export function getField(type) {
  let field;
  if (type === Blockly.BlockValueType.NUMBER) {
    field = new Blockly.FieldNumber();
  } else if (type.includes('ClampedNumber')) {
    const clampedNumberMatch = type.match(CLAMPED_NUMBER_REGEX);
    if (clampedNumberMatch) {
      const min = parseFloat(clampedNumberMatch[1]);
      const max = parseFloat(clampedNumberMatch[2]);
      field = new Blockly.FieldNumber(0, min, max);
    }
  } else {
    field = new Blockly.FieldTextInput();
  }
  return field;
}

/**
 * Returns a theme object, based on the presence of an option in the browser's localStorage.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
// Users can change their active theme using the context menu. Use this setting, if present.
export function getUserTheme(themeOption) {
  return Blockly.themes[localStorage.blocklyTheme] || themeOption || cdoTheme;
}

/**
 * Retrieves the serialization of the workspace (student code).
 *
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to serialize.
 * @param {boolean} [getSourceAsJson] - Flag indicating whether to retrieve the code as JSON or XML.
 *                                      If truthy, the code will be returned as a JSON string.
 *                                      If falsy, the code will be returned as an XML string.
 * @returns {string} The serialization of the workspace.
 */
export function getCode(workspace, getSourceAsJson) {
  if (getSourceAsJson) {
    return JSON.stringify(Blockly.serialization.workspaces.save(workspace));
  } else {
    return Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(workspace));
  }
}

export function soundField(onClick, transformText, icon) {
  // Handle 'play sound' block with default param from CDO blockly.
  // TODO: Remove when sprite lab is migrated to Google blockly.
  const validator = newValue => {
    if (typeof newValue !== 'string') {
      return null;
    }
    if (!newValue.startsWith(SOUND_PREFIX) || !newValue.endsWith('.mp3')) {
      console.error(
        'An invalid sound value was selected. Therefore, the default sound value will be used.'
      );
      return DEFAULT_SOUND;
    }
    return newValue;
  };
  return new Blockly.FieldButton({
    value: DEFAULT_SOUND,
    validator,
    onClick,
    transformText,
    icon,
  });
}

export function locationField(icon, onClick) {
  const transformTextSetField = value => {
    if (value) {
      try {
        const loc = JSON.parse(value);
        return `(${loc.x}, ${APP_HEIGHT - loc.y})`;
      } catch (e) {
        // Just ignore bad values
      }
    }
  };
  return new Blockly.FieldButton({
    onClick,
    transformText: transformTextSetField,
    icon,
  });
}

export function registerCustomProcedureBlocks() {
  unregisterProcedureBlocks();
  Blockly.common.defineBlocks(procedureBlocks);
}

/**
 * Partitions blocks of the specified types to the front of the list.
 *
 * @param {Element[]|Object[]} blocks - An array of block elements or JSON blocks to be partitioned.
 * @param {Object} [options] - An object containing partitioning options.
 * @param {string[]} [options.prioritizedBlockTypes] - An array of strings representing block types to move to the front.
 * @param {boolean} [options.isJson] - A flag indicating whether the blocks are JSON blocks (vs. block elements).
 * @returns {Element[]|Object[]} A new array of block elements or JSON blocks partitioned based on their types.
 */
export function partitionBlocksByType(
  blocks = [],
  prioritizedBlockTypes = [],
  isBlockElements = true
) {
  const prioritizedBlocks = [];
  const remainingBlocks = [];

  blocks.forEach(block => {
    const blockType = isBlockElements ? block.getAttribute('type') : block.type;
    prioritizedBlockTypes.includes(blockType)
      ? prioritizedBlocks.push(block)
      : remainingBlocks.push(block);
  });

  return [...prioritizedBlocks, ...remainingBlocks];
}

/**
 * Retrieves the toolbox blocks for a custom category from the level config.
 * @param {string} customCategory The name of the custom category to retrieve blocks from. (Ex. 'VARIABLE', 'Behavior')
 * @returns {Document} A new XML document containing the filtered blocks.
 */
export function getLevelToolboxBlocks(customCategory) {
  const parser = new DOMParser();
  // TODO: Update this to support JSON once https://codedotorg.atlassian.net/browse/CT-8 is merged
  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');

  // Find the category based on the custom attribute
  const categories = xmlDoc.getElementsByTagName('category');
  let foundCategory = null;

  for (const category of categories) {
    if (category.getAttribute('custom') === customCategory) {
      foundCategory = category;
      break;
    }
  }

  if (foundCategory) {
    // Create a new XML document and append the child nodes of the category to it
    const newXmlDocument = parser.parseFromString(
      '<xml></xml>',
      'application/xml'
    );
    for (const childNode of foundCategory.childNodes) {
      // Clone the child node and append it to the new XML document
      newXmlDocument.documentElement.appendChild(childNode.cloneNode(true));
    }

    return newXmlDocument;
  } else {
    return undefined;
  }
}

/**
 * Simplifies the state of blocks for a flyout by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the serialied variable map.
 * @param {object} serialization The serialized block state.
 * @returns {Array<object>} An array of simplified block objects.
 */
export function getSimplifiedStateForFlyout(serialization) {
  const variableMap = {};
  serialization.variables?.forEach(variable => {
    variableMap[variable.id] = variable.name;
  });

  const blocksList =
    serialization.blocks && serialization.blocks.blocks
      ? serialization.blocks.blocks.map(block =>
          simplifyBlockState(block, variableMap)
        )
      : [];

  return blocksList;
}

/**
 * Simplifies the state of a block by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the specified variable map.
 * @param {object} block The block to process.
 * @param {object} variableMap A map of variable IDs to variable names.
 * @returns {object} The processed block with variable names.
 */
function simplifyBlockState(block, variableMap) {
  // Create a copy of the block so we can modify certain fields.
  const result = {...block};

  // For VAR fields, look up the name of the variable to use instead of the id.
  if (block.fields && block.fields.VAR) {
    result.fields.VAR = {
      name: variableMap[block.fields.VAR.id] || '',
      type: '',
    };
  }

  // Recursively check nested blocks.
  if (block.inputs) {
    for (const inputKey in block.inputs) {
      result.inputs[inputKey].block = simplifyBlockState(
        block.inputs[inputKey].block,
        variableMap
      );
    }
  }
  // Recursively check next block, if present.
  if (block.next) {
    result.next.block = simplifyBlockState(block.next.block, variableMap);
  }
  // Remove unnecessary properties
  delete result.id;
  delete result.x;
  delete result.y;

  // Add 'kind' property
  result.kind = 'block';

  return result;
}

export function getBlockColor(block) {
  return block?.style?.colourPrimary;
}

export function appendSharedFunctions(startBlocksSource, functionsXml) {
  let startBlocks;
  console.log(stringIsXml(startBlocksSource) ? 'xml' : 'json');
  if (stringIsXml(startBlocksSource)) {
    startBlocks = blockUtils.appendNewFunctions(
      startBlocksSource,
      functionsXml
    );
  } else {
    const functionsJson = convertFunctionsXmlToJson(functionsXml);
    console.log({functionsJson: functionsJson});
    appendProceduresToState(startBlocksSource);
    startBlocks = startBlocksSource;
  }
  console.log({startBlocks: startBlocks});
  return startBlocks;
}
