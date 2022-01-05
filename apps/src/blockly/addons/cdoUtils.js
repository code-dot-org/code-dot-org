import {ToolboxType} from '../constants';

export function getToolboxType() {
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

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function getAllUsedBlocks(workspace) {
  return workspace.getAllBlocks().filter(block => !block.disabled);
}

export function blockIsUnused(block) {
  if (!block) {
    return;
  }
  const isTopBlock = block.previousConnection === null;
  const hasParentBlock = !!block.parentBlock_;
  return !(isTopBlock || hasParentBlock);
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

export function isWorkspaceReadOnly(workspace) {
  return false; // TODO
}

export function blockLimitExceeded() {
  return false;
}

export function getBlockLimit(block) {
  return 0;
}
