import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

const blocks = [
  {
    type: 'when_run',
    title: 'when run',
    style: 'setup_blocks',
    helpUrl: '',
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
    generator: javascriptGenerator.forBlock.controls_repeat,
  },
  {
    // Do forever loop.
    type: 'maze_forever',
    style: 'loop_blocks',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    tooltip: 'Repeat the enclosed actions until finish point is reached.',
    previousStatement: true,
    init: function (Blockly, {skin}) {
      this.appendDummyInput()
        .appendField('repeat until')
        .appendField(new Blockly.FieldImage(skin?.maze_forever, 35, 35));
      this.appendStatementInput('DO').appendField('do');
    },
    generator: function () {
      // Generate JavaScript for do forever loop.
      let branch = javascriptGenerator.statementToCode(this, 'DO');
      branch =
        Blockly.getInfiniteLoopTrap() +
        Blockly.loopHighlight('Maze', this.id) +
        branch;
      return 'while (Maze.notFinished()) {\n' + branch + '}\n';
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
    generator: function () {
      // Generate JavaScript for 'if' conditional if there is a path.
      const argument =
        'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
      const branch = generator.statementToCode(this, 'DO');
      const code = 'if (' + argument + ') {\n' + branch + '}\n';
      return code;
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
    generator: function () {
      // Generate JavaScript for 'if/else' conditional if there is a path.
      const argument =
        'Maze.' + this.getFieldValue('DIR') + "('block_id_" + this.id + "')";
      const branch0 = generator.statementToCode(this, 'DO');
      const branch1 = generator.statementToCode(this, 'ELSE');
      const code =
        'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
      return code;
    },
  },
];

export default blocks;
