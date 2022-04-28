import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';
import {getToolboxType} from './cdoUtils';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  registerGlobalVariables(variableList) {
    this.globalVariables = variableList;
    this.getVariableMap().addVariables(variableList);
  }

  getContainer() {
    return this.svgGroup_.parentNode;
  }

  clear() {
    super.clear();

    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.getVariableMap().addVariables(this.globalVariables);
    }
  }

  addUnusedBlocksHelpListener(helpClickFunc) {
    Blockly.bindEvent_(
      Blockly.mainBlockSpace.getCanvas(),
      Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
      Blockly.mainBlockSpace,
      function() {
        this.getTopBlocks().forEach(block => {
          if (block.disabled) {
            block.addUnusedBlockFrame(helpClickFunc);
          }
        });
      }
    );
  }
  getAllUsedBlocks() {
    return super.getAllBlocks().filter(block => !block.disabled);
  }

  setEnableToolbox() {} // TODO - called by StudioApp, not sure whether it's still needed.
  traceOn() {} // TODO
}

const oldBlocklyResize = GoogleBlockly.WorkspaceSvg.prototype.resize;
WorkspaceSvg.prototype.resize = function() {
  oldBlocklyResize.call(this);
  if (getToolboxType() === ToolboxType.UNCATEGORIZED) {
    this.flyout_.resize();
  }
};

WorkspaceSvg.prototype.events = {
  dispatchEvent: () => {} // TODO
};
