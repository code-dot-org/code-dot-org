import * as Blockly from 'blockly/core';

const blocks = [
  {
    // Block for moving forward/backward
    type: 'studio_moveOrientation',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Move an actor.',
    init: (block: Blockly.Block) => {
      block.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['move forward', 'moveForward'],
          ['move backward', 'moveBackward'],
        ]),
        'DIR',
      );
    },
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      return 'Studio.' + dir + "('block_id_" + block.id + "');\n";
    },
  },
  {
    // Block for turning left or right.
    type: 'studio_turnOrientation',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Turn an actor left or right by 90 degrees.',
    init: (block: Blockly.Block) => {
      block.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['turn left' + ' \u21BA', 'turnLeft'],
          ['turn right' + ' \u21BA', 'turnRight'],
        ]),
        'DIR',
      );
    },
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for turning left or right.
      const dir = block.getFieldValue('DIR');
      return 'Studio.' + dir + "('block_id_" + block.id + "');\n";
    },
  },
];

export default blocks;
