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

  /** Instantiate trashcan, but don't add it to the workspace SVG.
   * @override
   */
  addTrashcan() {
    if (!Blockly.Trashcan) {
      throw Error('Missing require for Blockly.Trashcan');
    }
    /** @type {Blockly.Trashcan} */
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();

    switch (this.getToolboxType()) {
      case ToolboxType.UNCATEGORIZED: {
        const trashcanHolder = Blockly.utils.dom.createSvgElement('svg', {
          id: 'trashcanHolder',
          height: 125,
          style: 'position: absolute; display: none;'
        });
        trashcanHolder.appendChild(svgTrashcan);
        this.flyout_.svgGroup_.appendChild(trashcanHolder);
        break;
      }
      case ToolboxType.CATEGORIZED:
        // The Toolbox will add the trashcan to its SVG when its DOM element
        // is created (see CdoToolbox.js).
        break;
    }
  }

  getAllUsedBlocks() {
    return super.getAllBlocks().filter(block => !block.disabled);
  }

  resize() {
    super.resize();

    if (this.getToolboxType() === ToolboxType.UNCATEGORIZED) {
      this.flyout_.resize();
    }
  }

  setEnableToolbox() {} // TODO - called by StudioApp, not sure whether it's still needed.
  traceOn() {} // TODO
}

WorkspaceSvg.prototype.events = {
  dispatchEvent: () => {} // TODO
};
