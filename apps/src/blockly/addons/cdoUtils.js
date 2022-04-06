import {ToolboxType} from '../constants';

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
  console.log('calling new cdoUtils/getToolboxType');
  const workspace = Blockly.getMainWorkspace();
  if (workspace.flyout_) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.toolbox_) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth() {
  console.log('calling new cdoUtils/getToolboxWidth');
  const workspace = Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  const toolboxType = getToolboxType();
  console.log('new cdoUtils/getToolboxWdith: ', toolboxType);
  switch (toolboxType) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      return 0;
  }
}

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}
