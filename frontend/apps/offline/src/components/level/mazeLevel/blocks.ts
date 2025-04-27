import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

const blocks = [
  {
    type: 'when_run',
    title: 'when run',
    style: 'setup_blocks',
    helpUrl: '',
    shouldBeGrayedOut: () => false,
    generator: () => '\n',
    nextStatement: true,
  },
  {
    type: 'maze_moveForward',
    title: 'move forward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward one space.',
    functionName: 'Maze.moveForward',
    previousStatement: true,
    nextStatement: true,
  },
  {
    // Block for moving forward / backward
    type: 'maze_move',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward/backward one space',
    previousStatement: true,
    nextStatement: true,
    init: function (Blockly) {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['move forward', 'moveForward'],
          ['move backward', 'moveBackward'],
        ]),
        'DIR',
      );
    },
    generator: function () {
      // Generate JavaScript for moving forward/backward
      const dir = this.getFieldValue('DIR');
      return 'Maze.' + dir + "('block_id_" + this.id + "');\n";
    },
  },
  {
    type: 'maze_turn',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    tooltip: 'Turns me left or right by 90 degrees.',
    previousStatement: true,
    nextStatement: true,
    init: function (Blockly) {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['turn left \u21BA', 'turnLeft'],
          ['turn right \u21BB', 'turnRight'],
        ]),
        'DIR',
      );
    },
    generator: function () {
      const dir = this.getFieldValue('DIR');
      return `Maze.${dir}('block_id_${this.id}');\n`;
    },
  },
  {
    type: 'controls_repeat_dropdown',
    style: 'loop_blocks',
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
    tooltip: '',
    generator: javascriptGenerator.forBlock.controls_repeat,
  },
];

export default blocks;
