import {Meta, StoryFn} from '@storybook/react';
import * as Blockly from 'blockly/core';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import Thrasos from '@code-dot-org/blockly-workspace/renderers/thrasos';
import LabArtist, {LabArtistProps} from '@code-dot-org/lab-artist';
import type {ArtistData} from '@code-dot-org/lab-artist';
import type {LevelData} from '@code-dot-org/models/levels';

export default {
  title: 'Labs/Artist',
  component: LabArtist,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

//
// TEMPLATE
//
const Template: StoryFn<LabArtistProps> = args => (
  <div style={{width: '100vw', height: '100vh'}}>
    <LabArtist
      {...args}
    />
  </div>
);

const defaultLevelData: LevelData<ArtistData> = {
  key: 'default-level',
  type: 'Artist',
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
    skinId: 'artist',
    startDirection: 90,
    images: [],
    initialX: 200,
    initialY: 200,
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
        return `Artist.moveForward('block_id_${block.id}');\n`;
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
        return 'Artist.' + dir + "('block_id_" + block.id + "');\n";
      },
    },
  },
];

export const ArtistBase = Template.bind({});
ArtistBase.args = {
  levelData: defaultLevelData,
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};

export const ArtistMarkdownInstructions = Template.bind({});
ArtistMarkdownInstructions.args = {
  levelData: {
    ...defaultLevelData,
    longInstructions: 'Hello <xml><block type="maze_moveForward"/></xml> world.',
  },
  renderer: Thrasos,
  customBlocks: defaultBlocks,
};
