import type {BlockDefinition} from '@code-dot-org/blockly';

/**
 * Harvester-specific blocks: harvest crop actions, at/has-crop predicates
 * (per-crop and dropdown-selected), and their loop variants.
 *
 * Ported from apps/src/maze/harvesterBlocks.js.
 */
const CROPS = ['corn', 'pumpkin', 'lettuce'];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Matches legacy locale strings ("there is corn", "there are pumpkins"). */
function hasCropPhrase(crop: string): string {
  return crop === 'pumpkin' ? 'there are pumpkins' : `there is ${crop}`;
}

/**
 * A statement block that harvests the given crop (e.g. `harvester_corn`).
 */
function harvestBlock(crop: string): BlockDefinition {
  return {
    type: `harvester_${crop}`,
    helpUrl: '',
    tooltip: `Harvest ${crop === 'pumpkin' ? 'a' : 'some'} ${crop}.`,
    style: 'default',
    previousStatement: true,
    nextStatement: true,
    message0: `pick ${crop}`,
    generator: {
      javascript(block) {
        return `Maze.get${capitalize(crop)}('block_id_${block.id}');\n`;
      },
      simple() {
        return `get${capitalize(crop)}();\n`;
      },
    },
  };
}

/**
 * A block whose body executes conditioned on `Maze.has<Crop>()` (e.g.
 * `harvester_ifHasCorn`, or the dropdown-selectable `harvester_ifHasCrop`).
 */
function hasCropBlock(
  type: string,
  kind: 'if' | 'ifelse' | 'while' | 'until',
  crop?: string,
): BlockDefinition {
  const style =
    kind === 'while' || kind === 'until' ? 'loop_blocks' : 'logic_blocks';
  const leadWord =
    kind === 'while' ? 'while' : kind === 'until' ? 'repeat until' : 'if';

  const argFor = (block: {getFieldValue: (name: string) => string}) =>
    crop ? capitalize(crop) : block.getFieldValue('LOC');

  const def: BlockDefinition = {
    type,
    style,
    helpUrl: '',
    tooltip: 'Check whether the current tile has this crop.',
    previousStatement: true,
    nextStatement: true,
    inputsInline: true,
    message0: crop ? `${leadWord} ${hasCropPhrase(crop)}` : `${leadWord} %1`,
    args0: crop
      ? []
      : [
          {
            type: 'field_dropdown',
            name: 'LOC',
            options: CROPS.map(c => [hasCropPhrase(c), capitalize(c)]),
          },
        ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    generator: {
      javascript(block, generator) {
        const argument = `Maze.has${argFor(block)}('block_id_${block.id}')`;
        const branch = generator.statementToCode(block, 'DO');
        if (kind === 'ifelse') {
          const branch1 = generator.statementToCode(block, 'ELSE');
          return `if (${argument}) {\n${branch}} else {\n${branch1}}\n`;
        }
        if (kind === 'until') {
          return `while (!${argument}) {\n${branch}}\n`;
        }
        const keyword = kind === 'while' ? 'while' : 'if';
        return `${keyword} (${argument}) {\n${branch}}\n`;
      },
      simple(block, generator) {
        const argument = `has${argFor(block)}()`;
        const branch = generator.statementToCode(block, 'DO');
        if (kind === 'ifelse') {
          const branch1 = generator.statementToCode(block, 'ELSE');
          return `if (${argument}) {\n${branch}} else {\n${branch1}}\n`;
        }
        if (kind === 'until') {
          return `while (!${argument}) {\n${branch}}\n`;
        }
        const keyword = kind === 'while' ? 'while' : 'if';
        return `${keyword} (${argument}) {\n${branch}}\n`;
      },
    },
  };

  if (kind === 'ifelse') {
    def.message2 = 'else %1';
    def.args2 = [
      {
        type: 'input_statement',
        name: 'ELSE',
      },
    ];
  }

  return def;
}

const harvesterBlocks: BlockDefinition[] = [
  ...CROPS.flatMap(crop => [
    harvestBlock(crop),
    hasCropBlock(`harvester_ifHas${capitalize(crop)}`, 'if', crop),
    hasCropBlock(`harvester_ifHas${capitalize(crop)}Else`, 'ifelse', crop),
    hasCropBlock(`harvester_whileHas${capitalize(crop)}`, 'while', crop),
    hasCropBlock(`harvester_untilHas${capitalize(crop)}`, 'until', crop),
  ]),
  hasCropBlock('harvester_ifHasCrop', 'if'),
  hasCropBlock('harvester_ifHasCropElse', 'ifelse'),
  hasCropBlock('harvester_whileHasCrop', 'while'),
  hasCropBlock('harvester_untilHasCrop', 'until'),
];

export default harvesterBlocks;
