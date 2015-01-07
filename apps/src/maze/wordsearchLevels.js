var Direction = require('./tiles').Direction;
var reqBlocks = require('./requiredBlocks');
var blockUtils = require('../block_utils');

var wordSearchToolbox = function () {
  return blockUtils.createToolbox(
    blockUtils.blockOfType('maze_moveNorth') +
    blockUtils.blockOfType('maze_moveSouth') +
    blockUtils.blockOfType('maze_moveEast') +
    blockUtils.blockOfType('maze_moveWest')
  );
};

/*
 * Configuration for all levels.
 */
module.exports = {
  'k_1': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
    ],
    'startDirection': Direction.EAST,
    'searchWord': 'EAST',
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, 'E', 'A', 'S', 'T', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveEast')
  },
  'k_2': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveSouth],
    ],
    'searchWord': 'SOUTH',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_',   2, '_', '_', '_', '_'],
      ['_', '_', '_', 'S', '_', '_', '_', '_'],
      ['_', '_', '_', 'O', '_', '_', '_', '_'],
      ['_', '_', '_', 'U', '_', '_', '_', '_'],
      ['_', '_', '_', 'T', '_', '_', '_', '_'],
      ['_', '_', '_', 'H', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveSouth')
  },
  'k_3': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveWest]
    ],
    'searchWord': 'WEST',
    'startDirection': Direction.WEST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',  'T', 'S', 'E', 'W', 2, '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveWest')
  },
  'k_4': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'NORTH',
    'startDirection': Direction.NORTH,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', 'H', '_', '_', '_', '_', '_'],
      ['_', '_', 'T', '_', '_', '_', '_', '_'],
      ['_', '_', 'R', '_', '_', '_', '_', '_'],
      ['_', '_', 'O', '_', '_', '_', '_', '_'],
      ['_', '_', 'N', '_', '_', '_', '_', '_'],
      ['_', '_', 2, '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_6': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'JUMP',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, 'J', 'U', 'M', '_', '_'],
      ['_', '_', '_', '_', '_', 'P', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_9': {
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'CODE',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', 'D', 'E', '_', '_', '_'],
      ['_',   2, 'C', 'O', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_13': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'DEBUG',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_',   2, 'D', 'E', '_', '_', '_', '_'],
      ['_', '_', '_', 'B', '_', '_', '_', '_'],
      ['_', '_', '_', 'U', 'G', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_15': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveSouth],
      [reqBlocks.moveEast]
    ],
    'searchWord': 'ABOVE',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, '_', '_', '_', '_', '_'],
      ['_', '_', 'A', '_', '_', '_', '_', '_'],
      ['_', '_', 'B', 'O', '_', '_', '_', '_'],
      ['_', '_', '_', 'V', 'E', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_16': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'BELOW',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', 'W', '_', '_', '_'],
      ['_', '_', '_', '_', 'O', '_', '_', '_'],
      ['_', '_', '_', 'E', 'L', '_', '_', '_'],
      ['_', '_',   2, 'B', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_20': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'STORY',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, 'S', 'T', '_', '_', '_'],
      ['_', '_', '_', '_', 'O', '_', '_', '_'],
      ['_', '_', '_', '_', 'R', '_', '_', '_'],
      ['_', '_', '_', '_', 'Y', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  }

};
