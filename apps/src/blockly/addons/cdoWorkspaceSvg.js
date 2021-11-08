import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  registerGlobalVariables(variableList) {
    this.globalVariables = variableList;
    this.getVariableMap().addVariables(variableList);
  }

  clear() {
    super.clear();

    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.getVariableMap().addVariables(this.globalVariables);
    }
  }

  /**
   * The way toolboxes work in Blockly is kind of confusing, this helper function
   * is intended to make it easier to tell what kind of toolbox is in use.
   * Part of the issue is that the word "toolbox" is slightly overloaded to encompass
   * both Toolbox and Flyout objects. In this description I use lower-case toolbox
   * to refer to the area of the workspace where blocks come from and upper-case
   * Toolbox to refer to instances of the Toolbox class.
   * There are two kinds of toolboxes we use in levels: categorized and uncategorized.
   * Categorized toolboxes are instances of the Toolbox class. When a category
   * is selected, the Toolbox opens a Flyout that displays the blocks in that category.
   * Uncategorized toolboxes are instances of the Flyout class that just display
   * all of the available blocks.
   */
  getToolboxType() {
    if (this.flyout_) {
      return ToolboxType.UNCATEGORIZED;
    } else if (this.toolbox_) {
      return ToolboxType.CATEGORIZED;
    } else {
      return ToolboxType.NONE;
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
  addUnusedBlocksHelpListener(helpClickFunc) {
    Blockly.mainBlockSpace.addChangeListener(Blockly.Events.disableOrphans);

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
  getToolboxWidth() {
    return Blockly.mainBlockSpace.getMetrics().toolboxWidth;
  }

  /**
   * Use visibility:hidden not display:none for the toolbox contents so that
   * Blockly's metrics calculations for toolbox dimensions still work as expected.
   * Use display:none not visibility:hidden for the trashcan element so that
   * it doesn't interfere with click events on the toolbox categories.
   */
  hideTrashcan() {
    // If there's no toolbox, there's no trashcan.
    if (this.getToolboxType() === ToolboxType.NONE) {
      return;
    }

    /**
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(
      document.querySelectorAll('.blocklyFlyout .blocklyWorkspace'),
      function(x) {
        x.style.visibility = 'visible';
      }
    );

    /**
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(
      document.querySelectorAll('.blocklyToolboxContents'),
      function(x) {
        x.style.visibility = 'visible';
      }
    );

    document.querySelector('#trashcanHolder').style.display = 'none';
  }

  isReadOnly() {
    return false; // TODO - used for feedback
  }
  setEnableToolbox() {} // TODO - called by StudioApp, not sure whether it's still needed.
  showTrashcan() {
    // If there's no toolbox, there's no trashcan.
    if (this.getToolboxType() === ToolboxType.NONE) {
      return;
    }

    /**
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(
      document.querySelectorAll('.blocklyFlyout .blocklyWorkspace'),
      function(x) {
        x.style.visibility = 'hidden';
      }
    );

    /**
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(
      document.querySelectorAll('.blocklyToolboxContents'),
      function(x) {
        x.style.visibility = 'hidden';
      }
    );

    document.querySelector('#trashcanHolder').style.display = 'block';
  }
  traceOn() {} // TODO
}

WorkspaceSvg.prototype.blockSpaceEditor = {
  blockLimits: {
    blockLimitExceeded: () => false, // TODO
    getLimit: () => {} // TODO
  },
  svgResize: () => {} // TODO
};

WorkspaceSvg.prototype.events = {
  dispatchEvent: () => {} // TODO
};
