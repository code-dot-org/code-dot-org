require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/turtle/main.js":[function(require,module,exports){
'use strict';

var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var Artist = require('./turtle');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.turtleMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var artist = new Artist();

  window.__TestInterface.setSpeedSliderValue = function (value) {
    artist.speedSlider.setValue(value);
  };
  artist.injectStudioApp(studioApp);
  appMain(artist, levels, options);
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/turtle/blocks.js","./levels":"/home/ubuntu/staging/apps/build/js/turtle/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/turtle/skins.js","./turtle":"/home/ubuntu/staging/apps/build/js/turtle/turtle.js"}],"/home/ubuntu/staging/apps/build/js/turtle/skins.js":[function(require,module,exports){
'use strict';

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

  // stamps aren't actually used on production anywhere right now. if we were
  // to want to use them, define the mapping from image to name here.
  skin.stampValues = [[skin.avatar, 'DEFAULT']];

  // Get properties from config
  var isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  for (var prop in config) {
    skin[prop] = config[prop];
  }

  // TODO (br-pair) : Some of these keys are actually undefined. Clean this up
  skin.lineStylePatternOptions = [[skin.patternDefault, 'DEFAULT'], //  signals return to default path drawing
  [skin.rainbowMenu, 'rainbowLine'], // set to property name for image within skin
  [skin.ropeMenu, 'ropeLine'], // referenced as skin[pattern];
  [skin.squigglyMenu, 'squigglyLine'], [skin.swirlyMenu, 'swirlyLine'], [skin.annaLine, 'annaLine'], [skin.elsaLine, 'elsaLine'], [skin.annaLine_2x, 'annaLine_2x'], [skin.elsaLine_2x, 'elsaLine_2x']];

  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/turtle/blocks.js":[function(require,module,exports){
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

var Colours = require('./colours');
var msg = require('./locale');
var commonMsg = require('../locale');

var customLevelBlocks = require('./customLevelBlocks');
var Turtle = require('./turtle');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function gensym(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  if (skin.id == "anna" || skin.id == "elsa") {
    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [Colours.FROZEN1, Colours.FROZEN2, Colours.FROZEN3, Colours.FROZEN4, Colours.FROZEN5, Colours.FROZEN6, Colours.FROZEN7, Colours.FROZEN8, Colours.FROZEN9];
    blockly.FieldColour.COLUMNS = 3;
  } else {

    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [
    // Row 1.
    Colours.BLACK, Colours.GREY, Colours.KHAKI, Colours.WHITE,
    // Row 2.
    Colours.RED, Colours.PINK, Colours.ORANGE, Colours.YELLOW,
    // Row 3.
    Colours.GREEN, Colours.BLUE, Colours.AQUAMARINE, Colours.PLUM];
    blockly.FieldColour.COLUMNS = 4;
  }

  // Block definitions.
  blockly.Blocks.draw_move_by_constant = {
    // Block for moving forward or backward the internal number of pixels.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('100', blockly.FieldTextInput.numberValidator), 'VALUE').appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveForwardTooltip());
    }
  };

  blockly.Blocks.draw_move_by_constant_dropdown = {
    // Block for moving forward or backward the internal number of pixels.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(), 'VALUE').appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveForwardTooltip());
    }
  };

  generator.draw_move_by_constant = function () {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.draw_move_by_constant_dropdown = generator.draw_move_by_constant;

  blockly.Blocks.draw_turn_by_constant_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.VALUE), 'VALUE').appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_by_constant_restricted.VALUE = [30, 45, 60, 90, 120, 135, 150, 180].map(function (t) {
    return [String(t), String(t)];
  });

  generator.draw_turn_by_constant_restricted = function () {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_turn_by_constant = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('90', blockly.FieldTextInput.numberValidator), 'VALUE').appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_by_constant_dropdown = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(), 'VALUE').appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  generator.draw_turn_by_constant = function () {
    // Generate JavaScript for turning left or right.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.draw_turn_by_constant_dropdown = generator.draw_turn_by_constant;

  generator.draw_move_inline = function () {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_turn_inline_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.VALUE), 'VALUE').appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_inline_restricted.VALUE = [30, 45, 60, 90, 120, 135, 150, 180].map(function (t) {
    return [String(t), String(t)];
  });

  generator.draw_turn_inline_restricted = function () {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_turn_inline = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('90', blockly.FieldTextInput.numberValidator), 'VALUE').appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  generator.draw_turn_inline = function () {
    // Generate JavaScript for turning left or right.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.variables_get_counter = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(blockly.Msg.VARIABLES_GET_TITLE).appendTitle(new blockly.FieldLabel(msg.loopVariable()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function getVars() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_counter = generator.variables_get;

  blockly.Blocks.variables_get_length = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(blockly.Msg.VARIABLES_GET_TITLE).appendTitle(new blockly.FieldLabel(msg.lengthParameter()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function getVars() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_length = generator.variables_get;

  blockly.Blocks.variables_get_sides = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(blockly.Msg.VARIABLES_GET_TITLE).appendTitle(new blockly.FieldLabel('sides'), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: function getVars() {
      return [this.getTitleValue('VAR')];
    }
  };

  generator.variables_get_sides = generator.variables_get;

  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square = {
    // Draw a square.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC) || 0;
    var loopVar = gensym('count');
    return [
    // The generated comment helps detect required blocks.
    // Don't change it without changing requiredBlocks_.
    '// draw_a_square', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(90);', '}\n'].join('\n');
  };

  // Create a fake "draw a snowman" function so it can be made available to
  // users without being shown in the workspace.
  blockly.Blocks.draw_a_snowman = {
    // Draw a circle in front of the turtle, ending up on the opposite side.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawASnowman());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowman = function () {
    // Generate JavaScript for drawing a snowman in front of the turtle.
    var value = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var distancesVar = gensym('distances');
    var loopVar = gensym('counter');
    var degreeVar = gensym('degree');
    var distanceVar = gensym('distance');
    return [
    // The generated comment helps detect required blocks.
    // Don't change it without changing requiredBlocks_.
    '// draw_a_snowman', 'Turtle.turnLeft(90);', 'var ' + distancesVar + ' = [' + value + ' * 0.5, ' + value + ' * 0.3,' + value + ' * 0.2];', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' + loopVar + '++) {\n', '  var ' + distanceVar + ' = ' + distancesVar + '[' + loopVar + ' < 3 ? ' + loopVar + ': 5 - ' + loopVar + '] / 57.5;', '  for (var ' + degreeVar + ' = 0; ' + degreeVar + ' < 90; ' + degreeVar + '++) {', '    Turtle.moveForward(' + distanceVar + ');', '    Turtle.turnRight(2);', '  }', '  if (' + loopVar + ' != 2) {', '    Turtle.turnLeft(180);', '  }', '}', 'Turtle.turnLeft(90);\n'].join('\n');
  };

  // This is a modified copy of blockly.Blocks.controls_for with the
  // variable named "counter" hardcoded.
  blockly.Blocks.controls_for_counter = {
    // For loop with hardcoded loop variable.
    helpUrl: blockly.Msg.CONTROLS_FOR_HELPURL,
    init: function init() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle(blockly.Msg.CONTROLS_FOR_INPUT_WITH).appendTitle(new blockly.FieldLabel(msg.loopVariable()), 'VAR');
      this.interpolateMsg(blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY, ['FROM', 'Number', blockly.ALIGN_RIGHT], ['TO', 'Number', blockly.ALIGN_RIGHT], ['BY', 'Number', blockly.ALIGN_RIGHT], blockly.ALIGN_RIGHT);
      this.appendStatementInput('DO').appendTitle(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip(blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1', this.getTitleValue('VAR')));
    },
    getVars: function getVars() {
      return [this.getTitleValue('VAR')];
    },
    customContextMenu: function customContextMenu(options) {
      var option = { enabled: true };
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
    mutationToDom: function mutationToDom() {
      var container = document.createElement('mutation');
      var counter = this.getTitleValue('VAR');
      container.setAttribute('counter', counter);
      return container;
    },
    // deserialize the counter variable name
    domToMutation: function domToMutation(xmlElement) {
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
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER).appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.draw_move.DIRECTIONS = [[msg.moveForward(), 'moveForward'], [msg.moveBackward(), 'moveBackward']];

  generator.draw_move = function () {
    // Generate JavaScript for moving forward or backwards.
    var value = generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.jump = {
    // Block for moving forward or backwards.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER).appendTitle(new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  var longMoveLengthDropdownValue = "LONG_MOVE_LENGTH";
  var shortMoveLengthDropdownValue = "SHORT_MOVE_LENGTH";
  var simpleLengthChoices = [[skin.longLineDraw, longMoveLengthDropdownValue], [skin.shortLineDraw, shortMoveLengthDropdownValue]];
  var simpleLengthRightChoices = [[skin.longLineDrawRight, longMoveLengthDropdownValue], [skin.shortLineDrawRight, shortMoveLengthDropdownValue]];

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
        imageDimensions: { width: 72, height: 56 },
        lengths: simpleLengthChoices
      },
      right: {
        title: commonMsg.directionEastLetter(),
        moveFunction: 'moveRight',
        tooltip: msg.moveEastTooltip(),
        image: skin.eastLineDraw,
        imageDimensions: { width: 72, height: 56 },
        lengths: simpleLengthRightChoices
      },
      up: {
        title: commonMsg.directionNorthLetter(),
        moveFunction: 'moveUp',
        tooltip: msg.moveNorthTooltip(),
        image: skin.northLineDraw,
        imageDimensions: { width: 72, height: 56 },
        lengths: simpleLengthChoices
      },
      down: {
        title: commonMsg.directionSouthLetter(),
        moveFunction: 'moveDown',
        tooltip: msg.moveSouthTooltip(),
        image: skin.southLineDraw,
        imageDimensions: { width: 72, height: 56 },
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
    generateBlocksForAllDirections: function generateBlocksForAllDirections() {
      SimpleMove.generateBlocksForDirection("up");
      SimpleMove.generateBlocksForDirection("down");
      SimpleMove.generateBlocksForDirection("left");
      SimpleMove.generateBlocksForDirection("right");
    },
    generateBlocksForDirection: function generateBlocksForDirection(direction) {
      generator["simple_move_" + direction] = SimpleMove.generateCodeGenerator(direction);
      generator["simple_jump_" + direction] = SimpleMove.generateCodeGenerator('jump_' + direction);
      generator["simple_move_" + direction + "_length"] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks['simple_move_' + direction + '_length'] = SimpleMove.generateMoveBlock(direction, true);
      blockly.Blocks['simple_move_' + direction] = SimpleMove.generateMoveBlock(direction);
      blockly.Blocks['simple_jump_' + direction] = SimpleMove.generateMoveBlock('jump_' + direction);
    },
    generateMoveBlock: function generateMoveBlock(direction, hasLengthInput) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      var directionLetterWidth = 12;
      return {
        helpUrl: '',
        init: function init() {
          this.setHSV(184, 1.00, 0.74);
          var input = this.appendDummyInput();
          if (directionConfig.isJump) {
            input.appendTitle(commonMsg.jump());
          }
          input.appendTitle(new blockly.FieldLabel(directionConfig.title, { fixedSize: { width: directionLetterWidth, height: 18 } }));

          if (directionConfig.imageDimensions) {
            input.appendTitle(new blockly.FieldImage(directionConfig.image, directionConfig.imageDimensions.width, directionConfig.imageDimensions.height));
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
    generateCodeGenerator: function generateCodeGenerator(direction, hasLengthInput, length) {
      return function () {
        length = length || SimpleMove.DEFAULT_MOVE_LENGTH;

        if (hasLengthInput) {
          length = SimpleMove[this.getTitleValue("length")];
        }
        return 'Turtle.' + SimpleMove.DIRECTION_CONFIGS[direction].moveFunction + '(' + length + ',' + '\'block_id_' + this.id + '\');\n';
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  blockly.Blocks.jump.DIRECTIONS = [[msg.jumpForward(), 'jumpForward'], [msg.jumpBackward(), 'jumpBackward']];

  generator.jump = function () {
    // Generate JavaScript for jumping forward or backwards.
    var value = generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.jump_by_constant = {
    // Block for moving forward or backward the internal number of pixels
    // without drawing.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('100', blockly.FieldTextInput.numberValidator), 'VALUE').appendTitle(msg.dots());
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
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(), 'VALUE').appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  generator.jump_by_constant = function () {
    // Generate JavaScript for moving forward or backward the internal number
    // of pixels without drawing.
    var value = window.parseFloat(this.getTitleValue('VALUE')) || 0;
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };
  generator.jump_by_constant_dropdown = generator.jump_by_constant;

  blockly.Blocks.draw_turn = {
    // Block for turning left or right.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER).appendTitle(new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS), 'DIR');
      this.appendDummyInput().appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn.DIRECTIONS = [[msg.turnRight(), 'turnRight'], [msg.turnLeft(), 'turnLeft']];

  generator.draw_turn = function () {
    // Generate JavaScript for turning left or right.
    var value = generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return 'Turtle.' + this.getTitleValue('DIR') + '(' + value + ', \'block_id_' + this.id + '\');\n';
  };

  // this is the old version of this block, that should only still be used in
  // old shared levels
  blockly.Blocks.draw_width = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('WIDTH').setCheck(blockly.BlockValueType.NUMBER).appendTitle(msg.setWidth());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width = function () {
    // Generate JavaScript for setting the pen width.
    var width = generator.valueToCode(this, 'WIDTH', generator.ORDER_NONE) || '1';
    return 'Turtle.penWidth(' + width + ', \'block_id_' + this.id + '\');\n';
  };

  // inlined version of draw_width
  blockly.Blocks.draw_width_inline = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.setInputsInline(true);
      this.appendDummyInput().appendTitle(msg.setWidth());
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator), 'WIDTH');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width_inline = function () {
    // Generate JavaScript for setting the pen width.
    var width = this.getTitleValue('WIDTH');
    return 'Turtle.penWidth(' + width + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_pen = {
    // Block for pen up/down.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.STATE), 'PEN');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.penTooltip());
    }
  };

  blockly.Blocks.draw_pen.STATE = [[msg.penUp(), 'penUp'], [msg.penDown(), 'penDown']];

  generator.draw_pen = function () {
    // Generate JavaScript for pen up/down.
    return 'Turtle.' + this.getTitleValue('PEN') + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_colour = {
    // Block for setting the colour.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendValueInput('COLOUR').setCheck(blockly.BlockValueType.COLOUR).appendTitle(msg.setColour());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip(msg.colourTooltip());
    }
  };

  blockly.Blocks.alpha = {
    // TODO:
    // - Add alpha to a group
    // - Make sure it doesn't count against correct solutions
    //
    init: function init() {
      this.appendDummyInput().appendTitle(msg.setAlpha());
      this.appendValueInput("VALUE").setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setHSV(196, 1.0, 0.79);
      this.setTooltip('');
    }
  };

  generator.alpha = function () {
    var alpha = generator.valueToCode(this, 'VALUE', Blockly.JavaScript.ORDER_NONE);
    return 'Turtle.globalAlpha(' + alpha + ', \'block_id_' + this.id + '\');\n';
  };

  generator.draw_colour = function () {
    // Generate JavaScript for setting the colour.
    var colour = generator.valueToCode(this, 'COLOUR', generator.ORDER_NONE) || '\'#000000\'';
    return 'Turtle.penColour(' + colour + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_colour_simple = {
    // Simplified dropdown block for setting the colour.
    init: function init() {
      var colours = [Colours.RED, Colours.BLACK, Colours.PINK, Colours.ORANGE, Colours.YELLOW, Colours.GREEN, Colours.BLUE, Colours.AQUAMARINE, Colours.PLUM];
      this.setHSV(196, 1.0, 0.79);
      var colourField = new Blockly.FieldColourDropdown(colours, 45, 35);
      this.appendDummyInput().appendTitle(msg.setColour()).appendTitle(colourField, 'COLOUR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.colourTooltip());
    }
  };

  generator.draw_colour_simple = function () {
    // Generate JavaScript for setting the colour.
    var colour = this.getTitleValue('COLOUR') || '\'#000000\'';
    return 'Turtle.penColour("' + colour + '", \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.draw_line_style_pattern = {
    // Block to handle event when an arrow button is pressed.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput().appendTitle(msg.setPattern()).appendTitle(new blockly.FieldImageDropdown(skin.lineStylePatternOptions, 150, 20), 'VALUE');
      this.setTooltip(msg.setPattern());
    }
  };

  generator.draw_line_style_pattern = function () {
    // Generate JavaScript for setting the image for a patterned line.
    var pattern = this.getTitleValue('VALUE') || '\'DEFAULT\'';
    return 'Turtle.penPattern("' + pattern + '", \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.up_big = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.STATE), 'VISIBILITY');
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  generator.up_big = function () {
    // Generate JavaScript for setting the colour.
    var colour = generator.valueToCode(this, 'COLOUR', generator.ORDER_NONE) || '\'#000000\'';
    return 'Turtle.penColour(' + colour + ', \'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.turtle_visibility = {
    // Block for changing turtle visiblity.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.STATE), 'VISIBILITY');
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  blockly.Blocks.turtle_visibility.STATE = [[msg.hideTurtle(), 'hideTurtle'], [msg.showTurtle(), 'showTurtle']];

  generator.turtle_visibility = function () {
    // Generate JavaScript for changing turtle visibility.
    return 'Turtle.' + this.getTitleValue('VISIBILITY') + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.turtle_stamp = {
    helpUrl: '',
    init: function init() {
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

  // block is currently unused. if we want to add it back in the future, add
  // stamp images here
  blockly.Blocks.turtle_stamp.VALUES = skin.stampValues;

  generator.turtle_stamp = function () {
    return 'Turtle.drawStamp("' + this.getTitleValue('VALUE') + '", \'block_id_' + this.id + '\');\n';
  };

  customLevelBlocks.install(blockly, generator, gensym);
};

},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./colours":"/home/ubuntu/staging/apps/build/js/turtle/colours.js","./customLevelBlocks":"/home/ubuntu/staging/apps/build/js/turtle/customLevelBlocks.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js","./turtle":"/home/ubuntu/staging/apps/build/js/turtle/turtle.js"}],"/home/ubuntu/staging/apps/build/js/turtle/turtle.js":[function(require,module,exports){
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

// Globals used in this file:
//  Blockly

/**
 * @fileoverview Demonstration of Blockly: Turtle Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var commonMsg = require('../locale');
var turtleMsg = require('./locale');
var levels = require('./levels');
var Colours = require('./colours');
var codegen = require('../codegen');
var ArtistAPI = require('./api');
var page = require('../templates/page.html.ejs');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var Slider = require('../slider');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var JOINT_RADIUS = 4;

var SMOOTH_ANIMATE_STEP_SIZE = 5;
var FAST_SMOOTH_ANIMATE_STEP_SIZE = 15;

/**
* Minimum joint segment length
*/
var JOINT_SEGMENT_LENGTH = 50;

/**
 * An x offset against the sprite edge where the decoration should be drawn,
 * along with whether it should be drawn before or after the turtle sprite itself.
 */
var ELSA_DECORATION_DETAILS = [{ x: 15, when: "after" }, { x: 26, when: "after" }, { x: 37, when: "after" }, { x: 46, when: "after" }, { x: 60, when: "after" }, { x: 65, when: "after" }, { x: 66, when: "after" }, { x: 64, when: "after" }, { x: 62, when: "before" }, { x: 55, when: "before" }, { x: 48, when: "before" }, { x: 33, when: "before" }, { x: 31, when: "before" }, { x: 22, when: "before" }, { x: 17, when: "before" }, { x: 12, when: "before" }, { x: 8, when: "after" }, { x: 10, when: "after" }];

/**
 * An instantiable Artist class
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var Artist = function Artist() {
  this.skin = null;
  this.level = null;

  this.api = new ArtistAPI();

  // image icons and image paths for the 'set pattern block'
  this.lineStylePatternOptions = [];
  this.stamps = [];

  // PID of animation task currently executing.
  this.pid = 0;

  // Should the turtle be drawn?
  this.visible = true;

  // Set a turtle heading.
  this.heading = 0;

  // The avatar image
  this.avatarImage = new Image();
  this.numberAvatarHeadings = undefined;

  // The avatar animation decoration image
  this.decorationAnimationImage = new Image();

  // Drawing with a pattern
  this.currentPathPattern = new Image();
  this.loadedPathPatterns = [];
  this.isDrawingWithPattern = false;

  // these get set by init based on skin.
  this.avatarWidth = 0;
  this.avatarHeight = 0;
  this.decorationAnimationWidth = 85;
  this.decorationAnimationHeight = 85;
  this.speedSlider = null;

  this.ctxAnswer = null;
  this.ctxImages = null;
  this.ctxPredraw = null;
  this.ctxScratch = null;
  this.ctxPattern = null;
  this.ctxFeedback = null;
  this.ctxDisplay = null;

  this.isDrawingAnswer_ = false;
  this.isPredrawing_ = false;
};

module.exports = Artist;

/**
 * todo
 */
Artist.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = _.bind(this.reset, this);
  this.studioApp_.runButtonClick = _.bind(this.runButtonClick, this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and the turtle.  Called on page load.
 */
Artist.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("Artist requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  // Preload stamp images
  this.stamps = [];
  for (var i = 0; i < this.skin.stampValues.length; i++) {
    var url = this.skin.stampValues[i][0];
    var key = this.skin.stampValues[i][1];
    var img = new Image();
    img.src = url;
    this.stamps[key] = img;
  }

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // let's try adding a background image
    this.level.images = [{}];
    this.level.images[0].filename = 'background.jpg';

    this.level.images[0].position = [0, 0];
    this.level.images[0].scale = 1;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';
  config.dropletConfig = dropletConfig;

  if (this.skin.id == "anna") {
    this.avatarWidth = 73;
    this.avatarHeight = 100;
  } else if (this.skin.id == "elsa") {
    this.avatarWidth = 73;
    this.avatarHeight = 100;
    this.decorationAnimationWidth = 85;
    this.decorationAnimationHeight = 85;
  } else {
    this.avatarWidth = 70;
    this.avatarHeight = 51;
  }

  var iconPath = 'media/turtle/' + (config.isLegacyShare && config.hideSource ? 'icons_white.png' : 'icons.png');
  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html.ejs')({ assetUrl: this.studioApp_.assetUrl, iconPath: iconPath }),
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: this.level.editCode,
      blockCounterClass: 'block-counter-default',
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

  config.loadAudio = _.bind(this.loadAudio_, this);
  config.afterInject = _.bind(this.afterInject_, this, config);

  this.studioApp_.init(config);
};

Artist.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
Artist.prototype.afterInject_ = function (config) {
  // Initialize the slider.
  var slider = document.getElementById('slider');
  this.speedSlider = new Slider(10, 35, 130, slider);

  // Change default speed (eg Speed up levels that have lots of steps).
  if (config.level.sliderSpeed) {
    this.speedSlider.setValue(config.level.sliderSpeed);
  }

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Turtle,code');
  }

  // Create hidden canvases.
  this.ctxAnswer = this.createCanvas_('answer', 400, 400).getContext('2d');
  this.ctxImages = this.createCanvas_('images', 400, 400).getContext('2d');
  this.ctxPredraw = this.createCanvas_('predraw', 400, 400).getContext('2d');
  this.ctxScratch = this.createCanvas_('scratch', 400, 400).getContext('2d');
  this.ctxPattern = this.createCanvas_('pattern', 400, 400).getContext('2d');
  this.ctxFeedback = this.createCanvas_('feedback', 154, 154).getContext('2d');

  // Create display canvas.
  var displayCanvas = this.createCanvas_('display', 400, 400);

  var visualization = document.getElementById('visualization');
  visualization.appendChild(displayCanvas);
  this.ctxDisplay = displayCanvas.getContext('2d');

  // TODO (br-pair): - pull this out?
  if (this.studioApp_.isUsingBlockly() && (this.skin.id === "anna" || this.skin.id === "elsa")) {
    // Override colour_random to only generate random colors from within our frozen
    // palette
    Blockly.JavaScript.colour_random = function () {
      // Generate a random colour.
      if (!Blockly.JavaScript.definitions_.colour_random) {
        var functionName = Blockly.JavaScript.variableDB_.getDistinctName('colour_random', Blockly.Generator.NAME_TYPE);
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

  this.loadDecorationAnimation();

  // Set their initial contents.
  this.loadTurtle();
  this.drawImages();

  this.isDrawingAnswer_ = true;
  this.drawAnswer();
  this.isDrawingAnswer_ = false;

  if (this.level.predrawBlocks) {
    this.isPredrawing_ = true;
    this.drawBlocksOnCanvas(this.level.predrawBlocks, this.ctxPredraw);
    this.isPredrawing_ = false;
  }

  // pre-load image for line pattern block. Creating the image object and setting source doesn't seem to be
  // enough in this case, so we're actually creating and reusing the object within the document body.

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    var imageContainer = document.createElement('div');
    imageContainer.style.display = 'none';
    document.body.appendChild(imageContainer);

    for (var i = 0; i < this.skin.lineStylePatternOptions.length; i++) {
      var pattern = this.skin.lineStylePatternOptions[i][1];
      if (this.skin[pattern]) {
        var img = new Image();
        img.src = this.skin[pattern];
        this.loadedPathPatterns[pattern] = img;
      }
    }
  }

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';
};

/**
 * On startup draw the expected answer and save it to the answer canvas.
 */
Artist.prototype.drawAnswer = function () {
  if (this.level.solutionBlocks) {
    this.drawBlocksOnCanvas(this.level.solutionBlocks, this.ctxAnswer);
  } else {
    this.drawLogOnCanvas(this.level.answer, this.ctxAnswer);
  }
};

/**
 * Given a set of commands and a canvas, draws the commands onto the canvas
 * composited over the scratch canvas.
 */
Artist.prototype.drawLogOnCanvas = function (log, canvas) {
  this.studioApp_.reset();
  while (log.length) {
    var tuple = log.shift();
    this.step(tuple[0], tuple.splice(1), { smoothAnimate: false });
    this.resetStepInfo_();
  }
  canvas.globalCompositeOperation = 'copy';
  canvas.drawImage(this.ctxScratch.canvas, 0, 0);
  canvas.globalCompositeOperation = 'source-over';
};

/**
 * Evaluates blocks or code, and draws onto given canvas.
 */
Artist.prototype.drawBlocksOnCanvas = function (blocksOrCode, canvas) {
  var code;
  if (this.studioApp_.isUsingBlockly()) {
    var domBlocks = Blockly.Xml.textToDom(blocksOrCode);
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, domBlocks);
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = blocksOrCode;
  }
  this.evalCode(code);
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.clear();
  }
  this.drawCurrentBlocksOnCanvas(canvas);
};

/**
 * Draws the results of block evaluation (stored on api.log) onto the given
 * canvas.
 */
Artist.prototype.drawCurrentBlocksOnCanvas = function (canvas) {
  this.drawLogOnCanvas(this.api.log, canvas);
};

/**
 * Place an image at the specified coordinates.
 * Code from http://stackoverflow.com/questions/5495952. Thanks, Phrogz.
 * @param {string} filename Relative path to image.
 * @param {!Array} position An x-y pair.
 * @param {number} optional scale at which image is drawn
 */
Artist.prototype.placeImage = function (filename, position, scale) {
  var img = new Image();
  img.onload = _.bind(function () {
    if (img.width !== 0) {
      if (scale) {
        this.ctxImages.drawImage(img, position[0], position[1], img.width, img.height, 0, 0, img.width * scale, img.height * scale);
      } else {
        this.ctxImages.drawImage(img, position[0], position[1]);
      }
    }
    this.display();
  }, this);

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    img.src = this.skin.assetUrl(filename);
  } else {
    img.src = this.studioApp_.assetUrl('media/turtle/' + filename);
  }
};

/**
 * Draw the images for this page and level onto this.ctxImages.
 */
Artist.prototype.drawImages = function () {
  if (!this.level.images) {
    return;
  }
  for (var i = 0; i < this.level.images.length; i++) {
    var image = this.level.images[i];
    this.placeImage(image.filename, image.position, image.scale);
  }
  this.ctxImages.globalCompositeOperation = 'copy';
  this.ctxImages.drawImage(this.ctxScratch.canvas, 0, 0);
  this.ctxImages.globalCompositeOperation = 'source-over';
};

/**
 * Initial the turtle image on load.
 */
Artist.prototype.loadTurtle = function () {
  this.avatarImage.onload = _.bind(this.display, this);

  this.avatarImage.src = this.skin.avatar;
  if (this.skin.id == "anna") {
    this.numberAvatarHeadings = 36;
  } else if (this.skin.id == "elsa") {
    this.numberAvatarHeadings = 18;
  } else {
    this.numberAvatarHeadings = 180;
  }
  this.avatarImage.spriteHeight = this.avatarHeight;
  this.avatarImage.spriteWidth = this.avatarWidth;
};

/**
 * Initial the turtle animation deocration on load.
 */
Artist.prototype.loadDecorationAnimation = function () {
  if (this.skin.id == "elsa") {
    this.decorationAnimationImage.src = this.skin.decorationAnimation;
    this.decorationAnimationImage.height = this.decorationAnimationHeight;
    this.decorationAnimationImage.width = this.decorationAnimationWidth;
  }
};

var turtleFrame = 0;

/**
 * Draw the turtle image based on this.x, this.y, and this.heading.
 */
Artist.prototype.drawTurtle = function () {
  var sourceY;
  // Computes the index of the image in the sprite.
  var index = Math.floor(this.heading * this.numberAvatarHeadings / 360);
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // the rotations in the sprite sheet go in the opposite direction.
    index = this.numberAvatarHeadings - index;

    // and they are 180 degrees out of phase.
    index = (index + this.numberAvatarHeadings / 2) % this.numberAvatarHeadings;
  }
  var sourceX = this.avatarImage.spriteWidth * index;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    sourceY = this.avatarImage.spriteHeight * turtleFrame;
    turtleFrame = (turtleFrame + 1) % this.skin.turtleNumFrames;
  } else {
    sourceY = 0;
  }
  var sourceWidth = this.avatarImage.spriteWidth;
  var sourceHeight = this.avatarImage.spriteHeight;
  var destWidth = this.avatarImage.spriteWidth;
  var destHeight = this.avatarImage.spriteHeight;
  var destX = this.x - destWidth / 2;
  var destY = this.y - destHeight + 7;

  if (this.avatarImage.width === 0 || this.avatarImage.height === 0) {
    return;
  }

  if (sourceX < 0 || sourceY < 0 || sourceX + sourceWidth - 0 > this.avatarImage.width || sourceY + sourceHeight > this.avatarImage.height) {
    if (console && console.log) {
      // TODO(bjordan): ask Brent, starting to flood grunt mochaTest messages,
      // better fix here?
      // console.log("drawImage is out of source bounds!");
    }
    return;
  }

  if (this.avatarImage.width !== 0) {
    this.ctxDisplay.drawImage(this.avatarImage, Math.round(sourceX), Math.round(sourceY), sourceWidth - 0, sourceHeight, Math.round(destX), Math.round(destY), destWidth - 0, destHeight);
  }
};

/**
  * This is called twice, once with "before" and once with "after", referring to before or after
  * the sprite is drawn.  For some angles it should be drawn before, and for some after.
  */

Artist.prototype.drawDecorationAnimation = function (when) {
  if (this.skin.id == "elsa") {
    var frameIndex = (turtleFrame + 10) % this.skin.decorationAnimationNumFrames;

    var angleIndex = Math.floor(this.heading * this.numberAvatarHeadings / 360);

    // the rotations in the Anna & Elsa sprite sheets go in the opposite direction.
    angleIndex = this.numberAvatarHeadings - angleIndex;

    // and they are 180 degrees out of phase.
    angleIndex = (angleIndex + this.numberAvatarHeadings / 2) % this.numberAvatarHeadings;

    if (ELSA_DECORATION_DETAILS[angleIndex].when == when) {
      var sourceX = this.decorationAnimationImage.width * frameIndex;
      var sourceY = 0;
      var sourceWidth = this.decorationAnimationImage.width;
      var sourceHeight = this.decorationAnimationImage.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = this.x - destWidth / 2 - 15 - 15 + ELSA_DECORATION_DETAILS[angleIndex].x;
      var destY = this.y - destHeight / 2 - 100;

      if (this.decorationAnimationImage.width !== 0) {
        this.ctxDisplay.drawImage(this.decorationAnimationImage, Math.round(sourceX), Math.round(sourceY), sourceWidth, sourceHeight, Math.round(destX), Math.round(destY), destWidth, destHeight);
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
Artist.prototype.reset = function (ignore) {
  // Standard starting location and heading of the turtle.
  this.x = CANVAS_HEIGHT / 2;
  this.y = CANVAS_WIDTH / 2;
  this.heading = this.level.startDirection !== undefined ? this.level.startDirection : 90;
  this.penDownValue = true;
  this.visible = true;

  // For special cases, use a different initial location.
  if (this.level.initialX !== undefined) {
    this.x = this.level.initialX;
  }
  if (this.level.initialY !== undefined) {
    this.y = this.level.initialY;
  }
  // Clear the display.
  this.ctxScratch.canvas.width = this.ctxScratch.canvas.width;
  this.ctxPattern.canvas.width = this.ctxPattern.canvas.width;
  if (this.skin.id == "anna") {
    this.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    this.ctxScratch.fillStyle = 'rgb(255,255,255)';
    this.ctxScratch.lineWidth = 2;
  } else if (this.skin.id == "elsa") {
    this.ctxScratch.strokeStyle = 'rgb(255,255,255)';
    this.ctxScratch.fillStyle = 'rgb(255,255,255)';
    this.ctxScratch.lineWidth = 2;
  } else {
    this.ctxScratch.strokeStyle = '#000000';
    this.ctxScratch.fillStyle = '#000000';
    this.ctxScratch.lineWidth = 5;
  }

  this.ctxScratch.lineCap = 'round';
  this.ctxScratch.font = 'normal 18pt Arial';
  this.display();

  // Clear the feedback.
  this.ctxFeedback.clearRect(0, 0, this.ctxFeedback.canvas.width, this.ctxFeedback.canvas.height);

  if (this.skin.id == "anna") {
    this.setPattern("annaLine");
  } else if (this.skin.id == "elsa") {
    this.setPattern("elsaLine");
  } else {
    // Reset to empty pattern
    this.setPattern(null);
  }

  // Kill any task.
  if (this.pid) {
    window.clearTimeout(this.pid);
  }
  this.pid = 0;

  // Discard the interpreter.
  this.interpreter = null;
  this.executionError = null;

  // Stop the looping sound.
  this.studioApp_.stopLoopingAudio('start');

  this.resetStepInfo_();
};

/**
 * Copy the scratch canvas to the display canvas. Add a turtle marker.
 */
Artist.prototype.display = function () {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = this.ctxDisplay.fillStyle;
  this.ctxDisplay.fillStyle = 'white';
  this.ctxDisplay.clearRect(0, 0, this.ctxDisplay.canvas.width, this.ctxDisplay.canvas.width);
  this.ctxDisplay.fillStyle = style;

  this.ctxDisplay.globalCompositeOperation = 'copy';
  // Draw the images layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxImages.canvas, 0, 0);

  // Draw the answer layer.
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    this.ctxDisplay.globalAlpha = 0.4;
  } else {
    this.ctxDisplay.globalAlpha = 0.15;
  }
  this.ctxDisplay.drawImage(this.ctxAnswer.canvas, 0, 0);
  this.ctxDisplay.globalAlpha = 1;

  // Draw the predraw layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxPredraw.canvas, 0, 0);

  // Draw the pattern layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxPattern.canvas, 0, 0);

  // Draw the user layer.
  this.ctxDisplay.globalCompositeOperation = 'source-over';
  this.ctxDisplay.drawImage(this.ctxScratch.canvas, 0, 0);

  // Draw the turtle.
  if (this.visible) {
    this.drawDecorationAnimation("before");
    this.drawTurtle();
    this.drawDecorationAnimation("after");
  }
};

/**
 * Click the run button.  Start the program.
 */
Artist.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();
};

Artist.prototype.evalCode = function (code) {
  try {
    codegen.evalWith(code, {
      Turtle: this.api
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
 * Set up this.code, this.interpreter, etc. to run code for editCode levels
 */
Artist.prototype.generateTurtleCodeFromJS_ = function () {
  this.code = dropletUtils.generateCodeAliases(dropletConfig, 'Turtle');
  this.userCodeStartOffset = this.code.length;
  this.code += this.studioApp_.editor.getValue();
  this.userCodeLength = this.code.length - this.userCodeStartOffset;

  var session = this.studioApp_.editor.aceEditor.getSession();
  this.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = _.bind(function (interpreter, scope) {
    codegen.initJSInterpreter(interpreter, null, null, scope, {
      Turtle: this.api
    });
  }, this);
  this.interpreter = new window.Interpreter(this.code, initFunc);
};

/**
 * Execute the user's code.  Heaven help us...
 */
Artist.prototype.execute = function () {
  this.api.log = [];

  // Reset the graphic.
  this.studioApp_.reset();

  if (this.studioApp_.hasExtraTopBlocks() || this.studioApp_.hasDuplicateVariablesInForLoops()) {
    // immediately check answer, which will fail and report top level blocks
    this.checkAnswer();
    return;
  }

  if (this.level.editCode) {
    this.generateTurtleCodeFromJS_();
  } else {
    this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    this.evalCode(this.code);
  }

  // api.log now contains a transcript of all the user's actions.
  this.studioApp_.playAudio('start', { loop: true });
  // animate the transcript.

  this.pid = window.setTimeout(_.bind(this.animate, this), 100);

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }
};

/**
 * Special case: if we have a turn, followed by a move forward, then we can just
 * do the turn instantly and then begin the move forward in the same frame.
 */
Artist.prototype.checkforTurnAndMove_ = function () {
  var nextIsForward = false;

  var currentTuple = this.api.log[0];
  var currentCommand = currentTuple[0];
  var currentValues = currentTuple.slice(1);

  // Check first for a small turn movement.
  if (currentCommand === 'RT') {
    var currentAngle = currentValues[0];
    if (Math.abs(currentAngle) <= 10) {
      // Check that next command is a move forward.
      if (this.api.log.length > 1) {
        var nextTuple = this.api.log[1];
        var nextCommand = nextTuple[0];
        if (nextCommand === 'FD') {
          nextIsForward = true;
        }
      }
    }
  }

  return nextIsForward;
};

/**
 * Attempt to execute one command from the log of API commands.
 */
Artist.prototype.executeTuple_ = function () {
  if (this.api.log.length === 0) {
    return false;
  }

  var executeSecondTuple;

  do {
    // Unless something special happens, we will just execute a single tuple.
    executeSecondTuple = false;

    var tuple = this.api.log[0];
    var command = tuple[0];
    var id = tuple[tuple.length - 1];

    this.studioApp_.highlight(String(id));

    // Should we execute another tuple in this frame of animation?
    if (this.skin.consolidateTurnAndMove && this.checkforTurnAndMove_()) {
      executeSecondTuple = true;
    }

    // We only smooth animate for Anna & Elsa, and only if there is not another tuple to be done.
    var tupleDone = this.step(command, tuple.slice(1), { smoothAnimate: this.skin.smoothAnimate && !executeSecondTuple });
    this.display();

    if (tupleDone) {
      this.api.log.shift();
      this.resetStepInfo_();
    }
  } while (executeSecondTuple);

  return true;
};

/**
 * Handle the tasks to be done after the user program is finished.
 */
Artist.prototype.finishExecution_ = function () {
  document.getElementById('spinner').style.visibility = 'hidden';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  this.checkAnswer();
};

/**
 * Iterate through the recorded path and animate the turtle's actions.
 */
Artist.prototype.animate = function () {

  // All tasks should be complete now.  Clean up the PID list.
  this.pid = 0;

  // Scale the speed non-linearly, to give better precision at the fast end.
  var stepSpeed = 1000 * Math.pow(1 - this.speedSlider.getValue(), 2) / this.skin.speedModifier;

  // when smoothAnimate is true, we divide long steps into partitions of this
  // size.
  this.smoothAnimateStepSize = stepSpeed === 0 ? FAST_SMOOTH_ANIMATE_STEP_SIZE : SMOOTH_ANIMATE_STEP_SIZE;

  if (this.level.editCode) {
    var stepped = true;
    while (stepped) {
      codegen.selectCurrentCode(this.interpreter, this.cumulativeLength, this.userCodeStartOffset, this.userCodeLength, this.studioApp_.editor);
      try {
        stepped = this.interpreter.step();
      } catch (err) {
        // TODO (cpirich): populate lineNumber as we do for studio/applab:
        this.executionError = { err: err, lineNumber: 1 };
        this.finishExecution_();
        return;
      }
      stepped = this.interpreter.step();

      if (this.executeTuple_()) {
        // We stepped far enough that we executed a commmand, break out:
        break;
      }
    }
    if (!stepped && !this.executeTuple_()) {
      // We dropped out of the step loop because we ran out of code, all done:
      this.finishExecution_();
      return;
    }
  } else {
    if (!this.executeTuple_()) {
      this.finishExecution_();
      return;
    }
  }

  this.pid = window.setTimeout(_.bind(this.animate, this), stepSpeed);
};

Artist.prototype.calculateSmoothAnimate = function (options, distance) {
  var tupleDone = true;
  var stepDistanceCovered = this.stepDistanceCovered;

  if (options && options.smoothAnimate) {
    var fullDistance = distance;
    var smoothAnimateStepSize = this.smoothAnimateStepSize;

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

  this.stepDistanceCovered = stepDistanceCovered;

  return { tupleDone: tupleDone, distance: distance };
};

/**
 * Execute one step.
 * @param {string} command Logo-style command (e.g. 'FD' or 'RT').
 * @param {!Array} values List of arguments for the command.
 * @param {number} fraction How much of this step's distance do we draw?
 * @param {object} single option for now: smoothAnimate (true/false)
 */
Artist.prototype.step = function (command, values, options) {
  var tupleDone = true;
  var result;
  var distance;
  var heading;

  switch (command) {
    case 'FD':
      // Forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.moveForward_(result.distance);
      break;
    case 'JF':
      // Jump forward
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.jumpForward_(result.distance);
      break;
    case 'MV':
      // Move (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.setHeading_(heading);
      this.moveForward_(result.distance);
      break;
    case 'JD':
      // Jump (direction)
      distance = values[0];
      heading = values[1];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.setHeading_(heading);
      this.jumpForward_(result.distance);
      break;
    case 'RT':
      // Right Turn
      distance = values[0];
      result = this.calculateSmoothAnimate(options, distance);
      tupleDone = result.tupleDone;
      this.turnByDegrees_(result.distance);
      break;
    case 'DP':
      // Draw Print
      this.ctxScratch.save();
      this.ctxScratch.translate(this.x, this.y);
      this.ctxScratch.rotate(2 * Math.PI * (this.heading - 90) / 360);
      this.ctxScratch.fillText(values[0], 0, 0);
      this.ctxScratch.restore();
      break;
    case 'GA':
      // Global Alpha
      var alpha = values[0];
      alpha = Math.max(0, alpha);
      alpha = Math.min(100, alpha);
      this.ctxScratch.globalAlpha = alpha / 100;
      break;
    case 'DF':
      // Draw Font
      this.ctxScratch.font = values[2] + ' ' + values[1] + 'pt ' + values[0];
      break;
    case 'PU':
      // Pen Up
      this.penDownValue = false;
      break;
    case 'PD':
      // Pen Down
      this.penDownValue = true;
      break;
    case 'PW':
      // Pen Width
      this.ctxScratch.lineWidth = values[0];
      break;
    case 'PC':
      // Pen Colour
      this.ctxScratch.strokeStyle = values[0];
      this.ctxScratch.fillStyle = values[0];
      if (this.skin.id != "anna" && this.skin.id != "elsa") {
        this.isDrawingWithPattern = false;
      }
      break;
    case 'PS':
      // Pen style with image
      if (!values[0] || values[0] == 'DEFAULT') {
        this.setPattern(null);
      } else {
        this.setPattern(values[0]);
      }
      break;
    case 'HT':
      // Hide Turtle
      this.visible = false;
      break;
    case 'ST':
      // Show Turtle
      this.visible = true;
      break;
    case 'stamp':
      var img = this.stamps[values[0]];
      var width = img.width / 2;
      var height = img.height / 2;
      var x = this.x - width / 2;
      var y = this.y - height / 2;
      if (img.width !== 0) {
        this.ctxScratch.drawImage(img, x, y, width, height);
      }
      break;
  }

  return tupleDone;
};

Artist.prototype.setPattern = function (pattern) {
  if (this.loadedPathPatterns[pattern]) {
    this.currentPathPattern = this.loadedPathPatterns[pattern];
    this.isDrawingWithPattern = true;
  } else if (pattern === null) {
    this.currentPathPattern = new Image();
    this.isDrawingWithPattern = false;
  }
};

Artist.prototype.jumpForward_ = function (distance) {
  this.x += distance * Math.sin(2 * Math.PI * this.heading / 360);
  this.y -= distance * Math.cos(2 * Math.PI * this.heading / 360);
};

Artist.prototype.moveByRelativePosition_ = function (x, y) {
  this.x += x;
  this.y += y;
};

Artist.prototype.dotAt_ = function (x, y) {
  // WebKit (unlike Gecko) draws nothing for a zero-length line, so draw a very short line.
  var dotLineLength = 0.1;
  this.ctxScratch.lineTo(x + dotLineLength, y);
};

Artist.prototype.circleAt_ = function (x, y, radius) {
  this.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI);
};

Artist.prototype.drawToTurtle_ = function (distance) {
  var isDot = distance === 0;
  if (isDot) {
    this.dotAt_(this.x, this.y);
  } else {
    this.ctxScratch.lineTo(this.x, this.y);
  }
};

Artist.prototype.turnByDegrees_ = function (degreesRight) {
  this.setHeading_(this.heading + degreesRight);
};

Artist.prototype.setHeading_ = function (heading) {
  heading = this.constrainDegrees_(heading);
  this.heading = heading;
};

Artist.prototype.constrainDegrees_ = function (degrees) {
  degrees %= 360;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
};

Artist.prototype.moveForward_ = function (distance) {
  if (!this.penDownValue) {
    this.jumpForward_(distance);
    return;
  }
  if (this.isDrawingWithPattern) {
    this.drawForwardLineWithPattern_(distance);

    // Frozen gets both a pattern and a line over the top of it.
    if (this.skin.id != "elsa" && this.skin.id != "anna") {
      return;
    }
  }

  this.drawForward_(distance);
};

Artist.prototype.drawForward_ = function (distance) {
  if (this.shouldDrawJoints_()) {
    this.drawForwardWithJoints_(distance);
  } else {
    this.drawForwardLine_(distance);
  }
};

/**
 * Draws a line of length `distance`, adding joint knobs along the way
 * @param distance
 */
Artist.prototype.drawForwardWithJoints_ = function (distance) {
  var remainingDistance = distance;

  while (remainingDistance > 0) {
    var enoughForFullSegment = remainingDistance >= JOINT_SEGMENT_LENGTH;
    var currentSegmentLength = enoughForFullSegment ? JOINT_SEGMENT_LENGTH : remainingDistance;

    remainingDistance -= currentSegmentLength;

    if (enoughForFullSegment) {
      this.drawJointAtTurtle_();
    }

    this.drawForwardLine_(currentSegmentLength);

    if (enoughForFullSegment) {
      this.drawJointAtTurtle_();
    }
  }
};

Artist.prototype.drawForwardLine_ = function (distance) {

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.stepStartX, this.stepStartY);
    this.jumpForward_(distance);
    this.drawToTurtle_(distance);
    this.ctxScratch.stroke();
  } else {
    this.ctxScratch.beginPath();
    this.ctxScratch.moveTo(this.x, this.y);
    this.jumpForward_(distance);
    this.drawToTurtle_(distance);
    this.ctxScratch.stroke();
  }
};

Artist.prototype.drawForwardLineWithPattern_ = function (distance) {
  var img;
  var startX;
  var startY;

  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    this.ctxPattern.moveTo(this.stepStartX, this.stepStartY);
    img = this.currentPathPattern;
    startX = this.stepStartX;
    startY = this.stepStartY;

    var lineDistance = Math.abs(this.stepDistanceCovered);

    this.ctxPattern.save();
    this.ctxPattern.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    this.ctxPattern.rotate(Math.PI * (this.heading - 90) / 180);

    var clipSize;
    if (lineDistance % this.smoothAnimateStepSize === 0) {
      clipSize = this.smoothAnimateStepSize;
    } else if (lineDistance > this.smoothAnimateStepSize) {
      // this happens when our line was not divisible by smoothAnimateStepSize
      // and we've hit our last chunk
      clipSize = lineDistance % this.smoothAnimateStepSize;
    } else {
      clipSize = lineDistance;
    }
    if (img.width !== 0) {
      this.ctxPattern.drawImage(img,
      // Start point for clipping image
      Math.round(lineDistance), 0,
      // clip region size
      clipSize, img.height,
      // some mysterious hand-tweaking done by Brendan
      Math.round(this.stepDistanceCovered - clipSize - 2), Math.round(-18), clipSize, img.height);
    }

    this.ctxPattern.restore();
  } else {

    this.ctxScratch.moveTo(this.x, this.y);
    img = this.currentPathPattern;
    startX = this.x;
    startY = this.y;

    this.jumpForward_(distance);
    this.ctxScratch.save();
    this.ctxScratch.translate(startX, startY);
    // increment the angle and rotate the image.
    // Need to subtract 90 to accomodate difference in canvas vs. Turtle direction
    this.ctxScratch.rotate(Math.PI * (this.heading - 90) / 180);

    if (img.width !== 0) {
      this.ctxScratch.drawImage(img,
      // Start point for clipping image
      0, 0,
      // clip region size
      distance + img.height / 2, img.height,
      // draw location relative to the ctx.translate point pre-rotation
      -img.height / 4, -img.height / 2, distance + img.height / 2, img.height);
    }

    this.ctxScratch.restore();
  }
};

Artist.prototype.shouldDrawJoints_ = function () {
  return this.level.isK1 && !this.isPredrawing_;
};

Artist.prototype.drawJointAtTurtle_ = function () {
  this.ctxScratch.beginPath();
  this.ctxScratch.moveTo(this.x, this.y);
  this.circleAt_(this.x, this.y, JOINT_RADIUS);
  this.ctxScratch.stroke();
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @param {number} permittedErrors Number of pixels allowed to be wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Artist.prototype.isCorrect_ = function (pixelErrors, permittedErrors) {
  return pixelErrors <= permittedErrors;
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
Artist.prototype.displayFeedback_ = function () {
  var feedbackImageCanvas;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    // For frozen skins, show background and characters along with drawing
    feedbackImageCanvas = this.ctxDisplay;
  } else {
    feedbackImageCanvas = this.ctxScratch;
  }

  var level = this.level;

  this.studioApp_.displayFeedback({
    app: 'turtle',
    skin: this.skin.id,
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay || level.impressive),
    // impressive levels are already saved
    alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
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
Artist.prototype.onReportComplete = function (response) {
  this.response = response;
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  this.studioApp_.onReportComplete(response);
  this.displayFeedback_();
};

// This removes lengths from the text version of the XML of programs.
// It is used to determine if the user program and model solution are
// identical except for lengths.
var removeK1Lengths = function removeK1Lengths(s) {
  return s.replace(removeK1Lengths.regex, '">');
};

removeK1Lengths.regex = /_length"><title name="length">.*?<\/title>/;

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
Artist.prototype.checkAnswer = function () {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var userImage = this.ctxScratch.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var answerImage = this.ctxAnswer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

  var level = this.level;

  // Allow some number of pixels to be off, but be stricter
  // for certain levels.
  var permittedErrors = level.permittedErrors;
  if (permittedErrors === undefined) {
    permittedErrors = 150;
  }

  // Test whether the current level is a free play level, or the level has
  // been completed
  var levelComplete = (level.freePlay || this.isCorrect_(delta, permittedErrors)) && (!level.editCode || !this.executionError);
  this.testResults = this.studioApp_.getTestResults(levelComplete);

  var program;
  if (this.studioApp_.isUsingBlockly()) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  this.message = undefined;

  // In level K1, check if only lengths differ.
  if (level.isK1 && !levelComplete && !this.studioApp_.editCode && level.solutionBlocks && removeK1Lengths(program) === removeK1Lengths(level.solutionBlocks)) {
    this.testResults = this.studioApp_.TestResults.APP_SPECIFIC_ERROR;
    this.message = turtleMsg.lengthFeedback();
  }

  // For levels where using too many blocks would allow students
  // to miss the point, convert that feedback to a failure.
  if (level.failForTooManyBlocks && this.testResults == this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.testResults = this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL;
  } else if (this.testResults == this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL || this.testResults == this.studioApp_.TestResults.ALL_PASS) {
    // Check that they didn't use a crazy large repeat value when drawing a
    // circle.  This complains if the limit doesn't start with 3.
    // Note that this level does not use colour, so no need to check for that.
    if (level.failForCircleRepeatValue && this.studioApp_.isUsingBlockly()) {
      var code = Blockly.Generator.blockSpaceToCode('JavaScript');
      if (code.indexOf('count < 3') == -1) {
        this.testResults = this.studioApp_.TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
        this.message = commonMsg.tooMuchWork();
      }
    }
  }

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = this.studioApp_.editor.getValue();
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    this.testResults = this.studioApp_.TestResults.FREE_PLAY;
  }

  // Play sound
  this.studioApp_.stopLoopingAudio('start');
  if (this.testResults === this.studioApp_.TestResults.FREE_PLAY || this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: this.testResults,
    program: encodeURIComponent(program),
    onComplete: _.bind(this.onReportComplete, this),
    save_to_gallery: level.impressive
  };

  // https://www.pivotaltracker.com/story/show/84171560
  // Never send up frozen images for now.
  var isFrozen = this.skin.id === 'anna' || this.skin.id === 'elsa';

  // Get the canvas data for feedback.
  if (this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL && !isFrozen && (level.freePlay || level.impressive)) {
    reportData.image = this.getFeedbackImage_();
  }

  this.studioApp_.report(reportData);

  if (this.studioApp_.isUsingBlockly()) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

Artist.prototype.getFeedbackImage_ = function () {
  var feedbackImageCanvas;
  if (this.skin.id == "anna" || this.skin.id == "elsa") {
    feedbackImageCanvas = this.ctxDisplay;
  } else {
    feedbackImageCanvas = this.ctxScratch;
  }

  // Copy the user layer
  this.ctxFeedback.globalCompositeOperation = 'copy';
  this.ctxFeedback.drawImage(feedbackImageCanvas.canvas, 0, 0, 154, 154);
  var feedbackCanvas = this.ctxFeedback.canvas;
  return encodeURIComponent(feedbackCanvas.toDataURL("image/png").split(',')[1]);
};

// Helper for creating canvas elements.
Artist.prototype.createCanvas_ = function (id, width, height) {
  var el = document.createElement('canvas');
  el.id = id;
  el.width = width;
  el.height = height;
  return el;
};

/**
* When smooth animate is true, steps can be broken up into multiple animations.
* At the end of each step, we want to reset any incremental information, which
* is what this does.
*/
Artist.prototype.resetStepInfo_ = function () {
  this.stepStartX = this.x;
  this.stepStartY = this.y;
  this.stepDistanceCovered = 0;
};

},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../slider":"/home/ubuntu/staging/apps/build/js/slider.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/turtle/api.js","./colours":"/home/ubuntu/staging/apps/build/js/turtle/colours.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/turtle/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/turtle/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/turtle/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js"}],"/home/ubuntu/staging/apps/build/js/turtle/levels.js":[function(require,module,exports){
'use strict';

var levelBase = require('../level_base');
var Colours = require('./colours');
var answer = require('./answers').answer;
var msg = require('./locale');
var blockUtils = require('../block_utils');
var utils = require('../utils');

// An early hack introduced some levelbuilder levels as page 5, level 7. Long
// term we can probably do something much cleaner, but for now I'm calling
// out that this level is special (on page 5).
var LEVELBUILDER_LEVEL = 7;

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function toolbox(page, level) {
  return require('./toolbox.xml.ejs')({
    page: page,
    level: level
  });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function startBlocks(page, level) {
  return require('./startBlocks.xml.ejs')({
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
  simpleMoveBlocks: function simpleMoveBlocks() {
    return this.SIMPLE_MOVE_UP + this.SIMPLE_MOVE_DOWN + this.SIMPLE_MOVE_LEFT + this.SIMPLE_MOVE_RIGHT;
  },
  simpleJumpBlocks: function simpleJumpBlocks() {
    return this.SIMPLE_JUMP_UP + this.SIMPLE_JUMP_DOWN + this.SIMPLE_JUMP_LEFT + this.SIMPLE_JUMP_RIGHT;
  },
  simpleMoveLengthBlocks: function simpleMoveLengthBlocks() {
    return this.SIMPLE_MOVE_UP_LENGTH + this.SIMPLE_MOVE_DOWN_LENGTH + this.SIMPLE_MOVE_LEFT_LENGTH + this.SIMPLE_MOVE_RIGHT_LENGTH;
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
    requiredBlocks: [[MOVE_FORWARD_INLINE], [turnRightRestricted(90)]],
    freePlay: false
  },
  // Level 3: Square (with repeat).
  '1_3': {
    answer: answer(1, 3),
    ideal: 4,
    toolbox: toolbox(1, 3),
    startBlocks: startBlocks(1, 3),
    requiredBlocks: [[MOVE_FORWARD_INLINE], [turnRightRestricted(90)], [repeat(4)]],
    freePlay: false
  },
  // Level 4: Triangle.
  '1_4': {
    answer: answer(1, 4),
    ideal: 6,
    toolbox: toolbox(1, 4),
    startBlocks: startBlocks(1, 4),
    requiredBlocks: [[MOVE_FORWARD_OR_BACKWARD_INLINE], [repeat(3)], [{
      // allow turn right or left, but show turn right block if they've done neither
      test: function test(block) {
        return block.type == 'draw_turn_by_constant_restricted';
      },
      type: 'draw_turn_by_constant',
      titles: { VALUE: '???' }
    }]],
    freePlay: false
  },
  // Level 5: Envelope.
  '1_5': {
    answer: answer(1, 5),
    ideal: 7,
    toolbox: toolbox(1, 5),
    startBlocks: startBlocks(1, 5),
    requiredBlocks: [[repeat(3)], [turnRightRestricted(120)], [MOVE_FORWARD_INLINE]],
    freePlay: false
  },
  // Level 6: triangle and square.
  '1_6': {
    answer: answer(1, 6),
    ideal: 8,
    toolbox: toolbox(1, 6),
    startBlocks: startBlocks(1, 6),
    requiredBlocks: [[repeat(3)], [turnRightRestricted(120), turnLeftRestricted(120)], [MOVE_FORWARD_INLINE, MOVE_BACKWARD_INLINE]],
    freePlay: false
  },
  // Level 7: glasses.
  '1_7': {
    answer: answer(1, 7),
    ideal: 13,
    toolbox: toolbox(1, 7),
    startBlocks: startBlocks(1, 7),
    requiredBlocks: [[drawTurnRestricted(90)], [MOVE_FORWARD_INLINE], [repeat(4)], [MOVE_BACKWARD_INLINE, MOVE_FORWARD_INLINE]],
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
    requiredBlocks: [[repeat(4)], [{
      // allow turn right or left, but show turn right block if they've done neither
      test: function test(block) {
        return block.type == 'draw_turn';
      },
      type: 'draw_turn',
      titles: { 'DIR': 'turnRight' },
      values: { 'VALUE': makeMathNumber(90) }
    }], [{
      // allow move forward or backward, but show forward block if they've done neither
      test: function test(block) {
        return block.type == 'draw_move';
      },
      type: 'draw_move',
      values: { 'VALUE': makeMathNumber(100) }
    }]],
    freePlay: false
  },
  // Level 2: Small green square.
  '2_2': {
    answer: answer(2, 2),
    ideal: 5,
    toolbox: toolbox(2, 2),
    startBlocks: startBlocks(2, 2),
    requiredBlocks: [[drawASquare('??')]],
    freePlay: false
  },
  // Level 3: Three squares.
  '2_3': {
    answer: answer(2, 3),
    ideal: 8,
    toolbox: toolbox(2, 3),
    startBlocks: startBlocks(2, 3),
    requiredBlocks: [[repeat(3)], [drawASquare(100)], [drawTurn()]],
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
    requiredBlocks: [[drawASquare('??')]],
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
    requiredBlocks: [[simpleBlock('controls_for_counter')], [move('??')], [simpleBlock('variables_get_counter')], [turnRight(90)]],
    freePlay: false
  },
  // Prep for Level 8: Two snowmen.
  '2_7_5': {
    answer: answer(2, 7.5),
    initialY: 300,
    ideal: 5,
    toolbox: toolbox(2, 8),
    startBlocks: startBlocks(2, 7.5),
    requiredBlocks: [[drawASnowman(250)], [drawASnowman(100)]],
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
    requiredBlocks: [[drawASnowman(150)], [turnRight(90)], [turnLeft(90)], [{
      test: 'jump',
      type: 'jump',
      values: { 'VALUE': makeMathNumber(100) }
    }], [simpleBlock('jump')], [repeat(3)]],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 9: Snowman family.
  '2_9': {
    answer: answer(2, 9),
    initialX: 100,
    ideal: 15,
    toolbox: toolbox(2, 9),
    startBlocks: startBlocks(2, 9),
    requiredBlocks: [[drawASnowman('??')], [simpleBlock('controls_for_counter')], [simpleBlock('variables_get_counter')], [turnRight(90)], [turnLeft(90)], [{
      test: 'jump',
      type: 'jump',
      values: { 'VALUE': makeMathNumber(60) }
    }]],
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
    requiredBlocks: [[levelBase.call(msg.drawASquare())]],
    freePlay: false
  },
  // Level 2: Create "draw a triangle".
  '3_2': {
    answer: answer(3, 2),
    ideal: 14,
    toolbox: toolbox(3, 2),
    startBlocks: startBlocks(3, 2),
    requiredBlocks: [[repeat(3)], [move(100)], [turnRight(120)], [levelBase.call(msg.drawATriangle())]],
    freePlay: false
  },
  // Level 3: Fence the animals.
  '3_3': {
    answer: answer(3, 3),
    initialY: 350,
    ideal: 20,
    toolbox: toolbox(3, 3),
    startBlocks: startBlocks(3, 3),
    requiredBlocks: [[levelBase.call(msg.drawATriangle())], [move(100)], [levelBase.call(msg.drawASquare())]],
    freePlay: false,
    images: [{
      filename: 'cat.svg',
      position: [170, 247]
    }, {
      filename: 'cat.svg',
      position: [170, 47]
    }, {
      filename: 'cow.svg',
      position: [182, 147]
    }],
    startDirection: 0
  },
  // Level 4: House the lion.
  '3_4': {
    answer: answer(3, 4),
    ideal: 19,
    toolbox: toolbox(3, 4),
    startBlocks: startBlocks(3, 4),
    requiredBlocks: [[levelBase.call(msg.drawASquare())], [move(100)], [turnRight(30)], [levelBase.call(msg.drawATriangle())]],
    freePlay: false,
    images: [{
      filename: 'lion.svg',
      position: [195, 97]
    }],
    startDirection: 0
  },
  // Level 5: Create "draw a house".
  '3_5': {
    answer: answer(3, 5),
    ideal: 21,
    toolbox: toolbox(3, 5),
    startBlocks: startBlocks(3, 5),
    requiredBlocks: [[levelBase.define(msg.drawAHouse())], [levelBase.call(msg.drawASquare())], [move(100)], [turnRight(30)], [levelBase.call(msg.drawATriangle())], [levelBase.call(msg.drawAHouse())]],
    freePlay: false,
    images: [{
      filename: 'cat.svg',
      position: [170, 90]
    }, {
      filename: 'cat.svg',
      position: [222, 90]
    }],
    startDirection: 0
  },
  // Level 6: Add parameter to "draw a triangle".
  '3_6': {
    answer: answer(3, 6),
    initialY: 350,
    ideal: 23,
    toolbox: toolbox(3, 6),
    startBlocks: startBlocks(3, 6),
    requiredBlocks: [[defineWithArg(msg.drawATriangle(), msg.lengthParameter())], [simpleBlock('variables_get_length')], [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())]],
    disableParamEditing: false,
    freePlay: false,
    images: [{
      filename: 'lion.svg',
      position: [185, 100]
    }, {
      filename: 'cat.svg',
      position: [175, 248]
    }],
    startDirection: 0
  },
  // Level 7: Add parameter to "draw a house".
  '3_7': {
    answer: answer(3, 7),
    initialY: 350,
    ideal: 24,
    toolbox: toolbox(3, 7),
    startBlocks: startBlocks(3, 7),
    requiredBlocks: [[defineWithArg(msg.drawAHouse(), msg.lengthParameter())], [levelBase.callWithArg(msg.drawASquare(), msg.lengthParameter())], [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())], [simpleBlock('variables_get_length')], [levelBase.callWithArg(msg.drawAHouse(), msg.lengthParameter())]],
    freePlay: false,
    images: [{
      filename: 'elephant.svg',
      position: [205, 220]
    }],
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
    images: [{
      filename: 'cat.svg',
      position: [16, 170]
    }, {
      filename: 'lion.svg',
      position: [15, 250]
    }, {
      filename: 'elephant.svg',
      position: [127, 220]
    }, {
      filename: 'cow.svg',
      position: [255, 250]
    }],
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
    requiredBlocks: [[defineWithArg(msg.drawAHouse(), msg.lengthParameter())], [levelBase.callWithArg(msg.drawASquare(), msg.lengthParameter())], [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())], [simpleBlock('variables_get_length')], [levelBase.callWithArg(msg.drawAHouse(), msg.lengthParameter())]],
    freePlay: false,
    images: [{
      filename: 'cat.svg',
      position: [-10, 270]
    }, {
      filename: 'cow.svg',
      position: [53, 250]
    }, {
      filename: 'elephant.svg',
      position: [175, 220]
    }],
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
    requiredBlocks: [[MOVE_FORWARD_OR_BACKWARD_INLINE], [repeat(3)], [{
      // allow turn right or left, but show turn right block if they've done neither
      test: function test(block) {
        return block.type == 'draw_turn_by_constant';
      },
      type: 'draw_turn_by_constant',
      titles: { VALUE: '???' }
    }]]
  },
  // Level 2: Two triangles.
  '4_2': {
    answer: answer(4, 2),
    ideal: 12,
    toolbox: toolbox(4, 2),
    startBlocks: startBlocks(4, 2),
    requiredBlocks: [[turnRightByConstant('???')]],
    sliderSpeed: 0.5
  },
  // Level 3: Four triangles using repeat.
  '4_3': {
    answer: answer(4, 3),
    ideal: 8,
    toolbox: toolbox(4, 3),
    startBlocks: startBlocks(4, 3),
    requiredBlocks: [[repeat(4)], [turnRightByConstant('???')]],
    sliderSpeed: 0.7
  },
  // Level 4: Ten triangles with missing repeat number.
  '4_4': {
    answer: answer(4, 4),
    ideal: 8,
    toolbox: toolbox(4, 4),
    startBlocks: startBlocks(4, 4),
    requiredBlocks: [[repeat('???')]],
    sliderSpeed: 0.7,
    impressive: true
  },
  // Level 5: 36 triangles with missing angle number.
  '4_5': {
    answer: answer(4, 5),
    ideal: 8,
    toolbox: toolbox(4, 5),
    startBlocks: startBlocks(4, 5),
    requiredBlocks: [[turnRightByConstant('???')]],
    sliderSpeed: 0.9,
    impressive: true
  },
  // Level 6: 1 square.
  '4_6': {
    answer: answer(4, 6),
    ideal: 4,
    toolbox: toolbox(4, 6),
    startBlocks: startBlocks(4, 6),
    requiredBlocks: [[moveForwardInline(20)], [repeat(4)], [{
      test: 'turnRight',
      type: 'draw_turn_by_constant',
      titles: { VALUE: '???' }
    }]],
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
    requiredBlocks: [[moveForwardInline(20)], [repeat(10)]],
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
    requiredBlocks: [[repeat(4)], [turnRightByConstant('???')]],
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
    requiredBlocks: [[turnRightByConstant('???')]],
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
    requiredBlocks: [[repeat('???')]],
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
    requiredBlocks: [],
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
    toolbox: blockUtils.createToolbox(blocks.simpleMoveBlocks() + blocks.simpleJumpBlocks() + blocks.simpleMoveLengthBlocks() + blockUtils.blockOfType('controls_repeat_simplified') + blockUtils.blockOfType('draw_colour_simple')),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  }
};

levels.ec_1_1 = utils.extend(levels['1_1'], {
  'editCode': true,
  'codeFunctions': {
    'moveForward': null,
    'turnRight': null
  },
  'startBlocks': "moveForward(100);\n"
});
levels.ec_1_2 = utils.extend(levels['1_2'], {
  'editCode': true,
  'codeFunctions': {
    'moveForward': null,
    'turnRight': null,
    'penColour': null
  },
  'startBlocks': "penColour('#ff0000');\nmoveForward(100);\n"
});
levels.ec_1_3 = utils.extend(levels['1_3'], {
  'editCode': true,
  'codeFunctions': {
    'moveForward': null,
    'turnRight': null,
    'penColour': null,
    'forLoop_i_0_4': { 'category': 'Artist' }
  },
  'startBlocks': "for (var i = 0; i < 4; i++) {\n  __\n}\n"
});
levels.ec_1_4 = utils.extend(levels['1_4'], {
  'editCode': true,
  'codeFunctions': {
    'moveForward': null,
    'turnRight': null,
    'penColour': null,
    'forLoop_i_0_4': { 'category': 'Artist' }
  },
  'startBlocks': "for (var i = 0; i < 3; i++) {\n  penColour('#ff0000');\n}\n"
});
levels.ec_1_10 = utils.extend(levels['1_10'], {
  'editCode': true,
  'codeFunctions': {
    'moveForward': null,
    'turnRight': null,
    'penColour': null,
    'penWidth': null,
    'forLoop_i_0_4': { 'category': 'Artist' }
  },
  'startBlocks': "moveForward(100);\n"
});

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../level_base":"/home/ubuntu/staging/apps/build/js/level_base.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./answers":"/home/ubuntu/staging/apps/build/js/turtle/answers.js","./colours":"/home/ubuntu/staging/apps/build/js/turtle/colours.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js","./requiredBlocks":"/home/ubuntu/staging/apps/build/js/turtle/requiredBlocks.js","./startBlocks.xml.ejs":"/home/ubuntu/staging/apps/build/js/turtle/startBlocks.xml.ejs","./toolbox.xml.ejs":"/home/ubuntu/staging/apps/build/js/turtle/toolbox.xml.ejs"}],"/home/ubuntu/staging/apps/build/js/turtle/toolbox.xml.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;

var msg = require('./locale');
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
},{"./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/turtle/startBlocks.xml.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;

var msg = require('./locale');

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
    modifiers: (level == 8 ? '' : 'x="220" y="40"') + ' editable="false" deletable="false"',
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
      modifiers: (level == 8 ? '' : 'x="220" y="250"') + (level == 6 ? '' : ' editable="false" deletable="false"'),
      sides: 3,
      length: (level >= 7 ? 0 : 100)
    })), '  ');284; }; buf.push('  ');284; if (level == 8 ) {; buf.push('    <block type="procedures_callnoreturn" inline="false">\n      <mutation name="', escape((285,  msg.drawAHouse() )), '">\n        <arg name="', escape((286,  msg.lengthParameter() )), '"></arg>\n      </mutation>\n        <value name="ARG0">\n          <block type="math_number">\n            <title name="NUM">100</title>\n          </block>\n        </value>\n    </block>\n  ');294; }; buf.push('  ');294; if (level == 7 || level == 8) {; buf.push('    ');294; //  Define "draw a house".
; buf.push('    <block type="procedures_defnoreturn" ');294; if (level == 7) {; buf.push('x="220" y="460"');294; }; buf.push('>      <mutation>\n        ');295; if (level == 8) { ; buf.push('<arg name="', escape((295,  msg.lengthParameter() )), '"></arg>');295; }; buf.push('      </mutation>\n      <title name="NAME">', escape((296,  msg.drawAHouse() )), '</title>\n      <statement name="STACK">\n        <block type="procedures_callnoreturn" inline="false">\n          <mutation name="', escape((299,  msg.drawASquare() )), '">\n            <arg name="', escape((300,  msg.lengthParameter() )), '"/>\n          </mutation>\n          <value name="ARG0">\n            ');303; if (level == 8) {; buf.push('              <block type="variables_get">\n                <title name="VAR">', escape((304,  msg.lengthParameter() )), '</title>\n              </block>\n            ');306; } else {; buf.push('              <block type="math_number">\n                <title name="NUM">100</title>\n              </block>\n            ');309; }; buf.push('          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                ');314; if (level == 8) {; buf.push('                  <block type="variables_get">\n                    <title name="VAR">', escape((315,  msg.lengthParameter() )), '</title>\n                  </block>\n                ');317; } else {; buf.push('                  <block type="math_number">\n                    <title name="NUM">100</title>\n                  </block>\n                ');320; }; buf.push('              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">30</title>\n                    </block>\n                  </value>\n                  <next>\n                    <block type="procedures_callnoreturn" inline="false">\n                      <mutation name="', escape((331,  msg.drawATriangle() )), '">\n                        <arg name="', escape((332,  msg.lengthParameter() )), '"></arg>\n                      </mutation>\n                      <value name="ARG0">\n                        ');335; if (level == 8) {; buf.push('                          <block type="variables_get">\n                            <title name="VAR">', escape((336,  msg.lengthParameter() )), '</title>\n                          </block>\n                        ');338; } else {; buf.push('                          <block type="math_number">\n                            <title name="NUM">100</title>\n                          </block>\n                        ');341; }; buf.push('                      </value>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');351; } // End of region in which "draw a square" is defined.
; buf.push('');351; } else if (page == 4) {; buf.push('  ');351; if (level == 2) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false" movable="true">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false" movable="true"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false" movable="true">\n          <title name="TIMES">3</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false" movable="true">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">100</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false" movable="true">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">120</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_colour" inline="true" x="70" y="230" editable="false" deletable="false" movable="true">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false" movable="true"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false" movable="true">\n                  <title name="TIMES">3</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false" movable="true">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">100</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false" movable="true">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">120</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');397; } else if (level == 3) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">3</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">100</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">120</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');419; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">3</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">100</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">120</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">36</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');452; } else if (level == 5) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">36</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">3</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">100</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">120</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_turn_by_constant">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">???</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');485; } else if (level == 7) {; buf.push('    <block type="draw_colour" inline="true" x="70" y="70" editable="false" deletable="false">\n      <value name="COLOUR">\n        <block type="colour_random" editable="false" deletable="false"></block>\n      </value>\n      <next>\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">4</title>\n          <statement name="DO">\n            <block type="draw_move_by_constant" editable="false" deletable="false">\n              <title name="DIR">moveForward</title>\n              <title name="VALUE">20</title>\n              <next>\n                <block type="draw_turn_by_constant" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <title name="VALUE">90</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');507; } else if (level == 8) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">10</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true" editable="false" deletable="false">\n          <value name="COLOUR">\n            <block type="colour_random" editable="false" deletable="false"></block>\n          </value>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">4</title>\n              <statement name="DO">\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">20</title>\n                  <next>\n                    <block type="draw_turn_by_constant" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <title name="VALUE">90</title>\n                    </block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="draw_move_by_constant" editable="false" deletable="false">\n                  <title name="DIR">moveForward</title>\n                  <title name="VALUE">20</title>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');540; } else if (level == 9) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false" deletable="false">\n      <title name="TIMES">4</title>\n      <statement name="DO">\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true" editable="false" deletable="false">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">???</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');584; } else if (level == 10) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="controls_repeat" editable="false" deletable="false">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true" editable="false" deletable="false">\n              <value name="COLOUR">\n                <block type="colour_random" editable="false" deletable="false"></block>\n              </value>\n              <next>\n                <block type="controls_repeat" editable="false" deletable="false">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant" editable="false" deletable="false">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant" editable="false" deletable="false">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant" editable="false" deletable="false">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">80</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');628; } else if (level == 11) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">???</title>\n      <statement name="DO">\n        <block type="controls_repeat">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="controls_repeat">\n                  <title name="TIMES">4</title>\n                  <statement name="DO">\n                    <block type="draw_move_by_constant">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                      <next>\n                        <block type="draw_turn_by_constant">\n                          <title name="DIR">turnRight</title>\n                          <title name="VALUE">90</title>\n                        </block>\n                      </next>\n                    </block>\n                  </statement>\n                  <next>\n                    <block type="draw_move_by_constant">\n                      <title name="DIR">moveForward</title>\n                      <title name="VALUE">20</title>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n          <next>\n            <block type="draw_turn_by_constant">\n              <title name="DIR">turnRight</title>\n              <title name="VALUE">???</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');672; }; buf.push('');672; } else if (page == 5) {; buf.push('  ');672; if (level == 1) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">200</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((698,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">90</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');716; } else if (level == 2) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">300</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((742,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">121</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');760; } else if (level == 3) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="70">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">300</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((786,  msg.loopVariable() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">134</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');804; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="70" y="20">\n      <title name="TIMES">10</title>\n      <statement name="DO">\n        <block type="draw_colour" inline="true">\n          <value name="COLOUR">\n            <block type="colour_random"></block>\n          </value>\n          <next>\n            <block type="procedures_callnoreturn" inline="false">\n              <mutation name="', escape((813,  msg.drawACircle() )), '">\n                <arg name="', escape((814,  msg.step() )), '"></arg>\n              </mutation>\n              <value name="ARG0">\n                <block type="math_number">\n                  <title name="NUM">6</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">36</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="270">\n      <mutation>\n        <arg name="', escape((838,  msg.step() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((840,  msg.drawACircle() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">60</title>\n          <statement name="DO">\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((849,  msg.step() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">6</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');867; } else if (level == 5) {; buf.push('    <block type="controls_for_counter" inline="true" x="70" y="20">\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">4</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">8</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">4</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="controls_repeat">\n          <title name="TIMES">10</title>\n          <statement name="DO">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="procedures_callnoreturn" inline="false">\n                  <mutation name="', escape((893,  msg.drawACircle() )), '">\n                    <arg name="', escape((894,  msg.step() )), '"></arg>\n                  </mutation>\n                  <value name="ARG0">\n                    <block type="variables_get">\n                      <title name="VAR">', escape((898,  msg.loopVariable() )), '</title>\n                    </block>\n                  </value>\n                  <next>\n                    <block type="draw_turn" inline="true">\n                      <title name="DIR">turnRight</title>\n                      <value name="VALUE">\n                        <block type="math_number">\n                          <title name="NUM">36</title>\n                        </block>\n                      </value>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="320">\n      <mutation>\n        <arg name="', escape((920,  msg.step() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((922,  msg.drawACircle() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">60</title>\n          <statement name="DO">\n            <block type="draw_move" inline="true">\n              <title name="DIR">moveForward</title>\n              <value name="VALUE">\n                <block type="variables_get">\n                  <title name="VAR">', escape((931,  msg.step() )), '</title>\n                </block>\n              </value>\n              <next>\n                <block type="draw_turn" inline="true">\n                  <title name="DIR">turnRight</title>\n                  <value name="VALUE">\n                    <block type="math_number">\n                      <title name="NUM">6</title>\n                    </block>\n                  </value>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');949; } else if (level == 6) {; buf.push('    <block type="procedures_callnoreturn" inline="false" x="70" y="20">\n      <mutation name="', escape((950,  msg.drawATree() )), '">\n        <arg name="', escape((951,  msg.depth() )), '"></arg>\n        <arg name="', escape((952,  msg.branches() )), '"></arg>\n      </mutation>\n      <value name="ARG0">\n        <block type="math_number">\n          <title name="NUM">9</title>\n        </block>\n      </value>\n      <value name="ARG1">\n        <block type="math_number">\n          <title name="NUM">2</title>\n        </block>\n      </value>\n    </block>\n    <block type="procedures_defnoreturn" x="70" y="190">\n      <mutation>\n        <arg name="', escape((967,  msg.depth() )), '"></arg>\n        <arg name="', escape((968,  msg.branches() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((970,  msg.drawATree() )), '</title>\n      <statement name="STACK">\n        <block type="controls_if" inline="false">\n          <value name="IF0">\n            <block type="logic_compare" inline="true">\n              <title name="OP">GT</title>\n              <value name="A">\n                <block type="variables_get">\n                  <title name="VAR">', escape((978,  msg.depth() )), '</title>\n                </block>\n              </value>\n              <value name="B">\n                <block type="math_number">\n                  <title name="NUM">0</title>\n                </block>\n              </value>\n            </block>\n          </value>\n          <statement name="DO0">\n            <block type="draw_colour" inline="true">\n              <value name="COLOUR">\n                <block type="colour_random"></block>\n              </value>\n              <next>\n                <block type="draw_pen">\n                  <title name="PEN">penDown</title>\n                  <next>\n                    <block type="draw_move" inline="true">\n                      <title name="DIR">moveForward</title>\n                      <value name="VALUE">\n                        <block type="math_arithmetic" inline="true">\n                          <title name="OP">MULTIPLY</title>\n                          <value name="A">\n                            <block type="math_number">\n                              <title name="NUM">7</title>\n                            </block>\n                          </value>\n                          <value name="B">\n                            <block type="variables_get">\n                              <title name="VAR">', escape((1009,  msg.depth() )), '</title>\n                            </block>\n                          </value>\n                        </block>\n                      </value>\n                      <next>\n                        <block type="draw_turn" inline="true">\n                          <title name="DIR">turnLeft</title>\n                          <value name="VALUE">\n                            <block type="math_number">\n                              <title name="NUM">130</title>\n                            </block>\n                          </value>\n                          <next>\n                            <block type="controls_repeat_ext" inline="true">\n                              <value name="TIMES">\n                                <block type="variables_get">\n                                  <title name="VAR">', escape((1026,  msg.branches() )), '</title>\n                                </block>\n                              </value>\n                              <statement name="DO">\n                                <block type="draw_turn" inline="true">\n                                  <title name="DIR">turnRight</title>\n                                  <value name="VALUE">\n                                    <block type="math_arithmetic" inline="true">\n                                      <title name="OP">DIVIDE</title>\n                                      <value name="A">\n                                        <block type="math_number">\n                                          <title name="NUM">180</title>\n                                        </block>\n                                      </value>\n                                      <value name="B">\n                                        <block type="variables_get">\n                                          <title name="VAR">', escape((1042,  msg.branches() )), '</title>\n                                        </block>\n                                      </value>\n                                    </block>\n                                  </value>\n                                  <next>\n                                    <block type="procedures_callnoreturn" inline="false">\n                                      <mutation name="', escape((1049,  msg.drawATree() )), '">\n                                        <arg name="', escape((1050,  msg.depth() )), '"></arg>\n                                        <arg name="', escape((1051,  msg.branches() )), '"></arg>\n                                      </mutation>\n                                      <value name="ARG0">\n                                        <block type="math_arithmetic" inline="true">\n                                          <title name="OP">MINUS</title>\n                                          <value name="A">\n                                            <block type="variables_get">\n                                              <title name="VAR">', escape((1058,  msg.depth() )), '</title>\n                                            </block>\n                                          </value>\n                                          <value name="B">\n                                            <block type="math_number">\n                                              <title name="NUM">1</title>\n                                            </block>\n                                          </value>\n                                        </block>\n                                      </value>\n                                      <value name="ARG1">\n                                        <block type="variables_get">\n                                          <title name="VAR">', escape((1070,  msg.branches() )), '</title>\n                                        </block>\n                                      </value>\n                                    </block>\n                                  </next>\n                                </block>\n                              </statement>\n                              <next>\n                                <block type="draw_turn" inline="true">\n                                  <title name="DIR">turnLeft</title>\n                                  <value name="VALUE">\n                                    <block type="math_number">\n                                      <title name="NUM">50</title>\n                                    </block>\n                                  </value>\n                                  <next>\n                                    <block type="draw_pen">\n                                      <title name="PEN">penUp</title>\n                                      <next>\n                                        <block type="draw_move" inline="true">\n                                          <title name="DIR">moveBackward</title>\n                                          <value name="VALUE">\n                                            <block type="math_arithmetic" inline="true">\n                                              <title name="OP">MULTIPLY</title>\n                                              <value name="A">\n                                                <block type="math_number">\n                                                  <title name="NUM">7</title>\n                                                </block>\n                                              </value>\n                                              <value name="B">\n                                                <block type="variables_get">\n                                                  <title name="VAR">', escape((1101,  msg.depth() )), '</title>\n                                                </block>\n                                              </value>\n                                            </block>\n                                          </value>\n                                        </block>\n                                      </next>\n                                    </block>\n                                  </next>\n                                </block>\n                              </next>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');1125; }; buf.push('');1125; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/turtle/requiredBlocks.js":[function(require,module,exports){
/**
 * Sets BlocklyApp constants that depend on the page and level.
 * This encapsulates many functions used for StudioApp.requiredBlocks_.
 * In the future, some of these may be moved to common.js.
 */

'use strict';

var requiredBlockUtils = require('../required_block_utils');

// This tests for and creates a draw_a_square block on page 2.
function drawASquare(number) {
  return { test: 'draw_a_square',
    type: 'draw_a_square',
    values: { 'VALUE': requiredBlockUtils.makeMathNumber(number) } };
}

// This tests for and creates a draw_a_snowman block on page 2.
function drawASnowman(number) {
  return { test: 'draw_a_snowman',
    type: 'draw_a_snowman',
    values: { 'VALUE': requiredBlockUtils.makeMathNumber(number) } };
}

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial.
var MOVE_FORWARD_INLINE = { test: 'moveForward', type: 'draw_move_by_constant' };

// allow move forward or backward, but show forward block if they've done neither
var MOVE_FORWARD_OR_BACKWARD_INLINE = {
  test: function test(block) {
    return block.type == 'draw_move_by_constant';
  },
  type: 'draw_move_by_constant'
};

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial with the given pixel number.
var moveForwardInline = function moveForwardInline(pixels) {
  return { test: 'moveForward',
    type: 'draw_move_by_constant',
    titles: { 'VALUE': pixels } };
};

// This tests for and creates the limited "move forward" block used on the
// earlier levels of the tutorial.
var MOVE_BACKWARD_INLINE = { test: 'moveBackward',
  type: 'draw_move_by_constant',
  titles: { 'DIR': 'moveBackward' } };

// This tests for a [right] draw_turn_by_constant_restricted block
// and creates the block with the specified/recommended number of degrees as
// its input.  The restricted turn is used on the earlier levels of the
// tutorial.
var turnRightRestricted = function turnRightRestricted(degrees) {
  return { test: 'turnRight(',
    type: 'draw_turn_by_constant_restricted',
    titles: { 'VALUE': degrees } };
};

// This tests for a [left] draw_turn_by_constant_restricted block
// and creates the block with the specified/recommended number of degrees as
// its input.  The restricted turn is used on the earlier levels of the
// tutorial.
var turnLeftRestricted = function turnLeftRestricted(degrees) {
  return { test: 'turnLeft(',
    type: 'draw_turn_by_constant_restricted',
    titles: { 'VALUE': degrees } };
};

// This tests for and creates a [right] draw_turn_by_constant block
// with the specified number of degrees as its input.
var turnRightByConstant = function turnRightByConstant(degrees) {
  return {
    test: function test(block) {
      return block.type == 'draw_turn_by_constant' && (degrees === '???' || Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) == degrees);
    },
    type: 'draw_turn_by_constant',
    titles: { 'VALUE': degrees } };
};

// This tests for and creates a [right] draw_turn block with the specified
// number of degrees as its input.  For the earliest levels, the method
// turnRightRestricted should be used instead.
var turnRight = function turnRight(degrees) {
  return {
    test: function test(block) {
      return block.type == 'draw_turn' && block.getTitleValue('DIR') == 'turnRight';
    },
    type: 'draw_turn',
    titles: { 'DIR': 'turnRight' },
    values: { 'VALUE': requiredBlockUtils.makeMathNumber(degrees) }
  };
};

// This tests for and creates a left draw_turn block with the specified
// number of degrees as its input.  This method is not appropriate for the
// earliest levels of the tutorial, which do not provide draw_turn.
var turnLeft = function turnLeft(degrees) {
  return {
    test: function test(block) {
      return block.type == 'draw_turn' && block.getTitleValue('DIR') == 'turnLeft';
    },
    type: 'draw_turn',
    titles: { 'DIR': 'turnLeft' },
    values: { 'VALUE': requiredBlockUtils.makeMathNumber(degrees) }
  };
};

// This tests for any draw_move block and, if not present, creates
// one with the specified distance.
var move = function move(distance) {
  return { test: function test(block) {
      return block.type == 'draw_move';
    },
    type: 'draw_move',
    values: { 'VALUE': requiredBlockUtils.makeMathNumber(distance) } };
};

// This tests for and creates a draw_turn_by_constant_restricted block.
var drawTurnRestricted = function drawTurnRestricted(degrees) {
  return {
    test: function test(block) {
      return block.type == 'draw_turn_by_constant_restricted';
    },
    type: 'draw_turn_by_constant_restricted',
    titles: { 'VALUE': degrees }
  };
};

// This tests for and creates a draw_turn block.
var drawTurn = function drawTurn() {
  return {
    test: function test(block) {
      return block.type == 'draw_turn';
    },
    type: 'draw_turn',
    values: { 'VALUE': requiredBlockUtils.makeMathNumber('???') }
  };
};

// This tests for and creates a "set colour" block with a colour picker
// as its input.
var SET_COLOUR_PICKER = { test: 'penColour(\'#',
  type: 'draw_colour',
  values: { 'COLOUR': '<block type="colour_picker"></block>' } };

// This tests for and creates a "set colour" block with a random colour
// generator as its input.
var SET_COLOUR_RANDOM = { test: 'penColour(colour_random',
  type: 'draw_colour',
  values: { 'COLOUR': '<block type="colour_random"></block>' } };

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
var defineWithArg = function defineWithArg(func_name, arg_name) {
  return {
    test: function test(block) {
      return block.type == 'procedures_defnoreturn' && block.getTitleValue('NAME') == func_name && block.parameterNames_ && block.parameterNames_.length && block.parameterNames_[0] == arg_name;
    },
    type: 'procedures_defnoreturn',
    titles: { 'NAME': func_name },
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
  defineWithArg: defineWithArg
};

},{"../required_block_utils":"/home/ubuntu/staging/apps/build/js/required_block_utils.js"}],"/home/ubuntu/staging/apps/build/js/turtle/dropletConfig.js":[function(require,module,exports){
'use strict';

module.exports.blocks = [{ 'func': 'moveForward', 'category': 'Artist', 'params': ["100"], 'idArgLast': true }, { 'func': 'turnRight', 'category': 'Artist', 'params': ["90"], 'idArgLast': true }, { 'func': 'penColour', 'category': 'Artist', 'params': ["'#ff0000'"], 'idArgLast': true }, { 'func': 'penWidth', 'category': 'Artist', 'params': ["1"], 'idArgLast': true }];

module.exports.categories = {
  'Artist': {
    'color': 'red',
    'blocks': []
  }
};

},{}],"/home/ubuntu/staging/apps/build/js/turtle/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="slider-cell">\n  <svg id="slider"\n       xmlns="http://www.w3.org/2000/svg"\n       xmlns:svg="http://www.w3.org/2000/svg"\n       xmlns:xlink="http://www.w3.org/1999/xlink"\n       version="1.1"\n       width="150"\n       height="50">\n      <!-- Slow icon. -->\n      <clipPath id="slowClipPath">\n        <rect width=26 height=12 x=5 y=14 />\n      </clipPath>\n      <image xlink:href="', escape((13,  assetUrl(iconPath) )), '" height=42 width=84 x=-21 y=-10\n          clip-path="url(#slowClipPath)" />\n      <!-- Fast icon. -->\n      <clipPath id="fastClipPath">\n        <rect width=26 height=16 x=120 y=10 />\n      </clipPath>\n      <image xlink:href="', escape((19,  assetUrl(iconPath) )), '" height=42 width=84 x=120 y=-11\n          clip-path="url(#fastClipPath)" />\n  </svg>\n  <img id="spinner" style="visibility: hidden;" src="', escape((22,  assetUrl('media/turtle/loading.gif') )), '" height=15 width=15>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/turtle/customLevelBlocks.js":[function(require,module,exports){
/**
 * A set of blocks used by some of our custom levels (i.e. built by level builder)
 */

'use strict';

var msg = require('./locale');
var utils = require('../utils');
var _ = utils.getLodash();

exports.install = function (blockly, generator, gensym) {
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

function createACircleCode(size, gensym, indent) {
  var loopVar = gensym('count');
  indent = indent || '';
  return [indent + '// create_a_circle', indent + 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 36; ' + indent + loopVar + '++) {', indent + '  Turtle.moveForward(' + size + ');', indent + '  Turtle.turnRight(10);', indent + '}\n'].join('\n');
}

/**
 * Same as draw_a_square, except inputs are not inlined
 */
function installDrawASquare(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square_custom = {
    // Draw a square.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square_custom = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['// draw_a_square', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(90);', '}\n'].join('\n');
  };
}

/**
 * create_a_circle and create_a_circle_size
 * first defaults to size 10, second provides a size param
 */
function installCreateACircle(blockly, generator, gensym) {
  blockly.Blocks.create_a_circle = {
    // Draw a square.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.createACircle());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  blockly.Blocks.create_a_circle_size = {
    // Draw a square.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.createACircle());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.sizeParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_circle = function () {
    return createACircleCode(10, gensym);
  };

  generator.create_a_circle_size = function () {
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.createASnowflakeBranch());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_snowflake_branch = function () {
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');
    return ['// create_a_snowflake_branch', 'Turtle.jumpForward(90);', 'Turtle.turnLeft(45);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {', '    Turtle.moveForward(30);', '    Turtle.moveBackward(30);', '    Turtle.turnRight(45);', '  }', '  Turtle.turnLeft(90);', '  Turtle.moveBackward(30);', '  Turtle.turnLeft(45);', '}', 'Turtle.turnRight(45);\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawARhombus());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rhombus = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 2; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(60);', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(120);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawATriangle());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_triangle = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['// draw_a_triangle', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(120);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawAHexagon());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_hexagon = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['// draw_a_triangle', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(60);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawAHouse());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_house = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(90);', '}', 'Turtle.turnLeft(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnRight(90);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(120);', '}', 'Turtle.turnRight(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnLeft(90);\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawAFlower());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_flower = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return ['Turtle.penColour("#228b22");', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnLeft(18);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {', '  Turtle.penColour(' + color_random + ');', '  Turtle.turnLeft(36);', '  Turtle.moveForward(' + value_length + ' / 2);', '  Turtle.moveBackward(' + value_length + '/ 2);', '}', 'Turtle.turnRight(198);', 'Turtle.jumpForward(' + value_length + ');', 'Turtle.turnRight(180);\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawASnowflake());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowflake = function () {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 8; ' + loopVar + '++) {', '  Turtle.penColour("#7fffd4");', '  Turtle.moveForward(30);', '  Turtle.turnRight(90);', '  Turtle.moveForward(15);', '  Turtle.turnRight(90);', '  Turtle.penColour("#0000cd");', '  Turtle.moveForward(15);', '  Turtle.turnRight(90);', '  Turtle.moveForward(30);', '  Turtle.turnRight(45);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawAStar());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_star = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.turnRight(18);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(144);', '}', 'Turtle.turnLeft(18);\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawARobot());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_robot = function () {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    return ['Turtle.turnLeft(90);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(20);', '  Turtle.turnRight(90);', '}', 'Turtle.turnRight(90);', 'Turtle.moveBackward(10);', 'Turtle.moveForward(40);', 'Turtle.turnRight(90);', 'Turtle.moveForward(80);', 'Turtle.turnRight(90);', 'Turtle.moveForward(40);', 'Turtle.turnRight(90);', 'Turtle.moveForward(80);', 'Turtle.moveBackward(15);', 'Turtle.turnLeft(120);', 'Turtle.moveForward(40);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(30);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(210);', 'Turtle.moveForward(40);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(60);', 'Turtle.moveForward(115);', 'Turtle.moveBackward(50);', 'Turtle.turnRight(90);', 'Turtle.moveForward(40);', 'Turtle.turnLeft(90);', 'Turtle.moveForward(50);\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawARocket());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rocket = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');

    return ['Turtle.penColour("#ff0000");', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  Turtle.moveForward(20);', '  Turtle.turnLeft(120);', '}', 'Turtle.penColour("#000000");', 'Turtle.turnLeft(90);', 'Turtle.jumpForward(20);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnRight(90);', 'Turtle.moveForward(20);', 'Turtle.turnRight(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnRight(90);', 'Turtle.moveForward(20);', 'Turtle.turnRight(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnRight(90);', 'for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {', '  Turtle.moveForward(20);', '  Turtle.turnLeft(120);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawAPlanet());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_planet = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.penColour("#808080");', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 360; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.moveBackward(' + value_length + ');', '  Turtle.turnRight(1);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawUpperWave());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_upper_wave = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.penColour("#0000cd");', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(18);', '}\n'].join('\n');
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
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(msg.drawLowerWave());
      this.appendValueInput('VALUE').setAlign(blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_lower_wave = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.penColour("#0000cd");', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(18);', '}\n'].join('\n');
  };
}

function installCreateASnowflakeDropdown(blockly, generator, gensym) {
  var snowflakes = [[msg.createSnowflakeSquare(), 'square'], [msg.createSnowflakeParallelogram(), 'parallelogram'], [msg.createSnowflakeLine(), 'line'], [msg.createSnowflakeSpiral(), 'spiral'], [msg.createSnowflakeFlower(), 'flower'], [msg.createSnowflakeFractal(), 'fractal'], [msg.createSnowflakeRandom(), 'random']];

  blockly.Blocks.create_snowflake_dropdown = {
    init: function init() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(snowflakes), 'TYPE');
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

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js"}],"/home/ubuntu/staging/apps/build/js/turtle/locale.js":[function(require,module,exports){
// locale for turtle
"use strict";

module.exports = window.blockly.turtle_locale;

},{}],"/home/ubuntu/staging/apps/build/js/turtle/colours.js":[function(require,module,exports){
// Create a limited colour palette to avoid overwhelming new users
// and to make colour checking easier.  These definitions cannot be
// moved to blocks.js, which is loaded later, since they are used in
// top-level definitions below.  Note that the hex digits a-f are
// lower-case.  This is assumed in comparisons below.
'use strict';

var Colours = {
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

module.exports = Colours;

},{}],"/home/ubuntu/staging/apps/build/js/turtle/answers.js":[function(require,module,exports){
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

var ArtistAPI = require('./api');
var api = new ArtistAPI();

var setRandomVisibleColour = function setRandomVisibleColour() {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  // Make sure at least one component is below 0x80 and the rest
  // below 0xA0, to prevent too light of colours.
  num &= 0x9f7f9f;
  var colour = '#' + ('00000' + num.toString(16)).substr(-6);
  api.penColour(colour);
};

var drawSquare = function drawSquare(length, random_colour) {
  for (var count = 0; count < 4; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(90);
  }
};

var drawTriangle = function drawTriangle(length, random_colour) {
  for (var count = 0; count < 3; count++) {
    if (random_colour) {
      setRandomVisibleColour();
    }
    api.moveForward(length);
    api.turnRight(120);
  }
};

var drawSnowman = function drawSnowman(height) {
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

var drawHouse = function drawHouse(length) {
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
 */
exports.answer = function (page, level) {
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
        api.penColour('#00cc00'); // blue
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
        api.penColour('#00ff00'); // green
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
      case 5: // Draw without using for-loop.  (Fall through to next case.)
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
  return api.log;
};

},{"./api":"/home/ubuntu/staging/apps/build/js/turtle/api.js"}],"/home/ubuntu/staging/apps/build/js/turtle/api.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();

/**
 * An instantiable Artist API logic. The methods on this object are called by
 * generated user code. As they are called, they insert commands into this.log.
 * NOTE: this.log is also modified in some cases externally (both accessed and
 * I think cleared).
 */
var ArtistAPI = function ArtistAPI() {
  this.log = [];
};

module.exports = ArtistAPI;

ArtistAPI.prototype.drawCircle = function (size, id) {
  for (var i = 0; i < 36; i++) {
    this.moveForward(size, id);
    this.turnRight(10, id);
  }
};

ArtistAPI.prototype.drawSnowflake = function (type, id) {
  var i, j, k;

  // mirors Blockly.JavaScript.colour_random.
  var random_colour = function random_colour() {
    var colors = Blockly.FieldColour.COLOURS;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (type === 'random') {
    type = _.sample(['fractal', 'flower', 'spiral', 'line', 'parallelogram', 'square']);
  }

  switch (type) {
    case 'fractal':
      for (i = 0; i < 8; i++) {
        this.jumpForward(45, id);
        this.turnLeft(45, id);
        for (j = 0; j < 3; j++) {
          for (k = 0; k < 3; k++) {
            this.moveForward(15, id);
            this.moveBackward(15, id);
            this.turnRight(45, id);
          }
          this.turnLeft(90, id);
          this.moveBackward(15, id);
          this.turnLeft(45, id);
        }
        this.turnRight(90, id);
      }
      break;

    case 'flower':
      for (i = 0; i < 5; i++) {
        this.drawCircle(2, id);
        this.drawCircle(4, id);
        this.turnRight(72, id);
      }
      break;

    case 'spiral':
      for (i = 0; i < 20; i++) {
        this.drawCircle(3, id);
        this.moveForward(20, id);
        this.turnRight(18, id);
      }
      break;

    case 'line':
      for (i = 0; i < 90; i++) {
        this.penColour(random_colour());
        this.moveForward(50, id);
        this.moveBackward(50, id);
        this.turnRight(4, id);
      }
      this.penColour("#FFFFFF", id);
      break;

    case 'parallelogram':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 2; j++) {
          this.moveForward(50, id);
          this.turnRight(60, id);
          this.moveForward(50, id);
          this.turnRight(120, id);
        }
        this.turnRight(36, id);
      }
      break;

    case 'square':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 4; j++) {
          this.moveForward(50, id);
          this.turnRight(90, id);
        }
        this.turnRight(36, id);
      }
      break;
  }
};

ArtistAPI.prototype.moveForward = function (distance, id) {
  this.log.push(['FD', distance, id]);
};

ArtistAPI.prototype.moveBackward = function (distance, id) {
  this.log.push(['FD', -distance, id]);
};

ArtistAPI.prototype.moveUp = function (distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

ArtistAPI.prototype.moveDown = function (distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

ArtistAPI.prototype.moveLeft = function (distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

ArtistAPI.prototype.moveRight = function (distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

ArtistAPI.prototype.jumpUp = function (distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

ArtistAPI.prototype.jumpDown = function (distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

ArtistAPI.prototype.jumpLeft = function (distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

ArtistAPI.prototype.jumpRight = function (distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

ArtistAPI.prototype.jumpForward = function (distance, id) {
  this.log.push(['JF', distance, id]);
};

ArtistAPI.prototype.jumpBackward = function (distance, id) {
  this.log.push(['JF', -distance, id]);
};

ArtistAPI.prototype.turnRight = function (angle, id) {
  this.log.push(['RT', angle, id]);
};

ArtistAPI.prototype.turnLeft = function (angle, id) {
  this.log.push(['RT', -angle, id]);
};

ArtistAPI.prototype.globalAlpha = function (alpha, id) {
  this.log.push(['GA', alpha, id]);
};

ArtistAPI.prototype.penUp = function (id) {
  this.log.push(['PU', id]);
};

ArtistAPI.prototype.penDown = function (id) {
  this.log.push(['PD', id]);
};

ArtistAPI.prototype.penWidth = function (width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

ArtistAPI.prototype.penColour = function (colour, id) {
  this.log.push(['PC', colour, id]);
};

ArtistAPI.prototype.penPattern = function (pattern, id) {
  this.log.push(['PS', pattern, id]);
};

ArtistAPI.prototype.hideTurtle = function (id) {
  this.log.push(['HT', id]);
};

ArtistAPI.prototype.showTurtle = function (id) {
  this.log.push(['ST', id]);
};

ArtistAPI.prototype.drawStamp = function (stamp, id) {
  this.log.push(['stamp', stamp, id]);
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}]},{},["/home/ubuntu/staging/apps/build/js/turtle/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2Fuc3dlcnMuanMiLCJidWlsZC9qcy90dXJ0bGUvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxVQUFVLEdBQUcs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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUMzREEsSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7O0FBRzVELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUMzQixTQUFPLEVBQUMsSUFBSSxFQUFFLGVBQWU7QUFDckIsUUFBSSxFQUFFLGVBQWU7QUFDckIsVUFB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LEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN6QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDdkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDeEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN0QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNqRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ25DLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDdkMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ3pDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDakQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMvQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNuRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNuQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsT0FBTyxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNwQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQzVDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUM1QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2xELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEFydGlzdCA9IHJlcXVpcmUoJy4vdHVydGxlJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cudHVydGxlTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGFydGlzdCA9IG5ldyBBcnRpc3QoKTtcblxuICB3aW5kb3cuX19UZXN0SW50ZXJmYWNlLnNldFNwZWVkU2xpZGVyVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBhcnRpc3Quc3BlZWRTbGlkZXIuc2V0VmFsdWUodmFsdWUpO1xuICB9O1xuICBhcnRpc3QuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oYXJ0aXN0LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiIsInZhciBza2luQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG5cbiAgdmFyIENPTkZJR1MgPSB7XG4gICAgYW5uYToge1xuICAgICAgLy8gc2xpZGVyIHNwZWVkIGdldHMgZGl2aWRlZCBieSB0aGlzIHZhbHVlXG4gICAgICBzcGVlZE1vZGlmaWVyOiAxMCxcbiAgICAgIHR1cnRsZU51bUZyYW1lczogMTAsXG4gICAgICBzbW9vdGhBbmltYXRlOiB0cnVlLFxuICAgICAgY29uc29saWRhdGVUdXJuQW5kTW92ZTogdHJ1ZSxcbiAgICAgIGFubmFMaW5lOiBza2luLmFzc2V0VXJsKCdhbm5hbGluZS5wbmcnKSxcbiAgICAgIGFubmFMaW5lXzJ4OiBza2luLmFzc2V0VXJsKCdhbm5hbGluZV8yeC5wbmcnKVxuICAgIH0sXG5cbiAgICBlbHNhOiB7XG4gICAgICBzcGVlZE1vZGlmaWVyOiAxMCxcbiAgICAgIHR1cnRsZU51bUZyYW1lczogMjAsXG4gICAgICBkZWNvcmF0aW9uQW5pbWF0aW9uTnVtRnJhbWVzOiAxOSxcbiAgICAgIHNtb290aEFuaW1hdGU6IHRydWUsXG4gICAgICBjb25zb2xpZGF0ZVR1cm5BbmRNb3ZlOiB0cnVlLFxuICAgICAgZWxzYUxpbmU6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lLnBuZycpLFxuICAgICAgZWxzYUxpbmVfMng6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lXzJ4LnBuZycpXG4gICAgfVxuICB9O1xuXG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG4gIC8vIGJhc2Ugc2tpbiBwcm9wZXJ0aWVzIGhlcmUgKGNhbiBiZSBvdmVycmlkZW4gYnkgQ09ORklHKVxuICBza2luLnNwZWVkTW9kaWZpZXIgPSAxO1xuXG4gIC8vIHN0YW1wcyBhcmVuJ3QgYWN0dWFsbHkgdXNlZCBvbiBwcm9kdWN0aW9uIGFueXdoZXJlIHJpZ2h0IG5vdy4gaWYgd2Ugd2VyZVxuICAvLyB0byB3YW50IHRvIHVzZSB0aGVtLCBkZWZpbmUgdGhlIG1hcHBpbmcgZnJvbSBpbWFnZSB0byBuYW1lIGhlcmUuXG4gIHNraW4uc3RhbXBWYWx1ZXMgPSBbXG4gICAgW3NraW4uYXZhdGFyLCAnREVGQVVMVCddXG4gIF07XG5cbiAgLy8gR2V0IHByb3BlcnRpZXMgZnJvbSBjb25maWdcbiAgdmFyIGlzQXNzZXQgPSAvXFwuXFxTezN9JC87IC8vIGVuZHMgaW4gZG90IGZvbGxvd2VkIGJ5IHRocmVlIG5vbi13aGl0ZXNwYWNlIGNoYXJzXG4gIGZvciAodmFyIHByb3AgaW4gY29uZmlnKSB7XG4gICAgc2tpbltwcm9wXSA9IGNvbmZpZ1twcm9wXTtcbiAgfVxuXG4gIC8vIFRPRE8gKGJyLXBhaXIpIDogU29tZSBvZiB0aGVzZSBrZXlzIGFyZSBhY3R1YWxseSB1bmRlZmluZWQuIENsZWFuIHRoaXMgdXBcbiAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IFtcbiAgICBbc2tpbi5wYXR0ZXJuRGVmYXVsdCwgJ0RFRkFVTFQnXSwgLy8gIHNpZ25hbHMgcmV0dXJuIHRvIGRlZmF1bHQgcGF0aCBkcmF3aW5nXG4gICAgW3NraW4ucmFpbmJvd01lbnUsICdyYWluYm93TGluZSddLCAgLy8gc2V0IHRvIHByb3BlcnR5IG5hbWUgZm9yIGltYWdlIHdpdGhpbiBza2luXG4gICAgW3NraW4ucm9wZU1lbnUsICdyb3BlTGluZSddLCAgLy8gcmVmZXJlbmNlZCBhcyBza2luW3BhdHRlcm5dO1xuICAgIFtza2luLnNxdWlnZ2x5TWVudSwgJ3NxdWlnZ2x5TGluZSddLFxuICAgIFtza2luLnN3aXJseU1lbnUsICdzd2lybHlMaW5lJ10sXG4gICAgW3NraW4uYW5uYUxpbmUsICdhbm5hTGluZSddLFxuICAgIFtza2luLmVsc2FMaW5lLCAnZWxzYUxpbmUnXSxcbiAgICBbc2tpbi5hbm5hTGluZV8yeCwgJ2FubmFMaW5lXzJ4J10sXG4gICAgW3NraW4uZWxzYUxpbmVfMngsICdlbHNhTGluZV8yeCddLFxuICBdO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBjdXN0b21MZXZlbEJsb2NrcyA9IHJlcXVpcmUoJy4vY3VzdG9tTGV2ZWxCbG9ja3MnKTtcbnZhciBUdXJ0bGUgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgdmFyIGdlbnN5bSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgTkFNRV9UWVBFID0gYmxvY2tseS5WYXJpYWJsZXMuTkFNRV9UWVBFO1xuICAgIHJldHVybiBnZW5lcmF0b3IudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKG5hbWUsIE5BTUVfVFlQRSk7XG4gIH07XG5cbiAgaWYgKHNraW4uaWQgPT0gXCJhbm5hXCIgfHwgc2tpbi5pZCA9PSBcImVsc2FcIilcbiAge1xuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICBDb2xvdXJzLkZST1pFTjEsIENvbG91cnMuRlJPWkVOMiwgQ29sb3Vycy5GUk9aRU4zLFxuICAgICAgQ29sb3Vycy5GUk9aRU40LCBDb2xvdXJzLkZST1pFTjUsIENvbG91cnMuRlJPWkVONixcbiAgICAgIENvbG91cnMuRlJPWkVONywgQ29sb3Vycy5GUk9aRU44LCBDb2xvdXJzLkZST1pFTjldO1xuICAgIGJsb2NrbHkuRmllbGRDb2xvdXIuQ09MVU1OUyA9IDM7XG5cbiAgfSBlbHNlIHtcblxuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICAvLyBSb3cgMS5cbiAgICAgIENvbG91cnMuQkxBQ0ssIENvbG91cnMuR1JFWSxcbiAgICAgIENvbG91cnMuS0hBS0ksIENvbG91cnMuV0hJVEUsXG4gICAgICAvLyBSb3cgMi5cbiAgICAgIENvbG91cnMuUkVELCBDb2xvdXJzLlBJTkssXG4gICAgICBDb2xvdXJzLk9SQU5HRSwgQ29sb3Vycy5ZRUxMT1csXG4gICAgICAvLyBSb3cgMy5cbiAgICAgIENvbG91cnMuR1JFRU4sIENvbG91cnMuQkxVRSxcbiAgICAgIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSA0O1xuICB9XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVscy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2ZcbiAgICAvLyBwaXhlbHMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZCBzZXQgb2YgYW5nbGVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpIHx8IDA7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQ7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSk7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZV9yZXN0cmljdGVkLlZBTFVFID1cbiAgICAgIFszMCwgNDUsIDYwLCA5MCwgMTIwLCAxMzUsIDE1MCwgMTgwXS5cbiAgICAgIG1hcChmdW5jdGlvbih0KSB7cmV0dXJuIFtTdHJpbmcodCksIFN0cmluZyh0KV07fSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2lubGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9jb3VudGVyID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxvb3BWYXJpYWJsZSgpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfY291bnRlciA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxlbmd0aFBhcmFtZXRlcigpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXQ7XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9zaWRlcyA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKCdzaWRlcycpLCAnVkFSJyk7XG4gICAgICB0aGlzLnNldE91dHB1dCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RPT0xUSVApO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudmFyaWFibGVzX2dldF9zaWRlcyA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU3F1YXJlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3F1YXJlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKSB8fCAwO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgICAvLyBEb24ndCBjaGFuZ2UgaXQgd2l0aG91dCBjaGFuZ2luZyByZXF1aXJlZEJsb2Nrc18uXG4gICAgICAgICcvLyBkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc25vd21hblwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0b1xuICAvLyB1c2VycyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93bWFuID0ge1xuICAgIC8vIERyYXcgYSBjaXJjbGUgaW4gZnJvbnQgb2YgdGhlIHR1cnRsZSwgZW5kaW5nIHVwIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU25vd21hbigpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dtYW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc25vd21hbiBpbiBmcm9udCBvZiB0aGUgdHVydGxlLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGRpc3RhbmNlc1ZhciA9IGdlbnN5bSgnZGlzdGFuY2VzJyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50ZXInKTtcbiAgICB2YXIgZGVncmVlVmFyID0gZ2Vuc3ltKCdkZWdyZWUnKTtcbiAgICB2YXIgZGlzdGFuY2VWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlJyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgJy8vIGRyYXdfYV9zbm93bWFuJyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAndmFyICcgKyBkaXN0YW5jZXNWYXIgKyAnID0gWycgKyB2YWx1ZSArICcgKiAwLjUsICcgKyB2YWx1ZSArICcgKiAwLjMsJyArXG4gICAgICAgICAgdmFsdWUgKyAnICogMC4yXTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgIGxvb3BWYXIgKyAnKyspIHtcXG4nLFxuICAgICAgJyAgdmFyICcgKyBkaXN0YW5jZVZhciArICcgPSAnICsgZGlzdGFuY2VzVmFyICsgJ1snICsgbG9vcFZhciArXG4gICAgICAgICAgJyA8IDMgPyAnICsgbG9vcFZhciArICc6IDUgLSAnICsgbG9vcFZhciArICddIC8gNTcuNTsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGRlZ3JlZVZhciArICcgPSAwOyAnICsgZGVncmVlVmFyICsgJyA8IDkwOyAnICtcbiAgICAgICAgICBkZWdyZWVWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIGRpc3RhbmNlVmFyICsgJyk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCgyKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnICBpZiAoJyArIGxvb3BWYXIgKyAnICE9IDIpIHsnLFxuICAgICAgJyAgICBUdXJ0bGUudHVybkxlZnQoMTgwKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGEgbW9kaWZpZWQgY29weSBvZiBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3Igd2l0aCB0aGVcbiAgLy8gdmFyaWFibGUgbmFtZWQgXCJjb3VudGVyXCIgaGFyZGNvZGVkLlxuICBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3JfY291bnRlciA9IHtcbiAgICAvLyBGb3IgbG9vcCB3aXRoIGhhcmRjb2RlZCBsb29wIHZhcmlhYmxlLlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9XSVRIKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICdWQVInKTtcbiAgICAgIHRoaXMuaW50ZXJwb2xhdGVNc2coYmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0ZST01fVE9fQlksXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0ZST00nLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ1RPJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydCWScsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrbHkuQUxJR05fUklHSFQpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShCbG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfRE8pO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9UT09MVElQLnJlcGxhY2UoXG4gICAgICAgICAgJyUxJywgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKSkpO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH0sXG4gICAgY3VzdG9tQ29udGV4dE1lbnU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBvcHRpb24gPSB7ZW5hYmxlZDogdHJ1ZX07XG4gICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBvcHRpb24udGV4dCA9IGJsb2NrbHkuTXNnLlZBUklBQkxFU19TRVRfQ1JFQVRFX0dFVC5yZXBsYWNlKCclMScsIG5hbWUpO1xuICAgICAgdmFyIHhtbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGl0bGUnKTtcbiAgICAgIHhtbFRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5hbWUpKTtcbiAgICAgIHhtbFRpdGxlLnNldEF0dHJpYnV0ZSgnbmFtZScsICdWQVInKTtcbiAgICAgIHZhciB4bWxCbG9jayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jsb2NrJyk7XG4gICAgICB4bWxCbG9jay5hcHBlbmRDaGlsZCh4bWxUaXRsZSk7XG4gICAgICB4bWxCbG9jay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndmFyaWFibGVzX2dldF9jb3VudGVyJyk7XG4gICAgICBvcHRpb24uY2FsbGJhY2sgPSBibG9ja2x5LkNvbnRleHRNZW51LmNhbGxiYWNrRmFjdG9yeSh0aGlzLCB4bWxCbG9jayk7XG4gICAgICBvcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICB9LFxuICAgIC8vIHNlcmlhbGl6ZSB0aGUgY291bnRlciB2YXJpYWJsZSBuYW1lIHRvIHhtbCBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFjcm9zc1xuICAgIC8vIGRpZmZlcmVudCBsb2NhbGVzXG4gICAgbXV0YXRpb25Ub0RvbTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ211dGF0aW9uJyk7XG4gICAgICB2YXIgY291bnRlciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCdjb3VudGVyJywgY291bnRlcik7XG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG4gICAgLy8gZGVzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZVxuICAgIGRvbVRvTXV0YXRpb246IGZ1bmN0aW9uKHhtbEVsZW1lbnQpIHtcbiAgICAgIHZhciBjb3VudGVyID0geG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NvdW50ZXInKTtcbiAgICAgIHRoaXMuc2V0VGl0bGVWYWx1ZShjb3VudGVyLCAnVkFSJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jb250cm9sc19mb3JfY291bnRlciA9IGdlbmVyYXRvci5jb250cm9sc19mb3I7XG5cbiAgLy8gRGVsZXRlIHRoZXNlIHN0YW5kYXJkIGJsb2Nrcy5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcblxuICAvLyBHZW5lcmFsIGJsb2Nrcy5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5tb3ZlRm9yd2FyZCgpLCAnbW92ZUZvcndhcmQnXSxcbiAgICAgICBbbXNnLm1vdmVCYWNrd2FyZCgpLCAnbW92ZUJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIkxPTkdfTU9WRV9MRU5HVEhcIjtcbiAgdmFyIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIlNIT1JUX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaW1wbGVMZW5ndGhDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhdywgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3LCBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlXVxuICBdO1xuICB2YXIgc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhd1JpZ2h0LCBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdLFxuICAgIFtza2luLnNob3J0TGluZURyYXdSaWdodCwgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcblxuICB2YXIgU2ltcGxlTW92ZSA9IHtcbiAgICBERUZBVUxUX01PVkVfTEVOR1RIOiA1MCxcbiAgICBTSE9SVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgTE9OR19NT1ZFX0xFTkdUSDogMTAwLFxuICAgIERJUkVDVElPTl9DT05GSUdTOiB7XG4gICAgICBsZWZ0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlTGVmdCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlV2VzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4ud2VzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgcmlnaHQ6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25FYXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVSaWdodCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlRWFzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uZWFzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhSaWdodENob2ljZXNcbiAgICAgIH0sXG4gICAgICB1cDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVVcCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlTm9ydGhUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLm5vcnRoTGluZURyYXcsXG4gICAgICAgIGltYWdlRGltZW5zaW9uczoge3dpZHRoOiA3MiwgaGVpZ2h0OiA1Nn0sXG4gICAgICAgIGxlbmd0aHM6IHNpbXBsZUxlbmd0aENob2ljZXNcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uU291dGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZURvd24nLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVNvdXRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5zb3V0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAganVtcF9sZWZ0OiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25XZXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBMZWZ0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ubGVmdEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBXZXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9yaWdodDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wUmlnaHQnLFxuICAgICAgICBpbWFnZTogc2tpbi5yaWdodEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBFYXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF91cDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uTm9ydGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFVwJyxcbiAgICAgICAgaW1hZ2U6IHNraW4udXBKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wTm9ydGhUb29sdGlwKClcbiAgICAgIH0sXG4gICAgICBqdW1wX2Rvd246IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBEb3duJyxcbiAgICAgICAgaW1hZ2U6IHNraW4uZG93bkp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBTb3V0aFRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JBbGxEaXJlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJ1cFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJkb3duXCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcImxlZnRcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwicmlnaHRcIik7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbjogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX2p1bXBfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoJ2p1bXBfJyArIGRpcmVjdGlvbik7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbiArIFwiX2xlbmd0aFwiXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbiArICdfbGVuZ3RoJ10gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbik7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX2p1bXBfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVNb3ZlQmxvY2s6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgIHZhciBkaXJlY3Rpb25Db25maWcgPSBTaW1wbGVNb3ZlLkRJUkVDVElPTl9DT05GSUdTW2RpcmVjdGlvbl07XG4gICAgICB2YXIgZGlyZWN0aW9uTGV0dGVyV2lkdGggPSAxMjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlbHBVcmw6ICcnLFxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmlzSnVtcCkge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoY29tbW9uTXNnLmp1bXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoZGlyZWN0aW9uQ29uZmlnLnRpdGxlLCB7Zml4ZWRTaXplOiB7d2lkdGg6IGRpcmVjdGlvbkxldHRlcldpZHRoLCBoZWlnaHQ6IDE4fX0pKTtcblxuICAgICAgICAgIGlmIChkaXJlY3Rpb25Db25maWcuaW1hZ2VEaW1lbnNpb25zKSB7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKGRpcmVjdGlvbkNvbmZpZy5pbWFnZSxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy5oZWlnaHQpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXRUb29sdGlwKGRpcmVjdGlvbkNvbmZpZy50b29sdGlwKTtcbiAgICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihkaXJlY3Rpb25Db25maWcubGVuZ3Rocyk7XG4gICAgICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdsZW5ndGgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcbiAgICBnZW5lcmF0ZUNvZGVHZW5lcmF0b3I6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQsIGxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZW5ndGggPSBsZW5ndGggfHwgU2ltcGxlTW92ZS5ERUZBVUxUX01PVkVfTEVOR1RIO1xuXG4gICAgICAgIGlmIChoYXNMZW5ndGhJbnB1dCkge1xuICAgICAgICAgIGxlbmd0aCA9IFNpbXBsZU1vdmVbdGhpcy5nZXRUaXRsZVZhbHVlKFwibGVuZ3RoXCIpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1R1cnRsZS4nICsgU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dLm1vdmVGdW5jdGlvbiArICcoJyArIGxlbmd0aCArICcsJyArICdcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9ucygpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5qdW1wRm9yd2FyZCgpLCAnanVtcEZvcndhcmQnXSxcbiAgICAgICBbbXNnLmp1bXBCYWNrd2FyZCgpLCAnanVtcEJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5qdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IganVtcGluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCcxMDAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5qdW1wVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHNcbiAgICAvLyB3aXRob3V0IGRyYXdpbmcuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlclxuICAgIC8vIG9mIHBpeGVscyB3aXRob3V0IGRyYXdpbmcuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmp1bXBfYnlfY29uc3RhbnQ7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cudHVyblJpZ2h0KCksICd0dXJuUmlnaHQnXSxcbiAgICAgICBbbXNnLnR1cm5MZWZ0KCksICd0dXJuTGVmdCddXTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgLy8gdGhpcyBpcyB0aGUgb2xkIHZlcnNpb24gb2YgdGhpcyBibG9jaywgdGhhdCBzaG91bGQgb25seSBzdGlsbCBiZSB1c2VkIGluXG4gIC8vIG9sZCBzaGFyZWQgbGV2ZWxzXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGggPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIHBlbiB3aWR0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1dJRFRIJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRXaWR0aCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdXSURUSCcsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMSc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuV2lkdGgoJyArIHdpZHRoICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIGlubGluZWQgdmVyc2lvbiBvZiBkcmF3X3dpZHRoXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGhfaW5saW5lID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMScsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdXSURUSCcpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2lkdGhUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd193aWR0aF9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdXSURUSCcpO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3BlbiA9IHtcbiAgICAvLyBCbG9jayBmb3IgcGVuIHVwL2Rvd24uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1BFTicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGVuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4uU1RBVEUgPVxuICAgICAgW1ttc2cucGVuVXAoKSwgJ3BlblVwJ10sXG4gICAgICAgW21zZy5wZW5Eb3duKCksICdwZW5Eb3duJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHBlbiB1cC9kb3duLlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1BFTicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXIgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnQ09MT1VSJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5DT0xPVVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmFscGhhID0ge1xuICAgIC8vIFRPRE86XG4gICAgLy8gLSBBZGQgYWxwaGEgdG8gYSBncm91cFxuICAgIC8vIC0gTWFrZSBzdXJlIGl0IGRvZXNuJ3QgY291bnQgYWdhaW5zdCBjb3JyZWN0IHNvbHV0aW9uc1xuICAgIC8vXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0QWxwaGEoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoXCJWQUxVRVwiKVxuICAgICAgICAgIC5zZXRDaGVjayhcIk51bWJlclwiKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5hbHBoYSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxwaGEgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX05PTkUpO1xuICAgIHJldHVybiAnVHVydGxlLmdsb2JhbEFscGhhKCcgKyBhbHBoYSArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnQ09MT1VSJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2NvbG91cl9zaW1wbGUgPSB7XG4gICAgLy8gU2ltcGxpZmllZCBkcm9wZG93biBibG9jayBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbG91cnMgPSBbQ29sb3Vycy5SRUQsIENvbG91cnMuQkxBQ0ssIENvbG91cnMuUElOSywgQ29sb3Vycy5PUkFOR0UsXG4gICAgICAgIENvbG91cnMuWUVMTE9XLCBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHZhciBjb2xvdXJGaWVsZCA9IG5ldyBCbG9ja2x5LkZpZWxkQ29sb3VyRHJvcGRvd24oY29sb3VycywgNDUsIDM1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29sb3VyRmllbGQsICdDT0xPVVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2NvbG91cl9zaW1wbGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnQ09MT1VSJykgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cihcIicgKyBjb2xvdXIgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhbiBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRQYXR0ZXJuKCkpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZSggbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKFxuICAgICAgICAgICAgICBza2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLCAxNTAsIDIwICksICdWQUxVRScgKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGF0dGVybigpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbGluZV9zdHlsZV9wYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgaW1hZ2UgZm9yIGEgcGF0dGVybmVkIGxpbmUuXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgfHwgJ1xcJ0RFRkFVTFRcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlblBhdHRlcm4oXCInICsgcGF0dGVybiArICdcIiwgXFwnYmxvY2tfaWRfJyArXG4gICAgICAgIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnVwX2JpZyA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudXBfYmlnID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cignICsgY29sb3VyICsgJywgXFwnYmxvY2tfaWRfJyArXG4gICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eSA9IHtcbiAgICAvLyBCbG9jayBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2libGl0eS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1ZJU0lCSUxJVFknKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVydGxlVmlzaWJpbGl0eVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV92aXNpYmlsaXR5LlNUQVRFID1cbiAgICAgIFtbbXNnLmhpZGVUdXJ0bGUoKSwgJ2hpZGVUdXJ0bGUnXSxcbiAgICAgICBbbXNnLnNob3dUdXJ0bGUoKSwgJ3Nob3dUdXJ0bGUnXV07XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV92aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2liaWxpdHkuXG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVklTSUJJTElUWScpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLmRyYXdTdGFtcCgpKTtcbiAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuVkFMVUVTLCA1MCwgMzApO1xuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG5cbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZHJhd1N0YW1wKCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyBibG9jayBpcyBjdXJyZW50bHkgdW51c2VkLiBpZiB3ZSB3YW50IHRvIGFkZCBpdCBiYWNrIGluIHRoZSBmdXR1cmUsIGFkZFxuICAvLyBzdGFtcCBpbWFnZXMgaGVyZVxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfc3RhbXAuVkFMVUVTID0gc2tpbi5zdGFtcFZhbHVlcztcblxuICBnZW5lcmF0b3IudHVydGxlX3N0YW1wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnVHVydGxlLmRyYXdTdGFtcChcIicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgK1xuICAgICAgICAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBjdXN0b21MZXZlbEJsb2Nrcy5pbnN0YWxsKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gR2xvYmFscyB1c2VkIGluIHRoaXMgZmlsZTpcbi8vICBCbG9ja2x5XG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IFR1cnRsZSBHcmFwaGljcy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciB0dXJ0bGVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgU2xpZGVyID0gcmVxdWlyZSgnLi4vc2xpZGVyJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcblxudmFyIENBTlZBU19IRUlHSFQgPSA0MDA7XG52YXIgQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG52YXIgSk9JTlRfUkFESVVTID0gNDtcblxudmFyIFNNT09USF9BTklNQVRFX1NURVBfU0laRSA9IDU7XG52YXIgRkFTVF9TTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSAxNTtcblxuLyoqXG4qIE1pbmltdW0gam9pbnQgc2VnbWVudCBsZW5ndGhcbiovXG52YXIgSk9JTlRfU0VHTUVOVF9MRU5HVEggPSA1MDtcblxuLyoqXG4gKiBBbiB4IG9mZnNldCBhZ2FpbnN0IHRoZSBzcHJpdGUgZWRnZSB3aGVyZSB0aGUgZGVjb3JhdGlvbiBzaG91bGQgYmUgZHJhd24sXG4gKiBhbG9uZyB3aXRoIHdoZXRoZXIgaXQgc2hvdWxkIGJlIGRyYXduIGJlZm9yZSBvciBhZnRlciB0aGUgdHVydGxlIHNwcml0ZSBpdHNlbGYuXG4gKi9cbnZhciBFTFNBX0RFQ09SQVRJT05fREVUQUlMUyA9IFtcbiAgeyB4OiAxNSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogMjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDM3LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA0Niwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjAsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY1LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Niwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjQsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNTUsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiA0OCwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMzLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMzEsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAyMiwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDE3LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMTIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAgOCwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogMTAsIHdoZW46IFwiYWZ0ZXJcIiB9XG5dO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBBcnRpc3QgY2xhc3NcbiAqIEBwYXJhbSB7U3R1ZGlvQXBwfSBzdHVkaW9BcHAgVGhlIHN0dWRpb0FwcCBpbnN0YW5jZSB0byBidWlsZCB1cG9uLlxuICovXG52YXIgQXJ0aXN0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNraW4gPSBudWxsO1xuICB0aGlzLmxldmVsID0gbnVsbDtcblxuICB0aGlzLmFwaSA9IG5ldyBBcnRpc3RBUEkoKTtcblxuICAvLyBpbWFnZSBpY29ucyBhbmQgaW1hZ2UgcGF0aHMgZm9yIHRoZSAnc2V0IHBhdHRlcm4gYmxvY2snXG4gIHRoaXMubGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBbXTtcbiAgdGhpcy5zdGFtcHMgPSBbXTtcblxuICAvLyBQSUQgb2YgYW5pbWF0aW9uIHRhc2sgY3VycmVudGx5IGV4ZWN1dGluZy5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNob3VsZCB0aGUgdHVydGxlIGJlIGRyYXduP1xuICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG4gIC8vIFNldCBhIHR1cnRsZSBoZWFkaW5nLlxuICB0aGlzLmhlYWRpbmcgPSAwO1xuXG4gIC8vIFRoZSBhdmF0YXIgaW1hZ2VcbiAgdGhpcy5hdmF0YXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBhdmF0YXIgYW5pbWF0aW9uIGRlY29yYXRpb24gaW1hZ2VcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAvLyBEcmF3aW5nIHdpdGggYSBwYXR0ZXJuXG4gIHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuID0gbmV3IEltYWdlKCk7XG4gIHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zID0gW107XG4gIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSBmYWxzZTtcblxuICAvLyB0aGVzZSBnZXQgc2V0IGJ5IGluaXQgYmFzZWQgb24gc2tpbi5cbiAgdGhpcy5hdmF0YXJXaWR0aCA9IDA7XG4gIHRoaXMuYXZhdGFySGVpZ2h0ID0gMDtcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGggPSA4NTtcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0ID0gODU7XG4gIHRoaXMuc3BlZWRTbGlkZXIgPSBudWxsO1xuXG4gIHRoaXMuY3R4QW5zd2VyID0gbnVsbDtcbiAgdGhpcy5jdHhJbWFnZXMgPSBudWxsO1xuICB0aGlzLmN0eFByZWRyYXcgPSBudWxsO1xuICB0aGlzLmN0eFNjcmF0Y2ggPSBudWxsO1xuICB0aGlzLmN0eFBhdHRlcm4gPSBudWxsO1xuICB0aGlzLmN0eEZlZWRiYWNrID0gbnVsbDtcbiAgdGhpcy5jdHhEaXNwbGF5ID0gbnVsbDtcblxuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSBmYWxzZTtcbiAgdGhpcy5pc1ByZWRyYXdpbmdfID0gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFydGlzdDtcblxuXG4vKipcbiAqIHRvZG9cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIHR1cnRsZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFydGlzdCByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIC8vIFByZWxvYWQgc3RhbXAgaW1hZ2VzXG4gIHRoaXMuc3RhbXBzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5za2luLnN0YW1wVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuc2tpbi5zdGFtcFZhbHVlc1tpXVswXTtcbiAgICB2YXIga2V5ID0gdGhpcy5za2luLnN0YW1wVmFsdWVzW2ldWzFdO1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcuc3JjID0gdXJsO1xuICAgIHRoaXMuc3RhbXBzW2tleV0gPSBpbWc7XG4gIH1cblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIGxldCdzIHRyeSBhZGRpbmcgYSBiYWNrZ3JvdW5kIGltYWdlXG4gICAgdGhpcy5sZXZlbC5pbWFnZXMgPSBbe31dO1xuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLmZpbGVuYW1lID0gJ2JhY2tncm91bmQuanBnJztcblxuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLnBvc2l0aW9uID0gWyAwLCAwIF07XG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0uc2NhbGUgPSAxO1xuICB9XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ3doZW5fcnVuJztcbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzM7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSAxMDA7XG4gIH1cbiAgZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDczO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gMTAwO1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoID0gODU7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0ID0gODU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDcwO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gNTE7XG4gIH1cblxuICB2YXIgaWNvblBhdGggPSAnbWVkaWEvdHVydGxlLycgKyAoY29uZmlnLmlzTGVnYWN5U2hhcmUgJiYgY29uZmlnLmhpZGVTb3VyY2UgPyAnaWNvbnNfd2hpdGUucG5nJyA6ICdpY29ucy5wbmcnKTtcbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIHZpc3VhbGl6YXRpb246ICcnLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHthc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLCBpY29uUGF0aDogaWNvblBhdGh9KSxcbiAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogdGhpcy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgIGJsb2NrQ291bnRlckNsYXNzIDogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgfVxuICB9KTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gXy5iaW5kKHRoaXMubG9hZEF1ZGlvXywgdGhpcyk7XG4gIGNvbmZpZy5hZnRlckluamVjdCA9IF8uYmluZCh0aGlzLmFmdGVySW5qZWN0XywgdGhpcywgY29uZmlnKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5sb2FkQXVkaW9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xufTtcblxuLyoqXG4gKiBDb2RlIGNhbGxlZCBhZnRlciB0aGUgYmxvY2tseSBkaXYgKyBibG9ja2x5IGNvcmUgaXMgaW5qZWN0ZWQgaW50byB0aGUgZG9jdW1lbnRcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIC8vIEluaXRpYWxpemUgdGhlIHNsaWRlci5cbiAgdmFyIHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbGlkZXInKTtcbiAgdGhpcy5zcGVlZFNsaWRlciA9IG5ldyBTbGlkZXIoMTAsIDM1LCAxMzAsIHNsaWRlcik7XG5cbiAgLy8gQ2hhbmdlIGRlZmF1bHQgc3BlZWQgKGVnIFNwZWVkIHVwIGxldmVscyB0aGF0IGhhdmUgbG90cyBvZiBzdGVwcykuXG4gIGlmIChjb25maWcubGV2ZWwuc2xpZGVyU3BlZWQpIHtcbiAgICB0aGlzLnNwZWVkU2xpZGVyLnNldFZhbHVlKGNvbmZpZy5sZXZlbC5zbGlkZXJTcGVlZCk7XG4gIH1cblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdUdXJ0bGUsY29kZScpO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGhpZGRlbiBjYW52YXNlcy5cbiAgdGhpcy5jdHhBbnN3ZXIgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2Fuc3dlcicsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eEltYWdlcyA9IHRoaXMuY3JlYXRlQ2FudmFzXygnaW1hZ2VzJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4UHJlZHJhdyA9IHRoaXMuY3JlYXRlQ2FudmFzXygncHJlZHJhdycsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFNjcmF0Y2ggPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3NjcmF0Y2gnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhQYXR0ZXJuID0gdGhpcy5jcmVhdGVDYW52YXNfKCdwYXR0ZXJuJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4RmVlZGJhY2sgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2ZlZWRiYWNrJywgMTU0LCAxNTQpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gQ3JlYXRlIGRpc3BsYXkgY2FudmFzLlxuICB2YXIgZGlzcGxheUNhbnZhcyA9IHRoaXMuY3JlYXRlQ2FudmFzXygnZGlzcGxheScsIDQwMCwgNDAwKTtcblxuICB2YXIgdmlzdWFsaXphdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uJyk7XG4gIHZpc3VhbGl6YXRpb24uYXBwZW5kQ2hpbGQoZGlzcGxheUNhbnZhcyk7XG4gIHRoaXMuY3R4RGlzcGxheSA9IGRpc3BsYXlDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAvLyBUT0RPIChici1wYWlyKTogLSBwdWxsIHRoaXMgb3V0P1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkgJiYgKHRoaXMuc2tpbi5pZCA9PT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09PSBcImVsc2FcIikpIHtcbiAgICAvLyBPdmVycmlkZSBjb2xvdXJfcmFuZG9tIHRvIG9ubHkgZ2VuZXJhdGUgcmFuZG9tIGNvbG9ycyBmcm9tIHdpdGhpbiBvdXIgZnJvemVuXG4gICAgLy8gcGFsZXR0ZVxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBjb2xvdXIuXG4gICAgICBpZiAoIUJsb2NrbHkuSmF2YVNjcmlwdC5kZWZpbml0aW9uc18uY29sb3VyX3JhbmRvbSkge1xuICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gQmxvY2tseS5KYXZhU2NyaXB0LnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShcbiAgICAgICAgICAnY29sb3VyX3JhbmRvbScsIEJsb2NrbHkuR2VuZXJhdG9yLk5BTUVfVFlQRSk7XG4gICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tLmZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZTtcbiAgICAgICAgdmFyIGZ1bmMgPSBbXTtcbiAgICAgICAgZnVuYy5wdXNoKCdmdW5jdGlvbiAnICsgZnVuY3Rpb25OYW1lICsgJygpIHsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCcgICB2YXIgY29sb3JzID0gJyArIEpTT04uc3RyaW5naWZ5KEJsb2NrbHkuRmllbGRDb2xvdXIuQ09MT1VSUykgKyAnOycpO1xuICAgICAgICBmdW5jLnB1c2goJyAgcmV0dXJuIGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY29sb3JzLmxlbmd0aCldOycpO1xuICAgICAgICBmdW5jLnB1c2goJ30nKTtcbiAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LmRlZmluaXRpb25zXy5jb2xvdXJfcmFuZG9tID0gZnVuYy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb2RlID0gQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uZnVuY3Rpb25OYW1lICsgJygpJztcbiAgICAgIHJldHVybiBbY29kZSwgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX0ZVTkNUSU9OX0NBTExdO1xuICAgIH07XG4gIH1cblxuICB0aGlzLmxvYWREZWNvcmF0aW9uQW5pbWF0aW9uKCk7XG5cbiAgLy8gU2V0IHRoZWlyIGluaXRpYWwgY29udGVudHMuXG4gIHRoaXMubG9hZFR1cnRsZSgpO1xuICB0aGlzLmRyYXdJbWFnZXMoKTtcblxuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSB0cnVlO1xuICB0aGlzLmRyYXdBbnN3ZXIoKTtcbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gZmFsc2U7XG5cbiAgaWYgKHRoaXMubGV2ZWwucHJlZHJhd0Jsb2Nrcykge1xuICAgIHRoaXMuaXNQcmVkcmF3aW5nXyA9IHRydWU7XG4gICAgdGhpcy5kcmF3QmxvY2tzT25DYW52YXModGhpcy5sZXZlbC5wcmVkcmF3QmxvY2tzLCB0aGlzLmN0eFByZWRyYXcpO1xuICAgIHRoaXMuaXNQcmVkcmF3aW5nXyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gcHJlLWxvYWQgaW1hZ2UgZm9yIGxpbmUgcGF0dGVybiBibG9jay4gQ3JlYXRpbmcgdGhlIGltYWdlIG9iamVjdCBhbmQgc2V0dGluZyBzb3VyY2UgZG9lc24ndCBzZWVtIHRvIGJlXG4gIC8vIGVub3VnaCBpbiB0aGlzIGNhc2UsIHNvIHdlJ3JlIGFjdHVhbGx5IGNyZWF0aW5nIGFuZCByZXVzaW5nIHRoZSBvYmplY3Qgd2l0aGluIHRoZSBkb2N1bWVudCBib2R5LlxuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdmFyIGltYWdlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW1hZ2VDb250YWluZXIuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZUNvbnRhaW5lcik7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhdHRlcm4gPSB0aGlzLnNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnNbaV1bMV07XG4gICAgICBpZiAodGhpcy5za2luW3BhdHRlcm5dKSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLnNyYyA9IHRoaXMuc2tpbltwYXR0ZXJuXTtcbiAgICAgICAgdGhpcy5sb2FkZWRQYXRoUGF0dGVybnNbcGF0dGVybl0gPSBpbWc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG59O1xuXG4vKipcbiAqIE9uIHN0YXJ0dXAgZHJhdyB0aGUgZXhwZWN0ZWQgYW5zd2VyIGFuZCBzYXZlIGl0IHRvIHRoZSBhbnN3ZXIgY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICB0aGlzLmRyYXdCbG9ja3NPbkNhbnZhcyh0aGlzLmxldmVsLnNvbHV0aW9uQmxvY2tzLCB0aGlzLmN0eEFuc3dlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kcmF3TG9nT25DYW52YXModGhpcy5sZXZlbC5hbnN3ZXIsIHRoaXMuY3R4QW5zd2VyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBhIHNldCBvZiBjb21tYW5kcyBhbmQgYSBjYW52YXMsIGRyYXdzIHRoZSBjb21tYW5kcyBvbnRvIHRoZSBjYW52YXNcbiAqIGNvbXBvc2l0ZWQgb3ZlciB0aGUgc2NyYXRjaCBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0xvZ09uQ2FudmFzID0gZnVuY3Rpb24obG9nLCBjYW52YXMpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG4gIHdoaWxlIChsb2cubGVuZ3RoKSB7XG4gICAgdmFyIHR1cGxlID0gbG9nLnNoaWZ0KCk7XG4gICAgdGhpcy5zdGVwKHR1cGxlWzBdLCB0dXBsZS5zcGxpY2UoMSksIHtzbW9vdGhBbmltYXRlOiBmYWxzZX0pO1xuICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgfVxuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICBjYW52YXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbn07XG5cbi8qKlxuICogRXZhbHVhdGVzIGJsb2NrcyBvciBjb2RlLCBhbmQgZHJhd3Mgb250byBnaXZlbiBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0Jsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oYmxvY2tzT3JDb2RlLCBjYW52YXMpIHtcbiAgdmFyIGNvZGU7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciBkb21CbG9ja3MgPSBCbG9ja2x5LlhtbC50ZXh0VG9Eb20oYmxvY2tzT3JDb2RlKTtcbiAgICBCbG9ja2x5LlhtbC5kb21Ub0Jsb2NrU3BhY2UoQmxvY2tseS5tYWluQmxvY2tTcGFjZSwgZG9tQmxvY2tzKTtcbiAgICBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICB9IGVsc2Uge1xuICAgIGNvZGUgPSBibG9ja3NPckNvZGU7XG4gIH1cbiAgdGhpcy5ldmFsQ29kZShjb2RlKTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICB9XG4gIHRoaXMuZHJhd0N1cnJlbnRCbG9ja3NPbkNhbnZhcyhjYW52YXMpO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgcmVzdWx0cyBvZiBibG9jayBldmFsdWF0aW9uIChzdG9yZWQgb24gYXBpLmxvZykgb250byB0aGUgZ2l2ZW5cbiAqIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Q3VycmVudEJsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gIHRoaXMuZHJhd0xvZ09uQ2FudmFzKHRoaXMuYXBpLmxvZywgY2FudmFzKTtcbn07XG5cbi8qKlxuICogUGxhY2UgYW4gaW1hZ2UgYXQgdGhlIHNwZWNpZmllZCBjb29yZGluYXRlcy5cbiAqIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU0OTU5NTIuIFRoYW5rcywgUGhyb2d6LlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIFJlbGF0aXZlIHBhdGggdG8gaW1hZ2UuXG4gKiBAcGFyYW0geyFBcnJheX0gcG9zaXRpb24gQW4geC15IHBhaXIuXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9uYWwgc2NhbGUgYXQgd2hpY2ggaW1hZ2UgaXMgZHJhd25cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5wbGFjZUltYWdlID0gZnVuY3Rpb24oZmlsZW5hbWUsIHBvc2l0aW9uLCBzY2FsZSkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5vbmxvYWQgPSBfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgaWYgKHNjYWxlKSB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgaW1nLndpZHRoLFxuICAgICAgICAgIGltZy5oZWlnaHQsIDAsIDAsIGltZy53aWR0aCAqIHNjYWxlLCBpbWcuaGVpZ2h0ICogc2NhbGUpO1xuICAgICAgfSBlbHNlICB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGlzcGxheSgpO1xuICB9LCB0aGlzKTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIGltZy5zcmMgPSB0aGlzLnNraW4uYXNzZXRVcmwoZmlsZW5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGltZy5zcmMgPSB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS8nICsgZmlsZW5hbWUpO1xuICB9XG59O1xuXG4vKipcbiAqIERyYXcgdGhlIGltYWdlcyBmb3IgdGhpcyBwYWdlIGFuZCBsZXZlbCBvbnRvIHRoaXMuY3R4SW1hZ2VzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLmxldmVsLmltYWdlcykge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGV2ZWwuaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGltYWdlID0gdGhpcy5sZXZlbC5pbWFnZXNbaV07XG4gICAgdGhpcy5wbGFjZUltYWdlKGltYWdlLmZpbGVuYW1lLCBpbWFnZS5wb3NpdGlvbiwgaW1hZ2Uuc2NhbGUpO1xuICB9XG4gIHRoaXMuY3R4SW1hZ2VzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgdGhpcy5jdHhJbWFnZXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICB0aGlzLmN0eEltYWdlcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgaW1hZ2Ugb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkVHVydGxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXZhdGFySW1hZ2Uub25sb2FkID0gXy5iaW5kKHRoaXMuZGlzcGxheSwgdGhpcyk7XG5cbiAgdGhpcy5hdmF0YXJJbWFnZS5zcmMgPSB0aGlzLnNraW4uYXZhdGFyO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDM2O1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAxODtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMTgwO1xuICB9XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0ID0gdGhpcy5hdmF0YXJIZWlnaHQ7XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGggPSB0aGlzLmF2YXRhcldpZHRoO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgYW5pbWF0aW9uIGRlb2NyYXRpb24gb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkRGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uuc3JjID0gdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb247XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0O1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGg7XG4gIH1cbn07XG5cbnZhciB0dXJ0bGVGcmFtZSA9IDA7XG5cblxuLyoqXG4gKiBEcmF3IHRoZSB0dXJ0bGUgaW1hZ2UgYmFzZWQgb24gdGhpcy54LCB0aGlzLnksIGFuZCB0aGlzLmhlYWRpbmcuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd1R1cnRsZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc291cmNlWTtcbiAgLy8gQ29tcHV0ZXMgdGhlIGluZGV4IG9mIHRoZSBpbWFnZSBpbiB0aGUgc3ByaXRlLlxuICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaGVhZGluZyAqIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLyAzNjApO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIHRoZSByb3RhdGlvbnMgaW4gdGhlIHNwcml0ZSBzaGVldCBnbyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgIGluZGV4ID0gdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAtIGluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBpbmRleCA9IChpbmRleCArIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MvMikgJSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzO1xuICB9XG4gIHZhciBzb3VyY2VYID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aCAqIGluZGV4O1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHNvdXJjZVkgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodCAqIHR1cnRsZUZyYW1lO1xuICAgIHR1cnRsZUZyYW1lID0gKHR1cnRsZUZyYW1lICsgMSkgJSB0aGlzLnNraW4udHVydGxlTnVtRnJhbWVzO1xuICB9IGVsc2Uge1xuICAgIHNvdXJjZVkgPSAwO1xuICB9XG4gIHZhciBzb3VyY2VXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBzb3VyY2VIZWlnaHQgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodDtcbiAgdmFyIGRlc3RXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBkZXN0SGVpZ2h0ID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQ7XG4gIHZhciBkZXN0WCA9IHRoaXMueCAtIGRlc3RXaWR0aCAvIDI7XG4gIHZhciBkZXN0WSA9IHRoaXMueSAtIGRlc3RIZWlnaHQgKyA3O1xuXG4gIGlmICh0aGlzLmF2YXRhckltYWdlLndpZHRoID09PSAwIHx8IHRoaXMuYXZhdGFySW1hZ2UuaGVpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNvdXJjZVggPCAwIHx8XG4gICAgICBzb3VyY2VZIDwgMCB8fFxuICAgICAgc291cmNlWCArIHNvdXJjZVdpZHRoICAtMCA+IHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggfHxcbiAgICAgIHNvdXJjZVkgKyBzb3VyY2VIZWlnaHQgPiB0aGlzLmF2YXRhckltYWdlLmhlaWdodClcbiAge1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICAvLyBUT0RPKGJqb3JkYW4pOiBhc2sgQnJlbnQsIHN0YXJ0aW5nIHRvIGZsb29kIGdydW50IG1vY2hhVGVzdCBtZXNzYWdlcyxcbiAgICAgIC8vIGJldHRlciBmaXggaGVyZT9cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd0ltYWdlIGlzIG91dCBvZiBzb3VyY2UgYm91bmRzIVwiKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggIT09IDApIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKFxuICAgICAgdGhpcy5hdmF0YXJJbWFnZSxcbiAgICAgIE1hdGgucm91bmQoc291cmNlWCksIE1hdGgucm91bmQoc291cmNlWSksXG4gICAgICBzb3VyY2VXaWR0aCAtIDAsIHNvdXJjZUhlaWdodCxcbiAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgIGRlc3RXaWR0aCAtIDAsIGRlc3RIZWlnaHQpO1xuICB9XG59O1xuXG4vKipcbiAgKiBUaGlzIGlzIGNhbGxlZCB0d2ljZSwgb25jZSB3aXRoIFwiYmVmb3JlXCIgYW5kIG9uY2Ugd2l0aCBcImFmdGVyXCIsIHJlZmVycmluZyB0byBiZWZvcmUgb3IgYWZ0ZXJcbiAgKiB0aGUgc3ByaXRlIGlzIGRyYXduLiAgRm9yIHNvbWUgYW5nbGVzIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUsIGFuZCBmb3Igc29tZSBhZnRlci5cbiAgKi9cblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKHdoZW4pIHtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHZhciBmcmFtZUluZGV4ID0gKHR1cnRsZUZyYW1lICsgMTApICUgdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb25OdW1GcmFtZXM7XG5cbiAgICB2YXIgYW5nbGVJbmRleCA9IE1hdGguZmxvb3IodGhpcy5oZWFkaW5nICogdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAvIDM2MCk7XG5cbiAgICAvLyB0aGUgcm90YXRpb25zIGluIHRoZSBBbm5hICYgRWxzYSBzcHJpdGUgc2hlZXRzIGdvIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24uXG4gICAgYW5nbGVJbmRleCA9IHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLSBhbmdsZUluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBhbmdsZUluZGV4ID0gKGFuZ2xlSW5kZXggKyB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzLzIpICUgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncztcblxuICAgIGlmIChFTFNBX0RFQ09SQVRJT05fREVUQUlMU1thbmdsZUluZGV4XS53aGVuID09IHdoZW4pIHtcbiAgICAgIHZhciBzb3VyY2VYID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGggKiBmcmFtZUluZGV4O1xuICAgICAgdmFyIHNvdXJjZVkgPSAwO1xuICAgICAgdmFyIHNvdXJjZVdpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGg7XG4gICAgICB2YXIgc291cmNlSGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0O1xuICAgICAgdmFyIGRlc3RXaWR0aCA9IHNvdXJjZVdpZHRoO1xuICAgICAgdmFyIGRlc3RIZWlnaHQgPSBzb3VyY2VIZWlnaHQ7XG4gICAgICB2YXIgZGVzdFggPSB0aGlzLnggLSBkZXN0V2lkdGggLyAyIC0gMTUgLSAxNSArIEVMU0FfREVDT1JBVElPTl9ERVRBSUxTW2FuZ2xlSW5kZXhdLng7XG4gICAgICB2YXIgZGVzdFkgPSB0aGlzLnkgLSBkZXN0SGVpZ2h0IC8gMiAtIDEwMDtcblxuICAgICAgaWYgKHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoICE9PSAwKSB7XG4gICAgICAgIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UoXG4gICAgICAgICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UsXG4gICAgICAgICAgTWF0aC5yb3VuZChzb3VyY2VYKSwgTWF0aC5yb3VuZChzb3VyY2VZKSxcbiAgICAgICAgICBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LFxuICAgICAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgICAgICBkZXN0V2lkdGgsIGRlc3RIZWlnaHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFJlc2V0IHRoZSB0dXJ0bGUgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uLCBjbGVhciB0aGUgZGlzcGxheSwgYW5kIGtpbGwgYW55XG4gKiBwZW5kaW5nIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG4gIC8vIFN0YW5kYXJkIHN0YXJ0aW5nIGxvY2F0aW9uIGFuZCBoZWFkaW5nIG9mIHRoZSB0dXJ0bGUuXG4gIHRoaXMueCA9IENBTlZBU19IRUlHSFQgLyAyO1xuICB0aGlzLnkgPSBDQU5WQVNfV0lEVEggLyAyO1xuICB0aGlzLmhlYWRpbmcgPSB0aGlzLmxldmVsLnN0YXJ0RGlyZWN0aW9uICE9PSB1bmRlZmluZWQgP1xuICAgICAgdGhpcy5sZXZlbC5zdGFydERpcmVjdGlvbiA6IDkwO1xuICB0aGlzLnBlbkRvd25WYWx1ZSA9IHRydWU7XG4gIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gRm9yIHNwZWNpYWwgY2FzZXMsIHVzZSBhIGRpZmZlcmVudCBpbml0aWFsIGxvY2F0aW9uLlxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy54ID0gdGhpcy5sZXZlbC5pbml0aWFsWDtcbiAgfVxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy55ID0gdGhpcy5sZXZlbC5pbml0aWFsWTtcbiAgfVxuICAvLyBDbGVhciB0aGUgZGlzcGxheS5cbiAgdGhpcy5jdHhTY3JhdGNoLmNhbnZhcy53aWR0aCA9IHRoaXMuY3R4U2NyYXRjaC5jYW52YXMud2lkdGg7XG4gIHRoaXMuY3R4UGF0dGVybi5jYW52YXMud2lkdGggPSB0aGlzLmN0eFBhdHRlcm4uY2FudmFzLndpZHRoO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDU7XG4gIH1cblxuICB0aGlzLmN0eFNjcmF0Y2gubGluZUNhcCA9ICdyb3VuZCc7XG4gIHRoaXMuY3R4U2NyYXRjaC5mb250ID0gJ25vcm1hbCAxOHB0IEFyaWFsJztcbiAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgLy8gQ2xlYXIgdGhlIGZlZWRiYWNrLlxuICB0aGlzLmN0eEZlZWRiYWNrLmNsZWFyUmVjdChcbiAgICAgIDAsIDAsIHRoaXMuY3R4RmVlZGJhY2suY2FudmFzLndpZHRoLCB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcy5oZWlnaHQpO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJhbm5hTGluZVwiKTtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJlbHNhTGluZVwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBSZXNldCB0byBlbXB0eSBwYXR0ZXJuXG4gICAgdGhpcy5zZXRQYXR0ZXJuKG51bGwpO1xuICB9XG5cbiAgLy8gS2lsbCBhbnkgdGFzay5cbiAgaWYgKHRoaXMucGlkKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnBpZCk7XG4gIH1cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICB0aGlzLmludGVycHJldGVyID0gbnVsbDtcbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG5cbiAgLy8gU3RvcCB0aGUgbG9vcGluZyBzb3VuZC5cbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgdGhpcy5yZXNldFN0ZXBJbmZvXygpO1xufTtcblxuXG4vKipcbiAqIENvcHkgdGhlIHNjcmF0Y2ggY2FudmFzIHRvIHRoZSBkaXNwbGF5IGNhbnZhcy4gQWRkIGEgdHVydGxlIG1hcmtlci5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZGIG9uIGxpbnV4IHJldGFpbnMgZHJhd2luZyBvZiBwcmV2aW91cyBsb2NhdGlvbiBvZiBhcnRpc3QgdW5sZXNzIHdlIGNsZWFyXG4gIC8vIHRoZSBjYW52YXMgZmlyc3QuXG4gIHZhciBzdHlsZSA9IHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGU7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICB0aGlzLmN0eERpc3BsYXkuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4RGlzcGxheS5jYW52YXMud2lkdGgsXG4gICAgdGhpcy5jdHhEaXNwbGF5LmNhbnZhcy53aWR0aCk7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSBzdHlsZTtcblxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICAvLyBEcmF3IHRoZSBpbWFnZXMgbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4SW1hZ2VzLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgYW5zd2VyIGxheWVyLlxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDAuNDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAwLjE1O1xuICB9XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhBbnN3ZXIuY2FudmFzLCAwLCAwKTtcbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMTtcblxuICAvLyBEcmF3IHRoZSBwcmVkcmF3IGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFByZWRyYXcuY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSBwYXR0ZXJuIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFBhdHRlcm4uY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB1c2VyIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB0dXJ0bGUuXG4gIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICB0aGlzLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uKFwiYmVmb3JlXCIpO1xuICAgIHRoaXMuZHJhd1R1cnRsZSgpO1xuICAgIHRoaXMuZHJhd0RlY29yYXRpb25BbmltYXRpb24oXCJhZnRlclwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5BcnRpc3QucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBUdXJ0bGU6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IHVwIHRoaXMuY29kZSwgdGhpcy5pbnRlcnByZXRlciwgZXRjLiB0byBydW4gY29kZSBmb3IgZWRpdENvZGUgbGV2ZWxzXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZ2VuZXJhdGVUdXJ0bGVDb2RlRnJvbUpTXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMoZHJvcGxldENvbmZpZywgJ1R1cnRsZScpO1xuICB0aGlzLnVzZXJDb2RlU3RhcnRPZmZzZXQgPSB0aGlzLmNvZGUubGVuZ3RoO1xuICB0aGlzLmNvZGUgKz0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB0aGlzLnVzZXJDb2RlTGVuZ3RoID0gdGhpcy5jb2RlLmxlbmd0aCAtIHRoaXMudXNlckNvZGVTdGFydE9mZnNldDtcblxuICB2YXIgc2Vzc2lvbiA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuYWNlRWRpdG9yLmdldFNlc3Npb24oKTtcbiAgdGhpcy5jdW11bGF0aXZlTGVuZ3RoID0gY29kZWdlbi5hY2VDYWxjdWxhdGVDdW11bGF0aXZlTGVuZ3RoKHNlc3Npb24pO1xuXG4gIHZhciBpbml0RnVuYyA9IF8uYmluZChmdW5jdGlvbihpbnRlcnByZXRlciwgc2NvcGUpIHtcbiAgICBjb2RlZ2VuLmluaXRKU0ludGVycHJldGVyKGludGVycHJldGVyLCBudWxsLCBudWxsLCBzY29wZSwge1xuICAgICAgVHVydGxlOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9LCB0aGlzKTtcbiAgdGhpcy5pbnRlcnByZXRlciA9IG5ldyB3aW5kb3cuSW50ZXJwcmV0ZXIodGhpcy5jb2RlLCBpbml0RnVuYyk7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXBpLmxvZyA9IFtdO1xuXG4gIC8vIFJlc2V0IHRoZSBncmFwaGljLlxuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQoKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmhhc0V4dHJhVG9wQmxvY2tzKCkgfHxcbiAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIsIHdoaWNoIHdpbGwgZmFpbCBhbmQgcmVwb3J0IHRvcCBsZXZlbCBibG9ja3NcbiAgICB0aGlzLmNoZWNrQW5zd2VyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLmdlbmVyYXRlVHVydGxlQ29kZUZyb21KU18oKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gICAgdGhpcy5ldmFsQ29kZSh0aGlzLmNvZGUpO1xuICB9XG5cbiAgLy8gYXBpLmxvZyBub3cgY29udGFpbnMgYSB0cmFuc2NyaXB0IG9mIGFsbCB0aGUgdXNlcidzIGFjdGlvbnMuXG4gIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3N0YXJ0Jywge2xvb3AgOiB0cnVlfSk7XG4gIC8vIGFuaW1hdGUgdGhlIHRyYW5zY3JpcHQuXG5cbiAgdGhpcy5waWQgPSB3aW5kb3cuc2V0VGltZW91dChfLmJpbmQodGhpcy5hbmltYXRlLCB0aGlzKSwgMTAwKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBEaXNhYmxlIHRvb2xib3ggd2hpbGUgcnVubmluZ1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveChmYWxzZSk7XG4gIH1cbn07XG5cbi8qKlxuICogU3BlY2lhbCBjYXNlOiBpZiB3ZSBoYXZlIGEgdHVybiwgZm9sbG93ZWQgYnkgYSBtb3ZlIGZvcndhcmQsIHRoZW4gd2UgY2FuIGp1c3RcbiAqIGRvIHRoZSB0dXJuIGluc3RhbnRseSBhbmQgdGhlbiBiZWdpbiB0aGUgbW92ZSBmb3J3YXJkIGluIHRoZSBzYW1lIGZyYW1lLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmNoZWNrZm9yVHVybkFuZE1vdmVfID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbmV4dElzRm9yd2FyZCA9IGZhbHNlO1xuXG4gIHZhciBjdXJyZW50VHVwbGUgPSB0aGlzLmFwaS5sb2dbMF07XG4gIHZhciBjdXJyZW50Q29tbWFuZCA9IGN1cnJlbnRUdXBsZVswXTtcbiAgdmFyIGN1cnJlbnRWYWx1ZXMgPSBjdXJyZW50VHVwbGUuc2xpY2UoMSk7XG5cbiAgLy8gQ2hlY2sgZmlyc3QgZm9yIGEgc21hbGwgdHVybiBtb3ZlbWVudC5cbiAgaWYgKGN1cnJlbnRDb21tYW5kID09PSAnUlQnKSB7XG4gICAgdmFyIGN1cnJlbnRBbmdsZSA9IGN1cnJlbnRWYWx1ZXNbMF07XG4gICAgaWYgKE1hdGguYWJzKGN1cnJlbnRBbmdsZSkgPD0gMTApIHtcbiAgICAgIC8vIENoZWNrIHRoYXQgbmV4dCBjb21tYW5kIGlzIGEgbW92ZSBmb3J3YXJkLlxuICAgICAgaWYgKHRoaXMuYXBpLmxvZy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBuZXh0VHVwbGUgPSB0aGlzLmFwaS5sb2dbMV07XG4gICAgICAgIHZhciBuZXh0Q29tbWFuZCA9IG5leHRUdXBsZVswXTtcbiAgICAgICAgaWYgKG5leHRDb21tYW5kID09PSAnRkQnKSB7XG4gICAgICAgICAgbmV4dElzRm9yd2FyZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV4dElzRm9yd2FyZDtcbn07XG5cblxuLyoqXG4gKiBBdHRlbXB0IHRvIGV4ZWN1dGUgb25lIGNvbW1hbmQgZnJvbSB0aGUgbG9nIG9mIEFQSSBjb21tYW5kcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5leGVjdXRlVHVwbGVfID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hcGkubG9nLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBleGVjdXRlU2Vjb25kVHVwbGU7XG5cbiAgZG8ge1xuICAgIC8vIFVubGVzcyBzb21ldGhpbmcgc3BlY2lhbCBoYXBwZW5zLCB3ZSB3aWxsIGp1c3QgZXhlY3V0ZSBhIHNpbmdsZSB0dXBsZS5cbiAgICBleGVjdXRlU2Vjb25kVHVwbGUgPSBmYWxzZTtcblxuICAgIHZhciB0dXBsZSA9IHRoaXMuYXBpLmxvZ1swXTtcbiAgICB2YXIgY29tbWFuZCA9IHR1cGxlWzBdO1xuICAgIHZhciBpZCA9IHR1cGxlW3R1cGxlLmxlbmd0aC0xXTtcblxuICAgIHRoaXMuc3R1ZGlvQXBwXy5oaWdobGlnaHQoU3RyaW5nKGlkKSk7XG5cbiAgICAvLyBTaG91bGQgd2UgZXhlY3V0ZSBhbm90aGVyIHR1cGxlIGluIHRoaXMgZnJhbWUgb2YgYW5pbWF0aW9uP1xuICAgIGlmICh0aGlzLnNraW4uY29uc29saWRhdGVUdXJuQW5kTW92ZSAmJiB0aGlzLmNoZWNrZm9yVHVybkFuZE1vdmVfKCkpIHtcbiAgICAgIGV4ZWN1dGVTZWNvbmRUdXBsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2Ugb25seSBzbW9vdGggYW5pbWF0ZSBmb3IgQW5uYSAmIEVsc2EsIGFuZCBvbmx5IGlmIHRoZXJlIGlzIG5vdCBhbm90aGVyIHR1cGxlIHRvIGJlIGRvbmUuXG4gICAgdmFyIHR1cGxlRG9uZSA9IHRoaXMuc3RlcChjb21tYW5kLCB0dXBsZS5zbGljZSgxKSwge3Ntb290aEFuaW1hdGU6IHRoaXMuc2tpbi5zbW9vdGhBbmltYXRlICYmICFleGVjdXRlU2Vjb25kVHVwbGV9KTtcbiAgICB0aGlzLmRpc3BsYXkoKTtcblxuICAgIGlmICh0dXBsZURvbmUpIHtcbiAgICAgIHRoaXMuYXBpLmxvZy5zaGlmdCgpO1xuICAgICAgdGhpcy5yZXNldFN0ZXBJbmZvXygpO1xuICAgIH1cbiAgfSB3aGlsZSAoZXhlY3V0ZVNlY29uZFR1cGxlKTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YXNrcyB0byBiZSBkb25lIGFmdGVyIHRoZSB1c2VyIHByb2dyYW0gaXMgZmluaXNoZWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZmluaXNoRXhlY3V0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuaGlnaGxpZ2h0QmxvY2sobnVsbCk7XG4gIH1cbiAgdGhpcy5jaGVja0Fuc3dlcigpO1xufTtcblxuLyoqXG4gKiBJdGVyYXRlIHRocm91Z2ggdGhlIHJlY29yZGVkIHBhdGggYW5kIGFuaW1hdGUgdGhlIHR1cnRsZSdzIGFjdGlvbnMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIEFsbCB0YXNrcyBzaG91bGQgYmUgY29tcGxldGUgbm93LiAgQ2xlYW4gdXAgdGhlIFBJRCBsaXN0LlxuICB0aGlzLnBpZCA9IDA7XG5cbiAgLy8gU2NhbGUgdGhlIHNwZWVkIG5vbi1saW5lYXJseSwgdG8gZ2l2ZSBiZXR0ZXIgcHJlY2lzaW9uIGF0IHRoZSBmYXN0IGVuZC5cbiAgdmFyIHN0ZXBTcGVlZCA9IDEwMDAgKiBNYXRoLnBvdygxIC0gdGhpcy5zcGVlZFNsaWRlci5nZXRWYWx1ZSgpLCAyKSAvIHRoaXMuc2tpbi5zcGVlZE1vZGlmaWVyO1xuXG4gIC8vIHdoZW4gc21vb3RoQW5pbWF0ZSBpcyB0cnVlLCB3ZSBkaXZpZGUgbG9uZyBzdGVwcyBpbnRvIHBhcnRpdGlvbnMgb2YgdGhpc1xuICAvLyBzaXplLlxuICB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZSA9IChzdGVwU3BlZWQgPT09IDAgP1xuICAgIEZBU1RfU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFIDogU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFKTtcblxuICBpZiAodGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHZhciBzdGVwcGVkID0gdHJ1ZTtcbiAgICB3aGlsZSAoc3RlcHBlZCkge1xuICAgICAgY29kZWdlbi5zZWxlY3RDdXJyZW50Q29kZSh0aGlzLmludGVycHJldGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1bXVsYXRpdmVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlckNvZGVTdGFydE9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyQ29kZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHVkaW9BcHBfLmVkaXRvcik7XG4gICAgICB0cnkge1xuICAgICAgICBzdGVwcGVkID0gdGhpcy5pbnRlcnByZXRlci5zdGVwKCk7XG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgLy8gVE9ETyAoY3BpcmljaCk6IHBvcHVsYXRlIGxpbmVOdW1iZXIgYXMgd2UgZG8gZm9yIHN0dWRpby9hcHBsYWI6XG4gICAgICAgIHRoaXMuZXhlY3V0aW9uRXJyb3IgPSB7IGVycjogZXJyLCBsaW5lTnVtYmVyOiAxIH07XG4gICAgICAgIHRoaXMuZmluaXNoRXhlY3V0aW9uXygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdGVwcGVkID0gdGhpcy5pbnRlcnByZXRlci5zdGVwKCk7XG5cbiAgICAgIGlmICh0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgICAvLyBXZSBzdGVwcGVkIGZhciBlbm91Z2ggdGhhdCB3ZSBleGVjdXRlZCBhIGNvbW1tYW5kLCBicmVhayBvdXQ6XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXN0ZXBwZWQgJiYgIXRoaXMuZXhlY3V0ZVR1cGxlXygpKSB7XG4gICAgICAvLyBXZSBkcm9wcGVkIG91dCBvZiB0aGUgc3RlcCBsb29wIGJlY2F1c2Ugd2UgcmFuIG91dCBvZiBjb2RlLCBhbGwgZG9uZTpcbiAgICAgIHRoaXMuZmluaXNoRXhlY3V0aW9uXygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoIXRoaXMuZXhlY3V0ZVR1cGxlXygpKSB7XG4gICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICB0aGlzLnBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KF8uYmluZCh0aGlzLmFuaW1hdGUsIHRoaXMpLCBzdGVwU3BlZWQpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5jYWxjdWxhdGVTbW9vdGhBbmltYXRlID0gZnVuY3Rpb24ob3B0aW9ucywgZGlzdGFuY2UpIHtcbiAgdmFyIHR1cGxlRG9uZSA9IHRydWU7XG4gIHZhciBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gdGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc21vb3RoQW5pbWF0ZSkge1xuICAgIHZhciBmdWxsRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICB2YXIgc21vb3RoQW5pbWF0ZVN0ZXBTaXplID0gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemU7XG5cbiAgICBpZiAoZnVsbERpc3RhbmNlIDwgMCkge1xuICAgICAgLy8gR29pbmcgYmFja3dhcmQuXG4gICAgICBpZiAoc3RlcERpc3RhbmNlQ292ZXJlZCAtIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA8PSBmdWxsRGlzdGFuY2UpIHtcbiAgICAgICAgLy8gY2xhbXAgYXQgbWF4aW11bVxuICAgICAgICBkaXN0YW5jZSA9IGZ1bGxEaXN0YW5jZSAtIHN0ZXBEaXN0YW5jZUNvdmVyZWQ7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBmdWxsRGlzdGFuY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXN0YW5jZSA9IC1zbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgLT0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICB0dXBsZURvbmUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBHb2luZyBmb3dhcmQuXG4gICAgICBpZiAoc3RlcERpc3RhbmNlQ292ZXJlZCArIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA+PSBmdWxsRGlzdGFuY2UpIHtcbiAgICAgICAgLy8gY2xhbXAgYXQgbWF4aW11bVxuICAgICAgICBkaXN0YW5jZSA9IGZ1bGxEaXN0YW5jZSAtIHN0ZXBEaXN0YW5jZUNvdmVyZWQ7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBmdWxsRGlzdGFuY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXN0YW5jZSA9IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgc3RlcERpc3RhbmNlQ292ZXJlZCArPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHR1cGxlRG9uZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCA9IHN0ZXBEaXN0YW5jZUNvdmVyZWQ7XG5cbiAgcmV0dXJuIHsgdHVwbGVEb25lOiB0dXBsZURvbmUsIGRpc3RhbmNlOiBkaXN0YW5jZSB9O1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIG9uZSBzdGVwLlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1hbmQgTG9nby1zdHlsZSBjb21tYW5kIChlLmcuICdGRCcgb3IgJ1JUJykuXG4gKiBAcGFyYW0geyFBcnJheX0gdmFsdWVzIExpc3Qgb2YgYXJndW1lbnRzIGZvciB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBmcmFjdGlvbiBIb3cgbXVjaCBvZiB0aGlzIHN0ZXAncyBkaXN0YW5jZSBkbyB3ZSBkcmF3P1xuICogQHBhcmFtIHtvYmplY3R9IHNpbmdsZSBvcHRpb24gZm9yIG5vdzogc21vb3RoQW5pbWF0ZSAodHJ1ZS9mYWxzZSlcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oY29tbWFuZCwgdmFsdWVzLCBvcHRpb25zKSB7XG4gIHZhciB0dXBsZURvbmUgPSB0cnVlO1xuICB2YXIgcmVzdWx0O1xuICB2YXIgZGlzdGFuY2U7XG4gIHZhciBoZWFkaW5nO1xuXG4gIHN3aXRjaCAoY29tbWFuZCkge1xuICAgIGNhc2UgJ0ZEJzogIC8vIEZvcndhcmRcbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLm1vdmVGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSkYnOiAgLy8gSnVtcCBmb3J3YXJkXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5qdW1wRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01WJzogIC8vIE1vdmUgKGRpcmVjdGlvbilcbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgaGVhZGluZyA9IHZhbHVlc1sxXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5zZXRIZWFkaW5nXyhoZWFkaW5nKTtcbiAgICAgIHRoaXMubW92ZUZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdKRCc6ICAvLyBKdW1wIChkaXJlY3Rpb24pXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIGhlYWRpbmcgPSB2YWx1ZXNbMV07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuc2V0SGVhZGluZ18oaGVhZGluZyk7XG4gICAgICB0aGlzLmp1bXBGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUlQnOiAgLy8gUmlnaHQgVHVyblxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMudHVybkJ5RGVncmVlc18ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0RQJzogIC8vIERyYXcgUHJpbnRcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5zYXZlKCk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5yb3RhdGUoMiAqIE1hdGguUEkgKiAodGhpcy5oZWFkaW5nIC0gOTApIC8gMzYwKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsVGV4dCh2YWx1ZXNbMF0sIDAsIDApO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnJlc3RvcmUoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dBJzogIC8vIEdsb2JhbCBBbHBoYVxuICAgICAgdmFyIGFscGhhID0gdmFsdWVzWzBdO1xuICAgICAgYWxwaGEgPSBNYXRoLm1heCgwLCBhbHBoYSk7XG4gICAgICBhbHBoYSA9IE1hdGgubWluKDEwMCwgYWxwaGEpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmdsb2JhbEFscGhhID0gYWxwaGEgLyAxMDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdERic6ICAvLyBEcmF3IEZvbnRcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5mb250ID0gdmFsdWVzWzJdICsgJyAnICsgdmFsdWVzWzFdICsgJ3B0ICcgKyB2YWx1ZXNbMF07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQVSc6ICAvLyBQZW4gVXBcbiAgICAgIHRoaXMucGVuRG93blZhbHVlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQRCc6ICAvLyBQZW4gRG93blxuICAgICAgdGhpcy5wZW5Eb3duVmFsdWUgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFcnOiAgLy8gUGVuIFdpZHRoXG4gICAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVdpZHRoID0gdmFsdWVzWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEMnOiAgLy8gUGVuIENvbG91clxuICAgICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gdmFsdWVzWzBdO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxTdHlsZSA9IHZhbHVlc1swXTtcbiAgICAgIGlmICh0aGlzLnNraW4uaWQgIT0gXCJhbm5hXCIgJiYgdGhpcy5za2luLmlkICE9IFwiZWxzYVwiKSB7XG4gICAgICAgIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BTJzogIC8vIFBlbiBzdHlsZSB3aXRoIGltYWdlXG4gICAgICBpZiAoIXZhbHVlc1swXSB8fCB2YWx1ZXNbMF0gPT0gJ0RFRkFVTFQnKSB7XG4gICAgICAgICAgdGhpcy5zZXRQYXR0ZXJuKG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRQYXR0ZXJuKHZhbHVlc1swXSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdIVCc6ICAvLyBIaWRlIFR1cnRsZVxuICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdTVCc6ICAvLyBTaG93IFR1cnRsZVxuICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YW1wJzpcbiAgICAgIHZhciBpbWcgPSB0aGlzLnN0YW1wc1t2YWx1ZXNbMF1dO1xuICAgICAgdmFyIHdpZHRoID0gaW1nLndpZHRoIC8gMjtcbiAgICAgIHZhciBoZWlnaHQgPSBpbWcuaGVpZ2h0IC8gMjtcbiAgICAgIHZhciB4ID0gdGhpcy54IC0gd2lkdGggLyAyO1xuICAgICAgdmFyIHkgPSB0aGlzLnkgLSBoZWlnaHQgLyAyO1xuICAgICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgICB0aGlzLmN0eFNjcmF0Y2guZHJhd0ltYWdlKGltZywgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB0dXBsZURvbmU7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnNldFBhdHRlcm4gPSBmdW5jdGlvbiAocGF0dGVybikge1xuICBpZiAodGhpcy5sb2FkZWRQYXRoUGF0dGVybnNbcGF0dGVybl0pIHtcbiAgICB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybiA9IHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dO1xuICAgIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSB0cnVlO1xuICB9IGVsc2UgaWYgKHBhdHRlcm4gPT09IG51bGwpIHtcbiAgICB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybiA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSBmYWxzZTtcbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5qdW1wRm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdGhpcy54ICs9IGRpc3RhbmNlICogTWF0aC5zaW4oMiAqIE1hdGguUEkgKiB0aGlzLmhlYWRpbmcgLyAzNjApO1xuICB0aGlzLnkgLT0gZGlzdGFuY2UgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIHRoaXMuaGVhZGluZyAvIDM2MCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLm1vdmVCeVJlbGF0aXZlUG9zaXRpb25fID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54ICs9IHg7XG4gIHRoaXMueSArPSB5O1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kb3RBdF8gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAvLyBXZWJLaXQgKHVubGlrZSBHZWNrbykgZHJhd3Mgbm90aGluZyBmb3IgYSB6ZXJvLWxlbmd0aCBsaW5lLCBzbyBkcmF3IGEgdmVyeSBzaG9ydCBsaW5lLlxuICB2YXIgZG90TGluZUxlbmd0aCA9IDAuMTtcbiAgdGhpcy5jdHhTY3JhdGNoLmxpbmVUbyh4ICsgZG90TGluZUxlbmd0aCwgeSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNpcmNsZUF0XyA9IGZ1bmN0aW9uICh4LCB5LCByYWRpdXMpIHtcbiAgdGhpcy5jdHhTY3JhdGNoLmFyYyh4LCB5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd1RvVHVydGxlXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgaXNEb3QgPSAoZGlzdGFuY2UgPT09IDApO1xuICBpZiAoaXNEb3QpIHtcbiAgICB0aGlzLmRvdEF0Xyh0aGlzLngsIHRoaXMueSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUudHVybkJ5RGVncmVlc18gPSBmdW5jdGlvbiAoZGVncmVlc1JpZ2h0KSB7XG4gIHRoaXMuc2V0SGVhZGluZ18odGhpcy5oZWFkaW5nICsgZGVncmVlc1JpZ2h0KTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2V0SGVhZGluZ18gPSBmdW5jdGlvbiAoaGVhZGluZykge1xuICBoZWFkaW5nID0gdGhpcy5jb25zdHJhaW5EZWdyZWVzXyhoZWFkaW5nKTtcbiAgdGhpcy5oZWFkaW5nID0gaGVhZGluZztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY29uc3RyYWluRGVncmVlc18gPSBmdW5jdGlvbiAoZGVncmVlcykge1xuICBkZWdyZWVzICU9IDM2MDtcbiAgaWYgKGRlZ3JlZXMgPCAwKSB7XG4gICAgZGVncmVlcyArPSAzNjA7XG4gIH1cbiAgcmV0dXJuIGRlZ3JlZXM7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLm1vdmVGb3J3YXJkXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICBpZiAoIXRoaXMucGVuRG93blZhbHVlKSB7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybikge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lV2l0aFBhdHRlcm5fKGRpc3RhbmNlKTtcblxuICAgIC8vIEZyb3plbiBnZXRzIGJvdGggYSBwYXR0ZXJuIGFuZCBhIGxpbmUgb3ZlciB0aGUgdG9wIG9mIGl0LlxuICAgIGlmICh0aGlzLnNraW4uaWQgIT0gXCJlbHNhXCIgJiYgdGhpcy5za2luLmlkICE9IFwiYW5uYVwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5kcmF3Rm9yd2FyZF8oZGlzdGFuY2UpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgaWYgKHRoaXMuc2hvdWxkRHJhd0pvaW50c18oKSkge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRXaXRoSm9pbnRzXyhkaXN0YW5jZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVfKGRpc3RhbmNlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3cyBhIGxpbmUgb2YgbGVuZ3RoIGBkaXN0YW5jZWAsIGFkZGluZyBqb2ludCBrbm9icyBhbG9uZyB0aGUgd2F5XG4gKiBAcGFyYW0gZGlzdGFuY2VcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZFdpdGhKb2ludHNfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciByZW1haW5pbmdEaXN0YW5jZSA9IGRpc3RhbmNlO1xuXG4gIHdoaWxlIChyZW1haW5pbmdEaXN0YW5jZSA+IDApIHtcbiAgICB2YXIgZW5vdWdoRm9yRnVsbFNlZ21lbnQgPSByZW1haW5pbmdEaXN0YW5jZSA+PSBKT0lOVF9TRUdNRU5UX0xFTkdUSDtcbiAgICB2YXIgY3VycmVudFNlZ21lbnRMZW5ndGggPSBlbm91Z2hGb3JGdWxsU2VnbWVudCA/IEpPSU5UX1NFR01FTlRfTEVOR1RIIDogcmVtYWluaW5nRGlzdGFuY2U7XG5cbiAgICByZW1haW5pbmdEaXN0YW5jZSAtPSBjdXJyZW50U2VnbWVudExlbmd0aDtcblxuICAgIGlmIChlbm91Z2hGb3JGdWxsU2VnbWVudCkge1xuICAgICAgdGhpcy5kcmF3Sm9pbnRBdFR1cnRsZV8oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZV8oY3VycmVudFNlZ21lbnRMZW5ndGgpO1xuXG4gICAgaWYgKGVub3VnaEZvckZ1bGxTZWdtZW50KSB7XG4gICAgICB0aGlzLmRyYXdKb2ludEF0VHVydGxlXygpO1xuICAgIH1cbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZExpbmVfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLnN0ZXBTdGFydFgsIHRoaXMuc3RlcFN0YXJ0WSk7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuZHJhd1RvVHVydGxlXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5kcmF3VG9UdXJ0bGVfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlKCk7XG4gIH1cblxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZExpbmVXaXRoUGF0dGVybl8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIGltZztcbiAgdmFyIHN0YXJ0WDtcbiAgdmFyIHN0YXJ0WTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4UGF0dGVybi5tb3ZlVG8odGhpcy5zdGVwU3RhcnRYLCB0aGlzLnN0ZXBTdGFydFkpO1xuICAgIGltZyA9IHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuO1xuICAgIHN0YXJ0WCA9IHRoaXMuc3RlcFN0YXJ0WDtcbiAgICBzdGFydFkgPSB0aGlzLnN0ZXBTdGFydFk7XG5cbiAgICB2YXIgbGluZURpc3RhbmNlID0gTWF0aC5hYnModGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkKTtcblxuICAgIHRoaXMuY3R4UGF0dGVybi5zYXZlKCk7XG4gICAgdGhpcy5jdHhQYXR0ZXJuLnRyYW5zbGF0ZShzdGFydFgsIHN0YXJ0WSk7XG4gICAgLy8gaW5jcmVtZW50IHRoZSBhbmdsZSBhbmQgcm90YXRlIHRoZSBpbWFnZS5cbiAgICAvLyBOZWVkIHRvIHN1YnRyYWN0IDkwIHRvIGFjY29tb2RhdGUgZGlmZmVyZW5jZSBpbiBjYW52YXMgdnMuIFR1cnRsZSBkaXJlY3Rpb25cbiAgICB0aGlzLmN0eFBhdHRlcm4ucm90YXRlKE1hdGguUEkgKiAodGhpcy5oZWFkaW5nIC0gOTApIC8gMTgwKTtcblxuICAgIHZhciBjbGlwU2l6ZTtcbiAgICBpZiAobGluZURpc3RhbmNlICUgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPT09IDApIHtcbiAgICAgIGNsaXBTaXplID0gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgfSBlbHNlIGlmIChsaW5lRGlzdGFuY2UgPiB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZSkge1xuICAgICAgLy8gdGhpcyBoYXBwZW5zIHdoZW4gb3VyIGxpbmUgd2FzIG5vdCBkaXZpc2libGUgYnkgc21vb3RoQW5pbWF0ZVN0ZXBTaXplXG4gICAgICAvLyBhbmQgd2UndmUgaGl0IG91ciBsYXN0IGNodW5rXG4gICAgICBjbGlwU2l6ZSA9IGxpbmVEaXN0YW5jZSAlIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGlwU2l6ZSA9IGxpbmVEaXN0YW5jZTtcbiAgICB9XG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jdHhQYXR0ZXJuLmRyYXdJbWFnZShpbWcsXG4gICAgICAgIC8vIFN0YXJ0IHBvaW50IGZvciBjbGlwcGluZyBpbWFnZVxuICAgICAgICBNYXRoLnJvdW5kKGxpbmVEaXN0YW5jZSksIDAsXG4gICAgICAgIC8vIGNsaXAgcmVnaW9uIHNpemVcbiAgICAgICAgY2xpcFNpemUsIGltZy5oZWlnaHQsXG4gICAgICAgIC8vIHNvbWUgbXlzdGVyaW91cyBoYW5kLXR3ZWFraW5nIGRvbmUgYnkgQnJlbmRhblxuICAgICAgICBNYXRoLnJvdW5kKCh0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBjbGlwU2l6ZSAtIDIpKSwgTWF0aC5yb3VuZCgoLSAxOCkpLFxuICAgICAgICBjbGlwU2l6ZSwgaW1nLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnJlc3RvcmUoKTtcblxuICB9IGVsc2Uge1xuXG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgaW1nID0gdGhpcy5jdXJyZW50UGF0aFBhdHRlcm47XG4gICAgc3RhcnRYID0gdGhpcy54O1xuICAgIHN0YXJ0WSA9IHRoaXMueTtcblxuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC50cmFuc2xhdGUoc3RhcnRYLCBzdGFydFkpO1xuICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGUgYW5kIHJvdGF0ZSB0aGUgaW1hZ2UuXG4gICAgLy8gTmVlZCB0byBzdWJ0cmFjdCA5MCB0byBhY2NvbW9kYXRlIGRpZmZlcmVuY2UgaW4gY2FudmFzIHZzLiBUdXJ0bGUgZGlyZWN0aW9uXG4gICAgdGhpcy5jdHhTY3JhdGNoLnJvdGF0ZShNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDE4MCk7XG5cbiAgICBpZiAoaW1nLndpZHRoICE9PSAwKSB7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZHJhd0ltYWdlKGltZyxcbiAgICAgICAgLy8gU3RhcnQgcG9pbnQgZm9yIGNsaXBwaW5nIGltYWdlXG4gICAgICAgIDAsIDAsXG4gICAgICAgIC8vIGNsaXAgcmVnaW9uIHNpemVcbiAgICAgICAgZGlzdGFuY2UraW1nLmhlaWdodCAvIDIsIGltZy5oZWlnaHQsXG4gICAgICAgIC8vIGRyYXcgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIGN0eC50cmFuc2xhdGUgcG9pbnQgcHJlLXJvdGF0aW9uXG4gICAgICAgIC1pbWcuaGVpZ2h0IC8gNCwgLWltZy5oZWlnaHQgLyAyLFxuICAgICAgICBkaXN0YW5jZStpbWcuaGVpZ2h0IC8gMiwgaW1nLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5jdHhTY3JhdGNoLnJlc3RvcmUoKTtcbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zaG91bGREcmF3Sm9pbnRzXyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubGV2ZWwuaXNLMSAmJiAhdGhpcy5pc1ByZWRyYXdpbmdfO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Sm9pbnRBdFR1cnRsZV8gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY3R4U2NyYXRjaC5iZWdpblBhdGgoKTtcbiAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gIHRoaXMuY2lyY2xlQXRfKHRoaXMueCwgdGhpcy55LCBKT0lOVF9SQURJVVMpO1xuICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlKCk7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlIHdoZXRoZXIgdGhlIHVzZXIncyBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbEVycm9ycyBOdW1iZXIgb2YgcGl4ZWxzIHRoYXQgYXJlIHdyb25nLlxuICogQHBhcmFtIHtudW1iZXJ9IHBlcm1pdHRlZEVycm9ycyBOdW1iZXIgb2YgcGl4ZWxzIGFsbG93ZWQgdG8gYmUgd3JvbmcuXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBsZXZlbCBpcyBzb2x2ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pc0NvcnJlY3RfID0gZnVuY3Rpb24gKHBpeGVsRXJyb3JzLCBwZXJtaXR0ZWRFcnJvcnMpIHtcbiAgcmV0dXJuIHBpeGVsRXJyb3JzIDw9IHBlcm1pdHRlZEVycm9ycztcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5BcnRpc3QucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZlZWRiYWNrSW1hZ2VDYW52YXM7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgLy8gRm9yIGZyb3plbiBza2lucywgc2hvdyBiYWNrZ3JvdW5kIGFuZCBjaGFyYWN0ZXJzIGFsb25nIHdpdGggZHJhd2luZ1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eERpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4U2NyYXRjaDtcbiAgfVxuXG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAndHVydGxlJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IHx8IGxldmVsLmltcHJlc3NpdmUpLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IHR1cnRsZU1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogdHVydGxlTXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuc3R1ZGlvQXBwXy5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vLyBUaGlzIHJlbW92ZXMgbGVuZ3RocyBmcm9tIHRoZSB0ZXh0IHZlcnNpb24gb2YgdGhlIFhNTCBvZiBwcm9ncmFtcy5cbi8vIEl0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSB1c2VyIHByb2dyYW0gYW5kIG1vZGVsIHNvbHV0aW9uIGFyZVxuLy8gaWRlbnRpY2FsIGV4Y2VwdCBmb3IgbGVuZ3Rocy5cbnZhciByZW1vdmVLMUxlbmd0aHMgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVtb3ZlSzFMZW5ndGhzLnJlZ2V4LCAnXCI+Jyk7XG59O1xuXG5yZW1vdmVLMUxlbmd0aHMucmVnZXggPSAvX2xlbmd0aFwiPjx0aXRsZSBuYW1lPVwibGVuZ3RoXCI+Lio/PFxcL3RpdGxlPi87XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gQ29tcGFyZSB0aGUgQWxwaGEgKG9wYWNpdHkpIGJ5dGUgb2YgZWFjaCBwaXhlbCBpbiB0aGUgdXNlcidzIGltYWdlIGFuZFxuICAvLyB0aGUgc2FtcGxlIGFuc3dlciBpbWFnZS5cbiAgdmFyIHVzZXJJbWFnZSA9XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZ2V0SW1hZ2VEYXRhKDAsIDAsIENBTlZBU19XSURUSCwgQ0FOVkFTX0hFSUdIVCk7XG4gIHZhciBhbnN3ZXJJbWFnZSA9XG4gICAgICB0aGlzLmN0eEFuc3dlci5nZXRJbWFnZURhdGEoMCwgMCwgQ0FOVkFTX1dJRFRILCBDQU5WQVNfSEVJR0hUKTtcbiAgdmFyIGxlbiA9IE1hdGgubWluKHVzZXJJbWFnZS5kYXRhLmxlbmd0aCwgYW5zd2VySW1hZ2UuZGF0YS5sZW5ndGgpO1xuICB2YXIgZGVsdGEgPSAwO1xuICAvLyBQaXhlbHMgYXJlIGluIFJHQkEgZm9ybWF0LiAgT25seSBjaGVjayB0aGUgQWxwaGEgYnl0ZXMuXG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICAvLyBDb3B5aW5nIGFuZCBjb21wb3NpdGluZyBpbWFnZXMgYWNyb3NzIGNhbnZhc2VzIHNlZW1zIHRvIGRpc3RvcnQgdGhlXG4gICAgLy8gYWxwaGEuIFVzZSBhIGxhcmdlIGVycm9yIHZhbHVlICgyNTApIHRvIGNvbXBlbnNhdGUuXG4gICAgaWYgKE1hdGguYWJzKHVzZXJJbWFnZS5kYXRhW2ldIC0gYW5zd2VySW1hZ2UuZGF0YVtpXSkgPiAyNTApIHtcbiAgICAgIGRlbHRhKys7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICAvLyBBbGxvdyBzb21lIG51bWJlciBvZiBwaXhlbHMgdG8gYmUgb2ZmLCBidXQgYmUgc3RyaWN0ZXJcbiAgLy8gZm9yIGNlcnRhaW4gbGV2ZWxzLlxuICB2YXIgcGVybWl0dGVkRXJyb3JzID0gbGV2ZWwucGVybWl0dGVkRXJyb3JzO1xuICBpZiAocGVybWl0dGVkRXJyb3JzID09PSB1bmRlZmluZWQpIHtcbiAgICBwZXJtaXR0ZWRFcnJvcnMgPSAxNTA7XG4gIH1cblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXkgbGV2ZWwsIG9yIHRoZSBsZXZlbCBoYXNcbiAgLy8gYmVlbiBjb21wbGV0ZWRcbiAgdmFyIGxldmVsQ29tcGxldGUgPSAobGV2ZWwuZnJlZVBsYXkgfHwgdGhpcy5pc0NvcnJlY3RfKGRlbHRhLCBwZXJtaXR0ZWRFcnJvcnMpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvLyBJbiBsZXZlbCBLMSwgY2hlY2sgaWYgb25seSBsZW5ndGhzIGRpZmZlci5cbiAgaWYgKGxldmVsLmlzSzEgJiYgIWxldmVsQ29tcGxldGUgJiYgIXRoaXMuc3R1ZGlvQXBwXy5lZGl0Q29kZSAmJlxuICAgICAgbGV2ZWwuc29sdXRpb25CbG9ja3MgJiZcbiAgICAgIHJlbW92ZUsxTGVuZ3Rocyhwcm9ncmFtKSA9PT0gcmVtb3ZlSzFMZW5ndGhzKGxldmVsLnNvbHV0aW9uQmxvY2tzKSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0VSUk9SO1xuICAgIHRoaXMubWVzc2FnZSA9IHR1cnRsZU1zZy5sZW5ndGhGZWVkYmFjaygpO1xuICB9XG5cbiAgLy8gRm9yIGxldmVscyB3aGVyZSB1c2luZyB0b28gbWFueSBibG9ja3Mgd291bGQgYWxsb3cgc3R1ZGVudHNcbiAgLy8gdG8gbWlzcyB0aGUgcG9pbnQsIGNvbnZlcnQgdGhhdCBmZWVkYmFjayB0byBhIGZhaWx1cmUuXG4gIGlmIChsZXZlbC5mYWlsRm9yVG9vTWFueUJsb2NrcyAmJlxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA9PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMO1xuXG4gIH0gZWxzZSBpZiAoKHRoaXMudGVzdFJlc3VsdHMgPT1cbiAgICAgIHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkgfHxcbiAgICAgICh0aGlzLnRlc3RSZXN1bHRzID09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BTExfUEFTUykpIHtcbiAgICAvLyBDaGVjayB0aGF0IHRoZXkgZGlkbid0IHVzZSBhIGNyYXp5IGxhcmdlIHJlcGVhdCB2YWx1ZSB3aGVuIGRyYXdpbmcgYVxuICAgIC8vIGNpcmNsZS4gIFRoaXMgY29tcGxhaW5zIGlmIHRoZSBsaW1pdCBkb2Vzbid0IHN0YXJ0IHdpdGggMy5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBsZXZlbCBkb2VzIG5vdCB1c2UgY29sb3VyLCBzbyBubyBuZWVkIHRvIGNoZWNrIGZvciB0aGF0LlxuICAgIGlmIChsZXZlbC5mYWlsRm9yQ2lyY2xlUmVwZWF0VmFsdWUgJiYgdGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIHZhciBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgICAgaWYgKGNvZGUuaW5kZXhPZignY291bnQgPCAzJykgPT0gLTEpIHtcbiAgICAgICAgdGhpcy50ZXN0UmVzdWx0cyA9XG4gICAgICAgICAgICB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0FDQ0VQVEFCTEVfRkFJTDtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gY29tbW9uTXNnLnRvb011Y2hXb3JrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICd0dXJ0bGUnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5waXZvdGFsdHJhY2tlci5jb20vc3Rvcnkvc2hvdy84NDE3MTU2MFxuICAvLyBOZXZlciBzZW5kIHVwIGZyb3plbiBpbWFnZXMgZm9yIG5vdy5cbiAgdmFyIGlzRnJvemVuID0gKHRoaXMuc2tpbi5pZCA9PT0gJ2FubmEnIHx8IHRoaXMuc2tpbi5pZCA9PT0gJ2Vsc2EnKTtcblxuICAvLyBHZXQgdGhlIGNhbnZhcyBkYXRhIGZvciBmZWVkYmFjay5cbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMICYmXG4gICAgIWlzRnJvemVuICYmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5pbXByZXNzaXZlKSkge1xuICAgIHJlcG9ydERhdGEuaW1hZ2UgPSB0aGlzLmdldEZlZWRiYWNrSW1hZ2VfKCk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZ2V0RmVlZGJhY2tJbWFnZV8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZlZWRiYWNrSW1hZ2VDYW52YXM7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4RGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhTY3JhdGNoO1xuICB9XG5cbiAgLy8gQ29weSB0aGUgdXNlciBsYXllclxuICB0aGlzLmN0eEZlZWRiYWNrLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgdGhpcy5jdHhGZWVkYmFjay5kcmF3SW1hZ2UoZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMsIDAsIDAsIDE1NCwgMTU0KTtcbiAgdmFyIGZlZWRiYWNrQ2FudmFzID0gdGhpcy5jdHhGZWVkYmFjay5jYW52YXM7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICBmZWVkYmFja0NhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIikuc3BsaXQoJywnKVsxXSk7XG59O1xuXG4vLyBIZWxwZXIgZm9yIGNyZWF0aW5nIGNhbnZhcyBlbGVtZW50cy5cbkFydGlzdC5wcm90b3R5cGUuY3JlYXRlQ2FudmFzXyA9IGZ1bmN0aW9uIChpZCwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgZWwuaWQgPSBpZDtcbiAgZWwud2lkdGggPSB3aWR0aDtcbiAgZWwuaGVpZ2h0ID0gaGVpZ2h0O1xuICByZXR1cm4gZWw7XG59O1xuXG4vKipcbiogV2hlbiBzbW9vdGggYW5pbWF0ZSBpcyB0cnVlLCBzdGVwcyBjYW4gYmUgYnJva2VuIHVwIGludG8gbXVsdGlwbGUgYW5pbWF0aW9ucy5cbiogQXQgdGhlIGVuZCBvZiBlYWNoIHN0ZXAsIHdlIHdhbnQgdG8gcmVzZXQgYW55IGluY3JlbWVudGFsIGluZm9ybWF0aW9uLCB3aGljaFxuKiBpcyB3aGF0IHRoaXMgZG9lcy5cbiovXG5BcnRpc3QucHJvdG90eXBlLnJlc2V0U3RlcEluZm9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0ZXBTdGFydFggPSB0aGlzLng7XG4gIHRoaXMuc3RlcFN0YXJ0WSA9IHRoaXMueTtcbiAgdGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkID0gMDtcbn07XG4iLCJ2YXIgbGV2ZWxCYXNlID0gcmVxdWlyZSgnLi4vbGV2ZWxfYmFzZScpO1xudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBhbnN3ZXIgPSByZXF1aXJlKCcuL2Fuc3dlcnMnKS5hbnN3ZXI7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8vIEFuIGVhcmx5IGhhY2sgaW50cm9kdWNlZCBzb21lIGxldmVsYnVpbGRlciBsZXZlbHMgYXMgcGFnZSA1LCBsZXZlbCA3LiBMb25nXG4vLyB0ZXJtIHdlIGNhbiBwcm9iYWJseSBkbyBzb21ldGhpbmcgbXVjaCBjbGVhbmVyLCBidXQgZm9yIG5vdyBJJ20gY2FsbGluZ1xuLy8gb3V0IHRoYXQgdGhpcyBsZXZlbCBpcyBzcGVjaWFsIChvbiBwYWdlIDUpLlxudmFyIExFVkVMQlVJTERFUl9MRVZFTCA9IDc7XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgdG9vbGJveC5cbnZhciB0b29sYm94ID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vdG9vbGJveC54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCBzdGFydEJsb2Nrcy5cbnZhciBzdGFydEJsb2NrcyA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3N0YXJ0QmxvY2tzLnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG52YXIgcmVxID0gcmVxdWlyZSgnLi9yZXF1aXJlZEJsb2NrcycpO1xudmFyIG1ha2VNYXRoTnVtYmVyID0gcmVxLm1ha2VNYXRoTnVtYmVyO1xudmFyIHNpbXBsZUJsb2NrID0gcmVxLnNpbXBsZUJsb2NrO1xudmFyIHJlcGVhdCA9IHJlcS5yZXBlYXQ7XG52YXIgZHJhd0FTcXVhcmUgPSByZXEuZHJhd0FTcXVhcmU7XG52YXIgZHJhd0FTbm93bWFuID0gcmVxLmRyYXdBU25vd21hbjtcbnZhciBNT1ZFX0ZPUldBUkRfSU5MSU5FID0gcmVxLk1PVkVfRk9SV0FSRF9JTkxJTkU7XG52YXIgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FO1xudmFyIG1vdmVGb3J3YXJkSW5saW5lID0gcmVxLm1vdmVGb3J3YXJkSW5saW5lO1xudmFyIE1PVkVfQkFDS1dBUkRfSU5MSU5FID0gcmVxLk1PVkVfQkFDS1dBUkRfSU5MSU5FO1xudmFyIHR1cm5MZWZ0UmVzdHJpY3RlZCA9IHJlcS50dXJuTGVmdFJlc3RyaWN0ZWQ7XG52YXIgdHVyblJpZ2h0UmVzdHJpY3RlZCA9IHJlcS50dXJuUmlnaHRSZXN0cmljdGVkO1xudmFyIHR1cm5SaWdodEJ5Q29uc3RhbnQgPSByZXEudHVyblJpZ2h0QnlDb25zdGFudDtcbnZhciB0dXJuUmlnaHQgPSByZXEudHVyblJpZ2h0O1xudmFyIHR1cm5MZWZ0ID0gcmVxLnR1cm5MZWZ0O1xudmFyIG1vdmUgPSByZXEubW92ZTtcbnZhciBkcmF3VHVyblJlc3RyaWN0ZWQgPSByZXEuZHJhd1R1cm5SZXN0cmljdGVkO1xudmFyIGRyYXdUdXJuID0gcmVxLmRyYXdUdXJuO1xudmFyIFNFVF9DT0xPVVJfUElDS0VSID0gcmVxLlNFVF9DT0xPVVJfUElDS0VSO1xudmFyIFNFVF9DT0xPVVJfUkFORE9NID0gcmVxLlNFVF9DT0xPVVJfUkFORE9NO1xudmFyIGRlZmluZVdpdGhBcmcgPSByZXEuZGVmaW5lV2l0aEFyZztcblxudmFyIGJsb2NrcyA9IHtcbiAgU0lNUExFX01PVkVfVVA6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3VwJyksXG4gIFNJTVBMRV9NT1ZFX0RPV046IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2Rvd24nKSxcbiAgU0lNUExFX01PVkVfTEVGVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfbGVmdCcpLFxuICBTSU1QTEVfTU9WRV9SSUdIVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfcmlnaHQnKSxcbiAgU0lNUExFX0pVTVBfVVA6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX3VwJyksXG4gIFNJTVBMRV9KVU1QX0RPV046IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX2Rvd24nKSxcbiAgU0lNUExFX0pVTVBfTEVGVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfbGVmdCcpLFxuICBTSU1QTEVfSlVNUF9SSUdIVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfcmlnaHQnKSxcbiAgU0lNUExFX01PVkVfVVBfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV91cF9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfRE9XTl9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2Rvd25fbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX0xFRlRfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9sZWZ0X2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9SSUdIVF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3JpZ2h0X2xlbmd0aCcpLFxuICBzaW1wbGVNb3ZlQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfTU9WRV9VUCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0RPV04gK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9MRUZUICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfUklHSFQ7XG4gIH0sXG4gIHNpbXBsZUp1bXBCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9KVU1QX1VQICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfRE9XTiArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX0xFRlQgK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9SSUdIVDtcbiAgfSxcbiAgc2ltcGxlTW92ZUxlbmd0aEJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX01PVkVfVVBfTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfRE9XTl9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9MRUZUX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX1JJR0hUX0xFTkdUSDtcbiAgfVxufTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBsZXZlbC1zcGVjaWZpYyByZXF1aXJlbWVudHMuXG4gKi9cbnZhciBsZXZlbHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gTGV2ZWwgMTogRWwuXG4gICcxXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMSksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbTU9WRV9GT1JXQVJEX0lOTElORV0sIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBTcXVhcmUgKHdpdGhvdXQgcmVwZWF0KS5cbiAgJzFfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAyKSxcbiAgICBpZGVhbDogMTEsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBTcXVhcmUgKHdpdGggcmVwZWF0KS5cbiAgJzFfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAzKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXSxcbiAgICAgIFtyZXBlYXQoNCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNDogVHJpYW5nbGUuXG4gICcxXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNCksXG4gICAgaWRlYWw6IDYsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNTogRW52ZWxvcGUuXG4gICcxXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNSksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoMTIwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA2OiB0cmlhbmdsZSBhbmQgc3F1YXJlLlxuICAnMV82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDYpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDEyMCksIHR1cm5MZWZ0UmVzdHJpY3RlZCgxMjApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FLCBNT1ZFX0JBQ0tXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA3OiBnbGFzc2VzLlxuICAnMV83Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDcpLFxuICAgIGlkZWFsOiAxMyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdUdXJuUmVzdHJpY3RlZCg5MCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbTU9WRV9CQUNLV0FSRF9JTkxJTkUsIE1PVkVfRk9SV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgODogc3Bpa2VzLlxuICAnMV84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDgpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW3JlcGVhdCg4KV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA5OiBjaXJjbGUuXG4gICcxXzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgOSksXG4gICAgaWRlYWw6IDYsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHBlcm1pdHRlZEVycm9yczogMTAsXG4gICAgZmFpbEZvckNpcmNsZVJlcGVhdFZhbHVlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnMV8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAxMCksXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDEwKSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IHRydWVcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSAyLlxuICAvLyBMZXZlbCAxOiBTcXVhcmUuXG4gICcyXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMSksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybic7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgICAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5SaWdodCd9LFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcig5MCl9XG4gICAgICB9XSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IG1vdmUgZm9yd2FyZCBvciBiYWNrd2FyZCwgYnV0IHNob3cgZm9yd2FyZCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmUnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd19tb3ZlJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoMTAwKX1cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogU21hbGwgZ3JlZW4gc3F1YXJlLlxuICAnMl8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDIpLFxuICAgIGlkZWFsOiA1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTcXVhcmUoJz8/JyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogVGhyZWUgc3F1YXJlcy5cbiAgJzJfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAzKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbZHJhd0FTcXVhcmUoMTAwKV0sXG4gICAgICBbZHJhd1R1cm4oKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA0OiAzNiBzcXVhcmVzLlxuICAnMl80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDQpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDQpLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDU6IERpZmZlcmVudCBzaXplIHNxdWFyZXMuXG4gICcyXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNSksXG4gICAgaWRlYWw6IDExLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTcXVhcmUoJz8/JyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNjogRm9yLWxvb3Agc3F1YXJlcy5cbiAgJzJfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA2KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA2KSxcbiAgICAvLyBUaGlzIGlzIG5vdCBkaXNwbGF5ZWQgcHJvcGVybHkuXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDc6IEJveHkgc3BpcmFsLlxuICAnMl83Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA3KSxcbiAgICBpZGVhbDogOSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3NpbXBsZUJsb2NrKCdjb250cm9sc19mb3JfY291bnRlcicpXSxcbiAgICAgIFttb3ZlKCc/PycpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldLFxuICAgICAgW3R1cm5SaWdodCg5MCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gUHJlcCBmb3IgTGV2ZWwgODogVHdvIHNub3dtZW4uXG4gICcyXzdfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA3LjUpLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNy41KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbigyNTApXSxcbiAgICAgIFtkcmF3QVNub3dtYW4oMTAwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDg6IFRocmVlIHNub3dtZW4uXG4gICcyXzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgOCksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpZGVhbDogMTIsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oMTUwKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV0sXG4gICAgICBbdHVybkxlZnQoOTApXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICdqdW1wJyxcbiAgICAgICAgdHlwZTogJ2p1bXAnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcigxMDApfVxuICAgICAgfV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ2p1bXAnKV0sXG4gICAgICBbcmVwZWF0KDMpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgOTogU25vd21hbiBmYW1pbHkuXG4gICcyXzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgOSksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpZGVhbDogMTUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oJz8/JyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCdjb250cm9sc19mb3JfY291bnRlcicpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldLFxuICAgICAgW3R1cm5SaWdodCg5MCldLFxuICAgICAgW3R1cm5MZWZ0KDkwKV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAnanVtcCcsXG4gICAgICAgIHR5cGU6ICdqdW1wJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoNjApfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnMl8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAxMCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDEwKVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDMuXG4gIC8vIExldmVsIDE6IENhbGwgJ2RyYXcgYSBzcXVhcmUnLlxuICAnM18xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDEpLFxuICAgIGlkZWFsOiAxNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBDcmVhdGUgXCJkcmF3IGEgdHJpYW5nbGVcIi5cbiAgJzNfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAyKSxcbiAgICBpZGVhbDogMTQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDEyMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IEZlbmNlIHRoZSBhbmltYWxzLlxuICAnM18zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDMpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDIwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgMjQ3XVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDQ3XVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxODIsIDE0N11cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDQ6IEhvdXNlIHRoZSBsaW9uLlxuICAnM180Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDQpLFxuICAgIGlkZWFsOiAxOSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMzApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTk1LCA5N11cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDU6IENyZWF0ZSBcImRyYXcgYSBob3VzZVwiLlxuICAnM181Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDUpLFxuICAgIGlkZWFsOiAyMSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5kZWZpbmUobXNnLmRyYXdBSG91c2UoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMzApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBSG91c2UoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCA5MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjIyLCA5MF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDY6IEFkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgdHJpYW5nbGVcIi5cbiAgJzNfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA2KSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyMyxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2UsXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxODUsIDEwMF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTc1LCAyNDhdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA3OiBBZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIGhvdXNlXCIuXG4gICczXzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNyksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FTcXVhcmUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzIwNSwgMjIwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgODogRHJhdyBob3VzZXMuXG4gICczXzgnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDgpLFxuICAgIGluaXRpYWxYOiAyMCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiA0MCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA4KSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTYsIDE3MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE1LCAyNTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTI3LCAyMjBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzI1NSwgMjUwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgOTogRHJhdyBob3VzZXMgd2l0aCBmb3IgbG9vcC5cbiAgJzNfOSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgOSksXG4gICAgaW5pdGlhbFg6IDIwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDQwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBU3F1YXJlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbLTEwLCAyNzBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzUzLCAyNTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTc1LCAyMjBdXG4gICAgICB9XG4gICAgXSxcbiAgICBmYWlsRm9yVG9vTWFueUJsb2NrczogdHJ1ZSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzNfMTAnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDEwKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMTApXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgNC5cbiAgLy8gTGV2ZWwgMTogT25lIHRyaWFuZ2xlLlxuICAnNF8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDEpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICB9LFxuICAvLyBMZXZlbCAyOiBUd28gdHJpYW5nbGVzLlxuICAnNF8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDIpLFxuICAgIGlkZWFsOiAxMixcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuNVxuICB9LFxuICAvLyBMZXZlbCAzOiBGb3VyIHRyaWFuZ2xlcyB1c2luZyByZXBlYXQuXG4gICc0XzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMyksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuN1xuICB9LFxuICAvLyBMZXZlbCA0OiBUZW4gdHJpYW5nbGVzIHdpdGggbWlzc2luZyByZXBlYXQgbnVtYmVyLlxuICAnNF80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDQpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjcsXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA1OiAzNiB0cmlhbmdsZXMgd2l0aCBtaXNzaW5nIGFuZ2xlIG51bWJlci5cbiAgJzRfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA1KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDY6IDEgc3F1YXJlLlxuICAnNF82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDYpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbW92ZUZvcndhcmRJbmxpbmUoMjApXSxcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ3R1cm5SaWdodCcsXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gICAgcGVybWl0dGVkRXJyb3JzOiAxMCxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA3OiBTcXVhcmUgTGFkZGVyLlxuICAnNF83Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDcpLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFttb3ZlRm9yd2FyZElubGluZSgyMCldLFxuICAgICAgW3JlcGVhdCgxMCldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC43XG4gIH0sXG4gIC8vIExldmVsIDg6IExhZGRlciBzcXVhcmUuXG4gICc0XzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgOCksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDk6IExhZGRlciBzcXVhcmUgd2l0aCBhIGRpZmZlcmVudCBhbmdsZS5cbiAgJzRfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA5KSxcbiAgICBpbml0aWFsWDogMTUwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMzMwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IExhZGRlciBwb2x5Z29uLlxuICAnNF8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxMCksXG4gICAgaW5pdGlhbFg6IDc1LFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxMCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDExOiBwbGF5Z3JvdW5kLlxuICAnNF8xMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxMSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFg6IDc1LFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDExKSxcbiAgICByZXF1aXJlZEJsb2NrcyA6IFtdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgIH0sXG5cbiAgLy8gRm9ybWVybHkgUGFnZSA1LlxuICAvLyBMZXZlbCAxOiBwbGF5Z3JvdW5kLlxuICAnNV8xJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAxKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAxKSxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDI6IHBsYXlncm91bmQuXG4gICc1XzInOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDIpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDIpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgMzogcGxheWdyb3VuZC5cbiAgJzVfMyc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMyksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMyksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA0OiBwbGF5Z3JvdW5kLlxuICAnNV80Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA0KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA0KSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDU6IHBsYXlncm91bmQuXG4gICc1XzUnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDUpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDUpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNjogcGxheWdyb3VuZC5cbiAgJzVfNic6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNiksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA2KSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIFRoZSBsZXZlbCBmb3IgYnVpbGRpbmcgbmV3IGxldmVscy5cbiAgJ2J1aWxkZXInOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgTEVWRUxCVUlMREVSX0xFVkVMKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBUaGUgZGVmYXVsdCBsZXZlbCBuZXdseSBjcmVhdGVkIGxldmVscyB1c2UuXG4gICdjdXN0b20nOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIExFVkVMQlVJTERFUl9MRVZFTCksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgJ2sxX2RlbW8nOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpc0sxOiB0cnVlLFxuICAgIHRvb2xib3g6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICAgICAgYmxvY2tzLnNpbXBsZU1vdmVCbG9ja3MoKSArXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVKdW1wQmxvY2tzKCkgK1xuICAgICAgICBibG9ja3Muc2ltcGxlTW92ZUxlbmd0aEJsb2NrcygpICtcbiAgICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWQnKSArXG4gICAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2RyYXdfY29sb3VyX3NpbXBsZScpXG4gICAgICApLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH1cbn07XG5cbmxldmVscy5lY18xXzEgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzEnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcIm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzIgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzInXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcInBlbkNvbG91cignI2ZmMDAwMCcpO1xcbm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzMgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzMnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcImZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XFxuICBfX1xcbn1cXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfNCA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfNCddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwiZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcXG4gIHBlbkNvbG91cignI2ZmMDAwMCcpO1xcbn1cXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMTAgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzEwJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAncGVuV2lkdGgnOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcIm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG4vLyBBbiBlYXJseSBoYWNrIGludHJvZHVjZWQgc29tZSBsZXZlbGJ1aWxkZXIgbGV2ZWxzIGFzIHBhZ2UgNSwgbGV2ZWwgNy4gTG9uZ1xuLy8gdGVybSB3ZSBjYW4gcHJvYmFibHkgZG8gc29tZXRoaW5nIG11Y2ggY2xlYW5lciwgYnV0IGZvciBub3cgSSdtIGNhbGxpbmdcbi8vIG91dCB0aGF0IHRoaXMgbGV2ZWwgaXMgc3BlY2lhbCAob24gcGFnZSA1KS5cbnZhciBMRVZFTEJVSUxERVJfTEVWRUwgPSA3O1xuXG4vKlxuVE9PTEJPWC5cblxuUEFHRSAxXG49PT09PT1cbldpdGhpbiB0aGlzIHBhZ2UsIGJsb2NrcyBhcmUgb25seSBhZGRlZCwgbmV2ZXIgdGFrZW4gYXdheS5cblxuTGV2ZWwgMSBbZWxdOiBBZGRzIGRyYXdfbW92ZV9ieV9jb25zdGFudCBhbmQgZHJhd190dXJuX2J5X2NvbnN0YW50LlxuTGV2ZWwgMiBbY29sb3VyZWQgc3F1YXJlXTogQWRkcyBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIuXG5sZXZlbCAzIFtzcXVhcmUgaW4gdGhyZWUgYmxvY2tzXTogQWRkcyBjb250cm9sc19yZXBlYXQuXG5sZXZlbCA0IFt0cmlhbmdsZV0gQWRkcyBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9yYW5kb20uXG5MZXZlbCA1IFtvdmVybGFwcGluZyBzcXVhcmUgYW5kIHRyaWFuZ2xlIChzaWRld2F5cyBlbnZlbG9wZSldXG5MZXZlbCA2IFtlbnZlbG9wZV1cbkxldmVsIDcgW2dsYXNzZXNdXG5MZXZlbCA4IFtzcGlrZXNdXG5MZXZlbCA5IFtjaXJjbGVdXG5MZXZlbCAxMCBbZnJlZSBwbGF5XTogZHJhd193aWR0aF9pbmxpbmVcblxuUEFHRSAyXG49PT09PT1cbkNhdGVnb3JpZXMgYXJlIGludHJvZHVjZWQsIHdpdGggY29udGVudHMgb2Y6XG4tIEFjdGlvbnNcbiAgLSBkcmF3X21vdmUgd2l0aCBtYXRoX251bWJlclxuICAtIGRyYXdfdHVybiB3aXRoIG1hdGhfbnVtYmVyXG4tIENvbG9yXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3BpY2tlclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9yYW5kb21cbi0gRnVuY3Rpb25zIChhZGRlZCBhdCBsZXZlbCAyKVxuICAtIFtjYWxsXSBkcmF3IGEgc3F1YXJlXG4gIC0gW2NhbGxdIGRyYXcgYSBzbm93YmFsbCAoYWRkZWQgYXQgbGV2ZWwgOSlcbi0gTG9vcHNcbiAgLSBjb250cm9sc19yZXBlYXRcbiAgLSBjb250cm9sc19mb3IgKGFkZGVkIGF0IGxldmVsIDYpXG4tIE1hdGhcbiAgLSBtYXRoX251bWJlclxuLSBWYXJpYWJsZXMgKGFkZGVkIGF0IGxldmVsIDYpXG4gIC0gZ2V0IGNvdW50ZXIgKGFkZGVkIGF0IGxldmVsIDkpXG4gIC0gZ2V0IGhlaWdodCAoYWRkZWQgYXQgbGV2ZWwgNylcbiAgLSBnZXQgbGVuZ3RoIChsZXZlbHMgNiBhbmQgMTApXG5MZXZlbCAxIFtzcXVhcmVdXG5MZXZlbCAyIFtzcXVhcmUgYnkgZnVuY3Rpb24gY2FsbF06IGFkZCBcImRyYXcgYSBzcXVhcmVcIlxuTGV2ZWwgMyBbMyBzcXVhcmVzXVxuTGV2ZWwgNCBbMzYgc3F1YXJlc11cbkxldmVsIDUgW25lc3RlZCBzcXVhcmVzIHdpdGhvdXQgY29udHJvbHNfZm9yXVxuTGV2ZWwgNiBbbmVzdGVkIHNxdWFyZXMgd2l0aCBjb250cm9sc19mb3JdXG5MZXZlbCA3IFttaW5pLXNwaXJhbF1cbkxldmVsIDggWzMgc25vd21lbl06IGFkZCBcImRyYXcgYSBzbm93bWFuXCJcbkxldmVsIDkgW3Nub3dtYW4gZmFtaWx5XVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV1cblxuUEFHRSAzXG49PT09PT1cbkNhdGVnb3JpZXMgYXJlIHVzZWQsIHdpdGggY29udGVudHMgb2Y6XG4tIEFjdGlvbnNcbiAgLSBkcmF3X21vdmUgd2l0aCBtYXRoX251bWJlclxuICAtIGRyYXdfdHVybiB3aXRoIG1hdGhfbnVtYmVyXG4tIENvbG9yXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3BpY2tlclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9yYW5kb21cbi0gRnVuY3Rpb25zIChSZXBsYWNlZCB3aXRoIGN1c3RvbSBjYXRlZ29yeSBhdCBsZXZlbCAyKVxuICAtIFtjYWxsXSBkcmF3IGEgY2lyY2xlXG4gIC0gW2NhbGxdIGRyYXcgYSBzcXVhcmVcbi0gTG9vcHNcbiAgLSBjb250cm9sc19mb3JcbiAgLSBjb250cm9sc19yZXBlYXRcbi0gTWF0aFxuICAtIG1hdGhfbnVtYmVyXG4tIFZhcmlhYmxlcyAoYWRkZWQgYXQgbGV2ZWwgNilcbiAgLSBnZXQgY291bnRlclxuVmFyaWFibGVzIGFuZCBmdW5jdGlvbnMgYXJlIG1hbnVhbGx5IGFkZGVkIHVudGlsIExldmVscyA3IGFuZCA4LFxud2hlbiB0aGUgY3VzdG9tIGNhdGVnb3JpZXMgYXJlIHVzZWRcbkxldmVsIDEgW2NhbGwgXCJkcmF3IGEgc3F1YXJlXCJdXG5MZXZlbCAyIFtjcmVhdGUgYW5kIGNhbGwgXCJkcmF3IGEgdHJpYW5nbGVcIl1cbkxldmVsIDMgW3VzZSBcImRyYXcgYSBzcXVhcmVcIiBhbmQgXCJkcmF3IGEgdHJpYW5nbGVcIiB0byBmZW5jZSBhbmltYWxzXVxuTGV2ZWwgNCBbZHJhdyBhIGhvdXNlXVxuTGV2ZWwgNSBbY3JlYXRlIGFuZCBjYWxsIFwiZHJhdyBhIGhvdXNlXCJdXG5MZXZlbCA2IFthZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIHRyaWFuZ2xlXCJdXG5MZXZlbCA3IFthZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIGhvdXNlXCJdXG5MZXZlbCA4IFttb2RpZnkgZW5kIGxvY2F0aW9uIG9mIFwiY3JlYXRlIGEgaG91c2VcIl1cbkxldmVsIDkgW2NhbGwgXCJkcmF3IGEgaG91c2VcIiB3aXRoIGZvciBsb29wXVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV1cblxuKi87IGJ1Zi5wdXNoKCc8eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gICcpOzkyOyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnQnKTs5MzsgaWYgKGxldmVsIDw9IDgpIHsgOyBidWYucHVzaCgnX3Jlc3RyaWN0ZWQnKTs5MzsgfSA7IGJ1Zi5wdXNoKCdcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTs5NjsgaWYgKGxldmVsID49IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTAxOyBpZiAobGV2ZWwgPj0gNCkgeyAvKiBPdXQgb2YgbnVtZXJpYyBvcmRlciB0byBtYWtlIGNvbG91ciBibG9ja3MgYWRqYWNlbnQuICovOyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTA2OyB9OyBidWYucHVzaCgnICAgICcpOzEwNjsgaWYgKGxldmVsID49IDMpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwOTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDk7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIiB4PVwiMTU4XCIgeT1cIjY3XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTEyOyB9OyBidWYucHVzaCgnICAnKTsxMTI7IH0gZWxzZSBpZiAocGFnZSA9PSAyIHx8IHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgICAnKTsxMTI7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBpZD1cImFjdGlvbnNcIiBuYW1lPVwiJywgZXNjYXBlKCgxMTIsICBtc2cuY2F0VHVydGxlKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEyMDsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA4KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImp1bXBcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEyNzsgfTsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMzQ7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEzNzsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxMzg7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxMzgsICBtc2cuY2F0Q29sb3VyKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE1MDsgLy8gRnVuY3Rpb25zIGRpZmZlciBkZXBlbmRpbmcgb24gcGFnZSBhbmQgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgJyk7MTUwOyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTUwLCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgJyk7MTU4OyBpZiAobGV2ZWwgPj0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgJyk7MTY1OyB9OyBidWYucHVzaCgnICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTY2OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgICAgICcpOzE2NjsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICcpOzE2NjsgLy8gRG9uJ3QgdXNlIGN1c3RvbSBjYXRlZ29yeSB5ZXQsIHNpbmNlIGl0IGFsbG93cyBmdW5jdGlvbiBkZWZpbml0aW9uLlxuOyBidWYucHVzaCgnICAgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTY2LCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDE2OCwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxNzEsICBtc2cuZHJhd0FTcXVhcmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L2NhdGVnb3J5PlxcbiAgICAgICcpOzE3NDsgfSBlbHNlIHsgOyBidWYucHVzaCgnXFxuICAgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTc1LCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICAgICAgJyk7MTc2OyB9OyBidWYucHVzaCgnICAgICcpOzE3NjsgfTsgYnVmLnB1c2goJyAgICAnKTsxNzY7IC8vIENvbnRyb2w6IGNvbnRyb2xzX2Zvcl9jb3VudGVyIChmcm9tIHBhZ2UgMiwgbGV2ZWwgNikgYW5kIHJlcGVhdC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTc2LCAgbXNnLmNhdENvbnRyb2woKSApKSwgJ1wiPlxcbiAgICAgICcpOzE3NzsgaWYgKChwYWdlID09IDIgJiYgbGV2ZWwgPj0gNikgfHwgKHBhZ2UgPT0gMyAmJiBsZXZlbCA+PSA5KSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzE5NDsgfTsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTk4OyAvLyBNYXRoOiBKdXN0IG51bWJlciBibG9ja3MgdW50aWwgZmluYWwgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE5OCwgIG1zZy5jYXRNYXRoKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PC9ibG9jaz5cXG4gICAgICAnKTsyMDA7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21faW50XCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21fZmxvYXRcIj48L2Jsb2NrPlxcbiAgICAnKTsyMTQ7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjE1OyAvLyBWYXJpYWJsZXMgZGVwZW5kcyBvbiBwYWdlIGFuZCBsZXZlbCwgYWx0aG91Z2ggd2UgbmV2ZXIgdXNlIHRoZSBjdXN0b20gY2F0ZWdvcnlcbjsgYnVmLnB1c2goJyAgICAnKTsyMTU7IC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBvZmZlciBzaW1wbGlmaWVkIGdldHRlcnMgYW5kIG5vIHNldHRlcnMuXG47IGJ1Zi5wdXNoKCcgICAgJyk7MjE1OyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjE1LCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjE4OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMyAmJiBsZXZlbCA+PSA2ICYmIGxldmVsIDwgMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjE4LCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCI+XFxuICAgICAgICAnKTsyMTk7IGlmIChsZXZlbCA+PSA5KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICAgICcpOzIyMDsgfTsgYnVmLnB1c2goJyAgICAgICAgJyk7MjIwOyBpZiAobGV2ZWwgPj0gNikgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgICcpOzIyMTsgfTsgYnVmLnB1c2goJyAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIyMjsgfSBlbHNlIGlmIChwYWdlID09IDMgJiYgbGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjIyLCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCIgY3VzdG9tPVwiVkFSSUFCTEVcIj5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMjQ7IH07IGJ1Zi5wdXNoKCcgICcpOzIyNDsgfSBlbHNlIGlmIChwYWdlID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjI0OyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7MjI4OyBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7MjMxOyB9OyBidWYucHVzaCgnICAgICcpOzIzMTsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI0NDsgfSBlbHNlIGlmIChwYWdlID09IDUpIHs7IGJ1Zi5wdXNoKCcgICcpOzI0NDsgLy8gSzEgc2ltcGxpZmllZCBibG9ja3MgZm9yIGVkaXRvcjoga2VlcCBpbiBzeW5jIHdpdGggRGFzaGJvYXJkIGFydGlzdC5yYlxuOyBidWYucHVzaCgnICAgICcpOzI0NDsgaWYgKGxldmVsID09PSBMRVZFTEJVSUxERVJfTEVWRUwpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIksxIFNpbXBsaWZpZWRcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJfc2ltcGxlXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfdXBcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9kb3duXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfbGVmdFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3JpZ2h0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfdXBfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfZG93bl9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9sZWZ0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3JpZ2h0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX3VwXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfZG93blwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX2xlZnRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9yaWdodFwiPjwvYmxvY2s+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjYyOyB9OyBidWYucHVzaCgnICAgICcpOzI2MjsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IGlkPVwiYWN0aW9uc1wiIG5hbWU9XCInLCBlc2NhcGUoKDI2MiwgIG1zZy5jYXRUdXJ0bGUoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJqdW1wXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzI4OTsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDI4OSwgIG1zZy5jYXRDb2xvdXIoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzAxOyAvLyBGdW5jdGlvbnNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzAxLCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICAgICcpOzMwMjsgaWYgKGxldmVsID09PSBMRVZFTEJVSUxERVJfTEVWRUwpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCJQcmVidWlsdFwiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3RyaWFuZ2xlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVfY3VzdG9tXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9ob3VzZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfZmxvd2VyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93Zmxha2VcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2hleGFnb25cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3N0YXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3JvYm90XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yb2NrZXRcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3BsYW5ldFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfcmhvbWJ1c1wiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3VwcGVyX3dhdmVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19sb3dlcl93YXZlXCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzE4OyB9OyBidWYucHVzaCgnICAgICcpOzMxODsgLy8gQ29udHJvbDogY29udHJvbHNfZm9yX2NvdW50ZXIgYW5kIHJlcGVhdC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzE4LCAgbXNnLmNhdENvbnRyb2woKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzM2OyBpZiAobGV2ZWwgPCA2KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzMzOTsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzQ2OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAnKTszNDc7IC8vIExvZ2ljXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM0NywgIG1zZy5jYXRMb2dpYygpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19pZlwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19jb21wYXJlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX29wZXJhdGlvblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19uZWdhdGVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfYm9vbGVhblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19udWxsXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX3Rlcm5hcnlcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszNTY7IC8vIE1hdGg6IEp1c3QgbnVtYmVyIGJsb2NrcyB1bnRpbCBmaW5hbCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzU2LCAgbXNnLmNhdE1hdGgoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9pbnRcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9mbG9hdFwiPjwvYmxvY2s+XFxuICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszNzM7IC8vIFZhcmlhYmxlc1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNzMsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIiBjdXN0b209XCJWQVJJQUJMRVwiPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgJyk7Mzc1OyB9OyBidWYucHVzaCgnPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxuLyoqXG4gKiBDb21tb24gY29kZSBmb3IgY3JlYXRpbmcgcHJvY2VkdXJlcyBkcmF3aW5nIGRpZmZlcmVudCByZWd1bGFyIHBvbHlnb25zLlxuICogb3B0aW9uczpcbiAqICAgdGl0bGUgVGl0bGUgb2YgcHJvY2VkdXJlLlxuICogICBtb2RpZmllcnMgU3RyaW5nIGNvbnRhaW5pbmcgYW55IG9wdGlvbmFsIGtleXMgYW5kIHZhbHVlcyBmb3IgdGhlIGluaXRpYWxcbiAqICAgICAgICAgICAgIDxibG9jaz4gdGFnLCBzdWNoIGFzICd4PVwiMjBcIiB5PVwiMjBcIiBlZGl0YWJsZT1cImZhbHNlXCInLlxuICogICBzaWRlcyBOdW1iZXIgb2Ygc2lkZXMuXG4gKiAgIGxlbmd0aCAwIGlmIGEgbGVuZ3RoIHBhcmFtZXRlciBzaG91bGQgYmUgdXNlZCwgYSBwb3NpdGl2ZSBudW1iZXIgb3RoZXJ3aXNlXG4gKi9cbnZhciBwb2x5Z29uID0gZnVuY3Rpb24ob3B0aW9ucykgezsgYnVmLnB1c2goJzxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiICcsICgxNCwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgIDxtdXRhdGlvbj5cXG4gICAgICAnKTsxNjsgaWYgKG9wdGlvbnMubGVuZ3RoID09IDApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAnKTsxNzsgfTsgYnVmLnB1c2goJyAgICA8L211dGF0aW9uPlxcbiAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDE4LCAgb3B0aW9ucy50aXRsZSApKSwgJzwvdGl0bGU+XFxuICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiAnLCAoMjAsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicsIGVzY2FwZSgoMjEsICBvcHRpb25zLnNpZGVzICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgJywgKDIzLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAnKTsyNTsgaWYgKG9wdGlvbnMubGVuZ3RoID09IDApIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2xlbmd0aFwiICcsICgyNSwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICcpOzI2OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgJywgKDI2LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoMjcsICBvcHRpb25zLmxlbmd0aCApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAnKTsyOTsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiICcsICgzMSwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgJywgKDMzLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCgzNCwgIDM2MCAvIG9wdGlvbnMuc2lkZXMgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvc3RhdGVtZW50PlxcbiAgPC9ibG9jaz5cXG4nKTs0NDsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTs0NTtcbi8qKlxuICogU3BpcmFsIG5lZWRzIGEgbmFtZWQgaGVscGVyIHRlbXBsYXRlIGZvciByZWN1cnNpb24uXG4gKiBAcGFyYW0gaSBMb29wIGNvbnRyb2wgdmFyaWFibGUuXG4gKi9cbnZhciBzcGlyYWwgPSBmdW5jdGlvbihpKSB7OyBidWYucHVzaCgnICAnKTs1MDsgaWYgKGkgPD0gNjApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiAnKTs1MDsgaWYgKGkgPT0gMjUpIHsgOyBidWYucHVzaCgneD1cIjMwMFwiIHk9XCIxMDBcIicpOzUwOyB9IDsgYnVmLnB1c2goJyBpbmxpbmU9XCJmYWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDU0LCAgaSApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cImZhbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICcpOzY2OyBzcGlyYWwoaSArIDUpOyBidWYucHVzaCgnICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzA7IH0gOyBidWYucHVzaCgnXFxuJyk7NzE7IH07OyBidWYucHVzaCgnXFxuJyk7NzI7XG4vKipcbiAqIERlZmluZSB0aGUgc3RhcnRpbmcgYmxvY2tzIGZvciBlYWNoIHBhZ2UgYW5kIGxldmVsLlxuICogVGhlc2UgYXJlIHJlZmVyZW5jZWQgZnJvbSB0dXJ0bGUuanMuXG4gKi9cbjsgYnVmLnB1c2goJ1xcbicpOzc4OyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAnKTs3ODsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPlxcbiAgJyk7Nzk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJDT0xPVVJcIj4jZmYwMDAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4OTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7OTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMyB8fCBsZXZlbCA9PSA1IHx8IGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Jyk7MTAwOyBpZiAobGV2ZWwgPT0gMykgeyA7IGJ1Zi5wdXNoKCc0Jyk7MTAwOyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCczJyk7MTAwOyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMDI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMDY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJzZXQtY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIiB4PVwiMjBcIiB5PVwiMTAwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUJhY2t3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj40NTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMjk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTUwOyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNTQ7IH07IGJ1Zi5wdXNoKCcnKTsxNTQ7IH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7OyBidWYucHVzaCgnICAnKTsxNTQ7IC8vIE5vIGJsb2NrcyBhcmUgcHJvdmlkZWQgZm9yIGxldmVscyAxIGFuZCAyLlxuOyBidWYucHVzaCgnICAnKTsxNTQ7IGlmIChsZXZlbCA9PSAzIHx8IGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTU0OyAvLyBDYWxsIFwiZHJhdyBhIHNxdWFyZVwiLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTU3OyBpZiAobGV2ZWwgPT0gMykgeyA7IGJ1Zi5wdXNoKCcxMDAnKTsxNTc7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzUwJyk7MTU3OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNjE7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICAnKTsxNjE7IC8vIFRocmVlLXNxdWFyZSBjb2RlLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiAgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayBpZD1cInNldC1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxOTA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTkxLCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxOTQ7IGlmIChsZXZlbCA9PSA2KSB7IDsgYnVmLnB1c2goJzUwJyk7MTk0OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCcxMCcpOzE5NDsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxOTk7IGlmIChsZXZlbCA9PSA2KSB7IDsgYnVmLnB1c2goJzkwJyk7MTk5OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCcxMDAnKTsxOTk7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjEyOyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjEyOyBzcGlyYWwoMjUpOyBidWYucHVzaCgnICAnKTsyMTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNy41KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiB4PVwiMjBcIiB5PVwiMjBcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjI1MDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCB8fCBsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiB4PVwiMjBcIiB5PVwiMjBcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE1MDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMjY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiIHg9XCIxNThcIiB5PVwiNjdcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI2NjsgfTsgYnVmLnB1c2goJycpOzI2NjsgfSBlbHNlIGlmIChwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICcpOzI2NjsgLy8gRGVmaW5lIFwiZHJhdyBhIHNxdWFyZVwiLlxuOyBidWYucHVzaCgnICAnLCAoMjY2LCAgcG9seWdvbih7XG4gICAgdGl0bGU6IG1zZy5kcmF3QVNxdWFyZSgpLFxuICAgIG1vZGlmaWVyczogKGxldmVsID09IDggPyAnJyA6ICd4PVwiMjIwXCIgeT1cIjQwXCInKSArICcgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInLFxuICAgIHNpZGVzOiA0LFxuICAgIGxlbmd0aDogKGxldmVsID49IDYgPyAwIDogMTAwKVxuICB9KSksICcgICcpOzI3MTsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjcxOyAvLyBEZWZpbmUgXCJkcmF3IGEgY2lyY2xlXCIuXG47IGJ1Zi5wdXNoKCcgICAgJywgKDI3MSwgIHBvbHlnb24oe1xuICAgICAgdGl0bGU6IG1zZy5kcmF3QUNpcmNsZSgpLFxuICAgICAgbW9kaWZpZXJzOiAneD1cIjIyMFwiIHk9XCIyNTBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicsXG4gICAgICBzaWRlczogMzYwLFxuICAgICAgbGVuZ3RoOiAxXG4gICAgfSkpLCAnICAnKTsyNzY7IH07IGJ1Zi5wdXNoKCcgICcpOzI3NjsgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIyMFwiIHk9XCIyNTBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDI3NywgIG1zZy5kcmF3QVRyaWFuZ2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjc5OyB9IGVsc2UgaWYgKGxldmVsID49IDMpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7Mjc5OyAvLyAgRGVmaW5lIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG47IGJ1Zi5wdXNoKCcgICAgJywgKDI3OSwgIHBvbHlnb24oe1xuICAgICAgdGl0bGU6IG1zZy5kcmF3QVRyaWFuZ2xlKCksXG4gICAgICBtb2RpZmllcnM6IChsZXZlbCA9PSA4ID8gJycgOiAneD1cIjIyMFwiIHk9XCIyNTBcIicpICsgKGxldmVsID09IDYgPyAnJyA6ICcgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInKSxcbiAgICAgIHNpZGVzOiAzLFxuICAgICAgbGVuZ3RoOiAobGV2ZWwgPj0gNyA/IDAgOiAxMDApXG4gICAgfSkpLCAnICAnKTsyODQ7IH07IGJ1Zi5wdXNoKCcgICcpOzI4NDsgaWYgKGxldmVsID09IDggKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgyODUsICBtc2cuZHJhd0FIb3VzZSgpICkpLCAnXCI+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDI4NiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyOTQ7IH07IGJ1Zi5wdXNoKCcgICcpOzI5NDsgaWYgKGxldmVsID09IDcgfHwgbGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAnKTsyOTQ7IC8vICBEZWZpbmUgXCJkcmF3IGEgaG91c2VcIi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiAnKTsyOTQ7IGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgneD1cIjIyMFwiIHk9XCI0NjBcIicpOzI5NDsgfTsgYnVmLnB1c2goJz4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICAnKTsyOTU7IGlmIChsZXZlbCA9PSA4KSB7IDsgYnVmLnB1c2goJzxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMjk1LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+Jyk7Mjk1OyB9OyBidWYucHVzaCgnICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDI5NiwgIG1zZy5kcmF3QUhvdXNlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDI5OSwgIG1zZy5kcmF3QVNxdWFyZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgzMDAsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIi8+XFxuICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICcpOzMwMzsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzA0LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgJyk7MzA2OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICcpOzMwOTsgfTsgYnVmLnB1c2goJyAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAnKTszMTQ7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzE1LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAnKTszMTc7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICcpOzMyMDsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMzMxLCAgbXNnLmRyYXdBVHJpYW5nbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMzMyLCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzMzNTsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzM2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzM4OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzM0MTsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM1MTsgfSAvLyBFbmQgb2YgcmVnaW9uIGluIHdoaWNoIFwiZHJhdyBhIHNxdWFyZVwiIGlzIGRlZmluZWQuXG47IGJ1Zi5wdXNoKCcnKTszNTE7IH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7OyBidWYucHVzaCgnICAnKTszNTE7IGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjIzMFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mzk3OyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0MTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDUyOyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzY8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ4NTsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzUwNzsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzU0MDsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzU4NDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjgwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjI4OyB9IGVsc2UgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjcyOyB9OyBidWYucHVzaCgnJyk7NjcyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gNSkgezsgYnVmLnB1c2goJyAgJyk7NjcyOyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNjk4LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzcxNjsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg3NDIsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEyMTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzc2MDsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg3ODYsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEzNDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzgwNDsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg4MTMsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDgxNCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIyNzBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDgzOCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoODQwLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NjA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg4NDksICBtc2cuc3RlcCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4Njc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj44PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg4OTMsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4OTQsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoODk4LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMzIwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5MjAsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDkyMiwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjYwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoOTMxLCAgbXNnLnN0ZXAoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7OTQ5OyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDk1MCwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJ1wiPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NTEsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NTIsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJBUkcxXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIxOTBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk2NywgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk2OCwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDk3MCwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfaWZcIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIklGMFwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibG9naWNfY29tcGFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5HVDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDk3OCwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPMFwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJQRU5cIj5wZW5Eb3duPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1VTFRJUExZPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj43PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwMDksICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEzMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwMjYsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5ESVZJREU8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE4MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDQyLCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxMDQ5LCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTA1MCwgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTA1MSwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NSU5VUzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNTgsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcxXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDcwLCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJQRU5cIj5wZW5VcDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlQmFja3dhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TVVMVElQTFk8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDExMDEsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMTI1OyB9OyBidWYucHVzaCgnJyk7MTEyNTsgfTsgYnVmLnB1c2goJycpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogU2V0cyBCbG9ja2x5QXBwIGNvbnN0YW50cyB0aGF0IGRlcGVuZCBvbiB0aGUgcGFnZSBhbmQgbGV2ZWwuXG4gKiBUaGlzIGVuY2Fwc3VsYXRlcyBtYW55IGZ1bmN0aW9ucyB1c2VkIGZvciBTdHVkaW9BcHAucmVxdWlyZWRCbG9ja3NfLlxuICogSW4gdGhlIGZ1dHVyZSwgc29tZSBvZiB0aGVzZSBtYXkgYmUgbW92ZWQgdG8gY29tbW9uLmpzLlxuICovXG5cbnZhciByZXF1aXJlZEJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9yZXF1aXJlZF9ibG9ja191dGlscycpO1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfYV9zcXVhcmUgYmxvY2sgb24gcGFnZSAyLlxuZnVuY3Rpb24gZHJhd0FTcXVhcmUobnVtYmVyKSB7XG4gIHJldHVybiB7dGVzdDogJ2RyYXdfYV9zcXVhcmUnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIobnVtYmVyKX19O1xufVxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfYV9zbm93bWFuIGJsb2NrIG9uIHBhZ2UgMi5cbmZ1bmN0aW9uIGRyYXdBU25vd21hbihudW1iZXIpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnZHJhd19hX3Nub3dtYW4nLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X2Ffc25vd21hbicsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKG51bWJlcil9fTtcbn1cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLlxudmFyIE1PVkVfRk9SV0FSRF9JTkxJTkUgPSB7dGVzdDogJ21vdmVGb3J3YXJkJywgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCd9O1xuXG4vLyBhbGxvdyBtb3ZlIGZvcndhcmQgb3IgYmFja3dhcmQsIGJ1dCBzaG93IGZvcndhcmQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbnZhciBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FID0ge1xuICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnO1xuICB9LFxuICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50J1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsIHdpdGggdGhlIGdpdmVuIHBpeGVsIG51bWJlci5cbnZhciBtb3ZlRm9yd2FyZElubGluZSA9IGZ1bmN0aW9uKHBpeGVscykge1xuICByZXR1cm4ge3Rlc3Q6ICdtb3ZlRm9yd2FyZCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogcGl4ZWxzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwuXG52YXIgTU9WRV9CQUNLV0FSRF9JTkxJTkUgPSB7dGVzdDogJ21vdmVCYWNrd2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzOiB7J0RJUic6ICdtb3ZlQmFja3dhcmQnfX07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGEgW3JpZ2h0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9ja1xuLy8gYW5kIGNyZWF0ZXMgdGhlIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZC9yZWNvbW1lbmRlZCBudW1iZXIgb2YgZGVncmVlcyBhc1xuLy8gaXRzIGlucHV0LiAgVGhlIHJlc3RyaWN0ZWQgdHVybiBpcyB1c2VkIG9uIHRoZSBlYXJsaWVyIGxldmVscyBvZiB0aGVcbi8vIHR1dG9yaWFsLlxudmFyIHR1cm5SaWdodFJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7dGVzdDogJ3R1cm5SaWdodCgnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYSBbbGVmdF0gZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2tcbi8vIGFuZCBjcmVhdGVzIHRoZSBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWQvcmVjb21tZW5kZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXNcbi8vIGl0cyBpbnB1dC4gIFRoZSByZXN0cmljdGVkIHR1cm4gaXMgdXNlZCBvbiB0aGUgZWFybGllciBsZXZlbHMgb2YgdGhlXG4vLyB0dXRvcmlhbC5cbnZhciB0dXJuTGVmdFJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7dGVzdDogJ3R1cm5MZWZ0KCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgW3JpZ2h0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnQgYmxvY2tcbi8vIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuXG52YXIgdHVyblJpZ2h0QnlDb25zdGFudCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudCcgJiZcbiAgICAgICAgICAoZGVncmVlcyA9PT0gJz8/PycgfHxcbiAgICAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LnZhbHVlVG9Db2RlKFxuICAgICAgICAgICAgIGJsb2NrLCAnVkFMVUUnLCBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfTk9ORSkgPT0gZGVncmVlcyk7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFtyaWdodF0gZHJhd190dXJuIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZFxuLy8gbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LiAgRm9yIHRoZSBlYXJsaWVzdCBsZXZlbHMsIHRoZSBtZXRob2Rcbi8vIHR1cm5SaWdodFJlc3RyaWN0ZWQgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZC5cbnZhciB0dXJuUmlnaHQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nICYmXG4gICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ0RJUicpID09ICd0dXJuUmlnaHQnO1xuICAgICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5SaWdodCd9LFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkZWdyZWVzKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgbGVmdCBkcmF3X3R1cm4gYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkXG4vLyBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuICBUaGlzIG1ldGhvZCBpcyBub3QgYXBwcm9wcmlhdGUgZm9yIHRoZVxuLy8gZWFybGllc3QgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbCwgd2hpY2ggZG8gbm90IHByb3ZpZGUgZHJhd190dXJuLlxudmFyIHR1cm5MZWZ0ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJyAmJlxuICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdESVInKSA9PSAndHVybkxlZnQnO1xuICAgICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5MZWZ0J30sXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRlZ3JlZXMpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW55IGRyYXdfbW92ZSBibG9jayBhbmQsIGlmIG5vdCBwcmVzZW50LCBjcmVhdGVzXG4vLyBvbmUgd2l0aCB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlLlxudmFyIG1vdmUgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICByZXR1cm4ge3Rlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7cmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZSc7IH0sXG4gICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZScsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRpc3RhbmNlKX19O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9jay5cbnZhciBkcmF3VHVyblJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCc7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfdHVybiBibG9jay5cbnZhciBkcmF3VHVybiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJztcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcignPz8/Jyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFwic2V0IGNvbG91clwiIGJsb2NrIHdpdGggYSBjb2xvdXIgcGlja2VyXG4vLyBhcyBpdHMgaW5wdXQuXG52YXIgU0VUX0NPTE9VUl9QSUNLRVIgPSB7dGVzdDogJ3BlbkNvbG91cihcXCcjJyxcbiAgdHlwZTogJ2RyYXdfY29sb3VyJyxcbiAgdmFsdWVzOiB7J0NPTE9VUic6ICc8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPid9fTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBcInNldCBjb2xvdXJcIiBibG9jayB3aXRoIGEgcmFuZG9tIGNvbG91clxuLy8gZ2VuZXJhdG9yIGFzIGl0cyBpbnB1dC5cbnZhciBTRVRfQ09MT1VSX1JBTkRPTSA9IHt0ZXN0OiAncGVuQ29sb3VyKGNvbG91cl9yYW5kb20nLFxuICB0eXBlOiAnZHJhd19jb2xvdXInLFxuICB2YWx1ZXM6IHsnQ09MT1VSJzogJzxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+J319O1xuXG4vKipcbiAqIENyZWF0ZXMgYSByZXF1aXJlZCBibG9jayBzcGVjaWZpY2F0aW9uIGZvciBkZWZpbmluZyBhIGZ1bmN0aW9uIHdpdGggYW5cbiAqIGFyZ3VtZW50LiAgVW5saWtlIHRoZSBvdGhlciBmdW5jdGlvbnMgdG8gY3JlYXRlIHJlcXVpcmVkIGJsb2NrcywgdGhpc1xuICogaXMgZGVmaW5lZCBvdXRzaWRlIG9mIFR1cnRsZS5zZXRCbG9ja2x5QXBwQ29uc3RhbnRzIGJlY2F1c2UgaXQgaXMgYWNjZXNzZWRcbiAqIHdoZW4gY2hlY2tpbmcgZm9yIGEgcHJvY2VkdXJlIG9uIGxldmVscyA4LTkgb2YgVHVydGxlIDMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVuY19uYW1lIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhcmdfbmFtZSBUaGUgbmFtZSBvZiB0aGUgc2luZ2xlIGFyZ3VtZW50LlxuICogQHJldHVybiBBIHJlcXVpcmVkIGJsb2NrIHNwZWNpZmljYXRpb24gdGhhdCB0ZXN0cyBmb3IgYSBjYWxsIG9mIHRoZVxuICogICAgIHNwZWNpZmllZCBmdW5jdGlvbiB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnQgbmFtZS4gIElmIG5vdCBwcmVzZW50LFxuICogICAgIHRoaXMgY29udGFpbnMgdGhlIGluZm9ybWF0aW9uIHRvIGNyZWF0ZSBzdWNoIGEgYmxvY2sgZm9yIGRpc3BsYXkuXG4gKi9cbnZhciBkZWZpbmVXaXRoQXJnID0gZnVuY3Rpb24oZnVuY19uYW1lLCBhcmdfbmFtZSkge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAncHJvY2VkdXJlc19kZWZub3JldHVybicgJiZcbiAgICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gZnVuY19uYW1lICYmXG4gICAgICAgICAgYmxvY2sucGFyYW1ldGVyTmFtZXNfICYmIGJsb2NrLnBhcmFtZXRlck5hbWVzXy5sZW5ndGggJiZcbiAgICAgICAgICBibG9jay5wYXJhbWV0ZXJOYW1lc19bMF0gPT0gYXJnX25hbWU7XG4gICAgfSxcbiAgICB0eXBlOiAncHJvY2VkdXJlc19kZWZub3JldHVybicsXG4gICAgdGl0bGVzOiB7J05BTUUnOiBmdW5jX25hbWV9LFxuICAgIGV4dHJhOiAnPG11dGF0aW9uPjxhcmcgbmFtZT1cIicgKyBhcmdfbmFtZSArICdcIj48L2FyZz48L211dGF0aW9uPidcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtYWtlTWF0aE51bWJlcjogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyLFxuICBzaW1wbGVCbG9jazogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrLFxuICByZXBlYXQ6IHJlcXVpcmVkQmxvY2tVdGlscy5yZXBlYXQsXG4gIGRyYXdBU3F1YXJlOiBkcmF3QVNxdWFyZSxcbiAgZHJhd0FTbm93bWFuOiBkcmF3QVNub3dtYW4sXG4gIE1PVkVfRk9SV0FSRF9JTkxJTkU6IE1PVkVfRk9SV0FSRF9JTkxJTkUsXG4gIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkU6IE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUsXG4gIG1vdmVGb3J3YXJkSW5saW5lOiBtb3ZlRm9yd2FyZElubGluZSxcbiAgTU9WRV9CQUNLV0FSRF9JTkxJTkU6IE1PVkVfQkFDS1dBUkRfSU5MSU5FLFxuICB0dXJuTGVmdFJlc3RyaWN0ZWQ6IHR1cm5MZWZ0UmVzdHJpY3RlZCxcbiAgdHVyblJpZ2h0UmVzdHJpY3RlZDogdHVyblJpZ2h0UmVzdHJpY3RlZCxcbiAgdHVyblJpZ2h0QnlDb25zdGFudDogdHVyblJpZ2h0QnlDb25zdGFudCxcbiAgdHVyblJpZ2h0OiB0dXJuUmlnaHQsXG4gIHR1cm5MZWZ0OiB0dXJuTGVmdCxcbiAgbW92ZTogbW92ZSxcbiAgZHJhd1R1cm5SZXN0cmljdGVkOiBkcmF3VHVyblJlc3RyaWN0ZWQsXG4gIGRyYXdUdXJuOiBkcmF3VHVybixcbiAgU0VUX0NPTE9VUl9QSUNLRVI6IFNFVF9DT0xPVVJfUElDS0VSLFxuICBTRVRfQ09MT1VSX1JBTkRPTTogU0VUX0NPTE9VUl9SQU5ET00sXG4gIGRlZmluZVdpdGhBcmc6IGRlZmluZVdpdGhBcmcsXG59O1xuIiwibW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICB7J2Z1bmMnOiAnbW92ZUZvcndhcmQnLCAnY2F0ZWdvcnknOiAnQXJ0aXN0JywgJ3BhcmFtcyc6IFtcIjEwMFwiXSwgJ2lkQXJnTGFzdCc6IHRydWUgfSxcbiAgeydmdW5jJzogJ3R1cm5SaWdodCcsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiOTBcIl0sICdpZEFyZ0xhc3QnOiB0cnVlIH0sXG4gIHsnZnVuYyc6ICdwZW5Db2xvdXInLCAnY2F0ZWdvcnknOiAnQXJ0aXN0JywgJ3BhcmFtcyc6IFtcIicjZmYwMDAwJ1wiXSwgJ2lkQXJnTGFzdCc6IHRydWUgfSxcbiAgeydmdW5jJzogJ3BlbldpZHRoJywgJ2NhdGVnb3J5JzogJ0FydGlzdCcsICdwYXJhbXMnOiBbXCIxXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuXTtcblxubW9kdWxlLmV4cG9ydHMuY2F0ZWdvcmllcyA9IHtcbiAgJ0FydGlzdCc6IHtcbiAgICAnY29sb3InOiAncmVkJyxcbiAgICAnYmxvY2tzJzogW11cbiAgfSxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJzbGlkZXItY2VsbFwiPlxcbiAgPHN2ZyBpZD1cInNsaWRlclwiXFxuICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxcbiAgICAgICB4bWxuczpzdmc9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXFxuICAgICAgIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXFxuICAgICAgIHZlcnNpb249XCIxLjFcIlxcbiAgICAgICB3aWR0aD1cIjE1MFwiXFxuICAgICAgIGhlaWdodD1cIjUwXCI+XFxuICAgICAgPCEtLSBTbG93IGljb24uIC0tPlxcbiAgICAgIDxjbGlwUGF0aCBpZD1cInNsb3dDbGlwUGF0aFwiPlxcbiAgICAgICAgPHJlY3Qgd2lkdGg9MjYgaGVpZ2h0PTEyIHg9NSB5PTE0IC8+XFxuICAgICAgPC9jbGlwUGF0aD5cXG4gICAgICA8aW1hZ2UgeGxpbms6aHJlZj1cIicsIGVzY2FwZSgoMTMsICBhc3NldFVybChpY29uUGF0aCkgKSksICdcIiBoZWlnaHQ9NDIgd2lkdGg9ODQgeD0tMjEgeT0tMTBcXG4gICAgICAgICAgY2xpcC1wYXRoPVwidXJsKCNzbG93Q2xpcFBhdGgpXCIgLz5cXG4gICAgICA8IS0tIEZhc3QgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwiZmFzdENsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTYgeD0xMjAgeT0xMCAvPlxcbiAgICAgIDwvY2xpcFBhdGg+XFxuICAgICAgPGltYWdlIHhsaW5rOmhyZWY9XCInLCBlc2NhcGUoKDE5LCAgYXNzZXRVcmwoaWNvblBhdGgpICkpLCAnXCIgaGVpZ2h0PTQyIHdpZHRoPTg0IHg9MTIwIHk9LTExXFxuICAgICAgICAgIGNsaXAtcGF0aD1cInVybCgjZmFzdENsaXBQYXRoKVwiIC8+XFxuICA8L3N2Zz5cXG4gIDxpbWcgaWQ9XCJzcGlubmVyXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW47XCIgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS90dXJ0bGUvbG9hZGluZy5naWYnKSApKSwgJ1wiIGhlaWdodD0xNSB3aWR0aD0xNT5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEEgc2V0IG9mIGJsb2NrcyB1c2VkIGJ5IHNvbWUgb2Ygb3VyIGN1c3RvbSBsZXZlbHMgKGkuZS4gYnVpbHQgYnkgbGV2ZWwgYnVpbGRlcilcbiAqL1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gaW5zdGFsbERyYXdBU3F1YXJlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsQ3JlYXRlQUNpcmNsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbENyZWF0ZUFTbm93Zmxha2VCcmFuY2goYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVRyaWFuZ2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FIb3VzZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBRmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FTbm93Zmxha2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUhleGFnb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVN0YXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJvYm90KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSb2NrZXQoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVBsYW5ldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUmhvbWJ1cyhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdVcHBlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcblxuIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlRHJvcGRvd24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlQUNpcmNsZUNvZGUgKHNpemUsIGdlbnN5bSwgaW5kZW50KSB7XG4gIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICBpbmRlbnQgPSBpbmRlbnQgfHwgJyc7XG4gIHJldHVybiBbXG4gICAgaW5kZW50ICsgJy8vIGNyZWF0ZV9hX2NpcmNsZScsXG4gICAgaW5kZW50ICsgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM2OyAnICtcbiAgICBpbmRlbnQgKyAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICBpbmRlbnQgKyAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHNpemUgKyAnKTsnLFxuICAgIGluZGVudCArICcgIFR1cnRsZS50dXJuUmlnaHQoMTApOycsXG4gICAgaW5kZW50ICsgJ31cXG4nXS5qb2luKCdcXG4nKTtcbn1cblxuXG4vKipcbiAqIFNhbWUgYXMgZHJhd19hX3NxdWFyZSwgZXhjZXB0IGlucHV0cyBhcmUgbm90IGlubGluZWRcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU3F1YXJlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZV9jdXN0b20gPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNxdWFyZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zcXVhcmVfY3VzdG9tID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3NxdWFyZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBjcmVhdGVfYV9jaXJjbGUgYW5kIGNyZWF0ZV9hX2NpcmNsZV9zaXplXG4gKiBmaXJzdCBkZWZhdWx0cyB0byBzaXplIDEwLCBzZWNvbmQgcHJvdmlkZXMgYSBzaXplIHBhcmFtXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBQ2lyY2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX2NpcmNsZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmNyZWF0ZUFDaXJjbGUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JlYXRlX2FfY2lyY2xlX3NpemUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5jcmVhdGVBQ2lyY2xlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNpemVQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjcmVhdGVBQ2lyY2xlQ29kZSgxMCwgZ2Vuc3ltKTtcbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2FfY2lyY2xlX3NpemUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoc2l6ZSwgZ2Vuc3ltKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBjcmVhdGVfYV9zbm93Zmxvd2VyXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlQnJhbmNoKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX3Nub3dmbGFrZV9icmFuY2ggPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5jcmVhdGVBU25vd2ZsYWtlQnJhbmNoKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgdmFyIGxvb3BWYXIyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnLy8gY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCcsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKDkwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCg0NSk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDQ1KTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByaG9tYnVzIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUmhvbWJ1cyhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yaG9tYnVzID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FSaG9tYnVzKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Job21idXMgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc3F1YXJlLlxuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMjsgJyArXG4gICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoNjApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHRyaWFuZ2xlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBVHJpYW5nbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfdHJpYW5nbGUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVRyaWFuZ2xlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3RyaWFuZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhleGFnb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfaGV4YWdvbiA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBSGV4YWdvbigpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9oZXhhZ29uID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoNjApOycsXG4gICAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIGhvdXNlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBSG91c2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfaG91c2UgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QUhvdXNlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2hvdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBmbG93ZXIgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfZmxvd2VyID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FGbG93ZXIoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfZmxvd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHZhciBjb2xvcl9yYW5kb20gPSBnZW5lcmF0b3IuY29sb3VyX3JhbmRvbSgpWzBdO1xuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiMyMjhiMjJcIik7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDE4KTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvcl9yYW5kb20gKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDM2KTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnIC8gMik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoJyArIHZhbHVlX2xlbmd0aCArICcvIDIpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgxOTgpOycsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTgwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgc25vd2ZsYWtlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU25vd2ZsYWtlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3Nub3dmbGFrZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU25vd2ZsYWtlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc25vd2ZsYWtlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHZhciBjb2xvcl9yYW5kb20gPSBnZW5lcmF0b3IuY29sb3VyX3JhbmRvbSgpWzBdO1xuICAgIHJldHVybiBbXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgODsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cihcIiM3ZmZmZDRcIik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMTUpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cihcIiMwMDAwY2RcIik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgxNSk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDQ1KTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgc3RhciBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVN0YXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc3RhciA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU3RhcigpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zdGFyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgxOCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA1OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDE0NCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTgpO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvYm90KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3JvYm90ID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FSb2JvdCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvYm90ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgyMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDEwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg4MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg4MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDE1KTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxMjApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgzMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMjEwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoNjApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDExNSk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDUwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNTApO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG5cbi8qKlxuICogRHJhdyBhIHJvYm90IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUm9ja2V0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3JvY2tldCA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUm9ja2V0KCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiNmZjAwMDBcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMDAwXCIpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgyMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgcGxhbmV0IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUGxhbmV0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3BsYW5ldCA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUGxhbmV0KCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3BsYW5ldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjODA4MDgwXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzYwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUJhY2t3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxKTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IHVwcGVyIHdhdmUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd1VwcGVyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdXBwZXJfd2F2ZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdVcHBlcldhdmUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3VwcGVyX3dhdmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiMwMDAwY2RcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAxMDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxOCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBsb3dlciB3YXZlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdMb3dlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xvd2VyX3dhdmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3TG93ZXJXYXZlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19sb3dlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlRHJvcGRvd24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgdmFyIHNub3dmbGFrZXMgPSBbXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VTcXVhcmUoKSwgJ3NxdWFyZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUGFyYWxsZWxvZ3JhbSgpLCAncGFyYWxsZWxvZ3JhbSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlTGluZSgpLCAnbGluZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3BpcmFsKCksICdzcGlyYWwnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUZsb3dlcigpLCAnZmxvd2VyJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGcmFjdGFsKCksICdmcmFjdGFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VSYW5kb20oKSwgJ3JhbmRvbSddXG4gIF07XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JlYXRlX3Nub3dmbGFrZV9kcm9wZG93biA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHNub3dmbGFrZXMpLCAnVFlQRScpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfc25vd2ZsYWtlX2Ryb3Bkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuIFwiVHVydGxlLmRyYXdTbm93Zmxha2UoJ1wiICsgdHlwZSArIFwiJywgJ2Jsb2NrX2lkX1wiICsgdGhpcy5pZCArIFwiJyk7XCI7XG4gIH07XG59XG4iLCIvLyBsb2NhbGUgZm9yIHR1cnRsZVxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS50dXJ0bGVfbG9jYWxlO1xuIiwiLy8gQ3JlYXRlIGEgbGltaXRlZCBjb2xvdXIgcGFsZXR0ZSB0byBhdm9pZCBvdmVyd2hlbG1pbmcgbmV3IHVzZXJzXG4vLyBhbmQgdG8gbWFrZSBjb2xvdXIgY2hlY2tpbmcgZWFzaWVyLiAgVGhlc2UgZGVmaW5pdGlvbnMgY2Fubm90IGJlXG4vLyBtb3ZlZCB0byBibG9ja3MuanMsIHdoaWNoIGlzIGxvYWRlZCBsYXRlciwgc2luY2UgdGhleSBhcmUgdXNlZCBpblxuLy8gdG9wLWxldmVsIGRlZmluaXRpb25zIGJlbG93LiAgTm90ZSB0aGF0IHRoZSBoZXggZGlnaXRzIGEtZiBhcmVcbi8vIGxvd2VyLWNhc2UuICBUaGlzIGlzIGFzc3VtZWQgaW4gY29tcGFyaXNvbnMgYmVsb3cuXG52YXIgQ29sb3VycyA9IHtcbiAgQkxBQ0s6ICcjMDAwMDAwJyxcbiAgR1JFWTogJyM4MDgwODAnLFxuICBLSEFLSTogJyNjM2IwOTEnLFxuICBXSElURTogJyNmZmZmZmYnLFxuICBSRUQ6ICcjZmYwMDAwJyxcbiAgUElOSzogJyNmZjc3ZmYnLFxuICBPUkFOR0U6ICcjZmZhMDAwJyxcbiAgWUVMTE9XOiAnI2ZmZmYwMCcsXG4gIEdSRUVOOiAnIzIyOGIyMicsXG4gIEJMVUU6ICcjMDAwMGNkJyxcbiAgQVFVQU1BUklORTogJyM3ZmZmZDQnLFxuICBQTFVNOiAnIzg0MzE3OScsXG5cbiAgRlJPWkVOMTogXCIjZDBmZGZkXCIsXG4gIEZST1pFTjI6IFwiI2QwZmRkMFwiLFxuICBGUk9aRU4zOiBcIiNkMGQwZmRcIixcbiAgRlJPWkVONDogXCIjZTBlMGUwXCIsXG4gIEZST1pFTjU6ICcjZmZmZmZmJyxcbiAgRlJPWkVONjogXCIjZThlOGU4XCIsXG4gIEZST1pFTjc6IFwiI2JiZDFlNFwiLFxuICBGUk9aRU44OiBcIiNmZGQwZmRcIixcbiAgRlJPWkVOOTogXCIjYWVhNGZmXCJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3VycztcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2FtcGxlIGFuc3dlcnMgZm9yIFR1cnRsZSBsZXZlbHMuIFVzZWQgZm9yIHByb21wdHMgYW5kIG1hcmtpbmcuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG5cbnZhciBzZXRSYW5kb21WaXNpYmxlQ29sb3VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBudW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygyLCAyNCkpO1xuICAvLyBNYWtlIHN1cmUgYXQgbGVhc3Qgb25lIGNvbXBvbmVudCBpcyBiZWxvdyAweDgwIGFuZCB0aGUgcmVzdFxuICAvLyBiZWxvdyAweEEwLCB0byBwcmV2ZW50IHRvbyBsaWdodCBvZiBjb2xvdXJzLlxuICBudW0gJj0gMHg5ZjdmOWY7XG4gIHZhciBjb2xvdXIgPSAnIycgKyAoJzAwMDAwJyArIG51bS50b1N0cmluZygxNikpLnN1YnN0cigtNik7XG4gIGFwaS5wZW5Db2xvdXIoY29sb3VyKTtcbn07XG5cbnZhciBkcmF3U3F1YXJlID0gZnVuY3Rpb24obGVuZ3RoLCByYW5kb21fY29sb3VyKSB7XG4gIGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCA0OyBjb3VudCsrKSB7XG4gICAgaWYgKHJhbmRvbV9jb2xvdXIpIHtcbiAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICB9XG4gICAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gIH1cbn07XG5cbnZhciBkcmF3VHJpYW5nbGUgPSBmdW5jdGlvbihsZW5ndGgsIHJhbmRvbV9jb2xvdXIpIHtcbiAgZm9yICh2YXIgY291bnQgPSAwOyBjb3VudCA8IDM7IGNvdW50KyspIHtcbiAgICBpZiAocmFuZG9tX2NvbG91cikge1xuICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgIH1cbiAgICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gIH1cbn07XG5cbnZhciBkcmF3U25vd21hbiA9IGZ1bmN0aW9uKGhlaWdodCkge1xuICBhcGkudHVybkxlZnQoOTApO1xuICB2YXIgZGlzdGFuY2VzID0gW2hlaWdodCAqIDAuNSwgaGVpZ2h0ICogMC4zLCBoZWlnaHQgKiAwLjJdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgIHZhciBkaXN0YW5jZSA9IGRpc3RhbmNlc1tpIDwgMyA/IGkgOiA1IC0gaV0gLyA1Ny41O1xuICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMTgwOyBkICs9IDIpIHtcbiAgICAgIGFwaS5tb3ZlRm9yd2FyZChkaXN0YW5jZSk7XG4gICAgICBhcGkudHVyblJpZ2h0KDIpO1xuICAgIH1cbiAgICBpZiAoaSAhPSAyKSB7XG4gICAgICBhcGkudHVyblJpZ2h0KDE4MCk7XG4gICAgfVxuICB9XG4gIGFwaS50dXJuTGVmdCg5MCk7XG59O1xuXG52YXIgZHJhd0hvdXNlID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIGRyYXdTcXVhcmUobGVuZ3RoKTtcbiAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gIGFwaS50dXJuUmlnaHQoMzApO1xuICBkcmF3VHJpYW5nbGUobGVuZ3RoKTtcbiAgYXBpLnR1cm5SaWdodCg2MCk7XG4gIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICBhcGkudHVybkxlZnQoOTApO1xuICBhcGkubW92ZUJhY2t3YXJkKGxlbmd0aCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvZyBvZiBhIHNhbXBsZSBzb2x1dGlvbnMgZm9yIGVhY2ggbGV2ZWwuXG4gKiBUbyBjcmVhdGUgYW4gYW5zd2VyLCBqdXN0IHNvbHZlIHRoZSBsZXZlbCBpbiBCbG9ja2x5LCB0aGVuIHBhc3RlIHRoZVxuICogcmVzdWx0aW5nIEphdmFTY3JpcHQgaGVyZSwgbW92aW5nIGFueSBmdW5jdGlvbnMgdG8gdGhlIGJlZ2lubmluZyBvZlxuICogdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0cy5hbnN3ZXIgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICBhcGkubG9nID0gW107XG4gIHZhciBjb3VudCwgc2lkZUlkeCwgbGVuO1xuICBpZiAocGFnZSA9PSAxKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBFbC5cbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIFNxdWFyZS5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gVXNlIHJlcGVhdCB0byBkcmF3IGEgc3F1YXJlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gRXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDAsIHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gU2lkZXdheXMgZW52ZWxvcGUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICAvLyBUcmlhbmdsZSBhbmQgc3F1YXJlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLnR1cm5SaWdodCgxODApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBHbGFzc2VzLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBjYzAwJyk7ICAvLyBibHVlXG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlQmFja3dhcmQoMTUwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU3Bpa3kuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDg7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLm1vdmVCYWNrd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoNDUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBDaXJjbGUuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2MDsgY291bnQrKykge1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDIpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIFNpbmdsZSBzcXVhcmUgaW4gc29tZSBjb2xvci5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBTaW5nbGUgZ3JlZW4gc3F1YXJlLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBmZjAwJyk7ICAvLyBncmVlblxuICAgICAgICBkcmF3U3F1YXJlKDUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIFRocmVlIHNxdWFyZXMsIDEyMCBkZWdyZWVzIGFwYXJ0LCBpbiByYW5kb20gY29sb3JzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIDM2IHNxdWFyZXMsIDEwIGRlZ3JlZXMgYXBhcnQsIGluIHJhbmRvbSBjb2xvcnMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTogIC8vIERyYXcgd2l0aG91dCB1c2luZyBmb3ItbG9vcC4gIChGYWxsIHRocm91Z2ggdG8gbmV4dCBjYXNlLilcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy8gU3F1YXJlcyB3aXRoIHNpZGVzIG9mIDUwLCA2MCwgNzAsIDgwLCBhbmQgOTAgcGl4ZWxzLlxuICAgICAgICBmb3IgKGxlbiA9IDUwOyBsZW4gPD0gOTA7IGxlbiArPSAxMCkge1xuICAgICAgICAgIGRyYXdTcXVhcmUobGVuKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gTWluaS1zcGlyYWwuXG4gICAgICAgIGZvciAobGVuID0gMjU7IGxlbiA8PSA2MDsgbGVuICs9IDUpIHtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQobGVuKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNy41OlxuICAgICAgICBkcmF3U25vd21hbigyNTApO1xuICAgICAgICBkcmF3U25vd21hbigxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU2FtZS1oZWlnaHQgc25vd21lbi5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oMTUwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoMTAwKTtcbiAgICAgICAgICBhcGkudHVybkxlZnQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBEaWZmZXJlbnQgaGVpZ2h0IHNub3dtZW4uXG4gICAgICAgIGZvciAodmFyIGhlaWdodCA9IDExMDsgaGVpZ2h0ID49IDcwOyBoZWlnaHQgLT0gMTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oaGVpZ2h0KTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoNjApO1xuICAgICAgICAgIGFwaS50dXJuTGVmdCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gMykge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gRHJhdyBhIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyBEcmF3IGEgaG91c2UgdXNpbmcgXCJkcmF3IGEgc3F1YXJlXCIgYW5kIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gRHJhdyBhIGhvdXNlIHVzaW5nIGEgZnVuY3Rpb24uXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDIwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBBZGQgYSBwYXJhbWV0ZXIgdG8gdGhlIFwiZHJhdyBhIGhvdXNlXCIgcHJvY2VkdXJlLlxuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKGNvdW50ID0gNTA7IGNvdW50IDw9IDE1MDsgY291bnQgKz0gNTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd0hvdXNlKGNvdW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBEcmF3IGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIERyYXcgdHdvIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gRHJhdyBmb3VyIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgzNik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg4MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMDpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDk7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoODApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFwaS5sb2c7XG59O1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEFydGlzdCBBUEkgbG9naWMuIFRoZSBtZXRob2RzIG9uIHRoaXMgb2JqZWN0IGFyZSBjYWxsZWQgYnlcbiAqIGdlbmVyYXRlZCB1c2VyIGNvZGUuIEFzIHRoZXkgYXJlIGNhbGxlZCwgdGhleSBpbnNlcnQgY29tbWFuZHMgaW50byB0aGlzLmxvZy5cbiAqIE5PVEU6IHRoaXMubG9nIGlzIGFsc28gbW9kaWZpZWQgaW4gc29tZSBjYXNlcyBleHRlcm5hbGx5IChib3RoIGFjY2Vzc2VkIGFuZFxuICogSSB0aGluayBjbGVhcmVkKS5cbiAqL1xudmFyIEFydGlzdEFQSSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sb2cgPSBbXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJ0aXN0QVBJO1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoc2l6ZSwgaWQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XG4gICAgdGhpcy5tb3ZlRm9yd2FyZChzaXplLCBpZCk7XG4gICAgdGhpcy50dXJuUmlnaHQoMTAsIGlkKTtcbiAgfVxufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3U25vd2ZsYWtlID0gZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gIHZhciBpLCBqLCBrO1xuXG4gIC8vIG1pcm9ycyBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5cbiAgdmFyIHJhbmRvbV9jb2xvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbG9ycyA9IEJsb2NrbHkuRmllbGRDb2xvdXIuQ09MT1VSUztcbiAgICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpjb2xvcnMubGVuZ3RoKV07XG4gIH07XG5cbiAgaWYgKHR5cGUgPT09ICdyYW5kb20nKSB7XG4gICAgdHlwZSA9IF8uc2FtcGxlKFsnZnJhY3RhbCcsICdmbG93ZXInLCAnc3BpcmFsJywgJ2xpbmUnLCAncGFyYWxsZWxvZ3JhbScsICdzcXVhcmUnXSk7XG4gIH1cblxuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ2ZyYWN0YWwnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICB0aGlzLmp1bXBGb3J3YXJkKDQ1LCBpZCk7XG4gICAgICAgIHRoaXMudHVybkxlZnQoNDUsIGlkKTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDM7IGorKykge1xuICAgICAgICAgIGZvciAoayA9IDA7IGsgPCAzOyBrKyspIHtcbiAgICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoMTUsIGlkKTtcbiAgICAgICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgICB0aGlzLnR1cm5SaWdodCg0NSwgaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDkwLCBpZCk7XG4gICAgICAgICAgdGhpcy5tb3ZlQmFja3dhcmQoMTUsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDQ1LCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoOTAsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZmxvd2VyJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDIsIGlkKTtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDQsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoNzIsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3BpcmFsJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSgzLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUZvcndhcmQoMjAsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMTgsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgOTA7IGkrKykge1xuICAgICAgICB0aGlzLnBlbkNvbG91cihyYW5kb21fY29sb3VyKCkpO1xuICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDQsIGlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVuQ29sb3VyKFwiI0ZGRkZGRlwiLCBpZCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BhcmFsbGVsb2dyYW0nOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDI7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg2MCwgaWQpO1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCgxMjAsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCgzNiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg5MCwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDM2LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydGRCcsIGRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0ZEJywgLWRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlVXAgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAxODAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAyNzAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgOTAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBVcCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcERvd24gPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDE4MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcExlZnQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDI3MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcFJpZ2h0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCA5MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcEZvcndhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pGJywgZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBCYWNrd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkYnLCAtZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnR1cm5SaWdodCA9IGZ1bmN0aW9uKGFuZ2xlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUlQnLCBhbmdsZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUudHVybkxlZnQgPSBmdW5jdGlvbihhbmdsZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1JUJywgLWFuZ2xlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5nbG9iYWxBbHBoYSA9IGZ1bmN0aW9uIChhbHBoYSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0dBJywgYWxwaGEsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblVwID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BVJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuRG93biA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQRCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbldpZHRoID0gZnVuY3Rpb24od2lkdGgsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQVycsIE1hdGgubWF4KHdpZHRoLCAwKSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuQ29sb3VyID0gZnVuY3Rpb24oY29sb3VyLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUEMnLCBjb2xvdXIsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFMnLCBwYXR0ZXJuLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5oaWRlVHVydGxlID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0hUJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuc2hvd1R1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydTVCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdTdGFtcCA9IGZ1bmN0aW9uKHN0YW1wLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnc3RhbXAnLCBzdGFtcCwgaWRdKTtcbn07XG4iXX0=
