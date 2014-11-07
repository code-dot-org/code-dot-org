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
 * @fileoverview Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.functionalParameters');

goog.require('Blockly.Blocks');

Blockly.Blocks.functional_parameters_get = {
  // Variable getter.
  init: function() {
    var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
    // Must be marked EDITABLE so that cloned blocks share the same var name
    fieldLabel.EDITABLE = true;
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setHSV(312, 0.32, 0.62);
    this.setFunctional(true, {
      headerHeight: 30
    });
    var options = {
      fixedSize: { height: 35 }
    };
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(Blockly.disableVariableEditing ? new Blockly.FieldLabel(fieldLabel, options)
            : new Blockly.FieldParameter(Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL)
        .setAlign(Blockly.ALIGN_CENTRE);
    this.setFunctionalOutput(true); // TODO(bjordan): set/update type
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  },
  renameVar: function(oldName, newName) {
    if (!Blockly.functionEditor) {
      // Params should only be used in the FunctionEditor but better to be safe
      return;
    }
    Blockly.functionEditor.renameParameter(oldName, newName);
    Blockly.functionEditor.refreshParamsEverywhere();
  },
  removeVar: Blockly.Blocks.variables_get.removeVar,
  mutationToDom: function() {
    return; // TODO(bjordan): implement
    var container = document.createElement('mutation');
    // Add description mutation
    if (this.description_) {
      var desc = document.createElement('description');
      desc.innerHTML = this.description_;
      container.appendChild(desc);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    return; // TODO(bjordan): implement
    this.arguments_ = [];
    for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
      var nodeName = childNode.nodeName.toLowerCase();
      if (nodeName === 'arg') {
        this.arguments_.push(childNode.getAttribute('name'));
      } else if (nodeName === 'description') {
        this.description_ = childNode.innerHTML;
      }
    }
  }
};
