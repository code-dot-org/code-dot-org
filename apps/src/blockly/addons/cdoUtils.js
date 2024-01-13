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
  getCombinedSerialization,
  hasBlocks,
  positionBlocksOnWorkspace,
  resetEditorWorkspaceBlockConfig,
} from './cdoSerializationHelpers';
import {parseElement as parseXmlElement} from '../../xml';
import * as blockUtils from '../../block_utils';

/**
 * Loads blocks to a workspace.
 * To maintain backwards compatibility we must be able to use the XML source if no JSON state is provided.
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {string} source - workspace serialization, either XML or JSON
 */
export function loadBlocksToWorkspace(
  workspace,
  source,
  includeHiddenDefinitions = true
) {
  const {mainSource, hiddenDefinitionSource} =
    prepareSourcesForWorkspaces(source);
  // We intentionally load hidden definitions before other blocks on the main workspace.
  if (includeHiddenDefinitions) {
    loadHiddenDefinitionBlocksToWorkspace(hiddenDefinitionSource);
  }
  Blockly.serialization.workspaces.load(mainSource, workspace);
  positionBlocksOnWorkspace(workspace);
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
 * Split source into appropriate serialization objects for the main and the hidden workspaces for loading.
 * Which blocks are moved depends on whether the modal function editor is enabled.
 * @param {string} source - workspace serialization, either XML or JSON
 * @returns {mainSource: Object, hiddenDefinitionSource: Object}
 *  mainSource and hiddenDefinitionSource are Blockly serialization objects.
 */
function prepareSourcesForWorkspaces(source) {
  let {parsedSource} = parseSource(source);
  const procedureTypesToHide = [BLOCK_TYPES.behaviorDefinition];
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
 * Also create a block order map if source was xml, which will allow us to correctly place blocks on the workspace.
 * @param {string} source - workspace serialization, either XML or JSON
 * @returns {parsedSource: Object}
 */
function parseSource(source) {
  let isXml = stringIsXml(source);
  let parsedSource;

  if (isXml) {
    const xml = parseXmlElement(source);
    parsedSource = convertXmlToJson(xml);
  } else {
    parsedSource = JSON.parse(source);
  }

  return {parsedSource};
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
export function moveHiddenBlocks(source = {}, procedureTypesToHide = []) {
  if (procedureTypesToHide.length === 0 || !hasBlocks(source)) {
    return {mainSource: {}, hiddenDefinitionSource: {}};
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
    const hideBlock = procedureTypesToHide.includes(block.type) || invisible;
    const destination = hideBlock ? hiddenDefinitionSource : mainSource;
    destination.blocks.blocks.push(block);

    // Also copy the procedure model for blocks to that need to be hidden
    // Equality check works because hiddenDefinitionSource and mainSource are different object references
    if (destination === hiddenDefinitionSource && procedureId) {
      const procedureModel = source.procedures.find(
        procedure => procedure.id === procedureId
      );
      if (procedureModel) {
        hiddenDefinitionSource.procedures.push(procedureModel);
      }
    }
  });

  return {
    mainSource,
    hiddenDefinitionSource,
  };
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

export function getToolboxType(workspaceOverride) {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
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

export function getToolboxWidth(workspaceOverride) {
  const workspace = workspaceOverride || Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType(workspace)) {
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

export function isWorkspaceReadOnly() {
  return false; // TODO - used for feedback
}

export function blockLimitExceeded() {
  return false;
}

export function getBlockLimit() {
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
  if (!getSourceAsJson) {
    return Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(workspace));
  }

  const mainWorkspaceSerialization =
    Blockly.serialization.workspaces.save(workspace);

  const hiddenDefinitionWorkspace = Blockly.getHiddenDefinitionWorkspace();
  const hiddenWorkspaceSerialization = hiddenDefinitionWorkspace
    ? Blockly.serialization.workspaces.save(hiddenDefinitionWorkspace)
    : null;

  // Blocks rendered in the hidden workspace get extra properties that need to be
  // removed so they don't apply if the block moves to the main workspace on subsequent loads
  if (hasBlocks(hiddenWorkspaceSerialization)) {
    resetEditorWorkspaceBlockConfig(hiddenWorkspaceSerialization.blocks.blocks);
  }

  const combinedSerialization = getCombinedSerialization(
    mainWorkspaceSerialization,
    hiddenWorkspaceSerialization
  );

  return JSON.stringify(combinedSerialization);
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

  const blocksList = hasBlocks(serialization)
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

/**
 * Combines shared functions (XML) with a starting block source (XML or JSON).
 * Used in levels where shared functions and behaviors are enabled.
 *
 * @param {string} startBlocksSource - The source of starting blocks (XML or JSON).
 * @param {string} functionsXml - The XML representation of functions to append.
 * @returns {string} - Updated starting blocks in JSON format.
 */
export function appendSharedFunctions(startBlocksSource, functionsXml) {
  let startBlocks;
  if (stringIsXml(startBlocksSource)) {
    startBlocks = blockUtils.appendNewFunctions(
      startBlocksSource,
      functionsXml
    );
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
