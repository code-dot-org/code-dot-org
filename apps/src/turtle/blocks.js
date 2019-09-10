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

var Colours = require('./colours');
var msg = require('./locale');
var commonMsg = require('@cdo/locale');
var customLevelBlocks = require('./customLevelBlocks');
import {Position} from '../constants';

const RANDOM_VALUE = 'RAND';

const POSITION_VALUES = [
  [commonMsg.positionRandom(), RANDOM_VALUE],
  [commonMsg.positionTopLeft(), Position.TOPLEFT.toString()],
  [commonMsg.positionTopCenter(), Position.TOPCENTER.toString()],
  [commonMsg.positionTopRight(), Position.TOPRIGHT.toString()],
  [commonMsg.positionMiddleLeft(), Position.MIDDLELEFT.toString()],
  [commonMsg.positionMiddleCenter(), Position.MIDDLECENTER.toString()],
  [commonMsg.positionMiddleRight(), Position.MIDDLERIGHT.toString()],
  [commonMsg.positionBottomLeft(), Position.BOTTOMLEFT.toString()],
  [commonMsg.positionBottomCenter(), Position.BOTTOMCENTER.toString()],
  [commonMsg.positionBottomRight(), Position.BOTTOMRIGHT.toString()]
];

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  if (skin.id === 'anna' || skin.id === 'elsa') {
    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [
      Colours.FROZEN1,
      Colours.FROZEN2,
      Colours.FROZEN3,
      Colours.FROZEN4,
      Colours.FROZEN5,
      Colours.FROZEN6,
      Colours.FROZEN7,
      Colours.FROZEN8,
      Colours.FROZEN9
    ];
    blockly.FieldColour.COLUMNS = 3;
  } else {
    // Create a smaller palette.
    blockly.FieldColour.COLOURS = [
      // Row 1.
      Colours.BLACK,
      Colours.GREY,
      Colours.KHAKI,
      Colours.WHITE,
      // Row 2.
      Colours.RED,
      Colours.PINK,
      Colours.ORANGE,
      Colours.YELLOW,
      // Row 3.
      Colours.GREEN,
      Colours.BLUE,
      Colours.AQUAMARINE,
      Colours.PLUM
    ];
    blockly.FieldColour.COLUMNS = 4;
  }

  // Block definitions.
  blockly.Blocks.draw_move_by_constant = {
    // Block for moving forward or backward the internal number of pixels.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldTextInput(
            '100',
            blockly.FieldTextInput.numberValidator
          ),
          'VALUE'
        )
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
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS),
        'DIR'
      );
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
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };
  generator.draw_move_by_constant_dropdown = generator.draw_move_by_constant;

  blockly.Blocks.draw_turn_by_constant_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldAngleDropdown({
            directionTitleName: 'DIR',
            menuGenerator: this.VALUE
          }),
          'VALUE'
        )
        .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_by_constant_restricted.VALUE = [
    30,
    45,
    60,
    90,
    120,
    135,
    150,
    180
  ].map(function(t) {
    return [String(t), String(t)];
  });

  generator.draw_turn_by_constant_restricted = function() {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.draw_turn_by_constant = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldAngleTextInput('90', {
            directionTitle: 'DIR'
          }),
          'VALUE'
        )
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
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldAngleDropdown({
            directionTitleName: 'DIR'
          }),
          'VALUE'
        )
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
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };
  generator.draw_turn_by_constant_dropdown = generator.draw_turn_by_constant;

  generator.draw_move_inline = function() {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.draw_turn_inline_restricted = {
    // Block for turning either left or right from among a fixed set of angles.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldAngleDropdown({
            directionTitleName: 'DIR',
            menuGenerator: this.VALUE
          }),
          'VALUE'
        )
        .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn_inline_restricted.VALUE = [
    30,
    45,
    60,
    90,
    120,
    135,
    150,
    180
  ].map(function(t) {
    return [String(t), String(t)];
  });

  generator.draw_turn_inline_restricted = function() {
    // Generate JavaScript for turning either left or right from among a fixed
    // set of angles.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.draw_turn_inline = {
    // Block for turning left or right any number of degrees.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldAngleTextInput('90', {
            directionTitle: 'DIR'
          }),
          'VALUE'
        )
        .appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  function createPointToBlocks(onInit) {
    return {
      helpUrl: '',
      init: function() {
        this.setHSV(184, 1.0, 0.74);
        this.setPreviousStatement(true);
        this.setInputsInline(true);
        this.setNextStatement(true);
        this.setTooltip(msg.pointTo());
        this.appendDummyInput().appendTitle(msg.pointTo());
        if (onInit) {
          onInit(this);
        }
      }
    };
  }

  blockly.Blocks.point_to = createPointToBlocks(function(block) {
    // Block for pointing to a specified direction
    block
      .appendDummyInput()
      .appendTitle(
        new blockly.FieldAngleTextInput('0', {
          direction: 'turnRight'
        }),
        'DIRECTION'
      )
      .appendTitle(msg.degrees());
  });

  generator.point_to = function() {
    let value = window.parseFloat(this.getTitleValue('DIRECTION')) || 0;
    return `Turtle.pointTo(${value}, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.point_to_param = createPointToBlocks(function(block) {
    // Block for pointing to a specified direction
    block
      .appendValueInput('VALUE')
      .setCheck(blockly.BlockValueType.NUMBER)
      .addFieldHelper(blockly.BlockFieldHelper.ANGLE_HELPER, {
        block,
        direction: 'turnRight'
      });
    block.appendDummyInput().appendTitle(msg.degrees());
  });

  generator.point_to_param = function() {
    let value = generator.valueToCode(
      this,
      'VALUE',
      Blockly.JavaScript.ORDER_NONE
    );
    return `Turtle.pointTo(${value}, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.point_to_by_constant_restricted = createPointToBlocks(function(
    block
  ) {
    block
      .appendDummyInput()
      .appendTitle(
        new blockly.FieldAngleDropdown({
          direction: 'turnRight',
          menuGenerator: block.VALUE
        }),
        'VALUE'
      )
      .appendTitle(msg.degrees());
  });

  blockly.Blocks.point_to_by_constant_restricted.VALUE = [
    0,
    30,
    45,
    60,
    90,
    120,
    135,
    150,
    180
  ].map(function(t) {
    return [String(t), String(t)];
  });

  generator.point_to_by_constant_restricted = function() {
    let value = window.parseFloat(this.getTitleValue('VALUE'));
    return `Turtle.pointTo(${value}, 'block_id_${this.id}');\n`;
  };

  generator.draw_turn_inline = function() {
    // Generate JavaScript for turning left or right.
    var value = window.parseFloat(this.getTitleValue('VALUE'));
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.variables_get_counter = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(new blockly.FieldLabel(msg.loopVariable()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: Blockly.Variables.getVars
  };

  generator.variables_get_counter = generator.variables_get;

  blockly.Blocks.variables_get_length = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(new blockly.FieldLabel(msg.lengthParameter()), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: Blockly.Variables.getVars
  };

  generator.variables_get_length = generator.variables_get;

  blockly.Blocks.variables_get_sides = {
    // Variable getter.
    category: null, // Variables are handled specially.
    helpUrl: blockly.Msg.VARIABLES_GET_HELPURL,
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.VARIABLES_GET_TITLE)
        .appendTitle(new blockly.FieldLabel('sides'), 'VAR');
      this.setOutput(true);
      this.setTooltip(blockly.Msg.VARIABLES_GET_TOOLTIP);
    },
    getVars: Blockly.Variables.getVars
  };

  generator.variables_get_sides = generator.variables_get;

  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.6);
      this.appendDummyInput().appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE')
        .setAlign(blockly.ALIGN_RIGHT)
        .setCheck(blockly.BlockValueType.NUMBER)
        .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square = function() {
    // Generate JavaScript for drawing a square.
    var value_length =
      generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC) || 0;
    var loopVar = gensym('count');
    return [
      // The generated comment helps detect required blocks.
      // Don't change it without changing requiredBlocks_.
      '// draw_a_square',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(90);',
      '}\n'
    ].join('\n');
  };

  // Create a fake "draw a snowman" function so it can be made available to
  // users without being shown in the workspace.
  blockly.Blocks.draw_a_snowman = {
    // Draw a circle in front of the turtle, ending up on the opposite side.
    init: function() {
      this.setHSV(94, 0.84, 0.6);
      this.appendDummyInput().appendTitle(msg.drawASnowman());
      this.appendValueInput('VALUE')
        .setAlign(blockly.ALIGN_RIGHT)
        .setCheck(blockly.BlockValueType.NUMBER)
        .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowman = function() {
    // Generate JavaScript for drawing a snowman in front of the turtle.
    var value = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    var distancesVar = gensym('distances');
    var loopVar = gensym('counter');
    var degreeVar = gensym('degree');
    var distanceVar = gensym('distance');
    return [
      // The generated comment helps detect required blocks.
      // Don't change it without changing requiredBlocks_.
      '// draw_a_snowman',
      'Turtle.turnLeft(90);',
      'var ' +
        distancesVar +
        ' = [' +
        value +
        ' * 0.5, ' +
        value +
        ' * 0.3,' +
        value +
        ' * 0.2];',
      'for (var ' +
        loopVar +
        ' = 0; ' +
        loopVar +
        ' < 6; ' +
        loopVar +
        '++) {\n',
      '  var ' +
        distanceVar +
        ' = ' +
        distancesVar +
        '[' +
        loopVar +
        ' < 3 ? ' +
        loopVar +
        ': 5 - ' +
        loopVar +
        '] / 57.5;',
      '  for (var ' +
        degreeVar +
        ' = 0; ' +
        degreeVar +
        ' < 90; ' +
        degreeVar +
        '++) {',
      '    Turtle.moveForward(' + distanceVar + ');',
      '    Turtle.turnRight(2);',
      '  }',
      '  if (' + loopVar + ' !== 2) {',
      '    Turtle.turnLeft(180);',
      '  }',
      '}',
      'Turtle.turnLeft(90);\n'
    ].join('\n');
  };

  // This is a modified copy of blockly.Blocks.controls_for with the
  // variable named "counter" hardcoded.
  blockly.Blocks.controls_for_counter = {
    // For loop with hardcoded loop variable.
    helpUrl: blockly.Msg.CONTROLS_FOR_HELPURL,
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_FOR_INPUT_WITH)
        .appendTitle(new blockly.FieldLabel(msg.loopVariable()), 'VAR');
      this.interpolateMsg(
        blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY,
        ['FROM', 'Number', blockly.ALIGN_RIGHT],
        ['TO', 'Number', blockly.ALIGN_RIGHT],
        ['BY', 'Number', blockly.ALIGN_RIGHT],
        blockly.ALIGN_RIGHT
      );
      this.appendStatementInput('DO').appendTitle(
        Blockly.Msg.CONTROLS_FOR_INPUT_DO
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setInputsInline(true);
      this.setTooltip(
        blockly.Msg.CONTROLS_FOR_TOOLTIP.replace(
          '%1',
          this.getTitleValue('VAR')
        )
      );
    },
    getVars: Blockly.Variables.getVars,
    // serialize the counter variable name to xml so that it can be used across
    // different locales
    mutationToDom: function() {
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
      this.setHSV(184, 1.0, 0.74);
      this.interpolateMsg(
        msg.moveDirectionByPixels(),
        () => {
          this.appendDummyInput().appendTitle(
            new blockly.FieldDropdown(blockly.Blocks.draw_move.DIRECTIONS),
            'DIR'
          );
        },
        ['VALUE', 'Number', blockly.ALIGN_RIGHT],
        blockly.ALIGN_RIGHT
      );
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.draw_move.DIRECTIONS = [
    [msg.forward(), 'moveForward'],
    [msg.backward(), 'moveBackward']
  ];

  generator.draw_move = function() {
    // Generate JavaScript for moving forward or backwards.
    var value =
      generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.jump = {
    // Block for moving forward or backwards.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendValueInput('VALUE')
        .setCheck(blockly.BlockValueType.NUMBER)
        .appendTitle(
          new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS),
          'DIR'
        );
      this.appendDummyInput().appendTitle(msg.dots());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  var longMoveLengthDropdownValue = 'LONG_MOVE_LENGTH';
  var shortMoveLengthDropdownValue = 'SHORT_MOVE_LENGTH';
  var longDiagonalMoveLengthDropdownValue = 'LONG_DIAGONAL_MOVE_LENGTH';
  var shortDiagonalMoveLengthDropdownValue = 'SHORT_DIAGONAL_MOVE_LENGTH';
  var defaultMoveLength = 50;
  var defaultDiagonalMoveLength = defaultMoveLength * Math.sqrt(2);
  var simpleLengthChoices = [
    [skin.longLineDraw, longMoveLengthDropdownValue],
    [skin.shortLineDraw, shortMoveLengthDropdownValue]
  ];
  var simpleDiagonalLengthChoices = [
    [skin.longLineDraw, longDiagonalMoveLengthDropdownValue],
    [skin.shortLineDraw, shortDiagonalMoveLengthDropdownValue]
  ];
  var simpleLengthRightChoices = [
    [skin.longLineDrawRight, longMoveLengthDropdownValue],
    [skin.shortLineDrawRight, shortMoveLengthDropdownValue]
  ];

  var SimpleMove = {
    SHORT_MOVE_LENGTH: 50,
    LONG_MOVE_LENGTH: 100,
    SHORT_DIAGONAL_MOVE_LENGTH: 50 * Math.sqrt(2),
    LONG_DIAGONAL_MOVE_LENGTH: 100 * Math.sqrt(2),
    DIRECTION_CONFIGS: {
      left: {
        title: commonMsg.directionWestLetter(),
        moveFunction: 'moveLeft',
        tooltip: msg.moveWestTooltip(),
        image: skin.westLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices,
        defaultLength: defaultMoveLength,
        defaultDropdownValue: longMoveLengthDropdownValue
      },
      right: {
        title: commonMsg.directionEastLetter(),
        moveFunction: 'moveRight',
        tooltip: msg.moveEastTooltip(),
        image: skin.eastLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthRightChoices,
        defaultLength: defaultMoveLength,
        defaultDropdownValue: longMoveLengthDropdownValue
      },
      up: {
        title: commonMsg.directionNorthLetter(),
        moveFunction: 'moveUp',
        tooltip: msg.moveNorthTooltip(),
        image: skin.northLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices,
        defaultLength: defaultMoveLength,
        defaultDropdownValue: longMoveLengthDropdownValue
      },
      down: {
        title: commonMsg.directionSouthLetter(),
        moveFunction: 'moveDown',
        tooltip: msg.moveSouthTooltip(),
        image: skin.southLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleLengthChoices,
        defaultLength: defaultMoveLength,
        defaultDropdownValue: longMoveLengthDropdownValue
      },
      up_left: {
        title: commonMsg.directionNorthwestLetter(),
        moveFunction: 'moveUpLeft',
        tooltip: msg.moveNorthwestTooltip(),
        image: skin.northwestLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleDiagonalLengthChoices,
        defaultLength: defaultDiagonalMoveLength,
        defaultDropdownValue: longDiagonalMoveLengthDropdownValue
      },
      up_right: {
        title: commonMsg.directionNortheastLetter(),
        moveFunction: 'moveUpRight',
        tooltip: msg.moveNortheastTooltip(),
        image: skin.northeastLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleDiagonalLengthChoices,
        defaultLength: defaultDiagonalMoveLength,
        defaultDropdownValue: longDiagonalMoveLengthDropdownValue
      },
      down_left: {
        title: commonMsg.directionSouthwestLetter(),
        moveFunction: 'moveDownLeft',
        tooltip: msg.moveSouthwestTooltip(),
        image: skin.southwestLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleDiagonalLengthChoices,
        defaultLength: defaultDiagonalMoveLength,
        defaultDropdownValue: longDiagonalMoveLengthDropdownValue
      },
      down_right: {
        title: commonMsg.directionSoutheastLetter(),
        moveFunction: 'moveDownRight',
        tooltip: msg.moveSoutheastTooltip(),
        image: skin.southeastLineDraw,
        imageDimensions: {width: 72, height: 56},
        lengths: simpleDiagonalLengthChoices,
        defaultLength: defaultDiagonalMoveLength,
        defaultDropdownValue: longDiagonalMoveLengthDropdownValue
      },
      jump_left: {
        isJump: true,
        title: commonMsg.directionWestLetter(),
        moveFunction: 'jumpLeft',
        image: skin.leftJumpArrow,
        tooltip: msg.jumpWestTooltip(),
        defaultLength: defaultMoveLength
      },
      jump_right: {
        isJump: true,
        title: commonMsg.directionEastLetter(),
        moveFunction: 'jumpRight',
        image: skin.rightJumpArrow,
        tooltip: msg.jumpEastTooltip(),
        defaultLength: defaultMoveLength
      },
      jump_up: {
        isJump: true,
        title: commonMsg.directionNorthLetter(),
        moveFunction: 'jumpUp',
        image: skin.upJumpArrow,
        tooltip: msg.jumpNorthTooltip(),
        defaultLength: defaultMoveLength
      },
      jump_down: {
        isJump: true,
        title: commonMsg.directionSouthLetter(),
        moveFunction: 'jumpDown',
        image: skin.downJumpArrow,
        tooltip: msg.jumpSouthTooltip(),
        defaultLength: defaultMoveLength
      },
      jump_up_left: {
        isJump: true,
        title: commonMsg.directionNorthwestLetter(),
        moveFunction: 'jumpUpLeft',
        image: skin.upLeftJumpArrow,
        tooltip: msg.jumpNorthwestTooltip(),
        defaultLength: defaultDiagonalMoveLength
      },
      jump_up_right: {
        isJump: true,
        title: commonMsg.directionNortheastLetter(),
        moveFunction: 'jumpUpRight',
        image: skin.upRightJumpArrow,
        tooltip: msg.jumpNortheastTooltip(),
        defaultLength: defaultDiagonalMoveLength
      },
      jump_down_left: {
        isJump: true,
        title: commonMsg.directionSouthwestLetter(),
        moveFunction: 'jumpDownLeft',
        image: skin.downLeftJumpArrow,
        tooltip: msg.jumpSouthwestTooltip(),
        defaultLength: defaultDiagonalMoveLength
      },
      jump_down_right: {
        isJump: true,
        title: commonMsg.directionSoutheastLetter(),
        moveFunction: 'jumpDownRight',
        image: skin.downRightJumpArrow,
        tooltip: msg.jumpSoutheastTooltip(),
        defaultLength: defaultDiagonalMoveLength
      }
    },
    generateBlocksForAllDirections: function() {
      SimpleMove.generateBlocksForDirection('up');
      SimpleMove.generateBlocksForDirection('down');
      SimpleMove.generateBlocksForDirection('left');
      SimpleMove.generateBlocksForDirection('right');
      SimpleMove.generateBlocksForDirection('up_left');
      SimpleMove.generateBlocksForDirection('up_right');
      SimpleMove.generateBlocksForDirection('down_left');
      SimpleMove.generateBlocksForDirection('down_right');
    },
    generateBlocksForDirection: function(direction) {
      generator['simple_move_' + direction] = SimpleMove.generateCodeGenerator(
        direction
      );
      generator['simple_jump_' + direction] = SimpleMove.generateCodeGenerator(
        'jump_' + direction
      );
      generator[
        'simple_move_' + direction + '_length'
      ] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks[
        'simple_move_' + direction + '_length'
      ] = SimpleMove.generateMoveBlock(direction, true);
      blockly.Blocks['simple_move_' + direction] = SimpleMove.generateMoveBlock(
        direction
      );
      blockly.Blocks['simple_jump_' + direction] = SimpleMove.generateMoveBlock(
        'jump_' + direction
      );
    },
    generateMoveBlock: function(direction, hasLengthInput) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      var directionLetterWidth = 12;
      return {
        helpUrl: '',
        init: function() {
          this.setHSV(184, 1.0, 0.74);
          var input = this.appendDummyInput();
          if (directionConfig.isJump) {
            input.appendTitle(commonMsg.jump());
          }
          input.appendTitle(
            new blockly.FieldLabel(directionConfig.title, {
              fixedSize: {width: directionLetterWidth, height: 18}
            })
          );

          if (directionConfig.imageDimensions) {
            input.appendTitle(
              new blockly.FieldImage(
                directionConfig.image,
                directionConfig.imageDimensions.width,
                directionConfig.imageDimensions.height
              )
            );
          } else {
            input.appendTitle(new blockly.FieldImage(directionConfig.image));
          }
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
          if (hasLengthInput) {
            var dropdown = new blockly.FieldImageDropdown(
              directionConfig.lengths
            );
            dropdown.setValue(directionConfig.defaultDropdownValue);
            input.appendTitle(dropdown, 'length');
          }
        }
      };
    },
    generateCodeGenerator: function(direction, hasLengthInput) {
      return function() {
        var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
        var length = directionConfig.defaultLength;

        if (hasLengthInput) {
          length = SimpleMove[this.getTitleValue('length')];
        }
        return (
          'Turtle.' +
          directionConfig.moveFunction +
          '(' +
          length +
          ',' +
          "'block_id_" +
          this.id +
          "');\n"
        );
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  blockly.Blocks.jump.DIRECTIONS = [
    [msg.jumpForward(), 'jumpForward'],
    [msg.jumpBackward(), 'jumpBackward']
  ];

  generator.jump = function() {
    // Generate JavaScript for jumping forward or backwards.
    var value =
      generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.jump_by_constant = {
    // Block for moving forward or backward the internal number of pixels
    // without drawing.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS),
        'DIR'
      );
      this.appendDummyInput()
        .appendTitle(
          new blockly.FieldTextInput(
            '100',
            blockly.FieldTextInput.numberValidator
          ),
          'VALUE'
        )
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
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(blockly.Blocks.jump.DIRECTIONS),
        'DIR'
      );
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
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };
  generator.jump_by_constant_dropdown = generator.jump_by_constant;

  blockly.Blocks.jump_to = {
    // Block for jumping to a specified position
    helpUrl: '',
    init: function() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to top-left
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.jump());
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  blockly.Blocks.jump_to.VALUES = POSITION_VALUES;

  generator.jump_to = function() {
    let value = this.getTitleValue('VALUE');
    if (value === RANDOM_VALUE) {
      let possibleValues = this.VALUES.map(item => item[1]).filter(
        item => item !== RANDOM_VALUE
      );
      value = `Turtle.random([${possibleValues}])`;
    }
    return `Turtle.jumpTo(${value}, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.jump_to_xy = {
    // Block for jumping to specified XY location.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.interpolateMsg(
        msg.jumpToOverDown(),
        () => {
          this.appendDummyInput().appendTitle(
            new blockly.FieldTextInput(
              '0',
              blockly.FieldTextInput.numberValidator
            ),
            'XPOS'
          );
        },
        () => {
          this.appendDummyInput().appendTitle(
            new blockly.FieldTextInput(
              '0',
              blockly.FieldTextInput.numberValidator
            ),
            'YPOS'
          );
        },
        blockly.ALIGN_RIGHT
      );
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.jumpTooltip());
    }
  };

  generator.jump_to_xy = function() {
    const xParam = window.parseFloat(this.getTitleValue('XPOS')) || 0;
    const yParam = window.parseFloat(this.getTitleValue('YPOS')) || 0;
    return `Turtle.jumpToXY(${xParam}, ${yParam}, 'block_id_${this.id}');\n`;
  };

  blockly.Blocks.draw_turn = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendValueInput('VALUE')
        .setCheck(blockly.BlockValueType.NUMBER)
        .addFieldHelper(blockly.BlockFieldHelper.ANGLE_HELPER, {
          block: this,
          directionTitle: 'DIR'
        })
        .appendTitle(
          new blockly.FieldDropdown(blockly.Blocks.draw_turn.DIRECTIONS),
          'DIR'
        );
      this.appendDummyInput().appendTitle(msg.degrees());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.draw_turn.DIRECTIONS = [
    [msg.turnRight(), 'turnRight'],
    [msg.turnLeft(), 'turnLeft']
  ];

  generator.draw_turn = function() {
    // Generate JavaScript for turning left or right.
    var value =
      generator.valueToCode(this, 'VALUE', generator.ORDER_NONE) || '0';
    return (
      'Turtle.' +
      this.getTitleValue('DIR') +
      '(' +
      value +
      ", 'block_id_" +
      this.id +
      "');\n"
    );
  };

  // this is the old version of this block, that should only still be used in
  // old shared levels
  blockly.Blocks.draw_width = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendValueInput('WIDTH')
        .setCheck(blockly.BlockValueType.NUMBER)
        .appendTitle(msg.setWidth());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width = function() {
    // Generate JavaScript for setting the pen width.
    var width =
      generator.valueToCode(this, 'WIDTH', generator.ORDER_NONE) || '1';
    return 'Turtle.penWidth(' + width + ", 'block_id_" + this.id + "');\n";
  };

  // inlined version of draw_width
  blockly.Blocks.draw_width_inline = {
    // Block for setting the pen width.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.setInputsInline(true);
      this.appendDummyInput().appendTitle(msg.setWidth());
      this.appendDummyInput().appendTitle(
        new blockly.FieldTextInput('1', blockly.FieldTextInput.numberValidator),
        'WIDTH'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.widthTooltip());
    }
  };

  generator.draw_width_inline = function() {
    // Generate JavaScript for setting the pen width.
    var width = this.getTitleValue('WIDTH');
    return 'Turtle.penWidth(' + width + ", 'block_id_" + this.id + "');\n";
  };

  blockly.Blocks.draw_pen = {
    // Block for pen up/down.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(this.STATE),
        'PEN'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.penTooltip());
    }
  };

  blockly.Blocks.draw_pen.STATE = [
    [msg.penUp(), 'penUp'],
    [msg.penDown(), 'penDown']
  ];

  generator.draw_pen = function() {
    // Generate JavaScript for pen up/down.
    return (
      'Turtle.' + this.getTitleValue('PEN') + "('block_id_" + this.id + "');\n"
    );
  };

  blockly.Blocks.draw_colour = {
    // Block for setting the colour.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendValueInput('COLOUR')
        .setCheck(blockly.BlockValueType.COLOUR)
        .appendTitle(msg.setColour());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.colourTooltip());
    }
  };

  blockly.Blocks.alpha = {
    // TODO:
    // - Add alpha to a group
    // - Make sure it doesn't count against correct solutions
    //
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendTitle(msg.setAlpha());
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setHSV(196, 1.0, 0.79);
      this.setTooltip('');
    }
  };

  generator.alpha = function() {
    var alpha = generator.valueToCode(
      this,
      'VALUE',
      Blockly.JavaScript.ORDER_NONE
    );
    return 'Turtle.globalAlpha(' + alpha + ", 'block_id_" + this.id + "');\n";
  };

  generator.draw_colour = function() {
    // Generate JavaScript for setting the colour.
    var colour =
      generator.valueToCode(this, 'COLOUR', generator.ORDER_NONE) ||
      "'#000000'";
    return 'Turtle.penColour(' + colour + ", 'block_id_" + this.id + "');\n";
  };

  blockly.Blocks.draw_colour_simple = {
    // Simplified dropdown block for setting the colour.
    init: function() {
      var colours = [
        Colours.RED,
        Colours.BLACK,
        Colours.PINK,
        Colours.ORANGE,
        Colours.YELLOW,
        Colours.GREEN,
        Colours.BLUE,
        Colours.AQUAMARINE,
        Colours.PLUM
      ];
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
    var colour = this.getTitleValue('COLOUR') || "'#000000'";
    return 'Turtle.penColour("' + colour + '", \'block_id_' + this.id + "');\n";
  };

  blockly.Blocks.draw_line_style_pattern = {
    // Block to handle event when an arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput()
        .appendTitle(msg.setPattern())
        .appendTitle(
          new blockly.FieldImageDropdown(skin.lineStylePatternOptions, 150, 20),
          'VALUE'
        );
      this.setTooltip(msg.setPattern());
    }
  };

  generator.draw_line_style_pattern = function() {
    // Generate JavaScript for setting the image for a patterned line.
    var pattern = this.getTitleValue('VALUE') || "'DEFAULT'";
    return (
      'Turtle.penPattern("' + pattern + '", \'block_id_' + this.id + "');\n"
    );
  };

  blockly.Blocks.up_big = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(this.STATE),
        'VISIBILITY'
      );
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  generator.up_big = function() {
    // Generate JavaScript for setting the colour.
    var colour =
      generator.valueToCode(this, 'COLOUR', generator.ORDER_NONE) ||
      "'#000000'";
    return 'Turtle.penColour(' + colour + ", 'block_id_" + this.id + "');\n";
  };

  blockly.Blocks.turtle_visibility = {
    // Block for changing turtle visiblity.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(this.STATE),
        'VISIBILITY'
      );
      this.setTooltip(msg.turtleVisibilityTooltip());
    }
  };

  blockly.Blocks.turtle_visibility.STATE = [
    [msg.hideTurtle(), 'hideTurtle'],
    [msg.showTurtle(), 'showTurtle']
  ];

  generator.turtle_visibility = function() {
    // Generate JavaScript for changing turtle visibility.
    return (
      'Turtle.' +
      this.getTitleValue('VISIBILITY') +
      "('block_id_" +
      this.id +
      "');\n"
    );
  };

  function createDrawStickerBlock(blockName) {
    return {
      helpUrl: '',
      init: function() {
        this.setHSV(184, 1.0, 0.74);
        var dropdown;
        var input = this.appendDummyInput();
        input.appendTitle(msg.drawSticker());
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);

        // Generates a list of pairs of the form [[url, name]]
        var values = [];
        for (var name in skin.stickers) {
          var url = skin.stickers[name];
          values.push([url, name]);
        }
        dropdown = new blockly.FieldImageDropdown(values, 40, 40);

        input.appendTitle(dropdown, 'VALUE');

        appendToDrawStickerBlock(blockName, this);
      }
    };
  }

  // Add size input to the draw sticker block (text input & socket)
  function appendToDrawStickerBlock(blockName, block) {
    if (blockName === 'turtle_sticker_with_size') {
      block.appendDummyInput().appendTitle(msg.withSize());
      block.appendValueInput('SIZE').setCheck(blockly.BlockValueType.NUMBER);
      block.appendDummyInput().appendTitle(msg.pixels());
      block.setTooltip(msg.drawStickerWithSize());
    } else if (blockName === 'turtle_sticker_with_size_non_param') {
      block.appendDummyInput().appendTitle(msg.withSize());
      block
        .appendDummyInput()
        .appendTitle(
          new blockly.FieldTextInput(
            '0',
            blockly.FieldTextInput.numberValidator
          ),
          'SIZE'
        )
        .appendTitle(msg.pixels());
      block.setTooltip(msg.drawStickerWithSize());
    } else {
      block.setTooltip(msg.drawSticker());
    }
  }

  // We alias 'turtle_stamp' to be the same as the 'sticker' block for
  // backwards compatibility.
  blockly.Blocks.sticker = blockly.Blocks.turtle_stamp = createDrawStickerBlock();

  generator.sticker = generator.turtle_stamp = function() {
    return (
      'Turtle.drawSticker("' +
      this.getTitleValue('VALUE') +
      '", null, \'block_id_' +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.turtle_sticker_with_size = createDrawStickerBlock(
    'turtle_sticker_with_size'
  );

  generator.turtle_sticker_with_size = function() {
    let size = generator.valueToCode(
      this,
      'SIZE',
      Blockly.JavaScript.ORDER_NONE
    );
    return `Turtle.drawSticker('${this.getTitleValue('VALUE')}',${size},
        'block_id_${this.id}');\n`;
  };

  blockly.Blocks.turtle_sticker_with_size_non_param = createDrawStickerBlock(
    'turtle_sticker_with_size_non_param'
  );

  generator.turtle_sticker_with_size_non_param = function() {
    let size = window.parseFloat(this.getTitleValue('SIZE')) || 0;
    return `Turtle.drawSticker('${this.getTitleValue('VALUE')}',${size},
        'block_id_${this.id}');\n`;
  };

  blockly.Blocks.turtle_setArtist = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      var values = (skin.artistOptions || ['default']).map(artist => [
        msg.setCharacter({
          character: artist.charAt(0).toUpperCase() + artist.slice(1)
        }),
        artist
      ]);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(values),
        'VALUE'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.turtle_setArtist = function() {
    return `Turtle.setArtist('${this.getTitleValue('VALUE')}',
      'block_id_${this.id}');\n`;
  };

  customLevelBlocks.install(blockly, generator, gensym);
};
