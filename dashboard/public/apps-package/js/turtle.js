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

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html.ejs')({ assetUrl: this.studioApp_.assetUrl }),
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
 buf.push('<div id="slider-cell">\n  <svg id="slider"\n       xmlns="http://www.w3.org/2000/svg"\n       xmlns:svg="http://www.w3.org/2000/svg"\n       xmlns:xlink="http://www.w3.org/1999/xlink"\n       version="1.1"\n       width="150"\n       height="50">\n      <!-- Slow icon. -->\n      <clipPath id="slowClipPath">\n        <rect width=26 height=12 x=5 y=14 />\n      </clipPath>\n      <image xlink:href="', escape((13,  assetUrl('media/turtle/icons.png') )), '" height=42 width=84 x=-21 y=-10\n          clip-path="url(#slowClipPath)" />\n      <!-- Fast icon. -->\n      <clipPath id="fastClipPath">\n        <rect width=26 height=16 x=120 y=10 />\n      </clipPath>\n      <image xlink:href="', escape((19,  assetUrl('media/turtle/icons.png') )), '" height=42 width=84 x=120 y=-11\n          clip-path="url(#fastClipPath)" />\n  </svg>\n  <img id="spinner" style="visibility: hidden;" src="', escape((22,  assetUrl('media/turtle/loading.gif') )), '" height=15 width=15>\n</div>\n'); })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2Fuc3dlcnMuanMiLCJidWlsZC9qcy90dXJ0bGUvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxVQUFVLEdBQUcs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RyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDdkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDeEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN0QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVB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b24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBBcnRpc3QgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LnR1cnRsZU1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBhcnRpc3QgPSBuZXcgQXJ0aXN0KCk7XG5cbiAgd2luZG93Ll9fVGVzdEludGVyZmFjZS5zZXRTcGVlZFNsaWRlclZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgYXJ0aXN0LnNwZWVkU2xpZGVyLnNldFZhbHVlKHZhbHVlKTtcbiAgfTtcbiAgYXJ0aXN0LmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGFydGlzdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHZhciBDT05GSUdTID0ge1xuICAgIGFubmE6IHtcbiAgICAgIC8vIHNsaWRlciBzcGVlZCBnZXRzIGRpdmlkZWQgYnkgdGhpcyB2YWx1ZVxuICAgICAgc3BlZWRNb2RpZmllcjogMTAsXG4gICAgICB0dXJ0bGVOdW1GcmFtZXM6IDEwLFxuICAgICAgc21vb3RoQW5pbWF0ZTogdHJ1ZSxcbiAgICAgIGNvbnNvbGlkYXRlVHVybkFuZE1vdmU6IHRydWUsXG4gICAgICBhbm5hTGluZTogc2tpbi5hc3NldFVybCgnYW5uYWxpbmUucG5nJyksXG4gICAgICBhbm5hTGluZV8yeDogc2tpbi5hc3NldFVybCgnYW5uYWxpbmVfMngucG5nJylcbiAgICB9LFxuXG4gICAgZWxzYToge1xuICAgICAgc3BlZWRNb2RpZmllcjogMTAsXG4gICAgICB0dXJ0bGVOdW1GcmFtZXM6IDIwLFxuICAgICAgZGVjb3JhdGlvbkFuaW1hdGlvbk51bUZyYW1lczogMTksXG4gICAgICBzbW9vdGhBbmltYXRlOiB0cnVlLFxuICAgICAgY29uc29saWRhdGVUdXJuQW5kTW92ZTogdHJ1ZSxcbiAgICAgIGVsc2FMaW5lOiBza2luLmFzc2V0VXJsKCdlbHNhbGluZS5wbmcnKSxcbiAgICAgIGVsc2FMaW5lXzJ4OiBza2luLmFzc2V0VXJsKCdlbHNhbGluZV8yeC5wbmcnKVxuICAgIH1cbiAgfTtcblxuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICAvLyBiYXNlIHNraW4gcHJvcGVydGllcyBoZXJlIChjYW4gYmUgb3ZlcnJpZGVuIGJ5IENPTkZJRylcbiAgc2tpbi5zcGVlZE1vZGlmaWVyID0gMTtcblxuICAvLyBzdGFtcHMgYXJlbid0IGFjdHVhbGx5IHVzZWQgb24gcHJvZHVjdGlvbiBhbnl3aGVyZSByaWdodCBub3cuIGlmIHdlIHdlcmVcbiAgLy8gdG8gd2FudCB0byB1c2UgdGhlbSwgZGVmaW5lIHRoZSBtYXBwaW5nIGZyb20gaW1hZ2UgdG8gbmFtZSBoZXJlLlxuICBza2luLnN0YW1wVmFsdWVzID0gW1xuICAgIFtza2luLmF2YXRhciwgJ0RFRkFVTFQnXVxuICBdO1xuXG4gIC8vIEdldCBwcm9wZXJ0aWVzIGZyb20gY29uZmlnXG4gIHZhciBpc0Fzc2V0ID0gL1xcLlxcU3szfSQvOyAvLyBlbmRzIGluIGRvdCBmb2xsb3dlZCBieSB0aHJlZSBub24td2hpdGVzcGFjZSBjaGFyc1xuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuICAgIHNraW5bcHJvcF0gPSBjb25maWdbcHJvcF07XG4gIH1cblxuICAvLyBUT0RPIChici1wYWlyKSA6IFNvbWUgb2YgdGhlc2Uga2V5cyBhcmUgYWN0dWFsbHkgdW5kZWZpbmVkLiBDbGVhbiB0aGlzIHVwXG4gIHNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBbXG4gICAgW3NraW4ucGF0dGVybkRlZmF1bHQsICdERUZBVUxUJ10sIC8vICBzaWduYWxzIHJldHVybiB0byBkZWZhdWx0IHBhdGggZHJhd2luZ1xuICAgIFtza2luLnJhaW5ib3dNZW51LCAncmFpbmJvd0xpbmUnXSwgIC8vIHNldCB0byBwcm9wZXJ0eSBuYW1lIGZvciBpbWFnZSB3aXRoaW4gc2tpblxuICAgIFtza2luLnJvcGVNZW51LCAncm9wZUxpbmUnXSwgIC8vIHJlZmVyZW5jZWQgYXMgc2tpbltwYXR0ZXJuXTtcbiAgICBbc2tpbi5zcXVpZ2dseU1lbnUsICdzcXVpZ2dseUxpbmUnXSxcbiAgICBbc2tpbi5zd2lybHlNZW51LCAnc3dpcmx5TGluZSddLFxuICAgIFtza2luLmFubmFMaW5lLCAnYW5uYUxpbmUnXSxcbiAgICBbc2tpbi5lbHNhTGluZSwgJ2Vsc2FMaW5lJ10sXG4gICAgW3NraW4uYW5uYUxpbmVfMngsICdhbm5hTGluZV8yeCddLFxuICAgIFtza2luLmVsc2FMaW5lXzJ4LCAnZWxzYUxpbmVfMngnXSxcbiAgXTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogVHVydGxlIEdyYXBoaWNzLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgY3VzdG9tTGV2ZWxCbG9ja3MgPSByZXF1aXJlKCcuL2N1c3RvbUxldmVsQmxvY2tzJyk7XG52YXIgVHVydGxlID0gcmVxdWlyZSgnLi90dXJ0bGUnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIGlmIChza2luLmlkID09IFwiYW5uYVwiIHx8IHNraW4uaWQgPT0gXCJlbHNhXCIpXG4gIHtcbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgQ29sb3Vycy5GUk9aRU4xLCBDb2xvdXJzLkZST1pFTjIsIENvbG91cnMuRlJPWkVOMyxcbiAgICAgIENvbG91cnMuRlJPWkVONCwgQ29sb3Vycy5GUk9aRU41LCBDb2xvdXJzLkZST1pFTjYsXG4gICAgICBDb2xvdXJzLkZST1pFTjcsIENvbG91cnMuRlJPWkVOOCwgQ29sb3Vycy5GUk9aRU45XTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSAzO1xuXG4gIH0gZWxzZSB7XG5cbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgLy8gUm93IDEuXG4gICAgICBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLkdSRVksXG4gICAgICBDb2xvdXJzLktIQUtJLCBDb2xvdXJzLldISVRFLFxuICAgICAgLy8gUm93IDIuXG4gICAgICBDb2xvdXJzLlJFRCwgQ29sb3Vycy5QSU5LLFxuICAgICAgQ29sb3Vycy5PUkFOR0UsIENvbG91cnMuWUVMTE9XLFxuICAgICAgLy8gUm93IDMuXG4gICAgICBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsXG4gICAgICBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xVTU5TID0gNDtcbiAgfVxuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEwMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudDtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQuVkFMVUUgPVxuICAgICAgWzMwLCA0NSwgNjAsIDkwLCAxMjAsIDEzNSwgMTUwLCAxODBdLlxuICAgICAgbWFwKGZ1bmN0aW9uKHQpIHtyZXR1cm4gW1N0cmluZyh0KSwgU3RyaW5nKHQpXTt9KTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKCksICdWQUxVRScpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZlxuICAgIC8vIHBpeGVscy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkIHNldCBvZiBhbmdsZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUUpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfY291bnRlciA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2NvdW50ZXIgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICBibG9ja2x5LkJsb2Nrcy52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfc2lkZXMgPSB7XG4gICAgLy8gVmFyaWFibGUgZ2V0dGVyLlxuICAgIGNhdGVnb3J5OiBudWxsLCAgLy8gVmFyaWFibGVzIGFyZSBoYW5kbGVkIHNwZWNpYWxseS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX0hFTFBVUkwsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9USVRMRSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbCgnc2lkZXMnKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfc2lkZXMgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNxdWFyZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3NxdWFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQykgfHwgMDtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgICAnLy8gZHJhd19hX3NxdWFyZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNub3dtYW5cIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG9cbiAgLy8gdXNlcnMgd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc25vd21hbiA9IHtcbiAgICAvLyBEcmF3IGEgY2lyY2xlIGluIGZyb250IG9mIHRoZSB0dXJ0bGUsIGVuZGluZyB1cCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNub3dtYW4oKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zbm93bWFuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNub3dtYW4gaW4gZnJvbnQgb2YgdGhlIHR1cnRsZS5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBkaXN0YW5jZXNWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlcycpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudGVyJyk7XG4gICAgdmFyIGRlZ3JlZVZhciA9IGdlbnN5bSgnZGVncmVlJyk7XG4gICAgdmFyIGRpc3RhbmNlVmFyID0gZ2Vuc3ltKCdkaXN0YW5jZScpO1xuICAgIHJldHVybiBbXG4gICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgIC8vIERvbid0IGNoYW5nZSBpdCB3aXRob3V0IGNoYW5naW5nIHJlcXVpcmVkQmxvY2tzXy5cbiAgICAgICcvLyBkcmF3X2Ffc25vd21hbicsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ3ZhciAnICsgZGlzdGFuY2VzVmFyICsgJyA9IFsnICsgdmFsdWUgKyAnICogMC41LCAnICsgdmFsdWUgKyAnICogMC4zLCcgK1xuICAgICAgICAgIHZhbHVlICsgJyAqIDAuMl07JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICBsb29wVmFyICsgJysrKSB7XFxuJyxcbiAgICAgICcgIHZhciAnICsgZGlzdGFuY2VWYXIgKyAnID0gJyArIGRpc3RhbmNlc1ZhciArICdbJyArIGxvb3BWYXIgK1xuICAgICAgICAgICcgPCAzID8gJyArIGxvb3BWYXIgKyAnOiA1IC0gJyArIGxvb3BWYXIgKyAnXSAvIDU3LjU7JyxcbiAgICAgICcgIGZvciAodmFyICcgKyBkZWdyZWVWYXIgKyAnID0gMDsgJyArIGRlZ3JlZVZhciArICcgPCA5MDsgJyArXG4gICAgICAgICAgZGVncmVlVmFyICsgJysrKSB7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyBkaXN0YW5jZVZhciArICcpOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoMik7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgaWYgKCcgKyBsb29wVmFyICsgJyAhPSAyKSB7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5MZWZ0KDE4MCk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG5cbiAgLy8gVGhpcyBpcyBhIG1vZGlmaWVkIGNvcHkgb2YgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yIHdpdGggdGhlXG4gIC8vIHZhcmlhYmxlIG5hbWVkIFwiY291bnRlclwiIGhhcmRjb2RlZC5cbiAgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yX2NvdW50ZXIgPSB7XG4gICAgLy8gRm9yIGxvb3Agd2l0aCBoYXJkY29kZWQgbG9vcCB2YXJpYWJsZS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfV0lUSClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChtc2cubG9vcFZhcmlhYmxlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAnVkFSJyk7XG4gICAgICB0aGlzLmludGVycG9sYXRlTXNnKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9GUk9NX1RPX0JZLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydGUk9NJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydUTycsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnQlknLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja2x5LkFMSUdOX1JJR0hUKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoQmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0RPKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfVE9PTFRJUC5yZXBsYWNlKFxuICAgICAgICAgICclMScsIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJykpKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9LFxuICAgIGN1c3RvbUNvbnRleHRNZW51OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgb3B0aW9uID0ge2VuYWJsZWQ6IHRydWV9O1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgb3B0aW9uLnRleHQgPSBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfU0VUX0NSRUFURV9HRVQucmVwbGFjZSgnJTEnLCBuYW1lKTtcbiAgICAgIHZhciB4bWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RpdGxlJyk7XG4gICAgICB4bWxUaXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuYW1lKSk7XG4gICAgICB4bWxUaXRsZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnVkFSJyk7XG4gICAgICB2YXIgeG1sQmxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdibG9jaycpO1xuICAgICAgeG1sQmxvY2suYXBwZW5kQ2hpbGQoeG1sVGl0bGUpO1xuICAgICAgeG1sQmxvY2suc2V0QXR0cmlidXRlKCd0eXBlJywgJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpO1xuICAgICAgb3B0aW9uLmNhbGxiYWNrID0gYmxvY2tseS5Db250ZXh0TWVudS5jYWxsYmFja0ZhY3RvcnkodGhpcywgeG1sQmxvY2spO1xuICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgfSxcbiAgICAvLyBzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZSB0byB4bWwgc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBhY3Jvc3NcbiAgICAvLyBkaWZmZXJlbnQgbG9jYWxlc1xuICAgIG11dGF0aW9uVG9Eb206IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtdXRhdGlvbicpO1xuICAgICAgdmFyIGNvdW50ZXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnY291bnRlcicsIGNvdW50ZXIpO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuICAgIC8vIGRlc2VyaWFsaXplIHRoZSBjb3VudGVyIHZhcmlhYmxlIG5hbWVcbiAgICBkb21Ub011dGF0aW9uOiBmdW5jdGlvbih4bWxFbGVtZW50KSB7XG4gICAgICB2YXIgY291bnRlciA9IHhtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb3VudGVyJyk7XG4gICAgICB0aGlzLnNldFRpdGxlVmFsdWUoY291bnRlciwgJ1ZBUicpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY29udHJvbHNfZm9yX2NvdW50ZXIgPSBnZW5lcmF0b3IuY29udHJvbHNfZm9yO1xuXG4gIC8vIERlbGV0ZSB0aGVzZSBzdGFuZGFyZCBibG9ja3MuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG5cbiAgLy8gR2VuZXJhbCBibG9ja3MuXG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cubW92ZUZvcndhcmQoKSwgJ21vdmVGb3J3YXJkJ10sXG4gICAgICAgW21zZy5tb3ZlQmFja3dhcmQoKSwgJ21vdmVCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuZHJhd19tb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJMT05HX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJTSE9SVF9NT1ZFX0xFTkdUSFwiO1xuICB2YXIgc2ltcGxlTGVuZ3RoQ2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXcsIGxvbmdNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV0sXG4gICAgW3NraW4uc2hvcnRMaW5lRHJhdywgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcbiAgdmFyIHNpbXBsZUxlbmd0aFJpZ2h0Q2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXdSaWdodCwgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3UmlnaHQsIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdXG4gIF07XG5cbiAgdmFyIFNpbXBsZU1vdmUgPSB7XG4gICAgREVGQVVMVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgU0hPUlRfTU9WRV9MRU5HVEg6IDUwLFxuICAgIExPTkdfTU9WRV9MRU5HVEg6IDEwMCxcbiAgICBESVJFQ1RJT05fQ09ORklHUzoge1xuICAgICAgbGVmdDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbldlc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZUxlZnQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVdlc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLndlc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIHJpZ2h0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlUmlnaHQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZUVhc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLmVhc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzXG4gICAgICB9LFxuICAgICAgdXA6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Ob3J0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlVXAnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZU5vcnRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5ub3J0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgZG93bjoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVEb3duJyxcbiAgICAgICAgdG9vbHRpcDogbXNnLm1vdmVTb3V0aFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uc291dGhMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIGp1bXBfbGVmdDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wTGVmdCcsXG4gICAgICAgIGltYWdlOiBza2luLmxlZnRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wV2VzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfcmlnaHQ6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbkVhc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFJpZ2h0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ucmlnaHRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wRWFzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfdXA6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBVcCcsXG4gICAgICAgIGltYWdlOiBza2luLnVwSnVtcEFycm93LFxuICAgICAgICB0b29sdGlwOiBtc2cuanVtcE5vcnRoVG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9kb3duOiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Tb3V0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wRG93bicsXG4gICAgICAgIGltYWdlOiBza2luLmRvd25KdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wU291dGhUb29sdGlwKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwidXBcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiZG93blwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJsZWZ0XCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcInJpZ2h0XCIpO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb246IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoZGlyZWN0aW9uKTtcbiAgICAgIGdlbmVyYXRvcltcInNpbXBsZV9qdW1wX1wiICsgZGlyZWN0aW9uXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb24gKyBcIl9sZW5ndGhcIl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb24gKyAnX2xlbmd0aCddID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24pO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9qdW1wXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jaygnanVtcF8nICsgZGlyZWN0aW9uKTtcbiAgICB9LFxuICAgIGdlbmVyYXRlTW92ZUJsb2NrOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0KSB7XG4gICAgICB2YXIgZGlyZWN0aW9uQ29uZmlnID0gU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dO1xuICAgICAgdmFyIGRpcmVjdGlvbkxldHRlcldpZHRoID0gMTI7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoZWxwVXJsOiAnJyxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5hcHBlbmREdW1teUlucHV0KCk7XG4gICAgICAgICAgaWYgKGRpcmVjdGlvbkNvbmZpZy5pc0p1bXApIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5qdW1wKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKGRpcmVjdGlvbkNvbmZpZy50aXRsZSwge2ZpeGVkU2l6ZToge3dpZHRoOiBkaXJlY3Rpb25MZXR0ZXJXaWR0aCwgaGVpZ2h0OiAxOH19KSk7XG5cbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucykge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMuaGVpZ2h0KSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2UoZGlyZWN0aW9uQ29uZmlnLmltYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgICAgIHRoaXMuc2V0VG9vbHRpcChkaXJlY3Rpb25Db25maWcudG9vbHRpcCk7XG4gICAgICAgICAgaWYgKGhhc0xlbmd0aElucHV0KSB7XG4gICAgICAgICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24oZGlyZWN0aW9uQ29uZmlnLmxlbmd0aHMpO1xuICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUobG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnbGVuZ3RoJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgZ2VuZXJhdGVDb2RlR2VuZXJhdG9yOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0LCBsZW5ndGgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IFNpbXBsZU1vdmUuREVGQVVMVF9NT1ZFX0xFTkdUSDtcblxuICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICBsZW5ndGggPSBTaW1wbGVNb3ZlW3RoaXMuZ2V0VGl0bGVWYWx1ZShcImxlbmd0aFwiKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdUdXJ0bGUuJyArIFNpbXBsZU1vdmUuRElSRUNUSU9OX0NPTkZJR1NbZGlyZWN0aW9uXS5tb3ZlRnVuY3Rpb24gKyAnKCcgKyBsZW5ndGggKyAnLCcgKyAnXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckFsbERpcmVjdGlvbnMoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cuanVtcEZvcndhcmQoKSwgJ2p1bXBGb3J3YXJkJ10sXG4gICAgICAgW21zZy5qdW1wQmFja3dhcmQoKSwgJ2p1bXBCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuanVtcCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGp1bXBpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVsc1xuICAgIC8vIHdpdGhvdXQgZHJhd2luZy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXJcbiAgICAvLyBvZiBwaXhlbHMgd2l0aG91dCBkcmF3aW5nLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybiA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLnR1cm5SaWdodCgpLCAndHVyblJpZ2h0J10sXG4gICAgICAgW21zZy50dXJuTGVmdCgpLCAndHVybkxlZnQnXV07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIHRoaXMgaXMgdGhlIG9sZCB2ZXJzaW9uIG9mIHRoaXMgYmxvY2ssIHRoYXQgc2hvdWxkIG9ubHkgc3RpbGwgYmUgdXNlZCBpblxuICAvLyBvbGQgc2hhcmVkIGxldmVsc1xuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdXSURUSCcpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aWR0aFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnV0lEVEgnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzEnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICAvLyBpbmxpbmVkIHZlcnNpb24gb2YgZHJhd193aWR0aFxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldFdpZHRoKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEnLFxuICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnV0lEVEgnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGhfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnV0lEVEgnKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5XaWR0aCgnICsgd2lkdGggKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHBlbiB1cC9kb3duLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdQRU4nKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnBlblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfcGVuLlNUQVRFID1cbiAgICAgIFtbbXNnLnBlblVwKCksICdwZW5VcCddLFxuICAgICAgIFttc2cucGVuRG93bigpLCAncGVuRG93biddXTtcblxuICBnZW5lcmF0b3IuZHJhd19wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBwZW4gdXAvZG93bi5cbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdQRU4nKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfY29sb3VyID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ0NPTE9VUicpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuQ09MT1VSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5hbHBoYSA9IHtcbiAgICAvLyBUT0RPOlxuICAgIC8vIC0gQWRkIGFscGhhIHRvIGEgZ3JvdXBcbiAgICAvLyAtIE1ha2Ugc3VyZSBpdCBkb2Vzbid0IGNvdW50IGFnYWluc3QgY29ycmVjdCBzb2x1dGlvbnNcbiAgICAvL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldEFscGhhKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KFwiVkFMVUVcIilcbiAgICAgICAgICAuc2V0Q2hlY2soXCJOdW1iZXJcIik7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYWxwaGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFscGhhID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9OT05FKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5nbG9iYWxBbHBoYSgnICsgYWxwaGEgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfY29sb3VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnXFwnIzAwMDAwMFxcJyc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvdXIgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXJfc2ltcGxlID0ge1xuICAgIC8vIFNpbXBsaWZpZWQgZHJvcGRvd24gYmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb2xvdXJzID0gW0NvbG91cnMuUkVELCBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLlBJTkssIENvbG91cnMuT1JBTkdFLFxuICAgICAgICBDb2xvdXJzLllFTExPVywgQ29sb3Vycy5HUkVFTiwgQ29sb3Vycy5CTFVFLCBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB2YXIgY29sb3VyRmllbGQgPSBuZXcgQmxvY2tseS5GaWVsZENvbG91ckRyb3Bkb3duKGNvbG91cnMsIDQ1LCAzNSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbG91ckZpZWxkLCAnQ09MT1VSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXJfc2ltcGxlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0NPTE9VUicpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoXCInICsgY29sb3VyICsgJ1wiLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19saW5lX3N0eWxlX3BhdHRlcm4gPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gYW4gYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0UGF0dGVybigpKVxuICAgICAgICAgICAuYXBwZW5kVGl0bGUoIG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihcbiAgICAgICAgICAgICAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucywgMTUwLCAyMCApLCAnVkFMVUUnICk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFBhdHRlcm4oKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGltYWdlIGZvciBhIHBhdHRlcm5lZCBsaW5lLlxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpIHx8ICdcXCdERUZBVUxUXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5QYXR0ZXJuKFwiJyArIHBhdHRlcm4gKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy51cF9iaWcgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuU1RBVEUpLCAnVklTSUJJTElUWScpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJ0bGVWaXNpYmlsaXR5VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnVwX2JpZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICB2YXIgY29sb3VyID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdDT0xPVVInLFxuICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3Zpc2liaWxpdHkgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmxpdHkuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eS5TVEFURSA9XG4gICAgICBbW21zZy5oaWRlVHVydGxlKCksICdoaWRlVHVydGxlJ10sXG4gICAgICAgW21zZy5zaG93VHVydGxlKCksICdzaG93VHVydGxlJ11dO1xuXG4gIGdlbmVyYXRvci50dXJ0bGVfdmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmlsaXR5LlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZJU0lCSUxJVFknKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV9zdGFtcCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5kcmF3U3RhbXAoKSk7XG4gICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLlZBTFVFUywgNTAsIDMwKTtcblxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuXG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmRyYXdTdGFtcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYmxvY2sgaXMgY3VycmVudGx5IHVudXNlZC4gaWYgd2Ugd2FudCB0byBhZGQgaXQgYmFjayBpbiB0aGUgZnV0dXJlLCBhZGRcbiAgLy8gc3RhbXAgaW1hZ2VzIGhlcmVcbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wLlZBTFVFUyA9IHNraW4uc3RhbXBWYWx1ZXM7XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV9zdGFtcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1R1cnRsZS5kcmF3U3RhbXAoXCInICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpICtcbiAgICAgICAgJ1wiLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgY3VzdG9tTGV2ZWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IFR1cnRsZSBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIEdsb2JhbHMgdXNlZCBpbiB0aGlzIGZpbGU6XG4vLyAgQmxvY2tseVxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgdHVydGxlTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIEFydGlzdEFQSSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIFNsaWRlciA9IHJlcXVpcmUoJy4uL3NsaWRlcicpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG5cbnZhciBDQU5WQVNfSEVJR0hUID0gNDAwO1xudmFyIENBTlZBU19XSURUSCA9IDQwMDtcblxudmFyIEpPSU5UX1JBRElVUyA9IDQ7XG5cbnZhciBTTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSA1O1xudmFyIEZBU1RfU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFID0gMTU7XG5cbi8qKlxuKiBNaW5pbXVtIGpvaW50IHNlZ21lbnQgbGVuZ3RoXG4qL1xudmFyIEpPSU5UX1NFR01FTlRfTEVOR1RIID0gNTA7XG5cbi8qKlxuICogQW4geCBvZmZzZXQgYWdhaW5zdCB0aGUgc3ByaXRlIGVkZ2Ugd2hlcmUgdGhlIGRlY29yYXRpb24gc2hvdWxkIGJlIGRyYXduLFxuICogYWxvbmcgd2l0aCB3aGV0aGVyIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUgb3IgYWZ0ZXIgdGhlIHR1cnRsZSBzcHJpdGUgaXRzZWxmLlxuICovXG52YXIgRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFMgPSBbXG4gIHsgeDogMTUsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDI2LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiAzNywgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNDYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYwLCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2NSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY0LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Miwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDU1LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNDgsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAzMywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMxLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMjIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAxNywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDEyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogIDgsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDEwLCB3aGVuOiBcImFmdGVyXCIgfVxuXTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgQXJ0aXN0IGNsYXNzXG4gKiBAcGFyYW0ge1N0dWRpb0FwcH0gc3R1ZGlvQXBwIFRoZSBzdHVkaW9BcHAgaW5zdGFuY2UgdG8gYnVpbGQgdXBvbi5cbiAqL1xudmFyIEFydGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG5cbiAgLy8gaW1hZ2UgaWNvbnMgYW5kIGltYWdlIHBhdGhzIGZvciB0aGUgJ3NldCBwYXR0ZXJuIGJsb2NrJ1xuICB0aGlzLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zID0gW107XG4gIHRoaXMuc3RhbXBzID0gW107XG5cbiAgLy8gUElEIG9mIGFuaW1hdGlvbiB0YXNrIGN1cnJlbnRseSBleGVjdXRpbmcuXG4gIHRoaXMucGlkID0gMDtcblxuICAvLyBTaG91bGQgdGhlIHR1cnRsZSBiZSBkcmF3bj9cbiAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBTZXQgYSB0dXJ0bGUgaGVhZGluZy5cbiAgdGhpcy5oZWFkaW5nID0gMDtcblxuICAvLyBUaGUgYXZhdGFyIGltYWdlXG4gIHRoaXMuYXZhdGFySW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgYXZhdGFyIGFuaW1hdGlvbiBkZWNvcmF0aW9uIGltYWdlXG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgLy8gRHJhd2luZyB3aXRoIGEgcGF0dGVyblxuICB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybiA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJucyA9IFtdO1xuICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG5cbiAgLy8gdGhlc2UgZ2V0IHNldCBieSBpbml0IGJhc2VkIG9uIHNraW4uXG4gIHRoaXMuYXZhdGFyV2lkdGggPSAwO1xuICB0aGlzLmF2YXRhckhlaWdodCA9IDA7XG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoID0gODU7XG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodCA9IDg1O1xuICB0aGlzLnNwZWVkU2xpZGVyID0gbnVsbDtcblxuICB0aGlzLmN0eEFuc3dlciA9IG51bGw7XG4gIHRoaXMuY3R4SW1hZ2VzID0gbnVsbDtcbiAgdGhpcy5jdHhQcmVkcmF3ID0gbnVsbDtcbiAgdGhpcy5jdHhTY3JhdGNoID0gbnVsbDtcbiAgdGhpcy5jdHhQYXR0ZXJuID0gbnVsbDtcbiAgdGhpcy5jdHhGZWVkYmFjayA9IG51bGw7XG4gIHRoaXMuY3R4RGlzcGxheSA9IG51bGw7XG5cbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gZmFsc2U7XG4gIHRoaXMuaXNQcmVkcmF3aW5nXyA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnRpc3Q7XG5cblxuLyoqXG4gKiB0b2RvXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaW5qZWN0U3R1ZGlvQXBwID0gZnVuY3Rpb24gKHN0dWRpb0FwcCkge1xuICB0aGlzLnN0dWRpb0FwcF8gPSBzdHVkaW9BcHA7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCA9IF8uYmluZCh0aGlzLnJlc2V0LCB0aGlzKTtcbiAgdGhpcy5zdHVkaW9BcHBfLnJ1bkJ1dHRvbkNsaWNrID0gXy5iaW5kKHRoaXMucnVuQnV0dG9uQ2xpY2ssIHRoaXMpO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSB0dXJ0bGUuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgaWYgKCF0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcnRpc3QgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICAvLyBQcmVsb2FkIHN0YW1wIGltYWdlc1xuICB0aGlzLnN0YW1wcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2tpbi5zdGFtcFZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB1cmwgPSB0aGlzLnNraW4uc3RhbXBWYWx1ZXNbaV1bMF07XG4gICAgdmFyIGtleSA9IHRoaXMuc2tpbi5zdGFtcFZhbHVlc1tpXVsxXTtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLnNyYyA9IHVybDtcbiAgICB0aGlzLnN0YW1wc1trZXldID0gaW1nO1xuICB9XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICAvLyBsZXQncyB0cnkgYWRkaW5nIGEgYmFja2dyb3VuZCBpbWFnZVxuICAgIHRoaXMubGV2ZWwuaW1hZ2VzID0gW3t9XTtcbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5maWxlbmFtZSA9ICdiYWNrZ3JvdW5kLmpwZyc7XG5cbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5wb3NpdGlvbiA9IFsgMCwgMCBdO1xuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLnNjYWxlID0gMTtcbiAgfVxuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSB0cnVlO1xuICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayA9ICd3aGVuX3J1bic7XG4gIGNvbmZpZy5kcm9wbGV0Q29uZmlnID0gZHJvcGxldENvbmZpZztcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDczO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gMTAwO1xuICB9XG4gIGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MztcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDEwMDtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25XaWR0aCA9IDg1O1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodCA9IDg1O1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MDtcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDUxO1xuICB9XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIHZpc3VhbGl6YXRpb246ICcnLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHthc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsfSksXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IF8uYmluZCh0aGlzLmxvYWRBdWRpb18sIHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBfLmJpbmQodGhpcy5hZnRlckluamVjdF8sIHRoaXMsIGNvbmZpZyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmluaXQoY29uZmlnKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUubG9hZEF1ZGlvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4ud2luU291bmQsICd3aW4nKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbn07XG5cbi8qKlxuICogQ29kZSBjYWxsZWQgYWZ0ZXIgdGhlIGJsb2NrbHkgZGl2ICsgYmxvY2tseSBjb3JlIGlzIGluamVjdGVkIGludG8gdGhlIGRvY3VtZW50XG4gKi9cbkFydGlzdC5wcm90b3R5cGUuYWZ0ZXJJbmplY3RfID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAvLyBJbml0aWFsaXplIHRoZSBzbGlkZXIuXG4gIHZhciBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2xpZGVyJyk7XG4gIHRoaXMuc3BlZWRTbGlkZXIgPSBuZXcgU2xpZGVyKDEwLCAzNSwgMTMwLCBzbGlkZXIpO1xuXG4gIC8vIENoYW5nZSBkZWZhdWx0IHNwZWVkIChlZyBTcGVlZCB1cCBsZXZlbHMgdGhhdCBoYXZlIGxvdHMgb2Ygc3RlcHMpLlxuICBpZiAoY29uZmlnLmxldmVsLnNsaWRlclNwZWVkKSB7XG4gICAgdGhpcy5zcGVlZFNsaWRlci5zZXRWYWx1ZShjb25maWcubGV2ZWwuc2xpZGVyU3BlZWQpO1xuICB9XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnVHVydGxlLGNvZGUnKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBoaWRkZW4gY2FudmFzZXMuXG4gIHRoaXMuY3R4QW5zd2VyID0gdGhpcy5jcmVhdGVDYW52YXNfKCdhbnN3ZXInLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhJbWFnZXMgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2ltYWdlcycsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFByZWRyYXcgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3ByZWRyYXcnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhTY3JhdGNoID0gdGhpcy5jcmVhdGVDYW52YXNfKCdzY3JhdGNoJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4UGF0dGVybiA9IHRoaXMuY3JlYXRlQ2FudmFzXygncGF0dGVybicsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eEZlZWRiYWNrID0gdGhpcy5jcmVhdGVDYW52YXNfKCdmZWVkYmFjaycsIDE1NCwgMTU0KS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIENyZWF0ZSBkaXNwbGF5IGNhbnZhcy5cbiAgdmFyIGRpc3BsYXlDYW52YXMgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2Rpc3BsYXknLCA0MDAsIDQwMCk7XG5cbiAgdmFyIHZpc3VhbGl6YXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbicpO1xuICB2aXN1YWxpemF0aW9uLmFwcGVuZENoaWxkKGRpc3BsYXlDYW52YXMpO1xuICB0aGlzLmN0eERpc3BsYXkgPSBkaXNwbGF5Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gVE9ETyAoYnItcGFpcik6IC0gcHVsbCB0aGlzIG91dD9cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpICYmICh0aGlzLnNraW4uaWQgPT09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PT0gXCJlbHNhXCIpKSB7XG4gICAgLy8gT3ZlcnJpZGUgY29sb3VyX3JhbmRvbSB0byBvbmx5IGdlbmVyYXRlIHJhbmRvbSBjb2xvcnMgZnJvbSB3aXRoaW4gb3VyIGZyb3plblxuICAgIC8vIHBhbGV0dGVcbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2VuZXJhdGUgYSByYW5kb20gY29sb3VyLlxuICAgICAgaWYgKCFCbG9ja2x5LkphdmFTY3JpcHQuZGVmaW5pdGlvbnNfLmNvbG91cl9yYW5kb20pIHtcbiAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IEJsb2NrbHkuSmF2YVNjcmlwdC52YXJpYWJsZURCXy5nZXREaXN0aW5jdE5hbWUoXG4gICAgICAgICAgJ2NvbG91cl9yYW5kb20nLCBCbG9ja2x5LkdlbmVyYXRvci5OQU1FX1RZUEUpO1xuICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWU7XG4gICAgICAgIHZhciBmdW5jID0gW107XG4gICAgICAgIGZ1bmMucHVzaCgnZnVuY3Rpb24gJyArIGZ1bmN0aW9uTmFtZSArICcoKSB7Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnICAgdmFyIGNvbG9ycyA9ICcgKyBKU09OLnN0cmluZ2lmeShCbG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMpICsgJzsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCcgIHJldHVybiBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNvbG9ycy5sZW5ndGgpXTsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCd9Jyk7XG4gICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5kZWZpbml0aW9uc18uY29sb3VyX3JhbmRvbSA9IGZ1bmMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICB2YXIgY29kZSA9IEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tLmZ1bmN0aW9uTmFtZSArICcoKSc7XG4gICAgICByZXR1cm4gW2NvZGUsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9GVU5DVElPTl9DQUxMXTtcbiAgICB9O1xuICB9XG5cbiAgdGhpcy5sb2FkRGVjb3JhdGlvbkFuaW1hdGlvbigpO1xuXG4gIC8vIFNldCB0aGVpciBpbml0aWFsIGNvbnRlbnRzLlxuICB0aGlzLmxvYWRUdXJ0bGUoKTtcbiAgdGhpcy5kcmF3SW1hZ2VzKCk7XG5cbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gdHJ1ZTtcbiAgdGhpcy5kcmF3QW5zd2VyKCk7XG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IGZhbHNlO1xuXG4gIGlmICh0aGlzLmxldmVsLnByZWRyYXdCbG9ja3MpIHtcbiAgICB0aGlzLmlzUHJlZHJhd2luZ18gPSB0cnVlO1xuICAgIHRoaXMuZHJhd0Jsb2Nrc09uQ2FudmFzKHRoaXMubGV2ZWwucHJlZHJhd0Jsb2NrcywgdGhpcy5jdHhQcmVkcmF3KTtcbiAgICB0aGlzLmlzUHJlZHJhd2luZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8vIHByZS1sb2FkIGltYWdlIGZvciBsaW5lIHBhdHRlcm4gYmxvY2suIENyZWF0aW5nIHRoZSBpbWFnZSBvYmplY3QgYW5kIHNldHRpbmcgc291cmNlIGRvZXNuJ3Qgc2VlbSB0byBiZVxuICAvLyBlbm91Z2ggaW4gdGhpcyBjYXNlLCBzbyB3ZSdyZSBhY3R1YWxseSBjcmVhdGluZyBhbmQgcmV1c2luZyB0aGUgb2JqZWN0IHdpdGhpbiB0aGUgZG9jdW1lbnQgYm9keS5cblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHZhciBpbWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGltYWdlQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2VDb250YWluZXIpO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwYXR0ZXJuID0gdGhpcy5za2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zW2ldWzFdO1xuICAgICAgaWYgKHRoaXMuc2tpbltwYXR0ZXJuXSkge1xuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5zcmMgPSB0aGlzLnNraW5bcGF0dGVybl07XG4gICAgICAgIHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dID0gaW1nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xufTtcblxuLyoqXG4gKiBPbiBzdGFydHVwIGRyYXcgdGhlIGV4cGVjdGVkIGFuc3dlciBhbmQgc2F2ZSBpdCB0byB0aGUgYW5zd2VyIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3QW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmxldmVsLnNvbHV0aW9uQmxvY2tzKSB7XG4gICAgdGhpcy5kcmF3QmxvY2tzT25DYW52YXModGhpcy5sZXZlbC5zb2x1dGlvbkJsb2NrcywgdGhpcy5jdHhBbnN3ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZHJhd0xvZ09uQ2FudmFzKHRoaXMubGV2ZWwuYW5zd2VyLCB0aGlzLmN0eEFuc3dlcik7XG4gIH1cbn07XG5cbi8qKlxuICogR2l2ZW4gYSBzZXQgb2YgY29tbWFuZHMgYW5kIGEgY2FudmFzLCBkcmF3cyB0aGUgY29tbWFuZHMgb250byB0aGUgY2FudmFzXG4gKiBjb21wb3NpdGVkIG92ZXIgdGhlIHNjcmF0Y2ggY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdMb2dPbkNhbnZhcyA9IGZ1bmN0aW9uKGxvZywgY2FudmFzKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuICB3aGlsZSAobG9nLmxlbmd0aCkge1xuICAgIHZhciB0dXBsZSA9IGxvZy5zaGlmdCgpO1xuICAgIHRoaXMuc3RlcCh0dXBsZVswXSwgdHVwbGUuc3BsaWNlKDEpLCB7c21vb3RoQW5pbWF0ZTogZmFsc2V9KTtcbiAgICB0aGlzLnJlc2V0U3RlcEluZm9fKCk7XG4gIH1cbiAgY2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgY2FudmFzLmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcbiAgY2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlcyBibG9ja3Mgb3IgY29kZSwgYW5kIGRyYXdzIG9udG8gZ2l2ZW4gY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdCbG9ja3NPbkNhbnZhcyA9IGZ1bmN0aW9uKGJsb2Nrc09yQ29kZSwgY2FudmFzKSB7XG4gIHZhciBjb2RlO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgZG9tQmxvY2tzID0gQmxvY2tseS5YbWwudGV4dFRvRG9tKGJsb2Nrc09yQ29kZSk7XG4gICAgQmxvY2tseS5YbWwuZG9tVG9CbG9ja1NwYWNlKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UsIGRvbUJsb2Nrcyk7XG4gICAgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIHtcbiAgICBjb2RlID0gYmxvY2tzT3JDb2RlO1xuICB9XG4gIHRoaXMuZXZhbENvZGUoY29kZSk7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuY2xlYXIoKTtcbiAgfVxuICB0aGlzLmRyYXdDdXJyZW50QmxvY2tzT25DYW52YXMoY2FudmFzKTtcbn07XG5cbi8qKlxuICogRHJhd3MgdGhlIHJlc3VsdHMgb2YgYmxvY2sgZXZhbHVhdGlvbiAoc3RvcmVkIG9uIGFwaS5sb2cpIG9udG8gdGhlIGdpdmVuXG4gKiBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0N1cnJlbnRCbG9ja3NPbkNhbnZhcyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuICB0aGlzLmRyYXdMb2dPbkNhbnZhcyh0aGlzLmFwaS5sb2csIGNhbnZhcyk7XG59O1xuXG4vKipcbiAqIFBsYWNlIGFuIGltYWdlIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXG4gKiBDb2RlIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NDk1OTUyLiBUaGFua3MsIFBocm9nei5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSBSZWxhdGl2ZSBwYXRoIHRvIGltYWdlLlxuICogQHBhcmFtIHshQXJyYXl9IHBvc2l0aW9uIEFuIHgteSBwYWlyLlxuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbmFsIHNjYWxlIGF0IHdoaWNoIGltYWdlIGlzIGRyYXduXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucGxhY2VJbWFnZSA9IGZ1bmN0aW9uKGZpbGVuYW1lLCBwb3NpdGlvbiwgc2NhbGUpIHtcbiAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcub25sb2FkID0gXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIGlmIChzY2FsZSkge1xuICAgICAgICB0aGlzLmN0eEltYWdlcy5kcmF3SW1hZ2UoaW1nLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGltZy53aWR0aCxcbiAgICAgICAgICBpbWcuaGVpZ2h0LCAwLCAwLCBpbWcud2lkdGggKiBzY2FsZSwgaW1nLmhlaWdodCAqIHNjYWxlKTtcbiAgICAgIH0gZWxzZSAge1xuICAgICAgICB0aGlzLmN0eEltYWdlcy5kcmF3SW1hZ2UoaW1nLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRpc3BsYXkoKTtcbiAgfSwgdGhpcyk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBpbWcuc3JjID0gdGhpcy5za2luLmFzc2V0VXJsKGZpbGVuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpbWcuc3JjID0gdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsKCdtZWRpYS90dXJ0bGUvJyArIGZpbGVuYW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IHRoZSBpbWFnZXMgZm9yIHRoaXMgcGFnZSBhbmQgbGV2ZWwgb250byB0aGlzLmN0eEltYWdlcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3SW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5sZXZlbC5pbWFnZXMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxldmVsLmltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbWFnZSA9IHRoaXMubGV2ZWwuaW1hZ2VzW2ldO1xuICAgIHRoaXMucGxhY2VJbWFnZShpbWFnZS5maWxlbmFtZSwgaW1hZ2UucG9zaXRpb24sIGltYWdlLnNjYWxlKTtcbiAgfVxuICB0aGlzLmN0eEltYWdlcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcbiAgdGhpcy5jdHhJbWFnZXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbn07XG5cbi8qKlxuICogSW5pdGlhbCB0aGUgdHVydGxlIGltYWdlIG9uIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUubG9hZFR1cnRsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmF2YXRhckltYWdlLm9ubG9hZCA9IF8uYmluZCh0aGlzLmRpc3BsYXksIHRoaXMpO1xuXG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3JjID0gdGhpcy5za2luLmF2YXRhcjtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAzNjtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMTg7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDE4MDtcbiAgfVxuICB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodCA9IHRoaXMuYXZhdGFySGVpZ2h0O1xuICB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoID0gdGhpcy5hdmF0YXJXaWR0aDtcbn07XG5cbi8qKlxuICogSW5pdGlhbCB0aGUgdHVydGxlIGFuaW1hdGlvbiBkZW9jcmF0aW9uIG9uIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUubG9hZERlY29yYXRpb25BbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLnNyYyA9IHRoaXMuc2tpbi5kZWNvcmF0aW9uQW5pbWF0aW9uO1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLmhlaWdodCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodDtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoO1xuICB9XG59O1xuXG52YXIgdHVydGxlRnJhbWUgPSAwO1xuXG5cbi8qKlxuICogRHJhdyB0aGUgdHVydGxlIGltYWdlIGJhc2VkIG9uIHRoaXMueCwgdGhpcy55LCBhbmQgdGhpcy5oZWFkaW5nLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdUdXJ0bGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNvdXJjZVk7XG4gIC8vIENvbXB1dGVzIHRoZSBpbmRleCBvZiB0aGUgaW1hZ2UgaW4gdGhlIHNwcml0ZS5cbiAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmhlYWRpbmcgKiB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC8gMzYwKTtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICAvLyB0aGUgcm90YXRpb25zIGluIHRoZSBzcHJpdGUgc2hlZXQgZ28gaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbi5cbiAgICBpbmRleCA9IHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLSBpbmRleDtcblxuICAgIC8vIGFuZCB0aGV5IGFyZSAxODAgZGVncmVlcyBvdXQgb2YgcGhhc2UuXG4gICAgaW5kZXggPSAoaW5kZXggKyB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzLzIpICUgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncztcbiAgfVxuICB2YXIgc291cmNlWCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGggKiBpbmRleDtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBzb3VyY2VZID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQgKiB0dXJ0bGVGcmFtZTtcbiAgICB0dXJ0bGVGcmFtZSA9ICh0dXJ0bGVGcmFtZSArIDEpICUgdGhpcy5za2luLnR1cnRsZU51bUZyYW1lcztcbiAgfSBlbHNlIHtcbiAgICBzb3VyY2VZID0gMDtcbiAgfVxuICB2YXIgc291cmNlV2lkdGggPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoO1xuICB2YXIgc291cmNlSGVpZ2h0ID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQ7XG4gIHZhciBkZXN0V2lkdGggPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoO1xuICB2YXIgZGVzdEhlaWdodCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0O1xuICB2YXIgZGVzdFggPSB0aGlzLnggLSBkZXN0V2lkdGggLyAyO1xuICB2YXIgZGVzdFkgPSB0aGlzLnkgLSBkZXN0SGVpZ2h0ICsgNztcblxuICBpZiAodGhpcy5hdmF0YXJJbWFnZS53aWR0aCA9PT0gMCB8fCB0aGlzLmF2YXRhckltYWdlLmhlaWdodCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzb3VyY2VYIDwgMCB8fFxuICAgICAgc291cmNlWSA8IDAgfHxcbiAgICAgIHNvdXJjZVggKyBzb3VyY2VXaWR0aCAgLTAgPiB0aGlzLmF2YXRhckltYWdlLndpZHRoIHx8XG4gICAgICBzb3VyY2VZICsgc291cmNlSGVpZ2h0ID4gdGhpcy5hdmF0YXJJbWFnZS5oZWlnaHQpXG4gIHtcbiAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuICAgICAgLy8gVE9ETyhiam9yZGFuKTogYXNrIEJyZW50LCBzdGFydGluZyB0byBmbG9vZCBncnVudCBtb2NoYVRlc3QgbWVzc2FnZXMsXG4gICAgICAvLyBiZXR0ZXIgZml4IGhlcmU/XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImRyYXdJbWFnZSBpcyBvdXQgb2Ygc291cmNlIGJvdW5kcyFcIik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmF2YXRhckltYWdlLndpZHRoICE9PSAwKSB7XG4gICAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZShcbiAgICAgIHRoaXMuYXZhdGFySW1hZ2UsXG4gICAgICBNYXRoLnJvdW5kKHNvdXJjZVgpLCBNYXRoLnJvdW5kKHNvdXJjZVkpLFxuICAgICAgc291cmNlV2lkdGggLSAwLCBzb3VyY2VIZWlnaHQsXG4gICAgICBNYXRoLnJvdW5kKGRlc3RYKSwgTWF0aC5yb3VuZChkZXN0WSksXG4gICAgICBkZXN0V2lkdGggLSAwLCBkZXN0SGVpZ2h0KTtcbiAgfVxufTtcblxuLyoqXG4gICogVGhpcyBpcyBjYWxsZWQgdHdpY2UsIG9uY2Ugd2l0aCBcImJlZm9yZVwiIGFuZCBvbmNlIHdpdGggXCJhZnRlclwiLCByZWZlcnJpbmcgdG8gYmVmb3JlIG9yIGFmdGVyXG4gICogdGhlIHNwcml0ZSBpcyBkcmF3bi4gIEZvciBzb21lIGFuZ2xlcyBpdCBzaG91bGQgYmUgZHJhd24gYmVmb3JlLCBhbmQgZm9yIHNvbWUgYWZ0ZXIuXG4gICovXG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0RlY29yYXRpb25BbmltYXRpb24gPSBmdW5jdGlvbih3aGVuKSB7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB2YXIgZnJhbWVJbmRleCA9ICh0dXJ0bGVGcmFtZSArIDEwKSAlIHRoaXMuc2tpbi5kZWNvcmF0aW9uQW5pbWF0aW9uTnVtRnJhbWVzO1xuXG4gICAgdmFyIGFuZ2xlSW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaGVhZGluZyAqIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLyAzNjApO1xuXG4gICAgLy8gdGhlIHJvdGF0aW9ucyBpbiB0aGUgQW5uYSAmIEVsc2Egc3ByaXRlIHNoZWV0cyBnbyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgIGFuZ2xlSW5kZXggPSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC0gYW5nbGVJbmRleDtcblxuICAgIC8vIGFuZCB0aGV5IGFyZSAxODAgZGVncmVlcyBvdXQgb2YgcGhhc2UuXG4gICAgYW5nbGVJbmRleCA9IChhbmdsZUluZGV4ICsgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncy8yKSAlIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3M7XG5cbiAgICBpZiAoRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFNbYW5nbGVJbmRleF0ud2hlbiA9PSB3aGVuKSB7XG4gICAgICB2YXIgc291cmNlWCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoICogZnJhbWVJbmRleDtcbiAgICAgIHZhciBzb3VyY2VZID0gMDtcbiAgICAgIHZhciBzb3VyY2VXaWR0aCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoO1xuICAgICAgdmFyIHNvdXJjZUhlaWdodCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLmhlaWdodDtcbiAgICAgIHZhciBkZXN0V2lkdGggPSBzb3VyY2VXaWR0aDtcbiAgICAgIHZhciBkZXN0SGVpZ2h0ID0gc291cmNlSGVpZ2h0O1xuICAgICAgdmFyIGRlc3RYID0gdGhpcy54IC0gZGVzdFdpZHRoIC8gMiAtIDE1IC0gMTUgKyBFTFNBX0RFQ09SQVRJT05fREVUQUlMU1thbmdsZUluZGV4XS54O1xuICAgICAgdmFyIGRlc3RZID0gdGhpcy55IC0gZGVzdEhlaWdodCAvIDIgLSAxMDA7XG5cbiAgICAgIGlmICh0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aCAhPT0gMCkge1xuICAgICAgICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKFxuICAgICAgICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLFxuICAgICAgICAgIE1hdGgucm91bmQoc291cmNlWCksIE1hdGgucm91bmQoc291cmNlWSksXG4gICAgICAgICAgc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCxcbiAgICAgICAgICBNYXRoLnJvdW5kKGRlc3RYKSwgTWF0aC5yb3VuZChkZXN0WSksXG4gICAgICAgICAgZGVzdFdpZHRoLCBkZXN0SGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZXNldCB0aGUgdHVydGxlIHRvIHRoZSBzdGFydCBwb3NpdGlvbiwgY2xlYXIgdGhlIGRpc3BsYXksIGFuZCBraWxsIGFueVxuICogcGVuZGluZyB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlIFJlcXVpcmVkIGJ5IHRoZSBBUEkgYnV0IGlnbm9yZWQgYnkgdGhpc1xuICogICAgIGltcGxlbWVudGF0aW9uLlxuICovXG5BcnRpc3QucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGlnbm9yZSkge1xuICAvLyBTdGFuZGFyZCBzdGFydGluZyBsb2NhdGlvbiBhbmQgaGVhZGluZyBvZiB0aGUgdHVydGxlLlxuICB0aGlzLnggPSBDQU5WQVNfSEVJR0hUIC8gMjtcbiAgdGhpcy55ID0gQ0FOVkFTX1dJRFRIIC8gMjtcbiAgdGhpcy5oZWFkaW5nID0gdGhpcy5sZXZlbC5zdGFydERpcmVjdGlvbiAhPT0gdW5kZWZpbmVkID9cbiAgICAgIHRoaXMubGV2ZWwuc3RhcnREaXJlY3Rpb24gOiA5MDtcbiAgdGhpcy5wZW5Eb3duVmFsdWUgPSB0cnVlO1xuICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG4gIC8vIEZvciBzcGVjaWFsIGNhc2VzLCB1c2UgYSBkaWZmZXJlbnQgaW5pdGlhbCBsb2NhdGlvbi5cbiAgaWYgKHRoaXMubGV2ZWwuaW5pdGlhbFggIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMueCA9IHRoaXMubGV2ZWwuaW5pdGlhbFg7XG4gIH1cbiAgaWYgKHRoaXMubGV2ZWwuaW5pdGlhbFkgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMueSA9IHRoaXMubGV2ZWwuaW5pdGlhbFk7XG4gIH1cbiAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkuXG4gIHRoaXMuY3R4U2NyYXRjaC5jYW52YXMud2lkdGggPSB0aGlzLmN0eFNjcmF0Y2guY2FudmFzLndpZHRoO1xuICB0aGlzLmN0eFBhdHRlcm4uY2FudmFzLndpZHRoID0gdGhpcy5jdHhQYXR0ZXJuLmNhbnZhcy53aWR0aDtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSAyO1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSAyO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSA1O1xuICB9XG5cbiAgdGhpcy5jdHhTY3JhdGNoLmxpbmVDYXAgPSAncm91bmQnO1xuICB0aGlzLmN0eFNjcmF0Y2guZm9udCA9ICdub3JtYWwgMThwdCBBcmlhbCc7XG4gIHRoaXMuZGlzcGxheSgpO1xuXG4gIC8vIENsZWFyIHRoZSBmZWVkYmFjay5cbiAgdGhpcy5jdHhGZWVkYmFjay5jbGVhclJlY3QoXG4gICAgICAwLCAwLCB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcy53aWR0aCwgdGhpcy5jdHhGZWVkYmFjay5jYW52YXMuaGVpZ2h0KTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5zZXRQYXR0ZXJuKFwiYW5uYUxpbmVcIik7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5zZXRQYXR0ZXJuKFwiZWxzYUxpbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gUmVzZXQgdG8gZW1wdHkgcGF0dGVyblxuICAgIHRoaXMuc2V0UGF0dGVybihudWxsKTtcbiAgfVxuXG4gIC8vIEtpbGwgYW55IHRhc2suXG4gIGlmICh0aGlzLnBpZCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5waWQpO1xuICB9XG4gIHRoaXMucGlkID0gMDtcblxuICAvLyBEaXNjYXJkIHRoZSBpbnRlcnByZXRlci5cbiAgdGhpcy5pbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuZXhlY3V0aW9uRXJyb3IgPSBudWxsO1xuXG4gIC8vIFN0b3AgdGhlIGxvb3Bpbmcgc291bmQuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuXG4gIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbn07XG5cblxuLyoqXG4gKiBDb3B5IHRoZSBzY3JhdGNoIGNhbnZhcyB0byB0aGUgZGlzcGxheSBjYW52YXMuIEFkZCBhIHR1cnRsZSBtYXJrZXIuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAvLyBGRiBvbiBsaW51eCByZXRhaW5zIGRyYXdpbmcgb2YgcHJldmlvdXMgbG9jYXRpb24gb2YgYXJ0aXN0IHVubGVzcyB3ZSBjbGVhclxuICAvLyB0aGUgY2FudmFzIGZpcnN0LlxuICB2YXIgc3R5bGUgPSB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlO1xuICB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgdGhpcy5jdHhEaXNwbGF5LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmN0eERpc3BsYXkuY2FudmFzLndpZHRoLFxuICAgIHRoaXMuY3R4RGlzcGxheS5jYW52YXMud2lkdGgpO1xuICB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlID0gc3R5bGU7XG5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgLy8gRHJhdyB0aGUgaW1hZ2VzIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eEltYWdlcy5jYW52YXMsIDAsIDApO1xuXG4gIC8vIERyYXcgdGhlIGFuc3dlciBsYXllci5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAwLjQ7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMC4xNTtcbiAgfVxuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4QW5zd2VyLmNhbnZhcywgMCwgMCk7XG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDE7XG5cbiAgLy8gRHJhdyB0aGUgcHJlZHJhdyBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhQcmVkcmF3LmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgcGF0dGVybiBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhQYXR0ZXJuLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgdXNlciBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhTY3JhdGNoLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgdHVydGxlLlxuICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgdGhpcy5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbihcImJlZm9yZVwiKTtcbiAgICB0aGlzLmRyYXdUdXJ0bGUoKTtcbiAgICB0aGlzLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uKFwiYWZ0ZXJcIik7XG4gIH1cbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgfVxuICB0aGlzLnN0dWRpb0FwcF8uYXR0ZW1wdHMrKztcbiAgdGhpcy5leGVjdXRlKCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmV2YWxDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgVHVydGxlOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNldCB1cCB0aGlzLmNvZGUsIHRoaXMuaW50ZXJwcmV0ZXIsIGV0Yy4gdG8gcnVuIGNvZGUgZm9yIGVkaXRDb2RlIGxldmVsc1xuICovXG5BcnRpc3QucHJvdG90eXBlLmdlbmVyYXRlVHVydGxlQ29kZUZyb21KU18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY29kZSA9IGRyb3BsZXRVdGlscy5nZW5lcmF0ZUNvZGVBbGlhc2VzKGRyb3BsZXRDb25maWcsICdUdXJ0bGUnKTtcbiAgdGhpcy51c2VyQ29kZVN0YXJ0T2Zmc2V0ID0gdGhpcy5jb2RlLmxlbmd0aDtcbiAgdGhpcy5jb2RlICs9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgdGhpcy51c2VyQ29kZUxlbmd0aCA9IHRoaXMuY29kZS5sZW5ndGggLSB0aGlzLnVzZXJDb2RlU3RhcnRPZmZzZXQ7XG5cbiAgdmFyIHNlc3Npb24gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmFjZUVkaXRvci5nZXRTZXNzaW9uKCk7XG4gIHRoaXMuY3VtdWxhdGl2ZUxlbmd0aCA9IGNvZGVnZW4uYWNlQ2FsY3VsYXRlQ3VtdWxhdGl2ZUxlbmd0aChzZXNzaW9uKTtcblxuICB2YXIgaW5pdEZ1bmMgPSBfLmJpbmQoZnVuY3Rpb24oaW50ZXJwcmV0ZXIsIHNjb3BlKSB7XG4gICAgY29kZWdlbi5pbml0SlNJbnRlcnByZXRlcihpbnRlcnByZXRlciwgbnVsbCwgbnVsbCwgc2NvcGUsIHtcbiAgICAgIFR1cnRsZTogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSwgdGhpcyk7XG4gIHRoaXMuaW50ZXJwcmV0ZXIgPSBuZXcgd2luZG93LkludGVycHJldGVyKHRoaXMuY29kZSwgaW5pdEZ1bmMpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmFwaS5sb2cgPSBbXTtcblxuICAvLyBSZXNldCB0aGUgZ3JhcGhpYy5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICB0aGlzLnN0dWRpb0FwcF8uaGFzRHVwbGljYXRlVmFyaWFibGVzSW5Gb3JMb29wcygpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdGhpcy5nZW5lcmF0ZVR1cnRsZUNvZGVGcm9tSlNfKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIC8vIGFwaS5sb2cgbm93IGNvbnRhaW5zIGEgdHJhbnNjcmlwdCBvZiBhbGwgdGhlIHVzZXIncyBhY3Rpb25zLlxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuICAvLyBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuXG4gIHRoaXMucGlkID0gd2luZG93LnNldFRpbWVvdXQoXy5iaW5kKHRoaXMuYW5pbWF0ZSwgdGhpcyksIDEwMCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgY2FzZTogaWYgd2UgaGF2ZSBhIHR1cm4sIGZvbGxvd2VkIGJ5IGEgbW92ZSBmb3J3YXJkLCB0aGVuIHdlIGNhbiBqdXN0XG4gKiBkbyB0aGUgdHVybiBpbnN0YW50bHkgYW5kIHRoZW4gYmVnaW4gdGhlIG1vdmUgZm9yd2FyZCBpbiB0aGUgc2FtZSBmcmFtZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja2ZvclR1cm5BbmRNb3ZlXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5leHRJc0ZvcndhcmQgPSBmYWxzZTtcblxuICB2YXIgY3VycmVudFR1cGxlID0gdGhpcy5hcGkubG9nWzBdO1xuICB2YXIgY3VycmVudENvbW1hbmQgPSBjdXJyZW50VHVwbGVbMF07XG4gIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFR1cGxlLnNsaWNlKDEpO1xuXG4gIC8vIENoZWNrIGZpcnN0IGZvciBhIHNtYWxsIHR1cm4gbW92ZW1lbnQuXG4gIGlmIChjdXJyZW50Q29tbWFuZCA9PT0gJ1JUJykge1xuICAgIHZhciBjdXJyZW50QW5nbGUgPSBjdXJyZW50VmFsdWVzWzBdO1xuICAgIGlmIChNYXRoLmFicyhjdXJyZW50QW5nbGUpIDw9IDEwKSB7XG4gICAgICAvLyBDaGVjayB0aGF0IG5leHQgY29tbWFuZCBpcyBhIG1vdmUgZm9yd2FyZC5cbiAgICAgIGlmICh0aGlzLmFwaS5sb2cubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgbmV4dFR1cGxlID0gdGhpcy5hcGkubG9nWzFdO1xuICAgICAgICB2YXIgbmV4dENvbW1hbmQgPSBuZXh0VHVwbGVbMF07XG4gICAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gJ0ZEJykge1xuICAgICAgICAgIG5leHRJc0ZvcndhcmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHRJc0ZvcndhcmQ7XG59O1xuXG5cbi8qKlxuICogQXR0ZW1wdCB0byBleGVjdXRlIG9uZSBjb21tYW5kIGZyb20gdGhlIGxvZyBvZiBBUEkgY29tbWFuZHMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZVR1cGxlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXBpLmxvZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZXhlY3V0ZVNlY29uZFR1cGxlO1xuXG4gIGRvIHtcbiAgICAvLyBVbmxlc3Mgc29tZXRoaW5nIHNwZWNpYWwgaGFwcGVucywgd2Ugd2lsbCBqdXN0IGV4ZWN1dGUgYSBzaW5nbGUgdHVwbGUuXG4gICAgZXhlY3V0ZVNlY29uZFR1cGxlID0gZmFsc2U7XG5cbiAgICB2YXIgdHVwbGUgPSB0aGlzLmFwaS5sb2dbMF07XG4gICAgdmFyIGNvbW1hbmQgPSB0dXBsZVswXTtcbiAgICB2YXIgaWQgPSB0dXBsZVt0dXBsZS5sZW5ndGgtMV07XG5cbiAgICB0aGlzLnN0dWRpb0FwcF8uaGlnaGxpZ2h0KFN0cmluZyhpZCkpO1xuXG4gICAgLy8gU2hvdWxkIHdlIGV4ZWN1dGUgYW5vdGhlciB0dXBsZSBpbiB0aGlzIGZyYW1lIG9mIGFuaW1hdGlvbj9cbiAgICBpZiAodGhpcy5za2luLmNvbnNvbGlkYXRlVHVybkFuZE1vdmUgJiYgdGhpcy5jaGVja2ZvclR1cm5BbmRNb3ZlXygpKSB7XG4gICAgICBleGVjdXRlU2Vjb25kVHVwbGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgc21vb3RoIGFuaW1hdGUgZm9yIEFubmEgJiBFbHNhLCBhbmQgb25seSBpZiB0aGVyZSBpcyBub3QgYW5vdGhlciB0dXBsZSB0byBiZSBkb25lLlxuICAgIHZhciB0dXBsZURvbmUgPSB0aGlzLnN0ZXAoY29tbWFuZCwgdHVwbGUuc2xpY2UoMSksIHtzbW9vdGhBbmltYXRlOiB0aGlzLnNraW4uc21vb3RoQW5pbWF0ZSAmJiAhZXhlY3V0ZVNlY29uZFR1cGxlfSk7XG4gICAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgICBpZiAodHVwbGVEb25lKSB7XG4gICAgICB0aGlzLmFwaS5sb2cuc2hpZnQoKTtcbiAgICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgICB9XG4gIH0gd2hpbGUgKGV4ZWN1dGVTZWNvbmRUdXBsZSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogSXRlcmF0ZSB0aHJvdWdoIHRoZSByZWNvcmRlZCBwYXRoIGFuZCBhbmltYXRlIHRoZSB0dXJ0bGUncyBhY3Rpb25zLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBBbGwgdGFza3Mgc2hvdWxkIGJlIGNvbXBsZXRlIG5vdy4gIENsZWFuIHVwIHRoZSBQSUQgbGlzdC5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNjYWxlIHRoZSBzcGVlZCBub24tbGluZWFybHksIHRvIGdpdmUgYmV0dGVyIHByZWNpc2lvbiBhdCB0aGUgZmFzdCBlbmQuXG4gIHZhciBzdGVwU3BlZWQgPSAxMDAwICogTWF0aC5wb3coMSAtIHRoaXMuc3BlZWRTbGlkZXIuZ2V0VmFsdWUoKSwgMikgLyB0aGlzLnNraW4uc3BlZWRNb2RpZmllcjtcblxuICAvLyB3aGVuIHNtb290aEFuaW1hdGUgaXMgdHJ1ZSwgd2UgZGl2aWRlIGxvbmcgc3RlcHMgaW50byBwYXJ0aXRpb25zIG9mIHRoaXNcbiAgLy8gc2l6ZS5cbiAgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPSAoc3RlcFNwZWVkID09PSAwID9cbiAgICBGQVNUX1NNT09USF9BTklNQVRFX1NURVBfU0laRSA6IFNNT09USF9BTklNQVRFX1NURVBfU0laRSk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB2YXIgc3RlcHBlZCA9IHRydWU7XG4gICAgd2hpbGUgKHN0ZXBwZWQpIHtcbiAgICAgIGNvZGVnZW4uc2VsZWN0Q3VycmVudENvZGUodGhpcy5pbnRlcnByZXRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdW11bGF0aXZlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJDb2RlU3RhcnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlckNvZGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RlcHBlZCA9IHRoaXMuaW50ZXJwcmV0ZXIuc3RlcCgpO1xuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIFRPRE8gKGNwaXJpY2gpOiBwb3B1bGF0ZSBsaW5lTnVtYmVyIGFzIHdlIGRvIGZvciBzdHVkaW8vYXBwbGFiOlxuICAgICAgICB0aGlzLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogMSB9O1xuICAgICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc3RlcHBlZCA9IHRoaXMuaW50ZXJwcmV0ZXIuc3RlcCgpO1xuXG4gICAgICBpZiAodGhpcy5leGVjdXRlVHVwbGVfKCkpIHtcbiAgICAgICAgLy8gV2Ugc3RlcHBlZCBmYXIgZW5vdWdoIHRoYXQgd2UgZXhlY3V0ZWQgYSBjb21tbWFuZCwgYnJlYWsgb3V0OlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzdGVwcGVkICYmICF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgLy8gV2UgZHJvcHBlZCBvdXQgb2YgdGhlIHN0ZXAgbG9vcCBiZWNhdXNlIHdlIHJhbiBvdXQgb2YgY29kZSwgYWxsIGRvbmU6XG4gICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5waWQgPSB3aW5kb3cuc2V0VGltZW91dChfLmJpbmQodGhpcy5hbmltYXRlLCB0aGlzKSwgc3RlcFNwZWVkKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRpc3RhbmNlKSB7XG4gIHZhciB0dXBsZURvbmUgPSB0cnVlO1xuICB2YXIgc3RlcERpc3RhbmNlQ292ZXJlZCA9IHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZDtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNtb290aEFuaW1hdGUpIHtcbiAgICB2YXIgZnVsbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdmFyIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuXG4gICAgaWYgKGZ1bGxEaXN0YW5jZSA8IDApIHtcbiAgICAgIC8vIEdvaW5nIGJhY2t3YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBzbW9vdGhBbmltYXRlU3RlcFNpemUgPD0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSAtc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkIC09IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgdHVwbGVEb25lID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR29pbmcgZm93YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgKyBzbW9vdGhBbmltYXRlU3RlcFNpemUgPj0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgKz0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICB0dXBsZURvbmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuXG4gIHJldHVybiB7IHR1cGxlRG9uZTogdHVwbGVEb25lLCBkaXN0YW5jZTogZGlzdGFuY2UgfTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBvbmUgc3RlcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIExvZ28tc3R5bGUgY29tbWFuZCAoZS5nLiAnRkQnIG9yICdSVCcpLlxuICogQHBhcmFtIHshQXJyYXl9IHZhbHVlcyBMaXN0IG9mIGFyZ3VtZW50cyBmb3IgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhY3Rpb24gSG93IG11Y2ggb2YgdGhpcyBzdGVwJ3MgZGlzdGFuY2UgZG8gd2UgZHJhdz9cbiAqIEBwYXJhbSB7b2JqZWN0fSBzaW5nbGUgb3B0aW9uIGZvciBub3c6IHNtb290aEFuaW1hdGUgKHRydWUvZmFsc2UpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKGNvbW1hbmQsIHZhbHVlcywgb3B0aW9ucykge1xuICB2YXIgdHVwbGVEb25lID0gdHJ1ZTtcbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGRpc3RhbmNlO1xuICB2YXIgaGVhZGluZztcblxuICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICBjYXNlICdGRCc6ICAvLyBGb3J3YXJkXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5tb3ZlRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0pGJzogIC8vIEp1bXAgZm9yd2FyZFxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuanVtcEZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNVic6ICAvLyBNb3ZlIChkaXJlY3Rpb24pXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIGhlYWRpbmcgPSB2YWx1ZXNbMV07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuc2V0SGVhZGluZ18oaGVhZGluZyk7XG4gICAgICB0aGlzLm1vdmVGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSkQnOiAgLy8gSnVtcCAoZGlyZWN0aW9uKVxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICBoZWFkaW5nID0gdmFsdWVzWzFdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnNldEhlYWRpbmdfKGhlYWRpbmcpO1xuICAgICAgdGhpcy5qdW1wRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1JUJzogIC8vIFJpZ2h0IFR1cm5cbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnR1cm5CeURlZ3JlZXNfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdEUCc6ICAvLyBEcmF3IFByaW50XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gucm90YXRlKDIgKiBNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDM2MCk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFRleHQodmFsdWVzWzBdLCAwLCAwKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHQSc6ICAvLyBHbG9iYWwgQWxwaGFcbiAgICAgIHZhciBhbHBoYSA9IHZhbHVlc1swXTtcbiAgICAgIGFscGhhID0gTWF0aC5tYXgoMCwgYWxwaGEpO1xuICAgICAgYWxwaGEgPSBNYXRoLm1pbigxMDAsIGFscGhhKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5nbG9iYWxBbHBoYSA9IGFscGhhIC8gMTAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnREYnOiAgLy8gRHJhdyBGb250XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZm9udCA9IHZhbHVlc1syXSArICcgJyArIHZhbHVlc1sxXSArICdwdCAnICsgdmFsdWVzWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFUnOiAgLy8gUGVuIFVwXG4gICAgICB0aGlzLnBlbkRvd25WYWx1ZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEQnOiAgLy8gUGVuIERvd25cbiAgICAgIHRoaXMucGVuRG93blZhbHVlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BXJzogIC8vIFBlbiBXaWR0aFxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IHZhbHVlc1swXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BDJzogIC8vIFBlbiBDb2xvdXJcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9IHZhbHVlc1swXTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSB2YWx1ZXNbMF07XG4gICAgICBpZiAodGhpcy5za2luLmlkICE9IFwiYW5uYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImVsc2FcIikge1xuICAgICAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQUyc6ICAvLyBQZW4gc3R5bGUgd2l0aCBpbWFnZVxuICAgICAgaWYgKCF2YWx1ZXNbMF0gfHwgdmFsdWVzWzBdID09ICdERUZBVUxUJykge1xuICAgICAgICAgIHRoaXMuc2V0UGF0dGVybihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0UGF0dGVybih2YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSFQnOiAgLy8gSGlkZSBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1QnOiAgLy8gU2hvdyBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFtcCc6XG4gICAgICB2YXIgaW1nID0gdGhpcy5zdGFtcHNbdmFsdWVzWzBdXTtcbiAgICAgIHZhciB3aWR0aCA9IGltZy53aWR0aCAvIDI7XG4gICAgICB2YXIgaGVpZ2h0ID0gaW1nLmhlaWdodCAvIDI7XG4gICAgICB2YXIgeCA9IHRoaXMueCAtIHdpZHRoIC8gMjtcbiAgICAgIHZhciB5ID0gdGhpcy55IC0gaGVpZ2h0IC8gMjtcbiAgICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdHVwbGVEb25lO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zZXRQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgaWYgKHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuanVtcEZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHRoaXMueCArPSBkaXN0YW5jZSAqIE1hdGguc2luKDIgKiBNYXRoLlBJICogdGhpcy5oZWFkaW5nIC8gMzYwKTtcbiAgdGhpcy55IC09IGRpc3RhbmNlICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiB0aGlzLmhlYWRpbmcgLyAzNjApO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlQnlSZWxhdGl2ZVBvc2l0aW9uXyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueCArPSB4O1xuICB0aGlzLnkgKz0geTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZG90QXRfID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgLy8gV2ViS2l0ICh1bmxpa2UgR2Vja28pIGRyYXdzIG5vdGhpbmcgZm9yIGEgemVyby1sZW5ndGggbGluZSwgc28gZHJhdyBhIHZlcnkgc2hvcnQgbGluZS5cbiAgdmFyIGRvdExpbmVMZW5ndGggPSAwLjE7XG4gIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8oeCArIGRvdExpbmVMZW5ndGgsIHkpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5jaXJjbGVBdF8gPSBmdW5jdGlvbiAoeCwgeSwgcmFkaXVzKSB7XG4gIHRoaXMuY3R4U2NyYXRjaC5hcmMoeCwgeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdUb1R1cnRsZV8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIGlzRG90ID0gKGRpc3RhbmNlID09PSAwKTtcbiAgaWYgKGlzRG90KSB7XG4gICAgdGhpcy5kb3RBdF8odGhpcy54LCB0aGlzLnkpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8odGhpcy54LCB0aGlzLnkpO1xuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnR1cm5CeURlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXNSaWdodCkge1xuICB0aGlzLnNldEhlYWRpbmdfKHRoaXMuaGVhZGluZyArIGRlZ3JlZXNSaWdodCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnNldEhlYWRpbmdfID0gZnVuY3Rpb24gKGhlYWRpbmcpIHtcbiAgaGVhZGluZyA9IHRoaXMuY29uc3RyYWluRGVncmVlc18oaGVhZGluZyk7XG4gIHRoaXMuaGVhZGluZyA9IGhlYWRpbmc7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNvbnN0cmFpbkRlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgZGVncmVlcyAlPSAzNjA7XG4gIGlmIChkZWdyZWVzIDwgMCkge1xuICAgIGRlZ3JlZXMgKz0gMzYwO1xuICB9XG4gIHJldHVybiBkZWdyZWVzO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlRm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgaWYgKCF0aGlzLnBlbkRvd25WYWx1ZSkge1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4pIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZVdpdGhQYXR0ZXJuXyhkaXN0YW5jZSk7XG5cbiAgICAvLyBGcm96ZW4gZ2V0cyBib3RoIGEgcGF0dGVybiBhbmQgYSBsaW5lIG92ZXIgdGhlIHRvcCBvZiBpdC5cbiAgICBpZiAodGhpcy5za2luLmlkICE9IFwiZWxzYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImFubmFcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZHJhd0ZvcndhcmRfKGRpc3RhbmNlKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIGlmICh0aGlzLnNob3VsZERyYXdKb2ludHNfKCkpIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkV2l0aEpvaW50c18oZGlzdGFuY2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lXyhkaXN0YW5jZSk7XG4gIH1cbn07XG5cbi8qKlxuICogRHJhd3MgYSBsaW5lIG9mIGxlbmd0aCBgZGlzdGFuY2VgLCBhZGRpbmcgam9pbnQga25vYnMgYWxvbmcgdGhlIHdheVxuICogQHBhcmFtIGRpc3RhbmNlXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRXaXRoSm9pbnRzXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgcmVtYWluaW5nRGlzdGFuY2UgPSBkaXN0YW5jZTtcblxuICB3aGlsZSAocmVtYWluaW5nRGlzdGFuY2UgPiAwKSB7XG4gICAgdmFyIGVub3VnaEZvckZ1bGxTZWdtZW50ID0gcmVtYWluaW5nRGlzdGFuY2UgPj0gSk9JTlRfU0VHTUVOVF9MRU5HVEg7XG4gICAgdmFyIGN1cnJlbnRTZWdtZW50TGVuZ3RoID0gZW5vdWdoRm9yRnVsbFNlZ21lbnQgPyBKT0lOVF9TRUdNRU5UX0xFTkdUSCA6IHJlbWFpbmluZ0Rpc3RhbmNlO1xuXG4gICAgcmVtYWluaW5nRGlzdGFuY2UgLT0gY3VycmVudFNlZ21lbnRMZW5ndGg7XG5cbiAgICBpZiAoZW5vdWdoRm9yRnVsbFNlZ21lbnQpIHtcbiAgICAgIHRoaXMuZHJhd0pvaW50QXRUdXJ0bGVfKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVfKGN1cnJlbnRTZWdtZW50TGVuZ3RoKTtcblxuICAgIGlmIChlbm91Z2hGb3JGdWxsU2VnbWVudCkge1xuICAgICAgdGhpcy5kcmF3Sm9pbnRBdFR1cnRsZV8oKTtcbiAgICB9XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy5zdGVwU3RhcnRYLCB0aGlzLnN0ZXBTdGFydFkpO1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmRyYXdUb1R1cnRsZV8oZGlzdGFuY2UpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2UoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuZHJhd1RvVHVydGxlXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xuICB9XG5cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lV2l0aFBhdHRlcm5fID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciBpbWc7XG4gIHZhciBzdGFydFg7XG4gIHZhciBzdGFydFk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFBhdHRlcm4ubW92ZVRvKHRoaXMuc3RlcFN0YXJ0WCwgdGhpcy5zdGVwU3RhcnRZKTtcbiAgICBpbWcgPSB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybjtcbiAgICBzdGFydFggPSB0aGlzLnN0ZXBTdGFydFg7XG4gICAgc3RhcnRZID0gdGhpcy5zdGVwU3RhcnRZO1xuXG4gICAgdmFyIGxpbmVEaXN0YW5jZSA9IE1hdGguYWJzKHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCk7XG5cbiAgICB0aGlzLmN0eFBhdHRlcm4uc2F2ZSgpO1xuICAgIHRoaXMuY3R4UGF0dGVybi50cmFuc2xhdGUoc3RhcnRYLCBzdGFydFkpO1xuICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGUgYW5kIHJvdGF0ZSB0aGUgaW1hZ2UuXG4gICAgLy8gTmVlZCB0byBzdWJ0cmFjdCA5MCB0byBhY2NvbW9kYXRlIGRpZmZlcmVuY2UgaW4gY2FudmFzIHZzLiBUdXJ0bGUgZGlyZWN0aW9uXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnJvdGF0ZShNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDE4MCk7XG5cbiAgICB2YXIgY2xpcFNpemU7XG4gICAgaWYgKGxpbmVEaXN0YW5jZSAlIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplID09PSAwKSB7XG4gICAgICBjbGlwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgIH0gZWxzZSBpZiAobGluZURpc3RhbmNlID4gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUpIHtcbiAgICAgIC8vIHRoaXMgaGFwcGVucyB3aGVuIG91ciBsaW5lIHdhcyBub3QgZGl2aXNpYmxlIGJ5IHNtb290aEFuaW1hdGVTdGVwU2l6ZVxuICAgICAgLy8gYW5kIHdlJ3ZlIGhpdCBvdXIgbGFzdCBjaHVua1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2UgJSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2U7XG4gICAgfVxuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIHRoaXMuY3R4UGF0dGVybi5kcmF3SW1hZ2UoaW1nLFxuICAgICAgICAvLyBTdGFydCBwb2ludCBmb3IgY2xpcHBpbmcgaW1hZ2VcbiAgICAgICAgTWF0aC5yb3VuZChsaW5lRGlzdGFuY2UpLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGNsaXBTaXplLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBzb21lIG15c3RlcmlvdXMgaGFuZC10d2Vha2luZyBkb25lIGJ5IEJyZW5kYW5cbiAgICAgICAgTWF0aC5yb3VuZCgodGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkIC0gY2xpcFNpemUgLSAyKSksIE1hdGgucm91bmQoKC0gMTgpKSxcbiAgICAgICAgY2xpcFNpemUsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4UGF0dGVybi5yZXN0b3JlKCk7XG5cbiAgfSBlbHNlIHtcblxuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIGltZyA9IHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuO1xuICAgIHN0YXJ0WCA9IHRoaXMueDtcbiAgICBzdGFydFkgPSB0aGlzLnk7XG5cbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnNhdmUoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gudHJhbnNsYXRlKHN0YXJ0WCwgc3RhcnRZKTtcbiAgICAvLyBpbmNyZW1lbnQgdGhlIGFuZ2xlIGFuZCByb3RhdGUgdGhlIGltYWdlLlxuICAgIC8vIE5lZWQgdG8gc3VidHJhY3QgOTAgdG8gYWNjb21vZGF0ZSBkaWZmZXJlbmNlIGluIGNhbnZhcyB2cy4gVHVydGxlIGRpcmVjdGlvblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yb3RhdGUoTWF0aC5QSSAqICh0aGlzLmhlYWRpbmcgLSA5MCkgLyAxODApO1xuXG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsXG4gICAgICAgIC8vIFN0YXJ0IHBvaW50IGZvciBjbGlwcGluZyBpbWFnZVxuICAgICAgICAwLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGRpc3RhbmNlK2ltZy5oZWlnaHQgLyAyLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBkcmF3IGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBjdHgudHJhbnNsYXRlIHBvaW50IHByZS1yb3RhdGlvblxuICAgICAgICAtaW1nLmhlaWdodCAvIDQsIC1pbWcuaGVpZ2h0IC8gMixcbiAgICAgICAgZGlzdGFuY2UraW1nLmhlaWdodCAvIDIsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2hvdWxkRHJhd0pvaW50c18gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmxldmVsLmlzSzEgJiYgIXRoaXMuaXNQcmVkcmF3aW5nXztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0pvaW50QXRUdXJ0bGVfID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICB0aGlzLmNpcmNsZUF0Xyh0aGlzLngsIHRoaXMueSwgSk9JTlRfUkFESVVTKTtcbiAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB3aGV0aGVyIHRoZSB1c2VyJ3MgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyB0aGF0IGFyZSB3cm9uZy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwZXJtaXR0ZWRFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyBhbGxvd2VkIHRvIGJlIHdyb25nLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbGV2ZWwgaXMgc29sdmVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaXNDb3JyZWN0XyA9IGZ1bmN0aW9uIChwaXhlbEVycm9ycywgcGVybWl0dGVkRXJyb3JzKSB7XG4gIHJldHVybiBwaXhlbEVycm9ycyA8PSBwZXJtaXR0ZWRFcnJvcnM7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmZWVkYmFja0ltYWdlQ2FudmFzO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIEZvciBmcm96ZW4gc2tpbnMsIHNob3cgYmFja2dyb3VuZCBhbmQgY2hhcmFjdGVycyBhbG9uZyB3aXRoIGRyYXdpbmdcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhEaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eFNjcmF0Y2g7XG4gIH1cblxuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ3R1cnRsZScsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5pbXByZXNzaXZlKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiB0dXJ0bGVNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IHR1cnRsZU1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5BcnRpc3QucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8vIFRoaXMgcmVtb3ZlcyBsZW5ndGhzIGZyb20gdGhlIHRleHQgdmVyc2lvbiBvZiB0aGUgWE1MIG9mIHByb2dyYW1zLlxuLy8gSXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHVzZXIgcHJvZ3JhbSBhbmQgbW9kZWwgc29sdXRpb24gYXJlXG4vLyBpZGVudGljYWwgZXhjZXB0IGZvciBsZW5ndGhzLlxudmFyIHJlbW92ZUsxTGVuZ3RocyA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZShyZW1vdmVLMUxlbmd0aHMucmVnZXgsICdcIj4nKTtcbn07XG5cbnJlbW92ZUsxTGVuZ3Rocy5yZWdleCA9IC9fbGVuZ3RoXCI+PHRpdGxlIG5hbWU9XCJsZW5ndGhcIj4uKj88XFwvdGl0bGU+LztcblxuLyoqXG4gKiBWZXJpZnkgaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0LlxuICogSWYgc28sIG1vdmUgb24gdG8gbmV4dCBsZXZlbC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAvLyBDb21wYXJlIHRoZSBBbHBoYSAob3BhY2l0eSkgYnl0ZSBvZiBlYWNoIHBpeGVsIGluIHRoZSB1c2VyJ3MgaW1hZ2UgYW5kXG4gIC8vIHRoZSBzYW1wbGUgYW5zd2VyIGltYWdlLlxuICB2YXIgdXNlckltYWdlID1cbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5nZXRJbWFnZURhdGEoMCwgMCwgQ0FOVkFTX1dJRFRILCBDQU5WQVNfSEVJR0hUKTtcbiAgdmFyIGFuc3dlckltYWdlID1cbiAgICAgIHRoaXMuY3R4QW5zd2VyLmdldEltYWdlRGF0YSgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xuICB2YXIgbGVuID0gTWF0aC5taW4odXNlckltYWdlLmRhdGEubGVuZ3RoLCBhbnN3ZXJJbWFnZS5kYXRhLmxlbmd0aCk7XG4gIHZhciBkZWx0YSA9IDA7XG4gIC8vIFBpeGVscyBhcmUgaW4gUkdCQSBmb3JtYXQuICBPbmx5IGNoZWNrIHRoZSBBbHBoYSBieXRlcy5cbiAgZm9yICh2YXIgaSA9IDM7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIC8vIENvcHlpbmcgYW5kIGNvbXBvc2l0aW5nIGltYWdlcyBhY3Jvc3MgY2FudmFzZXMgc2VlbXMgdG8gZGlzdG9ydCB0aGVcbiAgICAvLyBhbHBoYS4gVXNlIGEgbGFyZ2UgZXJyb3IgdmFsdWUgKDI1MCkgdG8gY29tcGVuc2F0ZS5cbiAgICBpZiAoTWF0aC5hYnModXNlckltYWdlLmRhdGFbaV0gLSBhbnN3ZXJJbWFnZS5kYXRhW2ldKSA+IDI1MCkge1xuICAgICAgZGVsdGErKztcbiAgICB9XG4gIH1cblxuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIEFsbG93IHNvbWUgbnVtYmVyIG9mIHBpeGVscyB0byBiZSBvZmYsIGJ1dCBiZSBzdHJpY3RlclxuICAvLyBmb3IgY2VydGFpbiBsZXZlbHMuXG4gIHZhciBwZXJtaXR0ZWRFcnJvcnMgPSBsZXZlbC5wZXJtaXR0ZWRFcnJvcnM7XG4gIGlmIChwZXJtaXR0ZWRFcnJvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHBlcm1pdHRlZEVycm9ycyA9IDE1MDtcbiAgfVxuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChsZXZlbC5mcmVlUGxheSB8fCB0aGlzLmlzQ29ycmVjdF8oZGVsdGEsIHBlcm1pdHRlZEVycm9ycykpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxldmVsLmVkaXRDb2RlIHx8ICF0aGlzLmV4ZWN1dGlvbkVycm9yKTtcbiAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgcmV1c2UgYW4gb2xkIG1lc3NhZ2UsIHNpbmNlIG5vdCBhbGwgcGF0aHMgc2V0IG9uZS5cbiAgdGhpcy5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIC8vIEluIGxldmVsIEsxLCBjaGVjayBpZiBvbmx5IGxlbmd0aHMgZGlmZmVyLlxuICBpZiAobGV2ZWwuaXNLMSAmJiAhbGV2ZWxDb21wbGV0ZSAmJiAhdGhpcy5zdHVkaW9BcHBfLmVkaXRDb2RlICYmXG4gICAgICBsZXZlbC5zb2x1dGlvbkJsb2NrcyAmJlxuICAgICAgcmVtb3ZlSzFMZW5ndGhzKHByb2dyYW0pID09PSByZW1vdmVLMUxlbmd0aHMobGV2ZWwuc29sdXRpb25CbG9ja3MpKSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRVJST1I7XG4gICAgdGhpcy5tZXNzYWdlID0gdHVydGxlTXNnLmxlbmd0aEZlZWRiYWNrKCk7XG4gIH1cblxuICAvLyBGb3IgbGV2ZWxzIHdoZXJlIHVzaW5nIHRvbyBtYW55IGJsb2NrcyB3b3VsZCBhbGxvdyBzdHVkZW50c1xuICAvLyB0byBtaXNzIHRoZSBwb2ludCwgY29udmVydCB0aGF0IGZlZWRiYWNrIHRvIGEgZmFpbHVyZS5cbiAgaWYgKGxldmVsLmZhaWxGb3JUb29NYW55QmxvY2tzICYmXG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUw7XG5cbiAgfSBlbHNlIGlmICgodGhpcy50ZXN0UmVzdWx0cyA9PVxuICAgICAgdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB8fFxuICAgICAgKHRoaXMudGVzdFJlc3VsdHMgPT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFMTF9QQVNTKSkge1xuICAgIC8vIENoZWNrIHRoYXQgdGhleSBkaWRuJ3QgdXNlIGEgY3JhenkgbGFyZ2UgcmVwZWF0IHZhbHVlIHdoZW4gZHJhd2luZyBhXG4gICAgLy8gY2lyY2xlLiAgVGhpcyBjb21wbGFpbnMgaWYgdGhlIGxpbWl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCAzLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGxldmVsIGRvZXMgbm90IHVzZSBjb2xvdXIsIHNvIG5vIG5lZWQgdG8gY2hlY2sgZm9yIHRoYXQuXG4gICAgaWYgKGxldmVsLmZhaWxGb3JDaXJjbGVSZXBlYXRWYWx1ZSAmJiB0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgICAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gICAgICBpZiAoY29kZS5pbmRleE9mKCdjb3VudCA8IDMnKSA9PSAtMSkge1xuICAgICAgICB0aGlzLnRlc3RSZXN1bHRzID1cbiAgICAgICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfQUNDRVBUQUJMRV9GQUlMO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBjb21tb25Nc2cudG9vTXVjaFdvcmsoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ3R1cnRsZScsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBsZXZlbENvbXBsZXRlLFxuICAgIHRlc3RSZXN1bHQ6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IF8uYmluZCh0aGlzLm9uUmVwb3J0Q29tcGxldGUsIHRoaXMpLFxuICAgIHNhdmVfdG9fZ2FsbGVyeTogbGV2ZWwuaW1wcmVzc2l2ZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LnBpdm90YWx0cmFja2VyLmNvbS9zdG9yeS9zaG93Lzg0MTcxNTYwXG4gIC8vIE5ldmVyIHNlbmQgdXAgZnJvemVuIGltYWdlcyBmb3Igbm93LlxuICB2YXIgaXNGcm96ZW4gPSAodGhpcy5za2luLmlkID09PSAnYW5uYScgfHwgdGhpcy5za2luLmlkID09PSAnZWxzYScpO1xuXG4gIC8vIEdldCB0aGUgY2FudmFzIGRhdGEgZm9yIGZlZWRiYWNrLlxuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwgJiZcbiAgICAhaXNGcm96ZW4gJiYgKGxldmVsLmZyZWVQbGF5IHx8IGxldmVsLmltcHJlc3NpdmUpKSB7XG4gICAgcmVwb3J0RGF0YS5pbWFnZSA9IHRoaXMuZ2V0RmVlZGJhY2tJbWFnZV8oKTtcbiAgfVxuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIFRoZSBjYWxsIHRvIGRpc3BsYXlGZWVkYmFjaygpIHdpbGwgaGFwcGVuIGxhdGVyIGluIG9uUmVwb3J0Q29tcGxldGUoKVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5nZXRGZWVkYmFja0ltYWdlXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmVlZGJhY2tJbWFnZUNhbnZhcztcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhEaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eFNjcmF0Y2g7XG4gIH1cblxuICAvLyBDb3B5IHRoZSB1c2VyIGxheWVyXG4gIHRoaXMuY3R4RmVlZGJhY2suZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICB0aGlzLmN0eEZlZWRiYWNrLmRyYXdJbWFnZShmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcywgMCwgMCwgMTU0LCAxNTQpO1xuICB2YXIgZmVlZGJhY2tDYW52YXMgPSB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChcbiAgICAgIGZlZWRiYWNrQ2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKS5zcGxpdCgnLCcpWzFdKTtcbn07XG5cbi8vIEhlbHBlciBmb3IgY3JlYXRpbmcgY2FudmFzIGVsZW1lbnRzLlxuQXJ0aXN0LnByb3RvdHlwZS5jcmVhdGVDYW52YXNfID0gZnVuY3Rpb24gKGlkLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBlbC5pZCA9IGlkO1xuICBlbC53aWR0aCA9IHdpZHRoO1xuICBlbC5oZWlnaHQgPSBoZWlnaHQ7XG4gIHJldHVybiBlbDtcbn07XG5cbi8qKlxuKiBXaGVuIHNtb290aCBhbmltYXRlIGlzIHRydWUsIHN0ZXBzIGNhbiBiZSBicm9rZW4gdXAgaW50byBtdWx0aXBsZSBhbmltYXRpb25zLlxuKiBBdCB0aGUgZW5kIG9mIGVhY2ggc3RlcCwgd2Ugd2FudCB0byByZXNldCBhbnkgaW5jcmVtZW50YWwgaW5mb3JtYXRpb24sIHdoaWNoXG4qIGlzIHdoYXQgdGhpcyBkb2VzLlxuKi9cbkFydGlzdC5wcm90b3R5cGUucmVzZXRTdGVwSW5mb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RlcFN0YXJ0WCA9IHRoaXMueDtcbiAgdGhpcy5zdGVwU3RhcnRZID0gdGhpcy55O1xuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSAwO1xufTtcbiIsInZhciBsZXZlbEJhc2UgPSByZXF1aXJlKCcuLi9sZXZlbF9iYXNlJyk7XG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGFuc3dlciA9IHJlcXVpcmUoJy4vYW5zd2VycycpLmFuc3dlcjtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLy8gQW4gZWFybHkgaGFjayBpbnRyb2R1Y2VkIHNvbWUgbGV2ZWxidWlsZGVyIGxldmVscyBhcyBwYWdlIDUsIGxldmVsIDcuIExvbmdcbi8vIHRlcm0gd2UgY2FuIHByb2JhYmx5IGRvIHNvbWV0aGluZyBtdWNoIGNsZWFuZXIsIGJ1dCBmb3Igbm93IEknbSBjYWxsaW5nXG4vLyBvdXQgdGhhdCB0aGlzIGxldmVsIGlzIHNwZWNpYWwgKG9uIHBhZ2UgNSkuXG52YXIgTEVWRUxCVUlMREVSX0xFVkVMID0gNztcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCB0b29sYm94LlxudmFyIHRvb2xib3ggPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi90b29sYm94LnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHN0YXJ0QmxvY2tzLlxudmFyIHN0YXJ0QmxvY2tzID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vc3RhcnRCbG9ja3MueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbnZhciByZXEgPSByZXF1aXJlKCcuL3JlcXVpcmVkQmxvY2tzJyk7XG52YXIgbWFrZU1hdGhOdW1iZXIgPSByZXEubWFrZU1hdGhOdW1iZXI7XG52YXIgc2ltcGxlQmxvY2sgPSByZXEuc2ltcGxlQmxvY2s7XG52YXIgcmVwZWF0ID0gcmVxLnJlcGVhdDtcbnZhciBkcmF3QVNxdWFyZSA9IHJlcS5kcmF3QVNxdWFyZTtcbnZhciBkcmF3QVNub3dtYW4gPSByZXEuZHJhd0FTbm93bWFuO1xudmFyIE1PVkVfRk9SV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9GT1JXQVJEX0lOTElORTtcbnZhciBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FID0gcmVxLk1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkU7XG52YXIgbW92ZUZvcndhcmRJbmxpbmUgPSByZXEubW92ZUZvcndhcmRJbmxpbmU7XG52YXIgTU9WRV9CQUNLV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9CQUNLV0FSRF9JTkxJTkU7XG52YXIgdHVybkxlZnRSZXN0cmljdGVkID0gcmVxLnR1cm5MZWZ0UmVzdHJpY3RlZDtcbnZhciB0dXJuUmlnaHRSZXN0cmljdGVkID0gcmVxLnR1cm5SaWdodFJlc3RyaWN0ZWQ7XG52YXIgdHVyblJpZ2h0QnlDb25zdGFudCA9IHJlcS50dXJuUmlnaHRCeUNvbnN0YW50O1xudmFyIHR1cm5SaWdodCA9IHJlcS50dXJuUmlnaHQ7XG52YXIgdHVybkxlZnQgPSByZXEudHVybkxlZnQ7XG52YXIgbW92ZSA9IHJlcS5tb3ZlO1xudmFyIGRyYXdUdXJuUmVzdHJpY3RlZCA9IHJlcS5kcmF3VHVyblJlc3RyaWN0ZWQ7XG52YXIgZHJhd1R1cm4gPSByZXEuZHJhd1R1cm47XG52YXIgU0VUX0NPTE9VUl9QSUNLRVIgPSByZXEuU0VUX0NPTE9VUl9QSUNLRVI7XG52YXIgU0VUX0NPTE9VUl9SQU5ET00gPSByZXEuU0VUX0NPTE9VUl9SQU5ET007XG52YXIgZGVmaW5lV2l0aEFyZyA9IHJlcS5kZWZpbmVXaXRoQXJnO1xuXG52YXIgYmxvY2tzID0ge1xuICBTSU1QTEVfTU9WRV9VUDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfdXAnKSxcbiAgU0lNUExFX01PVkVfRE9XTjogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfZG93bicpLFxuICBTSU1QTEVfTU9WRV9MRUZUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9sZWZ0JyksXG4gIFNJTVBMRV9NT1ZFX1JJR0hUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9yaWdodCcpLFxuICBTSU1QTEVfSlVNUF9VUDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfdXAnKSxcbiAgU0lNUExFX0pVTVBfRE9XTjogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfZG93bicpLFxuICBTSU1QTEVfSlVNUF9MRUZUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9sZWZ0JyksXG4gIFNJTVBMRV9KVU1QX1JJR0hUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9yaWdodCcpLFxuICBTSU1QTEVfTU9WRV9VUF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3VwX2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9ET1dOX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfZG93bl9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfTEVGVF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2xlZnRfbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX1JJR0hUX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfcmlnaHRfbGVuZ3RoJyksXG4gIHNpbXBsZU1vdmVCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9NT1ZFX1VQICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfRE9XTiArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0xFRlQgK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9SSUdIVDtcbiAgfSxcbiAgc2ltcGxlSnVtcEJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX0pVTVBfVVAgK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9ET1dOICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfTEVGVCArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX1JJR0hUO1xuICB9LFxuICBzaW1wbGVNb3ZlTGVuZ3RoQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfTU9WRV9VUF9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9ET1dOX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0xFRlRfTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfUklHSFRfTEVOR1RIO1xuICB9XG59O1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGxldmVsLXNwZWNpZmljIHJlcXVpcmVtZW50cy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBMZXZlbCAxOiBFbC5cbiAgJzFfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAxKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1tNT1ZFX0ZPUldBUkRfSU5MSU5FXSwgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IFNxdWFyZSAod2l0aG91dCByZXBlYXQpLlxuICAnMV8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDIpLFxuICAgIGlkZWFsOiAxMSxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IFNxdWFyZSAod2l0aCByZXBlYXQpLlxuICAnMV8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDMpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldLFxuICAgICAgW3JlcGVhdCg0KV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA0OiBUcmlhbmdsZS5cbiAgJzFfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA0KSxcbiAgICBpZGVhbDogNixcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA1OiBFbnZlbG9wZS5cbiAgJzFfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA1KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCgxMjApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDY6IHRyaWFuZ2xlIGFuZCBzcXVhcmUuXG4gICcxXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNiksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoMTIwKSwgdHVybkxlZnRSZXN0cmljdGVkKDEyMCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkUsIE1PVkVfQkFDS1dBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDc6IGdsYXNzZXMuXG4gICcxXzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNyksXG4gICAgaWRlYWw6IDEzLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd1R1cm5SZXN0cmljdGVkKDkwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFtNT1ZFX0JBQ0tXQVJEX0lOTElORSwgTU9WRV9GT1JXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA4OiBzcGlrZXMuXG4gICcxXzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgOCksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbcmVwZWF0KDgpXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDk6IGNpcmNsZS5cbiAgJzFfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA5KSxcbiAgICBpZGVhbDogNixcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgcGVybWl0dGVkRXJyb3JzOiAxMCxcbiAgICBmYWlsRm9yQ2lyY2xlUmVwZWF0VmFsdWU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICcxXzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDEwKSxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMTApLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogdHJ1ZVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDIuXG4gIC8vIExldmVsIDE6IFNxdWFyZS5cbiAgJzJfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAxKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgICAgIHRpdGxlczogeydESVInOiAndHVyblJpZ2h0J30sXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDkwKX1cbiAgICAgIH1dLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgbW92ZSBmb3J3YXJkIG9yIGJhY2t3YXJkLCBidXQgc2hvdyBmb3J3YXJkIGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZSc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X21vdmUnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcigxMDApfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBTbWFsbCBncmVlbiBzcXVhcmUuXG4gICcyXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMiksXG4gICAgaWRlYWw6IDUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNxdWFyZSgnPz8nKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBUaHJlZSBzcXVhcmVzLlxuICAnMl8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDMpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFtkcmF3QVNxdWFyZSgxMDApXSxcbiAgICAgIFtkcmF3VHVybigpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDQ6IDM2IHNxdWFyZXMuXG4gICcyXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNCksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNCksXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNTogRGlmZmVyZW50IHNpemUgc3F1YXJlcy5cbiAgJzJfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA1KSxcbiAgICBpZGVhbDogMTEsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNxdWFyZSgnPz8nKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA2OiBGb3ItbG9vcCBzcXVhcmVzLlxuICAnMl82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDYpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDYpLFxuICAgIC8vIFRoaXMgaXMgbm90IGRpc3BsYXllZCBwcm9wZXJseS5cbiAgICByZXF1aXJlZEJsb2NrczogW1tzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNzogQm94eSBzcGlyYWwuXG4gICcyXzcnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDIsIDcpLFxuICAgIGlkZWFsOiA5LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbc2ltcGxlQmxvY2soJ2NvbnRyb2xzX2Zvcl9jb3VudGVyJyldLFxuICAgICAgW21vdmUoJz8/JyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBQcmVwIGZvciBMZXZlbCA4OiBUd28gc25vd21lbi5cbiAgJzJfN181Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDcuNSksXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA3LjUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKDI1MCldLFxuICAgICAgW2RyYXdBU25vd21hbigxMDApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgODogVGhyZWUgc25vd21lbi5cbiAgJzJfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA4KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGlkZWFsOiAxMixcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbigxNTApXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXSxcbiAgICAgIFt0dXJuTGVmdCg5MCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ2p1bXAnLFxuICAgICAgICB0eXBlOiAnanVtcCcsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDEwMCl9XG4gICAgICB9XSxcbiAgICAgIFtzaW1wbGVCbG9jaygnanVtcCcpXSxcbiAgICAgIFtyZXBlYXQoMyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA5OiBTbm93bWFuIGZhbWlseS5cbiAgJzJfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA5KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGlkZWFsOiAxNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbignPz8nKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ2NvbnRyb2xzX2Zvcl9jb3VudGVyJyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV0sXG4gICAgICBbdHVybkxlZnQoOTApXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICdqdW1wJyxcbiAgICAgICAgdHlwZTogJ2p1bXAnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcig2MCl9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICcyXzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDEwKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMTApXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgMy5cbiAgLy8gTGV2ZWwgMTogQ2FsbCAnZHJhdyBhIHNxdWFyZScuXG4gICczXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMSksXG4gICAgaWRlYWw6IDE0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IENyZWF0ZSBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAnM18yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDIpLFxuICAgIGlkZWFsOiAxNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMTIwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogRmVuY2UgdGhlIGFuaW1hbHMuXG4gICczXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMyksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCAyNDddXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgNDddXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE4MiwgMTQ3XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNDogSG91c2UgdGhlIGxpb24uXG4gICczXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNCksXG4gICAgaWRlYWw6IDE5LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgzMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxOTUsIDk3XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNTogQ3JlYXRlIFwiZHJhdyBhIGhvdXNlXCIuXG4gICczXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNSksXG4gICAgaWRlYWw6IDIxLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmRlZmluZShtc2cuZHJhd0FIb3VzZSgpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgzMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FIb3VzZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDkwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyMjIsIDkwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNjogQWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAnM182Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDYpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDIzLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE4NSwgMTAwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzUsIDI0OF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDc6IEFkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgaG91c2VcIi5cbiAgJzNfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA3KSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVNxdWFyZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjA1LCAyMjBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA4OiBEcmF3IGhvdXNlcy5cbiAgJzNfOCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgOCksXG4gICAgaW5pdGlhbFg6IDIwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDQwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDgpLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNiwgMTcwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTUsIDI1MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxMjcsIDIyMF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjU1LCAyNTBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA5OiBEcmF3IGhvdXNlcyB3aXRoIGZvciBsb29wLlxuICAnM185Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA5KSxcbiAgICBpbml0aWFsWDogMjAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogNDAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FTcXVhcmUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFstMTAsIDI3MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbNTMsIDI1MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzUsIDIyMF1cbiAgICAgIH1cbiAgICBdLFxuICAgIGZhaWxGb3JUb29NYW55QmxvY2tzOiB0cnVlLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnM18xMCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMTApLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAxMClcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSA0LlxuICAvLyBMZXZlbCAxOiBPbmUgdHJpYW5nbGUuXG4gICc0XzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMSksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudCc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gIH0sXG4gIC8vIExldmVsIDI6IFR3byB0cmlhbmdsZXMuXG4gICc0XzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMiksXG4gICAgaWRlYWw6IDEyLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC41XG4gIH0sXG4gIC8vIExldmVsIDM6IEZvdXIgdHJpYW5nbGVzIHVzaW5nIHJlcGVhdC5cbiAgJzRfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAzKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC43XG4gIH0sXG4gIC8vIExldmVsIDQ6IFRlbiB0cmlhbmdsZXMgd2l0aCBtaXNzaW5nIHJlcGVhdCBudW1iZXIuXG4gICc0XzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNCksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuNyxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDU6IDM2IHRyaWFuZ2xlcyB3aXRoIG1pc3NpbmcgYW5nbGUgbnVtYmVyLlxuICAnNF81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDUpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNjogMSBzcXVhcmUuXG4gICc0XzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNiksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFttb3ZlRm9yd2FyZElubGluZSgyMCldLFxuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAndHVyblJpZ2h0JyxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgICBwZXJtaXR0ZWRFcnJvcnM6IDEwLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDc6IFNxdWFyZSBMYWRkZXIuXG4gICc0XzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNyksXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW21vdmVGb3J3YXJkSW5saW5lKDIwKV0sXG4gICAgICBbcmVwZWF0KDEwKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjdcbiAgfSxcbiAgLy8gTGV2ZWwgODogTGFkZGVyIHNxdWFyZS5cbiAgJzRfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA4KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgOTogTGFkZGVyIHNxdWFyZSB3aXRoIGEgZGlmZmVyZW50IGFuZ2xlLlxuICAnNF85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDkpLFxuICAgIGluaXRpYWxYOiAxNTAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAzMzAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCAxMDogTGFkZGVyIHBvbHlnb24uXG4gICc0XzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDEwKSxcbiAgICBpbml0aWFsWDogNzUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDEwKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgMTE6IHBsYXlncm91bmQuXG4gICc0XzExJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDExKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWDogNzUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDExKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMTEpLFxuICAgIHJlcXVpcmVkQmxvY2tzIDogW10sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICAgfSxcblxuICAvLyBGb3JtZXJseSBQYWdlIDUuXG4gIC8vIExldmVsIDE6IHBsYXlncm91bmQuXG4gICc1XzEnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDEpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDEpLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgMjogcGxheWdyb3VuZC5cbiAgJzVfMic6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMiksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMiksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCAzOiBwbGF5Z3JvdW5kLlxuICAnNV8zJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAzKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAzKSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDQ6IHBsYXlncm91bmQuXG4gICc1XzQnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDQpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDQpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNTogcGxheWdyb3VuZC5cbiAgJzVfNSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNSksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA2OiBwbGF5Z3JvdW5kLlxuICAnNV82Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA2KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDYpLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gVGhlIGxldmVsIGZvciBidWlsZGluZyBuZXcgbGV2ZWxzLlxuICAnYnVpbGRlcic6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCBMRVZFTEJVSUxERVJfTEVWRUwpLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIFRoZSBkZWZhdWx0IGxldmVsIG5ld2x5IGNyZWF0ZWQgbGV2ZWxzIHVzZS5cbiAgJ2N1c3RvbSc6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgTEVWRUxCVUlMREVSX0xFVkVMKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAnazFfZGVtbyc6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlzSzE6IHRydWUsXG4gICAgdG9vbGJveDogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgICAgICBibG9ja3Muc2ltcGxlTW92ZUJsb2NrcygpICtcbiAgICAgICAgYmxvY2tzLnNpbXBsZUp1bXBCbG9ja3MoKSArXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVNb3ZlTGVuZ3RoQmxvY2tzKCkgK1xuICAgICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZCcpICtcbiAgICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZHJhd19jb2xvdXJfc2ltcGxlJylcbiAgICAgICksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfVxufTtcblxubGV2ZWxzLmVjXzFfMSA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMSddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwibW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMiA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMiddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwicGVuQ29sb3VyKCcjZmYwMDAwJyk7XFxubW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMyA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMyddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwiZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcXG4gIF9fXFxufVxcblwiLFxufSk7XG5sZXZlbHMuZWNfMV80ID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV80J10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xcbiAgcGVuQ29sb3VyKCcjZmYwMDAwJyk7XFxufVxcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8xMCA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMTAnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdwZW5XaWR0aCc6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwibW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbi8vIEFuIGVhcmx5IGhhY2sgaW50cm9kdWNlZCBzb21lIGxldmVsYnVpbGRlciBsZXZlbHMgYXMgcGFnZSA1LCBsZXZlbCA3LiBMb25nXG4vLyB0ZXJtIHdlIGNhbiBwcm9iYWJseSBkbyBzb21ldGhpbmcgbXVjaCBjbGVhbmVyLCBidXQgZm9yIG5vdyBJJ20gY2FsbGluZ1xuLy8gb3V0IHRoYXQgdGhpcyBsZXZlbCBpcyBzcGVjaWFsIChvbiBwYWdlIDUpLlxudmFyIExFVkVMQlVJTERFUl9MRVZFTCA9IDc7XG5cbi8qXG5UT09MQk9YLlxuXG5QQUdFIDFcbj09PT09PVxuV2l0aGluIHRoaXMgcGFnZSwgYmxvY2tzIGFyZSBvbmx5IGFkZGVkLCBuZXZlciB0YWtlbiBhd2F5LlxuXG5MZXZlbCAxIFtlbF06IEFkZHMgZHJhd19tb3ZlX2J5X2NvbnN0YW50IGFuZCBkcmF3X3R1cm5fYnlfY29uc3RhbnQuXG5MZXZlbCAyIFtjb2xvdXJlZCBzcXVhcmVdOiBBZGRzIGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlci5cbmxldmVsIDMgW3NxdWFyZSBpbiB0aHJlZSBibG9ja3NdOiBBZGRzIGNvbnRyb2xzX3JlcGVhdC5cbmxldmVsIDQgW3RyaWFuZ2xlXSBBZGRzIGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3JhbmRvbS5cbkxldmVsIDUgW292ZXJsYXBwaW5nIHNxdWFyZSBhbmQgdHJpYW5nbGUgKHNpZGV3YXlzIGVudmVsb3BlKV1cbkxldmVsIDYgW2VudmVsb3BlXVxuTGV2ZWwgNyBbZ2xhc3Nlc11cbkxldmVsIDggW3NwaWtlc11cbkxldmVsIDkgW2NpcmNsZV1cbkxldmVsIDEwIFtmcmVlIHBsYXldOiBkcmF3X3dpZHRoX2lubGluZVxuXG5QQUdFIDJcbj09PT09PVxuQ2F0ZWdvcmllcyBhcmUgaW50cm9kdWNlZCwgd2l0aCBjb250ZW50cyBvZjpcbi0gQWN0aW9uc1xuICAtIGRyYXdfbW92ZSB3aXRoIG1hdGhfbnVtYmVyXG4gIC0gZHJhd190dXJuIHdpdGggbWF0aF9udW1iZXJcbi0gQ29sb3JcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcGlja2VyXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3JhbmRvbVxuLSBGdW5jdGlvbnMgKGFkZGVkIGF0IGxldmVsIDIpXG4gIC0gW2NhbGxdIGRyYXcgYSBzcXVhcmVcbiAgLSBbY2FsbF0gZHJhdyBhIHNub3diYWxsIChhZGRlZCBhdCBsZXZlbCA5KVxuLSBMb29wc1xuICAtIGNvbnRyb2xzX3JlcGVhdFxuICAtIGNvbnRyb2xzX2ZvciAoYWRkZWQgYXQgbGV2ZWwgNilcbi0gTWF0aFxuICAtIG1hdGhfbnVtYmVyXG4tIFZhcmlhYmxlcyAoYWRkZWQgYXQgbGV2ZWwgNilcbiAgLSBnZXQgY291bnRlciAoYWRkZWQgYXQgbGV2ZWwgOSlcbiAgLSBnZXQgaGVpZ2h0IChhZGRlZCBhdCBsZXZlbCA3KVxuICAtIGdldCBsZW5ndGggKGxldmVscyA2IGFuZCAxMClcbkxldmVsIDEgW3NxdWFyZV1cbkxldmVsIDIgW3NxdWFyZSBieSBmdW5jdGlvbiBjYWxsXTogYWRkIFwiZHJhdyBhIHNxdWFyZVwiXG5MZXZlbCAzIFszIHNxdWFyZXNdXG5MZXZlbCA0IFszNiBzcXVhcmVzXVxuTGV2ZWwgNSBbbmVzdGVkIHNxdWFyZXMgd2l0aG91dCBjb250cm9sc19mb3JdXG5MZXZlbCA2IFtuZXN0ZWQgc3F1YXJlcyB3aXRoIGNvbnRyb2xzX2Zvcl1cbkxldmVsIDcgW21pbmktc3BpcmFsXVxuTGV2ZWwgOCBbMyBzbm93bWVuXTogYWRkIFwiZHJhdyBhIHNub3dtYW5cIlxuTGV2ZWwgOSBbc25vd21hbiBmYW1pbHldXG5MZXZlbCAxMCBbZnJlZSBwbGF5XVxuXG5QQUdFIDNcbj09PT09PVxuQ2F0ZWdvcmllcyBhcmUgdXNlZCwgd2l0aCBjb250ZW50cyBvZjpcbi0gQWN0aW9uc1xuICAtIGRyYXdfbW92ZSB3aXRoIG1hdGhfbnVtYmVyXG4gIC0gZHJhd190dXJuIHdpdGggbWF0aF9udW1iZXJcbi0gQ29sb3JcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcGlja2VyXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3JhbmRvbVxuLSBGdW5jdGlvbnMgKFJlcGxhY2VkIHdpdGggY3VzdG9tIGNhdGVnb3J5IGF0IGxldmVsIDIpXG4gIC0gW2NhbGxdIGRyYXcgYSBjaXJjbGVcbiAgLSBbY2FsbF0gZHJhdyBhIHNxdWFyZVxuLSBMb29wc1xuICAtIGNvbnRyb2xzX2ZvclxuICAtIGNvbnRyb2xzX3JlcGVhdFxuLSBNYXRoXG4gIC0gbWF0aF9udW1iZXJcbi0gVmFyaWFibGVzIChhZGRlZCBhdCBsZXZlbCA2KVxuICAtIGdldCBjb3VudGVyXG5WYXJpYWJsZXMgYW5kIGZ1bmN0aW9ucyBhcmUgbWFudWFsbHkgYWRkZWQgdW50aWwgTGV2ZWxzIDcgYW5kIDgsXG53aGVuIHRoZSBjdXN0b20gY2F0ZWdvcmllcyBhcmUgdXNlZFxuTGV2ZWwgMSBbY2FsbCBcImRyYXcgYSBzcXVhcmVcIl1cbkxldmVsIDIgW2NyZWF0ZSBhbmQgY2FsbCBcImRyYXcgYSB0cmlhbmdsZVwiXVxuTGV2ZWwgMyBbdXNlIFwiZHJhdyBhIHNxdWFyZVwiIGFuZCBcImRyYXcgYSB0cmlhbmdsZVwiIHRvIGZlbmNlIGFuaW1hbHNdXG5MZXZlbCA0IFtkcmF3IGEgaG91c2VdXG5MZXZlbCA1IFtjcmVhdGUgYW5kIGNhbGwgXCJkcmF3IGEgaG91c2VcIl1cbkxldmVsIDYgW2FkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgdHJpYW5nbGVcIl1cbkxldmVsIDcgW2FkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgaG91c2VcIl1cbkxldmVsIDggW21vZGlmeSBlbmQgbG9jYXRpb24gb2YgXCJjcmVhdGUgYSBob3VzZVwiXVxuTGV2ZWwgOSBbY2FsbCBcImRyYXcgYSBob3VzZVwiIHdpdGggZm9yIGxvb3BdXG5MZXZlbCAxMCBbZnJlZSBwbGF5XVxuXG4qLzsgYnVmLnB1c2goJzx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgJyk7OTI7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudCcpOzkzOyBpZiAobGV2ZWwgPD0gOCkgeyA7IGJ1Zi5wdXNoKCdfcmVzdHJpY3RlZCcpOzkzOyB9IDsgYnVmLnB1c2goJ1wiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzk2OyBpZiAobGV2ZWwgPj0gMikgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwMTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDE7IGlmIChsZXZlbCA+PSA0KSB7IC8qIE91dCBvZiBudW1lcmljIG9yZGVyIHRvIG1ha2UgY29sb3VyIGJsb2NrcyBhZGphY2VudC4gKi87IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTA2OyBpZiAobGV2ZWwgPj0gMykgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTA5OyB9OyBidWYucHVzaCgnICAgICcpOzEwOTsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiIHg9XCIxNThcIiB5PVwiNjdcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMTI7IH07IGJ1Zi5wdXNoKCcgICcpOzExMjsgfSBlbHNlIGlmIChwYWdlID09IDIgfHwgcGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAgICcpOzExMjsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IGlkPVwiYWN0aW9uc1wiIG5hbWU9XCInLCBlc2NhcGUoKDExMiwgIG1zZy5jYXRUdXJ0bGUoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTIwOyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwianVtcFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTI3OyB9OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEzNDsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTM3OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzEzODsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDEzOCwgIG1zZy5jYXRDb2xvdXIoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTUwOyAvLyBGdW5jdGlvbnMgZGlmZmVyIGRlcGVuZGluZyBvbiBwYWdlIGFuZCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICAnKTsxNTA7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gMikgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNTAsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAnKTsxNTg7IGlmIChsZXZlbCA+PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAnKTsxNjU7IH07IGJ1Zi5wdXNoKCcgICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxNjY7IH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAgICAgJyk7MTY2OyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICAgICAgJyk7MTY2OyAvLyBEb24ndCB1c2UgY3VzdG9tIGNhdGVnb3J5IHlldCwgc2luY2UgaXQgYWxsb3dzIGZ1bmN0aW9uIGRlZmluaXRpb24uXG47IGJ1Zi5wdXNoKCcgICAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNjYsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTY4LCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDE3MSwgIG1zZy5kcmF3QVNxdWFyZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICAgJyk7MTc0OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCdcXG4gICAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNzUsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gICAgICAnKTsxNzY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTc2OyB9OyBidWYucHVzaCgnICAgICcpOzE3NjsgLy8gQ29udHJvbDogY29udHJvbHNfZm9yX2NvdW50ZXIgKGZyb20gcGFnZSAyLCBsZXZlbCA2KSBhbmQgcmVwZWF0LlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNzYsICBtc2cuY2F0Q29udHJvbCgpICkpLCAnXCI+XFxuICAgICAgJyk7MTc3OyBpZiAoKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA2KSB8fCAocGFnZSA9PSAzICYmIGxldmVsID49IDkpKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTk0OyB9OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxOTg7IC8vIE1hdGg6IEp1c3QgbnVtYmVyIGJsb2NrcyB1bnRpbCBmaW5hbCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTk4LCAgbXNnLmNhdE1hdGgoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48L2Jsb2NrPlxcbiAgICAgICcpOzIwMDsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9pbnRcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9mbG9hdFwiPjwvYmxvY2s+XFxuICAgICcpOzIxNDsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMTU7IC8vIFZhcmlhYmxlcyBkZXBlbmRzIG9uIHBhZ2UgYW5kIGxldmVsLCBhbHRob3VnaCB3ZSBuZXZlciB1c2UgdGhlIGN1c3RvbSBjYXRlZ29yeVxuOyBidWYucHVzaCgnICAgICcpOzIxNTsgLy8gYmVjYXVzZSB3ZSB3YW50IHRvIG9mZmVyIHNpbXBsaWZpZWQgZ2V0dGVycyBhbmQgbm8gc2V0dGVycy5cbjsgYnVmLnB1c2goJyAgICAnKTsyMTU7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gNikgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMTUsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMTg7IH0gZWxzZSBpZiAocGFnZSA9PSAzICYmIGxldmVsID49IDYgJiYgbGV2ZWwgPCAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMTgsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIj5cXG4gICAgICAgICcpOzIxOTsgaWYgKGxldmVsID49IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgJyk7MjIwOyB9OyBidWYucHVzaCgnICAgICAgICAnKTsyMjA7IGlmIChsZXZlbCA+PSA2KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgJyk7MjIxOyB9OyBidWYucHVzaCgnICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjIyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gMyAmJiBsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMjIsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIiBjdXN0b209XCJWQVJJQUJMRVwiPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIyNDsgfTsgYnVmLnB1c2goJyAgJyk7MjI0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkgezsgYnVmLnB1c2goJyAgICAnKTsyMjQ7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTsyMjg7IGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTsyMzE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MjMxOyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjQ0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gNSkgezsgYnVmLnB1c2goJyAgJyk7MjQ0OyAvLyBLMSBzaW1wbGlmaWVkIGJsb2NrcyBmb3IgZWRpdG9yOiBrZWVwIGluIHN5bmMgd2l0aCBEYXNoYm9hcmQgYXJ0aXN0LnJiXG47IGJ1Zi5wdXNoKCcgICAgJyk7MjQ0OyBpZiAobGV2ZWwgPT09IExFVkVMQlVJTERFUl9MRVZFTCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiSzEgU2ltcGxpZmllZFwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91cl9zaW1wbGVcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV91cFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2Rvd25cIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9sZWZ0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfcmlnaHRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV91cF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9kb3duX2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2xlZnRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfcmlnaHRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfdXBcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9kb3duXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfbGVmdFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX3JpZ2h0XCI+PC9ibG9jaz5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyNjI7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MjYyOyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgaWQ9XCJhY3Rpb25zXCIgbmFtZT1cIicsIGVzY2FwZSgoMjYyLCAgbXNnLmNhdFR1cnRsZSgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImp1bXBcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7Mjg5OyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjg5LCAgbXNnLmNhdENvbG91cigpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszMDE7IC8vIEZ1bmN0aW9uc1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzMDEsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gICAgJyk7MzAyOyBpZiAobGV2ZWwgPT09IExFVkVMQlVJTERFUl9MRVZFTCkgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIlByZWJ1aWx0XCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfdHJpYW5nbGVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZV9jdXN0b21cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2hvdXNlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9mbG93ZXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dmbGFrZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfaGV4YWdvblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3RhclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffcm9ib3RcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3JvY2tldFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfcGxhbmV0XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yaG9tYnVzXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdXBwZXJfd2F2ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2xvd2VyX3dhdmVcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszMTg7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MzE4OyAvLyBDb250cm9sOiBjb250cm9sc19mb3JfY291bnRlciBhbmQgcmVwZWF0LlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzMTgsICBtc2cuY2F0Q29udHJvbCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszMzY7IGlmIChsZXZlbCA8IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzM5OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszNDY7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICcpOzM0NzsgLy8gTG9naWNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzQ3LCAgbXNnLmNhdExvZ2ljKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2lmXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2NvbXBhcmVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfb3BlcmF0aW9uXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX25lZ2F0ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19ib29sZWFuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX251bGxcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfdGVybmFyeVwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzM1NjsgLy8gTWF0aDogSnVzdCBudW1iZXIgYmxvY2tzIHVudGlsIGZpbmFsIGxldmVsLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNTYsICBtc2cuY2F0TWF0aCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2ludFwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2Zsb2F0XCI+PC9ibG9jaz5cXG4gICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzM3MzsgLy8gVmFyaWFibGVzXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM3MywgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlZBUklBQkxFXCI+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAnKTszNzU7IH07IGJ1Zi5wdXNoKCc8L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG4vKipcbiAqIENvbW1vbiBjb2RlIGZvciBjcmVhdGluZyBwcm9jZWR1cmVzIGRyYXdpbmcgZGlmZmVyZW50IHJlZ3VsYXIgcG9seWdvbnMuXG4gKiBvcHRpb25zOlxuICogICB0aXRsZSBUaXRsZSBvZiBwcm9jZWR1cmUuXG4gKiAgIG1vZGlmaWVycyBTdHJpbmcgY29udGFpbmluZyBhbnkgb3B0aW9uYWwga2V5cyBhbmQgdmFsdWVzIGZvciB0aGUgaW5pdGlhbFxuICogICAgICAgICAgICAgPGJsb2NrPiB0YWcsIHN1Y2ggYXMgJ3g9XCIyMFwiIHk9XCIyMFwiIGVkaXRhYmxlPVwiZmFsc2VcIicuXG4gKiAgIHNpZGVzIE51bWJlciBvZiBzaWRlcy5cbiAqICAgbGVuZ3RoIDAgaWYgYSBsZW5ndGggcGFyYW1ldGVyIHNob3VsZCBiZSB1c2VkLCBhIHBvc2l0aXZlIG51bWJlciBvdGhlcndpc2VcbiAqL1xudmFyIHBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zKSB7OyBidWYucHVzaCgnPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgJywgKDE0LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgPG11dGF0aW9uPlxcbiAgICAgICcpOzE2OyBpZiAob3B0aW9ucy5sZW5ndGggPT0gMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxNiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICcpOzE3OyB9OyBidWYucHVzaCgnICAgIDwvbXV0YXRpb24+XFxuICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMTgsICBvcHRpb25zLnRpdGxlICkpLCAnPC90aXRsZT5cXG4gICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiICcsICgyMCwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+JywgZXNjYXBlKCgyMSwgIG9wdGlvbnMuc2lkZXMgKSksICc8L3RpdGxlPlxcbiAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiAnLCAoMjMsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICcpOzI1OyBpZiAob3B0aW9ucy5sZW5ndGggPT0gMCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfbGVuZ3RoXCIgJywgKDI1LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgJyk7MjY7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiAnLCAoMjYsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCgyNywgIG9wdGlvbnMubGVuZ3RoICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICcpOzI5OyB9OyBidWYucHVzaCgnICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgJywgKDMxLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiAnLCAoMzMsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDM0LCAgMzYwIC8gb3B0aW9ucy5zaWRlcyApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9zdGF0ZW1lbnQ+XFxuICA8L2Jsb2NrPlxcbicpOzQ0OyB9OzsgYnVmLnB1c2goJ1xcbicpOzQ1O1xuLyoqXG4gKiBTcGlyYWwgbmVlZHMgYSBuYW1lZCBoZWxwZXIgdGVtcGxhdGUgZm9yIHJlY3Vyc2lvbi5cbiAqIEBwYXJhbSBpIExvb3AgY29udHJvbCB2YXJpYWJsZS5cbiAqL1xudmFyIHNwaXJhbCA9IGZ1bmN0aW9uKGkpIHs7IGJ1Zi5wdXNoKCcgICcpOzUwOyBpZiAoaSA8PSA2MCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiICcpOzUwOyBpZiAoaSA9PSAyNSkgeyA7IGJ1Zi5wdXNoKCd4PVwiMzAwXCIgeT1cIjEwMFwiJyk7NTA7IH0gOyBidWYucHVzaCgnIGlubGluZT1cImZhbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoNTQsICBpICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwiZmFsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgJyk7NjY7IHNwaXJhbChpICsgNSk7IGJ1Zi5wdXNoKCcgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3MDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTs3MTsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTs3Mjtcbi8qKlxuICogRGVmaW5lIHRoZSBzdGFydGluZyBibG9ja3MgZm9yIGVhY2ggcGFnZSBhbmQgbGV2ZWwuXG4gKiBUaGVzZSBhcmUgcmVmZXJlbmNlZCBmcm9tIHR1cnRsZS5qcy5cbiAqL1xuOyBidWYucHVzaCgnXFxuJyk7Nzg7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICcpOzc4OyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+XFxuICAnKTs3OTsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkNPTE9VUlwiPiNmZjAwMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzg5OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs5OTsgfSBlbHNlIGlmIChsZXZlbCA9PSAzIHx8IGxldmVsID09IDUgfHwgbGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nKTsxMDA7IGlmIChsZXZlbCA9PSAzKSB7IDsgYnVmLnB1c2goJzQnKTsxMDA7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzMnKTsxMDA7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEwMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEwNjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cInNldC1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiIHg9XCIyMFwiIHk9XCIxMDBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlQmFja3dhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjQ1PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEyOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiAgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNTA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE1NDsgfTsgYnVmLnB1c2goJycpOzE1NDsgfSBlbHNlIGlmIChwYWdlID09IDIpIHs7IGJ1Zi5wdXNoKCcgICcpOzE1NDsgLy8gTm8gYmxvY2tzIGFyZSBwcm92aWRlZCBmb3IgbGV2ZWxzIDEgYW5kIDIuXG47IGJ1Zi5wdXNoKCcgICcpOzE1NDsgaWYgKGxldmVsID09IDMgfHwgbGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICAnKTsxNTQ7IC8vIENhbGwgXCJkcmF3IGEgc3F1YXJlXCIuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxNTc7IGlmIChsZXZlbCA9PSAzKSB7IDsgYnVmLnB1c2goJzEwMCcpOzE1NzsgfSBlbHNlIHsgOyBidWYucHVzaCgnNTAnKTsxNTc7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE2MTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgICcpOzE2MTsgLy8gVGhyZWUtc3F1YXJlIGNvZGUuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBkZWxldGFibGU9XCJmYWxzZVwiICB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIGlkPVwic2V0LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE5MDsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxOTEsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE5NDsgaWYgKGxldmVsID09IDYpIHsgOyBidWYucHVzaCgnNTAnKTsxOTQ7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzEwJyk7MTk0OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE5OTsgaWYgKGxldmVsID09IDYpIHsgOyBidWYucHVzaCgnOTAnKTsxOTk7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzEwMCcpOzE5OTsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICAnKTsyMTI7IHNwaXJhbCgyNSk7IGJ1Zi5wdXNoKCcgICcpOzIxMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3LjUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIHg9XCIyMFwiIHk9XCIyMFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjUwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIxOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA4IHx8IGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIHg9XCIyMFwiIHk9XCIyMFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTUwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIyNjsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCIgeD1cIjE1OFwiIHk9XCI2N1wiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkxPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjY2OyB9OyBidWYucHVzaCgnJyk7MjY2OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgJyk7MjY2OyAvLyBEZWZpbmUgXCJkcmF3IGEgc3F1YXJlXCIuXG47IGJ1Zi5wdXNoKCcgICcsICgyNjYsICBwb2x5Z29uKHtcbiAgICB0aXRsZTogbXNnLmRyYXdBU3F1YXJlKCksXG4gICAgbW9kaWZpZXJzOiAobGV2ZWwgPT0gOCA/ICcnIDogJ3g9XCIyMjBcIiB5PVwiNDBcIicpICsgJyBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicsXG4gICAgc2lkZXM6IDQsXG4gICAgbGVuZ3RoOiAobGV2ZWwgPj0gNiA/IDAgOiAxMDApXG4gIH0pKSwgJyAgJyk7MjcxOyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICAnKTsyNzE7IC8vIERlZmluZSBcImRyYXcgYSBjaXJjbGVcIi5cbjsgYnVmLnB1c2goJyAgICAnLCAoMjcxLCAgcG9seWdvbih7XG4gICAgICB0aXRsZTogbXNnLmRyYXdBQ2lyY2xlKCksXG4gICAgICBtb2RpZmllcnM6ICd4PVwiMjIwXCIgeT1cIjI1MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyxcbiAgICAgIHNpZGVzOiAzNjAsXG4gICAgICBsZW5ndGg6IDFcbiAgICB9KSksICcgICcpOzI3NjsgfTsgYnVmLnB1c2goJyAgJyk7Mjc2OyBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjIwXCIgeT1cIjI1MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjc3LCAgbXNnLmRyYXdBVHJpYW5nbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNzk7IH0gZWxzZSBpZiAobGV2ZWwgPj0gMykgezsgYnVmLnB1c2goJyAgICAnKTsyNzk7IC8vICBEZWZpbmUgXCJkcmF3IGEgdHJpYW5nbGVcIi5cbjsgYnVmLnB1c2goJyAgICAnLCAoMjc5LCAgcG9seWdvbih7XG4gICAgICB0aXRsZTogbXNnLmRyYXdBVHJpYW5nbGUoKSxcbiAgICAgIG1vZGlmaWVyczogKGxldmVsID09IDggPyAnJyA6ICd4PVwiMjIwXCIgeT1cIjI1MFwiJykgKyAobGV2ZWwgPT0gNiA/ICcnIDogJyBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicpLFxuICAgICAgc2lkZXM6IDMsXG4gICAgICBsZW5ndGg6IChsZXZlbCA+PSA3ID8gMCA6IDEwMClcbiAgICB9KSksICcgICcpOzI4NDsgfTsgYnVmLnB1c2goJyAgJyk7Mjg0OyBpZiAobGV2ZWwgPT0gOCApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDI4NSwgIG1zZy5kcmF3QUhvdXNlKCkgKSksICdcIj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMjg2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI5NDsgfTsgYnVmLnB1c2goJyAgJyk7Mjk0OyBpZiAobGV2ZWwgPT0gNyB8fCBsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICcpOzI5NDsgLy8gIERlZmluZSBcImRyYXcgYSBob3VzZVwiLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiICcpOzI5NDsgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCd4PVwiMjIwXCIgeT1cIjQ2MFwiJyk7Mjk0OyB9OyBidWYucHVzaCgnPiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgICcpOzI5NTsgaWYgKGxldmVsID09IDgpIHsgOyBidWYucHVzaCgnPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgyOTUsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz4nKTsyOTU7IH07IGJ1Zi5wdXNoKCcgICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjk2LCAgbXNnLmRyYXdBSG91c2UoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMjk5LCAgbXNnLmRyYXdBU3F1YXJlKCkgKSksICdcIj5cXG4gICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDMwMCwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiLz5cXG4gICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgJyk7MzAzOyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMDQsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAnKTszMDY7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgJyk7MzA5OyB9OyBidWYucHVzaCgnICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICcpOzMxNDsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMTUsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICcpOzMxNzsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgJyk7MzIwOyB9OyBidWYucHVzaCgnICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgzMzEsICBtc2cuZHJhd0FUcmlhbmdsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgzMzIsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzM1OyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMzYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszMzg7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzQxOyB9OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MzUxOyB9IC8vIEVuZCBvZiByZWdpb24gaW4gd2hpY2ggXCJkcmF3IGEgc3F1YXJlXCIgaXMgZGVmaW5lZC5cbjsgYnVmLnB1c2goJycpOzM1MTsgfSBlbHNlIGlmIChwYWdlID09IDQpIHs7IGJ1Zi5wdXNoKCcgICcpOzM1MTsgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiMjMwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszOTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQxOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0NTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zNjwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDg1OyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTA3OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTQwOyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTg0OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+ODA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2Mjg7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2NzI7IH07IGJ1Zi5wdXNoKCcnKTs2NzI7IH0gZWxzZSBpZiAocGFnZSA9PSA1KSB7OyBidWYucHVzaCgnICAnKTs2NzI7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjIwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg2OTgsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzE2OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDc0MiwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTIxPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzYwOyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDc4NiwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTM0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODA0OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDgxMywgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODE0LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjI3MFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODM4LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg4NDAsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj42MDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDg0OSwgIG1zZy5zdGVwKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzg2NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjg8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDg5MywgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDg5NCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg4OTgsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIzMjBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDkyMCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoOTIyLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NjA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg5MzEsICBtc2cuc3RlcCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs5NDk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoOTUwLCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnXCI+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk1MSwgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk1MiwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkFSRzFcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjE5MFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTY3LCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTY4LCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoOTcwLCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19pZlwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiSUYwXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19jb21wYXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPkdUPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoOTc4LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4wPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE8wXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlBFTlwiPnBlbkRvd248L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TVVMVElQTFk8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTAwOSwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTMwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTAyNiwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPkRJVklERTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTgwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNDIsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDEwNDksICBtc2cuZHJhd0FUcmVlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxMDUwLCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxMDUxLCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1JTlVTPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA1OCwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNzAsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlBFTlwiPnBlblVwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVCYWNrd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NVUxUSVBMWTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTEwMSwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzExMjU7IH07IGJ1Zi5wdXNoKCcnKTsxMTI1OyB9OyBidWYucHVzaCgnJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBTZXRzIEJsb2NrbHlBcHAgY29uc3RhbnRzIHRoYXQgZGVwZW5kIG9uIHRoZSBwYWdlIGFuZCBsZXZlbC5cbiAqIFRoaXMgZW5jYXBzdWxhdGVzIG1hbnkgZnVuY3Rpb25zIHVzZWQgZm9yIFN0dWRpb0FwcC5yZXF1aXJlZEJsb2Nrc18uXG4gKiBJbiB0aGUgZnV0dXJlLCBzb21lIG9mIHRoZXNlIG1heSBiZSBtb3ZlZCB0byBjb21tb24uanMuXG4gKi9cblxudmFyIHJlcXVpcmVkQmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL3JlcXVpcmVkX2Jsb2NrX3V0aWxzJyk7XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd19hX3NxdWFyZSBibG9jayBvbiBwYWdlIDIuXG5mdW5jdGlvbiBkcmF3QVNxdWFyZShudW1iZXIpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnZHJhd19hX3NxdWFyZScsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfYV9zcXVhcmUnLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihudW1iZXIpfX07XG59XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd19hX3Nub3dtYW4gYmxvY2sgb24gcGFnZSAyLlxuZnVuY3Rpb24gZHJhd0FTbm93bWFuKG51bWJlcikge1xuICByZXR1cm4ge3Rlc3Q6ICdkcmF3X2Ffc25vd21hbicsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfYV9zbm93bWFuJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIobnVtYmVyKX19O1xufVxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwuXG52YXIgTU9WRV9GT1JXQVJEX0lOTElORSA9IHt0ZXN0OiAnbW92ZUZvcndhcmQnLCB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50J307XG5cbi8vIGFsbG93IG1vdmUgZm9yd2FyZCBvciBiYWNrd2FyZCwgYnV0IHNob3cgZm9yd2FyZCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxudmFyIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUgPSB7XG4gIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZV9ieV9jb25zdGFudCc7XG4gIH0sXG4gIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwgd2l0aCB0aGUgZ2l2ZW4gcGl4ZWwgbnVtYmVyLlxudmFyIG1vdmVGb3J3YXJkSW5saW5lID0gZnVuY3Rpb24ocGl4ZWxzKSB7XG4gIHJldHVybiB7dGVzdDogJ21vdmVGb3J3YXJkJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBwaXhlbHN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbC5cbnZhciBNT1ZFX0JBQ0tXQVJEX0lOTElORSA9IHt0ZXN0OiAnbW92ZUJhY2t3YXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXM6IHsnRElSJzogJ21vdmVCYWNrd2FyZCd9fTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYSBbcmlnaHRdIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrXG4vLyBhbmQgY3JlYXRlcyB0aGUgYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkL3JlY29tbWVuZGVkIG51bWJlciBvZiBkZWdyZWVzIGFzXG4vLyBpdHMgaW5wdXQuICBUaGUgcmVzdHJpY3RlZCB0dXJuIGlzIHVzZWQgb24gdGhlIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZVxuLy8gdHV0b3JpYWwuXG52YXIgdHVyblJpZ2h0UmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAndHVyblJpZ2h0KCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhIFtsZWZ0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9ja1xuLy8gYW5kIGNyZWF0ZXMgdGhlIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZC9yZWNvbW1lbmRlZCBudW1iZXIgb2YgZGVncmVlcyBhc1xuLy8gaXRzIGlucHV0LiAgVGhlIHJlc3RyaWN0ZWQgdHVybiBpcyB1c2VkIG9uIHRoZSBlYXJsaWVyIGxldmVscyBvZiB0aGVcbi8vIHR1dG9yaWFsLlxudmFyIHR1cm5MZWZ0UmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAndHVybkxlZnQoJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBbcmlnaHRdIGRyYXdfdHVybl9ieV9jb25zdGFudCBibG9ja1xuLy8gd2l0aCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC5cbnZhciB0dXJuUmlnaHRCeUNvbnN0YW50ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50JyAmJlxuICAgICAgICAgIChkZWdyZWVzID09PSAnPz8/JyB8fFxuICAgICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQudmFsdWVUb0NvZGUoXG4gICAgICAgICAgICAgYmxvY2ssICdWQUxVRScsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9OT05FKSA9PSBkZWdyZWVzKTtcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgW3JpZ2h0XSBkcmF3X3R1cm4gYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkXG4vLyBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuICBGb3IgdGhlIGVhcmxpZXN0IGxldmVscywgdGhlIG1ldGhvZFxuLy8gdHVyblJpZ2h0UmVzdHJpY3RlZCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLlxudmFyIHR1cm5SaWdodCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybicgJiZcbiAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnRElSJykgPT0gJ3R1cm5SaWdodCc7XG4gICAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHRpdGxlczogeydESVInOiAndHVyblJpZ2h0J30sXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRlZ3JlZXMpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBsZWZ0IGRyYXdfdHVybiBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWRcbi8vIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC4gIFRoaXMgbWV0aG9kIGlzIG5vdCBhcHByb3ByaWF0ZSBmb3IgdGhlXG4vLyBlYXJsaWVzdCBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLCB3aGljaCBkbyBub3QgcHJvdmlkZSBkcmF3X3R1cm4uXG52YXIgdHVybkxlZnQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nICYmXG4gICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ0RJUicpID09ICd0dXJuTGVmdCc7XG4gICAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHRpdGxlczogeydESVInOiAndHVybkxlZnQnfSxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGVncmVlcyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbnkgZHJhd19tb3ZlIGJsb2NrIGFuZCwgaWYgbm90IHByZXNlbnQsIGNyZWF0ZXNcbi8vIG9uZSB3aXRoIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UuXG52YXIgbW92ZSA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIHJldHVybiB7dGVzdDogZnVuY3Rpb24oYmxvY2spIHtyZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlJzsgfSxcbiAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGlzdGFuY2UpfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrLlxudmFyIGRyYXdUdXJuUmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJztcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc31cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd190dXJuIGJsb2NrLlxudmFyIGRyYXdUdXJuID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKCc/Pz8nKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgXCJzZXQgY29sb3VyXCIgYmxvY2sgd2l0aCBhIGNvbG91ciBwaWNrZXJcbi8vIGFzIGl0cyBpbnB1dC5cbnZhciBTRVRfQ09MT1VSX1BJQ0tFUiA9IHt0ZXN0OiAncGVuQ29sb3VyKFxcJyMnLFxuICB0eXBlOiAnZHJhd19jb2xvdXInLFxuICB2YWx1ZXM6IHsnQ09MT1VSJzogJzxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+J319O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFwic2V0IGNvbG91clwiIGJsb2NrIHdpdGggYSByYW5kb20gY29sb3VyXG4vLyBnZW5lcmF0b3IgYXMgaXRzIGlucHV0LlxudmFyIFNFVF9DT0xPVVJfUkFORE9NID0ge3Rlc3Q6ICdwZW5Db2xvdXIoY29sb3VyX3JhbmRvbScsXG4gIHR5cGU6ICdkcmF3X2NvbG91cicsXG4gIHZhbHVlczogeydDT0xPVVInOiAnPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz4nfX07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlcXVpcmVkIGJsb2NrIHNwZWNpZmljYXRpb24gZm9yIGRlZmluaW5nIGEgZnVuY3Rpb24gd2l0aCBhblxuICogYXJndW1lbnQuICBVbmxpa2UgdGhlIG90aGVyIGZ1bmN0aW9ucyB0byBjcmVhdGUgcmVxdWlyZWQgYmxvY2tzLCB0aGlzXG4gKiBpcyBkZWZpbmVkIG91dHNpZGUgb2YgVHVydGxlLnNldEJsb2NrbHlBcHBDb25zdGFudHMgYmVjYXVzZSBpdCBpcyBhY2Nlc3NlZFxuICogd2hlbiBjaGVja2luZyBmb3IgYSBwcm9jZWR1cmUgb24gbGV2ZWxzIDgtOSBvZiBUdXJ0bGUgMy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jX25hbWUgVGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZ19uYW1lIFRoZSBuYW1lIG9mIHRoZSBzaW5nbGUgYXJndW1lbnQuXG4gKiBAcmV0dXJuIEEgcmVxdWlyZWQgYmxvY2sgc3BlY2lmaWNhdGlvbiB0aGF0IHRlc3RzIGZvciBhIGNhbGwgb2YgdGhlXG4gKiAgICAgc3BlY2lmaWVkIGZ1bmN0aW9uIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudCBuYW1lLiAgSWYgbm90IHByZXNlbnQsXG4gKiAgICAgdGhpcyBjb250YWlucyB0aGUgaW5mb3JtYXRpb24gdG8gY3JlYXRlIHN1Y2ggYSBibG9jayBmb3IgZGlzcGxheS5cbiAqL1xudmFyIGRlZmluZVdpdGhBcmcgPSBmdW5jdGlvbihmdW5jX25hbWUsIGFyZ19uYW1lKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdwcm9jZWR1cmVzX2RlZm5vcmV0dXJuJyAmJlxuICAgICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBmdW5jX25hbWUgJiZcbiAgICAgICAgICBibG9jay5wYXJhbWV0ZXJOYW1lc18gJiYgYmxvY2sucGFyYW1ldGVyTmFtZXNfLmxlbmd0aCAmJlxuICAgICAgICAgIGJsb2NrLnBhcmFtZXRlck5hbWVzX1swXSA9PSBhcmdfbmFtZTtcbiAgICB9LFxuICAgIHR5cGU6ICdwcm9jZWR1cmVzX2RlZm5vcmV0dXJuJyxcbiAgICB0aXRsZXM6IHsnTkFNRSc6IGZ1bmNfbmFtZX0sXG4gICAgZXh0cmE6ICc8bXV0YXRpb24+PGFyZyBuYW1lPVwiJyArIGFyZ19uYW1lICsgJ1wiPjwvYXJnPjwvbXV0YXRpb24+J1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ha2VNYXRoTnVtYmVyOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIsXG4gIHNpbXBsZUJsb2NrOiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2ssXG4gIHJlcGVhdDogcmVxdWlyZWRCbG9ja1V0aWxzLnJlcGVhdCxcbiAgZHJhd0FTcXVhcmU6IGRyYXdBU3F1YXJlLFxuICBkcmF3QVNub3dtYW46IGRyYXdBU25vd21hbixcbiAgTU9WRV9GT1JXQVJEX0lOTElORTogTU9WRV9GT1JXQVJEX0lOTElORSxcbiAgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORTogTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSxcbiAgbW92ZUZvcndhcmRJbmxpbmU6IG1vdmVGb3J3YXJkSW5saW5lLFxuICBNT1ZFX0JBQ0tXQVJEX0lOTElORTogTU9WRV9CQUNLV0FSRF9JTkxJTkUsXG4gIHR1cm5MZWZ0UmVzdHJpY3RlZDogdHVybkxlZnRSZXN0cmljdGVkLFxuICB0dXJuUmlnaHRSZXN0cmljdGVkOiB0dXJuUmlnaHRSZXN0cmljdGVkLFxuICB0dXJuUmlnaHRCeUNvbnN0YW50OiB0dXJuUmlnaHRCeUNvbnN0YW50LFxuICB0dXJuUmlnaHQ6IHR1cm5SaWdodCxcbiAgdHVybkxlZnQ6IHR1cm5MZWZ0LFxuICBtb3ZlOiBtb3ZlLFxuICBkcmF3VHVyblJlc3RyaWN0ZWQ6IGRyYXdUdXJuUmVzdHJpY3RlZCxcbiAgZHJhd1R1cm46IGRyYXdUdXJuLFxuICBTRVRfQ09MT1VSX1BJQ0tFUjogU0VUX0NPTE9VUl9QSUNLRVIsXG4gIFNFVF9DT0xPVVJfUkFORE9NOiBTRVRfQ09MT1VSX1JBTkRPTSxcbiAgZGVmaW5lV2l0aEFyZzogZGVmaW5lV2l0aEFyZyxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIHsnZnVuYyc6ICdtb3ZlRm9yd2FyZCcsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiMTAwXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuICB7J2Z1bmMnOiAndHVyblJpZ2h0JywgJ2NhdGVnb3J5JzogJ0FydGlzdCcsICdwYXJhbXMnOiBbXCI5MFwiXSwgJ2lkQXJnTGFzdCc6IHRydWUgfSxcbiAgeydmdW5jJzogJ3BlbkNvbG91cicsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiJyNmZjAwMDAnXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuICB7J2Z1bmMnOiAncGVuV2lkdGgnLCAnY2F0ZWdvcnknOiAnQXJ0aXN0JywgJ3BhcmFtcyc6IFtcIjFcIl0sICdpZEFyZ0xhc3QnOiB0cnVlIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnQXJ0aXN0Jzoge1xuICAgICdjb2xvcic6ICdyZWQnLFxuICAgICdibG9ja3MnOiBbXVxuICB9LFxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cInNsaWRlci1jZWxsXCI+XFxuICA8c3ZnIGlkPVwic2xpZGVyXCJcXG4gICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXFxuICAgICAgIHhtbG5zOnN2Zz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcXG4gICAgICAgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCJcXG4gICAgICAgdmVyc2lvbj1cIjEuMVwiXFxuICAgICAgIHdpZHRoPVwiMTUwXCJcXG4gICAgICAgaGVpZ2h0PVwiNTBcIj5cXG4gICAgICA8IS0tIFNsb3cgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwic2xvd0NsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTIgeD01IHk9MTQgLz5cXG4gICAgICA8L2NsaXBQYXRoPlxcbiAgICAgIDxpbWFnZSB4bGluazpocmVmPVwiJywgZXNjYXBlKCgxMywgIGFzc2V0VXJsKCdtZWRpYS90dXJ0bGUvaWNvbnMucG5nJykgKSksICdcIiBoZWlnaHQ9NDIgd2lkdGg9ODQgeD0tMjEgeT0tMTBcXG4gICAgICAgICAgY2xpcC1wYXRoPVwidXJsKCNzbG93Q2xpcFBhdGgpXCIgLz5cXG4gICAgICA8IS0tIEZhc3QgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwiZmFzdENsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTYgeD0xMjAgeT0xMCAvPlxcbiAgICAgIDwvY2xpcFBhdGg+XFxuICAgICAgPGltYWdlIHhsaW5rOmhyZWY9XCInLCBlc2NhcGUoKDE5LCAgYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS9pY29ucy5wbmcnKSApKSwgJ1wiIGhlaWdodD00MiB3aWR0aD04NCB4PTEyMCB5PS0xMVxcbiAgICAgICAgICBjbGlwLXBhdGg9XCJ1cmwoI2Zhc3RDbGlwUGF0aClcIiAvPlxcbiAgPC9zdmc+XFxuICA8aW1nIGlkPVwic3Bpbm5lclwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvdHVydGxlL2xvYWRpbmcuZ2lmJykgKSksICdcIiBoZWlnaHQ9MTUgd2lkdGg9MTU+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBBIHNldCBvZiBibG9ja3MgdXNlZCBieSBzb21lIG9mIG91ciBjdXN0b20gbGV2ZWxzIChpLmUuIGJ1aWx0IGJ5IGxldmVsIGJ1aWxkZXIpXG4gKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuIGluc3RhbGxEcmF3QVNxdWFyZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbENyZWF0ZUFDaXJjbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlQnJhbmNoKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FUcmlhbmdsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBSG91c2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUZsb3dlcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBU25vd2ZsYWtlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FIZXhhZ29uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FTdGFyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSb2JvdChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUm9ja2V0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FQbGFuZXQoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJob21idXMoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3VXBwZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0xvd2VyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG5cbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZURyb3Bkb3duKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUFDaXJjbGVDb2RlIChzaXplLCBnZW5zeW0sIGluZGVudCkge1xuICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgaW5kZW50ID0gaW5kZW50IHx8ICcnO1xuICByZXR1cm4gW1xuICAgIGluZGVudCArICcvLyBjcmVhdGVfYV9jaXJjbGUnLFxuICAgIGluZGVudCArICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzNjsgJyArXG4gICAgaW5kZW50ICsgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgaW5kZW50ICsgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyBzaXplICsgJyk7JyxcbiAgICBpbmRlbnQgKyAnICBUdXJ0bGUudHVyblJpZ2h0KDEwKTsnLFxuICAgIGluZGVudCArICd9XFxuJ10uam9pbignXFxuJyk7XG59XG5cblxuLyoqXG4gKiBTYW1lIGFzIGRyYXdfYV9zcXVhcmUsIGV4Y2VwdCBpbnB1dHMgYXJlIG5vdCBpbmxpbmVkXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNxdWFyZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmVfY3VzdG9tID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FTcXVhcmUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3F1YXJlX2N1c3RvbSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV9zcXVhcmUnLFxuICAgICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgNDsgJyArXG4gICAgICAgICAgICAgIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogY3JlYXRlX2FfY2lyY2xlIGFuZCBjcmVhdGVfYV9jaXJjbGVfc2l6ZVxuICogZmlyc3QgZGVmYXVsdHMgdG8gc2l6ZSAxMCwgc2Vjb25kIHByb3ZpZGVzIGEgc2l6ZSBwYXJhbVxuICovXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQUNpcmNsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9jaXJjbGUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5jcmVhdGVBQ2lyY2xlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX2NpcmNsZV9zaXplID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuY3JlYXRlQUNpcmNsZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zaXplUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9jaXJjbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoMTAsIGdlbnN5bSk7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZV9zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFDaXJjbGVDb2RlKHNpemUsIGdlbnN5bSk7XG4gIH07XG59XG5cbi8qKlxuICogY3JlYXRlX2Ffc25vd2Zsb3dlclxuICovXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZUJyYW5jaChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuY3JlYXRlQVNub3dmbGFrZUJyYW5jaCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJy8vIGNyZWF0ZV9hX3Nub3dmbGFrZV9icmFuY2gnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCg5MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoNDUpOycsXG4gICAgICAnICB9JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg0NSk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBEcmF3IGEgcmhvbWJ1cyBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJob21idXMoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfcmhvbWJ1cyA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUmhvbWJ1cygpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yaG9tYnVzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDI7ICcgK1xuICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxMjApOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVRyaWFuZ2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3RyaWFuZ2xlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FUcmlhbmdsZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV90cmlhbmdsZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgdHJpYW5nbGUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FIZXhhZ29uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hleGFnb24gPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QUhleGFnb24oKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfaGV4YWdvbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDYwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBob3VzZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhvdXNlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hvdXNlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FIb3VzZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9ob3VzZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxMjApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgZmxvd2VyIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBRmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2Zsb3dlciA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBRmxvd2VyKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2Zsb3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICB2YXIgY29sb3JfcmFuZG9tID0gZ2VuZXJhdG9yLmNvbG91cl9yYW5kb20oKVswXTtcbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMjI4YjIyXCIpOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAxMDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cignICsgY29sb3JfcmFuZG9tICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgzNik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyAvIDIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUJhY2t3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnLyAyKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTk4KTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDE4MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHNub3dmbGFrZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNub3dmbGFrZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93Zmxha2UgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNub3dmbGFrZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dmbGFrZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICB2YXIgY29sb3JfcmFuZG9tID0gZ2VuZXJhdG9yLmNvbG91cl9yYW5kb20oKVswXTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDg7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5wZW5Db2xvdXIoXCIjN2ZmZmQ0XCIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDE1KTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMTUpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDMwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg0NSk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHN0YXIgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FTdGFyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3N0YXIgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVN0YXIoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3RhciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgNTsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxNDQpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDE4KTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgcm9ib3QgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FSb2JvdChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2JvdCA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUm9ib3QoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2JvdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxNSk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMzApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDIxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgxMTUpOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg1MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDUwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2NrZXQgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVJvY2tldCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICB2YXIgbG9vcFZhcjIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjZmYwMDAwXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDAwMFwiKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdUdXJ0bGUuanVtcEZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHBsYW5ldCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVBsYW5ldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9wbGFuZXQgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVBsYW5ldCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9wbGFuZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzgwODA4MFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM2MDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVCYWNrd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMSk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyB1cHBlciB3YXZlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdVcHBlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3VwcGVyX3dhdmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3VXBwZXJXYXZlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd191cHBlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgbG93ZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19sb3dlcl93YXZlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0xvd2VyV2F2ZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbG93ZXJfd2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZURyb3Bkb3duKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIHZhciBzbm93Zmxha2VzID0gW1xuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3F1YXJlKCksICdzcXVhcmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVBhcmFsbGVsb2dyYW0oKSwgJ3BhcmFsbGVsb2dyYW0nXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUxpbmUoKSwgJ2xpbmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVNwaXJhbCgpLCAnc3BpcmFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGbG93ZXIoKSwgJ2Zsb3dlciddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlRnJhY3RhbCgpLCAnZnJhY3RhbCddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUmFuZG9tKCksICdyYW5kb20nXVxuICBdO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9zbm93Zmxha2VfZHJvcGRvd24gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihzbm93Zmxha2VzKSwgJ1RZUEUnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX3Nub3dmbGFrZV9kcm9wZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiBcIlR1cnRsZS5kcmF3U25vd2ZsYWtlKCdcIiArIHR5cGUgKyBcIicsICdibG9ja19pZF9cIiArIHRoaXMuaWQgKyBcIicpO1wiO1xuICB9O1xufVxuIiwiLy8gbG9jYWxlIGZvciB0dXJ0bGVcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkudHVydGxlX2xvY2FsZTtcbiIsIi8vIENyZWF0ZSBhIGxpbWl0ZWQgY29sb3VyIHBhbGV0dGUgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIG5ldyB1c2Vyc1xuLy8gYW5kIHRvIG1ha2UgY29sb3VyIGNoZWNraW5nIGVhc2llci4gIFRoZXNlIGRlZmluaXRpb25zIGNhbm5vdCBiZVxuLy8gbW92ZWQgdG8gYmxvY2tzLmpzLCB3aGljaCBpcyBsb2FkZWQgbGF0ZXIsIHNpbmNlIHRoZXkgYXJlIHVzZWQgaW5cbi8vIHRvcC1sZXZlbCBkZWZpbml0aW9ucyBiZWxvdy4gIE5vdGUgdGhhdCB0aGUgaGV4IGRpZ2l0cyBhLWYgYXJlXG4vLyBsb3dlci1jYXNlLiAgVGhpcyBpcyBhc3N1bWVkIGluIGNvbXBhcmlzb25zIGJlbG93LlxudmFyIENvbG91cnMgPSB7XG4gIEJMQUNLOiAnIzAwMDAwMCcsXG4gIEdSRVk6ICcjODA4MDgwJyxcbiAgS0hBS0k6ICcjYzNiMDkxJyxcbiAgV0hJVEU6ICcjZmZmZmZmJyxcbiAgUkVEOiAnI2ZmMDAwMCcsXG4gIFBJTks6ICcjZmY3N2ZmJyxcbiAgT1JBTkdFOiAnI2ZmYTAwMCcsXG4gIFlFTExPVzogJyNmZmZmMDAnLFxuICBHUkVFTjogJyMyMjhiMjInLFxuICBCTFVFOiAnIzAwMDBjZCcsXG4gIEFRVUFNQVJJTkU6ICcjN2ZmZmQ0JyxcbiAgUExVTTogJyM4NDMxNzknLFxuXG4gIEZST1pFTjE6IFwiI2QwZmRmZFwiLFxuICBGUk9aRU4yOiBcIiNkMGZkZDBcIixcbiAgRlJPWkVOMzogXCIjZDBkMGZkXCIsXG4gIEZST1pFTjQ6IFwiI2UwZTBlMFwiLFxuICBGUk9aRU41OiAnI2ZmZmZmZicsXG4gIEZST1pFTjY6IFwiI2U4ZThlOFwiLFxuICBGUk9aRU43OiBcIiNiYmQxZTRcIixcbiAgRlJPWkVOODogXCIjZmRkMGZkXCIsXG4gIEZST1pFTjk6IFwiI2FlYTRmZlwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG91cnM7XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTMgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNhbXBsZSBhbnN3ZXJzIGZvciBUdXJ0bGUgbGV2ZWxzLiBVc2VkIGZvciBwcm9tcHRzIGFuZCBtYXJraW5nLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIEFydGlzdEFQSSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgYXBpID0gbmV3IEFydGlzdEFQSSgpO1xuXG52YXIgc2V0UmFuZG9tVmlzaWJsZUNvbG91ciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMiwgMjQpKTtcbiAgLy8gTWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBjb21wb25lbnQgaXMgYmVsb3cgMHg4MCBhbmQgdGhlIHJlc3RcbiAgLy8gYmVsb3cgMHhBMCwgdG8gcHJldmVudCB0b28gbGlnaHQgb2YgY29sb3Vycy5cbiAgbnVtICY9IDB4OWY3ZjlmO1xuICB2YXIgY29sb3VyID0gJyMnICsgKCcwMDAwMCcgKyBudW0udG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xuICBhcGkucGVuQ29sb3VyKGNvbG91cik7XG59O1xuXG52YXIgZHJhd1NxdWFyZSA9IGZ1bmN0aW9uKGxlbmd0aCwgcmFuZG9tX2NvbG91cikge1xuICBmb3IgKHZhciBjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xuICAgIGlmIChyYW5kb21fY29sb3VyKSB7XG4gICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgfVxuICAgIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICB9XG59O1xuXG52YXIgZHJhd1RyaWFuZ2xlID0gZnVuY3Rpb24obGVuZ3RoLCByYW5kb21fY29sb3VyKSB7XG4gIGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCAzOyBjb3VudCsrKSB7XG4gICAgaWYgKHJhbmRvbV9jb2xvdXIpIHtcbiAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICB9XG4gICAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gICAgYXBpLnR1cm5SaWdodCgxMjApO1xuICB9XG59O1xuXG52YXIgZHJhd1Nub3dtYW4gPSBmdW5jdGlvbihoZWlnaHQpIHtcbiAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgdmFyIGRpc3RhbmNlcyA9IFtoZWlnaHQgKiAwLjUsIGhlaWdodCAqIDAuMywgaGVpZ2h0ICogMC4yXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICB2YXIgZGlzdGFuY2UgPSBkaXN0YW5jZXNbaSA8IDMgPyBpIDogNSAtIGldIC8gNTcuNTtcbiAgICBmb3IgKHZhciBkID0gMDsgZCA8IDE4MDsgZCArPSAyKSB7XG4gICAgICBhcGkubW92ZUZvcndhcmQoZGlzdGFuY2UpO1xuICAgICAgYXBpLnR1cm5SaWdodCgyKTtcbiAgICB9XG4gICAgaWYgKGkgIT0gMikge1xuICAgICAgYXBpLnR1cm5SaWdodCgxODApO1xuICAgIH1cbiAgfVxuICBhcGkudHVybkxlZnQoOTApO1xufTtcblxudmFyIGRyYXdIb3VzZSA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICBkcmF3U3F1YXJlKGxlbmd0aCk7XG4gIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICBhcGkudHVyblJpZ2h0KDMwKTtcbiAgZHJhd1RyaWFuZ2xlKGxlbmd0aCk7XG4gIGFwaS50dXJuUmlnaHQoNjApO1xuICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgYXBpLm1vdmVCYWNrd2FyZChsZW5ndGgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb2cgb2YgYSBzYW1wbGUgc29sdXRpb25zIGZvciBlYWNoIGxldmVsLlxuICogVG8gY3JlYXRlIGFuIGFuc3dlciwganVzdCBzb2x2ZSB0aGUgbGV2ZWwgaW4gQmxvY2tseSwgdGhlbiBwYXN0ZSB0aGVcbiAqIHJlc3VsdGluZyBKYXZhU2NyaXB0IGhlcmUsIG1vdmluZyBhbnkgZnVuY3Rpb25zIHRvIHRoZSBiZWdpbm5pbmcgb2ZcbiAqIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydHMuYW5zd2VyID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgYXBpLmxvZyA9IFtdO1xuICB2YXIgY291bnQsIHNpZGVJZHgsIGxlbjtcbiAgaWYgKHBhZ2UgPT0gMSkge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRWwuXG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBTcXVhcmUuXG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDAsIGZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIFVzZSByZXBlYXQgdG8gZHJhdyBhIHNxdWFyZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDAsIGZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIEVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwLCB0cnVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIC8vIFNpZGV3YXlzIGVudmVsb3BlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy8gVHJpYW5nbGUgYW5kIHNxdWFyZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGFwaS50dXJuUmlnaHQoMTgwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gR2xhc3Nlcy5cbiAgICAgICAgYXBpLnBlbkNvbG91cignIzAwY2MwMCcpOyAgLy8gYmx1ZVxuICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBhcGkubW92ZUJhY2t3YXJkKDE1MCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIC8vIFNwaWt5LlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCA4OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS5tb3ZlQmFja3dhcmQoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDQ1KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgLy8gQ2lyY2xlLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjA7IGNvdW50KyspIHtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMSk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBTaW5nbGUgc3F1YXJlIGluIHNvbWUgY29sb3IuXG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gU2luZ2xlIGdyZWVuIHNxdWFyZS5cbiAgICAgICAgYXBpLnBlbkNvbG91cignIzAwZmYwMCcpOyAgLy8gZ3JlZW5cbiAgICAgICAgZHJhd1NxdWFyZSg1MCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBUaHJlZSBzcXVhcmVzLCAxMjAgZGVncmVlcyBhcGFydCwgaW4gcmFuZG9tIGNvbG9ycy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMzsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxMjApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyAzNiBzcXVhcmVzLCAxMCBkZWdyZWVzIGFwYXJ0LCBpbiByYW5kb20gY29sb3JzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6ICAvLyBEcmF3IHdpdGhvdXQgdXNpbmcgZm9yLWxvb3AuICAoRmFsbCB0aHJvdWdoIHRvIG5leHQgY2FzZS4pXG4gICAgICBjYXNlIDY6XG4gICAgICAgIC8vIFNxdWFyZXMgd2l0aCBzaWRlcyBvZiA1MCwgNjAsIDcwLCA4MCwgYW5kIDkwIHBpeGVscy5cbiAgICAgICAgZm9yIChsZW4gPSA1MDsgbGVuIDw9IDkwOyBsZW4gKz0gMTApIHtcbiAgICAgICAgICBkcmF3U3F1YXJlKGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIC8vIE1pbmktc3BpcmFsLlxuICAgICAgICBmb3IgKGxlbiA9IDI1OyBsZW4gPD0gNjA7IGxlbiArPSA1KSB7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKGxlbik7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDcuNTpcbiAgICAgICAgZHJhd1Nub3dtYW4oMjUwKTtcbiAgICAgICAgZHJhd1Nub3dtYW4oMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIC8vIFNhbWUtaGVpZ2h0IHNub3dtZW4uXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTbm93bWFuKDE1MCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgICAgYXBpLmp1bXBGb3J3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgLy8gRGlmZmVyZW50IGhlaWdodCBzbm93bWVuLlxuICAgICAgICBmb3IgKHZhciBoZWlnaHQgPSAxMTA7IGhlaWdodCA+PSA3MDsgaGVpZ2h0IC09IDEwKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTbm93bWFuKGhlaWdodCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgICAgYXBpLmp1bXBGb3J3YXJkKDYwKTtcbiAgICAgICAgICBhcGkudHVybkxlZnQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDMpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIERyYXcgYSB0cmlhbmdsZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gRHJhdyBhIGhvdXNlIHVzaW5nIFwiZHJhdyBhIHNxdWFyZVwiIGFuZCBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIC8vIERyYXcgYSBob3VzZSB1c2luZyBhIGZ1bmN0aW9uLlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgyMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gQWRkIGEgcGFyYW1ldGVyIHRvIHRoZSBcImRyYXcgYSBob3VzZVwiIHByb2NlZHVyZS5cbiAgICAgICAgZHJhd0hvdXNlKDE1MCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgZHJhd0hvdXNlKDE1MCk7XG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgZm9yIChjb3VudCA9IDUwOyBjb3VudCA8PSAxNTA7IGNvdW50ICs9IDUwKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdIb3VzZShjb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRHJhdyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBEcmF3IHR3byBlcXVpbGF0ZXJhbCB0cmlhbmdsZXMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDI7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIERyYXcgZm91ciBlcXVpbGF0ZXJhbCB0cmlhbmdsZXMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMzYpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDQ7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDQ7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoODApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTA6XG4gICAgICAgIGZvciAoc2lkZUlkeCA9IDA7IHNpZGVJZHggPCA5OyBzaWRlSWR4KyspIHtcbiAgICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDgwKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcGkubG9nO1xufTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBBcnRpc3QgQVBJIGxvZ2ljLiBUaGUgbWV0aG9kcyBvbiB0aGlzIG9iamVjdCBhcmUgY2FsbGVkIGJ5XG4gKiBnZW5lcmF0ZWQgdXNlciBjb2RlLiBBcyB0aGV5IGFyZSBjYWxsZWQsIHRoZXkgaW5zZXJ0IGNvbW1hbmRzIGludG8gdGhpcy5sb2cuXG4gKiBOT1RFOiB0aGlzLmxvZyBpcyBhbHNvIG1vZGlmaWVkIGluIHNvbWUgY2FzZXMgZXh0ZXJuYWxseSAoYm90aCBhY2Nlc3NlZCBhbmRcbiAqIEkgdGhpbmsgY2xlYXJlZCkuXG4gKi9cbnZhciBBcnRpc3RBUEkgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubG9nID0gW107XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFydGlzdEFQSTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3Q2lyY2xlID0gZnVuY3Rpb24gKHNpemUsIGlkKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzY7IGkrKykge1xuICAgIHRoaXMubW92ZUZvcndhcmQoc2l6ZSwgaWQpO1xuICAgIHRoaXMudHVyblJpZ2h0KDEwLCBpZCk7XG4gIH1cbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZHJhd1Nub3dmbGFrZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICB2YXIgaSwgaiwgaztcblxuICAvLyBtaXJvcnMgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uXG4gIHZhciByYW5kb21fY29sb3VyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb2xvcnMgPSBCbG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlM7XG4gICAgcmV0dXJuIGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY29sb3JzLmxlbmd0aCldO1xuICB9O1xuXG4gIGlmICh0eXBlID09PSAncmFuZG9tJykge1xuICAgIHR5cGUgPSBfLnNhbXBsZShbJ2ZyYWN0YWwnLCAnZmxvd2VyJywgJ3NwaXJhbCcsICdsaW5lJywgJ3BhcmFsbGVsb2dyYW0nLCAnc3F1YXJlJ10pO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpIHtcbiAgICBjYXNlICdmcmFjdGFsJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgdGhpcy5qdW1wRm9yd2FyZCg0NSwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5MZWZ0KDQ1LCBpZCk7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgMzsgaysrKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgICB0aGlzLm1vdmVCYWNrd2FyZCgxNSwgaWQpO1xuICAgICAgICAgICAgdGhpcy50dXJuUmlnaHQoNDUsIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50dXJuTGVmdCg5MCwgaWQpO1xuICAgICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuTGVmdCg0NSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDkwLCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2Zsb3dlcic6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSgyLCBpZCk7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSg0LCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDcyLCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3NwaXJhbCc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICB0aGlzLmRyYXdDaXJjbGUoMywgaWQpO1xuICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDIwLCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDE4LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDkwOyBpKyspIHtcbiAgICAgICAgdGhpcy5wZW5Db2xvdXIocmFuZG9tX2NvbG91cigpKTtcbiAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCg1MCwgaWQpO1xuICAgICAgICB0aGlzLm1vdmVCYWNrd2FyZCg1MCwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5SaWdodCg0LCBpZCk7XG4gICAgICB9XG4gICAgICB0aGlzLnBlbkNvbG91cihcIiNGRkZGRkZcIiwgaWQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwYXJhbGxlbG9ncmFtJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAyOyBqKyspIHtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoNjAsIGlkKTtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoMTIwLCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMzYsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoOTAsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCgzNiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlRm9yd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnRkQnLCBkaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZUJhY2t3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydGRCcsIC1kaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZVVwID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlRG93biA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMTgwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlTGVmdCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMjcwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlUmlnaHQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDkwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wVXAgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAxODAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAyNzAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgOTAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRicsIGRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pGJywgLWRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS50dXJuUmlnaHQgPSBmdW5jdGlvbihhbmdsZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1JUJywgYW5nbGUsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnR1cm5MZWZ0ID0gZnVuY3Rpb24oYW5nbGUsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydSVCcsIC1hbmdsZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZ2xvYmFsQWxwaGEgPSBmdW5jdGlvbiAoYWxwaGEsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydHQScsIGFscGhhLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5VcCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQVScsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbkRvd24gPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUEQnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5XaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFcnLCBNYXRoLm1heCh3aWR0aCwgMCksIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbkNvbG91ciA9IGZ1bmN0aW9uKGNvbG91ciwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BDJywgY29sb3VyLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5QYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BTJywgcGF0dGVybiwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuaGlkZVR1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydIVCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnNob3dUdXJ0bGUgPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnU1QnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3U3RhbXAgPSBmdW5jdGlvbihzdGFtcCwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ3N0YW1wJywgc3RhbXAsIGlkXSk7XG59O1xuIl19
