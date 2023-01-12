import {ToolboxType, CLAMPED_NUMBER_REGEX} from '../constants';

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
  // Otherwise getFlyout will return the flout for the toolbox if it has categories.
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

const PERCENT_OF_ORIGINAL_RED = 0.6;
const PERCENT_OF_ORIGINAL_GREEN = 0.45;
const PERCENT_OF_ORIGINAL_BLUE = 0.6;

// takes a hex rgb value such as '#5b67a5' and darkens the color by decreasing
// each color channel by (1 - PERCENT_OF_ORIGINAL_<COLOR>)
export const convertToHighContrast = hexColor => {
  const red = darkenValue(hexColor.substring(1, 3), PERCENT_OF_ORIGINAL_RED);
  const green = darkenValue(
    hexColor.substring(3, 5),
    PERCENT_OF_ORIGINAL_GREEN
  );
  const blue = darkenValue(hexColor.substring(5, 7), PERCENT_OF_ORIGINAL_BLUE);

  return `#${red}${green}${blue}`;
};

// decreases a 2-digit hex value to PERCENT_OF_ORIGINAL of its value
const darkenValue = (hexValue, percentOfOriginal) => {
  const dec = Math.round(parseInt(hexValue, 16) * percentOfOriginal);
  let darkenHexValue = dec.toString(16);
  let len = darkenHexValue.length;
  for (let i = 0; i < 2 - len; i++) {
    darkenHexValue = '0' + darkenHexValue;
  }
  return darkenHexValue;
};
