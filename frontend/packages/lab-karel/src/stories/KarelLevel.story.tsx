import {Meta, StoryFn} from '@storybook/react';
import * as Blockly from 'blockly/core';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import Thrasos from '@code-dot-org/blockly-workspace/renderers/thrasos';
import KarelLevel, {KarelLevelProps} from '@code-dot-org/lab-karel';
import type {MazeData} from '@code-dot-org/lab-maze';
import type {LevelData} from '@code-dot-org/models/levels';

export default {
  title: 'Labs/Karel',
  component: KarelLevel,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const Template: StoryFn<KarelLevelProps> = args => (
  <div style={{width: '100vw', height: '100vh'}}>
    <KarelLevel
      {...args}
    />
  </div>
);

const collectorLevelData: LevelData<MazeData> = {
  key: 'default-level',
  type: 'Karel',
  longInstructions: 'These are the instructions for this level in **Markdown**',
  shortInstructions: 'These are shorter instructions',
  subData: {
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            next: {
              block: {
                type: 'maze_moveForward',
              },
            },
          },
          {
            type: 'maze_move',
            y: 100,
          },
        ],
      },
    },
    skinId: 'collector',
    startDirection: 1,
    serializedMaze: [
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":2},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1,"value":1,"range":1},{"tileType":1},{"tileType":1,"value":1,"range":1},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}]
    ],
  },
};

const beeLevelData: LevelData<MazeData> = {
  key: 'bee-level',
  type: 'Karel',
  longInstructions: 'These are the instructions for this level in **Markdown**',
  shortInstructions: 'These are shorter instructions',
  subData: {
    startBlocks: {
      blocks: {
        blocks: [
          {
            type: 'when_run',
            next: {
              block: {
                type: 'maze_moveForward',
              },
            },
          },
          {
            type: 'maze_move',
            y: 100,
          },
        ],
      },
    },
    skinId: 'bee',
    startDirection: 3,
    flowerType: 'redWithNectar',
    serializedMaze: [
      [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":1,"value":3,"range":3,"featureType":0},{"tileType":1,"value":3,"range":3,"featureType":1},{"tileType":1},{"tileType":1},{"tileType":2},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":1,"value":3,"range":3,"featureType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":1,"value":3,"range":3,"featureType":0},{"tileType":1},{"tileType":1},{"tileType":1,"value":3,"range":3,"featureType":1},{"tileType":1,"value":3,"range":3,"featureType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}]
    ]
  },
};

const defaultBlocks: BlockDefinition[] = [
  {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: {
      javascript: () => '\n',
    },
    nextStatement: true,
  },
  {
    // Simply moves forward
    type: 'maze_moveForward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward one space.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'move forward',
    generator: {
      javascript(block: Blockly.Block) {
        return `Karel.moveForward('block_id_${block.id}');\n`;
      },
    },
  },
  {
    // Block for moving forward / backward
    type: 'maze_move',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward/backward one space',
    style: 'default',
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
    generator: {
      javascript(block: Blockly.Block) {
        // Generate JavaScript for moving forward/backward
        const dir = block.getFieldValue('DIR');
        return 'Karel.' + dir + "('block_id_" + block.id + "');\n";
      },
    },
  },
];

export const CollectorBase = Template.bind({});
CollectorBase.args = {
  levelData: collectorLevelData,
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};

export const CollectorMarkdownInstructions = Template.bind({});
CollectorMarkdownInstructions.args = {
  levelData: {
    ...collectorLevelData,
    longInstructions: 'Hello <xml><block type="maze_moveForward"/></xml> world.',
  },
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};

export const BeeBase = Template.bind({});
BeeBase.args = {
  levelData: beeLevelData,
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};

export const BeeMarkdownInstructions = Template.bind({});
BeeMarkdownInstructions.args = {
  levelData: {
    ...beeLevelData,
    longInstructions: 'Hello <xml><block type="maze_moveForward"/></xml> world.',
  },
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};
