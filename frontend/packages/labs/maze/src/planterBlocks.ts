import type {BlockDefinition} from '@code-dot-org/blockly';

/**
 * Planter-specific blocks: plant a sprout, and predicates for soil/sprout
 * tiles.
 *
 * Ported from apps/src/maze/planterBlocks.js.
 */
const planterBlocks: BlockDefinition[] = [
  {
    // Plant a sprout at the current tile.
    type: 'planter_plant',
    helpUrl: '',
    tooltip: 'Plant a sprout',
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: 'plant',
    generator: {
      javascript(block) {
        return `Maze.plant('block_id_${block.id}');\n`;
      },
      simple() {
        return `plant();\n`;
      },
    },
  },
  {
    // If the current tile is soil, then do some actions.
    type: 'planter_ifAtSoil',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If we are at soil, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if at soil',
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.atSoil('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (atSoil()) {\n${branch}}\n`;
      },
    },
  },
  {
    // If the current tile is a sprout, then do some actions.
    type: 'planter_ifAtSprout',
    style: 'logic_blocks',
    helpUrl: '',
    tooltip: 'If we are at a sprout, then do some actions.',
    previousStatement: true,
    nextStatement: true,
    message0: 'if at sprout',
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.atSprout('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        return `if (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (atSprout()) {\n${branch}}\n`;
      },
    },
  },
];

export default planterBlocks;
