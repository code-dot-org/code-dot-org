import * as Blockly from 'blockly/core';

const blocks = [
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
];

export default blocks;
