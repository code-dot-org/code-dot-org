// The lab-owned blocks as @code-dot-org/blockly definitions, for a workspace's
// `blocks`. Their fields, extension and mutator travel with them and register
// with the workspace. Apps' setup.ts also installed the legacy Sprite Lab
// blocks and the level's DB block pool; those wait on the engine
// (docs/port-plan.md).

import {
  BaseBlocks,
  type BlockDefinition,
  type BlockDefinitions,
} from '@code-dot-org/blockly';

import labBlockDefinitions from './blockDefinitions';

export const SPRITELAB2_BLOCKS: BlockDefinition[] = labBlockDefinitions.map(
  ({definition, generator}) =>
    ({
      tooltip: '',
      ...definition,
      generator: {javascript: generator},
    }) as BlockDefinition,
);

const LAB_TYPES = new Set(SPRITELAB2_BLOCKS.map(block => block.type));

// Apps' blocksCommon, less when_run (the lab has its own hat) and the blocks
// the lab defines again, which apps installed over blocksCommon's.
export const COMMON_BLOCKS: BlockDefinitions = [
  BaseBlocks.comment,
  BaseBlocks.controls_repeat_simplified,
  BaseBlocks.controls_repeat_simplified_dropdown,
  BaseBlocks.controls_repeat_dropdown,
  BaseBlocks.math_number_dropdown,
  BaseBlocks.pick_one,
  BaseBlocks.category,
  BaseBlocks.custom_category,
  BaseBlocks.text_join_simple,
  BaseBlocks.colour_random,
].filter(block => !LAB_TYPES.has(block.type));
