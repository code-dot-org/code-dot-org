import {ToolboxType, CLAMPED_NUMBER_REGEX} from '../constants';
import cdoTheme from '../themes/cdoTheme';

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
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

export function getCode(workspace) {
  return Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(workspace));
  // After supporting JSON block sources, change to:
  // return JSON.stringify(Blockly.serialization.workspaces.save(workspace));
}

export function soundField(onChange) {
  const capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const parsePathString = text => {
    // Example string paths:
    // 'sound://category_board_games/card_dealing_multiple.mp3'
    // 'sound://default.mp3'
    const pathStringArray = text.split('/');
    let category = '';
    // Some sounds do not include a category, such as default.mp3
    if (pathStringArray[2].includes('category_')) {
      // Example: 'category_board_games' becomes 'Board games: '
      category = capitalizeFirstLetter(
        pathStringArray[2].replace('category_', '').replaceAll('_', ' ') + ': '
      );
    }
    // Example: 'card_dealing_multiple.mp3' becomes 'card_dealing_multiple'
    const soundName = pathStringArray[pathStringArray.length - 1].replace(
      '.mp3',
      ''
    );
    // Examples: 'Board games: card_dealing_multiple', 'default'
    const fieldText = `${category}${soundName}`;
    return fieldText;
  };

  const onDisplay = soundPath => {
    return parsePathString(soundPath);
  };
  return new Blockly.FieldPicker('Choose', onChange, onDisplay);
}

export function locationField(buttonIcon, onChange, __, onDisplay) {
  // FieldPicker(value, onChange, onDisplay, buttonIcon)
  return new Blockly.FieldPicker({x: 0, y: 0}, onChange, onDisplay, buttonIcon);
}
