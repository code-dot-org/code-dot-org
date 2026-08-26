import type {BlockDefinition} from '@code-dot-org/blockly';

/**
 * Collector-specific blocks: collect a collectible, and predicates/loops
 * over whether one is present (reusing Maze.pilePresent, same as Farmer's
 * dirt-pile check).
 *
 * Ported from apps/src/maze/collectorBlocks.js.
 */
const collectorBlocks: BlockDefinition[] = [
  {
    // Collect the collectible at the current tile.
    type: 'collector_collect',
    helpUrl: '',
    tooltip: 'Collect an item',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'collect',
    generator: {
      javascript(block) {
        return `Maze.collect('block_id_${block.id}');\n`;
      },
      simple() {
        return `collect();\n`;
      },
    },
  },
  {
    // A K1-style "get" block, for when a K1 block is wanted in a non-K1
    // level.
    type: 'collector_collect_simplified',
    helpUrl: '',
    tooltip: 'Collect an item',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'get',
    generator: {
      javascript(block) {
        return `Maze.collect('block_id_${block.id}');\n`;
      },
      simple() {
        return `collect();\n`;
      },
    },
  },
  {
    // If there is a collectible on the current tile, then do some actions.
    type: 'collector_ifCollectible',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If there is some treasure here, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if there is some treasure',
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.pilePresent('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (pilePresent()) {\n${branch}}\n`;
      },
    },
  },
  {
    // While there is a collectible on the current tile, do some actions.
    type: 'collector_whileCollectible',
    style: 'loop_blocks',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    tooltip: 'While there is some treasure here, do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'while there is some treasure',
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.pilePresent('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `while (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `while (pilePresent()) {\n${branch}}\n`;
      },
    },
  },
];

export default collectorBlocks;
