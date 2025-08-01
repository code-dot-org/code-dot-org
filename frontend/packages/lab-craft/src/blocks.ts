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
    generator: () => '\n',
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
    generator: () => '\n',
  },
];

export default blocks;
