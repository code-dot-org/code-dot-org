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
      annaLine_2x: skin.assetUrl('annaline_2x.png'),
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skin.assetUrl('annaline-menuicon.png'), 'annaLine']]
    },

    elsa: {
      speedModifier: 10,
      turtleNumFrames: 20,
      decorationAnimationNumFrames: 19,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      elsaLine: skin.assetUrl('elsaline.png'),
      elsaLine_2x: skin.assetUrl('elsaline_2x.png'),
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skin.assetUrl('elsaline-menuicon.png'), 'elsaLine']]
    },

    artist: {
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skin.rainbowMenu, 'rainbowLine'], [skin.ropeMenu, 'ropeLine'], [skin.squigglyMenu, 'squigglyLine'], [skin.swirlyMenu, 'swirlyLine']]
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

  // Declare available line style patterns. This array of arrays is eventually used
  // to populate the image dropdown in the Set Pattern block.

  // All skins have the default line style (solid coloured line)
  var lineStylePatternOptions = [[skin.patternDefault, 'DEFAULT']];

  // If the skin provided line patterns, add them to the pattern set
  if (config && config.lineStylePatternOptions) {
    lineStylePatternOptions = lineStylePatternOptions.concat(config.lineStylePatternOptions);
  }

  skin.lineStylePatternOptions = lineStylePatternOptions;

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

  // Optionally allow some number of pixels to be off, default to
  // pixel-perfect strictness
  var permittedErrors = level.permittedErrors || 0;

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

var LENGTH_PARAM = msg.lengthParameter();

function createACircleCode(size, gensym, indent) {
  var loopVar = gensym('count');
  indent = indent || '';
  return [indent + '// create_a_circle', indent + 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 36; ' + indent + loopVar + '++) {', indent + '  Turtle.moveForward(' + size + ');', indent + '  Turtle.turnRight(10);', indent + '}\n'].join('\n');
}

/**
 * Returns an initialization object that sets up blockly attributes;
 *
 * @param title - The title of the block that will be visible to the user.
 * @param [parameter] - Optional parameter for blocks that accept a value
 *    parameter. This is the title of the parameter.
 * @return the initialization object
 */
function makeBlockInitializer(title, parameter) {
  return {
    init: function init() {
      this.setHSV(94, 0.84, 0.60);

      this.appendDummyInput().appendTitle(title);

      if (parameter !== undefined) {
        this.appendValueInput('VALUE').setAlign(Blockly.ALIGN_RIGHT).setCheck(Blockly.BlockValueType.NUMBER).appendTitle(parameter + ':');
      }

      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };
}

/**
 * Same as draw_a_square, except inputs are not inlined
 */
function installDrawASquare(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  var title = msg.drawASquare();

  blockly.Blocks.draw_a_square_custom = makeBlockInitializer(title, LENGTH_PARAM);

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

  var title = msg.createACircle();
  var param = msg.sizeParameter();

  blockly.Blocks.create_a_circle = makeBlockInitializer(title);

  blockly.Blocks.create_a_circle_size = makeBlockInitializer(title, param);

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

  var title = msg.createASnowflakeBranch();

  blockly.Blocks.create_a_snowflake_branch = makeBlockInitializer(title);

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

  var title = msg.drawARhombus();

  blockly.Blocks.draw_a_rhombus = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_rhombus = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 2; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(60);', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(120);', '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawATriangle(blockly, generator, gensym) {

  var title = msg.drawATriangle();

  blockly.Blocks.draw_a_triangle = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_triangle = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['// draw_a_triangle', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(120);', '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawAHexagon(blockly, generator, gensym) {

  var title = msg.drawAHexagon();

  blockly.Blocks.draw_a_hexagon = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_hexagon = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['// draw_a_triangle', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(60);', '}\n'].join('\n');
  };
}

/**
 * Draw a house function call block
 */
function installDrawAHouse(blockly, generator, gensym) {

  var title = msg.drawAHouse();

  blockly.Blocks.draw_a_house = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_house = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(90);', '}', 'Turtle.turnLeft(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnRight(90);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(120);', '}', 'Turtle.turnRight(90);', 'Turtle.moveForward(' + value_length + ');', 'Turtle.turnLeft(90);\n'].join('\n');
  };
}

/**
 * Draw a flower function call block
 */
function installDrawAFlower(blockly, generator, gensym) {

  var title = msg.drawAFlower();

  blockly.Blocks.draw_a_flower = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_flower = function () {
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

  var title = msg.drawASnowflake();

  blockly.Blocks.draw_a_snowflake = makeBlockInitializer(title);

  generator.draw_a_snowflake = function () {
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return ['for (var ' + loopVar + ' = 0; ' + loopVar + ' < 8; ' + loopVar + '++) {', '  Turtle.penColour("#7fffd4");', '  Turtle.moveForward(30);', '  Turtle.turnRight(90);', '  Turtle.moveForward(15);', '  Turtle.turnRight(90);', '  Turtle.penColour("#0000cd");', '  Turtle.moveForward(15);', '  Turtle.turnRight(90);', '  Turtle.moveForward(30);', '  Turtle.turnRight(45);', '}\n'].join('\n');
  };
}

/**
 * Draw a star function call block
 */
function installDrawAStar(blockly, generator, gensym) {

  var title = msg.drawAStar();

  blockly.Blocks.draw_a_star = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_star = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.turnRight(18);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnRight(144);', '}', 'Turtle.turnLeft(18);\n'].join('\n');
  };
}

/**
 * Draw a robot function call block
 */
function installDrawARobot(blockly, generator, gensym) {

  var title = msg.drawARobot();

  blockly.Blocks.draw_a_robot = makeBlockInitializer(title);

  generator.draw_a_robot = function () {
    var loopVar = gensym('count');

    return ['Turtle.turnLeft(90);', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {', '  Turtle.moveForward(20);', '  Turtle.turnRight(90);', '}', 'Turtle.turnRight(90);', 'Turtle.moveBackward(10);', 'Turtle.moveForward(40);', 'Turtle.turnRight(90);', 'Turtle.moveForward(80);', 'Turtle.turnRight(90);', 'Turtle.moveForward(40);', 'Turtle.turnRight(90);', 'Turtle.moveForward(80);', 'Turtle.moveBackward(15);', 'Turtle.turnLeft(120);', 'Turtle.moveForward(40);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(30);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(210);', 'Turtle.moveForward(40);', 'Turtle.moveBackward(40);', 'Turtle.turnRight(60);', 'Turtle.moveForward(115);', 'Turtle.moveBackward(50);', 'Turtle.turnRight(90);', 'Turtle.moveForward(40);', 'Turtle.turnLeft(90);', 'Turtle.moveForward(50);\n'].join('\n');
  };
}

/**
 * Draw a robot function call block
 */
function installDrawARocket(blockly, generator, gensym) {

  var title = msg.drawARocket();

  blockly.Blocks.draw_a_rocket = makeBlockInitializer(title, LENGTH_PARAM);

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

  var title = msg.drawAPlanet();

  blockly.Blocks.draw_a_planet = makeBlockInitializer(title, LENGTH_PARAM);

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

  var title = msg.drawUpperWave();

  blockly.Blocks.draw_upper_wave = makeBlockInitializer(title, LENGTH_PARAM);

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

  var title = msg.drawLowerWave();

  blockly.Blocks.draw_lower_wave = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_lower_wave = function () {
    var value_length = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return ['Turtle.penColour("#0000cd");', 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {', '  Turtle.moveForward(' + value_length + ');', '  Turtle.turnLeft(18);', '}\n'].join('\n');
  };
}

function installCreateASnowflakeDropdown(blockly, generator, gensym) {
  var snowflakes = [[msg.createSnowflakeSquare(), 'square'], [msg.createSnowflakeParallelogram(), 'parallelogram'], [msg.createSnowflakeLine(), 'line'], [msg.createSnowflakeSpiral(), 'spiral'], [msg.createSnowflakeFlower(), 'flower'], [msg.createSnowflakeFractal(), 'fractal'], [msg.createSnowflakeRandom(), 'random']];

  blockly.Blocks.create_snowflake_dropdown = {
    // We use custom initialization (instead of makeBlockInitializer) here
    // because each initialization needs a new instance of the FieldDropdown.
    init: function init() {
      this.setHSV(94, 0.84, 0.60);

      var title = new blockly.FieldDropdown(snowflakes);
      this.appendDummyInput().appendTitle(title, 'TYPE');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2Fuc3dlcnMuanMiLCJidWlsZC9qcy90dXJ0bGUvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxVQUFVLEdBQUcs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QUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQ3pCLENBQUM7Ozs7OztBQU1GLElBQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFlO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVsQixNQUFJLENBQUMsR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7OztBQUczQixNQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFD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LE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7R0FDOUI7QUFDRCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUNyQyxRQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0dBQzlCOztBQUVELE1BQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDNUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDdEMsUUFBSSxDQUFD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QUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDaEUsVUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsV0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLFdBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQzFDLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxV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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUMzREEsSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7O0FBRzVELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUMzQixTQUFPLEVB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QUMsQ0FBQztDQUN0QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3hDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3ZELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3hELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDakQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNuQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ3ZDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUN6QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2pELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDbkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLE9BQU8sRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUM1QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDNUMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNyQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBBcnRpc3QgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LnR1cnRsZU1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBhcnRpc3QgPSBuZXcgQXJ0aXN0KCk7XG5cbiAgd2luZG93Ll9fVGVzdEludGVyZmFjZS5zZXRTcGVlZFNsaWRlclZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgYXJ0aXN0LnNwZWVkU2xpZGVyLnNldFZhbHVlKHZhbHVlKTtcbiAgfTtcbiAgYXJ0aXN0LmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGFydGlzdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHZhciBDT05GSUdTID0ge1xuICAgIGFubmE6IHtcbiAgICAgIC8vIHNsaWRlciBzcGVlZCBnZXRzIGRpdmlkZWQgYnkgdGhpcyB2YWx1ZVxuICAgICAgc3BlZWRNb2RpZmllcjogMTAsXG4gICAgICB0dXJ0bGVOdW1GcmFtZXM6IDEwLFxuICAgICAgc21vb3RoQW5pbWF0ZTogdHJ1ZSxcbiAgICAgIGNvbnNvbGlkYXRlVHVybkFuZE1vdmU6IHRydWUsXG4gICAgICBhbm5hTGluZTogc2tpbi5hc3NldFVybCgnYW5uYWxpbmUucG5nJyksXG4gICAgICBhbm5hTGluZV8yeDogc2tpbi5hc3NldFVybCgnYW5uYWxpbmVfMngucG5nJyksXG4gICAgICAvLyBVc2VkIHRvIHBvcHVsYXRlIHRoZSBTZXQgUGF0dGVybiBibG9ja1xuICAgICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnM6IFtbc2tpbi5hc3NldFVybCgnYW5uYWxpbmUtbWVudWljb24ucG5nJyksICdhbm5hTGluZSddXVxuICAgIH0sXG5cbiAgICBlbHNhOiB7XG4gICAgICBzcGVlZE1vZGlmaWVyOiAxMCxcbiAgICAgIHR1cnRsZU51bUZyYW1lczogMjAsXG4gICAgICBkZWNvcmF0aW9uQW5pbWF0aW9uTnVtRnJhbWVzOiAxOSxcbiAgICAgIHNtb290aEFuaW1hdGU6IHRydWUsXG4gICAgICBjb25zb2xpZGF0ZVR1cm5BbmRNb3ZlOiB0cnVlLFxuICAgICAgZWxzYUxpbmU6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lLnBuZycpLFxuICAgICAgZWxzYUxpbmVfMng6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lXzJ4LnBuZycpLFxuICAgICAgLy8gVXNlZCB0byBwb3B1bGF0ZSB0aGUgU2V0IFBhdHRlcm4gYmxvY2tcbiAgICAgIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zOiBbW3NraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lLW1lbnVpY29uLnBuZycpLCAnZWxzYUxpbmUnXV1cbiAgICB9LFxuXG4gICAgYXJ0aXN0OiB7XG4gICAgICAvLyBVc2VkIHRvIHBvcHVsYXRlIHRoZSBTZXQgUGF0dGVybiBibG9ja1xuICAgICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnM6IFtcbiAgICAgICAgICBbc2tpbi5yYWluYm93TWVudSwgJ3JhaW5ib3dMaW5lJ10sXG4gICAgICAgICAgW3NraW4ucm9wZU1lbnUsICdyb3BlTGluZSddLFxuICAgICAgICAgIFtza2luLnNxdWlnZ2x5TWVudSwgJ3NxdWlnZ2x5TGluZSddLFxuICAgICAgICAgIFtza2luLnN3aXJseU1lbnUsICdzd2lybHlMaW5lJ11cbiAgICAgIF1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGNvbmZpZyA9IENPTkZJR1Nbc2tpbi5pZF07XG5cbiAgLy8gYmFzZSBza2luIHByb3BlcnRpZXMgaGVyZSAoY2FuIGJlIG92ZXJyaWRlbiBieSBDT05GSUcpXG4gIHNraW4uc3BlZWRNb2RpZmllciA9IDE7XG5cbiAgLy8gc3RhbXBzIGFyZW4ndCBhY3R1YWxseSB1c2VkIG9uIHByb2R1Y3Rpb24gYW55d2hlcmUgcmlnaHQgbm93LiBpZiB3ZSB3ZXJlXG4gIC8vIHRvIHdhbnQgdG8gdXNlIHRoZW0sIGRlZmluZSB0aGUgbWFwcGluZyBmcm9tIGltYWdlIHRvIG5hbWUgaGVyZS5cbiAgc2tpbi5zdGFtcFZhbHVlcyA9IFtcbiAgICBbc2tpbi5hdmF0YXIsICdERUZBVUxUJ11cbiAgXTtcblxuICAvLyBHZXQgcHJvcGVydGllcyBmcm9tIGNvbmZpZ1xuICB2YXIgaXNBc3NldCA9IC9cXC5cXFN7M30kLzsgLy8gZW5kcyBpbiBkb3QgZm9sbG93ZWQgYnkgdGhyZWUgbm9uLXdoaXRlc3BhY2UgY2hhcnNcbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWcpIHtcbiAgICBza2luW3Byb3BdID0gY29uZmlnW3Byb3BdO1xuICB9XG5cbiAgLy8gRGVjbGFyZSBhdmFpbGFibGUgbGluZSBzdHlsZSBwYXR0ZXJucy4gVGhpcyBhcnJheSBvZiBhcnJheXMgaXMgZXZlbnR1YWxseSB1c2VkXG4gIC8vIHRvIHBvcHVsYXRlIHRoZSBpbWFnZSBkcm9wZG93biBpbiB0aGUgU2V0IFBhdHRlcm4gYmxvY2suXG5cbiAgLy8gQWxsIHNraW5zIGhhdmUgdGhlIGRlZmF1bHQgbGluZSBzdHlsZSAoc29saWQgY29sb3VyZWQgbGluZSlcbiAgdmFyIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zID0gIFtbc2tpbi5wYXR0ZXJuRGVmYXVsdCwgJ0RFRkFVTFQnXV07XG5cbiAgLy8gSWYgdGhlIHNraW4gcHJvdmlkZWQgbGluZSBwYXR0ZXJucywgYWRkIHRoZW0gdG8gdGhlIHBhdHRlcm4gc2V0XG4gIGlmIChjb25maWcgJiYgY29uZmlnLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zKSB7XG4gICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucy5jb25jYXQoY29uZmlnLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zKTtcbiAgfVxuXG4gIHNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucztcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogVHVydGxlIEdyYXBoaWNzLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgY3VzdG9tTGV2ZWxCbG9ja3MgPSByZXF1aXJlKCcuL2N1c3RvbUxldmVsQmxvY2tzJyk7XG52YXIgVHVydGxlID0gcmVxdWlyZSgnLi90dXJ0bGUnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIGlmIChza2luLmlkID09IFwiYW5uYVwiIHx8IHNraW4uaWQgPT0gXCJlbHNhXCIpXG4gIHtcbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgQ29sb3Vycy5GUk9aRU4xLCBDb2xvdXJzLkZST1pFTjIsIENvbG91cnMuRlJPWkVOMyxcbiAgICAgIENvbG91cnMuRlJPWkVONCwgQ29sb3Vycy5GUk9aRU41LCBDb2xvdXJzLkZST1pFTjYsXG4gICAgICBDb2xvdXJzLkZST1pFTjcsIENvbG91cnMuRlJPWkVOOCwgQ29sb3Vycy5GUk9aRU45XTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSAzO1xuXG4gIH0gZWxzZSB7XG5cbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgLy8gUm93IDEuXG4gICAgICBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLkdSRVksXG4gICAgICBDb2xvdXJzLktIQUtJLCBDb2xvdXJzLldISVRFLFxuICAgICAgLy8gUm93IDIuXG4gICAgICBDb2xvdXJzLlJFRCwgQ29sb3Vycy5QSU5LLFxuICAgICAgQ29sb3Vycy5PUkFOR0UsIENvbG91cnMuWUVMTE9XLFxuICAgICAgLy8gUm93IDMuXG4gICAgICBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsXG4gICAgICBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xVTU5TID0gNDtcbiAgfVxuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEwMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudDtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQuVkFMVUUgPVxuICAgICAgWzMwLCA0NSwgNjAsIDkwLCAxMjAsIDEzNSwgMTUwLCAxODBdLlxuICAgICAgbWFwKGZ1bmN0aW9uKHQpIHtyZXR1cm4gW1N0cmluZyh0KSwgU3RyaW5nKHQpXTt9KTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKCksICdWQUxVRScpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZlxuICAgIC8vIHBpeGVscy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkIHNldCBvZiBhbmdsZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUUpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfY291bnRlciA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2NvdW50ZXIgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICBibG9ja2x5LkJsb2Nrcy52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfc2lkZXMgPSB7XG4gICAgLy8gVmFyaWFibGUgZ2V0dGVyLlxuICAgIGNhdGVnb3J5OiBudWxsLCAgLy8gVmFyaWFibGVzIGFyZSBoYW5kbGVkIHNwZWNpYWxseS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX0hFTFBVUkwsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9USVRMRSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbCgnc2lkZXMnKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfc2lkZXMgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNxdWFyZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3NxdWFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQykgfHwgMDtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgICAnLy8gZHJhd19hX3NxdWFyZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNub3dtYW5cIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG9cbiAgLy8gdXNlcnMgd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc25vd21hbiA9IHtcbiAgICAvLyBEcmF3IGEgY2lyY2xlIGluIGZyb250IG9mIHRoZSB0dXJ0bGUsIGVuZGluZyB1cCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNub3dtYW4oKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zbm93bWFuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNub3dtYW4gaW4gZnJvbnQgb2YgdGhlIHR1cnRsZS5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBkaXN0YW5jZXNWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlcycpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudGVyJyk7XG4gICAgdmFyIGRlZ3JlZVZhciA9IGdlbnN5bSgnZGVncmVlJyk7XG4gICAgdmFyIGRpc3RhbmNlVmFyID0gZ2Vuc3ltKCdkaXN0YW5jZScpO1xuICAgIHJldHVybiBbXG4gICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgIC8vIERvbid0IGNoYW5nZSBpdCB3aXRob3V0IGNoYW5naW5nIHJlcXVpcmVkQmxvY2tzXy5cbiAgICAgICcvLyBkcmF3X2Ffc25vd21hbicsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ3ZhciAnICsgZGlzdGFuY2VzVmFyICsgJyA9IFsnICsgdmFsdWUgKyAnICogMC41LCAnICsgdmFsdWUgKyAnICogMC4zLCcgK1xuICAgICAgICAgIHZhbHVlICsgJyAqIDAuMl07JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICBsb29wVmFyICsgJysrKSB7XFxuJyxcbiAgICAgICcgIHZhciAnICsgZGlzdGFuY2VWYXIgKyAnID0gJyArIGRpc3RhbmNlc1ZhciArICdbJyArIGxvb3BWYXIgK1xuICAgICAgICAgICcgPCAzID8gJyArIGxvb3BWYXIgKyAnOiA1IC0gJyArIGxvb3BWYXIgKyAnXSAvIDU3LjU7JyxcbiAgICAgICcgIGZvciAodmFyICcgKyBkZWdyZWVWYXIgKyAnID0gMDsgJyArIGRlZ3JlZVZhciArICcgPCA5MDsgJyArXG4gICAgICAgICAgZGVncmVlVmFyICsgJysrKSB7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyBkaXN0YW5jZVZhciArICcpOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoMik7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgaWYgKCcgKyBsb29wVmFyICsgJyAhPSAyKSB7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5MZWZ0KDE4MCk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG5cbiAgLy8gVGhpcyBpcyBhIG1vZGlmaWVkIGNvcHkgb2YgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yIHdpdGggdGhlXG4gIC8vIHZhcmlhYmxlIG5hbWVkIFwiY291bnRlclwiIGhhcmRjb2RlZC5cbiAgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yX2NvdW50ZXIgPSB7XG4gICAgLy8gRm9yIGxvb3Agd2l0aCBoYXJkY29kZWQgbG9vcCB2YXJpYWJsZS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfV0lUSClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChtc2cubG9vcFZhcmlhYmxlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAnVkFSJyk7XG4gICAgICB0aGlzLmludGVycG9sYXRlTXNnKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9GUk9NX1RPX0JZLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydGUk9NJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydUTycsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnQlknLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja2x5LkFMSUdOX1JJR0hUKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoQmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0RPKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfVE9PTFRJUC5yZXBsYWNlKFxuICAgICAgICAgICclMScsIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJykpKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9LFxuICAgIGN1c3RvbUNvbnRleHRNZW51OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgb3B0aW9uID0ge2VuYWJsZWQ6IHRydWV9O1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgb3B0aW9uLnRleHQgPSBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfU0VUX0NSRUFURV9HRVQucmVwbGFjZSgnJTEnLCBuYW1lKTtcbiAgICAgIHZhciB4bWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RpdGxlJyk7XG4gICAgICB4bWxUaXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuYW1lKSk7XG4gICAgICB4bWxUaXRsZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnVkFSJyk7XG4gICAgICB2YXIgeG1sQmxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdibG9jaycpO1xuICAgICAgeG1sQmxvY2suYXBwZW5kQ2hpbGQoeG1sVGl0bGUpO1xuICAgICAgeG1sQmxvY2suc2V0QXR0cmlidXRlKCd0eXBlJywgJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpO1xuICAgICAgb3B0aW9uLmNhbGxiYWNrID0gYmxvY2tseS5Db250ZXh0TWVudS5jYWxsYmFja0ZhY3RvcnkodGhpcywgeG1sQmxvY2spO1xuICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgfSxcbiAgICAvLyBzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZSB0byB4bWwgc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBhY3Jvc3NcbiAgICAvLyBkaWZmZXJlbnQgbG9jYWxlc1xuICAgIG11dGF0aW9uVG9Eb206IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtdXRhdGlvbicpO1xuICAgICAgdmFyIGNvdW50ZXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnY291bnRlcicsIGNvdW50ZXIpO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuICAgIC8vIGRlc2VyaWFsaXplIHRoZSBjb3VudGVyIHZhcmlhYmxlIG5hbWVcbiAgICBkb21Ub011dGF0aW9uOiBmdW5jdGlvbih4bWxFbGVtZW50KSB7XG4gICAgICB2YXIgY291bnRlciA9IHhtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb3VudGVyJyk7XG4gICAgICB0aGlzLnNldFRpdGxlVmFsdWUoY291bnRlciwgJ1ZBUicpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY29udHJvbHNfZm9yX2NvdW50ZXIgPSBnZW5lcmF0b3IuY29udHJvbHNfZm9yO1xuXG4gIC8vIERlbGV0ZSB0aGVzZSBzdGFuZGFyZCBibG9ja3MuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG5cbiAgLy8gR2VuZXJhbCBibG9ja3MuXG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cubW92ZUZvcndhcmQoKSwgJ21vdmVGb3J3YXJkJ10sXG4gICAgICAgW21zZy5tb3ZlQmFja3dhcmQoKSwgJ21vdmVCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuZHJhd19tb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJMT05HX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJTSE9SVF9NT1ZFX0xFTkdUSFwiO1xuICB2YXIgc2ltcGxlTGVuZ3RoQ2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXcsIGxvbmdNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV0sXG4gICAgW3NraW4uc2hvcnRMaW5lRHJhdywgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcbiAgdmFyIHNpbXBsZUxlbmd0aFJpZ2h0Q2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXdSaWdodCwgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3UmlnaHQsIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdXG4gIF07XG5cbiAgdmFyIFNpbXBsZU1vdmUgPSB7XG4gICAgREVGQVVMVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgU0hPUlRfTU9WRV9MRU5HVEg6IDUwLFxuICAgIExPTkdfTU9WRV9MRU5HVEg6IDEwMCxcbiAgICBESVJFQ1RJT05fQ09ORklHUzoge1xuICAgICAgbGVmdDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbldlc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZUxlZnQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVdlc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLndlc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIHJpZ2h0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlUmlnaHQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZUVhc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLmVhc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzXG4gICAgICB9LFxuICAgICAgdXA6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Ob3J0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlVXAnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZU5vcnRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5ub3J0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgZG93bjoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVEb3duJyxcbiAgICAgICAgdG9vbHRpcDogbXNnLm1vdmVTb3V0aFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uc291dGhMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIGp1bXBfbGVmdDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wTGVmdCcsXG4gICAgICAgIGltYWdlOiBza2luLmxlZnRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wV2VzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfcmlnaHQ6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbkVhc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFJpZ2h0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ucmlnaHRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wRWFzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfdXA6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBVcCcsXG4gICAgICAgIGltYWdlOiBza2luLnVwSnVtcEFycm93LFxuICAgICAgICB0b29sdGlwOiBtc2cuanVtcE5vcnRoVG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9kb3duOiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Tb3V0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wRG93bicsXG4gICAgICAgIGltYWdlOiBza2luLmRvd25KdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wU291dGhUb29sdGlwKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwidXBcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiZG93blwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJsZWZ0XCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcInJpZ2h0XCIpO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb246IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoZGlyZWN0aW9uKTtcbiAgICAgIGdlbmVyYXRvcltcInNpbXBsZV9qdW1wX1wiICsgZGlyZWN0aW9uXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb24gKyBcIl9sZW5ndGhcIl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb24gKyAnX2xlbmd0aCddID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24pO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9qdW1wXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jaygnanVtcF8nICsgZGlyZWN0aW9uKTtcbiAgICB9LFxuICAgIGdlbmVyYXRlTW92ZUJsb2NrOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0KSB7XG4gICAgICB2YXIgZGlyZWN0aW9uQ29uZmlnID0gU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dO1xuICAgICAgdmFyIGRpcmVjdGlvbkxldHRlcldpZHRoID0gMTI7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoZWxwVXJsOiAnJyxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5hcHBlbmREdW1teUlucHV0KCk7XG4gICAgICAgICAgaWYgKGRpcmVjdGlvbkNvbmZpZy5pc0p1bXApIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5qdW1wKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKGRpcmVjdGlvbkNvbmZpZy50aXRsZSwge2ZpeGVkU2l6ZToge3dpZHRoOiBkaXJlY3Rpb25MZXR0ZXJXaWR0aCwgaGVpZ2h0OiAxOH19KSk7XG5cbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucykge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMuaGVpZ2h0KSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2UoZGlyZWN0aW9uQ29uZmlnLmltYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgICAgIHRoaXMuc2V0VG9vbHRpcChkaXJlY3Rpb25Db25maWcudG9vbHRpcCk7XG4gICAgICAgICAgaWYgKGhhc0xlbmd0aElucHV0KSB7XG4gICAgICAgICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24oZGlyZWN0aW9uQ29uZmlnLmxlbmd0aHMpO1xuICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUobG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnbGVuZ3RoJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgZ2VuZXJhdGVDb2RlR2VuZXJhdG9yOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0LCBsZW5ndGgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IFNpbXBsZU1vdmUuREVGQVVMVF9NT1ZFX0xFTkdUSDtcblxuICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICBsZW5ndGggPSBTaW1wbGVNb3ZlW3RoaXMuZ2V0VGl0bGVWYWx1ZShcImxlbmd0aFwiKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdUdXJ0bGUuJyArIFNpbXBsZU1vdmUuRElSRUNUSU9OX0NPTkZJR1NbZGlyZWN0aW9uXS5tb3ZlRnVuY3Rpb24gKyAnKCcgKyBsZW5ndGggKyAnLCcgKyAnXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckFsbERpcmVjdGlvbnMoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cuanVtcEZvcndhcmQoKSwgJ2p1bXBGb3J3YXJkJ10sXG4gICAgICAgW21zZy5qdW1wQmFja3dhcmQoKSwgJ2p1bXBCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuanVtcCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGp1bXBpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVsc1xuICAgIC8vIHdpdGhvdXQgZHJhd2luZy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXJcbiAgICAvLyBvZiBwaXhlbHMgd2l0aG91dCBkcmF3aW5nLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybiA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLnR1cm5SaWdodCgpLCAndHVyblJpZ2h0J10sXG4gICAgICAgW21zZy50dXJuTGVmdCgpLCAndHVybkxlZnQnXV07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIHRoaXMgaXMgdGhlIG9sZCB2ZXJzaW9uIG9mIHRoaXMgYmxvY2ssIHRoYXQgc2hvdWxkIG9ubHkgc3RpbGwgYmUgdXNlZCBpblxuICAvLyBvbGQgc2hhcmVkIGxldmVsc1xuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdXSURUSCcpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aWR0aFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnV0lEVEgnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzEnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICAvLyBpbmxpbmVkIHZlcnNpb24gb2YgZHJhd193aWR0aFxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldFdpZHRoKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEnLFxuICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnV0lEVEgnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGhfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnV0lEVEgnKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5XaWR0aCgnICsgd2lkdGggKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHBlbiB1cC9kb3duLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdQRU4nKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnBlblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfcGVuLlNUQVRFID1cbiAgICAgIFtbbXNnLnBlblVwKCksICdwZW5VcCddLFxuICAgICAgIFttc2cucGVuRG93bigpLCAncGVuRG93biddXTtcblxuICBnZW5lcmF0b3IuZHJhd19wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBwZW4gdXAvZG93bi5cbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdQRU4nKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfY29sb3VyID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ0NPTE9VUicpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuQ09MT1VSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5hbHBoYSA9IHtcbiAgICAvLyBUT0RPOlxuICAgIC8vIC0gQWRkIGFscGhhIHRvIGEgZ3JvdXBcbiAgICAvLyAtIE1ha2Ugc3VyZSBpdCBkb2Vzbid0IGNvdW50IGFnYWluc3QgY29ycmVjdCBzb2x1dGlvbnNcbiAgICAvL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldEFscGhhKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KFwiVkFMVUVcIilcbiAgICAgICAgICAuc2V0Q2hlY2soXCJOdW1iZXJcIik7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYWxwaGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFscGhhID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9OT05FKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5nbG9iYWxBbHBoYSgnICsgYWxwaGEgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfY29sb3VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnXFwnIzAwMDAwMFxcJyc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvdXIgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXJfc2ltcGxlID0ge1xuICAgIC8vIFNpbXBsaWZpZWQgZHJvcGRvd24gYmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb2xvdXJzID0gW0NvbG91cnMuUkVELCBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLlBJTkssIENvbG91cnMuT1JBTkdFLFxuICAgICAgICBDb2xvdXJzLllFTExPVywgQ29sb3Vycy5HUkVFTiwgQ29sb3Vycy5CTFVFLCBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB2YXIgY29sb3VyRmllbGQgPSBuZXcgQmxvY2tseS5GaWVsZENvbG91ckRyb3Bkb3duKGNvbG91cnMsIDQ1LCAzNSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbG91ckZpZWxkLCAnQ09MT1VSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXJfc2ltcGxlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0NPTE9VUicpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoXCInICsgY29sb3VyICsgJ1wiLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19saW5lX3N0eWxlX3BhdHRlcm4gPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gYW4gYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0UGF0dGVybigpKVxuICAgICAgICAgICAuYXBwZW5kVGl0bGUoIG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihcbiAgICAgICAgICAgICAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucywgMTUwLCAyMCApLCAnVkFMVUUnICk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFBhdHRlcm4oKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGltYWdlIGZvciBhIHBhdHRlcm5lZCBsaW5lLlxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpIHx8ICdcXCdERUZBVUxUXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5QYXR0ZXJuKFwiJyArIHBhdHRlcm4gKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy51cF9iaWcgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuU1RBVEUpLCAnVklTSUJJTElUWScpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJ0bGVWaXNpYmlsaXR5VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnVwX2JpZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICB2YXIgY29sb3VyID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdDT0xPVVInLFxuICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3Zpc2liaWxpdHkgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmxpdHkuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eS5TVEFURSA9XG4gICAgICBbW21zZy5oaWRlVHVydGxlKCksICdoaWRlVHVydGxlJ10sXG4gICAgICAgW21zZy5zaG93VHVydGxlKCksICdzaG93VHVydGxlJ11dO1xuXG4gIGdlbmVyYXRvci50dXJ0bGVfdmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmlsaXR5LlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZJU0lCSUxJVFknKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV9zdGFtcCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5kcmF3U3RhbXAoKSk7XG4gICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLlZBTFVFUywgNTAsIDMwKTtcblxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuXG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmRyYXdTdGFtcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYmxvY2sgaXMgY3VycmVudGx5IHVudXNlZC4gaWYgd2Ugd2FudCB0byBhZGQgaXQgYmFjayBpbiB0aGUgZnV0dXJlLCBhZGRcbiAgLy8gc3RhbXAgaW1hZ2VzIGhlcmVcbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wLlZBTFVFUyA9IHNraW4uc3RhbXBWYWx1ZXM7XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV9zdGFtcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1R1cnRsZS5kcmF3U3RhbXAoXCInICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpICtcbiAgICAgICAgJ1wiLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgY3VzdG9tTGV2ZWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IFR1cnRsZSBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIEdsb2JhbHMgdXNlZCBpbiB0aGlzIGZpbGU6XG4vLyAgQmxvY2tseVxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgdHVydGxlTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIEFydGlzdEFQSSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIFNsaWRlciA9IHJlcXVpcmUoJy4uL3NsaWRlcicpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG5cbnZhciBDQU5WQVNfSEVJR0hUID0gNDAwO1xudmFyIENBTlZBU19XSURUSCA9IDQwMDtcblxudmFyIEpPSU5UX1JBRElVUyA9IDQ7XG5cbnZhciBTTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSA1O1xudmFyIEZBU1RfU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFID0gMTU7XG5cbi8qKlxuKiBNaW5pbXVtIGpvaW50IHNlZ21lbnQgbGVuZ3RoXG4qL1xudmFyIEpPSU5UX1NFR01FTlRfTEVOR1RIID0gNTA7XG5cbi8qKlxuICogQW4geCBvZmZzZXQgYWdhaW5zdCB0aGUgc3ByaXRlIGVkZ2Ugd2hlcmUgdGhlIGRlY29yYXRpb24gc2hvdWxkIGJlIGRyYXduLFxuICogYWxvbmcgd2l0aCB3aGV0aGVyIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUgb3IgYWZ0ZXIgdGhlIHR1cnRsZSBzcHJpdGUgaXRzZWxmLlxuICovXG52YXIgRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFMgPSBbXG4gIHsgeDogMTUsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDI2LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiAzNywgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNDYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYwLCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2NSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY0LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Miwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDU1LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNDgsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAzMywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMxLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMjIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAxNywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDEyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogIDgsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDEwLCB3aGVuOiBcImFmdGVyXCIgfVxuXTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgQXJ0aXN0IGNsYXNzXG4gKiBAcGFyYW0ge1N0dWRpb0FwcH0gc3R1ZGlvQXBwIFRoZSBzdHVkaW9BcHAgaW5zdGFuY2UgdG8gYnVpbGQgdXBvbi5cbiAqL1xudmFyIEFydGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG5cbiAgLy8gaW1hZ2UgaWNvbnMgYW5kIGltYWdlIHBhdGhzIGZvciB0aGUgJ3NldCBwYXR0ZXJuIGJsb2NrJ1xuICB0aGlzLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zID0gW107XG4gIHRoaXMuc3RhbXBzID0gW107XG5cbiAgLy8gUElEIG9mIGFuaW1hdGlvbiB0YXNrIGN1cnJlbnRseSBleGVjdXRpbmcuXG4gIHRoaXMucGlkID0gMDtcblxuICAvLyBTaG91bGQgdGhlIHR1cnRsZSBiZSBkcmF3bj9cbiAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBTZXQgYSB0dXJ0bGUgaGVhZGluZy5cbiAgdGhpcy5oZWFkaW5nID0gMDtcblxuICAvLyBUaGUgYXZhdGFyIGltYWdlXG4gIHRoaXMuYXZhdGFySW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgYXZhdGFyIGFuaW1hdGlvbiBkZWNvcmF0aW9uIGltYWdlXG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgLy8gRHJhd2luZyB3aXRoIGEgcGF0dGVyblxuICB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybiA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJucyA9IFtdO1xuICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG5cbiAgLy8gdGhlc2UgZ2V0IHNldCBieSBpbml0IGJhc2VkIG9uIHNraW4uXG4gIHRoaXMuYXZhdGFyV2lkdGggPSAwO1xuICB0aGlzLmF2YXRhckhlaWdodCA9IDA7XG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoID0gODU7XG4gIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodCA9IDg1O1xuICB0aGlzLnNwZWVkU2xpZGVyID0gbnVsbDtcblxuICB0aGlzLmN0eEFuc3dlciA9IG51bGw7XG4gIHRoaXMuY3R4SW1hZ2VzID0gbnVsbDtcbiAgdGhpcy5jdHhQcmVkcmF3ID0gbnVsbDtcbiAgdGhpcy5jdHhTY3JhdGNoID0gbnVsbDtcbiAgdGhpcy5jdHhQYXR0ZXJuID0gbnVsbDtcbiAgdGhpcy5jdHhGZWVkYmFjayA9IG51bGw7XG4gIHRoaXMuY3R4RGlzcGxheSA9IG51bGw7XG5cbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gZmFsc2U7XG4gIHRoaXMuaXNQcmVkcmF3aW5nXyA9IGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnRpc3Q7XG5cblxuLyoqXG4gKiB0b2RvXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaW5qZWN0U3R1ZGlvQXBwID0gZnVuY3Rpb24gKHN0dWRpb0FwcCkge1xuICB0aGlzLnN0dWRpb0FwcF8gPSBzdHVkaW9BcHA7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCA9IF8uYmluZCh0aGlzLnJlc2V0LCB0aGlzKTtcbiAgdGhpcy5zdHVkaW9BcHBfLnJ1bkJ1dHRvbkNsaWNrID0gXy5iaW5kKHRoaXMucnVuQnV0dG9uQ2xpY2ssIHRoaXMpO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSB0dXJ0bGUuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgaWYgKCF0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcnRpc3QgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICAvLyBQcmVsb2FkIHN0YW1wIGltYWdlc1xuICB0aGlzLnN0YW1wcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2tpbi5zdGFtcFZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB1cmwgPSB0aGlzLnNraW4uc3RhbXBWYWx1ZXNbaV1bMF07XG4gICAgdmFyIGtleSA9IHRoaXMuc2tpbi5zdGFtcFZhbHVlc1tpXVsxXTtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLnNyYyA9IHVybDtcbiAgICB0aGlzLnN0YW1wc1trZXldID0gaW1nO1xuICB9XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICAvLyBsZXQncyB0cnkgYWRkaW5nIGEgYmFja2dyb3VuZCBpbWFnZVxuICAgIHRoaXMubGV2ZWwuaW1hZ2VzID0gW3t9XTtcbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5maWxlbmFtZSA9ICdiYWNrZ3JvdW5kLmpwZyc7XG5cbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5wb3NpdGlvbiA9IFsgMCwgMCBdO1xuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLnNjYWxlID0gMTtcbiAgfVxuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSB0cnVlO1xuICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayA9ICd3aGVuX3J1bic7XG4gIGNvbmZpZy5kcm9wbGV0Q29uZmlnID0gZHJvcGxldENvbmZpZztcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDczO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gMTAwO1xuICB9XG4gIGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MztcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDEwMDtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25XaWR0aCA9IDg1O1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodCA9IDg1O1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MDtcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDUxO1xuICB9XG5cbiAgdmFyIGljb25QYXRoID0gJ21lZGlhL3R1cnRsZS8nICsgKGNvbmZpZy5pc0xlZ2FjeVNoYXJlICYmIGNvbmZpZy5oaWRlU291cmNlID8gJ2ljb25zX3doaXRlLnBuZycgOiAnaWNvbnMucG5nJyk7XG4gIGNvbmZpZy5odG1sID0gcGFnZSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBkYXRhOiB7XG4gICAgICB2aXN1YWxpemF0aW9uOiAnJyxcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7YXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCwgaWNvblBhdGg6IGljb25QYXRofSksXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IF8uYmluZCh0aGlzLmxvYWRBdWRpb18sIHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBfLmJpbmQodGhpcy5hZnRlckluamVjdF8sIHRoaXMsIGNvbmZpZyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmluaXQoY29uZmlnKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUubG9hZEF1ZGlvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4ud2luU291bmQsICd3aW4nKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbn07XG5cbi8qKlxuICogQ29kZSBjYWxsZWQgYWZ0ZXIgdGhlIGJsb2NrbHkgZGl2ICsgYmxvY2tseSBjb3JlIGlzIGluamVjdGVkIGludG8gdGhlIGRvY3VtZW50XG4gKi9cbkFydGlzdC5wcm90b3R5cGUuYWZ0ZXJJbmplY3RfID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAvLyBJbml0aWFsaXplIHRoZSBzbGlkZXIuXG4gIHZhciBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2xpZGVyJyk7XG4gIHRoaXMuc3BlZWRTbGlkZXIgPSBuZXcgU2xpZGVyKDEwLCAzNSwgMTMwLCBzbGlkZXIpO1xuXG4gIC8vIENoYW5nZSBkZWZhdWx0IHNwZWVkIChlZyBTcGVlZCB1cCBsZXZlbHMgdGhhdCBoYXZlIGxvdHMgb2Ygc3RlcHMpLlxuICBpZiAoY29uZmlnLmxldmVsLnNsaWRlclNwZWVkKSB7XG4gICAgdGhpcy5zcGVlZFNsaWRlci5zZXRWYWx1ZShjb25maWcubGV2ZWwuc2xpZGVyU3BlZWQpO1xuICB9XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnVHVydGxlLGNvZGUnKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBoaWRkZW4gY2FudmFzZXMuXG4gIHRoaXMuY3R4QW5zd2VyID0gdGhpcy5jcmVhdGVDYW52YXNfKCdhbnN3ZXInLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhJbWFnZXMgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2ltYWdlcycsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFByZWRyYXcgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3ByZWRyYXcnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhTY3JhdGNoID0gdGhpcy5jcmVhdGVDYW52YXNfKCdzY3JhdGNoJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4UGF0dGVybiA9IHRoaXMuY3JlYXRlQ2FudmFzXygncGF0dGVybicsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eEZlZWRiYWNrID0gdGhpcy5jcmVhdGVDYW52YXNfKCdmZWVkYmFjaycsIDE1NCwgMTU0KS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIENyZWF0ZSBkaXNwbGF5IGNhbnZhcy5cbiAgdmFyIGRpc3BsYXlDYW52YXMgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2Rpc3BsYXknLCA0MDAsIDQwMCk7XG5cbiAgdmFyIHZpc3VhbGl6YXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbicpO1xuICB2aXN1YWxpemF0aW9uLmFwcGVuZENoaWxkKGRpc3BsYXlDYW52YXMpO1xuICB0aGlzLmN0eERpc3BsYXkgPSBkaXNwbGF5Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gVE9ETyAoYnItcGFpcik6IC0gcHVsbCB0aGlzIG91dD9cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpICYmICh0aGlzLnNraW4uaWQgPT09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PT0gXCJlbHNhXCIpKSB7XG4gICAgLy8gT3ZlcnJpZGUgY29sb3VyX3JhbmRvbSB0byBvbmx5IGdlbmVyYXRlIHJhbmRvbSBjb2xvcnMgZnJvbSB3aXRoaW4gb3VyIGZyb3plblxuICAgIC8vIHBhbGV0dGVcbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gR2VuZXJhdGUgYSByYW5kb20gY29sb3VyLlxuICAgICAgaWYgKCFCbG9ja2x5LkphdmFTY3JpcHQuZGVmaW5pdGlvbnNfLmNvbG91cl9yYW5kb20pIHtcbiAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IEJsb2NrbHkuSmF2YVNjcmlwdC52YXJpYWJsZURCXy5nZXREaXN0aW5jdE5hbWUoXG4gICAgICAgICAgJ2NvbG91cl9yYW5kb20nLCBCbG9ja2x5LkdlbmVyYXRvci5OQU1FX1RZUEUpO1xuICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWU7XG4gICAgICAgIHZhciBmdW5jID0gW107XG4gICAgICAgIGZ1bmMucHVzaCgnZnVuY3Rpb24gJyArIGZ1bmN0aW9uTmFtZSArICcoKSB7Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnICAgdmFyIGNvbG9ycyA9ICcgKyBKU09OLnN0cmluZ2lmeShCbG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMpICsgJzsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCcgIHJldHVybiBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNvbG9ycy5sZW5ndGgpXTsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCd9Jyk7XG4gICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5kZWZpbml0aW9uc18uY29sb3VyX3JhbmRvbSA9IGZ1bmMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICB2YXIgY29kZSA9IEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tLmZ1bmN0aW9uTmFtZSArICcoKSc7XG4gICAgICByZXR1cm4gW2NvZGUsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9GVU5DVElPTl9DQUxMXTtcbiAgICB9O1xuICB9XG5cbiAgdGhpcy5sb2FkRGVjb3JhdGlvbkFuaW1hdGlvbigpO1xuXG4gIC8vIFNldCB0aGVpciBpbml0aWFsIGNvbnRlbnRzLlxuICB0aGlzLmxvYWRUdXJ0bGUoKTtcbiAgdGhpcy5kcmF3SW1hZ2VzKCk7XG5cbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gdHJ1ZTtcbiAgdGhpcy5kcmF3QW5zd2VyKCk7XG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IGZhbHNlO1xuXG4gIGlmICh0aGlzLmxldmVsLnByZWRyYXdCbG9ja3MpIHtcbiAgICB0aGlzLmlzUHJlZHJhd2luZ18gPSB0cnVlO1xuICAgIHRoaXMuZHJhd0Jsb2Nrc09uQ2FudmFzKHRoaXMubGV2ZWwucHJlZHJhd0Jsb2NrcywgdGhpcy5jdHhQcmVkcmF3KTtcbiAgICB0aGlzLmlzUHJlZHJhd2luZ18gPSBmYWxzZTtcbiAgfVxuXG4gIC8vIHByZS1sb2FkIGltYWdlIGZvciBsaW5lIHBhdHRlcm4gYmxvY2suIENyZWF0aW5nIHRoZSBpbWFnZSBvYmplY3QgYW5kIHNldHRpbmcgc291cmNlIGRvZXNuJ3Qgc2VlbSB0byBiZVxuICAvLyBlbm91Z2ggaW4gdGhpcyBjYXNlLCBzbyB3ZSdyZSBhY3R1YWxseSBjcmVhdGluZyBhbmQgcmV1c2luZyB0aGUgb2JqZWN0IHdpdGhpbiB0aGUgZG9jdW1lbnQgYm9keS5cbiAgdmFyIGltYWdlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGltYWdlQ29udGFpbmVyLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlQ29udGFpbmVyKTtcblxuICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5za2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zW2ldWzFdO1xuICAgIGlmICh0aGlzLnNraW5bcGF0dGVybl0pIHtcbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltZy5zcmMgPSB0aGlzLnNraW5bcGF0dGVybl07XG4gICAgICB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXSA9IGltZztcbiAgICB9XG4gIH1cblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4Jztcbn07XG5cbi8qKlxuICogT24gc3RhcnR1cCBkcmF3IHRoZSBleHBlY3RlZCBhbnN3ZXIgYW5kIHNhdmUgaXQgdG8gdGhlIGFuc3dlciBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5sZXZlbC5zb2x1dGlvbkJsb2Nrcykge1xuICAgIHRoaXMuZHJhd0Jsb2Nrc09uQ2FudmFzKHRoaXMubGV2ZWwuc29sdXRpb25CbG9ja3MsIHRoaXMuY3R4QW5zd2VyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRyYXdMb2dPbkNhbnZhcyh0aGlzLmxldmVsLmFuc3dlciwgdGhpcy5jdHhBbnN3ZXIpO1xuICB9XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgc2V0IG9mIGNvbW1hbmRzIGFuZCBhIGNhbnZhcywgZHJhd3MgdGhlIGNvbW1hbmRzIG9udG8gdGhlIGNhbnZhc1xuICogY29tcG9zaXRlZCBvdmVyIHRoZSBzY3JhdGNoIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3TG9nT25DYW52YXMgPSBmdW5jdGlvbihsb2csIGNhbnZhcykge1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQoKTtcbiAgd2hpbGUgKGxvZy5sZW5ndGgpIHtcbiAgICB2YXIgdHVwbGUgPSBsb2cuc2hpZnQoKTtcbiAgICB0aGlzLnN0ZXAodHVwbGVbMF0sIHR1cGxlLnNwbGljZSgxKSwge3Ntb290aEFuaW1hdGU6IGZhbHNlfSk7XG4gICAgdGhpcy5yZXNldFN0ZXBJbmZvXygpO1xuICB9XG4gIGNhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIGNhbnZhcy5kcmF3SW1hZ2UodGhpcy5jdHhTY3JhdGNoLmNhbnZhcywgMCwgMCk7XG4gIGNhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZXMgYmxvY2tzIG9yIGNvZGUsIGFuZCBkcmF3cyBvbnRvIGdpdmVuIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3QmxvY2tzT25DYW52YXMgPSBmdW5jdGlvbihibG9ja3NPckNvZGUsIGNhbnZhcykge1xuICB2YXIgY29kZTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIGRvbUJsb2NrcyA9IEJsb2NrbHkuWG1sLnRleHRUb0RvbShibG9ja3NPckNvZGUpO1xuICAgIEJsb2NrbHkuWG1sLmRvbVRvQmxvY2tTcGFjZShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLCBkb21CbG9ja3MpO1xuICAgIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gIH0gZWxzZSB7XG4gICAgY29kZSA9IGJsb2Nrc09yQ29kZTtcbiAgfVxuICB0aGlzLmV2YWxDb2RlKGNvZGUpO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmNsZWFyKCk7XG4gIH1cbiAgdGhpcy5kcmF3Q3VycmVudEJsb2Nrc09uQ2FudmFzKGNhbnZhcyk7XG59O1xuXG4vKipcbiAqIERyYXdzIHRoZSByZXN1bHRzIG9mIGJsb2NrIGV2YWx1YXRpb24gKHN0b3JlZCBvbiBhcGkubG9nKSBvbnRvIHRoZSBnaXZlblxuICogY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdDdXJyZW50QmxvY2tzT25DYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgdGhpcy5kcmF3TG9nT25DYW52YXModGhpcy5hcGkubG9nLCBjYW52YXMpO1xufTtcblxuLyoqXG4gKiBQbGFjZSBhbiBpbWFnZSBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzLlxuICogQ29kZSBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTQ5NTk1Mi4gVGhhbmtzLCBQaHJvZ3ouXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWUgUmVsYXRpdmUgcGF0aCB0byBpbWFnZS5cbiAqIEBwYXJhbSB7IUFycmF5fSBwb3NpdGlvbiBBbiB4LXkgcGFpci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25hbCBzY2FsZSBhdCB3aGljaCBpbWFnZSBpcyBkcmF3blxuICovXG5BcnRpc3QucHJvdG90eXBlLnBsYWNlSW1hZ2UgPSBmdW5jdGlvbihmaWxlbmFtZSwgcG9zaXRpb24sIHNjYWxlKSB7XG4gIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLm9ubG9hZCA9IF8uYmluZChmdW5jdGlvbigpIHtcbiAgICBpZiAoaW1nLndpZHRoICE9PSAwKSB7XG4gICAgICBpZiAoc2NhbGUpIHtcbiAgICAgICAgdGhpcy5jdHhJbWFnZXMuZHJhd0ltYWdlKGltZywgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdLCBpbWcud2lkdGgsXG4gICAgICAgICAgaW1nLmhlaWdodCwgMCwgMCwgaW1nLndpZHRoICogc2NhbGUsIGltZy5oZWlnaHQgKiBzY2FsZSk7XG4gICAgICB9IGVsc2UgIHtcbiAgICAgICAgdGhpcy5jdHhJbWFnZXMuZHJhd0ltYWdlKGltZywgcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kaXNwbGF5KCk7XG4gIH0sIHRoaXMpO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgaW1nLnNyYyA9IHRoaXMuc2tpbi5hc3NldFVybChmaWxlbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgaW1nLnNyYyA9IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCgnbWVkaWEvdHVydGxlLycgKyBmaWxlbmFtZSk7XG4gIH1cbn07XG5cbi8qKlxuICogRHJhdyB0aGUgaW1hZ2VzIGZvciB0aGlzIHBhZ2UgYW5kIGxldmVsIG9udG8gdGhpcy5jdHhJbWFnZXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ltYWdlcyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMubGV2ZWwuaW1hZ2VzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZXZlbC5pbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaW1hZ2UgPSB0aGlzLmxldmVsLmltYWdlc1tpXTtcbiAgICB0aGlzLnBsYWNlSW1hZ2UoaW1hZ2UuZmlsZW5hbWUsIGltYWdlLnBvc2l0aW9uLCBpbWFnZS5zY2FsZSk7XG4gIH1cbiAgdGhpcy5jdHhJbWFnZXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICB0aGlzLmN0eEltYWdlcy5kcmF3SW1hZ2UodGhpcy5jdHhTY3JhdGNoLmNhbnZhcywgMCwgMCk7XG4gIHRoaXMuY3R4SW1hZ2VzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG59O1xuXG4vKipcbiAqIEluaXRpYWwgdGhlIHR1cnRsZSBpbWFnZSBvbiBsb2FkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmxvYWRUdXJ0bGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hdmF0YXJJbWFnZS5vbmxvYWQgPSBfLmJpbmQodGhpcy5kaXNwbGF5LCB0aGlzKTtcblxuICB0aGlzLmF2YXRhckltYWdlLnNyYyA9IHRoaXMuc2tpbi5hdmF0YXI7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMzY7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDE4O1xuICB9IGVsc2Uge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAxODA7XG4gIH1cbiAgdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQgPSB0aGlzLmF2YXRhckhlaWdodDtcbiAgdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aCA9IHRoaXMuYXZhdGFyV2lkdGg7XG59O1xuXG4vKipcbiAqIEluaXRpYWwgdGhlIHR1cnRsZSBhbmltYXRpb24gZGVvY3JhdGlvbiBvbiBsb2FkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmxvYWREZWNvcmF0aW9uQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS5zcmMgPSB0aGlzLnNraW4uZGVjb3JhdGlvbkFuaW1hdGlvbjtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS5oZWlnaHQgPSB0aGlzLmRlY29yYXRpb25BbmltYXRpb25IZWlnaHQ7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGggPSB0aGlzLmRlY29yYXRpb25BbmltYXRpb25XaWR0aDtcbiAgfVxufTtcblxudmFyIHR1cnRsZUZyYW1lID0gMDtcblxuXG4vKipcbiAqIERyYXcgdGhlIHR1cnRsZSBpbWFnZSBiYXNlZCBvbiB0aGlzLngsIHRoaXMueSwgYW5kIHRoaXMuaGVhZGluZy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3VHVydGxlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzb3VyY2VZO1xuICAvLyBDb21wdXRlcyB0aGUgaW5kZXggb2YgdGhlIGltYWdlIGluIHRoZSBzcHJpdGUuXG4gIHZhciBpbmRleCA9IE1hdGguZmxvb3IodGhpcy5oZWFkaW5nICogdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAvIDM2MCk7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgLy8gdGhlIHJvdGF0aW9ucyBpbiB0aGUgc3ByaXRlIHNoZWV0IGdvIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24uXG4gICAgaW5kZXggPSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC0gaW5kZXg7XG5cbiAgICAvLyBhbmQgdGhleSBhcmUgMTgwIGRlZ3JlZXMgb3V0IG9mIHBoYXNlLlxuICAgIGluZGV4ID0gKGluZGV4ICsgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncy8yKSAlIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3M7XG4gIH1cbiAgdmFyIHNvdXJjZVggPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoICogaW5kZXg7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgc291cmNlWSA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0ICogdHVydGxlRnJhbWU7XG4gICAgdHVydGxlRnJhbWUgPSAodHVydGxlRnJhbWUgKyAxKSAlIHRoaXMuc2tpbi50dXJ0bGVOdW1GcmFtZXM7XG4gIH0gZWxzZSB7XG4gICAgc291cmNlWSA9IDA7XG4gIH1cbiAgdmFyIHNvdXJjZVdpZHRoID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aDtcbiAgdmFyIHNvdXJjZUhlaWdodCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0O1xuICB2YXIgZGVzdFdpZHRoID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aDtcbiAgdmFyIGRlc3RIZWlnaHQgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodDtcbiAgdmFyIGRlc3RYID0gdGhpcy54IC0gZGVzdFdpZHRoIC8gMjtcbiAgdmFyIGRlc3RZID0gdGhpcy55IC0gZGVzdEhlaWdodCArIDc7XG5cbiAgaWYgKHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggPT09IDAgfHwgdGhpcy5hdmF0YXJJbWFnZS5oZWlnaHQgPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc291cmNlWCA8IDAgfHxcbiAgICAgIHNvdXJjZVkgPCAwIHx8XG4gICAgICBzb3VyY2VYICsgc291cmNlV2lkdGggIC0wID4gdGhpcy5hdmF0YXJJbWFnZS53aWR0aCB8fFxuICAgICAgc291cmNlWSArIHNvdXJjZUhlaWdodCA+IHRoaXMuYXZhdGFySW1hZ2UuaGVpZ2h0KVxuICB7XG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcbiAgICAgIC8vIFRPRE8oYmpvcmRhbik6IGFzayBCcmVudCwgc3RhcnRpbmcgdG8gZmxvb2QgZ3J1bnQgbW9jaGFUZXN0IG1lc3NhZ2VzLFxuICAgICAgLy8gYmV0dGVyIGZpeCBoZXJlP1xuICAgICAgLy8gY29uc29sZS5sb2coXCJkcmF3SW1hZ2UgaXMgb3V0IG9mIHNvdXJjZSBib3VuZHMhXCIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5hdmF0YXJJbWFnZS53aWR0aCAhPT0gMCkge1xuICAgIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UoXG4gICAgICB0aGlzLmF2YXRhckltYWdlLFxuICAgICAgTWF0aC5yb3VuZChzb3VyY2VYKSwgTWF0aC5yb3VuZChzb3VyY2VZKSxcbiAgICAgIHNvdXJjZVdpZHRoIC0gMCwgc291cmNlSGVpZ2h0LFxuICAgICAgTWF0aC5yb3VuZChkZXN0WCksIE1hdGgucm91bmQoZGVzdFkpLFxuICAgICAgZGVzdFdpZHRoIC0gMCwgZGVzdEhlaWdodCk7XG4gIH1cbn07XG5cbi8qKlxuICAqIFRoaXMgaXMgY2FsbGVkIHR3aWNlLCBvbmNlIHdpdGggXCJiZWZvcmVcIiBhbmQgb25jZSB3aXRoIFwiYWZ0ZXJcIiwgcmVmZXJyaW5nIHRvIGJlZm9yZSBvciBhZnRlclxuICAqIHRoZSBzcHJpdGUgaXMgZHJhd24uICBGb3Igc29tZSBhbmdsZXMgaXQgc2hvdWxkIGJlIGRyYXduIGJlZm9yZSwgYW5kIGZvciBzb21lIGFmdGVyLlxuICAqL1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uID0gZnVuY3Rpb24od2hlbikge1xuICBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdmFyIGZyYW1lSW5kZXggPSAodHVydGxlRnJhbWUgKyAxMCkgJSB0aGlzLnNraW4uZGVjb3JhdGlvbkFuaW1hdGlvbk51bUZyYW1lcztcblxuICAgIHZhciBhbmdsZUluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmhlYWRpbmcgKiB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC8gMzYwKTtcblxuICAgIC8vIHRoZSByb3RhdGlvbnMgaW4gdGhlIEFubmEgJiBFbHNhIHNwcml0ZSBzaGVldHMgZ28gaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbi5cbiAgICBhbmdsZUluZGV4ID0gdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAtIGFuZ2xlSW5kZXg7XG5cbiAgICAvLyBhbmQgdGhleSBhcmUgMTgwIGRlZ3JlZXMgb3V0IG9mIHBoYXNlLlxuICAgIGFuZ2xlSW5kZXggPSAoYW5nbGVJbmRleCArIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MvMikgJSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzO1xuXG4gICAgaWYgKEVMU0FfREVDT1JBVElPTl9ERVRBSUxTW2FuZ2xlSW5kZXhdLndoZW4gPT0gd2hlbikge1xuICAgICAgdmFyIHNvdXJjZVggPSB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aCAqIGZyYW1lSW5kZXg7XG4gICAgICB2YXIgc291cmNlWSA9IDA7XG4gICAgICB2YXIgc291cmNlV2lkdGggPSB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aDtcbiAgICAgIHZhciBzb3VyY2VIZWlnaHQgPSB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS5oZWlnaHQ7XG4gICAgICB2YXIgZGVzdFdpZHRoID0gc291cmNlV2lkdGg7XG4gICAgICB2YXIgZGVzdEhlaWdodCA9IHNvdXJjZUhlaWdodDtcbiAgICAgIHZhciBkZXN0WCA9IHRoaXMueCAtIGRlc3RXaWR0aCAvIDIgLSAxNSAtIDE1ICsgRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFNbYW5nbGVJbmRleF0ueDtcbiAgICAgIHZhciBkZXN0WSA9IHRoaXMueSAtIGRlc3RIZWlnaHQgLyAyIC0gMTAwO1xuXG4gICAgICBpZiAodGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGggIT09IDApIHtcbiAgICAgICAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZShcbiAgICAgICAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZSxcbiAgICAgICAgICBNYXRoLnJvdW5kKHNvdXJjZVgpLCBNYXRoLnJvdW5kKHNvdXJjZVkpLFxuICAgICAgICAgIHNvdXJjZVdpZHRoLCBzb3VyY2VIZWlnaHQsXG4gICAgICAgICAgTWF0aC5yb3VuZChkZXN0WCksIE1hdGgucm91bmQoZGVzdFkpLFxuICAgICAgICAgIGRlc3RXaWR0aCwgZGVzdEhlaWdodCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5cbi8qKlxuICogUmVzZXQgdGhlIHR1cnRsZSB0byB0aGUgc3RhcnQgcG9zaXRpb24sIGNsZWFyIHRoZSBkaXNwbGF5LCBhbmQga2lsbCBhbnlcbiAqIHBlbmRpbmcgdGFza3MuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChpZ25vcmUpIHtcbiAgLy8gU3RhbmRhcmQgc3RhcnRpbmcgbG9jYXRpb24gYW5kIGhlYWRpbmcgb2YgdGhlIHR1cnRsZS5cbiAgdGhpcy54ID0gQ0FOVkFTX0hFSUdIVCAvIDI7XG4gIHRoaXMueSA9IENBTlZBU19XSURUSCAvIDI7XG4gIHRoaXMuaGVhZGluZyA9IHRoaXMubGV2ZWwuc3RhcnREaXJlY3Rpb24gIT09IHVuZGVmaW5lZCA/XG4gICAgICB0aGlzLmxldmVsLnN0YXJ0RGlyZWN0aW9uIDogOTA7XG4gIHRoaXMucGVuRG93blZhbHVlID0gdHJ1ZTtcbiAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBGb3Igc3BlY2lhbCBjYXNlcywgdXNlIGEgZGlmZmVyZW50IGluaXRpYWwgbG9jYXRpb24uXG4gIGlmICh0aGlzLmxldmVsLmluaXRpYWxYICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnggPSB0aGlzLmxldmVsLmluaXRpYWxYO1xuICB9XG4gIGlmICh0aGlzLmxldmVsLmluaXRpYWxZICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnkgPSB0aGlzLmxldmVsLmluaXRpYWxZO1xuICB9XG4gIC8vIENsZWFyIHRoZSBkaXNwbGF5LlxuICB0aGlzLmN0eFNjcmF0Y2guY2FudmFzLndpZHRoID0gdGhpcy5jdHhTY3JhdGNoLmNhbnZhcy53aWR0aDtcbiAgdGhpcy5jdHhQYXR0ZXJuLmNhbnZhcy53aWR0aCA9IHRoaXMuY3R4UGF0dGVybi5jYW52YXMud2lkdGg7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVdpZHRoID0gMjtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVdpZHRoID0gMjtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcbiAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVdpZHRoID0gNTtcbiAgfVxuXG4gIHRoaXMuY3R4U2NyYXRjaC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgdGhpcy5jdHhTY3JhdGNoLmZvbnQgPSAnbm9ybWFsIDE4cHQgQXJpYWwnO1xuICB0aGlzLmRpc3BsYXkoKTtcblxuICAvLyBDbGVhciB0aGUgZmVlZGJhY2suXG4gIHRoaXMuY3R4RmVlZGJhY2suY2xlYXJSZWN0KFxuICAgICAgMCwgMCwgdGhpcy5jdHhGZWVkYmFjay5jYW52YXMud2lkdGgsIHRoaXMuY3R4RmVlZGJhY2suY2FudmFzLmhlaWdodCk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMuc2V0UGF0dGVybihcImFubmFMaW5lXCIpO1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuc2V0UGF0dGVybihcImVsc2FMaW5lXCIpO1xuICB9IGVsc2Uge1xuICAgIC8vIFJlc2V0IHRvIGVtcHR5IHBhdHRlcm5cbiAgICB0aGlzLnNldFBhdHRlcm4obnVsbCk7XG4gIH1cblxuICAvLyBLaWxsIGFueSB0YXNrLlxuICBpZiAodGhpcy5waWQpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMucGlkKTtcbiAgfVxuICB0aGlzLnBpZCA9IDA7XG5cbiAgLy8gRGlzY2FyZCB0aGUgaW50ZXJwcmV0ZXIuXG4gIHRoaXMuaW50ZXJwcmV0ZXIgPSBudWxsO1xuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcblxuICAvLyBTdG9wIHRoZSBsb29waW5nIHNvdW5kLlxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcblxuICB0aGlzLnJlc2V0U3RlcEluZm9fKCk7XG59O1xuXG5cbi8qKlxuICogQ29weSB0aGUgc2NyYXRjaCBjYW52YXMgdG8gdGhlIGRpc3BsYXkgY2FudmFzLiBBZGQgYSB0dXJ0bGUgbWFya2VyLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgLy8gRkYgb24gbGludXggcmV0YWlucyBkcmF3aW5nIG9mIHByZXZpb3VzIGxvY2F0aW9uIG9mIGFydGlzdCB1bmxlc3Mgd2UgY2xlYXJcbiAgLy8gdGhlIGNhbnZhcyBmaXJzdC5cbiAgdmFyIHN0eWxlID0gdGhpcy5jdHhEaXNwbGF5LmZpbGxTdHlsZTtcbiAgdGhpcy5jdHhEaXNwbGF5LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gIHRoaXMuY3R4RGlzcGxheS5jbGVhclJlY3QoMCwgMCwgdGhpcy5jdHhEaXNwbGF5LmNhbnZhcy53aWR0aCxcbiAgICB0aGlzLmN0eERpc3BsYXkuY2FudmFzLndpZHRoKTtcbiAgdGhpcy5jdHhEaXNwbGF5LmZpbGxTdHlsZSA9IHN0eWxlO1xuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIC8vIERyYXcgdGhlIGltYWdlcyBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhJbWFnZXMuY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSBhbnN3ZXIgbGF5ZXIuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMC40O1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDAuMTU7XG4gIH1cbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eEFuc3dlci5jYW52YXMsIDAsIDApO1xuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAxO1xuXG4gIC8vIERyYXcgdGhlIHByZWRyYXcgbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4UHJlZHJhdy5jYW52YXMsIDAsIDApO1xuXG4gIC8vIERyYXcgdGhlIHBhdHRlcm4gbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4UGF0dGVybi5jYW52YXMsIDAsIDApO1xuXG4gIC8vIERyYXcgdGhlIHVzZXIgbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuXG4gIC8vIERyYXcgdGhlIHR1cnRsZS5cbiAgaWYgKHRoaXMudmlzaWJsZSkge1xuICAgIHRoaXMuZHJhd0RlY29yYXRpb25BbmltYXRpb24oXCJiZWZvcmVcIik7XG4gICAgdGhpcy5kcmF3VHVydGxlKCk7XG4gICAgdGhpcy5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbihcImFmdGVyXCIpO1xuICB9XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5ldmFsQ29kZSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIFR1cnRsZTogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEluZmluaXR5IGlzIHRocm93biBpZiB3ZSBkZXRlY3QgYW4gaW5maW5pdGUgbG9vcC4gSW4gdGhhdCBjYXNlIHdlJ2xsXG4gICAgLy8gc3RvcCBmdXJ0aGVyIGV4ZWN1dGlvbiwgYW5pbWF0ZSB3aGF0IG9jY3VyZWQgYmVmb3JlIHRoZSBpbmZpbml0ZSBsb29wLFxuICAgIC8vIGFuZCBhbmFseXplIHN1Y2Nlc3MvZmFpbHVyZSBiYXNlZCBvbiB3aGF0IHdhcyBkcmF3bi5cbiAgICAvLyBPdGhlcndpc2UsIGFibm9ybWFsIHRlcm1pbmF0aW9uIGlzIGEgdXNlciBlcnJvci5cbiAgICBpZiAoZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAgIC8vIFVzZXJDb2RlIHNvIHRoYXQgaXQncyBjbGVhciB0aGlzIGlzIGluIGV2YWwnZWQgY29kZS5cbiAgICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgICAgfVxuICAgICAgd2luZG93LmFsZXJ0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgdXAgdGhpcy5jb2RlLCB0aGlzLmludGVycHJldGVyLCBldGMuIHRvIHJ1biBjb2RlIGZvciBlZGl0Q29kZSBsZXZlbHNcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5nZW5lcmF0ZVR1cnRsZUNvZGVGcm9tSlNfID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNvZGUgPSBkcm9wbGV0VXRpbHMuZ2VuZXJhdGVDb2RlQWxpYXNlcyhkcm9wbGV0Q29uZmlnLCAnVHVydGxlJyk7XG4gIHRoaXMudXNlckNvZGVTdGFydE9mZnNldCA9IHRoaXMuY29kZS5sZW5ndGg7XG4gIHRoaXMuY29kZSArPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIHRoaXMudXNlckNvZGVMZW5ndGggPSB0aGlzLmNvZGUubGVuZ3RoIC0gdGhpcy51c2VyQ29kZVN0YXJ0T2Zmc2V0O1xuXG4gIHZhciBzZXNzaW9uID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5hY2VFZGl0b3IuZ2V0U2Vzc2lvbigpO1xuICB0aGlzLmN1bXVsYXRpdmVMZW5ndGggPSBjb2RlZ2VuLmFjZUNhbGN1bGF0ZUN1bXVsYXRpdmVMZW5ndGgoc2Vzc2lvbik7XG5cbiAgdmFyIGluaXRGdW5jID0gXy5iaW5kKGZ1bmN0aW9uKGludGVycHJldGVyLCBzY29wZSkge1xuICAgIGNvZGVnZW4uaW5pdEpTSW50ZXJwcmV0ZXIoaW50ZXJwcmV0ZXIsIG51bGwsIG51bGwsIHNjb3BlLCB7XG4gICAgICBUdXJ0bGU6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0sIHRoaXMpO1xuICB0aGlzLmludGVycHJldGVyID0gbmV3IHdpbmRvdy5JbnRlcnByZXRlcih0aGlzLmNvZGUsIGluaXRGdW5jKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hcGkubG9nID0gW107XG5cbiAgLy8gUmVzZXQgdGhlIGdyYXBoaWMuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuZ2VuZXJhdGVUdXJ0bGVDb2RlRnJvbUpTXygpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICAvLyBhcGkubG9nIG5vdyBjb250YWlucyBhIHRyYW5zY3JpcHQgb2YgYWxsIHRoZSB1c2VyJ3MgYWN0aW9ucy5cbiAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnc3RhcnQnLCB7bG9vcCA6IHRydWV9KTtcbiAgLy8gYW5pbWF0ZSB0aGUgdHJhbnNjcmlwdC5cblxuICB0aGlzLnBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KF8uYmluZCh0aGlzLmFuaW1hdGUsIHRoaXMpLCAxMDApO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTcGVjaWFsIGNhc2U6IGlmIHdlIGhhdmUgYSB0dXJuLCBmb2xsb3dlZCBieSBhIG1vdmUgZm9yd2FyZCwgdGhlbiB3ZSBjYW4ganVzdFxuICogZG8gdGhlIHR1cm4gaW5zdGFudGx5IGFuZCB0aGVuIGJlZ2luIHRoZSBtb3ZlIGZvcndhcmQgaW4gdGhlIHNhbWUgZnJhbWUuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuY2hlY2tmb3JUdXJuQW5kTW92ZV8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuZXh0SXNGb3J3YXJkID0gZmFsc2U7XG5cbiAgdmFyIGN1cnJlbnRUdXBsZSA9IHRoaXMuYXBpLmxvZ1swXTtcbiAgdmFyIGN1cnJlbnRDb21tYW5kID0gY3VycmVudFR1cGxlWzBdO1xuICB2YXIgY3VycmVudFZhbHVlcyA9IGN1cnJlbnRUdXBsZS5zbGljZSgxKTtcblxuICAvLyBDaGVjayBmaXJzdCBmb3IgYSBzbWFsbCB0dXJuIG1vdmVtZW50LlxuICBpZiAoY3VycmVudENvbW1hbmQgPT09ICdSVCcpIHtcbiAgICB2YXIgY3VycmVudEFuZ2xlID0gY3VycmVudFZhbHVlc1swXTtcbiAgICBpZiAoTWF0aC5hYnMoY3VycmVudEFuZ2xlKSA8PSAxMCkge1xuICAgICAgLy8gQ2hlY2sgdGhhdCBuZXh0IGNvbW1hbmQgaXMgYSBtb3ZlIGZvcndhcmQuXG4gICAgICBpZiAodGhpcy5hcGkubG9nLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdmFyIG5leHRUdXBsZSA9IHRoaXMuYXBpLmxvZ1sxXTtcbiAgICAgICAgdmFyIG5leHRDb21tYW5kID0gbmV4dFR1cGxlWzBdO1xuICAgICAgICBpZiAobmV4dENvbW1hbmQgPT09ICdGRCcpIHtcbiAgICAgICAgICBuZXh0SXNGb3J3YXJkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXh0SXNGb3J3YXJkO1xufTtcblxuXG4vKipcbiAqIEF0dGVtcHQgdG8gZXhlY3V0ZSBvbmUgY29tbWFuZCBmcm9tIHRoZSBsb2cgb2YgQVBJIGNvbW1hbmRzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmV4ZWN1dGVUdXBsZV8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmFwaS5sb2cubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGV4ZWN1dGVTZWNvbmRUdXBsZTtcblxuICBkbyB7XG4gICAgLy8gVW5sZXNzIHNvbWV0aGluZyBzcGVjaWFsIGhhcHBlbnMsIHdlIHdpbGwganVzdCBleGVjdXRlIGEgc2luZ2xlIHR1cGxlLlxuICAgIGV4ZWN1dGVTZWNvbmRUdXBsZSA9IGZhbHNlO1xuXG4gICAgdmFyIHR1cGxlID0gdGhpcy5hcGkubG9nWzBdO1xuICAgIHZhciBjb21tYW5kID0gdHVwbGVbMF07XG4gICAgdmFyIGlkID0gdHVwbGVbdHVwbGUubGVuZ3RoLTFdO1xuXG4gICAgdGhpcy5zdHVkaW9BcHBfLmhpZ2hsaWdodChTdHJpbmcoaWQpKTtcblxuICAgIC8vIFNob3VsZCB3ZSBleGVjdXRlIGFub3RoZXIgdHVwbGUgaW4gdGhpcyBmcmFtZSBvZiBhbmltYXRpb24/XG4gICAgaWYgKHRoaXMuc2tpbi5jb25zb2xpZGF0ZVR1cm5BbmRNb3ZlICYmIHRoaXMuY2hlY2tmb3JUdXJuQW5kTW92ZV8oKSkge1xuICAgICAgZXhlY3V0ZVNlY29uZFR1cGxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXZSBvbmx5IHNtb290aCBhbmltYXRlIGZvciBBbm5hICYgRWxzYSwgYW5kIG9ubHkgaWYgdGhlcmUgaXMgbm90IGFub3RoZXIgdHVwbGUgdG8gYmUgZG9uZS5cbiAgICB2YXIgdHVwbGVEb25lID0gdGhpcy5zdGVwKGNvbW1hbmQsIHR1cGxlLnNsaWNlKDEpLCB7c21vb3RoQW5pbWF0ZTogdGhpcy5za2luLnNtb290aEFuaW1hdGUgJiYgIWV4ZWN1dGVTZWNvbmRUdXBsZX0pO1xuICAgIHRoaXMuZGlzcGxheSgpO1xuXG4gICAgaWYgKHR1cGxlRG9uZSkge1xuICAgICAgdGhpcy5hcGkubG9nLnNoaWZ0KCk7XG4gICAgICB0aGlzLnJlc2V0U3RlcEluZm9fKCk7XG4gICAgfVxuICB9IHdoaWxlIChleGVjdXRlU2Vjb25kVHVwbGUpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIHRhc2tzIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIHVzZXIgcHJvZ3JhbSBpcyBmaW5pc2hlZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5maW5pc2hFeGVjdXRpb25fID0gZnVuY3Rpb24gKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5oaWdobGlnaHRCbG9jayhudWxsKTtcbiAgfVxuICB0aGlzLmNoZWNrQW5zd2VyKCk7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgdGhyb3VnaCB0aGUgcmVjb3JkZWQgcGF0aCBhbmQgYW5pbWF0ZSB0aGUgdHVydGxlJ3MgYWN0aW9ucy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gQWxsIHRhc2tzIHNob3VsZCBiZSBjb21wbGV0ZSBub3cuICBDbGVhbiB1cCB0aGUgUElEIGxpc3QuXG4gIHRoaXMucGlkID0gMDtcblxuICAvLyBTY2FsZSB0aGUgc3BlZWQgbm9uLWxpbmVhcmx5LCB0byBnaXZlIGJldHRlciBwcmVjaXNpb24gYXQgdGhlIGZhc3QgZW5kLlxuICB2YXIgc3RlcFNwZWVkID0gMTAwMCAqIE1hdGgucG93KDEgLSB0aGlzLnNwZWVkU2xpZGVyLmdldFZhbHVlKCksIDIpIC8gdGhpcy5za2luLnNwZWVkTW9kaWZpZXI7XG5cbiAgLy8gd2hlbiBzbW9vdGhBbmltYXRlIGlzIHRydWUsIHdlIGRpdmlkZSBsb25nIHN0ZXBzIGludG8gcGFydGl0aW9ucyBvZiB0aGlzXG4gIC8vIHNpemUuXG4gIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplID0gKHN0ZXBTcGVlZCA9PT0gMCA/XG4gICAgRkFTVF9TTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgOiBTTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUpO1xuXG4gIGlmICh0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdmFyIHN0ZXBwZWQgPSB0cnVlO1xuICAgIHdoaWxlIChzdGVwcGVkKSB7XG4gICAgICBjb2RlZ2VuLnNlbGVjdEN1cnJlbnRDb2RlKHRoaXMuaW50ZXJwcmV0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VtdWxhdGl2ZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyQ29kZVN0YXJ0T2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJDb2RlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHN0ZXBwZWQgPSB0aGlzLmludGVycHJldGVyLnN0ZXAoKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICAvLyBUT0RPIChjcGlyaWNoKTogcG9wdWxhdGUgbGluZU51bWJlciBhcyB3ZSBkbyBmb3Igc3R1ZGlvL2FwcGxhYjpcbiAgICAgICAgdGhpcy5leGVjdXRpb25FcnJvciA9IHsgZXJyOiBlcnIsIGxpbmVOdW1iZXI6IDEgfTtcbiAgICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN0ZXBwZWQgPSB0aGlzLmludGVycHJldGVyLnN0ZXAoKTtcblxuICAgICAgaWYgKHRoaXMuZXhlY3V0ZVR1cGxlXygpKSB7XG4gICAgICAgIC8vIFdlIHN0ZXBwZWQgZmFyIGVub3VnaCB0aGF0IHdlIGV4ZWN1dGVkIGEgY29tbW1hbmQsIGJyZWFrIG91dDpcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghc3RlcHBlZCAmJiAhdGhpcy5leGVjdXRlVHVwbGVfKCkpIHtcbiAgICAgIC8vIFdlIGRyb3BwZWQgb3V0IG9mIHRoZSBzdGVwIGxvb3AgYmVjYXVzZSB3ZSByYW4gb3V0IG9mIGNvZGUsIGFsbCBkb25lOlxuICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICghdGhpcy5leGVjdXRlVHVwbGVfKCkpIHtcbiAgICAgIHRoaXMuZmluaXNoRXhlY3V0aW9uXygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMucGlkID0gd2luZG93LnNldFRpbWVvdXQoXy5iaW5kKHRoaXMuYW5pbWF0ZSwgdGhpcyksIHN0ZXBTcGVlZCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUgPSBmdW5jdGlvbihvcHRpb25zLCBkaXN0YW5jZSkge1xuICB2YXIgdHVwbGVEb25lID0gdHJ1ZTtcbiAgdmFyIHN0ZXBEaXN0YW5jZUNvdmVyZWQgPSB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQ7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zbW9vdGhBbmltYXRlKSB7XG4gICAgdmFyIGZ1bGxEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIHZhciBzbW9vdGhBbmltYXRlU3RlcFNpemUgPSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZTtcblxuICAgIGlmIChmdWxsRGlzdGFuY2UgPCAwKSB7XG4gICAgICAvLyBHb2luZyBiYWNrd2FyZC5cbiAgICAgIGlmIChzdGVwRGlzdGFuY2VDb3ZlcmVkIC0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplIDw9IGZ1bGxEaXN0YW5jZSkge1xuICAgICAgICAvLyBjbGFtcCBhdCBtYXhpbXVtXG4gICAgICAgIGRpc3RhbmNlID0gZnVsbERpc3RhbmNlIC0gc3RlcERpc3RhbmNlQ292ZXJlZDtcbiAgICAgICAgc3RlcERpc3RhbmNlQ292ZXJlZCA9IGZ1bGxEaXN0YW5jZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3RhbmNlID0gLXNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgc3RlcERpc3RhbmNlQ292ZXJlZCAtPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHR1cGxlRG9uZSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEdvaW5nIGZvd2FyZC5cbiAgICAgIGlmIChzdGVwRGlzdGFuY2VDb3ZlcmVkICsgc21vb3RoQW5pbWF0ZVN0ZXBTaXplID49IGZ1bGxEaXN0YW5jZSkge1xuICAgICAgICAvLyBjbGFtcCBhdCBtYXhpbXVtXG4gICAgICAgIGRpc3RhbmNlID0gZnVsbERpc3RhbmNlIC0gc3RlcERpc3RhbmNlQ292ZXJlZDtcbiAgICAgICAgc3RlcERpc3RhbmNlQ292ZXJlZCA9IGZ1bGxEaXN0YW5jZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3RhbmNlID0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkICs9IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgdHVwbGVEb25lID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkID0gc3RlcERpc3RhbmNlQ292ZXJlZDtcblxuICByZXR1cm4geyB0dXBsZURvbmU6IHR1cGxlRG9uZSwgZGlzdGFuY2U6IGRpc3RhbmNlIH07XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgb25lIHN0ZXAuXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZCBMb2dvLXN0eWxlIGNvbW1hbmQgKGUuZy4gJ0ZEJyBvciAnUlQnKS5cbiAqIEBwYXJhbSB7IUFycmF5fSB2YWx1ZXMgTGlzdCBvZiBhcmd1bWVudHMgZm9yIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyYWN0aW9uIEhvdyBtdWNoIG9mIHRoaXMgc3RlcCdzIGRpc3RhbmNlIGRvIHdlIGRyYXc/XG4gKiBAcGFyYW0ge29iamVjdH0gc2luZ2xlIG9wdGlvbiBmb3Igbm93OiBzbW9vdGhBbmltYXRlICh0cnVlL2ZhbHNlKVxuICovXG5BcnRpc3QucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbihjb21tYW5kLCB2YWx1ZXMsIG9wdGlvbnMpIHtcbiAgdmFyIHR1cGxlRG9uZSA9IHRydWU7XG4gIHZhciByZXN1bHQ7XG4gIHZhciBkaXN0YW5jZTtcbiAgdmFyIGhlYWRpbmc7XG5cbiAgc3dpdGNoIChjb21tYW5kKSB7XG4gICAgY2FzZSAnRkQnOiAgLy8gRm9yd2FyZFxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMubW92ZUZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdKRic6ICAvLyBKdW1wIGZvcndhcmRcbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLmp1bXBGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTVYnOiAgLy8gTW92ZSAoZGlyZWN0aW9uKVxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICBoZWFkaW5nID0gdmFsdWVzWzFdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnNldEhlYWRpbmdfKGhlYWRpbmcpO1xuICAgICAgdGhpcy5tb3ZlRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0pEJzogIC8vIEp1bXAgKGRpcmVjdGlvbilcbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgaGVhZGluZyA9IHZhbHVlc1sxXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5zZXRIZWFkaW5nXyhoZWFkaW5nKTtcbiAgICAgIHRoaXMuanVtcEZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdSVCc6ICAvLyBSaWdodCBUdXJuXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy50dXJuQnlEZWdyZWVzXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRFAnOiAgLy8gRHJhdyBQcmludFxuICAgICAgdGhpcy5jdHhTY3JhdGNoLnNhdmUoKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnJvdGF0ZSgyICogTWF0aC5QSSAqICh0aGlzLmhlYWRpbmcgLSA5MCkgLyAzNjApO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxUZXh0KHZhbHVlc1swXSwgMCwgMCk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gucmVzdG9yZSgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnR0EnOiAgLy8gR2xvYmFsIEFscGhhXG4gICAgICB2YXIgYWxwaGEgPSB2YWx1ZXNbMF07XG4gICAgICBhbHBoYSA9IE1hdGgubWF4KDAsIGFscGhhKTtcbiAgICAgIGFscGhhID0gTWF0aC5taW4oMTAwLCBhbHBoYSk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZ2xvYmFsQWxwaGEgPSBhbHBoYSAvIDEwMDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0RGJzogIC8vIERyYXcgRm9udFxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmZvbnQgPSB2YWx1ZXNbMl0gKyAnICcgKyB2YWx1ZXNbMV0gKyAncHQgJyArIHZhbHVlc1swXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BVJzogIC8vIFBlbiBVcFxuICAgICAgdGhpcy5wZW5Eb3duVmFsdWUgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BEJzogIC8vIFBlbiBEb3duXG4gICAgICB0aGlzLnBlbkRvd25WYWx1ZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQVyc6ICAvLyBQZW4gV2lkdGhcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSB2YWx1ZXNbMF07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQQyc6ICAvLyBQZW4gQ29sb3VyXG4gICAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlU3R5bGUgPSB2YWx1ZXNbMF07XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gdmFsdWVzWzBdO1xuICAgICAgaWYgKHRoaXMuc2tpbi5pZCAhPSBcImFubmFcIiAmJiB0aGlzLnNraW4uaWQgIT0gXCJlbHNhXCIpIHtcbiAgICAgICAgdGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybiA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFMnOiAgLy8gUGVuIHN0eWxlIHdpdGggaW1hZ2VcbiAgICAgIGlmICghdmFsdWVzWzBdIHx8IHZhbHVlc1swXSA9PSAnREVGQVVMVCcpIHtcbiAgICAgICAgICB0aGlzLnNldFBhdHRlcm4obnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFBhdHRlcm4odmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0hUJzogIC8vIEhpZGUgVHVydGxlXG4gICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NUJzogIC8vIFNob3cgVHVydGxlXG4gICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhbXAnOlxuICAgICAgdmFyIGltZyA9IHRoaXMuc3RhbXBzW3ZhbHVlc1swXV07XG4gICAgICB2YXIgd2lkdGggPSBpbWcud2lkdGggLyAyO1xuICAgICAgdmFyIGhlaWdodCA9IGltZy5oZWlnaHQgLyAyO1xuICAgICAgdmFyIHggPSB0aGlzLnggLSB3aWR0aCAvIDI7XG4gICAgICB2YXIgeSA9IHRoaXMueSAtIGhlaWdodCAvIDI7XG4gICAgICBpZiAoaW1nLndpZHRoICE9PSAwKSB7XG4gICAgICAgIHRoaXMuY3R4U2NyYXRjaC5kcmF3SW1hZ2UoaW1nLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHR1cGxlRG9uZTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2V0UGF0dGVybiA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gIGlmICh0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXSkge1xuICAgIHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuID0gdGhpcy5sb2FkZWRQYXRoUGF0dGVybnNbcGF0dGVybl07XG4gICAgdGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybiA9IHRydWU7XG4gIH0gZWxzZSBpZiAocGF0dGVybiA9PT0gbnVsbCkge1xuICAgIHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmp1bXBGb3J3YXJkXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB0aGlzLnggKz0gZGlzdGFuY2UgKiBNYXRoLnNpbigyICogTWF0aC5QSSAqIHRoaXMuaGVhZGluZyAvIDM2MCk7XG4gIHRoaXMueSAtPSBkaXN0YW5jZSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogdGhpcy5oZWFkaW5nIC8gMzYwKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUubW92ZUJ5UmVsYXRpdmVQb3NpdGlvbl8gPSBmdW5jdGlvbiAoeCwgeSkge1xuICB0aGlzLnggKz0geDtcbiAgdGhpcy55ICs9IHk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRvdEF0XyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIC8vIFdlYktpdCAodW5saWtlIEdlY2tvKSBkcmF3cyBub3RoaW5nIGZvciBhIHplcm8tbGVuZ3RoIGxpbmUsIHNvIGRyYXcgYSB2ZXJ5IHNob3J0IGxpbmUuXG4gIHZhciBkb3RMaW5lTGVuZ3RoID0gMC4xO1xuICB0aGlzLmN0eFNjcmF0Y2gubGluZVRvKHggKyBkb3RMaW5lTGVuZ3RoLCB5KTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY2lyY2xlQXRfID0gZnVuY3Rpb24gKHgsIHksIHJhZGl1cykge1xuICB0aGlzLmN0eFNjcmF0Y2guYXJjKHgsIHksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3VG9UdXJ0bGVfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciBpc0RvdCA9IChkaXN0YW5jZSA9PT0gMCk7XG4gIGlmIChpc0RvdCkge1xuICAgIHRoaXMuZG90QXRfKHRoaXMueCwgdGhpcy55KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS50dXJuQnlEZWdyZWVzXyA9IGZ1bmN0aW9uIChkZWdyZWVzUmlnaHQpIHtcbiAgdGhpcy5zZXRIZWFkaW5nXyh0aGlzLmhlYWRpbmcgKyBkZWdyZWVzUmlnaHQpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zZXRIZWFkaW5nXyA9IGZ1bmN0aW9uIChoZWFkaW5nKSB7XG4gIGhlYWRpbmcgPSB0aGlzLmNvbnN0cmFpbkRlZ3JlZXNfKGhlYWRpbmcpO1xuICB0aGlzLmhlYWRpbmcgPSBoZWFkaW5nO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5jb25zdHJhaW5EZWdyZWVzXyA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gIGRlZ3JlZXMgJT0gMzYwO1xuICBpZiAoZGVncmVlcyA8IDApIHtcbiAgICBkZWdyZWVzICs9IDM2MDtcbiAgfVxuICByZXR1cm4gZGVncmVlcztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUubW92ZUZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIGlmICghdGhpcy5wZW5Eb3duVmFsdWUpIHtcbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuKSB7XG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVXaXRoUGF0dGVybl8oZGlzdGFuY2UpO1xuXG4gICAgLy8gRnJvemVuIGdldHMgYm90aCBhIHBhdHRlcm4gYW5kIGEgbGluZSBvdmVyIHRoZSB0b3Agb2YgaXQuXG4gICAgaWYgKHRoaXMuc2tpbi5pZCAhPSBcImVsc2FcIiAmJiB0aGlzLnNraW4uaWQgIT0gXCJhbm5hXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICB0aGlzLmRyYXdGb3J3YXJkXyhkaXN0YW5jZSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdGb3J3YXJkXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICBpZiAodGhpcy5zaG91bGREcmF3Sm9pbnRzXygpKSB7XG4gICAgdGhpcy5kcmF3Rm9yd2FyZFdpdGhKb2ludHNfKGRpc3RhbmNlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZV8oZGlzdGFuY2UpO1xuICB9XG59O1xuXG4vKipcbiAqIERyYXdzIGEgbGluZSBvZiBsZW5ndGggYGRpc3RhbmNlYCwgYWRkaW5nIGpvaW50IGtub2JzIGFsb25nIHRoZSB3YXlcbiAqIEBwYXJhbSBkaXN0YW5jZVxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdGb3J3YXJkV2l0aEpvaW50c18gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIHJlbWFpbmluZ0Rpc3RhbmNlID0gZGlzdGFuY2U7XG5cbiAgd2hpbGUgKHJlbWFpbmluZ0Rpc3RhbmNlID4gMCkge1xuICAgIHZhciBlbm91Z2hGb3JGdWxsU2VnbWVudCA9IHJlbWFpbmluZ0Rpc3RhbmNlID49IEpPSU5UX1NFR01FTlRfTEVOR1RIO1xuICAgIHZhciBjdXJyZW50U2VnbWVudExlbmd0aCA9IGVub3VnaEZvckZ1bGxTZWdtZW50ID8gSk9JTlRfU0VHTUVOVF9MRU5HVEggOiByZW1haW5pbmdEaXN0YW5jZTtcblxuICAgIHJlbWFpbmluZ0Rpc3RhbmNlIC09IGN1cnJlbnRTZWdtZW50TGVuZ3RoO1xuXG4gICAgaWYgKGVub3VnaEZvckZ1bGxTZWdtZW50KSB7XG4gICAgICB0aGlzLmRyYXdKb2ludEF0VHVydGxlXygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lXyhjdXJyZW50U2VnbWVudExlbmd0aCk7XG5cbiAgICBpZiAoZW5vdWdoRm9yRnVsbFNlZ21lbnQpIHtcbiAgICAgIHRoaXMuZHJhd0pvaW50QXRUdXJ0bGVfKCk7XG4gICAgfVxuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdGb3J3YXJkTGluZV8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gubW92ZVRvKHRoaXMuc3RlcFN0YXJ0WCwgdGhpcy5zdGVwU3RhcnRZKTtcbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5kcmF3VG9UdXJ0bGVfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmRyYXdUb1R1cnRsZV8oZGlzdGFuY2UpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2UoKTtcbiAgfVxuXG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdGb3J3YXJkTGluZVdpdGhQYXR0ZXJuXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgaW1nO1xuICB2YXIgc3RhcnRYO1xuICB2YXIgc3RhcnRZO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhQYXR0ZXJuLm1vdmVUbyh0aGlzLnN0ZXBTdGFydFgsIHRoaXMuc3RlcFN0YXJ0WSk7XG4gICAgaW1nID0gdGhpcy5jdXJyZW50UGF0aFBhdHRlcm47XG4gICAgc3RhcnRYID0gdGhpcy5zdGVwU3RhcnRYO1xuICAgIHN0YXJ0WSA9IHRoaXMuc3RlcFN0YXJ0WTtcblxuICAgIHZhciBsaW5lRGlzdGFuY2UgPSBNYXRoLmFicyh0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQpO1xuXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnNhdmUoKTtcbiAgICB0aGlzLmN0eFBhdHRlcm4udHJhbnNsYXRlKHN0YXJ0WCwgc3RhcnRZKTtcbiAgICAvLyBpbmNyZW1lbnQgdGhlIGFuZ2xlIGFuZCByb3RhdGUgdGhlIGltYWdlLlxuICAgIC8vIE5lZWQgdG8gc3VidHJhY3QgOTAgdG8gYWNjb21vZGF0ZSBkaWZmZXJlbmNlIGluIGNhbnZhcyB2cy4gVHVydGxlIGRpcmVjdGlvblxuICAgIHRoaXMuY3R4UGF0dGVybi5yb3RhdGUoTWF0aC5QSSAqICh0aGlzLmhlYWRpbmcgLSA5MCkgLyAxODApO1xuXG4gICAgdmFyIGNsaXBTaXplO1xuICAgIGlmIChsaW5lRGlzdGFuY2UgJSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZSA9PT0gMCkge1xuICAgICAgY2xpcFNpemUgPSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICB9IGVsc2UgaWYgKGxpbmVEaXN0YW5jZSA+IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplKSB7XG4gICAgICAvLyB0aGlzIGhhcHBlbnMgd2hlbiBvdXIgbGluZSB3YXMgbm90IGRpdmlzaWJsZSBieSBzbW9vdGhBbmltYXRlU3RlcFNpemVcbiAgICAgIC8vIGFuZCB3ZSd2ZSBoaXQgb3VyIGxhc3QgY2h1bmtcbiAgICAgIGNsaXBTaXplID0gbGluZURpc3RhbmNlICUgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaXBTaXplID0gbGluZURpc3RhbmNlO1xuICAgIH1cbiAgICBpZiAoaW1nLndpZHRoICE9PSAwKSB7XG4gICAgICB0aGlzLmN0eFBhdHRlcm4uZHJhd0ltYWdlKGltZyxcbiAgICAgICAgLy8gU3RhcnQgcG9pbnQgZm9yIGNsaXBwaW5nIGltYWdlXG4gICAgICAgIE1hdGgucm91bmQobGluZURpc3RhbmNlKSwgMCxcbiAgICAgICAgLy8gY2xpcCByZWdpb24gc2l6ZVxuICAgICAgICBjbGlwU2l6ZSwgaW1nLmhlaWdodCxcbiAgICAgICAgLy8gc29tZSBteXN0ZXJpb3VzIGhhbmQtdHdlYWtpbmcgZG9uZSBieSBCcmVuZGFuXG4gICAgICAgIE1hdGgucm91bmQoKHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCAtIGNsaXBTaXplIC0gMikpLCBNYXRoLnJvdW5kKCgtIDE4KSksXG4gICAgICAgIGNsaXBTaXplLCBpbWcuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICB0aGlzLmN0eFBhdHRlcm4ucmVzdG9yZSgpO1xuXG4gIH0gZWxzZSB7XG5cbiAgICB0aGlzLmN0eFNjcmF0Y2gubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgICBpbWcgPSB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybjtcbiAgICBzdGFydFggPSB0aGlzLng7XG4gICAgc3RhcnRZID0gdGhpcy55O1xuXG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zYXZlKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnRyYW5zbGF0ZShzdGFydFgsIHN0YXJ0WSk7XG4gICAgLy8gaW5jcmVtZW50IHRoZSBhbmdsZSBhbmQgcm90YXRlIHRoZSBpbWFnZS5cbiAgICAvLyBOZWVkIHRvIHN1YnRyYWN0IDkwIHRvIGFjY29tb2RhdGUgZGlmZmVyZW5jZSBpbiBjYW52YXMgdnMuIFR1cnRsZSBkaXJlY3Rpb25cbiAgICB0aGlzLmN0eFNjcmF0Y2gucm90YXRlKE1hdGguUEkgKiAodGhpcy5oZWFkaW5nIC0gOTApIC8gMTgwKTtcblxuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5kcmF3SW1hZ2UoaW1nLFxuICAgICAgICAvLyBTdGFydCBwb2ludCBmb3IgY2xpcHBpbmcgaW1hZ2VcbiAgICAgICAgMCwgMCxcbiAgICAgICAgLy8gY2xpcCByZWdpb24gc2l6ZVxuICAgICAgICBkaXN0YW5jZStpbWcuaGVpZ2h0IC8gMiwgaW1nLmhlaWdodCxcbiAgICAgICAgLy8gZHJhdyBsb2NhdGlvbiByZWxhdGl2ZSB0byB0aGUgY3R4LnRyYW5zbGF0ZSBwb2ludCBwcmUtcm90YXRpb25cbiAgICAgICAgLWltZy5oZWlnaHQgLyA0LCAtaW1nLmhlaWdodCAvIDIsXG4gICAgICAgIGRpc3RhbmNlK2ltZy5oZWlnaHQgLyAyLCBpbWcuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICB0aGlzLmN0eFNjcmF0Y2gucmVzdG9yZSgpO1xuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnNob3VsZERyYXdKb2ludHNfID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5sZXZlbC5pc0sxICYmICF0aGlzLmlzUHJlZHJhd2luZ187XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdKb2ludEF0VHVydGxlXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jdHhTY3JhdGNoLmJlZ2luUGF0aCgpO1xuICB0aGlzLmN0eFNjcmF0Y2gubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgdGhpcy5jaXJjbGVBdF8odGhpcy54LCB0aGlzLnksIEpPSU5UX1JBRElVUyk7XG4gIHRoaXMuY3R4U2NyYXRjaC5zdHJva2UoKTtcbn07XG5cbi8qKlxuICogVmFsaWRhdGUgd2hldGhlciB0aGUgdXNlcidzIGFuc3dlciBpcyBjb3JyZWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IHBpeGVsRXJyb3JzIE51bWJlciBvZiBwaXhlbHMgdGhhdCBhcmUgd3JvbmcuXG4gKiBAcGFyYW0ge251bWJlcn0gcGVybWl0dGVkRXJyb3JzIE51bWJlciBvZiBwaXhlbHMgYWxsb3dlZCB0byBiZSB3cm9uZy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGxldmVsIGlzIHNvbHZlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmlzQ29ycmVjdF8gPSBmdW5jdGlvbiAocGl4ZWxFcnJvcnMsIHBlcm1pdHRlZEVycm9ycykge1xuICByZXR1cm4gcGl4ZWxFcnJvcnMgPD0gcGVybWl0dGVkRXJyb3JzO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZGlzcGxheUZlZWRiYWNrXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmVlZGJhY2tJbWFnZUNhbnZhcztcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICAvLyBGb3IgZnJvemVuIHNraW5zLCBzaG93IGJhY2tncm91bmQgYW5kIGNoYXJhY3RlcnMgYWxvbmcgd2l0aCBkcmF3aW5nXG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4RGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhTY3JhdGNoO1xuICB9XG5cbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrKHtcbiAgICBhcHA6ICd0dXJ0bGUnLFxuICAgIHNraW46IHRoaXMuc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgIHJlc3BvbnNlOiB0aGlzLnJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICBmZWVkYmFja0ltYWdlOiBmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIiksXG4gICAgLy8gYWRkICdpbXByZXNzaXZlJzp0cnVlIHRvIG5vbi1mcmVlcGxheSBsZXZlbHMgdGhhdCB3ZSBkZWVtIGFyZSByZWxhdGl2ZWx5IGltcHJlc3NpdmUgKHNlZSAjNjY5OTA0ODApXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkgfHwgbGV2ZWwuaW1wcmVzc2l2ZSksXG4gICAgLy8gaW1wcmVzc2l2ZSBsZXZlbHMgYXJlIGFscmVhZHkgc2F2ZWRcbiAgICBhbHJlYWR5U2F2ZWQ6IGxldmVsLmltcHJlc3NpdmUsXG4gICAgLy8gYWxsb3cgdXNlcnMgdG8gc2F2ZSBmcmVlcGxheSBsZXZlbHMgdG8gdGhlaXIgZ2FsbGVyeSAoaW1wcmVzc2l2ZSBub24tZnJlZXBsYXkgbGV2ZWxzIGFyZSBhdXRvc2F2ZWQpXG4gICAgc2F2ZVRvR2FsbGVyeVVybDogbGV2ZWwuZnJlZVBsYXkgJiYgdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnNhdmVfdG9fZ2FsbGVyeV91cmwsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogdHVydGxlTXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgIHNoYXJpbmdUZXh0OiB0dXJ0bGVNc2cuc2hhcmVEcmF3aW5nKClcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5zdHVkaW9BcHBfLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8vIFRoaXMgcmVtb3ZlcyBsZW5ndGhzIGZyb20gdGhlIHRleHQgdmVyc2lvbiBvZiB0aGUgWE1MIG9mIHByb2dyYW1zLlxuLy8gSXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIHVzZXIgcHJvZ3JhbSBhbmQgbW9kZWwgc29sdXRpb24gYXJlXG4vLyBpZGVudGljYWwgZXhjZXB0IGZvciBsZW5ndGhzLlxudmFyIHJlbW92ZUsxTGVuZ3RocyA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZShyZW1vdmVLMUxlbmd0aHMucmVnZXgsICdcIj4nKTtcbn07XG5cbnJlbW92ZUsxTGVuZ3Rocy5yZWdleCA9IC9fbGVuZ3RoXCI+PHRpdGxlIG5hbWU9XCJsZW5ndGhcIj4uKj88XFwvdGl0bGU+LztcblxuLyoqXG4gKiBWZXJpZnkgaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0LlxuICogSWYgc28sIG1vdmUgb24gdG8gbmV4dCBsZXZlbC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAvLyBDb21wYXJlIHRoZSBBbHBoYSAob3BhY2l0eSkgYnl0ZSBvZiBlYWNoIHBpeGVsIGluIHRoZSB1c2VyJ3MgaW1hZ2UgYW5kXG4gIC8vIHRoZSBzYW1wbGUgYW5zd2VyIGltYWdlLlxuICB2YXIgdXNlckltYWdlID1cbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5nZXRJbWFnZURhdGEoMCwgMCwgQ0FOVkFTX1dJRFRILCBDQU5WQVNfSEVJR0hUKTtcbiAgdmFyIGFuc3dlckltYWdlID1cbiAgICAgIHRoaXMuY3R4QW5zd2VyLmdldEltYWdlRGF0YSgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xuICB2YXIgbGVuID0gTWF0aC5taW4odXNlckltYWdlLmRhdGEubGVuZ3RoLCBhbnN3ZXJJbWFnZS5kYXRhLmxlbmd0aCk7XG4gIHZhciBkZWx0YSA9IDA7XG4gIC8vIFBpeGVscyBhcmUgaW4gUkdCQSBmb3JtYXQuICBPbmx5IGNoZWNrIHRoZSBBbHBoYSBieXRlcy5cbiAgZm9yICh2YXIgaSA9IDM7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIC8vIENvcHlpbmcgYW5kIGNvbXBvc2l0aW5nIGltYWdlcyBhY3Jvc3MgY2FudmFzZXMgc2VlbXMgdG8gZGlzdG9ydCB0aGVcbiAgICAvLyBhbHBoYS4gVXNlIGEgbGFyZ2UgZXJyb3IgdmFsdWUgKDI1MCkgdG8gY29tcGVuc2F0ZS5cbiAgICBpZiAoTWF0aC5hYnModXNlckltYWdlLmRhdGFbaV0gLSBhbnN3ZXJJbWFnZS5kYXRhW2ldKSA+IDI1MCkge1xuICAgICAgZGVsdGErKztcbiAgICB9XG4gIH1cblxuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIE9wdGlvbmFsbHkgYWxsb3cgc29tZSBudW1iZXIgb2YgcGl4ZWxzIHRvIGJlIG9mZiwgZGVmYXVsdCB0b1xuICAvLyBwaXhlbC1wZXJmZWN0IHN0cmljdG5lc3NcbiAgdmFyIHBlcm1pdHRlZEVycm9ycyA9IGxldmVsLnBlcm1pdHRlZEVycm9ycyB8fCAwO1xuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChsZXZlbC5mcmVlUGxheSB8fCB0aGlzLmlzQ29ycmVjdF8oZGVsdGEsIHBlcm1pdHRlZEVycm9ycykpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxldmVsLmVkaXRDb2RlIHx8ICF0aGlzLmV4ZWN1dGlvbkVycm9yKTtcbiAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgcmV1c2UgYW4gb2xkIG1lc3NhZ2UsIHNpbmNlIG5vdCBhbGwgcGF0aHMgc2V0IG9uZS5cbiAgdGhpcy5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIC8vIEluIGxldmVsIEsxLCBjaGVjayBpZiBvbmx5IGxlbmd0aHMgZGlmZmVyLlxuICBpZiAobGV2ZWwuaXNLMSAmJiAhbGV2ZWxDb21wbGV0ZSAmJiAhdGhpcy5zdHVkaW9BcHBfLmVkaXRDb2RlICYmXG4gICAgICBsZXZlbC5zb2x1dGlvbkJsb2NrcyAmJlxuICAgICAgcmVtb3ZlSzFMZW5ndGhzKHByb2dyYW0pID09PSByZW1vdmVLMUxlbmd0aHMobGV2ZWwuc29sdXRpb25CbG9ja3MpKSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRVJST1I7XG4gICAgdGhpcy5tZXNzYWdlID0gdHVydGxlTXNnLmxlbmd0aEZlZWRiYWNrKCk7XG4gIH1cblxuICAvLyBGb3IgbGV2ZWxzIHdoZXJlIHVzaW5nIHRvbyBtYW55IGJsb2NrcyB3b3VsZCBhbGxvdyBzdHVkZW50c1xuICAvLyB0byBtaXNzIHRoZSBwb2ludCwgY29udmVydCB0aGF0IGZlZWRiYWNrIHRvIGEgZmFpbHVyZS5cbiAgaWYgKGxldmVsLmZhaWxGb3JUb29NYW55QmxvY2tzICYmXG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUw7XG5cbiAgfSBlbHNlIGlmICgodGhpcy50ZXN0UmVzdWx0cyA9PVxuICAgICAgdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB8fFxuICAgICAgKHRoaXMudGVzdFJlc3VsdHMgPT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFMTF9QQVNTKSkge1xuICAgIC8vIENoZWNrIHRoYXQgdGhleSBkaWRuJ3QgdXNlIGEgY3JhenkgbGFyZ2UgcmVwZWF0IHZhbHVlIHdoZW4gZHJhd2luZyBhXG4gICAgLy8gY2lyY2xlLiAgVGhpcyBjb21wbGFpbnMgaWYgdGhlIGxpbWl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCAzLlxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIGxldmVsIGRvZXMgbm90IHVzZSBjb2xvdXIsIHNvIG5vIG5lZWQgdG8gY2hlY2sgZm9yIHRoYXQuXG4gICAgaWYgKGxldmVsLmZhaWxGb3JDaXJjbGVSZXBlYXRWYWx1ZSAmJiB0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgICAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gICAgICBpZiAoY29kZS5pbmRleE9mKCdjb3VudCA8IDMnKSA9PSAtMSkge1xuICAgICAgICB0aGlzLnRlc3RSZXN1bHRzID1cbiAgICAgICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfQUNDRVBUQUJMRV9GQUlMO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBjb21tb25Nc2cudG9vTXVjaFdvcmsoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ3R1cnRsZScsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBsZXZlbENvbXBsZXRlLFxuICAgIHRlc3RSZXN1bHQ6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IF8uYmluZCh0aGlzLm9uUmVwb3J0Q29tcGxldGUsIHRoaXMpLFxuICAgIHNhdmVfdG9fZ2FsbGVyeTogbGV2ZWwuaW1wcmVzc2l2ZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LnBpdm90YWx0cmFja2VyLmNvbS9zdG9yeS9zaG93Lzg0MTcxNTYwXG4gIC8vIE5ldmVyIHNlbmQgdXAgZnJvemVuIGltYWdlcyBmb3Igbm93LlxuICB2YXIgaXNGcm96ZW4gPSAodGhpcy5za2luLmlkID09PSAnYW5uYScgfHwgdGhpcy5za2luLmlkID09PSAnZWxzYScpO1xuXG4gIC8vIEdldCB0aGUgY2FudmFzIGRhdGEgZm9yIGZlZWRiYWNrLlxuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwgJiZcbiAgICAhaXNGcm96ZW4gJiYgKGxldmVsLmZyZWVQbGF5IHx8IGxldmVsLmltcHJlc3NpdmUpKSB7XG4gICAgcmVwb3J0RGF0YS5pbWFnZSA9IHRoaXMuZ2V0RmVlZGJhY2tJbWFnZV8oKTtcbiAgfVxuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIFRoZSBjYWxsIHRvIGRpc3BsYXlGZWVkYmFjaygpIHdpbGwgaGFwcGVuIGxhdGVyIGluIG9uUmVwb3J0Q29tcGxldGUoKVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5nZXRGZWVkYmFja0ltYWdlXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmVlZGJhY2tJbWFnZUNhbnZhcztcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhEaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eFNjcmF0Y2g7XG4gIH1cblxuICAvLyBDb3B5IHRoZSB1c2VyIGxheWVyXG4gIHRoaXMuY3R4RmVlZGJhY2suZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICB0aGlzLmN0eEZlZWRiYWNrLmRyYXdJbWFnZShmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcywgMCwgMCwgMTU0LCAxNTQpO1xuICB2YXIgZmVlZGJhY2tDYW52YXMgPSB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChcbiAgICAgIGZlZWRiYWNrQ2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKS5zcGxpdCgnLCcpWzFdKTtcbn07XG5cbi8vIEhlbHBlciBmb3IgY3JlYXRpbmcgY2FudmFzIGVsZW1lbnRzLlxuQXJ0aXN0LnByb3RvdHlwZS5jcmVhdGVDYW52YXNfID0gZnVuY3Rpb24gKGlkLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBlbC5pZCA9IGlkO1xuICBlbC53aWR0aCA9IHdpZHRoO1xuICBlbC5oZWlnaHQgPSBoZWlnaHQ7XG4gIHJldHVybiBlbDtcbn07XG5cbi8qKlxuKiBXaGVuIHNtb290aCBhbmltYXRlIGlzIHRydWUsIHN0ZXBzIGNhbiBiZSBicm9rZW4gdXAgaW50byBtdWx0aXBsZSBhbmltYXRpb25zLlxuKiBBdCB0aGUgZW5kIG9mIGVhY2ggc3RlcCwgd2Ugd2FudCB0byByZXNldCBhbnkgaW5jcmVtZW50YWwgaW5mb3JtYXRpb24sIHdoaWNoXG4qIGlzIHdoYXQgdGhpcyBkb2VzLlxuKi9cbkFydGlzdC5wcm90b3R5cGUucmVzZXRTdGVwSW5mb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RlcFN0YXJ0WCA9IHRoaXMueDtcbiAgdGhpcy5zdGVwU3RhcnRZID0gdGhpcy55O1xuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSAwO1xufTtcbiIsInZhciBsZXZlbEJhc2UgPSByZXF1aXJlKCcuLi9sZXZlbF9iYXNlJyk7XG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGFuc3dlciA9IHJlcXVpcmUoJy4vYW5zd2VycycpLmFuc3dlcjtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLy8gQW4gZWFybHkgaGFjayBpbnRyb2R1Y2VkIHNvbWUgbGV2ZWxidWlsZGVyIGxldmVscyBhcyBwYWdlIDUsIGxldmVsIDcuIExvbmdcbi8vIHRlcm0gd2UgY2FuIHByb2JhYmx5IGRvIHNvbWV0aGluZyBtdWNoIGNsZWFuZXIsIGJ1dCBmb3Igbm93IEknbSBjYWxsaW5nXG4vLyBvdXQgdGhhdCB0aGlzIGxldmVsIGlzIHNwZWNpYWwgKG9uIHBhZ2UgNSkuXG52YXIgTEVWRUxCVUlMREVSX0xFVkVMID0gNztcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCB0b29sYm94LlxudmFyIHRvb2xib3ggPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi90b29sYm94LnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHN0YXJ0QmxvY2tzLlxudmFyIHN0YXJ0QmxvY2tzID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vc3RhcnRCbG9ja3MueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbnZhciByZXEgPSByZXF1aXJlKCcuL3JlcXVpcmVkQmxvY2tzJyk7XG52YXIgbWFrZU1hdGhOdW1iZXIgPSByZXEubWFrZU1hdGhOdW1iZXI7XG52YXIgc2ltcGxlQmxvY2sgPSByZXEuc2ltcGxlQmxvY2s7XG52YXIgcmVwZWF0ID0gcmVxLnJlcGVhdDtcbnZhciBkcmF3QVNxdWFyZSA9IHJlcS5kcmF3QVNxdWFyZTtcbnZhciBkcmF3QVNub3dtYW4gPSByZXEuZHJhd0FTbm93bWFuO1xudmFyIE1PVkVfRk9SV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9GT1JXQVJEX0lOTElORTtcbnZhciBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FID0gcmVxLk1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkU7XG52YXIgbW92ZUZvcndhcmRJbmxpbmUgPSByZXEubW92ZUZvcndhcmRJbmxpbmU7XG52YXIgTU9WRV9CQUNLV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9CQUNLV0FSRF9JTkxJTkU7XG52YXIgdHVybkxlZnRSZXN0cmljdGVkID0gcmVxLnR1cm5MZWZ0UmVzdHJpY3RlZDtcbnZhciB0dXJuUmlnaHRSZXN0cmljdGVkID0gcmVxLnR1cm5SaWdodFJlc3RyaWN0ZWQ7XG52YXIgdHVyblJpZ2h0QnlDb25zdGFudCA9IHJlcS50dXJuUmlnaHRCeUNvbnN0YW50O1xudmFyIHR1cm5SaWdodCA9IHJlcS50dXJuUmlnaHQ7XG52YXIgdHVybkxlZnQgPSByZXEudHVybkxlZnQ7XG52YXIgbW92ZSA9IHJlcS5tb3ZlO1xudmFyIGRyYXdUdXJuUmVzdHJpY3RlZCA9IHJlcS5kcmF3VHVyblJlc3RyaWN0ZWQ7XG52YXIgZHJhd1R1cm4gPSByZXEuZHJhd1R1cm47XG52YXIgU0VUX0NPTE9VUl9QSUNLRVIgPSByZXEuU0VUX0NPTE9VUl9QSUNLRVI7XG52YXIgU0VUX0NPTE9VUl9SQU5ET00gPSByZXEuU0VUX0NPTE9VUl9SQU5ET007XG52YXIgZGVmaW5lV2l0aEFyZyA9IHJlcS5kZWZpbmVXaXRoQXJnO1xuXG52YXIgYmxvY2tzID0ge1xuICBTSU1QTEVfTU9WRV9VUDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfdXAnKSxcbiAgU0lNUExFX01PVkVfRE9XTjogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfZG93bicpLFxuICBTSU1QTEVfTU9WRV9MRUZUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9sZWZ0JyksXG4gIFNJTVBMRV9NT1ZFX1JJR0hUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9yaWdodCcpLFxuICBTSU1QTEVfSlVNUF9VUDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfdXAnKSxcbiAgU0lNUExFX0pVTVBfRE9XTjogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfZG93bicpLFxuICBTSU1QTEVfSlVNUF9MRUZUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9sZWZ0JyksXG4gIFNJTVBMRV9KVU1QX1JJR0hUOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9yaWdodCcpLFxuICBTSU1QTEVfTU9WRV9VUF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3VwX2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9ET1dOX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfZG93bl9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfTEVGVF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2xlZnRfbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX1JJR0hUX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfcmlnaHRfbGVuZ3RoJyksXG4gIHNpbXBsZU1vdmVCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9NT1ZFX1VQICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfRE9XTiArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0xFRlQgK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9SSUdIVDtcbiAgfSxcbiAgc2ltcGxlSnVtcEJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX0pVTVBfVVAgK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9ET1dOICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfTEVGVCArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX1JJR0hUO1xuICB9LFxuICBzaW1wbGVNb3ZlTGVuZ3RoQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfTU9WRV9VUF9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9ET1dOX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0xFRlRfTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfUklHSFRfTEVOR1RIO1xuICB9XG59O1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGxldmVsLXNwZWNpZmljIHJlcXVpcmVtZW50cy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBMZXZlbCAxOiBFbC5cbiAgJzFfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAxKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1tNT1ZFX0ZPUldBUkRfSU5MSU5FXSwgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IFNxdWFyZSAod2l0aG91dCByZXBlYXQpLlxuICAnMV8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDIpLFxuICAgIGlkZWFsOiAxMSxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IFNxdWFyZSAod2l0aCByZXBlYXQpLlxuICAnMV8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDMpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldLFxuICAgICAgW3JlcGVhdCg0KV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA0OiBUcmlhbmdsZS5cbiAgJzFfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA0KSxcbiAgICBpZGVhbDogNixcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA1OiBFbnZlbG9wZS5cbiAgJzFfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA1KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCgxMjApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDY6IHRyaWFuZ2xlIGFuZCBzcXVhcmUuXG4gICcxXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNiksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoMTIwKSwgdHVybkxlZnRSZXN0cmljdGVkKDEyMCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkUsIE1PVkVfQkFDS1dBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDc6IGdsYXNzZXMuXG4gICcxXzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNyksXG4gICAgaWRlYWw6IDEzLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd1R1cm5SZXN0cmljdGVkKDkwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFtNT1ZFX0JBQ0tXQVJEX0lOTElORSwgTU9WRV9GT1JXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA4OiBzcGlrZXMuXG4gICcxXzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgOCksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbcmVwZWF0KDgpXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDk6IGNpcmNsZS5cbiAgJzFfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA5KSxcbiAgICBpZGVhbDogNixcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgcGVybWl0dGVkRXJyb3JzOiAxMCxcbiAgICBmYWlsRm9yQ2lyY2xlUmVwZWF0VmFsdWU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICcxXzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDEwKSxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMTApLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogdHJ1ZVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDIuXG4gIC8vIExldmVsIDE6IFNxdWFyZS5cbiAgJzJfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAxKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgICAgIHRpdGxlczogeydESVInOiAndHVyblJpZ2h0J30sXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDkwKX1cbiAgICAgIH1dLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgbW92ZSBmb3J3YXJkIG9yIGJhY2t3YXJkLCBidXQgc2hvdyBmb3J3YXJkIGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZSc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X21vdmUnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcigxMDApfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBTbWFsbCBncmVlbiBzcXVhcmUuXG4gICcyXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMiksXG4gICAgaWRlYWw6IDUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNxdWFyZSgnPz8nKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBUaHJlZSBzcXVhcmVzLlxuICAnMl8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDMpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFtkcmF3QVNxdWFyZSgxMDApXSxcbiAgICAgIFtkcmF3VHVybigpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDQ6IDM2IHNxdWFyZXMuXG4gICcyXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNCksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNCksXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNTogRGlmZmVyZW50IHNpemUgc3F1YXJlcy5cbiAgJzJfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA1KSxcbiAgICBpZGVhbDogMTEsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNxdWFyZSgnPz8nKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA2OiBGb3ItbG9vcCBzcXVhcmVzLlxuICAnMl82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDYpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDYpLFxuICAgIC8vIFRoaXMgaXMgbm90IGRpc3BsYXllZCBwcm9wZXJseS5cbiAgICByZXF1aXJlZEJsb2NrczogW1tzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNzogQm94eSBzcGlyYWwuXG4gICcyXzcnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDIsIDcpLFxuICAgIGlkZWFsOiA5LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbc2ltcGxlQmxvY2soJ2NvbnRyb2xzX2Zvcl9jb3VudGVyJyldLFxuICAgICAgW21vdmUoJz8/JyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBQcmVwIGZvciBMZXZlbCA4OiBUd28gc25vd21lbi5cbiAgJzJfN181Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDcuNSksXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA3LjUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKDI1MCldLFxuICAgICAgW2RyYXdBU25vd21hbigxMDApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgODogVGhyZWUgc25vd21lbi5cbiAgJzJfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA4KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGlkZWFsOiAxMixcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbigxNTApXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXSxcbiAgICAgIFt0dXJuTGVmdCg5MCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ2p1bXAnLFxuICAgICAgICB0eXBlOiAnanVtcCcsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDEwMCl9XG4gICAgICB9XSxcbiAgICAgIFtzaW1wbGVCbG9jaygnanVtcCcpXSxcbiAgICAgIFtyZXBlYXQoMyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA5OiBTbm93bWFuIGZhbWlseS5cbiAgJzJfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA5KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGlkZWFsOiAxNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbignPz8nKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ2NvbnRyb2xzX2Zvcl9jb3VudGVyJyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV0sXG4gICAgICBbdHVybkxlZnQoOTApXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICdqdW1wJyxcbiAgICAgICAgdHlwZTogJ2p1bXAnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcig2MCl9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICcyXzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDEwKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMTApXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgMy5cbiAgLy8gTGV2ZWwgMTogQ2FsbCAnZHJhdyBhIHNxdWFyZScuXG4gICczXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMSksXG4gICAgaWRlYWw6IDE0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IENyZWF0ZSBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAnM18yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDIpLFxuICAgIGlkZWFsOiAxNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMTIwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogRmVuY2UgdGhlIGFuaW1hbHMuXG4gICczXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMyksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCAyNDddXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgNDddXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE4MiwgMTQ3XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNDogSG91c2UgdGhlIGxpb24uXG4gICczXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNCksXG4gICAgaWRlYWw6IDE5LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgzMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxOTUsIDk3XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNTogQ3JlYXRlIFwiZHJhdyBhIGhvdXNlXCIuXG4gICczXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNSksXG4gICAgaWRlYWw6IDIxLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmRlZmluZShtc2cuZHJhd0FIb3VzZSgpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgzMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FIb3VzZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDkwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyMjIsIDkwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNjogQWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAnM182Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDYpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDIzLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE4NSwgMTAwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzUsIDI0OF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDc6IEFkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgaG91c2VcIi5cbiAgJzNfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA3KSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVNxdWFyZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjA1LCAyMjBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA4OiBEcmF3IGhvdXNlcy5cbiAgJzNfOCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgOCksXG4gICAgaW5pdGlhbFg6IDIwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDQwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDgpLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNiwgMTcwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTUsIDI1MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxMjcsIDIyMF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjU1LCAyNTBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA5OiBEcmF3IGhvdXNlcyB3aXRoIGZvciBsb29wLlxuICAnM185Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA5KSxcbiAgICBpbml0aWFsWDogMjAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogNDAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FTcXVhcmUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFstMTAsIDI3MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbNTMsIDI1MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzUsIDIyMF1cbiAgICAgIH1cbiAgICBdLFxuICAgIGZhaWxGb3JUb29NYW55QmxvY2tzOiB0cnVlLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnM18xMCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMTApLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAxMClcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSA0LlxuICAvLyBMZXZlbCAxOiBPbmUgdHJpYW5nbGUuXG4gICc0XzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMSksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudCc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gIH0sXG4gIC8vIExldmVsIDI6IFR3byB0cmlhbmdsZXMuXG4gICc0XzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMiksXG4gICAgaWRlYWw6IDEyLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC41XG4gIH0sXG4gIC8vIExldmVsIDM6IEZvdXIgdHJpYW5nbGVzIHVzaW5nIHJlcGVhdC5cbiAgJzRfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAzKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC43XG4gIH0sXG4gIC8vIExldmVsIDQ6IFRlbiB0cmlhbmdsZXMgd2l0aCBtaXNzaW5nIHJlcGVhdCBudW1iZXIuXG4gICc0XzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNCksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuNyxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDU6IDM2IHRyaWFuZ2xlcyB3aXRoIG1pc3NpbmcgYW5nbGUgbnVtYmVyLlxuICAnNF81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDUpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNjogMSBzcXVhcmUuXG4gICc0XzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNiksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFttb3ZlRm9yd2FyZElubGluZSgyMCldLFxuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAndHVyblJpZ2h0JyxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgICBwZXJtaXR0ZWRFcnJvcnM6IDEwLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDc6IFNxdWFyZSBMYWRkZXIuXG4gICc0XzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNyksXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW21vdmVGb3J3YXJkSW5saW5lKDIwKV0sXG4gICAgICBbcmVwZWF0KDEwKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjdcbiAgfSxcbiAgLy8gTGV2ZWwgODogTGFkZGVyIHNxdWFyZS5cbiAgJzRfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA4KSxcbiAgICBpbml0aWFsWDogMTAwLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgOTogTGFkZGVyIHNxdWFyZSB3aXRoIGEgZGlmZmVyZW50IGFuZ2xlLlxuICAnNF85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDkpLFxuICAgIGluaXRpYWxYOiAxNTAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAzMzAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCAxMDogTGFkZGVyIHBvbHlnb24uXG4gICc0XzEwJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDEwKSxcbiAgICBpbml0aWFsWDogNzUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDEwKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgMTE6IHBsYXlncm91bmQuXG4gICc0XzExJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDExKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWDogNzUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDExKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMTEpLFxuICAgIHJlcXVpcmVkQmxvY2tzIDogW10sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICAgfSxcblxuICAvLyBGb3JtZXJseSBQYWdlIDUuXG4gIC8vIExldmVsIDE6IHBsYXlncm91bmQuXG4gICc1XzEnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDEpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDEpLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgMjogcGxheWdyb3VuZC5cbiAgJzVfMic6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMiksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMiksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCAzOiBwbGF5Z3JvdW5kLlxuICAnNV8zJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAzKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAzKSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDQ6IHBsYXlncm91bmQuXG4gICc1XzQnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDQpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDQpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNTogcGxheWdyb3VuZC5cbiAgJzVfNSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNSksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA2OiBwbGF5Z3JvdW5kLlxuICAnNV82Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA2KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDYpLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gVGhlIGxldmVsIGZvciBidWlsZGluZyBuZXcgbGV2ZWxzLlxuICAnYnVpbGRlcic6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCBMRVZFTEJVSUxERVJfTEVWRUwpLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIFRoZSBkZWZhdWx0IGxldmVsIG5ld2x5IGNyZWF0ZWQgbGV2ZWxzIHVzZS5cbiAgJ2N1c3RvbSc6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgTEVWRUxCVUlMREVSX0xFVkVMKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAnazFfZGVtbyc6IHtcbiAgICBhbnN3ZXI6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlzSzE6IHRydWUsXG4gICAgdG9vbGJveDogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgICAgICBibG9ja3Muc2ltcGxlTW92ZUJsb2NrcygpICtcbiAgICAgICAgYmxvY2tzLnNpbXBsZUp1bXBCbG9ja3MoKSArXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVNb3ZlTGVuZ3RoQmxvY2tzKCkgK1xuICAgICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZCcpICtcbiAgICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZHJhd19jb2xvdXJfc2ltcGxlJylcbiAgICAgICksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfVxufTtcblxubGV2ZWxzLmVjXzFfMSA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMSddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwibW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMiA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMiddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwicGVuQ29sb3VyKCcjZmYwMDAwJyk7XFxubW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMyA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMyddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwiZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcXG4gIF9fXFxufVxcblwiLFxufSk7XG5sZXZlbHMuZWNfMV80ID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV80J10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xcbiAgcGVuQ29sb3VyKCcjZmYwMDAwJyk7XFxufVxcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8xMCA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfMTAnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdwZW5XaWR0aCc6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwibW92ZUZvcndhcmQoMTAwKTtcXG5cIixcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbi8vIEFuIGVhcmx5IGhhY2sgaW50cm9kdWNlZCBzb21lIGxldmVsYnVpbGRlciBsZXZlbHMgYXMgcGFnZSA1LCBsZXZlbCA3LiBMb25nXG4vLyB0ZXJtIHdlIGNhbiBwcm9iYWJseSBkbyBzb21ldGhpbmcgbXVjaCBjbGVhbmVyLCBidXQgZm9yIG5vdyBJJ20gY2FsbGluZ1xuLy8gb3V0IHRoYXQgdGhpcyBsZXZlbCBpcyBzcGVjaWFsIChvbiBwYWdlIDUpLlxudmFyIExFVkVMQlVJTERFUl9MRVZFTCA9IDc7XG5cbi8qXG5UT09MQk9YLlxuXG5QQUdFIDFcbj09PT09PVxuV2l0aGluIHRoaXMgcGFnZSwgYmxvY2tzIGFyZSBvbmx5IGFkZGVkLCBuZXZlciB0YWtlbiBhd2F5LlxuXG5MZXZlbCAxIFtlbF06IEFkZHMgZHJhd19tb3ZlX2J5X2NvbnN0YW50IGFuZCBkcmF3X3R1cm5fYnlfY29uc3RhbnQuXG5MZXZlbCAyIFtjb2xvdXJlZCBzcXVhcmVdOiBBZGRzIGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlci5cbmxldmVsIDMgW3NxdWFyZSBpbiB0aHJlZSBibG9ja3NdOiBBZGRzIGNvbnRyb2xzX3JlcGVhdC5cbmxldmVsIDQgW3RyaWFuZ2xlXSBBZGRzIGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3JhbmRvbS5cbkxldmVsIDUgW292ZXJsYXBwaW5nIHNxdWFyZSBhbmQgdHJpYW5nbGUgKHNpZGV3YXlzIGVudmVsb3BlKV1cbkxldmVsIDYgW2VudmVsb3BlXVxuTGV2ZWwgNyBbZ2xhc3Nlc11cbkxldmVsIDggW3NwaWtlc11cbkxldmVsIDkgW2NpcmNsZV1cbkxldmVsIDEwIFtmcmVlIHBsYXldOiBkcmF3X3dpZHRoX2lubGluZVxuXG5QQUdFIDJcbj09PT09PVxuQ2F0ZWdvcmllcyBhcmUgaW50cm9kdWNlZCwgd2l0aCBjb250ZW50cyBvZjpcbi0gQWN0aW9uc1xuICAtIGRyYXdfbW92ZSB3aXRoIG1hdGhfbnVtYmVyXG4gIC0gZHJhd190dXJuIHdpdGggbWF0aF9udW1iZXJcbi0gQ29sb3JcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcGlja2VyXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3JhbmRvbVxuLSBGdW5jdGlvbnMgKGFkZGVkIGF0IGxldmVsIDIpXG4gIC0gW2NhbGxdIGRyYXcgYSBzcXVhcmVcbiAgLSBbY2FsbF0gZHJhdyBhIHNub3diYWxsIChhZGRlZCBhdCBsZXZlbCA5KVxuLSBMb29wc1xuICAtIGNvbnRyb2xzX3JlcGVhdFxuICAtIGNvbnRyb2xzX2ZvciAoYWRkZWQgYXQgbGV2ZWwgNilcbi0gTWF0aFxuICAtIG1hdGhfbnVtYmVyXG4tIFZhcmlhYmxlcyAoYWRkZWQgYXQgbGV2ZWwgNilcbiAgLSBnZXQgY291bnRlciAoYWRkZWQgYXQgbGV2ZWwgOSlcbiAgLSBnZXQgaGVpZ2h0IChhZGRlZCBhdCBsZXZlbCA3KVxuICAtIGdldCBsZW5ndGggKGxldmVscyA2IGFuZCAxMClcbkxldmVsIDEgW3NxdWFyZV1cbkxldmVsIDIgW3NxdWFyZSBieSBmdW5jdGlvbiBjYWxsXTogYWRkIFwiZHJhdyBhIHNxdWFyZVwiXG5MZXZlbCAzIFszIHNxdWFyZXNdXG5MZXZlbCA0IFszNiBzcXVhcmVzXVxuTGV2ZWwgNSBbbmVzdGVkIHNxdWFyZXMgd2l0aG91dCBjb250cm9sc19mb3JdXG5MZXZlbCA2IFtuZXN0ZWQgc3F1YXJlcyB3aXRoIGNvbnRyb2xzX2Zvcl1cbkxldmVsIDcgW21pbmktc3BpcmFsXVxuTGV2ZWwgOCBbMyBzbm93bWVuXTogYWRkIFwiZHJhdyBhIHNub3dtYW5cIlxuTGV2ZWwgOSBbc25vd21hbiBmYW1pbHldXG5MZXZlbCAxMCBbZnJlZSBwbGF5XVxuXG5QQUdFIDNcbj09PT09PVxuQ2F0ZWdvcmllcyBhcmUgdXNlZCwgd2l0aCBjb250ZW50cyBvZjpcbi0gQWN0aW9uc1xuICAtIGRyYXdfbW92ZSB3aXRoIG1hdGhfbnVtYmVyXG4gIC0gZHJhd190dXJuIHdpdGggbWF0aF9udW1iZXJcbi0gQ29sb3JcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcGlja2VyXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3JhbmRvbVxuLSBGdW5jdGlvbnMgKFJlcGxhY2VkIHdpdGggY3VzdG9tIGNhdGVnb3J5IGF0IGxldmVsIDIpXG4gIC0gW2NhbGxdIGRyYXcgYSBjaXJjbGVcbiAgLSBbY2FsbF0gZHJhdyBhIHNxdWFyZVxuLSBMb29wc1xuICAtIGNvbnRyb2xzX2ZvclxuICAtIGNvbnRyb2xzX3JlcGVhdFxuLSBNYXRoXG4gIC0gbWF0aF9udW1iZXJcbi0gVmFyaWFibGVzIChhZGRlZCBhdCBsZXZlbCA2KVxuICAtIGdldCBjb3VudGVyXG5WYXJpYWJsZXMgYW5kIGZ1bmN0aW9ucyBhcmUgbWFudWFsbHkgYWRkZWQgdW50aWwgTGV2ZWxzIDcgYW5kIDgsXG53aGVuIHRoZSBjdXN0b20gY2F0ZWdvcmllcyBhcmUgdXNlZFxuTGV2ZWwgMSBbY2FsbCBcImRyYXcgYSBzcXVhcmVcIl1cbkxldmVsIDIgW2NyZWF0ZSBhbmQgY2FsbCBcImRyYXcgYSB0cmlhbmdsZVwiXVxuTGV2ZWwgMyBbdXNlIFwiZHJhdyBhIHNxdWFyZVwiIGFuZCBcImRyYXcgYSB0cmlhbmdsZVwiIHRvIGZlbmNlIGFuaW1hbHNdXG5MZXZlbCA0IFtkcmF3IGEgaG91c2VdXG5MZXZlbCA1IFtjcmVhdGUgYW5kIGNhbGwgXCJkcmF3IGEgaG91c2VcIl1cbkxldmVsIDYgW2FkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgdHJpYW5nbGVcIl1cbkxldmVsIDcgW2FkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgaG91c2VcIl1cbkxldmVsIDggW21vZGlmeSBlbmQgbG9jYXRpb24gb2YgXCJjcmVhdGUgYSBob3VzZVwiXVxuTGV2ZWwgOSBbY2FsbCBcImRyYXcgYSBob3VzZVwiIHdpdGggZm9yIGxvb3BdXG5MZXZlbCAxMCBbZnJlZSBwbGF5XVxuXG4qLzsgYnVmLnB1c2goJzx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgJyk7OTI7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudCcpOzkzOyBpZiAobGV2ZWwgPD0gOCkgeyA7IGJ1Zi5wdXNoKCdfcmVzdHJpY3RlZCcpOzkzOyB9IDsgYnVmLnB1c2goJ1wiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzk2OyBpZiAobGV2ZWwgPj0gMikgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwMTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDE7IGlmIChsZXZlbCA+PSA0KSB7IC8qIE91dCBvZiBudW1lcmljIG9yZGVyIHRvIG1ha2UgY29sb3VyIGJsb2NrcyBhZGphY2VudC4gKi87IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTA2OyBpZiAobGV2ZWwgPj0gMykgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTA5OyB9OyBidWYucHVzaCgnICAgICcpOzEwOTsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiIHg9XCIxNThcIiB5PVwiNjdcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMTI7IH07IGJ1Zi5wdXNoKCcgICcpOzExMjsgfSBlbHNlIGlmIChwYWdlID09IDIgfHwgcGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAgICcpOzExMjsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IGlkPVwiYWN0aW9uc1wiIG5hbWU9XCInLCBlc2NhcGUoKDExMiwgIG1zZy5jYXRUdXJ0bGUoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTIwOyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwianVtcFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTI3OyB9OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEzNDsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTM3OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzEzODsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDEzOCwgIG1zZy5jYXRDb2xvdXIoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTUwOyAvLyBGdW5jdGlvbnMgZGlmZmVyIGRlcGVuZGluZyBvbiBwYWdlIGFuZCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICAnKTsxNTA7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gMikgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNTAsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAnKTsxNTg7IGlmIChsZXZlbCA+PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAnKTsxNjU7IH07IGJ1Zi5wdXNoKCcgICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxNjY7IH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAgICAgJyk7MTY2OyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICAgICAgJyk7MTY2OyAvLyBEb24ndCB1c2UgY3VzdG9tIGNhdGVnb3J5IHlldCwgc2luY2UgaXQgYWxsb3dzIGZ1bmN0aW9uIGRlZmluaXRpb24uXG47IGJ1Zi5wdXNoKCcgICAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNjYsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTY4LCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDE3MSwgIG1zZy5kcmF3QVNxdWFyZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICAgJyk7MTc0OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCdcXG4gICAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNzUsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gICAgICAnKTsxNzY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTc2OyB9OyBidWYucHVzaCgnICAgICcpOzE3NjsgLy8gQ29udHJvbDogY29udHJvbHNfZm9yX2NvdW50ZXIgKGZyb20gcGFnZSAyLCBsZXZlbCA2KSBhbmQgcmVwZWF0LlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNzYsICBtc2cuY2F0Q29udHJvbCgpICkpLCAnXCI+XFxuICAgICAgJyk7MTc3OyBpZiAoKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA2KSB8fCAocGFnZSA9PSAzICYmIGxldmVsID49IDkpKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTk0OyB9OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxOTg7IC8vIE1hdGg6IEp1c3QgbnVtYmVyIGJsb2NrcyB1bnRpbCBmaW5hbCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTk4LCAgbXNnLmNhdE1hdGgoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48L2Jsb2NrPlxcbiAgICAgICcpOzIwMDsgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9pbnRcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9mbG9hdFwiPjwvYmxvY2s+XFxuICAgICcpOzIxNDsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMTU7IC8vIFZhcmlhYmxlcyBkZXBlbmRzIG9uIHBhZ2UgYW5kIGxldmVsLCBhbHRob3VnaCB3ZSBuZXZlciB1c2UgdGhlIGN1c3RvbSBjYXRlZ29yeVxuOyBidWYucHVzaCgnICAgICcpOzIxNTsgLy8gYmVjYXVzZSB3ZSB3YW50IHRvIG9mZmVyIHNpbXBsaWZpZWQgZ2V0dGVycyBhbmQgbm8gc2V0dGVycy5cbjsgYnVmLnB1c2goJyAgICAnKTsyMTU7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gNikgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMTUsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMTg7IH0gZWxzZSBpZiAocGFnZSA9PSAzICYmIGxldmVsID49IDYgJiYgbGV2ZWwgPCAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMTgsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIj5cXG4gICAgICAgICcpOzIxOTsgaWYgKGxldmVsID49IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgJyk7MjIwOyB9OyBidWYucHVzaCgnICAgICAgICAnKTsyMjA7IGlmIChsZXZlbCA+PSA2KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgJyk7MjIxOyB9OyBidWYucHVzaCgnICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjIyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gMyAmJiBsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMjIsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIiBjdXN0b209XCJWQVJJQUJMRVwiPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIyNDsgfTsgYnVmLnB1c2goJyAgJyk7MjI0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkgezsgYnVmLnB1c2goJyAgICAnKTsyMjQ7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTsyMjg7IGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTsyMzE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MjMxOyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjQ0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gNSkgezsgYnVmLnB1c2goJyAgJyk7MjQ0OyAvLyBLMSBzaW1wbGlmaWVkIGJsb2NrcyBmb3IgZWRpdG9yOiBrZWVwIGluIHN5bmMgd2l0aCBEYXNoYm9hcmQgYXJ0aXN0LnJiXG47IGJ1Zi5wdXNoKCcgICAgJyk7MjQ0OyBpZiAobGV2ZWwgPT09IExFVkVMQlVJTERFUl9MRVZFTCkgezsgYnVmLnB1c2goJyAgICAgIDxjYXRlZ29yeSBuYW1lPVwiSzEgU2ltcGxpZmllZFwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91cl9zaW1wbGVcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV91cFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2Rvd25cIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9sZWZ0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfcmlnaHRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV91cF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9kb3duX2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2xlZnRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfcmlnaHRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfdXBcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9kb3duXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfbGVmdFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX3JpZ2h0XCI+PC9ibG9jaz5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyNjI7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MjYyOyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgaWQ9XCJhY3Rpb25zXCIgbmFtZT1cIicsIGVzY2FwZSgoMjYyLCAgbXNnLmNhdFR1cnRsZSgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImp1bXBcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7Mjg5OyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjg5LCAgbXNnLmNhdENvbG91cigpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszMDE7IC8vIEZ1bmN0aW9uc1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzMDEsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gICAgJyk7MzAyOyBpZiAobGV2ZWwgPT09IExFVkVMQlVJTERFUl9MRVZFTCkgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIlByZWJ1aWx0XCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfdHJpYW5nbGVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZV9jdXN0b21cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2hvdXNlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9mbG93ZXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dmbGFrZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfaGV4YWdvblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3RhclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffcm9ib3RcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3JvY2tldFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfcGxhbmV0XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yaG9tYnVzXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdXBwZXJfd2F2ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2xvd2VyX3dhdmVcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszMTg7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MzE4OyAvLyBDb250cm9sOiBjb250cm9sc19mb3JfY291bnRlciBhbmQgcmVwZWF0LlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzMTgsICBtc2cuY2F0Q29udHJvbCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszMzY7IGlmIChsZXZlbCA8IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzM5OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszNDY7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICcpOzM0NzsgLy8gTG9naWNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzQ3LCAgbXNnLmNhdExvZ2ljKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2lmXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2NvbXBhcmVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfb3BlcmF0aW9uXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX25lZ2F0ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19ib29sZWFuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX251bGxcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfdGVybmFyeVwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzM1NjsgLy8gTWF0aDogSnVzdCBudW1iZXIgYmxvY2tzIHVudGlsIGZpbmFsIGxldmVsLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNTYsICBtc2cuY2F0TWF0aCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2ludFwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2Zsb2F0XCI+PC9ibG9jaz5cXG4gICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzM3MzsgLy8gVmFyaWFibGVzXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM3MywgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlZBUklBQkxFXCI+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAnKTszNzU7IH07IGJ1Zi5wdXNoKCc8L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG4vKipcbiAqIENvbW1vbiBjb2RlIGZvciBjcmVhdGluZyBwcm9jZWR1cmVzIGRyYXdpbmcgZGlmZmVyZW50IHJlZ3VsYXIgcG9seWdvbnMuXG4gKiBvcHRpb25zOlxuICogICB0aXRsZSBUaXRsZSBvZiBwcm9jZWR1cmUuXG4gKiAgIG1vZGlmaWVycyBTdHJpbmcgY29udGFpbmluZyBhbnkgb3B0aW9uYWwga2V5cyBhbmQgdmFsdWVzIGZvciB0aGUgaW5pdGlhbFxuICogICAgICAgICAgICAgPGJsb2NrPiB0YWcsIHN1Y2ggYXMgJ3g9XCIyMFwiIHk9XCIyMFwiIGVkaXRhYmxlPVwiZmFsc2VcIicuXG4gKiAgIHNpZGVzIE51bWJlciBvZiBzaWRlcy5cbiAqICAgbGVuZ3RoIDAgaWYgYSBsZW5ndGggcGFyYW1ldGVyIHNob3VsZCBiZSB1c2VkLCBhIHBvc2l0aXZlIG51bWJlciBvdGhlcndpc2VcbiAqL1xudmFyIHBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zKSB7OyBidWYucHVzaCgnPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgJywgKDE0LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgPG11dGF0aW9uPlxcbiAgICAgICcpOzE2OyBpZiAob3B0aW9ucy5sZW5ndGggPT0gMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxNiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICcpOzE3OyB9OyBidWYucHVzaCgnICAgIDwvbXV0YXRpb24+XFxuICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMTgsICBvcHRpb25zLnRpdGxlICkpLCAnPC90aXRsZT5cXG4gICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiICcsICgyMCwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+JywgZXNjYXBlKCgyMSwgIG9wdGlvbnMuc2lkZXMgKSksICc8L3RpdGxlPlxcbiAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiAnLCAoMjMsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICcpOzI1OyBpZiAob3B0aW9ucy5sZW5ndGggPT0gMCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfbGVuZ3RoXCIgJywgKDI1LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgJyk7MjY7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiAnLCAoMjYsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCgyNywgIG9wdGlvbnMubGVuZ3RoICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICcpOzI5OyB9OyBidWYucHVzaCgnICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgJywgKDMxLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiAnLCAoMzMsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDM0LCAgMzYwIC8gb3B0aW9ucy5zaWRlcyApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9zdGF0ZW1lbnQ+XFxuICA8L2Jsb2NrPlxcbicpOzQ0OyB9OzsgYnVmLnB1c2goJ1xcbicpOzQ1O1xuLyoqXG4gKiBTcGlyYWwgbmVlZHMgYSBuYW1lZCBoZWxwZXIgdGVtcGxhdGUgZm9yIHJlY3Vyc2lvbi5cbiAqIEBwYXJhbSBpIExvb3AgY29udHJvbCB2YXJpYWJsZS5cbiAqL1xudmFyIHNwaXJhbCA9IGZ1bmN0aW9uKGkpIHs7IGJ1Zi5wdXNoKCcgICcpOzUwOyBpZiAoaSA8PSA2MCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiICcpOzUwOyBpZiAoaSA9PSAyNSkgeyA7IGJ1Zi5wdXNoKCd4PVwiMzAwXCIgeT1cIjEwMFwiJyk7NTA7IH0gOyBidWYucHVzaCgnIGlubGluZT1cImZhbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoNTQsICBpICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwiZmFsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgJyk7NjY7IHNwaXJhbChpICsgNSk7IGJ1Zi5wdXNoKCcgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3MDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTs3MTsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTs3Mjtcbi8qKlxuICogRGVmaW5lIHRoZSBzdGFydGluZyBibG9ja3MgZm9yIGVhY2ggcGFnZSBhbmQgbGV2ZWwuXG4gKiBUaGVzZSBhcmUgcmVmZXJlbmNlZCBmcm9tIHR1cnRsZS5qcy5cbiAqL1xuOyBidWYucHVzaCgnXFxuJyk7Nzg7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICcpOzc4OyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+XFxuICAnKTs3OTsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkNPTE9VUlwiPiNmZjAwMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzg5OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs5OTsgfSBlbHNlIGlmIChsZXZlbCA9PSAzIHx8IGxldmVsID09IDUgfHwgbGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nKTsxMDA7IGlmIChsZXZlbCA9PSAzKSB7IDsgYnVmLnB1c2goJzQnKTsxMDA7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzMnKTsxMDA7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEwMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEwNjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cInNldC1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiIHg9XCIyMFwiIHk9XCIxMDBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlQmFja3dhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjQ1PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEyOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiAgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNTA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE1NDsgfTsgYnVmLnB1c2goJycpOzE1NDsgfSBlbHNlIGlmIChwYWdlID09IDIpIHs7IGJ1Zi5wdXNoKCcgICcpOzE1NDsgLy8gTm8gYmxvY2tzIGFyZSBwcm92aWRlZCBmb3IgbGV2ZWxzIDEgYW5kIDIuXG47IGJ1Zi5wdXNoKCcgICcpOzE1NDsgaWYgKGxldmVsID09IDMgfHwgbGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICAnKTsxNTQ7IC8vIENhbGwgXCJkcmF3IGEgc3F1YXJlXCIuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxNTc7IGlmIChsZXZlbCA9PSAzKSB7IDsgYnVmLnB1c2goJzEwMCcpOzE1NzsgfSBlbHNlIHsgOyBidWYucHVzaCgnNTAnKTsxNTc7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE2MTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgICcpOzE2MTsgLy8gVGhyZWUtc3F1YXJlIGNvZGUuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBkZWxldGFibGU9XCJmYWxzZVwiICB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIGlkPVwic2V0LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE5MDsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxOTEsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE5NDsgaWYgKGxldmVsID09IDYpIHsgOyBidWYucHVzaCgnNTAnKTsxOTQ7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzEwJyk7MTk0OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE5OTsgaWYgKGxldmVsID09IDYpIHsgOyBidWYucHVzaCgnOTAnKTsxOTk7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzEwMCcpOzE5OTsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICAnKTsyMTI7IHNwaXJhbCgyNSk7IGJ1Zi5wdXNoKCcgICcpOzIxMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3LjUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIHg9XCIyMFwiIHk9XCIyMFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjUwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIxOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA4IHx8IGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIHg9XCIyMFwiIHk9XCIyMFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTUwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIyNjsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCIgeD1cIjE1OFwiIHk9XCI2N1wiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkxPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjY2OyB9OyBidWYucHVzaCgnJyk7MjY2OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgJyk7MjY2OyAvLyBEZWZpbmUgXCJkcmF3IGEgc3F1YXJlXCIuXG47IGJ1Zi5wdXNoKCcgICcsICgyNjYsICBwb2x5Z29uKHtcbiAgICB0aXRsZTogbXNnLmRyYXdBU3F1YXJlKCksXG4gICAgbW9kaWZpZXJzOiAobGV2ZWwgPT0gOCA/ICcnIDogJ3g9XCIyMjBcIiB5PVwiNDBcIicpICsgJyBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicsXG4gICAgc2lkZXM6IDQsXG4gICAgbGVuZ3RoOiAobGV2ZWwgPj0gNiA/IDAgOiAxMDApXG4gIH0pKSwgJyAgJyk7MjcxOyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICAnKTsyNzE7IC8vIERlZmluZSBcImRyYXcgYSBjaXJjbGVcIi5cbjsgYnVmLnB1c2goJyAgICAnLCAoMjcxLCAgcG9seWdvbih7XG4gICAgICB0aXRsZTogbXNnLmRyYXdBQ2lyY2xlKCksXG4gICAgICBtb2RpZmllcnM6ICd4PVwiMjIwXCIgeT1cIjI1MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyxcbiAgICAgIHNpZGVzOiAzNjAsXG4gICAgICBsZW5ndGg6IDFcbiAgICB9KSksICcgICcpOzI3NjsgfTsgYnVmLnB1c2goJyAgJyk7Mjc2OyBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjIwXCIgeT1cIjI1MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjc3LCAgbXNnLmRyYXdBVHJpYW5nbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNzk7IH0gZWxzZSBpZiAobGV2ZWwgPj0gMykgezsgYnVmLnB1c2goJyAgICAnKTsyNzk7IC8vICBEZWZpbmUgXCJkcmF3IGEgdHJpYW5nbGVcIi5cbjsgYnVmLnB1c2goJyAgICAnLCAoMjc5LCAgcG9seWdvbih7XG4gICAgICB0aXRsZTogbXNnLmRyYXdBVHJpYW5nbGUoKSxcbiAgICAgIG1vZGlmaWVyczogKGxldmVsID09IDggPyAnJyA6ICd4PVwiMjIwXCIgeT1cIjI1MFwiJykgKyAobGV2ZWwgPT0gNiA/ICcnIDogJyBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicpLFxuICAgICAgc2lkZXM6IDMsXG4gICAgICBsZW5ndGg6IChsZXZlbCA+PSA3ID8gMCA6IDEwMClcbiAgICB9KSksICcgICcpOzI4NDsgfTsgYnVmLnB1c2goJyAgJyk7Mjg0OyBpZiAobGV2ZWwgPT0gOCApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDI4NSwgIG1zZy5kcmF3QUhvdXNlKCkgKSksICdcIj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMjg2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI5NDsgfTsgYnVmLnB1c2goJyAgJyk7Mjk0OyBpZiAobGV2ZWwgPT0gNyB8fCBsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICcpOzI5NDsgLy8gIERlZmluZSBcImRyYXcgYSBob3VzZVwiLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiICcpOzI5NDsgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCd4PVwiMjIwXCIgeT1cIjQ2MFwiJyk7Mjk0OyB9OyBidWYucHVzaCgnPiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgICcpOzI5NTsgaWYgKGxldmVsID09IDgpIHsgOyBidWYucHVzaCgnPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgyOTUsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz4nKTsyOTU7IH07IGJ1Zi5wdXNoKCcgICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjk2LCAgbXNnLmRyYXdBSG91c2UoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMjk5LCAgbXNnLmRyYXdBU3F1YXJlKCkgKSksICdcIj5cXG4gICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDMwMCwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiLz5cXG4gICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgJyk7MzAzOyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMDQsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAnKTszMDY7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgJyk7MzA5OyB9OyBidWYucHVzaCgnICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICcpOzMxNDsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMTUsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICcpOzMxNzsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgJyk7MzIwOyB9OyBidWYucHVzaCgnICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgzMzEsICBtc2cuZHJhd0FUcmlhbmdsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgzMzIsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzM1OyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgzMzYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszMzg7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzQxOyB9OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MzUxOyB9IC8vIEVuZCBvZiByZWdpb24gaW4gd2hpY2ggXCJkcmF3IGEgc3F1YXJlXCIgaXMgZGVmaW5lZC5cbjsgYnVmLnB1c2goJycpOzM1MTsgfSBlbHNlIGlmIChwYWdlID09IDQpIHs7IGJ1Zi5wdXNoKCcgICcpOzM1MTsgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiMjMwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszOTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQxOTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0NTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zNjwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDg1OyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTA3OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTQwOyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTg0OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+ODA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2Mjg7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2NzI7IH07IGJ1Zi5wdXNoKCcnKTs2NzI7IH0gZWxzZSBpZiAocGFnZSA9PSA1KSB7OyBidWYucHVzaCgnICAnKTs2NzI7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjIwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg2OTgsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzE2OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDc0MiwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTIxPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzYwOyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDc4NiwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTM0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODA0OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDgxMywgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODE0LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjI3MFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODM4LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg4NDAsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj42MDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDg0OSwgIG1zZy5zdGVwKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzg2NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjg8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDg5MywgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDg5NCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg4OTgsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIzMjBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDkyMCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoOTIyLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NjA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg5MzEsICBtc2cuc3RlcCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs5NDk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoOTUwLCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnXCI+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk1MSwgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk1MiwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkFSRzFcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjE5MFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTY3LCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTY4LCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoOTcwLCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19pZlwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiSUYwXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19jb21wYXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPkdUPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoOTc4LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4wPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE8wXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlBFTlwiPnBlbkRvd248L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TVVMVElQTFk8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTAwOSwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTMwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTAyNiwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPkRJVklERTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTgwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNDIsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDEwNDksICBtc2cuZHJhd0FUcmVlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxMDUwLCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgxMDUxLCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1JTlVTPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA1OCwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNzAsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlBFTlwiPnBlblVwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVCYWNrd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NVUxUSVBMWTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTEwMSwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzExMjU7IH07IGJ1Zi5wdXNoKCcnKTsxMTI1OyB9OyBidWYucHVzaCgnJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBTZXRzIEJsb2NrbHlBcHAgY29uc3RhbnRzIHRoYXQgZGVwZW5kIG9uIHRoZSBwYWdlIGFuZCBsZXZlbC5cbiAqIFRoaXMgZW5jYXBzdWxhdGVzIG1hbnkgZnVuY3Rpb25zIHVzZWQgZm9yIFN0dWRpb0FwcC5yZXF1aXJlZEJsb2Nrc18uXG4gKiBJbiB0aGUgZnV0dXJlLCBzb21lIG9mIHRoZXNlIG1heSBiZSBtb3ZlZCB0byBjb21tb24uanMuXG4gKi9cblxudmFyIHJlcXVpcmVkQmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL3JlcXVpcmVkX2Jsb2NrX3V0aWxzJyk7XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd19hX3NxdWFyZSBibG9jayBvbiBwYWdlIDIuXG5mdW5jdGlvbiBkcmF3QVNxdWFyZShudW1iZXIpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnZHJhd19hX3NxdWFyZScsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfYV9zcXVhcmUnLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihudW1iZXIpfX07XG59XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd19hX3Nub3dtYW4gYmxvY2sgb24gcGFnZSAyLlxuZnVuY3Rpb24gZHJhd0FTbm93bWFuKG51bWJlcikge1xuICByZXR1cm4ge3Rlc3Q6ICdkcmF3X2Ffc25vd21hbicsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfYV9zbm93bWFuJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIobnVtYmVyKX19O1xufVxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwuXG52YXIgTU9WRV9GT1JXQVJEX0lOTElORSA9IHt0ZXN0OiAnbW92ZUZvcndhcmQnLCB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50J307XG5cbi8vIGFsbG93IG1vdmUgZm9yd2FyZCBvciBiYWNrd2FyZCwgYnV0IHNob3cgZm9yd2FyZCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxudmFyIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUgPSB7XG4gIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZV9ieV9jb25zdGFudCc7XG4gIH0sXG4gIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwgd2l0aCB0aGUgZ2l2ZW4gcGl4ZWwgbnVtYmVyLlxudmFyIG1vdmVGb3J3YXJkSW5saW5lID0gZnVuY3Rpb24ocGl4ZWxzKSB7XG4gIHJldHVybiB7dGVzdDogJ21vdmVGb3J3YXJkJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBwaXhlbHN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbC5cbnZhciBNT1ZFX0JBQ0tXQVJEX0lOTElORSA9IHt0ZXN0OiAnbW92ZUJhY2t3YXJkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXM6IHsnRElSJzogJ21vdmVCYWNrd2FyZCd9fTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYSBbcmlnaHRdIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrXG4vLyBhbmQgY3JlYXRlcyB0aGUgYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkL3JlY29tbWVuZGVkIG51bWJlciBvZiBkZWdyZWVzIGFzXG4vLyBpdHMgaW5wdXQuICBUaGUgcmVzdHJpY3RlZCB0dXJuIGlzIHVzZWQgb24gdGhlIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZVxuLy8gdHV0b3JpYWwuXG52YXIgdHVyblJpZ2h0UmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAndHVyblJpZ2h0KCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhIFtsZWZ0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9ja1xuLy8gYW5kIGNyZWF0ZXMgdGhlIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZC9yZWNvbW1lbmRlZCBudW1iZXIgb2YgZGVncmVlcyBhc1xuLy8gaXRzIGlucHV0LiAgVGhlIHJlc3RyaWN0ZWQgdHVybiBpcyB1c2VkIG9uIHRoZSBlYXJsaWVyIGxldmVscyBvZiB0aGVcbi8vIHR1dG9yaWFsLlxudmFyIHR1cm5MZWZ0UmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAndHVybkxlZnQoJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBbcmlnaHRdIGRyYXdfdHVybl9ieV9jb25zdGFudCBibG9ja1xuLy8gd2l0aCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC5cbnZhciB0dXJuUmlnaHRCeUNvbnN0YW50ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50JyAmJlxuICAgICAgICAgIChkZWdyZWVzID09PSAnPz8/JyB8fFxuICAgICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQudmFsdWVUb0NvZGUoXG4gICAgICAgICAgICAgYmxvY2ssICdWQUxVRScsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9OT05FKSA9PSBkZWdyZWVzKTtcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgW3JpZ2h0XSBkcmF3X3R1cm4gYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkXG4vLyBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuICBGb3IgdGhlIGVhcmxpZXN0IGxldmVscywgdGhlIG1ldGhvZFxuLy8gdHVyblJpZ2h0UmVzdHJpY3RlZCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLlxudmFyIHR1cm5SaWdodCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybicgJiZcbiAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnRElSJykgPT0gJ3R1cm5SaWdodCc7XG4gICAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHRpdGxlczogeydESVInOiAndHVyblJpZ2h0J30sXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRlZ3JlZXMpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBsZWZ0IGRyYXdfdHVybiBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWRcbi8vIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC4gIFRoaXMgbWV0aG9kIGlzIG5vdCBhcHByb3ByaWF0ZSBmb3IgdGhlXG4vLyBlYXJsaWVzdCBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLCB3aGljaCBkbyBub3QgcHJvdmlkZSBkcmF3X3R1cm4uXG52YXIgdHVybkxlZnQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nICYmXG4gICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ0RJUicpID09ICd0dXJuTGVmdCc7XG4gICAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHRpdGxlczogeydESVInOiAndHVybkxlZnQnfSxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGVncmVlcyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbnkgZHJhd19tb3ZlIGJsb2NrIGFuZCwgaWYgbm90IHByZXNlbnQsIGNyZWF0ZXNcbi8vIG9uZSB3aXRoIHRoZSBzcGVjaWZpZWQgZGlzdGFuY2UuXG52YXIgbW92ZSA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIHJldHVybiB7dGVzdDogZnVuY3Rpb24oYmxvY2spIHtyZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlJzsgfSxcbiAgICAgICAgICB0eXBlOiAnZHJhd19tb3ZlJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGlzdGFuY2UpfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrLlxudmFyIGRyYXdUdXJuUmVzdHJpY3RlZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJztcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc31cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd190dXJuIGJsb2NrLlxudmFyIGRyYXdUdXJuID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKCc/Pz8nKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgXCJzZXQgY29sb3VyXCIgYmxvY2sgd2l0aCBhIGNvbG91ciBwaWNrZXJcbi8vIGFzIGl0cyBpbnB1dC5cbnZhciBTRVRfQ09MT1VSX1BJQ0tFUiA9IHt0ZXN0OiAncGVuQ29sb3VyKFxcJyMnLFxuICB0eXBlOiAnZHJhd19jb2xvdXInLFxuICB2YWx1ZXM6IHsnQ09MT1VSJzogJzxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+J319O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFwic2V0IGNvbG91clwiIGJsb2NrIHdpdGggYSByYW5kb20gY29sb3VyXG4vLyBnZW5lcmF0b3IgYXMgaXRzIGlucHV0LlxudmFyIFNFVF9DT0xPVVJfUkFORE9NID0ge3Rlc3Q6ICdwZW5Db2xvdXIoY29sb3VyX3JhbmRvbScsXG4gIHR5cGU6ICdkcmF3X2NvbG91cicsXG4gIHZhbHVlczogeydDT0xPVVInOiAnPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz4nfX07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJlcXVpcmVkIGJsb2NrIHNwZWNpZmljYXRpb24gZm9yIGRlZmluaW5nIGEgZnVuY3Rpb24gd2l0aCBhblxuICogYXJndW1lbnQuICBVbmxpa2UgdGhlIG90aGVyIGZ1bmN0aW9ucyB0byBjcmVhdGUgcmVxdWlyZWQgYmxvY2tzLCB0aGlzXG4gKiBpcyBkZWZpbmVkIG91dHNpZGUgb2YgVHVydGxlLnNldEJsb2NrbHlBcHBDb25zdGFudHMgYmVjYXVzZSBpdCBpcyBhY2Nlc3NlZFxuICogd2hlbiBjaGVja2luZyBmb3IgYSBwcm9jZWR1cmUgb24gbGV2ZWxzIDgtOSBvZiBUdXJ0bGUgMy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jX25hbWUgVGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGFyZ19uYW1lIFRoZSBuYW1lIG9mIHRoZSBzaW5nbGUgYXJndW1lbnQuXG4gKiBAcmV0dXJuIEEgcmVxdWlyZWQgYmxvY2sgc3BlY2lmaWNhdGlvbiB0aGF0IHRlc3RzIGZvciBhIGNhbGwgb2YgdGhlXG4gKiAgICAgc3BlY2lmaWVkIGZ1bmN0aW9uIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudCBuYW1lLiAgSWYgbm90IHByZXNlbnQsXG4gKiAgICAgdGhpcyBjb250YWlucyB0aGUgaW5mb3JtYXRpb24gdG8gY3JlYXRlIHN1Y2ggYSBibG9jayBmb3IgZGlzcGxheS5cbiAqL1xudmFyIGRlZmluZVdpdGhBcmcgPSBmdW5jdGlvbihmdW5jX25hbWUsIGFyZ19uYW1lKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdwcm9jZWR1cmVzX2RlZm5vcmV0dXJuJyAmJlxuICAgICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBmdW5jX25hbWUgJiZcbiAgICAgICAgICBibG9jay5wYXJhbWV0ZXJOYW1lc18gJiYgYmxvY2sucGFyYW1ldGVyTmFtZXNfLmxlbmd0aCAmJlxuICAgICAgICAgIGJsb2NrLnBhcmFtZXRlck5hbWVzX1swXSA9PSBhcmdfbmFtZTtcbiAgICB9LFxuICAgIHR5cGU6ICdwcm9jZWR1cmVzX2RlZm5vcmV0dXJuJyxcbiAgICB0aXRsZXM6IHsnTkFNRSc6IGZ1bmNfbmFtZX0sXG4gICAgZXh0cmE6ICc8bXV0YXRpb24+PGFyZyBuYW1lPVwiJyArIGFyZ19uYW1lICsgJ1wiPjwvYXJnPjwvbXV0YXRpb24+J1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ha2VNYXRoTnVtYmVyOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIsXG4gIHNpbXBsZUJsb2NrOiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2ssXG4gIHJlcGVhdDogcmVxdWlyZWRCbG9ja1V0aWxzLnJlcGVhdCxcbiAgZHJhd0FTcXVhcmU6IGRyYXdBU3F1YXJlLFxuICBkcmF3QVNub3dtYW46IGRyYXdBU25vd21hbixcbiAgTU9WRV9GT1JXQVJEX0lOTElORTogTU9WRV9GT1JXQVJEX0lOTElORSxcbiAgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORTogTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSxcbiAgbW92ZUZvcndhcmRJbmxpbmU6IG1vdmVGb3J3YXJkSW5saW5lLFxuICBNT1ZFX0JBQ0tXQVJEX0lOTElORTogTU9WRV9CQUNLV0FSRF9JTkxJTkUsXG4gIHR1cm5MZWZ0UmVzdHJpY3RlZDogdHVybkxlZnRSZXN0cmljdGVkLFxuICB0dXJuUmlnaHRSZXN0cmljdGVkOiB0dXJuUmlnaHRSZXN0cmljdGVkLFxuICB0dXJuUmlnaHRCeUNvbnN0YW50OiB0dXJuUmlnaHRCeUNvbnN0YW50LFxuICB0dXJuUmlnaHQ6IHR1cm5SaWdodCxcbiAgdHVybkxlZnQ6IHR1cm5MZWZ0LFxuICBtb3ZlOiBtb3ZlLFxuICBkcmF3VHVyblJlc3RyaWN0ZWQ6IGRyYXdUdXJuUmVzdHJpY3RlZCxcbiAgZHJhd1R1cm46IGRyYXdUdXJuLFxuICBTRVRfQ09MT1VSX1BJQ0tFUjogU0VUX0NPTE9VUl9QSUNLRVIsXG4gIFNFVF9DT0xPVVJfUkFORE9NOiBTRVRfQ09MT1VSX1JBTkRPTSxcbiAgZGVmaW5lV2l0aEFyZzogZGVmaW5lV2l0aEFyZyxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIHsnZnVuYyc6ICdtb3ZlRm9yd2FyZCcsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiMTAwXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuICB7J2Z1bmMnOiAndHVyblJpZ2h0JywgJ2NhdGVnb3J5JzogJ0FydGlzdCcsICdwYXJhbXMnOiBbXCI5MFwiXSwgJ2lkQXJnTGFzdCc6IHRydWUgfSxcbiAgeydmdW5jJzogJ3BlbkNvbG91cicsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiJyNmZjAwMDAnXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuICB7J2Z1bmMnOiAncGVuV2lkdGgnLCAnY2F0ZWdvcnknOiAnQXJ0aXN0JywgJ3BhcmFtcyc6IFtcIjFcIl0sICdpZEFyZ0xhc3QnOiB0cnVlIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnQXJ0aXN0Jzoge1xuICAgICdjb2xvcic6ICdyZWQnLFxuICAgICdibG9ja3MnOiBbXVxuICB9LFxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cInNsaWRlci1jZWxsXCI+XFxuICA8c3ZnIGlkPVwic2xpZGVyXCJcXG4gICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXFxuICAgICAgIHhtbG5zOnN2Zz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcXG4gICAgICAgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCJcXG4gICAgICAgdmVyc2lvbj1cIjEuMVwiXFxuICAgICAgIHdpZHRoPVwiMTUwXCJcXG4gICAgICAgaGVpZ2h0PVwiNTBcIj5cXG4gICAgICA8IS0tIFNsb3cgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwic2xvd0NsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTIgeD01IHk9MTQgLz5cXG4gICAgICA8L2NsaXBQYXRoPlxcbiAgICAgIDxpbWFnZSB4bGluazpocmVmPVwiJywgZXNjYXBlKCgxMywgIGFzc2V0VXJsKGljb25QYXRoKSApKSwgJ1wiIGhlaWdodD00MiB3aWR0aD04NCB4PS0yMSB5PS0xMFxcbiAgICAgICAgICBjbGlwLXBhdGg9XCJ1cmwoI3Nsb3dDbGlwUGF0aClcIiAvPlxcbiAgICAgIDwhLS0gRmFzdCBpY29uLiAtLT5cXG4gICAgICA8Y2xpcFBhdGggaWQ9XCJmYXN0Q2xpcFBhdGhcIj5cXG4gICAgICAgIDxyZWN0IHdpZHRoPTI2IGhlaWdodD0xNiB4PTEyMCB5PTEwIC8+XFxuICAgICAgPC9jbGlwUGF0aD5cXG4gICAgICA8aW1hZ2UgeGxpbms6aHJlZj1cIicsIGVzY2FwZSgoMTksICBhc3NldFVybChpY29uUGF0aCkgKSksICdcIiBoZWlnaHQ9NDIgd2lkdGg9ODQgeD0xMjAgeT0tMTFcXG4gICAgICAgICAgY2xpcC1wYXRoPVwidXJsKCNmYXN0Q2xpcFBhdGgpXCIgLz5cXG4gIDwvc3ZnPlxcbiAgPGltZyBpZD1cInNwaW5uZXJcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIiBzcmM9XCInLCBlc2NhcGUoKDIyLCAgYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS9sb2FkaW5nLmdpZicpICkpLCAnXCIgaGVpZ2h0PTE1IHdpZHRoPTE1PlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQSBzZXQgb2YgYmxvY2tzIHVzZWQgYnkgc29tZSBvZiBvdXIgY3VzdG9tIGxldmVscyAoaS5lLiBidWlsdCBieSBsZXZlbCBidWlsZGVyKVxuICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cblxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiBpbnN0YWxsRHJhd0FTcXVhcmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxDcmVhdGVBQ2lyY2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZUJyYW5jaChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBVHJpYW5nbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUhvdXNlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVNub3dmbGFrZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBSGV4YWdvbihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBU3RhcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUm9ib3QoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUGxhbmV0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSaG9tYnVzKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd1VwcGVyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdMb3dlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuXG4gaW5zdGFsbENyZWF0ZUFTbm93Zmxha2VEcm9wZG93bihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuXG52YXIgTEVOR1RIX1BBUkFNID0gbXNnLmxlbmd0aFBhcmFtZXRlcigpO1xuXG5mdW5jdGlvbiBjcmVhdGVBQ2lyY2xlQ29kZSAoc2l6ZSwgZ2Vuc3ltLCBpbmRlbnQpIHtcbiAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gIGluZGVudCA9IGluZGVudCB8fCAnJztcbiAgcmV0dXJuIFtcbiAgICBpbmRlbnQgKyAnLy8gY3JlYXRlX2FfY2lyY2xlJyxcbiAgICBpbmRlbnQgKyAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzY7ICcgK1xuICAgIGluZGVudCArICAgICAgIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgIGluZGVudCArICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgc2l6ZSArICcpOycsXG4gICAgaW5kZW50ICsgJyAgVHVydGxlLnR1cm5SaWdodCgxMCk7JyxcbiAgICBpbmRlbnQgKyAnfVxcbiddLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gaW5pdGlhbGl6YXRpb24gb2JqZWN0IHRoYXQgc2V0cyB1cCBibG9ja2x5IGF0dHJpYnV0ZXM7XG4gKlxuICogQHBhcmFtIHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBibG9jayB0aGF0IHdpbGwgYmUgdmlzaWJsZSB0byB0aGUgdXNlci5cbiAqIEBwYXJhbSBbcGFyYW1ldGVyXSAtIE9wdGlvbmFsIHBhcmFtZXRlciBmb3IgYmxvY2tzIHRoYXQgYWNjZXB0IGEgdmFsdWVcbiAqICAgIHBhcmFtZXRlci4gVGhpcyBpcyB0aGUgdGl0bGUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEByZXR1cm4gdGhlIGluaXRpYWxpemF0aW9uIG9iamVjdFxuICovXG5mdW5jdGlvbiBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgcGFyYW1ldGVyKSB7XG4gIHJldHVybiB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG5cbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKHRpdGxlKTtcblxuICAgICAgaWYgKHBhcmFtZXRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgICAgLnNldEFsaWduKEJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAuYXBwZW5kVGl0bGUocGFyYW1ldGVyICsgJzonKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFNhbWUgYXMgZHJhd19hX3NxdWFyZSwgZXhjZXB0IGlucHV0cyBhcmUgbm90IGlubGluZWRcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU3F1YXJlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBU3F1YXJlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZV9jdXN0b20gPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3NxdWFyZV9jdXN0b20gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc3F1YXJlLlxuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAgICcvLyBkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIGNyZWF0ZV9hX2NpcmNsZSBhbmQgY3JlYXRlX2FfY2lyY2xlX3NpemVcbiAqIGZpcnN0IGRlZmF1bHRzIHRvIHNpemUgMTAsIHNlY29uZCBwcm92aWRlcyBhIHNpemUgcGFyYW1cbiAqL1xuZnVuY3Rpb24gaW5zdGFsbENyZWF0ZUFDaXJjbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuY3JlYXRlQUNpcmNsZSgpO1xuICB2YXIgcGFyYW0gPSBtc2cuc2l6ZVBhcmFtZXRlcigpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX2NpcmNsZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9jaXJjbGVfc2l6ZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBwYXJhbSk7XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjcmVhdGVBQ2lyY2xlQ29kZSgxMCwgZ2Vuc3ltKTtcbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2FfY2lyY2xlX3NpemUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoc2l6ZSwgZ2Vuc3ltKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBjcmVhdGVfYV9zbm93Zmxvd2VyXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlQnJhbmNoKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmNyZWF0ZUFTbm93Zmxha2VCcmFuY2goKTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUpO1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgdmFyIGxvb3BWYXIyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnLy8gY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCcsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKDkwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCg0NSk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDQ1KTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByaG9tYnVzIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUmhvbWJ1cyhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVJob21idXMoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfcmhvbWJ1cyA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfcmhvbWJ1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMjsgJyArXG4gICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoNjApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHRyaWFuZ2xlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBVHJpYW5nbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FUcmlhbmdsZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV90cmlhbmdsZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfdHJpYW5nbGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhleGFnb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FIZXhhZ29uKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hleGFnb24gPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2hleGFnb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoNjApOycsXG4gICAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIGhvdXNlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBSG91c2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FIb3VzZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9ob3VzZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfaG91c2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBmbG93ZXIgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FGbG93ZXIoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfZmxvd2VyID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9mbG93ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHZhciBjb2xvcl9yYW5kb20gPSBnZW5lcmF0b3IuY29sb3VyX3JhbmRvbSgpWzBdO1xuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiMyMjhiMjJcIik7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDE4KTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvcl9yYW5kb20gKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDM2KTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnIC8gMik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoJyArIHZhbHVlX2xlbmd0aCArICcvIDIpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgxOTgpOycsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTgwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgc25vd2ZsYWtlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU25vd2ZsYWtlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBU25vd2ZsYWtlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3Nub3dmbGFrZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dmbGFrZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgdmFyIGNvbG9yX3JhbmRvbSA9IGdlbmVyYXRvci5jb2xvdXJfcmFuZG9tKClbMF07XG4gICAgcmV0dXJuIFtcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA4OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKFwiIzdmZmZkNFwiKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDMwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgxNSk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDE1KTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoNDUpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBzdGFyIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU3RhcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVN0YXIoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc3RhciA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3RhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDE4KTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDU7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTQ0KTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxOCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHJvYm90IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUm9ib3QoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FSb2JvdCgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2JvdCA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvYm90ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxNSk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMzApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDIxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgxMTUpOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg1MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDUwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVJvY2tldCgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2NrZXQgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiNmZjAwMDBcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMDAwXCIpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgyMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgcGxhbmV0IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUGxhbmV0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBUGxhbmV0KCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3BsYW5ldCA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfcGxhbmV0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiM4MDgwODBcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzNjA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDEpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgdXBwZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3VXBwZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdVcHBlcldhdmUoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3VwcGVyX3dhdmUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd191cHBlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgbG93ZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdMb3dlcldhdmUoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xvd2VyX3dhdmUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19sb3dlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlRHJvcGRvd24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgdmFyIHNub3dmbGFrZXMgPSBbXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VTcXVhcmUoKSwgJ3NxdWFyZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUGFyYWxsZWxvZ3JhbSgpLCAncGFyYWxsZWxvZ3JhbSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlTGluZSgpLCAnbGluZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3BpcmFsKCksICdzcGlyYWwnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUZsb3dlcigpLCAnZmxvd2VyJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGcmFjdGFsKCksICdmcmFjdGFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VSYW5kb20oKSwgJ3JhbmRvbSddXG4gIF07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfc25vd2ZsYWtlX2Ryb3Bkb3duID0ge1xuICAgIC8vIFdlIHVzZSBjdXN0b20gaW5pdGlhbGl6YXRpb24gKGluc3RlYWQgb2YgbWFrZUJsb2NrSW5pdGlhbGl6ZXIpIGhlcmVcbiAgICAvLyBiZWNhdXNlIGVhY2ggaW5pdGlhbGl6YXRpb24gbmVlZHMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIEZpZWxkRHJvcGRvd24uXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG5cbiAgICAgIHZhciB0aXRsZSA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oc25vd2ZsYWtlcyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZSh0aXRsZSwgJ1RZUEUnKTtcblxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfc25vd2ZsYWtlX2Ryb3Bkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuIFwiVHVydGxlLmRyYXdTbm93Zmxha2UoJ1wiICsgdHlwZSArIFwiJywgJ2Jsb2NrX2lkX1wiICsgdGhpcy5pZCArIFwiJyk7XCI7XG4gIH07XG59XG4iLCIvLyBsb2NhbGUgZm9yIHR1cnRsZVxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS50dXJ0bGVfbG9jYWxlO1xuIiwiLy8gQ3JlYXRlIGEgbGltaXRlZCBjb2xvdXIgcGFsZXR0ZSB0byBhdm9pZCBvdmVyd2hlbG1pbmcgbmV3IHVzZXJzXG4vLyBhbmQgdG8gbWFrZSBjb2xvdXIgY2hlY2tpbmcgZWFzaWVyLiAgVGhlc2UgZGVmaW5pdGlvbnMgY2Fubm90IGJlXG4vLyBtb3ZlZCB0byBibG9ja3MuanMsIHdoaWNoIGlzIGxvYWRlZCBsYXRlciwgc2luY2UgdGhleSBhcmUgdXNlZCBpblxuLy8gdG9wLWxldmVsIGRlZmluaXRpb25zIGJlbG93LiAgTm90ZSB0aGF0IHRoZSBoZXggZGlnaXRzIGEtZiBhcmVcbi8vIGxvd2VyLWNhc2UuICBUaGlzIGlzIGFzc3VtZWQgaW4gY29tcGFyaXNvbnMgYmVsb3cuXG52YXIgQ29sb3VycyA9IHtcbiAgQkxBQ0s6ICcjMDAwMDAwJyxcbiAgR1JFWTogJyM4MDgwODAnLFxuICBLSEFLSTogJyNjM2IwOTEnLFxuICBXSElURTogJyNmZmZmZmYnLFxuICBSRUQ6ICcjZmYwMDAwJyxcbiAgUElOSzogJyNmZjc3ZmYnLFxuICBPUkFOR0U6ICcjZmZhMDAwJyxcbiAgWUVMTE9XOiAnI2ZmZmYwMCcsXG4gIEdSRUVOOiAnIzIyOGIyMicsXG4gIEJMVUU6ICcjMDAwMGNkJyxcbiAgQVFVQU1BUklORTogJyM3ZmZmZDQnLFxuICBQTFVNOiAnIzg0MzE3OScsXG5cbiAgRlJPWkVOMTogXCIjZDBmZGZkXCIsXG4gIEZST1pFTjI6IFwiI2QwZmRkMFwiLFxuICBGUk9aRU4zOiBcIiNkMGQwZmRcIixcbiAgRlJPWkVONDogXCIjZTBlMGUwXCIsXG4gIEZST1pFTjU6ICcjZmZmZmZmJyxcbiAgRlJPWkVONjogXCIjZThlOGU4XCIsXG4gIEZST1pFTjc6IFwiI2JiZDFlNFwiLFxuICBGUk9aRU44OiBcIiNmZGQwZmRcIixcbiAgRlJPWkVOOTogXCIjYWVhNGZmXCJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3VycztcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2FtcGxlIGFuc3dlcnMgZm9yIFR1cnRsZSBsZXZlbHMuIFVzZWQgZm9yIHByb21wdHMgYW5kIG1hcmtpbmcuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG5cbnZhciBzZXRSYW5kb21WaXNpYmxlQ29sb3VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBudW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygyLCAyNCkpO1xuICAvLyBNYWtlIHN1cmUgYXQgbGVhc3Qgb25lIGNvbXBvbmVudCBpcyBiZWxvdyAweDgwIGFuZCB0aGUgcmVzdFxuICAvLyBiZWxvdyAweEEwLCB0byBwcmV2ZW50IHRvbyBsaWdodCBvZiBjb2xvdXJzLlxuICBudW0gJj0gMHg5ZjdmOWY7XG4gIHZhciBjb2xvdXIgPSAnIycgKyAoJzAwMDAwJyArIG51bS50b1N0cmluZygxNikpLnN1YnN0cigtNik7XG4gIGFwaS5wZW5Db2xvdXIoY29sb3VyKTtcbn07XG5cbnZhciBkcmF3U3F1YXJlID0gZnVuY3Rpb24obGVuZ3RoLCByYW5kb21fY29sb3VyKSB7XG4gIGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCA0OyBjb3VudCsrKSB7XG4gICAgaWYgKHJhbmRvbV9jb2xvdXIpIHtcbiAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICB9XG4gICAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gIH1cbn07XG5cbnZhciBkcmF3VHJpYW5nbGUgPSBmdW5jdGlvbihsZW5ndGgsIHJhbmRvbV9jb2xvdXIpIHtcbiAgZm9yICh2YXIgY291bnQgPSAwOyBjb3VudCA8IDM7IGNvdW50KyspIHtcbiAgICBpZiAocmFuZG9tX2NvbG91cikge1xuICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgIH1cbiAgICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gIH1cbn07XG5cbnZhciBkcmF3U25vd21hbiA9IGZ1bmN0aW9uKGhlaWdodCkge1xuICBhcGkudHVybkxlZnQoOTApO1xuICB2YXIgZGlzdGFuY2VzID0gW2hlaWdodCAqIDAuNSwgaGVpZ2h0ICogMC4zLCBoZWlnaHQgKiAwLjJdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgIHZhciBkaXN0YW5jZSA9IGRpc3RhbmNlc1tpIDwgMyA/IGkgOiA1IC0gaV0gLyA1Ny41O1xuICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMTgwOyBkICs9IDIpIHtcbiAgICAgIGFwaS5tb3ZlRm9yd2FyZChkaXN0YW5jZSk7XG4gICAgICBhcGkudHVyblJpZ2h0KDIpO1xuICAgIH1cbiAgICBpZiAoaSAhPSAyKSB7XG4gICAgICBhcGkudHVyblJpZ2h0KDE4MCk7XG4gICAgfVxuICB9XG4gIGFwaS50dXJuTGVmdCg5MCk7XG59O1xuXG52YXIgZHJhd0hvdXNlID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIGRyYXdTcXVhcmUobGVuZ3RoKTtcbiAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gIGFwaS50dXJuUmlnaHQoMzApO1xuICBkcmF3VHJpYW5nbGUobGVuZ3RoKTtcbiAgYXBpLnR1cm5SaWdodCg2MCk7XG4gIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICBhcGkudHVybkxlZnQoOTApO1xuICBhcGkubW92ZUJhY2t3YXJkKGxlbmd0aCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvZyBvZiBhIHNhbXBsZSBzb2x1dGlvbnMgZm9yIGVhY2ggbGV2ZWwuXG4gKiBUbyBjcmVhdGUgYW4gYW5zd2VyLCBqdXN0IHNvbHZlIHRoZSBsZXZlbCBpbiBCbG9ja2x5LCB0aGVuIHBhc3RlIHRoZVxuICogcmVzdWx0aW5nIEphdmFTY3JpcHQgaGVyZSwgbW92aW5nIGFueSBmdW5jdGlvbnMgdG8gdGhlIGJlZ2lubmluZyBvZlxuICogdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0cy5hbnN3ZXIgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICBhcGkubG9nID0gW107XG4gIHZhciBjb3VudCwgc2lkZUlkeCwgbGVuO1xuICBpZiAocGFnZSA9PSAxKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBFbC5cbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIFNxdWFyZS5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gVXNlIHJlcGVhdCB0byBkcmF3IGEgc3F1YXJlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gRXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDAsIHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gU2lkZXdheXMgZW52ZWxvcGUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICAvLyBUcmlhbmdsZSBhbmQgc3F1YXJlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLnR1cm5SaWdodCgxODApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBHbGFzc2VzLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBjYzAwJyk7ICAvLyBibHVlXG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlQmFja3dhcmQoMTUwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU3Bpa3kuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDg7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLm1vdmVCYWNrd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoNDUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBDaXJjbGUuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2MDsgY291bnQrKykge1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDIpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIFNpbmdsZSBzcXVhcmUgaW4gc29tZSBjb2xvci5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBTaW5nbGUgZ3JlZW4gc3F1YXJlLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBmZjAwJyk7ICAvLyBncmVlblxuICAgICAgICBkcmF3U3F1YXJlKDUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIFRocmVlIHNxdWFyZXMsIDEyMCBkZWdyZWVzIGFwYXJ0LCBpbiByYW5kb20gY29sb3JzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIDM2IHNxdWFyZXMsIDEwIGRlZ3JlZXMgYXBhcnQsIGluIHJhbmRvbSBjb2xvcnMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTogIC8vIERyYXcgd2l0aG91dCB1c2luZyBmb3ItbG9vcC4gIChGYWxsIHRocm91Z2ggdG8gbmV4dCBjYXNlLilcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy8gU3F1YXJlcyB3aXRoIHNpZGVzIG9mIDUwLCA2MCwgNzAsIDgwLCBhbmQgOTAgcGl4ZWxzLlxuICAgICAgICBmb3IgKGxlbiA9IDUwOyBsZW4gPD0gOTA7IGxlbiArPSAxMCkge1xuICAgICAgICAgIGRyYXdTcXVhcmUobGVuKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gTWluaS1zcGlyYWwuXG4gICAgICAgIGZvciAobGVuID0gMjU7IGxlbiA8PSA2MDsgbGVuICs9IDUpIHtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQobGVuKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNy41OlxuICAgICAgICBkcmF3U25vd21hbigyNTApO1xuICAgICAgICBkcmF3U25vd21hbigxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU2FtZS1oZWlnaHQgc25vd21lbi5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oMTUwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoMTAwKTtcbiAgICAgICAgICBhcGkudHVybkxlZnQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBEaWZmZXJlbnQgaGVpZ2h0IHNub3dtZW4uXG4gICAgICAgIGZvciAodmFyIGhlaWdodCA9IDExMDsgaGVpZ2h0ID49IDcwOyBoZWlnaHQgLT0gMTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oaGVpZ2h0KTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoNjApO1xuICAgICAgICAgIGFwaS50dXJuTGVmdCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gMykge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gRHJhdyBhIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyBEcmF3IGEgaG91c2UgdXNpbmcgXCJkcmF3IGEgc3F1YXJlXCIgYW5kIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gRHJhdyBhIGhvdXNlIHVzaW5nIGEgZnVuY3Rpb24uXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDIwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBBZGQgYSBwYXJhbWV0ZXIgdG8gdGhlIFwiZHJhdyBhIGhvdXNlXCIgcHJvY2VkdXJlLlxuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKGNvdW50ID0gNTA7IGNvdW50IDw9IDE1MDsgY291bnQgKz0gNTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd0hvdXNlKGNvdW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBEcmF3IGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIERyYXcgdHdvIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gRHJhdyBmb3VyIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgzNik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg4MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMDpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDk7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoODApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFwaS5sb2c7XG59O1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEFydGlzdCBBUEkgbG9naWMuIFRoZSBtZXRob2RzIG9uIHRoaXMgb2JqZWN0IGFyZSBjYWxsZWQgYnlcbiAqIGdlbmVyYXRlZCB1c2VyIGNvZGUuIEFzIHRoZXkgYXJlIGNhbGxlZCwgdGhleSBpbnNlcnQgY29tbWFuZHMgaW50byB0aGlzLmxvZy5cbiAqIE5PVEU6IHRoaXMubG9nIGlzIGFsc28gbW9kaWZpZWQgaW4gc29tZSBjYXNlcyBleHRlcm5hbGx5IChib3RoIGFjY2Vzc2VkIGFuZFxuICogSSB0aGluayBjbGVhcmVkKS5cbiAqL1xudmFyIEFydGlzdEFQSSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sb2cgPSBbXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJ0aXN0QVBJO1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoc2l6ZSwgaWQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XG4gICAgdGhpcy5tb3ZlRm9yd2FyZChzaXplLCBpZCk7XG4gICAgdGhpcy50dXJuUmlnaHQoMTAsIGlkKTtcbiAgfVxufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3U25vd2ZsYWtlID0gZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gIHZhciBpLCBqLCBrO1xuXG4gIC8vIG1pcm9ycyBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5cbiAgdmFyIHJhbmRvbV9jb2xvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbG9ycyA9IEJsb2NrbHkuRmllbGRDb2xvdXIuQ09MT1VSUztcbiAgICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpjb2xvcnMubGVuZ3RoKV07XG4gIH07XG5cbiAgaWYgKHR5cGUgPT09ICdyYW5kb20nKSB7XG4gICAgdHlwZSA9IF8uc2FtcGxlKFsnZnJhY3RhbCcsICdmbG93ZXInLCAnc3BpcmFsJywgJ2xpbmUnLCAncGFyYWxsZWxvZ3JhbScsICdzcXVhcmUnXSk7XG4gIH1cblxuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ2ZyYWN0YWwnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICB0aGlzLmp1bXBGb3J3YXJkKDQ1LCBpZCk7XG4gICAgICAgIHRoaXMudHVybkxlZnQoNDUsIGlkKTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDM7IGorKykge1xuICAgICAgICAgIGZvciAoayA9IDA7IGsgPCAzOyBrKyspIHtcbiAgICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoMTUsIGlkKTtcbiAgICAgICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgICB0aGlzLnR1cm5SaWdodCg0NSwgaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDkwLCBpZCk7XG4gICAgICAgICAgdGhpcy5tb3ZlQmFja3dhcmQoMTUsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDQ1LCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoOTAsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZmxvd2VyJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDIsIGlkKTtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDQsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoNzIsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3BpcmFsJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSgzLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUZvcndhcmQoMjAsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMTgsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgOTA7IGkrKykge1xuICAgICAgICB0aGlzLnBlbkNvbG91cihyYW5kb21fY29sb3VyKCkpO1xuICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDQsIGlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVuQ29sb3VyKFwiI0ZGRkZGRlwiLCBpZCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BhcmFsbGVsb2dyYW0nOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDI7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg2MCwgaWQpO1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCgxMjAsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCgzNiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg5MCwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDM2LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydGRCcsIGRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0ZEJywgLWRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlVXAgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAxODAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAyNzAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgOTAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBVcCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcERvd24gPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDE4MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcExlZnQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDI3MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcFJpZ2h0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCA5MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcEZvcndhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pGJywgZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBCYWNrd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkYnLCAtZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnR1cm5SaWdodCA9IGZ1bmN0aW9uKGFuZ2xlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUlQnLCBhbmdsZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUudHVybkxlZnQgPSBmdW5jdGlvbihhbmdsZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1JUJywgLWFuZ2xlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5nbG9iYWxBbHBoYSA9IGZ1bmN0aW9uIChhbHBoYSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0dBJywgYWxwaGEsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblVwID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BVJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuRG93biA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQRCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbldpZHRoID0gZnVuY3Rpb24od2lkdGgsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQVycsIE1hdGgubWF4KHdpZHRoLCAwKSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuQ29sb3VyID0gZnVuY3Rpb24oY29sb3VyLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUEMnLCBjb2xvdXIsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFMnLCBwYXR0ZXJuLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5oaWRlVHVydGxlID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0hUJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuc2hvd1R1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydTVCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdTdGFtcCA9IGZ1bmN0aW9uKHN0YW1wLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnc3RhbXAnLCBzdGFtcCwgaWRdKTtcbn07XG4iXX0=
