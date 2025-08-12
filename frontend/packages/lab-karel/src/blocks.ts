import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';

import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import type {Skin} from '@code-dot-org/lab-maze';

/**
 * Blocks used for 'farmer' levels.
 */
const farmerBlocks: (skin: Skin) => BlockDefinition[] = (_skin: Skin) => [
  {
    type: 'maze_dig',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PickUp',
    tooltip: 'remove 1 unit of dirt',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'remove 1',
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.dig('block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'maze_fill',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PutDown',
    tooltip: 'place 1 unit of dirt',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'fill 1',
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.fill('block_id_${block.id}');\n`;
      },
    },
  },
];

/**
 * Blocks used for 'bee' levels.
 */
const beeBlocks: (skin: Skin) => BlockDefinition[] = (_skin: Skin) => [
  {
    type: 'maze_nectar',
    helpUrl: '',
    tooltip: 'Get nectar from a flower',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'get nectar',
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.getNectar('block_id_${block.id}');\n`;
      },
    },
  },
  {
    type: 'maze_honey',
    helpUrl: '',
    tooltip: 'Make honey from nectar',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'make honey',
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.makeHoney('block_id_${block.id}');\n`;
      },
    },
  },
];

const blocks: (skin: Skin) => BlockDefinition[] = (skin: Skin) => [
  {
    // Simply collect
    type: 'collector_collect',
    helpUrl: '',
    tooltip: 'Collect an item',
    style: 'default',
    message0: 'collect',
    previousStatement: true,
    nextStatement: true,
    generator: {
      javascript(block: Blockly.Block) {
        return `Maze.collect('block_id_${block.id}');\n`;
      },
    },
  },
  ...(skin.id === 'bee' ? beeBlocks(skin) : []),
  ...(skin.id === 'farmer' ? farmerBlocks(skin) : []),
];

export default blocks;
