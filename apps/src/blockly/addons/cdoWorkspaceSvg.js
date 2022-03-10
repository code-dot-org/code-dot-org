import GoogleBlockly from 'blockly/core';
import {ToolboxType} from '../constants';
import {getToolboxType} from './cdoUtils';

GoogleBlockly.WorkspaceSvg.prototype.registerGlobalVariables = function(
  variableList
) {
  this.globalVariables = variableList;
  this.getVariableMap().addVariables(variableList);
};

GoogleBlockly.WorkspaceSvg.prototype.getContainer = function() {
  return this.svgGroup_.parentNode;
};

const oldBlocklyClear = GoogleBlockly.WorkspaceSvg.prototype.clear;

GoogleBlockly.WorkspaceSvg.prototype.clear = function() {
  oldBlocklyClear.call(this);

  // After clearing the workspace, we need to reinitialize global variables
  // if there are any.
  if (this.globalVariables) {
    this.getVariableMap().addVariables(this.globalVariables);
  }
};

const oldBlocklyResize = GoogleBlockly.WorkspaceSvg.prototype.resize;

// See the vertical flyout for an alternate potential workaround.
GoogleBlockly.WorkspaceSvg.prototype.resize = function() {
  oldBlocklyResize.call(this);
  if (getToolboxType() === ToolboxType.UNCATEGORIZED) {
    this.flyout_.resize();
  }
};

GoogleBlockly.WorkspaceSvg.prototype.isReadOnly = function() {
  return false;
};

GoogleBlockly.WorkspaceSvg.prototype.events = {
  dispatchEvent: () => {} // TODO
};
