import * as Blockly from 'blockly/core';
import {JavascriptGenerator, Order} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';

import type {Skin} from './skins';

type Direction =
  | 'up'
  | 'left'
  | 'right'
  | 'down'
  | 'upLeft'
  | 'upRight'
  | 'downLeft'
  | 'downRight';

/**
 * Describes the cardinal direction letters for a given direction.
 */
const cardinals: {
  [key in Direction]: {
    letter: string;
    full: string;
    type: string;
    apiFunction: string;
  };
} = {
  left: {
    letter: 'W',
    full: 'west',
    type: 'left',
    apiFunction: 'Left',
  },
  up: {
    letter: 'N',
    full: 'north',
    type: 'up',
    apiFunction: 'Up',
  },
  down: {
    letter: 'S',
    full: 'south',
    type: 'down',
    apiFunction: 'Down',
  },
  right: {
    letter: 'E',
    full: 'east',
    type: 'right',
    apiFunction: 'Right',
  },
  upLeft: {
    letter: 'NW',
    full: 'northwest',
    type: 'up_left',
    apiFunction: 'UpLeft',
  },
  upRight: {
    letter: 'NE',
    full: 'northeast',
    type: 'up_right',
    apiFunction: 'UpRight',
  },
  downLeft: {
    letter: 'SW',
    full: 'southwest',
    type: 'down_left',
    apiFunction: 'DownLeft',
  },
  downRight: {
    letter: 'SE',
    full: 'southeast',
    type: 'down_right',
    apiFunction: 'DownRight',
  },
};

/**
 * Generates a move or jump block specifically for a particular direction.
 *
 * This generates:
 * * simple_move_left
 * * simple_move_left_length
 * * simple_move_up
 * * simple_move_up_length
 * * simple_move_right
 * * simple_move_right_length
 * * simple_move_down
 * * simple_move_down_length
 * * simple_move_up_left
 * * simple_move_up_left_length
 * * simple_move_up_right
 * * simple_move_up_right_length
 * * simple_move_down_left
 * * simple_move_down_left_length
 * * simple_move_down_light
 * * simple_move_down_light_length
 */
const generateSimpleBlocksForDirection = (
  skin: Skin,
  type: 'move' | 'jump',
  direction: Direction,
  hasLengthInput: boolean,
) =>
  ({
    type: `simple_${type}_${cardinals[direction].type}`,
    tooltip:
      type === 'move'
        ? `Moves the artist ${cardinals[direction].full}.`
        : `Moves the artist ${cardinals[direction].full} without leaving any marks.`,
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: `${type === 'jump' ? 'jump ' : ''}${cardinals[direction].letter}${hasLengthInput ? ' %1' : ''}`,
    args0: hasLengthInput
      ? [
          {
            type: 'field_dropdown',
            name: 'LENGTH',
            options: [
              [
                {src: skin.longLineDraw, alt: 'long distance'},
                'LONG_MOVE_LENGTH',
              ],
              [
                {src: skin.shortLineDraw, alt: 'short distance'},
                'SHORT_MOVE_LENGTH',
              ],
            ],
          },
        ]
      : [],
    generator: {
      javascript(block: Blockly.Block) {
        const dir = `${type}${cardinals[direction].apiFunction}`;
        const distance =
          hasLengthInput && block.getFieldValue('LENGTH') === 'LONG_MOVE_LENGTH'
            ? 100
            : 50;
        return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
      },
    },
  }) as BlockDefinition;

const generateSimpleBlocksForAllDirections: (
  skin: Skin,
) => BlockDefinition[] = (skin: Skin) => {
  return (['move', 'jump'] as ('move' | 'jump')[])
    .map(type =>
      (['up', 'down', 'left', 'right'] as Direction[]).map(direction =>
        generateSimpleBlocksForDirection(skin, type, direction, false),
      ),
    )
    .flat();
};

const blocks: (skin: Skin) => BlockDefinition[] = (skin: Skin) => [
  {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: {
      javascript() {return '\n';},
    },
    nextStatement: true,
  },
  {
    type: 'draw_move',
    helpUrl: '',
    tooltip: 'Moves the artist forward or backward by the specified amount.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'move %1 by %2 pixels',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['forward', 'moveForward'],
          ['backward', 'moveBackward'],
        ],
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Number',
      },
    ],
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        const distance =
          javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
        return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'draw_pen',
    helpUrl: '',
    tooltip: 'Lifts or lowers the pencil, to start or stop drawing.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'pencil %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'PEN',
        options: [
          ['up', 'penUp'],
          ['down', 'penDown'],
        ],
      },
    ],
    generator: {
      javascript(block: Blockly.Block) {
        // Generate JavaScript for moving forward/backward
        const pen = block.getFieldValue('PEN');
        return `Artist.${pen}('block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'alpha',
    helpUrl: '',
    tooltip: '',
    style: 'logic_blocks',
    nextStatement: true,
    previousStatement: true,
    message0: 'set alpha %1',
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Number',
      },
    ],
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        // Generate JavaScript for moving forward/backward
        const value =
          javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
        return `Artist.globalAlpha(${value}, 'block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'jump',
    helpUrl: '',
    tooltip: 'Moves the artist without leaving any marks.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'jump %1 by %2 pixels',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['forward', 'jumpForward'],
          ['backward', 'jumpBackward'],
        ],
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Number',
      },
    ],
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        // Generate JavaScript for jumping forward/backward
        const dir = block.getFieldValue('DIR');
        const distance =
          javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
        return `Artist.${dir}(${distance || '0'}, 'block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'jump_to_xy',
    helpUrl: '',
    tooltip: 'Moves the artist without leaving any marks.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'jump to %1 over %2 down',
    args0: [
      {
        type: 'field_input',
        name: 'XPOS',
        check: 'Number',
        value: 0,
      },
      {
        type: 'field_input',
        name: 'YPOS',
        check: 'Number',
        value: 0,
      },
    ],
    generator: {
      javascript(block: Blockly.Block) {
        const xParam = block.getFieldValue('XPOS');
        const yParam = block.getFieldValue('YPOS');
        return `Artist.jumpToXY(${xParam}, ${yParam}, 'block_id_${block.id}');\n`;
      },
    },
  },
  ...['draw_move_by_constant', 'draw_move_by_constant_dropdown'].map(
    type =>
      ({
        type: type,
        helpUrl: '',
        tooltip:
          'Moves the artist forward or backward by the specified amount.',
        style: 'default',
        nextStatement: true,
        previousStatement: true,
        message0: 'move %1 by %2 pixels',
        args0: [
          {
            type: 'field_dropdown',
            name: 'DIR',
            options: [
              ['forward', 'moveForward'],
              ['backward', 'moveBackward'],
            ],
          },
          {
            type: 'field_input',
            name: 'VALUE',
            check: 'Number',
            value: 100,
          },
        ],
        generator: {
          javascript(block: Blockly.Block) {
            // Generate JavaScript for moving forward/backward
            const dir = block.getFieldValue('DIR');
            const distance = block.getFieldValue('VALUE');
            return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
          },
        },
      }) as BlockDefinition,
  ),
  {
    type: 'draw_turn_by_constant',
    helpUrl: '',
    tooltip:
      'Turns the artist left or right by the specified number of degrees.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'turn %1 by %2 degrees',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['left', 'turnLeft'],
          ['right', 'turnRight'],
        ],
      },
      {
        type: 'field_input',
        name: 'VALUE',
        check: 'Number',
        value: 90,
      },
    ],
    generator: {
      javascript(block: Blockly.Block) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        const angle = block.getFieldValue('VALUE');
        return `Artist.${dir}(${angle}, 'block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'draw_turn_by_constant_dropdown',
    helpUrl: '',
    tooltip:
      'Turns the artist left or right by the specified number of degrees.',
    style: 'default',
    nextStatement: true,
    previousStatement: true,
    message0: 'turn %1 by %2 degrees',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIR',
        options: [
          ['left', 'turnLeft'],
          ['right', 'turnRight'],
        ],
      },
      {
        type: 'field_input',
        name: 'VALUE',
        check: 'Number',
        value: 90,
      },
    ],
    generator: {
      javascript(block: Blockly.Block) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        const angle = block.getFieldValue('VALUE');
        return `Artist.${dir}(${angle}, 'block_id_${block.id}');\n`;
      },
    },
  },
  ...['jump_by_constant', 'jump_by_constant_dropdown'].map(
    type =>
      ({
        type: type,
        helpUrl: '',
        tooltip: 'Moves the artist without leaving any marks.',
        style: 'default',
        nextStatement: true,
        previousStatement: true,
        message0: 'jump %1 by %2 pixels',
        args0: [
          {
            type: 'field_dropdown',
            name: 'DIR',
            options: [
              ['forward', 'jumpForward'],
              ['backward', 'jumpBackward'],
            ],
          },
          {
            type: 'field_input',
            name: 'VALUE',
            check: 'Number',
            value: 100,
          },
        ],
        generator: {
          javascript(block: Blockly.Block) {
            // Generate JavaScript for moving forward/backward
            const dir = block.getFieldValue('DIR');
            const distance = block.getFieldValue('VALUE');
            return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
          },
        },
      }) as BlockDefinition,
  ),
  {
    type: 'draw_colour',
    helpUrl: '',
    tooltip: 'Changes the color of the pencil.',
    style: 'logic_blocks',
    nextStatement: true,
    previousStatement: true,
    message0: 'set color %1',
    args0: [
      {
        type: 'input_value',
        name: 'COLOUR',
        check: 'Colour',
      },
    ],
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        // Generate JavaScript for setting color
        const colour =
          javascriptGenerator.valueToCode(block, 'COLOUR', Order.NONE) ||
          "'#000'";
        return `Artist.penColour(${colour}, 'block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'math_number_dropdown',
    style: 'math_blocks',
    helpUrl: En.MATH_NUMBER_HELPURL,
    tooltip: En.MATH_NUMBER_TOOLTIP,
    output: 'Number',
    message0: '%1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'NUM',
        options: [
          ['100', '100'],
          ['90', '90'],
          ['80', '80'],
          ['70', '70'],
          ['60', '60'],
          ['50', '50'],
          ['40', '40'],
          ['30', '30'],
          ['20', '20'],
          ['10', '10'],
          ['0', '0'],
        ],
      },
    ],
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        return javascriptGenerator.forBlock.math_number(block, javascriptGenerator);
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
        options: [
          ['2', '2'],
          ['3', '3'],
          ['4', '4'],
          ['5', '5'],
          ['6', '6'],
          ['7', '7'],
          ['8', '8'],
          ['9', '9'],
          ['10', '10'],
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
    nextStatement: true,
    previousStatement: true,
    generator: {
      javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
        return javascriptGenerator.forBlock.controls_repeat(block, javascriptGenerator);
      },
    },
  },
  ...['draw_width', 'draw_width_inline'].map(
    type =>
      ({
        type,
        helpUrl: '',
        tooltip: 'Changes the width of the pencil.',
        style: 'default',
        nextStatement: true,
        previousStatement: true,
        message0: 'set width %1',
        args0: [
          type === 'draw_width_inline'
            ? {
                type: 'field_input',
                name: 'WIDTH',
                check: 'Number',
                value: 1,
              }
            : {
                type: 'input_value',
                name: 'WIDTH',
                check: 'Number',
              },
        ],
        generator: {
          javascript(block: Blockly.Block, javascriptGenerator: JavascriptGenerator) {
            // Generate JavaScript for setting pen width
            const width =
              type === 'draw_width_inline'
                ? block.getFieldValue('WIDTH')
                : javascriptGenerator.valueToCode(block, 'WIDTH', Order.NONE) ||
                  '1';
            return `Artist.penWidth(${width}, 'block_id_${block.id}');\n`;
          },
        },
      }) as BlockDefinition,
  ),
  ...generateSimpleBlocksForAllDirections(skin),
];

export default blocks;
