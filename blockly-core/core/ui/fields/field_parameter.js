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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldParameter');

goog.require('Blockly.FieldVariable');

/**
 * Class for a variable's parameter dropdown field.
 * @param {!string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {?Function} opt_changeHandler A function that is executed when a new
 *     option is selected.
 * @param {?Function} opt_createHandler A function that is executed after creation
 * @extends {Blockly.FieldDropdown}
 * * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldParameter = function(varname, opt_changeHandler, opt_createHandler) {
  Blockly.FieldParameter.superClass_.constructor.call(this, varname,
    Blockly.FieldParameter.dropdownChange, Blockly.FieldParameter.dropdownCreate);
};
goog.inherits(Blockly.FieldParameter, Blockly.FieldVariable);

/**
 * Return a sorted list of parameter names for parameter dropdown menus.
 * Include a special option at the end for deleting a parameter.
 * @return {!Array.<string>} Array of parameter names.
 * @this {!Blockly.FieldParameter}
 */
Blockly.FieldParameter.dropdownCreate = function() {
  var variableList = [
    Blockly.Msg.RENAME_PARAMETER,
    Blockly.Msg.DELETE_PARAMETER
  ];
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
    options[x] = [variableList[x], variableList[x]];
  }
  return options;
};

Blockly.FieldParameter.dropdownChange = function(text) {
  var oldVar = this.getText();
  if (text === Blockly.Msg.RENAME_PARAMETER) {
    this.getParentEditor_().hideChaff();
    Blockly.FieldVariable.modalPromptName(
        Blockly.Msg.RENAME_PARAMETER_TITLE.replace('%1', oldVar),
        Blockly.Msg.CONFIRM_RENAME_VARIABLE,
        oldVar,
        function(newVar) {
          Blockly.Variables.renameVariable(oldVar, newVar, this.sourceBlock_.blockSpace);
        }.bind(this));
  } else if (text === Blockly.Msg.DELETE_PARAMETER) {
    Blockly.showSimpleDialog({
      bodyText: Blockly.Msg.DELETE_PARAMETER_TITLE.replace('%1', oldVar),
      cancelText: Blockly.Msg.DELETE,
      confirmText: Blockly.Msg.KEEP,
      onConfirm: null,
      onCancel: function() {
        Blockly.Variables.deleteVariable(oldVar, this.sourceBlock_.blockSpace);
      }.bind(this),
      cancelButtonClass: 'red-delete-button'
    });
  }
  return null;
};
