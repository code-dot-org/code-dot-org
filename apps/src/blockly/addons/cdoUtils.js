import {
  ToolboxType,
  CLAMPED_NUMBER_REGEX,
  DEFAULT_SOUND,
  stringIsXml,
} from '../constants';
import cdoTheme from '../themes/cdoTheme';
import {APP_HEIGHT} from '@cdo/apps/p5lab/constants';
import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import {
  convertXmlToJson,
  positionBlocksOnWorkspace,
} from './cdoSerializationHelpers';
import {parseElement as parseXmlElement} from '../../xml';
import {unregisterProcedureBlocks} from '@blockly/block-shareable-procedures';
import {blocks as procedureBlocks} from '../customBlocks/googleBlockly/proceduresBlocks';

/**
 * Loads blocks to a workspace.
 * To maintain backwards compatibility we must be able to use the XML source if no JSON state is provided.
 * @param {Blockly.Workspace} workspace - the current Blockly workspace
 * @param {string} source - workspace serialization, either XML or JSON
 * @param {*} stateToLoad - modern workspace serialization, may not be present
 */
export function loadBlocksToWorkspace(workspace, source, procedures) {
  console.log('in loadBlocksToWorkspace');
  // let isXml = stringIsXml(source);
  // let stateToLoad;
  // let blockOrderMap;
  // if (isXml) {
  //   const xml = parseXmlElement(source);
  //   stateToLoad = convertXmlToJson(xml);
  //   blockOrderMap = Blockly.Xml.createBlockOrderMap(xml);
  // } else {
  //   stateToLoad = JSON.parse(source);
  // }
  const {parsedSource, parsedProcedures, blockOrderMap} =
    parseSourceAndProcedures(source, procedures);
  Blockly.serialization.workspaces.load(parsedSource, workspace);
  loadProcedureBlocksToWorkspace(parsedProcedures);
  positionBlocksOnWorkspace(workspace, blockOrderMap);
}

function loadProcedureBlocksToWorkspace(source) {
  console.log('in loadProcedureBlocksToWorkspace', source);
  if (Blockly.getHiddenDefinitionWorkspace() && source) {
    //Blockly.functionEditor.unifyMainAndHiddenWorkspaceProcedures();
    Blockly.serialization.workspaces.load(
      source,
      Blockly.getHiddenDefinitionWorkspace()
    );
    Blockly.functionEditor.setUpEditorWorkspaceProcedures();
  }
}

function parseSourceAndProcedures(source, procedures) {
  let isXml = stringIsXml(source);
  let parsedSource;
  let parsedProcedures;
  let blockOrderMap;
  procedures = procedures || '{}';
  if (isXml) {
    console.log('parsing xml! source is ', source);
    const xml = parseXmlElement(source);
    parsedSource = convertXmlToJson(xml);
    blockOrderMap = Blockly.Xml.createBlockOrderMap(xml);
  } else {
    parsedSource = JSON.parse(source);
  }
  parsedProcedures = JSON.parse(procedures);
  if (Blockly.useModalFunctionEditor) {
    const procedures = [];
    const otherBlocks = [];
    console.log({parsedSourceLength: parsedSource.blocks.blocks.length});
    parsedSource.blocks.blocks.forEach(block => {
      // TODO: we may need to include more types here once behaviors are added.
      if (block.type === 'procedures_defnoreturn') {
        procedures.push(block);
      } else {
        otherBlocks.push(block);
      }
    });
    parsedSource.blocks.blocks = otherBlocks;
    console.log({parsedSourceAfterUpdate: parsedSource});
    parsedProcedures.blocks ||= {};
    parsedProcedures.blocks.blocks ||= [];
    parsedProcedures.blocks.blocks.push(...procedures);
    if (parsedSource.procedures && parsedSource.procedures.length > 0) {
      parsedProcedures.procedures ||= [];
      // TODO: need to not add duplicates
      parsedProcedures.procedures.push(...parsedSource.procedures);
    }
  }
  return {parsedSource, parsedProcedures, blockOrderMap};
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
