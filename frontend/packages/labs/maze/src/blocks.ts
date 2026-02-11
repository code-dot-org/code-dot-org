import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

import type {BlockDefinitions} from '@code-dot-org/blockly-workspace';
import {BaseBlocks} from '@code-dot-org/blockly-workspace';

import type {Skin} from './skin';

/**
 * Generates the block list considering the given Skin.
 *
 * Some of the blocks use the images from the skin.
 */
const blocks: (skin: Skin) => BlockDefinitions = (skin: Skin) => [
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
      javascript(block: Blockly.Block) {
        console.log('generating');
        return `Maze.moveForward('block_id_${block.id}');\n`;
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
      javascript(block: Blockly.Block) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        return 'Maze.' + dir + "('block_id_" + block.id + "');\n";
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
      javascript(block: Blockly.Block) {
        const dir = block.getFieldValue('DIR');
        return `Maze.${dir}('block_id_${block.id}');\n`;
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
      javascript(
        block: Blockly.Block,
        javascriptGenerator: JavascriptGenerator,
      ) {
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
        src: skin.maze_forever ?? '',
        width: 35,
        height: 35,
        name: 'IMAGE',
        alt: 'finish',
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
      javascript(block: Blockly.Block, generator: JavascriptGenerator) {
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
      javascript(block: Blockly.Block, generator: JavascriptGenerator) {
        const branch = generator.statementToCode(block, 'DO');
        /*branch =
          Blockly.getInfiniteLoopTrap() +
          Blockly.loopHighlight('Maze', this.id) +
          branch;*/
        return `while (Maze.notFinished()) {\n${branch}}\n`;
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
      javascript(block: Blockly.Block, generator: JavascriptGenerator) {
        const dir = block.getFieldValue('DIR');
        const argument = `Maze.${dir}('block_id_${block.id}')`;
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
      javascript(block: Blockly.Block, generator: JavascriptGenerator) {
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
      javascript(block: Blockly.Block, generator: JavascriptGenerator) {
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
    },
  },
];

export default blocks;
