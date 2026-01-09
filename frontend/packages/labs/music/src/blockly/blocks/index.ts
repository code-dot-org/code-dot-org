import type {BlockDefinition} from '@code-dot-org/blockly-workspace';
import {BaseBlocks} from '@code-dot-org/blockly-workspace';

const blocks: BlockDefinition[] = [
  BaseBlocks.when_run as BlockDefinition,
  BaseBlocks.comment as BlockDefinition,
];

export default blocks;
