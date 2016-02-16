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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2Fuc3dlcnMuanMiLCJidWlsZC9qcy90dXJ0bGUvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDcEMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsTUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQzs7QUFFMUIsUUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLEtBQUssRUFBRTtBQUM1RCxVQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNwQyxDQUFDO0FBQ0YsUUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsQyxTQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNsQyxDQUFDOzs7OztBQ2pCRixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRW5DLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3JDLE1BQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUV2QyxNQUFJLE9BQU8sR0FBRztBQUNaLFFBQUksRUFBRTs7QUFFSixtQkFBYSxFQUFFLEVBQUU7QUFDakIscUJBQWUsRUFBRSxFQUFFO0FBQ25CLG1CQUFhLEVBQUUsSUFBSTtBQUNuQiw0QkFBc0IsRUFBRSxJQUFJO0FBQzVCLGNBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQztBQUN2QyxpQkFBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7O0FBRTdDLDZCQUF1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDaEY7O0FBRUQsUUFBSSxFQUFFO0FBQ0osbUJBQWEsRUFBRSxFQUFFO0FBQ2pCLHFCQUFlLEVBQUUsRUFBRTtBQUNuQixrQ0FBNEIsRUFBRSxFQUFFO0FBQ2hDLG1CQUFhLEVBQUUsSUFBSTtBQUNuQiw0QkFBc0IsRUFBRSxJQUFJO0FBQzVCLGNBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQztBQUN2QyxpQkFBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7O0FBRTdDLDZCQUF1QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDaEY7O0FBRUQsVUFBTSxFQUFFOztBQUVOLDZCQUF1QixFQUFFLENBQ3JCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsRUFDakMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUMzQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEVBQ25DLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FDbEM7S0FDRjtHQUNGLENBQUM7O0FBRUYsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7O0FBRzlCLE1BQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDOzs7O0FBSXZCLE1BQUksQ0FBQyxXQUFXLEdBQUcsQ0FDakIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUN6QixDQUFDOzs7QUFHRixNQUFJLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDekIsT0FBSyxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDdkIsUUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzQjs7Ozs7O0FBTUQsTUFBSSx1QkFBdUIsR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7QUFHbEUsTUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLHVCQUF1QixFQUFFO0FBQzVDLDJCQUF1QixHQUFHLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztHQUMxRjs7QUFFRCxNQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7O0FBRXZELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqREYsWUFBWSxDQUFDOztBQUViLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVyQyxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0FBR2pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBUyxPQUFPLEVBQUUsbUJBQW1CLEVBQUU7QUFDdkQsTUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDOztBQUVwQyxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxTQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQzs7QUFFL0IsTUFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQVksSUFBSSxFQUFFO0FBQzFCLFFBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQzVDLFdBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQy9ELENBQUM7O0FBRUYsTUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFDMUM7O0FBRUUsV0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FDNUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQ2pELE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUNqRCxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JELFdBQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztHQUVqQyxNQUFNOzs7QUFHTCxXQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRzs7QUFFNUIsV0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUMzQixPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLOztBQUU1QixXQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQ3pCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07O0FBRTlCLFdBQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0dBQ2pDOzs7QUFHRCxTQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHOztBQUVyQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckQsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUMzQyxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUNsRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztLQUMzQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsR0FBRzs7QUFFOUMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVk7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNwQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUNqRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztLQUMzQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7OztBQUczQyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQztBQUNGLFdBQVMsQ0FBQyw4QkFBOEIsR0FBRyxTQUFTLENBQUMscUJBQXFCLENBQUM7O0FBRTNFLFNBQU8sQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLEdBQUc7O0FBRWhELFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLEdBQ2pELENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFBQyxXQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUV0RCxXQUFTLENBQUMsZ0NBQWdDLEdBQUcsWUFBVzs7O0FBR3RELFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzNELFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRzs7QUFFckMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ3BDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFDMUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDbEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLDhCQUE4QixHQUFHOztBQUU5QyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBWTtBQUNoQixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ3BDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ2pELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM5QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7O0FBRTNDLFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUN4QyxHQUFHLEdBQUcsS0FBSyxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4RCxDQUFDO0FBQ0YsV0FBUyxDQUFDLDhCQUE4QixHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQzs7QUFFM0UsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7OztBQUd0QyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMzRCxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUN4QyxHQUFHLEdBQUcsS0FBSyxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4RCxDQUFDOztBQUdGLFNBQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEdBQUc7O0FBRTNDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEdBQzVDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFBQyxXQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUV0RCxXQUFTLENBQUMsMkJBQTJCLEdBQUcsWUFBVzs7O0FBR2pELFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzNELFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRzs7QUFFaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3JELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFDeEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDcEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsZ0JBQWdCLEdBQUcsWUFBVzs7QUFFdEMsUUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDM0QsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHOztBQUVyQyxZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtBQUMxQyxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQzVDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEUsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNwRDtBQUNELFdBQU8sRUFBRSxtQkFBVztBQUNsQixhQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQzs7QUFFMUQsU0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRzs7QUFFcEMsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7QUFDMUMsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM1QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDcEQ7QUFDRCxXQUFPLEVBQUUsbUJBQVc7QUFDbEIsYUFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7O0FBRXpELFNBQU8sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUc7O0FBRW5DLFlBQVEsRUFBRSxJQUFJO0FBQ2QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO0FBQzFDLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FDNUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6RCxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsV0FBTyxFQUFFLG1CQUFXO0FBQ2xCLGFBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDcEM7R0FDRixDQUFDOztBQUVGLFdBQVMsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDOzs7O0FBSXhELFNBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHOztBQUU3QixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQzdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUNuQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsYUFBYSxHQUFHLFlBQVc7O0FBRW5DLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ3BDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUIsV0FBTzs7O0FBR0gsc0JBQWtCLEVBQ2xCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQy9DLE9BQU8sR0FBRyxPQUFPLEVBQ3ZCLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHlCQUF5QixFQUN6QixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkIsQ0FBQzs7OztBQUlGLFNBQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHOztBQUU5QixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQzdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjtHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXOztBQUVwQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUM3QixJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLFFBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxRQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsV0FBTzs7O0FBR0wsdUJBQW1CLEVBQ25CLHNCQUFzQixFQUN0QixNQUFNLEdBQUcsWUFBWSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsVUFBVSxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQ25FLEtBQUssR0FBRyxVQUFVLEVBQ3RCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQ2pELE9BQU8sR0FBRyxTQUFTLEVBQ3ZCLFFBQVEsR0FBRyxXQUFXLEdBQUcsS0FBSyxHQUFHLFlBQVksR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUN6RCxTQUFTLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsV0FBVyxFQUMxRCxhQUFhLEdBQUcsU0FBUyxHQUFHLFFBQVEsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUN4RCxTQUFTLEdBQUcsT0FBTyxFQUN2Qix5QkFBeUIsR0FBRyxXQUFXLEdBQUcsSUFBSSxFQUM5QywwQkFBMEIsRUFDMUIsS0FBSyxFQUNMLFFBQVEsR0FBRyxPQUFPLEdBQUcsVUFBVSxFQUMvQiwyQkFBMkIsRUFDM0IsS0FBSyxFQUNMLEdBQUcsRUFDSCx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN4QyxDQUFDOzs7O0FBSUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRzs7QUFFcEMsV0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO0FBQ3pDLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FDaEQsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsRUFDMUMsS0FBSyxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUMzQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUNyQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUNyQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUMxQixXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUNwRCxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkM7QUFDRCxXQUFPLEVBQUUsbUJBQVc7QUFDbEIsYUFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNwQztBQUNELHFCQUFpQixFQUFFLDJCQUFTLE9BQU8sRUFBRTtBQUNuQyxVQUFJLE1BQU0sR0FBRyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUM3QixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLFlBQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsY0FBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsY0FBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckMsVUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQyxjQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLGNBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFDdkQsWUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEUsYUFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN0Qjs7O0FBR0QsaUJBQWEsRUFBRSx5QkFBWTtBQUN6QixVQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEMsZUFBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0MsYUFBTyxTQUFTLENBQUM7S0FDbEI7O0FBRUQsaUJBQWEsRUFBRSx1QkFBUyxVQUFVLEVBQUU7QUFDbEMsVUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7OztBQUd4RCxTQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7QUFDM0MsU0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDOzs7O0FBSTFDLFNBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHOztBQUV6QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQy9CLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLEVBQ2xDLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLFdBQVMsQ0FBQyxTQUFTLEdBQUcsWUFBVzs7QUFFL0IsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pDLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUc7O0FBRXBCLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FDekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQ3ZDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7S0FDcEM7R0FDRixDQUFDOztBQUVGLE1BQUksMkJBQTJCLEdBQUcsa0JBQWtCLENBQUM7QUFDckQsTUFBSSw0QkFBNEIsR0FBRyxtQkFBbUIsQ0FBQztBQUN2RCxNQUFJLG1CQUFtQixHQUFHLENBQ3hCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxFQUNoRCxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FDbkQsQ0FBQztBQUNGLE1BQUksd0JBQXdCLEdBQUcsQ0FDN0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsRUFDckQsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsNEJBQTRCLENBQUMsQ0FDeEQsQ0FBQzs7QUFFRixNQUFJLFVBQVUsR0FBRztBQUNmLHVCQUFtQixFQUFFLEVBQUU7QUFDdkIscUJBQWlCLEVBQUUsRUFBRTtBQUNyQixvQkFBZ0IsRUFBRSxHQUFHO0FBQ3JCLHFCQUFpQixFQUFFO0FBQ2pCLFVBQUksRUFBRTtBQUNKLGFBQUssRUFBRSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7QUFDdEMsb0JBQVksRUFBRSxVQUFVO0FBQ3hCLGVBQU8sRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFO0FBQzlCLGFBQUssRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN4Qix1QkFBZSxFQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDO0FBQ3hDLGVBQU8sRUFBRSxtQkFBbUI7T0FDN0I7QUFDRCxXQUFLLEVBQUU7QUFDTCxhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsV0FBVztBQUN6QixlQUFPLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRTtBQUM5QixhQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDeEIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsd0JBQXdCO09BQ2xDO0FBQ0QsUUFBRSxFQUFFO0FBQ0YsYUFBSyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUN2QyxvQkFBWSxFQUFFLFFBQVE7QUFDdEIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMvQixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsbUJBQW1CO09BQzdCO0FBQ0QsVUFBSSxFQUFFO0FBQ0osYUFBSyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUN2QyxvQkFBWSxFQUFFLFVBQVU7QUFDeEIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMvQixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsbUJBQW1CO09BQzdCO0FBQ0QsZUFBUyxFQUFFO0FBQ1QsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsVUFBVTtBQUN4QixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUU7T0FDL0I7QUFDRCxnQkFBVSxFQUFFO0FBQ1YsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsV0FBVztBQUN6QixhQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWM7QUFDMUIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUU7T0FDL0I7QUFDRCxhQUFPLEVBQUU7QUFDUCxjQUFNLEVBQUUsSUFBSTtBQUNaLGFBQUssRUFBRSxTQUFTLENBQUMsb0JBQW9CLEVBQUU7QUFDdkMsb0JBQVksRUFBRSxRQUFRO0FBQ3RCLGFBQUssRUFBRSxJQUFJLENBQUMsV0FBVztBQUN2QixlQUFPLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFO09BQ2hDO0FBQ0QsZUFBUyxFQUFFO0FBQ1QsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG9CQUFvQixFQUFFO0FBQ3ZDLG9CQUFZLEVBQUUsVUFBVTtBQUN4QixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtPQUNoQztLQUNGO0FBQ0Qsa0NBQThCLEVBQUUsMENBQVc7QUFDekMsZ0JBQVUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxnQkFBVSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLGdCQUFVLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUMsZ0JBQVUsQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNoRDtBQUNELDhCQUEwQixFQUFFLG9DQUFTLFNBQVMsRUFBRTtBQUM5QyxlQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwRixlQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDOUYsZUFBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RyxhQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2RyxhQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckYsYUFBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQztLQUNoRztBQUNELHFCQUFpQixFQUFFLDJCQUFTLFNBQVMsRUFBRSxjQUFjLEVBQUU7QUFDckQsVUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlELFVBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQzlCLGFBQU87QUFDTCxlQUFPLEVBQUUsRUFBRTtBQUNYLFlBQUksRUFBRSxnQkFBWTtBQUNoQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsY0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDcEMsY0FBSSxlQUFlLENBQUMsTUFBTSxFQUFFO0FBQzFCLGlCQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1dBQ3JDO0FBQ0QsZUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXpILGNBQUksZUFBZSxDQUFDLGVBQWUsRUFBRTtBQUNuQyxpQkFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssRUFDNUQsZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQ3JDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztXQUM1QyxNQUFNO0FBQ0wsaUJBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1dBQ2xFO0FBQ0QsY0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixjQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxjQUFJLGNBQWMsRUFBRTtBQUNsQixnQkFBSSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZFLG9CQUFRLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsaUJBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1dBQ3ZDO1NBQ0Y7T0FDRixDQUFDO0tBQ0g7QUFDRCx5QkFBcUIsRUFBRSwrQkFBUyxTQUFTLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRTtBQUNqRSxhQUFPLFlBQVc7QUFDaEIsY0FBTSxHQUFHLE1BQU0sSUFBSSxVQUFVLENBQUMsbUJBQW1CLENBQUM7O0FBRWxELFlBQUksY0FBYyxFQUFFO0FBQ2xCLGdCQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNuRDtBQUNELGVBQU8sU0FBUyxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO09BQ25JLENBQUM7S0FDSDtHQUNGLENBQUM7O0FBRUYsWUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUM7O0FBRTVDLFNBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FDMUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsRUFDbEMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQzs7QUFFM0MsV0FBUyxDQUFDLElBQUksR0FBRyxZQUFXOztBQUUxQixRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQzNDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDakMsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHOzs7QUFHaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFDekMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDcEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLHlCQUF5QixHQUFHOzs7QUFHekMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ2pELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7OztBQUd0QyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQztBQUNGLFdBQVMsQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7O0FBRWpFLFNBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHOztBQUV6QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQy9CLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQzlCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0FBRW5DLFdBQVMsQ0FBQyxTQUFTLEdBQUcsWUFBVzs7QUFFL0IsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pDLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7Ozs7QUFJRixTQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRzs7QUFFMUIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUN6QixRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FDdkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztLQUNyQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFXOztBQUVoQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQzNDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDakMsV0FBTyxrQkFBa0IsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQzFFLENBQUM7OztBQUdGLFNBQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUc7O0FBRWpDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQ3pDLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0tBQ3JDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsaUJBQWlCLEdBQUcsWUFBVzs7QUFFdkMsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QyxXQUFPLGtCQUFrQixHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDMUUsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRzs7QUFFeEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9ELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNuQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUN6QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUN0QixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxXQUFTLENBQUMsUUFBUSxHQUFHLFlBQVc7O0FBRTlCLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN6QyxDQUFDOztBQUVGLFNBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHOztBQUUzQixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQzFCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7S0FDdEM7R0FDRixDQUFDOztBQUVGLFNBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHOzs7OztBQUtyQixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FDekIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsS0FBSyxHQUFHLFlBQVk7QUFDNUIsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEYsV0FBTyxxQkFBcUIsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUNsRCxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4QixDQUFDOztBQUVGLFdBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVzs7QUFFakMsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUM3QyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQzNDLFdBQU8sbUJBQW1CLEdBQUcsTUFBTSxHQUFHLGVBQWUsR0FDakQsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEIsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHOztBQUVsQyxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQ3JFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pGLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25FLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQzVCLFdBQVcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsa0JBQWtCLEdBQUcsWUFBVzs7QUFFeEMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhLENBQUM7QUFDM0QsV0FBTyxvQkFBb0IsR0FBRyxNQUFNLEdBQUcsZ0JBQWdCLEdBQ25ELElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hCLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsR0FBRzs7QUFFdkMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNqQixXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQzdCLFdBQVcsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FDekMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUUsRUFBRSxPQUFPLENBQUUsQ0FBQztBQUMzRCxVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ25DO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsdUJBQXVCLEdBQUcsWUFBVzs7QUFFN0MsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxhQUFhLENBQUM7QUFDM0QsV0FBTyxxQkFBcUIsR0FBRyxPQUFPLEdBQUcsZ0JBQWdCLEdBQ3JELElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hCLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDdEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRSxVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7S0FDaEQ7R0FDRixDQUFDOztBQUVGLFdBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBVzs7QUFFNUIsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUMvQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQ3pDLFdBQU8sbUJBQW1CLEdBQUcsTUFBTSxHQUFHLGVBQWUsR0FDbkQsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDdEIsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHOztBQUVqQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztLQUNoRDtHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQ2xDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQ2hDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7O0FBRXZDLFdBQVMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFXOztBQUV2QyxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUMvQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDekMsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRztBQUM1QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLFFBQVEsQ0FBQztBQUNiLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3BDLFdBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDbkMsY0FBUSxHQUFHLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUUvRCxXQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFckMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDbEM7R0FDRixDQUFDOzs7O0FBSUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRXRELFdBQVMsQ0FBQyxZQUFZLEdBQUcsWUFBWTtBQUNuQyxXQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQ3JELGdCQUFnQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQzNDLENBQUM7O0FBRUYsbUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDdkQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3NkJGLFlBQVksQ0FBQzs7QUFFYixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUNqRCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEMsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDOUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7QUFFL0MsSUFBSSxhQUFhLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLElBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQzs7QUFFdkIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDOztBQUVyQixJQUFJLHdCQUF3QixHQUFHLENBQUMsQ0FBQztBQUNqQyxJQUFJLDZCQUE2QixHQUFHLEVBQUUsQ0FBQzs7Ozs7QUFLdkMsSUFBSSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7Ozs7OztBQU05QixJQUFJLHVCQUF1QixHQUFHLENBQzVCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQ3pCLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQ3pCLENBQUM7Ozs7OztBQU1GLElBQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFlO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVsQixNQUFJLENBQUMsR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7OztBQUczQixNQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLE1BQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFD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LE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7R0FDOUI7QUFDRCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUNyQyxRQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0dBQzlCOztBQUVELE1BQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDNUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDdEMsUUFBSSxDQUFD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QUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDaEUsVUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsV0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLFdBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQzFDLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxV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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUMzREEsSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7O0FBRzVELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUMzQixTQUFPLEVB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QUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN6QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDdkQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDeEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN0QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNsRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNqRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ25DLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDdkMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQ3pDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDakQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMvQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNuRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNuQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsT0FBTyxFQUFFLEVBQUUsRUFBRTtBQUNyRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNwQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQzVDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUM1QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2xELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEFydGlzdCA9IHJlcXVpcmUoJy4vdHVydGxlJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cudHVydGxlTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGFydGlzdCA9IG5ldyBBcnRpc3QoKTtcblxuICB3aW5kb3cuX19UZXN0SW50ZXJmYWNlLnNldFNwZWVkU2xpZGVyVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBhcnRpc3Quc3BlZWRTbGlkZXIuc2V0VmFsdWUodmFsdWUpO1xuICB9O1xuICBhcnRpc3QuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oYXJ0aXN0LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiIsInZhciBza2luQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG5cbiAgdmFyIENPTkZJR1MgPSB7XG4gICAgYW5uYToge1xuICAgICAgLy8gc2xpZGVyIHNwZWVkIGdldHMgZGl2aWRlZCBieSB0aGlzIHZhbHVlXG4gICAgICBzcGVlZE1vZGlmaWVyOiAxMCxcbiAgICAgIHR1cnRsZU51bUZyYW1lczogMTAsXG4gICAgICBzbW9vdGhBbmltYXRlOiB0cnVlLFxuICAgICAgY29uc29saWRhdGVUdXJuQW5kTW92ZTogdHJ1ZSxcbiAgICAgIGFubmFMaW5lOiBza2luLmFzc2V0VXJsKCdhbm5hbGluZS5wbmcnKSxcbiAgICAgIGFubmFMaW5lXzJ4OiBza2luLmFzc2V0VXJsKCdhbm5hbGluZV8yeC5wbmcnKSxcbiAgICAgIC8vIFVzZWQgdG8gcG9wdWxhdGUgdGhlIFNldCBQYXR0ZXJuIGJsb2NrXG4gICAgICBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9uczogW1tza2luLmFzc2V0VXJsKCdhbm5hbGluZS1tZW51aWNvbi5wbmcnKSwgJ2FubmFMaW5lJ11dXG4gICAgfSxcblxuICAgIGVsc2E6IHtcbiAgICAgIHNwZWVkTW9kaWZpZXI6IDEwLFxuICAgICAgdHVydGxlTnVtRnJhbWVzOiAyMCxcbiAgICAgIGRlY29yYXRpb25BbmltYXRpb25OdW1GcmFtZXM6IDE5LFxuICAgICAgc21vb3RoQW5pbWF0ZTogdHJ1ZSxcbiAgICAgIGNvbnNvbGlkYXRlVHVybkFuZE1vdmU6IHRydWUsXG4gICAgICBlbHNhTGluZTogc2tpbi5hc3NldFVybCgnZWxzYWxpbmUucG5nJyksXG4gICAgICBlbHNhTGluZV8yeDogc2tpbi5hc3NldFVybCgnZWxzYWxpbmVfMngucG5nJyksXG4gICAgICAvLyBVc2VkIHRvIHBvcHVsYXRlIHRoZSBTZXQgUGF0dGVybiBibG9ja1xuICAgICAgbGluZVN0eWxlUGF0dGVybk9wdGlvbnM6IFtbc2tpbi5hc3NldFVybCgnZWxzYWxpbmUtbWVudWljb24ucG5nJyksICdlbHNhTGluZSddXVxuICAgIH0sXG5cbiAgICBhcnRpc3Q6IHtcbiAgICAgIC8vIFVzZWQgdG8gcG9wdWxhdGUgdGhlIFNldCBQYXR0ZXJuIGJsb2NrXG4gICAgICBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9uczogW1xuICAgICAgICAgIFtza2luLnJhaW5ib3dNZW51LCAncmFpbmJvd0xpbmUnXSxcbiAgICAgICAgICBbc2tpbi5yb3BlTWVudSwgJ3JvcGVMaW5lJ10sXG4gICAgICAgICAgW3NraW4uc3F1aWdnbHlNZW51LCAnc3F1aWdnbHlMaW5lJ10sXG4gICAgICAgICAgW3NraW4uc3dpcmx5TWVudSwgJ3N3aXJseUxpbmUnXVxuICAgICAgXVxuICAgIH1cbiAgfTtcblxuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICAvLyBiYXNlIHNraW4gcHJvcGVydGllcyBoZXJlIChjYW4gYmUgb3ZlcnJpZGVuIGJ5IENPTkZJRylcbiAgc2tpbi5zcGVlZE1vZGlmaWVyID0gMTtcblxuICAvLyBzdGFtcHMgYXJlbid0IGFjdHVhbGx5IHVzZWQgb24gcHJvZHVjdGlvbiBhbnl3aGVyZSByaWdodCBub3cuIGlmIHdlIHdlcmVcbiAgLy8gdG8gd2FudCB0byB1c2UgdGhlbSwgZGVmaW5lIHRoZSBtYXBwaW5nIGZyb20gaW1hZ2UgdG8gbmFtZSBoZXJlLlxuICBza2luLnN0YW1wVmFsdWVzID0gW1xuICAgIFtza2luLmF2YXRhciwgJ0RFRkFVTFQnXVxuICBdO1xuXG4gIC8vIEdldCBwcm9wZXJ0aWVzIGZyb20gY29uZmlnXG4gIHZhciBpc0Fzc2V0ID0gL1xcLlxcU3szfSQvOyAvLyBlbmRzIGluIGRvdCBmb2xsb3dlZCBieSB0aHJlZSBub24td2hpdGVzcGFjZSBjaGFyc1xuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuICAgIHNraW5bcHJvcF0gPSBjb25maWdbcHJvcF07XG4gIH1cblxuICAvLyBEZWNsYXJlIGF2YWlsYWJsZSBsaW5lIHN0eWxlIHBhdHRlcm5zLiBUaGlzIGFycmF5IG9mIGFycmF5cyBpcyBldmVudHVhbGx5IHVzZWRcbiAgLy8gdG8gcG9wdWxhdGUgdGhlIGltYWdlIGRyb3Bkb3duIGluIHRoZSBTZXQgUGF0dGVybiBibG9jay5cblxuICAvLyBBbGwgc2tpbnMgaGF2ZSB0aGUgZGVmYXVsdCBsaW5lIHN0eWxlIChzb2xpZCBjb2xvdXJlZCBsaW5lKVxuICB2YXIgbGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSAgW1tza2luLnBhdHRlcm5EZWZhdWx0LCAnREVGQVVMVCddXTtcblxuICAvLyBJZiB0aGUgc2tpbiBwcm92aWRlZCBsaW5lIHBhdHRlcm5zLCBhZGQgdGhlbSB0byB0aGUgcGF0dGVybiBzZXRcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcubGluZVN0eWxlUGF0dGVybk9wdGlvbnMpIHtcbiAgICBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLmNvbmNhdChjb25maWcubGluZVN0eWxlUGF0dGVybk9wdGlvbnMpO1xuICB9XG5cbiAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBjdXN0b21MZXZlbEJsb2NrcyA9IHJlcXVpcmUoJy4vY3VzdG9tTGV2ZWxCbG9ja3MnKTtcbnZhciBUdXJ0bGUgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgdmFyIGdlbnN5bSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgTkFNRV9UWVBFID0gYmxvY2tseS5WYXJpYWJsZXMuTkFNRV9UWVBFO1xuICAgIHJldHVybiBnZW5lcmF0b3IudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKG5hbWUsIE5BTUVfVFlQRSk7XG4gIH07XG5cbiAgaWYgKHNraW4uaWQgPT0gXCJhbm5hXCIgfHwgc2tpbi5pZCA9PSBcImVsc2FcIilcbiAge1xuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICBDb2xvdXJzLkZST1pFTjEsIENvbG91cnMuRlJPWkVOMiwgQ29sb3Vycy5GUk9aRU4zLFxuICAgICAgQ29sb3Vycy5GUk9aRU40LCBDb2xvdXJzLkZST1pFTjUsIENvbG91cnMuRlJPWkVONixcbiAgICAgIENvbG91cnMuRlJPWkVONywgQ29sb3Vycy5GUk9aRU44LCBDb2xvdXJzLkZST1pFTjldO1xuICAgIGJsb2NrbHkuRmllbGRDb2xvdXIuQ09MVU1OUyA9IDM7XG5cbiAgfSBlbHNlIHtcblxuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICAvLyBSb3cgMS5cbiAgICAgIENvbG91cnMuQkxBQ0ssIENvbG91cnMuR1JFWSxcbiAgICAgIENvbG91cnMuS0hBS0ksIENvbG91cnMuV0hJVEUsXG4gICAgICAvLyBSb3cgMi5cbiAgICAgIENvbG91cnMuUkVELCBDb2xvdXJzLlBJTkssXG4gICAgICBDb2xvdXJzLk9SQU5HRSwgQ29sb3Vycy5ZRUxMT1csXG4gICAgICAvLyBSb3cgMy5cbiAgICAgIENvbG91cnMuR1JFRU4sIENvbG91cnMuQkxVRSxcbiAgICAgIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSA0O1xuICB9XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVscy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2ZcbiAgICAvLyBwaXhlbHMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZCBzZXQgb2YgYW5nbGVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpIHx8IDA7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQ7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSk7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZV9yZXN0cmljdGVkLlZBTFVFID1cbiAgICAgIFszMCwgNDUsIDYwLCA5MCwgMTIwLCAxMzUsIDE1MCwgMTgwXS5cbiAgICAgIG1hcChmdW5jdGlvbih0KSB7cmV0dXJuIFtTdHJpbmcodCksIFN0cmluZyh0KV07fSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2lubGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9jb3VudGVyID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxvb3BWYXJpYWJsZSgpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfY291bnRlciA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxlbmd0aFBhcmFtZXRlcigpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXQ7XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9zaWRlcyA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKCdzaWRlcycpLCAnVkFSJyk7XG4gICAgICB0aGlzLnNldE91dHB1dCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RPT0xUSVApO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudmFyaWFibGVzX2dldF9zaWRlcyA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU3F1YXJlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3F1YXJlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKSB8fCAwO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgICAvLyBEb24ndCBjaGFuZ2UgaXQgd2l0aG91dCBjaGFuZ2luZyByZXF1aXJlZEJsb2Nrc18uXG4gICAgICAgICcvLyBkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc25vd21hblwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0b1xuICAvLyB1c2VycyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93bWFuID0ge1xuICAgIC8vIERyYXcgYSBjaXJjbGUgaW4gZnJvbnQgb2YgdGhlIHR1cnRsZSwgZW5kaW5nIHVwIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU25vd21hbigpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dtYW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc25vd21hbiBpbiBmcm9udCBvZiB0aGUgdHVydGxlLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGRpc3RhbmNlc1ZhciA9IGdlbnN5bSgnZGlzdGFuY2VzJyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50ZXInKTtcbiAgICB2YXIgZGVncmVlVmFyID0gZ2Vuc3ltKCdkZWdyZWUnKTtcbiAgICB2YXIgZGlzdGFuY2VWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlJyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgJy8vIGRyYXdfYV9zbm93bWFuJyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAndmFyICcgKyBkaXN0YW5jZXNWYXIgKyAnID0gWycgKyB2YWx1ZSArICcgKiAwLjUsICcgKyB2YWx1ZSArICcgKiAwLjMsJyArXG4gICAgICAgICAgdmFsdWUgKyAnICogMC4yXTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgIGxvb3BWYXIgKyAnKyspIHtcXG4nLFxuICAgICAgJyAgdmFyICcgKyBkaXN0YW5jZVZhciArICcgPSAnICsgZGlzdGFuY2VzVmFyICsgJ1snICsgbG9vcFZhciArXG4gICAgICAgICAgJyA8IDMgPyAnICsgbG9vcFZhciArICc6IDUgLSAnICsgbG9vcFZhciArICddIC8gNTcuNTsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGRlZ3JlZVZhciArICcgPSAwOyAnICsgZGVncmVlVmFyICsgJyA8IDkwOyAnICtcbiAgICAgICAgICBkZWdyZWVWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIGRpc3RhbmNlVmFyICsgJyk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCgyKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnICBpZiAoJyArIGxvb3BWYXIgKyAnICE9IDIpIHsnLFxuICAgICAgJyAgICBUdXJ0bGUudHVybkxlZnQoMTgwKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGEgbW9kaWZpZWQgY29weSBvZiBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3Igd2l0aCB0aGVcbiAgLy8gdmFyaWFibGUgbmFtZWQgXCJjb3VudGVyXCIgaGFyZGNvZGVkLlxuICBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3JfY291bnRlciA9IHtcbiAgICAvLyBGb3IgbG9vcCB3aXRoIGhhcmRjb2RlZCBsb29wIHZhcmlhYmxlLlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9XSVRIKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICdWQVInKTtcbiAgICAgIHRoaXMuaW50ZXJwb2xhdGVNc2coYmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0ZST01fVE9fQlksXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0ZST00nLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ1RPJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydCWScsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrbHkuQUxJR05fUklHSFQpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShCbG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfRE8pO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9UT09MVElQLnJlcGxhY2UoXG4gICAgICAgICAgJyUxJywgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKSkpO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH0sXG4gICAgY3VzdG9tQ29udGV4dE1lbnU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBvcHRpb24gPSB7ZW5hYmxlZDogdHJ1ZX07XG4gICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBvcHRpb24udGV4dCA9IGJsb2NrbHkuTXNnLlZBUklBQkxFU19TRVRfQ1JFQVRFX0dFVC5yZXBsYWNlKCclMScsIG5hbWUpO1xuICAgICAgdmFyIHhtbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGl0bGUnKTtcbiAgICAgIHhtbFRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5hbWUpKTtcbiAgICAgIHhtbFRpdGxlLnNldEF0dHJpYnV0ZSgnbmFtZScsICdWQVInKTtcbiAgICAgIHZhciB4bWxCbG9jayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jsb2NrJyk7XG4gICAgICB4bWxCbG9jay5hcHBlbmRDaGlsZCh4bWxUaXRsZSk7XG4gICAgICB4bWxCbG9jay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndmFyaWFibGVzX2dldF9jb3VudGVyJyk7XG4gICAgICBvcHRpb24uY2FsbGJhY2sgPSBibG9ja2x5LkNvbnRleHRNZW51LmNhbGxiYWNrRmFjdG9yeSh0aGlzLCB4bWxCbG9jayk7XG4gICAgICBvcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICB9LFxuICAgIC8vIHNlcmlhbGl6ZSB0aGUgY291bnRlciB2YXJpYWJsZSBuYW1lIHRvIHhtbCBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFjcm9zc1xuICAgIC8vIGRpZmZlcmVudCBsb2NhbGVzXG4gICAgbXV0YXRpb25Ub0RvbTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ211dGF0aW9uJyk7XG4gICAgICB2YXIgY291bnRlciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCdjb3VudGVyJywgY291bnRlcik7XG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG4gICAgLy8gZGVzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZVxuICAgIGRvbVRvTXV0YXRpb246IGZ1bmN0aW9uKHhtbEVsZW1lbnQpIHtcbiAgICAgIHZhciBjb3VudGVyID0geG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NvdW50ZXInKTtcbiAgICAgIHRoaXMuc2V0VGl0bGVWYWx1ZShjb3VudGVyLCAnVkFSJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jb250cm9sc19mb3JfY291bnRlciA9IGdlbmVyYXRvci5jb250cm9sc19mb3I7XG5cbiAgLy8gRGVsZXRlIHRoZXNlIHN0YW5kYXJkIGJsb2Nrcy5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcblxuICAvLyBHZW5lcmFsIGJsb2Nrcy5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5tb3ZlRm9yd2FyZCgpLCAnbW92ZUZvcndhcmQnXSxcbiAgICAgICBbbXNnLm1vdmVCYWNrd2FyZCgpLCAnbW92ZUJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIkxPTkdfTU9WRV9MRU5HVEhcIjtcbiAgdmFyIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIlNIT1JUX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaW1wbGVMZW5ndGhDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhdywgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3LCBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlXVxuICBdO1xuICB2YXIgc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhd1JpZ2h0LCBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdLFxuICAgIFtza2luLnNob3J0TGluZURyYXdSaWdodCwgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcblxuICB2YXIgU2ltcGxlTW92ZSA9IHtcbiAgICBERUZBVUxUX01PVkVfTEVOR1RIOiA1MCxcbiAgICBTSE9SVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgTE9OR19NT1ZFX0xFTkdUSDogMTAwLFxuICAgIERJUkVDVElPTl9DT05GSUdTOiB7XG4gICAgICBsZWZ0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlTGVmdCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlV2VzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4ud2VzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgcmlnaHQ6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25FYXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVSaWdodCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlRWFzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uZWFzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhSaWdodENob2ljZXNcbiAgICAgIH0sXG4gICAgICB1cDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVVcCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlTm9ydGhUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLm5vcnRoTGluZURyYXcsXG4gICAgICAgIGltYWdlRGltZW5zaW9uczoge3dpZHRoOiA3MiwgaGVpZ2h0OiA1Nn0sXG4gICAgICAgIGxlbmd0aHM6IHNpbXBsZUxlbmd0aENob2ljZXNcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uU291dGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZURvd24nLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVNvdXRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5zb3V0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAganVtcF9sZWZ0OiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25XZXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBMZWZ0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ubGVmdEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBXZXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9yaWdodDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wUmlnaHQnLFxuICAgICAgICBpbWFnZTogc2tpbi5yaWdodEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBFYXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF91cDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uTm9ydGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFVwJyxcbiAgICAgICAgaW1hZ2U6IHNraW4udXBKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wTm9ydGhUb29sdGlwKClcbiAgICAgIH0sXG4gICAgICBqdW1wX2Rvd246IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBEb3duJyxcbiAgICAgICAgaW1hZ2U6IHNraW4uZG93bkp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBTb3V0aFRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JBbGxEaXJlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJ1cFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJkb3duXCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcImxlZnRcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwicmlnaHRcIik7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbjogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX2p1bXBfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoJ2p1bXBfJyArIGRpcmVjdGlvbik7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbiArIFwiX2xlbmd0aFwiXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbiArICdfbGVuZ3RoJ10gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbik7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX2p1bXBfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVNb3ZlQmxvY2s6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgIHZhciBkaXJlY3Rpb25Db25maWcgPSBTaW1wbGVNb3ZlLkRJUkVDVElPTl9DT05GSUdTW2RpcmVjdGlvbl07XG4gICAgICB2YXIgZGlyZWN0aW9uTGV0dGVyV2lkdGggPSAxMjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlbHBVcmw6ICcnLFxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmlzSnVtcCkge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoY29tbW9uTXNnLmp1bXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoZGlyZWN0aW9uQ29uZmlnLnRpdGxlLCB7Zml4ZWRTaXplOiB7d2lkdGg6IGRpcmVjdGlvbkxldHRlcldpZHRoLCBoZWlnaHQ6IDE4fX0pKTtcblxuICAgICAgICAgIGlmIChkaXJlY3Rpb25Db25maWcuaW1hZ2VEaW1lbnNpb25zKSB7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKGRpcmVjdGlvbkNvbmZpZy5pbWFnZSxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy5oZWlnaHQpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXRUb29sdGlwKGRpcmVjdGlvbkNvbmZpZy50b29sdGlwKTtcbiAgICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihkaXJlY3Rpb25Db25maWcubGVuZ3Rocyk7XG4gICAgICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdsZW5ndGgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcbiAgICBnZW5lcmF0ZUNvZGVHZW5lcmF0b3I6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQsIGxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZW5ndGggPSBsZW5ndGggfHwgU2ltcGxlTW92ZS5ERUZBVUxUX01PVkVfTEVOR1RIO1xuXG4gICAgICAgIGlmIChoYXNMZW5ndGhJbnB1dCkge1xuICAgICAgICAgIGxlbmd0aCA9IFNpbXBsZU1vdmVbdGhpcy5nZXRUaXRsZVZhbHVlKFwibGVuZ3RoXCIpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1R1cnRsZS4nICsgU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dLm1vdmVGdW5jdGlvbiArICcoJyArIGxlbmd0aCArICcsJyArICdcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9ucygpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5qdW1wRm9yd2FyZCgpLCAnanVtcEZvcndhcmQnXSxcbiAgICAgICBbbXNnLmp1bXBCYWNrd2FyZCgpLCAnanVtcEJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5qdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IganVtcGluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCcxMDAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5qdW1wVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHNcbiAgICAvLyB3aXRob3V0IGRyYXdpbmcuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlclxuICAgIC8vIG9mIHBpeGVscyB3aXRob3V0IGRyYXdpbmcuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmp1bXBfYnlfY29uc3RhbnQ7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cudHVyblJpZ2h0KCksICd0dXJuUmlnaHQnXSxcbiAgICAgICBbbXNnLnR1cm5MZWZ0KCksICd0dXJuTGVmdCddXTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgLy8gdGhpcyBpcyB0aGUgb2xkIHZlcnNpb24gb2YgdGhpcyBibG9jaywgdGhhdCBzaG91bGQgb25seSBzdGlsbCBiZSB1c2VkIGluXG4gIC8vIG9sZCBzaGFyZWQgbGV2ZWxzXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGggPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIHBlbiB3aWR0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1dJRFRIJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRXaWR0aCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdXSURUSCcsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMSc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuV2lkdGgoJyArIHdpZHRoICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIGlubGluZWQgdmVyc2lvbiBvZiBkcmF3X3dpZHRoXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGhfaW5saW5lID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMScsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdXSURUSCcpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2lkdGhUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd193aWR0aF9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdXSURUSCcpO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3BlbiA9IHtcbiAgICAvLyBCbG9jayBmb3IgcGVuIHVwL2Rvd24uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1BFTicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGVuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4uU1RBVEUgPVxuICAgICAgW1ttc2cucGVuVXAoKSwgJ3BlblVwJ10sXG4gICAgICAgW21zZy5wZW5Eb3duKCksICdwZW5Eb3duJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHBlbiB1cC9kb3duLlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1BFTicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXIgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnQ09MT1VSJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5DT0xPVVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmFscGhhID0ge1xuICAgIC8vIFRPRE86XG4gICAgLy8gLSBBZGQgYWxwaGEgdG8gYSBncm91cFxuICAgIC8vIC0gTWFrZSBzdXJlIGl0IGRvZXNuJ3QgY291bnQgYWdhaW5zdCBjb3JyZWN0IHNvbHV0aW9uc1xuICAgIC8vXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0QWxwaGEoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoXCJWQUxVRVwiKVxuICAgICAgICAgIC5zZXRDaGVjayhcIk51bWJlclwiKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5hbHBoYSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxwaGEgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX05PTkUpO1xuICAgIHJldHVybiAnVHVydGxlLmdsb2JhbEFscGhhKCcgKyBhbHBoYSArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnQ09MT1VSJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2NvbG91cl9zaW1wbGUgPSB7XG4gICAgLy8gU2ltcGxpZmllZCBkcm9wZG93biBibG9jayBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbG91cnMgPSBbQ29sb3Vycy5SRUQsIENvbG91cnMuQkxBQ0ssIENvbG91cnMuUElOSywgQ29sb3Vycy5PUkFOR0UsXG4gICAgICAgIENvbG91cnMuWUVMTE9XLCBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHZhciBjb2xvdXJGaWVsZCA9IG5ldyBCbG9ja2x5LkZpZWxkQ29sb3VyRHJvcGRvd24oY29sb3VycywgNDUsIDM1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29sb3VyRmllbGQsICdDT0xPVVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2NvbG91cl9zaW1wbGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnQ09MT1VSJykgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cihcIicgKyBjb2xvdXIgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhbiBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRQYXR0ZXJuKCkpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZSggbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKFxuICAgICAgICAgICAgICBza2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLCAxNTAsIDIwICksICdWQUxVRScgKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGF0dGVybigpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbGluZV9zdHlsZV9wYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgaW1hZ2UgZm9yIGEgcGF0dGVybmVkIGxpbmUuXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgfHwgJ1xcJ0RFRkFVTFRcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlblBhdHRlcm4oXCInICsgcGF0dGVybiArICdcIiwgXFwnYmxvY2tfaWRfJyArXG4gICAgICAgIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnVwX2JpZyA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudXBfYmlnID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cignICsgY29sb3VyICsgJywgXFwnYmxvY2tfaWRfJyArXG4gICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eSA9IHtcbiAgICAvLyBCbG9jayBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2libGl0eS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1ZJU0lCSUxJVFknKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVydGxlVmlzaWJpbGl0eVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV92aXNpYmlsaXR5LlNUQVRFID1cbiAgICAgIFtbbXNnLmhpZGVUdXJ0bGUoKSwgJ2hpZGVUdXJ0bGUnXSxcbiAgICAgICBbbXNnLnNob3dUdXJ0bGUoKSwgJ3Nob3dUdXJ0bGUnXV07XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV92aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2liaWxpdHkuXG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVklTSUJJTElUWScpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLmRyYXdTdGFtcCgpKTtcbiAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuVkFMVUVTLCA1MCwgMzApO1xuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG5cbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZHJhd1N0YW1wKCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyBibG9jayBpcyBjdXJyZW50bHkgdW51c2VkLiBpZiB3ZSB3YW50IHRvIGFkZCBpdCBiYWNrIGluIHRoZSBmdXR1cmUsIGFkZFxuICAvLyBzdGFtcCBpbWFnZXMgaGVyZVxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfc3RhbXAuVkFMVUVTID0gc2tpbi5zdGFtcFZhbHVlcztcblxuICBnZW5lcmF0b3IudHVydGxlX3N0YW1wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnVHVydGxlLmRyYXdTdGFtcChcIicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgK1xuICAgICAgICAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBjdXN0b21MZXZlbEJsb2Nrcy5pbnN0YWxsKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gR2xvYmFscyB1c2VkIGluIHRoaXMgZmlsZTpcbi8vICBCbG9ja2x5XG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IFR1cnRsZSBHcmFwaGljcy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciB0dXJ0bGVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgU2xpZGVyID0gcmVxdWlyZSgnLi4vc2xpZGVyJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcblxudmFyIENBTlZBU19IRUlHSFQgPSA0MDA7XG52YXIgQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG52YXIgSk9JTlRfUkFESVVTID0gNDtcblxudmFyIFNNT09USF9BTklNQVRFX1NURVBfU0laRSA9IDU7XG52YXIgRkFTVF9TTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSAxNTtcblxuLyoqXG4qIE1pbmltdW0gam9pbnQgc2VnbWVudCBsZW5ndGhcbiovXG52YXIgSk9JTlRfU0VHTUVOVF9MRU5HVEggPSA1MDtcblxuLyoqXG4gKiBBbiB4IG9mZnNldCBhZ2FpbnN0IHRoZSBzcHJpdGUgZWRnZSB3aGVyZSB0aGUgZGVjb3JhdGlvbiBzaG91bGQgYmUgZHJhd24sXG4gKiBhbG9uZyB3aXRoIHdoZXRoZXIgaXQgc2hvdWxkIGJlIGRyYXduIGJlZm9yZSBvciBhZnRlciB0aGUgdHVydGxlIHNwcml0ZSBpdHNlbGYuXG4gKi9cbnZhciBFTFNBX0RFQ09SQVRJT05fREVUQUlMUyA9IFtcbiAgeyB4OiAxNSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogMjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDM3LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA0Niwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjAsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY1LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Niwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjQsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNTUsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiA0OCwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMzLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMzEsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAyMiwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDE3LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMTIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAgOCwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogMTAsIHdoZW46IFwiYWZ0ZXJcIiB9XG5dO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBBcnRpc3QgY2xhc3NcbiAqIEBwYXJhbSB7U3R1ZGlvQXBwfSBzdHVkaW9BcHAgVGhlIHN0dWRpb0FwcCBpbnN0YW5jZSB0byBidWlsZCB1cG9uLlxuICovXG52YXIgQXJ0aXN0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNraW4gPSBudWxsO1xuICB0aGlzLmxldmVsID0gbnVsbDtcblxuICB0aGlzLmFwaSA9IG5ldyBBcnRpc3RBUEkoKTtcblxuICAvLyBpbWFnZSBpY29ucyBhbmQgaW1hZ2UgcGF0aHMgZm9yIHRoZSAnc2V0IHBhdHRlcm4gYmxvY2snXG4gIHRoaXMubGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSBbXTtcbiAgdGhpcy5zdGFtcHMgPSBbXTtcblxuICAvLyBQSUQgb2YgYW5pbWF0aW9uIHRhc2sgY3VycmVudGx5IGV4ZWN1dGluZy5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNob3VsZCB0aGUgdHVydGxlIGJlIGRyYXduP1xuICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG4gIC8vIFNldCBhIHR1cnRsZSBoZWFkaW5nLlxuICB0aGlzLmhlYWRpbmcgPSAwO1xuXG4gIC8vIFRoZSBhdmF0YXIgaW1hZ2VcbiAgdGhpcy5hdmF0YXJJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBhdmF0YXIgYW5pbWF0aW9uIGRlY29yYXRpb24gaW1hZ2VcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAvLyBEcmF3aW5nIHdpdGggYSBwYXR0ZXJuXG4gIHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuID0gbmV3IEltYWdlKCk7XG4gIHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zID0gW107XG4gIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSBmYWxzZTtcblxuICAvLyB0aGVzZSBnZXQgc2V0IGJ5IGluaXQgYmFzZWQgb24gc2tpbi5cbiAgdGhpcy5hdmF0YXJXaWR0aCA9IDA7XG4gIHRoaXMuYXZhdGFySGVpZ2h0ID0gMDtcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGggPSA4NTtcbiAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0ID0gODU7XG4gIHRoaXMuc3BlZWRTbGlkZXIgPSBudWxsO1xuXG4gIHRoaXMuY3R4QW5zd2VyID0gbnVsbDtcbiAgdGhpcy5jdHhJbWFnZXMgPSBudWxsO1xuICB0aGlzLmN0eFByZWRyYXcgPSBudWxsO1xuICB0aGlzLmN0eFNjcmF0Y2ggPSBudWxsO1xuICB0aGlzLmN0eFBhdHRlcm4gPSBudWxsO1xuICB0aGlzLmN0eEZlZWRiYWNrID0gbnVsbDtcbiAgdGhpcy5jdHhEaXNwbGF5ID0gbnVsbDtcblxuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSBmYWxzZTtcbiAgdGhpcy5pc1ByZWRyYXdpbmdfID0gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFydGlzdDtcblxuXG4vKipcbiAqIHRvZG9cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIHR1cnRsZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFydGlzdCByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIC8vIFByZWxvYWQgc3RhbXAgaW1hZ2VzXG4gIHRoaXMuc3RhbXBzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5za2luLnN0YW1wVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuc2tpbi5zdGFtcFZhbHVlc1tpXVswXTtcbiAgICB2YXIga2V5ID0gdGhpcy5za2luLnN0YW1wVmFsdWVzW2ldWzFdO1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcuc3JjID0gdXJsO1xuICAgIHRoaXMuc3RhbXBzW2tleV0gPSBpbWc7XG4gIH1cblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIGxldCdzIHRyeSBhZGRpbmcgYSBiYWNrZ3JvdW5kIGltYWdlXG4gICAgdGhpcy5sZXZlbC5pbWFnZXMgPSBbe31dO1xuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLmZpbGVuYW1lID0gJ2JhY2tncm91bmQuanBnJztcblxuICAgIHRoaXMubGV2ZWwuaW1hZ2VzWzBdLnBvc2l0aW9uID0gWyAwLCAwIF07XG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0uc2NhbGUgPSAxO1xuICB9XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ3doZW5fcnVuJztcbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzM7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSAxMDA7XG4gIH1cbiAgZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDczO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gMTAwO1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoID0gODU7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0ID0gODU7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hdmF0YXJXaWR0aCA9IDcwO1xuICAgIHRoaXMuYXZhdGFySGVpZ2h0ID0gNTE7XG4gIH1cblxuICB2YXIgaWNvblBhdGggPSAnbWVkaWEvdHVydGxlLycgKyAoY29uZmlnLmlzTGVnYWN5U2hhcmUgJiYgY29uZmlnLmhpZGVTb3VyY2UgPyAnaWNvbnNfd2hpdGUucG5nJyA6ICdpY29ucy5wbmcnKTtcbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIHZpc3VhbGl6YXRpb246ICcnLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHthc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLCBpY29uUGF0aDogaWNvblBhdGh9KSxcbiAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogdGhpcy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgIGJsb2NrQ291bnRlckNsYXNzIDogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgfVxuICB9KTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gXy5iaW5kKHRoaXMubG9hZEF1ZGlvXywgdGhpcyk7XG4gIGNvbmZpZy5hZnRlckluamVjdCA9IF8uYmluZCh0aGlzLmFmdGVySW5qZWN0XywgdGhpcywgY29uZmlnKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5sb2FkQXVkaW9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xufTtcblxuLyoqXG4gKiBDb2RlIGNhbGxlZCBhZnRlciB0aGUgYmxvY2tseSBkaXYgKyBibG9ja2x5IGNvcmUgaXMgaW5qZWN0ZWQgaW50byB0aGUgZG9jdW1lbnRcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIC8vIEluaXRpYWxpemUgdGhlIHNsaWRlci5cbiAgdmFyIHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbGlkZXInKTtcbiAgdGhpcy5zcGVlZFNsaWRlciA9IG5ldyBTbGlkZXIoMTAsIDM1LCAxMzAsIHNsaWRlcik7XG5cbiAgLy8gQ2hhbmdlIGRlZmF1bHQgc3BlZWQgKGVnIFNwZWVkIHVwIGxldmVscyB0aGF0IGhhdmUgbG90cyBvZiBzdGVwcykuXG4gIGlmIChjb25maWcubGV2ZWwuc2xpZGVyU3BlZWQpIHtcbiAgICB0aGlzLnNwZWVkU2xpZGVyLnNldFZhbHVlKGNvbmZpZy5sZXZlbC5zbGlkZXJTcGVlZCk7XG4gIH1cblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdUdXJ0bGUsY29kZScpO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGhpZGRlbiBjYW52YXNlcy5cbiAgdGhpcy5jdHhBbnN3ZXIgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2Fuc3dlcicsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eEltYWdlcyA9IHRoaXMuY3JlYXRlQ2FudmFzXygnaW1hZ2VzJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4UHJlZHJhdyA9IHRoaXMuY3JlYXRlQ2FudmFzXygncHJlZHJhdycsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFNjcmF0Y2ggPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3NjcmF0Y2gnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhQYXR0ZXJuID0gdGhpcy5jcmVhdGVDYW52YXNfKCdwYXR0ZXJuJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4RmVlZGJhY2sgPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ2ZlZWRiYWNrJywgMTU0LCAxNTQpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLy8gQ3JlYXRlIGRpc3BsYXkgY2FudmFzLlxuICB2YXIgZGlzcGxheUNhbnZhcyA9IHRoaXMuY3JlYXRlQ2FudmFzXygnZGlzcGxheScsIDQwMCwgNDAwKTtcblxuICB2YXIgdmlzdWFsaXphdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uJyk7XG4gIHZpc3VhbGl6YXRpb24uYXBwZW5kQ2hpbGQoZGlzcGxheUNhbnZhcyk7XG4gIHRoaXMuY3R4RGlzcGxheSA9IGRpc3BsYXlDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAvLyBUT0RPIChici1wYWlyKTogLSBwdWxsIHRoaXMgb3V0P1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkgJiYgKHRoaXMuc2tpbi5pZCA9PT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09PSBcImVsc2FcIikpIHtcbiAgICAvLyBPdmVycmlkZSBjb2xvdXJfcmFuZG9tIHRvIG9ubHkgZ2VuZXJhdGUgcmFuZG9tIGNvbG9ycyBmcm9tIHdpdGhpbiBvdXIgZnJvemVuXG4gICAgLy8gcGFsZXR0ZVxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBjb2xvdXIuXG4gICAgICBpZiAoIUJsb2NrbHkuSmF2YVNjcmlwdC5kZWZpbml0aW9uc18uY29sb3VyX3JhbmRvbSkge1xuICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gQmxvY2tseS5KYXZhU2NyaXB0LnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShcbiAgICAgICAgICAnY29sb3VyX3JhbmRvbScsIEJsb2NrbHkuR2VuZXJhdG9yLk5BTUVfVFlQRSk7XG4gICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tLmZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZTtcbiAgICAgICAgdmFyIGZ1bmMgPSBbXTtcbiAgICAgICAgZnVuYy5wdXNoKCdmdW5jdGlvbiAnICsgZnVuY3Rpb25OYW1lICsgJygpIHsnKTtcbiAgICAgICAgZnVuYy5wdXNoKCcgICB2YXIgY29sb3JzID0gJyArIEpTT04uc3RyaW5naWZ5KEJsb2NrbHkuRmllbGRDb2xvdXIuQ09MT1VSUykgKyAnOycpO1xuICAgICAgICBmdW5jLnB1c2goJyAgcmV0dXJuIGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY29sb3JzLmxlbmd0aCldOycpO1xuICAgICAgICBmdW5jLnB1c2goJ30nKTtcbiAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LmRlZmluaXRpb25zXy5jb2xvdXJfcmFuZG9tID0gZnVuYy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb2RlID0gQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uZnVuY3Rpb25OYW1lICsgJygpJztcbiAgICAgIHJldHVybiBbY29kZSwgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX0ZVTkNUSU9OX0NBTExdO1xuICAgIH07XG4gIH1cblxuICB0aGlzLmxvYWREZWNvcmF0aW9uQW5pbWF0aW9uKCk7XG5cbiAgLy8gU2V0IHRoZWlyIGluaXRpYWwgY29udGVudHMuXG4gIHRoaXMubG9hZFR1cnRsZSgpO1xuICB0aGlzLmRyYXdJbWFnZXMoKTtcblxuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSB0cnVlO1xuICB0aGlzLmRyYXdBbnN3ZXIoKTtcbiAgdGhpcy5pc0RyYXdpbmdBbnN3ZXJfID0gZmFsc2U7XG5cbiAgaWYgKHRoaXMubGV2ZWwucHJlZHJhd0Jsb2Nrcykge1xuICAgIHRoaXMuaXNQcmVkcmF3aW5nXyA9IHRydWU7XG4gICAgdGhpcy5kcmF3QmxvY2tzT25DYW52YXModGhpcy5sZXZlbC5wcmVkcmF3QmxvY2tzLCB0aGlzLmN0eFByZWRyYXcpO1xuICAgIHRoaXMuaXNQcmVkcmF3aW5nXyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gcHJlLWxvYWQgaW1hZ2UgZm9yIGxpbmUgcGF0dGVybiBibG9jay4gQ3JlYXRpbmcgdGhlIGltYWdlIG9iamVjdCBhbmQgc2V0dGluZyBzb3VyY2UgZG9lc24ndCBzZWVtIHRvIGJlXG4gIC8vIGVub3VnaCBpbiB0aGlzIGNhc2UsIHNvIHdlJ3JlIGFjdHVhbGx5IGNyZWF0aW5nIGFuZCByZXVzaW5nIHRoZSBvYmplY3Qgd2l0aGluIHRoZSBkb2N1bWVudCBib2R5LlxuICB2YXIgaW1hZ2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgaW1hZ2VDb250YWluZXIuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2VDb250YWluZXIpO1xuXG4gIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5za2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLnNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnNbaV1bMV07XG4gICAgaWYgKHRoaXMuc2tpbltwYXR0ZXJuXSkge1xuICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1nLnNyYyA9IHRoaXMuc2tpbltwYXR0ZXJuXTtcbiAgICAgIHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dID0gaW1nO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xufTtcblxuLyoqXG4gKiBPbiBzdGFydHVwIGRyYXcgdGhlIGV4cGVjdGVkIGFuc3dlciBhbmQgc2F2ZSBpdCB0byB0aGUgYW5zd2VyIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3QW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmxldmVsLnNvbHV0aW9uQmxvY2tzKSB7XG4gICAgdGhpcy5kcmF3QmxvY2tzT25DYW52YXModGhpcy5sZXZlbC5zb2x1dGlvbkJsb2NrcywgdGhpcy5jdHhBbnN3ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZHJhd0xvZ09uQ2FudmFzKHRoaXMubGV2ZWwuYW5zd2VyLCB0aGlzLmN0eEFuc3dlcik7XG4gIH1cbn07XG5cbi8qKlxuICogR2l2ZW4gYSBzZXQgb2YgY29tbWFuZHMgYW5kIGEgY2FudmFzLCBkcmF3cyB0aGUgY29tbWFuZHMgb250byB0aGUgY2FudmFzXG4gKiBjb21wb3NpdGVkIG92ZXIgdGhlIHNjcmF0Y2ggY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdMb2dPbkNhbnZhcyA9IGZ1bmN0aW9uKGxvZywgY2FudmFzKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuICB3aGlsZSAobG9nLmxlbmd0aCkge1xuICAgIHZhciB0dXBsZSA9IGxvZy5zaGlmdCgpO1xuICAgIHRoaXMuc3RlcCh0dXBsZVswXSwgdHVwbGUuc3BsaWNlKDEpLCB7c21vb3RoQW5pbWF0ZTogZmFsc2V9KTtcbiAgICB0aGlzLnJlc2V0U3RlcEluZm9fKCk7XG4gIH1cbiAgY2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgY2FudmFzLmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcbiAgY2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlcyBibG9ja3Mgb3IgY29kZSwgYW5kIGRyYXdzIG9udG8gZ2l2ZW4gY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdCbG9ja3NPbkNhbnZhcyA9IGZ1bmN0aW9uKGJsb2Nrc09yQ29kZSwgY2FudmFzKSB7XG4gIHZhciBjb2RlO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgZG9tQmxvY2tzID0gQmxvY2tseS5YbWwudGV4dFRvRG9tKGJsb2Nrc09yQ29kZSk7XG4gICAgQmxvY2tseS5YbWwuZG9tVG9CbG9ja1NwYWNlKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UsIGRvbUJsb2Nrcyk7XG4gICAgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIHtcbiAgICBjb2RlID0gYmxvY2tzT3JDb2RlO1xuICB9XG4gIHRoaXMuZXZhbENvZGUoY29kZSk7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuY2xlYXIoKTtcbiAgfVxuICB0aGlzLmRyYXdDdXJyZW50QmxvY2tzT25DYW52YXMoY2FudmFzKTtcbn07XG5cbi8qKlxuICogRHJhd3MgdGhlIHJlc3VsdHMgb2YgYmxvY2sgZXZhbHVhdGlvbiAoc3RvcmVkIG9uIGFwaS5sb2cpIG9udG8gdGhlIGdpdmVuXG4gKiBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0N1cnJlbnRCbG9ja3NPbkNhbnZhcyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuICB0aGlzLmRyYXdMb2dPbkNhbnZhcyh0aGlzLmFwaS5sb2csIGNhbnZhcyk7XG59O1xuXG4vKipcbiAqIFBsYWNlIGFuIGltYWdlIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXG4gKiBDb2RlIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NDk1OTUyLiBUaGFua3MsIFBocm9nei5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSBSZWxhdGl2ZSBwYXRoIHRvIGltYWdlLlxuICogQHBhcmFtIHshQXJyYXl9IHBvc2l0aW9uIEFuIHgteSBwYWlyLlxuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbmFsIHNjYWxlIGF0IHdoaWNoIGltYWdlIGlzIGRyYXduXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucGxhY2VJbWFnZSA9IGZ1bmN0aW9uKGZpbGVuYW1lLCBwb3NpdGlvbiwgc2NhbGUpIHtcbiAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcub25sb2FkID0gXy5iaW5kKGZ1bmN0aW9uKCkge1xuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIGlmIChzY2FsZSkge1xuICAgICAgICB0aGlzLmN0eEltYWdlcy5kcmF3SW1hZ2UoaW1nLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0sIGltZy53aWR0aCxcbiAgICAgICAgICBpbWcuaGVpZ2h0LCAwLCAwLCBpbWcud2lkdGggKiBzY2FsZSwgaW1nLmhlaWdodCAqIHNjYWxlKTtcbiAgICAgIH0gZWxzZSAge1xuICAgICAgICB0aGlzLmN0eEltYWdlcy5kcmF3SW1hZ2UoaW1nLCBwb3NpdGlvblswXSwgcG9zaXRpb25bMV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRpc3BsYXkoKTtcbiAgfSwgdGhpcyk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBpbWcuc3JjID0gdGhpcy5za2luLmFzc2V0VXJsKGZpbGVuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpbWcuc3JjID0gdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsKCdtZWRpYS90dXJ0bGUvJyArIGZpbGVuYW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IHRoZSBpbWFnZXMgZm9yIHRoaXMgcGFnZSBhbmQgbGV2ZWwgb250byB0aGlzLmN0eEltYWdlcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3SW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5sZXZlbC5pbWFnZXMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxldmVsLmltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbWFnZSA9IHRoaXMubGV2ZWwuaW1hZ2VzW2ldO1xuICAgIHRoaXMucGxhY2VJbWFnZShpbWFnZS5maWxlbmFtZSwgaW1hZ2UucG9zaXRpb24sIGltYWdlLnNjYWxlKTtcbiAgfVxuICB0aGlzLmN0eEltYWdlcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcbiAgdGhpcy5jdHhJbWFnZXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbn07XG5cbi8qKlxuICogSW5pdGlhbCB0aGUgdHVydGxlIGltYWdlIG9uIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUubG9hZFR1cnRsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmF2YXRhckltYWdlLm9ubG9hZCA9IF8uYmluZCh0aGlzLmRpc3BsYXksIHRoaXMpO1xuXG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3JjID0gdGhpcy5za2luLmF2YXRhcjtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAzNjtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMTg7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDE4MDtcbiAgfVxuICB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodCA9IHRoaXMuYXZhdGFySGVpZ2h0O1xuICB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoID0gdGhpcy5hdmF0YXJXaWR0aDtcbn07XG5cbi8qKlxuICogSW5pdGlhbCB0aGUgdHVydGxlIGFuaW1hdGlvbiBkZW9jcmF0aW9uIG9uIGxvYWQuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUubG9hZERlY29yYXRpb25BbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLnNyYyA9IHRoaXMuc2tpbi5kZWNvcmF0aW9uQW5pbWF0aW9uO1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLmhlaWdodCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkhlaWdodDtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbldpZHRoO1xuICB9XG59O1xuXG52YXIgdHVydGxlRnJhbWUgPSAwO1xuXG5cbi8qKlxuICogRHJhdyB0aGUgdHVydGxlIGltYWdlIGJhc2VkIG9uIHRoaXMueCwgdGhpcy55LCBhbmQgdGhpcy5oZWFkaW5nLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdUdXJ0bGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNvdXJjZVk7XG4gIC8vIENvbXB1dGVzIHRoZSBpbmRleCBvZiB0aGUgaW1hZ2UgaW4gdGhlIHNwcml0ZS5cbiAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcih0aGlzLmhlYWRpbmcgKiB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC8gMzYwKTtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICAvLyB0aGUgcm90YXRpb25zIGluIHRoZSBzcHJpdGUgc2hlZXQgZ28gaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbi5cbiAgICBpbmRleCA9IHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLSBpbmRleDtcblxuICAgIC8vIGFuZCB0aGV5IGFyZSAxODAgZGVncmVlcyBvdXQgb2YgcGhhc2UuXG4gICAgaW5kZXggPSAoaW5kZXggKyB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzLzIpICUgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncztcbiAgfVxuICB2YXIgc291cmNlWCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGggKiBpbmRleDtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICBzb3VyY2VZID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQgKiB0dXJ0bGVGcmFtZTtcbiAgICB0dXJ0bGVGcmFtZSA9ICh0dXJ0bGVGcmFtZSArIDEpICUgdGhpcy5za2luLnR1cnRsZU51bUZyYW1lcztcbiAgfSBlbHNlIHtcbiAgICBzb3VyY2VZID0gMDtcbiAgfVxuICB2YXIgc291cmNlV2lkdGggPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoO1xuICB2YXIgc291cmNlSGVpZ2h0ID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQ7XG4gIHZhciBkZXN0V2lkdGggPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZVdpZHRoO1xuICB2YXIgZGVzdEhlaWdodCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0O1xuICB2YXIgZGVzdFggPSB0aGlzLnggLSBkZXN0V2lkdGggLyAyO1xuICB2YXIgZGVzdFkgPSB0aGlzLnkgLSBkZXN0SGVpZ2h0ICsgNztcblxuICBpZiAodGhpcy5hdmF0YXJJbWFnZS53aWR0aCA9PT0gMCB8fCB0aGlzLmF2YXRhckltYWdlLmhlaWdodCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzb3VyY2VYIDwgMCB8fFxuICAgICAgc291cmNlWSA8IDAgfHxcbiAgICAgIHNvdXJjZVggKyBzb3VyY2VXaWR0aCAgLTAgPiB0aGlzLmF2YXRhckltYWdlLndpZHRoIHx8XG4gICAgICBzb3VyY2VZICsgc291cmNlSGVpZ2h0ID4gdGhpcy5hdmF0YXJJbWFnZS5oZWlnaHQpXG4gIHtcbiAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuICAgICAgLy8gVE9ETyhiam9yZGFuKTogYXNrIEJyZW50LCBzdGFydGluZyB0byBmbG9vZCBncnVudCBtb2NoYVRlc3QgbWVzc2FnZXMsXG4gICAgICAvLyBiZXR0ZXIgZml4IGhlcmU/XG4gICAgICAvLyBjb25zb2xlLmxvZyhcImRyYXdJbWFnZSBpcyBvdXQgb2Ygc291cmNlIGJvdW5kcyFcIik7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmF2YXRhckltYWdlLndpZHRoICE9PSAwKSB7XG4gICAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZShcbiAgICAgIHRoaXMuYXZhdGFySW1hZ2UsXG4gICAgICBNYXRoLnJvdW5kKHNvdXJjZVgpLCBNYXRoLnJvdW5kKHNvdXJjZVkpLFxuICAgICAgc291cmNlV2lkdGggLSAwLCBzb3VyY2VIZWlnaHQsXG4gICAgICBNYXRoLnJvdW5kKGRlc3RYKSwgTWF0aC5yb3VuZChkZXN0WSksXG4gICAgICBkZXN0V2lkdGggLSAwLCBkZXN0SGVpZ2h0KTtcbiAgfVxufTtcblxuLyoqXG4gICogVGhpcyBpcyBjYWxsZWQgdHdpY2UsIG9uY2Ugd2l0aCBcImJlZm9yZVwiIGFuZCBvbmNlIHdpdGggXCJhZnRlclwiLCByZWZlcnJpbmcgdG8gYmVmb3JlIG9yIGFmdGVyXG4gICogdGhlIHNwcml0ZSBpcyBkcmF3bi4gIEZvciBzb21lIGFuZ2xlcyBpdCBzaG91bGQgYmUgZHJhd24gYmVmb3JlLCBhbmQgZm9yIHNvbWUgYWZ0ZXIuXG4gICovXG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0RlY29yYXRpb25BbmltYXRpb24gPSBmdW5jdGlvbih3aGVuKSB7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB2YXIgZnJhbWVJbmRleCA9ICh0dXJ0bGVGcmFtZSArIDEwKSAlIHRoaXMuc2tpbi5kZWNvcmF0aW9uQW5pbWF0aW9uTnVtRnJhbWVzO1xuXG4gICAgdmFyIGFuZ2xlSW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaGVhZGluZyAqIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLyAzNjApO1xuXG4gICAgLy8gdGhlIHJvdGF0aW9ucyBpbiB0aGUgQW5uYSAmIEVsc2Egc3ByaXRlIHNoZWV0cyBnbyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgIGFuZ2xlSW5kZXggPSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzIC0gYW5nbGVJbmRleDtcblxuICAgIC8vIGFuZCB0aGV5IGFyZSAxODAgZGVncmVlcyBvdXQgb2YgcGhhc2UuXG4gICAgYW5nbGVJbmRleCA9IChhbmdsZUluZGV4ICsgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncy8yKSAlIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3M7XG5cbiAgICBpZiAoRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFNbYW5nbGVJbmRleF0ud2hlbiA9PSB3aGVuKSB7XG4gICAgICB2YXIgc291cmNlWCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoICogZnJhbWVJbmRleDtcbiAgICAgIHZhciBzb3VyY2VZID0gMDtcbiAgICAgIHZhciBzb3VyY2VXaWR0aCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoO1xuICAgICAgdmFyIHNvdXJjZUhlaWdodCA9IHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLmhlaWdodDtcbiAgICAgIHZhciBkZXN0V2lkdGggPSBzb3VyY2VXaWR0aDtcbiAgICAgIHZhciBkZXN0SGVpZ2h0ID0gc291cmNlSGVpZ2h0O1xuICAgICAgdmFyIGRlc3RYID0gdGhpcy54IC0gZGVzdFdpZHRoIC8gMiAtIDE1IC0gMTUgKyBFTFNBX0RFQ09SQVRJT05fREVUQUlMU1thbmdsZUluZGV4XS54O1xuICAgICAgdmFyIGRlc3RZID0gdGhpcy55IC0gZGVzdEhlaWdodCAvIDIgLSAxMDA7XG5cbiAgICAgIGlmICh0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZS53aWR0aCAhPT0gMCkge1xuICAgICAgICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKFxuICAgICAgICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLFxuICAgICAgICAgIE1hdGgucm91bmQoc291cmNlWCksIE1hdGgucm91bmQoc291cmNlWSksXG4gICAgICAgICAgc291cmNlV2lkdGgsIHNvdXJjZUhlaWdodCxcbiAgICAgICAgICBNYXRoLnJvdW5kKGRlc3RYKSwgTWF0aC5yb3VuZChkZXN0WSksXG4gICAgICAgICAgZGVzdFdpZHRoLCBkZXN0SGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZXNldCB0aGUgdHVydGxlIHRvIHRoZSBzdGFydCBwb3NpdGlvbiwgY2xlYXIgdGhlIGRpc3BsYXksIGFuZCBraWxsIGFueVxuICogcGVuZGluZyB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlIFJlcXVpcmVkIGJ5IHRoZSBBUEkgYnV0IGlnbm9yZWQgYnkgdGhpc1xuICogICAgIGltcGxlbWVudGF0aW9uLlxuICovXG5BcnRpc3QucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGlnbm9yZSkge1xuICAvLyBTdGFuZGFyZCBzdGFydGluZyBsb2NhdGlvbiBhbmQgaGVhZGluZyBvZiB0aGUgdHVydGxlLlxuICB0aGlzLnggPSBDQU5WQVNfSEVJR0hUIC8gMjtcbiAgdGhpcy55ID0gQ0FOVkFTX1dJRFRIIC8gMjtcbiAgdGhpcy5oZWFkaW5nID0gdGhpcy5sZXZlbC5zdGFydERpcmVjdGlvbiAhPT0gdW5kZWZpbmVkID9cbiAgICAgIHRoaXMubGV2ZWwuc3RhcnREaXJlY3Rpb24gOiA5MDtcbiAgdGhpcy5wZW5Eb3duVmFsdWUgPSB0cnVlO1xuICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG4gIC8vIEZvciBzcGVjaWFsIGNhc2VzLCB1c2UgYSBkaWZmZXJlbnQgaW5pdGlhbCBsb2NhdGlvbi5cbiAgaWYgKHRoaXMubGV2ZWwuaW5pdGlhbFggIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMueCA9IHRoaXMubGV2ZWwuaW5pdGlhbFg7XG4gIH1cbiAgaWYgKHRoaXMubGV2ZWwuaW5pdGlhbFkgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMueSA9IHRoaXMubGV2ZWwuaW5pdGlhbFk7XG4gIH1cbiAgLy8gQ2xlYXIgdGhlIGRpc3BsYXkuXG4gIHRoaXMuY3R4U2NyYXRjaC5jYW52YXMud2lkdGggPSB0aGlzLmN0eFNjcmF0Y2guY2FudmFzLndpZHRoO1xuICB0aGlzLmN0eFBhdHRlcm4uY2FudmFzLndpZHRoID0gdGhpcy5jdHhQYXR0ZXJuLmNhbnZhcy53aWR0aDtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSAyO1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICdyZ2IoMjU1LDI1NSwyNTUpJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSAyO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJztcbiAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lV2lkdGggPSA1O1xuICB9XG5cbiAgdGhpcy5jdHhTY3JhdGNoLmxpbmVDYXAgPSAncm91bmQnO1xuICB0aGlzLmN0eFNjcmF0Y2guZm9udCA9ICdub3JtYWwgMThwdCBBcmlhbCc7XG4gIHRoaXMuZGlzcGxheSgpO1xuXG4gIC8vIENsZWFyIHRoZSBmZWVkYmFjay5cbiAgdGhpcy5jdHhGZWVkYmFjay5jbGVhclJlY3QoXG4gICAgICAwLCAwLCB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcy53aWR0aCwgdGhpcy5jdHhGZWVkYmFjay5jYW52YXMuaGVpZ2h0KTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5zZXRQYXR0ZXJuKFwiYW5uYUxpbmVcIik7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5zZXRQYXR0ZXJuKFwiZWxzYUxpbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgLy8gUmVzZXQgdG8gZW1wdHkgcGF0dGVyblxuICAgIHRoaXMuc2V0UGF0dGVybihudWxsKTtcbiAgfVxuXG4gIC8vIEtpbGwgYW55IHRhc2suXG4gIGlmICh0aGlzLnBpZCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5waWQpO1xuICB9XG4gIHRoaXMucGlkID0gMDtcblxuICAvLyBEaXNjYXJkIHRoZSBpbnRlcnByZXRlci5cbiAgdGhpcy5pbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuZXhlY3V0aW9uRXJyb3IgPSBudWxsO1xuXG4gIC8vIFN0b3AgdGhlIGxvb3Bpbmcgc291bmQuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuXG4gIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbn07XG5cblxuLyoqXG4gKiBDb3B5IHRoZSBzY3JhdGNoIGNhbnZhcyB0byB0aGUgZGlzcGxheSBjYW52YXMuIEFkZCBhIHR1cnRsZSBtYXJrZXIuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAvLyBGRiBvbiBsaW51eCByZXRhaW5zIGRyYXdpbmcgb2YgcHJldmlvdXMgbG9jYXRpb24gb2YgYXJ0aXN0IHVubGVzcyB3ZSBjbGVhclxuICAvLyB0aGUgY2FudmFzIGZpcnN0LlxuICB2YXIgc3R5bGUgPSB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlO1xuICB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgdGhpcy5jdHhEaXNwbGF5LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmN0eERpc3BsYXkuY2FudmFzLndpZHRoLFxuICAgIHRoaXMuY3R4RGlzcGxheS5jYW52YXMud2lkdGgpO1xuICB0aGlzLmN0eERpc3BsYXkuZmlsbFN0eWxlID0gc3R5bGU7XG5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgLy8gRHJhdyB0aGUgaW1hZ2VzIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eEltYWdlcy5jYW52YXMsIDAsIDApO1xuXG4gIC8vIERyYXcgdGhlIGFuc3dlciBsYXllci5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAwLjQ7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMC4xNTtcbiAgfVxuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4QW5zd2VyLmNhbnZhcywgMCwgMCk7XG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDE7XG5cbiAgLy8gRHJhdyB0aGUgcHJlZHJhdyBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhQcmVkcmF3LmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgcGF0dGVybiBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhQYXR0ZXJuLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgdXNlciBsYXllci5cbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhTY3JhdGNoLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgdHVydGxlLlxuICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgdGhpcy5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbihcImJlZm9yZVwiKTtcbiAgICB0aGlzLmRyYXdUdXJ0bGUoKTtcbiAgICB0aGlzLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uKFwiYWZ0ZXJcIik7XG4gIH1cbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgfVxuICB0aGlzLnN0dWRpb0FwcF8uYXR0ZW1wdHMrKztcbiAgdGhpcy5leGVjdXRlKCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmV2YWxDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgVHVydGxlOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNldCB1cCB0aGlzLmNvZGUsIHRoaXMuaW50ZXJwcmV0ZXIsIGV0Yy4gdG8gcnVuIGNvZGUgZm9yIGVkaXRDb2RlIGxldmVsc1xuICovXG5BcnRpc3QucHJvdG90eXBlLmdlbmVyYXRlVHVydGxlQ29kZUZyb21KU18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY29kZSA9IGRyb3BsZXRVdGlscy5nZW5lcmF0ZUNvZGVBbGlhc2VzKGRyb3BsZXRDb25maWcsICdUdXJ0bGUnKTtcbiAgdGhpcy51c2VyQ29kZVN0YXJ0T2Zmc2V0ID0gdGhpcy5jb2RlLmxlbmd0aDtcbiAgdGhpcy5jb2RlICs9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgdGhpcy51c2VyQ29kZUxlbmd0aCA9IHRoaXMuY29kZS5sZW5ndGggLSB0aGlzLnVzZXJDb2RlU3RhcnRPZmZzZXQ7XG5cbiAgdmFyIHNlc3Npb24gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmFjZUVkaXRvci5nZXRTZXNzaW9uKCk7XG4gIHRoaXMuY3VtdWxhdGl2ZUxlbmd0aCA9IGNvZGVnZW4uYWNlQ2FsY3VsYXRlQ3VtdWxhdGl2ZUxlbmd0aChzZXNzaW9uKTtcblxuICB2YXIgaW5pdEZ1bmMgPSBfLmJpbmQoZnVuY3Rpb24oaW50ZXJwcmV0ZXIsIHNjb3BlKSB7XG4gICAgY29kZWdlbi5pbml0SlNJbnRlcnByZXRlcihpbnRlcnByZXRlciwgbnVsbCwgbnVsbCwgc2NvcGUsIHtcbiAgICAgIFR1cnRsZTogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSwgdGhpcyk7XG4gIHRoaXMuaW50ZXJwcmV0ZXIgPSBuZXcgd2luZG93LkludGVycHJldGVyKHRoaXMuY29kZSwgaW5pdEZ1bmMpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmFwaS5sb2cgPSBbXTtcblxuICAvLyBSZXNldCB0aGUgZ3JhcGhpYy5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICB0aGlzLnN0dWRpb0FwcF8uaGFzRHVwbGljYXRlVmFyaWFibGVzSW5Gb3JMb29wcygpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdGhpcy5nZW5lcmF0ZVR1cnRsZUNvZGVGcm9tSlNfKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIC8vIGFwaS5sb2cgbm93IGNvbnRhaW5zIGEgdHJhbnNjcmlwdCBvZiBhbGwgdGhlIHVzZXIncyBhY3Rpb25zLlxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuICAvLyBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuXG4gIHRoaXMucGlkID0gd2luZG93LnNldFRpbWVvdXQoXy5iaW5kKHRoaXMuYW5pbWF0ZSwgdGhpcyksIDEwMCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgY2FzZTogaWYgd2UgaGF2ZSBhIHR1cm4sIGZvbGxvd2VkIGJ5IGEgbW92ZSBmb3J3YXJkLCB0aGVuIHdlIGNhbiBqdXN0XG4gKiBkbyB0aGUgdHVybiBpbnN0YW50bHkgYW5kIHRoZW4gYmVnaW4gdGhlIG1vdmUgZm9yd2FyZCBpbiB0aGUgc2FtZSBmcmFtZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja2ZvclR1cm5BbmRNb3ZlXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5leHRJc0ZvcndhcmQgPSBmYWxzZTtcblxuICB2YXIgY3VycmVudFR1cGxlID0gdGhpcy5hcGkubG9nWzBdO1xuICB2YXIgY3VycmVudENvbW1hbmQgPSBjdXJyZW50VHVwbGVbMF07XG4gIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFR1cGxlLnNsaWNlKDEpO1xuXG4gIC8vIENoZWNrIGZpcnN0IGZvciBhIHNtYWxsIHR1cm4gbW92ZW1lbnQuXG4gIGlmIChjdXJyZW50Q29tbWFuZCA9PT0gJ1JUJykge1xuICAgIHZhciBjdXJyZW50QW5nbGUgPSBjdXJyZW50VmFsdWVzWzBdO1xuICAgIGlmIChNYXRoLmFicyhjdXJyZW50QW5nbGUpIDw9IDEwKSB7XG4gICAgICAvLyBDaGVjayB0aGF0IG5leHQgY29tbWFuZCBpcyBhIG1vdmUgZm9yd2FyZC5cbiAgICAgIGlmICh0aGlzLmFwaS5sb2cubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgbmV4dFR1cGxlID0gdGhpcy5hcGkubG9nWzFdO1xuICAgICAgICB2YXIgbmV4dENvbW1hbmQgPSBuZXh0VHVwbGVbMF07XG4gICAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gJ0ZEJykge1xuICAgICAgICAgIG5leHRJc0ZvcndhcmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHRJc0ZvcndhcmQ7XG59O1xuXG5cbi8qKlxuICogQXR0ZW1wdCB0byBleGVjdXRlIG9uZSBjb21tYW5kIGZyb20gdGhlIGxvZyBvZiBBUEkgY29tbWFuZHMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZVR1cGxlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXBpLmxvZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZXhlY3V0ZVNlY29uZFR1cGxlO1xuXG4gIGRvIHtcbiAgICAvLyBVbmxlc3Mgc29tZXRoaW5nIHNwZWNpYWwgaGFwcGVucywgd2Ugd2lsbCBqdXN0IGV4ZWN1dGUgYSBzaW5nbGUgdHVwbGUuXG4gICAgZXhlY3V0ZVNlY29uZFR1cGxlID0gZmFsc2U7XG5cbiAgICB2YXIgdHVwbGUgPSB0aGlzLmFwaS5sb2dbMF07XG4gICAgdmFyIGNvbW1hbmQgPSB0dXBsZVswXTtcbiAgICB2YXIgaWQgPSB0dXBsZVt0dXBsZS5sZW5ndGgtMV07XG5cbiAgICB0aGlzLnN0dWRpb0FwcF8uaGlnaGxpZ2h0KFN0cmluZyhpZCkpO1xuXG4gICAgLy8gU2hvdWxkIHdlIGV4ZWN1dGUgYW5vdGhlciB0dXBsZSBpbiB0aGlzIGZyYW1lIG9mIGFuaW1hdGlvbj9cbiAgICBpZiAodGhpcy5za2luLmNvbnNvbGlkYXRlVHVybkFuZE1vdmUgJiYgdGhpcy5jaGVja2ZvclR1cm5BbmRNb3ZlXygpKSB7XG4gICAgICBleGVjdXRlU2Vjb25kVHVwbGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgc21vb3RoIGFuaW1hdGUgZm9yIEFubmEgJiBFbHNhLCBhbmQgb25seSBpZiB0aGVyZSBpcyBub3QgYW5vdGhlciB0dXBsZSB0byBiZSBkb25lLlxuICAgIHZhciB0dXBsZURvbmUgPSB0aGlzLnN0ZXAoY29tbWFuZCwgdHVwbGUuc2xpY2UoMSksIHtzbW9vdGhBbmltYXRlOiB0aGlzLnNraW4uc21vb3RoQW5pbWF0ZSAmJiAhZXhlY3V0ZVNlY29uZFR1cGxlfSk7XG4gICAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgICBpZiAodHVwbGVEb25lKSB7XG4gICAgICB0aGlzLmFwaS5sb2cuc2hpZnQoKTtcbiAgICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgICB9XG4gIH0gd2hpbGUgKGV4ZWN1dGVTZWNvbmRUdXBsZSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogSXRlcmF0ZSB0aHJvdWdoIHRoZSByZWNvcmRlZCBwYXRoIGFuZCBhbmltYXRlIHRoZSB0dXJ0bGUncyBhY3Rpb25zLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBBbGwgdGFza3Mgc2hvdWxkIGJlIGNvbXBsZXRlIG5vdy4gIENsZWFuIHVwIHRoZSBQSUQgbGlzdC5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNjYWxlIHRoZSBzcGVlZCBub24tbGluZWFybHksIHRvIGdpdmUgYmV0dGVyIHByZWNpc2lvbiBhdCB0aGUgZmFzdCBlbmQuXG4gIHZhciBzdGVwU3BlZWQgPSAxMDAwICogTWF0aC5wb3coMSAtIHRoaXMuc3BlZWRTbGlkZXIuZ2V0VmFsdWUoKSwgMikgLyB0aGlzLnNraW4uc3BlZWRNb2RpZmllcjtcblxuICAvLyB3aGVuIHNtb290aEFuaW1hdGUgaXMgdHJ1ZSwgd2UgZGl2aWRlIGxvbmcgc3RlcHMgaW50byBwYXJ0aXRpb25zIG9mIHRoaXNcbiAgLy8gc2l6ZS5cbiAgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPSAoc3RlcFNwZWVkID09PSAwID9cbiAgICBGQVNUX1NNT09USF9BTklNQVRFX1NURVBfU0laRSA6IFNNT09USF9BTklNQVRFX1NURVBfU0laRSk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB2YXIgc3RlcHBlZCA9IHRydWU7XG4gICAgd2hpbGUgKHN0ZXBwZWQpIHtcbiAgICAgIGNvZGVnZW4uc2VsZWN0Q3VycmVudENvZGUodGhpcy5pbnRlcnByZXRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdW11bGF0aXZlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJDb2RlU3RhcnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlckNvZGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3RlcHBlZCA9IHRoaXMuaW50ZXJwcmV0ZXIuc3RlcCgpO1xuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIFRPRE8gKGNwaXJpY2gpOiBwb3B1bGF0ZSBsaW5lTnVtYmVyIGFzIHdlIGRvIGZvciBzdHVkaW8vYXBwbGFiOlxuICAgICAgICB0aGlzLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogMSB9O1xuICAgICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc3RlcHBlZCA9IHRoaXMuaW50ZXJwcmV0ZXIuc3RlcCgpO1xuXG4gICAgICBpZiAodGhpcy5leGVjdXRlVHVwbGVfKCkpIHtcbiAgICAgICAgLy8gV2Ugc3RlcHBlZCBmYXIgZW5vdWdoIHRoYXQgd2UgZXhlY3V0ZWQgYSBjb21tbWFuZCwgYnJlYWsgb3V0OlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzdGVwcGVkICYmICF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgLy8gV2UgZHJvcHBlZCBvdXQgb2YgdGhlIHN0ZXAgbG9vcCBiZWNhdXNlIHdlIHJhbiBvdXQgb2YgY29kZSwgYWxsIGRvbmU6XG4gICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5waWQgPSB3aW5kb3cuc2V0VGltZW91dChfLmJpbmQodGhpcy5hbmltYXRlLCB0aGlzKSwgc3RlcFNwZWVkKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRpc3RhbmNlKSB7XG4gIHZhciB0dXBsZURvbmUgPSB0cnVlO1xuICB2YXIgc3RlcERpc3RhbmNlQ292ZXJlZCA9IHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZDtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNtb290aEFuaW1hdGUpIHtcbiAgICB2YXIgZnVsbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdmFyIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuXG4gICAgaWYgKGZ1bGxEaXN0YW5jZSA8IDApIHtcbiAgICAgIC8vIEdvaW5nIGJhY2t3YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBzbW9vdGhBbmltYXRlU3RlcFNpemUgPD0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSAtc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkIC09IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgdHVwbGVEb25lID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR29pbmcgZm93YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgKyBzbW9vdGhBbmltYXRlU3RlcFNpemUgPj0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgKz0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICB0dXBsZURvbmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuXG4gIHJldHVybiB7IHR1cGxlRG9uZTogdHVwbGVEb25lLCBkaXN0YW5jZTogZGlzdGFuY2UgfTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBvbmUgc3RlcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIExvZ28tc3R5bGUgY29tbWFuZCAoZS5nLiAnRkQnIG9yICdSVCcpLlxuICogQHBhcmFtIHshQXJyYXl9IHZhbHVlcyBMaXN0IG9mIGFyZ3VtZW50cyBmb3IgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhY3Rpb24gSG93IG11Y2ggb2YgdGhpcyBzdGVwJ3MgZGlzdGFuY2UgZG8gd2UgZHJhdz9cbiAqIEBwYXJhbSB7b2JqZWN0fSBzaW5nbGUgb3B0aW9uIGZvciBub3c6IHNtb290aEFuaW1hdGUgKHRydWUvZmFsc2UpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKGNvbW1hbmQsIHZhbHVlcywgb3B0aW9ucykge1xuICB2YXIgdHVwbGVEb25lID0gdHJ1ZTtcbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGRpc3RhbmNlO1xuICB2YXIgaGVhZGluZztcblxuICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICBjYXNlICdGRCc6ICAvLyBGb3J3YXJkXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5tb3ZlRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0pGJzogIC8vIEp1bXAgZm9yd2FyZFxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuanVtcEZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNVic6ICAvLyBNb3ZlIChkaXJlY3Rpb24pXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIGhlYWRpbmcgPSB2YWx1ZXNbMV07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuc2V0SGVhZGluZ18oaGVhZGluZyk7XG4gICAgICB0aGlzLm1vdmVGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSkQnOiAgLy8gSnVtcCAoZGlyZWN0aW9uKVxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICBoZWFkaW5nID0gdmFsdWVzWzFdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnNldEhlYWRpbmdfKGhlYWRpbmcpO1xuICAgICAgdGhpcy5qdW1wRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1JUJzogIC8vIFJpZ2h0IFR1cm5cbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnR1cm5CeURlZ3JlZXNfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdEUCc6ICAvLyBEcmF3IFByaW50XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gucm90YXRlKDIgKiBNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDM2MCk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZmlsbFRleHQodmFsdWVzWzBdLCAwLCAwKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHQSc6ICAvLyBHbG9iYWwgQWxwaGFcbiAgICAgIHZhciBhbHBoYSA9IHZhbHVlc1swXTtcbiAgICAgIGFscGhhID0gTWF0aC5tYXgoMCwgYWxwaGEpO1xuICAgICAgYWxwaGEgPSBNYXRoLm1pbigxMDAsIGFscGhhKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5nbG9iYWxBbHBoYSA9IGFscGhhIC8gMTAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnREYnOiAgLy8gRHJhdyBGb250XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZm9udCA9IHZhbHVlc1syXSArICcgJyArIHZhbHVlc1sxXSArICdwdCAnICsgdmFsdWVzWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFUnOiAgLy8gUGVuIFVwXG4gICAgICB0aGlzLnBlbkRvd25WYWx1ZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEQnOiAgLy8gUGVuIERvd25cbiAgICAgIHRoaXMucGVuRG93blZhbHVlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BXJzogIC8vIFBlbiBXaWR0aFxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IHZhbHVlc1swXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BDJzogIC8vIFBlbiBDb2xvdXJcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2VTdHlsZSA9IHZhbHVlc1swXTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSB2YWx1ZXNbMF07XG4gICAgICBpZiAodGhpcy5za2luLmlkICE9IFwiYW5uYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImVsc2FcIikge1xuICAgICAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQUyc6ICAvLyBQZW4gc3R5bGUgd2l0aCBpbWFnZVxuICAgICAgaWYgKCF2YWx1ZXNbMF0gfHwgdmFsdWVzWzBdID09ICdERUZBVUxUJykge1xuICAgICAgICAgIHRoaXMuc2V0UGF0dGVybihudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0UGF0dGVybih2YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSFQnOiAgLy8gSGlkZSBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1QnOiAgLy8gU2hvdyBUdXJ0bGVcbiAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFtcCc6XG4gICAgICB2YXIgaW1nID0gdGhpcy5zdGFtcHNbdmFsdWVzWzBdXTtcbiAgICAgIHZhciB3aWR0aCA9IGltZy53aWR0aCAvIDI7XG4gICAgICB2YXIgaGVpZ2h0ID0gaW1nLmhlaWdodCAvIDI7XG4gICAgICB2YXIgeCA9IHRoaXMueCAtIHdpZHRoIC8gMjtcbiAgICAgIHZhciB5ID0gdGhpcy55IC0gaGVpZ2h0IC8gMjtcbiAgICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdHVwbGVEb25lO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zZXRQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgaWYgKHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuanVtcEZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHRoaXMueCArPSBkaXN0YW5jZSAqIE1hdGguc2luKDIgKiBNYXRoLlBJICogdGhpcy5oZWFkaW5nIC8gMzYwKTtcbiAgdGhpcy55IC09IGRpc3RhbmNlICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiB0aGlzLmhlYWRpbmcgLyAzNjApO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlQnlSZWxhdGl2ZVBvc2l0aW9uXyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueCArPSB4O1xuICB0aGlzLnkgKz0geTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZG90QXRfID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgLy8gV2ViS2l0ICh1bmxpa2UgR2Vja28pIGRyYXdzIG5vdGhpbmcgZm9yIGEgemVyby1sZW5ndGggbGluZSwgc28gZHJhdyBhIHZlcnkgc2hvcnQgbGluZS5cbiAgdmFyIGRvdExpbmVMZW5ndGggPSAwLjE7XG4gIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8oeCArIGRvdExpbmVMZW5ndGgsIHkpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5jaXJjbGVBdF8gPSBmdW5jdGlvbiAoeCwgeSwgcmFkaXVzKSB7XG4gIHRoaXMuY3R4U2NyYXRjaC5hcmMoeCwgeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmRyYXdUb1R1cnRsZV8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIGlzRG90ID0gKGRpc3RhbmNlID09PSAwKTtcbiAgaWYgKGlzRG90KSB7XG4gICAgdGhpcy5kb3RBdF8odGhpcy54LCB0aGlzLnkpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5saW5lVG8odGhpcy54LCB0aGlzLnkpO1xuICB9XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnR1cm5CeURlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXNSaWdodCkge1xuICB0aGlzLnNldEhlYWRpbmdfKHRoaXMuaGVhZGluZyArIGRlZ3JlZXNSaWdodCk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLnNldEhlYWRpbmdfID0gZnVuY3Rpb24gKGhlYWRpbmcpIHtcbiAgaGVhZGluZyA9IHRoaXMuY29uc3RyYWluRGVncmVlc18oaGVhZGluZyk7XG4gIHRoaXMuaGVhZGluZyA9IGhlYWRpbmc7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNvbnN0cmFpbkRlZ3JlZXNfID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgZGVncmVlcyAlPSAzNjA7XG4gIGlmIChkZWdyZWVzIDwgMCkge1xuICAgIGRlZ3JlZXMgKz0gMzYwO1xuICB9XG4gIHJldHVybiBkZWdyZWVzO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5tb3ZlRm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgaWYgKCF0aGlzLnBlbkRvd25WYWx1ZSkge1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4pIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZVdpdGhQYXR0ZXJuXyhkaXN0YW5jZSk7XG5cbiAgICAvLyBGcm96ZW4gZ2V0cyBib3RoIGEgcGF0dGVybiBhbmQgYSBsaW5lIG92ZXIgdGhlIHRvcCBvZiBpdC5cbiAgICBpZiAodGhpcy5za2luLmlkICE9IFwiZWxzYVwiICYmIHRoaXMuc2tpbi5pZCAhPSBcImFubmFcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZHJhd0ZvcndhcmRfKGRpc3RhbmNlKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIGlmICh0aGlzLnNob3VsZERyYXdKb2ludHNfKCkpIHtcbiAgICB0aGlzLmRyYXdGb3J3YXJkV2l0aEpvaW50c18oZGlzdGFuY2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lXyhkaXN0YW5jZSk7XG4gIH1cbn07XG5cbi8qKlxuICogRHJhd3MgYSBsaW5lIG9mIGxlbmd0aCBgZGlzdGFuY2VgLCBhZGRpbmcgam9pbnQga25vYnMgYWxvbmcgdGhlIHdheVxuICogQHBhcmFtIGRpc3RhbmNlXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRXaXRoSm9pbnRzXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgcmVtYWluaW5nRGlzdGFuY2UgPSBkaXN0YW5jZTtcblxuICB3aGlsZSAocmVtYWluaW5nRGlzdGFuY2UgPiAwKSB7XG4gICAgdmFyIGVub3VnaEZvckZ1bGxTZWdtZW50ID0gcmVtYWluaW5nRGlzdGFuY2UgPj0gSk9JTlRfU0VHTUVOVF9MRU5HVEg7XG4gICAgdmFyIGN1cnJlbnRTZWdtZW50TGVuZ3RoID0gZW5vdWdoRm9yRnVsbFNlZ21lbnQgPyBKT0lOVF9TRUdNRU5UX0xFTkdUSCA6IHJlbWFpbmluZ0Rpc3RhbmNlO1xuXG4gICAgcmVtYWluaW5nRGlzdGFuY2UgLT0gY3VycmVudFNlZ21lbnRMZW5ndGg7XG5cbiAgICBpZiAoZW5vdWdoRm9yRnVsbFNlZ21lbnQpIHtcbiAgICAgIHRoaXMuZHJhd0pvaW50QXRUdXJ0bGVfKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVfKGN1cnJlbnRTZWdtZW50TGVuZ3RoKTtcblxuICAgIGlmIChlbm91Z2hGb3JGdWxsU2VnbWVudCkge1xuICAgICAgdGhpcy5kcmF3Sm9pbnRBdFR1cnRsZV8oKTtcbiAgICB9XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy5zdGVwU3RhcnRYLCB0aGlzLnN0ZXBTdGFydFkpO1xuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmRyYXdUb1R1cnRsZV8oZGlzdGFuY2UpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5zdHJva2UoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuZHJhd1RvVHVydGxlXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xuICB9XG5cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0ZvcndhcmRMaW5lV2l0aFBhdHRlcm5fID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciBpbWc7XG4gIHZhciBzdGFydFg7XG4gIHZhciBzdGFydFk7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFBhdHRlcm4ubW92ZVRvKHRoaXMuc3RlcFN0YXJ0WCwgdGhpcy5zdGVwU3RhcnRZKTtcbiAgICBpbWcgPSB0aGlzLmN1cnJlbnRQYXRoUGF0dGVybjtcbiAgICBzdGFydFggPSB0aGlzLnN0ZXBTdGFydFg7XG4gICAgc3RhcnRZID0gdGhpcy5zdGVwU3RhcnRZO1xuXG4gICAgdmFyIGxpbmVEaXN0YW5jZSA9IE1hdGguYWJzKHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCk7XG5cbiAgICB0aGlzLmN0eFBhdHRlcm4uc2F2ZSgpO1xuICAgIHRoaXMuY3R4UGF0dGVybi50cmFuc2xhdGUoc3RhcnRYLCBzdGFydFkpO1xuICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGUgYW5kIHJvdGF0ZSB0aGUgaW1hZ2UuXG4gICAgLy8gTmVlZCB0byBzdWJ0cmFjdCA5MCB0byBhY2NvbW9kYXRlIGRpZmZlcmVuY2UgaW4gY2FudmFzIHZzLiBUdXJ0bGUgZGlyZWN0aW9uXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnJvdGF0ZShNYXRoLlBJICogKHRoaXMuaGVhZGluZyAtIDkwKSAvIDE4MCk7XG5cbiAgICB2YXIgY2xpcFNpemU7XG4gICAgaWYgKGxpbmVEaXN0YW5jZSAlIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplID09PSAwKSB7XG4gICAgICBjbGlwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgIH0gZWxzZSBpZiAobGluZURpc3RhbmNlID4gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUpIHtcbiAgICAgIC8vIHRoaXMgaGFwcGVucyB3aGVuIG91ciBsaW5lIHdhcyBub3QgZGl2aXNpYmxlIGJ5IHNtb290aEFuaW1hdGVTdGVwU2l6ZVxuICAgICAgLy8gYW5kIHdlJ3ZlIGhpdCBvdXIgbGFzdCBjaHVua1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2UgJSB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xpcFNpemUgPSBsaW5lRGlzdGFuY2U7XG4gICAgfVxuICAgIGlmIChpbWcud2lkdGggIT09IDApIHtcbiAgICAgIHRoaXMuY3R4UGF0dGVybi5kcmF3SW1hZ2UoaW1nLFxuICAgICAgICAvLyBTdGFydCBwb2ludCBmb3IgY2xpcHBpbmcgaW1hZ2VcbiAgICAgICAgTWF0aC5yb3VuZChsaW5lRGlzdGFuY2UpLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGNsaXBTaXplLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBzb21lIG15c3RlcmlvdXMgaGFuZC10d2Vha2luZyBkb25lIGJ5IEJyZW5kYW5cbiAgICAgICAgTWF0aC5yb3VuZCgodGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkIC0gY2xpcFNpemUgLSAyKSksIE1hdGgucm91bmQoKC0gMTgpKSxcbiAgICAgICAgY2xpcFNpemUsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4UGF0dGVybi5yZXN0b3JlKCk7XG5cbiAgfSBlbHNlIHtcblxuICAgIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICAgIGltZyA9IHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuO1xuICAgIHN0YXJ0WCA9IHRoaXMueDtcbiAgICBzdGFydFkgPSB0aGlzLnk7XG5cbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnNhdmUoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gudHJhbnNsYXRlKHN0YXJ0WCwgc3RhcnRZKTtcbiAgICAvLyBpbmNyZW1lbnQgdGhlIGFuZ2xlIGFuZCByb3RhdGUgdGhlIGltYWdlLlxuICAgIC8vIE5lZWQgdG8gc3VidHJhY3QgOTAgdG8gYWNjb21vZGF0ZSBkaWZmZXJlbmNlIGluIGNhbnZhcyB2cy4gVHVydGxlIGRpcmVjdGlvblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yb3RhdGUoTWF0aC5QSSAqICh0aGlzLmhlYWRpbmcgLSA5MCkgLyAxODApO1xuXG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsXG4gICAgICAgIC8vIFN0YXJ0IHBvaW50IGZvciBjbGlwcGluZyBpbWFnZVxuICAgICAgICAwLCAwLFxuICAgICAgICAvLyBjbGlwIHJlZ2lvbiBzaXplXG4gICAgICAgIGRpc3RhbmNlK2ltZy5oZWlnaHQgLyAyLCBpbWcuaGVpZ2h0LFxuICAgICAgICAvLyBkcmF3IGxvY2F0aW9uIHJlbGF0aXZlIHRvIHRoZSBjdHgudHJhbnNsYXRlIHBvaW50IHByZS1yb3RhdGlvblxuICAgICAgICAtaW1nLmhlaWdodCAvIDQsIC1pbWcuaGVpZ2h0IC8gMixcbiAgICAgICAgZGlzdGFuY2UraW1nLmhlaWdodCAvIDIsIGltZy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4U2NyYXRjaC5yZXN0b3JlKCk7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2hvdWxkRHJhd0pvaW50c18gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmxldmVsLmlzSzEgJiYgIXRoaXMuaXNQcmVkcmF3aW5nXztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd0pvaW50QXRUdXJ0bGVfID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gIHRoaXMuY3R4U2NyYXRjaC5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xuICB0aGlzLmNpcmNsZUF0Xyh0aGlzLngsIHRoaXMueSwgSk9JTlRfUkFESVVTKTtcbiAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB3aGV0aGVyIHRoZSB1c2VyJ3MgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyB0aGF0IGFyZSB3cm9uZy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwZXJtaXR0ZWRFcnJvcnMgTnVtYmVyIG9mIHBpeGVscyBhbGxvd2VkIHRvIGJlIHdyb25nLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbGV2ZWwgaXMgc29sdmVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuaXNDb3JyZWN0XyA9IGZ1bmN0aW9uIChwaXhlbEVycm9ycywgcGVybWl0dGVkRXJyb3JzKSB7XG4gIHJldHVybiBwaXhlbEVycm9ycyA8PSBwZXJtaXR0ZWRFcnJvcnM7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmZWVkYmFja0ltYWdlQ2FudmFzO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIEZvciBmcm96ZW4gc2tpbnMsIHNob3cgYmFja2dyb3VuZCBhbmQgY2hhcmFjdGVycyBhbG9uZyB3aXRoIGRyYXdpbmdcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhEaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eFNjcmF0Y2g7XG4gIH1cblxuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ3R1cnRsZScsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5pbXByZXNzaXZlKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiB0dXJ0bGVNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IHR1cnRsZU1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5BcnRpc3QucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLnN0dWRpb0FwcF8ub25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSk7XG4gIHRoaXMuZGlzcGxheUZlZWRiYWNrXygpO1xufTtcblxuLy8gVGhpcyByZW1vdmVzIGxlbmd0aHMgZnJvbSB0aGUgdGV4dCB2ZXJzaW9uIG9mIHRoZSBYTUwgb2YgcHJvZ3JhbXMuXG4vLyBJdCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgdXNlciBwcm9ncmFtIGFuZCBtb2RlbCBzb2x1dGlvbiBhcmVcbi8vIGlkZW50aWNhbCBleGNlcHQgZm9yIGxlbmd0aHMuXG52YXIgcmVtb3ZlSzFMZW5ndGhzID0gZnVuY3Rpb24ocykge1xuICByZXR1cm4gcy5yZXBsYWNlKHJlbW92ZUsxTGVuZ3Rocy5yZWdleCwgJ1wiPicpO1xufTtcblxucmVtb3ZlSzFMZW5ndGhzLnJlZ2V4ID0gL19sZW5ndGhcIj48dGl0bGUgbmFtZT1cImxlbmd0aFwiPi4qPzxcXC90aXRsZT4vO1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIC8vIENvbXBhcmUgdGhlIEFscGhhIChvcGFjaXR5KSBieXRlIG9mIGVhY2ggcGl4ZWwgaW4gdGhlIHVzZXIncyBpbWFnZSBhbmRcbiAgLy8gdGhlIHNhbXBsZSBhbnN3ZXIgaW1hZ2UuXG4gIHZhciB1c2VySW1hZ2UgPVxuICAgICAgdGhpcy5jdHhTY3JhdGNoLmdldEltYWdlRGF0YSgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xuICB2YXIgYW5zd2VySW1hZ2UgPVxuICAgICAgdGhpcy5jdHhBbnN3ZXIuZ2V0SW1hZ2VEYXRhKDAsIDAsIENBTlZBU19XSURUSCwgQ0FOVkFTX0hFSUdIVCk7XG4gIHZhciBsZW4gPSBNYXRoLm1pbih1c2VySW1hZ2UuZGF0YS5sZW5ndGgsIGFuc3dlckltYWdlLmRhdGEubGVuZ3RoKTtcbiAgdmFyIGRlbHRhID0gMDtcbiAgLy8gUGl4ZWxzIGFyZSBpbiBSR0JBIGZvcm1hdC4gIE9ubHkgY2hlY2sgdGhlIEFscGhhIGJ5dGVzLlxuICBmb3IgKHZhciBpID0gMzsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgLy8gQ29weWluZyBhbmQgY29tcG9zaXRpbmcgaW1hZ2VzIGFjcm9zcyBjYW52YXNlcyBzZWVtcyB0byBkaXN0b3J0IHRoZVxuICAgIC8vIGFscGhhLiBVc2UgYSBsYXJnZSBlcnJvciB2YWx1ZSAoMjUwKSB0byBjb21wZW5zYXRlLlxuICAgIGlmIChNYXRoLmFicyh1c2VySW1hZ2UuZGF0YVtpXSAtIGFuc3dlckltYWdlLmRhdGFbaV0pID4gMjUwKSB7XG4gICAgICBkZWx0YSsrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gT3B0aW9uYWxseSBhbGxvdyBzb21lIG51bWJlciBvZiBwaXhlbHMgdG8gYmUgb2ZmLCBkZWZhdWx0IHRvXG4gIC8vIHBpeGVsLXBlcmZlY3Qgc3RyaWN0bmVzc1xuICB2YXIgcGVybWl0dGVkRXJyb3JzID0gbGV2ZWwucGVybWl0dGVkRXJyb3JzIHx8IDA7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gKGxldmVsLmZyZWVQbGF5IHx8IHRoaXMuaXNDb3JyZWN0XyhkZWx0YSwgcGVybWl0dGVkRXJyb3JzKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gSW4gbGV2ZWwgSzEsIGNoZWNrIGlmIG9ubHkgbGVuZ3RocyBkaWZmZXIuXG4gIGlmIChsZXZlbC5pc0sxICYmICFsZXZlbENvbXBsZXRlICYmICF0aGlzLnN0dWRpb0FwcF8uZWRpdENvZGUgJiZcbiAgICAgIGxldmVsLnNvbHV0aW9uQmxvY2tzICYmXG4gICAgICByZW1vdmVLMUxlbmd0aHMocHJvZ3JhbSkgPT09IHJlbW92ZUsxTGVuZ3RocyhsZXZlbC5zb2x1dGlvbkJsb2NrcykpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19FUlJPUjtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0dXJ0bGVNc2cubGVuZ3RoRmVlZGJhY2soKTtcbiAgfVxuXG4gIC8vIEZvciBsZXZlbHMgd2hlcmUgdXNpbmcgdG9vIG1hbnkgYmxvY2tzIHdvdWxkIGFsbG93IHN0dWRlbnRzXG4gIC8vIHRvIG1pc3MgdGhlIHBvaW50LCBjb252ZXJ0IHRoYXQgZmVlZGJhY2sgdG8gYSBmYWlsdXJlLlxuICBpZiAobGV2ZWwuZmFpbEZvclRvb01hbnlCbG9ja3MgJiZcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTDtcblxuICB9IGVsc2UgaWYgKCh0aGlzLnRlc3RSZXN1bHRzID09XG4gICAgICB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHx8XG4gICAgICAodGhpcy50ZXN0UmVzdWx0cyA9PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQUxMX1BBU1MpKSB7XG4gICAgLy8gQ2hlY2sgdGhhdCB0aGV5IGRpZG4ndCB1c2UgYSBjcmF6eSBsYXJnZSByZXBlYXQgdmFsdWUgd2hlbiBkcmF3aW5nIGFcbiAgICAvLyBjaXJjbGUuICBUaGlzIGNvbXBsYWlucyBpZiB0aGUgbGltaXQgZG9lc24ndCBzdGFydCB3aXRoIDMuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgbGV2ZWwgZG9lcyBub3QgdXNlIGNvbG91ciwgc28gbm8gbmVlZCB0byBjaGVjayBmb3IgdGhhdC5cbiAgICBpZiAobGV2ZWwuZmFpbEZvckNpcmNsZVJlcGVhdFZhbHVlICYmIHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICB2YXIgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICAgIGlmIChjb2RlLmluZGV4T2YoJ2NvdW50IDwgMycpID09IC0xKSB7XG4gICAgICAgIHRoaXMudGVzdFJlc3VsdHMgPVxuICAgICAgICAgICAgdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19BQ0NFUFRBQkxFX0ZBSUw7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGNvbW1vbk1zZy50b29NdWNoV29yaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBJZiB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSwgYWx3YXlzIHJldHVybiB0aGUgZnJlZSBwbGF5XG4gIC8vIHJlc3VsdCB0eXBlXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgLy8gUGxheSBzb3VuZFxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPT09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVkgfHxcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAndHVydGxlJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cucGl2b3RhbHRyYWNrZXIuY29tL3N0b3J5L3Nob3cvODQxNzE1NjBcbiAgLy8gTmV2ZXIgc2VuZCB1cCBmcm96ZW4gaW1hZ2VzIGZvciBub3cuXG4gIHZhciBpc0Zyb3plbiA9ICh0aGlzLnNraW4uaWQgPT09ICdhbm5hJyB8fCB0aGlzLnNraW4uaWQgPT09ICdlbHNhJyk7XG5cbiAgLy8gR2V0IHRoZSBjYW52YXMgZGF0YSBmb3IgZmVlZGJhY2suXG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCAmJlxuICAgICFpc0Zyb3plbiAmJiAobGV2ZWwuZnJlZVBsYXkgfHwgbGV2ZWwuaW1wcmVzc2l2ZSkpIHtcbiAgICByZXBvcnREYXRhLmltYWdlID0gdGhpcy5nZXRGZWVkYmFja0ltYWdlXygpO1xuICB9XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmdldEZlZWRiYWNrSW1hZ2VfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmZWVkYmFja0ltYWdlQ2FudmFzO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eERpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4U2NyYXRjaDtcbiAgfVxuXG4gIC8vIENvcHkgdGhlIHVzZXIgbGF5ZXJcbiAgdGhpcy5jdHhGZWVkYmFjay5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSc7XG4gIHRoaXMuY3R4RmVlZGJhY2suZHJhd0ltYWdlKGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLCAwLCAwLCAxNTQsIDE1NCk7XG4gIHZhciBmZWVkYmFja0NhbnZhcyA9IHRoaXMuY3R4RmVlZGJhY2suY2FudmFzO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgZmVlZGJhY2tDYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLnNwbGl0KCcsJylbMV0pO1xufTtcblxuLy8gSGVscGVyIGZvciBjcmVhdGluZyBjYW52YXMgZWxlbWVudHMuXG5BcnRpc3QucHJvdG90eXBlLmNyZWF0ZUNhbnZhc18gPSBmdW5jdGlvbiAoaWQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGVsLmlkID0gaWQ7XG4gIGVsLndpZHRoID0gd2lkdGg7XG4gIGVsLmhlaWdodCA9IGhlaWdodDtcbiAgcmV0dXJuIGVsO1xufTtcblxuLyoqXG4qIFdoZW4gc21vb3RoIGFuaW1hdGUgaXMgdHJ1ZSwgc3RlcHMgY2FuIGJlIGJyb2tlbiB1cCBpbnRvIG11bHRpcGxlIGFuaW1hdGlvbnMuXG4qIEF0IHRoZSBlbmQgb2YgZWFjaCBzdGVwLCB3ZSB3YW50IHRvIHJlc2V0IGFueSBpbmNyZW1lbnRhbCBpbmZvcm1hdGlvbiwgd2hpY2hcbiogaXMgd2hhdCB0aGlzIGRvZXMuXG4qL1xuQXJ0aXN0LnByb3RvdHlwZS5yZXNldFN0ZXBJbmZvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdGVwU3RhcnRYID0gdGhpcy54O1xuICB0aGlzLnN0ZXBTdGFydFkgPSB0aGlzLnk7XG4gIHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZCA9IDA7XG59O1xuIiwidmFyIGxldmVsQmFzZSA9IHJlcXVpcmUoJy4uL2xldmVsX2Jhc2UnKTtcbnZhciBDb2xvdXJzID0gcmVxdWlyZSgnLi9jb2xvdXJzJyk7XG52YXIgYW5zd2VyID0gcmVxdWlyZSgnLi9hbnN3ZXJzJykuYW5zd2VyO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vLyBBbiBlYXJseSBoYWNrIGludHJvZHVjZWQgc29tZSBsZXZlbGJ1aWxkZXIgbGV2ZWxzIGFzIHBhZ2UgNSwgbGV2ZWwgNy4gTG9uZ1xuLy8gdGVybSB3ZSBjYW4gcHJvYmFibHkgZG8gc29tZXRoaW5nIG11Y2ggY2xlYW5lciwgYnV0IGZvciBub3cgSSdtIGNhbGxpbmdcbi8vIG91dCB0aGF0IHRoaXMgbGV2ZWwgaXMgc3BlY2lhbCAob24gcGFnZSA1KS5cbnZhciBMRVZFTEJVSUxERVJfTEVWRUwgPSA3O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHRvb2xib3guXG52YXIgdG9vbGJveCA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3Rvb2xib3gueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgc3RhcnRCbG9ja3MuXG52YXIgc3RhcnRCbG9ja3MgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi9zdGFydEJsb2Nrcy54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxudmFyIHJlcSA9IHJlcXVpcmUoJy4vcmVxdWlyZWRCbG9ja3MnKTtcbnZhciBtYWtlTWF0aE51bWJlciA9IHJlcS5tYWtlTWF0aE51bWJlcjtcbnZhciBzaW1wbGVCbG9jayA9IHJlcS5zaW1wbGVCbG9jaztcbnZhciByZXBlYXQgPSByZXEucmVwZWF0O1xudmFyIGRyYXdBU3F1YXJlID0gcmVxLmRyYXdBU3F1YXJlO1xudmFyIGRyYXdBU25vd21hbiA9IHJlcS5kcmF3QVNub3dtYW47XG52YXIgTU9WRV9GT1JXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0ZPUldBUkRfSU5MSU5FO1xudmFyIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUgPSByZXEuTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORTtcbnZhciBtb3ZlRm9yd2FyZElubGluZSA9IHJlcS5tb3ZlRm9yd2FyZElubGluZTtcbnZhciBNT1ZFX0JBQ0tXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0JBQ0tXQVJEX0lOTElORTtcbnZhciB0dXJuTGVmdFJlc3RyaWN0ZWQgPSByZXEudHVybkxlZnRSZXN0cmljdGVkO1xudmFyIHR1cm5SaWdodFJlc3RyaWN0ZWQgPSByZXEudHVyblJpZ2h0UmVzdHJpY3RlZDtcbnZhciB0dXJuUmlnaHRCeUNvbnN0YW50ID0gcmVxLnR1cm5SaWdodEJ5Q29uc3RhbnQ7XG52YXIgdHVyblJpZ2h0ID0gcmVxLnR1cm5SaWdodDtcbnZhciB0dXJuTGVmdCA9IHJlcS50dXJuTGVmdDtcbnZhciBtb3ZlID0gcmVxLm1vdmU7XG52YXIgZHJhd1R1cm5SZXN0cmljdGVkID0gcmVxLmRyYXdUdXJuUmVzdHJpY3RlZDtcbnZhciBkcmF3VHVybiA9IHJlcS5kcmF3VHVybjtcbnZhciBTRVRfQ09MT1VSX1BJQ0tFUiA9IHJlcS5TRVRfQ09MT1VSX1BJQ0tFUjtcbnZhciBTRVRfQ09MT1VSX1JBTkRPTSA9IHJlcS5TRVRfQ09MT1VSX1JBTkRPTTtcbnZhciBkZWZpbmVXaXRoQXJnID0gcmVxLmRlZmluZVdpdGhBcmc7XG5cbnZhciBibG9ja3MgPSB7XG4gIFNJTVBMRV9NT1ZFX1VQOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV91cCcpLFxuICBTSU1QTEVfTU9WRV9ET1dOOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9kb3duJyksXG4gIFNJTVBMRV9NT1ZFX0xFRlQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2xlZnQnKSxcbiAgU0lNUExFX01PVkVfUklHSFQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3JpZ2h0JyksXG4gIFNJTVBMRV9KVU1QX1VQOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF91cCcpLFxuICBTSU1QTEVfSlVNUF9ET1dOOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfanVtcF9kb3duJyksXG4gIFNJTVBMRV9KVU1QX0xFRlQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX2xlZnQnKSxcbiAgU0lNUExFX0pVTVBfUklHSFQ6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX3JpZ2h0JyksXG4gIFNJTVBMRV9NT1ZFX1VQX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfdXBfbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX0RPV05fTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9kb3duX2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9MRUZUX0xFTkdUSDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfbGVmdF9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfUklHSFRfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9yaWdodF9sZW5ndGgnKSxcbiAgc2ltcGxlTW92ZUJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX01PVkVfVVAgK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9ET1dOICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfTEVGVCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX1JJR0hUO1xuICB9LFxuICBzaW1wbGVKdW1wQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfSlVNUF9VUCArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX0RPV04gK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9MRUZUICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfUklHSFQ7XG4gIH0sXG4gIHNpbXBsZU1vdmVMZW5ndGhCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9NT1ZFX1VQX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0RPV05fTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfTEVGVF9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9SSUdIVF9MRU5HVEg7XG4gIH1cbn07XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgbGV2ZWwtc3BlY2lmaWMgcmVxdWlyZW1lbnRzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIExldmVsIDE6IEVsLlxuICAnMV8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDEpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW01PVkVfRk9SV0FSRF9JTkxJTkVdLCBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogU3F1YXJlICh3aXRob3V0IHJlcGVhdCkuXG4gICcxXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMiksXG4gICAgaWRlYWw6IDExLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCg5MCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogU3F1YXJlICh3aXRoIHJlcGVhdCkuXG4gICcxXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMyksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV0sXG4gICAgICBbcmVwZWF0KDQpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDQ6IFRyaWFuZ2xlLlxuICAnMV80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDQpLFxuICAgIGlkZWFsOiA2LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDU6IEVudmVsb3BlLlxuICAnMV81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDUpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDEyMCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNjogdHJpYW5nbGUgYW5kIHNxdWFyZS5cbiAgJzFfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA2KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbdHVyblJpZ2h0UmVzdHJpY3RlZCgxMjApLCB0dXJuTGVmdFJlc3RyaWN0ZWQoMTIwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORSwgTU9WRV9CQUNLV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNzogZ2xhc3Nlcy5cbiAgJzFfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA3KSxcbiAgICBpZGVhbDogMTMsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3VHVyblJlc3RyaWN0ZWQoOTApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW01PVkVfQkFDS1dBUkRfSU5MSU5FLCBNT1ZFX0ZPUldBUkRfSU5MSU5FXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDg6IHNwaWtlcy5cbiAgJzFfOCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCA4KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1tyZXBlYXQoOCldXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgOTogY2lyY2xlLlxuICAnMV85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDkpLFxuICAgIGlkZWFsOiA2LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBwZXJtaXR0ZWRFcnJvcnM6IDEwLFxuICAgIGZhaWxGb3JDaXJjbGVSZXBlYXRWYWx1ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzFfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMTApLFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAxMCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiB0cnVlXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgMi5cbiAgLy8gTGV2ZWwgMTogU3F1YXJlLlxuICAnMl8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDEpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICAgICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuUmlnaHQnfSxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoOTApfVxuICAgICAgfV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyBtb3ZlIGZvcndhcmQgb3IgYmFja3dhcmQsIGJ1dCBzaG93IGZvcndhcmQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfbW92ZScsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDEwMCl9XG4gICAgICB9XVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDI6IFNtYWxsIGdyZWVuIHNxdWFyZS5cbiAgJzJfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAyKSxcbiAgICBpZGVhbDogNSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU3F1YXJlKCc/PycpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IFRocmVlIHNxdWFyZXMuXG4gICcyXzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMyksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW2RyYXdBU3F1YXJlKDEwMCldLFxuICAgICAgW2RyYXdUdXJuKCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNDogMzYgc3F1YXJlcy5cbiAgJzJfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA0KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA0KSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA1OiBEaWZmZXJlbnQgc2l6ZSBzcXVhcmVzLlxuICAnMl81Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDUpLFxuICAgIGlkZWFsOiAxMSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU3F1YXJlKCc/PycpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDY6IEZvci1sb29wIHNxdWFyZXMuXG4gICcyXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNiksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNiksXG4gICAgLy8gVGhpcyBpcyBub3QgZGlzcGxheWVkIHByb3Blcmx5LlxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2NvdW50ZXInKV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA3OiBCb3h5IHNwaXJhbC5cbiAgJzJfNyc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNyksXG4gICAgaWRlYWw6IDksXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtzaW1wbGVCbG9jaygnY29udHJvbHNfZm9yX2NvdW50ZXInKV0sXG4gICAgICBbbW92ZSgnPz8nKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIFByZXAgZm9yIExldmVsIDg6IFR3byBzbm93bWVuLlxuICAnMl83XzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNy41KSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiA1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDcuNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oMjUwKV0sXG4gICAgICBbZHJhd0FTbm93bWFuKDEwMCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA4OiBUaHJlZSBzbm93bWVuLlxuICAnMl84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDgpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaWRlYWw6IDEyLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKDE1MCldLFxuICAgICAgW3R1cm5SaWdodCg5MCldLFxuICAgICAgW3R1cm5MZWZ0KDkwKV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAnanVtcCcsXG4gICAgICAgIHR5cGU6ICdqdW1wJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoMTAwKX1cbiAgICAgIH1dLFxuICAgICAgW3NpbXBsZUJsb2NrKCdqdW1wJyldLFxuICAgICAgW3JlcGVhdCgzKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDk6IFNub3dtYW4gZmFtaWx5LlxuICAnMl85Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDkpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaWRlYWw6IDE1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTbm93bWFuKCc/PycpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygnY29udHJvbHNfZm9yX2NvdW50ZXInKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXSxcbiAgICAgIFt0dXJuUmlnaHQoOTApXSxcbiAgICAgIFt0dXJuTGVmdCg5MCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ2p1bXAnLFxuICAgICAgICB0eXBlOiAnanVtcCcsXG4gICAgICAgIHZhbHVlczogeydWQUxVRSc6IG1ha2VNYXRoTnVtYmVyKDYwKX1cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzJfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMTApLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAxMClcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSAzLlxuICAvLyBMZXZlbCAxOiBDYWxsICdkcmF3IGEgc3F1YXJlJy5cbiAgJzNfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAxKSxcbiAgICBpZGVhbDogMTQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogQ3JlYXRlIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICczXzInOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgMiksXG4gICAgaWRlYWw6IDE0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW3R1cm5SaWdodCgxMjApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBGZW5jZSB0aGUgYW5pbWFscy5cbiAgJzNfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAzKSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyMCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXSxcbiAgICAgIFttb3ZlKDEwMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDI0N11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCA0N11cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY293LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTgyLCAxNDddXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA0OiBIb3VzZSB0aGUgbGlvbi5cbiAgJzNfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA0KSxcbiAgICBpZGVhbDogMTksXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDMwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE5NSwgOTddXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA1OiBDcmVhdGUgXCJkcmF3IGEgaG91c2VcIi5cbiAgJzNfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA1KSxcbiAgICBpZGVhbDogMjEsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtsZXZlbEJhc2UuZGVmaW5lKG1zZy5kcmF3QUhvdXNlKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FTcXVhcmUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDMwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QUhvdXNlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgOTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzIyMiwgOTBdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA2OiBBZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG4gICczXzYnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNiksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjMsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTg1LCAxMDBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3NSwgMjQ4XVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNzogQWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSBob3VzZVwiLlxuICAnM183Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDcpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDI0LFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBU3F1YXJlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnZWxlcGhhbnQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyMDUsIDIyMF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDg6IERyYXcgaG91c2VzLlxuICAnM184Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA4KSxcbiAgICBpbml0aWFsWDogMjAsXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogNDAsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgOCksXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE2LCAxNzBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNSwgMjUwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzEyNywgMjIwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsyNTUsIDI1MF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIGRpc2FibGVQYXJhbUVkaXRpbmc6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDk6IERyYXcgaG91c2VzIHdpdGggZm9yIGxvb3AuXG4gICczXzknOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDkpLFxuICAgIGluaXRpYWxYOiAyMCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiA0MCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVNxdWFyZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWy0xMCwgMjcwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFs1MywgMjUwXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3NSwgMjIwXVxuICAgICAgfVxuICAgIF0sXG4gICAgZmFpbEZvclRvb01hbnlCbG9ja3M6IHRydWUsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IHBsYXlncm91bmQuXG4gICczXzEwJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAxMCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDEwKVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDQuXG4gIC8vIExldmVsIDE6IE9uZSB0cmlhbmdsZS5cbiAgJzRfMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbe1xuICAgICAgICAvLyBhbGxvdyB0dXJuIHJpZ2h0IG9yIGxlZnQsIGJ1dCBzaG93IHR1cm4gcmlnaHQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbiAgICAgICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50JztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgfSxcbiAgLy8gTGV2ZWwgMjogVHdvIHRyaWFuZ2xlcy5cbiAgJzRfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAyKSxcbiAgICBpZGVhbDogMTIsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjVcbiAgfSxcbiAgLy8gTGV2ZWwgMzogRm91ciB0cmlhbmdsZXMgdXNpbmcgcmVwZWF0LlxuICAnNF8zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDMpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjdcbiAgfSxcbiAgLy8gTGV2ZWwgNDogVGVuIHRyaWFuZ2xlcyB3aXRoIG1pc3NpbmcgcmVwZWF0IG51bWJlci5cbiAgJzRfNCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA0KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgnPz8/JyldXG4gICAgXSxcbiAgICBzbGlkZXJTcGVlZDogMC43LFxuICAgIGltcHJlc3NpdmU6IHRydWVcbiAgfSxcbiAgLy8gTGV2ZWwgNTogMzYgdHJpYW5nbGVzIHdpdGggbWlzc2luZyBhbmdsZSBudW1iZXIuXG4gICc0XzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgNSksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFt0dXJuUmlnaHRCeUNvbnN0YW50KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA2OiAxIHNxdWFyZS5cbiAgJzRfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA2KSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW21vdmVGb3J3YXJkSW5saW5lKDIwKV0sXG4gICAgICBbcmVwZWF0KDQpXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICd0dXJuUmlnaHQnLFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICAgIHBlcm1pdHRlZEVycm9yczogMTAsXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgNzogU3F1YXJlIExhZGRlci5cbiAgJzRfNyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA3KSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDcpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbW92ZUZvcndhcmRJbmxpbmUoMjApXSxcbiAgICAgIFtyZXBlYXQoMTApXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuN1xuICB9LFxuICAvLyBMZXZlbCA4OiBMYWRkZXIgc3F1YXJlLlxuICAnNF84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDgpLFxuICAgIGluaXRpYWxYOiAxMDAsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpZGVhbDogMTAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCA5OiBMYWRkZXIgc3F1YXJlIHdpdGggYSBkaWZmZXJlbnQgYW5nbGUuXG4gICc0XzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgOSksXG4gICAgaW5pdGlhbFg6IDE1MCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDkpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA5KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDMzMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDEwOiBMYWRkZXIgcG9seWdvbi5cbiAgJzRfMTAnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMTApLFxuICAgIGluaXRpYWxYOiA3NSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMTApLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KCc/Pz8nKV1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCAxMTogcGxheWdyb3VuZC5cbiAgJzRfMTEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMTEpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxYOiA3NSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMTEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxMSksXG4gICAgcmVxdWlyZWRCbG9ja3MgOiBbXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gICB9LFxuXG4gIC8vIEZvcm1lcmx5IFBhZ2UgNS5cbiAgLy8gTGV2ZWwgMTogcGxheWdyb3VuZC5cbiAgJzVfMSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMSksXG4gICAgc2xpZGVyU3BlZWQ6IDAuOVxuICB9LFxuICAvLyBMZXZlbCAyOiBwbGF5Z3JvdW5kLlxuICAnNV8yJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAyKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAyKSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDM6IHBsYXlncm91bmQuXG4gICc1XzMnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDMpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDMpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNDogcGxheWdyb3VuZC5cbiAgJzVfNCc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNCksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA1OiBwbGF5Z3JvdW5kLlxuICAnNV81Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA1KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA1KSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDY6IHBsYXlncm91bmQuXG4gICc1XzYnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDYpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCA2KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgNiksXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBUaGUgbGV2ZWwgZm9yIGJ1aWxkaW5nIG5ldyBsZXZlbHMuXG4gICdidWlsZGVyJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIExFVkVMQlVJTERFUl9MRVZFTCksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gVGhlIGRlZmF1bHQgbGV2ZWwgbmV3bHkgY3JlYXRlZCBsZXZlbHMgdXNlLlxuICAnY3VzdG9tJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCBMRVZFTEJVSUxERVJfTEVWRUwpLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gICdrMV9kZW1vJzoge1xuICAgIGFuc3dlcjogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICB0b29sYm94OiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVNb3ZlQmxvY2tzKCkgK1xuICAgICAgICBibG9ja3Muc2ltcGxlSnVtcEJsb2NrcygpICtcbiAgICAgICAgYmxvY2tzLnNpbXBsZU1vdmVMZW5ndGhCbG9ja3MoKSArXG4gICAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2NvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkJykgK1xuICAgICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdkcmF3X2NvbG91cl9zaW1wbGUnKVxuICAgICAgKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9XG59O1xuXG5sZXZlbHMuZWNfMV8xID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8xJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJtb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8yID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8yJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJwZW5Db2xvdXIoJyNmZjAwMDAnKTtcXG5tb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG5sZXZlbHMuZWNfMV8zID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8zJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xcbiAgX19cXG59XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzQgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzQnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcImZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XFxuICBwZW5Db2xvdXIoJyNmZjAwMDAnKTtcXG59XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzEwID0gdXRpbHMuZXh0ZW5kKGxldmVsc1snMV8xMCddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ3BlbldpZHRoJzogbnVsbCxcbiAgICAnZm9yTG9vcF9pXzBfNCc6IHsgJ2NhdGVnb3J5JzogJ0FydGlzdCcgfSxcbiAgfSxcbiAgJ3N0YXJ0QmxvY2tzJzogXCJtb3ZlRm9yd2FyZCgxMDApO1xcblwiLFxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuLy8gQW4gZWFybHkgaGFjayBpbnRyb2R1Y2VkIHNvbWUgbGV2ZWxidWlsZGVyIGxldmVscyBhcyBwYWdlIDUsIGxldmVsIDcuIExvbmdcbi8vIHRlcm0gd2UgY2FuIHByb2JhYmx5IGRvIHNvbWV0aGluZyBtdWNoIGNsZWFuZXIsIGJ1dCBmb3Igbm93IEknbSBjYWxsaW5nXG4vLyBvdXQgdGhhdCB0aGlzIGxldmVsIGlzIHNwZWNpYWwgKG9uIHBhZ2UgNSkuXG52YXIgTEVWRUxCVUlMREVSX0xFVkVMID0gNztcblxuLypcblRPT0xCT1guXG5cblBBR0UgMVxuPT09PT09XG5XaXRoaW4gdGhpcyBwYWdlLCBibG9ja3MgYXJlIG9ubHkgYWRkZWQsIG5ldmVyIHRha2VuIGF3YXkuXG5cbkxldmVsIDEgW2VsXTogQWRkcyBkcmF3X21vdmVfYnlfY29uc3RhbnQgYW5kIGRyYXdfdHVybl9ieV9jb25zdGFudC5cbkxldmVsIDIgW2NvbG91cmVkIHNxdWFyZV06IEFkZHMgZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyLlxubGV2ZWwgMyBbc3F1YXJlIGluIHRocmVlIGJsb2Nrc106IEFkZHMgY29udHJvbHNfcmVwZWF0LlxubGV2ZWwgNCBbdHJpYW5nbGVdIEFkZHMgZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcmFuZG9tLlxuTGV2ZWwgNSBbb3ZlcmxhcHBpbmcgc3F1YXJlIGFuZCB0cmlhbmdsZSAoc2lkZXdheXMgZW52ZWxvcGUpXVxuTGV2ZWwgNiBbZW52ZWxvcGVdXG5MZXZlbCA3IFtnbGFzc2VzXVxuTGV2ZWwgOCBbc3Bpa2VzXVxuTGV2ZWwgOSBbY2lyY2xlXVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV06IGRyYXdfd2lkdGhfaW5saW5lXG5cblBBR0UgMlxuPT09PT09XG5DYXRlZ29yaWVzIGFyZSBpbnRyb2R1Y2VkLCB3aXRoIGNvbnRlbnRzIG9mOlxuLSBBY3Rpb25zXG4gIC0gZHJhd19tb3ZlIHdpdGggbWF0aF9udW1iZXJcbiAgLSBkcmF3X3R1cm4gd2l0aCBtYXRoX251bWJlclxuLSBDb2xvclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9waWNrZXJcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcmFuZG9tXG4tIEZ1bmN0aW9ucyAoYWRkZWQgYXQgbGV2ZWwgMilcbiAgLSBbY2FsbF0gZHJhdyBhIHNxdWFyZVxuICAtIFtjYWxsXSBkcmF3IGEgc25vd2JhbGwgKGFkZGVkIGF0IGxldmVsIDkpXG4tIExvb3BzXG4gIC0gY29udHJvbHNfcmVwZWF0XG4gIC0gY29udHJvbHNfZm9yIChhZGRlZCBhdCBsZXZlbCA2KVxuLSBNYXRoXG4gIC0gbWF0aF9udW1iZXJcbi0gVmFyaWFibGVzIChhZGRlZCBhdCBsZXZlbCA2KVxuICAtIGdldCBjb3VudGVyIChhZGRlZCBhdCBsZXZlbCA5KVxuICAtIGdldCBoZWlnaHQgKGFkZGVkIGF0IGxldmVsIDcpXG4gIC0gZ2V0IGxlbmd0aCAobGV2ZWxzIDYgYW5kIDEwKVxuTGV2ZWwgMSBbc3F1YXJlXVxuTGV2ZWwgMiBbc3F1YXJlIGJ5IGZ1bmN0aW9uIGNhbGxdOiBhZGQgXCJkcmF3IGEgc3F1YXJlXCJcbkxldmVsIDMgWzMgc3F1YXJlc11cbkxldmVsIDQgWzM2IHNxdWFyZXNdXG5MZXZlbCA1IFtuZXN0ZWQgc3F1YXJlcyB3aXRob3V0IGNvbnRyb2xzX2Zvcl1cbkxldmVsIDYgW25lc3RlZCBzcXVhcmVzIHdpdGggY29udHJvbHNfZm9yXVxuTGV2ZWwgNyBbbWluaS1zcGlyYWxdXG5MZXZlbCA4IFszIHNub3dtZW5dOiBhZGQgXCJkcmF3IGEgc25vd21hblwiXG5MZXZlbCA5IFtzbm93bWFuIGZhbWlseV1cbkxldmVsIDEwIFtmcmVlIHBsYXldXG5cblBBR0UgM1xuPT09PT09XG5DYXRlZ29yaWVzIGFyZSB1c2VkLCB3aXRoIGNvbnRlbnRzIG9mOlxuLSBBY3Rpb25zXG4gIC0gZHJhd19tb3ZlIHdpdGggbWF0aF9udW1iZXJcbiAgLSBkcmF3X3R1cm4gd2l0aCBtYXRoX251bWJlclxuLSBDb2xvclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9waWNrZXJcbiAgLSBkcmF3X2NvbG91ciAoc2V0IGNvbG91cikgd2l0aCBjb2xvdXJfcmFuZG9tXG4tIEZ1bmN0aW9ucyAoUmVwbGFjZWQgd2l0aCBjdXN0b20gY2F0ZWdvcnkgYXQgbGV2ZWwgMilcbiAgLSBbY2FsbF0gZHJhdyBhIGNpcmNsZVxuICAtIFtjYWxsXSBkcmF3IGEgc3F1YXJlXG4tIExvb3BzXG4gIC0gY29udHJvbHNfZm9yXG4gIC0gY29udHJvbHNfcmVwZWF0XG4tIE1hdGhcbiAgLSBtYXRoX251bWJlclxuLSBWYXJpYWJsZXMgKGFkZGVkIGF0IGxldmVsIDYpXG4gIC0gZ2V0IGNvdW50ZXJcblZhcmlhYmxlcyBhbmQgZnVuY3Rpb25zIGFyZSBtYW51YWxseSBhZGRlZCB1bnRpbCBMZXZlbHMgNyBhbmQgOCxcbndoZW4gdGhlIGN1c3RvbSBjYXRlZ29yaWVzIGFyZSB1c2VkXG5MZXZlbCAxIFtjYWxsIFwiZHJhdyBhIHNxdWFyZVwiXVxuTGV2ZWwgMiBbY3JlYXRlIGFuZCBjYWxsIFwiZHJhdyBhIHRyaWFuZ2xlXCJdXG5MZXZlbCAzIFt1c2UgXCJkcmF3IGEgc3F1YXJlXCIgYW5kIFwiZHJhdyBhIHRyaWFuZ2xlXCIgdG8gZmVuY2UgYW5pbWFsc11cbkxldmVsIDQgW2RyYXcgYSBob3VzZV1cbkxldmVsIDUgW2NyZWF0ZSBhbmQgY2FsbCBcImRyYXcgYSBob3VzZVwiXVxuTGV2ZWwgNiBbYWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSB0cmlhbmdsZVwiXVxuTGV2ZWwgNyBbYWRkIHBhcmFtZXRlciB0byBcImRyYXcgYSBob3VzZVwiXVxuTGV2ZWwgOCBbbW9kaWZ5IGVuZCBsb2NhdGlvbiBvZiBcImNyZWF0ZSBhIGhvdXNlXCJdXG5MZXZlbCA5IFtjYWxsIFwiZHJhdyBhIGhvdXNlXCIgd2l0aCBmb3IgbG9vcF1cbkxldmVsIDEwIFtmcmVlIHBsYXldXG5cbiovOyBidWYucHVzaCgnPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICAnKTs5MjsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50Jyk7OTM7IGlmIChsZXZlbCA8PSA4KSB7IDsgYnVmLnB1c2goJ19yZXN0cmljdGVkJyk7OTM7IH0gOyBidWYucHVzaCgnXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7OTY7IGlmIChsZXZlbCA+PSAyKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTAxOyB9OyBidWYucHVzaCgnICAgICcpOzEwMTsgaWYgKGxldmVsID49IDQpIHsgLyogT3V0IG9mIG51bWVyaWMgb3JkZXIgdG8gbWFrZSBjb2xvdXIgYmxvY2tzIGFkamFjZW50LiAqLzsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwNjsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDY7IGlmIChsZXZlbCA+PSAzKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDk7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTA5OyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LXdpZHRoXCIgdHlwZT1cImRyYXdfd2lkdGhfaW5saW5lXCIgeD1cIjE1OFwiIHk9XCI2N1wiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzExMjsgfTsgYnVmLnB1c2goJyAgJyk7MTEyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gMiB8fCBwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTEyOyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgaWQ9XCJhY3Rpb25zXCIgbmFtZT1cIicsIGVzY2FwZSgoMTEyLCAgbXNnLmNhdFR1cnRsZSgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMjA7IGlmIChwYWdlID09IDIgJiYgbGV2ZWwgPj0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJqdW1wXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMjc7IH07IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTM0OyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMzc7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTM4OyAvLyBDb2xvdXI6IGRyYXdfY29sb3VyIHdpdGggY29sb3VyX3BpY2tlciBhbmQgY29sb3VyX3JhbmRvbS5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTM4LCAgbXNnLmNhdENvbG91cigpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxNTA7IC8vIEZ1bmN0aW9ucyBkaWZmZXIgZGVwZW5kaW5nIG9uIHBhZ2UgYW5kIGxldmVsLlxuOyBidWYucHVzaCgnICAgICcpOzE1MDsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSAyKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE1MCwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICcpOzE1ODsgaWYgKGxldmVsID49IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd21hblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICcpOzE2NTsgfTsgYnVmLnB1c2goJyAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE2NjsgfSBlbHNlIGlmIChwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgICAnKTsxNjY7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgICAgICAnKTsxNjY7IC8vIERvbid0IHVzZSBjdXN0b20gY2F0ZWdvcnkgeWV0LCBzaW5jZSBpdCBhbGxvd3MgZnVuY3Rpb24gZGVmaW5pdGlvbi5cbjsgYnVmLnB1c2goJyAgICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE2NiwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxNjgsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTcxLCAgbXNnLmRyYXdBU3F1YXJlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9jYXRlZ29yeT5cXG4gICAgICAnKTsxNzQ7IH0gZWxzZSB7IDsgYnVmLnB1c2goJ1xcbiAgICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE3NSwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgICAgICcpOzE3NjsgfTsgYnVmLnB1c2goJyAgICAnKTsxNzY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTc2OyAvLyBDb250cm9sOiBjb250cm9sc19mb3JfY291bnRlciAoZnJvbSBwYWdlIDIsIGxldmVsIDYpIGFuZCByZXBlYXQuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE3NiwgIG1zZy5jYXRDb250cm9sKCkgKSksICdcIj5cXG4gICAgICAnKTsxNzc7IGlmICgocGFnZSA9PSAyICYmIGxldmVsID49IDYpIHx8IChwYWdlID09IDMgJiYgbGV2ZWwgPj0gOSkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxOTQ7IH07IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE5ODsgLy8gTWF0aDogSnVzdCBudW1iZXIgYmxvY2tzIHVudGlsIGZpbmFsIGxldmVsLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxOTgsICBtc2cuY2F0TWF0aCgpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjwvYmxvY2s+XFxuICAgICAgJyk7MjAwOyBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2ludFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfcmFuZG9tX2Zsb2F0XCI+PC9ibG9jaz5cXG4gICAgJyk7MjE0OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIxNTsgLy8gVmFyaWFibGVzIGRlcGVuZHMgb24gcGFnZSBhbmQgbGV2ZWwsIGFsdGhvdWdoIHdlIG5ldmVyIHVzZSB0aGUgY3VzdG9tIGNhdGVnb3J5XG47IGJ1Zi5wdXNoKCcgICAgJyk7MjE1OyAvLyBiZWNhdXNlIHdlIHdhbnQgdG8gb2ZmZXIgc2ltcGxpZmllZCBnZXR0ZXJzIGFuZCBubyBzZXR0ZXJzLlxuOyBidWYucHVzaCgnICAgICcpOzIxNTsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA2KSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIxNSwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIxODsgfSBlbHNlIGlmIChwYWdlID09IDMgJiYgbGV2ZWwgPj0gNiAmJiBsZXZlbCA8IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIxOCwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgJyk7MjE5OyBpZiAobGV2ZWwgPj0gOSkgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgICAnKTsyMjA7IH07IGJ1Zi5wdXNoKCcgICAgICAgICcpOzIyMDsgaWYgKGxldmVsID49IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICAnKTsyMjE7IH07IGJ1Zi5wdXNoKCcgICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMjI7IH0gZWxzZSBpZiAocGFnZSA9PSAzICYmIGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIyMiwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlZBUklBQkxFXCI+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjI0OyB9OyBidWYucHVzaCgnICAnKTsyMjQ7IH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7OyBidWYucHVzaCgnICAgICcpOzIyNDsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzIyODsgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAgICcpOzIzMTsgfTsgYnVmLnB1c2goJyAgICAnKTsyMzE7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNDQ7IH0gZWxzZSBpZiAocGFnZSA9PSA1KSB7OyBidWYucHVzaCgnICAnKTsyNDQ7IC8vIEsxIHNpbXBsaWZpZWQgYmxvY2tzIGZvciBlZGl0b3I6IGtlZXAgaW4gc3luYyB3aXRoIERhc2hib2FyZCBhcnRpc3QucmJcbjsgYnVmLnB1c2goJyAgICAnKTsyNDQ7IGlmIChsZXZlbCA9PT0gTEVWRUxCVUlMREVSX0xFVkVMKSB7OyBidWYucHVzaCgnICAgICAgPGNhdGVnb3J5IG5hbWU9XCJLMSBTaW1wbGlmaWVkXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyX3NpbXBsZVwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3VwXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfZG93blwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2xlZnRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9yaWdodFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3VwX2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX2Rvd25fbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfbGVmdF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9yaWdodF9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF91cFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX2Rvd25cIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9sZWZ0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfcmlnaHRcIj48L2Jsb2NrPlxcbiAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzI2MjsgfTsgYnVmLnB1c2goJyAgICAnKTsyNjI7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBpZD1cImFjdGlvbnNcIiBuYW1lPVwiJywgZXNjYXBlKCgyNjIsICBtc2cuY2F0VHVydGxlKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwianVtcFwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyODk7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyODksICBtc2cuY2F0Q29sb3VyKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzMwMTsgLy8gRnVuY3Rpb25zXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDMwMSwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgICAnKTszMDI7IGlmIChsZXZlbCA9PT0gTEVWRUxCVUlMREVSX0xFVkVMKSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiUHJlYnVpbHRcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV90cmlhbmdsZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlX2N1c3RvbVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfaG91c2VcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2Zsb3dlclwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc25vd2ZsYWtlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9oZXhhZ29uXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zdGFyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yb2JvdFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffcm9ja2V0XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9wbGFuZXRcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Job21idXNcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd191cHBlcl93YXZlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbG93ZXJfd2F2ZVwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzMxODsgfTsgYnVmLnB1c2goJyAgICAnKTszMTg7IC8vIENvbnRyb2w6IGNvbnRyb2xzX2Zvcl9jb3VudGVyIGFuZCByZXBlYXQuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDMxOCwgIG1zZy5jYXRDb250cm9sKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzMzNjsgaWYgKGxldmVsIDwgNikgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTszMzk7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzM0NjsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgJyk7MzQ3OyAvLyBMb2dpY1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNDcsICBtc2cuY2F0TG9naWMoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfaWZcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfY29tcGFyZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19vcGVyYXRpb25cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfbmVnYXRlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2Jvb2xlYW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfbnVsbFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY190ZXJuYXJ5XCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzU2OyAvLyBNYXRoOiBKdXN0IG51bWJlciBibG9ja3MgdW50aWwgZmluYWwgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM1NiwgIG1zZy5jYXRNYXRoKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21faW50XCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21fZmxvYXRcIj48L2Jsb2NrPlxcbiAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzczOyAvLyBWYXJpYWJsZXNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzczLCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCIgY3VzdG9tPVwiVkFSSUFCTEVcIj5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICcpOzM3NTsgfTsgYnVmLnB1c2goJzwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8qKlxuICogQ29tbW9uIGNvZGUgZm9yIGNyZWF0aW5nIHByb2NlZHVyZXMgZHJhd2luZyBkaWZmZXJlbnQgcmVndWxhciBwb2x5Z29ucy5cbiAqIG9wdGlvbnM6XG4gKiAgIHRpdGxlIFRpdGxlIG9mIHByb2NlZHVyZS5cbiAqICAgbW9kaWZpZXJzIFN0cmluZyBjb250YWluaW5nIGFueSBvcHRpb25hbCBrZXlzIGFuZCB2YWx1ZXMgZm9yIHRoZSBpbml0aWFsXG4gKiAgICAgICAgICAgICA8YmxvY2s+IHRhZywgc3VjaCBhcyAneD1cIjIwXCIgeT1cIjIwXCIgZWRpdGFibGU9XCJmYWxzZVwiJy5cbiAqICAgc2lkZXMgTnVtYmVyIG9mIHNpZGVzLlxuICogICBsZW5ndGggMCBpZiBhIGxlbmd0aCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHVzZWQsIGEgcG9zaXRpdmUgbnVtYmVyIG90aGVyd2lzZVxuICovXG52YXIgcG9seWdvbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHs7IGJ1Zi5wdXNoKCc8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiAnLCAoMTQsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICA8bXV0YXRpb24+XFxuICAgICAgJyk7MTY7IGlmIChvcHRpb25zLmxlbmd0aCA9PSAwKSB7OyBidWYucHVzaCgnICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDE2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgJyk7MTc7IH07IGJ1Zi5wdXNoKCcgICAgPC9tdXRhdGlvbj5cXG4gICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgxOCwgIG9wdGlvbnMudGl0bGUgKSksICc8L3RpdGxlPlxcbiAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgJywgKDIwLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nLCBlc2NhcGUoKDIxLCAgb3B0aW9ucy5zaWRlcyApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiICcsICgyMywgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgJyk7MjU7IGlmIChvcHRpb25zLmxlbmd0aCA9PSAwKSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9sZW5ndGhcIiAnLCAoMjUsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAnKTsyNjsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiICcsICgyNiwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDI3LCAgb3B0aW9ucy5sZW5ndGggKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgJyk7Mjk7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiAnLCAoMzEsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiICcsICgzMywgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoMzQsICAzNjAgLyBvcHRpb25zLnNpZGVzICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L3N0YXRlbWVudD5cXG4gIDwvYmxvY2s+XFxuJyk7NDQ7IH07OyBidWYucHVzaCgnXFxuJyk7NDU7XG4vKipcbiAqIFNwaXJhbCBuZWVkcyBhIG5hbWVkIGhlbHBlciB0ZW1wbGF0ZSBmb3IgcmVjdXJzaW9uLlxuICogQHBhcmFtIGkgTG9vcCBjb250cm9sIHZhcmlhYmxlLlxuICovXG52YXIgc3BpcmFsID0gZnVuY3Rpb24oaSkgezsgYnVmLnB1c2goJyAgJyk7NTA7IGlmIChpIDw9IDYwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgJyk7NTA7IGlmIChpID09IDI1KSB7IDsgYnVmLnB1c2goJ3g9XCIzMDBcIiB5PVwiMTAwXCInKTs1MDsgfSA7IGJ1Zi5wdXNoKCcgaW5saW5lPVwiZmFsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCg1NCwgIGkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJmYWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAnKTs2Njsgc3BpcmFsKGkgKyA1KTsgYnVmLnB1c2goJyAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzcwOyB9IDsgYnVmLnB1c2goJ1xcbicpOzcxOyB9OzsgYnVmLnB1c2goJ1xcbicpOzcyO1xuLyoqXG4gKiBEZWZpbmUgdGhlIHN0YXJ0aW5nIGJsb2NrcyBmb3IgZWFjaCBwYWdlIGFuZCBsZXZlbC5cbiAqIFRoZXNlIGFyZSByZWZlcmVuY2VkIGZyb20gdHVydGxlLmpzLlxuICovXG47IGJ1Zi5wdXNoKCdcXG4nKTs3ODsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgJyk7Nzg7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz5cXG4gICcpOzc5OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiQ09MT1VSXCI+I2ZmMDAwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzk5OyB9IGVsc2UgaWYgKGxldmVsID09IDMgfHwgbGV2ZWwgPT0gNSB8fCBsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicpOzEwMDsgaWYgKGxldmVsID09IDMpIHsgOyBidWYucHVzaCgnNCcpOzEwMDsgfSBlbHNlIHsgOyBidWYucHVzaCgnMycpOzEwMDsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTAyOyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTA2OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwic2V0LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCIgeD1cIjIwXCIgeT1cIjEwMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVCYWNrd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+NDU8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTI5OyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBkZWxldGFibGU9XCJmYWxzZVwiICB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE1MDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTU0OyB9OyBidWYucHVzaCgnJyk7MTU0OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMikgezsgYnVmLnB1c2goJyAgJyk7MTU0OyAvLyBObyBibG9ja3MgYXJlIHByb3ZpZGVkIGZvciBsZXZlbHMgMSBhbmQgMi5cbjsgYnVmLnB1c2goJyAgJyk7MTU0OyBpZiAobGV2ZWwgPT0gMyB8fCBsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgICcpOzE1NDsgLy8gQ2FsbCBcImRyYXcgYSBzcXVhcmVcIi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicpOzE1NzsgaWYgKGxldmVsID09IDMpIHsgOyBidWYucHVzaCgnMTAwJyk7MTU3OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCc1MCcpOzE1NzsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTYxOyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTYxOyAvLyBUaHJlZS1zcXVhcmUgY29kZS5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgaWQ9XCJzZXQtY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTkwOyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDE5MSwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTk0OyBpZiAobGV2ZWwgPT0gNikgeyA7IGJ1Zi5wdXNoKCc1MCcpOzE5NDsgfSBlbHNlIHsgOyBidWYucHVzaCgnMTAnKTsxOTQ7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTk5OyBpZiAobGV2ZWwgPT0gNikgeyA7IGJ1Zi5wdXNoKCc5MCcpOzE5OTsgfSBlbHNlIHsgOyBidWYucHVzaCgnMTAwJyk7MTk5OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzIxMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgICcpOzIxMjsgc3BpcmFsKDI1KTsgYnVmLnB1c2goJyAgJyk7MjEyOyB9IGVsc2UgaWYgKGxldmVsID09IDcuNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgeD1cIjIwXCIgeT1cIjIwXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yNTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjE5OyB9IGVsc2UgaWYgKGxldmVsID09IDggfHwgbGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgeD1cIjIwXCIgeT1cIjIwXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xNTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjI2OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIiB4PVwiMTU4XCIgeT1cIjY3XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNjY7IH07IGJ1Zi5wdXNoKCcnKTsyNjY7IH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAnKTsyNjY7IC8vIERlZmluZSBcImRyYXcgYSBzcXVhcmVcIi5cbjsgYnVmLnB1c2goJyAgJywgKDI2NiwgIHBvbHlnb24oe1xuICAgIHRpdGxlOiBtc2cuZHJhd0FTcXVhcmUoKSxcbiAgICBtb2RpZmllcnM6IChsZXZlbCA9PSA4ID8gJycgOiAneD1cIjIyMFwiIHk9XCI0MFwiJykgKyAnIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyxcbiAgICBzaWRlczogNCxcbiAgICBsZW5ndGg6IChsZXZlbCA+PSA2ID8gMCA6IDEwMClcbiAgfSkpLCAnICAnKTsyNzE7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgICcpOzI3MTsgLy8gRGVmaW5lIFwiZHJhdyBhIGNpcmNsZVwiLlxuOyBidWYucHVzaCgnICAgICcsICgyNzEsICBwb2x5Z29uKHtcbiAgICAgIHRpdGxlOiBtc2cuZHJhd0FDaXJjbGUoKSxcbiAgICAgIG1vZGlmaWVyczogJ3g9XCIyMjBcIiB5PVwiMjUwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInLFxuICAgICAgc2lkZXM6IDM2MCxcbiAgICAgIGxlbmd0aDogMVxuICAgIH0pKSwgJyAgJyk7Mjc2OyB9OyBidWYucHVzaCgnICAnKTsyNzY7IGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMjBcIiB5PVwiMjUwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyNzcsICBtc2cuZHJhd0FUcmlhbmdsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI3OTsgfSBlbHNlIGlmIChsZXZlbCA+PSAzKSB7OyBidWYucHVzaCgnICAgICcpOzI3OTsgLy8gIERlZmluZSBcImRyYXcgYSB0cmlhbmdsZVwiLlxuOyBidWYucHVzaCgnICAgICcsICgyNzksICBwb2x5Z29uKHtcbiAgICAgIHRpdGxlOiBtc2cuZHJhd0FUcmlhbmdsZSgpLFxuICAgICAgbW9kaWZpZXJzOiAobGV2ZWwgPT0gOCA/ICcnIDogJ3g9XCIyMjBcIiB5PVwiMjUwXCInKSArIChsZXZlbCA9PSA2ID8gJycgOiAnIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiJyksXG4gICAgICBzaWRlczogMyxcbiAgICAgIGxlbmd0aDogKGxldmVsID49IDcgPyAwIDogMTAwKVxuICAgIH0pKSwgJyAgJyk7Mjg0OyB9OyBidWYucHVzaCgnICAnKTsyODQ7IGlmIChsZXZlbCA9PSA4ICkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMjg1LCAgbXNnLmRyYXdBSG91c2UoKSApKSwgJ1wiPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgyODYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjk0OyB9OyBidWYucHVzaCgnICAnKTsyOTQ7IGlmIChsZXZlbCA9PSA3IHx8IGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7Mjk0OyAvLyAgRGVmaW5lIFwiZHJhdyBhIGhvdXNlXCIuXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgJyk7Mjk0OyBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJ3g9XCIyMjBcIiB5PVwiNDYwXCInKTsyOTQ7IH07IGJ1Zi5wdXNoKCc+ICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgJyk7Mjk1OyBpZiAobGV2ZWwgPT0gOCkgeyA7IGJ1Zi5wdXNoKCc8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDI5NSwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPicpOzI5NTsgfTsgYnVmLnB1c2goJyAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyOTYsICBtc2cuZHJhd0FIb3VzZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgyOTksICBtc2cuZHJhd0FTcXVhcmUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMzAwLCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCIvPlxcbiAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAnKTszMDM7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMwNCwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICcpOzMwNjsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAnKTszMDk7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgJyk7MzE0OyBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMxNSwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgJyk7MzE3OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAnKTszMjA7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDMzMSwgIG1zZy5kcmF3QVRyaWFuZ2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDMzMiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszMzU7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDMzNiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzMzODsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAnKTszNDE7IH07IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszNTE7IH0gLy8gRW5kIG9mIHJlZ2lvbiBpbiB3aGljaCBcImRyYXcgYSBzcXVhcmVcIiBpcyBkZWZpbmVkLlxuOyBidWYucHVzaCgnJyk7MzUxOyB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkgezsgYnVmLnB1c2goJyAgJyk7MzUxOyBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCIyMzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM5NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDE5OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ1MjsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM2PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0ODU7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1MDc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1NDA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1ODQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Pz8/PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj44MDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzYyODsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzY3MjsgfTsgYnVmLnB1c2goJycpOzY3MjsgfSBlbHNlIGlmIChwYWdlID09IDUpIHs7IGJ1Zi5wdXNoKCcgICcpOzY3MjsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDY5OCwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3MTY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNzQyLCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3NjA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNzg2LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMzQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4MDQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoODEzLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4MTQsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMjcwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4MzgsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDg0MCwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjYwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoODQ5LCAgbXNnLnN0ZXAoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7ODY3OyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj40PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+ODwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoODkzLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICdcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoODk0LCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDg5OCwgIG1zZy5sb29wVmFyaWFibGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4zNjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjcwXCIgeT1cIjMyMFwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTIwLCAgbXNnLnN0ZXAoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg5MjIsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj42MDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDkzMSwgIG1zZy5zdGVwKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzk0OTsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg5NTAsICBtc2cuZHJhd0FUcmVlKCkgKSksICdcIj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTUxLCAgbXNnLmRlcHRoKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoOTUyLCAgbXNnLmJyYW5jaGVzKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjk8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjI8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMTkwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NjcsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NjgsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg5NzAsICBtc2cuZHJhd0FUcmVlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2lmXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJJRjBcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX2NvbXBhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+R1Q8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg5NzgsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJETzBcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiUEVOXCI+cGVuRG93bjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NVUxUSVBMWTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDA5LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMzA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDI2LCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+RElWSURFPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xODA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA0MiwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMTA0OSwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDEwNTAsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDEwNTEsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TUlOVVM8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDU4LCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTA3MCwgIG1zZy5icmFuY2hlcygpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19wZW5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiUEVOXCI+cGVuVXA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUJhY2t3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1VTFRJUExZPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj43PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMTAxLCAgbXNnLmRlcHRoKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTEyNTsgfTsgYnVmLnB1c2goJycpOzExMjU7IH07IGJ1Zi5wdXNoKCcnKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIFNldHMgQmxvY2tseUFwcCBjb25zdGFudHMgdGhhdCBkZXBlbmQgb24gdGhlIHBhZ2UgYW5kIGxldmVsLlxuICogVGhpcyBlbmNhcHN1bGF0ZXMgbWFueSBmdW5jdGlvbnMgdXNlZCBmb3IgU3R1ZGlvQXBwLnJlcXVpcmVkQmxvY2tzXy5cbiAqIEluIHRoZSBmdXR1cmUsIHNvbWUgb2YgdGhlc2UgbWF5IGJlIG1vdmVkIHRvIGNvbW1vbi5qcy5cbiAqL1xuXG52YXIgcmVxdWlyZWRCbG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vcmVxdWlyZWRfYmxvY2tfdXRpbHMnKTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X2Ffc3F1YXJlIGJsb2NrIG9uIHBhZ2UgMi5cbmZ1bmN0aW9uIGRyYXdBU3F1YXJlKG51bWJlcikge1xuICByZXR1cm4ge3Rlc3Q6ICdkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19hX3NxdWFyZScsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKG51bWJlcil9fTtcbn1cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X2Ffc25vd21hbiBibG9jayBvbiBwYWdlIDIuXG5mdW5jdGlvbiBkcmF3QVNub3dtYW4obnVtYmVyKSB7XG4gIHJldHVybiB7dGVzdDogJ2RyYXdfYV9zbm93bWFuJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd19hX3Nub3dtYW4nLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihudW1iZXIpfX07XG59XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbC5cbnZhciBNT1ZFX0ZPUldBUkRfSU5MSU5FID0ge3Rlc3Q6ICdtb3ZlRm9yd2FyZCcsIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnfTtcblxuLy8gYWxsb3cgbW92ZSBmb3J3YXJkIG9yIGJhY2t3YXJkLCBidXQgc2hvdyBmb3J3YXJkIGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG52YXIgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSA9IHtcbiAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd19tb3ZlX2J5X2NvbnN0YW50JztcbiAgfSxcbiAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCdcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBsaW1pdGVkIFwibW92ZSBmb3J3YXJkXCIgYmxvY2sgdXNlZCBvbiB0aGVcbi8vIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbCB3aXRoIHRoZSBnaXZlbiBwaXhlbCBudW1iZXIuXG52YXIgbW92ZUZvcndhcmRJbmxpbmUgPSBmdW5jdGlvbihwaXhlbHMpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnbW92ZUZvcndhcmQnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IHBpeGVsc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLlxudmFyIE1PVkVfQkFDS1dBUkRfSU5MSU5FID0ge3Rlc3Q6ICdtb3ZlQmFja3dhcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlczogeydESVInOiAnbW92ZUJhY2t3YXJkJ319O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhIFtyaWdodF0gZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2tcbi8vIGFuZCBjcmVhdGVzIHRoZSBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWQvcmVjb21tZW5kZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXNcbi8vIGl0cyBpbnB1dC4gIFRoZSByZXN0cmljdGVkIHR1cm4gaXMgdXNlZCBvbiB0aGUgZWFybGllciBsZXZlbHMgb2YgdGhlXG4vLyB0dXRvcmlhbC5cbnZhciB0dXJuUmlnaHRSZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge3Rlc3Q6ICd0dXJuUmlnaHQoJyxcbiAgICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgICAgICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGEgW2xlZnRdIGRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkIGJsb2NrXG4vLyBhbmQgY3JlYXRlcyB0aGUgYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkL3JlY29tbWVuZGVkIG51bWJlciBvZiBkZWdyZWVzIGFzXG4vLyBpdHMgaW5wdXQuICBUaGUgcmVzdHJpY3RlZCB0dXJuIGlzIHVzZWQgb24gdGhlIGVhcmxpZXIgbGV2ZWxzIG9mIHRoZVxuLy8gdHV0b3JpYWwuXG52YXIgdHVybkxlZnRSZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge3Rlc3Q6ICd0dXJuTGVmdCgnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFtyaWdodF0gZHJhd190dXJuX2J5X2NvbnN0YW50IGJsb2NrXG4vLyB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LlxudmFyIHR1cm5SaWdodEJ5Q29uc3RhbnQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnICYmXG4gICAgICAgICAgKGRlZ3JlZXMgPT09ICc/Pz8nIHx8XG4gICAgICAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC52YWx1ZVRvQ29kZShcbiAgICAgICAgICAgICBibG9jaywgJ1ZBTFVFJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX05PTkUpID09IGRlZ3JlZXMpO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBbcmlnaHRdIGRyYXdfdHVybiBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWRcbi8vIG51bWJlciBvZiBkZWdyZWVzIGFzIGl0cyBpbnB1dC4gIEZvciB0aGUgZWFybGllc3QgbGV2ZWxzLCB0aGUgbWV0aG9kXG4vLyB0dXJuUmlnaHRSZXN0cmljdGVkIHNob3VsZCBiZSB1c2VkIGluc3RlYWQuXG52YXIgdHVyblJpZ2h0ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJyAmJlxuICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdESVInKSA9PSAndHVyblJpZ2h0JztcbiAgICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuUmlnaHQnfSxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoZGVncmVlcyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGxlZnQgZHJhd190dXJuIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZFxuLy8gbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LiAgVGhpcyBtZXRob2QgaXMgbm90IGFwcHJvcHJpYXRlIGZvciB0aGVcbi8vIGVhcmxpZXN0IGxldmVscyBvZiB0aGUgdHV0b3JpYWwsIHdoaWNoIGRvIG5vdCBwcm92aWRlIGRyYXdfdHVybi5cbnZhciB0dXJuTGVmdCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybicgJiZcbiAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnRElSJykgPT0gJ3R1cm5MZWZ0JztcbiAgICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybicsXG4gICAgdGl0bGVzOiB7J0RJUic6ICd0dXJuTGVmdCd9LFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkZWdyZWVzKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFueSBkcmF3X21vdmUgYmxvY2sgYW5kLCBpZiBub3QgcHJlc2VudCwgY3JlYXRlc1xuLy8gb25lIHdpdGggdGhlIHNwZWNpZmllZCBkaXN0YW5jZS5cbnZhciBtb3ZlID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgcmV0dXJuIHt0ZXN0OiBmdW5jdGlvbihibG9jaykge3JldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmUnOyB9LFxuICAgICAgICAgIHR5cGU6ICdkcmF3X21vdmUnLFxuICAgICAgICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkaXN0YW5jZSl9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2suXG52YXIgZHJhd1R1cm5SZXN0cmljdGVkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnO1xuICAgIH0sXG4gICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X3R1cm4gYmxvY2suXG52YXIgZHJhd1R1cm4gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybic7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIoJz8/PycpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBcInNldCBjb2xvdXJcIiBibG9jayB3aXRoIGEgY29sb3VyIHBpY2tlclxuLy8gYXMgaXRzIGlucHV0LlxudmFyIFNFVF9DT0xPVVJfUElDS0VSID0ge3Rlc3Q6ICdwZW5Db2xvdXIoXFwnIycsXG4gIHR5cGU6ICdkcmF3X2NvbG91cicsXG4gIHZhbHVlczogeydDT0xPVVInOiAnPGJsb2NrIHR5cGU9XCJjb2xvdXJfcGlja2VyXCI+PC9ibG9jaz4nfX07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgXCJzZXQgY29sb3VyXCIgYmxvY2sgd2l0aCBhIHJhbmRvbSBjb2xvdXJcbi8vIGdlbmVyYXRvciBhcyBpdHMgaW5wdXQuXG52YXIgU0VUX0NPTE9VUl9SQU5ET00gPSB7dGVzdDogJ3BlbkNvbG91cihjb2xvdXJfcmFuZG9tJyxcbiAgdHlwZTogJ2RyYXdfY29sb3VyJyxcbiAgdmFsdWVzOiB7J0NPTE9VUic6ICc8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPid9fTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVxdWlyZWQgYmxvY2sgc3BlY2lmaWNhdGlvbiBmb3IgZGVmaW5pbmcgYSBmdW5jdGlvbiB3aXRoIGFuXG4gKiBhcmd1bWVudC4gIFVubGlrZSB0aGUgb3RoZXIgZnVuY3Rpb25zIHRvIGNyZWF0ZSByZXF1aXJlZCBibG9ja3MsIHRoaXNcbiAqIGlzIGRlZmluZWQgb3V0c2lkZSBvZiBUdXJ0bGUuc2V0QmxvY2tseUFwcENvbnN0YW50cyBiZWNhdXNlIGl0IGlzIGFjY2Vzc2VkXG4gKiB3aGVuIGNoZWNraW5nIGZvciBhIHByb2NlZHVyZSBvbiBsZXZlbHMgOC05IG9mIFR1cnRsZSAzLlxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bmNfbmFtZSBUaGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gYXJnX25hbWUgVGhlIG5hbWUgb2YgdGhlIHNpbmdsZSBhcmd1bWVudC5cbiAqIEByZXR1cm4gQSByZXF1aXJlZCBibG9jayBzcGVjaWZpY2F0aW9uIHRoYXQgdGVzdHMgZm9yIGEgY2FsbCBvZiB0aGVcbiAqICAgICBzcGVjaWZpZWQgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50IG5hbWUuICBJZiBub3QgcHJlc2VudCxcbiAqICAgICB0aGlzIGNvbnRhaW5zIHRoZSBpbmZvcm1hdGlvbiB0byBjcmVhdGUgc3VjaCBhIGJsb2NrIGZvciBkaXNwbGF5LlxuICovXG52YXIgZGVmaW5lV2l0aEFyZyA9IGZ1bmN0aW9uKGZ1bmNfbmFtZSwgYXJnX25hbWUpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ3Byb2NlZHVyZXNfZGVmbm9yZXR1cm4nICYmXG4gICAgICAgICAgYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IGZ1bmNfbmFtZSAmJlxuICAgICAgICAgIGJsb2NrLnBhcmFtZXRlck5hbWVzXyAmJiBibG9jay5wYXJhbWV0ZXJOYW1lc18ubGVuZ3RoICYmXG4gICAgICAgICAgYmxvY2sucGFyYW1ldGVyTmFtZXNfWzBdID09IGFyZ19uYW1lO1xuICAgIH0sXG4gICAgdHlwZTogJ3Byb2NlZHVyZXNfZGVmbm9yZXR1cm4nLFxuICAgIHRpdGxlczogeydOQU1FJzogZnVuY19uYW1lfSxcbiAgICBleHRyYTogJzxtdXRhdGlvbj48YXJnIG5hbWU9XCInICsgYXJnX25hbWUgKyAnXCI+PC9hcmc+PC9tdXRhdGlvbj4nXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWFrZU1hdGhOdW1iZXI6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcixcbiAgc2ltcGxlQmxvY2s6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jayxcbiAgcmVwZWF0OiByZXF1aXJlZEJsb2NrVXRpbHMucmVwZWF0LFxuICBkcmF3QVNxdWFyZTogZHJhd0FTcXVhcmUsXG4gIGRyYXdBU25vd21hbjogZHJhd0FTbm93bWFuLFxuICBNT1ZFX0ZPUldBUkRfSU5MSU5FOiBNT1ZFX0ZPUldBUkRfSU5MSU5FLFxuICBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FOiBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FLFxuICBtb3ZlRm9yd2FyZElubGluZTogbW92ZUZvcndhcmRJbmxpbmUsXG4gIE1PVkVfQkFDS1dBUkRfSU5MSU5FOiBNT1ZFX0JBQ0tXQVJEX0lOTElORSxcbiAgdHVybkxlZnRSZXN0cmljdGVkOiB0dXJuTGVmdFJlc3RyaWN0ZWQsXG4gIHR1cm5SaWdodFJlc3RyaWN0ZWQ6IHR1cm5SaWdodFJlc3RyaWN0ZWQsXG4gIHR1cm5SaWdodEJ5Q29uc3RhbnQ6IHR1cm5SaWdodEJ5Q29uc3RhbnQsXG4gIHR1cm5SaWdodDogdHVyblJpZ2h0LFxuICB0dXJuTGVmdDogdHVybkxlZnQsXG4gIG1vdmU6IG1vdmUsXG4gIGRyYXdUdXJuUmVzdHJpY3RlZDogZHJhd1R1cm5SZXN0cmljdGVkLFxuICBkcmF3VHVybjogZHJhd1R1cm4sXG4gIFNFVF9DT0xPVVJfUElDS0VSOiBTRVRfQ09MT1VSX1BJQ0tFUixcbiAgU0VUX0NPTE9VUl9SQU5ET006IFNFVF9DT0xPVVJfUkFORE9NLFxuICBkZWZpbmVXaXRoQXJnOiBkZWZpbmVXaXRoQXJnLFxufTtcbiIsIm1vZHVsZS5leHBvcnRzLmJsb2NrcyA9IFtcbiAgeydmdW5jJzogJ21vdmVGb3J3YXJkJywgJ2NhdGVnb3J5JzogJ0FydGlzdCcsICdwYXJhbXMnOiBbXCIxMDBcIl0sICdpZEFyZ0xhc3QnOiB0cnVlIH0sXG4gIHsnZnVuYyc6ICd0dXJuUmlnaHQnLCAnY2F0ZWdvcnknOiAnQXJ0aXN0JywgJ3BhcmFtcyc6IFtcIjkwXCJdLCAnaWRBcmdMYXN0JzogdHJ1ZSB9LFxuICB7J2Z1bmMnOiAncGVuQ29sb3VyJywgJ2NhdGVnb3J5JzogJ0FydGlzdCcsICdwYXJhbXMnOiBbXCInI2ZmMDAwMCdcIl0sICdpZEFyZ0xhc3QnOiB0cnVlIH0sXG4gIHsnZnVuYyc6ICdwZW5XaWR0aCcsICdjYXRlZ29yeSc6ICdBcnRpc3QnLCAncGFyYW1zJzogW1wiMVwiXSwgJ2lkQXJnTGFzdCc6IHRydWUgfSxcbl07XG5cbm1vZHVsZS5leHBvcnRzLmNhdGVnb3JpZXMgPSB7XG4gICdBcnRpc3QnOiB7XG4gICAgJ2NvbG9yJzogJ3JlZCcsXG4gICAgJ2Jsb2Nrcyc6IFtdXG4gIH0sXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwic2xpZGVyLWNlbGxcIj5cXG4gIDxzdmcgaWQ9XCJzbGlkZXJcIlxcbiAgICAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcXG4gICAgICAgeG1sbnM6c3ZnPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxcbiAgICAgICB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxcbiAgICAgICB2ZXJzaW9uPVwiMS4xXCJcXG4gICAgICAgd2lkdGg9XCIxNTBcIlxcbiAgICAgICBoZWlnaHQ9XCI1MFwiPlxcbiAgICAgIDwhLS0gU2xvdyBpY29uLiAtLT5cXG4gICAgICA8Y2xpcFBhdGggaWQ9XCJzbG93Q2xpcFBhdGhcIj5cXG4gICAgICAgIDxyZWN0IHdpZHRoPTI2IGhlaWdodD0xMiB4PTUgeT0xNCAvPlxcbiAgICAgIDwvY2xpcFBhdGg+XFxuICAgICAgPGltYWdlIHhsaW5rOmhyZWY9XCInLCBlc2NhcGUoKDEzLCAgYXNzZXRVcmwoaWNvblBhdGgpICkpLCAnXCIgaGVpZ2h0PTQyIHdpZHRoPTg0IHg9LTIxIHk9LTEwXFxuICAgICAgICAgIGNsaXAtcGF0aD1cInVybCgjc2xvd0NsaXBQYXRoKVwiIC8+XFxuICAgICAgPCEtLSBGYXN0IGljb24uIC0tPlxcbiAgICAgIDxjbGlwUGF0aCBpZD1cImZhc3RDbGlwUGF0aFwiPlxcbiAgICAgICAgPHJlY3Qgd2lkdGg9MjYgaGVpZ2h0PTE2IHg9MTIwIHk9MTAgLz5cXG4gICAgICA8L2NsaXBQYXRoPlxcbiAgICAgIDxpbWFnZSB4bGluazpocmVmPVwiJywgZXNjYXBlKCgxOSwgIGFzc2V0VXJsKGljb25QYXRoKSApKSwgJ1wiIGhlaWdodD00MiB3aWR0aD04NCB4PTEyMCB5PS0xMVxcbiAgICAgICAgICBjbGlwLXBhdGg9XCJ1cmwoI2Zhc3RDbGlwUGF0aClcIiAvPlxcbiAgPC9zdmc+XFxuICA8aW1nIGlkPVwic3Bpbm5lclwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvdHVydGxlL2xvYWRpbmcuZ2lmJykgKSksICdcIiBoZWlnaHQ9MTUgd2lkdGg9MTU+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBBIHNldCBvZiBibG9ja3MgdXNlZCBieSBzb21lIG9mIG91ciBjdXN0b20gbGV2ZWxzIChpLmUuIGJ1aWx0IGJ5IGxldmVsIGJ1aWxkZXIpXG4gKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuIGluc3RhbGxEcmF3QVNxdWFyZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbENyZWF0ZUFDaXJjbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlQnJhbmNoKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FUcmlhbmdsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBSG91c2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUZsb3dlcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBU25vd2ZsYWtlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FIZXhhZ29uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FTdGFyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSb2JvdChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUm9ja2V0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FQbGFuZXQoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJob21idXMoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3VXBwZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0xvd2VyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG5cbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZURyb3Bkb3duKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUFDaXJjbGVDb2RlIChzaXplLCBnZW5zeW0sIGluZGVudCkge1xuICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgaW5kZW50ID0gaW5kZW50IHx8ICcnO1xuICByZXR1cm4gW1xuICAgIGluZGVudCArICcvLyBjcmVhdGVfYV9jaXJjbGUnLFxuICAgIGluZGVudCArICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzNjsgJyArXG4gICAgaW5kZW50ICsgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgaW5kZW50ICsgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyBzaXplICsgJyk7JyxcbiAgICBpbmRlbnQgKyAnICBUdXJ0bGUudHVyblJpZ2h0KDEwKTsnLFxuICAgIGluZGVudCArICd9XFxuJ10uam9pbignXFxuJyk7XG59XG5cblxuLyoqXG4gKiBTYW1lIGFzIGRyYXdfYV9zcXVhcmUsIGV4Y2VwdCBpbnB1dHMgYXJlIG5vdCBpbmxpbmVkXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNxdWFyZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zcXVhcmVfY3VzdG9tID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FTcXVhcmUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3F1YXJlX2N1c3RvbSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV9zcXVhcmUnLFxuICAgICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgNDsgJyArXG4gICAgICAgICAgICAgIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogY3JlYXRlX2FfY2lyY2xlIGFuZCBjcmVhdGVfYV9jaXJjbGVfc2l6ZVxuICogZmlyc3QgZGVmYXVsdHMgdG8gc2l6ZSAxMCwgc2Vjb25kIHByb3ZpZGVzIGEgc2l6ZSBwYXJhbVxuICovXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQUNpcmNsZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9jaXJjbGUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5jcmVhdGVBQ2lyY2xlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX2NpcmNsZV9zaXplID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuY3JlYXRlQUNpcmNsZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zaXplUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9jaXJjbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoMTAsIGdlbnN5bSk7XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZV9zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgcmV0dXJuIGNyZWF0ZUFDaXJjbGVDb2RlKHNpemUsIGdlbnN5bSk7XG4gIH07XG59XG5cbi8qKlxuICogY3JlYXRlX2Ffc25vd2Zsb3dlclxuICovXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZUJyYW5jaChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuY3JlYXRlQVNub3dmbGFrZUJyYW5jaCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJy8vIGNyZWF0ZV9hX3Nub3dmbGFrZV9icmFuY2gnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCg5MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICAgIFR1cnRsZS50dXJuUmlnaHQoNDUpOycsXG4gICAgICAnICB9JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoNDUpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg0NSk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBEcmF3IGEgcmhvbWJ1cyBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJob21idXMoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfcmhvbWJ1cyA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUmhvbWJ1cygpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yaG9tYnVzID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDI7ICcgK1xuICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxMjApOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVRyaWFuZ2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3RyaWFuZ2xlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FUcmlhbmdsZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV90cmlhbmdsZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgdHJpYW5nbGUgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FIZXhhZ29uKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hleGFnb24gPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QUhleGFnb24oKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfaGV4YWdvbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJy8vIGRyYXdfYV90cmlhbmdsZScsXG4gICAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA2OyAnICtcbiAgICAgICAgICAgICAgbG9vcFZhciArICcrKykgeycsXG4gICAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDYwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBob3VzZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhvdXNlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hvdXNlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0FIb3VzZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9ob3VzZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxMjApOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgZmxvd2VyIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBRmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2Zsb3dlciA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBRmxvd2VyKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2Zsb3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICB2YXIgY29sb3JfcmFuZG9tID0gZ2VuZXJhdG9yLmNvbG91cl9yYW5kb20oKVswXTtcbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMjI4YjIyXCIpOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAxMDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLnBlbkNvbG91cignICsgY29sb3JfcmFuZG9tICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgzNik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyAvIDIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUJhY2t3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnLyAyKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTk4KTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDE4MCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHNub3dmbGFrZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVNub3dmbGFrZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93Zmxha2UgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVNub3dmbGFrZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dmbGFrZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICB2YXIgY29sb3JfcmFuZG9tID0gZ2VuZXJhdG9yLmNvbG91cl9yYW5kb20oKVswXTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDg7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5wZW5Db2xvdXIoXCIjN2ZmZmQ0XCIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMzApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDE1KTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMTUpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDMwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg0NSk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHN0YXIgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FTdGFyKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3N0YXIgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVN0YXIoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0QWxpZ24oYmxvY2tseS5BTElHTl9SSUdIVClcbiAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKyAnOicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3RhciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgNTsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCgxNDQpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDE4KTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgcm9ib3QgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FSb2JvdChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2JvdCA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBUm9ib3QoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2JvdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRyYXdpbmcgYSBzcXVhcmUuXG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxNSk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMzApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDIxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgxMTUpOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg1MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDUwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2NrZXQgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVJvY2tldCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9yb2NrZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICB2YXIgbG9vcFZhcjIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjZmYwMDAwXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDAwMFwiKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdUdXJ0bGUuanVtcEZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIyICsgJyA9IDA7ICcgKyBsb29wVmFyMiArICcgPCAzOyAnICsgbG9vcFZhcjIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDIwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHBsYW5ldCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVBsYW5ldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICAvLyBDcmVhdGUgYSBmYWtlIFwiZHJhdyBhIHNxdWFyZVwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0byB1c2Vyc1xuICAvLyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9wbGFuZXQgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3QVBsYW5ldCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9wbGFuZXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzgwODA4MFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM2MDsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVCYWNrd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMSk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyB1cHBlciB3YXZlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdVcHBlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgLy8gQ3JlYXRlIGEgZmFrZSBcImRyYXcgYSBzcXVhcmVcIiBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgbWFkZSBhdmFpbGFibGUgdG8gdXNlcnNcbiAgLy8gd2l0aG91dCBiZWluZyBzaG93biBpbiB0aGUgd29ya3NwYWNlLlxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3VwcGVyX3dhdmUgPSB7XG4gICAgLy8gRHJhdyBhIHNxdWFyZS5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDk0LCAwLjg0LCAwLjYwKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kcmF3VXBwZXJXYXZlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKEJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd191cHBlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgbG93ZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19sb3dlcl93YXZlID0ge1xuICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZHJhd0xvd2VyV2F2ZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhCbG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSArICc6Jyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKCcnKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbG93ZXJfd2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZURyb3Bkb3duKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIHZhciBzbm93Zmxha2VzID0gW1xuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3F1YXJlKCksICdzcXVhcmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVBhcmFsbGVsb2dyYW0oKSwgJ3BhcmFsbGVsb2dyYW0nXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUxpbmUoKSwgJ2xpbmUnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZVNwaXJhbCgpLCAnc3BpcmFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGbG93ZXIoKSwgJ2Zsb3dlciddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlRnJhY3RhbCgpLCAnZnJhY3RhbCddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUmFuZG9tKCksICdyYW5kb20nXVxuICBdO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9zbm93Zmxha2VfZHJvcGRvd24gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihzbm93Zmxha2VzKSwgJ1RZUEUnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX3Nub3dmbGFrZV9kcm9wZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVFlQRScpO1xuICAgIHJldHVybiBcIlR1cnRsZS5kcmF3U25vd2ZsYWtlKCdcIiArIHR5cGUgKyBcIicsICdibG9ja19pZF9cIiArIHRoaXMuaWQgKyBcIicpO1wiO1xuICB9O1xufVxuIiwiLy8gbG9jYWxlIGZvciB0dXJ0bGVcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkudHVydGxlX2xvY2FsZTtcbiIsIi8vIENyZWF0ZSBhIGxpbWl0ZWQgY29sb3VyIHBhbGV0dGUgdG8gYXZvaWQgb3ZlcndoZWxtaW5nIG5ldyB1c2Vyc1xuLy8gYW5kIHRvIG1ha2UgY29sb3VyIGNoZWNraW5nIGVhc2llci4gIFRoZXNlIGRlZmluaXRpb25zIGNhbm5vdCBiZVxuLy8gbW92ZWQgdG8gYmxvY2tzLmpzLCB3aGljaCBpcyBsb2FkZWQgbGF0ZXIsIHNpbmNlIHRoZXkgYXJlIHVzZWQgaW5cbi8vIHRvcC1sZXZlbCBkZWZpbml0aW9ucyBiZWxvdy4gIE5vdGUgdGhhdCB0aGUgaGV4IGRpZ2l0cyBhLWYgYXJlXG4vLyBsb3dlci1jYXNlLiAgVGhpcyBpcyBhc3N1bWVkIGluIGNvbXBhcmlzb25zIGJlbG93LlxudmFyIENvbG91cnMgPSB7XG4gIEJMQUNLOiAnIzAwMDAwMCcsXG4gIEdSRVk6ICcjODA4MDgwJyxcbiAgS0hBS0k6ICcjYzNiMDkxJyxcbiAgV0hJVEU6ICcjZmZmZmZmJyxcbiAgUkVEOiAnI2ZmMDAwMCcsXG4gIFBJTks6ICcjZmY3N2ZmJyxcbiAgT1JBTkdFOiAnI2ZmYTAwMCcsXG4gIFlFTExPVzogJyNmZmZmMDAnLFxuICBHUkVFTjogJyMyMjhiMjInLFxuICBCTFVFOiAnIzAwMDBjZCcsXG4gIEFRVUFNQVJJTkU6ICcjN2ZmZmQ0JyxcbiAgUExVTTogJyM4NDMxNzknLFxuXG4gIEZST1pFTjE6IFwiI2QwZmRmZFwiLFxuICBGUk9aRU4yOiBcIiNkMGZkZDBcIixcbiAgRlJPWkVOMzogXCIjZDBkMGZkXCIsXG4gIEZST1pFTjQ6IFwiI2UwZTBlMFwiLFxuICBGUk9aRU41OiAnI2ZmZmZmZicsXG4gIEZST1pFTjY6IFwiI2U4ZThlOFwiLFxuICBGUk9aRU43OiBcIiNiYmQxZTRcIixcbiAgRlJPWkVOODogXCIjZmRkMGZkXCIsXG4gIEZST1pFTjk6IFwiI2FlYTRmZlwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG91cnM7XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTMgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFNhbXBsZSBhbnN3ZXJzIGZvciBUdXJ0bGUgbGV2ZWxzLiBVc2VkIGZvciBwcm9tcHRzIGFuZCBtYXJraW5nLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIEFydGlzdEFQSSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgYXBpID0gbmV3IEFydGlzdEFQSSgpO1xuXG52YXIgc2V0UmFuZG9tVmlzaWJsZUNvbG91ciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMiwgMjQpKTtcbiAgLy8gTWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBjb21wb25lbnQgaXMgYmVsb3cgMHg4MCBhbmQgdGhlIHJlc3RcbiAgLy8gYmVsb3cgMHhBMCwgdG8gcHJldmVudCB0b28gbGlnaHQgb2YgY29sb3Vycy5cbiAgbnVtICY9IDB4OWY3ZjlmO1xuICB2YXIgY29sb3VyID0gJyMnICsgKCcwMDAwMCcgKyBudW0udG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpO1xuICBhcGkucGVuQ29sb3VyKGNvbG91cik7XG59O1xuXG52YXIgZHJhd1NxdWFyZSA9IGZ1bmN0aW9uKGxlbmd0aCwgcmFuZG9tX2NvbG91cikge1xuICBmb3IgKHZhciBjb3VudCA9IDA7IGNvdW50IDwgNDsgY291bnQrKykge1xuICAgIGlmIChyYW5kb21fY29sb3VyKSB7XG4gICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgfVxuICAgIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICB9XG59O1xuXG52YXIgZHJhd1RyaWFuZ2xlID0gZnVuY3Rpb24obGVuZ3RoLCByYW5kb21fY29sb3VyKSB7XG4gIGZvciAodmFyIGNvdW50ID0gMDsgY291bnQgPCAzOyBjb3VudCsrKSB7XG4gICAgaWYgKHJhbmRvbV9jb2xvdXIpIHtcbiAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICB9XG4gICAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gICAgYXBpLnR1cm5SaWdodCgxMjApO1xuICB9XG59O1xuXG52YXIgZHJhd1Nub3dtYW4gPSBmdW5jdGlvbihoZWlnaHQpIHtcbiAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgdmFyIGRpc3RhbmNlcyA9IFtoZWlnaHQgKiAwLjUsIGhlaWdodCAqIDAuMywgaGVpZ2h0ICogMC4yXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICB2YXIgZGlzdGFuY2UgPSBkaXN0YW5jZXNbaSA8IDMgPyBpIDogNSAtIGldIC8gNTcuNTtcbiAgICBmb3IgKHZhciBkID0gMDsgZCA8IDE4MDsgZCArPSAyKSB7XG4gICAgICBhcGkubW92ZUZvcndhcmQoZGlzdGFuY2UpO1xuICAgICAgYXBpLnR1cm5SaWdodCgyKTtcbiAgICB9XG4gICAgaWYgKGkgIT0gMikge1xuICAgICAgYXBpLnR1cm5SaWdodCgxODApO1xuICAgIH1cbiAgfVxuICBhcGkudHVybkxlZnQoOTApO1xufTtcblxudmFyIGRyYXdIb3VzZSA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICBkcmF3U3F1YXJlKGxlbmd0aCk7XG4gIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICBhcGkudHVyblJpZ2h0KDMwKTtcbiAgZHJhd1RyaWFuZ2xlKGxlbmd0aCk7XG4gIGFwaS50dXJuUmlnaHQoNjApO1xuICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgYXBpLm1vdmVCYWNrd2FyZChsZW5ndGgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb2cgb2YgYSBzYW1wbGUgc29sdXRpb25zIGZvciBlYWNoIGxldmVsLlxuICogVG8gY3JlYXRlIGFuIGFuc3dlciwganVzdCBzb2x2ZSB0aGUgbGV2ZWwgaW4gQmxvY2tseSwgdGhlbiBwYXN0ZSB0aGVcbiAqIHJlc3VsdGluZyBKYXZhU2NyaXB0IGhlcmUsIG1vdmluZyBhbnkgZnVuY3Rpb25zIHRvIHRoZSBiZWdpbm5pbmcgb2ZcbiAqIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydHMuYW5zd2VyID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgYXBpLmxvZyA9IFtdO1xuICB2YXIgY291bnQsIHNpZGVJZHgsIGxlbjtcbiAgaWYgKHBhZ2UgPT0gMSkge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRWwuXG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBTcXVhcmUuXG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDAsIGZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIFVzZSByZXBlYXQgdG8gZHJhdyBhIHNxdWFyZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDAsIGZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIEVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwLCB0cnVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIC8vIFNpZGV3YXlzIGVudmVsb3BlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgLy8gVHJpYW5nbGUgYW5kIHNxdWFyZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGFwaS50dXJuUmlnaHQoMTgwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gR2xhc3Nlcy5cbiAgICAgICAgYXBpLnBlbkNvbG91cignIzAwY2MwMCcpOyAgLy8gYmx1ZVxuICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBhcGkubW92ZUJhY2t3YXJkKDE1MCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIC8vIFNwaWt5LlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCA4OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS5tb3ZlQmFja3dhcmQoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDQ1KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgLy8gQ2lyY2xlLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjA7IGNvdW50KyspIHtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMSk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBTaW5nbGUgc3F1YXJlIGluIHNvbWUgY29sb3IuXG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gU2luZ2xlIGdyZWVuIHNxdWFyZS5cbiAgICAgICAgYXBpLnBlbkNvbG91cignIzAwZmYwMCcpOyAgLy8gZ3JlZW5cbiAgICAgICAgZHJhd1NxdWFyZSg1MCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBUaHJlZSBzcXVhcmVzLCAxMjAgZGVncmVlcyBhcGFydCwgaW4gcmFuZG9tIGNvbG9ycy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMzsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxMjApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyAzNiBzcXVhcmVzLCAxMCBkZWdyZWVzIGFwYXJ0LCBpbiByYW5kb20gY29sb3JzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6ICAvLyBEcmF3IHdpdGhvdXQgdXNpbmcgZm9yLWxvb3AuICAoRmFsbCB0aHJvdWdoIHRvIG5leHQgY2FzZS4pXG4gICAgICBjYXNlIDY6XG4gICAgICAgIC8vIFNxdWFyZXMgd2l0aCBzaWRlcyBvZiA1MCwgNjAsIDcwLCA4MCwgYW5kIDkwIHBpeGVscy5cbiAgICAgICAgZm9yIChsZW4gPSA1MDsgbGVuIDw9IDkwOyBsZW4gKz0gMTApIHtcbiAgICAgICAgICBkcmF3U3F1YXJlKGxlbik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIC8vIE1pbmktc3BpcmFsLlxuICAgICAgICBmb3IgKGxlbiA9IDI1OyBsZW4gPD0gNjA7IGxlbiArPSA1KSB7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKGxlbik7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDcuNTpcbiAgICAgICAgZHJhd1Nub3dtYW4oMjUwKTtcbiAgICAgICAgZHJhd1Nub3dtYW4oMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIC8vIFNhbWUtaGVpZ2h0IHNub3dtZW4uXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTbm93bWFuKDE1MCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgICAgYXBpLmp1bXBGb3J3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgLy8gRGlmZmVyZW50IGhlaWdodCBzbm93bWVuLlxuICAgICAgICBmb3IgKHZhciBoZWlnaHQgPSAxMTA7IGhlaWdodCA+PSA3MDsgaGVpZ2h0IC09IDEwKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdTbm93bWFuKGhlaWdodCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgICAgYXBpLmp1bXBGb3J3YXJkKDYwKTtcbiAgICAgICAgICBhcGkudHVybkxlZnQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDMpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIERyYXcgYSBzcXVhcmUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIERyYXcgYSB0cmlhbmdsZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEwMCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gRHJhdyBhIGhvdXNlIHVzaW5nIFwiZHJhdyBhIHNxdWFyZVwiIGFuZCBcImRyYXcgYSB0cmlhbmdsZVwiLlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIC8vIERyYXcgYSBob3VzZSB1c2luZyBhIGZ1bmN0aW9uLlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgyMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgLy8gQWRkIGEgcGFyYW1ldGVyIHRvIHRoZSBcImRyYXcgYSBob3VzZVwiIHByb2NlZHVyZS5cbiAgICAgICAgZHJhd0hvdXNlKDE1MCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgZHJhd0hvdXNlKDE1MCk7XG4gICAgICAgIGRyYXdIb3VzZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgZm9yIChjb3VudCA9IDUwOyBjb3VudCA8PSAxNTA7IGNvdW50ICs9IDUwKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdIb3VzZShjb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gNCkge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gRHJhdyBhbiBlcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBEcmF3IHR3byBlcXVpbGF0ZXJhbCB0cmlhbmdsZXMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDI7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIC8vIERyYXcgZm91ciBlcXVpbGF0ZXJhbCB0cmlhbmdsZXMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMzYpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAzNjsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDEwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDQ7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgZm9yIChzaWRlSWR4ID0gMDsgc2lkZUlkeCA8IDQ7IHNpZGVJZHgrKykge1xuICAgICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDEwOyBjb3VudCsrKSB7XG4gICAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgICBkcmF3U3F1YXJlKDIwKTtcbiAgICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgyMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFwaS50dXJuUmlnaHQoODApO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgMTA6XG4gICAgICAgIGZvciAoc2lkZUlkeCA9IDA7IHNpZGVJZHggPCA5OyBzaWRlSWR4KyspIHtcbiAgICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDgwKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcGkubG9nO1xufTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBBcnRpc3QgQVBJIGxvZ2ljLiBUaGUgbWV0aG9kcyBvbiB0aGlzIG9iamVjdCBhcmUgY2FsbGVkIGJ5XG4gKiBnZW5lcmF0ZWQgdXNlciBjb2RlLiBBcyB0aGV5IGFyZSBjYWxsZWQsIHRoZXkgaW5zZXJ0IGNvbW1hbmRzIGludG8gdGhpcy5sb2cuXG4gKiBOT1RFOiB0aGlzLmxvZyBpcyBhbHNvIG1vZGlmaWVkIGluIHNvbWUgY2FzZXMgZXh0ZXJuYWxseSAoYm90aCBhY2Nlc3NlZCBhbmRcbiAqIEkgdGhpbmsgY2xlYXJlZCkuXG4gKi9cbnZhciBBcnRpc3RBUEkgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubG9nID0gW107XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFydGlzdEFQSTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3Q2lyY2xlID0gZnVuY3Rpb24gKHNpemUsIGlkKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzY7IGkrKykge1xuICAgIHRoaXMubW92ZUZvcndhcmQoc2l6ZSwgaWQpO1xuICAgIHRoaXMudHVyblJpZ2h0KDEwLCBpZCk7XG4gIH1cbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZHJhd1Nub3dmbGFrZSA9IGZ1bmN0aW9uICh0eXBlLCBpZCkge1xuICB2YXIgaSwgaiwgaztcblxuICAvLyBtaXJvcnMgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uXG4gIHZhciByYW5kb21fY29sb3VyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb2xvcnMgPSBCbG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlM7XG4gICAgcmV0dXJuIGNvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY29sb3JzLmxlbmd0aCldO1xuICB9O1xuXG4gIGlmICh0eXBlID09PSAncmFuZG9tJykge1xuICAgIHR5cGUgPSBfLnNhbXBsZShbJ2ZyYWN0YWwnLCAnZmxvd2VyJywgJ3NwaXJhbCcsICdsaW5lJywgJ3BhcmFsbGVsb2dyYW0nLCAnc3F1YXJlJ10pO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpIHtcbiAgICBjYXNlICdmcmFjdGFsJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgdGhpcy5qdW1wRm9yd2FyZCg0NSwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5MZWZ0KDQ1LCBpZCk7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgMzsgaysrKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgICB0aGlzLm1vdmVCYWNrd2FyZCgxNSwgaWQpO1xuICAgICAgICAgICAgdGhpcy50dXJuUmlnaHQoNDUsIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy50dXJuTGVmdCg5MCwgaWQpO1xuICAgICAgICAgIHRoaXMubW92ZUJhY2t3YXJkKDE1LCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuTGVmdCg0NSwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDkwLCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2Zsb3dlcic6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSgyLCBpZCk7XG4gICAgICAgIHRoaXMuZHJhd0NpcmNsZSg0LCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDcyLCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3NwaXJhbCc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMjA7IGkrKykge1xuICAgICAgICB0aGlzLmRyYXdDaXJjbGUoMywgaWQpO1xuICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDIwLCBpZCk7XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDE4LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDkwOyBpKyspIHtcbiAgICAgICAgdGhpcy5wZW5Db2xvdXIocmFuZG9tX2NvbG91cigpKTtcbiAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCg1MCwgaWQpO1xuICAgICAgICB0aGlzLm1vdmVCYWNrd2FyZCg1MCwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5SaWdodCg0LCBpZCk7XG4gICAgICB9XG4gICAgICB0aGlzLnBlbkNvbG91cihcIiNGRkZGRkZcIiwgaWQpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwYXJhbGxlbG9ncmFtJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAyOyBqKyspIHtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoNjAsIGlkKTtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoMTIwLCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMzYsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgICAgICB0aGlzLm1vdmVGb3J3YXJkKDUwLCBpZCk7XG4gICAgICAgICAgdGhpcy50dXJuUmlnaHQoOTAsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCgzNiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlRm9yd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnRkQnLCBkaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZUJhY2t3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydGRCcsIC1kaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZVVwID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlRG93biA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMTgwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlTGVmdCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMjcwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5tb3ZlUmlnaHQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDkwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wVXAgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAxODAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAyNzAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgOTAsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmp1bXBGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRicsIGRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pGJywgLWRpc3RhbmNlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS50dXJuUmlnaHQgPSBmdW5jdGlvbihhbmdsZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1JUJywgYW5nbGUsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnR1cm5MZWZ0ID0gZnVuY3Rpb24oYW5nbGUsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydSVCcsIC1hbmdsZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZ2xvYmFsQWxwaGEgPSBmdW5jdGlvbiAoYWxwaGEsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydHQScsIGFscGhhLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5VcCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQVScsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbkRvd24gPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUEQnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5XaWR0aCA9IGZ1bmN0aW9uKHdpZHRoLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFcnLCBNYXRoLm1heCh3aWR0aCwgMCksIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnBlbkNvbG91ciA9IGZ1bmN0aW9uKGNvbG91ciwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BDJywgY29sb3VyLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5QYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BTJywgcGF0dGVybiwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuaGlkZVR1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydIVCcsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLnNob3dUdXJ0bGUgPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnU1QnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5kcmF3U3RhbXAgPSBmdW5jdGlvbihzdGFtcCwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ3N0YW1wJywgc3RhbXAsIGlkXSk7XG59O1xuIl19
