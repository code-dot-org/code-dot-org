import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';

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

  isReadOnly() {
    return false; // TODO - used for feedback
  }

  resize() {
    super.resize();

    if (this.getToolboxType() === ToolboxType.UNCATEGORIZED) {
      this.flyout_.resize();
    }
  }
}

WorkspaceSvg.prototype.events = {
  dispatchEvent: () => {} // TODO
};
