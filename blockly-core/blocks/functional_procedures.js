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
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setHSV(94, 0.84, 0.60);
    this.setFunctional(true, {
      headerHeight: 0,
      rowBuffer: 3
    });
    this.setFunctionalOutput(true, 'Number');
    var name = Blockly.Procedures.findLegalName(Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
    this.appendDummyInput()
        .appendTitle('Define' /**TODO(bjordan): i18n*/)
        .appendTitle(new Blockly.FieldTextInput('My New Function', Blockly.Procedures.rename), 'NAME')
        .appendTitle('', 'PARAMS');
    this.appendFunctionalInput('STACK');
    this.setFunctional(true);
    this.setTooltip('Define a functional method' /**TODO(bjordan): i18n*/);
    /**
     * TODO(bjordan): make these name/type pairs or data-objects
     * @type {Array<String>}
     * @private
     */
    this.parameterNames = [];
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    // Add argument mutations
    for (var x = 0; x < this.parameterNames.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.parameterNames[x]);
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
    }return
    return container;
  },
  domToMutation: function(xmlElement) {
    this.parameterNames = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      var nodeName = childNode.nodeName.toLowerCase();
      if (nodeName === 'arg') {
        this.parameterNames.push(childNode.getAttribute('name'));
      } else if (nodeName === 'description') {
        this.description_ = childNode.innerHTML;
      } else if (nodeName === 'outputtype') {
        this.updateOutputType(childNode.innerHTML);
      }
    }
    this.updateParams_();
  },
  /**
   * Updates parameters (renaming, deleting, adding as appropriate)
   * on this procedure and its callers.
   * @param {Array.<String>} paramNames ordered names of parameters for this procedure
   * @param {Array.<String>} paramIDs unique IDs for each parameter, used to update existing
   *     references to parameters across renames
   */
  updateParamsFromArrays: function(paramNames, paramIDs) {
    this.parameterNames = goog.array.clone(paramNames);
    this.paramIds_ = goog.array.clone(paramIDs);
    this.updateParams_();
    this.updateCallerParams_();
  },
  updateParams_: function() {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var x = 0; x < this.parameterNames.length; x++) {
      if (hash['arg_' + this.parameterNames[x].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.parameterNames[x].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    var paramString = '';
    if (this.parameterNames.length) {
      paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
        ' ' + this.parameterNames.join(', ');
    }
    this.setTitleValue(paramString, 'PARAMS');
  },
  updateCallerParams_: function() {
    Blockly.Procedures.mutateCallers(this.getTitleValue('NAME'),
        this.blockSpace, this.parameterNames, this.paramIds_);
  },
  updateOutputType: function(outputType) {
    this.outputType_ = outputType;
    this.changeFunctionalOutput(this.outputType_);
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
  getProcedureDef: function() {
    return [this.getTitleValue('NAME'), this.parameterNames, false];
  },
  getVars: function() {
    return this.parameterNames;
  },
  renameVar: function(oldName, newName) {
    var change = false;
    for (var x = 0; x < this.parameterNames.length; x++) {
      if (Blockly.Names.equals(oldName, this.parameterNames[x])) {
        this.parameterNames[x] = newName;
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
    var index = this.parameterNames.indexOf(oldName);
    if (index > -1) {
      this.currentParameterNames.splice(index, 1);
      this.updateParams_();
    }
  },
  callType_: 'functional_call' /**TODO(bjordan): this becomes a funcitonal block type */
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
        // .setAlign(Blockly.ALIGN_CENTRE); TODO(bjordan): re-add

    if (Blockly.functionEditor) {
      var editLabel = new Blockly.FieldLabel(Blockly.Msg.FUNCTION_EDIT);
      Blockly.bindEvent_(editLabel.textElement_, 'mousedown', this, this.openEditor);
      mainTitle.appendTitle(editLabel);
    }

    this.setFunctional(true);
    this.setFunctionalOutput(true); // TODO(bjordan): set based on dropdown type change

    /**
     * Argument names for this function call
     * @type {Array}
     * @private
     */
    this.currentParameterNames = [];

    this.parameterIDsToArgumentConnections = null;
    this.currentParameterIDs = null;

    /**
     * Used to detect changes in parent function definition
     * (in lieu of an MVVM framework)
     * @private
     */
    /** @type {string} @private */
    this.currentOutputType_ = null;
    /** @type {Array.<string>} @private */
    this.currentArguments_ = null;
    /** @type {string} @private */
    this.currentDescription_ = null;

    this.blockSpace.events.listen(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE,
      this.updateAttributesFromDefinition_, false, this);
  },
  updateAttributesFromDefinition_: function() {
    var procedureDefinition = Blockly.Procedures.getDefinition(
      this.getTitleValue('NAME'), this.blockSpace.blockSpaceEditor.blockSpace);
    if (!procedureDefinition) {
      throw "No procedure definition when initializing functional call";
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
    var argumentsChanged = procedureDefinition.arguments_.length &&
      (!procedureDefinition.arguments_ || !goog.array.equals(procedureDefinition.arguments_, this.currentArguments_));
    if (argumentsChanged) {
      this.currentArguments_ = procedureDefinition.arguments_;
      this.setTitleValue(' (' + this.currentParameterNames.join(', ') + ')', 'PARAM_TEXT');
    }
  },
  beforeDispose: function() {
    this.blockSpace.events.unlisten(Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE,
      this.updateAttributesFromDefinition_, false, this);
  },
  openEditor: function() {
    Blockly.functionEditor.openAndEditFunction(this.getTitleValue('NAME'));
  },
  getProcedureCall: function() {
    return this.getTitleValue('NAME');
  },
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('NAME'))) {
      this.setTitleValue(newName, 'NAME');
      this.setTooltip(
        /** TODO(bjordan): use user-defined description? */
        (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP
          : Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
          .replace('%1', newName));
    }
  },
  setProcedureParameters: function(paramNames, paramIds) {
    // TODO(bjordan): remove or clarify
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
      if (paramNames.join('\n') == this.currentParameterNames.join('\n')) {
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
    for (var x = this.currentParameterNames.length - 1; x >= 0; x--) {
      var input = this.getInput('ARG' + x);
      if (input) {
        var connection = input.connection.targetConnection;
        this.parameterIDsToArgumentConnections[this.currentParameterIDs[x]] = connection;
        // Disconnect all argument blocks and remove all inputs.
        this.removeInput('ARG' + x);
      }
    }
    // Rebuild the block's arguments.
    this.currentParameterNames = [].concat(paramNames);
    this.currentParameterIDs = paramIds;
    for (var x = 0; x < this.currentParameterNames.length; x++) {
      var input = this.appendFunctionalInput('ARG' + x)
        .setAlign(Blockly.ALIGN_CENTRE)
        .setInline(x > 0);
      if (this.currentParameterIDs) {
        // Reconnect any child blocks.
        var quarkName = this.currentParameterIDs[x];
        if (quarkName in this.parameterIDsToArgumentConnections) {
          var connection = this.parameterIDsToArgumentConnections[quarkName];
          if (!connection || connection.targetConnection ||
            connection.sourceBlock_.blockSpace != this.blockSpace) {
            // Block no longer exists or has been attached elsewhere.
            delete this.parameterIDsToArgumentConnections[quarkName];
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
    for (var x = 0; x < this.currentParameterNames.length; x++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.currentParameterNames[x]);
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

    this.currentParameterNames = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.currentParameterNames.push(childNode.getAttribute('name'));
      }
    }
    this.setProcedureParameters(this.currentParameterNames, this.currentParameterNames);
    this.updateAttributesFromDefinition_();
  },
  renameVar: function(oldName, newName) {
    for (var x = 0; x < this.currentParameterNames.length; x++) {
      if (Blockly.Names.equals(oldName, this.currentParameterNames[x])) {
        this.currentParameterNames[x] = newName;
        this.getInput('ARG' + x).titleRow[0].setText(newName);
      }
    }
  }
};
