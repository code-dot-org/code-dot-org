/* eslint-disable @typescript-eslint/no-empty-function */
import {WorkspaceSvg} from 'blockly';

export default class CdoWorkspaceSvg extends WorkspaceSvg {
  private globalVariables: string[] | null = null;
  // Called by StudioApp, but only implemented for CDO Blockly.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addUnusedBlocksHelpListener() {}

  getAllUsedBlocks() {
    return this.getAllBlocks().filter(block => block.isEnabled());
  }

  // Used in levels with pre-defined "Blockly Variables"
  registerGlobalVariables(globalVariables: string[]) {
    this.globalVariables = globalVariables;
    this.addVariablesToVariableMap(globalVariables);
  }

  // Used in levels when starting over or resetting Version History
  clear() {
    super.clear();
    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.addVariablesToVariableMap(this.globalVariables);
    }
  }

  getContainer() {
    return this.getSvgGroup().parentNode;
  }

  // TODO - called by StudioApp, not sure whether they're still needed.
  setEnableToolbox() {}

  traceOn() {}

  // TODO: Called by SpriteLab.js, is this needed by google blockly??
  events = {
    dispatchEvent() {},
  };

  private addVariablesToVariableMap(variables: string[]) {
    variables.forEach(varName => this.getVariableMap().createVariable(varName));
  }
}
