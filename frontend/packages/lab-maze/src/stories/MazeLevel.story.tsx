import {Meta, StoryFn} from '@storybook/react';
import * as Blockly from 'blockly/core';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import Thrasos from '@code-dot-org/blockly-workspace/renderers/thrasos';
import MazeLevel, {MazeLevelProps} from '@code-dot-org/lab-maze';
import type {LevelData} from '@code-dot-org/lab-blockly';
import type {MazeData} from '@code-dot-org/lab-maze';

export default {
  title: 'Labs/Maze',
  component: MazeLevel,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const Template: StoryFn<MazeLevelProps> = args => (
  <div style={{width: '100vw', height: '100vh'}}>
    <MazeLevel
      {...args}
    />
  </div>
);

const defaultLevelData: LevelData<MazeData> = {
  key: 'default-level',
  type: 'Maze',
  longInstructions: 'These are the instructions for this level in **Markdown**',
  shortInstructions: 'These are shorter instructions',
  blocklyData: {
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
  },
  subData: {
    skinId: 'birds',
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0],
      [0, 0, 0, 2, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    startDirection: 1,
  },
};

const defaultBlocks: BlockDefinition[] = [
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
    // Simply moves forward
    type: 'maze_moveForward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    tooltip: 'Move me forward one space.',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'move forward',
    generator: (block: Blockly.Block) => {
      return `Maze.moveForward('block_id_${block.id}');\n`;
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
    generator: (block: Blockly.Block) => {
      // Generate JavaScript for moving forward/backward
      const dir = block.getFieldValue('DIR');
      return 'Maze.' + dir + "('block_id_" + block.id + "');\n";
    },
  },
];

export const MazeBase = Template.bind({});
MazeBase.args = {
  levelData: defaultLevelData,
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};

export const MazeMarkdownInstructions = Template.bind({});
MazeMarkdownInstructions.args = {
  levelData: {
    ...defaultLevelData,
    longInstructions: 'Hello <xml><block type="maze_moveForward"/></xml> world.',
  },
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};
