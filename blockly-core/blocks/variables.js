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

goog.provide('Blockly.Blocks.variables');

goog.require('Blockly.Blocks');


Blockly.Blocks.variables_get = {
  // Variable getter.
  init: function() {
    var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
    // Must be marked EDITABLE so that cloned blocks share the same var name
    fieldLabel.EDITABLE = true;
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setHSV(312, 0.32, 0.62);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(Blockly.disableVariableEditing ? fieldLabel
            : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  },
  getVars: function() {
    return [this.getTitleValue('VAR')];
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.setTitleValue(newName, 'VAR');
    }
  },
  removeVar: function(oldName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.dispose(true, true);
    }
  },
  contextMenuType_: 'variables_set',
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getTitleValue('VAR');
    option.text = Blockly.Msg.VARIABLES_GET_CREATE_SET.replace('%1', name);
    var xmlTitle = goog.dom.createDom('title', null, name);
    xmlTitle.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlTitle);
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};

Blockly.Blocks.variables_set = {
  // Variable setter.
  init: function() {
    var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_SET_ITEM);
    // Must be marked EDITABLE so that cloned blocks share the same var name
    fieldLabel.EDITABLE = true;
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setHSV(312, 0.32, 0.62);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.Msg.VARIABLES_SET_TITLE)
        .appendTitle(Blockly.disableVariableEditing ? fieldLabel
          : new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM), 'VAR')
        .appendTitle(Blockly.Msg.VARIABLES_SET_TAIL);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
  },
  getVars: function() {
    return [this.getTitleValue('VAR')];
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.setTitleValue(newName, 'VAR');
    }
  },
  contextMenuMsg_: Blockly.Msg.VARIABLES_SET_CREATE_GET,
  contextMenuType_: 'variables_get',
  customContextMenu: Blockly.Blocks.variables_get.customContextMenu
};

Blockly.Blocks.parameters_get = {
  // Variable getter.
  init: function() {
    var fieldLabel = new Blockly.FieldLabel(Blockly.Msg.VARIABLES_GET_ITEM);
    // Must be marked EDITABLE so that cloned blocks share the same var name
    fieldLabel.EDITABLE = true;
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setHSV(7, 0.80, 0.95);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(Blockly.disableVariableEditing ? fieldLabel
            : new Blockly.FieldParameter(Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        .appendTitle(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  },
  renameVar: function(oldName, newName) {
    // Params should only be used in the FunctionEditor but better to be safe
    if (Blockly.functionEditor && Blockly.functionEditor.isOpen()) {
      Blockly.functionEditor.renameParameter(oldName, newName);
      Blockly.functionEditor.refreshParamsEverywhere();
    }
  },
  removeVar: Blockly.Blocks.variables_get.removeVar
};
