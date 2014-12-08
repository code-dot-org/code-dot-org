require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({130:[function(require,module,exports){
var appMain = require('../appMain');
window.Turtle = require('./turtle');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.turtleMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Turtle, levels, options);
};

},{"../appMain":2,"./blocks":125,"./levels":129,"./skins":132,"./turtle":135}],132:[function(require,module,exports){
var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  var CONFIGS = {
    anna: {
      // slider speed gets divided by this value
      speedModifier: 10,
      turtleNumFrames: 10,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      annaLine: skin.assetUrl('annaline.png'),
      annaLine_2x: skin.assetUrl('annaline_2x.png')
    },

    elsa: {
      speedModifier: 10,
      turtleNumFrames: 20,
      decorationAnimationNumFrames: 19,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      elsaLine: skin.assetUrl('elsaline.png'),
      elsaLine_2x: skin.assetUrl('elsaline_2x.png')
    }
  };

  var config = CONFIGS[skin.id];

  // base skin properties here (can be overriden by CONFIG)
  skin.speedModifier = 1;

  // Get properties from config
  var isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  for (var prop in config) {
    skin[prop] = config[prop];
  }

  return skin;
};

},{"../skins":96}],125:[function(require,module,exports){
/**
 * Blockly Demo: Turtle Graphics
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
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var Colours = require('./core').Colours;
var msg = window.blockly.appLocale;
var commonMsg = window.blockly.locale;

var customLevelBlocks = require('./customLevelBlocks');
var Turtle = require('./turtle');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  if (skin.id == "anna" || skin.id == "elsa")
  {
    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [
      Colours.FROZEN1, Colours.FROZEN2, Colours.FROZEN3,
      Colours.FROZEN4, Colours.FROZEN5, Colours.FROZEN6,
      Colours.FROZEN7, Colours.FROZEN8, Colours.FROZEN9];
    blockly.FieldColour.COLUMNS = 3;

  } else {

    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [
      // Row 1.
      Colours.BLACK, Colours.GREY,
      Colours.KHAKI, Colours.WHITE,
      // Row 2.
      Colours.RED, Colours.PINK,
      Colours.ORANGE, Colours.YELLOW,
      // Row 3.
      Colours.GREEN, Colours.BLUE,
      Colours.AQUAMARINE, Colours.PLUM];
    blockly.FieldColour.COLUMNS = 4;
  }

  // Block definitions.
  blockly.Blocks.draw_move_by_constant = {
    // Block for moving forward or backward the internal number of pixels.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldTextInput('100',
            blockly.FieldTextInput.numberValidator), 'VALUE')
          .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveForwardTooltip());
    }
  };

  blockly.Blocks.draw_move_by_constant_dropdown = {
    // Block for moving forward or backward the internal number of pixels.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(
          blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(), 'VALUE')
        .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveForwardTooltip());
    }
  };

  generator.draw_move_by_constant = function() {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.draw_move_by_constant_dropdown = generator.draw_move_by_constant;

  blockly.Blocks.draw_turn_by_constant_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUE), 'VALUE')
          .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_by_constant_restricted.VALUE =
      [30, 45, 60, 90, 120, 135, 150, 180].
      map(function(t) {return [String(t), String(t)];});

  generator.draw_turn_by_constant_restricted = function() {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_turn_by_constant = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(
          blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldTextInput('90',
          blockly.FieldTextInput.numberValidator), 'VALUE')
        .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_by_constant_dropdown = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(
          blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(), 'VALUE')
        .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  generator.draw_turn_by_constant = function() {
    // Generate JavaScript for turning left or right.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.draw_turn_by_constant_dropdown = generator.draw_turn_by_constant;

  generator.draw_move_inline = function() {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };


  blockly.Blocks.draw_turn_inline_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUE), 'VALUE')
          .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_inline_restricted.VALUE =
      [30, 45, 60, 90, 120, 135, 150, 180].
      map(function(t) {return [String(t), String(t)];});

  generator.draw_turn_inline_restricted = function() {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_turn_inline = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldTextInput('90',
              blockly.FieldTextInput.numberValidator), 'VALUE')
          .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  generator.draw_turn_inline = function() {
    // Generate JavaScript for turning left or right.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.variables_get_counter = {
    // Variable getter.
    category: null,  // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
          .appendTitle(new blockly.FieldLabel(msg.loopVariable()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_counter = generator.variables_get;

  blockly.Blocks.variables_get_length = {
    // Variable getter.
    category: null,  // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
          .appendTitle(new blockly.FieldLabel(msg.lengthParameter()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_length = generator.variables_get;

  blockly.Blocks.variables_get_sides = {
    // Variable getter.
    category: null,  // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
          .appendTitle(new blockly.FieldLabel('sides'), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_sides = generator.variables_get;

  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        // The generated comment helps detect required blocks.
        // Don't change it without changing REQUIRED_BLOCKS.
        '// draw_a_square',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' +
              loopVar + '++) {',
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnRight(90);',
        '}\n'].join('\n');
  };

  // Create a fake "draw a snowman" function so it can be made available to
  // users without being shown in the workspace.
  blockly.Blocks.draw_a_snowman = {
    // Draw a circle in front of the turtle, ending up on the opposite side.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASnowman());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowman = function() {
    // Generate JavaScript for drawing a snowman in front of the turtle.
    var value = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var distancesVar = gensym('distances');
    var loopVar = gensym('counter');
    var degreeVar = gensym('degree');
    var distanceVar = gensym('distance');
    return [
      // The generated comment helps detect required blocks.
      // Don't change it without changing REQUIRED_BLOCKS.
      '// draw_a_snowman',
      'Turtle.turnLeft(90);',
      'var ' + distancesVar + ' = [' + value + ' * 0.5, ' + value + ' * 0.3,' +
          value + ' * 0.2];',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' +
          loopVar + '++) {\n',
      '  var ' + distanceVar + ' = ' + distancesVar + '[' + loopVar +
          ' < 3 ? ' + loopVar + ': 5 - ' + loopVar + '] / 57.5;',
      '  for (var ' + degreeVar + ' = 0; ' + degreeVar + ' < 90; ' +
          degreeVar + '++) {',
      '    Turtle.moveForward(' + distanceVar + ');',
      '    Turtle.turnRight(2);',
      '  }',
      '  if (' + loopVar + ' != 2) {',
      '    Turtle.turnLeft(180);',
      '  }',
      '}',
      'Turtle.turnLeft(90);\n'].join('\n');
  };

  // This is a modified copy of blockly.Blocks.controls_for with the
  // variable named "counter" hardcoded.
  blockly.Blocks.controls_for_counter = {
    // For loop with hardcoded loop variable.
    helpUrl: blockly.Msg.CONTROLS_FOR_HELPURL,
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(blockly.Msg.CONTROLS_FOR_INPUT_WITH)
          .appendTitle(new blockly.FieldLabel(msg.loopVariable()),
                       'VAR');
      this.interpolateMsg(blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY,
                        ['FROM', 'Number', blockly.ALIGN_RIGHT],
                        ['TO', 'Number', blockly.ALIGN_RIGHT],
                        ['BY', 'Number', blockly.ALIGN_RIGHT],
                        blockly.ALIGN_RIGHT);
      this.appendStatementInput('DO')
          .appendTitle(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip(blockly.Msg.CONTROLS_FOR_TOOLTIP.replace(
          '%1', this.getTitleValue('VAR')));
    },
    getVars: function() {
      return [this.getTitleValue('VAR')];
    },
    customContextMenu: function(options) {
      var option = {enabled: true};
      var name = this.getTitleValue('VAR');
      option.text = blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlTitle = document.createElement('title');
      xmlTitle.appendChild(document.createTextNode(name));
      xmlTitle.setAttribute('name', 'VAR');
      var xmlBlock = document.createElement('block');
      xmlBlock.appendChild(xmlTitle);
      xmlBlock.setAttribute('type', 'variables_get_counter');
      option.callback = blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    },
    // serialize the counter variable name to xml so that it can be used across
    // different locales
    mutationToDom: function () {
      var container = document.createElement('mutation');
      var counter = this.getTitleValue('VAR');
      container.setAttribute('counter', counter);
      return container;
    },
    // deserialize the counter variable name
    domToMutation: function(xmlElement) {
      var counter = xmlElement.getAttribute('counter');
      this.setTitleValue(counter, 'VAR');
    }
  };

  generator.controls_for_counter = generator.controls_for;

  // Delete these standard blocks.
  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;

  // General blocks.

  blockly.Blocks.draw_move = {
    // Block for moving forward or backwards.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE')
          .setCheck('Number')
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.draw_move.DIRECTIONS =
      [[msg.moveForward(), 'moveForward'],
       [msg.moveBackward(), 'moveBackward']];

  generator.draw_move = function() {
    // Generate JavaScript for moving forward or backwards.
    var value = generator.valueToCode(this, 'VALUE',
        generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.jump = {
    // Block for moving forward or backwards.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE')
          .setCheck('Number')
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  var longMoveLengthDropdownValue = "LONG_MOVE_LENGTH";
  var shortMoveLengthDropdownValue = "SHORT_MOVE_LENGTH";
  var simpleLengthChoices = [
    [skin.longLineDraw, longMoveLengthDropdownValue],
    [skin.shortLineDraw, shortMoveLengthDropdownValue]
  ];
  var simpleLengthRightChoices = [
    [skin.longLineDrawRight, longMoveLengthDropdownValue],
    [skin.shortLineDrawRight, shortMoveLengthDropdownValue]
  ];

  var SimpleMove = {
    DEFAULT_MOVE_LENGTH: 50,
    SHORT_MOVE_LENGTH: 50,
    LONG_MOVE_LENGTH: 100,
    DIRECTION_CONFIGS: {
      left: {
        title: commonMsg.directionWestLetter(),
        moveFunction: 'moveLeft',
        tooltip: msg.moveWestTooltip(),
        image: skin.westLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices
      },
      right: {
        title: commonMsg.directionEastLetter(),
        moveFunction: 'moveRight',
        tooltip: msg.moveEastTooltip(),
        image: skin.eastLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthRightChoices
      },
      up: {
        title: commonMsg.directionNorthLetter(),
        moveFunction: 'moveUp',
        tooltip: msg.moveNorthTooltip(),
        image: skin.northLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices
      },
      down: {
        title: commonMsg.directionSouthLetter(),
        moveFunction: 'moveDown',
        tooltip: msg.moveSouthTooltip(),
        image: skin.southLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices
      },
      jump_left: {
        isJump: true,
        title: commonMsg.directionWestLetter(),
        moveFunction: 'jumpLeft',
        image: skin.leftJumpArrow,
        tooltip: msg.jumpWestTooltip()
      },
      jump_right: {
        isJump: true,
        title: commonMsg.directionEastLetter(),
        moveFunction: 'jumpRight',
        image: skin.rightJumpArrow,
        tooltip: msg.jumpEastTooltip()
      },
      jump_up: {
        isJump: true,
        title: commonMsg.directionNorthLetter(),
        moveFunction: 'jumpUp',
        image: skin.upJumpArrow,
        tooltip: msg.jumpNorthTooltip()
      },
      jump_down: {
        isJump: true,
        title: commonMsg.directionSouthLetter(),
        moveFunction: 'jumpDown',
        image: skin.downJumpArrow,
        tooltip: msg.jumpSouthTooltip()
      }
    },
    generateBlocksForAllDirections: function() {
      SimpleMove.generateBlocksForDirection("up");
      SimpleMove.generateBlocksForDirection("down");
      SimpleMove.generateBlocksForDirection("left");
      SimpleMove.generateBlocksForDirection("right");
    },
    generateBlocksForDirection: function(direction) {
      generator["simple_move_" + direction] = SimpleMove.generateCodeGenerator(direction);
      generator["simple_jump_" + direction] = SimpleMove.generateCodeGenerator('jump_' + direction);
      generator["simple_move_" + direction + "_length"] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks['simple_move_' + direction + '_length'] = SimpleMove.generateMoveBlock(direction, true);
      blockly.Blocks['simple_move_' + direction] = SimpleMove.generateMoveBlock(direction);
      blockly.Blocks['simple_jump_' + direction] = SimpleMove.generateMoveBlock('jump_' + direction);
    },
    generateMoveBlock: function(direction, hasLengthInput) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      var directionLetterWidth = 12;
      return {
        helpUrl: '',
        init: function () {
          this.setHSV(184, 1.00, 0.74);
          var input = this.appendDummyInput();
          if (directionConfig.isJump) {
            input.appendTitle(commonMsg.jump());
          }
          input.appendTitle(new blockly.FieldLabel(directionConfig.title, {fixedSize: {width: directionLetterWidth, height: 18}}));

          if (directionConfig.imageDimensions) {
            input.appendTitle(new blockly.FieldImage(directionConfig.image,
              directionConfig.imageDimensions.width,
              directionConfig.imageDimensions.height));
          } else {
            input.appendTitle(new blockly.FieldImage(directionConfig.image));
          }
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
          if (hasLengthInput) {
            var dropdown = new blockly.FieldImageDropdown(directionConfig.lengths);
            dropdown.setValue(longMoveLengthDropdownValue);
            input.appendTitle(dropdown, 'length');
          }
        }
      };
    },
    generateCodeGenerator: function(direction, hasLengthInput, length) {
      return function() {
        length = length || SimpleMove.DEFAULT_MOVE_LENGTH;

        if (hasLengthInput) {
          length = SimpleMove[this.getTitleValue("length")];
        }
        return 'Turtle.' + SimpleMove.DIRECTION_CONFIGS[direction].moveFunction + '(' + length + ',' + '\'block_id_' + this.id + '\');\n';
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  blockly.Blocks.jump.DIRECTIONS =
      [[msg.jumpForward(), 'jumpForward'],
       [msg.jumpBackward(), 'jumpBackward']];

  generator.jump = function() {
    // Generate JavaScript for jumping forward or backwards.
    var value = generator.valueToCode(this, 'VALUE',
        generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.jump_by_constant = {
    // Block for moving forward or backward the internal number of pixels
    // without drawing.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldTextInput('100',
              blockly.FieldTextInput.numberValidator), 'VALUE')
          .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  blockly.Blocks.jump_by_constant_dropdown = {
    // Block for moving forward or backward the internal number of pixels
    // without drawing.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(), 'VALUE')
          .appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  generator.jump_by_constant = function() {
    // Generate JavaScript for moving forward or backward the internal number
    // of pixels without drawing.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.jump_by_constant_dropdown = generator.jump_by_constant;

  blockly.Blocks.draw_turn = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE')
          .setCheck('Number')
          .appendTitle(new blockly.FieldDropdown(
              blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput()
          .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn.DIRECTIONS =
      [[msg.turnRight(), 'turnRight'],
       [msg.turnLeft(), 'turnLeft']];

  generator.draw_turn = function() {
    // Generate JavaScript for turning left or right.
    var value = generator.valueToCode(this, 'VALUE',
        generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') +
        '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  // this is the old version of this block, that should only still be used in
  // old shared levels
  blockly.Blocks.draw_width = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('WIDTH')
          .setCheck('Number')
          .appendTitle(msg.setWidth());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width = function() {
    // Generate JavaScript for setting the pen width.
    var width = generator.valueToCode(this, 'WIDTH',
        generator.ORDER_NONE) || '1';
    return 'Turtle.penWidth(' + width + ', \'block_id_' + this.id + '\');\n';
  };

  // inlined version of draw_width
  blockly.Blocks.draw_width_inline = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.setInputsInline(true);
      this.appendDummyInput()
          .appendTitle(msg.setWidth());
      this.appendDummyInput()
          .appendTitle(new blockly.FieldTextInput('1',
            blockly.FieldTextInput.numberValidator), 'WIDTH');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width_inline = function() {
    // Generate JavaScript for setting the pen width.
    var width = this.getTitleValue('WIDTH');
    return 'Turtle.penWidth(' + width + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_pen = {
    // Block for pen up/down.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.STATE), 'PEN');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.penTooltip());
    }
  };

  blockly.Blocks.draw_pen.STATE =
      [[msg.penUp(), 'penUp'],
       [msg.penDown(), 'penDown']];

  generator.draw_pen = function() {
    // Generate JavaScript for pen up/down.
    return 'Turtle.' + this.getTitleValue('PEN') +
        '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_colour = {
    // Block for setting the colour.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendValueInput('COLOUR')
          .setCheck('Colour')
          .appendTitle(msg.setColour());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip(msg.colourTooltip());
    }
  };

  generator.draw_colour = function() {
    // Generate JavaScript for setting the colour.
    var colour = generator.valueToCode(this, 'COLOUR',
        generator.ORDER_NONE) || '\'#000000\'';
    return 'Turtle.penColour(' + colour + ', \'block_id_' +
        this.id + '\');\n';
  };

  blockly.Blocks.draw_colour_simple = {
    // Simplified dropdown block for setting the colour.
    init: function() {
      var colours = [Colours.RED, Colours.BLACK, Colours.PINK, Colours.ORANGE,
        Colours.YELLOW, Colours.GREEN, Colours.BLUE, Colours.AQUAMARINE, Colours.PLUM];
      this.setHSV(196, 1.0, 0.79);
      var colourField = new Blockly.FieldColourDropdown(colours, 45, 35);
      this.appendDummyInput()
          .appendTitle(msg.setColour())
          .appendTitle(colourField, 'COLOUR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.colourTooltip());
    }
  };

  generator.draw_colour_simple = function() {
    // Generate JavaScript for setting the colour.
    var colour = this.getTitleValue('COLOUR') || '\'#000000\'';
    return 'Turtle.penColour("' + colour + '", \'block_id_' +
        this.id + '\');\n';
  };

  blockly.Blocks.draw_line_style_pattern = {
    // Block to handle event when an arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput()
           .appendTitle(msg.setPattern())
           .appendTitle( new blockly.FieldImageDropdown(
              Turtle.lineStylePatternOptions, 150, 20 ), 'VALUE' );
      this.setTooltip(msg.setPattern());
    }
  };

  generator.draw_line_style_pattern = function() {
    // Generate JavaScript for setting the image for a patterned line.
    var pattern = this.getTitleValue('VALUE') || '\'DEFAULT\'';
    return 'Turtle.penPattern("' + pattern + '", \'block_id_' +
        this.id + '\');\n';
  };

  blockly.Blocks.up_big = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.STATE), 'VISIBILITY');
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  generator.up_big = function() {
    // Generate JavaScript for setting the colour.
    var colour = generator.valueToCode(this, 'COLOUR',
      generator.ORDER_NONE) || '\'#000000\'';
    return 'Turtle.penColour(' + colour + ', \'block_id_' +
      this.id + '\');\n';
  };

  blockly.Blocks.turtle_visibility = {
    // Block for changing turtle visiblity.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.STATE), 'VISIBILITY');
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  blockly.Blocks.turtle_visibility.STATE =
      [[msg.hideTurtle(), 'hideTurtle'],
       [msg.showTurtle(), 'showTurtle']];

  generator.turtle_visibility = function() {
    // Generate JavaScript for changing turtle visibility.
    return 'Turtle.' + this.getTitleValue('VISIBILITY') +
        '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.turtle_stamp = {
    helpUrl: '',
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      var dropdown;
      var input = this.appendDummyInput();
      input.appendTitle(msg.drawStamp());
      dropdown = new blockly.FieldImageDropdown(this.VALUES, 50, 30);

      input.appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.drawStamp());
    }
  };

  if (skin.id == "anna" || skin.id == "elsa") {
    blockly.Blocks.turtle_stamp.VALUES = [
      [skin.assetUrl('snowflake.png'), 'snowflake1'],
      [skin.assetUrl('snowflake.png'), 'snowflake2'],
      [skin.assetUrl('snowflake.png'), 'snowflake3'],
    ];
  } else {
    blockly.Blocks.turtle_stamp.VALUES = [
      [skin.patternDefault, 'DEFAULT']
    ];
  }

  // Preload stamp images
  Turtle.stamps = [];
  for (var i = 0; i < blockly.Blocks.turtle_stamp.VALUES.length; i++) {
    var url = blockly.Blocks.turtle_stamp.VALUES[i][0];
    var key = blockly.Blocks.turtle_stamp.VALUES[i][1];
    var img = new Image();
    img.src = url;
    Turtle.stamps[key] = img;
  }

  generator.turtle_stamp = function () {
    return 'Turtle.drawStamp("' + this.getTitleValue('VALUE') +
        '", \'block_id_' + this.id + '\');\n';
  };

  customLevelBlocks.install(blockly, generator, gensym);
};

},{"./core":127,"./customLevelBlocks":128,"./turtle":135}],135:[function(require,module,exports){
/**
 * Blockly Demo: Turtle Graphics
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
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

window.Turtle = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Turtle = module.exports;
var commonMsg = window.blockly.locale;
var turtleMsg = window.blockly.appLocale;
var levels = require('./levels');
var Colours = require('./core').Colours;
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var utils = require('../utils');

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var JOINT_RADIUS = 4;

var SMOOTH_ANIMATE_STEP_SIZE = 5;
var FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

/**
 * Minimum joint segment length
 */
var JOINT_SEGMENT_LENGTH = 50;

// image icons and image paths for the 'set pattern block'
exports.lineStylePatternOptions = [];

/**
 * PID of animation task currently executing.
 */
Turtle.pid = 0;

/**
 * Should the turtle be drawn?
 */
Turtle.visible = true;

/**
 * Set a turtle heading.
 */
Turtle.heading = 0;

/**
 * The avatar image
 */
Turtle.avatarImage = new Image();
Turtle.numberAvatarHeadings = undefined;

/**
 * The avatar animation decoration image
 */
Turtle.decorationAnimationImage = new Image();

/**
 * Drawing with a pattern
 */

Turtle.currentPathPattern = new Image();
Turtle.loadedPathPatterns = [];
Turtle.isDrawingWithPattern = false;

function backingScale(context) {
  // disable retina for now
  // if ('devicePixelRatio' in window) {
  //   if (window.devicePixelRatio > 1) {
  //     return window.devicePixelRatio;
  //   }
  // }
  return 1;
}

var retina = 1;

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Turtle.init = function(config) {

  skin = config.skin;
  level = config.level;

  exports.lineStylePatternOptions = [
    [skin.patternDefault, 'DEFAULT'], //  signals return to default path drawing
    [skin.rainbowMenu, 'rainbowLine'],  // set to property name for image within skin
    [skin.ropeMenu, 'ropeLine'],  // referenced as skin[pattern];
    [skin.squigglyMenu, 'squigglyLine'],
    [skin.swirlyMenu, 'swirlyLine'],
    [skin.annaLine, 'annaLine'],
    [skin.elsaLine, 'elsaLine'],
    [skin.annaLine_2x, 'annaLine_2x'],
    [skin.elsaLine_2x, 'elsaLine_2x'],
  ];

  if (skin.id == "anna" || skin.id == "elsa")
  {
    retina = backingScale();

    // We don't support ratios other than 2 right now (sorry!) so fall back to 1.
    if (retina != 2)
      retina = 1;

    // let's try adding a background image
    level.images = [{}];
    if (retina > 1) {
      level.images[0].filename = 'background_2x.jpg';
    }
    else {
      level.images[0].filename = 'background.jpg';
    }

    level.images[0].position = [ 0, 0 ];
    level.images[0].scale = 1;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';

  if (skin.id == "anna")
  {
    Turtle.AVATAR_WIDTH = 73;
    Turtle.AVATAR_HEIGHT = 100;
  }
  else if (skin.id == "elsa")
  {
    Turtle.AVATAR_WIDTH = 73;
    Turtle.AVATAR_HEIGHT = 100;
    Turtle.DECORATIONANIMATION_WIDTH = 85;
    Turtle.DECORATIONANIMATION_HEIGHT = 85;
  }
  else
  {
    Turtle.AVATAR_WIDTH = 70;
    Turtle.AVATAR_HEIGHT = 51;
  }

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      controls: require('./controls.html')({assetUrl: BlocklyApps.assetUrl}),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    if (BlocklyApps.usingBlockly) {
      // Add to reserved word list: API, local variables in execution evironment
      // (execute) and the infinite loop detection function.
      //XXX Not sure if this is still right.
      Blockly.JavaScript.addReservedWords('Turtle,code');
    }

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create hidden canvases.
    Turtle.ctxAnswer = createCanvas('answer', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxImages = createCanvas('images', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxPredraw = createCanvas('predraw', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxScratch = createCanvas('scratch', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxPattern = createCanvas('pattern', 400 * retina, 400 * retina).getContext('2d');
    Turtle.ctxFeedback = createCanvas('feedback', 154, 154).getContext('2d');

    // Create display canvas.
    var display = createCanvas('display', 400 * retina, 400 * retina);

    if (retina > 1)
    {
      display.style.width = '400px';
      display.style.height = '400px';
    }

    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Turtle.ctxDisplay = display.getContext('2d');


    if (BlocklyApps.usingBlockly && (skin.id == "anna" || skin.id == "elsa")) {
      Blockly.JavaScript.colour_random = function() {
        // Generate a random colour.
        if (!Blockly.JavaScript.definitions_.colour_random) {
          var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
              'colour_random', Blockly.Generator.NAME_TYPE);
          Blockly.JavaScript.colour_random.functionName = functionName;
          var func = [];
          func.push('function ' + functionName + '() {');
          func.push('   var colors = ' + JSON.stringify(Blockly.FieldColour.COLOURS) + ';');
          func.push('  return colors[Math.floor(Math.random()*colors.length)];');
          func.push('}');
          Blockly.JavaScript.definitions_.colour_random = func.join('\n');
        }
        var code = Blockly.JavaScript.colour_random.functionName + '()';
        return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
      };
    }

    Turtle.loadDecorationAnimation();

    // Set their initial contents.
    Turtle.loadTurtle();
    Turtle.drawImages();
    Turtle.isDrawingAnswer_ = true;
    Turtle.drawAnswer();
    Turtle.isDrawingAnswer_ = false;
    if (level.predraw_blocks) {
      Turtle.isPredrawing_ = true;
      Turtle.drawBlocksOnCanvas(level.predraw_blocks, Turtle.ctxPredraw);
      Turtle.isPredrawing_ = false;
    }

    // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
    // enough in this case, so we're actually creating and reusing the object within the document body.

    if (skin.id == "anna" || skin.id == "elsa")
    {
      var imageContainer = document.createElement('div');
      imageContainer.style.display='none';
      document.body.appendChild(imageContainer);

      for( var i = 0; i < exports.lineStylePatternOptions.length; i++) {
        var pattern = exports.lineStylePatternOptions[i][1];
        if (skin[pattern]) {
          var img = new Image();
          img.src = skin[pattern];
          Turtle.loadedPathPatterns[pattern] = img;
        }
      }
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
  };

  BlocklyApps.init(config);
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Turtle.drawAnswer = function() {
  if (level.solutionBlocks) {
    Turtle.drawBlocksOnCanvas(level.solutionBlocks, Turtle.ctxAnswer);
  } else {
    Turtle.drawLogOnCanvas(level.answer, Turtle.ctxAnswer);
  }
};

Turtle.drawLogOnCanvas = function(log, canvas) {
  BlocklyApps.reset();
  while (log.length) {
    var tuple = log.shift();
    Turtle.step(tuple[0], tuple.splice(1), {smoothAnimate: false});
    resetStepInfo();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(Turtle.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

Turtle.drawBlocksOnCanvas = function(blocks, canvas) {
  var code;
  if (BlocklyApps.usingBlockly) {
    var domBlocks = Blockly.Xml.textToDom(blocks);
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, domBlocks);
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = blocks;
  }
  Turtle.evalCode(code);
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.clear();
  }
  Turtle.drawCurrentBlocksOnCanvas(canvas);
};

Turtle.drawCurrentBlocksOnCanvas = function(canvas) {
  Turtle.drawLogOnCanvas(api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
Turtle.placeImage = function(filename, position, scale) {
  var img = new Image();
  img.onload = function() {
    if (scale) {
      if (img.width !== 0) {
        Turtle.ctxImages.drawImage(img, position[0] * retina, position[1] * retina, img.width, img.height, 0, 0, img.width * scale, img.height * scale);
      }
    } else {
      if (img.width !== 0) {
        Turtle.ctxImages.drawImage(img, position[0] * retina, position[1] * retina);
      }
    }
    Turtle.display();
  };
  if (skin.id == "anna" || skin.id == "elsa")
  {
    img.src = skin.assetUrl(filename);
  }
  else
  {
    img.src = BlocklyApps.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto Turtle.ctxImages.
 */
Turtle.drawImages = function() {
  if (!level.images) {
    return;
  }
  for (var i = 0; i < level.images.length; i++) {
    var image = level.images[i];
    Turtle.placeImage(image.filename, image.position, image.scale);
  }
  Turtle.ctxImages.globalCompositeOperation = 'copy';
  Turtle.ctxImages.drawImage(Turtle.ctxScratch.canvas, 0, 0);
  Turtle.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the turtle image on load.
 */
Turtle.loadTurtle = function() {
  Turtle.avatarImage.onload = function() {
    Turtle.display();
  };
  if ((skin.id == "anna" || skin.id == "elsa") && retina > 1)
    Turtle.avatarImage.src = skin.avatar_2x;
  else
    Turtle.avatarImage.src = skin.avatar;
  if (skin.id == "anna")
    Turtle.numberAvatarHeadings = 36;
  else if (skin.id == "elsa")
    Turtle.numberAvatarHeadings = 18;
  else
    Turtle.numberAvatarHeadings = 180;
  Turtle.avatarImage.spriteHeight = Turtle.AVATAR_HEIGHT;
  Turtle.avatarImage.spriteWidth = Turtle.AVATAR_WIDTH;
};

/**
 * Initial the turtle animation deocration on load.
 */
Turtle.loadDecorationAnimation = function() {
  if (skin.id == "elsa")
  {
    if (retina > 1)
      Turtle.decorationAnimationImage.src = skin.decorationAnimation_2x;
    else
      Turtle.decorationAnimationImage.src = skin.decorationAnimation;
    Turtle.decorationAnimationImage.height = Turtle.DECORATIONANIMATION_HEIGHT;
    Turtle.decorationAnimationImage.width = Turtle.DECORATIONANIMATION_WIDTH;
  }
};

var turtleFrame = 0;


/**
 * Draw the turtle image based on Turtle.x, Turtle.y, and Turtle.heading.
 */
Turtle.drawTurtle = function() {
  var sourceY;
  // Computes the index of the image in the sprite.
  var index = Math.floor(Turtle.heading * Turtle.numberAvatarHeadings / 360);
  if (skin.id == "anna" || skin.id == "elsa") {
    // the rotations in the sprite sheet go in the opposite direction.
    index = Turtle.numberAvatarHeadings - index;

    // and they are 180 degrees out of phase.
    index = (index + Turtle.numberAvatarHeadings/2) % Turtle.numberAvatarHeadings;
  }
  var sourceX = Turtle.avatarImage.spriteWidth * index;
  if (skin.id == "anna" || skin.id == "elsa") {
    sourceY = Turtle.avatarImage.spriteHeight * turtleFrame;
    turtleFrame = (turtleFrame + 1) % skin.turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = Turtle.avatarImage.spriteWidth;
  var sourceHeight = Turtle.avatarImage.spriteHeight;
  var destWidth = Turtle.avatarImage.spriteWidth;
  var destHeight = Turtle.avatarImage.spriteHeight;
  var destX = Turtle.x - destWidth / 2;
  var destY = Turtle.y - destHeight + 7;

  if (Turtle.avatarImage.width === 0 || Turtle.avatarImage.height === 0)
    return;

  if (sourceX * retina < 0 ||
      sourceY * retina < 0 ||
      sourceX * retina + sourceWidth  * retina -0 > Turtle.avatarImage.width ||
      sourceY * retina + sourceHeight * retina > Turtle.avatarImage.height)
  {
    if (console && console.log) {
      console.log("drawImage is out of source bounds!");
    }
    return;
  }

  if (Turtle.avatarImage.width !== 0) {
    Turtle.ctxDisplay.drawImage(
      Turtle.avatarImage,
      Math.round(sourceX * retina), Math.round(sourceY * retina),
      sourceWidth * retina - 0, sourceHeight * retina,
      Math.round(destX * retina), Math.round(destY * retina),
      destWidth * retina - 0, destHeight * retina);
  }

  /* console.log(Math.round(sourceX * retina), Math.round(sourceY * retina),
                              sourceWidth * retina, sourceHeight * retina, Math.round(destX * retina), Math.round(destY * retina),
                              destWidth * retina, destHeight * retina); */
};

// An x offset against the sprite edge where the decoration should be drawn,
// along with whether it should be drawn before or after the turtle sprite itself.

var decorationImageDetails = [
  { x: 15, when: "after" },
  { x: 26, when: "after" },
  { x: 37, when: "after" },
  { x: 46, when: "after" },
  { x: 60, when: "after" },
  { x: 65, when: "after" },
  { x: 66, when: "after" },
  { x: 64, when: "after" },
  { x: 62, when: "before" },
  { x: 55, when: "before" },
  { x: 48, when: "before" },
  { x: 33, when: "before" },
  { x: 31, when: "before" },
  { x: 22, when: "before" },
  { x: 17, when: "before" },
  { x: 12, when: "before" },
  { x:  8, when: "after" },
  { x: 10, when: "after" }
];

/**
  * This is called twice, once with "before" and once with "after", referring to before or after
  * the sprite is drawn.  For some angles it should be drawn before, and for some after.
  */

Turtle.drawDecorationAnimation = function(when) {
  if (skin.id == "elsa") {
    var frameIndex = (turtleFrame + 10) % skin.decorationAnimationNumFrames;

    var angleIndex = Math.floor(Turtle.heading * Turtle.numberAvatarHeadings / 360);

    // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
    angleIndex = Turtle.numberAvatarHeadings - angleIndex;

    // and they are 180 degrees out of phase.
    angleIndex = (angleIndex + Turtle.numberAvatarHeadings/2) % Turtle.numberAvatarHeadings;

    if (decorationImageDetails[angleIndex].when == when) {
      var sourceX = Turtle.decorationAnimationImage.width * frameIndex;
      var sourceY = 0;
      var sourceWidth = Turtle.decorationAnimationImage.width;
      var sourceHeight = Turtle.decorationAnimationImage.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = Turtle.x - destWidth / 2 - 15 - 15 + decorationImageDetails[angleIndex].x;
      var destY = Turtle.y - destHeight / 2 - 100;

      if (Turtle.decorationAnimationImage.width !== 0) {
        Turtle.ctxDisplay.drawImage(
          Turtle.decorationAnimationImage,
          Math.round(sourceX * retina), Math.round(sourceY * retina),
          sourceWidth * retina, sourceHeight * retina,
          Math.round(destX * retina), Math.round(destY * retina),
          destWidth * retina, destHeight * retina);
      }
    }
  }
};


/**
 * Reset the turtle to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
BlocklyApps.reset = function(ignore) {
  // Standard starting location and heading of the turtle.
  Turtle.x = CANVAS_HEIGHT / 2;
  Turtle.y = CANVAS_WIDTH / 2;
  Turtle.heading = level.startDirection !== undefined ?
      level.startDirection : 90;
  Turtle.penDownValue = true;
  Turtle.visible = true;

  // For special cases, use a different initial location.
  if (level.initialX !== undefined) {
    Turtle.x = level.initialX;
  }
  if (level.initialY !== undefined) {
    Turtle.y = level.initialY;
  }
  // Clear the display.
  Turtle.ctxScratch.canvas.width = Turtle.ctxScratch.canvas.width;
  Turtle.ctxPattern.canvas.width = Turtle.ctxPattern.canvas.width;
  if (skin.id == "anna") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.lineWidth = 2 * retina;
  } else if (skin.id == "elsa") {
    Turtle.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.fillStyle = 'rgb(255,255,255)';
    Turtle.ctxScratch.lineWidth = 2 * retina;
  } else {
    Turtle.ctxScratch.strokeStyle = '#000000';
    Turtle.ctxScratch.fillStyle = '#000000';
    Turtle.ctxScratch.lineWidth = 5;
  }

  Turtle.ctxScratch.lineCap = 'round';
  Turtle.ctxScratch.font = 'normal 18pt Arial';
  Turtle.display();

  // Clear the feedback.
  Turtle.ctxFeedback.clearRect(
      0, 0, Turtle.ctxFeedback.canvas.width, Turtle.ctxFeedback.canvas.height);

  if (skin.id == "anna") {
    if (retina > 1)
      Turtle.setPattern("annaLine_2x");
    else
      Turtle.setPattern("annaLine");
  } else if (skin.id == "elsa") {
    if (retina > 1)
      Turtle.setPattern("elsaLine_2x");
    else
      Turtle.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    Turtle.setPattern(null);
  }

  // Kill any task.
  if (Turtle.pid) {
    window.clearTimeout(Turtle.pid);
  }
  Turtle.pid = 0;

  // Discard the interpreter.
  Turtle.interpreter = null;
  Turtle.executionError = null;

  // Stop the looping sound.
  BlocklyApps.stopLoopingAudio('start');

  resetStepInfo();
};

/**
 * When smooth animate is true, steps can be broken up into multiple animations.
 * At the end of each step, we want to reset any incremental information, which
 * is what this does.
 */
function resetStepInfo() {
  Turtle.stepStartX = Turtle.x;
  Turtle.stepStartY = Turtle.y;
  Turtle.stepDistanceCovered = 0;
}


/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Turtle.display = function() {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = Turtle.ctxDisplay.fillStyle;
  Turtle.ctxDisplay.fillStyle = 'white';
  Turtle.ctxDisplay.clearRect(0, 0, Turtle.ctxDisplay.canvas.width,
    Turtle.ctxDisplay.canvas.width);
  Turtle.ctxDisplay.fillStyle = style;

  Turtle.ctxDisplay.globalCompositeOperation = 'copy';
  // Draw the images layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxImages.canvas, 0, 0);

  // Draw the answer layer.
  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxDisplay.globalAlpha = 0.4;
  } else {
    Turtle.ctxDisplay.globalAlpha = 0.15;
  }
  Turtle.ctxDisplay.drawImage(Turtle.ctxAnswer.canvas, 0, 0);
  Turtle.ctxDisplay.globalAlpha = 1;

  // Draw the predraw layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxPredraw.canvas, 0, 0);

  // Draw the pattern layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxPattern.canvas, 0, 0);

  // Draw the user layer.
  Turtle.ctxDisplay.globalCompositeOperation = 'source-over';
  Turtle.ctxDisplay.drawImage(Turtle.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (Turtle.visible) {
    Turtle.drawDecorationAnimation("before");
    Turtle.drawTurtle();
    Turtle.drawDecorationAnimation("after");
  }
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  BlocklyApps.attempts++;
  Turtle.execute();

};

Turtle.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Turtle: api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      window.alert(e);
    }
  }
};

/**
 * Set up Turtle.code, Turtle.interpreter, etc. to run code for editCode levels
 */
function generateTurtleCodeFromJS () {
  Turtle.code = utils.generateCodeAliases(level.codeFunctions, 'Turtle');
  Turtle.userCodeStartOffset = Turtle.code.length;
  Turtle.code += BlocklyApps.editor.getValue();
  Turtle.userCodeLength = Turtle.code.length - Turtle.userCodeStartOffset;

  var session = BlocklyApps.editor.aceEditor.getSession();
  Turtle.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = function(interpreter, scope) {
    codegen.initJSInterpreter(interpreter, scope, {
                                      BlocklyApps: BlocklyApps,
                                      Turtle: api } );
  };
  Turtle.interpreter = new window.Interpreter(Turtle.code, initFunc);
}

/**
 * Execute the user's code.  Heaven help us...
 */
Turtle.execute = function() {
  api.log = [];

  // Reset the graphic.
  BlocklyApps.reset();

  if (feedback.hasExtraTopBlocks()) {
    // immediately check answer, which will fail and report top level blocks
    Turtle.checkAnswer();
    return;
  }

  if (level.editCode) {
    generateTurtleCodeFromJS();
  } else {
    Turtle.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    Turtle.evalCode(Turtle.code);
  }

  // api.log now contains a transcript of all the user's actions.
  BlocklyApps.playAudio('start', {loop : true});
  // animate the transcript.
  Turtle.pid = window.setTimeout(Turtle.animate, 100);

  if (BlocklyApps.usingBlockly) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }
};

/**
 * Special case: if we have a turn, followed by a move forward, then we can just
 * do the turn instantly and then begin the move forward in the same frame.
 */
function checkforTurnAndMove() {
  var nextIsForward = false;

  var currentTuple = api.log[0];
  var currentCommand = currentTuple[0];
  var currentValues = currentTuple.slice(1);

  // Check first for a small turn movement.
  if (currentCommand === 'RT') {
    var currentAngle = currentValues[0];
    if (Math.abs(currentAngle) <= 10) {
      // Check that next command is a move forward.
      if (api.log.length > 1) {
        var nextTuple = api.log[1];
        var nextCommand = nextTuple[0];
        if (nextCommand === 'FD') {
          nextIsForward = true;
        }
      }
    }
  }

  return nextIsForward;
}


/**
 * Attempt to execute one command from the log of API commands.
 */
function executeTuple () {
  if (api.log.length === 0) {
    return false;
  }

  var executeSecondTuple;

  do {
    // Unless something special happens, we will just execute a single tuple.
    executeSecondTuple = false;

    var tuple = api.log[0];
    var command = tuple[0];
    var id = tuple[tuple.length-1];

    BlocklyApps.highlight(String(id));

    // Should we execute another tuple in this frame of animation?
    if (skin.consolidateTurnAndMove && checkforTurnAndMove()) {
      executeSecondTuple = true;
    }

    // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.
    var tupleDone = Turtle.step(command, tuple.slice(1), {smoothAnimate: skin.smoothAnimate && !executeSecondTuple});
    Turtle.display();

    if (tupleDone) {
      api.log.shift();
      resetStepInfo();
    }
  } while (executeSecondTuple);

  return true;
}

/**
 * Handle the tasks to be done after the user program is finished.
 */
function finishExecution () {
  document.getElementById('spinner').style.visibility = 'hidden';
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  Turtle.checkAnswer();
}

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
Turtle.animate = function() {

  // All tasks should be complete now.  Clean up the PID list.
  Turtle.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - Turtle.speedSlider.getValue(), 2) / skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  Turtle.smoothAnimateStepSize = (stepSpeed === 0 ?
    FAST_SMOOTH_ANIMATE_STEP_SIZE : SMOOTH_ANIMATE_STEP_SIZE);

  if (level.editCode) {
    var stepped = true;
    while (stepped) {
      codegen.selectCurrentCode(Turtle.interpreter,
                                BlocklyApps.editor,
                                Turtle.cumulativeLength,
                                Turtle.userCodeStartOffset,
                                Turtle.userCodeLength);
      try {
        stepped = Turtle.interpreter.step();
      }
      catch(err) {
        Turtle.executionError = err;
        finishExecution();
        return;
      }
      stepped = Turtle.interpreter.step();

      if (executeTuple()) {
        // We stepped far enough that we executed a commmand, break out:
        break;
      }
    }
    if (!stepped && !executeTuple()) {
      // We dropped out of the step loop because we ran out of code, all done:
      finishExecution();
      return;
    }
  } else {
    if (!executeTuple()) {
      finishExecution();
      return;
    }
  }

  Turtle.pid = window.setTimeout(Turtle.animate, stepSpeed);
};

Turtle.calculateSmoothAnimate = function(options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = Turtle.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = Turtle.smoothAnimateStepSize;

    if (fullDistance < 0) {
      // Going backward.
      if (stepDistanceCovered - smoothAnimateStepSize <= fullDistance) {
        // clamp at maximum
        distance = fullDistance - stepDistanceCovered;
        stepDistanceCovered = fullDistance;
      } else {
        distance = -smoothAnimateStepSize;
        stepDistanceCovered -= smoothAnimateStepSize;
        tupleDone = false;
      }

    } else {
      // Going foward.
      if (stepDistanceCovered + smoothAnimateStepSize >= fullDistance) {
        // clamp at maximum
        distance = fullDistance - stepDistanceCovered;
        stepDistanceCovered = fullDistance;
      } else {
        distance = smoothAnimateStepSize;
        stepDistanceCovered += smoothAnimateStepSize;
        tupleDone = false;
      }
    }
  }

  Turtle.stepDistanceCovered = stepDistanceCovered;

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
Turtle.step = function(command, values, options) {
  var tupleDone = true;
  var result;
  var distance;
  var heading;

  switch (command) {
    case 'FD':  // Forward
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.moveForward_(result.distance);
      break;
    case 'JF':  // Jump forward
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.jumpForward_(result.distance);
      break;
    case 'MV':  // Move (direction)
      distance = values[0];
      heading = values[1];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.moveForward_(result.distance);
      break;
    case 'JD':  // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.setHeading_(heading);
      Turtle.jumpForward_(result.distance);
      break;
    case 'RT':  // Right Turn
      distance = values[0];
      result = Turtle.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      Turtle.turnByDegrees_(result.distance);
      break;
    case 'DP':  // Draw Print
      Turtle.ctxScratch.save();
      Turtle.ctxScratch.translate(Turtle.x, Turtle.y);
      Turtle.ctxScratch.rotate(2 * Math.PI * (Turtle.heading - 90) / 360);
      Turtle.ctxScratch.fillText(values[0], 0, 0);
      Turtle.ctxScratch.restore();
      break;
    case 'DF':  // Draw Font
      Turtle.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':  // Pen Up
      Turtle.penDownValue = false;
      break;
    case 'PD':  // Pen Down
      Turtle.penDownValue = true;
      break;
    case 'PW':  // Pen Width
      Turtle.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':  // Pen Colour
      Turtle.ctxScratch.strokeStyle = values[0];
      Turtle.ctxScratch.fillStyle = values[0];
      if (skin.id != "anna" && skin.id != "elsa") {
        Turtle.isDrawingWithPattern = false;
      }
      break;
    case 'PS':  // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
          Turtle.setPattern(null);
      } else {
        Turtle.setPattern(values[0]);
      }
      break;
    case 'HT':  // Hide Turtle
      Turtle.visible = false;
      break;
    case 'ST':  // Show Turtle
      Turtle.visible = true;
      break;
    case 'stamp':
      var img = Turtle.stamps[values[0]];
      var width = img.width / 2;
      var height = img.height / 2;
      var x = Turtle.x - width / 2;
      var y = Turtle.y - height / 2;
      if (img.width !== 0) {
        Turtle.ctxScratch.drawImage(img, x, y, width, height);
      }
      break;
  }

  return tupleDone;
};

Turtle.setPattern = function (pattern) {
  if (Turtle.loadedPathPatterns[pattern]) {
    Turtle.currentPathPattern = Turtle.loadedPathPatterns[pattern];
    Turtle.isDrawingWithPattern = true;
  } else if (pattern === null) {
    Turtle.currentPathPattern = new Image();
    Turtle.isDrawingWithPattern = false;
  }
};

Turtle.jumpForward_ = function (distance) {
  Turtle.x += distance * Math.sin(2 * Math.PI * Turtle.heading / 360);
  Turtle.y -= distance * Math.cos(2 * Math.PI * Turtle.heading / 360);
};

Turtle.moveByRelativePosition_ = function (x, y) {
  Turtle.x += x;
  Turtle.y += y;
};

Turtle.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  Turtle.ctxScratch.lineTo(x + dotLineLength, y);
};

Turtle.circleAt_ = function (x, y, radius) {
  Turtle.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

Turtle.drawToTurtle_ = function (distance) {
  var isDot = (distance === 0);
  if (isDot) {
    Turtle.dotAt_(Turtle.x, Turtle.y);
  } else {
    Turtle.ctxScratch.lineTo(Turtle.x * retina, Turtle.y * retina);
  }
};

Turtle.turnByDegrees_ = function (degreesRight) {
  Turtle.setHeading_(Turtle.heading + degreesRight);
};

Turtle.setHeading_ = function (heading) {
  heading = Turtle.constrainDegrees_(heading);
  Turtle.heading = heading;
};

Turtle.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

Turtle.moveForward_ = function (distance) {
  if (!Turtle.penDownValue) {
    Turtle.jumpForward_(distance);
    return;
  }
  if (Turtle.isDrawingWithPattern) {
    Turtle.drawForwardLineWithPattern_(distance);

    // Frozen gets both a pattern and a line over the top of it.
    if (skin.id != "elsa" && skin.id != "anna") {
      return;
    }
  }

  Turtle.drawForward_(distance);
};

Turtle.drawForward_ = function (distance) {
  if (Turtle.shouldDrawJoints_()) {
    Turtle.drawForwardWithJoints_(distance);
  } else {
    Turtle.drawForwardLine_(distance);
  }
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
Turtle.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      Turtle.drawJointAtTurtle_();
    }

    Turtle.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      Turtle.drawJointAtTurtle_();
    }
  }
};

Turtle.drawForwardLine_ = function (distance) {

  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxScratch.beginPath();
    Turtle.ctxScratch.moveTo(Turtle.stepStartX * retina, Turtle.stepStartY * retina);
    Turtle.jumpForward_(distance);
    Turtle.drawToTurtle_(distance);
    Turtle.ctxScratch.stroke();
  } else {
    Turtle.ctxScratch.beginPath();
    Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
    Turtle.jumpForward_(distance);
    Turtle.drawToTurtle_(distance);
    Turtle.ctxScratch.stroke();
  }

};

Turtle.drawForwardLineWithPattern_ = function (distance) {
  var img;
  var startX;
  var startY;

  if (skin.id == "anna" || skin.id == "elsa") {
    Turtle.ctxPattern.moveTo(Turtle.stepStartX * retina, Turtle.stepStartY * retina);
    img = Turtle.currentPathPattern;
    startX = Turtle.stepStartX;
    startY = Turtle.stepStartY;

    var lineDistance = Math.abs(Turtle.stepDistanceCovered);

    Turtle.ctxPattern.save();
    Turtle.ctxPattern.translate(startX * retina, startY * retina);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    Turtle.ctxPattern.rotate(Math.PI * (Turtle.heading - 90) / 180);

    var clipSize;
    if (lineDistance % Turtle.smoothAnimateStepSize === 0) {
      clipSize = Turtle.smoothAnimateStepSize;
    } else if (lineDistance > Turtle.smoothAnimateStepSize) {
      // this happens when our line was not divisible by smoothAnimateStepSize
      // and we've hit our last chunk
      clipSize = lineDistance % Turtle.smoothAnimateStepSize;
    } else {
      clipSize = lineDistance;
    }
    if (img.width !== 0) {
      Turtle.ctxPattern.drawImage(img,
        // Start point for clipping image
        Math.round(lineDistance * retina), 0,
        // clip region size
        clipSize * retina, img.height,
        // some mysterious hand-tweaking done by Brendan
        Math.round((Turtle.stepDistanceCovered - clipSize - 2) * retina), Math.round((- 18) * retina),
        clipSize * retina, img.height);
    }

    Turtle.ctxPattern.restore();

  } else {

    Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
    img = Turtle.currentPathPattern;
    startX = Turtle.x;
    startY = Turtle.y;

    Turtle.jumpForward_(distance);
    Turtle.ctxScratch.save();
    Turtle.ctxScratch.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    Turtle.ctxScratch.rotate(Math.PI * (Turtle.heading - 90) / 180);

    if (img.width !== 0) {
      Turtle.ctxScratch.drawImage(img,
        // Start point for clipping image
        0, 0,
        // clip region size
        distance+img.height / 2, img.height,
        // draw location relative to the ctx.translate point pre-rotation
        -img.height / 4, -img.height / 2,
        distance+img.height / 2, img.height);
    }

    Turtle.ctxScratch.restore();
  }
};

Turtle.shouldDrawJoints_ = function () {
  return level.isK1 && !Turtle.isPredrawing_;
};

Turtle.drawJointAtTurtle_ = function () {
  Turtle.ctxScratch.beginPath();
  Turtle.ctxScratch.moveTo(Turtle.x, Turtle.y);
  Turtle.circleAt_(Turtle.x, Turtle.y, JOINT_RADIUS);
  Turtle.ctxScratch.stroke();
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @param {number} permittedErrors Number of pixels allowed to be wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
var isCorrect = function(pixelErrors, permittedErrors) {
  return pixelErrors <= permittedErrors;
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    // For frozen skins, show background and characters along with drawing
    feedbackImageCanvas = Turtle.ctxDisplay;
  } else {
    feedbackImageCanvas = Turtle.ctxScratch;
  }

  BlocklyApps.displayFeedback({
    app: 'turtle', //XXX
    skin: skin.id,
    feedbackType: Turtle.testResults,
    message: Turtle.message,
    response: Turtle.response,
    level: level,
    feedbackImage: getFeedbackImage(),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && Turtle.response && Turtle.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: turtleMsg.reinfFeedbackMsg(),
      sharingText: turtleMsg.shareDrawing()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Turtle.onReportComplete = function(response) {
  Turtle.response = response;
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  displayFeedback();
};

// This removes lengths from the text version of the XML of programs.
// It is used to determine if the user program and model solution are
// identical except for lengths.
var removeK1Lengths = function(s) {
  return s.replace(removeK1Lengths.regex, '">');
};

removeK1Lengths.regex = /_length"><title name="length">.*?<\/title>/;

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Turtle.checkAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage =
      Turtle.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage =
      Turtle.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var len = Math.min(userImage.data.length, answerImage.data.length);
  var delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (var i = 3; i < len; i += 4) {
    // Copying and compositing images across canvases seems to distort the
    // alpha. Use a large error value (250) to compensate.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 250) {
      delta++;
    }
  }

  // Allow some number of pixels to be off, but be stricter
  // for certain levels.
  var permittedErrors = level.permittedErrors;
  if (permittedErrors === undefined) {
    permittedErrors = 150;
  }

  // Test whether the current level is a free play level, or the level has
  // been completed
  var levelComplete = (level.freePlay || isCorrect(delta, permittedErrors)) &&
                        (!level.editCode || !Turtle.executionError);
  Turtle.testResults = BlocklyApps.getTestResults(levelComplete);

  var program;
  if (BlocklyApps.usingBlockly) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  Turtle.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !BlocklyApps.editCode &&
      level.solutionBlocks &&
      removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
    Turtle.testResults = BlocklyApps.TestResults.APP_SPECIFIC_ERROR;
    Turtle.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks &&
      Turtle.testResults == BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    // TODO: Add more helpful error message.
    Turtle.testResults = BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL;

  } else if ((Turtle.testResults ==
      BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) ||
      (Turtle.testResults == BlocklyApps.TestResults.ALL_PASS)) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue && BlocklyApps.usingBlockly) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        Turtle.testResults =
            BlocklyApps.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        Turtle.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = BlocklyApps.editor.getValue();
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Turtle.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  // Play sound
  BlocklyApps.stopLoopingAudio('start');
  if (Turtle.testResults === BlocklyApps.TestResults.FREE_PLAY ||
      Turtle.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: Turtle.testResults,
    program: encodeURIComponent(program),
    onComplete: Turtle.onReportComplete,
    save_to_gallery: level.impressive
  };

  // Get the canvas data for feedback.
  if (Turtle.testResults >= BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL) {
    reportData.image = getFeedbackImage();
  }

  BlocklyApps.report(reportData);

  if (BlocklyApps.usingBlockly) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

var getFeedbackImage = function() {
  var feedbackImageCanvas;
  if (skin.id == "anna" || skin.id == "elsa") {
    feedbackImageCanvas = Turtle.ctxDisplay;
  } else {
    feedbackImageCanvas = Turtle.ctxScratch;
  }

  // Copy the user layer
  Turtle.ctxFeedback.globalCompositeOperation = 'copy';
  Turtle.ctxFeedback.drawImage(feedbackImageCanvas.canvas, 0, 0, 154, 154);
  var feedbackCanvas = Turtle.ctxFeedback.canvas;
  try {
    return encodeURIComponent(
        feedbackCanvas.toDataURL("image/png").split(',')[1]);
  } catch (e) { /* Can't read pixels from filesystem images in offline mode */ }
};

},{"../base":3,"../codegen":28,"../feedback.js":47,"../templates/page.html":116,"../utils":136,"./api":124,"./controls.html":126,"./core":127,"./levels":129}],129:[function(require,module,exports){
var levelBase = require('../level_base');
var Colours = require('./core').Colours;
var answer = require('./answers').answer;
var msg = window.blockly.appLocale;
var blockUtils = require('../block_utils');
var utils = require('../utils');

// An early hack introduced some levelbuilder levels as page 5, level 7. Long
// term we can probably do something much cleaner, but for now I'm calling
// out that this level is special (on page 5).
var LEVELBUILDER_LEVEL = 7;

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function(page, level) {
  return require('./toolbox.xml')({
    page: page,
    level: level
  });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function(page, level) {
  return require('./startBlocks.xml')({
    page: page,
    level: level
  });
};

var req = require('./requiredBlocks');
var makeMathNumber = req.makeMathNumber;
var simpleBlock = req.simpleBlock;
var repeat = req.repeat;
var drawASquare = req.drawASquare;
var drawASnowman = req.drawASnowman;
var MOVE_FORWARD_INLINE = req.MOVE_FORWARD_INLINE;
var MOVE_FORWARD_OR_BACKWARD_INLINE = req.MOVE_FORWARD_OR_BACKWARD_INLINE;
var moveForwardInline = req.moveForwardInline;
var MOVE_BACKWARD_INLINE = req.MOVE_BACKWARD_INLINE;
var turnLeftRestricted = req.turnLeftRestricted;
var turnRightRestricted = req.turnRightRestricted;
var turnRightByConstant = req.turnRightByConstant;
var turnRight = req.turnRight;
var turnLeft = req.turnLeft;
var move = req.move;
var drawTurnRestricted = req.drawTurnRestricted;
var drawTurn = req.drawTurn;
var SET_COLOUR_PICKER = req.SET_COLOUR_PICKER;
var SET_COLOUR_RANDOM = req.SET_COLOUR_RANDOM;
var defineWithArg = req.defineWithArg;

var blocks = {
  SIMPLE_MOVE_UP: blockUtils.blockOfType('simple_move_up'),
  SIMPLE_MOVE_DOWN: blockUtils.blockOfType('simple_move_down'),
  SIMPLE_MOVE_LEFT: blockUtils.blockOfType('simple_move_left'),
  SIMPLE_MOVE_RIGHT: blockUtils.blockOfType('simple_move_right'),
  SIMPLE_JUMP_UP: blockUtils.blockOfType('simple_jump_up'),
  SIMPLE_JUMP_DOWN: blockUtils.blockOfType('simple_jump_down'),
  SIMPLE_JUMP_LEFT: blockUtils.blockOfType('simple_jump_left'),
  SIMPLE_JUMP_RIGHT: blockUtils.blockOfType('simple_jump_right'),
  SIMPLE_MOVE_UP_LENGTH: blockUtils.blockOfType('simple_move_up_length'),
  SIMPLE_MOVE_DOWN_LENGTH: blockUtils.blockOfType('simple_move_down_length'),
  SIMPLE_MOVE_LEFT_LENGTH: blockUtils.blockOfType('simple_move_left_length'),
  SIMPLE_MOVE_RIGHT_LENGTH: blockUtils.blockOfType('simple_move_right_length'),
  simpleMoveBlocks: function() {
    return this.SIMPLE_MOVE_UP +
      this.SIMPLE_MOVE_DOWN +
      this.SIMPLE_MOVE_LEFT +
      this.SIMPLE_MOVE_RIGHT;
  },
  simpleJumpBlocks: function() {
    return this.SIMPLE_JUMP_UP +
      this.SIMPLE_JUMP_DOWN +
      this.SIMPLE_JUMP_LEFT +
      this.SIMPLE_JUMP_RIGHT;
  },
  simpleMoveLengthBlocks: function() {
    return this.SIMPLE_MOVE_UP_LENGTH +
      this.SIMPLE_MOVE_DOWN_LENGTH +
      this.SIMPLE_MOVE_LEFT_LENGTH +
      this.SIMPLE_MOVE_RIGHT_LENGTH;
  }
};

/**
 * Information about level-specific requirements.
 */
var levels = module.exports = {
  // Level 1: El.
  '1_1': {
    answer: answer(1, 1),
    ideal: 4,
    toolbox: toolbox(1, 1),
    startBlocks: startBlocks(1, 1),
    requiredBlocks: [[MOVE_FORWARD_INLINE], [turnRightRestricted(90)]],
    freePlay: false
  },
  // Level 2: Square (without repeat).
  '1_2': {
    answer: answer(1, 2),
    ideal: 11,
    toolbox: toolbox(1, 2),
    startBlocks: startBlocks(1, 2),
    requiredBlocks: [
      [MOVE_FORWARD_INLINE],
      [turnRightRestricted(90)]
    ],
    freePlay: false
  },
  // Level 3: Square (with repeat).
  '1_3': {
    answer: answer(1, 3),
    ideal: 4,
    toolbox: toolbox(1, 3),
    startBlocks: startBlocks(1, 3),
    requiredBlocks: [
      [MOVE_FORWARD_INLINE],
      [turnRightRestricted(90)],
      [repeat(4)]
    ],
    freePlay: false
  },
  // Level 4: Triangle.
  '1_4': {
    answer: answer(1, 4),
    ideal: 6,
    toolbox: toolbox(1, 4),
    startBlocks: startBlocks(1, 4),
    requiredBlocks: [
      [MOVE_FORWARD_OR_BACKWARD_INLINE],
      [repeat(3)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn_by_constant_restricted';
        },
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
    freePlay: false
  },
  // Level 5: Envelope.
  '1_5': {
    answer: answer(1, 5),
    ideal: 7,
    toolbox: toolbox(1, 5),
    startBlocks: startBlocks(1, 5),
    requiredBlocks: [
      [repeat(3)],
      [turnRightRestricted(120)],
      [MOVE_FORWARD_INLINE]
    ],
    freePlay: false
  },
  // Level 6: triangle and square.
  '1_6': {
    answer: answer(1, 6),
    ideal: 8,
    toolbox: toolbox(1, 6),
    startBlocks: startBlocks(1, 6),
    requiredBlocks: [
      [repeat(3)],
      [turnRightRestricted(120), turnLeftRestricted(120)],
      [MOVE_FORWARD_INLINE, MOVE_BACKWARD_INLINE]
    ],
    freePlay: false
  },
  // Level 7: glasses.
  '1_7': {
    answer: answer(1, 7),
    ideal: 13,
    toolbox: toolbox(1, 7),
    startBlocks: startBlocks(1, 7),
    requiredBlocks: [
      [drawTurnRestricted(90)],
      [MOVE_FORWARD_INLINE],
      [repeat(4)],
      [MOVE_BACKWARD_INLINE, MOVE_FORWARD_INLINE]
    ],
    freePlay: false,
    startDirection: 0
  },
  // Level 8: spikes.
  '1_8': {
    answer: answer(1, 8),
    ideal: 7,
    toolbox: toolbox(1, 8),
    startBlocks: startBlocks(1, 8),
    requiredBlocks: [[repeat(8)]],
    freePlay: false
  },
  // Level 9: circle.
  '1_9': {
    answer: answer(1, 9),
    ideal: 6,
    toolbox: toolbox(1, 9),
    startBlocks: startBlocks(1, 9),
    requiredBlocks: [],
    freePlay: false,
    sliderSpeed: 0.9,
    permittedErrors: 10,
    failForCircleRepeatValue: true
  },
  // Level 10: playground.
  '1_10': {
    answer: answer(1, 10),
    toolbox: toolbox(1, 10),
    startBlocks: startBlocks(1, 10),
    requiredBlocks: [],
    freePlay: true
  },
  // Formerly Page 2.
  // Level 1: Square.
  '2_1': {
    answer: answer(2, 1),
    ideal: 8,
    toolbox: toolbox(2, 1),
    startBlocks: startBlocks(2, 1),
    requiredBlocks: [
      [repeat(4)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn';
        },
        type: 'draw_turn',
        titles: {'DIR': 'turnRight'},
        values: {'VALUE': makeMathNumber(90)}
      }],
      [{
        // allow move forward or backward, but show forward block if they've done neither
        test: function(block) {
          return block.type == 'draw_move';
        },
        type: 'draw_move',
        values: {'VALUE': makeMathNumber(100)}
      }]
    ],
    freePlay: false
  },
  // Level 2: Small green square.
  '2_2': {
    answer: answer(2, 2),
    ideal: 5,
    toolbox: toolbox(2, 2),
    startBlocks: startBlocks(2, 2),
    requiredBlocks: [
      [drawASquare('??')]
    ],
    freePlay: false
  },
  // Level 3: Three squares.
  '2_3': {
    answer: answer(2, 3),
    ideal: 8,
    toolbox: toolbox(2, 3),
    startBlocks: startBlocks(2, 3),
    requiredBlocks: [
      [repeat(3)],
      [drawASquare(100)],
      [drawTurn()]
    ],
    freePlay: false
  },
  // Level 4: 36 squares.
  '2_4': {
    answer: answer(2, 4),
    ideal: 8,
    toolbox: toolbox(2, 4),
    startBlocks: startBlocks(2, 4),
    freePlay: false,
    impressive: true
  },
  // Level 5: Different size squares.
  '2_5': {
    answer: answer(2, 5),
    ideal: 11,
    toolbox: toolbox(2, 5),
    startBlocks: startBlocks(2, 5),
    requiredBlocks: [
      [drawASquare('??')]
    ],
    freePlay: false
  },
  // Level 6: For-loop squares.
  '2_6': {
    answer: answer(2, 6),
    ideal: 7,
    toolbox: toolbox(2, 6),
    startBlocks: startBlocks(2, 6),
    // This is not displayed properly.
    requiredBlocks: [[simpleBlock('variables_get_counter')]],
    freePlay: false
  },
  // Level 7: Boxy spiral.
  '2_7': {
    minWorkspaceHeight: 1200,
    answer: answer(2, 7),
    ideal: 9,
    toolbox: toolbox(2, 7),
    startBlocks: startBlocks(2, 7),
    requiredBlocks: [
      [simpleBlock('controls_for_counter')],
      [move('??')],
      [simpleBlock('variables_get_counter')],
      [turnRight(90)]
    ],
    freePlay: false
  },
  // Prep for Level 8: Two snowmen.
  '2_7_5': {
    answer: answer(2, 7.5),
    initialY: 300,
    ideal: 5,
    toolbox: toolbox(2, 8),
    startBlocks: startBlocks(2, 7.5),
    requiredBlocks: [
      [drawASnowman(250)],
      [drawASnowman(100)]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 8: Three snowmen.
  '2_8': {
    answer: answer(2, 8),
    initialX: 100,
    ideal: 12,
    toolbox: toolbox(2, 8),
    startBlocks: startBlocks(2, 8),
    requiredBlocks: [
      [drawASnowman(150)],
      [turnRight(90)],
      [turnLeft(90)],
      [{
        test: 'jump',
        type: 'jump',
        values: {'VALUE': makeMathNumber(100)}
      }],
      [simpleBlock('jump')],
      [repeat(3)]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 9: Snowman family.
  '2_9': {
    answer: answer(2, 9),
    initialX: 100,
    ideal: 13,
    toolbox: toolbox(2, 9),
    startBlocks: startBlocks(2, 9),
    requiredBlocks: [
      [drawASnowman('??')],
      [simpleBlock('controls_for_counter')],
      [simpleBlock('variables_get_counter')],
      [turnRight(90)],
      [turnLeft(90)],
      [{
        test: 'jump',
        type: 'jump',
        values: {'VALUE': makeMathNumber(60)}
      }]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 10: playground.
  '2_10': {
    answer: answer(2, 10),
    freePlay: true,
    toolbox: toolbox(2, 10),
    startBlocks: startBlocks(2, 10)
  },
  // Formerly Page 3.
  // Level 1: Call 'draw a square'.
  '3_1': {
    answer: answer(3, 1),
    ideal: 14,
    toolbox: toolbox(3, 1),
    startBlocks: startBlocks(3, 1),
    requiredBlocks: [
      [levelBase.call(msg.drawASquare())]
    ],
    freePlay: false
  },
  // Level 2: Create "draw a triangle".
  '3_2': {
    answer: answer(3, 2),
    ideal: 14,
    toolbox: toolbox(3, 2),
    startBlocks: startBlocks(3, 2),
    requiredBlocks: [
      [repeat(3)],
      [move(100)],
      [turnRight(120)],
      [levelBase.call(msg.drawATriangle())]
    ],
    freePlay: false
  },
  // Level 3: Fence the animals.
  '3_3': {
    answer: answer(3, 3),
    initialY: 350,
    ideal: 20,
    toolbox: toolbox(3, 3),
    startBlocks: startBlocks(3, 3),
    requiredBlocks: [
      [levelBase.call(msg.drawATriangle())],
      [move(100)],
      [levelBase.call(msg.drawASquare())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [170, 247]
      },
      {
        filename: 'cat.svg',
        position: [170, 47]
      },
      {
        filename: 'cow.svg',
        position: [182, 147]
      }
    ],
    startDirection: 0
  },
  // Level 4: House the lion.
  '3_4': {
    answer: answer(3, 4),
    ideal: 19,
    toolbox: toolbox(3, 4),
    startBlocks: startBlocks(3, 4),
    requiredBlocks: [
      [levelBase.call(msg.drawASquare())],
      [move(100)],
      [turnRight(30)],
      [levelBase.call(msg.drawATriangle())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'lion.svg',
        position: [195, 97]
      }
    ],
    startDirection: 0
  },
  // Level 5: Create "draw a house".
  '3_5': {
    answer: answer(3, 5),
    ideal: 21,
    toolbox: toolbox(3, 5),
    startBlocks: startBlocks(3, 5),
    requiredBlocks: [
      [levelBase.define(msg.drawAHouse())],
      [levelBase.call(msg.drawASquare())],
      [move(100)],
      [turnRight(30)],
      [levelBase.call(msg.drawATriangle())],
      [levelBase.call(msg.drawAHouse())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [170, 90]
      },
      {
        filename: 'cat.svg',
        position: [222, 90]
      }
    ],
    startDirection: 0
  },
  // Level 6: Add parameter to "draw a triangle".
  '3_6': {
    answer: answer(3, 6),
    initialY: 350,
    ideal: 23,
    toolbox: toolbox(3, 6),
    startBlocks: startBlocks(3, 6),
    requiredBlocks: [
      [defineWithArg(msg.drawATriangle(), msg.lengthParameter())],
      [simpleBlock('variables_get_length')],
      [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())]
    ],
    disableParamEditing: false,
    freePlay: false,
    images: [
      {
        filename: 'lion.svg',
        position: [185, 100]
      },
      {
        filename: 'cat.svg',
        position: [175, 248]
      }
    ],
    startDirection: 0
  },
  // Level 7: Add parameter to "draw a house".
  '3_7': {
    answer: answer(3, 7),
    initialY: 350,
    ideal: 24,
    toolbox: toolbox(3, 7),
    startBlocks: startBlocks(3, 7),
    requiredBlocks: [
      [defineWithArg(msg.drawAHouse(), msg.lengthParameter())],
      [levelBase.callWithArg(msg.drawASquare(), msg.lengthParameter())],
      [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())],
      [simpleBlock('variables_get_length')],
      [levelBase.callWithArg(msg.drawAHouse(), msg.lengthParameter())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'elephant.svg',
        position: [205, 220]
      }
    ],
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 8: Draw houses.
  '3_8': {
    minWorkspaceHeight: 1200,
    answer: answer(3, 8),
    initialX: 20,
    initialY: 350,
    ideal: 40,
    toolbox: toolbox(3, 8),
    startBlocks: startBlocks(3, 8),
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [16, 170]
      },
      {
        filename: 'lion.svg',
        position: [15, 250]
      },
      {
        filename: 'elephant.svg',
        position: [127, 220]
      },
      {
        filename: 'cow.svg',
        position: [255, 250]
      }
    ],
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 9: Draw houses with for loop.
  '3_9': {
    minWorkspaceHeight: 1200,
    answer: answer(3, 9),
    initialX: 20,
    initialY: 350,
    ideal: 40,
    toolbox: toolbox(3, 9),
    startBlocks: startBlocks(3, 9),
    requiredBlocks: [
      [simpleBlock('controls_for_counter')],
      [simpleBlock('variables_get_counter')]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [-10, 270]
      },
      {
        filename: 'cow.svg',
        position: [53, 250]
      },
      {
        filename: 'elephant.svg',
        position: [175, 220]
      }
    ],
    failForTooManyBlocks: true,
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 10: playground.
  '3_10': {
    minWorkspaceHeight: 1600,
    answer: answer(3, 10),
    freePlay: true,
    toolbox: toolbox(3, 10),
    startBlocks: startBlocks(3, 10)
  },
  // Formerly Page 4.
  // Level 1: One triangle.
  '4_1': {
    answer: answer(4, 1),
    ideal: 4,
    toolbox: toolbox(4, 1),
    startBlocks: startBlocks(4, 1),
    requiredBlocks: [
      [MOVE_FORWARD_OR_BACKWARD_INLINE],
      [repeat(3)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn_by_constant';
        },
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
  },
  // Level 2: Two triangles.
  '4_2': {
    answer: answer(4, 2),
    ideal: 12,
    toolbox: toolbox(4, 2),
    startBlocks: startBlocks(4, 2),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.5
  },
  // Level 3: Four triangles using repeat.
  '4_3': {
    answer: answer(4, 3),
    ideal: 8,
    toolbox: toolbox(4, 3),
    startBlocks: startBlocks(4, 3),
    requiredBlocks: [
      [repeat(4)],
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.7
  },
  // Level 4: Ten triangles with missing repeat number.
  '4_4': {
    answer: answer(4, 4),
    ideal: 8,
    toolbox: toolbox(4, 4),
    startBlocks: startBlocks(4, 4),
    requiredBlocks: [
      [repeat('???')]
    ],
    sliderSpeed: 0.7,
    impressive: true
  },
  // Level 5: 36 triangles with missing angle number.
  '4_5': {
    answer: answer(4, 5),
    ideal: 8,
    toolbox: toolbox(4, 5),
    startBlocks: startBlocks(4, 5),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.9,
    impressive: true
  },
  // Level 6: 1 square.
  '4_6': {
    answer: answer(4, 6),
    ideal: 4,
    toolbox: toolbox(4, 6),
    startBlocks: startBlocks(4, 6),
    requiredBlocks: [
      [moveForwardInline(20)],
      [repeat(4)],
      [{
        test: 'turnRight',
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
    permittedErrors: 10,
    startDirection: 0
  },
  // Level 7: Square Ladder.
  '4_7': {
    answer: answer(4, 7),
    initialY: 300,
    ideal: 8,
    toolbox: toolbox(4, 7),
    startBlocks: startBlocks(4, 7),
    requiredBlocks: [
      [moveForwardInline(20)],
      [repeat(10)]
    ],
    startDirection: 0,
    sliderSpeed: 0.7
  },
  // Level 8: Ladder square.
  '4_8': {
    answer: answer(4, 8),
    initialX: 100,
    initialY: 300,
    ideal: 10,
    toolbox: toolbox(4, 8),
    startBlocks: startBlocks(4, 8),
    requiredBlocks: [
      [repeat(4)],
      [turnRightByConstant('???')]
    ],
    startDirection: 0,
    sliderSpeed: 0.9
  },
  // Level 9: Ladder square with a different angle.
  '4_9': {
    answer: answer(4, 9),
    initialX: 150,
    initialY: 350,
    ideal: 10,
    toolbox: toolbox(4, 9),
    startBlocks: startBlocks(4, 9),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    startDirection: 330,
    sliderSpeed: 0.9
  },
  // Level 10: Ladder polygon.
  '4_10': {
    answer: answer(4, 10),
    initialX: 75,
    initialY: 300,
    ideal: 10,
    toolbox: toolbox(4, 10),
    startBlocks: startBlocks(4, 10),
    requiredBlocks: [
      [repeat('???')]
    ],
    startDirection: 0,
    sliderSpeed: 0.9,
    impressive: true
  },
  // Level 11: playground.
  '4_11': {
    answer: answer(4, 11),
    freePlay: true,
    initialX: 75,
    initialY: 300,
    toolbox: toolbox(4, 11),
    startBlocks: startBlocks(4, 11),
    requiredBlocks : [],
    startDirection: 0,
    sliderSpeed: 0.9
   },

  // Formerly Page 5.
  // Level 1: playground.
  '5_1': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 1),
    freePlay: true,
    toolbox: toolbox(5, 1),
    startBlocks: startBlocks(5, 1),
    sliderSpeed: 0.9
  },
  // Level 2: playground.
  '5_2': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 2),
    freePlay: true,
    toolbox: toolbox(5, 2),
    startBlocks: startBlocks(5, 2),
    sliderSpeed: 1.0
  },
  // Level 3: playground.
  '5_3': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 3),
    freePlay: true,
    toolbox: toolbox(5, 3),
    startBlocks: startBlocks(5, 3),
    sliderSpeed: 1.0
  },
  // Level 4: playground.
  '5_4': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 4),
    freePlay: true,
    toolbox: toolbox(5, 4),
    startBlocks: startBlocks(5, 4),
    sliderSpeed: 1.0
  },
  // Level 5: playground.
  '5_5': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 5),
    freePlay: true,
    toolbox: toolbox(5, 5),
    startBlocks: startBlocks(5, 5),
    sliderSpeed: 1.0
  },
  // Level 6: playground.
  '5_6': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 6),
    freePlay: true,
    initialY: 300,
    toolbox: toolbox(5, 6),
    startBlocks: startBlocks(5, 6),
    startDirection: 0,
    sliderSpeed: 1.0
  },
  // The level for building new levels.
  'builder': {
    answer: [],
    freePlay: true,
    initialY: 300,
    toolbox: toolbox(5, LEVELBUILDER_LEVEL),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  },
  // The default level newly created levels use.
  'custom': {
    answer: [],
    freePlay: false,
    initialY: 300,
    toolbox: toolbox(5, LEVELBUILDER_LEVEL),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  },
  'k1_demo': {
    answer: [],
    freePlay: false,
    initialY: 300,
    isK1: true,
    toolbox: blockUtils.createToolbox(
        blocks.simpleMoveBlocks() +
        blocks.simpleJumpBlocks() +
        blocks.simpleMoveLengthBlocks() +
        blockUtils.blockOfType('controls_repeat_simplified') +
        blockUtils.blockOfType('draw_colour_simple')
      ),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  }
};

levels.ec_1_1 = utils.extend(levels['1_1'], {
  'editCode': true,
  'codeFunctions': [
    {'func': 'moveForward', 'params': ["100"], 'idArgLast': true },
    {'func': 'turnRight', 'params': ["90"], 'idArgLast': true },
  ],
  'startBlocks': "moveForward(100);\n",
});
levels.ec_1_2 = utils.extend(levels['1_2'], {
  'editCode': true,
  'codeFunctions': [
    {'func': 'moveForward', 'params': ["100"], 'idArgLast': true },
    {'func': 'turnRight', 'params': ["90"], 'idArgLast': true },
    {'func': 'penColour', 'params': ["'#ff0000'"], 'idArgLast': true },
  ],
  'startBlocks': "penColour('#ff0000');\nmoveForward(100);\n",
});
levels.ec_1_3 = utils.extend(levels['1_3'], {
  'editCode': true,
  'codeFunctions': [
    {'func': 'moveForward', 'params': ["100"], 'idArgLast': true },
    {'func': 'turnRight', 'params': ["90"], 'idArgLast': true },
    {'func': 'penColour', 'params': ["'#ff0000'"], 'idArgLast': true },
  ],
  'startBlocks': "for (var i = 0; i < 4; i++) {\n  __\n}\n",
});
levels.ec_1_4 = utils.extend(levels['1_4'], {
  'editCode': true,
  'codeFunctions': [
    {'func': 'moveForward', 'params': ["100"], 'idArgLast': true },
    {'func': 'turnRight', 'params': ["90"], 'idArgLast': true },
    {'func': 'penColour', 'params': ["'#ff0000'"], 'idArgLast': true },
  ],
  'startBlocks': "for (var i = 0; i < 3; i++) {\n  penColour('#ff0000');\n}\n",
});
levels.ec_1_10 = utils.extend(levels['1_10'], {
  'editCode': true,
  'codeFunctions': [
    {'func': 'moveForward', 'params': ["100"], 'idArgLast': true },
    {'func': 'turnRight', 'params': ["90"], 'idArgLast': true },
    {'func': 'penColour', 'params': ["'#ff0000'"], 'idArgLast': true },
    {'func': 'penWidth', 'params': ["1"], 'idArgLast': true },
  ],
  'startBlocks': "moveForward(100);\n",
});

},{"../block_utils":4,"../level_base":65,"../utils":136,"./answers":123,"./core":127,"./requiredBlocks":131,"./startBlocks.xml":133,"./toolbox.xml":134}],134:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;

var msg = window.blockly.appLocale;
// An early hack introduced some levelbuilder levels as page 5, level 7. Long
// term we can probably do something much cleaner, but for now I'm calling
// out that this level is special (on page 5).
var LEVELBUILDER_LEVEL = 7;

/*
TOOLBOX.

PAGE 1
======
Within this page, blocks are only added, never taken away.

Level 1 [el]: Adds draw_move_by_constant and draw_turn_by_constant.
Level 2 [coloured square]: Adds draw_colour with colour_picker.
level 3 [square in three blocks]: Adds controls_repeat.
level 4 [triangle] Adds draw_colour with colour_random.
Level 5 [overlapping square and triangle (sideways envelope)]
Level 6 [envelope]
Level 7 [glasses]
Level 8 [spikes]
Level 9 [circle]
Level 10 [free play]: draw_width_inline

PAGE 2
======
Categories are introduced, with contents of:
- Actions
  - draw_move with math_number
  - draw_turn with math_number
- Color
  - draw_colour (set colour) with colour_picker
  - draw_colour (set colour) with colour_random
- Functions (added at level 2)
  - [call] draw a square
  - [call] draw a snowball (added at level 9)
- Loops
  - controls_repeat
  - controls_for (added at level 6)
- Math
  - math_number
- Variables (added at level 6)
  - get counter (added at level 9)
  - get height (added at level 7)
  - get length (levels 6 and 10)
Level 1 [square]
Level 2 [square by function call]: add "draw a square"
Level 3 [3 squares]
Level 4 [36 squares]
Level 5 [nested squares without controls_for]
Level 6 [nested squares with controls_for]
Level 7 [mini-spiral]
Level 8 [3 snowmen]: add "draw a snowman"
Level 9 [snowman family]
Level 10 [free play]

PAGE 3
======
Categories are used, with contents of:
- Actions
  - draw_move with math_number
  - draw_turn with math_number
- Color
  - draw_colour (set colour) with colour_picker
  - draw_colour (set colour) with colour_random
- Functions (Replaced with custom category at level 2)
  - [call] draw a circle
  - [call] draw a square
- Loops
  - controls_for
  - controls_repeat
- Math
  - math_number
- Variables (added at level 6)
  - get counter
Variables and functions are manually added until Levels 7 and 8,
when the custom categories are used
Level 1 [call "draw a square"]
Level 2 [create and call "draw a triangle"]
Level 3 [use "draw a square" and "draw a triangle" to fence animals]
Level 4 [draw a house]
Level 5 [create and call "draw a house"]
Level 6 [add parameter to "draw a triangle"]
Level 7 [add parameter to "draw a house"]
Level 8 [modify end location of "create a house"]
Level 9 [call "draw a house" with for loop]
Level 10 [free play]

*/; buf.push('<xml id="toolbox" style="display: none;">\n  ');92; if (page == 1) {; buf.push('    <block type="draw_move_by_constant"></block>\n    <block type="draw_turn_by_constant');93; if (level <= 8) { ; buf.push('_restricted');93; } ; buf.push('">\n      <title name="VALUE">90</title>\n    </block>\n    ');96; if (level >= 2) {; buf.push('      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_picker"></block>\n        </value>\n      </block>\n    ');101; }; buf.push('    ');101; if (level >= 4) { /* Out of numeric order to make colour blocks adjacent. */; buf.push('      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_random"></block>\n        </value>\n      </block>\n    ');106; }; buf.push('    ');106; if (level >= 3) {; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">4</title>\n      </block>\n    ');109; }; buf.push('    ');109; if (level == 10) {; buf.push('      <block id="draw-width" type="draw_width_inline" x="158" y="67">\n        <title name="WIDTH">1</title>\n      </block>\n    ');112; }; buf.push('  ');112; } else if (page == 2 || page == 3) {; buf.push('    ');112; // Actions: draw_move, draw_turn.
; buf.push('    <category id="actions" name="', escape((112,  msg.catTurtle() )), '">\n      <block type="draw_move">\n        <value name="VALUE">\n          <block type="math_number">\n            <title name="NUM">100</title>\n          </block>\n        </value>\n      </block>\n      ');120; if (page == 2 && level >= 8) {; buf.push('        <block type="jump">\n          <value name="VALUE">\n            <block type="math_number">\n              <title name="NUM">50</title>\n            </block>\n          </value>\n        </block>\n      ');127; }; buf.push('      <block type="draw_turn">\n        <value name="VALUE">\n          <block type="math_number">\n            <title name="NUM">90</title>\n          </block>\n        </value>\n      </block>\n      ');134; if (level == 10) {; buf.push('        <block id="draw-width" type="draw_width_inline">\n          <title name="WIDTH">1</title>\n        </block>\n      ');137; }; buf.push('    </category>\n    ');138; // Colour: draw_colour with colour_picker and colour_random.
; buf.push('    <category name="', escape((138,  msg.catColour() )), '">\n      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_picker"></block>\n        </value>\n      </block>\n      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_random"></block>\n        </value>\n      </block>\n    </category>\n    ');150; // Functions differ depending on page and level.
; buf.push('    ');150; if (page == 2 && level >= 2) {; buf.push('      <category name="', escape((150,  msg.catProcedures() )), '">\n        <block type="draw_a_square" inline="true">\n          <value name="VALUE">\n            <block type="math_number">\n              <title name="NUM">100</title>\n            </block>\n          </value>\n        </block>\n        ');158; if (level >= 8) {; buf.push('          <block type="draw_a_snowman" inline="true">\n            <value name="VALUE">\n              <block type="math_number">\n                <title name="NUM">100</title>\n              </block>\n            </value>\n          </block>\n        ');165; }; buf.push('      </category>\n    ');166; } else if (page == 3) {; buf.push('      ');166; if (level == 1) {; buf.push('        ');166; // Don't use custom category yet, since it allows function definition.
; buf.push('        <category name="', escape((166,  msg.catProcedures() )), '">\n          <block type="procedures_callnoreturn">\n            <mutation name="', escape((168,  msg.drawACircle() )), '"></mutation>\n          </block>\n          <block type="procedures_callnoreturn">\n            <mutation name="', escape((171,  msg.drawASquare() )), '"></mutation>\n          </block>\n        </category>\n      ');174; } else { ; buf.push('\n        <category name="', escape((175,  msg.catProcedures() )), '" custom="PROCEDURE"></category>\n      ');176; }; buf.push('    ');176; }; buf.push('    ');176; // Control: controls_for_counter (from page 2, level 6) and repeat.
; buf.push('    <category name="', escape((176,  msg.catControl() )), '">\n      ');177; if ((page == 2 && level >= 6) || (page == 3 && level >= 9)) {; buf.push('        <block type="controls_for_counter">\n          <value name="FROM">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <value name="TO">\n            <block type="math_number">\n              <title name="NUM">100</title>\n            </block>\n          </value>\n          <value name="BY">\n            <block type="math_number">\n              <title name="NUM">10</title>\n            </block>\n          </value>\n        </block>\n      ');194; }; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">4</title>\n      </block>\n    </category>\n    ');198; // Math: Just number blocks until final level.
; buf.push('    <category name="', escape((198,  msg.catMath() )), '">\n      <block type="math_number"></block>\n      ');200; if (level == 10) {; buf.push('        <block type="math_arithmetic" inline="true"></block>\n        <block type="math_random_int">\n          <value name="FROM">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <value name="TO">\n            <block type="math_number">\n              <title name="NUM">100</title>\n            </block>\n        </value>\n      </block>\n      <block type="math_random_float"></block>\n    ');214; }; buf.push('    </category>\n    ');215; // Variables depends on page and level, although we never use the custom category
; buf.push('    ');215; // because we want to offer simplified getters and no setters.
; buf.push('    ');215; if (page == 2 && level >= 6) {; buf.push('      <category name="', escape((215,  msg.catVariables() )), '">\n        <block type="variables_get_counter"></block>\n      </category>\n    ');218; } else if (page == 3 && level >= 6 && level < 10) {; buf.push('      <category name="', escape((218,  msg.catVariables() )), '">\n        ');219; if (level >= 9) {; buf.push('          <block type="variables_get_counter"></block>\n        ');220; }; buf.push('        ');220; if (level >= 6) {; buf.push('          <block type="variables_get_length"></block>\n        ');221; }; buf.push('      </category>\n    ');222; } else if (page == 3 && level == 10) {; buf.push('      <category name="', escape((222,  msg.catVariables() )), '" custom="VARIABLE">\n      </category>\n    ');224; }; buf.push('  ');224; } else if (page == 4) {; buf.push('    ');224; // Actions: draw_move, draw_turn.
; buf.push('    <block type="draw_move_by_constant"></block>\n    <block type="draw_turn_by_constant">\n      <title name="VALUE">90</title>\n    </block>\n    ');228; if (level == 11) {; buf.push('    <block id="draw-width" type="draw_width_inline">\n      <title name="WIDTH">1</title>\n    </block>\n    ');231; }; buf.push('    ');231; // Colour: draw_colour with colour_picker and colour_random.
; buf.push('    <block id="draw-color" type="draw_colour">\n      <value name="COLOUR">\n        <block type="colour_picker"></block>\n      </value>\n    </block>\n    <block id="draw-color" type="draw_colour">\n      <value name="COLOUR">\n        <block type="colour_random"></block>\n      </value>\n    </block>\n    <block type="controls_repeat">\n      <title name="TIMES">4</title>\n    </block>\n  ');244; } else if (page == 5) {; buf.push('  ');244; // K1 simplified blocks for editor: keep in sync with Dashboard artist.rb
; buf.push('    ');244; if (level === LEVELBUILDER_LEVEL) {; buf.push('      <category name="K1 Simplified">\n        <block type="controls_repeat_simplified">\n          <title name="TIMES">5</title>\n        </block>\n        <block type="draw_colour_simple"></block>\n        <block type="simple_move_up"></block>\n        <block type="simple_move_down"></block>\n        <block type="simple_move_left"></block>\n        <block type="simple_move_right"></block>\n        <block type="simple_move_up_length"></block>\n        <block type="simple_move_down_length"></block>\n        <block type="simple_move_left_length"></block>\n        <block type="simple_move_right_length"></block>\n        <block type="simple_jump_up"></block>\n        <block type="simple_jump_down"></block>\n        <block type="simple_jump_left"></block>\n        <block type="simple_jump_right"></block>\n      </category>\n    ');262; }; buf.push('    ');262; // Actions: draw_move, draw_turn.
; buf.push('    <category id="actions" name="', escape((262,  msg.catTurtle() )), '">\n      <block type="draw_move">\n        <value name="VALUE">\n          <block type="math_number">\n            <title name="NUM">100</title>\n          </block>\n        </value>\n      </block>\n      <block type="jump">\n        <value name="VALUE">\n          <block type="math_number">\n            <title name="NUM">50</title>\n          </block>\n        </value>\n      </block>\n      <block type="draw_turn">\n        <value name="VALUE">\n          <block type="math_number">\n            <title name="NUM">90</title>\n          </block>\n        </value>\n      </block>\n      <block type="draw_pen"></block>\n      <block id="draw-width" type="draw_width_inline">\n        <title name="WIDTH">1</title>\n      </block>\n    </category>\n    ');289; // Colour: draw_colour with colour_picker and colour_random.
; buf.push('    <category name="', escape((289,  msg.catColour() )), '">\n      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_picker"></block>\n        </value>\n      </block>\n      <block id="draw-color" type="draw_colour">\n        <value name="COLOUR">\n          <block type="colour_random"></block>\n        </value>\n      </block>\n    </category>\n    ');301; // Functions
; buf.push('    <category name="', escape((301,  msg.catProcedures() )), '" custom="PROCEDURE"></category>\n    ');302; if (level === LEVELBUILDER_LEVEL) {; buf.push('    <category name="Prebuilt">\n      <block type="draw_a_triangle"></block>\n      <block type="draw_a_square_custom"></block>\n      <block type="draw_a_house"></block>\n      <block type="draw_a_flower"></block>\n      <block type="draw_a_snowflake"></block>\n      <block type="draw_a_snowman"></block>\n      <block type="draw_a_hexagon"></block>\n      <block type="draw_a_star"></block>\n      <block type="draw_a_robot"></block>\n      <block type="draw_a_rocket"></block>\n      <block type="draw_a_planet"></block>\n      <block type="draw_a_rhombus"></block>\n      <block type="draw_upper_wave"></block>\n      <block type="draw_lower_wave"></block>\n    </category>\n    ');318; }; buf.push('    ');318; // Control: controls_for_counter and repeat.
; buf.push('    <category name="', escape((318,  msg.catControl() )), '">\n      <block type="controls_for_counter">\n        <value name="FROM">\n          <block type="math_number">\n            <title name="NUM">1</title>\n          </block>\n        </value>\n        <value name="TO">\n          <block type="math_number">\n            <title name="NUM">100</title>\n          </block>\n        </value>\n        <value name="BY">\n          <block type="math_number">\n            <title name="NUM">10</title>\n          </block>\n        </value>\n      </block>\n      ');336; if (level < 6) {; buf.push('        <block type="controls_repeat">\n          <title name="TIMES">4</title>\n        </block>\n      ');339; } else {; buf.push('        <block type="controls_repeat_ext">\n          <value name="TIMES">\n            <block type="math_number">\n              <title name="NUM">10</title>\n            </block>\n          </value>\n        </block>\n      ');346; }; buf.push('    </category>\n  ');347; // Logic
; buf.push('    <category name="', escape((347,  msg.catLogic() )), '">\n      <block type="controls_if"></block>\n      <block type="logic_compare"></block>\n      <block type="logic_operation"></block>\n      <block type="logic_negate"></block>\n      <block type="logic_boolean"></block>\n      <block type="logic_null"></block>\n      <block type="logic_ternary"></block>\n    </category>\n    ');356; // Math: Just number blocks until final level.
; buf.push('    <category name="', escape((356,  msg.catMath() )), '">\n      <block type="math_number"></block>\n      <block type="math_arithmetic" inline="true"></block>\n      <block type="math_random_int">\n        <value name="FROM">\n          <block type="math_number">\n            <title name="NUM">1</title>\n          </block>\n        </value>\n        <value name="TO">\n          <block type="math_number">\n            <title name="NUM">100</title>\n          </block>\n        </value>\n      </block>\n      <block type="math_random_float"></block>\n     </category>\n    ');373; // Variables
; buf.push('    <category name="', escape((373,  msg.catVariables() )), '" custom="VARIABLE">\n    </category>\n  ');375; }; buf.push('</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":155}],133:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;

var msg = window.blockly.appLocale;

/**
 * Common code for creating procedures drawing different regular polygons.
 * options:
 *   title Title of procedure.
 *   modifiers String containing any optional keys and values for the initial
 *             <block> tag, such as 'x="20" y="20" editable="false"'.
 *   sides Number of sides.
 *   length 0 if a length parameter should be used, a positive number otherwise
 */
var polygon = function(options) {; buf.push('<block type="procedures_defnoreturn" ', (14,  options.modifiers ), '>\n    <mutation>\n      ');16; if (options.length == 0) {; buf.push('        <arg name="', escape((16,  msg.lengthParameter() )), '"></arg>\n      ');17; }; buf.push('    </mutation>\n    <title name="NAME">', escape((18,  options.title )), '</title>\n    <statement name="STACK">\n      <block type="controls_repeat" ', (20,  options.modifiers ), '>\n        <title name="TIMES">', escape((21,  options.sides )), '</title>\n        <statement name="DO">\n          <block type="draw_move" ', (23,  options.modifiers ), '>\n            <value name="VALUE">\n              ');25; if (options.length == 0) {; buf.push('                <block type="variables_get_length" ', (25,  options.modifiers ), '></block>\n              ');26; } else {; buf.push('                <block type="math_number" ', (26,  options.modifiers ), '>\n                  <title name="NUM">', escape((27,  options.length )), '</title>\n                </block>\n              ');29; }; buf.push('            </value>\n            <next>\n              <block type="draw_turn" ', (31,  options.modifiers ), '>\n                <value name="VALUE">\n                  <block type="math_number" ', (33,  options.modifiers ), '>\n                    <title name="NUM">', escape((34,  360 / options.sides )), '</title>\n                  </block>\n                </value>\n              </block>\n            </next>\n          </block>\n        </statement>\n      </block>\n    </statement>\n  </block>\n');44; };; buf.push('\n');45;
/**
 * Spiral needs a named helper template for recursion.
 * @param i Loop control variable.
 */
var spiral = function(i) {; buf.push('  ');50; if (i <= 60) {; buf.push('    <block type="draw_move" ');50; if (i == 25) { ; buf.push('x="300" y="100"');50; } ; buf.push(' inline="false" editable="false" deletable="false" disabled="true">\n      <title name="DIR">moveForward</title>\n      <value name="VALUE">\n        <block type="math_number" editable="false" deletable="false" disabled="true">\n          <title name="NUM">', escape((54,  i )), '</title>\n        </block>\n      </value>\n      <next>\n        <block type="draw_turn" inline="false" editable="false" deletable="false" disabled="true">\n          <title name="DIR">turnRight</title>\n          <value name="VALUE">\n            <block type="math_number" editable="false" deletable="false" disabled="true">\n              <title name="NUM">90</title>\n            </block>\n          </value>\n          <next>\n            ');66; spiral(i + 5); buf.push('          </next>\n        </block>\n      </next>\n    </block>\n  ');70; } ; buf.push('\n');71; };; buf.push('\n');72;
/**
 * Define the starting blocks for each page and level.
 * These are referenced from turtle.js.
 */
; buf.push('\n');78; if (page == 1) {; buf.push('  ');78; if (level == 1) {; buf.push('    <block type="draw_move_by_constant" x="20" y="20"></block>\n  ');79; } else if (level == 2) {; buf.push('    <block type="draw_colour" inline="true" x="20" y="20">\n      <value name="COLOUR">\n        <block type="colour_picker">\n          <title name="COLOUR">#ff0000</title>\n        </block>\n      </value>\n      <next>\n        <block type="draw_move_by_constant"></block>\n      </next>\n    </block>\n  ');89; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="20" y="20">\n      <title name="TIMES">3</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n        </block>\n      </statement>\n    </block>\n  ');99; } else if (level == 3 || level == 5 || level == 6) {; buf.push('    <block type="controls_repeat" x="20" y="20">\n      <title name="TIMES">');100; if (level == 3) { ; buf.push('4');100; } else { ; buf.push('3');100; } ; buf.push('</title>\n    </block>\n  ');102; } else if (level == 7) {; buf.push('    <block type="draw_turn_by_constant_restricted" x="20" y="20">\n      <title name="DIR">turnRight</title>\n      <title name="VALUE">90</title>\n    </block>\n  ');106; } else if (level == 8) {; buf.push('    <block id="set-color" type="draw_colour" x="20" y="100">\n      <value name="COLOUR">\n        <block type="colour_random"></block>\n      </value>\n      <next>\n        <block type="draw_move_by_constant">\n          <title name="DIR">moveForward</title>\n          <title name="VALUE">100</title>\n          <next>\n            <block type="draw_move_by_constant">\n              <title name="DIR">moveBackward</title>\n              <title name="VALUE">100</title>\n              <next>\n                <block type="draw_turn_by_constant">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">45</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');129; } else if (level == 9) {; buf.push('    <block type="controls_repeat" deletable="false"  x="20" y="20">\n      <title name="TIMES">??</title>\n      <statement name="DO">\n        <block type="draw_move" editable="false" deletable="false">\n          <value name="VALUE">\n            <block type="math_number" editable="false" deletable="false">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <next>\n            <block type="draw_turn" editable="false" deletable="false">\n              <value name="VALUE">\n                <block type="math_number" editable="false" deletable="false">\n                  <title name="NUM">1</title>\n                </block>\n              </value>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');150; } else if (level == 10) {; buf.push('    <block type="draw_move_by_constant" x="20" y="20">\n      <title name="DIR">moveForward</title>\n      <title name="VALUE">100</title>\n    </block>\n  ');154; }; buf.push('');154; } else if (page == 2) {; buf.push('  ');154; // No blocks are provided for levels 1 and 2.
; buf.push('  ');154; if (level == 3 || level == 5) {; buf.push('    ');154; // Call "draw a square".
; buf.push('    <block type="draw_a_square" inline="true" x="20" y="20">\n      <value name="VALUE">\n        <block type="math_number">\n          <title name="NUM">');157; if (level == 3) { ; buf.push('100');157; } else { ; buf.push('50');157; } ; buf.push('</title>\n        </block>\n      </value>\n    </block>\n  ');161; } else if (level == 4) {; buf.push('    ');161; // Three-square code.
; buf.push('    <block type="controls_repeat" deletable="false"  x="20" y="20">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block id="set-color" type="draw_colour" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" deletable="false">\n            </block>\n          </value>\n          <next>\n            <block type="draw_a_square" inline="true" editable="false" deletable="false">\n              <value name="VALUE">\n                <block type="math_number" deletable="false">\n                  <title name="NUM">???</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" editable="false" deletable="false">\n                  <value name="VALUE">\n                    <block type="math_number" deletable="false">\n                      <title name="NUM">???</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');190; } else if (level == 6) {; buf.push('    <block type="controls_for_counter" inline="true" x="20" y="20">\n    <title name="VAR">', escape((191,  msg.loopVariable() )), '</title>\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">');194; if (level == 6) { ; buf.push('50');194; } else { ; buf.push('10');194; } ; buf.push('</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">');199; if (level == 6) { ; buf.push('90');199; } else { ; buf.push('100');199; } ; buf.push('</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">10</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_a_square" inline="true">\n        </block>\n      </statement>\n    </block>\n  ');212; } else if (level == 7) {; buf.push('    ');212; spiral(25); buf.push('  ');212; } else if (level == 7.5) {; buf.push('    <block type="draw_a_snowman" x="20" y="20" inline="true">\n      <value name="VALUE">\n        <block type="math_number">\n          <title name="NUM">250</title>\n        </block>\n      </value>\n    </block>\n  ');219; } else if (level == 8 || level == 9) {; buf.push('    <block type="draw_a_snowman" x="20" y="20" inline="true">\n      <value name="VALUE">\n        <block type="math_number">\n          <title name="NUM">150</title>\n        </block>\n      </value>\n    </block>\n  ');226; } else if (level == 10) {; buf.push('    <block id="draw-width" type="draw_width_inline" x="158" y="67">\n      <title name="WIDTH">1</title>\n      <next>\n        <block type="controls_for_counter" inline="true">\n          <value name="FROM">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <value name="TO">\n            <block type="math_number">\n              <title name="NUM">100</title>\n            </block>\n          </value>\n          <value name="BY">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <statement name="DO">\n            <block type="draw_move" inline="false">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get_counter"></block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="false">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">91</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');266; }; buf.push('');266; } else if (page == 3) {; buf.push('  ');266; // Define "draw a square".
; buf.push('  ', (266,  polygon({
    title: msg.drawASquare(),
    modifiers: ' x="220" y="40" editable="false" deletable="false"',
    sides: 4,
    length: (level >= 6 ? 0 : 100)
  })), '  ');271; if (level == 1) {; buf.push('    ');271; // Define "draw a circle".
; buf.push('    ', (271,  polygon({
      title: msg.drawACircle(),
      modifiers: 'x="220" y="250" editable="false" deletable="false"',
      sides: 360,
      length: 1
    })), '  ');276; }; buf.push('  ');276; if (level == 2) {; buf.push('    <block type="procedures_defnoreturn" x="220" y="250">\n      <title name="NAME">', escape((277,  msg.drawATriangle() )), '</title>\n    </block>\n  ');279; } else if (level >= 3) {; buf.push('    ');279; //  Define "draw a triangle".
; buf.push('    ', (279,  polygon({
      title: msg.drawATriangle(),
      modifiers: (level == 6 ? 'x="220" y="250"' : 'x="220" y="250" editable="false" deletable="false"'),
      sides: 3,
      length: (level >= 7 ? 0 : 100)
    })), '  ');284; }; buf.push('  ');284; if (level == 7) {; buf.push('    ');284; //  Define "draw a house".
; buf.push('    <block type="procedures_defnoreturn" x="220" y="460">\n      <mutation>\n        ');286; if (level == 11) { ; buf.push('<arg name="', escape((286,  msg.lengthParameter() )), '"></arg>');286; }; buf.push('      </mutation>\n      <title name="NAME">', escape((287,  msg.drawAHouse() )), '</title>\n      <statement name="STACK">\n        <block type="procedures_callnoreturn" inline="false">\n          <mutation name="', escape((290,  msg.drawASquare() )), '">\n            <arg name="', escape((291,  msg.lengthParameter() )), '"/>\n          </mutation>\n          <value name="ARG0">\n            <block type="math_number">\n              <title name="NUM">100</title>\n            </block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="math_number">\n                  <title name="NUM">100</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">30</title>\n                    </block>\n                  </value>\n                  <next>\n                    <block type="procedures_callnoreturn" inline="false">\n                      <mutation name="', escape((316,  msg.drawATriangle() )), '">\n                        <arg name="', escape((317,  msg.lengthParameter() )), '"></arg>\n                      </mutation>\n                      <value name="ARG0">\n                        <block type="math_number">\n                          <title name="NUM">100</title>\n                        </block>\n                      </value>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');333; } // End of region in which "draw a square" is defined.
; buf.push('');333; } else if (page == 4) {; buf.push('  ');333; if (level == 2) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false" movable="true">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false" movable="true"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false" movable="true">\n          <title name="TIMES">3</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false" movable="true">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">100</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false" movable="true">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">120</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_colour" inline="true" x="70" y="230" editable="false" deletable="false" movable="true">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false" movable="true"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false" movable="true">\n                  <title name="TIMES">3</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false" movable="true">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">100</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false" movable="true">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">120</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');379; } else if (level == 3) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">3</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">100</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">120</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');401; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">3</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">100</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">120</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">36</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');434; } else if (level == 5) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">36</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">3</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">100</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">120</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_turn_by_constant">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">???</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');467; } else if (level == 7) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">4</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">20</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">90</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');489; } else if (level == 8) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">10</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">4</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">20</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">90</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">20</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');522; } else if (level == 9) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">4</title>\n      <statement name="DO">\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true" editable="false" deletable="false">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">???</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');566; } else if (level == 10) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true" editable="false" deletable="false">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant" editable="false" deletable="false">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">80</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');610; } else if (level == 11) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="controls_repeat">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="controls_repeat">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">???</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');654; }; buf.push('');654; } else if (page == 5) {; buf.push('  ');654; if (level == 1) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">200</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((680,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">90</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');698; } else if (level == 2) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">300</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((724,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">121</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');742; } else if (level == 3) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">300</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((768,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">134</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');786; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="70" y="20">\n      <title name="TIMES">10</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="procedures_callnoreturn" inline="false">\n              <mutation name="', escape((795,  msg.drawACircle() )), '">\n                <arg name="', escape((796,  msg.step() )), '"></arg>\n              </mutation>\n              <value name="ARG0">\n                <block type="math_number">\n                  <title name="NUM">6</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">36</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="270">\n      <mutation>\n        <arg name="', escape((820,  msg.step() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((822,  msg.drawACircle() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">60</title>\n          <statement name="DO">\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((831,  msg.step() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">6</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');849; } else if (level == 5) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="20">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">4</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">8</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">4</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="controls_repeat">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="procedures_callnoreturn" inline="false">\n                  <mutation name="', escape((875,  msg.drawACircle() )), '">\n                    <arg name="', escape((876,  msg.step() )), '"></arg>\n                  </mutation>\n                  <value name="ARG0">\n                    <block type="variables_get">\n                      <title name="VAR">', escape((880,  msg.loopVariable() )), '</title>\n                    </block>\n                  </value>\n                  <next>\n                    <block type="draw_turn" inline="true">\n                      <title name="DIR">turnRight</title>\n                      <value name="VALUE">\n                        <block type="math_number">\n                          <title name="NUM">36</title>\n                        </block>\n                      </value>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="320">\n      <mutation>\n        <arg name="', escape((902,  msg.step() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((904,  msg.drawACircle() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">60</title>\n          <statement name="DO">\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((913,  msg.step() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">6</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');931; } else if (level == 6) {; buf.push('    <block type="procedures_callnoreturn" inline="false" x="70" y="20">\n      <mutation name="', escape((932,  msg.drawATree() )), '">\n        <arg name="', escape((933,  msg.depth() )), '"></arg>\n        <arg name="', escape((934,  msg.branches() )), '"></arg>\n      </mutation>\n      <value name="ARG0">\n        <block type="math_number">\n          <title name="NUM">9</title>\n        </block>\n      </value>\n      <value name="ARG1">\n        <block type="math_number">\n          <title name="NUM">2</title>\n        </block>\n      </value>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="190">\n      <mutation>\n        <arg name="', escape((949,  msg.depth() )), '"></arg>\n        <arg name="', escape((950,  msg.branches() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((952,  msg.drawATree() )), '</title>\n      <statement name="STACK">\n        <block type="controls_if" inline="false">\n          <value name="IF0">\n            <block type="logic_compare" inline="true">\n              <title name="OP">GT</title>\n              <value name="A">\n                <block type="variables_get">\n                  <title name="VAR">', escape((960,  msg.depth() )), '</title>\n                </block>\n              </value>\n              <value name="B">\n                <block type="math_number">\n                  <title name="NUM">0</title>\n                </block>\n              </value>\n            </block>\n          </value>\n          <statement name="DO0">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="draw_pen">\n                  <title name="PEN">penDown</title>\n                  <next>\n                    <block type="draw_move" inline="true">\n                      <title name="DIR">moveForward</title>\n                      <value name="VALUE">\n                        <block type="math_arithmetic" inline="true">\n                          <title name="OP">MULTIPLY</title>\n                          <value name="A">\n                            <block type="math_number">\n                              <title name="NUM">7</title>\n                            </block>\n                          </value>\n                          <value name="B">\n                            <block type="variables_get">\n                              <title name="VAR">', escape((991,  msg.depth() )), '</title>\n                            </block>\n                          </value>\n                        </block>\n                      </value>\n                      <next>\n                        <block type="draw_turn" inline="true">\n                          <title name="DIR">turnLeft</title>\n                          <value name="VALUE">\n                            <block type="math_number">\n                              <title name="NUM">130</title>\n                            </block>\n                          </value>\n                          <next>\n                            <block type="controls_repeat_ext" inline="true">\n                              <value name="TIMES">\n                                <block type="variables_get">\n                                  <title name="VAR">', escape((1008,  msg.branches() )), '</title>\n                                </block>\n                              </value>\n                              <statement name="DO">\n                                <block type="draw_turn" inline="true">\n                                  <title name="DIR">turnRight</title>\n                                  <value name="VALUE">\n                                    <block type="math_arithmetic" inline="true">\n                                      <title name="OP">DIVIDE</title>\n                                      <value name="A">\n                                        <block type="math_number">\n                                          <title name="NUM">180</title>\n                                        </block>\n                                      </value>\n                                      <value name="B">\n                                        <block type="variables_get">\n                                          <title name="VAR">', escape((1024,  msg.branches() )), '</title>\n                                        </block>\n                                      </value>\n                                    </block>\n                                  </value>\n                                  <next>\n                                    <block type="procedures_callnoreturn" inline="false">\n                                      <mutation name="', escape((1031,  msg.drawATree() )), '">\n                                        <arg name="', escape((1032,  msg.depth() )), '"></arg>\n                                        <arg name="', escape((1033,  msg.branches() )), '"></arg>\n                                      </mutation>\n                                      <value name="ARG0">\n                                        <block type="math_arithmetic" inline="true">\n                                          <title name="OP">MINUS</title>\n                                          <value name="A">\n                                            <block type="variables_get">\n                                              <title name="VAR">', escape((1040,  msg.depth() )), '</title>\n                                            </block>\n                                          </value>\n                                          <value name="B">\n                                            <block type="math_number">\n                                              <title name="NUM">1</title>\n                                            </block>\n                                          </value>\n                                        </block>\n                                      </value>\n                                      <value name="ARG1">\n                                        <block type="variables_get">\n                                          <title name="VAR">', escape((1052,  msg.branches() )), '</title>\n                                        </block>\n                                      </value>\n                                    </block>\n                                  </next>\n                                </block>\n                              </statement>\n                              <next>\n                                <block type="draw_turn" inline="true">\n                                  <title name="DIR">turnLeft</title>\n                                  <value name="VALUE">\n                                    <block type="math_number">\n                                      <title name="NUM">50</title>\n                                    </block>\n                                  </value>\n                                  <next>\n                                    <block type="draw_pen">\n                                      <title name="PEN">penUp</title>\n                                      <next>\n                                        <block type="draw_move" inline="true">\n                                          <title name="DIR">moveBackward</title>\n                                          <value name="VALUE">\n                                            <block type="math_arithmetic" inline="true">\n                                              <title name="OP">MULTIPLY</title>\n                                              <value name="A">\n                                                <block type="math_number">\n                                                  <title name="NUM">7</title>\n                                                </block>\n                                              </value>\n                                              <value name="B">\n                                                <block type="variables_get">\n                                                  <title name="VAR">', escape((1083,  msg.depth() )), '</title>\n                                                </block>\n                                              </value>\n                                            </block>\n                                          </value>\n                                        </block>\n                                      </next>\n                                    </block>\n                                  </next>\n                                </block>\n                              </next>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');1107; }; buf.push('');1107; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":155}],131:[function(require,module,exports){
/**
 * Sets BlocklyApp constants that depend on the page and level.
 * This encapsulates many functions used for BlocklyApps.REQUIRED_BLOCKS.
 * In the future, some of these may be moved to common.js.
 */

var requiredBlockUtils = require('../required_block_utils');

// This tests for and creates a draw_a_square block on page 2.
function drawASquare(number) {
  return {test: 'draw_a_square',
          type: 'draw_a_square',
          values: {'VALUE': requiredBlockUtils.makeMathNumber(number)}};
}

// This tests for and creates a draw_a_snowman block on page 2.
function drawASnowman(number) {
  return {test: 'draw_a_snowman',
          type: 'draw_a_snowman',
          values: {'VALUE': requiredBlockUtils.makeMathNumber(number)}};
}

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial.
var MOVE_FORWARD_INLINE = {test: 'moveForward', type: 'draw_move_by_constant'};

// allow move forward or backward, but show forward block if they've done neither
var MOVE_FORWARD_OR_BACKWARD_INLINE = {
  test: function(block) {
    return block.type == 'draw_move_by_constant';
  },
  type: 'draw_move_by_constant'
};

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial with the given pixel number.
var moveForwardInline = function(pixels) {
  return {test: 'moveForward',
          type: 'draw_move_by_constant',
          titles: {'VALUE': pixels}};
};

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial.
var MOVE_BACKWARD_INLINE = {test: 'moveBackward',
                            type: 'draw_move_by_constant',
                            titles: {'DIR': 'moveBackward'}};

// This tests for a [right] draw_turn_by_constant_restricted block
// and creates the block with the specified/recommended number of degrees as
// its input.  The restricted turn is used on the earlier levels of the
// tutorial.
var turnRightRestricted = function(degrees) {
  return {test: 'turnRight(',
          type: 'draw_turn_by_constant_restricted',
          titles: {'VALUE': degrees}};
};

// This tests for a [left] draw_turn_by_constant_restricted block
// and creates the block with the specified/recommended number of degrees as
// its input.  The restricted turn is used on the earlier levels of the
// tutorial.
var turnLeftRestricted = function(degrees) {
  return {test: 'turnLeft(',
          type: 'draw_turn_by_constant_restricted',
          titles: {'VALUE': degrees}};
};


// This tests for and creates a [right] draw_turn_by_constant block
// with the specified number of degrees as its input.
var turnRightByConstant = function(degrees) {
  return {
    test: function(block) {
      return block.type == 'draw_turn_by_constant' &&
          (degrees === '???' ||
           Blockly.JavaScript.valueToCode(
             block, 'VALUE', Blockly.JavaScript.ORDER_NONE) == degrees);
    },
    type: 'draw_turn_by_constant',
    titles: {'VALUE': degrees}};
};

// This tests for and creates a [right] draw_turn block with the specified
// number of degrees as its input.  For the earliest levels, the method
// turnRightRestricted should be used instead.
var turnRight = function(degrees) {
  return {
    test: function(block) {
      return block.type == 'draw_turn' &&
        block.getTitleValue('DIR') == 'turnRight';
      },
    type: 'draw_turn',
    titles: {'DIR': 'turnRight'},
    values: {'VALUE': requiredBlockUtils.makeMathNumber(degrees)}
  };
};

// This tests for and creates a left draw_turn block with the specified
// number of degrees as its input.  This method is not appropriate for the
// earliest levels of the tutorial, which do not provide draw_turn.
var turnLeft = function(degrees) {
  return {
    test: function(block) {
      return block.type == 'draw_turn' &&
        block.getTitleValue('DIR') == 'turnLeft';
      },
    type: 'draw_turn',
    titles: {'DIR': 'turnLeft'},
    values: {'VALUE': requiredBlockUtils.makeMathNumber(degrees)}
  };
};

// This tests for any draw_move block and, if not present, creates
// one with the specified distance.
var move = function(distance) {
  return {test: function(block) {return block.type == 'draw_move'; },
          type: 'draw_move',
          values: {'VALUE': requiredBlockUtils.makeMathNumber(distance)}};
};

// This tests for and creates a draw_turn_by_constant_restricted block.
var drawTurnRestricted = function(degrees) {
  return {
    test: function(block) {
      return block.type == 'draw_turn_by_constant_restricted';
    },
    type: 'draw_turn_by_constant_restricted',
    titles: {'VALUE': degrees}
  };
};

// This tests for and creates a draw_turn block.
var drawTurn = function() {
  return {
    test: function(block) {
      return block.type == 'draw_turn';
    },
    type: 'draw_turn',
    values: {'VALUE': requiredBlockUtils.makeMathNumber('???')}
  };
};

// This tests for and creates a "set colour" block with a colour picker
// as its input.
var SET_COLOUR_PICKER = {test: 'penColour(\'#',
  type: 'draw_colour',
  values: {'COLOUR': '<block type="colour_picker"></block>'}};

// This tests for and creates a "set colour" block with a random colour
// generator as its input.
var SET_COLOUR_RANDOM = {test: 'penColour(colour_random',
  type: 'draw_colour',
  values: {'COLOUR': '<block type="colour_random"></block>'}};

/**
 * Creates a required block specification for defining a function with an
 * argument.  Unlike the other functions to create required blocks, this
 * is defined outside of Turtle.setBlocklyAppConstants because it is accessed
 * when checking for a procedure on levels 8-9 of Turtle 3.
 * @param {string} func_name The name of the function.
 * @param {string} arg_name The name of the single argument.
 * @return A required block specification that tests for a call of the
 *     specified function with the specified argument name.  If not present,
 *     this contains the information to create such a block for display.
 */
var defineWithArg = function(func_name, arg_name) {
  return {
    test: function(block) {
      return block.type == 'procedures_defnoreturn' &&
          block.getTitleValue('NAME') == func_name &&
          block.parameterNames_ && block.parameterNames_.length &&
          block.parameterNames_[0] == arg_name;
    },
    type: 'procedures_defnoreturn',
    titles: {'NAME': func_name},
    extra: '<mutation><arg name="' + arg_name + '"></arg></mutation>'
  };
};

module.exports = {
  makeMathNumber: requiredBlockUtils.makeMathNumber,
  simpleBlock: requiredBlockUtils.simpleBlock,
  repeat: requiredBlockUtils.repeat,
  drawASquare: drawASquare,
  drawASnowman: drawASnowman,
  MOVE_FORWARD_INLINE: MOVE_FORWARD_INLINE,
  MOVE_FORWARD_OR_BACKWARD_INLINE: MOVE_FORWARD_OR_BACKWARD_INLINE,
  moveForwardInline: moveForwardInline,
  MOVE_BACKWARD_INLINE: MOVE_BACKWARD_INLINE,
  turnLeftRestricted: turnLeftRestricted,
  turnRightRestricted: turnRightRestricted,
  turnRightByConstant: turnRightByConstant,
  turnRight: turnRight,
  turnLeft: turnLeft,
  move: move,
  drawTurnRestricted: drawTurnRestricted,
  drawTurn: drawTurn,
  SET_COLOUR_PICKER: SET_COLOUR_PICKER,
  SET_COLOUR_RANDOM: SET_COLOUR_RANDOM,
  defineWithArg: defineWithArg,
};

},{"../required_block_utils":94}],126:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="slider-cell">\n  <svg id="slider"\n       xmlns="http://www.w3.org/2000/svg"\n       xmlns:svg="http://www.w3.org/2000/svg"\n       xmlns:xlink="http://www.w3.org/1999/xlink"\n       version="1.1"\n       width="150"\n       height="50">\n      <!-- Slow icon. -->\n      <clipPath id="slowClipPath">\n        <rect width=26 height=12 x=5 y=14 />\n      </clipPath>\n      <image xlink:href="', escape((13,  assetUrl('media/turtle/icons.png') )), '" height=42 width=84 x=-21 y=-10\n          clip-path="url(#slowClipPath)" />\n      <!-- Fast icon. -->\n      <clipPath id="fastClipPath">\n        <rect width=26 height=16 x=120 y=10 />\n      </clipPath>\n      <image xlink:href="', escape((19,  assetUrl('media/turtle/icons.png') )), '" height=42 width=84 x=120 y=-11\n          clip-path="url(#fastClipPath)" />\n  </svg>\n  <img id="spinner" style="visibility: hidden;" src="', escape((22,  assetUrl('media/turtle/loading.gif') )), '" height=15 width=15>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":155}],128:[function(require,module,exports){
/**
 * A set of blocks used by some of our custom levels (i.e. built by level builder)
 */

var msg = window.blockly.appLocale;
var utils = require('../utils');
var _ = utils.getLodash();


exports.install = function(blockly, generator, gensym) {
 installDrawASquare(blockly, generator, gensym);
 installCreateACircle(blockly, generator, gensym);
 installCreateASnowflakeBranch(blockly, generator, gensym);
 installDrawATriangle(blockly, generator, gensym);
 installDrawAHouse(blockly, generator, gensym);
 installDrawAFlower(blockly, generator, gensym);
 installDrawASnowflake(blockly, generator, gensym);
 installDrawAHexagon(blockly, generator, gensym);
 installDrawAStar(blockly, generator, gensym);
 installDrawARobot(blockly, generator, gensym);
 installDrawARocket(blockly, generator, gensym);
 installDrawAPlanet(blockly, generator, gensym);
 installDrawARhombus(blockly, generator, gensym);
 installDrawUpperWave(blockly, generator, gensym);
 installDrawLowerWave(blockly, generator, gensym);

 installCreateASnowflakeDropdown(blockly, generator, gensym);
};

function createACircleCode (size, gensym, indent) {
  var loopVar = gensym('count');
  indent = indent || '';
  return [
    indent + '// create_a_circle',
    indent + 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 36; ' +
    indent +       loopVar + '++) {',
    indent + '  Turtle.moveForward(' + size + ');',
    indent + '  Turtle.turnRight(10);',
    indent + '}\n'].join('\n');
}


/**
 * Same as draw_a_square, except inputs are not inlined
 */
function installDrawASquare(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square_custom = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square_custom = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_square',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' +
              loopVar + '++) {',
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnRight(90);',
        '}\n'].join('\n');
  };
}

/**
 * create_a_circle and create_a_circle_size
 * first defaults to size 10, second provides a size param
 */
function installCreateACircle(blockly, generator, gensym) {
  blockly.Blocks.create_a_circle = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createACircle());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  blockly.Blocks.create_a_circle_size = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createACircle());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.sizeParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_circle = function() {
    return createACircleCode(10, gensym);
  };

  generator.create_a_circle_size = function() {
    var size = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    return createACircleCode(size, gensym);
  };
}

/**
 * create_a_snowflower
 */
function installCreateASnowflakeBranch(blockly, generator, gensym) {
  blockly.Blocks.create_a_snowflake_branch = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createASnowflakeBranch());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_snowflake_branch = function() {
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');
    return [
      '// create_a_snowflake_branch',
      'Turtle.jumpForward(90);',
      'Turtle.turnLeft(45);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {',
      '    Turtle.moveForward(30);',
      '    Turtle.moveBackward(30);',
      '    Turtle.turnRight(45);',
      '  }',
      '  Turtle.turnLeft(90);',
      '  Turtle.moveBackward(30);',
      '  Turtle.turnLeft(45);',
      '}',
      'Turtle.turnRight(45);\n'].join('\n');
  };
}


/**
 * Draw a rhombus function call block
 */
function installDrawARhombus(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_rhombus = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARhombus());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rhombus = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 2; ' +
            loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(60);',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(120);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawATriangle(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_triangle = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawATriangle());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_triangle = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_triangle',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' +
              loopVar + '++) {',
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnLeft(120);',
        '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawAHexagon(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_hexagon = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAHexagon());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_hexagon = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_triangle',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' +
              loopVar + '++) {',
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnLeft(60);',
        '}\n'].join('\n');
  };
}

/**
 * Draw a house function call block
 */
function installDrawAHouse(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_house = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAHouse());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_house = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(90);',
      '}',
      'Turtle.turnLeft(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(120);',
      '}',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnLeft(90);\n'].join('\n');
  };
}

/**
 * Draw a flower function call block
 */
function installDrawAFlower(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_flower = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAFlower());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_flower = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return [
      'Turtle.penColour("#228b22");',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnLeft(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.penColour(' + color_random + ');',
      '  Turtle.turnLeft(36);',
      '  Turtle.moveForward(' + value_length + ' / 2);',
      '  Turtle.moveBackward(' + value_length + '/ 2);',
      '}',
      'Turtle.turnRight(198);',
      'Turtle.jumpForward(' + value_length + ');',
      'Turtle.turnRight(180);\n'].join('\n');
  };
}

/**
 * Draw a snowflake function call block
 */
function installDrawASnowflake(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_snowflake = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASnowflake());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowflake = function() {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 8; ' + loopVar + '++) {',
      '  Turtle.penColour("#7fffd4");',
      '  Turtle.moveForward(30);',
      '  Turtle.turnRight(90);',
      '  Turtle.moveForward(15);',
      '  Turtle.turnRight(90);',
      '  Turtle.penColour("#0000cd");',
      '  Turtle.moveForward(15);',
      '  Turtle.turnRight(90);',
      '  Turtle.moveForward(30);',
      '  Turtle.turnRight(45);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a star function call block
 */
function installDrawAStar(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_star = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAStar());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_star = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Turtle.turnRight(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(144);',
      '}',
      'Turtle.turnLeft(18);\n'].join('\n');
  };
}

/**
 * Draw a robot function call block
 */
function installDrawARobot(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_robot = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARobot());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_robot = function() {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    return [
      'Turtle.turnLeft(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnRight(90);',
      '}',
      'Turtle.turnRight(90);',
      'Turtle.moveBackward(10);',
      'Turtle.moveForward(40);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(80);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(40);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(80);',
      'Turtle.moveBackward(15);',
      'Turtle.turnLeft(120);',
      'Turtle.moveForward(40);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(30);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(210);',
      'Turtle.moveForward(40);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(60);',
      'Turtle.moveForward(115);',
      'Turtle.moveBackward(50);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(40);',
      'Turtle.turnLeft(90);',
      'Turtle.moveForward(50);\n'].join('\n');
  };
}


/**
 * Draw a robot function call block
 */
function installDrawARocket(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_rocket = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARocket());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rocket = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');

    return [
      'Turtle.penColour("#ff0000");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnLeft(120);',
      '}',
      'Turtle.penColour("#000000");',
      'Turtle.turnLeft(90);',
      'Turtle.jumpForward(20);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(20);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(20);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnLeft(120);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a planet function call block
 */
function installDrawAPlanet(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_planet = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAPlanet());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_planet = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');


    return [
      'Turtle.penColour("#808080");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 360; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.moveBackward(' + value_length + ');',
      '  Turtle.turnRight(1);',
      '}\n'].join('\n');
  };
}

/**
 * Draw upper wave function call block
 */
function installDrawUpperWave(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_upper_wave = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawUpperWave());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_upper_wave = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Turtle.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(18);',
      '}\n'].join('\n');
  };
}

/**
 * Draw lower wave function call block
 */
function installDrawLowerWave(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_lower_wave = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawLowerWave());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_lower_wave = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Turtle.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(18);',
      '}\n'].join('\n');
  };
}

function installCreateASnowflakeDropdown(blockly, generator, gensym) {
  var snowflakes = [
    [msg.createSnowflakeSquare(), 'square'],
    [msg.createSnowflakeParallelogram(), 'parallelogram'],
    [msg.createSnowflakeLine(), 'line'],
    [msg.createSnowflakeSpiral(), 'spiral'],
    [msg.createSnowflakeFlower(), 'flower'],
    [msg.createSnowflakeFractal(), 'fractal'],
    [msg.createSnowflakeRandom(), 'random']
  ];

  blockly.Blocks.create_snowflake_dropdown = {
    init: function () {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(snowflakes), 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_snowflake_dropdown = function () {
    var type = this.getTitleValue('TYPE');
    return "Turtle.drawSnowflake('" + type + "', 'block_id_" + this.id + "');";
  };
}

},{"../utils":136}],127:[function(require,module,exports){
// Create a limited colour palette to avoid overwhelming new users
// and to make colour checking easier.  These definitions cannot be
// moved to blocks.js, which is loaded later, since they are used in
// top-level definitions below.  Note that the hex digits a-f are
// lower-case.  This is assumed in comparisons below.
exports.Colours = {
  BLACK: '#000000',
  GREY: '#808080',
  KHAKI: '#c3b091',
  WHITE: '#ffffff',
  RED: '#ff0000',
  PINK: '#ff77ff',
  ORANGE: '#ffa000',
  YELLOW: '#ffff00',
  GREEN: '#228b22',
  BLUE: '#0000cd',
  AQUAMARINE: '#7fffd4',
  PLUM: '#843179',

  FROZEN1: "#d0fdfd",
  FROZEN2: "#d0fdd0",
  FROZEN3: "#d0d0fd",
  FROZEN4: "#e0e0e0",
  FROZEN5: '#ffffff',
  FROZEN6: "#e8e8e8",
  FROZEN7: "#bbd1e4",
  FROZEN8: "#fdd0fd",
  FROZEN9: "#aea4ff"
};

},{}],123:[function(require,module,exports){
/**
 * Blockly Demo: Turtle Graphics
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var api = require('./api');
var BlocklyApps = require('../base');

var setRandomVisibleColour = function() {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  // Make sure at least one component is below 0x80 and the rest
  // below 0xA0, to prevent too light of colours.
  num &= 0x9f7f9f;
  var colour = '#' + ('00000' + num.toString(16)).substr(-6);
  api.penColour(colour);
};

var drawSquare = function(length, random_colour) {
  for (var count = 0; count < 4; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(90);
  }
};

var drawTriangle = function(length, random_colour) {
  for (var count = 0; count < 3; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(120);
  }
};

var drawSnowman = function(height) {
  api.turnLeft(90);
  var distances = [height * 0.5, height * 0.3, height * 0.2];
  for (var i = 0; i < 6; i++) {
    var distance = distances[i < 3 ? i : 5 - i] / 57.5;
    for (var d = 0; d < 180; d += 2) {
      api.moveForward(distance);
      api.turnRight(2);
    }
    if (i != 2) {
      api.turnRight(180);
    }
  }
  api.turnLeft(90);
};

var drawHouse = function(length) {
  drawSquare(length);
  api.moveForward(length);
  api.turnRight(30);
  drawTriangle(length);
  api.turnRight(60);
  api.moveForward(length);
  api.turnLeft(90);
  api.moveBackward(length);
};

/**
 * Returns the log of a sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 *
 * Warning: Has side effects to BlocklyApps.
 */
exports.answer = function(page, level) {
  api.log = [];
  var count, sideIdx, len;
  if (page == 1) {
    switch (level) {
      case 1:
        // El.
        api.moveForward(100);
        api.turnRight(90);
        api.moveForward(100);
        break;
      case 2:
        // Square.
        setRandomVisibleColour();
        drawSquare(100, false);
        break;
      case 3:
        // Use repeat to draw a square.
        drawSquare(100, false);
        break;
      case 4:
        // Equilateral triangle.
        drawTriangle(100, true);
        break;
      case 5:
        // Sideways envelope.
        drawSquare(100);
        drawTriangle(100);
        break;
      case 6:
        // Triangle and square.
        drawTriangle(100);
        api.turnRight(180);
        drawSquare(100);
        break;
      case 7:
        // Glasses.
        api.penColour('#00cc00');  // blue
        api.turnRight(90);
        drawSquare(100);
        api.moveBackward(150);
        drawSquare(100);
        break;
      case 8:
        // Spiky.
        for (count = 0; count < 8; count++) {
          setRandomVisibleColour();
          api.moveForward(100);
          api.moveBackward(100);
          api.turnRight(45);
        }
        break;
      case 9:
        // Circle.
        for (count = 0; count < 360; count++) {
          api.moveForward(1);
          api.turnRight(1);
        }
        break;
    }
  } else if (page == 2) {
    switch (level) {
      case 1:
        // Single square in some color.
        setRandomVisibleColour();
        drawSquare(100);
        break;
      case 2:
        // Single green square.
        api.penColour('#00ff00');  // green
        drawSquare(50);
        break;
      case 3:
        // Three squares, 120 degrees apart, in random colors.
        for (count = 0; count < 3; count++) {
          setRandomVisibleColour();
          drawSquare(100);
          api.turnRight(120);
        }
        break;
      case 4:
        // 36 squares, 10 degrees apart, in random colors.
        for (count = 0; count < 36; count++) {
          setRandomVisibleColour();
          drawSquare(100);
          api.turnRight(10);
        }
        break;
      case 5:  // Draw without using for-loop.  (Fall through to next case.)
      case 6:
        // Squares with sides of 50, 60, 70, 80, and 90 pixels.
        for (len = 50; len <= 90; len += 10) {
          drawSquare(len);
        }
        break;
      case 7:
        // Mini-spiral.
        for (len = 25; len <= 60; len += 5) {
          api.moveForward(len);
          api.turnRight(90);
        }
        break;
      case 7.5:
        drawSnowman(250);
        drawSnowman(100);
        break;
      case 8:
        // Same-height snowmen.
        for (var i = 0; i < 3; i++) {
          setRandomVisibleColour();
          drawSnowman(150);
          api.turnRight(90);
          api.jumpForward(100);
          api.turnLeft(90);
        }
        break;
      case 9:
        // Different height snowmen.
        for (var height = 110; height >= 70; height -= 10) {
          setRandomVisibleColour();
          drawSnowman(height);
          api.turnRight(90);
          api.jumpForward(60);
          api.turnLeft(90);
        }
        break;
    }
  } else if (page == 3) {
    switch (level) {
      case 1:
        // Draw a square.
        drawSquare(100);
        break;
      case 2:
        // Draw a triangle.
        drawTriangle(100);
        break;
      case 3:
        drawTriangle(100);
        api.moveForward(100);
        drawSquare(100);
        api.moveForward(100);
        drawTriangle(100);
        break;
      case 4:
        // Draw a house using "draw a square" and "draw a triangle".
        drawHouse(100);
        break;
      case 5:
        // Draw a house using a function.
        drawHouse(100);
        break;
      case 6:
        setRandomVisibleColour();
        drawTriangle(100);
        api.moveForward(100);
        setRandomVisibleColour();
        drawTriangle(200);
        break;
      case 7:
        // Add a parameter to the "draw a house" procedure.
        drawHouse(150);
        break;
      case 8:
        drawHouse(100);
        drawHouse(150);
        drawHouse(100);
        break;
      case 9:
        for (count = 50; count <= 150; count += 50) {
          setRandomVisibleColour();
          drawHouse(count);
        }
        break;
    }
  } else if (page == 4) {
    switch (level) {
      case 1:
        // Draw an equilateral triangle.
        drawTriangle(100);
        break;
      case 2:
        // Draw two equilateral triangles.
        for (count = 0; count < 2; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(90);
        }
        break;
      case 3:
        // Draw four equilateral triangles.
        for (count = 0; count < 4; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(90);
        }
        break;
      case 4:
        for (count = 0; count < 10; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(36);
        }
        break;
      case 5:
        for (count = 0; count < 36; count++) {
          setRandomVisibleColour();
          drawTriangle(100);
          api.turnRight(10);
        }
        break;
      case 6:
        drawSquare(20);
        break;
      case 7:
        for (count = 0; count < 10; count++) {
          setRandomVisibleColour();
          drawSquare(20);
          api.moveForward(20);
        }
      break;
      case 8:
        for (sideIdx = 0; sideIdx < 4; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(90);
        }
      break;
      case 9:
        for (sideIdx = 0; sideIdx < 4; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(80);
        }
      break;
      case 10:
        for (sideIdx = 0; sideIdx < 9; sideIdx++) {
          for (count = 0; count < 10; count++) {
            setRandomVisibleColour();
            drawSquare(20);
            api.moveForward(20);
          }
          api.turnRight(80);
        }
      break;
    }
  }
  BlocklyApps.reset();
  return api.log;
};

},{"../base":3,"./api":124}],124:[function(require,module,exports){
var BlocklyApps = require('../base');
var utils = require('../utils');
var _ = utils.getLodash();

exports.log = [];

exports.drawCircle = function (size, id) {
  for (var i = 0; i < 36; i++) {
    exports.moveForward(size, id);
    exports.turnRight(10, id);
  }
};

exports.drawSnowflake = function (type, id) {
  var i, j, k;

  // mirors Blockly.JavaScript.colour_random.
  var random_colour = function () {
    var colors = Blockly.FieldColour.COLOURS;
    return colors[Math.floor(Math.random()*colors.length)];
  };

  if (type === 'random') {
    type = _.sample(['fractal', 'flower', 'spiral', 'line', 'parallelogram', 'square']);
  }

  switch(type) {
    case 'fractal':
      for (i = 0; i < 8; i++) {
        exports.jumpForward(45, id);
        exports.turnLeft(45, id);
        for (j = 0; j < 3; j++) {
          for (k = 0; k < 3; k++) {
            exports.moveForward(15, id);
            exports.moveBackward(15, id);
            exports.turnRight(45, id);
          }
          exports.turnLeft(90, id);
          exports.moveBackward(15, id);
          exports.turnLeft(45, id);
        }
        exports.turnRight(90, id);
      }
      break;

    case 'flower':
      for (i = 0; i < 5; i++) {
        exports.drawCircle(2, id);
        exports.drawCircle(4, id);
        exports.turnRight(72, id);
      }
      break;

    case 'spiral':
      for (i = 0; i < 20; i++) {
        exports.drawCircle(3, id);
        exports.moveForward(20, id);
        exports.turnRight(18, id);
      }
      break;

    case 'line':
      for (i = 0; i < 90; i++) {
        exports.penColour(random_colour());
        exports.moveForward(50, id);
        exports.moveBackward(50, id);
        exports.turnRight(4, id);
      }
      exports.penColour("#FFFFFF", id);
      break;

    case 'parallelogram':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 2; j++) {
          exports.moveForward(50, id);
          exports.turnRight(60, id);
          exports.moveForward(50, id);
          exports.turnRight(120, id);
        }
        exports.turnRight(36, id);
      }
      break;

    case 'square':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 4; j++) {
          exports.moveForward(50, id);
          exports.turnRight(90, id);
        }
        exports.turnRight(36, id);
      }
      break;
  }
};


exports.moveForward = function(distance, id) {
  this.log.push(['FD', distance, id]);
};

exports.moveBackward = function(distance, id) {
  this.log.push(['FD', -distance, id]);
};

exports.moveUp = function(distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

exports.moveDown = function(distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

exports.moveLeft = function(distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

exports.moveRight = function(distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

exports.jumpUp = function(distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

exports.jumpDown = function(distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

exports.jumpLeft = function(distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

exports.jumpRight = function(distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

exports.jumpForward = function(distance, id) {
  this.log.push(['JF', distance, id]);
};

exports.jumpBackward = function(distance, id) {
  this.log.push(['JF', -distance, id]);
};

exports.turnRight = function(angle, id) {
  this.log.push(['RT', angle, id]);
};

exports.turnLeft = function(angle, id) {
  this.log.push(['RT', -angle, id]);
};

exports.penUp = function(id) {
  this.log.push(['PU', id]);
};

exports.penDown = function(id) {
  this.log.push(['PD', id]);
};

exports.penWidth = function(width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

exports.penColour = function(colour, id) {
  this.log.push(['PC', colour, id]);
};

exports.penPattern = function(pattern, id) {
  this.log.push(['PS', pattern, id]);
};

exports.hideTurtle = function(id) {
  this.log.push(['HT', id]);
};

exports.showTurtle = function(id) {
  this.log.push(['ST', id]);
};

exports.drawStamp = function(stamp, id) {
  this.log.push(['stamp', stamp, id]);
};

},{"../base":3,"../utils":136}]},{},[130]);
