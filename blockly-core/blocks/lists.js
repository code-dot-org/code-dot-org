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
 * @fileoverview List blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.lists');

goog.require('Blockly.Blocks');


Blockly.Blocks.lists_create_empty = {
  // Create an empty list.
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.setOutput(true, Blockly.BlockValueType.ARRAY);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
    this.setTooltip(Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP);
  }
};

Blockly.Blocks.lists_create_with = {
  // Create a list with any number of elements of any type.
  init: function() {
    this.setHSV(40, 1.0, 0.99);
    this.appendValueInput('ADD0')
        .appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
    this.appendValueInput('ADD1');
    this.appendValueInput('ADD2');
    this.setOutput(true, Blockly.BlockValueType.ARRAY);
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
    this.itemCount_ = 3;
  },
  mutationToDom: function(blockSpace) {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  domToMutation: function(container) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = window.parseInt(container.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
    }
  },
  decompose: function(blockSpace) {
    var containerBlock = new Blockly.Block(blockSpace,
                                           'lists_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = new Blockly.Block(blockSpace, 'lists_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendTitle(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendTitle(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks.lists_create_with_container = {
  // Container.
  init: function() {
    this.setHSV(40, 1.0, 0.99);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks.lists_create_with_item = {
  // Add items.
  init: function() {
    this.setHSV(40, 1.0, 0.99);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks.lists_repeat = {
  // Create a list with one element repeated.
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_REPEAT_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.setOutput(true, Blockly.BlockValueType.ARRAY);
    this.interpolateMsg(Blockly.Msg.LISTS_REPEAT_TITLE,
                        ['ITEM', null, Blockly.ALIGN_RIGHT],
                        ['NUM', 'Number', Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);
    this.setTooltip(Blockly.Msg.LISTS_REPEAT_TOOLTIP);
  }
};

Blockly.Blocks.lists_length = {
  // List length.
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_LENGTH_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.appendValueInput('VALUE')
        .setCheck([Blockly.BlockValueType.ARRAY, Blockly.BlockValueType.STRING])
        .appendTitle(Blockly.Msg.LISTS_LENGTH_INPUT_LENGTH);
    this.setOutput(true, Blockly.BlockValueType.NUMBER);
    this.setTooltip(Blockly.Msg.LISTS_LENGTH_TOOLTIP);
  }
};

Blockly.Blocks.lists_isEmpty = {
  // Is the list empty?
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_IS_EMPTY_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.interpolateMsg(Blockly.Msg.LISTS_IS_EMPTY_TITLE,
                        ['VALUE', ['Array', 'String'], Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT)
    this.setInputsInline(true);
    this.setOutput(true, Blockly.BlockValueType.BOOLEAN);
    this.setTooltip(Blockly.Msg.LISTS_TOOLTIP);
  }
};

Blockly.Blocks.lists_indexOf = {
  // Find an item in the list.
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.LISTS_INDEX_OF_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_INDEX_OF_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.LISTS_INDEX_OF_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.setOutput(true, Blockly.BlockValueType.NUMBER);
    this.appendValueInput('VALUE')
        .setCheck(Blockly.BlockValueType.ARRAY)
        .appendTitle(Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST);
    this.appendValueInput('FIND')
        .appendTitle(new Blockly.FieldDropdown(OPERATORS), 'END');
    this.setInputsInline(true);
    this.setTooltip(Blockly.Msg.LISTS_INDEX_OF_TOOLTIP);
  }
};

Blockly.Blocks.lists_getIndex = {
  // Get element at index.
  init: function() {
    var MODE =
        [[Blockly.Msg.LISTS_GET_INDEX_GET, 'GET'],
         [Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE, 'GET_REMOVE'],
         [Blockly.Msg.LISTS_GET_INDEX_REMOVE, 'REMOVE']];
    this.WHERE_OPTIONS =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
         [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']];
    this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    var modeMenu = new Blockly.FieldDropdown(MODE, function(value) {
      var isStatement = (value == 'REMOVE');
      this.sourceBlock_.updateStatement(isStatement);
    });
    this.appendValueInput('VALUE')
        .setCheck(Blockly.BlockValueType.ARRAY)
        .appendTitle(Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST);
    this.appendDummyInput()
        .appendTitle(modeMenu, 'MODE')
        .appendTitle('', 'SPACE');
    this.appendDummyInput('AT');
    if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
      this.appendDummyInput('TAIL')
          .appendTitle(Blockly.Msg.LISTS_GET_INDEX_TAIL);
    }
    this.setInputsInline(true);
    this.setOutput(true);
    this.updateAt(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var combo = thisBlock.getTitleValue('MODE') + '_' +
          thisBlock.getTitleValue('WHERE');
      return Blockly.Msg['LISTS_GET_INDEX_TOOLTIP_' + combo];
    });
  },
  mutationToDom: function() {
    // Save whether the block is a statement or a value.
    // Save whether there is an 'AT' input.
    var container = document.createElement('mutation');
    var isStatement = !this.outputConnection;
    container.setAttribute('statement', isStatement);
    var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
    container.setAttribute('at', isAt);
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the block shape.
    // Note: Until January 2013 this block did not have mutations,
    // so 'statement' defaults to false and 'at' defaults to true.
    var isStatement = (xmlElement.getAttribute('statement') == 'true');
    this.updateStatement(isStatement);
    var isAt = (xmlElement.getAttribute('at') != 'false');
    this.updateAt(isAt);
  },
  updateStatement: function(newStatement) {
    // Switch between a value block and a statement block.
    var oldStatement = !this.outputConnection;
    if (newStatement != oldStatement) {
      this.unplug(true, true);
      if (newStatement) {
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      } else {
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true);
      }
    }
  },
  updateAt: function(isAt) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck(Blockly.BlockValueType.NUMBER);
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL')
            .appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT');
    }
    var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt(newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setTitleValue(value, 'WHERE');
        return null;
      }
      return undefined;
    });
    this.getInput('AT').appendTitle(menu, 'WHERE');
    if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
      this.moveInputBefore('TAIL', null);
    }
  }
};

Blockly.Blocks.lists_setIndex = {
  // Set element at index.
  init: function() {
    var MODE =
        [[Blockly.Msg.LISTS_SET_INDEX_SET, 'SET'],
         [Blockly.Msg.LISTS_SET_INDEX_INSERT, 'INSERT']];
    this.WHERE_OPTIONS =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
         [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']];
    this.setHelpUrl(Blockly.Msg.LISTS_SET_INDEX_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.appendValueInput('LIST')
        .setCheck(Blockly.BlockValueType.ARRAY)
        .appendTitle(Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(MODE), 'MODE')
        .appendTitle('', 'SPACE');
    this.appendDummyInput('AT');
    this.appendValueInput('TO')
        .appendTitle(Blockly.Msg.LISTS_SET_INDEX_INPUT_TO);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.LISTS_SET_INDEX_TOOLTIP);
    this.updateAt(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var combo = thisBlock.getTitleValue('MODE') + '_' +
          thisBlock.getTitleValue('WHERE');
      return Blockly.Msg['LISTS_SET_INDEX_TOOLTIP_' + combo];
    });
  },
  mutationToDom: function() {
    // Save whether there is an 'AT' input.
    var container = document.createElement('mutation');
    var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
    container.setAttribute('at', isAt);
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the block shape.
    // Note: Until January 2013 this block did not have mutations,
    // so 'at' defaults to true.
    var isAt = (xmlElement.getAttribute('at') != 'false');
    this.updateAt(isAt);
  },
  updateAt: function(isAt) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' input.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck(Blockly.BlockValueType.NUMBER);
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL')
            .appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT');
    }
    var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt(newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setTitleValue(value, 'WHERE');
        return null;
      }
      return undefined;
    });
    this.moveInputBefore('AT', 'TO');
    if (this.getInput('ORDINAL')) {
      this.moveInputBefore('ORDINAL', 'TO');
    }

    this.getInput('AT').appendTitle(menu, 'WHERE');
  }
};

Blockly.Blocks.lists_getSublist = {
  // Get sublist.
  init: function() {
    this.WHERE_OPTIONS_1 =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST']];
    this.WHERE_OPTIONS_2 =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.LISTS_GET_SUBLIST_HELPURL);
    this.setHSV(40, 1.0, 0.99);
    this.appendValueInput('LIST')
        .setCheck(Blockly.BlockValueType.ARRAY)
        .appendTitle(Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST);
    this.appendDummyInput('AT1');
    this.appendDummyInput('AT2');
    if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
      this.appendDummyInput('TAIL')
          .appendTitle(Blockly.Msg.LISTS_GET_SUBLIST_TAIL);
    }
    this.setInputsInline(true);
    this.setOutput(true, Blockly.BlockValueType.ARRAY);
    this.updateAt(1, true);
    this.updateAt(2, true);
    this.setTooltip(Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP);
  },
  mutationToDom: function() {
    // Save whether there are 'AT' inputs.
    var container = document.createElement('mutation');
    var isAt1 = this.getInput('AT1').type == Blockly.INPUT_VALUE;
    container.setAttribute('at1', isAt1);
    var isAt2 = this.getInput('AT2').type == Blockly.INPUT_VALUE;
    container.setAttribute('at2', isAt2);
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the block shape.
    var isAt1 = (xmlElement.getAttribute('at1') == 'true');
    var isAt2 = (xmlElement.getAttribute('at2') == 'true');
    this.updateAt(1, isAt1);
    this.updateAt(2, isAt2);
  },
  updateAt: function(n, isAt) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT' + n);
    this.removeInput('ORDINAL' + n, true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT' + n).setCheck(Blockly.BlockValueType.NUMBER);
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL' + n)
            .appendTitle(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT' + n);
    }
    var menu = new Blockly.FieldDropdown(this['WHERE_OPTIONS_' + n],
        function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt(n, newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setTitleValue(value, 'WHERE' + n);
        return null;
      }
      return undefined;
    });
    this.getInput('AT' + n)
        .appendTitle(menu, 'WHERE' + n);
    if (n == 1) {
      this.moveInputBefore('AT1', 'AT2');
      if (this.getInput('ORDINAL1')) {
        this.moveInputBefore('ORDINAL1', 'AT2');
      }
    }
    if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
      this.moveInputBefore('TAIL', null);
    }
  }
};
