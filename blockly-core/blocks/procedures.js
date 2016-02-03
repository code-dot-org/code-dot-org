/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.procedures');

goog.require('Blockly.Blocks');


Blockly.Blocks.procedures_defnoreturn = {
  shouldHideIfInMainBlockSpace: function () {
    return Blockly.useModalFunctionEditor;
  },
  // Define a procedure with no return value.
  init: function() {
    var showParamEditIcon = !Blockly.disableParamEditing && !Blockly.useModalFunctionEditor;

    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);
    var name = Blockly.Procedures.findLegalName(
        Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
    this.appendDummyInput()
        .appendTitle(showParamEditIcon ? '' : ' ')
        .appendTitle(new Blockly.FieldTextInput(name,
        Blockly.Procedures.rename), 'NAME')
        .appendTitle('', 'PARAMS');
    this.appendStatementInput('STACK')
        .appendTitle(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
    if (showParamEditIcon) {
      this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    }
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    // Only want to have the backdrop in the mainBlockSpace. We don't want it in
    // the toolbox or in the feedback dialog (which is readonly).
    this.setFramed(this.blockSpace === Blockly.mainBlockSpace && !this.blockSpace.isReadOnly());
    this.parameterNames_ = [];
  },
  updateParams_: function() {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var x = 0; x < this.parameterNames_.length; x++) {
      if (hash['arg_' + this.parameterNames_[x].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.parameterNames_[x].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    var paramString = '';
    if (this.parameterNames_.length) {
      paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
          ' ' + this.parameterNames_.join(', ');
    }
    this.setTitleValue(paramString, 'PARAMS');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    // Add argument mutations
    for (var x = 0; x < this.parameterNames_.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.parameterNames_[x]);
      container.appendChild(parameter);
    }
    // Add description mutation
    if (this.description_) {
      var desc = document.createElement('description');
      desc.innerHTML = this.description_;
      container.appendChild(desc);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.parameterNames_ = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      var nodeName = childNode.nodeName.toLowerCase();
      if (nodeName === 'arg') {
        this.parameterNames_.push(childNode.getAttribute('name'));
      } else if (nodeName === 'description') {
        this.description_ = childNode.innerHTML;
      }
    }
    this.updateParams_();
  },
  decompose: function(blockSpace) {
    var containerBlock = new Blockly.Block(blockSpace,
                                           'procedures_mutatorcontainer');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.parameterNames_.length; x++) {
      var paramBlock = new Blockly.Block(blockSpace, 'procedures_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setTitleValue(this.parameterNames_[x], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = x;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this.getTitleValue('NAME'),
        this.blockSpace, this.parameterNames_, null);
    return containerBlock;
  },
  /**
   * Modifies this block's parameters to match a given mutator block
   * @param {Blockly.Block} containerBlock mutator container block
   */
  compose: function(containerBlock) {
    var currentParamBlock = containerBlock.getInputTargetBlock('STACK');
    var paramNames = [];
    var paramIDs = [];
    while (currentParamBlock) {
      paramNames.push(currentParamBlock.getTitleValue('NAME'));
      paramIDs.push(currentParamBlock.id);
      currentParamBlock = currentParamBlock.nextConnection &&
        currentParamBlock.nextConnection.targetBlock();
    }
    this.updateParamsFromArrays(paramNames, paramIDs);
  },
  /**
   * Updates parameters (renaming, deleting, adding as appropriate)
   * on this procedure and its callers.
   * @param {Array.<String>} paramNames ordered names of parameters for this procedure
   * @param {Array.<String>} paramIDs unique IDs for each parameter, used to update existing
   *     references to parameters across renames
   */
  updateParamsFromArrays: function(paramNames, paramIDs) {
    this.parameterNames_ = goog.array.clone(paramNames);
    this.paramIds_ = paramIDs ? goog.array.clone(paramIDs) : null;
    this.updateParams_();
    this.updateCallerParams_();
  },
  updateCallerParams_: function() {
    Blockly.Procedures.mutateCallers(this.getTitleValue('NAME'),
        this.blockSpace, this.parameterNames_, this.paramIds_);
  },
  /**
   * Disposes of this block and (optionally) its callers
   * @param {boolean} healStack see superclass
   * @param {boolean} animate see superclass
   * @param {?boolean} opt_keepCallers if false, callers of this method
   *    are disposed
   * @override
   */
  dispose: function(healStack, animate, opt_keepCallers) {
    if (!opt_keepCallers) {
      // Dispose of any callers.
      var name = this.getTitleValue('NAME');
      Blockly.Procedures.disposeCallers(name, this.blockSpace);
    }
    // Call parent's destructor.
    Blockly.Block.prototype.dispose.apply(this, arguments);
  },
  getProcedureInfo: function() {
    return {
      name: this.getTitleValue('NAME'),
      parameterNames: this.parameterNames_,
      parameterIDs: this.paramIds_,
      type: this.type,
      callType: this.callType_
    };
  },
  getVars: function() {
    return this.parameterNames_;
  },
  renameVar: function(oldName, newName) {
    var change = false;
    for (var x = 0; x < this.parameterNames_.length; x++) {
      if (Blockly.Names.equals(oldName, this.parameterNames_[x])) {
        this.parameterNames_[x] = newName;
        change = true;
      }
    }
    if (change) {
      this.updateParams_();
      // Update the mutator's variables if the mutator is open.
      if (this.mutator && this.mutator.isVisible()) {
        var blocks = this.mutator.blockSpace_.getAllBlocks();
        for (var x = 0, block; block = blocks[x]; x++) {
          if (block.type == 'procedures_mutatorarg' &&
              Blockly.Names.equals(oldName, block.getTitleValue('NAME'))) {
            block.setTitleValue(newName, 'NAME');
          }
        }
      }
    }
  },
  removeVar: function(oldName) {
    var index = this.parameterNames_.indexOf(oldName);
    if (index > -1) {
      this.parameterNames_.splice(index, 1);
      this.updateParams_();
    }
  },
  customContextMenu: function(options) {
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getTitleValue('NAME');
    option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);

    var xmlMutation = goog.dom.createDom('mutation');
    xmlMutation.setAttribute('name', name);
    for (var x = 0; x < this.parameterNames_.length; x++) {
      var xmlArg = goog.dom.createDom('arg');
      xmlArg.setAttribute('name', this.parameterNames_[x]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
    xmlBlock.setAttribute('type', this.callType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);

    options.push(option);
    // Add options to create getters for each parameter.
    for (var x = 0; x < this.parameterNames_.length; x++) {
      var option = {enabled: true};
      var name = this.parameterNames_[x];
      option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlTitle = goog.dom.createDom('title', null, name);
      xmlTitle.setAttribute('name', 'VAR');
      var xmlBlock = goog.dom.createDom('block', null, xmlTitle);
      xmlBlock.setAttribute('type', 'variables_get');
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  },
  userCreated: false,
  shouldBeGrayedOut: function () {
    return false;
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Blocks.procedures_defreturn = {
  shouldHideIfInMainBlockSpace: function () {
    return Blockly.useModalFunctionEditor;
  },
  // Define a procedure with a return value.
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);
    var name = Blockly.Procedures.findLegalName(
        Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE)
        .appendTitle(new Blockly.FieldTextInput(name,
        Blockly.Procedures.rename), 'NAME')
        .appendTitle('', 'PARAMS');
    this.appendStatementInput('STACK')
        .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_DO);
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    // Only want to have the backdrop in the mainBlockSpace. We don't want it in
    // the toolbox or in the feedback dialog (which is readonly).
    this.setFramed(this.blockSpace === Blockly.mainBlockSpace && !this.blockSpace.isReadOnly());
    this.parameterNames_ = [];
  },
  updateParams_: Blockly.Blocks.procedures_defnoreturn.updateParams_,
  updateCallerParams_: Blockly.Blocks.procedures_defnoreturn.updateCallerParams_,
  updateParamsFromArrays: Blockly.Blocks.procedures_defnoreturn.updateParamsFromArrays,
  mutationToDom: Blockly.Blocks.procedures_defnoreturn.mutationToDom,
  domToMutation: Blockly.Blocks.procedures_defnoreturn.domToMutation,
  decompose: Blockly.Blocks.procedures_defnoreturn.decompose,
  compose: Blockly.Blocks.procedures_defnoreturn.compose,
  dispose: Blockly.Blocks.procedures_defnoreturn.dispose,
  getProcedureInfo: function() {
    return {
      name: this.getTitleValue('NAME'),
      parameterNames: this.parameterNames_,
      parameterIDs: this.paramIds_,
      type: this.type,
      callType: this.callType_
    };
  },
  getVars: Blockly.Blocks.procedures_defnoreturn.getVars,
  renameVar: Blockly.Blocks.procedures_defnoreturn.renameVar,
  customContextMenu: Blockly.Blocks.procedures_defnoreturn.customContextMenu,
  userCreated: Blockly.Blocks.procedures_defnoreturn.userCreated,
  shouldBeGrayedOut: Blockly.Blocks.procedures_defnoreturn.shouldBeGrayedOut,
  callType_: 'procedures_callreturn'
};

Blockly.Blocks.procedures_mutatorcontainer = {
  // Procedure container (for mutator dialog).
  init: function() {
    this.setHSV(94, 0.84, 0.60);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
    this.appendStatementInput('STACK');
    this.setTooltip('');
    this.contextMenu = false;
  }
};

Blockly.Blocks.procedures_mutatorarg = {
  // Procedure argument (for mutator dialog).
  init: function() {
    this.setHSV(94, 0.84, 0.60);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE)
        .appendTitle(new Blockly.FieldTextInput('x', this.validator), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.contextMenu = false;
  }
};

Blockly.Blocks.procedures_mutatorarg.validator = function(newVar) {
  // Merge runs of whitespace.  Strip leading and trailing whitespace.
  // Beyond this, all names are legal.
  newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
  return newVar || null;
};

Blockly.Blocks.procedures_callnoreturn = {
  // Call a procedure with no return value.
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);

    var mainTitle = this.appendDummyInput()
      .appendTitle(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL)
      .appendTitle('', 'NAME');

    if (Blockly.useModalFunctionEditor) {
      var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
      Blockly.bindEvent_(editLabel.fieldGroup_, 'mousedown', this, this.openEditor);
      mainTitle.appendTitle(editLabel);
    }

    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP);
    this.currentParameterNames_ = [];
    this.parameterIDsToArgumentConnections = null;
    this.currentParameterIDs = null;
  },
  openEditor: function (e) {
    e.stopPropagation();
    Blockly.functionEditor.openEditorForCallBlock_(this);
  },
  getCallName: function() {
    return this.getTitleValue('NAME');
  },
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('NAME'))) {
      this.setTitleValue(newName, 'NAME');
      this.setTooltip(
          (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
           : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
          .replace('%1', newName));
    }
  },
  setProcedureParameters: function(paramNames, paramIds) {
    // Data structures for parameters on each call block:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // paramNames = ['x', 'y', 'z']
    //     New param names.
    // paramIds = ['piua', 'f8b_', 'oi.o']
    //     IDs of params (consistent for each parameter through the life of a
    //     mutator, regardless of param renaming).
    // this.parameterIDsToArgumentConnections {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.currentParameterIDs = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      this.parameterIDsToArgumentConnections = {};
      this.currentParameterIDs = null;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw 'Error: paramNames and paramIds must be the same length.';
    }
    if (!this.currentParameterIDs) {
      // Initialize tracking for this block.
      this.parameterIDsToArgumentConnections = {};
      if (paramNames.join('\n') == this.currentParameterNames_.join('\n')) {
        // No change to the parameters, allow quarkConnections_ to be
        // populated with the existing connections.
        this.currentParameterIDs = paramIds;
      } else {
        this.currentParameterIDs = [];
      }
    }
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (var x = this.currentParameterNames_.length - 1; x >= 0; x--) {
      var input = this.getInput('ARG' + x);
      if (input) {
        var connection = input.connection.targetConnection;
        this.parameterIDsToArgumentConnections[this.currentParameterIDs[x]] = connection;
        // Disconnect all argument blocks and remove all inputs.
        this.removeInput('ARG' + x);
      }
    }
    // Rebuild the block's arguments.
    this.currentParameterNames_ = [].concat(paramNames);
    this.currentParameterIDs = paramIds;
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      var input = this.appendValueInput('ARG' + x)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(this.currentParameterNames_[x]);
      if (this.currentParameterIDs) {
        // Reconnect any child blocks.
        var parameterID = this.currentParameterIDs[x];
        if (parameterID in this.parameterIDsToArgumentConnections) {
          var connection = this.parameterIDsToArgumentConnections[parameterID];
          if (!connection || connection.targetConnection ||
              connection.sourceBlock_.blockSpace != this.blockSpace) {
            // Block no longer exists or has been attached elsewhere.
            delete this.parameterIDsToArgumentConnections[parameterID];
          } else {
            input.connection.connect(connection);
          }
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  mutationToDom: function() {
    // Save the name and arguments (none of which are editable).
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getTitleValue('NAME'));
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.currentParameterNames_[x]);
      container.appendChild(parameter);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the name and parameters.
    var name = xmlElement.getAttribute('name');
    this.setTitleValue(name, 'NAME');
    this.setTooltip(
        (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
         : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace('%1', name));
    var definitionBlock = Blockly.Procedures.getDefinition(name, this.blockSpace);
    if (definitionBlock && definitionBlock.mutator && definitionBlock.mutator.isVisible()) {
      // Initialize caller with the mutator's IDs.
      var procedureInfo = definitionBlock.getProcedureInfo();
      this.setProcedureParameters(procedureInfo.parameterNames, procedureInfo.parameterIDs);
    } else {
      this.currentParameterNames_ = [];
      for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
        if (childNode.nodeName.toLowerCase() == 'arg') {
          this.currentParameterNames_.push(childNode.getAttribute('name'));
        }
      }
      // Use parameter names as dummy IDs during initialization
      this.setProcedureParameters(this.currentParameterNames_, this.currentParameterNames_);
    }
  },
  renameVar: function(oldName, newName) {
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      if (Blockly.Names.equals(oldName, this.currentParameterNames_[x])) {
        this.currentParameterNames_[x] = newName;
        this.getInput('ARG' + x).titleRow[0].setText(newName);
      }
    }
  },
  customContextMenu: function(options) {
    // Add option to find caller.
    var option = {enabled: true};
    option.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
    var name = this.getTitleValue('NAME');
    var blockSpace = this.blockSpace;
    option.callback = function() {
      var def = Blockly.Procedures.getDefinition(name, blockSpace);
      def && def.select();
    };
    options.push(option);
  }
};

Blockly.Blocks.procedures_callreturn = {
  // Call a procedure with a return value.
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);
    var mainTitle = this.appendDummyInput()
        .appendTitle(Blockly.Msg.PROCEDURES_CALLRETURN_CALL)
        .appendTitle('', 'NAME');
    if (Blockly.functionEditor) {
      var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
      Blockly.bindEvent_(editLabel.fieldGroup_, 'mousedown', this, this.openEditor);
      mainTitle.appendTitle(editLabel);
    }
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP);
    this.currentParameterNames_ = [];
    this.parameterIDsToArgumentConnections = null;
    this.currentParameterIDs = null;
  },
  openEditor: Blockly.Blocks.procedures_callnoreturn.openEditor,
  getCallName: Blockly.Blocks.procedures_callnoreturn.getCallName,
  renameProcedure: Blockly.Blocks.procedures_callnoreturn.renameProcedure,
  setProcedureParameters:
      Blockly.Blocks.procedures_callnoreturn.setProcedureParameters,
  mutationToDom: Blockly.Blocks.procedures_callnoreturn.mutationToDom,
  domToMutation: Blockly.Blocks.procedures_callnoreturn.domToMutation,
  renameVar: Blockly.Blocks.procedures_callnoreturn.renameVar,
  customContextMenu: Blockly.Blocks.procedures_callnoreturn.customContextMenu
};

Blockly.Blocks.procedures_ifreturn = {
  // Conditionally return value from a procedure.
  init: function() {
    this.setHelpUrl('http://c2.com/cgi/wiki?GuardClause');
    this.setHSV(94, 0.84, 0.60);
    this.appendValueInput('CONDITION')
        .setCheck(Blockly.BlockValueType.BOOLEAN)
        .appendTitle(Blockly.Msg.CONTROLS_IF_MSG_IF);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
    this.hasReturnValue_ = true;
  },
  mutationToDom: function() {
    // Save whether this block has a return value.
    var container = document.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore whether this block has a return value.
    var value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value == 1);
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE')
        .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    }
  },
  onchange: function() {
    if (!this.blockSpace) {
      // Block has been deleted.
      return;
    }
    var legal = false;
    // Is the block nested in a procedure?
    var block = this;
    do {
      if (block.type == 'procedures_defnoreturn' ||
          block.type == 'procedures_defreturn') {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE')
          .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = false;
      } else if (block.type == 'procedures_defreturn' &&
                 !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE')
          .appendTitle(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
    } else {
      this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING);
    }
  }
};
