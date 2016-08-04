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

goog.provide('Blockly.Blocks.functionalProcedures');

goog.require('Blockly.Blocks');

/**
 * Definition block for a custom functional block
 */
Blockly.Blocks.functional_definition = {
  shouldHideIfInMainBlockSpace: function () {
    return true;
  },
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);
    this.setFunctional(true, {
      headerHeight: 0,
      rowBuffer: 3
    });
    this.setFunctionalOutput(false);
    var name = Blockly.Procedures.findLegalName(Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.DEFINE_FUNCTION_DEFINE)
        .appendTitle(new Blockly.FieldTextInput(name, Blockly.Procedures.rename), 'NAME')
        .appendTitle('', 'PARAMS');
    this.appendFunctionalInput('STACK');
    this.setFunctional(true);
    this.setTooltip(Blockly.Msg.FUNCTIONAL_PROCEDURE_DEFINE_TOOLTIP);
    /**
     * Whether this block should be treated like a functional "variable"
     * i.e., no domain, listed in variables category of functional app flyouts
     * @type {boolean}
     * @private
     */
    this.isFunctionalVariable_ = false;
    this.parameterNames_ = [];
    this.paramIds_ = [];
    this.parameterTypes_ = [];
  },
  /**
   * Updates the function definition's input type
   * @param {Blockly.BlockValueType} newType
   */
  updateInputsToType: function (newType) {
    this.updateInputType_(this.getInput('STACK'), newType);
    this.render();
  },
  /**
   * Updates given input to match a given functional value type
   * @param {Blockly.Input} input
   * @param {Blockly.BlockValueType} newType
   */
  updateInputType_: function (input, newType) {
    input.setHSV.apply(input, Blockly.FunctionalTypeColors[newType]);
    input.setCheck(newType);
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    // Add argument mutations
    for (var x = 0; x < this.parameterNames_.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.parameterNames_[x]);
      if (this.parameterTypes_[x]) {
        parameter.setAttribute('type', this.parameterTypes_[x]);
      }
      container.appendChild(parameter);
    }
    // Add description mutation
    if (this.description_) {
      var desc = document.createElement('description');
      desc.innerHTML = this.description_;
      container.appendChild(desc);
    }
    if (this.outputType_) {
      var outputTypeMutation = document.createElement('outputType');
      outputTypeMutation.innerHTML = this.outputType_;
      container.appendChild(outputTypeMutation);
    }
    if (this.isFunctionalVariable_) {
      var functionalVariableMutation = document.createElement('isfunctionalvariable');
      functionalVariableMutation.innerHTML = 'true';
      container.appendChild(functionalVariableMutation);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.parameterNames_ = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      var nodeName = childNode.nodeName.toLowerCase();
      if (nodeName === 'arg') {
        this.parameterNames_.push(childNode.getAttribute('name'));
        this.parameterTypes_.push(childNode.getAttribute('type'));
      } else if (nodeName === 'description') {
        this.description_ = childNode.textContent;
      } else if (nodeName === 'outputtype') {
        this.updateOutputType(childNode.textContent);
      } else if (nodeName === 'isfunctionalvariable') {
        this.isFunctionalVariable_ = true;
      }
    }
    this.updateParams_();
  },
  isVariable: function() {
    return this.isFunctionalVariable_;
  },
  convertToVariable: function() {
    this.isFunctionalVariable_ = true;
  },
  /**
   * Updates parameters (renaming, deleting, adding as appropriate)
   * on this procedure and its callers.
   * @param {Array.<String>} paramNames ordered names of parameters for this procedure
   * @param {Array.<String>} paramIDs unique IDs for each parameter, used to update existing
   *     references to parameters across renames
   * @param {Array.<String>} paramTypes ordered types of parameters for this procedure
   */
  updateParamsFromArrays: function(paramNames, paramIDs, paramTypes) {
    this.parameterNames_ = goog.array.clone(paramNames);
    this.paramIds_ = paramIDs ? goog.array.clone(paramIDs) : null;
    this.parameterTypes_ = goog.array.clone(paramTypes);
    this.updateParams_();
    this.updateCallerParams_();
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
  updateCallerParams_: function() {
    Blockly.Procedures.mutateCallers(this.getTitleValue('NAME'),
      this.blockSpace,
      this.parameterNames_,
      this.paramIds_,
      this.parameterTypes_
    );
  },
  getOutputType: function() {
    return this.outputType_;
  },
  updateOutputType: function(outputType) {
    this.outputType_ = outputType;
    this.setHSV.apply(this, Blockly.FunctionalTypeColors[outputType]);
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
      type: this.type,
      callType: this.callType_,
      parameterNames: this.parameterNames_,
      parameterTypes: this.parameterTypes_,
      isFunctionalVariable: this.isFunctionalVariable_
    }
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
          if (block.type == 'functional_procedures_mutatorarg' &&
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
  changeParamType: function (name, newType) {
    var changed = false;
    for (var x = 0; x < this.parameterNames_.length; x++) {
      if (Blockly.Names.equals(name, this.parameterNames_[x])) {
        this.parameterTypes_[x] = newType;
        changed = true;
      }
    }
    if (changed) {
      this.updateParams_();
      this.updateCallerParams_();
    }
  },
  shouldBeGrayedOut: function () {
    return false;
  },
  callType_: 'functional_call'
};

/**
 * Caller block for a custom functional block
 */
Blockly.Blocks.functional_call = {
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    // TODO(bjordan): localize / use user-defined description
    this.setTooltip("Calls a user-defined function");

    this.setHSV(94, 0.84, 0.60);

    var options = {
      fixedSize: { height: 35 }
    };

    var mainTitle = this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('Function Call', options), 'NAME')
        .appendTitle('', 'PARAM_TEXT');

    if (Blockly.useContractEditor && this.blockSpace !== Blockly.modalBlockSpace) {
      var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
      Blockly.bindEvent_(editLabel.fieldGroup_, 'mousedown', this, this.openEditor);
      mainTitle.appendTitle(editLabel);
      this.editLabel_ = editLabel;
    }

    this.setFunctional(true);

    /**
     * Used to detect changes in and update parameter names & argument connections
     * @type {Array}
     * @private
     */
    this.currentParameterNames_ = [];
    this.parameterIDsToArgumentConnections_ = {};
    this.currentParameterIDs_ = [];
    this.currentParameterTypes_ = [];

    /**
     * Used to sync with changes in parent function definition
     */
    /** @type {string} @private */
    this.currentOutputType_ = null;
    /** @type {string} @private */
    this.currentDescription_ = null;

    this.blockSpace.events.listen(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE,
      this.updateAttributesFromDefinition_, false, this);

    this.changeFunctionalOutput(Blockly.BlockValueType.NONE);
  },
  updateAttributesFromDefinition_: function() {
    var procedureDefinition = Blockly.Procedures.getDefinition(
      this.getTitleValue('NAME'), this.blockSpace.blockSpaceEditor.blockSpace);
    if (!procedureDefinition) {
      // will be updated on later blockSpace change (once definition de-serialized)
      return;
    }

    var outputTypeChanged = procedureDefinition.outputType_ && procedureDefinition.outputType_ !== this.currentOutputType_;
    if (outputTypeChanged) {
      this.currentOutputType_ = procedureDefinition.outputType_;
      this.changeFunctionalOutput(procedureDefinition.outputType_);
    }
    var descriptionChanged = procedureDefinition.description_ && procedureDefinition.description_ !== this.currentDescription_;
    if (descriptionChanged) {
      this.currentDescription_ = procedureDefinition.description_;
      this.setTooltip(procedureDefinition.description_);
    }
  },
  beforeDispose: function() {
    this.blockSpace.events.unlisten(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE,
      this.updateAttributesFromDefinition_, false, this);
  },
  openEditor: function (e) {
    e.stopPropagation();
    Blockly.functionEditor.openEditorForCallBlock_(this);
  },
  getCallName: function() {
    return this.getTitleValue('NAME');
  },
  getParamTypes: function () {
    return this.currentParameterTypes_;
  },
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('NAME'))) {
      this.setTitleValue(newName, 'NAME');
    }
  },
  setProcedureParameters: function(paramNames, paramIds, opt_paramTypes) {
    if (!paramIds) {
      // Get in to a state where parameter ID tracking can be reset next call
      this.parameterIDsToArgumentConnections_ = {};
      this.currentParameterIDs_ = null;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw 'Error: paramNames and paramIds must be the same length.';
    }
    if (!this.currentParameterIDs_) {
      // Initialize tracking for this block.
      this.parameterIDsToArgumentConnections_ = {};
      if (paramNames.join('\n') === this.currentParameterNames_.join('\n')) {
        // No change to the parameters, allow quarkConnections_ to be
        // populated with the existing connections.
        this.currentParameterIDs_ = paramIds;
      } else {
        this.currentParameterIDs_ = [];
      }
    }
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the parameterIDsToArgumentConnections with existing connections.
    for (var x = this.currentParameterNames_.length - 1; x >= 0; x--) {
      var input = this.getInput('ARG' + x);
      if (input) {
        var connection = input.connection.targetConnection;
        this.parameterIDsToArgumentConnections_[this.currentParameterIDs_[x]] = connection;
        // Disconnect all argument blocks and remove all inputs.
        this.removeInput('ARG' + x);
      }
    }
    // Rebuild the block's arguments.
    this.currentParameterNames_ = goog.array.clone(paramNames);
    this.currentParameterIDs_ = goog.array.clone(paramIds);
    this.currentParameterTypes_ = goog.array.clone(opt_paramTypes);
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      var input = this.appendFunctionalInput('ARG' + x)
        .setAlign(Blockly.ALIGN_CENTRE)
        .setInline(x > 0);
      var currentParameterType = this.currentParameterTypes_[x];
      input.setHSV.apply(input, Blockly.FunctionalTypeColors[currentParameterType]);
      input.setCheck(currentParameterType);
      if (this.currentParameterIDs_) {
        // Reconnect any child blocks.
        var paramID = this.currentParameterIDs_[x];
        if (paramID in this.parameterIDsToArgumentConnections_) {
          var connection = this.parameterIDsToArgumentConnections_[paramID];
          if (!connection || connection.targetConnection ||
            connection.sourceBlock_.blockSpace != this.blockSpace) {
            // Block no longer exists or has been attached elsewhere.
            delete this.parameterIDsToArgumentConnections_[paramID];
          } else {
            input.connection.connect(connection);
          }
        }
      }
    }
    this.refreshParameterTitleString_();
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  refreshParameterTitleString_: function() {
    var parameterListString = this.currentParameterNames_.length > 0 ?
    ' (' + this.currentParameterNames_.join(', ') + ')' : '';
    this.setTitleValue(parameterListString, 'PARAM_TEXT');
  },
  mutationToDom: function() {
    // Save the name and arguments (none of which are editable).
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getTitleValue('NAME'));
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.currentParameterNames_[x]);
      parameter.setAttribute('type', this.currentParameterTypes_[x]);
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

    this.currentParameterNames_ = [];
    this.currentParameterIDs_ = [];
    this.currentParameterTypes_ = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.currentParameterNames_.push(childNode.getAttribute('name'));
        this.currentParameterTypes_.push(childNode.getAttribute('type'));
        this.currentParameterIDs_.push(Blockly.getUID());
      }
    }
    this.setProcedureParameters(
      this.currentParameterNames_,
      this.currentParameterIDs_,
      this.currentParameterTypes_);
    this.updateAttributesFromDefinition_();
  },
  renameVar: function(oldName, newName) {
    for (var x = 0; x < this.currentParameterNames_.length; x++) {
      if (Blockly.Names.equals(oldName, this.currentParameterNames_[x])) {
        this.currentParameterNames_[x] = newName;
        this.refreshParameterTitleString_();
      }
    }
  }
};

/**
 * Block to allow you to pass a functional block
 */
Blockly.Blocks.functional_pass = {
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    // TODO(bjordan): localize / use user-defined description
    this.setTooltip("Pass a user-defined function");

    this.setHSV(94, 0.84, 0.60);

    var options = {
      fixedSize: { height: 35 }
    };

    var mainTitle = this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('Pass Function', options), 'NAME')
        .appendTitle('', 'PARAM_TEXT');

    if (Blockly.useContractEditor && this.blockSpace !== Blockly.modalBlockSpace) {
      var editLabel = new Blockly.FieldIcon(Blockly.Msg.FUNCTION_EDIT);
      Blockly.bindEvent_(editLabel.fieldGroup_, 'mousedown', this, this.openEditor);
      mainTitle.appendTitle(editLabel);
      this.editLabel_ = editLabel;
    }

    this.setFunctional(true);
    // functional_pass blocks are immovable, unless we're level editing
    this.setMovable(!!Blockly.editBlocks);
    this.setColorFromName_();
    this.blockSpace.events.listen(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE,
      this.setColorFromName_, false, this);

    this.changeFunctionalOutput(Blockly.BlockValueType.FUNCTION);
  },
  openEditor: function(e) {
    e.stopPropagation();
    Blockly.functionEditor.openEditorForCallBlock_(this);
  },
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('NAME'))) {
      this.setTitleValue(newName, 'NAME');
      this.setColorFromName_();
    }
  },

  setColorFromName_: function () {
    var name = this.getTitleValue('NAME');
    if (!name) {
      return;
    }
    var functionBlock = Blockly.mainBlockSpace.findFunction(name);
    if (!functionBlock) {
      return;
    }
    var type = functionBlock.getOutputType();
    this.setHSV.apply(this, Blockly.FunctionalTypeColors[type]);
  },

  mutationToDom: function() {
    // Save the name
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getTitleValue('NAME'));
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the name
    var name = xmlElement.getAttribute('name');
    this.setTitleValue(name, 'NAME');
    this.setTooltip(
      (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
        : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace('%1', name));
    this.setColorFromName_();
  }
};

Blockly.Blocks.procedural_to_functional_call = Blockly.Blocks.procedures_callreturn;
