import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';

/**
 * Blocks common to 'Craft' levels.
 */
const blocks: BlockDefinition[] = [
  {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: {
      javascript: () => '\n',
    },
    nextStatement: true,
  },
  {
    // Block for moving forward/backward
    type: 'craft_moveForward',
    style: 'default',
    tooltip: 'Move an actor.',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
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
      javascript: () => '\n',
    },
  },
  {
    // Block for turning left or right
    type: 'craft_turn',
    style: 'default',
    tooltip: 'Turn an actor.',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    previousStatement: true,
    nextStatement: true,
    message0: 'turn %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['left \u21BA', 'left'],
          ['right \u21BB', 'right'],
        ],
      },
    ],
    generator: {
      javascript: () => '\n',
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
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        return javascriptGenerator.forBlock.controls_repeat(block, javascriptGenerator);
      },
    },
  },
];

export default blocks;
