import * as En from 'blockly/msg/en';

import type {BlockDefinition} from '@code-dot-org/blockly';
import {BaseBlocks} from '@code-dot-org/blockly';

import beeBlocks from './beeBlocks';
import collectorBlocks from './collectorBlocks';
import harvesterBlocks from './harvesterBlocks';
import planterBlocks from './planterBlocks';
import type {Skin} from './skin';

/**
 * Generates the block list considering the given Skin.
 *
 * Some of the blocks use the images from the skin.
 */
const blocks: (skin: Skin) => BlockDefinition[] = (skin: Skin) => [
  BaseBlocks.when_run,
  BaseBlocks.comment,
  {
    // Simply moves forward
    type: 'maze_moveForward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward one space.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'move forward',
    generator: {
      javascript(block) {
        return `Maze.moveForward('block_id_${block.id}');\n`;
      },
      simple() {
        return `moveForward();\n`;
      },
    },
  },
  {
    // Block for moving forward / backward
    type: 'maze_move',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward/backward one space',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'move %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['forward', 'moveForward'],
          ['backward', 'moveBackward'],
        ],
      },
    ],
    generator: {
      javascript(block) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        return 'Maze.' + dir + "('block_id_" + block.id + "');\n";
      },
      simple(block) {
        const dir = block.getFieldValue('DIR');
        return `${dir}();\n`;
      },
    },
  },
  {
    type: 'maze_turn',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    tooltip: 'Turns me left or right by 90 degrees.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'turn %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['left \u21BA', 'turnLeft'],
          ['right \u21BB', 'turnRight'],
        ],
      },
    ],
    generator: {
      javascript(block) {
        const dir = block.getFieldValue('DIR');
        return `Maze.${dir}('block_id_${block.id}');\n`;
      },
      simple(block) {
        const dir = block.getFieldValue('DIR');
        return `${dir}();\n`;
      },
    },
  },
  compassMoveBlock('maze_moveNorth', 'move N', 'moveNorth'),
  compassMoveBlock('maze_moveSouth', 'move S', 'moveSouth'),
  compassMoveBlock('maze_moveEast', 'move E', 'moveEast'),
  compassMoveBlock('maze_moveWest', 'move W', 'moveWest'),
  {
    // Put a unit of dirt down on the current tile (Farmer).
    type: 'maze_fill',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PutDown',
    tooltip: 'place 1 unit of dirt',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'fill 1',
    generator: {
      javascript(block) {
        return `Maze.fill('block_id_${block.id}');\n`;
      },
      simple() {
        return `fill();\n`;
      },
    },
  },
  {
    // Remove a unit of dirt from the current tile (Farmer).
    type: 'maze_dig',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PickUp',
    tooltip: 'remove 1 unit of dirt',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'remove 1',
    generator: {
      javascript(block) {
        return `Maze.dig('block_id_${block.id}');\n`;
      },
      simple() {
        return `dig();\n`;
      },
    },
  },
  {
    // If there is a pile/hole/path ahead, then do some actions (Farmer).
    type: 'karel_if',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If the specified condition is true, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['there is a pile', 'pilePresent'],
          ['there is a hole', 'holePresent'],
          ['path ahead', 'isPathForward'],
        ],
      },
    ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.${block.getFieldValue('DIR')}('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('DIR')}()`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
    },
  },
  {
    // If/else there is a pile/hole/path ahead (Farmer).
    type: 'karel_ifElse',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip:
      'If the specified condition is true, then do the first block of ' +
      'actions. Otherwise, do the second block of actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['there is a pile', 'pilePresent'],
          ['there is a hole', 'holePresent'],
          ['path ahead', 'isPathForward'],
        ],
      },
    ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    message2: 'else %1',
    args2: [
      {
        type: 'input_statement',
        name: 'ELSE',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.${block.getFieldValue('DIR')}('block_id_${block.id}')`;
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('DIR')}()`;
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
      },
    },
  },
  {
    type: 'controls_repeat_dropdown',
    style: 'loop_blocks',
    tooltip: '',
    message0: En.CONTROLS_REPEAT_TITLE,
    args0: [
      {
        type: 'field_dropdown',
        name: 'TIMES',
        options: [['2', '2']],
      },
    ],
    message1: En.CONTROLS_REPEAT_INPUT_DO + ' %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    nextStatement: true,
    previousStatement: true,
    generator: {
      javascript(block, javascriptGenerator) {
        return javascriptGenerator.forBlock.controls_repeat(
          block,
          javascriptGenerator,
        );
      },
      simple(block, javascriptGenerator) {
        return javascriptGenerator.forBlock.controls_repeat(
          block,
          javascriptGenerator,
        );
      },
    },
  },
  {
    // Do forever loop.
    type: 'maze_forever',
    style: 'loop_blocks',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    tooltip: 'Repeat the enclosed actions until finish point is reached.',
    previousStatement: true,
    nextStatement: true,
    message0: 'repeat until %1',
    args0: [
      {
        type: 'field_image',
        alt: 'avatar',
        src: skin.maze_forever || '',
        width: 35,
        height: 35,
        name: 'IMAGE',
      },
    ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        // Generate JavaScript for do forever loop.
        const branch = generator.statementToCode(block, 'DO');
        /*
        branch =
          Blockly.getInfiniteLoopTrap() +
          Blockly.loopHighlight('Maze', block.id) +
          branch;
         */
        return 'while (Maze.notFinished()) {\n' + branch + '}\n';
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return 'while (notFinished()) {\n' + branch + '}\n';
      },
    },
  },
  {
    // Do until
    type: 'maze_untilBlocked',
    style: 'loop_blocks',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    tooltip: 'Repeat the enclosed actions until finish point is reached.',
    previousStatement: true,
    nextStatement: true,
    message0: 'while path ahead',
    message1: En.CONTROLS_REPEAT_INPUT_DO + ' %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        /*branch =
          Blockly.getInfiniteLoopTrap() +
          Blockly.loopHighlight('Maze', this.id) +
          branch;*/
        return `while (Maze.notFinished()) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return 'while (notFinished()) {\n' + branch + '}\n';
      },
    },
  },
  {
    // Do until
    type: 'maze_untilBlockedOrNotClear',
    style: 'loop_blocks',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    tooltip: 'Repeat the enclosed actions until finish point is reached.',
    previousStatement: true,
    nextStatement: true,
    message0: 'while %1',
    args0: [
      {
        name: 'DIR',
        type: 'field_dropdown',
        options: [
          ['path ahead', 'isPathForward'],
          ['there is a pile', 'pilePresent'],
          ['there is a hole', 'holePresent'],
        ],
      },
    ],
    message1: En.CONTROLS_REPEAT_INPUT_DO + ' %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const dir = block.getFieldValue('DIR');
        const argument = `Maze.${dir}('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        //branch = Blockly.getInfiniteLoopTrap() + branch;
        return `while (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const dir = block.getFieldValue('DIR');
        const argument = `${dir}()`;
        const branch = generator.statementToCode(block, 'DO');
        //branch = Blockly.getInfiniteLoopTrap() + branch;
        return `while (${argument}) {\n${branch}}\n`;
      },
    },
  },
  {
    // Block for 'if' conditional if there is a path.
    type: 'maze_if',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip:
      'If there is a path in the specified direction, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if path %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['ahead', 'isPathForward'],
          ['to the left \u21BA', 'isPathLeft'],
          ['to the right \u21BB', 'isPathRight'],
        ],
      },
    ],
    message1: En.CONTROLS_REPEAT_INPUT_DO + ' %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        // Generate JavaScript for 'if' conditional if there is a path.
        const argument =
          'Maze.' +
          block.getFieldValue('DIR') +
          "('block_id_" +
          block.id +
          "')";
        const branch = generator.statementToCode(block, 'DO');
        const code = 'if (' + argument + ') {\n' + branch + '}\n';
        return code;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('DIR')}()`;
        const branch = generator.statementToCode(block, 'DO');
        const code = 'if (' + argument + ') {\n' + branch + '}\n';
        return code;
      },
    },
  },
  {
    // Block for 'if/else' conditional if there is a path.
    type: 'maze_ifElse',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip:
      'If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if path %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['ahead', 'isPathForward'],
          ['to the left \u21BA', 'isPathLeft'],
          ['to the right \u21BB', 'isPathRight'],
        ],
      },
    ],
    message1: En.CONTROLS_REPEAT_INPUT_DO + ' %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    message2: 'else %1',
    args2: [
      {
        type: 'input_statement',
        name: 'ELSE',
      },
    ],
    generator: {
      javascript(block, generator) {
        // Generate JavaScript for 'if/else' conditional if there is a path.
        const argument =
          'Maze.' +
          block.getFieldValue('DIR') +
          "('block_id_" +
          block.id +
          "')";
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        const code =
          'if (' +
          argument +
          ') {\n' +
          branch0 +
          '} else {\n' +
          branch1 +
          '}\n';
        return code;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('DIR')}()`;
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        const code =
          'if (' +
          argument +
          ') {\n' +
          branch0 +
          '} else {\n' +
          branch1 +
          '}\n';
        return code;
      },
    },
  },
  ...beeBlocks,
  ...harvesterBlocks,
  ...collectorBlocks,
  ...planterBlocks,
];

/**
 * A single block that moves in a fixed compass direction (as opposed to
 * relative to Pegman's current facing, like maze_moveForward/maze_move).
 */
function compassMoveBlock(
  type: string,
  message0: string,
  func: string,
): BlockDefinition {
  return {
    type,
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: `Move me ${message0.slice(5)}.`,
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0,
    generator: {
      javascript(block) {
        return `Maze.${func}('block_id_${block.id}');\n`;
      },
      simple() {
        return `${func}();\n`;
      },
    },
  };
}

export default blocks;
