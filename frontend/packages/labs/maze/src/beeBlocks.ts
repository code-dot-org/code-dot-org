import {Order} from 'blockly/javascript';

import * as Blockly from 'blockly/core';

import type {BlockDefinition} from '@code-dot-org/blockly';

/**
 * Bee-specific blocks: nectar/honey actions, flower/hive predicates, and
 * nectar/honey counters.
 *
 * Ported from apps/src/maze/beeBlocks.js.
 */
const beeBlocks: BlockDefinition[] = [
  {
    // Get nectar from the current flower.
    type: 'maze_nectar',
    helpUrl: '',
    tooltip: 'Get nectar from the flower.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'get nectar',
    generator: {
      javascript(block) {
        return `Maze.getNectar('block_id_${block.id}');\n`;
      },
      simple() {
        return `getNectar();\n`;
      },
    },
  },
  {
    // Make honey at the current hive.
    type: 'maze_honey',
    helpUrl: '',
    tooltip: 'Make honey at the honeycomb.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'make honey',
    generator: {
      javascript(block) {
        return `Maze.makeHoney('block_id_${block.id}');\n`;
      },
      simple() {
        return `makeHoney();\n`;
      },
    },
  },
  {
    // If at a flower, then do some actions.
    type: 'bee_ifOnlyFlower',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If we are at a flower, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if at flower',
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.atFlower('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (atFlower()) {\n${branch}}\n`;
      },
    },
  },
  {
    // If at a flower or a hive, then do some actions.
    type: 'bee_ifFlower',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If we are at a flower or honeycomb, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'LOC',
        options: [
          ['at flower', 'atFlower'],
          ['at honeycomb', 'atHoneycomb'],
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
        const argument = `Maze.${block.getFieldValue('LOC')}('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('LOC')}()`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
    },
  },
  {
    // If/else at a flower or a hive.
    type: 'bee_ifElseFlower',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip:
      'If we are at a flower or honeycomb, then do the first block of ' +
      'actions. Otherwise, do the second block of actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'LOC',
        options: [
          ['at flower', 'atFlower'],
          ['at honeycomb', 'atHoneycomb'],
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
        const argument = `Maze.${block.getFieldValue('LOC')}('block_id_${block.id}')`;
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
      },
      simple(block, generator) {
        const argument = `${block.getFieldValue('LOC')}()`;
        const branch0 = generator.statementToCode(block, 'DO');
        const branch1 = generator.statementToCode(block, 'ELSE');
        return `if (${argument}) {\n${branch0}} else {\n${branch1}}\n`;
      },
    },
  },
  repeatedActionBlock(
    'bee_n_forward',
    'move forward %1 times',
    'Move forward the given number of times.',
    'moveForward',
  ),
  repeatedActionBlock(
    'bee_n_nectar',
    'get %1 nectar',
    'Get nectar the given number of times.',
    'getNectar',
  ),
  repeatedActionBlock(
    'bee_n_honey',
    'make %1 honey',
    'Make honey the given number of times.',
    'makeHoney',
  ),
  comparisonBlock(
    'bee_ifNectarAmount',
    'if',
    [
      ['nectar remaining', 'nectarRemaining'],
      ['honey available', 'honeyAvailable'],
    ],
    'If the nectar/honey amount compares as specified, then do some actions.',
  ),
  comparisonBlock(
    'bee_ifelseNectarAmount',
    'ifelse',
    [
      ['nectar remaining', 'nectarRemaining'],
      ['honey available', 'honeyAvailable'],
    ],
    'If the nectar/honey amount compares as specified, then do the first ' +
      'block of actions. Otherwise, do the second block of actions.',
  ),
  comparisonBlock(
    'bee_ifTotalNectar',
    'if',
    [
      ['nectar collected', 'nectarCollected'],
      ['honey created', 'honeyCreated'],
    ],
    'If the total nectar/honey compares as specified, then do some actions.',
  ),
  comparisonBlock(
    'bee_ifelseTotalNectar',
    'ifelse',
    [
      ['nectar collected', 'nectarCollected'],
      ['honey created', 'honeyCreated'],
    ],
    'If the total nectar/honey compares as specified, then do the first ' +
      'block of actions. Otherwise, do the second block of actions.',
  ),
  comparisonBlock(
    'bee_whileNectarAmount',
    'while',
    [
      ['nectar remaining', 'nectarRemaining'],
      ['honey available', 'honeyAvailable'],
    ],
    'While the nectar/honey amount compares as specified, do some actions.',
  ),
];

/**
 * A block that repeats a single Bee action a given number of times.
 */
function repeatedActionBlock(
  type: string,
  message0: string,
  tooltip: string,
  func: string,
): BlockDefinition {
  return {
    type,
    helpUrl: '',
    tooltip,
    style: 'loop_blocks',
    previousStatement: true,
    nextStatement: true,
    inputsInline: true,
    message0,
    args0: [
      {
        type: 'input_value',
        name: 'NUM',
        check: 'Number',
      },
    ],
    generator: {
      javascript(block, generator) {
        const num = generator.valueToCode(block, 'NUM', Order.NONE) || '0';
        const loopVar =
          generator.nameDB_?.getDistinctName(
            'count',
            Blockly.Names.NameType.VARIABLE,
          ) || 'count';
        return (
          `for (var ${loopVar} = 0; ${loopVar} < ${num}; ${loopVar}++) {\n` +
          `  Maze.${func}('block_id_${block.id}');\n}\n`
        );
      },
      simple(block, generator) {
        const num = generator.valueToCode(block, 'NUM', Order.NONE) || '0';
        const loopVar =
          generator.nameDB_?.getDistinctName(
            'count',
            Blockly.Names.NameType.VARIABLE,
          ) || 'count';
        return (
          `for (var ${loopVar} = 0; ${loopVar} < ${num}; ${loopVar}++) {\n` +
          `  ${func}();\n}\n`
        );
      },
    },
  };
}

/**
 * A block that compares a nectar/honey count against a number, then either
 * runs a body (`if`), branches (`ifelse`), or loops (`while`).
 */
function comparisonBlock(
  type: string,
  kind: 'if' | 'ifelse' | 'while',
  arg1Options: [string, string][],
  tooltip: string,
): BlockDefinition {
  const leadWord = kind === 'while' ? 'while' : 'if';

  const def: BlockDefinition = {
    type,
    style: kind === 'while' ? 'loop_blocks' : 'logic_blocks',
    helpUrl: '',
    tooltip,
    previousStatement: true,
    nextStatement: true,
    inputsInline: true,
    message0: `${leadWord} %1 %2 %3`,
    args0: [
      {
        type: 'field_dropdown',
        name: 'ARG1',
        options: arg1Options,
      },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['=', '=='],
          ['<', '<'],
          ['>', '>'],
        ],
      },
      {
        type: 'field_number',
        name: 'ARG2',
        value: 0,
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
        return comparisonCode(
          kind,
          `Maze.${block.getFieldValue('ARG1')}('block_id_${block.id}')`,
          block.getFieldValue('OP'),
          block.getFieldValue('ARG2'),
          generator.statementToCode(block, 'DO'),
          kind === 'ifelse' ? generator.statementToCode(block, 'ELSE') : '',
        );
      },
      simple(block, generator) {
        return comparisonCode(
          kind,
          `${block.getFieldValue('ARG1')}()`,
          block.getFieldValue('OP'),
          block.getFieldValue('ARG2'),
          generator.statementToCode(block, 'DO'),
          kind === 'ifelse' ? generator.statementToCode(block, 'ELSE') : '',
        );
      },
    },
  };

  if (kind === 'ifelse') {
    def.message2 = 'else %1';
    def.args2 = [
      {
        type: 'input_statement',
        name: 'ELSE',
      },
    ];
  }

  return def;
}

function comparisonCode(
  kind: 'if' | 'ifelse' | 'while',
  argument1: string,
  operator: string,
  argument2: string,
  branch0: string,
  branch1: string,
): string {
  const keyword = kind === 'while' ? 'while' : 'if';
  const code = `${keyword} (${argument1} ${operator} ${argument2}) {\n${branch0}}`;
  return kind === 'ifelse' ? `${code} else {\n${branch1}}\n` : `${code}\n`;
}

export default beeBlocks;
