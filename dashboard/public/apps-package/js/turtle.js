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
  skin.stampValues = [[skin.stickers.elephant, 'Elephant'], [skin.stickers.dragon, 'Dragon'], [skin.stickers.triceratops, 'Triceratops'], [skin.stickers.monkey, 'Monkey'], [skin.stickers.cat, 'Cat'], [skin.stickers.turtle, 'Turtle'], [skin.stickers.goat, 'Goat'], [skin.stickers.zebra, 'Zebra'], [skin.stickers.hippo, 'Hippo'], [skin.stickers.bunny, 'Bunny'], [skin.stickers.peacock, 'Peacock'], [skin.stickers.llama, 'Llama'], [skin.stickers.giraffe, 'Giraffe'], [skin.stickers.mouse, 'Mouse'], [skin.stickers.beaver, 'Beaver'], [skin.stickers.bat, 'Bat'], [skin.stickers.grasshopper, 'Grasshopper'], [skin.stickers.chicken, 'Chicken'], [skin.stickers.moose, 'Moose'], [skin.stickers.owl, 'Owl'], [skin.stickers.penguin, 'Penguin'], [skin.stickers.lion, 'Lion'], [skin.stickers.robot, 'Robot'], [skin.stickers.rocket, 'Rocket']];

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
      dropdown = new blockly.FieldImageDropdown(this.VALUES, 60, 50);

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
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var Slider = require('../slider');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var MAX_STICKER_SIZE = 150;

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

  var renderCodeWorkspace = (function () {
    return codeWorkspaceEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        localeDirection: this.studioApp_.localeDirection(),
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: this.level.editCode,
        blockCounterClass: 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  }).bind(this);

  var renderVisualizationColumn = (function () {
    return visualizationColumnEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        visualization: '',
        controls: require('./controls.html.ejs')({ assetUrl: this.studioApp_.assetUrl, iconPath: iconPath })
      }
    });
  }).bind(this);

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: this.studioApp_.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
    onMount: this.studioApp_.init.bind(this.studioApp_, config)
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
      this.ctxScratch.rotate(utils.degreesToRadians(this.heading - 90));
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

      var dimensions = scaleToBoundingBox(MAX_STICKER_SIZE, img.width, img.height);
      var width = dimensions.width;
      var height = dimensions.height;

      // Rotate the image such the the turtle is at the center of the bottom of
      // the image and the image is pointing (from bottom to top) in the same
      // direction as the turtle.
      this.ctxScratch.save();
      this.ctxScratch.translate(this.x, this.y);
      this.ctxScratch.rotate(utils.degreesToRadians(this.heading));
      this.ctxScratch.drawImage(img, -width / 2, -height, width, height);
      this.ctxScratch.restore();

      break;
  }

  return tupleDone;
};

/**
 * Given the width and height of a rectangle this scales the dimensions
 * proportionally such that neither is larger than a given maximum size.
 *
 * @param maxSize - The maximum size of either dimension
 * @param width - The current width of a rectangle
 * @param height - The current height of a rectangle
 * @return an object containing the scaled width and height.
 */
function scaleToBoundingBox(maxSize, width, height) {
  if (width < maxSize && height < maxSize) {
    return { width: width, height: height };
  }

  var newWidth;
  var newHeight;

  if (width > height) {
    newWidth = maxSize;
    newHeight = height * (maxSize / width);
  } else {
    newHeight = maxSize;
    newWidth = width * (maxSize / height);
  }

  return { width: newWidth, height: newHeight };
}

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
  this.x += distance * Math.sin(utils.degreesToRadians(this.heading));
  this.y -= distance * Math.cos(utils.degreesToRadians(this.heading));
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
    this.ctxPattern.rotate(utils.degreesToRadians(this.heading - 90));

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
    this.ctxScratch.rotate(utils.degreesToRadians(this.heading - 90));

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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../slider":"/home/ubuntu/staging/apps/build/js/slider.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/turtle/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/turtle/apiJavascript.js","./colours":"/home/ubuntu/staging/apps/build/js/turtle/colours.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/turtle/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/turtle/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/turtle/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/turtle/locale.js"}],"/home/ubuntu/staging/apps/build/js/turtle/levels.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy90dXJ0bGUvbWFpbi5qcyIsImJ1aWxkL2pzL3R1cnRsZS9za2lucy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9ibG9ja3MuanMiLCJidWlsZC9qcy90dXJ0bGUvdHVydGxlLmpzIiwiYnVpbGQvanMvdHVydGxlL2xldmVscy5qcyIsImJ1aWxkL2pzL3R1cnRsZS90b29sYm94LnhtbC5lanMiLCJidWlsZC9qcy90dXJ0bGUvc3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL3R1cnRsZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9kcm9wbGV0Q29uZmlnLmpzIiwiYnVpbGQvanMvdHVydGxlL2NvbnRyb2xzLmh0bWwuZWpzIiwiYnVpbGQvanMvdHVydGxlL2N1c3RvbUxldmVsQmxvY2tzLmpzIiwiYnVpbGQvanMvdHVydGxlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL3R1cnRsZS9jb2xvdXJzLmpzIiwiYnVpbGQvanMvdHVydGxlL2FwaUphdmFzY3JpcHQuanMiLCJidWlsZC9qcy90dXJ0bGUvYW5zd2Vycy5qcyIsImJ1aWxkL2pzL3R1cnRsZS9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENB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QUFFLFFBQVEsQ0FBQyxFQUNoQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUM1QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUNoQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUMxQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxFQUMxQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUMxQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUNsQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUM1QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUNqQyxDQUFDOzs7QUFHRixNQUFJLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDekIsT0FBSyxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDdkIsUUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMzQjs7Ozs7O0FBTUQsTUFBSSx1QkFBdUIsR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7QUFHbEUsTUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLHVCQUF1QixFQUFFO0FBQzVDLDJCQUF1QixHQUFHLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztHQUMxRjs7QUFFRCxNQUFJLENBQUMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7O0FBRXZELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RUYsWUFBWSxDQUFDOztBQUViLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVyQyxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0FBR2pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBUyxPQUFPLEVBQUUsbUJBQW1CLEVBQUU7QUFDdkQsTUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDOztBQUVwQyxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxTQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQzs7QUFFL0IsTUFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQVksSUFBSSxFQUFFO0FBQzFCLFFBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQzVDLFdBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQy9ELENBQUM7O0FBRUYsTUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFDMUM7O0FBRUUsV0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FDNUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQ2pELE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUNqRCxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JELFdBQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztHQUVqQyxNQUFNOzs7QUFHTCxXQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRzs7QUFFNUIsV0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUMzQixPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLOztBQUU1QixXQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQ3pCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07O0FBRTlCLFdBQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0dBQ2pDOzs7QUFHRCxTQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHOztBQUVyQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckQsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUMzQyxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUNsRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztLQUMzQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsR0FBRzs7QUFFOUMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVk7QUFDaEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNwQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUNqRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztLQUMzQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7OztBQUczQyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQztBQUNGLFdBQVMsQ0FBQyw4QkFBOEIsR0FBRyxTQUFTLENBQUMscUJBQXFCLENBQUM7O0FBRTNFLFNBQU8sQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLEdBQUc7O0FBRWhELFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLEdBQ2pELENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFBQyxXQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUV0RCxXQUFTLENBQUMsZ0NBQWdDLEdBQUcsWUFBVzs7O0FBR3RELFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzNELFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRzs7QUFFckMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ3BDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFDMUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDbEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLDhCQUE4QixHQUFHOztBQUU5QyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBWTtBQUNoQixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ3BDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ2pELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM5QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7O0FBRTNDLFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUN4QyxHQUFHLEdBQUcsS0FBSyxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4RCxDQUFDO0FBQ0YsV0FBUyxDQUFDLDhCQUE4QixHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQzs7QUFFM0UsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7OztBQUd0QyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMzRCxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUN4QyxHQUFHLEdBQUcsS0FBSyxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4RCxDQUFDOztBQUdGLFNBQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEdBQUc7O0FBRTNDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEdBQzVDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUNwQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFBQyxXQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUV0RCxXQUFTLENBQUMsMkJBQTJCLEdBQUcsWUFBVzs7O0FBR2pELFFBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzNELFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRzs7QUFFaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3JELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFDeEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDcEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsZ0JBQWdCLEdBQUcsWUFBVzs7QUFFdEMsUUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDM0QsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLHFCQUFxQixHQUFHOztBQUVyQyxZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtBQUMxQyxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQzVDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDcEUsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNwRDtBQUNELFdBQU8sRUFBRSxtQkFBVztBQUNsQixhQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMscUJBQXFCLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQzs7QUFFMUQsU0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRzs7QUFFcEMsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7QUFDMUMsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM1QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDcEQ7QUFDRCxXQUFPLEVBQUUsbUJBQVc7QUFDbEIsYUFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUM7O0FBRXpELFNBQU8sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUc7O0FBRW5DLFlBQVEsRUFBRSxJQUFJO0FBQ2QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO0FBQzFDLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FDNUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6RCxVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsV0FBTyxFQUFFLG1CQUFXO0FBQ2xCLGFBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDcEM7R0FDRixDQUFDOztBQUVGLFdBQVMsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDOzs7O0FBSXhELFNBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHOztBQUU3QixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQzdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUNuQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsYUFBYSxHQUFHLFlBQVc7O0FBRW5DLFFBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQ3BDLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUIsV0FBTzs7O0FBR0gsc0JBQWtCLEVBQ2xCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQy9DLE9BQU8sR0FBRyxPQUFPLEVBQ3ZCLHVCQUF1QixHQUFHLFlBQVksR0FBRyxJQUFJLEVBQzdDLHlCQUF5QixFQUN6QixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkIsQ0FBQzs7OztBQUlGLFNBQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHOztBQUU5QixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQzdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjtHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXOztBQUVwQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUM3QixJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMzQyxRQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLFFBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxRQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsV0FBTzs7O0FBR0wsdUJBQW1CLEVBQ25CLHNCQUFzQixFQUN0QixNQUFNLEdBQUcsWUFBWSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsVUFBVSxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQ25FLEtBQUssR0FBRyxVQUFVLEVBQ3RCLFdBQVcsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQ2pELE9BQU8sR0FBRyxTQUFTLEVBQ3ZCLFFBQVEsR0FBRyxXQUFXLEdBQUcsS0FBSyxHQUFHLFlBQVksR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUN6RCxTQUFTLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLEdBQUcsV0FBVyxFQUMxRCxhQUFhLEdBQUcsU0FBUyxHQUFHLFFBQVEsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUN4RCxTQUFTLEdBQUcsT0FBTyxFQUN2Qix5QkFBeUIsR0FBRyxXQUFXLEdBQUcsSUFBSSxFQUM5QywwQkFBMEIsRUFDMUIsS0FBSyxFQUNMLFFBQVEsR0FBRyxPQUFPLEdBQUcsVUFBVSxFQUMvQiwyQkFBMkIsRUFDM0IsS0FBSyxFQUNMLEdBQUcsRUFDSCx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN4QyxDQUFDOzs7O0FBSUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRzs7QUFFcEMsV0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO0FBQ3pDLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FDaEQsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsRUFDMUMsS0FBSyxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUMzQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUN2QyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUNyQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUNyQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUMxQixXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUNwRCxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkM7QUFDRCxXQUFPLEVBQUUsbUJBQVc7QUFDbEIsYUFBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNwQztBQUNELHFCQUFpQixFQUFFLDJCQUFTLE9BQU8sRUFBRTtBQUNuQyxVQUFJLE1BQU0sR0FBRyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUM3QixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLFlBQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsY0FBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsY0FBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckMsVUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQyxjQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLGNBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFDdkQsWUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEUsYUFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN0Qjs7O0FBR0QsaUJBQWEsRUFBRSx5QkFBWTtBQUN6QixVQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEMsZUFBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0MsYUFBTyxTQUFTLENBQUM7S0FDbEI7O0FBRUQsaUJBQWEsRUFBRSx1QkFBUyxVQUFVLEVBQUU7QUFDbEMsVUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7OztBQUd4RCxTQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7QUFDM0MsU0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDOzs7O0FBSTFDLFNBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHOztBQUV6QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQy9CLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLEVBQ2xDLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLFdBQVMsQ0FBQyxTQUFTLEdBQUcsWUFBVzs7QUFFL0IsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pDLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUc7O0FBRXBCLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FDekIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQ3ZDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7S0FDcEM7R0FDRixDQUFDOztBQUVGLE1BQUksMkJBQTJCLEdBQUcsa0JBQWtCLENBQUM7QUFDckQsTUFBSSw0QkFBNEIsR0FBRyxtQkFBbUIsQ0FBQztBQUN2RCxNQUFJLG1CQUFtQixHQUFHLENBQ3hCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxFQUNoRCxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FDbkQsQ0FBQztBQUNGLE1BQUksd0JBQXdCLEdBQUcsQ0FDN0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsRUFDckQsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsNEJBQTRCLENBQUMsQ0FDeEQsQ0FBQzs7QUFFRixNQUFJLFVBQVUsR0FBRztBQUNmLHVCQUFtQixFQUFFLEVBQUU7QUFDdkIscUJBQWlCLEVBQUUsRUFBRTtBQUNyQixvQkFBZ0IsRUFBRSxHQUFHO0FBQ3JCLHFCQUFpQixFQUFFO0FBQ2pCLFVBQUksRUFBRTtBQUNKLGFBQUssRUFBRSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7QUFDdEMsb0JBQVksRUFBRSxVQUFVO0FBQ3hCLGVBQU8sRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFO0FBQzlCLGFBQUssRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN4Qix1QkFBZSxFQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDO0FBQ3hDLGVBQU8sRUFBRSxtQkFBbUI7T0FDN0I7QUFDRCxXQUFLLEVBQUU7QUFDTCxhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsV0FBVztBQUN6QixlQUFPLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRTtBQUM5QixhQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDeEIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsd0JBQXdCO09BQ2xDO0FBQ0QsUUFBRSxFQUFFO0FBQ0YsYUFBSyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUN2QyxvQkFBWSxFQUFFLFFBQVE7QUFDdEIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMvQixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsbUJBQW1CO09BQzdCO0FBQ0QsVUFBSSxFQUFFO0FBQ0osYUFBSyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtBQUN2QyxvQkFBWSxFQUFFLFVBQVU7QUFDeEIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMvQixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsdUJBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQztBQUN4QyxlQUFPLEVBQUUsbUJBQW1CO09BQzdCO0FBQ0QsZUFBUyxFQUFFO0FBQ1QsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsVUFBVTtBQUN4QixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUU7T0FDL0I7QUFDRCxnQkFBVSxFQUFFO0FBQ1YsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUFFO0FBQ3RDLG9CQUFZLEVBQUUsV0FBVztBQUN6QixhQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWM7QUFDMUIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUU7T0FDL0I7QUFDRCxhQUFPLEVBQUU7QUFDUCxjQUFNLEVBQUUsSUFBSTtBQUNaLGFBQUssRUFBRSxTQUFTLENBQUMsb0JBQW9CLEVBQUU7QUFDdkMsb0JBQVksRUFBRSxRQUFRO0FBQ3RCLGFBQUssRUFBRSxJQUFJLENBQUMsV0FBVztBQUN2QixlQUFPLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFO09BQ2hDO0FBQ0QsZUFBUyxFQUFFO0FBQ1QsY0FBTSxFQUFFLElBQUk7QUFDWixhQUFLLEVBQUUsU0FBUyxDQUFDLG9CQUFvQixFQUFFO0FBQ3ZDLG9CQUFZLEVBQUUsVUFBVTtBQUN4QixhQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDekIsZUFBTyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtPQUNoQztLQUNGO0FBQ0Qsa0NBQThCLEVBQUUsMENBQVc7QUFDekMsZ0JBQVUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxnQkFBVSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLGdCQUFVLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUMsZ0JBQVUsQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNoRDtBQUNELDhCQUEwQixFQUFFLG9DQUFTLFNBQVMsRUFBRTtBQUM5QyxlQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwRixlQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUM7QUFDOUYsZUFBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RyxhQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2RyxhQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckYsYUFBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQztLQUNoRztBQUNELHFCQUFpQixFQUFFLDJCQUFTLFNBQVMsRUFBRSxjQUFjLEVBQUU7QUFDckQsVUFBSSxlQUFlLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlELFVBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQzlCLGFBQU87QUFDTCxlQUFPLEVBQUUsRUFBRTtBQUNYLFlBQUksRUFBRSxnQkFBWTtBQUNoQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsY0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDcEMsY0FBSSxlQUFlLENBQUMsTUFBTSxFQUFFO0FBQzFCLGlCQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1dBQ3JDO0FBQ0QsZUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXpILGNBQUksZUFBZSxDQUFDLGVBQWUsRUFBRTtBQUNuQyxpQkFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssRUFDNUQsZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQ3JDLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztXQUM1QyxNQUFNO0FBQ0wsaUJBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1dBQ2xFO0FBQ0QsY0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixjQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxjQUFJLGNBQWMsRUFBRTtBQUNsQixnQkFBSSxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZFLG9CQUFRLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsaUJBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1dBQ3ZDO1NBQ0Y7T0FDRixDQUFDO0tBQ0g7QUFDRCx5QkFBcUIsRUFBRSwrQkFBUyxTQUFTLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRTtBQUNqRSxhQUFPLFlBQVc7QUFDaEIsY0FBTSxHQUFHLE1BQU0sSUFBSSxVQUFVLENBQUMsbUJBQW1CLENBQUM7O0FBRWxELFlBQUksY0FBYyxFQUFFO0FBQ2xCLGdCQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNuRDtBQUNELGVBQU8sU0FBUyxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO09BQ25JLENBQUM7S0FDSDtHQUNGLENBQUM7O0FBRUYsWUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUM7O0FBRTVDLFNBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FDMUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsRUFDbEMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQzs7QUFFM0MsV0FBUyxDQUFDLElBQUksR0FBRyxZQUFXOztBQUUxQixRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQzNDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDakMsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHOzs7QUFHaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFDekMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDcEQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLHlCQUF5QixHQUFHOzs7QUFHekMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ2pELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7OztBQUd0QyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsV0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FDeEMsR0FBRyxHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEQsQ0FBQztBQUNGLFdBQVMsQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7O0FBRWpFLFNBQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHOztBQUV6QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQy9CLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQzlCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0FBRW5DLFdBQVMsQ0FBQyxTQUFTLEdBQUcsWUFBVzs7QUFFL0IsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUMzQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pDLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLEdBQUcsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hELENBQUM7Ozs7QUFJRixTQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRzs7QUFFMUIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUN6QixRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FDdkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztLQUNyQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFXOztBQUVoQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQzNDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDakMsV0FBTyxrQkFBa0IsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQzFFLENBQUM7OztBQUdGLFNBQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEdBQUc7O0FBRWpDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLGdCQUFXO0FBQ2YsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQ3pDLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0tBQ3JDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsaUJBQWlCLEdBQUcsWUFBVzs7QUFFdkMsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QyxXQUFPLGtCQUFrQixHQUFHLEtBQUssR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDMUUsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRzs7QUFFeEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9ELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNuQztHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUN6QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUN0QixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxXQUFTLENBQUMsUUFBUSxHQUFHLFlBQVc7O0FBRTlCLFdBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQ3hDLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN6QyxDQUFDOztBQUVGLFNBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHOztBQUUzQixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQzFCLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUN2QyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7S0FDdEM7R0FDRixDQUFDOztBQUVGLFNBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHOzs7OztBQUtyQixRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FDekIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsS0FBSyxHQUFHLFlBQVk7QUFDNUIsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEYsV0FBTyxxQkFBcUIsR0FBRyxLQUFLLEdBQUcsZUFBZSxHQUNsRCxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztHQUN4QixDQUFDOztBQUVGLFdBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVzs7QUFFakMsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUM3QyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQzNDLFdBQU8sbUJBQW1CLEdBQUcsTUFBTSxHQUFHLGVBQWUsR0FDakQsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDeEIsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixHQUFHOztBQUVsQyxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQ3JFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pGLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25FLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNsQixXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQzVCLFdBQVcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsa0JBQWtCLEdBQUcsWUFBVzs7QUFFeEMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhLENBQUM7QUFDM0QsV0FBTyxvQkFBb0IsR0FBRyxNQUFNLEdBQUcsZ0JBQWdCLEdBQ25ELElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hCLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsR0FBRzs7QUFFdkMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNqQixXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQzdCLFdBQVcsQ0FBRSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FDekMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUUsRUFBRSxPQUFPLENBQUUsQ0FBQztBQUMzRCxVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ25DO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsdUJBQXVCLEdBQUcsWUFBVzs7QUFFN0MsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxhQUFhLENBQUM7QUFDM0QsV0FBTyxxQkFBcUIsR0FBRyxPQUFPLEdBQUcsZ0JBQWdCLEdBQ3JELElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQ3hCLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDdEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRSxVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7S0FDaEQ7R0FDRixDQUFDOztBQUVGLFdBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBVzs7QUFFNUIsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUMvQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksYUFBYSxDQUFDO0FBQ3pDLFdBQU8sbUJBQW1CLEdBQUcsTUFBTSxHQUFHLGVBQWUsR0FDbkQsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDdEIsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHOztBQUVqQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztLQUNoRDtHQUNGLENBQUM7O0FBRUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQ2xDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQ2hDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7O0FBRXZDLFdBQVMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFXOztBQUV2QyxXQUFPLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUMvQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7R0FDekMsQ0FBQzs7QUFFRixTQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRztBQUM1QixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLFFBQVEsQ0FBQztBQUNiLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3BDLFdBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDbkMsY0FBUSxHQUFHLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUUvRCxXQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFckMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDbEM7R0FDRixDQUFDOzs7O0FBSUYsU0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRXRELFdBQVMsQ0FBQyxZQUFZLEdBQUcsWUFBWTtBQUNuQyxXQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQ3JELGdCQUFnQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0dBQzNDLENBQUM7O0FBRUYsbUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDdkQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3NkJGLFlBQVksQ0FBQzs7QUFFYixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQyxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUNsRCxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0FBQ3RFLElBQUksc0JBQXNCLEdBQUcsT0FBTyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7QUFDbEYsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDMUIsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDL0MsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDaEQsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7QUFFNUQsSUFBSSxhQUFhLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLElBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQzs7QUFFdkIsSUFBSSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7O0FBRTNCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQzs7QUFFckIsSUFBSSx3QkFBd0IsR0FBRyxDQUFDLENBQUM7QUFDakMsSUFBSSw2QkFBNkIsR0FBRyxFQUFFLENBQUM7Ozs7O0FBS3ZDLElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDOzs7Ozs7QUFNOUIsSUFBSSx1QkFBdUIsR0FBRyxDQUM1QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUN6QixFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUN6QixDQUFDOzs7Ozs7QUFNRixJQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sR0FBZTtBQUN2QixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFbEIsTUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLGVBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7QUFHeEMsTUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7OztBQUcxQixNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHOUQsTUFBSSxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztBQUNsQyxNQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7O0FBR2pCLE1BQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7QUFHYixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7O0FBR3BCLE1BQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOzs7QUFHakIsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7OztBQUd0QyxNQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7O0FBRzVDLE1BQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3RDLE1BQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDN0IsTUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQzs7O0FBR2xDLE1BQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLE1BQUksQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUM7QUFDbkMsTUFBSSxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztBQUNwQyxNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs7QUFFeEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXZCLE1BQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDOUIsTUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7Ozs7QUFNeEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBVSxTQUFTLEVBQUU7QUFDdEQsTUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbkUsTUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QyxDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsTUFBTSxFQUFFO0FBQ3ZDLE1BQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3BCLFVBQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztHQUNoRDs7QUFFRCxNQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsTUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOzs7QUFHMUIsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyRCxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxRQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3RCLE9BQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2QsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDeEI7O0FBRUQsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFOztBQUVwRCxRQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFakQsUUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDaEM7O0FBRUQsUUFBTSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztBQUN2QyxRQUFNLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBQ3hDLFFBQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOztBQUVyQyxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztHQUN6QixNQUNJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQy9CLFFBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUM7QUFDbkMsUUFBSSxDQUFDLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztHQUNyQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7R0FDeEI7O0FBRUQsTUFBSSxRQUFRLEdBQUcsZUFBZSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsR0FBRyxXQUFXLENBQUEsQUFBQyxDQUFDO0FBQy9HLFFBQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELFFBQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFN0QsTUFBSSxtQkFBbUIsR0FBRyxDQUFBLFlBQVk7QUFDcEMsV0FBTyxnQkFBZ0IsQ0FBQztBQUN0QixjQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLFVBQUksRUFBRTtBQUNKLHVCQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUU7QUFDbEQsaUJBQVMsRUFBRyxTQUFTO0FBQ3JCLHdCQUFnQixFQUFHLFNBQVM7QUFDNUIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFDN0IseUJBQWlCLEVBQUcsdUJBQXVCO0FBQzNDLHlCQUFpQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7T0FDNUM7S0FDRixDQUFDLENBQUM7R0FDSixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUViLE1BQUkseUJBQXlCLEdBQUcsQ0FBQSxZQUFZO0FBQzFDLFdBQU8sc0JBQXNCLENBQUM7QUFDNUIsY0FBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtBQUNsQyxVQUFJLEVBQUU7QUFDSixxQkFBYSxFQUFFLEVBQUU7QUFDakIsZ0JBQVEsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUM7T0FDbkc7S0FDRixDQUFDLENBQUM7R0FDSixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUViLFVBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDM0MsWUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtBQUNsQyxlQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQzNCLGVBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUs7QUFDM0IsdUJBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLDZCQUF5QixFQUFFLHlCQUF5QjtBQUNwRCxXQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO0dBQzVELENBQUMsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0NBQ2xELENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBWTtBQUN4QyxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6RCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUM5RCxDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVoRCxNQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUduRCxNQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO0FBQzVCLFFBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDckQ7O0FBRUQsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFOzs7QUFHcEMsV0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNwRDs7O0FBR0QsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pFLE1BQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RSxNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0UsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNFLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRSxNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUc3RSxNQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRTVELE1BQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0QsZUFBYSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6QyxNQUFJLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7OztBQUdqRCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQSxBQUFDLEVBQUU7OztBQUc1RixXQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxZQUFXOztBQUU1QyxVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFO0FBQ2xELFlBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FDL0QsZUFBZSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEQsZUFBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUM3RCxZQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxZQUFZLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDL0MsWUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbEYsWUFBSSxDQUFDLElBQUksQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0FBQ3ZFLFlBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZixlQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqRTtBQUNELFVBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDaEUsYUFBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDdkQsQ0FBQztHQUNIOztBQUVELE1BQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDOzs7QUFHL0IsTUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixNQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQzs7QUFFOUIsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTtBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25FLFFBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0dBQzVCOzs7O0FBSUQsTUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxnQkFBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsTUFBTSxDQUFDO0FBQ3BDLFVBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUUxQyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakUsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxRQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDdEIsVUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN0QixTQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUN4QztHQUNGOzs7QUFHRCxNQUFJLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RSxxQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztDQUMzQyxDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDdkMsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRTtBQUM3QixRQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3BFLE1BQU07QUFDTCxRQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN6RDtDQUNGLENBQUM7Ozs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFVBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRTtBQUN2RCxNQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hCLFNBQU8sR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUNqQixRQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDeEIsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUN2QjtBQUNELFFBQU0sQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7QUFDekMsUUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0MsUUFBTSxDQUFDLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztDQUNqRCxDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUcsVUFBUyxZQUFZLEVBQUUsTUFBTSxFQUFFO0FBQ25FLE1BQUksSUFBSSxDQUFDO0FBQ1QsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3BDLFFBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFdBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDL0QsUUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDekQsTUFBTTtBQUNMLFFBQUksR0FBRyxZQUFZLENBQUM7R0FDckI7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNwQyxXQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2hDO0FBQ0QsTUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3hDLENBQUM7Ozs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMseUJBQXlCLEdBQUcsVUFBUyxNQUFNLEVBQUU7QUFDNUQsTUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUM1QyxDQUFDOzs7Ozs7Ozs7QUFTRixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ2hFLE1BQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEIsS0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVc7QUFDN0IsUUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNuQixVQUFJLEtBQUssRUFBRTtBQUNULFlBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQy9ELEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO09BQzVELE1BQU87QUFDTixZQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3pEO0tBQ0Y7QUFDRCxRQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDaEIsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFVCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsT0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUN4QyxNQUFNO0FBQ0wsT0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLENBQUM7R0FDaEU7Q0FDRixDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDdkMsTUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ3RCLFdBQU87R0FDUjtBQUNELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDakQsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzlEO0FBQ0QsTUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7QUFDakQsTUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0NBQ3pELENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUN2QyxNQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJELE1BQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3hDLE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQzFCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7R0FDaEMsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxRQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0dBQ2hDLE1BQU07QUFDTCxRQUFJLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0dBQ2pDO0FBQ0QsTUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNsRCxNQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0NBQ2pELENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxZQUFXO0FBQ3BELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQzFCLFFBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztBQUNsRSxRQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztBQUN0RSxRQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztHQUNyRTtDQUNGLENBQUM7O0FBRUYsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDOzs7OztBQU1wQixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFXO0FBQ3ZDLE1BQUksT0FBTyxDQUFDOztBQUVaLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDdkUsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFOztBQUVwRCxTQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQzs7O0FBRzFDLFNBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUMsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDO0dBQzNFO0FBQ0QsTUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ25ELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCxXQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ3RELGVBQVcsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztHQUM3RCxNQUFNO0FBQ0wsV0FBTyxHQUFHLENBQUMsQ0FBQztHQUNiO0FBQ0QsTUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7QUFDL0MsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7QUFDakQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7QUFDN0MsTUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7QUFDL0MsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ2pFLFdBQU87R0FDUjs7QUFFRCxNQUFJLE9BQU8sR0FBRyxDQUFDLElBQ1gsT0FBTyxHQUFHLENBQUMsSUFDWCxPQUFPLEdBQUcsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFDbEQsT0FBTyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFDcEQ7QUFDRSxRQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFOzs7O0tBSTNCO0FBQ0QsV0FBTztHQUNSOztBQUVELE1BQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2hDLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUN2QixJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQ3hDLFdBQVcsR0FBRyxDQUFDLEVBQUUsWUFBWSxFQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQ3BDLFNBQVMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7R0FDOUI7Q0FDRixDQUFDOzs7Ozs7O0FBT0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxVQUFTLElBQUksRUFBRTtBQUN4RCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLFVBQVUsR0FBRyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDOztBQUU3RSxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7QUFHNUUsY0FBVSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUM7OztBQUdwRCxjQUFVLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQzs7QUFFcEYsUUFBSSx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ3BELFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO0FBQy9ELFVBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNoQixVQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO0FBQ3RELFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7QUFDeEQsVUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDO0FBQzVCLFVBQUksVUFBVSxHQUFHLFlBQVksQ0FBQztBQUM5QixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckYsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7QUFFMUMsVUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUM3QyxZQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDdkIsSUFBSSxDQUFDLHdCQUF3QixFQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQ3hDLFdBQVcsRUFBRSxZQUFZLEVBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFDcEMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQzFCO0tBQ0Y7R0FDRjtDQUNGLENBQUM7Ozs7Ozs7O0FBU0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxNQUFNLEVBQUU7O0FBRXpDLE1BQUksQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUMzQixNQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDMUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxTQUFTLEdBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUNuQyxNQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUN6QixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7O0FBR3BCLE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7R0FDOUI7QUFDRCxNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtBQUNyQyxRQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0dBQzlCOztBQUVELE1BQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDNUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM1RCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUMxQixRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNqQyxRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQztBQUMvQyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDL0IsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QyxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDdEMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0dBQy9COztBQUVELE1BQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNsQyxNQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztBQUMzQyxNQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUdmLE1BQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUN0QixDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFekUsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDMUIsUUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM3QixNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO0FBQ2pDLFFBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDN0IsTUFBTTs7QUFFTCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZCOzs7QUFHRCxNQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDWixVQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUMvQjtBQUNELE1BQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7QUFHYixNQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDOzs7QUFHN0IsTUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDbEMsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7R0FDM0I7QUFDRCxNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzs7O0FBRzNCLE1BQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUN2QixDQUFDOzs7OztBQU1GLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVc7OztBQUdwQyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztBQUN0QyxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFDcEMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQzFELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFbEMsTUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7O0FBRWxELE1BQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEdBQUcsYUFBYSxDQUFDO0FBQ3pELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBR3ZELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCxRQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7R0FDbkMsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztHQUNwQztBQUNELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7OztBQUdoQyxNQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztBQUN6RCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUd4RCxNQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztBQUN6RCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUd4RCxNQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixHQUFHLGFBQWEsQ0FBQztBQUN6RCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztBQUd4RCxNQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsUUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDdkM7Q0FDRixDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFlBQVk7QUFDNUMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsVUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUNoRSxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsV0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdEM7QUFDRCxNQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzNCLE1BQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNoQixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3pDLE1BQUk7QUFDRixXQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUNyQixZQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUc7S0FDakIsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxPQUFPLENBQUMsRUFBRTs7Ozs7QUFLVixRQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7OztBQUdsQixVQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDbEIsY0FBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQzFEO0FBQ0QsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtHQUNGO0NBQ0YsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxZQUFZO0FBQzdDLE1BQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN4QixXQUFPO0dBQ1I7QUFDRCxNQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO0FBQ3JDLGFBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtBQUMxQix1QkFBbUIsRUFBRSwrQkFBWTtBQUFFLGFBQU8sS0FBSyxDQUFDO0tBQUU7R0FDbkQsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ25GLE1BQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCxNQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztBQUN2QixRQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7QUFDL0IsVUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO0FBQzVCLGVBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtHQUMzRSxDQUFDLENBQUM7Q0FDSixDQUFDOzs7OztBQUtGLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxHQUFHLEVBQUUsVUFBVSxFQUFFO0FBQ2pFLE1BQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUU3QixNQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUM7O0FBRTNELE1BQUksR0FBRyxZQUFZLFdBQVcsRUFBRTtBQUM5QixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDO0dBQ2xFOztBQUVELE1BQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0NBQ3pCLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBVztBQUNwQyxNQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7OztBQUdsQixNQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV4QixNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsSUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsRUFBRSxFQUFFOztBQUVyRCxRQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkIsV0FBTztHQUNSOztBQUVELE1BQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDdkIsUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0dBQ3hCLE1BQU07QUFDTCxRQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDMUI7OztBQUdELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDOzs7QUFHbEQsTUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFOUQsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFOztBQUVwQyxXQUFPLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDdEQ7Q0FDRixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFlBQVk7QUFDbEQsTUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDOztBQUUxQixNQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFJLGNBQWMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsTUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBRzFDLE1BQUksY0FBYyxLQUFLLElBQUksRUFBRTtBQUMzQixRQUFJLFlBQVksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRTs7QUFFaEMsVUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzNCLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFlBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixZQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7QUFDeEIsdUJBQWEsR0FBRyxJQUFJLENBQUM7U0FDdEI7T0FDRjtLQUNGO0dBQ0Y7O0FBRUQsU0FBTyxhQUFhLENBQUM7Q0FDdEIsQ0FBQzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxZQUFZO0FBQzNDLE1BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM3QixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELE1BQUksa0JBQWtCLENBQUM7O0FBRXZCLEtBQUc7O0FBRUQsc0JBQWtCLEdBQUcsS0FBSyxDQUFDOztBQUUzQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsUUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHdEMsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO0FBQ25FLHdCQUFrQixHQUFHLElBQUksQ0FBQztLQUMzQjs7O0FBR0QsUUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQztBQUNwSCxRQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWYsUUFBSSxTQUFTLEVBQUU7QUFDYixVQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7R0FDRixRQUFRLGtCQUFrQixFQUFFOztBQUU3QixTQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZO0FBQzlDLFVBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDL0QsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3BDLFdBQU8sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdDO0FBQ0QsTUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ3BCLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBVzs7O0FBR3BDLE1BQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzs7QUFHYixNQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7OztBQUk5RixNQUFJLENBQUMscUJBQXFCLEdBQUksU0FBUyxLQUFLLENBQUMsR0FDM0MsNkJBQTZCLEdBQUcsd0JBQXdCLEFBQUMsQ0FBQzs7QUFFNUQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFDbkIsSUFBSSxDQUFDLGFBQWEsSUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFBRTs7QUFFcEMsUUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFFBQUksY0FBYyxHQUFHLEtBQUssQ0FBQzs7QUFFM0IsT0FBRztBQUNELGlCQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFakQsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixZQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O0FBRXhDLHNCQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO09BQ3ZDO0tBQ0YsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLGNBQWMsRUFBRTs7QUFFMUMsUUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixvQkFBYyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN2QztBQUNELFFBQUksV0FBVyxJQUFJLENBQUMsY0FBYyxFQUFFOztBQUVsQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN4QixhQUFPO0tBQ1I7R0FDRixNQUFNO0FBQ0wsUUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtBQUN6QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN4QixhQUFPO0tBQ1I7R0FDRjs7QUFFRCxNQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3JFLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxVQUFTLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDcEUsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDOztBQUVuRCxNQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO0FBQ3BDLFFBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM1QixRQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQzs7QUFFdkQsUUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFOztBQUVwQixVQUFJLG1CQUFtQixHQUFHLHFCQUFxQixJQUFJLFlBQVksRUFBRTs7QUFFL0QsZ0JBQVEsR0FBRyxZQUFZLEdBQUcsbUJBQW1CLENBQUM7QUFDOUMsMkJBQW1CLEdBQUcsWUFBWSxDQUFDO09BQ3BDLE1BQU07QUFDTCxnQkFBUSxHQUFHLENBQUMscUJBQXFCLENBQUM7QUFDbEMsMkJBQW1CLElBQUkscUJBQXFCLENBQUM7QUFDN0MsaUJBQVMsR0FBRyxLQUFLLENBQUM7T0FDbkI7S0FFRixNQUFNOztBQUVMLFVBQUksbUJBQW1CLEdBQUcscUJBQXFCLElBQUksWUFBWSxFQUFFOztBQUUvRCxnQkFBUSxHQUFHLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztBQUM5QywyQkFBbUIsR0FBRyxZQUFZLENBQUM7T0FDcEMsTUFBTTtBQUNMLGdCQUFRLEdBQUcscUJBQXFCLENBQUM7QUFDakMsMkJBQW1CLElBQUkscUJBQXFCLENBQUM7QUFDN0MsaUJBQVMsR0FBRyxLQUFLLENBQUM7T0FDbkI7S0FDRjtHQUNGOztBQUVELE1BQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQzs7QUFFL0MsU0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO0NBQ3JELENBQUM7Ozs7Ozs7OztBQVNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDekQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksTUFBTSxDQUFDO0FBQ1gsTUFBSSxRQUFRLENBQUM7QUFDYixNQUFJLE9BQU8sQ0FBQzs7QUFFWixVQUFRLE9BQU87QUFDYixTQUFLLElBQUk7O0FBQ1AsY0FBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixZQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4RCxlQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUM3QixVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsY0FBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixZQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4RCxlQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUM3QixVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuQyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsY0FBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixhQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFlBQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGVBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLGNBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsYUFBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixZQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4RCxlQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUM3QixVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFCLFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxjQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFlBQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3hELGVBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsVUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsV0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNCLFdBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQzFDLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUMxQixZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDekIsWUFBTTtBQUFBLEFBQ1IsU0FBSyxJQUFJOztBQUNQLFVBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsWUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztPQUNuQztBQUNELFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUU7QUFDdEMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN6QixNQUFNO0FBQ0wsWUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM1QjtBQUNELFlBQU07QUFBQSxBQUNSLFNBQUssSUFBSTs7QUFDUCxVQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixZQUFNO0FBQUEsQUFDUixTQUFLLElBQUk7O0FBQ1AsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsWUFBTTtBQUFBLEFBQ1IsU0FBSyxPQUFPO0FBQ1YsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakMsVUFBSSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0UsVUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztBQUM3QixVQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDOzs7OztBQUsvQixVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUM3RCxVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuRSxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUUxQixZQUFNO0FBQUEsR0FDVDs7QUFFRCxTQUFPLFNBQVMsQ0FBQztDQUNsQixDQUFDOzs7Ozs7Ozs7OztBQVdGLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbEQsTUFBSSxLQUFLLEdBQUcsT0FBTyxJQUFJLE1BQU0sR0FBRyxPQUFPLEVBQUU7QUFDdkMsV0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDO0dBQ3ZDOztBQUVELE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxTQUFTLENBQUM7O0FBRWQsTUFBSSxLQUFLLEdBQUcsTUFBTSxFQUFFO0FBQ2xCLFlBQVEsR0FBRyxPQUFPLENBQUM7QUFDbkIsYUFBUyxHQUFHLE1BQU0sSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQztHQUN4QyxNQUFNO0FBQ0wsYUFBUyxHQUFHLE9BQU8sQ0FBQztBQUNwQixZQUFRLEdBQUcsS0FBSyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUEsQUFBQyxDQUFDO0dBQ3ZDOztBQUVELFNBQU8sRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsQ0FBQztDQUM3Qzs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUMvQyxNQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNwQyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNELFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7R0FDbEMsTUFBTSxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDM0IsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDdEMsUUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztHQUNuQztDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDbEQsTUFBSSxDQUFDLENBQUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDcEUsTUFBSSxDQUFDLENBQUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDckUsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN6RCxNQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNaLE1BQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7O0FBRXhDLE1BQUksYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUN4QixNQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlDLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUNuRCxNQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNuRCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ25ELE1BQUksS0FBSyxHQUFJLFFBQVEsS0FBSyxDQUFDLEFBQUMsQ0FBQztBQUM3QixNQUFJLEtBQUssRUFBRTtBQUNULFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDN0IsTUFBTTtBQUNMLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3hDO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLFlBQVksRUFBRTtBQUN4RCxNQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUM7Q0FDL0MsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUNoRCxTQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ3hCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN0RCxTQUFPLElBQUksR0FBRyxDQUFDO0FBQ2YsTUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO0FBQ2YsV0FBTyxJQUFJLEdBQUcsQ0FBQztHQUNoQjtBQUNELFNBQU8sT0FBTyxDQUFDO0NBQ2hCLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxRQUFRLEVBQUU7QUFDbEQsTUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdEIsUUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixXQUFPO0dBQ1I7QUFDRCxNQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtBQUM3QixRQUFJLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUczQyxRQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsYUFBTztLQUNSO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM3QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ2xELE1BQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7QUFDNUIsUUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3ZDLE1BQU07QUFDTCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDakM7Q0FDRixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQzVELE1BQUksaUJBQWlCLEdBQUcsUUFBUSxDQUFDOztBQUVqQyxTQUFPLGlCQUFpQixHQUFHLENBQUMsRUFBRTtBQUM1QixRQUFJLG9CQUFvQixHQUFHLGlCQUFpQixJQUFJLG9CQUFvQixDQUFDO0FBQ3JFLFFBQUksb0JBQW9CLEdBQUcsb0JBQW9CLEdBQUcsb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7O0FBRTNGLHFCQUFpQixJQUFJLG9CQUFvQixDQUFDOztBQUUxQyxRQUFJLG9CQUFvQixFQUFFO0FBQ3hCLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQzNCOztBQUVELFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUU1QyxRQUFJLG9CQUFvQixFQUFFO0FBQ3hCLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQzNCO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxRQUFRLEVBQUU7O0FBRXRELE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzFCLE1BQU07QUFDTCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzFCO0NBRUYsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLDJCQUEyQixHQUFHLFVBQVUsUUFBUSxFQUFFO0FBQ2pFLE1BQUksR0FBRyxDQUFDO0FBQ1IsTUFBSSxNQUFNLENBQUM7QUFDWCxNQUFJLE1BQU0sQ0FBQzs7QUFFWCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFDcEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDekQsT0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUM5QixVQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUN6QixVQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFekIsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUcxQyxRQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxRQUFJLFFBQVEsQ0FBQztBQUNiLFFBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxDQUFDLEVBQUU7QUFDbkQsY0FBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztLQUN2QyxNQUFNLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRTs7O0FBR3BELGNBQVEsR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0tBQ3RELE1BQU07QUFDTCxjQUFRLEdBQUcsWUFBWSxDQUFDO0tBQ3pCO0FBQ0QsUUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNuQixVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHOztBQUUzQixVQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7O0FBRTNCLGNBQVEsRUFBRSxHQUFHLENBQUMsTUFBTTs7QUFFcEIsVUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBRSxFQUFFLENBQUUsRUFDekUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBRTNCLE1BQU07O0FBRUwsUUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUM5QixVQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNoQixVQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFaEIsUUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7O0FBRzFDLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxFLFFBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDbkIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRzs7QUFFM0IsT0FBQyxFQUFFLENBQUM7O0FBRUosY0FBUSxHQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNOztBQUVuQyxPQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2hDLFFBQVEsR0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7O0FBRUQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUMzQjtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxZQUFZO0FBQy9DLFNBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0NBQy9DLENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxZQUFZO0FBQ2hELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDNUIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUMxQixDQUFDOzs7Ozs7OztBQVFGLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsV0FBVyxFQUFFLGVBQWUsRUFBRTtBQUNwRSxTQUFPLFdBQVcsSUFBSSxlQUFlLENBQUM7Q0FDdkMsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFXO0FBQzdDLE1BQUksbUJBQW1CLENBQUM7QUFDeEIsTUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFOztBQUVwRCx1QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ3ZDLE1BQU07QUFDTCx1QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ3ZDOztBQUVELE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRXZCLE1BQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO0FBQzlCLE9BQUcsRUFBRSxRQUFRO0FBQ2IsUUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNsQixnQkFBWSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQzlCLFdBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQixZQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsU0FBSyxFQUFFLEtBQUs7QUFDWixpQkFBYSxFQUFFLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDOztBQUVoRSxrQkFBYyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUEsQUFBQzs7QUFFN0UsZ0JBQVksRUFBRSxLQUFLLENBQUMsVUFBVTs7QUFFOUIsb0JBQWdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CO0FBQ3RGLGNBQVUsRUFBRTtBQUNWLHNCQUFnQixFQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM5QyxpQkFBVyxFQUFFLFNBQVMsQ0FBQyxZQUFZLEVBQUU7S0FDdEM7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUV6QixNQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JELFdBQVMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzNCLE1BQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsTUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDekIsQ0FBQzs7Ozs7QUFLRixJQUFJLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQVksQ0FBQyxFQUFFO0FBQ2hDLFNBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQy9DLENBQUM7O0FBRUYsZUFBZSxDQUFDLEtBQUssR0FBRyw0Q0FBNEMsQ0FBQzs7Ozs7O0FBTXJFLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVc7OztBQUd4QyxNQUFJLFNBQVMsR0FDVCxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNwRSxNQUFJLFdBQVcsR0FDWCxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNuRSxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDOztBQUVkLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTs7O0FBRy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFDM0QsV0FBSyxFQUFFLENBQUM7S0FDVDtHQUNGOztBQUVELE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7QUFJdkIsTUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUM7Ozs7QUFJakQsTUFBSSxhQUFhLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFBLEtBQ3ZELENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUEsQUFBQyxDQUFDO0FBQ2hFLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRWpFLE1BQUksT0FBTyxDQUFDO0FBQ1osTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFO0FBQ3BDLFFBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM5RCxXQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEM7OztBQUdELE1BQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDOzs7QUFHekIsTUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQ3pELEtBQUssQ0FBQyxjQUFjLElBQ3BCLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxlQUFlLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQ3RFLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUM7QUFDbEUsUUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7R0FDM0M7Ozs7QUFJRCxNQUFJLEtBQUssQ0FBQyxvQkFBb0IsSUFDMUIsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN4RSxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0dBRXJFLE1BQU0sSUFBSSxBQUFDLElBQUksQ0FBQyxXQUFXLElBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixJQUMvQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQUFBQyxFQUFFOzs7O0FBSTlELFFBQUksS0FBSyxDQUFDLHdCQUF3QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDdEUsVUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1RCxVQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDbkMsWUFBSSxDQUFDLFdBQVcsR0FDWixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQztBQUM3RCxZQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUN4QztLQUNGO0dBQ0Y7O0FBRUQsTUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFOzs7Ozs7O0FBT2xCLFdBQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUM3Qzs7OztBQUlELE1BQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNsQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztHQUMxRDs7O0FBR0QsTUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUMxRCxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFO0FBQ3hFLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ2xDLE1BQU07QUFDTCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN0Qzs7QUFFRCxNQUFJLFVBQVUsR0FBRztBQUNmLE9BQUcsRUFBRSxRQUFRO0FBQ2IsU0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ2YsV0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3RCLFVBQU0sRUFBRSxhQUFhO0FBQ3JCLGNBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM1QixXQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDO0FBQ3BDLGNBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7QUFDL0MsbUJBQWUsRUFBRSxLQUFLLENBQUMsVUFBVTtHQUNsQyxDQUFDOzs7O0FBSUYsTUFBSSxRQUFRLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLE1BQU0sQUFBQyxDQUFDOzs7QUFHcEUsTUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixJQUN0RSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUEsQUFBQyxFQUFFO0FBQ25ELGNBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7R0FDN0M7O0FBRUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRW5DLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTs7QUFFcEMsV0FBTyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JEOzs7Q0FHRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsWUFBVztBQUM5QyxNQUFJLG1CQUFtQixDQUFDO0FBQ3hCLE1BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUNwRCx1QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ3ZDLE1BQU07QUFDTCx1QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ3ZDOzs7QUFHRCxNQUFJLENBQUMsV0FBVyxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztBQUNuRCxNQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkUsTUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7QUFDN0MsU0FBTyxrQkFBa0IsQ0FDckIsY0FBYyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxRCxDQUFDOzs7QUFHRixNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzVELE1BQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsSUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWCxJQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNqQixJQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNuQixTQUFPLEVBQUUsQ0FBQztDQUNYLENBQUM7Ozs7Ozs7QUFPRixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFZO0FBQzVDLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6QixNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekIsTUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztDQUM5QixDQUFDOzs7OztBQzVnREYsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3pDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMzQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Ozs7O0FBS2hDLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxDQUFDOzs7QUFHM0IsSUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQVksSUFBSSxFQUFFLEtBQUssRUFBRTtBQUNsQyxTQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xDLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFLEtBQUs7R0FDYixDQUFDLENBQUM7Q0FDSixDQUFDOzs7QUFHRixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBWSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQ3RDLFNBQU8sT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDdEMsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUUsS0FBSztHQUNiLENBQUMsQ0FBQztDQUNKLENBQUM7O0FBRUYsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdEMsSUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztBQUN4QyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO0FBQ2xDLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDeEIsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztBQUNsQyxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO0FBQ3BDLElBQUksbUJBQW1CLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDO0FBQ2xELElBQUksK0JBQStCLEdBQUcsR0FBRyxDQUFDLCtCQUErQixDQUFDO0FBQzFFLElBQUksaUJBQWlCLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixDQUFDO0FBQzlDLElBQUksb0JBQW9CLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDO0FBQ3BELElBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDO0FBQ2hELElBQUksbUJBQW1CLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDO0FBQ2xELElBQUksbUJBQW1CLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDO0FBQ2xELElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7QUFDOUIsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUM1QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3BCLElBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDO0FBQ2hELElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDNUIsSUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUM7QUFDOUMsSUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUM7QUFDOUMsSUFBSSxhQUFhLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7QUFFdEMsSUFBSSxNQUFNLEdBQUc7QUFDWCxnQkFBYyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7QUFDeEQsa0JBQWdCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztBQUM1RCxrQkFBZ0IsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDO0FBQzVELG1CQUFpQixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7QUFDOUQsZ0JBQWMsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0FBQ3hELGtCQUFnQixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUM7QUFDNUQsa0JBQWdCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztBQUM1RCxtQkFBaUIsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDO0FBQzlELHVCQUFxQixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUM7QUFDdEUseUJBQXVCLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztBQUMxRSx5QkFBdUIsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDO0FBQzFFLDBCQUF3QixFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsMEJBQTBCLENBQUM7QUFDNUUsa0JBQWdCLEVBQUUsNEJBQVc7QUFDM0IsV0FBTyxJQUFJLENBQUMsY0FBYyxHQUN4QixJQUFJLENBQUMsZ0JBQWdCLEdBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0dBQzFCO0FBQ0Qsa0JBQWdCLEVBQUUsNEJBQVc7QUFDM0IsV0FBTyxJQUFJLENBQUMsY0FBYyxHQUN4QixJQUFJLENBQUMsZ0JBQWdCLEdBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0dBQzFCO0FBQ0Qsd0JBQXNCLEVBQUUsa0NBQVc7QUFDakMsV0FBTyxJQUFJLENBQUMscUJBQXFCLEdBQy9CLElBQUksQ0FBQyx1QkFBdUIsR0FDNUIsSUFBSSxDQUFDLHVCQUF1QixHQUM1QixJQUFJLENBQUMsd0JBQXdCLENBQUM7R0FDakM7Q0FDRixDQUFDOzs7OztBQUtGLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRTVCLE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQzFCO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1o7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLCtCQUErQixDQUFDLEVBQ2pDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQzs7QUFFQyxVQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsZUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLGtDQUFrQyxDQUFDO09BQ3pEO0FBQ0QsVUFBSSxFQUFFLHVCQUF1QjtBQUM3QixZQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDO0tBQ3ZCLENBQUMsQ0FDSDtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMxQixDQUFDLG1CQUFtQixDQUFDLENBQ3RCO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ25ELENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FDNUM7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsbUJBQW1CLENBQUMsRUFDckIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixDQUFDLENBQzVDO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGVBQVcsRUFBRSxHQUFHO0FBQ2hCLG1CQUFlLEVBQUUsRUFBRTtBQUNuQiw0QkFBd0IsRUFBRSxJQUFJO0dBQy9COztBQUVELFFBQU0sRUFBRTtBQUNOLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNyQixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdkIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQy9CLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsSUFBSTtHQUNmOzs7QUFHRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUM7O0FBRUMsVUFBSSxFQUFFLGNBQVMsS0FBSyxFQUFFO0FBQ3BCLGVBQU8sS0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUM7T0FDbEM7QUFDRCxVQUFJLEVBQUUsV0FBVztBQUNqQixZQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsV0FBVyxFQUFDO0FBQzVCLFlBQU0sRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUM7S0FDdEMsQ0FBQyxFQUNGLENBQUM7O0FBRUMsVUFBSSxFQUFFLGNBQVMsS0FBSyxFQUFFO0FBQ3BCLGVBQU8sS0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUM7T0FDbEM7QUFDRCxVQUFJLEVBQUUsV0FBVztBQUNqQixZQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFDO0tBQ3ZDLENBQUMsQ0FDSDtBQUNELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3BCO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNsQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2I7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsY0FBVSxFQUFFLElBQUk7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxFQUFFO0FBQ1QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDcEI7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUU5QixrQkFBYyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFlBQVEsRUFBRSxLQUFLO0dBQ2hCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUNyQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUNaLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFDdEMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDaEI7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxTQUFPLEVBQUU7QUFDUCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDdEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDaEMsa0JBQWMsRUFBRSxDQUNkLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ25CLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQ3BCO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixlQUFXLEVBQUUsR0FBRztBQUNoQixrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNuQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNmLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2QsQ0FBQztBQUNDLFVBQUksRUFBRSxNQUFNO0FBQ1osVUFBSSxFQUFFLE1BQU07QUFDWixZQUFNLEVBQUUsRUFBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFDO0tBQ3ZDLENBQUMsRUFDRixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUNyQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNaO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixlQUFXLEVBQUUsR0FBRztBQUNoQixrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUNwQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQ3JDLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFDdEMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDZixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNkLENBQUM7QUFDQyxVQUFJLEVBQUUsTUFBTTtBQUNaLFVBQUksRUFBRSxNQUFNO0FBQ1osWUFBTSxFQUFFLEVBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBQztLQUN0QyxDQUFDLENBQ0g7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxRQUFNLEVBQUU7QUFDTixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckIsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdkIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0dBQ2hDOzs7QUFHRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FDcEM7QUFDRCxZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDaEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQ3RDO0FBQ0QsWUFBUSxFQUFFLEtBQUs7R0FDaEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFDckMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDWCxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FDcEM7QUFDRCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxDQUNOO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUNyQixFQUNEO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztLQUNwQixFQUNEO0FBQ0UsY0FBUSxFQUFFLFNBQVM7QUFDbkIsY0FBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUNyQixDQUNGO0FBQ0Qsa0JBQWMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUNuQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNYLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2YsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQ3RDO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxVQUFVO0FBQ3BCLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7S0FDcEIsQ0FDRjtBQUNELGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFDcEMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDZixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFDckMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQ25DO0FBQ0QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsQ0FDTjtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7S0FDcEIsRUFDRDtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7S0FDcEIsQ0FDRjtBQUNELGtCQUFjLEVBQUUsQ0FBQztHQUNsQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUMzRCxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQ3JDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FDcEU7QUFDRCx1QkFBbUIsRUFBRSxLQUFLO0FBQzFCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLENBQ047QUFDRSxjQUFRLEVBQUUsVUFBVTtBQUNwQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLENBQ0Y7QUFDRCxrQkFBYyxFQUFFLENBQUM7R0FDbEI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDeEQsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUNqRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQ25FLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFDckMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUNqRTtBQUNELFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLENBQ047QUFDRSxjQUFRLEVBQUUsY0FBYztBQUN4QixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLENBQ0Y7QUFDRCxrQkFBYyxFQUFFLENBQUM7QUFDakIsdUJBQW1CLEVBQUUsS0FBSztHQUMzQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsRUFBRTtBQUNaLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLENBQ047QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDO0tBQ3BCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsVUFBVTtBQUNwQixjQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDO0tBQ3BCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsY0FBYztBQUN4QixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLEVBQ0Q7QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0tBQ3JCLENBQ0Y7QUFDRCxrQkFBYyxFQUFFLENBQUM7QUFDakIsdUJBQW1CLEVBQUUsS0FBSztHQUMzQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsRUFBRTtBQUNaLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDeEQsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUNqRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQ25FLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFDckMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUNqRTtBQUNELFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLENBQ047QUFDRSxjQUFRLEVBQUUsU0FBUztBQUNuQixjQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUM7S0FDckIsRUFDRDtBQUNFLGNBQVEsRUFBRSxTQUFTO0FBQ25CLGNBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUM7S0FDcEIsRUFDRDtBQUNFLGNBQVEsRUFBRSxjQUFjO0FBQ3hCLGNBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7S0FDckIsQ0FDRjtBQUNELHdCQUFvQixFQUFFLElBQUk7QUFDMUIsa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLHVCQUFtQixFQUFFLEtBQUs7R0FDM0I7O0FBRUQsUUFBTSxFQUFFO0FBQ04sc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckIsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdkIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0dBQ2hDOzs7QUFHRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLCtCQUErQixDQUFDLEVBQ2pDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQzs7QUFFQyxVQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUU7QUFDcEIsZUFBTyxLQUFLLENBQUMsSUFBSSxJQUFJLHVCQUF1QixDQUFDO09BQzlDO0FBQ0QsVUFBSSxFQUFFLHVCQUF1QjtBQUM3QixZQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDO0tBQ3ZCLENBQUMsQ0FDSDtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0I7QUFDRCxlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0I7QUFDRCxlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUNoQjtBQUNELGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGNBQVUsRUFBRSxJQUFJO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixTQUFLLEVBQUUsQ0FBQztBQUNSLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0I7QUFDRCxlQUFXLEVBQUUsR0FBRztBQUNoQixjQUFVLEVBQUUsSUFBSTtHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7QUFDUixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQztBQUNDLFVBQUksRUFBRSxXQUFXO0FBQ2pCLFVBQUksRUFBRSx1QkFBdUI7QUFDN0IsWUFBTSxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQztLQUN2QixDQUFDLENBQ0g7QUFDRCxtQkFBZSxFQUFFLEVBQUU7QUFDbkIsa0JBQWMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsR0FBRztBQUNiLFNBQUssRUFBRSxDQUFDO0FBQ1IsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixrQkFBYyxFQUFFLENBQ2QsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN2QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNiO0FBQ0Qsa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsR0FBRztBQUNiLFlBQVEsRUFBRSxHQUFHO0FBQ2IsU0FBSyxFQUFFLEVBQUU7QUFDVCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FDZCxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNYLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0I7QUFDRCxrQkFBYyxFQUFFLENBQUM7QUFDakIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxHQUFHO0FBQ2IsWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsa0JBQWMsRUFBRSxDQUNkLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0I7QUFDRCxrQkFBYyxFQUFFLEdBQUc7QUFDbkIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsUUFBTSxFQUFFO0FBQ04sVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3JCLFlBQVEsRUFBRSxFQUFFO0FBQ1osWUFBUSxFQUFFLEdBQUc7QUFDYixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN2QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0Isa0JBQWMsRUFBRSxDQUNkLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ2hCO0FBQ0Qsa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0FBQ2hCLGNBQVUsRUFBRSxJQUFJO0dBQ2pCOztBQUVELFFBQU0sRUFBRTtBQUNOLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNyQixZQUFRLEVBQUUsSUFBSTtBQUNkLFlBQVEsRUFBRSxFQUFFO0FBQ1osWUFBUSxFQUFFLEdBQUc7QUFDYixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdkIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQy9CLGtCQUFjLEVBQUcsRUFBRTtBQUNuQixrQkFBYyxFQUFFLENBQUM7QUFDakIsZUFBVyxFQUFFLEdBQUc7R0FDaEI7Ozs7QUFJRixPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsV0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RCLGVBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLFVBQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixZQUFRLEVBQUUsSUFBSTtBQUNkLFdBQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0QixlQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsZUFBVyxFQUFFLEdBQUc7R0FDakI7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixVQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsWUFBUSxFQUFFLElBQUk7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCOztBQUVELE9BQUssRUFBRTtBQUNMLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsVUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsWUFBUSxFQUFFLEdBQUc7QUFDYixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsZUFBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQUUsQ0FBQztBQUNqQixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxXQUFTLEVBQUU7QUFDVCxVQUFNLEVBQUUsRUFBRTtBQUNWLFlBQVEsRUFBRSxJQUFJO0FBQ2QsWUFBUSxFQUFFLEdBQUc7QUFDYixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQztBQUN2QyxlQUFXLEVBQUUsRUFBRTtBQUNmLGtCQUFjLEVBQUUsQ0FBQztBQUNqQixlQUFXLEVBQUUsR0FBRztHQUNqQjs7QUFFRCxVQUFRLEVBQUU7QUFDUixVQUFNLEVBQUUsRUFBRTtBQUNWLFlBQVEsRUFBRSxLQUFLO0FBQ2YsWUFBUSxFQUFFLEdBQUc7QUFDYixXQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQztBQUN2QyxlQUFXLEVBQUUsRUFBRTtBQUNmLGtCQUFjLEVBQUUsQ0FBQztBQUNqQixlQUFXLEVBQUUsR0FBRztHQUNqQjtBQUNELFdBQVMsRUFBRTtBQUNULFVBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBUSxFQUFFLEtBQUs7QUFDZixZQUFRLEVBQUUsR0FBRztBQUNiLFFBQUksRUFBRSxJQUFJO0FBQ1YsV0FBTyxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQzdCLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxHQUN6QixNQUFNLENBQUMsZ0JBQWdCLEVBQUUsR0FDekIsTUFBTSxDQUFDLHNCQUFzQixFQUFFLEdBQy9CLFVBQVUsQ0FBQyxXQUFXLENBQUMsNEJBQTRCLENBQUMsR0FDcEQsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUM3QztBQUNILGVBQVcsRUFBRSxFQUFFO0FBQ2Ysa0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGVBQVcsRUFBRSxHQUFHO0dBQ2pCO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFlLEVBQUU7QUFDZixpQkFBYSxFQUFFLElBQUk7QUFDbkIsZUFBVyxFQUFFLElBQUk7R0FDbEI7QUFDRCxlQUFhLEVBQUUscUJBQXFCO0NBQ3JDLENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDMUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQWUsRUFBRTtBQUNmLGlCQUFhLEVBQUUsSUFBSTtBQUNuQixlQUFXLEVBQUUsSUFBSTtBQUNqQixlQUFXLEVBQUUsSUFBSTtHQUNsQjtBQUNELGVBQWEsRUFBRSw0Q0FBNEM7Q0FDNUQsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMxQyxZQUFVLEVBQUUsSUFBSTtBQUNoQixpQkFBZSxFQUFFO0FBQ2YsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLG1CQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO0dBQzFDO0FBQ0QsZUFBYSxFQUFFLDBDQUEwQztDQUMxRCxDQUFDLENBQUM7QUFDSCxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFlLEVBQUU7QUFDZixpQkFBYSxFQUFFLElBQUk7QUFDbkIsZUFBVyxFQUFFLElBQUk7QUFDakIsZUFBVyxFQUFFLElBQUk7QUFDakIsbUJBQWUsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7R0FDMUM7QUFDRCxlQUFhLEVBQUUsNkRBQTZEO0NBQzdFLENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDNUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQWUsRUFBRTtBQUNmLGlCQUFhLEVBQUUsSUFBSTtBQUNuQixlQUFXLEVBQUUsSUFBSTtBQUNqQixlQUFXLEVBQUUsSUFBSTtBQUNqQixjQUFVLEVBQUUsSUFBSTtBQUNoQixtQkFBZSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtHQUMxQztBQUNELGVBQWEsRUFBRSxxQkFBcUI7Q0FDckMsQ0FBQyxDQUFDOzs7QUN0NEJIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0FBQyxDQUFDLENBQUM7Q0FDdEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3hDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3BELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMxQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ2xELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN4QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxRQUFRLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN6QyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUN2RCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNyQyxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUN4RCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3RDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2xELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxLQUFLLEVBQUUsRUFBRSxFQUFFO0FBQ2pELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFTLEVBQUUsRUFBRTtBQUN2QyxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDekMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsS0FBSyxFQUFFLEVBQUUsRUFBRTtBQUNqRCxNQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQy9DLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQ25ELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ25DLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxPQUFPLEVBQUUsRUFBRSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3BDLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxFQUFFLEVBQUU7QUFDNUMsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQzVDLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLEtBQUssRUFBRSxFQUFFLEVBQUU7QUFDbEQsTUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgQXJ0aXN0ID0gcmVxdWlyZSgnLi90dXJ0bGUnKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy50dXJ0bGVNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICB2YXIgYXJ0aXN0ID0gbmV3IEFydGlzdCgpO1xuXG4gIHdpbmRvdy5fX1Rlc3RJbnRlcmZhY2Uuc2V0U3BlZWRTbGlkZXJWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGFydGlzdC5zcGVlZFNsaWRlci5zZXRWYWx1ZSh2YWx1ZSk7XG4gIH07XG4gIGFydGlzdC5pbmplY3RTdHVkaW9BcHAoc3R1ZGlvQXBwKTtcbiAgYXBwTWFpbihhcnRpc3QsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwidmFyIHNraW5CYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5CYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcblxuICB2YXIgQ09ORklHUyA9IHtcbiAgICBhbm5hOiB7XG4gICAgICAvLyBzbGlkZXIgc3BlZWQgZ2V0cyBkaXZpZGVkIGJ5IHRoaXMgdmFsdWVcbiAgICAgIHNwZWVkTW9kaWZpZXI6IDEwLFxuICAgICAgdHVydGxlTnVtRnJhbWVzOiAxMCxcbiAgICAgIHNtb290aEFuaW1hdGU6IHRydWUsXG4gICAgICBjb25zb2xpZGF0ZVR1cm5BbmRNb3ZlOiB0cnVlLFxuICAgICAgYW5uYUxpbmU6IHNraW4uYXNzZXRVcmwoJ2FubmFsaW5lLnBuZycpLFxuICAgICAgYW5uYUxpbmVfMng6IHNraW4uYXNzZXRVcmwoJ2FubmFsaW5lXzJ4LnBuZycpLFxuICAgICAgLy8gVXNlZCB0byBwb3B1bGF0ZSB0aGUgU2V0IFBhdHRlcm4gYmxvY2tcbiAgICAgIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zOiBbW3NraW4uYXNzZXRVcmwoJ2FubmFsaW5lLW1lbnVpY29uLnBuZycpLCAnYW5uYUxpbmUnXV1cbiAgICB9LFxuXG4gICAgZWxzYToge1xuICAgICAgc3BlZWRNb2RpZmllcjogMTAsXG4gICAgICB0dXJ0bGVOdW1GcmFtZXM6IDIwLFxuICAgICAgZGVjb3JhdGlvbkFuaW1hdGlvbk51bUZyYW1lczogMTksXG4gICAgICBzbW9vdGhBbmltYXRlOiB0cnVlLFxuICAgICAgY29uc29saWRhdGVUdXJuQW5kTW92ZTogdHJ1ZSxcbiAgICAgIGVsc2FMaW5lOiBza2luLmFzc2V0VXJsKCdlbHNhbGluZS5wbmcnKSxcbiAgICAgIGVsc2FMaW5lXzJ4OiBza2luLmFzc2V0VXJsKCdlbHNhbGluZV8yeC5wbmcnKSxcbiAgICAgIC8vIFVzZWQgdG8gcG9wdWxhdGUgdGhlIFNldCBQYXR0ZXJuIGJsb2NrXG4gICAgICBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9uczogW1tza2luLmFzc2V0VXJsKCdlbHNhbGluZS1tZW51aWNvbi5wbmcnKSwgJ2Vsc2FMaW5lJ11dXG4gICAgfSxcblxuICAgIGFydGlzdDoge1xuICAgICAgLy8gVXNlZCB0byBwb3B1bGF0ZSB0aGUgU2V0IFBhdHRlcm4gYmxvY2tcbiAgICAgIGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zOiBbXG4gICAgICAgICAgW3NraW4ucmFpbmJvd01lbnUsICdyYWluYm93TGluZSddLFxuICAgICAgICAgIFtza2luLnJvcGVNZW51LCAncm9wZUxpbmUnXSxcbiAgICAgICAgICBbc2tpbi5zcXVpZ2dseU1lbnUsICdzcXVpZ2dseUxpbmUnXSxcbiAgICAgICAgICBbc2tpbi5zd2lybHlNZW51LCAnc3dpcmx5TGluZSddXG4gICAgICBdXG4gICAgfVxuICB9O1xuXG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG4gIC8vIGJhc2Ugc2tpbiBwcm9wZXJ0aWVzIGhlcmUgKGNhbiBiZSBvdmVycmlkZW4gYnkgQ09ORklHKVxuICBza2luLnNwZWVkTW9kaWZpZXIgPSAxO1xuXG4gIC8vIHN0YW1wcyBhcmVuJ3QgYWN0dWFsbHkgdXNlZCBvbiBwcm9kdWN0aW9uIGFueXdoZXJlIHJpZ2h0IG5vdy4gaWYgd2Ugd2VyZVxuICAvLyB0byB3YW50IHRvIHVzZSB0aGVtLCBkZWZpbmUgdGhlIG1hcHBpbmcgZnJvbSBpbWFnZSB0byBuYW1lIGhlcmUuXG4gIHNraW4uc3RhbXBWYWx1ZXMgPSBbXG4gICAgW3NraW4uc3RpY2tlcnMuZWxlcGhhbnQsICdFbGVwaGFudCddLFxuICAgIFtza2luLnN0aWNrZXJzLmRyYWdvbiwgJ0RyYWdvbiddLFxuICAgIFtza2luLnN0aWNrZXJzLnRyaWNlcmF0b3BzLCAnVHJpY2VyYXRvcHMnXSxcbiAgICBbc2tpbi5zdGlja2Vycy5tb25rZXksICdNb25rZXknXSxcbiAgICBbc2tpbi5zdGlja2Vycy5jYXQsICdDYXQnXSxcbiAgICBbc2tpbi5zdGlja2Vycy50dXJ0bGUsICdUdXJ0bGUnXSxcbiAgICBbc2tpbi5zdGlja2Vycy5nb2F0LCAnR29hdCddLFxuICAgIFtza2luLnN0aWNrZXJzLnplYnJhLCAnWmVicmEnXSxcbiAgICBbc2tpbi5zdGlja2Vycy5oaXBwbywgJ0hpcHBvJ10sXG4gICAgW3NraW4uc3RpY2tlcnMuYnVubnksICdCdW5ueSddLFxuICAgIFtza2luLnN0aWNrZXJzLnBlYWNvY2ssICdQZWFjb2NrJ10sXG4gICAgW3NraW4uc3RpY2tlcnMubGxhbWEsICdMbGFtYSddLFxuICAgIFtza2luLnN0aWNrZXJzLmdpcmFmZmUsICdHaXJhZmZlJ10sXG4gICAgW3NraW4uc3RpY2tlcnMubW91c2UsICdNb3VzZSddLFxuICAgIFtza2luLnN0aWNrZXJzLmJlYXZlciwgJ0JlYXZlciddLFxuICAgIFtza2luLnN0aWNrZXJzLmJhdCwgJ0JhdCddLFxuICAgIFtza2luLnN0aWNrZXJzLmdyYXNzaG9wcGVyLCAnR3Jhc3Nob3BwZXInXSxcbiAgICBbc2tpbi5zdGlja2Vycy5jaGlja2VuLCAnQ2hpY2tlbiddLFxuICAgIFtza2luLnN0aWNrZXJzLm1vb3NlLCAnTW9vc2UnXSxcbiAgICBbc2tpbi5zdGlja2Vycy5vd2wsICdPd2wnXSxcbiAgICBbc2tpbi5zdGlja2Vycy5wZW5ndWluLCAnUGVuZ3VpbiddLFxuICAgIFtza2luLnN0aWNrZXJzLmxpb24sICdMaW9uJ10sXG4gICAgW3NraW4uc3RpY2tlcnMucm9ib3QsICdSb2JvdCddLFxuICAgIFtza2luLnN0aWNrZXJzLnJvY2tldCwgJ1JvY2tldCddLFxuICBdO1xuXG4gIC8vIEdldCBwcm9wZXJ0aWVzIGZyb20gY29uZmlnXG4gIHZhciBpc0Fzc2V0ID0gL1xcLlxcU3szfSQvOyAvLyBlbmRzIGluIGRvdCBmb2xsb3dlZCBieSB0aHJlZSBub24td2hpdGVzcGFjZSBjaGFyc1xuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuICAgIHNraW5bcHJvcF0gPSBjb25maWdbcHJvcF07XG4gIH1cblxuICAvLyBEZWNsYXJlIGF2YWlsYWJsZSBsaW5lIHN0eWxlIHBhdHRlcm5zLiBUaGlzIGFycmF5IG9mIGFycmF5cyBpcyBldmVudHVhbGx5IHVzZWRcbiAgLy8gdG8gcG9wdWxhdGUgdGhlIGltYWdlIGRyb3Bkb3duIGluIHRoZSBTZXQgUGF0dGVybiBibG9jay5cblxuICAvLyBBbGwgc2tpbnMgaGF2ZSB0aGUgZGVmYXVsdCBsaW5lIHN0eWxlIChzb2xpZCBjb2xvdXJlZCBsaW5lKVxuICB2YXIgbGluZVN0eWxlUGF0dGVybk9wdGlvbnMgPSAgW1tza2luLnBhdHRlcm5EZWZhdWx0LCAnREVGQVVMVCddXTtcblxuICAvLyBJZiB0aGUgc2tpbiBwcm92aWRlZCBsaW5lIHBhdHRlcm5zLCBhZGQgdGhlbSB0byB0aGUgcGF0dGVybiBzZXRcbiAgaWYgKGNvbmZpZyAmJiBjb25maWcubGluZVN0eWxlUGF0dGVybk9wdGlvbnMpIHtcbiAgICBsaW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLmNvbmNhdChjb25maWcubGluZVN0eWxlUGF0dGVybk9wdGlvbnMpO1xuICB9XG5cbiAgc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IGxpbmVTdHlsZVBhdHRlcm5PcHRpb25zO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBUdXJ0bGUgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBUdXJ0bGUgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBjdXN0b21MZXZlbEJsb2NrcyA9IHJlcXVpcmUoJy4vY3VzdG9tTGV2ZWxCbG9ja3MnKTtcbnZhciBUdXJ0bGUgPSByZXF1aXJlKCcuL3R1cnRsZScpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgdmFyIGdlbnN5bSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgTkFNRV9UWVBFID0gYmxvY2tseS5WYXJpYWJsZXMuTkFNRV9UWVBFO1xuICAgIHJldHVybiBnZW5lcmF0b3IudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKG5hbWUsIE5BTUVfVFlQRSk7XG4gIH07XG5cbiAgaWYgKHNraW4uaWQgPT0gXCJhbm5hXCIgfHwgc2tpbi5pZCA9PSBcImVsc2FcIilcbiAge1xuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICBDb2xvdXJzLkZST1pFTjEsIENvbG91cnMuRlJPWkVOMiwgQ29sb3Vycy5GUk9aRU4zLFxuICAgICAgQ29sb3Vycy5GUk9aRU40LCBDb2xvdXJzLkZST1pFTjUsIENvbG91cnMuRlJPWkVONixcbiAgICAgIENvbG91cnMuRlJPWkVONywgQ29sb3Vycy5GUk9aRU44LCBDb2xvdXJzLkZST1pFTjldO1xuICAgIGJsb2NrbHkuRmllbGRDb2xvdXIuQ09MVU1OUyA9IDM7XG5cbiAgfSBlbHNlIHtcblxuICAgIC8vIENyZWF0ZSBhIHNtYWxsZXIgcGFsZXR0ZS5cbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTE9VUlMgPSBbXG4gICAgICAvLyBSb3cgMS5cbiAgICAgIENvbG91cnMuQkxBQ0ssIENvbG91cnMuR1JFWSxcbiAgICAgIENvbG91cnMuS0hBS0ksIENvbG91cnMuV0hJVEUsXG4gICAgICAvLyBSb3cgMi5cbiAgICAgIENvbG91cnMuUkVELCBDb2xvdXJzLlBJTkssXG4gICAgICBDb2xvdXJzLk9SQU5HRSwgQ29sb3Vycy5ZRUxMT1csXG4gICAgICAvLyBSb3cgMy5cbiAgICAgIENvbG91cnMuR1JFRU4sIENvbG91cnMuQkxVRSxcbiAgICAgIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICBibG9ja2x5LkZpZWxkQ29sb3VyLkNPTFVNTlMgPSA0O1xuICB9XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMTAwJyxcbiAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVscy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgYmxvY2tseS5CbG9ja3MuZHJhd19tb3ZlLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2ZcbiAgICAvLyBwaXhlbHMuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5kcmF3X21vdmVfYnlfY29uc3RhbnRfZHJvcGRvd24gPSBnZW5lcmF0b3IuZHJhd19tb3ZlX2J5X2NvbnN0YW50O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IGZyb20gYW1vbmcgYSBmaXhlZCBzZXQgb2YgYW5nbGVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZC5WQUxVRSA9XG4gICAgICBbMzAsIDQ1LCA2MCwgOTAsIDEyMCwgMTM1LCAxNTAsIDE4MF0uXG4gICAgICBtYXAoZnVuY3Rpb24odCkge3JldHVybiBbU3RyaW5nKHQpLCBTdHJpbmcodCldO30pO1xuXG4gIGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2J5X2NvbnN0YW50ID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQgYW55IG51bWJlciBvZiBkZWdyZWVzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm5fYnlfY29uc3RhbnRfZHJvcGRvd24gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodCBhbnkgbnVtYmVyIG9mIGRlZ3JlZXMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybi5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oKSwgJ1ZBTFVFJylcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpIHx8IDA7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9ieV9jb25zdGFudF9kcm9wZG93biA9IGdlbmVyYXRvci5kcmF3X3R1cm5fYnlfY29uc3RhbnQ7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbW92ZV9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUZsb2F0KHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKSk7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBlaXRoZXIgbGVmdCBvciByaWdodCBmcm9tIGFtb25nIGEgZml4ZWQgc2V0IG9mIGFuZ2xlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRSksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZV9yZXN0cmljdGVkLlZBTFVFID1cbiAgICAgIFszMCwgNDUsIDYwLCA5MCwgMTIwLCAxMzUsIDE1MCwgMTgwXS5cbiAgICAgIG1hcChmdW5jdGlvbih0KSB7cmV0dXJuIFtTdHJpbmcodCksIFN0cmluZyh0KV07fSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfdHVybl9pbmxpbmVfcmVzdHJpY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgZWl0aGVyIGxlZnQgb3IgcmlnaHQgZnJvbSBhbW9uZyBhIGZpeGVkXG4gICAgLy8gc2V0IG9mIGFuZ2xlcy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuX2lubGluZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0IGFueSBudW1iZXIgb2YgZGVncmVlcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCc5MCcsXG4gICAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ1ZBTFVFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRlZ3JlZXMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuX2lubGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VGbG9hdCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykpO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9jb3VudGVyID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxvb3BWYXJpYWJsZSgpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfY291bnRlciA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0ge1xuICAgIC8vIFZhcmlhYmxlIGdldHRlci5cbiAgICBjYXRlZ29yeTogbnVsbCwgIC8vIFZhcmlhYmxlcyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkuXG4gICAgaGVscFVybDogYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfVElUTEUpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwobXNnLmxlbmd0aFBhcmFtZXRlcigpKSwgJ1ZBUicpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoYmxvY2tseS5Nc2cuVkFSSUFCTEVTX0dFVF9UT09MVElQKTtcbiAgICB9LFxuICAgIGdldFZhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBUicpXTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXRfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhcmlhYmxlc19nZXQ7XG5cbiAgYmxvY2tseS5CbG9ja3MudmFyaWFibGVzX2dldF9zaWRlcyA9IHtcbiAgICAvLyBWYXJpYWJsZSBnZXR0ZXIuXG4gICAgY2F0ZWdvcnk6IG51bGwsICAvLyBWYXJpYWJsZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5LlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLlZBUklBQkxFU19HRVRfSEVMUFVSTCxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RJVExFKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKCdzaWRlcycpLCAnVkFSJyk7XG4gICAgICB0aGlzLnNldE91dHB1dCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChibG9ja2x5Lk1zZy5WQVJJQUJMRVNfR0VUX1RPT0xUSVApO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudmFyaWFibGVzX2dldF9zaWRlcyA9IGdlbmVyYXRvci52YXJpYWJsZXNfZ2V0O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZSA9IHtcbiAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU3F1YXJlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldEFsaWduKGJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3F1YXJlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZHJhd2luZyBhIHNxdWFyZS5cbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKSB8fCAwO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgICAvLyBEb24ndCBjaGFuZ2UgaXQgd2l0aG91dCBjaGFuZ2luZyByZXF1aXJlZEJsb2Nrc18uXG4gICAgICAgICcvLyBkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc25vd21hblwiIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBtYWRlIGF2YWlsYWJsZSB0b1xuICAvLyB1c2VycyB3aXRob3V0IGJlaW5nIHNob3duIGluIHRoZSB3b3Jrc3BhY2UuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9zbm93bWFuID0ge1xuICAgIC8vIERyYXcgYSBjaXJjbGUgaW4gZnJvbnQgb2YgdGhlIHR1cnRsZSwgZW5kaW5nIHVwIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoOTQsIDAuODQsIDAuNjApO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRyYXdBU25vd21hbigpKTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgIC5zZXRBbGlnbihibG9ja2x5LkFMSUdOX1JJR0hUKVxuICAgICAgICAgIC5zZXRDaGVjayhibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUilcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxlbmd0aFBhcmFtZXRlcigpICsgJzonKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAoJycpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dtYW4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc25vd21hbiBpbiBmcm9udCBvZiB0aGUgdHVydGxlLlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGRpc3RhbmNlc1ZhciA9IGdlbnN5bSgnZGlzdGFuY2VzJyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50ZXInKTtcbiAgICB2YXIgZGVncmVlVmFyID0gZ2Vuc3ltKCdkZWdyZWUnKTtcbiAgICB2YXIgZGlzdGFuY2VWYXIgPSBnZW5zeW0oJ2Rpc3RhbmNlJyk7XG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIFRoZSBnZW5lcmF0ZWQgY29tbWVudCBoZWxwcyBkZXRlY3QgcmVxdWlyZWQgYmxvY2tzLlxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIGl0IHdpdGhvdXQgY2hhbmdpbmcgcmVxdWlyZWRCbG9ja3NfLlxuICAgICAgJy8vIGRyYXdfYV9zbm93bWFuJyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAndmFyICcgKyBkaXN0YW5jZXNWYXIgKyAnID0gWycgKyB2YWx1ZSArICcgKiAwLjUsICcgKyB2YWx1ZSArICcgKiAwLjMsJyArXG4gICAgICAgICAgdmFsdWUgKyAnICogMC4yXTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgIGxvb3BWYXIgKyAnKyspIHtcXG4nLFxuICAgICAgJyAgdmFyICcgKyBkaXN0YW5jZVZhciArICcgPSAnICsgZGlzdGFuY2VzVmFyICsgJ1snICsgbG9vcFZhciArXG4gICAgICAgICAgJyA8IDMgPyAnICsgbG9vcFZhciArICc6IDUgLSAnICsgbG9vcFZhciArICddIC8gNTcuNTsnLFxuICAgICAgJyAgZm9yICh2YXIgJyArIGRlZ3JlZVZhciArICcgPSAwOyAnICsgZGVncmVlVmFyICsgJyA8IDkwOyAnICtcbiAgICAgICAgICBkZWdyZWVWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIGRpc3RhbmNlVmFyICsgJyk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCgyKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnICBpZiAoJyArIGxvb3BWYXIgKyAnICE9IDIpIHsnLFxuICAgICAgJyAgICBUdXJ0bGUudHVybkxlZnQoMTgwKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGEgbW9kaWZpZWQgY29weSBvZiBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3Igd2l0aCB0aGVcbiAgLy8gdmFyaWFibGUgbmFtZWQgXCJjb3VudGVyXCIgaGFyZGNvZGVkLlxuICBibG9ja2x5LkJsb2Nrcy5jb250cm9sc19mb3JfY291bnRlciA9IHtcbiAgICAvLyBGb3IgbG9vcCB3aXRoIGhhcmRjb2RlZCBsb29wIHZhcmlhYmxlLlxuICAgIGhlbHBVcmw6IGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9IRUxQVVJMLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9JTlBVVF9XSVRIKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKG1zZy5sb29wVmFyaWFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICdWQVInKTtcbiAgICAgIHRoaXMuaW50ZXJwb2xhdGVNc2coYmxvY2tseS5Nc2cuQ09OVFJPTFNfRk9SX0lOUFVUX0ZST01fVE9fQlksXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ0ZST00nLCAnTnVtYmVyJywgYmxvY2tseS5BTElHTl9SSUdIVF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbJ1RPJywgJ051bWJlcicsIGJsb2NrbHkuQUxJR05fUklHSFRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWydCWScsICdOdW1iZXInLCBibG9ja2x5LkFMSUdOX1JJR0hUXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrbHkuQUxJR05fUklHSFQpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShCbG9ja2x5Lk1zZy5DT05UUk9MU19GT1JfSU5QVVRfRE8pO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKGJsb2NrbHkuTXNnLkNPTlRST0xTX0ZPUl9UT09MVElQLnJlcGxhY2UoXG4gICAgICAgICAgJyUxJywgdGhpcy5nZXRUaXRsZVZhbHVlKCdWQVInKSkpO1xuICAgIH0sXG4gICAgZ2V0VmFyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyldO1xuICAgIH0sXG4gICAgY3VzdG9tQ29udGV4dE1lbnU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBvcHRpb24gPSB7ZW5hYmxlZDogdHJ1ZX07XG4gICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBvcHRpb24udGV4dCA9IGJsb2NrbHkuTXNnLlZBUklBQkxFU19TRVRfQ1JFQVRFX0dFVC5yZXBsYWNlKCclMScsIG5hbWUpO1xuICAgICAgdmFyIHhtbFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGl0bGUnKTtcbiAgICAgIHhtbFRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5hbWUpKTtcbiAgICAgIHhtbFRpdGxlLnNldEF0dHJpYnV0ZSgnbmFtZScsICdWQVInKTtcbiAgICAgIHZhciB4bWxCbG9jayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jsb2NrJyk7XG4gICAgICB4bWxCbG9jay5hcHBlbmRDaGlsZCh4bWxUaXRsZSk7XG4gICAgICB4bWxCbG9jay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndmFyaWFibGVzX2dldF9jb3VudGVyJyk7XG4gICAgICBvcHRpb24uY2FsbGJhY2sgPSBibG9ja2x5LkNvbnRleHRNZW51LmNhbGxiYWNrRmFjdG9yeSh0aGlzLCB4bWxCbG9jayk7XG4gICAgICBvcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICB9LFxuICAgIC8vIHNlcmlhbGl6ZSB0aGUgY291bnRlciB2YXJpYWJsZSBuYW1lIHRvIHhtbCBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFjcm9zc1xuICAgIC8vIGRpZmZlcmVudCBsb2NhbGVzXG4gICAgbXV0YXRpb25Ub0RvbTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ211dGF0aW9uJyk7XG4gICAgICB2YXIgY291bnRlciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVkFSJyk7XG4gICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCdjb3VudGVyJywgY291bnRlcik7XG4gICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH0sXG4gICAgLy8gZGVzZXJpYWxpemUgdGhlIGNvdW50ZXIgdmFyaWFibGUgbmFtZVxuICAgIGRvbVRvTXV0YXRpb246IGZ1bmN0aW9uKHhtbEVsZW1lbnQpIHtcbiAgICAgIHZhciBjb3VudGVyID0geG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NvdW50ZXInKTtcbiAgICAgIHRoaXMuc2V0VGl0bGVWYWx1ZShjb3VudGVyLCAnVkFSJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jb250cm9sc19mb3JfY291bnRlciA9IGdlbmVyYXRvci5jb250cm9sc19mb3I7XG5cbiAgLy8gRGVsZXRlIHRoZXNlIHN0YW5kYXJkIGJsb2Nrcy5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcblxuICAvLyBHZW5lcmFsIGJsb2Nrcy5cblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1ZBTFVFJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmRyYXdfbW92ZS5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvdHMoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X21vdmUuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5tb3ZlRm9yd2FyZCgpLCAnbW92ZUZvcndhcmQnXSxcbiAgICAgICBbbXNnLm1vdmVCYWNrd2FyZCgpLCAnbW92ZUJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X21vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgdmFyIHZhbHVlID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdWQUxVRScsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMCc7XG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKCcgKyB2YWx1ZSArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5qdW1wID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZHMuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5qdW1wLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIkxPTkdfTU9WRV9MRU5HVEhcIjtcbiAgdmFyIHNob3J0TW92ZUxlbmd0aERyb3Bkb3duVmFsdWUgPSBcIlNIT1JUX01PVkVfTEVOR1RIXCI7XG4gIHZhciBzaW1wbGVMZW5ndGhDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhdywgbG9uZ01vdmVMZW5ndGhEcm9wZG93blZhbHVlXSxcbiAgICBbc2tpbi5zaG9ydExpbmVEcmF3LCBzaG9ydE1vdmVMZW5ndGhEcm9wZG93blZhbHVlXVxuICBdO1xuICB2YXIgc2ltcGxlTGVuZ3RoUmlnaHRDaG9pY2VzID0gW1xuICAgIFtza2luLmxvbmdMaW5lRHJhd1JpZ2h0LCBsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWVdLFxuICAgIFtza2luLnNob3J0TGluZURyYXdSaWdodCwgc2hvcnRNb3ZlTGVuZ3RoRHJvcGRvd25WYWx1ZV1cbiAgXTtcblxuICB2YXIgU2ltcGxlTW92ZSA9IHtcbiAgICBERUZBVUxUX01PVkVfTEVOR1RIOiA1MCxcbiAgICBTSE9SVF9NT1ZFX0xFTkdUSDogNTAsXG4gICAgTE9OR19NT1ZFX0xFTkdUSDogMTAwLFxuICAgIERJUkVDVElPTl9DT05GSUdTOiB7XG4gICAgICBsZWZ0OiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdtb3ZlTGVmdCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlV2VzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4ud2VzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAgcmlnaHQ6IHtcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25FYXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVSaWdodCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlRWFzdFRvb2x0aXAoKSxcbiAgICAgICAgaW1hZ2U6IHNraW4uZWFzdExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhSaWdodENob2ljZXNcbiAgICAgIH0sXG4gICAgICB1cDoge1xuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ21vdmVVcCcsXG4gICAgICAgIHRvb2x0aXA6IG1zZy5tb3ZlTm9ydGhUb29sdGlwKCksXG4gICAgICAgIGltYWdlOiBza2luLm5vcnRoTGluZURyYXcsXG4gICAgICAgIGltYWdlRGltZW5zaW9uczoge3dpZHRoOiA3MiwgaGVpZ2h0OiA1Nn0sXG4gICAgICAgIGxlbmd0aHM6IHNpbXBsZUxlbmd0aENob2ljZXNcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uU291dGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnbW92ZURvd24nLFxuICAgICAgICB0b29sdGlwOiBtc2cubW92ZVNvdXRoVG9vbHRpcCgpLFxuICAgICAgICBpbWFnZTogc2tpbi5zb3V0aExpbmVEcmF3LFxuICAgICAgICBpbWFnZURpbWVuc2lvbnM6IHt3aWR0aDogNzIsIGhlaWdodDogNTZ9LFxuICAgICAgICBsZW5ndGhzOiBzaW1wbGVMZW5ndGhDaG9pY2VzXG4gICAgICB9LFxuICAgICAganVtcF9sZWZ0OiB7XG4gICAgICAgIGlzSnVtcDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IGNvbW1vbk1zZy5kaXJlY3Rpb25XZXN0TGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBMZWZ0JyxcbiAgICAgICAgaW1hZ2U6IHNraW4ubGVmdEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBXZXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF9yaWdodDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLFxuICAgICAgICBtb3ZlRnVuY3Rpb246ICdqdW1wUmlnaHQnLFxuICAgICAgICBpbWFnZTogc2tpbi5yaWdodEp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBFYXN0VG9vbHRpcCgpXG4gICAgICB9LFxuICAgICAganVtcF91cDoge1xuICAgICAgICBpc0p1bXA6IHRydWUsXG4gICAgICAgIHRpdGxlOiBjb21tb25Nc2cuZGlyZWN0aW9uTm9ydGhMZXR0ZXIoKSxcbiAgICAgICAgbW92ZUZ1bmN0aW9uOiAnanVtcFVwJyxcbiAgICAgICAgaW1hZ2U6IHNraW4udXBKdW1wQXJyb3csXG4gICAgICAgIHRvb2x0aXA6IG1zZy5qdW1wTm9ydGhUb29sdGlwKClcbiAgICAgIH0sXG4gICAgICBqdW1wX2Rvd246IHtcbiAgICAgICAgaXNKdW1wOiB0cnVlLFxuICAgICAgICB0aXRsZTogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksXG4gICAgICAgIG1vdmVGdW5jdGlvbjogJ2p1bXBEb3duJyxcbiAgICAgICAgaW1hZ2U6IHNraW4uZG93bkp1bXBBcnJvdyxcbiAgICAgICAgdG9vbHRpcDogbXNnLmp1bXBTb3V0aFRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JBbGxEaXJlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJ1cFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJkb3duXCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcImxlZnRcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwicmlnaHRcIik7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbjogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24pO1xuICAgICAgZ2VuZXJhdG9yW1wic2ltcGxlX2p1bXBfXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoJ2p1bXBfJyArIGRpcmVjdGlvbik7XG4gICAgICBnZW5lcmF0b3JbXCJzaW1wbGVfbW92ZV9cIiArIGRpcmVjdGlvbiArIFwiX2xlbmd0aFwiXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbiArICdfbGVuZ3RoJ10gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbiwgdHJ1ZSk7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX21vdmVfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbik7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snc2ltcGxlX2p1bXBfJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKCdqdW1wXycgKyBkaXJlY3Rpb24pO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVNb3ZlQmxvY2s6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgIHZhciBkaXJlY3Rpb25Db25maWcgPSBTaW1wbGVNb3ZlLkRJUkVDVElPTl9DT05GSUdTW2RpcmVjdGlvbl07XG4gICAgICB2YXIgZGlyZWN0aW9uTGV0dGVyV2lkdGggPSAxMjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlbHBVcmw6ICcnLFxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uQ29uZmlnLmlzSnVtcCkge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoY29tbW9uTXNnLmp1bXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoZGlyZWN0aW9uQ29uZmlnLnRpdGxlLCB7Zml4ZWRTaXplOiB7d2lkdGg6IGRpcmVjdGlvbkxldHRlcldpZHRoLCBoZWlnaHQ6IDE4fX0pKTtcblxuICAgICAgICAgIGlmIChkaXJlY3Rpb25Db25maWcuaW1hZ2VEaW1lbnNpb25zKSB7XG4gICAgICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKGRpcmVjdGlvbkNvbmZpZy5pbWFnZSxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgICAgICAgZGlyZWN0aW9uQ29uZmlnLmltYWdlRGltZW5zaW9ucy5oZWlnaHQpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXRUb29sdGlwKGRpcmVjdGlvbkNvbmZpZy50b29sdGlwKTtcbiAgICAgICAgICBpZiAoaGFzTGVuZ3RoSW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bihkaXJlY3Rpb25Db25maWcubGVuZ3Rocyk7XG4gICAgICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShsb25nTW92ZUxlbmd0aERyb3Bkb3duVmFsdWUpO1xuICAgICAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdsZW5ndGgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcbiAgICBnZW5lcmF0ZUNvZGVHZW5lcmF0b3I6IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaGFzTGVuZ3RoSW5wdXQsIGxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZW5ndGggPSBsZW5ndGggfHwgU2ltcGxlTW92ZS5ERUZBVUxUX01PVkVfTEVOR1RIO1xuXG4gICAgICAgIGlmIChoYXNMZW5ndGhJbnB1dCkge1xuICAgICAgICAgIGxlbmd0aCA9IFNpbXBsZU1vdmVbdGhpcy5nZXRUaXRsZVZhbHVlKFwibGVuZ3RoXCIpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1R1cnRsZS4nICsgU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dLm1vdmVGdW5jdGlvbiArICcoJyArIGxlbmd0aCArICcsJyArICdcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9ucygpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5qdW1wRm9yd2FyZCgpLCAnanVtcEZvcndhcmQnXSxcbiAgICAgICBbbXNnLmp1bXBCYWNrd2FyZCgpLCAnanVtcEJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5qdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IganVtcGluZyBmb3J3YXJkIG9yIGJhY2t3YXJkcy5cbiAgICB2YXIgdmFsdWUgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICcwJztcbiAgICByZXR1cm4gJ1R1cnRsZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoJyArIHZhbHVlICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmp1bXBfYnlfY29uc3RhbnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzXG4gICAgLy8gd2l0aG91dCBkcmF3aW5nLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oXG4gICAgICAgICAgICAgIGJsb2NrbHkuQmxvY2tzLmp1bXAuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCcxMDAnLFxuICAgICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb3RzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5qdW1wVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuanVtcF9ieV9jb25zdGFudF9kcm9wZG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZiBwaXhlbHNcbiAgICAvLyB3aXRob3V0IGRyYXdpbmcuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihcbiAgICAgICAgICAgICAgYmxvY2tseS5CbG9ja3MuanVtcC5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bigpLCAnVkFMVUUnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG90cygpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuanVtcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlclxuICAgIC8vIG9mIHBpeGVscyB3aXRob3V0IGRyYXdpbmcuXG4gICAgdmFyIHZhbHVlID0gd2luZG93LnBhcnNlRmxvYXQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpKSB8fCAwO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG4gIGdlbmVyYXRvci5qdW1wX2J5X2NvbnN0YW50X2Ryb3Bkb3duID0gZ2VuZXJhdG9yLmp1bXBfYnlfY29uc3RhbnQ7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmRWYWx1ZUlucHV0KCdWQUxVRScpXG4gICAgICAgICAgLnNldENoZWNrKGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKFxuICAgICAgICAgICAgICBibG9ja2x5LkJsb2Nrcy5kcmF3X3R1cm4uRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kZWdyZWVzKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd190dXJuLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cudHVyblJpZ2h0KCksICd0dXJuUmlnaHQnXSxcbiAgICAgICBbbXNnLnR1cm5MZWZ0KCksICd0dXJuTGVmdCddXTtcblxuICBnZW5lcmF0b3IuZHJhd190dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciB2YWx1ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLFxuICAgICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJzAnO1xuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJygnICsgdmFsdWUgKyAnLCBcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgLy8gdGhpcyBpcyB0aGUgb2xkIHZlcnNpb24gb2YgdGhpcyBibG9jaywgdGhhdCBzaG91bGQgb25seSBzdGlsbCBiZSB1c2VkIGluXG4gIC8vIG9sZCBzaGFyZWQgbGV2ZWxzXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGggPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIHBlbiB3aWR0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoJ1dJRFRIJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRXaWR0aCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndpZHRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKHRoaXMsICdXSURUSCcsXG4gICAgICAgIGdlbmVyYXRvci5PUkRFUl9OT05FKSB8fCAnMSc7XG4gICAgcmV0dXJuICdUdXJ0bGUucGVuV2lkdGgoJyArIHdpZHRoICsgJywgXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8vIGlubGluZWQgdmVyc2lvbiBvZiBkcmF3X3dpZHRoXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfd2lkdGhfaW5saW5lID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0V2lkdGgoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMScsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdXSURUSCcpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2lkdGhUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd193aWR0aF9pbmxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBwZW4gd2lkdGguXG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdXSURUSCcpO1xuICAgIHJldHVybiAnVHVydGxlLnBlbldpZHRoKCcgKyB3aWR0aCArICcsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3BlbiA9IHtcbiAgICAvLyBCbG9jayBmb3IgcGVuIHVwL2Rvd24uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1BFTicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGVuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19wZW4uU1RBVEUgPVxuICAgICAgW1ttc2cucGVuVXAoKSwgJ3BlblVwJ10sXG4gICAgICAgW21zZy5wZW5Eb3duKCksICdwZW5Eb3duJ11dO1xuXG4gIGdlbmVyYXRvci5kcmF3X3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHBlbiB1cC9kb3duLlxuICAgIHJldHVybiAnVHVydGxlLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1BFTicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19jb2xvdXIgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgdGhlIGNvbG91ci5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnQ09MT1VSJylcbiAgICAgICAgICAuc2V0Q2hlY2soYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5DT0xPVVIpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmFscGhhID0ge1xuICAgIC8vIFRPRE86XG4gICAgLy8gLSBBZGQgYWxwaGEgdG8gYSBncm91cFxuICAgIC8vIC0gTWFrZSBzdXJlIGl0IGRvZXNuJ3QgY291bnQgYWdhaW5zdCBjb3JyZWN0IHNvbHV0aW9uc1xuICAgIC8vXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0QWxwaGEoKSk7XG4gICAgICB0aGlzLmFwcGVuZFZhbHVlSW5wdXQoXCJWQUxVRVwiKVxuICAgICAgICAgIC5zZXRDaGVjayhcIk51bWJlclwiKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlLCBudWxsKTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5hbHBoYSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxwaGEgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ1ZBTFVFJywgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX05PTkUpO1xuICAgIHJldHVybiAnVHVydGxlLmdsb2JhbEFscGhhKCcgKyBhbHBoYSArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBnZW5lcmF0b3IuZHJhd19jb2xvdXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnQ09MT1VSJyxcbiAgICAgICAgZ2VuZXJhdG9yLk9SREVSX05PTkUpIHx8ICdcXCcjMDAwMDAwXFwnJztcbiAgICByZXR1cm4gJ1R1cnRsZS5wZW5Db2xvdXIoJyArIGNvbG91ciArICcsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2NvbG91cl9zaW1wbGUgPSB7XG4gICAgLy8gU2ltcGxpZmllZCBkcm9wZG93biBibG9jayBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbG91cnMgPSBbQ29sb3Vycy5SRUQsIENvbG91cnMuQkxBQ0ssIENvbG91cnMuUElOSywgQ29sb3Vycy5PUkFOR0UsXG4gICAgICAgIENvbG91cnMuWUVMTE9XLCBDb2xvdXJzLkdSRUVOLCBDb2xvdXJzLkJMVUUsIENvbG91cnMuQVFVQU1BUklORSwgQ29sb3Vycy5QTFVNXTtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHZhciBjb2xvdXJGaWVsZCA9IG5ldyBCbG9ja2x5LkZpZWxkQ29sb3VyRHJvcGRvd24oY29sb3VycywgNDUsIDM1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRDb2xvdXIoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29sb3VyRmllbGQsICdDT0xPVVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmNvbG91clRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5kcmF3X2NvbG91cl9zaW1wbGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBzZXR0aW5nIHRoZSBjb2xvdXIuXG4gICAgdmFyIGNvbG91ciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnQ09MT1VSJykgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cihcIicgKyBjb2xvdXIgKyAnXCIsIFxcJ2Jsb2NrX2lkXycgK1xuICAgICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xpbmVfc3R5bGVfcGF0dGVybiA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhbiBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRQYXR0ZXJuKCkpXG4gICAgICAgICAgIC5hcHBlbmRUaXRsZSggbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKFxuICAgICAgICAgICAgICBza2luLmxpbmVTdHlsZVBhdHRlcm5PcHRpb25zLCAxNTAsIDIwICksICdWQUxVRScgKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGF0dGVybigpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmRyYXdfbGluZV9zdHlsZV9wYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgaW1hZ2UgZm9yIGEgcGF0dGVybmVkIGxpbmUuXG4gICAgdmFyIHBhdHRlcm4gPSB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgfHwgJ1xcJ0RFRkFVTFRcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlblBhdHRlcm4oXCInICsgcGF0dGVybiArICdcIiwgXFwnYmxvY2tfaWRfJyArXG4gICAgICAgIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnVwX2JpZyA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TVEFURSksICdWSVNJQklMSVRZJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cnRsZVZpc2liaWxpdHlUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IudXBfYmlnID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3Igc2V0dGluZyB0aGUgY29sb3VyLlxuICAgIHZhciBjb2xvdXIgPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUodGhpcywgJ0NPTE9VUicsXG4gICAgICBnZW5lcmF0b3IuT1JERVJfTk9ORSkgfHwgJ1xcJyMwMDAwMDBcXCcnO1xuICAgIHJldHVybiAnVHVydGxlLnBlbkNvbG91cignICsgY29sb3VyICsgJywgXFwnYmxvY2tfaWRfJyArXG4gICAgICB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfdmlzaWJpbGl0eSA9IHtcbiAgICAvLyBCbG9jayBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2libGl0eS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUsIG51bGwpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNUQVRFKSwgJ1ZJU0lCSUxJVFknKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVydGxlVmlzaWJpbGl0eVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLnR1cnRsZV92aXNpYmlsaXR5LlNUQVRFID1cbiAgICAgIFtbbXNnLmhpZGVUdXJ0bGUoKSwgJ2hpZGVUdXJ0bGUnXSxcbiAgICAgICBbbXNnLnNob3dUdXJ0bGUoKSwgJ3Nob3dUdXJ0bGUnXV07XG5cbiAgZ2VuZXJhdG9yLnR1cnRsZV92aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgY2hhbmdpbmcgdHVydGxlIHZpc2liaWxpdHkuXG4gICAgcmV0dXJuICdUdXJ0bGUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnVklTSUJJTElUWScpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MudHVydGxlX3N0YW1wID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLmRyYXdTdGFtcCgpKTtcbiAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuVkFMVUVTLCA2MCwgNTApO1xuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG5cbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZHJhd1N0YW1wKCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyBibG9jayBpcyBjdXJyZW50bHkgdW51c2VkLiBpZiB3ZSB3YW50IHRvIGFkZCBpdCBiYWNrIGluIHRoZSBmdXR1cmUsIGFkZFxuICAvLyBzdGFtcCBpbWFnZXMgaGVyZVxuICBibG9ja2x5LkJsb2Nrcy50dXJ0bGVfc3RhbXAuVkFMVUVTID0gc2tpbi5zdGFtcFZhbHVlcztcblxuICBnZW5lcmF0b3IudHVydGxlX3N0YW1wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnVHVydGxlLmRyYXdTdGFtcChcIicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgK1xuICAgICAgICAnXCIsIFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBjdXN0b21MZXZlbEJsb2Nrcy5pbnN0YWxsKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogVHVydGxlIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gR2xvYmFscyB1c2VkIGluIHRoaXMgZmlsZTpcbi8vICBCbG9ja2x5XG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IFR1cnRsZSBHcmFwaGljcy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciB0dXJ0bGVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgQ29sb3VycyA9IHJlcXVpcmUoJy4vY29sb3VycycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgQXJ0aXN0QVBJID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGlKYXZhc2NyaXB0ID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0Jyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIGNvZGVXb3Jrc3BhY2VFanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvY29kZVdvcmtzcGFjZS5odG1sLmVqcycpO1xudmFyIHZpc3VhbGl6YXRpb25Db2x1bW5FanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdmlzdWFsaXphdGlvbkNvbHVtbi5odG1sLmVqcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBTbGlkZXIgPSByZXF1aXJlKCcuLi9zbGlkZXInKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgZHJvcGxldENvbmZpZyA9IHJlcXVpcmUoJy4vZHJvcGxldENvbmZpZycpO1xudmFyIEpTSW50ZXJwcmV0ZXIgPSByZXF1aXJlKCcuLi9KU0ludGVycHJldGVyJyk7XG52YXIgSnNJbnRlcnByZXRlckxvZ2dlciA9IHJlcXVpcmUoJy4uL0pzSW50ZXJwcmV0ZXJMb2dnZXInKTtcblxudmFyIENBTlZBU19IRUlHSFQgPSA0MDA7XG52YXIgQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG52YXIgTUFYX1NUSUNLRVJfU0laRSA9IDE1MDtcblxudmFyIEpPSU5UX1JBRElVUyA9IDQ7XG5cbnZhciBTTU9PVEhfQU5JTUFURV9TVEVQX1NJWkUgPSA1O1xudmFyIEZBU1RfU01PT1RIX0FOSU1BVEVfU1RFUF9TSVpFID0gMTU7XG5cbi8qKlxuKiBNaW5pbXVtIGpvaW50IHNlZ21lbnQgbGVuZ3RoXG4qL1xudmFyIEpPSU5UX1NFR01FTlRfTEVOR1RIID0gNTA7XG5cbi8qKlxuICogQW4geCBvZmZzZXQgYWdhaW5zdCB0aGUgc3ByaXRlIGVkZ2Ugd2hlcmUgdGhlIGRlY29yYXRpb24gc2hvdWxkIGJlIGRyYXduLFxuICogYWxvbmcgd2l0aCB3aGV0aGVyIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUgb3IgYWZ0ZXIgdGhlIHR1cnRsZSBzcHJpdGUgaXRzZWxmLlxuICovXG52YXIgRUxTQV9ERUNPUkFUSU9OX0RFVEFJTFMgPSBbXG4gIHsgeDogMTUsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDI2LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiAzNywgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNDYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDYwLCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2NSwgd2hlbjogXCJhZnRlclwiIH0sXG4gIHsgeDogNjYsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDY0LCB3aGVuOiBcImFmdGVyXCIgfSxcbiAgeyB4OiA2Miwgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDU1LCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogNDgsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAzMywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDMxLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogMjIsIHdoZW46IFwiYmVmb3JlXCIgfSxcbiAgeyB4OiAxNywgd2hlbjogXCJiZWZvcmVcIiB9LFxuICB7IHg6IDEyLCB3aGVuOiBcImJlZm9yZVwiIH0sXG4gIHsgeDogIDgsIHdoZW46IFwiYWZ0ZXJcIiB9LFxuICB7IHg6IDEwLCB3aGVuOiBcImFmdGVyXCIgfVxuXTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgQXJ0aXN0IGNsYXNzXG4gKiBAcGFyYW0ge1N0dWRpb0FwcH0gc3R1ZGlvQXBwIFRoZSBzdHVkaW9BcHAgaW5zdGFuY2UgdG8gYnVpbGQgdXBvbi5cbiAqL1xudmFyIEFydGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBuZXcgQXJ0aXN0QVBJKCk7XG4gIGFwaUphdmFzY3JpcHQuaW5qZWN0QXJ0aXN0QVBJKHRoaXMuYXBpKTtcblxuICAvKiogQHR5cGUge0pTSW50ZXJwcmV0ZXJ9ICovXG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG5cbiAgLyoqIEBwcml2YXRlIHtKc0ludGVycHJldGVyTG9nZ2VyfSAqL1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfID0gbmV3IEpzSW50ZXJwcmV0ZXJMb2dnZXIod2luZG93LmNvbnNvbGUpO1xuXG4gIC8vIGltYWdlIGljb25zIGFuZCBpbWFnZSBwYXRocyBmb3IgdGhlICdzZXQgcGF0dGVybiBibG9jaydcbiAgdGhpcy5saW5lU3R5bGVQYXR0ZXJuT3B0aW9ucyA9IFtdO1xuICB0aGlzLnN0YW1wcyA9IFtdO1xuXG4gIC8vIFBJRCBvZiBhbmltYXRpb24gdGFzayBjdXJyZW50bHkgZXhlY3V0aW5nLlxuICB0aGlzLnBpZCA9IDA7XG5cbiAgLy8gU2hvdWxkIHRoZSB0dXJ0bGUgYmUgZHJhd24/XG4gIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gU2V0IGEgdHVydGxlIGhlYWRpbmcuXG4gIHRoaXMuaGVhZGluZyA9IDA7XG5cbiAgLy8gVGhlIGF2YXRhciBpbWFnZVxuICB0aGlzLmF2YXRhckltYWdlID0gbmV3IEltYWdlKCk7XG4gIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIGF2YXRhciBhbmltYXRpb24gZGVjb3JhdGlvbiBpbWFnZVxuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25JbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gIC8vIERyYXdpbmcgd2l0aCBhIHBhdHRlcm5cbiAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5sb2FkZWRQYXRoUGF0dGVybnMgPSBbXTtcbiAgdGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybiA9IGZhbHNlO1xuXG4gIC8vIHRoZXNlIGdldCBzZXQgYnkgaW5pdCBiYXNlZCBvbiBza2luLlxuICB0aGlzLmF2YXRhcldpZHRoID0gMDtcbiAgdGhpcy5hdmF0YXJIZWlnaHQgPSAwO1xuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25XaWR0aCA9IDg1O1xuICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25IZWlnaHQgPSA4NTtcbiAgdGhpcy5zcGVlZFNsaWRlciA9IG51bGw7XG5cbiAgdGhpcy5jdHhBbnN3ZXIgPSBudWxsO1xuICB0aGlzLmN0eEltYWdlcyA9IG51bGw7XG4gIHRoaXMuY3R4UHJlZHJhdyA9IG51bGw7XG4gIHRoaXMuY3R4U2NyYXRjaCA9IG51bGw7XG4gIHRoaXMuY3R4UGF0dGVybiA9IG51bGw7XG4gIHRoaXMuY3R4RmVlZGJhY2sgPSBudWxsO1xuICB0aGlzLmN0eERpc3BsYXkgPSBudWxsO1xuXG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IGZhbHNlO1xuICB0aGlzLmlzUHJlZHJhd2luZ18gPSBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJ0aXN0O1xuXG5cbi8qKlxuICogdG9kb1xuICovXG5BcnRpc3QucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgdHVydGxlLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXJ0aXN0IHJlcXVpcmVzIGEgU3R1ZGlvQXBwXCIpO1xuICB9XG5cbiAgdGhpcy5za2luID0gY29uZmlnLnNraW47XG4gIHRoaXMubGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgLy8gUHJlbG9hZCBzdGFtcCBpbWFnZXNcbiAgdGhpcy5zdGFtcHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNraW4uc3RhbXBWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdXJsID0gdGhpcy5za2luLnN0YW1wVmFsdWVzW2ldWzBdO1xuICAgIHZhciBrZXkgPSB0aGlzLnNraW4uc3RhbXBWYWx1ZXNbaV1bMV07XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5zcmMgPSB1cmw7XG4gICAgdGhpcy5zdGFtcHNba2V5XSA9IGltZztcbiAgfVxuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgLy8gbGV0J3MgdHJ5IGFkZGluZyBhIGJhY2tncm91bmQgaW1hZ2VcbiAgICB0aGlzLmxldmVsLmltYWdlcyA9IFt7fV07XG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0uZmlsZW5hbWUgPSAnYmFja2dyb3VuZC5qcGcnO1xuXG4gICAgdGhpcy5sZXZlbC5pbWFnZXNbMF0ucG9zaXRpb24gPSBbIDAsIDAgXTtcbiAgICB0aGlzLmxldmVsLmltYWdlc1swXS5zY2FsZSA9IDE7XG4gIH1cblxuICBjb25maWcuZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzID0gdHJ1ZTtcbiAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2sgPSAnd2hlbl9ydW4nO1xuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIikge1xuICAgIHRoaXMuYXZhdGFyV2lkdGggPSA3MztcbiAgICB0aGlzLmF2YXRhckhlaWdodCA9IDEwMDtcbiAgfVxuICBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzM7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSAxMDA7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGggPSA4NTtcbiAgICB0aGlzLmRlY29yYXRpb25BbmltYXRpb25IZWlnaHQgPSA4NTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmF2YXRhcldpZHRoID0gNzA7XG4gICAgdGhpcy5hdmF0YXJIZWlnaHQgPSA1MTtcbiAgfVxuXG4gIHZhciBpY29uUGF0aCA9ICdtZWRpYS90dXJ0bGUvJyArIChjb25maWcuaXNMZWdhY3lTaGFyZSAmJiBjb25maWcuaGlkZVNvdXJjZSA/ICdpY29uc193aGl0ZS5wbmcnIDogJ2ljb25zLnBuZycpO1xuICBjb25maWcubG9hZEF1ZGlvID0gXy5iaW5kKHRoaXMubG9hZEF1ZGlvXywgdGhpcyk7XG4gIGNvbmZpZy5hZnRlckluamVjdCA9IF8uYmluZCh0aGlzLmFmdGVySW5qZWN0XywgdGhpcywgY29uZmlnKTtcblxuICB2YXIgcmVuZGVyQ29kZVdvcmtzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29kZVdvcmtzcGFjZUVqcyh7XG4gICAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHRoaXMuc3R1ZGlvQXBwXy5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgICBlZGl0Q29kZTogdGhpcy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdmFyIHJlbmRlclZpc3VhbGl6YXRpb25Db2x1bW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZpc3VhbGl6YXRpb25Db2x1bW5FanMoe1xuICAgICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdmlzdWFsaXphdGlvbjogJycsXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe2Fzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsIGljb25QYXRoOiBpY29uUGF0aH0pXG4gICAgICB9XG4gICAgfSk7XG4gIH0uYmluZCh0aGlzKTtcblxuICBSZWFjdERPTS5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiB0aGlzLnN0dWRpb0FwcF8uaW5pdC5iaW5kKHRoaXMuc3R1ZGlvQXBwXywgY29uZmlnKVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5BcnRpc3QucHJvdG90eXBlLmFmdGVySW5qZWN0XyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2xpZGVyLlxuICB2YXIgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlcicpO1xuICB0aGlzLnNwZWVkU2xpZGVyID0gbmV3IFNsaWRlcigxMCwgMzUsIDEzMCwgc2xpZGVyKTtcblxuICAvLyBDaGFuZ2UgZGVmYXVsdCBzcGVlZCAoZWcgU3BlZWQgdXAgbGV2ZWxzIHRoYXQgaGF2ZSBsb3RzIG9mIHN0ZXBzKS5cbiAgaWYgKGNvbmZpZy5sZXZlbC5zbGlkZXJTcGVlZCkge1xuICAgIHRoaXMuc3BlZWRTbGlkZXIuc2V0VmFsdWUoY29uZmlnLmxldmVsLnNsaWRlclNwZWVkKTtcbiAgfVxuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ1R1cnRsZSxjb2RlJyk7XG4gIH1cblxuICAvLyBDcmVhdGUgaGlkZGVuIGNhbnZhc2VzLlxuICB0aGlzLmN0eEFuc3dlciA9IHRoaXMuY3JlYXRlQ2FudmFzXygnYW5zd2VyJywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4SW1hZ2VzID0gdGhpcy5jcmVhdGVDYW52YXNfKCdpbWFnZXMnLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhQcmVkcmF3ID0gdGhpcy5jcmVhdGVDYW52YXNfKCdwcmVkcmF3JywgNDAwLCA0MDApLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuY3R4U2NyYXRjaCA9IHRoaXMuY3JlYXRlQ2FudmFzXygnc2NyYXRjaCcsIDQwMCwgNDAwKS5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLmN0eFBhdHRlcm4gPSB0aGlzLmNyZWF0ZUNhbnZhc18oJ3BhdHRlcm4nLCA0MDAsIDQwMCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5jdHhGZWVkYmFjayA9IHRoaXMuY3JlYXRlQ2FudmFzXygnZmVlZGJhY2snLCAxNTQsIDE1NCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAvLyBDcmVhdGUgZGlzcGxheSBjYW52YXMuXG4gIHZhciBkaXNwbGF5Q2FudmFzID0gdGhpcy5jcmVhdGVDYW52YXNfKCdkaXNwbGF5JywgNDAwLCA0MDApO1xuXG4gIHZhciB2aXN1YWxpemF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb24nKTtcbiAgdmlzdWFsaXphdGlvbi5hcHBlbmRDaGlsZChkaXNwbGF5Q2FudmFzKTtcbiAgdGhpcy5jdHhEaXNwbGF5ID0gZGlzcGxheUNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIC8vIFRPRE8gKGJyLXBhaXIpOiAtIHB1bGwgdGhpcyBvdXQ/XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJiAodGhpcy5za2luLmlkID09PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT09IFwiZWxzYVwiKSkge1xuICAgIC8vIE92ZXJyaWRlIGNvbG91cl9yYW5kb20gdG8gb25seSBnZW5lcmF0ZSByYW5kb20gY29sb3JzIGZyb20gd2l0aGluIG91ciBmcm96ZW5cbiAgICAvLyBwYWxldHRlXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20gPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIGNvbG91ci5cbiAgICAgIGlmICghQmxvY2tseS5KYXZhU2NyaXB0LmRlZmluaXRpb25zXy5jb2xvdXJfcmFuZG9tKSB7XG4gICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBCbG9ja2x5LkphdmFTY3JpcHQudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKFxuICAgICAgICAgICdjb2xvdXJfcmFuZG9tJywgQmxvY2tseS5HZW5lcmF0b3IuTkFNRV9UWVBFKTtcbiAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LmNvbG91cl9yYW5kb20uZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25OYW1lO1xuICAgICAgICB2YXIgZnVuYyA9IFtdO1xuICAgICAgICBmdW5jLnB1c2goJ2Z1bmN0aW9uICcgKyBmdW5jdGlvbk5hbWUgKyAnKCkgeycpO1xuICAgICAgICBmdW5jLnB1c2goJyAgIHZhciBjb2xvcnMgPSAnICsgSlNPTi5zdHJpbmdpZnkoQmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTKSArICc7Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnICByZXR1cm4gY29sb3JzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpjb2xvcnMubGVuZ3RoKV07Jyk7XG4gICAgICAgIGZ1bmMucHVzaCgnfScpO1xuICAgICAgICBCbG9ja2x5LkphdmFTY3JpcHQuZGVmaW5pdGlvbnNfLmNvbG91cl9yYW5kb20gPSBmdW5jLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgdmFyIGNvZGUgPSBCbG9ja2x5LkphdmFTY3JpcHQuY29sb3VyX3JhbmRvbS5mdW5jdGlvbk5hbWUgKyAnKCknO1xuICAgICAgcmV0dXJuIFtjb2RlLCBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfRlVOQ1RJT05fQ0FMTF07XG4gICAgfTtcbiAgfVxuXG4gIHRoaXMubG9hZERlY29yYXRpb25BbmltYXRpb24oKTtcblxuICAvLyBTZXQgdGhlaXIgaW5pdGlhbCBjb250ZW50cy5cbiAgdGhpcy5sb2FkVHVydGxlKCk7XG4gIHRoaXMuZHJhd0ltYWdlcygpO1xuXG4gIHRoaXMuaXNEcmF3aW5nQW5zd2VyXyA9IHRydWU7XG4gIHRoaXMuZHJhd0Fuc3dlcigpO1xuICB0aGlzLmlzRHJhd2luZ0Fuc3dlcl8gPSBmYWxzZTtcblxuICBpZiAodGhpcy5sZXZlbC5wcmVkcmF3QmxvY2tzKSB7XG4gICAgdGhpcy5pc1ByZWRyYXdpbmdfID0gdHJ1ZTtcbiAgICB0aGlzLmRyYXdCbG9ja3NPbkNhbnZhcyh0aGlzLmxldmVsLnByZWRyYXdCbG9ja3MsIHRoaXMuY3R4UHJlZHJhdyk7XG4gICAgdGhpcy5pc1ByZWRyYXdpbmdfID0gZmFsc2U7XG4gIH1cblxuICAvLyBwcmUtbG9hZCBpbWFnZSBmb3IgbGluZSBwYXR0ZXJuIGJsb2NrLiBDcmVhdGluZyB0aGUgaW1hZ2Ugb2JqZWN0IGFuZCBzZXR0aW5nIHNvdXJjZSBkb2Vzbid0IHNlZW0gdG8gYmVcbiAgLy8gZW5vdWdoIGluIHRoaXMgY2FzZSwgc28gd2UncmUgYWN0dWFsbHkgY3JlYXRpbmcgYW5kIHJldXNpbmcgdGhlIG9iamVjdCB3aXRoaW4gdGhlIGRvY3VtZW50IGJvZHkuXG4gIHZhciBpbWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBpbWFnZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZUNvbnRhaW5lcik7XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnNraW4ubGluZVN0eWxlUGF0dGVybk9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0dGVybiA9IHRoaXMuc2tpbi5saW5lU3R5bGVQYXR0ZXJuT3B0aW9uc1tpXVsxXTtcbiAgICBpZiAodGhpcy5za2luW3BhdHRlcm5dKSB7XG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWcuc3JjID0gdGhpcy5za2luW3BhdHRlcm5dO1xuICAgICAgdGhpcy5sb2FkZWRQYXRoUGF0dGVybnNbcGF0dGVybl0gPSBpbWc7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG59O1xuXG4vKipcbiAqIE9uIHN0YXJ0dXAgZHJhdyB0aGUgZXhwZWN0ZWQgYW5zd2VyIGFuZCBzYXZlIGl0IHRvIHRoZSBhbnN3ZXIgY2FudmFzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICB0aGlzLmRyYXdCbG9ja3NPbkNhbnZhcyh0aGlzLmxldmVsLnNvbHV0aW9uQmxvY2tzLCB0aGlzLmN0eEFuc3dlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kcmF3TG9nT25DYW52YXModGhpcy5sZXZlbC5hbnN3ZXIsIHRoaXMuY3R4QW5zd2VyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBhIHNldCBvZiBjb21tYW5kcyBhbmQgYSBjYW52YXMsIGRyYXdzIHRoZSBjb21tYW5kcyBvbnRvIHRoZSBjYW52YXNcbiAqIGNvbXBvc2l0ZWQgb3ZlciB0aGUgc2NyYXRjaCBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0xvZ09uQ2FudmFzID0gZnVuY3Rpb24obG9nLCBjYW52YXMpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG4gIHdoaWxlIChsb2cubGVuZ3RoKSB7XG4gICAgdmFyIHR1cGxlID0gbG9nLnNoaWZ0KCk7XG4gICAgdGhpcy5zdGVwKHR1cGxlWzBdLCB0dXBsZS5zcGxpY2UoMSksIHtzbW9vdGhBbmltYXRlOiBmYWxzZX0pO1xuICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgfVxuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICBjYW52YXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICBjYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbn07XG5cbi8qKlxuICogRXZhbHVhdGVzIGJsb2NrcyBvciBjb2RlLCBhbmQgZHJhd3Mgb250byBnaXZlbiBjYW52YXMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd0Jsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oYmxvY2tzT3JDb2RlLCBjYW52YXMpIHtcbiAgdmFyIGNvZGU7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciBkb21CbG9ja3MgPSBCbG9ja2x5LlhtbC50ZXh0VG9Eb20oYmxvY2tzT3JDb2RlKTtcbiAgICBCbG9ja2x5LlhtbC5kb21Ub0Jsb2NrU3BhY2UoQmxvY2tseS5tYWluQmxvY2tTcGFjZSwgZG9tQmxvY2tzKTtcbiAgICBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICB9IGVsc2Uge1xuICAgIGNvZGUgPSBibG9ja3NPckNvZGU7XG4gIH1cbiAgdGhpcy5ldmFsQ29kZShjb2RlKTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5jbGVhcigpO1xuICB9XG4gIHRoaXMuZHJhd0N1cnJlbnRCbG9ja3NPbkNhbnZhcyhjYW52YXMpO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgcmVzdWx0cyBvZiBibG9jayBldmFsdWF0aW9uIChzdG9yZWQgb24gYXBpLmxvZykgb250byB0aGUgZ2l2ZW5cbiAqIGNhbnZhcy5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Q3VycmVudEJsb2Nrc09uQ2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gIHRoaXMuZHJhd0xvZ09uQ2FudmFzKHRoaXMuYXBpLmxvZywgY2FudmFzKTtcbn07XG5cbi8qKlxuICogUGxhY2UgYW4gaW1hZ2UgYXQgdGhlIHNwZWNpZmllZCBjb29yZGluYXRlcy5cbiAqIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU0OTU5NTIuIFRoYW5rcywgUGhyb2d6LlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIFJlbGF0aXZlIHBhdGggdG8gaW1hZ2UuXG4gKiBAcGFyYW0geyFBcnJheX0gcG9zaXRpb24gQW4geC15IHBhaXIuXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9uYWwgc2NhbGUgYXQgd2hpY2ggaW1hZ2UgaXMgZHJhd25cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5wbGFjZUltYWdlID0gZnVuY3Rpb24oZmlsZW5hbWUsIHBvc2l0aW9uLCBzY2FsZSkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5vbmxvYWQgPSBfLmJpbmQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgaWYgKHNjYWxlKSB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgaW1nLndpZHRoLFxuICAgICAgICAgIGltZy5oZWlnaHQsIDAsIDAsIGltZy53aWR0aCAqIHNjYWxlLCBpbWcuaGVpZ2h0ICogc2NhbGUpO1xuICAgICAgfSBlbHNlICB7XG4gICAgICAgIHRoaXMuY3R4SW1hZ2VzLmRyYXdJbWFnZShpbWcsIHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGlzcGxheSgpO1xuICB9LCB0aGlzKTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIGltZy5zcmMgPSB0aGlzLnNraW4uYXNzZXRVcmwoZmlsZW5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGltZy5zcmMgPSB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS8nICsgZmlsZW5hbWUpO1xuICB9XG59O1xuXG4vKipcbiAqIERyYXcgdGhlIGltYWdlcyBmb3IgdGhpcyBwYWdlIGFuZCBsZXZlbCBvbnRvIHRoaXMuY3R4SW1hZ2VzLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmRyYXdJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLmxldmVsLmltYWdlcykge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGV2ZWwuaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGltYWdlID0gdGhpcy5sZXZlbC5pbWFnZXNbaV07XG4gICAgdGhpcy5wbGFjZUltYWdlKGltYWdlLmZpbGVuYW1lLCBpbWFnZS5wb3NpdGlvbiwgaW1hZ2Uuc2NhbGUpO1xuICB9XG4gIHRoaXMuY3R4SW1hZ2VzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgdGhpcy5jdHhJbWFnZXMuZHJhd0ltYWdlKHRoaXMuY3R4U2NyYXRjaC5jYW52YXMsIDAsIDApO1xuICB0aGlzLmN0eEltYWdlcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgaW1hZ2Ugb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkVHVydGxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXZhdGFySW1hZ2Uub25sb2FkID0gXy5iaW5kKHRoaXMuZGlzcGxheSwgdGhpcyk7XG5cbiAgdGhpcy5hdmF0YXJJbWFnZS5zcmMgPSB0aGlzLnNraW4uYXZhdGFyO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyA9IDM2O1xuICB9IGVsc2UgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgPSAxODtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzID0gMTgwO1xuICB9XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlSGVpZ2h0ID0gdGhpcy5hdmF0YXJIZWlnaHQ7XG4gIHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGggPSB0aGlzLmF2YXRhcldpZHRoO1xufTtcblxuLyoqXG4gKiBJbml0aWFsIHRoZSB0dXJ0bGUgYW5pbWF0aW9uIGRlb2NyYXRpb24gb24gbG9hZC5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5sb2FkRGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uuc3JjID0gdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb247XG4gICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSGVpZ2h0O1xuICAgIHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uV2lkdGg7XG4gIH1cbn07XG5cbnZhciB0dXJ0bGVGcmFtZSA9IDA7XG5cblxuLyoqXG4gKiBEcmF3IHRoZSB0dXJ0bGUgaW1hZ2UgYmFzZWQgb24gdGhpcy54LCB0aGlzLnksIGFuZCB0aGlzLmhlYWRpbmcuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZHJhd1R1cnRsZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc291cmNlWTtcbiAgLy8gQ29tcHV0ZXMgdGhlIGluZGV4IG9mIHRoZSBpbWFnZSBpbiB0aGUgc3ByaXRlLlxuICB2YXIgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaGVhZGluZyAqIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLyAzNjApO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIC8vIHRoZSByb3RhdGlvbnMgaW4gdGhlIHNwcml0ZSBzaGVldCBnbyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgIGluZGV4ID0gdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAtIGluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBpbmRleCA9IChpbmRleCArIHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MvMikgJSB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzO1xuICB9XG4gIHZhciBzb3VyY2VYID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVXaWR0aCAqIGluZGV4O1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHNvdXJjZVkgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodCAqIHR1cnRsZUZyYW1lO1xuICAgIHR1cnRsZUZyYW1lID0gKHR1cnRsZUZyYW1lICsgMSkgJSB0aGlzLnNraW4udHVydGxlTnVtRnJhbWVzO1xuICB9IGVsc2Uge1xuICAgIHNvdXJjZVkgPSAwO1xuICB9XG4gIHZhciBzb3VyY2VXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBzb3VyY2VIZWlnaHQgPSB0aGlzLmF2YXRhckltYWdlLnNwcml0ZUhlaWdodDtcbiAgdmFyIGRlc3RXaWR0aCA9IHRoaXMuYXZhdGFySW1hZ2Uuc3ByaXRlV2lkdGg7XG4gIHZhciBkZXN0SGVpZ2h0ID0gdGhpcy5hdmF0YXJJbWFnZS5zcHJpdGVIZWlnaHQ7XG4gIHZhciBkZXN0WCA9IHRoaXMueCAtIGRlc3RXaWR0aCAvIDI7XG4gIHZhciBkZXN0WSA9IHRoaXMueSAtIGRlc3RIZWlnaHQgKyA3O1xuXG4gIGlmICh0aGlzLmF2YXRhckltYWdlLndpZHRoID09PSAwIHx8IHRoaXMuYXZhdGFySW1hZ2UuaGVpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHNvdXJjZVggPCAwIHx8XG4gICAgICBzb3VyY2VZIDwgMCB8fFxuICAgICAgc291cmNlWCArIHNvdXJjZVdpZHRoICAtMCA+IHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggfHxcbiAgICAgIHNvdXJjZVkgKyBzb3VyY2VIZWlnaHQgPiB0aGlzLmF2YXRhckltYWdlLmhlaWdodClcbiAge1xuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICAvLyBUT0RPKGJqb3JkYW4pOiBhc2sgQnJlbnQsIHN0YXJ0aW5nIHRvIGZsb29kIGdydW50IG1vY2hhVGVzdCBtZXNzYWdlcyxcbiAgICAgIC8vIGJldHRlciBmaXggaGVyZT9cbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiZHJhd0ltYWdlIGlzIG91dCBvZiBzb3VyY2UgYm91bmRzIVwiKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuYXZhdGFySW1hZ2Uud2lkdGggIT09IDApIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKFxuICAgICAgdGhpcy5hdmF0YXJJbWFnZSxcbiAgICAgIE1hdGgucm91bmQoc291cmNlWCksIE1hdGgucm91bmQoc291cmNlWSksXG4gICAgICBzb3VyY2VXaWR0aCAtIDAsIHNvdXJjZUhlaWdodCxcbiAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgIGRlc3RXaWR0aCAtIDAsIGRlc3RIZWlnaHQpO1xuICB9XG59O1xuXG4vKipcbiAgKiBUaGlzIGlzIGNhbGxlZCB0d2ljZSwgb25jZSB3aXRoIFwiYmVmb3JlXCIgYW5kIG9uY2Ugd2l0aCBcImFmdGVyXCIsIHJlZmVycmluZyB0byBiZWZvcmUgb3IgYWZ0ZXJcbiAgKiB0aGUgc3ByaXRlIGlzIGRyYXduLiAgRm9yIHNvbWUgYW5nbGVzIGl0IHNob3VsZCBiZSBkcmF3biBiZWZvcmUsIGFuZCBmb3Igc29tZSBhZnRlci5cbiAgKi9cblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3RGVjb3JhdGlvbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKHdoZW4pIHtcbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHZhciBmcmFtZUluZGV4ID0gKHR1cnRsZUZyYW1lICsgMTApICUgdGhpcy5za2luLmRlY29yYXRpb25BbmltYXRpb25OdW1GcmFtZXM7XG5cbiAgICB2YXIgYW5nbGVJbmRleCA9IE1hdGguZmxvb3IodGhpcy5oZWFkaW5nICogdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncyAvIDM2MCk7XG5cbiAgICAvLyB0aGUgcm90YXRpb25zIGluIHRoZSBBbm5hICYgRWxzYSBzcHJpdGUgc2hlZXRzIGdvIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24uXG4gICAgYW5nbGVJbmRleCA9IHRoaXMubnVtYmVyQXZhdGFySGVhZGluZ3MgLSBhbmdsZUluZGV4O1xuXG4gICAgLy8gYW5kIHRoZXkgYXJlIDE4MCBkZWdyZWVzIG91dCBvZiBwaGFzZS5cbiAgICBhbmdsZUluZGV4ID0gKGFuZ2xlSW5kZXggKyB0aGlzLm51bWJlckF2YXRhckhlYWRpbmdzLzIpICUgdGhpcy5udW1iZXJBdmF0YXJIZWFkaW5ncztcblxuICAgIGlmIChFTFNBX0RFQ09SQVRJT05fREVUQUlMU1thbmdsZUluZGV4XS53aGVuID09IHdoZW4pIHtcbiAgICAgIHZhciBzb3VyY2VYID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGggKiBmcmFtZUluZGV4O1xuICAgICAgdmFyIHNvdXJjZVkgPSAwO1xuICAgICAgdmFyIHNvdXJjZVdpZHRoID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2Uud2lkdGg7XG4gICAgICB2YXIgc291cmNlSGVpZ2h0ID0gdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UuaGVpZ2h0O1xuICAgICAgdmFyIGRlc3RXaWR0aCA9IHNvdXJjZVdpZHRoO1xuICAgICAgdmFyIGRlc3RIZWlnaHQgPSBzb3VyY2VIZWlnaHQ7XG4gICAgICB2YXIgZGVzdFggPSB0aGlzLnggLSBkZXN0V2lkdGggLyAyIC0gMTUgLSAxNSArIEVMU0FfREVDT1JBVElPTl9ERVRBSUxTW2FuZ2xlSW5kZXhdLng7XG4gICAgICB2YXIgZGVzdFkgPSB0aGlzLnkgLSBkZXN0SGVpZ2h0IC8gMiAtIDEwMDtcblxuICAgICAgaWYgKHRoaXMuZGVjb3JhdGlvbkFuaW1hdGlvbkltYWdlLndpZHRoICE9PSAwKSB7XG4gICAgICAgIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UoXG4gICAgICAgICAgdGhpcy5kZWNvcmF0aW9uQW5pbWF0aW9uSW1hZ2UsXG4gICAgICAgICAgTWF0aC5yb3VuZChzb3VyY2VYKSwgTWF0aC5yb3VuZChzb3VyY2VZKSxcbiAgICAgICAgICBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LFxuICAgICAgICAgIE1hdGgucm91bmQoZGVzdFgpLCBNYXRoLnJvdW5kKGRlc3RZKSxcbiAgICAgICAgICBkZXN0V2lkdGgsIGRlc3RIZWlnaHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFJlc2V0IHRoZSB0dXJ0bGUgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uLCBjbGVhciB0aGUgZGlzcGxheSwgYW5kIGtpbGwgYW55XG4gKiBwZW5kaW5nIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkFydGlzdC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG4gIC8vIFN0YW5kYXJkIHN0YXJ0aW5nIGxvY2F0aW9uIGFuZCBoZWFkaW5nIG9mIHRoZSB0dXJ0bGUuXG4gIHRoaXMueCA9IENBTlZBU19IRUlHSFQgLyAyO1xuICB0aGlzLnkgPSBDQU5WQVNfV0lEVEggLyAyO1xuICB0aGlzLmhlYWRpbmcgPSB0aGlzLmxldmVsLnN0YXJ0RGlyZWN0aW9uICE9PSB1bmRlZmluZWQgP1xuICAgICAgdGhpcy5sZXZlbC5zdGFydERpcmVjdGlvbiA6IDkwO1xuICB0aGlzLnBlbkRvd25WYWx1ZSA9IHRydWU7XG4gIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gRm9yIHNwZWNpYWwgY2FzZXMsIHVzZSBhIGRpZmZlcmVudCBpbml0aWFsIGxvY2F0aW9uLlxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy54ID0gdGhpcy5sZXZlbC5pbml0aWFsWDtcbiAgfVxuICBpZiAodGhpcy5sZXZlbC5pbml0aWFsWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy55ID0gdGhpcy5sZXZlbC5pbml0aWFsWTtcbiAgfVxuICAvLyBDbGVhciB0aGUgZGlzcGxheS5cbiAgdGhpcy5jdHhTY3JhdGNoLmNhbnZhcy53aWR0aCA9IHRoaXMuY3R4U2NyYXRjaC5jYW52YXMud2lkdGg7XG4gIHRoaXMuY3R4UGF0dGVybi5jYW52YXMud2lkdGggPSB0aGlzLmN0eFBhdHRlcm4uY2FudmFzLndpZHRoO1xuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSBpZiAodGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJ3JnYigyNTUsMjU1LDI1NSknO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDI7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xuICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsU3R5bGUgPSAnIzAwMDAwMCc7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVXaWR0aCA9IDU7XG4gIH1cblxuICB0aGlzLmN0eFNjcmF0Y2gubGluZUNhcCA9ICdyb3VuZCc7XG4gIHRoaXMuY3R4U2NyYXRjaC5mb250ID0gJ25vcm1hbCAxOHB0IEFyaWFsJztcbiAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgLy8gQ2xlYXIgdGhlIGZlZWRiYWNrLlxuICB0aGlzLmN0eEZlZWRiYWNrLmNsZWFyUmVjdChcbiAgICAgIDAsIDAsIHRoaXMuY3R4RmVlZGJhY2suY2FudmFzLndpZHRoLCB0aGlzLmN0eEZlZWRiYWNrLmNhbnZhcy5oZWlnaHQpO1xuXG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJhbm5hTGluZVwiKTtcbiAgfSBlbHNlIGlmICh0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLnNldFBhdHRlcm4oXCJlbHNhTGluZVwiKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBSZXNldCB0byBlbXB0eSBwYXR0ZXJuXG4gICAgdGhpcy5zZXRQYXR0ZXJuKG51bGwpO1xuICB9XG5cbiAgLy8gS2lsbCBhbnkgdGFzay5cbiAgaWYgKHRoaXMucGlkKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnBpZCk7XG4gIH1cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmRldGFjaCgpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG5cbiAgLy8gU3RvcCB0aGUgbG9vcGluZyBzb3VuZC5cbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgdGhpcy5yZXNldFN0ZXBJbmZvXygpO1xufTtcblxuXG4vKipcbiAqIENvcHkgdGhlIHNjcmF0Y2ggY2FudmFzIHRvIHRoZSBkaXNwbGF5IGNhbnZhcy4gQWRkIGEgdHVydGxlIG1hcmtlci5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZGIG9uIGxpbnV4IHJldGFpbnMgZHJhd2luZyBvZiBwcmV2aW91cyBsb2NhdGlvbiBvZiBhcnRpc3QgdW5sZXNzIHdlIGNsZWFyXG4gIC8vIHRoZSBjYW52YXMgZmlyc3QuXG4gIHZhciBzdHlsZSA9IHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGU7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICB0aGlzLmN0eERpc3BsYXkuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4RGlzcGxheS5jYW52YXMud2lkdGgsXG4gICAgdGhpcy5jdHhEaXNwbGF5LmNhbnZhcy53aWR0aCk7XG4gIHRoaXMuY3R4RGlzcGxheS5maWxsU3R5bGUgPSBzdHlsZTtcblxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknO1xuICAvLyBEcmF3IHRoZSBpbWFnZXMgbGF5ZXIuXG4gIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICB0aGlzLmN0eERpc3BsYXkuZHJhd0ltYWdlKHRoaXMuY3R4SW1hZ2VzLmNhbnZhcywgMCwgMCk7XG5cbiAgLy8gRHJhdyB0aGUgYW5zd2VyIGxheWVyLlxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4RGlzcGxheS5nbG9iYWxBbHBoYSA9IDAuNDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQWxwaGEgPSAwLjE1O1xuICB9XG4gIHRoaXMuY3R4RGlzcGxheS5kcmF3SW1hZ2UodGhpcy5jdHhBbnN3ZXIuY2FudmFzLCAwLCAwKTtcbiAgdGhpcy5jdHhEaXNwbGF5Lmdsb2JhbEFscGhhID0gMTtcblxuICAvLyBEcmF3IHRoZSBwcmVkcmF3IGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFByZWRyYXcuY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSBwYXR0ZXJuIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFBhdHRlcm4uY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB1c2VyIGxheWVyLlxuICB0aGlzLmN0eERpc3BsYXkuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgdGhpcy5jdHhEaXNwbGF5LmRyYXdJbWFnZSh0aGlzLmN0eFNjcmF0Y2guY2FudmFzLCAwLCAwKTtcblxuICAvLyBEcmF3IHRoZSB0dXJ0bGUuXG4gIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICB0aGlzLmRyYXdEZWNvcmF0aW9uQW5pbWF0aW9uKFwiYmVmb3JlXCIpO1xuICAgIHRoaXMuZHJhd1R1cnRsZSgpO1xuICAgIHRoaXMuZHJhd0RlY29yYXRpb25BbmltYXRpb24oXCJhZnRlclwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5BcnRpc3QucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBUdXJ0bGU6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IHVwIHRoZSBKU0ludGVycHJldGVyIGFuZCBjb25zb2xlTG9nZ2VyIGZvciBlZGl0Q29kZSBsZXZlbHNcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pbml0SW50ZXJwcmV0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgc2hvdWxkUnVuQXRNYXhTcGVlZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfSk7XG4gIHRoaXMuSlNJbnRlcnByZXRlci5vbkV4ZWN1dGlvbkVycm9yLnJlZ2lzdGVyKHRoaXMuaGFuZGxlRXhlY3V0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gIHRoaXMuY29uc29sZUxvZ2dlcl8uYXR0YWNoVG8odGhpcy5KU0ludGVycHJldGVyKTtcbiAgdGhpcy5KU0ludGVycHJldGVyLnBhcnNlKHtcbiAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgIGJsb2NrczogZHJvcGxldENvbmZpZy5ibG9ja3MsXG4gICAgYmxvY2tGaWx0ZXI6IHRoaXMubGV2ZWwuZXhlY3V0ZVBhbGV0dGVBcGlzT25seSAmJiB0aGlzLmxldmVsLmNvZGVGdW5jdGlvbnNcbiAgfSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSBhbiBleGVjdXRpb24gZXJyb3IgZnJvbSB0aGUgaW50ZXJwcmV0ZXJcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5sb2coZXJyKTtcblxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogbGluZU51bWJlciB9O1xuXG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuU1lOVEFYX0VSUk9SX0ZBSUw7XG4gIH1cblxuICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hcGkubG9nID0gW107XG5cbiAgLy8gUmVzZXQgdGhlIGdyYXBoaWMuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuaW5pdEludGVycHJldGVyKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIC8vIGFwaS5sb2cgbm93IGNvbnRhaW5zIGEgdHJhbnNjcmlwdCBvZiBhbGwgdGhlIHVzZXIncyBhY3Rpb25zLlxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuICAvLyBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuXG4gIHRoaXMucGlkID0gd2luZG93LnNldFRpbWVvdXQoXy5iaW5kKHRoaXMuYW5pbWF0ZSwgdGhpcyksIDEwMCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgY2FzZTogaWYgd2UgaGF2ZSBhIHR1cm4sIGZvbGxvd2VkIGJ5IGEgbW92ZSBmb3J3YXJkLCB0aGVuIHdlIGNhbiBqdXN0XG4gKiBkbyB0aGUgdHVybiBpbnN0YW50bHkgYW5kIHRoZW4gYmVnaW4gdGhlIG1vdmUgZm9yd2FyZCBpbiB0aGUgc2FtZSBmcmFtZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5jaGVja2ZvclR1cm5BbmRNb3ZlXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5leHRJc0ZvcndhcmQgPSBmYWxzZTtcblxuICB2YXIgY3VycmVudFR1cGxlID0gdGhpcy5hcGkubG9nWzBdO1xuICB2YXIgY3VycmVudENvbW1hbmQgPSBjdXJyZW50VHVwbGVbMF07XG4gIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFR1cGxlLnNsaWNlKDEpO1xuXG4gIC8vIENoZWNrIGZpcnN0IGZvciBhIHNtYWxsIHR1cm4gbW92ZW1lbnQuXG4gIGlmIChjdXJyZW50Q29tbWFuZCA9PT0gJ1JUJykge1xuICAgIHZhciBjdXJyZW50QW5nbGUgPSBjdXJyZW50VmFsdWVzWzBdO1xuICAgIGlmIChNYXRoLmFicyhjdXJyZW50QW5nbGUpIDw9IDEwKSB7XG4gICAgICAvLyBDaGVjayB0aGF0IG5leHQgY29tbWFuZCBpcyBhIG1vdmUgZm9yd2FyZC5cbiAgICAgIGlmICh0aGlzLmFwaS5sb2cubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgbmV4dFR1cGxlID0gdGhpcy5hcGkubG9nWzFdO1xuICAgICAgICB2YXIgbmV4dENvbW1hbmQgPSBuZXh0VHVwbGVbMF07XG4gICAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gJ0ZEJykge1xuICAgICAgICAgIG5leHRJc0ZvcndhcmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHRJc0ZvcndhcmQ7XG59O1xuXG5cbi8qKlxuICogQXR0ZW1wdCB0byBleGVjdXRlIG9uZSBjb21tYW5kIGZyb20gdGhlIGxvZyBvZiBBUEkgY29tbWFuZHMuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuZXhlY3V0ZVR1cGxlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXBpLmxvZy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZXhlY3V0ZVNlY29uZFR1cGxlO1xuXG4gIGRvIHtcbiAgICAvLyBVbmxlc3Mgc29tZXRoaW5nIHNwZWNpYWwgaGFwcGVucywgd2Ugd2lsbCBqdXN0IGV4ZWN1dGUgYSBzaW5nbGUgdHVwbGUuXG4gICAgZXhlY3V0ZVNlY29uZFR1cGxlID0gZmFsc2U7XG5cbiAgICB2YXIgdHVwbGUgPSB0aGlzLmFwaS5sb2dbMF07XG4gICAgdmFyIGNvbW1hbmQgPSB0dXBsZVswXTtcbiAgICB2YXIgaWQgPSB0dXBsZVt0dXBsZS5sZW5ndGgtMV07XG5cbiAgICB0aGlzLnN0dWRpb0FwcF8uaGlnaGxpZ2h0KFN0cmluZyhpZCkpO1xuXG4gICAgLy8gU2hvdWxkIHdlIGV4ZWN1dGUgYW5vdGhlciB0dXBsZSBpbiB0aGlzIGZyYW1lIG9mIGFuaW1hdGlvbj9cbiAgICBpZiAodGhpcy5za2luLmNvbnNvbGlkYXRlVHVybkFuZE1vdmUgJiYgdGhpcy5jaGVja2ZvclR1cm5BbmRNb3ZlXygpKSB7XG4gICAgICBleGVjdXRlU2Vjb25kVHVwbGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgc21vb3RoIGFuaW1hdGUgZm9yIEFubmEgJiBFbHNhLCBhbmQgb25seSBpZiB0aGVyZSBpcyBub3QgYW5vdGhlciB0dXBsZSB0byBiZSBkb25lLlxuICAgIHZhciB0dXBsZURvbmUgPSB0aGlzLnN0ZXAoY29tbWFuZCwgdHVwbGUuc2xpY2UoMSksIHtzbW9vdGhBbmltYXRlOiB0aGlzLnNraW4uc21vb3RoQW5pbWF0ZSAmJiAhZXhlY3V0ZVNlY29uZFR1cGxlfSk7XG4gICAgdGhpcy5kaXNwbGF5KCk7XG5cbiAgICBpZiAodHVwbGVEb25lKSB7XG4gICAgICB0aGlzLmFwaS5sb2cuc2hpZnQoKTtcbiAgICAgIHRoaXMucmVzZXRTdGVwSW5mb18oKTtcbiAgICB9XG4gIH0gd2hpbGUgKGV4ZWN1dGVTZWNvbmRUdXBsZSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogSXRlcmF0ZSB0aHJvdWdoIHRoZSByZWNvcmRlZCBwYXRoIGFuZCBhbmltYXRlIHRoZSB0dXJ0bGUncyBhY3Rpb25zLlxuICovXG5BcnRpc3QucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBBbGwgdGFza3Mgc2hvdWxkIGJlIGNvbXBsZXRlIG5vdy4gIENsZWFuIHVwIHRoZSBQSUQgbGlzdC5cbiAgdGhpcy5waWQgPSAwO1xuXG4gIC8vIFNjYWxlIHRoZSBzcGVlZCBub24tbGluZWFybHksIHRvIGdpdmUgYmV0dGVyIHByZWNpc2lvbiBhdCB0aGUgZmFzdCBlbmQuXG4gIHZhciBzdGVwU3BlZWQgPSAxMDAwICogTWF0aC5wb3coMSAtIHRoaXMuc3BlZWRTbGlkZXIuZ2V0VmFsdWUoKSwgMikgLyB0aGlzLnNraW4uc3BlZWRNb2RpZmllcjtcblxuICAvLyB3aGVuIHNtb290aEFuaW1hdGUgaXMgdHJ1ZSwgd2UgZGl2aWRlIGxvbmcgc3RlcHMgaW50byBwYXJ0aXRpb25zIG9mIHRoaXNcbiAgLy8gc2l6ZS5cbiAgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPSAoc3RlcFNwZWVkID09PSAwID9cbiAgICBGQVNUX1NNT09USF9BTklNQVRFX1NURVBfU0laRSA6IFNNT09USF9BTklNQVRFX1NURVBfU0laRSk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUgJiZcbiAgICAgIHRoaXMuSlNJbnRlcnByZXRlciAmJlxuICAgICAgdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICAgIFxuICAgIHZhciBwcm9ncmFtRG9uZSA9IGZhbHNlO1xuICAgIHZhciBjb21wbGV0ZWRUdXBsZSA9IGZhbHNlO1xuXG4gICAgZG8ge1xuICAgICAgcHJvZ3JhbURvbmUgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuaXNQcm9ncmFtRG9uZSgpO1xuXG4gICAgICBpZiAoIXByb2dyYW1Eb25lKSB7XG4gICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcblxuICAgICAgICBjb21wbGV0ZWRUdXBsZSA9IHRoaXMuZXhlY3V0ZVR1cGxlXygpO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKCFwcm9ncmFtRG9uZSAmJiAhY29tcGxldGVkVHVwbGUpO1xuXG4gICAgaWYgKCFjb21wbGV0ZWRUdXBsZSkge1xuICAgICAgY29tcGxldGVkVHVwbGUgPSB0aGlzLmV4ZWN1dGVUdXBsZV8oKTtcbiAgICB9XG4gICAgaWYgKHByb2dyYW1Eb25lICYmICFjb21wbGV0ZWRUdXBsZSkge1xuICAgICAgLy8gQWxsIGRvbmU6XG4gICAgICB0aGlzLmZpbmlzaEV4ZWN1dGlvbl8oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKCF0aGlzLmV4ZWN1dGVUdXBsZV8oKSkge1xuICAgICAgdGhpcy5maW5pc2hFeGVjdXRpb25fKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5waWQgPSB3aW5kb3cuc2V0VGltZW91dChfLmJpbmQodGhpcy5hbmltYXRlLCB0aGlzKSwgc3RlcFNwZWVkKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRpc3RhbmNlKSB7XG4gIHZhciB0dXBsZURvbmUgPSB0cnVlO1xuICB2YXIgc3RlcERpc3RhbmNlQ292ZXJlZCA9IHRoaXMuc3RlcERpc3RhbmNlQ292ZXJlZDtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNtb290aEFuaW1hdGUpIHtcbiAgICB2YXIgZnVsbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdmFyIHNtb290aEFuaW1hdGVTdGVwU2l6ZSA9IHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuXG4gICAgaWYgKGZ1bGxEaXN0YW5jZSA8IDApIHtcbiAgICAgIC8vIEdvaW5nIGJhY2t3YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBzbW9vdGhBbmltYXRlU3RlcFNpemUgPD0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSAtc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkIC09IHNtb290aEFuaW1hdGVTdGVwU2l6ZTtcbiAgICAgICAgdHVwbGVEb25lID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR29pbmcgZm93YXJkLlxuICAgICAgaWYgKHN0ZXBEaXN0YW5jZUNvdmVyZWQgKyBzbW9vdGhBbmltYXRlU3RlcFNpemUgPj0gZnVsbERpc3RhbmNlKSB7XG4gICAgICAgIC8vIGNsYW1wIGF0IG1heGltdW1cbiAgICAgICAgZGlzdGFuY2UgPSBmdWxsRGlzdGFuY2UgLSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuICAgICAgICBzdGVwRGlzdGFuY2VDb3ZlcmVkID0gZnVsbERpc3RhbmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzdGFuY2UgPSBzbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgICAgIHN0ZXBEaXN0YW5jZUNvdmVyZWQgKz0gc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgICAgICB0dXBsZURvbmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgPSBzdGVwRGlzdGFuY2VDb3ZlcmVkO1xuXG4gIHJldHVybiB7IHR1cGxlRG9uZTogdHVwbGVEb25lLCBkaXN0YW5jZTogZGlzdGFuY2UgfTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBvbmUgc3RlcC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIExvZ28tc3R5bGUgY29tbWFuZCAoZS5nLiAnRkQnIG9yICdSVCcpLlxuICogQHBhcmFtIHshQXJyYXl9IHZhbHVlcyBMaXN0IG9mIGFyZ3VtZW50cyBmb3IgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhY3Rpb24gSG93IG11Y2ggb2YgdGhpcyBzdGVwJ3MgZGlzdGFuY2UgZG8gd2UgZHJhdz9cbiAqIEBwYXJhbSB7b2JqZWN0fSBzaW5nbGUgb3B0aW9uIGZvciBub3c6IHNtb290aEFuaW1hdGUgKHRydWUvZmFsc2UpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuc3RlcCA9IGZ1bmN0aW9uKGNvbW1hbmQsIHZhbHVlcywgb3B0aW9ucykge1xuICB2YXIgdHVwbGVEb25lID0gdHJ1ZTtcbiAgdmFyIHJlc3VsdDtcbiAgdmFyIGRpc3RhbmNlO1xuICB2YXIgaGVhZGluZztcblxuICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICBjYXNlICdGRCc6ICAvLyBGb3J3YXJkXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIHJlc3VsdCA9IHRoaXMuY2FsY3VsYXRlU21vb3RoQW5pbWF0ZShvcHRpb25zLCBkaXN0YW5jZSk7XG4gICAgICB0dXBsZURvbmUgPSByZXN1bHQudHVwbGVEb25lO1xuICAgICAgdGhpcy5tb3ZlRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0pGJzogIC8vIEp1bXAgZm9yd2FyZFxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuanVtcEZvcndhcmRfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNVic6ICAvLyBNb3ZlIChkaXJlY3Rpb24pXG4gICAgICBkaXN0YW5jZSA9IHZhbHVlc1swXTtcbiAgICAgIGhlYWRpbmcgPSB2YWx1ZXNbMV07XG4gICAgICByZXN1bHQgPSB0aGlzLmNhbGN1bGF0ZVNtb290aEFuaW1hdGUob3B0aW9ucywgZGlzdGFuY2UpO1xuICAgICAgdHVwbGVEb25lID0gcmVzdWx0LnR1cGxlRG9uZTtcbiAgICAgIHRoaXMuc2V0SGVhZGluZ18oaGVhZGluZyk7XG4gICAgICB0aGlzLm1vdmVGb3J3YXJkXyhyZXN1bHQuZGlzdGFuY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSkQnOiAgLy8gSnVtcCAoZGlyZWN0aW9uKVxuICAgICAgZGlzdGFuY2UgPSB2YWx1ZXNbMF07XG4gICAgICBoZWFkaW5nID0gdmFsdWVzWzFdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnNldEhlYWRpbmdfKGhlYWRpbmcpO1xuICAgICAgdGhpcy5qdW1wRm9yd2FyZF8ocmVzdWx0LmRpc3RhbmNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1JUJzogIC8vIFJpZ2h0IFR1cm5cbiAgICAgIGRpc3RhbmNlID0gdmFsdWVzWzBdO1xuICAgICAgcmVzdWx0ID0gdGhpcy5jYWxjdWxhdGVTbW9vdGhBbmltYXRlKG9wdGlvbnMsIGRpc3RhbmNlKTtcbiAgICAgIHR1cGxlRG9uZSA9IHJlc3VsdC50dXBsZURvbmU7XG4gICAgICB0aGlzLnR1cm5CeURlZ3JlZXNfKHJlc3VsdC5kaXN0YW5jZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdEUCc6ICAvLyBEcmF3IFByaW50XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2gucm90YXRlKHV0aWxzLmRlZ3JlZXNUb1JhZGlhbnModGhpcy5oZWFkaW5nIC0gOTApKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5maWxsVGV4dCh2YWx1ZXNbMF0sIDAsIDApO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnJlc3RvcmUoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dBJzogIC8vIEdsb2JhbCBBbHBoYVxuICAgICAgdmFyIGFscGhhID0gdmFsdWVzWzBdO1xuICAgICAgYWxwaGEgPSBNYXRoLm1heCgwLCBhbHBoYSk7XG4gICAgICBhbHBoYSA9IE1hdGgubWluKDEwMCwgYWxwaGEpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmdsb2JhbEFscGhhID0gYWxwaGEgLyAxMDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdERic6ICAvLyBEcmF3IEZvbnRcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC5mb250ID0gdmFsdWVzWzJdICsgJyAnICsgdmFsdWVzWzFdICsgJ3B0ICcgKyB2YWx1ZXNbMF07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQVSc6ICAvLyBQZW4gVXBcbiAgICAgIHRoaXMucGVuRG93blZhbHVlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQRCc6ICAvLyBQZW4gRG93blxuICAgICAgdGhpcy5wZW5Eb3duVmFsdWUgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFcnOiAgLy8gUGVuIFdpZHRoXG4gICAgICB0aGlzLmN0eFNjcmF0Y2gubGluZVdpZHRoID0gdmFsdWVzWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEMnOiAgLy8gUGVuIENvbG91clxuICAgICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZVN0eWxlID0gdmFsdWVzWzBdO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmZpbGxTdHlsZSA9IHZhbHVlc1swXTtcbiAgICAgIGlmICh0aGlzLnNraW4uaWQgIT0gXCJhbm5hXCIgJiYgdGhpcy5za2luLmlkICE9IFwiZWxzYVwiKSB7XG4gICAgICAgIHRoaXMuaXNEcmF3aW5nV2l0aFBhdHRlcm4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BTJzogIC8vIFBlbiBzdHlsZSB3aXRoIGltYWdlXG4gICAgICBpZiAoIXZhbHVlc1swXSB8fCB2YWx1ZXNbMF0gPT0gJ0RFRkFVTFQnKSB7XG4gICAgICAgICAgdGhpcy5zZXRQYXR0ZXJuKG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRQYXR0ZXJuKHZhbHVlc1swXSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdIVCc6ICAvLyBIaWRlIFR1cnRsZVxuICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdTVCc6ICAvLyBTaG93IFR1cnRsZVxuICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YW1wJzpcbiAgICAgIHZhciBpbWcgPSB0aGlzLnN0YW1wc1t2YWx1ZXNbMF1dO1xuXG4gICAgICB2YXIgZGltZW5zaW9ucyA9IHNjYWxlVG9Cb3VuZGluZ0JveChNQVhfU1RJQ0tFUl9TSVpFLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgdmFyIHdpZHRoID0gZGltZW5zaW9ucy53aWR0aDtcbiAgICAgIHZhciBoZWlnaHQgPSBkaW1lbnNpb25zLmhlaWdodDtcblxuICAgICAgLy8gUm90YXRlIHRoZSBpbWFnZSBzdWNoIHRoZSB0aGUgdHVydGxlIGlzIGF0IHRoZSBjZW50ZXIgb2YgdGhlIGJvdHRvbSBvZlxuICAgICAgLy8gdGhlIGltYWdlIGFuZCB0aGUgaW1hZ2UgaXMgcG9pbnRpbmcgKGZyb20gYm90dG9tIHRvIHRvcCkgaW4gdGhlIHNhbWVcbiAgICAgIC8vIGRpcmVjdGlvbiBhcyB0aGUgdHVydGxlLlxuICAgICAgdGhpcy5jdHhTY3JhdGNoLnNhdmUoKTtcbiAgICAgIHRoaXMuY3R4U2NyYXRjaC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnJvdGF0ZSh1dGlscy5kZWdyZWVzVG9SYWRpYW5zKHRoaXMuaGVhZGluZykpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLmRyYXdJbWFnZShpbWcsIC13aWR0aCAvIDIsIC1oZWlnaHQsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgdGhpcy5jdHhTY3JhdGNoLnJlc3RvcmUoKTtcblxuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdHVwbGVEb25lO1xufTtcblxuLyoqXG4gKiBHaXZlbiB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiBhIHJlY3RhbmdsZSB0aGlzIHNjYWxlcyB0aGUgZGltZW5zaW9uc1xuICogcHJvcG9ydGlvbmFsbHkgc3VjaCB0aGF0IG5laXRoZXIgaXMgbGFyZ2VyIHRoYW4gYSBnaXZlbiBtYXhpbXVtIHNpemUuXG4gKlxuICogQHBhcmFtIG1heFNpemUgLSBUaGUgbWF4aW11bSBzaXplIG9mIGVpdGhlciBkaW1lbnNpb25cbiAqIEBwYXJhbSB3aWR0aCAtIFRoZSBjdXJyZW50IHdpZHRoIG9mIGEgcmVjdGFuZ2xlXG4gKiBAcGFyYW0gaGVpZ2h0IC0gVGhlIGN1cnJlbnQgaGVpZ2h0IG9mIGEgcmVjdGFuZ2xlXG4gKiBAcmV0dXJuIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzY2FsZWQgd2lkdGggYW5kIGhlaWdodC5cbiAqL1xuZnVuY3Rpb24gc2NhbGVUb0JvdW5kaW5nQm94KG1heFNpemUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgaWYgKHdpZHRoIDwgbWF4U2l6ZSAmJiBoZWlnaHQgPCBtYXhTaXplKSB7XG4gICAgcmV0dXJuIHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcbiAgfVxuXG4gIHZhciBuZXdXaWR0aDtcbiAgdmFyIG5ld0hlaWdodDtcblxuICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICBuZXdXaWR0aCA9IG1heFNpemU7XG4gICAgbmV3SGVpZ2h0ID0gaGVpZ2h0ICogKG1heFNpemUgLyB3aWR0aCk7XG4gIH0gZWxzZSB7XG4gICAgbmV3SGVpZ2h0ID0gbWF4U2l6ZTtcbiAgICBuZXdXaWR0aCA9IHdpZHRoICogKG1heFNpemUgLyBoZWlnaHQpO1xuICB9XG5cbiAgcmV0dXJuIHt3aWR0aDogbmV3V2lkdGgsIGhlaWdodDogbmV3SGVpZ2h0fTtcbn1cblxuQXJ0aXN0LnByb3RvdHlwZS5zZXRQYXR0ZXJuID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgaWYgKHRoaXMubG9hZGVkUGF0aFBhdHRlcm5zW3BhdHRlcm5dKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSB0aGlzLmxvYWRlZFBhdGhQYXR0ZXJuc1twYXR0ZXJuXTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChwYXR0ZXJuID09PSBudWxsKSB7XG4gICAgdGhpcy5jdXJyZW50UGF0aFBhdHRlcm4gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmlzRHJhd2luZ1dpdGhQYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUuanVtcEZvcndhcmRfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHRoaXMueCArPSBkaXN0YW5jZSAqIE1hdGguc2luKHV0aWxzLmRlZ3JlZXNUb1JhZGlhbnModGhpcy5oZWFkaW5nKSk7XG4gIHRoaXMueSAtPSBkaXN0YW5jZSAqIE1hdGguY29zKHV0aWxzLmRlZ3JlZXNUb1JhZGlhbnModGhpcy5oZWFkaW5nKSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLm1vdmVCeVJlbGF0aXZlUG9zaXRpb25fID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54ICs9IHg7XG4gIHRoaXMueSArPSB5O1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kb3RBdF8gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAvLyBXZWJLaXQgKHVubGlrZSBHZWNrbykgZHJhd3Mgbm90aGluZyBmb3IgYSB6ZXJvLWxlbmd0aCBsaW5lLCBzbyBkcmF3IGEgdmVyeSBzaG9ydCBsaW5lLlxuICB2YXIgZG90TGluZUxlbmd0aCA9IDAuMTtcbiAgdGhpcy5jdHhTY3JhdGNoLmxpbmVUbyh4ICsgZG90TGluZUxlbmd0aCwgeSk7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLmNpcmNsZUF0XyA9IGZ1bmN0aW9uICh4LCB5LCByYWRpdXMpIHtcbiAgdGhpcy5jdHhTY3JhdGNoLmFyYyh4LCB5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZHJhd1RvVHVydGxlXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICB2YXIgaXNEb3QgPSAoZGlzdGFuY2UgPT09IDApO1xuICBpZiAoaXNEb3QpIHtcbiAgICB0aGlzLmRvdEF0Xyh0aGlzLngsIHRoaXMueSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jdHhTY3JhdGNoLmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn07XG5cbkFydGlzdC5wcm90b3R5cGUudHVybkJ5RGVncmVlc18gPSBmdW5jdGlvbiAoZGVncmVlc1JpZ2h0KSB7XG4gIHRoaXMuc2V0SGVhZGluZ18odGhpcy5oZWFkaW5nICsgZGVncmVlc1JpZ2h0KTtcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuc2V0SGVhZGluZ18gPSBmdW5jdGlvbiAoaGVhZGluZykge1xuICBoZWFkaW5nID0gdGhpcy5jb25zdHJhaW5EZWdyZWVzXyhoZWFkaW5nKTtcbiAgdGhpcy5oZWFkaW5nID0gaGVhZGluZztcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuY29uc3RyYWluRGVncmVlc18gPSBmdW5jdGlvbiAoZGVncmVlcykge1xuICBkZWdyZWVzICU9IDM2MDtcbiAgaWYgKGRlZ3JlZXMgPCAwKSB7XG4gICAgZGVncmVlcyArPSAzNjA7XG4gIH1cbiAgcmV0dXJuIGRlZ3JlZXM7XG59O1xuXG5BcnRpc3QucHJvdG90eXBlLm1vdmVGb3J3YXJkXyA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuICBpZiAoIXRoaXMucGVuRG93blZhbHVlKSB7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5pc0RyYXdpbmdXaXRoUGF0dGVybikge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRMaW5lV2l0aFBhdHRlcm5fKGRpc3RhbmNlKTtcblxuICAgIC8vIEZyb3plbiBnZXRzIGJvdGggYSBwYXR0ZXJuIGFuZCBhIGxpbmUgb3ZlciB0aGUgdG9wIG9mIGl0LlxuICAgIGlmICh0aGlzLnNraW4uaWQgIT0gXCJlbHNhXCIgJiYgdGhpcy5za2luLmlkICE9IFwiYW5uYVwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdGhpcy5kcmF3Rm9yd2FyZF8oZGlzdGFuY2UpO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZF8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgaWYgKHRoaXMuc2hvdWxkRHJhd0pvaW50c18oKSkge1xuICAgIHRoaXMuZHJhd0ZvcndhcmRXaXRoSm9pbnRzXyhkaXN0YW5jZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kcmF3Rm9yd2FyZExpbmVfKGRpc3RhbmNlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3cyBhIGxpbmUgb2YgbGVuZ3RoIGBkaXN0YW5jZWAsIGFkZGluZyBqb2ludCBrbm9icyBhbG9uZyB0aGUgd2F5XG4gKiBAcGFyYW0gZGlzdGFuY2VcbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZFdpdGhKb2ludHNfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG4gIHZhciByZW1haW5pbmdEaXN0YW5jZSA9IGRpc3RhbmNlO1xuXG4gIHdoaWxlIChyZW1haW5pbmdEaXN0YW5jZSA+IDApIHtcbiAgICB2YXIgZW5vdWdoRm9yRnVsbFNlZ21lbnQgPSByZW1haW5pbmdEaXN0YW5jZSA+PSBKT0lOVF9TRUdNRU5UX0xFTkdUSDtcbiAgICB2YXIgY3VycmVudFNlZ21lbnRMZW5ndGggPSBlbm91Z2hGb3JGdWxsU2VnbWVudCA/IEpPSU5UX1NFR01FTlRfTEVOR1RIIDogcmVtYWluaW5nRGlzdGFuY2U7XG5cbiAgICByZW1haW5pbmdEaXN0YW5jZSAtPSBjdXJyZW50U2VnbWVudExlbmd0aDtcblxuICAgIGlmIChlbm91Z2hGb3JGdWxsU2VnbWVudCkge1xuICAgICAgdGhpcy5kcmF3Sm9pbnRBdFR1cnRsZV8oKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdGb3J3YXJkTGluZV8oY3VycmVudFNlZ21lbnRMZW5ndGgpO1xuXG4gICAgaWYgKGVub3VnaEZvckZ1bGxTZWdtZW50KSB7XG4gICAgICB0aGlzLmRyYXdKb2ludEF0VHVydGxlXygpO1xuICAgIH1cbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZExpbmVfID0gZnVuY3Rpb24gKGRpc3RhbmNlKSB7XG5cbiAgaWYgKHRoaXMuc2tpbi5pZCA9PSBcImFubmFcIiB8fCB0aGlzLnNraW4uaWQgPT0gXCJlbHNhXCIpIHtcbiAgICB0aGlzLmN0eFNjcmF0Y2guYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLnN0ZXBTdGFydFgsIHRoaXMuc3RlcFN0YXJ0WSk7XG4gICAgdGhpcy5qdW1wRm9yd2FyZF8oZGlzdGFuY2UpO1xuICAgIHRoaXMuZHJhd1RvVHVydGxlXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5jdHhTY3JhdGNoLnN0cm9rZSgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3R4U2NyYXRjaC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2gubW92ZVRvKHRoaXMueCwgdGhpcy55KTtcbiAgICB0aGlzLmp1bXBGb3J3YXJkXyhkaXN0YW5jZSk7XG4gICAgdGhpcy5kcmF3VG9UdXJ0bGVfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlKCk7XG4gIH1cblxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Rm9yd2FyZExpbmVXaXRoUGF0dGVybl8gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcbiAgdmFyIGltZztcbiAgdmFyIHN0YXJ0WDtcbiAgdmFyIHN0YXJ0WTtcblxuICBpZiAodGhpcy5za2luLmlkID09IFwiYW5uYVwiIHx8IHRoaXMuc2tpbi5pZCA9PSBcImVsc2FcIikge1xuICAgIHRoaXMuY3R4UGF0dGVybi5tb3ZlVG8odGhpcy5zdGVwU3RhcnRYLCB0aGlzLnN0ZXBTdGFydFkpO1xuICAgIGltZyA9IHRoaXMuY3VycmVudFBhdGhQYXR0ZXJuO1xuICAgIHN0YXJ0WCA9IHRoaXMuc3RlcFN0YXJ0WDtcbiAgICBzdGFydFkgPSB0aGlzLnN0ZXBTdGFydFk7XG5cbiAgICB2YXIgbGluZURpc3RhbmNlID0gTWF0aC5hYnModGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkKTtcblxuICAgIHRoaXMuY3R4UGF0dGVybi5zYXZlKCk7XG4gICAgdGhpcy5jdHhQYXR0ZXJuLnRyYW5zbGF0ZShzdGFydFgsIHN0YXJ0WSk7XG4gICAgLy8gaW5jcmVtZW50IHRoZSBhbmdsZSBhbmQgcm90YXRlIHRoZSBpbWFnZS5cbiAgICAvLyBOZWVkIHRvIHN1YnRyYWN0IDkwIHRvIGFjY29tb2RhdGUgZGlmZmVyZW5jZSBpbiBjYW52YXMgdnMuIFR1cnRsZSBkaXJlY3Rpb25cbiAgICB0aGlzLmN0eFBhdHRlcm4ucm90YXRlKHV0aWxzLmRlZ3JlZXNUb1JhZGlhbnModGhpcy5oZWFkaW5nIC0gOTApKTtcblxuICAgIHZhciBjbGlwU2l6ZTtcbiAgICBpZiAobGluZURpc3RhbmNlICUgdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemUgPT09IDApIHtcbiAgICAgIGNsaXBTaXplID0gdGhpcy5zbW9vdGhBbmltYXRlU3RlcFNpemU7XG4gICAgfSBlbHNlIGlmIChsaW5lRGlzdGFuY2UgPiB0aGlzLnNtb290aEFuaW1hdGVTdGVwU2l6ZSkge1xuICAgICAgLy8gdGhpcyBoYXBwZW5zIHdoZW4gb3VyIGxpbmUgd2FzIG5vdCBkaXZpc2libGUgYnkgc21vb3RoQW5pbWF0ZVN0ZXBTaXplXG4gICAgICAvLyBhbmQgd2UndmUgaGl0IG91ciBsYXN0IGNodW5rXG4gICAgICBjbGlwU2l6ZSA9IGxpbmVEaXN0YW5jZSAlIHRoaXMuc21vb3RoQW5pbWF0ZVN0ZXBTaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGlwU2l6ZSA9IGxpbmVEaXN0YW5jZTtcbiAgICB9XG4gICAgaWYgKGltZy53aWR0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jdHhQYXR0ZXJuLmRyYXdJbWFnZShpbWcsXG4gICAgICAgIC8vIFN0YXJ0IHBvaW50IGZvciBjbGlwcGluZyBpbWFnZVxuICAgICAgICBNYXRoLnJvdW5kKGxpbmVEaXN0YW5jZSksIDAsXG4gICAgICAgIC8vIGNsaXAgcmVnaW9uIHNpemVcbiAgICAgICAgY2xpcFNpemUsIGltZy5oZWlnaHQsXG4gICAgICAgIC8vIHNvbWUgbXlzdGVyaW91cyBoYW5kLXR3ZWFraW5nIGRvbmUgYnkgQnJlbmRhblxuICAgICAgICBNYXRoLnJvdW5kKCh0aGlzLnN0ZXBEaXN0YW5jZUNvdmVyZWQgLSBjbGlwU2l6ZSAtIDIpKSwgTWF0aC5yb3VuZCgoLSAxOCkpLFxuICAgICAgICBjbGlwU2l6ZSwgaW1nLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5jdHhQYXR0ZXJuLnJlc3RvcmUoKTtcblxuICB9IGVsc2Uge1xuXG4gICAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gICAgaW1nID0gdGhpcy5jdXJyZW50UGF0aFBhdHRlcm47XG4gICAgc3RhcnRYID0gdGhpcy54O1xuICAgIHN0YXJ0WSA9IHRoaXMueTtcblxuICAgIHRoaXMuanVtcEZvcndhcmRfKGRpc3RhbmNlKTtcbiAgICB0aGlzLmN0eFNjcmF0Y2guc2F2ZSgpO1xuICAgIHRoaXMuY3R4U2NyYXRjaC50cmFuc2xhdGUoc3RhcnRYLCBzdGFydFkpO1xuICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGUgYW5kIHJvdGF0ZSB0aGUgaW1hZ2UuXG4gICAgLy8gTmVlZCB0byBzdWJ0cmFjdCA5MCB0byBhY2NvbW9kYXRlIGRpZmZlcmVuY2UgaW4gY2FudmFzIHZzLiBUdXJ0bGUgZGlyZWN0aW9uXG4gICAgdGhpcy5jdHhTY3JhdGNoLnJvdGF0ZSh1dGlscy5kZWdyZWVzVG9SYWRpYW5zKHRoaXMuaGVhZGluZyAtIDkwKSk7XG5cbiAgICBpZiAoaW1nLndpZHRoICE9PSAwKSB7XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZHJhd0ltYWdlKGltZyxcbiAgICAgICAgLy8gU3RhcnQgcG9pbnQgZm9yIGNsaXBwaW5nIGltYWdlXG4gICAgICAgIDAsIDAsXG4gICAgICAgIC8vIGNsaXAgcmVnaW9uIHNpemVcbiAgICAgICAgZGlzdGFuY2UraW1nLmhlaWdodCAvIDIsIGltZy5oZWlnaHQsXG4gICAgICAgIC8vIGRyYXcgbG9jYXRpb24gcmVsYXRpdmUgdG8gdGhlIGN0eC50cmFuc2xhdGUgcG9pbnQgcHJlLXJvdGF0aW9uXG4gICAgICAgIC1pbWcuaGVpZ2h0IC8gNCwgLWltZy5oZWlnaHQgLyAyLFxuICAgICAgICBkaXN0YW5jZStpbWcuaGVpZ2h0IC8gMiwgaW1nLmhlaWdodCk7XG4gICAgfVxuXG4gICAgdGhpcy5jdHhTY3JhdGNoLnJlc3RvcmUoKTtcbiAgfVxufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5zaG91bGREcmF3Sm9pbnRzXyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubGV2ZWwuaXNLMSAmJiAhdGhpcy5pc1ByZWRyYXdpbmdfO1xufTtcblxuQXJ0aXN0LnByb3RvdHlwZS5kcmF3Sm9pbnRBdFR1cnRsZV8gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY3R4U2NyYXRjaC5iZWdpblBhdGgoKTtcbiAgdGhpcy5jdHhTY3JhdGNoLm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG4gIHRoaXMuY2lyY2xlQXRfKHRoaXMueCwgdGhpcy55LCBKT0lOVF9SQURJVVMpO1xuICB0aGlzLmN0eFNjcmF0Y2guc3Ryb2tlKCk7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlIHdoZXRoZXIgdGhlIHVzZXIncyBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwaXhlbEVycm9ycyBOdW1iZXIgb2YgcGl4ZWxzIHRoYXQgYXJlIHdyb25nLlxuICogQHBhcmFtIHtudW1iZXJ9IHBlcm1pdHRlZEVycm9ycyBOdW1iZXIgb2YgcGl4ZWxzIGFsbG93ZWQgdG8gYmUgd3JvbmcuXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBsZXZlbCBpcyBzb2x2ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuQXJ0aXN0LnByb3RvdHlwZS5pc0NvcnJlY3RfID0gZnVuY3Rpb24gKHBpeGVsRXJyb3JzLCBwZXJtaXR0ZWRFcnJvcnMpIHtcbiAgcmV0dXJuIHBpeGVsRXJyb3JzIDw9IHBlcm1pdHRlZEVycm9ycztcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5BcnRpc3QucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZlZWRiYWNrSW1hZ2VDYW52YXM7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgLy8gRm9yIGZyb3plbiBza2lucywgc2hvdyBiYWNrZ3JvdW5kIGFuZCBjaGFyYWN0ZXJzIGFsb25nIHdpdGggZHJhd2luZ1xuICAgIGZlZWRiYWNrSW1hZ2VDYW52YXMgPSB0aGlzLmN0eERpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4U2NyYXRjaDtcbiAgfVxuXG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAndHVydGxlJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IHx8IGxldmVsLmltcHJlc3NpdmUpLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IHR1cnRsZU1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogdHVydGxlTXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkFydGlzdC5wcm90b3R5cGUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuc3R1ZGlvQXBwXy5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vLyBUaGlzIHJlbW92ZXMgbGVuZ3RocyBmcm9tIHRoZSB0ZXh0IHZlcnNpb24gb2YgdGhlIFhNTCBvZiBwcm9ncmFtcy5cbi8vIEl0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSB1c2VyIHByb2dyYW0gYW5kIG1vZGVsIHNvbHV0aW9uIGFyZVxuLy8gaWRlbnRpY2FsIGV4Y2VwdCBmb3IgbGVuZ3Rocy5cbnZhciByZW1vdmVLMUxlbmd0aHMgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVtb3ZlSzFMZW5ndGhzLnJlZ2V4LCAnXCI+Jyk7XG59O1xuXG5yZW1vdmVLMUxlbmd0aHMucmVnZXggPSAvX2xlbmd0aFwiPjx0aXRsZSBuYW1lPVwibGVuZ3RoXCI+Lio/PFxcL3RpdGxlPi87XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkFydGlzdC5wcm90b3R5cGUuY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gQ29tcGFyZSB0aGUgQWxwaGEgKG9wYWNpdHkpIGJ5dGUgb2YgZWFjaCBwaXhlbCBpbiB0aGUgdXNlcidzIGltYWdlIGFuZFxuICAvLyB0aGUgc2FtcGxlIGFuc3dlciBpbWFnZS5cbiAgdmFyIHVzZXJJbWFnZSA9XG4gICAgICB0aGlzLmN0eFNjcmF0Y2guZ2V0SW1hZ2VEYXRhKDAsIDAsIENBTlZBU19XSURUSCwgQ0FOVkFTX0hFSUdIVCk7XG4gIHZhciBhbnN3ZXJJbWFnZSA9XG4gICAgICB0aGlzLmN0eEFuc3dlci5nZXRJbWFnZURhdGEoMCwgMCwgQ0FOVkFTX1dJRFRILCBDQU5WQVNfSEVJR0hUKTtcbiAgdmFyIGxlbiA9IE1hdGgubWluKHVzZXJJbWFnZS5kYXRhLmxlbmd0aCwgYW5zd2VySW1hZ2UuZGF0YS5sZW5ndGgpO1xuICB2YXIgZGVsdGEgPSAwO1xuICAvLyBQaXhlbHMgYXJlIGluIFJHQkEgZm9ybWF0LiAgT25seSBjaGVjayB0aGUgQWxwaGEgYnl0ZXMuXG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICAvLyBDb3B5aW5nIGFuZCBjb21wb3NpdGluZyBpbWFnZXMgYWNyb3NzIGNhbnZhc2VzIHNlZW1zIHRvIGRpc3RvcnQgdGhlXG4gICAgLy8gYWxwaGEuIFVzZSBhIGxhcmdlIGVycm9yIHZhbHVlICgyNTApIHRvIGNvbXBlbnNhdGUuXG4gICAgaWYgKE1hdGguYWJzKHVzZXJJbWFnZS5kYXRhW2ldIC0gYW5zd2VySW1hZ2UuZGF0YVtpXSkgPiAyNTApIHtcbiAgICAgIGRlbHRhKys7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICAvLyBPcHRpb25hbGx5IGFsbG93IHNvbWUgbnVtYmVyIG9mIHBpeGVscyB0byBiZSBvZmYsIGRlZmF1bHQgdG9cbiAgLy8gcGl4ZWwtcGVyZmVjdCBzdHJpY3RuZXNzXG4gIHZhciBwZXJtaXR0ZWRFcnJvcnMgPSBsZXZlbC5wZXJtaXR0ZWRFcnJvcnMgfHwgMDtcblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXkgbGV2ZWwsIG9yIHRoZSBsZXZlbCBoYXNcbiAgLy8gYmVlbiBjb21wbGV0ZWRcbiAgdmFyIGxldmVsQ29tcGxldGUgPSAobGV2ZWwuZnJlZVBsYXkgfHwgdGhpcy5pc0NvcnJlY3RfKGRlbHRhLCBwZXJtaXR0ZWRFcnJvcnMpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvLyBJbiBsZXZlbCBLMSwgY2hlY2sgaWYgb25seSBsZW5ndGhzIGRpZmZlci5cbiAgaWYgKGxldmVsLmlzSzEgJiYgIWxldmVsQ29tcGxldGUgJiYgIXRoaXMuc3R1ZGlvQXBwXy5lZGl0Q29kZSAmJlxuICAgICAgbGV2ZWwuc29sdXRpb25CbG9ja3MgJiZcbiAgICAgIHJlbW92ZUsxTGVuZ3Rocyhwcm9ncmFtKSA9PT0gcmVtb3ZlSzFMZW5ndGhzKGxldmVsLnNvbHV0aW9uQmxvY2tzKSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0VSUk9SO1xuICAgIHRoaXMubWVzc2FnZSA9IHR1cnRsZU1zZy5sZW5ndGhGZWVkYmFjaygpO1xuICB9XG5cbiAgLy8gRm9yIGxldmVscyB3aGVyZSB1c2luZyB0b28gbWFueSBibG9ja3Mgd291bGQgYWxsb3cgc3R1ZGVudHNcbiAgLy8gdG8gbWlzcyB0aGUgcG9pbnQsIGNvbnZlcnQgdGhhdCBmZWVkYmFjayB0byBhIGZhaWx1cmUuXG4gIGlmIChsZXZlbC5mYWlsRm9yVG9vTWFueUJsb2NrcyAmJlxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA9PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMO1xuXG4gIH0gZWxzZSBpZiAoKHRoaXMudGVzdFJlc3VsdHMgPT1cbiAgICAgIHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkgfHxcbiAgICAgICh0aGlzLnRlc3RSZXN1bHRzID09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5BTExfUEFTUykpIHtcbiAgICAvLyBDaGVjayB0aGF0IHRoZXkgZGlkbid0IHVzZSBhIGNyYXp5IGxhcmdlIHJlcGVhdCB2YWx1ZSB3aGVuIGRyYXdpbmcgYVxuICAgIC8vIGNpcmNsZS4gIFRoaXMgY29tcGxhaW5zIGlmIHRoZSBsaW1pdCBkb2Vzbid0IHN0YXJ0IHdpdGggMy5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBsZXZlbCBkb2VzIG5vdCB1c2UgY29sb3VyLCBzbyBubyBuZWVkIHRvIGNoZWNrIGZvciB0aGF0LlxuICAgIGlmIChsZXZlbC5mYWlsRm9yQ2lyY2xlUmVwZWF0VmFsdWUgJiYgdGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIHZhciBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgICAgaWYgKGNvZGUuaW5kZXhPZignY291bnQgPCAzJykgPT0gLTEpIHtcbiAgICAgICAgdGhpcy50ZXN0UmVzdWx0cyA9XG4gICAgICAgICAgICB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0FDQ0VQVEFCTEVfRkFJTDtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gY29tbW9uTXNnLnRvb011Y2hXb3JrKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICd0dXJ0bGUnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5waXZvdGFsdHJhY2tlci5jb20vc3Rvcnkvc2hvdy84NDE3MTU2MFxuICAvLyBOZXZlciBzZW5kIHVwIGZyb3plbiBpbWFnZXMgZm9yIG5vdy5cbiAgdmFyIGlzRnJvemVuID0gKHRoaXMuc2tpbi5pZCA9PT0gJ2FubmEnIHx8IHRoaXMuc2tpbi5pZCA9PT0gJ2Vsc2EnKTtcblxuICAvLyBHZXQgdGhlIGNhbnZhcyBkYXRhIGZvciBmZWVkYmFjay5cbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMICYmXG4gICAgIWlzRnJvemVuICYmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5pbXByZXNzaXZlKSkge1xuICAgIHJlcG9ydERhdGEuaW1hZ2UgPSB0aGlzLmdldEZlZWRiYWNrSW1hZ2VfKCk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG5cbkFydGlzdC5wcm90b3R5cGUuZ2V0RmVlZGJhY2tJbWFnZV8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZlZWRiYWNrSW1hZ2VDYW52YXM7XG4gIGlmICh0aGlzLnNraW4uaWQgPT0gXCJhbm5hXCIgfHwgdGhpcy5za2luLmlkID09IFwiZWxzYVwiKSB7XG4gICAgZmVlZGJhY2tJbWFnZUNhbnZhcyA9IHRoaXMuY3R4RGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICBmZWVkYmFja0ltYWdlQ2FudmFzID0gdGhpcy5jdHhTY3JhdGNoO1xuICB9XG5cbiAgLy8gQ29weSB0aGUgdXNlciBsYXllclxuICB0aGlzLmN0eEZlZWRiYWNrLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5JztcbiAgdGhpcy5jdHhGZWVkYmFjay5kcmF3SW1hZ2UoZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMsIDAsIDAsIDE1NCwgMTU0KTtcbiAgdmFyIGZlZWRiYWNrQ2FudmFzID0gdGhpcy5jdHhGZWVkYmFjay5jYW52YXM7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICBmZWVkYmFja0NhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIikuc3BsaXQoJywnKVsxXSk7XG59O1xuXG4vLyBIZWxwZXIgZm9yIGNyZWF0aW5nIGNhbnZhcyBlbGVtZW50cy5cbkFydGlzdC5wcm90b3R5cGUuY3JlYXRlQ2FudmFzXyA9IGZ1bmN0aW9uIChpZCwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgZWwuaWQgPSBpZDtcbiAgZWwud2lkdGggPSB3aWR0aDtcbiAgZWwuaGVpZ2h0ID0gaGVpZ2h0O1xuICByZXR1cm4gZWw7XG59O1xuXG4vKipcbiogV2hlbiBzbW9vdGggYW5pbWF0ZSBpcyB0cnVlLCBzdGVwcyBjYW4gYmUgYnJva2VuIHVwIGludG8gbXVsdGlwbGUgYW5pbWF0aW9ucy5cbiogQXQgdGhlIGVuZCBvZiBlYWNoIHN0ZXAsIHdlIHdhbnQgdG8gcmVzZXQgYW55IGluY3JlbWVudGFsIGluZm9ybWF0aW9uLCB3aGljaFxuKiBpcyB3aGF0IHRoaXMgZG9lcy5cbiovXG5BcnRpc3QucHJvdG90eXBlLnJlc2V0U3RlcEluZm9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0ZXBTdGFydFggPSB0aGlzLng7XG4gIHRoaXMuc3RlcFN0YXJ0WSA9IHRoaXMueTtcbiAgdGhpcy5zdGVwRGlzdGFuY2VDb3ZlcmVkID0gMDtcbn07XG4iLCJ2YXIgbGV2ZWxCYXNlID0gcmVxdWlyZSgnLi4vbGV2ZWxfYmFzZScpO1xudmFyIENvbG91cnMgPSByZXF1aXJlKCcuL2NvbG91cnMnKTtcbnZhciBhbnN3ZXIgPSByZXF1aXJlKCcuL2Fuc3dlcnMnKS5hbnN3ZXI7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8vIEFuIGVhcmx5IGhhY2sgaW50cm9kdWNlZCBzb21lIGxldmVsYnVpbGRlciBsZXZlbHMgYXMgcGFnZSA1LCBsZXZlbCA3LiBMb25nXG4vLyB0ZXJtIHdlIGNhbiBwcm9iYWJseSBkbyBzb21ldGhpbmcgbXVjaCBjbGVhbmVyLCBidXQgZm9yIG5vdyBJJ20gY2FsbGluZ1xuLy8gb3V0IHRoYXQgdGhpcyBsZXZlbCBpcyBzcGVjaWFsIChvbiBwYWdlIDUpLlxudmFyIExFVkVMQlVJTERFUl9MRVZFTCA9IDc7XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgdG9vbGJveC5cbnZhciB0b29sYm94ID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vdG9vbGJveC54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCBzdGFydEJsb2Nrcy5cbnZhciBzdGFydEJsb2NrcyA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3N0YXJ0QmxvY2tzLnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG52YXIgcmVxID0gcmVxdWlyZSgnLi9yZXF1aXJlZEJsb2NrcycpO1xudmFyIG1ha2VNYXRoTnVtYmVyID0gcmVxLm1ha2VNYXRoTnVtYmVyO1xudmFyIHNpbXBsZUJsb2NrID0gcmVxLnNpbXBsZUJsb2NrO1xudmFyIHJlcGVhdCA9IHJlcS5yZXBlYXQ7XG52YXIgZHJhd0FTcXVhcmUgPSByZXEuZHJhd0FTcXVhcmU7XG52YXIgZHJhd0FTbm93bWFuID0gcmVxLmRyYXdBU25vd21hbjtcbnZhciBNT1ZFX0ZPUldBUkRfSU5MSU5FID0gcmVxLk1PVkVfRk9SV0FSRF9JTkxJTkU7XG52YXIgTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORSA9IHJlcS5NT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FO1xudmFyIG1vdmVGb3J3YXJkSW5saW5lID0gcmVxLm1vdmVGb3J3YXJkSW5saW5lO1xudmFyIE1PVkVfQkFDS1dBUkRfSU5MSU5FID0gcmVxLk1PVkVfQkFDS1dBUkRfSU5MSU5FO1xudmFyIHR1cm5MZWZ0UmVzdHJpY3RlZCA9IHJlcS50dXJuTGVmdFJlc3RyaWN0ZWQ7XG52YXIgdHVyblJpZ2h0UmVzdHJpY3RlZCA9IHJlcS50dXJuUmlnaHRSZXN0cmljdGVkO1xudmFyIHR1cm5SaWdodEJ5Q29uc3RhbnQgPSByZXEudHVyblJpZ2h0QnlDb25zdGFudDtcbnZhciB0dXJuUmlnaHQgPSByZXEudHVyblJpZ2h0O1xudmFyIHR1cm5MZWZ0ID0gcmVxLnR1cm5MZWZ0O1xudmFyIG1vdmUgPSByZXEubW92ZTtcbnZhciBkcmF3VHVyblJlc3RyaWN0ZWQgPSByZXEuZHJhd1R1cm5SZXN0cmljdGVkO1xudmFyIGRyYXdUdXJuID0gcmVxLmRyYXdUdXJuO1xudmFyIFNFVF9DT0xPVVJfUElDS0VSID0gcmVxLlNFVF9DT0xPVVJfUElDS0VSO1xudmFyIFNFVF9DT0xPVVJfUkFORE9NID0gcmVxLlNFVF9DT0xPVVJfUkFORE9NO1xudmFyIGRlZmluZVdpdGhBcmcgPSByZXEuZGVmaW5lV2l0aEFyZztcblxudmFyIGJsb2NrcyA9IHtcbiAgU0lNUExFX01PVkVfVVA6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3VwJyksXG4gIFNJTVBMRV9NT1ZFX0RPV046IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2Rvd24nKSxcbiAgU0lNUExFX01PVkVfTEVGVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfbGVmdCcpLFxuICBTSU1QTEVfTU9WRV9SSUdIVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX21vdmVfcmlnaHQnKSxcbiAgU0lNUExFX0pVTVBfVVA6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX3VwJyksXG4gIFNJTVBMRV9KVU1QX0RPV046IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9qdW1wX2Rvd24nKSxcbiAgU0lNUExFX0pVTVBfTEVGVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfbGVmdCcpLFxuICBTSU1QTEVfSlVNUF9SSUdIVDogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2ltcGxlX2p1bXBfcmlnaHQnKSxcbiAgU0lNUExFX01PVkVfVVBfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV91cF9sZW5ndGgnKSxcbiAgU0lNUExFX01PVkVfRE9XTl9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX2Rvd25fbGVuZ3RoJyksXG4gIFNJTVBMRV9NT1ZFX0xFRlRfTEVOR1RIOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzaW1wbGVfbW92ZV9sZWZ0X2xlbmd0aCcpLFxuICBTSU1QTEVfTU9WRV9SSUdIVF9MRU5HVEg6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NpbXBsZV9tb3ZlX3JpZ2h0X2xlbmd0aCcpLFxuICBzaW1wbGVNb3ZlQmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5TSU1QTEVfTU9WRV9VUCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX0RPV04gK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9MRUZUICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfUklHSFQ7XG4gIH0sXG4gIHNpbXBsZUp1bXBCbG9ja3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLlNJTVBMRV9KVU1QX1VQICtcbiAgICAgIHRoaXMuU0lNUExFX0pVTVBfRE9XTiArXG4gICAgICB0aGlzLlNJTVBMRV9KVU1QX0xFRlQgK1xuICAgICAgdGhpcy5TSU1QTEVfSlVNUF9SSUdIVDtcbiAgfSxcbiAgc2ltcGxlTW92ZUxlbmd0aEJsb2NrczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuU0lNUExFX01PVkVfVVBfTEVOR1RIICtcbiAgICAgIHRoaXMuU0lNUExFX01PVkVfRE9XTl9MRU5HVEggK1xuICAgICAgdGhpcy5TSU1QTEVfTU9WRV9MRUZUX0xFTkdUSCArXG4gICAgICB0aGlzLlNJTVBMRV9NT1ZFX1JJR0hUX0xFTkdUSDtcbiAgfVxufTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBsZXZlbC1zcGVjaWZpYyByZXF1aXJlbWVudHMuXG4gKi9cbnZhciBsZXZlbHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gTGV2ZWwgMTogRWwuXG4gICcxXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgMSksXG4gICAgaWRlYWw6IDQsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbTU9WRV9GT1JXQVJEX0lOTElORV0sIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBTcXVhcmUgKHdpdGhvdXQgcmVwZWF0KS5cbiAgJzFfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAyKSxcbiAgICBpZGVhbDogMTEsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDkwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAzOiBTcXVhcmUgKHdpdGggcmVwZWF0KS5cbiAgJzFfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAzKSxcbiAgICBpZGVhbDogNCxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoOTApXSxcbiAgICAgIFtyZXBlYXQoNCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNDogVHJpYW5nbGUuXG4gICcxXzQnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNCksXG4gICAgaWRlYWw6IDYsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA0KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FXSxcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudCcsXG4gICAgICAgIHRpdGxlczoge1ZBTFVFOiAnPz8/J31cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNTogRW52ZWxvcGUuXG4gICcxXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgNSksXG4gICAgaWRlYWw6IDcsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA1KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgNSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW3R1cm5SaWdodFJlc3RyaWN0ZWQoMTIwKV0sXG4gICAgICBbTU9WRV9GT1JXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA2OiB0cmlhbmdsZSBhbmQgc3F1YXJlLlxuICAnMV82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDYpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt0dXJuUmlnaHRSZXN0cmljdGVkKDEyMCksIHR1cm5MZWZ0UmVzdHJpY3RlZCgxMjApXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRfSU5MSU5FLCBNT1ZFX0JBQ0tXQVJEX0lOTElORV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA3OiBnbGFzc2VzLlxuICAnMV83Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDcpLFxuICAgIGlkZWFsOiAxMyxcbiAgICB0b29sYm94OiB0b29sYm94KDEsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygxLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdUdXJuUmVzdHJpY3RlZCg5MCldLFxuICAgICAgW01PVkVfRk9SV0FSRF9JTkxJTkVdLFxuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbTU9WRV9CQUNLV0FSRF9JTkxJTkUsIE1PVkVfRk9SV0FSRF9JTkxJTkVdXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgODogc3Bpa2VzLlxuICAnMV84Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDEsIDgpLFxuICAgIGlkZWFsOiA3LFxuICAgIHRvb2xib3g6IHRvb2xib3goMSwgOCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDgpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbW3JlcGVhdCg4KV1dLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA5OiBjaXJjbGUuXG4gICcxXzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMSwgOSksXG4gICAgaWRlYWw6IDYsXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMSwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHBlcm1pdHRlZEVycm9yczogMTAsXG4gICAgZmFpbEZvckNpcmNsZVJlcGVhdFZhbHVlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnMV8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigxLCAxMCksXG4gICAgdG9vbGJveDogdG9vbGJveCgxLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDEsIDEwKSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IHRydWVcbiAgfSxcbiAgLy8gRm9ybWVybHkgUGFnZSAyLlxuICAvLyBMZXZlbCAxOiBTcXVhcmUuXG4gICcyXzEnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgMSksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAxKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgMSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3tcbiAgICAgICAgLy8gYWxsb3cgdHVybiByaWdodCBvciBsZWZ0LCBidXQgc2hvdyB0dXJuIHJpZ2h0IGJsb2NrIGlmIHRoZXkndmUgZG9uZSBuZWl0aGVyXG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybic7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgICAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5SaWdodCd9LFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcig5MCl9XG4gICAgICB9XSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IG1vdmUgZm9yd2FyZCBvciBiYWNrd2FyZCwgYnV0IHNob3cgZm9yd2FyZCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmUnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd19tb3ZlJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoMTAwKX1cbiAgICAgIH1dXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMjogU21hbGwgZ3JlZW4gc3F1YXJlLlxuICAnMl8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDIpLFxuICAgIGlkZWFsOiA1LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDIpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTcXVhcmUoJz8/JyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgMzogVGhyZWUgc3F1YXJlcy5cbiAgJzJfMyc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAzKSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDMpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCAzKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCgzKV0sXG4gICAgICBbZHJhd0FTcXVhcmUoMTAwKV0sXG4gICAgICBbZHJhd1R1cm4oKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCA0OiAzNiBzcXVhcmVzLlxuICAnMl80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDIsIDQpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDQpLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDU6IERpZmZlcmVudCBzaXplIHNxdWFyZXMuXG4gICcyXzUnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgNSksXG4gICAgaWRlYWw6IDExLFxuICAgIHRvb2xib3g6IHRvb2xib3goMiwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDUpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZHJhd0FTcXVhcmUoJz8/JyldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgNjogRm9yLWxvb3Agc3F1YXJlcy5cbiAgJzJfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA2KSxcbiAgICBpZGVhbDogNyxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA2KSxcbiAgICAvLyBUaGlzIGlzIG5vdCBkaXNwbGF5ZWQgcHJvcGVybHkuXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfY291bnRlcicpXV0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDc6IEJveHkgc3BpcmFsLlxuICAnMl83Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA3KSxcbiAgICBpZGVhbDogOSxcbiAgICB0b29sYm94OiB0b29sYm94KDIsIDcpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygyLCA3KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3NpbXBsZUJsb2NrKCdjb250cm9sc19mb3JfY291bnRlcicpXSxcbiAgICAgIFttb3ZlKCc/PycpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldLFxuICAgICAgW3R1cm5SaWdodCg5MCldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcbiAgLy8gUHJlcCBmb3IgTGV2ZWwgODogVHdvIHNub3dtZW4uXG4gICcyXzdfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCA3LjUpLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgNy41KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RyYXdBU25vd21hbigyNTApXSxcbiAgICAgIFtkcmF3QVNub3dtYW4oMTAwKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDg6IFRocmVlIHNub3dtZW4uXG4gICcyXzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgOCksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpZGVhbDogMTIsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA4KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgOCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oMTUwKV0sXG4gICAgICBbdHVyblJpZ2h0KDkwKV0sXG4gICAgICBbdHVybkxlZnQoOTApXSxcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6ICdqdW1wJyxcbiAgICAgICAgdHlwZTogJ2p1bXAnLFxuICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiBtYWtlTWF0aE51bWJlcigxMDApfVxuICAgICAgfV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ2p1bXAnKV0sXG4gICAgICBbcmVwZWF0KDMpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIHNsaWRlclNwZWVkOiAwLjksXG4gICAgc3RhcnREaXJlY3Rpb246IDBcbiAgfSxcbiAgLy8gTGV2ZWwgOTogU25vd21hbiBmYW1pbHkuXG4gICcyXzknOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMiwgOSksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpZGVhbDogMTUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCA5KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMiwgOSksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkcmF3QVNub3dtYW4oJz8/JyldLFxuICAgICAgW3NpbXBsZUJsb2NrKCdjb250cm9sc19mb3JfY291bnRlcicpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9jb3VudGVyJyldLFxuICAgICAgW3R1cm5SaWdodCg5MCldLFxuICAgICAgW3R1cm5MZWZ0KDkwKV0sXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiAnanVtcCcsXG4gICAgICAgIHR5cGU6ICdqdW1wJyxcbiAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogbWFrZU1hdGhOdW1iZXIoNjApfVxuICAgICAgfV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBzbGlkZXJTcGVlZDogMC45LFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDEwOiBwbGF5Z3JvdW5kLlxuICAnMl8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigyLCAxMCksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCgyLCAxMCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDIsIDEwKVxuICB9LFxuICAvLyBGb3JtZXJseSBQYWdlIDMuXG4gIC8vIExldmVsIDE6IENhbGwgJ2RyYXcgYSBzcXVhcmUnLlxuICAnM18xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDEpLFxuICAgIGlkZWFsOiAxNCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCAxKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAyOiBDcmVhdGUgXCJkcmF3IGEgdHJpYW5nbGVcIi5cbiAgJzNfMic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCAyKSxcbiAgICBpZGVhbDogMTQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCAyKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMiksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoMyldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbdHVyblJpZ2h0KDEyMCldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVRyaWFuZ2xlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG4gIC8vIExldmVsIDM6IEZlbmNlIHRoZSBhbmltYWxzLlxuICAnM18zJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDMpLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDIwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgMyksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDMpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBVHJpYW5nbGUoKSldLFxuICAgICAgW21vdmUoMTAwKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBU3F1YXJlKCkpXVxuICAgIF0sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2NhdC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE3MCwgMjQ3XVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjYXQuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxNzAsIDQ3XVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdjb3cuc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxODIsIDE0N11cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDQ6IEhvdXNlIHRoZSBsaW9uLlxuICAnM180Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDQpLFxuICAgIGlkZWFsOiAxOSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA0KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMzApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdsaW9uLnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTk1LCA5N11cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDU6IENyZWF0ZSBcImRyYXcgYSBob3VzZVwiLlxuICAnM181Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDMsIDUpLFxuICAgIGlkZWFsOiAyMSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2xldmVsQmFzZS5kZWZpbmUobXNnLmRyYXdBSG91c2UoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5kcmF3QVNxdWFyZSgpKV0sXG4gICAgICBbbW92ZSgxMDApXSxcbiAgICAgIFt0dXJuUmlnaHQoMzApXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZHJhd0FUcmlhbmdsZSgpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmRyYXdBSG91c2UoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTcwLCA5MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMjIyLCA5MF1cbiAgICAgIH1cbiAgICBdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwXG4gIH0sXG4gIC8vIExldmVsIDY6IEFkZCBwYXJhbWV0ZXIgdG8gXCJkcmF3IGEgdHJpYW5nbGVcIi5cbiAgJzNfNic6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcigzLCA2KSxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiAyMyxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA2KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW2RlZmluZVdpdGhBcmcobXNnLmRyYXdBVHJpYW5nbGUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbc2ltcGxlQmxvY2soJ3ZhcmlhYmxlc19nZXRfbGVuZ3RoJyldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXVxuICAgIF0sXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2UsXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGltYWdlczogW1xuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2xpb24uc3ZnJyxcbiAgICAgICAgcG9zaXRpb246IFsxODUsIDEwMF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTc1LCAyNDhdXG4gICAgICB9XG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA3OiBBZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIGhvdXNlXCIuXG4gICczXzcnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgNyksXG4gICAgaW5pdGlhbFk6IDM1MCxcbiAgICBpZGVhbDogMjQsXG4gICAgdG9vbGJveDogdG9vbGJveCgzLCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtkZWZpbmVXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FTcXVhcmUoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QVRyaWFuZ2xlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW3NpbXBsZUJsb2NrKCd2YXJpYWJsZXNfZ2V0X2xlbmd0aCcpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBSG91c2UoKSwgbXNnLmxlbmd0aFBhcmFtZXRlcigpKV1cbiAgICBdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBpbWFnZXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZW5hbWU6ICdlbGVwaGFudC5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzIwNSwgMjIwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgODogRHJhdyBob3VzZXMuXG4gICczXzgnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDgpLFxuICAgIGluaXRpYWxYOiAyMCxcbiAgICBpbml0aWFsWTogMzUwLFxuICAgIGlkZWFsOiA0MCxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2NrcygzLCA4KSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTYsIDE3MF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnbGlvbi5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzE1LCAyNTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTI3LCAyMjBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzI1NSwgMjUwXVxuICAgICAgfVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgZGlzYWJsZVBhcmFtRWRpdGluZzogZmFsc2VcbiAgfSxcbiAgLy8gTGV2ZWwgOTogRHJhdyBob3VzZXMgd2l0aCBmb3IgbG9vcC5cbiAgJzNfOSc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoMywgOSksXG4gICAgaW5pdGlhbFg6IDIwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDQwLFxuICAgIHRvb2xib3g6IHRvb2xib3goMywgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDMsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbZGVmaW5lV2l0aEFyZyhtc2cuZHJhd0FIb3VzZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLmRyYXdBU3F1YXJlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cuZHJhd0FUcmlhbmdsZSgpLCBtc2cubGVuZ3RoUGFyYW1ldGVyKCkpXSxcbiAgICAgIFtzaW1wbGVCbG9jaygndmFyaWFibGVzX2dldF9sZW5ndGgnKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5kcmF3QUhvdXNlKCksIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSldXG4gICAgXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW1hZ2VzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbGVuYW1lOiAnY2F0LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbLTEwLCAyNzBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2Nvdy5zdmcnLFxuICAgICAgICBwb3NpdGlvbjogWzUzLCAyNTBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaWxlbmFtZTogJ2VsZXBoYW50LnN2ZycsXG4gICAgICAgIHBvc2l0aW9uOiBbMTc1LCAyMjBdXG4gICAgICB9XG4gICAgXSxcbiAgICBmYWlsRm9yVG9vTWFueUJsb2NrczogdHJ1ZSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBkaXNhYmxlUGFyYW1FZGl0aW5nOiBmYWxzZVxuICB9LFxuICAvLyBMZXZlbCAxMDogcGxheWdyb3VuZC5cbiAgJzNfMTAnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDMsIDEwKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDMsIDEwKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoMywgMTApXG4gIH0sXG4gIC8vIEZvcm1lcmx5IFBhZ2UgNC5cbiAgLy8gTGV2ZWwgMTogT25lIHRyaWFuZ2xlLlxuICAnNF8xJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDEpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDEpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEX09SX0JBQ0tXQVJEX0lOTElORV0sXG4gICAgICBbcmVwZWF0KDMpXSxcbiAgICAgIFt7XG4gICAgICAgIC8vIGFsbG93IHR1cm4gcmlnaHQgb3IgbGVmdCwgYnV0IHNob3cgdHVybiByaWdodCBibG9jayBpZiB0aGV5J3ZlIGRvbmUgbmVpdGhlclxuICAgICAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICAgICAgdGl0bGVzOiB7VkFMVUU6ICc/Pz8nfVxuICAgICAgfV1cbiAgICBdLFxuICB9LFxuICAvLyBMZXZlbCAyOiBUd28gdHJpYW5nbGVzLlxuICAnNF8yJzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDIpLFxuICAgIGlkZWFsOiAxMixcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDIpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAyKSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuNVxuICB9LFxuICAvLyBMZXZlbCAzOiBGb3VyIHRyaWFuZ2xlcyB1c2luZyByZXBlYXQuXG4gICc0XzMnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgMyksXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgMyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuN1xuICB9LFxuICAvLyBMZXZlbCA0OiBUZW4gdHJpYW5nbGVzIHdpdGggbWlzc2luZyByZXBlYXQgbnVtYmVyLlxuICAnNF80Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDQpLFxuICAgIGlkZWFsOiA4LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNCksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDQpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbcmVwZWF0KCc/Pz8nKV1cbiAgICBdLFxuICAgIHNsaWRlclNwZWVkOiAwLjcsXG4gICAgaW1wcmVzc2l2ZTogdHJ1ZVxuICB9LFxuICAvLyBMZXZlbCA1OiAzNiB0cmlhbmdsZXMgd2l0aCBtaXNzaW5nIGFuZ2xlIG51bWJlci5cbiAgJzRfNSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA1KSxcbiAgICBpZGVhbDogOCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDUpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA1KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3R1cm5SaWdodEJ5Q29uc3RhbnQoJz8/PycpXVxuICAgIF0sXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDY6IDEgc3F1YXJlLlxuICAnNF82Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDYpLFxuICAgIGlkZWFsOiA0LFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgNiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDYpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbbW92ZUZvcndhcmRJbmxpbmUoMjApXSxcbiAgICAgIFtyZXBlYXQoNCldLFxuICAgICAgW3tcbiAgICAgICAgdGVzdDogJ3R1cm5SaWdodCcsXG4gICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnQnLFxuICAgICAgICB0aXRsZXM6IHtWQUxVRTogJz8/Pyd9XG4gICAgICB9XVxuICAgIF0sXG4gICAgcGVybWl0dGVkRXJyb3JzOiAxMCxcbiAgICBzdGFydERpcmVjdGlvbjogMFxuICB9LFxuICAvLyBMZXZlbCA3OiBTcXVhcmUgTGFkZGVyLlxuICAnNF83Jzoge1xuICAgIGFuc3dlcjogYW5zd2VyKDQsIDcpLFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDgsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCA3KSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNCwgNyksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFttb3ZlRm9yd2FyZElubGluZSgyMCldLFxuICAgICAgW3JlcGVhdCgxMCldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC43XG4gIH0sXG4gIC8vIExldmVsIDg6IExhZGRlciBzcXVhcmUuXG4gICc0XzgnOiB7XG4gICAgYW5zd2VyOiBhbnN3ZXIoNCwgOCksXG4gICAgaW5pdGlhbFg6IDEwMCxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIGlkZWFsOiAxMCxcbiAgICB0b29sYm94OiB0b29sYm94KDQsIDgpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCA4KSxcbiAgICByZXF1aXJlZEJsb2NrczogW1xuICAgICAgW3JlcGVhdCg0KV0sXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDk6IExhZGRlciBzcXVhcmUgd2l0aCBhIGRpZmZlcmVudCBhbmdsZS5cbiAgJzRfOSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCA5KSxcbiAgICBpbml0aWFsWDogMTUwLFxuICAgIGluaXRpYWxZOiAzNTAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgOSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDkpLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXG4gICAgICBbdHVyblJpZ2h0QnlDb25zdGFudCgnPz8/JyldXG4gICAgXSxcbiAgICBzdGFydERpcmVjdGlvbjogMzMwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgfSxcbiAgLy8gTGV2ZWwgMTA6IExhZGRlciBwb2x5Z29uLlxuICAnNF8xMCc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxMCksXG4gICAgaW5pdGlhbFg6IDc1LFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgaWRlYWw6IDEwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNCwgMTApLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg0LCAxMCksXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgICAgIFtyZXBlYXQoJz8/PycpXVxuICAgIF0sXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDAuOSxcbiAgICBpbXByZXNzaXZlOiB0cnVlXG4gIH0sXG4gIC8vIExldmVsIDExOiBwbGF5Z3JvdW5kLlxuICAnNF8xMSc6IHtcbiAgICBhbnN3ZXI6IGFuc3dlcig0LCAxMSksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFg6IDc1LFxuICAgIGluaXRpYWxZOiAzMDAsXG4gICAgdG9vbGJveDogdG9vbGJveCg0LCAxMSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDQsIDExKSxcbiAgICByZXF1aXJlZEJsb2NrcyA6IFtdLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAwLjlcbiAgIH0sXG5cbiAgLy8gRm9ybWVybHkgUGFnZSA1LlxuICAvLyBMZXZlbCAxOiBwbGF5Z3JvdW5kLlxuICAnNV8xJzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTIwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCAxKSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDEpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCAxKSxcbiAgICBzbGlkZXJTcGVlZDogMC45XG4gIH0sXG4gIC8vIExldmVsIDI6IHBsYXlncm91bmQuXG4gICc1XzInOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxMjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDIpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgMiksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDIpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgMzogcGxheWdyb3VuZC5cbiAgJzVfMyc6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDEyMDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgMyksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgdG9vbGJveDogdG9vbGJveCg1LCAzKSxcbiAgICBzdGFydEJsb2Nrczogc3RhcnRCbG9ja3MoNSwgMyksXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBMZXZlbCA0OiBwbGF5Z3JvdW5kLlxuICAnNV80Jzoge1xuICAgIG1pbldvcmtzcGFjZUhlaWdodDogMTYwMCxcbiAgICBhbnN3ZXI6IGFuc3dlcig1LCA0KSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDQpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA0KSxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIExldmVsIDU6IHBsYXlncm91bmQuXG4gICc1XzUnOiB7XG4gICAgbWluV29ya3NwYWNlSGVpZ2h0OiAxNjAwLFxuICAgIGFuc3dlcjogYW5zd2VyKDUsIDUpLFxuICAgIGZyZWVQbGF5OiB0cnVlLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgNSksXG4gICAgc3RhcnRCbG9ja3M6IHN0YXJ0QmxvY2tzKDUsIDUpLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgLy8gTGV2ZWwgNjogcGxheWdyb3VuZC5cbiAgJzVfNic6IHtcbiAgICBtaW5Xb3Jrc3BhY2VIZWlnaHQ6IDE2MDAsXG4gICAgYW5zd2VyOiBhbnN3ZXIoNSwgNiksXG4gICAgZnJlZVBsYXk6IHRydWUsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIDYpLFxuICAgIHN0YXJ0QmxvY2tzOiBzdGFydEJsb2Nrcyg1LCA2KSxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH0sXG4gIC8vIFRoZSBsZXZlbCBmb3IgYnVpbGRpbmcgbmV3IGxldmVscy5cbiAgJ2J1aWxkZXInOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogdHJ1ZSxcbiAgICBpbml0aWFsWTogMzAwLFxuICAgIHRvb2xib3g6IHRvb2xib3goNSwgTEVWRUxCVUlMREVSX0xFVkVMKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgc3RhcnREaXJlY3Rpb246IDAsXG4gICAgc2xpZGVyU3BlZWQ6IDEuMFxuICB9LFxuICAvLyBUaGUgZGVmYXVsdCBsZXZlbCBuZXdseSBjcmVhdGVkIGxldmVscyB1c2UuXG4gICdjdXN0b20nOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICB0b29sYm94OiB0b29sYm94KDUsIExFVkVMQlVJTERFUl9MRVZFTCksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHN0YXJ0RGlyZWN0aW9uOiAwLFxuICAgIHNsaWRlclNwZWVkOiAxLjBcbiAgfSxcbiAgJ2sxX2RlbW8nOiB7XG4gICAgYW5zd2VyOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgaW5pdGlhbFk6IDMwMCxcbiAgICBpc0sxOiB0cnVlLFxuICAgIHRvb2xib3g6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICAgICAgYmxvY2tzLnNpbXBsZU1vdmVCbG9ja3MoKSArXG4gICAgICAgIGJsb2Nrcy5zaW1wbGVKdW1wQmxvY2tzKCkgK1xuICAgICAgICBibG9ja3Muc2ltcGxlTW92ZUxlbmd0aEJsb2NrcygpICtcbiAgICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWQnKSArXG4gICAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2RyYXdfY29sb3VyX3NpbXBsZScpXG4gICAgICApLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICBzdGFydERpcmVjdGlvbjogMCxcbiAgICBzbGlkZXJTcGVlZDogMS4wXG4gIH1cbn07XG5cbmxldmVscy5lY18xXzEgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzEnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcIm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzIgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzInXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcInBlbkNvbG91cignI2ZmMDAwMCcpO1xcbm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbmxldmVscy5lY18xXzMgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzMnXSwge1xuICAnZWRpdENvZGUnOiB0cnVlLFxuICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgICdwZW5Db2xvdXInOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcImZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XFxuICBfX1xcbn1cXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfNCA9IHV0aWxzLmV4dGVuZChsZXZlbHNbJzFfNCddLCB7XG4gICdlZGl0Q29kZSc6IHRydWUsXG4gICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgJ3BlbkNvbG91cic6IG51bGwsXG4gICAgJ2Zvckxvb3BfaV8wXzQnOiB7ICdjYXRlZ29yeSc6ICdBcnRpc3QnIH0sXG4gIH0sXG4gICdzdGFydEJsb2Nrcyc6IFwiZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcXG4gIHBlbkNvbG91cignI2ZmMDAwMCcpO1xcbn1cXG5cIixcbn0pO1xubGV2ZWxzLmVjXzFfMTAgPSB1dGlscy5leHRlbmQobGV2ZWxzWycxXzEwJ10sIHtcbiAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICAncGVuQ29sb3VyJzogbnVsbCxcbiAgICAncGVuV2lkdGgnOiBudWxsLFxuICAgICdmb3JMb29wX2lfMF80JzogeyAnY2F0ZWdvcnknOiAnQXJ0aXN0JyB9LFxuICB9LFxuICAnc3RhcnRCbG9ja3MnOiBcIm1vdmVGb3J3YXJkKDEwMCk7XFxuXCIsXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG4vLyBBbiBlYXJseSBoYWNrIGludHJvZHVjZWQgc29tZSBsZXZlbGJ1aWxkZXIgbGV2ZWxzIGFzIHBhZ2UgNSwgbGV2ZWwgNy4gTG9uZ1xuLy8gdGVybSB3ZSBjYW4gcHJvYmFibHkgZG8gc29tZXRoaW5nIG11Y2ggY2xlYW5lciwgYnV0IGZvciBub3cgSSdtIGNhbGxpbmdcbi8vIG91dCB0aGF0IHRoaXMgbGV2ZWwgaXMgc3BlY2lhbCAob24gcGFnZSA1KS5cbnZhciBMRVZFTEJVSUxERVJfTEVWRUwgPSA3O1xuXG4vKlxuVE9PTEJPWC5cblxuUEFHRSAxXG49PT09PT1cbldpdGhpbiB0aGlzIHBhZ2UsIGJsb2NrcyBhcmUgb25seSBhZGRlZCwgbmV2ZXIgdGFrZW4gYXdheS5cblxuTGV2ZWwgMSBbZWxdOiBBZGRzIGRyYXdfbW92ZV9ieV9jb25zdGFudCBhbmQgZHJhd190dXJuX2J5X2NvbnN0YW50LlxuTGV2ZWwgMiBbY29sb3VyZWQgc3F1YXJlXTogQWRkcyBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIuXG5sZXZlbCAzIFtzcXVhcmUgaW4gdGhyZWUgYmxvY2tzXTogQWRkcyBjb250cm9sc19yZXBlYXQuXG5sZXZlbCA0IFt0cmlhbmdsZV0gQWRkcyBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9yYW5kb20uXG5MZXZlbCA1IFtvdmVybGFwcGluZyBzcXVhcmUgYW5kIHRyaWFuZ2xlIChzaWRld2F5cyBlbnZlbG9wZSldXG5MZXZlbCA2IFtlbnZlbG9wZV1cbkxldmVsIDcgW2dsYXNzZXNdXG5MZXZlbCA4IFtzcGlrZXNdXG5MZXZlbCA5IFtjaXJjbGVdXG5MZXZlbCAxMCBbZnJlZSBwbGF5XTogZHJhd193aWR0aF9pbmxpbmVcblxuUEFHRSAyXG49PT09PT1cbkNhdGVnb3JpZXMgYXJlIGludHJvZHVjZWQsIHdpdGggY29udGVudHMgb2Y6XG4tIEFjdGlvbnNcbiAgLSBkcmF3X21vdmUgd2l0aCBtYXRoX251bWJlclxuICAtIGRyYXdfdHVybiB3aXRoIG1hdGhfbnVtYmVyXG4tIENvbG9yXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3BpY2tlclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9yYW5kb21cbi0gRnVuY3Rpb25zIChhZGRlZCBhdCBsZXZlbCAyKVxuICAtIFtjYWxsXSBkcmF3IGEgc3F1YXJlXG4gIC0gW2NhbGxdIGRyYXcgYSBzbm93YmFsbCAoYWRkZWQgYXQgbGV2ZWwgOSlcbi0gTG9vcHNcbiAgLSBjb250cm9sc19yZXBlYXRcbiAgLSBjb250cm9sc19mb3IgKGFkZGVkIGF0IGxldmVsIDYpXG4tIE1hdGhcbiAgLSBtYXRoX251bWJlclxuLSBWYXJpYWJsZXMgKGFkZGVkIGF0IGxldmVsIDYpXG4gIC0gZ2V0IGNvdW50ZXIgKGFkZGVkIGF0IGxldmVsIDkpXG4gIC0gZ2V0IGhlaWdodCAoYWRkZWQgYXQgbGV2ZWwgNylcbiAgLSBnZXQgbGVuZ3RoIChsZXZlbHMgNiBhbmQgMTApXG5MZXZlbCAxIFtzcXVhcmVdXG5MZXZlbCAyIFtzcXVhcmUgYnkgZnVuY3Rpb24gY2FsbF06IGFkZCBcImRyYXcgYSBzcXVhcmVcIlxuTGV2ZWwgMyBbMyBzcXVhcmVzXVxuTGV2ZWwgNCBbMzYgc3F1YXJlc11cbkxldmVsIDUgW25lc3RlZCBzcXVhcmVzIHdpdGhvdXQgY29udHJvbHNfZm9yXVxuTGV2ZWwgNiBbbmVzdGVkIHNxdWFyZXMgd2l0aCBjb250cm9sc19mb3JdXG5MZXZlbCA3IFttaW5pLXNwaXJhbF1cbkxldmVsIDggWzMgc25vd21lbl06IGFkZCBcImRyYXcgYSBzbm93bWFuXCJcbkxldmVsIDkgW3Nub3dtYW4gZmFtaWx5XVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV1cblxuUEFHRSAzXG49PT09PT1cbkNhdGVnb3JpZXMgYXJlIHVzZWQsIHdpdGggY29udGVudHMgb2Y6XG4tIEFjdGlvbnNcbiAgLSBkcmF3X21vdmUgd2l0aCBtYXRoX251bWJlclxuICAtIGRyYXdfdHVybiB3aXRoIG1hdGhfbnVtYmVyXG4tIENvbG9yXG4gIC0gZHJhd19jb2xvdXIgKHNldCBjb2xvdXIpIHdpdGggY29sb3VyX3BpY2tlclxuICAtIGRyYXdfY29sb3VyIChzZXQgY29sb3VyKSB3aXRoIGNvbG91cl9yYW5kb21cbi0gRnVuY3Rpb25zIChSZXBsYWNlZCB3aXRoIGN1c3RvbSBjYXRlZ29yeSBhdCBsZXZlbCAyKVxuICAtIFtjYWxsXSBkcmF3IGEgY2lyY2xlXG4gIC0gW2NhbGxdIGRyYXcgYSBzcXVhcmVcbi0gTG9vcHNcbiAgLSBjb250cm9sc19mb3JcbiAgLSBjb250cm9sc19yZXBlYXRcbi0gTWF0aFxuICAtIG1hdGhfbnVtYmVyXG4tIFZhcmlhYmxlcyAoYWRkZWQgYXQgbGV2ZWwgNilcbiAgLSBnZXQgY291bnRlclxuVmFyaWFibGVzIGFuZCBmdW5jdGlvbnMgYXJlIG1hbnVhbGx5IGFkZGVkIHVudGlsIExldmVscyA3IGFuZCA4LFxud2hlbiB0aGUgY3VzdG9tIGNhdGVnb3JpZXMgYXJlIHVzZWRcbkxldmVsIDEgW2NhbGwgXCJkcmF3IGEgc3F1YXJlXCJdXG5MZXZlbCAyIFtjcmVhdGUgYW5kIGNhbGwgXCJkcmF3IGEgdHJpYW5nbGVcIl1cbkxldmVsIDMgW3VzZSBcImRyYXcgYSBzcXVhcmVcIiBhbmQgXCJkcmF3IGEgdHJpYW5nbGVcIiB0byBmZW5jZSBhbmltYWxzXVxuTGV2ZWwgNCBbZHJhdyBhIGhvdXNlXVxuTGV2ZWwgNSBbY3JlYXRlIGFuZCBjYWxsIFwiZHJhdyBhIGhvdXNlXCJdXG5MZXZlbCA2IFthZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIHRyaWFuZ2xlXCJdXG5MZXZlbCA3IFthZGQgcGFyYW1ldGVyIHRvIFwiZHJhdyBhIGhvdXNlXCJdXG5MZXZlbCA4IFttb2RpZnkgZW5kIGxvY2F0aW9uIG9mIFwiY3JlYXRlIGEgaG91c2VcIl1cbkxldmVsIDkgW2NhbGwgXCJkcmF3IGEgaG91c2VcIiB3aXRoIGZvciBsb29wXVxuTGV2ZWwgMTAgW2ZyZWUgcGxheV1cblxuKi87IGJ1Zi5wdXNoKCc8eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gICcpOzkyOyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnQnKTs5MzsgaWYgKGxldmVsIDw9IDgpIHsgOyBidWYucHVzaCgnX3Jlc3RyaWN0ZWQnKTs5MzsgfSA7IGJ1Zi5wdXNoKCdcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICAnKTs5NjsgaWYgKGxldmVsID49IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMDE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTAxOyBpZiAobGV2ZWwgPj0gNCkgeyAvKiBPdXQgb2YgbnVtZXJpYyBvcmRlciB0byBtYWtlIGNvbG91ciBibG9ja3MgYWRqYWNlbnQuICovOyBidWYucHVzaCgnICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTA2OyB9OyBidWYucHVzaCgnICAgICcpOzEwNjsgaWYgKGxldmVsID49IDMpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEwOTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMDk7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayBpZD1cImRyYXctd2lkdGhcIiB0eXBlPVwiZHJhd193aWR0aF9pbmxpbmVcIiB4PVwiMTU4XCIgeT1cIjY3XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTEyOyB9OyBidWYucHVzaCgnICAnKTsxMTI7IH0gZWxzZSBpZiAocGFnZSA9PSAyIHx8IHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgICAnKTsxMTI7IC8vIEFjdGlvbnM6IGRyYXdfbW92ZSwgZHJhd190dXJuLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBpZD1cImFjdGlvbnNcIiBuYW1lPVwiJywgZXNjYXBlKCgxMTIsICBtc2cuY2F0VHVydGxlKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEyMDsgaWYgKHBhZ2UgPT0gMiAmJiBsZXZlbCA+PSA4KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImp1bXBcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEyNzsgfTsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjkwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMzQ7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEzNzsgfTsgYnVmLnB1c2goJyAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsxMzg7IC8vIENvbG91cjogZHJhd19jb2xvdXIgd2l0aCBjb2xvdXJfcGlja2VyIGFuZCBjb2xvdXJfcmFuZG9tLlxuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxMzgsICBtc2cuY2F0Q29sb3VyKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgaWQ9XCJkcmF3LWNvbG9yXCIgdHlwZT1cImRyYXdfY29sb3VyXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzE1MDsgLy8gRnVuY3Rpb25zIGRpZmZlciBkZXBlbmRpbmcgb24gcGFnZSBhbmQgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgJyk7MTUwOyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTUwLCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2Ffc3F1YXJlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgJyk7MTU4OyBpZiAobGV2ZWwgPj0gOCkgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93bWFuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgJyk7MTY1OyB9OyBidWYucHVzaCgnICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTY2OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgICAgICcpOzE2NjsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICcpOzE2NjsgLy8gRG9uJ3QgdXNlIGN1c3RvbSBjYXRlZ29yeSB5ZXQsIHNpbmNlIGl0IGFsbG93cyBmdW5jdGlvbiBkZWZpbml0aW9uLlxuOyBidWYucHVzaCgnICAgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTY2LCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDE2OCwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxNzEsICBtc2cuZHJhd0FTcXVhcmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L2NhdGVnb3J5PlxcbiAgICAgICcpOzE3NDsgfSBlbHNlIHsgOyBidWYucHVzaCgnXFxuICAgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTc1LCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICAgICAgJyk7MTc2OyB9OyBidWYucHVzaCgnICAgICcpOzE3NjsgfTsgYnVmLnB1c2goJyAgICAnKTsxNzY7IC8vIENvbnRyb2w6IGNvbnRyb2xzX2Zvcl9jb3VudGVyIChmcm9tIHBhZ2UgMiwgbGV2ZWwgNikgYW5kIHJlcGVhdC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTc2LCAgbXNnLmNhdENvbnRyb2woKSApKSwgJ1wiPlxcbiAgICAgICcpOzE3NzsgaWYgKChwYWdlID09IDIgJiYgbGV2ZWwgPj0gNikgfHwgKHBhZ2UgPT0gMyAmJiBsZXZlbCA+PSA5KSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JfY291bnRlclwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzE5NDsgfTsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MTk4OyAvLyBNYXRoOiBKdXN0IG51bWJlciBibG9ja3MgdW50aWwgZmluYWwgbGV2ZWwuXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE5OCwgIG1zZy5jYXRNYXRoKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PC9ibG9jaz5cXG4gICAgICAnKTsyMDA7IGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX2FyaXRobWV0aWNcIiBpbmxpbmU9XCJ0cnVlXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21faW50XCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9yYW5kb21fZmxvYXRcIj48L2Jsb2NrPlxcbiAgICAnKTsyMTQ7IH07IGJ1Zi5wdXNoKCcgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjE1OyAvLyBWYXJpYWJsZXMgZGVwZW5kcyBvbiBwYWdlIGFuZCBsZXZlbCwgYWx0aG91Z2ggd2UgbmV2ZXIgdXNlIHRoZSBjdXN0b20gY2F0ZWdvcnlcbjsgYnVmLnB1c2goJyAgICAnKTsyMTU7IC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBvZmZlciBzaW1wbGlmaWVkIGdldHRlcnMgYW5kIG5vIHNldHRlcnMuXG47IGJ1Zi5wdXNoKCcgICAgJyk7MjE1OyBpZiAocGFnZSA9PSAyICYmIGxldmVsID49IDYpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjE1LCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfY291bnRlclwiPjwvYmxvY2s+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjE4OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMyAmJiBsZXZlbCA+PSA2ICYmIGxldmVsIDwgMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjE4LCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCI+XFxuICAgICAgICAnKTsyMTk7IGlmIChsZXZlbCA+PSA5KSB7OyBidWYucHVzaCgnICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldF9jb3VudGVyXCI+PC9ibG9jaz5cXG4gICAgICAgICcpOzIyMDsgfTsgYnVmLnB1c2goJyAgICAgICAgJyk7MjIwOyBpZiAobGV2ZWwgPj0gNikgezsgYnVmLnB1c2goJyAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgICcpOzIyMTsgfTsgYnVmLnB1c2goJyAgICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzIyMjsgfSBlbHNlIGlmIChwYWdlID09IDMgJiYgbGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjIyLCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCIgY3VzdG9tPVwiVkFSSUFCTEVcIj5cXG4gICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTsyMjQ7IH07IGJ1Zi5wdXNoKCcgICcpOzIyNDsgfSBlbHNlIGlmIChwYWdlID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjI0OyAvLyBBY3Rpb25zOiBkcmF3X21vdmUsIGRyYXdfdHVybi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjkwPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7MjI4OyBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiV0lEVEhcIj4xPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICAgJyk7MjMxOyB9OyBidWYucHVzaCgnICAgICcpOzIzMTsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI0NDsgfSBlbHNlIGlmIChwYWdlID09IDUpIHs7IGJ1Zi5wdXNoKCcgICcpOzI0NDsgLy8gSzEgc2ltcGxpZmllZCBibG9ja3MgZm9yIGVkaXRvcjoga2VlcCBpbiBzeW5jIHdpdGggRGFzaGJvYXJkIGFydGlzdC5yYlxuOyBidWYucHVzaCgnICAgICcpOzI0NDsgaWYgKGxldmVsID09PSBMRVZFTEJVSUxERVJfTEVWRUwpIHs7IGJ1Zi5wdXNoKCcgICAgICA8Y2F0ZWdvcnkgbmFtZT1cIksxIFNpbXBsaWZpZWRcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJfc2ltcGxlXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfdXBcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9kb3duXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfbGVmdFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3JpZ2h0XCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfdXBfbGVuZ3RoXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX21vdmVfZG93bl9sZW5ndGhcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfbW92ZV9sZWZ0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9tb3ZlX3JpZ2h0X2xlbmd0aFwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX3VwXCI+PC9ibG9jaz5cXG4gICAgICAgIDxibG9jayB0eXBlPVwic2ltcGxlX2p1bXBfZG93blwiPjwvYmxvY2s+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInNpbXBsZV9qdW1wX2xlZnRcIj48L2Jsb2NrPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJzaW1wbGVfanVtcF9yaWdodFwiPjwvYmxvY2s+XFxuICAgICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MjYyOyB9OyBidWYucHVzaCgnICAgICcpOzI2MjsgLy8gQWN0aW9uczogZHJhd19tb3ZlLCBkcmF3X3R1cm4uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IGlkPVwiYWN0aW9uc1wiIG5hbWU9XCInLCBlc2NhcGUoKDI2MiwgIG1zZy5jYXRUdXJ0bGUoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJqdW1wXCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjUwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJXSURUSFwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAgICcpOzI4OTsgLy8gQ29sb3VyOiBkcmF3X2NvbG91ciB3aXRoIGNvbG91cl9waWNrZXIgYW5kIGNvbG91cl9yYW5kb20uXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDI4OSwgIG1zZy5jYXRDb2xvdXIoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayBpZD1cImRyYXctY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3BpY2tlclwiPjwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIGlkPVwiZHJhdy1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCI+PC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzAxOyAvLyBGdW5jdGlvbnNcbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzAxLCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICAgICcpOzMwMjsgaWYgKGxldmVsID09PSBMRVZFTEJVSUxERVJfTEVWRUwpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCJQcmVidWlsdFwiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3RyaWFuZ2xlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVfY3VzdG9tXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9ob3VzZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfZmxvd2VyXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zbm93Zmxha2VcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX2hleGFnb25cIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3N0YXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3JvYm90XCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9yb2NrZXRcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3BsYW5ldFwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2FfcmhvbWJ1c1wiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3VwcGVyX3dhdmVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwiZHJhd19sb3dlcl93YXZlXCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICAgJyk7MzE4OyB9OyBidWYucHVzaCgnICAgICcpOzMxODsgLy8gQ29udHJvbDogY29udHJvbHNfZm9yX2NvdW50ZXIgYW5kIHJlcGVhdC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzE4LCAgbXNnLmNhdENvbnRyb2woKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzM2OyBpZiAobGV2ZWwgPCA2KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzMzOTsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MzQ2OyB9OyBidWYucHVzaCgnICAgIDwvY2F0ZWdvcnk+XFxuICAnKTszNDc7IC8vIExvZ2ljXG47IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDM0NywgIG1zZy5jYXRMb2dpYygpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19pZlwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19jb21wYXJlXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX29wZXJhdGlvblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19uZWdhdGVcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibG9naWNfYm9vbGVhblwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJsb2dpY19udWxsXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImxvZ2ljX3Rlcm5hcnlcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszNTY7IC8vIE1hdGg6IEp1c3QgbnVtYmVyIGJsb2NrcyB1bnRpbCBmaW5hbCBsZXZlbC5cbjsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMzU2LCAgbXNnLmNhdE1hdGgoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9pbnRcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX3JhbmRvbV9mbG9hdFwiPjwvYmxvY2s+XFxuICAgICA8L2NhdGVnb3J5PlxcbiAgICAnKTszNzM7IC8vIFZhcmlhYmxlc1xuOyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgzNzMsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIiBjdXN0b209XCJWQVJJQUJMRVwiPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgJyk7Mzc1OyB9OyBidWYucHVzaCgnPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxuLyoqXG4gKiBDb21tb24gY29kZSBmb3IgY3JlYXRpbmcgcHJvY2VkdXJlcyBkcmF3aW5nIGRpZmZlcmVudCByZWd1bGFyIHBvbHlnb25zLlxuICogb3B0aW9uczpcbiAqICAgdGl0bGUgVGl0bGUgb2YgcHJvY2VkdXJlLlxuICogICBtb2RpZmllcnMgU3RyaW5nIGNvbnRhaW5pbmcgYW55IG9wdGlvbmFsIGtleXMgYW5kIHZhbHVlcyBmb3IgdGhlIGluaXRpYWxcbiAqICAgICAgICAgICAgIDxibG9jaz4gdGFnLCBzdWNoIGFzICd4PVwiMjBcIiB5PVwiMjBcIiBlZGl0YWJsZT1cImZhbHNlXCInLlxuICogICBzaWRlcyBOdW1iZXIgb2Ygc2lkZXMuXG4gKiAgIGxlbmd0aCAwIGlmIGEgbGVuZ3RoIHBhcmFtZXRlciBzaG91bGQgYmUgdXNlZCwgYSBwb3NpdGl2ZSBudW1iZXIgb3RoZXJ3aXNlXG4gKi9cbnZhciBwb2x5Z29uID0gZnVuY3Rpb24ob3B0aW9ucykgezsgYnVmLnB1c2goJzxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiICcsICgxNCwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgIDxtdXRhdGlvbj5cXG4gICAgICAnKTsxNjsgaWYgKG9wdGlvbnMubGVuZ3RoID09IDApIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTYsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAnKTsxNzsgfTsgYnVmLnB1c2goJyAgICA8L211dGF0aW9uPlxcbiAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDE4LCAgb3B0aW9ucy50aXRsZSApKSwgJzwvdGl0bGU+XFxuICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiAnLCAoMjAsICBvcHRpb25zLm1vZGlmaWVycyApLCAnPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicsIGVzY2FwZSgoMjEsICBvcHRpb25zLnNpZGVzICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgJywgKDIzLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAnKTsyNTsgaWYgKG9wdGlvbnMubGVuZ3RoID09IDApIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2xlbmd0aFwiICcsICgyNSwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICcpOzI2OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgJywgKDI2LCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPicsIGVzY2FwZSgoMjcsICBvcHRpb25zLmxlbmd0aCApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAnKTsyOTsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiICcsICgzMSwgIG9wdGlvbnMubW9kaWZpZXJzICksICc+XFxuICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgJywgKDMzLCAgb3B0aW9ucy5tb2RpZmllcnMgKSwgJz5cXG4gICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+JywgZXNjYXBlKCgzNCwgIDM2MCAvIG9wdGlvbnMuc2lkZXMgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvc3RhdGVtZW50PlxcbiAgPC9ibG9jaz5cXG4nKTs0NDsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTs0NTtcbi8qKlxuICogU3BpcmFsIG5lZWRzIGEgbmFtZWQgaGVscGVyIHRlbXBsYXRlIGZvciByZWN1cnNpb24uXG4gKiBAcGFyYW0gaSBMb29wIGNvbnRyb2wgdmFyaWFibGUuXG4gKi9cbnZhciBzcGlyYWwgPSBmdW5jdGlvbihpKSB7OyBidWYucHVzaCgnICAnKTs1MDsgaWYgKGkgPD0gNjApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiAnKTs1MDsgaWYgKGkgPT0gMjUpIHsgOyBidWYucHVzaCgneD1cIjMwMFwiIHk9XCIxMDBcIicpOzUwOyB9IDsgYnVmLnB1c2goJyBpbmxpbmU9XCJmYWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIGRpc2FibGVkPVwidHJ1ZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nLCBlc2NhcGUoKDU0LCAgaSApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cImZhbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgZGlzYWJsZWQ9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBkaXNhYmxlZD1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICcpOzY2OyBzcGlyYWwoaSArIDUpOyBidWYucHVzaCgnICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzA7IH0gOyBidWYucHVzaCgnXFxuJyk7NzE7IH07OyBidWYucHVzaCgnXFxuJyk7NzI7XG4vKipcbiAqIERlZmluZSB0aGUgc3RhcnRpbmcgYmxvY2tzIGZvciBlYWNoIHBhZ2UgYW5kIGxldmVsLlxuICogVGhlc2UgYXJlIHJlZmVyZW5jZWQgZnJvbSB0dXJ0bGUuanMuXG4gKi9cbjsgYnVmLnB1c2goJ1xcbicpOzc4OyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAnKTs3ODsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPlxcbiAgJyk7Nzk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJDT0xPVVJcIj4jZmYwMDAwPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+PC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4OTsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7OTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMyB8fCBsZXZlbCA9PSA1IHx8IGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+Jyk7MTAwOyBpZiAobGV2ZWwgPT0gMykgeyA7IGJ1Zi5wdXNoKCc0Jyk7MTAwOyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCczJyk7MTAwOyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMDI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkXCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMDY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgaWQ9XCJzZXQtY29sb3JcIiB0eXBlPVwiZHJhd19jb2xvdXJcIiB4PVwiMjBcIiB5PVwiMTAwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUJhY2t3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj40NTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMjk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTUwOyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEwMDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNTQ7IH07IGJ1Zi5wdXNoKCcnKTsxNTQ7IH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7OyBidWYucHVzaCgnICAnKTsxNTQ7IC8vIE5vIGJsb2NrcyBhcmUgcHJvdmlkZWQgZm9yIGxldmVscyAxIGFuZCAyLlxuOyBidWYucHVzaCgnICAnKTsxNTQ7IGlmIChsZXZlbCA9PSAzIHx8IGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MTU0OyAvLyBDYWxsIFwiZHJhdyBhIHNxdWFyZVwiLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3NxdWFyZVwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiMjBcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Jyk7MTU3OyBpZiAobGV2ZWwgPT0gMykgeyA7IGJ1Zi5wdXNoKCcxMDAnKTsxNTc7IH0gZWxzZSB7IDsgYnVmLnB1c2goJzUwJyk7MTU3OyB9IDsgYnVmLnB1c2goJzwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNjE7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICAnKTsxNjE7IC8vIFRocmVlLXNxdWFyZSBjb2RlLlxuOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiAgeD1cIjIwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayBpZD1cInNldC1jb2xvclwiIHR5cGU9XCJkcmF3X2NvbG91clwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4/Pz88L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxOTA7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCIyMFwiPlxcbiAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMTkxLCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxOTQ7IGlmIChsZXZlbCA9PSA2KSB7IDsgYnVmLnB1c2goJzUwJyk7MTk0OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCcxMCcpOzE5NDsgfSA7IGJ1Zi5wdXNoKCc8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4nKTsxOTk7IGlmIChsZXZlbCA9PSA2KSB7IDsgYnVmLnB1c2goJzkwJyk7MTk5OyB9IGVsc2UgeyA7IGJ1Zi5wdXNoKCcxMDAnKTsxOTk7IH0gOyBidWYucHVzaCgnPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfYV9zcXVhcmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MjEyOyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjEyOyBzcGlyYWwoMjUpOyBidWYucHVzaCgnICAnKTsyMTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNy41KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiB4PVwiMjBcIiB5PVwiMjBcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjI1MDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCB8fCBsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19hX3Nub3dtYW5cIiB4PVwiMjBcIiB5PVwiMjBcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE1MDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyMjY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIGlkPVwiZHJhdy13aWR0aFwiIHR5cGU9XCJkcmF3X3dpZHRoX2lubGluZVwiIHg9XCIxNThcIiB5PVwiNjdcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIldJRFRIXCI+MTwvdGl0bGU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0X2NvdW50ZXJcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI2NjsgfTsgYnVmLnB1c2goJycpOzI2NjsgfSBlbHNlIGlmIChwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICcpOzI2NjsgLy8gRGVmaW5lIFwiZHJhdyBhIHNxdWFyZVwiLlxuOyBidWYucHVzaCgnICAnLCAoMjY2LCAgcG9seWdvbih7XG4gICAgdGl0bGU6IG1zZy5kcmF3QVNxdWFyZSgpLFxuICAgIG1vZGlmaWVyczogKGxldmVsID09IDggPyAnJyA6ICd4PVwiMjIwXCIgeT1cIjQwXCInKSArICcgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInLFxuICAgIHNpZGVzOiA0LFxuICAgIGxlbmd0aDogKGxldmVsID49IDYgPyAwIDogMTAwKVxuICB9KSksICcgICcpOzI3MTsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7MjcxOyAvLyBEZWZpbmUgXCJkcmF3IGEgY2lyY2xlXCIuXG47IGJ1Zi5wdXNoKCcgICAgJywgKDI3MSwgIHBvbHlnb24oe1xuICAgICAgdGl0bGU6IG1zZy5kcmF3QUNpcmNsZSgpLFxuICAgICAgbW9kaWZpZXJzOiAneD1cIjIyMFwiIHk9XCIyNTBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIicsXG4gICAgICBzaWRlczogMzYwLFxuICAgICAgbGVuZ3RoOiAxXG4gICAgfSkpLCAnICAnKTsyNzY7IH07IGJ1Zi5wdXNoKCcgICcpOzI3NjsgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIyMFwiIHk9XCIyNTBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDI3NywgIG1zZy5kcmF3QVRyaWFuZ2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjc5OyB9IGVsc2UgaWYgKGxldmVsID49IDMpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7Mjc5OyAvLyAgRGVmaW5lIFwiZHJhdyBhIHRyaWFuZ2xlXCIuXG47IGJ1Zi5wdXNoKCcgICAgJywgKDI3OSwgIHBvbHlnb24oe1xuICAgICAgdGl0bGU6IG1zZy5kcmF3QVRyaWFuZ2xlKCksXG4gICAgICBtb2RpZmllcnM6IChsZXZlbCA9PSA4ID8gJycgOiAneD1cIjIyMFwiIHk9XCIyNTBcIicpICsgKGxldmVsID09IDYgPyAnJyA6ICcgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCInKSxcbiAgICAgIHNpZGVzOiAzLFxuICAgICAgbGVuZ3RoOiAobGV2ZWwgPj0gNyA/IDAgOiAxMDApXG4gICAgfSkpLCAnICAnKTsyODQ7IH07IGJ1Zi5wdXNoKCcgICcpOzI4NDsgaWYgKGxldmVsID09IDggKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgyODUsICBtc2cuZHJhd0FIb3VzZSgpICkpLCAnXCI+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDI4NiwgIG1zZy5sZW5ndGhQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTAwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyOTQ7IH07IGJ1Zi5wdXNoKCcgICcpOzI5NDsgaWYgKGxldmVsID09IDcgfHwgbGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICAnKTsyOTQ7IC8vICBEZWZpbmUgXCJkcmF3IGEgaG91c2VcIi5cbjsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiAnKTsyOTQ7IGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgneD1cIjIyMFwiIHk9XCI0NjBcIicpOzI5NDsgfTsgYnVmLnB1c2goJz4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICAnKTsyOTU7IGlmIChsZXZlbCA9PSA4KSB7IDsgYnVmLnB1c2goJzxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMjk1LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+Jyk7Mjk1OyB9OyBidWYucHVzaCgnICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDI5NiwgIG1zZy5kcmF3QUhvdXNlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDI5OSwgIG1zZy5kcmF3QVNxdWFyZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCgzMDAsICBtc2cubGVuZ3RoUGFyYW1ldGVyKCkgKSksICdcIi8+XFxuICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICcpOzMwMzsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzA0LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgJyk7MzA2OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICcpOzMwOTsgfTsgYnVmLnB1c2goJyAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAnKTszMTQ7IGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzE1LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAnKTszMTc7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICcpOzMyMDsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoMzMxLCAgbXNnLmRyYXdBVHJpYW5nbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMzMyLCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzMzNTsgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoMzM2LCAgbXNnLmxlbmd0aFBhcmFtZXRlcigpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgJyk7MzM4OyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICcpOzM0MTsgfTsgYnVmLnB1c2goJyAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM1MTsgfSAvLyBFbmQgb2YgcmVnaW9uIGluIHdoaWNoIFwiZHJhdyBhIHNxdWFyZVwiIGlzIGRlZmluZWQuXG47IGJ1Zi5wdXNoKCcnKTszNTE7IH0gZWxzZSBpZiAocGFnZSA9PSA0KSB7OyBidWYucHVzaCgnICAnKTszNTE7IGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj48L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjEyMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjIzMFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwidHJ1ZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiIG1vdmFibGU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mzk3OyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb2xvdXJfcmFuZG9tXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0MTk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDUyOyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzY8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4xMDA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MTIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ4NTsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzUwNzsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzU0MDsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPj8/PzwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzU4NDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4/Pz88L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVfYnlfY29uc3RhbnRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj4yMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+OTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVybl9ieV9jb25zdGFudFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjgwPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjI4OyB9IGVsc2UgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPj8/PzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZV9ieV9jb25zdGFudFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQUxVRVwiPjIwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5fYnlfY29uc3RhbnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFMVUVcIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+MjA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuX2J5X2NvbnN0YW50XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBTFVFXCI+Pz8/PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjcyOyB9OyBidWYucHVzaCgnJyk7NjcyOyB9IGVsc2UgaWYgKHBhZ2UgPT0gNSkgezsgYnVmLnB1c2goJyAgJyk7NjcyOyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4yMDA8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoNjk4LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj45MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzcxNjsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg3NDIsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEyMTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzc2MDsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yX2NvdW50ZXJcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjMwMDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfY29sb3VyXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg3ODYsICBtc2cubG9vcFZhcmlhYmxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfdHVyblwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEzNDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzgwNDsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJDT0xPVVJcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg4MTMsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDgxNCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MzY8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIyNzBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDgzOCwgIG1zZy5zdGVwKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoODQwLCAgbXNnLmRyYXdBQ2lyY2xlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NjA8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCg4NDksICBtc2cuc3RlcCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs4Njc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2Zvcl9jb3VudGVyXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCI3MFwiIHk9XCIyMFwiPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjQ8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj44PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NDwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X2NvbG91clwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQ09MT1VSXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg4OTMsICBtc2cuZHJhd0FDaXJjbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg4OTQsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoODk4LCAgbXNnLmxvb3BWYXJpYWJsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjM2PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiNzBcIiB5PVwiMzIwXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5MjAsICBtc2cuc3RlcCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDkyMiwgIG1zZy5kcmF3QUNpcmNsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjYwPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfbW92ZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+bW92ZUZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPicsIGVzY2FwZSgoOTMxLCAgbXNnLnN0ZXAoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7OTQ5OyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCIgeD1cIjcwXCIgeT1cIjIwXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDk1MCwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJ1wiPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NTEsICBtc2cuZGVwdGgoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg5NTIsICBtc2cuYnJhbmNoZXMoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+OTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJBUkcxXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MjwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCI3MFwiIHk9XCIxOTBcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk2NywgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDk2OCwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDk3MCwgIG1zZy5kcmF3QVRyZWUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfaWZcIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIklGMFwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibG9naWNfY29tcGFyZVwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5HVDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDk3OCwgIG1zZy5kZXB0aCgpICkpLCAnPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPMFwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19jb2xvdXJcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkNPTE9VUlwiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbG91cl9yYW5kb21cIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImRyYXdfcGVuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJQRU5cIj5wZW5Eb3duPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd19tb3ZlXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPm1vdmVGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJWQUxVRVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJPUFwiPk1VTFRJUExZPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj43PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJ2YXJpYWJsZXNfZ2V0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwMDksICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEzMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwMjYsICBtc2cuYnJhbmNoZXMoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiZHJhd190dXJuXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfYXJpdGhtZXRpY1wiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5ESVZJREU8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE4MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDQyLCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCgxMDQ5LCAgbXNnLmRyYXdBVHJlZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTA1MCwgIG1zZy5kZXB0aCgpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoMTA1MSwgIG1zZy5icmFuY2hlcygpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiT1BcIj5NSU5VUzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cInZhcmlhYmxlc19nZXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDEwNTgsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJCXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcxXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+JywgZXNjYXBlKCgxMDcwLCAgbXNnLmJyYW5jaGVzKCkgKSksICc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3R1cm5cIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIlZBTFVFXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj41MDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X3BlblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJQRU5cIj5wZW5VcDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJkcmF3X21vdmVcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5tb3ZlQmFja3dhcmQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVkFMVUVcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9hcml0aG1ldGljXCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk9QXCI+TVVMVElQTFk8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjc8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQlwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwidmFyaWFibGVzX2dldFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj4nLCBlc2NhcGUoKDExMDEsICBtc2cuZGVwdGgoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMTI1OyB9OyBidWYucHVzaCgnJyk7MTEyNTsgfTsgYnVmLnB1c2goJycpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogU2V0cyBCbG9ja2x5QXBwIGNvbnN0YW50cyB0aGF0IGRlcGVuZCBvbiB0aGUgcGFnZSBhbmQgbGV2ZWwuXG4gKiBUaGlzIGVuY2Fwc3VsYXRlcyBtYW55IGZ1bmN0aW9ucyB1c2VkIGZvciBTdHVkaW9BcHAucmVxdWlyZWRCbG9ja3NfLlxuICogSW4gdGhlIGZ1dHVyZSwgc29tZSBvZiB0aGVzZSBtYXkgYmUgbW92ZWQgdG8gY29tbW9uLmpzLlxuICovXG5cbnZhciByZXF1aXJlZEJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9yZXF1aXJlZF9ibG9ja191dGlscycpO1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfYV9zcXVhcmUgYmxvY2sgb24gcGFnZSAyLlxuZnVuY3Rpb24gZHJhd0FTcXVhcmUobnVtYmVyKSB7XG4gIHJldHVybiB7dGVzdDogJ2RyYXdfYV9zcXVhcmUnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgICB2YWx1ZXM6IHsnVkFMVUUnOiByZXF1aXJlZEJsb2NrVXRpbHMubWFrZU1hdGhOdW1iZXIobnVtYmVyKX19O1xufVxuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfYV9zbm93bWFuIGJsb2NrIG9uIHBhZ2UgMi5cbmZ1bmN0aW9uIGRyYXdBU25vd21hbihudW1iZXIpIHtcbiAgcmV0dXJuIHt0ZXN0OiAnZHJhd19hX3Nub3dtYW4nLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X2Ffc25vd21hbicsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKG51bWJlcil9fTtcbn1cblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsLlxudmFyIE1PVkVfRk9SV0FSRF9JTkxJTkUgPSB7dGVzdDogJ21vdmVGb3J3YXJkJywgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCd9O1xuXG4vLyBhbGxvdyBtb3ZlIGZvcndhcmQgb3IgYmFja3dhcmQsIGJ1dCBzaG93IGZvcndhcmQgYmxvY2sgaWYgdGhleSd2ZSBkb25lIG5laXRoZXJcbnZhciBNT1ZFX0ZPUldBUkRfT1JfQkFDS1dBUkRfSU5MSU5FID0ge1xuICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X21vdmVfYnlfY29uc3RhbnQnO1xuICB9LFxuICB0eXBlOiAnZHJhd19tb3ZlX2J5X2NvbnN0YW50J1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIGxpbWl0ZWQgXCJtb3ZlIGZvcndhcmRcIiBibG9jayB1c2VkIG9uIHRoZVxuLy8gZWFybGllciBsZXZlbHMgb2YgdGhlIHR1dG9yaWFsIHdpdGggdGhlIGdpdmVuIHBpeGVsIG51bWJlci5cbnZhciBtb3ZlRm9yd2FyZElubGluZSA9IGZ1bmN0aW9uKHBpeGVscykge1xuICByZXR1cm4ge3Rlc3Q6ICdtb3ZlRm9yd2FyZCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogcGl4ZWxzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgbGltaXRlZCBcIm1vdmUgZm9yd2FyZFwiIGJsb2NrIHVzZWQgb24gdGhlXG4vLyBlYXJsaWVyIGxldmVscyBvZiB0aGUgdHV0b3JpYWwuXG52YXIgTU9WRV9CQUNLV0FSRF9JTkxJTkUgPSB7dGVzdDogJ21vdmVCYWNrd2FyZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZV9ieV9jb25zdGFudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzOiB7J0RJUic6ICdtb3ZlQmFja3dhcmQnfX07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGEgW3JpZ2h0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9ja1xuLy8gYW5kIGNyZWF0ZXMgdGhlIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZC9yZWNvbW1lbmRlZCBudW1iZXIgb2YgZGVncmVlcyBhc1xuLy8gaXRzIGlucHV0LiAgVGhlIHJlc3RyaWN0ZWQgdHVybiBpcyB1c2VkIG9uIHRoZSBlYXJsaWVyIGxldmVscyBvZiB0aGVcbi8vIHR1dG9yaWFsLlxudmFyIHR1cm5SaWdodFJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7dGVzdDogJ3R1cm5SaWdodCgnLFxuICAgICAgICAgIHR5cGU6ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCcsXG4gICAgICAgICAgdGl0bGVzOiB7J1ZBTFVFJzogZGVncmVlc319O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYSBbbGVmdF0gZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQgYmxvY2tcbi8vIGFuZCBjcmVhdGVzIHRoZSBibG9jayB3aXRoIHRoZSBzcGVjaWZpZWQvcmVjb21tZW5kZWQgbnVtYmVyIG9mIGRlZ3JlZXMgYXNcbi8vIGl0cyBpbnB1dC4gIFRoZSByZXN0cmljdGVkIHR1cm4gaXMgdXNlZCBvbiB0aGUgZWFybGllciBsZXZlbHMgb2YgdGhlXG4vLyB0dXRvcmlhbC5cbnZhciB0dXJuTGVmdFJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7dGVzdDogJ3R1cm5MZWZ0KCcsXG4gICAgICAgICAgdHlwZTogJ2RyYXdfdHVybl9ieV9jb25zdGFudF9yZXN0cmljdGVkJyxcbiAgICAgICAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgW3JpZ2h0XSBkcmF3X3R1cm5fYnlfY29uc3RhbnQgYmxvY2tcbi8vIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuXG52YXIgdHVyblJpZ2h0QnlDb25zdGFudCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXN0OiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfdHVybl9ieV9jb25zdGFudCcgJiZcbiAgICAgICAgICAoZGVncmVlcyA9PT0gJz8/PycgfHxcbiAgICAgICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LnZhbHVlVG9Db2RlKFxuICAgICAgICAgICAgIGJsb2NrLCAnVkFMVUUnLCBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfTk9ORSkgPT0gZGVncmVlcyk7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50JyxcbiAgICB0aXRsZXM6IHsnVkFMVUUnOiBkZWdyZWVzfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFtyaWdodF0gZHJhd190dXJuIGJsb2NrIHdpdGggdGhlIHNwZWNpZmllZFxuLy8gbnVtYmVyIG9mIGRlZ3JlZXMgYXMgaXRzIGlucHV0LiAgRm9yIHRoZSBlYXJsaWVzdCBsZXZlbHMsIHRoZSBtZXRob2Rcbi8vIHR1cm5SaWdodFJlc3RyaWN0ZWQgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZC5cbnZhciB0dXJuUmlnaHQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm4nICYmXG4gICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ0RJUicpID09ICd0dXJuUmlnaHQnO1xuICAgICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5SaWdodCd9LFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcihkZWdyZWVzKX1cbiAgfTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIGEgbGVmdCBkcmF3X3R1cm4gYmxvY2sgd2l0aCB0aGUgc3BlY2lmaWVkXG4vLyBudW1iZXIgb2YgZGVncmVlcyBhcyBpdHMgaW5wdXQuICBUaGlzIG1ldGhvZCBpcyBub3QgYXBwcm9wcmlhdGUgZm9yIHRoZVxuLy8gZWFybGllc3QgbGV2ZWxzIG9mIHRoZSB0dXRvcmlhbCwgd2hpY2ggZG8gbm90IHByb3ZpZGUgZHJhd190dXJuLlxudmFyIHR1cm5MZWZ0ID0gZnVuY3Rpb24oZGVncmVlcykge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJyAmJlxuICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdESVInKSA9PSAndHVybkxlZnQnO1xuICAgICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuJyxcbiAgICB0aXRsZXM6IHsnRElSJzogJ3R1cm5MZWZ0J30sXG4gICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRlZ3JlZXMpfVxuICB9O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW55IGRyYXdfbW92ZSBibG9jayBhbmQsIGlmIG5vdCBwcmVzZW50LCBjcmVhdGVzXG4vLyBvbmUgd2l0aCB0aGUgc3BlY2lmaWVkIGRpc3RhbmNlLlxudmFyIG1vdmUgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICByZXR1cm4ge3Rlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7cmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2RyYXdfbW92ZSc7IH0sXG4gICAgICAgICAgdHlwZTogJ2RyYXdfbW92ZScsXG4gICAgICAgICAgdmFsdWVzOiB7J1ZBTFVFJzogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyKGRpc3RhbmNlKX19O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCBibG9jay5cbnZhciBkcmF3VHVyblJlc3RyaWN0ZWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gIHJldHVybiB7XG4gICAgdGVzdDogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdkcmF3X3R1cm5fYnlfY29uc3RhbnRfcmVzdHJpY3RlZCc7XG4gICAgfSxcbiAgICB0eXBlOiAnZHJhd190dXJuX2J5X2NvbnN0YW50X3Jlc3RyaWN0ZWQnLFxuICAgIHRpdGxlczogeydWQUxVRSc6IGRlZ3JlZXN9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIGRyYXdfdHVybiBibG9jay5cbnZhciBkcmF3VHVybiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnZHJhd190dXJuJztcbiAgICB9LFxuICAgIHR5cGU6ICdkcmF3X3R1cm4nLFxuICAgIHZhbHVlczogeydWQUxVRSc6IHJlcXVpcmVkQmxvY2tVdGlscy5tYWtlTWF0aE51bWJlcignPz8/Jyl9XG4gIH07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyBhIFwic2V0IGNvbG91clwiIGJsb2NrIHdpdGggYSBjb2xvdXIgcGlja2VyXG4vLyBhcyBpdHMgaW5wdXQuXG52YXIgU0VUX0NPTE9VUl9QSUNLRVIgPSB7dGVzdDogJ3BlbkNvbG91cihcXCcjJyxcbiAgdHlwZTogJ2RyYXdfY29sb3VyJyxcbiAgdmFsdWVzOiB7J0NPTE9VUic6ICc8YmxvY2sgdHlwZT1cImNvbG91cl9waWNrZXJcIj48L2Jsb2NrPid9fTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgYSBcInNldCBjb2xvdXJcIiBibG9jayB3aXRoIGEgcmFuZG9tIGNvbG91clxuLy8gZ2VuZXJhdG9yIGFzIGl0cyBpbnB1dC5cbnZhciBTRVRfQ09MT1VSX1JBTkRPTSA9IHt0ZXN0OiAncGVuQ29sb3VyKGNvbG91cl9yYW5kb20nLFxuICB0eXBlOiAnZHJhd19jb2xvdXInLFxuICB2YWx1ZXM6IHsnQ09MT1VSJzogJzxibG9jayB0eXBlPVwiY29sb3VyX3JhbmRvbVwiPjwvYmxvY2s+J319O1xuXG4vKipcbiAqIENyZWF0ZXMgYSByZXF1aXJlZCBibG9jayBzcGVjaWZpY2F0aW9uIGZvciBkZWZpbmluZyBhIGZ1bmN0aW9uIHdpdGggYW5cbiAqIGFyZ3VtZW50LiAgVW5saWtlIHRoZSBvdGhlciBmdW5jdGlvbnMgdG8gY3JlYXRlIHJlcXVpcmVkIGJsb2NrcywgdGhpc1xuICogaXMgZGVmaW5lZCBvdXRzaWRlIG9mIFR1cnRsZS5zZXRCbG9ja2x5QXBwQ29uc3RhbnRzIGJlY2F1c2UgaXQgaXMgYWNjZXNzZWRcbiAqIHdoZW4gY2hlY2tpbmcgZm9yIGEgcHJvY2VkdXJlIG9uIGxldmVscyA4LTkgb2YgVHVydGxlIDMuXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVuY19uYW1lIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhcmdfbmFtZSBUaGUgbmFtZSBvZiB0aGUgc2luZ2xlIGFyZ3VtZW50LlxuICogQHJldHVybiBBIHJlcXVpcmVkIGJsb2NrIHNwZWNpZmljYXRpb24gdGhhdCB0ZXN0cyBmb3IgYSBjYWxsIG9mIHRoZVxuICogICAgIHNwZWNpZmllZCBmdW5jdGlvbiB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnQgbmFtZS4gIElmIG5vdCBwcmVzZW50LFxuICogICAgIHRoaXMgY29udGFpbnMgdGhlIGluZm9ybWF0aW9uIHRvIGNyZWF0ZSBzdWNoIGEgYmxvY2sgZm9yIGRpc3BsYXkuXG4gKi9cbnZhciBkZWZpbmVXaXRoQXJnID0gZnVuY3Rpb24oZnVuY19uYW1lLCBhcmdfbmFtZSkge1xuICByZXR1cm4ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAncHJvY2VkdXJlc19kZWZub3JldHVybicgJiZcbiAgICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gZnVuY19uYW1lICYmXG4gICAgICAgICAgYmxvY2sucGFyYW1ldGVyTmFtZXNfICYmIGJsb2NrLnBhcmFtZXRlck5hbWVzXy5sZW5ndGggJiZcbiAgICAgICAgICBibG9jay5wYXJhbWV0ZXJOYW1lc19bMF0gPT0gYXJnX25hbWU7XG4gICAgfSxcbiAgICB0eXBlOiAncHJvY2VkdXJlc19kZWZub3JldHVybicsXG4gICAgdGl0bGVzOiB7J05BTUUnOiBmdW5jX25hbWV9LFxuICAgIGV4dHJhOiAnPG11dGF0aW9uPjxhcmcgbmFtZT1cIicgKyBhcmdfbmFtZSArICdcIj48L2FyZz48L211dGF0aW9uPidcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtYWtlTWF0aE51bWJlcjogcmVxdWlyZWRCbG9ja1V0aWxzLm1ha2VNYXRoTnVtYmVyLFxuICBzaW1wbGVCbG9jazogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrLFxuICByZXBlYXQ6IHJlcXVpcmVkQmxvY2tVdGlscy5yZXBlYXQsXG4gIGRyYXdBU3F1YXJlOiBkcmF3QVNxdWFyZSxcbiAgZHJhd0FTbm93bWFuOiBkcmF3QVNub3dtYW4sXG4gIE1PVkVfRk9SV0FSRF9JTkxJTkU6IE1PVkVfRk9SV0FSRF9JTkxJTkUsXG4gIE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkU6IE1PVkVfRk9SV0FSRF9PUl9CQUNLV0FSRF9JTkxJTkUsXG4gIG1vdmVGb3J3YXJkSW5saW5lOiBtb3ZlRm9yd2FyZElubGluZSxcbiAgTU9WRV9CQUNLV0FSRF9JTkxJTkU6IE1PVkVfQkFDS1dBUkRfSU5MSU5FLFxuICB0dXJuTGVmdFJlc3RyaWN0ZWQ6IHR1cm5MZWZ0UmVzdHJpY3RlZCxcbiAgdHVyblJpZ2h0UmVzdHJpY3RlZDogdHVyblJpZ2h0UmVzdHJpY3RlZCxcbiAgdHVyblJpZ2h0QnlDb25zdGFudDogdHVyblJpZ2h0QnlDb25zdGFudCxcbiAgdHVyblJpZ2h0OiB0dXJuUmlnaHQsXG4gIHR1cm5MZWZ0OiB0dXJuTGVmdCxcbiAgbW92ZTogbW92ZSxcbiAgZHJhd1R1cm5SZXN0cmljdGVkOiBkcmF3VHVyblJlc3RyaWN0ZWQsXG4gIGRyYXdUdXJuOiBkcmF3VHVybixcbiAgU0VUX0NPTE9VUl9QSUNLRVI6IFNFVF9DT0xPVVJfUElDS0VSLFxuICBTRVRfQ09MT1VSX1JBTkRPTTogU0VUX0NPTE9VUl9SQU5ET00sXG4gIGRlZmluZVdpdGhBcmc6IGRlZmluZVdpdGhBcmcsXG59O1xuIiwidmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIHtmdW5jOiAnbW92ZUZvcndhcmQnLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICdBcnRpc3QnLCBwYXJhbXM6IFtcIjEwMFwiXSB9LFxuICB7ZnVuYzogJ3R1cm5SaWdodCcsIHBhcmVudDogYXBpLCBjYXRlZ29yeTogJ0FydGlzdCcsIHBhcmFtczogW1wiOTBcIl0gfSxcbiAge2Z1bmM6ICdwZW5Db2xvdXInLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICdBcnRpc3QnLCBwYXJhbXM6IFtcIicjZmYwMDAwJ1wiXSB9LFxuICB7ZnVuYzogJ3BlbldpZHRoJywgcGFyZW50OiBhcGksIGNhdGVnb3J5OiAnQXJ0aXN0JywgcGFyYW1zOiBbXCIxXCJdIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICBBcnRpc3Q6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cInNsaWRlci1jZWxsXCI+XFxuICA8c3ZnIGlkPVwic2xpZGVyXCJcXG4gICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXFxuICAgICAgIHhtbG5zOnN2Zz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcXG4gICAgICAgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCJcXG4gICAgICAgdmVyc2lvbj1cIjEuMVwiXFxuICAgICAgIHdpZHRoPVwiMTUwXCJcXG4gICAgICAgaGVpZ2h0PVwiNTBcIj5cXG4gICAgICA8IS0tIFNsb3cgaWNvbi4gLS0+XFxuICAgICAgPGNsaXBQYXRoIGlkPVwic2xvd0NsaXBQYXRoXCI+XFxuICAgICAgICA8cmVjdCB3aWR0aD0yNiBoZWlnaHQ9MTIgeD01IHk9MTQgLz5cXG4gICAgICA8L2NsaXBQYXRoPlxcbiAgICAgIDxpbWFnZSB4bGluazpocmVmPVwiJywgZXNjYXBlKCgxMywgIGFzc2V0VXJsKGljb25QYXRoKSApKSwgJ1wiIGhlaWdodD00MiB3aWR0aD04NCB4PS0yMSB5PS0xMFxcbiAgICAgICAgICBjbGlwLXBhdGg9XCJ1cmwoI3Nsb3dDbGlwUGF0aClcIiAvPlxcbiAgICAgIDwhLS0gRmFzdCBpY29uLiAtLT5cXG4gICAgICA8Y2xpcFBhdGggaWQ9XCJmYXN0Q2xpcFBhdGhcIj5cXG4gICAgICAgIDxyZWN0IHdpZHRoPTI2IGhlaWdodD0xNiB4PTEyMCB5PTEwIC8+XFxuICAgICAgPC9jbGlwUGF0aD5cXG4gICAgICA8aW1hZ2UgeGxpbms6aHJlZj1cIicsIGVzY2FwZSgoMTksICBhc3NldFVybChpY29uUGF0aCkgKSksICdcIiBoZWlnaHQ9NDIgd2lkdGg9ODQgeD0xMjAgeT0tMTFcXG4gICAgICAgICAgY2xpcC1wYXRoPVwidXJsKCNmYXN0Q2xpcFBhdGgpXCIgLz5cXG4gIDwvc3ZnPlxcbiAgPGltZyBpZD1cInNwaW5uZXJcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIiBzcmM9XCInLCBlc2NhcGUoKDIyLCAgYXNzZXRVcmwoJ21lZGlhL3R1cnRsZS9sb2FkaW5nLmdpZicpICkpLCAnXCIgaGVpZ2h0PTE1IHdpZHRoPTE1PlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQSBzZXQgb2YgYmxvY2tzIHVzZWQgYnkgc29tZSBvZiBvdXIgY3VzdG9tIGxldmVscyAoaS5lLiBidWlsdCBieSBsZXZlbCBidWlsZGVyKVxuICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cblxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiBpbnN0YWxsRHJhd0FTcXVhcmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxDcmVhdGVBQ2lyY2xlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsQ3JlYXRlQVNub3dmbGFrZUJyYW5jaChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBVHJpYW5nbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QUhvdXNlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVNub3dmbGFrZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBSGV4YWdvbihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBU3RhcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUm9ib3QoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdBUGxhbmV0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd0FSaG9tYnVzKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbiBpbnN0YWxsRHJhd1VwcGVyV2F2ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG4gaW5zdGFsbERyYXdMb3dlcldhdmUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuXG4gaW5zdGFsbENyZWF0ZUFTbm93Zmxha2VEcm9wZG93bihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuXG52YXIgTEVOR1RIX1BBUkFNID0gbXNnLmxlbmd0aFBhcmFtZXRlcigpO1xuXG5mdW5jdGlvbiBjcmVhdGVBQ2lyY2xlQ29kZSAoc2l6ZSwgZ2Vuc3ltLCBpbmRlbnQpIHtcbiAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gIGluZGVudCA9IGluZGVudCB8fCAnJztcbiAgcmV0dXJuIFtcbiAgICBpbmRlbnQgKyAnLy8gY3JlYXRlX2FfY2lyY2xlJyxcbiAgICBpbmRlbnQgKyAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzY7ICcgK1xuICAgIGluZGVudCArICAgICAgIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgIGluZGVudCArICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgc2l6ZSArICcpOycsXG4gICAgaW5kZW50ICsgJyAgVHVydGxlLnR1cm5SaWdodCgxMCk7JyxcbiAgICBpbmRlbnQgKyAnfVxcbiddLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gaW5pdGlhbGl6YXRpb24gb2JqZWN0IHRoYXQgc2V0cyB1cCBibG9ja2x5IGF0dHJpYnV0ZXM7XG4gKlxuICogQHBhcmFtIHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBibG9jayB0aGF0IHdpbGwgYmUgdmlzaWJsZSB0byB0aGUgdXNlci5cbiAqIEBwYXJhbSBbcGFyYW1ldGVyXSAtIE9wdGlvbmFsIHBhcmFtZXRlciBmb3IgYmxvY2tzIHRoYXQgYWNjZXB0IGEgdmFsdWVcbiAqICAgIHBhcmFtZXRlci4gVGhpcyBpcyB0aGUgdGl0bGUgb2YgdGhlIHBhcmFtZXRlci5cbiAqIEByZXR1cm4gdGhlIGluaXRpYWxpemF0aW9uIG9iamVjdFxuICovXG5mdW5jdGlvbiBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgcGFyYW1ldGVyKSB7XG4gIHJldHVybiB7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG5cbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKHRpdGxlKTtcblxuICAgICAgaWYgKHBhcmFtZXRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kVmFsdWVJbnB1dCgnVkFMVUUnKVxuICAgICAgICAgICAgLnNldEFsaWduKEJsb2NrbHkuQUxJR05fUklHSFQpXG4gICAgICAgICAgICAuc2V0Q2hlY2soQmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpXG4gICAgICAgICAgICAuYXBwZW5kVGl0bGUocGFyYW1ldGVyICsgJzonKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFNhbWUgYXMgZHJhd19hX3NxdWFyZSwgZXhjZXB0IGlucHV0cyBhcmUgbm90IGlubGluZWRcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU3F1YXJlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIC8vIENyZWF0ZSBhIGZha2UgXCJkcmF3IGEgc3F1YXJlXCIgZnVuY3Rpb24gc28gaXQgY2FuIGJlIG1hZGUgYXZhaWxhYmxlIHRvIHVzZXJzXG4gIC8vIHdpdGhvdXQgYmVpbmcgc2hvd24gaW4gdGhlIHdvcmtzcGFjZS5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBU3F1YXJlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3NxdWFyZV9jdXN0b20gPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3NxdWFyZV9jdXN0b20gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkcmF3aW5nIGEgc3F1YXJlLlxuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAgICcvLyBkcmF3X2Ffc3F1YXJlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIGNyZWF0ZV9hX2NpcmNsZSBhbmQgY3JlYXRlX2FfY2lyY2xlX3NpemVcbiAqIGZpcnN0IGRlZmF1bHRzIHRvIHNpemUgMTAsIHNlY29uZCBwcm92aWRlcyBhIHNpemUgcGFyYW1cbiAqL1xuZnVuY3Rpb24gaW5zdGFsbENyZWF0ZUFDaXJjbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuY3JlYXRlQUNpcmNsZSgpO1xuICB2YXIgcGFyYW0gPSBtc2cuc2l6ZVBhcmFtZXRlcigpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmNyZWF0ZV9hX2NpcmNsZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9jaXJjbGVfc2l6ZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBwYXJhbSk7XG5cbiAgZ2VuZXJhdG9yLmNyZWF0ZV9hX2NpcmNsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjcmVhdGVBQ2lyY2xlQ29kZSgxMCwgZ2Vuc3ltKTtcbiAgfTtcblxuICBnZW5lcmF0b3IuY3JlYXRlX2FfY2lyY2xlX3NpemUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZSh0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICByZXR1cm4gY3JlYXRlQUNpcmNsZUNvZGUoc2l6ZSwgZ2Vuc3ltKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBjcmVhdGVfYV9zbm93Zmxvd2VyXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlQnJhbmNoKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmNyZWF0ZUFTbm93Zmxha2VCcmFuY2goKTtcblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUpO1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfYV9zbm93Zmxha2VfYnJhbmNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG4gICAgdmFyIGxvb3BWYXIyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnLy8gY3JlYXRlX2Ffc25vd2ZsYWtlX2JyYW5jaCcsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKDkwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICAgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgICAgVHVydGxlLnR1cm5SaWdodCg0NSk7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVCYWNrd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg0NSk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDQ1KTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByaG9tYnVzIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUmhvbWJ1cyhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVJob21idXMoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfcmhvbWJ1cyA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfcmhvbWJ1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHJldHVybiBbXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMjsgJyArXG4gICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoNjApOycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDEyMCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHRyaWFuZ2xlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBVHJpYW5nbGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FUcmlhbmdsZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV90cmlhbmdsZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfdHJpYW5nbGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDM7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSB0cmlhbmdsZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QUhleGFnb24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FIZXhhZ29uKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX2hleGFnb24gPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX2hleGFnb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICAnLy8gZHJhd19hX3RyaWFuZ2xlJyxcbiAgICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDY7ICcgK1xuICAgICAgICAgICAgICBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgICAnICBUdXJ0bGUudHVybkxlZnQoNjApOycsXG4gICAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIGhvdXNlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBSG91c2UoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FIb3VzZSgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9ob3VzZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfaG91c2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcbiAgICByZXR1cm4gW1xuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDQ7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMzsgJyArIGxvb3BWYXIgKyAnKyspIHsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDEyMCk7JyxcbiAgICAgICd9JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApO1xcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBmbG93ZXIgZnVuY3Rpb24gY2FsbCBibG9ja1xuICovXG5mdW5jdGlvbiBpbnN0YWxsRHJhd0FGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FGbG93ZXIoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2FfZmxvd2VyID0gbWFrZUJsb2NrSW5pdGlhbGl6ZXIodGl0bGUsIExFTkdUSF9QQVJBTSk7XG5cbiAgZ2VuZXJhdG9yLmRyYXdfYV9mbG93ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVfbGVuZ3RoID0gZ2VuZXJhdG9yLnZhbHVlVG9Db2RlKFxuICAgICAgICB0aGlzLCAnVkFMVUUnLCBnZW5lcmF0b3IuT1JERVJfQVRPTUlDKTtcbiAgICB2YXIgbG9vcFZhciA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHZhciBjb2xvcl9yYW5kb20gPSBnZW5lcmF0b3IuY29sb3VyX3JhbmRvbSgpWzBdO1xuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiMyMjhiMjJcIik7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDE4KTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDEwOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKCcgKyBjb2xvcl9yYW5kb20gKyAnKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5MZWZ0KDM2KTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnIC8gMik7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoJyArIHZhbHVlX2xlbmd0aCArICcvIDIpOycsXG4gICAgICAnfScsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCgxOTgpOycsXG4gICAgICAnVHVydGxlLmp1bXBGb3J3YXJkKCcgKyB2YWx1ZV9sZW5ndGggKyAnKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMTgwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgc25vd2ZsYWtlIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU25vd2ZsYWtlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBU25vd2ZsYWtlKCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3Nub3dmbGFrZSA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3Nub3dmbGFrZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgdmFyIGNvbG9yX3JhbmRvbSA9IGdlbmVyYXRvci5jb2xvdXJfcmFuZG9tKClbMF07XG4gICAgcmV0dXJuIFtcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA4OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKFwiIzdmZmZkNFwiKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDMwKTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgxNSk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnICBUdXJ0bGUucGVuQ29sb3VyKFwiIzAwMDBjZFwiKTsnLFxuICAgICAgJyAgVHVydGxlLm1vdmVGb3J3YXJkKDE1KTsnLFxuICAgICAgJyAgVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgzMCk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoNDUpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgYSBzdGFyIGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBU3RhcihibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVN0YXIoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2Ffc3RhciA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2Ffc3RhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDE4KTsnLFxuICAgICAgJ2ZvciAodmFyICcgKyBsb29wVmFyICsgJyA9IDA7ICcgKyBsb29wVmFyICsgJyA8IDU7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTQ0KTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuTGVmdCgxOCk7XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbi8qKlxuICogRHJhdyBhIHJvYm90IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUm9ib3QoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcblxuICB2YXIgdGl0bGUgPSBtc2cuZHJhd0FSb2JvdCgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2JvdCA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvYm90ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS50dXJuTGVmdCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCA0OyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoODApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCgxNSk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUJhY2t3YXJkKDQwKTsnLFxuICAgICAgJ1R1cnRsZS50dXJuUmlnaHQoMzApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDIxMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoNDApOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDYwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCgxMTUpOycsXG4gICAgICAnVHVydGxlLm1vdmVCYWNrd2FyZCg1MCk7JyxcbiAgICAgICdUdXJ0bGUudHVyblJpZ2h0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5tb3ZlRm9yd2FyZCg0MCk7JyxcbiAgICAgICdUdXJ0bGUudHVybkxlZnQoOTApOycsXG4gICAgICAnVHVydGxlLm1vdmVGb3J3YXJkKDUwKTtcXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSByb2JvdCBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3QVJvY2tldChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuXG4gIHZhciB0aXRsZSA9IG1zZy5kcmF3QVJvY2tldCgpO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmRyYXdfYV9yb2NrZXQgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19hX3JvY2tldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZV9sZW5ndGggPSBnZW5lcmF0b3IudmFsdWVUb0NvZGUoXG4gICAgICAgIHRoaXMsICdWQUxVRScsIGdlbmVyYXRvci5PUkRFUl9BVE9NSUMpO1xuICAgIHZhciBsb29wVmFyID0gZ2Vuc3ltKCdjb3VudCcpO1xuICAgIHZhciBsb29wVmFyMiA9IGdlbnN5bSgnY291bnQnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiNmZjAwMDBcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzOyAnICsgbG9vcFZhciArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ30nLFxuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMDAwXCIpOycsXG4gICAgICAnVHVydGxlLnR1cm5MZWZ0KDkwKTsnLFxuICAgICAgJ1R1cnRsZS5qdW1wRm9yd2FyZCgyMCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdUdXJ0bGUubW92ZUZvcndhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnVHVydGxlLnR1cm5SaWdodCg5MCk7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhcjIgKyAnID0gMDsgJyArIGxvb3BWYXIyICsgJyA8IDM7ICcgKyBsb29wVmFyMiArICcrKykgeycsXG4gICAgICAnICBUdXJ0bGUubW92ZUZvcndhcmQoMjApOycsXG4gICAgICAnICBUdXJ0bGUudHVybkxlZnQoMTIwKTsnLFxuICAgICAgJ31cXG4nXS5qb2luKCdcXG4nKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBEcmF3IGEgcGxhbmV0IGZ1bmN0aW9uIGNhbGwgYmxvY2tcbiAqL1xuZnVuY3Rpb24gaW5zdGFsbERyYXdBUGxhbmV0KGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdBUGxhbmV0KCk7XG5cbiAgYmxvY2tseS5CbG9ja3MuZHJhd19hX3BsYW5ldCA9IG1ha2VCbG9ja0luaXRpYWxpemVyKHRpdGxlLCBMRU5HVEhfUEFSQU0pO1xuXG4gIGdlbmVyYXRvci5kcmF3X2FfcGxhbmV0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cblxuICAgIHJldHVybiBbXG4gICAgICAnVHVydGxlLnBlbkNvbG91cihcIiM4MDgwODBcIik7JyxcbiAgICAgICdmb3IgKHZhciAnICsgbG9vcFZhciArICcgPSAwOyAnICsgbG9vcFZhciArICcgPCAzNjA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlQmFja3dhcmQoJyArIHZhbHVlX2xlbmd0aCArICcpOycsXG4gICAgICAnICBUdXJ0bGUudHVyblJpZ2h0KDEpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgdXBwZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3VXBwZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdVcHBlcldhdmUoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X3VwcGVyX3dhdmUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd191cHBlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuUmlnaHQoMTgpOycsXG4gICAgICAnfVxcbiddLmpvaW4oJ1xcbicpO1xuICB9O1xufVxuXG4vKipcbiAqIERyYXcgbG93ZXIgd2F2ZSBmdW5jdGlvbiBjYWxsIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGluc3RhbGxEcmF3TG93ZXJXYXZlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG5cbiAgdmFyIHRpdGxlID0gbXNnLmRyYXdMb3dlcldhdmUoKTtcblxuICBibG9ja2x5LkJsb2Nrcy5kcmF3X2xvd2VyX3dhdmUgPSBtYWtlQmxvY2tJbml0aWFsaXplcih0aXRsZSwgTEVOR1RIX1BBUkFNKTtcblxuICBnZW5lcmF0b3IuZHJhd19sb3dlcl93YXZlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlX2xlbmd0aCA9IGdlbmVyYXRvci52YWx1ZVRvQ29kZShcbiAgICAgICAgdGhpcywgJ1ZBTFVFJywgZ2VuZXJhdG9yLk9SREVSX0FUT01JQyk7XG4gICAgdmFyIGxvb3BWYXIgPSBnZW5zeW0oJ2NvdW50Jyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgJ1R1cnRsZS5wZW5Db2xvdXIoXCIjMDAwMGNkXCIpOycsXG4gICAgICAnZm9yICh2YXIgJyArIGxvb3BWYXIgKyAnID0gMDsgJyArIGxvb3BWYXIgKyAnIDwgMTA7ICcgKyBsb29wVmFyICsgJysrKSB7JyxcbiAgICAgICcgIFR1cnRsZS5tb3ZlRm9yd2FyZCgnICsgdmFsdWVfbGVuZ3RoICsgJyk7JyxcbiAgICAgICcgIFR1cnRsZS50dXJuTGVmdCgxOCk7JyxcbiAgICAgICd9XFxuJ10uam9pbignXFxuJyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxDcmVhdGVBU25vd2ZsYWtlRHJvcGRvd24oYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgdmFyIHNub3dmbGFrZXMgPSBbXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VTcXVhcmUoKSwgJ3NxdWFyZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlUGFyYWxsZWxvZ3JhbSgpLCAncGFyYWxsZWxvZ3JhbSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlTGluZSgpLCAnbGluZSddLFxuICAgIFttc2cuY3JlYXRlU25vd2ZsYWtlU3BpcmFsKCksICdzcGlyYWwnXSxcbiAgICBbbXNnLmNyZWF0ZVNub3dmbGFrZUZsb3dlcigpLCAnZmxvd2VyJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VGcmFjdGFsKCksICdmcmFjdGFsJ10sXG4gICAgW21zZy5jcmVhdGVTbm93Zmxha2VSYW5kb20oKSwgJ3JhbmRvbSddXG4gIF07XG5cblxuICBibG9ja2x5LkJsb2Nrcy5jcmVhdGVfc25vd2ZsYWtlX2Ryb3Bkb3duID0ge1xuICAgIC8vIFdlIHVzZSBjdXN0b20gaW5pdGlhbGl6YXRpb24gKGluc3RlYWQgb2YgbWFrZUJsb2NrSW5pdGlhbGl6ZXIpIGhlcmVcbiAgICAvLyBiZWNhdXNlIGVhY2ggaW5pdGlhbGl6YXRpb24gbmVlZHMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIEZpZWxkRHJvcGRvd24uXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVig5NCwgMC44NCwgMC42MCk7XG5cbiAgICAgIHZhciB0aXRsZSA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oc25vd2ZsYWtlcyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZSh0aXRsZSwgJ1RZUEUnKTtcblxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcCgnJyk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5jcmVhdGVfc25vd2ZsYWtlX2Ryb3Bkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBlID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdUWVBFJyk7XG4gICAgcmV0dXJuIFwiVHVydGxlLmRyYXdTbm93Zmxha2UoJ1wiICsgdHlwZSArIFwiJywgJ2Jsb2NrX2lkX1wiICsgdGhpcy5pZCArIFwiJyk7XCI7XG4gIH07XG59XG4iLCIvLyBsb2NhbGUgZm9yIHR1cnRsZVxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS50dXJ0bGVfbG9jYWxlO1xuIiwiLy8gQ3JlYXRlIGEgbGltaXRlZCBjb2xvdXIgcGFsZXR0ZSB0byBhdm9pZCBvdmVyd2hlbG1pbmcgbmV3IHVzZXJzXG4vLyBhbmQgdG8gbWFrZSBjb2xvdXIgY2hlY2tpbmcgZWFzaWVyLiAgVGhlc2UgZGVmaW5pdGlvbnMgY2Fubm90IGJlXG4vLyBtb3ZlZCB0byBibG9ja3MuanMsIHdoaWNoIGlzIGxvYWRlZCBsYXRlciwgc2luY2UgdGhleSBhcmUgdXNlZCBpblxuLy8gdG9wLWxldmVsIGRlZmluaXRpb25zIGJlbG93LiAgTm90ZSB0aGF0IHRoZSBoZXggZGlnaXRzIGEtZiBhcmVcbi8vIGxvd2VyLWNhc2UuICBUaGlzIGlzIGFzc3VtZWQgaW4gY29tcGFyaXNvbnMgYmVsb3cuXG52YXIgQ29sb3VycyA9IHtcbiAgQkxBQ0s6ICcjMDAwMDAwJyxcbiAgR1JFWTogJyM4MDgwODAnLFxuICBLSEFLSTogJyNjM2IwOTEnLFxuICBXSElURTogJyNmZmZmZmYnLFxuICBSRUQ6ICcjZmYwMDAwJyxcbiAgUElOSzogJyNmZjc3ZmYnLFxuICBPUkFOR0U6ICcjZmZhMDAwJyxcbiAgWUVMTE9XOiAnI2ZmZmYwMCcsXG4gIEdSRUVOOiAnIzIyOGIyMicsXG4gIEJMVUU6ICcjMDAwMGNkJyxcbiAgQVFVQU1BUklORTogJyM3ZmZmZDQnLFxuICBQTFVNOiAnIzg0MzE3OScsXG5cbiAgRlJPWkVOMTogXCIjZDBmZGZkXCIsXG4gIEZST1pFTjI6IFwiI2QwZmRkMFwiLFxuICBGUk9aRU4zOiBcIiNkMGQwZmRcIixcbiAgRlJPWkVONDogXCIjZTBlMGUwXCIsXG4gIEZST1pFTjU6ICcjZmZmZmZmJyxcbiAgRlJPWkVONjogXCIjZThlOGU4XCIsXG4gIEZST1pFTjc6IFwiI2JiZDFlNFwiLFxuICBGUk9aRU44OiBcIiNmZGQwZmRcIixcbiAgRlJPWkVOOTogXCIjYWVhNGZmXCJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3VycztcbiIsInZhciBBcnRpc3RBcGk7XG5cbmV4cG9ydHMuaW5qZWN0QXJ0aXN0QVBJID0gZnVuY3Rpb24gKGFydGlzdEFwaSkge1xuICBBcnRpc3RBcGkgPSBhcnRpc3RBcGk7XG59O1xuXG5leHBvcnRzLm1vdmVGb3J3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnRkQnLCBkaXN0YW5jZSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5tb3ZlQmFja3dhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydGRCcsIC1kaXN0YW5jZSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5tb3ZlVXAgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCAwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLm1vdmVEb3duID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMTgwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLm1vdmVMZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMjcwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLm1vdmVSaWdodCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDkwLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBVcCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDAsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuanVtcERvd24gPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAxODAsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuanVtcExlZnQgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAyNzAsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuanVtcFJpZ2h0ID0gZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgOTAsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuanVtcEZvcndhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydKRicsIGRpc3RhbmNlLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmp1bXBCYWNrd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ0pGJywgLWRpc3RhbmNlLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnR1cm5SaWdodCA9IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ1JUJywgYW5nbGUsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMudHVybkxlZnQgPSBmdW5jdGlvbihhbmdsZSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydSVCcsIC1hbmdsZSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5nbG9iYWxBbHBoYSA9IGZ1bmN0aW9uIChhbHBoYSkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydHQScsIGFscGhhLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnBlblVwID0gZnVuY3Rpb24oaWQpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUFUnLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLnBlbkRvd24gPSBmdW5jdGlvbihpZCkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydQRCcsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMucGVuV2lkdGggPSBmdW5jdGlvbih3aWR0aCkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydQVycsIE1hdGgubWF4KHdpZHRoLCAwKSwgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5wZW5Db2xvdXIgPSBmdW5jdGlvbihjb2xvdXIpIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUEMnLCBjb2xvdXIsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMucGVuUGF0dGVybiA9IGZ1bmN0aW9uKHBhdHRlcm4pIHtcbiAgQXJ0aXN0QXBpLmxvZy5wdXNoKFsnUFMnLCBwYXR0ZXJuLCBudWxsXSk7XG59O1xuXG5leHBvcnRzLmhpZGVUdXJ0bGUgPSBmdW5jdGlvbihpZCkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydIVCcsIG51bGxdKTtcbn07XG5cbmV4cG9ydHMuc2hvd1R1cnRsZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIEFydGlzdEFwaS5sb2cucHVzaChbJ1NUJywgbnVsbF0pO1xufTtcblxuZXhwb3J0cy5kcmF3U3RhbXAgPSBmdW5jdGlvbihzdGFtcCkge1xuICBBcnRpc3RBcGkubG9nLnB1c2goWydzdGFtcCcsIHN0YW1wLCBudWxsXSk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IFR1cnRsZSBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEzIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBTYW1wbGUgYW5zd2VycyBmb3IgVHVydGxlIGxldmVscy4gVXNlZCBmb3IgcHJvbXB0cyBhbmQgbWFya2luZy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBBcnRpc3RBUEkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaSA9IG5ldyBBcnRpc3RBUEkoKTtcblxudmFyIHNldFJhbmRvbVZpc2libGVDb2xvdXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG51bSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDIsIDI0KSk7XG4gIC8vIE1ha2Ugc3VyZSBhdCBsZWFzdCBvbmUgY29tcG9uZW50IGlzIGJlbG93IDB4ODAgYW5kIHRoZSByZXN0XG4gIC8vIGJlbG93IDB4QTAsIHRvIHByZXZlbnQgdG9vIGxpZ2h0IG9mIGNvbG91cnMuXG4gIG51bSAmPSAweDlmN2Y5ZjtcbiAgdmFyIGNvbG91ciA9ICcjJyArICgnMDAwMDAnICsgbnVtLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcbiAgYXBpLnBlbkNvbG91cihjb2xvdXIpO1xufTtcblxudmFyIGRyYXdTcXVhcmUgPSBmdW5jdGlvbihsZW5ndGgsIHJhbmRvbV9jb2xvdXIpIHtcbiAgZm9yICh2YXIgY291bnQgPSAwOyBjb3VudCA8IDQ7IGNvdW50KyspIHtcbiAgICBpZiAocmFuZG9tX2NvbG91cikge1xuICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgIH1cbiAgICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgfVxufTtcblxudmFyIGRyYXdUcmlhbmdsZSA9IGZ1bmN0aW9uKGxlbmd0aCwgcmFuZG9tX2NvbG91cikge1xuICBmb3IgKHZhciBjb3VudCA9IDA7IGNvdW50IDwgMzsgY291bnQrKykge1xuICAgIGlmIChyYW5kb21fY29sb3VyKSB7XG4gICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgfVxuICAgIGFwaS5tb3ZlRm9yd2FyZChsZW5ndGgpO1xuICAgIGFwaS50dXJuUmlnaHQoMTIwKTtcbiAgfVxufTtcblxudmFyIGRyYXdTbm93bWFuID0gZnVuY3Rpb24oaGVpZ2h0KSB7XG4gIGFwaS50dXJuTGVmdCg5MCk7XG4gIHZhciBkaXN0YW5jZXMgPSBbaGVpZ2h0ICogMC41LCBoZWlnaHQgKiAwLjMsIGhlaWdodCAqIDAuMl07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgdmFyIGRpc3RhbmNlID0gZGlzdGFuY2VzW2kgPCAzID8gaSA6IDUgLSBpXSAvIDU3LjU7XG4gICAgZm9yICh2YXIgZCA9IDA7IGQgPCAxODA7IGQgKz0gMikge1xuICAgICAgYXBpLm1vdmVGb3J3YXJkKGRpc3RhbmNlKTtcbiAgICAgIGFwaS50dXJuUmlnaHQoMik7XG4gICAgfVxuICAgIGlmIChpICE9IDIpIHtcbiAgICAgIGFwaS50dXJuUmlnaHQoMTgwKTtcbiAgICB9XG4gIH1cbiAgYXBpLnR1cm5MZWZ0KDkwKTtcbn07XG5cbnZhciBkcmF3SG91c2UgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgZHJhd1NxdWFyZShsZW5ndGgpO1xuICBhcGkubW92ZUZvcndhcmQobGVuZ3RoKTtcbiAgYXBpLnR1cm5SaWdodCgzMCk7XG4gIGRyYXdUcmlhbmdsZShsZW5ndGgpO1xuICBhcGkudHVyblJpZ2h0KDYwKTtcbiAgYXBpLm1vdmVGb3J3YXJkKGxlbmd0aCk7XG4gIGFwaS50dXJuTGVmdCg5MCk7XG4gIGFwaS5tb3ZlQmFja3dhcmQobGVuZ3RoKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG9nIG9mIGEgc2FtcGxlIHNvbHV0aW9ucyBmb3IgZWFjaCBsZXZlbC5cbiAqIFRvIGNyZWF0ZSBhbiBhbnN3ZXIsIGp1c3Qgc29sdmUgdGhlIGxldmVsIGluIEJsb2NrbHksIHRoZW4gcGFzdGUgdGhlXG4gKiByZXN1bHRpbmcgSmF2YVNjcmlwdCBoZXJlLCBtb3ZpbmcgYW55IGZ1bmN0aW9ucyB0byB0aGUgYmVnaW5uaW5nIG9mXG4gKiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnRzLmFuc3dlciA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIGFwaS5sb2cgPSBbXTtcbiAgdmFyIGNvdW50LCBzaWRlSWR4LCBsZW47XG4gIGlmIChwYWdlID09IDEpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIEVsLlxuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gU3F1YXJlLlxuICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwLCBmYWxzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBVc2UgcmVwZWF0IHRvIGRyYXcgYSBzcXVhcmUuXG4gICAgICAgIGRyYXdTcXVhcmUoMTAwLCBmYWxzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICAvLyBFcXVpbGF0ZXJhbCB0cmlhbmdsZS5cbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCwgdHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OlxuICAgICAgICAvLyBTaWRld2F5cyBlbnZlbG9wZS5cbiAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIC8vIFRyaWFuZ2xlIGFuZCBzcXVhcmUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBhcGkudHVyblJpZ2h0KDE4MCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIC8vIEdsYXNzZXMuXG4gICAgICAgIGFwaS5wZW5Db2xvdXIoJyMwMGNjMDAnKTsgIC8vIGJsdWVcbiAgICAgICAgYXBpLnR1cm5SaWdodCg5MCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYXBpLm1vdmVCYWNrd2FyZCgxNTApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICAvLyBTcGlreS5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgODsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgICBhcGkubW92ZUJhY2t3YXJkKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg0NSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIC8vIENpcmNsZS5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMzYwOyBjb3VudCsrKSB7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDEpO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGVsc2UgaWYgKHBhZ2UgPT0gMikge1xuICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gU2luZ2xlIHNxdWFyZSBpbiBzb21lIGNvbG9yLlxuICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgIGRyYXdTcXVhcmUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIFNpbmdsZSBncmVlbiBzcXVhcmUuXG4gICAgICAgIGFwaS5wZW5Db2xvdXIoJyMwMGZmMDAnKTsgIC8vIGdyZWVuXG4gICAgICAgIGRyYXdTcXVhcmUoNTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gVGhyZWUgc3F1YXJlcywgMTIwIGRlZ3JlZXMgYXBhcnQsIGluIHJhbmRvbSBjb2xvcnMuXG4gICAgICAgIGZvciAoY291bnQgPSAwOyBjb3VudCA8IDM7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMTIwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgLy8gMzYgc3F1YXJlcywgMTAgZGVncmVlcyBhcGFydCwgaW4gcmFuZG9tIGNvbG9ycy5cbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMzY7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1NxdWFyZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoMTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OiAgLy8gRHJhdyB3aXRob3V0IHVzaW5nIGZvci1sb29wLiAgKEZhbGwgdGhyb3VnaCB0byBuZXh0IGNhc2UuKVxuICAgICAgY2FzZSA2OlxuICAgICAgICAvLyBTcXVhcmVzIHdpdGggc2lkZXMgb2YgNTAsIDYwLCA3MCwgODAsIGFuZCA5MCBwaXhlbHMuXG4gICAgICAgIGZvciAobGVuID0gNTA7IGxlbiA8PSA5MDsgbGVuICs9IDEwKSB7XG4gICAgICAgICAgZHJhd1NxdWFyZShsZW4pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3OlxuICAgICAgICAvLyBNaW5pLXNwaXJhbC5cbiAgICAgICAgZm9yIChsZW4gPSAyNTsgbGVuIDw9IDYwOyBsZW4gKz0gNSkge1xuICAgICAgICAgIGFwaS5tb3ZlRm9yd2FyZChsZW4pO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA3LjU6XG4gICAgICAgIGRyYXdTbm93bWFuKDI1MCk7XG4gICAgICAgIGRyYXdTbm93bWFuKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4OlxuICAgICAgICAvLyBTYW1lLWhlaWdodCBzbm93bWVuLlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U25vd21hbigxNTApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICAgIGFwaS5qdW1wRm9yd2FyZCgxMDApO1xuICAgICAgICAgIGFwaS50dXJuTGVmdCg5MCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIC8vIERpZmZlcmVudCBoZWlnaHQgc25vd21lbi5cbiAgICAgICAgZm9yICh2YXIgaGVpZ2h0ID0gMTEwOyBoZWlnaHQgPj0gNzA7IGhlaWdodCAtPSAxMCkge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3U25vd21hbihoZWlnaHQpO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICAgIGFwaS5qdW1wRm9yd2FyZCg2MCk7XG4gICAgICAgICAgYXBpLnR1cm5MZWZ0KDkwKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7XG4gICAgc3dpdGNoIChsZXZlbCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBEcmF3IGEgc3F1YXJlLlxuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBEcmF3IGEgdHJpYW5nbGUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBkcmF3U3F1YXJlKDEwMCk7XG4gICAgICAgIGFwaS5tb3ZlRm9yd2FyZCgxMDApO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIC8vIERyYXcgYSBob3VzZSB1c2luZyBcImRyYXcgYSBzcXVhcmVcIiBhbmQgXCJkcmF3IGEgdHJpYW5nbGVcIi5cbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OlxuICAgICAgICAvLyBEcmF3IGEgaG91c2UgdXNpbmcgYSBmdW5jdGlvbi5cbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBhcGkubW92ZUZvcndhcmQoMTAwKTtcbiAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICBkcmF3VHJpYW5nbGUoMjAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIC8vIEFkZCBhIHBhcmFtZXRlciB0byB0aGUgXCJkcmF3IGEgaG91c2VcIiBwcm9jZWR1cmUuXG4gICAgICAgIGRyYXdIb3VzZSgxNTApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODpcbiAgICAgICAgZHJhd0hvdXNlKDEwMCk7XG4gICAgICAgIGRyYXdIb3VzZSgxNTApO1xuICAgICAgICBkcmF3SG91c2UoMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIGZvciAoY291bnQgPSA1MDsgY291bnQgPD0gMTUwOyBjb3VudCArPSA1MCkge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3SG91c2UoY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYWdlID09IDQpIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIC8vIERyYXcgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgLy8gRHJhdyB0d28gZXF1aWxhdGVyYWwgdHJpYW5nbGVzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAyOyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBEcmF3IGZvdXIgZXF1aWxhdGVyYWwgdHJpYW5nbGVzLlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCA0OyBjb3VudCsrKSB7XG4gICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgIGRyYXdUcmlhbmdsZSgxMDApO1xuICAgICAgICAgIGFwaS50dXJuUmlnaHQoOTApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICBkcmF3VHJpYW5nbGUoMTAwKTtcbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDM2KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMzY7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1RyaWFuZ2xlKDEwMCk7XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCgxMCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICBzZXRSYW5kb21WaXNpYmxlQ29sb3VyKCk7XG4gICAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGZvciAoc2lkZUlkeCA9IDA7IHNpZGVJZHggPCA0OyBzaWRlSWR4KyspIHtcbiAgICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDkwKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIGZvciAoc2lkZUlkeCA9IDA7IHNpZGVJZHggPCA0OyBzaWRlSWR4KyspIHtcbiAgICAgICAgICBmb3IgKGNvdW50ID0gMDsgY291bnQgPCAxMDsgY291bnQrKykge1xuICAgICAgICAgICAgc2V0UmFuZG9tVmlzaWJsZUNvbG91cigpO1xuICAgICAgICAgICAgZHJhd1NxdWFyZSgyMCk7XG4gICAgICAgICAgICBhcGkubW92ZUZvcndhcmQoMjApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcGkudHVyblJpZ2h0KDgwKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDEwOlxuICAgICAgICBmb3IgKHNpZGVJZHggPSAwOyBzaWRlSWR4IDwgOTsgc2lkZUlkeCsrKSB7XG4gICAgICAgICAgZm9yIChjb3VudCA9IDA7IGNvdW50IDwgMTA7IGNvdW50KyspIHtcbiAgICAgICAgICAgIHNldFJhbmRvbVZpc2libGVDb2xvdXIoKTtcbiAgICAgICAgICAgIGRyYXdTcXVhcmUoMjApO1xuICAgICAgICAgICAgYXBpLm1vdmVGb3J3YXJkKDIwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXBpLnR1cm5SaWdodCg4MCk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXBpLmxvZztcbn07XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgQXJ0aXN0IEFQSSBsb2dpYy4gVGhlIG1ldGhvZHMgb24gdGhpcyBvYmplY3QgYXJlIGNhbGxlZCBieVxuICogZ2VuZXJhdGVkIHVzZXIgY29kZS4gQXMgdGhleSBhcmUgY2FsbGVkLCB0aGV5IGluc2VydCBjb21tYW5kcyBpbnRvIHRoaXMubG9nLlxuICogTk9URTogdGhpcy5sb2cgaXMgYWxzbyBtb2RpZmllZCBpbiBzb21lIGNhc2VzIGV4dGVybmFsbHkgKGJvdGggYWNjZXNzZWQgYW5kXG4gKiBJIHRoaW5rIGNsZWFyZWQpLlxuICovXG52YXIgQXJ0aXN0QVBJID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmxvZyA9IFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnRpc3RBUEk7XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZHJhd0NpcmNsZSA9IGZ1bmN0aW9uIChzaXplLCBpZCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM2OyBpKyspIHtcbiAgICB0aGlzLm1vdmVGb3J3YXJkKHNpemUsIGlkKTtcbiAgICB0aGlzLnR1cm5SaWdodCgxMCwgaWQpO1xuICB9XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmRyYXdTbm93Zmxha2UgPSBmdW5jdGlvbiAodHlwZSwgaWQpIHtcbiAgdmFyIGksIGosIGs7XG5cbiAgLy8gbWlyb3JzIEJsb2NrbHkuSmF2YVNjcmlwdC5jb2xvdXJfcmFuZG9tLlxuICB2YXIgcmFuZG9tX2NvbG91ciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29sb3JzID0gQmxvY2tseS5GaWVsZENvbG91ci5DT0xPVVJTO1xuICAgIHJldHVybiBjb2xvcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNvbG9ycy5sZW5ndGgpXTtcbiAgfTtcblxuICBpZiAodHlwZSA9PT0gJ3JhbmRvbScpIHtcbiAgICB0eXBlID0gXy5zYW1wbGUoWydmcmFjdGFsJywgJ2Zsb3dlcicsICdzcGlyYWwnLCAnbGluZScsICdwYXJhbGxlbG9ncmFtJywgJ3NxdWFyZSddKTtcbiAgfVxuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSAnZnJhY3RhbCc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIHRoaXMuanVtcEZvcndhcmQoNDUsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuTGVmdCg0NSwgaWQpO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgMzsgaisrKSB7XG4gICAgICAgICAgZm9yIChrID0gMDsgayA8IDM7IGsrKykge1xuICAgICAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCgxNSwgaWQpO1xuICAgICAgICAgICAgdGhpcy5tb3ZlQmFja3dhcmQoMTUsIGlkKTtcbiAgICAgICAgICAgIHRoaXMudHVyblJpZ2h0KDQ1LCBpZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudHVybkxlZnQoOTAsIGlkKTtcbiAgICAgICAgICB0aGlzLm1vdmVCYWNrd2FyZCgxNSwgaWQpO1xuICAgICAgICAgIHRoaXMudHVybkxlZnQoNDUsIGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR1cm5SaWdodCg5MCwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdmbG93ZXInOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICB0aGlzLmRyYXdDaXJjbGUoMiwgaWQpO1xuICAgICAgICB0aGlzLmRyYXdDaXJjbGUoNCwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5SaWdodCg3MiwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdzcGlyYWwnOlxuICAgICAgZm9yIChpID0gMDsgaSA8IDIwOyBpKyspIHtcbiAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKDMsIGlkKTtcbiAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCgyMCwgaWQpO1xuICAgICAgICB0aGlzLnR1cm5SaWdodCgxOCwgaWQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdsaW5lJzpcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA5MDsgaSsrKSB7XG4gICAgICAgIHRoaXMucGVuQ29sb3VyKHJhbmRvbV9jb2xvdXIoKSk7XG4gICAgICAgIHRoaXMubW92ZUZvcndhcmQoNTAsIGlkKTtcbiAgICAgICAgdGhpcy5tb3ZlQmFja3dhcmQoNTAsIGlkKTtcbiAgICAgICAgdGhpcy50dXJuUmlnaHQoNCwgaWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5wZW5Db2xvdXIoXCIjRkZGRkZGXCIsIGlkKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncGFyYWxsZWxvZ3JhbSc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgMjsgaisrKSB7XG4gICAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCg1MCwgaWQpO1xuICAgICAgICAgIHRoaXMudHVyblJpZ2h0KDYwLCBpZCk7XG4gICAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCg1MCwgaWQpO1xuICAgICAgICAgIHRoaXMudHVyblJpZ2h0KDEyMCwgaWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHVyblJpZ2h0KDM2LCBpZCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgICAgdGhpcy5tb3ZlRm9yd2FyZCg1MCwgaWQpO1xuICAgICAgICAgIHRoaXMudHVyblJpZ2h0KDkwLCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50dXJuUmlnaHQoMzYsIGlkKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZUZvcndhcmQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0ZEJywgZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVCYWNrd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnRkQnLCAtZGlzdGFuY2UsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLm1vdmVVcCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnTVYnLCBkaXN0YW5jZSwgMCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZURvd24gPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDE4MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZUxlZnQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ01WJywgZGlzdGFuY2UsIDI3MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUubW92ZVJpZ2h0ID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydNVicsIGRpc3RhbmNlLCA5MCwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcFVwID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRCcsIGRpc3RhbmNlLCAwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wRG93biA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMTgwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wTGVmdCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkQnLCBkaXN0YW5jZSwgMjcwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wUmlnaHQgPSBmdW5jdGlvbihkaXN0YW5jZSwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ0pEJywgZGlzdGFuY2UsIDkwLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5qdW1wRm9yd2FyZCA9IGZ1bmN0aW9uKGRpc3RhbmNlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSkYnLCBkaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuanVtcEJhY2t3YXJkID0gZnVuY3Rpb24oZGlzdGFuY2UsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydKRicsIC1kaXN0YW5jZSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUudHVyblJpZ2h0ID0gZnVuY3Rpb24oYW5nbGUsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydSVCcsIGFuZ2xlLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS50dXJuTGVmdCA9IGZ1bmN0aW9uKGFuZ2xlLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUlQnLCAtYW5nbGUsIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmdsb2JhbEFscGhhID0gZnVuY3Rpb24gKGFscGhhLCBpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnR0EnLCBhbHBoYSwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuVXAgPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnUFUnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5Eb3duID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BEJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuV2lkdGggPSBmdW5jdGlvbih3aWR0aCwgaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1BXJywgTWF0aC5tYXgod2lkdGgsIDApLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5wZW5Db2xvdXIgPSBmdW5jdGlvbihjb2xvdXIsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQQycsIGNvbG91ciwgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUucGVuUGF0dGVybiA9IGZ1bmN0aW9uKHBhdHRlcm4sIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydQUycsIHBhdHRlcm4sIGlkXSk7XG59O1xuXG5BcnRpc3RBUEkucHJvdG90eXBlLmhpZGVUdXJ0bGUgPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmxvZy5wdXNoKFsnSFQnLCBpZF0pO1xufTtcblxuQXJ0aXN0QVBJLnByb3RvdHlwZS5zaG93VHVydGxlID0gZnVuY3Rpb24oaWQpIHtcbiAgdGhpcy5sb2cucHVzaChbJ1NUJywgaWRdKTtcbn07XG5cbkFydGlzdEFQSS5wcm90b3R5cGUuZHJhd1N0YW1wID0gZnVuY3Rpb24oc3RhbXAsIGlkKSB7XG4gIHRoaXMubG9nLnB1c2goWydzdGFtcCcsIHN0YW1wLCBpZF0pO1xufTtcbiJdfQ==
