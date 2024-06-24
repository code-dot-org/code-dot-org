/**
 * Blockly Demo: Maze
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
 * @fileoverview Demonstration of Blockly: Solving a maze.
 * @author fraser@google.com (Neil Fraser)
 */

var mazeUtils = require('@code-dot-org/maze').utils;

var commonMsg = require('@cdo/locale');

var blockUtils = require('../block_utils');
var BlockStyles = require('../blockly/constants').BlockStyles;
var BlockColors = require('../blockly/constants').BlockColors;

var msg = require('./locale');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  Blockly.cdoUtils.registerCustomProcedureBlocks();
  var skin = blockInstallOptions.skin;
  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  if (mazeUtils.isBeeSkin(skin.id)) {
    require('./beeBlocks').install(blockly, blockInstallOptions);
  } else if (mazeUtils.isCollectorSkin(skin.id)) {
    require('./collectorBlocks').install(blockly, blockInstallOptions);
  } else if (mazeUtils.isHarvesterSkin(skin.id)) {
    require('./harvesterBlocks').install(blockly, blockInstallOptions);
  } else if (mazeUtils.isPlanterSkin(skin.id)) {
    require('./planterBlocks').install(blockly, blockInstallOptions);
  }

  var SimpleMove = {
    DIRECTION_CONFIGS: {
      West: {
        letter: commonMsg.directionWestLetter(),
        image: skin.leftArrow,
        tooltip: msg.moveWestTooltip(),
      },
      East: {
        letter: commonMsg.directionEastLetter(),
        image: skin.rightArrow,
        tooltip: msg.moveEastTooltip(),
      },
      North: {
        letter: commonMsg.directionNorthLetter(),
        image: skin.upArrow,
        tooltip: msg.moveNorthTooltip(),
      },
      South: {
        letter: commonMsg.directionSouthLetter(),
        image: skin.downArrow,
        tooltip: msg.moveSouthTooltip(),
      },
    },
    generateBlocksForAllDirections: function () {
      SimpleMove.generateBlocksForDirection('North');
      SimpleMove.generateBlocksForDirection('South');
      SimpleMove.generateBlocksForDirection('West');
      SimpleMove.generateBlocksForDirection('East');
    },
    generateBlocksForDirection: function (direction) {
      generator['maze_move' + direction] =
        SimpleMove.generateCodeGenerator(direction);
      blockly.Blocks['maze_move' + direction] =
        SimpleMove.generateMoveBlock(direction);
    },
    generateMoveBlock: function (direction) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      return {
        helpUrl: '',
        init: function () {
          Blockly.cdoUtils.handleColorAndStyle(
            this,
            BlockColors.DEFAULT,
            BlockStyles.DEFAULT
          );
          this.appendDummyInput()
            .appendField(
              new blockly.FieldLabel(directionConfig.letter, {
                fixedSize: {width: 12, height: 18},
              })
            )
            .appendField(new blockly.FieldImage(directionConfig.image));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        },
      };
    },
    generateCodeGenerator: function (direction) {
      return function () {
        return 'Maze.move' + direction + "('block_id_" + this.id + "');\n";
      };
    },
  };

  SimpleMove.generateBlocksForAllDirections();

  // Block for moving forward.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_moveForward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    title: msg.moveForward(),
    tooltip: msg.moveForwardTooltip(),
    functionName: 'Maze.moveForward',
  });

  // Block for putting dirt on to a tile.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_fill',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PutDown',
    title: msg.fill(),
    tooltip: msg.fillTooltip(),
    functionName: 'Maze.fill',
  });

  // Block for putting for removing dirt from a tile.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_dig',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PickUp',
    title: msg.dig(),
    tooltip: msg.digTooltip(),
    functionName: 'Maze.dig',
  });

  blockly.Blocks.maze_move = {
    // Block for moving forward/backward
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.DEFAULT,
        BlockStyles.DEFAULT
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    },
  };

  blockly.Blocks.maze_move.DIRECTIONS = [
    [msg.moveForward(), 'moveForward'],
    [msg.moveBackward(), 'moveBackward'],
  ];

  generator.maze_move = function () {
    // Generate JavaScript for moving forward/backward
    var dir = this.getFieldValue('DIR');
    return 'Maze.' + dir + "('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.maze_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.DEFAULT,
        BlockStyles.DEFAULT
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    },
  };

  blockly.Blocks.maze_turn.DIRECTIONS = [
    [msg.turnLeft() + ' \u21BA', 'turnLeft'],
    [msg.turnRight() + ' \u21BB', 'turnRight'],
  ];

  generator.maze_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getFieldValue('DIR');
    return 'Maze.' + dir + "('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.maze_isPath = {
    // Block for checking if there a path.
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOGIC,
        BlockStyles.LOGIC
      );
      this.setOutput(true, blockly.BlockValueType.NUMBER);
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setTooltip(msg.isPathTooltip());
    },
  };

  blockly.Blocks.maze_isPath.DIRECTIONS = [
    [msg.ifPathAhead(), 'isPathForward'],
    [msg.pathLeft() + ' \u21BA', 'isPathLeft'],
    [msg.pathRight() + ' \u21BB', 'isPathRight'],
  ];

  generator.maze_isPath = function () {
    // Generate JavaScript for checking if there is a path.
    var code = 'Maze.' + this.getFieldValue('DIR') + '()';
    return [code, generator.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.maze_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOGIC,
        BlockStyles.LOGIC
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.Blocks.maze_if.DIRECTIONS = blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_if = function () {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.maze_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOGIC,
        BlockStyles.LOGIC
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.appendStatementInput('ELSE').appendField(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.Blocks.maze_ifElse.DIRECTIONS = blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_ifElse = function () {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code =
      'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOGIC,
        BlockStyles.LOGIC
      );
      this.appendDummyInput().appendField(msg.ifCode());
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  generator.karel_if = function () {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.karel_if.DIRECTIONS = [
    [msg.pilePresent(), 'pilePresent'],
    [msg.holePresent(), 'holePresent'],
    [msg.pathAhead(), 'isPathForward'],
    //     [msg.noPathAhead(), 'noPathForward']
  ];

  blockly.Blocks.karel_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOGIC,
        BlockStyles.LOGIC
      );
      this.appendDummyInput().appendField(msg.ifCode());
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.appendStatementInput('ELSE').appendField(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  generator.karel_ifElse = function () {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code =
      'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_ifElse.DIRECTIONS = blockly.Blocks.karel_if.DIRECTIONS;

  blockly.Blocks.maze_whileNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    },
  };

  generator.maze_whileNotClear = function () {
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_whileNotClear.DIRECTIONS = [
    [msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'],
    [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent'],
  ];

  blockly.Blocks.maze_untilBlocked = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput().appendField(msg.repeatUntilBlocked());
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    },
  };

  generator.maze_untilBlocked = function () {
    var argument = 'Maze.isPathForward' + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_forever = {
    // Do forever loop.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput()
        .appendField(msg.repeatUntil())
        .appendField(new blockly.FieldImage(skin.maze_forever, 35, 35));
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setPreviousStatement(true);
      this.setTooltip(msg.whileTooltip());
    },
  };

  generator.maze_forever = function () {
    // Generate JavaScript for do forever loop.
    var branch = generator.statementToCode(this, 'DO');
    branch =
      Blockly.getInfiniteLoopTrap() +
      Blockly.loopHighlight('Maze', this.id) +
      branch;
    return 'while (Maze.notFinished()) {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.appendStatementInput('DO').appendField(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    },
  };

  generator.maze_untilBlockedOrNotClear = function () {
    var argument =
      'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear.DIRECTIONS = [
    [msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'],
    [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent'],
    [msg.repeatUntilBlocked(), 'isPathForward'],
  ];

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};
