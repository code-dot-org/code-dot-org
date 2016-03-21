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

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Variables');

/**
 * Class for a variable's dropdown field.
 * @param {!string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {?Function} opt_changeHandler A function that is executed when a new
 *     option is selected.
 * @param {?Function} opt_createHandler A function that is executed after creation
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varname, opt_changeHandler, opt_createHandler) {
  var changeHandler;
  if (opt_changeHandler === Blockly.FieldParameter.dropdownChange) {
    changeHandler = opt_changeHandler;
  } else if (opt_changeHandler) {
    // Wrap the user's change handler together with the variable rename handler.
    var thisObj = this;
    changeHandler = function(value) {
      var retVal = thisObj.dropdownChange(value);
      var newVal;
      if (retVal === undefined) {
        newVal = value;  // Existing variable selected.
      } else if (retVal === null) {
        newVal = thisObj.getValue();  // Abort, no change.
      } else {
        newVal = retVal;  // Variable name entered.
      }
      opt_changeHandler.call(thisObj, newVal);
      return retVal;
    };
  } else {
    changeHandler = this.dropdownChange;
  }

  Blockly.FieldVariable.superClass_.constructor.call(this,
      opt_createHandler || Blockly.FieldVariable.dropdownCreate, changeHandler);

  if (varname) {
    this.setValue(varname);
  } else {
    this.setValue(Blockly.Variables.generateUniqueName());
  }
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);


/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldVariable.prototype.setValue = function(text) {
  this.value_ = text;
  this.setText(text);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  var variableList = Blockly.Variables.allVariables();
  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && variableList.indexOf(name) == -1) {
    variableList.push(name);
  }
  variableList.sort(goog.string.caseInsensitiveCompare);
  variableList.push(Blockly.Msg.RENAME_VARIABLE);
  variableList.push(Blockly.Msg.NEW_VARIABLE);
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
    options[x] = [variableList[x], variableList[x]];
  }
  return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing variable was chosen.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.prototype.dropdownChange = function(text) {
  if (text === Blockly.Msg.RENAME_VARIABLE) {
    var oldVar = this.getText();
    this.getParentEditor_().hideChaff();
    Blockly.FieldVariable.modalPromptName(
        Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', oldVar),
        Blockly.Msg.CONFIRM_RENAME_VARIABLE,
        oldVar,
        function(newVar) {
          Blockly.Variables.renameVariable(oldVar, newVar, this.sourceBlock_.blockSpace);
        }.bind(this));
    return null;
  } else if (text === Blockly.Msg.NEW_VARIABLE) {
    this.getParentEditor_().hideChaff();
    Blockly.FieldVariable.modalPromptName(
        Blockly.Msg.NEW_VARIABLE_TITLE,
        Blockly.Msg.CONFIRM_CREATE_VARIABLE,
        '',
        function(newVar) {
          this.setText(newVar);
          // Since variables are case-insensitive, ensure that if the new variable
          // matches with an existing variable, the new case prevails throughout.
          Blockly.Variables.renameVariable(newVar, newVar, this.sourceBlock_.blockSpace);
        }.bind(this));
    return null;
  }
  return undefined;
};

/**
 * Prompt the user for a variable name and perform some whitespace cleanup
 * @param {string} promptText description text for window prompt
 * @param {string} confirmButtonLabel Label of confirm button, e.g. "Rename"
 * @param {string} defaultText default input text for window prompt
 * @param {Function} callback with parameter (text) of new name
 */
Blockly.FieldVariable.modalPromptName =
    function(promptText, confirmButtonLabel, defaultText, callback) {
  Blockly.showSimpleDialog({
    bodyText: promptText,
    prompt: true,
    promptPrefill: defaultText,
    cancelText: confirmButtonLabel,
    confirmText: Blockly.Msg.CANCEL,
    onConfirm: null,
    onCancel: callback
  });
}

Blockly.FieldVariable.removeExtraWhitespace = function(inputString) {
  var multipleWhitespaceCharactersRegex = /[\s\xa0]+/g;
  var leadingTrailingWhitespaceRegex = /^ | $/g;
  return inputString
    .replace(multipleWhitespaceCharactersRegex, ' ')
    .replace(leadingTrailingWhitespaceRegex, '');
};
