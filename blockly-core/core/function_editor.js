/**
 * @fileoverview Object representing a separate function editor.
 * This function editor provides a separate workspace where a user can
 * modify a given function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');

/**
 * Class for a function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
  this.functionEditorOpen_ = false;

  var blocklyTopLeftDiv = document.getElementById('blocklyApp');
  this.functionEditorDiv_ = goog.dom.createDom("div", "newFunctionDiv");
  blocklyTopLeftDiv.appendChild(this.functionEditorDiv_);
  this.workspace_ = new Blockly.BlockSpaceEditor(this.functionEditorDiv_);

  this.workspace_.addTopBlock = function (block) {
    Blockly.mainWorkspace.addTopBlock(block);
    Blockly.Workspace.prototype.addTopBlock.apply(this, arguments);
  };
  this.workspace_.removeTopBlock = function (block) {
    Blockly.mainWorkspace.removeTopBlock(block);
    Blockly.Workspace.prototype.removeTopBlock.apply(this, arguments);
  };
};

Blockly.FunctionEditor.sharedEditor = null;

Blockly.FunctionEditor.getSharedEditor = function() {
  if (!Blockly.FunctionEditor.sharedEditor) {
    Blockly.FunctionEditor.sharedEditor = new Blockly.FunctionEditor();
  }
  return Blockly.FunctionEditor.sharedEditor;
};

Blockly.FunctionEditor.prototype.createNewFunction = function() {
  this.openFunctionEditor(Blockly.FunctionEditor.newBlockXML('my new function'));
};

Blockly.FunctionEditor.prototype.openFunctionEditor = function(functionDefinitionXML) {
  this.functionEditorOpen_ = !this.functionEditorOpen_;
  goog.style.showElement(this.functionEditorDiv_, this.functionEditorOpen_);

  // Initialize this.workspace_ with specified function definition block
  var xml = Blockly.Xml.textToDom(functionDefinitionXML);
  Blockly.Xml.domToWorkspace(this.workspace_, xml);
};


Blockly.FunctionEditor.newBlockXML = function (name) {
  return '<xml><block type="procedures_defnoreturn"><mutation></mutation><title name="NAME">' + name + '</title></block></xml>';
};

/**
 * Dispose of this editor.
 */
Blockly.FunctionEditor.prototype.dispose = function() {
};
