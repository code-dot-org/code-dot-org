/**
 * Blocks common to 'Studio' levels.
 */

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
    // Block for moving forward/backward
    type: 'studio_moveOrientation',
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
  },
  {
    // Block for turning left or right.
    type: 'studio_turnOrientation',
    style: 'default',
    tooltip: 'Turn an actor left or right by 90 degrees.',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
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
  },
];

export default blocks;
