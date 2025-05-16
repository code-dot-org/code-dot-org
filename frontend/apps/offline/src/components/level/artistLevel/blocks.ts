import * as Blockly from 'blockly/core';

import type {BlockDefinition} from '@/components/blockly/types';

const blocks: BlockDefinition[] = [
  {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: () => '\n',
    nextStatement: true,
  },
  {
    type: 'draw_move_by_constant',
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
        type: 'field_input',
        name: 'VALUE',
        check: 'Number',
        value: 100,
      },
    ],
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      const distance = block.getFieldValue('VALUE');
      return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
    },
  },
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
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      const angle = block.getFieldValue('VALUE');
      return `Artist.${dir}(${angle}, 'block_id_${block.id}');\n`;
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
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      const angle = block.getFieldValue('VALUE');
      return `Artist.${dir}(${angle}, 'block_id_${block.id}');\n`;
    },
  },
  {
    type: 'jump_by_constant',
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
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      const distance = block.getFieldValue('VALUE');
      return `Artist.${dir}(${distance}, 'block_id_${block.id}');\n`;
    },
  },
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
        type: 'field_colour',
        name: 'COLOUR',
        check: 'Colour',
      },
    ],
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const colour = block.getFieldValue('COLOUR');
      return `Artist.penColour(${colour}, 'block_id_${block.id}');\n`;
    },
  },
];

export default blocks;
