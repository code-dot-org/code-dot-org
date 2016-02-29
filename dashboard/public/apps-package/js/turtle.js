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
var apiJavascript = require('./apiJavascript');
var AppView = require('../templates/AppView.jsx');
var page = require('../templates/page.html.ejs');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var Slider = require('../slider');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');

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
  apiJavascript.injectArtistAPI(this.api);

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

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
  config.loadAudio = _.bind(this.loadAudio_, this);
  config.afterInject = _.bind(this.afterInject_, this, config);

  React.render(React.createElement(AppView, {
    renderCodeApp: (function () {
      return page({
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
    }).bind(this),
    onMount: (function () {
      this.studioApp_.init(config);
    }).bind(this)
  }), document.getElementById(config.containerId));
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
  this.consoleLogger_.detach();

  // Discard the interpreter.
  if (this.JSInterpreter) {
    this.JSInterpreter.deinitialize();
    this.JSInterpreter = null;
  }
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
 * Set up the JSInterpreter and consoleLogger for editCode levels
 */
Artist.prototype.initInterpreter = function () {
  if (!this.level.editCode) {
    return;
  }
  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    shouldRunAtMaxSpeed: function shouldRunAtMaxSpeed() {
      return false;
    }
  });
  this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
  this.consoleLogger_.attachTo(this.JSInterpreter);
  this.JSInterpreter.parse({
    code: this.studioApp_.getCode(),
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions
  });
};

/**
 * Handle an execution error from the interpreter
 */
Artist.prototype.handleExecutionError = function (err, lineNumber) {
  this.consoleLogger_.log(err);

  this.executionError = { err: err, lineNumber: lineNumber };

  if (err instanceof SyntaxError) {
    this.testResults = this.studioApp_.TestResults.SYNTAX_ERROR_FAIL;
  }

  this.finishExecution_();
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
    this.initInterpreter();
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

  if (this.level.editCode && this.JSInterpreter && this.JSInterpreter.initialized()) {

    var programDone = false;
    var completedTuple = false;

    do {
      programDone = this.JSInterpreter.isProgramDone();

      if (!programDone) {
        this.JSInterpreter.executeInterpreter();

        completedTuple = this.executeTuple_();
      }
    } while (!programDone && !completedTuple);

    if (!completedTuple) {
      completedTuple = this.executeTuple_();
    }
    if (programDone && !completedTuple) {
      // All done:
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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../slider":"/home/ubuntu/staging/apps/build/js/slider.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/turtle/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/turtle/apiJavascript.js","./colours":"/home/ubuntu/staging/apps/build/js/turtle/colours.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/turtle/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/turtle/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/turtle/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js"}],"/home/ubuntu/staging/apps/build/js/turtle/levels.js":[function(require,module,exports){
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

var api = require('./apiJavascript.js');

module.exports.blocks = [{ func: 'moveForward', parent: api, category: 'Artist', params: ["100"] }, { func: 'turnRight', parent: api, category: 'Artist', params: ["90"] }, { func: 'penColour', parent: api, category: 'Artist', params: ["'#ff0000'"] }, { func: 'penWidth', parent: api, category: 'Artist', params: ["1"] }];

module.exports.categories = {
  Artist: {
    color: 'red',
    blocks: []
  }
};

},{"./apiJavascript.js":"/home/ubuntu/staging/apps/build/js/turtle/apiJavascript.js"}],"/home/ubuntu/staging/apps/build/js/turtle/controls.html.ejs":[function(require,module,exports){
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

},{}],"/home/ubuntu/staging/apps/build/js/turtle/apiJavascript.js":[function(require,module,exports){
'use strict';

var ArtistApi;

exports.injectArtistAPI = function (artistApi) {
  ArtistApi = artistApi;
};

exports.moveForward = function (distance) {
  ArtistApi.log.push(['FD', distance, null]);
};

exports.moveBackward = function (distance) {
  ArtistApi.log.push(['FD', -distance, null]);
};

exports.moveUp = function (distance) {
  ArtistApi.log.push(['MV', distance, 0, null]);
};

exports.moveDown = function (distance) {
  ArtistApi.log.push(['MV', distance, 180, null]);
};

exports.moveLeft = function (distance) {
  ArtistApi.log.push(['MV', distance, 270, null]);
};

exports.moveRight = function (distance) {
  ArtistApi.log.push(['MV', distance, 90, null]);
};

exports.jumpUp = function (distance) {
  ArtistApi.log.push(['JD', distance, 0, null]);
};

exports.jumpDown = function (distance) {
  ArtistApi.log.push(['JD', distance, 180, null]);
};

exports.jumpLeft = function (distance) {
  ArtistApi.log.push(['JD', distance, 270, null]);
};

exports.jumpRight = function (distance) {
  ArtistApi.log.push(['JD', distance, 90, null]);
};

exports.jumpForward = function (distance) {
  ArtistApi.log.push(['JF', distance, null]);
};

exports.jumpBackward = function (distance) {
  ArtistApi.log.push(['JF', -distance, null]);
};

exports.turnRight = function (angle) {
  ArtistApi.log.push(['RT', angle, null]);
};

exports.turnLeft = function (angle) {
  ArtistApi.log.push(['RT', -angle, null]);
};

exports.globalAlpha = function (alpha) {
  ArtistApi.log.push(['GA', alpha, null]);
};

exports.penUp = function (id) {
  ArtistApi.log.push(['PU', null]);
};

exports.penDown = function (id) {
  ArtistApi.log.push(['PD', null]);
};

exports.penWidth = function (width) {
  ArtistApi.log.push(['PW', Math.max(width, 0), null]);
};

exports.penColour = function (colour) {
  ArtistApi.log.push(['PC', colour, null]);
};

exports.penPattern = function (pattern) {
  ArtistApi.log.push(['PS', pattern, null]);
};

exports.hideTurtle = function (id) {
  ArtistApi.log.push(['HT', null]);
};

exports.showTurtle = function (id) {
  ArtistApi.log.push(['ST', null]);
};

exports.drawStamp = function (stamp) {
  ArtistApi.log.push(['stamp', stamp, null]);
};

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2FwaUphdmFzY3JpcHQuanMiLCJidWlsZC9qcy90dXJ0bGUvYW5zd2Vycy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENB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SSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUN6QixDQUFDOzs7Ozs7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RDs7QUFFRCxNQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsTUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOzs7QUFHMUIsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyRCxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxRQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3RCLE9BQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2QsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDeEI7O0FBRUQsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFOztBQUVwRCxRQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFakQsUUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDaEM7O0FBRUQsUUFBTSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztBQUN2QyxRQUFNLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBQ3hDLFFBQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOztBQUVyQyxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztHQUN6QixNQUNJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUM7QUFDbkMsUUFBSSxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztHQUNyQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7R0FDeEI7O0FBRUQsTUFBSSxRQUFRLEdBQUcsZUFBZSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsR0FBRyxXQUFXLENBQUEsQUFBQyxDQUFDO0FBQy9HLFFBQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELFFBQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFN0QsT0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtBQUN4QyxpQkFBYSxFQUFFLENBQUEsWUFBWTtBQUN6QixhQUFPLElBQUksQ0FBQztBQUNWLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLFlBQUksRUFBRTtBQUNKLHVCQUFhLEVBQUUsRUFBRTtBQUNqQix5QkFBZSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFO0FBQ2xELGtCQUFRLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDO0FBQ2xHLG1CQUFTLEVBQUcsU0FBUztBQUNyQiwwQkFBZ0IsRUFBRyxTQUFTO0FBQzVCLGtCQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO0FBQzdCLDJCQUFpQixFQUFHLHVCQUF1QjtBQUMzQywyQkFBaUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCO1NBQzVDO09BQ0YsQ0FBQyxDQUFDO0tBQ0osQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDWixXQUFPLEVBQUUsQ0FBQSxZQUFZO0FBQ25CLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzlCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0dBQ2IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Q0FDbEQsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFZO0FBQ3hDLE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3JELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQzlELENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxNQUFNLEVBQUU7O0FBRWhELE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQzs7O0FBR25ELE1BQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7QUFDNUIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUNyRDs7QUFFRCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7OztBQUdwQyxXQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ3BEOzs7QUFHRCxNQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekUsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pFLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRSxNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0UsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNFLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBRzdFLE1BQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFNUQsTUFBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3RCxlQUFhLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3pDLE1BQUksQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR2pELE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFBLEFBQUMsRUFBRTs7O0FBRzVGLFdBQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxHQUFHLFlBQVc7O0FBRTVDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUU7QUFDbEQsWUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUMvRCxlQUFlLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRCxlQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQzdELFlBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUMsQ0FBQztBQUMvQyxZQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNsRixZQUFJLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxDQUFDLENBQUM7QUFDdkUsWUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNmLGVBQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2pFO0FBQ0QsVUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUNoRSxhQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUN2RCxDQUFDO0dBQ0g7O0FBRUQsTUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7OztBQUcvQixNQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsTUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOztBQUVsQixNQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLE1BQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNsQixNQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOztBQUU5QixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkUsUUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7R0FDNUI7Ozs7QUFJRCxNQUFJLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25ELGdCQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBQyxNQUFNLENBQUM7QUFDcEMsVUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRTFDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNqRSxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RELFFBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN0QixVQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3RCLFNBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ3hDO0dBQ0Y7OztBQUdELE1BQUksbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pFLHFCQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0NBQzNDLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUN2QyxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDcEUsTUFBTTtBQUNMLFFBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3pEO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBUyxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ3ZELE1BQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDeEIsU0FBTyxHQUFHLENBQUMsTUFBTSxFQUFFO0FBQ2pCLFFBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsYUFBYSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDN0QsUUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQ3ZCO0FBQ0QsUUFBTSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztBQUN6QyxRQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvQyxRQUFNLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0NBQ2pELENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxVQUFTLFlBQVksRUFBRSxNQUFNLEVBQUU7QUFDbkUsTUFBSSxJQUFJLENBQUM7QUFDVCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsUUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEQsV0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMvRCxRQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUN6RCxNQUFNO0FBQ0wsUUFBSSxHQUFHLFlBQVksQ0FBQztHQUNyQjtBQUNELE1BQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3BDLFdBQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7R0FDaEM7QUFDRCxNQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsR0FBRyxVQUFTLE1BQU0sRUFBRTtBQUM1RCxNQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzVDLENBQUM7Ozs7Ozs7OztBQVNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDaEUsTUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN0QixLQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBVztBQUM3QixRQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ25CLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFDL0QsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7T0FDNUQsTUFBTztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDekQ7S0FDRjtBQUNELFFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNoQixFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVULE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCxPQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3hDLE1BQU07QUFDTCxPQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsQ0FBQztHQUNoRTtDQUNGLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUN2QyxNQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDdEIsV0FBTztHQUNSO0FBQ0QsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNqRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDOUQ7QUFDRCxNQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztBQUNqRCxNQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkQsTUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxhQUFhLENBQUM7Q0FDekQsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFXO0FBQ3ZDLE1BQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFckQsTUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDeEMsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDMUIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztHQUNoQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ2pDLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7R0FDaEMsTUFBTTtBQUNMLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLENBQUM7R0FDakM7QUFDRCxNQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ2xELE1BQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFlBQVc7QUFDcEQsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDMUIsUUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0FBQ2xFLFFBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDO0FBQ3RFLFFBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDO0dBQ3JFO0NBQ0YsQ0FBQzs7QUFFRixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7Ozs7O0FBTXBCLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDdkMsTUFBSSxPQUFPLENBQUM7O0FBRVosTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN2RSxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7O0FBRXBELFNBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDOzs7QUFHMUMsU0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsR0FBQyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsb0JBQW9CLENBQUM7R0FDM0U7QUFDRCxNQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDbkQsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ3BELFdBQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7QUFDdEQsZUFBVyxHQUFHLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0dBQzdELE1BQU07QUFDTCxXQUFPLEdBQUcsQ0FBQyxDQUFDO0dBQ2I7QUFDRCxNQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztBQUMvQyxNQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztBQUNqRCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztBQUM3QyxNQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztBQUMvQyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkMsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDOztBQUVwQyxNQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDakUsV0FBTztHQUNSOztBQUVELE1BQUksT0FBTyxHQUFHLENBQUMsSUFDWCxPQUFPLEdBQUcsQ0FBQyxJQUNYLE9BQU8sR0FBRyxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUNsRCxPQUFPLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUNwRDtBQUNFLFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Ozs7S0FJM0I7QUFDRCxXQUFPO0dBQ1I7O0FBRUQsTUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDaEMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQ3ZCLElBQUksQ0FBQyxXQUFXLEVBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFDeEMsV0FBVyxHQUFHLENBQUMsRUFBRSxZQUFZLEVBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFDcEMsU0FBUyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztHQUM5QjtDQUNGLENBQUM7Ozs7Ozs7QUFPRixNQUFNLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3hELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQzFCLFFBQUksVUFBVSxHQUFHLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUM7O0FBRTdFLFFBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUc1RSxjQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsQ0FBQzs7O0FBR3BELGNBQVUsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDOztBQUVwRixRQUFJLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDcEQsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7QUFDL0QsVUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7QUFDdEQsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQztBQUN4RCxVQUFJLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDNUIsVUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQzlCLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUUxQyxVQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQzdDLFlBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUN2QixJQUFJLENBQUMsd0JBQXdCLEVBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFDeEMsV0FBVyxFQUFFLFlBQVksRUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUNwQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDMUI7S0FDRjtHQUNGO0NBQ0YsQ0FBQzs7Ozs7Ozs7QUFTRixNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLE1BQU0sRUFBRTs7QUFFekMsTUFBSSxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLE1BQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLFNBQVMsR0FDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ25DLE1BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOzs7QUFHcEIsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDckMsUUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztHQUM5QjtBQUNELE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7R0FDOUI7O0FBRUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzVELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQzFCLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQy9DLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztHQUMvQixNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ2pDLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQy9DLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztHQUMvQixNQUFNO0FBQ0wsUUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hDLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUN0QyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0I7O0FBRUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDO0FBQzNDLE1BQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7O0FBR2YsTUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQ3RCLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV6RSxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQzdCLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDakMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM3QixNQUFNOztBQUVMLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkI7OztBQUdELE1BQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNaLFVBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQy9CO0FBQ0QsTUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUdiLE1BQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7OztBQUc3QixNQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUMzQjtBQUNELE1BQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDOzs7QUFHM0IsTUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQ3ZCLENBQUM7Ozs7O0FBTUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBVzs7O0FBR3BDLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO0FBQ3RDLE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUNwQyxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDOztBQUVsQyxNQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQzs7QUFFbEQsTUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsR0FBRyxhQUFhLENBQUM7QUFDekQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHdkQsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ3BELFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztHQUNuQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BDO0FBQ0QsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs7O0FBR2hDLE1BQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBR3hELE1BQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBR3hELE1BQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBR3hELE1BQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixRQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN2QztDQUNGLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBWTtBQUM1QyxNQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QyxVQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQ2hFLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNwQyxXQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN0QztBQUNELE1BQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDM0IsTUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2hCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDekMsTUFBSTtBQUNGLFdBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3JCLFlBQU0sRUFBRSxJQUFJLENBQUMsR0FBRztLQUNqQixDQUFDLENBQUM7R0FDSixDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7OztBQUtWLFFBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTs7O0FBR2xCLFVBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUNsQixjQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDMUQ7QUFDRCxZQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0dBQ0Y7Q0FDRixDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFlBQVk7QUFDN0MsTUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3hCLFdBQU87R0FDUjtBQUNELE1BQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7QUFDckMsYUFBUyxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQzFCLHVCQUFtQixFQUFFLCtCQUFZO0FBQUUsYUFBTyxLQUFLLENBQUM7S0FBRTtHQUNuRCxDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbkYsTUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLFFBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtBQUMvQixVQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU07QUFDNUIsZUFBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0dBQzNFLENBQUMsQ0FBQztDQUNKLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLEdBQUcsRUFBRSxVQUFVLEVBQUU7QUFDakUsTUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTdCLE1BQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQzs7QUFFM0QsTUFBSSxHQUFHLFlBQVksV0FBVyxFQUFFO0FBQzlCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUM7R0FDbEU7O0FBRUQsTUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDekIsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3BDLE1BQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQzs7O0FBR2xCLE1BQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRXhCLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxJQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLCtCQUErQixFQUFFLEVBQUU7O0FBRXJELFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixXQUFPO0dBQ1I7O0FBRUQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixRQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7R0FDeEIsTUFBTTtBQUNMLFFBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3RCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMxQjs7O0FBR0QsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFHLElBQUksRUFBQyxDQUFDLENBQUM7OztBQUdsRCxNQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUU5RCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7O0FBRXBDLFdBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN0RDtDQUNGLENBQUM7Ozs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsWUFBWTtBQUNsRCxNQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7O0FBRTFCLE1BQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQUksY0FBYyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFJLGFBQWEsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7QUFHMUMsTUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO0FBQzNCLFFBQUksWUFBWSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFOztBQUVoQyxVQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0IsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsWUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQUksV0FBVyxLQUFLLElBQUksRUFBRTtBQUN4Qix1QkFBYSxHQUFHLElBQUksQ0FBQztTQUN0QjtPQUNGO0tBQ0Y7R0FDRjs7QUFFRCxTQUFPLGFBQWEsQ0FBQztDQUN0QixDQUFDOzs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFlBQVk7QUFDM0MsTUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzdCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsTUFBSSxrQkFBa0IsQ0FBQzs7QUFFdkIsS0FBRzs7QUFFRCxzQkFBa0IsR0FBRyxLQUFLLENBQUM7O0FBRTNCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixRQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUd0QyxRQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7QUFDbkUsd0JBQWtCLEdBQUcsSUFBSSxDQUFDO0tBQzNCOzs7QUFHRCxRQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO0FBQ3BILFFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFZixRQUFJLFNBQVMsRUFBRTtBQUNiLFVBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN2QjtHQUNGLFFBQVEsa0JBQWtCLEVBQUU7O0FBRTdCLFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVk7QUFDOUMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUMvRCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsV0FBTyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0M7QUFDRCxNQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDcEIsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXOzs7QUFHcEMsTUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUdiLE1BQUksU0FBUyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDOzs7O0FBSTlGLE1BQUksQ0FBQyxxQkFBcUIsR0FBSSxTQUFTLEtBQUssQ0FBQyxHQUMzQyw2QkFBNkIsR0FBRyx3QkFBd0IsQUFBQyxDQUFDOztBQUU1RCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUNuQixJQUFJLENBQUMsYUFBYSxJQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFOztBQUVwQyxRQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDeEIsUUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDOztBQUUzQixPQUFHO0FBQ0QsaUJBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVqRCxVQUFJLENBQUMsV0FBVyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7QUFFeEMsc0JBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7T0FDdkM7S0FDRixRQUFRLENBQUMsV0FBVyxJQUFJLENBQUMsY0FBYyxFQUFFOztBQUUxQyxRQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLG9CQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3ZDO0FBQ0QsUUFBSSxXQUFXLElBQUksQ0FBQyxjQUFjLEVBQUU7O0FBRWxDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3hCLGFBQU87S0FDUjtHQUNGLE1BQU07QUFDTCxRQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO0FBQ3pCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3hCLGFBQU87S0FDUjtHQUNGOztBQUVELE1BQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDckUsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLFVBQVMsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUNwRSxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7O0FBRW5ELE1BQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUU7QUFDcEMsUUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBQzVCLFFBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDOztBQUV2RCxRQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7O0FBRXBCLFVBQUksbUJBQW1CLEdBQUcscUJBQXFCLElBQUksWUFBWSxFQUFFOztBQUUvRCxnQkFBUSxHQUFHLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUM5QywyQkFBbUIsR0FBRyxZQUFZLENBQUM7T0FDcEMsTUFBTTtBQUNMLGdCQUFRLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztBQUNsQywyQkFBbUIsSUFBSSxxQkFBcUIsQ0FBQztBQUM3QyxpQkFBUyxHQUFHLEtBQUssQ0FBQztPQUNuQjtLQUVGLE1BQU07O0FBRUwsVUFBSSxtQkFBbUIsR0FBRyxxQkFBcUIsSUFBSSxZQUFZLEVBQUU7O0FBRS9ELGdCQUFRLEdBQUcsWUFBWSxHQUFHLG1CQUFtQixDQUFDO0FBQzlDLDJCQUFtQixHQUFHLFlBQVksQ0FBQztPQUNwQyxNQUFNO0FBQ0wsZ0JBQVEsR0FBRyxxQkFBcUIsQ0FBQztBQUNqQywyQkFBbUIsSUFBSSxxQkFBcUIsQ0FBQztBQUM3QyxpQkFBUyxHQUFHLEtBQUssQ0FBQztPQUNuQjtLQUNGO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDOztBQUUvQyxTQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7Q0FDckQsQ0FBQzs7Ozs7Ozs7O0FBU0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN6RCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxNQUFNLENBQUM7QUFDWCxNQUFJLFFBQVEsQ0FBQztBQUNiLE1BQUksT0FBTyxDQUFDOztBQUVaLFVBQVEsT0FBTztBQUNiLFNBQUssSUFBSTs7QUFDUCxjQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFlBQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGVBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxjQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFlBQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGVBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxjQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLGFBQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsWUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEQsZUFBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDN0IsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsY0FBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixhQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFlBQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGVBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLGNBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsWUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEQsZUFBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDN0IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQixZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFdBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMzQixXQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUMxQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDMUIsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLFVBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLFVBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ3BELFlBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7T0FDbkM7QUFDRCxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxFQUFFO0FBQ3RDLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDekIsTUFBTTtBQUNMLFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDNUI7QUFDRCxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFlBQU07QUFBQSxBQUNSLFNBQUssT0FBTztBQUNWLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsVUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDMUIsVUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM1QixVQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ25CLFlBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztPQUNyRDtBQUNELFlBQU07QUFBQSxHQUNUOztBQUVELFNBQU8sU0FBUyxDQUFDO0NBQ2xCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDL0MsTUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDcEMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0dBQ2xDLE1BQU0sSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7R0FDbkM7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ2xELE1BQUksQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNoRSxNQUFJLENBQUMsQ0FBQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7Q0FDakUsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN6RCxNQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNaLE1BQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7O0FBRXhDLE1BQUksYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUN4QixNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlDLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUNuRCxNQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNuRCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ25ELE1BQUksS0FBSyxHQUFJLFFBQVEsS0FBSyxDQUFDLEFBQUMsQ0FBQztBQUM3QixNQUFJLEtBQUssRUFBRTtBQUNULFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDN0IsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3hDO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLFlBQVksRUFBRTtBQUN4RCxNQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUNoRCxTQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ3hCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN0RCxTQUFPLElBQUksR0FBRyxDQUFDO0FBQ2YsTUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO0FBQ2YsV0FBTyxJQUFJLEdBQUcsQ0FBQztHQUNoQjtBQUNELFNBQU8sT0FBTyxDQUFDO0NBQ2hCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDbEQsTUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsUUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixXQUFPO0dBQ1I7QUFDRCxNQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtBQUM3QixRQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUczQyxRQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsYUFBTztLQUNSO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM3QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ2xELE1BQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7QUFDNUIsUUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3ZDLE1BQU07QUFDTCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDakM7Q0FDRixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQzVELE1BQUksaUJBQWlCLEdBQUcsUUFBUSxDQUFDOztBQUVqQyxTQUFPLGlCQUFpQixHQUFHLENBQUMsRUFBRTtBQUM1QixRQUFJLG9CQUFvQixHQUFHLGlCQUFpQixJQUFJLG9CQUFvQixDQUFDO0FBQ3JFLFFBQUksb0JBQW9CLEdBQUcsb0JBQW9CLEdBQUcsb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7O0FBRTNGLHFCQUFpQixJQUFJLG9CQUFvQixDQUFDOztBQUUxQyxRQUFJLG9CQUFvQixFQUFFO0FBQ3hCLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQzNCOztBQUVELFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUU1QyxRQUFJLG9CQUFvQixFQUFFO0FBQ3hCLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQzNCO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxRQUFRLEVBQUU7O0FBRXRELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzFCLE1BQU07QUFDTCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzFCO0NBRUYsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLDJCQUEyQixHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ2pFLE1BQUksR0FBRyxDQUFDO0FBQ1IsTUFBSSxNQUFNLENBQUM7QUFDWCxNQUFJLE1BQU0sQ0FBQzs7QUFFWCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDekQsT0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUM5QixVQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN6QixVQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFekIsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUcxQyxRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxRQUFRLENBQUM7QUFDYixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLEtBQUssQ0FBQyxFQUFFO0FBQ25ELGNBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7S0FDdkMsTUFBTSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUU7OztBQUdwRCxjQUFRLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztLQUN0RCxNQUFNO0FBQ0wsY0FBUSxHQUFHLFlBQVksQ0FBQztLQUN6QjtBQUNELFFBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDbkIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRzs7QUFFM0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDOztBQUUzQixjQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU07O0FBRXBCLFVBQUksQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFFLENBQUUsRUFBRSxDQUFFLEVBQ3pFLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekI7O0FBRUQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUUzQixNQUFNOztBQUVMLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE9BQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7QUFDOUIsVUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEIsVUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRWhCLFFBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUcxQyxRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNuQixVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHOztBQUUzQixPQUFDLEVBQUUsQ0FBQzs7QUFFSixjQUFRLEdBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU07O0FBRW5DLE9BQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDaEMsUUFBUSxHQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4Qzs7QUFFRCxRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQzNCO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLFlBQVk7QUFDL0MsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFlBQVk7QUFDaEQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM1QixNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUM3QyxNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQzFCLENBQUM7Ozs7Ozs7O0FBUUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxXQUFXLEVBQUUsZUFBZSxFQUFFO0FBQ3BFLFNBQU8sV0FBVyxJQUFJLGVBQWUsQ0FBQztDQUN2QyxDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7QUFDN0MsTUFBSSxtQkFBbUIsQ0FBQztBQUN4QixNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7O0FBRXBELHVCQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDdkMsTUFBTTtBQUNMLHVCQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDdkM7O0FBRUQsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFdkIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7QUFDOUIsT0FBRyxFQUFFLFFBQVE7QUFDYixRQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGdCQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDOUIsV0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ3JCLFlBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixTQUFLLEVBQUUsS0FBSztBQUNaLGlCQUFhLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7O0FBRWhFLGtCQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQSxBQUFDOztBQUU3RSxnQkFBWSxFQUFFLEtBQUssQ0FBQyxVQUFVOztBQUU5QixvQkFBZ0IsRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUI7QUFDdEYsY0FBVSxFQUFFO0FBQ1Ysc0JBQWdCLEVBQUUsU0FBUyxDQUFDLGdCQUFnQixFQUFFO0FBQzlDLGlCQUFXLEVBQUUsU0FBUyxDQUFDLFlBQVksRUFBRTtLQUN0QztHQUNGLENBQUMsQ0FBQztDQUNKLENBQUM7Ozs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDckQsTUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckQsV0FBUyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDM0IsTUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxNQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztDQUN6QixDQUFDOzs7OztBQUtGLElBQUksZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBWSxDQUFDLEVBQUU7QUFDaEMsU0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixlQUFlLENBQUMsS0FBSyxHQUFHLDRDQUE0QyxDQUFDOzs7Ozs7QUFNckUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVzs7O0FBR3hDLE1BQUksU0FBUyxHQUNULElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3BFLE1BQUksV0FBVyxHQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ25FLE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRSxNQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7O0FBRWQsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFOzs7QUFHL0IsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUMzRCxXQUFLLEVBQUUsQ0FBQztLQUNUO0dBQ0Y7O0FBRUQsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7OztBQUl2QixNQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQzs7OztBQUlqRCxNQUFJLGFBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUEsS0FDdkQsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQSxBQUFDLENBQUM7QUFDaEUsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFakUsTUFBSSxPQUFPLENBQUM7QUFDWixNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsUUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlELFdBQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN0Qzs7O0FBR0QsTUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7OztBQUd6QixNQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFDekQsS0FBSyxDQUFDLGNBQWMsSUFDcEIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUU7QUFDdEUsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztBQUNsRSxRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUMzQzs7OztBQUlELE1BQUksS0FBSyxDQUFDLG9CQUFvQixJQUMxQixJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFO0FBQ3hFLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUM7R0FFckUsTUFBTSxJQUFJLEFBQUMsSUFBSSxDQUFDLFdBQVcsSUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLElBQy9DLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxBQUFDLEVBQUU7Ozs7QUFJOUQsUUFBSSxLQUFLLENBQUMsd0JBQXdCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUN0RSxVQUFJLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVELFVBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNuQyxZQUFJLENBQUMsV0FBVyxHQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDO0FBQzdELFlBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3hDO0tBQ0Y7R0FDRjs7QUFFRCxNQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7Ozs7Ozs7QUFPbEIsV0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQzdDOzs7O0FBSUQsTUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO0dBQzFEOzs7QUFHRCxNQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLE1BQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQzFELElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUU7QUFDeEUsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDbEMsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3RDOztBQUVELE1BQUksVUFBVSxHQUFHO0FBQ2YsT0FBRyxFQUFFLFFBQVE7QUFDYixTQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDZixXQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87QUFDdEIsVUFBTSxFQUFFLGFBQWE7QUFDckIsY0FBVSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQzVCLFdBQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7QUFDcEMsY0FBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQztBQUMvQyxtQkFBZSxFQUFFLEtBQUssQ0FBQyxVQUFVO0dBQ2xDLENBQUM7Ozs7QUFJRixNQUFJLFFBQVEsR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxBQUFDLENBQUM7OztBQUdwRSxNQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLElBQ3RFLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQSxBQUFDLEVBQUU7QUFDbkQsY0FBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztHQUM3Qzs7QUFFRCxNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbkMsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFOztBQUVwQyxXQUFPLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckQ7OztDQUdGLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFXO0FBQzlDLE1BQUksbUJBQW1CLENBQUM7QUFDeEIsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ3BELHVCQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDdkMsTUFBTTtBQUNMLHVCQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDdkM7OztBQUdELE1BQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDO0FBQ25ELE1BQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2RSxNQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztBQUM3QyxTQUFPLGtCQUFrQixDQUNyQixjQUFjLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFELENBQUM7OztBQUdGLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDNUQsTUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQyxJQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNYLElBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLElBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ25CLFNBQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQzs7Ozs7OztBQU9GLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFlBQVk7QUFDNUMsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6QixNQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0NBQzlCLENBQUM7Ozs7O0FDMTlDRixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDekMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Ozs7QUFLaEMsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7OztBQUczQixJQUFJLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBWSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ2xDLFNBQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDbEMsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUUsS0FBSztHQUNiLENBQUMsQ0FBQztDQUNKLENBQUM7OztBQUdGLElBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFZLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDdEMsU0FBTyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUN0QyxRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRSxLQUFLO0dBQ2IsQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7QUFFRixJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN0QyxJQUFJLGNBQWMsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDO0FBQ3hDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7QUFDbEMsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUN4QixJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO0FBQ2xDLElBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7QUFDcEMsSUFBSSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsbUJBQW1CLENBQUM7QUFDbEQsSUFBSSwrQkFBK0IsR0FBRyxHQUFHLENBQUMsK0JBQStCLENBQUM7QUFDMUUsSUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUM7QUFDOUMsSUFBSSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQUM7QUFDcEQsSUFBSSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUM7QUFDaEQsSUFBSSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsbUJBQW1CLENBQUM7QUFDbEQsSUFBSSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsbUJBQW1CLENBQUM7QUFDbEQsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztBQUM5QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO0FBQzVCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDcEIsSUFBSSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUM7QUFDaEQsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUM1QixJQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztBQUM5QyxJQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztBQUM5QyxJQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDOztBQUV0QyxJQUFJLE1BQU0sR0FBRztBQUNYLGdCQUFjLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztBQUN4RCxrQkFBZ0IsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDO0FBQzVELGtCQUFnQixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUM7QUFDNUQsbUJBQWlCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQztBQUM5RCxnQkFBYyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7QUFDeEQsa0JBQWdCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztBQUM1RCxrQkFBZ0IsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDO0FBQzVELG1CQUFpQixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7QUFDOUQsdUJBQXFCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQztBQUN0RSx5QkFBdUIsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDO0FBQzFFLHlCQUF1QixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUM7QUFDMUUsMEJBQXdCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQztBQUM1RSxrQkFBZ0IsRUFBRSw0QkFBVztBQUMzQixXQUFPLElBQUksQ0FBQyxjQUFjLEdBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FDckIsSUFBSSxDQUFDLGdCQUFnQixHQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7R0FDMUI7QUFDRCxrQkFBZ0IsRUFBRSw0QkFBVztBQUMzQixXQUFPLElBQUksQ0FBQyxjQUFjLEdBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FDckIsSUFBSSxDQUFDLGdCQUFnQixHQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7R0FDMUI7QUFDRCx3QkFBc0IsRUFBRSxrQ0FBVztBQUNqQyxXQUFPLElBQUksQ0FBQyxxQkFBcUIsR0FDL0IsSUFBSSxDQUFDLHVCQUF1QixHQUM1QixJQUFJLENBQUMsdUJBQXVCLEdBQzVCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztHQUNqQztDQUNGLENBQUM7Ozs7O0FBS0YsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRzs7QUFFNUIsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLG1CQUFtQixDQUFDLEVBQ3JCLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDMUI7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLG1CQUFtQixDQUFDLEVBQ3JCLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDWjtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsK0JBQStCLENBQUMsRUFDakMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDOztBQUVDLFVBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNwQixlQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksa0NBQWtDLENBQUM7T0FDekQ7QUFDRCxVQUFJLEVBQUUsdUJBQXVCO0FBQzdCLFlBQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUM7S0FDdkIsQ0FBQyxDQUNIO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzFCLENBQUMsbUJBQW1CLENBQUMsQ0FDdEI7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDbkQsQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUM1QztBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsb0JBQW9CLEVBQUUsbUJBQW1CLENBQUMsQ0FDNUM7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZUFBVyxFQUFFLEdBQUc7QUFDaEIsbUJBQWUsRUFBRSxFQUFFO0FBQ25CLDRCQUF3QixFQUFFLElBQUk7R0FDL0I7O0FBRUQsUUFBTSxFQUFFO0FBQ04sVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3JCLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0Isa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxJQUFJO0dBQ2Y7OztBQUdELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQzs7QUFFQyxVQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsZUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQztPQUNsQztBQUNELFVBQUksRUFBRSxXQUFXO0FBQ2pCLFlBQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUM7QUFDNUIsWUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBQztLQUN0QyxDQUFDLEVBQ0YsQ0FBQzs7QUFFQyxVQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsZUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQztPQUNsQztBQUNELFVBQUksRUFBRSxXQUFXO0FBQ2pCLFlBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUM7S0FDdkMsQ0FBQyxDQUNIO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDcEI7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ2xCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDYjtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsWUFBUSxFQUFFLEtBQUs7QUFDZixjQUFVLEVBQUUsSUFBSTtHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNwQjtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRTlCLGtCQUFjLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7QUFDeEQsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQ3JDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ1osQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUN0QyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNoQjtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELFNBQU8sRUFBRTtBQUNQLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUN0QixZQUFRLEVBQUUsR0FBRztBQUNiLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUNoQyxrQkFBYyxFQUFFLENBQ2QsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDbkIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDcEI7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ25CLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2YsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDZCxDQUFDO0FBQ0MsVUFBSSxFQUFFLE1BQU07QUFDWixVQUFJLEVBQUUsTUFBTTtBQUNaLFlBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUM7S0FDdkMsQ0FBQyxFQUNGLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQ3JCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ3BCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFDckMsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUN0QyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNmLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2QsQ0FBQztBQUNDLFVBQUksRUFBRSxNQUFNO0FBQ1osVUFBSSxFQUFFLE1BQU07QUFDWixZQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFDO0tBQ3RDLENBQUMsQ0FDSDtBQUNELFlBQVEsRUFBRSxLQUFLO0FBQ2YsZUFBVyxFQUFFLEdBQUc7QUFDaEIsa0JBQWMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELFFBQU0sRUFBRTtBQUNOLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNyQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7R0FDaEM7OztBQUdELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUNwQztBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDWCxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNoQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FDdEM7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUNyQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNYLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUNwQztBQUNELFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLENBQ047QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0tBQ3BCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLENBQ0Y7QUFDRCxrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDZixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FDdEM7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxDQUNOO0FBQ0UsY0FBUSxFQUFFLFVBQVU7QUFDcEIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUNwQixDQUNGO0FBQ0Qsa0JBQWMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUNwQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFDbkMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDWCxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNmLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUNyQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FDbkM7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxDQUNOO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUNwQixFQUNEO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUNwQixDQUNGO0FBQ0Qsa0JBQWMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsR0FBRztBQUNiLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQzNELENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFDckMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUNwRTtBQUNELHVCQUFtQixFQUFFLEtBQUs7QUFDMUIsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxVQUFVO0FBQ3BCLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsRUFDRDtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsQ0FDRjtBQUNELGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUN4RCxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQ2pFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDbkUsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUNyQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQ2pFO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxjQUFjO0FBQ3hCLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsQ0FDRjtBQUNELGtCQUFjLEVBQUUsQ0FBQztBQUNqQix1QkFBbUIsRUFBRSxLQUFLO0dBQzNCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxFQUFFO0FBQ1osWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUM7S0FDcEIsRUFDRDtBQUNFLGNBQVEsRUFBRSxVQUFVO0FBQ3BCLGNBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUM7S0FDcEIsRUFDRDtBQUNFLGNBQVEsRUFBRSxjQUFjO0FBQ3hCLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsRUFDRDtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsQ0FDRjtBQUNELGtCQUFjLEVBQUUsQ0FBQztBQUNqQix1QkFBbUIsRUFBRSxLQUFLO0dBQzNCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxFQUFFO0FBQ1osWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUN4RCxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQ2pFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDbkUsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUNyQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQ2pFO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztLQUNyQixFQUNEO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQztLQUNwQixFQUNEO0FBQ0UsY0FBUSxFQUFFLGNBQWM7QUFDeEIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUNyQixDQUNGO0FBQ0Qsd0JBQW9CLEVBQUUsSUFBSTtBQUMxQixrQkFBYyxFQUFFLENBQUM7QUFDakIsdUJBQW1CLEVBQUUsS0FBSztHQUMzQjs7QUFFRCxRQUFNLEVBQUU7QUFDTixzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNyQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7R0FDaEM7OztBQUdELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsK0JBQStCLENBQUMsRUFDakMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDOztBQUVDLFVBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNwQixlQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksdUJBQXVCLENBQUM7T0FDOUM7QUFDRCxVQUFJLEVBQUUsdUJBQXVCO0FBQzdCLFlBQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUM7S0FDdkIsQ0FBQyxDQUNIO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3QjtBQUNELGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3QjtBQUNELGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ2hCO0FBQ0QsZUFBVyxFQUFFLEdBQUc7QUFDaEIsY0FBVSxFQUFFLElBQUk7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3QjtBQUNELGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGNBQVUsRUFBRSxJQUFJO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDdkIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDO0FBQ0MsVUFBSSxFQUFFLFdBQVc7QUFDakIsVUFBSSxFQUFFLHVCQUF1QjtBQUM3QixZQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDO0tBQ3ZCLENBQUMsQ0FDSDtBQUNELG1CQUFlLEVBQUUsRUFBRTtBQUNuQixrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ2I7QUFDRCxrQkFBYyxFQUFFLENBQUM7QUFDakIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3QjtBQUNELGtCQUFjLEVBQUUsQ0FBQztBQUNqQixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixZQUFRLEVBQUUsR0FBRztBQUNiLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3QjtBQUNELGtCQUFjLEVBQUUsR0FBRztBQUNuQixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxRQUFNLEVBQUU7QUFDTixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckIsWUFBUSxFQUFFLEVBQUU7QUFDWixZQUFRLEVBQUUsR0FBRztBQUNiLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3ZCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMvQixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDaEI7QUFDRCxrQkFBYyxFQUFFLENBQUM7QUFDakIsZUFBVyxFQUFFLEdBQUc7QUFDaEIsY0FBVSxFQUFFLElBQUk7R0FDakI7O0FBRUQsUUFBTSxFQUFFO0FBQ04sVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3JCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsWUFBUSxFQUFFLEVBQUU7QUFDWixZQUFRLEVBQUUsR0FBRztBQUNiLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0Isa0JBQWMsRUFBRyxFQUFFO0FBQ25CLGtCQUFjLEVBQUUsQ0FBQztBQUNqQixlQUFXLEVBQUUsR0FBRztHQUNoQjs7OztBQUlGLE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLElBQUk7QUFDZCxZQUFRLEVBQUUsR0FBRztBQUNiLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELFdBQVMsRUFBRTtBQUNULFVBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBUSxFQUFFLElBQUk7QUFDZCxZQUFRLEVBQUUsR0FBRztBQUNiLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDO0FBQ3ZDLGVBQVcsRUFBRSxFQUFFO0FBQ2Ysa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELFVBQVEsRUFBRTtBQUNSLFVBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBUSxFQUFFLEtBQUs7QUFDZixZQUFRLEVBQUUsR0FBRztBQUNiLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDO0FBQ3ZDLGVBQVcsRUFBRSxFQUFFO0FBQ2Ysa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCO0FBQ0QsV0FBUyxFQUFFO0FBQ1QsVUFBTSxFQUFFLEVBQUU7QUFDVixZQUFRLEVBQUUsS0FBSztBQUNmLFlBQVEsRUFBRSxHQUFHO0FBQ2IsUUFBSSxFQUFFLElBQUk7QUFDVixXQUFPLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FDN0IsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEdBQ3pCLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxHQUN6QixNQUFNLENBQUMsc0JBQXNCLEVBQUUsR0FDL0IsVUFBVSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxHQUNwRCxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQzdDO0FBQ0gsZUFBVyxFQUFFLEVBQUU7QUFDZixrQkFBYyxFQUFFLENBQUM7QUFDakIsZUFBVyxFQUFFLEdBQUc7R0FDakI7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDMUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQWUsRUFBRTtBQUNmLGlCQUFhLEVBQUUsSUFBSTtBQUNuQixlQUFXLEVBQUUsSUFBSTtHQUNsQjtBQUNELGVBQWEsRUFBRSxxQkFBcUI7Q0FDckMsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMxQyxZQUFVLEVBQUUsSUFBSTtBQUNoQixpQkFBZSxFQUFFO0FBQ2YsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGVBQVcsRUFBRSxJQUFJO0dBQ2xCO0FBQ0QsZUFBYSxFQUFFLDRDQUE0QztDQUM1RCxDQUFDLENBQUM7QUFDSCxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFlLEVBQUU7QUFDZixpQkFBYSxFQUFFLElBQUk7QUFDbkIsZUFBVyxFQUFFLElBQUk7QUFDakIsZUFBVyxFQUFFLElBQUk7QUFDakIsbUJBQWUsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7R0FDMUM7QUFDRCxlQUFhLEVBQUUsMENBQTBDO0NBQzFELENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDMUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQWUsRUFBRTtBQUNmLGlCQUFhLEVBQUUsSUFBSTtBQUNuQixlQUFXLEVBQUUsSUFBSTtBQUNqQixlQUFXLEVBQUUsSUFBSTtBQUNqQixtQkFBZSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtHQUMxQztBQUNELGVBQWEsRUFBRSw2REFBNkQ7Q0FDN0UsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM1QyxZQUFVLEVBQUUsSUFBSTtBQUNoQixpQkFBZSxFQUFFO0FBQ2YsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLG1CQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO0dBQzFDO0FBQ0QsZUFBYSxFQUFFLHFCQUFxQjtDQUNyQyxDQUFDLENBQUM7OztBQ3Q0Qkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDM0RBLElBQUksa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7OztBQUc1RCxTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDM0IsU0FBTyxFQUFDLElBQUksRUFBRSxlQUFlO0FBQ3JCLFFBQUksRUFBRSxlQUFlO0FBQ3JCLFVBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUMsRUFBQyxDQUFDO0NBQ3ZFOzs7QUFHRCxTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUU7QUFDNUIsU0FBTyxFQUFDLElBQUksRUFBRSxnQkFBZ0I7QUFDdEIsUUFBSSxFQUFFLGdCQUFnQjtBQUN0QixVQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEVBQUMsQ0FBQztDQUN2RTs7OztBQUlELElBQUksbUJBQW1CLEdBQUcsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBQyxDQUFDOzs7QUFHL0UsSUFBSSwrQkFBK0IsR0FBRztBQUNwQyxNQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsV0FBTyxLQUFLLENBQUMsSUFBSSxJQUFJLHVCQUF1QixDQUFDO0dBQzlDO0FBQ0QsTUFBSSxFQUFFLHVCQUF1QjtDQUM5QixDQUFDOzs7O0FBSUYsSUFBSSxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsQ0FBWSxNQUFNLEVBQUU7QUFDdkMsU0FBTyxFQUFDLElBQUksRUFBRSxhQUFhO0FBQ25CLFFBQUksRUFBRSx1QkFBdUI7QUFDN0IsVUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBQyxFQUFDLENBQUM7Q0FDcEMsQ0FBQzs7OztBQUlGLElBQUksb0JBQW9CLEdBQUcsRUFBQyxJQUFJLEVBQUUsY0FBYztBQUNwQixNQUFJLEVBQUUsdUJBQXVCO0FBQzdCLFFBQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUMsRUFBQyxDQUFDOzs7Ozs7QUFNN0QsSUFBSSxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBWSxPQUFPLEVBQUU7QUFDMUMsU0FBTyxFQUFDLElBQUksRUFBRSxZQUFZO0FBQ2xCLFFBQUksRUFBRSxrQ0FBa0M7QUFDeEMsVUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxFQUFDLENBQUM7Q0FDckMsQ0FBQzs7Ozs7O0FBTUYsSUFBSSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsQ0FBWSxPQUFPLEVBQUU7QUFDekMsU0FBTyxFQUFDLElBQUksRUFBRSxXQUFXO0FBQ2pCLFFBQUksRUFBRSxrQ0FBa0M7QUFDeEMsVUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxFQUFDLENBQUM7Q0FDckMsQ0FBQzs7OztBQUtGLElBQUksbUJBQW1CLEdBQUcsU0FBdEIsbUJBQW1CLENBQVksT0FBTyxFQUFFO0FBQzFDLFNBQU87QUFDTCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLHVCQUF1QixLQUN2QyxPQUFPLEtBQUssS0FBSyxJQUNqQixPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FDNUIsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sQ0FBQSxBQUFDLENBQUM7S0FDbkU7QUFDRCxRQUFJLEVBQUUsdUJBQXVCO0FBQzdCLFVBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsRUFBQyxDQUFDO0NBQy9CLENBQUM7Ozs7O0FBS0YsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQVksT0FBTyxFQUFFO0FBQ2hDLFNBQU87QUFDTCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLFdBQVcsSUFDOUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxXQUFXLENBQUM7S0FDM0M7QUFDSCxRQUFJLEVBQUUsV0FBVztBQUNqQixVQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsV0FBVyxFQUFDO0FBQzVCLFVBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUM7R0FDOUQsQ0FBQztDQUNILENBQUM7Ozs7O0FBS0YsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQVksT0FBTyxFQUFFO0FBQy9CLFNBQU87QUFDTCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLFdBQVcsSUFDOUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUM7S0FDMUM7QUFDSCxRQUFJLEVBQUUsV0FBVztBQUNqQixVQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFDO0FBQzNCLFVBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUM7R0FDOUQsQ0FBQztDQUNILENBQUM7Ozs7QUFJRixJQUFJLElBQUksR0FBRyxTQUFQLElBQUksQ0FBWSxRQUFRLEVBQUU7QUFDNUIsU0FBTyxFQUFDLElBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUFDLGFBQU8sS0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUM7S0FBRTtBQUMxRCxRQUFJLEVBQUUsV0FBVztBQUNqQixVQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFDLEVBQUMsQ0FBQztDQUN6RSxDQUFDOzs7QUFHRixJQUFJLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFZLE9BQU8sRUFBRTtBQUN6QyxTQUFPO0FBQ0wsUUFBSSxFQUFFLGNBQVMsS0FBSyxFQUFFO0FBQ3BCLGFBQU8sS0FBSyxDQUFDLElBQUksSUFBSSxrQ0FBa0MsQ0FBQztLQUN6RDtBQUNELFFBQUksRUFBRSxrQ0FBa0M7QUFDeEMsVUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQztHQUMzQixDQUFDO0NBQ0gsQ0FBQzs7O0FBR0YsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQWM7QUFDeEIsU0FBTztBQUNMLFFBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNwQixhQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDO0tBQ2xDO0FBQ0QsUUFBSSxFQUFFLFdBQVc7QUFDakIsVUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBQztHQUM1RCxDQUFDO0NBQ0gsQ0FBQzs7OztBQUlGLElBQUksaUJBQWlCLEdBQUcsRUFBQyxJQUFJLEVBQUUsZUFBZTtBQUM1QyxNQUFJLEVBQUUsYUFBYTtBQUNuQixRQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsc0NBQXNDLEVBQUMsRUFBQyxDQUFDOzs7O0FBSTlELElBQUksaUJBQWlCLEdBQUcsRUFBQyxJQUFJLEVBQUUseUJBQXlCO0FBQ3RELE1BQUksRUFBRSxhQUFhO0FBQ25CLFFBQU0sRUFBRSxFQUFDLFFBQVEsRUFBRSxzQ0FBc0MsRUFBQyxFQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFhOUQsSUFBSSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFZLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDaEQsU0FBTztBQUNMLFFBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNwQixhQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksd0JBQXdCLElBQ3pDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxJQUN4QyxLQUFLLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxJQUNyRCxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQztLQUMxQztBQUNELFFBQUksRUFBRSx3QkFBd0I7QUFDOUIsVUFBTSxFQUFFLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQztBQUMzQixTQUFLLEVBQUUsdUJBQXVCLEdBQUcsUUFBUSxHQUFHLHFCQUFxQjtHQUNsRSxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsZ0JBQWMsRUFBRSxrQkFBa0IsQ0FBQyxjQUFjO0FBQ2pELGFBQVcsRUFBRSxrQkFBa0IsQ0FBQyxXQUFXO0FBQzNDLFFBQU0sRUFBRSxrQkFBa0IsQ0FBQyxNQUFNO0FBQ2pDLGFBQVcsRUFBRSxXQUFXO0FBQ3hCLGNBQVksRUFBRSxZQUFZO0FBQzFCLHFCQUFtQixFQUFFLG1CQUFtQjtBQUN4QyxpQ0FBK0IsRUFBRSwrQkFBK0I7QUFDaEUsbUJBQWlCLEVBQUUsaUJBQWlCO0FBQ3BDLHNCQUFvQixFQUFFLG9CQUFvQjtBQUMxQyxvQkFBa0IsRUFBRSxrQkFBa0I7QUFDdEMscUJBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLHFCQUFtQixFQUFFLG1CQUFtQjtBQUN4QyxXQUFTLEVBQUUsU0FBUztBQUNwQixVQUFRLEVBQUUsUUFBUTtBQUNsQixNQUFJLEVBQUUsSUFBSTtBQUNWLG9CQUFrQixFQUFFLGtCQUFrQjtBQUN0QyxVQUFRLEVBQUUsUUFBUTtBQUNsQixtQkFBaUIsRUFBRSxpQkFBaUI7QUFDcEMsbUJBQWlCLEVBQUUsaUJBQWlCO0FBQ3BDLGVBQWEsRUFBRSxhQUFhO0NBQzdCLENBQUM7Ozs7O0FDek1GLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV4QyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUN0QixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQ3hFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDckUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUM1RSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ3BFLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7QUFDMUIsUUFBTSxFQUFFO0FBQ04sU0FBSyxFQUFFLEtBQUs7QUFDWixVQUFNLEVBQUUsRUFBRTtHQUNYO0NBQ0YsQ0FBQzs7O0FDZEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNmQSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFHMUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFTLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ3RELG9CQUFrQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0Msc0JBQW9CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqRCwrQkFBNkIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFELHNCQUFvQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakQsbUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QyxvQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLHVCQUFxQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEQscUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNoRCxrQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzdDLG1CQUFpQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUMsb0JBQWtCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQyxvQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLHFCQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEQsc0JBQW9CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqRCxzQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVqRCxpQ0FBK0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzVELENBQUM7O0FBRUYsSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUV6QyxTQUFTLGlCQUFpQixDQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ2hELE1BQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixRQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUN0QixTQUFPLENBQ0wsTUFBTSxHQUFHLG9CQUFvQixFQUM3QixNQUFNLEdBQUcsV0FBVyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLFNBQVMsR0FDL0QsTUFBTSxHQUFTLE9BQU8sR0FBRyxPQUFPLEVBQ2hDLE1BQU0sR0FBRyx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUM5QyxNQUFNLEdBQUcseUJBQXlCLEVBQ2xDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUI7Ozs7Ozs7Ozs7QUFVRCxTQUFTLG9CQUFvQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7QUFDOUMsU0FBTztBQUNMLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFNUIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUzQyxVQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7QUFDM0IsWUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUN6QixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUM3QixRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FDdkMsV0FBVyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQztPQUNuQzs7QUFFRCxVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckI7R0FDRixDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTs7O0FBR3RELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFOUIsU0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRWhGLFdBQVMsQ0FBQyxvQkFBb0IsR0FBRyxZQUFXOztBQUUxQyxRQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUNwQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUIsV0FBTyxDQUNILGtCQUFrQixFQUNsQixXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUMvQyxPQUFPLEdBQUcsT0FBTyxFQUN2Qix1QkFBdUIsR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUM3Qyx5QkFBeUIsRUFDekIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZCLENBQUM7Q0FDSDs7Ozs7O0FBTUQsU0FBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTs7QUFFeEQsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ2hDLE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdELFNBQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUV6RSxXQUFTLENBQUMsZUFBZSxHQUFHLFlBQVc7QUFDckMsV0FBTyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDdEMsQ0FBQzs7QUFFRixXQUFTLENBQUMsb0JBQW9CLEdBQUcsWUFBVztBQUMxQyxRQUFJLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hFLFdBQU8saUJBQWlCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQ3hDLENBQUM7Q0FDSDs7Ozs7QUFLRCxTQUFTLDZCQUE2QixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFOztBQUVqRSxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7QUFFekMsU0FBTyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdkUsV0FBUyxDQUFDLHlCQUF5QixHQUFHLFlBQVc7QUFDL0MsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixXQUFPLENBQ0wsOEJBQThCLEVBQzlCLHlCQUF5QixFQUN6QixzQkFBc0IsRUFDdEIsV0FBVyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsT0FBTyxFQUN6RSxhQUFhLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxRQUFRLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxPQUFPLEVBQzlFLDZCQUE2QixFQUM3Qiw4QkFBOEIsRUFDOUIsMkJBQTJCLEVBQzNCLEtBQUssRUFDTCx3QkFBd0IsRUFDeEIsNEJBQTRCLEVBQzVCLHdCQUF3QixFQUN4QixHQUFHLEVBQ0gseUJBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekMsQ0FBQztDQUNIOzs7OztBQU1ELFNBQVMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0FBRXZELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFL0IsU0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUUxRSxXQUFTLENBQUMsY0FBYyxHQUFHLFlBQVc7QUFDcEMsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDcEMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFdBQU8sQ0FDTCxXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUMvQyxPQUFPLEdBQUcsT0FBTyxFQUN2Qix1QkFBdUIsR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUM3Qyx5QkFBeUIsRUFDekIsdUJBQXVCLEdBQUcsWUFBWSxHQUFHLElBQUksRUFDN0MsMEJBQTBCLEVBQzFCLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNyQixDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTs7QUFFeEQsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVoQyxTQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRTNFLFdBQVMsQ0FBQyxlQUFlLEdBQUcsWUFBVztBQUNyQyxRQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUNwQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUIsV0FBTyxDQUNILG9CQUFvQixFQUNwQixXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUMvQyxPQUFPLEdBQUcsT0FBTyxFQUN2Qix1QkFBdUIsR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUM3Qyx5QkFBeUIsRUFDekIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZCLENBQUM7Q0FDSDs7Ozs7QUFLRCxTQUFTLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFOztBQUV2RCxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7O0FBRS9CLFNBQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHLG9CQUFvQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFMUUsV0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXO0FBQ3BDLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ3BDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixXQUFPLENBQ0gsb0JBQW9CLEVBQ3BCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQy9DLE9BQU8sR0FBRyxPQUFPLEVBQ3ZCLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHdCQUF3QixFQUN4QixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkIsQ0FBQztDQUNIOzs7OztBQUtELFNBQVMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0FBRXJELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFN0IsU0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUV4RSxXQUFTLENBQUMsWUFBWSxHQUFHLFlBQVc7QUFDbEMsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDcEMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFdBQU8sQ0FDTCxXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxPQUFPLEVBQ3pFLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHdCQUF3QixFQUN4QixHQUFHLEVBQ0gsc0JBQXNCLEVBQ3RCLHFCQUFxQixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzNDLHVCQUF1QixFQUN2QixXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxPQUFPLEVBQ3pFLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHlCQUF5QixFQUN6QixHQUFHLEVBQ0gsdUJBQXVCLEVBQ3ZCLHFCQUFxQixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzNDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3hDLENBQUM7Q0FDSDs7Ozs7QUFLRCxTQUFTLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFOztBQUV0RCxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRTlCLFNBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLG9CQUFvQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFekUsV0FBUyxDQUFDLGFBQWEsR0FBRyxZQUFXO0FBQ25DLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ3BDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFOUIsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELFdBQU8sQ0FDTCw4QkFBOEIsRUFDOUIscUJBQXFCLEdBQUcsWUFBWSxHQUFHLElBQUksRUFDM0Msc0JBQXNCLEVBQ3RCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxTQUFTLEdBQUcsT0FBTyxHQUFHLE9BQU8sRUFDMUUscUJBQXFCLEdBQUcsWUFBWSxHQUFHLElBQUksRUFDM0Msd0JBQXdCLEVBQ3hCLHVCQUF1QixHQUFHLFlBQVksR0FBRyxRQUFRLEVBQ2pELHdCQUF3QixHQUFHLFlBQVksR0FBRyxPQUFPLEVBQ2pELEdBQUcsRUFDSCx3QkFBd0IsRUFDeEIscUJBQXFCLEdBQUcsWUFBWSxHQUFHLElBQUksRUFDM0MsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDMUMsQ0FBQztDQUNIOzs7OztBQUtELFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0FBRXpELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFakMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFOUQsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7QUFDdEMsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QixRQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsV0FBTyxDQUNMLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLE9BQU8sRUFDekUsZ0NBQWdDLEVBQ2hDLDJCQUEyQixFQUMzQix5QkFBeUIsRUFDekIsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QixnQ0FBZ0MsRUFDaEMsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QiwyQkFBMkIsRUFDM0IseUJBQXlCLEVBQ3pCLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNyQixDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTs7QUFFcEQsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUU1QixTQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRXZFLFdBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUNqQyxRQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUNwQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTlCLFdBQU8sQ0FDTCx1QkFBdUIsRUFDdkIsV0FBVyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsT0FBTyxFQUN6RSx1QkFBdUIsR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUM3QywwQkFBMEIsRUFDMUIsR0FBRyxFQUNILHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3hDLENBQUM7Q0FDSDs7Ozs7QUFLRCxTQUFTLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFOztBQUVyRCxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRTdCLFNBQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUxRCxXQUFTLENBQUMsWUFBWSxHQUFHLFlBQVc7QUFDbEMsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QixXQUFPLENBQ0wsc0JBQXNCLEVBQ3RCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLE9BQU8sRUFDekUsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QixHQUFHLEVBQ0gsdUJBQXVCLEVBQ3ZCLDBCQUEwQixFQUMxQix5QkFBeUIsRUFDekIsdUJBQXVCLEVBQ3ZCLHlCQUF5QixFQUN6Qix1QkFBdUIsRUFDdkIseUJBQXlCLEVBQ3pCLHVCQUF1QixFQUN2Qix5QkFBeUIsRUFDekIsMEJBQTBCLEVBQzFCLHVCQUF1QixFQUN2Qix5QkFBeUIsRUFDekIsMEJBQTBCLEVBQzFCLHVCQUF1QixFQUN2QiwwQkFBMEIsRUFDMUIsd0JBQXdCLEVBQ3hCLHlCQUF5QixFQUN6QiwwQkFBMEIsRUFDMUIsdUJBQXVCLEVBQ3ZCLDBCQUEwQixFQUMxQiwwQkFBMEIsRUFDMUIsdUJBQXVCLEVBQ3ZCLHlCQUF5QixFQUN6QixzQkFBc0IsRUFDdEIsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0MsQ0FBQztDQUNIOzs7OztBQU1ELFNBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0FBRXRELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFOUIsU0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUV6RSxXQUFTLENBQUMsYUFBYSxHQUFHLFlBQVc7QUFDbkMsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDcEMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFL0IsV0FBTyxDQUNMLDhCQUE4QixFQUM5QixXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxPQUFPLEVBQ3pFLDJCQUEyQixFQUMzQix5QkFBeUIsRUFDekIsR0FBRyxFQUNILDhCQUE4QixFQUM5QixzQkFBc0IsRUFDdEIseUJBQXlCLEVBQ3pCLHFCQUFxQixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzNDLHVCQUF1QixFQUN2Qix5QkFBeUIsRUFDekIsdUJBQXVCLEVBQ3ZCLHFCQUFxQixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzNDLHVCQUF1QixFQUN2Qix5QkFBeUIsRUFDekIsdUJBQXVCLEVBQ3ZCLHFCQUFxQixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzNDLHVCQUF1QixFQUN2QixXQUFXLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxRQUFRLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxPQUFPLEVBQzVFLDJCQUEyQixFQUMzQix5QkFBeUIsRUFDekIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JCLENBQUM7Q0FDSDs7Ozs7QUFLRCxTQUFTLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFOztBQUV0RCxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRTlCLFNBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLG9CQUFvQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFekUsV0FBUyxDQUFDLGFBQWEsR0FBRyxZQUFXO0FBQ25DLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ3BDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFHOUIsV0FBTyxDQUNMLDhCQUE4QixFQUM5QixXQUFXLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsVUFBVSxHQUFHLE9BQU8sR0FBRyxPQUFPLEVBQzNFLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHdCQUF3QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzlDLHdCQUF3QixFQUN4QixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckIsQ0FBQztDQUNIOzs7OztBQUtELFNBQVMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0FBRXhELE1BQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUUzRSxXQUFTLENBQUMsZUFBZSxHQUFHLFlBQVc7QUFDckMsUUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FDcEMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDM0MsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QixXQUFPLENBQ0wsOEJBQThCLEVBQzlCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxTQUFTLEdBQUcsT0FBTyxHQUFHLE9BQU8sRUFDMUUsdUJBQXVCLEdBQUcsWUFBWSxHQUFHLElBQUksRUFDN0MseUJBQXlCLEVBQ3pCLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNyQixDQUFDO0NBQ0g7Ozs7O0FBS0QsU0FBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTs7QUFFeEQsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVoQyxTQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRTNFLFdBQVMsQ0FBQyxlQUFlLEdBQUcsWUFBVztBQUNyQyxRQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUNwQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTlCLFdBQU8sQ0FDTCw4QkFBOEIsRUFDOUIsV0FBVyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLFNBQVMsR0FBRyxPQUFPLEdBQUcsT0FBTyxFQUMxRSx1QkFBdUIsR0FBRyxZQUFZLEdBQUcsSUFBSSxFQUM3Qyx3QkFBd0IsRUFDeEIsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JCLENBQUM7Q0FDSDs7QUFFRCxTQUFTLCtCQUErQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ25FLE1BQUksVUFBVSxHQUFHLENBQ2YsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFDdkMsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxlQUFlLENBQUMsRUFDckQsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFDbkMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFDdkMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFDdkMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFDekMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FDeEMsQ0FBQzs7QUFHRixTQUFPLENBQUMsTUFBTSxDQUFDLHlCQUF5QixHQUFHOzs7QUFHekMsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU1QixVQUFJLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEQsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFbkQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMseUJBQXlCLEdBQUcsWUFBWTtBQUNoRCxRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLFdBQU8sd0JBQXdCLEdBQUcsSUFBSSxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztHQUM1RSxDQUFDO0NBQ0g7Ozs7OztBQzdnQkQsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQzs7Ozs7Ozs7OztBQ0k5QyxJQUFJLE9BQU8sR0FBRztBQUNaLE9BQUssRUFBRSxTQUFTO0FBQ2hCLE1BQUksRUFBRSxTQUFTO0FBQ2YsT0FBSyxFQUFFLFNBQVM7QUFDaEIsT0FBSyxFQUFFLFNBQVM7QUFDaEIsS0FBRyxFQUFFLFNBQVM7QUFDZCxNQUFJLEVBQUUsU0FBUztBQUNmLFFBQU0sRUFBRSxTQUFTO0FBQ2pCLFFBQU0sRUFBRSxTQUFTO0FBQ2pCLE9BQUssRUFBRSxTQUFTO0FBQ2hCLE1BQUksRUFBRSxTQUFTO0FBQ2YsWUFBVSxFQUFFLFNBQVM7QUFDckIsTUFBSSxFQUFFLFNBQVM7O0FBRWYsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7QUFDbEIsU0FBTyxFQUFFLFNBQVM7Q0FDbkIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7Ozs7QUM5QnpCLElBQUksU0FBUyxDQUFDOztBQUVkLE9BQU8sQ0FBQyxlQUFlLEdBQUcsVUFBVSxTQUFTLEVBQUU7QUFDN0MsV0FBUyxHQUFHLFNBQVMsQ0FBQztDQUN2QixDQUFDOztBQUVGLE9BQU8sQ0FBQyxXQUFXLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDdkMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDNUMsQ0FBQzs7QUFFRixPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQ3hDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDN0MsQ0FBQzs7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQ2xDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMvQyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDcEMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2pELENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRTtBQUNwQyxXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQ3JDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUNoRCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDbEMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQy9DLENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRTtBQUNwQyxXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7QUFFRixPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQ3BDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUNqRCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDckMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2hELENBQUM7O0FBRUYsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFTLFFBQVEsRUFBRTtBQUN2QyxXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM1QyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDeEMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUM3QyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsVUFBUyxLQUFLLEVBQUU7QUFDbEMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7QUFFRixPQUFPLENBQUMsUUFBUSxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQ2pDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDMUMsQ0FBQzs7QUFFRixPQUFPLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ3JDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLENBQUM7O0FBRUYsT0FBTyxDQUFDLEtBQUssR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUMzQixXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUM3QixXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRTtBQUNqQyxXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3RELENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRyxVQUFTLE1BQU0sRUFBRTtBQUNuQyxXQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsV0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDM0MsQ0FBQzs7QUFFRixPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ2hDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ2hDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQ2xDLFdBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzVDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekVGLFlBQVksQ0FBQzs7QUFFYixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQzs7QUFFMUIsSUFBSSxzQkFBc0IsR0FBRyxTQUF6QixzQkFBc0IsR0FBYztBQUN0QyxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHdEQsS0FBRyxJQUFJLFFBQVEsQ0FBQztBQUNoQixNQUFJLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEtBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDdkIsQ0FBQzs7QUFFRixJQUFJLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBWSxNQUFNLEVBQUUsYUFBYSxFQUFFO0FBQy9DLE9BQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEMsUUFBSSxhQUFhLEVBQUU7QUFDakIsNEJBQXNCLEVBQUUsQ0FBQztLQUMxQjtBQUNELE9BQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsT0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNuQjtDQUNGLENBQUM7O0FBRUYsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQVksTUFBTSxFQUFFLGFBQWEsRUFBRTtBQUNqRCxPQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ3RDLFFBQUksYUFBYSxFQUFFO0FBQ2pCLDRCQUFzQixFQUFFLENBQUM7S0FDMUI7QUFDRCxPQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLE9BQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDcEI7Q0FDRixDQUFDOztBQUVGLElBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFZLE1BQU0sRUFBRTtBQUNqQyxLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLE1BQUksU0FBUyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxNQUFNLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMzRCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFCLFFBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ25ELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMvQixTQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFCLFNBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDRCxRQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDVixTQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0dBQ0Y7QUFDRCxLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2xCLENBQUM7O0FBRUYsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQVksTUFBTSxFQUFFO0FBQy9CLFlBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQixLQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLEtBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEIsY0FBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JCLEtBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEIsS0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixLQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLEtBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDMUIsQ0FBQzs7Ozs7Ozs7QUFRRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUNyQyxLQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLE1BQUksS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUM7QUFDeEIsTUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ2IsWUFBUSxLQUFLO0FBQ1gsV0FBSyxDQUFDOztBQUVKLFdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsV0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQixXQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSiw4QkFBc0IsRUFBRSxDQUFDO0FBQ3pCLGtCQUFVLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixrQkFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2QixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7O0FBRUosb0JBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsb0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7O0FBRUosb0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixXQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLFdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekIsV0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQixrQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsa0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7O0FBRUosYUFBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDbEMsZ0NBQXNCLEVBQUUsQ0FBQztBQUN6QixhQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGFBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixhQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNwQyxhQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLGFBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEI7QUFDRCxjQUFNO0FBQUEsS0FDVDtHQUNGLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ3BCLFlBQVEsS0FBSztBQUNYLFdBQUssQ0FBQzs7QUFFSiw4QkFBc0IsRUFBRSxDQUFDO0FBQ3pCLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLFdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekIsa0JBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixhQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNsQyxnQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixhQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNuQyxnQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLG9CQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQyxDQUFDO0FBQ1AsV0FBSyxDQUFDOztBQUVKLGFBQUssR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQUU7QUFDbkMsb0JBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNqQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixhQUFLLEdBQUcsR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFO0FBQ2xDLGFBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssR0FBRztBQUNOLG1CQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsbUJBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7O0FBRUosYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMxQixnQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLHFCQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsQixhQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGFBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEI7QUFDRCxjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7O0FBRUosYUFBSyxJQUFJLE1BQU0sR0FBRyxHQUFHLEVBQUUsTUFBTSxJQUFJLEVBQUUsRUFBRSxNQUFNLElBQUksRUFBRSxFQUFFO0FBQ2pELGdDQUFzQixFQUFFLENBQUM7QUFDekIscUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixhQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xCLGFBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsYUFBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNsQjtBQUNELGNBQU07QUFBQSxLQUNUO0dBQ0YsTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7QUFDcEIsWUFBUSxLQUFLO0FBQ1gsV0FBSyxDQUFDOztBQUVKLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDO0FBQ0osb0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixXQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsV0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixvQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQzs7QUFFSixpQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLGlCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7QUFDSiw4QkFBc0IsRUFBRSxDQUFDO0FBQ3pCLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsV0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQiw4QkFBc0IsRUFBRSxDQUFDO0FBQ3pCLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLGlCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7QUFDSixpQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsaUJBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNmLGlCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7QUFDSixhQUFLLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxJQUFJLEdBQUcsRUFBRSxLQUFLLElBQUksRUFBRSxFQUFFO0FBQzFDLGdDQUFzQixFQUFFLENBQUM7QUFDekIsbUJBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQjtBQUNELGNBQU07QUFBQSxLQUNUO0dBQ0YsTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7QUFDcEIsWUFBUSxLQUFLO0FBQ1gsV0FBSyxDQUFDOztBQUVKLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLGFBQUssS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ2xDLGdDQUFzQixFQUFFLENBQUM7QUFDekIsc0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixhQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO0FBQ0QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDOztBQUVKLGFBQUssS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ2xDLGdDQUFzQixFQUFFLENBQUM7QUFDekIsc0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixhQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO0FBQ0QsY0FBTTtBQUFBLEFBQ1IsV0FBSyxDQUFDO0FBQ0osYUFBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDbkMsZ0NBQXNCLEVBQUUsQ0FBQztBQUN6QixzQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLGFBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7QUFDRCxjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7QUFDSixhQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNuQyxnQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLHNCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtBQUNELGNBQU07QUFBQSxBQUNSLFdBQUssQ0FBQztBQUNKLGtCQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixjQUFNO0FBQUEsQUFDUixXQUFLLENBQUM7QUFDSixhQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNuQyxnQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLG9CQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixhQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JCO0FBQ0gsY0FBTTtBQUFBLEFBQ04sV0FBSyxDQUFDO0FBQ0osYUFBSyxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUU7QUFDeEMsZUFBSyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDbkMsa0NBQXNCLEVBQUUsQ0FBQztBQUN6QixzQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsZUFBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztXQUNyQjtBQUNELGFBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7QUFDSCxjQUFNO0FBQUEsQUFDTixXQUFLLENBQUM7QUFDSixhQUFLLE9BQU8sR0FBRyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtBQUN4QyxlQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNuQyxrQ0FBc0IsRUFBRSxDQUFDO0FBQ3pCLHNCQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixlQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1dBQ3JCO0FBQ0QsYUFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtBQUNILGNBQU07QUFBQSxBQUNOLFdBQUssRUFBRTtBQUNMLGFBQUssT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFO0FBQ3hDLGVBQUssS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFO0FBQ25DLGtDQUFzQixFQUFFLENBQUM7QUFDekIsc0JBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLGVBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7V0FDckI7QUFDRCxhQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO0FBQ0gsY0FBTTtBQUFBLEtBQ1A7R0FDRjtBQUNELFNBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztDQUNoQixDQUFDOzs7OztBQ3hWRixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDOzs7Ozs7OztBQVExQixJQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsR0FBZTtBQUMxQixNQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztDQUNmLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7O0FBRTNCLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLEVBQUUsRUFBRTtBQUNuRCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ3hCO0NBQ0YsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFVLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDdEQsTUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7O0FBR1osTUFBSSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxHQUFlO0FBQzlCLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO0FBQ3pDLFdBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQ3hELENBQUM7O0FBRUYsTUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLFFBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ3JGOztBQUVELFVBQU8sSUFBSTtBQUNULFNBQUssU0FBUztBQUNaLFdBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGFBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RCLGVBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RCLGdCQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6QixnQkFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsZ0JBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1dBQ3hCO0FBQ0QsY0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEIsY0FBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkI7QUFDRCxZQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN4QjtBQUNELFlBQU07O0FBQUEsQUFFUixTQUFLLFFBQVE7QUFDWCxXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QixZQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN4QjtBQUNELFlBQU07O0FBQUEsQUFFUixTQUFLLFFBQVE7QUFDWCxXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QixZQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QixZQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6QixZQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN4QjtBQUNELFlBQU07O0FBQUEsQUFFUixTQUFLLE1BQU07QUFDVCxXQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QixZQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDaEMsWUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDekIsWUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDdkI7QUFDRCxVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QixZQUFNOztBQUFBLEFBRVIsU0FBSyxlQUFlO0FBQ2xCLFdBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZCLGFBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RCLGNBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLGNBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLGNBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3pCO0FBQ0QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDeEI7QUFDRCxZQUFNOztBQUFBLEFBRVIsU0FBSyxRQUFRO0FBQ1gsV0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdkIsYUFBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEIsY0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDekIsY0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEI7QUFDRCxZQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN4QjtBQUNELFlBQU07QUFBQSxHQUNUO0NBQ0YsQ0FBQzs7QUFHRixTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDdkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDeEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN0QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3hDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3ZELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3hELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDakQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNuQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ3ZDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUN6QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2pELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDbkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLE9BQU8sRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUM1QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDNUMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNyQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBBcnRpc3QgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LnR1cnRsZU1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBhcnRpc3QgPSBuZXcgQXJ0aXN0KCk7XG5cbiAgd2luZG93Ll9fVGVzdEludGVyZmFjZS5zZXRTcGVlZFNsaWRlclZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgYXJ0aXN0LnNwZWVkU2xpZGVyLnNldFZhbHVlKHZhbHVlKTtcbiAgfTtcbiAgYXJ0aXN0LmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGFydGlzdCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHZhciBDT05GSUdTID0ge1xuICAgIGFubmE6IHtcbiAgICAgIC8vIHNsaWRlciBzcGVlZCBnZXRzIGRpdmlkZWQgYnkgdGhpcyB2YWx1ZVxuICAgICAgc3BlZWRNb2RpZmllcjogMTAsXG4gICAgICB0dXJ0bGVOdW1GcmFtZXM6IDEwLFxuICAgICAgc21vb3RoQW5pbWF0ZTogdHJ1ZSxcbiAgICAgIGNvbnNvbGlkYXRlVHVybkFuZE1vdmU6IHRydWUsXG4gICAgICBhbm5hTGluZTogc2tpbi5hc3NldFVybCgnYW5uYWxpbmUucG5nJyksXG4gICAgICBhbm5hTGluZV8yeDogc2tpbi5hc3NldFVybCgnYW5uYWxpbmVfMngucG5nJyksXG4gICAgICAvLyBVc2VkIHRvIHBvcHVsYXRlIHRoZSBTZXQgUGF0dGVybiBibG9ja1xuICAgICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnM6IFtbc2tpbi5hc3NldFVybCgnYW5uYWxpbmUtbWVudWljb24ucG5nJyksICdhbm5hTGluZSddXVxuICAgIH0sXG5cbiAgICBlbHNhOiB7XG4gICAgICBzcGVlZE1vZGlmaWVyOiAxMCxcbiAgICAgIHR1cnRsZU51bUZyYW1lczogMjAsXG4gICAgICBkZWNvcmF0aW9uQW5pbWF0aW9uTnVtRnJhbWVzOiAxOSxcbiAgICAgIHNtb290aEFuaW1hdGU6IHRydWUsXG4gICAgICBjb25zb2xpZGF0ZVR1cm5BbmRNb3ZlOiB0cnVlLFxuICAgICAgZWxzYUxpbmU6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lLnBuZycpLFxuICAgICAgZWxzYUxpbmVfMng6IHNraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lXzJ4LnBuZycpLFxuICAgICAgLy8gVXNlZCB0byBwb3B1bGF0ZSB0aGUgU2V0IFBhdHRlcm4gYmxvY2tcbiAgICAgIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zOiBbW3NraW4uYXNzZXRVcmwoJ2Vsc2FsaW5lLW1lbnVpY29uLnBuZycpLCAnZWxzYUxpbmUnXV1cbiAgICB9LFxuXG4gICAgYXJ0aXN0OiB7XG4gICAgICAvLyBVc2VkIHRvIHBvcHVsYXRlIHRoZSBTZXQgUGF0dGVybiBibG9ja1xuICAgICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnM6IFtcbiAgICAgICAgICBbc2tpbi5yYWluYm93TWVudSwgJ3JhaW5ib3dMaW5lJ10sXG4gICAgICAgICAgW3NraW4ucm9wZU1lbnUsICdyb3BlTGluZSddLFxuICAgICAgICAgIFtza2luLnNxdWlnZ2x5TWVudSwgJ3NxdWlnZ2x5TGluZSddLFxuICAgICAgICAgIFtza2luLnN3aXJseU1lbnUsICdzd2lybHlMaW5lJ11cbiAgICAgIF1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGNvbmZpZyA9IENPTkZJR1Nbc2tpbi5pZF07XG5cbiAgLy8gYmFzZSBza2luIHByb3BlcnRpZXMgaGVyZSAoY2FuIGJlIG92ZXJyaWRlbiBieSBDT05GSUcpXG4gIHNraW4uc3BlZWRNb2RpZmllciA9IDE7XG5cbiAgLy8gc3RhbXBzIGFyZW4ndCBhY3R1YWxseSB1c2VkIG9uIHByb2R1Y3Rpb24gYW55d2hlcmUgcmlnaHQgbm93LiBpZiB3ZSB3ZXJlXG4gIC8vIHRvIHdhbnQgdG8gdXNlIHRoZW0sIGRlZmluZSB0aGUgbWFwcGluZyBmcm9tIGltYWdlIHRvIG5hbWUgaGVyZS5cbiAgc2tpbi5zdGFtcFZhbHVlcyA9IFtcbiAgICBbc2tpbi5hdmF0YXIsICdERUZBVUxUJ11cbiAgXTtcblxuICAvLyBHZXQgcHJvcGVydGllcyBmcm9tIGNvbmZpZ1xuICB2YXIgaXNBc3NldCA9IC9cXC5cXFN7M30kLzsgLy8gZW5kcyBpbiBkb3QgZm9sbG93ZWQgYnkgdGhyZWUgbm9uLXdoaXRlc3BhY2UgY2hhcnNcbiAgZm9yICh2YXIgcHJvcCBpbiBjb25maWcpIHtcbiAgICBza2luW3Byb3BdID0gY29uZmlnW3Byb3BdO1xuICB9XG5cbiAgLy8gRGVjbGFyZSBhdmFpbGFibGUgbGluZSBzdHlsZSBwYXR0ZXJucy4gVGhpcyBhcnJheSBvZiBhcnJheXMgaXMgZXZlbnR1YWxseSB1c2VkXG4gIC8vIHRvIHBvcHVsYXRlIHRoZSBpbWFnZSBkcm9wZG93biBpbiB0aGUgU2V0IFBhdHRlcm4gYmxvY2suXG5cbiAgLy8gQWxsIHNraW5zIGhhdmUgdGhlIGRlZmF1bHQgbGluZSBzdHlsZSAoc29saWQgY29sb3VyZWQgbGluZSlcbiAgdmFyIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zID0gIFtbc2tpbi5wYXR0ZXJuRGVmYXVsdCwgJ0RFRkFVTFQnXV07XG5cbiAgLy8gSWYgdGhlIHNraW4gcHJvdmlkZWQgbGluZSBwYXR0ZXJucywgYWRkIHRoZW0gdG8gdGhlIHBhdHRlcm4gc2V0XG4gIGlmIChjb25maWcgJiYgY29uZmlnLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zKSB7XG4gICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucy5jb25jYXQoY29uZmlnLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zKTtcbiAgfVxuXG4gIHNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucztcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogVHVydGxlIEdyYXBoaWNzLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgY3VzdG9tTGV2ZWxCbG9ja3MgPSByZXF1aXJlKCcuL2N1c3RvbUxldmVsQmxvY2tzJyk7XG52YXIgVHVydGxlID0gcmVxdWlyZSgnLi90dXJ0bGUnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIGlmIChza2luLmlkID09IFwiYW5uYVwiIHx8IHNraW4uaWQgPT0gXCJlbHNhXCIpXG4gIHtcbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgQ29sb3Vycy5GUk9aRU4xLCBDb2xvdXJzLkZST1pFTjIsIENvbG91cnMuRlJPWkVOMyxcbiAgICAgIENvbG91cnMuRlJPWkVONCwgQ29sb3Vycy5GUk9aRU41LCBDb2xvdXJzLkZST1pFTjYsXG4gICAgICBDb2xvdXJzLkZST1pFTjcsIENvbG91cnMuRlJPWkVOOCwgQ29sb3Vycy5GUk9aRU45XTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSAzO1xuXG4gIH0gZWxzZSB7XG5cbiAgICAvLyBDcmVhdGUgYSBzbWFsbGVyIHBhbGV0dGUuXG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTID0gW1xuICAgICAgLy8gUm93IDEuXG4gICAgICBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLkdSRVksXG4gICAgICBDb2xvdXJzLktIQUtJLCBDb2xvdXJzLldISVRFLFxuICAgICAgLy8gUm93IDIuXG4gICAgICBDb2xvdXJzLlJFRCwgQ29sb3Vycy5QSU5LLFxuICAgICAgQ29sb3Vycy5PUkFOR0UsIENvbG91cnMuWUVMTE9XLFxuICAgICAgLy8gUm93IDMuXG4gICAgICBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsXG4gICAgICBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgYmxvY2tseS5GaWVsZENvbG91ci5DT0xVTU5TID0gNDtcbiAgfVxuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEwMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudDtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQuVkFMVUUgPVxuICAgICAgWzMwLCA0NSwgNjAsIDkwLCAxMjAsIDEzNSwgMTUwLCAxODBdLlxuICAgICAgbWFwKGZ1bmN0aW9uKHQpIHtyZXR1cm4gW1N0cmluZyh0KSwgU3RyaW5nKHQpXTt9KTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKCksICdWQUxVRScpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd190dXJuX2J5X2NvbnN0YW50O1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmVfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZlxuICAgIC8vIHBpeGVscy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkIHNldCBvZiBhbmdsZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUUpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5faW5saW5lX3Jlc3RyaWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZFxuICAgIC8vIHNldCBvZiBhbmdsZXMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnOTAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKTtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfY291bnRlciA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2NvdW50ZXIgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICBibG9ja2x5LkJsb2Nrcy52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSksICdWQVInKTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVE9PTFRJUCk7XG4gICAgfSxcbiAgICBnZXRWYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKV07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0X2xlbmd0aCA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfc2lkZXMgPSB7XG4gICAgLy8gVmFyaWFibGUgZ2V0dGVyLlxuICAgIGNhdGVnb3J5OiBudWxsLCAgLy8gVmFyaWFibGVzIGFyZSBoYW5kbGVkIHNwZWNpYWxseS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX0hFTFBVUkwsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9USVRMRSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbCgnc2lkZXMnKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfc2lkZXMgPSBnZW5lcmF0b3IudmFyaWFibGVzX2dldDtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNxdWFyZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3NxdWFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQykgfHwgMDtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgICAnLy8gZHJhd19hX3NxdWFyZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNub3dtYW5cIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG9cbiAgLy8gdXNlcnMgd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc25vd21hbiA9IHtcbiAgICAvLyBEcmF3IGEgY2lyY2xlIGluIGZyb250IG9mIHRoZSB0dXJ0bGUsIGVuZGluZyB1cCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNub3dtYW4oKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zbm93bWFuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNub3dtYW4gaW4gZnJvbnQgb2YgdGhlIHR1cnRsZS5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBkaXN0YW5jZXNWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlcycpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudGVyJyk7XG4gICAgdmFyIGRlZ3JlZVZhciA9IGdlbnN5bSgnZGVncmVlJyk7XG4gICAgdmFyIGRpc3RhbmNlVmFyID0gZ2Vuc3ltKCdkaXN0YW5jZScpO1xuICAgIHJldHVybiBbXG4gICAgICAvLyBUaGUgZ2VuZXJhdGVkIGNvbW1lbnQgaGVscHMgZGV0ZWN0IHJlcXVpcmVkIGJsb2Nrcy5cbiAgICAgIC8vIERvbid0IGNoYW5nZSBpdCB3aXRob3V0IGNoYW5naW5nIHJlcXVpcmVkQmxvY2tzXy5cbiAgICAgICcvLyBkcmF3X2Ffc25vd21hbicsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ3ZhciAnICsgZGlzdGFuY2VzVmFyICsgJyA9IFsnICsgdmFsdWUgKyAnICogMC41LCAnICsgdmFsdWUgKyAnICogMC4zLCcgK1xuICAgICAgICAgIHZhbHVlICsgJyAqIDAuMl07JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICBsb29wVmFyICsgJysrKSB7XFxuJyxcbiAgICAgICcgIHZhciAnICsgZGlzdGFuY2VWYXIgKyAnID0gJyArIGRpc3RhbmNlc1ZhciArICdbJyArIGxvb3BWYXIgK1xuICAgICAgICAgICcgPCAzID8gJyArIGxvb3BWYXIgKyAnOiA1IC0gJyArIGxvb3BWYXIgKyAnXSAvIDU3LjU7JyxcbiAgICAgICcgIGZvciAodmFyICcgKyBkZWdyZWVWYXIgKyAnID0gMDsgJyArIGRlZ3JlZVZhciArICcgPCA5MDsgJyArXG4gICAgICAgICAgZGVncmVlVmFyICsgJysrKSB7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyBkaXN0YW5jZVZhciArICcpOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoMik7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgaWYgKCcgKyBsb29wVmFyICsgJyAhPSAyKSB7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5MZWZ0KDE4MCk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG5cbiAgLy8gVGhpcyBpcyBhIG1vZGlmaWVkIGNvcHkgb2YgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yIHdpdGggdGhlXG4gIC8vIHZhcmlhYmxlIG5hbWVkIFwiY291bnRlclwiIGhhcmRjb2RlZC5cbiAgYmxvY2tseS5CbG9ja3MuY29udHJvbHNfZm9yX2NvdW50ZXIgPSB7XG4gICAgLy8gRm9yIGxvb3Agd2l0aCBoYXJkY29kZWQgbG9vcCB2YXJpYWJsZS5cbiAgICBoZWxwVXJsOiBibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfV0lUSClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChtc2cubG9vcFZhcmlhYmxlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAnVkFSJyk7XG4gICAgICB0aGlzLmludGVycG9sYXRlTXNnKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9GUk9NX1RPX0JZLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydGUk9NJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydUTycsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnQlknLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja2x5LkFMSUdOX1JJR0hUKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoQmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0RPKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfVE9PTFRJUC5yZXBsYWNlKFxuICAgICAgICAgICclMScsIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJykpKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9LFxuICAgIGN1c3RvbUNvbnRleHRNZW51OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgb3B0aW9uID0ge2VuYWJsZWQ6IHRydWV9O1xuICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgb3B0aW9uLnRleHQgPSBibG9ja2x5Lk1zZy5WQVJJQUJMRVNfU0VUX0NSRUFURV9HRVQucmVwbGFjZSgnJTEnLCBuYW1lKTtcbiAgICAgIHZhciB4bWxUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RpdGxlJyk7XG4gICAgICB4bWxUaXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuYW1lKSk7XG4gICAgICB4bWxUaXRsZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnVkFSJyk7XG4gICAgICB2YXIgeG1sQmxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdibG9jaycpO1xuICAgICAgeG1sQmxvY2suYXBwZW5kQ2hpbGQoeG1sVGl0bGUpO1xuICAgICAgeG1sQmxvY2suc2V0QXR0cmlidXRlKCd0eXBlJywgJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpO1xuICAgICAgb3B0aW9uLmNhbGxiYWNrID0gYmxvY2tseS5Db250ZXh0TWVudS5jYWxsYmFja0ZhY3RvcnkodGhpcywgeG1sQmxvY2spO1xuICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbik7XG4gICAgfSxcbiAgICAvLyBzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZSB0byB4bWwgc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBhY3Jvc3NcbiAgICAvLyBkaWZmZXJlbnQgbG9jYWxlc1xuICAgIG11dGF0aW9uVG9Eb206IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdtdXRhdGlvbicpO1xuICAgICAgdmFyIGNvdW50ZXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpO1xuICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnY291bnRlcicsIGNvdW50ZXIpO1xuICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9LFxuICAgIC8vIGRlc2VyaWFsaXplIHRoZSBjb3VudGVyIHZhcmlhYmxlIG5hbWVcbiAgICBkb21Ub011dGF0aW9uOiBmdW5jdGlvbih4bWxFbGVtZW50KSB7XG4gICAgICB2YXIgY291bnRlciA9IHhtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjb3VudGVyJyk7XG4gICAgICB0aGlzLnNldFRpdGxlVmFsdWUoY291bnRlciwgJ1ZBUicpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY29udHJvbHNfZm9yX2NvdW50ZXIgPSBnZW5lcmF0b3IuY29udHJvbHNfZm9yO1xuXG4gIC8vIERlbGV0ZSB0aGVzZSBzdGFuZGFyZCBibG9ja3MuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG5cbiAgLy8gR2VuZXJhbCBibG9ja3MuXG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cubW92ZUZvcndhcmQoKSwgJ21vdmVGb3J3YXJkJ10sXG4gICAgICAgW21zZy5tb3ZlQmFja3dhcmQoKSwgJ21vdmVCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuZHJhd19tb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmRzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJMT05HX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlID0gXCJTSE9SVF9NT1ZFX0xFTkdUSFwiO1xuICB2YXIgc2ltcGxlTGVuZ3RoQ2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXcsIGxvbmdNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV0sXG4gICAgW3NraW4uc2hvcnRMaW5lRHJhdywgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcbiAgdmFyIHNpbXBsZUxlbmd0aFJpZ2h0Q2hvaWNlcyA9IFtcbiAgICBbc2tpbi5sb25nTGluZURyYXdSaWdodCwgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3UmlnaHQsIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdXG4gIF07XG5cbiAgdmFyIFNpbXBsZU1vdmUgPSB7XG4gICAgREVGQVVMVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgU0hPUlRfTU9WRV9MRU5HVEg6IDUwLFxuICAgIExPTkdfTU9WRV9MRU5HVEg6IDEwMCxcbiAgICBESVJFQ1RJT05fQ09ORklHUzoge1xuICAgICAgbGVmdDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbldlc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZUxlZnQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVdlc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLndlc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIHJpZ2h0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlUmlnaHQnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZUVhc3RUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLmVhc3RMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzXG4gICAgICB9LFxuICAgICAgdXA6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Ob3J0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlVXAnLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZU5vcnRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5ub3J0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgZG93bjoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVEb3duJyxcbiAgICAgICAgdG9vbHRpcDogbXNnLm1vdmVTb3V0aFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uc291dGhMaW5lRHJhdyxcbiAgICAgICAgaW1hZ2VEaW1lbnNpb25zOiB7d2lkdGg6IDcyLCBoZWlnaHQ6IDU2fSxcbiAgICAgICAgbGVuZ3Roczogc2ltcGxlTGVuZ3RoQ2hvaWNlc1xuICAgICAgfSxcbiAgICAgIGp1bXBfbGVmdDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wTGVmdCcsXG4gICAgICAgIGltYWdlOiBza2luLmxlZnRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wV2VzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfcmlnaHQ6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbkVhc3RMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFJpZ2h0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ucmlnaHRKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wRWFzdFRvb2x0aXAoKVxuICAgICAgfSxcbiAgICAgIGp1bXBfdXA6IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBVcCcsXG4gICAgICAgIGltYWdlOiBza2luLnVwSnVtcEFycm93LFxuICAgICAgICB0b29sdGlwOiBtc2cuanVtcE5vcnRoVG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9kb3duOiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25Tb3V0aExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wRG93bicsXG4gICAgICAgIGltYWdlOiBza2luLmRvd25KdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wU291dGhUb29sdGlwKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwidXBcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiZG93blwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJsZWZ0XCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcInJpZ2h0XCIpO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb246IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoZGlyZWN0aW9uKTtcbiAgICAgIGdlbmVyYXRvcltcInNpbXBsZV9qdW1wX1wiICsgZGlyZWN0aW9uXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX21vdmVfXCIgKyBkaXJlY3Rpb24gKyBcIl9sZW5ndGhcIl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb24gKyAnX2xlbmd0aCddID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24sIHRydWUpO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9tb3ZlXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24pO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ3NpbXBsZV9qdW1wXycgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jaygnanVtcF8nICsgZGlyZWN0aW9uKTtcbiAgICB9LFxuICAgIGdlbmVyYXRlTW92ZUJsb2NrOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0KSB7XG4gICAgICB2YXIgZGlyZWN0aW9uQ29uZmlnID0gU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dO1xuICAgICAgdmFyIGRpcmVjdGlvbkxldHRlcldpZHRoID0gMTI7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoZWxwVXJsOiAnJyxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5hcHBlbmREdW1teUlucHV0KCk7XG4gICAgICAgICAgaWYgKGRpcmVjdGlvbkNvbmZpZy5pc0p1bXApIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5qdW1wKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKGRpcmVjdGlvbkNvbmZpZy50aXRsZSwge2ZpeGVkU2l6ZToge3dpZHRoOiBkaXJlY3Rpb25MZXR0ZXJXaWR0aCwgaGVpZ2h0OiAxOH19KSk7XG5cbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucykge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgICAgIGRpcmVjdGlvbkNvbmZpZy5pbWFnZURpbWVuc2lvbnMuaGVpZ2h0KSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2UoZGlyZWN0aW9uQ29uZmlnLmltYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgICAgIHRoaXMuc2V0VG9vbHRpcChkaXJlY3Rpb25Db25maWcudG9vbHRpcCk7XG4gICAgICAgICAgaWYgKGhhc0xlbmd0aElucHV0KSB7XG4gICAgICAgICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24oZGlyZWN0aW9uQ29uZmlnLmxlbmd0aHMpO1xuICAgICAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUobG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlKTtcbiAgICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnbGVuZ3RoJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgZ2VuZXJhdGVDb2RlR2VuZXJhdG9yOiBmdW5jdGlvbihkaXJlY3Rpb24sIGhhc0xlbmd0aElucHV0LCBsZW5ndGgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGVuZ3RoID0gbGVuZ3RoIHx8IFNpbXBsZU1vdmUuREVGQVVMVF9NT1ZFX0xFTkdUSDtcblxuICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICBsZW5ndGggPSBTaW1wbGVNb3ZlW3RoaXMuZ2V0VGl0bGVWYWx1ZShcImxlbmd0aFwiKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdUdXJ0bGUuJyArIFNpbXBsZU1vdmUuRElSRUNUSU9OX0NPTkZJR1NbZGlyZWN0aW9uXS5tb3ZlRnVuY3Rpb24gKyAnKCcgKyBsZW5ndGggKyAnLCcgKyAnXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckFsbERpcmVjdGlvbnMoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cuanVtcEZvcndhcmQoKSwgJ2p1bXBGb3J3YXJkJ10sXG4gICAgICAgW21zZy5qdW1wQmFja3dhcmQoKSwgJ2p1bXBCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IuanVtcCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGp1bXBpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVsc1xuICAgIC8vIHdpdGhvdXQgZHJhd2luZy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmp1bXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXJcbiAgICAvLyBvZiBwaXhlbHMgd2l0aG91dCBkcmF3aW5nLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSkgfHwgMDtcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuICBnZW5lcmF0b3IuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybiA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZGVncmVlcygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLnR1cm5SaWdodCgpLCAndHVyblJpZ2h0J10sXG4gICAgICAgW21zZy50dXJuTGVmdCgpLCAndHVybkxlZnQnXV07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIHRoaXMgaXMgdGhlIG9sZCB2ZXJzaW9uIG9mIHRoaXMgYmxvY2ssIHRoYXQgc2hvdWxkIG9ubHkgc3RpbGwgYmUgdXNlZCBpblxuICAvLyBvbGQgc2hhcmVkIGxldmVsc1xuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdXSURUSCcpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aWR0aFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnV0lEVEgnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzEnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICAvLyBpbmxpbmVkIHZlcnNpb24gb2YgZHJhd193aWR0aFxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3dpZHRoX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldFdpZHRoKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzEnLFxuICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnV0lEVEgnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGhfaW5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgcGVuIHdpZHRoLlxuICAgIHZhciB3aWR0aCA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnV0lEVEgnKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5XaWR0aCgnICsgd2lkdGggKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHBlbiB1cC9kb3duLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdQRU4nKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnBlblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfcGVuLlNUQVRFID1cbiAgICAgIFtbbXNnLnBlblVwKCksICdwZW5VcCddLFxuICAgICAgIFttc2cucGVuRG93bigpLCAncGVuRG93biddXTtcblxuICBnZW5lcmF0b3IuZHJhd19wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBwZW4gdXAvZG93bi5cbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdQRU4nKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfY29sb3VyID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ0NPTE9VUicpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuQ09MT1VSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5hbHBoYSA9IHtcbiAgICAvLyBUT0RPOlxuICAgIC8vIC0gQWRkIGFscGhhIHRvIGEgZ3JvdXBcbiAgICAvLyAtIE1ha2Ugc3VyZSBpdCBkb2Vzbid0IGNvdW50IGFnYWluc3QgY29ycmVjdCBzb2x1dGlvbnNcbiAgICAvL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldEFscGhhKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KFwiVkFMVUVcIilcbiAgICAgICAgICAuc2V0Q2hlY2soXCJOdW1iZXJcIik7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSwgbnVsbCk7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYWxwaGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFscGhhID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9OT05FKTtcbiAgICByZXR1cm4gJ1R1cnRsZS5nbG9iYWxBbHBoYSgnICsgYWxwaGEgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfY29sb3VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnXFwnIzAwMDAwMFxcJyc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvdXIgKyAnLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXJfc2ltcGxlID0ge1xuICAgIC8vIFNpbXBsaWZpZWQgZHJvcGRvd24gYmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb2xvdXJzID0gW0NvbG91cnMuUkVELCBDb2xvdXJzLkJMQUNLLCBDb2xvdXJzLlBJTkssIENvbG91cnMuT1JBTkdFLFxuICAgICAgICBDb2xvdXJzLllFTExPVywgQ29sb3Vycy5HUkVFTiwgQ29sb3Vycy5CTFVFLCBDb2xvdXJzLkFRVUFNQVJJTkUsIENvbG91cnMuUExVTV07XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB2YXIgY29sb3VyRmllbGQgPSBuZXcgQmxvY2tseS5GaWVsZENvbG91ckRyb3Bkb3duKGNvbG91cnMsIDQ1LCAzNSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0Q29sb3VyKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbG91ckZpZWxkLCAnQ09MT1VSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5jb2xvdXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXJfc2ltcGxlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0NPTE9VUicpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoXCInICsgY29sb3VyICsgJ1wiLCBcXCdibG9ja19pZF8nICtcbiAgICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19saW5lX3N0eWxlX3BhdHRlcm4gPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gYW4gYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0UGF0dGVybigpKVxuICAgICAgICAgICAuYXBwZW5kVGl0bGUoIG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihcbiAgICAgICAgICAgICAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucywgMTUwLCAyMCApLCAnVkFMVUUnICk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFBhdHRlcm4oKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGltYWdlIGZvciBhIHBhdHRlcm5lZCBsaW5lLlxuICAgIHZhciBwYXR0ZXJuID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpIHx8ICdcXCdERUZBVUxUXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5QYXR0ZXJuKFwiJyArIHBhdHRlcm4gKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy51cF9iaWcgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuU1RBVEUpLCAnVklTSUJJTElUWScpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJ0bGVWaXNpYmlsaXR5VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnVwX2JpZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICB2YXIgY29sb3VyID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdDT0xPVVInLFxuICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3Zpc2liaWxpdHkgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmxpdHkuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eS5TVEFURSA9XG4gICAgICBbW21zZy5oaWRlVHVydGxlKCksICdoaWRlVHVydGxlJ10sXG4gICAgICAgW21zZy5zaG93VHVydGxlKCksICdzaG93VHVydGxlJ11dO1xuXG4gIGdlbmVyYXRvci50dXJ0bGVfdmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGNoYW5naW5nIHR1cnRsZSB2aXNpYmlsaXR5LlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZJU0lCSUxJVFknKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV9zdGFtcCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5kcmF3U3RhbXAoKSk7XG4gICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLlZBTFVFUywgNTAsIDMwKTtcblxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuXG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmRyYXdTdGFtcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYmxvY2sgaXMgY3VycmVudGx5IHVudXNlZC4gaWYgd2Ugd2FudCB0byBhZGQgaXQgYmFjayBpbiB0aGUgZnV0dXJlLCBhZGRcbiAgLy8gc3RhbXAgaW1hZ2VzIGhlcmVcbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wLlZBTFVFUyA9IHNraW4uc3RhbXBWYWx1ZXM7XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV9zdGFtcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ1R1cnRsZS5kcmF3U3RhbXAoXCInICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpICtcbiAgICAgICAgJ1wiLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgY3VzdG9tTGV2ZWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IFR1cnRsZSBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIEdsb2JhbHMgdXNlZCBpbiB0aGlzIGZpbGU6XG4vLyAgQmxvY2tseVxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgdHVydGxlTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIEFydGlzdEFQSSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgYXBpSmF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdCcpO1xudmFyIEFwcFZpZXcgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvQXBwVmlldy5qc3gnKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgU2xpZGVyID0gcmVxdWlyZSgnLi4vc2xpZGVyJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xudmFyIEpzSW50ZXJwcmV0ZXJMb2dnZXIgPSByZXF1aXJlKCcuLi9Kc0ludGVycHJldGVyTG9nZ2VyJyk7XG5cbnZhciBDQU5WQVNfSEVJR0hUID0gNDAwO1xudmFyIENBTlZBU19XSURUSCA9IDQwMDtcblxudmFyIEpPSU5UX1JBRElVUyA9IDQ7XG5cbnZhciBTTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSA1O1xudmFyIEZBU1RfU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFID0gMTU7XG5cbi8qKlxuKiBNaW5pbXVtIGpvaW50IHNlZ21lbnQgbGVuZ3RoXG4qL1xudmFyIEpPSU5UX1NFR01FTlRfTEVOR1RIID0gNTA7XG5cbi8qKlxuICogQW4geCBvZmZzZXQgYWdhaW5zdCB0aGUgc3ByaXRlIGVkZ2Ugd2hlcmUgdGhlIGRlY29yYXRpb24gc2hvdWxkIGJlIGRyYXduLFxuICogYWxvbmcgd2l0aCB3aGV0aGVyIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUgb3IgYWZ0ZXIgdGhlIHR1cnRsZSBzcHJpdGUgaXRzZWxmLlxuICovXG52YXIgRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFMgPSBbXG4gIHsgeDogMTUsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDI2LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiAzNywgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNDYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYwLCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2NSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY0LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Miwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDU1LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNDgsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAzMywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMxLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMjIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAxNywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDEyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogIDgsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDEwLCB3aGVuOiBcImFmdGVyXCIgfVxuXTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgQXJ0aXN0IGNsYXNzXG4gKiBAcGFyYW0ge1N0dWRpb0FwcH0gc3R1ZGlvQXBwIFRoZSBzdHVkaW9BcHAgaW5zdGFuY2UgdG8gYnVpbGQgdXBvbi5cbiAqL1xudmFyIEFydGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG4gIGFwaUphdmFzY3JpcHQuaW5qZWN0QXJ0aXN0QVBJKHRoaXMuYXBpKTtcblxuICAvKiogQHR5cGUge0pTSW50ZXJwcmV0ZXJ9ICovXG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG5cbiAgLyoqIEBwcml2YXRlIHtKc0ludGVycHJldGVyTG9nZ2VyfSAqL1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfID0gbmV3IEpzSW50ZXJwcmV0ZXJMb2dnZXIod2luZG93LmNvbnNvbGUpO1xuXG4gIC8vIGltYWdlIGljb25zIGFuZCBpbWFnZSBwYXRocyBmb3IgdGhlICdzZXQgcGF0dGVybiBibG9jaydcbiAgdGhpcy5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IFtdO1xuICB0aGlzLnN0YW1wcyA9IFtdO1xuXG4gIC8vIFBJRCBvZiBhbmltYXRpb24gdGFzayBjdXJyZW50bHkgZXhlY3V0aW5nLlxuICB0aGlzLnBpZCA9IDA7XG5cbiAgLy8gU2hvdWxkIHRoZSB0dXJ0bGUgYmUgZHJhd24/XG4gIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gU2V0IGEgdHVydGxlIGhlYWRpbmcuXG4gIHRoaXMuaGVhZGluZyA9IDA7XG5cbiAgLy8gVGhlIGF2YXRhciBpbWFnZVxuICB0aGlzLmF2YXRhckltYWdlID0gbmV3IEltYWdlKCk7XG4gIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIGF2YXRhciBhbmltYXRpb24gZGVjb3JhdGlvbiBpbWFnZVxuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gIC8vIERyYXdpbmcgd2l0aCBhIHBhdHRlcm5cbiAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5sb2FkZWRQYXRoUGF0dGVybnMgPSBbXTtcbiAgdGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybiA9IGZhbHNlO1xuXG4gIC8vIHRoZXNlIGdldCBzZXQgYnkgaW5pdCBiYXNlZCBvbiBza2luLlxuICB0aGlzLmF2YXRhcldpZHRoID0gMDtcbiAgdGhpcy5hdmF0YXJIZWlnaHQgPSAwO1xuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25XaWR0aCA9IDg1O1xuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25IZWlnaHQgPSA4NTtcbiAgdGhpcy5zcGVlZFNsaWRlciA9IG51bGw7XG5cbiAgdGhpcy5jdHhBbnN3ZXIgPSBudWxsO1xuICB0aGlzLmN0eEltYWdlcyA9IG51bGw7XG4gIHRoaXMuY3R4UHJlZHJhdyA9IG51bGw7XG4gIHRoaXMuY3R4U2NyYXRjaCA9IG51bGw7XG4gIHRoaXMuY3R4UGF0dGVybiA9IG51bGw7XG4gIHRoaXMuY3R4RmVlZGJhY2sgPSBudWxsO1xuICB0aGlzLmN0eERpc3BsYXkgPSBudWxsO1xuXG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IGZhbHNlO1xuICB0aGlzLmlzUHJlZHJhd2luZ18gPSBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJ0aXN0O1xuXG5cbi8qKlxuICogdG9kb1xuICovXG5BcnRpc3QucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgdHVydGxlLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXJ0aXN0IHJlcXVpcmVzIGEgU3R1ZGlvQXBwXCIpO1xuICB9XG5cbiAgdGhpcy5za2luID0gY29uZmlnLnNraW47XG4gIHRoaXMubGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgLy8gUHJlbG9hZCBzdGFtcCBpbWFnZXNcbiAgdGhpcy5zdGFtcHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNraW4uc3RhbXBWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdXJsID0gdGhpcy5za2luLnN0YW1wVmFsdWVzW2ldWzBdO1xuICAgIHZhciBrZXkgPSB0aGlzLnNraW4uc3RhbXBWYWx1ZXNbaV1bMV07XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5zcmMgPSB1cmw7XG4gICAgdGhpcy5zdGFtcHNba2V5XSA9IGltZztcbiAgfVxuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgLy8gbGV0J3MgdHJ5IGFkZGluZyBhIGJhY2tncm91bmQgaW1hZ2VcbiAgICB0aGlzLmxldmVsLmltYWdlcyA9IFt7fV07XG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0uZmlsZW5hbWUgPSAnYmFja2dyb3VuZC5qcGcnO1xuXG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0ucG9zaXRpb24gPSBbIDAsIDAgXTtcbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5zY2FsZSA9IDE7XG4gIH1cblxuICBjb25maWcuZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzID0gdHJ1ZTtcbiAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2sgPSAnd2hlbl9ydW4nO1xuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MztcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDEwMDtcbiAgfVxuICBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzM7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSAxMDA7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGggPSA4NTtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25IZWlnaHQgPSA4NTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzA7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSA1MTtcbiAgfVxuXG4gIHZhciBpY29uUGF0aCA9ICdtZWRpYS90dXJ0bGUvJyArIChjb25maWcuaXNMZWdhY3lTaGFyZSAmJiBjb25maWcuaGlkZVNvdXJjZSA/ICdpY29uc193aGl0ZS5wbmcnIDogJ2ljb25zLnBuZycpO1xuICBjb25maWcubG9hZEF1ZGlvID0gXy5iaW5kKHRoaXMubG9hZEF1ZGlvXywgdGhpcyk7XG4gIGNvbmZpZy5hZnRlckluamVjdCA9IF8uYmluZCh0aGlzLmFmdGVySW5qZWN0XywgdGhpcywgY29uZmlnKTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgcmVuZGVyQ29kZUFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHBhZ2Uoe1xuICAgICAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdmlzdWFsaXphdGlvbjogJycsXG4gICAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7YXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCwgaWNvblBhdGg6IGljb25QYXRofSksXG4gICAgICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSxcbiAgICBvbk1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xuICAgIH0uYmluZCh0aGlzKVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5BcnRpc3QucHJvdG90eXBlLmFmdGVySW5qZWN0XyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2xpZGVyLlxuICB2YXIgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlcicpO1xuICB0aGlzLnNwZWVkU2xpZGVyID0gbmV3IFNsaWRlcigxMCwgMzUsIDEzMCwgc2xpZGVyKTtcblxuICAvLyBDaGFuZ2UgZGVmYXVsdCBzcGVlZCAoZWcgU3BlZWQgdXAgbGV2ZWxzIHRoYXQgaGF2ZSBsb3RzIG9mIHN0ZXBzKS5cbiAgaWYgKGNvbmZpZy5sZXZlbC5zbGlkZXJTcGVlZCkge1xuICAgIHRoaXMuc3BlZWRTbGlkZXIuc2V0VmFsdWUoY29uZmlnLmxldmVsLnNsaWRlclNwZWVkKTtcbiAgfVxuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ1R1cnRsZSxjb2RlJyk7XG4gIH1cblxuICAvLyBDcmVhdGUgaGlkZGVuIGNhbnZhc2VzLlxuICB0aGlzLmN0eEFuc3dlciA9IHRoaXMuY3JlYXRlQ2FudmFzXygnYW5zd2VyJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4SW1hZ2VzID0gdGhpcy5jcmVhdGVDYW52YXNfKCdpbWFnZXMnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhQcmVkcmF3ID0gdGhpcy5jcmVhdGVDYW52YXNfKCdwcmVkcmF3JywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4U2NyYXRjaCA9IHRoaXMuY3JlYXRlQ2FudmFzXygnc2NyYXRjaCcsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFBhdHRlcm4gPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3BhdHRlcm4nLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhGZWVkYmFjayA9IHRoaXMuY3JlYXRlQ2FudmFzXygnZmVlZGJhY2snLCAxNTQsIDE1NCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAvLyBDcmVhdGUgZGlzcGxheSBjYW52YXMuXG4gIHZhciBkaXNwbGF5Q2FudmFzID0gdGhpcy5jcmVhdGVDYW52YXNfKCdkaXNwbGF5JywgNDAwLCA0MDApO1xuXG4gIHZhciB2aXN1YWxpemF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb24nKTtcbiAgdmlzdWFsaXphdGlvbi5hcHBlbmRDaGlsZChkaXNwbGF5Q2FudmFzKTtcbiAgdGhpcy5jdHhEaXNwbGF5ID0gZGlzcGxheUNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIFRPRE8gKGJyLXBhaXIpOiAtIHB1bGwgdGhpcyBvdXQ/XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJiAodGhpcy5za2luLmlkID09PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT09IFwiZWxzYVwiKSkge1xuICAgIC8vIE92ZXJyaWRlIGNvbG91cl9yYW5kb20gdG8gb25seSBnZW5lcmF0ZSByYW5kb20gY29sb3JzIGZyb20gd2l0aGluIG91ciBmcm96ZW5cbiAgICAvLyBwYWxldHRlXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIGNvbG91ci5cbiAgICAgIGlmICghQmxvY2tseS5KYXZhU2NyaXB0LmRlZmluaXRpb25zXy5jb2xvdXJfcmFuZG9tKSB7XG4gICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBCbG9ja2x5LkphdmFTY3JpcHQudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKFxuICAgICAgICAgICdjb2xvdXJfcmFuZG9tJywgQmxvY2tseS5HZW5lcmF0b3IuTkFNRV9UWVBFKTtcbiAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lO1xuICAgICAgICB2YXIgZnVuYyA9IFtdO1xuICAgICAgICBmdW5jLnB1c2goJ2Z1bmN0aW9uICcgKyBmdW5jdGlvbk5hbWUgKyAnKCkgeycpO1xuICAgICAgICBmdW5jLnB1c2goJyAgIHZhciBjb2xvcnMgPSAnICsgSlNPTi5zdHJpbmdpZnkoQmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTKSArICc7Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpjb2xvcnMubGVuZ3RoKV07Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnfScpO1xuICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQuZGVmaW5pdGlvbnNfLmNvbG91cl9yYW5kb20gPSBmdW5jLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgdmFyIGNvZGUgPSBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5mdW5jdGlvbk5hbWUgKyAnKCknO1xuICAgICAgcmV0dXJuIFtjb2RlLCBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfRlVOQ1RJT05fQ0FMTF07XG4gICAgfTtcbiAgfVxuXG4gIHRoaXMubG9hZERlY29yYXRpb25BbmltYXRpb24oKTtcblxuICAvLyBTZXQgdGhlaXIgaW5pdGlhbCBjb250ZW50cy5cbiAgdGhpcy5sb2FkVHVydGxlKCk7XG4gIHRoaXMuZHJhd0ltYWdlcygpO1xuXG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IHRydWU7XG4gIHRoaXMuZHJhd0Fuc3dlcigpO1xuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSBmYWxzZTtcblxuICBpZiAodGhpcy5sZXZlbC5wcmVkcmF3QmxvY2tzKSB7XG4gICAgdGhpcy5pc1ByZWRyYXdpbmdfID0gdHJ1ZTtcbiAgICB0aGlzLmRyYXdCbG9ja3NPbkNhbnZhcyh0aGlzLmxldmVsLnByZWRyYXdCbG9ja3MsIHRoaXMuY3R4UHJlZHJhdyk7XG4gICAgdGhpcy5pc1ByZWRyYXdpbmdfID0gZmFsc2U7XG4gIH1cblxuICAvLyBwcmUtbG9hZCBpbWFnZSBmb3IgbGluZSBwYXR0ZXJuIGJsb2NrLiBDcmVhdGluZyB0aGUgaW1hZ2Ugb2JqZWN0IGFuZCBzZXR0aW5nIHNvdXJjZSBkb2Vzbid0IHNlZW0gdG8gYmVcbiAgLy8gZW5vdWdoIGluIHRoaXMgY2FzZSwgc28gd2UncmUgYWN0dWFsbHkgY3JlYXRpbmcgYW5kIHJldXNpbmcgdGhlIG9iamVjdCB3aXRoaW4gdGhlIGRvY3VtZW50IGJvZHkuXG4gIHZhciBpbWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBpbWFnZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZUNvbnRhaW5lcik7XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0dGVybiA9IHRoaXMuc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9uc1tpXVsxXTtcbiAgICBpZiAodGhpcy5za2luW3BhdHRlcm5dKSB7XG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWcuc3JjID0gdGhpcy5za2luW3BhdHRlcm5dO1xuICAgICAgdGhpcy5sb2FkZWRQYXRoUGF0dGVybnNbcGF0dGVybl0gPSBpbWc7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG59O1xuXG4vKipcbiAqIE9uIHN0YXJ0dXAgZHJhdyB0aGUgZXhwZWN0ZWQgYW5zd2VyIGFuZCBzYXZlIGl0IHRvIHRoZSBhbnN3ZXIgY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICB0aGlzLmRyYXdCbG9ja3NPbkNhbnZhcyh0aGlzLmxldmVsLnNvbHV0aW9uQmxvY2tzLCB0aGlzLmN0eEFuc3dlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kcmF3TG9nT25DYW52YXModGhpcy5sZXZlbC5hbnN3ZXIsIHRoaXMuY3R4QW5zd2VyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBhIHNldCBvZiBjb21tYW5kcyBhbmQgYSBjYW52YXMsIGRyYXdzIHRoZSBjb21tYW5kcyBvbnRvIHRoZSBjYW52YXNcbiAqIGNvbXBvc2l0ZWQgb3ZlciB0aGUgc2NyYXRjaCBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0xvZ09uQ2FudmFzID0gZnVuY3Rpb24obG9nLCBjYW52YXMpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG4gIHdoaWxlIChsb2cubGVuZ3RoKSB7XG4gICAgdmFyIHR1cGxlID0gbG9nLnNoaWZ0KCk7XG4gICAgdGhpcy5zdGVwKHR1cGxlWzBdLCB0dXBsZS5zcGxpY2UoMSksIHtzbW9vdGhBbmltYXRlOiBmYWxzZX0pO1xuICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgfVxuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICBjYW52YXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbn07XG5cbi8qKlxuICogRXZhbHVhdGVzIGJsb2NrcyBvciBjb2RlLCBhbmQgZHJhd3Mgb250byBnaXZlbiBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0Jsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oYmxvY2tzT3JDb2RlLCBjYW52YXMpIHtcbiAgdmFyIGNvZGU7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciBkb21CbG9ja3MgPSBCbG9ja2x5LlhtbC50ZXh0VG9Eb20oYmxvY2tzT3JDb2RlKTtcbiAgICBCbG9ja2x5LlhtbC5kb21Ub0Jsb2NrU3BhY2UoQmxvY2tseS5tYWluQmxvY2tTcGFjZSwgZG9tQmxvY2tzKTtcbiAgICBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICB9IGVsc2Uge1xuICAgIGNvZGUgPSBibG9ja3NPckNvZGU7XG4gIH1cbiAgdGhpcy5ldmFsQ29kZShjb2RlKTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICB9XG4gIHRoaXMuZHJhd0N1cnJlbnRCbG9ja3NPbkNhbnZhcyhjYW52YXMpO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgcmVzdWx0cyBvZiBibG9jayBldmFsdWF0aW9uIChzdG9yZWQgb24gYXBpLmxvZykgb250byB0aGUgZ2l2ZW5cbiAqIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Q3VycmVudEJsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gIHRoaXMuZHJhd0xvZ09uQ2FudmFzKHRoaXMuYXBpLmxvZywgY2FudmFzKTtcbn07XG5cbi8qKlxuICogUGxhY2UgYW4gaW1hZ2UgYXQgdGhlIHNwZWNpZmllZCBjb29yZGluYXRlcy5cbiAqIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU0OTU5NTIuIFRoYW5rcywgUGhyb2d6LlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIFJlbGF0aXZlIHBhdGggdG8gaW1hZ2UuXG4gKiBAcGFyYW0geyFBcnJheX0gcG9zaXRpb24gQW4geC15IHBhaXIuXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9uYWwgc2NhbGUgYXQgd2hpY2ggaW1hZ2UgaXMgZHJhd25cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5wbGFjZUltYWdlID0gZnVuY3Rpb24oZmlsZW5hbWUsIHBvc2l0aW9uLCBzY2FsZSkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5vbmxvYWQgPSBfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgaWYgKHNjYWxlKSB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgaW1nLndpZHRoLFxuICAgICAgICAgIGltZy5oZWlnaHQsIDAsIDAsIGltZy53aWR0aCAqIHNjYWxlLCBpbWcuaGVpZ2h0ICogc2NhbGUpO1xuICAgICAgfSBlbHNlICB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGlzcGxheSgpO1xuICB9LCB0aGlzKTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIGltZy5zcmMgPSB0aGlzLnNraW4uYXNzZXRVcmwoZmlsZW5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGltZy5zcmMgPSB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS8nICsgZmlsZW5hbWUpO1xuICB9XG59O1xuXG4vKipcbiAqIERyYXcgdGhlIGltYWdlcyBmb3IgdGhpcyBwYWdlIGFuZCBsZXZlbCBvbnRvIHRoaXMuY3R4SW1hZ2VzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLmxldmVsLmltYWdlcykge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGV2ZWwuaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGltYWdlID0gdGhpcy5sZXZlbC5pbWFnZXNbaV07XG4gICAgdGhpcy5wbGFjZUltYWdlKGltYWdlLmZpbGVuYW1lLCBpbWFnZS5wb3NpdGlvbiwgaW1hZ2Uuc2NhbGUpO1xuICB9XG4gIHRoaXMuY3R4SW1hZ2VzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgdGhpcy5jdHhJbWFnZXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICB0aGlzLmN0eEltYWdlcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgaW1hZ2Ugb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkVHVydGxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXZhdGFySW1hZ2Uub25sb2FkID0gXy5iaW5kKHRoaXMuZGlzcGxheSwgdGhpcyk7XG5cbiAgdGhpcy5hdmF0YXJJbWFnZS5zcmMgPSB0aGlzLnNraW4uYXZhdGFyO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDM2O1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAxODtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMTgwO1xuICB9XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0ID0gdGhpcy5hdmF0YXJIZWlnaHQ7XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGggPSB0aGlzLmF2YXRhcldpZHRoO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgYW5pbWF0aW9uIGRlb2NyYXRpb24gb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkRGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uuc3JjID0gdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb247XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0O1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGg7XG4gIH1cbn07XG5cbnZhciB0dXJ0bGVGcmFtZSA9IDA7XG5cblxuLyoqXG4gKiBEcmF3IHRoZSB0dXJ0bGUgaW1hZ2UgYmFzZWQgb24gdGhpcy54LCB0aGlzLnksIGFuZCB0aGlzLmhlYWRpbmcuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd1R1cnRsZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc291cmNlWTtcbiAgLy8gQ29tcHV0ZXMgdGhlIGluZGV4IG9mIHRoZSBpbWFnZSBpbiB0aGUgc3ByaXRlLlxuICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaGVhZGluZyAqIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLyAzNjApO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIHRoZSByb3RhdGlvbnMgaW4gdGhlIHNwcml0ZSBzaGVldCBnbyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgIGluZGV4ID0gdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAtIGluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBpbmRleCA9IChpbmRleCArIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MvMikgJSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzO1xuICB9XG4gIHZhciBzb3VyY2VYID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aCAqIGluZGV4O1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHNvdXJjZVkgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodCAqIHR1cnRsZUZyYW1lO1xuICAgIHR1cnRsZUZyYW1lID0gKHR1cnRsZUZyYW1lICsgMSkgJSB0aGlzLnNraW4udHVydGxlTnVtRnJhbWVzO1xuICB9IGVsc2Uge1xuICAgIHNvdXJjZVkgPSAwO1xuICB9XG4gIHZhciBzb3VyY2VXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBzb3VyY2VIZWlnaHQgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodDtcbiAgdmFyIGRlc3RXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBkZXN0SGVpZ2h0ID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQ7XG4gIHZhciBkZXN0WCA9IHRoaXMueCAtIGRlc3RXaWR0aCAvIDI7XG4gIHZhciBkZXN0WSA9IHRoaXMueSAtIGRlc3RIZWlnaHQgKyA3O1xuXG4gIGlmICh0aGlzLmF2YXRhckltYWdlLndpZHRoID09PSAwIHx8IHRoaXMuYXZhdGFySW1hZ2UuaGVpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNvdXJjZVggPCAwIHx8XG4gICAgICBzb3VyY2VZIDwgMCB8fFxuICAgICAgc291cmNlWCArIHNvdXJjZVdpZHRoICAtMCA+IHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggfHxcbiAgICAgIHNvdXJjZVkgKyBzb3VyY2VIZWlnaHQgPiB0aGlzLmF2YXRhckltYWdlLmhlaWdodClcbiAge1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICAvLyBUT0RPKGJqb3JkYW4pOiBhc2sgQnJlbnQsIHN0YXJ0aW5nIHRvIGZsb29kIGdydW50IG1vY2hhVGVzdCBtZXNzYWdlcyxcbiAgICAgIC8vIGJldHRlciBmaXggaGVyZT9cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd0ltYWdlIGlzIG91dCBvZiBzb3VyY2UgYm91bmRzIVwiKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggIT09IDApIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKFxuICAgICAgdGhpcy5hdmF0YXJJbWFnZSxcbiAgICAgIE1hdGgucm91bmQoc291cmNlWCksIE1hdGgucm91bmQoc291cmNlWSksXG4gICAgICBzb3VyY2VXaWR0aCAtIDAsIHNvdXJjZUhlaWdodCxcbiAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgIGRlc3RXaWR0aCAtIDAsIGRlc3RIZWlnaHQpO1xuICB9XG59O1xuXG4vKipcbiAgKiBUaGlzIGlzIGNhbGxlZCB0d2ljZSwgb25jZSB3aXRoIFwiYmVmb3JlXCIgYW5kIG9uY2Ugd2l0aCBcImFmdGVyXCIsIHJlZmVycmluZyB0byBiZWZvcmUgb3IgYWZ0ZXJcbiAgKiB0aGUgc3ByaXRlIGlzIGRyYXduLiAgRm9yIHNvbWUgYW5nbGVzIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUsIGFuZCBmb3Igc29tZSBhZnRlci5cbiAgKi9cblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKHdoZW4pIHtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHZhciBmcmFtZUluZGV4ID0gKHR1cnRsZUZyYW1lICsgMTApICUgdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb25OdW1GcmFtZXM7XG5cbiAgICB2YXIgYW5nbGVJbmRleCA9IE1hdGguZmxvb3IodGhpcy5oZWFkaW5nICogdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAvIDM2MCk7XG5cbiAgICAvLyB0aGUgcm90YXRpb25zIGluIHRoZSBBbm5hICYgRWxzYSBzcHJpdGUgc2hlZXRzIGdvIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24uXG4gICAgYW5nbGVJbmRleCA9IHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLSBhbmdsZUluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBhbmdsZUluZGV4ID0gKGFuZ2xlSW5kZXggKyB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzLzIpICUgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncztcblxuICAgIGlmIChFTFNBX0RFQ09SQVRJT05fREVUQUlMU1thbmdsZUluZGV4XS53aGVuID09IHdoZW4pIHtcbiAgICAgIHZhciBzb3VyY2VYID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGggKiBmcmFtZUluZGV4O1xuICAgICAgdmFyIHNvdXJjZVkgPSAwO1xuICAgICAgdmFyIHNvdXJjZVdpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGg7XG4gICAgICB2YXIgc291cmNlSGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0O1xuICAgICAgdmFyIGRlc3RXaWR0aCA9IHNvdXJjZVdpZHRoO1xuICAgICAgdmFyIGRlc3RIZWlnaHQgPSBzb3VyY2VIZWlnaHQ7XG4gICAgICB2YXIgZGVzdFggPSB0aGlzLnggLSBkZXN0V2lkdGggLyAyIC0gMTUgLSAxNSArIEVMU0FfREVDT1JBVElPTl9ERVRBSUxTW2FuZ2xlSW5kZXhdLng7XG4gICAgICB2YXIgZGVzdFkgPSB0aGlzLnkgLSBkZXN0SGVpZ2h0IC8gMiAtIDEwMDtcblxuICAgICAgaWYgKHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoICE9PSAwKSB7XG4gICAgICAgIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UoXG4gICAgICAgICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UsXG4gICAgICAgICAgTWF0aC5yb3VuZChzb3VyY2VYKSwgTWF0aC5yb3VuZChzb3VyY2VZKSxcbiAgICAgICAgICBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LFxuICAgICAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgICAgICBkZXN0V2lkdGgsIGRlc3RIZWlnaHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFJlc2V0IHRoZSB0dXJ0bGUgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uLCBjbGVhciB0aGUgZGlzcGxheSwgYW5kIGtpbGwgYW55XG4gKiBwZW5kaW5nIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG4gIC8vIFN0YW5kYXJkIHN0YXJ0aW5nIGxvY2F0aW9uIGFuZCBoZWFkaW5nIG9mIHRoZSB0dXJ0bGUuXG4gIHRoaXMueCA9IENBTlZBU19IRUlHSFQgLyAyO1xuICB0aGlzLnkgPSBDQU5WQVNfV0lEVEggLyAyO1xuICB0aGlzLmhlYWRpbmcgPSB0aGlzLmxldmVsLnN0YXJ0RGlyZWN0aW9uICE9PSB1bmRlZmluZWQgP1xuICAgICAgdGhpcy5sZXZlbC5zdGFydERpcmVjdGlvbiA6IDkwO1xuICB0aGlzLnBlbkRvd25WYWx1ZSA9IHRydWU7XG4gIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gRm9yIHNwZWNpYWwgY2FzZXMsIHVzZSBhIGRpZmZlcmVudCBpbml0aWFsIGxvY2F0aW9uLlxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy54ID0gdGhpcy5sZXZlbC5pbml0aWFsWDtcbiAgfVxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy55ID0gdGhpcy5sZXZlbC5pbml0aWFsWTtcbiAgfVxuICAvLyBDbGVhciB0aGUgZGlzcGxheS5cbiAgdGhpcy5jdHhTY3JhdGNoLmNhbnZhcy53aWR0aCA9IHRoaXMuY3R4U2NyYXRjaC5jYW52YXMud2lkdGg7XG4gIHRoaXMuY3R4UGF0dGVybi5jYW52YXMud2lkdGggPSB0aGlzLmN0eFBhdHRlcm4uY2FudmFzLndpZHRoO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDU7XG4gIH1cblxuICB0aGlzLmN0eFNjcmF0Y2gubGluZUNhcCA9ICdyb3VuZCc7XG4gIHRoaXMuY3R4U2NyYXRjaC5mb250ID0gJ25vcm1hbCAxOHB0IEFyaWFsJztcbiAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgLy8gQ2xlYXIgdGhlIGZlZWRiYWNrLlxuICB0aGlzLmN0eEZlZWRiYWNrLmNsZWFyUmVjdChcbiAgICAgIDAsIDAsIHRoaXMuY3R4RmVlZGJhY2suY2FudmFzLndpZHRoLCB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcy5oZWlnaHQpO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJhbm5hTGluZVwiKTtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJlbHNhTGluZVwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBSZXNldCB0byBlbXB0eSBwYXR0ZXJuXG4gICAgdGhpcy5zZXRQYXR0ZXJuKG51bGwpO1xuICB9XG5cbiAgLy8gS2lsbCBhbnkgdGFzay5cbiAgaWYgKHRoaXMucGlkKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnBpZCk7XG4gIH1cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmRldGFjaCgpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG5cbiAgLy8gU3RvcCB0aGUgbG9vcGluZyBzb3VuZC5cbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgdGhpcy5yZXNldFN0ZXBJbmZvXygpO1xufTtcblxuXG4vKipcbiAqIENvcHkgdGhlIHNjcmF0Y2ggY2FudmFzIHRvIHRoZSBkaXNwbGF5IGNhbnZhcy4gQWRkIGEgdHVydGxlIG1hcmtlci5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZGIG9uIGxpbnV4IHJldGFpbnMgZHJhd2luZyBvZiBwcmV2aW91cyBsb2NhdGlvbiBvZiBhcnRpc3QgdW5sZXNzIHdlIGNsZWFyXG4gIC8vIHRoZSBjYW52YXMgZmlyc3QuXG4gIHZhciBzdHlsZSA9IHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGU7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICB0aGlzLmN0eERpc3BsYXkuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4RGlzcGxheS5jYW52YXMud2lkdGgsXG4gICAgdGhpcy5jdHhEaXNwbGF5LmNhbnZhcy53aWR0aCk7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSBzdHlsZTtcblxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICAvLyBEcmF3IHRoZSBpbWFnZXMgbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4SW1hZ2VzLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgYW5zd2VyIGxheWVyLlxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDAuNDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAwLjE1O1xuICB9XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhBbnN3ZXIuY2FudmFzLCAwLCAwKTtcbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMTtcblxuICAvLyBEcmF3IHRoZSBwcmVkcmF3IGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFByZWRyYXcuY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSBwYXR0ZXJuIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFBhdHRlcm4uY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB1c2VyIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB0dXJ0bGUuXG4gIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICB0aGlzLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uKFwiYmVmb3JlXCIpO1xuICAgIHRoaXMuZHJhd1R1cnRsZSgpO1xuICAgIHRoaXMuZHJhd0RlY29yYXRpb25BbmltYXRpb24oXCJhZnRlclwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5BcnRpc3QucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBUdXJ0bGU6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IHVwIHRoZSBKU0ludGVycHJldGVyIGFuZCBjb25zb2xlTG9nZ2VyIGZvciBlZGl0Q29kZSBsZXZlbHNcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbml0SW50ZXJwcmV0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgc2hvdWxkUnVuQXRNYXhTcGVlZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfSk7XG4gIHRoaXMuSlNJbnRlcnByZXRlci5vbkV4ZWN1dGlvbkVycm9yLnJlZ2lzdGVyKHRoaXMuaGFuZGxlRXhlY3V0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gIHRoaXMuY29uc29sZUxvZ2dlcl8uYXR0YWNoVG8odGhpcy5KU0ludGVycHJldGVyKTtcbiAgdGhpcy5KU0ludGVycHJldGVyLnBhcnNlKHtcbiAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgIGJsb2NrczogZHJvcGxldENvbmZpZy5ibG9ja3MsXG4gICAgYmxvY2tGaWx0ZXI6IHRoaXMubGV2ZWwuZXhlY3V0ZVBhbGV0dGVBcGlzT25seSAmJiB0aGlzLmxldmVsLmNvZGVGdW5jdGlvbnNcbiAgfSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSBhbiBleGVjdXRpb24gZXJyb3IgZnJvbSB0aGUgaW50ZXJwcmV0ZXJcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5sb2coZXJyKTtcblxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogbGluZU51bWJlciB9O1xuXG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuU1lOVEFYX0VSUk9SX0ZBSUw7XG4gIH1cblxuICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hcGkubG9nID0gW107XG5cbiAgLy8gUmVzZXQgdGhlIGdyYXBoaWMuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuaW5pdEludGVycHJldGVyKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIC8vIGFwaS5sb2cgbm93IGNvbnRhaW5zIGEgdHJhbnNjcmlwdCBvZiBhbGwgdGhlIHVzZXIncyBhY3Rpb25zLlxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuICAvLyBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuXG4gIHRoaXMucGlkID0gd2luZG93LnNldFRpbWVvdXQoXy5iaW5kKHRoaXMuYW5pbWF0ZSwgdGhpcyksIDEwMCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgY2FzZTogaWYgd2UgaGF2ZSBhIHR1cm4sIGZvbGxvd2VkIGJ5IGEgbW92ZSBmb3J3YXJkLCB0aGVuIHdlIGNhbiBqdXN0XG4gKiBkbyB0aGUgdHVybiBpbnN0YW50bHkgYW5kIHRoZW4gYmVnaW4gdGhlIG1vdmUgZm9yd2FyZCBpbiB0aGUgc2FtZSBmcmFtZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja2ZvclR1cm5BbmRNb3ZlXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5leHRJc0ZvcndhcmQgPSBmYWxzZTtcblxuICB2YXIgY3VycmVudFR1cGxlID0gdGhpcy5hcGkubG9nWzBdO1xuICB2YXIgY3VycmVudENvbW1hbmQgPSBjdXJyZW50VHVwbGVbMF07XG4gIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFR1cGxlLnNsaWNlKDEpO1xuXG4gIC8vIENoZWNrIGZpcnN0IGZvciBhIHNtYWxsIHR1cm4gbW92ZW1lbnQuXG4gIGlmIChjdXJyZW50Q29tbWFuZCA9PT0gJ1JUJykge1xuICAgIHZhciBjdXJyZW50QW5nbGUgPSBjdXJyZW50VmFsdWVzWzBdO1xuICAgIGlmIChNYXRoLmFicyhjdXJyZW50QW5nbGUpIDw9IDEwKSB7XG4gICAgICAvLyBDaGVjayB0aGF0IG5leHQgY29tbWFuZCBpcyBhIG1vdmUgZm9yd2FyZC5cbiAgICAgIGlmICh0aGlzLmFwaS5sb2cubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgbmV4dFR1cGxlID0gdGhpcy5hcGkubG9nWzFdO1xuICAgICAgICB2YXIgbmV4dENvbW1hbmQgPSBuZXh0VHVwbGVbMF07XG4gICAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gJ0ZEJykge1xuICAgICAgICAgIG5leHRJc0ZvcndhcmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHRJc0ZvcndhcmQ7XG59O1xuXG5cbi8qKlxuICogQXR0ZW1wdCB0byBleGVjdXRlIG9uZSBjb21tYW5kIGZyb20gdGhlIGxvZyBvZiBBUEkgY29tbWFuZHMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZVR1cGxlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXBpLmxvZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZXhlY3V0ZVNlY29uZFR1cGxlO1xuXG4gIGRvIHtcbiAgICAvLyBVbmxlc3Mgc29tZXRoaW5nIHNwZWNpYWwgaGFwcGVucywgd2Ugd2lsbCBqdXN0IGV4ZWN1dGUgYSBzaW5nbGUgdHVwbGUuXG4gICAgZXhlY3V0ZVNlY29uZFR1cGxlID0gZmFsc2U7XG5cbiAgICB2YXIgdHVwbGUgPSB0aGlzLmFwaS5sb2dbMF07XG4gICAgdmFyIGNvbW1hbmQgPSB0dXBsZVswXTtcbiAgICB2YXIgaWQgPSB0dXBsZVt0dXBsZS5sZW5ndGgtMV07XG5cbiAgICB0aGlzLnN0dWRpb0FwcF8uaGlnaGxpZ2h0KFN0cmluZyhpZCkpO1xuXG4gICAgLy8gU2hvdWxkIHdlIGV4ZWN1dGUgYW5vdGhlciB0dXBsZSBpbiB0aGlzIGZyYW1lIG9mIGFuaW1hdGlvbj9cbiAgICBpZiAodGhpcy5za2luLmNvbnNvbGlkYXRlVHVybkFuZE1vdmUgJiYgdGhpcy5jaGVja2ZvclR1cm5BbmRNb3ZlXygpKSB7XG4gICAgICBleGVjdXRlU2Vjb25kVHVwbGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgc21vb3RoIGFuaW1hdGUgZm9yIEFubmEgJiBFbHNhLCBhbmQgb25seSBpZiB0aGVyZSBpcyBub3QgYW5vdGhlciB0dXBsZSB0byBiZSBkb25lLlxuICAgIHZhciB0dXBsZURvbmUgPSB0aGlzLnN0ZXAoY29tbWFuZCwgdHVwbGUuc2xpY2UoMSksIHtzbW9vdGhBbmltYXRlOiB0aGlzLnNraW4uc21vb3RoQW5pbWF0ZSAmJiAhZXhlY3V0ZVNlY29uZFR1cGxlfSk7XG4gICAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgICBpZiAodHVwbGVEb25lKSB7XG4gICAgICB0aGlzLmFwaS5sb2cuc2hpZnQoKTtcbiAgICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgICB9XG4gIH0gd2hpbGUgKGV4ZWN1dGVTZWNvbmRUdXBsZSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogSXRlcmF0ZSB0aHJvdWdoIHRoZSByZWNvcmRlZCBwYXRoIGFuZCBhbmltYXRlIHRoZSB0dXJ0bGUncyBhY3Rpb25zLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBBbGwgdGFza3Mgc2hvdWxkIGJlIGNvbXBsZXRlIG5vdy4gIENsZWFuIHVwIHRoZSBQSUQgbGlzdC5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNjYWxlIHRoZSBzcGVlZCBub24tbGluZWFybHksIHRvIGdpdmUgYmV0dGVyIHByZWNpc2lvbiBhdCB0aGUgZmFzdCBlbmQuXG4gIHZhciBzdGVwU3BlZWQgPSAxMDAwICogTWF0aC5wb3coMSAtIHRoaXMuc3BlZWRTbGlkZXIuZ2V0VmFsdWUoKSwgMikgLyB0aGlzLnNraW4uc3BlZWRNb2RpZmllcjtcblxuICAvLyB3aGVuIHNtb290aEFuaW1hdGUgaXMgdHJ1ZSwgd2UgZGl2aWRlIGxvbmcgc3RlcHMgaW50byBwYXJ0aXRpb25zIG9mIHRoaXNcbiAgLy8gc2l6ZS5cbiAgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPSAoc3RlcFNwZWVkID09PSAwID9cbiAgICBGQVNUX1NNT09USF9BTklNQVRFX1NURVBfU0laRSA6IFNNT09USF9BTklNQVRFX1NURVBfU0laRSk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUgJiZcbiAgICAgIHRoaXMuSlNJbnRlcnByZXRlciAmJlxuICAgICAgdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICAgIFxuICAgIHZhciBwcm9ncmFtRG9uZSA9IGZhbHNlO1xuICAgIHZhciBjb21wbGV0ZWRUdXBsZSA9IGZhbHNlO1xuXG4gICAgZG8ge1xuICAgICAgcHJvZ3JhbURvbmUgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuaXNQcm9ncmFtRG9uZSgpO1xuXG4gICAgICBpZiAoIXByb2dyYW1Eb25lKSB7XG4gICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcblxuICAgICAgICBjb21wbGV0ZWRUdXBsZSA9IHRoaXMuZXhlY3V0ZVR1cGxlXygpO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKCFwcm9ncmFtRG9uZSAmJiAhY29tcGxldGVkVHVwbGUpO1xuXG4gICAgaWYgKCFjb21wbGV0ZWRUdXBsZSkge1xuICAgICAgY29tcGxldGVkVHVwbGUgPSB0aGlzLmV4ZWN1dGVUdXBsZV8oKTtcbiAgICB9XG4gICAgaWYgKHByb2dyYW1Eb25lICYmICFjb21wbGV0ZWRUdXBsZSkge1xuICAgICAgLy8gQWxsIGRvbmU6XG4gICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5waWQgPSB3aW5kb3cuc2V0VGltZW91dChfLmJpbmQodGhpcy5hbmltYXRlLCB0aGlzKSwgc3RlcFNwZWVkKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRpc3RhbmNlKSB7XG4gIHZhciB0dXBsZURvbmUgPSB0cnVlO1xuICB2YXIgc3RlcERpc3RhbmNlQ292ZXJlZCA9IHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZDtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNtb290aEFuaW1hdGUpIHtcbiAgICB2YXIgZnVsbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdmFyIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuXG4gICAgaWYgKGZ1bGxEaXN0YW5jZSA8IDApIHtcbiAgICAgIC8vIEdvaW5nIGJhY2t3YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBzbW9vdGhBbmltYXRlU3RlcFNpemUgPD0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSAtc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkIC09IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgdHVwbGVEb25lID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR29pbmcgZm93YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgKyBzbW9vdGhBbmltYXRlU3RlcFNpemUgPj0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgKz0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICB0dXBsZURvbmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuXG4gIHJldHVybiB7IHR1cGxlRG9uZTogdHVwbGVEb25lLCBkaXN0YW5jZTogZGlzdGFuY2UgfTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBvbmUgc3RlcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIExvZ28tc3R5bGUgY29tbWFuZCAoZS5nLiAnRkQnIG9yICdSVCcpLlxuICogQHBhcmFtIHshQXJyYXl9IHZhbHVlcyBMaXN0IG9mIGFyZ3VtZW50cyBmb3IgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhY3Rpb24gSG93IG11Y2ggb2YgdGhpcyBzdGVwJ3MgZGlzdGFuY2UgZG8gd2UgZHJhdz9cbiAqIEBwYXJhbSB7b2JqZWN0fSBzaW5nbGUgb3B0aW9uIGZvciBub3c6IHNtb290aEFuaW1hdGUgKHRydWUvZmFsc2UpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKGNvbW1hbmQsIHZhbHVlcywgb3B0aW9ucykge1xuICB2YXIgdHVwbGVEb25lID0gdHJ1ZTtcbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGRpc3RhbmNlO1xuICB2YXIgaGVhZGluZztcblxuICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICBjYXNlICdGRCc6ICAvLyBGb3J3YXJkXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5tb3ZlRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0pGJzogIC8vIEp1bXAgZm9yd2FyZFxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuanVtcEZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNVic6ICAvLyBNb3ZlIChkaXJlY3Rpb24pXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIGhlYWRpbmcgPSB2YWx1ZXNbMV07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuc2V0SGVhZGluZ18oaGVhZGluZyk7XG4gICAgICB0aGlzLm1vdmVGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSkQnOiAgLy8gSnVtcCAoZGlyZWN0aW9uKVxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICBoZWFkaW5nID0gdmFsdWVzWzFdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnNldEhlYWRpbmdfKGhlYWRpbmcpO1xuICAgICAgdGhpcy5qdW1wRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1JUJzogIC8vIFJpZ2h0IFR1cm5cbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnR1cm5CeURlZ3JlZXNfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdEUCc6ICAvLyBEcmF3IFByaW50XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gucm90YXRlKDIgKiBNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDM2MCk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFRleHQodmFsdWVzWzBdLCAwLCAwKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHQSc6ICAvLyBHbG9iYWwgQWxwaGFcbiAgICAgIHZhciBhbHBoYSA9IHZhbHVlc1swXTtcbiAgICAgIGFscGhhID0gTWF0aC5tYXgoMCwgYWxwaGEpO1xuICAgICAgYWxwaGEgPSBNYXRoLm1pbigxMDAsIGFscGhhKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5nbG9iYWxBbHBoYSA9IGFscGhhIC8gMTAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnREYnOiAgLy8gRHJhdyBGb250XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZm9udCA9IHZhbHVlc1syXSArICcgJyArIHZhbHVlc1sxXSArICdwdCAnICsgdmFsdWVzWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFUnOiAgLy8gUGVuIFVwXG4gICAgICB0aGlzLnBlbkRvd25WYWx1ZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEQnOiAgLy8gUGVuIERvd25cbiAgICAgIHRoaXMucGVuRG93blZhbHVlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BXJzogIC8vIFBlbiBXaWR0aFxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IHZhbHVlc1swXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BDJzogIC8vIFBlbiBDb2xvdXJcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9IHZhbHVlc1swXTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSB2YWx1ZXNbMF07XG4gICAgICBpZiAodGhpcy5za2luLmlkICE9IFwiYW5uYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImVsc2FcIikge1xuICAgICAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQUyc6ICAvLyBQZW4gc3R5bGUgd2l0aCBpbWFnZVxuICAgICAgaWYgKCF2YWx1ZXNbMF0gfHwgdmFsdWVzWzBdID09ICdERUZBVUxUJykge1xuICAgICAgICAgIHRoaXMuc2V0UGF0dGVybihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0UGF0dGVybih2YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSFQnOiAgLy8gSGlkZSBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1QnOiAgLy8gU2hvdyBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFtcCc6XG4gICAgICB2YXIgaW1nID0gdGhpcy5zdGFtcHNbdmFsdWVzWzBdXTtcbiAgICAgIHZhciB3aWR0aCA9IGltZy53aWR0aCAvIDI7XG4gICAgICB2YXIgaGVpZ2h0ID0gaW1nLmhlaWdodCAvIDI7XG4gICAgICB2YXIgeCA9IHRoaXMueCAtIHdpZHRoIC8gMjtcbiAgICAgIHZhciB5ID0gdGhpcy55IC0gaGVpZ2h0IC8gMjtcbiAgICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdHVwbGVEb25lO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zZXRQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgaWYgKHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuanVtcEZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHRoaXMueCArPSBkaXN0YW5jZSAqIE1hdGguc2luKDIgKiBNYXRoLlBJICogdGhpcy5oZWFkaW5nIC8gMzYwKTtcbiAgdGhpcy55IC09IGRpc3RhbmNlICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiB0aGlzLmhlYWRpbmcgLyAzNjApO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlQnlSZWxhdGl2ZVBvc2l0aW9uXyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueCArPSB4O1xuICB0aGlzLnkgKz0geTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZG90QXRfID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgLy8gV2ViS2l0ICh1bmxpa2UgR2Vja28pIGRyYXdzIG5vdGhpbmcgZm9yIGEgemVyby1sZW5ndGggbGluZSwgc28gZHJhdyBhIHZlcnkgc2hvcnQgbGluZS5cbiAgdmFyIGRvdExpbmVMZW5ndGggPSAwLjE7XG4gIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8oeCArIGRvdExpbmVMZW5ndGgsIHkpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5jaXJjbGVBdF8gPSBmdW5jdGlvbiAoeCwgeSwgcmFkaXVzKSB7XG4gIHRoaXMuY3R4U2NyYXRjaC5hcmMoeCwgeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdUb1R1cnRsZV8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIGlzRG90ID0gKGRpc3RhbmNlID09PSAwKTtcbiAgaWYgKGlzRG90KSB7XG4gICAgdGhpcy5kb3RBdF8odGhpcy54LCB0aGlzLnkpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8odGhpcy54LCB0aGlzLnkpO1xuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnR1cm5CeURlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXNSaWdodCkge1xuICB0aGlzLnNldEhlYWRpbmdfKHRoaXMuaGVhZGluZyArIGRlZ3JlZXNSaWdodCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnNldEhlYWRpbmdfID0gZnVuY3Rpb24gKGhlYWRpbmcpIHtcbiAgaGVhZGluZyA9IHRoaXMuY29uc3RyYWluRGVncmVlc18oaGVhZGluZyk7XG4gIHRoaXMuaGVhZGluZyA9IGhlYWRpbmc7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNvbnN0cmFpbkRlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgZGVncmVlcyAlPSAzNjA7XG4gIGlmIChkZWdyZWVzIDwgMCkge1xuICAgIGRlZ3JlZXMgKz0gMzYwO1xuICB9XG4gIHJldHVybiBkZWdyZWVzO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlRm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgaWYgKCF0aGlzLnBlbkRvd25WYWx1ZSkge1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4pIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZVdpdGhQYXR0ZXJuXyhkaXN0YW5jZSk7XG5cbiAgICAvLyBGcm96ZW4gZ2V0cyBib3RoIGEgcGF0dGVybiBhbmQgYSBsaW5lIG92ZXIgdGhlIHRvcCBvZiBpdC5cbiAgICBpZiAodGhpcy5za2luLmlkICE9IFwiZWxzYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImFubmFcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZHJhd0ZvcndhcmRfKGRpc3RhbmNlKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIGlmICh0aGlzLnNob3VsZERyYXdKb2ludHNfKCkpIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkV2l0aEpvaW50c18oZGlzdGFuY2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lXyhkaXN0YW5jZSk7XG4gIH1cbn07XG5cbi8qKlxuICogRHJhd3MgYSBsaW5lIG9mIGxlbmd0aCBgZGlzdGFuY2VgLCBhZGRpbmcgam9pbnQga25vYnMgYWxvbmcgdGhlIHdheVxuICogQHBhcmFtIGRpc3RhbmNlXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRXaXRoSm9pbnRzXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgcmVtYWluaW5nRGlzdGFuY2UgPSBkaXN0YW5jZTtcblxuICB3aGlsZSAocmVtYWluaW5nRGlzdGFuY2UgPiAwKSB7XG4gICAgdmFyIGVub3VnaEZvckZ1bGxTZWdtZW50ID0gcmVtYWluaW5nRGlzdGFuY2UgPj0gSk9JTlRfU0VHTUVOVF9MRU5HVEg7XG4gICAgdmFyIGN1cnJlbnRTZWdtZW50TGVuZ3RoID0gZW5vdWdoRm9yRnVsbFNlZ21lbnQgPyBKT0lOVF9TRUdNRU5UX0xFTkdUSCA6IHJlbWFpbmluZ0Rpc3RhbmNlO1xuXG4gICAgcmVtYWluaW5nRGlzdGFuY2UgLT0gY3VycmVudFNlZ21lbnRMZW5ndGg7XG5cbiAgICBpZiAoZW5vdWdoRm9yRnVsbFNlZ21lbnQpIHtcbiAgICAgIHRoaXMuZHJhd0pvaW50QXRUdXJ0bGVfKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVfKGN1cnJlbnRTZWdtZW50TGVuZ3RoKTtcblxuICAgIGlmIChlbm91Z2hGb3JGdWxsU2VnbWVudCkge1xuICAgICAgdGhpcy5kcmF3Sm9pbnRBdFR1cnRsZV8oKTtcbiAgICB9XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy5zdGVwU3RhcnRYLCB0aGlzLnN0ZXBTdGFydFkpO1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmRyYXdUb1R1cnRsZV8oZGlzdGFuY2UpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2UoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuZHJhd1RvVHVydGxlXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xuICB9XG5cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lV2l0aFBhdHRlcm5fID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciBpbWc7XG4gIHZhciBzdGFydFg7XG4gIHZhciBzdGFydFk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFBhdHRlcm4ubW92ZVRvKHRoaXMuc3RlcFN0YXJ0WCwgdGhpcy5zdGVwU3RhcnRZKTtcbiAgICBpbWcgPSB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybjtcbiAgICBzdGFydFggPSB0aGlzLnN0ZXBTdGFydFg7XG4gICAgc3RhcnRZID0gdGhpcy5zdGVwU3RhcnRZO1xuXG4gICAgdmFyIGxpbmVEaXN0YW5jZSA9IE1hdGguYWJzKHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCk7XG5cbiAgICB0aGlzLmN0eFBhdHRlcm4uc2F2ZSgpO1xuICAgIHRoaXMuY3R4UGF0dGVybi50cmFuc2xhdGUoc3RhcnRYLCBzdGFydFkpO1xuICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGUgYW5kIHJvdGF0ZSB0aGUgaW1hZ2UuXG4gICAgLy8gTmVlZCB0byBzdWJ0cmFjdCA5MCB0byBhY2NvbW9kYXRlIGRpZmZlcmVuY2UgaW4gY2FudmFzIHZzLiBUdXJ0bGUgZGlyZWN0aW9uXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnJvdGF0ZShNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDE4MCk7XG5cbiAgICB2YXIgY2xpcFNpemU7XG4gICAgaWYgKGxpbmVEaXN0YW5jZSAlIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplID09PSAwKSB7XG4gICAgICBjbGlwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgIH0gZWxzZSBpZiAobGluZURpc3RhbmNlID4gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUpIHtcbiAgICAgIC8vIHRoaXMgaGFwcGVucyB3aGVuIG91ciBsaW5lIHdhcyBub3QgZGl2aXNpYmxlIGJ5IHNtb290aEFuaW1hdGVTdGVwU2l6ZVxuICAgICAgLy8gYW5kIHdlJ3ZlIGhpdCBvdXIgbGFzdCBjaHVua1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2UgJSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2U7XG4gICAgfVxuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIHRoaXMuY3R4UGF0dGVybi5kcmF3SW1hZ2UoaW1nLFxuICAgICAgICAvLyBTdGFydCBwb2ludCBmb3IgY2xpcHBpbmcgaW1hZ2VcbiAgICAgICAgTWF0aC5yb3VuZChsaW5lRGlzdGFuY2UpLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGNsaXBTaXplLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBzb21lIG15c3RlcmlvdXMgaGFuZC10d2Vha2luZyBkb25lIGJ5IEJyZW5kYW5cbiAgICAgICAgTWF0aC5yb3VuZCgodGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkIC0gY2xpcFNpemUgLSAyKSksIE1hdGgucm91bmQoKC0gMTgpKSxcbiAgICAgICAgY2xpcFNpemUsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4UGF0dGVybi5yZXN0b3JlKCk7XG5cbiAgfSBlbHNlIHtcblxuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIGltZyA9IHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuO1xuICAgIHN0YXJ0WCA9IHRoaXMueDtcbiAgICBzdGFydFkgPSB0aGlzLnk7XG5cbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnNhdmUoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gudHJhbnNsYXRlKHN0YXJ0WCwgc3RhcnRZKTtcbiAgICAvLyBpbmNyZW1lbnQgdGhlIGFuZ2xlIGFuZCByb3RhdGUgdGhlIGltYWdlLlxuICAgIC8vIE5lZWQgdG8gc3VidHJhY3QgOTAgdG8gYWNjb21vZGF0ZSBkaWZmZXJlbmNlIGluIGNhbnZhcyB2cy4gVHVydGxlIGRpcmVjdGlvblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yb3RhdGUoTWF0aC5QSSAqICh0aGlzLmhlYWRpbmcgLSA5MCkgLyAxODApO1xuXG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsXG4gICAgICAgIC8vIFN0YXJ0IHBvaW50IGZvciBjbGlwcGluZyBpbWFnZVxuICAgICAgICAwLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGRpc3RhbmNlK2ltZy5oZWlnaHQgLyAyLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBkcmF3IGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBjdHgudHJhbnNsYXRlIHBvaW50IHByZS1yb3RhdGlvblxuICAgICAgICAtaW1nLmhlaWdodCAvIDQsIC1pbWcuaGVpZ2h0IC8gMixcbiAgICAgICAgZGlzdGFuY2UraW1nLmhlaWdodCAvIDIsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2hvdWxkRHJhd0pvaW50c18gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmxldmVsLmlzSzEgJiYgIXRoaXMuaXNQcmVkcmF3aW5nXztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0pvaW50QXRUdXJ0bGVfID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICB0aGlzLmNpcmNsZUF0Xyh0aGlzLngsIHRoaXMueSwgSk9JTlRfUkFESVVTKTtcbiAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB3aGV0aGVyIHRoZSB1c2VyJ3MgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyB0aGF0IGFyZSB3cm9uZy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwZXJtaXR0ZWRFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyBhbGxvd2VkIHRvIGJlIHdyb25nLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbGV2ZWwgaXMgc29sdmVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaXNDb3JyZWN0XyA9IGZ1bmN0aW9uIChwaXhlbEVycm9ycywgcGVybWl0dGVkRXJyb3JzKSB7XG4gIHJldHVybiBwaXhlbEVycm9ycyA8PSBwZXJtaXR0ZWRFcnJvcnM7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmZWVkYmFja0ltYWdlQ2FudmFzO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIEZvciBmcm96ZW4gc2tpbnMsIHNob3cgYmFja2dyb3VuZCBhbmQgY2hhcmFjdGVycyBhbG9uZyB3aXRoIGRyYXdpbmdcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhEaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eFNjcmF0Y2g7XG4gIH1cblxuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ3R1cnRsZScsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5pbXByZXNzaXZlKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiB0dXJ0bGVNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IHR1cnRsZU1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5BcnRpc3QucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLnN0dWRpb0FwcF8ub25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSk7XG4gIHRoaXMuZGlzcGxheUZlZWRiYWNrXygpO1xufTtcblxuLy8gVGhpcyByZW1vdmVzIGxlbmd0aHMgZnJvbSB0aGUgdGV4dCB2ZXJzaW9uIG9mIHRoZSBYTUwgb2YgcHJvZ3JhbXMuXG4vLyBJdCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgdXNlciBwcm9ncmFtIGFuZCBtb2RlbCBzb2x1dGlvbiBhcmVcbi8vIGlkZW50aWNhbCBleGNlcHQgZm9yIGxlbmd0aHMuXG52YXIgcmVtb3ZlSzFMZW5ndGhzID0gZnVuY3Rpb24ocykge1xuICByZXR1cm4gcy5yZXBsYWNlKHJlbW92ZUsxTGVuZ3Rocy5yZWdleCwgJ1wiPicpO1xufTtcblxucmVtb3ZlSzFMZW5ndGhzLnJlZ2V4ID0gL19sZW5ndGhcIj48dGl0bGUgbmFtZT1cImxlbmd0aFwiPi4qPzxcXC90aXRsZT4vO1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIC8vIENvbXBhcmUgdGhlIEFscGhhIChvcGFjaXR5KSBieXRlIG9mIGVhY2ggcGl4ZWwgaW4gdGhlIHVzZXIncyBpbWFnZSBhbmRcbiAgLy8gdGhlIHNhbXBsZSBhbnN3ZXIgaW1hZ2UuXG4gIHZhciB1c2VySW1hZ2UgPVxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmdldEltYWdlRGF0YSgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xuICB2YXIgYW5zd2VySW1hZ2UgPVxuICAgICAgdGhpcy5jdHhBbnN3ZXIuZ2V0SW1hZ2VEYXRhKDAsIDAsIENBTlZBU19XSURUSCwgQ0FOVkFTX0hFSUdIVCk7XG4gIHZhciBsZW4gPSBNYXRoLm1pbih1c2VySW1hZ2UuZGF0YS5sZW5ndGgsIGFuc3dlckltYWdlLmRhdGEubGVuZ3RoKTtcbiAgdmFyIGRlbHRhID0gMDtcbiAgLy8gUGl4ZWxzIGFyZSBpbiBSR0JBIGZvcm1hdC4gIE9ubHkgY2hlY2sgdGhlIEFscGhhIGJ5dGVzLlxuICBmb3IgKHZhciBpID0gMzsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgLy8gQ29weWluZyBhbmQgY29tcG9zaXRpbmcgaW1hZ2VzIGFjcm9zcyBjYW52YXNlcyBzZWVtcyB0byBkaXN0b3J0IHRoZVxuICAgIC8vIGFscGhhLiBVc2UgYSBsYXJnZSBlcnJvciB2YWx1ZSAoMjUwKSB0byBjb21wZW5zYXRlLlxuICAgIGlmIChNYXRoLmFicyh1c2VySW1hZ2UuZGF0YVtpXSAtIGFuc3dlckltYWdlLmRhdGFbaV0pID4gMjUwKSB7XG4gICAgICBkZWx0YSsrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gT3B0aW9uYWxseSBhbGxvdyBzb21lIG51bWJlciBvZiBwaXhlbHMgdG8gYmUgb2ZmLCBkZWZhdWx0IHRvXG4gIC8vIHBpeGVsLXBlcmZlY3Qgc3RyaWN0bmVzc1xuICB2YXIgcGVybWl0dGVkRXJyb3JzID0gbGV2ZWwucGVybWl0dGVkRXJyb3JzIHx8IDA7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gKGxldmVsLmZyZWVQbGF5IHx8IHRoaXMuaXNDb3JyZWN0XyhkZWx0YSwgcGVybWl0dGVkRXJyb3JzKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gSW4gbGV2ZWwgSzEsIGNoZWNrIGlmIG9ubHkgbGVuZ3RocyBkaWZmZXIuXG4gIGlmIChsZXZlbC5pc0sxICYmICFsZXZlbENvbXBsZXRlICYmICF0aGlzLnN0dWRpb0FwcF8uZWRpdENvZGUgJiZcbiAgICAgIGxldmVsLnNvbHV0aW9uQmxvY2tzICYmXG4gICAgICByZW1vdmVLMUxlbmd0aHMocHJvZ3JhbSkgPT09IHJlbW92ZUsxTGVuZ3RocyhsZXZlbC5zb2x1dGlvbkJsb2NrcykpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19FUlJPUjtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0dXJ0bGVNc2cubGVuZ3RoRmVlZGJhY2soKTtcbiAgfVxuXG4gIC8vIEZvciBsZXZlbHMgd2hlcmUgdXNpbmcgdG9vIG1hbnkgYmxvY2tzIHdvdWxkIGFsbG93IHN0dWRlbnRzXG4gIC8vIHRvIG1pc3MgdGhlIHBvaW50LCBjb252ZXJ0IHRoYXQgZmVlZGJhY2sgdG8gYSBmYWlsdXJlLlxuICBpZiAobGV2ZWwuZmFpbEZvclRvb01hbnlCbG9ja3MgJiZcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTDtcblxuICB9IGVsc2UgaWYgKCh0aGlzLnRlc3RSZXN1bHRzID09XG4gICAgICB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHx8XG4gICAgICAodGhpcy50ZXN0UmVzdWx0cyA9PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQUxMX1BBU1MpKSB7XG4gICAgLy8gQ2hlY2sgdGhhdCB0aGV5IGRpZG4ndCB1c2UgYSBjcmF6eSBsYXJnZSByZXBlYXQgdmFsdWUgd2hlbiBkcmF3aW5nIGFcbiAgICAvLyBjaXJjbGUuICBUaGlzIGNvbXBsYWlucyBpZiB0aGUgbGltaXQgZG9lc24ndCBzdGFydCB3aXRoIDMuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgbGV2ZWwgZG9lcyBub3QgdXNlIGNvbG91ciwgc28gbm8gbmVlZCB0byBjaGVjayBmb3IgdGhhdC5cbiAgICBpZiAobGV2ZWwuZmFpbEZvckNpcmNsZVJlcGVhdFZhbHVlICYmIHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICB2YXIgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICAgIGlmIChjb2RlLmluZGV4T2YoJ2NvdW50IDwgMycpID09IC0xKSB7XG4gICAgICAgIHRoaXMudGVzdFJlc3VsdHMgPVxuICAgICAgICAgICAgdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19BQ0NFUFRBQkxFX0ZBSUw7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGNvbW1vbk1zZy50b29NdWNoV29yaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBJZiB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSwgYWx3YXlzIHJldHVybiB0aGUgZnJlZSBwbGF5XG4gIC8vIHJlc3VsdCB0eXBlXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgLy8gUGxheSBzb3VuZFxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPT09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVkgfHxcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAndHVydGxlJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cucGl2b3RhbHRyYWNrZXIuY29tL3N0b3J5L3Nob3cvODQxNzE1NjBcbiAgLy8gTmV2ZXIgc2VuZCB1cCBmcm96ZW4gaW1hZ2VzIGZvciBub3cuXG4gIHZhciBpc0Zyb3plbiA9ICh0aGlzLnNraW4uaWQgPT09ICdhbm5hJyB8fCB0aGlzLnNraW4uaWQgPT09ICdlbHNhJyk7XG5cbiAgLy8gR2V0IHRoZSBjYW52YXMgZGF0YSBmb3IgZmVlZGJhY2suXG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCAmJlxuICAgICFpc0Zyb3plbiAmJiAobGV2ZWwuZnJlZVBsYXkgfHwgbGV2ZWwuaW1wcmVzc2l2ZSkpIHtcbiAgICByZXBvcnREYXRhLmltYWdlID0gdGhpcy5nZXRGZWVkYmFja0ltYWdlXygpO1xuICB9XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmdldEZlZWRiYWNrSW1hZ2VfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmZWVkYmFja0ltYWdlQ2FudmFzO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eERpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4U2NyYXRjaDtcbiAgfVxuXG4gIC8vIENvcHkgdGhlIHVzZXIgbGF5ZXJcbiAgdGhpcy5jdHhGZWVkYmFjay5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIHRoaXMuY3R4RmVlZGJhY2suZHJhd0ltYWdlKGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLCAwLCAwLCAxNTQsIDE1NCk7XG4gIHZhciBmZWVkYmFja0NhbnZhcyA9IHRoaXMuY3R4RmVlZGJhY2suY2FudmFzO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgZmVlZGJhY2tDYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLnNwbGl0KCcsJylbMV0pO1xufTtcblxuLy8gSGVscGVyIGZvciBjcmVhdGluZyBjYW52YXMgZWxlbWVudHMuXG5BcnRpc3QucHJvdG90eXBlLmNyZWF0ZUNhbnZhc18gPSBmdW5jdGlvbiAoaWQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGVsLmlkID0gaWQ7XG4gIGVsLndpZHRoID0gd2lkdGg7XG4gIGVsLmhlaWdodCA9IGhlaWdodDtcbiAgcmV0dXJuIGVsO1xufTtcblxuLyoqXG4qIFdoZW4gc21vb3RoIGFuaW1hdGUgaXMgdHJ1ZSwgc3RlcHMgY2FuIGJlIGJyb2tlbiB1cCBpbnRvIG11bHRpcGxlIGFuaW1hdGlvbnMuXG4qIEF0IHRoZSBlbmQgb2YgZWFjaCBzdGVwLCB3ZSB3YW50IHRvIHJlc2V0IGFueSBpbmNyZW1lbnRhbCBpbmZvcm1hdGlvbiwgd2hpY2hcbiogaXMgd2hhdCB0aGlzIGRvZXMuXG4qL1xuQXJ0aXN0LnByb3RvdHlwZS5yZXNldFN0ZXBJbmZvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdGVwU3RhcnRYID0gdGhpcy54O1xuICB0aGlzLnN0ZXBTdGFydFkgPSB0aGlzLnk7XG4gIHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCA9IDA7XG59O1xuIiwidmFyIGxldmVsQmFzZSA9IHJlcXVpcmUoJy4uL2xldmVsX2Jhc2UnKTtcbnZhciBDb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJyk7XG52YXIgYW5zd2VyID0gcmVxdWlyZSgnLi9hbnN3ZXJzJykuYW5zd2VyO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vLyBBbiBlYXJseSBoYWNrIGludHJvZHVjZWQgc29tZSBsZXZlbGJ1aWxkZXIgbGV2ZWxzIGFzIHBhZ2UgNSwgbGV2ZWwgNy4gTG9uZ1xuLy8gdGVybSB3ZSBjYW4gcHJvYmFibHkgZG8gc29tZXRoaW5nIG11Y2ggY2xlYW5lciwgYnV0IGZvciBub3cgSSdtIGNhbGxpbmdcbi8vIG91dCB0aGF0IHRoaXMgbGV2ZWwgaXMgc3BlY2lhbCAob24gcGFnZSA1KS5cbnZhciBMRVZFTEJVSUxERVJfTEVWRUwgPSA3O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHRvb2xib3guXG52YXIgdG9vbGJveCA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3Rvb2xib3gueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgc3RhcnRCbG9ja3MuXG52YXIgc3RhcnRCbG9ja3MgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi9zdGFydEJsb2Nrcy54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxudmFyIHJlcSA9IHJlcXVpcmUoJy4vcmVxdWlyZWRCbG9ja3MnKTtcbnZhciBtYWtlTWF0aE51bWJlciA9IHJlcS5tYWtlTWF0aE51bWJlcjtcbnZhciBzaW1wbGVCbG9jayA9IHJlcS5zaW1wbGVCbG9jaztcbnZhciByZXBlYXQgPSByZXEucmVwZWF0O1xudmFyIGRyYXdBU3F1YXJlID0gcmVxLmRyYXdBU3F1YXJlO1xudmFyIGRyYXdBU25vd21hbiA9IHJlcS5kcmF3QVNub3dtYW47XG52YXIgTU9WRV9GT1JXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0ZPUldBUkRfSU5MSU5FO1xudmFyIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORTtcbnZhciBtb3ZlRm9yd2FyZElubGluZSA9IHJlcS5tb3ZlRm9yd2FyZElubGluZTtcbnZhciBNT1ZFX0JBQ0tXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0JBQ0tXQVJEX0lOTElORTtcbnZhciB0dXJuTGVmdFJlc3RyaWN0ZWQgPSByZXEudHVybkxlZnRSZXN0cmljdGVkO1xudmFyIHR1cm5SaWdodFJlc3RyaWN0ZWQgPSByZXEudHVyblJpZ2h0UmVzdHJpY3RlZDtcbnZhciB0dXJuUmlnaHRCeUNvbnN0YW50ID0gcmVxLnR1cm5SaWdodEJ5Q29uc3RhbnQ7XG52YXIgdHVyblJpZ2h0ID0gcmVxLnR1cm5SaWdodDtcbnZhciB0dXJuTGVmdCA9IHJlcS50dXJuTGVmdDtcbnZhciBtb3ZlID0gcmVxLm1vdmU7XG52YXIgZHJhd1R1cm5SZXN0cmljdGVkID0gcmVxLmRyYXdUdXJuUmVzdHJpY3RlZDtcbnZhciBkcmF3VHVybiA9IHJlcS5kcmF3VHVybjtcbnZhciBTRVRfQ09MT1VSX1BJQ0tFUiA9IHJlcS5TRVRfQ09MT1VSX1BJQ0tFUjtcbnZhciBTRVRfQ09MT1VSX1JBTkRPTSA9IHJlcS5TRVRfQ09MT1VSX1JBTkRPTTtcbnZhciBkZWZpbmVXaXRoQXJnID0gcmVxLmRlZmluZVdpdGhBcmc7XG5cbnZhciBibG9ja3MgPSB7XG4gIFNJTVBMRV9NT1ZFX1VQOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV91cCcpLFxuICBTSU1QTEVfTU9WRV9ET1dOOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9kb3duJyksXG4gIFNJTVBMRV9NT1ZFX0xFRlQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2xlZnQnKSxcbiAgU0lNUExFX01PVkVfUklHSFQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3JpZ2h0JyksXG4gIFNJTVBMRV9KVU1QX1VQOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF91cCcpLFxuICBTSU1QTEVfSlVNUF9ET1dOOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9kb3duJyksXG4gIFNJTVBMRV9KVU1QX0xFRlQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX2xlZnQnKSxcbiAgU0lNUExFX0pVTVBfUklHSFQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX3JpZ2h0JyksXG4gIFNJTVBMRV9NT1ZFX1VQX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfdXBfbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX0RPV05fTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9kb3duX2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9MRUZUX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfbGVmdF9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfUklHSFRfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9yaWdodF9sZW5ndGgnKSxcbiAgc2ltcGxlTW92ZUJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX01PVkVfVVAgK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9ET1dOICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfTEVGVCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX1JJR0hUO1xuICB9LFxuICBzaW1wbGVKdW1wQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfSlVNUF9VUCArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX0RPV04gK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9MRUZUICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfUklHSFQ7XG4gIH0sXG4gIHNpbXBsZU1vdmVMZW5ndGhCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9NT1ZFX1VQX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0RPV05fTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfTEVGVF9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9SSUdIVF9MRU5HVEg7XG4gIH1cbn07XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgbGV2ZWwtc3BlY2lmaWMgcmVxdWlyZW1lbnRzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIExldmVsIDE6IEVsLlxuICAnMV8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDEpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW01PVkVfRk9SV0FSRF9JTkxJTkVdLCBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogU3F1YXJlICh3aXRob3V0IHJlcGVhdCkuXG4gICcxXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMiksXG4gICAgaWRlYWw6IDExLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogU3F1YXJlICh3aXRoIHJlcGVhdCkuXG4gICcxXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMyksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV0sXG4gICAgICBbcmVwZWF0KDQpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDQ6IFRyaWFuZ2xlLlxuICAnMV80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDQpLFxuICAgIGlkZWFsOiA2LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDU6IEVudmVsb3BlLlxuICAnMV81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDUpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDEyMCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNjogdHJpYW5nbGUgYW5kIHNxdWFyZS5cbiAgJzFfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA2KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCgxMjApLCB0dXJuTGVmdFJlc3RyaWN0ZWQoMTIwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORSwgTU9WRV9CQUNLV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNzogZ2xhc3Nlcy5cbiAgJzFfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA3KSxcbiAgICBpZGVhbDogMTMsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3VHVyblJlc3RyaWN0ZWQoOTApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW01PVkVfQkFDS1dBUkRfSU5MSU5FLCBNT1ZFX0ZPUldBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDg6IHNwaWtlcy5cbiAgJzFfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA4KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1tyZXBlYXQoOCldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgOTogY2lyY2xlLlxuICAnMV85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDkpLFxuICAgIGlkZWFsOiA2LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBwZXJtaXR0ZWRFcnJvcnM6IDEwLFxuICAgIGZhaWxGb3JDaXJjbGVSZXBlYXRWYWx1ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzFfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMTApLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAxMCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiB0cnVlXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgMi5cbiAgLy8gTGV2ZWwgMTogU3F1YXJlLlxuICAnMl8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDEpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICAgICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuUmlnaHQnfSxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoOTApfVxuICAgICAgfV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyBtb3ZlIGZvcndhcmQgb3IgYmFja3dhcmQsIGJ1dCBzaG93IGZvcndhcmQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfbW92ZScsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDEwMCl9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IFNtYWxsIGdyZWVuIHNxdWFyZS5cbiAgJzJfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAyKSxcbiAgICBpZGVhbDogNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU3F1YXJlKCc/PycpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IFRocmVlIHNxdWFyZXMuXG4gICcyXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMyksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW2RyYXdBU3F1YXJlKDEwMCldLFxuICAgICAgW2RyYXdUdXJuKCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNDogMzYgc3F1YXJlcy5cbiAgJzJfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA0KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA0KSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA1OiBEaWZmZXJlbnQgc2l6ZSBzcXVhcmVzLlxuICAnMl81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDUpLFxuICAgIGlkZWFsOiAxMSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU3F1YXJlKCc/PycpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDY6IEZvci1sb29wIHNxdWFyZXMuXG4gICcyXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNiksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNiksXG4gICAgLy8gVGhpcyBpcyBub3QgZGlzcGxheWVkIHByb3Blcmx5LlxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA3OiBCb3h5IHNwaXJhbC5cbiAgJzJfNyc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNyksXG4gICAgaWRlYWw6IDksXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtzaW1wbGVCbG9jaygnY29udHJvbHNfZm9yX2NvdW50ZXInKV0sXG4gICAgICBbbW92ZSgnPz8nKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIFByZXAgZm9yIExldmVsIDg6IFR3byBzbm93bWVuLlxuICAnMl83XzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNy41KSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiA1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDcuNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oMjUwKV0sXG4gICAgICBbZHJhd0FTbm93bWFuKDEwMCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA4OiBUaHJlZSBzbm93bWVuLlxuICAnMl84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDgpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaWRlYWw6IDEyLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKDE1MCldLFxuICAgICAgW3R1cm5SaWdodCg5MCldLFxuICAgICAgW3R1cm5MZWZ0KDkwKV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAnanVtcCcsXG4gICAgICAgIHR5cGU6ICdqdW1wJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoMTAwKX1cbiAgICAgIH1dLFxuICAgICAgW3NpbXBsZUJsb2NrKCdqdW1wJyldLFxuICAgICAgW3JlcGVhdCgzKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDk6IFNub3dtYW4gZmFtaWx5LlxuICAnMl85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDkpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaWRlYWw6IDE1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKCc/PycpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygnY29udHJvbHNfZm9yX2NvdW50ZXInKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXSxcbiAgICAgIFt0dXJuTGVmdCg5MCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ2p1bXAnLFxuICAgICAgICB0eXBlOiAnanVtcCcsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDYwKX1cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzJfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMTApLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAxMClcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSAzLlxuICAvLyBMZXZlbCAxOiBDYWxsICdkcmF3IGEgc3F1YXJlJy5cbiAgJzNfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAxKSxcbiAgICBpZGVhbDogMTQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogQ3JlYXRlIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICczXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMiksXG4gICAgaWRlYWw6IDE0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgxMjApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBGZW5jZSB0aGUgYW5pbWFscy5cbiAgJzNfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAzKSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyMCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDI0N11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCA0N11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTgyLCAxNDddXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA0OiBIb3VzZSB0aGUgbGlvbi5cbiAgJzNfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA0KSxcbiAgICBpZGVhbDogMTksXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDMwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE5NSwgOTddXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA1OiBDcmVhdGUgXCJkcmF3IGEgaG91c2VcIi5cbiAgJzNfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA1KSxcbiAgICBpZGVhbDogMjEsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuZGVmaW5lKG1zZy5kcmF3QUhvdXNlKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDMwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QUhvdXNlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgOTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzIyMiwgOTBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA2OiBBZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICczXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNiksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjMsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTg1LCAxMDBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3NSwgMjQ4XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNzogQWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSBob3VzZVwiLlxuICAnM183Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDcpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDI0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBU3F1YXJlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyMDUsIDIyMF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDg6IERyYXcgaG91c2VzLlxuICAnM184Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA4KSxcbiAgICBpbml0aWFsWDogMjAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogNDAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgOCksXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE2LCAxNzBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNSwgMjUwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzEyNywgMjIwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyNTUsIDI1MF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDk6IERyYXcgaG91c2VzIHdpdGggZm9yIGxvb3AuXG4gICczXzknOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDkpLFxuICAgIGluaXRpYWxYOiAyMCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiA0MCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVNxdWFyZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWy0xMCwgMjcwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFs1MywgMjUwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3NSwgMjIwXVxuICAgICAgfVxuICAgIF0sXG4gICAgZmFpbEZvclRvb01hbnlCbG9ja3M6IHRydWUsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICczXzEwJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAxMCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDEwKVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDQuXG4gIC8vIExldmVsIDE6IE9uZSB0cmlhbmdsZS5cbiAgJzRfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50JztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgfSxcbiAgLy8gTGV2ZWwgMjogVHdvIHRyaWFuZ2xlcy5cbiAgJzRfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAyKSxcbiAgICBpZGVhbDogMTIsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjVcbiAgfSxcbiAgLy8gTGV2ZWwgMzogRm91ciB0cmlhbmdsZXMgdXNpbmcgcmVwZWF0LlxuICAnNF8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDMpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjdcbiAgfSxcbiAgLy8gTGV2ZWwgNDogVGVuIHRyaWFuZ2xlcyB3aXRoIG1pc3NpbmcgcmVwZWF0IG51bWJlci5cbiAgJzRfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA0KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC43LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNTogMzYgdHJpYW5nbGVzIHdpdGggbWlzc2luZyBhbmdsZSBudW1iZXIuXG4gICc0XzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNSksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA2OiAxIHNxdWFyZS5cbiAgJzRfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA2KSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW21vdmVGb3J3YXJkSW5saW5lKDIwKV0sXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICd0dXJuUmlnaHQnLFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICAgIHBlcm1pdHRlZEVycm9yczogMTAsXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNzogU3F1YXJlIExhZGRlci5cbiAgJzRfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA3KSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbW92ZUZvcndhcmRJbmxpbmUoMjApXSxcbiAgICAgIFtyZXBlYXQoMTApXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuN1xuICB9LFxuICAvLyBMZXZlbCA4OiBMYWRkZXIgc3F1YXJlLlxuICAnNF84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDgpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCA5OiBMYWRkZXIgc3F1YXJlIHdpdGggYSBkaWZmZXJlbnQgYW5nbGUuXG4gICc0XzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgOSksXG4gICAgaW5pdGlhbFg6IDE1MCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDMzMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDEwOiBMYWRkZXIgcG9seWdvbi5cbiAgJzRfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMTApLFxuICAgIGluaXRpYWxYOiA3NSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMTApLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCAxMTogcGxheWdyb3VuZC5cbiAgJzRfMTEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMTEpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxYOiA3NSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMTEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxMSksXG4gICAgcmVxdWlyZWRCbG9ja3MgOiBbXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gICB9LFxuXG4gIC8vIEZvcm1lcmx5IFBhZ2UgNS5cbiAgLy8gTGV2ZWwgMTogcGxheWdyb3VuZC5cbiAgJzVfMSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMSksXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCAyOiBwbGF5Z3JvdW5kLlxuICAnNV8yJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAyKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAyKSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDM6IHBsYXlncm91bmQuXG4gICc1XzMnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDMpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDMpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNDogcGxheWdyb3VuZC5cbiAgJzVfNCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNCksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA1OiBwbGF5Z3JvdW5kLlxuICAnNV81Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA1KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA1KSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDY6IHBsYXlncm91bmQuXG4gICc1XzYnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDYpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNiksXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBUaGUgbGV2ZWwgZm9yIGJ1aWxkaW5nIG5ldyBsZXZlbHMuXG4gICdidWlsZGVyJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIExFVkVMQlVJTERFUl9MRVZFTCksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gVGhlIGRlZmF1bHQgbGV2ZWwgbmV3bHkgY3JlYXRlZCBsZXZlbHMgdXNlLlxuICAnY3VzdG9tJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCBMRVZFTEJVSUxERVJfTEVWRUwpLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gICdrMV9kZW1vJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICB0b29sYm94OiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVNb3ZlQmxvY2tzKCkgK1xuICAgICAgICBibG9ja3Muc2ltcGxlSnVtcEJsb2NrcygpICtcbiAgICAgICAgYmxvY2tzLnNpbXBsZU1vdmVMZW5ndGhCbG9ja3MoKSArXG4gICAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2NvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkJykgK1xuICAgICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdkcmF3X2NvbG91cl9zaW1wbGUnKVxuICAgICAgKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9XG59O1xuXG5sZXZlbHMuZWNfMV8xID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8xJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJtb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8yID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8yJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJwZW5Db2xvdXIoJyNmZjAwMDAnKTtcXG5tb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8zID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8zJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xcbiAgX19cXG59XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzQgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzQnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcImZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XFxuICBwZW5Db2xvdXIoJyNmZjAwMDAnKTtcXG59XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzEwID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8xMCddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ3BlbldpZHRoJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJtb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuLy8gQW4gZWFybHkgaGFjayBpbnRyb2R1Y2VkIHNvbWUgbGV2ZWxidWlsZGVyIGxldmVscyBhcyBwYWdlIDUsIGxldmVsIDcuIExvbmdcbi8vIHRlcm0gd2UgY2FuIHByb2JhYmx5IGRvIHNvbWV0aGluZyBtdWNoIGNsZWFuZXIsIGJ1dCBmb3Igbm93IEknbSBjYWxsaW5nXG4vLyBvdXQgdGhhdCB0aGlzIGxldmVsIGlzIHNwZWNpYWwgKG9uIHBhZ2UgNSkuXG52YXIgTEVWRUxCVUlMREVSX0xFVkVMID0gNztcblxuLypcblRPT0xCT1guXG5cblBBR0UgMVxuPT09PT09XG5XaXRoaW4gdGhpcyBwYWdlLCBibG9ja3MgYXJlIG9ubHkgYWRkZWQsIG5ldmVyIHRha2VuIGF3YXkuXG5cbkxldmVsIDEgW2VsXTogQWRkcyBkcmF3X21vdmVfYnlfY29uc3RhbnQgYW5kIGRyYXdfdHVybl9ieV9jb25zdGFudC5cbkxldmVsIDIgW2NvbG91cmVkIHNxdWFyZV06IEFkZHMgZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyLlxubGV2ZWwgMyBbc3F1YXJlIGluIHRocmVlIGJsb2Nrc106IEFkZHMgY29udHJvbHNfcmVwZWF0LlxubGV2ZWwgNCBbdHJpYW5nbGVdIEFkZHMgZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcmFuZG9tLlxuTGV2ZWwgNSBbb3ZlcmxhcHBpbmcgc3F1YXJlIGFuZCB0cmlhbmdsZSAoc2lkZXdheXMgZW52ZWxvcGUpXVxuTGV2ZWwgNiBbZW52ZWxvcGVdXG5MZXZlbCA3IFtnbGFzc2VzXVxuTGV2ZWwgOCBbc3Bpa2VzXVxuTGV2ZWwgOSBbY2lyY2xlXVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV06IGRyYXdfd2lkdGhfaW5saW5lXG5cblBBR0UgMlxuPT09PT09XG5DYXRlZ29yaWVzIGFyZSBpbnRyb2R1Y2VkLCB3aXRoIGNvbnRlbnRzIG9mOlxuLSBBY3Rpb25zXG4gIC0gZHJhd19tb3ZlIHdpdGggbWF0aF9udW1iZXJcbiAgLSBkcmF3X3R1cm4gd2l0aCBtYXRoX251bWJlclxuLSBDb2xvclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9waWNrZXJcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcmFuZG9tXG4tIEZ1bmN0aW9ucyAoYWRkZWQgYXQgbGV2ZWwgMilcbiAgLSBbY2FsbF0gZHJhdyBhIHNxdWFyZVxuICAtIFtjYWxsXSBkcmF3IGEgc25vd2JhbGwgKGFkZGVkIGF0IGxldmVsIDkpXG4tIExvb3BzXG4gIC0gY29udHJvbHNfcmVwZWF0XG4gIC0gY29udHJvbHNfZm9yIChhZGRlZCBhdCBsZXZlbCA2KVxuLSBNYXRoXG4gIC0gbWF0aF9udW1iZXJcbi0gVmFyaWFibGVzIChhZGRlZCBhdCBsZXZlbCA2KVxuICAtIGdldCBjb3VudGVyIChhZGRlZCBhdCBsZXZlbCA5KVxuICAtIGdldCBoZWlnaHQgKGFkZGVkIGF0IGxldmVsIDcpXG4gIC0gZ2V0IGxlbmd0aCAobGV2ZWxzIDYgYW5kIDEwKVxuTGV2ZWwgMSBbc3F1YXJlXVxuTGV2ZWwgMiBbc3F1YXJlIGJ5IGZ1bmN0aW9uIGNhbGxdOiBhZGQgXCJkcmF3IGEgc3F1YXJlXCJcbkxldmVsIDMgWzMgc3F1YXJlc11cbkxldmVsIDQgWzM2IHNxdWFyZXNdXG5MZXZlbCA1IFtuZXN0ZWQgc3F1YXJlcyB3aXRob3V0IGNvbnRyb2xzX2Zvcl1cbkxldmVsIDYgW25lc3RlZCBzcXVhcmVzIHdpdGggY29udHJvbHNfZm9yXVxuTGV2ZWwgNyBbbWluaS1zcGlyYWxdXG5MZXZlbCA4IFszIHNub3dtZW5dOiBhZGQgXCJkcmF3IGEgc25vd21hblwiXG5MZXZlbCA5IFtzbm93bWFuIGZhbWlseV1cbkxldmVsIDEwIFtmcmVlIHBsYXldXG5cblBBR0UgM1xuPT09PT09XG5DYXRlZ29yaWVzIGFyZSB1c2VkLCB3aXRoIGNvbnRlbnRzIG9mOlxuLSBBY3Rpb25zXG4gIC0gZHJhd19tb3ZlIHdpdGggbWF0aF9udW1iZXJcbiAgLSBkcmF3X3R1cm4gd2l0aCBtYXRoX251bWJlclxuLSBDb2xvclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9waWNrZXJcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcmFuZG9tXG4tIEZ1bmN0aW9ucyAoUmVwbGFjZWQgd2l0aCBjdXN0b20gY2F0ZWdvcnkgYXQgbGV2ZWwgMilcbiAgLSBbY2FsbF0gZHJhdyBhIGNpcmNsZVxuICAtIFtjYWxsXSBkcmF3IGEgc3F1YXJlXG4tIExvb3BzXG4gIC0gY29udHJvbHNfZm9yXG4gIC0gY29udHJvbHNfcmVwZWF0XG4tIE1hdGhcbiAgLSBtYXRoX251bWJlclxuLSBWYXJpYWJsZXMgKGFkZGVkIGF0IGxldmVsIDYpXG4gIC0gZ2V0IGNvdW50ZXJcblZhcmlhYmxlcyBhbmQgZnVuY3Rpb25zIGFyZSBtYW51YWxseSBhZGRlZCB1bnRpbCBMZXZlbHMgNyBhbmQgOCxcbndoZW4gdGhlIGN1c3RvbSBjYXRlZ29yaWVzIGFyZSB1c2VkXG5MZXZlbCAxIFtjYWxsIFwiZHJhdyBhIHNxdWFyZVwiXVxuTGV2ZWwgMiBbY3JlYXRlIGFuZCBjYWxsIFwiZHJhdyBhIHRyaWFuZ2xlXCJdXG5MZXZlbCAzIFt1c2UgXCJkcmF3IGEgc3F1YXJlXCIgYW5kIFwiZHJhdyBhIHRyaWFuZ2xlXCIgdG8gZmVuY2UgYW5pbWFsc11cbkxldmVsIDQgW2RyYXcgYSBob3VzZV1cbkxldmVsIDUgW2NyZWF0ZSBhbmQgY2FsbCBcImRyYXcgYSBob3VzZVwiXVxuTGV2ZWwgNiBbYWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSB0cmlhbmdsZVwiXVxuTGV2ZWwgNyBbYWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSBob3VzZVwiXVxuTGV2ZWwgOCBbbW9kaWZ5IGVuZCBsb2NhdGlvbiBvZiBcImNyZWF0ZSBhIGhvdXNlXCJdXG5MZXZlbCA5IFtjYWxsIFwiZHJhdyBhIGhvdXNlXCIgd2l0aCBmb3IgbG9vcF1cbkxldmVsIDEwIFtmcmVlIHBsYXldXG5cbiovOyBidWYucHVzaCgnPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICAnKTs5MjsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50Jyk7OTM7IGlmIChsZXZlbCA8PSA4KSB7IDsgYnVmLnB1c2goJ19yZXN0cmljdGVkJyk7OTM7IH0gOyBidWYucHVzaCgnXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7OTY7IGlmIChsZXZlbCA+PSAyKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTAxOyB9OyBidWYucHVzaCgnICAgICcpOzEwMTsgaWYgKGxldmVsID49IDQpIHsgLyogT3V0IG9mIG51bWVyaWMgb3JkZXIgdG8gbWFrZSBjb2xvdXIgYmxvY2tzIGFkamFjZW50LiAqLzsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwNjsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDY7IGlmIChsZXZlbCA+PSAzKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDk7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTA5OyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCIgeD1cIjE1OFwiIHk9XCI2N1wiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzExMjsgfTsgYnVmLnB1c2goJyAgJyk7MTEyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gMiB8fCBwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTEyOyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgaWQ9XCJhY3Rpb25zXCIgbmFtZT1cIicsIGVzY2FwZSgoMTEyLCAgbXNnLmNhdFR1cnRsZSgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMjA7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJqdW1wXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMjc7IH07IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTM0OyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMzc7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTM4OyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTM4LCAgbXNnLmNhdENvbG91cigpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxNTA7IC8vIEZ1bmN0aW9ucyBkaWZmZXIgZGVwZW5kaW5nIG9uIHBhZ2UgYW5kIGxldmVsLlxuOyBidWYucHVzaCgnICAgICcpOzE1MDsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSAyKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE1MCwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICcpOzE1ODsgaWYgKGxldmVsID49IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICcpOzE2NTsgfTsgYnVmLnB1c2goJyAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE2NjsgfSBlbHNlIGlmIChwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgICAnKTsxNjY7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgICAgICAnKTsxNjY7IC8vIERvbid0IHVzZSBjdXN0b20gY2F0ZWdvcnkgeWV0LCBzaW5jZSBpdCBhbGxvd3MgZnVuY3Rpb24gZGVmaW5pdGlvbi5cbjsgYnVmLnB1c2goJyAgICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE2NiwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxNjgsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTcxLCAgbXNnLmRyYXdBU3F1YXJlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9jYXRlZ29yeT5cXG4gICAgICAnKTsxNzQ7IH0gZWxzZSB7IDsgYnVmLnB1c2goJ1xcbiAgICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE3NSwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgICAgICcpOzE3NjsgfTsgYnVmLnB1c2goJyAgICAnKTsxNzY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTc2OyAvLyBDb250cm9sOiBjb250cm9sc19mb3JfY291bnRlciAoZnJvbSBwYWdlIDIsIGxldmVsIDYpIGFuZCByZXBlYXQuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE3NiwgIG1zZy5jYXRDb250cm9sKCkgKSksICdcIj5cXG4gICAgICAnKTsxNzc7IGlmICgocGFnZSA9PSAyICYmIGxldmVsID49IDYpIHx8IChwYWdlID09IDMgJiYgbGV2ZWwgPj0gOSkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxOTQ7IH07IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE5ODsgLy8gTWF0aDogSnVzdCBudW1iZXIgYmxvY2tzIHVudGlsIGZpbmFsIGxldmVsLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxOTgsICBtc2cuY2F0TWF0aCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjwvYmxvY2s+XFxuICAgICAgJyk7MjAwOyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2ludFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2Zsb2F0XCI+PC9ibG9jaz5cXG4gICAgJyk7MjE0OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIxNTsgLy8gVmFyaWFibGVzIGRlcGVuZHMgb24gcGFnZSBhbmQgbGV2ZWwsIGFsdGhvdWdoIHdlIG5ldmVyIHVzZSB0aGUgY3VzdG9tIGNhdGVnb3J5XG47IGJ1Zi5wdXNoKCcgICAgJyk7MjE1OyAvLyBiZWNhdXNlIHdlIHdhbnQgdG8gb2ZmZXIgc2ltcGxpZmllZCBnZXR0ZXJzIGFuZCBubyBzZXR0ZXJzLlxuOyBidWYucHVzaCgnICAgICcpOzIxNTsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA2KSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIxNSwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIxODsgfSBlbHNlIGlmIChwYWdlID09IDMgJiYgbGV2ZWwgPj0gNiAmJiBsZXZlbCA8IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIxOCwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgJyk7MjE5OyBpZiAobGV2ZWwgPj0gOSkgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgICAnKTsyMjA7IH07IGJ1Zi5wdXNoKCcgICAgICAgICcpOzIyMDsgaWYgKGxldmVsID49IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICAnKTsyMjE7IH07IGJ1Zi5wdXNoKCcgICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMjI7IH0gZWxzZSBpZiAocGFnZSA9PSAzICYmIGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIyMiwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlZBUklBQkxFXCI+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjI0OyB9OyBidWYucHVzaCgnICAnKTsyMjQ7IH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7OyBidWYucHVzaCgnICAgICcpOzIyNDsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzIyODsgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzIzMTsgfTsgYnVmLnB1c2goJyAgICAnKTsyMzE7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNDQ7IH0gZWxzZSBpZiAocGFnZSA9PSA1KSB7OyBidWYucHVzaCgnICAnKTsyNDQ7IC8vIEsxIHNpbXBsaWZpZWQgYmxvY2tzIGZvciBlZGl0b3I6IGtlZXAgaW4gc3luYyB3aXRoIERhc2hib2FyZCBhcnRpc3QucmJcbjsgYnVmLnB1c2goJyAgICAnKTsyNDQ7IGlmIChsZXZlbCA9PT0gTEVWRUxCVUlMREVSX0xFVkVMKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCJLMSBTaW1wbGlmaWVkXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyX3NpbXBsZVwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3VwXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfZG93blwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2xlZnRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9yaWdodFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3VwX2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2Rvd25fbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfbGVmdF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9yaWdodF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF91cFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX2Rvd25cIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9sZWZ0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfcmlnaHRcIj48L2Jsb2NrPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzI2MjsgfTsgYnVmLnB1c2goJyAgICAnKTsyNjI7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBpZD1cImFjdGlvbnNcIiBuYW1lPVwiJywgZXNjYXBlKCgyNjIsICBtc2cuY2F0VHVydGxlKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwianVtcFwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyODk7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyODksICBtc2cuY2F0Q29sb3VyKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzMwMTsgLy8gRnVuY3Rpb25zXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDMwMSwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgICAnKTszMDI7IGlmIChsZXZlbCA9PT0gTEVWRUxCVUlMREVSX0xFVkVMKSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiUHJlYnVpbHRcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV90cmlhbmdsZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlX2N1c3RvbVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfaG91c2VcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2Zsb3dlclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd2ZsYWtlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9oZXhhZ29uXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zdGFyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yb2JvdFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffcm9ja2V0XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9wbGFuZXRcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Job21idXNcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd191cHBlcl93YXZlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbG93ZXJfd2F2ZVwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzMxODsgfTsgYnVmLnB1c2goJyAgICAnKTszMTg7IC8vIENvbnRyb2w6IGNvbnRyb2xzX2Zvcl9jb3VudGVyIGFuZCByZXBlYXQuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDMxOCwgIG1zZy5jYXRDb250cm9sKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzMzNjsgaWYgKGxldmVsIDwgNikgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszMzk7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzM0NjsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgJyk7MzQ3OyAvLyBMb2dpY1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNDcsICBtc2cuY2F0TG9naWMoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfaWZcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfY29tcGFyZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19vcGVyYXRpb25cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfbmVnYXRlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2Jvb2xlYW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfbnVsbFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY190ZXJuYXJ5XCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzU2OyAvLyBNYXRoOiBKdXN0IG51bWJlciBibG9ja3MgdW50aWwgZmluYWwgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM1NiwgIG1zZy5jYXRNYXRoKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21faW50XCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21fZmxvYXRcIj48L2Jsb2NrPlxcbiAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzczOyAvLyBWYXJpYWJsZXNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzczLCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCIgY3VzdG9tPVwiVkFSSUFCTEVcIj5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICcpOzM3NTsgfTsgYnVmLnB1c2goJzwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8qKlxuICogQ29tbW9uIGNvZGUgZm9yIGNyZWF0aW5nIHByb2NlZHVyZXMgZHJhd2luZyBkaWZmZXJlbnQgcmVndWxhciBwb2x5Z29ucy5cbiAqIG9wdGlvbnM6XG4gKiAgIHRpdGxlIFRpdGxlIG9mIHByb2NlZHVyZS5cbiAqICAgbW9kaWZpZXJzIFN0cmluZyBjb250YWluaW5nIGFueSBvcHRpb25hbCBrZXlzIGFuZCB2YWx1ZXMgZm9yIHRoZSBpbml0aWFsXG4gKiAgICAgICAgICAgICA8YmxvY2s+IHRhZywgc3VjaCBhcyAneD1cIjIwXCIgeT1cIjIwXCIgZWRpdGFibGU9XCJmYWxzZVwiJy5cbiAqICAgc2lkZXMgTnVtYmVyIG9mIHNpZGVzLlxuICogICBsZW5ndGggMCBpZiBhIGxlbmd0aCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHVzZWQsIGEgcG9zaXRpdmUgbnVtYmVyIG90aGVyd2lzZVxuICovXG52YXIgcG9seWdvbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHs7IGJ1Zi5wdXNoKCc8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiAnLCAoMTQsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICA8bXV0YXRpb24+XFxuICAgICAgJyk7MTY7IGlmIChvcHRpb25zLmxlbmd0aCA9PSAwKSB7OyBidWYucHVzaCgnICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDE2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgJyk7MTc7IH07IGJ1Zi5wdXNoKCcgICAgPC9tdXRhdGlvbj5cXG4gICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgxOCwgIG9wdGlvbnMudGl0bGUgKSksICc8L3RpdGxlPlxcbiAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgJywgKDIwLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nLCBlc2NhcGUoKDIxLCAgb3B0aW9ucy5zaWRlcyApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiICcsICgyMywgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgJyk7MjU7IGlmIChvcHRpb25zLmxlbmd0aCA9PSAwKSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9sZW5ndGhcIiAnLCAoMjUsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAnKTsyNjsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiICcsICgyNiwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDI3LCAgb3B0aW9ucy5sZW5ndGggKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgJyk7Mjk7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiAnLCAoMzEsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiICcsICgzMywgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoMzQsICAzNjAgLyBvcHRpb25zLnNpZGVzICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L3N0YXRlbWVudD5cXG4gIDwvYmxvY2s+XFxuJyk7NDQ7IH07OyBidWYucHVzaCgnXFxuJyk7NDU7XG4vKipcbiAqIFNwaXJhbCBuZWVkcyBhIG5hbWVkIGhlbHBlciB0ZW1wbGF0ZSBmb3IgcmVjdXJzaW9uLlxuICogQHBhcmFtIGkgTG9vcCBjb250cm9sIHZhcmlhYmxlLlxuICovXG52YXIgc3BpcmFsID0gZnVuY3Rpb24oaSkgezsgYnVmLnB1c2goJyAgJyk7NTA7IGlmIChpIDw9IDYwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgJyk7NTA7IGlmIChpID09IDI1KSB7IDsgYnVmLnB1c2goJ3g9XCIzMDBcIiB5PVwiMTAwXCInKTs1MDsgfSA7IGJ1Zi5wdXNoKCcgaW5saW5lPVwiZmFsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCg1NCwgIGkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJmYWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAnKTs2Njsgc3BpcmFsKGkgKyA1KTsgYnVmLnB1c2goJyAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzcwOyB9IDsgYnVmLnB1c2goJ1xcbicpOzcxOyB9OzsgYnVmLnB1c2goJ1xcbicpOzcyO1xuLyoqXG4gKiBEZWZpbmUgdGhlIHN0YXJ0aW5nIGJsb2NrcyBmb3IgZWFjaCBwYWdlIGFuZCBsZXZlbC5cbiAqIFRoZXNlIGFyZSByZWZlcmVuY2VkIGZyb20gdHVydGxlLmpzLlxuICovXG47IGJ1Zi5wdXNoKCdcXG4nKTs3ODsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgJyk7Nzg7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz5cXG4gICcpOzc5OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiQ09MT1VSXCI+I2ZmMDAwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzk5OyB9IGVsc2UgaWYgKGxldmVsID09IDMgfHwgbGV2ZWwgPT0gNSB8fCBsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicpOzEwMDsgaWYgKGxldmVsID09IDMpIHsgOyBidWYucHVzaCgnNCcpOzEwMDsgfSBlbHNlIHsgOyBidWYucHVzaCgnMycpOzEwMDsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTAyOyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTA2OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwic2V0LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCIgeD1cIjIwXCIgeT1cIjEwMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVCYWNrd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+NDU8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTI5OyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBkZWxldGFibGU9XCJmYWxzZVwiICB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE1MDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTU0OyB9OyBidWYucHVzaCgnJyk7MTU0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMikgezsgYnVmLnB1c2goJyAgJyk7MTU0OyAvLyBObyBibG9ja3MgYXJlIHByb3ZpZGVkIGZvciBsZXZlbHMgMSBhbmQgMi5cbjsgYnVmLnB1c2goJyAgJyk7MTU0OyBpZiAobGV2ZWwgPT0gMyB8fCBsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgICcpOzE1NDsgLy8gQ2FsbCBcImRyYXcgYSBzcXVhcmVcIi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE1NzsgaWYgKGxldmVsID09IDMpIHsgOyBidWYucHVzaCgnMTAwJyk7MTU3OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCc1MCcpOzE1NzsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTYxOyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTYxOyAvLyBUaHJlZS1zcXVhcmUgY29kZS5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgaWQ9XCJzZXQtY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTkwOyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDE5MSwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTk0OyBpZiAobGV2ZWwgPT0gNikgeyA7IGJ1Zi5wdXNoKCc1MCcpOzE5NDsgfSBlbHNlIHsgOyBidWYucHVzaCgnMTAnKTsxOTQ7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTk5OyBpZiAobGV2ZWwgPT0gNikgeyA7IGJ1Zi5wdXNoKCc5MCcpOzE5OTsgfSBlbHNlIHsgOyBidWYucHVzaCgnMTAwJyk7MTk5OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIxMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgICcpOzIxMjsgc3BpcmFsKDI1KTsgYnVmLnB1c2goJyAgJyk7MjEyOyB9IGVsc2UgaWYgKGxldmVsID09IDcuNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgeD1cIjIwXCIgeT1cIjIwXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yNTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjE5OyB9IGVsc2UgaWYgKGxldmVsID09IDggfHwgbGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgeD1cIjIwXCIgeT1cIjIwXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xNTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjI2OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIiB4PVwiMTU4XCIgeT1cIjY3XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNjY7IH07IGJ1Zi5wdXNoKCcnKTsyNjY7IH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAnKTsyNjY7IC8vIERlZmluZSBcImRyYXcgYSBzcXVhcmVcIi5cbjsgYnVmLnB1c2goJyAgJywgKDI2NiwgIHBvbHlnb24oe1xuICAgIHRpdGxlOiBtc2cuZHJhd0FTcXVhcmUoKSxcbiAgICBtb2RpZmllcnM6IChsZXZlbCA9PSA4ID8gJycgOiAneD1cIjIyMFwiIHk9XCI0MFwiJykgKyAnIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyxcbiAgICBzaWRlczogNCxcbiAgICBsZW5ndGg6IChsZXZlbCA+PSA2ID8gMCA6IDEwMClcbiAgfSkpLCAnICAnKTsyNzE7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgICcpOzI3MTsgLy8gRGVmaW5lIFwiZHJhdyBhIGNpcmNsZVwiLlxuOyBidWYucHVzaCgnICAgICcsICgyNzEsICBwb2x5Z29uKHtcbiAgICAgIHRpdGxlOiBtc2cuZHJhd0FDaXJjbGUoKSxcbiAgICAgIG1vZGlmaWVyczogJ3g9XCIyMjBcIiB5PVwiMjUwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInLFxuICAgICAgc2lkZXM6IDM2MCxcbiAgICAgIGxlbmd0aDogMVxuICAgIH0pKSwgJyAgJyk7Mjc2OyB9OyBidWYucHVzaCgnICAnKTsyNzY7IGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMjBcIiB5PVwiMjUwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyNzcsICBtc2cuZHJhd0FUcmlhbmdsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI3OTsgfSBlbHNlIGlmIChsZXZlbCA+PSAzKSB7OyBidWYucHVzaCgnICAgICcpOzI3OTsgLy8gIERlZmluZSBcImRyYXcgYSB0cmlhbmdsZVwiLlxuOyBidWYucHVzaCgnICAgICcsICgyNzksICBwb2x5Z29uKHtcbiAgICAgIHRpdGxlOiBtc2cuZHJhd0FUcmlhbmdsZSgpLFxuICAgICAgbW9kaWZpZXJzOiAobGV2ZWwgPT0gOCA/ICcnIDogJ3g9XCIyMjBcIiB5PVwiMjUwXCInKSArIChsZXZlbCA9PSA2ID8gJycgOiAnIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyksXG4gICAgICBzaWRlczogMyxcbiAgICAgIGxlbmd0aDogKGxldmVsID49IDcgPyAwIDogMTAwKVxuICAgIH0pKSwgJyAgJyk7Mjg0OyB9OyBidWYucHVzaCgnICAnKTsyODQ7IGlmIChsZXZlbCA9PSA4ICkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMjg1LCAgbXNnLmRyYXdBSG91c2UoKSApKSwgJ1wiPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgyODYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjk0OyB9OyBidWYucHVzaCgnICAnKTsyOTQ7IGlmIChsZXZlbCA9PSA3IHx8IGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7Mjk0OyAvLyAgRGVmaW5lIFwiZHJhdyBhIGhvdXNlXCIuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgJyk7Mjk0OyBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJ3g9XCIyMjBcIiB5PVwiNDYwXCInKTsyOTQ7IH07IGJ1Zi5wdXNoKCc+ICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgJyk7Mjk1OyBpZiAobGV2ZWwgPT0gOCkgeyA7IGJ1Zi5wdXNoKCc8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDI5NSwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPicpOzI5NTsgfTsgYnVmLnB1c2goJyAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyOTYsICBtc2cuZHJhd0FIb3VzZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgyOTksICBtc2cuZHJhd0FTcXVhcmUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMzAwLCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCIvPlxcbiAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAnKTszMDM7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMwNCwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICcpOzMwNjsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAnKTszMDk7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgJyk7MzE0OyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMxNSwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgJyk7MzE3OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAnKTszMjA7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDMzMSwgIG1zZy5kcmF3QVRyaWFuZ2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDMzMiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszMzU7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMzNiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzMzODsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszNDE7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszNTE7IH0gLy8gRW5kIG9mIHJlZ2lvbiBpbiB3aGljaCBcImRyYXcgYSBzcXVhcmVcIiBpcyBkZWZpbmVkLlxuOyBidWYucHVzaCgnJyk7MzUxOyB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkgezsgYnVmLnB1c2goJyAgJyk7MzUxOyBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCIyMzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM5NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDE5OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ1MjsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM2PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0ODU7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1MDc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1NDA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1ODQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj44MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzYyODsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzY3MjsgfTsgYnVmLnB1c2goJycpOzY3MjsgfSBlbHNlIGlmIChwYWdlID09IDUpIHs7IGJ1Zi5wdXNoKCcgICcpOzY3MjsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDY5OCwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3MTY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNzQyLCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3NjA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNzg2LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMzQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4MDQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoODEzLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4MTQsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMjcwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4MzgsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDg0MCwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjYwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoODQ5LCAgbXNnLnN0ZXAoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODY3OyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+ODwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoODkzLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODk0LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDg5OCwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjMyMFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTIwLCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg5MjIsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj42MDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDkzMSwgIG1zZy5zdGVwKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzk0OTsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg5NTAsICBtc2cuZHJhd0FUcmVlKCkgKSksICdcIj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTUxLCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTUyLCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjk8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjI8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMTkwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NjcsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NjgsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg5NzAsICBtc2cuZHJhd0FUcmVlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2lmXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJJRjBcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2NvbXBhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+R1Q8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg5NzgsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJETzBcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiUEVOXCI+cGVuRG93bjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NVUxUSVBMWTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDA5LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMzA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDI2LCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+RElWSURFPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xODA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA0MiwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTA0OSwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDEwNTAsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDEwNTEsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TUlOVVM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDU4LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA3MCwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiUEVOXCI+cGVuVXA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUJhY2t3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1VTFRJUExZPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj43PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMTAxLCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTEyNTsgfTsgYnVmLnB1c2goJycpOzExMjU7IH07IGJ1Zi5wdXNoKCcnKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIFNldHMgQmxvY2tseUFwcCBjb25zdGFudHMgdGhhdCBkZXBlbmQgb24gdGhlIHBhZ2UgYW5kIGxldmVsLlxuICogVGhpcyBlbmNhcHN1bGF0ZXMgbWFueSBmdW5jdGlvbnMgdXNlZCBmb3IgU3R1ZGlvQXBwLnJlcXVpcmVkQmxvY2tzXy5cbiAqIEluIHRoZSBmdXR1cmUsIHNvbWUgb2YgdGhlc2UgbWF5IGJlIG1vdmVkIHRvIGNvbW1vbi5qcy5cbiAqL1xuXG52YXIgcmVxdWlyZWRCbG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vcmVxdWlyZWRfYmxvY2tfdXRpbHMnKTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X2Ffc3F1YXJlIGJsb2NrIG9uIHBhZ2UgMi5cbmZ1bmN0aW9uIGRyYXdBU3F1YXJlKG51bWJlcikge1xuICByZXR1cm4ge3Rlc3Q6ICdkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19hX3NxdWFyZScsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKG51bWJlcil9fTtcbn1cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X2Ffc25vd21hbiBibG9jayBvbiBwYWdlIDIuXG5mdW5jdGlvbiBkcmF3QVNub3dtYW4obnVtYmVyKSB7XG4gIHJldHVybiB7dGVzdDogJ2RyYXdfYV9zbm93bWFuJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19hX3Nub3dtYW4nLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihudW1iZXIpfX07XG59XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbC5cbnZhciBNT1ZFX0ZPUldBUkRfSU5MSU5FID0ge3Rlc3Q6ICdtb3ZlRm9yd2FyZCcsIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnfTtcblxuLy8gYWxsb3cgbW92ZSBmb3J3YXJkIG9yIGJhY2t3YXJkLCBidXQgc2hvdyBmb3J3YXJkIGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG52YXIgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSA9IHtcbiAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JztcbiAgfSxcbiAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCdcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbCB3aXRoIHRoZSBnaXZlbiBwaXhlbCBudW1iZXIuXG52YXIgbW92ZUZvcndhcmRJbmxpbmUgPSBmdW5jdGlvbihwaXhlbHMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnbW92ZUZvcndhcmQnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IHBpeGVsc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLlxudmFyIE1PVkVfQkFDS1dBUkRfSU5MSU5FID0ge3Rlc3Q6ICdtb3ZlQmFja3dhcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlczogeydESVInOiAnbW92ZUJhY2t3YXJkJ319O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhIFtyaWdodF0gZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2tcbi8vIGFuZCBjcmVhdGVzIHRoZSBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWQvcmVjb21tZW5kZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXNcbi8vIGl0cyBpbnB1dC4gIFRoZSByZXN0cmljdGVkIHR1cm4gaXMgdXNlZCBvbiB0aGUgZWFybGllciBsZXZlbHMgb2YgdGhlXG4vLyB0dXRvcmlhbC5cbnZhciB0dXJuUmlnaHRSZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge3Rlc3Q6ICd0dXJuUmlnaHQoJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGEgW2xlZnRdIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrXG4vLyBhbmQgY3JlYXRlcyB0aGUgYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkL3JlY29tbWVuZGVkIG51bWJlciBvZiBkZWdyZWVzIGFzXG4vLyBpdHMgaW5wdXQuICBUaGUgcmVzdHJpY3RlZCB0dXJuIGlzIHVzZWQgb24gdGhlIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZVxuLy8gdHV0b3JpYWwuXG52YXIgdHVybkxlZnRSZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge3Rlc3Q6ICd0dXJuTGVmdCgnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFtyaWdodF0gZHJhd190dXJuX2J5X2NvbnN0YW50IGJsb2NrXG4vLyB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LlxudmFyIHR1cm5SaWdodEJ5Q29uc3RhbnQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnICYmXG4gICAgICAgICAgKGRlZ3JlZXMgPT09ICc/Pz8nIHx8XG4gICAgICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC52YWx1ZVRvQ29kZShcbiAgICAgICAgICAgICBibG9jaywgJ1ZBTFVFJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX05PTkUpID09IGRlZ3JlZXMpO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBbcmlnaHRdIGRyYXdfdHVybiBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWRcbi8vIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC4gIEZvciB0aGUgZWFybGllc3QgbGV2ZWxzLCB0aGUgbWV0aG9kXG4vLyB0dXJuUmlnaHRSZXN0cmljdGVkIHNob3VsZCBiZSB1c2VkIGluc3RlYWQuXG52YXIgdHVyblJpZ2h0ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJyAmJlxuICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdESVInKSA9PSAndHVyblJpZ2h0JztcbiAgICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuUmlnaHQnfSxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGVncmVlcyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGxlZnQgZHJhd190dXJuIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZFxuLy8gbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LiAgVGhpcyBtZXRob2QgaXMgbm90IGFwcHJvcHJpYXRlIGZvciB0aGVcbi8vIGVhcmxpZXN0IGxldmVscyBvZiB0aGUgdHV0b3JpYWwsIHdoaWNoIGRvIG5vdCBwcm92aWRlIGRyYXdfdHVybi5cbnZhciB0dXJuTGVmdCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybicgJiZcbiAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnRElSJykgPT0gJ3R1cm5MZWZ0JztcbiAgICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuTGVmdCd9LFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkZWdyZWVzKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFueSBkcmF3X21vdmUgYmxvY2sgYW5kLCBpZiBub3QgcHJlc2VudCwgY3JlYXRlc1xuLy8gb25lIHdpdGggdGhlIHNwZWNpZmllZCBkaXN0YW5jZS5cbnZhciBtb3ZlID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgcmV0dXJuIHt0ZXN0OiBmdW5jdGlvbihibG9jaykge3JldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmUnOyB9LFxuICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmUnLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkaXN0YW5jZSl9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2suXG52YXIgZHJhd1R1cm5SZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X3R1cm4gYmxvY2suXG52YXIgZHJhd1R1cm4gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybic7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoJz8/PycpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBcInNldCBjb2xvdXJcIiBibG9jayB3aXRoIGEgY29sb3VyIHBpY2tlclxuLy8gYXMgaXRzIGlucHV0LlxudmFyIFNFVF9DT0xPVVJfUElDS0VSID0ge3Rlc3Q6ICdwZW5Db2xvdXIoXFwnIycsXG4gIHR5cGU6ICdkcmF3X2NvbG91cicsXG4gIHZhbHVlczogeydDT0xPVVInOiAnPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz4nfX07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgXCJzZXQgY29sb3VyXCIgYmxvY2sgd2l0aCBhIHJhbmRvbSBjb2xvdXJcbi8vIGdlbmVyYXRvciBhcyBpdHMgaW5wdXQuXG52YXIgU0VUX0NPTE9VUl9SQU5ET00gPSB7dGVzdDogJ3BlbkNvbG91cihjb2xvdXJfcmFuZG9tJyxcbiAgdHlwZTogJ2RyYXdfY29sb3VyJyxcbiAgdmFsdWVzOiB7J0NPTE9VUic6ICc8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPid9fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVxdWlyZWQgYmxvY2sgc3BlY2lmaWNhdGlvbiBmb3IgZGVmaW5pbmcgYSBmdW5jdGlvbiB3aXRoIGFuXG4gKiBhcmd1bWVudC4gIFVubGlrZSB0aGUgb3RoZXIgZnVuY3Rpb25zIHRvIGNyZWF0ZSByZXF1aXJlZCBibG9ja3MsIHRoaXNcbiAqIGlzIGRlZmluZWQgb3V0c2lkZSBvZiBUdXJ0bGUuc2V0QmxvY2tseUFwcENvbnN0YW50cyBiZWNhdXNlIGl0IGlzIGFjY2Vzc2VkXG4gKiB3aGVuIGNoZWNraW5nIGZvciBhIHByb2NlZHVyZSBvbiBsZXZlbHMgOC05IG9mIFR1cnRsZSAzLlxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bmNfbmFtZSBUaGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gYXJnX25hbWUgVGhlIG5hbWUgb2YgdGhlIHNpbmdsZSBhcmd1bWVudC5cbiAqIEByZXR1cm4gQSByZXF1aXJlZCBibG9jayBzcGVjaWZpY2F0aW9uIHRoYXQgdGVzdHMgZm9yIGEgY2FsbCBvZiB0aGVcbiAqICAgICBzcGVjaWZpZWQgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50IG5hbWUuICBJZiBub3QgcHJlc2VudCxcbiAqICAgICB0aGlzIGNvbnRhaW5zIHRoZSBpbmZvcm1hdGlvbiB0byBjcmVhdGUgc3VjaCBhIGJsb2NrIGZvciBkaXNwbGF5LlxuICovXG52YXIgZGVmaW5lV2l0aEFyZyA9IGZ1bmN0aW9uKGZ1bmNfbmFtZSwgYXJnX25hbWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ3Byb2NlZHVyZXNfZGVmbm9yZXR1cm4nICYmXG4gICAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IGZ1bmNfbmFtZSAmJlxuICAgICAgICAgIGJsb2NrLnBhcmFtZXRlck5hbWVzXyAmJiBibG9jay5wYXJhbWV0ZXJOYW1lc18ubGVuZ3RoICYmXG4gICAgICAgICAgYmxvY2sucGFyYW1ldGVyTmFtZXNfWzBdID09IGFyZ19uYW1lO1xuICAgIH0sXG4gICAgdHlwZTogJ3Byb2NlZHVyZXNfZGVmbm9yZXR1cm4nLFxuICAgIHRpdGxlczogeydOQU1FJzogZnVuY19uYW1lfSxcbiAgICBleHRyYTogJzxtdXRhdGlvbj48YXJnIG5hbWU9XCInICsgYXJnX25hbWUgKyAnXCI+PC9hcmc+PC9tdXRhdGlvbj4nXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWFrZU1hdGhOdW1iZXI6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcixcbiAgc2ltcGxlQmxvY2s6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jayxcbiAgcmVwZWF0OiByZXF1aXJlZEJsb2NrVXRpbHMucmVwZWF0LFxuICBkcmF3QVNxdWFyZTogZHJhd0FTcXVhcmUsXG4gIGRyYXdBU25vd21hbjogZHJhd0FTbm93bWFuLFxuICBNT1ZFX0ZPUldBUkRfSU5MSU5FOiBNT1ZFX0ZPUldBUkRfSU5MSU5FLFxuICBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FOiBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FLFxuICBtb3ZlRm9yd2FyZElubGluZTogbW92ZUZvcndhcmRJbmxpbmUsXG4gIE1PVkVfQkFDS1dBUkRfSU5MSU5FOiBNT1ZFX0JBQ0tXQVJEX0lOTElORSxcbiAgdHVybkxlZnRSZXN0cmljdGVkOiB0dXJuTGVmdFJlc3RyaWN0ZWQsXG4gIHR1cm5SaWdodFJlc3RyaWN0ZWQ6IHR1cm5SaWdodFJlc3RyaWN0ZWQsXG4gIHR1cm5SaWdodEJ5Q29uc3RhbnQ6IHR1cm5SaWdodEJ5Q29uc3RhbnQsXG4gIHR1cm5SaWdodDogdHVyblJpZ2h0LFxuICB0dXJuTGVmdDogdHVybkxlZnQsXG4gIG1vdmU6IG1vdmUsXG4gIGRyYXdUdXJuUmVzdHJpY3RlZDogZHJhd1R1cm5SZXN0cmljdGVkLFxuICBkcmF3VHVybjogZHJhd1R1cm4sXG4gIFNFVF9DT0xPVVJfUElDS0VSOiBTRVRfQ09MT1VSX1BJQ0tFUixcbiAgU0VUX0NPTE9VUl9SQU5ET006IFNFVF9DT0xPVVJfUkFORE9NLFxuICBkZWZpbmVXaXRoQXJnOiBkZWZpbmVXaXRoQXJnLFxufTtcbiIsInZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICB7ZnVuYzogJ21vdmVGb3J3YXJkJywgcGFyZW50OiBhcGksIGNhdGVnb3J5OiAnQXJ0aXN0JywgcGFyYW1zOiBbXCIxMDBcIl0gfSxcbiAge2Z1bmM6ICd0dXJuUmlnaHQnLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICdBcnRpc3QnLCBwYXJhbXM6IFtcIjkwXCJdIH0sXG4gIHtmdW5jOiAncGVuQ29sb3VyJywgcGFyZW50OiBhcGksIGNhdGVnb3J5OiAnQXJ0aXN0JywgcGFyYW1zOiBbXCInI2ZmMDAwMCdcIl0gfSxcbiAge2Z1bmM6ICdwZW5XaWR0aCcsIHBhcmVudDogYXBpLCBjYXRlZ29yeTogJ0FydGlzdCcsIHBhcmFtczogW1wiMVwiXSB9LFxuXTtcblxubW9kdWxlLmV4cG9ydHMuY2F0ZWdvcmllcyA9IHtcbiAgQXJ0aXN0OiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIGJsb2NrczogW11cbiAgfSxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJzbGlkZXItY2VsbFwiPlxcbiAgPHN2ZyBpZD1cInNsaWRlclwiXFxuICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxcbiAgICAgICB4bWxuczpzdmc9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXFxuICAgICAgIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXFxuICAgICAgIHZlcnNpb249XCIxLjFcIlxcbiAgICAgICB3aWR0aD1cIjE1MFwiXFxuICAgICAgIGhlaWdodD1cIjUwXCI+XFxuICAgICAgPCEtLSBTbG93IGljb24uIC0tPlxcbiAgICAgIDxjbGlwUGF0aCBpZD1cInNsb3dDbGlwUGF0aFwiPlxcbiAgICAgICAgPHJlY3Qgd2lkdGg9MjYgaGVpZ2h0PTEyIHg9NSB5PTE0IC8+XFxuICAgICAgPC9jbGlwUGF0aD5cXG4gICAgICA8aW1hZ2UgeGxpbms6aHJlZj1cIicsIGVzY2FwZSgoMTMsICBhc3NldFVybChpY29uUGF0aCkgKSksICdcIiBoZWlnaHQ9NDIgd2lkdGg9ODQgeD0tMjEgeT0tMTBcXG4gICAgICAgICAgY2xpcC1wYXRoPVwidXJsKCNzbG93Q2xpcFBhdGgpXCIgLz5cXG4gICAgICA8IS0tIEZhc3QgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwiZmFzdENsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTYgeD0xMjAgeT0xMCAvPlxcbiAgICAgIDwvY2xpcFBhdGg+XFxuICAgICAgPGltYWdlIHhsaW5rOmhyZWY9XCInLCBlc2NhcGUoKDE5LCAgYXNzZXRVcmwoaWNvblBhdGgpICkpLCAnXCIgaGVpZ2h0PTQyIHdpZHRoPTg0IHg9MTIwIHk9LTExXFxuICAgICAgICAgIGNsaXAtcGF0aD1cInVybCgjZmFzdENsaXBQYXRoKVwiIC8+XFxuICA8L3N2Zz5cXG4gIDxpbWcgaWQ9XCJzcGlubmVyXCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW47XCIgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS90dXJ0bGUvbG9hZGluZy5naWYnKSApKSwgJ1wiIGhlaWdodD0xNSB3aWR0aD0xNT5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEEgc2V0IG9mIGJsb2NrcyB1c2VkIGJ5IHNvbWUgb2Ygb3VyIGN1c3RvbSBsZXZlbHMgKGkuZS4gYnVpbHQgYnkgbGV2ZWwgYnVpbGRlcilcbiAqL1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gaW5zdGFsbERyYXdBU3F1YXJlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsQ3JlYXRlQUNpcmNsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbENyZWF0ZUFTbm93Zmxha2VCcmFuY2goYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVRyaWFuZ2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FIb3VzZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBRmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FTbm93Zmxha2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUhleGFnb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVN0YXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJvYm90KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSb2NrZXQoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVBsYW5ldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUmhvbWJ1cyhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdVcHBlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcblxuIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlRHJvcGRvd24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xufTtcblxudmFyIExFTkdUSF9QQVJBTSA9IG1zZy5sZW5ndGhQYXJhbWV0ZXIoKTtcblxuZnVuY3Rpb24gY3JlYXRlQUNpcmNsZUNvZGUgKHNpemUsIGdlbnN5bSwgaW5kZW50KSB7XG4gIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICBpbmRlbnQgPSBpbmRlbnQgfHwgJyc7XG4gIHJldHVybiBbXG4gICAgaW5kZW50ICsgJy8vIGNyZWF0ZV9hX2NpcmNsZScsXG4gICAgaW5kZW50ICsgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM2OyAnICtcbiAgICBpbmRlbnQgKyAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICBpbmRlbnQgKyAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHNpemUgKyAnKTsnLFxuICAgIGluZGVudCArICcgIFR1cnRsZS50dXJuUmlnaHQoMTApOycsXG4gICAgaW5kZW50ICsgJ31cXG4nXS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGluaXRpYWxpemF0aW9uIG9iamVjdCB0aGF0IHNldHMgdXAgYmxvY2tseSBhdHRyaWJ1dGVzO1xuICpcbiAqIEBwYXJhbSB0aXRsZSAtIFRoZSB0aXRsZSBvZiB0aGUgYmxvY2sgdGhhdCB3aWxsIGJlIHZpc2libGUgdG8gdGhlIHVzZXIuXG4gKiBAcGFyYW0gW3BhcmFtZXRlcl0gLSBPcHRpb25hbCBwYXJhbWV0ZXIgZm9yIGJsb2NrcyB0aGF0IGFjY2VwdCBhIHZhbHVlXG4gKiAgICBwYXJhbWV0ZXIuIFRoaXMgaXMgdGhlIHRpdGxlIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJuIHRoZSBpbml0aWFsaXphdGlvbiBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIHBhcmFtZXRlcikge1xuICByZXR1cm4ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuXG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZSh0aXRsZSk7XG5cbiAgICAgIGlmIChwYXJhbWV0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAgIC5zZXRBbGlnbihCbG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgLmFwcGVuZFRpdGxlKHBhcmFtZXRlciArICc6Jyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIGRyYXdfYV9zcXVhcmUsIGV4Y2VwdCBpbnB1dHMgYXJlIG5vdCBpbmxpbmVkXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNxdWFyZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVNxdWFyZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmVfY3VzdG9tID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zcXVhcmVfY3VzdG9tID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3NxdWFyZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBjcmVhdGVfYV9jaXJjbGUgYW5kIGNyZWF0ZV9hX2NpcmNsZV9zaXplXG4gKiBmaXJzdCBkZWZhdWx0cyB0byBzaXplIDEwLCBzZWNvbmQgcHJvdmlkZXMgYSBzaXplIHBhcmFtXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBQ2lyY2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmNyZWF0ZUFDaXJjbGUoKTtcbiAgdmFyIHBhcmFtID0gbXNnLnNpemVQYXJhbWV0ZXIoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9jaXJjbGUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSk7XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JlYXRlX2FfY2lyY2xlX3NpemUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgcGFyYW0pO1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9jaXJjbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoMTAsIGdlbnN5bSk7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZV9zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFDaXJjbGVDb2RlKHNpemUsIGdlbnN5bSk7XG4gIH07XG59XG5cbi8qKlxuICogY3JlYXRlX2Ffc25vd2Zsb3dlclxuICovXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZUJyYW5jaChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5jcmVhdGVBU25vd2ZsYWtlQnJhbmNoKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJy8vIGNyZWF0ZV9hX3Nub3dmbGFrZV9icmFuY2gnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCg5MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoNDUpOycsXG4gICAgICAnICB9JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg0NSk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBEcmF3IGEgcmhvbWJ1cyBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJob21idXMoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FSaG9tYnVzKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3Job21idXMgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Job21idXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDI7ICcgK1xuICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxMjApOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVRyaWFuZ2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBVHJpYW5nbGUoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfdHJpYW5nbGUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3RyaWFuZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgdHJpYW5nbGUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FIZXhhZ29uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBSGV4YWdvbigpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9oZXhhZ29uID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9oZXhhZ29uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDYwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBob3VzZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhvdXNlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBSG91c2UoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfaG91c2UgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2hvdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxMjApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgZmxvd2VyIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBRmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBRmxvd2VyKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2Zsb3dlciA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfZmxvd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICB2YXIgY29sb3JfcmFuZG9tID0gZ2VuZXJhdG9yLmNvbG91cl9yYW5kb20oKVswXTtcbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMjI4YjIyXCIpOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAxMDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cignICsgY29sb3JfcmFuZG9tICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgzNik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyAvIDIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUJhY2t3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnLyAyKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTk4KTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDE4MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHNub3dmbGFrZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNub3dmbGFrZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVNub3dmbGFrZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93Zmxha2UgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9zbm93Zmxha2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHZhciBjb2xvcl9yYW5kb20gPSBnZW5lcmF0b3IuY29sb3VyX3JhbmRvbSgpWzBdO1xuICAgIHJldHVybiBbXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgODsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cihcIiM3ZmZmZDRcIik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMTUpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cihcIiMwMDAwY2RcIik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgxNSk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDQ1KTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgc3RhciBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVN0YXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FTdGFyKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3N0YXIgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3N0YXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgxOCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA1OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDE0NCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTgpO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvYm90KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBUm9ib3QoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffcm9ib3QgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2JvdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgNDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoMTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDgwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDgwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoMTUpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDMwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgyMTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg2MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMTE1KTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlQmFja3dhcmQoNTApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg1MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBEcmF3IGEgcm9ib3QgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FSb2NrZXQoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FSb2NrZXQoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffcm9ja2V0ID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICB2YXIgbG9vcFZhcjIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjZmYwMDAwXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDAwMFwiKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdUdXJ0bGUuanVtcEZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHBsYW5ldCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVBsYW5ldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVBsYW5ldCgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9wbGFuZXQgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3BsYW5ldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjODA4MDgwXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzYwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUJhY2t3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxKTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IHVwcGVyIHdhdmUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd1VwcGVyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3VXBwZXJXYXZlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd191cHBlcl93YXZlID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdXBwZXJfd2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDE4KTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGxvd2VyIHdhdmUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0xvd2VyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3TG93ZXJXYXZlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19sb3dlcl93YXZlID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbG93ZXJfd2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZURyb3Bkb3duKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIHZhciBzbm93Zmxha2VzID0gW1xuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3F1YXJlKCksICdzcXVhcmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVBhcmFsbGVsb2dyYW0oKSwgJ3BhcmFsbGVsb2dyYW0nXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUxpbmUoKSwgJ2xpbmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVNwaXJhbCgpLCAnc3BpcmFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGbG93ZXIoKSwgJ2Zsb3dlciddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlRnJhY3RhbCgpLCAnZnJhY3RhbCddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUmFuZG9tKCksICdyYW5kb20nXVxuICBdO1xuXG5cbiAgYmxvY2tseS5CbG9ja3MuY3JlYXRlX3Nub3dmbGFrZV9kcm9wZG93biA9IHtcbiAgICAvLyBXZSB1c2UgY3VzdG9tIGluaXRpYWxpemF0aW9uIChpbnN0ZWFkIG9mIG1ha2VCbG9ja0luaXRpYWxpemVyKSBoZXJlXG4gICAgLy8gYmVjYXVzZSBlYWNoIGluaXRpYWxpemF0aW9uIG5lZWRzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBGaWVsZERyb3Bkb3duLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuXG4gICAgICB2YXIgdGl0bGUgPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHNub3dmbGFrZXMpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUodGl0bGUsICdUWVBFJyk7XG5cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX3Nub3dmbGFrZV9kcm9wZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiBcIlR1cnRsZS5kcmF3U25vd2ZsYWtlKCdcIiArIHR5cGUgKyBcIicsICdibG9ja19pZF9cIiArIHRoaXMuaWQgKyBcIicpO1wiO1xuICB9O1xufVxuIiwiLy8gbG9jYWxlIGZvciB0dXJ0bGVcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkudHVydGxlX2xvY2FsZTtcbiIsIi8vIENyZWF0ZSBhIGxpbWl0ZWQgY29sb3VyIHBhbGV0dGUgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIG5ldyB1c2Vyc1xuLy8gYW5kIHRvIG1ha2UgY29sb3VyIGNoZWNraW5nIGVhc2llci4gIFRoZXNlIGRlZmluaXRpb25zIGNhbm5vdCBiZVxuLy8gbW92ZWQgdG8gYmxvY2tzLmpzLCB3aGljaCBpcyBsb2FkZWQgbGF0ZXIsIHNpbmNlIHRoZXkgYXJlIHVzZWQgaW5cbi8vIHRvcC1sZXZlbCBkZWZpbml0aW9ucyBiZWxvdy4gIE5vdGUgdGhhdCB0aGUgaGV4IGRpZ2l0cyBhLWYgYXJlXG4vLyBsb3dlci1jYXNlLiAgVGhpcyBpcyBhc3N1bWVkIGluIGNvbXBhcmlzb25zIGJlbG93LlxudmFyIENvbG91cnMgPSB7XG4gIEJMQUNLOiAnIzAwMDAwMCcsXG4gIEdSRVk6ICcjODA4MDgwJyxcbiAgS0hBS0k6ICcjYzNiMDkxJyxcbiAgV0hJVEU6ICcjZmZmZmZmJyxcbiAgUkVEOiAnI2ZmMDAwMCcsXG4gIFBJTks6ICcjZmY3N2ZmJyxcbiAgT1JBTkdFOiAnI2ZmYTAwMCcsXG4gIFlFTExPVzogJyNmZmZmMDAnLFxuICBHUkVFTjogJyMyMjhiMjInLFxuICBCTFVFOiAnIzAwMDBjZCcsXG4gIEFRVUFNQVJJTkU6ICcjN2ZmZmQ0JyxcbiAgUExVTTogJyM4NDMxNzknLFxuXG4gIEZST1pFTjE6IFwiI2QwZmRmZFwiLFxuICBGUk9aRU4yOiBcIiNkMGZkZDBcIixcbiAgRlJPWkVOMzogXCIjZDBkMGZkXCIsXG4gIEZST1pFTjQ6IFwiI2UwZTBlMFwiLFxuICBGUk9aRU41OiAnI2ZmZmZmZicsXG4gIEZST1pFTjY6IFwiI2U4ZThlOFwiLFxuICBGUk9aRU43OiBcIiNiYmQxZTRcIixcbiAgRlJPWkVOODogXCIjZmRkMGZkXCIsXG4gIEZST1pFTjk6IFwiI2FlYTRmZlwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG91cnM7XG4iLCJ2YXIgQXJ0aXN0QXBpO1xuXG5leHBvcnRzLmluamVjdEFydGlzdEFQSSA9IGZ1bmN0aW9uIChhcnRpc3RBcGkpIHtcbiAgQXJ0aXN0QXBpID0gYXJ0aXN0QXBpO1xufTtcblxuZXhwb3J0cy5tb3ZlRm9yd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ0ZEJywgZGlzdGFuY2UsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMubW92ZUJhY2t3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnRkQnLCAtZGlzdGFuY2UsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMubW92ZVVwID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMCwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5tb3ZlRG93biA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDE4MCwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5tb3ZlTGVmdCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDI3MCwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5tb3ZlUmlnaHQgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCA5MCwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5qdW1wVXAgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMTgwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMjcwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDkwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnSkYnLCBkaXN0YW5jZSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5qdW1wQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydKRicsIC1kaXN0YW5jZSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy50dXJuUmlnaHQgPSBmdW5jdGlvbihhbmdsZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydSVCcsIGFuZ2xlLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnR1cm5MZWZ0ID0gZnVuY3Rpb24oYW5nbGUpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUlQnLCAtYW5nbGUsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuZ2xvYmFsQWxwaGEgPSBmdW5jdGlvbiAoYWxwaGEpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnR0EnLCBhbHBoYSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5wZW5VcCA9IGZ1bmN0aW9uKGlkKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ1BVJywgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5wZW5Eb3duID0gZnVuY3Rpb24oaWQpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUEQnLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnBlbldpZHRoID0gZnVuY3Rpb24od2lkdGgpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUFcnLCBNYXRoLm1heCh3aWR0aCwgMCksIG51bGxdKTtcbn07XG5cbmV4cG9ydHMucGVuQ29sb3VyID0gZnVuY3Rpb24oY29sb3VyKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ1BDJywgY29sb3VyLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnBlblBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ1BTJywgcGF0dGVybiwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5oaWRlVHVydGxlID0gZnVuY3Rpb24oaWQpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnSFQnLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnNob3dUdXJ0bGUgPSBmdW5jdGlvbihpZCkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydTVCcsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuZHJhd1N0YW1wID0gZnVuY3Rpb24oc3RhbXApIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnc3RhbXAnLCBzdGFtcCwgbnVsbF0pO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgU2FtcGxlIGFuc3dlcnMgZm9yIFR1cnRsZSBsZXZlbHMuIFVzZWQgZm9yIHByb21wdHMgYW5kIG1hcmtpbmcuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG5cbnZhciBzZXRSYW5kb21WaXNpYmxlQ29sb3VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBudW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygyLCAyNCkpO1xuICAvLyBNYWtlIHN1cmUgYXQgbGVhc3Qgb25lIGNvbXBvbmVudCBpcyBiZWxvdyAweDgwIGFuZCB0aGUgcmVzdFxuICAvLyBiZWxvdyAweEEwLCB0byBwcmV2ZW50IHRvbyBsaWdodCBvZiBjb2xvdXJzLlxuICBudW0gJj0gMHg5ZjdmOWY7XG4gIHZhciBjb2xvdXIgPSAnIycgKyAoJzAwMDAwJyArIG51bS50b1N0cmluZygxNikpLnN1YnN0cigtNik7XG4gIGFwaS5wZW5Db2xvdXIoY29sb3VyKTtcbn07XG5cbnZhciBkcmF3U3F1YXJlID0gZnVuY3Rpb24obGVuZ3RoLCByYW5kb21fY29sb3VyKSB7XG4gIGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCA0OyBjb3VudCsrKSB7XG4gICAgaWYgKHJhbmRvbV9jb2xvdXIpIHtcbiAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICB9XG4gICAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gIH1cbn07XG5cbnZhciBkcmF3VHJpYW5nbGUgPSBmdW5jdGlvbihsZW5ndGgsIHJhbmRvbV9jb2xvdXIpIHtcbiAgZm9yICh2YXIgY291bnQgPSAwOyBjb3VudCA8IDM7IGNvdW50KyspIHtcbiAgICBpZiAocmFuZG9tX2NvbG91cikge1xuICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgIH1cbiAgICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gIH1cbn07XG5cbnZhciBkcmF3U25vd21hbiA9IGZ1bmN0aW9uKGhlaWdodCkge1xuICBhcGkudHVybkxlZnQoOTApO1xuICB2YXIgZGlzdGFuY2VzID0gW2hlaWdodCAqIDAuNSwgaGVpZ2h0ICogMC4zLCBoZWlnaHQgKiAwLjJdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgIHZhciBkaXN0YW5jZSA9IGRpc3RhbmNlc1tpIDwgMyA/IGkgOiA1IC0gaV0gLyA1Ny41O1xuICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMTgwOyBkICs9IDIpIHtcbiAgICAgIGFwaS5tb3ZlRm9yd2FyZChkaXN0YW5jZSk7XG4gICAgICBhcGkudHVyblJpZ2h0KDIpO1xuICAgIH1cbiAgICBpZiAoaSAhPSAyKSB7XG4gICAgICBhcGkudHVyblJpZ2h0KDE4MCk7XG4gICAgfVxuICB9XG4gIGFwaS50dXJuTGVmdCg5MCk7XG59O1xuXG52YXIgZHJhd0hvdXNlID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIGRyYXdTcXVhcmUobGVuZ3RoKTtcbiAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gIGFwaS50dXJuUmlnaHQoMzApO1xuICBkcmF3VHJpYW5nbGUobGVuZ3RoKTtcbiAgYXBpLnR1cm5SaWdodCg2MCk7XG4gIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICBhcGkudHVybkxlZnQoOTApO1xuICBhcGkubW92ZUJhY2t3YXJkKGxlbmd0aCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvZyBvZiBhIHNhbXBsZSBzb2x1dGlvbnMgZm9yIGVhY2ggbGV2ZWwuXG4gKiBUbyBjcmVhdGUgYW4gYW5zd2VyLCBqdXN0IHNvbHZlIHRoZSBsZXZlbCBpbiBCbG9ja2x5LCB0aGVuIHBhc3RlIHRoZVxuICogcmVzdWx0aW5nIEphdmFTY3JpcHQgaGVyZSwgbW92aW5nIGFueSBmdW5jdGlvbnMgdG8gdGhlIGJlZ2lubmluZyBvZlxuICogdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0cy5hbnN3ZXIgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICBhcGkubG9nID0gW107XG4gIHZhciBjb3VudCwgc2lkZUlkeCwgbGVuO1xuICBpZiAocGFnZSA9PSAxKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBFbC5cbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIFNxdWFyZS5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gVXNlIHJlcGVhdCB0byBkcmF3IGEgc3F1YXJlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCwgZmFsc2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gRXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDAsIHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gU2lkZXdheXMgZW52ZWxvcGUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICAvLyBUcmlhbmdsZSBhbmQgc3F1YXJlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLnR1cm5SaWdodCgxODApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBHbGFzc2VzLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBjYzAwJyk7ICAvLyBibHVlXG4gICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlQmFja3dhcmQoMTUwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU3Bpa3kuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDg7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLm1vdmVCYWNrd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoNDUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBDaXJjbGUuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2MDsgY291bnQrKykge1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDIpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIFNpbmdsZSBzcXVhcmUgaW4gc29tZSBjb2xvci5cbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBTaW5nbGUgZ3JlZW4gc3F1YXJlLlxuICAgICAgICBhcGkucGVuQ29sb3VyKCcjMDBmZjAwJyk7ICAvLyBncmVlblxuICAgICAgICBkcmF3U3F1YXJlKDUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIFRocmVlIHNxdWFyZXMsIDEyMCBkZWdyZWVzIGFwYXJ0LCBpbiByYW5kb20gY29sb3JzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEyMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIDM2IHNxdWFyZXMsIDEwIGRlZ3JlZXMgYXBhcnQsIGluIHJhbmRvbSBjb2xvcnMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTogIC8vIERyYXcgd2l0aG91dCB1c2luZyBmb3ItbG9vcC4gIChGYWxsIHRocm91Z2ggdG8gbmV4dCBjYXNlLilcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy8gU3F1YXJlcyB3aXRoIHNpZGVzIG9mIDUwLCA2MCwgNzAsIDgwLCBhbmQgOTAgcGl4ZWxzLlxuICAgICAgICBmb3IgKGxlbiA9IDUwOyBsZW4gPD0gOTA7IGxlbiArPSAxMCkge1xuICAgICAgICAgIGRyYXdTcXVhcmUobGVuKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gTWluaS1zcGlyYWwuXG4gICAgICAgIGZvciAobGVuID0gMjU7IGxlbiA8PSA2MDsgbGVuICs9IDUpIHtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQobGVuKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNy41OlxuICAgICAgICBkcmF3U25vd21hbigyNTApO1xuICAgICAgICBkcmF3U25vd21hbigxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgLy8gU2FtZS1oZWlnaHQgc25vd21lbi5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oMTUwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoMTAwKTtcbiAgICAgICAgICBhcGkudHVybkxlZnQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICAvLyBEaWZmZXJlbnQgaGVpZ2h0IHNub3dtZW4uXG4gICAgICAgIGZvciAodmFyIGhlaWdodCA9IDExMDsgaGVpZ2h0ID49IDcwOyBoZWlnaHQgLT0gMTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1Nub3dtYW4oaGVpZ2h0KTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgICBhcGkuanVtcEZvcndhcmQoNjApO1xuICAgICAgICAgIGFwaS50dXJuTGVmdCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gMykge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gRHJhdyBhIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyBEcmF3IGEgaG91c2UgdXNpbmcgXCJkcmF3IGEgc3F1YXJlXCIgYW5kIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgLy8gRHJhdyBhIGhvdXNlIHVzaW5nIGEgZnVuY3Rpb24uXG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDIwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBBZGQgYSBwYXJhbWV0ZXIgdG8gdGhlIFwiZHJhdyBhIGhvdXNlXCIgcHJvY2VkdXJlLlxuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBkcmF3SG91c2UoMTUwKTtcbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKGNvdW50ID0gNTA7IGNvdW50IDw9IDE1MDsgY291bnQgKz0gNTApIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd0hvdXNlKGNvdW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBEcmF3IGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIERyYXcgdHdvIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gRHJhdyBmb3VyIGVxdWlsYXRlcmFsIHRyaWFuZ2xlcy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgzNik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM2OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgNDsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg4MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMDpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDk7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoODApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFwaS5sb2c7XG59O1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEFydGlzdCBBUEkgbG9naWMuIFRoZSBtZXRob2RzIG9uIHRoaXMgb2JqZWN0IGFyZSBjYWxsZWQgYnlcbiAqIGdlbmVyYXRlZCB1c2VyIGNvZGUuIEFzIHRoZXkgYXJlIGNhbGxlZCwgdGhleSBpbnNlcnQgY29tbWFuZHMgaW50byB0aGlzLmxvZy5cbiAqIE5PVEU6IHRoaXMubG9nIGlzIGFsc28gbW9kaWZpZWQgaW4gc29tZSBjYXNlcyBleHRlcm5hbGx5IChib3RoIGFjY2Vzc2VkIGFuZFxuICogSSB0aGluayBjbGVhcmVkKS5cbiAqL1xudmFyIEFydGlzdEFQSSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sb2cgPSBbXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJ0aXN0QVBJO1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdDaXJjbGUgPSBmdW5jdGlvbiAoc2l6ZSwgaWQpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzNjsgaSsrKSB7XG4gICAgdGhpcy5tb3ZlRm9yd2FyZChzaXplLCBpZCk7XG4gICAgdGhpcy50dXJuUmlnaHQoMTAsIGlkKTtcbiAgfVxufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3U25vd2ZsYWtlID0gZnVuY3Rpb24gKHR5cGUsIGlkKSB7XG4gIHZhciBpLCBqLCBrO1xuXG4gIC8vIG1pcm9ycyBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5cbiAgdmFyIHJhbmRvbV9jb2xvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbG9ycyA9IEJsb2NrbHkuRmllbGRDb2xvdXIuQ09MT1VSUztcbiAgICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpjb2xvcnMubGVuZ3RoKV07XG4gIH07XG5cbiAgaWYgKHR5cGUgPT09ICdyYW5kb20nKSB7XG4gICAgdHlwZSA9IF8uc2FtcGxlKFsnZnJhY3RhbCcsICdmbG93ZXInLCAnc3BpcmFsJywgJ2xpbmUnLCAncGFyYWxsZWxvZ3JhbScsICdzcXVhcmUnXSk7XG4gIH1cblxuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ2ZyYWN0YWwnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICB0aGlzLmp1bXBGb3J3YXJkKDQ1LCBpZCk7XG4gICAgICAgIHRoaXMudHVybkxlZnQoNDUsIGlkKTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDM7IGorKykge1xuICAgICAgICAgIGZvciAoayA9IDA7IGsgPCAzOyBrKyspIHtcbiAgICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoMTUsIGlkKTtcbiAgICAgICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgICB0aGlzLnR1cm5SaWdodCg0NSwgaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDkwLCBpZCk7XG4gICAgICAgICAgdGhpcy5tb3ZlQmFja3dhcmQoMTUsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5MZWZ0KDQ1LCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoOTAsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZmxvd2VyJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDIsIGlkKTtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDQsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoNzIsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3BpcmFsJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAyMDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSgzLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUZvcndhcmQoMjAsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMTgsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbGluZSc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgOTA7IGkrKykge1xuICAgICAgICB0aGlzLnBlbkNvbG91cihyYW5kb21fY29sb3VyKCkpO1xuICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDUwLCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDQsIGlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGVuQ29sb3VyKFwiI0ZGRkZGRlwiLCBpZCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BhcmFsbGVsb2dyYW0nOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDI7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg2MCwgaWQpO1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCgxMjAsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCgzNiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgICB0aGlzLnR1cm5SaWdodCg5MCwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDM2LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydGRCcsIGRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0ZEJywgLWRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlVXAgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAxODAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAyNzAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgOTAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBVcCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcERvd24gPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDE4MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcExlZnQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDI3MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcFJpZ2h0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCA5MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcEZvcndhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pGJywgZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBCYWNrd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkYnLCAtZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnR1cm5SaWdodCA9IGZ1bmN0aW9uKGFuZ2xlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUlQnLCBhbmdsZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUudHVybkxlZnQgPSBmdW5jdGlvbihhbmdsZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1JUJywgLWFuZ2xlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5nbG9iYWxBbHBoYSA9IGZ1bmN0aW9uIChhbHBoYSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0dBJywgYWxwaGEsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblVwID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BVJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuRG93biA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQRCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbldpZHRoID0gZnVuY3Rpb24od2lkdGgsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQVycsIE1hdGgubWF4KHdpZHRoLCAwKSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuQ29sb3VyID0gZnVuY3Rpb24oY29sb3VyLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUEMnLCBjb2xvdXIsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlblBhdHRlcm4gPSBmdW5jdGlvbihwYXR0ZXJuLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFMnLCBwYXR0ZXJuLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5oaWRlVHVydGxlID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0hUJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuc2hvd1R1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydTVCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdTdGFtcCA9IGZ1bmN0aW9uKHN0YW1wLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnc3RhbXAnLCBzdGFtcCwgaWRdKTtcbn07XG4iXX0=
