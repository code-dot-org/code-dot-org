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

  this.workspace_ = new Blockly.Workspace(null, null /** TODO(bjordan) reimplement with editorWorkspace **/);
  this.workspace_.getMetrics = Blockly.generateGetWorkspaceMetrics_(this.workspace_);
  this.workspace_.setMetrics = Blockly.generateSetWorkspaceMetrics_(this.workspace_);

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
  var blocklyTopLeftDiv = document.getElementById('blocklyApp');

  // Handle toggling
  {
    if (this.functionEditorOpen_) {
      this.functionEditorOpen_ = false;
      goog.dom.removeNode(goog.dom.getElementByClass('newFunctionDiv'));
      return;
    }
    this.functionEditorOpen_ = true;
  }

  // Initialize workspace and construct DOM elements
  {
    var functionDefinitionDiv = goog.dom.createDom("div", "newFunctionDiv");
    var svgWorkspaceContainer = Blockly.createSvgElement('svg', {width: 1200, height: 700, x: 0, y: 0}, null);
    Blockly.createSvgElement('rect', {'class': 'blocklyMutatorBackground', 'height': '100%', 'width': '100%'}, svgWorkspaceContainer);

    svgWorkspaceContainer.appendChild(this.workspace_.createDom());
    functionDefinitionDiv.appendChild(svgWorkspaceContainer);
    blocklyTopLeftDiv.appendChild(functionDefinitionDiv);
  }

  // Initialize toolbox
  {
    if (Blockly.hasCategories) {
      var toolbox = new Blockly.Toolbox();
      toolbox.createDom(svgWorkspaceContainer);
      toolbox.init(this.workspace_);
    } else {
      // Construct flyout DOM
      {
        this.workspace_.flyout_ = new Blockly.Flyout();
        this.workspace_.flyout_.autoClose = false;
        goog.dom.insertChildAt(svgWorkspaceContainer, this.workspace_.flyout_.createDom(), 0);
      }

      // Init with some studio blocks
      {
        this.workspace_.flyout_.init(this.workspace_, true);
        var flyoutBlocks = Blockly.Xml.textToDom('<xml><block type="studio_showTitleScreenParams" inline="false"><value name="TITLE"><block type="text"><title name="TEXT"></title></block></value><value name="TEXT"><block type="text"><title name="TEXT"></title></block></value></block><block type="studio_moveDistanceParams" inline="true"><title name="SPRITE">0</title><title name="DIR">1</title><value name="DISTANCE"><block type="math_number"><title name="NUM">25</title></block></value></block><block type="studio_playSound"><title name="SOUND">hit</title></block></xml>');
        this.workspace_.flyout_.show(flyoutBlocks.childNodes);
      }

      // Flyout init boilerplate: translate the this.workspace_ to be next to flyout
      {
        this.workspace_.pageXOffset = this.workspace_.flyout_.width_;
        var translation = 'translate(' + this.workspace_.pageXOffset + ', 0)';
        this.workspace_.getCanvas().setAttribute('transform', translation);
        this.workspace_.getBubbleCanvas().setAttribute('transform', translation);
      }
    }

    // Initialize this.workspace_ with specified function definition block
    {
      var xml = Blockly.Xml.textToDom(functionDefinitionXML);
      Blockly.Xml.domToWorkspace(this.workspace_, xml);
    }

    // Add trashcan
    {
      this.workspace_.addTrashcan();
    }
  }
};


Blockly.FunctionEditor.newBlockXML = function (name) {
  return '<xml><block type="procedures_defnoreturn"><mutation></mutation><title name="NAME">' + name + '</title></block></xml>';
};

/**
 * Dispose of this editor.
 */
Blockly.FunctionEditor.prototype.dispose = function() {
};
