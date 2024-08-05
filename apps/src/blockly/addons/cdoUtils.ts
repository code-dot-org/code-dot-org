import {unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
import {Block, BlockSvg, Field, Theme, WorkspaceSvg} from 'blockly';
import {
  ToolboxItemInfo,
  BlockInfo,
  ToolboxDefinition,
} from 'blockly/core/utils/toolbox';
import _ from 'lodash';

import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import {
  getProjectXml,
  processIndividualBlock,
  removeIdsFromBlocks,
} from '@cdo/apps/blockly/addons/cdoXml';
import {APP_HEIGHT} from '@cdo/apps/p5lab/constants';
import experiments from '@cdo/apps/util/experiments';

import * as blockUtils from '../../block_utils';
import {parseElement as parseXmlElement} from '../../xml';
import {
  BLOCK_TYPES,
  CLAMPED_NUMBER_REGEX,
  DARK_THEME_SUFFIX,
  DEFAULT_SOUND,
  stringIsXml,
  Themes,
  ToolboxType,
} from '../constants';
import {blocks as procedureBlocks} from '../customBlocks/googleBlockly/proceduresBlocks';
import cdoTheme from '../themes/cdoTheme';
import {
  BlockColor,
  JsonBlockConfig,
  SerializedFields,
  WorkspaceSerialization,
} from '../types';
import {getBaseName} from '../utils';

import {
  appendProceduresToState,
  convertFunctionsXmlToJson,
  convertXmlToJson,
  getProjectSerialization,
  hasBlocks,
  positionBlocksOnWorkspace,
} from './cdoSerializationHelpers';

/**
 * Loads blocks to a workspace.
 * To maintain backwards compatibility we must be able to use the XML source if no JSON state is provided.
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {string} source - workspace serialization, either XML or JSON
 */
export function loadBlocksToWorkspace(
  workspace: WorkspaceSvg,
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
}

function addProcedureCallBlocksToFlyout(
  workspace: WorkspaceSvg,
  mainSource: WorkspaceSerialization
) {
  const translatedToolboxInfo = workspace.options?.languageTree;
  if (workspace.getFlyout() && translatedToolboxInfo) {
    const callBlocks = [] as ToolboxItemInfo[];
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
        (item: BlockInfo) => item.type !== BLOCK_TYPES.procedureCall
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
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {boolean} [embedded] - indicates whether the source will be parsed
 * for an embedded workspace for not.
 * @returns Object: source as json
 */
function parseSource(source: string, embedded: boolean) {
  const isXml = stringIsXml(source);
  let parsedSource;

  if (isXml) {
    const xml = parseXmlElement(source);
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

export function handleColorAndStyle(
  block: Block,
  color: BlockColor,
  style: string
) {
  if (style) {
    // Styles are preferred because they are compatible with accessible themes.
    block.setStyle(style);
  } else if (color) {
    // Colors are fixed and do not change with themes.
    setHSV(block, ...color);
  } else {
    // The default block style is teal for our default theme.
    block.setStyle('default');
  }
}

export function setHSV(block: Block, h: number, s: number, v: number) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function injectCss() {
  return Blockly.Css.inject(true, 'media');
}

export function resizeSvg(blockSpace: WorkspaceSvg) {
  return Blockly.svgResize(blockSpace);
}

export function getBlockFields(block: Block) {
  const fields: Field[] = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}

export function getToolboxType(workspaceOverride?: WorkspaceSvg) {
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

export function getToolboxWidth(workspaceOverride?: WorkspaceSvg) {
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

export function workspaceSvgResize(workspace: WorkspaceSvg) {
  return Blockly.svgResize(workspace);
}

export function bindBrowserEvent(
  element: EventTarget,
  name: string,
  // We use Object and Function here because those are what Blockly uses.
  // eslint-disable-next-line @typescript-eslint/ban-types
  thisObject: Object | null,
  // eslint-disable-next-line @typescript-eslint/ban-types
  func: Function
) {
  return Blockly.browserEvents.bind(element, name, thisObject, func);
}

export function isWorkspaceReadOnly() {
  return false; // TODO - used for feedback
}
/**
 * Checks if any block type's usage count exceeds its defined limit and returns
 * the type of the first block found to exceed.
 * @returns {string | null} The type of the first block that exceeds its limit,
 * or null if no block exceeds the limit.
 */
export function blockLimitExceeded(): string | null {
  const {blockLimitMap, blockCountMap} = Blockly;

  // Ensure both maps are defined
  if (!blockLimitMap || !blockCountMap) {
    return null;
  }

  // Find the first instance where the limit is exceeded for a block type.
  for (const [type, count] of blockCountMap) {
    const limit = blockLimitMap.get(type);
    if (limit !== undefined && count > limit) {
      return type;
    }
  }

  // If no count exceeds the limit, return null.
  return null;
}

/**
 * Retrieves the block limit for a given block type from the block limit map.
 * @param {string} type The type of the block to check the limit for.
 * @returns {number | null} The limit for the specified block type, or null if not found.
 */
export function getBlockLimit(type: string): number | null {
  const limit = Blockly.blockLimitMap?.get(type);
  return limit !== undefined ? limit : null;
}

/**
 * Returns a new Field object,
 * conditional on the type of block we're trying to create.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
export function getField(type: string) {
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
 * @param {?Theme} themeOption
 * @returns {?Blockly.Field}
 */
export function getUserTheme(themeOption: Theme | undefined) {
  // Today we only store the theme's base name in localStorage, which never includes 'dark'.
  // Until March, 2024 we stored the full theme name, so we need to convert it now.
  // getBaseName strips the 'dark' suffix from a theme name, if present.
  const localStorageThemeBaseName = getBaseName(localStorage.blocklyTheme);

  // For labs that use dark mode by default, ensure we are returning a dark theme.
  if (themeOption?.name.endsWith(DARK_THEME_SUFFIX)) {
    return localStorageThemeBaseName
      ? Blockly.themes[
          (localStorageThemeBaseName + DARK_THEME_SUFFIX) as Themes
        ]
      : themeOption;
  } else {
    // For all other labs, return a light mode theme.
    return (
      Blockly.themes[localStorageThemeBaseName as Themes] ||
      themeOption ||
      cdoTheme
    );
  }
}

/**
 * Returns a cursor type, based on the presence of an option in the browser's localStorage.
 * @param {string} type
 * @returns {string} one of 'default', 'basic', or 'line'
 */
export function getUserCursorType() {
  const defaultCursorType = experiments.isEnabled(
    experiments.KEYBOARD_NAVIGATION
  )
    ? 'line'
    : 'default';
  return localStorage.blocklyCursor || defaultCursorType;
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
export function getCode(workspace: WorkspaceSvg, getSourceAsJson: boolean) {
  if (!getSourceAsJson) {
    return Blockly.Xml.domToText(getProjectXml(workspace));
  } else {
    return JSON.stringify(getProjectSerialization(workspace));
  }
}

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @returns {?string} A string representing a valid number, or null if invalid.
 *   Returns 0 for null or empty string.
 * @static
 */
export function numberValidator(text: string): string | null {
  text = text || '';
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/gi, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  const n = parseFloat(text || '0');
  return isNaN(n) ? null : String(n);
}

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @returns {?string} A string representing a valid int, or null if invalid.
 *   Returns '0' for negative numbers and null for truthy strings that do not contain numbers.
 * @static
 */
export function nonnegativeIntegerValidator(text: string): string | null {
  const n = numberValidator(text);
  if (n) {
    return String(Math.max(0, Math.floor(parseFloat(n))));
  }
  return n;
}
export function soundField(
  onClick: () => void,
  transformText?: (text: string) => string,
  icon?: SVGElement
) {
  // Handle 'play sound' block with default param from CDO blockly.
  // TODO: Remove when sprite lab is migrated to Google blockly.
  const validator = (newValue: string) => {
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

export function locationField(icon: SVGElement, onClick: () => void) {
  const transformTextSetField = (value: string) => {
    if (value) {
      try {
        const loc = JSON.parse(value);
        return `(${loc.x}, ${APP_HEIGHT - loc.y})`;
      } catch (e) {
        // Just ignore bad values
      }
    }
    return '';
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
 * Retrieves the toolbox blocks for a custom category from the level config.
 * @param {string} customCategory The name of the custom category to retrieve blocks from. (Ex. 'VARIABLE', 'Behavior')
 * @returns {Document} A new XML document containing the filtered blocks.
 */
export function getLevelToolboxBlocks(customCategory: string) {
  const parser = new DOMParser();
  // This method only works for string toolboxes.
  if (!Blockly.toolboxBlocks || typeof Blockly.toolboxBlocks !== 'string') {
    return;
  }
  // TODO: Update this to support JSON once https://codedotorg.atlassian.net/browse/CT-8 is merged
  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');

  // Find the category based on the custom attribute
  const categories = Array.from(xmlDoc.getElementsByTagName('category'));
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
    const childNodes = Array.from(foundCategory.childNodes);
    for (const childNode of childNodes) {
      // Clone the child node and append it to the new XML document
      newXmlDocument.documentElement.appendChild(childNode.cloneNode(true));
    }

    return newXmlDocument;
  } else {
    return undefined;
  }
}

/**
 * Creates a map of block types and limits, based on limit attributes found
 * in the block XML for the current toolbox.
 * @returns {Map<string, number>} A map of block limits
 */
export function createBlockLimitMap() {
  const parser = new DOMParser();
  // This method only works for string toolboxes.
  if (!Blockly.toolboxBlocks || typeof Blockly.toolboxBlocks !== 'string') {
    return;
  }

  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');
  // Define blockLimitMap
  const blockLimitMap = new Map<string, number>();

  // Select all block elements and convert NodeList to array
  const toolboxBlockElements = Array.from(xmlDoc.querySelectorAll('block'));

  // Iterate over each block element using forEach
  toolboxBlockElements.forEach(blockElement => {
    const limit = parseInt(blockElement.getAttribute('limit') ?? '');

    if (!isNaN(limit)) {
      // Extract type and add to blockLimitMap
      const type = blockElement.getAttribute('type');
      if (type !== null) {
        blockLimitMap.set(type, limit);
      }
    }
  });
  return blockLimitMap;
}

/**
 * Simplifies the state of blocks for a flyout by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the serialied variable map.
 * @param {object} serialization The serialized block state.
 * @returns {Array<object>} An array of simplified block objects.
 */
export function getSimplifiedStateForFlyout(
  serialization: WorkspaceSerialization
) {
  const blocksList = [] as object[];

  const {variables, blocks} = serialization;

  // Create a map of variable ids and names from the serialization.
  const serializedVariableMap: Map<string, string> = new Map();
  variables?.forEach(variable => {
    serializedVariableMap.set(variable.id, variable.name);
  });

  // Create a copy of the blocks list to avoid modifying the original
  const blocksCopy = {...blocks};

  // Replace variable ids with names and simplify state for flyout.
  blocksCopy.blocks?.forEach(block => {
    updateVariableFields(block, serializedVariableMap);
    blocksList.push(simplifyBlockState(block));
  });

  return blocksList;
}

// Function for updating field values
function updateVariableFields(
  block: {fields: SerializedFields},
  serializedVariableMap: Map<string, string>
): void {
  const fields = block.fields;
  for (const key in fields) {
    const field = fields[key];
    if (field.id && serializedVariableMap.has(field.id)) {
      field.name = serializedVariableMap.get(field.id)!;
      delete field.id;
    }
  }
}
/**
 * Simplifies the state of a block by removing properties like x/y and id.
 * Also replaces variable IDs with variable names derived from the specified variable map.
 * @param {object} block The block to process.
 * @returns {object} The processed block with variable names.
 */
function simplifyBlockState(block: JsonBlockConfig) {
  // Create a copy of the block so we can modify certain fields.
  const result = {...block};

  // Recursively check nested blocks.
  if (block.inputs?.block) {
    for (const inputKey in block.inputs) {
      result.inputs[inputKey].block = simplifyBlockState(
        block.inputs[inputKey].block
      );
    }
  }
  // Recursively check next block, if present.
  if (block.next?.block) {
    result.next.block = simplifyBlockState(block.next.block);
  }
  // Remove unnecessary properties
  delete result.id;
  delete result.x;
  delete result.y;

  // Add 'kind' property
  result.kind = 'block';

  return result;
}

export function getBlockColor(block: BlockSvg) {
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
export function appendSharedFunctions(
  startBlocksSource: string,
  functionsXml: string
) {
  let startBlocks;
  if (stringIsXml(startBlocksSource)) {
    // TODO: define a type for blockUtils
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startBlocks = (blockUtils as any).appendNewFunctions(
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
/**
 * Update the XML string representing toolbox data for compatibility with
 * Google Blockly.
 * This function potentially modifies each <block> element in the XML
 * if there are unsupported attributes, missing mutators, etc.
 * We also process block xml during domToBlockSpace, which is called to
 * convert sources from XML to JSON.
 *
 * @param {string} toolboxString - The XML string representing toolbox data.
 * @returns {string} The modified XML string after processing.
 */
export function processToolboxXml(toolboxString: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(toolboxString, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Error parsing XML');
  }

  const blocks = xmlDoc.querySelectorAll('block');
  blocks.forEach(processIndividualBlock);

  // Convert the modified XML document back to a string
  const modifiedXmlString = new XMLSerializer().serializeToString(xmlDoc);
  return modifiedXmlString;
}

export function highlightBlock(id: string, spotlight: boolean) {
  // Google Blockly doesn't consider the selected block to be a highlighted block,
  // so we unselect it first.
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  Blockly.getMainWorkspace().highlightBlock(id, spotlight);
}

// Removes block ids from an XML string toolbox
export function toolboxWithoutIds(
  toolbox: string | Element | ToolboxDefinition | undefined
) {
  if (typeof toolbox !== 'string') {
    return toolbox;
  }
  const toolboxDom = Blockly.Xml.textToDom(toolbox);
  removeIdsFromBlocks(toolboxDom);
  return Blockly.Xml.domToText(toolboxDom);
}

// Sets the lab code based on the student's blocks and any extra (e.g. initialization) code.
// The students blocks are considered to be any on the main or hidden workspaces.
export function getAllGeneratedCode(extraCode?: string) {
  let code = extraCode || '';

  [Blockly.getHiddenDefinitionWorkspace(), Blockly.getMainWorkspace()].forEach(
    workspace => {
      if (workspace) {
        Blockly.getGenerator().init(workspace);
        const blocks = workspace.getTopBlocks(true);
        const blocksCode: Block[] = [];
        blocks.forEach(block =>
          blocksCode.push(Blockly.JavaScript.blockToCode(block))
        );
        code += Blockly.getGenerator().finish(blocksCode.join('\n'));
      }
    }
  );
  return code;
}

// Returns the student's executable code based on blockXml. Blocks are loaded onto
// a single unrendered workspace. Used for Artist solution blocks in the student view.
export function getCodeFromBlockXmlSource(blockXmlString: string) {
  const domBlocks = Blockly.Xml.textToDom(blockXmlString);
  const workspace = new Blockly.Workspace();
  Blockly.Xml.domToBlockSpace(workspace, domBlocks);
  Blockly.getGenerator().init(workspace);
  const blocks = workspace.getTopBlocks(true);
  const code = [] as string[];
  blocks.forEach(block => code.push(Blockly.JavaScript.blockToCode(block)));
  const result = Blockly.getGenerator().finish(code.join('\n'));
  workspace.dispose();
  return result;
}

// Returns a list of Blockly toolbox blocks in JSON for a given category.
// This is used in order to merge XML toolbox blocks with the dynamically created
// blocks in auto-populated categories, such as Behaviors, Functions, and Variables.
export function getCategoryBlocksJson(category: string) {
  const levelToolboxBlocks = Blockly.cdoUtils.getLevelToolboxBlocks(category);
  if (!levelToolboxBlocks?.querySelector('xml')?.hasChildNodes()) {
    return [];
  }

  // Blockly supports XML or JSON, but not a combination of both.
  // We convert to JSON here because the other flyout blocks are JSON.
  const blocksConvertedJson = convertXmlToJson(
    levelToolboxBlocks.documentElement
  );
  const flyoutJson = getSimplifiedStateForFlyout(blocksConvertedJson);

  return flyoutJson;
}
