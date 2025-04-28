const blocks = [
  {
    // Block for moving forward/backward
    type: 'studio_moveOrientation',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Move an actor.',
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
      return 'Studio.' + dir + "('block_id_" + this.id + "');\n";
    },
  },
  {
    // Block for turning left or right.
    type: 'studio_turnOrientation',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    previousStatement: true,
    nextStatement: true,
    tooltip: 'Turn an actor left or right by 90 degrees.',
    init: function (Blockly) {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['turn left' + ' \u21BA', 'turnLeft'],
          ['turn right' + ' \u21BA', 'turnRight'],
        ]),
        'DIR',
      );
    },
    generator: function () {
      // Generate JavaScript for turning left or right.
      const dir = this.getFieldValue('DIR');
      return 'Studio.' + dir + "('block_id_" + this.id + "');\n";
    },
  },
];

export default blocks;
